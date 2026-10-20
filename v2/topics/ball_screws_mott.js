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
    + 'US units: lb, in, in/s, lb·in, hp. Travel life in inches follows the Fizz guide: distance per cycle × cycles per hour × 24 h/day × 365 days/yr × years. '
    + '<b>Course source:</b> the MECH 325 Module #5 reading guide requires Mott 17-3 (life, torque, power) and 17-4 (column buckling and critical speed) — no course slides, tutorials or worked numbers exist for ball screws, so Mott\'s equations and Example Problem 17-3 are the reference; the Thomson ball-screw catalogue (Canvas) is the beneficial reading for real selection data.',
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
        after: v => H.has(v, 'nratio') ? (v.nratio < 0.8 ? '<span class="result-ok">n = ' + H.fmt(v.n) + ' rpm &lt; 0.8 n<sub>c</sub> = ' + H.fmt(0.8 * v.ncrit) + ' rpm — critical speed OK.</span>' : '<span class="result-bad">n = ' + H.fmt(v.n) + ' rpm ≥ 0.8 n<sub>c</sub> = ' + H.fmt(0.8 * v.ncrit) + ' rpm — shorten the span, stiffen the supports or use a larger screw.</span>') : '' },
      { id: 'buck', title: 'Column buckling (compressive load)', eq: 'Mott 17-4 with Ch. 6 Eqs. 6-4 / 6-9', formula: 'r = \\frac{d}{4} \\qquad \\frac{KL}{r},\\; K = \\frac{1}{\\sqrt{K_s}} \\qquad C_c = \\sqrt{\\frac{2\\pi^2 E}{S_y}} \\qquad P_{cr} = \\frac{\\pi^2 E A}{(KL/r)^2}\\ (\\text{Euler}, KL/r > C_c) \\quad P_{cr} = A S_y\\left[1 - \\frac{S_y (KL/r)^2}{4\\pi^2 E}\\right]\\ (\\text{Johnson})',
        text: 'Mott 17-4: a ball screw in compression is a column — long screws by Euler (Eq. 6-4), short ones by J. B. Johnson (Eq. 6-9). The column end-fixity factors differ from the critical-speed ones: simple–simple 1.00, fixed–fixed 4.00, fixed–simple 2.00, fixed–free 0.25 (so the effective-length constant K = 1/√K<sub>s</sub> = 1.0, 0.5, 0.707, 2.0 as in Ch. 6). Use the minor (root) diameter and the same support span; suppliers tabulate the allowable compressive load directly.',
        vars: [
          { id: 'Ksc', symbol: 'K_s', label: 'End fixity factor (column)', kind: 'choice', options: [{ label: 'Simply supported both ends — 1.00', value: 1 }, { label: 'Fixed both ends — 4.00', value: 4 }, { label: 'Fixed one end, simple other — 2.00', value: 2 }, { label: 'Fixed one end, free other — 0.25', value: 0.25 }], default: 1 },
          { id: 'Esc', symbol: 'E', label: 'Modulus of the screw steel', unit: 'psi', kind: 'input', default: 30e6 },
          { id: 'Sysc', symbol: 'S_y', label: 'Yield strength of the screw', unit: 'psi', kind: 'input', hint: 'e.g. 4140 / induction-hardened: ~ 90 000 psi; Mott App. 3' },
          { id: 'SR', symbol: 'KL/r', label: 'Slenderness ratio', kind: 'calc', digits: 4, compute: v => H.has(v, 'dmin', 'Lsup', 'Ksc') && v.dmin > 0 ? (1 / Math.sqrt(v.Ksc)) * v.Lsup / (v.dmin / 4) : undefined,
            work: v => H.has(v, 'SR') ? '\\(KL/r = \\dfrac{(1/\\sqrt{' + H.fmt(v.Ksc) + '})(' + H.fmt(v.Lsup) + ')}{' + H.fmt(v.dmin) + '/4} = ' + H.fmt(v.SR, 4) + '\\)' : null },
          { id: 'Cc', symbol: 'C_c', label: 'Column constant (Euler / Johnson transition)', kind: 'calc', digits: 4, compute: v => H.has(v, 'Esc', 'Sysc') && v.Sysc > 0 ? Math.sqrt(2 * Math.PI * Math.PI * v.Esc / v.Sysc) : undefined },
          { id: 'Pcr', symbol: 'P_{cr}', label: 'Critical buckling load', unit: 'lb', kind: 'calc', digits: 4, compute: v => { if (!H.has(v, 'SR', 'Cc', 'Esc', 'Sysc', 'dmin')) return undefined; const Ar = Math.PI * v.dmin * v.dmin / 4;
              return v.SR > v.Cc ? Math.PI * Math.PI * v.Esc * Ar / (v.SR * v.SR) : Ar * v.Sysc * (1 - v.Sysc * v.SR * v.SR / (4 * Math.PI * Math.PI * v.Esc)); },
            work: v => H.has(v, 'Pcr') ? (v.SR > v.Cc ? '\\(P_{cr} = \\dfrac{\\pi^2(' + H.fmt(v.Esc, 3) + ')(' + H.fmt(Math.PI * v.dmin * v.dmin / 4, 4) + ')}{(' + H.fmt(v.SR, 4) + ')^2} = ' + H.fmt(v.Pcr, 4) + '\\ \\text{lb (Euler)}\\)' : '\\(P_{cr} = ' + H.fmt(Math.PI * v.dmin * v.dmin / 4, 4) + '(' + H.fmt(v.Sysc) + ')\\left[1 - \\dfrac{' + H.fmt(v.Sysc) + '(' + H.fmt(v.SR, 4) + ')^2}{4\\pi^2(' + H.fmt(v.Esc, 3) + ')}\\right] = ' + H.fmt(v.Pcr, 4) + '\\ \\text{lb (Johnson)}\\)') : null },
          { id: 'Pall', symbol: 'P_{cr}/SF', label: 'Allowable compressive load', unit: 'lb', kind: 'calc', digits: 4, compute: v => H.has(v, 'Pcr', 'SF') && v.SF > 0 ? v.Pcr / v.SF : undefined },
          { id: 'nbuck', symbol: 'P_{cr}/F', label: 'Buckling factor of safety', kind: 'calc', digits: 3, compute: v => H.has(v, 'Pcr', 'F') && v.F > 0 ? v.Pcr / v.F : undefined },
        ],
        after: v => H.has(v, 'nbuck', 'SF') ? (v.nbuck >= v.SF ? '<span class="result-ok">P<sub>cr</sub>/F = ' + H.fmt(v.nbuck, 3) + ' ≥ SF = ' + H.fmt(v.SF) + ' — no column buckling (' + (v.SR > v.Cc ? 'Euler, long column' : 'Johnson, short column') + ').</span>' : '<span class="result-bad">P<sub>cr</sub>/F = ' + H.fmt(v.nbuck, 3) + ' &lt; SF = ' + H.fmt(v.SF) + ' — buckling risk: larger screw, shorter span or fixed supports (or load the screw in tension).</span>') : (H.has(v, 'SR') ? '<span>Enter S<sub>y</sub> to get the buckling load.</span>' : '') },
    ] },

    { title: 'Result', steps: [
      { id: 'result', title: 'Selected ball screw', fig: ['fig17-8'],
        text: 'Life (Figure 17-8), critical speed (n < 0.8 n<sub>c</sub>) and column buckling (P<sub>cr</sub>/F ≥ SF) must all pass. Mott Example 17-3: 12 500 lb, 15-in stroke × 2, 8 cycles/day, 10 yr → 8.76 × 10⁵ in → 2-in screw, T<sub>u</sub> = 1106 lb·in, 150 rpm, 2.63 hp, expected life ≈ 3.2 × 10⁶ in (3.65× required).',
        vars: [
          { id: 'Tures', symbol: 'T_u', label: 'Driving torque', unit: 'lb·in', kind: 'calc', compute: v => v.Tu },
          { id: 'Pres', symbol: 'P', label: 'Power', unit: 'hp', kind: 'calc', digits: 4, compute: v => v.P },
        ],
        after: v => { if (!BS(v) || v.Tu === undefined) return '<span>Complete steps 1–3.</span>';
          const checks = []; if (v.ratio !== undefined) checks.push(['life', v.ratio >= 1]); if (H.has(v, 'nratio')) checks.push(['critical speed', v.nratio < 0.8]); if (H.has(v, 'nbuck', 'SF')) checks.push(['buckling', v.nbuck >= v.SF]);
          const bad = checks.filter(c => !c[1]).map(c => c[0]);
          const sys = BS(v).label + '; T<sub>u</sub> = ' + H.fmt(v.Tu) + ' lb·in, T<sub>b</sub> = ' + H.fmt(v.Tb) + ' lb·in' + (v.P !== undefined ? ', ' + H.fmt(v.P) + ' hp at ' + H.fmt(v.n) + ' rpm' : '') + (v.ratio !== undefined ? '; expected life ' + H.fmt(v.Lexp, 3) + ' in = ' + H.fmt(v.ratio, 3) + '× required' : '') + '.';
          return bad.length ? '<span class="result-bad"><b>FAIL</b> — ' + bad.join(', ') + '. ' + sys + '</span>' : '<span class="result-ok"><b>PASS</b>' + (checks.length < 3 ? ' (' + checks.map(c => c[0]).join(', ') + ' checked)' : '') + ' — ' + sys + '</span>'; } },
    ] },
  ],
};
