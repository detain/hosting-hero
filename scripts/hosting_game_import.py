#!/usr/bin/env python3
"""Ingest hosting_game_raw/master idea files into GitHub project draft issues.

Modes (mutually exclusive; default --dry-run):
  --dry-run                 parse + integrity report only; NEVER touches gh.
  --reconcile               read-only remote pass: adopt existing draft issues
                            into the checkpoint, report duplicates. No mutation.
  --prepare-category-field  read project fields; create the `Category`
                            SINGLE_SELECT field (11 options) only if missing;
                            write filename->optionId mapping via
                            --category-options-output. Never creates drafts.
  --execute                 create missing draft issues, then apply pending
                            category field values (phased, checkpointed).

Parsing laws (fixed by spec, do not vary):
  1. An entry starts at a level-3 heading line: "### <title>".
  2. An entry ends before the next "#", "##", or "###" heading; "####" lines
     belong to the entry.
  3. Section = nearest preceding "## " heading in the same file, else "(none)".
  4. Body = exact original text from the "###" line through the line before
     the next boundary heading (or EOF).
  5. Conflicts per entry: crossing-swords emoji (with or without variation
     selector U+FE0F) and case-insensitive literal "*CONFLICTING*".

Stable item key: "<filename>:<start-line>:<normalized-title>". It is embedded
in every draft body as a visible metadata line "Import key: <key>" ABOVE the
"---" separator, so the original idea body below is untouched and reconciliation
is deterministic even with a lost checkpoint.

Transport: all payloads go to `gh api graphql --include --input -` via stdin
JSON, never argv. Pipe I/O is pinned to UTF-8 (strict decode; stdout/stderr use
backslashreplace so exotic source characters can never crash a run). Mutations
are paced (>=1s apart; --draft-create-interval default 8s;
--field-update-interval default 1s) and retried with backoff on transient
transport/5xx/429/rate-limit responses. Draft creation is treated as
NON-IDEMPOTENT: a lost HTTP response or 5xx there aborts instead of retrying
(the draft may already exist); run --reconcile to adopt it, then resume.

Checkpoint (schema v2) is two independent flags per item key:
  {"draft_created": bool, "project_item_id": str|null, "category_updated": bool}
saved atomically (fsync, 0600, temp-file replace) immediately after every
successful remote mutation, so crash/resume never duplicates a draft.

Safety guards (added in hardening):
  * Paginated reads FAIL LOUD. Project reads resolve the board via the generic
    root `node(id:$project)` query with a `... on ProjectV2` inline fragment
    (this endpoint exposes no root `projectV2` query). A missing/null `node`, a
    node whose `__typename` is not "ProjectV2", a null connection, an absent
    non-list `nodes`, or a malformed pageInfo raise GraphQLError instead of
    masquerading as an empty page (an empty page is only trusted when the
    ProjectV2 node exists and the connection carries an explicit `nodes` list).
  * Stale-reset blast radius. --reconcile/--execute reset checkpoint records that
    are missing remotely, but ABORT (no save, no mutation) when zero drafts match
    yet created records exist, or when a single run would reset more than 5% of
    created records — unless --allow-stale-reset is passed explicitly.
  * Remote modes (--execute/--reconcile/--prepare-category-field) hold an
    exclusive non-blocking flock on "<state>.lock" (0600) for the whole run; a
    concurrent invocation fails fast rather than double-writing the checkpoint.
  * --prepare-category-field refuses to guess when >1 Category SINGLE_SELECT
    field exists, treats createProjectV2Field as non-idempotent, and re-reads
    the board to verify exactly one Category field + a valid 11-option mapping
    before writing the output file.

Production run sequence:
  python3 scripts/hosting_game_import.py --dry-run
  python3 scripts/hosting_game_import.py --prepare-category-field \
      --category-options-output /tmp/category-options.json
  python3 scripts/hosting_game_import.py --reconcile \
      --category-field-id FIELD_ID --category-options /tmp/category-options.json
  python3 scripts/hosting_game_import.py --execute \
      --category-field-id FIELD_ID --category-options /tmp/category-options.json \
      --max-draft-creates 500 --log-file /tmp/import.log
  (repeat --execute chunks until "pending drafts: 0", then until
   "pending updates: 0")
"""

from __future__ import annotations

import argparse
import contextlib
import fcntl
import io
import json
import os
import re
import statistics
import subprocess
import sys
import tempfile
import time
import unittest
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Protocol

SOURCE_PREFIX = "hosting_game_raw/master"
DRAFT_BODY_CHAR_LIMIT = 65_536  # conservative; GitHub documents no hard API cap
SNIPPET_MAX_CHARS = 180

CHECKPOINT_SCHEMA_VERSION = 2
CATEGORY_FIELD_NAME = "Category"
CATEGORY_OPTION_COLOR = "GRAY"  # verified in live schema enum ProjectV2SingleSelectFieldOptionColor

DEFAULT_DRAFT_CREATE_INTERVAL = 8.0   # 3,907 drafts ~= 8.7h under 500 content req/h guidance
DEFAULT_FIELD_UPDATE_INTERVAL = 1.0
DEFAULT_MIN_MUTATION_GAP = 1.0        # hard floor between ANY two mutations
DEFAULT_MAX_RETRIES = 5
RECURSION_PAGE_SIZE = 100
STALE_RESET_MAX_PERCENT = 5  # blast-radius cap on automatic stale-record resets per run

CATEGORY_FILES = [
    "00-foundations.md",
    "01-levels-scenarios-and-progression.md",
    "02-hosting-types.md",
    "03-threats.md",
    "04-customers-traffic-and-clients.md",
    "05-buildables-services-and-infrastructure.md",
    "06-unlocks-and-discovery.md",
    "07-economy-money-and-scoring.md",
    "08-core-gameplay-mechanics.md",
    "09-visuals-and-presentation.md",
    "10-anything-else-modes-twists-humor-meta.md",
]

EXPECTED_COUNTS = {
    "00-foundations.md": 31,
    "01-levels-scenarios-and-progression.md": 405,
    "02-hosting-types.md": 102,
    "03-threats.md": 603,
    "04-customers-traffic-and-clients.md": 456,
    "05-buildables-services-and-infrastructure.md": 500,
    "06-unlocks-and-discovery.md": 312,
    "07-economy-money-and-scoring.md": 427,
    "08-core-gameplay-mechanics.md": 328,
    "09-visuals-and-presentation.md": 420,
    "10-anything-else-modes-twists-humor-meta.md": 323,
}

ENTRY_HEADING_RE = re.compile(r"^### (.+)$")
BOUNDARY_HEADING_RE = re.compile(r"^#{1,3} ")  # excludes "####" (4th char is "#")
SECTION_HEADING_RE = re.compile(r"^## (.+)$")
CODE_FENCE_RE = re.compile(r"^(```|~~~)")
SWORD_RE = re.compile("⚔️?")
CONFLICTING_RE = re.compile(r"\*CONFLICTING\*", re.IGNORECASE)
SECRET_RE = re.compile(
    r"ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----"
)

# --- GraphQL documents (response shapes verified against live schema) ------
# Project READS go through the generic root `node(id:$project)` query because
# this GitHub GraphQL endpoint exposes no root `projectV2` query; the payload
# lives under `data.node` behind a `... on ProjectV2` inline fragment.
# Mutations keep their own root fields (schema-verified): createProjectV2Field,
# addProjectV2DraftIssue, updateProjectV2ItemFieldValue.
# addProjectV2DraftIssue payload has `projectItem`, NOT `projectV2Item`.
DRAFT_MUTATION = (
    "mutation($project:ID!,$title:String!,$body:String!){"
    " addProjectV2DraftIssue(input:{projectId:$project,title:$title,body:$body})"
    "{ projectItem{ id } } }"
)
# updateProjectV2ItemFieldValue payload has `projectV2Item`, NOT `projectItem`.
UPDATE_MUTATION = (
    "mutation($project:ID!,$item:ID!,$field:ID!,$option:String!){"
    " updateProjectV2ItemFieldValue(input:{projectId:$project,itemId:$item,"
    "fieldId:$field,value:{singleSelectOptionId:$option}}){ projectV2Item{ id } } }"
)
FIELDS_QUERY = (
    "query($project:ID!,$first:Int!,$after:String){ node(id:$project){"
    " __typename ... on ProjectV2{ fields(first:$first,after:$after){"
    " pageInfo{ hasNextPage endCursor }"
    " nodes{ __typename ... on ProjectV2SingleSelectField{ id name"
    " options{ id name } } } } } } }"
)
CREATE_FIELD_MUTATION = (
    "mutation($project:ID!,$name:String!,$options:[ProjectV2SingleSelectFieldOptionInput!]!){"
    " createProjectV2Field(input:{projectId:$project,name:$name,"
    " dataType:SINGLE_SELECT,singleSelectOptions:$options})"
    "{ projectV2Field{ __typename ... on ProjectV2SingleSelectField{ id name"
    " options{ id name } } } } }"
)
ITEMS_QUERY = (
    "query($project:ID!,$first:Int!,$after:String,$fieldName:String!){"
    " node(id:$project){ __typename ... on ProjectV2{ items(first:$first,after:$after){"
    " pageInfo{ hasNextPage endCursor } nodes{ id type"
    " content{ ... on DraftIssue{ title body } }"
    " fieldValueByName(name:$fieldName){"
    " ... on ProjectV2ItemFieldSingleSelectValue{ optionId name } } } } } } }"
)

IMPORT_KEY_RE = re.compile(r"^Import key: (.+?)\s*$", re.MULTILINE)
BODY_SOURCE_RE = re.compile(r"^Source: \S*/([^\s/]+)\s*$", re.MULTILINE)
BODY_RANGE_RE = re.compile(r"^Entry range: line (\d+)-(\d+)\s*$", re.MULTILINE)
BODY_TITLE_RE = re.compile(r"^Entry: (.+?)\s*$", re.MULTILINE)

RATE_LIMIT_HINTS = (
    "rate limit",
    "secondary rate limit",
    "abuse detection",
    "too many requests",
    "retry later",
)


@dataclass(frozen=True)
class ConflictHit:
    line: int  # 1-based absolute line in the source file
    kind: str  # "sword" | "conflicting"
    snippet: str


@dataclass(frozen=True)
class Entry:
    filename: str
    start: int  # 1-based line of the "###" heading
    end: int  # 1-based last line owned by the entry (inclusive)
    title: str
    section: str  # "(none)" when no preceding "##"
    body: str  # exact original entry text
    conflicts: tuple[ConflictHit, ...] = field(default_factory=tuple)

    @property
    def item_key(self) -> str:
        return f"{self.filename}:{self.start}:{normalize_title(self.title)}"

    @property
    def draft_body(self) -> str:
        return compose_draft_body(self)


def normalize_title(title: str) -> str:
    return re.sub(r"\s+", " ", title).strip().lower()


def scan_conflicts(lines: list[str], start_index: int) -> tuple[ConflictHit, ...]:
    """Collect deduplicated (line, kind) conflict hits over the entry's lines."""
    hits: dict[tuple[int, str], ConflictHit] = {}
    for offset, line in enumerate(lines):
        lineno = start_index + offset + 1
        found = [(match.start(), "sword") for match in SWORD_RE.finditer(line)]
        found += [(match.start(), "conflicting") for match in CONFLICTING_RE.finditer(line)]
        for _, kind in found:
            if (lineno, kind) in hits:
                continue
            snippet = re.sub(r"\s+", " ", line).strip()
            if len(snippet) > SNIPPET_MAX_CHARS:
                snippet = snippet[: SNIPPET_MAX_CHARS - 1] + "…"
            hits[(lineno, kind)] = ConflictHit(lineno, kind, snippet)
    return tuple(hits[key] for key in sorted(hits))


def parse_file(filename: str, text: str) -> list[Entry]:
    """Deterministic fence-aware parse of one category file into entries."""
    lines = text.splitlines()
    in_fence_at = [False] * len(lines)
    heading_at: list[int | None] = [None] * len(lines)  # depth 1-3 when boundary heading
    section_at: list[int | None] = [None] * len(lines)  # depth-2 heading line index
    in_fence = False
    for index, line in enumerate(lines):
        if CODE_FENCE_RE.match(line):
            in_fence_at[index] = in_fence
            in_fence = not in_fence
            continue
        in_fence_at[index] = in_fence
        if in_fence or not BOUNDARY_HEADING_RE.match(line):
            continue
        heading_at[index] = line.index(" ")
        if heading_at[index] == 2:
            section_at[index] = index

    if in_fence:
        raise ValueError(f"{filename}: unbalanced code fence at EOF")

    entries: list[Entry] = []
    current_section = "(none)"
    for index, line in enumerate(lines):
        if in_fence_at[index]:
            continue
        section_match = SECTION_HEADING_RE.match(line) if section_at[index] is not None else None
        if section_match:
            current_section = section_match.group(1).strip()
        title_match = ENTRY_HEADING_RE.match(line)
        if title_match is None:
            continue
        end_index = next(
            (j for j in range(index + 1, len(lines)) if heading_at[j] is not None),
            len(lines),
        )
        body = "\n".join(lines[index:end_index])
        entries.append(
            Entry(
                filename=filename,
                start=index + 1,
                end=end_index,
                title=title_match.group(1).strip(),
                section=current_section,
                body=body,
                conflicts=scan_conflicts(lines[index:end_index], index),
            )
        )
    return entries


def compose_draft_body(entry: Entry) -> str:
    conflict_lines = (
        "\n".join(
            f"- line {hit.line} [{hit.kind}]: {hit.snippet}" for hit in entry.conflicts
        )
        if entry.conflicts
        else "none"
    )
    header = (
        f"Import key: {entry.item_key}\n"
        f"Source: {SOURCE_PREFIX}/{entry.filename}\n"
        f"Section: {entry.section}\n"
        f"Entry: {entry.title}\n"
        f"Entry range: line {entry.start}-{entry.end}\n"
        f"Conflict flags:\n{conflict_lines}"
    )
    return f"{header}\n\n---\n\n{entry.body}"


# --------------------------------------------------------------------------
# Reconciliation key extraction (deterministic, checkpoint-independent)
# --------------------------------------------------------------------------

def extract_import_key(body: str) -> str | None:
    """Primary recovery path: the visible metadata line above '---'."""
    match = IMPORT_KEY_RE.search(body)
    return match.group(1) if match else None


def extract_key_from_header(body: str) -> str | None:
    """Fallback: rebuild the key from header fields (filename, start line, title)."""
    src = BODY_SOURCE_RE.search(body)
    rng = BODY_RANGE_RE.search(body)
    ttl = BODY_TITLE_RE.search(body)
    if not (src and rng and ttl):
        return None
    return f"{src.group(1)}:{rng.group(1)}:{normalize_title(ttl.group(1))}"


def recover_key(body: str) -> str | None:
    return extract_import_key(body) or extract_key_from_header(body)


# --------------------------------------------------------------------------
# Checkpoint (schema v2): two independent states per item key
# --------------------------------------------------------------------------

def empty_state(project_id: str) -> dict[str, Any]:
    return {"schema": CHECKPOINT_SCHEMA_VERSION, "project_id": project_id, "items": {}}


def new_item_record() -> dict[str, Any]:
    return {"draft_created": False, "project_item_id": None, "category_updated": False}


