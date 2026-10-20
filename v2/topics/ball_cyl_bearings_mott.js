/* Ball & cylindrical roller bearings — Mott 6e Ch. 14 (Secs 14-6 .. 14-11).
 * Procedure: Fizz bible pp. 96-100 (Shigley-style Weibull) mapped onto Mott's C = Pd (Ld/1e6)^(1/k) with the
 * reliability adjustment of Eq. 14-6 / Table 14-6 (also used by Fizz p. 113 Step 21). Mech bible unit 4 (PDF p. 129) is empty.
 * Verified against: Mott Example Problem 14-4 (R = 1850 lb, T = 675 lb, 1150 rpm, 20 000 h, Dmin = 3.10 in, Y assumed 1.50):
 *   P = 2049 lb, Ld = 1.38e9 rev, C = 22 807 lb -> 6316 (C = 27 878, Co = 19 447); T/Co = 0.0347, e = 0.25, Y = 1.78 (Mott's reading),
 *   P = 2238 lb, C = 24 910 lb -> 6316 still OK -> PASS. (Also Ex. 14-3 radial only: 650 lb, 600 rpm, 30 000 h -> C = 6670 lb -> 6208.) */
(function () {
  // Mott Table 14-5
  const TC0 = [0.014, 0.028, 0.056, 0.084, 0.110, 0.170, 0.280, 0.420, 0.560];
  const E = [0.19, 0.22, 0.26, 0.28, 0.30, 0.34, 0.38, 0.42, 0.44];
  const Y = [2.30, 1.99, 1.71, 1.55, 1.45, 1.31, 1.15, 1.04, 1.00];
  const CRtab = { 90: 1.0, 95: 0.62, 96: 0.53, 97: 0.44, 98: 0.33, 99: 0.21 };
  const thrust = v => v.mode === 'radial + thrust';
  const Creq = (v, P) => H.has(v, 'Ld', 'CR', 'k') && P !== undefined && v.CR > 0 ? P * Math.pow(v.Ld / (v.CR * 1e6), 1 / v.k) : undefined;

  window.TOPIC = {
    id: 'ball_cyl_bearings', book: 'mott',
    title: 'Ball & Cylindrical Roller Bearings',
    subtitle: 'Mott Ch. 14 Secs 14-6 to 14-11 · Fizz pp. 96-101, 113 · C = Pd (Ld/10⁶)^{1/k}',
    sibling: 'ball_cyl_bearings_shigley.html',
    intro: 'Mott sizes a rolling-contact bearing by the required <b>basic dynamic load rating</b> <i>C = P<sub>d</sub>(L<sub>d</sub>/10⁶)<sup>1/k</sup></i> (Eq. 14-3) with the design life in revolutions ' +
      '<i>L<sub>d</sub> = h·rpm·60</i> and <i>k</i> = 3 (ball) or 3.33 (roller); for reliability above 90 % the catalogue life 10⁶ is multiplied by <i>C<sub>R</sub></i> from Table 14-6 (Eq. 14-6). ' +
      'A thrust load is folded into an equivalent load <i>P = VXR + YT</i> (Eq. 14-5) with <i>X</i> = 0.56 and <i>Y</i> from Table 14-5 — <i>Y</i> depends on <i>T/C<sub>o</sub></i> of the bearing, so assume <i>Y</i> = 1.50, select from Table 14-3, read <i>C<sub>o</sub></i>, re-evaluate and repeat (Example Problem 14-4). ' +
      'The Fizz bible\'s Weibull version of the same problem is in the Shigley calculator.',
    example: { mode: 'radial + thrust', R: 1850, Tload: 675, n: 1150, Lh: 20000, rel: 90, btype: 'single-row deep-groove ball (k = 3)', ring: 'inner race rotates (V = 1.0)', Dmin: 3.10, X: 0.56, Ya: 1.50, bear1: '6316', bore1: 3.1496, Csel1: 27878, Co1: 19447, e1: 0.25, Yb: 1.78, bear2: '6316', Csel2: 27878 },

    assumptions: [
      { text: 'Rotation factor V = 1.0 (inner race rotates — the usual case); 1.2 if the outer race rotates', src: 'Fizz p.99 · Mott Sec. 14-9', var: 'ring' },
      { text: 'Design life from Table 14-4 if not given; build it up as rpm × 60 × h/day × days/month × 12 × years when the usage is described', src: 'Fizz p.97 · Fizz p.113', var: 'Lh' },
      { text: 'Reliability 90 % (catalogue L_{10}, C_R = 1) unless stated; otherwise L_1 = C_R·10^6 with C_R from Table 14-6', src: 'Fizz p.113', var: 'rel' },
      { text: 'Load-life exponent k = 3.00 for ball bearings, 3.33 for roller bearings', src: 'Fizz p.113 · Fizz p.98', var: 'k' },
      { text: 'Thrust case: assume T/R &gt; e first and check it once C_o of the chosen bearing is known', src: 'Fizz p.99 · Fizz p.100' },
      { text: 'First-pass factors X = 0.56 and Y = 1.63 (middle of the table); Mott\'s own procedure assumes Y = 1.50 (Ex. 14-4)', src: 'Fizz p.99 · Mott Sec. 14-10', var: 'Ya' },
      { text: 'Interpolate e and Y linearly in Table 14-5 at the actual T/C_o (use the first row if T/C_o &lt; 0.014)', src: 'Fizz p.100 · Fizz p.101' },
      { text: 'Repeat until the same bearing is selected twice in a row', src: 'Fizz p.101' },
    ],

    figures: [
      { id: 'fig14-1', ref: 'Figure 14-1', title: 'Single-row deep-groove ball bearing nomenclature (bore d, OD D, width B, races, cage)', src: 'figures/mott/fig14-1.png', page: 581 },
      { id: 'fig14-3', ref: 'Figures 14-3 / 14-4', title: 'Angular-contact ball bearing (load line through pressure centre, distance a) and cylindrical roller bearing', src: 'figures/mott/fig14-3-4.png', page: 583 },
      { id: 't14-1', ref: 'Table 14-1', title: 'Comparison of bearing types: radial, thrust and misalignment capability', src: 'figures/mott/table14-1.png', page: 582 },
      { id: 't14-4', ref: 'Table 14-4', title: 'Recommended design life L10 (hours) by application', src: 'figures/mott/table14-4.png', page: 592 },
      { id: 't14-6', ref: 'Table 14-6', title: 'Life adjustment factors for reliability CR (90 % → 1.0 … 99 % → 0.21)', src: 'figures/mott/table14-6.png', page: 595 },
      { id: 'proc', ref: 'Sec. 14-10 procedure', title: 'Mott procedure for selecting a bearing — radial and thrust load (10 steps)', src: 'figures/mott/proc14-10.png', page: 594 },
      { id: 't14-5', ref: 'Table 14-5', title: 'Radial and thrust factors e, Y vs T/Co for single-row deep-groove ball bearings (X = 0.56)', src: 'figures/mott/table14-5.png', page: 594,
        note: 'Interpolate between rows for the actual T/Co. Mott Ex. 14-4 reads e ≈ 0.25 and Y = 1.78 at T/Co = 0.0347.' },
      { id: 't14-3a', ref: 'Table 14-3', title: 'Dimensions for single-row deep-groove ball bearings 6000–6308 (bore 10–40 mm)', src: 'figures/mott/table14-3a.png', page: 589,
        note: 'Columns: bore, OD, width, static Co, dynamic C (kN and lbf), max fillet, shoulder diameters S and H. 100-series = extra light, 200 = light, 300 = medium.' },
      { id: 't14-3b', ref: 'Table 14-3 (cont.)', title: 'Bearings 6009–6316 (bore 45–80 mm)', src: 'figures/mott/table14-3b.png', page: 590 },
      { id: 't14-3c', ref: 'Table 14-3 (cont.)', title: 'Bearings 6017–6326 (bore 85–130 mm)', src: 'figures/mott/table14-3c.png', page: 591 },
      { id: 'skf-dg', ref: 'SKF table 1.1 (catalogue p.272)', book: 'course', title: 'SKF single-row deep groove ball bearings, d = 25–30 mm: dimensions, C, C_0, fatigue limit P_u, speeds, designations (6205, 6305 …)', src: 'figures/course/skf_deep_groove_ball_d25_30_p272.png', note: 'SKF Bearing Catalogue.pdf p.274 (printed 272). Example page only (one bore range); the product tables continue over the neighbouring pages of the catalogue. Course textbook tables remain the primary source.' },
      { id: 'skf-cyl', ref: 'SKF table 6.1 (catalogue p.516)', book: 'course', title: 'SKF single-row cylindrical roller bearings, d = 15–25 mm: dimensions, C, C_0, P_u, speeds (NU/NJ/N/NUP 2xx ECP)', src: 'figures/course/skf_cylindrical_roller_d15_25_p516.png', note: 'SKF Bearing Catalogue.pdf p.518 (printed 516). Example page only (one bore range); the product tables continue over the neighbouring pages of the catalogue. Course textbook tables remain the primary source.' },
    ],

    sections: [
      { title: 'Inputs', steps: [
        { id: 'in', title: 'Loads, speed and bearing type', fig: ['fig14-1', 't14-1', 'fig14-3'],
          text: 'Radial load <i>R</i> is the resultant bearing reaction (√(R<sub>x</sub>² + R<sub>y</sub>²)); thrust <i>T</i> only for the bearing that takes the axial load. Mott\'s Table 14-3 is in lbf and kN — enter loads in lb.',
          vars: [
            { id: 'mode', label: 'Loading', kind: 'choice', type: 'text', default: 'radial only', options: ['radial only', 'radial + thrust'] },
            { id: 'Rx', symbol: 'R_x', label: 'Radial reaction, x', unit: 'lb', kind: 'input', hint: 'optional' },
            { id: 'Ry', symbol: 'R_y', label: 'Radial reaction, y', unit: 'lb', kind: 'input', hint: 'optional' },
            { id: 'R', symbol: 'R', label: 'Radial load', unit: 'lb', kind: 'input', auto: v => H.has(v, 'Rx', 'Ry') ? Math.hypot(v.Rx, v.Ry) : undefined, hint: 'auto = √(Rx²+Ry²)' },
            { id: 'Tload', symbol: 'T', label: 'Thrust load', unit: 'lb', kind: 'input' },
            { id: 'n', symbol: 'n', label: 'Shaft speed', unit: 'rpm', kind: 'input' },
            { id: 'Dmin', symbol: 'D_{min}', label: 'Minimum acceptable shaft diameter at the bearing', unit: 'in', kind: 'input', hint: 'bore must be ≥ this' },
            { id: 'btype', label: 'Bearing type', kind: 'choice', type: 'text', default: 'single-row deep-groove ball (k = 3)', options: ['single-row deep-groove ball (k = 3)', 'angular-contact ball (k = 3)', 'cylindrical roller (k = 3.33)'] },
            { id: 'k', symbol: 'k', label: 'Load-life exponent', unit: '', kind: 'calc', digits: 3, compute: v => v.btype ? (/roller/.test(v.btype) ? 3.33 : 3) : undefined },
            { id: 'ring', label: 'Rotating race', kind: 'choice', type: 'text', default: 'inner race rotates (V = 1.0)', options: ['inner race rotates (V = 1.0)', 'outer race rotates (V = 1.2)'] },
            { id: 'V', symbol: 'V', label: 'Rotation factor', unit: '', kind: 'calc', digits: 2, compute: v => v.ring ? (/outer/.test(v.ring) ? 1.2 : 1) : undefined },
          ] },
        { id: 'life', title: 'Design life', fig: ['t14-4'], formula: 'L_d = (h)(\\text{rpm})(60\\ \\text{min/h})',
          text: 'Pick the life in hours from Table 14-4 (e.g. conveyors 20 000–30 000 h; agricultural 3000–6000 h). Fizz Step 21a builds it up from hours/day × days/month × 12 × years.',
          vars: [
            { id: 'Lh', symbol: 'h', label: 'Design life', unit: 'h', kind: 'lookup', fig: 't14-4' },
            { id: 'Ld', symbol: 'L_d', label: 'Design life in revolutions', unit: 'rev', kind: 'calc', digits: 4, compute: v => H.has(v, 'Lh', 'n') ? v.Lh * v.n * 60 : undefined,
              work: v => v.Ld !== undefined ? '\\(L_d = (' + H.fmt(v.Lh) + ')(' + H.fmt(v.n) + ')(60) = ' + H.fmt(v.Ld) + '\\text{ rev}\\)' : null },
          ] },
        { id: 'rel', title: 'Reliability adjustment', eq: '14-6', fig: ['t14-6'], formula: 'L_{aR} = C_R\\, L_{10} \\quad\\Rightarrow\\quad L_1 = C_R \\cdot 10^6',
          text: 'Catalogue ratings are L10 (90 %). For a higher reliability the rated life shrinks by <i>C<sub>R</sub></i> (Table 14-6), which raises the required <i>C</i>. Fizz: "if the reliability is not 90 % multiply 10⁶ by the constant".',
          vars: [
            { id: 'rel', symbol: 'R', label: 'Required reliability', unit: '%', kind: 'choice', default: 90, options: [90, 95, 96, 97, 98, 99] },
            { id: 'CR', symbol: 'C_R', label: 'Reliability factor', unit: '', kind: 'lookup', fig: 't14-6', auto: v => CRtab[v.rel] },
            { id: 'L1', symbol: 'L_1', label: 'Adjusted catalogue life', unit: 'rev', kind: 'calc', digits: 4, compute: v => v.CR !== undefined ? v.CR * 1e6 : undefined },
          ] },
      ] },

      { title: 'Radial load only (Mott Sec. 14-9)', steps: [
        { id: 'Pr', title: 'Design (equivalent) load', eq: '14-4', formula: 'P = V R', when: v => !thrust(v),
          vars: [
            { id: 'Pr', symbol: 'P_d', label: 'Design load', unit: 'lb', kind: 'calc', digits: 4, compute: v => H.has(v, 'V', 'R') ? v.V * v.R : undefined },
          ] },
        { id: 'Cr', title: 'Required basic dynamic load rating', eq: '14-3', when: v => !thrust(v),
          formula: 'C = P_d \\left(\\frac{L_d}{C_R \\cdot 10^6}\\right)^{1/k}',
          vars: [
            { id: 'Creq', symbol: 'C', label: 'Required C', unit: 'lb', kind: 'calc', digits: 4, compute: v => Creq(v, v.Pr),
              work: v => v.Creq !== undefined ? '\\(C = ' + H.fmt(v.Pr) + '\\left(\\dfrac{' + H.fmt(v.Ld) + '}{' + H.fmt(v.CR) + '\\times 10^6}\\right)^{1/' + H.fmt(v.k) + '} = ' + H.fmt(v.Creq) + '\\text{ lb}\\)' : null },
            { id: 'CreqkN', symbol: 'C', label: 'Required C in kN', unit: 'kN', kind: 'calc', digits: 4, compute: v => v.Creq !== undefined ? v.Creq / 224.809 : undefined },
          ] },
        { id: 'selr', title: 'Select from Table 14-3', fig: ['t14-3a', 't14-3b', 't14-3c', 'skf-dg', 'skf-cyl'], when: v => !thrust(v),
          text: 'Find the lightest bearing with dynamic <i>C</i> ≥ required and bore ≥ <i>D<sub>min</sub></i> (Mott Ex. 14-3: 650 lb, 600 rpm, 30 000 h → C = 6670 lb → 6208, bore 40 mm, C = 6902 lb).',
          vars: [
            { id: 'bearR', label: 'Bearing number', kind: 'input', type: 'text', hint: 'e.g. 6208' },
            { id: 'boreR', symbol: 'd', label: 'Bore', unit: 'in', kind: 'lookup', fig: 't14-3a', check: v => (H.has(v, 'boreR', 'Dmin') && v.boreR < v.Dmin) ? 'Bore is smaller than the minimum shaft diameter' : null },
            { id: 'CselR', symbol: 'C_{cat}', label: 'Catalogue dynamic C', unit: 'lb', kind: 'lookup', fig: 't14-3a' },
            { id: 'L10act', symbol: 'L_{10}', label: 'Expected L10 life of selection (Eq. 14-1)', unit: 'rev', kind: 'calc', digits: 4, compute: v => H.has(v, 'CselR', 'Pr', 'k', 'CR') && v.Pr > 0 ? v.CR * 1e6 * Math.pow(v.CselR / v.Pr, v.k) : undefined },
          ],
          after: v => !H.has(v, 'CselR', 'Creq') ? '' : v.CselR >= v.Creq ? '<span class="result-ok">' + (v.bearR || 'Bearing') + ': C = ' + H.fmt(v.CselR) + ' lb ≥ ' + H.fmt(v.Creq) + ' lb ✔ (life ≈ ' + H.fmt(v.L10act / 60 / v.n) + ' h)</span>' : '<span class="result-bad">Under-rated — choose a heavier series or larger bore.</span>' },
      ] },

      { title: 'Radial + thrust (Mott Sec. 14-10) — iteration 1', steps: [
        { id: 'P1', title: 'Steps 1–2 — assume Y, equivalent load', eq: '14-5', fig: ['proc', 't14-5'], when: thrust,
          formula: 'P = V X R + Y T',
          text: 'X = 0.56 for all rows of Table 14-5. First-guess Y: the Fizz guide uses 1.63 (middle of the table, pre-filled); Mott\'s procedure uses 1.50 (Ex. 14-4). Either converges to the same bearing.',
          vars: [
            { id: 'X', symbol: 'X', label: 'Radial factor', unit: '', kind: 'lookup', fig: 't14-5', default: 0.56 },
            { id: 'Ya', symbol: 'Y', label: 'Assumed thrust factor', unit: '', kind: 'lookup', fig: 't14-5', default: 1.63, hint: 'Fizz 1.63; Mott Ex. 14-4 uses 1.50' },
            { id: 'P1', symbol: 'P', label: 'Equivalent load (1st)', unit: 'lb', kind: 'calc', digits: 4, compute: v => H.has(v, 'V', 'X', 'R', 'Ya', 'Tload') ? v.V * v.X * v.R + v.Ya * v.Tload : undefined,
              work: v => v.P1 !== undefined ? '\\(P = (' + H.fmt(v.V) + ')(' + H.fmt(v.X) + ')(' + H.fmt(v.R) + ') + ' + H.fmt(v.Ya) + '(' + H.fmt(v.Tload) + ') = ' + H.fmt(v.P1) + '\\text{ lb}\\)' : null },
          ] },
        { id: 'C1', title: 'Steps 3–5 — required C, candidate bearing, its Co', eq: '14-3', fig: ['t14-3a', 't14-3b', 't14-3c'], when: thrust,
          formula: 'C = P \\left(\\frac{L_d}{C_R \\cdot 10^6}\\right)^{1/k}',
          vars: [
            { id: 'C1', symbol: 'C', label: 'Required C (1st)', unit: 'lb', kind: 'calc', digits: 4, compute: v => Creq(v, v.P1),
              work: v => v.C1 !== undefined ? '\\(C = ' + H.fmt(v.P1) + '\\left(\\dfrac{' + H.fmt(v.Ld) + '}{' + H.fmt(v.CR) + '\\times10^6}\\right)^{1/' + H.fmt(v.k) + '} = ' + H.fmt(v.C1) + '\\text{ lb}\\)' : null },
            { id: 'bear1', label: 'Candidate bearing', kind: 'input', type: 'text', hint: 'e.g. 6316 (bore 80 mm = 3.1496 in)' },
            { id: 'bore1', symbol: 'd', label: 'Bore', unit: 'in', kind: 'lookup', fig: 't14-3b', check: v => (H.has(v, 'bore1', 'Dmin') && v.bore1 < v.Dmin) ? 'Bore < Dmin' : null },
            { id: 'Csel1', symbol: 'C_{cat}', label: 'Catalogue dynamic C', unit: 'lb', kind: 'lookup', fig: 't14-3b' },
            { id: 'Co1', symbol: 'C_o', label: 'Catalogue static Co', unit: 'lb', kind: 'lookup', fig: 't14-3b' },
          ] },
        { id: 'Y1', title: 'Steps 6–9 — T/Co, e, check T/R > e, new Y, recompute P and C', fig: ['t14-5'], when: thrust,
          text: 'If <i>T/R &lt; e</i> the thrust is negligible: use <i>P = VR</i> (Eq. 14-4) and proceed as pure radial. Otherwise read <i>Y</i> from Table 14-5 at the actual <i>T/C<sub>o</sub></i> (auto = linear interpolation; override with your reading). ' +
            'Note: Mott Ex. 14-4 reads e ≈ 0.25 and Y = 1.78 at T/C<sub>o</sub> = 0.0347 (the example uses those); straight-line interpolation of the table gives e = 0.23, Y = 1.92 — the same 6316 bearing results either way.',
          vars: [
            { id: 'TCo1', symbol: 'T/C_o', label: 'Thrust ratio', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'Tload', 'Co1') && v.Co1 > 0 ? v.Tload / v.Co1 : undefined },
            { id: 'e1', symbol: 'e', label: 'Limit ratio e', unit: '', kind: 'lookup', fig: 't14-5', auto: v => v.TCo1 !== undefined ? H.interp(v.TCo1, TC0, E) : undefined },
            { id: 'TR', symbol: 'T/R', label: 'Thrust-to-radial ratio', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'Tload', 'R') && v.R > 0 ? v.Tload / v.R : undefined },
            { id: 'Yb', symbol: 'Y', label: 'Thrust factor from Table 14-5', unit: '', kind: 'lookup', fig: 't14-5', auto: v => v.TCo1 !== undefined ? H.interp(v.TCo1, TC0, Y) : undefined },
            { id: 'P2', symbol: 'P', label: 'Equivalent load (2nd)', unit: 'lb', kind: 'calc', digits: 4,
              compute: v => !H.has(v, 'V', 'R', 'TR', 'e1') ? undefined : v.TR > v.e1 ? (H.has(v, 'X', 'Yb', 'Tload') ? v.V * v.X * v.R + v.Yb * v.Tload : undefined) : v.V * v.R,
              work: v => v.P2 === undefined ? null : v.TR > v.e1 ? '\\(T/R = ' + H.fmt(v.TR) + ' > e = ' + H.fmt(v.e1) + ':\\ P = (' + H.fmt(v.V) + ')(' + H.fmt(v.X) + ')(' + H.fmt(v.R) + ') + ' + H.fmt(v.Yb) + '(' + H.fmt(v.Tload) + ') = ' + H.fmt(v.P2) + '\\)' : '\\(T/R \\le e:\\ P = VR = ' + H.fmt(v.P2) + '\\)' },
            { id: 'C2', symbol: 'C', label: 'Required C (2nd)', unit: 'lb', kind: 'calc', digits: 4, compute: v => Creq(v, v.P2),
              work: v => v.C2 !== undefined ? '\\(C = ' + H.fmt(v.P2) + '\\left(\\dfrac{' + H.fmt(v.Ld) + '}{' + H.fmt(v.CR) + '\\times10^6}\\right)^{1/' + H.fmt(v.k) + '} = ' + H.fmt(v.C2) + '\\text{ lb}\\)' : null },
            { id: 'bear2', label: 'Bearing that satisfies the new C', kind: 'input', type: 'text' },
            { id: 'Csel2', symbol: 'C_{cat}', label: 'Its catalogue C', unit: 'lb', kind: 'lookup', fig: 't14-3b' },
            { id: 'Co2', symbol: 'C_o', label: 'Its catalogue Co (if different bearing)', unit: 'lb', kind: 'lookup', fig: 't14-3b' },
          ],
          after: v => !H.has(v, 'Csel1', 'Csel2', 'C2') ? '' : (v.Csel1 >= v.C2 && v.Csel1 === v.Csel2) ? '<span class="result-ok">Candidate ' + (v.bear1 || '') + ' still satisfies C = ' + H.fmt(v.C2) + ' lb → converged (Mott Ex. 14-4). ✔</span>' : '<span class="result-ok">Bearing changed — run iteration 2 with the new Co.</span>' },
      ] },

      { title: 'Radial + thrust — iteration 2', steps: [
        { id: 'it2', title: 'Repeat Steps 5–9 with the new Co', fig: ['t14-5', 't14-3b'], when: v => thrust(v) && H.has(v, 'Co2'),
          vars: [
            { id: 'TCo2', symbol: 'T/C_o', label: 'Thrust ratio', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'Tload', 'Co2') && v.Co2 > 0 ? v.Tload / v.Co2 : undefined },
            { id: 'e2', symbol: 'e', label: 'e', unit: '', kind: 'lookup', fig: 't14-5', auto: v => v.TCo2 !== undefined ? H.interp(v.TCo2, TC0, E) : undefined },
            { id: 'Yc', symbol: 'Y', label: 'Y', unit: '', kind: 'lookup', fig: 't14-5', auto: v => v.TCo2 !== undefined ? H.interp(v.TCo2, TC0, Y) : undefined },
            { id: 'P3', symbol: 'P', label: 'Equivalent load (3rd)', unit: 'lb', kind: 'calc', digits: 4,
              compute: v => !H.has(v, 'V', 'R', 'TR', 'e2') ? undefined : v.TR > v.e2 ? (H.has(v, 'X', 'Yc', 'Tload') ? v.V * v.X * v.R + v.Yc * v.Tload : undefined) : v.V * v.R },
            { id: 'C3', symbol: 'C', label: 'Required C (3rd)', unit: 'lb', kind: 'calc', digits: 4, compute: v => Creq(v, v.P3) },
            { id: 'bear3', label: 'Bearing selected now', kind: 'input', type: 'text' },
            { id: 'Csel3', symbol: 'C_{cat}', label: 'Its catalogue C', unit: 'lb', kind: 'lookup', fig: 't14-3b' },
          ],
          after: v => !H.has(v, 'Csel2', 'Csel3', 'C3') ? '' : (v.Csel2 === v.Csel3 && v.Csel3 >= v.C3) ? '<span class="result-ok">Same bearing twice → converged. ✔</span>' : '<span class="result-bad">Not converged — feed the new Co back into iteration 1 and repeat.</span>' },
      ] },

      { title: 'Result', steps: [
        { id: 'res', title: 'Final bearing', fig: ['t14-3a', 'skf-dg'],
          text: 'Record bearing number, bore, OD, width, fillet radius and shoulder diameters S / H from Table 14-3 — the bore becomes the minimum shaft diameter at the seat (Fizz Step 23).',
          vars: [
            { id: 'final', label: 'Status', kind: 'calc', compute: v => {
              if (!thrust(v)) return H.has(v, 'CselR', 'Creq') ? (v.CselR >= v.Creq ? 'PASS' : 'FAIL') : undefined;
              const req = v.C3 !== undefined ? v.C3 : v.C2; const cat = v.Csel3 !== undefined ? v.Csel3 : v.Csel2;
              return (req === undefined || cat === undefined) ? undefined : cat >= req ? 'PASS' : 'FAIL';
            } },
          ],
          after: v => v.final === undefined ? '' : v.final === 'PASS' ? '<span class="result-ok">Selected bearing meets the required dynamic load rating for ' + H.fmt(v.Lh) + ' h at ' + H.fmt(v.n) + ' rpm, ' + v.rel + ' % reliability.</span>' : '<span class="result-bad">Selected bearing is under-rated.</span>' },
      ] },
    ],
  };
})();
