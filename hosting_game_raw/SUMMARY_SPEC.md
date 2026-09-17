# Summary spec — condensing one master category file

You are condensing ONE file from `hosting_game_raw/master/` into a terse brief.

**Purpose.** The combined summaries become a single index that lets a later agent
understand the whole design space and make informed choices WITHOUT reading 3.6 MB of
source. So the summary must be *complete in coverage* and *terse in detail*. A reader
should finish it knowing every idea that exists and roughly what each one is — then
know exactly which name to grep for in the full file when they need specifics.

---

## Hard rules

1. **Every single `### ` idea entry in your source file gets exactly one line.** No
   skipping, no "and 12 similar entries", no merging two ideas onto one line. The
   summary's bullet count MUST equal the source's `### ` count. This is verified.
2. **Reproduce idea names verbatim.** The name is the lookup key back into the full
   file. Do not reword, shorten, or fix the capitalisation of a name. Keep bracketed
   tier tags (`[MID, core]`) and quoted nicknames (`"The Apartment Block"`) — they
   carry meaning and cost almost nothing.
3. **Preserve every `## N.M` subsection heading**, in source order, as the structure of
   your summary. Keep the numbers; they are cross-referenced elsewhere.
4. Do not invent, extrapolate, editorialise, or add ideas. You are compressing, not
   designing. No preamble, no conclusion, no commentary on quality.

## Line format

```
- **<Exact Idea Name>** — <what it is and how it works, ~15-25 words>.
```

Optional suffixes, in this order, when they apply:

- `(+N var)` — the entry has a "Variations and additions" block with N items. Do not
  expand them; the count alone tells a reader there is more depth there.
- `⚔️ <what is disputed, ~10 words>` — for an entry marked `*CONFLICTING*`. Name what
  the two positions disagree about. This is the one place worth spending extra words,
  because unresolved conflicts are decisions someone still has to make.

## What to keep vs cut

**Keep:** the mechanic (what it actually does), concrete numbers when the number IS the
idea (prices, rates, thresholds, timings), which hosting types it applies to when
type-specific, and the key interaction when an idea only makes sense with another.

**Cut:** worked examples, restatements, flavour prose, rationale, art-direction detail
beyond the core visual hook, and anything the idea's own name already conveys.

## Size target

Aim for **8–12% of your source file's byte size**. Under-shooting means you dropped
detail that mattered; over-shooting means you are transcribing rather than condensing.

## Header

Start the file with exactly this, filled in:

```
# <Category name> — summary

> Source: `master/<filename>` · <N> idea entries · <X> KB
```

## Procedure

1. Count your source's `### ` entries first: `grep -c '^### ' <file>` — that is your
   required bullet count. Also list them: `grep -n '^##\+ ' <file>` gives you the full
   skeleton cheaply.
2. Read the source in chunks (`sed -n 'START,ENDp'`). It is large.
3. Write your summary incrementally, one `## N.M` subsection at a time, appending with
   heredocs. Do NOT emit the whole file in one tool call.
4. Verify before finishing: `grep -c '^- \*\*' <summaryfile>` must equal the source's
   `### ` count. If it is short, find what you skipped and add it. Report the numbers.
5. Touch no file other than your own source (read-only) and your own summary output.
   Ten other agents are condensing the other files concurrently.

## Reply

ONE LINE ONLY: `DONE — <category> summarised (N/N ideas, X KB)` or `FAILED — <reason>`.
