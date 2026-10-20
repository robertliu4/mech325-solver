/* Helical gears — Shigley 11e (Sec. 13-10 geometry, 13-15 forces, Ch. 14 AGMA with helical J and I). Merged Fizz + Mech-guide procedure.
 * Defaults follow the UBC MECH 325 course conventions (v2/COURSE_CONVENTIONS.md §6–8: Helical_Bevel_…_2025 slides s2–s13, Module 2 p16–27, Gear Trains Tut 4).
 * Verified against: Gear Trains Tutorial 4 / Module 2 p16–27 (Shigley 14-22 mod.: 5 hp, 300 rpm, 16/48 T, P_n = 6, ψ = 25°, F = 2, Q_v = 6, K_s formula,
 *   J' = 0.47 × K_J' 0.96, R = 0.90, 10^8 cycles → P_t 5.438, d_P 2.942, V 231.1, W_t 714, K_v 1.206, K_s 1.088, K_m 1.214, J 0.451, σ 6850 psi,
 *   S_t,min (SF = 1) 5961 psi (course 5947), I 0.1909 (course 0.190), σ_c 73.2 ksi (course ≈ 74.0), S_c,min 65.6 ksi (course 66.2), 200 HB → S_F 4.74 (4.8), S_H 1.43 (1.41)).
 * Verified against: Gear Trains Tutorial 1 Q1 / Module 2 p1–3 (P_n = 6, ψ = 25°, 16/36 T → P_t 5.438, d_4 2.942, d_5 6.620, C 4.78 in). */
