// Power screws — Mott Ch. 17-2 (Fizz §5.1 seven-step procedure; Example Problems 17-1 / 17-2)
// Course alignment (v2/COURSE_CONVENTIONS.md §14): the Module 5 reading guide lists Mott 17-2 as the alternative to Shigley 8-1/8-2.
// Course worked numbers: HW5 P4 (2023/2024) and the final-exam review Scenario 3 (see v2/notes/past_exam_m5.md); power uses 63 025.
// Verified against: Mott Examples 17-1 / 17-2 (the `example`: F 12 500 lb, σd 10 000, τd 5000 psi, f 0.15, 15 in in 12 s) → 1½-4 Acme,
//   h 1.07 → 1.25 in, λ 3.39°, Tu 1809, Td 796, e 27.5 %, n 300 rpm, P 8.61 hp — reproduced.
// Verified against: HW5 P4 2023 (30 000 lb, σ 10 000, τ 6000, f 0.15, fc 0.06 at r 2 in, 10 hp) → At,req 3.0 → 2½-3 Acme (At 3.802, As 4.075),
//   h 1.227 → 1.25 in, Tc 3600, Tu 6973 (solution 6994 with dm = (D + Dr)/2 instead of Dp), Tu,tot 10 573 (10 594), Td,tot 7310 (7335),
//   e 0.151 (0.150), n 59.6 rpm (59.5), V 0.331 in/s (0.330) — within 0.3 %.
// Verified against: HW5 P4 2024 (27 000 lb, τ 5000) → At,req 2.70 → 2¼-3 Acme (At 2.982), h 1.496 → 1.50 in (the posted 2024 sheet reuses the 2023 solution).
// Verified against: final-exam review Scenario 3 (square thread, p = L 5 mm, Dp 22 mm, f 0.15, 2400 N, fc 0) → Tu 5934 N·mm (5.93 N·m), e 32.2 % — reproduced.
// Mott Table 17-1 (Acme, inch): [label, D, n, Dr, Dp, At, As (per in of engagement)]
const ACME = [['1/4', 0.25, 16, 0.1618, 0.2043, 0.02632, 0.3355], ['5/16', 0.3125, 14, 0.2140, 0.2614, 0.04438, 0.4344], ['3/8', 0.375, 12, 0.2632, 0.3161, 0.06589, 0.5276],
  ['7/16', 0.4375, 12, 0.3253, 0.3783, 0.0972, 0.6396], ['1/2', 0.5, 10, 0.3594, 0.4306, 0.1225, 0.7278], ['5/8', 0.625, 8, 0.4570, 0.5408, 0.1955, 0.918],
  ['3/4', 0.75, 6, 0.5371, 0.6424, 0.2732, 1.084], ['7/8', 0.875, 6, 0.6615, 0.7663, 0.4003, 1.313], ['1', 1, 5, 0.7509, 0.8726, 0.5175, 1.493],
  ['1 1/8', 1.125, 5, 0.8753, 0.9967, 0.6881, 1.722], ['1 1/4', 1.25, 5, 0.9998, 1.121, 0.8831, 1.952], ['1 3/8', 1.375, 4, 1.0719, 1.2188, 1.030, 2.110],
  ['1 1/2', 1.5, 4, 1.1965, 1.3429, 1.266, 2.341], ['1 3/4', 1.75, 4, 1.4456, 1.5916, 1.811, 2.803], ['2', 2, 4, 1.6948, 1.8402, 2.454, 3.262],
  ['2 1/4', 2.25, 3, 1.8572, 2.045, 2.982, 3.610], ['2 1/2', 2.5, 3, 2.1065, 2.2939, 3.802, 4.075], ['2 3/4', 2.75, 3, 2.3558, 2.5427, 4.711, 4.538],
  ['3', 3, 2, 2.4326, 2.7044, 5.181, 4.757], ['3 1/2', 3.5, 2, 2.9314, 3.2026, 7.388, 5.700], ['4', 4, 2, 3.4302, 3.7008, 9.985, 6.640],
  ['4 1/2', 4.5, 2, 3.9291, 4.1991, 12.972, 7.577], ['5', 5, 2, 4.4281, 4.6973, 16.351, 8.511]];
