# v2 topic file schema

Every calculator is **one HTML shell** + **one topic JS file** + cropped **figure PNGs**.
The engine (`assets/engine.js`) renders everything. Authors only write the topic file.

```
v2/
  index.html
  assets/engine.js, assets/style.css
  tools/fig.py                       # figure finder / cropper (see docstring)
  figures/shigley/*.png              # cropped from original_documents/M325S.pdf
  figures/mott/*.png                 # cropped from original_documents/M325M.pdf
  topics/<topic>_<book>.js           # e.g. topics/spur_shigley.js, topics/spur_mott.js
  <topic>_<book>.html                # thin shell (copy of template below)
```

## HTML shell (identical for every calculator except the two file names)

```html
<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Spur Gears — Shigley</title>
<link rel="stylesheet" href="assets/style.css">
<script>window.MathJax={tex:{inlineMath:[['\\(','\\)']],displayMath:[['\\[','\\]']]},svg:{fontCache:'global'}};</script>
<script src="assets/tex-svg.js"></script>
</head><body>
<script src="topics/spur_shigley.js"></script>
<script src="assets/engine.js"></script>
</body></html>
```

## Topic file

```js
window.TOPIC = {
  id: 'spur',                 // same for both books
  book: 'shigley',            // 'shigley' | 'mott'
  title: 'Spur Gears — Design & Stress',
  subtitle: 'Ch. 13–14 · merged Fizz + Mech guide procedure',
  sibling: 'spur_mott.html',  // the other textbook's version
  intro: 'One-paragraph orientation: what this solves, what you need to start. Plain HTML ok.',
  example: { P: 25, nP: 1750, Ko: 1.25 },   // optional: "Load example" button fills these raw inputs

  figures: [
    // One entry per table/figure/chart the student must read. ref MUST carry the textbook number.
    { id: 'ko',  ref: 'Table 14-x', title: 'Overload factor Ko', src: 'figures/shigley/table14-x.png',
      page: 781,                                 // 1-based PDF page in original_documents/M325S.pdf (opens the PDF at that page)
      note: 'Pick the driven-machine column that matches the application.' },
    { id: 'kv', ref: 'Figure 14-9', title: 'Dynamic factor Kv vs pitch-line velocity', src: 'figures/shigley/fig14-9.png', page: 790 },
    // A figure from the OTHER book can be included when this book has no equivalent: add book:'mott'.
  ],

  sections: [
    { title: 'Inputs', text: 'optional callout html',
      steps: [
        { id: 'in', title: 'Problem data',
          text: 'optional HTML explanation / bullet list of what to do',
          eq: '14-22',                          // optional textbook equation number shown as a chip
          fig: ['ko'],                          // optional figure id(s) → clickable chips that jump to the figure
          formula: 'H_{des} = H \\, K_o',       // optional LaTeX (display math, no $$)
          vars: [
            { id: 'P',  symbol: 'H',   label: 'Power', unit: 'hp', kind: 'input', default: undefined, hint: 'nameplate / required' },
            { id: 'Ko', symbol: 'K_o', label: 'Overload factor', unit: '', kind: 'lookup', fig: 'ko', default: 1.25,
              hint: 'Table 14-x',
              check: v => (v.Ko !== undefined && (v.Ko < 1 || v.Ko > 3)) ? 'Ko is normally 1.0–2.75' : null },
            { id: 'Pdes', symbol: 'H_{des}', label: 'Design power', unit: 'hp', kind: 'calc', digits: 4,
              compute: v => H.has(v,'P','Ko') ? v.P * v.Ko : undefined,
              work: v => H.has(v,'P','Ko') ? '\\(H_{des} = ' + H.fmt(v.P) + ' \\times ' + H.fmt(v.Ko) + ' = ' + H.fmt(v.P*v.Ko) + '\\)' : null },
            { id: 'phi', symbol: '\\phi', label: 'Pressure angle', unit: '°', kind: 'choice', options: [{label:'20°',value:20},{label:'25°',value:25}], default: 20 },
            { id: 'load', label: 'Load type', kind: 'choice', type: 'text', options: ['uniform','moderate shock','heavy shock'], default: 'uniform' },
          ],
          when: v => true,                      // optional: hide the step when false (e.g. only for helical)
        // sections may also have `when: v => …`; a section whose steps are all hidden hides its title automatically
          after: v => v.Pdes > 100 ? '<span class="result-bad">Large drive — check Ko</span>' : '',  // optional dynamic html under the card
        },
      ] },
  ],
};
```

