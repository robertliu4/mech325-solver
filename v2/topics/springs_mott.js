// Helical springs — Mott Ch. 18 (Fizz §5.3; Example Problems 18-1 … 18-4) with the design-stress charts Figs. 18-8 … 18-13
// Course alignment (v2/COURSE_CONVENTIONS.md §14): Module 5 reading guide — Mott 18-1 … 18-4 and the 18-6 design example; the course's worked
// spring problems are Shigley ones (HW5 P6 = Shigley 10-6, STQ 2022 = Shigley 10-3/10-5) — see v2/notes/past_exam_m5.md.
// Verified against: Mott Example 18-4 (extension, A227, Fo 26.75 lb @ 4.25 in, Fi 16.25 @ 3.50, OD 0.625, Dm trial 0.5, τd 110 → 120 ksi,
//   Dw 0.072) → k 14.0, Dm 0.553, C 7.68, K 1.19, τo 120 ksi, Na 16.3, body 1.25 in, Lf 2.21 (→ 2.50 chosen), fo 1.75, FI 2.25 lb, τI 10 100 psi — reproduced.
// Verified against: Mott Example 18-2, Method 1 (the `example`: A231, Fo 12 lb @ 1.25 in, Fi 8 lb @ 1.75 in, Dm 0.60, τdi 130 ksi, Dw 0.0625,
//   τd 145 ksi, τmax 170 ksi) → k 8.00, Lf 2.75, Dwt 0.055, OD 0.663, Na 12.36, C 9.60, K 1.15, τo 86 459, Ls 0.898, Fs 14.82, τs 106 768,
//   Lf/Dm 4.58, cc 0.029, Dhole ≥ 0.669 — reproduced; the wire table picks 16 ga (0.0625 in), the next size above Dwt.
// Verified against: HW5 P6 in Mott's method (A229 4 mm, Dm 40, plain ends, Lf 80, 50 N at 65 mm) → k 3.333, Na 11.58, Ls 50.3, Fs 98.9 N,
//   τs 180.3 MPa with Wahl K (Shigley/K_B solution 178.2 MPa) — reproduced within 1 %.
const MOTT_G = {
  A227: ['Hard-drawn steel A227 (Fig. 18-8)', 11.5e6, 79.3, 28.6e6, 197], A228: ['Music wire A228 (Fig. 18-9)', 11.85e6, 81.7, 29.0e6, 200],
  A229: ['Oil-tempered A229 (Fig. 18-10)', 11.2e6, 77.2, 28.5e6, 196], A231: ['Chromium-vanadium A231 (Fig. 18-11)', 11.2e6, 77.2, 28.5e6, 196],
  A401: ['Chromium-silicon A401 (Fig. 18-12)', 11.2e6, 77.2, 29.5e6, 203], A313: ['Stainless 302/304/316 A313 (Fig. 18-13)', 10.0e6, 69.0, 28.0e6, 193],
  A313_177: ['Stainless 17-7 PH A313 (Fig. 18-13)', 10.5e6, 72.4, 29.5e6, 203], B134: ['Spring brass B134', 5.0e6, 34.5, 15.0e6, 103],
  B159: ['Phosphor bronze B159', 6.0e6, 41.4, 15.0e6, 103], B197: ['Beryllium copper B197', 7.0e6, 48.3, 17.0e6, 117],
};
// Mott Table 18-2: gauge, U.S. Steel Wire gauge (in), music wire gauge (in); preferred metric diameters (mm)
const GAUGE = ['7/0', '6/0', '5/0', '4/0', '3/0', '2/0', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40'];
const USW = [0.4900, 0.4615, 0.4305, 0.3938, 0.3625, 0.3310, 0.3065, 0.2830, 0.2625, 0.2437, 0.2253, 0.2070, 0.1920, 0.1770, 0.1620, 0.1483, 0.1350, 0.1205, 0.1055, 0.0915, 0.0800, 0.0720, 0.0625, 0.0540, 0.0475, 0.0410, 0.0348, 0.0317, 0.0286, 0.0258, 0.0230, 0.0204, 0.0181, 0.0173, 0.0162, 0.0150, 0.0140, 0.0132, 0.0128, 0.0118, 0.0104, 0.0095, 0.0090, 0.0085, 0.0080, 0.0075, 0.0070];
const MUS = [null, 0.004, 0.005, 0.006, 0.007, 0.008, 0.009, 0.010, 0.011, 0.012, 0.013, 0.014, 0.016, 0.018, 0.020, 0.022, 0.024, 0.026, 0.029, 0.031, 0.033, 0.035, 0.037, 0.039, 0.041, 0.043, 0.045, 0.047, 0.049, 0.051, 0.055, 0.059, 0.063, 0.067, 0.071, 0.075, 0.080, 0.085, 0.090, 0.095, 0.100, 0.106, 0.112, 0.118, 0.124, 0.130, 0.138];
const METRIC = [0.2, 0.22, 0.25, 0.28, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.8, 0.9, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.5, 2.8, 3.0, 3.5, 3.8, 4.0, 4.5, 4.8, 5.0, 5.5, 6.0, 6.5, 7.0, 8.0, 8.5, 9.0, 10, 11, 12, 13];
const MFIG = { A227: 'fig18-8', A228: 'fig18-9', A229: 'fig18-10', A231: 'fig18-11', A401: 'fig18-12', A313: 'fig18-13', A313_177: 'fig18-13' };
const SIu = v => v.units === 'SI';
const NE = { plain: 0, pg: 1, sq: 2, sg: 2 };
const TX = (x, d) => String(H.fmt(x, d)).replace(/e([+-]?)(\d+)$/, (m, s, e) => '\\times10^{' + (s === '-' ? '-' : '') + e + '}');
const ck = b => b ? '<span class="result-ok">✓</span>' : '<span class="result-bad">✗</span>';
function wireTable(v) {
  if (v.mode === 'analyse' || !H.has(v, 'Dwt')) return '';
  const list = SIu(v) ? METRIC.map(d => ({ g: d + ' mm', d })) : GAUGE.map((g, i) => ({ g: (v.mat === 'A228' ? 'music ' : 'USSW ') + g, d: (v.mat === 'A228' ? MUS : USW)[i] })).filter(x => x.d).sort((a, b) => a.d - b.d);
  const k = list.findIndex(x => x.d >= v.Dwt - 1e-9); if (k < 0) return '';
  const Dm = H.has(v, 'Dm') && v.mode === 'ext' && H.has(v, 'ODg') ? undefined : v.Dmt, u = SIu(v) ? ' mm' : ' in';
  const rows = list.slice(Math.max(0, k - 2), k + 4).map(x => { const D = (v.mode === 'ext' && H.has(v, 'ODg')) ? v.ODg - x.d : Dm; const C = D / x.d, K = (4 * C - 1) / (4 * C - 4) + 0.615 / C, to = H.has(v, 'Fo') ? 8 * K * v.Fo * D / (Math.PI * Math.pow(x.d, 3)) : undefined; return { x, C, K, to }; });
  return H.table(['Wire (Table 18-2)', '\\(D_w\\)', 'C', 'K', '\\(\\tau_o\\) at \\(F_o\\)'], rows.map(r => ({ cells: [r.x.g + (v.Dw === r.x.d ? ' ✔' : ''), H.fmt(r.x.d) + u, isFinite(r.C) ? H.fmt(r.C, 3) : '—', isFinite(r.K) ? H.fmt(r.K, 3) : '—', r.to !== undefined && isFinite(r.to) ? H.fmt(r.to, 4) : '—'],
    ok: r.x.d >= v.Dwt - 1e-9, pick: r.x === list[k], set: { Dw: r.x.d } })),
    { caption: 'Select the wire — next standard size above \\(D_{w,t} = ' + TX(v.Dwt, 4) + '\\)' + u, note: 'Rule (Mott 18-6, Ex. 18-2): the next larger standard wire (U.S. Steel Wire gauge; music-wire gauge for A228; metric preferred sizes). Then re-read \\(\\tau_d\\) and \\(\\tau_{max}\\) at that size.' });
}

window.TOPIC = {
  id: 'springs', book: 'mott',
  title: 'Helical Compression Springs — Analysis & Design',
  subtitle: 'Mott Ch. 18-3 … 18-7 (Examples 18-1, 18-2, 18-4) · Fizz guide §5.3',
  sibling: 'springs_shigley.html',
  intro: 'Mott reads the allowable stress from the design-stress charts (Figs. 18-8 … 18-13) for the material, wire size and service class. '
    + '<b>Design</b> (Ex. 18-2): two force–length points → k, \\(L_f\\); trial \\(D_w\\) → standard wire → stress, coils, solid height, buckling, clearances. <b>Analysis</b> (Ex. 18-1): a given spring. <b>Extension</b> (18-7, Ex. 18-4). Units: US or SI.',
  example: { units: 'US', mode: 'design', Fo: 12, Lo: 1.25, Fi: 8, Li: 1.75, mat: 'A231', service: 'avg', Dmt: 0.6, tdi: 130000, Dw: 0.0625, td: 145000, tmax: 170000, ends: 'sg', Dhole: 0.75 },

  assumptions: [
    { text: 'Squared-and-ground ends (needed on flat plates): \\(N_a = N - 2\\), \\(L_s = D_w N\\)', src: 'Fizz p.131 · Fizz p.146', var: 'ends' },
    { text: 'Design stress from the "average service" curve; the light-service curve is the maximum for the solid-height check', src: 'Mott §18-4', var: 'service' },
    { text: 'Trial wire diameter with Wahl K ≈ 1.2 (Eq. 18-7); Method 2 also assumes C ≈ 7', src: 'Mott §18-6', step: 'trial' },
    { text: 'Spring index 5 ≤ C ≤ 12 (forming cracks below 5); Fizz allows 4–12', src: 'Fizz p.129 · Mott §18-4', var: 'C' },
    { text: 'Stress with the Wahl factor K (Eq. 18-5); Shigley\'s \\(K_B\\) is ≈ 1 % lower', src: 'Fizz p.129', var: 'K' },
    { text: 'Flat plates (curve A): no buckling while \\(L_f/D_m < 5.2\\) (= Shigley \\(L_0 < 2.63D/\\alpha\\), \\(\\alpha = 0.5\\))', src: 'Fizz p.131 · Mott Fig. 18-15', var: 'curve' },
    { text: 'Coil clearance at \\(L_o\\) > \\(D_w/10\\); hole > OD + \\(D_w/10\\); pitch angle < 12°', src: 'Mott §18-3', step: 'clr' },
    { text: 'Extension loops: \\(R_1 = D_m/2\\), \\(R_2 = 2.5D_w\\) unless drawn; loop torsion ≤ 0.9\\(\\tau_d\\), loop bending ≈ \\(\\tau_d/0.6\\)', src: 'Mott Ex. 18-4', var: 'R2' },
  ],

  figures: [
    { id: 'fig18-5', ref: 'Figure 18-5', title: 'Diameters: OD, \\(D_m\\), ID, \\(D_w\\)', src: 'figures/mott/fig18-5.png', page: 677 },
    { id: 'fig18-6', ref: 'Figure 18-6', title: 'Lengths and forces: \\(L_f\\), \\(L_i\\), \\(L_o\\), \\(L_s\\); \\(F_i\\), \\(F_o\\), \\(F_s\\); coil clearance', src: 'figures/mott/fig18-6.png', page: 678 },
    { id: 'fig18-3', ref: 'Figure 18-3', title: 'End treatments: plain, squared & ground, squared, plain ground', src: 'figures/mott/fig18-3.png', page: 675, note: 'Plain \\(N_a = N\\); plain & ground \\(N - 1\\); squared (& ground) \\(N - 2\\).' },
    { id: 'fig18-7', ref: 'Figure 18-7', title: 'Pitch angle \\(\\lambda = \\tan^{-1}[p/(\\pi D_m)]\\) — keep below ≈ 12°', src: 'figures/mott/fig18-7.png', page: 679 },
    { id: 'table18-2a', ref: 'Table 18-2 (a)', title: 'Wire gauges and diameters — 7/0 to 19 (U.S. Steel Wire, music wire, B&S, metric)', src: 'figures/mott/table18-2a.png', page: 677 },
    { id: 'table18-2b', ref: 'Table 18-2 (b)', title: 'Wire gauges and diameters — 20 to 40', src: 'figures/mott/table18-2b.png', page: 678 },
    { id: 'table18-4', ref: 'Table 18-4', title: 'Shear modulus G and tension modulus E of spring wires', src: 'figures/mott/table18-4.png', page: 685 },
    { id: 'fig18-8', ref: 'Figure 18-8', title: 'Design shear stresses — ASTM A227 hard-drawn', src: 'figures/mott/fig18-8.png', page: 681, note: 'Light = max allowable (solid check); average = normal design; severe = > \\(10^6\\) cycles / shock.' },
    { id: 'fig18-9', ref: 'Figure 18-9', title: 'Design shear stresses — ASTM A228 music wire', src: 'figures/mott/fig18-9.png', page: 682 },
    { id: 'fig18-10', ref: 'Figure 18-10', title: 'Design shear stresses — ASTM A229 oil-tempered', src: 'figures/mott/fig18-10.png', page: 682 },
    { id: 'fig18-11', ref: 'Figure 18-11', title: 'Design shear stresses — ASTM A231 chromium-vanadium', src: 'figures/mott/fig18-11.png', page: 682 },
    { id: 'fig18-12', ref: 'Figure 18-12', title: 'Design shear stresses — ASTM A401 chromium-silicon', src: 'figures/mott/fig18-12.png', page: 683 },
    { id: 'fig18-13', ref: 'Figure 18-13', title: 'Design shear stresses — ASTM A313 stainless (302; ×0.95 for 304, ×0.85 for 316)', src: 'figures/mott/fig18-13.png', page: 683 },
    { id: 'fig18-14', ref: 'Figure 18-14', title: 'Wahl factor K vs spring index C', src: 'figures/mott/fig18-14.png', page: 684 },
    { id: 'fig18-19', ref: 'Figure 18-19 / 18-20', title: 'Extension spring: body \\(D_w(N_a+1)\\), hook lengths; load–deflection curve with initial force \\(F_I\\)', src: 'figures/mott/fig18-19-20.png', page: 696 },
    { id: 'fig18-21', ref: 'Figure 18-21', title: 'Recommended initial-tension stress vs spring index C', src: 'figures/mott/fig18-21.png', page: 696, note: 'Auto estimate = Shigley Eq. 10-41.' },
    { id: 'fig18-22', ref: 'Figure 18-22', title: 'End-loop stresses: bending at A (\\(R_1\\)), torsion at B (\\(R_2\\))', src: 'figures/mott/fig18-22.png', page: 696 },
    { id: 'fig18-15', ref: 'Figure 18-15', title: 'Buckling: critical \\(f_o/L_f\\) vs \\(L_f/D_m\\) for end conditions A, B, C', src: 'figures/mott/fig18-15.png', page: 685, note: 'A: fixed (flat plates); B: fixed–pinned; C: pinned–pinned. Curve A: no buckling for \\(L_f/D_m < 5.2\\).' },
  ],

  sections: [
    { title: 'Inputs', steps: [
      { id: 'in', title: 'Mode, forces and lengths', fig: ['fig18-6'], eq: '18-1',
        formula: 'k = \\frac{F_o - F_i}{L_i - L_o} \\qquad L_f = L_i + \\frac{F_i}{k}',
        text: 'Spring rate k = change in force ÷ change in length. Design: \\(F_o\\) at \\(L_o\\) and a second point (\\(F_i\\) at \\(L_i\\)); if only \\(L_f\\) is known set \\(F_i = 0\\), \\(L_i = L_f\\).',
        vars: [
          { id: 'units', label: 'Unit system', kind: 'choice', type: 'text', options: [{ label: 'US: lb, in, psi', value: 'US' }, { label: 'SI: N, mm, MPa', value: 'SI' }], default: 'US' },
          { id: 'mode', label: 'Mode', kind: 'choice', type: 'text', options: [{ label: 'Design a compression spring (Example 18-2)', value: 'design' }, { label: 'Analyse a given compression spring (Example 18-1)', value: 'analyse' }, { label: 'Design an extension spring (18-7, Example 18-4)', value: 'ext' }], default: 'design' },
          { id: 'Fo', symbol: 'F_o', label: 'Operating force', unit: 'lb / N', kind: 'input' },
          { id: 'Lo', symbol: 'L_o', label: 'Operating length', unit: 'in / mm', kind: 'input', hint: 'extension: the longer, pulled length' },
          { id: 'Fi', symbol: 'F_i', label: 'Installed force (0 if \\(L_f\\) known)', unit: 'lb / N', kind: 'input', default: 0 },
          { id: 'Li', symbol: 'L_i', label: 'Installed length (= \\(L_f\\) if \\(F_i = 0\\))', unit: 'in / mm', kind: 'input' },
        ] },
      { id: 'ina', title: 'Given spring (analysis) or required OD (extension)', fig: ['fig18-5'], when: v => v.mode !== 'design',
        vars: [
          { id: 'Lfg', symbol: 'L_f', label: 'Free length (analysis)', unit: 'in / mm', kind: 'input' },
          { id: 'ODg', symbol: 'OD', label: 'Outside diameter (analysis; extension: required OD)', unit: 'in / mm', kind: 'input' },
          { id: 'Ng', symbol: 'N', label: 'Total coils (analysis)', kind: 'input' },
        ] },
      { id: 'mat', title: 'Material, service and end type', fig: ['table18-4', 'fig18-3'],
        vars: [
          { id: 'mat', label: 'Wire material', kind: 'choice', type: 'text', options: Object.keys(MOTT_G).map(k => ({ label: MOTT_G[k][0], value: k })), default: 'A231' },
          { id: 'G', symbol: 'G', label: 'Shear modulus', unit: 'psi / MPa', kind: 'lookup', fig: 'table18-4', auto: v => MOTT_G[v.mat] ? (SIu(v) ? MOTT_G[v.mat][2] * 1000 : MOTT_G[v.mat][1]) : undefined, hint: 'Table 18-4' },
          { id: 'service', label: 'Service class (design-stress curve)', kind: 'choice', type: 'text', options: [{ label: 'Light — static / < \\(10^4\\) cycles', value: 'light' }, { label: 'Average — up to \\(10^6\\) cycles', value: 'avg' }, { label: 'Severe — > \\(10^6\\) cycles or shock', value: 'severe' }], default: 'avg' },
          { id: 'ends', label: 'End type', kind: 'choice', type: 'text', options: [{ label: 'Squared and ground (\\(N_a = N - 2\\))', value: 'sg' }, { label: 'Squared / closed (\\(N_a = N - 2\\))', value: 'sq' }, { label: 'Plain and ground (\\(N_a = N - 1\\))', value: 'pg' }, { label: 'Plain (\\(N_a = N\\))', value: 'plain' }], default: 'sg' },
        ] },
    ] },

    { title: 'Rate, free length and trial wire size (design)', steps: [
      { id: 'rate', title: 'Spring rate and free length', eq: '18-1a', fig: ['fig18-6'],
        vars: [
          { id: 'k', symbol: 'k', label: 'Spring rate', unit: 'lb/in / N/mm', kind: 'calc', digits: 4, compute: v => {
              if (v.mode === 'analyse') return (H.has(v, 'Fo', 'fo') && v.fo > 0) ? v.Fo / v.fo : undefined;
              if (v.mode === 'ext') return (H.has(v, 'Fo', 'Fi', 'Li', 'Lo') && v.Lo !== v.Li) ? (v.Fo - v.Fi) / (v.Lo - v.Li) : undefined;
              return (H.has(v, 'Fo', 'Fi', 'Li', 'Lo') && v.Li !== v.Lo) ? (v.Fo - v.Fi) / (v.Li - v.Lo) : undefined; },
            work: v => (v.mode !== 'analyse' && H.has(v, 'k', 'Fo', 'Fi', 'Li', 'Lo')) ? (v.mode === 'ext' ? '\\(k = \\dfrac{' + TX(v.Fo) + ' - ' + TX(v.Fi) + '}{' + TX(v.Lo) + ' - ' + TX(v.Li) + '} = ' + TX(v.k, 4) + '\\)' : '\\(k = \\dfrac{' + TX(v.Fo) + ' - ' + TX(v.Fi) + '}{' + TX(v.Li) + ' - ' + TX(v.Lo) + '} = ' + TX(v.k, 4) + '\\)') : (v.mode === 'analyse' && H.has(v, 'k') ? '\\(k = F_o/f_o = ' + TX(v.Fo) + '/' + TX(v.fo, 4) + ' = ' + TX(v.k, 4) + '\\)' : null) },
          { id: 'Lf', symbol: 'L_f', label: 'Free length', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => v.mode === 'analyse' ? v.Lfg : (v.mode === 'ext' ? (H.has(v, 'Lfx') ? v.Lfx : v.Lfcalc) : (H.has(v, 'Li', 'Fi', 'k') && v.k > 0 ? v.Li + v.Fi / v.k : undefined)), hint: 'extension: from the body-length step',
            work: v => (v.mode === 'design' && H.has(v, 'Lf', 'Li', 'Fi', 'k')) ? '\\(L_f = ' + TX(v.Li) + ' + ' + TX(v.Fi) + '/' + TX(v.k, 4) + ' = ' + TX(v.Lf, 4) + '\\)' : null },
        ] },
      { id: 'trial', title: 'Trial mean diameter, design stress and trial wire diameter', eq: '18-7', fig: ['fig18-5', 'fig18-8', 'fig18-9', 'fig18-10', 'fig18-11', 'fig18-12', 'fig18-13'],
        formula: 'D_w = \\left[\\frac{8 K F_o D_m}{\\pi\\tau_d}\\right]^{1/3} \\approx \\left[\\frac{3.06\\,F_o D_m}{\\tau_d}\\right]^{1/3}\\ (K \\approx 1.2)',
        text: 'Choose \\(D_m\\) to fit the space; guess \\(\\tau_d\\) from the chart. Method 2 (Ex. 18-3): \\(D_w = \\sqrt{8(1.2)(7)F_o/(\\pi\\tau_d)}\\) with C = 7.',
        vars: [
          { id: 'Dmt', symbol: 'D_m', label: 'Trial mean diameter', unit: 'in / mm', kind: 'input' },
          { id: 'tdi', symbol: '\\tau_{d,i}', label: 'Initial design-stress estimate', unit: 'psi / MPa', kind: 'lookup', fig: 'fig18-11', hint: 'service curve for the material' },
          { id: 'Dwt', symbol: 'D_{w,t}', label: 'Trial wire diameter (Eq. 18-7)', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'Fo', 'Dmt', 'tdi') && v.tdi > 0 ? Math.pow(8 * 1.2 * v.Fo * v.Dmt / (Math.PI * v.tdi), 1 / 3) : undefined,
            work: v => H.has(v, 'Dwt') ? '\\(D_w = \\left[\\dfrac{3.06(' + TX(v.Fo) + ')(' + TX(v.Dmt) + ')}{' + TX(v.tdi) + '}\\right]^{1/3} = ' + TX(v.Dwt, 4) + '\\)' : null },
          { id: 'Dwt2', symbol: 'D_{w,t}^{(C=7)}', label: 'Trial wire diameter, Method 2 (C = 7)', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'Fo', 'tdi') && v.tdi > 0 ? Math.sqrt(8 * 1.2 * 7 * v.Fo / (Math.PI * v.tdi)) : undefined },
        ],
        when: v => v.mode !== 'analyse' },
    ] },

    { title: 'Standard wire and allowable stresses', steps: [
      { id: 'wire', title: 'Standard wire diameter and chart stresses', fig: ['table18-2a', 'table18-2b', 'fig18-8', 'fig18-9', 'fig18-10', 'fig18-11', 'fig18-12', 'fig18-13'],
        text: 'Take the next larger standard wire (table below), then re-read the chart at that size: \\(\\tau_d\\) from the service curve, \\(\\tau_{max}\\) from the light-service curve.',
        vars: [
          { id: 'Dw', symbol: 'D_w', label: 'Wire diameter (standard)', unit: 'in / mm', kind: 'lookup', fig: 'table18-2a', hint: 'Table 18-2 (Ex. 18-4: 0.072 in = 15 ga)', check: v => (v.mode !== 'analyse' && H.has(v, 'Dw', 'Dwt') && v.Dw < v.Dwt) ? 'Smaller than the trial size — stress will exceed \\(\\tau_d\\)' : null },
          { id: 'td', symbol: '\\tau_d', label: 'Design stress at \\(D_w\\) (service curve)', unit: 'psi / MPa', kind: 'lookup', fig: 'fig18-11', hint: 'e.g. A231, 0.0625 in: ≈ 145 ksi' },
          { id: 'tmax', symbol: '\\tau_{max}', label: 'Max allowable stress at \\(D_w\\) (light service)', unit: 'psi / MPa', kind: 'lookup', fig: 'fig18-11', hint: 'e.g. A231, 0.0625 in: ≈ 170 ksi' },
        ],
        after: v => wireTable(v) },
    ] },

    { title: 'Geometry, index, stress', steps: [
      { id: 'geo', title: 'Diameters, spring index, Wahl factor', eq: '18-5', fig: ['fig18-5', 'fig18-14'],
        formula: 'C = \\frac{D_m}{D_w} \\qquad K = \\frac{4C-1}{4C-4} + \\frac{0.615}{C}',
        text: 'C = coil diameter ÷ wire diameter. The wire carries direct + torsional shear; K adds both and the curvature effect (inside of the coil is most stressed).',
        vars: [
          { id: 'Dm', symbol: 'D_m', label: 'Mean diameter', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => (v.mode === 'analyse' || (v.mode === 'ext' && H.has(v, 'ODg'))) ? (H.has(v, 'ODg', 'Dw') ? v.ODg - v.Dw : undefined) : v.Dmt },
          { id: 'OD', symbol: 'OD', label: 'Outside diameter', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'Dm', 'Dw') ? v.Dm + v.Dw : undefined },
          { id: 'ID', symbol: 'ID', label: 'Inside diameter', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'Dm', 'Dw') ? v.Dm - v.Dw : undefined },
          { id: 'C', symbol: 'C', label: 'Spring index', kind: 'calc', digits: 4, compute: v => H.has(v, 'Dm', 'Dw') && v.Dw > 0 ? v.Dm / v.Dw : undefined, check: v => (v.C !== undefined && v.C < 5) ? 'Mott: C ≥ 5 (forming cracks below 5)' : (v.C > 12 ? 'C > 12 — springs tangle' : null) },
          { id: 'K', symbol: 'K', label: 'Wahl factor', kind: 'calc', digits: 4, compute: v => H.has(v, 'C') && v.C > 1 ? (4 * v.C - 1) / (4 * v.C - 4) + 0.615 / v.C : undefined,
            work: v => H.has(v, 'K') ? '\\(K = \\dfrac{4(' + TX(v.C, 4) + ') - 1}{4(' + TX(v.C, 4) + ') - 4} + \\dfrac{0.615}{' + TX(v.C, 4) + '} = ' + TX(v.K, 4) + '\\)' : null },
        ] },
      { id: 'stress', title: 'Stress at the operating force', eq: '18-4', formula: '\\tau_o = \\frac{8 K F_o D_m}{\\pi D_w^3} = \\frac{8 K F_o C}{\\pi D_w^2}',
        vars: [
          { id: 'tauo', symbol: '\\tau_o', label: 'Operating shear stress', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'K', 'Fo', 'Dm', 'Dw') ? 8 * v.K * v.Fo * v.Dm / (Math.PI * Math.pow(v.Dw, 3)) : undefined,
            work: v => H.has(v, 'tauo') ? '\\(\\tau_o = \\dfrac{8(' + TX(v.K, 4) + ')(' + TX(v.Fo) + ')(' + TX(v.Dm, 4) + ')}{\\pi(' + TX(v.Dw) + ')^3} = ' + TX(v.tauo, 5) + '\\)' : null },
          { id: 'nso', symbol: '\\tau_d/\\tau_o', label: 'Margin against the design stress', kind: 'calc', digits: 3, compute: v => H.has(v, 'td', 'tauo') && v.tauo > 0 ? v.td / v.tauo : undefined },
        ],
        after: v => H.has(v, 'td', 'tauo') ? (v.tauo <= v.td ? '<span class="result-ok">\\(\\tau_o = ' + TX(v.tauo, 5) + ' \\le \\tau_d = ' + TX(v.td) + '\\) — safe at the operating load.</span>' : '<span class="result-bad">\\(\\tau_o = ' + TX(v.tauo, 5) + ' > \\tau_d = ' + TX(v.td) + '\\) — larger \\(D_w\\) or smaller \\(D_m\\).</span>') : '' },
    ] },

    { title: 'Coils, lengths, solid-height check', steps: [
      { id: 'coils', title: 'Number of coils and deflection', eq: '18-6, 18-8', fig: ['fig18-3'],
        formula: 'N_a = \\frac{G D_w}{8 k C^3}\\ (\\text{design}) \\qquad f_o = \\frac{8 F_o C^3 N_a}{G D_w}\\ (\\text{analysis})',
        vars: [
          { id: 'Na', symbol: 'N_a', label: 'Active coils', kind: 'calc', digits: 4, compute: v => {
              if (v.mode === 'analyse') return H.has(v, 'Ng') ? v.Ng - NE[v.ends] : undefined;
              return H.has(v, 'G', 'Dw', 'k', 'C') && v.k > 0 ? v.G * v.Dw / (8 * v.k * Math.pow(v.C, 3)) : undefined; },
            work: v => (v.mode !== 'analyse' && H.has(v, 'Na')) ? '\\(N_a = \\dfrac{' + TX(v.G, 4) + '(' + TX(v.Dw) + ')}{8(' + TX(v.k, 4) + ')(' + TX(v.C, 4) + ')^3} = ' + TX(v.Na, 4) + '\\)' : null,
            check: v => (v.Na !== undefined && v.Na < 3) ? 'Fewer than 3 active coils' : null },
          { id: 'N', symbol: 'N', label: 'Total coils', kind: 'calc', digits: 4, compute: v => v.mode === 'analyse' ? v.Ng : (H.has(v, 'Na') ? v.Na + NE[v.ends] : undefined) },
          { id: 'fo', symbol: 'f_o', label: 'Operating deflection from free length', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => {
              if (v.mode === 'analyse') return H.has(v, 'Fo', 'C', 'Na', 'G', 'Dw') ? 8 * v.Fo * Math.pow(v.C, 3) * v.Na / (v.G * v.Dw) : undefined;
              if (v.mode === 'ext') return H.has(v, 'Lf', 'Lo') ? v.Lo - v.Lf : undefined;
              return H.has(v, 'Lf', 'Lo') ? v.Lf - v.Lo : undefined; },
            work: v => (v.mode === 'analyse' && H.has(v, 'fo')) ? '\\(f_o = \\dfrac{8(' + TX(v.Fo) + ')(' + TX(v.C, 4) + ')^3(' + TX(v.Na, 4) + ')}{' + TX(v.G, 4) + '(' + TX(v.Dw) + ')} = ' + TX(v.fo, 4) + '\\)' : null },
          { id: 'Loa', symbol: 'L_o', label: 'Operating length', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => v.mode === 'analyse' ? (H.has(v, 'Lf', 'fo') ? v.Lf - v.fo : undefined) : v.Lo },
        ] },
      { id: 'solid', title: 'Solid length, force and stress at solid height', when: v => v.mode !== 'ext', formula: 'L_s = D_w N\\ (\\text{ground}) \\;\\text{or}\\; D_w(N+1) \\qquad F_s = k(L_f - L_s) \\qquad \\tau_s = \\tau_o\\frac{F_s}{F_o}',
        text: '\\(\\tau_s\\) must stay below the light-service curve \\(\\tau_{max}\\), or the spring takes a set; \\(n_s = \\tau_{max}/\\tau_s\\).',
        vars: [
          { id: 'Ls', symbol: 'L_s', label: 'Solid length', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'Dw', 'N') ? ((v.ends === 'sg' || v.ends === 'pg') ? v.Dw * v.N : v.Dw * (v.N + 1)) : undefined },
          { id: 'Fs', symbol: 'F_s', label: 'Force at solid length', unit: 'lb / N', kind: 'calc', digits: 4, compute: v => H.has(v, 'k', 'Lf', 'Ls') ? v.k * (v.Lf - v.Ls) : undefined,
            work: v => H.has(v, 'Fs') ? '\\(F_s = ' + TX(v.k, 4) + '(' + TX(v.Lf, 4) + ' - ' + TX(v.Ls, 4) + ') = ' + TX(v.Fs, 4) + '\\)' : null },
          { id: 'taus', symbol: '\\tau_s', label: 'Stress at solid length', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'tauo', 'Fs', 'Fo') && v.Fo > 0 ? v.tauo * v.Fs / v.Fo : undefined,
            work: v => H.has(v, 'taus') ? '\\(\\tau_s = ' + TX(v.tauo, 5) + '(' + TX(v.Fs, 4) + '/' + TX(v.Fo) + ') = ' + TX(v.taus, 5) + '\\)' : null },
          { id: 'nss', symbol: 'n_s', label: 'Factor of safety at solid \\(\\tau_{max}/\\tau_s\\)', kind: 'calc', digits: 3, compute: v => H.has(v, 'tmax', 'taus') && v.taus > 0 ? v.tmax / v.taus : undefined },
        ],
        after: v => { let s = '';
          if (H.has(v, 'Ls', 'Loa')) s += v.Ls < v.Loa ? '<span class="result-ok">\\(L_s = ' + TX(v.Ls, 4) + ' < L_o = ' + TX(v.Loa, 4) + '\\).</span> ' : '<span class="result-bad">\\(L_s = ' + TX(v.Ls, 4) + ' \\ge L_o = ' + TX(v.Loa, 4) + '\\) — goes solid before the operating length.</span> ';
          if (H.has(v, 'taus', 'tmax')) s += v.taus <= v.tmax ? '<span class="result-ok">\\(\\tau_s = ' + TX(v.taus, 5) + ' \\le \\tau_{max} = ' + TX(v.tmax) + '\\) — no set at solid.</span>' : '<span class="result-bad">\\(\\tau_s = ' + TX(v.taus, 5) + ' > \\tau_{max} = ' + TX(v.tmax) + '\\) — permanent set when solid.</span>';
          return s; } },
    ] },

    { title: 'Buckling, clearances, installation', steps: [
      { id: 'buck', title: 'Buckling check', fig: ['fig18-15'], when: v => v.mode !== 'ext', formula: '\\frac{L_f}{D_m} \\;\\rightarrow\\; \\left(\\frac{f_o}{L_f}\\right)_{cr} \\text{ from Fig. 18-15}',
        text: 'Curve A (flat plates): no buckling if \\(L_f/D_m < 5.2\\). The estimate uses Shigley Eq. 10-10.',
        vars: [
          { id: 'curve', label: 'End condition (Fig. 18-15 curve)', kind: 'choice', options: [{ label: 'A — fixed ends (squared & ground on plates)', value: 0.5 }, { label: 'B — one fixed, one pinned', value: 0.707 }, { label: 'C — both pinned', value: 1 }], default: 0.5 },
          { id: 'LfDm', symbol: 'L_f/D_m', label: 'Slenderness ratio', kind: 'calc', digits: 4, compute: v => H.has(v, 'Lf', 'Dm') && v.Dm > 0 ? v.Lf / v.Dm : undefined },
          { id: 'rcr', symbol: '(f_o/L_f)_{cr}', label: 'Critical deflection ratio', kind: 'lookup', fig: 'fig18-15', hint: 'Fig. 18-15 at \\(L_f/D_m\\)', auto: v => { if (!H.has(v, 'LfDm', 'curve')) return undefined;
              const E = 28.5, G = 11.5; const C1 = E / (2 * (E - G)), C2 = 2 * Math.PI * Math.PI * (E - G) / (2 * G + E); const lam = v.curve * v.LfDm; const t = 1 - C2 / (lam * lam); return t < 0 ? 1 : C1 * (1 - Math.sqrt(t)); } },
          { id: 'ract', symbol: 'f_o/L_f', label: 'Actual deflection ratio at \\(F_o\\)', kind: 'calc', digits: 4, compute: v => H.has(v, 'fo', 'Lf') && v.Lf > 0 ? v.fo / v.Lf : undefined },
        ],
        after: v => H.has(v, 'LfDm') ? ((v.curve === 0.5 && v.LfDm < 5.2) ? '<span class="result-ok">\\(L_f/D_m = ' + TX(v.LfDm, 3) + ' < 5.2\\) — no buckling.</span>' : (H.has(v, 'rcr', 'ract') ? (v.ract < v.rcr ? '<span class="result-ok">\\(f_o/L_f = ' + TX(v.ract, 3) + ' <\\) critical ' + H.fmt(v.rcr, 3) + ' — stable.</span>' : '<span class="result-bad">\\(f_o/L_f = ' + TX(v.ract, 3) + ' \\ge\\) critical ' + H.fmt(v.rcr, 3) + ' — buckles: guide on a rod / in a hole.</span>') : '')) : '' },
      { id: 'clr', title: 'Coil clearance, pitch, pitch angle, hole size', eq: '18-2', fig: ['fig18-7'], when: v => v.mode !== 'ext',
        formula: 'c_c = \\frac{L_o - L_s}{N_a} > \\frac{D_w}{10} \\qquad \\lambda = \\tan^{-1}\\frac{p}{\\pi D_m} < 12^\\circ \\qquad D_{hole} > OD + \\frac{D_w}{10}',
        vars: [
          { id: 'cc', symbol: 'c_c', label: 'Coil clearance at \\(L_o\\)', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'Loa', 'Ls', 'Na') && v.Na > 0 ? (v.Loa - v.Ls) / v.Na : undefined },
          { id: 'ccmin', symbol: 'D_w/10', label: 'Minimum clearance', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'Dw') ? v.Dw / 10 : undefined },
          { id: 'p', symbol: 'p', label: 'Pitch', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'Lf', 'Na', 'Dw') && v.Na > 0 ? ({ sg: (v.Lf - 2 * v.Dw) / v.Na, sq: (v.Lf - 3 * v.Dw) / v.Na, pg: v.Lf / (v.Na + 1), plain: (v.Lf - v.Dw) / v.Na })[v.ends] : undefined },
          { id: 'lam', symbol: '\\lambda', label: 'Pitch angle', unit: '°', kind: 'calc', digits: 3, compute: v => H.has(v, 'p', 'Dm') ? H.deg(Math.atan(v.p / (Math.PI * v.Dm))) : undefined, check: v => v.lam > 12 ? 'Pitch angle > 12°' : null },
          { id: 'Dhmin', symbol: 'D_{hole,min}', label: 'Minimum hole diameter', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'OD', 'Dw') ? v.OD + v.Dw / 10 : undefined },
          { id: 'Dhole', symbol: 'D_{hole}', label: 'Available hole diameter (if any)', unit: 'in / mm', kind: 'input' },
        ],
        after: v => { let s = '';
          if (H.has(v, 'cc', 'ccmin')) s += v.cc > v.ccmin ? '<span class="result-ok">Coil clearance OK.</span> ' : '<span class="result-bad">Coil clearance ' + H.fmt(v.cc, 4) + ' ≤ \\(D_w/10\\) — too tight.</span> ';
          if (H.has(v, 'Dhole', 'Dhmin')) s += v.Dhole >= v.Dhmin ? '<span class="result-ok">Fits the hole.</span>' : '<span class="result-bad">Hole ' + H.fmt(v.Dhole) + ' < required ' + H.fmt(v.Dhmin, 4) + '.</span>';
          return s; } },
    ] },

    { title: 'Extension springs (Mott 18-7, Example 18-4)', steps: [
      { id: 'xlen', title: 'Body length, end loops and free length', fig: ['fig18-19'], when: v => v.mode === 'ext',
        formula: 'L_{body} = D_w(N_a + 1) \\qquad L_f = L_{body} + 2\\,L_{end}',
        text: 'All coils are active. A full loop adds one ID per end; if \\(F_I\\) comes out negative, enter a longer chosen \\(L_f\\) (Ex. 18-4: 2.21 → 2.50 in).',
        vars: [
          { id: 'Lbody', symbol: 'L_{body}', label: 'Body length', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'Dw', 'Na') ? v.Dw * (v.Na + 1) : undefined },
          { id: 'Lend', symbol: 'L_{end}', label: 'Length added per end loop', unit: 'in / mm', kind: 'input', auto: v => H.has(v, 'ID') ? v.ID : undefined, hint: 'auto = ID (full loop)' },
          { id: 'Lfcalc', symbol: 'L_{f,calc}', label: 'Free length with these ends', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'Lbody', 'Lend') ? v.Lbody + 2 * v.Lend : undefined },
          { id: 'Lfx', symbol: 'L_{f,chosen}', label: 'Chosen free length (overrides)', unit: 'in / mm', kind: 'input', check: v => (H.has(v, 'Lfx', 'Lo') && v.Lfx >= v.Lo) ? 'Free length must be shorter than the operating length' : null },
        ] },
      { id: 'xinit', title: 'Initial force and initial-tension stress', fig: ['fig18-19', 'fig18-21'], when: v => v.mode === 'ext',
        formula: 'F_I = F_o - k f_o \\qquad \\tau_I = \\tau_o\\frac{F_I}{F_o}',
        text: '\\(F_I\\) is the force at which the coils start to separate (typically 10–25 % of the maximum force); compare \\(\\tau_I\\) with Fig. 18-21.',
        vars: [
          { id: 'FI', symbol: 'F_I', label: 'Initial force', unit: 'lb / N', kind: 'calc', digits: 4, compute: v => H.has(v, 'Fo', 'k', 'fo') ? v.Fo - v.k * v.fo : undefined,
            check: v => (v.FI !== undefined && v.FI < 0) ? 'Negative initial force — free length too short' : null },
          { id: 'tauI', symbol: '\\tau_I', label: 'Initial-tension stress', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => (H.has(v, 'tauo', 'FI', 'Fo') && v.Fo > 0) ? v.tauo * v.FI / v.Fo : undefined },
          { id: 'tIlo', symbol: '\\tau_{I,min}', label: 'Preferred range, lower', unit: 'psi / MPa', kind: 'lookup', fig: 'fig18-21', auto: v => H.has(v, 'C') ? (33500 / Math.exp(0.105 * v.C) - 1000 * (4 - (v.C - 3) / 6.5)) * (SIu(v) ? 0.006895 : 1) : undefined },
          { id: 'tIhi', symbol: '\\tau_{I,max}', label: 'Preferred range, upper', unit: 'psi / MPa', kind: 'lookup', fig: 'fig18-21', auto: v => H.has(v, 'C') ? (33500 / Math.exp(0.105 * v.C) + 1000 * (4 - (v.C - 3) / 6.5)) * (SIu(v) ? 0.006895 : 1) : undefined },
        ],
        after: v => H.has(v, 'tauI', 'tIlo', 'tIhi') ? ((v.tauI >= v.tIlo && v.tauI <= v.tIhi) ? '<span class="result-ok">\\(\\tau_I\\) inside the preferred range.</span>' : '<span class="result-bad">\\(\\tau_I\\) outside the preferred range — adjust \\(L_f\\) or the ends.</span>') : '' },
      { id: 'xhookA', title: 'End loop: bending stress at A', eq: '18-13, 18-14', fig: ['fig18-22'], when: v => v.mode === 'ext',
        formula: '\\sigma_A = \\frac{16 D_m F_o K_1}{\\pi D_w^3} + \\frac{4F_o}{\\pi D_w^2} \\qquad K_1 = \\frac{4C_1^2 - C_1 - 1}{4C_1(C_1 - 1)},\\; C_1 = \\frac{2R_1}{D_w}',
        vars: [
          { id: 'R1', symbol: 'R_1', label: 'Loop mean radius (bending)', unit: 'in / mm', kind: 'input', auto: v => H.has(v, 'Dm') ? v.Dm / 2 : undefined, hint: 'auto = \\(D_m/2\\)' },
          { id: 'C1', symbol: 'C_1', label: 'Loop index \\(2R_1/D_w\\)', kind: 'calc', digits: 4, compute: v => H.has(v, 'R1', 'Dw') ? 2 * v.R1 / v.Dw : undefined },
          { id: 'K1', symbol: 'K_1', label: 'Bending curvature factor', kind: 'calc', digits: 4, compute: v => (H.has(v, 'C1') && v.C1 > 1) ? (4 * v.C1 * v.C1 - v.C1 - 1) / (4 * v.C1 * (v.C1 - 1)) : undefined },
          { id: 'sigA', symbol: '\\sigma_A', label: 'Bending stress at A', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'Dm', 'Fo', 'K1', 'Dw') ? 16 * v.Dm * v.Fo * v.K1 / (Math.PI * Math.pow(v.Dw, 3)) + 4 * v.Fo / (Math.PI * v.Dw * v.Dw) : undefined },
          { id: 'sbA', symbol: '\\sigma_{d,bend}', label: 'Allowable bending stress', unit: 'psi / MPa', kind: 'lookup', fig: 'fig18-22', auto: v => H.has(v, 'td') ? v.td / 0.6 : undefined, hint: 'auto ≈ \\(\\tau_d/0.6\\)' },
        ] },
      { id: 'xhookB', title: 'End loop: torsional stress at B', eq: '18-15, 18-16', fig: ['fig18-22'], when: v => v.mode === 'ext',
        formula: '\\tau_B = \\frac{8 D_m F_o K_2}{\\pi D_w^3} \\qquad K_2 = \\frac{4C_2 - 1}{4C_2 - 4},\\; C_2 = \\frac{2R_2}{D_w}',
        vars: [
          { id: 'R2', symbol: 'R_2', label: 'Loop bend radius (torsion)', unit: 'in / mm', kind: 'input', auto: v => H.has(v, 'Dw') ? 2.5 * v.Dw : undefined, hint: 'auto = \\(2.5D_w\\) (\\(C_2 = 5\\))' },
          { id: 'C2', symbol: 'C_2', label: 'Bend index \\(2R_2/D_w\\)', kind: 'calc', digits: 4, compute: v => H.has(v, 'R2', 'Dw') ? 2 * v.R2 / v.Dw : undefined },
          { id: 'K2', symbol: 'K_2', label: 'Torsion curvature factor', kind: 'calc', digits: 4, compute: v => (H.has(v, 'C2') && v.C2 > 1) ? (4 * v.C2 - 1) / (4 * v.C2 - 4) : undefined },
          { id: 'tauB', symbol: '\\tau_B', label: 'Torsional stress at B', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'Dm', 'Fo', 'K2', 'Dw') ? 8 * v.Dm * v.Fo * v.K2 / (Math.PI * Math.pow(v.Dw, 3)) : undefined },
          { id: 'tdB', symbol: '0.9\\tau_d', label: 'Allowable for the loop', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'td') ? 0.9 * v.td : undefined },
        ] },
    ] },

    { title: 'Result', steps: [
      { id: 'result', title: 'Overall verdict', vars: [],
        after: v => {
          const name = MOTT_G[v.mat] ? MOTT_G[v.mat][0].split(' (')[0] : '';
          if (v.mode === 'ext') {
            if (!H.has(v, 'tauo', 'td', 'FI')) return '<span>Complete the extension-spring steps.</span>';
            const rows = [['\\(\\tau_o \\le \\tau_d\\)', v.tauo <= 1.01 * v.td], ['\\(F_I > 0\\)', v.FI > 0], ['\\(\\tau_I\\) in band', H.has(v, 'tauI', 'tIlo', 'tIhi') && v.tauI >= v.tIlo && v.tauI <= v.tIhi], ['loop \\(\\sigma_A\\)', !H.has(v, 'sigA', 'sbA') || v.sigA <= v.sbA], ['loop \\(\\tau_B\\)', !H.has(v, 'tauB', 'tdB') || v.tauB <= v.tdB]];
            const ok = rows.every(r => r[1]);
            return rows.map(r => r[0] + ' ' + ck(r[1])).join(' · ') + '<br>' + (ok ? '<span class="result-ok"><b>PASS</b> — ' : '<span class="result-bad"><b>FAIL</b> — ') + name + ' extension spring: \\(D_w\\) = ' + H.fmt(v.Dw) + ', \\(D_m\\) = ' + H.fmt(v.Dm, 4) + ', \\(N_a\\) = ' + H.fmt(v.Na, 4) + ', \\(L_f\\) = ' + H.fmt(v.Lf, 4) + ', \\(F_I\\) = ' + H.fmt(v.FI, 4) + '.</span>';
          }
          if (!H.has(v, 'tauo', 'td', 'taus', 'tmax', 'Ls', 'Loa')) return '<span>Complete the stress and solid-height steps.</span>';
          const buck = H.has(v, 'LfDm') ? ((v.curve === 0.5 && v.LfDm < 5.2) || (H.has(v, 'rcr', 'ract') && v.ract < v.rcr)) : true;
          const rows = [['\\(\\tau_o \\le \\tau_d\\)', v.tauo <= 1.01 * v.td], ['\\(\\tau_s \\le \\tau_{max}\\)', v.taus <= v.tmax], ['\\(L_s < L_o\\)', v.Ls < v.Loa], ['no buckling', buck], ['clearance', !H.has(v, 'cc', 'ccmin') || v.cc > v.ccmin], ['fits hole', !H.has(v, 'Dhole', 'Dhmin') || v.Dhole >= v.Dhmin]];
          const ok = rows.every(r => r[1]);
          return rows.map(r => r[0] + ' ' + ck(r[1])).join(' · ') + '<br>' + (ok ? '<span class="result-ok"><b>PASS</b> — ' : '<span class="result-bad"><b>FAIL</b> — ') + name + ', \\(D_w\\) = ' + H.fmt(v.Dw) + ', \\(D_m\\) = ' + H.fmt(v.Dm, 4) + ' (OD ' + H.fmt(v.OD, 4) + '), \\(N_a\\) = ' + H.fmt(v.Na, 4) + ', N = ' + H.fmt(v.N, 4) + ', \\(L_f\\) = ' + H.fmt(v.Lf, 4) + ', k = ' + H.fmt(v.k, 4) + '.</span>'; } },
    ] },
  ],
};