(function () {
  const has = (v, ...ids) => H.has(v, ...ids);
  const f = (x, d) => H.fmt(x, d);
  const cosd = a => Math.cos(H.rad(a)), sind = a => Math.sin(H.rad(a)), tand = a => Math.tan(H.rad(a));
  const Y_N = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 24, 26, 28, 30, 34, 38, 43, 50, 60, 75, 100, 150, 300, 400];
  const Y_V = [0.245, 0.261, 0.277, 0.29, 0.296, 0.303, 0.309, 0.314, 0.322, 0.328, 0.331, 0.337, 0.346, 0.353, 0.359, 0.371, 0.384, 0.397, 0.409, 0.422, 0.435, 0.447, 0.46, 0.472, 0.48];
  const lewisY = N => H.interp(N, Y_N, Y_V);
  // rough read of Fig 14-7 (J' vs N at ψ ≈ 15–30°, 75-tooth mate) and Fig 14-8 multiplier vs mating teeth
  const Jp = N => H.interp(N, [17, 20, 30, 52, 60, 150, 500], [0.45, 0.465, 0.50, 0.54, 0.55, 0.59, 0.62]);
  const Jmult = Nm => H.interp(Nm, [20, 30, 50, 75, 150, 500], [0.93, 0.96, 0.985, 1.0, 1.015, 1.03]);
  const CMA = { open: [0.247, 0.0167, -0.765e-4], commercial: [0.127, 0.0158, -0.930e-4], precision: [0.0675, 0.0128, -0.926e-4], extra: [0.00360, 0.0102, -0.822e-4] };
  const KO = { uniform: { uniform: 1.00, moderate: 1.25, heavy: 1.75 }, light: { uniform: 1.25, moderate: 1.50, heavy: 2.00 }, medium: { uniform: 1.50, moderate: 1.75, heavy: 2.25 } };
  const KR = { 0.5: 0.70, 0.9: 0.85, 0.99: 1.00, 0.999: 1.25, 0.9999: 1.50 };
  const YN_auto = N => N >= 1e7 ? 1.3558 * Math.pow(N, -0.0178) : Math.max(1, 4.9404 * Math.pow(N, -0.1045));
  const ZN_auto = N => N >= 1e7 ? 1.4488 * Math.pow(N, -0.023) : 2.466 * Math.pow(N, -0.056);
  const okbad = (ok, txt) => '<span class="' + (ok ? 'result-ok' : 'result-bad') + '">' + txt + '</span>';

  window.TOPIC = {
    id: 'helical', book: 'shigley',
    title: 'Helical Gears — Geometry, Forces & AGMA Stress',
    subtitle: 'Shigley Sec. 13-10, 13-15, Ch. 14 · Fizz + Mech-guide procedure merged',
    sibling: 'helical_mott.html',
    intro: 'Parallel-shaft helical gears in Shigley notation. Same AGMA road map as spur gears — <b>only J and I change</b> (course, Helical/Bevel s6, s10): the bending equation uses the <b>transverse pitch P_t = P_n cos ψ</b>, J = K_J′ × J′ (Fig. 14-7 J′ for a 75-tooth mate × Fig. 14-8 multiplier), I from Eq. 14-23 with the load-sharing ratio m_N (Eqs. 14-21, 14-24, 14-25; Mott Table 10-1 accepted). <b>Defaults are the MECH 325 course assumptions</b> (same as the spur page: C_p = 2300, C_f = 1, K_s = 1 or formula, K_B = 1, K_T = 1, K_R = 1.00 at 99 %, C_H = 1, C_mc = C_pm = C_e = 1, C_ma curve 2, K_v by Eq. 14-27, life 10⁷ on the commercial Y_N/Z_N lines, Grade 1 steel, S_F = 1 then a steel from Mott Table 9-8 / App. 3). Note the instructor changed Shigley\'s 30° helix to <b>ψ = 25°</b> "to use the charts in Mott"; ≈ 15° is optimal. Fizz default when nothing is given: P_n = 12, N_P = 24, F ≈ 2 p_x. Example = Gear Trains Tutorial 4 (5 hp, 300 rpm, 16/48 T, P_n = 6, ψ = 25°).',
    example: { P: 5, nP: 300, src: 'uniform', drv: 'uniform', Pn: 6, psi: 25, phin: 20, NP: 16, NG: 48, F: 2, Qv: 6, ksMode: 2, JpP: 0.47, KJP: 0.96, JpG: 0.54, KJG: 0.93, Cmc: 1, Cpm: 1, cond: 'commercial', Ce: 1, Cp: 2300, R: 0.9, Lh: 5555.56, grade: 1, HBP: 200, HBG: 200, SFd: 1 },

    figures: [
      { id: 'f13-18', ref: 'Figure 13-18', title: 'Nomenclature of helical gears: p_t, p_n, p_x, ψ, φ_n, φ_t', src: 'figures/shigley/fig13-18.png', page: 718 },
      { id: 't13-4', ref: 'Table 13-4', title: 'Standard tooth proportions for helical gears (based on P_n)', src: 'figures/shigley/table13-4.png', page: 723, note: 'a = 1/P_n, b = 1.25/P_n, d = N/(P_n cos ψ), d_b = d cos φ_t.' },
      { id: 't13-2', ref: 'Table 13-2', title: 'Standard diametral pitches (P_n)', src: 'figures/shigley/table13-2.png', page: 722 },
      { id: 'f13-33', ref: 'Figure 13-33', title: 'Tooth forces on a right-hand helical gear: W_t, W_r, W_a', src: 'figures/shigley/fig13-33.png', page: 738, note: 'Eq. 13-40: W_r = W tan... → W_r = W_t tan φ_t, W_a = W_t tan ψ, W = W_t/(cos φ_n cos ψ).' },
      { id: 'ko', ref: 'Figure 14-17', title: 'Table of overload factors K_o', src: 'figures/shigley/fig14-17-ko.png', page: 793 },
      { id: 'mko', ref: 'Table 9-1', book: 'mott', title: 'Suggested overload factors K_o (Mott, more conservative)', src: 'figures/mott/table9-1.png', page: 395 },
      { id: 'm9-11', ref: 'Figure 9-11', book: 'mott', title: 'Trial diametral pitch from design power & pinion speed (Mott, spur basis)', src: 'figures/mott/fig9-11.png', page: 394, note: 'Only a rough guide for helical gears. Fizz: just take P_n = 12, N_P = 24.' },
      { id: 'av', ref: 'Table 9-5', book: 'mott', title: 'Recommended AGMA quality numbers A_v (A_v + Q_v = 17)', src: 'figures/mott/table9-5.png', page: 399 },
      { id: 'f14-9', ref: 'Figure 14-9', title: 'Dynamic factor K_v', src: 'figures/shigley/fig14-9.png', page: 785 },
      { id: 'eq14-27', ref: 'Equations 14-27 to 14-29', title: 'K_v curve fit', src: 'figures/shigley/eq14-27-29.png', page: 784 },
      { id: 't14-2', ref: 'Table 14-2', title: 'Lewis form factor Y (optional size factor equation)', src: 'figures/shigley/table14-2.png', page: 765 },
      { id: 'f14-7', ref: 'Figure 14-7', title: 'Helical-gear geometry factor J′ (20° normal, 75-tooth mate)', src: 'figures/shigley/fig14-7.png', page: 781, note: 'x = helix angle ψ, curve = number of teeth of the gear you want J′ for. Then multiply by the Fig. 14-8 factor for the actual mating tooth count: J = J′ × K_J′.' },
      { id: 'f14-8', ref: 'Figure 14-8', title: 'J′-factor multipliers (mating gear teeth ≠ 75)', src: 'figures/shigley/fig14-8.png', page: 782, note: 'x = ψ, curve = teeth in the MATING element.' },
      { id: 'f14-10', ref: 'Figure 14-10', title: 'S and S₁ for C_pm', src: 'figures/shigley/fig14-10.png', page: 787 },
      { id: 'eq14-30', ref: 'Equations 14-30 to 14-35', title: 'K_m components', src: 'figures/shigley/eq14-30-35.png', page: 787 },
      { id: 't14-9', ref: 'Table 14-9', title: 'C_ma constants A, B, C', src: 'figures/shigley/table14-9.png', page: 787 },
      { id: 'f14-11', ref: 'Figure 14-11', title: 'Mesh alignment factor C_ma', src: 'figures/shigley/fig14-11.png', page: 788 },
      { id: 'f14-16', ref: 'Figure 14-16', title: 'Rim-thickness factor K_B', src: 'figures/shigley/fig14-16.png', page: 791 },
      { id: 't14-8', ref: 'Table 14-8', title: 'Elastic coefficient C_p', src: 'figures/shigley/table14-8.png', page: 783 },
      { id: 'f14-2', ref: 'Figure 14-2', title: 'Bending strength S_t vs H_B (through-hardened)', src: 'figures/shigley/fig14-2.png', page: 773 },
      { id: 'f14-5', ref: 'Figure 14-5', title: 'Contact strength S_c vs H_B (through-hardened)', src: 'figures/shigley/fig14-5.png', page: 776 },
      { id: 't14-3', ref: 'Table 14-3', title: 'S_t for steel gears (case-hardened)', src: 'figures/shigley/table14-3.png', page: 775 },
      { id: 't14-6', ref: 'Table 14-6', title: 'S_c for steel gears (case-hardened)', src: 'figures/shigley/table14-6.png', page: 777 },
      { id: 'f14-14', ref: 'Figure 14-14', title: 'Y_N', src: 'figures/shigley/fig14-14.png', page: 790 },
      { id: 'f14-15', ref: 'Figure 14-15', title: 'Z_N', src: 'figures/shigley/fig14-15.png', page: 790 },
      { id: 't14-10', ref: 'Table 14-10', title: 'Reliability factor K_R', src: 'figures/shigley/table14-10.png', page: 791 },
      { id: 'f14-12', ref: 'Figure 14-12', title: 'Hardness-ratio factor C_H', src: 'figures/shigley/fig14-12.png', page: 789 },
      { id: 'f14-17', ref: 'Figure 14-17', title: 'Road map — bending', src: 'figures/shigley/fig14-17.png', page: 793 },
      { id: 'f14-18', ref: 'Figure 14-18', title: 'Road map — wear', src: 'figures/shigley/fig14-18.png', page: 794 },
      { id: 'mlife', ref: 'Table 9-12', book: 'mott', title: 'Recommended design life (hours)', src: 'figures/mott/table9-12.png', page: 411, note: 'Course default when nothing is given: 10⁷ cycles.' },
      { id: 'mt10-1', ref: 'Table 10-1', book: 'mott', title: 'Pitting geometry factor I for 20° normal pressure angle, ψ = 15° and 25° (Mott) — accepted alternative', src: 'figures/mott/table10-1.png', page: 454, note: 'Tutorial: I = 0.199 (Mott) vs 0.190 (Eq. 14-23) for 16/48 T, ψ = 25°.' },
      { id: 'mf10-6', ref: 'Figure 10-6', book: 'mott', title: 'Helical J′ and multiplier, 20° normal pressure angle (Mott) — accepted alternative', src: 'figures/mott/fig10-6.png', page: 452, note: 'Shigley Fig. 14-7 reads J′ = 0.505 vs Mott 0.46 for the 20T/100T, ψ = 20° lecture example; either is accepted.' },
      { id: 'mt9-8', ref: 'Table 9-8', book: 'mott', title: 'Gear materials: through-hardened and carburized alloys (Mott)', src: 'figures/mott/table9-8.png', page: 406, note: 'Course: pick alloy + heat treatment by HB and quote HB and % elongation from Appendix 3.' },
      { id: 'mapp3a', ref: 'Appendix 3', book: 'mott', title: 'Steel properties: s_u, s_y, % elongation, HB (1020 … 4150)', src: 'figures/mott/appendix3a.png', page: 804, note: 'Tutorial 4: 4140 OQT1300 HB 235 → SF 1.58; 4140 annealed HB 197 → 1.40.' },
      { id: 'mapp3b', ref: 'Appendix 3 (cont.)', book: 'mott', title: 'Steel properties (4340 … 9255)', src: 'figures/mott/appendix3b.png', page: 805 },
      // ---- course-only slides (v2/COURSE_CONVENTIONS.md §16) ----
      { id: 'cj', ref: 'Helical/Bevel s7', book: 'course', title: 'J = K_J′ × J′ — course explanation and worked numbers (20T/100T, ψ = 20°)', src: 'figures/course/helical_j_modifier_example.png', note: '"K_J′ is not an official AGMA variable." J_P = 0.46 × 1.01 = 0.47, J_G = 0.55 × 0.935 = 0.51. Tutorial extrapolates below 20 T: 16 T at ψ = 25° → J′ ≈ 0.47.' },
      { id: 'cko', ref: 'Gear Stress s12', book: 'course', title: 'Overload factor K_o — Shigley table and Mott Table 9-1 side by side', src: 'figures/course/ko_shigley_vs_mott.png', note: 'Either accepted; tutorials use K_o = 1.' },
      { id: 'ckv', ref: 'Gear Stress s14', book: 'course', title: 'K_v analytical method and Mott Table 9-4: Q_v ↔ A_v mapping', src: 'figures/course/gear_kv_q_av_table.png', note: 'A_v + Q_v = 17. Course prefers the equation.' },
      { id: 'cks', ref: 'Gear Stress s15', book: 'course', title: 'Size factor K_s: "Typically K_s = 1" or the Lewis-Y formula', src: 'figures/course/gear_ks_course.png', note: 'Tutorial 4 keeps K_s = 1.088 (→ 1.09) from the formula.' },
      { id: 'ckm', ref: 'Gear Stress s19', book: 'course', title: 'K_m (Shigley form) with the course annotations: C_mc = 1, C_e = 1', src: 'figures/course/gear_km_shigley_annotated.png' },
      { id: 'ccma', ref: 'Gear Stress s20', book: 'course', title: 'C_ma — "default to curve 2 (commercial enclosed gear units)"', src: 'figures/course/gear_cma_curve2.png' },
      { id: 'cyn', ref: 'Gear Stress s37', book: 'course', title: 'Y_N — "use this line for normal commercial gears"', src: 'figures/course/gear_yn_course_line.png' },
      { id: 'czn', ref: 'Gear Stress s44', book: 'course', title: 'Z_N — normal commercial gears line', src: 'figures/course/gear_zn_course_line.png' },
      { id: 'cteeth', ref: 'Helical/Bevel s33', book: 'course', title: 'Standard gear teeth proportions and Lewis Y table', src: 'figures/course/standard_gear_teeth_table.png' },
    ],

    sections: [
      { title: 'Inputs & design decisions', steps: [
        { id: 'in', title: 'Power, speeds, overload', fig: ['cko', 'ko', 'mko'],
          text: 'Nameplate power and pinion speed; K_o from the Shigley table (course accepts Mott Table 9-1 too; tutorials use K_o = 1). US customary units throughout.',
          formula: 'P_{des} = K_o P,\\qquad VR = \\frac{n_P}{n_G}',
          vars: [
            { id: 'P', symbol: 'H', label: 'Transmitted power', unit: 'hp', kind: 'input' },
            { id: 'nP', symbol: 'n_P', label: 'Pinion speed', unit: 'rpm', kind: 'input' },
            { id: 'nGd', symbol: 'n_{G,des}', label: 'Desired gear speed (blank if N_G given)', unit: 'rpm', kind: 'input' },
            { id: 'src', label: 'Power source', kind: 'choice', type: 'text', options: [{ label: 'Uniform', value: 'uniform' }, { label: 'Light shock', value: 'light' }, { label: 'Medium shock', value: 'medium' }], default: 'uniform' },
            { id: 'drv', label: 'Driven machine', kind: 'choice', type: 'text', options: [{ label: 'Uniform', value: 'uniform' }, { label: 'Moderate shock', value: 'moderate' }, { label: 'Heavy shock', value: 'heavy' }], default: 'uniform' },
            { id: 'Ko', symbol: 'K_o', label: 'Overload factor', kind: 'lookup', fig: 'cko', hint: 'auto from the two selects (Shigley); Mott Table 9-1 also accepted', auto: v => (KO[v.src] && KO[v.src][v.drv]) || undefined },
            { id: 'Pdes', symbol: 'P_{des}', label: 'Design power', unit: 'hp', kind: 'calc', compute: v => has(v, 'P', 'Ko') ? v.P * v.Ko : undefined },
            { id: 'VRd', symbol: 'VR_{des}', label: 'Desired velocity ratio', kind: 'calc', compute: v => has(v, 'nP', 'nGd') && v.nGd > 0 ? v.nP / v.nGd : undefined },
          ] },
        { id: 'tooth', title: 'Normal pitch, helix angle, pressure angle, tooth numbers', fig: ['t13-2', 'm9-11', 't13-4'],
          text: 'Helical gears are specified in the NORMAL plane (cutter): normal diametral pitch P_n and normal pressure angle φ_n (20° standard). Fizz step 3: if nothing is given use P_n = 12 and N_P = 24. Helix angles of ≈ 15° are optimal (course); 15–30° typical. <b>Course note:</b> the instructor set ψ = 25° in the tutorial (Shigley\'s 14-22 uses 30°) so that Mott\'s 15°/25° J and I charts/tables apply — expect ψ = 15° or 25° in course problems. N_G = N_P·VR rounded.',
          formula: 'N_G = N_P\\,VR,\\qquad m_G = \\frac{N_G}{N_P},\\qquad n_G = n_P\\frac{N_P}{N_G}',
          vars: [
            { id: 'Pn', symbol: 'P_n', label: 'Normal diametral pitch', unit: 'teeth/in', kind: 'input', default: 12, hint: 'given, or Fizz default 12. Transverse P_t given? P_n = P_t / cos ψ' },
            { id: 'psi', symbol: '\\psi', label: 'Helix angle', unit: '°', kind: 'input', default: 15, hint: '15° optimal; course tutorial uses 25° (Mott charts cover 15° and 25°)', check: v => v.psi !== undefined && (v.psi < 5 || v.psi > 45) ? 'helix angles are normally 10–30°' : (v.psi !== undefined && v.psi !== 15 && v.psi !== 25 ? 'Mott Tables 10-1/10-2 only tabulate ψ = 15° and 25° — use Eq. 14-23 (auto) or interpolate' : null) },
            { id: 'phin', symbol: '\\phi_n', label: 'Normal pressure angle', unit: '°', kind: 'choice', options: [{ label: '20° (standard)', value: 20 }, { label: '14.5°', value: 14.5 }, { label: '25°', value: 25 }], default: 20 },
            { id: 'NP', symbol: 'N_P', label: 'Pinion teeth', kind: 'input', default: 24, hint: 'Fizz default 24' },
            { id: 'NG', symbol: 'N_G', label: 'Gear teeth', kind: 'input', hint: 'auto = round(N_P·VR_des)', auto: v => has(v, 'NP', 'VRd') ? Math.round(v.NP * v.VRd) : undefined },
            { id: 'mG', symbol: 'm_G', label: 'Gear ratio', kind: 'calc', compute: v => has(v, 'NP', 'NG') ? v.NG / v.NP : undefined },
            { id: 'nG', symbol: 'n_G', label: 'Actual gear speed', unit: 'rpm', kind: 'calc', compute: v => has(v, 'nP', 'NP', 'NG') ? v.nP * v.NP / v.NG : undefined },
          ] },
      ] },

      { title: 'Helical geometry (Mech-guide spec question)', steps: [
        { id: 'geo1', title: 'Transverse pitch, circular pitches, axial pitch, transverse pressure angle', eq: '13-16 … 13-19', fig: ['f13-18'],
          formula: 'P_t = P_n\\cos\\psi,\\quad p_t = \\frac{\\pi}{P_t},\\quad p_n = p_t\\cos\\psi = \\frac{\\pi}{P_n},\\quad p_x = \\frac{p_t}{\\tan\\psi},\\quad \\tan\\phi_t = \\frac{\\tan\\phi_n}{\\cos\\psi}',
          vars: [
            { id: 'Pt', symbol: 'P_t', label: 'Transverse diametral pitch', unit: 'teeth/in', kind: 'calc', compute: v => has(v, 'Pn', 'psi') ? v.Pn * cosd(v.psi) : undefined, work: v => has(v, 'Pn', 'psi') ? '\\(P_t = ' + f(v.Pn) + '\\cos ' + f(v.psi) + '^\\circ = ' + f(v.Pn * cosd(v.psi)) + '\\ \\mathrm{teeth/in}\\)' : null },
            { id: 'pt', symbol: 'p_t', label: 'Transverse circular pitch', unit: 'in', kind: 'calc', compute: v => has(v, 'Pt') ? Math.PI / v.Pt : undefined },
            { id: 'pn', symbol: 'p_n', label: 'Normal circular pitch', unit: 'in', kind: 'calc', compute: v => has(v, 'pt', 'psi') ? v.pt * cosd(v.psi) : undefined },
            { id: 'px', symbol: 'p_x', label: 'Axial pitch', unit: 'in', kind: 'calc', compute: v => has(v, 'pt', 'psi') ? v.pt / tand(v.psi) : undefined, work: v => has(v, 'pt', 'psi') ? '\\(p_x = ' + f(v.pt) + '/\\tan ' + f(v.psi) + '^\\circ = ' + f(v.pt / tand(v.psi)) + '\\ \\mathrm{in}\\)' : null },
            { id: 'phit', symbol: '\\phi_t', label: 'Transverse pressure angle', unit: '°', kind: 'calc', compute: v => has(v, 'phin', 'psi') ? H.deg(Math.atan(tand(v.phin) / cosd(v.psi))) : undefined, work: v => has(v, 'phin', 'psi') ? '\\(\\phi_t = \\tan^{-1}(\\tan ' + f(v.phin) + '^\\circ/\\cos ' + f(v.psi) + '^\\circ) = ' + f(H.deg(Math.atan(tand(v.phin) / cosd(v.psi)))) + '^\\circ\\)' : null },
          ] },
        { id: 'geo2', title: 'Pitch diameters, centre distance, face width, face-contact ratio, virtual teeth', eq: '13-20, 14-19', fig: ['t13-4'],
          formula: 'd = \\frac{N}{P_t} = \\frac{N}{P_n\\cos\\psi},\\quad C = \\frac{d_P+d_G}{2},\\quad m_F = \\frac{F}{p_x} \\ge 2,\\quad N\' = \\frac{N}{\\cos^3\\psi}',
          text: 'Course: F ≈ 2 p_x for true helical action (face-contact ratio m_F ≥ 2; Shigley\'s helical J and I figures require m_F ≥ 2). Fizz step 8: F_nom = 2 p_x, rounded to a convenient size. N′ is the virtual (equivalent spur) tooth number used for cutter/strength checks.',
          vars: [
            { id: 'dP', symbol: 'd_P', label: 'Pinion pitch diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'NP', 'Pt') ? v.NP / v.Pt : undefined, work: v => has(v, 'NP', 'Pt') ? '\\(d_P = ' + f(v.NP) + '/' + f(v.Pt) + ' = ' + f(v.NP / v.Pt) + '\\ \\mathrm{in}\\)' : null },
            { id: 'dG', symbol: 'd_G', label: 'Gear pitch diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'NG', 'Pt') ? v.NG / v.Pt : undefined },
            { id: 'C', symbol: 'C', label: 'Centre distance', unit: 'in', kind: 'calc', compute: v => has(v, 'dP', 'dG') ? (v.dP + v.dG) / 2 : undefined },
            { id: 'F', symbol: 'F', label: 'Face width', unit: 'in', kind: 'input', hint: 'auto = 2 p_x (nominal); round to a convenient value', auto: v => has(v, 'px') ? 2 * v.px : undefined },
            { id: 'mF', symbol: 'm_F', label: 'Face-contact ratio F/p_x', kind: 'calc', digits: 3, compute: v => has(v, 'F', 'px') ? v.F / v.px : undefined, check: v => v.mF !== undefined && v.mF < 2 ? 'm_F < 2: not full helical action; Figs. 14-7/14-8 require m_F ≥ 2' : null },
            { id: 'FdP', symbol: 'F/d_P', label: 'Face width / pinion diameter', kind: 'calc', digits: 3, compute: v => has(v, 'F', 'dP') ? v.F / v.dP : undefined, check: v => v.FdP !== undefined && v.FdP > 2 ? 'F/d_P > 2: K_m procedure not valid' : null },
            { id: 'NvP', symbol: 'N\'_P', label: 'Virtual teeth, pinion', kind: 'calc', digits: 4, compute: v => has(v, 'NP', 'psi') ? v.NP / Math.pow(cosd(v.psi), 3) : undefined },
            { id: 'NvG', symbol: 'N\'_G', label: 'Virtual teeth, gear', kind: 'calc', digits: 4, compute: v => has(v, 'NG', 'psi') ? v.NG / Math.pow(cosd(v.psi), 3) : undefined },
          ] },
        { id: 'geo3', title: 'Tooth proportions (Table 13-4, normal plane)', fig: ['t13-4'],
          formula: 'a = \\frac{1}{P_n},\\quad b = \\frac{1.25}{P_n},\\quad d_o = d + 2a,\\quad d_R = d - 2b,\\quad d_b = d\\cos\\phi_t,\\quad \\psi_b = \\tan^{-1}(\\tan\\psi\\cos\\phi_t)',
          vars: [
            { id: 'a', symbol: 'a', label: 'Addendum', unit: 'in', kind: 'calc', compute: v => has(v, 'Pn') ? 1 / v.Pn : undefined },
            { id: 'b', symbol: 'b', label: 'Dedendum', unit: 'in', kind: 'calc', compute: v => has(v, 'Pn') ? 1.25 / v.Pn : undefined },
            { id: 'ht', symbol: 'h_t', label: 'Whole depth', unit: 'in', kind: 'calc', compute: v => has(v, 'a', 'b') ? v.a + v.b : undefined },
            { id: 'doP', symbol: 'd_{oP}', label: 'Pinion outside diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'dP', 'a') ? v.dP + 2 * v.a : undefined },
            { id: 'doG', symbol: 'd_{oG}', label: 'Gear outside diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'dG', 'a') ? v.dG + 2 * v.a : undefined },
            { id: 'dRP', symbol: 'd_{RP}', label: 'Pinion root diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'dP', 'b') ? v.dP - 2 * v.b : undefined },
            { id: 'dbP', symbol: 'd_{bP}', label: 'Pinion base diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'dP', 'phit') ? v.dP * cosd(v.phit) : undefined },
            { id: 'dbG', symbol: 'd_{bG}', label: 'Gear base diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'dG', 'phit') ? v.dG * cosd(v.phit) : undefined },
            { id: 'psib', symbol: '\\psi_b', label: 'Base helix angle', unit: '°', kind: 'calc', compute: v => has(v, 'psi', 'phit') ? H.deg(Math.atan(tand(v.psi) * cosd(v.phit))) : undefined },
          ] },
      ] },

      { title: 'Forces', steps: [
        { id: 'force', title: 'Pitch-line velocity, tangential, radial, axial and normal forces, torque', eq: '13-35, 13-40', fig: ['f13-33'],
          formula: 'V = \\frac{\\pi d_P n_P}{12},\\quad W_t = \\frac{33\\,000H}{V},\\quad W_r = W_t\\tan\\phi_t,\\quad W_a = W_t\\tan\\psi,\\quad W = \\frac{W_t}{\\cos\\phi_n\\cos\\psi},\\quad T = \\frac{W_t d}{2}',
          text: 'W_a is the thrust the bearings must carry (take it out at one bearing). Direction: see Fig. 13-33 and the hand of the helix.',
          vars: [
            { id: 'V', symbol: 'V', label: 'Pitch-line velocity', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'dP', 'nP') ? Math.PI * v.dP * v.nP / 12 : undefined, work: v => has(v, 'dP', 'nP') ? '\\(V = \\pi(' + f(v.dP) + ')(' + f(v.nP) + ')/12 = ' + f(Math.PI * v.dP * v.nP / 12) + '\\ \\mathrm{ft/min}\\)' : null },
            { id: 'Wt', symbol: 'W_t', label: 'Transmitted load', unit: 'lbf', kind: 'calc', compute: v => has(v, 'P', 'V') && v.V > 0 ? 33000 * v.P / v.V : undefined, work: v => has(v, 'P', 'V') && v.V > 0 ? '\\(W_t = 33\\,000(' + f(v.P) + ')/' + f(v.V) + ' = ' + f(33000 * v.P / v.V) + '\\ \\mathrm{lbf}\\)' : null },
            { id: 'Wr', symbol: 'W_r', label: 'Radial force', unit: 'lbf', kind: 'calc', compute: v => has(v, 'Wt', 'phit') ? v.Wt * tand(v.phit) : undefined, work: v => has(v, 'Wt', 'phit') ? '\\(W_r = ' + f(v.Wt) + '\\tan ' + f(v.phit) + '^\\circ = ' + f(v.Wt * tand(v.phit)) + '\\ \\mathrm{lbf}\\)' : null },
            { id: 'Wa', symbol: 'W_a', label: 'Axial (thrust) force', unit: 'lbf', kind: 'calc', compute: v => has(v, 'Wt', 'psi') ? v.Wt * tand(v.psi) : undefined, work: v => has(v, 'Wt', 'psi') ? '\\(W_a = ' + f(v.Wt) + '\\tan ' + f(v.psi) + '^\\circ = ' + f(v.Wt * tand(v.psi)) + '\\ \\mathrm{lbf}\\)' : null },
            { id: 'W', symbol: 'W', label: 'Total normal force', unit: 'lbf', kind: 'calc', compute: v => has(v, 'Wt', 'phin', 'psi') ? v.Wt / (cosd(v.phin) * cosd(v.psi)) : undefined },
            { id: 'TP', symbol: 'T_P', label: 'Pinion torque', unit: 'lbf·in', kind: 'calc', compute: v => has(v, 'Wt', 'dP') ? v.Wt * v.dP / 2 : undefined },
            { id: 'TG', symbol: 'T_G', label: 'Gear torque', unit: 'lbf·in', kind: 'calc', compute: v => has(v, 'Wt', 'dG') ? v.Wt * v.dG / 2 : undefined },
          ] },
      ] },

      { title: 'AGMA factors (same as spur except J and I)', steps: [
        { id: 'kv', title: 'Quality number and dynamic factor K_v', eq: '14-27 … 14-29', fig: ['ckv', 'f14-9', 'eq14-27', 'av'],
          formula: 'K_v = \\left(\\frac{A+\\sqrt V}{A}\\right)^B,\\quad B = 0.25(12-Q_v)^{2/3},\\quad A = 50+56(1-B)',
          text: 'Course: use the equation ("difficult to read the graph accurately"). Shigley Q_v ↔ Mott A_v = 17 − Q_v (Table 9-4). Tutorial: Q_v = 6, K_v = 1.21.',
          vars: [
            { id: 'Qv', symbol: 'Q_v', label: 'AGMA quality number (Mott A_v in brackets)', kind: 'choice', fig: 'ckv', options: [5, 6, 7, 8, 9, 10, 11].map(q => ({ label: 'Q_v = ' + q + '  (A_v = ' + (17 - q) + ')', value: q })), default: 6 },
            { id: 'Bv', symbol: 'B', label: 'B', kind: 'calc', digits: 4, compute: v => has(v, 'Qv') ? 0.25 * Math.pow(12 - v.Qv, 2 / 3) : undefined },
            { id: 'Av', symbol: 'A', label: 'A', kind: 'calc', digits: 4, compute: v => has(v, 'Bv') ? 50 + 56 * (1 - v.Bv) : undefined },
            { id: 'Kv', symbol: 'K_v', label: 'Dynamic factor', kind: 'lookup', fig: 'f14-9', hint: 'auto = Eq. 14-27', auto: v => has(v, 'Av', 'Bv', 'V') ? Math.pow((v.Av + Math.sqrt(v.V)) / v.Av, v.Bv) : undefined,
              work: v => has(v, 'Av', 'Bv', 'V') ? '\\(K_v = \\left(\\frac{' + f(v.Av) + '+\\sqrt{' + f(v.V) + '}}{' + f(v.Av) + '}\\right)^{' + f(v.Bv) + '} = ' + f(Math.pow((v.Av + Math.sqrt(v.V)) / v.Av, v.Bv)) + '\\)' : null },
            { id: 'Vmax', symbol: '(V_t)_{max}', label: 'Max. velocity for this Q_v', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'Av', 'Qv') ? Math.pow(v.Av + (v.Qv - 3), 2) : undefined, check: v => has(v, 'V', 'Vmax') && v.V > v.Vmax ? 'V exceeds (V_t)max — raise Q_v' : null },
          ] },
        { id: 'ks', title: 'Size factors K_s', fig: ['cks', 't14-2'],
          formula: 'K_s = 1\\ \\ (\\text{course default})\\qquad\\text{or}\\qquad K_s = 1.192\\left(\\frac{F\\sqrt Y}{P_n}\\right)^{0.0535}\\ (\\ge 1)',
          text: 'Course (Gear Stress s15): "Typically K_s = 1" — the instructor\'s default. Accepted alternative: Shigley Eq. (a) with the Lewis Y of Table 14-2 and P = P_n (Tutorial 4 keeps K_s = 1.088 → 1.09, as in Shigley Ex. 14-5).',
          vars: [
            { id: 'ksMode', label: 'K_s rule', kind: 'choice', options: [{ label: 'K_s = 1 (course default)', value: 1 }, { label: 'Formula 1.192 (F√Y/P_n)^0.0535 (Tutorial 4)', value: 2 }], default: 1 },
            { id: 'KsP', symbol: '(K_s)_P', label: 'Size factor, pinion', kind: 'lookup', fig: 'cks', hint: 'auto = 1 or the formula, per the rule above', auto: v => v.ksMode === 2 ? (has(v, 'F', 'NP', 'Pn') && v.NP >= 12 ? Math.max(1, 1.192 * Math.pow(v.F * Math.sqrt(lewisY(v.NP)) / v.Pn, 0.0535)) : undefined) : 1,
              work: v => v.ksMode === 2 && has(v, 'F', 'NP', 'Pn') && v.NP >= 12 ? '\\((K_s)_P = 1.192\\left(\\frac{' + f(v.F) + '\\sqrt{' + f(lewisY(v.NP), 3) + '}}{' + f(v.Pn) + '}\\right)^{0.0535} = ' + f(Math.max(1, 1.192 * Math.pow(v.F * Math.sqrt(lewisY(v.NP)) / v.Pn, 0.0535))) + '\\)' : null },
            { id: 'KsG', symbol: '(K_s)_G', label: 'Size factor, gear', kind: 'lookup', fig: 'cks', auto: v => v.ksMode === 2 ? (has(v, 'F', 'NG', 'Pn') && v.NG >= 12 ? Math.max(1, 1.192 * Math.pow(v.F * Math.sqrt(lewisY(v.NG)) / v.Pn, 0.0535)) : undefined) : 1 },
          ] },
        { id: 'km', title: 'Load-distribution factor K_m', eq: '14-30 … 14-35', fig: ['ckm', 'ccma', 'eq14-30', 'f14-10', 'f14-11', 't14-9'],
          formula: 'K_m = 1 + C_{mc}(C_{pf}C_{pm} + C_{ma}C_e)',
          text: 'Course defaults: C_mc = 1 (uncrowned), C_pm = 1 (straddle), C_ma curve 2 commercial enclosed (Table 14-9), C_e = 1. Use the transverse d_P in C_pf. Tutorial 4: C_pf = 0.0554, C_ma = 0.16, K_m = 1.22. Mott K_m = 1 + C_pf + C_ma gives the same.',
          vars: [
            { id: 'Cmc', symbol: 'C_{mc}', label: 'Lead correction', kind: 'choice', options: [{ label: '1 — uncrowned', value: 1 }, { label: '0.8 — crowned', value: 0.8 }], default: 1 },
            { id: 'Cpf', symbol: 'C_{pf}', label: 'Pinion proportion factor', kind: 'lookup', fig: 'eq14-30', digits: 4, hint: 'auto = Eq. 14-32 with d_P (transverse)',
              auto: v => { if (!has(v, 'F', 'dP')) return undefined; const r = Math.max(v.F / (10 * v.dP), 0.05); return v.F <= 1 ? r - 0.025 : v.F <= 17 ? r - 0.0375 + 0.0125 * v.F : r - 0.1109 + 0.0207 * v.F - 0.000228 * v.F * v.F; },
              work: v => has(v, 'F', 'dP') ? '\\(C_{pf} = \\frac{' + f(v.F) + '}{10(' + f(v.dP) + ')}' + (v.F <= 1 ? ' - 0.025' : v.F <= 17 ? ' - 0.0375 + 0.0125(' + f(v.F) + ')' : ' - 0.1109 + 0.0207F - 0.000228F^2') + ' = ' + f(v.Cpf, 4) + '\\)' : null },
            { id: 'Cpm', symbol: 'C_{pm}', label: 'Pinion proportion modifier', kind: 'choice', fig: 'f14-10', options: [{ label: '1 — straddle mounted, S₁/S < 0.175', value: 1 }, { label: '1.1 — S₁/S ≥ 0.175', value: 1.1 }], default: 1 },
            { id: 'cond', label: 'Gearing condition', kind: 'choice', type: 'text', options: [{ label: 'Open gearing', value: 'open' }, { label: 'Commercial enclosed units', value: 'commercial' }, { label: 'Precision enclosed', value: 'precision' }, { label: 'Extra-precision enclosed', value: 'extra' }], default: 'commercial' },
            { id: 'Cma', symbol: 'C_{ma}', label: 'Mesh alignment factor', kind: 'lookup', fig: 'f14-11', digits: 4, hint: 'auto = Table 14-9', auto: v => { const k = CMA[v.cond]; return k && has(v, 'F') ? k[0] + k[1] * v.F + k[2] * v.F * v.F : undefined; } },
            { id: 'Ce', symbol: 'C_e', label: 'Mesh alignment correction', kind: 'choice', options: [{ label: '1 — normal', value: 1 }, { label: '0.8 — adjusted/lapped at assembly', value: 0.8 }], default: 1 },
            { id: 'Km', symbol: 'K_m', label: 'Load-distribution factor', kind: 'calc', digits: 4, compute: v => has(v, 'Cmc', 'Cpf', 'Cpm', 'Cma', 'Ce') ? 1 + v.Cmc * (v.Cpf * v.Cpm + v.Cma * v.Ce) : undefined, work: v => v.Km !== undefined ? '\\(K_m = 1 + ' + f(v.Cmc) + '[' + f(v.Cpf, 4) + '(' + f(v.Cpm) + ') + ' + f(v.Cma, 4) + '(' + f(v.Ce) + ')] = ' + f(v.Km, 4) + '\\)' : null },
          ] },
        { id: 'kb', title: 'Rim-thickness factor K_B', eq: '14-40', fig: ['f14-16'],
          formula: 'm_B = t_R/h_t,\\quad K_B = 1.6\\ln(2.242/m_B)\\ (m_B<1.2),\\ 1\\ (m_B\\ge1.2)',
          vars: [
            { id: 'tR', symbol: 't_R', label: 'Rim thickness (blank = solid)', unit: 'in', kind: 'input' },
            { id: 'mB', symbol: 'm_B', label: 'Backup ratio', kind: 'calc', digits: 3, compute: v => has(v, 'tR', 'ht') ? v.tR / v.ht : undefined },
            { id: 'KB', symbol: 'K_B', label: 'Rim-thickness factor', kind: 'lookup', fig: 'f14-16', auto: v => v.mB === undefined ? 1 : (v.mB < 1.2 ? 1.6 * Math.log(2.242 / v.mB) : 1) },
          ] },
        { id: 'j', title: 'Helical bending geometry factors J = K_J′ × J′', fig: ['cj', 'f14-7', 'f14-8', 'mf10-6'],
          text: 'Course (Helical/Bevel s7): J = K_J′ × J′ — J′ from the 75-tooth-mate chart (Fig. 14-7: enter with ψ, pick the curve for the tooth count of the gear you want) times the Fig. 14-8 multiplier for the ACTUAL mating tooth count ("K_J′ is not an official AGMA variable"). J_P = J′(N_P, ψ) × K(N_G, ψ); J_G = J′(N_G, ψ) × K(N_P, ψ). Lecture example: 20T/100T, ψ = 20° → J_P = 0.46 × 1.01 = 0.47, J_G = 0.55 × 0.935 = 0.51 (spur would be 0.34/0.435). Tutorial 4 extrapolates below 20 T: 16 T at ψ = 25° → J′ ≈ 0.47 × 0.96 ≈ 0.45 ("likely a little conservative"). Mott Fig. 10-6 is accepted too. Auto values are rough reads only.',
          vars: [
            { id: 'JpP', symbol: 'J\'_P', label: 'J′ pinion (Fig. 14-7)', kind: 'lookup', fig: 'f14-7', digits: 3, hint: 'ROUGH auto — read the chart', auto: v => has(v, 'NP') && v.phin === 20 ? Jp(v.NP) : undefined, check: v => has(v, 'NP') && v.NP < 20 ? 'Fig. 14-7 starts at 20 T — extrapolate (tutorial: 16 T, ψ = 25° → J′ ≈ 0.47)' : null },
            { id: 'KJP', symbol: 'K_{J\'P}', label: 'Multiplier K_J′ for pinion (mate = N_G teeth, Fig. 14-8)', kind: 'lookup', fig: 'f14-8', digits: 3, auto: v => has(v, 'NG') ? Jmult(v.NG) : undefined },
            { id: 'JP', symbol: 'J_P', label: 'Geometry factor, pinion', kind: 'calc', digits: 3, compute: v => has(v, 'JpP', 'KJP') ? v.JpP * v.KJP : undefined, work: v => v.JP !== undefined ? '\\(J_P = K_{J\'}J\' = ' + f(v.KJP, 3) + '\\times' + f(v.JpP, 3) + ' = ' + f(v.JP, 3) + '\\)' : null },
            { id: 'JpG', symbol: 'J\'_G', label: 'J′ gear (Fig. 14-7)', kind: 'lookup', fig: 'f14-7', digits: 3, hint: 'ROUGH auto — read the chart', auto: v => has(v, 'NG') && v.phin === 20 ? Jp(v.NG) : undefined },
            { id: 'KJG', symbol: 'K_{J\'G}', label: 'Multiplier for gear (mate = N_P teeth, Fig. 14-8)', kind: 'lookup', fig: 'f14-8', digits: 3, auto: v => has(v, 'NP') ? Jmult(v.NP) : undefined },
            { id: 'JG', symbol: 'J_G', label: 'Geometry factor, gear', kind: 'calc', digits: 3, compute: v => has(v, 'JpG', 'KJG') ? v.JpG * v.KJG : undefined, work: v => v.JG !== undefined ? '\\(J_G = ' + f(v.JpG, 3) + '\\times' + f(v.KJG, 3) + ' = ' + f(v.JG, 3) + '\\)' : null },
          ] },
        { id: 'i', title: 'Pitting geometry factor I (helical) and elastic coefficient C_p', eq: '14-21 … 14-25', fig: ['t14-8', 'mt10-1'],
          formula: 'Z = \\sqrt{(r_P+a)^2 - r_{bP}^2} + \\sqrt{(r_G+a)^2 - r_{bG}^2} - (r_P+r_G)\\sin\\phi_t,\\quad p_N = p_n\\cos\\phi_n,\\quad m_N = \\frac{p_N}{0.95Z},\\quad I = \\frac{\\cos\\phi_t\\sin\\phi_t}{2m_N}\\frac{m_G}{m_G+1}',
          text: 'Z is the length of the line of action in the transverse plane (Eq. 14-25; if either square-root term exceeds (r_P + r_G) sin φ_t, replace it by that value). Course (s13): φ_t = tan⁻¹(tan φ_n / cos ψ); tutorial φ_t = 21.9°, I = 0.190 (Eq. 14-23) vs 0.199 (Mott Table 10-1) — both accepted; type the Mott reading to use it. C_p = 2300 √psi steel/steel, C_f = 1.',
          vars: [
            { id: 'rbP', symbol: 'r_{bP}', label: 'Pinion base radius', unit: 'in', kind: 'calc', compute: v => has(v, 'dbP') ? v.dbP / 2 : undefined },
            { id: 'rbG', symbol: 'r_{bG}', label: 'Gear base radius', unit: 'in', kind: 'calc', compute: v => has(v, 'dbG') ? v.dbG / 2 : undefined },
            { id: 'Z', symbol: 'Z', label: 'Length of line of action', unit: 'in', kind: 'calc', digits: 4, compute: v => {
                if (!has(v, 'dP', 'dG', 'a', 'rbP', 'rbG', 'phit')) return undefined;
                const rP = v.dP / 2, rG = v.dG / 2, lim = (rP + rG) * sind(v.phit);
                let t1 = Math.sqrt(Math.max(0, (rP + v.a) ** 2 - v.rbP ** 2)), t2 = Math.sqrt(Math.max(0, (rG + v.a) ** 2 - v.rbG ** 2));
                if (t1 > lim) t1 = lim; if (t2 > lim) t2 = lim; return t1 + t2 - lim; },
              work: v => v.Z !== undefined ? '\\(Z = \\sqrt{(' + f(v.dP / 2) + '+' + f(v.a) + ')^2-' + f(v.rbP) + '^2} + \\sqrt{(' + f(v.dG / 2) + '+' + f(v.a) + ')^2-' + f(v.rbG) + '^2} - (' + f(v.dP / 2) + '+' + f(v.dG / 2) + ')\\sin ' + f(v.phit) + '^\\circ = ' + f(v.Z, 4) + '\\ \\mathrm{in}\\)' : null },
            { id: 'pN', symbol: 'p_N', label: 'Normal base pitch', unit: 'in', kind: 'calc', digits: 4, compute: v => has(v, 'pn', 'phin') ? v.pn * cosd(v.phin) : undefined },
            { id: 'mN', symbol: 'm_N', label: 'Load-sharing ratio', kind: 'calc', digits: 4, compute: v => has(v, 'pN', 'Z') && v.Z > 0 ? v.pN / (0.95 * v.Z) : undefined, work: v => v.mN !== undefined ? '\\(m_N = ' + f(v.pN, 4) + '/[0.95(' + f(v.Z, 4) + ')] = ' + f(v.mN, 4) + '\\)' : null },
            { id: 'I', symbol: 'I', label: 'Pitting geometry factor', kind: 'lookup', fig: 'mt10-1', digits: 4, hint: 'auto = Eq. 14-23; or type the Mott Table 10-1 value', auto: v => has(v, 'phit', 'mN', 'mG') ? cosd(v.phit) * sind(v.phit) / (2 * v.mN) * v.mG / (v.mG + 1) : undefined,
              work: v => has(v, 'phit', 'mN', 'mG') ? '\\(I = \\frac{\\cos ' + f(v.phit) + '^\\circ\\sin ' + f(v.phit) + '^\\circ}{2(' + f(v.mN, 4) + ')}\\cdot\\frac{' + f(v.mG) + '}{' + f(v.mG) + '+1} = ' + f(cosd(v.phit) * sind(v.phit) / (2 * v.mN) * v.mG / (v.mG + 1), 4) + '\\)' : null },
            { id: 'Cp', symbol: 'C_p', label: 'Elastic coefficient', unit: '√psi', kind: 'lookup', fig: 't14-8', default: 2300, hint: '2300 steel/steel (course standard)', check: v => v.Cp !== undefined && Math.abs(v.Cp - 2300) > 1 ? 'course standard is 2300 √psi for steel on steel' : null },
            { id: 'Cf', symbol: 'C_f', label: 'Surface condition factor', kind: 'input', default: 1, hint: '1 (course)', check: v => v.Cf !== undefined && v.Cf !== 1 ? 'course assumes C_f = 1' : null },
          ] },
      ] },

      { title: 'AGMA stress numbers (use the transverse pitch P_t)', steps: [
        { id: 'sb', title: 'Bending stress σ', eq: '14-15', fig: ['f14-17'],
          formula: '\\sigma = W_t K_o K_v K_s\\frac{P_t}{F}\\frac{K_m K_B}{J}',
          text: 'Course: the transverse pitch P_t = P_n cos ψ goes in the bending equation (and in d_P).',
          vars: [
            { id: 'sP', symbol: '\\sigma_P', label: 'Pinion bending stress', unit: 'psi', kind: 'calc', compute: v => has(v, 'Wt', 'Ko', 'Kv', 'KsP', 'Pt', 'F', 'Km', 'KB', 'JP') ? v.Wt * v.Ko * v.Kv * v.KsP * v.Pt / v.F * v.Km * v.KB / v.JP : undefined,
              work: v => v.sP !== undefined ? '\\(\\sigma_P = ' + f(v.Wt) + '(' + f(v.Ko) + ')(' + f(v.Kv) + ')(' + f(v.KsP) + ')\\frac{' + f(v.Pt) + '}{' + f(v.F) + '}\\frac{' + f(v.Km, 4) + '(' + f(v.KB) + ')}{' + f(v.JP, 3) + '} = ' + f(v.sP) + '\\ \\mathrm{psi}\\)' : null },
            { id: 'sG', symbol: '\\sigma_G', label: 'Gear bending stress', unit: 'psi', kind: 'calc', compute: v => has(v, 'Wt', 'Ko', 'Kv', 'KsG', 'Pt', 'F', 'Km', 'KB', 'JG') ? v.Wt * v.Ko * v.Kv * v.KsG * v.Pt / v.F * v.Km * v.KB / v.JG : undefined,
              work: v => v.sG !== undefined ? '\\(\\sigma_G = ' + f(v.Wt) + '(' + f(v.Ko) + ')(' + f(v.Kv) + ')(' + f(v.KsG) + ')\\frac{' + f(v.Pt) + '}{' + f(v.F) + '}\\frac{' + f(v.Km, 4) + '(' + f(v.KB) + ')}{' + f(v.JG, 3) + '} = ' + f(v.sG) + '\\ \\mathrm{psi}\\)' : null },
          ] },
        { id: 'sc', title: 'Contact stress σ_c', eq: '14-16', fig: ['f14-18'],
          formula: '\\sigma_c = C_p\\sqrt{W_t K_o K_v K_s\\frac{K_m}{d_P F}\\frac{C_f}{I}}',
          vars: [
            { id: 'scP', symbol: '(\\sigma_c)_P', label: 'Contact stress, pinion', unit: 'psi', kind: 'calc', compute: v => has(v, 'Cp', 'Wt', 'Ko', 'Kv', 'KsP', 'Km', 'dP', 'F', 'Cf', 'I') ? v.Cp * Math.sqrt(v.Wt * v.Ko * v.Kv * v.KsP * v.Km / (v.dP * v.F) * v.Cf / v.I) : undefined,
              work: v => v.scP !== undefined ? '\\((\\sigma_c)_P = ' + f(v.Cp) + '\\sqrt{' + f(v.Wt) + '(' + f(v.Ko) + ')(' + f(v.Kv) + ')(' + f(v.KsP) + ')\\frac{' + f(v.Km, 4) + '}{' + f(v.dP) + '(' + f(v.F) + ')}\\frac{' + f(v.Cf) + '}{' + f(v.I, 4) + '}} = ' + f(v.scP) + '\\ \\mathrm{psi}\\)' : null },
            { id: 'scG', symbol: '(\\sigma_c)_G', label: 'Contact stress, gear', unit: 'psi', kind: 'calc', compute: v => has(v, 'scP', 'KsP', 'KsG') ? v.scP * Math.sqrt(v.KsG / v.KsP) : undefined },
          ] },
      ] },

      { title: 'Life, reliability and strength modifiers', steps: [
        { id: 'life', title: 'Design life, load cycles, Y_N and Z_N', fig: ['cyn', 'czn', 'f14-14', 'f14-15', 'mlife'],
          formula: 'N = n \\times 60 \\times \\tfrac{h}{day} \\times \\tfrac{days}{yr} \\times yr = 60\\,L\\,n\\,q,\\quad Y_N = 1.3558N^{-0.0178},\\quad Z_N = 1.4488N^{-0.023}\\ (N\\ge10^7)',
          text: 'Course: AGMA strengths are at 10⁷ cycles — <b>leave the life blank to use 10⁷ (Y_N = Z_N = 1)</b>; otherwise give hours/day × days/yr × years or a life in hours. Beyond 10⁷ use the upper line for normal commercial gears (auto). Tutorial 4: 10⁸ cycles, Y_N 0.977, Z_N 0.948.',
          vars: [
            { id: 'hpd', symbol: 'h/day', label: 'Hours per day (optional)', unit: 'h', kind: 'input' },
            { id: 'dpy', symbol: 'days/yr', label: 'Days per year (optional)', unit: 'd', kind: 'input' },
            { id: 'yrs', symbol: 'yr', label: 'Years of service (optional)', unit: 'yr', kind: 'input' },
            { id: 'Lh', symbol: 'L', label: 'Design life (blank = 10⁷ cycles)', unit: 'h', kind: 'lookup', fig: 'mlife', hint: 'auto = h/day × days/yr × yr; blank → AGMA 10⁷ cycles', auto: v => has(v, 'hpd', 'dpy', 'yrs') ? v.hpd * v.dpy * v.yrs : undefined },
            { id: 'q', symbol: 'q', label: 'Load applications per revolution', kind: 'input', default: 1 },
            { id: 'NcP', symbol: 'N_P', label: 'Pinion load cycles', kind: 'calc', digits: 4, compute: v => has(v, 'Lh', 'nP', 'q') ? 60 * v.Lh * v.nP * v.q : 1e7, work: v => has(v, 'Lh', 'nP', 'q') ? '\\(N_P = 60(' + f(v.Lh) + ')(' + f(v.nP) + ')(' + f(v.q) + ') = ' + f(v.NcP) + '\\)' : 'no life given → AGMA reference 10⁷ cycles' },
            { id: 'NcG', symbol: 'N_G', label: 'Gear load cycles', kind: 'calc', digits: 4, compute: v => has(v, 'Lh', 'nG', 'q') ? 60 * v.Lh * v.nG * v.q : 1e7 },
            { id: 'YNP', symbol: '(Y_N)_P', label: 'Y_N pinion', kind: 'lookup', fig: 'cyn', digits: 4, hint: 'auto = commercial line', auto: v => !has(v, 'Lh') ? 1 : has(v, 'NcP') ? YN_auto(v.NcP) : undefined },
            { id: 'YNG', symbol: '(Y_N)_G', label: 'Y_N gear', kind: 'lookup', fig: 'cyn', digits: 4, auto: v => !has(v, 'Lh') ? 1 : has(v, 'NcG') ? YN_auto(v.NcG) : undefined },
            { id: 'ZNP', symbol: '(Z_N)_P', label: 'Z_N pinion', kind: 'lookup', fig: 'czn', digits: 4, hint: 'auto = commercial line', auto: v => !has(v, 'Lh') ? 1 : has(v, 'NcP') ? ZN_auto(v.NcP) : undefined },
            { id: 'ZNG', symbol: '(Z_N)_G', label: 'Z_N gear', kind: 'lookup', fig: 'czn', digits: 4, auto: v => !has(v, 'Lh') ? 1 : has(v, 'NcG') ? ZN_auto(v.NcG) : undefined },
          ] },
        { id: 'rel', title: 'Reliability K_R, temperature K_T, design factor', eq: '14-38', fig: ['t14-10'],
          text: 'Course defaults: 99 % → K_R = 1.00 (tutorials with 90 % use 0.85); K_T = 1 (T < 250 °F); S_F = 1 to find the minimum strength, then a steel giving 1.0 ≤ S_F ≤ 1.5.',
          vars: [
            { id: 'R', symbol: 'R', label: 'Reliability', kind: 'input', default: 0.99, hint: '0.99 (course default) · 0.90 · 0.999' },
            { id: 'KR', symbol: 'K_R', label: 'Reliability factor', kind: 'lookup', fig: 't14-10', digits: 3, hint: 'Table 14-10: 0.99 → 1.00, 0.90 → 0.85', auto: v => { if (!has(v, 'R')) return undefined; if (KR[v.R] !== undefined) return KR[v.R]; return v.R < 0.99 ? 0.658 - 0.0759 * Math.log(1 - v.R) : 0.5 - 0.109 * Math.log(1 - v.R); } },
            { id: 'KT', symbol: 'K_T', label: 'Temperature factor', kind: 'input', default: 1, hint: '1 for T < 250 °F', check: v => v.KT !== undefined && v.KT !== 1 ? 'course always assumes K_T = 1' : null },
            { id: 'SFd', symbol: '(S_F)_d', label: 'Design factor of safety', kind: 'input', default: 1, hint: '1.0 (course); target 1.0–1.5', check: v => v.SFd !== undefined && (v.SFd < 1 || v.SFd > 1.5) ? 'AGMA suggests 1.0–1.5' : null },
          ] },
      ] },

      { title: 'Required strength and hardness (design)', steps: [
        { id: 'req', title: 'Required S_t, S_c and Brinell hardness → pick a steel', eq: '14-17, 14-18', fig: ['f14-2', 'f14-5', 'mt9-8', 'mapp3a', 'mapp3b', 't14-3', 't14-6'],
          formula: 'S_{t,req} = \\frac{\\sigma(S_F)_d K_T K_R}{Y_N},\\quad S_{c,req} = \\frac{\\sigma_c(S_H)_d K_T K_R}{Z_N};\\qquad H_B = \\frac{S_t-12\\,800}{77.3},\\ H_B = \\frac{S_c-29\\,100}{322}\\ (\\text{grade 1})',
          text: 'Course flow (Module 2 p22–27): minimum S_t / S_c at S_F = 1 (tutorial: 5.9 ksi and 66.2 ksi), then a Grade 1 through-hardened steel from Mott Table 9-8 / Appendix 3 with HB above the requirement, quoting HB and % elongation — tutorial: 4140 OQT1300 HB 235 → S_H = 1.58 (S_H² = 2.50), or 4140 annealed HB 197 → 1.40 (S_H² = 1.96); Shigley App. A-21 4140 Q&T 650 °C HB 230 → 1.56. Enter the chosen HB below and confirm 1.0 ≤ S_F ≤ 1.5.',
          vars: [
            { id: 'grade', label: 'Steel grade', kind: 'choice', options: [{ label: 'Grade 1 (course default)', value: 1 }, { label: 'Grade 2', value: 2 }], default: 1 },
            { id: 'StreqP', symbol: 'S_{t,req,P}', label: 'Required bending strength, pinion', unit: 'psi', kind: 'calc', compute: v => has(v, 'sP', 'SFd', 'KT', 'KR', 'YNP') ? v.sP * v.SFd * v.KT * v.KR / v.YNP : undefined },
            { id: 'StreqG', symbol: 'S_{t,req,G}', label: 'Required bending strength, gear', unit: 'psi', kind: 'calc', compute: v => has(v, 'sG', 'SFd', 'KT', 'KR', 'YNG') ? v.sG * v.SFd * v.KT * v.KR / v.YNG : undefined },
            { id: 'ScreqP', symbol: 'S_{c,req,P}', label: 'Required contact strength, pinion', unit: 'psi', kind: 'calc', compute: v => has(v, 'scP', 'SFd', 'KT', 'KR', 'ZNP') ? v.scP * v.SFd * v.KT * v.KR / v.ZNP : undefined },
            { id: 'ScreqG', symbol: 'S_{c,req,G}', label: 'Required contact strength, gear', unit: 'psi', kind: 'calc', compute: v => has(v, 'scG', 'SFd', 'KT', 'KR', 'ZNG') ? v.scG * v.SFd * v.KT * v.KR / v.ZNG : undefined },
            { id: 'HBbP', symbol: 'H_{B,bend,P}', label: 'Hardness for pinion bending', unit: 'HB', kind: 'calc', digits: 4, compute: v => has(v, 'StreqP', 'grade') ? Math.max(0, v.grade === 2 ? (v.StreqP - 16400) / 102 : (v.StreqP - 12800) / 77.3) : undefined },
            { id: 'HBbG', symbol: 'H_{B,bend,G}', label: 'Hardness for gear bending', unit: 'HB', kind: 'calc', digits: 4, compute: v => has(v, 'StreqG', 'grade') ? Math.max(0, v.grade === 2 ? (v.StreqG - 16400) / 102 : (v.StreqG - 12800) / 77.3) : undefined },
            { id: 'HBcP', symbol: 'H_{B,cont,P}', label: 'Hardness for pinion contact', unit: 'HB', kind: 'calc', digits: 4, compute: v => has(v, 'ScreqP', 'grade') ? Math.max(0, v.grade === 2 ? (v.ScreqP - 34300) / 349 : (v.ScreqP - 29100) / 322) : undefined, work: v => v.HBcP !== undefined ? '\\(H_B = (' + f(v.ScreqP) + ' - ' + (v.grade === 2 ? '34\\,300)/349' : '29\\,100)/322') + ' = ' + f(v.HBcP) + '\\)' : null },
            { id: 'HBcG', symbol: 'H_{B,cont,G}', label: 'Hardness for gear contact', unit: 'HB', kind: 'calc', digits: 4, compute: v => has(v, 'ScreqG', 'grade') ? Math.max(0, v.grade === 2 ? (v.ScreqG - 34300) / 349 : (v.ScreqG - 29100) / 322) : undefined },
            { id: 'HBreq', symbol: 'H_{B,req}', label: 'REQUIRED hardness (largest)', unit: 'HB', kind: 'calc', digits: 4, compute: v => { const a = [v.HBbP, v.HBbG, v.HBcP, v.HBcG].filter(x => typeof x === 'number'); return a.length ? Math.max(...a) : undefined; } },
          ],
          after: v => v.HBreq === undefined ? '' : (v.HBreq > 400 ? okbad(false, 'Required ' + f(v.HBreq, 3) + ' HB > 400: through-hardening not adequate — specify flame/induction-hardened or carburized grade-1 steel (Tables 14-3/14-6) or enlarge the gears.') : okbad(true, 'Specify a through-hardened grade-' + v.grade + ' steel with H_B ≥ ' + f(Math.ceil(v.HBreq), 3) + ' for both gears (' + (v.HBcP >= v.HBbP ? 'pitting' : 'bending') + ' governs)' + (v.HBreq < 180 ? ' — below the AGMA data range, any ≥ 180 HB steel is fine' : '') + '.')) },
      ] },

      { title: 'Check a chosen material — factors of safety', steps: [
        { id: 'mat', title: 'Material strengths and hardness-ratio factor C_H', eq: '14-36', fig: ['f14-2', 'f14-5', 'f14-12', 't14-3', 't14-6'],
          vars: [
            { id: 'HBP', symbol: 'H_{BP}', label: 'Pinion Brinell hardness', unit: 'HB', kind: 'input' },
            { id: 'HBG', symbol: 'H_{BG}', label: 'Gear Brinell hardness', unit: 'HB', kind: 'input' },
            { id: 'StP', symbol: '(S_t)_P', label: 'Pinion bending strength', unit: 'psi', kind: 'lookup', fig: 'f14-2', auto: v => has(v, 'HBP', 'grade') ? (v.grade === 2 ? 102 * v.HBP + 16400 : 77.3 * v.HBP + 12800) : undefined, hint: 'auto Fig. 14-2; Table 14-3 for case-hardened' },
            { id: 'StG', symbol: '(S_t)_G', label: 'Gear bending strength', unit: 'psi', kind: 'lookup', fig: 'f14-2', auto: v => has(v, 'HBG', 'grade') ? (v.grade === 2 ? 102 * v.HBG + 16400 : 77.3 * v.HBG + 12800) : undefined },
            { id: 'ScP', symbol: '(S_c)_P', label: 'Pinion contact strength', unit: 'psi', kind: 'lookup', fig: 'f14-5', auto: v => has(v, 'HBP', 'grade') ? (v.grade === 2 ? 349 * v.HBP + 34300 : 322 * v.HBP + 29100) : undefined, hint: 'auto Fig. 14-5; Table 14-6 for case-hardened' },
            { id: 'ScG', symbol: '(S_c)_G', label: 'Gear contact strength', unit: 'psi', kind: 'lookup', fig: 'f14-5', auto: v => has(v, 'HBG', 'grade') ? (v.grade === 2 ? 349 * v.HBG + 34300 : 322 * v.HBG + 29100) : undefined },
            { id: 'CH', symbol: 'C_H', label: 'Hardness-ratio factor (gear only)', kind: 'lookup', fig: 'f14-12', digits: 4, auto: v => { if (!has(v, 'HBP', 'HBG', 'mG')) return 1; const r = v.HBP / v.HBG; const A = r < 1.2 ? 0 : r > 1.7 ? 0.00698 : 8.98e-3 * r - 8.29e-3; return 1 + A * (v.mG - 1); } },
          ] },
        { id: 'sf', title: 'Factors of safety S_F, S_H — PASS / FAIL', eq: '14-41, 14-42', fig: ['f14-17', 'f14-18'],
          formula: 'S_F = \\frac{S_t Y_N/(K_T K_R)}{\\sigma},\\qquad S_H = \\frac{S_c Z_N C_H/(K_T K_R)}{\\sigma_c}',
          vars: [
            { id: 'SFP', symbol: '(S_F)_P', label: 'Bending safety factor, pinion', kind: 'calc', digits: 3, compute: v => has(v, 'StP', 'YNP', 'KT', 'KR', 'sP') ? v.StP * v.YNP / (v.KT * v.KR) / v.sP : undefined, work: v => v.SFP !== undefined ? '\\((S_F)_P = \\frac{' + f(v.StP) + '(' + f(v.YNP, 4) + ')/[' + f(v.KT) + '(' + f(v.KR, 3) + ')]}{' + f(v.sP) + '} = ' + f(v.SFP, 3) + '\\)' : null },
            { id: 'SFG', symbol: '(S_F)_G', label: 'Bending safety factor, gear', kind: 'calc', digits: 3, compute: v => has(v, 'StG', 'YNG', 'KT', 'KR', 'sG') ? v.StG * v.YNG / (v.KT * v.KR) / v.sG : undefined },
            { id: 'SHP', symbol: '(S_H)_P', label: 'Wear safety factor, pinion', kind: 'calc', digits: 3, compute: v => has(v, 'ScP', 'ZNP', 'KT', 'KR', 'scP') ? v.ScP * v.ZNP / (v.KT * v.KR) / v.scP : undefined, work: v => v.SHP !== undefined ? '\\((S_H)_P = \\frac{' + f(v.ScP) + '(' + f(v.ZNP, 4) + ')/[' + f(v.KT) + '(' + f(v.KR, 3) + ')]}{' + f(v.scP) + '} = ' + f(v.SHP, 3) + '\\)' : null },
            { id: 'SHG', symbol: '(S_H)_G', label: 'Wear safety factor, gear (with C_H)', kind: 'calc', digits: 3, compute: v => has(v, 'ScG', 'ZNG', 'CH', 'KT', 'KR', 'scG') ? v.ScG * v.ZNG * v.CH / (v.KT * v.KR) / v.scG : undefined },
            { id: 'SH2P', symbol: '(S_H)_P^2', label: 'Compare with S_F (pinion)', kind: 'calc', digits: 3, compute: v => v.SHP !== undefined ? v.SHP * v.SHP : undefined },
            { id: 'SH2G', symbol: '(S_H)_G^2', label: 'Compare with S_F (gear)', kind: 'calc', digits: 3, compute: v => v.SHG !== undefined ? v.SHG * v.SHG : undefined },
          ],
          after: v => {
            if (!has(v, 'SFP', 'SFG', 'SHP', 'SHG')) return '<i>Enter a material (hardness or S_t/S_c) to get the factors of safety.</i>';
            const d = v.SFd || 1; const mn = Math.min(v.SFP, v.SFG, v.SHP, v.SHG);
            const txt = 'Pinion: S_F = ' + f(v.SFP, 3) + ', S_H = ' + f(v.SHP, 3) + ' (S_H² = ' + f(v.SH2P, 3) + ') → threat is ' + (v.SFP < v.SH2P ? 'bending' : 'wear') + '. Gear: S_F = ' + f(v.SFG, 3) + ', S_H = ' + f(v.SHG, 3) + ' (S_H² = ' + f(v.SH2G, 3) + ') → threat is ' + (v.SFG < v.SH2G ? 'bending' : 'wear') + '. ';
            const range = mn > 1.5 ? ' Governing factor ' + f(mn, 3) + ' is above the AGMA 1.0–1.5 target — conservative.' : ' Governing factor ' + f(mn, 3) + ' lies in the AGMA 1.0–1.5 target range.';
            return mn >= d ? okbad(true, 'PASS — all factors of safety ≥ ' + f(d) + '. ' + txt + range) : okbad(false, 'FAIL — minimum factor of safety ' + f(mn, 3) + ' < ' + f(d) + '. ' + txt + 'Harden / case-harden, widen F, reduce P_n or raise quality.');
          } },
      ] },
    ],
  };
})();
