// Power screws — Shigley Ch. 8-1 / 8-2 (Fizz §5.1 sizing with Mott Table 17-1; Example 8-1)
// Course alignment (v2/COURSE_CONVENTIONS.md §14): Module 5 reading guide requires Shigley 8-1, 8-2 ("or Mott 17-2"). Course worked numbers:
// HW5 P4 (2023/2024), Selected Tutorial Questions 2022 P2 (Shigley 8-6 press), final-exam review Scenario 3 — see v2/notes/past_exam_m5.md.
// Verified against: Shigley Example 8-1 (the `example`: d 32, p 4, 2 starts, F 6.4 kN, f = fc = 0.08, dc 40 mm) → dm 30, dr 28, l 8 mm,
//   TR 15.94 + Tc 10.24 = 26.18 N·m, TL −0.466 + 10.24 = 9.77 N·m, e 0.311, τ 6.07, σ −10.39, σB −12.9, σx 41.5, τzx −4.04, σ′ 49.2 MPa — reproduced.
// Verified against: HW5 P4 2023 (30 000 lb, σ 10 000, τ 6000, f 0.15, fc 0.06, rc 2 in → dc 4 in, 10 hp) → 2½-3 Acme, h 1.25 in,
//   dm = (D + Dr)/2 = 2.303 in, TR 6994, Tc 3600, TR,tot 10 594, TL,tot 7335, e 0.150, n 59.5 rpm, V 0.330 in/s — reproduced exactly.
// Verified against: Selected Tutorial Questions 2022 P2 (Shigley 8-6: 2 × 2-in Acme, p ¼, 2500 lb/screw, f 0.05, fc 0.08, dc 3.5, 1720/60 rpm,
//   η 0.95) → V 7.17 in/min, TR 221.0, Tc 350, total 571 lb·in/screw, motor 0.547 hp — reproduced.
// Verified against: final-exam review Scenario 3 (square, p 5 mm, dm 22 mm, f 0.15, 2400 N, fc 0) → T 5.93 N·m, e 32.2 % — reproduced.
const ACME = [['1/4', 0.25, 16, 0.1618, 0.2043, 0.02632, 0.3355], ['5/16', 0.3125, 14, 0.2140, 0.2614, 0.04438, 0.4344], ['3/8', 0.375, 12, 0.2632, 0.3161, 0.06589, 0.5276],
  ['7/16', 0.4375, 12, 0.3253, 0.3783, 0.0972, 0.6396], ['1/2', 0.5, 10, 0.3594, 0.4306, 0.1225, 0.7278], ['5/8', 0.625, 8, 0.4570, 0.5408, 0.1955, 0.918],
  ['3/4', 0.75, 6, 0.5371, 0.6424, 0.2732, 1.084], ['7/8', 0.875, 6, 0.6615, 0.7663, 0.4003, 1.313], ['1', 1, 5, 0.7509, 0.8726, 0.5175, 1.493],
  ['1 1/8', 1.125, 5, 0.8753, 0.9967, 0.6881, 1.722], ['1 1/4', 1.25, 5, 0.9998, 1.121, 0.8831, 1.952], ['1 3/8', 1.375, 4, 1.0719, 1.2188, 1.030, 2.110],
  ['1 1/2', 1.5, 4, 1.1965, 1.3429, 1.266, 2.341], ['1 3/4', 1.75, 4, 1.4456, 1.5916, 1.811, 2.803], ['2', 2, 4, 1.6948, 1.8402, 2.454, 3.262],
  ['2 1/4', 2.25, 3, 1.8572, 2.045, 2.982, 3.610], ['2 1/2', 2.5, 3, 2.1065, 2.2939, 3.802, 4.075], ['2 3/4', 2.75, 3, 2.3558, 2.5427, 4.711, 4.538],
  ['3', 3, 2, 2.4326, 2.7044, 5.181, 4.757], ['3 1/2', 3.5, 2, 2.9314, 3.2026, 7.388, 5.700], ['4', 4, 2, 3.4302, 3.7008, 9.985, 6.640],
  ['4 1/2', 4.5, 2, 3.9291, 4.1991, 12.972, 7.577], ['5', 5, 2, 4.4281, 4.6973, 16.351, 8.511]];
const TRAP = [[8, 1.5, 7.25, 6.2, 35.52], [10, 2, 9, 7.5, 53.46], [12, 3, 10.5, 8.5, 70.88], [14, 3, 12.5, 10.5, 103.9], [16, 3, 14.5, 12.5, 143.1], [20, 4, 18, 15.5, 220.4],
  [22, 5, 19.5, 16.5, 254.5], [24, 5, 21.5, 18.5, 314.2], [28, 5, 25.5, 22.5, 452.4], [30, 6, 27, 23, 490.9], [32, 6, 29, 25, 572.6], [36, 6, 33, 29, 754.8],
  [40, 7, 36.5, 32, 921.3], [46, 8, 42, 37, 1225], [50, 8, 46, 41, 1486], [55, 9, 50.5, 45, 1791], [60, 9, 55.5, 50, 2185], [70, 10, 65, 59, 3019],
  [80, 10, 75, 69, 4072], [90, 12, 84, 77, 5090], [100, 12, 94, 87, 6433], [120, 14, 113, 104, 9246], [125, 14, 122, 109, 10477]];