// Mott Table 17-1M (ISO trapezoidal): [D mm, p, Dp, Dr, At]  — the 32-mm row is misprinted in Mott (Dr 33.0, At 754.8); corrected values used
const TRAP = [[8, 1.5, 7.25, 6.2, 35.52], [10, 2, 9, 7.5, 53.46], [12, 3, 10.5, 8.5, 70.88], [14, 3, 12.5, 10.5, 103.9], [16, 3, 14.5, 12.5, 143.1], [20, 4, 18, 15.5, 220.4],
  [22, 5, 19.5, 16.5, 254.5], [24, 5, 21.5, 18.5, 314.2], [28, 5, 25.5, 22.5, 452.4], [30, 6, 27, 23, 490.9], [32, 6, 29, 25, 572.6], [36, 6, 33, 29, 754.8],
  [40, 7, 36.5, 32, 921.3], [46, 8, 42, 37, 1225], [50, 8, 46, 41, 1486], [55, 9, 50.5, 45, 1791], [60, 9, 55.5, 50, 2185], [70, 10, 65, 59, 3019],
  [80, 10, 75, 69, 4072], [90, 12, 84, 77, 5090], [100, 12, 94, 87, 6433], [120, 14, 113, 104, 9246], [125, 14, 122, 109, 10477]];
const SIp = v => v.units === 'SI';
const KP = v => SIp(v) ? 9.549e6 : 63025;          // P = T n / KP  (hp, lbf·in) or (kW, N·mm)
const fracTex = s => s.replace(/^(\d+) (\d+)\/(\d+)$/, '$1\\tfrac{$2}{$3}').replace(/^(\d+)\/(\d+)$/, '\\tfrac{$1}{$2}');
const TX = (x, d) => String(H.fmt(x, d)).replace(/e([+-]?)(\d+)$/, (m, s, e) => '\\times10^{' + (s === '-' ? '-' : '') + e + '}');
const inUse = b => b ? ' ✔' : '';
function acmeTable(v) {
  if (!H.has(v, 'Atreq')) return '';
  const hreq = r => H.has(v, 'Asreq') && r.As ? Math.ceil(v.Asreq / r.As * 4 - 1e-9) / 4 : undefined;
  if (SIp(v)) {
    const rows = TRAP.map(r => ({ D: r[0], p: r[1], Dp: r[2], Dr: r[3], At: r[4] }));
    const k = rows.findIndex(r => r.At >= v.Atreq - 1e-9); if (k < 0) return '<span class="result-bad">Larger than Table 17-1M — use a custom screw.</span>';
    return H.table(['\\(D\\) (mm)', '\\(p\\)', '\\(D_p\\)', '\\(D_r\\)', '\\(A_t\\) (mm\\(^2\\))', '\\(A_t \\ge A_{t,req}\\)?'],
      rows.slice(Math.max(0, k - 2), k + 4).map(r => ({ cells: ['Tr' + r.D + '×' + r.p + inUse(v.D === r.D), r.p, r.Dp, r.Dr, r.At, r.At >= v.Atreq ? 'yes' : 'no'], ok: r.At >= v.Atreq, pick: r === rows[k],
        set: { D: r.D, tpi: '', p: r.p, Dr: r.Dr, Dp: r.Dp, Atsel: r.At, Asr: '' } })),
      { caption: 'Select the screw — Table 17-1M, \\(A_{t,req} = ' + TX(v.Atreq) + '\\) mm\\(^2\\)', note: 'Rule (Fizz step 2): the first row with \\(A_t \\ge A_{t,req}\\). The 32-mm row is misprinted in Mott (\\(D_r\\) 33.0, \\(A_t\\) 754.8); corrected values shown.' });
  }
  const rows = ACME.map(r => ({ lab: r[0], D: r[1], n: r[2], Dr: r[3], Dp: r[4], At: r[5], As: r[6] }));
  const k = rows.findIndex(r => r.At >= v.Atreq - 1e-9); if (k < 0) return '<span class="result-bad">Larger than Table 17-1 — use a custom screw or several screws.</span>';
  return H.table(['\\(D\\) (in)', '\\(n\\)', '\\(D_r\\)', '\\(D_p\\)', '\\(A_t\\) (in\\(^2\\))', '\\(A_s\\) (in\\(^2\\)/in)', '\\(A_t \\ge A_{t,req}\\)?', H.has(v, 'Asreq') ? 'nut \\(h\\) (¼ in)' : 'nut'],
    rows.slice(Math.max(0, k - 2), k + 4).map(r => ({ cells: ['\\(' + fracTex(r.lab) + '\\)-' + r.n + inUse(v.D === r.D), r.n, r.Dr, r.Dp, r.At, r.As, r.At >= v.Atreq ? 'yes' : 'no', hreq(r) !== undefined ? H.fmt(hreq(r)) + ' in' : '—'],
      ok: r.At >= v.Atreq, pick: r === rows[k], set: { D: r.D, tpi: r.n, p: '', Dr: r.Dr, Dp: r.Dp, Atsel: r.At, Asr: r.As } })),
    { caption: 'Select the screw — Table 17-1, \\(A_{t,req} = ' + TX(v.Atreq) + '\\) in\\(^2\\)', note: 'Rule (Fizz step 2, HW5 P4): the first row with \\(A_t \\ge A_{t,req}\\). Use fills D, n, \\(D_r\\), \\(D_p\\), \\(A_t\\), \\(A_s\\). HW5 2023: 3.0 in\\(^2\\) → 2½-3; 2024: 2.70 in\\(^2\\) → 2¼-3.' });
}

