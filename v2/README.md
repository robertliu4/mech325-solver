# MECH 325 Solver v2

Open `v2/index.html` (or the "Open v2" banner on the repo's `index.html`). No build step, no server; works from `file://` and offline (MathJax is vendored).

**One calculator per topic per textbook** — 19 topics × {Shigley 11e, Mott 6e} = 38 pages. Each page:

- merges the Fizz guide and the Mech ("Dog") guide procedures into one ordered step list (inputs → geometry → forces → stress/capacity → result), using that textbook's symbols, equation numbers and tables;
- shows every table, chart and diagram the procedure needs, cropped from the textbook PDF and labelled with its real number (`Table 14-8`, `Figure 9-10`…) in a sticky right-hand panel; the 📋/📈 button next to each yellow lookup field jumps to the right one, click an image to zoom, "open in textbook" opens the PDF at that page;
- defaults to the values the course assumes (see `COURSE_CONVENTIONS.md`, distilled from the Canvas lectures, tutorials, HW1 and the 2025 midterm) and warns when a course rule is violated;
- gives a curve-fit *estimate* for most chart lookups (shown as `auto: …` placeholder) so you get a number immediately, while still letting you type the chart reading;
- prints the substituted equation under each calculated value so it can be copied into an assignment ("Summary / copy" gives the whole thing as text);
- has a "Load example" button that reproduces the textbook's worked example (and tutorial/midterm cases where noted at the top of the topic file);
- auto-saves in the browser; "Switch to Mott/Shigley version" keeps you on the same topic.

Colours: white = you enter, yellow = read from table/graph, green = calculated.

## Layout
```
v2/index.html                 topic grid
v2/<topic>_<book>.html        thin shell
v2/topics/<topic>_<book>.js   the procedure (steps, variables, equations, figures)
v2/assets/engine.js|style.css renderer
v2/figures/shigley|mott|course|bibles/*.png   cropped figures
v2/course/*.pdf               Canvas lectures/tutorials/midterm (source for conventions)
v2/COURSE_CONVENTIONS.md      what the course assumes, with sources
v2/SCHEMA.md                  how to write/extend a topic file
v2/tools/fig.py               find/preview/crop textbook figures;  shot.py / qa.py = headless checks
```

## Adding or fixing something
Edit the topic JS (see `SCHEMA.md`); run `python3 v2/tools/qa.py <topic>` to check for JS errors and missing images. To add a figure: `python3 v2/tools/fig.py find S "Figure 14-6"` → `preview` → `crop`.
