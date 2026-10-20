// Helical springs — Shigley Ch. 10 (Fizz §5.3 "iterate d" / "calculate from C" paths; Examples 10-1 … 10-4, 10-6)
// Course alignment (v2/COURSE_CONVENTIONS.md §14): the course has only the Module 5 reading guide — required Shigley 10-1 … 10-4 (compression
// springs), 10-9 (fatigue) and 10-11 (extension springs); beneficial 10-5 stability, 10-6 materials, 10-7 static design, 10-8 critical frequency,
// 10-12 torsion springs (not implemented). No course worked numbers exist, so textbook defaults apply: ξ = 0.15, (ns)d = 1.2, Table 10-6
// fractions, Zimmerli data, Table 10-7 fractions for extension springs. Mode 4 adds the 10-11 extension-spring analysis (Example 10-6).
// Verified against: Shigley Example 10-6 (hard-drawn 0.035 in, OD 0.248, r1 0.106, r2 0.089, Fi 1.19 lbf, Nb 12.17, F 5.25 lbf) → C 6.086,
//   KB 1.234, Na 12.57, k 17.91, L0 0.817, τi 15.1 kpsi (preferred 14.2–21.2), Sut 264.7, n 1.45, σA 156.9 kpsi, nA 1.27, nB 1.35 — reproduced.
// Verified against: Shigley Example 10-2, d = 0.080 column (the `example`, mode 1) → C 10.53, D 0.843, OD 0.923, Na 10.1, Ls 0.964, L0 3.264,
//   (L0)cr 4.43, ns 1.2, fom −0.417 (same as the Fizz p.143 table) — reproduced. Mode 2 also reproduces Shigley Example 10-3 (A227, plain ends,
//   18 lbf @ 2.25 in, Fs 24 lbf: C 10 → d 0.0916 → 13 ga 0.0915, ns 1.198, Na 16.4; C 12 → d 0.1001 → 12 ga 0.1055, ns 1.32, Na 10.97, L0 4.263 (4.266 with Nt rounded to 11), α < 0.78).
// Guide assumptions (Fizz pp.128–146; the Mech guide's spring unit, p.131, is empty) are listed in `assumptions`; the field defaults carry them.
// ---- material data: Shigley Table 10-4 (A, m, relative cost) and Table 10-5 (E, G) ----
// A_us in kpsi·in^m, A_si in MPa·mm^m. G/E in Mpsi (US) -> x1e6 psi; GPa (SI) -> x1e3 MPa.
const SPR_MAT = {
  A228: { name: 'Music wire A228', cost: 2.6, cls: 'cd', rows: [{ dmax: 1e9, m: 0.145, Aus: 201, Asi: 2211 }],
    G: [[0.032, 12.0, 82.7, 29.5, 203.4], [0.063, 11.85, 81.7, 29.0, 200], [0.125, 11.75, 81.0, 28.5, 196.5], [1e9, 11.6, 80.0, 28.0, 193]] },
  A227: { name: 'Hard-drawn wire A227', cost: 1.0, cls: 'cd', rows: [{ dmax: 1e9, m: 0.190, Aus: 140, Asi: 1783 }],
    G: [[0.032, 11.7, 80.7, 28.8, 198.6], [0.063, 11.6, 80.0, 28.7, 197.9], [0.125, 11.5, 79.3, 28.6, 197.2], [1e9, 11.4, 78.6, 28.5, 196.5]] },
  A229: { name: 'OQ&T (oil-tempered) wire A229', cost: 1.3, cls: 'ht', rows: [{ dmax: 1e9, m: 0.187, Aus: 147, Asi: 1855 }], G: [[1e9, 11.2, 77.2, 28.5, 196.5]] },
  A232: { name: 'Chrome-vanadium wire A232', cost: 3.1, cls: 'ht', rows: [{ dmax: 1e9, m: 0.168, Aus: 169, Asi: 2005 }], G: [[1e9, 11.2, 77.2, 29.5, 203.4]] },
  A401: { name: 'Chrome-silicon wire A401', cost: 4.0, cls: 'ht', rows: [{ dmax: 1e9, m: 0.108, Aus: 202, Asi: 1974 }], G: [[1e9, 11.2, 77.2, 29.5, 203.4]] },
  A313: { name: '302 stainless wire A313', cost: 9.0, cls: 'ss', rows: [{ dmax: 0.10, m: 0.146, Aus: 169, Asi: 1867 }, { dmax: 0.20, m: 0.263, Aus: 128, Asi: 2065 }, { dmax: 1e9, m: 0.478, Aus: 90, Asi: 2911 }], G: [[1e9, 10, 69.0, 28, 193]] },
  B159: { name: 'Phosphor-bronze wire B159', cost: 8.0, cls: 'nf', rows: [{ dmax: 0.022, m: 0, Aus: 145, Asi: 1000 }, { dmax: 0.075, m: 0.028, Aus: 121, Asi: 913 }, { dmax: 1e9, m: 0.064, Aus: 110, Asi: 932 }], G: [[1e9, 6, 41.4, 15, 103.4]] },
};
// Table 10-6: fraction of Sut allowed (before set removed incl. KB ; after set removed incl. Ks)
const SPR_FRAC = { cd: [0.45, 0.65], ht: [0.50, 0.70], ss: [0.35, 0.60], nf: [0.35, 0.60] };
// Table 10-7 (extension springs, static): [body torsion, end torsion, end bending] fraction of Sut
const EXT_FRAC = { cd: [0.45, 0.40, 0.75], ht: [0.45, 0.40, 0.75], ss: [0.35, 0.30, 0.55], nf: [0.35, 0.30, 0.55] };
const EXT = v => v.mode === 'ext';
const CMP = v => v.mode !== 'ext';
const SI = v => v.units === 'SI';
const dIn = v => (v.d === undefined ? undefined : (SI(v) ? v.d / 25.4 : v.d));   // wire dia in inches for table ranges
const matRow = v => { const M = SPR_MAT[v.mat]; if (!M || dIn(v) === undefined) return undefined; return M.rows.find(r => dIn(v) <= r.dmax) || M.rows[M.rows.length - 1]; };
// Table 10-5 row for E, G: before d is known use the "d > 0.064 in" row (Fizz p.137 / Shigley Ex. 10-2 a-priori values); once d is chosen use its row.
const matG = v => { const M = SPR_MAT[v.mat]; if (!M) return undefined; const d = dIn(v) === undefined ? 0.0641 : dIn(v); return M.G.find(r => d <= r[0]) || M.G[M.G.length - 1]; };
const KU = v => SI(v) ? 1 : 1000;          // kpsi -> psi
const ENDS = { plain: [0, 'Na', 'd(Nt+1)', 'pNa+d'], pg: [1, 'Na+1', 'dNt', 'p(Na+1)'], sq: [2, 'Na+2', 'd(Nt+1)', 'pNa+3d'], sg: [2, 'Na+2', 'dNt', 'pNa+2d'] };
const Ne = v => ENDS[v.ends] ? ENDS[v.ends][0] : undefined;
const Ls_of = (v, Nt) => v.ends === 'pg' || v.ends === 'sg' ? v.d * Nt : v.d * (Nt + 1);
const PI = Math.PI;

