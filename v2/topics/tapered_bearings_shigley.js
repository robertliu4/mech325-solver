/* Tapered roller bearings — Shigley 11e Ch. 11 Sec. 11-9 (Timken method).
 * Procedure: Fizz bible pp. 101-106 (K iteration). Mech bible unit 4 (PDF p. 129) is empty.
 * Verified against: Shigley Ex. 11-8 (FrA = 2170 N, FrB = 2654 N, Fae = 1690 N, 800 rev/min, 5000 h, pair R = 0.99, af = 1, Eq. 11-10):
 *   trial 1 (K = 1.5): FiA = 680, FiB = 832, FeA = 4651 N, xD = 2.67, C10A = 11 486 (11 478 with exact sqrt 0.99), C10B = 6554 -> 15100/15245 (K = 1.67, 12 100 N);
 *   trial 2: FeA = 4938 N, C10A = 12 195 N (kept, pair R = 0.9946 >= 0.99);
 *   HW4 2023/2024 P5 (Shigley 11-50: FrA 875, FrB 625, Fae 250 lbf, 150 rpm, 90 kh, R 0.90, shafts 1.125 / 1.000 in):
 *   FiA 274, FiB 196 -> Eq. 11-19; C10B = 1208 lbf -> 07100/07196 (1 in, 1570 lbf, K 1.45); C10A = 1969 lbf (solution 1990 with KB 1.45)
 *   -> 15590/15520 (1 1/8 in, 2480 lbf, K 1.69); trial 2 FeA = 1115 lbf, C10A = 2155 lbf (solution 1120 / 2160) -> still adequate. */
