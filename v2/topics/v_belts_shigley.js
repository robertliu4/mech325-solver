// V-belts — Shigley Ch. 17-3 (merged Fizz §1.4 + Mech §8.3.2 procedure, Shigley symbols)
(function () {
  // Table 17-9: width a, thickness b, minimum sheave diameter, hp range
  const SEC = {
    A: { a: 0.5, bt: 11 / 32, dmin: 3.0, conv: 1.3, Kb: 220, Kc: 0.561, K: 674, bexp: 11.089, hp: '1/4–10 hp' },
    B: { a: 21 / 32, bt: 7 / 16, dmin: 5.4, conv: 1.8, Kb: 576, Kc: 0.965, K: 1193, bexp: 10.926, hp: '1–25 hp' },
    C: { a: 7 / 8, bt: 17 / 32, dmin: 9.0, conv: 2.9, Kb: 1600, Kc: 1.716, K: 2038, bexp: 11.173, hp: '15–100 hp' },
    D: { a: 1.25, bt: 0.75, dmin: 13.0, conv: 3.3, Kb: 5680, Kc: 3.498, K: 4208, bexp: 11.105, hp: '50–250 hp' },
    E: { a: 1.5, bt: 1.0, dmin: 21.6, conv: 4.5, Kb: 10850, Kc: 5.041, K: 6061, bexp: 11.100, hp: '100 hp and up' },
  };
  // Table 17-10 inside circumferences
  const LENGTHS = {
    A: [26, 31, 33, 35, 38, 42, 46, 48, 51, 53, 55, 57, 60, 62, 64, 66, 68, 71, 75, 78, 80, 85, 90, 96, 105, 112, 120, 128],
    B: [35, 38, 42, 46, 48, 51, 53, 55, 57, 60, 62, 64, 65, 66, 68, 71, 75, 78, 79, 81, 83, 85, 90, 93, 97, 100, 103, 105, 112, 120, 128, 131, 136, 144, 158, 173, 180, 195, 210, 240, 270, 300],
    C: [51, 60, 68, 75, 81, 85, 90, 96, 105, 112, 120, 128, 136, 144, 158, 162, 173, 180, 195, 210, 240, 270, 300, 330, 360, 390, 420],
    D: [120, 128, 144, 158, 162, 173, 180, 195, 210, 240, 270, 300, 330, 360, 390, 420, 480, 540, 600, 660],
    E: [180, 195, 210, 240, 270, 300, 330, 360, 390, 420, 480, 540, 600, 660],
  };
  // Table 17-12 horsepower ratings: rows [d, hp@1000, 2000, 3000, 4000, 5000]  (blank cells → NaN)
  const HP = {
    A: [[2.6, 0.47, 0.62, 0.53, 0.15, NaN], [3.0, 0.66, 1.01, 1.12, 0.93, 0.38], [3.4, 0.81, 1.31, 1.57, 1.53, 1.12], [3.8, 0.93, 1.55, 1.92, 2.00, 1.71], [4.2, 1.03, 1.74, 2.20, 2.38, 2.19], [4.6, 1.11, 1.89, 2.44, 2.69, 2.58], [5.0, 1.17, 2.03, 2.64, 2.96, 2.89]],
    B: [[4.2, 1.07, 1.58, 1.68, 1.26, 0.22], [4.6, 1.27, 1.99, 2.29, 2.08, 1.24], [5.0, 1.44, 2.33, 2.80, 2.76, 2.10], [5.4, 1.59, 2.62, 3.24, 3.34, 2.82], [5.8, 1.72, 2.87, 3.61, 3.85, 3.45], [6.2, 1.82, 3.09, 3.94, 4.28, 4.00], [6.6, 1.92, 3.29, 4.23, 4.67, 4.48], [7.0, 2.01, 3.46, 4.49, 5.01, 4.90]],
    C: [[6.0, 1.84, 2.66, 2.72, 1.87, NaN], [7.0, 2.48, 3.94, 4.64, 4.44, 3.12], [8.0, 2.96, 4.90, 6.09, 6.36, 5.52], [9.0, 3.34, 5.65, 7.21, 7.86, 7.39], [10.0, 3.64, 6.25, 8.11, 9.06, 8.89], [11.0, 3.88, 6.74, 8.84, 10.0, 10.1], [12.0, 4.09, 7.15, 9.46, 10.9, 11.1]],
    D: [[10.0, 4.14, 6.13, 6.55, 5.09, 1.35], [11.0, 5.00, 7.83, 9.11, 8.50, 5.62], [12.0, 5.71, 9.26, 11.2, 11.4, 9.18], [13.0, 6.31, 10.5, 13.0, 13.8, 12.2], [14.0, 6.82, 11.5, 14.6, 15.8, 14.8], [15.0, 7.27, 12.4, 15.9, 17.6, 17.0], [16.0, 7.66, 13.2, 17.1, 19.2, 19.0], [17.0, 8.01, 13.9, 18.1, 20.6, 20.7]],
    E: [[16.0, 8.68, 14.0, 17.5, 18.1, 15.3], [18.0, 9.92, 16.7, 21.2, 23.0, 21.5], [20.0, 10.9, 18.7, 24.2, 26.9, 26.4], [22.0, 11.7, 20.3, 26.6, 30.2, 30.5], [24.0, 12.4, 21.6, 28.6, 32.9, 33.8], [26.0, 13.0, 22.8, 30.3, 35.1, 36.7], [28.0, 13.4, 23.7, 31.8, 37.1, 39.1]],
  };
  const SPEEDS = [1000, 2000, 3000, 4000, 5000];
  function htab(sec, d, V) {
    const rows = HP[sec]; if (!rows) return undefined;
    if (d < rows[0][0] - 1e-9) return undefined;  // below smallest listed sheave
    let r0 = rows[0], r1 = rows[0];
    for (let i = 0; i < rows.length; i++) { if (rows[i][0] <= d) { r0 = rows[i]; r1 = rows[Math.min(i + 1, rows.length - 1)]; } }
    const t = (r1[0] === r0[0]) ? 0 : Math.min(1, (d - r0[0]) / (r1[0] - r0[0]));
    const row = r0.map((x, i) => i === 0 ? d : x + t * (r1[i] - x));
    const ys = row.slice(1);
    if (V < 1000 || V > 5000) return undefined;
    const val = H.interp(V, SPEEDS, ys);
    return isNaN(val) ? undefined : val;
  }
  // Table 17-14 K2: [upper bound of nominal (inside) length, factor]
  const K2T = {
    A: [[35, 0.85], [46, 0.90], [55, 0.95], [75, 1.00], [90, 1.05], [112, 1.10], [1e9, 1.15]],
    B: [[46, 0.85], [60, 0.90], [75, 0.95], [97, 1.00], [120, 1.05], [144, 1.10], [180, 1.15], [1e9, 1.20]],
    C: [[75, 0.85], [96, 0.90], [120, 0.95], [158, 1.00], [195, 1.05], [240, 1.10], [300, 1.15], [1e9, 1.20]],
    D: [[128, 0.85], [162, 0.90], [210, 0.95], [240, 1.00], [330, 1.05], [420, 1.10], [480, 1.15], [1e9, 1.20]],
    E: [[195, 0.90], [240, 0.95], [300, 1.00], [390, 1.05], [480, 1.10], [600, 1.15], [1e9, 1.20]],
  };
  const nearest = (x, arr) => arr.reduce((b, a) => Math.abs(a - x) < Math.abs(b - x) ? a : b);
  const sec = v => SEC[v.sec];

  window.TOPIC = {
    id: 'v_belts', book: 'shigley',
    title: 'V-Belts — Selection & Analysis',
    subtitle: 'Shigley Ch. 17-3 (Tables 17-9 … 17-17, Eqs. 17-16 … 17-28) · merged Fizz §1.4 + Mech §8.3.2',
    sibling: 'v_belts_mott.html',
    intro: 'Shigley\'s four-step V-belt analysis (Example 17-4): (1) V, L<sub>p</sub>, C, φ and exp(0.5123φ); (2) H<sub>d</sub>, H<sub>a</sub> = K<sub>1</sub>K<sub>2</sub>H<sub>tab</sub> and the number of belts N<sub>b</sub>; (3) F<sub>c</sub>, ΔF, F<sub>1</sub>, F<sub>2</sub>, F<sub>i</sub>, n<sub>fs</sub>; (4) belt life in passes and hours. Shigley rates the inch sections A–E (Table 17-12); the narrow 3V/5V/8V sections are rated with Mott\'s charts in the Mott version. Both bibles prefer Mott for exam selection, but use this page when the question asks for tensions, F<sub>i</sub> or belt life.',
    example: { Hnom: 10, n: 1750, Ks: 1.3, nd: 1, sec: 'B', d: 7.4, D: 11, L: 112 },

    figures: [
      { id: 'table17-9', ref: 'Table 17-9', title: 'Standard V-belt sections (width, thickness, min sheave dia, hp range)', src: 'figures/shigley/table17-9.png', page: 922 },
      { id: 'table17-10', ref: 'Table 17-10', title: 'Inside circumferences of standard V belts', src: 'figures/shigley/table17-10.png', page: 922 },
      { id: 'table17-11', ref: 'Table 17-11', title: 'Length conversion: pitch length = inside circumference + quantity', src: 'figures/shigley/table17-11.png', page: 922 },
      { id: 'table17-12', ref: 'Table 17-12', title: 'Horsepower ratings of standard V belts (Htab vs sheave dia & belt speed)', src: 'figures/shigley/table17-12.png', page: 924, note: 'Interpolate on belt speed (and sheave diameter). "and up" rows apply to all larger sheaves.' },
      { id: 'table17-13', ref: 'Table 17-13', title: 'Angle-of-wrap correction factor K1', src: 'figures/shigley/table17-13.png', page: 925, note: 'VV column curve fit: K1 = 0.143543 + 0.007468φ − 0.000015052φ² (φ in degrees, 90–180°).' },
      { id: 'table17-14', ref: 'Table 17-14', title: 'Belt-length correction factor K2', src: 'figures/shigley/table17-14.png', page: 925, note: 'Enter with the nominal (inside-circumference) belt length, e.g. B112 → 1.05.' },
      { id: 'table17-15', ref: 'Table 17-15', title: 'Suggested service factors Ks for V-belt drives', src: 'figures/shigley/table17-15.png', page: 925 },
      { id: 'table17-16', ref: 'Table 17-16', title: 'V-belt parameters Kb (bending) and Kc (centrifugal)', src: 'figures/shigley/table17-16.png', page: 926 },
      { id: 'fig17-14', ref: 'Figure 17-14', title: 'V-belt tensions around the drive (F1, F2, Fi, Fc, Fb)', src: 'figures/shigley/fig17-14.png', page: 926 },
      { id: 'table17-17', ref: 'Table 17-17', title: 'Durability parameters K and b for belt life', src: 'figures/shigley/table17-17.png', page: 927 },
      { id: 'fig17-1', ref: 'Figure 17-1', title: 'Belt geometry — wrap angle and length', src: 'figures/shigley/fig17-1.png', page: 904 },
    ],

    sections: [
      { title: 'Inputs', steps: [
        { id: 'in', title: 'Problem data and design power', fig: ['table17-15'], eq: '17-19', formula: 'H_d = H_{nom}K_s n_d',
          text: 'Ks from Table 17-15 (add 0.1 for continuous 24 h duty, as in Example 17-4). nd is the design factor (1.0 if none given).',
          vars: [
            { id: 'Hnom', symbol: 'H_{nom}', label: 'Nominal power', unit: 'hp', kind: 'input' },
            { id: 'n', symbol: 'n', label: 'Small-sheave (driver) speed', unit: 'rpm', kind: 'input' },
            { id: 'n2', symbol: 'n_2', label: 'Driven speed (optional)', unit: 'rpm', kind: 'input', hint: 'gives VR = n/n2 when D is unknown' },
            { id: 'Ks', symbol: 'K_s', label: 'Service factor', unit: '', kind: 'lookup', fig: 'table17-15', default: 1.2 },
            { id: 'nd', symbol: 'n_d', label: 'Design factor', unit: '', kind: 'input', default: 1.0 },
            { id: 'Hd', symbol: 'H_d', label: 'Design power', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'Hnom', 'Ks', 'nd') ? v.Hnom * v.Ks * v.nd : undefined,
              work: v => H.has(v, 'Hd') ? '\\(H_d = ' + H.fmt(v.Hnom) + '(' + H.fmt(v.Ks) + ')(' + H.fmt(v.nd) + ') = ' + H.fmt(v.Hd) + '\\ \\text{hp}\\)' : null },
          ] },
        { id: 'sec', title: 'Belt section and sheaves', fig: ['table17-9'],
          text: 'Pick the section from the hp range in Table 17-9 (A: ¼–10 hp, B: 1–25, C: 15–100, D: 50–250, E: 100+). Small sheave d must be ≥ the minimum sheave diameter. A good belt speed is 4000 ft/min; trouble above 5000 or below 1000 ft/min.',
          vars: [
            { id: 'sec', label: 'Belt section', kind: 'choice', type: 'text', options: ['A', 'B', 'C', 'D', 'E'] },
            { id: 'dmin', symbol: 'd_{min}', label: 'Minimum sheave diameter', unit: 'in', kind: 'lookup', fig: 'table17-9', auto: v => sec(v) ? sec(v).dmin : undefined },
            { id: 'd', symbol: 'd', label: 'Small sheave pitch diameter', unit: 'in', kind: 'input', check: v => (H.has(v, 'd', 'dmin') && v.d < v.dmin) ? 'd below minimum sheave diameter for this section' : null,
              auto: v => (H.has(v, 'n') ? 4000 * 12 / (Math.PI * v.n) : undefined), hint: 'auto = size for 4000 ft/min; enter a standard size' },
            { id: 'D', symbol: 'D', label: 'Large sheave pitch diameter', unit: 'in', kind: 'input', auto: v => (H.has(v, 'd', 'n', 'n2') ? v.d * v.n / v.n2 : undefined), hint: 'auto = d·n/n2' },
            { id: 'VR', symbol: 'VR', label: 'Velocity ratio D/d', unit: '', kind: 'calc', compute: v => H.has(v, 'D', 'd') ? v.D / v.d : undefined },
            { id: 'nout', symbol: 'n_{out}', label: 'Actual driven speed', unit: 'rpm', kind: 'calc', compute: v => H.has(v, 'n', 'VR') ? v.n / v.VR : undefined },
            { id: 'V', symbol: 'V', label: 'Belt speed', unit: 'ft/min', kind: 'calc', compute: v => H.has(v, 'd', 'n') ? Math.PI * v.d * v.n / 12 : undefined,
              work: v => H.has(v, 'V') ? '\\(V = \\pi(' + H.fmt(v.d) + ')(' + H.fmt(v.n) + ')/12 = ' + H.fmt(v.V) + '\\ \\text{ft/min}\\)' : null,
              check: v => (H.has(v, 'V') && (v.V > 5000 || v.V < 1000)) ? 'Belt speed outside 1000–5000 ft/min (Table 17-12 range)' : null },
          ] },
      ] },

      { title: 'Geometry (step 1)', steps: [
        { id: 'len', title: 'Belt length and centre distance', fig: ['table17-10', 'table17-11'], eq: '17-16a, 17-16b',
          formula: 'L_p = 2C + \\frac{\\pi(D+d)}{2} + \\frac{(D-d)^2}{4C},\\qquad C = 0.25\\left\\{\\left[L_p - \\frac{\\pi}{2}(D+d)\\right] + \\sqrt{\\left[L_p - \\frac{\\pi}{2}(D+d)\\right]^2 - 2(D-d)^2}\\right\\}',
          text: 'Either enter a trial centre distance C (recommended D ≤ C ≤ 3(D + d)) — the required pitch length and nearest standard inside circumference are found — or enter the belt length L directly (e.g. B112 → L = 112). The pitch length is L plus the Table 17-11 quantity; the actual C follows from Eq. 17-16b.',
          vars: [
            { id: 'Ct', symbol: 'C_{trial}', label: 'Trial centre distance (optional)', unit: 'in', kind: 'input',
              check: v => (H.has(v, 'Ct', 'D', 'd') && (v.Ct < v.D || v.Ct > 3 * (v.D + v.d))) ? 'Recommended D < C < 3(D + d)' : null },
            { id: 'Lpreq', symbol: 'L_{p,req}', label: 'Required pitch length from C_trial', unit: 'in', kind: 'calc', compute: v => H.has(v, 'Ct', 'D', 'd') ? 2 * v.Ct + Math.PI * (v.D + v.d) / 2 + (v.D - v.d) ** 2 / (4 * v.Ct) : undefined },
            { id: 'conv', symbol: 'L_c', label: 'Length conversion (Table 17-11)', unit: 'in', kind: 'lookup', fig: 'table17-11', auto: v => sec(v) ? sec(v).conv : undefined },
            { id: 'L', symbol: 'L', label: 'Standard inside circumference', unit: 'in', kind: 'lookup', fig: 'table17-10',
              auto: v => (H.has(v, 'Lpreq', 'conv') && LENGTHS[v.sec]) ? nearest(v.Lpreq - v.conv, LENGTHS[v.sec]) : undefined, hint: 'belt designation = section + L, e.g. B112' },
            { id: 'Lp', symbol: 'L_p', label: 'Pitch length', unit: 'in', kind: 'calc', compute: v => { const c = H.has(v, 'conv') ? v.conv : (sec(v) ? sec(v).conv : undefined); return (H.has(v, 'L') && c !== undefined) ? v.L + c : undefined; },
              work: v => H.has(v, 'Lp') ? '\\(L_p = L + L_c = ' + H.fmt(v.L) + ' + ' + H.fmt(v.Lp - v.L) + ' = ' + H.fmt(v.Lp) + '\\ \\text{in}\\)' : null },
            { id: 'C', symbol: 'C', label: 'Actual centre distance', unit: 'in', kind: 'calc', compute: v => {
                if (!H.has(v, 'Lp', 'D', 'd')) return undefined; const q = v.Lp - Math.PI / 2 * (v.D + v.d); const r = q * q - 2 * (v.D - v.d) ** 2; return r >= 0 ? 0.25 * (q + Math.sqrt(r)) : undefined; },
              work: v => H.has(v, 'C') ? '\\(C = 0.25\\{[' + H.fmt(v.Lp) + ' - \\tfrac{\\pi}{2}(' + H.fmt(v.D) + '+' + H.fmt(v.d) + ')] + \\sqrt{[\\cdots]^2 - 2(' + H.fmt(v.D) + '-' + H.fmt(v.d) + ')^2}\\} = ' + H.fmt(v.C) + '\\ \\text{in}\\)' : null },
          ] },
        { id: 'wrap', title: 'Wrap angle and friction term', fig: ['fig17-1'], eq: '17-1, 17-18',
          formula: '\\phi_d = \\pi - 2\\sin^{-1}\\frac{D-d}{2C},\\qquad \\frac{F_1-F_c}{F_2-F_c} = \\exp(0.5123\\,\\phi)',
          text: 'Gates\' effective coefficient of friction for V grooves is f′ = 0.5123.',
          vars: [
            { id: 'phi', symbol: '\\phi_d', label: 'Wrap angle, small sheave', unit: 'rad', kind: 'calc', digits: 5, compute: v => H.has(v, 'D', 'd', 'C') ? Math.PI - 2 * Math.asin((v.D - v.d) / (2 * v.C)) : undefined,
              work: v => H.has(v, 'phi') ? '\\(\\phi_d = \\pi - 2\\sin^{-1}\\frac{' + H.fmt(v.D) + '-' + H.fmt(v.d) + '}{2(' + H.fmt(v.C) + ')} = ' + H.fmt(v.phi, 5) + '\\ \\text{rad} = ' + H.fmt(v.phideg) + '^\\circ\\)' : null },
            { id: 'phideg', symbol: '\\phi_d', label: 'Wrap angle, small sheave', unit: '°', kind: 'calc', compute: v => H.has(v, 'phi') ? H.deg(v.phi) : undefined, check: v => (H.has(v, 'phideg') && v.phideg < 120) ? 'Wrap < 120° — increase C' : null },
            { id: 'efp', symbol: 'e^{0.5123\\phi}', label: 'exp(0.5123 φ)', unit: '', kind: 'calc', compute: v => H.has(v, 'phi') ? Math.exp(0.5123 * v.phi) : undefined },
          ] },
      ] },

      { title: 'Power rating & number of belts (step 2)', steps: [
        { id: 'rate', title: 'Tabulated and allowable power per belt', fig: ['table17-12', 'table17-13', 'table17-14'], eq: '17-17',
          formula: 'H_a = K_1 K_2 H_{tab}',
          text: 'Htab: Table 17-12, enter with the small-sheave pitch diameter and belt speed, interpolating on V (auto = bilinear interpolation of the table). K1: Table 17-13 (auto = the VV curve fit). K2: Table 17-14 with the nominal belt length L.',
          vars: [
            { id: 'Htab', symbol: 'H_{tab}', label: 'Tabulated power per belt', unit: 'hp', kind: 'lookup', fig: 'table17-12', auto: v => (v.sec && H.has(v, 'd', 'V')) ? htab(v.sec, v.d, v.V) : undefined },
            { id: 'K1', symbol: 'K_1', label: 'Angle-of-wrap correction', unit: '', kind: 'lookup', fig: 'table17-13', auto: v => H.has(v, 'phideg') ? 0.143543 + 0.007468 * v.phideg - 0.000015052 * v.phideg ** 2 : undefined },
            { id: 'K2', symbol: 'K_2', label: 'Belt-length correction', unit: '', kind: 'lookup', fig: 'table17-14', auto: v => { if (!H.has(v, 'L') || !K2T[v.sec]) return undefined; for (const [ub, k] of K2T[v.sec]) if (v.L <= ub) return k; } },
            { id: 'Ha', symbol: 'H_a', label: 'Allowable power per belt', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'K1', 'K2', 'Htab') ? v.K1 * v.K2 * v.Htab : undefined,
              work: v => H.has(v, 'Ha') ? '\\(H_a = K_1K_2H_{tab} = ' + H.fmt(v.K1, 3) + '(' + H.fmt(v.K2, 3) + ')(' + H.fmt(v.Htab) + ') = ' + H.fmt(v.Ha) + '\\ \\text{hp}\\)' : null },
          ] },
        { id: 'nb', title: 'Number of belts', eq: '17-20', formula: 'N_b \\ge \\frac{H_d}{H_a},\\qquad N_b = 1, 2, 3, \\dots',
          vars: [
            { id: 'Nbcalc', symbol: 'H_d/H_a', label: 'Belts required (unrounded)', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'Hd', 'Ha') ? v.Hd / v.Ha : undefined },
            { id: 'Nb', symbol: 'N_b', label: 'Number of belts (rounded up)', unit: '', kind: 'calc', compute: v => H.has(v, 'Nbcalc') ? Math.ceil(v.Nbcalc - 1e-9) : undefined,
              work: v => H.has(v, 'Nb') ? '\\(N_b \\ge ' + H.fmt(v.Hd) + '/' + H.fmt(v.Ha) + ' = ' + H.fmt(v.Nbcalc, 3) + ' \\rightarrow ' + v.Nb + '\\)' : null },
          ] },
      ] },

      { title: 'Tensions (step 3)', steps: [
        { id: 'tens', title: 'Centrifugal tension, ΔF, F1, F2, Fi and factor of safety', fig: ['table17-16', 'fig17-14'], eq: '17-21 … 17-26',
          formula: 'F_c = K_c\\left(\\frac{V}{1000}\\right)^2,\\quad \\Delta F = \\frac{63\\,025 H_d/N_b}{n(d/2)},\\quad F_1 = F_c + \\frac{\\Delta F e^{f\\phi}}{e^{f\\phi}-1},\\quad F_2 = F_1 - \\Delta F,\\quad F_i = \\frac{F_1+F_2}{2}-F_c,\\quad n_{fs} = \\frac{H_a N_b}{H_{nom}K_s}',
          vars: [
            { id: 'Kc', symbol: 'K_c', label: 'Centrifugal parameter', unit: '', kind: 'lookup', fig: 'table17-16', auto: v => sec(v) ? sec(v).Kc : undefined },
            { id: 'Fc', symbol: 'F_c', label: 'Centrifugal tension', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'Kc', 'V') ? v.Kc * (v.V / 1000) ** 2 : undefined,
              work: v => H.has(v, 'Fc') ? '\\(F_c = ' + H.fmt(v.Kc) + '(' + H.fmt(v.V) + '/1000)^2 = ' + H.fmt(v.Fc) + '\\ \\text{lbf}\\)' : null },
            { id: 'dF', symbol: '\\Delta F', label: 'Tension difference per belt', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'Hd', 'Nb', 'n', 'd') ? 63025 * v.Hd / v.Nb / (v.n * v.d / 2) : undefined,
              work: v => H.has(v, 'dF') ? '\\(\\Delta F = \\frac{63\\,025(' + H.fmt(v.Hd) + ')/' + v.Nb + '}{' + H.fmt(v.n) + '(' + H.fmt(v.d) + '/2)} = ' + H.fmt(v.dF) + '\\ \\text{lbf}\\)' : null },
            { id: 'F1', symbol: 'F_1', label: 'Tight-side tension', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'Fc', 'dF', 'efp') ? v.Fc + v.dF * v.efp / (v.efp - 1) : undefined,
              work: v => H.has(v, 'F1') ? '\\(F_1 = ' + H.fmt(v.Fc) + ' + \\frac{' + H.fmt(v.dF) + '(' + H.fmt(v.efp) + ')}{' + H.fmt(v.efp) + ' - 1} = ' + H.fmt(v.F1) + '\\ \\text{lbf}\\)' : null },
            { id: 'F2', symbol: 'F_2', label: 'Slack-side tension', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'F1', 'dF') ? v.F1 - v.dF : undefined },
            { id: 'Fi', symbol: 'F_i', label: 'Initial tension', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'F1', 'F2', 'Fc') ? (v.F1 + v.F2) / 2 - v.Fc : undefined,
              work: v => H.has(v, 'Fi') ? '\\(F_i = \\frac{' + H.fmt(v.F1) + ' + ' + H.fmt(v.F2) + '}{2} - ' + H.fmt(v.Fc) + ' = ' + H.fmt(v.Fi) + '\\ \\text{lbf}\\)' : null },
            { id: 'nfs', symbol: 'n_{fs}', label: 'Factor of safety', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'Ha', 'Nb', 'Hnom', 'Ks') ? v.Ha * v.Nb / (v.Hnom * v.Ks) : undefined,
              work: v => H.has(v, 'nfs') ? '\\(n_{fs} = \\frac{' + H.fmt(v.Ha) + '(' + v.Nb + ')}{' + H.fmt(v.Hnom) + '(' + H.fmt(v.Ks) + ')} = ' + H.fmt(v.nfs, 3) + '\\)' : null },
          ] },
      ] },

      { title: 'Belt life (step 4)', steps: [
        { id: 'life', title: 'Bending tensions, passes and hours', fig: ['table17-16', 'table17-17'], eq: '17-27, 17-28',
          formula: 'T_1 = F_1 + \\frac{K_b}{d},\\quad T_2 = F_1 + \\frac{K_b}{D},\\quad N_P = \\left[\\left(\\frac{K}{T_1}\\right)^{-b} + \\left(\\frac{K}{T_2}\\right)^{-b}\\right]^{-1},\\quad t = \\frac{N_P L_p}{720 V}',
          text: 'If N<sub>P</sub> > 10⁹ report N<sub>P</sub> = 10⁹ and t > N<sub>P</sub>L<sub>p</sub>/(720V) — the Table 17-17 constants are only valid for 10⁸–10⁹ force peaks.',
          vars: [
            { id: 'Kb', symbol: 'K_b', label: 'Bending parameter', unit: '', kind: 'lookup', fig: 'table17-16', auto: v => sec(v) ? sec(v).Kb : undefined },
            { id: 'Fb1', symbol: '(F_b)_1', label: 'Bending tension, small sheave', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'Kb', 'd') ? v.Kb / v.d : undefined },
            { id: 'Fb2', symbol: '(F_b)_2', label: 'Bending tension, large sheave', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'Kb', 'D') ? v.Kb / v.D : undefined },
            { id: 'T1', symbol: 'T_1', label: 'Peak tension at small sheave', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'F1', 'Fb1') ? v.F1 + v.Fb1 : undefined },
            { id: 'T2', symbol: 'T_2', label: 'Peak tension at large sheave', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'F1', 'Fb2') ? v.F1 + v.Fb2 : undefined },
            { id: 'K', symbol: 'K', label: 'Durability constant K', unit: '', kind: 'lookup', fig: 'table17-17', auto: v => sec(v) ? sec(v).K : undefined },
            { id: 'bexp', symbol: 'b', label: 'Durability exponent b', unit: '', kind: 'lookup', fig: 'table17-17', auto: v => sec(v) ? sec(v).bexp : undefined },
            { id: 'NP', symbol: 'N_P', label: 'Life in passes', unit: '', kind: 'calc', compute: v => H.has(v, 'K', 'bexp', 'T1', 'T2') ? 1 / ((v.K / v.T1) ** (-v.bexp) + (v.K / v.T2) ** (-v.bexp)) : undefined,
              work: v => H.has(v, 'NP') ? '\\(N_P = \\left[\\left(\\frac{' + H.fmt(v.K) + '}{' + H.fmt(v.T1) + '}\\right)^{-' + H.fmt(v.bexp) + '} + \\left(\\frac{' + H.fmt(v.K) + '}{' + H.fmt(v.T2) + '}\\right)^{-' + H.fmt(v.bexp) + '}\\right]^{-1} = ' + H.fmt(v.NP, 3) + '\\ \\text{passes}\\)' : null,
              check: v => (H.has(v, 'NP') && v.NP > 1e9) ? 'NP > 10⁹: outside validity — report NP = 10⁹ and life t as a lower bound' : null },
            { id: 'thr', symbol: 't', label: 'Life in hours', unit: 'h', kind: 'calc', compute: v => H.has(v, 'NP', 'Lp', 'V') ? Math.min(v.NP, 1e9) * v.Lp / (720 * v.V) : undefined,
              work: v => H.has(v, 'thr') ? '\\(t ' + (v.NP > 1e9 ? '>' : '=') + ' \\frac{' + H.fmt(Math.min(v.NP, 1e9), 3) + '(' + H.fmt(v.Lp) + ')}{720(' + H.fmt(v.V) + ')} = ' + H.fmt(v.thr) + '\\ \\text{h}\\)' : null },
          ],
          after: v => {
            if (!H.has(v, 'Nb', 'nfs')) return '';
            return (v.nfs >= 1 ? '<span class="result-ok">OK</span>' : '<span class="result-bad">CHECK</span>') + ' — use ' + v.Nb + ' × ' + (v.sec || '?') + (H.has(v, 'L') ? H.fmt(v.L) : '') + ' belts on ' + H.fmt(v.d) + ' in / ' + H.fmt(v.D) + ' in sheaves, C = ' + H.fmt(v.C) + ' in; n<sub>fs</sub> = ' + H.fmt(v.nfs, 3) + (H.has(v, 'thr') ? '; life ' + (v.NP > 1e9 ? '> ' : '≈ ') + H.fmt(v.thr) + ' h' : '') + '.';
          } },
      ] },
    ],
  };
})();