// TX: H.fmt for inside \( \) work lines — writes 3e+7 as 3\times10^{7} so MathJax shows real powers of ten.
const TX = (x, d) => String(H.fmt(x, d)).replace(/e([+-]?)(\d+)$/, (m, s, e) => '\\times10^{' + (s === '-' ? '-' : '') + e + '}');
window.TOPIC = {
  id: 'springs', book: 'shigley',
  title: 'Helical Compression Springs — Static & Fatigue Design',
  subtitle: 'Shigley Ch. 10-1 … 10-9 · Fizz guide §5.3 ("iterate d" and "calculate from C" paths)',
  sibling: 'springs_mott.html',
  intro: 'Designs or checks a round-wire helical compression spring. Pick a <b>mode</b>: (1) <i>choose d</i> — Fizz "iterate wire diameter" / Shigley Fig. 10-3 &amp; Example 10-2: the spring index C comes from Eq. 10-23 so that n<sub>s</sub> = 1.2 at closure; run it once per candidate wire size and compare with the fom; (2) <i>choose C</i> (default) — Fizz "calculate based on C (seems better)" / Example 10-3: solve for d, then pick the next standard wire (Table A-28); (3) <i>spring given</i> — analyse a known d, D, N<sub>t</sub>, L<sub>0</sub> (Examples 10-1, 10-4). '
    + 'Then rate, coils, lengths (Table 10-1), buckling (Table 10-2 / Eq. 10-13), the design-condition checks (Eqs. 10-18 … 10-21), critical frequency and, if F<sub>min</sub> is given, fatigue with Zimmerli data (Eqs. 10-28 … 10-33). Units: US (lbf, in, psi) or SI (N, mm, MPa) — pick once. Mode 4 (<i>extension spring given</i>, Shigley 10-11 / Example 10-6) adds body coils → N<sub>a</sub> = N<sub>b</sub> + G/E, free length (Eq. 10-39), initial-tension check (Eq. 10-41) and the hook stresses σ<sub>A</sub>, τ<sub>B</sub> (Eqs. 10-34 … 10-37) against Table 10-7. <b>Course note:</b> MECH 325 provides only the Module 5 reading guide for springs (Shigley 10-1 … 10-4, 10-9, 10-11 required; 10-5 … 10-8, 10-12 beneficial) and no worked numbers, so the textbook defaults (ξ = 0.15, n<sub>s</sub> = 1.2, Table 10-6 / 10-7 fractions, Zimmerli data) apply unchanged.',
  example: { units: 'US', Fmax: 20, ymax: 2, xi: 0.15, nsd: 1.2, mat: 'A228', set: 0, ends: 'sg', mode: 'd', d: 0.080, alpha: 0.5 },

  assumptions: [
    { text: 'Fractional overrun to closure ξ = 0.15, i.e. F_s = 1.15 F_max (unless the problem gives the solid-height force)', src: 'Fizz p.138 · Fizz p.136', var: 'xi' },
    { text: 'Design factor at solid height (n_s)_d = 1.2 as a start (checked again at the end)', src: 'Fizz p.138', var: 'nsd' },
    { text: '"Calculating based on C" is the preferred path: start with C = 10 (the value Shigley Example 10-3 uses), solve d, then take the Table A-28 wire that most closely fits; mode 1 iterates d instead (Example 10-2)', src: 'Fizz p.143 · Fizz p.145', var: 'mode' },
    { text: 'Trial spring index C = 10; if N_a falls outside 3–15, change C within 4–12', src: 'Fizz p.145', var: 'Ctry' },
    { text: 'E and G from Table 10-5 assuming d > 0.064 in (music wire E = 28.5, G = 11.75 Mpsi) until d is chosen; then the row of the actual d is read, as Shigley\'s Example 10-2 table does (d = 0.063 in → G = 11.85 Mpsi, N_a = 39.1)', src: 'Fizz p.137 · Shigley Ex. 10-2', var: 'G' },
    { text: 'As-wound spring (no set removal): S_sy = Table 10-6 fraction × S_ut — 0.45 music wire / cold-drawn, 0.50 hardened & tempered, 0.35 stainless / nonferrous; set removed (Fig. 10-3): 0.65 S_ut. Fizz p.133 also quotes Samónov\'s S_sy = 0.56 S_ut (Eq. 10-16), which the procedure does not use', src: 'Fizz p.139 · Fizz p.142 · Fizz p.144', var: 'frac' },
    { text: 'Squared-and-ground ends (ends that sit on flat plates must be squared and ground)', src: 'Fizz p.131 · Fizz p.146', var: 'ends' },
    { text: 'Spring index from Eq. 10-23: take the larger of the two roots', src: 'Fizz p.137', var: 'C' },
    { text: 'Shear stress with the Bergsträsser factor K_B = (4C + 2)/(4C − 3) (Wahl K_W shown for reference)', src: 'Fizz p.129', var: 'KB' },
    { text: 'Spring between flat parallel surfaces (fixed ends), α = 0.5; absolute stability for steel when L_0 < 2.63 D/α', src: 'Fizz p.131 · Fizz p.146', var: 'alpha' },
    { text: 'Design conditions 4 ≤ C ≤ 12, 3 ≤ N_a ≤ 15, ξ ≥ 0.15, n_s ≥ 1.2; of the feasible wires the largest (least negative) fom wins', src: 'Fizz p.136 · Fizz p.143', var: 'fom' },
    { text: 'Surge: both ends always on plates, f = ½√(kg/W); keep f 15–20× the operating frequency (15× checked). Steel γ = 0.284 lbf/in³ (7.65 × 10^-5 N/mm³) — Shigley §10-8', src: 'Fizz p.135', var: 'gamma' },
    { text: 'Fatigue: Zimmerli data, unpeened S_sa = 35 kpsi, S_sm = 55 kpsi (peened 57.5 / 77.5), S_su = 0.67 S_ut; Gerber by default (Fizz lists Goodman and Gerber)', src: 'Fizz p.135', var: 'peen' },
  ],

  figures: [
    { id: 'fig10-1', ref: 'Figure 10-1', title: 'Axially loaded helical spring; wire sees direct shear F and torsion T = FD/2', src: 'figures/shigley/fig10-1.png', page: 547 },
    { id: 'fig10-2', ref: 'Figure 10-2', title: 'Types of ends: plain, squared (closed), squared & ground, plain & ground', src: 'figures/shigley/fig10-2.png', page: 549 },
    { id: 'table10-1', ref: 'Table 10-1', title: 'Dimensional formulas by end type: Ne, Nt, L0, Ls, pitch', src: 'figures/shigley/table10-1.png', page: 550, note: 'Squared & ground: Nt = Na + 2, Ls = d Nt, L0 = p Na + 2d.' },
    { id: 'table10-2', ref: 'Table 10-2', title: 'End-condition constant α for buckling', src: 'figures/shigley/table10-2.png', page: 551, note: 'Flat parallel surfaces (squared & ground ends): α = 0.5.' },
    { id: 'table10-4', ref: 'Table 10-4', title: 'Constants A and m of Sut = A/d^m, and relative cost', src: 'figures/shigley/table10-4.png', page: 553, note: 'A in kpsi·in^m with d in inches, or MPa·mm^m with d in mm. Check the diameter range column.' },
    { id: 'table10-5', ref: 'Table 10-5', title: 'E and G of spring wires (by diameter for A228 / A227)', src: 'figures/shigley/table10-5.png', page: 554 },
    { id: 'table10-6', ref: 'Table 10-6', title: 'Maximum allowable torsional stress, static: % of Sut before / after set removal', src: 'figures/shigley/table10-6.png', page: 555, note: 'As-wound music wire & cold-drawn carbon steel: Ssy = 0.45 Sut (with KB). Hardened & tempered: 0.50. Stainless / nonferrous: 0.35.' },
    { id: 'fig10-3', ref: 'Figure 10-3', title: 'Static spring design flowchart (over-a-rod / free / in-a-hole; as-wound / set removed)', src: 'figures/shigley/fig10-3.png', page: 558 },
    { id: 'ex10-2', ref: 'Example 10-2 table', title: 'Example 10-2: table of candidate wire sizes with constraints shaded (the Fizz "iterate d" table)', src: 'figures/shigley/ex10-2-table.png', page: 560, note: 'Run this calculator once per d, copy the column, then eliminate by 4 ≤ C ≤ 12, 3 ≤ Na ≤ 15, Ls / L0 limits, L0 < (L0)cr; choose the largest fom.' },
    { id: 'tableA-28a', ref: 'Table A-28 (a)', title: 'Wire gauge decimal equivalents — gauges 7/0 to 17', src: 'figures/shigley/tableA-28a.png', page: 1088, note: 'Music wire column for A228; Washburn & Moen (W&M / U.S. Steel Wire) for other steel wire.' },
    { id: 'tableA-28b', ref: 'Table A-28 (b)', title: 'Wire gauge decimal equivalents — gauges 18 to 40', src: 'figures/shigley/tableA-28b.png', page: 1089 },
    { id: 'fig10-6', ref: 'Figure 10-6', title: 'Extension-spring ends: bending at A (radius r1) and torsion at B (radius r2)', src: 'figures/shigley/fig10-6.png', page: 572 },
    { id: 'fig10-7', ref: 'Figure 10-7', title: 'Extension spring: F–y curve with initial tension Fi, geometry (free length inside hooks), preferred initial-tension stress vs C', src: 'figures/shigley/fig10-7.png', page: 573, note: 'Eq. 10-41 reproduces the preferred-range band: τi = 33 500/exp(0.105C) ± 1000(4 − (C − 3)/6.5) psi.' },
    { id: 'table10-7', ref: 'Table 10-7', title: 'Maximum allowable stresses (KW or KB corrected) for extension springs, static: % Sut in body / end torsion / end bending', src: 'figures/shigley/table10-7.png', page: 574, note: 'Cold-drawn or hardened & tempered steels: 45–50 % body, 40 % end torsion, 75 % end bending. Stainless / nonferrous: 35 / 30 / 55.' },
  ],

  sections: [
    { title: 'Inputs', steps: [
      { id: 'in', title: 'Loads, deflection and design factors', fig: ['fig10-1'], eq: '10-17 … 10-21',
        formula: 'F_s = (1+\\xi)F_{max} \\qquad \\xi \\ge 0.15,\\;\\; n_s \\ge 1.2 \\text{ at closure}',
        text: '\\(F_{max}\\) is the largest working load and \\(y_{max}\\) its deflection (together they fix the rate k). Closure (solid) force \\(F_s = (1+\\xi)F_{max}\\) unless the problem states the solid-height force directly (Example 10-3: "close solid at 24 lbf") — then enter it and ξ is back-calculated.',
        vars: [
          { id: 'units', label: 'Unit system', kind: 'choice', type: 'text', options: [{ label: 'US: lbf, in, psi (A in kpsi)', value: 'US' }, { label: 'SI: N, mm, MPa', value: 'SI' }], default: 'US' },
          { id: 'Fmax', symbol: 'F_{max}', label: 'Maximum working force', unit: 'lbf / N', kind: 'input' },
          { id: 'ymax', symbol: 'y_{max}', label: 'Deflection at Fmax (from free length)', unit: 'in / mm', kind: 'input', hint: 'leave blank if the spring is fully given (mode 3)' },
          { id: 'Fmin', symbol: 'F_{min}', label: 'Minimum working force (fatigue only)', unit: 'lbf / N', kind: 'input', hint: 'preload; blank = static design' },
          { id: 'Fsg', symbol: 'F_{s,given}', label: 'Force at solid height, if specified', unit: 'lbf / N', kind: 'input', hint: 'blank → Fs = (1+ξ) Fmax' },
          { id: 'xi', symbol: '\\xi', label: 'Fractional overrun to closure', kind: 'input', default: 0.15, check: v => (v.xi !== undefined && v.xi < 0.15) ? 'Shigley recommends ξ ≥ 0.15 (Eq. 10-20)' : null },
          { id: 'nsd', symbol: '(n_s)_d', label: 'Design factor at solid height', kind: 'input', default: 1.2 },
        ] },
      { id: 'matl', title: 'Material and end type', fig: ['table10-4', 'table10-6', 'fig10-2', 'table10-1'],
        text: 'Material sets A, m (Table 10-4), E, G (Table 10-5), the relative cost, and the allowable fraction of Sut (Table 10-6 / Table 10-7 for extension springs) in the next step.',
        vars: [
          { id: 'mat', label: 'Wire material (ASTM)', kind: 'choice', type: 'text', options: Object.keys(SPR_MAT).map(k => ({ label: SPR_MAT[k].name, value: k })), default: 'A228' },
          { id: 'set', label: 'Set removal (presetting)?', kind: 'choice', options: [{ label: 'As-wound (no set removal) — use with KB', value: 0 }, { label: 'Set removed — Table 10-6 right column', value: 1 }], default: 0 },
          { id: 'ends', label: 'End type (Table 10-1, compression)', kind: 'choice', type: 'text', options: [{ label: 'Plain', value: 'plain' }, { label: 'Plain and ground', value: 'pg' }, { label: 'Squared or closed', value: 'sq' }, { label: 'Squared and ground', value: 'sg' }], default: 'sg' },
        ] },
      { id: 'mprop', title: 'Material properties from the tables', fig: ['table10-4', 'table10-5', 'table10-6', 'table10-7'],
        text: 'Yellow values are pre-filled from the tables once d is known; overwrite if your edition differs. For an extension spring (mode 4) the fraction is the Table 10-7 <i>body</i> value (0.45 steel / 0.35 stainless, nonferrous).',
        vars: [
          { id: 'A', symbol: 'A', label: 'Strength constant A', unit: 'kpsi·in^m / MPa·mm^m', kind: 'lookup', fig: 'table10-4', auto: v => { const r = matRow(v); return r ? (SI(v) ? r.Asi : r.Aus) : undefined; }, hint: 'Table 10-4 row for the material and diameter range' },
          { id: 'm', symbol: 'm', label: 'Exponent m', kind: 'lookup', fig: 'table10-4', auto: v => { const r = matRow(v); return r ? r.m : undefined; }, hint: 'Table 10-4, same row as A' },
          { id: 'G', symbol: 'G', label: 'Shear modulus', unit: 'psi / MPa', kind: 'lookup', fig: 'table10-5', auto: v => { const g = matG(v); return g ? (SI(v) ? g[2] * 1000 : g[1] * 1e6) : undefined; }, hint: 'e.g. 11.75e6 psi or 81000 MPa' },
          { id: 'E', symbol: 'E', label: 'Elastic modulus (buckling; Na of extension springs)', unit: 'psi / MPa', kind: 'lookup', fig: 'table10-5', auto: v => { const g = matG(v); return g ? (SI(v) ? g[4] * 1000 : g[3] * 1e6) : undefined; }, hint: 'Table 10-5, e.g. 28.5e6 psi' },
          { id: 'frac', symbol: 'S_{sy}/S_{ut}', label: 'Allowable fraction of Sut (static, body)', kind: 'lookup', fig: 'table10-6', auto: v => { const M = SPR_MAT[v.mat]; if (!M) return undefined; return EXT(v) ? EXT_FRAC[M.cls][0] : SPR_FRAC[M.cls][v.set === 1 ? 1 : 0]; }, hint: 'Table 10-6 (compression) / Table 10-7 body column (extension)' },
          { id: 'cost', label: 'Relative material cost', kind: 'lookup', fig: 'table10-4', auto: v => SPR_MAT[v.mat] ? SPR_MAT[v.mat].cost : undefined, hint: 'Table 10-4 last column (music wire 2.6, hard-drawn 1.0)' },
        ] },
      { id: 'mode', title: 'Design mode and the decision variable', fig: ['fig10-3', 'tableA-28a', 'tableA-28b'],
        text: '<b>Mode 1 (choose d):</b> enter a trial standard wire diameter; C follows from Eq. 10-23. <b>Mode 2 (choose C):</b> enter a trial C (10 is usual); d is solved, then enter the next standard wire size. <b>Mode 3 (spring given):</b> enter d and D (or OD − d), plus Nt and L0 if known.',
        vars: [
          { id: 'mode', label: 'Mode', kind: 'choice', type: 'text', options: [{ label: '1 · Choose wire diameter d (Fig. 10-3 / Ex. 10-2)', value: 'd' }, { label: '2 · Choose spring index C, solve d (Ex. 10-3)', value: 'C' }, { label: '3 · Spring given: d and D known (Ex. 10-1 / 10-4)', value: 'given' }, { label: '4 · Extension spring given: d, D, Nb, Fi, hook radii (10-11 / Ex. 10-6)', value: 'ext' }], default: 'C' },
          { id: 'Ctry', symbol: 'C_{trial}', label: 'Trial spring index', kind: 'input', default: 10, hint: 'mode 2 only; 4–12' },
          { id: 'dcalc', symbol: 'd_{calc}', label: 'Wire diameter required for ns at C (mode 2)', unit: 'in / mm', kind: 'calc', digits: 4,
            compute: v => { if (v.mode !== 'C' || !H.has(v, 'Ctry', 'Fmax', 'nsd', 'frac', 'A', 'm')) return undefined;
              const KB = (4 * v.Ctry + 2) / (4 * v.Ctry - 3); const Fs = v.Fsg !== undefined ? v.Fsg : (H.has(v, 'xi') ? (1 + v.xi) * v.Fmax : undefined); if (Fs === undefined) return undefined;
              return Math.pow(8 * v.nsd * Fs * KB * v.Ctry / (PI * v.frac * v.A * KU(v)), 1 / (2 - v.m)); },
            work: v => v.dcalc !== undefined ? '\\(d = \\left[\\dfrac{8\\,n_s F_s K_B C}{\\pi\\,(' + TX(v.frac) + ')\\,A' + (SI(v) ? '' : '\\times10^3') + '}\\right]^{1/(2-m)} = ' + TX(v.dcalc, 4) + '\\)  (Example 10-3 Eq. 5: 0.163 K_B C/A for F_s = 24 lbf, n_s = 1.2)' : null },
          { id: 'd', symbol: 'd', label: 'Wire diameter (standard size, Table A-28)', unit: 'in / mm', kind: 'lookup', fig: 'tableA-28a', hint: 'Table A-28; mode 2: the gauge closest to d_calc (Fizz p.145) — Shigley Ex. 10-3 then checks n_s and moves up a gauge if needed' },
          { id: 'Dg', symbol: 'D', label: 'Mean coil diameter (modes 3, 4)', unit: 'in / mm', kind: 'input', hint: 'D = OD − d' },
          { id: 'Ntg', symbol: 'N_t', label: 'Total coils, if given (mode 3)', kind: 'input' },
          { id: 'L0g', symbol: 'L_0', label: 'Free length, if given (mode 3)', unit: 'in / mm', kind: 'input' },
        ] },
      { id: 'xin', title: 'Extension spring data (mode 4)', fig: ['fig10-6', 'fig10-7'], when: EXT,
        text: 'N<sub>b</sub> = number of body coils; F<sub>i</sub> = initial tension (coils stay closed until F > F<sub>i</sub>); r<sub>1</sub> = mean hook radius in the plane of the end coil (bending at A), r<sub>2</sub> = bend radius at right angles to the coil (torsion at B), Figure 10-6. F<sub>max</sub> above is the service load.',
        vars: [
          { id: 'Nbg', symbol: 'N_b', label: 'Number of body coils', kind: 'input' },
          { id: 'Fi', symbol: 'F_i', label: 'Initial tension', unit: 'lbf / N', kind: 'input', default: 0, hint: '0 for an open-wound body' },
          { id: 'r1', symbol: 'r_1', label: 'Hook mean radius for bending (point A)', unit: 'in / mm', kind: 'input' },
          { id: 'r2', symbol: 'r_2', label: 'Hook bend radius for torsion (point B)', unit: 'in / mm', kind: 'input' },
        ] },
    ] },

    { title: 'Strength and spring index', steps: [
      { id: 'str', title: 'Tensile and torsional yield strength of the wire', eq: '10-14, Table 10-6', fig: ['table10-4', 'table10-6'],
        formula: 'S_{ut} = \\frac{A}{d^m} \\qquad S_{sy} = (\\text{Table 10-6 fraction})\\,S_{ut}',
        vars: [
          { id: 'Sut', symbol: 'S_{ut}', label: 'Minimum tensile strength', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'A', 'm', 'd') ? v.A / Math.pow(v.d, v.m) * KU(v) : undefined,
            work: v => H.has(v, 'A', 'm', 'd') ? '\\(S_{ut} = \\dfrac{' + TX(v.A) + '}{' + TX(v.d) + '^{' + TX(v.m) + '}} = ' + TX(v.A / Math.pow(v.d, v.m), 4) + (SI(v) ? '\\ \\text{MPa}' : '\\ \\text{kpsi}') + '\\)' : null },
          { id: 'Ssy', symbol: 'S_{sy}', label: 'Torsional yield strength', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'Sut', 'frac') ? v.frac * v.Sut : undefined,
            work: v => H.has(v, 'Sut', 'frac') ? '\\(S_{sy} = ' + TX(v.frac) + '(' + TX(v.Sut, 5) + ') = ' + TX(v.Ssy, 5) + '\\)' : null },
        ] },
      { id: 'cidx', title: 'Spring index C and mean diameter D', eq: '10-1, 10-23', fig: ['fig10-3'],
        formula: '\\alpha = \\frac{S_{sy}}{n_s},\\;\\; \\beta = \\frac{8(1+\\xi)F_{max}}{\\pi d^2},\\;\\; C = \\frac{2\\alpha-\\beta}{4\\beta} + \\sqrt{\\left(\\frac{2\\alpha-\\beta}{4\\beta}\\right)^2 - \\frac{3\\alpha}{4\\beta}} \\qquad D = C d',
        text: 'Mode 1 solves Eq. 10-23 (as-wound, free spring: the larger root). Mode 2 keeps the trial C. Mode 3 uses C = D/d. If the spring must sit over a rod or in a hole, set D from the rod/hole instead (Fig. 10-3: D = d<sub>rod</sub> + d + allowance, or D = d<sub>hole</sub> − d − allowance) by using mode 3.',
        vars: [
          { id: 'Fs', symbol: 'F_s', label: 'Force at closure', unit: 'lbf / N', kind: 'calc', compute: v => v.Fsg !== undefined ? v.Fsg : (H.has(v, 'L0g', 'Ls', 'k') ? v.k * (v.L0g - v.Ls) : (H.has(v, 'Fmax', 'xi') ? (1 + v.xi) * v.Fmax : undefined)), hint: 'given Fs, or k(L0 − Ls) when L0 is given, else (1+ξ)Fmax' },
          { id: 'xie', symbol: '\\xi_{eff}', label: 'Effective overrun Fs/Fmax − 1', kind: 'calc', digits: 3, compute: v => H.has(v, 'Fs', 'Fmax') && v.Fmax > 0 ? v.Fs / v.Fmax - 1 : undefined },
          { id: 'alph', symbol: '\\alpha', label: 'Ssy / ns', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => (v.mode === 'd' && H.has(v, 'Ssy', 'nsd')) ? v.Ssy / v.nsd : undefined },
          { id: 'beta', symbol: '\\beta', label: '8 Fs /(π d²)', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => (v.mode === 'd' && H.has(v, 'Fs', 'd')) ? 8 * v.Fs / (PI * v.d * v.d) : undefined },
          { id: 'C', symbol: 'C', label: 'Spring index', kind: 'calc', digits: 4, compute: v => {
              if (v.mode === 'C') return v.Ctry;
              if (v.mode === 'given' || v.mode === 'ext') return H.has(v, 'Dg', 'd') ? v.Dg / v.d : undefined;
              if (!H.has(v, 'alph', 'beta')) return undefined; const a = (2 * v.alph - v.beta) / (4 * v.beta); const r = a * a - 3 * v.alph / (4 * v.beta); return r >= 0 ? a + Math.sqrt(r) : undefined; },
            work: v => (v.mode === 'd' && H.has(v, 'alph', 'beta', 'C')) ? '\\(C = \\dfrac{2(' + TX(v.alph, 5) + ') - ' + TX(v.beta, 5) + '}{4(' + TX(v.beta, 5) + ')} + \\sqrt{\\left[\\dfrac{2(' + TX(v.alph, 5) + ') - ' + TX(v.beta, 5) + '}{4(' + TX(v.beta, 5) + ')}\\right]^2 - \\dfrac{3(' + TX(v.alph, 5) + ')}{4(' + TX(v.beta, 5) + ')}} = ' + TX(v.C, 4) + '\\)' : null,
            check: v => (v.C !== undefined && (v.C < 4 || v.C > 12)) ? 'Outside 4 ≤ C ≤ 12 (Eq. 10-18)' : null },
          { id: 'D', symbol: 'D', label: 'Mean coil diameter', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => (v.mode === 'given' || v.mode === 'ext') ? v.Dg : (H.has(v, 'C', 'd') ? v.C * v.d : undefined) },
          { id: 'OD', symbol: 'OD', label: 'Outside diameter', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'D', 'd') ? v.D + v.d : undefined },
          { id: 'ID', symbol: 'ID', label: 'Inside diameter', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'D', 'd') ? v.D - v.d : undefined },
        ] },
      { id: 'stress', title: 'Shear stress at closure and static factor of safety', eq: '10-5, 10-7', fig: ['fig10-1'], when: CMP,
        formula: 'K_B = \\frac{4C+2}{4C-3} \\qquad \\tau_s = K_B\\,\\frac{8 F_s D}{\\pi d^3} \\qquad n_s = \\frac{S_{sy}}{\\tau_s}',
        text: 'Bergsträsser factor (Shigley\'s preference; Wahl KW shown for comparison, differs by ≈1 %). Mode 1 returns ns = (ns)d exactly because C was solved from it.',
        vars: [
          { id: 'KB', symbol: 'K_B', label: 'Bergsträsser factor', kind: 'calc', digits: 4, compute: v => H.has(v, 'C') ? (4 * v.C + 2) / (4 * v.C - 3) : undefined },
          { id: 'KW', symbol: 'K_W', label: 'Wahl factor (for reference)', kind: 'calc', digits: 4, compute: v => H.has(v, 'C') ? (4 * v.C - 1) / (4 * v.C - 4) + 0.615 / v.C : undefined },
          { id: 'taus', symbol: '\\tau_s', label: 'Shear stress at solid height', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'KB', 'Fs', 'D', 'd') ? v.KB * 8 * v.Fs * v.D / (PI * Math.pow(v.d, 3)) : undefined,
            work: v => H.has(v, 'KB', 'Fs', 'D', 'd') ? '\\(\\tau_s = ' + TX(v.KB, 4) + '\\,\\dfrac{8(' + TX(v.Fs) + ')(' + TX(v.D, 4) + ')}{\\pi(' + TX(v.d) + ')^3} = ' + TX(v.taus, 5) + '\\)' : null },
          { id: 'taumax', symbol: '\\tau_{max}', label: 'Shear stress at Fmax', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'KB', 'Fmax', 'D', 'd') ? v.KB * 8 * v.Fmax * v.D / (PI * Math.pow(v.d, 3)) : undefined },
          { id: 'ns', symbol: 'n_s', label: 'Factor of safety at closure', kind: 'calc', digits: 3, compute: v => H.has(v, 'Ssy', 'taus') && v.taus > 0 ? v.Ssy / v.taus : undefined,
            work: v => H.has(v, 'Ssy', 'taus') ? '\\(n_s = ' + TX(v.Ssy, 5) + '/' + TX(v.taus, 5) + ' = ' + TX(v.ns, 3) + '\\)' : null },
        ],
        after: v => v.ns === undefined ? '' : (v.ns >= (v.nsd || 1.2) ? '<span class="result-ok">ns = ' + H.fmt(v.ns, 3) + ' ≥ ' + H.fmt(v.nsd || 1.2) + ' — no yielding when compressed solid.</span>' : '<span class="result-bad">ns = ' + H.fmt(v.ns, 3) + ' &lt; ' + H.fmt(v.nsd || 1.2) + ' — spring yields at solid height: larger d, smaller C, or stronger wire.</span>') },
    ] },

    { title: 'Rate, coils and lengths', steps: [
      { id: 'rate', title: 'Spring rate and number of coils', eq: '10-9, 10-40, Table 10-1', fig: ['table10-1', 'fig10-7'],
        formula: 'k = \\frac{F_{max}}{y_{max}} = \\frac{d^4 G}{8 D^3 N_a} \\qquad N_a = \\frac{d^4 G}{8 D^3 k} = \\frac{d\\,G}{8 k C^3}',
        text: 'If the spring is given with its total coils, Na = Nt − Ne (Table 10-1) and k follows from Eq. 10-9; otherwise k comes from the required load–deflection point.',
        vars: [
          { id: 'Nag', symbol: 'N_{a,given}', label: 'Active coils from given Nt (mode 3) or Nb + G/E (mode 4, Eq. 10-40)', kind: 'calc', digits: 4, compute: v => EXT(v) ? (H.has(v, 'Nbg', 'G', 'E') ? v.Nbg + v.G / v.E : undefined) : ((H.has(v, 'Ntg') && Ne(v) !== undefined) ? v.Ntg - Ne(v) : undefined),
            work: v => (EXT(v) && H.has(v, 'Nag')) ? '\\(N_a = N_b + G/E = ' + TX(v.Nbg) + ' + ' + TX(v.G, 4) + '/' + TX(v.E, 4) + ' = ' + TX(v.Nag, 4) + '\\)' : null },
          { id: 'k', symbol: 'k', label: 'Spring rate', unit: 'lbf/in / N/mm', kind: 'calc', digits: 4, compute: v => {
              if (H.has(v, 'Nag', 'd', 'G', 'D') && v.Nag > 0) return Math.pow(v.d, 4) * v.G / (8 * Math.pow(v.D, 3) * v.Nag);
              return (H.has(v, 'Fmax', 'ymax') && v.ymax > 0) ? v.Fmax / v.ymax : undefined; },
            work: v => H.has(v, 'Nag', 'd', 'G', 'D') && v.Nag > 0 ? '\\(k = \\dfrac{(' + TX(v.d) + ')^4(' + TX(v.G, 4) + ')}{8(' + TX(v.D, 4) + ')^3(' + TX(v.Nag, 4) + ')} = ' + TX(v.k, 4) + '\\)' : (H.has(v, 'Fmax', 'ymax') ? '\\(k = ' + TX(v.Fmax) + '/' + TX(v.ymax) + ' = ' + TX(v.k, 4) + '\\)' : null) },
          { id: 'Na', symbol: 'N_a', label: 'Active coils', kind: 'calc', digits: 4, compute: v => H.has(v, 'Nag') ? v.Nag : (H.has(v, 'd', 'G', 'D', 'k') && v.k > 0 ? Math.pow(v.d, 4) * v.G / (8 * Math.pow(v.D, 3) * v.k) : undefined),
            work: v => (!H.has(v, 'Nag') && H.has(v, 'd', 'G', 'D', 'k')) ? '\\(N_a = \\dfrac{(' + TX(v.d) + ')^4(' + TX(v.G, 4) + ')}{8(' + TX(v.D, 4) + ')^3(' + TX(v.k, 4) + ')} = ' + TX(v.Na, 4) + '\\)' : null,
            check: v => (v.Na !== undefined && (v.Na < 3 || v.Na > 15)) ? 'Outside 3 ≤ Na ≤ 15 (Eq. 10-19) — mode 2: raise C to lower Na' : null },
          { id: 'Nt', symbol: 'N_t', label: 'Total coils', kind: 'calc', digits: 4, compute: v => EXT(v) ? v.Nbg : (H.has(v, 'Ntg') ? v.Ntg : (H.has(v, 'Na') && Ne(v) !== undefined ? v.Na + Ne(v) : undefined)),
            hint: 'Table 10-1: Nt = Na + Ne' },
        ] },
      { id: 'len', title: 'Solid length, free length, pitch', eq: 'Table 10-1', fig: ['table10-1', 'fig10-2'], when: CMP,
        formula: 'y_s = \\frac{F_s}{k} \\qquad L_0 = L_s + y_s \\qquad p = \\frac{L_0 - (\\text{end allowance})}{N_a}',
        vars: [
          { id: 'Ls', symbol: 'L_s', label: 'Solid length', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'Nt', 'd') && ENDS[v.ends] ? Ls_of(v, v.Nt) : undefined,
            work: v => H.has(v, 'Nt', 'd') && ENDS[v.ends] ? '\\(L_s = ' + ENDS[v.ends][2].replace('Nt', '(' + TX(v.Nt, 4) + ')').replace('d', TX(v.d)) + ' = ' + TX(v.Ls, 4) + '\\)' : null },
          { id: 'ys', symbol: 'y_s', label: 'Deflection to closure', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'L0g', 'Ls') ? v.L0g - v.Ls : (H.has(v, 'Fs', 'k') && v.k > 0 ? v.Fs / v.k : undefined) },
          { id: 'L0', symbol: 'L_0', label: 'Free length', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'L0g') ? v.L0g : (H.has(v, 'Ls', 'ys') ? v.Ls + v.ys : undefined),
            work: v => (!H.has(v, 'L0g') && H.has(v, 'Ls', 'ys')) ? '\\(L_0 = ' + TX(v.Ls, 4) + ' + ' + TX(v.ys, 4) + ' = ' + TX(v.L0, 4) + '\\)' : null },
          { id: 'Fsact', symbol: 'F_{s,act}', label: 'Actual force at solid height = k ys', unit: 'lbf / N', kind: 'calc', compute: v => H.has(v, 'k', 'ys') ? v.k * v.ys : undefined, hint: 'differs from Fs only when L0 is given' },
          { id: 'p', symbol: 'p', label: 'Pitch', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => { if (!H.has(v, 'L0', 'Na', 'd') || !ENDS[v.ends]) return undefined;
              return { plain: (v.L0 - v.d) / v.Na, pg: v.L0 / (v.Na + 1), sq: (v.L0 - 3 * v.d) / v.Na, sg: (v.L0 - 2 * v.d) / v.Na }[v.ends]; } },
          { id: 'Lmax', symbol: 'L_{0,limit}', label: 'Free-length limit, if any', unit: 'in / mm', kind: 'input', hint: 'space constraint' },
          { id: 'Lsmax', symbol: 'L_{s,limit}', label: 'Solid-length limit, if any', unit: 'in / mm', kind: 'input' },
        ],
        after: v => { let s = '';
          if (H.has(v, 'Lmax', 'L0')) s += v.L0 <= v.Lmax ? '<span class="result-ok">L0 = ' + H.fmt(v.L0, 4) + ' ≤ limit ' + H.fmt(v.Lmax) + '.</span> ' : '<span class="result-bad">L0 = ' + H.fmt(v.L0, 4) + ' exceeds limit ' + H.fmt(v.Lmax) + '.</span> ';
          if (H.has(v, 'Lsmax', 'Ls')) s += v.Ls <= v.Lsmax ? '<span class="result-ok">Ls = ' + H.fmt(v.Ls, 4) + ' ≤ limit ' + H.fmt(v.Lsmax) + '.</span>' : '<span class="result-bad">Ls = ' + H.fmt(v.Ls, 4) + ' exceeds limit ' + H.fmt(v.Lsmax) + '.</span>';
          return s; } },
      { id: 'buck', title: 'Buckling (stability)', eq: '10-10 … 10-13', fig: ['table10-2'], when: CMP,
        formula: "(L_0)_{cr} = \\frac{2.63\\,D}{\\alpha}\\;(\\text{steel}) \\qquad y_{cr} = L_0 C'_1\\left[1 - \\left(1 - \\frac{C'_2}{\\lambda_{eff}^2}\\right)^{1/2}\\right],\\; \\lambda_{eff} = \\frac{\\alpha L_0}{D}",
        text: 'Absolutely stable if \\(L_0 < (L_0)_{cr}\\). Otherwise the critical deflection \\(y_{cr}\\) from Eq. 10-10 must exceed the working deflection. Example 10-3 turns it round: the required α < 2.63 D / L0 tells you which end support is needed.',
        vars: [
          { id: 'alpha', symbol: '\\alpha', label: 'End-condition constant', kind: 'choice', options: [{ label: '0.5 — flat parallel surfaces (fixed–fixed)', value: 0.5 }, { label: '0.707 — fixed–hinged', value: 0.707 }, { label: '1.0 — hinged–hinged', value: 1 }, { label: '2.0 — clamped–free', value: 2 }], default: 0.5 },
          { id: 'L0cr', symbol: '(L_0)_{cr}', label: 'Critical free length (steel, Eq. 10-13)', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'D', 'alpha') ? 2.63 * v.D / v.alpha : undefined,
            work: v => H.has(v, 'D', 'alpha') ? '\\((L_0)_{cr} = 2.63(' + TX(v.D, 4) + ')/' + TX(v.alpha) + ' = ' + TX(v.L0cr, 4) + '\\)' : null },
          { id: 'alphreq', symbol: '\\alpha_{req}', label: 'Max α for stability = 2.63 D / L0', kind: 'calc', digits: 3, compute: v => H.has(v, 'D', 'L0') && v.L0 > 0 ? 2.63 * v.D / v.L0 : undefined },
          { id: 'ycr', symbol: 'y_{cr}', label: 'Critical deflection (Eq. 10-10)', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => { if (!H.has(v, 'L0', 'D', 'alpha', 'E', 'G')) return undefined;
              const C1 = v.E / (2 * (v.E - v.G)), C2 = 2 * PI * PI * (v.E - v.G) / (2 * v.G + v.E), lam = v.alpha * v.L0 / v.D; const t = 1 - C2 / (lam * lam); return t < 0 ? Infinity : v.L0 * C1 * (1 - Math.sqrt(t)); } },
        ],
        after: v => { if (!H.has(v, 'L0', 'L0cr')) return '';
          if (v.L0 < v.L0cr) return '<span class="result-ok">L0 = ' + H.fmt(v.L0, 4) + ' &lt; (L0)cr = ' + H.fmt(v.L0cr, 4) + ' — absolutely stable, no buckling.</span>';
          let s = '<span class="result-bad">L0 = ' + H.fmt(v.L0, 4) + ' ≥ (L0)cr = ' + H.fmt(v.L0cr, 4) + ' — not absolutely stable (needs α ≤ ' + H.fmt(v.alphreq, 3) + ').</span>';
          if (H.has(v, 'ycr', 'ys') && isFinite(v.ycr)) s += ' Critical deflection y<sub>cr</sub> = ' + H.fmt(v.ycr, 4) + (v.ycr > v.ys ? ' &gt; y<sub>s</sub> = ' + H.fmt(v.ys, 4) + ' → still will not buckle before closure.' : ' &lt; y<sub>s</sub> = ' + H.fmt(v.ys, 4) + ' → buckles; use a rod or hole, or change D/L0.');
          return s; } },
    ] },

    { title: 'Design assessment', steps: [
      { id: 'assess', title: 'Design conditions and figure of merit', eq: '10-18 … 10-22', fig: ['ex10-2', 'fig10-3'], when: CMP,
        formula: 'fom = -(\\text{rel. cost})\\,\\frac{\\gamma\\pi^2 d^2 N_t D}{4}\\quad(\\gamma \\text{ omitted when comparing steels})',
        text: 'Repeat for each candidate wire size (mode 1) and tabulate as in Example 10-2; eliminate rows that violate a condition; among the survivors the <b>largest (least negative) fom</b> wins.',
        vars: [
          { id: 'fom', symbol: 'fom', label: 'Figure of merit (γ omitted)', kind: 'calc', digits: 4, compute: v => H.has(v, 'cost', 'd', 'Nt', 'D') ? -v.cost * PI * PI * v.d * v.d * v.Nt * v.D / 4 : undefined,
            work: v => H.has(v, 'cost', 'd', 'Nt', 'D') ? '\\(fom = -' + TX(v.cost) + '\\pi^2(' + TX(v.d) + ')^2(' + TX(v.Nt, 4) + ')(' + TX(v.D, 4) + ')/4 = ' + TX(v.fom, 4) + '\\)' : null },
        ],
        after: v => { if (v.C === undefined) return '';
          const rows = [['4 ≤ C ≤ 12', v.C, v.C >= 4 && v.C <= 12], ['3 ≤ Na ≤ 15', v.Na, v.Na !== undefined && v.Na >= 3 && v.Na <= 15], ['ξ ≥ 0.15', v.xie, v.xie !== undefined && v.xie >= 0.15 - 1e-9], ['ns ≥ 1.2', v.ns, v.ns !== undefined && v.ns >= 1.2 - 1e-6], ['L0 < (L0)cr', v.L0, v.L0 !== undefined && v.L0cr !== undefined && v.L0 < v.L0cr]];
          if (H.has(v, 'Lmax')) rows.push(['L0 ≤ limit', v.L0, v.L0 <= v.Lmax]); if (H.has(v, 'Lsmax')) rows.push(['Ls ≤ limit', v.Ls, v.Ls <= v.Lsmax]);
          const ok = rows.every(r => r[2]);
          return '<table style="font-size:.9em"><tr>' + rows.map(r => '<td style="padding:2px 8px">' + r[0] + ': <b>' + H.fmt(r[1], 4) + '</b> ' + (r[2] ? '<span class="result-ok">✓</span>' : '<span class="result-bad">✗</span>') + '</td>').join('') + '</tr></table>'
            + (ok ? '<span class="result-ok"><b>FEASIBLE</b> — d = ' + H.fmt(v.d) + ', D = ' + H.fmt(v.D, 4) + ', OD = ' + H.fmt(v.OD, 4) + ', Nt = ' + H.fmt(v.Nt, 4) + ' (' + v.ends + ' ends), L0 = ' + H.fmt(v.L0, 4) + ', fom = ' + H.fmt(v.fom, 4) + '.</span>' : '<span class="result-bad"><b>INFEASIBLE</b> for this d — try the next wire size (mode 1) or another C (mode 2).</span>'); } },
      { id: 'freq', title: 'Critical (surge) frequency', eq: '10-25 … 10-27',
        formula: 'W = \\frac{\\pi^2 d^2 D N_a \\gamma}{4} \\qquad f = \\frac{1}{2}\\sqrt{\\frac{k g}{W}}\\ (\\text{both ends on plates}),\\quad f = \\frac{1}{4}\\sqrt{\\frac{kg}{W}}\\ (\\text{one end free})',
        text: 'Keep the fundamental frequency 15–20× the operating frequency. Steel: γ = 0.284 lbf/in³ (7.65×10⁻⁵ N/mm³); g = 386 in/s² (9810 mm/s²).',
        vars: [
          { id: 'gamma', symbol: '\\gamma', label: 'Specific weight of wire', unit: 'lbf/in³ / N/mm³', kind: 'input', auto: v => SI(v) ? 7.65e-5 : 0.284, hint: 'steel 0.284 lbf/in³ = 7.65e-5 N/mm³ (auto by unit system)' },
          { id: 'W', symbol: 'W', label: 'Weight of active coils', unit: 'lbf / N', kind: 'calc', digits: 4, compute: v => H.has(v, 'd', 'D', 'Na', 'gamma') ? PI * PI * v.d * v.d * v.D * v.Na * v.gamma / 4 : undefined },
          { id: 'fn', symbol: 'f', label: 'Fundamental frequency (both ends on plates)', unit: 'Hz', kind: 'calc', digits: 4, compute: v => H.has(v, 'k', 'W') && v.W > 0 ? 0.5 * Math.sqrt(v.k * (SI(v) ? 9810 : 386.1) / v.W) : undefined,
            work: v => H.has(v, 'k', 'W') && v.W > 0 ? '\\(f = \\tfrac12\\sqrt{' + TX(v.k, 4) + '(' + (SI(v) ? '9810' : '386') + ')/' + TX(v.W, 4) + '} = ' + TX(v.fn, 4) + '\\ \\text{Hz}\\)' : null },
          { id: 'fop', symbol: 'f_{op}', label: 'Operating frequency (if cyclic)', unit: 'Hz', kind: 'input' },
        ],
        after: v => H.has(v, 'fn', 'fop') && v.fop > 0 ? (v.fn / v.fop >= 15 ? '<span class="result-ok">f / f_op = ' + H.fmt(v.fn / v.fop, 3) + ' ≥ 15 — no surge/resonance problem.</span>' : '<span class="result-bad">f / f_op = ' + H.fmt(v.fn / v.fop, 3) + ' &lt; 15 — redesign for higher k or lower W.</span>') : '' },
    ] },

    { title: 'Fatigue (if Fmin is given)', steps: [
      { id: 'fat', title: 'Alternating and mean shear stresses', eq: '10-31 … 10-33',
        formula: 'F_a = \\frac{F_{max}-F_{min}}{2},\\; F_m = \\frac{F_{max}+F_{min}}{2} \\qquad \\tau_a = K_B\\frac{8F_a D}{\\pi d^3},\\; \\tau_m = K_B\\frac{8F_m D}{\\pi d^3}',
        vars: [
          { id: 'Fa', symbol: 'F_a', label: 'Alternating force', unit: 'lbf / N', kind: 'calc', compute: v => H.has(v, 'Fmax', 'Fmin') ? (v.Fmax - v.Fmin) / 2 : undefined },
          { id: 'Fm', symbol: 'F_m', label: 'Mean force', unit: 'lbf / N', kind: 'calc', compute: v => H.has(v, 'Fmax', 'Fmin') ? (v.Fmax + v.Fmin) / 2 : undefined },
          { id: 'taua', symbol: '\\tau_a', label: 'Alternating shear stress', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'KB', 'Fa', 'D', 'd') ? v.KB * 8 * v.Fa * v.D / (PI * Math.pow(v.d, 3)) : undefined,
            work: v => H.has(v, 'KB', 'Fa', 'D', 'd') ? '\\(\\tau_a = ' + TX(v.KB, 4) + '\\dfrac{8(' + TX(v.Fa) + ')(' + TX(v.D, 4) + ')}{\\pi(' + TX(v.d) + ')^3} = ' + TX(v.taua, 5) + '\\)' : null },
          { id: 'taum', symbol: '\\tau_m', label: 'Mean shear stress', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'KB', 'Fm', 'D', 'd') ? v.KB * 8 * v.Fm * v.D / (PI * Math.pow(v.d, 3)) : undefined },
        ],
        when: v => H.has(v, 'Fmin') },
      { id: 'sse', title: 'Zimmerli endurance data and shear endurance limit', eq: '10-28 … 10-30',
        formula: 'S_{su} = 0.67 S_{ut} \\qquad S_{se} = \\frac{S_{sa}}{1 - S_{sm}/S_{su}}\\ (\\text{Goodman}) \\qquad S_{se} = \\frac{S_{sa}}{1 - (S_{sm}/S_{su})^2}\\ (\\text{Gerber})',
        text: 'Zimmerli (wire < ⅜ in / 10 mm, infinite life): unpeened Ssa = 35 kpsi (241 MPa), Ssm = 55 kpsi (379 MPa); peened Ssa = 57.5 kpsi (398 MPa), Ssm = 77.5 kpsi (534 MPa).',
        vars: [
          { id: 'peen', label: 'Surface', kind: 'choice', options: [{ label: 'Unpeened', value: 0 }, { label: 'Shot-peened', value: 1 }], default: 0 },
          { id: 'crit', label: 'Fatigue criterion', kind: 'choice', type: 'text', options: [{ label: 'Gerber (common for springs)', value: 'gerber' }, { label: 'Goodman', value: 'goodman' }, { label: 'Sines (ignores mean stress)', value: 'sines' }], default: 'gerber' },
          { id: 'Ssa', symbol: 'S_{sa}', label: 'Zimmerli alternating component', unit: 'psi / MPa', kind: 'calc', compute: v => v.peen === 1 ? (SI(v) ? 398 : 57500) : (SI(v) ? 241 : 35000) },
          { id: 'Ssm', symbol: 'S_{sm}', label: 'Zimmerli mean component', unit: 'psi / MPa', kind: 'calc', compute: v => v.peen === 1 ? (SI(v) ? 534 : 77500) : (SI(v) ? 379 : 55000) },
          { id: 'Ssu', symbol: 'S_{su}', label: 'Torsional modulus of rupture', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'Sut') ? 0.67 * v.Sut : undefined },
          { id: 'Sse', symbol: 'S_{se}', label: 'Shear endurance limit', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => { if (!H.has(v, 'Ssa', 'Ssm', 'Ssu')) return undefined; const r = v.Ssm / v.Ssu;
              return v.crit === 'goodman' ? v.Ssa / (1 - r) : v.crit === 'sines' ? v.Ssa : v.Ssa / (1 - r * r); },
            work: v => H.has(v, 'Sse') && v.crit !== 'sines' ? '\\(S_{se} = \\dfrac{' + TX(v.Ssa) + '}{1 - (' + TX(v.Ssm) + '/' + TX(v.Ssu, 5) + ')' + (v.crit === 'gerber' ? '^2' : '') + '} = ' + TX(v.Sse, 5) + '\\)' : null },
        ],
        when: v => H.has(v, 'Fmin') },
      { id: 'nf', title: 'Fatigue factor of safety', eq: '6-41 / 6-48 adapted to shear',
        formula: "n_f = \\left(\\frac{\\tau_a}{S_{se}} + \\frac{\\tau_m}{S_{su}}\\right)^{-1}\\ (\\text{Goodman}) \\qquad n_f = \\frac12\\left(\\frac{S_{su}}{\\tau_m}\\right)^2\\frac{\\tau_a}{S_{se}}\\left[-1 + \\sqrt{1 + \\left(\\frac{2\\tau_m S_{se}}{S_{su}\\tau_a}\\right)^2}\\right]\\ (\\text{Gerber}) \\qquad n_f = \\frac{S_{sa}}{\\tau_a}\\ (\\text{Sines})",
        vars: [
          { id: 'nfat', symbol: 'n_f', label: 'Fatigue factor of safety', kind: 'calc', digits: 3, compute: v => { if (!H.has(v, 'taua', 'taum', 'Sse', 'Ssu') || v.taua <= 0) return undefined;
              if (v.crit === 'goodman') return 1 / (v.taua / v.Sse + v.taum / v.Ssu);
              if (v.crit === 'sines') return v.Ssa / v.taua;
              if (v.taum <= 0) return v.Sse / v.taua;
              const q = 2 * v.taum * v.Sse / (v.Ssu * v.taua); return 0.5 * Math.pow(v.Ssu / v.taum, 2) * (v.taua / v.Sse) * (-1 + Math.sqrt(1 + q * q)); },
            work: v => H.has(v, 'nfat') ? (v.crit === 'gerber' ? '\\(n_f = \\tfrac12\\left(\\dfrac{' + TX(v.Ssu, 5) + '}{' + TX(v.taum, 5) + '}\\right)^2\\dfrac{' + TX(v.taua, 5) + '}{' + TX(v.Sse, 5) + '}\\left[-1 + \\sqrt{1 + \\left(\\dfrac{2(' + TX(v.taum, 5) + ')(' + TX(v.Sse, 5) + ')}{' + TX(v.Ssu, 5) + '(' + TX(v.taua, 5) + ')}\\right)^2}\\right] = ' + TX(v.nfat, 3) + '\\)'
              : v.crit === 'goodman' ? '\\(n_f = \\left(\\dfrac{' + H.fmt(v.taua, 5) + '}{' + H.fmt(v.Sse, 5) + '} + \\dfrac{' + H.fmt(v.taum, 5) + '}{' + H.fmt(v.Ssu, 5) + '}\\right)^{-1} = ' + H.fmt(v.nfat, 3) + '\\)' : '\\(n_f = ' + H.fmt(v.Ssa) + '/' + H.fmt(v.taua, 5) + ' = ' + H.fmt(v.nfat, 3) + '\\)') : null },
          { id: 'ny', symbol: 'n_y', label: 'Static yield check at Fmax: Ssy/τmax', kind: 'calc', digits: 3, compute: v => H.has(v, 'Ssy', 'taumax') && v.taumax > 0 ? v.Ssy / v.taumax : undefined },
        ],
        when: v => H.has(v, 'Fmin'),
        after: v => v.nfat === undefined ? '' : (v.nfat >= 1 ? '<span class="result-ok">PASS — fatigue n<sub>f</sub> = ' + H.fmt(v.nfat, 3) + ' (' + v.crit + ', Zimmerli). Sines is always the most conservative with Zimmerli data, Goodman the least.</span>' : '<span class="result-bad">FAIL — n<sub>f</sub> = ' + H.fmt(v.nfat, 3) + ' &lt; 1: infinite life not predicted. Shot-peen, larger d, or reduce load range.</span>') },
    ] },

    { title: 'Extension springs (Shigley 10-11, mode 4)', steps: [
      { id: 'xgeo', title: 'Free length, deflection and body stress', eq: '10-38, 10-39, 10-9', fig: ['fig10-7', 'table10-7'], when: EXT,
        formula: 'L_0 = (2C - 1 + N_b)\\,d \\qquad y_{max} = \\frac{F_{max} - F_i}{k} \\qquad \\tau_{max} = K_B\\frac{8F_{max}D}{\\pi d^3} \\qquad n = \\frac{S_{sy}}{\\tau_{max}},\\; S_{sy} = 0.45S_{ut}',
        text: 'The body is analysed like a compression spring (K<sub>B</sub> from C, Eq. 10-5). Free length is measured inside the hooks (Figure 10-7b); the loops add G/E ≈ 0.4 turn to N<sub>a</sub> (Eq. 10-40, in the coils step above).',
        vars: [
          { id: 'xL0', symbol: 'L_0', label: 'Free length inside hooks', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'C', 'Nbg', 'd') ? (2 * v.C - 1 + v.Nbg) * v.d : undefined,
            work: v => H.has(v, 'xL0') ? '\\(L_0 = [2(' + TX(v.C, 4) + ') - 1 + ' + TX(v.Nbg) + '](' + TX(v.d) + ') = ' + TX(v.xL0, 4) + '\\)' : null },
          { id: 'xy', symbol: 'y_{max}', label: 'Extension under Fmax', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => (H.has(v, 'Fmax', 'Fi', 'k') && v.k > 0) ? (v.Fmax - v.Fi) / v.k : undefined,
            work: v => H.has(v, 'xy') ? '\\(y_{max} = (' + TX(v.Fmax) + ' - ' + TX(v.Fi) + ')/' + TX(v.k, 4) + ' = ' + TX(v.xy, 4) + '\\)' : null },
          { id: 'xLmax', symbol: 'L_{max}', label: 'Loaded length L0 + ymax', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'xL0', 'xy') ? v.xL0 + v.xy : undefined },
          { id: 'xtau', symbol: '\\tau_{max}', label: 'Body shear stress at Fmax', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'KB', 'Fmax', 'D', 'd') ? v.KB * 8 * v.Fmax * v.D / (PI * Math.pow(v.d, 3)) : undefined,
            work: v => H.has(v, 'xtau') ? '\\(\\tau_{max} = ' + TX(v.KB, 4) + '\\dfrac{8(' + TX(v.Fmax) + ')(' + TX(v.D, 4) + ')}{\\pi(' + TX(v.d) + ')^3} = ' + TX(v.xtau, 5) + '\\)' : null },
          { id: 'xn', symbol: 'n', label: 'Body factor of safety Ssy/τmax', kind: 'calc', digits: 3, compute: v => (H.has(v, 'Ssy', 'xtau') && v.xtau > 0) ? v.Ssy / v.xtau : undefined,
            work: v => H.has(v, 'xn') ? '\\(n = ' + TX(v.Ssy, 5) + '/' + TX(v.xtau, 5) + ' = ' + TX(v.xn, 3) + '\\)' : null },
        ] },
      { id: 'xinit', title: 'Initial tension check', eq: '10-41', fig: ['fig10-7'], when: EXT,
        formula: '(\\tau_i)_{uncorr} = \\frac{8F_iD}{\\pi d^3} \\qquad (\\tau_i)_{pref} = \\frac{33\\,500}{\\exp(0.105C)} \\pm 1000\\left(4 - \\frac{C-3}{6.5}\\right)\\ \\text{psi}',
        text: 'The springmaker can routinely wind in an initial tension inside the preferred band of Figure 10-7c (Eq. 10-41 is in psi; SI values are converted at 6.895 kPa/psi).',
        vars: [
          { id: 'xtaui', symbol: '(\\tau_i)_{uncorr}', label: 'Uncorrected initial-tension stress', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'Fi', 'D', 'd') ? 8 * v.Fi * v.D / (PI * Math.pow(v.d, 3)) : undefined,
            work: v => H.has(v, 'xtaui') ? '\\((\\tau_i)_{uncorr} = \\dfrac{8(' + TX(v.Fi) + ')(' + TX(v.D, 4) + ')}{\\pi(' + TX(v.d) + ')^3} = ' + TX(v.xtaui, 5) + '\\)' : null },
          { id: 'xtlo', symbol: '(\\tau_i)_{min}', label: 'Preferred range, lower', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'C') ? (33500 / Math.exp(0.105 * v.C) - 1000 * (4 - (v.C - 3) / 6.5)) * (SI(v) ? 0.006895 : 1) : undefined },
          { id: 'xthi', symbol: '(\\tau_i)_{max}', label: 'Preferred range, upper', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'C') ? (33500 / Math.exp(0.105 * v.C) + 1000 * (4 - (v.C - 3) / 6.5)) * (SI(v) ? 0.006895 : 1) : undefined,
            work: v => H.has(v, 'xthi', 'xtlo') ? '\\((\\tau_i)_{pref} = \\dfrac{33\\,500}{\\exp[0.105(' + TX(v.C, 4) + ')]} \\pm 1000\\left(4 - \\dfrac{' + TX(v.C, 4) + ' - 3}{6.5}\\right) = ' + TX(v.xtlo, 5) + ',\\; ' + TX(v.xthi, 5) + '\\)' : null },
        ],
        after: v => H.has(v, 'xtaui', 'xtlo', 'xthi') ? ((v.xtaui >= v.xtlo && v.xtaui <= v.xthi) ? '<span class="result-ok">Initial tension ' + H.fmt(v.xtaui, 4) + ' is inside the preferred range ' + H.fmt(v.xtlo, 4) + ' – ' + H.fmt(v.xthi, 4) + '.</span>' : '<span class="result-bad">Initial tension ' + H.fmt(v.xtaui, 4) + ' is outside the preferred range ' + H.fmt(v.xtlo, 4) + ' – ' + H.fmt(v.xthi, 4) + ' (available on special request / difficult to attain).</span>') : '' },
      { id: 'xhookA', title: 'Hook bending at A', eq: '10-34, 10-35', fig: ['fig10-6', 'table10-7'], when: EXT,
        formula: '(K)_A = \\frac{4C_1^2 - C_1 - 1}{4C_1(C_1 - 1)},\\; C_1 = \\frac{2r_1}{d} \\qquad \\sigma_A = F\\left[(K)_A\\frac{16D}{\\pi d^3} + \\frac{4}{\\pi d^2}\\right] \\qquad n_A = \\frac{S_y}{\\sigma_A},\\; S_y = 0.75S_{ut}',
        vars: [
          { id: 'C1', symbol: 'C_1', label: 'Hook bending index 2r1/d', kind: 'calc', digits: 4, compute: v => H.has(v, 'r1', 'd') ? 2 * v.r1 / v.d : undefined, check: v => (v.C1 !== undefined && v.C1 < 4) ? 'C1 < 4 — very high hook stress' : null },
          { id: 'KA', symbol: '(K)_A', label: 'Bending stress-correction factor', kind: 'calc', digits: 4, compute: v => (H.has(v, 'C1') && v.C1 > 1) ? (4 * v.C1 * v.C1 - v.C1 - 1) / (4 * v.C1 * (v.C1 - 1)) : undefined },
          { id: 'sigA', symbol: '\\sigma_A', label: 'Hook tensile stress at A', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'Fmax', 'KA', 'D', 'd') ? v.Fmax * (v.KA * 16 * v.D / (PI * Math.pow(v.d, 3)) + 4 / (PI * v.d * v.d)) : undefined,
            work: v => H.has(v, 'sigA') ? '\\(\\sigma_A = ' + TX(v.Fmax) + '\\left[' + TX(v.KA, 4) + '\\dfrac{16(' + TX(v.D, 4) + ')}{\\pi(' + TX(v.d) + ')^3} + \\dfrac{4}{\\pi(' + TX(v.d) + ')^2}\\right] = ' + TX(v.sigA, 5) + '\\)' : null },
          { id: 'fracA', symbol: 'S_y/S_{ut}', label: 'Table 10-7 end-bending fraction', kind: 'lookup', fig: 'table10-7', auto: v => SPR_MAT[v.mat] ? EXT_FRAC[SPR_MAT[v.mat].cls][2] : undefined, hint: 'Table 10-7: 0.75 steels, 0.55 stainless / nonferrous' },
          { id: 'nA', symbol: 'n_A', label: 'Factor of safety at A', kind: 'calc', digits: 3, compute: v => (H.has(v, 'fracA', 'Sut', 'sigA') && v.sigA > 0) ? v.fracA * v.Sut / v.sigA : undefined,
            work: v => H.has(v, 'nA') ? '\\(n_A = ' + TX(v.fracA) + '(' + TX(v.Sut, 5) + ')/' + TX(v.sigA, 5) + ' = ' + TX(v.nA, 3) + '\\)' : null },
        ] },
      { id: 'xhookB', title: 'Hook torsion at B', eq: '10-36, 10-37', fig: ['fig10-6', 'table10-7'], when: EXT,
        formula: '(K)_B = \\frac{4C_2 - 1}{4C_2 - 4},\\; C_2 = \\frac{2r_2}{d} \\qquad \\tau_B = (K)_B\\frac{8FD}{\\pi d^3} \\qquad n_B = \\frac{S_{sy}}{\\tau_B},\\; S_{sy} = 0.40S_{ut}',
        vars: [
          { id: 'C2', symbol: 'C_2', label: 'Hook torsion index 2r2/d', kind: 'calc', digits: 4, compute: v => H.has(v, 'r2', 'd') ? 2 * v.r2 / v.d : undefined, check: v => (v.C2 !== undefined && v.C2 < 4) ? 'C2 < 4 — very high hook stress' : null },
          { id: 'KB2', symbol: '(K)_B', label: 'Torsion stress-correction factor', kind: 'calc', digits: 4, compute: v => (H.has(v, 'C2') && v.C2 > 1) ? (4 * v.C2 - 1) / (4 * v.C2 - 4) : undefined },
          { id: 'tauB', symbol: '\\tau_B', label: 'Hook torsional stress at B', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'Fmax', 'KB2', 'D', 'd') ? v.KB2 * 8 * v.Fmax * v.D / (PI * Math.pow(v.d, 3)) : undefined,
            work: v => H.has(v, 'tauB') ? '\\(\\tau_B = ' + TX(v.KB2, 4) + '\\dfrac{8(' + TX(v.Fmax) + ')(' + TX(v.D, 4) + ')}{\\pi(' + TX(v.d) + ')^3} = ' + TX(v.tauB, 5) + '\\)' : null },
          { id: 'fracB', symbol: 'S_{sy}/S_{ut}', label: 'Table 10-7 end-torsion fraction', kind: 'lookup', fig: 'table10-7', auto: v => SPR_MAT[v.mat] ? EXT_FRAC[SPR_MAT[v.mat].cls][1] : undefined, hint: 'Table 10-7: 0.40 steels, 0.30 stainless / nonferrous' },
          { id: 'nB', symbol: 'n_B', label: 'Factor of safety at B', kind: 'calc', digits: 3, compute: v => (H.has(v, 'fracB', 'Sut', 'tauB') && v.tauB > 0) ? v.fracB * v.Sut / v.tauB : undefined,
            work: v => H.has(v, 'nB') ? '\\(n_B = ' + TX(v.fracB) + '(' + TX(v.Sut, 5) + ')/' + TX(v.tauB, 5) + ' = ' + TX(v.nB, 3) + '\\)' : null },
        ] },
    ] },

    { title: 'Result', steps: [
      { id: 'result', title: 'Overall verdict', vars: [],
        after: v => {
          if (EXT(v)) {
            if (v.xn === undefined) return '<span>Enter the extension-spring data (mode 4) to get the verdict.</span>';
            const rows = [['body n', v.xn, v.xn >= 1], ['hook nA', v.nA, v.nA !== undefined && v.nA >= 1], ['hook nB', v.nB, v.nB !== undefined && v.nB >= 1], ['τi in preferred range', v.xtaui, H.has(v, 'xtaui', 'xtlo', 'xthi') && v.xtaui >= v.xtlo && v.xtaui <= v.xthi]];
            if (v.nfat !== undefined) rows.push(['fatigue nf', v.nfat, v.nfat >= 1]);
            const ok = rows.every(r => r[2]);
            return rows.map(r => r[0] + ' = <b>' + H.fmt(r[1], 3) + '</b> ' + (r[2] ? '<span class="result-ok">✓</span>' : '<span class="result-bad">✗</span>')).join(' · ') + '<br>' + (ok ? '<span class="result-ok"><b>PASS</b> — extension spring d = ' + H.fmt(v.d) + ', D = ' + H.fmt(v.D, 4) + ', Nb = ' + H.fmt(v.Nbg) + ', k = ' + H.fmt(v.k, 4) + ', L0 = ' + H.fmt(v.xL0, 4) + '; the hook (lowest of nA, nB) governs.</span>' : '<span class="result-bad"><b>FAIL</b> — the weakest item above is below 1 (or the initial tension is outside the band): larger d, larger hook radii, or stronger wire.</span>');
          }
          if (v.C === undefined) return '<span>Enter the loads, material and a trial d / C to get the verdict.</span>';
          const cond = v.C >= 4 && v.C <= 12 && v.Na !== undefined && v.Na >= 3 && v.Na <= 15 && v.xie !== undefined && v.xie >= 0.15 - 1e-9 && v.ns !== undefined && v.ns >= 1.2 - 1e-6 && v.L0 !== undefined && v.L0cr !== undefined && v.L0 < v.L0cr && (!H.has(v, 'Lmax') || v.L0 <= v.Lmax) && (!H.has(v, 'Lsmax') || v.Ls <= v.Lsmax);
          const fat = v.nfat === undefined || v.nfat >= 1; const frq = !H.has(v, 'fn', 'fop') || v.fop <= 0 || v.fn / v.fop >= 15;
          return ((cond && fat && frq) ? '<span class="result-ok"><b>PASS</b> — ' : '<span class="result-bad"><b>FAIL</b> — ') + 'd = ' + H.fmt(v.d) + ', D = ' + H.fmt(v.D, 4) + ' (C = ' + H.fmt(v.C, 3) + '), Na = ' + H.fmt(v.Na, 3) + ', Nt = ' + H.fmt(v.Nt, 3) + ', L0 = ' + H.fmt(v.L0, 4) + ', k = ' + H.fmt(v.k, 4) + '; static n<sub>s</sub> = ' + H.fmt(v.ns, 3) + (v.nfat !== undefined ? ', fatigue n<sub>f</sub> = ' + H.fmt(v.nfat, 3) : '') + '. ' + (cond ? 'All design conditions (Eqs. 10-18 … 10-21, buckling) met' : 'A design condition fails — see the assessment table') + (fat ? '' : '; fatigue n<sub>f</sub> &lt; 1') + (frq ? '' : '; surge frequency ratio &lt; 15') + '.</span>'; } },
    ] },
  ],
};
