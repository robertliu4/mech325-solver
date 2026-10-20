# Belts redesign brief — flat, V and timing belts built around the course's questions

User feedback: *"the belt options aren't quite good, the bible is not good either — let's make it better for the course and questions that might arise from the course."*
Earlier instruction still applies: list the assumptions used (from the guides where they exist) and make the calculator use them; fix errors; keep it simple and intuitive.

Repo: /home/claude/axzyl/mech325-solver. Read first: v2/SCHEMA.md (incl. `assumptions` + text formatting), v2/AGENT_BRIEF.md (sources/tools), v2/COURSE_CONVENTIONS.md §0–§3 and §16–§17 (course rules, Gates/Habasit methods, worked test cases with answers).
Course PDFs: v2/course/ — "Flexible belts Flat and Vbelts-2024.pdf", "Timing Belts 2023.pdf", "MECH 325 2023 Flex Drives Tutorial 1/2.pdf", "MECH 325 2025 Flex Drives Tutorial 3.pdf", "Selected Tutorial Questions for Module 1 2025.pdf" (worked solutions), "ME325 2025 Homework Assignment 1 Solutions.pdf", "325-Midterm-2025*.pdf" (scanned; rasterize and Read). Read the belt parts of all of them yourself — don't rely only on COURSE_CONVENTIONS.
Guide pages: Fizz pp. 4–25, Mech pp. 13–33, 53–60, 135–136.

## Wait before editing
Another agent is finishing guide-assumption notes for these topics. **Do your research first; do not edit v2/topics/{flat_belts,v_belts,timing_belts}_*.js until `v2/notes/belt_assumptions.md` exists** (poll with `ls`, sleeping via a Monitor/until-loop or just doing research in between). Use its findings.

## What to build
1. **Inventory the course's question types** for your topic(s): every question in HW1, Tutorials 1–3, Selected Tutorial Questions M1, the midterm, and the lecture examples — what is given, what is asked. Add the obvious variants an exam could ask (inverse problems: power capacity of a given belt, required initial tension, minimum width, number of belts for an existing drive, output speed / belt speed, centre distance for a stocked belt length, max ratio/wrap/speed checks, tension/deflection setting, effect of changing speed/CD on capacity, life). Write the inventory to `v2/notes/<topic>_questions.md` (table: question type → source → given → asked → which steps answer it).
2. **Restructure the calculator around a first step "What does the question ask?"** — a `choice` (`mode`) whose options are those question types in plain words (e.g. V-belts: "Design a new drive — Mott (select section, sheaves, length, number of belts)", "Design with the Gates catalogue (+ installation tension)", "Analyse a given drive — Shigley (capacity, number of belts, tensions, nfs, life)", "Installation tension & deflection only (Gates D19–D23)", "Geometry only: length ↔ centre distance, wrap, speed"). Steps use `when` so only what that question needs is shown, in the order the course solutions do it. Inputs that every mode needs come first. Each mode ends with a result step whose `after` states the answer(s) the question asks for in words (e.g. "Use 3 × 5V-1250 belts on 10.8″/21.1″ sheaves at CD 37.1″ — nfs 1.34").
3. **Both book files offer every method** (the course mixes them: midterm = Mott, Tutorial 2 Q1 = Shigley, Tutorial 2 Q2 / HW1 P3b = Gates). Default `mode` = the page's own book method. Put the shared definition in one file `v2/topics/<topic>_common.js` exporting `window.makeTopic_<topic> = (book) => ({...})`; make `<topic>_shigley.js` / `<topic>_mott.js` one-liners (`window.TOPIC = makeTopic_<topic>('mott')`) and add the common script to both HTML shells before the per-book script. Figures: include both books' figures + course figures (`book:'course'`), each with the correct `book`.
4. **Assumptions panel**: list the assumptions with sources — guide (Fizz/Mech pages, from the notes file + your reading), course slides where the course states a rule (cite e.g. "Flat&V s28"), textbook defaults. Where the guide is wrong or weaker than the course (user: "the bible is not good"), use the course/textbook value and say so in the assumption text. Link `var` so the panel shows live values; defaults must equal the assumptions.
5. **Auto-fill what is mechanical** (rule-of-thumb sheave from 4000 ft/min, standard sizes, nearest standard length from Table 7-2 / 17-10, Kφ from Table D26, M/Y from Table D27, K1/K2, Cθ/CL fits, Htab where a table is embedded …) as yellow `auto` lookups that the student can override with the chart reading. Keep checks for every course rule (V 1000–5000, 4000 target; ratio ≤ 6 (7 cogged); wrap > 120°; D2 < CD < 3(D1+D2); timing V < 6500 and ≥ 6 teeth in mesh; f > f′; etc.).
6. **Verify every course case** listed in COURSE_CONVENTIONS for your topics (and any extra you find in the course PDFs) in the matching mode with a Playwright probe (page.add_init_script sets localStorage 'm325v2:<id>:<book>' = JSON {raw:{…}}; see v2/tools/shot.py). Record them in a `// Verified against:` header (inputs → answers, and mismatches explained, e.g. known course-solution typos from COURSE_CONVENTIONS §17). Set `example` to the most representative course case (midterm for V-belts).
7. Keep it intuitive: ≤ ~8 variables per step, hints on every yellow field naming the table/figure, units on everything, no raw LaTeX outside `\\( \\)` (plain `K_s`, `10^6` are fine — the engine renders them).

## Finish (all clean)
- `python3 v2/tools/qa.py <topic>` → errors=none missing=none for both book files
- `python3 v2/tools/textscan.py <topic>` → 0 findings
- For each mode, a Playwright probe that switches `mode`, loads that mode's course case, and confirms the result line; Read one screenshot per mode.

Rules: don't edit engine.js/style.css (report limitations); only touch your topic files, their HTML shells, new notes/figures. Scratch: `/tmp/claude-0/-home-claude/0b0d4deb-3887-50d8-baff-792e3c8f9497/scratchpad/<your-name>/`. Don't commit.

## Report (concise)
Modes built (question types → sources); assumptions list summary; course cases verified (numbers) / mismatches; anything left out.