const TB = v => (v.Tbody !== undefined ? v.Tbody : v.TRt);
const SIp = v => v.units === 'SI';
const KP = v => SIp(v) ? 9.549e6 : 63025;
const fracTex = s => s.replace(/^(\d+) (\d+)\/(\d+)$/, '$1\\tfrac{$2}{$3}').replace(/^(\d+)\/(\d+)$/, '\\tfrac{$1}{$2}');
const TX = (x, d) => String(H.fmt(x, d)).replace(/e([+-]?)(\d+)$/, (m, s, e) => '\\times10^{' + (s === '-' ? '-' : '') + e + '}');
const inUse = b => b ? ' ✔' : '';
function acmeTable(v) {
  if (!H.has(v, 'Atreq')) return '';
  const hreq = r => H.has(v, 'Asreq') && r.As ? Math.ceil(v.Asreq / r.As * 4 - 1e-9) / 4 : undefined;
  if (SIp(v)) {
    const rows = TRAP.map(r => ({ D: r[0], p: r[1], Dp: r[2], Dr: r[3], At: r[4] }));
    const k = rows.findIndex(r => r.At >= v.Atreq - 1e-9); if (k < 0) return '<span class="result-bad">Larger than Mott Table 17-1M.</span>';
    return H.table(['\\(d\\) (mm)', '\\(p\\)', '\\(d_r\\)', '\\(A_t\\) (mm\\(^2\\))', '\\(A_t \\ge A_{t,req}\\)?'],
      rows.slice(Math.max(0, k - 2), k + 4).map(r => ({ cells: ['Tr' + r.D + '×' + r.p + inUse(v.d === r.D), r.p, r.Dr, r.At, r.At >= v.Atreq ? 'yes' : 'no'], ok: r.At >= v.Atreq, pick: r === rows[k],
        set: { d: r.D, p: r.p, dr: r.Dr, dm: '', Atsel: r.At, Asr: '' } })),
      { caption: 'Select the screw — Mott Table 17-1M, \\(A_{t,req} = ' + TX(v.Atreq) + '\\) mm\\(^2\\)', note: 'Rule (Fizz step 2): first row with \\(A_t \\ge A_{t,req}\\). Use fills \\(d\\), \\(p\\), \\(d_r\\); \\(d_m = (d + d_r)/2\\).' });
  }
  const rows = ACME.map(r => ({ lab: r[0], D: r[1], n: r[2], Dr: r[3], Dp: r[4], At: r[5], As: r[6] }));
  const k = rows.findIndex(r => r.At >= v.Atreq - 1e-9); if (k < 0) return '<span class="result-bad">Larger than Mott Table 17-1 — use several screws.</span>';
  return H.table(['\\(d\\) (in)', '\\(n\\)', '\\(d_r\\)', '\\(A_t\\) (in\\(^2\\))', '\\(A_s\\) (in\\(^2\\)/in)', '\\(A_t \\ge A_{t,req}\\)?', H.has(v, 'Asreq') ? 'nut \\(h\\) (¼ in)' : 'nut'],
    rows.slice(Math.max(0, k - 2), k + 4).map(r => ({ cells: ['\\(' + fracTex(r.lab) + '\\)-' + r.n + inUse(v.d === r.D), r.n, r.Dr, r.At, r.As, r.At >= v.Atreq ? 'yes' : 'no', hreq(r) !== undefined ? H.fmt(hreq(r)) + ' in' : '—'],
      ok: r.At >= v.Atreq, pick: r === rows[k], set: { d: r.D, p: Number((1 / r.n).toFixed(5)), dr: r.Dr, dm: '', Atsel: r.At, Asr: r.As } })),
    { caption: 'Select the screw — Mott Table 17-1 (Shigley has no Acme size table), \\(A_{t,req} = ' + TX(v.Atreq) + '\\) in\\(^2\\)', note: 'Rule (Fizz step 2, HW5 P4): first row with \\(A_t \\ge A_{t,req}\\). Use fills \\(d\\), \\(p = 1/n\\), \\(d_r\\), \\(A_t\\), \\(A_s\\); \\(d_m = (d + d_r)/2\\) as in HW5 P4.' });
}