def validate_state(state: Any, project_id: str) -> dict[str, Any]:
    """Strict schema validation; raises ValueError on anything malformed."""
    if not isinstance(state, dict):
        raise ValueError("checkpoint must be a JSON object")
    unknown = set(state) - {"schema", "project_id", "items"}
    if unknown:
        raise ValueError(f"checkpoint has unknown top-level keys: {sorted(unknown)}")
    if state.get("schema") != CHECKPOINT_SCHEMA_VERSION:
        raise ValueError(
            f"checkpoint schema {state.get('schema')!r} != expected {CHECKPOINT_SCHEMA_VERSION}"
        )
    if state.get("project_id") != project_id:
        raise ValueError(f"checkpoint belongs to project {state.get('project_id')!r}")
    items = state.get("items")
    if not isinstance(items, dict):
        raise ValueError("checkpoint 'items' must be an object")
    for key, rec in items.items():
        if not isinstance(key, str) or not key:
            raise ValueError("checkpoint item keys must be non-empty strings")
        if not isinstance(rec, dict):
            raise ValueError(f"checkpoint item {key!r} must be an object")
        missing = {"draft_created", "project_item_id", "category_updated"} - set(rec)
        if missing:
            raise ValueError(f"checkpoint item {key!r} missing fields: {sorted(missing)}")
        extra = set(rec) - {"draft_created", "project_item_id", "category_updated"}
        if extra:
            raise ValueError(f"checkpoint item {key!r} has unknown fields: {sorted(extra)}")
        if not isinstance(rec["draft_created"], bool) or not isinstance(rec["category_updated"], bool):
            raise ValueError(f"checkpoint item {key!r} flags must be booleans")
        pid = rec["project_item_id"]
        if pid is not None and (not isinstance(pid, str) or not pid):
            raise ValueError(f"checkpoint item {key!r} project_item_id must be null or non-empty string")
        if rec["draft_created"] and not pid:
            raise ValueError(f"checkpoint item {key!r} marked draft_created without project_item_id")
    return state


def load_checkpoint(path: Path, project_id: str) -> dict[str, Any]:
    if not path.is_file():
        return empty_state(project_id)
    try:
        raw = path.read_text(encoding="utf-8")
    except UnicodeDecodeError as exc:
        raise ValueError(f"checkpoint {path} is not valid UTF-8: {exc}") from exc
    try:
        state = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError(f"checkpoint {path} is not valid JSON: {exc}") from exc
    return validate_state(state, project_id)


