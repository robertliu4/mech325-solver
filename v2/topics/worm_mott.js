/* Worm gearsets — Mott 6e (Secs. 8-9/8-10 geometry, 10-10 forces/efficiency, 10-11 stress, 10-12 surface durability).
 * Follows the 21-step Fizz (pp 69-74) / Mech (pp 107-113) procedure in Mott notation.
 * Defaults follow the Fizz / Mech guide assumptions (TOPIC.assumptions, cited by guide page; both guides are written "using Mott"),
 *   with the UBC MECH 325 course conventions (v2/COURSE_CONVENTIONS.md §10: Worm_Gears_2024 slides, Module 2 p28–37) where the guides
 *   are silent: gear load W_tG = 2To/DG (Mott Eq. 10-29, both guides; the course's Shigley 15-58 basis × Ka nd ÷ η is a selector option),
 *   Ka = nd = 1, μ = 0.103 e^(−0.110 vs^0.45) + 0.012 (guides' formula), static μ = 0.15 (guides' value at vs = 0) with self-locking when
 *   μ_static > cos φn tan λ (λ < 6°), y from Table 10-5 (0.125 at 20°), bending with the dynamic load Wd = WtG/Kv (guides), Fe ≤ 0.67 DW
 *   (Mott; the guides print DW/3), sand-cast bronze, bronze σall = 24 ksi, heat balance per Shigley 15-49…15-52 with "assume no fan",
 *   ta 70 °F and a 250 °F lubricant limit.
 * Verified against: Mott Ex. 10-9/10-10 (52T, triple-thread, DW 2, Pd 6, 1750 rpm, To 4168 lb·in, Fig. 10-25 μ 0.022, chart Cs 740,
 *   Cm 0.814, Cv 0.265 → λ 14.04°, vs 944, WtG 962, WxG 265, WrG 352, Wf 23.3, PL 0.666 hp, η 90.9 %, σ 14 430 psi, WtR 1123 lb) with
 *   the Mott load basis (now the default); and Module 2 p28–37 (1-thread, NG 56, DW 1.5, Pd 8, φn 20°, 1725 rpm, 1 hp out, Ka 1.25, nd 1,
 *   F 0.5, sand-cast, basis = Shigley/course selected)
 *   with the Shigley/course basis: λ 4.764°, vs 679.8, μ 0.0250, η 75.63 %, W_tG 966, W_tW (= W_xG) 106.4, p_n 0.3913, σ 41 360 psi (Mott Kv
 *   0.955 form; Shigley form 39 500) > 24 ksi FAIL, Cs 786.9, Cm 0.767, Cv 0.312, Fe 0.5 → W_tR 447 < 966 FAIL (the course solution's 1787
 *   used Fe = 2 in by mistake), Hloss 17 570, hCR 0.396 no fan → ts 96.1 °F (course: Amin 1642 used C = 8.5 by mistake; sheet 505.5 in²). */
