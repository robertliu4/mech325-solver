# Review brief — guide assumptions + error pass (one agent per topic group)

Repo: /home/claude/axzyl/mech325-solver. Read v2/SCHEMA.md (esp. the new `assumptions` and "Text formatting" sections) and v2/AGENT_BRIEF.md (sources, page map, tools). v2/COURSE_CONVENTIONS.md has what the course slides assume.

The user's instruction: **"write the assumptions that were used in each [calculator] — we should be using them from the bibles"** (the bibles = the two student guides: Fizz `original_documents/Mech_325_Bible_Fizz.pdf`, Mech/Dog `original_documents/Mech_325_Bible_Mech.pdf`), and **"look it over, fix errors"**.

## Do, for each topic file you own (both `_shigley.js` and `_mott.js`):
1. **Read every guide page for your topic in full** — `python3 v2/tools/fig.py text F <page>` / `text D <page>`, AND render pages to PNG and look at them (`python3 v2/tools/fig.py preview F <page> <scratch>/F_<page>.png`, then Read) because many assumptions sit in annotated screenshots, margin notes and footnotes that the text layer garbles. Collect every assumption, default, "usually / typically / we always / if not given / unless stated" rule, standard starting value, and rule of thumb (e.g. Fizz p.42 "Assume 20° unless otherwise specified", Fizz p.66 "We always just assume SF = 1", Fizz p.107 "assume k = 5 if not given", Mech p.20 "assume a belt speed of V = 4000", Mech p.80 "commercial enclosed gear units", Mech p.82 "KR = 1 for 99 %", Fizz p.85 "Schedule 80", Fizz p.88 "0.85 efficiency", Mech p.118 "assume 1000 psi"...). These grep hits are only a start — read the pages.
2. Add `assumptions: [...]` to the TOPIC (see SCHEMA) listing them in procedure order, each with `src` citing "Fizz p.N" and/or "Mech p.N". Link `var` to the field that carries it whenever one exists.
3. **Make the calculator actually use them**: the linked field's `default` (or `auto`) must equal the guide's assumption. If a previous pass set a course-slide value that differs from the guides, switch the default to the guide value and say in the assumption text what the course slides use instead (e.g. "Q_v = 6 assumed (Fizz p.45); course midterm used Q_v = 9"). If the two guides disagree with each other, use the one matching this file's textbook and note the other. If a guide assumption has no field yet and affects the result, add the field (keep steps ≤ ~8 vars).
4. **Error pass** — look the whole file over: equations vs the textbook (spot-check against the PDF), units (hp vs kW, in vs mm, rpm, psi/ksi), figure/table numbers on chips actually match the cropped image and the book, symbols consistent, `when` logic, steps that show blank/NaN with the example loaded, PASS/FAIL logic, hints that contradict defaults. Fix what you find. Keep the "Load example" reproducing its textbook/course example (the `// Verified against:` header lists them) — re-verify after your changes with a Playwright probe (page.add_init_script sets localStorage 'm325v2:<id>:<book>' = JSON {raw:{…}}, see v2/tools/shot.py) and update the header if numbers change because a default changed (the example object should set any value the example needs explicitly, so changing defaults must not break it).
5. Text formatting: write plain `K_o`, `N_{LP}`, `10^7` freely (engine renders them) — but no raw LaTeX commands outside `\\( \\)` (e.g. write σ not \sigma in plain text).

## Finish with (all must be clean):
- `python3 v2/tools/qa.py <topic>` → errors=none missing=none for every file you own
- `python3 v2/tools/textscan.py <topic>` → 0 findings
- Read one screenshot (`python3 v2/tools/shot.py v2/<file>.html <scratch>/x.png --example`) to check the assumptions panel looks right.

Rules: do NOT edit v2/assets/engine.js or style.css (report engine problems instead). Only touch your own topic files (+ new figure crops if you need one). Use your own scratch subfolder `/tmp/claude-0/-home-claude/0b0d4deb-3887-50d8-baff-792e3c8f9497/scratchpad/<your-group>/` — other agents share the scratchpad. Don't commit; the coordinator commits.

## Report (concise)
Per file: number of assumptions added; defaults you changed (old → new, why/source); errors found and fixed; example still reproduces (numbers); anything unresolved.