def save_checkpoint(path: Path, state: dict[str, Any]) -> None:
    """Atomic durable write: temp file + fsync + chmod 0600 + rename, cleanup on error."""
    validate_state(state, state.get("project_id", ""))
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp_name = tempfile.mkstemp(dir=path.parent, prefix=path.name + ".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            json.dump(state, handle, indent=1, sort_keys=True)
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.chmod(tmp_name, 0o600)
        os.replace(tmp_name, path)
    except BaseException:
        try:
            os.unlink(tmp_name)
        except OSError:
            pass
        raise


# --------------------------------------------------------------------------
# Concurrency lock (remote modes): one writer per checkpoint, fail fast
# --------------------------------------------------------------------------

class LockHeldError(RuntimeError):
    """Another remote-mode run already holds the exclusive checkpoint lock."""


class RemoteLock:
    """Exclusive non-blocking flock beside the checkpoint path ("<state>.lock", 0600).

    Two concurrent --execute/--reconcile/--prepare runs on one checkpoint would
    interleave their read-modify-write cycles and could double-create drafts or
    persist a half-reconciled state. The kernel releases the flock automatically
    if the holder dies, so no manual stale-lock cleanup is required. Dry-run and
    the self-tests never take the lock: internal functions stay directly callable.
    """

    def __init__(self, state_path: Path) -> None:
        self.path = Path(str(state_path) + ".lock")
        self._fd: int | None = None

    def acquire(self) -> None:
        if self._fd is not None:
            raise RuntimeError("RemoteLock.acquire called twice on the same handle")
        self.path.parent.mkdir(parents=True, exist_ok=True)
        fd = os.open(str(self.path), os.O_CREAT | os.O_RDWR, 0o600)
        try:
            os.fchmod(fd, 0o600)  # deterministic mode even if the file pre-existed
            fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except OSError as exc:
            os.close(fd)
            raise LockHeldError(
                f"another hosting_game_import remote run holds the lock on {self.path}; "
                f"refusing concurrent remote execution ({exc})"
            ) from exc
        os.ftruncate(fd, 0)
        os.write(fd, f"pid={os.getpid()}\n".encode("utf-8"))
        self._fd = fd

    def release(self) -> None:
        if self._fd is None:
            return
        fd, self._fd = self._fd, None
        try:
            fcntl.flock(fd, fcntl.LOCK_UN)
        except OSError:
            pass
        finally:
            os.close(fd)


# --------------------------------------------------------------------------
# Integrity gates (shared by report and the --execute pre-flight)
# --------------------------------------------------------------------------

def find_integrity_issues(
    entries: list[Entry],
    limit: int,
    expected: dict[str, int] | None = None,
) -> list[str]:
    expected = EXPECTED_COUNTS if expected is None else expected
    issues: list[str] = []
    by_file: dict[str, list[Entry]] = {name: [] for name in expected}
    for entry in entries:
        by_file.setdefault(entry.filename, []).append(entry)

    for name in sorted(expected):
        parsed = len(by_file.get(name, []))
        if parsed != expected[name]:
            issues.append(f"count mismatch {name}: parsed {parsed}, expected {expected[name]}")
    total_expected = sum(expected.values())
    if len(entries) != total_expected:
        issues.append(f"total count mismatch: parsed {len(entries)}, expected {total_expected}")

    keys = [entry.item_key for entry in entries]
    dup_count = len(keys) - len(set(keys))
    if dup_count:
        issues.append(f"duplicate item keys: {dup_count}")

    oversize = [entry for entry in entries if len(entry.draft_body) > limit]
    if oversize:
        sample = ", ".join(entry.item_key for entry in oversize[:3])
        issues.append(f"oversize draft payloads (> {limit} chars): {len(oversize)} [{sample}]")

    secrets = [entry for entry in entries if SECRET_RE.search(entry.draft_body)]
    if secrets:
        sample = ", ".join(entry.item_key for entry in secrets[:3])
        issues.append(f"secret-pattern matches in bodies: {len(secrets)} [{sample}]")

    return issues


def validate_category_options(data: Any) -> dict[str, str]:
    """filename -> non-empty option id for ALL category files; raises ValueError."""
    if not isinstance(data, dict):
        raise ValueError("category options must be a JSON object mapping filename -> option id")
    missing = [name for name in CATEGORY_FILES if name not in data]
    if missing:
        raise ValueError(f"category options missing files: {missing}")
    clean: dict[str, str] = {}
    for key, value in data.items():
        if not isinstance(key, str) or not isinstance(value, str) or not value.strip():
            raise ValueError(f"category option {key!r} must map to a non-empty string option id")
        clean[key] = value
    return clean


# --------------------------------------------------------------------------
# gh graphql transport: stdin JSON, --include header parsing, retry/backoff
# --------------------------------------------------------------------------

class GraphQLError(RuntimeError):
    def __init__(self, message: str, *, status: int | None = None,
                 errors: list[Any] | None = None) -> None:
        super().__init__(message)
        self.status = status
        self.errors = errors or []


def parse_included_output(stdout: str) -> tuple[int | None, dict[str, str], str]:
    """Split `gh api --include` stdout into (status, lowercased headers, body)."""
    lines = stdout.split("\n")
    http_index = next((i for i, line in enumerate(lines) if line.startswith("HTTP/")), None)
    if http_index is None:
        return None, {}, stdout
    status: int | None = None
    headers: dict[str, str] = {}
    match = re.match(r"^HTTP/\S+\s+(\d{3})", lines[http_index])
    if match:
        status = int(match.group(1))
    index = http_index + 1
    while index < len(lines):
        line = lines[index]
        if not line.strip():
            index += 1
            break
        if ":" in line:
            name, _, value = line.partition(":")
            headers[name.strip().lower()] = value.strip()
        index += 1
    return status, headers, "\n".join(lines[index:])


def _retry_after_seconds(headers: dict[str, str], now_epoch: float) -> float | None:
    raw = headers.get("retry-after")
    if raw is None:
        return None
    raw = raw.strip()
    try:
        return max(0.0, float(raw))
    except ValueError:
        pass
    try:
        from email.utils import parsedate_to_datetime

        when = parsedate_to_datetime(raw)
        if when is not None:
            return max(0.0, when.timestamp() - now_epoch)
    except (TypeError, ValueError):
        pass
    return None


def classify_failure(
    *,
    rc: int,
    status: int | None,
    headers: dict[str, str],
    stderr: str,
    errors: list[Any] | None,
    now_epoch: float | None = None,
    idempotent: bool = True,
) -> tuple[bool, float | None, str]:
    """Decide (retryable, wait_seconds, reason). Retry only transient/limit states.

    Never retries permission (401/403 without limit signal) or GraphQL schema
    validation errors.

    M4: `idempotent=False` marks create-style mutations that cannot be safely
    re-sent. A lost HTTP response (no status) or any 5xx leaves it UNKNOWN
    whether the write already applied, so those classify as permanent: the run
    aborts instead of duplicating, and `--reconcile` adopts the orphan on the
    next start. Explicit "request was rejected" signals (429, rate limits,
    Retry-After, GraphQL errors) stay retryable because the server told us it
    did not apply the mutation.
    """
    now_epoch = time.time() if now_epoch is None else now_epoch
    error_text = (stderr or "").lower() + " " + json.dumps(errors or []).lower()
    rate_hint = any(hint in error_text for hint in RATE_LIMIT_HINTS)
    retry_after = _retry_after_seconds(headers, now_epoch)
    remaining_zero = headers.get("x-ratelimit-remaining", "").strip() == "0"

    if not idempotent and status is not None and status >= 500:
        return False, None, (
            f"non-idempotent: http {status} leaves the mutation outcome unknown; "
            "run --reconcile to adopt it instead of retrying"
        )
    if not idempotent and rc != 0 and status is None:
        return False, None, (
            "non-idempotent: lost HTTP response after the request may have applied; "
            "run --reconcile to adopt it instead of retrying"
        )
    if retry_after is not None and (
        status in (403, 429) or (status is not None and status >= 500) or rate_hint
    ):
        return True, retry_after, f"retry-after={retry_after:.0f}s status={status}"
    if remaining_zero and rate_hint:
        reset = headers.get("x-ratelimit-reset")
        if reset and reset.isdigit():
            return True, max(2.0, int(reset) - now_epoch + 1.0), "primary rate limit (x-ratelimit-reset)"
        return True, None, "primary rate limit (no reset header)"
    if status == 429:
        return True, None, "http 429"
    if status is not None and status >= 500:
        return True, None, f"http {status}"
    if rate_hint:
        return True, None, "rate-limit error text"
    if rc != 0 and status is None:
        return True, None, "transport error (no HTTP response)"
    return False, None, f"permanent failure (status={status}, rc={rc})"


class GhTransport:
    """All payloads (titles/bodies included) travel via stdin JSON, never argv."""

    def __init__(
        self,
        *,
        runner: Callable[..., Any] = subprocess.run,
        sleeper: Callable[[float], None] = time.sleep,
        clock: Callable[[], float] = time.monotonic,
        epoch: Callable[[], float] = time.time,
        rng: Callable[[], float] = lambda: 0.0,
        max_retries: int = DEFAULT_MAX_RETRIES,
        min_mutation_gap: float = DEFAULT_MIN_MUTATION_GAP,
        backoff_base: float = 2.0,
        backoff_cap: float = 120.0,
        command: tuple[str, ...] = ("gh", "api", "graphql", "--include", "--input", "-"),
    ) -> None:
        self.runner = runner
        self.sleeper = sleeper
        self.clock = clock
        self.epoch = epoch
        self.rng = rng
        self.max_retries = max_retries
        self.min_mutation_gap = min_mutation_gap
        self.backoff_base = backoff_base
        self.backoff_cap = backoff_cap
        self.command = list(command)
        self._last_mutation_at: float | None = None

    def _pace_mutation(self, phase_gap: float) -> None:
        gap = max(self.min_mutation_gap, phase_gap)
        now = self.clock()
        if self._last_mutation_at is not None:
            wait = gap - (now - self._last_mutation_at)
            if wait > 0:
                self.sleeper(wait)
        self._last_mutation_at = self.clock()

    def _send(self, payload: dict[str, Any]) -> tuple[int, str, str]:
        # M1: pin the pipe codec to UTF-8 explicitly. The default locale codec
        # (e.g. ANSI_X3.4 on a C-locale host) cannot decode GitHub's UTF-8
        # titles/bodies; strict errors surface corrupt bytes instead of
        # silently replacing them.
        result = self.runner(
            self.command,
            input=json.dumps(payload),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="strict",
        )
        return result.returncode, result.stdout or "", result.stderr or ""

    def gh_graphql(
        self,
        query: str,
        variables: dict[str, Any],
        *,
        mutation: bool = False,
        phase_gap: float = 0.0,
        idempotent: bool = True,
    ) -> dict[str, Any]:
        payload = {"query": query, "variables": variables}
        last_reason = "unknown"
        for attempt in range(self.max_retries + 1):
            if mutation:
                self._pace_mutation(phase_gap)
            rc, stdout, stderr = self._send(payload)
            status, headers, body_text = parse_included_output(stdout)
            data: dict[str, Any] | None = None
            errors: list[Any] | None = None
            try:
                parsed = json.loads(body_text) if body_text.strip() else None
            except json.JSONDecodeError:
                parsed = None
            if isinstance(parsed, dict):
                data = parsed.get("data")
                errors = parsed.get("errors")
            ok = rc == 0 and (status is None or 200 <= status < 300) and not errors and data is not None
            if ok:
                assert data is not None
                return data
            retryable, wait, reason = classify_failure(
                rc=rc, status=status, headers=headers, stderr=stderr,
                errors=errors, now_epoch=self.epoch(), idempotent=idempotent,
            )
            last_reason = reason
            if not retryable:
                raise GraphQLError(
                    f"gh graphql permanent failure [{reason}]: "
                    f"{(stderr or json.dumps(errors) if errors else reason)[:400]}",
                    status=status,
                    errors=errors,
                )
            if attempt == self.max_retries:
                raise GraphQLError(
                    f"gh graphql retries exhausted ({self.max_retries}) last reason: {reason}",
                    status=status,
                    errors=errors,
                )
            sleep_for = wait if wait is not None else min(
                self.backoff_cap, self.backoff_base * (2 ** attempt)
            )
            self.sleeper(sleep_for + self.rng())
        raise AssertionError("unreachable")


class Transport(Protocol):
    """Seam used by reconcile/execute so tests can inject fakes."""

    def gh_graphql(
        self,
        query: str,
        variables: dict[str, Any],
        *,
        mutation: bool = False,
        phase_gap: float = 0.0,
        idempotent: bool = True,
    ) -> dict[str, Any]: ...


# --------------------------------------------------------------------------
# Progress logging (item keys + remote IDs only; never tokens or bodies)
# --------------------------------------------------------------------------

class ProgressLogger:
    def __init__(self, log_file: Path | None = None) -> None:
        self._handle = log_file.open("a", encoding="utf-8") if log_file else None

    def log(self, event: str, message: str) -> None:
        stamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        line = f"[{stamp}] {event} {message}"
        print(line, flush=True)
        if self._handle:
            self._handle.write(line + "\n")
            self._handle.flush()

    def close(self) -> None:
        if self._handle:
            self._handle.close()


# --------------------------------------------------------------------------
# Paginated read-only queries
# --------------------------------------------------------------------------

def _require_graphql_container(container: dict[str, Any], key: str,
                               context: str) -> dict[str, Any]:
    """Fetch a mapping-typed child of a GraphQL payload or fail loud.

    A missing/null child (e.g. `"node": null`, a null connection) means the
    response is anomalous — never a legitimate empty page. Coercing it to `{}`
    would let reconcile/execute act on fabricated "empty" board data, so we halt.
    """
    child = container.get(key)
    if not isinstance(child, dict):
        raise GraphQLError(
            f"unexpected GraphQL response: {context} is missing or null at "
            f"{key!r} (got {child!r}); refusing to treat an anomalous response "
            "as an empty page"
        )
    return child


def _require_project_v2_node(data: dict[str, Any]) -> dict[str, Any]:
    """Extract the ProjectV2 board from a `node(id:...)` reply or fail loud.

    Two distinct anomalies must never look like an empty board: a missing/null
    `data.node` (bad id, lost access, truncated envelope) and a node that
    resolved to some other schema type (the `... on ProjectV2` fragment then
    silently selects no fields, so every connection key would "just be missing").
    """
    node = _require_graphql_container(data, "node", "response data")
    typename = node.get("__typename")
    if typename != "ProjectV2":
        raise GraphQLError(
            "unexpected GraphQL response: node(id:...) resolved to __typename "
            f"{typename!r}, not 'ProjectV2'; refusing to read a non-project "
            "node as board data"
        )
    return node


def _paginate(transport: Transport, query: str, base_vars: dict[str, Any],
              path: tuple[str, ...]) -> list[dict[str, Any]]:
    """Walk a Relay connection to completion, failing loud on anomalous shapes.

    A successful page — including a legitimately empty one — requires the whole
    envelope to exist: `data.node` resolving to a `ProjectV2` __typename, the
    connection container at `path`, an explicit `nodes` LIST (possibly empty) of
    objects, and a `pageInfo` object. Anything less raises GraphQLError rather
    than returning a partial or empty result that could trigger the stale-reset
    mass-deletion path downstream.
    """
    nodes: list[dict[str, Any]] = []
    cursor: str | None = None
    while True:
        variables = dict(base_vars, first=RECURSION_PAGE_SIZE, after=cursor)
        data = transport.gh_graphql(query, variables)
        if not isinstance(data, dict):
            raise GraphQLError(
                f"unexpected GraphQL response: top-level data is not an object "
                f"(got {data!r})"
            )
        connection = _require_project_v2_node(data)
        walked = "ProjectV2 node"
        for part in path:
            connection = _require_graphql_container(connection, part, walked)
            walked = part
        page_nodes = connection.get("nodes")
        if not isinstance(page_nodes, list):
            raise GraphQLError(
                f"unexpected GraphQL response: {walked!r} connection has no "
                f"explicit 'nodes' list (got {page_nodes!r}); refusing to treat "
                "it as an empty page"
            )
        for node in page_nodes:
            if not isinstance(node, dict):
                raise GraphQLError(
                    f"unexpected GraphQL response: {walked!r} connection contains "
                    f"a non-object node (got {node!r})"
                )
        nodes.extend(page_nodes)
        info = connection.get("pageInfo")
        if not isinstance(info, dict):
            raise GraphQLError(
                f"unexpected GraphQL response: {walked!r} connection has malformed "
                f"'pageInfo' (got {info!r})"
            )
        if not info.get("hasNextPage"):
            return nodes
        cursor = info.get("endCursor")
        if not cursor:
            raise GraphQLError(
                "pagination reported hasNextPage but ended without an endCursor"
            )


def list_project_fields(transport: Transport, project_id: str) -> list[dict[str, Any]]:
    return _paginate(transport, FIELDS_QUERY, {"project": project_id}, ("fields",))


def list_project_items(transport: Transport, project_id: str, field_name: str) -> list[dict[str, Any]]:
    return _paginate(
        transport, ITEMS_QUERY, {"project": project_id, "fieldName": field_name}, ("items",)
    )


def find_field_by_id(transport: Transport, project_id: str, field_id: str) -> dict[str, Any] | None:
    for field_conf in list_project_fields(transport, project_id):
        if field_conf.get("id") == field_id:
            return field_conf
    return None


# --------------------------------------------------------------------------
# Reconciliation: adopt remote drafts into checkpoint; report duplicates
# --------------------------------------------------------------------------

def evaluate_stale_reset_guard(
    *,
    remote_matched: int,
    total_created: int,
    reset_count: int,
    allow_stale_reset: bool,
) -> str | None:
    """Return a human-readable block reason if a stale reset is unsafe, else None.

    Resetting checkpoint records merely because a read did not return them assumes
    the read was trustworthy. Two signatures say it was not: a zero-match board
    with created records still in the checkpoint (wrong project, missing scope, or
    a silently truncated read) and a reset exceeding a small fraction of the whole
    checkpoint (partial outage). Both halt the automatic reset unless the operator
    explicitly passes --allow-stale-reset.
    """
    if reset_count == 0 or allow_stale_reset:
        return None
    if remote_matched == 0:
        return (
            f"zero project drafts matched remotely while {reset_count} "
            "checkpoint-created record(s) are missing; the remote read is likely "
            "untrustworthy (wrong project id, gh scope, or truncated results) — "
            "a mass reset would wipe the checkpoint's knowledge of every draft"
        )
    if reset_count * 100 > STALE_RESET_MAX_PERCENT * total_created:
        percent = 100.0 * reset_count / total_created if total_created else 100.0
        return (
            f"{reset_count} of {total_created} checkpoint-created records "
            f"({percent:.1f}%) are missing remotely, exceeding the "
            f"{STALE_RESET_MAX_PERCENT}% blast-radius limit for one automatic run"
        )
    return None


def reconcile(
    entries: list[Entry],
    state: dict[str, Any],
    transport: Transport,
    *,
    category_field_name: str,
    options_by_file: dict[str, str] | None,
    logger: ProgressLogger,
    allow_stale_reset: bool = False,
) -> dict[str, Any]:
    """Read-only remote pass; mutates `state` in place (caller saves).

    When the stale-reset blast-radius guard trips (and --allow-stale-reset was not
    given), no stale record is reset and `stale_reset_blocked` is returned True so
    the caller must NOT save and must abort before any mutation.
    """
    by_key = {entry.item_key: entry for entry in entries}
    nodes = list_project_items(transport, state["project_id"], category_field_name)
    remote_by_key: dict[str, list[dict[str, Any]]] = {}
    for node in nodes:
        if node.get("type") != "DRAFT_ISSUE":
            continue
        content = node.get("content") or {}
        key = recover_key(content.get("body") or "")
        if key in by_key:
            remote_by_key.setdefault(key, []).append(node)

    adopted = updated_flag = drift_reset = 0
    duplicates: dict[str, list[str]] = {}
    for key, matched in sorted(remote_by_key.items()):
        if len(matched) > 1:
            duplicates[key] = [node["id"] for node in matched]
            logger.log("DUPLICATE", f"key={key} remote_ids={','.join(duplicates[key])}")
        node = matched[0]
        rec = state["items"].setdefault(key, new_item_record())
        if not rec["draft_created"]:
            rec["draft_created"] = True
            rec["project_item_id"] = node["id"]
            adopted += 1
            logger.log("ADOPT", f"key={key} item={node['id']}")
        option_value = node.get("fieldValueByName") or {}
        current_option = option_value.get("optionId")
        expected_option = (options_by_file or {}).get(by_key[key].filename)
        if not expected_option:
            continue
        if current_option == expected_option:
            if not rec["category_updated"]:
                rec["category_updated"] = True
                updated_flag += 1
        elif rec["category_updated"]:
            # Remote value drifted (manual UI edit or wrong option applied);
            # un-mark it so the next --execute re-applies the expected option.
            rec["category_updated"] = False
            drift_reset += 1
            logger.log("DRIFT", f"key={key} item={node['id']} "
                                f"remote_option={current_option} expected={expected_option}")
    missing_from_remote = [
        key for key, rec in state["items"].items()
        if rec["draft_created"] and key not in remote_by_key
    ]
    total_created = sum(1 for rec in state["items"].values() if rec["draft_created"])
    block_reason = evaluate_stale_reset_guard(
        remote_matched=len(remote_by_key),
        total_created=total_created,
        reset_count=len(missing_from_remote),
        allow_stale_reset=allow_stale_reset,
    )
    if block_reason:
        logger.log("SAFETY", f"stale-reset BLOCKED, no records reset: {block_reason}")
        print(
            f"SAFETY ABORT (stale-reset blast radius): {block_reason}\n"
            "  No stale records were reset. The caller must NOT save the checkpoint\n"
            "  and must NOT mutate remotely. Verify the project id, gh auth scope,\n"
            "  and pagination first; re-run with --allow-stale-reset only once the\n"
            "  mass disappearance is confirmed real.",
            file=sys.stderr,
        )
    else:
        for key in missing_from_remote:
            # Stale checkpoint (draft deleted remotely, or id never valid): reset to
            # uncreated/uncategorized so --execute can recreate it. Clearing all
            # three fields together preserves the draft_created => project_item_id
            # invariant validated by save_checkpoint.
            stale_id = state["items"][key]["project_item_id"]
            state["items"][key] = new_item_record()
            logger.log("RESET_STALE", f"key={key} stale_item={stale_id}")
    logger.log(
        "RECONCILE",
        f"remote_drafts={len(remote_by_key)} adopted={adopted} category_marked={updated_flag} "
        f"category_drift_reset={drift_reset} duplicates={len(duplicates)} "
        f"checkpoint_ids_missing_remotely={len(missing_from_remote)} "
        f"stale_reset_blocked={bool(block_reason)}",
    )
    return {
        "remote_matched": len(remote_by_key),
        "adopted": adopted,
        "category_marked": updated_flag,
        "category_drift_reset": drift_reset,
        "duplicates": duplicates,
        "missing_from_remote": missing_from_remote,
        "stale_reset_blocked": bool(block_reason),
        "stale_reset_block_reason": block_reason,
    }


# --------------------------------------------------------------------------
# Execution (phased: all draft creations first, then all field updates)
# --------------------------------------------------------------------------

def _item_record(state: dict[str, Any], key: str) -> dict[str, Any]:
    return state["items"].setdefault(key, new_item_record())


def execute(
    entries: list[Entry],
    args: argparse.Namespace,
    state_path: Path,
    transport: Transport,
    logger: ProgressLogger,
    *,
    expected: dict[str, int] | None = None,
) -> int:
    issues = find_integrity_issues(entries, args.limit, expected)
    if issues:
        print("ABORT: pre-flight integrity failures (no remote writes performed):",
              file=sys.stderr)
        for issue in issues:
            print(f"  - {issue}", file=sys.stderr)
        return 1
    if not args.category_field_id or not args.category_options:
        print("ABORT: --execute requires --category-field-id AND --category-options",
              file=sys.stderr)
        return 1
    try:
        options_by_file = validate_category_options(
            json.loads(Path(args.category_options).read_text(encoding="utf-8"))
        )
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"ABORT: category options invalid: {exc}", file=sys.stderr)
        return 1

    state = load_checkpoint(state_path, args.project_id)
    field_conf = find_field_by_id(transport, args.project_id, args.category_field_id)
    if field_conf is None or not field_conf.get("name"):
        print(f"ABORT: category field id {args.category_field_id!r} not found in project "
              f"{args.project_id!r}", file=sys.stderr)
        return 1
    field_name = field_conf["name"]

    # M2: every mapped option id must actually belong to this field. An id from
    # another (or a recreated) field would make every phase-B update fail — or
    # worse, silently write an unrelated option. Check before any mutation.
    field_option_ids = {
        opt.get("id") for opt in (field_conf.get("options") or []) if isinstance(opt, dict)
    }
    unknown_options = sorted(set(options_by_file.values()) - field_option_ids)
    if unknown_options:
        print(f"ABORT: category-options ids {unknown_options} are not options of field "
              f"{args.category_field_id!r} ({field_name!r}); no remote mutations performed.",
              file=sys.stderr)
        return 1

    recon = reconcile(entries, state, transport,
                      category_field_name=field_name,
                      options_by_file=options_by_file,
                      logger=logger,
                      allow_stale_reset=args.allow_stale_reset)
    if recon["stale_reset_blocked"]:
        # Blast-radius guard tripped: nothing was reset, so persisting anything
        # from this pass is unsafe. Abort strictly before the first mutation.
        print("ABORT: execute stopped by stale-reset blast-radius guard; the "
              "checkpoint was NOT saved and NO remote mutations were performed. "
              "Investigate the remote read before re-running (see SAFETY log).",
              file=sys.stderr)
        return 1
    if recon["duplicates"]:
        duplicates = recon["duplicates"]
        print(f"WARNING: {len(duplicates)} item key(s) have duplicate remote "
              f"draft issues; listed above, nothing deleted.", file=sys.stderr)
    save_checkpoint(state_path, state)

    created = updated = 0
    skipped_create = 0

    # ---- Phase A: create every missing draft issue first.
    pending_creates = [e for e in entries if not state["items"].get(e.item_key, {}).get("draft_created")]
    if args.max_draft_creates is not None:
        pending_creates = pending_creates[: args.max_draft_creates]
    for entry in pending_creates:
        # M4: draft creation is NOT idempotent — a lost response may mean the
        # draft exists already. Never blind-retry; abort and let --reconcile
        # adopt the orphan before the next --execute run.
        data = transport.gh_graphql(
            DRAFT_MUTATION,
            {"project": args.project_id, "title": entry.title, "body": entry.draft_body},
            mutation=True,
            phase_gap=args.draft_create_interval,
            idempotent=False,
        )
        try:
            item_id = data["addProjectV2DraftIssue"]["projectItem"]["id"]
        except (KeyError, TypeError) as exc:
            raise GraphQLError(f"unexpected addProjectV2DraftIssue response shape: {exc}") from exc
        if not item_id:
            raise GraphQLError("addProjectV2DraftIssue returned empty projectItem id")
        rec = _item_record(state, entry.item_key)
        rec["draft_created"] = True
        rec["project_item_id"] = item_id
        save_checkpoint(state_path, state)  # immediately after success
        created += 1
        logger.log("CREATED", f"key={entry.item_key} item={item_id}")
    remaining_creates = len([e for e in entries if not state["items"].get(e.item_key, {}).get("draft_created")])
    skipped_create = len(entries) - created - remaining_creates

    # ---- Phase B: apply pending category values (includes this run's new drafts).
    pending_updates: list[tuple[Entry, str]] = []
    for entry in entries:
        rec = state["items"].get(entry.item_key)
        if not rec or not rec["draft_created"] or rec["category_updated"] or not rec["project_item_id"]:
            continue
        if entry.filename not in options_by_file:
            continue
        pending_updates.append((entry, rec["project_item_id"]))
    if args.max_field_updates is not None:
        pending_updates = pending_updates[: args.max_field_updates]
    for entry, item_id in pending_updates:
        data = transport.gh_graphql(
            UPDATE_MUTATION,
            {
                "project": args.project_id,
                "item": item_id,
                "field": args.category_field_id,
                "option": options_by_file[entry.filename],
            },
            mutation=True,
            phase_gap=args.field_update_interval,
        )
        try:
            echoed = data["updateProjectV2ItemFieldValue"]["projectV2Item"]["id"]
        except (KeyError, TypeError) as exc:
            raise GraphQLError(f"unexpected updateProjectV2ItemFieldValue response shape: {exc}") from exc
        rec = _item_record(state, entry.item_key)
        rec["category_updated"] = True
        save_checkpoint(state_path, state)
        updated += 1
        logger.log("CATEGORIZED", f"key={entry.item_key} item={echoed or item_id}")

    logger.log(
        "SUMMARY",
        f"created={created} updated={updated} already_created={skipped_create} "
        f"pending_drafts={remaining_creates} pending_updates="
        f"{len([e for e in entries if not state['items'].get(e.item_key, {}).get('category_updated')])}",
    )
    return 0


# --------------------------------------------------------------------------
# Prepare-category-field (read-create; never touches draft issues)
# --------------------------------------------------------------------------

def build_options_mapping(field_options: list[dict[str, str]]) -> dict[str, str]:
    """Validate a field's options contain all 11 filenames; map filename -> option id."""
    by_name = {opt.get("name"): opt.get("id") for opt in field_options if isinstance(opt, dict)}
    mapping: dict[str, str] = {}
    for name in CATEGORY_FILES:
        opt_id = by_name.get(name)
        if name not in by_name:
            raise ValueError(f"Category field is missing option name {name!r}")
        if not isinstance(opt_id, str) or not opt_id:
            raise ValueError(f"Category option {name!r} has no usable id")
        mapping[name] = opt_id
    return mapping


