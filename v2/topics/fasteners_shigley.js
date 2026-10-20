// Bolt grades: [label, unitSystem, [ [dmax, Sp, Sut, Sy, Se], ... ] ]  (US: in & kpsi, Table 8-9/8-10/8-17; SI: mm & MPa, Table 8-11/8-17)
const BOLT_GRADES = {
  sae1: ['SAE 1 (¼–1½ in)', 'US', [[1e9, 33, 60, 36, null]]],
  sae2: ['SAE 2 (¼–¾: 55/74/57; ⅞–1½: 33/60/36)', 'US', [[0.75, 55, 74, 57, null], [1e9, 33, 60, 36, null]]],
  sae4: ['SAE 4 (¼–1½ in)', 'US', [[1e9, 65, 115, 100, null]]],
  sae5: ['SAE 5 (¼–1: 85/120/92; 1⅛–1½: 74/105/81)', 'US', [[1, 85, 120, 92, 18.6], [1e9, 74, 105, 81, 16.3]]],
  sae52: ['SAE 5.2 (¼–1 in)', 'US', [[1e9, 85, 120, 92, null]]],
  sae7: ['SAE 7 (¼–1½ in)', 'US', [[1e9, 105, 133, 115, 20.6]]],
  sae8: ['SAE 8 (¼–1½ in)', 'US', [[1e9, 120, 150, 130, 23.2]]],
  sae82: ['SAE 8.2 (¼–1 in)', 'US', [[1e9, 120, 150, 130, null]]],
  a307: ['ASTM A307 (¼–1½ in)', 'US', [[1e9, 33, 60, 36, null]]],
  a325: ['ASTM A325 type 1/2/3 (½–1: 85/120/92; 1⅛–1½: 74/105/81)', 'US', [[1, 85, 120, 92, null], [1e9, 74, 105, 81, null]]],
  a354bc: ['ASTM A354 BC (¼–2½: 105/125/109; 2¾–4: 95/115/99)', 'US', [[2.5, 105, 125, 109, null], [1e9, 95, 115, 99, null]]],
  a354bd: ['ASTM A354 BD (¼–4 in)', 'US', [[1e9, 120, 150, 130, null]]],
  a449: ['ASTM A449 (¼–1: 85/120/92; 1⅛–1½: 74/105/81; 1¾–3: 55/90/58)', 'US', [[1, 85, 120, 92, null], [1.5, 74, 105, 81, null], [1e9, 55, 90, 58, null]]],
  a490: ['ASTM A490 (½–1½ in)', 'US', [[1e9, 120, 150, 130, null]]],
  iso46: ['ISO 4.6 (M5–M36)', 'SI', [[1e9, 225, 400, 240, null]]],
  iso48: ['ISO 4.8 (M1.6–M16)', 'SI', [[1e9, 310, 420, 340, null]]],
  iso58: ['ISO 5.8 (M5–M24)', 'SI', [[1e9, 380, 520, 420, null]]],
  iso88: ['ISO 8.8 (M16–M36)', 'SI', [[1e9, 600, 830, 660, 129]]],
  iso98: ['ISO 9.8 (M1.6–M16)', 'SI', [[1e9, 650, 900, 720, 140]]],
  iso109: ['ISO 10.9 (M5–M36)', 'SI', [[1e9, 830, 1040, 940, 162]]],
  iso129: ['ISO 12.9 (M1.6–M36)', 'SI', [[1e9, 970, 1220, 1100, 190]]],
};
const WILEMAN = { steel: [0.78715, 0.62873, 30.0, 207], aluminum: [0.79670, 0.63816, 10.3, 71], copper: [0.79568, 0.63553, 17.3, 119], ci: [0.77871, 0.61616, 14.5, 100], general: [0.78952, 0.62914, null, null] };
const FS_SI = v => v.units === 'SI';
const gradeRow = v => { const g = BOLT_GRADES[v.grade]; if (!g || !H.has(v, 'd')) return undefined; return g[2].find(r => v.d <= r[0]) || g[2][g[2].length - 1]; };
const KS = v => FS_SI(v) ? 1 : 1000;   // kpsi -> psi
const frust = (E, d, t, D) => { if (!(E > 0 && d > 0 && t > 0 && D > d)) return undefined; const a = 1.155 * t; return 0.5774 * Math.PI * E * d / Math.log((a + D - d) * (D + d) / ((a + D + d) * (D - d))); };

