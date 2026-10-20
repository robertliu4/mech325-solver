// Power screws — Mott Ch. 17-2 (Fizz §5.1 seven-step procedure; Example Problems 17-1 / 17-2)
// Course alignment (v2/COURSE_CONVENTIONS.md §14): the Module 5 reading guide lists Mott 17-2 as the alternative to Shigley 8-1/8-2 for
// power-screw torque, efficiency and power. No course worked numbers exist, so textbook defaults apply (f = 0.15 lubricated steel/steel,
// fc = 0 with a rolling thrust bearing, nut length rounded up to ¼ in). The `example` is Mott Example 17-1/17-2 (12 500 lb, 1½-4 Acme).
// Guide assumptions (Fizz pp.123–127; the Mech guide has no power-screw unit) are listed in `assumptions` and carried by the field defaults.
// Verified against: Mott Examples 17-1 / 17-2 (F 12 500 lb, σd 10 000, τd 5000 psi, f 0.15, 15 in in 12 s) → At,req 1.25 in² → 1½-4 Acme,
//   h 1.07 → 1.25 in, λ 3.39°, Tu 1809 (1814 unrounded), Td 796, e 27.5 %, n 300 rpm, P 8.61 (8.64) hp — reproduced.
window.TOPIC = {
  id: 'power_screws', book: 'mott',
  title: 'Power Screws — Selection, Torque & Efficiency',
  subtitle: 'Mott Ch. 17-2 · Fizz guide §5.1 procedure (Example Problems 17-1 / 17-2)',
  sibling: 'power_screws_shigley.html',
  intro: 'The Fizz-guide 7-step power-screw procedure, which is Mott Example Problems 17-1 and 17-2: size the screw from the tensile-stress area (Table 17-1 / 17-1M), size the nut from the thread shear area, then lead angle (Eq. 17-3), raising / lowering torque (Eqs. 17-8 … 17-11, plus the Fizz collar term), self-locking (Eq. 17-5), efficiency (Eq. 17-7) and the speed / power relation \\(P = Tn/63\\,000\\). '
    + 'US units (lbf, in, psi, lbf·in, hp) as in Mott; for metric trapezoidal screws use N, mm, MPa and the SI power option. Mott does not give thread-root stresses — see the Shigley version for those. <b>Course note:</b> MECH 325 provides only the Module 5 reading guide (Mott 17-2 or Shigley 8-1/8-2) and no worked numbers for power screws, so the textbook defaults apply unchanged.',
  example: { F: 12500, sigd: 10000, taud: 5000, thread: 14.5, f: 0.15, Atsel: 1.266, Asr: 2.341, D: 1.5, tpi: 4, Dp: 1.3429, Dr: 1.1965, ns: 1, fc: 0, units: 'US', Vreq: 1.25 },

  assumptions: [
    { text: 'Allowable σ_d (screw) and τ_d (nut threads) come from the problem; the screw is the first Table 17-1 / 17-1M row with A_t ≥ F/σ_d', src: 'Fizz p.123 · Fizz p.125' },
    { text: 'Nut / yoke length rounded up to the nearest ¼ in (1.10 → 1.25, 1.58 → 1.75)', src: 'Fizz p.126', var: 'hr' },
    { text: 'Single-start thread: lead L = pitch p = 1/n (all Table 17-1 screws)', src: 'Fizz pp.126–127', var: 'ns' },
    { text: 'Thread angle φ = 14.5° for Acme (square 0°, metric trapezoidal 15°)', src: 'Fizz p.126', var: 'thread' },
    { text: 'f = 0.15 (well-lubricated steel screw in a steel nut, conservative) when no friction coefficient is given — Mott 17-2; the guides give no value', src: 'Mott §17-2', var: 'f' },
    { text: 'Collar friction f_c = 0 when there is a roller (thrust) bearing, unless stated otherwise', src: 'Fizz p.126', var: 'fc' },
    { text: 'Efficiency and speed use the raising torque T_u (with the collar term): e = FL/(2πT_u), n = 63 000 P/T_u (hp, lb·in)', src: 'Fizz p.127', var: 'e' },
  ],

  figures: [
    { id: 'fig17-2', ref: 'Figure 17-2', title: 'Three forms of power screw threads: square, Acme (2φ = 29°), buttress', src: 'figures/mott/fig17-2.png', page: 660 },
    { id: 'table17-1', ref: 'Table 17-1', title: 'Preferred Acme screw threads — D, n, p, Dr, Dp, At, As (per inch of engagement)', src: 'figures/mott/table17-1.png', page: 662,
      note: 'Fizz step 2: first row with At ≥ required. Note the shear-stress area As (per 1.0 in of nut) for step 3.' },
    { id: 'table17-1m', ref: 'Table 17-1M', title: 'Metric trapezoidal power screws (ISO): D, p, Dp, Dr, At', src: 'figures/mott/table17-1m.png', page: 663, note: 'φ = 15° for trapezoidal threads. Single-start designs; no shear-area column.' },
    { id: 'fig17-5', ref: 'Figure 17-5', title: 'Screw-thread force analysis: load pushed up (a) and down (b) the unrolled thread', src: 'figures/mott/fig17-5.png', page: 663 },
    { id: 'fig17-6', ref: 'Figure 17-6', title: 'Force normal to a square vs. an Acme thread (F → F/cos φ)', src: 'figures/mott/fig17-6.png', page: 665 },
    { id: 'fizz-anatomy', ref: 'Fizz p.123 anatomy', title: 'Power screw anatomy — mean diameter, pitch, lead angle λ, helix angle ψ', src: 'figures/bibles/fizz_p123_power_screw_anatomy.png', book: 'fizz' },
    { id: 'table8-5', ref: 'Table 8-5', title: 'Coefficients of friction for threaded pairs', src: 'figures/shigley/table8-5.png', page: 454, book: 'shigley', note: 'Mott only says f = 0.15 is conservative for lubricated steel on steel; Shigley table shown for other pairs.' },
    { id: 'table8-6', ref: 'Table 8-6', title: 'Thrust-collar friction coefficients', src: 'figures/shigley/table8-6.png', page: 454, book: 'shigley', note: 'Mott has no collar table. fc = 0 for a rolling-element thrust bearing (Fizz).' },
  ],

  sections: [
    { title: 'Step 1–3: Select the screw and size the nut', steps: [
      { id: 'in', title: 'Load, thread form, allowable stresses', fig: ['fig17-2', 'table8-5'],
        vars: [
          { id: 'F', symbol: 'F', label: 'Axial load per screw', unit: 'lb (or N)', kind: 'input' },
          { id: 'thread', symbol: '\\phi', label: 'Thread form (thread angle φ)', kind: 'choice', options: [{ label: 'Square (φ = 0°)', value: 0 }, { label: 'Acme (φ = 14.5°)', value: 14.5 }, { label: 'Metric trapezoidal (φ = 15°)', value: 15 }], default: 14.5 },
          { id: 'f', symbol: 'f', label: 'Coefficient of friction', kind: 'lookup', fig: 'table8-5', default: 0.15, hint: '0.15 conservative for lubricated steel/steel' },
          { id: 'sigd', symbol: '\\sigma_d', label: 'Allowable tensile stress', unit: 'psi (MPa)', kind: 'input', hint: 'given in problem' },
          { id: 'taud', symbol: '\\tau_d', label: 'Allowable thread shear stress', unit: 'psi (MPa)', kind: 'input', hint: 'for nut length — optional' },
        ] },
      { id: 'at', title: 'Required tensile-stress area and screw selection', eq: '17-1', fig: ['table17-1', 'table17-1m'],
        formula: 'A_{t,req} = \\frac{F}{\\sigma_d} \\qquad\\left(A_t = \\frac{\\pi}{4}\\left[\\frac{D_r + D_p}{2}\\right]^2\\right)',
        text: 'Choose the first table row with \\(A_t \\ge A_{t,req}\\); copy D, n, p, Dr, Dp, At and As from that row into the yellow boxes.',
        vars: [
          { id: 'Atreq', symbol: 'A_{t,req}', label: 'Required tensile-stress area', unit: 'in² (mm²)', kind: 'calc', compute: v => H.has(v, 'F', 'sigd') ? v.F / v.sigd : undefined,
            work: v => H.has(v, 'F', 'sigd') ? '\\(A_{t,req} = \\dfrac{' + H.fmt(v.F) + '}{' + H.fmt(v.sigd) + '} = ' + H.fmt(v.F / v.sigd) + '\\)' : null },
          { id: 'D', symbol: 'D', label: 'Nominal major diameter', unit: 'in (mm)', kind: 'lookup', fig: 'table17-1', hint: 'first Table 17-1 / 17-1M row with At ≥ required' },
          { id: 'tpi', symbol: 'n', label: 'Threads per inch', unit: 'tpi', kind: 'lookup', fig: 'table17-1', hint: 'US only; metric: enter pitch directly below' },
          { id: 'p', symbol: 'p', label: 'Pitch', unit: 'in (mm)', kind: 'lookup', fig: 'table17-1', hint: 'auto = 1/n', auto: v => H.has(v, 'tpi') && v.tpi > 0 ? 1 / v.tpi : undefined },
          { id: 'Dr', symbol: 'D_r', label: 'Minimum minor diameter', unit: 'in (mm)', kind: 'lookup', fig: 'table17-1', hint: 'same table row (1½-4 Acme: 1.1965 in)' },
          { id: 'Dp', symbol: 'D_p', label: 'Minimum pitch diameter', unit: 'in (mm)', kind: 'lookup', fig: 'table17-1', hint: 'same table row (1½-4 Acme: 1.3429 in)' },
          { id: 'Atsel', symbol: 'A_t', label: 'Tensile-stress area (table)', unit: 'in² (mm²)', kind: 'lookup', fig: 'table17-1', hint: 'auto = Eq. 17-1 from Dr, Dp', auto: v => H.has(v, 'Dr', 'Dp') ? Math.PI / 4 * Math.pow((v.Dr + v.Dp) / 2, 2) : undefined,
            check: v => (H.has(v, 'Atsel', 'Atreq') && v.Atsel < v.Atreq) ? 'At < required — choose the next larger screw' : null },
          { id: 'Asr', symbol: 'A_s', label: 'Shear-stress area per inch of nut', unit: 'in²/in', kind: 'lookup', fig: 'table17-1', hint: 'last column of Table 17-1 (US only; 1½-4: 2.341)' },
        ],
        after: v => H.has(v, 'Atsel', 'Atreq') ? (v.Atsel >= v.Atreq ? '<span class="result-ok">Screw OK in tension: A<sub>t</sub> = ' + H.fmt(v.Atsel) + ' ≥ ' + H.fmt(v.Atreq) + '.</span>' : '<span class="result-bad">Too small in tension.</span>') : '' },
      { id: 'nut', title: 'Nut / yoke length from thread shear', formula: 'A_{s,req} = \\frac{F}{\\tau_d} \\qquad h = A_{s,req}\\left[\\frac{1.0\\ \\text{in}}{A_s}\\right]', fig: ['table17-1'],
        text: 'Mott: As in Table 17-1 is for a 1.0-in length of engagement — other lengths scale by h/1.0. Fizz: round h <b>up</b> to the nearest ¼ in (Mott Example 17-1 took 1.07 → 1.25 in).',
        vars: [
          { id: 'Asreq', symbol: 'A_{s,req}', label: 'Required shear area', unit: 'in²', kind: 'calc', compute: v => H.has(v, 'F', 'taud') ? v.F / v.taud : undefined },
          { id: 'h', symbol: 'h', label: 'Required nut length', unit: 'in', kind: 'calc', compute: v => H.has(v, 'Asreq', 'Asr') ? v.Asreq / v.Asr : undefined,
            work: v => H.has(v, 'Asreq', 'Asr') ? '\\(h = ' + H.fmt(v.Asreq) + '\\left[\\dfrac{1.0}{' + H.fmt(v.Asr) + '}\\right] = ' + H.fmt(v.h) + '\\ \\text{in}\\)' : null },
          { id: 'hr', symbol: 'h_{use}', label: 'Rounded up to ¼ in', unit: 'in', kind: 'calc', compute: v => H.has(v, 'h') ? Math.ceil(v.h * 4 - 1e-9) / 4 : undefined },
        ],
        when: v => H.has(v, 'taud') },
    ] },

    { title: 'Step 4: Lead angle', steps: [
      { id: 'lead', title: 'Lead and lead angle', eq: '17-3', fig: ['fig17-5', 'fizz-anatomy'], formula: 'L = n_s\\,p \\qquad \\tan\\lambda = \\frac{L}{\\pi D_p}',
        text: 'Single-thread screws (all of Table 17-1): L = p = 1/n. Multi-start screws: L = (starts) × p.',
        vars: [
          { id: 'ns', symbol: 'n_s', label: 'Number of thread starts', kind: 'input', default: 1 },
          { id: 'L', symbol: 'L', label: 'Lead', unit: 'in (mm)', kind: 'calc', compute: v => H.has(v, 'p', 'ns') ? v.p * v.ns : undefined },
          { id: 'lam', symbol: '\\lambda', label: 'Lead angle', unit: '°', kind: 'calc', digits: 4, compute: v => H.has(v, 'L', 'Dp') ? H.deg(Math.atan(v.L / (Math.PI * v.Dp))) : undefined,
            work: v => H.has(v, 'L', 'Dp') ? '\\(\\lambda = \\tan^{-1}\\dfrac{' + H.fmt(v.L) + '}{\\pi(' + H.fmt(v.Dp) + ')} = ' + H.fmt(v.lam) + '^\\circ\\)' : null },
        ] },
    ] },

    { title: 'Step 5: Torque to raise and lower', steps: [
      { id: 'tu', title: 'Raising torque Tu and lowering torque Td', eq: '17-8 … 17-11', fig: ['fig17-5', 'fig17-6'],
        formula: 'T_u = \\frac{F D_p}{2}\\left[\\frac{\\cos\\phi\\tan\\lambda + f}{\\cos\\phi - f\\tan\\lambda}\\right] \\qquad T_d = \\frac{F D_p}{2}\\left[\\frac{f - \\cos\\phi\\tan\\lambda}{\\cos\\phi + f\\tan\\lambda}\\right]',
        text: 'Eqs. 17-10 / 17-11 (Acme, trapezoidal). With φ = 0 they become Eqs. 17-8 / 17-9 for square threads.',
        vars: [
          { id: 'cosphi', symbol: '\\cos\\phi', label: 'cos φ', kind: 'calc', digits: 4, compute: v => H.has(v, 'thread') ? Math.cos(H.rad(v.thread)) : undefined },
          { id: 'tanlam', symbol: '\\tan\\lambda', label: 'tan λ', kind: 'calc', digits: 4, compute: v => H.has(v, 'L', 'Dp') ? v.L / (Math.PI * v.Dp) : undefined },
          { id: 'Tu', symbol: 'T_u', label: 'Torque to raise (thread)', unit: 'lb·in (N·mm)', kind: 'calc', compute: v => H.has(v, 'F', 'Dp', 'cosphi', 'tanlam', 'f') ? v.F * v.Dp / 2 * (v.cosphi * v.tanlam + v.f) / (v.cosphi - v.f * v.tanlam) : undefined,
            work: v => H.has(v, 'F', 'Dp', 'cosphi', 'tanlam', 'f') ? '\\(T_u = \\dfrac{' + H.fmt(v.F) + '(' + H.fmt(v.Dp) + ')}{2}\\left[\\dfrac{' + H.fmt(v.cosphi, 3) + '(' + H.fmt(v.tanlam, 4) + ') + ' + H.fmt(v.f) + '}{' + H.fmt(v.cosphi, 3) + ' - ' + H.fmt(v.f) + '(' + H.fmt(v.tanlam, 4) + ')}\\right] = ' + H.fmt(v.Tu) + '\\)' : null },
          { id: 'Td', symbol: 'T_d', label: 'Torque to lower (thread)', unit: 'lb·in (N·mm)', kind: 'calc', compute: v => H.has(v, 'F', 'Dp', 'cosphi', 'tanlam', 'f') ? v.F * v.Dp / 2 * (v.f - v.cosphi * v.tanlam) / (v.cosphi + v.f * v.tanlam) : undefined,
            work: v => H.has(v, 'F', 'Dp', 'cosphi', 'tanlam', 'f') ? '\\(T_d = \\dfrac{' + H.fmt(v.F) + '(' + H.fmt(v.Dp) + ')}{2}\\left[\\dfrac{' + H.fmt(v.f) + ' - ' + H.fmt(v.cosphi, 3) + '(' + H.fmt(v.tanlam, 4) + ')}{' + H.fmt(v.cosphi, 3) + ' + ' + H.fmt(v.f) + '(' + H.fmt(v.tanlam, 4) + ')}\\right] = ' + H.fmt(v.Td) + '\\)' : null },
        ] },
      { id: 'sl', title: 'Self-locking check', eq: '17-5', formula: 'f > \\tan\\lambda',
        text: 'Mott: for f = 0.15 the limiting lead angle is 8.5°; for f = 0.10 it is 5.7°. Table 17-1 screws have λ = 1.94°–5.57° and are all self-locking (avoid vibration).',
        vars: [],
        after: v => H.has(v, 'f', 'tanlam') ? (v.f > v.tanlam ? '<span class="result-ok">f = ' + H.fmt(v.f) + ' &gt; tan λ = ' + H.fmt(v.tanlam, 4) + ' → self-locking.</span>' : '<span class="result-bad">f = ' + H.fmt(v.f) + ' ≤ tan λ = ' + H.fmt(v.tanlam, 4) + ' → NOT self-locking; the load will back-drive the screw.</span>') : '' },
      { id: 'collar', title: 'Collar friction (Fizz step 5c)', fig: ['table8-6'], formula: 'T_{u,tot} = T_u + f_c F R_c \\qquad T_{d,tot} = T_d + f_c F R_c',
        text: 'Mott notes the extra friction torque where the screw or nut bears on a stationary surface and recommends antifriction bearings there. Fizz: if a roller bearing is present, fc = 0 unless stated.',
        vars: [
          { id: 'fc', symbol: 'f_c', label: 'Collar friction coefficient', kind: 'lookup', fig: 'table8-6', default: 0, hint: '0 with a rolling thrust bearing' },
          { id: 'Rc', symbol: 'R_c', label: 'Collar friction radius', unit: 'in (mm)', kind: 'input', hint: 'mean collar radius' },
          { id: 'Tcol', symbol: 'f_c F R_c', label: 'Collar torque', unit: 'lb·in (N·mm)', kind: 'calc', compute: v => H.has(v, 'F', 'fc') ? (v.fc === 0 ? 0 : (H.has(v, 'Rc') ? v.fc * v.F * v.Rc : undefined)) : undefined },
          { id: 'Tut', symbol: 'T_{u,tot}', label: 'Total raising torque', unit: 'lb·in (N·mm)', kind: 'calc', compute: v => H.has(v, 'Tu', 'Tcol') ? v.Tu + v.Tcol : undefined },
          { id: 'Tdt', symbol: 'T_{d,tot}', label: 'Total lowering torque', unit: 'lb·in (N·mm)', kind: 'calc', compute: v => H.has(v, 'Td', 'Tcol') ? v.Td + v.Tcol : undefined },
        ] },
    ] },

    { title: 'Step 6–7: Efficiency, speed and power', steps: [
      { id: 'eff', title: 'Efficiency', eq: '17-7', formula: "e = \\frac{T'}{T_u} = \\frac{F L}{2\\pi T_u}",
        text: "\\(T' = FL/2\\pi\\) is the torque with f = 0 (Eq. 17-6). Single-thread Acme screws are typically ≈ 30 % or less; ball screws ≈ 90 %.",
        vars: [
          { id: 'e', symbol: 'e', label: 'Efficiency', kind: 'calc', digits: 3, compute: v => H.has(v, 'F', 'L', 'Tut') && v.Tut > 0 ? v.F * v.L / (2 * Math.PI * v.Tut) : undefined,
            work: v => H.has(v, 'F', 'L', 'Tut') && v.Tut > 0 ? '\\(e = \\dfrac{' + H.fmt(v.F) + '(' + H.fmt(v.L) + ')}{2\\pi(' + H.fmt(v.Tut) + ')} = ' + H.fmt(v.e, 3) + ' = ' + H.fmt(100 * v.e, 3) + '\\%\\)' : null },
        ] },
      { id: 'spd', title: 'Rotational speed, linear speed and power', formula: 'n = \\frac{V}{L}\\,(60) \\quad\\text{or}\\quad n = \\frac{63\\,000\\,P}{T_u} \\qquad P = \\frac{T_u\\, n}{63\\,000}',
        text: 'Two ways round: (a) required linear speed V → n → power (Mott Example 17-2); (b) given input power P → max speed n → V = nL/60 (Fizz step 7). Fill in either V or P. SI: \\(P_{kW} = T_{N·mm}\\, n / 9.549\\times10^{6}\\).',
        vars: [
          { id: 'units', label: 'Unit system', kind: 'choice', type: 'text', options: [{ label: 'US: in/s, lb·in, hp', value: 'US' }, { label: 'SI: mm/s, N·mm, kW', value: 'SI' }], default: 'US' },
          { id: 'Vreq', symbol: 'V', label: 'Required linear speed (if given)', unit: 'in/s (mm/s)', kind: 'input', hint: 'e.g. 15 in / 12 s = 1.25 in/s' },
          { id: 'Pin', symbol: 'P_{in}', label: 'Available input power (if given)', unit: 'hp (kW)', kind: 'input' },
          { id: 'n', symbol: 'n', label: 'Screw speed', unit: 'rpm', kind: 'calc', compute: v => {
              const k = v.units === 'SI' ? 9.549e6 : 63000;
              if (H.has(v, 'Vreq', 'L') && v.L > 0) return v.Vreq / v.L * 60;
              if (H.has(v, 'Pin', 'Tut') && v.Tut > 0) return k * v.Pin / v.Tut; return undefined; },
            work: v => (H.has(v, 'Vreq', 'L') && v.L > 0) ? '\\(n = \\dfrac{' + H.fmt(v.Vreq) + '}{' + H.fmt(v.L) + '}(60) = ' + H.fmt(v.n) + '\\ \\text{rpm}\\)' : ((H.has(v, 'Pin', 'Tut') && v.Tut > 0) ? '\\(n = \\dfrac{' + (v.units === 'SI' ? '9.549\\times10^6' : '63\\,000') + '(' + H.fmt(v.Pin) + ')}{' + H.fmt(v.Tut) + '} = ' + H.fmt(v.n) + '\\ \\text{rpm}\\)' : null) },
          { id: 'V', symbol: 'V', label: 'Linear speed of load', unit: 'in/s (mm/s)', kind: 'calc', compute: v => H.has(v, 'n', 'L') ? v.n * v.L / 60 : undefined },
          { id: 'P', symbol: 'P', label: 'Power to drive the screw', unit: 'hp (kW)', kind: 'calc', digits: 4, compute: v => H.has(v, 'Tut', 'n') ? v.Tut * v.n / (v.units === 'SI' ? 9.549e6 : 63000) : undefined,
            work: v => H.has(v, 'Tut', 'n') ? '\\(P = \\dfrac{' + H.fmt(v.Tut) + '(' + H.fmt(v.n) + ')}{' + (v.units === 'SI' ? '9.549\\times10^6' : '63\\,000') + '} = ' + H.fmt(v.P) + '\\)' : null },
        ],
        after: v => {
          if (v.Tu === undefined) return '';
          const okA = !H.has(v, 'Atsel', 'Atreq') || v.Atsel >= v.Atreq; const okSL = !H.has(v, 'f', 'tanlam') || v.f > v.tanlam; const okP = !H.has(v, 'Pin', 'P') || v.P <= v.Pin; const okN = !H.has(v, 'h', 'hr') || v.hr >= v.h;
          const ok = okA && okSL && okP && okN;
          let s = (ok ? '<span class="result-ok"><b>PASS</b></span> — ' : '<span class="result-bad"><b>FAIL</b></span> — ') + (H.has(v, 'D') ? H.fmt(v.D) + '-in screw' + (H.has(v, 'tpi') ? ', ' + H.fmt(v.tpi) + ' tpi' : '') + (H.has(v, 'hr') ? ', nut ' + H.fmt(v.hr) + ' in' : '') + ': ' : '') + 'T<sub>u</sub> = ' + H.fmt(v.Tut) + ', T<sub>d</sub> = ' + H.fmt(v.Tdt) + (v.e !== undefined ? ', e = ' + H.fmt(100 * v.e, 3) + ' %' : '') + (v.P !== undefined ? ', P = ' + H.fmt(v.P) + (v.units === 'SI' ? ' kW' : ' hp') + ' at ' + H.fmt(v.n) + ' rpm' : '') + '.';
          if (!okA) s += ' <span class="result-bad">Tensile-stress area too small — larger screw.</span>';
          if (!okSL) s += ' <span class="result-bad">Not self-locking (f ≤ tan λ).</span>';
          if (!okP) s += ' <span class="result-bad">Required power exceeds the available ' + H.fmt(v.Pin) + '.</span>';
          return s; } },
    ] },
  ],
};