window.TOPIC = {
  id: 'power_screws', book: 'shigley',
  title: 'Power Screws — Torque, Efficiency & Stresses',
  subtitle: 'Shigley Ch. 8-1/8-2 · Fizz guide §5.1 procedure (Example 8-1, HW5 P4)',
  sibling: 'power_screws_mott.html',
  intro: 'Size the screw and nut (Fizz steps 1–3 with Mott\'s Acme table), then raising/lowering torque, self-locking, efficiency, speed/power and the thread-root stresses (Eqs. 8-1 … 8-12). '
    + 'One consistent unit set: lbf-in-psi or N-mm-MPa. Skip the sizing inputs if the screw is given.',
  example: { F: 6400, thread: 0, d: 32, p: 4, ns: 2, f: 0.08, fc: 0.08, dc: 40, nt: 1, share: 0.38, units: 'SI' },

  assumptions: [
    { text: 'Screw = first Acme-table row (Mott Table 17-1 / 17-1M) with \\(A_t \\ge F/\\sigma_d\\)', src: 'Fizz p.123 · Fizz p.125', step: 'size' },
    { text: 'Nut length rounded up to the nearest ¼ in', src: 'Fizz p.126', var: 'hr' },
    { text: 'Thread angle: Acme \\(\\alpha = 14.5^\\circ\\) (\\(2\\alpha = 29^\\circ\\)); square 0°, trapezoidal 15°', src: 'Fizz p.126', var: 'thread' },
    { text: 'Single-start thread: lead l = p', src: 'Fizz pp.126–127', var: 'ns' },
    { text: 'Mean diameter \\(d_m = (d + d_r)/2\\) (= \\(d - p/2\\) for a square thread; HW5 P4 uses it for the Acme row)', src: 'HW5 P4 · Shigley Fig. 8-3', var: 'dm' },
    { text: '\\(f_c = 0\\) when the collar runs on a rolling thrust bearing', src: 'Fizz p.126', var: 'fc' },
    { text: 'Efficiency and speed use the total raising torque (thread + collar)', src: 'Fizz p.127 · Shigley Ex. 8-1', var: 'e' },
    { text: 'Power \\(P = Tn/63\\,025\\) (hp, lbf·in) — course HW5 / Shigley 8-6; Fizz rounds to 63 000', src: 'HW5 P4', step: 'spd' },
    { text: 'Thread-root stresses: the first engaged thread carries 0.38F (\\(n_t = 1\\))', src: 'Shigley §8-2', var: 'share' },
  ],

  figures: [
    { id: 'fig8-1', ref: 'Figure 8-1', title: 'Screw-thread terminology: major / pitch / minor diameter, pitch, thread angle \\(2\\alpha\\)', src: 'figures/shigley/fig8-1.png', page: 443 },
    { id: 'fig8-3', ref: 'Figure 8-3', title: 'Square and Acme thread profiles', src: 'figures/shigley/fig8-3.png', page: 446, note: 'Square: depth = width = p/2, \\(d_m = d - p/2\\), \\(d_r = d - p\\). Acme: \\(2\\alpha = 29^\\circ\\).' },
    { id: 'table8-3', ref: 'Table 8-3', title: 'Preferred pitches for Acme threads', src: 'figures/shigley/table8-3.png', page: 447 },
    { id: 'table17-1', ref: 'Table 17-1', title: 'Preferred Acme threads — D, n, p, \\(D_r\\), \\(D_p\\), \\(A_t\\), \\(A_s\\) per inch of nut', src: 'figures/mott/table17-1.png', page: 662, book: 'mott',
      note: 'First row with \\(A_t \\ge\\) required; \\(A_s\\) for the nut length.' },
    { id: 'table17-1m', ref: 'Table 17-1M', title: 'Metric trapezoidal screws (ISO): D, p, \\(D_p\\), \\(D_r\\), \\(A_t\\)', src: 'figures/mott/table17-1m.png', page: 663, book: 'mott' },
    { id: 'fig8-5', ref: 'Figure 8-5 / 8-6', title: 'Power screw; unrolled-thread force diagrams for lifting (a) and lowering (b)', src: 'figures/shigley/fig8-5-6.png', page: 448 },
    { id: 'fizz-anatomy', ref: 'Fizz p.123 anatomy', title: 'Power screw anatomy — \\(d_m\\), p, \\(\\lambda\\), \\(\\psi\\), nut reactions', src: 'figures/bibles/fizz_p123_power_screw_anatomy.png', book: 'fizz' },
    { id: 'fig8-7', ref: 'Figure 8-7', title: '(a) Normal thread force increased by \\(\\alpha\\); (b) thrust collar of diameter \\(d_c\\)', src: 'figures/shigley/fig8-7.png', page: 450 },
    { id: 'table8-5', ref: 'Table 8-5', title: 'Coefficients of friction f for threaded pairs', src: 'figures/shigley/table8-5.png', page: 454, note: 'Power screws: f ≈ 0.10–0.15.' },
    { id: 'table8-6', ref: 'Table 8-6', title: 'Thrust-collar friction coefficients (running / starting)', src: 'figures/shigley/table8-6.png', page: 454, note: 'Rolling thrust bearing: \\(f_c = 0\\).' },
    { id: 'table8-4', ref: 'Table 8-4', title: 'Safe screw bearing pressure \\(p_b\\)', src: 'figures/shigley/table8-4.png', page: 454 },
    { id: 'fig8-8', ref: 'Figure 8-8', title: 'Thread-root geometry for bending/transverse shear; 3-D stress element', src: 'figures/shigley/fig8-8.png', page: 451 },
  ],

  sections: [
    { title: 'Inputs & screw selection (Fizz steps 1–3)', steps: [
      { id: 'in', title: 'Load, thread form and allowable stresses', fig: ['fig8-3', 'table8-5', 'table8-6'],
        text: 'Enter the axial load per screw; the allowable stresses are only for sizing. Acme\'s sloped 29° flanks let a split nut take up wear/backlash; a square thread cannot.',
        vars: [
          { id: 'F', symbol: 'F', label: 'Axial load on the screw', unit: 'lbf or N', kind: 'input' },
          { id: 'thread', symbol: '2\\alpha', label: 'Thread form', kind: 'choice', options: [{ label: 'Square (\\(\\alpha = 0^\\circ\\))', value: 0 }, { label: 'Acme (\\(\\alpha = 14.5^\\circ\\))', value: 14.5 }, { label: 'Metric trapezoidal (\\(\\alpha = 15^\\circ\\))', value: 15 }], default: 14.5 },
          { id: 'f', symbol: 'f', label: 'Thread friction coefficient', kind: 'lookup', fig: 'table8-5', hint: 'Table 8-5; typically 0.10–0.15', check: v => (v.f !== undefined && (v.f < 0.02 || v.f > 0.4)) ? 'f is usually 0.04–0.25' : null },
          { id: 'sigd', symbol: '\\sigma_d', label: 'Allowable tensile stress (sizing)', unit: 'psi or MPa', kind: 'input', hint: 'optional' },
          { id: 'taud', symbol: '\\tau_d', label: 'Allowable thread shear stress (nut)', unit: 'psi or MPa', kind: 'input', hint: 'optional' },
        ] },
      { id: 'size', title: 'Required tensile-stress area → screw', fig: ['table17-1', 'table17-1m', 'table8-3'],
        formula: 'A_{t,req} = \\frac{F}{\\sigma_d}',
        text: 'Pick the first Acme row with \\(A_t \\ge A_{t,req}\\) — the live table below does it; Use fills d, p, \\(d_r\\), \\(A_t\\), \\(A_s\\).',
        vars: [
          { id: 'Atreq', symbol: 'A_{t,req}', label: 'Required tensile-stress area', unit: 'in^2 or mm^2', kind: 'calc', compute: v => H.has(v, 'F', 'sigd') ? v.F / v.sigd : undefined,
            work: v => H.has(v, 'F', 'sigd') ? '\\(A_{t,req} = ' + TX(v.F) + '/' + TX(v.sigd) + ' = ' + TX(v.F / v.sigd) + '\\)' : null },
          { id: 'Atsel', symbol: 'A_t', label: 'Tensile-stress area of the screw', unit: 'in^2 or mm^2', kind: 'lookup', fig: 'table17-1', hint: 'from the selected row',
            check: v => (H.has(v, 'Atsel', 'Atreq') && v.Atsel < v.Atreq) ? '\\(A_t < A_{t,req}\\) — take a bigger screw' : null },
          { id: 'Asr', symbol: 'A_s', label: 'Thread shear area per inch of nut', unit: 'in^2/in', kind: 'lookup', fig: 'table17-1', hint: 'last column of Table 17-1' },
        ],
        after: v => acmeTable(v) },
      { id: 'nut', title: 'Nut length from thread shear (Fizz step 3)', fig: ['table17-1'],
        formula: 'A_{s,req} = \\frac{F}{\\tau_d} \\qquad h = A_{s,req}\\,\\frac{1\\,\\text{in}}{A_s}',
        text: 'Round h <b>up</b> to the nearest ¼ in.',
        vars: [
          { id: 'Asreq', symbol: 'A_{s,req}', label: 'Required shear area', unit: 'in^2', kind: 'calc', compute: v => H.has(v, 'F', 'taud') ? v.F / v.taud : undefined },
          { id: 'h', symbol: 'h', label: 'Required nut length', unit: 'in', kind: 'calc', compute: v => H.has(v, 'Asreq', 'Asr') ? v.Asreq / v.Asr : undefined,
            work: v => H.has(v, 'Asreq', 'Asr') ? '\\(h = ' + TX(v.Asreq) + '/' + TX(v.Asr) + ' = ' + TX(v.Asreq / v.Asr) + '\\ \\text{in}\\)' : null },
          { id: 'hr', symbol: 'h_{use}', label: 'Nut length, rounded up to ¼ in', unit: 'in', kind: 'calc', compute: v => H.has(v, 'h') ? Math.ceil(v.h * 4 - 1e-9) / 4 : undefined },
        ],
        when: v => H.has(v, 'taud') },
    ] },

    { title: 'Thread geometry', steps: [
      { id: 'geo', title: 'Diameters, lead and lead angle', fig: ['fig8-1', 'fig8-3', 'fig8-5', 'fizz-anatomy'], eq: '8-1 defs',
        formula: 'd_r = d - p \\;(\\text{square}) \\qquad d_m = \\frac{d + d_r}{2} \\qquad l = n_s\\,p \\qquad \\tan\\lambda = \\frac{l}{\\pi d_m}',
        text: 'For a table screw enter its \\(d_r\\); \\(d_m\\) follows. Fizz uses the table pitch diameter \\(D_p\\) instead (≈ 0.3 % lower torque).',
        vars: [
          { id: 'd', symbol: 'd', label: 'Major (nominal) diameter', unit: 'in or mm', kind: 'input' },
          { id: 'p', symbol: 'p', label: 'Pitch', unit: 'in or mm', kind: 'input', hint: 'p = 1/n for n threads per inch' },
          { id: 'ns', symbol: 'n_s', label: 'Number of thread starts', kind: 'input', default: 1, hint: '1 = single, 2 = double …' },
          { id: 'dr', symbol: 'd_r', label: 'Minor (root) diameter', unit: 'in or mm', kind: 'lookup', fig: 'table17-1', hint: 'auto = d − p; or \\(D_r\\) from Table 17-1', auto: v => H.has(v, 'd', 'p') ? v.d - v.p : undefined },
          { id: 'dm', symbol: 'd_m', label: 'Mean diameter', unit: 'in or mm', kind: 'lookup', fig: 'table17-1', hint: 'auto = (d + \\(d_r\\))/2', auto: v => H.has(v, 'd', 'dr') ? (v.d + v.dr) / 2 : undefined },
          { id: 'l', symbol: 'l', label: 'Lead', unit: 'in or mm', kind: 'calc', compute: v => H.has(v, 'p', 'ns') ? v.p * v.ns : undefined },
          { id: 'lam', symbol: '\\lambda', label: 'Lead angle', unit: '°', kind: 'calc', digits: 4, compute: v => H.has(v, 'l', 'dm') ? H.deg(Math.atan(v.l / (Math.PI * v.dm))) : undefined,
            work: v => H.has(v, 'l', 'dm') ? '\\(\\lambda = \\tan^{-1}\\!\\left(\\dfrac{' + TX(v.l) + '}{\\pi\\,' + TX(v.dm) + '}\\right) = ' + TX(v.lam) + '^\\circ\\)' : null },
        ] },
    ] },

    { title: 'Torque, self-locking, efficiency', steps: [
      { id: 'tq', title: 'Raising and lowering torque (thread only)', eq: '8-1, 8-2, 8-5', fig: ['fig8-5', 'fig8-7'],
        formula: 'T_R = \\frac{F d_m}{2}\\left(\\frac{l + \\pi f d_m \\sec\\alpha}{\\pi d_m - f l \\sec\\alpha}\\right) \\qquad T_L = \\frac{F d_m}{2}\\left(\\frac{\\pi f d_m \\sec\\alpha - l}{\\pi d_m + f l \\sec\\alpha}\\right)',
        text: 'Eq. 8-5; with \\(\\alpha = 0\\) it is Eqs. 8-1 / 8-2 (square thread).',
        vars: [
          { id: 'TR', symbol: 'T_R', label: 'Thread torque to raise', unit: 'lbf·in or N·mm', kind: 'calc', compute: v => {
              if (!H.has(v, 'F', 'dm', 'l', 'f', 'thread')) return undefined; const s = 1 / Math.cos(H.rad(v.thread));
              return v.F * v.dm / 2 * (v.l + Math.PI * v.f * v.dm * s) / (Math.PI * v.dm - v.f * v.l * s); },
            work: v => { if (!H.has(v, 'TR')) return null; const s = 1 / Math.cos(H.rad(v.thread));
              return '\\(T_R = \\dfrac{' + TX(v.F) + '(' + TX(v.dm) + ')}{2}\\left[\\dfrac{' + TX(v.l) + ' + \\pi(' + TX(v.f) + ')(' + TX(v.dm) + ')(' + TX(s) + ')}{\\pi(' + TX(v.dm) + ') - ' + TX(v.f) + '(' + TX(v.l) + ')(' + TX(s) + ')}\\right] = ' + TX(v.TR) + '\\)'; } },
          { id: 'TL', symbol: 'T_L', label: 'Thread torque to lower', unit: 'lbf·in or N·mm', kind: 'calc', compute: v => {
              if (!H.has(v, 'F', 'dm', 'l', 'f', 'thread')) return undefined; const s = 1 / Math.cos(H.rad(v.thread));
              return v.F * v.dm / 2 * (Math.PI * v.f * v.dm * s - v.l) / (Math.PI * v.dm + v.f * v.l * s); } },
        ],
        after: v => v.TL === undefined ? '' : (v.TL > 0 ? '<span class="result-ok">\\(T_L > 0\\) → self-locking: the load cannot back-drive the screw.</span>' : '<span class="result-bad">\\(T_L \\le 0\\) → NOT self-locking: the load back-drives the screw unless a brake or collar friction holds it.</span>') },
      { id: 'sl', title: 'Self-locking condition', eq: '8-3', formula: '\\pi f d_m > l \\iff f > \\tan\\lambda \\;(\\text{square}) \\qquad f\\sec\\alpha > \\tan\\lambda \\;(\\text{Acme})',
        vars: [
          { id: 'tanlam', symbol: '\\tan\\lambda', label: '\\(\\tan\\lambda\\)', kind: 'calc', compute: v => H.has(v, 'l', 'dm') ? v.l / (Math.PI * v.dm) : undefined },
          { id: 'feff', symbol: 'f\\sec\\alpha', label: 'Effective friction', kind: 'calc', compute: v => H.has(v, 'f', 'thread') ? v.f / Math.cos(H.rad(v.thread)) : undefined },
        ],
        after: v => H.has(v, 'tanlam', 'feff') ? (v.feff > v.tanlam ? '<span class="result-ok">Self-locking (\\(f\\sec\\alpha = ' + TX(v.feff, 3) + ' > \\tan\\lambda = ' + TX(v.tanlam, 3) + '\\)).</span>' : '<span class="result-bad">Not self-locking (\\(f\\sec\\alpha = ' + TX(v.feff, 3) + ' \\le \\tan\\lambda = ' + TX(v.tanlam, 3) + '\\)).</span>') : '' },
      { id: 'collar', title: 'Collar (thrust-bearing) friction torque', eq: '8-6', fig: ['fig8-7', 'table8-6'],
        formula: 'T_c = \\frac{F f_c d_c}{2} \\qquad T_{R,tot} = T_R + T_c \\qquad T_{L,tot} = T_L + T_c',
        text: 'Collar friction adds to both raising and lowering torque. A collar radius \\(r_c\\) gives \\(d_c = 2r_c\\).',
        vars: [
          { id: 'fc', symbol: 'f_c', label: 'Collar friction coefficient', kind: 'lookup', fig: 'table8-6', default: 0, hint: '0 for a rolling thrust bearing' },
          { id: 'dc', symbol: 'd_c', label: 'Mean collar diameter', unit: 'in or mm', kind: 'input', hint: 'HW5 P4: \\(r_c\\) = 2 in → 4 in' },
          { id: 'Tc', symbol: 'T_c', label: 'Collar torque', unit: 'lbf·in or N·mm', kind: 'calc', compute: v => H.has(v, 'F', 'fc') ? (v.fc === 0 ? 0 : (H.has(v, 'dc') ? v.F * v.fc * v.dc / 2 : undefined)) : undefined,
            work: v => (H.has(v, 'F', 'fc', 'dc') && v.fc !== 0) ? '\\(T_c = ' + TX(v.F) + '(' + TX(v.fc) + ')(' + TX(v.dc) + ')/2 = ' + TX(v.Tc) + '\\)' : null },
          { id: 'TRt', symbol: 'T_{R,tot}', label: 'Total torque to raise', unit: 'lbf·in or N·mm', kind: 'calc', compute: v => H.has(v, 'TR', 'Tc') ? v.TR + v.Tc : undefined },
          { id: 'TLt', symbol: 'T_{L,tot}', label: 'Total torque to lower', unit: 'lbf·in or N·mm', kind: 'calc', compute: v => H.has(v, 'TL', 'Tc') ? v.TL + v.Tc : undefined },
        ] },
      { id: 'eff', title: 'Efficiency', eq: '8-4', formula: 'e = \\frac{T_0}{T_{R,tot}} = \\frac{F l}{2\\pi T_{R,tot}}',
        text: '\\(T_0 = Fl/2\\pi\\) is the torque with f = 0 (derived by setting f = 0 in \\(T_R\\)).',
        vars: [
          { id: 'e', symbol: 'e', label: 'Overall efficiency (incl. collar)', kind: 'calc', digits: 3, compute: v => H.has(v, 'F', 'l', 'TRt') && v.TRt > 0 ? v.F * v.l / (2 * Math.PI * v.TRt) : undefined,
            work: v => H.has(v, 'e') ? '\\(e = \\dfrac{' + TX(v.F) + '(' + TX(v.l) + ')}{2\\pi(' + TX(v.TRt) + ')} = ' + TX(v.e, 3) + '\\)' : null },
          { id: 'eth', symbol: 'e_{thread}', label: 'Thread-only efficiency', kind: 'calc', digits: 3, compute: v => H.has(v, 'F', 'l', 'TR') && v.TR > 0 ? v.F * v.l / (2 * Math.PI * v.TR) : undefined },
        ] },
      { id: 'spd', title: 'Speed and power', formula: 'n = \\frac{60V}{l} \\;\\text{or}\\; n = \\frac{63\\,025\\,P}{T_{R,tot}} \\qquad P = \\frac{T_{R,tot}\\,n}{63\\,025} \\qquad V = \\frac{n\\,l}{60} \\qquad P_{motor} = \\frac{N P}{\\eta}',
        text: 'Fill one of V, P or n. Several screws or a gearbox (Shigley 8-6): motor power = N P/η. SI: \\(P_{kW} = T_{N\\cdot mm}\\,n/9.549\\times10^{6}\\).',
        vars: [
          { id: 'units', label: 'Unit system', kind: 'choice', type: 'text', options: [{ label: 'US: hp, lbf·in, in/s', value: 'US' }, { label: 'SI: kW, N·mm, mm/s', value: 'SI' }], default: 'US' },
          { id: 'Vreq', symbol: 'V_{req}', label: 'Required linear speed (if given)', unit: 'in/s or mm/s', kind: 'input' },
          { id: 'P', symbol: 'P_{in}', label: 'Available input power (if given)', unit: 'hp or kW', kind: 'input' },
          { id: 'nin', symbol: 'n_{given}', label: 'Screw speed (if given)', unit: 'rpm', kind: 'input', hint: 'Shigley 8-6: 1720/60 = 28.67' },
          { id: 'n', symbol: 'n', label: 'Screw speed', unit: 'rpm', kind: 'calc', compute: v => {
              if (H.has(v, 'nin')) return v.nin;
              if (H.has(v, 'Vreq', 'l') && v.l > 0) return 60 * v.Vreq / v.l;
              return H.has(v, 'P', 'TRt') && v.TRt > 0 ? KP(v) * v.P / v.TRt : undefined; },
            work: v => (!H.has(v, 'nin') && !H.has(v, 'Vreq') && H.has(v, 'n', 'P')) ? '\\(n = \\dfrac{' + TX(KP(v)) + '(' + TX(v.P) + ')}{' + TX(v.TRt) + '} = ' + TX(v.n) + '\\ \\text{rpm}\\)' : null },
          { id: 'V', symbol: 'V', label: 'Linear speed of the load', unit: 'in/s or mm/s', kind: 'calc', compute: v => H.has(v, 'n', 'l') ? v.n * v.l / 60 : undefined,
            work: v => H.has(v, 'V') ? '\\(V = \\dfrac{' + TX(v.n) + '(' + TX(v.l) + ')}{60} = ' + TX(v.V) + (SIp(v) ? '\\ \\text{mm/s}' : '\\ \\text{in/s} = ' + TX(60 * v.V) + '\\ \\text{in/min}') + '\\)' : null },
          { id: 'Pscr', symbol: 'P_{screw}', label: 'Power per screw', unit: 'hp or kW', kind: 'calc', digits: 4, compute: v => H.has(v, 'TRt', 'n') ? v.TRt * v.n / KP(v) : undefined,
            work: v => H.has(v, 'Pscr') ? '\\(P = \\dfrac{' + TX(v.TRt) + '(' + TX(v.n) + ')}{' + TX(KP(v)) + '} = ' + TX(v.Pscr) + '\\)' : null },
          { id: 'Nscr', symbol: 'N', label: 'Number of screws driven', kind: 'input', default: 1 },
          { id: 'etad', symbol: '\\eta', label: 'Drive (gear) efficiency', kind: 'input', default: 1 },
          { id: 'Pmot', symbol: 'P_{motor}', label: 'Motor power', unit: 'hp or kW', kind: 'calc', digits: 4, compute: v => H.has(v, 'Pscr', 'Nscr', 'etad') && v.etad > 0 ? v.Nscr * v.Pscr / v.etad : undefined,
            work: v => H.has(v, 'Pmot') && (v.Nscr !== 1 || v.etad !== 1) ? '\\(P_{motor} = \\dfrac{' + TX(v.Nscr) + '(' + TX(v.Pscr) + ')}{' + TX(v.etad) + '} = ' + TX(v.Pmot) + '\\)' : null },
        ] },
    ] },

    { title: 'Stresses at the thread root (Shigley 8-2)', text: 'Load sharing is unequal: first thread ≈ 0.38F, second 0.25F, third 0.18F … the seventh carries almost nothing. Worst case: s = 0.38 with \\(n_t = 1\\).', steps: [
      { id: 'body', title: 'Body stresses: torsion and axial', eq: '8-7, 8-8', formula: '\\tau = \\frac{16 T}{\\pi d_r^3} \\qquad \\sigma = -\\frac{4F}{\\pi d_r^2}',
        text: 'T = torque in the screw body: \\(T_{R,tot}\\) if the collar is on the screw (Example 8-1), else \\(T_R\\).',
        vars: [
          { id: 'Tbody', symbol: 'T', label: 'Torque in the screw body', unit: 'lbf·in or N·mm', kind: 'input', hint: 'blank = \\(T_{R,tot}\\)' },
          { id: 'tau', symbol: '\\tau_{yz}', label: 'Torsional shear stress', unit: 'psi or MPa', kind: 'calc', compute: v => (TB(v) !== undefined && H.has(v, 'dr')) ? 16 * TB(v) / (Math.PI * Math.pow(v.dr, 3)) : undefined,
            work: v => H.has(v, 'tau') ? '\\(\\tau = \\dfrac{16(' + TX(TB(v)) + ')}{\\pi(' + TX(v.dr) + ')^3} = ' + TX(v.tau) + '\\)' : null },
          { id: 'sig', symbol: '\\sigma_y', label: 'Axial (compressive) stress', unit: 'psi or MPa', kind: 'calc', compute: v => H.has(v, 'F', 'dr') ? -4 * v.F / (Math.PI * v.dr * v.dr) : undefined,
            work: v => H.has(v, 'sig') ? '\\(\\sigma = -\\dfrac{4(' + TX(v.F) + ')}{\\pi(' + TX(v.dr) + ')^2} = ' + TX(v.sig) + '\\)' : null },
        ] },
      { id: 'thr', title: 'Thread stresses: bearing, bending, transverse shear', eq: '8-10, 8-11, 8-12', fig: ['fig8-8', 'table8-4'],
        formula: '\\sigma_B = -\\frac{2 F_1}{\\pi d_m n_t p} \\qquad \\sigma_x = \\frac{6 F_1}{\\pi d_r n_t p} \\qquad \\tau_{zx} = -\\frac{4 T_1}{\\pi d_r^2 n_t p} \\qquad F_1 = sF,\\; T_1 = sT',
        vars: [
          { id: 'share', symbol: 's', label: 'Load share on the analysed thread', kind: 'choice', options: [{ label: '0.38 — first engaged thread', value: 0.38 }, { label: '1.0 — equal sharing over \\(n_t\\) threads', value: 1 }], default: 0.38 },
          { id: 'nt', symbol: 'n_t', label: 'Engaged threads considered', kind: 'input', default: 1 },
          { id: 'sigB', symbol: '\\sigma_B', label: 'Bearing stress on the thread', unit: 'psi or MPa', kind: 'calc', compute: v => H.has(v, 'F', 'dm', 'nt', 'p', 'share') ? -2 * v.share * v.F / (Math.PI * v.dm * v.nt * v.p) : undefined,
            work: v => H.has(v, 'sigB') ? '\\(\\sigma_B = -\\dfrac{2(' + TX(v.share) + ')(' + TX(v.F) + ')}{\\pi(' + TX(v.dm) + ')(' + TX(v.nt) + ')(' + TX(v.p) + ')} = ' + TX(v.sigB) + '\\)' : null },
          { id: 'pb', symbol: 'p_b', label: 'Safe bearing pressure', unit: 'psi or MPa', kind: 'lookup', fig: 'table8-4', hint: 'Table 8-4 (psi; ÷145 for MPa)' },
          { id: 'sigx', symbol: '\\sigma_x', label: 'Thread-root bending stress', unit: 'psi or MPa', kind: 'calc', compute: v => H.has(v, 'F', 'dr', 'nt', 'p', 'share') ? 6 * v.share * v.F / (Math.PI * v.dr * v.nt * v.p) : undefined,
            work: v => H.has(v, 'sigx') ? '\\(\\sigma_x = \\dfrac{6(' + TX(v.share) + ')(' + TX(v.F) + ')}{\\pi(' + TX(v.dr) + ')(' + TX(v.nt) + ')(' + TX(v.p) + ')} = ' + TX(v.sigx) + '\\)' : null },
          { id: 'tzx', symbol: '\\tau_{zx}', label: 'Transverse shear at the root', unit: 'psi or MPa', kind: 'calc', compute: v => (TB(v) !== undefined && H.has(v, 'dr', 'nt', 'p', 'share')) ? -4 * v.share * TB(v) / (Math.PI * v.dr * v.dr * v.nt * v.p) : undefined },
        ],
        after: v => H.has(v, 'sigB', 'pb') ? (Math.abs(v.sigB) <= v.pb ? '<span class="result-ok">\\(|\\sigma_B| = ' + TX(Math.abs(v.sigB)) + ' \\le p_b = ' + TX(v.pb) + '\\) — bearing OK.</span>' : '<span class="result-bad">\\(|\\sigma_B| = ' + TX(Math.abs(v.sigB)) + ' > p_b = ' + TX(v.pb) + '\\) — thread wear: longer nut / larger screw.</span>') : '' },
      { id: 'vm', title: 'Von Mises stress and static factor of safety', eq: '5-14', fig: ['fig8-8'],
        formula: "\\sigma' = \\tfrac{1}{\\sqrt 2}\\left[(\\sigma_x-\\sigma_y)^2 + \\sigma_y^2 + \\sigma_x^2 + 6\\tau_{yz}^2 + 6\\tau_{zx}^2\\right]^{1/2} \\qquad n = \\frac{S_y}{\\sigma'}",
        text: 'Element at the root of the first thread (\\(\\sigma_z = 0\\), \\(\\tau_{xy} = 0\\)).',
        vars: [
          { id: 'svm', symbol: "\\sigma'", label: 'Von Mises stress', unit: 'psi or MPa', kind: 'calc', compute: v => H.has(v, 'sigx', 'sig', 'tau', 'tzx') ? Math.sqrt(0.5 * (Math.pow(v.sigx - v.sig, 2) + v.sig * v.sig + v.sigx * v.sigx + 6 * v.tau * v.tau + 6 * v.tzx * v.tzx)) : undefined,
            work: v => H.has(v, 'svm') ? "\\(\\sigma' = \\tfrac{1}{\\sqrt2}\\{[" + TX(v.sigx) + ' - (' + TX(v.sig) + ')]^2 + (' + TX(v.sig) + ')^2 + (' + TX(v.sigx) + ')^2 + 6(' + TX(v.tau) + ')^2 + 6(' + TX(v.tzx) + ')^2\\}^{1/2} = ' + TX(v.svm) + '\\)' : null },
          { id: 'Sy', symbol: 'S_y', label: 'Screw yield strength', unit: 'psi or MPa', kind: 'input', hint: 'Table A-20' },
          { id: 'nfs', symbol: 'n', label: 'Static factor of safety', kind: 'calc', digits: 3, compute: v => H.has(v, 'Sy', 'svm') && v.svm > 0 ? v.Sy / v.svm : undefined },
        ],
        after: v => v.nfs === undefined ? (v.svm !== undefined ? '<span>Enter \\(S_y\\) for the factor of safety.</span>' : '') : (v.nfs >= 1 ? '<span class="result-ok">PASS — n = ' + H.fmt(v.nfs, 3) + ' against yield at the thread root.</span>' : '<span class="result-bad">FAIL — n = ' + H.fmt(v.nfs, 3) + ' &lt; 1: larger \\(d_r\\), pitch or stronger steel.</span>') },
    ] },
  ],
};
