// Flat belts — Shigley Ch. 17-2 (merged Fizz §1.3 + Mech §8.3.1 procedure)
(function () {
  // Table 17-2 (Shigley) — flat / round belt materials. t in, γ lbf/in³, Fa lbf/in @600 ft/min, f, dmin in.
  const SPECS = {
    'Leather 1 ply, t = 11/64 in':  { t: 11 / 64, g: 0.040, Fa: 30,  f: 0.4, dmin: 3,    mat: 'leather' },
    'Leather 1 ply, t = 13/64 in':  { t: 13 / 64, g: 0.040, Fa: 33,  f: 0.4, dmin: 3.5,  mat: 'leather' },
    'Leather 2 ply, t = 18/64 in':  { t: 18 / 64, g: 0.040, Fa: 41,  f: 0.4, dmin: 4.5,  mat: 'leather' },
    'Leather 2 ply, t = 20/64 in':  { t: 20 / 64, g: 0.040, Fa: 50,  f: 0.4, dmin: 6,    mat: 'leather' },
    'Leather 2 ply, t = 23/64 in':  { t: 23 / 64, g: 0.040, Fa: 60,  f: 0.4, dmin: 9,    mat: 'leather' },
    'Polyamide F-0 (t = 0.03 in)':  { t: 0.03, g: 0.035, Fa: 10,  f: 0.5, dmin: 0.60, mat: 'F-0' },
    'Polyamide F-1 (t = 0.05 in)':  { t: 0.05, g: 0.035, Fa: 35,  f: 0.5, dmin: 1.0,  mat: 'F-1' },
    'Polyamide F-2 (t = 0.07 in)':  { t: 0.07, g: 0.051, Fa: 60,  f: 0.5, dmin: 2.4,  mat: 'F-2' },
    'Polyamide A-2 (t = 0.11 in)':  { t: 0.11, g: 0.037, Fa: 60,  f: 0.8, dmin: 2.4,  mat: 'A-2' },
    'Polyamide A-3 (t = 0.13 in)':  { t: 0.13, g: 0.042, Fa: 100, f: 0.8, dmin: 4.3,  mat: 'A-3' },
    'Polyamide A-4 (t = 0.20 in)':  { t: 0.20, g: 0.039, Fa: 175, f: 0.8, dmin: 9.5,  mat: 'A-4' },
    'Polyamide A-5 (t = 0.25 in)':  { t: 0.25, g: 0.039, Fa: 275, f: 0.8, dmin: 13.5, mat: 'A-5' },
    'Urethane flat 0.50 × 0.062 in': { t: 0.062, g: 0.042, Fa: 5.2,  f: 0.7, dmin: 0.38, mat: 'urethane', b: 0.50 },
    'Urethane flat 0.75 × 0.078 in': { t: 0.078, g: 0.042, Fa: 9.8,  f: 0.7, dmin: 0.50, mat: 'urethane', b: 0.75 },
    'Urethane flat 1.25 × 0.090 in': { t: 0.090, g: 0.042, Fa: 18.9, f: 0.7, dmin: 0.50, mat: 'urethane', b: 1.25 },
  };
  // Table 17-4 — Cp vs small-pulley diameter. Column breakpoints: 1.6–4 | 4.5–8 | 9–12.5 | 14,16 | 18–31.5 | >31.5
  const CP = {
    leather: [0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    'F-0': [0.95, 1, 1, 1, 1, 1], 'F-1': [0.70, 0.92, 0.95, 1, 1, 1], 'F-2': [0.73, 0.86, 0.96, 1, 1, 1],
    'A-2': [0.73, 0.86, 0.96, 1, 1, 1], 'A-3': [NaN, 0.70, 0.87, 0.94, 0.96, 1], 'A-4': [NaN, NaN, 0.71, 0.80, 0.85, 0.92],
    'A-5': [NaN, NaN, NaN, 0.72, 0.77, 0.91], urethane: [1, 1, 1, 1, 1, 1],
  };
  function cpCol(d) { return d <= 4.25 ? 0 : d <= 8.5 ? 1 : d <= 13 ? 2 : d <= 17 ? 3 : d <= 31.5 ? 4 : 5; }
  const spec = v => SPECS[v.spec];
  const isLeather = v => spec(v) && spec(v).mat === 'leather';
  const expf = v => (H.has(v, 'f', 'phi') ? Math.exp(v.f * v.phi) : undefined);

  window.TOPIC = {
    id: 'flat_belts', book: 'shigley',
    title: 'Flat Belts — Analysis & Design',
    subtitle: 'Shigley Ch. 17-2 · merged Fizz §1.3 + Mech §8.3.1 procedure',
    sibling: 'flat_belts_mott.html',
    intro: 'Analyse or size a flat (or round) belt drive with Shigley\'s nine-step method (Example 17-1). Start with the nominal power, speeds, pulley diameters and centre distance; pick a belt material from Table 17-2 and a width <i>b</i>; the calculator finds the wrap angle, belt speed, centrifugal tension, allowable tight-side tension (F<sub>1</sub>)<sub>a</sub>, F<sub>2</sub>, initial tension F<sub>i</sub>, the friction check f′ &lt; f, the factor of safety n<sub>fs</sub> and the catenary dip. Both bibles follow Shigley here (Mott does not cover flat-belt design).',
    example: { Hnom: 15, n: 1750, d: 6, D: 18, C: 96, Ks: 1.25, nd: 1.1, spec: 'Polyamide A-3 (t = 0.13 in)', b: 6, cfg: 'open' },

    figures: [
      { id: 'fig17-1', ref: 'Figure 17-1', title: 'Flat-belt geometry: open and crossed belts (wrap angle & length)', src: 'figures/shigley/fig17-1.png', page: 904, note: 'Open belt: φd = π − 2 sin⁻¹[(D−d)/2C]. Crossed belt: both pulleys φ = π + 2 sin⁻¹[(D+d)/2C].' },
      { id: 'fig17-2', ref: 'Figure 17-2', title: 'Nonreversing and reversing belt drives', src: 'figures/shigley/fig17-2.png', page: 904 },
      { id: 'fig17-7', ref: 'Figure 17-7', title: 'Forces and torques on a pulley (F1 = Fi + Fc + T/d, F2 = Fi + Fc − T/d)', src: 'figures/shigley/fig17-7.png', page: 908 },
      { id: 'fig17-8', ref: 'Figure 17-8', title: 'Belt tensions F1, F2 vs initial tension Fi', src: 'figures/shigley/fig17-8.png', page: 910 },
      { id: 'table17-2', ref: 'Table 17-2', title: 'Properties of flat- and round-belt materials (t, dmin, Fa, γ, f)', src: 'figures/shigley/table17-2.png', page: 911, note: 'Fa is the allowable tension per unit width at 600 ft/min. Leather γ range 0.035–0.045 → use ≈0.040.' },
      { id: 'table17-3', ref: 'Table 17-3', title: 'Minimum pulley sizes for urethane flat and round belts', src: 'figures/shigley/table17-3.png', page: 912 },
      { id: 'table17-4', ref: 'Table 17-4', title: 'Pulley correction factor Cp for flat belts', src: 'figures/shigley/table17-4.png', page: 912, note: 'Enter with the SMALL pulley diameter. Cp = 1.0 for urethane.' },
      { id: 'fig17-9', ref: 'Figure 17-9', title: 'Velocity correction factor Cv for leather belts', src: 'figures/shigley/fig17-9.png', page: 910, note: 'Cv = 1 for polyamide and urethane. For leather enter with V in thousands of ft/min and the belt thickness.' },
      { id: 'table17-15', ref: 'Table 17-15', title: 'Suggested service factors Ks (V-belt table, also used for flat belts)', src: 'figures/shigley/table17-15.png', page: 925 },
      { id: 'fig17-11', ref: 'Figure 17-11', title: 'Belt-tensioning schemes; catenary dip', src: 'figures/shigley/fig17-11.png', page: 915 },
    ],

    sections: [
      { title: 'Inputs', steps: [
        { id: 'in', title: 'Problem data', fig: ['table17-15'], eq: '17-19', formula: 'H_d = H_{nom} K_s n_d \\qquad VR = \\frac{D}{d} = \\frac{n}{n_2}',
          text: 'Nominal (nameplate) power, driving-pulley speed and diameters. Ks comes from Table 17-15 (light shock ≈ 1.1–1.3); nd is the design factor for "exigencies" (often 1.0–1.1).',
          vars: [
            { id: 'Hnom', symbol: 'H_{nom}', label: 'Nominal power', unit: 'hp', kind: 'input' },
            { id: 'n', symbol: 'n', label: 'Driving (small) pulley speed', unit: 'rpm', kind: 'input' },
            { id: 'd', symbol: 'd', label: 'Driving (small) pulley diameter', unit: 'in', kind: 'input' },
            { id: 'D', symbol: 'D', label: 'Driven (large) pulley diameter', unit: 'in', kind: 'input', hint: 'leave blank and give VR below if only the ratio is known' },
            { id: 'VRin', symbol: 'VR', label: 'Velocity ratio (optional)', unit: '', kind: 'input', hint: 'used only when D is blank: D = VR·d' },
            { id: 'C', symbol: 'C', label: 'Centre distance', unit: 'in', kind: 'input' },
            { id: 'cfg', label: 'Belt configuration', kind: 'choice', type: 'text', options: [{ label: 'Open belt', value: 'open' }, { label: 'Crossed belt', value: 'crossed' }], default: 'open' },
            { id: 'Ks', symbol: 'K_s', label: 'Service factor', unit: '', kind: 'lookup', fig: 'table17-15', default: 1.0, check: v => (v.Ks !== undefined && (v.Ks < 1 || v.Ks > 2)) ? 'Ks is normally 1.0–1.8' : null },
            { id: 'nd', symbol: 'n_d', label: 'Design factor', unit: '', kind: 'input', default: 1.0 },
            { id: 'Dg', symbol: 'D', label: 'Large pulley diameter used', unit: 'in', kind: 'calc', compute: v => H.has(v, 'D') ? v.D : (H.has(v, 'VRin', 'd') ? v.VRin * v.d : undefined) },
            { id: 'VR', symbol: 'VR', label: 'Velocity ratio', unit: '', kind: 'calc', compute: v => H.has(v, 'Dg', 'd') ? v.Dg / v.d : undefined },
            { id: 'n2', symbol: 'n_2', label: 'Driven pulley speed', unit: 'rpm', kind: 'calc', compute: v => H.has(v, 'n', 'VR') ? v.n / v.VR : undefined },
            { id: 'Hd', symbol: 'H_d', label: 'Design power', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'Hnom', 'Ks', 'nd') ? v.Hnom * v.Ks * v.nd : undefined,
              work: v => H.has(v, 'Hnom', 'Ks', 'nd') ? '\\(H_d = H_{nom}K_s n_d = ' + H.fmt(v.Hnom) + '(' + H.fmt(v.Ks) + ')(' + H.fmt(v.nd) + ') = ' + H.fmt(v.Hd) + '\\ \\text{hp}\\)' : null },
          ] },
        { id: 'mat', title: 'Belt material (Table 17-2) and width', fig: ['table17-2', 'table17-3'],
          text: 'Choose a specification; thickness t, specific weight γ, allowable tension Fa (at 600 ft/min), friction f and minimum pulley diameter auto-fill from Table 17-2 but can be overridden. Urethane widths are fixed by the belt style. The belt width b is the main design variable — in a design problem guess it, then check <i>b<sub>min</sub></i> in step 6.',
          vars: [
            { id: 'spec', label: 'Belt specification', kind: 'choice', type: 'text', options: Object.keys(SPECS) },
            { id: 't', symbol: 't', label: 'Belt thickness', unit: 'in', kind: 'lookup', fig: 'table17-2', auto: v => spec(v) ? spec(v).t : undefined },
            { id: 'gamma', symbol: '\\gamma', label: 'Specific weight', unit: 'lbf/in³', kind: 'lookup', fig: 'table17-2', auto: v => spec(v) ? spec(v).g : undefined },
            { id: 'Fa', symbol: 'F_a', label: 'Allowable tension per unit width (600 ft/min)', unit: 'lbf/in', kind: 'lookup', fig: 'table17-2', auto: v => spec(v) ? spec(v).Fa : undefined },
            { id: 'f', symbol: 'f', label: 'Coefficient of friction (max)', unit: '', kind: 'lookup', fig: 'table17-2', auto: v => spec(v) ? spec(v).f : undefined },
            { id: 'dmin', symbol: 'd_{min}', label: 'Minimum pulley diameter', unit: 'in', kind: 'lookup', fig: 'table17-2', auto: v => spec(v) ? spec(v).dmin : undefined,
              check: v => (H.has(v, 'dmin', 'd') && v.d < v.dmin) ? 'Small pulley d is below the minimum for this belt' : null },
            { id: 'b', symbol: 'b', label: 'Belt width', unit: 'in', kind: 'input', auto: v => spec(v) && spec(v).b ? spec(v).b : undefined, hint: 'design variable; urethane widths auto-fill' },
          ] },
      ] },

      { title: 'Geometry & speed', steps: [
        { id: 'geo', title: 'Wrap angles and belt length', fig: ['fig17-1', 'fig17-2'], eq: '17-1 … 17-4',
          formula: '\\phi_d = \\pi - 2\\sin^{-1}\\frac{D-d}{2C},\\quad \\phi_D = \\pi + 2\\sin^{-1}\\frac{D-d}{2C},\\quad L = \\sqrt{4C^2-(D-d)^2} + \\tfrac12 (D\\phi_D + d\\phi_d)',
          text: 'Open belt uses Eqs. 17-1/17-2; a crossed belt has the same wrap on both pulleys, Eqs. 17-3/17-4. Use the SMALL-pulley wrap φ = φd in the belting equation (Fizz: "use the smaller wrap angle").',
          vars: [
            { id: 'alpha', symbol: '\\sin^{-1}(\\cdot)', label: 'Helper angle', unit: 'rad', kind: 'calc', digits: 5, compute: v => H.has(v, 'Dg', 'd', 'C') ? Math.asin((v.cfg === 'crossed' ? v.Dg + v.d : v.Dg - v.d) / (2 * v.C)) : undefined },
            { id: 'phi', symbol: '\\phi_d', label: 'Wrap angle, small pulley', unit: 'rad', kind: 'calc', digits: 5, compute: v => H.has(v, 'alpha') ? (v.cfg === 'crossed' ? Math.PI + 2 * v.alpha : Math.PI - 2 * v.alpha) : undefined,
              work: v => H.has(v, 'alpha', 'Dg', 'd', 'C') ? '\\(\\phi_d = \\pi ' + (v.cfg === 'crossed' ? '+' : '-') + ' 2\\sin^{-1}\\frac{' + H.fmt(v.Dg) + (v.cfg === 'crossed' ? '+' : '-') + H.fmt(v.d) + '}{2(' + H.fmt(v.C) + ')} = ' + H.fmt(v.phi, 5) + '\\ \\text{rad} = ' + H.fmt(H.deg(v.phi)) + '^\\circ\\)' : null },
            { id: 'phideg', symbol: '\\phi_d', label: 'Wrap angle, small pulley', unit: '°', kind: 'calc', compute: v => H.has(v, 'phi') ? H.deg(v.phi) : undefined,
              check: v => (H.has(v, 'phideg') && v.phideg < 150) ? 'Wrap < 150° — poor friction development; increase C or reduce ratio' : null },
            { id: 'phiD', symbol: '\\phi_D', label: 'Wrap angle, large pulley', unit: 'rad', kind: 'calc', digits: 5, compute: v => H.has(v, 'alpha') ? Math.PI + 2 * v.alpha : undefined },
            { id: 'L', symbol: 'L', label: 'Belt length', unit: 'in', kind: 'calc', compute: v => {
                if (!H.has(v, 'Dg', 'd', 'C', 'phi', 'phiD')) return undefined;
                if (v.cfg === 'crossed') return Math.sqrt(4 * v.C * v.C - (v.Dg + v.d) ** 2) + 0.5 * (v.Dg + v.d) * v.phi;
                return Math.sqrt(4 * v.C * v.C - (v.Dg - v.d) ** 2) + 0.5 * (v.Dg * v.phiD + v.d * v.phi);
              } },
          ] },
        { id: 'spd', title: 'Belt speed, weight per foot and friction term', eq: 'Eq. (e), 17-7',
          formula: 'V = \\frac{\\pi d n}{12}\\ \\text{ft/min},\\qquad w = 12\\gamma b t\\ \\text{lbf/ft},\\qquad e^{f\\phi}',
          vars: [
            { id: 'V', symbol: 'V', label: 'Belt speed', unit: 'ft/min', kind: 'calc', compute: v => H.has(v, 'd', 'n') ? Math.PI * v.d * v.n / 12 : undefined,
              work: v => H.has(v, 'd', 'n') ? '\\(V = \\pi(' + H.fmt(v.d) + ')(' + H.fmt(v.n) + ')/12 = ' + H.fmt(v.V) + '\\ \\text{ft/min}\\)' : null,
              check: v => (H.has(v, 'V') && v.V > 6500) ? 'V > 6500 ft/min — too fast for a belt drive' : null },
            { id: 'w', symbol: 'w', label: 'Belt weight per foot', unit: 'lbf/ft', kind: 'calc', compute: v => H.has(v, 'gamma', 'b', 't') ? 12 * v.gamma * v.b * v.t : undefined,
              work: v => H.has(v, 'gamma', 'b', 't') ? '\\(w = 12\\gamma b t = 12(' + H.fmt(v.gamma) + ')(' + H.fmt(v.b) + ')(' + H.fmt(v.t) + ') = ' + H.fmt(v.w) + '\\ \\text{lbf/ft}\\)' : null },
            { id: 'efp', symbol: 'e^{f\\phi}', label: 'Friction term exp(fφ)', unit: '', kind: 'calc', compute: expf,
              work: v => H.has(v, 'f', 'phi') ? '\\(e^{f\\phi} = \\exp[' + H.fmt(v.f) + '(' + H.fmt(v.phi, 5) + ')] = ' + H.fmt(v.efp) + '\\)' : null },
          ] },
      ] },

      { title: 'Forces', steps: [
        { id: 'fc', title: 'Centrifugal tension and required torque', fig: ['fig17-7'], eq: 'Eq. (e), (h)',
          formula: 'F_c = \\frac{w}{32.17}\\left(\\frac{V}{60}\\right)^2,\\qquad T = \\frac{63\\,025\\,H_d}{n},\\qquad \\Delta F = (F_1)_a - F_2 = \\frac{2T}{d}',
          vars: [
            { id: 'Fc', symbol: 'F_c', label: 'Centrifugal tension', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'w', 'V') ? v.w / 32.17 * (v.V / 60) ** 2 : undefined,
              work: v => H.has(v, 'w', 'V') ? '\\(F_c = \\frac{' + H.fmt(v.w) + '}{32.17}\\left(\\frac{' + H.fmt(v.V) + '}{60}\\right)^2 = ' + H.fmt(v.Fc) + '\\ \\text{lbf}\\)' : null },
            { id: 'T', symbol: 'T', label: 'Required torque (design power)', unit: 'lbf·in', kind: 'calc', compute: v => H.has(v, 'Hd', 'n') ? 63025 * v.Hd / v.n : undefined,
              work: v => H.has(v, 'Hd', 'n') ? '\\(T = 63\\,025(' + H.fmt(v.Hd) + ')/' + H.fmt(v.n) + ' = ' + H.fmt(v.T) + '\\ \\text{lbf·in}\\)' : null },
            { id: 'dF', symbol: '\\Delta F', label: 'Required tension difference 2T/d', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'T', 'd') ? 2 * v.T / v.d : undefined,
              work: v => H.has(v, 'T', 'd') ? '\\((F_1)_a - F_2 = 2T/d = 2(' + H.fmt(v.T) + ')/' + H.fmt(v.d) + ' = ' + H.fmt(v.dF) + '\\ \\text{lbf}\\)' : null },
          ] },
        { id: 'f1a', title: 'Allowable tight-side tension (F1)a', fig: ['table17-4', 'fig17-9'], eq: '17-12',
          formula: '(F_1)_a = b\\,F_a\\,C_p\\,C_v',
          text: 'Cp (Table 17-4) depends on the small-pulley diameter and material; Cp = 1 for urethane. Cv = 1 for polyamide and urethane; for leather read Figure 17-9 (the auto value is a rough fit of the mid curve — read the chart for the exact thickness).',
          vars: [
            { id: 'Cp', symbol: 'C_p', label: 'Pulley correction factor', unit: '', kind: 'lookup', fig: 'table17-4',
              auto: v => { if (!spec(v) || !H.has(v, 'd')) return undefined; const r = CP[spec(v).mat]; const x = r ? r[cpCol(v.d)] : undefined; return isNaN(x) ? undefined : x; },
              check: v => (spec(v) && H.has(v, 'd') && CP[spec(v).mat] && isNaN(CP[spec(v).mat][cpCol(v.d)]) && !H.has(v, 'Cp')) ? 'Table 17-4 has no Cp for this material at so small a pulley (—): pulley too small for the belt' : null },
            { id: 'Cv', symbol: 'C_v', label: 'Velocity correction factor', unit: '', kind: 'lookup', fig: 'fig17-9',
              auto: v => { if (!spec(v)) return undefined; if (!isLeather(v)) return 1; if (!H.has(v, 'V')) return undefined; return H.interp(v.V / 1000, [0, 1, 2, 3, 4, 5, 6], [1.0, 0.99, 0.97, 0.94, 0.90, 0.83, 0.74]); } },
            { id: 'F1a', symbol: '(F_1)_a', label: 'Allowable largest tension', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'b', 'Fa', 'Cp', 'Cv') ? v.b * v.Fa * v.Cp * v.Cv : undefined,
              work: v => H.has(v, 'b', 'Fa', 'Cp', 'Cv') ? '\\((F_1)_a = bF_aC_pC_v = ' + H.fmt(v.b) + '(' + H.fmt(v.Fa) + ')(' + H.fmt(v.Cp) + ')(' + H.fmt(v.Cv) + ') = ' + H.fmt(v.F1a) + '\\ \\text{lbf}\\)' : null },
          ] },
        { id: 'tens', title: 'Slack-side tension, initial tension and transmitted power', fig: ['fig17-8'], eq: '(i), (j), 17-9',
          formula: 'F_2 = (F_1)_a - \\frac{2T}{d},\\qquad F_i = \\frac{(F_1)_a + F_2}{2} - F_c,\\qquad H_a = \\frac{[(F_1)_a - F_2]V}{33\\,000}',
          text: 'Running the belt at (F1)a (its operation limit) gives the maximum capacity. Ha should equal Hd by construction; the alternative form Fi = (T/d)(e<sup>fφ</sup>+1)/(e<sup>fφ</sup>−1) (Eq. 17-9) is the initial tension needed with FULL friction development.',
          vars: [
            { id: 'F2', symbol: 'F_2', label: 'Slack-side tension', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'F1a', 'dF') ? v.F1a - v.dF : undefined,
              work: v => H.has(v, 'F1a', 'dF') ? '\\(F_2 = ' + H.fmt(v.F1a) + ' - ' + H.fmt(v.dF) + ' = ' + H.fmt(v.F2) + '\\ \\text{lbf}\\)' : null,
              check: v => (H.has(v, 'F2', 'Fc') && v.F2 <= v.Fc) ? 'F2 ≤ Fc: belt cannot transmit this torque — increase width b, Fa, or d' : null },
            { id: 'Fi', symbol: 'F_i', label: 'Initial tension (at (F1)a)', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'F1a', 'F2', 'Fc') ? (v.F1a + v.F2) / 2 - v.Fc : undefined,
              work: v => H.has(v, 'F1a', 'F2', 'Fc') ? '\\(F_i = \\frac{' + H.fmt(v.F1a) + ' + ' + H.fmt(v.F2) + '}{2} - ' + H.fmt(v.Fc) + ' = ' + H.fmt(v.Fi) + '\\ \\text{lbf}\\)' : null },
            { id: 'Fi9', symbol: 'F_i', label: 'Initial tension for full friction (Eq. 17-9)', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'T', 'd', 'efp') ? v.T / v.d * (v.efp + 1) / (v.efp - 1) : undefined },
            { id: 'Ha', symbol: 'H_a', label: 'Transmitted (allowable) power', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'F1a', 'F2', 'V') ? (v.F1a - v.F2) * v.V / 33000 : undefined,
              work: v => H.has(v, 'F1a', 'F2', 'V') ? '\\(H_a = (' + H.fmt(v.F1a) + ' - ' + H.fmt(v.F2) + ')(' + H.fmt(v.V) + ')/33\\,000 = ' + H.fmt(v.Ha) + '\\ \\text{hp}\\)' : null },
          ] },
        { id: 'bmin', title: 'Design: minimum belt width for full friction development', eq: '17-8, 17-12',
          formula: 'b_{min} = \\frac{\\Delta F\\, e^{f\\phi}/(e^{f\\phi}-1)}{F_aC_pC_v - \\dfrac{12\\gamma t}{32.17}\\left(\\dfrac{V}{60}\\right)^2}',
          text: 'From Eq. 17-8 the tight side must be at least F1 = Fc + ΔF·e<sup>fφ</sup>/(e<sup>fφ</sup>−1). Setting F1 = (F1)a = bFaCpCv and Fc = (12γbt/32.17)(V/60)² and solving for b gives the smallest width that transmits the design torque without slipping (Example 17-2 approach). Pick the next available width.',
          vars: [
            { id: 'bmin', symbol: 'b_{min}', label: 'Minimum belt width', unit: 'in', kind: 'calc', compute: v => {
                if (!H.has(v, 'dF', 'efp', 'Fa', 'Cp', 'Cv', 'gamma', 't', 'V')) return undefined;
                const num = v.dF * v.efp / (v.efp - 1); const den = v.Fa * v.Cp * v.Cv - 12 * v.gamma * v.t / 32.17 * (v.V / 60) ** 2;
                return den > 0 ? num / den : undefined; },
              check: v => (H.has(v, 'bmin', 'b') && v.b < v.bmin) ? 'Chosen b is below bmin — the belt will slip (see f′ check)' : null },
          ] },
      ] },

      { title: 'Checks & result', steps: [
        { id: 'chk', title: 'Friction development, factor of safety, dip', fig: ['fig17-11'], eq: '17-7, 17-13',
          formula: "f' = \\frac{1}{\\phi}\\ln\\frac{(F_1)_a - F_c}{F_2 - F_c} < f,\\qquad n_{fs} = \\frac{H_a}{H_{nom}K_s},\\qquad \\text{dip} = \\frac{C^2 w}{96 F_i}",
          vars: [
            { id: 'fp', symbol: "f'", label: 'Friction coefficient developed', unit: '', kind: 'calc', compute: v => (H.has(v, 'phi', 'F1a', 'F2', 'Fc') && v.F2 > v.Fc) ? Math.log((v.F1a - v.Fc) / (v.F2 - v.Fc)) / v.phi : undefined,
              work: v => (H.has(v, 'fp')) ? "\\(f' = \\frac{1}{" + H.fmt(v.phi, 5) + '}\\ln\\frac{' + H.fmt(v.F1a) + ' - ' + H.fmt(v.Fc) + '}{' + H.fmt(v.F2) + ' - ' + H.fmt(v.Fc) + '} = ' + H.fmt(v.fp, 3) + '\\)' : null,
              check: v => (H.has(v, 'fp', 'f') && v.fp >= v.f) ? "f′ ≥ f — belt will slip; change width/material/wrap" : null },
            { id: 'nfs', symbol: 'n_{fs}', label: 'Factor of safety', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'Ha', 'Hnom', 'Ks') ? v.Ha / (v.Hnom * v.Ks) : undefined,
              work: v => H.has(v, 'nfs') ? '\\(n_{fs} = \\frac{' + H.fmt(v.Ha) + '}{' + H.fmt(v.Hnom) + '(' + H.fmt(v.Ks) + ')} = ' + H.fmt(v.nfs, 3) + '\\)' : null },
            { id: 'dip', symbol: '\\text{dip}', label: 'Catenary dip at Fi', unit: 'in', kind: 'calc', digits: 3, compute: v => (H.has(v, 'C', 'w', 'Fi') && v.Fi > 0) ? v.C * v.C * v.w / (96 * v.Fi) : undefined,
              work: v => H.has(v, 'dip') ? '\\(\\text{dip} = \\frac{(' + H.fmt(v.C) + ')^2(' + H.fmt(v.w) + ')}{96(' + H.fmt(v.Fi) + ')} = ' + H.fmt(v.dip, 3) + '\\ \\text{in}\\)' : null },
          ],
          after: v => {
            if (!H.has(v, 'fp', 'f', 'nfs')) return '';
            const ok = v.fp < v.f && v.nfs >= (v.nd || 1) - 1e-6;
            return (ok ? '<span class="result-ok">PASS</span> — f′ = ' + H.fmt(v.fp, 3) + ' &lt; f = ' + H.fmt(v.f) + ' (no slip); belt transmits H<sub>a</sub> = ' + H.fmt(v.Ha) + ' hp at (F<sub>1</sub>)<sub>a</sub> = ' + H.fmt(v.F1a) + ' lbf with F<sub>i</sub> = ' + H.fmt(v.Fi) + ' lbf; n<sub>fs</sub> = ' + H.fmt(v.nfs, 3)
              : '<span class="result-bad">FAIL</span> — ' + (v.fp >= v.f ? 'friction needed f′ = ' + H.fmt(v.fp, 3) + ' exceeds available f = ' + H.fmt(v.f) + '. ' : '') + (v.nfs < (v.nd || 1) ? 'n<sub>fs</sub> = ' + H.fmt(v.nfs, 3) + ' &lt; n<sub>d</sub>. ' : '') + 'Increase width b (b<sub>min</sub> = ' + H.fmt(v.bmin) + ' in), use a stronger belt, or increase wrap.');
          } },
      ] },
    ],
  };
})();
