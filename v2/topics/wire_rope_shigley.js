// Wire rope — Shigley Ch. 17-6 (merged Fizz §1.7 + Mech §8.3.5.2/8.3.5.3; Example 17-6 mine hoist)
// Course alignment (v2/COURSE_CONVENTIONS.md §0, §5): "Wire Rope 2025" slides, Tutorial 3 Q1, HW1 P8. Defaults: Su (wire) = 240 kpsi for
// fatigue (lower bound of the monitor/IPS range; HW1 calls it "plow steel"), p/Su = 0.0014 (6×19, 10⁶ bends), sheave D = 45d ("better"),
// Fu = (Su)nom × πd²/4 from Table 17-24 with NO Fig 17-20 strength loss (course; Wesco catalogue shown as the check), g = 32.2,
// nf = Ff/Ft without bending (HW1 P8) and (Ff − Fb)/Ft with bending (Tutorial 3); end-fitting efficiency (Flemish eye 92.5 % / 95 %,
// clips 80 %) multiplies nf; wire-rope-clip table (count, turn-back, torque) as a course figure.
// Verified against: Tutorial 3 Q1 (S 17-29, Module 1 p25–30): 2-in 6×19 monitor, 4 tons, 480 ft, a 2 ft/s², D 45d = 90 in → Fu 333 kip,
//   wl 3072, Ft 11.76 kip, Fb 28.6 kip, Ff 30.2 kip (0.0014), n 28.3, ns 25.9, nf(no bending) 2.57, nf 0.14 — reproduced.
// Verified against: HW1 P8 (S 17-31): 2000 ft, 72-in drum, 6×19 monitor, W 8000, a 2 → Ft = 8.5 + 3.4d² kip, Ff = 12.1d kip, nf = Ff/Ft:
//   d 1.625 → 1.125 (max); (b) m = 4, d 0.75 → 2.248; (c) Flemish eye 0.925 × 1.125 = 1.04, clips 0.80 × 1.125 = 0.90; 0.75 in → 4 clips,
//   18 in turn-back, 130 ft·lb — reproduced.
(function () {
  // Table 17-27 (plus Table 17-24 for 8x19): w = k d², sheave D = n d, dw = c d, Am = a d², Er psi
  const ROPE = {
    '6x7':  { w: 1.50, wc: 1.50, Dmin: 42, Dbet: 72, dw: 0.111, Am: 0.38, Er: 13e6, lay: '6x7',  S: { monitor: 100, plow: 88, mild: 76 } },
    '6x19': { w: 1.60, wc: 1.76, Dmin: 30, Dbet: 45, dw: 0.067, Am: 0.40, Er: 12e6, lay: '6x19', S: { monitor: 106, plow: 93, mild: 80 } },
    '6x37': { w: 1.55, wc: 1.71, Dmin: 18, Dbet: 27, dw: 0.048, Am: 0.40, Er: 12e6, lay: '6x37', S: { monitor: 100, plow: 88 } },
    '8x19': { w: 1.45, wc: 1.45, Dmin: 21, Dbet: 26, dw: 1 / 17, Am: 0.38, Er: 10e6, lay: '8x19', S: { monitor: 92, plow: 80 } },
  };
  // wire strength ranges (p. 922): lower bound = conservative (Mech bible)
  const SU = { monitor: [240, 280], plow: [210, 240], mild: [180, 210] };
  // Table 17-26 allowable bearing pressure (psi): [wood, cast iron, cast steel, chilled CI, manganese steel]
  const PALLOW = {
    'regular 6x7': [150, 300, 550, 650, 1470], 'regular 6x19': [250, 480, 900, 1100, 2400], 'regular 6x37': [300, 585, 1075, 1325, 3000], 'regular 8x19': [350, 680, 1260, 1550, 3500],
    'lang 6x7': [165, 350, 600, 715, 1650], 'lang 6x19': [275, 550, 1000, 1210, 2750], 'lang 6x37': [330, 660, 1180, 1450, 3300],
  };
  const SHEAVE = { wood: 0, 'cast iron': 1, 'cast steel': 2, 'chilled cast iron': 3, 'manganese steel': 4 };
  // Figure 17-21 reads: bends to failure (millions) → 1000 p/Su, 6x19 and 6x37 curves
  const BENDS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0];
  const PSU = { '6x19': [3.4, 2.3, 1.9, 1.7, 1.6, 1.5, 1.45, 1.4], '6x37': [3.6, 2.5, 2.1, 1.9, 1.8, 1.75, 1.7, 1.65], '6x7': [3.0, 2.0, 1.65, 1.5, 1.4, 1.3, 1.25, 1.2], '8x19': [3.4, 2.3, 1.9, 1.7, 1.6, 1.5, 1.45, 1.4] };
  // Figure 17-20 reads: D/d → % strength loss
  const LOSS_X = [2, 5, 10, 15, 20, 25, 30, 40], LOSS_Y = [40, 28, 17, 11, 9, 7.5, 6.5, 5];
  const rope = v => ROPE[v.rope];
  // Course clips table: d in → [min clips, turn-back in, torque ft·lb]
  const CLIPS = [[0.125, 2, 3.25, 4.5], [0.1875, 2, 3.75, 7.5], [0.25, 2, 4.75, 15], [0.3125, 2, 5.25, 30], [0.375, 2, 6.5, 45], [0.4375, 2, 7, 65], [0.5, 3, 11.5, 65], [0.5625, 3, 12, 95], [0.625, 3, 12, 95], [0.75, 4, 18, 130], [0.875, 4, 19, 225], [1, 5, 26, 225], [1.125, 6, 34, 225], [1.25, 7, 44, 360], [1.375, 7, 44, 360], [1.5, 8, 54, 360], [1.625, 8, 58, 430], [1.75, 8, 61, 590], [2, 8, 71, 750], [2.25, 8, 73, 750], [2.5, 9, 84, 750], [2.75, 10, 100, 750], [3, 10, 106, 1200]];
  const clipRow = d => { let r = CLIPS.find(x => x[0] >= d - 1e-9); return r || CLIPS[CLIPS.length - 1]; };
  const ETA = { none: 1.0, flemish_large: 0.925, flemish_small: 0.95, clips: 0.80 };

  window.TOPIC = {
    id: 'wire_rope', book: 'shigley',
    title: 'Wire Rope — Strength, Fatigue & Mine Hoist',
    subtitle: 'Shigley Ch. 17-6 (Tables 17-24 … 17-27, Figs. 17-19 … 17-23, Eqs. 17-41 … 17-47) · merged Fizz §1.7 + Mech §8.3.5',
    sibling: 'wire_rope_mott.html',
    intro: 'Shigley\'s wire-rope analysis, written in the mine-hoist form of Example 17-6: rope tension F<sub>t</sub> with acceleration (Eq. 17-47), allowable fatigue tension F<sub>f</sub> from the pressure–strength ratio p/S<sub>u</sub> (Figure 17-21, Eq. 17-44), equivalent bending load F<sub>b</sub> = E<sub>r</sub>d<sub>w</sub>A<sub>m</sub>/D (Eq. 17-41), fatigue and static factors of safety (Eqs. 17-45/17-46), bearing pressure vs sheave material (Eq. 17-42, Table 17-26). Rope properties (w, d<sub>w</sub>, A<sub>m</sub>, E<sub>r</sub>, minimum/better sheave) auto-fill from Table 17-27 in terms of d. For a static-load problem set a = 0 and l = 0 (then F<sub>t</sub> = W/m). To find the best diameter (Mech bible), vary d and watch n<sub>f</sub> — it has a maximum. <b>Course defaults</b> (MECH 325 "Wire Rope 2025" slides, Tutorial 3 Q1, HW1 P8): S<sub>u</sub> = 240 kpsi (wire, lower bound of the monitor/IPS range) for fatigue, p/S<sub>u</sub> = 0.0014 (6×19 at 10⁶ bends), sheave D = 45d unless given, F<sub>u</sub> = (S<sub>u</sub>)<sub>nom</sub>·πd²/4 from Table 17-24 (no Fig 17-20 reduction; Wesco catalogue as a check), g = 32.2 ft/s²; n<sub>f</sub> is reported both without bending (F<sub>f</sub>/F<sub>t</sub>, HW1 P8) and with bending ((F<sub>f</sub> − F<sub>b</sub>)/F<sub>t</sub>, Tutorial 3), and multiplied by the end-fitting efficiency (Flemish eye 92.5–95 %, torqued clips 80 %).',
    example: { W: 8000, m: 1, l: 480, a: 2, D: 90, rope: '6x19', mat: 'monitor', Su: 240, d: 2, bends: 1.0, psu: 1.4, lay: 'regular', sheave: 'cast steel', nreq: 5, fit: 'none' },

    figures: [
      { id: 'fig17-19', ref: 'Figure 17-19', title: 'Types of wire rope: regular lay, Lang lay, 6×7 section', src: 'figures/shigley/fig17-19.png', page: 939 },
      { id: 'table17-24', ref: 'Table 17-24', title: 'Wire-rope data: weight/ft, minimum sheave, sizes, material, outer-wire size, Er, strength', src: 'figures/shigley/table17-24.png', page: 939, note: 'Strength is based on the nominal rope area (kpsi); Am ≈ 0.38d² for haulage/hoisting rope.' },
      { id: 'table17-27', ref: 'Table 17-27', title: 'Useful properties of 6×7, 6×19 and 6×37 ropes (w, D min/better, dw, Am, Er)', src: 'figures/shigley/table17-27.png', page: 944 },
      { id: 'fig17-20', ref: 'Figure 17-20', title: 'Percent strength loss vs D/d ratio', src: 'figures/shigley/fig17-20.png', page: 941, note: 'Reduce the ultimate rope strength by this loss to get Fu.' },
      { id: 'table17-25', ref: 'Table 17-25', title: 'Minimum factors of safety for wire rope by application', src: 'figures/shigley/table17-25.png', page: 941 },
      { id: 'table17-26', ref: 'Table 17-26', title: 'Maximum allowable bearing pressure of ropes on sheaves (psi)', src: 'figures/shigley/table17-26.png', page: 942 },
      { id: 'fig17-21', ref: 'Figure 17-21', title: 'Fatigue: pressure–strength ratio 1000·p/Su vs number of bends to failure', src: 'figures/shigley/fig17-21.png', page: 943, note: 'The ordinate is 1000(p/Su) — divide by 1000. Long life if p/Su < 0.001. If bends not given be conservative (e.g. 1 million for 6×19).' },
      { id: 'fig17-22', ref: 'Figure 17-22', title: 'Relative service life vs D/d ratio', src: 'figures/shigley/fig17-22.png', page: 944 },
      { id: 'fig17-23', ref: 'Figure 17-23', title: 'Geometry of the mine hoist of Example 17-6', src: 'figures/shigley/fig17-23.png', page: 946 },
      { id: 'table7-19', ref: 'Table 7-19', book: 'mott', title: 'Nominal wire rope diameters (Mott) — pick the closest standard size', src: 'figures/mott/table7-19.png', page: 309 },
      { id: 'wesco', ref: 'Wesco 6×19 FC EIPS catalogue (slide 7)', book: 'course', title: 'Wesco 6×19 fibre-core EIPS breaking strengths (bright / galvanised), tons of 2000 lb', src: 'figures/course/wire_rope_wesco_6x19_eips.png', note: 'Check on Fu: 2 in = 352 000 lb vs Table 17-24 nominal 106 kpsi × π(2)²/4 = 333 kip.' },
      { id: 'wesco-wll', ref: 'Wesco WLL sling tables (slide 21)', book: 'course', title: 'Wesco working-load-limit tables for single-leg and 2-leg bridle slings (design factor 5:1, basket D/d = 25)', src: 'figures/course/wire_rope_wesco_wll_slings.png' },
      { id: 'clips', ref: 'Wire-rope clips table (Canvas note, HW1 p19)', book: 'course', title: 'Wire rope clips: minimum number, rope turn-back and torque by rope diameter; 80 % termination efficiency when torqued correctly', src: 'figures/course/wire_rope_clips_table.png', note: '3/4 in → 4 clips, 18 in, 130 ft·lb; 1 in → 5, 26 in, 225; 2 in → 8, 71 in, 750. Flemish eye splice: 92.5 % (1.625 in) / 95 % (0.75 in).' },
    ],

    sections: [
      { title: 'Inputs', steps: [
        { id: 'load', title: 'Load and hoist data', fig: ['fig17-23'],
          text: 'W = weight at the end of the rope (cage + load), m = number of ropes sharing it, l = maximum suspended length, a = maximum acceleration/deceleration. For a static problem use a = 0.',
          vars: [
            { id: 'W', symbol: 'W', label: 'Load at end of rope', unit: 'lbf', kind: 'input' },
            { id: 'm', symbol: 'm', label: 'Number of ropes supporting the load', unit: '', kind: 'input', default: 1 },
            { id: 'l', symbol: 'l', label: 'Maximum suspended rope length', unit: 'ft', kind: 'input', default: 0 },
            { id: 'a', symbol: 'a', label: 'Max acceleration / deceleration', unit: 'ft/s²', kind: 'input', default: 0 },
            { id: 'Ftin', symbol: 'F_t', label: 'Largest working tension if given directly (optional)', unit: 'lbf', kind: 'input', hint: 'overrides the computed Ft' },
          ] },
        { id: 'rope', title: 'Rope selection and properties', fig: ['table17-24', 'table17-27', 'fig17-19', 'table7-19'],
          text: 'Choose construction, wire material and nominal diameter d. Properties auto-fill from Table 17-27 as functions of d (Table 17-24 for 8×19). S<sub>u</sub> is the strength of the <i>wire</i>: improved plow (monitor) 240–280, plow 210–240, mild plow 180–210 kpsi — the auto uses the conservative lower bound. The sheave/drum diameter D should be at least the Table 17-27 minimum (better: the "better" value; mine hoists use D/d<sub>w</sub> = 800–1000).',
          vars: [
            { id: 'rope', label: 'Rope construction', kind: 'choice', type: 'text', options: [{ label: '6 × 7 haulage', value: '6x7' }, { label: '6 × 19 standard hoisting', value: '6x19' }, { label: '6 × 37 special flexible', value: '6x37' }, { label: '8 × 19 extra flexible', value: '8x19' }] },
            { id: 'lay', label: 'Lay', kind: 'choice', type: 'text', options: [{ label: 'Regular lay', value: 'regular' }, { label: 'Lang lay', value: 'lang' }], default: 'regular' },
            { id: 'mat', label: 'Wire material', kind: 'choice', type: 'text', options: [{ label: 'Monitor / improved plow steel', value: 'monitor' }, { label: 'Plow steel', value: 'plow' }, { label: 'Mild plow steel', value: 'mild' }], default: 'monitor' },
            { id: 'd', symbol: 'd', label: 'Nominal rope diameter', unit: 'in', kind: 'input' },
            { id: 'Su', symbol: 'S_u', label: 'Ultimate strength of the wire', unit: 'kpsi', kind: 'lookup', fig: 'fig17-21', auto: v => SU[v.mat] ? SU[v.mat][0] : undefined, hint: 'course: 240 kpsi (lower bound of monitor/IPS 240–280; plow 210–240, mild 180–210)' },
            { id: 'Srope', symbol: 'S_{rope}', label: 'Rope strength on nominal area (Table 17-24)', unit: 'kpsi', kind: 'lookup', fig: 'table17-24', auto: v => (rope(v) && rope(v).S[v.mat] !== undefined) ? rope(v).S[v.mat] : undefined },
            { id: 'w', symbol: 'w', label: 'Weight per foot', unit: 'lbf/ft', kind: 'lookup', fig: 'table17-27', auto: v => (rope(v) && H.has(v, 'd')) ? rope(v).w * v.d * v.d : undefined, hint: 'no core (Mech bible); Table 17-27 also lists w incl. core' },
            { id: 'dw', symbol: 'd_w', label: 'Diameter of the wires', unit: 'in', kind: 'lookup', fig: 'table17-27', auto: v => (rope(v) && H.has(v, 'd')) ? rope(v).dw * v.d : undefined },
            { id: 'Am', symbol: 'A_m', label: 'Area of metal', unit: 'in²', kind: 'lookup', fig: 'table17-27', auto: v => (rope(v) && H.has(v, 'd')) ? rope(v).Am * v.d * v.d : undefined },
            { id: 'Er', symbol: 'E_r', label: 'Rope Young\'s modulus', unit: 'psi', kind: 'lookup', fig: 'table17-27', auto: v => rope(v) ? rope(v).Er : undefined },
            { id: 'Dmin', symbol: 'D_{min}', label: 'Minimum sheave diameter', unit: 'in', kind: 'lookup', fig: 'table17-27', auto: v => (rope(v) && H.has(v, 'd')) ? rope(v).Dmin * v.d : undefined },
            { id: 'Dbet', symbol: 'D_{better}', label: 'Better sheave diameter', unit: 'in', kind: 'lookup', fig: 'table17-27', auto: v => (rope(v) && H.has(v, 'd')) ? rope(v).Dbet * v.d : undefined },
            { id: 'D', symbol: 'D', label: 'Sheave / drum diameter', unit: 'in', kind: 'input', auto: v => (rope(v) && H.has(v, 'd')) ? rope(v).Dbet * v.d : undefined, hint: 'auto = "better" sheave 45d (course Tutorial 3); use the given drum/sheave size if any (HW1 P8: 72 in)',
              check: v => (H.has(v, 'D', 'Dmin') && v.D < v.Dmin) ? 'D below the minimum sheave diameter for this rope' : null },
            { id: 'Dd', symbol: 'D/d', label: 'Sheave-to-rope ratio', unit: '', kind: 'calc', compute: v => H.has(v, 'D', 'd') ? v.D / v.d : undefined },
          ] },
      ] },

      { title: 'Tensions', steps: [
        { id: 'ft', title: 'Rope tension', eq: '17-47', formula: 'F_t = \\left(\\frac{W}{m} + wl\\right)\\left(1 + \\frac{a}{g}\\right),\\quad g = 32.2\\ \\text{ft/s}^2',
          vars: [
            { id: 'Ft', symbol: 'F_t', label: 'Rope tension (largest working tension)', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'Ftin') ? v.Ftin : (H.has(v, 'W', 'm', 'w', 'l', 'a') ? (v.W / v.m + v.w * v.l) * (1 + v.a / 32.2) : undefined),
              work: v => (H.has(v, 'Ft') && !H.has(v, 'Ftin')) ? '\\(F_t = \\left(\\frac{' + H.fmt(v.W) + '}{' + H.fmt(v.m) + '} + ' + H.fmt(v.w) + '(' + H.fmt(v.l) + ')\\right)\\left(1 + \\frac{' + H.fmt(v.a) + '}{32.2}\\right) = ' + H.fmt(v.Ft) + '\\ \\text{lbf}\\)' : null },
          ] },
        { id: 'ff', title: 'Fatigue tension and bending load', fig: ['fig17-21', 'table17-27'], eq: '17-44, 17-41',
          formula: 'F_f = \\frac{(p/S_u)\\,S_u\\,D\\,d}{2},\\qquad F_b = \\frac{E_r d_w A_m}{D}',
          text: 'Read 1000·p/S<sub>u</sub> from Figure 17-21 at the required number of bends (the auto is a read of the 6×19 / 6×37 curves) and divide by 1000. Course standard: p/S<sub>u</sub> = 0.0014 for 6×19 at 10⁶ bends (0.004 at 10⁵ bends — Tutorial 3 part b, where the solution switched to the 72-in drum for D although 90 in was used elsewhere, see COURSE_CONVENTIONS §17). Full bending load F<sub>b</sub> applies when the departure angle exceeds 12°.',
          vars: [
            { id: 'bends', symbol: 'N_{bends}', label: 'Required life, bends to failure', unit: 'millions', kind: 'input', default: 1.0, hint: 'course: 10⁶ bends → p/Su = 0.0014; 10⁵ → 0.004' },
            { id: 'psu', symbol: '1000\\,p/S_u', label: 'Pressure–strength ratio ×1000 (Fig. 17-21)', unit: '', kind: 'lookup', fig: 'fig17-21', auto: v => (PSU[v.rope] && H.has(v, 'bends')) ? H.interp(v.bends, BENDS, PSU[v.rope]) : undefined },
            { id: 'Ff', symbol: 'F_f', label: 'Allowable fatigue tension', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'psu', 'Su', 'D', 'd') ? v.psu / 1000 * v.Su * 1000 * v.D * v.d / 2 : undefined,
              work: v => H.has(v, 'Ff') ? '\\(F_f = \\frac{' + H.fmt(v.psu / 1000, 3) + '(' + H.fmt(v.Su * 1000) + ')(' + H.fmt(v.D) + ')(' + H.fmt(v.d) + ')}{2} = ' + H.fmt(v.Ff) + '\\ \\text{lbf}\\)' : null },
            { id: 'Fb', symbol: 'F_b', label: 'Equivalent bending load', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'Er', 'dw', 'Am', 'D') ? v.Er * v.dw * v.Am / v.D : undefined,
              work: v => H.has(v, 'Fb') ? '\\(F_b = \\frac{' + H.fmt(v.Er, 3) + '(' + H.fmt(v.dw, 3) + ')(' + H.fmt(v.Am, 3) + ')}{' + H.fmt(v.D) + '} = ' + H.fmt(v.Fb) + '\\ \\text{lbf}\\)' : null },
          ] },
        { id: 'fu', title: 'Ultimate rope load Fu (course: nominal strength × nominal area)', fig: ['table17-24', 'wesco', 'fig17-20'],
          formula: 'F_u = (S_u)_{nom}\\,\\frac{\\pi d^2}{4}\\,(1 - \\text{loss}),\\qquad \\text{course: loss} = 0',
          text: 'Course (Tutorial 3): F<sub>u</sub> = Table 17-24 nominal strength × πd²/4 — 106 kpsi × π(2)²/4 = 333 kip for 2-in 6×19 monitor — compared with the Wesco catalogue breaking strength (352 000 lb for 2 in EIPS). The Figure 17-20 strength loss for D/d (Mech bible) is NOT applied by the course; the auto value is 0 — enter a reading only if the question asks for it. If the vendor gives a breaking strength, enter it directly.',
          vars: [
            { id: 'loss', symbol: '\\%', label: 'Strength loss for D/d (Fig. 17-20) — course uses 0', unit: '%', kind: 'lookup', fig: 'fig17-20', auto: v => 0, hint: 'course default 0; read Fig 17-20 only if the question asks for the D/d strength loss' },
            { id: 'Fuin', symbol: 'F_u', label: 'Catalogue breaking strength if given (optional)', unit: 'lbf', kind: 'input', fig: 'wesco', hint: 'Wesco: tons × 2000 lb' },
            { id: 'Fu', symbol: 'F_u', label: 'Ultimate wire load', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'Fuin') ? v.Fuin : (H.has(v, 'Srope', 'd', 'loss') ? v.Srope * 1000 * Math.PI * v.d * v.d / 4 * (1 - v.loss / 100) : undefined),
              work: v => (H.has(v, 'Fu') && !H.has(v, 'Fuin')) ? '\\(F_u = ' + H.fmt(v.Srope) + '(10^3)\\frac{\\pi(' + H.fmt(v.d) + ')^2}{4}(1 - ' + H.fmt(v.loss / 100, 3) + ') = ' + H.fmt(v.Fu) + '\\ \\text{lbf}\\)' : null },
          ] },
      ] },

      { title: 'Factors of safety & bearing pressure', steps: [
        { id: 'fos', title: 'Fatigue and static factors of safety', fig: ['table17-25', 'wesco-wll'], eq: '17-45, 17-46',
          formula: 'n = \\frac{F_u}{F_t},\\qquad n_s = \\frac{F_u - F_b}{F_t},\\qquad n_{f0} = \\frac{F_f}{F_t}\\ (\\text{no bending}),\\qquad n_f = \\frac{F_f - F_b}{F_t}',
          text: 'Required minimum factors: Table 17-25 (mine shafts ≤ 500 ft 8.0, 1000–2000 ft 7.0, 2000–3000 ft 6.0, > 3000 ft 5.0; hoisting 5; haulage, cranes and derricks 6; electric hoists 7; passenger elevators 7.6–11.9). The course reports n<sub>f</sub> both without bending (HW1 P8: n<sub>f</sub> = F<sub>f</sub>/F<sub>t</sub>, maximised over d) and with the bending load (Tutorial 3: (F<sub>f</sub> − F<sub>b</sub>)/F<sub>t</sub> = 0.14 → not acceptable for infinite life).',
          vars: [
            { id: 'nreq', symbol: 'n_{req}', label: 'Required factor of safety', unit: '', kind: 'lookup', fig: 'table17-25', default: 5, hint: 'Table 17-25; hoisting 5 (Wesco slings use 5:1)' },
            { id: 'n0', symbol: 'n', label: 'Simple static factor Fu/Ft', unit: '', kind: 'calc', digits: 4, compute: v => (H.has(v, 'Fu', 'Ft') && v.Ft > 0) ? v.Fu / v.Ft : undefined,
              work: v => H.has(v, 'n0') ? '\\(n = ' + H.fmt(v.Fu) + '/' + H.fmt(v.Ft) + ' = ' + H.fmt(v.n0, 4) + '\\)' : null },
            { id: 'nf0', symbol: 'n_{f0}', label: 'Fatigue factor without bending Ff/Ft (HW1 P8)', unit: '', kind: 'calc', digits: 4, compute: v => (H.has(v, 'Ff', 'Ft') && v.Ft > 0) ? v.Ff / v.Ft : undefined,
              work: v => H.has(v, 'nf0') ? '\\(n_{f0} = ' + H.fmt(v.Ff) + '/' + H.fmt(v.Ft) + ' = ' + H.fmt(v.nf0, 4) + '\\)' : null },
            { id: 'nf', symbol: 'n_f', label: 'Fatigue factor of safety with bending (Eq. 17-45)', unit: '', kind: 'calc', digits: 4, compute: v => (H.has(v, 'Ff', 'Fb', 'Ft') && v.Ft > 0) ? (v.Ff - v.Fb) / v.Ft : undefined,
              work: v => H.has(v, 'nf') ? '\\(n_f = \\frac{' + H.fmt(v.Ff) + ' - ' + H.fmt(v.Fb) + '}{' + H.fmt(v.Ft) + '} = ' + H.fmt(v.nf, 4) + '\\)' : null },
            { id: 'ns', symbol: 'n_s', label: 'Static factor of safety (Fu − Fb)/Ft', unit: '', kind: 'calc', digits: 4, compute: v => (H.has(v, 'Fu', 'Fb', 'Ft') && v.Ft > 0) ? (v.Fu - v.Fb) / v.Ft : undefined },
          ] },
        { id: 'fit', title: 'End fitting efficiency and wire-rope clips (course, HW1 P8c)', fig: ['clips'],
          formula: 'n_{f,fitting} = \\eta\\, n_f,\\qquad \\eta = 0.925\\ (\\text{Flemish eye, 1.625 in}),\\ 0.95\\ (\\text{Flemish eye, 0.75 in}),\\ 0.80\\ (\\text{clips, torqued})',
          text: 'Canvas note / HW1 P8(c): multiply the fatigue factor by the termination efficiency. The clips table gives the minimum number of clips, rope turn-back and torque for the rope size (auto-filled for the nearest listed diameter).',
          vars: [
            { id: 'fit', label: 'End fitting', kind: 'choice', type: 'text', options: [{ label: 'None / ideal (η = 1)', value: 'none' }, { label: 'Flemish eye splice, large rope (92.5 %)', value: 'flemish_large' }, { label: 'Flemish eye splice, small rope (95 %)', value: 'flemish_small' }, { label: 'Wire-rope clips, torqued (80 %)', value: 'clips' }], default: 'none' },
            { id: 'eta', symbol: '\\eta', label: 'Termination efficiency', unit: '', kind: 'lookup', fig: 'clips', auto: v => ETA[v.fit] },
            { id: 'nf0e', symbol: '\\eta n_{f0}', label: 'Fatigue factor (no bending) × efficiency', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'nf0', 'eta') ? v.eta * v.nf0 : undefined,
              work: v => (H.has(v, 'nf0e') && v.eta !== 1) ? '\\(' + H.fmt(v.eta) + '(' + H.fmt(v.nf0, 4) + ') = ' + H.fmt(v.nf0e, 4) + '\\)' : null },
            { id: 'nfe', symbol: '\\eta n_f', label: 'Fatigue factor (with bending) × efficiency', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'nf', 'eta') ? v.eta * v.nf : undefined },
            { id: 'nclips', symbol: '', label: 'Minimum number of clips', unit: '', kind: 'lookup', fig: 'clips', auto: v => H.has(v, 'd') ? clipRow(v.d)[1] : undefined },
            { id: 'turnback', symbol: '', label: 'Rope turn-back', unit: 'in', kind: 'lookup', fig: 'clips', auto: v => H.has(v, 'd') ? clipRow(v.d)[2] : undefined },
            { id: 'torque', symbol: '', label: 'Clip torque', unit: 'ft·lb', kind: 'lookup', fig: 'clips', auto: v => H.has(v, 'd') ? clipRow(v.d)[3] : undefined },
          ] },
        { id: 'bp', title: 'Bearing pressure and sheave material', fig: ['table17-26'], eq: '17-42',
          formula: 'p = \\frac{2F_t}{dD} \\le p_{allow}',
          vars: [
            { id: 'pb', symbol: 'p', label: 'Bearing pressure', unit: 'psi', kind: 'calc', compute: v => H.has(v, 'Ft', 'd', 'D') ? 2 * v.Ft / (v.d * v.D) : undefined,
              work: v => H.has(v, 'pb') ? '\\(p = \\frac{2(' + H.fmt(v.Ft) + ')}{' + H.fmt(v.d) + '(' + H.fmt(v.D) + ')} = ' + H.fmt(v.pb) + '\\ \\text{psi}\\)' : null },
            { id: 'sheave', label: 'Sheave material', kind: 'choice', type: 'text', options: Object.keys(SHEAVE), default: 'cast iron' },
            { id: 'pallow', symbol: 'p_{allow}', label: 'Allowable bearing pressure', unit: 'psi', kind: 'lookup', fig: 'table17-26', auto: v => { const r = PALLOW[(v.lay || 'regular') + ' ' + v.rope]; return (r && SHEAVE[v.sheave] !== undefined) ? r[SHEAVE[v.sheave]] : undefined; },
              check: v => (H.has(v, 'pb', 'pallow') && v.pb > v.pallow) ? 'Bearing pressure exceeds allowable — harder sheave or larger d·D' : null },
          ],
          after: v => {
            if (!H.has(v, 'nf')) return '';
            const req = v.nreq || 5; const eta = H.has(v, 'eta') ? v.eta : 1; const okf = eta * v.nf >= req; const oks = !H.has(v, 'ns') || v.ns >= req; const okp = !H.has(v, 'pb', 'pallow') || v.pb <= v.pallow;
            return ((okf && oks && okp) ? '<span class="result-ok">PASS</span>' : '<span class="result-bad">FAIL</span>') + ' — ' + H.fmt(v.m) + ' × ' + H.fmt(v.d) + ' in ' + (v.rope || '').replace('x', ' × ') + ' rope on a ' + H.fmt(v.D) + ' in sheave (D/d = ' + H.fmt(v.Dd) + '): F<sub>t</sub> = ' + H.fmt(v.Ft) + ' lbf, F<sub>f</sub> = ' + H.fmt(v.Ff) + ' lbf, F<sub>b</sub> = ' + H.fmt(v.Fb) + ' lbf → n<sub>f0</sub> = ' + H.fmt(v.nf0, 3) + ' (no bending), n<sub>f</sub> = ' + H.fmt(v.nf, 3) + (H.has(v, 'ns') ? ', n<sub>s</sub> = ' + H.fmt(v.ns, 3) : '') + (eta !== 1 ? ', × η = ' + H.fmt(eta) + ' → ' + H.fmt(eta * v.nf0, 3) + ' / ' + H.fmt(eta * v.nf, 3) : '') + ' (required ' + H.fmt(req) + ')' + (H.has(v, 'pb', 'pallow') ? '; bearing pressure ' + H.fmt(v.pb) + ' psi vs ' + H.fmt(v.pallow) + ' psi on ' + v.sheave : '') + '. n<sub>f</sub> peaks at an intermediate d — try neighbouring standard sizes (Table 7-19).';
          } },
      ] },
    ],
  };
})();