def select_category_fields(fields: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """All Category SINGLE_SELECT field configs on the board, in read order."""
    return [
        f for f in fields
        if f.get("__typename") == "ProjectV2SingleSelectField"
        and f.get("name") == CATEGORY_FIELD_NAME
    ]


def prepare_category_field(
    args: argparse.Namespace,
    transport: Transport,
    logger: ProgressLogger,
) -> int:
    output_path = args.category_options_output
    if not output_path:
        print("ABORT: --prepare-category-field requires --category-options-output",
              file=sys.stderr)
        return 1
    fields = list_project_fields(transport, args.project_id)
    category_fields = select_category_fields(fields)
    if len(category_fields) > 1:
        # Picking one nondeterministically would bind the whole import to a
        # possibly-wrong field; make the operator resolve the ambiguity first.
        ids = ", ".join(str(f.get("id")) for f in category_fields)
        print(f"ABORT: found {len(category_fields)} Category SINGLE_SELECT fields "
              f"(ids: {ids}); refusing to pick one. Remove the duplicate in the "
              "project UI, then re-run --prepare-category-field.", file=sys.stderr)
        return 3
    if category_fields:
        existing = category_fields[0]
        logger.log("FIELD_EXISTS", f"name={CATEGORY_FIELD_NAME} id={existing.get('id')}")
        try:
            mapping = build_options_mapping(existing.get("options") or [])
        except ValueError as exc:
            print(f"ABORT: existing Category field invalid: {exc}", file=sys.stderr)
            return 3
        field_id = existing["id"]
    else:
        single_options = [
            {"name": name, "description": name, "color": CATEGORY_OPTION_COLOR}
            for name in CATEGORY_FILES
        ]
        # createProjectV2Field is NON-IDEMPOTENT: a lost response or 5xx leaves
        # it unknown whether the field exists; abort and re-run --prepare to find
        # it, instead of blind-retrying and creating a duplicate Category field.
        data = transport.gh_graphql(
            CREATE_FIELD_MUTATION,
            {"project": args.project_id, "name": CATEGORY_FIELD_NAME, "options": single_options},
            mutation=True,
            phase_gap=args.draft_create_interval,
            idempotent=False,
        )
        created_field = (data.get("createProjectV2Field") or {}).get("projectV2Field") or {}
        if created_field.get("__typename") != "ProjectV2SingleSelectField" or not created_field.get("id"):
            print(f"ABORT: unexpected createProjectV2Field response: {json.dumps(created_field)[:300]}",
                  file=sys.stderr)
            return 3
        field_id = created_field["id"]
        logger.log("FIELD_CREATED", f"name={CATEGORY_FIELD_NAME} id={field_id}")
        # Verify against the actual board, not the create echo: exactly one
        # Category field must now exist with a complete 11-option mapping before
        # any output file is written.
        reread = select_category_fields(list_project_fields(transport, args.project_id))
        if len(reread) != 1:
            ids = ", ".join(str(f.get("id")) for f in reread)
            print(f"ABORT: after create, expected exactly one Category field but the "
                  f"board shows {len(reread)} (ids: {ids}); mapping NOT written.",
                  file=sys.stderr)
            return 3
        try:
            mapping = build_options_mapping(reread[0].get("options") or [])
        except ValueError as exc:
            print(f"ABORT: created Category field failed post-create verification: {exc}",
                  file=sys.stderr)
            return 3
        logger.log("FIELD_VERIFIED", f"id={field_id} options={len(mapping)}")

    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp_name = tempfile.mkstemp(dir=output_path.parent, prefix=output_path.name + ".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            json.dump(mapping, handle, indent=1, sort_keys=True)
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.chmod(tmp_name, 0o600)
        os.replace(tmp_name, output_path)
    except BaseException:
        try:
            os.unlink(tmp_name)
        except OSError:
            pass
        raise
    logger.log("MAPPING_WRITTEN", f"path={output_path} options={len(mapping)} field_id={field_id}")
    return 0


# --------------------------------------------------------------------------
# Reporting / samples / manifest
# --------------------------------------------------------------------------

def print_samples(entries: list[Entry], selectors: list[str]) -> None:
    index = {f"{e.filename}:{e.start}": e for e in entries}
    for selector in selectors:
        entry = index.get(selector)
        if entry is None:
            print(f"!! no entry for selector {selector}", file=sys.stderr)
            continue
        print(f"===== SAMPLE payload for key {entry.item_key} =====")
        print(f"TITLE: {entry.title}")
        print(f"BODY ({len(entry.draft_body)} chars):")
        print(entry.draft_body)
        print("===== END SAMPLE =====\n")


def report(entries: list[Entry], src: Path, limit: int) -> int:
    by_file: dict[str, list[Entry]] = {name: [] for name in CATEGORY_FILES}
    for entry in entries:
        by_file[entry.filename].append(entry)

    print(f"source: {src}")
    print(f"draft body limit: {limit} chars\n")
    print(f"{'file':<48} {'parsed':>6} {'expected':>8} {'ok':<3} {'conflict_entries':>16}")
    mismatch = 0
    for name in CATEGORY_FILES:
        parsed = len(by_file[name])
        expected = EXPECTED_COUNTS[name]
        conflicts = sum(1 for e in by_file[name] if e.conflicts)
        ok = "yes" if parsed == expected else "NO"
        mismatch += parsed != expected
        print(f"{name:<48} {parsed:>6} {expected:>8} {ok:<3} {conflicts:>16}")

    draft_lengths = [len(e.draft_body) for e in entries]
    idea_lengths = [len(e.body) for e in entries]
    oversize = [e for e in entries if len(e.draft_body) > limit]
    total_conflict_hits = sum(len(e.conflicts) for e in entries)
    conflict_entries = [e for e in entries if e.conflicts]
    secrets = [e for e in entries if SECRET_RE.search(e.draft_body)]
    issues = find_integrity_issues(entries, limit)

    print(f"\ntotal entries: {len(entries)} (expected {sum(EXPECTED_COUNTS.values())})")
    print(f"count mismatches: {mismatch} file(s)")
    print(f"entries with >=1 conflict flag: {len(conflict_entries)}")
    print(f"total conflict hits: {total_conflict_hits} "
          f"(sword lines: {sum(1 for e in entries for h in e.conflicts if h.kind == 'sword')}, "
          f"*CONFLICTING* lines: {sum(1 for e in entries for h in e.conflicts if h.kind == 'conflicting')})")
    print(f"unique item keys: {len({e.item_key for e in entries})} "
          f"(duplicates: {len(entries) - len({e.item_key for e in entries})})")
    print(f"secret-pattern matches in bodies: {len(secrets)}")

    def lengths_label(name: str, lengths: list[int]) -> None:
        if not lengths:
            print(f"{name}: (no entries)")
            return
        print(f"{name}: min={min(lengths)} median={statistics.median(lengths):.1f} max={max(lengths)}")

    print()
    lengths_label("idea-body chars", idea_lengths)
    lengths_label("draft-payload chars (header+---+body)", draft_lengths)
    print(f"oversize draft payloads (> {limit}): {len(oversize)}")
    for entry in sorted(oversize, key=lambda e: -len(e.draft_body)):
        print(f"  OVERSIZE {entry.item_key} -> {len(entry.draft_body)} chars")
    if issues:
        print("\nINTEGRITY ISSUES (block --execute):")
        for issue in issues:
            print(f"  - {issue}")
    return 0 if not issues else 2


def load_entries(src: Path) -> list[Entry]:
    entries: list[Entry] = []
    for name in CATEGORY_FILES:
        path = src / name
        if not path.is_file():
            raise FileNotFoundError(f"missing category file: {path}")
        entries.extend(parse_file(name, path.read_text(encoding="utf-8")))
    return entries


# --------------------------------------------------------------------------
# CLI
# --------------------------------------------------------------------------

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=(__doc__ or "").splitlines()[0])
    parser.add_argument("--src", default="hosting_game_raw/master", type=Path)
    parser.add_argument("--project-id", default="PVT_kwHOABTSGM4Bjwpn")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--dry-run", action="store_true", help="parse + report only (default)")
    mode.add_argument("--execute", action="store_true",
                      help="create missing drafts, then apply pending category values")
    mode.add_argument("--reconcile", action="store_true",
                      help="read-only remote adoption into checkpoint")
    mode.add_argument("--prepare-category-field", action="store_true",
                      help="find-or-create the Category SINGLE_SELECT field; write option mapping")
    parser.add_argument("--self-test", action="store_true", help="run built-in unittest suite (no network)")
    parser.add_argument("--state", default="scripts/.hosting_game_import/checkpoint.json", type=Path)
    parser.add_argument("--manifest", type=Path, help="write JSONL of parsed items to this path")
    parser.add_argument("--print-sample", action="append", default=[], metavar="FILE:LINE")
    parser.add_argument("--limit", type=int, default=DRAFT_BODY_CHAR_LIMIT,
                        help="max draft body chars; oversize payload aborts --execute")
    parser.add_argument("--category-field-id", default=None)
    parser.add_argument("--category-options", default=None,
                        help="JSON file: filename -> single-select option id (all 11 required)")
    parser.add_argument("--category-options-output", type=Path, default=None,
                        help="where --prepare-category-field writes the mapping JSON")
    parser.add_argument("--draft-create-interval", type=_positive_float,
                        default=DEFAULT_DRAFT_CREATE_INTERVAL,
                        help="min seconds between draft-creation mutations")
    parser.add_argument("--field-update-interval", type=_positive_float,
                        default=DEFAULT_FIELD_UPDATE_INTERVAL,
                        help="min seconds between field-update mutations")
    parser.add_argument("--min-mutation-gap", type=_positive_float,
                        default=DEFAULT_MIN_MUTATION_GAP,
                        help="hard floor seconds between ANY two mutations")
    parser.add_argument("--max-draft-creates", type=int, default=None,
                        help="cap drafts created this run (chunking)")
    parser.add_argument("--max-field-updates", type=int, default=None,
                        help="cap field updates applied this run (chunking)")
    parser.add_argument("--max-retries", type=int, default=DEFAULT_MAX_RETRIES)
    parser.add_argument("--allow-stale-reset", action="store_true",
                        help="override the blast-radius guard that blocks stale resets "
                             "when zero drafts match or >5%% of created records vanished")
    parser.add_argument("--log-file", type=Path, default=None)
    return parser


def _positive_float(value: str) -> float:
    number = float(value)
    if number <= 0:
        raise argparse.ArgumentTypeError("must be > 0")
    return number


def configure_utf8_streams() -> None:
    """M1: never crash while printing parsed content (crossed swords, U+FE0F, NBSP...).

    backslashreplace turns un-encodable characters into escape sequences on a
    C-locale terminal while keeping genuine UTF-8 intact where supported.
    Streams without `reconfigure` (test StringIO redirects, replaced handles)
    are skipped rather than crashing startup.
    """
    for stream in (sys.stdout, sys.stderr):
        reconfigure = getattr(stream, "reconfigure", None)
        if callable(reconfigure):
            reconfigure(encoding="utf-8", errors="backslashreplace")


def main(argv: list[str]) -> int:
    configure_utf8_streams()
    parser = build_parser()
    args = parser.parse_args(argv)

    if args.self_test:
        return run_self_tests()

    if args.limit <= 0:
        parser.error("--limit must be > 0")
    if (args.max_draft_creates is not None and args.max_draft_creates < 0
            or args.max_field_updates is not None and args.max_field_updates < 0):
        parser.error("--max-draft-creates/--max-field-updates must be >= 0")
    if args.max_retries < 0:
        parser.error("--max-retries must be >= 0")

    # C1: dry-run is parse-only; the mutually exclusive group already rejected
    # combinations, and the transport is only constructed for remote modes.
    remote_mode = args.execute or args.reconcile or args.prepare_category_field
    transport: GhTransport | None = None
    if remote_mode:
        transport = GhTransport(
            max_retries=args.max_retries,
            min_mutation_gap=args.min_mutation_gap,
        )
    logger = ProgressLogger(args.log_file)
    lock: RemoteLock | None = None
    try:
        if remote_mode:
            # Serialize every remote-mode run against this checkpoint; the lock is
            # released in the finally block on both normal and exception exits.
            lock = RemoteLock(args.state)
            try:
                lock.acquire()
            except LockHeldError as exc:
                print(f"ABORT: {exc}", file=sys.stderr)
                return 1
        if args.prepare_category_field:
            assert transport is not None
            return prepare_category_field(args, transport, logger)

        src = args.src if args.src.is_absolute() else Path.cwd() / args.src
        try:
            entries = load_entries(src)
        except (OSError, ValueError) as exc:
            print(f"ABORT: parsing failed (no remote writes performed): {exc}", file=sys.stderr)
            return 1

        if args.manifest:
            with args.manifest.open("w", encoding="utf-8") as sink:
                for entry in entries:
                    sink.write(json.dumps({
                        "key": entry.item_key,
                        "import_key": entry.item_key,
                        "file": entry.filename,
                        "start": entry.start,
                        "end": entry.end,
                        "title": entry.title,
                        "section": entry.section,
                        "idea_body_chars": len(entry.body),
                        "draft_body_chars": len(entry.draft_body),
                        "conflicts": [hit.__dict__ for hit in entry.conflicts],
                    }) + "\n")
            print(f"manifest written: {args.manifest}")

        if args.print_sample:
            print_samples(entries, args.print_sample)

        exit_code = report(entries, src, args.limit)

        if args.execute:
            if exit_code != 0:
                print("ABORT: integrity report failed; refusing any remote mutation.",
                      file=sys.stderr)
                return exit_code
            assert transport is not None
            return execute(entries, args, args.state, transport, logger)

        if args.reconcile:
            if exit_code != 0:
                print("NOTE: integrity issues present; reconcile stays read-only but fix them.",
                      file=sys.stderr)
            assert transport is not None
            if bool(args.category_field_id) != bool(args.category_options):
                print("NOTE: --reconcile was given exactly one of --category-field-id/"
                      "--category-options; BOTH are required for category-drift checking, "
                      "so drift detection is skipped this run and only draft adoption runs.",
                      file=sys.stderr)
            options_by_file: dict[str, str] | None = None
            field_name = CATEGORY_FIELD_NAME
            if args.category_field_id and args.category_options:
                try:
                    options_by_file = validate_category_options(
                        json.loads(Path(args.category_options).read_text(encoding="utf-8"))
                    )
                except (OSError, ValueError) as exc:  # missing file, bad JSON, bad shape
                    print(f"ABORT: category options invalid for reconcile: {exc}",
                          file=sys.stderr)
                    return exit_code or 1
                found = find_field_by_id(transport, args.project_id, args.category_field_id)
                if found is None:
                    print("ABORT: category field id not found in project", file=sys.stderr)
                    return exit_code or 1
                field_name = found.get("name") or CATEGORY_FIELD_NAME
            state = load_checkpoint(args.state, args.project_id)
            recon = reconcile(entries, state, transport,
                              category_field_name=field_name,
                              options_by_file=options_by_file,
                              logger=logger,
                              allow_stale_reset=args.allow_stale_reset)
            if recon["stale_reset_blocked"]:
                print("ABORT: reconcile stopped by stale-reset blast-radius guard; the "
                      "checkpoint was NOT saved. Investigate the remote read, then "
                      "re-run (optionally with --allow-stale-reset).", file=sys.stderr)
                return exit_code or 1
            save_checkpoint(args.state, state)
            return exit_code

        return exit_code
    finally:
        if lock is not None:
            lock.release()
        logger.close()


# --------------------------------------------------------------------------
# Self-tests (--self-test). No network: subprocess is never used; all remote
# seams are fakes.
# --------------------------------------------------------------------------

class FakeTransport:
    """Records calls; answers by substring routing; can force response shapes."""

    def __init__(self, responses: dict[str, Any] | None = None, items_pages: list | None = None):
        self.calls: list[dict[str, Any]] = []
        self.responses = responses or {}
        self.items_pages = items_pages or []

    def gh_graphql(self, query: str, variables: dict[str, Any], *,
                   mutation: bool = False, phase_gap: float = 0.0,
                   idempotent: bool = True) -> dict[str, Any]:
        self.calls.append({"query": query, "variables": variables,
                           "mutation": mutation, "idempotent": idempotent})
        for needle, response in self.responses.items():
            if needle in query:
                resolved = response(query, variables) if callable(response) else response
                assert isinstance(resolved, dict)
                return resolved
        if "items(first" in query:
            return {"node": {"__typename": "ProjectV2", "items": {
                "pageInfo": {"hasNextPage": False, "endCursor": None},
                "nodes": self.items_pages,
            }}}
        if "fields(first" in query:
            return {"node": {"__typename": "ProjectV2", "fields": {
                "pageInfo": {"hasNextPage": False, "endCursor": None},
                "nodes": [],
            }}}
        raise AssertionError(f"FakeTransport: unrouted query {query[:80]}")

    def queries(self) -> str:
        return "\n".join(call["query"] for call in self.calls)


def make_entry(filename="00-foundations.md", start=1, end=2, title="Widget", body=None):
    body = body if body is not None else f"### {title}\ncontent"
    return Entry(filename=filename, start=start, end=end, title=title,
                 section="Core", body=body)


def exec_args(**overrides):
    base = dict(
        project_id="PVT_test", category_field_id="F_cat", category_options=None,
        limit=DRAFT_BODY_CHAR_LIMIT, draft_create_interval=0.0, field_update_interval=0.0,
        min_mutation_gap=0.0, max_draft_creates=None, max_field_updates=None,
        allow_stale_reset=False,
    )
    base.update(overrides)
    return argparse.Namespace(**base)


def write_options(path: Path, mapping: dict[str, str] | None = None) -> Path:
    mapping = mapping if mapping is not None else {name: f"OPT_{i}" for i, name in enumerate(CATEGORY_FILES)}
    path.write_text(json.dumps(mapping), encoding="utf-8")
    return path


def project_node(payload: dict[str, Any]) -> dict[str, Any]:
    """Wrap a connection payload in the `node(id:...) { ... on ProjectV2 }` envelope."""
    return {"node": dict(__typename="ProjectV2", **payload)}


def category_field_response(field_id: str = "F_cat",
                            option_ids: list[str] | None = None) -> dict[str, Any]:
    """FIELDS_QUERY reply with one Category single-select carrying the given ids."""
    ids = option_ids if option_ids is not None else [f"OPT{i}" for i in range(len(CATEGORY_FILES))]
    nodes = [{"__typename": "ProjectV2SingleSelectField", "id": field_id,
              "name": "Category",
              "options": [{"id": oid, "name": name} for oid, name in zip(ids, CATEGORY_FILES)]}]
    return project_node({"fields": {"pageInfo": {"hasNextPage": False, "endCursor": None},
                                    "nodes": nodes}})


def items_response(nodes: list[dict[str, Any]]) -> dict[str, Any]:
    return project_node({"items": {"pageInfo": {"hasNextPage": False, "endCursor": None},
                                   "nodes": nodes}})


class TestParsingPhilosophy(unittest.TestCase):
    def test_h3_starts_entry_h4_stays_inside(self):
        text = "# Top\n## Sec\n### A\n#### A.1\nmore\n### B\nx"
        entries = parse_file("00-foundations.md", text)
        self.assertEqual([e.title for e in entries], ["A", "B"])
        self.assertIn("#### A.1", entries[0].body)
        self.assertEqual(entries[0].start, 3)

    def test_fences_hide_fake_headings(self):
        text = "```\n### not an entry\n```\n### real\nbody"
        entries = parse_file("00-foundations.md", text)
        self.assertEqual([e.title for e in entries], ["real"])

    def test_unbalanced_fence_raises(self):
        with self.assertRaises(ValueError):
            parse_file("00-foundations.md", "### a\n```\n### b")

    def test_body_verbatim_including_blank_lines(self):
        text = "### T\nline1\n\nline3"
        entries = parse_file("00-foundations.md", text)
        self.assertEqual(entries[0].body, "### T\nline1\n\nline3")


class TestDraftBodyAndKeys(unittest.TestCase):
    def test_import_key_line_above_separator_title_only(self):
        entry = make_entry(start=7, title="My Idea")
        body = entry.draft_body
        head, sep, tail = body.partition("\n\n---\n\n")
        self.assertTrue(sep)
        self.assertIn("Import key: 00-foundations.md:7:my idea", head)
        self.assertNotIn("Import key", tail)
        self.assertEqual(tail, entry.body)
        self.assertEqual(entry.title, "My Idea")

    def test_recover_key_from_import_line(self):
        body = make_entry(start=9, title="Two Words").draft_body
        self.assertEqual(extract_import_key(body), "00-foundations.md:9:two words")

    def test_recover_key_from_header_fallback(self):
        entry = make_entry(filename="03-threats.md", start=42, title="DDoS Wave")
        body = entry.draft_body.replace(f"Import key: {entry.item_key}\n", "")
        self.assertIsNone(extract_import_key(body))
        self.assertEqual(recover_key(body), "03-threats.md:42:ddos wave")


class TestIntegrityGates(unittest.TestCase):
    EXPECTED = {"00-foundations.md": 1}

    def _one(self, **kw):
        return make_entry(**kw)

    def test_clean_entry_no_issues(self):
        self.assertEqual(find_integrity_issues([self._one()], 65_536, self.EXPECTED), [])

    def test_count_mismatch(self):
        issues = find_integrity_issues([], 65_536, self.EXPECTED)
        self.assertTrue(any("count mismatch" in i for i in issues))
        self.assertTrue(any("total count mismatch" in i for i in issues))

    def test_oversize(self):
        entry = self._one(body="x" * 100)
        self.assertTrue(any("oversize" in i for i in find_integrity_issues([entry], 50, self.EXPECTED)))

    def test_secret_pattern(self):
        entry = self._one(body="### Widget\nleak ghp_AAAAAAAAAAAAAAAAAAAA-aaaa")
        self.assertTrue(any("secret-pattern" in i for i in find_integrity_issues([entry], 65_536, self.EXPECTED)))

    def test_duplicate_keys(self):
        dupes = [self._one(), self._one()]
        issues = find_integrity_issues(dupes, 65_536, {"00-foundations.md": 2})
        self.assertTrue(any("duplicate item keys" in i for i in issues))


class TestCategoryOptionsValidation(unittest.TestCase):
    def test_valid_full_mapping(self):
        data = {name: f"OPT{i}" for i, name in enumerate(CATEGORY_FILES)}
        self.assertEqual(validate_category_options(data), data)

    def test_rejects_missing_file(self):
        data = {name: "OPT" for name in CATEGORY_FILES[1:]}
        with self.assertRaises(ValueError):
            validate_category_options(data)

    def test_rejects_empty_option_id(self):
        data = {name: "OPT" for name in CATEGORY_FILES}
        data["00-foundations.md"] = "  "
        with self.assertRaises(ValueError):
            validate_category_options(data)

    def test_rejects_non_dict(self):
        with self.assertRaises(ValueError):
            validate_category_options(["not", "a", "dict"])


class TestCheckpoint(unittest.TestCase):
    def test_atomic_save_load_roundtrip_and_permissions(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "nested" / "checkpoint.json"
            state = empty_state("PVT_test")
            state["items"]["k1"] = {"draft_created": True, "project_item_id": "PVTI_1",
                                    "category_updated": False}
            save_checkpoint(path, state)
            mode = path.stat().st_mode & 0o777
            self.assertEqual(mode, 0o600)
            loaded = load_checkpoint(path, "PVT_test")
            self.assertEqual(loaded["items"]["k1"]["project_item_id"], "PVTI_1")

    def test_tmp_file_cleaned_on_replace_failure(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "checkpoint.json"
            state = empty_state("PVT_test")
            original_replace = os.replace
            os.replace = lambda *a, **k: (_ for _ in ()).throw(OSError("boom"))
            try:
                with self.assertRaises(OSError):
                    save_checkpoint(path, state)
            finally:
                os.replace = original_replace
            leftovers = [p for p in Path(tmp).iterdir() if p.name.startswith("checkpoint.json.tmp")]
            self.assertEqual(leftovers, [])
            self.assertFalse(path.exists())

    def test_fsync_called(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "checkpoint.json"
            calls: list[int] = []
            original = os.fsync

            def fake_fsync(fd: int) -> None:
                calls.append(fd)
                original(fd)

            os.fsync = fake_fsync
            try:
                save_checkpoint(path, empty_state("PVT_test"))
            finally:
                os.fsync = original
            self.assertEqual(len(calls), 1)

    def test_rejects_bad_schema_and_shapes(self):
        for bad in (
            [1, 2],
            {"schema": 1, "project_id": "p", "items": {}},
            {"schema": 2, "project_id": "other", "items": {}},
            {"schema": 2, "project_id": "p", "items": []},
            {"schema": 2, "project_id": "p", "extra": 1, "items": {}},
            {"schema": 2, "project_id": "p", "items": {"k": {"draft_created": True,
                                                             "project_item_id": None,
                                                             "category_updated": False}}},
            {"schema": 2, "project_id": "p", "items": {"k": {"draft_created": "yes",
                                                             "project_item_id": "x",
                                                             "category_updated": False}}},
        ):
            with self.assertRaises(ValueError):
                validate_state(bad, "p")

    def test_created_without_id_rejected_on_load(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "checkpoint.json"
            path.write_text(json.dumps({"schema": 2, "project_id": "p", "items": {
                "k": {"draft_created": True, "project_item_id": "", "category_updated": False}}}),
                encoding="utf-8")
            with self.assertRaises(ValueError):
                load_checkpoint(path, "p")


class TestTransportConstruction(unittest.TestCase):
    def test_payload_via_stdin_never_argv(self):
        seen: dict[str, Any] = {}

        def fake_runner(cmd, **kwargs):
            seen["cmd"] = cmd
            seen["kwargs"] = kwargs
            return subprocess.CompletedProcess(cmd, 0,
                stdout='HTTP/2.0 200 OK\nX-A: b\n\n{"data":{"ok":true}}', stderr="")

        transport = GhTransport(runner=fake_runner)
        data = transport.gh_graphql("mutation($b:String!){x}", {"b": "BIG BODY with spaces"})
        self.assertEqual(data, {"ok": True})
        self.assertEqual(seen["cmd"], ["gh", "api", "graphql", "--include", "--input", "-"])
        sent = json.loads(seen["kwargs"]["input"])
        self.assertEqual(sent["variables"]["b"], "BIG BODY with spaces")
        self.assertNotIn("BIG BODY", " ".join(seen["cmd"]))

    def test_send_pins_utf8_strict_codec(self):
        # M1: pipe codec must be explicit UTF-8/strict, not host-locale default.
        seen: dict[str, Any] = {}

        def fake_runner(cmd, **kwargs):
            seen.update(kwargs)
            return subprocess.CompletedProcess(cmd, 0,
                stdout='HTTP/2.0 200 OK\n\n{"data":{"ok":true}}', stderr="")

        GhTransport(runner=fake_runner).gh_graphql("query{ok}", {})
        self.assertEqual(seen["encoding"], "utf-8")
        self.assertEqual(seen["errors"], "strict")

    def test_parse_included_output_variants(self):
        status, headers, body = parse_included_output(
            'HTTP/2.0 201 Created\nRetry-After: 5\nX-RateLimit-Remaining: 0\n\n{"data":{}}')
        self.assertEqual(status, 201)
        self.assertEqual(headers["retry-after"], "5")
        self.assertEqual(json.loads(body), {"data": {}})
        status, headers, body = parse_included_output('{"data":{"plain":true}}')
        self.assertIsNone(status)
        self.assertEqual(json.loads(body)["data"]["plain"], True)

    def test_graphql_errors_even_with_rc0_raises_permanent(self):
        def fake_runner(cmd, **kwargs):
            return subprocess.CompletedProcess(cmd, 0, stdout=
                'HTTP/2.0 200 OK\n\n{"errors":[{"type":"VALIDATION_ERROR",'
                '"message":"Field foo doesn\'t exist"}]}', stderr="")

        transport = GhTransport(runner=fake_runner, sleeper=lambda s: None)
        with self.assertRaises(GraphQLError):
            transport.gh_graphql("query{foo}", {})


class TestRetryClassification(unittest.TestCase):
    def test_429_with_retry_after(self):
        retry, wait, reason = classify_failure(
            rc=1, status=429, headers={"retry-after": "13"}, stderr="rate limited",
            errors=None, now_epoch=1000.0)
        self.assertTrue(retry)
        self.assertEqual(wait, 13.0)
        self.assertIn("retry-after", reason)

    def test_primary_rate_limit_uses_reset_header(self):
        retry, wait, _ = classify_failure(
            rc=1, status=403, headers={"x-ratelimit-remaining": "0", "x-ratelimit-reset": "2000"},
            stderr="GitHub API rate limit exceeded", errors=None, now_epoch=1500.0)
        self.assertTrue(retry)
        self.assertEqual(wait, 501.0)

    def test_5xx_and_transport_retry(self):
        retry, _, reason = classify_failure(
            rc=0, status=502, headers={}, stderr="", errors=None, now_epoch=1.0)
        self.assertTrue(retry, reason)
        retry, _, reason = classify_failure(
            rc=1, status=None, headers={}, stderr="connection reset", errors=None, now_epoch=1.0)
        self.assertTrue(retry, reason)

    def test_rate_limit_error_text_detected(self):
        retry, _, _ = classify_failure(
            rc=0, status=200, headers={}, stderr="",
            errors=[{"message": "You have exceeded a secondary rate limit"}])
        self.assertTrue(retry)

    def test_validation_and_permission_errors_do_not_retry(self):
        cases: list[tuple[dict[str, Any], str]] = [
            (dict(rc=1, status=403, headers={}, stderr="Must have admin rights", errors=None),
             "admin rights"),
            (dict(rc=1, status=401, headers={}, stderr="Bad credentials", errors=None),
             "bad credentials"),
            (dict(rc=1, status=404, headers={}, stderr="Not Found", errors=None),
             "not found"),
            (dict(rc=0, status=200, headers={}, stderr="",
                  errors=[{"type": "VALIDATION_ERROR", "message": "Field x doesn't exist"}]),
             "validation error"),
        ]
        for kwargs, label in cases:
            retry, _, _ = classify_failure(now_epoch=1.0, **kwargs)
            self.assertFalse(retry, label)

    def test_non_idempotent_ambiguous_outcomes_are_permanent(self):
        # M4 at the classifier seam: lost response / any 5xx (even with
        # Retry-After) must NOT be retried for non-idempotent mutations,
        # while explicit "not applied" signals stay retryable.
        retry, _, reason = classify_failure(
            rc=1, status=None, headers={}, stderr="connection reset", errors=None,
            now_epoch=1.0, idempotent=False)
        self.assertFalse(retry)
        self.assertIn("non-idempotent", reason)
        retry, _, _ = classify_failure(
            rc=1, status=502, headers={}, stderr="", errors=None,
            now_epoch=1.0, idempotent=False)
        self.assertFalse(retry)
        retry, _, _ = classify_failure(
            rc=1, status=500, headers={"retry-after": "3"}, stderr="", errors=None,
            now_epoch=1.0, idempotent=False)
        self.assertFalse(retry)  # retry-after must not reopen the duplicate risk
        retry, wait, _ = classify_failure(
            rc=1, status=429, headers={"retry-after": "3"}, stderr="", errors=None,
            now_epoch=1.0, idempotent=False)
        self.assertTrue(retry)  # explicit rejection: request definitely not applied
        self.assertEqual(wait, 3.0)
        retry, _, _ = classify_failure(
            rc=0, status=200, headers={}, stderr="secondary rate limit", errors=None,
            now_epoch=1.0, idempotent=False)
        self.assertTrue(retry)
        # default stays idempotent/retryable for reads, updates and field-creates
        retry, _, _ = classify_failure(
            rc=1, status=502, headers={}, stderr="", errors=None, now_epoch=1.0)
        self.assertTrue(retry)

    def test_backoff_sequence_and_retry_after_respected(self):
        attempts = {"n": 0}

        def fake_runner(cmd, **kwargs):
            attempts["n"] += 1
            if attempts["n"] == 1:
                return subprocess.CompletedProcess(cmd, 1,
                    stdout="HTTP/2.0 502 Bad Gateway\n\n", stderr="server error")
            if attempts["n"] == 2:
                return subprocess.CompletedProcess(cmd, 1,
                    stdout="HTTP/2.0 429 Too Many Requests\nRetry-After: 7\n\n", stderr="slow down")
            return subprocess.CompletedProcess(cmd, 0,
                stdout='HTTP/2.0 200 OK\n\n{"data":{"done":true}}', stderr="")

        slept: list[float] = []
        transport = GhTransport(runner=fake_runner, sleeper=slept.append, rng=lambda: 0.0,
                                min_mutation_gap=0.0)
        data = transport.gh_graphql("query{done}", {}, mutation=True, phase_gap=0.0)
        self.assertEqual(data, {"done": True})
        self.assertEqual(attempts["n"], 3)
        self.assertGreaterEqual(slept[0], 2.0)  # exponential base on 5xx
        self.assertAlmostEqual(slept[-1], 7.0, places=6)  # retry-after honored on last retry


class TestMutationPacing(unittest.TestCase):
    def test_gap_enforced_and_min_floor(self):
        now = {"t": 0.0}
        slept: list[float] = []

        def sleeper(s: float) -> None:
            slept.append(s)
            now["t"] += s

        transport = GhTransport(
            runner=lambda cmd, **kw: subprocess.CompletedProcess(
                cmd, 0, stdout='HTTP/2.0 200 OK\n\n{"data":{}}', stderr=""),
            sleeper=sleeper,
            clock=lambda: now["t"],
            min_mutation_gap=1.0,
        )
        transport.gh_graphql("mutation{a}", {}, mutation=True, phase_gap=8.0)
        transport.gh_graphql("mutation{b}", {}, mutation=True, phase_gap=0.0)
        self.assertAlmostEqual(sum(slept), 1.0)  # floor even for zero phase gap
        slept.clear()
        transport.gh_graphql("mutation{c}", {}, mutation=True, phase_gap=8.0)
        self.assertAlmostEqual(sum(slept), 8.0)


class TestNonIdempotentDraftSafety(unittest.TestCase):
    """M4: single-send semantics for create-style mutations at transport level."""

    def _transport(self, results: list[Any], slept: list[float]):
        attempts = {"n": 0}

        def fake_runner(cmd, **kwargs):
            attempts["n"] += 1
            return results[attempts["n"] - 1]

        transport = GhTransport(runner=fake_runner, sleeper=slept.append,
                                max_retries=3, min_mutation_gap=0.0)
        return transport, attempts

    def test_lost_response_never_retried_when_non_idempotent(self):
        transport, attempts = self._transport(
            [subprocess.CompletedProcess(["gh"], 1, stdout="", stderr="connection reset")] * 4,
            [])
        with self.assertRaises(GraphQLError) as ctx:
            transport.gh_graphql(DRAFT_MUTATION, {"project": "p", "title": "t", "body": "b"},
                                 mutation=True, phase_gap=0.0, idempotent=False)
        self.assertEqual(attempts["n"], 1)  # exactly one send: no duplicate draft risk
        self.assertIn("non-idempotent", str(ctx.exception))

    def test_5xx_never_retried_when_non_idempotent(self):
        transport, attempts = self._transport(
            [subprocess.CompletedProcess(["gh"], 1,
                stdout="HTTP/2.0 502 Bad Gateway\n\n", stderr="bad gateway")] * 4,
            [])
        with self.assertRaises(GraphQLError):
            transport.gh_graphql(DRAFT_MUTATION, {"project": "p", "title": "t", "body": "b"},
                                 mutation=True, phase_gap=0.0, idempotent=False)
        self.assertEqual(attempts["n"], 1)

    def test_idempotent_update_still_retries_5xx(self):
        results = [
            subprocess.CompletedProcess(["gh"], 1,
                stdout="HTTP/2.0 500 Internal Server Error\n\n", stderr="boom"),
            subprocess.CompletedProcess(["gh"], 0, stdout=
                'HTTP/2.0 200 OK\n\n{"data":{"updateProjectV2ItemFieldValue":'
                '{"projectV2Item":{"id":"I1"}}}}', stderr=""),
        ]
        slept: list[float] = []
        transport, attempts = self._transport(results, slept)
        data = transport.gh_graphql(UPDATE_MUTATION, {"project": "p", "item": "I1",
                                                      "field": "f", "option": "o"},
                                    mutation=True, phase_gap=0.0)
        self.assertEqual(data["updateProjectV2ItemFieldValue"]["projectV2Item"]["id"], "I1")
        self.assertEqual(attempts["n"], 2)
        self.assertTrue(slept)  # real backoff happened between the two sends

    def test_idempotent_field_create_still_retries_rate_limit(self):
        results = [
            subprocess.CompletedProcess(["gh"], 1, stdout=
                "HTTP/2.0 429 Too Many Requests\nRetry-After: 3\n\n", stderr="slow down"),
            subprocess.CompletedProcess(["gh"], 0, stdout=
                'HTTP/2.0 200 OK\n\n{"data":{"createProjectV2Field":'
                '{"projectV2Field":{"id":"F"}}}}', stderr=""),
        ]
        slept: list[float] = []
        transport, attempts = self._transport(results, slept)
        data = transport.gh_graphql(CREATE_FIELD_MUTATION,
                                    {"project": "p", "name": "Category", "options": []},
                                    mutation=True, phase_gap=0.0)
        self.assertIn("createProjectV2Field", data)
        self.assertEqual(attempts["n"], 2)
        self.assertIn(3.0, slept)  # honored Retry-After


class _ReconcileBase(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.state_path = Path(self.tmp.name) / "checkpoint.json"
        self.logger = ProgressLogger(None)


class TestReconciliation(_ReconcileBase):
    def _nodes(self, entry, item_id, option=None, body=None):
        node = {
            "id": item_id,
            "type": "DRAFT_ISSUE",
            "content": {"title": entry.title, "body": body or entry.draft_body},
            "fieldValueByName": {"optionId": option} if option else None,
        }
        return node

    def test_adopts_created_and_category_updated(self):
        entry = make_entry(start=3, title="Adopt me")
        transport = FakeTransport(items_pages=[
            self._nodes(entry, "PVTI_9", option="OPT0"),
            {"id": "X1", "type": "ISSUE", "content": None, "fieldValueByName": None},
        ])
        state = empty_state("PVT_test")
        stats = reconcile([entry], state, transport,
                          category_field_name="Category",
                          options_by_file={entry.filename: "OPT0"},
                          logger=self.logger)
        self.assertEqual(stats["adopted"], 1)
        self.assertEqual(stats["category_marked"], 1)
        rec = state["items"][entry.item_key]
        self.assertTrue(rec["draft_created"] and rec["category_updated"])
        self.assertEqual(rec["project_item_id"], "PVTI_9")

    def test_duplicate_remote_items_reported_not_deleted(self):
        entry = make_entry(start=4, title="Twice")
        transport = FakeTransport(items_pages=[
            self._nodes(entry, "PVTI_A"), self._nodes(entry, "PVTI_B"),
        ])
        state = empty_state("PVT_test")
        stats = reconcile([entry], state, transport, category_field_name="Category",
                          options_by_file={}, logger=self.logger)
        self.assertEqual(stats["duplicates"][entry.item_key], ["PVTI_A", "PVTI_B"])
        self.assertEqual(state["items"][entry.item_key]["project_item_id"], "PVTI_A")

    def test_header_fallback_when_no_import_key_line(self):
        entry = make_entry(filename="02-hosting-types.md", start=11, title="Legacy Body")
        legacy = entry.draft_body.replace(f"Import key: {entry.item_key}\n", "")
        transport = FakeTransport(items_pages=[self._nodes(entry, "PVTI_L", body=legacy)])
        state = empty_state("PVT_test")
        stats = reconcile([entry], state, transport, category_field_name="Category",
                          options_by_file={}, logger=self.logger)
        self.assertEqual(stats["adopted"], 1)

    def test_stale_checkpoint_records_are_reset_for_recreation(self):
        # M3: checkpoint claims a draft that is gone from the board (deleted
        # remotely). Reset all three fields; invariant must still validate.
        # allow_stale_reset=True is required here because this fixture has zero
        # remote matches, which the blast-radius guard would otherwise block.
        entry = make_entry(start=12, title="Deleted remotely")
        state = empty_state("PVT_test")
        state["items"][entry.item_key] = {"draft_created": True,
                                          "project_item_id": "PVTI_DEAD",
                                          "category_updated": True}
        transport = FakeTransport(items_pages=[])
        with contextlib.redirect_stdout(io.StringIO()) as out:
            stats = reconcile([entry], state, transport, category_field_name="Category",
                              options_by_file={entry.filename: "OPT0"}, logger=self.logger,
                              allow_stale_reset=True)
        self.assertEqual(stats["missing_from_remote"], [entry.item_key])
        self.assertFalse(stats["stale_reset_blocked"])
        self.assertEqual(state["items"][entry.item_key],
                         {"draft_created": False, "project_item_id": None,
                          "category_updated": False})
        self.assertIn("RESET_STALE", out.getvalue())
        validate_state(state, "PVT_test")  # no draft_created-without-id violation

    def test_remote_option_drift_unsets_category_flag_for_repair(self):
        # minor: expected option exists on the board but differs from what the
        # checkpoint believes was applied -> queue repair on next execute.
        entry = make_entry(start=44, title="Drifted")
        state = empty_state("PVT_test")
        state["items"][entry.item_key] = {"draft_created": True,
                                          "project_item_id": "PVTI_D",
                                          "category_updated": True}
        transport = FakeTransport(items_pages=[
            self._nodes(entry, "PVTI_D", option="OPT_WRONG")])
        with contextlib.redirect_stdout(io.StringIO()) as out:
            stats = reconcile([entry], state, transport, category_field_name="Category",
                              options_by_file={entry.filename: "OPT0"}, logger=self.logger)
        self.assertEqual(stats["category_drift_reset"], 1)
        self.assertFalse(state["items"][entry.item_key]["category_updated"])
        self.assertTrue(state["items"][entry.item_key]["draft_created"])
        self.assertIn("DRIFT", out.getvalue())


class TestExecutePhases(_ReconcileBase):
    EXPECTED = {"00-foundations.md": 2}

    def _args_with_options(self):
        opts_path = write_options(Path(self.tmp.name) / "options.json",
                                  {"00-foundations.md": "OPT0"})
        # validate_category_options requires all 11 files:
        full = {name: f"OPT{i}" for i, name in enumerate(CATEGORY_FILES)}
        opts_path.write_text(json.dumps(full), encoding="utf-8")
        return opts_path

    def test_execute_aborts_on_count_mismatch_before_any_call(self):
        transport = FakeTransport()
        args = exec_args(category_options=str(self._args_with_options()))
        rc = execute([make_entry(start=1)], args, self.state_path, transport,
                     self.logger, expected={"00-foundations.md": 9})
        self.assertEqual(rc, 1)
        self.assertEqual(transport.calls, [])

    def test_execute_requires_field_and_options(self):
        transport = FakeTransport()
        rc = execute([make_entry()], exec_args(category_options=None),
                     self.state_path, transport, self.logger, expected=self.EXPECTED)
        self.assertEqual(rc, 1)
        rc = execute([make_entry()], exec_args(category_field_id=None,
                     category_options=str(self._args_with_options())),
                     self.state_path, transport, self.logger, expected=self.EXPECTED)
        self.assertEqual(rc, 1)
        self.assertEqual(transport.calls, [])

    def test_resume_created_before_update_never_recreates(self):
        entry = make_entry(start=5, title="Old draft")
        state = empty_state("PVT_test")
        state["items"][entry.item_key] = {"draft_created": True,
                                          "project_item_id": "PVTI_EXIST",
                                          "category_updated": False}
        save_checkpoint(self.state_path, state)

        def updater(query, variables):
            self.assertEqual(variables["item"], "PVTI_EXIST")
            return {"updateProjectV2ItemFieldValue": {"projectV2Item": {"id": "PVTI_EXIST"}}}

        # The draft genuinely exists on the board (post-M3, a created record
        # missing from the remote would be reset and recreated instead).
        existing_node = {"id": "PVTI_EXIST", "type": "DRAFT_ISSUE",
                         "content": {"title": entry.title, "body": entry.draft_body},
                         "fieldValueByName": None}
        transport = FakeTransport(responses={
            "updateProjectV2ItemFieldValue": updater,
            "items(first": items_response([existing_node]),
            "fields(first": category_field_response(),
        })
        args = exec_args(category_options=str(self._args_with_options()))
        rc = execute([entry], args, self.state_path, transport, self.logger,
                     expected={"00-foundations.md": 1})
        self.assertEqual(rc, 0)
        joined = "\n".join(t["query"] for t in transport.calls)
        self.assertNotIn("addProjectV2DraftIssue", joined)
        self.assertIn("updateProjectV2ItemFieldValue", joined)
        final = load_checkpoint(self.state_path, "PVT_test")
        self.assertTrue(final["items"][entry.item_key]["category_updated"])

    def test_full_run_creates_then_updates_and_persists_ids(self):
        e1 = make_entry(start=21, title="First")
        e2 = make_entry(start=29, title="Second")
        counter = {"n": 0}

        def draft_response(query, variables):
            counter["n"] += 1
            return {"addProjectV2DraftIssue": {"projectItem": {"id": f"PVTI_{counter['n']}"}}}

        transport = FakeTransport(responses={
            "addProjectV2DraftIssue": draft_response,
            "updateProjectV2ItemFieldValue": lambda q, v: {
                "updateProjectV2ItemFieldValue": {"projectV2Item": {"id": v["item"]}}},
            "items(first": project_node({"items": {"pageInfo": {
                "hasNextPage": False, "endCursor": None}, "nodes": []}}),
            "fields(first": category_field_response(),
        })
        args = exec_args(category_options=str(self._args_with_options()))
        rc = execute([e1, e2], args, self.state_path, transport, self.logger,
                     expected={"00-foundations.md": 2})
        self.assertEqual(rc, 0)
        final = load_checkpoint(self.state_path, "PVT_test")
        self.assertEqual(final["items"][e1.item_key]["project_item_id"], "PVTI_1")
        self.assertTrue(final["items"][e2.item_key]["category_updated"])
        # phases: both drafts created before the first field update
        kinds = ["D" if "addProjectV2DraftIssue" in t["query"] else "U"
                 for t in transport.calls if "mutation" in t["query"]]
        self.assertEqual(kinds[:2], ["D", "D"])
        self.assertTrue(all(k == "U" for k in kinds[2:]))
        # M4: drafts flagged non-idempotent, updates left idempotent.
        drafts = [t for t in transport.calls if "addProjectV2DraftIssue" in t["query"]]
        updates = [t for t in transport.calls if "updateProjectV2ItemFieldValue" in t["query"]]
        self.assertTrue(drafts and all(t["idempotent"] is False for t in drafts))
        self.assertTrue(updates and all(t["idempotent"] is True for t in updates))

    def test_chunking_caps_respected(self):
        entries = [make_entry(start=100 + i, title=f"Item {i}") for i in range(5)]
        transport = FakeTransport(responses={
            "addProjectV2DraftIssue": lambda q, v: {"addProjectV2DraftIssue": {
                "projectItem": {"id": "PVTI_" + v["title"]}}},
            "updateProjectV2ItemFieldValue": lambda q, v: {"updateProjectV2ItemFieldValue": {
                "projectV2Item": {"id": v["item"]}}},
            "items(first": project_node({"items": {"pageInfo": {
                "hasNextPage": False, "endCursor": None}, "nodes": []}}),
            "fields(first": category_field_response(),
        })
        args = exec_args(category_options=str(self._args_with_options()),
                         max_draft_creates=2, max_field_updates=1)
        rc = execute(entries, args, self.state_path, transport, self.logger,
                     expected={"00-foundations.md": 5})
        self.assertEqual(rc, 0)
        drafts = [t for t in transport.calls if "addProjectV2DraftIssue" in t["query"]]
        updates = [t for t in transport.calls if "updateProjectV2ItemFieldValue" in t["query"]]
        self.assertEqual(len(drafts), 2)
        self.assertEqual(len(updates), 1)
        final = load_checkpoint(self.state_path, "PVT_test")
        self.assertEqual(sum(1 for r in final["items"].values() if r["draft_created"]), 2)
        self.assertEqual(sum(1 for r in final["items"].values() if r["category_updated"]), 1)

    def test_execute_aborts_when_mapped_option_absent_from_field(self):
        # M2: option ids in the mapping must belong to the target field;
        # abort before any mutation reaches the board.
        entry = make_entry(start=31, title="Orphan option")
        transport = FakeTransport(responses={
            "fields(first": category_field_response(
                option_ids=[f"WRONG{i}" for i in range(len(CATEGORY_FILES))]),
        })
        args = exec_args(category_options=str(self._args_with_options()))
        with contextlib.redirect_stderr(io.StringIO()) as err:
            rc = execute([entry], args, self.state_path, transport, self.logger,
                         expected={"00-foundations.md": 1})
        self.assertEqual(rc, 1)
        self.assertTrue(all(not call["mutation"] for call in transport.calls))
        self.assertIn("ABORT", err.getvalue())
        self.assertFalse(self.state_path.exists())

    def test_execute_recreates_draft_deleted_remotely(self):
        # M3 end-to-end: stale created record is reset by the reconcile pass, so
        # this same run recreates the draft (fresh id) and re-categorizes it.
        # allow_stale_reset=True is required: the fixture's board is empty
        # (zero matches), which the blast-radius guard blocks by default.
        entry = make_entry(start=13, title="Ghost draft")
        state = empty_state("PVT_test")
        state["items"][entry.item_key] = {"draft_created": True,
                                          "project_item_id": "PVTI_GONE",
                                          "category_updated": True}
        save_checkpoint(self.state_path, state)
        transport = FakeTransport(responses={
            "addProjectV2DraftIssue": lambda q, v: {"addProjectV2DraftIssue": {
                "projectItem": {"id": "PVTI_NEW"}}},
            "updateProjectV2ItemFieldValue": lambda q, v: {
                "updateProjectV2ItemFieldValue": {"projectV2Item": {"id": v["item"]}}},
            "items(first": items_response([]),
            "fields(first": category_field_response(),
        })
        args = exec_args(category_options=str(self._args_with_options()),
                         allow_stale_reset=True)
        with contextlib.redirect_stdout(io.StringIO()):
            rc = execute([entry], args, self.state_path, transport, self.logger,
                         expected={"00-foundations.md": 1})
        self.assertEqual(rc, 0)
        self.assertIn("addProjectV2DraftIssue", transport.queries())
        final = load_checkpoint(self.state_path, "PVT_test")
        self.assertEqual(final["items"][entry.item_key],
                         {"draft_created": True, "project_item_id": "PVTI_NEW",
                          "category_updated": True})

    def test_execute_repairs_remote_drift_detected_by_reconcile(self):
        # minor end-to-end: drift resets the flag, phase B re-applies the
        # expected option to the existing item.
        entry = make_entry(start=45, title="Drift repair")
        state = empty_state("PVT_test")
        state["items"][entry.item_key] = {"draft_created": True,
                                          "project_item_id": "PVTI_D",
                                          "category_updated": True}
        save_checkpoint(self.state_path, state)
        node = {"id": "PVTI_D", "type": "DRAFT_ISSUE",
                "content": {"title": entry.title, "body": entry.draft_body},
                "fieldValueByName": {"optionId": "STALE_OPT", "name": "Stale"}}
        transport = FakeTransport(responses={
            "items(first": items_response([node]),
            "fields(first": category_field_response(),
            "updateProjectV2ItemFieldValue": lambda q, v: {
                "updateProjectV2ItemFieldValue": {"projectV2Item": {"id": v["item"]}}},
        })
        args = exec_args(category_options=str(self._args_with_options()))
        with contextlib.redirect_stdout(io.StringIO()):
            rc = execute([entry], args, self.state_path, transport, self.logger,
                         expected={"00-foundations.md": 1})
        self.assertEqual(rc, 0)
        updates = [t for t in transport.calls if "updateProjectV2ItemFieldValue" in t["query"]]
        self.assertEqual(len(updates), 1)
        self.assertEqual(updates[0]["variables"]["item"], "PVTI_D")
        self.assertEqual(updates[0]["variables"]["option"], "OPT0")
        self.assertNotIn("addProjectV2DraftIssue", transport.queries())


class TestPrepareCategoryField(_ReconcileBase):
    def _field_nodes(self, with_options=True):
        options = [{"id": f"OPT{i}", "name": name} for i, name in enumerate(CATEGORY_FILES)]
        field: dict[str, Any] = {"__typename": "ProjectV2SingleSelectField",
                                 "id": "F_new", "name": "Category"}
        if with_options:
            field["options"] = options
        return project_node({"fields": {"pageInfo": {"hasNextPage": False, "endCursor": None},
                                        "nodes": [field]}})

    def test_existing_field_reused_no_create_no_drafts(self):
        out = Path(self.tmp.name) / "map.json"
        transport = FakeTransport(responses={"fields(first": self._field_nodes()})
        args = argparse.Namespace(project_id="PVT_test", category_options_output=out,
                                  draft_create_interval=0.0)
        rc = prepare_category_field(args, transport, self.logger)
        self.assertEqual(rc, 0)
        joined = "\n".join(t["query"] for t in transport.calls)
        self.assertNotIn("createProjectV2Field", joined)
        self.assertNotIn("addProjectV2DraftIssue", joined)
        mapping = json.loads(out.read_text(encoding="utf-8"))
        self.assertEqual(len(mapping), 11)
        self.assertEqual(mapping[CATEGORY_FILES[-1]], "OPT10")

    def test_missing_field_created_once_verified_and_nonidempotent(self):
        out = Path(self.tmp.name) / "map.json"
        created, reads = {"n": 0}, {"n": 0}

        def create_response(query, variables):
            created["n"] += 1
            self.assertEqual(variables["name"], "Category")
            self.assertEqual([o["name"] for o in variables["options"]], CATEGORY_FILES)
            self.assertTrue(all(o["color"] == "GRAY" for o in variables["options"]))
            self.assertTrue(all(o["description"] == o["name"] for o in variables["options"]))
            return {"createProjectV2Field": {"projectV2Field": {
                "__typename": "ProjectV2SingleSelectField", "id": "F_new",
                "options": [{"id": f"OPT{i}", "name": o["name"]}
                            for i, o in enumerate(variables["options"])]}}}

        def fields_response(query, variables):
            reads["n"] += 1
            if reads["n"] == 1:
                return project_node({"fields": {"pageInfo": {
                    "hasNextPage": False, "endCursor": None}, "nodes": []}})
            return self._field_nodes()  # board after creation: exactly one Category field

        transport = FakeTransport(responses={
            "fields(first": fields_response,
            "createProjectV2Field": create_response,
        })
        args = argparse.Namespace(project_id="PVT_test", category_options_output=out,
                                  draft_create_interval=0.0)
        rc = prepare_category_field(args, transport, self.logger)
        self.assertEqual(rc, 0)
        self.assertEqual(created["n"], 1)
        self.assertEqual(reads["n"], 2)  # initial read + post-create verification read
        mapping = json.loads(out.read_text(encoding="utf-8"))
        self.assertEqual(len(mapping), 11)
        create_calls = [c for c in transport.calls if "createProjectV2Field" in c["query"]]
        self.assertEqual(len(create_calls), 1)
        self.assertFalse(create_calls[0]["idempotent"])  # create must never blind-retry

    def test_existing_field_missing_options_aborts(self):
        out = Path(self.tmp.name) / "map.json"
        transport = FakeTransport(responses={"fields(first": self._field_nodes(with_options=False)})
        args = argparse.Namespace(project_id="PVT_test", category_options_output=out,
                                  draft_create_interval=0.0)
        rc = prepare_category_field(args, transport, self.logger)
        self.assertEqual(rc, 3)
        self.assertFalse(out.exists())

    def test_duplicate_category_fields_abort_instead_of_guessing(self):
        out = Path(self.tmp.name) / "map.json"
        options = [{"id": f"OPT{i}", "name": name} for i, name in enumerate(CATEGORY_FILES)]
        twin = {"__typename": "ProjectV2SingleSelectField", "name": "Category",
                "options": options}
        nodes = [dict(twin, id="F_first"), dict(twin, id="F_second")]
        transport = FakeTransport(responses={
            "fields(first": project_node({"fields": {"pageInfo": {
                "hasNextPage": False, "endCursor": None}, "nodes": nodes}})})
        args = argparse.Namespace(project_id="PVT_test", category_options_output=out,
                                  draft_create_interval=0.0)
        with contextlib.redirect_stderr(io.StringIO()) as err:
            rc = prepare_category_field(args, transport, self.logger)
        self.assertEqual(rc, 3)
        self.assertIn("refusing to pick one", err.getvalue())
        self.assertNotIn("createProjectV2Field", transport.queries())
        self.assertFalse(out.exists())


class TestC1DryRunNeverTouchesGh(unittest.TestCase):
    def test_mutually_exclusive_modes_rejected(self):
        parser = build_parser()
        with self.assertRaises(SystemExit):
            parser.parse_args(["--dry-run", "--execute"])
        with self.assertRaises(SystemExit):
            parser.parse_args(["--execute", "--prepare-category-field"])

    def test_parse_only_run_never_invokes_gh_graphql_or_subprocess(self):
        with tempfile.TemporaryDirectory() as tmp:
            src = Path(tmp) / "master"
            src.mkdir()
            for name in CATEGORY_FILES:
                (src / name).write_text("### only entry\nbody\n", encoding="utf-8")
            tripwire_calls: list[str] = []

            def tripwire_subprocess(*a, **k):
                tripwire_calls.append("subprocess.run")
                raise AssertionError("dry-run must not spawn subprocesses")

            def tripwire_post(*a, **k):
                tripwire_calls.append("gh_graphql")
                raise AssertionError("dry-run must not call gh_graphql")

            original_run, original_post = subprocess.run, GhTransport.gh_graphql
            subprocess.run, GhTransport.gh_graphql = tripwire_subprocess, tripwire_post
            try:
                with contextlib.redirect_stdout(io.StringIO()), \
                        contextlib.redirect_stderr(io.StringIO()):
                    rc = main(["--dry-run", "--src", str(src)])
                    rc2 = main(["--src", str(src)])  # default mode = no flags
            finally:
                subprocess.run, GhTransport.gh_graphql = original_run, original_post
            self.assertIn(rc, (0, 2))  # fixture counts mismatch expectations -> 2 ok
            self.assertIn(rc2, (0, 2))
            self.assertEqual(tripwire_calls, [])

    def test_execute_mode_constructs_transport_without_network_calls_here(self):
        # sanity that dry-run path also cannot reach execute(): integrity gate blocks.
        transport = FakeTransport()
        with tempfile.TemporaryDirectory() as tmp:
            args = exec_args(category_options=None)
            rc = execute([], args, Path(tmp) / "cp.json", transport, ProgressLogger(None),
                         expected={"00-foundations.md": 1})
            self.assertEqual(rc, 1)
            self.assertEqual(transport.calls, [])


class TestReportExitCode(unittest.TestCase):
    def test_report_nonzero_on_issues(self):
        with tempfile.TemporaryDirectory() as tmp:
            with contextlib.redirect_stdout(io.StringIO()):
                rc = report([], Path(tmp), DRAFT_BODY_CHAR_LIMIT)
            self.assertNotEqual(rc, 0)


class TestReconcileConfigGuards(unittest.TestCase):
    def test_reconcile_aborts_cleanly_on_malformed_options_json(self):
        # Minor: bad/missing category-options must print ABORT (no traceback)
        # and never reach gh; the tripwire guarantees no subprocess is spawned.
        with tempfile.TemporaryDirectory() as tmp:
            src = Path(tmp) / "master"
            src.mkdir()
            for name in CATEGORY_FILES:
                (src / name).write_text("### one\nbody\n", encoding="utf-8")
            bad_opts = Path(tmp) / "opts.json"
            bad_opts.write_text("{not valid json", encoding="utf-8")
            tripwires: list[str] = []

            def tripwire_run(*a, **k):
                tripwires.append("subprocess.run")
                raise AssertionError("config abort must not spawn gh")

            original = subprocess.run
            subprocess.run = tripwire_run
            try:
                with contextlib.redirect_stdout(io.StringIO()), \
                        contextlib.redirect_stderr(io.StringIO()) as err:
                    # --state in tmp: remote mode takes "<state>.lock"; never let
                    # a test create files next to the real default checkpoint path.
                    rc = main(["--reconcile", "--src", str(src),
                               "--state", str(Path(tmp) / "cp.json"),
                               "--category-field-id", "F_cat",
                               "--category-options", str(bad_opts)])
            finally:
                subprocess.run = original
        self.assertNotEqual(rc, 0)
        self.assertIn("ABORT: category options invalid for reconcile", err.getvalue())
        self.assertEqual(tripwires, [])


# --------------------------------------------------------------------------
# Hardening regression tests: fail-loud pagination, blast radius, locking
# --------------------------------------------------------------------------

class _ScriptedTransport:
    """Replies queued in call order; records every (query, variables) pair."""

    def __init__(self, replies: list[Any]) -> None:  # noqa: D401
        self.replies = list(replies)
        self.calls: list[dict[str, Any]] = []

    def gh_graphql(self, query: str, variables: dict[str, Any], *,
                   mutation: bool = False, phase_gap: float = 0.0,
                   idempotent: bool = True) -> dict[str, Any]:
        self.calls.append({"query": query, "variables": dict(variables)})
        if not self.replies:
            raise AssertionError("_ScriptedTransport: reply queue exhausted")
        reply = self.replies.pop(0)
        assert isinstance(reply, dict)
        return reply


def _fields_page(nodes: list[dict[str, Any]], has_next: bool = False,
                 end_cursor: str | None = None) -> dict[str, Any]:
    return project_node({"fields": {
        "pageInfo": {"hasNextPage": has_next, "endCursor": end_cursor},
        "nodes": nodes}})


class TestPaginateFailLoud(unittest.TestCase):
    """An anomalous response must never masquerade as a successful (empty) page:
    only a ProjectV2 node carrying a connection with an explicit `nodes` list
    is trusted."""

    def test_null_node_raises(self):
        transport = _ScriptedTransport([{"node": None}])
        with self.assertRaises(GraphQLError):
            list_project_fields(transport, "PVT_x")

    def test_missing_node_raises(self):
        transport = _ScriptedTransport([{}])
        with self.assertRaises(GraphQLError):
            list_project_items(transport, "PVT_x", "Category")

    def test_non_project_v2_node_raises(self):
        # node(id:) resolving to any other type means the inline fragment
        # selected nothing; the missing connection must NOT read as "empty board".
        transport = _ScriptedTransport(
            [{"node": {"__typename": "Repository", "id": "R_1"}}])
        with self.assertRaises(GraphQLError) as ctx:
            list_project_fields(transport, "PVT_x")
        self.assertIn("not 'ProjectV2'", str(ctx.exception))
        transport = _ScriptedTransport(
            [{"node": {"__typename": "Issue", "id": "I_1"}}])
        with self.assertRaises(GraphQLError):
            list_project_items(transport, "PVT_x", "Category")

    def test_node_missing_typename_raises(self):
        transport = _ScriptedTransport([{"node": {"fields": {
            "pageInfo": {"hasNextPage": False, "endCursor": None},
            "nodes": []}}}])
        with self.assertRaises(GraphQLError):
            list_project_fields(transport, "PVT_x")

    def test_null_connection_raises(self):
        transport = _ScriptedTransport(
            [project_node({"fields": None})])
        with self.assertRaises(GraphQLError):
            list_project_fields(transport, "PVT_x")

    def test_missing_nodes_key_raises(self):
        transport = _ScriptedTransport(
            [project_node({"fields": {"pageInfo": {"hasNextPage": False}}})])
        with self.assertRaises(GraphQLError):
            list_project_fields(transport, "PVT_x")

    def test_non_list_nodes_raises(self):
        transport = _ScriptedTransport(
            [project_node({"fields": {"nodes": {"oops": "dict"},
                                      "pageInfo": {"hasNextPage": False}}})])
        with self.assertRaises(GraphQLError):
            list_project_fields(transport, "PVT_x")

    def test_non_object_node_raises(self):
        transport = _ScriptedTransport(
            [project_node({"items": {"nodes": [None],
                                     "pageInfo": {"hasNextPage": False}}})])
        with self.assertRaises(GraphQLError):
            list_project_items(transport, "PVT_x", "Category")

    def test_malformed_page_info_raises(self):
        transport = _ScriptedTransport(
            [project_node({"fields": {"nodes": [], "pageInfo": "broken"}})])
        with self.assertRaises(GraphQLError):
            list_project_fields(transport, "PVT_x")

    def test_explicit_empty_nodes_succeeds(self):
        transport = _ScriptedTransport([_fields_page([])])
        self.assertEqual(list_project_fields(transport, "PVT_x"), [])

    def test_has_next_without_cursor_raises(self):
        transport = _ScriptedTransport(
            [_fields_page([{"id": "F1"}], has_next=True, end_cursor=None)])
        with self.assertRaises(GraphQLError):
            list_project_fields(transport, "PVT_x")

    def test_multi_page_pagination_walks_cursors(self):
        transport = _ScriptedTransport([
            _fields_page([{"id": "F1", "name": "One"}], has_next=True, end_cursor="CUR1"),
            _fields_page([{"id": "F2", "name": "Two"}]),
        ])
        fields = list_project_fields(transport, "PVT_x")
        self.assertEqual([f["id"] for f in fields], ["F1", "F2"])
        self.assertIsNone(transport.calls[0]["variables"]["after"])
        self.assertEqual(transport.calls[1]["variables"]["after"], "CUR1")
        self.assertEqual(len(transport.calls), 2)

    def test_fields_query_uses_node_root_not_project_v2(self):
        # Regression for the live failure: this endpoint exposes no root
        # `projectV2` query; every project read must go through node(id:).
        self.assertIn("node(id:$project)", FIELDS_QUERY)
        self.assertNotIn("projectV2(id:", FIELDS_QUERY)
        self.assertIn("... on ProjectV2{", FIELDS_QUERY)
        self.assertIn("node(id:$project)", ITEMS_QUERY)
        self.assertNotIn("projectV2(id:", ITEMS_QUERY)
        self.assertIn("... on ProjectV2{", ITEMS_QUERY)

    def test_multi_page_items_pagination_walks_cursors_via_node(self):
        page1 = project_node({"items": {
            "pageInfo": {"hasNextPage": True, "endCursor": "ICUR1"},
            "nodes": [{"id": "PVTI_1", "type": "DRAFT_ISSUE",
                       "content": {"title": "One", "body": "b1"},
                       "fieldValueByName": None}]}})
        page2 = project_node({"items": {
            "pageInfo": {"hasNextPage": False, "endCursor": None},
            "nodes": [{"id": "PVTI_2", "type": "DRAFT_ISSUE",
                       "content": {"title": "Two", "body": "b2"},
                       "fieldValueByName": {"optionId": "OPT0", "name": "Cat"}}]}})
        transport = _ScriptedTransport([page1, page2])
        items = list_project_items(transport, "PVT_x", "Category")
        self.assertEqual([i["id"] for i in items], ["PVTI_1", "PVTI_2"])
        self.assertEqual(items[1]["content"]["title"], "Two")
        self.assertEqual(items[1]["fieldValueByName"]["optionId"], "OPT0")
        self.assertEqual(transport.calls[1]["variables"]["after"], "ICUR1")
        self.assertIn("node(id:$project)", transport.calls[0]["query"])


class TestStaleResetGuardDecision(unittest.TestCase):
    """Pure boundary table for evaluate_stale_reset_guard."""

    def _guard(self, *, remote_matched, total_created, reset_count, allow=False):
        return evaluate_stale_reset_guard(
            remote_matched=remote_matched, total_created=total_created,
            reset_count=reset_count, allow_stale_reset=allow)

    def test_nothing_to_reset_is_always_safe(self):
        self.assertIsNone(self._guard(remote_matched=0, total_created=0, reset_count=0))
        self.assertIsNone(self._guard(remote_matched=7, total_created=7, reset_count=0))

    def test_zero_match_with_created_records_blocks_even_one_record(self):
        reason = self._guard(remote_matched=0, total_created=1, reset_count=1)
        self.assertIsNotNone(reason)
        self.assertIn("zero project drafts matched", reason or "")

    def test_exactly_five_percent_allowed_but_one_record_over_blocks(self):
        self.assertIsNone(self._guard(remote_matched=95, total_created=100, reset_count=5))
        self.assertIsNone(self._guard(remote_matched=19, total_created=20, reset_count=1))
        reason = self._guard(remote_matched=94, total_created=100, reset_count=6)
        self.assertIsNotNone(reason)
        self.assertIn("blast-radius limit", reason or "")

    def test_flag_overrides_every_rule(self):
        self.assertIsNone(self._guard(remote_matched=0, total_created=3907,
                                      reset_count=3907, allow=True))
        self.assertIsNone(self._guard(remote_matched=1, total_created=20,
                                      reset_count=19, allow=True))


class TestStaleResetReconcileWiring(_ReconcileBase):
    """The guard must gate the actual reset loop inside reconcile()."""

    def _board(self, total: int, matched: int):
        entries = [make_entry(start=600 + i, title=f"Blast {i}") for i in range(total)]
        state = empty_state("PVT_test")
        for entry in entries:
            state["items"][entry.item_key] = {
                "draft_created": True,
                "project_item_id": f"PVTI_{entry.start}",
                "category_updated": True}
        nodes = [{"id": f"PVTI_{e.start}", "type": "DRAFT_ISSUE",
                  "content": {"title": e.title, "body": e.draft_body},
                  "fieldValueByName": None} for e in entries[:matched]]
        return entries, state, nodes

    @staticmethod
    def _reset_count(state: dict[str, Any], entries: list[Entry]) -> int:
        return sum(1 for e in entries if not state["items"][e.item_key]["draft_created"])

    def test_mass_reset_blocked_by_default_keeps_records_intact(self):
        entries, state, nodes = self._board(total=4, matched=1)  # 3/4 = 75% missing
        transport = FakeTransport(items_pages=nodes)
        with contextlib.redirect_stdout(io.StringIO()), \
                contextlib.redirect_stderr(io.StringIO()) as err:
            stats = reconcile(entries, state, transport, category_field_name="Category",
                              options_by_file={}, logger=self.logger)
        self.assertTrue(stats["stale_reset_blocked"])
        self.assertIn("blast radius", err.getvalue().lower())
        self.assertEqual(self._reset_count(state, entries), 0)
        self.assertEqual([c["mutation"] for c in transport.calls].count(True), 0)

    def test_mass_reset_proceeds_with_allow_flag(self):
        entries, state, nodes = self._board(total=4, matched=1)
        transport = FakeTransport(items_pages=nodes)
        with contextlib.redirect_stdout(io.StringIO()):
            stats = reconcile(entries, state, transport, category_field_name="Category",
                              options_by_file={}, logger=self.logger,
                              allow_stale_reset=True)
        self.assertFalse(stats["stale_reset_blocked"])
        self.assertEqual(self._reset_count(state, entries), 3)

    def test_within_five_percent_allowed_and_persists(self):
        # 1 of 20 created records vanished = exactly 5% -> auto-allowed; the
        # reset must survive a save/load round-trip.
        entries, state, nodes = self._board(total=20, matched=19)
        transport = FakeTransport(items_pages=nodes)
        with contextlib.redirect_stdout(io.StringIO()):
            stats = reconcile(entries, state, transport, category_field_name="Category",
                              options_by_file={}, logger=self.logger)
        self.assertFalse(stats["stale_reset_blocked"])
        self.assertEqual(stats["missing_from_remote"], [entries[-1].item_key])
        self.assertEqual(state["items"][entries[-1].item_key], new_item_record())
        save_checkpoint(self.state_path, state)
        reloaded = load_checkpoint(self.state_path, "PVT_test")
        self.assertEqual(reloaded["items"][entries[-1].item_key], new_item_record())
        self.assertTrue(all(reloaded["items"][e.item_key]["draft_created"]
                            for e in entries[:19]))


class TestStaleResetBlastRadiusInExecute(_ReconcileBase):
    def test_zero_match_aborts_execute_before_mutation_or_save(self):
        entries = [make_entry(start=701, title="Ghost A"),
                   make_entry(start=709, title="Ghost B")]
        state = empty_state("PVT_test")
        for entry in entries:
            state["items"][entry.item_key] = {"draft_created": True,
                                              "project_item_id": f"PVTI_{entry.start}",
                                              "category_updated": True}
        save_checkpoint(self.state_path, state)
        opts_path = Path(self.tmp.name) / "options.json"
        opts_path.write_text(json.dumps(
            {name: f"OPT{i}" for i, name in enumerate(CATEGORY_FILES)}), encoding="utf-8")
        transport = FakeTransport(responses={
            "items(first": items_response([]),
            "fields(first": category_field_response(),
        })
        args = exec_args(category_options=str(opts_path))  # allow_stale_reset defaults False
        with contextlib.redirect_stdout(io.StringIO()), \
                contextlib.redirect_stderr(io.StringIO()) as err:
            rc = execute(entries, args, self.state_path, transport, self.logger,
                         expected={"00-foundations.md": 2})
        self.assertEqual(rc, 1)
        self.assertEqual([c for c in transport.calls if c["mutation"]], [])
        self.assertNotIn("addProjectV2DraftIssue", transport.queries())
        self.assertIn("blast radius", err.getvalue().lower())
        reloaded = load_checkpoint(self.state_path, "PVT_test")
        for entry in entries:  # disk state untouched: still marked created
            rec = reloaded["items"][entry.item_key]
            self.assertTrue(rec["draft_created"])
            self.assertEqual(rec["project_item_id"], f"PVTI_{entry.start}")


class TestRemoteLock(unittest.TestCase):
    """Concurrency guard: exclusive non-blocking flock on "<state>.lock"."""

    def test_second_holder_fails_fast_then_release_reopens(self):
        with tempfile.TemporaryDirectory() as tmp:
            state = Path(tmp) / "cp.json"
            lock = RemoteLock(state)
            lock.acquire()
            try:
                self.assertEqual(lock.path.stat().st_mode & 0o777, 0o600)
                self.assertIn(f"pid={os.getpid()}", lock.path.read_text(encoding="utf-8"))
                rival = RemoteLock(state)
                with self.assertRaises(LockHeldError):
                    rival.acquire()
                self.assertIsNone(rival._fd)  # failed acquire leaked no descriptor
            finally:
                lock.release()
            second = RemoteLock(state)  # kernel released the flock on unlock
            second.acquire()
            second.release()
            second.release()  # repeated release is a safe no-op

    def test_lock_creates_missing_parent_directory(self):
        with tempfile.TemporaryDirectory() as tmp:
            state = Path(tmp) / "nested" / "deeper" / "cp.json"
            lock = RemoteLock(state)
            lock.acquire()
            try:
                self.assertTrue(state.parent.is_dir())
                self.assertTrue(lock.path.is_file())
            finally:
                lock.release()

    def test_double_acquire_on_same_handle_is_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            lock = RemoteLock(Path(tmp) / "cp.json")
            lock.acquire()
            try:
                with self.assertRaises(RuntimeError):
                    lock.acquire()
            finally:
                lock.release()

    def test_dry_run_never_touches_lock_or_state(self):
        with tempfile.TemporaryDirectory() as tmp:
            src = Path(tmp) / "master"
            src.mkdir()
            for name in CATEGORY_FILES:
                (src / name).write_text("### one\nbody\n", encoding="utf-8")
            state = Path(tmp) / "cp.json"
            with contextlib.redirect_stdout(io.StringIO()), \
                    contextlib.redirect_stderr(io.StringIO()):
                rc = main(["--dry-run", "--src", str(src), "--state", str(state)])
            self.assertIn(rc, (0, 2))
            self.assertFalse(Path(str(state) + ".lock").exists())
            self.assertFalse(state.exists())

    def test_main_remote_mode_aborts_when_lock_held(self):
        # The lock tripwire must fire before any gh subprocess is spawned.
        with tempfile.TemporaryDirectory() as tmp:
            src = Path(tmp) / "master"
            src.mkdir()
            for name in CATEGORY_FILES:
                (src / name).write_text("### one\nbody\n", encoding="utf-8")
            state = Path(tmp) / "cp.json"
            holder = RemoteLock(state)
            holder.acquire()
            tripwires: list[str] = []

            def tripwire_run(*a, **k):
                tripwires.append("subprocess.run")
                raise AssertionError("locked run must not spawn gh")

            original = subprocess.run
            subprocess.run = tripwire_run
            try:
                with contextlib.redirect_stdout(io.StringIO()), \
                        contextlib.redirect_stderr(io.StringIO()) as err:
                    rc = main(["--reconcile", "--src", str(src), "--state", str(state)])
            finally:
                subprocess.run = original
                holder.release()
            self.assertEqual(rc, 1)
            self.assertIn("ABORT: another hosting_game_import remote run holds the lock",
                          err.getvalue())
            self.assertEqual(tripwires, [])


class TestReconcileHalfConfigNote(unittest.TestCase):
    def test_exactly_one_category_config_flag_prints_note(self):
        with tempfile.TemporaryDirectory() as tmp:
            src = Path(tmp) / "master"
            src.mkdir()
            for name in CATEGORY_FILES:
                (src / name).write_text("### one\nbody\n", encoding="utf-8")
            state = Path(tmp) / "cp.json"
            seen: list[dict[str, Any]] = []

            def fake_graphql(self, query, variables, **kwargs):
                seen.append({"query": query, "variables": variables})
                return project_node({"items": {"pageInfo": {
                    "hasNextPage": False, "endCursor": None}, "nodes": []}})

            def tripwire_run(*a, **k):
                raise AssertionError("fake transport in use; subprocess must stay unused")

            originals = (subprocess.run, GhTransport.gh_graphql)
            subprocess.run = tripwire_run
            GhTransport.gh_graphql = fake_graphql
            try:
                with contextlib.redirect_stdout(io.StringIO()), \
                        contextlib.redirect_stderr(io.StringIO()) as err:
                    rc = main(["--reconcile", "--src", str(src),
                               "--state", str(state),
                               "--category-field-id", "F_cat"])  # options deliberately absent
            finally:
                subprocess.run, GhTransport.gh_graphql = originals
            self.assertIn(rc, (0, 2))
            self.assertIn("NOTE: --reconcile was given exactly one of", err.getvalue())
            # adoption still ran (items read), field resolution did NOT (needs both flags)
            self.assertTrue(any("items(first" in call["query"] for call in seen))
            self.assertFalse(any("fields(first" in call["query"] for call in seen))
            self.assertTrue(state.is_file())  # read-only-mode checkpoint still saved


def run_self_tests() -> int:
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromModule(sys.modules[__name__])
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    return 0 if result.wasSuccessful() else 1


if __name__ == "__main__":
    if "--self-test" in sys.argv:
        sys.exit(run_self_tests())
    sys.exit(main(sys.argv[1:]))