(function () {
  const lnTerm = v => v.relEq === 'Eq. 11-10 (1 − R_D)' ? (1 - v.RD) : Math.log(1 / v.RD);
  const bracket = v => H.has(v, 'xD', 'x0', 'th', 'b', 'RD') && v.RD > 0 && v.RD < 1 ? v.xD / (v.x0 + (v.th - v.x0) * Math.pow(lnTerm(v), 1 / v.b)) : undefined;
  const c10 = (v, FD) => (bracket(v) !== undefined && H.has(v, 'af') && FD !== undefined) ? v.af * FD * Math.pow(bracket(v), 3 / 10) : undefined;
  // equivalent loads for a trial (KA, KB)
  function eq(v, KA, KB) {
    if (!H.has(v, 'FrA', 'FrB', 'Fae') || !(KA > 0) || !(KB > 0)) return undefined;
    const FiA = 0.47 * v.FrA / KA, FiB = 0.47 * v.FrB / KB;
    let FeA, FeB, caseA;
    if (FiA <= FiB + v.Fae) { caseA = true; FeA = 0.4 * v.FrA + KA * (FiB + v.Fae); FeB = v.FrB; }
    else { caseA = false; FeB = 0.4 * v.FrB + KB * (FiA - v.Fae); FeA = v.FrA; }
    FeA = Math.max(FeA, v.FrA); FeB = Math.max(FeB, v.FrB);   // never less than the radial load
    return { FiA, FiB, FeA, FeB, caseA };
  }
  const R24 = (v, C10, FD) => H.has(v, 'xD', 'af', 'th', 'b') && C10 > 0 && FD > 0 ? Math.exp(-Math.pow(v.xD / (v.th * Math.pow(C10 / (v.af * FD), 10 / 3)), v.b)) : undefined;
  // Fig. 11-15 (Timken TS single-row): bore mm, bore in, OD in, one-row radial N, lbf, K, a mm, cone, cup
  const F1115 = [[25, 0.9843, 2.0472, 8190, 1840, 1.56, -3.6, '30205', '30205'], [25, 0.9843, 2.0472, 9520, 2140, 1.00, -3.0, '32205-B', '32205-B'], [25, 0.9843, 2.0472, 13200, 2980, 1.66, -7.6, '33205', '33205'],
    [25, 0.9843, 2.4409, 13000, 2930, 1.95, -5.1, '30305', '30305'], [25, 0.9843, 2.4409, 17400, 3910, 1.95, -9.7, '32305', '32305'], [25.159, 0.9905, 1.9687, 6990, 1570, 1.45, -2.8, '07096', '07196'],
    [25.4, 1.0000, 1.9687, 6990, 1570, 1.45, -2.8, '07100', '07196'], [25.4, 1.0000, 1.9687, 6990, 1570, 1.45, -2.8, '07100-S', '07196'], [25.4, 1.0000, 1.9800, 7210, 1620, 1.56, -3.3, 'L44642', 'L44610'],
    [25.4, 1.0000, 1.9800, 7210, 1620, 1.56, -3.3, 'L44643', 'L44610'], [25.4, 1.0000, 2.0470, 6990, 1570, 1.45, -2.8, '07100', '07204'], [25.4, 1.0000, 2.2400, 10900, 2450, 1.90, -6.9, '1780', '1729'],
    [25.4, 1.0000, 2.2500, 11700, 2620, 1.07, -3.0, 'M84548', 'M84510'], [25.4, 1.0000, 2.3125, 11600, 2610, 1.77, -5.8, '1986', '1932'], [25.4, 1.0000, 2.3437, 13900, 3140, 1.07, -5.1, 'M84249', 'M84210'],
    [25.4, 1.0000, 2.3750, 11000, 2480, 1.69, -5.1, '15578', '15523'], [25.4, 1.0000, 2.4375, 12100, 2730, 1.67, -5.8, '15101', '15243'], [25.4, 1.0000, 2.4409, 12100, 2730, 1.67, -5.8, '15100', '15245'],
    [25.4, 1.0000, 2.4409, 12100, 2730, 1.67, -5.8, '15101', '15245'], [25.4, 1.0000, 2.4409, 12100, 2730, 1.67, -5.8, '15102', '15245'], [25.4, 1.0000, 2.4409, 12100, 2730, 1.67, -5.8, '15101', '15244'],
    [25.4, 1.0000, 2.5000, 12100, 2730, 1.67, -5.8, '15101', '15250'], [25.4, 1.0000, 2.5312, 14500, 3250, 1.07, -3.3, 'M86643', 'M86610'], [25.4, 1.0000, 2.5625, 13100, 2950, 0.80, -2.3, '23100', '23256'],
    [25.4, 1.0000, 2.6150, 18400, 4140, 2.30, -9.4, '2687', '2631'], [25.4, 1.0000, 2.6875, 15300, 3440, 1.40, -5.1, '02473', '02420'], [25.4, 1.0000, 2.8438, 18400, 4140, 1.07, -4.6, 'HM88630', 'HM88610'],
    [25.4, 1.0000, 2.8593, 22700, 5110, 1.76, -10.2, '3189', '3120'], [26.157, 1.0298, 2.4409, 12100, 2730, 1.67, -5.8, '15103', '15245'], [26.162, 1.0300, 2.4843, 18400, 4140, 2.30, -9.4, '2682', '2630'],
    [26.975, 1.0620, 2.3125, 11600, 2610, 1.77, -5.8, '1987', '1932'], [26.988, 1.0625, 1.9800, 7210, 1620, 1.56, -3.3, 'L44649', 'L44610'], [26.988, 1.0625, 2.3750, 11000, 2480, 1.69, -5.1, '15580', '15523'],
    [26.988, 1.0625, 2.4409, 12100, 2730, 1.67, -5.8, '15106', '15245'], [26.988, 1.0625, 2.6150, 18400, 4140, 2.30, -9.4, '2688', '2631'], [28.575, 1.1250, 2.2400, 11600, 2610, 1.77, -5.8, '1985', '1930'],
    [28.575, 1.1250, 2.2500, 11000, 2480, 1.69, -5.1, '15590', '15520'], [28.575, 1.1250, 2.3125, 11600, 2610, 1.77, -5.8, '1985', '1932'], [28.575, 1.1250, 2.3125, 11600, 2610, 1.77, -5.8, '1988', '1932'],
    [28.575, 1.1250, 2.3750, 11000, 2480, 1.69, -5.1, '15590', '15523']];
  const rate = (v, r) => v.unit === 'lbf' ? r[4] : v.unit === 'kN' ? r[3] / 1000 : r[3];
  // pick = smallest rating >= required among bores >= shaft (ties: first listed)
  function selTab(v, req, d, ids, side) {
    if (!(req > 0)) return '';
    const all = F1115.filter(r => !(d > 0) || r[1] >= d - 1e-4).sort((a, b) => rate(v, a) - rate(v, b));
    const k = all.findIndex(r => rate(v, r) >= req);
    const lo = Math.max(0, (k < 0 ? all.length : k) - 2), rows = all.slice(lo, lo + 5).map((r, i) => ({
      cells: [r[7] + ' / ' + r[8], r[0] + ' (' + r[1].toFixed(4) + ')', r[2].toFixed(4), H.fmt(rate(v, r), 5), H.fmt(rate(v, r) / req, 3), r[5].toFixed(2), r[6]],
      ok: rate(v, r) >= req, pick: lo + i === k, set: { [ids[0]]: r[7] + ' / ' + r[8], [ids[1]]: rate(v, r), [ids[2]]: r[5] } }));
    return H.table(['Cone / cup', 'bore mm (in)', 'OD (in)', 'one-row radial (' + v.unit + ')', 'rating / required', 'K', 'a (mm)'], rows, {
      caption: 'Bearing ' + side + ': Fig. 11-15 rows with rating ≥ ' + H.fmt(req, 5) + ' ' + v.unit + (d > 0 ? ', bore ≥ ' + H.fmt(d) + ' in' : ''),
      note: side === 'A' ? '' : 'Pick = lowest adequate rating whose bore fits the shaft; read its K for the next trial. HW4 P5: 07100/07196 (B) and 15590/15520 (A); Shigley Ex. 11-8 chose 15100/15245 (12 100 N) — any adequate row works if the next trial still passes.' + (k < 0 ? ' <b>No row of this catalogue page is large enough.</b>' : ''),
    });
  }

  window.TOPIC = {
    id: 'tapered_bearings', book: 'shigley',
    title: 'Tapered Roller Bearings',
    subtitle: 'Shigley Ch. 11 Sec. 11-9 · Fizz pp. 101-106 · Timken induced-thrust method',
    sibling: 'tapered_bearings_mott.html',
    intro: 'A radial load on a tapered roller bearing induces a thrust \\(F_i = 0.47F_r/K\\) (Eq. 11-18), so the pair is analysed together; bearing <b>A</b> is the one the external thrust \\(F_{ae}\\) pushes into. ' +
      'Each equivalent load goes through the Timken catalogue-rating equation (\\(x_0\\) = 0, θ = 4.48, b = 1.5, \\(90\\times10^6\\) rev, a = 10/3); <i>K</i> belongs to the chosen bearing, so iterate from <i>K</i> = 1.5 until the same bearing comes up twice (Shigley Ex. 11-8 loaded).',
    example: { unit: 'N', RzA: 1327, RyA: 1717, RzB: 2653, RyB: 53.3, Fae: 1690, nD: 800, LDh: 5000, Rtot: 0.99, nb: 2, af: 1, relEq: 'Eq. 11-10 (1 − R_D)', KA1: 1.5, KB1: 1.5, coneA1: '15100 / 15245', C10Acat1: 12100, KA2: 1.67, coneB1: '15100 / 15245', C10Bcat1: 12100, KB2: 1.67, coneA2: '15100 / 15245', C10Acat2: 12100, KA3: 1.67, coneB2: '15100 / 15245', C10Bcat2: 12100, KB3: 1.67 },

    assumptions: [
      { text: 'Bearing A carries the external axial load: \\(F_{ae}\\) acts toward A (A is squeezed)', src: 'Fizz p.102', var: 'Fae' },
      { text: 'Initial K_A = K_B = 1.5 (0.75 for a steep-angle bearing); replace with the catalogue K and repeat', src: 'Fizz p.102 · Shigley Ex. 11-8', var: 'KA1' },
      { text: 'If an equivalent load comes out below the radial load, use the radial load', src: 'Shigley Sec. 11-9', step: 'fe1' },
      { text: 'Design life from Table 11-4 if not given', src: 'Fizz p.102', var: 'LDh' },
      { text: 'Timken (manufacturer 1) Weibull set: \\(L_{10} = 90\\times10^6\\) rev, x_0 = 0, θ = 4.48, b = 1.5; a = 10/3', src: 'Fizz p.102 · Fizz p.103', var: 'L10' },
      { text: '\\(R_D = R_{\\mathrm{tot}}^{1/n}\\) only when the reliability of the pair is given; otherwise 0.90 each', src: 'Fizz p.103', var: 'Rtot' },
      { text: 'Application factor a_f = 1 unless given (Shigley Ex. 11-8)', src: 'Shigley Ex. 11-8', var: 'af' },
      { text: 'Reliability term \\([\\ln(1/R_D)]^{1/b}\\) (Eq. 11-9); Ex. 11-8 uses \\((1 - R_D)\\) (Eq. 11-10)', src: 'Fizz p.103', var: 'relEq' },
      { text: 'Select on the one-row radial rating; repeat with the new K until the same bearings come up twice', src: 'Fizz p.103 · Fizz p.105', step: 'tr2' },
    ],

    figures: [
      { id: 'fig11-13', ref: 'Figure 11-13', title: 'Tapered roller bearing nomenclature — cone, cup, rollers, cage; effective load centre G and offset a', src: 'figures/shigley/fig11-13.png', page: 618 },
      { id: 'fig11-14', ref: 'Figure 11-14', title: 'Direct vs indirect mounting: effective spread a_e and geometric spread a_g', src: 'figures/shigley/fig11-14.png', page: 618,
        note: 'Reactions act at the effective centres — the shaft FBD span is a_e. Mounted in pairs to locate the shaft axially and set the preload.' },
      { id: 'fig11-16', ref: 'Figure 11-16', title: 'Direct-mounted pair: F_{rA}, F_{rB}, induced thrusts F_{iA}, F_{iB}, external thrust F_{ae}', src: 'figures/shigley/fig11-16.png', page: 621 },
      { id: 'fig11-17', ref: 'Figure 11-17', title: 'Which bearing is "A": the one compressed by the external thrust', src: 'figures/shigley/fig11-17.png', page: 622 },
      { id: 'fig11-15a', ref: 'Figure 11-15 (p. 1)', title: 'Timken catalogue page (TS): bore d, OD D, one-row radial rating (\\(90\\times10^6\\) rev), K, effective centre a, cone/cup', src: 'figures/shigley/fig11-15a.png', page: 619 },
      { id: 'fig11-15b', ref: 'Figure 11-15 (p. 2)', title: 'Timken catalogue page continued (bores to 1.125 in)', src: 'figures/shigley/fig11-15b.png', page: 620 },
      { id: 't11-4', ref: 'Table 11-4', title: 'Bearing-life recommendations (kh)', src: 'figures/shigley/table11-4.png', page: 610 },
      { id: 't11-5', ref: 'Table 11-5', title: 'Load-application factors a_f', src: 'figures/shigley/table11-5.png', page: 610 },
      { id: 't11-6', ref: 'Table 11-6', title: 'Weibull parameters: manufacturer 1 (Timken) \\(90\\times10^6\\) rev, x_0 = 0, θ = 4.48, b = 1.5', src: 'figures/shigley/table11-6.png', page: 634 },
      { id: 'skf-tap', ref: 'SKF table 8.1 (catalogue p.694)', book: 'course', title: 'SKF metric single-row tapered roller bearings, d = 15–32 mm: C, C_0, e, Y (302xx, 322xx …)', src: 'figures/course/skf_tapered_roller_d15_32_p694.png' },
    ],

    sections: [
      { title: 'Inputs', steps: [
        { id: 'loads', title: 'Step 1 — radial loads at A and B, external thrust', fig: ['fig11-16', 'fig11-17', 'fig11-14'],
          formula: 'F_{rA} = \\sqrt{R_{zA}^2 + R_{yA}^2} \\qquad F_{rB} = \\sqrt{R_{zB}^2 + R_{yB}^2}',
          text: 'Reactions from the shaft FBD at the effective load centres (span \\(a_e\\)). Tapered bearings are used in pairs to take thrust both ways and set the axial preload.',
          vars: [
            { id: 'unit', label: 'Force unit', kind: 'choice', type: 'text', default: 'N', options: ['N', 'lbf', 'kN'] },
            { id: 'RzA', symbol: 'R_{zA}', label: 'Reaction at A, first plane', kind: 'input' },
            { id: 'RyA', symbol: 'R_{yA}', label: 'Reaction at A, second plane', kind: 'input' },
            { id: 'FrA', symbol: 'F_{rA}', label: 'Radial load at A', kind: 'input', auto: v => H.has(v, 'RzA', 'RyA') ? Math.hypot(v.RzA, v.RyA) : undefined, hint: 'blank → from the two reactions',
              work: v => H.has(v, 'RzA', 'RyA') ? '\\(F_{rA} = \\sqrt{' + H.fmt(v.RzA) + '^2 + ' + H.fmt(v.RyA) + '^2} = ' + H.fmt(Math.hypot(v.RzA, v.RyA)) + '\\)' : null },
            { id: 'RzB', symbol: 'R_{zB}', label: 'Reaction at B, first plane', kind: 'input' },
            { id: 'RyB', symbol: 'R_{yB}', label: 'Reaction at B, second plane', kind: 'input' },
            { id: 'FrB', symbol: 'F_{rB}', label: 'Radial load at B', kind: 'input', auto: v => H.has(v, 'RzB', 'RyB') ? Math.hypot(v.RzB, v.RyB) : undefined, hint: 'blank → from the two reactions',
              work: v => H.has(v, 'RzB', 'RyB') ? '\\(F_{rB} = \\sqrt{' + H.fmt(v.RzB) + '^2 + ' + H.fmt(v.RyB) + '^2} = ' + H.fmt(Math.hypot(v.RzB, v.RyB)) + '\\)' : null },
            { id: 'Fae', symbol: 'F_{ae}', label: 'External thrust (directed toward A)', kind: 'input', default: 0 },
            { id: 'dA', symbol: 'd_A', label: 'Shaft diameter at A', unit: 'in', kind: 'input', hint: 'optional — bore filter' },
            { id: 'dB', symbol: 'd_B', label: 'Shaft diameter at B', unit: 'in', kind: 'input', hint: 'optional — bore filter' },
          ] },
        { id: 'life', title: 'Steps 4–6 — life, Weibull parameters, reliability, application factor', eq: '11-3', fig: ['t11-4', 't11-6', 't11-5'],
          formula: 'x_D = \\frac{60\\,\\mathcal{L}_D\\, n_D}{L_{10}} \\qquad R_D = \\sqrt[n]{R_{\\mathrm{tot}}}',
          text: 'Ex. 11-8: 5000 h at 800 rev/min → \\(x_D\\) = 2.67; pair reliability 0.99 (n = 2) → \\(R_D = \\sqrt{0.99}\\) each.',
          vars: [
            { id: 'nD', symbol: 'n_D', label: 'Shaft speed', unit: 'rev/min', kind: 'input' },
            { id: 'LDh', symbol: '\\mathcal{L}_D', label: 'Design life', unit: 'h', kind: 'lookup', fig: 't11-4' },
            { id: 'L10', symbol: 'L_{10}', label: 'Rating life (Timken)', unit: 'rev', kind: 'lookup', fig: 't11-6', default: 90e6 },
            { id: 'x0', symbol: 'x_0', label: 'Weibull guaranteed life', unit: '', kind: 'lookup', fig: 't11-6', default: 0 },
            { id: 'th', symbol: '\\theta', label: 'Weibull characteristic parameter', unit: '', kind: 'lookup', fig: 't11-6', default: 4.48 },
            { id: 'b', symbol: 'b', label: 'Weibull shape parameter', unit: '', kind: 'lookup', fig: 't11-6', default: 1.5 },
            { id: 'xD', symbol: 'x_D', label: 'Multiple of rating life', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'LDh', 'nD', 'L10') && v.L10 > 0 ? 60 * v.LDh * v.nD / v.L10 : undefined,
              work: v => v.xD !== undefined ? '\\(x_D = \\dfrac{60(' + H.fmt(v.LDh) + ')(' + H.fmt(v.nD) + ')}{' + H.fmt(v.L10) + '} = ' + H.fmt(v.xD) + '\\)' : null },
            { id: 'Rtot', symbol: 'R_{\\mathrm{tot}}', label: 'Reliability goal (of the pair when n = 2)', unit: '', kind: 'input', default: 0.90 },
            { id: 'nb', symbol: 'n', label: 'Number of bearings sharing that goal', unit: '', kind: 'input', default: 1 },
            { id: 'RD', symbol: 'R_D', label: 'Design reliability per bearing', unit: '', kind: 'calc', digits: 5, compute: v => H.has(v, 'Rtot', 'nb') && v.nb > 0 ? Math.pow(v.Rtot, 1 / v.nb) : undefined },
            { id: 'af', symbol: 'a_f', label: 'Application factor', unit: '', kind: 'lookup', fig: 't11-5', default: 1 },
            { id: 'relEq', label: 'Reliability term', kind: 'choice', type: 'text', default: 'Eq. 11-9 ln(1/R_D)', options: [{ label: 'Eq. 11-9 \\(\\ln(1/R_D)\\)', value: 'Eq. 11-9 ln(1/R_D)' }, { label: 'Eq. 11-10 \\((1 - R_D)\\)', value: 'Eq. 11-10 (1 − R_D)' }] },
            { id: 'brk', symbol: '[\;]^{3/10}', label: 'Life bracket (same every trial)', unit: '', kind: 'calc', digits: 4, compute: v => bracket(v) !== undefined ? Math.pow(bracket(v), 0.3) : undefined },
          ] },
      ] },

      { title: 'Trial 1 (K_A = K_B = 1.5)', steps: [
        { id: 'fi1', title: 'Step 2 — induced thrusts', eq: '11-18', formula: 'F_{iA} = \\frac{0.47 F_{rA}}{K_A} \\qquad F_{iB} = \\frac{0.47 F_{rB}}{K_B}',
          text: 'K = radial rating / thrust rating of the bearing.',
          vars: [
            { id: 'KA1', symbol: 'K_A', label: 'K for bearing A (trial)', unit: '', kind: 'lookup', fig: 'fig11-15a', default: 1.5 },
            { id: 'KB1', symbol: 'K_B', label: 'K for bearing B (trial)', unit: '', kind: 'lookup', fig: 'fig11-15a', default: 1.5 },
            { id: 'FiA1', symbol: 'F_{iA}', label: 'Induced thrust at A', kind: 'calc', digits: 4, compute: v => { const r = eq(v, v.KA1, v.KB1); return r && r.FiA; },
              work: v => v.FiA1 !== undefined ? '\\(F_{iA} = \\dfrac{0.47(' + H.fmt(v.FrA) + ')}{' + H.fmt(v.KA1) + '} = ' + H.fmt(v.FiA1) + '\\)' : null },
            { id: 'FiB1', symbol: 'F_{iB}', label: 'Induced thrust at B', kind: 'calc', digits: 4, compute: v => { const r = eq(v, v.KA1, v.KB1); return r && r.FiB; },
              work: v => v.FiB1 !== undefined ? '\\(F_{iB} = \\dfrac{0.47(' + H.fmt(v.FrB) + ')}{' + H.fmt(v.KB1) + '} = ' + H.fmt(v.FiB1) + '\\)' : null },
          ] },
        { id: 'fe1', title: 'Step 3 — equivalent radial loads', eq: '11-19 / 11-20', fig: ['fig11-16'],
          formula: '\\text{If } F_{iA} \\le F_{iB} + F_{ae}:\; F_{eA} = 0.4F_{rA} + K_A(F_{iB} + F_{ae}),\; F_{eB} = F_{rB} \\qquad \\text{else } F_{eB} = 0.4F_{rB} + K_B(F_{iA} - F_{ae}),\; F_{eA} = F_{rA}',
          vars: [
            { id: 'case1', label: 'Which bearing carries the net thrust', kind: 'calc', compute: v => { const r = eq(v, v.KA1, v.KB1); return r ? (r.caseA ? 'A — Eq. 11-19' : 'B — Eq. 11-20') : undefined; } },
            { id: 'FeA1', symbol: 'F_{eA}', label: 'Equivalent load at A', kind: 'calc', digits: 4, compute: v => { const r = eq(v, v.KA1, v.KB1); return r && r.FeA; },
              work: v => { const r = eq(v, v.KA1, v.KB1); if (!r) return null; return r.caseA ? '\\(F_{eA} = 0.4(' + H.fmt(v.FrA) + ') + ' + H.fmt(v.KA1) + '(' + H.fmt(r.FiB) + ' + ' + H.fmt(v.Fae) + ') = ' + H.fmt(r.FeA) + '\\)' : '\\(F_{eA} = F_{rA} = ' + H.fmt(r.FeA) + '\\)'; } },
            { id: 'FeB1', symbol: 'F_{eB}', label: 'Equivalent load at B', kind: 'calc', digits: 4, compute: v => { const r = eq(v, v.KA1, v.KB1); return r && r.FeB; },
              work: v => { const r = eq(v, v.KA1, v.KB1); if (!r) return null; return r.caseA ? '\\(F_{eB} = F_{rB} = ' + H.fmt(r.FeB) + '\\)' : '\\(F_{eB} = 0.4(' + H.fmt(v.FrB) + ') + ' + H.fmt(v.KB1) + '(' + H.fmt(r.FiA) + ' - ' + H.fmt(v.Fae) + ') = ' + H.fmt(r.FeB) + '\\)'; } },
          ] },
        { id: 'c101', title: 'Steps 7–8 — required C_10 and tentative bearings', eq: '11-9', fig: ['fig11-15a', 'fig11-15b', 'fig11-13'],
          formula: 'C_{10} = a_f F_e \\left[\\frac{x_D}{x_0 + (\\theta - x_0)[\\ln(1/R_D)]^{1/b}}\\right]^{3/10}',
          text: 'Pick from the tables (★) or Fig. 11-15: one-row radial rating ≥ \\(C_{10}\\), bore ≥ shaft; note its K.',
          vars: [
            { id: 'C10A1', symbol: 'C_{10,A}', label: 'Required rating, bearing A', kind: 'calc', digits: 5, compute: v => c10(v, v.FeA1),
              work: v => v.C10A1 !== undefined ? '\\(C_{10,A} = ' + H.fmt(v.af) + '(' + H.fmt(v.FeA1) + ')(' + H.fmt(v.brk) + ') = ' + H.fmt(v.C10A1, 5) + '\\ \\text{' + v.unit + '}\\)' : null },
            { id: 'coneA1', label: 'Bearing A: cone / cup', kind: 'input', type: 'text', hint: 'e.g. 15100 / 15245' },
            { id: 'C10Acat1', symbol: 'C_{10,\\mathrm{cat}}', label: 'Catalogue rating, A', kind: 'lookup', fig: 'fig11-15a', check: v => (H.has(v, 'C10Acat1', 'C10A1') && v.C10Acat1 < v.C10A1) ? 'Below required C_10' : null },
            { id: 'KA2', symbol: 'K_A', label: 'K of bearing A', unit: '', kind: 'lookup', fig: 'fig11-15a' },
            { id: 'C10B1', symbol: 'C_{10,B}', label: 'Required rating, bearing B', kind: 'calc', digits: 5, compute: v => c10(v, v.FeB1),
              work: v => v.C10B1 !== undefined ? '\\(C_{10,B} = ' + H.fmt(v.af) + '(' + H.fmt(v.FeB1) + ')(' + H.fmt(v.brk) + ') = ' + H.fmt(v.C10B1, 5) + '\\ \\text{' + v.unit + '}\\)' : null },
            { id: 'coneB1', label: 'Bearing B: cone / cup', kind: 'input', type: 'text' },
            { id: 'C10Bcat1', symbol: 'C_{10,\\mathrm{cat}}', label: 'Catalogue rating, B', kind: 'lookup', fig: 'fig11-15a', check: v => (H.has(v, 'C10Bcat1', 'C10B1') && v.C10Bcat1 < v.C10B1) ? 'Below required C_10' : null },
            { id: 'KB2', symbol: 'K_B', label: 'K of bearing B', unit: '', kind: 'lookup', fig: 'fig11-15a' },
          ],
          after: v => selTab(v, v.C10A1, v.dA, ['coneA1', 'C10Acat1', 'KA2'], 'A') + selTab(v, v.C10B1, v.dB, ['coneB1', 'C10Bcat1', 'KB2'], 'B') +
            (!H.has(v, 'KA2', 'KB2') ? '' : (v.KA2 === v.KA1 && v.KB2 === v.KB1) ? '<span class="result-ok">K unchanged — converged.</span>' : '<span class="result-ok">K changed — repeat in Trial 2.</span>') },
      ] },

      { title: 'Trial 2 (K from the selected bearings)', steps: [
        { id: 'tr2', title: 'Step 9 — repeat with the catalogue K values', eq: '11-18 .. 11-20', fig: ['fig11-15a'], when: v => H.has(v, 'KA2', 'KB2'),
          formula: 'C_{10,\\mathrm{new}} = \\frac{F_{e,new}}{F_{e,old}}\\,C_{10,\\mathrm{old}}',
          vars: [
            { id: 'FiA2', symbol: 'F_{iA}', label: 'Induced thrust at A', kind: 'calc', digits: 4, compute: v => { const r = eq(v, v.KA2, v.KB2); return r && r.FiA; } },
            { id: 'FiB2', symbol: 'F_{iB}', label: 'Induced thrust at B', kind: 'calc', digits: 4, compute: v => { const r = eq(v, v.KA2, v.KB2); return r && r.FiB; } },
            { id: 'case2', label: 'Net thrust carried by', kind: 'calc', compute: v => { const r = eq(v, v.KA2, v.KB2); return r ? (r.caseA ? 'A — Eq. 11-19' : 'B — Eq. 11-20') : undefined; } },
            { id: 'FeA2', symbol: 'F_{eA}', label: 'Equivalent load at A', kind: 'calc', digits: 4, compute: v => { const r = eq(v, v.KA2, v.KB2); return r && r.FeA; },
              work: v => { const r = eq(v, v.KA2, v.KB2); if (!r) return null; return r.caseA ? '\\(F_{eA} = 0.4(' + H.fmt(v.FrA) + ') + ' + H.fmt(v.KA2) + '(' + H.fmt(r.FiB) + ' + ' + H.fmt(v.Fae) + ') = ' + H.fmt(r.FeA) + '\\)' : '\\(F_{eA} = F_{rA} = ' + H.fmt(r.FeA) + '\\)'; } },
            { id: 'FeB2', symbol: 'F_{eB}', label: 'Equivalent load at B', kind: 'calc', digits: 4, compute: v => { const r = eq(v, v.KA2, v.KB2); return r && r.FeB; } },
            { id: 'C10A2', symbol: 'C_{10,A}', label: 'Required rating, A', kind: 'calc', digits: 5, compute: v => c10(v, v.FeA2),
              work: v => H.has(v, 'FeA2', 'FeA1', 'C10A1') && v.FeA1 > 0 ? '\\(C_{10,A} = \\dfrac{' + H.fmt(v.FeA2) + '}{' + H.fmt(v.FeA1) + '}(' + H.fmt(v.C10A1, 5) + ') = ' + H.fmt(v.C10A2, 5) + '\\)' : null },
            { id: 'C10B2', symbol: 'C_{10,B}', label: 'Required rating, B', kind: 'calc', digits: 5, compute: v => c10(v, v.FeB2) },
            { id: 'coneA2', label: 'Bearing A selected now', kind: 'input', type: 'text' },
            { id: 'C10Acat2', symbol: 'C_{10,\\mathrm{cat}}', label: 'Catalogue rating, A', kind: 'lookup', fig: 'fig11-15a' },
            { id: 'KA3', symbol: 'K_A', label: 'Its K', unit: '', kind: 'lookup', fig: 'fig11-15a' },
            { id: 'coneB2', label: 'Bearing B selected now', kind: 'input', type: 'text' },
            { id: 'C10Bcat2', symbol: 'C_{10,\\mathrm{cat}}', label: 'Catalogue rating, B', kind: 'lookup', fig: 'fig11-15a' },
            { id: 'KB3', symbol: 'K_B', label: 'Its K', unit: '', kind: 'lookup', fig: 'fig11-15a' },
          ],
          after: v => {
            const tabs = selTab(v, v.C10A2, v.dA, ['coneA2', 'C10Acat2', 'KA3'], 'A') + selTab(v, v.C10B2, v.dB, ['coneB2', 'C10Bcat2', 'KB3'], 'B');
            if (!H.has(v, 'KA3', 'KB3', 'C10A2', 'C10B2', 'C10Acat2', 'C10Bcat2')) return tabs;
            const same = v.KA3 === v.KA2 && v.KB3 === v.KB2;
            const okA = v.C10Acat2 >= v.C10A2, okB = v.C10Bcat2 >= v.C10B2;
            if (same && okA && okB) return tabs + '<span class="result-ok">Same bearings twice → converged ✔</span>';
            if (same && !okA) return tabs + '<span class="result-ok">Same bearing, A slightly under-rated (' + H.fmt(v.C10Acat2, 5) + ' &lt; ' + H.fmt(v.C10A2, 5) + ') — Ex. 11-8 keeps it because the pair reliability still meets the goal (below).</span>';
            return tabs + '<span class="result-bad">K changed again — copy K_A, K_B into Trial 1 and repeat.</span>';
          } },
      ] },

      { title: 'Result', steps: [
        { id: 'res', title: 'Reliability check of the pair (Sec. 11-10)', eq: '11-23', fig: ['fig11-13', 'skf-tap'],
          formula: 'R = \\exp\\left\\{-\\left[\\frac{x_D}{4.48\\,[C_{10}/(a_f F_D)]^{10/3}}\\right]^{3/2}\\right\\} \\qquad R_{\\mathrm{pair}} = R_A R_B',
          text: 'Also note each bearing\'s effective-centre offset <i>a</i>: shoulder-to-shoulder = \\(a_e - 2a\\) (Ex. 11-8: 150 − 2(5.8) = 138.4 mm).',
          vars: [
            { id: 'RA', symbol: 'R_A', label: 'Reliability of bearing A', unit: '', kind: 'calc', digits: 6, compute: v => R24(v, v.C10Acat2 !== undefined ? v.C10Acat2 : v.C10Acat1, v.FeA2 !== undefined ? v.FeA2 : v.FeA1) },
            { id: 'RB', symbol: 'R_B', label: 'Reliability of bearing B', unit: '', kind: 'calc', digits: 6, compute: v => R24(v, v.C10Bcat2 !== undefined ? v.C10Bcat2 : v.C10Bcat1, v.FeB2 !== undefined ? v.FeB2 : v.FeB1) },
            { id: 'Rp', symbol: 'R', label: 'Reliability of the pair', unit: '', kind: 'calc', digits: 6, compute: v => H.has(v, 'RA', 'RB') ? v.RA * v.RB : undefined },
            { id: 'Rgoal', symbol: 'R_{\\mathrm{goal}}', label: 'Pair goal R_D^2', unit: '', kind: 'calc', digits: 6, compute: v => v.RD !== undefined ? v.RD * v.RD : undefined },
          ],
          after: v => !H.has(v, 'Rp', 'Rgoal') ? '' : v.Rp >= v.Rgoal - 1e-9 ? '<span class="result-ok">R = ' + H.fmt(v.Rp, 6) + ' ≥ goal ' + H.fmt(v.Rgoal, 4) + ' ✔ — A: ' + (v.coneA2 || v.coneA1 || '') + ', B: ' + (v.coneB2 || v.coneB1 || '') + '</span>' : '<span class="result-bad">R = ' + H.fmt(v.Rp, 6) + ' &lt; goal ' + H.fmt(v.Rgoal, 4) + ' — next larger bearing on the heavily loaded side.</span>' },
      ] },
    ],
  };
})();
