/* Boundary-lubricated bearings (bushings) — Shigley 11e, Ch. 12 Sec. 12-15.
 * Procedure: Fizz bible pp. 92-95 (Shigley Ex. 12-10 method). Mech bible unit 4 (PDF p. 129) is empty.
 * Verified against: Shigley Ex. 12-10 (F = 50 lbf, 300 rev/min, nd = 2, Oiles 500): Lmin = 1.34 in, ID 3/4 x OD 1 1/8 x L 1 1/2 (table pick),
 *   Pmax = 113 psi, P = 88.9 psi, V = 58.9 ft/min, PV = 5240, w = 0.000320 in after 800 h -> PASS;
 *   HW4 2023/2024 P2 (Shigley 12-27: 100 lbf, 200 rpm, nd 2, w 0.002 in in 1000 h, D = 1.25 in): L_wear 0.40 in, L_thermal 1.788 in
 *   -> table pick 1 1/4 x 1 5/8 x 2 (L/D 1.6), Pmax 101.9 psi, V 65.4 ft/min, PV 5236 -> PASS;
 *   HW4 2023 P1(b) (0.5 in, 75 lbf, 600 rpm, nd 2, fs 0.04, porous bronze Table 12-8, L = 0.5 in): L_thermal 15.42 in, T_f(L = 0.75) = 1715 F,
 *   T_f(L = 0.5) = 2540 F -> FAIL; Tutorial 2022 Q1 (Shigley 12-22, 9e f1 f2): f1f2 = 1.8, 500 lbf, 200 rpm, 1 x 1 in, w 0.005 in -> 1389 h = 16.7e6 rev;
 *   part b (Oiles 800, 800 lbf, 80 rpm, f1f2 = 2, 1e6 rev) -> w = 2.67e-3 in. */
