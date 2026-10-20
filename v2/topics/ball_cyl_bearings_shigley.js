/* Ball & cylindrical roller bearings — Shigley 11e Ch. 11 (Secs 11-3 .. 11-8).
 * Procedure: Fizz bible pp. 96-101 (radial only + radial & thrust with Y2 iteration). Mech bible unit 4 (PDF p. 129) is empty.
 * Verified against: Shigley Ex. 11-7(b) (angular-contact ball bearing at C, 25 hp, T = 2404 lbf·in, Fr = 464.4 lbf, Fa = 344 lbf,
 *   R = 0.96 for 4 bearings, 10 kh, af = 1.2, Eq. 11-10): nD = 655.4 rev/min, xD = 393, Fe = 821 lbf -> C10 = 53.1 kN -> 02-60 (C0 35.5);
 *   Fa/C0 = 0.0431 -> Y2 = 1.84, Fe = 893 lbf, C10 = 57.7 kN -> 02-65 (C10 63.7, C0 41.5); Fa/C0 = 0.0369 -> Y2 = 1.90, C10 = 59.1 kN -> 02-65 again -> PASS
 *   (table picks 02-60 then 02-65);
 *   HW4 2023/2024 P4 (Shigley 11-35 mod.: 0.196 kN, 1500 rpm, 60 kh, R 0.98 for 2 -> 0.9899, af 1): xD = 5400, C10 = 5.7 kN -> 02-12 mm deep groove (6.89);
 *   HW4 2023 P3 (11-23: 30 mm, Fr 5, Fa 2 kN, 400 rpm, R 0.99, C10 19.5 / C0 10.0, Y2 read 1.27): Fe = 5.34 kN, xD = 10.66, life 444 h;
 *   HW4 2024 P3 (11-22: 65 mm, Fr 7, Fa 3 kN, outer ring, 500 rpm, 10 kh, R 0.95, C0 34.0): Y2 = 1.53, Fe = 9.29 kN, C10 = 73.4 kN > 55.9 -> FAIL;
 *   HW4 2024 P4d (SKF 6201-2Z, C 7.28 kN, P 0.196 kN, a1 0.25, aSKF 0.3): L_nm = 3843 x 10^6 rev < 5400;
 *   Tutorial 2022 Q2 (Shigley 11-6 8e: Fr 8, Fa 5 kN, outer ring 1000 rpm, 5 kh, R 0.95, angular contact): 90 mm (C0 73.5) -> Y2 1.64, Fe 13.58, C10 106.6 kN;
 *   95 mm (C0 85.0) -> Y2 1.694, Fe 13.87, C10 108.9 kN < 121 -> 02-95 mm. */
