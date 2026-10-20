// Wire rope — Mott Ch. 7-7 (merged Fizz §1.7 + Mech §8.3.5.1 Mott guide; Example Problems 7-7 / 7-8), with Shigley mine-hoist equations
// Course alignment (v2/COURSE_CONVENTIONS.md §0, §5): "Wire Rope 2025" slides, Tutorial 3 Q1, HW1 P8. The course designs with Mott (Table 7-25,
// Wesco catalogue) and analyses with Shigley 17-6, so the hoist block below carries the course defaults: Su (wire) = 240 kpsi for fatigue
// (monitor/IPS lower bound; HW1 calls it "plow steel"), p/Su = 0.0014 (6×19, 10⁶ bends), sheave D = 45d ("better") unless a drum is given,
// Fu = (Su)nom × πd²/4 from Shigley Table 17-24 (106 kpsi × π(2)²/4 = 333 kip; Wesco 352 000 lb and Mott Table 7-25 160 tons shown as checks),
// g = 32.2, nf = Ff/Ft without bending (HW1 P8) and (Ff − Fb)/Ft with bending (Tutorial 3), end-fitting efficiency (Flemish eye 92.5 % /
// 95 %, clips 80 %) multiplying nf, wire-rope-clip table (count, turn-back, torque) as a course figure.
// Verified against: Tutorial 3 Q1 (S 17-29, Module 1 p25–30): 2-in 6×19, 4 tons, 480 ft, a 2 ft/s², D 45d = 90 in → Fu 333 kip, wl 3072,
//   Ft 11.76 kip, Fb 28.6 kip, Ff 30.2 kip (0.0014), n 28.3, ns 25.9, nf(no bending) 2.57, nf 0.14 — reproduced.
// Verified against: HW1 P8 (S 17-31): 2000 ft, 72-in drum, 6×19, W 8000, a 2 → Ft = 8.5 + 3.4d² kip, Ff = 12.1d kip, nf = Ff/Ft:
//   d 1.625 → 1.125 (max); (b) m = 4, d 0.75 → 2.248; (c) Flemish eye 0.925 × 1.125 = 1.04, clips 0.80 × 1.125 = 0.90; 0.75 in → 4 clips,
//   18 in turn-back, 130 ft·lb — reproduced.
// Review pass (guide assumptions): Fu in the hoist block now applies the Fig 17-20 D/d strength loss (Mech p.45/51, Shigley p.920; the course
//   Tutorial 3 uses none, so the example sets loss = 0 and still gives 333 kip); Fig 17-21 reads re-digitised (10⁵ bends → 4.1, course 0.004);
//   sheave pitch diameter corrected to D + d (rope centreline, Mott Fig 7-49 — Mech p.41 prints D + 2d), example 104 in (was 106).
(function () {
  // Table 7-22: construction → [suggested D/d, minimum D/d]
  const DD = { '6x7': [72, 42], '6x19 Seale': [51, 34], '6x21 Filler Wire': [45, 30], '6x25 Filler Wire': [39, 26], '6x31 Warrington Seale': [39, 26], '6x36 Warrington Seale': [35, 23], '6x41 Seale Filler Wire': [20, 20], '6x41 Warrington Seale': [32, 21], '6x42 Tiller': [21, 14], '8x19 Seale': [41, 27], '8x25 Filler Wire': [32, 21] };
  // Table 7-23: nominal dia in → groove radius new / worn (in)
  const GR_D = [0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4, 4.5, 5];
  const GR_N = [0.137, 0.201, 0.271, 0.334, 0.401, 0.468, 0.543, 0.669, 0.803, 0.939, 1.070, 1.338, 1.607, 1.869, 2.139, 2.396, 2.663];
  const GR_W = [0.129, 0.190, 0.256, 0.320, 0.380, 0.440, 0.513, 0.639, 0.759, 0.897, 1.019, 1.279, 1.538, 1.794, 2.050, 2.298, 2.557];
  // Table 7-25: dia in → [FC w lb/ft, FC IPS tons, FC XIP tons, IWRC w, IWRC IPS, IWRC XIP]
  const T725 = {
    0.25: [0.105, 2.74, 3.02, 0.116, 2.94, 3.4], 0.3125: [0.164, 4.26, 4.69, 0.18, 4.58, 5.27], 0.375: [0.236, 6.1, 6.72, 0.26, 6.56, 7.55], 0.4375: [0.32, 8.27, 9.1, 0.35, 8.89, 10.2],
    0.5: [0.42, 10.7, 11.8, 0.46, 11.5, 13.3], 0.5625: [0.53, 13.5, 14.9, 0.59, 14.5, 16.8], 0.625: [0.66, 16.7, 18.3, 0.72, 17.9, 20.6], 0.75: [0.95, 23.8, 26.2, 1.04, 25.6, 29.4],
    0.875: [1.29, 32.2, 35.4, 1.42, 34.6, 39.8], 1: [1.68, 41.8, 46, 1.85, 44.9, 51.7], 1.125: [2.13, 52.6, 57.8, 2.34, 56.5, 65], 1.25: [2.63, 64.6, 71.1, 2.89, 69.4, 79.9],
    1.375: [3.18, 77.7, 85.5, 3.5, 83.5, 96], 1.5: [3.78, 92, 101, 4.16, 98.9, 114], 1.625: [4.44, 107, 118, 4.88, 115, 132], 1.75: [5.15, 124, 137, 5.67, 133, 153],
    1.875: [5.91, 141, 156, 6.5, 152, 174], 2: [6.72, 160, 176, 7.39, 172, 198], 2.125: [7.59, 179, 197, 8.35, 192, 221], 2.25: [8.51, 200, 220, 9.36, 215, 247],
  };
  const T725D = Object.keys(T725).map(Number);
  const row = d => { const k = T725D.find(x => Math.abs(x - d) < 1e-6); return k !== undefined ? T725[k] : undefined; };
  const col = v => (v.core === 'IWRC' ? 3 : 0) + (v.grade === 'XIP' ? 2 : v.grade === 'IPS' ? 1 : undefined);
  // Shigley Table 17-27 for the hoist section
  const ROPE = { '6x7': { w: 1.50, dw: 0.111, Am: 0.38, Er: 13e6, Dbet: 72, Dmin: 42, S: { monitor: 100, plow: 88, mild: 76 } },
    '6x19': { w: 1.60, dw: 0.067, Am: 0.40, Er: 12e6, Dbet: 45, Dmin: 30, S: { monitor: 106, plow: 93, mild: 80 } },
    '6x37': { w: 1.55, dw: 0.048, Am: 0.40, Er: 12e6, Dbet: 27, Dmin: 18, S: { monitor: 100, plow: 88 } } };
  // Mott grade → Shigley Table 17-24 material column (course: IPS/XIP → "monitor" 106 kpsi for 6×19; PS → plow 93)
  const SMAT = { IPS: 'monitor', XIP: 'monitor', PS: 'plow' };
  // Shigley Table 17-26 allowable bearing pressure (psi): [wood, cast iron, cast steel, chilled CI, manganese steel]
  const PALLOW = { 'regular 6x7': [150, 300, 550, 650, 1470], 'regular 6x19': [250, 480, 900, 1100, 2400], 'regular 6x37': [300, 585, 1075, 1325, 3000],
    'lang 6x7': [165, 350, 600, 715, 1650], 'lang 6x19': [275, 550, 1000, 1210, 2750], 'lang 6x37': [330, 660, 1180, 1450, 3300] };
  const SHEAVE = { wood: 0, 'cast iron': 1, 'cast steel': 2, 'chilled cast iron': 3, 'manganese steel': 4 };
  // Course clips table (Canvas note / HW1 p19): d in → [min clips, turn-back in, torque ft·lb]
  const CLIPS = [[0.125, 2, 3.25, 4.5], [0.1875, 2, 3.75, 7.5], [0.25, 2, 4.75, 15], [0.3125, 2, 5.25, 30], [0.375, 2, 6.5, 45], [0.4375, 2, 7, 65], [0.5, 3, 11.5, 65], [0.5625, 3, 12, 95], [0.625, 3, 12, 95], [0.75, 4, 18, 130], [0.875, 4, 19, 225], [1, 5, 26, 225], [1.125, 6, 34, 225], [1.25, 7, 44, 360], [1.375, 7, 44, 360], [1.5, 8, 54, 360], [1.625, 8, 58, 430], [1.75, 8, 61, 590], [2, 8, 71, 750], [2.25, 8, 73, 750], [2.5, 9, 84, 750], [2.75, 10, 100, 750], [3, 10, 106, 1200]];
  const clipRow = d => { const r = CLIPS.find(x => x[0] >= d - 1e-9); return r || CLIPS[CLIPS.length - 1]; };
  const ETA = { none: 1.0, flemish_large: 0.925, flemish_small: 0.95, clips: 0.80 };
  // Shigley Fig 17-21 reads (digitised): bends (millions) → 1000 p/Su. 6×7 is not plotted — the lowest (6×12) curve is used as a conservative stand-in.
  const C619 = [[0.06, 5.15], [0.1, 4.09], [0.15, 3.21], [0.2, 2.7], [0.3, 2.11], [0.4, 1.79], [0.5, 1.61], [0.6, 1.52], [0.7, 1.47], [0.8, 1.44], [0.9, 1.42], [1.0, 1.40]];
  const C637 = [[0.06, 5.15], [0.1, 3.84], [0.15, 3.21], [0.2, 2.7], [0.3, 2.11], [0.4, 1.88], [0.5, 1.78], [0.58, 1.77]];
  const C612 = [[0.06, 3.16], [0.08, 2.81], [0.1, 2.55], [0.15, 2.13], [0.2, 1.84], [0.25, 1.62], [0.3, 1.49], [0.4, 1.34], [0.5, 1.25], [0.6, 1.19], [0.7, 1.15], [0.8, 1.13], [0.9, 1.13], [1.0, 1.15]];
  const PSU = { '6x19': C619, '6x37': C637, '6x7': C612 };
  const psuAt = (rope, b) => PSU[rope] ? H.interp(b, PSU[rope].map(x => x[0]), PSU[rope].map(x => x[1])) : undefined;
  // Shigley Fig 17-20 reads (digitised): D/d → % strength loss
  const LOSS_X = [1.5, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 35, 40], LOSS_Y = [44, 38.5, 31.5, 26.5, 23, 20, 16, 13.7, 12, 10, 8, 6.7, 5.8, 5.3, 5.1];
  // wire Su for fatigue (Fig 17-21): course uses the LOWER bound of the range — 240 kpsi for IPS (HW1 "plow steel"); plow 210; XIP treated as 240 (course)
  const SU = { IPS: 240, PS: 210, XIP: 240, MPS: 180 };
  const hoist = v => v.mode === 'hoist';

  window.TOPIC = {
    id: 'wire_rope', book: 'mott',
    title: 'Wire Rope — Sheave/Drum Design & Working Load',
    subtitle: 'Mott Ch. 7-7 (Tables 7-19 … 7-25, Figs. 7-41 … 7-51, Eqs. 7-23 … 7-25) · merged Fizz §1.7 + Mech §8.3.5',
    sibling: 'wire_rope_shigley.html',
    intro: 'Mott\'s wire-rope guide (Mech bible §8.3.5.1, Example Problems 7-7/7-8): nominal diameter (Table 7-19) and classification (Table 7-20) → D/d ratio (Table 7-22) and tread diameter → drum groove depth h = 0.374d, drum diameter D + 2h, groove radius (Table 7-23), pitch 2.065r–2.18r, fleet angle ½°–2° → sheave groove depth 1.5d–1.75d, throat angle 35°–45°, pitch and rim diameters → rope grade (Table 7-24), minimum breaking force and weight (Table 7-25, auto-filled for standard sizes) → maximum working load = breaking force / SF (SF ≥ 5 for human safety). The optional <b>mine-hoist</b> block at the end applies Shigley\'s F<sub>t</sub>, F<sub>f</sub>, F<sub>b</sub>, n<sub>f</sub>, n<sub>s</sub> equations (figures from Shigley) because Mott has no fatigue method — the Mech bible says to use that for any problem with acceleration. <b>Course defaults</b> (MECH 325 "Wire Rope 2025" slides, Tutorial 3 Q1, HW1 P8): the course <i>designs</i> with Mott / Wesco catalogue data and <i>analyses</i> with Shigley 17-6, so the hoist block uses S<sub>u</sub> = 240 kpsi (wire, lower bound of IPS) for fatigue, p/S<sub>u</sub> = 0.0014 (6×19 at 10⁶ bends), sheave D = 45d unless a drum is given, F<sub>u</sub> = (S<sub>u</sub>)<sub>nom</sub>·πd²/4 from Shigley Table 17-24 with no D/d loss (this page applies the Fig 17-20 loss by default, as the Mech bible does — set it to 0 to reproduce the course; Wesco / Table 7-25 breaking strengths as a check), g = 32.2 ft/s²; n<sub>f</sub> is reported without bending (F<sub>f</sub>/F<sub>t</sub>, HW1 P8) and with bending ((F<sub>f</sub> − F<sub>b</sub>)/F<sub>t</sub>, Tutorial 3) and multiplied by the end-fitting efficiency (Flemish eye 92.5–95 %, torqued clips 80 %).',
    example: { d: 2, cons: '6x19 Seale', ratioSel: 'suggested', fleet: 1.0, hs: 3.0, throat: 40, grade: 'IPS', core: 'FC', SF: 5, mode: 'hoist', srope: '6x19', W: 8000, m: 1, L: 480, a: 2, Dh: 90, Su: 240, bends: 1.0, psu: 1.4, loss: 0, nreq: 5, fit: 'none', lay: 'regular', sheave: 'cast steel' },
    assumptions: [
      { text: 'Use the Mott guide (rope, drum, sheave, working load) unless the problem has acceleration or is a mine hoist — then switch on the Shigley hoist block', src: 'Mech p.38', var: 'mode' },
      { text: 'Rope diameter not given → choose a standard size from Table 7-19; rope type given as wires per strand → classify with Table 7-20', src: 'Mech p.38 · Mech p.39', var: 'd' },
      { text: 'Tread diameter D from the SUGGESTED D/d of Table 7-22 (minimum only when space is tight; Mott Ex. 7-7 uses the suggested ratio)', src: 'Mech p.39', var: 'ratioSel' },
      { text: 'Drum: minimum groove depth h = 0.374d, drum diameter = D + 2h', src: 'Mech p.40' },
      { text: 'Groove radius from the "new" column of Table 7-23 unless specified otherwise (re-machine if worn below the "worn" value)', src: 'Mech p.40', var: 'r' },
      { text: 'Drum groove pitch between 2.065r and 2.18r — mid-range used', src: 'Mech p.40', var: 'pitch' },
      { text: 'Fleet angle between ½° and 2° (Mott: at most 1½° on a smooth drum) — 1° used', src: 'Mech p.40', var: 'fleet' },
      { text: 'Sheave throat angle between 35° and 45° — 40° used', src: 'Mech p.41', var: 'throat' },
      { text: 'Sheave groove depth 1.5d–1.75d — the lower limit 1.5d is used', src: 'Mech p.41', var: 'hs' },
      { text: 'Sheave pitch diameter = D + d (measured to the rope centreline, Mott Fig. 7-49 — Mech p.41 prints D + 2d); rim diameter = D + 2h', src: 'Mech p.41' },
      { text: 'Rope grade is often given; otherwise improved plow steel (IPS) with a fibre core', src: 'Mech p.42', var: 'grade' },
      { text: 'Design factor SF = 5 — "just use 5 if not sure"; the minimum for cranes, hoists and anything involving human safety', src: 'Mech p.42', var: 'SF' },
      { text: 'Breaking forces in Table 7-25 are in US tons: 1 ton = 2000 lb', src: 'Mech p.42' },
      { text: 'Hoist block: w without the core, 10⁶ bends for 6×19 if not given (p/S_u = 0.0014), wire S_u at the lower bound (240 kpsi for IPS), g = 32.2 ft/s², D = "better" 45d unless a drum is given', src: 'Mech p.47–50 · course Tutorial 3', var: 'bends' },
      { text: 'Hoist block: F_u = Table 17-24 strength × πd²/4 reduced by the Fig. 17-20 strength loss for D/d; the course (Tutorial 3) uses no reduction — set the loss to 0 to match', src: 'Mech p.45 · Mech p.51', var: 'loss' },
      { text: 'Hoist block: required factor of safety 5 (average operations / hoisting), Table 17-25 for specific cases', src: 'Mech p.45', var: 'nreq' },
    ],

    figures: [
      { id: 'fig7-41', ref: 'Figure 7-41', title: 'Wire rope construction (wires, strands, core)', src: 'figures/mott/fig7-41.png', page: 309 },
      { id: 'table7-19', ref: 'Table 7-19', title: 'Nominal wire rope diameters (in / mm)', src: 'figures/mott/table7-19.png', page: 309 },
      { id: 'table7-20', ref: 'Table 7-20', title: 'Wire rope classification by wires per strand and outer wires', src: 'figures/mott/table7-20.png', page: 310 },
      { id: 'table7-21', ref: 'Table 7-21', title: 'Strand construction: single layer, Seale, filler wire, Warrington, combined', src: 'figures/mott/table7-21.png', page: 310 },
      { id: 'fig7-43', ref: 'Figure 7-43', title: 'Types of lay of wire rope', src: 'figures/mott/fig7-43.png', page: 311 },
      { id: 'table7-22', ref: 'Table 7-22', title: 'Sheave and drum diameter factors — suggested and minimum D/d', src: 'figures/mott/table7-22.png', page: 312 },
      { id: 'fig7-48', ref: 'Figure 7-48', title: 'Relative rope service life vs D/d ratio', src: 'figures/mott/fig7-48.png', page: 313 },
      { id: 'fig7-49', ref: 'Figure 7-49', title: 'Sheave design: tread, pitch and rim diameters, groove depth h, radius r, throat angle', src: 'figures/mott/fig7-49.png', page: 313 },
      { id: 'table7-23', ref: 'Table 7-23', title: 'Recommended sheave and drum groove radius (new / worn)', src: 'figures/mott/table7-23.png', page: 314, note: 'Use "new" unless told otherwise; a groove worn below the "worn" radius must be re-machined.' },
      { id: 'fig7-50', ref: 'Figure 7-50', title: 'Grooved drum design details: pitch, groove depth h, flange and drum diameters', src: 'figures/mott/fig7-50.png', page: 314 },
      { id: 'fig7-51', ref: 'Figure 7-51', title: 'Fleet angle', src: 'figures/mott/fig7-51.png', page: 315 },
      { id: 'table7-24', ref: 'Table 7-24', title: 'Grades of wire rope: PS, IPS, XIP tensile strengths', src: 'figures/mott/table7-24.png', page: 315 },
      { id: 'table7-25', ref: 'Table 7-25', title: '6×19 and 6×36 class technical data: weight/ft and minimum breaking force (tons) for IPS/XIP, fiber core and IWRC', src: 'figures/mott/table7-25.png', page: 316 },
      { id: 'table7-26', ref: 'Table 7-26', title: 'Properties of standard 6×19 and 6×36 ropes', src: 'figures/mott/table7-26.png', page: 317 },
      { id: 'table17-27', ref: 'Table 17-27', book: 'shigley', title: 'Shigley rope properties for the hoist equations (w, dw, Am, Er)', src: 'figures/shigley/table17-27.png', page: 944 },
      { id: 'fig17-20', ref: 'Figure 17-20', book: 'shigley', title: 'Shigley percent strength loss vs D/d ratio', src: 'figures/shigley/fig17-20.png', page: 941, note: 'Reduce the rope strength by this loss to get Fu (Mech p.45); the course Tutorial 3 uses no reduction.' },
      { id: 'fig17-21', ref: 'Figure 17-21', book: 'shigley', title: 'Shigley fatigue chart 1000·p/Su vs bends to failure', src: 'figures/shigley/fig17-21.png', page: 943, note: 'Divide the reading by 1000.' },
      { id: 'fig17-23', ref: 'Figure 17-23', book: 'shigley', title: 'Mine hoist geometry (Shigley Example 17-6)', src: 'figures/shigley/fig17-23.png', page: 946 },
      { id: 'table17-25', ref: 'Table 17-25', book: 'shigley', title: 'Shigley minimum factors of safety by application', src: 'figures/shigley/table17-25.png', page: 941 },
      { id: 'table17-24', ref: 'Table 17-24', book: 'shigley', title: 'Shigley wire-rope data: nominal strength (kpsi on πd²/4), weight, minimum sheave, Er', src: 'figures/shigley/table17-24.png', page: 939, note: 'Course: Fu = nominal strength × πd²/4 (6×19 monitor/IPS 106 kpsi → 333 kip for 2 in).' },
      { id: 'table17-26', ref: 'Table 17-26', book: 'shigley', title: 'Shigley maximum allowable bearing pressure of ropes on sheaves (psi)', src: 'figures/shigley/table17-26.png', page: 942 },
      { id: 'wesco', ref: 'Wesco 6×19 FC EIPS catalogue (slide 7)', book: 'course', title: 'Wesco 6×19 fibre-core EIPS breaking strengths (bright / galvanised), tons of 2000 lb', src: 'figures/course/wire_rope_wesco_6x19_eips.png', note: 'Check on Fu: 2 in = 352 000 lb vs Table 17-24 nominal 106 kpsi × π(2)²/4 = 333 kip (Mott Table 7-25: 160 tons = 320 kip).' },
      { id: 'wesco-wll', ref: 'Wesco WLL sling tables (slide 21)', book: 'course', title: 'Wesco working-load-limit tables for single-leg and 2-leg bridle slings (design factor 5:1, basket D/d = 25)', src: 'figures/course/wire_rope_wesco_wll_slings.png' },
      { id: 'clips', ref: 'Wire-rope clips table (Canvas note, HW1 p19)', book: 'course', title: 'Wire rope clips: minimum number, rope turn-back and torque by rope diameter; 80 % termination efficiency when torqued correctly', src: 'figures/course/wire_rope_clips_table.png', note: '3/4 in → 4 clips, 18 in, 130 ft·lb; 1 in → 5, 26 in, 225; 2 in → 8, 71 in, 750. Flemish eye splice: 92.5 % (1.625 in) / 95 % (0.75 in).' },
      { id: 'wesco-iwrc', ref: 'Wesco 6×19 IWRC catalogue (slide 8)', book: 'course', title: 'Wesco PowerStrand 6×19 IWRC class: weight per foot and minimum breaking strength (bright / galvanised EIPS)', src: 'figures/course/wire_rope_wesco_6x19_iwrc.png', note: 'Wire Rope 2025.pdf slide 8 (Wesco Industries catalogue page; that catalogue is not in the course catalogue folder). Use for IWRC ropes; FC ropes use slide 7.' },
      { id: 'wesco-7x19', ref: 'Wesco 7×7 / 7×19 aircraft cable (slide 9)', book: 'course', title: 'Wesco galvanised 7×7 and 7×19 “aircraft cable”: weight per foot and minimum breaking strength (IPS)', src: 'figures/course/wire_rope_wesco_7x7_7x19_aircraft.png', note: 'Wire Rope 2025.pdf slide 9. Small-diameter control cables; not to be used on aircraft.' },
      { id: 'wesco-pro34k', ref: 'Wesco PRO34K (slide 11)', book: 'course', title: 'Wesco PRO34K compacted non-rotating rope (35×7): minimum breaking strength, mm sizes', src: 'figures/course/wire_rope_wesco_pro34k.png', note: 'Wire Rope 2025.pdf slide 11. For cranes where a free rope end could spin (slide 10).' },
      { id: 'wesco-eff', ref: 'Wesco end-fitting efficiency ratings (slide 23)', book: 'course', title: 'Choice of end fittings and termination efficiency ratings: Flemish eye / pressed sleeve 95–92.5–90 %, hand-tucked splice, swaged and spelter sockets 100 %, wedge socket 75–90 %, clips 80 %', src: 'figures/course/wire_rope_wesco_end_fitting_efficiency.png', note: 'Wire Rope 2025.pdf slide 23; the same table is pasted in HW1 Solutions p.17 for P8(c). Multiply the rope strength (or n_f) by the efficiency.' },
      { id: 'wr-knuckle', ref: 'Full bending vs knuckle sheaves (slide 13)', book: 'course', title: 'When full bending occurs (departure angle > about 12°) and knuckle sheaves (several small sheaves, < 10° each)', src: 'figures/course/wire_rope_full_bending_knuckle_sheaves.png', note: 'Wire Rope 2025.pdf slide 13.' },
      { id: 'wc-dd', ref: 'West Coast sheave D/d factors (catalogue p.17)', book: 'course', title: 'West Coast Wire Rope: bending efficiency vs D/d, relative service life vs D/d, suggested minimum D/d by construction (6×19 S 34, 6×25 FW 26, 6×36 WS 23 …), groove tolerances', src: 'figures/course/westcoast_sheave_dd_bending_efficiency.png', note: 'west coast wire rope catelogue.pdf p.18 (printed 17). Catalogue counterpart of Shigley Fig 17-20/17-21 and Mott Table 7-22.' },
      { id: 'wc-6x19', ref: 'West Coast 6×19 bright FC / IWRC (catalogue p.22)', book: 'course', title: 'West Coast Wire Rope general-purpose bright 6×19 class: weight and breaking strength in tons, fibre core and IWRC (EIPS)', src: 'figures/course/westcoast_6x19_bright_fc_iwrc.png', note: 'west coast wire rope catelogue.pdf p.23 (printed 22). Breaking strength in tons of 2000 lb.' },
    ],

    sections: [
      { title: 'Step 1–2: rope and tread diameter', steps: [
        { id: 'rope', title: 'Rope diameter, classification and D/d ratio', fig: ['table7-19', 'table7-20', 'table7-21', 'table7-22', 'fig7-48', 'wc-dd', 'wr-knuckle'],
          formula: 'D = \\left(\\frac{D}{d}\\right)_{\\text{Table 7-22}} \\times d',
          text: 'If the rope type is given as "wires per strand", classify it with Table 7-20. Use the suggested D/d for long life, the minimum only when space is tight (Figure 7-48 shows the life penalty).',
          vars: [
            { id: 'd', symbol: 'd', label: 'Nominal rope diameter', unit: 'in', kind: 'input', hint: 'standard sizes in Table 7-19' },
            { id: 'cons', label: 'Rope construction', kind: 'choice', type: 'text', options: Object.keys(DD) },
            { id: 'ratioSel', label: 'Use which D/d', kind: 'choice', type: 'text', options: [{ label: 'Suggested', value: 'suggested' }, { label: 'Minimum', value: 'minimum' }], default: 'suggested' },
            { id: 'Dd', symbol: 'D/d', label: 'Sheave/drum diameter factor', unit: '', kind: 'lookup', fig: 'table7-22', auto: v => DD[v.cons] ? DD[v.cons][v.ratioSel === 'minimum' ? 1 : 0] : undefined, hint: 'Table 7-22 suggested / minimum (6×19 Seale: 51 / 34)' },
            { id: 'D', symbol: 'D', label: 'Tread diameter', unit: 'in', kind: 'calc', compute: v => H.has(v, 'Dd', 'd') ? v.Dd * v.d : undefined,
              work: v => H.has(v, 'D') ? '\\(D = ' + H.fmt(v.Dd) + '(' + H.fmt(v.d) + ') = ' + H.fmt(v.D) + '\\ \\text{in}\\)' : null },
          ] },
      ] },

      { title: 'Step 3: drum', steps: [
        { id: 'drum', title: 'Drum groove depth, drum diameter, groove radius, pitch, fleet angle', fig: ['fig7-50', 'table7-23', 'fig7-51'], eq: '7-24, 7-25',
          formula: 'h_{drum} = 0.374d,\\qquad D_{drum} = D + 2h,\\qquad 2.065r < p < 2.18r,\\qquad 0.5^\\circ \\le \\text{fleet angle} \\le 2^\\circ',
          vars: [
            { id: 'hd', symbol: 'h_{drum}', label: 'Minimum drum groove depth', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'd') ? 0.374 * v.d : undefined,
              work: v => H.has(v, 'hd') ? '\\(h = 0.374(' + H.fmt(v.d) + ') = ' + H.fmt(v.hd, 4) + '\\ \\text{in}\\)' : null },
            { id: 'Ddrum', symbol: 'D_{drum}', label: 'Drum diameter', unit: 'in', kind: 'calc', compute: v => H.has(v, 'D', 'hd') ? v.D + 2 * v.hd : undefined,
              work: v => H.has(v, 'Ddrum') ? '\\(D_{drum} = ' + H.fmt(v.D) + ' + 2(' + H.fmt(v.hd, 4) + ') = ' + H.fmt(v.Ddrum) + '\\ \\text{in}\\)' : null },
            { id: 'r', symbol: 'r', label: 'Groove radius (new)', unit: 'in', kind: 'lookup', fig: 'table7-23', auto: v => H.has(v, 'd') ? H.interp(v.d, GR_D, GR_N) : undefined, hint: 'Table 7-23 "new" column (auto interpolates)' },
            { id: 'rw', symbol: 'r_{worn}', label: 'Groove radius (worn limit)', unit: 'in', kind: 'lookup', fig: 'table7-23', auto: v => H.has(v, 'd') ? H.interp(v.d, GR_D, GR_W) : undefined, hint: 'Table 7-23 "worn" column' },
            { id: 'pmin', symbol: 'p_{min}', label: 'Groove pitch lower limit 2.065r', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'r') ? 2.065 * v.r : undefined },
            { id: 'pmax', symbol: 'p_{max}', label: 'Groove pitch upper limit 2.18r', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'r') ? 2.18 * v.r : undefined },
            { id: 'pitch', symbol: 'p', label: 'Chosen groove pitch', unit: 'in', kind: 'input', auto: v => H.has(v, 'pmin', 'pmax') ? (v.pmin + v.pmax) / 2 : undefined,
              check: v => (H.has(v, 'pitch', 'pmin', 'pmax') && (v.pitch < v.pmin || v.pitch > v.pmax)) ? 'Pitch outside 2.065r–2.18r' : null },
            { id: 'fleet', symbol: '', label: 'Fleet angle', unit: '°', kind: 'input', default: 1.0, check: v => (H.has(v, 'fleet') && (v.fleet < 0.5 || v.fleet > 2)) ? 'Fleet angle must be ½°–2° (max 1½° on a smooth drum)' : null },
          ] },
      ] },

      { title: 'Step 4: sheave', steps: [
        { id: 'sheave', title: 'Sheave groove depth, throat angle, pitch and rim diameters', fig: ['fig7-49'], eq: '7-23',
          formula: '1.5d \\le h_{sheave} \\le 1.75d,\\qquad 35^\\circ \\le \\text{throat} \\le 45^\\circ,\\qquad D_{pitch} = D + d,\\qquad D_{rim} = D + 2h_{sheave}',
          text: 'Pitch diameter is measured to the rope centreline (Figure 7-49): tread diameter plus one rope diameter. The Mech bible (p.41) prints D + 2d, which would put the pitch circle a full rope diameter above the tread.',
          vars: [
            { id: 'hsmin', symbol: 'h_{min}', label: 'Groove depth lower limit 1.5d', unit: 'in', kind: 'calc', compute: v => H.has(v, 'd') ? 1.5 * v.d : undefined },
            { id: 'hsmax', symbol: 'h_{max}', label: 'Groove depth upper limit 1.75d', unit: 'in', kind: 'calc', compute: v => H.has(v, 'd') ? 1.75 * v.d : undefined },
            { id: 'hs', symbol: 'h_{sheave}', label: 'Chosen sheave groove depth', unit: 'in', kind: 'input', auto: v => H.has(v, 'd') ? 1.5 * v.d : undefined,
              check: v => (H.has(v, 'hs', 'hsmin', 'hsmax') && (v.hs < v.hsmin - 1e-9 || v.hs > v.hsmax + 1e-9)) ? 'Outside 1.5d–1.75d' : null },
            { id: 'throat', symbol: '', label: 'Throat angle', unit: '°', kind: 'input', default: 40, check: v => (H.has(v, 'throat') && (v.throat < 35 || v.throat > 45)) ? 'Throat angle must be 35°–45°' : null },
            { id: 'Dpitch', symbol: 'D_{pitch}', label: 'Sheave pitch diameter (to rope centreline)', unit: 'in', kind: 'calc', compute: v => H.has(v, 'D', 'd') ? v.D + v.d : undefined,
              work: v => H.has(v, 'Dpitch') ? '\\(D_{pitch} = D + d = ' + H.fmt(v.D) + ' + ' + H.fmt(v.d) + ' = ' + H.fmt(v.Dpitch) + '\\ \\text{in}\\)' : null },
            { id: 'Drim', symbol: 'D_{rim}', label: 'Sheave rim diameter', unit: 'in', kind: 'calc', compute: v => H.has(v, 'D', 'hs') ? v.D + 2 * v.hs : undefined },
          ] },
      ] },

      { title: 'Steps 5–6: grade and working load', steps: [
        { id: 'wl', title: 'Rope grade, breaking force and maximum working load', fig: ['table7-24', 'table7-25', 'table7-26', 'wesco', 'wesco-wll', 'wesco-iwrc', 'wesco-7x19', 'wesco-pro34k', 'wc-6x19'],
          formula: '\\text{Max. working load} = \\frac{\\text{Min. breaking force}}{SF}\\qquad(1\\ \\text{ton} = 2000\\ \\text{lb})',
          text: 'Table 7-25 covers the 6×19 and 6×36 classes with fibre core (FC) or IWRC in IPS and XIP; breaking force auto-fills for standard diameters. SF ≥ 5 for overhead cranes, gantry cranes, hoists and anything involving human safety (Mech bible: "just use 5 if not sure").',
          vars: [
            { id: 'grade', label: 'Rope grade', kind: 'choice', type: 'text', options: [{ label: 'PS — plow steel (1570 N/mm²)', value: 'PS' }, { label: 'IPS — improved plow steel (1770 N/mm²)', value: 'IPS' }, { label: 'XIP — extra improved plow steel (1960 N/mm²)', value: 'XIP' }], default: 'IPS' },
            { id: 'core', label: 'Core', kind: 'choice', type: 'text', options: [{ label: 'Fiber core (FC)', value: 'FC' }, { label: 'IWRC — independent wire rope core', value: 'IWRC' }], default: 'FC' },
            { id: 'Fbr', symbol: 'F_{br}', label: 'Minimum breaking force', unit: 'tons', kind: 'lookup', fig: 'table7-25', auto: v => { const r = H.has(v, 'd') ? row(v.d) : undefined; const c = col(v); return (r && c !== undefined) ? r[c] : undefined; }, hint: 'PS is not tabulated — scale IPS by 1570/1770' },
            { id: 'wft', symbol: 'w', label: 'Weight per foot', unit: 'lb/ft', kind: 'lookup', fig: 'table7-25', auto: v => { const r = H.has(v, 'd') ? row(v.d) : undefined; return r ? r[v.core === 'IWRC' ? 3 : 0] : undefined; }, hint: 'Table 7-25 FC / IWRC column (2 in FC: 6.72 lb/ft)' },
            { id: 'SF', symbol: 'SF', label: 'Service (design) factor', unit: '', kind: 'input', default: 5, check: v => (H.has(v, 'SF') && v.SF < 5) ? 'SF < 5 is not allowed where human safety is involved' : null },
            { id: 'MWL', symbol: '', label: 'Maximum working load', unit: 'tons', kind: 'calc', compute: v => H.has(v, 'Fbr', 'SF') ? v.Fbr / v.SF : undefined,
              work: v => H.has(v, 'MWL') ? '\\(\\text{MWL} = ' + H.fmt(v.Fbr) + '/' + H.fmt(v.SF) + ' = ' + H.fmt(v.MWL) + '\\ \\text{tons} = ' + H.fmt(v.MWL * 2000) + '\\ \\text{lb}\\)' : null },
            { id: 'MWLlb', symbol: '', label: 'Maximum working load', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'MWL') ? v.MWL * 2000 : undefined },
          ] },
        { id: 'wl2', title: 'Applied load vs maximum working load', fig: ['wesco-wll'],
          text: 'Compare the applied load (including rope weight and any shock allowance) with the MWL; the Wesco sling tables use the same 5:1 design factor.',
          vars: [
            { id: 'Wapp', symbol: 'W', label: 'Applied load incl. rope weight and shock (optional)', unit: 'lb', kind: 'input', check: v => (H.has(v, 'Wapp', 'MWLlb') && v.Wapp > v.MWLlb) ? 'Applied load exceeds the maximum working load' : null },
            { id: 'Lrope', symbol: 'L', label: 'Rope length (optional, for total rope weight)', unit: 'ft', kind: 'input' },
            { id: 'Wrope', symbol: 'wL', label: 'Total rope weight', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'wft', 'Lrope') ? v.wft * v.Lrope : undefined },
          ],
          after: v => {
            if (!H.has(v, 'MWL')) return '';
            const ok = !H.has(v, 'Wapp') || v.Wapp <= v.MWLlb;
            return (ok ? '<span class="result-ok">OK</span>' : '<span class="result-bad">OVERLOADED</span>') + ' — ' + H.fmt(v.d) + ' in ' + (v.cons || '') + ' ' + (v.grade || '') + ' ' + (v.core || '') + ' rope: breaking force ' + H.fmt(v.Fbr) + ' tons, MWL = ' + H.fmt(v.MWL) + ' tons = ' + H.fmt(v.MWLlb) + ' lb at SF = ' + H.fmt(v.SF) + '; tread D = ' + H.fmt(v.D) + ' in, drum ' + H.fmt(v.Ddrum) + ' in, sheave pitch ' + H.fmt(v.Dpitch) + ' in / rim ' + H.fmt(v.Drim) + ' in.';
          } },
      ] },

      { title: 'Mine-hoist / acceleration analysis (Shigley 17-6 — the course method)', text: 'Mott has no fatigue method. For problems with acceleration or a required fatigue factor the course (Tutorial 3, HW1 P8) and the Mech bible switch to Shigley §17-6 (Example 17-6); the equations are Shigley\'s with the course defaults.', steps: [
        { id: 'mode', title: 'Enable hoist analysis', vars: [
          { id: 'mode', label: 'Analysis', kind: 'choice', type: 'text', options: [{ label: 'Not needed (static working-load check above)', value: 'none' }, { label: 'Mine hoist — tension, fatigue and static factors of safety (course)', value: 'hoist' }], default: 'none' },
        ],
          after: v => { if (hoist(v) || !H.has(v, 'MWL')) return '';
            const ok = !H.has(v, 'Wapp') || v.Wapp <= v.MWLlb;
            return (ok ? '<span class="result-ok">PASS</span>' : '<span class="result-bad">FAIL</span>') + ' — static working-load check: MWL = ' + H.fmt(v.MWL) + ' tons = ' + H.fmt(v.MWLlb) + ' lb at SF = ' + H.fmt(v.SF) + (H.has(v, 'Wapp') ? ' vs applied ' + H.fmt(v.Wapp) + ' lb' : ' (enter the applied load above to compare)') + '. Switch on the hoist analysis for acceleration / fatigue problems.'; } },
        { id: 'hin', title: 'Load and hoist data', fig: ['fig17-23', 'table17-27'], when: hoist,
          text: 'W = weight at the end of the rope (cage + load), m = ropes sharing it, L = maximum suspended length, a = maximum acceleration. D for the hoist equations: the course uses the "better" sheave 45d (Tutorial 3: 90 in for a 2-in rope) unless the problem gives a drum (HW1 P8: 72 in) — the auto is 45d from Shigley Table 17-27, not the Mott Table 7-22 tread diameter above.',
          vars: [
            { id: 'srope', label: 'Shigley rope class', kind: 'choice', type: 'text', options: [{ label: '6 × 7 haulage', value: '6x7' }, { label: '6 × 19 standard hoisting', value: '6x19' }, { label: '6 × 37 special flexible', value: '6x37' }], default: '6x19' },
            { id: 'W', symbol: 'W', label: 'Weight at the end of the rope', unit: 'lb', kind: 'input' },
            { id: 'm', symbol: 'm', label: 'Number of ropes', unit: '', kind: 'input', default: 1 },
            { id: 'L', symbol: 'L', label: 'Max suspended length', unit: 'ft', kind: 'input', default: 0 },
            { id: 'a', symbol: 'a', label: 'Max acceleration', unit: 'ft/s²', kind: 'input', default: 0 },
            { id: 'Dh', symbol: 'D', label: 'Sheave / drum diameter for the hoist equations', unit: 'in', kind: 'input', auto: v => (ROPE[v.srope] && H.has(v, 'd')) ? ROPE[v.srope].Dbet * v.d : undefined, hint: 'auto = "better" 45d (course Tutorial 3); enter the given drum (HW1 P8: 72 in)',
              check: v => (ROPE[v.srope] && H.has(v, 'Dh', 'd') && v.Dh < ROPE[v.srope].Dmin * v.d) ? 'Below the Table 17-27 minimum sheave (' + ROPE[v.srope].Dmin + 'd)' : null },
            { id: 'Ftin', symbol: 'F_t', label: 'Largest working tension if given directly (optional)', unit: 'lb', kind: 'input', hint: 'overrides the computed Ft' },
          ] },
        { id: 'hprop', title: 'Rope properties for the hoist equations (Shigley Tables 17-27 / 17-24)', fig: ['table17-27', 'table17-24', 'fig17-21'], when: hoist,
          text: 'Properties as functions of d: w = 1.60d² lb/ft (no core — course: wl = 1.6(4)(480) = 3072 lb), d<sub>w</sub> = 0.067d, A<sub>m</sub> = 0.40d², E<sub>r</sub> = 12 Mpsi for 6×19. S<sub>u</sub> is the strength of the <i>wire</i> for Fig 17-21 — course: 240 kpsi (lower bound of IPS 240–280). (S<sub>u</sub>)<sub>nom</sub> is the Table 17-24 rope strength on the nominal area, used for F<sub>u</sub>.',
          vars: [
            { id: 'ws', symbol: 'w', label: 'Weight per foot (Shigley, no core)', unit: 'lb/ft', kind: 'lookup', fig: 'table17-27', auto: v => (ROPE[v.srope] && H.has(v, 'd')) ? ROPE[v.srope].w * v.d * v.d : undefined, hint: 'Table 17-27: 1.50d², 1.60d², 1.55d² (Mott Table 7-25 w incl. core is slightly higher)' },
            { id: 'dw', symbol: 'd_w', label: 'Wire diameter', unit: 'in', kind: 'lookup', fig: 'table17-27', auto: v => (ROPE[v.srope] && H.has(v, 'd')) ? ROPE[v.srope].dw * v.d : undefined, hint: 'Table 17-27: 0.111d, 0.067d, 0.048d' },
            { id: 'Am', symbol: 'A_m', label: 'Metal area', unit: 'in²', kind: 'lookup', fig: 'table17-27', auto: v => (ROPE[v.srope] && H.has(v, 'd')) ? ROPE[v.srope].Am * v.d * v.d : undefined, hint: 'Table 17-27: 0.38d², 0.40d², 0.40d²' },
            { id: 'Er', symbol: 'E_r', label: 'Rope modulus', unit: 'psi', kind: 'lookup', fig: 'table17-27', auto: v => ROPE[v.srope] ? ROPE[v.srope].Er : undefined, hint: 'Table 17-27: 13, 12, 12 Mpsi' },
            { id: 'Su', symbol: 'S_u', label: 'Wire ultimate strength (fatigue)', unit: 'kpsi', kind: 'lookup', fig: 'fig17-21', auto: v => SU[v.grade], hint: 'course: 240 kpsi (IPS lower bound; HW1 "plow steel"); PS 210; mild 180' },
            { id: 'Srope', symbol: '(S_u)_{nom}', label: 'Rope strength on nominal area (Table 17-24)', unit: 'kpsi', kind: 'lookup', fig: 'table17-24', auto: v => { const r = ROPE[v.srope]; const mt = SMAT[v.grade]; return (r && mt && r.S[mt] !== undefined) ? r.S[mt] : undefined; }, hint: '6×19: monitor/IPS 106, plow 93, mild 80 kpsi (course Tutorial 3: 106)' },
          ] },
        { id: 'hten', title: 'Rope tension and ultimate load (Fu = (Su)nom × πd²/4, less the D/d strength loss)', eq: '17-47', fig: ['table17-24', 'fig17-20', 'wesco', 'table7-25', 'wesco-iwrc'], when: hoist,
          formula: 'F_t = \\left(\\frac{W}{m} + wL\\right)\\left(1 + \\frac{a}{32.2}\\right),\\qquad F_u = (S_u)_{nom}\\,\\frac{\\pi d^2}{4}\\,(1 - \\text{loss})',
          text: 'Mech bible (p.45, p.51) and Shigley p.920: reduce the rope strength by the Figure 17-20 strength loss at the actual D/d (auto = a read of the curve, ≈ 5 % at D/d ≥ 40). <b>Course:</b> Tutorial 3 uses no reduction — F<sub>u</sub> = 106 kpsi × π(2)²/4 = 333 kip — so enter 0 for the loss to match; compare with the Wesco catalogue (352 000 lb for 2-in EIPS) and Mott Table 7-25 (160 tons = 320 kip). If the question gives a catalogue breaking strength, enter it to override.',
          vars: [
            { id: 'Ft', symbol: 'F_t', label: 'Rope tension (largest working tension)', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'Ftin') ? v.Ftin : (H.has(v, 'W', 'm', 'ws', 'L', 'a') ? (v.W / v.m + v.ws * v.L) * (1 + v.a / 32.2) : undefined),
              work: v => (H.has(v, 'Ft') && !H.has(v, 'Ftin')) ? '\\(F_t = \\left(\\frac{' + H.fmt(v.W) + '}{' + H.fmt(v.m) + '} + ' + H.fmt(v.ws) + '(' + H.fmt(v.L) + ')\\right)\\left(1 + \\frac{' + H.fmt(v.a) + '}{32.2}\\right) = ' + H.fmt(v.Ft) + '\\ \\text{lb}\\)' : null },
            { id: 'Fbrlb', symbol: 'F_{br}', label: 'Mott Table 7-25 breaking force (for comparison)', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'Fbr') ? v.Fbr * 2000 : undefined },
            { id: 'Fuin', symbol: 'F_u', label: 'Catalogue breaking strength if given (optional)', unit: 'lb', kind: 'input', fig: 'wesco', hint: 'Wesco: tons × 2000 lb; leave blank for the course Table 17-24 value' },
            { id: 'loss', symbol: '\\%', label: 'Strength loss for D/d (Fig. 17-20)', unit: '%', kind: 'lookup', fig: 'fig17-20', auto: v => H.has(v, 'Dh', 'd') ? H.interp(v.Dh / v.d, LOSS_X, LOSS_Y) : undefined, hint: 'auto = Fig 17-20 at D/d (Mech p.45); course Tutorial 3 uses 0' },
            { id: 'Fu', symbol: 'F_u', label: 'Ultimate rope load used', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'Fuin') ? v.Fuin : (H.has(v, 'Srope', 'd') ? v.Srope * 1000 * Math.PI * v.d * v.d / 4 * (1 - (H.has(v, 'loss') ? v.loss : 0) / 100) : undefined),
              work: v => (H.has(v, 'Fu') && !H.has(v, 'Fuin')) ? '\\(F_u = ' + H.fmt(v.Srope) + '(10^3)\\frac{\\pi(' + H.fmt(v.d) + ')^2}{4}(1 - ' + H.fmt((H.has(v, 'loss') ? v.loss : 0) / 100, 3) + ') = ' + H.fmt(v.Fu) + '\\ \\text{lb}\\)' : null },
          ] },
        { id: 'hfat', title: 'Fatigue tension and bending load', eq: '17-44, 17-41', fig: ['fig17-21', 'table17-27'], when: hoist,
          formula: 'F_f = \\frac{(p/S_u)\\,S_u\\,D\\,d}{2},\\qquad F_b = \\frac{E_r d_w A_m}{D}',
          text: 'Read 1000·p/S<sub>u</sub> from Fig 17-21 at the required number of bends and divide by 1000. Course standard: p/S<sub>u</sub> = 0.0014 for 6×19 at 10⁶ bends (0.004 at 10⁵ — Tutorial 3 part b, where the solution switched to the 72-in drum for D; see COURSE_CONVENTIONS §17). Full bending load F<sub>b</sub> applies when the departure angle exceeds 12°.',
          vars: [
            { id: 'bends', symbol: 'N_{bends}', label: 'Required life, bends to failure', unit: 'millions', kind: 'input', default: 1.0, hint: 'course: 10⁶ bends → p/Su = 0.0014; 10⁵ → 0.004' },
            { id: 'psu', symbol: '1000\\,p/S_u', label: 'Pressure–strength ratio ×1000 (Fig 17-21)', unit: '', kind: 'lookup', fig: 'fig17-21', auto: v => H.has(v, 'bends') ? psuAt(v.srope, v.bends) : undefined, hint: 'course: 1.4 for 6×19 at 10⁶ bends, ≈ 4 at 10⁵ (ordinate ×10⁻³); 6×7 not plotted — auto uses the 6×12 curve' },
            { id: 'Ff', symbol: 'F_f', label: 'Allowable fatigue tension', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'psu', 'Su', 'Dh', 'd') ? v.psu * v.Su * v.Dh * v.d / 2 : undefined,
              work: v => H.has(v, 'Ff') ? '\\(F_f = \\frac{' + H.fmt(v.psu / 1000, 4) + '(' + H.fmt(v.Su * 1000) + ')(' + H.fmt(v.Dh) + ')(' + H.fmt(v.d) + ')}{2} = ' + H.fmt(v.Ff) + '\\ \\text{lb}\\)' : null },
            { id: 'Fb', symbol: 'F_b', label: 'Equivalent bending load', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'Er', 'dw', 'Am', 'Dh') ? v.Er * v.dw * v.Am / v.Dh : undefined,
              work: v => H.has(v, 'Fb') ? '\\(F_b = \\frac{' + H.fmt(v.Er, 3) + '(' + H.fmt(v.dw, 3) + ')(' + H.fmt(v.Am, 3) + ')}{' + H.fmt(v.Dh) + '} = ' + H.fmt(v.Fb) + '\\ \\text{lb}\\)' : null },
          ] },
        { id: 'hfos', title: 'Factors of safety', eq: '17-45, 17-46', fig: ['table17-25', 'wesco-wll'], when: hoist,
          formula: 'n = \\frac{F_u}{F_t},\\qquad n_s = \\frac{F_u - F_b}{F_t},\\qquad n_{f0} = \\frac{F_f}{F_t}\\ (\\text{no bending}),\\qquad n_f = \\frac{F_f - F_b}{F_t}',
          text: 'Required minimum factors from Shigley Table 17-25 (mine shafts ≤ 500 ft 8.0, 1000–2000 ft 7.0, 2000–3000 ft 6.0; hoisting 5; haulage, cranes, derricks 6; electric hoists 7; Wesco slings 5:1). The course reports n<sub>f</sub> both without bending (HW1 P8: F<sub>f</sub>/F<sub>t</sub>, maximised over d) and with bending (Tutorial 3: 0.14 → not acceptable for infinite life).',
          vars: [
            { id: 'nreq', symbol: 'n_{req}', label: 'Required factor of safety', unit: '', kind: 'lookup', fig: 'table17-25', default: 5, hint: 'Table 17-25; hoisting 5 (Wesco slings 5:1); mine shaft ≤ 500 ft 8' },
            { id: 'n0', symbol: 'n', label: 'Simple static factor Fu/Ft', unit: '', kind: 'calc', digits: 4, compute: v => (H.has(v, 'Fu', 'Ft') && v.Ft > 0) ? v.Fu / v.Ft : undefined,
              work: v => H.has(v, 'n0') ? '\\(n = ' + H.fmt(v.Fu) + '/' + H.fmt(v.Ft) + ' = ' + H.fmt(v.n0, 4) + '\\)' : null },
            { id: 'nf0', symbol: 'n_{f0}', label: 'Fatigue factor without bending Ff/Ft (HW1 P8)', unit: '', kind: 'calc', digits: 4, compute: v => (H.has(v, 'Ff', 'Ft') && v.Ft > 0) ? v.Ff / v.Ft : undefined,
              work: v => H.has(v, 'nf0') ? '\\(n_{f0} = ' + H.fmt(v.Ff) + '/' + H.fmt(v.Ft) + ' = ' + H.fmt(v.nf0, 4) + '\\)' : null },
            { id: 'nf', symbol: 'n_f', label: 'Fatigue factor of safety with bending (Eq. 17-45)', unit: '', kind: 'calc', digits: 4, compute: v => (H.has(v, 'Ff', 'Fb', 'Ft') && v.Ft > 0) ? (v.Ff - v.Fb) / v.Ft : undefined,
              work: v => H.has(v, 'nf') ? '\\(n_f = \\frac{' + H.fmt(v.Ff) + ' - ' + H.fmt(v.Fb) + '}{' + H.fmt(v.Ft) + '} = ' + H.fmt(v.nf, 4) + '\\)' : null },
            { id: 'ns', symbol: 'n_s', label: 'Static factor of safety (Fu − Fb)/Ft', unit: '', kind: 'calc', digits: 4, compute: v => (H.has(v, 'Fu', 'Fb', 'Ft') && v.Ft > 0) ? (v.Fu - v.Fb) / v.Ft : undefined,
              work: v => H.has(v, 'ns') ? '\\(n_s = \\frac{' + H.fmt(v.Fu) + ' - ' + H.fmt(v.Fb) + '}{' + H.fmt(v.Ft) + '} = ' + H.fmt(v.ns, 4) + '\\)' : null },
          ] },
        { id: 'hfit', title: 'End fitting efficiency and wire-rope clips (course, HW1 P8c)', fig: ['clips', 'wesco-eff'], when: hoist,
          formula: 'n_{f,fitting} = \\eta\\, n_f,\\qquad \\eta = 0.925\\ (\\text{Flemish eye, 1.625 in}),\\ 0.95\\ (\\text{Flemish eye, 0.75 in}),\\ 0.80\\ (\\text{clips, torqued})',
          text: 'Canvas note / HW1 P8(c): multiply the fatigue factor by the termination efficiency. The clips table gives the minimum number of clips, rope turn-back and torque for the rope size (auto-filled for the nearest listed diameter).',
          vars: [
            { id: 'fit', label: 'End fitting', kind: 'choice', type: 'text', options: [{ label: 'None / ideal (η = 1)', value: 'none' }, { label: 'Flemish eye splice, large rope (92.5 %)', value: 'flemish_large' }, { label: 'Flemish eye splice, small rope (95 %)', value: 'flemish_small' }, { label: 'Wire-rope clips, torqued (80 %)', value: 'clips' }], default: 'none' },
            { id: 'eta', symbol: '\\eta', label: 'Termination efficiency', unit: '', kind: 'lookup', fig: 'wesco-eff', auto: v => ETA[v.fit], hint: 'Flemish eye 0.925 (1.625 in) / 0.95 (0.75 in); clips 0.80' },
            { id: 'nf0e', symbol: '\\eta n_{f0}', label: 'Fatigue factor (no bending) × efficiency', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'nf0', 'eta') ? v.eta * v.nf0 : undefined,
              work: v => (H.has(v, 'nf0e') && v.eta !== 1) ? '\\(' + H.fmt(v.eta) + '(' + H.fmt(v.nf0, 4) + ') = ' + H.fmt(v.nf0e, 4) + '\\)' : null },
            { id: 'nfe', symbol: '\\eta n_f', label: 'Fatigue factor (with bending) × efficiency', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'nf', 'eta') ? v.eta * v.nf : undefined },
            { id: 'nclips', symbol: '', label: 'Minimum number of clips', unit: '', kind: 'lookup', fig: 'clips', auto: v => H.has(v, 'd') ? clipRow(v.d)[1] : undefined, hint: 'clips table row for d (3/4 in → 4)' },
            { id: 'turnback', symbol: '', label: 'Rope turn-back', unit: 'in', kind: 'lookup', fig: 'clips', auto: v => H.has(v, 'd') ? clipRow(v.d)[2] : undefined, hint: 'clips table (3/4 in → 18 in)' },
            { id: 'torque', symbol: '', label: 'Clip torque', unit: 'ft·lb', kind: 'lookup', fig: 'clips', auto: v => H.has(v, 'd') ? clipRow(v.d)[3] : undefined, hint: 'clips table (3/4 in → 130 ft·lb)' },
          ] },
        { id: 'hbp', title: 'Bearing pressure, sheave material and result', eq: '17-42', fig: ['table17-26'], when: hoist,
          formula: 'p = \\frac{2F_t}{dD} \\le p_{allow}',
          vars: [
            { id: 'pb', symbol: 'p', label: 'Bearing pressure', unit: 'psi', kind: 'calc', compute: v => H.has(v, 'Ft', 'd', 'Dh') ? 2 * v.Ft / (v.d * v.Dh) : undefined,
              work: v => H.has(v, 'pb') ? '\\(p = \\frac{2(' + H.fmt(v.Ft) + ')}{' + H.fmt(v.d) + '(' + H.fmt(v.Dh) + ')} = ' + H.fmt(v.pb) + '\\ \\text{psi}\\)' : null },
            { id: 'lay', label: 'Lay', kind: 'choice', type: 'text', options: [{ label: 'Regular lay', value: 'regular' }, { label: 'Lang lay', value: 'lang' }], default: 'regular' },
            { id: 'sheave', label: 'Sheave material', kind: 'choice', type: 'text', options: Object.keys(SHEAVE), default: 'cast iron' },
            { id: 'pallow', symbol: 'p_{allow}', label: 'Allowable bearing pressure', unit: 'psi', kind: 'lookup', fig: 'table17-26', auto: v => { const r = PALLOW[(v.lay || 'regular') + ' ' + v.srope]; return (r && SHEAVE[v.sheave] !== undefined) ? r[SHEAVE[v.sheave]] : undefined; }, hint: 'Table 17-26 (6×19 regular: wood 250, CI 480, cast steel 900, chilled CI 1100, Mn steel 2400)',
              check: v => (H.has(v, 'pb', 'pallow') && v.pb > v.pallow) ? 'Bearing pressure exceeds allowable — harder sheave or larger d·D' : null },
          ],
          after: v => {
            if (!hoist(v) || !H.has(v, 'nf')) return '';
            const req = v.nreq || 5; const eta = H.has(v, 'eta') ? v.eta : 1; const okf = eta * v.nf >= req; const oks = !H.has(v, 'ns') || v.ns >= req; const okp = !H.has(v, 'pb', 'pallow') || v.pb <= v.pallow;
            return ((okf && oks && okp) ? '<span class="result-ok">PASS</span>' : '<span class="result-bad">FAIL</span>') + ' — ' + H.fmt(v.m) + ' × ' + H.fmt(v.d) + ' in ' + (v.srope || '').replace('x', ' × ') + ' rope on a ' + H.fmt(v.Dh) + ' in sheave (D/d = ' + H.fmt(v.Dh / v.d) + '): F<sub>t</sub> = ' + H.fmt(v.Ft) + ' lb, F<sub>u</sub> = ' + H.fmt(v.Fu) + ' lb, F<sub>f</sub> = ' + H.fmt(v.Ff) + ' lb, F<sub>b</sub> = ' + H.fmt(v.Fb) + ' lb → n = ' + H.fmt(v.n0, 3) + ', n<sub>f0</sub> = ' + H.fmt(v.nf0, 3) + ' (no bending), n<sub>f</sub> = ' + H.fmt(v.nf, 3) + (H.has(v, 'ns') ? ', n<sub>s</sub> = ' + H.fmt(v.ns, 3) : '') + (eta !== 1 ? ', × η = ' + H.fmt(eta) + ' → ' + H.fmt(eta * v.nf0, 3) + ' / ' + H.fmt(eta * v.nf, 3) : '') + ' (required ' + H.fmt(req) + ')' + (H.has(v, 'pb', 'pallow') ? '; bearing pressure ' + H.fmt(v.pb) + ' psi vs ' + H.fmt(v.pallow) + ' psi on ' + v.sheave : '') + '. n<sub>f</sub> peaks at an intermediate d — try neighbouring standard sizes (Table 7-19).';
          } },
      ] },
    ],
  };
})();
