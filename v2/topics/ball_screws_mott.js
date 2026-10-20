// Ball screws — Mott Ch. 17-3 / 17-4 (Fizz §5.2, Fizz pp.127–128) + Thomson catalogue (Module 5 reading guide) + Thomson RoundRail linear bearings.
// Verified against: Mott Example Problem 17-3 (the `example`: 12 500 lb, 15-in stroke × 2, 8 cycles/day, 10 yr, 15 in in 12 s) → travel 8.76 × 10⁵ in,
//   2-in screw (lead 0.50 in), Tu = 0.177FL = 1106 lb·in, 150 rpm, 2.63 hp — reproduced. Expected life from the traced chart is 3.4 × 10⁶ in
//   (Mott reads ≈ 3.2 × 10⁶ in off the printed chart).
// Verified against: HW5 P5 2023/2024 (900 lb, 36 in/cycle, 12 cycles/h, 24 h, 365 d, 10 yr, 2 in/s) → 3.78 × 10⁷ in, ¾-in 2-tpi 0.50-lead screw
//   (938 lb rated at that life ≥ 900), T 79.6 lb·in, 240 rpm, 0.303 hp — reproduced; part e (SF 2.5, both ends fixed, Thomson root 0.63 in)
//   → Lmax 56 in by the Thomson p.142 formula with S = 0.8 (solution reads ≈ 53 in off the p.149 chart), 0.8 nc at 53 in = 1900 rpm
//   (chart ≈ 1850); part f (and HW4 2024 P9) → 412.5 lb per forward linear bearing, SF = 500/412.5 = 1.21 — reproduced.
// Rated load (lb) at 1.0e6 in travel life, read off Mott Figure 17-8 (pixel-traced); 1/2-in value confirmed by Mott text (1000 lb).
// dr = Thomson inch-series root diameter for the same diameter × lead (catalogue product pages).
const BS_SIZES = [
  { label: '3 in, 1½ tpi, lead 0.667 in', value: 3, tpi: 1.5, L: 0.667, P6: 38000, dr: 2.48 },
  { label: '2½ in, 1 tpi, lead 1.00 in', value: 2.5, tpi: 1, L: 1.0, P6: 27000, dr: 2.22 },
  { label: '2 in, 2 tpi, lead 0.50 in', value: 2, tpi: 2, L: 0.5, P6: 18800, dr: 1.72 },
  { label: '1½ in, 2 tpi, lead 0.50 in', value: 1.5, tpi: 2, L: 0.5, P6: 10900, dr: 1.27 },
  { label: '¾ in, 2 tpi, lead 0.50 in', value: 0.75, tpi: 2, L: 0.5, P6: 3150, dr: 0.63 },
  { label: '½ in, 5 tpi, lead 0.20 in', value: 0.5, tpi: 5, L: 0.2, P6: 1000, dr: 0.41 },
  { label: '⅜ in, 8 tpi, lead 0.125 in', value: 0.375, tpi: 8, L: 0.125, P6: 420, dr: 0.31 },
];
const BS = v => BS_SIZES.find(s => s.value === v.size);
// Thomson p.142 end-fixity factors: [label, Cs speed, Cs compression]
const TEND = { A: ['A — one end fixed, other free', 0.36, 0.25], B: ['B — both ends supported', 1.0, 1.0], C: ['C — one fixed, other supported', 1.47, 2.0], D: ['D — both ends fixed', 2.23, 4.0] };
const TX = (x, d) => String(H.fmt(x, d)).replace(/e([+-]?)(\d+)$/, (m, s, e) => '\\times10^{' + (s === '-' ? '-' : '') + e + '}');
function sizeTable(v) {
  if (!H.has(v, 'life', 'F') || !(v.life > 0)) return '';
  const rows = BS_SIZES.slice().reverse().map(s => { const Pr = s.P6 * Math.pow(1e6 / v.life, 1 / 3), Lx = 1e6 * Math.pow(s.P6 / v.F, 3); return { s, Pr, Lx, ok: Pr >= v.F }; });
  const pk = rows.find(r => r.ok);
  return H.table(['Screw (Fig. 17-8)', 'Lead', '\\(P_{rated}\\) at \\(L_{req}\\)', '\\(\\ge F\\)?', 'Expected life at F'],
    rows.map(r => ({ cells: [r.s.label.split(',')[0] + ', ' + r.s.tpi + ' tpi' + (v.size === r.s.value ? ' ✔' : ''), r.s.L + ' in', H.fmt(r.Pr, 3) + ' lb', r.ok ? 'yes' : 'no', '\\(' + TX(r.Lx, 3) + '\\) in'],
      ok: r.ok, pick: r === pk, set: { size: r.s.value, P6: '' } })),
    { caption: 'Select the ball screw — Fig. 17-8 at \\(L_{req} = ' + TX(v.life, 3) + '\\) in, F = ' + H.fmt(v.F) + ' lb', note: 'Rule (Fizz p.127–128, HW5 P5): the smallest screw whose line is at or above F at the required travel. Rated loads are a trace of the chart (±5 %); \\(P \\propto L^{-1/3}\\) like a ball bearing.' + (pk ? '' : ' <b>No size is large enough — use two screws or the Thomson catalogue.</b>') });
}