window.TOPIC = {
  id: 'power_screws', book: 'mott',
  title: 'Power Screws — Selection, Torque & Efficiency',
  subtitle: 'Mott Ch. 17-2 · Fizz guide §5.1 procedure (Examples 17-1 / 17-2, HW5 P4)',
  sibling: 'power_screws_shigley.html',
  intro: 'Size an Acme screw from \\(A_t\\) (Table 17-1), the nut from the shear area, then lead angle, raising/lowering torque, self-locking, efficiency and speed/power. '
    + 'US units (lb, in, psi, lb·in, hp); metric trapezoidal screws use N, mm, MPa and the SI power option. Thread-root stresses are on the Shigley page.',
  example: { F: 12500, sigd: 10000, taud: 5000, thread: 14.5, f: 0.15, Atsel: 1.266, Asr: 2.341, D: 1.5, tpi: 4, Dp: 1.3429, Dr: 1.1965, ns: 1, fc: 0, units: 'US', Vreq: 1.25 },

  assumptions: [
    { text: 'Screw = first Table 17-1 / 17-1M row with \\(A_t \\ge F/\\sigma_d\\)', src: 'Fizz p.123 · Fizz p.125', step: 'at' },
    { text: 'Nut length rounded up to the nearest ¼ in', src: 'Fizz p.126', var: 'hr' },
    { text: 'Single-start thread: lead \\(L = p = 1/n\\)', src: 'Fizz pp.126–127', var: 'ns' },
    { text: 'Thread angle \\(\\phi = 14.5^\\circ\\) (Acme), 0° square, 15° trapezoidal', src: 'Fizz p.126', var: 'thread' },
    { text: 'f = 0.15 (lubricated steel on steel) when no friction coefficient is given', src: 'Mott §17-2', var: 'f' },
    { text: '\\(f_c = 0\\) when the collar runs on a rolling thrust bearing', src: 'Fizz p.126', var: 'fc' },
    { text: 'Efficiency and speed use the total raising torque (thread + collar), as HW5 P4 does', src: 'Fizz p.127 · HW5 P4', var: 'e' },
    { text: 'Power \\(P = T n/63\\,025\\) (hp, lb·in) — course HW5; Mott and Fizz round to 63 000', src: 'HW5 P4 · course §0', step: 'spd' },
  ],

  figures: [
    { id: 'fig17-2', ref: 'Figure 17-2', title: 'Power-screw thread forms: square, Acme (\\(2\\phi = 29^\\circ\\)), buttress', src: 'figures/mott/fig17-2.png', page: 660 },
    { id: 'table17-1', ref: 'Table 17-1', title: 'Preferred Acme threads — D, n, p, \\(D_r\\), \\(D_p\\), \\(A_t\\), \\(A_s\\) per inch of engagement', src: 'figures/mott/table17-1.png', page: 662,
      note: 'First row with \\(A_t \\ge\\) required; note \\(A_s\\) for the nut length.' },
    { id: 'table17-1m', ref: 'Table 17-1M', title: 'Metric trapezoidal screws (ISO): D, p, \\(D_p\\), \\(D_r\\), \\(A_t\\)', src: 'figures/mott/table17-1m.png', page: 663, note: '\\(\\phi = 15^\\circ\\). The 32-mm row is misprinted (\\(D_r\\), \\(A_t\\)).' },
    { id: 'fig17-5', ref: 'Figure 17-5', title: 'Thread force analysis: load pushed up (a) and down (b) the unrolled thread', src: 'figures/mott/fig17-5.png', page: 663 },
    { id: 'fig17-6', ref: 'Figure 17-6', title: 'Normal force on a square vs. an Acme thread (\\(F \\to F/\\cos\\phi\\))', src: 'figures/mott/fig17-6.png', page: 665 },
    { id: 'fizz-anatomy', ref: 'Fizz p.123 anatomy', title: 'Power screw anatomy — mean diameter, pitch, lead angle \\(\\lambda\\)', src: 'figures/bibles/fizz_p123_power_screw_anatomy.png', book: 'fizz' },
    { id: 'table8-5', ref: 'Table 8-5', title: 'Coefficients of friction for threaded pairs', src: 'figures/shigley/table8-5.png', page: 454, book: 'shigley', note: 'Mott only gives f = 0.15 for lubricated steel on steel.' },
    { id: 'table8-6', ref: 'Table 8-6', title: 'Thrust-collar friction coefficients', src: 'figures/shigley/table8-6.png', page: 454, book: 'shigley', note: '\\(f_c = 0\\) for a rolling thrust bearing.' },
  ],

  sections: [
    { title: 'Step 1–3: Select the screw and size the nut', steps: [
      { id: 'in', title: 'Load, thread form, allowable stresses', fig: ['fig17-2', 'table8-5'],
        text: 'Enter the axial load per screw and the allowable stresses. Acme\'s sloped 29° flanks let a split nut take up wear/backlash; a square thread cannot.',
        vars: [
          { id: 'F', symbol: 'F', label: 'Axial load per screw', unit: 'lb (N)', kind: 'input' },
          { id: 'thread', symbol: '\\phi', label: 'Thread form', kind: 'choice', options: [{ label: 'Square (\\(\\phi = 0^\\circ\\))', value: 0 }, { label: 'Acme (\\(\\phi = 14.5^\\circ\\))', value: 14.5 }, { label: 'Metric trapezoidal (\\(\\phi = 15^\\circ\\))', value: 15 }], default: 14.5 },
          { id: 'f', symbol: 'f', label: 'Thread friction coefficient', kind: 'lookup', fig: 'table8-5', default: 0.15, hint: '0.15 lubricated steel/steel' },
          { id: 'sigd', symbol: '\\sigma_d', label: 'Allowable tensile stress', unit: 'psi (MPa)', kind: 'input' },
          { id: 'taud', symbol: '\\tau_d', label: 'Allowable thread shear stress', unit: 'psi (MPa)', kind: 'input', hint: 'for the nut length — optional' },
        ] },
      { id: 'at', title: 'Required tensile-stress area → screw', eq: '17-1', fig: ['table17-1', 'table17-1m'],
        formula: 'A_{t,req} = \\frac{F}{\\sigma_d} \\qquad A_t = \\frac{\\pi}{4}\\left(\\frac{D_r + D_p}{2}\\right)^2',
        text: 'Pick the first table row with \\(A_t \\ge A_{t,req}\\) — the live table below does it; press Use to fill the row.',
        vars: [
          { id: 'Atreq', symbol: 'A_{t,req}', label: 'Required tensile-stress area', unit: 'in^2 (mm^2)', kind: 'calc', compute: v => H.has(v, 'F', 'sigd') ? v.F / v.sigd : undefined,
            work: v => H.has(v, 'F', 'sigd') ? '\\(A_{t,req} = \\dfrac{' + TX(v.F) + '}{' + TX(v.sigd) + '} = ' + TX(v.F / v.sigd) + '\\)' : null },
          { id: 'D', symbol: 'D', label: 'Nominal major diameter', unit: 'in (mm)', kind: 'lookup', fig: 'table17-1', hint: 'from the selected row' },
          { id: 'tpi', symbol: 'n', label: 'Threads per inch', unit: 'tpi', kind: 'lookup', fig: 'table17-1', hint: 'inch screws; metric: pitch below' },
          { id: 'p', symbol: 'p', label: 'Pitch', unit: 'in (mm)', kind: 'lookup', fig: 'table17-1', hint: 'auto = 1/n', auto: v => H.has(v, 'tpi') && v.tpi > 0 ? 1 / v.tpi : undefined },
          { id: 'Dr', symbol: 'D_r', label: 'Minimum minor diameter', unit: 'in (mm)', kind: 'lookup', fig: 'table17-1' },
          { id: 'Dp', symbol: 'D_p', label: 'Minimum pitch diameter', unit: 'in (mm)', kind: 'lookup', fig: 'table17-1' },
          { id: 'Atsel', symbol: 'A_t', label: 'Tensile-stress area of the screw', unit: 'in^2 (mm^2)', kind: 'lookup', fig: 'table17-1', hint: 'auto = Eq. 17-1 from \\(D_r\\), \\(D_p\\)', auto: v => H.has(v, 'Dr', 'Dp') ? Math.PI / 4 * Math.pow((v.Dr + v.Dp) / 2, 2) : undefined,
            check: v => (H.has(v, 'Atsel', 'Atreq') && v.Atsel < v.Atreq) ? '\\(A_t < A_{t,req}\\) — take the next larger screw' : null },
          { id: 'Asr', symbol: 'A_s', label: 'Shear-stress area per inch of nut', unit: 'in^2/in', kind: 'lookup', fig: 'table17-1', hint: 'last column of Table 17-1' },
        ],
        after: v => acmeTable(v) },
      { id: 'nut', title: 'Nut length from thread shear', formula: 'A_{s,req} = \\frac{F}{\\tau_d} \\qquad h = A_{s,req}\\,\\frac{1.0\\ \\text{in}}{A_s}', fig: ['table17-1'],
        text: 'Round h <b>up</b> to the nearest ¼ in (\\(A_s\\) in Table 17-1 is per 1.0 in of engagement).',
        vars: [
          { id: 'Asreq', symbol: 'A_{s,req}', label: 'Required shear area', unit: 'in^2', kind: 'calc', compute: v => H.has(v, 'F', 'taud') ? v.F / v.taud : undefined },
          { id: 'h', symbol: 'h', label: 'Required nut length', unit: 'in', kind: 'calc', compute: v => H.has(v, 'Asreq', 'Asr') ? v.Asreq / v.Asr : undefined,
            work: v => H.has(v, 'Asreq', 'Asr') ? '\\(h = ' + TX(v.Asreq) + '\\left(\\dfrac{1.0}{' + TX(v.Asr) + '}\\right) = ' + TX(v.h) + '\\ \\text{in}\\)' : null },
          { id: 'hr', symbol: 'h_{use}', label: 'Nut length, rounded up to ¼ in', unit: 'in', kind: 'calc', compute: v => H.has(v, 'h') ? Math.ceil(v.h * 4 - 1e-9) / 4 : undefined },
        ],
        when: v => H.has(v, 'taud') },
    ] },

    { title: 'Step 4: Lead angle', steps: [
      { id: 'lead', title: 'Lead and lead angle', eq: '17-3', fig: ['fig17-5', 'fizz-anatomy'], formula: 'L = n_s\\,p \\qquad \\tan\\lambda = \\frac{L}{\\pi D_p}',
        vars: [
          { id: 'ns', symbol: 'n_s', label: 'Number of thread starts', kind: 'input', default: 1 },
          { id: 'L', symbol: 'L', label: 'Lead', unit: 'in (mm)', kind: 'calc', compute: v => H.has(v, 'p', 'ns') ? v.p * v.ns : undefined },
          { id: 'lam', symbol: '\\lambda', label: 'Lead angle', unit: '°', kind: 'calc', digits: 4, compute: v => H.has(v, 'L', 'Dp') ? H.deg(Math.atan(v.L / (Math.PI * v.Dp))) : undefined,
            work: v => H.has(v, 'L', 'Dp') ? '\\(\\lambda = \\tan^{-1}\\dfrac{' + TX(v.L) + '}{\\pi(' + TX(v.Dp) + ')} = ' + TX(v.lam) + '^\\circ\\)' : null },
        ] },
    ] },

    { title: 'Step 5: Torque to raise and lower', steps: [
      { id: 'tu', title: 'Thread torque to raise \\(T_u\\) and lower \\(T_d\\)', eq: '17-8 … 17-11', fig: ['fig17-5', 'fig17-6'],
        formula: 'T_u = \\frac{F D_p}{2}\\left[\\frac{\\cos\\phi\\tan\\lambda + f}{\\cos\\phi - f\\tan\\lambda}\\right] \\qquad T_d = \\frac{F D_p}{2}\\left[\\frac{f - \\cos\\phi\\tan\\lambda}{\\cos\\phi + f\\tan\\lambda}\\right]',
        text: 'Square thread: \\(\\phi = 0\\) (Eqs. 17-8, 17-9).',
        vars: [
          { id: 'cosphi', symbol: '\\cos\\phi', label: '\\(\\cos\\phi\\)', kind: 'calc', digits: 4, compute: v => H.has(v, 'thread') ? Math.cos(H.rad(v.thread)) : undefined },
          { id: 'tanlam', symbol: '\\tan\\lambda', label: '\\(\\tan\\lambda\\)', kind: 'calc', digits: 4, compute: v => H.has(v, 'L', 'Dp') ? v.L / (Math.PI * v.Dp) : undefined },
          { id: 'Tu', symbol: 'T_u', label: 'Thread torque to raise', unit: 'lb·in (N·mm)', kind: 'calc', compute: v => H.has(v, 'F', 'Dp', 'cosphi', 'tanlam', 'f') ? v.F * v.Dp / 2 * (v.cosphi * v.tanlam + v.f) / (v.cosphi - v.f * v.tanlam) : undefined,
            work: v => H.has(v, 'Tu') ? '\\(T_u = \\dfrac{' + TX(v.F) + '(' + TX(v.Dp) + ')}{2}\\left[\\dfrac{' + TX(v.cosphi, 3) + '(' + TX(v.tanlam, 4) + ') + ' + TX(v.f) + '}{' + TX(v.cosphi, 3) + ' - ' + TX(v.f) + '(' + TX(v.tanlam, 4) + ')}\\right] = ' + TX(v.Tu) + '\\)' : null },
          { id: 'Td', symbol: 'T_d', label: 'Thread torque to lower', unit: 'lb·in (N·mm)', kind: 'calc', compute: v => H.has(v, 'F', 'Dp', 'cosphi', 'tanlam', 'f') ? v.F * v.Dp / 2 * (v.f - v.cosphi * v.tanlam) / (v.cosphi + v.f * v.tanlam) : undefined,
            work: v => H.has(v, 'Td') ? '\\(T_d = \\dfrac{' + TX(v.F) + '(' + TX(v.Dp) + ')}{2}\\left[\\dfrac{' + TX(v.f) + ' - ' + TX(v.cosphi, 3) + '(' + TX(v.tanlam, 4) + ')}{' + TX(v.cosphi, 3) + ' + ' + TX(v.f) + '(' + TX(v.tanlam, 4) + ')}\\right] = ' + TX(v.Td) + '\\)' : null },
        ] },
      { id: 'sl', title: 'Self-locking check', eq: '17-5', formula: 'f > \\tan\\lambda',
        text: 'Self-locking means the load cannot back-drive the screw (\\(T_d > 0\\)). Limit λ: 8.5° at f = 0.15, 5.7° at f = 0.10; all Table 17-1 screws (1.9°–5.6°) qualify.',
        vars: [],
        after: v => H.has(v, 'f', 'tanlam') ? (v.f > v.tanlam ? '<span class="result-ok">\\(f = ' + TX(v.f) + ' > \\tan\\lambda = ' + TX(v.tanlam, 4) + '\\) → self-locking.</span>' : '<span class="result-bad">\\(f = ' + TX(v.f) + ' \\le \\tan\\lambda = ' + TX(v.tanlam, 4) + '\\) → NOT self-locking: a brake is needed.</span>') : '' },
      { id: 'collar', title: 'Collar friction', fig: ['table8-6'], formula: 'T_c = f_c F R_c \\qquad T_{u,tot} = T_u + T_c \\qquad T_{d,tot} = T_d + T_c',
        text: 'Collar friction adds to both raising and lowering torque (HW5 P4: \\(T_c = 0.06(30\\,000)(2) = 3600\\) lb·in).',
        vars: [
          { id: 'fc', symbol: 'f_c', label: 'Collar friction coefficient', kind: 'lookup', fig: 'table8-6', default: 0, hint: '0 with a rolling thrust bearing' },
          { id: 'Rc', symbol: 'R_c', label: 'Collar friction radius', unit: 'in (mm)', kind: 'input' },
          { id: 'Tcol', symbol: 'T_c', label: 'Collar torque', unit: 'lb·in (N·mm)', kind: 'calc', compute: v => H.has(v, 'F', 'fc') ? (v.fc === 0 ? 0 : (H.has(v, 'Rc') ? v.fc * v.F * v.Rc : undefined)) : undefined,
            work: v => H.has(v, 'Tcol', 'Rc') && v.fc > 0 ? '\\(T_c = ' + TX(v.fc) + '(' + TX(v.F) + ')(' + TX(v.Rc) + ') = ' + TX(v.Tcol) + '\\)' : null },
          { id: 'Tut', symbol: 'T_{u,tot}', label: 'Total raising torque', unit: 'lb·in (N·mm)', kind: 'calc', compute: v => H.has(v, 'Tu', 'Tcol') ? v.Tu + v.Tcol : undefined },
          { id: 'Tdt', symbol: 'T_{d,tot}', label: 'Total lowering torque', unit: 'lb·in (N·mm)', kind: 'calc', compute: v => H.has(v, 'Td', 'Tcol') ? v.Td + v.Tcol : undefined },
        ] },
    ] },

    { title: 'Step 6–7: Efficiency, speed and power', steps: [
      { id: 'eff', title: 'Efficiency', eq: '17-7', formula: "e = \\frac{T'}{T_{u,tot}} = \\frac{F L}{2\\pi T_{u,tot}}",
        text: "\\(T' = FL/2\\pi\\) is the torque with f = 0. Single-thread Acme ≈ 15–30 %; ball screws ≈ 90 %.",
        vars: [
          { id: 'e', symbol: 'e', label: 'Efficiency', kind: 'calc', digits: 3, compute: v => H.has(v, 'F', 'L', 'Tut') && v.Tut > 0 ? v.F * v.L / (2 * Math.PI * v.Tut) : undefined,
            work: v => H.has(v, 'e') ? '\\(e = \\dfrac{' + TX(v.F) + '(' + TX(v.L) + ')}{2\\pi(' + TX(v.Tut) + ')} = ' + TX(v.e, 3) + ' = ' + TX(100 * v.e, 3) + '\\%\\)' : null },
        ] },
      { id: 'spd', title: 'Screw speed, linear speed and power', formula: 'n = \\frac{60V}{L} \\;\\text{or}\\; n = \\frac{63\\,025\\,P}{T_{u,tot}} \\qquad P = \\frac{T_{u,tot}\\, n}{63\\,025} \\qquad V = \\frac{nL}{60}',
        text: 'Fill in one of: required speed V, available power P, or screw speed n. Several screws / a gearbox: motor power = N P/η. SI: \\(P_{kW} = T_{N\\cdot mm}\\,n/9.549\\times10^{6}\\).',
        vars: [
          { id: 'units', label: 'Unit system', kind: 'choice', type: 'text', options: [{ label: 'US: in/s, lb·in, hp', value: 'US' }, { label: 'SI: mm/s, N·mm, kW', value: 'SI' }], default: 'US' },
          { id: 'Vreq', symbol: 'V', label: 'Required linear speed (if given)', unit: 'in/s (mm/s)', kind: 'input', hint: 'e.g. 15 in in 12 s = 1.25 in/s' },
          { id: 'Pin', symbol: 'P_{in}', label: 'Available input power (if given)', unit: 'hp (kW)', kind: 'input' },
          { id: 'nin', symbol: 'n_{given}', label: 'Screw speed (if given)', unit: 'rpm', kind: 'input' },
          { id: 'n', symbol: 'n', label: 'Screw speed', unit: 'rpm', kind: 'calc', compute: v => {
              if (H.has(v, 'nin')) return v.nin;
              if (H.has(v, 'Vreq', 'L') && v.L > 0) return v.Vreq / v.L * 60;
              if (H.has(v, 'Pin', 'Tut') && v.Tut > 0) return KP(v) * v.Pin / v.Tut; return undefined; },
            work: v => H.has(v, 'nin') ? null : (H.has(v, 'Vreq', 'L') ? '\\(n = \\dfrac{60(' + TX(v.Vreq) + ')}{' + TX(v.L) + '} = ' + TX(v.n) + '\\ \\text{rpm}\\)' : (H.has(v, 'n', 'Pin') ? '\\(n = \\dfrac{' + TX(KP(v)) + '(' + TX(v.Pin) + ')}{' + TX(v.Tut) + '} = ' + TX(v.n) + '\\ \\text{rpm}\\)' : null)) },
          { id: 'V', symbol: 'V', label: 'Linear speed of the load', unit: 'in/s (mm/s)', kind: 'calc', compute: v => H.has(v, 'n', 'L') ? v.n * v.L / 60 : undefined,
            work: v => H.has(v, 'V') ? '\\(V = \\dfrac{' + TX(v.n) + '(' + TX(v.L) + ')}{60} = ' + TX(v.V) + (SIp(v) ? '\\ \\text{mm/s}' : '\\ \\text{in/s} = ' + TX(v.V * 5) + '\\ \\text{ft/min}') + '\\)' : null },
          { id: 'P', symbol: 'P', label: 'Power per screw', unit: 'hp (kW)', kind: 'calc', digits: 4, compute: v => H.has(v, 'Tut', 'n') ? v.Tut * v.n / KP(v) : undefined,
            work: v => H.has(v, 'P') ? '\\(P = \\dfrac{' + TX(v.Tut) + '(' + TX(v.n) + ')}{' + TX(KP(v)) + '} = ' + TX(v.P) + '\\)' : null },
          { id: 'Nscr', symbol: 'N', label: 'Number of screws driven', kind: 'input', default: 1 },
          { id: 'etad', symbol: '\\eta', label: 'Drive (gear) efficiency', kind: 'input', default: 1 },
          { id: 'Pmot', symbol: 'P_{motor}', label: 'Motor power \\(NP/\\eta\\)', unit: 'hp (kW)', kind: 'calc', digits: 4, compute: v => H.has(v, 'P', 'Nscr', 'etad') && v.etad > 0 ? v.Nscr * v.P / v.etad : undefined },
        ],
        after: v => {
          if (v.Tu === undefined) return '';
          const okA = !H.has(v, 'Atsel', 'Atreq') || v.Atsel >= v.Atreq, okSL = !H.has(v, 'f', 'tanlam') || v.f > v.tanlam, okP = !H.has(v, 'Pin', 'Pmot') || v.Pmot <= v.Pin * 1.0001;
          const ok = okA && okSL && okP;
          let s = (ok ? '<span class="result-ok"><b>PASS</b></span> — ' : '<span class="result-bad"><b>FAIL</b></span> — ') + (H.has(v, 'D') ? H.fmt(v.D) + (SIp(v) ? '-mm' : '-in') + ' screw' + (H.has(v, 'hr') ? ', nut ' + H.fmt(v.hr) + ' in' : '') + ': ' : '') + '\\(T_{u,tot} = ' + TX(v.Tut) + '\\), \\(T_{d,tot} = ' + TX(v.Tdt) + '\\)' + (v.e !== undefined ? ', e = ' + H.fmt(100 * v.e, 3) + ' %' : '') + (v.P !== undefined ? ', ' + H.fmt(v.Pmot) + (SIp(v) ? ' kW' : ' hp') + ' at ' + H.fmt(v.n) + ' rpm' : '') + '.';
          if (!okA) s += ' <span class="result-bad">\\(A_t\\) too small.</span>';
          if (!okSL) s += ' <span class="result-bad">Not self-locking.</span>';
          if (!okP) s += ' <span class="result-bad">Needs more than the available power.</span>';
          return s; } },
    ] },
  ],
};
