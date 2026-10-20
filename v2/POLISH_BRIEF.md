# Polish brief — TeX everywhere, less text, assumptions per section, past-exam coverage

User feedback (latest):
- *"Make sure this is renderable at all points"* — a figure note showed `Open: φd = π − 2 sin⁻¹[(D−d)/2C] …` as plain Unicode. **Every formula, symbol and number-with-exponent shown anywhere must render as TeX.**
- *"There's also a lot of info"* — trim. Keep what a student needs to do the step; cut repetition, history, and commentary.
- *"Add the assumptions above the sections"* — the engine now renders each assumption above the section it belongs to (see below).
- *"Fix the subscripts and superscripts etc (tex) on the site — I see some things that could be improved."*
- *"Here are more midterms/tests that you can add"* — v2/course/past/ (17 PDFs).
- Belts only: *"There should be standard belt sizes"* and *"often times we take c-c distance to be ~32–40 and go from there"*.

Repo: /home/claude/axzyl/mech325-solver. Read v2/SCHEMA.md (assumptions + text formatting sections), v2/AGENT_BRIEF.md, v2/COURSE_CONVENTIONS.md (your topics + §16–§17).

## Engine behaviour you can rely on (don't edit engine.js/style.css)
- Plain text everywhere goes through `rich()`: tokens like `K_o`, `N_{LP}`, `P_des`, `10^7`, `3e+7`, `V_s^{0.45}` are turned into inline TeX automatically. Anything else that is math — Greek-with-subscript (`φd`, `θD`), functions (`sin⁻¹`), fractions, brackets, `√`, `×10⁶`, inequalities with symbols — you must write as `\\( … \\)` TeX yourself (in JS strings: `'\\(\\phi_d = \\pi - 2\\sin^{-1}\\frac{D-d}{2C}\\)'`). Unicode superscripts (², ⁻¹, ⁶) and `−` inside formulas → TeX.
- Long `text` / section `text` / `intro` are clamped to ~3 lines with a "more" toggle. So put the actionable sentence FIRST; detail after.
- Assumptions are placed automatically above the section containing their `var`. For assumptions without a `var`, add `step: '<step id>'` (or `section: <index>`) so they sit above the right section; only truly page-wide ones should stay unlinked (they show as "General assumptions" at the top — keep that list short, ≤ 4).
- `H.table` / `H.set` for selection tables; choice fields accept `auto`.

## Do, for each topic file you own (both books; for belts/chains the `_common.js`)
1. **TeX pass** over every user-visible string: `title`, `text`, `intro`, section `text`, var `label`/`hint`/`unit`, `check` messages, `after`/`work` output, figure `title`/`note`, assumption `text`, option labels. Convert Unicode/ASCII math to `\\( \\)` TeX; keep units in text (`ft/min`, `lbf·in`). Run `python3 v2/tools/textscan.py <topic> --unicode` — target 0 findings — **in every mode/question type** (switch `mode` with a probe; the scan only sees the loaded state).
2. **Trim**: every step `text` ≤ ~2 short sentences of instruction (+ optional detail sentence after); hints ≤ 1 line; figure notes ≤ 2 lines. Remove duplicated explanations that the assumptions panel or the figure already gives. Don't remove sources or rules.
3. **Assumptions placement**: give every unlinked assumption a `step` or `section`; keep "General" ≤ 4.
4. **Past exams** (v2/course/past/: midterms 2014, 2016, 2021, 2022, 2023 (+solutions), 2024 solutions; HW1–HW5 solutions 2023/2024; final-exam review solutions; "Selected Tutorial Questions for Final Exam Study 2022"; "All RAP.pdf" quiz questions). Several are scanned (no text layer) — rasterize pages (~110 dpi) and Read them; OCR with `tesseract` is available for text. For YOUR topics: list every question (source, given, asked, final answer) in `v2/notes/past_exam_<group>.md`. Then for each: make sure the calculator has the question type (add a mode/step if missing, keeping things simple), and reproduce the answer with a Playwright probe (localStorage `m325v2:<id>:<book>` = JSON `{v:2, raw:{…}, def:{}}`, set via page.add_init_script). Record verified cases in the `// Verified against:` header; note solution slips you find (append to COURSE_CONVENTIONS §17). If a past exam uses a table/chart the page lacks, crop and add it. RAP conceptual questions: if they hinge on a rule/definition the page should state (e.g. "which side is the slack side", "why odd tooth counts"), make sure the relevant step text or assumption says it — one line, no essay.
5. Group-specific items below.

## Finish (all clean)
`python3 v2/tools/qa.py <topic>` → errors=none missing=none; `python3 v2/tools/textscan.py <topic>` → 0; `python3 v2/tools/textscan.py <topic> --unicode` → 0 in every mode; Read one screenshot per file to check it reads cleanly. Scratch: `/tmp/claude-0/-home-claude/0b0d4deb-3887-50d8-baff-792e3c8f9497/scratchpad/<name>/`. Don't commit. Report concisely: TeX fixes count, text trimmed, past-exam cases (pass/fail with numbers), new modes/tables, slips found.
