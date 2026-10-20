# Sizing brief — belts and chains: "which size do I pick, and why"

User: *"For the belts, often times we have to size them — there are tables for the belt sizes and when to select each size, same for chains. Why isn't that there?"*

Today the selection charts/tables only exist as images in the figure panel; the student still reads the chart and types the size. Build real **sizing steps**: put the selection data into the calculator, apply the textbook/course rule for when to choose each size, show a live comparison table of all candidate sizes, highlight the one to pick, and let one click fill it in.

Repo: /home/claude/axzyl/mech325-solver. Read v2/SCHEMA.md, v2/AGENT_BRIEF.md, v2/COURSE_CONVENTIONS.md §1–§4 and §16 (course figures incl. the audit's catalogue crops), v2/notes/*_questions.md and v2/notes/course_table_audit.md. Course PDFs: v2/course/. Catalogues (read-only, not in git): /home/claude/catalogues/. Guides: Fizz pp. 4–30, Mech pp. 13–37, 53–60, 135–139.

## New engine helpers (already in v2/assets/engine.js — use them; don't edit the engine)
- `H.table(headers, rows, opts)` → HTML string for a live selection table. `rows: [{cells:[...], ok: true|false, pick: true, set: {varId: value, ...}}]`. `ok:false` rows are greyed, `pick:true` is highlighted ★ green, `set` adds a **Use** button that fills those fields and recomputes. `opts: {caption, note, useLabel}`. Return it from a step's `after: v => …` (cells may contain plain `K_s`-style text or `\\( \\)` math).
- `H.set(id, value)` fills a field programmatically (used by the Use buttons).

## What to build (keep each page simple: one clear "Select the size" step where the course selects it; data as JS tables in the topic file)
For every place a **size/standard item is chosen**, add:
1. The data, transcribed from the textbook/catalogue table (cite table + page in a comment; double-check numbers against the PDF image — read the crop).
2. The selection rule in words in the step `text` ("smallest section whose region contains (n, H_d) on Fig 7-13; on a boundary take the larger"; "smallest chain whose rating at N_1, n_1 ≥ H_d/K_2 — No. 80 is usually overkill (Mech p.34)"; …) with sources, and an `assumptions` entry if it is a rule-of-thumb.
3. A live `H.table` in `after` listing every candidate with the numbers that decide it (capacity vs required, speed limits, min sheave/sprocket, lubrication type, length…), `ok` per row, `pick` on the recommended one, and a **Use** button that sets the field(s). The yellow field keeps an `auto` = the picked value, so it also works without clicking.
4. Keep the chart/table images linked (`fig`) so students can show the reading.

### Belts (one agent): v_belts_common.js, flat_belts_common.js, timing_belts_common.js (both books use these)
- **V-belts**: section selection — Mott Fig 7-13 (3V/5V/8V regions by design hp × faster-shaft rpm), Shigley Table 17-9 (A–E: hp range per belt, min sheave diameter), Gates Fig B1/B2 (narrow / classical) for the Gates mode → table of sections with "in region? min sheave, hp range" and the pick. Standard sheave diameters per section (Mott Figs 7-14/15/16 standard sizes; Gates sheave lists if the course uses them) → table of candidate driver/driven sheave pairs around the 4000 ft/min target with actual ratio, output speed error, belt speed, rated hp/belt → pick. Standard belt lengths (Mott Table 7-2 for 3V/5V/8V; Shigley Table 17-10 for A–E; Gates B4/B17–B20 if used) → table of the lengths bracketing the computed length with resulting CD and whether CD is in range → pick. Number of belts table (1…n with nfs). Gates rating-table reads stay manual where not digitised, but the section/length/sheave choices should all be tables.
- **Flat belts**: belt material/ply/thickness selection (Shigley Table 17-2 rows: thickness, min pulley dia from Table 17-3 vs the pulley in the problem, Fa, γ, f) → table of belt specs that fit the pulleys with (F1)a and minimum width for the power → pick; standard widths (whole inches, or Habasit catalogue widths) table. Habasit types table in catalogue mode.
- **Timing belts**: pitch selection Fig 7-27 (design hp × rpm region) → pitch table; sprocket-pair candidates for the ratio (Table 7-7) with PD, ≥ Gates Table 4 minimum, bore/OD limits → table; belt length/CD candidates; width table (20/30/50/85 mm ratings from Tables 7-9/7-10 vs P_des) → pick. The current auto-pick logic exists — expose it as tables with Use buttons rather than hidden autos.

### Chains (one agent): chains_mott.js, chains_shigley.js (make a `chains_common.js` like the belts if that's simpler, update both shells)
- **Chain number**: Shigley Table 17-20 (rated hp for No. 25…240 vs small-sprocket rpm, 17 teeth, with lubrication type A/B/C regions) + Eqs 17-32/17-33 for other rpm/teeth; Mott Tables 7-14/7-15/7-16 (No. 40/60/80 by teeth × rpm, with lube type) — use Mott's tables on the Mott page and Shigley's on the Shigley page, both available. Table of every chain number: pitch, rated hp at (N1, n1), × K1 (teeth) × K2 (strands), vs H_d, lube type, max speed → ok/pick (smallest that passes; note Mech p.34 "80 usually overkill", consider more strands before going to a much larger pitch).
- **Strands**: table of 1–4 (or 6) strands × the chosen chain with K2 (Table 17-23 / Mott multiplier) → which combinations pass; pick per course rule (smallest pitch first, multi-strand when speed is high / to reduce pitch).
- **Sprocket teeth**: N1 options (≥17, odd preferred, ≥ 12 for low speed …, Table 17-21/ Mott guidance) and N2 = N1·VR rounded, with output-speed error and ratio ≤ 7 → table → pick.
- **Chain length / CD**: candidate even link counts around the computed length (30–50 pitches CD) with resulting CD → pick.
- **Static / lifting chain (HW1 P5)**: chain number from tensile strength table (≥ 10× working load per course) → table.
- Lubrication type shown in the result.

## Verify (both books, every mode touched)
- The course cases already in the `// Verified against:` headers must still reproduce — and the new tables' picks must match the course solutions' choices (e.g. Midterm P1 → 5V, 10.8/21.1 sheaves, 125-in belt, 3 belts; HW1 P2/P3a/P4/P5/P6/P7; Tutorial 1/2; Mott Ex 7-2/7-4/7-5; Shigley Ex 17-4/17-5). Where the course picked differently from the strict rule, show both and explain in a note.
- Playwright probe each case (page.add_init_script → localStorage 'm325v2:<id>:<book>' = {raw:{…}}), and click a Use button to confirm it fills the field and recomputes.
- `python3 v2/tools/qa.py <topic>` clean; `python3 v2/tools/textscan.py <topic>` 0 findings; Read a screenshot of each new selection table.

Rules: don't edit engine.js/style.css (report needs); only your topic files + shells + notes; scratch `/tmp/claude-0/-home-claude/0b0d4deb-3887-50d8-baff-792e3c8f9497/scratchpad/<name>/`; don't commit. Report concisely: selection steps added (what data, which rule), course picks reproduced, anything not digitised.