### Variable `kind`
| kind | colour | meaning |
|---|---|---|
| `input` | white | student types a problem value |
| `lookup` | yellow | read from a table/graph — **always give `fig`** so the 📋/📈 button jumps to the right image. Optional `auto: v => number` fills a placeholder estimate (e.g. a curve-fit of the chart) when left blank; the estimate is used in calculations until the student types a value. |
| `calc` | green, read-only | `compute(v)` returns a number (or string) or `undefined` when inputs are missing. Never throw. |
| `choice` | select box | `options` list; values numeric unless `type:'text'` |

`v` is the dictionary of every variable value by `id` (numbers; strings for text choices). Use `H.has(v,'a','b')`
before reading. Helpers: `H.fmt(x,digits)`, `H.rad`, `H.deg`, `H.interp(x, xs, ys)`.
Computation runs in definition order with several passes, so a calc may reference a later calc, but keep order natural.

### `assumptions` (shown as an "Assumptions used" panel under the intro, and in Summary / copy)

```js
assumptions: [
  { text: 'Pressure angle φ = 20° unless the problem states otherwise', src: 'Fizz p.42 · Mech p.79', var: 'phi', value: 20 },
  { text: 'Commercial enclosed gear units (curve 2) for C_ma', src: 'Mech p.80', var: 'gearCond' },
  { text: 'Service factor SF = 1 when sizing (solve for minimum strength)', src: 'Fizz p.66 · Mech p.82' },
  { text: 'K_R = 1 (99 % reliability) — course slides agree', src: 'Mech p.82 · Gear Stress s25 (course)', var: 'KR' },
]
```
- `text`: one short sentence; plain text is fine — `K_o`, `N_{LP}`, `10^7` render as real sub/superscripts automatically, `\( … \)` is MathJax.
- `src`: where it comes from. "Fizz p.N" / "Mech p.N" (PDF page = printed page) become links to the guide PDFs. Add the course source when the course states the same thing; if the course **differs**, say so in `text` ("course slides use … instead").
- `var` (optional): id of the variable that carries this assumption. The panel shows its live value ("using 20 °") and turns red ("you set 25 °") when the student overrides it. `value` (optional) is the assumed value if it differs from the variable's `default`.
- The variable's `default` (or `auto`) MUST equal the assumption, so the calculator really uses it.

### Text formatting
Anywhere outside math (labels, hints, step text, section titles, figure notes, `check` messages, `after`/`work` output, dropdown option labels) the engine converts `X_a`, `X_{ab}`, `X^2`, `X^{-0.0178}`, `X^(…)` into sub/superscripts, and tokens with 2+ underscores (file names like `Gear_Stress_2026`) into spaces. Dropdown options render HTML and `\( math \)`.
Run `python3 v2/tools/textscan.py <topic>` to list any raw LaTeX-ish text that still shows up unrendered (target: 0 findings).

### Rules of content
1. **Merge both student guides.** Walk the Fizz bible and the Mech ("Dog") bible procedures for the topic; the union of their steps is the step list. Where one has a step the other lacks (e.g. Fizz has rim-thickness factor, Mech has face-width check), include it. Where they disagree, follow the textbook and say so in `text`.
2. **Textbook-specific.** The Shigley file uses Shigley's symbols, equation numbers, table/figure numbers and formulas (e.g. Kv from Eq. 14-27/14-28 with Qv; J from Fig 14-6; Cp Table 14-8; St/Sc Fig 14-2/14-5; Km Eq 14-30…). The Mott file uses Mott's (Kv Fig 9-16 with Av; J Fig 9-17; I Fig 9-18; Cp Table 9-9; sat/sac Fig 9-19/9-22; Km = 1 + Cpf + Cma…). Every lookup must point to a figure entry whose `ref` carries the real number from that book.
3. **Fill the gaps.** Anything the bibles say "look up in textbook" for must be cropped from the textbook PDF and included in `figures`. Crop generously (include axis labels, legend, table title row and footnotes). Use `fig.py find` to locate, `fig.py preview` to see the coordinate grid, `fig.py crop` to save. Name files `fig14-6.png`, `table14-2.png`, `fig9-17b.png` etc. View every crop you produce (Read the PNG) to confirm it is complete and readable.
4. **Where a curve is easy to fit**, give the lookup an `auto` estimate (e.g. Kv formula, Km components, Cp for steel/steel = 2300 √psi) but keep it a yellow lookup so the student can override with the chart reading.
5. **Show the work.** Give the important calcs a `work` line with substituted numbers so students can copy it to an assignment.
6. **Keep it intuitive**: inputs first, geometry next, then forces, then stress/strength, then pass/fail or material selection. Put a final "Result" step with `after` that states PASS/FAIL or the required hardness/material in words.
7. **Don't overcomplicate.** No tabs, no PDF viewer, no optional modes beyond `choice` selects and `when` visibility. One file per (topic, book).
8. If a textbook simply does not cover a topic (e.g. fluid power in Shigley), the file still exists: use the same steps and formulas and note at the top which book the figures come from (`book:'mott'` on those figures).