(function () {
  // Table 11-1 data for auto-interpolation
  const FaC0 = [0.014, 0.021, 0.028, 0.042, 0.056, 0.070, 0.084, 0.110, 0.17, 0.28, 0.42, 0.56];
  const E = [0.19, 0.21, 0.22, 0.24, 0.26, 0.27, 0.28, 0.30, 0.34, 0.38, 0.42, 0.44];
  const Y2 = [2.30, 2.15, 1.99, 1.85, 1.71, 1.63, 1.55, 1.45, 1.31, 1.15, 1.04, 1.00];
  // Table 11-2: bore, OD, width, dS, dH, deep-groove C10, C0, angular-contact C10, C0 (kN)
  const T112 = [[10, 30, 9, 12.5, 27, 5.07, 2.24, 4.94, 2.12], [12, 32, 10, 14.5, 28, 6.89, 3.10, 7.02, 3.05], [15, 35, 11, 17.5, 31, 7.80, 3.55, 8.06, 3.65], [17, 40, 12, 19.5, 34, 9.56, 4.50, 9.95, 4.75],
    [20, 47, 14, 25, 41, 12.7, 6.20, 13.3, 6.55], [25, 52, 15, 30, 47, 14.0, 6.95, 14.8, 7.65], [30, 62, 16, 35, 55, 19.5, 10.0, 20.3, 11.0], [35, 72, 17, 41, 65, 25.5, 13.7, 27.0, 15.0],
    [40, 80, 18, 46, 72, 30.7, 16.6, 31.9, 18.6], [45, 85, 19, 52, 77, 33.2, 18.6, 35.8, 21.2], [50, 90, 20, 56, 82, 35.1, 19.6, 37.7, 22.8], [55, 100, 21, 63, 90, 43.6, 25.0, 46.2, 28.5],
    [60, 110, 22, 70, 99, 47.5, 28.0, 55.9, 35.5], [65, 120, 23, 74, 109, 55.9, 34.0, 63.7, 41.5], [70, 125, 24, 79, 114, 61.8, 37.5, 68.9, 45.5], [75, 130, 25, 86, 119, 66.3, 40.5, 71.5, 49.0],
    [80, 140, 26, 93, 127, 70.2, 45.0, 80.6, 55.0], [85, 150, 28, 99, 136, 83.2, 53.0, 90.4, 63.0], [90, 160, 30, 104, 146, 95.6, 62.0, 106, 73.5], [95, 170, 32, 110, 156, 108, 69.5, 121, 85.0]];
  // Table 11-3: bore, 02 (OD, W, C10, C0), 03 (OD, W, C10, C0)
  const T113 = [[25, 52, 15, 16.8, 8.8, 62, 17, 28.6, 15.0], [30, 62, 16, 22.4, 12.0, 72, 19, 36.9, 20.0], [35, 72, 17, 31.9, 17.6, 80, 21, 44.6, 27.1], [40, 80, 18, 41.8, 24.0, 90, 23, 56.1, 32.5],
    [45, 85, 19, 44.0, 25.5, 100, 25, 72.1, 45.4], [50, 90, 20, 45.7, 27.5, 110, 27, 88.0, 52.0], [55, 100, 21, 56.1, 34.0, 120, 29, 102, 67.2], [60, 110, 22, 64.4, 43.1, 130, 31, 123, 76.5],
    [65, 120, 23, 76.5, 51.2, 140, 33, 138, 85.0], [70, 125, 24, 79.2, 51.2, 150, 35, 151, 102], [75, 130, 25, 93.1, 63.2, 160, 37, 183, 125], [80, 140, 26, 106, 69.4, 170, 39, 190, 125],
    [85, 150, 28, 119, 78.3, 180, 41, 212, 149], [90, 160, 30, 142, 100, 190, 43, 242, 160], [95, 170, 32, 165, 112, 200, 45, 264, 189], [100, 180, 34, 183, 125, 215, 47, 303, 220],
    [110, 200, 38, 229, 167, 240, 50, 391, 304], [120, 215, 40, 260, 183, 260, 55, 457, 340], [130, 230, 40, 270, 193, 280, 58, 539, 408], [140, 250, 42, 319, 240, 300, 62, 682, 454], [150, 270, 45, 446, 260, 320, 65, 781, 502]];
  const CR = { 90: 1, 95: 0.64, 96: 0.55, 97: 0.47, 98: 0.37, 99: 0.25 };   // SKF Table 3 a1
  const toKN = v => v.unit === 'N' ? 1e-3 : v.unit === 'kN' ? 1 : 1 / 224.809;   // load unit → kN
  const lnTerm = v => v.relEq === 'Eq. 11-10 (1 − R_D)' ? (1 - v.RD) : Math.log(1 / v.RD);
  const bracket = v => H.has(v, 'xD', 'x0', 'th', 'b', 'RD') && v.RD > 0 && v.RD < 1 ? v.xD / (v.x0 + (v.th - v.x0) * Math.pow(lnTerm(v), 1 / v.b)) : undefined;
  const c10 = (v, FD) => (bracket(v) !== undefined && H.has(v, 'af', 'a') && FD !== undefined) ? v.af * FD * Math.pow(bracket(v), 1 / v.a) : undefined;
  const thrust = v => v.mode === 'radial + thrust';
  const first = (...a) => a.find(x => x !== undefined);
  function cands(v) {
    if (/roller/.test(v.btype || '')) { const o = []; T113.forEach(r => { o.push({ n: '02-' + r[0] + ' mm cyl. roller', d: r[0], OD: r[1], C: r[3], C0: r[4] }); o.push({ n: '03-' + r[0] + ' mm cyl. roller', d: r[0], OD: r[5], C: r[7], C0: r[8] }); }); return o; }
    const ac = /angular/.test(v.btype || '');
    return T112.map(r => ({ n: '02-' + r[0] + ' mm ' + (ac ? 'angular-contact' : 'deep-groove'), d: r[0], OD: r[1], C: ac ? r[7] : r[5], C0: ac ? r[8] : r[6], ds: r[3] }));
  }
  // selection table: req in kN; ids = [name id, C10 id, C0 id]
  function selTab(v, req, ids) {
    if (!(req > 0)) return '';
    const all = cands(v).filter(c => !(v.dsh > 0) || c.d >= v.dsh - 1e-9);
    const k = all.findIndex(c => c.C >= req);
    const lo = Math.max(0, (k < 0 ? all.length : k) - 2), rows = all.slice(lo, lo + 5).map((c, i) => {
      const set = { [ids[0]]: c.n, [ids[1]]: c.C }; if (ids[2]) set[ids[2]] = c.C0;
      return { cells: [c.n, c.OD, H.fmt(c.C), H.fmt(c.C0), H.fmt(c.C / req, 3), c.ds !== undefined ? c.ds : '—'], ok: c.C >= req, pick: lo + i === k, set };
    });
    return H.table(['Bearing (Table ' + (/roller/.test(v.btype || '') ? '11-3' : '11-2') + ')', 'OD (mm)', 'C_10 (kN)', 'C_0 (kN)', 'C_10 / required', 'shaft shoulder d_S (mm)'], rows, {
      caption: 'Candidates for required C_10 = ' + H.fmt(req) + ' kN' + (v.dsh > 0 ? ', bore ≥ ' + H.fmt(v.dsh) + ' mm' : ''),
      note: 'Pick = smallest bore with C_10 ≥ required (02 before 03 series). Ex. 11-7: 02-60 then 02-65 angular contact; HW4 P4: 02-12 mm deep groove (6.89 kN).' + (k < 0 ? ' <b>No bearing in this table is large enough.</b>' : ''),
    });
  }

  window.TOPIC = {
    id: 'ball_cyl_bearings', book: 'shigley',
    title: 'Ball & Cylindrical Roller Bearings',
    subtitle: 'Shigley Ch. 11 Secs 11-3 to 11-8 · Fizz pp. 96-101 · Weibull C10 method',
    sibling: 'ball_cyl_bearings_mott.html',
    intro: 'Find the catalogue rating <i>C<sub>10</sub></i> a ball or cylindrical roller bearing needs and pick it from Table 11-2 / 11-3. ' +
      'A thrust load needs \\(F_e = X_i V F_r + Y_i F_a\\) with <i>Y<sub>2</sub></i> depending on the <i>C<sub>0</sub></i> of the bearing — so assume <i>Y<sub>2</sub></i>, pick, re-read and repeat until the same bearing comes up twice (Shigley Ex. 11-7 is loaded). ' +
      'The last section checks the life / reliability of a given bearing.',
    example: { mode: 'radial + thrust', unit: 'lbf', H: 25, T: 2404, Fx: 356.6, Fy: 297.5, Fa: 344, Rtot: 0.96, nb: 4, LDh: 10000, mfr: 2, af: 1.2, btype: 'angular-contact ball (a = 3)', ring: 'inner ring rotates (V = 1)', relEq: 'Eq. 11-10 (1 − R_D)', X2: 0.56, Y2a: 1.63, bore1: '02-60 mm angular-contact', C10sel1: 55.9, C0sel1: 35.5, bore2: '02-65 mm angular-contact', C10sel2: 63.7, C0sel2: 41.5, bore3: '02-65 mm angular-contact', C10sel3: 63.7 },

    assumptions: [
      { text: 'Speed from \\(n_D = 63\\,025\\,H/T\\) when not given directly', src: 'Fizz p.96', var: 'nD' },
      { text: 'Reliability per bearing \\(R_D = R_{tot}^{1/n}\\) only when the reliability of the whole set is given; otherwise R_D = 0.90 (catalogue L_10)', src: 'Fizz p.96 · Fizz p.113', var: 'Rtot' },
      { text: 'Design life from Table 11-4 for the type of machine if not given', src: 'Fizz p.97', var: 'LDh' },
      { text: 'Manufacturer 2 (SKF) Weibull set: \\(L_{10} = 10^6\\) rev, x_0 = 0.02, θ = 4.459, b = 1.483 — the basis of Tables 11-2/11-3', src: 'Fizz p.97', var: 'mfr' },
      { text: 'Application factor a_f from Table 11-5 if not given (1.2 pre-filled, Ex. 11-7)', src: 'Fizz p.97 · Shigley Ex. 11-7', var: 'af' },
      { text: 'Load-life exponent a = 3 ball, 10/3 cylindrical roller', src: 'Fizz p.98', var: 'a' },
      { text: 'Reliability term \\([\\ln(1/R_D)]^{1/b}\\) (Eq. 11-9); Shigley\'s examples and HW4 use \\((1-R_D)\\) (Eq. 11-10) — nearly equal for R_D ≥ 0.9', src: 'Fizz p.98', var: 'relEq' },
      { text: 'Rotation factor V = 1 (inner ring rotates); 1.2 if the outer ring rotates', src: 'Fizz p.99', var: 'ring' },
      { text: 'Thrust case: assume \\(F_a/(VF_r) > e\\) and first-pass X_2 = 0.56, Y_2 = 1.63 (middle of Table 11-1)', src: 'Fizz p.99 · Fizz p.100', var: 'Y2a' },
      { text: 'Use F_a/C_0 = 0.014 when it is smaller (Table 11-1 footnote); interpolate e and Y_2 linearly', src: 'Fizz p.100 · Fizz p.101', step: 'y2a' },
      { text: 'Re-size with \\(C_{10,new} = (F_{e,new}/F_{e,old})\\,C_{10,old}\\); stop when the same bearing is selected twice', src: 'Fizz p.101 · Fizz p.106', step: 'c10t2' },
    ],

    figures: [
      { id: 'fig11-1', ref: 'Figure 11-1', title: 'Nomenclature of a ball bearing (bore, OD, width, races, separator)', src: 'figures/shigley/fig11-1.png', page: 598 },
      { id: 'fig11-2', ref: 'Figure 11-2', title: 'Types of ball bearings: deep-groove, angular-contact, shielded, sealed, self-aligning, thrust', src: 'figures/shigley/fig11-2.png', page: 598 },
      { id: 'fig11-8', ref: 'Figure 11-8', title: 'Shaft and housing shoulder diameters d_S, d_H (for Table 11-2)', src: 'figures/shigley/fig11-8.png', page: 609 },
      { id: 'fig11-5', ref: 'Figure 11-5', title: 'Constant-reliability contours: design point D \\((F_D, x_D, R_D)\\) to catalogue point A \\((C_{10}, x = 1, R = 0.90)\\)', src: 'figures/shigley/fig11-5.png', page: 605 },
      { id: 'fig11-6', ref: 'Figure 11-6', title: '\\(F_e/(VF_r)\\) vs \\(F_a/(VF_r)\\): the two line segments that define e, X and Y', src: 'figures/shigley/fig11-6.png', page: 607 },
      { id: 't11-4', ref: 'Table 11-4', title: 'Bearing-life recommendations for classes of machinery (kh)', src: 'figures/shigley/table11-4.png', page: 610 },
      { id: 't11-5', ref: 'Table 11-5', title: 'Load-application factors a_f', src: 'figures/shigley/table11-5.png', page: 610 },
      { id: 't11-6', ref: 'Table 11-6', title: 'Weibull parameters: manufacturer 1 (Timken, \\(90\\times10^6\\) rev) and 2 (SKF, \\(10^6\\) rev)', src: 'figures/shigley/table11-6.png', page: 634,
        note: 'Tables 11-2 and 11-3 are based on manufacturer 2.' },
      { id: 't11-1', ref: 'Table 11-1', title: 'Equivalent radial load factors e, X_1, Y_1, X_2, Y_2 vs F_a/C_0 for ball bearings', src: 'figures/shigley/table11-1.png', page: 607,
        note: 'Use 0.014 if F_a/C_0 < 0.014; interpolate linearly. Cylindrical rollers: Y = 0.' },
      { id: 't11-2', ref: 'Table 11-2', title: '02-series deep-groove and angular-contact ball bearings: dimensions, C_10, C_0 (kN)', src: 'figures/shigley/table11-2.png', page: 608 },
      { id: 't11-3', ref: 'Table 11-3', title: 'Cylindrical roller bearings (02- and 03-series): dimensions, C_10, C_0 (kN)', src: 'figures/shigley/table11-3.png', page: 609 },
      { id: 'skf-dg', ref: 'SKF table 1.1 (catalogue p.272)', book: 'course', title: 'SKF single-row deep groove ball bearings, d = 25–30 mm (6205, 6305 …): C, C_0, P_u, speeds', src: 'figures/course/skf_deep_groove_ball_d25_30_p272.png', note: 'Example page; HW4 P4b uses the same layout for d = 12 mm (6201: C = 7.28 kN with shields).' },
      { id: 'skf-cyl', ref: 'SKF table 6.1 (catalogue p.516)', book: 'course', title: 'SKF single-row cylindrical roller bearings, d = 15–25 mm (NU/NJ/N 2xx ECP)', src: 'figures/course/skf_cylindrical_roller_d15_25_p516.png' },
      { id: 'skf-a1', ref: 'SKF Table 3 (catalogue p.90)', book: 'course', title: 'SKF life adjustment factor a_1 vs reliability (90 % → 1 … 99 % → 0.25)', src: 'figures/course/skf_table3_a1_reliability_p90.png' },
      { id: 'skf-askf', ref: 'SKF Diagram 8 (catalogue p.95)', book: 'course', title: 'Life modification factor a_SKF vs \\(\\eta_c P_u/P\\) and viscosity ratio κ (ball bearings)', src: 'figures/course/skf_diagram8_askf_p95.png', note: 'HW4 2024 P4d: \\(\\eta_c P_u/P\\) = 0.1, κ = 1 → a_SKF ≈ 0.3.' },
      { id: 'skf-etac', ref: 'SKF Table 6 (catalogue p.105)', book: 'course', title: 'Contamination factor \\(\\eta_c\\) by cleanliness level', src: 'figures/course/skf_table6_eta_c_contamination_p105.png', note: 'Shielded, greased for life, normal cleanliness: 0.6 … 0.5 (d_m < 100 mm).' },
    ],

    sections: [
      { title: 'Inputs', steps: [
        { id: 'mode', title: 'Loading case, units and bearing type', fig: ['fig11-1', 'fig11-2'],
          text: 'Rotating inner ring → press (interference) fit on the shaft, clearance fit in the housing.',
          vars: [
            { id: 'mode', label: 'Loading', kind: 'choice', type: 'text', default: 'radial only', options: ['radial only', 'radial + thrust'] },
            { id: 'unit', label: 'Load unit used below', kind: 'choice', type: 'text', default: 'lbf', options: ['lbf', 'N', 'kN'], hint: 'Tables 11-2/11-3 are in kN' },
            { id: 'btype', label: 'Bearing type', kind: 'choice', type: 'text', default: 'deep-groove ball (a = 3)', options: ['deep-groove ball (a = 3)', 'angular-contact ball (a = 3)', 'cylindrical roller (a = 10/3)'] },
            { id: 'a', symbol: 'a', label: 'Load-life exponent', unit: '', kind: 'calc', digits: 4, compute: v => v.btype ? (/roller/.test(v.btype) ? 10 / 3 : 3) : undefined },
          ] },
        { id: 'speed', title: 'Step 1 — angular speed', eq: '3-42', formula: 'n_D = \\frac{63\\,025\\,H}{T}',
          text: 'Type <i>n<sub>D</sub></i> if given, else torque from the FBD and power (Ex. 11-7: 2404 lbf·in, 25 hp → 655.4 rev/min).',
          vars: [
            { id: 'H', symbol: 'H', label: 'Power', unit: 'hp', kind: 'input', hint: 'optional' },
            { id: 'T', symbol: 'T', label: 'Torque', unit: 'lbf·in', kind: 'input', hint: 'optional' },
            { id: 'nD', symbol: 'n_D', label: 'Speed', unit: 'rev/min', kind: 'input', auto: v => H.has(v, 'H', 'T') && v.T > 0 ? 63025 * v.H / v.T : undefined },
          ] },
        { id: 'loads', title: 'Step 2 — radial (and thrust) load on the bearing', formula: 'F_r = \\sqrt{F_x^2 + F_y^2}',
          vars: [
            { id: 'Fx', symbol: 'F_x', label: 'Radial reaction, x', kind: 'input' },
            { id: 'Fy', symbol: 'F_y', label: 'Radial reaction, y', kind: 'input' },
            { id: 'Fr', symbol: 'F_r', label: 'Radial load', kind: 'input', auto: v => H.has(v, 'Fx', 'Fy') ? Math.hypot(v.Fx, v.Fy) : undefined, hint: 'blank → from F_x, F_y',
              work: v => H.has(v, 'Fx', 'Fy') ? '\\(F_r = \\sqrt{' + H.fmt(v.Fx) + '^2 + ' + H.fmt(v.Fy) + '^2} = ' + H.fmt(Math.hypot(v.Fx, v.Fy)) + '\\)' : null },
            { id: 'Fa', symbol: 'F_a', label: 'Axial (thrust) load', kind: 'input', hint: 'radial + thrust case only' },
            { id: 'dsh', symbol: 'd_{min}', label: 'Minimum bore (shaft diameter at the seat)', unit: 'mm', kind: 'input', hint: 'optional — filters the selection tables' },
          ] },
        { id: 'rel', title: 'Step 3 — reliability of each bearing', formula: 'R_D = \\sqrt[n]{R_{tot}}',
          text: 'Only when the reliability is given for the whole set of <i>n</i> bearings (Ex. 11-7: \\(\\sqrt[4]{0.96} = 0.99\\)).',
          vars: [
            { id: 'Rtot', symbol: 'R_{tot}', label: 'Reliability goal of the set', unit: '', kind: 'input', default: 0.90 },
            { id: 'nb', symbol: 'n', label: 'Number of bearings sharing the goal', unit: '', kind: 'input', default: 1 },
            { id: 'RD', symbol: 'R_D', label: 'Design reliability per bearing', unit: '', kind: 'calc', digits: 5, compute: v => H.has(v, 'Rtot', 'nb') && v.nb > 0 ? Math.pow(v.Rtot, 1 / v.nb) : undefined,
              work: v => v.RD !== undefined ? '\\(R_D = ' + H.fmt(v.Rtot) + '^{1/' + H.fmt(v.nb) + '} = ' + H.fmt(v.RD, 5) + '\\)' : null },
          ] },
        { id: 'life', title: 'Steps 4–5 — design life and multiple of rating life', eq: '11-3', fig: ['t11-4', 't11-6', 'fig11-5'],
          formula: 'x_D = \\frac{L_D}{L_{10}} = \\frac{60\\,\\mathcal{L}_D\\, n_D}{L_{10}}',
          text: '\\(L_{10}\\) = revolutions that 90 % of bearings reach or exceed; load and life trade as \\(F L^{1/a}\\) = constant.',
          vars: [
            { id: 'LDh', symbol: '\\mathcal{L}_D', label: 'Design life', unit: 'h', kind: 'lookup', fig: 't11-4' },
            { id: 'mfr', label: 'Manufacturer (Weibull set)', kind: 'choice', default: 2, options: [{ label: '1 — Timken (\\(90\\times10^6\\) rev; x_0 = 0, θ = 4.48, b = 1.5)', value: 1 }, { label: '2 — SKF (\\(10^6\\) rev; x_0 = 0.02, θ = 4.459, b = 1.483)', value: 2 }] },
            { id: 'L10', symbol: 'L_{10}', label: 'Rating life', unit: 'rev', kind: 'lookup', fig: 't11-6', auto: v => v.mfr === 1 ? 90e6 : v.mfr === 2 ? 1e6 : undefined },
            { id: 'x0', symbol: 'x_0', label: 'Weibull guaranteed life', unit: '', kind: 'lookup', fig: 't11-6', auto: v => v.mfr === 1 ? 0 : v.mfr === 2 ? 0.02 : undefined },
            { id: 'th', symbol: '\\theta', label: 'Weibull characteristic parameter', unit: '', kind: 'lookup', fig: 't11-6', auto: v => v.mfr === 1 ? 4.48 : v.mfr === 2 ? 4.459 : undefined },
            { id: 'b', symbol: 'b', label: 'Weibull shape parameter', unit: '', kind: 'lookup', fig: 't11-6', auto: v => v.mfr === 1 ? 1.5 : v.mfr === 2 ? 1.483 : undefined },
            { id: 'LDrev', symbol: 'L_D', label: 'Design life in revolutions', unit: 'rev', kind: 'calc', digits: 4, compute: v => H.has(v, 'LDh', 'nD') ? 60 * v.LDh * v.nD : undefined },
            { id: 'xD', symbol: 'x_D', label: 'Multiple of rating life', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'LDrev', 'L10') && v.L10 > 0 ? v.LDrev / v.L10 : undefined,
              work: v => v.xD !== undefined ? '\\(x_D = \\dfrac{60(' + H.fmt(v.LDh) + ')(' + H.fmt(v.nD) + ')}{' + H.fmt(v.L10) + '} = ' + H.fmt(v.xD) + '\\)' : null },
          ] },
        { id: 'af', title: 'Step 6 — application factor', fig: ['t11-5'],
          vars: [
            { id: 'af', symbol: 'a_f', label: 'Load-application factor', unit: '', kind: 'lookup', fig: 't11-5', default: 1.2, hint: 'commercial gearing 1.1–1.3; light impact 1.2–1.5' },
            { id: 'relEq', label: 'Reliability term', kind: 'choice', type: 'text', default: 'Eq. 11-9 ln(1/R_D)', options: [{ label: 'Eq. 11-9 \\(\\ln(1/R_D)\\)', value: 'Eq. 11-9 ln(1/R_D)' }, { label: 'Eq. 11-10 \\((1 - R_D)\\)', value: 'Eq. 11-10 (1 − R_D)' }] },
          ] },
      ] },

      { title: 'Radial load only (Fizz 4.2.2)', steps: [
        { id: 'c10r', title: 'Step 7 — required catalogue rating', eq: '11-9', fig: ['fig11-5'], when: v => !thrust(v),
          formula: 'C_{10} = a_f F_D \\left[\\frac{x_D}{x_0 + (\\theta - x_0)\\,[\\ln(1/R_D)]^{1/b}}\\right]^{1/a}',
          text: '\\(F_D = F_r\\) for a purely radial load.',
          vars: [
            { id: 'brk', symbol: '[\\;]', label: 'Bracket term', unit: '', kind: 'calc', digits: 4, compute: v => bracket(v) },
            { id: 'C10r', symbol: 'C_{10}', label: 'Required rating', kind: 'calc', digits: 4, compute: v => c10(v, v.Fr),
              work: v => v.C10r !== undefined ? '\\(C_{10} = ' + H.fmt(v.af) + '(' + H.fmt(v.Fr) + ')\\left[' + H.fmt(v.brk) + '\\right]^{1/' + H.fmt(v.a) + '} = ' + H.fmt(v.C10r) + '\\ \\text{' + v.unit + '}\\)' : null },
            { id: 'C10rkN', symbol: 'C_{10}', label: 'Required rating in kN', unit: 'kN', kind: 'calc', digits: 4, compute: v => v.C10r !== undefined ? v.C10r * toKN(v) : undefined },
          ] },
        { id: 'selr', title: 'Step 8 — select the bearing', fig: ['t11-2', 't11-3', 'fig11-8', 'skf-dg', 'skf-cyl'], when: v => !thrust(v),
          text: 'Pick from the table (★) or read Table 11-2 (ball) / 11-3 (cylindrical roller): first bore with \\(C_{10}\\) ≥ required that fits the shaft.',
          vars: [
            { id: 'boreR', label: 'Selected bearing', kind: 'input', type: 'text', hint: 'e.g. 02-25 mm' },
            { id: 'C10selR', symbol: 'C_{10,cat}', label: 'Catalogue C_10 of the selection', unit: 'kN', kind: 'lookup', fig: 't11-2',
              check: v => (H.has(v, 'C10selR', 'C10rkN') && v.C10selR < v.C10rkN) ? 'Catalogue C_10 is below the required value' : null },
          ],
          after: v => selTab(v, v.C10rkN, ['boreR', 'C10selR']) + (!H.has(v, 'C10selR', 'C10rkN') ? '' : v.C10selR >= v.C10rkN ? '<span class="result-ok">' + (v.boreR || 'Selected bearing') + ': C_10 = ' + H.fmt(v.C10selR) + ' kN ≥ ' + H.fmt(v.C10rkN) + ' kN ✔</span>' : '<span class="result-bad">Pick a larger bearing — C_10 must be ≥ ' + H.fmt(v.C10rkN) + ' kN</span>') },
      ] },

      { title: 'Radial + thrust (Fizz 4.2.3) — iteration 1', steps: [
        { id: 'V', title: 'Steps 1–2 — rotation factor and first-guess X_2, Y_2', eq: '11-12', fig: ['fig11-6', 't11-1'], when: thrust,
          formula: 'F_e = X_i V F_r + Y_i F_a',
          text: 'The equivalent radial load does the same damage as the radial and thrust loads together (never just their sum).',
          vars: [
            { id: 'ring', label: 'Rotating ring', kind: 'choice', type: 'text', default: 'inner ring rotates (V = 1)', options: ['inner ring rotates (V = 1)', 'outer ring rotates (V = 1.2)'] },
            { id: 'V', symbol: 'V', label: 'Rotation factor', unit: '', kind: 'calc', digits: 2, compute: v => v.ring ? (/outer/.test(v.ring) ? 1.2 : 1) : undefined },
            { id: 'X2', symbol: 'X_2', label: 'Radial factor (constant in Table 11-1)', unit: '', kind: 'lookup', fig: 't11-1', default: 0.56 },
            { id: 'Y2a', symbol: 'Y_2', label: 'Assumed thrust factor', unit: '', kind: 'lookup', fig: 't11-1', default: 1.63 },
            { id: 'Fe1', symbol: 'F_e', label: 'Equivalent radial load (1st)', kind: 'calc', digits: 4, compute: v => H.has(v, 'X2', 'V', 'Fr', 'Y2a', 'Fa') ? v.X2 * v.V * v.Fr + v.Y2a * v.Fa : undefined,
              work: v => v.Fe1 !== undefined ? '\\(F_e = ' + H.fmt(v.X2) + '(' + H.fmt(v.V) + ')(' + H.fmt(v.Fr) + ') + ' + H.fmt(v.Y2a) + '(' + H.fmt(v.Fa) + ') = ' + H.fmt(v.Fe1) + '\\ \\text{' + v.unit + '}\\)' : null },
          ] },
        { id: 'c10t', title: 'Steps 4–6 — first C_10 and tentative bearing', eq: '11-9', fig: ['t11-2'], when: thrust,
          formula: 'C_{10} = a_f F_e \\left[\\frac{x_D}{x_0 + (\\theta - x_0)[\\ln(1/R_D)]^{1/b}}\\right]^{1/a}',
          vars: [
            { id: 'brk2', symbol: '[\\;]', label: 'Bracket term', unit: '', kind: 'calc', digits: 4, compute: v => bracket(v) },
            { id: 'C10t1', symbol: 'C_{10}', label: 'Required rating (1st)', kind: 'calc', digits: 4, compute: v => c10(v, v.Fe1),
              work: v => v.C10t1 !== undefined ? '\\(C_{10} = ' + H.fmt(v.af) + '(' + H.fmt(v.Fe1) + ')\\left[' + H.fmt(v.brk2) + '\\right]^{1/' + H.fmt(v.a) + '} = ' + H.fmt(v.C10t1) + '\\ \\text{' + v.unit + '} = ' + H.fmt(v.C10t1 * toKN(v)) + '\\text{ kN}\\)' : null },
            { id: 'C10t1kN', symbol: 'C_{10}', label: 'Required rating (1st) in kN', unit: 'kN', kind: 'calc', digits: 4, compute: v => v.C10t1 !== undefined ? v.C10t1 * toKN(v) : undefined },
            { id: 'bore1', label: 'Tentative bearing', kind: 'input', type: 'text', hint: 'e.g. 02-60 mm angular-contact' },
            { id: 'C10sel1', symbol: 'C_{10,cat}', label: 'Its catalogue C_10', unit: 'kN', kind: 'lookup', fig: 't11-2' },
            { id: 'C0sel1', symbol: 'C_0', label: 'Its catalogue C_0', unit: 'kN', kind: 'lookup', fig: 't11-2' },
          ],
          after: v => selTab(v, v.C10t1kN, ['bore1', 'C10sel1', 'C0sel1']) },
        { id: 'y2a', title: 'Steps 7–11 — F_a/C_0, e, interpolate Y_2, recompute F_e', fig: ['t11-1'], when: thrust,
          formula: 'Y_2 = Y_{2,1} + \\frac{Y_{2,2}-Y_{2,1}}{x_2 - x_1}\\left(\\frac{F_a}{C_0} - x_1\\right)',
          text: 'If \\(F_a/(VF_r) \\le e\\) the thrust is small: \\(F_e = VF_r\\). Otherwise interpolate <i>Y<sub>2</sub></i> at the actual \\(F_a/C_0\\) (auto; override with your reading).',
          vars: [
            { id: 'FaC01', symbol: 'F_a/C_0', label: 'Thrust ratio', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'Fa', 'C0sel1') && v.C0sel1 > 0 ? v.Fa * toKN(v) / v.C0sel1 : undefined,
              work: v => v.FaC01 !== undefined ? '\\(F_a/C_0 = ' + H.fmt(v.Fa * toKN(v)) + '/' + H.fmt(v.C0sel1) + ' = ' + H.fmt(v.FaC01) + '\\)' : null },
            { id: 'e1', symbol: 'e', label: 'Limit ratio', unit: '', kind: 'lookup', fig: 't11-1', auto: v => v.FaC01 !== undefined ? H.interp(v.FaC01, FaC0, E) : undefined },
            { id: 'ratio1', symbol: 'F_a/(VF_r)', label: 'Thrust-to-radial ratio', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'Fa', 'V', 'Fr') && v.Fr > 0 ? v.Fa / (v.V * v.Fr) : undefined },
            { id: 'Y2b', symbol: 'Y_2', label: 'Interpolated thrust factor', unit: '', kind: 'lookup', fig: 't11-1', auto: v => v.FaC01 !== undefined ? H.interp(v.FaC01, FaC0, Y2) : undefined },
            { id: 'Fe2', symbol: 'F_e', label: 'Equivalent load (2nd)', kind: 'calc', digits: 4,
              compute: v => !H.has(v, 'V', 'Fr', 'Fa', 'ratio1', 'e1') ? undefined : v.ratio1 > v.e1 ? (H.has(v, 'X2', 'Y2b') ? v.X2 * v.V * v.Fr + v.Y2b * v.Fa : undefined) : v.V * v.Fr,
              work: v => v.Fe2 === undefined ? null : v.ratio1 > v.e1 ? '\\(F_a/(VF_r) = ' + H.fmt(v.ratio1) + ' > e = ' + H.fmt(v.e1) + ':\\ F_e = ' + H.fmt(v.X2) + '(' + H.fmt(v.V) + ')(' + H.fmt(v.Fr) + ') + ' + H.fmt(v.Y2b) + '(' + H.fmt(v.Fa) + ') = ' + H.fmt(v.Fe2) + '\\)' : '\\(F_a/(VF_r) = ' + H.fmt(v.ratio1) + ' \\le e:\\ F_e = VF_r = ' + H.fmt(v.Fe2) + '\\)' },
          ] },
        { id: 'c10t2', title: 'Steps 12–13 — new C_10 and re-select', fig: ['t11-2'], when: thrust,
          formula: 'C_{10,new} = \\frac{F_{e,new}}{F_{e,old}}\\, C_{10,old}',
          vars: [
            { id: 'C10t2kN', symbol: 'C_{10}', label: 'Required rating (2nd)', unit: 'kN', kind: 'calc', digits: 4, compute: v => H.has(v, 'Fe2', 'Fe1', 'C10t1kN') && v.Fe1 > 0 ? v.Fe2 / v.Fe1 * v.C10t1kN : undefined,
              work: v => v.C10t2kN !== undefined ? '\\(C_{10} = \\dfrac{' + H.fmt(v.Fe2) + '}{' + H.fmt(v.Fe1) + '}(' + H.fmt(v.C10t1kN) + ') = ' + H.fmt(v.C10t2kN) + '\\text{ kN}\\)' : null },
            { id: 'bore2', label: 'Bearing selected now', kind: 'input', type: 'text' },
            { id: 'C10sel2', symbol: 'C_{10,cat}', label: 'Its catalogue C_10', unit: 'kN', kind: 'lookup', fig: 't11-2' },
            { id: 'C0sel2', symbol: 'C_0', label: 'Its catalogue C_0', unit: 'kN', kind: 'lookup', fig: 't11-2' },
          ],
          after: v => selTab(v, v.C10t2kN, ['bore2', 'C10sel2', 'C0sel2']) + (!H.has(v, 'C10sel1', 'C10sel2') ? '' : (v.C10sel1 === v.C10sel2 && v.C10sel2 >= v.C10t2kN) ? '<span class="result-ok">Same bearing twice → converged.</span>' : '<span class="result-ok">Different bearing — iteration 2 below with the new C_0.</span>') },
      ] },

      { title: 'Radial + thrust — iteration 2', steps: [
        { id: 'it2', title: 'Repeat Steps 7–13 with the new C_0', fig: ['t11-1', 't11-2'], when: v => thrust(v) && H.has(v, 'C0sel2'),
          vars: [
            { id: 'FaC02', symbol: 'F_a/C_0', label: 'Thrust ratio', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'Fa', 'C0sel2') && v.C0sel2 > 0 ? v.Fa * toKN(v) / v.C0sel2 : undefined },
            { id: 'e2', symbol: 'e', label: 'Limit ratio', unit: '', kind: 'lookup', fig: 't11-1', auto: v => v.FaC02 !== undefined ? H.interp(v.FaC02, FaC0, E) : undefined },
            { id: 'Y2c', symbol: 'Y_2', label: 'Interpolated thrust factor', unit: '', kind: 'lookup', fig: 't11-1', auto: v => v.FaC02 !== undefined ? H.interp(v.FaC02, FaC0, Y2) : undefined },
            { id: 'Fe3', symbol: 'F_e', label: 'Equivalent load (3rd)', kind: 'calc', digits: 4,
              compute: v => !H.has(v, 'V', 'Fr', 'Fa', 'ratio1', 'e2') ? undefined : v.ratio1 > v.e2 ? (H.has(v, 'X2', 'Y2c') ? v.X2 * v.V * v.Fr + v.Y2c * v.Fa : undefined) : v.V * v.Fr,
              work: v => v.Fe3 !== undefined && v.ratio1 > v.e2 ? '\\(F_e = ' + H.fmt(v.X2) + '(' + H.fmt(v.V) + ')(' + H.fmt(v.Fr) + ') + ' + H.fmt(v.Y2c) + '(' + H.fmt(v.Fa) + ') = ' + H.fmt(v.Fe3) + '\\)' : null },
            { id: 'C10t3kN', symbol: 'C_{10}', label: 'Required rating (3rd)', unit: 'kN', kind: 'calc', digits: 4, compute: v => H.has(v, 'Fe3', 'Fe1', 'C10t1kN') && v.Fe1 > 0 ? v.Fe3 / v.Fe1 * v.C10t1kN : undefined,
              work: v => v.C10t3kN !== undefined ? '\\(C_{10} = \\dfrac{' + H.fmt(v.Fe3) + '}{' + H.fmt(v.Fe1) + '}(' + H.fmt(v.C10t1kN) + ') = ' + H.fmt(v.C10t3kN) + '\\text{ kN}\\)' : null },
            { id: 'bore3', label: 'Bearing selected now', kind: 'input', type: 'text' },
            { id: 'C10sel3', symbol: 'C_{10,cat}', label: 'Its catalogue C_10', unit: 'kN', kind: 'lookup', fig: 't11-2' },
          ],
          after: v => selTab(v, v.C10t3kN, ['bore3', 'C10sel3']) + (!H.has(v, 'C10sel2', 'C10sel3', 'C10t3kN') ? '' : (v.C10sel2 === v.C10sel3 && v.C10sel3 >= v.C10t3kN) ? '<span class="result-ok">Same bearing again → converged: ' + (v.bore3 || v.bore2 || '') + ', C_10 = ' + H.fmt(v.C10sel3) + ' kN ≥ ' + H.fmt(v.C10t3kN) + ' kN ✔</span>' : '<span class="result-bad">Not converged — put the latest C_0 into iteration 1 and repeat.</span>') },
      ] },

      { title: 'Check a given bearing — life and reliability', steps: [
        { id: 'chk', title: 'Life and reliability of the selected (or given) bearing', eq: '11-9 / 11-21', fig: ['fig11-5'],
          formula: 'x = \\left(\\frac{C_{10}}{a_f F_e}\\right)^a \\left[x_0 + (\\theta - x_0)(\\ln\\tfrac{1}{R_D})^{1/b}\\right] \\qquad R = \\exp\\left\\{-\\left[\\frac{x_D (a_f F_e/C_{10})^a - x_0}{\\theta - x_0}\\right]^b\\right\\}',
          text: 'Uses the latest catalogue \\(C_{10}\\) and \\(F_e\\) above (HW4 P3: life of an 02-30 mm at 99 %; is an 02-65 mm good for 10 kh at 95 %?).',
          vars: [
            { id: 'Fefin', symbol: 'F_e', label: 'Equivalent load used', unit: 'kN', kind: 'calc', digits: 4, compute: v => { const f = thrust(v) ? first(v.Fe3, v.Fe2, v.Fe1) : v.Fr; return f !== undefined ? f * toKN(v) : undefined; } },
            { id: 'C10fin', symbol: 'C_{10}', label: 'Catalogue rating used', unit: 'kN', kind: 'calc', digits: 4, compute: v => thrust(v) ? first(v.C10sel3, v.C10sel2, v.C10sel1) : v.C10selR },
            { id: 'xcap', symbol: 'x', label: 'Life multiple at R_D', unit: '', kind: 'calc', digits: 4,
              compute: v => H.has(v, 'C10fin', 'Fefin', 'af', 'a', 'x0', 'th', 'b', 'RD') && v.Fefin > 0 && v.RD < 1 ? Math.pow(v.C10fin / (v.af * v.Fefin), v.a) * (v.x0 + (v.th - v.x0) * Math.pow(lnTerm(v), 1 / v.b)) : undefined,
              work: v => v.xcap !== undefined ? '\\(x = \\left(\\dfrac{' + H.fmt(v.C10fin) + '}{' + H.fmt(v.af) + '(' + H.fmt(v.Fefin) + ')}\\right)^{' + H.fmt(v.a) + '}\\left[' + H.fmt(v.x0) + ' + ' + H.fmt(v.th - v.x0) + '(' + H.fmt(lnTerm(v)) + ')^{1/' + H.fmt(v.b) + '}\\right] = ' + H.fmt(v.xcap) + '\\)' : null },
            { id: 'Lcap', symbol: 'L', label: 'Life at R_D', unit: 'h', kind: 'calc', digits: 4, compute: v => H.has(v, 'xcap', 'L10', 'nD') && v.nD > 0 ? v.xcap * v.L10 / (60 * v.nD) : undefined,
              work: v => v.Lcap !== undefined ? '\\(L = \\dfrac{' + H.fmt(v.xcap) + '(' + H.fmt(v.L10) + ')}{60(' + H.fmt(v.nD) + ')} = ' + H.fmt(v.Lcap) + '\\text{ h}\\)' : null },
            { id: 'Ract', symbol: 'R', label: 'Reliability at the design life', unit: '', kind: 'calc', digits: 5,
              compute: v => H.has(v, 'C10fin', 'Fefin', 'xD', 'af', 'a', 'x0', 'th', 'b') && v.C10fin > 0 ? (() => { const z = (v.xD * Math.pow(v.af * v.Fefin / v.C10fin, v.a) - v.x0) / (v.th - v.x0); return z <= 0 ? 1 : Math.exp(-Math.pow(z, v.b)); })() : undefined },
          ],
          after: v => !H.has(v, 'Lcap', 'LDh') ? '' : v.Lcap >= v.LDh ? '<span class="result-ok">Life ' + H.fmt(v.Lcap) + ' h ≥ ' + H.fmt(v.LDh) + ' h required ✔</span>' : '<span class="result-bad">Life ' + H.fmt(v.Lcap) + ' h &lt; ' + H.fmt(v.LDh) + ' h ✘ — bearing too small (R at design life ' + H.fmt(v.Ract, 4) + ')</span>' },
        { id: 'skf', title: 'SKF modified rating life (only if the SKF catalogue is used)', fig: ['skf-a1', 'skf-askf', 'skf-etac', 'skf-dg'],
          formula: 'L_{nm} = a_1\\, a_{SKF} \\left(\\frac{C}{P}\\right)^{a}\\ \\ [10^6\\ \\text{rev}]',
          text: 'a_1 from SKF Table 3; a_SKF from Diagram 8 at \\(\\eta_c P_u/P\\) and κ (HW4 2024 P4d: 6201-2Z, a_1 = 0.25, a_SKF = 0.3).',
          vars: [
            { id: 'Cskf', symbol: 'C', label: 'SKF dynamic rating', unit: 'kN', kind: 'lookup', fig: 'skf-dg', auto: v => v.C10fin },
            { id: 'a1', symbol: 'a_1', label: 'Life adjustment factor', unit: '', kind: 'lookup', fig: 'skf-a1', auto: v => { if (v.RD === undefined) return undefined; const p = Math.round(v.RD * 100); return CR[Math.min(99, Math.max(90, p))] !== undefined ? CR[Math.min(99, Math.max(90, p))] : undefined; } },
            { id: 'etac', symbol: '\\eta_c', label: 'Contamination factor', unit: '', kind: 'lookup', fig: 'skf-etac', hint: 'shielded, normal cleanliness: 0.5' },
            { id: 'Pu', symbol: 'P_u', label: 'Fatigue load limit', unit: 'kN', kind: 'lookup', fig: 'skf-dg' },
            { id: 'etaPu', symbol: '\\eta_c P_u/P', label: 'Diagram 8 abscissa', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'etac', 'Pu', 'Fefin') && v.Fefin > 0 ? v.etac * v.Pu / v.Fefin : undefined },
            { id: 'askf', symbol: 'a_{SKF}', label: 'Life modification factor', unit: '', kind: 'lookup', fig: 'skf-askf' },
            { id: 'Lnm', symbol: 'L_{nm}', label: 'SKF rating life', unit: '10^6 rev', kind: 'calc', digits: 4, compute: v => H.has(v, 'a1', 'askf', 'Cskf', 'Fefin', 'a') && v.Fefin > 0 ? v.a1 * v.askf * Math.pow(v.Cskf / v.Fefin, v.a) : undefined,
              work: v => v.Lnm !== undefined ? '\\(L_{nm} = ' + H.fmt(v.a1) + '(' + H.fmt(v.askf) + ')\\left(\\dfrac{' + H.fmt(v.Cskf) + '}{' + H.fmt(v.Fefin) + '}\\right)^{' + H.fmt(v.a) + '} = ' + H.fmt(v.Lnm) + '\\times10^6\\text{ rev}\\)' : null },
          ],
          after: v => !H.has(v, 'Lnm', 'LDrev') ? '' : v.Lnm * 1e6 >= v.LDrev ? '<span class="result-ok">\\(L_{nm}\\) ≥ required ' + H.fmt(v.LDrev / 1e6) + ' × 10^6 rev ✔</span>' : '<span class="result-bad">\\(L_{nm}\\) &lt; required ' + H.fmt(v.LDrev / 1e6) + ' × 10^6 rev — sealed bearing or a larger size</span>' },
      ] },

      { title: 'Result', steps: [
        { id: 'res', title: 'Final selection', fig: ['t11-2', 't11-3'],
          vars: [
            { id: 'final', label: 'Status', kind: 'calc', compute: v => {
              if (!thrust(v)) return H.has(v, 'C10selR', 'C10rkN') ? (v.C10selR >= v.C10rkN ? 'PASS' : 'FAIL') : undefined;
              const req = first(v.C10t3kN, v.C10t2kN), cat = first(v.C10sel3, v.C10sel2);
              if (req === undefined || cat === undefined) return undefined;
              return cat >= req ? 'PASS' : 'FAIL';
            } },
          ],
          after: v => v.final === undefined ? '' : v.final === 'PASS' ? '<span class="result-ok">Selection meets the required C_10 at R_D = ' + H.fmt(v.RD, 4) + ' for ' + H.fmt(v.LDh) + ' h at ' + H.fmt(v.nD) + ' rev/min.</span>' : '<span class="result-bad">Selected bearing is under-rated — choose the next larger bore.</span>' },
      ] },
    ],
  };
})();