window.TOPIC = {
  id: 'fasteners', book: 'shigley',
  title: 'Bolted Tension Joints — Stiffness, Preload, Safety Factors & Fatigue',
  subtitle: 'Shigley Ch. 8-3 … 8-11 · Fizz guide §5.4 procedure (Examples 8-2 … 8-5)',
  sibling: 'fasteners_mott.html',
  intro: 'The full Fizz §5.4 bolted-joint procedure on Shigley\'s equations: bolt length and grip (Table 8-7), bolt stiffness k<sub>b</sub> (Eq. 8-17), member stiffness k<sub>m</sub> (frusta Eq. 8-20, same-material Eq. 8-22, or Wileman Eq. 8-23 / Table 8-8), joint constant C, proof strength and preload (Tables 8-9 … 8-11, Eq. 8-31), wrench torque (Eq. 8-27, Table 8-15), and the static factors n<sub>p</sub>, n<sub>L</sub>, n<sub>0</sub> (Eqs. 8-28 … 8-30). If a fluctuating load is given, the fatigue factor with Table 8-17 endurance strengths and Goodman (Eq. 8-38), or Gerber / ASME-elliptic for repeated loading (Eqs. 8-46, 8-47). '
    + 'Units: US (in, lbf, psi; strengths from the tables in kpsi are converted) or SI (mm, N, MPa).',
  example: { units: 'US', d: 0.625, tpi: 11, joint: 'a', tw1: 0, t1: 0.75, t2: 0.75, tw2: 0, Hn: 0.547, Eb: 30e6, kmm: 'eq822', Em: 14e6, matm: 'ci', grade: 'sae5', Ptot: 36000, N: 6, preload: 0.75, K: 0.2, nLt: 2 },

  figures: [
    { id: 'fig8-13', ref: 'Figure 8-13 / 8-14', title: 'Tension-loaded bolted joint with nut (a) and cap-screw joint (b); l = grip', src: 'figures/shigley/fig8-13-14.png', page: 457 },
    { id: 'table8-7', ref: 'Table 8-7', title: 'Suggested procedure for finding fastener stiffness (grip, length, LT, ld, lt, kb)', src: 'figures/shigley/table8-7.png', page: 459, note: 'Figure (a): bolt and nut; figure (b): cap screw into a tapped member.' },
    { id: 'table8-2', ref: 'Table 8-2', title: 'UNC / UNF: tensile-stress area At and minor-diameter area', src: 'figures/shigley/table8-2.png', page: 446 },
    { id: 'table8-1', ref: 'Table 8-1', title: 'Metric coarse / fine: tensile-stress area At', src: 'figures/shigley/table8-1.png', page: 445 },
    { id: 'fig8-15', ref: 'Figure 8-15', title: 'Member compression modelled as a frustum of a hollow cone (half-apex angle α = 30°)', src: 'figures/shigley/fig8-15.png', page: 460 },
    { id: 'fig8-17', ref: 'Figure 8-17', title: 'Example 8-2: frusta drawn through a washer + two plates (the Fizz step-3 diagram)', src: 'figures/shigley/fig8-17.png', page: 463, note: 'Start at dw = 1.5d on the washer face, spread at 30° to mid-grip, then converge. Each material / direction change is a new frustum.' },
    { id: 'table8-8', ref: 'Table 8-8', title: 'Wileman stiffness parameters A, B and E by member material', src: 'figures/shigley/table8-8.png', page: 462 },
    { id: 'fig8-16', ref: 'Figure 8-16', title: 'Dimensionless member stiffness km/(Ed) vs aspect ratio d/l', src: 'figures/shigley/fig8-16.png', page: 462 },
    { id: 'fig8-18', ref: 'Figure 8-18 / 8-19', title: 'Spring model of preload + external load; force–deflection diagram', src: 'figures/shigley/fig8-18-19.png', page: 468 },
    { id: 'table8-9', ref: 'Table 8-9', title: 'SAE bolt grades: proof, tensile, yield strength (kpsi)', src: 'figures/shigley/table8-9.png', page: 465 },
    { id: 'table8-10', ref: 'Table 8-10', title: 'ASTM bolt grades', src: 'figures/shigley/table8-10.png', page: 466 },
    { id: 'table8-11', ref: 'Table 8-11', title: 'Metric property classes (MPa)', src: 'figures/shigley/table8-11.png', page: 467 },
    { id: 'table8-15', ref: 'Table 8-15', title: 'Torque factor K for T = K Fi d', src: 'figures/shigley/table8-15.png', page: 471, note: 'Use K = 0.2 when the bolt condition is not stated.' },
    { id: 'table8-17', ref: 'Table 8-17', title: 'Fully corrected endurance strengths Se for rolled-thread bolts (Kf included)', src: 'figures/shigley/table8-17.png', page: 478 },
    { id: 'fig8-22', ref: 'Figure 8-22', title: 'Fluctuating-stress diagram: Goodman line and the bolt load line from σi', src: 'figures/shigley/fig8-22.png', page: 479 },
  ],

  sections: [
    { title: 'Step 1: Bolt, grip and length', steps: [
      { id: 'bolt', title: 'Bolt size and thread', fig: ['table8-2', 'table8-1'],
        formula: 'A_d = \\frac{\\pi d^2}{4} \\qquad A_t = 0.7854\\left(d - \\frac{0.9743}{n}\\right)^2\\ (\\text{UN}) \\quad A_t = 0.7854(d - 0.9382p)^2\\ (\\text{metric})',
        text: 'Read At from Table 8-2 (inch) or 8-1 (metric); the auto value is the ASME/ISO formula and matches the table.',
        vars: [
          { id: 'units', label: 'Unit system', kind: 'choice', type: 'text', options: [{ label: 'US: in, lbf, psi', value: 'US' }, { label: 'SI: mm, N, MPa', value: 'SI' }], default: 'US' },
          { id: 'd', symbol: 'd', label: 'Nominal bolt diameter', unit: 'in / mm', kind: 'input' },
          { id: 'tpi', symbol: 'n', label: 'Threads per inch (US)', kind: 'input', hint: 'e.g. ⅝-11 UNC → 11' },
          { id: 'pitch', symbol: 'p', label: 'Pitch (metric)', unit: 'mm', kind: 'input', hint: 'e.g. M12 × 1.75' },
          { id: 'Ad', symbol: 'A_d', label: 'Major-diameter area', unit: 'in² / mm²', kind: 'calc', digits: 4, compute: v => H.has(v, 'd') ? Math.PI * v.d * v.d / 4 : undefined },
          { id: 'At', symbol: 'A_t', label: 'Tensile-stress area', unit: 'in² / mm²', kind: 'lookup', fig: 'table8-2', auto: v => { if (!H.has(v, 'd')) return undefined;
              if (FS_SI(v)) return H.has(v, 'pitch') ? 0.7854 * Math.pow(v.d - 0.9382 * v.pitch, 2) : undefined; return H.has(v, 'tpi') ? 0.7854 * Math.pow(v.d - 0.9743 / v.tpi, 2) : undefined; } },
          { id: 'Eb', symbol: 'E', label: 'Bolt modulus', unit: 'psi / MPa', kind: 'input', default: 30e6, hint: 'steel 30e6 psi / 207 000 MPa' },
        ] },
      { id: 'grip', title: 'Grip length and bolt length (Table 8-7)', fig: ['table8-7', 'fig8-13'],
        formula: '(a)\\; l = \\sum t \\;\\; L > l + H \\qquad (b)\\; l = \\begin{cases} h + t_2/2 & t_2 < d \\\\ h + d/2 & t_2 \\ge d\\end{cases} \\;\\; L > h + 1.5d',
        text: 'Joint (a): bolt through all members with a nut — the grip is everything between the bolt face and the nut face. Joint (b): cap screw into a tapped member of thickness t<sub>2</sub>; h = washer + upper member(s). Round L <b>up</b> to a standard length (¼ in steps, Table A-17).',
        vars: [
          { id: 'joint', label: 'Joint type', kind: 'choice', type: 'text', options: [{ label: '(a) Bolt with nut', value: 'a' }, { label: '(b) Cap screw into tapped member', value: 'b' }], default: 'a' },
          { id: 'tw1', symbol: 't_{w1}', label: 'Washer under head', unit: 'in / mm', kind: 'input', default: 0, hint: 'Table A-32: ½ N = 0.095 in' },
          { id: 't1', symbol: 't_1', label: 'Upper member thickness', unit: 'in / mm', kind: 'input' },
          { id: 't2', symbol: 't_2', label: 'Lower member thickness (tapped member for (b))', unit: 'in / mm', kind: 'input' },
          { id: 'tw2', symbol: 't_{w2}', label: 'Washer under nut (joint a)', unit: 'in / mm', kind: 'input', default: 0 },
          { id: 'Hn', symbol: 'H', label: 'Nut height (joint a)', unit: 'in / mm', kind: 'input', hint: 'Table A-31; ⅝ in: 35/64 = 0.547' },
          { id: 'h', symbol: 'h', label: 'h = tw1 + t1 (joint b)', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => (v.joint === 'b' && H.has(v, 'tw1', 't1')) ? v.tw1 + v.t1 : undefined },
          { id: 'l', symbol: 'l', label: 'Grip length', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => { if (v.joint === 'b') return H.has(v, 'h', 't2', 'd') ? v.h + (v.t2 < v.d ? v.t2 / 2 : v.d / 2) : undefined; return H.has(v, 'tw1', 't1', 't2', 'tw2') ? v.tw1 + v.t1 + v.t2 + v.tw2 : undefined; },
            work: v => H.has(v, 'l') ? (v.joint === 'b' ? '\\(l = h + ' + (v.t2 < v.d ? 't_2/2' : 'd/2') + ' = ' + H.fmt(v.h, 4) + ' + ' + H.fmt((v.t2 < v.d ? v.t2 : v.d) / 2, 4) + ' = ' + H.fmt(v.l, 4) + '\\)' : '\\(l = ' + H.fmt(v.tw1) + ' + ' + H.fmt(v.t1) + ' + ' + H.fmt(v.t2) + ' + ' + H.fmt(v.tw2) + ' = ' + H.fmt(v.l, 4) + '\\)') : null },
          { id: 'Lmin', symbol: 'L_{min}', label: 'Minimum bolt length', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => v.joint === 'b' ? (H.has(v, 'h', 'd') ? v.h + 1.5 * v.d : undefined) : (H.has(v, 'l', 'Hn') ? v.l + v.Hn : undefined), hint: 'Example 8-4 adds 2 threads (2/n) beyond the nut' },
          { id: 'L', symbol: 'L', label: 'Bolt length used (standard)', unit: 'in / mm', kind: 'lookup', fig: 'table8-7', hint: 'auto: rounded up to ¼ in (US) or 5 mm (SI)', auto: v => H.has(v, 'Lmin') ? (FS_SI(v) ? Math.ceil(v.Lmin / 5) * 5 : Math.ceil(v.Lmin * 4 - 1e-9) / 4) : undefined },
        ] },
    ] },

    { title: 'Step 2: Bolt stiffness', steps: [
      { id: 'kb', title: 'Threaded length and bolt stiffness', eq: '8-13, 8-14, 8-17', fig: ['table8-7'],
        formula: 'L_T = \\begin{cases} 2d + \\tfrac14 & L \\le 6\\,\\text{in} \\\\ 2d + \\tfrac12 & L > 6\\,\\text{in}\\end{cases} \\quad l_d = L - L_T,\\; l_t = l - l_d \\qquad k_b = \\frac{A_d A_t E}{A_d l_t + A_t l_d}',
        text: 'Metric: LT = 2d + 6 (L ≤ 125, d ≤ 48), 2d + 12 (125 < L ≤ 200), 2d + 25 (L > 200) mm. If ld comes out ≤ 0 the whole grip is threaded: kb = At E / l.',
        vars: [
          { id: 'LT', symbol: 'L_T', label: 'Threaded length', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => { if (!H.has(v, 'd', 'L')) return undefined;
              if (FS_SI(v)) return v.L <= 125 && v.d <= 48 ? 2 * v.d + 6 : (v.L <= 200 ? 2 * v.d + 12 : 2 * v.d + 25); return v.L <= 6 ? 2 * v.d + 0.25 : 2 * v.d + 0.5; } },
          { id: 'ld', symbol: 'l_d', label: 'Unthreaded length in grip', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'L', 'LT') ? Math.max(0, v.L - v.LT) : undefined },
          { id: 'lt', symbol: 'l_t', label: 'Threaded length in grip', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'l', 'ld') ? v.l - v.ld : undefined, check: v => (v.lt !== undefined && v.lt < 0) ? 'lt < 0: the grip is entirely in the shank — use kb = Ad E / l' : null },
          { id: 'kb', symbol: 'k_b', label: 'Bolt stiffness', unit: 'lbf/in / N/mm', kind: 'calc', digits: 4, compute: v => { if (!H.has(v, 'Ad', 'At', 'Eb', 'lt', 'ld')) return undefined; if (v.lt <= 0) return v.Ad * v.Eb / v.l; return v.Ad * v.At * v.Eb / (v.Ad * v.lt + v.At * v.ld); },
            work: v => H.has(v, 'kb') && v.lt > 0 ? '\\(k_b = \\dfrac{' + H.fmt(v.Ad, 4) + '(' + H.fmt(v.At, 4) + ')(' + H.fmt(v.Eb, 3) + ')}{' + H.fmt(v.Ad, 4) + '(' + H.fmt(v.lt, 4) + ') + ' + H.fmt(v.At, 4) + '(' + H.fmt(v.ld, 4) + ')} = ' + H.fmt(v.kb, 4) + '\\)' : null },
        ] },
    ] },

    { title: 'Step 3: Member stiffness', steps: [
      { id: 'km', title: 'Member stiffness km — choose the method', eq: '8-20, 8-22, 8-23', fig: ['fig8-15', 'fig8-17', 'table8-8', 'fig8-16'],
        formula: 'k_m = \\frac{0.5774\\pi E d}{2\\ln\\left(5\\,\\dfrac{0.5774 l + 0.5d}{0.5774 l + 2.5d}\\right)}\\ (8\\text{-}22) \\qquad k_m = E d A e^{B d/l}\\ (8\\text{-}23) \\qquad k_i = \\frac{0.5774\\pi E d}{\\ln\\dfrac{(1.155t + D - d)(D + d)}{(1.155t + D + d)(D - d)}}\\ (8\\text{-}20)',
        text: 'Eq. 8-22 and 8-23 need all members of the <b>same material</b> (α = 30°, washer face dw = 1.5d). For mixed materials (steel plate on cast iron, Example 8-2 / 8-5) stack frusta with Eq. 8-20 below: each frustum has thickness t, small-end diameter D (1.5d at the bolt head / nut, growing by 2t·tan 30° = 1.155t per frustum towards mid-grip) and its own E; then 1/km = Σ 1/ki.',
        vars: [
          { id: 'kmm', label: 'Method', kind: 'choice', type: 'text', options: [{ label: 'Eq. 8-22 — same material, α = 30°, dw = 1.5d', value: 'eq822' }, { label: 'Eq. 8-23 — Wileman curve fit, Table 8-8', value: 'wileman' }, { label: 'Eq. 8-20 — stack of frusta (mixed materials)', value: 'frusta' }], default: 'eq822' },
          { id: 'matm', label: 'Member material (Table 8-8)', kind: 'choice', type: 'text', options: [{ label: 'Steel', value: 'steel' }, { label: 'Aluminum', value: 'aluminum' }, { label: 'Copper', value: 'copper' }, { label: 'Gray cast iron', value: 'ci' }, { label: 'Other (general A, B)', value: 'general' }], default: 'steel' },
          { id: 'Em', symbol: 'E_m', label: 'Member modulus (methods 8-22 / 8-23)', unit: 'psi / MPa', kind: 'lookup', fig: 'table8-8', auto: v => { const w = WILEMAN[v.matm]; return w && w[2] ? (FS_SI(v) ? w[3] * 1000 : w[2] * 1e6) : undefined; }, hint: 'CI: Shigley uses 14–16 Mpsi in examples' },
          { id: 'Aw', symbol: 'A', label: 'Wileman A', kind: 'lookup', fig: 'table8-8', auto: v => WILEMAN[v.matm] ? WILEMAN[v.matm][0] : undefined },
          { id: 'Bw', symbol: 'B', label: 'Wileman B', kind: 'lookup', fig: 'table8-8', auto: v => WILEMAN[v.matm] ? WILEMAN[v.matm][1] : undefined },
          { id: 'km822', symbol: 'k_m^{(8\\text{-}22)}', label: 'km by Eq. 8-22', unit: 'lbf/in / N/mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'Em', 'd', 'l') ? 0.5774 * Math.PI * v.Em * v.d / (2 * Math.log(5 * (0.5774 * v.l + 0.5 * v.d) / (0.5774 * v.l + 2.5 * v.d))) : undefined,
            work: v => H.has(v, 'km822') ? '\\(k_m = \\dfrac{0.5774\\pi(' + H.fmt(v.Em, 3) + ')(' + H.fmt(v.d) + ')}{2\\ln\\left[5\\,\\dfrac{0.5774(' + H.fmt(v.l, 4) + ') + 0.5(' + H.fmt(v.d) + ')}{0.5774(' + H.fmt(v.l, 4) + ') + 2.5(' + H.fmt(v.d) + ')}\\right]} = ' + H.fmt(v.km822, 4) + '\\)' : null },
          { id: 'km823', symbol: 'k_m^{(8\\text{-}23)}', label: 'km by Eq. 8-23 (Wileman)', unit: 'lbf/in / N/mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'Em', 'd', 'l', 'Aw', 'Bw') ? v.Em * v.d * v.Aw * Math.exp(v.Bw * v.d / v.l) : undefined,
            work: v => H.has(v, 'km823') ? '\\(k_m = ' + H.fmt(v.Em, 3) + '(' + H.fmt(v.d) + ')(' + H.fmt(v.Aw, 5) + ')\\exp[' + H.fmt(v.Bw, 5) + '(' + H.fmt(v.d) + ')/' + H.fmt(v.l, 4) + '] = ' + H.fmt(v.km823, 4) + '\\)' : null },
        ] },
      { id: 'frusta', title: 'Frusta stack (Eq. 8-20) — up to 5 frusta', fig: ['fig8-17', 'fig8-15'],
        text: 'Number the frusta from the bolt head towards the nut (Example 8-2: steel washer + steel plate as one frustum, then the cast iron above mid-grip, then the cast iron below). D is the diameter at the <i>narrow</i> end of each frustum: 1.5d for the first and last, D<sub>prev</sub> + 1.155 t<sub>prev</sub> while expanding. Leave unused rows blank.',
        vars: [
          { id: 'f1t', symbol: 't_1', label: 'Frustum 1 thickness', unit: 'in / mm', kind: 'input' }, { id: 'f1D', symbol: 'D_1', label: 'Frustum 1 narrow diameter', unit: 'in / mm', kind: 'lookup', fig: 'fig8-17', auto: v => H.has(v, 'd') ? 1.5 * v.d : undefined }, { id: 'f1E', symbol: 'E_1', label: 'Frustum 1 modulus', unit: 'psi / MPa', kind: 'input' },
          { id: 'f1k', symbol: 'k_1', label: 'k1', unit: 'lbf/in / N/mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'f1t', 'f1D', 'f1E', 'd') ? frust(v.f1E, v.d, v.f1t, v.f1D) : undefined },
          { id: 'f2t', symbol: 't_2', label: 'Frustum 2 thickness', unit: 'in / mm', kind: 'input' }, { id: 'f2D', symbol: 'D_2', label: 'Frustum 2 narrow diameter', unit: 'in / mm', kind: 'input', hint: 'expanding: D1 + 1.155 t1' }, { id: 'f2E', symbol: 'E_2', label: 'Frustum 2 modulus', unit: 'psi / MPa', kind: 'input' },
          { id: 'f2k', symbol: 'k_2', label: 'k2', unit: 'lbf/in / N/mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'f2t', 'f2D', 'f2E', 'd') ? frust(v.f2E, v.d, v.f2t, v.f2D) : undefined },
          { id: 'f3t', symbol: 't_3', label: 'Frustum 3 thickness', unit: 'in / mm', kind: 'input' }, { id: 'f3D', symbol: 'D_3', label: 'Frustum 3 narrow diameter', unit: 'in / mm', kind: 'input' }, { id: 'f3E', symbol: 'E_3', label: 'Frustum 3 modulus', unit: 'psi / MPa', kind: 'input' },
          { id: 'f3k', symbol: 'k_3', label: 'k3', unit: 'lbf/in / N/mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'f3t', 'f3D', 'f3E', 'd') ? frust(v.f3E, v.d, v.f3t, v.f3D) : undefined },
          { id: 'f4t', symbol: 't_4', label: 'Frustum 4 thickness', unit: 'in / mm', kind: 'input' }, { id: 'f4D', symbol: 'D_4', label: 'Frustum 4 narrow diameter', unit: 'in / mm', kind: 'input' }, { id: 'f4E', symbol: 'E_4', label: 'Frustum 4 modulus', unit: 'psi / MPa', kind: 'input' },
          { id: 'f4k', symbol: 'k_4', label: 'k4', unit: 'lbf/in / N/mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'f4t', 'f4D', 'f4E', 'd') ? frust(v.f4E, v.d, v.f4t, v.f4D) : undefined },
          { id: 'f5t', symbol: 't_5', label: 'Frustum 5 thickness', unit: 'in / mm', kind: 'input' }, { id: 'f5D', symbol: 'D_5', label: 'Frustum 5 narrow diameter', unit: 'in / mm', kind: 'input' }, { id: 'f5E', symbol: 'E_5', label: 'Frustum 5 modulus', unit: 'psi / MPa', kind: 'input' },
          { id: 'f5k', symbol: 'k_5', label: 'k5', unit: 'lbf/in / N/mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'f5t', 'f5D', 'f5E', 'd') ? frust(v.f5E, v.d, v.f5t, v.f5D) : undefined },
          { id: 'kmfr', symbol: 'k_m^{(frusta)}', label: 'km = 1 / Σ(1/ki)', unit: 'lbf/in / N/mm', kind: 'calc', digits: 4, compute: v => { const ks = ['f1k', 'f2k', 'f3k', 'f4k', 'f5k'].map(k => v[k]).filter(x => x !== undefined && x > 0); return ks.length ? 1 / ks.reduce((s, k) => s + 1 / k, 0) : undefined; },
            work: v => H.has(v, 'kmfr') ? '\\(\\dfrac{1}{k_m} = ' + ['f1k', 'f2k', 'f3k', 'f4k', 'f5k'].filter(k => v[k] > 0).map(k => '\\dfrac{1}{' + H.fmt(v[k], 4) + '}').join(' + ') + ' \\Rightarrow k_m = ' + H.fmt(v.kmfr, 4) + '\\)' : null },
        ],
        when: v => v.kmm === 'frusta' },
      { id: 'C', title: 'Joint stiffness constant', eq: '8-24 … (f)', fig: ['fig8-18'], formula: 'C = \\frac{k_b}{k_b + k_m} \\qquad P_b = CP,\\; P_m = (1 - C)P',
        vars: [
          { id: 'km', symbol: 'k_m', label: 'Member stiffness used', unit: 'lbf/in / N/mm', kind: 'calc', digits: 4, compute: v => v.kmm === 'frusta' ? v.kmfr : v.kmm === 'wileman' ? v.km823 : v.km822 },
          { id: 'C', symbol: 'C', label: 'Stiffness constant (fraction of P taken by bolt)', kind: 'calc', digits: 4, compute: v => H.has(v, 'kb', 'km') ? v.kb / (v.kb + v.km) : undefined,
            work: v => H.has(v, 'C') ? '\\(C = \\dfrac{' + H.fmt(v.kb, 4) + '}{' + H.fmt(v.kb, 4) + ' + ' + H.fmt(v.km, 4) + '} = ' + H.fmt(v.C, 4) + '\\)' : null },
        ] },
    ] },

    { title: 'Step 4: Strength, preload and torque', steps: [
      { id: 'str', title: 'Bolt grade → Sp, Sut, Sy, Se', fig: ['table8-9', 'table8-10', 'table8-11', 'table8-17'],
        text: 'Values auto-fill from the tables by grade and diameter (kpsi → psi for US). Se (Table 8-17) is fully corrected for rolled threads and already includes Kf — do not apply Kf again.',
        vars: [
          { id: 'grade', label: 'Bolt grade / class', kind: 'choice', type: 'text', options: Object.keys(BOLT_GRADES).map(k => ({ label: BOLT_GRADES[k][0], value: k })), default: 'sae5' },
          { id: 'Sp', symbol: 'S_p', label: 'Proof strength', unit: 'psi / MPa', kind: 'lookup', fig: 'table8-9', auto: v => { const r = gradeRow(v); return r ? r[1] * KS(v) : undefined; } },
          { id: 'Sut', symbol: 'S_{ut}', label: 'Tensile strength', unit: 'psi / MPa', kind: 'lookup', fig: 'table8-9', auto: v => { const r = gradeRow(v); return r ? r[2] * KS(v) : undefined; } },
          { id: 'Sy', symbol: 'S_y', label: 'Yield strength', unit: 'psi / MPa', kind: 'lookup', fig: 'table8-9', auto: v => { const r = gradeRow(v); return r ? r[3] * KS(v) : undefined; } },
          { id: 'Se', symbol: 'S_e', label: 'Endurance strength (fatigue only)', unit: 'psi / MPa', kind: 'lookup', fig: 'table8-17', auto: v => { const r = gradeRow(v); return r && r[4] ? r[4] * KS(v) : undefined; }, hint: 'blank if Table 8-17 has no entry for this grade' },
        ],
        after: v => (BOLT_GRADES[v.grade] && BOLT_GRADES[v.grade][1] !== v.units) ? '<span class="result-bad">This grade is tabulated in ' + BOLT_GRADES[v.grade][1] + ' units — switch the unit system or the grade.</span>' : '' },
      { id: 'pre', title: 'Load per bolt, preload and wrench torque', eq: '8-31, 8-32, 8-27', fig: ['table8-15'],
        formula: 'P = \\frac{P_{tot}}{N} \\qquad F_p = A_t S_p \\qquad F_i = \\begin{cases} 0.75F_p & \\text{reused / nonpermanent} \\\\ 0.90F_p & \\text{permanent}\\end{cases} \\qquad T = K F_i d',
        text: 'Fizz: if the preload is given, enter it; if "X % of proof", pick that fraction. About 1000 lbf·in is already a very high hand-wrench torque.',
        vars: [
          { id: 'Ptot', symbol: 'P_{tot}', label: 'Total external tensile load on joint', unit: 'lbf / N', kind: 'input' },
          { id: 'N', symbol: 'N', label: 'Number of bolts', kind: 'input', default: 1 },
          { id: 'P', symbol: 'P', label: 'External load per bolt', unit: 'lbf / N', kind: 'calc', digits: 4, compute: v => H.has(v, 'Ptot', 'N') && v.N > 0 ? v.Ptot / v.N : undefined },
          { id: 'Fp', symbol: 'F_p', label: 'Proof load', unit: 'lbf / N', kind: 'calc', digits: 4, compute: v => H.has(v, 'At', 'Sp') ? v.At * v.Sp : undefined },
          { id: 'preload', label: 'Preload rule', kind: 'choice', options: [{ label: '0.75 Fp — nonpermanent, reused fasteners', value: 0.75 }, { label: '0.90 Fp — permanent connection', value: 0.9 }, { label: '0.60 Fp', value: 0.6 }, { label: '1.00 Fp (to proof)', value: 1 }, { label: 'Given directly (enter Fi below)', value: 0 }], default: 0.75 },
          { id: 'Fig', symbol: 'F_{i,given}', label: 'Preload if given', unit: 'lbf / N', kind: 'input' },
          { id: 'Fi', symbol: 'F_i', label: 'Preload used', unit: 'lbf / N', kind: 'calc', digits: 4, compute: v => v.preload === 0 ? v.Fig : (H.has(v, 'Fp', 'preload') ? v.preload * v.Fp : undefined),
            work: v => (v.preload !== 0 && H.has(v, 'Fi')) ? '\\(F_i = ' + H.fmt(v.preload) + '(' + H.fmt(v.At, 4) + ')(' + H.fmt(v.Sp) + ') = ' + H.fmt(v.Fi, 4) + '\\)' : null },
          { id: 'sigi', symbol: '\\sigma_i', label: 'Preload stress Fi/At', unit: 'psi / MPa', kind: 'calc', digits: 4, compute: v => H.has(v, 'Fi', 'At') ? v.Fi / v.At : undefined },
          { id: 'K', symbol: 'K', label: 'Torque factor', kind: 'lookup', fig: 'table8-15', default: 0.2 },
          { id: 'T', symbol: 'T', label: 'Wrench torque', unit: 'lbf·in / N·mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'K', 'Fi', 'd') ? v.K * v.Fi * v.d : undefined,
            work: v => H.has(v, 'T') ? '\\(T = ' + H.fmt(v.K) + '(' + H.fmt(v.Fi, 4) + ')(' + H.fmt(v.d) + ') = ' + H.fmt(v.T, 4) + '\\)' : null },
        ] },
    ] },

    { title: 'Step 5: Static factors of safety', steps: [
      { id: 'static', title: 'Bolt stress, yielding, overload and separation', eq: '8-24, 8-28, 8-29, 8-30',
        formula: 'F_b = CP + F_i,\\; \\sigma_b = \\frac{F_b}{A_t} \\qquad n_p = \\frac{S_p A_t}{CP + F_i} \\qquad n_L = \\frac{S_p A_t - F_i}{CP} \\qquad n_0 = \\frac{F_i}{P(1 - C)}',
        vars: [
          { id: 'Fb', symbol: 'F_b', label: 'Resultant bolt load', unit: 'lbf / N', kind: 'calc', digits: 4, compute: v => H.has(v, 'C', 'P', 'Fi') ? v.C * v.P + v.Fi : undefined },
          { id: 'sigb', symbol: '\\sigma_b', label: 'Bolt stress under service load', unit: 'psi / MPa', kind: 'calc', digits: 4, compute: v => H.has(v, 'Fb', 'At') ? v.Fb / v.At : undefined },
          { id: 'np', symbol: 'n_p', label: 'Yielding factor (proof)', kind: 'calc', digits: 3, compute: v => H.has(v, 'Sp', 'At', 'Fb') && v.Fb > 0 ? v.Sp * v.At / v.Fb : undefined,
            work: v => H.has(v, 'np') ? '\\(n_p = \\dfrac{' + H.fmt(v.Sp) + '(' + H.fmt(v.At, 4) + ')}{' + H.fmt(v.C, 4) + '(' + H.fmt(v.P, 4) + ') + ' + H.fmt(v.Fi, 4) + '} = ' + H.fmt(v.np, 3) + '\\)' : null },
          { id: 'nL', symbol: 'n_L', label: 'Load (overload) factor', kind: 'calc', digits: 3, compute: v => H.has(v, 'Sp', 'At', 'Fi', 'C', 'P') && v.C * v.P > 0 ? (v.Sp * v.At - v.Fi) / (v.C * v.P) : undefined,
            work: v => H.has(v, 'nL') ? '\\(n_L = \\dfrac{' + H.fmt(v.Sp) + '(' + H.fmt(v.At, 4) + ') - ' + H.fmt(v.Fi, 4) + '}{' + H.fmt(v.C, 4) + '(' + H.fmt(v.P, 4) + ')} = ' + H.fmt(v.nL, 3) + '\\)' : null },
          { id: 'n0', symbol: 'n_0', label: 'Joint-separation factor', kind: 'calc', digits: 3, compute: v => H.has(v, 'Fi', 'P', 'C') && v.P > 0 ? v.Fi / (v.P * (1 - v.C)) : undefined,
            work: v => H.has(v, 'n0') ? '\\(n_0 = \\dfrac{' + H.fmt(v.Fi, 4) + '}{' + H.fmt(v.P, 4) + '(1 - ' + H.fmt(v.C, 4) + ')} = ' + H.fmt(v.n0, 3) + '\\)' : null },
          { id: 'nLt', symbol: 'n_{L,target}', label: 'Required load factor (to size N)', kind: 'input', hint: 'Example 8-4: nL = 2' },
          { id: 'Nreq', symbol: 'N_{req}', label: 'Bolts needed for target nL', kind: 'calc', digits: 3, compute: v => H.has(v, 'C', 'nLt', 'Ptot', 'Sp', 'At', 'Fi') && (v.Sp * v.At - v.Fi) > 0 ? v.C * v.nLt * v.Ptot / (v.Sp * v.At - v.Fi) : undefined,
            work: v => H.has(v, 'Nreq') ? '\\(N = \\dfrac{C n_L P_{tot}}{S_p A_t - F_i} = \\dfrac{' + H.fmt(v.C, 4) + '(' + H.fmt(v.nLt) + ')(' + H.fmt(v.Ptot) + ')}{' + H.fmt(v.Sp) + '(' + H.fmt(v.At, 4) + ') - ' + H.fmt(v.Fi, 4) + '} = ' + H.fmt(v.Nreq, 3) + ' \\rightarrow ' + Math.ceil(v.Nreq - 1e-9) + '\\ \\text{bolts}\\)' : null },
        ],
        after: v => { if (v.np === undefined) return '';
          const bad = []; if (v.np < 1) bad.push('bolt exceeds proof strength (n_p < 1)'); if (v.nL < 1) bad.push('overload factor n_L < 1'); if (v.n0 < 1) bad.push('joint separates (n_0 < 1)');
          let s = bad.length ? '<span class="result-bad">FAIL — ' + bad.join('; ') + '. Increase bolt grade, size or number of bolts.</span>' : '<span class="result-ok">Static PASS — n<sub>p</sub> = ' + H.fmt(v.np, 3) + ', n<sub>L</sub> = ' + H.fmt(v.nL, 3) + ', n<sub>0</sub> = ' + H.fmt(v.n0, 3) + ' (members carry ' + H.fmt(100 * (1 - v.C), 3) + ' % of P).</span>';
          if (H.has(v, 'Nreq')) s += ' Use at least ' + Math.ceil(v.Nreq - 1e-9) + ' bolts for n<sub>L</sub> = ' + H.fmt(v.nLt) + '.'; return s; } },
    ] },

    { title: 'Step 6: Fatigue (fluctuating external load)', steps: [
      { id: 'fat', title: 'Alternating / midrange stresses and fatigue factor', eq: '8-35 … 8-38, 8-45 … 8-47, 8-51', fig: ['fig8-22', 'table8-17'],
        formula: '\\sigma_a = \\frac{C(P_{max} - P_{min})}{2A_t} \\quad \\sigma_m = \\frac{C(P_{max} + P_{min})}{2A_t} + \\frac{F_i}{A_t} \\qquad n_f = \\frac{S_e(S_{ut} - \\sigma_i)}{S_{ut}\\sigma_a + S_e(\\sigma_m - \\sigma_i)}\\ (\\text{Goodman})',
        text: 'Pmax / Pmin are per bolt. Default is the repeated load 0 → P (Pmin = 0), for which Gerber (Eq. 8-46) and ASME-elliptic (Eq. 8-47) are also available; for Pmin ≠ 0 only the general Goodman form (Eq. 8-38) is implemented. Then check yielding with n<sub>p</sub> = S<sub>p</sub>/(σ<sub>m</sub> + σ<sub>a</sub>) (Eq. 8-51).',
        vars: [
          { id: 'Pmax', symbol: 'P_{max}', label: 'Max external load per bolt', unit: 'lbf / N', kind: 'input', hint: 'blank = P from step 4' },
          { id: 'Pmin', symbol: 'P_{min}', label: 'Min external load per bolt', unit: 'lbf / N', kind: 'input', default: 0 },
          { id: 'fcrit', label: 'Criterion', kind: 'choice', type: 'text', options: [{ label: 'Goodman (Eq. 8-38 / 8-45)', value: 'goodman' }, { label: 'Gerber (Eq. 8-46, repeated load only)', value: 'gerber' }, { label: 'ASME-elliptic (Eq. 8-47, repeated load only)', value: 'asme' }], default: 'goodman' },
          { id: 'Pmx', symbol: 'P_{max}', label: 'Pmax used', unit: 'lbf / N', kind: 'calc', digits: 4, compute: v => H.has(v, 'Pmax') ? v.Pmax : v.P },
          { id: 'siga', symbol: '\\sigma_a', label: 'Alternating stress', unit: 'psi / MPa', kind: 'calc', digits: 4, compute: v => H.has(v, 'C', 'Pmx', 'Pmin', 'At') ? v.C * (v.Pmx - v.Pmin) / (2 * v.At) : undefined,
            work: v => H.has(v, 'siga') ? '\\(\\sigma_a = \\dfrac{' + H.fmt(v.C, 4) + '(' + H.fmt(v.Pmx, 4) + ' - ' + H.fmt(v.Pmin) + ')}{2(' + H.fmt(v.At, 4) + ')} = ' + H.fmt(v.siga, 4) + '\\)' : null },
          { id: 'sigm', symbol: '\\sigma_m', label: 'Midrange stress', unit: 'psi / MPa', kind: 'calc', digits: 4, compute: v => H.has(v, 'C', 'Pmx', 'Pmin', 'At', 'Fi') ? v.C * (v.Pmx + v.Pmin) / (2 * v.At) + v.Fi / v.At : undefined,
            work: v => H.has(v, 'sigm') ? '\\(\\sigma_m = \\dfrac{' + H.fmt(v.C, 4) + '(' + H.fmt(v.Pmx, 4) + ' + ' + H.fmt(v.Pmin) + ')}{2(' + H.fmt(v.At, 4) + ')} + \\dfrac{' + H.fmt(v.Fi, 4) + '}{' + H.fmt(v.At, 4) + '} = ' + H.fmt(v.sigm, 4) + '\\)' : null },
          { id: 'nf', symbol: 'n_f', label: 'Fatigue factor of safety', kind: 'calc', digits: 3, compute: v => { if (!H.has(v, 'Se', 'Sut', 'sigi', 'siga', 'sigm') || v.siga <= 0) return undefined;
              if (v.fcrit === 'gerber' && v.Pmin === 0) return 2 * v.siga * v.Se / (v.Sut * Math.sqrt(v.Sut * v.Sut + 4 * v.Se * (v.Se + v.sigi)) - v.Sut * v.Sut - 2 * v.sigi * v.Se);
              if (v.fcrit === 'asme' && v.Pmin === 0 && H.has(v, 'Sp')) return v.Se / (v.siga * (v.Sp * v.Sp + v.Se * v.Se)) * (v.Sp * Math.sqrt(v.Sp * v.Sp + v.Se * v.Se - v.sigi * v.sigi) - v.sigi * v.Se);
              return v.Se * (v.Sut - v.sigi) / (v.Sut * v.siga + v.Se * (v.sigm - v.sigi)); },
            work: v => H.has(v, 'nf') ? ((v.fcrit === 'goodman' || v.Pmin !== 0) ? '\\(n_f = \\dfrac{' + H.fmt(v.Se) + '(' + H.fmt(v.Sut) + ' - ' + H.fmt(v.sigi, 4) + ')}{' + H.fmt(v.Sut) + '(' + H.fmt(v.siga, 4) + ') + ' + H.fmt(v.Se) + '(' + H.fmt(v.sigm, 4) + ' - ' + H.fmt(v.sigi, 4) + ')} = ' + H.fmt(v.nf, 3) + '\\)' : '\\(n_f = ' + H.fmt(v.nf, 3) + '\\) (' + (v.fcrit === 'gerber' ? 'Eq. 8-46' : 'Eq. 8-47') + ')') : null },
          { id: 'npf', symbol: 'n_p', label: 'Yield check Sp/(σm + σa)', kind: 'calc', digits: 3, compute: v => H.has(v, 'Sp', 'sigm', 'siga') && (v.sigm + v.siga) > 0 ? v.Sp / (v.sigm + v.siga) : undefined },
          { id: 'Fimax', symbol: 'F_{i,max}', label: 'Preload ceiling for fatigue benefit (1 − C) Sut At', unit: 'lbf / N', kind: 'calc', digits: 4, compute: v => H.has(v, 'C', 'Sut', 'At') ? (1 - v.C) * v.Sut * v.At : undefined },
        ],
        when: v => H.has(v, 'Se') && H.has(v, 'C'),
        after: v => v.nf === undefined ? '<span>Enter Se (Table 8-17) to get the fatigue factor.</span>' : (v.nf >= 1 ? '<span class="result-ok">Fatigue PASS — n<sub>f</sub> = ' + H.fmt(v.nf, 3) + ' (' + v.fcrit + '), n<sub>p</sub> = ' + H.fmt(v.npf, 3) + '.' + (v.fcrit !== 'goodman' && v.Pmin !== 0 ? ' (Pmin ≠ 0: Goodman Eq. 8-38 was used.)' : '') + '</span>' : '<span class="result-bad">Fatigue FAIL — n<sub>f</sub> = ' + H.fmt(v.nf, 3) + ' &lt; 1: more / larger / higher-grade bolts, or a less conservative criterion (Gerber, ASME).</span>') },
    ] },
  ],
};