(function () {
  const r = d => d * Math.PI / 180, fmt = (x, d) => H.fmt(x, d);
  const has = (v, ...a) => H.has(v, ...a);
  const sin = Math.sin, cos = Math.cos, tan = Math.tan, sq = Math.sqrt;
  const STD_P = [1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 32, 48];   // Table 8-3 diametral pitches
  const STD_M = [0.3, 0.4, 0.5, 0.8, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 25];  // Table 8-4 standard modules
  // standard diametral pitch list with Use buttons; ★ = the pitch in use
  const stdTable = (v, o) => {
    const cur = v[o.Pd], N = v[o.N], S = o.sym || 'P_d';
    const near = (x, l) => l.reduce((a, b) => Math.abs(b - x) < Math.abs(a - x) ? b : a);
    const rows = o.list.map(p => ({ cells: [H.fmt(p), H.fmt(25.4 / p, 3), H.fmt(near(25.4 / p, o.mods)), N > 0 ? H.fmt(N / p, 4) : '—'], pick: p === cur, set: { [o.Pd]: p } }));
    return H.table(['\\(' + S + '\\)', '\\(m = 25.4/' + S + '\\) (mm)', 'nearest std. \\(m\\)', o.dlabel || '\\(d_P\\) (in)'], rows, {
      caption: 'Standard diametral pitches (' + o.ref + ')' + (o.list.indexOf(cur) >= 0 ? ' — ★ = in use' : (cur > 0 ? ' — ' + H.fmt(cur) + ' is not in this list' : '')),
      note: '“Use” sets \\(' + S + '\\); a given module converts with \\(' + S + ' = 25.4/m\\) (' + o.mref + ').' });
  };

  window.TOPIC = {
    id: 'worm', book: 'mott',
    title: 'Worm Gearsets — Geometry, Forces, Efficiency & AGMA Rating',
    subtitle: 'Mott Secs. 8-9 … 8-10, 10-10 … 10-12 (AGMA 6034-B92) · the 21-step Fizz / Mech guide procedure',
    sibling: 'worm_shigley.html',
    intro: 'Steel worm driving a bronze wormgear on 90° shafts, Mott notation (the guides’ 21 steps): lead angle → \\(C\\) → \\(v_s\\), \\(\\mu\\) → forces with directions → friction loss, input power, efficiency → bending (Eq. 10-37) → \\(C_s\\), \\(C_m\\), \\(C_v\\) and \\(W_{tR}\\) (Eq. 10-42) → heat balance (course add-on). Yellow = chart reading (auto estimate until you type yours). Example = Mott Ex. 8-4, 10-9 and 10-10 (52T gear, triple-thread worm, 1750 rpm, \\(T_o\\) = 4168 lb·in).',
    example: { NG: 52, NW: 3, DW: 2.0, Pd: 6, phiGiven: 20, phiType: 'transverse', nW: 1750, To: 4168, F: 1.25, mat: 'sand', basis: 'mott', Ka: 1, nd: 1, mu: 0.022, Cs: 740, Cm: 0.814, Cv: 0.265, fstat: 0.15, fan: 0, ta: 70, tmax: 250, sall: 24000 },

    assumptions: [
      { text: 'Pressure angle 20° unless given; a transverse angle converts with \\(\\tan\\phi_n = \\tan\\phi_t\\cos\\lambda\\)', src: 'Fizz p.70 · Mech p.108', var: 'phiGiven' },
      { text: '\\(W_{tG} = 2T_o/D_G\\) (Eq. 10-29, both guides); the course Module 2 example uses Shigley 15-58, \\(33\\,000n_dP_oK_a/(v_{tG}\\eta)\\)', src: 'Fizz p.72 · Mech p.110', var: 'basis' },
      { text: '\\(K_a = n_d = 1\\) unless given (course example \\(K_a\\) = 1.25)', src: 'Fizz p.72 · Mech p.110 · Mott Sec. 10-12', var: 'Ka' },
      { text: 'Running \\(\\mu\\) from Eqs. 10-26/10-27 (Fig. 10-25)', src: 'Fizz p.72 · Mech p.110', var: 'mu' },
      { text: 'Static \\(\\mu\\) = 0.15 for the self-locking test \\(\\mu_{static} > \\cos\\phi_n\\tan\\lambda\\); rule of thumb \\(\\lambda\\) < 6° (Mott: 5°)', src: 'Fizz p.72 · Mech p.110 · course Worm Gears s11', var: 'fstat' },
      { text: 'Efficiency depends on \\(\\mu\\), \\(\\phi_n\\) and \\(\\lambda\\); it drops sharply for \\(\\lambda\\) below about 20°', src: 'course Worm Gears s10 · RAP quiz', step: 'f7' },
      { text: '\\(y\\) from Table 10-5 by \\(\\phi_n\\) (0.125 at 20°)', src: 'Fizz p.73 · Mech p.111', var: 'y' },
      { text: 'Bending with the dynamic load \\(W_d = W_{tG}/K_v\\), \\(K_v = 1200/(1200 + v_{tG})\\); the course also quotes the Shigley form without \\(K_v\\)', src: 'Fizz p.73 · Mech p.111', step: 's' },
      { text: '\\(\\sigma_{all}\\) = 24 ksi phosphor bronze (manganese bronze 17 ksi)', src: 'course Worm Gears s19 · Mott Sec. 10-11', var: 'sall' },
      { text: 'Sand-cast bronze for \\(C_s\\) unless stated; \\(D_G\\) as the mean gear diameter', src: 'Fizz p.74 · Mech p.112 · Mech p.113', var: 'mat' },
      { text: 'No face width given → \\(F_G = \\sqrt{D_{oW}^2 - D_W^2} \\approx 6/P_d\\) (Table 8-9: \\(a = 1/P_d\\), \\(h_t = 2.157/P_d\\))', src: 'Fizz p.71 · Mech p.108', var: 'F' },
      { text: '\\(F_e = \\min(F,\\ 0.67D_W)\\) (Eq. 10-42, Ex. 10-10); both guides print \\(D_W/3\\)', src: 'Fizz p.74 · Mech p.113', var: 'Fe' },
      { text: 'Pitting check passes when \\(W_{tR} > W_{tG}\\)', src: 'Fizz p.74 · Mech p.113', step: 'w' },
      { text: 'Heat check: no fan, \\(t_a\\) = 70 °F, oil limit 250 °F, \\(A_{min} = 43.2C^{1.7}\\) if no case area is given', src: 'course Module 2 p36 · Worm Gears s20', var: 'fan' },
    ],

    figures: [
      { id: 'f8-24', ref: 'Figure 8-24', title: 'Single-enveloping wormgear set — \\(D_W\\), \\(D_G\\), \\(C\\), \\(L\\), \\(P_x\\), \\(F_G\\), \\(F_W\\), \\(D_t\\)', src: 'figures/mott/fig8-24.png', page: 348 },
      { id: 'f8-27', ref: 'Figure 8-27', title: 'Lead angle: unwrapped thread, \\(\\tan\\lambda = L/(\\pi D_W)\\)', src: 'figures/mott/fig8-27.png', page: 350 },
      { id: 't8-9', ref: 'Table 8-9', title: 'Typical tooth dimensions for worms and wormgears', src: 'figures/mott/table8-9.png', page: 352 },
      { id: 'f10-24', ref: 'Figure 10-24', title: 'Forces on a worm and a wormgear (front and side views)', src: 'figures/mott/fig10-24.png', page: 474,
        note: '\\(W_{tG} = W_{xW}\\), \\(W_{xG} = W_{tW}\\), \\(W_{rG} = W_{rW}\\) (Eq. 10-23), each pair opposite in direction.' },
      { id: 'f10-25', ref: 'Figure 10-25', title: 'Coefficient of friction \\(\\mu\\) vs sliding velocity (steel worm / bronze gear)', src: 'figures/mott/fig10-25.png', page: 475, note: 'Eqs. 10-26/10-27 are the curve; \\(\\mu\\) = 0.15 at \\(v_s\\) = 0.' },
      { id: 'f10-26', ref: 'Figure 10-26', title: 'Efficiency vs lead angle (\\(\\phi_n\\) = 20°)', src: 'figures/mott/fig10-26.png', page: 476 },
      { id: 't10-5', ref: 'Table 10-5', title: 'Approximate Lewis form factor y for wormgear teeth', src: 'figures/mott/table10-5.png', page: 478 },
      { id: 'f10-27', ref: 'Figure 10-27', title: 'Materials factor \\(C_s\\) vs mean gear diameter (\\(C\\) > 3 in)', src: 'figures/mott/fig10-27.png', page: 479, note: 'Eqs. 10-43 … 10-45; \\(D_m \\approx D_G\\) for standard addendum.' },
      { id: 'f10-28', ref: 'Figure 10-28', title: 'Ratio correction factor \\(C_m\\) vs gear ratio \\(m_G\\)', src: 'figures/mott/fig10-28.png', page: 479, note: 'Eqs. 10-46 … 10-48.' },
      { id: 'f10-29', ref: 'Figure 10-29', title: 'Velocity factor \\(C_v\\) vs sliding velocity', src: 'figures/mott/fig10-29.png', page: 480, note: 'Eqs. 10-49 … 10-51.' },
      { id: 'f13-36', ref: 'Figure 13-36', title: 'Shigley\'s 3-D view of the forces on the worm pitch cylinder (helps with directions)', src: 'figures/shigley/fig13-36.png', page: 740, book: 'shigley' },
      // ---- course-only slides (Worm_Gears_2024.pdf) ----
      { id: 'csl', ref: 'Worm Gears s11', book: 'course', title: 'Self-locking wormgear sets: \\(\\lambda\\) < 6°, static \\(\\mu \\approx 0.15\\), criterion \\(\\mu_{static} > \\cos\\phi_n\\tan\\lambda\\)', src: 'figures/course/worm_self_locking_course.png' },
      { id: 'cbend', ref: 'Worm Gears s19', book: 'course', title: 'Bending stress in worm-gear teeth: \\(\\sigma = W_{tG}/(p_nF_ey)\\), \\(y\\) = 0.125 at 20°, \\(\\sigma_{all}\\) = 24 ksi; “Mott uses a modified dynamic load”', src: 'figures/course/worm_bending_course.png' },
      { id: 'cheat', ref: 'Worm Gears s20', book: 'course', title: 'Heat issues (Shigley 15-49 … 15-52): \\(H_{loss}\\), \\(\\hbar_{CR}\\) with/without fan, sump temperature, AGMA minimum area', src: 'figures/course/worm_heat_course.png', note: 'Module 2 p36: “better to assume no fan”. Not in Mott.' },
    ],

    sections: [
      { title: '0 · Given', steps: [
        { id: 'in', title: 'Gear set and duty', fig: ['f8-24'],
          text: 'Enter the pressure angle as given and say which plane — the force equations need the normal angle \\(\\phi_n\\) (Eq. 8-26). Give either \\(T_o\\) or \\(P_o\\).',
          vars: [
            { id: 'NG', symbol: 'N_G', label: 'Wormgear teeth', kind: 'input' },
            { id: 'NW', symbol: 'N_W', label: 'Worm threads (starts)', kind: 'input', hint: '1, 2, 3, 4 …' },
            { id: 'DW', symbol: 'D_W', label: 'Worm pitch diameter', unit: 'in', kind: 'input' },
            { id: 'Pd', symbol: 'P_d', label: 'Diametral pitch of gear', unit: 'teeth/in', kind: 'input', hint: 'blank if \\(D_G\\) is given; standard list below' },
            { id: 'DGin', symbol: 'D_G', label: 'Gear pitch diameter (if given instead of \\(P_d\\))', unit: 'in', kind: 'input' },
            { id: 'phiGiven', symbol: '\\phi', label: 'Pressure angle given', kind: 'choice', options: [{ label: '14.5°', value: 14.5 }, { label: '20°', value: 20 }, { label: '25°', value: 25 }, { label: '30°', value: 30 }], default: 20 },
            { id: 'phiType', symbol: '', label: '… measured in which plane?', kind: 'choice', type: 'text', options: [{ label: 'normal plane', value: 'normal' }, { label: 'transverse plane', value: 'transverse' }], default: 'normal' },
            { id: 'nW', symbol: 'n_W', label: 'Worm speed', unit: 'rpm', kind: 'input' },
            { id: 'To', symbol: 'T_o', label: 'Output torque (if given)', unit: 'lb·in', kind: 'input' },
            { id: 'PoIn', symbol: 'P_o', label: 'Output power (if given instead)', unit: 'hp', kind: 'input' },
            { id: 'F', symbol: 'F', label: 'Wormgear face width', unit: 'in', kind: 'input', hint: 'auto = \\(\\sqrt{D_{oW}^2 - D_W^2}\\) (Table 8-9 below)',
              auto: v => has(v, 'FGrec') ? v.FGrec : undefined },
            { id: 'mat', symbol: '', label: 'Bronze type (for \\(C_s\\))', kind: 'choice', type: 'text', options: [{ label: 'Sand-cast bronze (course: "most common")', value: 'sand' }, { label: 'Static-chill-cast or forged bronze', value: 'chill' }, { label: 'Centrifugally cast bronze', value: 'centrifugal' }], default: 'sand' },
            { id: 'basis', symbol: '', label: 'Gear load basis', kind: 'choice', type: 'text', options: [{ label: 'Mott 10-29 / guides: 2To/DG', value: 'mott' }, { label: 'Shigley 15-58 / course Module 2: divide by efficiency', value: 'shigley' }], default: 'mott', hint: 'the course example applies \\(K_a\\), \\(n_d\\) and divides by \\(\\eta\\)' },
            { id: 'Ka', symbol: 'K_a', label: 'Application (service) factor on the output power', kind: 'input', default: 1, hint: '1 unless given; course example 1.25' },
            { id: 'nd', symbol: 'n_d', label: 'Design factor', kind: 'input', default: 1, hint: '1 unless stated' },
          ],
          after: v => stdTable(v, { Pd: 'Pd', N: 'NG', list: STD_P, mods: STD_M, ref: 'Mott Table 8-3', mref: 'Table 8-4', dlabel: '\\(D_G\\) (in)' }) },
        { id: 'kin', title: 'Worm turns → gear turns (kinematics)', eq: '8-25',
          text: 'Each worm revolution advances the gear by \\(N_W\\) teeth, so gear turns = worm turns \\(\\times N_W/N_G\\). Sense: the worm acts as a screw and the gear tooth in mesh moves along the worm axis like a nut (step 6).',
          formula: '\\text{gear turns} = \\text{worm turns}\\cdot\\frac{N_W}{N_G},\\qquad n_G = \\frac{n_W N_W}{N_G}',
          vars: [
            { id: 'wrev', symbol: '\\text{worm turns}', label: 'Worm revolutions (if asked)', unit: 'rev', kind: 'input', hint: 'e.g. 24 turns of a 2-start worm on a 96T gear' },
            { id: 'grev', symbol: '\\text{gear turns}', label: 'Gear revolutions', unit: 'rev', kind: 'calc', compute: v => has(v, 'wrev', 'NW', 'NG') ? v.wrev * v.NW / v.NG : undefined,
              work: v => has(v, 'wrev', 'NW', 'NG') ? '\\(' + fmt(v.wrev) + '(' + fmt(v.NW) + ')/' + fmt(v.NG) + ' = ' + fmt(v.wrev * v.NW / v.NG) + '\\) rev (' + fmt(360 * v.wrev * v.NW / v.NG) + '°)' : null },
          ] },
      ] },

      { title: '1-2 · Lead, lead angle, center distance (Sec. 8-10)', steps: [
        { id: 'g1', title: 'Step 1 — pitches, lead and lead angle', eq: '8-20 … 8-24', fig: ['f8-27'],
          formula: 'p = \\frac{\\pi}{P_d} = \\frac{\\pi D_G}{N_G},\\quad P_x = p,\\quad L = N_W P_x,\\quad \\lambda = \\tan^{-1}\\frac{L}{\\pi D_W}',
          vars: [
            { id: 'DG', symbol: 'D_G', label: 'Gear pitch diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'DGin') ? v.DGin : (has(v, 'NG', 'Pd') ? v.NG / v.Pd : undefined), work: v => has(v, 'NG', 'Pd') && !has(v, 'DGin') ? '\\(D_G = ' + v.NG + '/' + fmt(v.Pd) + ' = ' + fmt(v.NG / v.Pd) + '\\) in' : null },
            { id: 'PdC', symbol: 'P_d', label: 'Diametral pitch used', unit: 'teeth/in', kind: 'calc', compute: v => has(v, 'Pd') ? v.Pd : (has(v, 'NG', 'DGin') ? v.NG / v.DGin : undefined) },
            { id: 'p', symbol: 'p', label: 'Circular pitch', unit: 'in', kind: 'calc', compute: v => has(v, 'PdC') ? Math.PI / v.PdC : undefined, work: v => has(v, 'PdC') ? '\\(p = \\pi/' + fmt(v.PdC) + ' = ' + fmt(Math.PI / v.PdC) + '\\) in' : null },
            { id: 'Px', symbol: 'P_x', label: 'Axial pitch of worm (= p)', unit: 'in', kind: 'calc', compute: v => has(v, 'p') ? v.p : undefined },
            { id: 'L', symbol: 'L', label: 'Lead', unit: 'in', kind: 'calc', compute: v => has(v, 'NW', 'Px') ? v.NW * v.Px : undefined, work: v => has(v, 'NW', 'Px') ? '\\(L = ' + v.NW + '(' + fmt(v.Px) + ') = ' + fmt(v.NW * v.Px) + '\\) in' : null },
            { id: 'lam', symbol: '\\lambda', label: 'Lead angle', unit: '°', kind: 'calc', compute: v => has(v, 'L', 'DW') ? H.deg(Math.atan(v.L / (Math.PI * v.DW))) : undefined,
              work: v => has(v, 'L', 'DW') ? '\\(\\lambda = \\tan^{-1}\\frac{' + fmt(v.L) + '}{\\pi(' + fmt(v.DW) + ')} = ' + fmt(H.deg(Math.atan(v.L / (Math.PI * v.DW)))) + '^\\circ\\)' : null },
            { id: 'phin', symbol: '\\phi_n', label: 'Normal pressure angle', unit: '°', kind: 'calc', compute: v => has(v, 'phiGiven', 'phiType', 'lam') ? (v.phiType === 'transverse' ? H.deg(Math.atan(tan(r(v.phiGiven)) * cos(r(v.lam)))) : v.phiGiven) : undefined,
              work: v => has(v, 'phiGiven', 'phiType', 'lam') && v.phiType === 'transverse' ? '\\(\\phi_n = \\tan^{-1}(\\tan ' + v.phiGiven + '^\\circ\\cos ' + fmt(v.lam) + '^\\circ) = ' + fmt(H.deg(Math.atan(tan(r(v.phiGiven)) * cos(r(v.lam))))) + '^\\circ\\)' : null },
          ],
          after: v => has(v, 'lam') ? (v.lam < 6 ? '<span class="result-ok">\\(\\lambda = ' + fmt(v.lam) + '^\\circ\\) is below 6°: self-locking by the course rule of thumb (confirm with \\(\\mu_{static}\\) below)</span>' : '<span class="muted">\\(\\lambda = ' + fmt(v.lam) + '^\\circ\\) is 6° or more: probably not self-locking (Mott: 5°); check \\(\\mu_{static}\\) below — use a brake if back-driving must be prevented.</span>') : '' },
        { id: 'g2', title: 'Step 2 — center distance, worm-diameter check, velocity ratio', eq: '8-25, 8-27',
          formula: 'C = \\frac{D_W + D_G}{2},\\qquad \\frac{C^{0.875}}{3.0} \\le D_W \\le \\frac{C^{0.875}}{1.6},\\qquad VR = m_G = \\frac{n_W}{n_G} = \\frac{N_G}{N_W}',
          vars: [
            { id: 'C', symbol: 'C', label: 'Center distance', unit: 'in', kind: 'calc', compute: v => has(v, 'DW', 'DG') ? (v.DW + v.DG) / 2 : undefined, work: v => has(v, 'DW', 'DG') ? '\\(C = (' + fmt(v.DW) + ' + ' + fmt(v.DG) + ')/2 = ' + fmt((v.DW + v.DG) / 2) + '\\) in' : null },
            { id: 'DWlo', symbol: 'D_{W,min}', label: 'Lower limit \\(C^{0.875}/3.0\\)', unit: 'in', kind: 'calc', compute: v => has(v, 'C') ? Math.pow(v.C, 0.875) / 3 : undefined },
            { id: 'DWhi', symbol: 'D_{W,max}', label: 'Upper limit \\(C^{0.875}/1.6\\)', unit: 'in', kind: 'calc', compute: v => has(v, 'C') ? Math.pow(v.C, 0.875) / 1.6 : undefined },
            { id: 'mG', symbol: 'm_G', label: 'Velocity ratio VR', kind: 'calc', compute: v => has(v, 'NG', 'NW') ? v.NG / v.NW : undefined },
            { id: 'nG', symbol: 'n_G', label: 'Gear speed', unit: 'rpm', kind: 'calc', compute: v => has(v, 'nW', 'mG') ? v.nW / v.mG : undefined, work: v => has(v, 'nW', 'mG') ? '\\(n_G = ' + fmt(v.nW) + '/' + fmt(v.mG) + ' = ' + fmt(v.nW / v.mG) + '\\) rpm' : null },
          ],
          after: v => has(v, 'DW', 'DWlo', 'DWhi') ? (v.DW >= v.DWlo && v.DW <= v.DWhi ? '<span class="result-ok">\\(D_W\\) within the recommended range ' + fmt(v.DWlo) + ' … ' + fmt(v.DWhi) + ' in</span>' : '<span class="muted">\\(D_W\\) = ' + fmt(v.DW) + ' in is outside the Eq. 8-27 range ' + fmt(v.DWlo) + ' … ' + fmt(v.DWhi) + ' in (common for small commercial sets; note it).</span>') : '' },
        { id: 'g3', title: 'Tooth dimensions (Table 8-9) and face widths', fig: ['t8-9', 'f8-24'],
          formula: 'a = \\frac{1}{P_d},\\ h_t = \\frac{2.157}{P_d},\\ b = h_t - a,\\ D_{rW} = D_W - 2b,\\ D_{oW} = D_W + 2a,\\ D_{rG} = D_G - 2b,\\ D_t = D_G + 2a,\\ F_G = \\sqrt{D_{oW}^2 - D_W^2} \\approx \\frac{6}{P_d},\\ F_W = 2\\sqrt{(D_t/2)^2 - (D_G/2 - a)^2}',
          vars: [
            { id: 'a', symbol: 'a', label: 'Addendum', unit: 'in', kind: 'calc', compute: v => has(v, 'PdC') ? 1 / v.PdC : undefined },
            { id: 'ht', symbol: 'h_t', label: 'Whole depth', unit: 'in', kind: 'calc', compute: v => has(v, 'PdC') ? 2.157 / v.PdC : undefined },
            { id: 'b', symbol: 'b', label: 'Dedendum', unit: 'in', kind: 'calc', compute: v => has(v, 'ht', 'a') ? v.ht - v.a : undefined },
            { id: 'DrW', symbol: 'D_{rW}', label: 'Worm root diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'DW', 'b') ? v.DW - 2 * v.b : undefined },
            { id: 'DoW', symbol: 'D_{oW}', label: 'Worm outside diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'DW', 'a') ? v.DW + 2 * v.a : undefined },
            { id: 'DrG', symbol: 'D_{rG}', label: 'Gear root diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'DG', 'b') ? v.DG - 2 * v.b : undefined },
            { id: 'Dt', symbol: 'D_t', label: 'Gear throat diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'DG', 'a') ? v.DG + 2 * v.a : undefined },
            { id: 'FGrec', symbol: 'F_G', label: 'Recommended gear face width \\(\\sqrt{D_{oW}^2 - D_W^2}\\)', unit: 'in', kind: 'calc', compute: v => has(v, 'DoW', 'DW') ? sq(v.DoW * v.DoW - v.DW * v.DW) : undefined },
            { id: 'FG6', symbol: '6/P_d', label: 'Approximate rule \\(6/P_d\\)', unit: 'in', kind: 'calc', compute: v => has(v, 'PdC') ? 6 / v.PdC : undefined },
            { id: 'FW', symbol: 'F_W', label: 'Worm face length', unit: 'in', kind: 'calc', compute: v => has(v, 'Dt', 'DG', 'a') ? 2 * sq(Math.pow(v.Dt / 2, 2) - Math.pow(v.DG / 2 - v.a, 2)) : undefined },
          ] },
      ] },

      { title: '3-5 · Speeds and coefficient of friction (Sec. 10-10)', steps: [
        { id: 'v', title: 'Steps 3-4 — pitch-line speed of the gear, sliding speed', eq: '10-24',
          text: 'Worm meshes are predominantly sliding (\\(v_s > v_{tW}\\)); spur and bevel teeth mostly roll.',
          formula: 'v_{tG} = \\frac{\\pi D_G n_G}{12},\\qquad v_{tW} = \\frac{\\pi D_W n_W}{12},\\qquad v_s = \\frac{v_{tG}}{\\sin\\lambda} = \\frac{v_{tW}}{\\cos\\lambda}',
          vars: [
            { id: 'vtG', symbol: 'v_{tG}', label: 'Gear pitch-line speed', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'DG', 'nG') ? Math.PI * v.DG * v.nG / 12 : undefined, work: v => has(v, 'DG', 'nG') ? '\\(v_{tG} = \\pi(' + fmt(v.DG) + ')(' + fmt(v.nG) + ')/12 = ' + fmt(Math.PI * v.DG * v.nG / 12) + '\\) ft/min' : null },
            { id: 'vtW', symbol: 'v_{tW}', label: 'Worm pitch-line speed', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'DW', 'nW') ? Math.PI * v.DW * v.nW / 12 : undefined },
            { id: 'vs', symbol: 'v_s', label: 'Sliding velocity', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'vtG', 'lam') ? v.vtG / sin(r(v.lam)) : undefined, work: v => has(v, 'vtG', 'lam') ? '\\(v_s = ' + fmt(v.vtG) + '/\\sin ' + fmt(v.lam) + '^\\circ = ' + fmt(v.vtG / sin(r(v.lam))) + '\\) ft/min' : null },
          ] },
        { id: 'mu', title: 'Step 5 — coefficient of friction and self-locking test', eq: '10-26, 10-27', fig: ['f10-25', 'csl'],
          text: 'Running \\(\\mu\\) from Eqs. 10-26/10-27 (= Shigley 15-38); the static value \\(\\mu\\) of about 0.15 is used for the self-locking test \\(\\mu_{static} > \\cos\\phi_n\\tan\\lambda\\) (Worm Gears s11).',
          formula: '\\mu = \\begin{cases}0.150 & v_s = 0\\\\ 0.124e^{-0.074v_s^{0.645}} & 0 \\lt  v_s \\lt  10\\\\ 0.103e^{-0.110v_s^{0.450}} + 0.012 & v_s \\ge 10\\ \\text{ft/min}\\end{cases}',
          vars: [
            { id: 'mu', symbol: '\\mu', label: 'Coefficient of friction', kind: 'lookup', fig: 'f10-25', auto: v => has(v, 'vs') ? muFit(v.vs) : undefined, hint: 'auto = Eqs. 10-26/10-27; Ex. 10-9 reads 0.022',
              work: v => has(v, 'vs') ? '\\(\\mu = ' + (v.vs >= 10 ? '0.103e^{-0.110(' + fmt(v.vs) + ')^{0.450}} + 0.012' : '0.124e^{-0.074(' + fmt(v.vs) + ')^{0.645}}') + ' = ' + fmt(muFit(v.vs), 3) + '\\)' : null },
            { id: 'fstat', symbol: '\\mu_{static}', label: 'Static coefficient of friction', kind: 'input', default: 0.15, hint: 'about 0.15 steel/bronze (Fig. 10-25 at \\(v_s\\) = 0)' },
            { id: 'lock', symbol: '\\cos\\phi_n\\tan\\lambda', label: 'Self-locking criterion (compare with \\(\\mu_{static}\\))', kind: 'calc', compute: v => has(v, 'phin', 'lam') ? cos(r(v.phin)) * tan(r(v.lam)) : undefined,
              work: v => has(v, 'phin', 'lam') ? '\\(\\cos ' + fmt(v.phin) + '^\\circ\\tan ' + fmt(v.lam) + '^\\circ = ' + fmt(cos(r(v.phin)) * tan(r(v.lam)), 3) + '\\)' : null },
          ],
          after: v => has(v, 'lock', 'fstat', 'lam') ? (v.fstat > v.lock ? '<span class="result-ok">Self-locking: \\(\\mu_{static} = ' + fmt(v.fstat) + ' > \\cos\\phi_n\\tan\\lambda = ' + fmt(v.lock, 3) + '\\) — the gear cannot back-drive the worm</span>' : '<span class="result-bad">Not self-locking: \\(\\mu_{static} = ' + fmt(v.fstat) + ' < \\cos\\phi_n\\tan\\lambda = ' + fmt(v.lock, 3) + '\\) — the gear can back-drive the worm</span>') : '' },
      ] },

      { title: '6-10 · Forces, friction loss, input power, efficiency', steps: [
        { id: 'f6', title: 'Step 6 — forces on the wormgear', eq: '10-28 … 10-31', fig: ['f10-24', 'f13-36'],
          formula: 'T_o = \\frac{63\\,000P_o}{n_G},\\quad W_{tG} = \\frac{2T_o K_a n_d}{D_G}\\ (\\text{Mott})\\ \\text{or}\\ \\frac{33\\,000\\,n_d P_o K_a}{v_{tG}\\,\\eta}\\ (\\text{Shigley 15-58, course}),\\quad W_{xG} = W_{tG}\\frac{\\cos\\phi_n\\sin\\lambda + \\mu\\cos\\lambda}{\\cos\\phi_n\\cos\\lambda - \\mu\\sin\\lambda},\\quad W_{rG} = \\frac{W_{tG}\\sin\\phi_n}{\\cos\\phi_n\\cos\\lambda - \\mu\\sin\\lambda}',
          text: 'Equal and opposite pairs (Eq. 10-23): \\(W_{tW} = W_{xG}\\), \\(W_{xW} = W_{tG}\\), \\(W_{rW} = W_{rG}\\). \\(W_{tG}\\) acts with the gear rotation (driven), \\(W_{rG}\\) toward the gear axis; for senses treat the worm as a screw pushing the gear tooth like a nut.',
          vars: [
            { id: 'ToC', symbol: 'T_o', label: 'Output torque', unit: 'lb·in', kind: 'calc', compute: v => has(v, 'To') ? v.To : (has(v, 'PoIn', 'nG') ? 63000 * v.PoIn / v.nG : undefined) },
            { id: 'Po', symbol: 'P_o', label: 'Output power', unit: 'hp', kind: 'calc', compute: v => has(v, 'PoIn') ? v.PoIn : (has(v, 'To', 'nG') ? v.To * v.nG / 63000 : undefined), work: v => has(v, 'To', 'nG') && !has(v, 'PoIn') ? '\\(P_o = T_o n_G/63\\,000 = ' + fmt(v.To) + '(' + fmt(v.nG) + ')/63\\,000 = ' + fmt(v.To * v.nG / 63000, 3) + '\\) hp' : null },
            { id: 'etaF', symbol: '\\eta', label: 'Efficiency from Eq. 10-36 (for the course load basis)', kind: 'calc', compute: v => has(v, 'phin', 'mu', 'lam') ? (cos(r(v.phin)) - v.mu * tan(r(v.lam))) / (cos(r(v.phin)) + v.mu / tan(r(v.lam))) : undefined,
              work: v => has(v, 'phin', 'mu', 'lam') ? '\\(\\eta = \\frac{\\cos ' + fmt(v.phin) + '^\\circ - ' + fmt(v.mu, 3) + '\\tan ' + fmt(v.lam) + '^\\circ}{\\cos ' + fmt(v.phin) + '^\\circ + ' + fmt(v.mu, 3) + '/\\tan ' + fmt(v.lam) + '^\\circ} = ' + fmt((cos(r(v.phin)) - v.mu * tan(r(v.lam))) / (cos(r(v.phin)) + v.mu / tan(r(v.lam)))) + '\\)' : null },
            { id: 'WtG0', symbol: '2T_o K_a n_d/D_G', label: 'Gear tangential force, Mott basis', unit: 'lb', kind: 'calc', compute: v => has(v, 'ToC', 'DG', 'Ka', 'nd') ? 2 * v.ToC * v.Ka * v.nd / v.DG : undefined, work: v => has(v, 'ToC', 'DG', 'Ka', 'nd') ? '\\(2(' + fmt(v.ToC) + ')(' + fmt(v.Ka) + ')(' + fmt(v.nd) + ')/' + fmt(v.DG) + ' = ' + fmt(2 * v.ToC * v.Ka * v.nd / v.DG) + '\\) lb' : null },
            { id: 'WtG', symbol: 'W_{tG}', label: 'Tangential force on gear used below (\\(= W_{xW}\\))', unit: 'lb', kind: 'calc', compute: v => has(v, 'WtG0', 'basis') ? (v.basis === 'shigley' ? (has(v, 'etaF') ? v.WtG0 / v.etaF : undefined) : v.WtG0) : undefined,
              work: v => has(v, 'WtG0', 'basis') ? (v.basis === 'shigley' && has(v, 'etaF') ? '\\(W_{tG} = \\frac{33\\,000\\,n_d P_o K_a}{v_{tG}\\,\\eta} = ' + fmt(v.WtG0) + '/' + fmt(v.etaF) + ' = ' + fmt(v.WtG0 / v.etaF) + '\\) lb (Shigley 15-58 / course)' : '\\(W_{tG} = ' + fmt(v.WtG0) + '\\) lb (Mott 10-29)') : null },
            { id: 'den', symbol: '', label: '\\(\\cos\\phi_n\\cos\\lambda - \\mu\\sin\\lambda\\) (recurs)', kind: 'calc', compute: v => has(v, 'phin', 'lam', 'mu') ? cos(r(v.phin)) * cos(r(v.lam)) - v.mu * sin(r(v.lam)) : undefined },
            { id: 'WxG', symbol: 'W_{xG}', label: 'Axial force on gear (\\(= W_{tW}\\))', unit: 'lb', kind: 'calc', compute: v => has(v, 'WtG', 'phin', 'lam', 'mu', 'den') ? v.WtG * (cos(r(v.phin)) * sin(r(v.lam)) + v.mu * cos(r(v.lam))) / v.den : undefined,
              work: v => has(v, 'WtG', 'phin', 'lam', 'mu', 'den') ? '\\(W_{xG} = ' + fmt(v.WtG) + '\\left[\\frac{(' + fmt(cos(r(v.phin)), 3) + ')(' + fmt(sin(r(v.lam)), 3) + ') + (' + fmt(v.mu, 3) + ')(' + fmt(cos(r(v.lam)), 3) + ')}{(' + fmt(cos(r(v.phin)), 3) + ')(' + fmt(cos(r(v.lam)), 3) + ') - (' + fmt(v.mu, 3) + ')(' + fmt(sin(r(v.lam)), 3) + ')}\\right] = ' + fmt(v.WtG * (cos(r(v.phin)) * sin(r(v.lam)) + v.mu * cos(r(v.lam))) / v.den) + '\\) lb' : null },
            { id: 'WrG', symbol: 'W_{rG}', label: 'Radial force on gear (\\(= W_{rW}\\))', unit: 'lb', kind: 'calc', compute: v => has(v, 'WtG', 'phin', 'den') ? v.WtG * sin(r(v.phin)) / v.den : undefined,
              work: v => has(v, 'WtG', 'phin', 'den') ? '\\(W_{rG} = \\frac{' + fmt(v.WtG) + '(' + fmt(sin(r(v.phin)), 3) + ')}{' + fmt(v.den, 4) + '} = ' + fmt(v.WtG * sin(r(v.phin)) / v.den) + '\\) lb' : null },
            { id: 'WtW', symbol: 'W_{tW}', label: 'Worm tangential force', unit: 'lb', kind: 'calc', compute: v => has(v, 'WxG') ? v.WxG : undefined },
            { id: 'TW', symbol: 'T_W', label: 'Input torque on worm \\(W_{tW}D_W/2\\)', unit: 'lb·in', kind: 'calc', compute: v => has(v, 'WtW', 'DW') ? v.WtW * v.DW / 2 : undefined },
          ] },
        { id: 'f7', title: 'Steps 7-10 — friction force, power loss, input power, efficiency', eq: '10-32 … 10-36', fig: ['f10-26'],
          text: 'Efficiency depends on \\(\\mu\\), \\(\\phi_n\\) and \\(\\lambda\\) (Fig. 10-26).',
          formula: 'W_f = \\frac{\\mu W_{tG}}{\\cos\\lambda\\cos\\phi_n - \\mu\\sin\\lambda},\\quad P_L = \\frac{v_s W_f}{33\\,000},\\quad P_i = P_o + P_L,\\quad \\eta = \\frac{P_o}{P_i} = \\frac{\\cos\\phi_n - \\mu\\tan\\lambda}{\\cos\\phi_n + \\mu/\\tan\\lambda}',
          vars: [
            { id: 'Wf', symbol: 'W_f', label: 'Friction force', unit: 'lb', kind: 'calc', compute: v => has(v, 'mu', 'WtG', 'den') ? v.mu * v.WtG / v.den : undefined, work: v => has(v, 'mu', 'WtG', 'den') ? '\\(W_f = ' + fmt(v.mu, 3) + '(' + fmt(v.WtG) + ')/' + fmt(v.den, 4) + ' = ' + fmt(v.mu * v.WtG / v.den) + '\\) lb' : null },
            { id: 'PL', symbol: 'P_L', label: 'Power loss due to friction', unit: 'hp', kind: 'calc', compute: v => has(v, 'vs', 'Wf') ? v.vs * v.Wf / 33000 : undefined, work: v => has(v, 'vs', 'Wf') ? '\\(P_L = ' + fmt(v.vs) + '(' + fmt(v.Wf) + ')/33\\,000 = ' + fmt(v.vs * v.Wf / 33000, 3) + '\\) hp' : null },
            { id: 'PoG', symbol: 'P_G', label: 'Gear power carried by \\(W_{tG}\\): \\(W_{tG}v_{tG}/33\\,000\\)', unit: 'hp', kind: 'calc', compute: v => has(v, 'WtG', 'vtG') ? v.WtG * v.vtG / 33000 : undefined, work: v => has(v, 'WtG', 'vtG') ? '\\(P_G = ' + fmt(v.WtG) + '(' + fmt(v.vtG) + ')/33\\,000 = ' + fmt(v.WtG * v.vtG / 33000, 3) + '\\) hp' : null },
            { id: 'Pi', symbol: 'P_i', label: 'Input power \\(P_G + P_L\\)', unit: 'hp', kind: 'calc', compute: v => has(v, 'PoG', 'PL') ? v.PoG + v.PL : undefined, work: v => has(v, 'PoG', 'PL') ? '\\(P_i = ' + fmt(v.PoG, 3) + ' + ' + fmt(v.PL, 3) + ' = ' + fmt(v.PoG + v.PL, 3) + '\\) hp' : null },
            { id: 'eta', symbol: '\\eta', label: 'Efficiency \\(P_G/P_i\\)', unit: '%', kind: 'calc', compute: v => has(v, 'PoG', 'Pi') ? 100 * v.PoG / v.Pi : undefined, work: v => has(v, 'PoG', 'Pi') ? '\\(\\eta = ' + fmt(v.PoG, 3) + '/' + fmt(v.Pi, 3) + ' = ' + fmt(100 * v.PoG / v.Pi, 3) + '\\%\\)' : null },
            { id: 'eta2', symbol: '\\eta_{(10\\text{-}36)}', label: 'Efficiency from Eq. 10-36 (check)', unit: '%', kind: 'calc', compute: v => has(v, 'phin', 'mu', 'lam') ? 100 * (cos(r(v.phin)) - v.mu * tan(r(v.lam))) / (cos(r(v.phin)) + v.mu / tan(r(v.lam))) : undefined },
          ] },
      ] },

      { title: '11-15 · Bending stress in the wormgear teeth (Sec. 10-11)', steps: [
        { id: 's', title: 'Lewis form factor, normal pitch, dynamic load, stress', eq: '10-37 … 10-41', fig: ['t10-5', 'cbend'],
          formula: 'p_n = p\\cos\\lambda,\\quad K_v = \\frac{1200}{1200 + v_{tG}},\\quad W_d = \\frac{W_{tG}}{K_v},\\quad \\sigma = \\frac{W_d}{y\\,F_e\\,p_n}\\qquad\\left(\\text{Shigley 15-53: } \\sigma_a = \\frac{W_{tG}}{p_n F_e y}\\right)',
          text: '\\(y\\) = 0.125 at 20° (Table 10-5); compare with \\(\\sigma_{all}\\) = 24 ksi (phosphor bronze; manganese 17 ksi). Mott’s dynamic-load value governs; the Shigley form (no \\(K_v\\)) is shown too.',
          vars: [
            { id: 'y', symbol: 'y', label: 'Lewis form factor', kind: 'lookup', fig: 't10-5', auto: v => has(v, 'phin') ? (v.phin < 17 ? 0.100 : v.phin < 22.5 ? 0.125 : v.phin < 27.5 ? 0.150 : 0.175) : undefined, hint: 'Table 10-5: 0.100, 0.125, 0.150, 0.175 at 14.5°, 20°, 25°, 30°' },
            { id: 'pn', symbol: 'p_n', label: 'Normal circular pitch', unit: 'in', kind: 'calc', compute: v => has(v, 'p', 'lam') ? v.p * cos(r(v.lam)) : undefined, work: v => has(v, 'p', 'lam') ? '\\(p_n = ' + fmt(v.p) + '\\cos ' + fmt(v.lam) + '^\\circ = ' + fmt(v.p * cos(r(v.lam))) + '\\) in' : null },
            { id: 'Kv', symbol: 'K_v', label: 'Dynamic factor', kind: 'calc', compute: v => has(v, 'vtG') ? 1200 / (1200 + v.vtG) : undefined, work: v => has(v, 'vtG') ? '\\(K_v = 1200/(1200 + ' + fmt(v.vtG) + ') = ' + fmt(1200 / (1200 + v.vtG), 3) + '\\)' : null },
            { id: 'Wd', symbol: 'W_d', label: 'Dynamic load', unit: 'lb', kind: 'calc', compute: v => has(v, 'WtG', 'Kv') ? v.WtG / v.Kv : undefined },
            { id: 'FeB', symbol: 'F_e', label: 'Effective face width \\(\\min(F, 0.67D_W)\\)', unit: 'in', kind: 'calc', compute: v => has(v, 'F', 'DW') ? Math.min(v.F, 0.67 * v.DW) : undefined },
            { id: 'sig', symbol: '\\sigma', label: 'Bending stress in gear teeth (Mott, dynamic load)', unit: 'psi', kind: 'calc', compute: v => has(v, 'Wd', 'y', 'FeB', 'pn') ? v.Wd / (v.y * v.FeB * v.pn) : undefined,
              work: v => has(v, 'Wd', 'y', 'FeB', 'pn') ? '\\(\\sigma = \\frac{' + fmt(v.Wd) + '}{(' + fmt(v.y, 3) + ')(' + fmt(v.FeB) + ')(' + fmt(v.pn) + ')} = ' + fmt(v.Wd / (v.y * v.FeB * v.pn), 5) + '\\) psi' : null },
            { id: 'sigS', symbol: '\\sigma_a', label: 'Bending stress, Shigley Eq. 15-53 form (no \\(K_v\\))', unit: 'psi', kind: 'calc', compute: v => has(v, 'WtG', 'y', 'FeB', 'pn') ? v.WtG / (v.y * v.FeB * v.pn) : undefined,
              work: v => has(v, 'WtG', 'y', 'FeB', 'pn') ? '\\(\\sigma_a = \\frac{' + fmt(v.WtG) + '}{' + fmt(v.pn) + '(' + fmt(v.FeB) + ')(' + fmt(v.y, 3) + ')} = ' + fmt(v.WtG / (v.y * v.FeB * v.pn), 5) + '\\) psi' : null },
            { id: 'sall', symbol: '\\sigma_{all}', label: 'Fatigue strength of gear material', unit: 'psi', kind: 'input', default: 24000, hint: '24 000 phosphor bronze; 17 000 manganese bronze' },
            { id: 'FSb', symbol: 'FS', label: 'Bending safety factor \\(\\sigma_{all}/\\sigma\\)', kind: 'calc', compute: v => has(v, 'sall', 'sig') ? v.sall / v.sig : undefined },
          ],
          after: v => has(v, 'FSb') ? (v.FSb >= 1 ? '<span class="result-ok">Bending OK — \\(\\sigma = ' + fmt(v.sig, 4) + '\\) psi, within ' + fmt(v.sall, 4) + ' psi (FS = ' + fmt(v.FSb, 3) + ')</span>' : '<span class="result-bad">Bending FAIL — \\(\\sigma = ' + fmt(v.sig, 4) + '\\) psi above ' + fmt(v.sall, 4) + ' psi</span>') : '' },
      ] },

      { title: '16-21 · Surface durability — rated tangential load (Sec. 10-12, Eq. 10-42)', steps: [
        { id: 'c', title: 'Steps 16-18 — Cs, Cm, Cv', eq: '10-43 … 10-51', fig: ['f10-27', 'f10-28', 'f10-29'],
          formula: 'C_s = \\begin{cases}1189.636 - 476.545\\log_{10}D_G & \\text{sand, } D_G\\gt 2.5\\\\ 1411.651 - 455.825\\log_{10}D_G & \\text{chill/forged, } D_G\\gt 8\\\\ 1251.291 - 179.750\\log_{10}D_G & \\text{centrifugal, } D_G\\gt 25\\\\ 1000 & \\text{otherwise}\\end{cases}',
          text: '\\(C_m\\) and \\(C_v\\) from Eqs. 10-46 … 10-51 (work lines show the branch used). Ex. 10-10 reads the charts: \\(C_s\\) = 740, \\(C_m\\) = 0.814, \\(C_v\\) = 0.265 — the equations give nearly the same.',
          vars: [
            { id: 'Cs', symbol: 'C_s', label: 'Materials factor', kind: 'lookup', fig: 'f10-27', auto: v => has(v, 'DG', 'mat') ? CsFit(v.DG, v.mat) : undefined, hint: 'auto = Eqs. 10-43 … 10-45',
              work: v => has(v, 'DG', 'mat') ? '\\(C_s = ' + CsWork(v.DG, v.mat) + '\\)' : null },
            { id: 'Cm', symbol: 'C_m', label: 'Ratio correction factor', kind: 'lookup', fig: 'f10-28', auto: v => has(v, 'mG') ? CmFit(v.mG) : undefined, hint: 'auto = Eqs. 10-46 … 10-48',
              work: v => has(v, 'mG') ? '\\(C_m = ' + CmWork(v.mG) + '\\)' : null },
            { id: 'Cv', symbol: 'C_v', label: 'Velocity factor', kind: 'lookup', fig: 'f10-29', auto: v => has(v, 'vs') ? CvFit(v.vs) : undefined, hint: 'auto = Eqs. 10-49 … 10-51',
              work: v => has(v, 'vs') ? '\\(C_v = ' + CvWork(v.vs) + '\\)' : null },
          ] },
        { id: 'w', title: 'Steps 19-21 — effective face width, rated load, pitting check', eq: '10-42',
          formula: 'F_e = \\min(F,\\ 0.67D_W),\\qquad W_{tR} = C_s D_G^{0.8} F_e C_m C_v,\\qquad W_{tR} \\gt  W_{tG}\\ ?',
          text: 'Face width capped at \\(0.67D_W\\) (Mott/AGMA, Ex. 10-10); the guides print \\(D_W/3\\).',
          vars: [
            { id: 'Fe', symbol: 'F_e', label: 'Effective face width', unit: 'in', kind: 'calc', compute: v => has(v, 'F', 'DW') ? Math.min(v.F, 0.67 * v.DW) : undefined,
              work: v => has(v, 'F', 'DW') ? '\\(F_e = \\min(' + fmt(v.F) + ',\\ 0.67(' + fmt(v.DW) + ') = ' + fmt(0.67 * v.DW) + ') = ' + fmt(Math.min(v.F, 0.67 * v.DW)) + '\\) in' : null },
            { id: 'WtR', symbol: 'W_{tR}', label: 'Rated tangential load', unit: 'lb', kind: 'calc', compute: v => has(v, 'Cs', 'DG', 'Fe', 'Cm', 'Cv') ? v.Cs * Math.pow(v.DG, 0.8) * v.Fe * v.Cm * v.Cv : undefined,
              work: v => has(v, 'Cs', 'DG', 'Fe', 'Cm', 'Cv') ? '\\(W_{tR} = (' + fmt(v.Cs) + ')(' + fmt(v.DG) + ')^{0.8}(' + fmt(v.Fe) + ')(' + fmt(v.Cm, 3) + ')(' + fmt(v.Cv, 3) + ') = ' + fmt(v.Cs * Math.pow(v.DG, 0.8) * v.Fe * v.Cm * v.Cv) + '\\) lb' : null },
            { id: 'ratio', symbol: 'W_{tR}/W_{tG}', label: 'Pitting margin', kind: 'calc', compute: v => has(v, 'WtR', 'WtG') ? v.WtR / v.WtG : undefined },
          ],
          after: v => {
            if (!has(v, 'WtR', 'WtG')) return '';
            const ok = v.WtR > v.WtG;
            let s = ok ? '<b><span class="result-ok">DESIGN SATISFACTORY for pitting resistance</span></b> — \\(W_{tR} = ' + fmt(v.WtR) + '\\) lb \\(> W_{tG} = ' + fmt(v.WtG) + '\\) lb (margin ' + fmt(v.ratio, 3) + ')'
              : '<b><span class="result-bad">DESIGN NOT SATISFACTORY for pitting</span></b> — \\(W_{tR} = ' + fmt(v.WtR) + '\\) lb, not above \\(W_{tG} = ' + fmt(v.WtG) + '\\) lb: use a larger gear, wider face (up to \\(0.67D_W\\)) or a better bronze';
            if (has(v, 'FSb')) s += '; bending ' + (v.FSb >= 1 ? 'OK' : 'FAIL') + ' (\\(\\sigma\\) = ' + fmt(v.sig, 4) + ' psi)';
            if (has(v, 'eta')) s += '; efficiency ' + fmt(v.eta, 3) + ' %, input ' + fmt(v.Pi, 3) + ' hp for ' + fmt(v.Po, 3) + ' hp out';
            if (has(v, 'ts', 'tmax')) s += '; thermal ' + (v.ts <= v.tmax ? 'OK' : 'FAIL') + ' (\\(t_s\\) = ' + fmt(v.ts) + ' °F)';
            return s + '.';
          } },
      ] },

      { title: 'Heat dissipation (course add-on from Shigley Eqs. 15-49 … 15-52; not in Mott)', steps: [
        { id: 'heat', title: 'Heat loss, case area and oil-sump temperature', fig: ['cheat'],
          formula: 'H_{loss} = 33\\,000(1-\\eta)P_i,\\quad \\hbar_{CR} = \\begin{cases}n_W/6494 + 0.13 & \\text{no fan}\\\\ n_W/3939 + 0.13 & \\text{fan on worm shaft}\\end{cases},\\quad t_s = t_a + \\frac{H_{loss}}{\\hbar_{CR}A},\\quad A_{min} = 43.20C^{1.7}',
          text: '\\(P_i\\) is the input power from steps 7-10; \\(A\\) is the total lateral case area (course example: 850 in\\(^2\\) per side, so 1700). Assume no fan; oil limit 250 °F (120 °C).',
          vars: [
            { id: 'fan', symbol: '', label: 'Cooling', kind: 'choice', options: [{ label: 'No fan on worm shaft (course default)', value: 0 }, { label: 'Fan on worm shaft', value: 1 }], default: 0 },
            { id: 'A', symbol: 'A', label: 'Case lateral area (total)', unit: 'in^2', kind: 'input', hint: 'blank → use \\(A_{min}\\)' },
            { id: 'ta', symbol: 't_a', label: 'Ambient temperature', unit: '°F', kind: 'input', default: 70 },
            { id: 'tmax', symbol: 't_{max}', label: 'Oil temperature limit', unit: '°F', kind: 'input', default: 250, hint: '250 °F (120 °C) course limit; 200 °F conservative' },
            { id: 'Hloss', symbol: 'H_{loss}', label: 'Heat loss rate', unit: 'ft·lb/min', kind: 'calc', compute: v => has(v, 'eta', 'Pi') ? 33000 * (1 - v.eta / 100) * v.Pi : undefined,
              work: v => has(v, 'eta', 'Pi') ? '\\(H_{loss} = 33\\,000(1 - ' + fmt(v.eta / 100, 3) + ')(' + fmt(v.Pi, 3) + ') = ' + fmt(33000 * (1 - v.eta / 100) * v.Pi, 5) + '\\) ft·lb/min' : null },
            { id: 'hcr', symbol: '\\hbar_{CR}', label: 'Combined heat-transfer coefficient', unit: 'ft·lb/(min·in^2·°F)', kind: 'calc', compute: v => has(v, 'nW', 'fan') ? v.nW / (v.fan ? 3939 : 6494) + 0.13 : undefined,
              work: v => has(v, 'nW', 'fan') ? '\\(\\hbar_{CR} = ' + fmt(v.nW) + '/' + (v.fan ? 3939 : 6494) + ' + 0.13 = ' + fmt(v.nW / (v.fan ? 3939 : 6494) + 0.13, 3) + '\\)' : null },
            { id: 'Amin', symbol: 'A_{min}', label: 'AGMA minimum lateral area', unit: 'in^2', kind: 'calc', compute: v => has(v, 'C') ? 43.2 * Math.pow(v.C, 1.7) : undefined, work: v => has(v, 'C') ? '\\(A_{min} = 43.2(' + fmt(v.C) + ')^{1.7} = ' + fmt(43.2 * Math.pow(v.C, 1.7)) + '\\) in\\(^2\\)' : null },
            { id: 'Ause', symbol: 'A_{used}', label: 'Area used in the balance', unit: 'in^2', kind: 'calc', compute: v => has(v, 'A') ? v.A : (has(v, 'Amin') ? v.Amin : undefined) },
            { id: 'ts', symbol: 't_s', label: 'Oil sump temperature', unit: '°F', kind: 'calc', compute: v => has(v, 'ta', 'Hloss', 'hcr', 'Ause') ? v.ta + v.Hloss / (v.hcr * v.Ause) : undefined,
              work: v => has(v, 'ta', 'Hloss', 'hcr', 'Ause') ? '\\(t_s = ' + fmt(v.ta) + ' + \\frac{' + fmt(v.Hloss, 5) + '}{' + fmt(v.hcr, 3) + '(' + fmt(v.Ause) + ')} = ' + fmt(v.ta + v.Hloss / (v.hcr * v.Ause)) + '^\\circ\\)F' : null },
          ],
          after: v => {
            if (!has(v, 'ts', 'tmax')) return '';
            let s = v.ts <= v.tmax ? '<span class="result-ok">Thermal OK — \\(t_s = ' + fmt(v.ts) + '\\) °F, within ' + fmt(v.tmax) + ' °F</span>' : '<span class="result-bad">Thermal problem — \\(t_s = ' + fmt(v.ts) + '\\) °F above ' + fmt(v.tmax) + ' °F: add a fan, more case area or external cooling</span>';
            if (has(v, 'A', 'Amin') && v.A < v.Amin) s += ' <span class="result-bad">(case area ' + fmt(v.A) + ' in\\(^2\\) is below AGMA \\(A_{min}\\) = ' + fmt(v.Amin) + ' in\\(^2\\))</span>';
            return s;
          } },
      ] },
    ],
  };

  function muFit(vs) { return vs <= 0 ? 0.15 : vs < 10 ? 0.124 * Math.exp(-0.074 * Math.pow(vs, 0.645)) : 0.103 * Math.exp(-0.110 * Math.pow(vs, 0.450)) + 0.012; }
  function CsFit(D, mat) {
    const lg = Math.log10(D);
    if (mat === 'sand') return D > 2.5 ? 1189.636 - 476.545 * lg : 1000;
    if (mat === 'centrifugal') return D > 25 ? 1251.291 - 179.750 * lg : 1000;
    return D > 8 ? 1411.651 - 455.825 * lg : 1000;
  }
  function CsWork(D, mat) {
    const lim = mat === 'sand' ? 2.5 : mat === 'centrifugal' ? 25 : 8;
    if (D <= lim) return '1000\\ (D_G = ' + fmt(D) + ' \\le ' + lim + '\\text{ in})';
    const k = mat === 'sand' ? ['1189.636', '476.545'] : mat === 'centrifugal' ? ['1251.291', '179.750'] : ['1411.651', '455.825'];
    return k[0] + ' - ' + k[1] + '\\log_{10}(' + fmt(D) + ') = ' + fmt(CsFit(D, mat));
  }
  function CmFit(m) { return m <= 20 ? 0.02 * sq(Math.max(0, -m * m + 40 * m - 76)) + 0.46 : m <= 76 ? 0.0107 * sq(-m * m + 56 * m + 5145) : 1.1483 - 0.00658 * m; }
  function CmWork(m) { return (m <= 20 ? '0.0200(-' + fmt(m) + '^2 + 40(' + fmt(m) + ') - 76)^{0.5} + 0.46' : m <= 76 ? '0.0107(-' + fmt(m) + '^2 + 56(' + fmt(m) + ') + 5145)^{0.5}' : '1.1483 - 0.00658(' + fmt(m) + ')') + ' = ' + fmt(CmFit(m), 3); }
  function CvFit(vs) { return vs < 700 ? 0.659 * Math.exp(-0.0011 * vs) : vs < 3000 ? 13.31 * Math.pow(vs, -0.571) : 65.52 * Math.pow(vs, -0.774); }
  function CvWork(vs) { return (vs < 700 ? '0.659e^{-0.0011(' + fmt(vs) + ')}' : vs < 3000 ? '13.31(' + fmt(vs) + ')^{-0.571}' : '65.52(' + fmt(vs) + ')^{-0.774}') + ' = ' + fmt(CvFit(vs), 3); }
})();
