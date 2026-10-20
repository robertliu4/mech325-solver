// Rated load (lb) at 1.0e6 in travel life, read off Mott Figure 17-8 (pixel-traced); 1/2-in value confirmed by Mott text (1000 lb).
const BS_SIZES = [
  { label: '3 in, 1½ tpi, lead 0.667 in', value: 3, tpi: 1.5, L: 0.667, P6: 38000 },
  { label: '2½ in, 1 tpi, lead 1.00 in', value: 2.5, tpi: 1, L: 1.0, P6: 27000 },
  { label: '2 in, 2 tpi, lead 0.50 in', value: 2, tpi: 2, L: 0.5, P6: 18800 },
  { label: '1½ in, 2 tpi, lead 0.50 in', value: 1.5, tpi: 2, L: 0.5, P6: 10900 },
  { label: '¾ in, 2 tpi, lead 0.50 in', value: 0.75, tpi: 2, L: 0.5, P6: 3150 },
  { label: '½ in, 5 tpi, lead 0.20 in', value: 0.5, tpi: 5, L: 0.2, P6: 1000 },
  { label: '⅜ in, 8 tpi, lead 0.125 in', value: 0.375, tpi: 8, L: 0.125, P6: 420 },
];
const BS = v => BS_SIZES.find(s => s.value === v.size);

