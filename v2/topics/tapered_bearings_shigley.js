/* Tapered roller bearings — Shigley 11e Ch. 11 Sec. 11-9 (Timken method).
 * Procedure: Fizz bible pp. 101-106 (K iteration). Mech bible unit 4 (PDF p. 129) is empty.
 * Verified against: Shigley Ex. 11-8 (FrA = 2170 N, FrB = 2654 N, Fae = 1690 N, 800 rev/min, 5000 h, pair R = 0.99, af = 1, Eq. 11-10):
 *   trial 1 (K = 1.5): FiA = 680, FiB = 832, FeA = 4651 N, xD = 2.67, C10A = 11 486 (11 478 with exact sqrt 0.99), C10B = 6554 -> 15100/15245 (K = 1.67, 12 100 N);
 *   trial 2: FeA = 4938 N, C10A = 12 195 N (kept, pair R = 0.9946 >= 0.99). */
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
    // never less than the original radial load
    FeA = Math.max(FeA, v.FrA); FeB = Math.max(FeB, v.FrB);
    return { FiA, FiB, FeA, FeB, caseA };
  }
  const R24 = (v, C10, FD) => H.has(v, 'xD', 'af', 'th', 'b') && C10 > 0 && FD > 0 ? Math.exp(-Math.pow(v.xD / (v.th * Math.pow(C10 / (v.af * FD), 10 / 3)), v.b)) : undefined;

  window.TOPIC = {
    id: 'tapered_bearings', book: 'shigley',
    title: 'Tapered Roller Bearings',
    subtitle: 'Shigley Ch. 11 Sec. 11-9 · Fizz pp. 101-106 · Timken induced-thrust method',
    sibling: 'tapered_bearings_mott.html',
    intro: 'A radial load on a tapered roller bearing induces a thrust <i>F<sub>i</sub> = 0.47F<sub>r</sub>/K</i> (Eq. 11-18), so the pair must be analysed together. ' +
      'Label the bearing that is squeezed by the external thrust <i>F<sub>ae</sub></i> as <b>A</b> (Fig. 11-16/11-17); if <i>F<sub>iA</sub> ≤ F<sub>iB</sub> + F<sub>ae</sub></i> bearing A carries the net thrust (Eq. 11-19), otherwise B does (Eq. 11-20). ' +
      'Each equivalent load goes through the Weibull catalogue-rating equation with Timken\'s parameters (<i>x<sub>0</sub></i> = 0, θ = 4.48, b = 1.5, rating life 90×10⁶ rev, a = 10/3), the cup/cone is picked from the catalogue page (Fig. 11-15), ' +
      'and because <i>K</i> belongs to the chosen bearing the Fizz bible iterates from <i>K</i> = 1.5 until the same bearing is selected twice. Shigley Ex. 11-8 is the loaded example.',
    example: { unit: 'N', RzA: 1327, RyA: 1717, RzB: 2653, RyB: 53.3, Fae: 1690, nD: 800, LDh: 5000, Rtot: 0.99, nb: 2, af: 1, relEq: 'Eq. 11-10 (1 − R_D)', KA1: 1.5, KB1: 1.5, coneA1: '15100 / 15245', C10Acat1: 12100, KA2: 1.67, coneB1: '15100 / 15245', C10Bcat1: 12100, KB2: 1.67, coneA2: '15100 / 15245', C10Acat2: 12100, KA3: 1.67, coneB2: '15100 / 15245', C10Bcat2: 12100, KB3: 1.67 },

    assumptions: [
      { text: 'Bearing A is the one that carries the external axial load: F_{ae} = F_a acts toward A', src: 'Fizz p.102' },
      { text: 'Initial K_A = K_B = 1.5 for the induced loads F_i = 0.47F_r/K (0.75 for a steep-angle bearing); replace with the catalogue K and repeat', src: 'Fizz p.102 · Shigley Ex. 11-8', var: 'KA1' },
      { text: 'If an equivalent load comes out below the radial load, use the radial load', src: 'Shigley Sec. 11-9' },
      { text: 'Design life from Table 11-4 if not given', src: 'Fizz p.102', var: 'LDh' },
      { text: 'Timken (manufacturer 1) Weibull set for tapered rollers: L_{10} = 90×10^6 rev, x_0 = 0, θ = 4.48, b = 1.5', src: 'Fizz p.102 · Fizz p.103', var: 'L10' },
      { text: 'R_D = (R_{tot})^{1/n} only when the reliability of the bearing set is given; otherwise each bearing at 0.90', src: 'Fizz p.103', var: 'RD' },
      { text: 'Load-life exponent a = 10/3 for tapered roller bearings', src: 'Fizz p.103' },
      { text: 'Application factor a_f = 1 unless the question or Table 11-5 says otherwise (Shigley Ex. 11-8)', src: 'Shigley Ex. 11-8', var: 'af' },
      { text: 'Reliability term [ln(1/R_D)]^{1/b} as Fizz writes it (Eq. 11-9); Shigley Ex. 11-8 uses (1 − R_D) (Eq. 11-10)', src: 'Fizz p.103', var: 'relEq' },
      { text: 'Select on the one-row radial rating; repeat with the new K values until the same bearings come up twice in a row', src: 'Fizz p.103 · Fizz p.105' },
    ],

    figures: [
      { id: 'fig11-13', ref: 'Figure 11-13', title: 'Nomenclature of a tapered roller bearing — cone, cup, rollers, cage; G = effective load centre, a = its offset', src: 'figures/shigley/fig11-13.png', page: 618 },
      { id: 'fig11-14', ref: 'Figure 11-14', title: 'Direct vs indirect mounting: effective spread ae and geometric spread ag', src: 'figures/shigley/fig11-14.png', page: 618,
        note: 'Direct mounting: cone backs face each other (wider ag). Indirect: cone fronts face each other. Reactions act at A0, B0 — the span for the shaft FBD is ae.' },
      { id: 'fig11-16', ref: 'Figure 11-16', title: 'Direct-mounted pair showing FrA, FrB, induced thrusts FiA, FiB and external thrust Fae', src: 'figures/shigley/fig11-16.png', page: 621 },
      { id: 'fig11-17', ref: 'Figure 11-17', title: 'Which bearing is "A": the one compressed by the external thrust (rotating shaft vs rotating housing)', src: 'figures/shigley/fig11-17.png', page: 622 },
      { id: 'fig11-15a', ref: 'Figure 11-15 (p. 1)', title: 'Timken catalogue page — single-row straight bore (TS): bore d, OD D, width T, C10 (one-row radial 90×10⁶ rev), thrust rating, K, effective centre a, cone/cup numbers', src: 'figures/shigley/fig11-15a.png', page: 619,
        note: 'Select by the "one-row radial" rating ≥ required C10 (N or lbf columns) and read K and a for the next iteration.' },
      { id: 'fig11-15b', ref: 'Figure 11-15 (p. 2)', title: 'Timken catalogue page continued (larger bores)', src: 'figures/shigley/fig11-15b.png', page: 620 },
      { id: 't11-4', ref: 'Table 11-4', title: 'Bearing-life recommendations (kh)', src: 'figures/shigley/table11-4.png', page: 610 },
      { id: 't11-5', ref: 'Table 11-5', title: 'Load-application factors af', src: 'figures/shigley/table11-5.png', page: 610 },
      { id: 't11-6', ref: 'Table 11-6', title: 'Weibull parameters: manufacturer 1 (Timken) 90×10⁶ rev, x0 = 0, θ = 4.48, b = 1.5', src: 'figures/shigley/table11-6.png', page: 634 },
      { id: 'skf-tap', ref: 'SKF table 8.1 (catalogue p.694)', book: 'course', title: 'SKF metric single-row tapered roller bearings, d = 15–32 mm: dimensions, C, C_0, P_u, e, Y, Y_0 (302xx, 322xx …)', src: 'figures/course/skf_tapered_roller_d15_32_p694.png', note: 'SKF Bearing Catalogue.pdf p.696 (printed 694). Example page only (one bore range); the product tables continue over the neighbouring pages of the catalogue. Course textbook tables remain the primary source.' },
    ],

    sections: [
      { title: 'Inputs', steps: [
        { id: 'loads', title: 'Step 1 — radial loads at A and B, external thrust', fig: ['fig11-16', 'fig11-17', 'fig11-14'],
          formula: 'F_{rA} = \\sqrt{R_{zA}^2 + R_{yA}^2} \\qquad F_{rB} = \\sqrt{R_{zB}^2 + R_{yB}^2}',
          text: 'Reactions from the shaft FBD, taken at the effective load centres (span = <i>a<sub>e</sub></i>, Fig. 11-14). Bearing <b>A</b> is the one the external thrust pushes <i>into</i> (squeezed); Fizz: "assume bearing A carries the axial load, F<sub>ae</sub> = F<sub>a</sub>".',
          vars: [
            { id: 'unit', label: 'Force unit', kind: 'choice', type: 'text', default: 'N', options: ['N', 'lbf', 'kN'] },
            { id: 'RzA', symbol: 'R_{zA}', label: 'Reaction at A, first plane', kind: 'input' },
            { id: 'RyA', symbol: 'R_{yA}', label: 'Reaction at A, second plane', kind: 'input' },
            { id: 'FrA', symbol: 'F_{rA}', label: 'Radial load at A', kind: 'input', auto: v => H.has(v, 'RzA', 'RyA') ? Math.hypot(v.RzA, v.RyA) : undefined, hint: 'auto = √(RzA² + RyA²), or type it',
              work: v => H.has(v, 'RzA', 'RyA') ? '\\(F_{rA} = \\sqrt{' + H.fmt(v.RzA) + '^2 + ' + H.fmt(v.RyA) + '^2} = ' + H.fmt(Math.hypot(v.RzA, v.RyA)) + '\\)' : null },
            { id: 'RzB', symbol: 'R_{zB}', label: 'Reaction at B, first plane', kind: 'input' },
            { id: 'RyB', symbol: 'R_{yB}', label: 'Reaction at B, second plane', kind: 'input' },
            { id: 'FrB', symbol: 'F_{rB}', label: 'Radial load at B', kind: 'input', auto: v => H.has(v, 'RzB', 'RyB') ? Math.hypot(v.RzB, v.RyB) : undefined, hint: 'auto = √(RzB² + RyB²)',
              work: v => H.has(v, 'RzB', 'RyB') ? '\\(F_{rB} = \\sqrt{' + H.fmt(v.RzB) + '^2 + ' + H.fmt(v.RyB) + '^2} = ' + H.fmt(Math.hypot(v.RzB, v.RyB)) + '\\)' : null },
            { id: 'Fae', symbol: 'F_{ae}', label: 'External thrust (directed toward A)', kind: 'input', default: 0 },
          ] },
        { id: 'life', title: 'Steps 4–6 — life, Weibull parameters, reliability, application factor', eq: '11-3', fig: ['t11-4', 't11-6', 't11-5'],
          formula: 'x_D = \\frac{60\\,\\mathcal{L}_D\\, n_D}{L_{10}} \\qquad R_D = \\sqrt[n]{R_{tot}}',
          text: 'Timken (manufacturer 1) rates at 90×10⁶ revolutions. Ex. 11-8: 5000 h at 800 rev/min → x<sub>D</sub> = 2.67; pair reliability 0.99 (n = 2) → R<sub>D</sub> = √0.99 = 0.995 each. With no reliability given each bearing is designed at 0.90 (n = 1).',
          vars: [
            { id: 'nD', symbol: 'n_D', label: 'Shaft speed', unit: 'rev/min', kind: 'input' },
            { id: 'LDh', symbol: '\\mathcal{L}_D', label: 'Design life', unit: 'h', kind: 'lookup', fig: 't11-4' },
            { id: 'L10', symbol: 'L_{10}', label: 'Rating life (Timken 90×10⁶)', unit: 'rev', kind: 'lookup', fig: 't11-6', default: 90e6 },
            { id: 'x0', symbol: 'x_0', label: 'Weibull x0', unit: '', kind: 'lookup', fig: 't11-6', default: 0 },
            { id: 'th', symbol: '\\theta', label: 'Weibull θ', unit: '', kind: 'lookup', fig: 't11-6', default: 4.48 },
            { id: 'b', symbol: 'b', label: 'Weibull b', unit: '', kind: 'lookup', fig: 't11-6', default: 1.5 },
            { id: 'xD', symbol: 'x_D', label: 'Multiple of rating life', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'LDh', 'nD', 'L10') && v.L10 > 0 ? 60 * v.LDh * v.nD / v.L10 : undefined,
              work: v => v.xD !== undefined ? '\\(x_D = \\dfrac{60(' + H.fmt(v.LDh) + ')(' + H.fmt(v.nD) + ')}{' + H.fmt(v.L10) + '} = ' + H.fmt(v.xD) + '\\)' : null },
            { id: 'Rtot', symbol: 'R_{tot}', label: 'Reliability goal (of the whole set when n ≥ 2)', unit: '', kind: 'input', default: 0.90, hint: '0.90 (catalogue) per bearing if none is given' },
            { id: 'nb', symbol: 'n', label: 'Number of bearings sharing that goal', unit: '', kind: 'input', default: 1, hint: 'enter 2 when the reliability is given for the pair (Ex. 11-8)' },
            { id: 'RD', symbol: 'R_D', label: 'Design reliability per bearing', unit: '', kind: 'calc', digits: 5, compute: v => H.has(v, 'Rtot', 'nb') && v.nb > 0 ? Math.pow(v.Rtot, 1 / v.nb) : undefined },
            { id: 'af', symbol: 'a_f', label: 'Application factor', unit: '', kind: 'lookup', fig: 't11-5', default: 1 },
            { id: 'relEq', label: 'Reliability term', kind: 'choice', type: 'text', default: 'Eq. 11-9 ln(1/R_D)', options: ['Eq. 11-9 ln(1/R_D)', 'Eq. 11-10 (1 − R_D)'] },
            { id: 'brk', label: 'Bracket [xD / (x0 + (θ−x0)[…]^{1/b})]^{3/10}', unit: '', kind: 'calc', digits: 4, compute: v => bracket(v) !== undefined ? Math.pow(bracket(v), 0.3) : undefined,
              hint: 'identical in every iteration — compute once (Shigley note after Ex. 11-8)' },
          ] },
      ] },

      { title: 'Trial 1 (KA = KB = 1.5)', steps: [
        { id: 'fi1', title: 'Step 2 — induced thrusts', eq: '11-18', formula: 'F_{iA} = \\frac{0.47 F_{rA}}{K_A} \\qquad F_{iB} = \\frac{0.47 F_{rB}}{K_B}',
          text: 'K = radial rating / thrust rating of the bearing. First guess 1.5 for a radial (standard-angle) bearing, 0.75 for a steep-angle bearing.',
          vars: [
            { id: 'KA1', symbol: 'K_A', label: 'K for bearing A (trial)', unit: '', kind: 'lookup', fig: 'fig11-15a', default: 1.5 },
            { id: 'KB1', symbol: 'K_B', label: 'K for bearing B (trial)', unit: '', kind: 'lookup', fig: 'fig11-15a', default: 1.5 },
            { id: 'FiA1', symbol: 'F_{iA}', label: 'Induced thrust at A', kind: 'calc', digits: 4, compute: v => { const r = eq(v, v.KA1, v.KB1); return r && r.FiA; },
              work: v => v.FiA1 !== undefined ? '\\(F_{iA} = \\dfrac{0.47(' + H.fmt(v.FrA) + ')}{' + H.fmt(v.KA1) + '} = ' + H.fmt(v.FiA1) + '\\)' : null },
            { id: 'FiB1', symbol: 'F_{iB}', label: 'Induced thrust at B', kind: 'calc', digits: 4, compute: v => { const r = eq(v, v.KA1, v.KB1); return r && r.FiB; },
              work: v => v.FiB1 !== undefined ? '\\(F_{iB} = \\dfrac{0.47(' + H.fmt(v.FrB) + ')}{' + H.fmt(v.KB1) + '} = ' + H.fmt(v.FiB1) + '\\)' : null },
          ] },
        { id: 'fe1', title: 'Step 3 — equivalent radial loads', eq: '11-19 / 11-20', fig: ['fig11-16'],
          formula: '\\text{If } F_{iA} \\le F_{iB} + F_{ae}:\\; F_{eA} = 0.4F_{rA} + K_A(F_{iB} + F_{ae}),\\; F_{eB} = F_{rB} \\qquad \\text{else } F_{eB} = 0.4F_{rB} + K_B(F_{iA} - F_{ae}),\\; F_{eA} = F_{rA}',
          text: 'Timken: X = 0.4, V = 1, Y = K. If an equivalent load comes out below the original radial load, use the radial load.',
          vars: [
            { id: 'case1', label: 'Which bearing carries the net thrust', kind: 'calc', compute: v => { const r = eq(v, v.KA1, v.KB1); return r ? (r.caseA ? 'A  (FiA ≤ FiB + Fae → Eq. 11-19)' : 'B  (FiA > FiB + Fae → Eq. 11-20)') : undefined; } },
            { id: 'FeA1', symbol: 'F_{eA}', label: 'Equivalent load at A', kind: 'calc', digits: 4, compute: v => { const r = eq(v, v.KA1, v.KB1); return r && r.FeA; },
              work: v => { const r = eq(v, v.KA1, v.KB1); if (!r) return null; return r.caseA ? '\\(F_{eA} = 0.4(' + H.fmt(v.FrA) + ') + ' + H.fmt(v.KA1) + '(' + H.fmt(r.FiB) + ' + ' + H.fmt(v.Fae) + ') = ' + H.fmt(r.FeA) + '\\)' : '\\(F_{eA} = F_{rA} = ' + H.fmt(r.FeA) + '\\)'; } },
            { id: 'FeB1', symbol: 'F_{eB}', label: 'Equivalent load at B', kind: 'calc', digits: 4, compute: v => { const r = eq(v, v.KA1, v.KB1); return r && r.FeB; },
              work: v => { const r = eq(v, v.KA1, v.KB1); if (!r) return null; return r.caseA ? '\\(F_{eB} = F_{rB} = ' + H.fmt(r.FeB) + '\\)' : '\\(F_{eB} = 0.4(' + H.fmt(v.FrB) + ') + ' + H.fmt(v.KB1) + '(' + H.fmt(r.FiA) + ' - ' + H.fmt(v.Fae) + ') = ' + H.fmt(r.FeB) + '\\)'; } },
          ] },
        { id: 'c101', title: 'Steps 7–8 — required C10 and tentative bearings', eq: '11-9', fig: ['fig11-15a', 'fig11-15b', 'fig11-13'],
          formula: 'C_{10} = a_f F_e \\left[\\frac{x_D}{x_0 + (\\theta - x_0)[\\ln(1/R_D)]^{1/b}}\\right]^{3/10}',
          text: 'a = 10/3 for tapered rollers. Enter the catalogue page in the same force unit as above (Fig. 11-15 lists both N and lbf). Pick a cone/cup whose one-row radial rating ≥ C10 and note its K.',
          vars: [
            { id: 'C10A1', symbol: 'C_{10,A}', label: 'Required rating, bearing A', kind: 'calc', digits: 5, compute: v => c10(v, v.FeA1),
              work: v => v.C10A1 !== undefined ? '\\(C_{10,A} = ' + H.fmt(v.af) + '(' + H.fmt(v.FeA1) + ')(' + H.fmt(v.brk) + ') = ' + H.fmt(v.C10A1, 5) + '\\ ' + v.unit + '\\)' : null },
            { id: 'coneA1', label: 'Bearing A: cone / cup selected', kind: 'input', type: 'text', hint: 'e.g. 15100 / 15245' },
            { id: 'C10Acat1', symbol: 'C_{10,cat}', label: 'Catalogue one-row radial rating, A', kind: 'lookup', fig: 'fig11-15a', check: v => (H.has(v, 'C10Acat1', 'C10A1') && v.C10Acat1 < v.C10A1) ? 'Below required C10' : null },
            { id: 'KA2', symbol: 'K_A', label: 'K of the selected bearing A', unit: '', kind: 'lookup', fig: 'fig11-15a' },
            { id: 'C10B1', symbol: 'C_{10,B}', label: 'Required rating, bearing B', kind: 'calc', digits: 5, compute: v => c10(v, v.FeB1),
              work: v => v.C10B1 !== undefined ? '\\(C_{10,B} = ' + H.fmt(v.af) + '(' + H.fmt(v.FeB1) + ')(' + H.fmt(v.brk) + ') = ' + H.fmt(v.C10B1, 5) + '\\ ' + v.unit + '\\)' : null },
            { id: 'coneB1', label: 'Bearing B: cone / cup selected', kind: 'input', type: 'text' },
            { id: 'C10Bcat1', symbol: 'C_{10,cat}', label: 'Catalogue one-row radial rating, B', kind: 'lookup', fig: 'fig11-15a', check: v => (H.has(v, 'C10Bcat1', 'C10B1') && v.C10Bcat1 < v.C10B1) ? 'Below required C10' : null },
            { id: 'KB2', symbol: 'K_B', label: 'K of the selected bearing B', unit: '', kind: 'lookup', fig: 'fig11-15a' },
          ],
          after: v => !H.has(v, 'KA2', 'KB2') ? '' : (v.KA2 === v.KA1 && v.KB2 === v.KB1) ? '<span class="result-ok">K unchanged — converged.</span>' : '<span class="result-ok">K changed (' + H.fmt(v.KA1) + '→' + H.fmt(v.KA2) + ', ' + H.fmt(v.KB1) + '→' + H.fmt(v.KB2) + ') — repeat in Trial 2 (Step 9).</span>' },
      ] },

      { title: 'Trial 2 (K from the selected bearings)', steps: [
        { id: 'tr2', title: 'Step 9 — repeat Steps 2–8 with the catalogue K values', eq: '11-18 .. 11-20', fig: ['fig11-15a'], when: v => H.has(v, 'KA2', 'KB2'),
          formula: 'C_{10,new} = \\frac{F_{e,new}}{F_{e,old}}\\,C_{10,old}',
          vars: [
            { id: 'FiA2', symbol: 'F_{iA}', label: 'Induced thrust at A', kind: 'calc', digits: 4, compute: v => { const r = eq(v, v.KA2, v.KB2); return r && r.FiA; } },
            { id: 'FiB2', symbol: 'F_{iB}', label: 'Induced thrust at B', kind: 'calc', digits: 4, compute: v => { const r = eq(v, v.KA2, v.KB2); return r && r.FiB; } },
            { id: 'case2', label: 'Net thrust carried by', kind: 'calc', compute: v => { const r = eq(v, v.KA2, v.KB2); return r ? (r.caseA ? 'A (Eq. 11-19)' : 'B (Eq. 11-20)') : undefined; } },
            { id: 'FeA2', symbol: 'F_{eA}', label: 'Equivalent load at A', kind: 'calc', digits: 4, compute: v => { const r = eq(v, v.KA2, v.KB2); return r && r.FeA; },
              work: v => { const r = eq(v, v.KA2, v.KB2); if (!r) return null; return r.caseA ? '\\(F_{eA} = 0.4(' + H.fmt(v.FrA) + ') + ' + H.fmt(v.KA2) + '(' + H.fmt(r.FiB) + ' + ' + H.fmt(v.Fae) + ') = ' + H.fmt(r.FeA) + '\\)' : '\\(F_{eA} = F_{rA} = ' + H.fmt(r.FeA) + '\\)'; } },
            { id: 'FeB2', symbol: 'F_{eB}', label: 'Equivalent load at B', kind: 'calc', digits: 4, compute: v => { const r = eq(v, v.KA2, v.KB2); return r && r.FeB; } },
            { id: 'C10A2', symbol: 'C_{10,A}', label: 'Required rating, A', kind: 'calc', digits: 5, compute: v => c10(v, v.FeA2),
              work: v => H.has(v, 'FeA2', 'FeA1', 'C10A1') && v.FeA1 > 0 ? '\\(C_{10,A} = \\dfrac{' + H.fmt(v.FeA2) + '}{' + H.fmt(v.FeA1) + '}(' + H.fmt(v.C10A1, 5) + ') = ' + H.fmt(v.C10A2, 5) + '\\)' : null },
            { id: 'C10B2', symbol: 'C_{10,B}', label: 'Required rating, B', kind: 'calc', digits: 5, compute: v => c10(v, v.FeB2) },
            { id: 'coneA2', label: 'Bearing A selected now', kind: 'input', type: 'text' },
            { id: 'C10Acat2', symbol: 'C_{10,cat}', label: 'Catalogue rating, A', kind: 'lookup', fig: 'fig11-15a' },
            { id: 'KA3', symbol: 'K_A', label: 'Its K', unit: '', kind: 'lookup', fig: 'fig11-15a' },
            { id: 'coneB2', label: 'Bearing B selected now', kind: 'input', type: 'text' },
            { id: 'C10Bcat2', symbol: 'C_{10,cat}', label: 'Catalogue rating, B', kind: 'lookup', fig: 'fig11-15a' },
            { id: 'KB3', symbol: 'K_B', label: 'Its K', unit: '', kind: 'lookup', fig: 'fig11-15a' },
          ],
          after: v => {
            if (!H.has(v, 'KA3', 'KB3', 'C10A2', 'C10B2', 'C10Acat2', 'C10Bcat2')) return '';
            const same = v.KA3 === v.KA2 && v.KB3 === v.KB2;
            const okA = v.C10Acat2 >= v.C10A2, okB = v.C10Bcat2 >= v.C10B2;
            if (same && okA && okB) return '<span class="result-ok">Same bearings selected twice → converged. ✔</span>';
            if (same && !okA) return '<span class="result-ok">Same bearing but A is slightly under-rated (' + H.fmt(v.C10Acat2, 5) + ' &lt; ' + H.fmt(v.C10A2, 5) + '). Shigley Ex. 11-8 keeps it because B\'s reliability exceeds the goal — check the pair reliability below.</span>';
            return '<span class="result-bad">K changed again — copy K_A, K_B into Trial 1 and repeat.</span>';
          } },
      ] },

      { title: 'Result', steps: [
        { id: 'res', title: 'Reliability check of the pair (Sec. 11-10, Eq. 11-23)', eq: '11-23', fig: ['fig11-13', 'skf-tap'],
          formula: 'R = \\exp\\left\\{-\\left[\\frac{x_D}{4.48\\,[C_{10}/(a_f F_D)]^{10/3}}\\right]^{3/2}\\right\\} \\qquad R_{pair} = R_A R_B',
          text: 'Also record the effective load centre <i>a</i> of each bearing from the catalogue: shoulder-to-shoulder = <i>a<sub>e</sub></i> − 2<i>a</i> (Ex. 11-8: 150 − 2(5.8) = 138.4 mm).',
          vars: [
            { id: 'RA', symbol: 'R_A', label: 'Reliability of bearing A', unit: '', kind: 'calc', digits: 6, compute: v => R24(v, v.C10Acat2 !== undefined ? v.C10Acat2 : v.C10Acat1, v.FeA2 !== undefined ? v.FeA2 : v.FeA1) },
            { id: 'RB', symbol: 'R_B', label: 'Reliability of bearing B', unit: '', kind: 'calc', digits: 6, compute: v => R24(v, v.C10Bcat2 !== undefined ? v.C10Bcat2 : v.C10Bcat1, v.FeB2 !== undefined ? v.FeB2 : v.FeB1) },
            { id: 'Rp', symbol: 'R', label: 'Reliability of the pair', unit: '', kind: 'calc', digits: 6, compute: v => H.has(v, 'RA', 'RB') ? v.RA * v.RB : undefined },
            { id: 'Rgoal', symbol: 'R_{goal}', label: 'Pair goal R_D²', unit: '', kind: 'calc', digits: 6, compute: v => v.RD !== undefined ? v.RD * v.RD : undefined },
          ],
          after: v => !H.has(v, 'Rp', 'Rgoal') ? '' : v.Rp >= v.Rgoal - 1e-9 ? '<span class="result-ok">R = ' + H.fmt(v.Rp, 6) + ' ≥ goal ' + H.fmt(v.Rgoal, 4) + ' ✔ — Bearing A: ' + (v.coneA2 || v.coneA1 || '') + ', Bearing B: ' + (v.coneB2 || v.coneB1 || '') + '</span>' : '<span class="result-bad">R = ' + H.fmt(v.Rp, 6) + ' &lt; goal ' + H.fmt(v.Rgoal, 4) + ' — choose the next larger bearing for the heavily loaded side.</span>' },
      ] },
    ],
  };
})();
