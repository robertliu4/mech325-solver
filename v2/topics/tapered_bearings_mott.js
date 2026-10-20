/* Tapered roller bearings — Mott 6e Ch. 14 Sec. 14-13 (ABMA equivalent-load method, thrust factor Y).
 * Procedure: Fizz bible pp. 101-106 (Timken K iteration) expressed with Mott's Y factors: Mott's Y plays the role of Shigley's K
 * (FiA = 0.47Fr/K  ⇔  0.5·Fr/Y). Mech bible unit 4 (PDF p. 129) is empty.
 * Verified against: Mott Example Problem 14-5 (FrA = 2720 lb, FrB = 4080 lb, TA = 2500 lb, 350 rpm, 4000 h, Y assumed 1.75):
 *   PA = 7503 lb, PB = 4080 lb, Ld = 8.4e7, CA = 28 400 lb, CB = 15 400 lb -> A: d = 2.5000 (C = 29 300, Y = 1.65), B: d = 1.7500 (C = 21 400, Y = 1.50);
 *   recheck PA = 7457 lb, CA = 28 200 lb -> both still OK -> PASS. */
(function () {
  const CRtab = { 90: 1.0, 95: 0.62, 96: 0.53, 97: 0.44, 98: 0.33, 99: 0.21 };
  const Creq = (v, P) => H.has(v, 'Ld', 'CR', 'k') && P !== undefined && v.CR > 0 ? P * Math.pow(v.Ld / (v.CR * 1e6), 1 / v.k) : undefined;
  function eq(v, YA, YB) {
    if (!H.has(v, 'FrA', 'FrB', 'TA') || !(YA > 0) || !(YB > 0)) return undefined;
    let PA = 0.4 * v.FrA + 0.5 * (YA / YB) * v.FrB + YA * v.TA, PB = v.FrB, caseA = true;
    if (PA < v.FrA) { caseA = false; PA = v.FrA; PB = 0.4 * v.FrB + 0.5 * (YB / YA) * v.FrA - YB * v.TA; PB = Math.max(PB, v.FrB); }
    return { PA, PB, caseA };
  }

  window.TOPIC = {
    id: 'tapered_bearings', book: 'mott',
    title: 'Tapered Roller Bearings',
    subtitle: 'Mott Ch. 14 Sec. 14-13 · Fizz pp. 101-106 · equivalent loads with thrust factor Y',
    sibling: 'tapered_bearings_shigley.html',
    intro: 'Mott follows the ABMA approach: for the bearing <b>A</b> that resists the thrust, <i>P<sub>A</sub> = 0.4F<sub>rA</sub> + 0.5(Y<sub>A</sub>/Y<sub>B</sub>)F<sub>rB</sub> + Y<sub>A</sub>T<sub>A</sub></i> (Eq. 14-7) and <i>P<sub>B</sub> = F<sub>rB</sub></i> (Eq. 14-8); ' +
      'the middle term is the thrust induced by bearing B\'s radial load (same physics as Shigley\'s 0.47F<sub>r</sub>/K). If P<sub>A</sub> comes out below F<sub>rA</sub>, bearing B carries the net thrust instead (Eq. 14-9). ' +
      'The thrust factor <i>Y</i> (1.07–2.26) belongs to the specific bearing, so assume <i>Y</i> (Fizz: 1.5; Mott Ex. 14-5: 1.75), compute the required <i>C = P(L<sub>d</sub>/10⁶)<sup>0.30</sup></i> with <i>k</i> = 3.33, select from Table 14-7, re-evaluate with the catalogue <i>Y</i> values and repeat until the selection is stable (Example Problem 14-5). ' +
      'Timken-style Weibull reliability is in the Shigley version; here higher reliability uses C<sub>R</sub> from Table 14-6.',
    example: { unit: 'lb', FrA: 2720, FrB: 4080, TA: 2500, n: 350, Lh: 4000, rel: 90, k: 3.33, YA1: 1.75, YB1: 1.75, bearA1: 'd = 2.5000 in', CA1: 29300, YA2: 1.65, bearB1: 'd = 1.7500 in', CB1: 21400, YB2: 1.50, bearA2: 'd = 2.5000 in', CA2: 29300, YA3: 1.65, bearB2: 'd = 1.7500 in', CB2: 21400, YB3: 1.50 },

    assumptions: [
      { text: 'Bearing A is the one that carries (resists) the external thrust T_A', src: 'Fizz p.102' },
      { text: 'First pass Y_A = Y_B = 1.5 — Fizz starts with K_A = K_B = 1.5 and Mott\'s Y plays the role of K; Mott Ex. 14-5 assumes 1.75', src: 'Fizz p.102 · Mott Ex. 14-5', var: 'YA1' },
      { text: 'If P_A comes out below F_{rA}, use P_A = F_{rA} and Eq. 14-9 for P_B', src: 'Mott Sec. 14-13' },
      { text: 'Design life from Table 14-4 if not given', src: 'Fizz p.102', var: 'Lh' },
      { text: 'Reliability 90 % (C_R = 1) unless stated; otherwise L_1 = C_R·10^6 from Table 14-6', src: 'Fizz p.113', var: 'rel' },
      { text: 'Load-life exponent k = 3.33 for tapered roller bearings (1/k = 0.30)', src: 'Fizz p.113 · Fizz p.103', var: 'k' },
      { text: 'Re-select with the catalogue Y values and repeat until the same bearings come up twice in a row', src: 'Fizz p.105' },
    ],

    figures: [
      { id: 'fig14-7', ref: 'Figure 14-7', title: 'Tapered roller bearing (cone, cup, tapered rollers, cage)', src: 'figures/mott/fig14-7.png', page: 584 },
      { id: 'fig14-15', ref: 'Figure 14-15', title: 'Example installation (Ex. 14-5): bearing A resists the thrust; bearing details d, D, T, B, C, a, r, R', src: 'figures/mott/fig14-15.png', page: 597,
        note: 'The radial reaction acts at distance a from the cup face (intersection of the roller normal with the shaft axis) — use it for the shaft span.' },
      { id: 'fig11-14', ref: 'Figure 11-14', book: 'shigley', title: 'Direct vs indirect mounting (cone backs or cone fronts facing) — Mott does not draw this', src: 'figures/shigley/fig11-14.png', page: 618 },
      { id: 'fig11-17', ref: 'Figure 11-17', book: 'shigley', title: 'How to identify bearing A: the bearing compressed by the external thrust', src: 'figures/shigley/fig11-17.png', page: 622 },
      { id: 't14-7', ref: 'Table 14-7', title: 'Tapered roller bearing data: bore d, OD D, width T, a, thrust factor Y, basic dynamic load rating C (lb, 10⁶ rev)', src: 'figures/mott/table14-7.png', page: 598,
        note: 'Abbreviated example set; real catalogues list hundreds. Select C ≥ required and bore ≥ shaft, then read Y.' },
      { id: 't14-4', ref: 'Table 14-4', title: 'Recommended design life (h)', src: 'figures/mott/table14-4.png', page: 592 },
      { id: 't14-6', ref: 'Table 14-6', title: 'Life adjustment factors for reliability CR', src: 'figures/mott/table14-6.png', page: 595 },
      { id: 'skf-tap', ref: 'SKF table 8.1 (catalogue p.694)', book: 'course', title: 'SKF metric single-row tapered roller bearings, d = 15–32 mm: dimensions, C, C_0, P_u, e, Y, Y_0 (302xx, 322xx …)', src: 'figures/course/skf_tapered_roller_d15_32_p694.png', note: 'SKF Bearing Catalogue.pdf p.696 (printed 694). Example page only (one bore range); the product tables continue over the neighbouring pages of the catalogue. Course textbook tables remain the primary source.' },
    ],

    sections: [
      { title: 'Inputs', steps: [
        { id: 'loads', title: 'Step 1 — radial loads at A and B, thrust on A', fig: ['fig14-15', 'fig11-17', 'fig11-14'],
          formula: 'F_{rA} = \\sqrt{R_{xA}^2 + R_{yA}^2} \\qquad F_{rB} = \\sqrt{R_{xB}^2 + R_{yB}^2}',
          text: 'Bearing <b>A</b> is the one that resists the external thrust (Mott Ex. 14-5: 6800 lb load 4 in from A on a 10 in span → F<sub>rA</sub> = 2720 lb, F<sub>rB</sub> = 4080 lb, T<sub>A</sub> = 2500 lb).',
          vars: [
            { id: 'unit', label: 'Force unit', kind: 'choice', type: 'text', default: 'lb', options: ['lb', 'N', 'kN'], hint: 'Table 14-7 is in lb' },
            { id: 'RxA', symbol: 'R_{xA}', label: 'Reaction at A, plane 1', kind: 'input', hint: 'optional' },
            { id: 'RyA', symbol: 'R_{yA}', label: 'Reaction at A, plane 2', kind: 'input', hint: 'optional' },
            { id: 'FrA', symbol: 'F_{rA}', label: 'Radial load on A', kind: 'input', auto: v => H.has(v, 'RxA', 'RyA') ? Math.hypot(v.RxA, v.RyA) : undefined, hint: 'auto = √(RxA²+RyA²)' },
            { id: 'RxB', symbol: 'R_{xB}', label: 'Reaction at B, plane 1', kind: 'input', hint: 'optional' },
            { id: 'RyB', symbol: 'R_{yB}', label: 'Reaction at B, plane 2', kind: 'input', hint: 'optional' },
            { id: 'FrB', symbol: 'F_{rB}', label: 'Radial load on B', kind: 'input', auto: v => H.has(v, 'RxB', 'RyB') ? Math.hypot(v.RxB, v.RyB) : undefined, hint: 'auto = √(RxB²+RyB²)' },
            { id: 'TA', symbol: 'T_A', label: 'External thrust resisted by A', kind: 'input', default: 0 },
          ] },
        { id: 'life', title: 'Steps 4–6 — design life, reliability', eq: '14-3 / 14-6', fig: ['t14-4', 't14-6'],
          formula: 'L_d = (h)(\\text{rpm})(60) \\qquad L_1 = C_R \\cdot 10^6 \\qquad k = 3.33\\ (1/k = 0.30)',
          vars: [
            { id: 'n', symbol: 'n', label: 'Shaft speed', unit: 'rpm', kind: 'input' },
            { id: 'Lh', symbol: 'h', label: 'Design life', unit: 'h', kind: 'lookup', fig: 't14-4' },
            { id: 'Ld', symbol: 'L_d', label: 'Design life in revolutions', unit: 'rev', kind: 'calc', digits: 4, compute: v => H.has(v, 'Lh', 'n') ? v.Lh * v.n * 60 : undefined,
              work: v => v.Ld !== undefined ? '\\(L_d = (' + H.fmt(v.Lh) + ')(' + H.fmt(v.n) + ')(60) = ' + H.fmt(v.Ld) + '\\text{ rev}\\)' : null },
            { id: 'rel', symbol: 'R', label: 'Required reliability', unit: '%', kind: 'choice', default: 90, options: [90, 95, 96, 97, 98, 99] },
            { id: 'CR', symbol: 'C_R', label: 'Reliability factor', unit: '', kind: 'lookup', fig: 't14-6', auto: v => CRtab[v.rel] },
            { id: 'k', symbol: 'k', label: 'Load-life exponent (roller)', unit: '', kind: 'input', default: 3.33 },
            { id: 'lifefac', label: '(Ld / CR·10⁶)^{1/k}', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'Ld', 'CR', 'k') && v.CR > 0 ? Math.pow(v.Ld / (v.CR * 1e6), 1 / v.k) : undefined, hint: 'same in every iteration' },
          ] },
      ] },

      { title: 'Trial 1 (assumed Y)', steps: [
        { id: 'p1', title: 'Steps 2–3 — equivalent loads with assumed YA = YB', eq: '14-7 / 14-8 / 14-9',
          formula: 'P_A = 0.4F_{rA} + 0.5\\frac{Y_A}{Y_B}F_{rB} + Y_A T_A \\qquad P_B = F_{rB} \\qquad \\left(\\text{if } P_A < F_{rA}:\\ P_A = F_{rA},\\ P_B = 0.4F_{rB} + 0.5\\frac{Y_B}{Y_A}F_{rA} - Y_B T_A\\right)',
          text: 'Fizz starts with K = 1.5 for both bearings (pre-filled here as Y); Mott Ex. 14-5 assumes Y = 1.75 (Table 14-7 range 1.07–2.26). Y<sub>A</sub>/Y<sub>B</sub> cancels on the first pass when both are equal.',
          vars: [
            { id: 'YA1', symbol: 'Y_A', label: 'Assumed thrust factor, A', unit: '', kind: 'lookup', fig: 't14-7', default: 1.5, hint: 'Fizz K = 1.5; Mott Ex. 14-5 uses 1.75' },
            { id: 'YB1', symbol: 'Y_B', label: 'Assumed thrust factor, B', unit: '', kind: 'lookup', fig: 't14-7', default: 1.5 },
            { id: 'case1', label: 'Thrust carried by', kind: 'calc', compute: v => { const r = eq(v, v.YA1, v.YB1); return r ? (r.caseA ? 'A (Eq. 14-7)' : 'B (Eq. 14-9, PA < FrA)') : undefined; } },
            { id: 'PA1', symbol: 'P_A', label: 'Equivalent load on A', kind: 'calc', digits: 4, compute: v => { const r = eq(v, v.YA1, v.YB1); return r && r.PA; },
              work: v => { const r = eq(v, v.YA1, v.YB1); return r && r.caseA ? '\\(P_A = 0.4(' + H.fmt(v.FrA) + ') + 0.5\\dfrac{' + H.fmt(v.YA1) + '}{' + H.fmt(v.YB1) + '}(' + H.fmt(v.FrB) + ') + ' + H.fmt(v.YA1) + '(' + H.fmt(v.TA) + ') = ' + H.fmt(r.PA) + '\\)' : null; } },
            { id: 'PB1', symbol: 'P_B', label: 'Equivalent load on B', kind: 'calc', digits: 4, compute: v => { const r = eq(v, v.YA1, v.YB1); return r && r.PB; } },
          ] },
        { id: 'c1', title: 'Steps 7–8 — required C and tentative bearings', eq: '14-3', fig: ['t14-7'],
          formula: 'C = P\\left(\\frac{L_d}{C_R\\cdot 10^6}\\right)^{1/k}',
          vars: [
            { id: 'CAreq1', symbol: 'C_A', label: 'Required rating, A', kind: 'calc', digits: 5, compute: v => Creq(v, v.PA1),
              work: v => v.CAreq1 !== undefined ? '\\(C_A = ' + H.fmt(v.PA1) + '(' + H.fmt(v.lifefac) + ') = ' + H.fmt(v.CAreq1, 5) + '\\)' : null },
            { id: 'bearA1', label: 'Bearing A selected (bore)', kind: 'input', type: 'text' },
            { id: 'CA1', symbol: 'C_{cat}', label: 'Catalogue C of A', kind: 'lookup', fig: 't14-7', check: v => (H.has(v, 'CA1', 'CAreq1') && v.CA1 < v.CAreq1) ? 'Below required C' : null },
            { id: 'YA2', symbol: 'Y_A', label: 'Catalogue Y of A', unit: '', kind: 'lookup', fig: 't14-7' },
            { id: 'CBreq1', symbol: 'C_B', label: 'Required rating, B', kind: 'calc', digits: 5, compute: v => Creq(v, v.PB1),
              work: v => v.CBreq1 !== undefined ? '\\(C_B = ' + H.fmt(v.PB1) + '(' + H.fmt(v.lifefac) + ') = ' + H.fmt(v.CBreq1, 5) + '\\)' : null },
            { id: 'bearB1', label: 'Bearing B selected (bore)', kind: 'input', type: 'text' },
            { id: 'CB1', symbol: 'C_{cat}', label: 'Catalogue C of B', kind: 'lookup', fig: 't14-7', check: v => (H.has(v, 'CB1', 'CBreq1') && v.CB1 < v.CBreq1) ? 'Below required C' : null },
            { id: 'YB2', symbol: 'Y_B', label: 'Catalogue Y of B', unit: '', kind: 'lookup', fig: 't14-7' },
          ],
          after: v => !H.has(v, 'YA2', 'YB2') ? '' : '<span class="result-ok">Recompute with Y_A = ' + H.fmt(v.YA2) + ', Y_B = ' + H.fmt(v.YB2) + ' in Trial 2 (Fizz Step 9).</span>' },
      ] },

      { title: 'Trial 2 (catalogue Y)', steps: [
        { id: 'tr2', title: 'Step 9 — repeat with the catalogue thrust factors', eq: '14-7 .. 14-9', fig: ['t14-7'], when: v => H.has(v, 'YA2', 'YB2'),
          vars: [
            { id: 'case2', label: 'Thrust carried by', kind: 'calc', compute: v => { const r = eq(v, v.YA2, v.YB2); return r ? (r.caseA ? 'A (Eq. 14-7)' : 'B (Eq. 14-9)') : undefined; } },
            { id: 'PA2', symbol: 'P_A', label: 'Equivalent load on A', kind: 'calc', digits: 4, compute: v => { const r = eq(v, v.YA2, v.YB2); return r && r.PA; },
              work: v => { const r = eq(v, v.YA2, v.YB2); return r && r.caseA ? '\\(P_A = 0.4(' + H.fmt(v.FrA) + ') + 0.5\\dfrac{' + H.fmt(v.YA2) + '}{' + H.fmt(v.YB2) + '}(' + H.fmt(v.FrB) + ') + ' + H.fmt(v.YA2) + '(' + H.fmt(v.TA) + ') = ' + H.fmt(r.PA) + '\\)' : null; } },
            { id: 'PB2', symbol: 'P_B', label: 'Equivalent load on B', kind: 'calc', digits: 4, compute: v => { const r = eq(v, v.YA2, v.YB2); return r && r.PB; } },
            { id: 'CAreq2', symbol: 'C_A', label: 'Required rating, A', kind: 'calc', digits: 5, compute: v => Creq(v, v.PA2),
              work: v => H.has(v, 'PA2', 'PA1', 'CAreq1') && v.PA1 > 0 ? '\\(C_A = \\dfrac{' + H.fmt(v.PA2) + '}{' + H.fmt(v.PA1) + '}(' + H.fmt(v.CAreq1, 5) + ') = ' + H.fmt(v.CAreq2, 5) + '\\)' : null },
            { id: 'CBreq2', symbol: 'C_B', label: 'Required rating, B', kind: 'calc', digits: 5, compute: v => Creq(v, v.PB2) },
            { id: 'bearA2', label: 'Bearing A selected now', kind: 'input', type: 'text' },
            { id: 'CA2', symbol: 'C_{cat}', label: 'Catalogue C of A', kind: 'lookup', fig: 't14-7' },
            { id: 'YA3', symbol: 'Y_A', label: 'Its Y', unit: '', kind: 'lookup', fig: 't14-7' },
            { id: 'bearB2', label: 'Bearing B selected now', kind: 'input', type: 'text' },
            { id: 'CB2', symbol: 'C_{cat}', label: 'Catalogue C of B', kind: 'lookup', fig: 't14-7' },
            { id: 'YB3', symbol: 'Y_B', label: 'Its Y', unit: '', kind: 'lookup', fig: 't14-7' },
          ],
          after: v => {
            if (!H.has(v, 'YA3', 'YB3', 'CA2', 'CB2', 'CAreq2', 'CBreq2')) return '';
            const same = v.YA3 === v.YA2 && v.YB3 === v.YB2, ok = v.CA2 >= v.CAreq2 && v.CB2 >= v.CBreq2;
            return same && ok ? '<span class="result-ok">Same bearings twice and both ratings satisfied → converged ✔</span>' : '<span class="result-bad">' + (ok ? 'Y changed — feed Y_A, Y_B back into Trial 1.' : 'A selection is under-rated — pick the next larger bearing and repeat.') + '</span>';
          } },
      ] },

      { title: 'Result', steps: [
        { id: 'res', title: 'Final selection', fig: ['t14-7', 'fig14-15', 'skf-tap'],
          text: 'Report bore d, OD D, width T, effective-centre distance a, Y and C for each bearing.',
          vars: [
            { id: 'final', label: 'Status', kind: 'calc', compute: v => {
              const ca = v.CA2 !== undefined ? v.CA2 : v.CA1, cb = v.CB2 !== undefined ? v.CB2 : v.CB1;
              const ra = v.CAreq2 !== undefined ? v.CAreq2 : v.CAreq1, rb = v.CBreq2 !== undefined ? v.CBreq2 : v.CBreq1;
              if ([ca, cb, ra, rb].some(x => x === undefined)) return undefined;
              return ca >= ra && cb >= rb ? 'PASS' : 'FAIL';
            } },
          ],
          after: v => v.final === undefined ? '' : v.final === 'PASS' ? '<span class="result-ok">Bearing A: ' + (v.bearA2 || v.bearA1 || '') + ' (C = ' + H.fmt(v.CA2 !== undefined ? v.CA2 : v.CA1, 5) + '); Bearing B: ' + (v.bearB2 || v.bearB1 || '') + ' (C = ' + H.fmt(v.CB2 !== undefined ? v.CB2 : v.CB1, 5) + '). Both satisfy the required rating for ' + H.fmt(v.Lh) + ' h at ' + H.fmt(v.n) + ' rpm. ✔</span>' : '<span class="result-bad">At least one bearing is under-rated.</span>' },
      ] },
    ],
  };
})();
