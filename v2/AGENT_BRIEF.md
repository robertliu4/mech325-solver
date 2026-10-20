# Brief for topic authors

Repo root: `/home/claude/axzyl/mech325-solver`. Work only inside `v2/`. Read `v2/SCHEMA.md` first, then look at
`v2/topics/_sample_shigley.js` + `v2/_sample_shigley.html` (a working toy) and `v2/assets/engine.js` if you need to know what a field does.

## Sources (all PDFs; pages below are 1-based PDF pages)
| key | file | what |
|---|---|---|
| F | original_documents/Mech_325_Bible_Fizz.pdf (156 pp) | "Fizz" student guide. Printed page = PDF page. Belts 4–34, Spur 35–51, Helical 52–58, Bevel 59–68, Worm 69–74, Rack 75, Fluids 76–91, Bushings 92–95, Ball/cyl bearings 96–100, Tapered 101–105, Shafts & keys 106–122, Power screws 123–126, Ball screws 127, Springs 128–145, Fasteners 146–156 |
| D | original_documents/Mech_325_Bible_Mech.pdf (141 pp) | "Mech / Dog" student guide. Cite PDF page numbers (printed page is 1 lower in places). Units: conversions 11, Flat belts 15, V-belts 19, Timing 27, Chains 34 (Mott) 37 (Shigley), Wire rope 38 (Mott) 44 (Shigley) 49 (mine hoist), belt figures 53–60; Gears: spec questions 63 (spur) 66 (helical) 68 (bevel), forces 71–72, stress spur 73–90, helical 91–97, bevel 98–106, worm 107–113, rack 114; Fluid power 116–128; timing-belt tables 135, chain tables 137. Units 4–6 (bearings, shafts, springs, fasteners) are EMPTY in this guide. |
| S | original_documents/M325S.pdf | Shigley 11e. Ch7 shafts p394, Ch8 screws/fasteners p442, Ch10 springs p546, Ch11 rolling bearings p596, Ch12 journal bearings p644, Ch13 gears general p702, Ch14 spur/helical p760, Ch15 bevel/worm p812, Ch17 belts/chains/rope p902 |
| M | original_documents/M325M.pdf | Mott 6e. Ch7 belts/chains/rope p261, Ch8 gear kinematics p321, Ch9 spur design p379, Ch10 helical/bevel/worm p445, Ch11 keys p487, Ch12 shafts p526, Ch14 rolling bearings p580, Ch16 plain bearings p631, Ch17 linear motion (ball screws) p658, Ch18 springs p672, Ch19 fasteners p708, App.19 pitting geometry factor I p851 |

Existing (old) per-guide calculators and their written specs are useful as a step inventory:
`specifications/<area>/fizz_*_spec.md` and `mech_*_spec.md` (sections 3 "Equations" and 4 "Procedure Steps").
Old HTML calculators are in `calculators/<area>/`. Do not copy their UI; mine them for steps, equations and lookups.

Text of a page: `python3 v2/tools/fig.py text F 40` (works for F, D, S, M). Read a page as an image when layout matters:
`python3 v2/tools/fig.py preview S 780` → `v2/tools/preview/S_780.png` (then Read it).

## Figures — the main gap you are filling
The student guides constantly say "look up X in the textbook". For every such lookup in your topic:
1. `python3 v2/tools/fig.py find S "Figure 14-6"` (dash-agnostic) → pick the CAPTION page.
2. `python3 v2/tools/fig.py preview S 780` → Read the PNG, read coordinates off the red/blue grid (PDF points, origin top-left).
3. `python3 v2/tools/fig.py crop S 780 60 50 520 440 v2/figures/shigley/fig14-6.png` → Read the PNG and confirm it is complete (whole table incl. header + footnotes; whole graph incl. axis labels and legend). Re-crop if cut.
Tables spanning two pages: crop both halves as `table14-2a.png`, `table14-2b.png` and make two figure entries.
Mott files go in `v2/figures/mott/`, Shigley in `v2/figures/shigley/`. Lower-case names, textbook number in the name.
Also crop any **diagram** that helps (force-direction diagrams, nomenclature sketches, wrap-angle geometry) — the user asked for diagrams, not only tables.

## Deliverables per topic
- `v2/topics/<topic>_shigley.js`, `v2/topics/<topic>_mott.js`
- `v2/<topic>_shigley.html`, `v2/<topic>_mott.html` (shell from SCHEMA.md; MathJax is local at `assets/tex-svg.js`)
- figure PNGs
- A worked `example` object in each topic (take numbers from a bible example or textbook example) and confirm the outputs match the source by running
  `python3 v2/tools/shot.py v2/<topic>_shigley.html /tmp/x.png --example` (prints JS errors, missing figure images, and every value). Fix anything red. Read the screenshot once to sanity-check layout.

## Content rules (repeat of SCHEMA.md, abbreviated)
- Steps = union of Fizz + Mech procedures, ordered: inputs → geometry → forces → stress/strength or capacity → result/selection. Use `choice` selects for discrete standard values (pressure angle, quality number, belt section…) and `when` to hide steps that don't apply.
- Shigley file uses Shigley numbers/symbols/equations; Mott file uses Mott's. Every lookup has `fig:` pointing at a figure entry whose `ref` is the textbook's number ("Table 14-2", "Figure 9-17"). Add `page:`.
- Give `auto:` curve fits where the textbook provides a formula for the chart (Kv, Km components, Cp, Y_N/Z_N, chain horsepower rating, etc.) so the student sees an estimate even before reading the graph. Keep them yellow lookups.
- Give key calcs a `work:` line with substituted numbers.
- Last step: `after:` that says PASS / FAIL / required material in words.
- Keep each topic to roughly 10–40 steps; don't invent content the course doesn't use. If one textbook doesn't cover the topic, still build the file using the other book's figures (set `book:` on those figure entries) and say so in `intro`.
- Don't touch files outside your assigned topics. Don't edit engine.js/style.css; if you hit an engine limitation, note it in your final report instead.