window.TOPIC = {
  id: 'ball_screws', book: 'mott',
  title: 'Ball Screws — Life, Selection, Torque & Power',
  subtitle: 'Mott Ch. 17-3 / 17-4 · Fizz guide §5.2 (Example Problem 17-3)',
  sibling: 'ball_screws_shigley.html',
  intro: 'Selects a ball screw from the load / travel-life chart (Figure 17-8), then computes driving torque (Eq. 17-13, e = 0.90), back-driving torque (Eq. 17-14), speed, power, expected life (Eq. 17-12) and the critical-speed check (Eq. 17-15). '
    + 'US units: lb, in, in/s, lb·in, hp. Travel life in inches follows the Fizz guide: distance per cycle × cycles per hour × 24 h/day × 365 days/yr × years.',
  example: { F: 12500, dist: 30, cyc: 8, basis: 'day', hrs: 24, days: 365, yrs: 10, size: 2, Vreq: 1.25 },

  figures: [
    { id: 'fig17-3', ref: 'Figure 17-3', title: 'Ball bearing screw — recirculating balls, ball nut, return tube', src: 'figures/mott/fig17-3.png', page: 660 },
    { id: 'fig17-8', ref: 'Figure 17-8', title: 'Ball screw performance: rated load vs. travel life (in) for 7 screw sizes, with lead table', src: 'figures/mott/fig17-8.png', page: 667,
      note: 'Enter at the travel life on the x-axis, go up to the load: pick the first line at or above the load. Example: ½-in 5-tpi screw carries 1000 lb for 1.0×10⁶ in. Lines follow L2/L1 = (P1/P2)³ (Eq. 17-12).' },
    { id: 'fig17-5', ref: 'Figure 17-5', title: 'Screw-thread force analysis (lead, lead angle)', src: 'figures/mott/fig17-5.png', page: 663 },
  ],

  sections: [
    { title: 'Step 1: Travel life', steps: [
      { id: 'duty', title: 'Duty cycle → total travel over the design life', formula: '\\text{Travel life} = \\frac{\\text{distance}}{\\text{cycle}}\\cdot\\frac{\\text{cycles}}{\\text{hour}}\\cdot\\frac{24\\ \\text{h}}{\\text{day}}\\cdot\\frac{365\\ \\text{days}}{\\text{yr}}\\cdot(\\text{years})',
        text: 'Distance per cycle counts <b>both</b> strokes if the nut goes out and back (Mott Example 17-3: 15 in × 2 strokes = 30 in per cycle). Enter the cycle rate per hour (Fizz) or per day (Mott).',
        vars: [
          { id: 'dist', symbol: 's_{cyc}', label: 'Travel distance per cycle', unit: 'in', kind: 'input' },
          { id: 'basis', label: 'Cycle rate is given per…', kind: 'choice', type: 'text', options: [{ label: 'hour (Fizz form)', value: 'hour' }, { label: 'day (Mott form)', value: 'day' }], default: 'hour' },
          { id: 'cyc', symbol: 'N_{cyc}', label: 'Cycles per hour (or per day)', kind: 'input' },
          { id: 'hrs', symbol: 'h/d', label: 'Operating hours per day', unit: 'h', kind: 'input', default: 24, hint: 'only used with per-hour rate' },
          { id: 'days', label: 'Operating days per year', unit: 'd', kind: 'input', default: 365 },
          { id: 'yrs', symbol: 'Y', label: 'Design life', unit: 'years', kind: 'input' },
          { id: 'life', symbol: 'L_{req}', label: 'Required travel life', unit: 'in', kind: 'calc', digits: 4, compute: v => {
              if (!H.has(v, 'dist', 'cyc', 'days', 'yrs')) return undefined;
              const perDay = v.basis === 'day' ? v.cyc : (H.has(v, 'hrs') ? v.cyc * v.hrs : undefined);
              return perDay === undefined ? undefined : v.dist * perDay * v.days * v.yrs; },
            work: v => H.has(v, 'life') ? '\\(L_{req} = ' + H.fmt(v.dist) + ' \\times ' + H.fmt(v.cyc) + (v.basis === 'day' ? '' : ' \\times ' + H.fmt(v.hrs)) + ' \\times ' + H.fmt(v.days) + ' \\times ' + H.fmt(v.yrs) + ' = ' + H.fmt(v.life) + '\\ \\text{in}\\)' : null },
        ] },
    ] },

    { title: 'Step 2: Select the screw from Figure 17-8', steps: [
      { id: 'sel', title: 'Load and screw size', fig: ['fig17-8', 'fig17-3'], eq: '17-12',
        formula: '\\frac{L_2}{L_1} = \\left(\\frac{P_1}{P_2}\\right)^3 \\quad\\Rightarrow\\quad P_{rated@L_{req}} = P_{1\\,\\text{M}}\\left(\\frac{10^6}{L_{req}}\\right)^{1/3}',
        text: 'Read the chart at \\(L_{req}\\): the screw is adequate if its line lies at or above the load F. The yellow rated load is the value of the chosen line at 10⁶ in (pre-filled from a trace of the chart — overwrite with your own reading).',
        vars: [
          { id: 'F', symbol: 'F', label: 'Axial load on screw', unit: 'lb', kind: 'input' },
          { id: 'size', symbol: 'D', label: 'Ball screw (nominal dia, tpi, lead)', kind: 'choice', options: BS_SIZES, default: 2 },
          { id: 'L', symbol: 'L', label: 'Lead', unit: 'in', kind: 'calc', compute: v => BS(v) ? BS(v).L : undefined },
          { id: 'P6', symbol: 'P_{1M}', label: 'Rated load at 10⁶ in travel (chart)', unit: 'lb', kind: 'lookup', fig: 'fig17-8', hint: 'auto from chart trace', auto: v => BS(v) ? BS(v).P6 : undefined },
          { id: 'Prl', symbol: 'P_{rated}', label: 'Rated load at required life', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'P6', 'life') && v.life > 0 ? v.P6 * Math.pow(1e6 / v.life, 1 / 3) : undefined,
            work: v => H.has(v, 'P6', 'life') && v.life > 0 ? '\\(P_{rated} = ' + H.fmt(v.P6) + '\\left(\\dfrac{10^6}{' + H.fmt(v.life) + '}\\right)^{1/3} = ' + H.fmt(v.Prl) + '\\ \\text{lb}\\)' : null },
          { id: 'Lexp', symbol: 'L_{exp}', label: 'Expected life at load F', unit: 'in', kind: 'calc', digits: 3, compute: v => H.has(v, 'P6', 'F') && v.F > 0 ? 1e6 * Math.pow(v.P6 / v.F, 3) : undefined,
            work: v => H.has(v, 'P6', 'F') && v.F > 0 ? '\\(L_{exp} = 10^6\\left(\\dfrac{' + H.fmt(v.P6) + '}{' + H.fmt(v.F) + '}\\right)^3 = ' + H.fmt(v.Lexp, 3) + '\\ \\text{in}\\)' : null },
          { id: 'ratio', symbol: 'L_{exp}/L_{req}', label: 'Life margin', kind: 'calc', digits: 3, compute: v => H.has(v, 'Lexp', 'life') && v.life > 0 ? v.Lexp / v.life : undefined },
        ],
        after: v => H.has(v, 'ratio') ? (v.ratio >= 1 ? '<span class="result-ok">Screw OK: expected life is ' + H.fmt(v.ratio, 3) + '× the required travel life.</span>' : '<span class="result-bad">Too small: expected life is only ' + H.fmt(v.ratio, 3) + '× the required travel — choose a larger screw.</span>') : '' },
    ] },

    { title: 'Step 3–4: Torque, speed, power', steps: [
      { id: 'tq', title: 'Driving torque and back-driving torque', eq: '17-13, 17-14', formula: 'T_u = \\frac{F L}{2\\pi e} = 0.177\\,F L \\;(e = 0.90) \\qquad T_b = \\frac{F L e}{2\\pi} = 0.143\\,F L',
        text: 'Ball screws are essentially never self-locking: a brake is needed to hold the load, and the load can be used deliberately to back-drive the screw.',
        vars: [
          { id: 'eff', symbol: 'e', label: 'Efficiency', kind: 'input', default: 0.9, hint: 'Mott: typically 0.90' },
          { id: 'Tu', symbol: 'T_u', label: 'Torque to drive', unit: 'lb·in', kind: 'calc', compute: v => H.has(v, 'F', 'L', 'eff') && v.eff > 0 ? v.F * v.L / (2 * Math.PI * v.eff) : undefined,
            work: v => H.has(v, 'F', 'L', 'eff') && v.eff > 0 ? '\\(T_u = \\dfrac{' + H.fmt(v.F) + '(' + H.fmt(v.L) + ')}{2\\pi(' + H.fmt(v.eff) + ')} = ' + H.fmt(1 / (2 * Math.PI * v.eff), 3) + 'FL = ' + H.fmt(v.Tu) + '\\ \\text{lb·in}\\)' : null },
          { id: 'Tb', symbol: 'T_b', label: 'Back-driving torque', unit: 'lb·in', kind: 'calc', compute: v => H.has(v, 'F', 'L', 'eff') ? v.F * v.L * v.eff / (2 * Math.PI) : undefined },
        ] },
      { id: 'spd', title: 'Rotational speed and power', formula: 'n = \\frac{V}{L}\\,(60) \\qquad P = \\frac{T_u\\,n}{63\\,000}',
        vars: [
          { id: 'Vreq', symbol: 'V', label: 'Required linear speed', unit: 'in/s', kind: 'input', hint: 'stroke ÷ allowed time' },
          { id: 'n', symbol: 'n', label: 'Screw speed', unit: 'rpm', kind: 'calc', compute: v => H.has(v, 'Vreq', 'L') && v.L > 0 ? v.Vreq / v.L * 60 : undefined,
            work: v => H.has(v, 'Vreq', 'L') && v.L > 0 ? '\\(n = \\dfrac{' + H.fmt(v.Vreq) + '}{' + H.fmt(v.L) + '}(60) = ' + H.fmt(v.n) + '\\ \\text{rpm}\\)' : null },
          { id: 'P', symbol: 'P', label: 'Power to drive screw', unit: 'hp', kind: 'calc', digits: 4, compute: v => H.has(v, 'Tu', 'n') ? v.Tu * v.n / 63000 : undefined,
            work: v => H.has(v, 'Tu', 'n') ? '\\(P = \\dfrac{' + H.fmt(v.Tu) + '(' + H.fmt(v.n) + ')}{63\\,000} = ' + H.fmt(v.P) + '\\ \\text{hp}\\)' : null },
        ] },
    ] },

    { title: 'Application checks (Mott 17-4)', steps: [
      { id: 'nc', title: 'Critical speed', eq: '17-15', formula: 'n_c = 4.76\\times10^{6}\\,\\frac{d\\,K_s}{(SF)\\,L_s^2} \\qquad n < 0.80\\,n_c',
        text: 'd = minor diameter of the screw (in), \\(L_s\\) = length between supports (in). End-fixity factor \\(K_s\\): simple–simple 1.00, fixed–fixed 2.24, fixed–simple 1.55, fixed–free 0.32. SF usually 1.25–3.0. Column buckling must also be checked for compressive loads (Euler / J.B. Johnson, Ch. 6; Ks for columns: 1.00 / 4.00 / 2.00 / 0.25).',
        vars: [
          { id: 'dmin', symbol: 'd', label: 'Minor (root) diameter of screw', unit: 'in', kind: 'input', hint: 'from supplier data; ≈ nominal − ball groove depth' },
          { id: 'Ks', symbol: 'K_s', label: 'End fixity factor (critical speed)', kind: 'choice', options: [{ label: 'Simply supported both ends — 1.00', value: 1 }, { label: 'Fixed both ends — 2.24', value: 2.24 }, { label: 'Fixed one end, simple other — 1.55', value: 1.55 }, { label: 'Fixed one end, free other — 0.32', value: 0.32 }], default: 1 },
          { id: 'SF', symbol: 'SF', label: 'Safety factor', kind: 'input', default: 2, hint: '1.25–3.0' },
          { id: 'Lsup', symbol: 'L_s', label: 'Length between supports', unit: 'in', kind: 'input' },
          { id: 'ncrit', symbol: 'n_c', label: 'Critical speed', unit: 'rpm', kind: 'calc', compute: v => H.has(v, 'dmin', 'Ks', 'SF', 'Lsup') && v.Lsup > 0 ? 4.76e6 * v.dmin * v.Ks / (v.SF * v.Lsup * v.Lsup) : undefined,
            work: v => H.has(v, 'ncrit') ? '\\(n_c = 4.76\\times10^6\\,\\dfrac{' + H.fmt(v.dmin) + '(' + H.fmt(v.Ks) + ')}{' + H.fmt(v.SF) + '(' + H.fmt(v.Lsup) + ')^2} = ' + H.fmt(v.ncrit) + '\\ \\text{rpm}\\)' : null },
          { id: 'nratio', symbol: 'n/n_c', label: 'Operating / critical speed', kind: 'calc', digits: 3, compute: v => H.has(v, 'n', 'ncrit') && v.ncrit > 0 ? v.n / v.ncrit : undefined },
        ],
        when: v => true,
        after: v => {
          let s = '';
          if (H.has(v, 'nratio')) s += v.nratio < 0.8 ? '<span class="result-ok">n = ' + H.fmt(v.n) + ' rpm &lt; 0.8 n<sub>c</sub> = ' + H.fmt(0.8 * v.ncrit) + ' rpm — critical speed OK.</span> ' : '<span class="result-bad">n = ' + H.fmt(v.n) + ' rpm ≥ 0.8 n<sub>c</sub> = ' + H.fmt(0.8 * v.ncrit) + ' rpm — shorten the span, stiffen the supports or use a larger screw.</span> ';
          if (BS(v) && v.Tu !== undefined) s += '<div style="margin-top:6px"><b>Result:</b> ' + BS(v).label + (v.ratio !== undefined ? (v.ratio >= 1 ? ' — life PASS' : ' — life FAIL') : '') + '; T<sub>u</sub> = ' + H.fmt(v.Tu) + ' lb·in' + (v.P !== undefined ? ', ' + H.fmt(v.P) + ' hp at ' + H.fmt(v.n) + ' rpm' : '') + '.</div>';
          return s; } },
    ] },
  ],
};
