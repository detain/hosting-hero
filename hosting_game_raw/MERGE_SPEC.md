# Per-category merge spec (opencode → master)

You are merging ONE category file from `hosting_game_raw/opencode/` into its matching
file in `hosting_game_raw/master/`. The master file is the BASE. The opencode file is
a second, independently-written idea document covering the same category from a
different session.

Goal: when you are done, the master file contains the union of both documents'
ideas for this category, with variations nested under their parent idea and genuine
conflicts wrapped in a tagged section.

---

## Hard rules

1. **Never delete master content.** Every `### ` idea entry that exists in the master
   file must still exist afterwards. You are adding and restructuring, not pruning.
2. **Never drop an opencode idea.** If it isn't already covered, it goes in. If it is
   covered, it becomes a nested variation or a conflict position. Nothing is discarded
   as "redundant" without being folded into the entry it duplicates.
3. Preserve the master file's existing structure and numbering. Do not renumber
   `## N.M` subsections and do not rewrite inline `§N.M` cross-references — other files
   point at them.
4. Preserve opencode's flavour text: level-tier tags like `[EARLY, best teaching level]`
   or `[LATE, best risk/reward]`, and nicknames like `"The Apartment Block"`. These are
   information, not decoration. Carry them across.
5. Keep the master heading convention:
   - `#` category
   - `## N.M` numbered subsection
   - `### ` an individual idea entry
   - `#### ` nested material under an idea (variations, conflict positions)
   Note the two source docs use `###` differently: in master it is one idea; in
   opencode it is a subsection heading with many ideas inside its prose. Translate
   opencode's ideas into master-style `### ` entries when they are new.

---

## The three cases

### Case A — opencode idea is genuinely new

Add it as a normal `### <Name>` entry in the most appropriate existing `## N.M`
subsection. Match the surrounding entry format: short description, then bolded
**How it works** / **Interacts with** / **Hosting types** lines where applicable.

If no existing subsection fits, create a new `## N.<next>` subsection at the end of
the file for it. Do not scatter orphans.

### Case B — same idea, but opencode has additions / updates / variations (NOT a conflict)

Keep the master entry as the parent. Append a nested block to it:

```
### <Existing Master Idea Name>

...existing master body, unchanged...

**Variations and additions**

- **<Variation name>** — what it changes and why it is interesting.
- **<Another variation>** — ...
```

Use this for refinements, alternate framings, extra numbers, extra examples, or a
second author's richer treatment of the same mechanic. If opencode's version of a
shared idea is simply *better written or more detailed*, you may enrich the parent
body directly instead of nesting — but only by adding, never by replacing master text
with a shorter version.

### Case C — the two documents genuinely disagree

Wrap it. Create a section around the disputed idea, tagged `*CONFLICTING*`, with the
competing positions nested inside:

```
### <Topic of the dispute> — *CONFLICTING*

One or two sentences stating precisely what is in dispute and what the decision
turns on.

#### Position A — <short label> *(master)*

...the master position, in full...

#### Position B — <short label> *(opencode)*

...the opencode position, in full...
```

A conflict is when the two documents propose **mutually exclusive rules** — different
values for the same dial, incompatible core laws, opposite answers to the same design
question. Different-but-compatible ideas are Case B, not Case C. Do not manufacture
conflicts, and do not resolve them: both positions stay, in full.

The opencode file already marks many of these with `#### … — *CONFLICTING*` headings —
those are strong candidates, but verify each one is still a real conflict once placed
next to the master material rather than assuming it.

If the master file already has a `⚔️ Tension:` note covering the same dispute, fold it
into the `*CONFLICTING*` section as one of the positions. Leave unrelated `⚔️ Tension:`
notes exactly as they are.

---

## Procedure

1. Back up the master file to `<masterfile>.bak` before you touch it.
2. Read BOTH files in full. They are large (100–320 KB each); read them in chunks with
   `sed -n 'START,ENDp'` and take notes as you go. Build a mental index of the master
   file's `### ` entries first — you need it to spot Case B and Case C.
3. Build the merged file incrementally into a temp file (`<masterfile>.new`), one
   `## N.M` subsection at a time, appending with heredocs. Do NOT try to emit the whole
   file in one tool call.
4. Verify before swapping:
   - the new file's `### ` count is **greater than or equal to** the original master's,
   - the new file's byte size is **greater than** the original master's,
   - every `## N.M` subsection heading from the original master is still present, in order.
   If any check fails, fix it before proceeding. Never swap in a file that lost content.
5. `mv <masterfile>.new <masterfile>`, then delete the backup only if you are confident,
   otherwise leave it.
6. **Delete your opencode source file** (`rm hosting_game_raw/opencode/<yourfile>`) —
   but ONLY after the merged master file is verified in place. This is the last step.
7. Touch no other files. Other agents are merging the other nine categories
   concurrently; stay strictly inside your assigned pair.

## Reply

ONE LINE ONLY: `DONE — merged <category> (N new, M variations, K conflicts)` or
`FAILED — <reason>`. No summary, no ideas, nothing else.