(function () {
  // Table 12-9 (K, limiting PV) and Table 12-8 (Pmax psi, Tmax F, Vmax fpm, PV) — Table 12-11 for Oiles 500
  const T129 = { 'Oiles 500': [0.6e-10, 46700], 'Oiles 800': [3e-10, 18000], 'Polyactal copolymer': [50e-10, 5000], 'Polyactal homopolymer': [60e-10, 3000], '66 nylon': [200e-10, 2000], '66 nylon + 15% PTFE': [13e-10, 7000], '66 nylon + 15% PTFE + 30% glass': [16e-10, 10000], '66 nylon + 2.5% MoS2': [200e-10, 2000], '6 nylon': [200e-10, 2000], 'Polycarbonate + 15% PTFE': [75e-10, 7000], 'Sintered bronze': [102e-10, 8500], 'Phenol + 25% glass fiber': [8e-10, 11500] };
  const T128 = { 'Cast bronze': [4500, 325, 1500, 50000], 'Porous bronze': [4500, 150, 1500, 50000], 'Porous iron': [8000, 150, 800, 50000], 'Phenolics': [6000, 200, 2500, 15000], 'Nylon': [1000, 200, 1000, 3000], 'Teflon': [500, 500, 100, 1000], 'Reinforced Teflon': [2500, 500, 1000, 10000], 'Teflon fabric': [60000, 500, 50, 25000], 'Delrin': [1000, 180, 1000, 3000], 'Carbon-graphite': [600, 750, 2500, 15000], 'Wood': [2000, 150, 2000, 15000] };
  const lim = (v, i) => v.mat === 'Oiles 500' ? [3560, 300, 100][i] : (T128[v.mat] ? T128[v.mat][i] : undefined);   // 0 Pmax, 1 T, 2 V
  // Table 12-12 stock sizes [ID, OD, [L...]]
  const T1212 = [[0.5, 0.75, [0.5, 0.625, 0.75, 0.875, 1]], [0.625, 0.875, [0.625, 0.75, 1, 1.5]], [0.75, 1.125, [0.625, 0.75, 1, 1.5]], [0.875, 1.25, [0.75, 1, 1.25, 1.5]],
    [1, 1.375, [0.75, 1, 1.25, 1.5, 1.75, 2]], [1, 1.5, [0.75, 1, 1.5, 2]], [1.25, 1.625, [1, 1.25, 1.5, 1.75, 2]], [1.5, 2, [1, 1.25, 1.5, 1.75, 2]],
    [1.75, 2.25, [1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4]], [2, 2.5, [1.5, 2, 2.5, 3]], [2.25, 2.75, [1.5, 2, 2.5, 3]], [2.5, 3, [1.5, 2, 3]], [2.75, 3.375, [1.5, 2, 2.5, 3]],
    [3, 3.625, [2, 2.5, 3, 3.5]], [3.5, 4.125, [2, 3, 4]], [4, 4.75, [2, 3, 4]], [4.5, 5.375, [3, 4, 5]], [5, 6, [3, 4, 5]]];
  const fr = x => { const w = Math.floor(x + 1e-9), f = x - w; if (f < 1e-6) return String(w); const n = Math.round(f * 8); const g = n % 2 ? 8 : n % 4 ? 4 : 2; return (w ? w + ' ' : '') + (n / (8 / g)) + '/' + g; };
  const Tbush = (v, L) => H.has(v, 'Tinf', 'fs', 'nd', 'F', 'N', 'J', 'hCR') && L > 0 ? v.Tinf + 720 * v.fs * v.nd * v.F * v.N / (v.J * v.hCR * L) : undefined;
  function selTable(v) {
    if (!(v.Lmin > 0) || !H.has(v, 'F', 'N', 'nd')) return '';
    let start = 0; if (v.Dj > 0) { start = T1212.findIndex(r => r[0] >= v.Dj - 1e-9); if (start < 0) return '<span class="result-bad">No Table 12-12 bore ≥ the shaft diameter.</span>'; }
    let picked = false;
    const rows = T1212.slice(start, start + 9).map(([ID, OD, Ls]) => {
      const L = Ls.find(x => x >= v.Lmin - 1e-9);
      if (L === undefined) return { cells: [fr(ID) + ' × ' + fr(OD), 'max ' + fr(Ls[Ls.length - 1]), '—', '—', '—', '—', 'too short'], ok: false };
      const LD = L / ID, Pm = 4 / Math.PI * v.nd * v.F / (ID * L), V = Math.PI * ID * v.N / 12, PV = v.nd * v.F / (ID * L) * V;
      const bad = [LD < 0.5 || LD > 2 ? 'L/D' : '', v.Pmaxlim && Pm >= v.Pmaxlim ? 'P_max' : '', v.Vlim && V >= v.Vlim ? 'V' : '', v.PVlim && PV >= v.PVlim ? 'PV' : ''].filter(Boolean);
      const ok = !bad.length, pick = ok && !picked; if (pick) picked = true;
      return { cells: [fr(ID) + ' × ' + fr(OD), fr(L), H.fmt(LD, 3), H.fmt(Pm), H.fmt(V), H.fmt(PV), ok ? 'ok' : bad.join(', ')], ok, pick, set: { ID, OD, L } };
    });
    return H.table(['ID × OD (in)', 'shortest L ≥ L_min', 'L/D', 'P_max (psi)', 'V (ft/min)', 'PV', 'check'], rows, {
      caption: 'Table 12-12 stock bushings for L_min = ' + H.fmt(v.Lmin) + ' in' + (v.Dj > 0 ? ', ID ≥ ' + H.fmt(v.Dj) + ' in' : ''),
      note: 'Pick = smallest ID whose shortest stocked L ≥ L_min keeps 0.5 ≤ L/D ≤ 2 and passes the material limits. Ex. 12-10: ¾ × 1⅛ × 1½ (ID ⅝ rejected, L/D = 2.4); HW4 P2 (12-27, D = 1.25 in): 1¼ × 1⅝ × 2.',
    });
  }

  window.TOPIC = {
    id: 'bushings', book: 'shigley',
    title: 'Bushings — Boundary-Lubricated Bearings',
    subtitle: 'Shigley Ch. 12 Sec. 12-15 · Fizz pp. 92-95 · PV method',
    sibling: 'bushings_mott.html',
    intro: 'Size a dry / boundary-lubricated bushing (Oiles-type) for radial load <i>F</i> at speed <i>N</i>: minimum length from temperature rise (Eq. 12-49) and wear (Eq. 12-43), stock size from Table 12-12, then check <i>P<sub>max</sub></i>, <i>V</i>, <i>PV</i> against the material limits. ' +
      'Shigley Ex. 12-10 is loaded; units lbf, rev/min, in, °F, psi, ft/min.',
    example: { F: 50, N: 300, nd: 2, Tinf: 70, hCR: 2.7, J: 778, mat: 'Oiles 500', fs: 0.03, t: 800, wmax: 0.001, ID: 0.75, OD: 1.125, L: 1.5 },

    assumptions: [
      { text: 'Bushing is Oiles 500 SP unless another material is named: \\(K = 0.6\\times10^{-10}\\), limiting PV = 46 700 psi·ft/min (Table 12-9)', src: 'Fizz p.93 · Fizz p.94', var: 'mat' },
      { text: 'Friction coefficient f_s = 0.03 (Oiles 500SP, Table 12-10)', src: 'Fizz p.93', var: 'fs' },
      { text: '\\(\\hbar_{CR}\\) = 2.7 Btu/(h·ft^2·°F) unless given', src: 'Fizz p.93', step: 'in' },
      { text: 'J = 778 ft·lbf/Btu', src: 'Fizz p.93', var: 'J' },
      { text: 'Ambient \\(T_\\infty\\) = 70 °F if not given', src: 'Fizz p.94', var: 'Tinf' },
      { text: 'T_f = the material temperature limit (300 °F for Oiles 500 SP) when not given', src: 'Fizz p.93 · Shigley Ex. 12-10', var: 'Tf' },
      { text: 'Design factor n_d = 1 when none is given (Ex. 12-10 and the HW use 2); it multiplies F everywhere', src: 'Shigley Ex. 12-10', var: 'nd' },
      { text: 'Wear only checked when a wear limit is given; \\(f_1 f_2 = 1\\) (the 9th-edition motion/environment factors used in the 2022 tutorial)', src: 'Fizz p.95 · Tutorial 2022 Q1', var: 'fw' },
      { text: 'Smallest stock bushing in Table 12-12 with L ≥ L_min and ID ≥ shaft diameter', src: 'Fizz p.94', step: 'sel' },
      { text: 'Keep 0.5 ≤ L/D ≤ 2 (Eq. 12-44; Fizz p.94 prints the inequality reversed)', src: 'Fizz p.94', step: 'ld' },
      { text: 'Oiles 500 SP service limits: P_max < 3560 psi, V < 100 ft/min, PV < 46 700, T < 300 °F (Table 12-11); Table 12-8 for generic materials', src: 'Fizz p.94 · Fizz p.95', var: 'Pmaxlim' },
    ],

    figures: [
      { id: 'fig12-39', ref: 'Figure 12-39', title: 'Sliding block subjected to wear (definition of K)', src: 'figures/shigley/fig12-39.png', page: 693 },
      { id: 'fig12-40', ref: 'Figure 12-40', title: 'Pressure distribution on a boundary-lubricated bushing (P_max vs nominal P)', src: 'figures/shigley/fig12-40.png', page: 694 },
      { id: 'fig12-41', ref: 'Figure 12-41', title: 'Journal/bushing nomenclature (Example 12-9)', src: 'figures/shigley/fig12-41.png', page: 695 },
      { id: 't12-8', ref: 'Table 12-8', title: 'Generic bushing materials: maximum load (psi), temperature (°F), speed (fpm), PV', src: 'figures/shigley/table12-8.png', page: 692,
        note: 'Use for cast/porous bronze, nylon, Teflon … (HW4 P1b: porous bronze, 150 °F). Oiles 500 SP: Table 12-11.' },
      { id: 't12-9', ref: 'Table 12-9', title: 'Wear factors K and limiting PV (Oiles materials)', src: 'figures/shigley/table12-9.png', page: 693,
        note: 'K in in^3·min/(lbf·ft·h); PV in psi·ft/min.' },
      { id: 't12-10', ref: 'Table 12-10', title: 'Coefficients of friction f_s by bearing type', src: 'figures/shigley/table12-10.png', page: 693, note: 'Oiles 500SP: f_s = 0.03.' },
      { id: 't12-11', ref: 'Table 12-11', title: 'Oiles 500 SP service range: P_max < 3560 psi, V < 100 ft/min, PV < 46 700, T < 300 °F', src: 'figures/shigley/table12-11.png', page: 695 },
      { id: 'oiles-sp', ref: 'OILES 500SP1 data (catalogue p.94)', book: 'course', title: 'OILES 500SP1 service range and mechanical properties (dry: P_max 29 N/mm^2, V_max 0.50 m/s, PV 1.65 N/mm^2·m/s)', src: 'figures/course/oiles_500sp1_service_range_properties.png', note: 'Catalogue source of Table 12-11. HW4 P2b converts with 1 kgf/cm^2 = 14.2 psi.' },
      { id: 'oiles-spb', ref: 'OILES SPB 500SP1 bushing sizes (p.95)', book: 'course', title: 'Standard SPB (500SP1-SL1) bushing part numbers: I.D. × O.D. × length (mm)', src: 'figures/course/oiles_500sp1_spb_bushing_sizes.png', note: 'Metric stock sizes; pick L ≥ L_min with I.D. ≥ shaft.' },
      { id: 'oiles-pv', ref: 'OILES PV vs motion and temperature (p.172)', book: 'course', title: 'OILES design notes: allowable PV by motion type, PV vs temperature, mating-shaft hardness', src: 'figures/course/oiles_operating_motion_pv.png' },
      { id: 't12-12', ref: 'Table 12-12', title: 'Available bushing sizes (ID, OD, L in inches) — bullets mark stocked combinations', src: 'figures/shigley/table12-12.png', page: 697 },
    ],

    sections: [
      { title: 'Inputs', steps: [
        { id: 'in', title: 'Problem data', fig: ['fig12-41'],
          text: 'Radial load, journal speed and design factor; temperature data default to the Fizz values. Enter the wear limit and running time only if the question gives them.',
          vars: [
            { id: 'F', symbol: 'F', label: 'Radial load', unit: 'lbf', kind: 'input' },
            { id: 'N', symbol: 'N', label: 'Journal speed', unit: 'rev/min', kind: 'input' },
            { id: 'nd', symbol: 'n_d', label: 'Design factor (multiplies F)', unit: '', kind: 'input', default: 1 },
            { id: 'Tinf', symbol: 'T_\\infty', label: 'Ambient temperature', unit: '°F', kind: 'input', default: 70 },
            { id: 'hCR', symbol: '\\hbar_{CR}', label: 'Combined heat-transfer coefficient', unit: 'Btu/(h·ft^2·°F)', kind: 'input', default: 2.7 },
            { id: 'J', symbol: 'J', label: 'Mechanical equivalent of heat', unit: 'ft·lbf/Btu', kind: 'input', default: 778 },
            { id: 'Dj', symbol: 'D_j', label: 'Shaft (journal) diameter, if given', unit: 'in', kind: 'input', hint: 'bushing ID must be ≥ this' },
            { id: 't', symbol: 't', label: 'Operating time (wear check)', unit: 'h', kind: 'input', hint: 'only if a wear limit is given' },
            { id: 'wmax', symbol: 'w_{max}', label: 'Allowable radial wear', unit: 'in', kind: 'input' },
          ] },
        { id: 'mat', title: 'Material data (Step 1)', fig: ['t12-9', 't12-10', 't12-11', 't12-8', 'oiles-sp', 'oiles-pv'],
          text: 'Pick the material; <i>K</i> and limiting <i>PV</i> come from Table 12-9, the service limits from Table 12-11 (Oiles 500) or Table 12-8 (generic materials).',
          vars: [
            { id: 'mat', label: 'Bushing material', kind: 'choice', type: 'text', default: 'Oiles 500', options: Object.keys(T129).concat(Object.keys(T128)) },
            { id: 'K', symbol: 'K', label: 'Wear factor', unit: 'in^3·min/(lbf·ft·h)', kind: 'lookup', fig: 't12-9', auto: v => T129[v.mat] ? T129[v.mat][0] : undefined, hint: 'Table 12-9 (Oiles); not given for Table 12-8 materials' },
            { id: 'PVlim', symbol: '(PV)_{lim}', label: 'Limiting PV', unit: 'psi·ft/min', kind: 'lookup', fig: 't12-9', auto: v => T129[v.mat] ? T129[v.mat][1] : T128[v.mat] ? T128[v.mat][3] : undefined },
            { id: 'fs', symbol: 'f_s', label: 'Coefficient of friction', unit: '', kind: 'lookup', fig: 't12-10', default: 0.03, hint: 'Oiles 500SP 0.03; Oiles 80 / Cermet 0.05' },
            { id: 'Pmaxlim', symbol: 'P_{max,lim}', label: 'Allowable pressure', unit: 'psi', kind: 'lookup', fig: 't12-11', auto: v => lim(v, 0) },
            { id: 'Vlim', symbol: 'V_{max}', label: 'Allowable velocity', unit: 'ft/min', kind: 'lookup', fig: 't12-11', auto: v => lim(v, 2) },
            { id: 'Tlim', symbol: 'T_{max}', label: 'Allowable temperature', unit: '°F', kind: 'lookup', fig: 't12-11', auto: v => lim(v, 1) },
            { id: 'Tf', symbol: 'T_f', label: 'Design (max.) bushing temperature', unit: '°F', kind: 'input', auto: v => v.Tlim, hint: 'blank → T_max of the material' },
          ],
          after: v => (H.has(v, 'Tf', 'Tlim') && v.Tf > v.Tlim) ? '<span class="result-bad">T_f exceeds the material limit T_max</span>' : '' },
      ] },

      { title: 'Sizing', steps: [
        { id: 'lmin', title: 'Minimum length — temperature rise and wear (Step 2)', eq: '12-49 / 12-43', fig: ['t12-10', 't12-9'],
          formula: 'L_T = \\frac{720\\, f_s\\, n_d F N}{J\\, \\hbar_{CR}\\,(T_f - T_\\infty)} \\qquad L_w = \\frac{f_1 f_2\\,K\\, n_d F N t}{3\\,w_{max}} \\qquad L_{min} = \\max(L_T, L_w)',
          text: 'The larger length governs (HW4 P2: wear 0.40 in, heat 1.788 in). Eq. 12-49 assumes a pillow-block housing with area \\(\\approx 2\\pi DL/144\\) ft^2.',
          vars: [
            { id: 'LT', symbol: 'L_T', label: 'Length for temperature rise', unit: 'in', kind: 'calc', digits: 4,
              compute: v => H.has(v, 'fs', 'nd', 'F', 'N', 'J', 'hCR', 'Tf', 'Tinf') && v.Tf > v.Tinf ? 720 * v.fs * v.nd * v.F * v.N / (v.J * v.hCR * (v.Tf - v.Tinf)) : undefined,
              work: v => v.LT !== undefined ? '\\(L_T = \\dfrac{720(' + H.fmt(v.fs) + ')(' + H.fmt(v.nd) + ')(' + H.fmt(v.F) + ')(' + H.fmt(v.N) + ')}{' + H.fmt(v.J) + '(' + H.fmt(v.hCR) + ')(' + H.fmt(v.Tf) + '-' + H.fmt(v.Tinf) + ')} = ' + H.fmt(v.LT) + '\\text{ in}\\)' : null,
              check: v => (H.has(v, 'Tf', 'Tinf') && v.Tf <= v.Tinf) ? 'T_f must exceed \\(T_\\infty\\)' : null },
            { id: 'fw', symbol: 'f_1 f_2', label: 'Wear-rate factors (9th ed.; 1 in 11e)', unit: '', kind: 'input', default: 1, hint: 'tutorial 2022: f_1 = 1.8 (rotary), f_2 = 1 (clean)' },
            { id: 'Lw', symbol: 'L_w', label: 'Length for the wear limit', unit: 'in', kind: 'calc', digits: 4,
              compute: v => H.has(v, 'fw', 'K', 'nd', 'F', 'N', 't', 'wmax') && v.wmax > 0 ? v.fw * v.K * v.nd * v.F * v.N * v.t / (3 * v.wmax) : undefined,
              work: v => v.Lw !== undefined ? '\\(L_w = \\dfrac{' + H.fmt(v.fw) + '(' + H.fmt(v.K) + ')(' + H.fmt(v.nd) + ')(' + H.fmt(v.F) + ')(' + H.fmt(v.N) + ')(' + H.fmt(v.t) + ')}{3(' + H.fmt(v.wmax) + ')} = ' + H.fmt(v.Lw) + '\\text{ in}\\)' : null },
            { id: 'Lmin', symbol: 'L_{min}', label: 'Minimum length (governing)', unit: 'in', kind: 'calc', digits: 4,
              compute: v => (v.LT === undefined && v.Lw === undefined) ? undefined : Math.max(v.LT || 0, v.Lw || 0) },
          ] },
        { id: 'sel', title: 'Select a stock bushing (Step 3)', fig: ['t12-12', 'oiles-spb'],
          text: 'Pick from the table below (★) or type ID, OD, L from Table 12-12: <i>L</i> ≥ <i>L<sub>min</sub></i>, ID ≥ shaft.',
          vars: [
            { id: 'ID', symbol: 'D', label: 'Bushing inner diameter', unit: 'in', kind: 'lookup', fig: 't12-12',
              check: v => (H.has(v, 'ID', 'Dj') && v.ID < v.Dj) ? 'ID is smaller than the shaft — pick a larger ID' : null },
            { id: 'OD', symbol: 'OD', label: 'Bushing outer diameter', unit: 'in', kind: 'lookup', fig: 't12-12' },
            { id: 'L', symbol: 'L', label: 'Bushing length', unit: 'in', kind: 'lookup', fig: 't12-12',
              check: v => (H.has(v, 'L', 'Lmin') && v.L < v.Lmin - 1e-9) ? 'L < L_min — choose a longer bushing' : null },
          ],
          after: selTable },
        { id: 'ld', title: 'Length-to-diameter ratio (Step 4)', eq: '12-44', formula: '0.5 \\le L/D \\le 2',
          vars: [
            { id: 'LD', symbol: 'L/D', label: 'L/D ratio', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'L', 'ID') && v.ID > 0 ? v.L / v.ID : undefined,
              check: v => (v.LD !== undefined && (v.LD < 0.5 || v.LD > 2)) ? 'Outside 0.5 ≤ L/D ≤ 2 — choose another bushing' : null },
          ] },
      ] },

      { title: 'Verification (Steps 5–10)', steps: [
        { id: 'pmax', title: 'Characteristic (peak) pressure', eq: '12-42', fig: ['fig12-40', 't12-11'],
          formula: 'P_{max} = \\frac{4}{\\pi}\\,\\frac{n_d F}{D L}',
          vars: [
            { id: 'Pmax', symbol: 'P_{max}', label: 'Characteristic pressure', unit: 'psi', kind: 'calc', digits: 4,
              compute: v => H.has(v, 'nd', 'F', 'ID', 'L') && v.ID * v.L > 0 ? 4 / Math.PI * v.nd * v.F / (v.ID * v.L) : undefined,
              work: v => v.Pmax !== undefined ? '\\(P_{max} = \\dfrac{4}{\\pi}\\dfrac{' + H.fmt(v.nd) + '(' + H.fmt(v.F) + ')}{' + H.fmt(v.ID) + '(' + H.fmt(v.L) + ')} = ' + H.fmt(v.Pmax) + '\\text{ psi}\\)' : null },
          ],
          after: v => (v.Pmax === undefined || v.Pmaxlim === undefined) ? '' : v.Pmax < v.Pmaxlim ? '<span class="result-ok">' + H.fmt(v.Pmax) + ' psi &lt; ' + H.fmt(v.Pmaxlim) + ' psi ✔</span>' : '<span class="result-bad">' + H.fmt(v.Pmax) + ' psi ≥ ' + H.fmt(v.Pmaxlim) + ' psi ✘ — larger bushing</span>' },
        { id: 'pnom', title: 'Nominal pressure', eq: '12-39', formula: 'P = \\frac{n_d F}{D L}',
          vars: [
            { id: 'P', symbol: 'P', label: 'Nominal pressure', unit: 'psi', kind: 'calc', digits: 4,
              compute: v => H.has(v, 'nd', 'F', 'ID', 'L') && v.ID * v.L > 0 ? v.nd * v.F / (v.ID * v.L) : undefined },
          ] },
        { id: 'vel', title: 'Surface velocity', eq: '12-40', formula: 'V = \\frac{\\pi D N}{12}', fig: ['t12-11'],
          vars: [
            { id: 'V', symbol: 'V', label: 'Sliding velocity', unit: 'ft/min', kind: 'calc', digits: 4,
              compute: v => H.has(v, 'ID', 'N') ? Math.PI * v.ID * v.N / 12 : undefined,
              work: v => v.V !== undefined ? '\\(V = \\dfrac{\\pi(' + H.fmt(v.ID) + ')(' + H.fmt(v.N) + ')}{12} = ' + H.fmt(v.V) + '\\text{ ft/min}\\)' : null },
          ],
          after: v => (v.V === undefined || v.Vlim === undefined) ? '' : v.V < v.Vlim ? '<span class="result-ok">' + H.fmt(v.V) + ' &lt; ' + H.fmt(v.Vlim) + ' ft/min ✔</span>' : '<span class="result-bad">' + H.fmt(v.V) + ' ≥ ' + H.fmt(v.Vlim) + ' ft/min ✘</span>' },
        { id: 'pv', title: 'PV product', eq: '12-41', formula: 'PV = \\frac{\\pi}{12}\\frac{n_d F N}{L}', fig: ['t12-9', 't12-11'],
          text: 'PV does not depend on <i>D</i>: only a longer bushing lowers it.',
          vars: [
            { id: 'PV', symbol: 'PV', label: 'PV product', unit: 'psi·ft/min', kind: 'calc', digits: 5,
              compute: v => H.has(v, 'P', 'V') ? v.P * v.V : undefined,
              work: v => v.PV !== undefined ? '\\(PV = ' + H.fmt(v.P) + '(' + H.fmt(v.V) + ') = ' + H.fmt(v.PV, 5) + '\\text{ psi·ft/min}\\)' : null },
          ],
          after: v => (v.PV === undefined || v.PVlim === undefined) ? '' : v.PV < v.PVlim ? '<span class="result-ok">' + H.fmt(v.PV, 5) + ' &lt; ' + H.fmt(v.PVlim, 5) + ' ✔</span>' : '<span class="result-bad">' + H.fmt(v.PV, 5) + ' ≥ ' + H.fmt(v.PVlim, 5) + ' ✘ — increase L</span>' },
        { id: 'temp', title: 'Bushing temperature at the chosen length', eq: '12-49', fig: ['t12-8', 't12-11'],
          formula: 'T_f = T_\\infty + \\frac{720\\, f_s\\, n_d F N}{J\\, \\hbar_{CR}\\, L}',
          text: 'Eq. 12-49 solved for <i>T<sub>f</sub></i> — the "is this bushing feasible?" check of HW4 P1b.',
          vars: [
            { id: 'Tact', symbol: 'T_f', label: 'Steady bushing temperature', unit: '°F', kind: 'calc', digits: 4, compute: v => Tbush(v, v.L),
              work: v => v.Tact !== undefined ? '\\(T_f = ' + H.fmt(v.Tinf) + ' + \\dfrac{720(' + H.fmt(v.fs) + ')(' + H.fmt(v.nd) + ')(' + H.fmt(v.F) + ')(' + H.fmt(v.N) + ')}{' + H.fmt(v.J) + '(' + H.fmt(v.hCR) + ')(' + H.fmt(v.L) + ')} = ' + H.fmt(v.Tact) + '\\ ^\\circ\\text{F}\\)' : null },
          ],
          after: v => (v.Tact === undefined || v.Tlim === undefined) ? '' : v.Tact <= v.Tlim ? '<span class="result-ok">' + H.fmt(v.Tact) + ' °F ≤ ' + H.fmt(v.Tlim) + ' °F ✔</span>' : '<span class="result-bad">' + H.fmt(v.Tact) + ' °F &gt; ' + H.fmt(v.Tlim) + ' °F ✘ — lengthen the bushing, reduce load/speed, or use a rolling bearing</span>' },
        { id: 'wear', title: 'Linear wear (only if a wear limit is given)', eq: '12-43', fig: ['fig12-39', 't12-9'],
          formula: 'w = f_1 f_2\\,\\frac{K\\, n_d F N t}{3L} \\qquad t_w = \\frac{3 L\\, w_{max}}{f_1 f_2\\,K n_d F N}',
          vars: [
            { id: 'w', symbol: 'w', label: 'Radial wear', unit: 'in', kind: 'calc', digits: 4,
              compute: v => H.has(v, 'fw', 'K', 'nd', 'F', 'N', 't', 'L') && v.L > 0 ? v.fw * v.K * v.nd * v.F * v.N * v.t / (3 * v.L) : undefined,
              work: v => v.w !== undefined ? '\\(w = \\dfrac{' + H.fmt(v.fw) + '(' + H.fmt(v.K) + ')(' + H.fmt(v.nd) + ')(' + H.fmt(v.F) + ')(' + H.fmt(v.N) + ')(' + H.fmt(v.t) + ')}{3(' + H.fmt(v.L) + ')} = ' + H.fmt(v.w) + '\\text{ in}\\)' : null },
            { id: 'tlife', symbol: 't_w', label: 'Hours to reach w_max', unit: 'h', kind: 'calc', digits: 4,
              compute: v => H.has(v, 'fw', 'K', 'nd', 'F', 'N', 'wmax', 'L') && v.K * v.F * v.N > 0 ? 3 * v.L * v.wmax / (v.fw * v.K * v.nd * v.F * v.N) : undefined },
            { id: 'revw', symbol: 'N t_w', label: 'Revolutions to reach w_max', unit: 'rev', kind: 'calc', digits: 4, compute: v => v.tlife !== undefined ? v.tlife * 60 * v.N : undefined },
          ],
          after: v => (v.w === undefined || v.wmax === undefined) ? '' : v.w < v.wmax ? '<span class="result-ok">w = ' + H.fmt(v.w) + ' in &lt; ' + H.fmt(v.wmax) + ' in ✔</span>' : '<span class="result-bad">w = ' + H.fmt(v.w) + ' in ≥ ' + H.fmt(v.wmax) + ' in ✘ — increase L or use a lower-K material</span>' },
      ] },

      { title: 'Result', steps: [
        { id: 'res', title: 'Summary (Step 11)', fig: ['t12-12'],
          vars: [
            { id: 'ok', label: 'All checks', kind: 'calc', compute: v => {
              if (!H.has(v, 'Pmax', 'V', 'PV', 'LD')) return undefined;
              const bad = [];
              if (v.Lmin !== undefined && v.L < v.Lmin - 1e-9) bad.push('L < L_min');
              if (v.LD < 0.5 || v.LD > 2) bad.push('L/D');
              if (v.Pmaxlim !== undefined && v.Pmax >= v.Pmaxlim) bad.push('P_max');
              if (v.Vlim !== undefined && v.V >= v.Vlim) bad.push('V');
              if (v.PVlim !== undefined && v.PV >= v.PVlim) bad.push('PV');
              if (v.Tact !== undefined && v.Tlim !== undefined && v.Tact > v.Tlim) bad.push('temperature');
              if (v.w !== undefined && v.wmax !== undefined && v.w >= v.wmax) bad.push('wear');
              if (H.has(v, 'Dj') && v.ID < v.Dj) bad.push('ID < shaft');
              return bad.length ? 'FAIL: ' + bad.join(', ') : 'PASS';
            } },
          ],
          after: v => v.ok === undefined ? '' : v.ok === 'PASS'
            ? '<span class="result-ok">Acceptable bushing: ' + fr(v.ID) + ' × ' + (v.OD !== undefined ? fr(v.OD) : '?') + ' × ' + fr(v.L) + ' in (' + (v.mat || '') + ').</span>'
            : '<span class="result-bad">' + v.ok + ' — pick a larger / longer bushing or another material.</span>' },
      ] },
    ],
  };
})();
