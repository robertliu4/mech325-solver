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

  window.TOPIC = {
    id: 'worm', book: 'mott',
    title: 'Worm Gearsets — Geometry, Forces, Efficiency & AGMA Rating',
    subtitle: 'Mott Secs. 8-9 … 8-10, 10-10 … 10-12 (AGMA 6034-B92) · the 21-step Fizz / Mech guide procedure',
    sibling: 'worm_shigley.html',
    intro: 'Steel worm driving a bronze wormgear on 90° shafts. Enter the gear data and output power/torque, then the sheet runs the bible\'s 21 steps in Mott\'s notation: lead and lead angle → center distance → pitch-line and sliding speeds → coefficient of friction μ (Eqs. 10-26/10-27, Fig. 10-25) → forces on the gear and worm with directions (Fig. 10-24) → friction power, input power, efficiency → Lewis bending stress in the gear teeth (Eq. 10-37) → C<sub>s</sub>, C<sub>m</sub>, C<sub>v</sub> and the rated tangential load W<sub>tR</sub> (Eq. 10-42) → pitting PASS/FAIL → heat balance (Shigley Eqs. 15-49 … 15-52, used by the course). <b>Defaults follow the Fizz / Mech guide assumptions</b> listed in the panel below (both guides are written "using Mott"; course-slide values where the guides are silent): gear load W<sub>tG</sub> = 2T<sub>o</sub>/D<sub>G</sub> (the course\'s Shigley Eq. 15-58 basis, output power × K<sub>a</sub> n<sub>d</sub> ÷ η, is a selector option), μ from Eq. 10-27, static μ = 0.15 for the self-locking test μ<sub>static</sub> &gt; cos φ<sub>n</sub> tan λ (λ &lt; 6°), F<sub>e</sub> ≤ 0.67 D<sub>W</sub>, y = 0.125 at 20°, phosphor-bronze σ<sub>all</sub> = 24 ksi, sand-cast bronze, "better to assume no fan", lubricant limit 250 °F. Load the example to reproduce Mott Example Problems 8-4, 10-9 and 10-10 (52T gear, triple-thread worm, 1750 rpm, T<sub>o</sub> = 4168 lb·in).',
    example: { NG: 52, NW: 3, DW: 2.0, Pd: 6, phiGiven: 20, phiType: 'transverse', nW: 1750, To: 4168, F: 1.25, mat: 'sand', basis: 'mott', Ka: 1, nd: 1, mu: 0.022, Cs: 740, Cm: 0.814, Cv: 0.265, fstat: 0.15, fan: 0, ta: 70, tmax: 250, sall: 24000 },

    assumptions: [
      { text: 'Pressure angle 20° unless given; Mott\'s force equations need the normal angle — a transverse angle is converted with tan φ_n = tan φ_t cos λ', src: 'Fizz p.70 · Mech p.108', var: 'phiGiven' },
      { text: 'Gear tangential force W_tG = 2T_o/D_G (Mott Eq. 10-29) as in both guides; the course Module 2 example instead uses Shigley 15-58, W_tG = 33 000 n_d P_o K_a/(v_tG η) — pick it in the selector', src: 'Fizz p.72 · Mech p.110', var: 'basis' },
      { text: 'Application factor K_a = 1 and design factor n_d = 1 unless given (the guides apply none; course example K_a = 1.25; Mott: Table 9-1 factors for severe service)', src: 'Fizz p.72 · Mech p.110 · Mott Sec. 10-12', var: 'Ka' },
      { text: 'Friction from the guides\' formula (Eqs. 10-26/10-27, Fig. 10-25): \\(\\mu = 0.103\\,e^{-0.11v_s^{0.45}} + 0.012\\) for v_s > 10 ft/min (\\(0.124\\,e^{-0.074v_s^{0.645}}\\) below)', src: 'Fizz p.72 · Mech p.110', var: 'mu' },
      { text: 'Static friction μ = 0.15 (the guides\' value at v_s = 0) for the self-locking test μ_static > cos φ_n tan λ; rule of thumb λ < 6° (Mott: ≤ 5°)', src: 'Fizz p.72 · Mech p.110 · course Worm Gears s11', var: 'fstat' },
      { text: 'Lewis form factor y from Table 10-5 by φ_n (0.125 at 20°)', src: 'Fizz p.73 · Mech p.111', var: 'y' },
      { text: 'Gear-tooth bending with the dynamic load W_d = W_tG/K_v, K_v = 1200/(1200 + v_tG) (the course also quotes Shigley\'s form without K_v)', src: 'Fizz p.73 · Mech p.111' },
      { text: 'Allowable bending stress of the bronze gear σ_all = 24 ksi (phosphor bronze; manganese bronze 17 ksi)', src: 'course Worm Gears s19 · Mott Sec. 10-11', var: 'sall' },
      { text: 'Sand-cast bronze for C_s unless stated ("most common"; Mott Ex. 10-10 assumes sand cast); C_s, C_m, C_v from the guides\' equations with D_G as the mean gear diameter', src: 'Fizz p.74 · Mech p.112 · Mech p.113', var: 'mat' },
      { text: 'Wormgear face width not given → F_G = √(D_oW² − D_W²) (the guides add "≈ 2p ≈ 6/P_d"; Table 8-9 proportions a = 1/P_d, h_t = 2.157/P_d)', src: 'Fizz p.71 · Mech p.108', var: 'F' },
      { text: 'Effective face width F_e = min(F, 0.67D_W) (Mott Eq. 10-42 and Ex. 10-10); both guides print D_W/3 — the textbook limit is used', src: 'Fizz p.74 · Mech p.113', var: 'Fe' },
      { text: 'Pitting check passes when W_tR > W_tG', src: 'Fizz p.74 · Mech p.113' },
      { text: 'Heat check (course add-on): no fan on the worm shaft ("better to assume no fan"); t_a = 70 °F if not given; oil limit 250 °F; A_min = 43.2C^{1.7} if no case area is given', src: 'course Module 2 p36 · Worm Gears s20', var: 'fan' },
    ],

    figures: [
      { id: 'f8-24', ref: 'Figure 8-24', title: 'Single-enveloping wormgear set — DW, DG, C, L, Px, FG, FW, Dt, root/outside diameters', src: 'figures/mott/fig8-24.png', page: 348 },
      { id: 'f8-27', ref: 'Figure 8-27', title: 'Lead angle: unwrapped thread, tan λ = L/(π DW)', src: 'figures/mott/fig8-27.png', page: 350 },
      { id: 't8-9', ref: 'Table 8-9', title: 'Typical tooth dimensions for worms and wormgears', src: 'figures/mott/table8-9.png', page: 352 },
      { id: 'f10-24', ref: 'Figure 10-24', title: 'Forces on a worm and a wormgear (front and side views)', src: 'figures/mott/fig10-24.png', page: 474,
        note: 'WtG = WxW, WxG = WtW, WrG = WrW (Eq. 10-23), each pair opposite in direction. Thrust + radial on the worm bearings from WxW; radial only from WtW; the gear shaft sees thrust WxG.' },
      { id: 'f10-25', ref: 'Figure 10-25', title: 'Coefficient of friction μ vs sliding velocity (steel worm / bronze gear)', src: 'figures/mott/fig10-25.png', page: 475, note: 'Eqs. 10-26/10-27 are the curve; μ = 0.15 at vs = 0.' },
      { id: 'f10-26', ref: 'Figure 10-26', title: 'Efficiency vs lead angle (φn = 20°)', src: 'figures/mott/fig10-26.png', page: 476 },
      { id: 't10-5', ref: 'Table 10-5', title: 'Approximate Lewis form factor y for wormgear teeth', src: 'figures/mott/table10-5.png', page: 478 },
      { id: 'f10-27', ref: 'Figure 10-27', title: 'Materials factor Cs vs mean gear diameter (C > 3 in)', src: 'figures/mott/fig10-27.png', page: 479, note: 'Eqs. 10-43 … 10-45; Dm ≈ DG for standard addendum.' },
      { id: 'f10-28', ref: 'Figure 10-28', title: 'Ratio correction factor Cm vs gear ratio mG', src: 'figures/mott/fig10-28.png', page: 479, note: 'Eqs. 10-46 … 10-48.' },
      { id: 'f10-29', ref: 'Figure 10-29', title: 'Velocity factor Cv vs sliding velocity', src: 'figures/mott/fig10-29.png', page: 480, note: 'Eqs. 10-49 … 10-51.' },
      { id: 'f13-36', ref: 'Figure 13-36', title: 'Shigley\'s 3-D view of the forces on the worm pitch cylinder (helps with directions)', src: 'figures/shigley/fig13-36.png', page: 740, book: 'shigley' },
      // ---- course-only slides (Worm_Gears_2024.pdf) ----
      { id: 'csl', ref: 'Worm Gears s11', book: 'course', title: 'Self-locking wormgear sets: λ < 6°, static μ ≈ 0.15, criterion μ_static > cos φn tan λ (with Mott Fig. 10-26)', src: 'figures/course/worm_self_locking_course.png' },
      { id: 'cbend', ref: 'Worm Gears s19', book: 'course', title: 'Bending stress in worm-gear teeth: σ = W_tG/(pn Fe y), y = 0.125 at 20° (Table 10-5), σall = 24 ksi phosphor bronze; "Mott uses a modified dynamic load (10-11)"', src: 'figures/course/worm_bending_course.png' },
      { id: 'cheat', ref: 'Worm Gears s20', book: 'course', title: 'Heat issues (Shigley 15-49 … 15-52): Hloss, ħCR with/without fan, sump temperature, AGMA minimum lateral area', src: 'figures/course/worm_heat_course.png', note: 'Module 2 p36: "better to assume no fan". Not in Mott.' },
    ],

    sections: [
      { title: '0 · Given', steps: [
        { id: 'in', title: 'Gear set and duty', fig: ['f8-24'],
          text: 'Enter the pressure angle as given (normal or transverse) — Mott\'s force equations need the <b>normal</b> angle φ<sub>n</sub> (Eq. 8-26: tan φ<sub>n</sub> = tan φ<sub>t</sub> cos λ). Give either the output torque T<sub>o</sub> or the output power P<sub>o</sub>.',
          vars: [
            { id: 'NG', symbol: 'N_G', label: 'Wormgear teeth', kind: 'input' },
            { id: 'NW', symbol: 'N_W', label: 'Worm threads (starts)', kind: 'input', hint: '1, 2, 3, 4 …' },
            { id: 'DW', symbol: 'D_W', label: 'Worm pitch diameter', unit: 'in', kind: 'input' },
            { id: 'Pd', symbol: 'P_d', label: 'Diametral pitch of gear', unit: 'teeth/in', kind: 'input', hint: 'blank if DG is given instead' },
            { id: 'DGin', symbol: 'D_G', label: 'Gear pitch diameter (if given instead of Pd)', unit: 'in', kind: 'input' },
            { id: 'phiGiven', symbol: '\\phi', label: 'Pressure angle given', kind: 'choice', options: [{ label: '14.5°', value: 14.5 }, { label: '20°', value: 20 }, { label: '25°', value: 25 }, { label: '30°', value: 30 }], default: 20 },
            { id: 'phiType', symbol: '', label: '… measured in which plane?', kind: 'choice', type: 'text', options: [{ label: 'normal (φn)', value: 'normal' }, { label: 'transverse (φt)', value: 'transverse' }], default: 'normal' },
            { id: 'nW', symbol: 'n_W', label: 'Worm speed', unit: 'rpm', kind: 'input' },
            { id: 'To', symbol: 'T_o', label: 'Output torque (if given)', unit: 'lb·in', kind: 'input' },
            { id: 'PoIn', symbol: 'P_o', label: 'Output power (if given instead)', unit: 'hp', kind: 'input' },
            { id: 'F', symbol: 'F', label: 'Wormgear face width', unit: 'in', kind: 'input', hint: 'auto = guides\' F_G = √(D_oW² − D_W²) (≈ 6/P_d) from Table 8-9 below',
              auto: v => has(v, 'FGrec') ? v.FGrec : undefined },
            { id: 'mat', symbol: '', label: 'Bronze type (for Cs)', kind: 'choice', type: 'text', options: [{ label: 'Sand-cast bronze (course: "most common")', value: 'sand' }, { label: 'Static-chill-cast or forged bronze', value: 'chill' }, { label: 'Centrifugally cast bronze', value: 'centrifugal' }], default: 'sand' },
            { id: 'basis', symbol: '', label: 'Gear load basis', kind: 'choice', type: 'text', options: [{ label: 'Mott 10-29 / guides: W_tG = 2 T_o/D_G (× K_a n_d)', value: 'mott' }, { label: 'Shigley 15-58 / course Module 2: W_tG = 33 000 n_d P_o K_a/(v_tG η)', value: 'shigley' }], default: 'mott', hint: 'guides: 2T_o/D_G; the course worked example divides the output load by η and applies K_a, n_d' },
            { id: 'Ka', symbol: 'K_a', label: 'Application (service) factor on the output power', kind: 'input', default: 1, hint: '1 unless given (guides, Mott examples); course example 1.25' },
            { id: 'nd', symbol: 'n_d', label: 'Design factor', kind: 'input', default: 1, hint: 'course: 1.0 unless stated' },
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
          after: v => has(v, 'lam') ? (v.lam < 6 ? '<span class="result-ok">λ = ' + fmt(v.lam) + '° &lt; 6° → self-locking by the course rule of thumb (confirm with μ<sub>static</sub> below)</span>' : '<span class="muted">λ = ' + fmt(v.lam) + '° ≥ 6° → probably not self-locking (course: λ &lt; 6° ensures it; Mott Sec. 8-10 says ≤ 5°); check μ<sub>static</sub> below — a brake is needed if back-driving must be prevented.</span>') : '' },
        { id: 'g2', title: 'Step 2 — center distance, worm-diameter check, velocity ratio', eq: '8-25, 8-27',
          formula: 'C = \\frac{D_W + D_G}{2},\\qquad \\frac{C^{0.875}}{3.0} \\le D_W \\le \\frac{C^{0.875}}{1.6},\\qquad VR = m_G = \\frac{n_W}{n_G} = \\frac{N_G}{N_W}',
          vars: [
            { id: 'C', symbol: 'C', label: 'Center distance', unit: 'in', kind: 'calc', compute: v => has(v, 'DW', 'DG') ? (v.DW + v.DG) / 2 : undefined, work: v => has(v, 'DW', 'DG') ? '\\(C = (' + fmt(v.DW) + ' + ' + fmt(v.DG) + ')/2 = ' + fmt((v.DW + v.DG) / 2) + '\\) in' : null },
            { id: 'DWlo', symbol: 'D_{W,min}', label: 'C^0.875/3.0', unit: 'in', kind: 'calc', compute: v => has(v, 'C') ? Math.pow(v.C, 0.875) / 3 : undefined },
            { id: 'DWhi', symbol: 'D_{W,max}', label: 'C^0.875/1.6', unit: 'in', kind: 'calc', compute: v => has(v, 'C') ? Math.pow(v.C, 0.875) / 1.6 : undefined },
            { id: 'mG', symbol: 'm_G', label: 'Velocity ratio VR', kind: 'calc', compute: v => has(v, 'NG', 'NW') ? v.NG / v.NW : undefined },
            { id: 'nG', symbol: 'n_G', label: 'Gear speed', unit: 'rpm', kind: 'calc', compute: v => has(v, 'nW', 'mG') ? v.nW / v.mG : undefined, work: v => has(v, 'nW', 'mG') ? '\\(n_G = ' + fmt(v.nW) + '/' + fmt(v.mG) + ' = ' + fmt(v.nW / v.mG) + '\\) rpm' : null },
          ],
          after: v => has(v, 'DW', 'DWlo', 'DWhi') ? (v.DW >= v.DWlo && v.DW <= v.DWhi ? '<span class="result-ok">D<sub>W</sub> within recommended range ' + fmt(v.DWlo) + ' … ' + fmt(v.DWhi) + ' in</span>' : '<span class="muted">D<sub>W</sub> = ' + fmt(v.DW) + ' in is outside the Eq. 8-27 range ' + fmt(v.DWlo) + ' … ' + fmt(v.DWhi) + ' in (common for small commercial sets; note it).</span>') : '' },
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
            { id: 'FGrec', symbol: 'F_G', label: 'Recommended gear face width √(DoW² − DW²)', unit: 'in', kind: 'calc', compute: v => has(v, 'DoW', 'DW') ? sq(v.DoW * v.DoW - v.DW * v.DW) : undefined },
            { id: 'FG6', symbol: '6/P_d', label: 'Approximate rule 6/Pd', unit: 'in', kind: 'calc', compute: v => has(v, 'PdC') ? 6 / v.PdC : undefined },
            { id: 'FW', symbol: 'F_W', label: 'Worm face length', unit: 'in', kind: 'calc', compute: v => has(v, 'Dt', 'DG', 'a') ? 2 * sq(Math.pow(v.Dt / 2, 2) - Math.pow(v.DG / 2 - v.a, 2)) : undefined },
          ] },
      ] },

      { title: '3-5 · Speeds and coefficient of friction (Sec. 10-10)', steps: [
        { id: 'v', title: 'Steps 3-4 — pitch-line speed of the gear, sliding speed', eq: '10-24',
          formula: 'v_{tG} = \\frac{\\pi D_G n_G}{12},\\qquad v_{tW} = \\frac{\\pi D_W n_W}{12},\\qquad v_s = \\frac{v_{tG}}{\\sin\\lambda} = \\frac{v_{tW}}{\\cos\\lambda}',
          vars: [
            { id: 'vtG', symbol: 'v_{tG}', label: 'Gear pitch-line speed', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'DG', 'nG') ? Math.PI * v.DG * v.nG / 12 : undefined, work: v => has(v, 'DG', 'nG') ? '\\(v_{tG} = \\pi(' + fmt(v.DG) + ')(' + fmt(v.nG) + ')/12 = ' + fmt(Math.PI * v.DG * v.nG / 12) + '\\) ft/min' : null },
            { id: 'vtW', symbol: 'v_{tW}', label: 'Worm pitch-line speed', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'DW', 'nW') ? Math.PI * v.DW * v.nW / 12 : undefined },
            { id: 'vs', symbol: 'v_s', label: 'Sliding velocity', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'vtG', 'lam') ? v.vtG / sin(r(v.lam)) : undefined, work: v => has(v, 'vtG', 'lam') ? '\\(v_s = ' + fmt(v.vtG) + '/\\sin ' + fmt(v.lam) + '^\\circ = ' + fmt(v.vtG / sin(r(v.lam))) + '\\) ft/min' : null },
          ] },
        { id: 'mu', title: 'Step 5 — coefficient of friction and self-locking test', eq: '10-26, 10-27', fig: ['f10-25', 'csl'],
          text: 'Guides: running μ from the piecewise formula (Eqs. 10-26/10-27 = Shigley 15-38); its v<sub>s</sub> = 0 value, <b>static μ ≈ 0.15</b>, is what the course uses for the self-locking test μ<sub>static</sub> &gt; cos φ<sub>n</sub> tan λ (Worm Gears s11).',
          formula: '\\mu = \\begin{cases}0.150 & v_s = 0\\\\ 0.124e^{-0.074v_s^{0.645}} & 0 \\lt  v_s \\lt  10\\\\ 0.103e^{-0.110v_s^{0.450}} + 0.012 & v_s \\ge 10\\ \\text{ft/min}\\end{cases}',
          vars: [
            { id: 'mu', symbol: '\\mu', label: 'Coefficient of friction', kind: 'lookup', fig: 'f10-25', auto: v => has(v, 'vs') ? muFit(v.vs) : undefined, hint: 'auto = Eqs. 10-26/10-27; Mott Ex. 10-9 reads 0.022 from Fig. 10-25',
              work: v => has(v, 'vs') ? '\\(\\mu = ' + (v.vs >= 10 ? '0.103e^{-0.110(' + fmt(v.vs) + ')^{0.450}} + 0.012' : '0.124e^{-0.074(' + fmt(v.vs) + ')^{0.645}}') + ' = ' + fmt(muFit(v.vs), 3) + '\\)' : null },
            { id: 'fstat', symbol: '\\mu_{static}', label: 'Static coefficient of friction', kind: 'input', default: 0.15, hint: '≈ 0.15 steel/bronze (Fig. 10-25 at vs = 0; course)' },
            { id: 'lock', symbol: '\\cos\\phi_n\\tan\\lambda', label: 'Self-locking criterion value (compare with μ_static)', kind: 'calc', compute: v => has(v, 'phin', 'lam') ? cos(r(v.phin)) * tan(r(v.lam)) : undefined,
              work: v => has(v, 'phin', 'lam') ? '\\(\\cos ' + fmt(v.phin) + '^\\circ\\tan ' + fmt(v.lam) + '^\\circ = ' + fmt(cos(r(v.phin)) * tan(r(v.lam)), 3) + '\\)' : null },
          ],
          after: v => has(v, 'lock', 'fstat', 'lam') ? (v.fstat > v.lock ? '<span class="result-ok">Self-locking: μ<sub>static</sub> = ' + fmt(v.fstat) + ' &gt; cos φ<sub>n</sub> tan λ = ' + fmt(v.lock, 3) + ' (λ = ' + fmt(v.lam) + '°) — the gear cannot back-drive the worm</span>' : '<span class="result-bad">NOT self-locking: μ<sub>static</sub> = ' + fmt(v.fstat) + ' &lt; cos φ<sub>n</sub> tan λ = ' + fmt(v.lock, 3) + ' (λ = ' + fmt(v.lam) + '°) — the gear can back-drive the worm</span>') : '' },
      ] },

      { title: '6-10 · Forces, friction loss, input power, efficiency', steps: [
        { id: 'f6', title: 'Step 6 — forces on the wormgear', eq: '10-28 … 10-31', fig: ['f10-24', 'f13-36'],
          formula: 'T_o = \\frac{63\\,000P_o}{n_G},\\quad W_{tG} = \\frac{2T_o K_a n_d}{D_G}\\ (\\text{Mott})\\ \\text{or}\\ \\frac{33\\,000\\,n_d P_o K_a}{v_{tG}\\,\\eta}\\ (\\text{Shigley 15-58, course}),\\quad W_{xG} = W_{tG}\\frac{\\cos\\phi_n\\sin\\lambda + \\mu\\cos\\lambda}{\\cos\\phi_n\\cos\\lambda - \\mu\\sin\\lambda},\\quad W_{rG} = \\frac{W_{tG}\\sin\\phi_n}{\\cos\\phi_n\\cos\\lambda - \\mu\\sin\\lambda}',
          text: '<b>Directions (Fig. 10-24):</b> W<sub>tG</sub> is tangent to the gear pitch circle in its direction of rotation (it is the driven member) and is parallel to the worm axis; W<sub>xG</sub> is along the gear axis (thrust on the gear shaft) and is parallel to the worm\'s tangential direction; W<sub>rG</sub> points from the mesh toward the gear axis. The worm forces are the same three magnitudes swapped and reversed: W<sub>tW</sub> = W<sub>xG</sub>, W<sub>xW</sub> = W<sub>tG</sub>, W<sub>rW</sub> = W<sub>rG</sub> (Eq. 10-23). To find the sense, treat the worm as a screw: a right-hand worm turned clockwise (seen from its end) pushes the gear tooth like a nut moving along the screw.',
          vars: [
            { id: 'ToC', symbol: 'T_o', label: 'Output torque', unit: 'lb·in', kind: 'calc', compute: v => has(v, 'To') ? v.To : (has(v, 'PoIn', 'nG') ? 63000 * v.PoIn / v.nG : undefined) },
            { id: 'Po', symbol: 'P_o', label: 'Output power', unit: 'hp', kind: 'calc', compute: v => has(v, 'PoIn') ? v.PoIn : (has(v, 'To', 'nG') ? v.To * v.nG / 63000 : undefined), work: v => has(v, 'To', 'nG') && !has(v, 'PoIn') ? '\\(P_o = T_o n_G/63\\,000 = ' + fmt(v.To) + '(' + fmt(v.nG) + ')/63\\,000 = ' + fmt(v.To * v.nG / 63000, 3) + '\\) hp' : null },
            { id: 'etaF', symbol: '\\eta', label: 'Efficiency from Eq. 10-36 (needed for the Shigley/course load basis)', kind: 'calc', compute: v => has(v, 'phin', 'mu', 'lam') ? (cos(r(v.phin)) - v.mu * tan(r(v.lam))) / (cos(r(v.phin)) + v.mu / tan(r(v.lam))) : undefined,
              work: v => has(v, 'phin', 'mu', 'lam') ? '\\(\\eta = \\frac{\\cos ' + fmt(v.phin) + '^\\circ - ' + fmt(v.mu, 3) + '\\tan ' + fmt(v.lam) + '^\\circ}{\\cos ' + fmt(v.phin) + '^\\circ + ' + fmt(v.mu, 3) + '/\\tan ' + fmt(v.lam) + '^\\circ} = ' + fmt((cos(r(v.phin)) - v.mu * tan(r(v.lam))) / (cos(r(v.phin)) + v.mu / tan(r(v.lam)))) + '\\)' : null },
            { id: 'WtG0', symbol: '2T_o K_a n_d/D_G', label: 'Gear tangential force, Mott basis', unit: 'lb', kind: 'calc', compute: v => has(v, 'ToC', 'DG', 'Ka', 'nd') ? 2 * v.ToC * v.Ka * v.nd / v.DG : undefined, work: v => has(v, 'ToC', 'DG', 'Ka', 'nd') ? '\\(2(' + fmt(v.ToC) + ')(' + fmt(v.Ka) + ')(' + fmt(v.nd) + ')/' + fmt(v.DG) + ' = ' + fmt(2 * v.ToC * v.Ka * v.nd / v.DG) + '\\) lb' : null },
            { id: 'WtG', symbol: 'W_{tG}', label: 'Tangential force on gear used below (= WxW)', unit: 'lb', kind: 'calc', compute: v => has(v, 'WtG0', 'basis') ? (v.basis === 'shigley' ? (has(v, 'etaF') ? v.WtG0 / v.etaF : undefined) : v.WtG0) : undefined,
              work: v => has(v, 'WtG0', 'basis') ? (v.basis === 'shigley' && has(v, 'etaF') ? '\\(W_{tG} = \\frac{33\\,000\\,n_d P_o K_a}{v_{tG}\\,\\eta} = ' + fmt(v.WtG0) + '/' + fmt(v.etaF) + ' = ' + fmt(v.WtG0 / v.etaF) + '\\) lb (Shigley 15-58 / course)' : '\\(W_{tG} = ' + fmt(v.WtG0) + '\\) lb (Mott 10-29)') : null },
            { id: 'den', symbol: '', label: 'cos φn cos λ − μ sin λ (recurs)', kind: 'calc', compute: v => has(v, 'phin', 'lam', 'mu') ? cos(r(v.phin)) * cos(r(v.lam)) - v.mu * sin(r(v.lam)) : undefined },
            { id: 'WxG', symbol: 'W_{xG}', label: 'Axial force on gear (= WtW)', unit: 'lb', kind: 'calc', compute: v => has(v, 'WtG', 'phin', 'lam', 'mu', 'den') ? v.WtG * (cos(r(v.phin)) * sin(r(v.lam)) + v.mu * cos(r(v.lam))) / v.den : undefined,
              work: v => has(v, 'WtG', 'phin', 'lam', 'mu', 'den') ? '\\(W_{xG} = ' + fmt(v.WtG) + '\\left[\\frac{(' + fmt(cos(r(v.phin)), 3) + ')(' + fmt(sin(r(v.lam)), 3) + ') + (' + fmt(v.mu, 3) + ')(' + fmt(cos(r(v.lam)), 3) + ')}{(' + fmt(cos(r(v.phin)), 3) + ')(' + fmt(cos(r(v.lam)), 3) + ') - (' + fmt(v.mu, 3) + ')(' + fmt(sin(r(v.lam)), 3) + ')}\\right] = ' + fmt(v.WtG * (cos(r(v.phin)) * sin(r(v.lam)) + v.mu * cos(r(v.lam))) / v.den) + '\\) lb' : null },
            { id: 'WrG', symbol: 'W_{rG}', label: 'Radial force on gear (= WrW)', unit: 'lb', kind: 'calc', compute: v => has(v, 'WtG', 'phin', 'den') ? v.WtG * sin(r(v.phin)) / v.den : undefined,
              work: v => has(v, 'WtG', 'phin', 'den') ? '\\(W_{rG} = \\frac{' + fmt(v.WtG) + '(' + fmt(sin(r(v.phin)), 3) + ')}{' + fmt(v.den, 4) + '} = ' + fmt(v.WtG * sin(r(v.phin)) / v.den) + '\\) lb' : null },
            { id: 'WtW', symbol: 'W_{tW}', label: 'Worm tangential force', unit: 'lb', kind: 'calc', compute: v => has(v, 'WxG') ? v.WxG : undefined },
            { id: 'TW', symbol: 'T_W', label: 'Input torque on worm  WtW DW/2', unit: 'lb·in', kind: 'calc', compute: v => has(v, 'WtW', 'DW') ? v.WtW * v.DW / 2 : undefined },
          ] },
        { id: 'f7', title: 'Steps 7-10 — friction force, power loss, input power, efficiency', eq: '10-32 … 10-36', fig: ['f10-26'],
          formula: 'W_f = \\frac{\\mu W_{tG}}{\\cos\\lambda\\cos\\phi_n - \\mu\\sin\\lambda},\\quad P_L = \\frac{v_s W_f}{33\\,000},\\quad P_i = P_o + P_L,\\quad \\eta = \\frac{P_o}{P_i} = \\frac{\\cos\\phi_n - \\mu\\tan\\lambda}{\\cos\\phi_n + \\mu/\\tan\\lambda}',
          vars: [
            { id: 'Wf', symbol: 'W_f', label: 'Friction force', unit: 'lb', kind: 'calc', compute: v => has(v, 'mu', 'WtG', 'den') ? v.mu * v.WtG / v.den : undefined, work: v => has(v, 'mu', 'WtG', 'den') ? '\\(W_f = ' + fmt(v.mu, 3) + '(' + fmt(v.WtG) + ')/' + fmt(v.den, 4) + ' = ' + fmt(v.mu * v.WtG / v.den) + '\\) lb' : null },
            { id: 'PL', symbol: 'P_L', label: 'Power loss due to friction', unit: 'hp', kind: 'calc', compute: v => has(v, 'vs', 'Wf') ? v.vs * v.Wf / 33000 : undefined, work: v => has(v, 'vs', 'Wf') ? '\\(P_L = ' + fmt(v.vs) + '(' + fmt(v.Wf) + ')/33\\,000 = ' + fmt(v.vs * v.Wf / 33000, 3) + '\\) hp' : null },
            { id: 'PoG', symbol: 'P_G', label: 'Gear power carried by W_tG  (W_tG v_tG/33 000; = Po on the Mott basis, Po·Ka·nd/η on the course basis)', unit: 'hp', kind: 'calc', compute: v => has(v, 'WtG', 'vtG') ? v.WtG * v.vtG / 33000 : undefined, work: v => has(v, 'WtG', 'vtG') ? '\\(P_G = ' + fmt(v.WtG) + '(' + fmt(v.vtG) + ')/33\\,000 = ' + fmt(v.WtG * v.vtG / 33000, 3) + '\\) hp' : null },
            { id: 'Pi', symbol: 'P_i', label: 'Input power  P_G + P_L', unit: 'hp', kind: 'calc', compute: v => has(v, 'PoG', 'PL') ? v.PoG + v.PL : undefined, work: v => has(v, 'PoG', 'PL') ? '\\(P_i = ' + fmt(v.PoG, 3) + ' + ' + fmt(v.PL, 3) + ' = ' + fmt(v.PoG + v.PL, 3) + '\\) hp' : null },
            { id: 'eta', symbol: '\\eta', label: 'Efficiency P_G/P_i', unit: '%', kind: 'calc', compute: v => has(v, 'PoG', 'Pi') ? 100 * v.PoG / v.Pi : undefined, work: v => has(v, 'PoG', 'Pi') ? '\\(\\eta = ' + fmt(v.PoG, 3) + '/' + fmt(v.Pi, 3) + ' = ' + fmt(100 * v.PoG / v.Pi, 3) + '\\%\\)' : null },
            { id: 'eta2', symbol: '\\eta_{(10\\text{-}36)}', label: 'Efficiency from Eq. 10-36 (check)', unit: '%', kind: 'calc', compute: v => has(v, 'phin', 'mu', 'lam') ? 100 * (cos(r(v.phin)) - v.mu * tan(r(v.lam))) / (cos(r(v.phin)) + v.mu / tan(r(v.lam))) : undefined },
          ] },
      ] },

      { title: '11-15 · Bending stress in the wormgear teeth (Sec. 10-11)', steps: [
        { id: 's', title: 'Lewis form factor, normal pitch, dynamic load, stress', eq: '10-37 … 10-41', fig: ['t10-5', 'cbend'],
          formula: 'p_n = p\\cos\\lambda,\\quad K_v = \\frac{1200}{1200 + v_{tG}},\\quad W_d = \\frac{W_{tG}}{K_v},\\quad \\sigma = \\frac{W_d}{y\\,F_e\\,p_n}\\qquad\\left(\\text{Shigley 15-53: } \\sigma_a = \\frac{W_{tG}}{p_n F_e y}\\right)',
          text: 'Course (Worm Gears s19): y = 0.125 for φ<sub>n</sub> = 20° (Table 10-5); compare with the fatigue strength of the gear material, <b>σ<sub>all</sub> = 24 000 psi for bronze gears</b> (phosphor bronze, most common; manganese bronze 17 000; cast iron ≈ 0.35 s<sub>u</sub>). "Mott uses a modified dynamic load" — the course shows both the Shigley value (no K<sub>v</sub>) and Mott\'s; Mott\'s is the governing (more conservative) one here. Face width capped at F<sub>e</sub> = 0.67 D<sub>W</sub>.',
          vars: [
            { id: 'y', symbol: 'y', label: 'Lewis form factor', kind: 'lookup', fig: 't10-5', auto: v => has(v, 'phin') ? (v.phin < 17 ? 0.100 : v.phin < 22.5 ? 0.125 : v.phin < 27.5 ? 0.150 : 0.175) : undefined, hint: 'Table 10-5 by φn (14.5° 0.100, 20° 0.125 course, 25° 0.150, 30° 0.175)' },
            { id: 'pn', symbol: 'p_n', label: 'Normal circular pitch', unit: 'in', kind: 'calc', compute: v => has(v, 'p', 'lam') ? v.p * cos(r(v.lam)) : undefined, work: v => has(v, 'p', 'lam') ? '\\(p_n = ' + fmt(v.p) + '\\cos ' + fmt(v.lam) + '^\\circ = ' + fmt(v.p * cos(r(v.lam))) + '\\) in' : null },
            { id: 'Kv', symbol: 'K_v', label: 'Dynamic factor', kind: 'calc', compute: v => has(v, 'vtG') ? 1200 / (1200 + v.vtG) : undefined, work: v => has(v, 'vtG') ? '\\(K_v = 1200/(1200 + ' + fmt(v.vtG) + ') = ' + fmt(1200 / (1200 + v.vtG), 3) + '\\)' : null },
            { id: 'Wd', symbol: 'W_d', label: 'Dynamic load', unit: 'lb', kind: 'calc', compute: v => has(v, 'WtG', 'Kv') ? v.WtG / v.Kv : undefined },
            { id: 'FeB', symbol: 'F_e', label: 'Effective face width min(F, 0.67 DW)', unit: 'in', kind: 'calc', compute: v => has(v, 'F', 'DW') ? Math.min(v.F, 0.67 * v.DW) : undefined },
            { id: 'sig', symbol: '\\sigma', label: 'Bending stress in gear teeth (Mott, dynamic load)', unit: 'psi', kind: 'calc', compute: v => has(v, 'Wd', 'y', 'FeB', 'pn') ? v.Wd / (v.y * v.FeB * v.pn) : undefined,
              work: v => has(v, 'Wd', 'y', 'FeB', 'pn') ? '\\(\\sigma = \\frac{' + fmt(v.Wd) + '}{(' + fmt(v.y, 3) + ')(' + fmt(v.FeB) + ')(' + fmt(v.pn) + ')} = ' + fmt(v.Wd / (v.y * v.FeB * v.pn), 5) + '\\) psi' : null },
            { id: 'sigS', symbol: '\\sigma_a', label: 'Bending stress, Shigley Eq. 15-53 form (no Kv)', unit: 'psi', kind: 'calc', compute: v => has(v, 'WtG', 'y', 'FeB', 'pn') ? v.WtG / (v.y * v.FeB * v.pn) : undefined,
              work: v => has(v, 'WtG', 'y', 'FeB', 'pn') ? '\\(\\sigma_a = \\frac{' + fmt(v.WtG) + '}{' + fmt(v.pn) + '(' + fmt(v.FeB) + ')(' + fmt(v.y, 3) + ')} = ' + fmt(v.WtG / (v.y * v.FeB * v.pn), 5) + '\\) psi' : null },
            { id: 'sall', symbol: '\\sigma_{all}', label: 'Fatigue strength of gear material', unit: 'psi', kind: 'input', default: 24000, hint: '24 000 phosphor bronze (course default); 17 000 manganese bronze' },
            { id: 'FSb', symbol: 'FS', label: 'Bending safety factor σall/σ', kind: 'calc', compute: v => has(v, 'sall', 'sig') ? v.sall / v.sig : undefined },
          ],
          after: v => has(v, 'FSb') ? (v.FSb >= 1 ? '<span class="result-ok">Bending OK — σ = ' + fmt(v.sig, 4) + ' psi ≤ ' + fmt(v.sall, 4) + ' psi (FS = ' + fmt(v.FSb, 3) + ')</span>' : '<span class="result-bad">Bending FAIL — σ = ' + fmt(v.sig, 4) + ' psi &gt; ' + fmt(v.sall, 4) + ' psi</span>') : '' },
      ] },

      { title: '16-21 · Surface durability — rated tangential load (Sec. 10-12, Eq. 10-42)', steps: [
        { id: 'c', title: 'Steps 16-18 — Cs, Cm, Cv', eq: '10-43 … 10-51', fig: ['f10-27', 'f10-28', 'f10-29'],
          formula: 'C_s = \\begin{cases}1189.636 - 476.545\\log_{10}D_G & \\text{sand, } D_G\\gt 2.5\\\\ 1411.651 - 455.825\\log_{10}D_G & \\text{chill/forged, } D_G\\gt 8\\\\ 1251.291 - 179.750\\log_{10}D_G & \\text{centrifugal, } D_G\\gt 25\\\\ 1000 & \\text{otherwise}\\end{cases}',
          text: 'C<sub>m</sub>: 0.0200(−m<sub>G</sub>² + 40m<sub>G</sub> − 76)<sup>0.5</sup> + 0.46 (6 &lt; m<sub>G</sub> ≤ 20); 0.0107(−m<sub>G</sub>² + 56m<sub>G</sub> + 5145)<sup>0.5</sup> (20 &lt; m<sub>G</sub> ≤ 76); 1.1483 − 0.00658 m<sub>G</sub> (m<sub>G</sub> &gt; 76). C<sub>v</sub>: 0.659e<sup>−0.0011 v<sub>s</sub></sup> (v<sub>s</sub> &lt; 700); 13.31 v<sub>s</sub><sup>−0.571</sup> (700-3000); 65.52 v<sub>s</sub><sup>−0.774</sup> (&gt; 3000 ft/min). Mott Ex. 10-10 reads the charts: C<sub>s</sub> = 740, C<sub>m</sub> = 0.814, C<sub>v</sub> = 0.265 — the equations give nearly the same.',
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
          text: 'Mott (and AGMA) cap the face width at 0.67 D<sub>W</sub>; the Fizz/Mech bibles print D<sub>W</sub>/3 — follow the textbook (0.67 D<sub>W</sub>), which is also what Mott Ex. 10-10 uses (1.333 in for D<sub>W</sub> = 2 in).',
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
            let s = ok ? '<b><span class="result-ok">DESIGN SATISFACTORY for pitting resistance</span></b> — W<sub>tR</sub> = ' + fmt(v.WtR) + ' lb &gt; W<sub>tG</sub> = ' + fmt(v.WtG) + ' lb (margin ' + fmt(v.ratio, 3) + ')'
              : '<b><span class="result-bad">DESIGN NOT SATISFACTORY for pitting</span></b> — W<sub>tR</sub> = ' + fmt(v.WtR) + ' lb ≤ W<sub>tG</sub> = ' + fmt(v.WtG) + ' lb: use a larger gear, wider face (up to 0.67 D<sub>W</sub>) or a better bronze';
            if (has(v, 'FSb')) s += '; bending ' + (v.FSb >= 1 ? 'OK' : 'FAIL') + ' (σ = ' + fmt(v.sig, 4) + ' psi)';
            if (has(v, 'eta')) s += '; efficiency ' + fmt(v.eta, 3) + ' %, input ' + fmt(v.Pi, 3) + ' hp for ' + fmt(v.Po, 3) + ' hp out';
            if (has(v, 'ts', 'tmax')) s += '; thermal ' + (v.ts <= v.tmax ? 'OK' : 'FAIL') + ' (t_s = ' + fmt(v.ts) + ' °F)';
            return s + '.';
          } },
      ] },

      { title: 'Heat dissipation (course add-on from Shigley Eqs. 15-49 … 15-52; not in Mott)', steps: [
        { id: 'heat', title: 'Heat loss, case area and oil-sump temperature', fig: ['cheat'],
          formula: 'H_{loss} = 33\\,000(1-\\eta)P_i,\\quad \\hbar_{CR} = \\begin{cases}n_W/6494 + 0.13 & \\text{no fan}\\\\ n_W/3939 + 0.13 & \\text{fan on worm shaft}\\end{cases},\\quad t_s = t_a + \\frac{H_{loss}}{\\hbar_{CR}A},\\quad A_{min} = 43.20C^{1.7}',
          text: 'P<sub>i</sub> is the input power from steps 7-10. A is the <b>total</b> lateral case area in in² (course example: 850 in² per side → 1700). Course: "better to assume no fan"; lubricant limit 250 °F (120 °C).',
          vars: [
            { id: 'fan', symbol: '', label: 'Cooling', kind: 'choice', options: [{ label: 'No fan on worm shaft (course default)', value: 0 }, { label: 'Fan on worm shaft', value: 1 }], default: 0 },
            { id: 'A', symbol: 'A', label: 'Case lateral area (total)', unit: 'in²', kind: 'input', hint: 'blank → use Amin' },
            { id: 'ta', symbol: 't_a', label: 'Ambient temperature', unit: '°F', kind: 'input', default: 70 },
            { id: 'tmax', symbol: 't_{max}', label: 'Oil temperature limit', unit: '°F', kind: 'input', default: 250, hint: 'course: 250 °F (120 °C); 200 °F conservative' },
            { id: 'Hloss', symbol: 'H_{loss}', label: 'Heat loss rate', unit: 'ft·lb/min', kind: 'calc', compute: v => has(v, 'eta', 'Pi') ? 33000 * (1 - v.eta / 100) * v.Pi : undefined,
              work: v => has(v, 'eta', 'Pi') ? '\\(H_{loss} = 33\\,000(1 - ' + fmt(v.eta / 100, 3) + ')(' + fmt(v.Pi, 3) + ') = ' + fmt(33000 * (1 - v.eta / 100) * v.Pi, 5) + '\\) ft·lb/min' : null },
            { id: 'hcr', symbol: '\\hbar_{CR}', label: 'Combined heat-transfer coefficient', unit: 'ft·lb/(min·in²·°F)', kind: 'calc', compute: v => has(v, 'nW', 'fan') ? v.nW / (v.fan ? 3939 : 6494) + 0.13 : undefined,
              work: v => has(v, 'nW', 'fan') ? '\\(\\hbar_{CR} = ' + fmt(v.nW) + '/' + (v.fan ? 3939 : 6494) + ' + 0.13 = ' + fmt(v.nW / (v.fan ? 3939 : 6494) + 0.13, 3) + '\\)' : null },
            { id: 'Amin', symbol: 'A_{min}', label: 'AGMA minimum lateral area', unit: 'in²', kind: 'calc', compute: v => has(v, 'C') ? 43.2 * Math.pow(v.C, 1.7) : undefined, work: v => has(v, 'C') ? '\\(A_{min} = 43.2(' + fmt(v.C) + ')^{1.7} = ' + fmt(43.2 * Math.pow(v.C, 1.7)) + '\\) in²' : null },
            { id: 'Ause', symbol: 'A_{used}', label: 'Area used in the balance', unit: 'in²', kind: 'calc', compute: v => has(v, 'A') ? v.A : (has(v, 'Amin') ? v.Amin : undefined) },
            { id: 'ts', symbol: 't_s', label: 'Oil sump temperature', unit: '°F', kind: 'calc', compute: v => has(v, 'ta', 'Hloss', 'hcr', 'Ause') ? v.ta + v.Hloss / (v.hcr * v.Ause) : undefined,
              work: v => has(v, 'ta', 'Hloss', 'hcr', 'Ause') ? '\\(t_s = ' + fmt(v.ta) + ' + \\frac{' + fmt(v.Hloss, 5) + '}{' + fmt(v.hcr, 3) + '(' + fmt(v.Ause) + ')} = ' + fmt(v.ta + v.Hloss / (v.hcr * v.Ause)) + '^\\circ\\)F' : null },
          ],
          after: v => {
            if (!has(v, 'ts', 'tmax')) return '';
            let s = v.ts <= v.tmax ? '<span class="result-ok">Thermal OK — t<sub>s</sub> = ' + fmt(v.ts) + ' °F ≤ ' + fmt(v.tmax) + ' °F</span>' : '<span class="result-bad">Thermal problem — t<sub>s</sub> = ' + fmt(v.ts) + ' °F &gt; ' + fmt(v.tmax) + ' °F: add a fan, more case area or external cooling</span>';
            if (has(v, 'A', 'Amin') && v.A < v.Amin) s += ' <span class="result-bad">(case area ' + fmt(v.A) + ' in² is below AGMA A<sub>min</sub> = ' + fmt(v.Amin) + ' in²)</span>';
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
