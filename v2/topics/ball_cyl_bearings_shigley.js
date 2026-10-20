/* Ball & cylindrical roller bearings — Shigley 11e Ch. 11 (Secs 11-3 .. 11-8).
 * Procedure: Fizz bible pp. 96-100 (radial only + radial & thrust with Y2 iteration). Mech bible has no bearings unit. */
(function () {
  // Table 11-1 data for auto-interpolation
  const FaC0 = [0.014, 0.021, 0.028, 0.042, 0.056, 0.070, 0.084, 0.110, 0.17, 0.28, 0.42, 0.56];
  const E = [0.19, 0.21, 0.22, 0.24, 0.26, 0.27, 0.28, 0.30, 0.34, 0.38, 0.42, 0.44];
  const Y2 = [2.30, 2.15, 1.99, 1.85, 1.71, 1.63, 1.55, 1.45, 1.31, 1.15, 1.04, 1.00];
  const toKN = v => v.unit === 'N' ? 1e-3 : v.unit === 'kN' ? 1 : 1 / 224.809;   // load unit → kN
  const lnTerm = v => v.relEq === 'Eq. 11-10 (1 − R_D)' ? (1 - v.RD) : Math.log(1 / v.RD);
  const bracket = v => H.has(v, 'xD', 'x0', 'th', 'b', 'RD') && v.RD > 0 && v.RD < 1 ? v.xD / (v.x0 + (v.th - v.x0) * Math.pow(lnTerm(v), 1 / v.b)) : undefined;
  const c10 = (v, FD) => (bracket(v) !== undefined && H.has(v, 'af', 'a') && FD !== undefined) ? v.af * FD * Math.pow(bracket(v), 1 / v.a) : undefined;
  const thrust = v => v.mode === 'radial + thrust';

  window.TOPIC = {
    id: 'ball_cyl_bearings', book: 'shigley',
    title: 'Ball & Cylindrical Roller Bearings',
    subtitle: 'Shigley Ch. 11 Secs 11-3 to 11-8 · Fizz pp. 96-100 · Weibull C10 method',
    sibling: 'ball_cyl_bearings_mott.html',
    intro: 'Find the catalogue rating <i>C<sub>10</sub></i> a deep-groove / angular-contact ball bearing or a cylindrical roller bearing must have, then pick it from Table 11-2 or 11-3. ' +
      'Radial-only loads go straight to Eq. (11-9); a thrust component needs the equivalent load <i>F<sub>e</sub> = X<sub>i</sub>VF<sub>r</sub> + Y<sub>i</sub>F<sub>a</sub></i> (Eq. 11-12) with ' +
      '<i>Y<sub>2</sub></i> from Table 11-1 — which depends on the <i>C<sub>0</sub></i> of the bearing you have not chosen yet, so the Fizz bible iterates: assume <i>Y<sub>2</sub></i> = 1.63, size, pick, read <i>C<sub>0</sub></i>, re-interpolate, repeat until the same bearing comes up twice. ' +
      'Two iteration rounds are laid out below (Shigley Ex. 11-7 converges in two).',
    example: { mode: 'radial + thrust', unit: 'lbf', H: 25, T: 2404, Fx: 356.6, Fy: 297.5, Fa: 344, Rtot: 0.96, nb: 4, LDh: 10000, mfr: 2, af: 1.2, btype: 'angular-contact ball (a = 3)', ring: 'inner ring rotates (V = 1)', relEq: 'Eq. 11-10 (1 − R_D)', X2: 0.56, Y2a: 1.63, C10sel1: 55.9, C0sel1: 35.5, C10sel2: 63.7, C0sel2: 41.5, C10sel3: 63.7 },

    figures: [
      { id: 'fig11-1', ref: 'Figure 11-1', title: 'Nomenclature of a ball bearing (bore, OD, width, races, separator)', src: 'figures/shigley/fig11-1.png', page: 598 },
      { id: 'fig11-2', ref: 'Figure 11-2', title: 'Types of ball bearings: deep-groove, filling notch, angular-contact, shielded, sealed, self-aligning, thrust', src: 'figures/shigley/fig11-2.png', page: 598 },
      { id: 'fig11-8', ref: 'Figure 11-8', title: 'Shaft and housing shoulder diameters dS, dH (for Table 11-2)', src: 'figures/shigley/fig11-8.png', page: 609 },
      { id: 'fig11-5', ref: 'Figure 11-5', title: 'Constant-reliability contours: moving from design point D (FD, xD, RD) to catalogue point A (C10, x = 1, R = 0.90)', src: 'figures/shigley/fig11-5.png', page: 605 },
      { id: 'fig11-6', ref: 'Figure 11-6', title: 'Fe/(VFr) vs Fa/(VFr): the two straight-line segments that define e, X and Y', src: 'figures/shigley/fig11-6.png', page: 607 },
      { id: 't11-4', ref: 'Table 11-4', title: 'Bearing-life recommendations for various classes of machinery (kh)', src: 'figures/shigley/table11-4.png', page: 610 },
      { id: 't11-5', ref: 'Table 11-5', title: 'Load-application factors af', src: 'figures/shigley/table11-5.png', page: 610 },
      { id: 't11-6', ref: 'Table 11-6', title: 'Weibull parameters (x0, θ, b) and rating life for manufacturers 1 (Timken, 90×10⁶ rev) and 2 (SKF, 10⁶ rev)', src: 'figures/shigley/table11-6.png', page: 634,
        note: 'Tables 11-2 and 11-3 are based on manufacturer 2.' },
      { id: 't11-1', ref: 'Table 11-1', title: 'Equivalent radial load factors e, X1, Y1, X2, Y2 vs Fa/C0 for ball bearings', src: 'figures/shigley/table11-1.png', page: 607,
        note: 'Use 0.014 if Fa/C0 < 0.014. Interpolate linearly for e and Y2 (Ex. 11-4). Cylindrical roller bearings: Y = 0 always.' },
      { id: 't11-2', ref: 'Table 11-2', title: 'Dimensions and load ratings (C10, C0 in kN) for 02-series deep-groove and angular-contact ball bearings', src: 'figures/shigley/table11-2.png', page: 608,
        note: 'Pick the first bore whose C10 ≥ required. Record C0 for the thrust iteration.' },
      { id: 't11-3', ref: 'Table 11-3', title: 'Dimensions and basic load ratings for cylindrical roller bearings (02- and 03-series)', src: 'figures/shigley/table11-3.png', page: 609 },
    ],

    sections: [
      { title: 'Inputs', steps: [
        { id: 'mode', title: 'Loading case, units and bearing type', fig: ['fig11-1', 'fig11-2'],
          vars: [
            { id: 'mode', label: 'Loading', kind: 'choice', type: 'text', default: 'radial only', options: ['radial only', 'radial + thrust'] },
            { id: 'unit', label: 'Load unit used below', kind: 'choice', type: 'text', default: 'lbf', options: ['lbf', 'N', 'kN'], hint: 'tables 11-2/11-3 are in kN; C10 is also shown in kN' },
            { id: 'btype', label: 'Bearing type', kind: 'choice', type: 'text', default: 'deep-groove ball (a = 3)', options: ['deep-groove ball (a = 3)', 'angular-contact ball (a = 3)', 'cylindrical roller (a = 10/3)'] },
            { id: 'a', symbol: 'a', label: 'Load-life exponent', unit: '', kind: 'calc', digits: 4, compute: v => v.btype ? (/roller/.test(v.btype) ? 10 / 3 : 3) : undefined },
          ] },
        { id: 'speed', title: 'Step 1 — angular speed', eq: '3-42', formula: 'n_D = \\frac{63\\,025\\,H}{T}',
          text: 'Enter <i>n<sub>D</sub></i> directly if given. Otherwise find the torque from the FBD (<i>T = F·d</i>, lbf·in) and the power <i>H</i> in hp (Shigley Ex. 11-7: T = 595(4.04) = 2404 lbf·in, H = 25 hp → 655.4 rev/min).',
          vars: [
            { id: 'H', symbol: 'H', label: 'Power', unit: 'hp', kind: 'input', hint: 'optional' },
            { id: 'T', symbol: 'T', label: 'Torque', unit: 'lbf·in', kind: 'input', hint: 'optional' },
            { id: 'nD', symbol: 'n_D', label: 'Speed', unit: 'rev/min', kind: 'input', auto: v => H.has(v, 'H', 'T') && v.T > 0 ? 63025 * v.H / v.T : undefined, hint: 'type it, or leave blank to use 63025H/T' },
          ] },
        { id: 'loads', title: 'Step 2 — radial (and thrust) load on the bearing', formula: 'F_r = \\sqrt{F_x^2 + F_y^2}',
          text: 'Bearing reaction components from the shaft FBD. For a thrust-carrying bearing also enter the axial load <i>F<sub>a</sub></i>.',
          vars: [
            { id: 'Fx', symbol: 'F_x', label: 'Radial reaction, x', kind: 'input' },
            { id: 'Fy', symbol: 'F_y', label: 'Radial reaction, y', kind: 'input' },
            { id: 'Fr', symbol: 'F_r', label: 'Radial load', kind: 'input', auto: v => H.has(v, 'Fx', 'Fy') ? Math.hypot(v.Fx, v.Fy) : undefined, hint: 'auto = √(Fx²+Fy²); or type it',
              work: v => H.has(v, 'Fx', 'Fy') ? '\\(F_r = \\sqrt{' + H.fmt(v.Fx) + '^2 + ' + H.fmt(v.Fy) + '^2} = ' + H.fmt(Math.hypot(v.Fx, v.Fy)) + '\\)' : null },
            { id: 'Fa', symbol: 'F_a', label: 'Axial (thrust) load', kind: 'input', hint: 'radial + thrust case only' },
          ] },
        { id: 'rel', title: 'Step 3 — reliability of each bearing', formula: 'R_D = R_i = \\sqrt[n]{R_{tot}}',
          text: 'If the problem gives the reliability of the whole set of <i>n</i> bearings, each bearing needs <i>R<sub>tot</sub><sup>1/n</sup></i> (Shigley Sec. 11-5: R = R<sub>A</sub>R<sub>B</sub>). Ex. 11-7: ⁴√0.96 = 0.99.',
          vars: [
            { id: 'Rtot', symbol: 'R_{tot}', label: 'Reliability goal of the ensemble', unit: '', kind: 'input', default: 0.90 },
            { id: 'nb', symbol: 'n', label: 'Number of bearings sharing the goal', unit: '', kind: 'input', default: 1 },
            { id: 'RD', symbol: 'R_D', label: 'Design reliability per bearing', unit: '', kind: 'calc', digits: 5, compute: v => H.has(v, 'Rtot', 'nb') && v.nb > 0 ? Math.pow(v.Rtot, 1 / v.nb) : undefined,
              work: v => v.RD !== undefined ? '\\(R_D = ' + H.fmt(v.Rtot) + '^{1/' + H.fmt(v.nb) + '} = ' + H.fmt(v.RD, 5) + '\\)' : null },
          ] },
        { id: 'life', title: 'Step 4–5 — design life and multiple of rating life', eq: '11-3', fig: ['t11-4', 't11-6', 'fig11-5'],
          formula: 'x_D = \\frac{L_D}{L_{10}} = \\frac{60\\,\\mathcal{L}_D\\, n_D}{L_{10}}',
          text: 'Read the life in hours from Table 11-4 if not given. The rating life <i>L<sub>10</sub></i> and the Weibull parameters come from Table 11-6 — manufacturer 1 (Timken) rates at 90×10⁶ rev, manufacturer 2 (SKF, used for Tables 11-2/11-3) at 10⁶ rev.',
          vars: [
            { id: 'LDh', symbol: '\\mathcal{L}_D', label: 'Design life', unit: 'h', kind: 'lookup', fig: 't11-4' },
            { id: 'mfr', label: 'Manufacturer (Weibull set)', kind: 'choice', default: 2, options: [{ label: '1 — Timken (90×10⁶ rev; x0 = 0, θ = 4.48, b = 1.5)', value: 1 }, { label: '2 — SKF (10⁶ rev; x0 = 0.02, θ = 4.459, b = 1.483)', value: 2 }] },
            { id: 'L10', symbol: 'L_{10}', label: 'Rating life', unit: 'rev', kind: 'lookup', fig: 't11-6', auto: v => v.mfr === 1 ? 90e6 : v.mfr === 2 ? 1e6 : undefined },
            { id: 'x0', symbol: 'x_0', label: 'Weibull x0', unit: '', kind: 'lookup', fig: 't11-6', auto: v => v.mfr === 1 ? 0 : v.mfr === 2 ? 0.02 : undefined },
            { id: 'th', symbol: '\\theta', label: 'Weibull θ', unit: '', kind: 'lookup', fig: 't11-6', auto: v => v.mfr === 1 ? 4.48 : v.mfr === 2 ? 4.459 : undefined },
            { id: 'b', symbol: 'b', label: 'Weibull b', unit: '', kind: 'lookup', fig: 't11-6', auto: v => v.mfr === 1 ? 1.5 : v.mfr === 2 ? 1.483 : undefined },
            { id: 'LDrev', symbol: 'L_D', label: 'Design life in revolutions', unit: 'rev', kind: 'calc', digits: 4, compute: v => H.has(v, 'LDh', 'nD') ? 60 * v.LDh * v.nD : undefined },
            { id: 'xD', symbol: 'x_D', label: 'Multiple of rating life', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'LDrev', 'L10') && v.L10 > 0 ? v.LDrev / v.L10 : undefined,
              work: v => v.xD !== undefined ? '\\(x_D = \\dfrac{60(' + H.fmt(v.LDh) + ')(' + H.fmt(v.nD) + ')}{' + H.fmt(v.L10) + '} = ' + H.fmt(v.xD) + '\\)' : null },
          ] },
        { id: 'af', title: 'Step 6 — application factor', fig: ['t11-5'],
          vars: [
            { id: 'af', symbol: 'a_f', label: 'Load-application factor', unit: '', kind: 'lookup', fig: 't11-5', default: 1.2, hint: 'commercial gearing 1.1–1.3; light impact 1.2–1.5' },
            { id: 'relEq', label: 'Reliability term', kind: 'choice', type: 'text', default: 'Eq. 11-9 ln(1/R_D)', options: ['Eq. 11-9 ln(1/R_D)', 'Eq. 11-10 (1 − R_D)'], hint: 'Fizz writes ln(1/RD); Shigley examples use the (1−RD) approximation — nearly identical for R ≥ 0.9' },
          ] },
      ] },

      { title: 'Radial load only (Fizz 4.2.2)', steps: [
        { id: 'c10r', title: 'Step 7 — required catalogue rating', eq: '11-9', fig: ['fig11-5'], when: v => !thrust(v),
          formula: 'C_{10} = a_f F_D \\left[\\frac{x_D}{x_0 + (\\theta - x_0)\\,[\\ln(1/R_D)]^{1/b}}\\right]^{1/a}',
          text: '<i>F<sub>D</sub> = F<sub>r</sub></i> for a purely radial load. a = 3 for ball, 10/3 for roller bearings.',
          vars: [
            { id: 'brk', label: 'Bracket term xD / (x0 + (θ−x0)[…]^{1/b})', unit: '', kind: 'calc', digits: 4, compute: v => bracket(v) },
            { id: 'C10r', symbol: 'C_{10}', label: 'Required rating', kind: 'calc', digits: 4, compute: v => c10(v, v.Fr),
              work: v => v.C10r !== undefined ? '\\(C_{10} = ' + H.fmt(v.af) + '(' + H.fmt(v.Fr) + ')\\left[' + H.fmt(v.brk) + '\\right]^{1/' + H.fmt(v.a) + '} = ' + H.fmt(v.C10r) + '\\ ' + v.unit + '\\)' : null },
            { id: 'C10rkN', symbol: 'C_{10}', label: 'Required rating in kN', unit: 'kN', kind: 'calc', digits: 4, compute: v => v.C10r !== undefined ? v.C10r * toKN(v) : undefined },
          ] },
        { id: 'selr', title: 'Step 8 — select the bearing', fig: ['t11-2', 't11-3', 'fig11-8'], when: v => !thrust(v),
          text: 'Table 11-2 for ball bearings, Table 11-3 for cylindrical rollers. Take the first bore whose C10 ≥ the value above (also check the bore fits the shaft).',
          vars: [
            { id: 'boreR', label: 'Selected bearing (bore, mm / series)', kind: 'input', type: 'text', hint: 'e.g. 02-25 mm' },
            { id: 'C10selR', symbol: 'C_{10,cat}', label: 'Catalogue C10 of selection', unit: 'kN', kind: 'lookup', fig: 't11-2',
              check: v => (H.has(v, 'C10selR', 'C10rkN') && v.C10selR < v.C10rkN) ? 'Catalogue C10 is below the required value' : null },
            { id: 'Ract', symbol: 'R', label: 'Reliability actually achieved (Eq. 11-21)', unit: '', kind: 'calc', digits: 6,
              compute: v => H.has(v, 'C10selR', 'xD', 'af', 'Fr', 'a', 'x0', 'th', 'b') && v.C10selR > 0 ? Math.exp(-Math.pow((v.xD * Math.pow(v.af * v.Fr * toKN(v) / v.C10selR, v.a) - v.x0) / (v.th - v.x0), v.b)) : undefined },
          ],
          after: v => !H.has(v, 'C10selR', 'C10rkN') ? '' : v.C10selR >= v.C10rkN ? '<span class="result-ok">' + (v.boreR || 'Selected bearing') + ': C10 = ' + H.fmt(v.C10selR) + ' kN ≥ ' + H.fmt(v.C10rkN) + ' kN required ✔ (R ≈ ' + H.fmt(v.Ract, 5) + ')</span>' : '<span class="result-bad">Pick a larger bearing — C10 must be ≥ ' + H.fmt(v.C10rkN) + ' kN</span>' },
      ] },

      { title: 'Radial + thrust (Fizz 4.2.3) — iteration 1', steps: [
        { id: 'V', title: 'Steps 1–2 — rotation factor and first-guess X2, Y2', eq: '11-12', fig: ['fig11-6', 't11-1'], when: thrust,
          formula: 'F_e = X_i V F_r + Y_i F_a',
          text: 'V = 1 when the inner ring rotates, 1.2 for the outer ring (self-aligning: always 1). Assume <i>F<sub>a</sub>/(VF<sub>r</sub>) &gt; e</i> and start with the middle of Table 11-1: X2 = 0.56, Y2 = 1.63.',
          vars: [
            { id: 'ring', label: 'Rotating ring', kind: 'choice', type: 'text', default: 'inner ring rotates (V = 1)', options: ['inner ring rotates (V = 1)', 'outer ring rotates (V = 1.2)'] },
            { id: 'V', symbol: 'V', label: 'Rotation factor', unit: '', kind: 'calc', digits: 2, compute: v => v.ring ? (/outer/.test(v.ring) ? 1.2 : 1) : undefined },
            { id: 'X2', symbol: 'X_2', label: 'Radial factor (constant in Table 11-1)', unit: '', kind: 'lookup', fig: 't11-1', default: 0.56 },
            { id: 'Y2a', symbol: 'Y_2', label: 'Assumed thrust factor', unit: '', kind: 'lookup', fig: 't11-1', default: 1.63 },
            { id: 'Fe1', symbol: 'F_e', label: 'Equivalent radial load (1st)', kind: 'calc', digits: 4, compute: v => H.has(v, 'X2', 'V', 'Fr', 'Y2a', 'Fa') ? v.X2 * v.V * v.Fr + v.Y2a * v.Fa : undefined,
              work: v => v.Fe1 !== undefined ? '\\(F_e = ' + H.fmt(v.X2) + '(' + H.fmt(v.V) + ')(' + H.fmt(v.Fr) + ') + ' + H.fmt(v.Y2a) + '(' + H.fmt(v.Fa) + ') = ' + H.fmt(v.Fe1) + '\\ ' + v.unit + '\\)' : null },
          ] },
        { id: 'c10t', title: 'Steps 4–5 — first C10 and tentative bearing', eq: '11-9', fig: ['t11-2'], when: thrust,
          formula: 'C_{10} = a_f F_e \\left[\\frac{x_D}{x_0 + (\\theta - x_0)[\\ln(1/R_D)]^{1/b}}\\right]^{1/a}',
          vars: [
            { id: 'brk2', label: 'Bracket term', unit: '', kind: 'calc', digits: 4, compute: v => bracket(v) },
            { id: 'C10t1', symbol: 'C_{10}', label: 'Required rating (1st)', kind: 'calc', digits: 4, compute: v => c10(v, v.Fe1),
              work: v => v.C10t1 !== undefined ? '\\(C_{10} = ' + H.fmt(v.af) + '(' + H.fmt(v.Fe1) + ')\\left[' + H.fmt(v.brk2) + '\\right]^{1/' + H.fmt(v.a) + '} = ' + H.fmt(v.C10t1) + '\\ ' + v.unit + ' = ' + H.fmt(v.C10t1 * toKN(v)) + '\\text{ kN}\\)' : null },
            { id: 'C10t1kN', symbol: 'C_{10}', label: 'Required rating (1st) in kN', unit: 'kN', kind: 'calc', digits: 4, compute: v => v.C10t1 !== undefined ? v.C10t1 * toKN(v) : undefined },
            { id: 'bore1', label: 'Tentative bearing', kind: 'input', type: 'text', hint: 'e.g. angular-contact 02-60 mm' },
            { id: 'C10sel1', symbol: 'C_{10,cat}', label: 'Catalogue C10 of tentative bearing', unit: 'kN', kind: 'lookup', fig: 't11-2' },
            { id: 'C0sel1', symbol: 'C_0', label: 'Catalogue C0 of tentative bearing (Step 6)', unit: 'kN', kind: 'lookup', fig: 't11-2' },
          ] },
        { id: 'y2a', title: 'Steps 7–11 — Fa/C0, e, check Fa/(VFr) > e, interpolate Y2, recompute Fe', fig: ['t11-1'], when: thrust,
          formula: 'Y_2 = Y_{2,1} + \\frac{Y_{2,2}-Y_{2,1}}{x_2 - x_1}\\left(\\frac{F_a}{C_0} - x_1\\right)',
          text: 'If <i>F<sub>a</sub>/(VF<sub>r</sub>) ≤ e</i> the thrust is small: X1 = 1, Y1 = 0 and <i>F<sub>e</sub> = VF<sub>r</sub></i>. Otherwise interpolate Y2 in Table 11-1 at the actual <i>F<sub>a</sub>/C<sub>0</sub></i> (auto below; override with your own reading).',
          vars: [
            { id: 'FaC01', symbol: 'F_a/C_0', label: 'Thrust ratio', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'Fa', 'C0sel1') && v.C0sel1 > 0 ? v.Fa * toKN(v) / v.C0sel1 : undefined,
              work: v => v.FaC01 !== undefined ? '\\(F_a/C_0 = ' + H.fmt(v.Fa * toKN(v)) + '/' + H.fmt(v.C0sel1) + ' = ' + H.fmt(v.FaC01) + '\\)' : null },
            { id: 'e1', symbol: 'e', label: 'Limit ratio e', unit: '', kind: 'lookup', fig: 't11-1', auto: v => v.FaC01 !== undefined ? H.interp(v.FaC01, FaC0, E) : undefined },
            { id: 'ratio1', symbol: 'F_a/(VF_r)', label: 'Thrust-to-radial ratio', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'Fa', 'V', 'Fr') && v.Fr > 0 ? v.Fa / (v.V * v.Fr) : undefined },
            { id: 'Y2b', symbol: 'Y_2', label: 'Interpolated thrust factor', unit: '', kind: 'lookup', fig: 't11-1', auto: v => v.FaC01 !== undefined ? H.interp(v.FaC01, FaC0, Y2) : undefined },
            { id: 'Fe2', symbol: 'F_e', label: 'Equivalent load (2nd)', kind: 'calc', digits: 4,
              compute: v => !H.has(v, 'V', 'Fr', 'Fa', 'ratio1', 'e1') ? undefined : v.ratio1 > v.e1 ? (H.has(v, 'X2', 'Y2b') ? v.X2 * v.V * v.Fr + v.Y2b * v.Fa : undefined) : v.V * v.Fr,
              work: v => v.Fe2 === undefined ? null : v.ratio1 > v.e1 ? '\\(F_a/(VF_r) = ' + H.fmt(v.ratio1) + ' > e = ' + H.fmt(v.e1) + ':\\ F_e = ' + H.fmt(v.X2) + '(' + H.fmt(v.V) + ')(' + H.fmt(v.Fr) + ') + ' + H.fmt(v.Y2b) + '(' + H.fmt(v.Fa) + ') = ' + H.fmt(v.Fe2) + '\\)' : '\\(F_a/(VF_r) = ' + H.fmt(v.ratio1) + ' \\le e:\\ F_e = VF_r = ' + H.fmt(v.Fe2) + '\\)' },
          ] },
        { id: 'c10t2', title: 'Steps 12–13 — new C10 (shortcut) and re-select', fig: ['t11-2'], when: thrust,
          formula: 'C_{10,new} = \\frac{F_{e,new}}{F_{e,old}}\\, C_{10,old}',
          vars: [
            { id: 'C10t2kN', symbol: 'C_{10}', label: 'Required rating (2nd)', unit: 'kN', kind: 'calc', digits: 4, compute: v => H.has(v, 'Fe2', 'Fe1', 'C10t1kN') && v.Fe1 > 0 ? v.Fe2 / v.Fe1 * v.C10t1kN : undefined,
              work: v => v.C10t2kN !== undefined ? '\\(C_{10} = \\dfrac{' + H.fmt(v.Fe2) + '}{' + H.fmt(v.Fe1) + '}(' + H.fmt(v.C10t1kN) + ') = ' + H.fmt(v.C10t2kN) + '\\text{ kN}\\)' : null },
            { id: 'bore2', label: 'Bearing selected now', kind: 'input', type: 'text' },
            { id: 'C10sel2', symbol: 'C_{10,cat}', label: 'Catalogue C10', unit: 'kN', kind: 'lookup', fig: 't11-2' },
            { id: 'C0sel2', symbol: 'C_0', label: 'Catalogue C0', unit: 'kN', kind: 'lookup', fig: 't11-2' },
          ],
          after: v => !H.has(v, 'C10sel1', 'C10sel2') ? '' : (v.C10sel1 === v.C10sel2 && v.C10sel2 >= v.C10t2kN) ? '<span class="result-ok">Same bearing selected twice → converged (Step 14). Done.</span>' : '<span class="result-ok">Different bearing (or under-rated) — do iteration 2 below with the new C0.</span>' },
      ] },

      { title: 'Radial + thrust — iteration 2', steps: [
        { id: 'it2', title: 'Repeat Steps 6–13 with the new C0', fig: ['t11-1', 't11-2'], when: v => thrust(v) && H.has(v, 'C0sel2'),
          vars: [
            { id: 'FaC02', symbol: 'F_a/C_0', label: 'Thrust ratio', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'Fa', 'C0sel2') && v.C0sel2 > 0 ? v.Fa * toKN(v) / v.C0sel2 : undefined },
            { id: 'e2', symbol: 'e', label: 'Limit ratio e', unit: '', kind: 'lookup', fig: 't11-1', auto: v => v.FaC02 !== undefined ? H.interp(v.FaC02, FaC0, E) : undefined },
            { id: 'Y2c', symbol: 'Y_2', label: 'Interpolated thrust factor', unit: '', kind: 'lookup', fig: 't11-1', auto: v => v.FaC02 !== undefined ? H.interp(v.FaC02, FaC0, Y2) : undefined },
            { id: 'Fe3', symbol: 'F_e', label: 'Equivalent load (3rd)', kind: 'calc', digits: 4,
              compute: v => !H.has(v, 'V', 'Fr', 'Fa', 'ratio1', 'e2') ? undefined : v.ratio1 > v.e2 ? (H.has(v, 'X2', 'Y2c') ? v.X2 * v.V * v.Fr + v.Y2c * v.Fa : undefined) : v.V * v.Fr,
              work: v => v.Fe3 !== undefined && v.ratio1 > v.e2 ? '\\(F_e = ' + H.fmt(v.X2) + '(' + H.fmt(v.V) + ')(' + H.fmt(v.Fr) + ') + ' + H.fmt(v.Y2c) + '(' + H.fmt(v.Fa) + ') = ' + H.fmt(v.Fe3) + '\\)' : null },
            { id: 'C10t3kN', symbol: 'C_{10}', label: 'Required rating (3rd)', unit: 'kN', kind: 'calc', digits: 4, compute: v => H.has(v, 'Fe3', 'Fe1', 'C10t1kN') && v.Fe1 > 0 ? v.Fe3 / v.Fe1 * v.C10t1kN : undefined,
              work: v => v.C10t3kN !== undefined ? '\\(C_{10} = \\dfrac{' + H.fmt(v.Fe3) + '}{' + H.fmt(v.Fe1) + '}(' + H.fmt(v.C10t1kN) + ') = ' + H.fmt(v.C10t3kN) + '\\text{ kN}\\)' : null },
            { id: 'bore3', label: 'Bearing selected now', kind: 'input', type: 'text' },
            { id: 'C10sel3', symbol: 'C_{10,cat}', label: 'Catalogue C10', unit: 'kN', kind: 'lookup', fig: 't11-2' },
          ],
          after: v => !H.has(v, 'C10sel2', 'C10sel3', 'C10t3kN') ? '' : (v.C10sel2 === v.C10sel3 && v.C10sel3 >= v.C10t3kN) ? '<span class="result-ok">Same bearing again → converged. Final: ' + (v.bore3 || v.bore2 || '') + ', C10 = ' + H.fmt(v.C10sel3) + ' kN ≥ ' + H.fmt(v.C10t3kN) + ' kN ✔</span>' : '<span class="result-bad">Not yet converged — copy the new C0 into "Catalogue C0" of iteration 1 and repeat (Fizz Step 14).</span>' },
      ] },

      { title: 'Result', steps: [
        { id: 'res', title: 'Final selection', fig: ['t11-2', 't11-3'],
          vars: [
            { id: 'final', label: 'Status', kind: 'calc', compute: v => {
              if (!thrust(v)) return H.has(v, 'C10selR', 'C10rkN') ? (v.C10selR >= v.C10rkN ? 'PASS' : 'FAIL') : undefined;
              const req = v.C10t3kN !== undefined ? v.C10t3kN : v.C10t2kN;
              const cat = v.C10sel3 !== undefined ? v.C10sel3 : v.C10sel2;
              if (req === undefined || cat === undefined) return undefined;
              return cat >= req ? 'PASS' : 'FAIL';
            } },
          ],
          after: v => v.final === undefined ? '' : v.final === 'PASS' ? '<span class="result-ok">Bearing selection satisfies the required C10 at R_D = ' + H.fmt(v.RD, 4) + ' for ' + H.fmt(v.LDh) + ' h at ' + H.fmt(v.nD) + ' rev/min.</span>' : '<span class="result-bad">Selected bearing is under-rated — choose the next larger bore.</span>' },
      ] },
    ],
  };
})();
