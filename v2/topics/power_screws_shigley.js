// Power screws — Shigley Ch. 8-1 / 8-2 (Fizz §5.1 sizing procedure from Mott Table 17-1; Example 8-1)
// Course alignment (v2/COURSE_CONVENTIONS.md §14): the Module 5 reading guide requires Shigley 8-1, 8-2 (power-screw torque, efficiency,
// body and thread stresses) "or Mott 17-2". No course worked numbers exist, so textbook defaults apply (f ≈ 0.10–0.15, fc = 0 for a rolling
// thrust bearing, first-thread load share 0.38 F). The `example` is Shigley Example 8-1 (32 × 4 mm double-start square thread, 6.4 kN).
// Guide assumptions (Fizz pp.123–127; the Mech guide has no power-screw unit) are listed in `assumptions` and carried by the field defaults.
// Verified against: Shigley Example 8-1 (d 32, p 4, 2 starts, F 6.4 kN, f = fc = 0.08, dc 40 mm) → dm 30, dr 28, l 8 mm, TR 15.94 + Tc 10.24
//   = 26.18 N·m, TL −0.466 + 10.24 = 9.77 N·m, e 0.311, τ 6.07, σ −10.39, σB −12.9, σx 41.5, τzx −4.04, σ′ 49.2 MPa — reproduced.
const TB = v => (v.Tbody !== undefined ? v.Tbody : v.TRt);
window.TOPIC = {
  id: 'power_screws', book: 'shigley',
  title: 'Power Screws — Torque, Efficiency & Stresses',
  subtitle: 'Shigley Ch. 8-1/8-2 · Fizz guide §5.1 procedure',
  sibling: 'power_screws_mott.html',
  intro: 'Sizes a power screw (square / Acme / trapezoidal) and then finds the raising &amp; lowering torque, collar torque, self-locking, efficiency, speed/power and the Shigley thread-root stresses (Eqs. 8-1 … 8-12). '
    + 'Steps 1–3 are the Fizz guide sizing procedure (pick a screw from the Acme table so that \\(A_t\\) is enough, then the nut length from the shear area). '
    + 'Work in <b>one consistent unit system</b>: lbf-in-psi <i>or</i> N-mm-MPa. Torques come out in lbf·in or N·mm. Leave the sizing inputs blank if the screw is already specified. <b>Course note:</b> MECH 325 provides only the Module 5 reading guide (Shigley 8-1, 8-2 or Mott 17-2) and no worked numbers for power screws, so the textbook defaults apply unchanged.',
  example: { F: 6400, thread: 0, d: 32, p: 4, ns: 2, f: 0.08, fc: 0.08, dc: 40, nt: 1, share: 0.38, units: 'SI' },

  assumptions: [
    { text: 'Allowable σ_d (screw) and τ_d (nut threads) come from the problem; the screw is the first Acme-table row (Mott Table 17-1 / 17-1M) with A_t ≥ F/σ_d', src: 'Fizz p.123 · Fizz p.125' },
    { text: 'Nut / yoke length rounded up to the nearest ¼ in (1.10 → 1.25, 1.58 → 1.75)', src: 'Fizz p.126', var: 'hr' },
    { text: 'Thread angle: Acme α = 14.5° (2α = 29°) unless the screw is square (0°) or metric trapezoidal (15°)', src: 'Fizz p.126', var: 'thread' },
    { text: 'Single-start thread unless stated, so lead l = pitch p (Fizz writes p in λ, e and V)', src: 'Fizz pp.126–127', var: 'ns' },
    { text: 'Collar friction f_c = 0 when the collar runs on a roller / ball thrust bearing, unless stated otherwise', src: 'Fizz p.126', var: 'fc' },
    { text: 'Efficiency and speed use the total raising torque (thread + collar): e = Fl/(2πT_R), n = 63 000 P/T_R (hp, lbf·in) — as in Shigley Ex. 8-1', src: 'Fizz p.127', var: 'e' },
    { text: 'Thread-root stresses: the first engaged thread carries 0.38 F (n_t = 1) — Shigley 8-2; the guides do not cover thread stresses', src: 'Shigley §8-2', var: 'share' },
  ],

  figures: [
    { id: 'fig8-1', ref: 'Figure 8-1', title: 'Screw-thread terminology (major / pitch / minor diameter, pitch, thread angle 2α)', src: 'figures/shigley/fig8-1.png', page: 443 },
    { id: 'fig8-3', ref: 'Figure 8-3', title: 'Square and Acme thread profiles', src: 'figures/shigley/fig8-3.png', page: 446, note: 'Square: thread depth = width = p/2, dm = d − p/2, dr = d − p. Acme: 2α = 29°.' },
    { id: 'table8-3', ref: 'Table 8-3', title: 'Preferred pitches for Acme threads', src: 'figures/shigley/table8-3.png', page: 447 },
    { id: 'table17-1', ref: 'Table 17-1', title: 'Preferred Acme screw threads — D, n, p, Dr, Dp, At, As (per inch of nut)', src: 'figures/mott/table17-1.png', page: 662, book: 'mott',
      note: 'Fizz step 2: choose the first row whose tensile stress area At ≥ required. Note As (shear area per 1 in of engagement) for the nut-length step. Shigley has no equivalent table.' },
    { id: 'table17-1m', ref: 'Table 17-1M', title: 'Metric trapezoidal power screws (ISO) — D, p, Dp, Dr, At', src: 'figures/mott/table17-1m.png', page: 663, book: 'mott' },
    { id: 'fig8-5', ref: 'Figure 8-5 / 8-6', title: 'Portion of a power screw; unrolled-thread force diagrams for lifting (a) and lowering (b)', src: 'figures/shigley/fig8-5-6.png', page: 448 },
    { id: 'fizz-anatomy', ref: 'Fizz p.123 anatomy', title: 'Power screw anatomy — dm, p, λ, ψ, nut reactions', src: 'figures/bibles/fizz_p123_power_screw_anatomy.png', book: 'fizz', note: 'Student-guide sketch (same as Shigley Fig. 8-5).' },
    { id: 'fig8-7', ref: 'Figure 8-7', title: '(a) Normal thread force increased by thread angle α; (b) thrust collar of frictional diameter dc', src: 'figures/shigley/fig8-7.png', page: 450 },
    { id: 'table8-5', ref: 'Table 8-5', title: 'Coefficients of friction f for threaded pairs', src: 'figures/shigley/table8-5.png', page: 454, note: 'Sliding f in power screws is about 0.10–0.15; Mott suggests 0.15 for lubricated steel on steel.' },
    { id: 'table8-6', ref: 'Table 8-6', title: 'Thrust-collar friction coefficients (running / starting)', src: 'figures/shigley/table8-6.png', page: 454, note: 'If the collar is a rolling-element thrust bearing, take fc = 0 (Fizz guide).' },
    { id: 'table8-4', ref: 'Table 8-4', title: 'Safe screw bearing pressure pb', src: 'figures/shigley/table8-4.png', page: 454, note: 'Compare the thread bearing stress σB with the safe pb for the material pair and rubbing speed.' },
    { id: 'fig8-8', ref: 'Figure 8-8', title: 'Square-thread geometry for bending/transverse shear at the thread root; 3-D stress element', src: 'figures/shigley/fig8-8.png', page: 451 },
  ],

  sections: [
    { title: 'Inputs & screw selection (Fizz steps 1–3)', steps: [
      { id: 'in', title: 'Load, thread form and allowable stresses', fig: ['fig8-3', 'table8-5', 'table8-6'],
        text: 'Enter the axial load per screw. Pick the thread form — it sets the thread half-angle α used in Eq. 8-5. The allowable stresses are only needed for the Fizz sizing steps (2–3).',
        vars: [
          { id: 'F', symbol: 'F', label: 'Axial load on screw', unit: 'lbf or N', kind: 'input' },
          { id: 'thread', symbol: '2\\alpha', label: 'Thread form', kind: 'choice', options: [{ label: 'Square (α = 0°)', value: 0 }, { label: 'Acme (α = 14.5°)', value: 14.5 }, { label: 'Metric trapezoidal (α = 15°)', value: 15 }], default: 14.5 },
          { id: 'f', symbol: 'f', label: 'Thread friction coefficient', kind: 'lookup', fig: 'table8-5', hint: 'Table 8-5; typically 0.10–0.15', check: v => (v.f !== undefined && (v.f < 0.02 || v.f > 0.4)) ? 'f is usually 0.04–0.25' : null },
          { id: 'sigd', symbol: '\\sigma_d', label: 'Allowable tensile stress (sizing)', unit: 'psi or MPa', kind: 'input', hint: 'Fizz step 1 — optional' },
          { id: 'taud', symbol: '\\tau_d', label: 'Allowable thread shear stress (nut sizing)', unit: 'psi or MPa', kind: 'input', hint: 'Fizz step 3 — optional' },
        ] },
      { id: 'size', title: 'Required tensile-stress area → pick a screw', fig: ['table17-1', 'table17-1m', 'table8-3'],
        formula: 'A_{t,req} = \\frac{F}{\\sigma_d}',
        text: 'Fizz step 1–2: choose the first row of the Acme table (Mott Table 17-1 / 17-1M — Shigley has no power-screw size table) with \\(A_t \\ge A_{t,req}\\). Write down its D, n (tpi), p, Dr, Dp and the shear area As per inch of nut.',
        vars: [
          { id: 'Atreq', symbol: 'A_{t,req}', label: 'Required tensile-stress area', unit: 'in² or mm²', kind: 'calc', compute: v => H.has(v, 'F', 'sigd') ? v.F / v.sigd : undefined,
            work: v => H.has(v, 'F', 'sigd') ? '\\(A_{t,req} = ' + H.fmt(v.F) + '/' + H.fmt(v.sigd) + ' = ' + H.fmt(v.F / v.sigd) + '\\)' : null },
          { id: 'Atsel', symbol: 'A_t', label: 'Tensile-stress area of chosen screw', unit: 'in² or mm²', kind: 'lookup', fig: 'table17-1', hint: 'from the table row you picked',
            check: v => (H.has(v, 'Atsel', 'Atreq') && v.Atsel < v.Atreq) ? 'Chosen At is smaller than required — pick a bigger screw' : null },
          { id: 'Asr', symbol: 'A_{s}', label: 'Rated thread shear area per inch of nut', unit: 'in²/in', kind: 'lookup', fig: 'table17-1', hint: 'last column of Table 17-1 (US only)' },
        ],
        when: v => true },
      { id: 'nut', title: 'Nut / yoke length from thread shear (Fizz step 3)', fig: ['table17-1'],
        formula: 'A_{s,req} = \\frac{F}{\\tau_d} \\qquad h = A_{s,req}\\,\\frac{1\\,\\text{in}}{A_s}',
        text: 'Round h <b>up</b> to the nearest ¼ in (1.10 → 1.25, 1.58 → 1.75 …).',
        vars: [
          { id: 'Asreq', symbol: 'A_{s,req}', label: 'Required shear area', unit: 'in²', kind: 'calc', compute: v => H.has(v, 'F', 'taud') ? v.F / v.taud : undefined },
          { id: 'h', symbol: 'h', label: 'Required nut length', unit: 'in', kind: 'calc', compute: v => H.has(v, 'Asreq', 'Asr') ? v.Asreq / v.Asr : undefined,
            work: v => H.has(v, 'Asreq', 'Asr') ? '\\(h = ' + H.fmt(v.Asreq) + '/' + H.fmt(v.Asr) + ' = ' + H.fmt(v.Asreq / v.Asr) + '\\ \\text{in}\\)' : null },
          { id: 'hr', symbol: 'h_{use}', label: 'Nut length rounded up to ¼ in', unit: 'in', kind: 'calc', compute: v => H.has(v, 'h') ? Math.ceil(v.h * 4 - 1e-9) / 4 : undefined },
        ],
        when: v => H.has(v, 'taud') },
    ] },

    { title: 'Thread geometry', steps: [
      { id: 'geo', title: 'Diameters, lead and lead angle', fig: ['fig8-1', 'fig8-3', 'fig8-5', 'fizz-anatomy'], eq: '8-1 defs',
        formula: 'd_m = d - \\tfrac{p}{2} \\qquad d_r = d - p \\qquad l = n_s\\,p \\qquad \\tan\\lambda = \\frac{l}{\\pi d_m}',
        text: 'Shigley uses the <b>mean</b> diameter \\(d_m\\) (square thread: \\(d_m = d - p/2\\), \\(d_r = d - p\\)). For an Acme screw from Mott Table 17-1 you may overwrite \\(d_m\\) with the table pitch diameter \\(D_p\\) and \\(d_r\\) with the minor diameter \\(D_r\\) — those are the Fizz-guide values.',
        vars: [
          { id: 'd', symbol: 'd', label: 'Major (nominal) diameter', unit: 'in or mm', kind: 'input' },
          { id: 'p', symbol: 'p', label: 'Pitch', unit: 'in or mm', kind: 'input', hint: 'p = 1/n for n threads per inch' },
          { id: 'ns', symbol: 'n_s', label: 'Number of thread starts', kind: 'input', default: 1, hint: '1 = single thread, 2 = double …' },
          { id: 'dm', symbol: 'd_m', label: 'Mean / pitch diameter', unit: 'in or mm', kind: 'lookup', fig: 'table17-1', hint: 'auto = d − p/2; or Dp from Table 17-1', auto: v => H.has(v, 'd', 'p') ? v.d - v.p / 2 : undefined },
          { id: 'dr', symbol: 'd_r', label: 'Minor (root) diameter', unit: 'in or mm', kind: 'lookup', fig: 'table17-1', hint: 'auto = d − p; or Dr from Table 17-1', auto: v => H.has(v, 'd', 'p') ? v.d - v.p : undefined },
          { id: 'l', symbol: 'l', label: 'Lead', unit: 'in or mm', kind: 'calc', compute: v => H.has(v, 'p', 'ns') ? v.p * v.ns : undefined },
          { id: 'lam', symbol: '\\lambda', label: 'Lead angle', unit: '°', kind: 'calc', digits: 4, compute: v => H.has(v, 'l', 'dm') ? H.deg(Math.atan(v.l / (Math.PI * v.dm))) : undefined,
            work: v => H.has(v, 'l', 'dm') ? '\\(\\lambda = \\tan^{-1}\\!\\left(\\dfrac{' + H.fmt(v.l) + '}{\\pi\\,' + H.fmt(v.dm) + '}\\right) = ' + H.fmt(H.deg(Math.atan(v.l / (Math.PI * v.dm)))) + '^\\circ\\)' : null },
        ] },
    ] },

    { title: 'Torque, self-locking, efficiency', steps: [
      { id: 'tq', title: 'Raising and lowering torque (thread only)', eq: '8-1, 8-2, 8-5', fig: ['fig8-5', 'fig8-7'],
        formula: 'T_R = \\frac{F d_m}{2}\\left(\\frac{l + \\pi f d_m \\sec\\alpha}{\\pi d_m - f l \\sec\\alpha}\\right) \\qquad T_L = \\frac{F d_m}{2}\\left(\\frac{\\pi f d_m \\sec\\alpha - l}{\\pi d_m + f l \\sec\\alpha}\\right)',
        text: 'Eq. 8-5 (Acme/trapezoidal: friction terms divided by cos α). With α = 0 these reduce to Eqs. 8-1 and 8-2 for square threads. The Fizz form \\(T_u = \\frac{F D_p}{2}\\frac{\\cos\\phi\\tan\\lambda + f}{\\cos\\phi - f\\tan\\lambda}\\) is the same equation written with the lead angle.',
        vars: [
          { id: 'TR', symbol: 'T_R', label: 'Torque to raise load (thread)', unit: 'lbf·in or N·mm', kind: 'calc', compute: v => {
              if (!H.has(v, 'F', 'dm', 'l', 'f', 'thread')) return undefined; const s = 1 / Math.cos(H.rad(v.thread));
              return v.F * v.dm / 2 * (v.l + Math.PI * v.f * v.dm * s) / (Math.PI * v.dm - v.f * v.l * s); },
            work: v => { if (!H.has(v, 'F', 'dm', 'l', 'f', 'thread')) return null; const s = 1 / Math.cos(H.rad(v.thread));
              return '\\(T_R = \\dfrac{' + H.fmt(v.F) + '(' + H.fmt(v.dm) + ')}{2}\\left[\\dfrac{' + H.fmt(v.l) + ' + \\pi(' + H.fmt(v.f) + ')(' + H.fmt(v.dm) + ')(' + H.fmt(s) + ')}{\\pi(' + H.fmt(v.dm) + ') - ' + H.fmt(v.f) + '(' + H.fmt(v.l) + ')(' + H.fmt(s) + ')}\\right] = ' + H.fmt(v.TR) + '\\)'; } },
          { id: 'TL', symbol: 'T_L', label: 'Torque to lower load (thread)', unit: 'lbf·in or N·mm', kind: 'calc', compute: v => {
              if (!H.has(v, 'F', 'dm', 'l', 'f', 'thread')) return undefined; const s = 1 / Math.cos(H.rad(v.thread));
              return v.F * v.dm / 2 * (Math.PI * v.f * v.dm * s - v.l) / (Math.PI * v.dm + v.f * v.l * s); } },
        ],
        after: v => v.TL === undefined ? '' : (v.TL > 0 ? '<span class="result-ok">T<sub>L</sub> &gt; 0 → thread is self-locking (holds the load without a brake).</span>' : '<span class="result-bad">T<sub>L</sub> ≤ 0 → NOT self-locking: the load will back-drive the screw unless collar friction / a brake holds it.</span>') },
      { id: 'sl', title: 'Self-locking check', eq: '8-3', formula: 'f > \\tan\\lambda \\;\\;(\\text{square});\\qquad f\\sec\\alpha > \\tan\\lambda \\;\\;(\\text{Acme})',
        vars: [
          { id: 'tanlam', symbol: '\\tan\\lambda', label: 'tan λ', kind: 'calc', compute: v => H.has(v, 'l', 'dm') ? v.l / (Math.PI * v.dm) : undefined },
          { id: 'feff', symbol: 'f\\sec\\alpha', label: 'Effective friction', kind: 'calc', compute: v => H.has(v, 'f', 'thread') ? v.f / Math.cos(H.rad(v.thread)) : undefined },
        ],
        after: v => H.has(v, 'tanlam', 'feff') ? (v.feff > v.tanlam ? '<span class="result-ok">Self-locking (f sec α = ' + H.fmt(v.feff, 3) + ' &gt; tan λ = ' + H.fmt(v.tanlam, 3) + ').</span>' : '<span class="result-bad">Not self-locking (f sec α = ' + H.fmt(v.feff, 3) + ' ≤ tan λ = ' + H.fmt(v.tanlam, 3) + '). Mott notes Table 17-1 screws have λ = 1.9°–5.6°, so vibration can still cause creep.</span>') : '' },
      { id: 'collar', title: 'Collar (thrust-bearing) friction torque', eq: '8-6', fig: ['fig8-7', 'table8-6'],
        formula: 'T_c = \\frac{F f_c d_c}{2}',
        text: 'Fizz writes this as \\(f_c F R_c\\) with the collar radius \\(R_c = d_c/2\\). If the problem says "roller/ball thrust bearing" and gives no fc, use fc = 0.',
        vars: [
          { id: 'fc', symbol: 'f_c', label: 'Collar friction coefficient', kind: 'lookup', fig: 'table8-6', default: 0, hint: '0 for a rolling thrust bearing' },
          { id: 'dc', symbol: 'd_c', label: 'Mean collar diameter', unit: 'in or mm', kind: 'input', hint: 'dc = 2 Rc' },
          { id: 'Tc', symbol: 'T_c', label: 'Collar torque', unit: 'lbf·in or N·mm', kind: 'calc', compute: v => H.has(v, 'F', 'fc') ? (v.fc === 0 ? 0 : (H.has(v, 'dc') ? v.F * v.fc * v.dc / 2 : undefined)) : undefined,
            work: v => (H.has(v, 'F', 'fc', 'dc') && v.fc !== 0) ? '\\(T_c = ' + H.fmt(v.F) + '(' + H.fmt(v.fc) + ')(' + H.fmt(v.dc) + ')/2 = ' + H.fmt(v.Tc) + '\\)' : null },
          { id: 'TRt', symbol: 'T_{R,tot}', label: 'Total torque to raise = TR + Tc', unit: 'lbf·in or N·mm', kind: 'calc', compute: v => H.has(v, 'TR', 'Tc') ? v.TR + v.Tc : undefined },
          { id: 'TLt', symbol: 'T_{L,tot}', label: 'Total torque to lower = TL + Tc', unit: 'lbf·in or N·mm', kind: 'calc', compute: v => H.has(v, 'TL', 'Tc') ? v.TL + v.Tc : undefined },
        ] },
      { id: 'eff', title: 'Efficiency', eq: '8-4', formula: 'e = \\frac{T_0}{T_R} = \\frac{F l}{2\\pi T_R}',
        text: '\\(T_0 = Fl/2\\pi\\) is the frictionless torque. Shigley Example 8-1 computes the <i>overall</i> efficiency with the total raising torque (thread + collar); the thread-only value is also shown.',
        vars: [
          { id: 'e', symbol: 'e', label: 'Overall efficiency (incl. collar)', kind: 'calc', digits: 3, compute: v => H.has(v, 'F', 'l', 'TRt') && v.TRt > 0 ? v.F * v.l / (2 * Math.PI * v.TRt) : undefined,
            work: v => H.has(v, 'F', 'l', 'TRt') && v.TRt > 0 ? '\\(e = \\dfrac{' + H.fmt(v.F) + '(' + H.fmt(v.l) + ')}{2\\pi(' + H.fmt(v.TRt) + ')} = ' + H.fmt(v.e, 3) + '\\)' : null },
          { id: 'eth', symbol: 'e_{thread}', label: 'Thread-only efficiency', kind: 'calc', digits: 3, compute: v => H.has(v, 'F', 'l', 'TR') && v.TR > 0 ? v.F * v.l / (2 * Math.PI * v.TR) : undefined },
        ],
        after: v => v.e !== undefined ? '<span>' + (v.e < 0.25 ? 'Low efficiency (&lt; 25 %) — typical for single-start Acme; a multi-start or ball screw would do better.' : 'Efficiency ' + H.fmt(100 * v.e, 3) + ' %.') + '</span>' : '' },
      { id: 'spd', title: 'Speed and power (Fizz step 7)', formula: 'n = \\frac{63000\\,P}{T_{R,tot}} \\;(\\text{hp, lbf·in}) \\qquad n = \\frac{9.549\\times10^{6}\\,P}{T_{R,tot}} \\;(\\text{kW, N·mm}) \\qquad V = \\frac{n\\,l}{60}',
        text: 'Given an input power, the fastest the load can be raised; or given a required speed, the power needed. Fizz uses p; for a multi-start thread the advance per revolution is the lead \\(l\\).',
        vars: [
          { id: 'units', label: 'Unit system', kind: 'choice', type: 'text', options: [{ label: 'US: hp, lbf·in, in/s', value: 'US' }, { label: 'SI: kW, N·mm, mm/s', value: 'SI' }], default: 'US' },
          { id: 'P', symbol: 'P', label: 'Input power (if given)', unit: 'hp or kW', kind: 'input' },
          { id: 'n', symbol: 'n', label: 'Screw speed', unit: 'rpm', kind: 'calc', compute: v => H.has(v, 'P', 'TRt') && v.TRt > 0 ? (v.units === 'SI' ? 9.549e6 : 63000) * v.P / v.TRt : undefined },
          { id: 'V', symbol: 'V', label: 'Linear speed of load', unit: 'in/s or mm/s', kind: 'calc', compute: v => H.has(v, 'n', 'l') ? v.n * v.l / 60 : undefined },
        ] },
    ] },

    { title: 'Stresses at the thread root (Shigley 8-2)', text: 'Shigley: the engaged threads do not share the load equally — the first thread carries ≈ 0.38 F. For the worst case use the 0.38 F share with \\(n_t = 1\\).', steps: [
      { id: 'body', title: 'Body stresses: torsion and axial', eq: '8-7, 8-8', formula: '\\tau = \\frac{16 T}{\\pi d_r^3} \\qquad \\sigma = -\\frac{4F}{\\pi d_r^2}',
        text: 'T is the torque carried by the screw body: use the total raising torque \\(T_{R,tot}\\) if the collar is on the screw (as in Example 8-1), otherwise \\(T_R\\).',
        vars: [
          { id: 'Tbody', symbol: 'T', label: 'Torque in screw body (blank = total raising torque)', unit: 'lbf·in or N·mm', kind: 'input', hint: 'leave blank to use T_R,tot' },
          { id: 'tau', symbol: '\\tau_{yz}', label: 'Torsional shear stress', unit: 'psi or MPa', kind: 'calc', compute: v => (TB(v) !== undefined && H.has(v, 'dr')) ? 16 * TB(v) / (Math.PI * Math.pow(v.dr, 3)) : undefined,
            work: v => (TB(v) !== undefined && H.has(v, 'dr')) ? '\\(\\tau = \\dfrac{16(' + H.fmt(TB(v)) + ')}{\\pi(' + H.fmt(v.dr) + ')^3} = ' + H.fmt(v.tau) + '\\)' : null },
          { id: 'sig', symbol: '\\sigma_y', label: 'Axial (compressive) stress', unit: 'psi or MPa', kind: 'calc', compute: v => H.has(v, 'F', 'dr') ? -4 * v.F / (Math.PI * v.dr * v.dr) : undefined,
            work: v => H.has(v, 'F', 'dr') ? '\\(\\sigma = -\\dfrac{4(' + H.fmt(v.F) + ')}{\\pi(' + H.fmt(v.dr) + ')^2} = ' + H.fmt(v.sig) + '\\)' : null },
        ] },
      { id: 'thr', title: 'Thread stresses: bearing, bending, tangential shear', eq: '8-10, 8-11, 8-12', fig: ['fig8-8', 'table8-4'],
        formula: '\\sigma_B = -\\frac{2 F_1}{\\pi d_m n_t p} \\qquad \\sigma_x = \\frac{6 F_1}{\\pi d_r n_t p} \\qquad \\tau_{zx} = -\\frac{4 T_1}{\\pi d_r^2 n_t p}',
        text: '\\(F_1 = s F\\) and \\(T_1 = s T\\) where s is the load share on the thread considered (0.38 for the first thread, 1.0 if all \\(n_t\\) threads share equally).',
        vars: [
          { id: 'share', symbol: 's', label: 'Load share on analysed thread', kind: 'choice', options: [{ label: '0.38 — first engaged thread (Shigley)', value: 0.38 }, { label: '1.0 — equal sharing over nt threads', value: 1 }], default: 0.38 },
          { id: 'nt', symbol: 'n_t', label: 'Engaged threads considered', kind: 'input', default: 1, hint: '1 with s = 0.38; nut length / p for equal sharing' },
          { id: 'sigB', symbol: '\\sigma_B', label: 'Bearing stress on thread', unit: 'psi or MPa', kind: 'calc', compute: v => H.has(v, 'F', 'dm', 'nt', 'p', 'share') ? -2 * v.share * v.F / (Math.PI * v.dm * v.nt * v.p) : undefined,
            work: v => H.has(v, 'F', 'dm', 'nt', 'p', 'share') ? '\\(\\sigma_B = -\\dfrac{2(' + H.fmt(v.share) + ')(' + H.fmt(v.F) + ')}{\\pi(' + H.fmt(v.dm) + ')(' + H.fmt(v.nt) + ')(' + H.fmt(v.p) + ')} = ' + H.fmt(v.sigB) + '\\)' : null },
          { id: 'pb', symbol: 'p_b', label: 'Safe bearing pressure', unit: 'psi or MPa', kind: 'lookup', fig: 'table8-4', hint: 'Table 8-4 (psi; ÷145 for MPa)' },
          { id: 'sigx', symbol: '\\sigma_x', label: 'Thread-root bending stress', unit: 'psi or MPa', kind: 'calc', compute: v => H.has(v, 'F', 'dr', 'nt', 'p', 'share') ? 6 * v.share * v.F / (Math.PI * v.dr * v.nt * v.p) : undefined,
            work: v => H.has(v, 'F', 'dr', 'nt', 'p', 'share') ? '\\(\\sigma_x = \\dfrac{6(' + H.fmt(v.share) + ')(' + H.fmt(v.F) + ')}{\\pi(' + H.fmt(v.dr) + ')(' + H.fmt(v.nt) + ')(' + H.fmt(v.p) + ')} = ' + H.fmt(v.sigx) + '\\)' : null },
          { id: 'tzx', symbol: '\\tau_{zx}', label: 'Tangential shear at root', unit: 'psi or MPa', kind: 'calc', compute: v => (TB(v) !== undefined && H.has(v, 'dr', 'nt', 'p', 'share')) ? -4 * v.share * TB(v) / (Math.PI * v.dr * v.dr * v.nt * v.p) : undefined },
        ],
        after: v => H.has(v, 'sigB', 'pb') ? (Math.abs(v.sigB) <= v.pb ? '<span class="result-ok">|σ<sub>B</sub>| = ' + H.fmt(Math.abs(v.sigB)) + ' ≤ p<sub>b</sub> = ' + H.fmt(v.pb) + ' — bearing pressure OK.</span>' : '<span class="result-bad">|σ<sub>B</sub>| = ' + H.fmt(Math.abs(v.sigB)) + ' &gt; p<sub>b</sub> = ' + H.fmt(v.pb) + ' — thread wear: lengthen nut / larger screw.</span>') : '' },
      { id: 'vm', title: 'Von Mises stress and static factor of safety', eq: '5-14', fig: ['fig8-8'],
        formula: "\\sigma' = \\frac{1}{\\sqrt 2}\\sqrt{(\\sigma_x-\\sigma_y)^2 + \\sigma_y^2 + \\sigma_x^2 + 6\\tau_{yz}^2 + 6\\tau_{zx}^2} \\qquad n = \\frac{S_y}{\\sigma'}",
        text: 'Stress element at the outer radius of the screw body next to the first thread root: \\(\\sigma_z = 0,\\ \\tau_{xy} = 0\\).',
        vars: [
          { id: 'svm', symbol: "\\sigma'", label: 'Von Mises stress', unit: 'psi or MPa', kind: 'calc', compute: v => H.has(v, 'sigx', 'sig', 'tau', 'tzx') ? Math.sqrt(0.5 * (Math.pow(v.sigx - v.sig, 2) + v.sig * v.sig + v.sigx * v.sigx + 6 * v.tau * v.tau + 6 * v.tzx * v.tzx)) : undefined,
            work: v => H.has(v, 'sigx', 'sig', 'tau', 'tzx') ? "\\(\\sigma' = \\tfrac{1}{\\sqrt2}\\{[" + H.fmt(v.sigx) + ' - (' + H.fmt(v.sig) + ')]^2 + (' + H.fmt(v.sig) + ')^2 + (' + H.fmt(v.sigx) + ')^2 + 6(' + H.fmt(v.tau) + ')^2 + 6(' + H.fmt(v.tzx) + ')^2\\}^{1/2} = ' + H.fmt(v.svm) + '\\)' : null },
          { id: 'Sy', symbol: 'S_y', label: 'Screw yield strength', unit: 'psi or MPa', kind: 'input', hint: 'Table A-20 for the screw steel' },
          { id: 'nfs', symbol: 'n', label: 'Static factor of safety', kind: 'calc', digits: 3, compute: v => H.has(v, 'Sy', 'svm') && v.svm > 0 ? v.Sy / v.svm : undefined },
        ],
        after: v => v.nfs === undefined ? (v.svm !== undefined ? '<span>Enter S<sub>y</sub> to get the factor of safety.</span>' : '') : (v.nfs >= 1 ? '<span class="result-ok">PASS — n = ' + H.fmt(v.nfs, 3) + ' against yield at the thread root.</span>' : '<span class="result-bad">FAIL — n = ' + H.fmt(v.nfs, 3) + ' &lt; 1: thread root yields. Increase d<sub>r</sub>, pitch or material strength.</span>') },
    ] },
  ],
};
