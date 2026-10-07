#!/usr/bin/env python3
"""Parity check for the video prompt library.

Counts `### V` variation blocks in concepts/*.md (source of truth) and compares
against entries in manifest.json; validates JSON, id uniqueness, per-entry keys,
and the seed formula documented in README.md. Exit 0 == parity.

Usage: python3 check_parity.py
"""
import json, re, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
VAR_RE = re.compile(r"^### V\d+ — ")
SHOT_RE = re.compile(r"^## SHOT ([A-Z]{2})-(\d+) — (.+)$")
CODES = {"GL": 11, "TP": 12, "HT": 13, "NA": 14, "IC": 15, "EB": 16, "TT": 17}
MODEL_KEYS = ("prompt", "negative", "resolution", "fps", "duration_s", "cfg")
TOP_KEYS = ("id", "file", "shot", "concept", "model", "camera", "loopable",
            "seed_hint", "text_zones")

def count_blocks():
    total, per_file = 0, {}
    for path in sorted((HERE / "concepts").glob("*.md")):
        n = sum(1 for line in path.read_text(encoding="utf-8").splitlines()
                if VAR_RE.match(line))
        per_file[path.name] = n
        total += n
    return total, per_file

def main():
    problems = []
    md_total, per_file = count_blocks()
    print(f"md variation blocks: {md_total}  "
          f"({'  '.join(f'{k}={v}' for k, v in per_file.items())})")

    manifest_path = HERE / "manifest.json"
    try:
        entries = json.loads(manifest_path.read_text(encoding="utf-8"))
    except Exception as exc:
        print(f"manifest.json UNPARSEABLE: {exc}")
        return 1
    print(f"manifest entries:      {len(entries)}")
    if md_total != len(entries):
        problems.append(f"PARITY FAIL: {md_total} md blocks vs {len(entries)} entries")

    ids = [e.get("id") for e in entries]
    if len(set(ids)) != len(ids):
        problems.append("duplicate manifest ids")
    for e in entries:
        for k in TOP_KEYS:
            if k not in e:
                problems.append(f"{e.get('id','?')}: missing key {k}")
        for track in ("ltx", "wan"):
            blk = e.get("model", {}).get(track)
            if blk is None:
                problems.append(f"{e.get('id','?')}: missing model.{track}")
                continue
            for k in MODEL_KEYS:
                if k not in blk or blk[k] in ("", None):
                    problems.append(f"{e.get('id','?')}.model.{track}: missing {k}")
        m = re.fullmatch(r"([a-z]{2})-(\d+)-v(\d)", e.get("id", ""))
        if m:
            fam, shotno, var = m.groups()
            want = CODES[fam.upper()] * 1000 + int(shotno) * 10 + int(var)
            if e.get("seed_hint") != want:
                problems.append(f"{e['id']}: seed_hint {e.get('seed_hint')} != formula {want}")

    # shot headers sanity: every shot has exactly 4 variations in the manifest
    shots = {}
    for e in entries:
        shots.setdefault(e.get("shot"), []).append(e.get("variation"))
    for shot, vars_ in shots.items():
        if sorted(vars_) != [1, 2, 3, 4]:
            problems.append(f"shot '{shot}': variations {sorted(vars_)} != [1,2,3,4]")
    print(f"shots: {len(shots)}")

    if problems:
        print("\n".join("PROBLEM: " + p for p in problems))
        return 1
    print("RESULT: PARITY OK (blocks == entries, JSON valid, ids unique, "
          "seed formula holds, 4 variations per shot)")
    return 0

if __name__ == "__main__":
    sys.exit(main())