window.TOPIC = {
  id: 'ball_screws', book: 'mott',
  title: 'Ball Screws — Life, Selection, Torque & Power',
  subtitle: 'Mott Ch. 17-3 / 17-4 · Fizz guide §5.2 · Thomson catalogue (Example 17-3, HW5 P5)',
  sibling: 'ball_screws_shigley.html',
  intro: 'Travel life → screw from Fig. 17-8 → torque (e ≈ 0.90), speed, power → critical speed, buckling and maximum length → linear bearings. '
    + 'Ball screws are never self-locking (a brake holds the load) and must be checked for column buckling. US units: lb, in, in/s, lb·in, hp.',
  example: { F: 12500, dist: 30, cyc: 8, basis: 'day', hrs: 24, days: 365, yrs: 10, size: 2, Vreq: 1.25 },

  assumptions: [
    { text: 'Travel life = distance/cycle × cycles/h × 24 h/day × 365 days/yr × years (runs around the clock)', src: 'Fizz p.127 · HW5 P5', var: 'hrs' },
    { text: 'Distance per cycle counts both strokes when the nut goes out and back (Example 17-3: 2 × 15 in)', src: 'Mott Ex. 17-3', step: 'duty' },
    { text: 'Screw = smallest Fig. 17-8 line at or above the load at the required life', src: 'Fizz pp.127–128', var: 'P6' },
    { text: 'Efficiency e = 0.90, so \\(T_u = 0.177FL\\)', src: 'Fizz p.128 · Mott Eq. 17-13', var: 'eff' },
    { text: 'Power \\(P = T_u n/63\\,025\\) (course HW5); Fizz uses 63 000', src: 'Fizz p.128 · HW5 P5', step: 'spd' },
    { text: 'Critical speed: run below 0.80 \\(n_c\\), SF = 2 (Mott 1.25–3.0), simply supported ends unless described', src: 'Mott §17-4', var: 'SF' },
    { text: 'Thomson limits use the safe factor S = 0.8 on both critical speed and buckling load', src: 'Thomson p.142', step: 'tmax' },
  ],

  figures: [
    { id: 'fig17-3', ref: 'Figure 17-3', title: 'Ball screw — recirculating balls, ball nut, return tube', src: 'figures/mott/fig17-3.png', page: 660 },
    { id: 'fig17-8', ref: 'Figure 17-8', title: 'Ball screw performance: rated load vs travel life (in), 7 sizes with lead table', src: 'figures/mott/fig17-8.png', page: 667,
      note: 'Enter at the travel life, go up to the load: the first line at or above it. ½-in 5-tpi: 1000 lb at \\(10^6\\) in.' },
    { id: 'fig17-5', ref: 'Figure 17-5', title: 'Screw-thread force analysis (lead, lead angle)', src: 'figures/mott/fig17-5.png', page: 663 },
    { id: 'thom139', ref: 'Thomson p.139', book: 'course', title: 'Selecting a ball screw assembly (inch series): 10-step procedure', src: 'figures/course/thomson_ballscrew_p139_inch_selection_procedure.png', note: 'Thomson ball-screw catalogue p.139 (Module 5 reading list).' },
    { id: 'thom140', ref: 'Thomson p.140', book: 'course', title: 'Worked selection example (30 000 lb, 200 in/min, 85 in travel, \\(2\\times10^6\\) in life)', src: 'figures/course/thomson_ballscrew_p140_inch_selection_example.png' },
    { id: 'thom141', ref: 'Thomson p.141', book: 'course', title: 'Life \\(L_{10} = (C_{am}/F_{eq})^3\\times10^6\\) in, equivalent load and speed for duty cycles', src: 'figures/course/thomson_ballscrew_p141_inch_life_formulas.png' },
    { id: 'thom142', ref: 'Thomson p.142', book: 'course', title: 'Torque (0.177 FL), back-drive (0.143 FL), power, critical speed \\(n_c = C_s\\,4.76\\times10^{6} d_r/l^2\\), compression load \\(F_c = C_s\\,1.405\\times10^{7} d_r^4/l^2\\)', src: 'figures/course/thomson_ballscrew_p142_inch_torque_speed_buckling.png', note: 'End fixity A–D: speed 0.36 / 1.00 / 1.47 / 2.23, compression 0.25 / 1 / 2 / 4; safe value = 0.8 × critical.' },
    { id: 'thom146', ref: 'Thomson p.146', book: 'course', title: 'End-support configurations A–D for speed and compression; tension vs compression loading', src: 'figures/course/thomson_ballscrew_p146_support_configurations.png' },
    { id: 'thom147', ref: 'Thomson p.147', book: 'course', title: 'Acceptable speed (0.8 \\(n_c\\)) vs unsupported length, end supports A–D', src: 'figures/course/thomson_ballscrew_p147_inch_speed_vs_length.png', note: 'HW5 P5: ¾ × 0.500, both ends fixed, 53 in → ≈ 1850 rpm.' },
    { id: 'thom148', ref: 'Thomson p.148', book: 'course', title: 'Life expectancy chart: load vs life (\\(10^6\\) in of travel) per screw', src: 'figures/course/thomson_ballscrew_p148_inch_life_chart.png' },
    { id: 'thom149', ref: 'Thomson p.149', book: 'course', title: 'Compression load vs unsupported length (buckling), end supports A–D', src: 'figures/course/thomson_ballscrew_p149_inch_compression_load_vs_length.png', note: 'HW5 P5: 900 lb × SF 2.5 = 2250 lb, both ends fixed → ≈ 53 in.' },
    { id: 'thom150', ref: 'Thomson p.150', book: 'course', title: 'Selecting a ball screw assembly (metric series)', src: 'figures/course/thomson_ballscrew_p150_metric_selection_procedure.png' },
    { id: 'thom151', ref: 'Thomson p.151', book: 'course', title: 'Metric worked selection example', src: 'figures/course/thomson_ballscrew_p151_metric_selection_example.png' },
    { id: 'thom152', ref: 'Thomson p.152', book: 'course', title: 'Metric life, equivalent load and speed formulas', src: 'figures/course/thomson_ballscrew_p152_metric_life_formulas.png' },
    { id: 'thom153', ref: 'Thomson p.153', book: 'course', title: 'Metric torque, power, critical speed and compression load', src: 'figures/course/thomson_ballscrew_p153_metric_torque_speed_buckling.png' },
    { id: 'thom157', ref: 'Thomson p.157', book: 'course', title: 'Acceptable speed vs length (metric screws)', src: 'figures/course/thomson_ballscrew_p157_metric_speed_vs_length.png' },
    { id: 'thom158', ref: 'Thomson p.158', book: 'course', title: 'Compression load vs length (metric screws)', src: 'figures/course/thomson_ballscrew_p158_metric_compression_load_vs_length.png' },
    { id: 'rr263', ref: 'Thomson RoundRail p.257', book: 'course', title: 'Ball Bushing life and load: \\(W_e = P/(K_L K_S K_0)\\), travel-life factor \\(K_L\\), shaft-hardness factor \\(K_S\\)', src: 'figures/course/thomson_roundrail_p263_ball_bushing_life.png', note: 'Linear bearings are not in either textbook; the Thomson RoundRail catalogue is the course resource.' },
    { id: 'rr264', ref: 'Thomson RoundRail p.258', book: 'course', title: 'Load-direction factor \\(K_0\\) (polar graph), dynamic rating, travel life', src: 'figures/course/thomson_roundrail_p264_load_direction_shaft_hardness.png' },
    { id: 'rr265', ref: 'Thomson RoundRail p.259', book: 'course', title: '60 Case LinearRace shaft specs; high-load and short-stroke correction charts', src: 'figures/course/thomson_roundrail_p265_shaft_specs_load_factor.png' },
    { id: 'rr26', ref: 'Thomson RoundRail p.26', book: 'course', title: 'Super Smart Ball Bushing bearings (closed): dimensions and dynamic load capacity', src: 'figures/course/thomson_roundrail_p26_super_smart_closed_specs.png' },
    { id: 'rr27', ref: 'Thomson RoundRail p.27', book: 'course', title: 'Super Smart load/life graph and polar graphs — size a bearing from load and travel', src: 'figures/course/thomson_roundrail_p27_super_smart_load_life_graph.png', note: 'HW5 P5f: 412 lb at \\(3.7\\times10^7\\) in → SSUPB10 (⅝-in shaft, ≈ 500 lb).' },
  ],

  sections: [
    { title: 'Step 1: Travel life', steps: [
      { id: 'duty', title: 'Duty cycle → total travel over the design life', fig: ['thom141'], formula: 'L_{req} = \\frac{\\text{distance}}{\\text{cycle}}\\cdot\\frac{\\text{cycles}}{\\text{h}}\\cdot\\frac{24\\ \\text{h}}{\\text{day}}\\cdot\\frac{365\\ \\text{days}}{\\text{yr}}\\cdot\\text{years}',
        text: 'Count both strokes if the nut goes out and back. Give the cycle rate per hour (Fizz) or per day (Mott).',
        vars: [
          { id: 'dist', symbol: 's_{cyc}', label: 'Travel per cycle', unit: 'in', kind: 'input' },
          { id: 'basis', label: 'Cycle rate is given per…', kind: 'choice', type: 'text', options: [{ label: 'hour (Fizz form)', value: 'hour' }, { label: 'day (Mott form)', value: 'day' }], default: 'hour' },
          { id: 'cyc', symbol: 'N_{cyc}', label: 'Cycles per hour (or per day)', kind: 'input' },
          { id: 'hrs', symbol: 'h/d', label: 'Operating hours per day', unit: 'h', kind: 'input', default: 24, hint: 'per-hour rate only' },
          { id: 'days', label: 'Operating days per year', unit: 'd', kind: 'input', default: 365 },
          { id: 'yrs', symbol: 'Y', label: 'Design life', unit: 'years', kind: 'input' },
          { id: 'life', symbol: 'L_{req}', label: 'Required travel life', unit: 'in', kind: 'calc', digits: 4, compute: v => {
              if (!H.has(v, 'dist', 'cyc', 'days', 'yrs')) return undefined;
              const perDay = v.basis === 'day' ? v.cyc : (H.has(v, 'hrs') ? v.cyc * v.hrs : undefined);
              return perDay === undefined ? undefined : v.dist * perDay * v.days * v.yrs; },
            work: v => H.has(v, 'life') ? '\\(L_{req} = ' + TX(v.dist) + ' \\times ' + TX(v.cyc) + (v.basis === 'day' ? '' : ' \\times ' + TX(v.hrs)) + ' \\times ' + TX(v.days) + ' \\times ' + TX(v.yrs) + ' = ' + TX(v.life) + '\\ \\text{in}\\)' : null },
        ] },
    ] },

    { title: 'Step 2: Select the screw (Figure 17-8)', steps: [
      { id: 'sel', title: 'Load and screw size', fig: ['fig17-8', 'fig17-3', 'thom139', 'thom140', 'thom148'], eq: '17-12',
        formula: '\\frac{L_2}{L_1} = \\left(\\frac{P_1}{P_2}\\right)^3 \\quad\\Rightarrow\\quad P_{rated} = P_{10^6}\\left(\\frac{10^6}{L_{req}}\\right)^{1/3}',
        text: 'Pick the smallest screw whose rated load at \\(L_{req}\\) is ≥ F — see the table below. \\(P_{10^6}\\) is pre-filled from a trace of the chart.',
        vars: [
          { id: 'F', symbol: 'F', label: 'Axial load on the screw', unit: 'lb', kind: 'input' },
          { id: 'size', symbol: 'D', label: 'Ball screw (nominal dia, tpi, lead)', kind: 'choice', options: BS_SIZES, default: 2 },
          { id: 'L', symbol: 'L', label: 'Lead', unit: 'in', kind: 'calc', compute: v => BS(v) ? BS(v).L : undefined },
          { id: 'P6', symbol: 'P_{10^6}', label: 'Rated load at \\(10^6\\) in travel', unit: 'lb', kind: 'lookup', fig: 'fig17-8', hint: 'auto from the chart trace', auto: v => BS(v) ? BS(v).P6 : undefined },
          { id: 'Prl', symbol: 'P_{rated}', label: 'Rated load at the required life', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'P6', 'life') && v.life > 0 ? v.P6 * Math.pow(1e6 / v.life, 1 / 3) : undefined,
            work: v => H.has(v, 'Prl') ? '\\(P_{rated} = ' + TX(v.P6) + '\\left(\\dfrac{10^6}{' + TX(v.life) + '}\\right)^{1/3} = ' + TX(v.Prl) + '\\ \\text{lb}\\)' : null },
          { id: 'Lexp', symbol: 'L_{exp}', label: 'Expected life at load F', unit: 'in', kind: 'calc', digits: 3, compute: v => H.has(v, 'P6', 'F') && v.F > 0 ? 1e6 * Math.pow(v.P6 / v.F, 3) : undefined,
            work: v => H.has(v, 'Lexp') ? '\\(L_{exp} = 10^6\\left(\\dfrac{' + TX(v.P6) + '}{' + TX(v.F) + '}\\right)^3 = ' + TX(v.Lexp, 3) + '\\ \\text{in}\\)' : null },
          { id: 'ratio', symbol: 'L_{exp}/L_{req}', label: 'Life margin', kind: 'calc', digits: 3, compute: v => H.has(v, 'Lexp', 'life') && v.life > 0 ? v.Lexp / v.life : undefined },
        ],
        after: v => sizeTable(v) + (H.has(v, 'ratio') ? (v.ratio >= 1 ? '<span class="result-ok">Screw OK: life margin ' + H.fmt(v.ratio, 3) + '×.</span>' : '<span class="result-bad">Too small: life margin ' + H.fmt(v.ratio, 3) + '× — choose a larger screw.</span>') : '') },
    ] },

    { title: 'Step 3–4: Torque, speed, power', steps: [
      { id: 'tq', title: 'Driving and back-driving torque', fig: ['thom142'], eq: '17-13, 17-14', formula: 'T_u = \\frac{F L}{2\\pi e} = 0.177\\,F L \\;(e = 0.90) \\qquad T_b = \\frac{F L e}{2\\pi} = 0.143\\,F L',
        text: 'Ball screws (e ≈ 90 %) are never self-locking: the load back-drives the screw unless a brake holds it.',
        vars: [
          { id: 'eff', symbol: 'e', label: 'Efficiency', kind: 'input', default: 0.9 },
          { id: 'Tu', symbol: 'T_u', label: 'Torque to drive', unit: 'lb·in', kind: 'calc', compute: v => H.has(v, 'F', 'L', 'eff') && v.eff > 0 ? v.F * v.L / (2 * Math.PI * v.eff) : undefined,
            work: v => H.has(v, 'Tu') ? '\\(T_u = \\dfrac{' + TX(v.F) + '(' + TX(v.L) + ')}{2\\pi(' + TX(v.eff) + ')} = ' + TX(v.Tu) + '\\ \\text{lb·in}\\)' : null },
          { id: 'Tb', symbol: 'T_b', label: 'Back-driving torque', unit: 'lb·in', kind: 'calc', compute: v => H.has(v, 'F', 'L', 'eff') ? v.F * v.L * v.eff / (2 * Math.PI) : undefined },
        ] },
      { id: 'spd', title: 'Rotational speed and power', formula: 'n = \\frac{60V}{L} \\qquad P = \\frac{T_u\\,n}{63\\,025}',
        vars: [
          { id: 'Vreq', symbol: 'V', label: 'Required linear speed', unit: 'in/s', kind: 'input', hint: 'stroke ÷ allowed time' },
          { id: 'n', symbol: 'n', label: 'Screw speed', unit: 'rpm', kind: 'calc', compute: v => H.has(v, 'Vreq', 'L') && v.L > 0 ? v.Vreq / v.L * 60 : undefined,
            work: v => H.has(v, 'n') ? '\\(n = \\dfrac{60(' + TX(v.Vreq) + ')}{' + TX(v.L) + '} = ' + TX(v.n) + '\\ \\text{rpm}\\)' : null },
          { id: 'P', symbol: 'P', label: 'Power to drive the screw', unit: 'hp', kind: 'calc', digits: 4, compute: v => H.has(v, 'Tu', 'n') ? v.Tu * v.n / 63025 : undefined,
            work: v => H.has(v, 'P') ? '\\(P = \\dfrac{' + TX(v.Tu) + '(' + TX(v.n) + ')}{63\\,025} = ' + TX(v.P) + '\\ \\text{hp}\\)' : null },
        ] },
    ] },

    { title: 'Application checks (Mott 17-4, Thomson)', steps: [
      { id: 'nc', title: 'Critical speed (Mott)', fig: ['thom142', 'thom146', 'thom147'], eq: '17-15', formula: 'n_c = 4.76\\times10^{6}\\,\\frac{d\\,K_s}{(SF)\\,L_s^2} \\qquad n < 0.80\\,n_c',
        text: 'd = root diameter, \\(L_s\\) = span between supports. \\(K_s\\): simple–simple 1.00, fixed–fixed 2.24, fixed–simple 1.55, fixed–free 0.32.',
        vars: [
          { id: 'dmin', symbol: 'd_r', label: 'Root diameter of the screw', unit: 'in', kind: 'input', auto: v => BS(v) ? BS(v).dr : undefined, hint: 'auto = Thomson root diameter for this size' },
          { id: 'Ks', symbol: 'K_s', label: 'End fixity (critical speed)', kind: 'choice', options: [{ label: 'Simply supported both ends — 1.00', value: 1 }, { label: 'Fixed both ends — 2.24', value: 2.24 }, { label: 'Fixed one end, simple other — 1.55', value: 1.55 }, { label: 'Fixed one end, free other — 0.32', value: 0.32 }], default: 1 },
          { id: 'SF', symbol: 'SF', label: 'Safety factor', kind: 'input', default: 2, hint: '1.25–3.0' },
          { id: 'Lsup', symbol: 'L_s', label: 'Length between supports', unit: 'in', kind: 'input' },
          { id: 'ncrit', symbol: 'n_c', label: 'Critical speed', unit: 'rpm', kind: 'calc', compute: v => H.has(v, 'dmin', 'Ks', 'SF', 'Lsup') && v.Lsup > 0 ? 4.76e6 * v.dmin * v.Ks / (v.SF * v.Lsup * v.Lsup) : undefined,
            work: v => H.has(v, 'ncrit') ? '\\(n_c = 4.76\\times10^6\\,\\dfrac{' + TX(v.dmin) + '(' + TX(v.Ks) + ')}{' + TX(v.SF) + '(' + TX(v.Lsup) + ')^2} = ' + TX(v.ncrit) + '\\ \\text{rpm}\\)' : null },
          { id: 'nratio', symbol: 'n/n_c', label: 'Operating / critical speed', kind: 'calc', digits: 3, compute: v => H.has(v, 'n', 'ncrit') && v.ncrit > 0 ? v.n / v.ncrit : undefined },
        ],
        after: v => H.has(v, 'nratio') ? (v.nratio < 0.8 ? '<span class="result-ok">\\(n = ' + TX(v.n) + ' < 0.8n_c = ' + TX(0.8 * v.ncrit) + '\\) rpm — OK.</span>' : '<span class="result-bad">\\(n = ' + TX(v.n) + ' \\ge 0.8n_c = ' + TX(0.8 * v.ncrit) + '\\) rpm — shorten the span, fix the ends or use a larger screw.</span>') : '' },
      { id: 'buck', title: 'Column buckling (Mott)', fig: ['thom142', 'thom146', 'thom149'], eq: 'Mott 17-4 with Eqs. 6-4 / 6-9',
        formula: 'r = \\frac{d}{4} \\quad \\frac{KL}{r},\\; K = \\frac{1}{\\sqrt{K_s}} \\quad C_c = \\sqrt{\\frac{2\\pi^2 E}{S_y}} \\quad P_{cr} = \\frac{\\pi^2 E A}{(KL/r)^2}\\ (KL/r > C_c) \\quad P_{cr} = A S_y\\left[1 - \\frac{S_y (KL/r)^2}{4\\pi^2 E}\\right]',
        text: 'A ball screw in compression is a column — Euler if long, J. B. Johnson if short. Column \\(K_s\\): 1.00, 4.00, 2.00, 0.25 (K = 1.0, 0.5, 0.707, 2.0).',
        vars: [
          { id: 'Ksc', symbol: 'K_s', label: 'End fixity (column)', kind: 'choice', options: [{ label: 'Simply supported both ends — 1.00', value: 1 }, { label: 'Fixed both ends — 4.00', value: 4 }, { label: 'Fixed one end, simple other — 2.00', value: 2 }, { label: 'Fixed one end, free other — 0.25', value: 0.25 }], default: 1 },
          { id: 'Esc', symbol: 'E', label: 'Modulus of the screw', unit: 'psi', kind: 'input', default: 30e6 },
          { id: 'Sysc', symbol: 'S_y', label: 'Yield strength of the screw', unit: 'psi', kind: 'input', hint: 'e.g. ≈ 90 000 psi; Mott App. 3' },
          { id: 'SR', symbol: 'KL/r', label: 'Slenderness ratio', kind: 'calc', digits: 4, compute: v => H.has(v, 'dmin', 'Lsup', 'Ksc') && v.dmin > 0 ? (1 / Math.sqrt(v.Ksc)) * v.Lsup / (v.dmin / 4) : undefined,
            work: v => H.has(v, 'SR') ? '\\(KL/r = \\dfrac{(1/\\sqrt{' + TX(v.Ksc) + '})(' + TX(v.Lsup) + ')}{' + TX(v.dmin) + '/4} = ' + TX(v.SR, 4) + '\\)' : null },
          { id: 'Cc', symbol: 'C_c', label: 'Column constant', kind: 'calc', digits: 4, compute: v => H.has(v, 'Esc', 'Sysc') && v.Sysc > 0 ? Math.sqrt(2 * Math.PI * Math.PI * v.Esc / v.Sysc) : undefined },
          { id: 'Pcr', symbol: 'P_{cr}', label: 'Critical buckling load', unit: 'lb', kind: 'calc', digits: 4, compute: v => { if (!H.has(v, 'SR', 'Cc', 'Esc', 'Sysc', 'dmin')) return undefined; const Ar = Math.PI * v.dmin * v.dmin / 4;
              return v.SR > v.Cc ? Math.PI * Math.PI * v.Esc * Ar / (v.SR * v.SR) : Ar * v.Sysc * (1 - v.Sysc * v.SR * v.SR / (4 * Math.PI * Math.PI * v.Esc)); },
            work: v => H.has(v, 'Pcr') ? (v.SR > v.Cc ? '\\(P_{cr} = \\dfrac{\\pi^2(' + TX(v.Esc, 3) + ')(' + TX(Math.PI * v.dmin * v.dmin / 4, 4) + ')}{(' + TX(v.SR, 4) + ')^2} = ' + TX(v.Pcr, 4) + '\\ \\text{lb (Euler)}\\)' : '\\(P_{cr} = ' + TX(Math.PI * v.dmin * v.dmin / 4, 4) + '(' + TX(v.Sysc) + ')\\left[1 - \\dfrac{' + TX(v.Sysc) + '(' + TX(v.SR, 4) + ')^2}{4\\pi^2(' + TX(v.Esc, 3) + ')}\\right] = ' + TX(v.Pcr, 4) + '\\ \\text{lb (Johnson)}\\)') : null },
          { id: 'nbuck', symbol: 'P_{cr}/F', label: 'Buckling factor of safety', kind: 'calc', digits: 3, compute: v => H.has(v, 'Pcr', 'F') && v.F > 0 ? v.Pcr / v.F : undefined },
        ],
        after: v => H.has(v, 'nbuck', 'SF') ? (v.nbuck >= v.SF ? '<span class="result-ok">\\(P_{cr}/F = ' + TX(v.nbuck, 3) + ' \\ge SF = ' + TX(v.SF) + '\\) — no buckling (' + (v.SR > v.Cc ? 'Euler' : 'Johnson') + ').</span>' : '<span class="result-bad">\\(P_{cr}/F = ' + TX(v.nbuck, 3) + ' < SF = ' + TX(v.SF) + '\\) — larger screw, shorter span, fixed ends, or load in tension.</span>') : (H.has(v, 'SR') ? '<span>Enter \\(S_y\\) for the buckling load.</span>' : '') },
      { id: 'tmax', title: 'Maximum length and speed (Thomson, HW5 P5e)', fig: ['thom142', 'thom149', 'thom147', 'thom146'],
        formula: 'L_{max} = \\sqrt{\\frac{0.8\\,C_{s,c}\\,1.405\\times10^{7}\\,d_r^4}{SF\\cdot F}} \\qquad n_{max} = 0.8\\,C_{s,n}\\,4.76\\times10^{6}\\,\\frac{d_r}{L^2}',
        text: 'Longest unsupported length that carries SF·F in compression, then the allowable speed at the chosen length. The charts (p.149, p.147) give the same curves.',
        vars: [
          { id: 'tend', label: 'End supports (Thomson)', kind: 'choice', type: 'text', options: Object.keys(TEND).map(k => ({ label: TEND[k][0], value: k })), default: 'D' },
          { id: 'SFt', symbol: 'SF', label: 'Safety factor on the load', kind: 'input', default: 2.5, hint: 'HW5 P5: 2.5' },
          { id: 'Lmx', symbol: 'L_{max}', label: 'Maximum unsupported length', unit: 'in', kind: 'calc', compute: v => H.has(v, 'dmin', 'SFt', 'F') && TEND[v.tend] && v.F > 0 ? Math.sqrt(0.8 * TEND[v.tend][2] * 1.405e7 * Math.pow(v.dmin, 4) / (v.SFt * v.F)) : undefined,
            work: v => H.has(v, 'Lmx') ? '\\(L_{max} = \\sqrt{\\dfrac{0.8(' + TEND[v.tend][2] + ')(1.405\\times10^{7})(' + TX(v.dmin) + ')^4}{' + TX(v.SFt) + '(' + TX(v.F) + ')}} = ' + TX(v.Lmx) + '\\ \\text{in}\\)' : null },
          { id: 'Lch', symbol: 'L', label: 'Length used for the speed check', unit: 'in', kind: 'input', auto: v => v.Lmx, hint: 'blank = \\(L_{max}\\); HW5 used 53 in (chart)' },
          { id: 'nmx', symbol: 'n_{max}', label: 'Maximum speed at that length (0.8 \\(n_c\\))', unit: 'rpm', kind: 'calc', compute: v => H.has(v, 'dmin', 'Lch') && TEND[v.tend] && v.Lch > 0 ? 0.8 * TEND[v.tend][1] * 4.76e6 * v.dmin / (v.Lch * v.Lch) : undefined,
            work: v => H.has(v, 'nmx') ? '\\(n_{max} = 0.8(' + TEND[v.tend][1] + ')(4.76\\times10^{6})\\dfrac{' + TX(v.dmin) + '}{(' + TX(v.Lch) + ')^2} = ' + TX(v.nmx) + '\\ \\text{rpm}\\)' : null },
        ],
        after: v => H.has(v, 'nmx', 'n') ? (v.n <= v.nmx ? '<span class="result-ok">Operating ' + H.fmt(v.n) + ' rpm ≤ ' + H.fmt(v.nmx) + ' rpm.</span>' : '<span class="result-bad">Operating ' + H.fmt(v.n) + ' rpm exceeds ' + H.fmt(v.nmx) + ' rpm.</span>') : '' },
      { id: 'linb', title: 'Linear bearings on round rails (Thomson, HW5 P5f)', fig: ['rr27', 'rr26', 'rr263', 'rr264'],
        formula: 'F_b = \\frac{W}{4} + \\frac{F_a h}{2 s} \\qquad SF = \\frac{W_{rated}\\,K_0 K_S}{F_b}',
        text: 'Four bearings, two pairs s apart along the travel; the axial load acts h below the rails, so its moment loads one pair down and the other up. Read the rating at the travel life from the Thomson load/life graph.',
        vars: [
          { id: 'Wtab', symbol: 'W', label: 'Table weight (centred)', unit: 'lb', kind: 'input' },
          { id: 'hax', symbol: 'h', label: 'Axial load offset below the rails', unit: 'in', kind: 'input' },
          { id: 'sbr', symbol: 's', label: 'Bearing spacing along the travel', unit: 'in', kind: 'input' },
          { id: 'Fb', symbol: 'F_b', label: 'Load on the worst bearing', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'Wtab', 'hax', 'sbr', 'F') && v.sbr > 0 ? v.Wtab / 4 + v.F * v.hax / (2 * v.sbr) : undefined,
            work: v => H.has(v, 'Fb') ? '\\(F_b = \\dfrac{' + TX(v.Wtab) + '}{4} + \\dfrac{' + TX(v.F) + '(' + TX(v.hax) + ')}{2(' + TX(v.sbr) + ')} = ' + TX(v.Fb) + '\\ \\text{lb}\\)' : null },
          { id: 'K0', symbol: 'K_0', label: 'Load-direction factor', kind: 'lookup', fig: 'rr264', default: 1, hint: '1.0 for a vertical load' },
          { id: 'KS', symbol: 'K_S', label: 'Shaft-hardness factor', kind: 'lookup', fig: 'rr263', default: 1, hint: '1.0 for HRC 60' },
          { id: 'Wrat', symbol: 'W_{rated}', label: 'Bearing rating at the travel life', unit: 'lb', kind: 'lookup', fig: 'rr27', hint: 'HW5: SSUPB10 ≈ 500 lb at \\(3.7\\times10^7\\) in' },
          { id: 'SFlb', symbol: 'SF', label: 'Bearing factor of safety', kind: 'calc', digits: 3, compute: v => H.has(v, 'Wrat', 'K0', 'KS', 'Fb') && v.Fb > 0 ? v.Wrat * v.K0 * v.KS / v.Fb : undefined },
        ],
        after: v => H.has(v, 'SFlb') ? (v.SFlb >= 1 ? '<span class="result-ok">Bearing OK — SF = ' + H.fmt(v.SFlb, 3) + '.</span>' : '<span class="result-bad">SF = ' + H.fmt(v.SFlb, 3) + ' &lt; 1 — next bearing size.</span>') : '' },
    ] },

    { title: 'Result', steps: [
      { id: 'result', title: 'Selected ball screw', fig: ['fig17-8'],
        text: 'Life, critical speed and buckling must all pass.',
        vars: [],
        after: v => { if (!BS(v) || v.Tu === undefined) return '<span>Complete steps 1–3.</span>';
          const checks = []; if (v.ratio !== undefined) checks.push(['life', v.ratio >= 1]); if (H.has(v, 'nratio')) checks.push(['critical speed', v.nratio < 0.8]); if (H.has(v, 'nbuck', 'SF')) checks.push(['buckling', v.nbuck >= v.SF]); if (H.has(v, 'nmx', 'n')) checks.push(['Thomson speed', v.n <= v.nmx]); if (H.has(v, 'SFlb')) checks.push(['linear bearing', v.SFlb >= 1]);
          const bad = checks.filter(c => !c[1]).map(c => c[0]);
          const sys = BS(v).label + '; \\(T_u = ' + TX(v.Tu) + '\\) lb·in, \\(T_b = ' + TX(v.Tb) + '\\) lb·in' + (v.P !== undefined ? ', ' + H.fmt(v.P) + ' hp at ' + H.fmt(v.n) + ' rpm' : '') + (v.ratio !== undefined ? '; life margin ' + H.fmt(v.ratio, 3) + '×' : '') + '.';
          return bad.length ? '<span class="result-bad"><b>FAIL</b> — ' + bad.join(', ') + '. ' + sys + '</span>' : '<span class="result-ok"><b>PASS</b> (' + checks.map(c => c[0]).join(', ') + ') — ' + sys + '</span>'; } },
    ] },
  ],
};
