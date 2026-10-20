/* Spur gears — Mott 6e (Ch. 8 kinematics, Ch. 9 design). Merged Fizz 40-step + Mech-bible procedure (both guides follow Mott).
 * Defaults follow the Fizz / Mech student guides (see TOPIC.assumptions), with the UBC MECH 325 course conventions noted where they differ (v2/COURSE_CONVENTIONS.md §0, §6, §7: Gear_Stress_2026 slides, Module 2 tutorials, Midterm 2025 — Mott route).
 * Verified against: Midterm 2025 P2 (10 hp, 1750 → 650 rpm, P_d=10, N_P=17, F=1.5, A_v=8, K_o=1.25, I=0.096 (Fig 9-17), 6 h/day × 200 d × 1 yr
 *   → N_G 46, D_P 1.700, v_t 778.9, W_t 423.7, W_r 154.2, K_v 1.175 (Table 9-6; Fig 9-16 ≈ 1.16), K_s 1.00, C_pf 0.0694, C_ma 0.1505, K_m 1.22,
 *     s_c 128.1 ksi (midterm 127.8 with K_v 1.16); N_c 1.26e8, Z_N 0.943, s_ac,min 135.8 ksi → HB ≥ 331 (midterm 135.5 / 330); 4340 OQT1000 HB 363 → SF 1.08 (≈ 1.10))
 * Verified against: Gear Trains Tutorial 3 / Module 2 p5–15 with Mott factors (I = 0.097, K_s = 1.00 Table 9-2, J = 0.27, R = 0.90, 10^8 cycles):
 *   K_v 1.196, K_m 1.221, s_t 12 782 psi, s_c 108.5 ksi, SF 2.54 / 0.96 — the tutorial's Shigley-factor numbers (K_s 1.088, I 0.1205 → 13 904 psi, 101.5 ksi, SF 2.34 / 1.03)
 *   are reproduced with ksMode = 2 and I = 0.1205 here, and on the Shigley page.
 * Verified against: Mott Ex. 9-7 (3 hp, 1750 rpm, uniform/heavy K_o 1.75, P_d 12, N_P 18, A_v 11, open gearing) with the auto values →
 *   N_G 68, F 1.00, v_t 687, W_t 144, K_v 1.35, J 0.321/0.414 (book 0.325/0.410), I 0.104 (book 0.104), K_m 1.305, s_c 122.6 ksi (book 122.9).
 * Defaults = Fizz/Mech guide assumptions (review 2026-10); midterm bending s_t now uses the digitized J (0.297/0.391). */
(function () {
  const has = (v, ...ids) => H.has(v, ...ids);
  const f = (x, d) => H.fmt(x, d);
  const cosd = a => Math.cos(H.rad(a)), sind = a => Math.sin(H.rad(a)), tand = a => Math.tan(H.rad(a));
  // Table 9-1 Ko
  const KO = { uniform: { uniform: 1.00, light: 1.25, moderate: 1.50, heavy: 1.75 }, light: { uniform: 1.20, light: 1.40, moderate: 1.75, heavy: 2.25 }, moderate: { uniform: 1.30, light: 1.70, moderate: 2.00, heavy: 2.75 } };
  // Table 9-2 Ks by diametral pitch
  const KS = Pd => Pd >= 5 ? 1.00 : Pd >= 4 ? 1.05 : Pd >= 3 ? 1.15 : Pd >= 2 ? 1.25 : 1.40;
  // Fig 9-13 Cma equations (Mott's constants differ slightly from Shigley Table 14-9)
  const CMA = { open: [0.247, 0.0167, -0.765e-4], commercial: [0.127, 0.0158, -1.093e-4], precision: [0.0675, 0.0128, -0.926e-4], extra: [0.0380, 0.0102, -0.822e-4] };
  const KR = { 0.9: 0.85, 0.99: 1.00, 0.999: 1.25, 0.9999: 1.50 };
  // Shigley Table 14-2 Lewis Y (20°, full depth) — only for the optional K_s formula the course also accepts
  const Y_N = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 24, 26, 28, 30, 34, 38, 43, 50, 60, 75, 100, 150, 300, 400];
  const Y_V = [0.245, 0.261, 0.277, 0.29, 0.296, 0.303, 0.309, 0.314, 0.322, 0.328, 0.331, 0.337, 0.346, 0.353, 0.359, 0.371, 0.384, 0.397, 0.409, 0.422, 0.435, 0.447, 0.46, 0.472, 0.48];
  const lewisY = N => H.interp(N, Y_N, Y_V);
  // Fig 9-10 J digitized (load at HPSTC; (a) 20°, (b) 25°): rows = teeth N (the chart x-axis is linear in 1/N), cols = teeth in the MATING gear
  const JC_N = [12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 27, 30, 35, 40, 50, 60, 80, 125, 275];
  const JC_M = [17, 25, 35, 50, 85, 170, 1000];
  const JC = {
    20: [[0.21, 0.21, 0.21, 0.21, 0.21, 0.21, 0.21], [0.2196, 0.2196, 0.2196, 0.2196, 0.2196, 0.2196, 0.2196], [0.2341, 0.2341, 0.2341, 0.2341, 0.2341, 0.2341, 0.2341], [0.2515, 0.2515, 0.2515, 0.2515, 0.2515, 0.2515, 0.2515], [0.2717, 0.2717, 0.2717, 0.2717, 0.2717, 0.2717, 0.2717], [0.2932, 0.2967, 0.2967, 0.2967, 0.2967, 0.2967, 0.2967], [0.3002, 0.3075, 0.3131, 0.3173, 0.3242, 0.328, 0.328], [0.3068, 0.3138, 0.3201, 0.3245, 0.3315, 0.335, 0.3391], [0.3131, 0.3201, 0.3267, 0.3315, 0.3384, 0.3425, 0.3466], [0.3248, 0.3318, 0.3391, 0.3444, 0.3517, 0.3568, 0.3612], [0.3346, 0.3422, 0.3498, 0.3558, 0.3631, 0.3694, 0.3741], [0.3473, 0.3552, 0.3637, 0.3704, 0.3779, 0.3855, 0.3909], [0.3577, 0.3659, 0.3748, 0.3824, 0.3903, 0.3988, 0.4051], [0.3713, 0.3802, 0.3899, 0.3985, 0.4067, 0.4165, 0.4238], [0.3817, 0.3912, 0.4013, 0.4111, 0.4197, 0.4304, 0.4386], [0.3963, 0.407, 0.4178, 0.4285, 0.4377, 0.45, 0.4592], [0.4064, 0.4178, 0.4288, 0.4408, 0.4506, 0.4636, 0.4734], [0.419, 0.4317, 0.443, 0.4563, 0.4671, 0.4813, 0.492], [0.4329, 0.4468, 0.4585, 0.4734, 0.4848, 0.5006, 0.5123], [0.4465, 0.4617, 0.474, 0.4905, 0.5028, 0.5198, 0.5325]],
    25: [[0.3221, 0.3232, 0.3244, 0.3255, 0.3271, 0.3288, 0.3304], [0.3263, 0.3286, 0.3312, 0.3342, 0.3377, 0.3413, 0.3448], [0.3342, 0.3367, 0.3398, 0.3433, 0.3461, 0.349, 0.352], [0.3429, 0.346, 0.3494, 0.3532, 0.3567, 0.36, 0.3631], [0.352, 0.3553, 0.359, 0.3631, 0.3674, 0.3711, 0.3744], [0.3604, 0.3632, 0.3661, 0.3691, 0.3722, 0.3767, 0.3813], [0.3684, 0.3734, 0.379, 0.3845, 0.3891, 0.3925, 0.3957], [0.3759, 0.3824, 0.3873, 0.3911, 0.3964, 0.401, 0.4052], [0.3832, 0.39, 0.3949, 0.3995, 0.4048, 0.4101, 0.4146], [0.3957, 0.4033, 0.4086, 0.4135, 0.42, 0.426, 0.4306], [0.4067, 0.415, 0.4207, 0.426, 0.4329, 0.4397, 0.445], [0.4203, 0.4294, 0.4351, 0.4412, 0.4495, 0.4564, 0.4621], [0.4317, 0.4412, 0.4473, 0.4541, 0.4624, 0.47, 0.4761], [0.4469, 0.4571, 0.4636, 0.4708, 0.4799, 0.4882, 0.4951], [0.4579, 0.4693, 0.4761, 0.4837, 0.4932, 0.5019, 0.5095], [0.4746, 0.4863, 0.4936, 0.5023, 0.5125, 0.5216, 0.53], [0.4856, 0.4981, 0.5057, 0.5148, 0.525, 0.5353, 0.5436], [0.5004, 0.5133, 0.5216, 0.5307, 0.5421, 0.552, 0.5611], [0.5156, 0.5292, 0.5383, 0.5489, 0.5599, 0.5706, 0.58], [0.5315, 0.5451, 0.555, 0.566, 0.5778, 0.5892, 0.599]] };
  const Jchart = (phi, N, Nm) => {
    const T = JC[phi]; if (!T || !(N >= 12) || !(Nm > 0)) return undefined;
    let i = JC_N.length - 2; for (let k = 0; k < JC_N.length - 1; k++) if (N <= JC_N[k + 1]) { i = k; break; }
    const t = (1 / JC_N[i] - 1 / N) / (1 / JC_N[i] - 1 / JC_N[i + 1]);   // > 1 beyond 275 T: extrapolates toward N = ∞ along the chart axis
    const m = Math.min(Math.max(Nm, 17), 1000);
    let j = JC_M.length - 2; for (let k = 0; k < JC_M.length - 1; k++) if (m <= JC_M[k + 1]) { j = k; break; }
    const s = Math.log(m / JC_M[j]) / Math.log(JC_M[j + 1] / JC_M[j]);
    const row = r => T[r][j] + (T[r][j + 1] - T[r][j]) * s;
    return row(i) + (row(i + 1) - row(i)) * t;
  };
  // Fig 9-17 is AGMA I at the lowest point of single-tooth contact on the pinion (standard addendum, standard centre distance):
  // I = cos φ / [d_P (1/ρ1 + 1/ρ2)], ρ1 = √(r_oP² − r_bP²) − p_b, ρ2 = C sin φ − ρ1. Reproduces the chart (16 T, m_G 3 → 0.096; Mott Ex. 9-7 18/68 T → 0.104).
  const I_lpstc = (phi, NP, NG) => {
    if (!(NP > 0 && NG >= NP && phi > 0)) return undefined;
    const c = cosd(phi), s = sind(phi), rP = NP / 2, rG = NG / 2;      // P_d = 1 (I does not depend on size)
    const rho1 = Math.sqrt((rP + 1) ** 2 - (rP * c) ** 2) - Math.PI * c, rho2 = (rP + rG) * s - rho1;
    return rho1 > 0 && rho2 > 0 ? c / ((1 / rho1 + 1 / rho2) * NP) : undefined;
  };
  const AvT95 = vt => vt <= 800 ? 10 : vt <= 2000 ? 8 : vt <= 4000 ? 6 : 4;   // Table 9-5, lower part (by pitch-line speed, fpm)
  const L_DEF = 20000;   // Table 9-12 "general industrial machines" 20 000–30 000 h — used when no life is given (Mott Ex. 9-5 picks 20 000 h)
  // Fig 9-21: 250 HB line below the knee (≈3×10⁶ cycles), upper "normal commercial" line above it. Fig 9-22: knee at 10⁷.
  const YN_auto = N => N >= 3e6 ? 1.3558 * Math.pow(N, -0.0178) : 4.9404 * Math.pow(Math.max(N, 1e3), -0.1045);
  const ZN_auto = N => N >= 1e7 ? 1.4488 * Math.pow(N, -0.023) : 2.466 * Math.pow(Math.max(N, 1e4), -0.056);
  const YNw = (sym, N) => '\\(' + sym + ' = ' + (N >= 3e6 ? '1.3558(' + f(N, 3) + ')^{-0.0178}' : '4.9404(' + f(N, 3) + ')^{-0.1045}') + ' = ' + f(YN_auto(N), 4) + '\\)';
  const ZNw = (sym, N) => '\\(' + sym + ' = ' + (N >= 1e7 ? '1.4488(' + f(N, 3) + ')^{-0.023}' : '2.466(' + f(N, 3) + ')^{-0.056}') + ' = ' + f(ZN_auto(N), 4) + '\\)';
  const okbad = (ok, txt) => '<span class="' + (ok ? 'result-ok' : 'result-bad') + '">' + txt + '</span>';
  const satHB = (s, g) => g === 2 ? (s / 1000 - 16.40) / 0.102 : (s / 1000 - 12.80) / 0.0773;   // Fig 9-18, s in psi
  const sacHB = (s, g) => g === 2 ? (s / 1000 - 34.30) / 0.349 : (s / 1000 - 29.10) / 0.322;   // Fig 9-19
  const satOf = (HB, g) => (g === 2 ? 0.102 * HB + 16.40 : 0.0773 * HB + 12.80) * 1000;
  const sacOf = (HB, g) => (g === 2 ? 0.349 * HB + 34.30 : 0.322 * HB + 29.10) * 1000;

  window.TOPIC = {
    id: 'spur', book: 'mott',
    title: 'Spur Gears — Design & AGMA Stress',
    subtitle: 'Mott Ch. 8–9 · Fizz 40-step + Mech-guide procedure merged',
    sibling: 'spur_shigley.html',
    intro: 'The Fizz 40-step / Mech-guide spur-gear design, in Mott notation: design power → trial pitch (Fig. 9-11) → tooth numbers & geometry (Table 8-1) → forces → bending stress number s<sub>t</sub> (Eq. 9-16) and contact stress number s<sub>c</sub> (Eq. 9-23) → life/reliability adjustments (Eqs. 9-30/9-31) → <b>required hardness</b> from Figs. 9-18/9-19 → safety factors (Eqs. 9-32/9-33) for the chosen material. Step titles carry both guide step numbers (F = Fizz 40-step list, M = Mech-guide list). Yellow fields are chart/table readings; an <i>auto</i> estimate (the chart\'s own equation or a digitized curve) is used until you type your reading. <b>Defaults are the Fizz / Mech guide assumptions</b> — listed under "Assumptions used" with page references, and with the course-slide value wherever the course differs (the midterm solution uses the same Mott charts: K<sub>o</sub> Table 9-1, K<sub>v</sub> Fig. 9-16 / Table 9-6 with A<sub>v</sub> = 17 − Q<sub>v</sub>, I from Fig. 9-17, K<sub>m</sub> = 1 + C<sub>pf</sub> + C<sub>ma</sub> commercial enclosed). Example = Midterm 2025 P2 (10 hp, 1750 → 650 rpm, 17 T, P<sub>d</sub> = 10, A<sub>v</sub> = 8).',
    example: { P: 10, nP: 1750, nGd: 650, src: 'uniform', drv: 'light', phi: 20, Pd: 10, NP: 17, F: 1.5, Av: 8, ksMode: 1, cond: 'commercial', Cp: 2300, I: 0.096, R: 0.99, hpd: 6, dpy: 200, yrs: 1, q: 1, grade: 1, HBP: 363, HBG: 363, SFd: 1 },

    assumptions: [
      { text: 'US customary units (hp, lb, in, ft/min, rpm, psi; ksi inside the hardness equations); a module m in mm is converted with P_d = 25.4/m', src: 'Mech p.63, p.84' },
      { text: 'Shock classes as Mott lists them — power source: uniform = electric motor / constant-speed gas turbine, light = water turbine / variable-speed drive, moderate = multicylinder engine; K_o from Table 9-1 (default uniform → uniform, K_o = 1.00)', src: 'Fizz p.38–39 · Mech p.74', var: 'Ko', value: 1 },
      { text: 'Trial P_d from Fig. 9-11 with P_des = K_o P, rounded to the smaller standard P_d (bigger teeth)', src: 'Fizz p.39 · Mech p.75', var: 'Pd' },
      { text: 'Pinion teeth N_P between 17 and 20 — 17 (the 20° no-interference minimum) is used until you type one', src: 'Fizz p.39 · Mech p.76', var: 'NP', value: 17 },
      { text: 'Target output speed = middle of the allowed range; N_G = N_P·VR rounded to the nearest integer, then check the actual n_G is still in range (else try another N_P)', src: 'Fizz p.39–40 · Mech p.76', var: 'nGd' },
      { text: 'Face width: nominal F = 12/P_d unless the problem says otherwise (limits 8/P_d … 16/P_d, and 0.5 < F/D_P < 2); course slide s51 quotes 8/P_d–12/P_d', src: 'Fizz p.40 · Mech p.77 · Gear Stress s51 (course)', var: 'F' },
      { text: 'Material: steel pinion and gear → C_p = 2300 √psi', src: 'Fizz p.40–41 · Mech p.88', var: 'Cp', value: 2300 },
      { text: 'A_v from Table 9-5 by application or pitch-line speed ("just guess what looks right") — default A_v = 10 (= Q_v 7: the Table 9-5 value for v_t ≤ 800 fpm and most industrial drives); course tutorials used Q_v = 6 (A_v 11), the midterm A_v = 8', src: 'Fizz p.41 · Mech p.77', var: 'Av', value: 10 },
      { text: 'K_v read from Fig. 9-16 — the auto value is the Table 9-6 equation of the same curves (course prefers the equation)', src: 'Fizz p.41 · Mech p.78 · Gear Stress s14 (course)', var: 'Kv' },
      { text: '20° full-depth teeth unless stated → the 20° charts for J (Fig. 9-10a) and I (Fig. 9-17a)', src: 'Fizz p.42–43 · Mech p.79, p.88', var: 'phi', value: 20 },
      { text: 'J_P, J_G read from Fig. 9-10 (x = own teeth, curve = mating teeth) — auto = digitized chart', src: 'Fizz p.42 · Mech p.79', var: 'JP' },
      { text: 'I read from Fig. 9-17 (m_G, N_P curve) — auto = the AGMA lowest-point-of-single-tooth-contact formula the chart plots (midterm read 0.096); Shigley Eq. 14-23 (0.117) is the course-accepted alternative', src: 'Fizz p.43 · Mech p.88 · Gear Stress s31–32 (course)', var: 'I' },
      { text: 'C_pf from the Fig. 9-12 equations ("use the equations, the table is bad"); F/D_P < 0.5 → use 0.5', src: 'Fizz p.44 · Mech p.80', var: 'Cpf' },
      { text: 'C_ma for commercial enclosed gear units (curve 2)', src: 'Fizz p.44 · Mech p.80 · Gear Stress s20 (course)', var: 'cond', value: 'commercial' },
      { text: 'K_m = 1 + C_pf + C_ma', src: 'Fizz p.45 · Mech p.80', var: 'Km' },
      { text: 'K_s from Table 9-2 by P_d (1.00 for P_d ≥ 5 — the course\'s "typically K_s = 1")', src: 'Fizz p.45 · Mech p.80 · Gear Stress s15 (course)', var: 'Ks' },
      { text: 'K_B = 1.00 for a solid (commercial) gear blank — "always 1.00 unless it isn\'t"', src: 'Fizz p.45 · Mech p.81', var: 'KB', value: 1 },
      { text: 'Service factor SF = 1.00 when sizing (minimum s_at, s_ac), then choose a material giving 1.0 ≤ SF ≤ 1.5', src: 'Fizz p.45, p.48 · Mech p.82 · Gear Stress s41 (course)', var: 'SFd', value: 1 },
      { text: 'Reliability 99 % → K_R = 1.00', src: 'Fizz p.45–46 · Mech p.82 · Gear Stress s38 (course)', var: 'R', value: 0.99 },
      { text: 'Design life from the problem, otherwise from Table 9-12 — blank uses 20 000 h ("general industrial machines", as in Mott Ex. 9-5). AGMA strengths are for 10^7 cycles (Y_N = Z_N = 1)', src: 'Fizz p.46 · Mech p.82', var: 'Lh', value: 20000 },
      { text: 'Load cycles N_c = 60 L n q with q = 1 load per revolution (2 for an idler)', src: 'Fizz p.46 · Mech p.82', var: 'q', value: 1 },
      { text: 'Y_N and Z_N from Figs. 9-21/9-22 — auto uses the equations printed on the charts (upper "normal commercial" lines 1.3558 N^-0.0178 and 1.4488 N^-0.023 beyond the knee)', src: 'Fizz p.46–47 · Mech p.83, p.90 · Gear Stress s37, s44 (course)', var: 'YNP' },
      { text: 's_c is the same for pinion and gear (only Z_N differs)', src: 'Fizz p.48' },
      { text: 'Grade 1 through-hardened steel ("as far as we\'re concerned, grade 1 is the only one that exists"); Figs. 9-18/9-19 equations in ksi', src: 'Fizz p.48 · Mech p.84', var: 'grade', value: 1 },
      { text: 'Same material for pinion and gear — design on the pinion values; gear HB defaults to the pinion HB', src: 'Fizz p.48 · Mech p.73', var: 'HBG' },
      { text: 'Pick the steel from Appendix 3 (normally) or Appendix 5 (carburized) with HB above the requirement', src: 'Fizz p.48–51 · Mech p.84–87' },
      { text: 'Required HB > 400 → flame/induction hardening or carburizing (Table 9-9) instead of through-hardening', src: 'Fizz p.51 · Mech p.87' },
    ],

    figures: [
      { id: 't9-1', ref: 'Table 9-1', title: 'Suggested overload factors K_o', src: 'figures/mott/table9-1.png', page: 395, note: 'Rows = power source (Mott Sec. 9-5: uniform = electric motor or constant-speed gas turbine; light shock = water turbine, variable-speed drive; moderate shock = multicylinder engine). Columns = driven machine.' },
      { id: 'f9-11', ref: 'Figure 9-11', title: 'Design power vs pinion speed → trial diametral pitch', src: 'figures/mott/fig9-11.png', page: 394, note: 'Enter with P_des = K_o P and n_P; read the P_d curve above the point and round to the SMALLER standard P_d (bigger teeth). Curves assume N_P = 24, HB 300 steel.' },
      { id: 't8-3', ref: 'Table 8-3', title: 'Standard diametral pitches', src: 'figures/mott/table8-3.png', page: 332 },
      { id: 't8-1', ref: 'Table 8-1', title: 'Gear tooth features, diameters, centre distance — all formulas', src: 'figures/mott/table8-1.png', page: 331, note: 'Coarse pitch P_d < 20 vs fine pitch P_d ≥ 20 (dedendum & clearance differ).' },
      { id: 'f9-3', ref: 'Figure 9-3', title: 'Forces on gear teeth: W_t, W_r, W_n', src: 'figures/mott/fig9-3.png', page: 384 },
      { id: 'f8-42', ref: 'Figure 8-42', title: 'Double-reduction gear train — train value', src: 'figures/mott/fig8-42.png', page: 363, note: 'TV = (VR₁)(VR₂) = (N_B/N_A)(N_D/N_C) = n_in/n_out.' },
      { id: 'tv', ref: 'Train value (Sec. 8-9)', title: 'Train value definition', src: 'figures/mott/eq-train-value.png', page: 363 },
      { id: 't9-5', ref: 'Table 9-5', title: 'Recommended AGMA quality numbers A_v', src: 'figures/mott/table9-5.png', page: 399, note: 'By application, or by pitch-line speed (lower part: 0–800 fpm A10, 800–2000 A8, 2000–4000 A6, > 4000 A4). Fizz: "just guess what looks right" — A_v 10 for ordinary industrial drives.' },
      { id: 'f9-16', ref: 'Figure 9-16', title: 'Dynamic factor K_v vs pitch line velocity (curves of A_v)', src: 'figures/mott/fig9-16.png', page: 400 },
      { id: 't9-6', ref: 'Table 9-6', title: 'Analytical K_v: B, C from A_v; v_t,max', src: 'figures/mott/table9-6.png', page: 401 },
      { id: 'f9-10', ref: 'Figure 9-10', title: 'Bending geometry factor J (a) 20° (b) 25°', src: 'figures/mott/fig9-10.png', page: 393, note: 'x-axis = teeth of the gear you want J for; curve = teeth of the MATING gear (load at HPSTC). J_P: x = N_P, curve N_G. J_G: x = N_G, curve N_P. Below ≈ 18 teeth (20°) all curves merge into one line.' },
      { id: 't9-2', ref: 'Table 9-2', title: 'Suggested size factors K_s', src: 'figures/mott/table9-2.png', page: 395, note: 'K_s = 1.00 for P_d ≥ 5.' },
      { id: 'f9-12', ref: 'Figure 9-12', title: 'Pinion proportion factor C_pf', src: 'figures/mott/fig9-12.png', page: 396, note: 'Fizz step 20: "use the equations if you can because the table is bad". For F/D_P < 0.5 use the 0.5 curve.' },
      { id: 'f9-13', ref: 'Figure 9-13', title: 'Mesh alignment factor C_ma (with curve equations)', src: 'figures/mott/fig9-13.png', page: 397, note: 'Course default: commercial enclosed gear units.' },
      { id: 'f9-14', ref: 'Figure 9-14', title: 'Rim thickness factor K_B', src: 'figures/mott/fig9-14.png', page: 397, note: 'Solid blank → K_B = 1.0.' },
      { id: 'f9-15', ref: 'Figure 9-15', title: 'Pinion on a keyed shaft — measure t_R above the keyway', src: 'figures/mott/fig9-15.png', page: 398 },
      { id: 't9-7', ref: 'Table 9-7', title: 'Elastic coefficient C_p', src: 'figures/mott/table9-7.png', page: 404, note: 'Steel–steel: 2300 (lb/in²)^0.5.' },
      { id: 'f9-17', ref: 'Figure 9-17', title: 'Pitting geometry factor I (a) 20° (b) 25°', src: 'figures/mott/fig9-17.png', page: 405, note: 'Enter with gear ratio m_G, pick the N_P curve (interpolate between 16, 24, 30, 50). The curves are AGMA I at the lowest point of single-tooth contact; the auto value computes that point exactly. Shigley Eq. 14-23 evaluates I at the pitch point instead (≈ 20 % higher).' },
      { id: 'f9-18', ref: 'Figure 9-18', title: 'Allowable bending stress number s_at vs HB (through-hardened steel)', src: 'figures/mott/fig9-18.png', page: 407, note: 'Grade 1: s_at = 0.0773 HB + 12.80 ksi → HB = (s_at − 12.80)/0.0773. Grade 2: s_at = 0.102 HB + 16.40 ksi.' },
      { id: 'f9-19', ref: 'Figure 9-19', title: 'Allowable contact stress number s_ac vs HB (through-hardened steel)', src: 'figures/mott/fig9-19.png', page: 408, note: 'Grade 1: s_ac = 0.322 HB + 29.10 ksi → HB = (s_ac − 29.10)/0.322. Grade 2: s_ac = 0.349 HB + 34.30 ksi.' },
      { id: 't9-8', ref: 'Table 9-8', title: 'Examples of gear materials (through-hardening vs carburizing alloys)', src: 'figures/mott/table9-8.png', page: 406 },
      { id: 't9-9', ref: 'Table 9-9', title: 'Allowable stress numbers for case-hardened grade-1 steel', src: 'figures/mott/table9-9.png', page: 409, note: 'Use when HB_req > 400: flame/induction (s_ac 170–175 ksi), carburized (s_at 55, s_ac 180 ksi).' },
      { id: 't9-10', ref: 'Table 9-10', title: 'Allowable stress numbers for iron and bronze gears', src: 'figures/mott/table9-10.png', page: 410 },
      { id: 't9-11', ref: 'Table 9-11', title: 'Reliability factor K_R', src: 'figures/mott/table9-11.png', page: 411, note: '99 % → K_R = 1.00 (course default).' },
      { id: 't9-12', ref: 'Table 9-12', title: 'Recommended design life (hours)', src: 'figures/mott/table9-12.png', page: 411, note: 'General industrial machines: 20 000–30 000 h — the calculator uses 20 000 h when no life is given (as Mott Ex. 9-5 does).' },
      { id: 'f9-21', ref: 'Figure 9-21', title: 'Bending strength stress cycle factor Y_N', src: 'figures/mott/fig9-21.png', page: 412, note: 'Y_N = 1.3558 N_c^−0.0178 beyond 10⁷ cycles.' },
      { id: 'f9-22', ref: 'Figure 9-22', title: 'Pitting resistance stress cycle factor Z_N', src: 'figures/mott/fig9-22.png', page: 412, note: 'Z_N = 1.4488 N_c^−0.023 beyond 10⁷ cycles (upper line, normal commercial gears). Midterm read 0.95 at 1.26×10⁸.' },
      { id: 't9-4', ref: 'Table 9-4', title: 'General correlations of AGMA 2000 Q_v, AGMA 2015 A_v and ISO 1328', src: 'figures/course/gear_kv_q_av_table.png', book: 'course', note: 'Q5 = A12, Q6 = A11, Q7 = A10, Q8 = A9, Q9 = A8, Q10 = A7, Q11 = A6. Midterm: "A_v = 8 (Q = 9)". Slide also shows Table 9-6 and Shigley Fig. 14-9.' },
      { id: 'app3a', ref: 'Appendix 3', title: 'Design properties of carbon and alloy steels — s_u, s_y, % elongation, HB (1020 … 4150)', src: 'figures/mott/appendix3a.png', page: 804, note: 'e.g. 4140 annealed HB 197, 4140 OQT1300 HB 235, 4140 OQT1000 HB 341.' },
      { id: 'app3b', ref: 'Appendix 3 (cont.)', title: 'Steels 4340 … 9255', src: 'figures/mott/appendix3b.png', page: 805, note: 'e.g. 4340 OQT1000 HB 363 (16 % el.), 4340 OQT700 HB 461. HB ≈ 2 × s_u (ksi).' },
      { id: 'app5', ref: 'Appendix 5', title: 'Properties of carburized steels (core HB, case HRC)', src: 'figures/mott/appendix5.png', page: 808, note: 'Mech guide: "look at appendix 3 or 5 … we normally use Appendix 3". Use with Table 9-9 (carburized s_at = 55 ksi, s_ac = 180 ksi) when HB > 400 is required.' },
      // ---- course-only slides (v2/COURSE_CONVENTIONS.md §16) ----
      { id: 'cko', ref: 'Gear Stress s12', book: 'course', title: 'Overload factor K_o — Shigley table and Mott Table 9-1 side by side', src: 'figures/course/ko_shigley_vs_mott.png', note: 'Either is accepted; Mott is "more conservative". Tutorials: K_o = 1 (uniform). Midterm: K_o = 1.25 (uniform source, light shock).' },
      { id: 'cks', ref: 'Gear Stress s15', book: 'course', title: 'Size factor K_s: "Typically K_s = 1", Mott Table 9-2, or the Lewis-Y formula', src: 'figures/course/gear_ks_course.png', note: 'Instructor: "I normally will suggest we default to 1.0"; Tutorial 3 keeps 1.088 from the formula — both accepted.' },
      { id: 'ccma', ref: 'Gear Stress s20', book: 'course', title: 'C_ma — "default to curve 2 (commercial enclosed gear units)"', src: 'figures/course/gear_cma_curve2.png' },
      { id: 'cyn', ref: 'Gear Stress s37', book: 'course', title: 'Y_N — "use this line for normal commercial gears" (1.3558 N^-0.0178)', src: 'figures/course/gear_yn_course_line.png' },
      { id: 'czn', ref: 'Gear Stress s44', book: 'course', title: 'Z_N — normal commercial gears line (1.4488 N^-0.023)', src: 'figures/course/gear_zn_course_line.png' },
      { id: 'cproc', ref: 'Gear Stress s47', book: 'course', title: 'Gear stress analysis procedure flow chart', src: 'figures/course/gear_stress_procedure.png' },
      { id: 'cteeth', ref: 'Helical/Bevel s33', book: 'course', title: 'Standard gear teeth proportions (20° FD / 20° stub / 25° FD) and Lewis Y table', src: 'figures/course/standard_gear_teeth_table.png', note: 'a = 1/P, b = 1.25/P, c = 0.25/P, whole depth 2.25/P, t = 1.571/P, face width 9/P < F < 13/P.' },
    ],

    sections: [
      { title: 'Inputs & design decisions (Fizz steps 1–13 · Mech steps 1–13)', steps: [
        { id: 'in', title: 'Power, speeds and overload factor (F1–3 · M1–3)', fig: ['cko', 't9-1', 'cproc'],
          text: 'Identify the shock of the power source and of the driven machine (Mott\'s lists: uniform source = electric motor or constant-speed gas turbine; light shock = water turbine, variable-speed drive; moderate shock = multicylinder engine), read K_o from Table 9-1 ("more conservative" than Shigley\'s table — the course accepts either; tutorials use K_o = 1, the midterm 1.25 for a uniform source / light-shock machine) and compute the design power. Units: US customary throughout (hp, lb, in, ft/min, rpm, psi).',
          formula: 'P_{des} = K_o\\,P \\qquad VR = \\frac{n_P}{n_G}',
          vars: [
            { id: 'P', symbol: 'P', label: 'Transmitted power', unit: 'hp', kind: 'input' },
            { id: 'nP', symbol: 'n_P', label: 'Pinion (input) speed', unit: 'rpm', kind: 'input' },
            { id: 'nGd', symbol: 'n_{G,des}', label: 'Desired gear (output) speed', unit: 'rpm', kind: 'input', hint: 'middle of the allowed range; blank if N_G is given' },
            { id: 'src', label: 'Power source', kind: 'choice', type: 'text', options: [{ label: 'Uniform (electric motor, constant-speed gas turbine)', value: 'uniform' }, { label: 'Light shock (water turbine, variable-speed drive)', value: 'light' }, { label: 'Moderate shock (multicylinder engine)', value: 'moderate' }], default: 'uniform' },
            { id: 'drv', label: 'Driven machine', kind: 'choice', type: 'text', options: [{ label: 'Uniform (continuous-duty generator, paper/film winders)', value: 'uniform' }, { label: 'Light shock (fans, low-speed centrifugal pumps, uniformly loaded conveyors)', value: 'light' }, { label: 'Moderate shock (machine tools, saws, mixers, heavy-duty conveyors)', value: 'moderate' }, { label: 'Heavy shock (crushers, punch presses, hammer mills)', value: 'heavy' }], default: 'uniform' },
            { id: 'Ko', symbol: 'K_o', label: 'Overload factor', kind: 'lookup', fig: 'cko', hint: 'auto from the two selects (Table 9-1); Shigley\'s table also accepted', auto: v => (KO[v.src] && KO[v.src][v.drv]) || undefined, check: v => v.Ko !== undefined && (v.Ko < 1 || v.Ko > 3) ? 'K_o is normally 1.0–2.75' : null },
            { id: 'Pdes', symbol: 'P_{des}', label: 'Design power', unit: 'hp', kind: 'calc', compute: v => has(v, 'P', 'Ko') ? v.P * v.Ko : undefined, work: v => has(v, 'P', 'Ko') ? '\\(P_{des} = ' + f(v.Ko) + '\\times' + f(v.P) + ' = ' + f(v.P * v.Ko) + '\\ \\mathrm{hp}\\)' : null },
            { id: 'VRd', symbol: 'VR_{des}', label: 'Desired velocity ratio', kind: 'calc', compute: v => has(v, 'nP', 'nGd') && v.nGd > 0 ? v.nP / v.nGd : undefined },
          ] },
        { id: 'tooth', title: 'Diametral pitch and tooth numbers (F4–10 · M4–10)', fig: ['f9-11', 't8-3'],
          text: 'Read P_d from Fig. 9-11 with P_des and n_P ("round to the smallest number" — the smaller standard P_d). Choose N_P between 17 and 20 (17 is used until you type one). Take n_G at the middle of the allowed range, N_G = N_P·VR rounded to an integer, then the actual VR and n_G — check n_G is inside the allowed range, otherwise try another N_P.',
          formula: 'N_G = N_P\\,VR\\ (\\text{integer}),\\qquad VR = m_G = \\frac{N_G}{N_P},\\qquad n_G = n_P\\frac{N_P}{N_G}',
          vars: [
            { id: 'phi', symbol: '\\phi', label: 'Pressure angle', kind: 'choice', options: [{ label: '20° full depth', value: 20 }, { label: '25° full depth', value: 25 }, { label: '14.5°', value: 14.5 }], default: 20 },
            { id: 'Pd', symbol: 'P_d', label: 'Diametral pitch', unit: 'teeth/in', kind: 'lookup', fig: 'f9-11', hint: 'Fig. 9-11, or given. Module given? P_d = 25.4/m', check: v => v.Pd !== undefined && [1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 32, 48, 64, 72, 80, 96, 120].indexOf(v.Pd) < 0 ? 'not a standard pitch (Table 8-3)' : null },
            { id: 'NP', symbol: 'N_P', label: 'Pinion teeth', kind: 'input', hint: '17 – 20 (guides); auto 17', auto: () => 17, check: v => v.NP !== undefined && v.NP < 17 && v.phi === 20 ? 'N_P < 17 → interference at 20° (Table 8-7)' : (v.NP !== undefined && v.NP !== Math.round(v.NP) ? 'must be an integer' : null) },
            { id: 'NG', symbol: 'N_G', label: 'Gear teeth', kind: 'input', hint: 'auto = round(N_P·VR_des); type the given value if specified', auto: v => has(v, 'NP', 'VRd') ? Math.round(v.NP * v.VRd) : undefined, check: v => v.NG !== undefined && v.NG !== Math.round(v.NG) ? 'must be an integer' : null },
            { id: 'mG', symbol: 'VR = m_G', label: 'Actual velocity (gear) ratio', kind: 'calc', compute: v => has(v, 'NP', 'NG') ? v.NG / v.NP : undefined },
            { id: 'nG', symbol: 'n_G', label: 'Actual gear speed', unit: 'rpm', kind: 'calc', compute: v => has(v, 'nP', 'NP', 'NG') ? v.nP * v.NP / v.NG : undefined, work: v => has(v, 'nP', 'NP', 'NG') ? '\\(n_G = ' + f(v.nP) + '\\times' + f(v.NP) + '/' + f(v.NG) + ' = ' + f(v.nP * v.NP / v.NG) + '\\ \\mathrm{rpm}\\)' : null },
          ],
          after: v => has(v, 'nG', 'nGd') ? (Math.abs(v.nG - v.nGd) / v.nGd < 0.05 ? okbad(true, 'n_G within 5 % of target ' + f(v.nGd) + ' rpm — confirm it is inside the specified range.') : okbad(false, 'n_G = ' + f(v.nG) + ' rpm is ' + f(100 * Math.abs(v.nG - v.nGd) / v.nGd, 3) + ' % off target — check the allowed range, else change N_P.')) : '' },
        { id: 'fw', title: 'Face width (F13 · M13)', fig: ['cteeth', 't8-1'],
          text: 'Guides and Mott (Sec. 9-9): "just use the nominal one" F = 12/P_d, within 8/P_d < F < 16/P_d, and keep 0.5 < F/D_P < 2 (else try another value). The course slide s51 quotes 8/P_d–12/P_d, the standard-teeth table 9/P–13/P, Shigley 3/P ≤ F ≤ 5π/P.',
          formula: 'F_{nom} = \\frac{12}{P_d},\\qquad \\frac{8}{P_d} < F < \\frac{16}{P_d},\\qquad 0.5 < \\frac{F}{D_P} < 2',
          vars: [
            { id: 'F', symbol: 'F', label: 'Face width', unit: 'in', kind: 'input', hint: 'auto = 12/P_d (round to a convenient size)', auto: v => has(v, 'Pd') ? 12 / v.Pd : undefined, check: v => has(v, 'F', 'Pd') && (v.F < 8 / v.Pd || v.F > 16 / v.Pd) ? 'outside the Mott/guide range 8/P_d … 16/P_d = ' + f(8 / v.Pd, 3) + ' … ' + f(16 / v.Pd, 3) + ' in' : null },
            { id: 'FdP', symbol: 'F/D_P', label: 'Face width to pinion diameter ratio', kind: 'calc', digits: 3, compute: v => has(v, 'F', 'DP') ? v.F / v.DP : undefined, check: v => v.FdP !== undefined && (v.FdP > 2 || v.FdP < 0.5) ? 'F/D_P should be between 0.5 and 2 — try a different F' : null },
          ] },
      ] },

      { title: 'Tooth geometry (Mech-guide spec question steps 1–9, Table 8-1)', text: 'All lengths in inches. Coarse pitch P_d < 20: b = 1.25/P_d, c = 0.25/P_d. Fine pitch P_d ≥ 20: b = 1.20/P_d + 0.002, c = 0.20/P_d + 0.002.', steps: [
        { id: 'geo1', title: 'Pitch diameters, centre distance, circular pitch, module', fig: ['t8-1'],
          formula: 'D_P = \\frac{N_P}{P_d},\\quad D_G = \\frac{N_G}{P_d},\\quad C = \\frac{N_P+N_G}{2P_d},\\quad p = \\frac{\\pi}{P_d},\\quad m = \\frac{25.4}{P_d}',
          vars: [
            { id: 'DP', symbol: 'D_P', label: 'Pinion pitch diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'NP', 'Pd') ? v.NP / v.Pd : undefined, work: v => has(v, 'NP', 'Pd') ? '\\(D_P = ' + f(v.NP) + '/' + f(v.Pd) + ' = ' + f(v.NP / v.Pd) + '\\ \\mathrm{in}\\)' : null },
            { id: 'DG', symbol: 'D_G', label: 'Gear pitch diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'NG', 'Pd') ? v.NG / v.Pd : undefined, work: v => has(v, 'NG', 'Pd') ? '\\(D_G = ' + f(v.NG) + '/' + f(v.Pd) + ' = ' + f(v.NG / v.Pd) + '\\ \\mathrm{in}\\)' : null },
            { id: 'C', symbol: 'C', label: 'Centre distance', unit: 'in', kind: 'calc', compute: v => has(v, 'DP', 'DG') ? (v.DP + v.DG) / 2 : undefined, work: v => has(v, 'DP', 'DG') ? '\\(C = (' + f(v.DP) + '+' + f(v.DG) + ')/2 = ' + f((v.DP + v.DG) / 2) + '\\ \\mathrm{in}\\)' : null },
            { id: 'p', symbol: 'p', label: 'Circular pitch', unit: 'in', kind: 'calc', compute: v => has(v, 'Pd') ? Math.PI / v.Pd : undefined },
            { id: 'm', symbol: 'm', label: 'Module (metric equivalent)', unit: 'mm', kind: 'calc', compute: v => has(v, 'Pd') ? 25.4 / v.Pd : undefined },
          ] },
        { id: 'geo2', title: 'Addendum, dedendum, clearance, depths, tooth thickness', fig: ['t8-1'],
          formula: 'a = \\frac{1}{P_d},\\quad b = \\frac{1.25}{P_d},\\quad c = \\frac{0.25}{P_d},\\quad h_t = a+b,\\quad h_k = 2a,\\quad t = \\frac{\\pi}{2P_d}',
          vars: [
            { id: 'a', symbol: 'a', label: 'Addendum', unit: 'in', kind: 'calc', compute: v => has(v, 'Pd') ? 1 / v.Pd : undefined },
            { id: 'b', symbol: 'b', label: 'Dedendum', unit: 'in', kind: 'calc', compute: v => has(v, 'Pd') ? (v.Pd < 20 ? 1.25 / v.Pd : 1.2 / v.Pd + 0.002) : undefined, work: v => has(v, 'Pd') ? (v.Pd < 20 ? '\\(b = 1.25/' + f(v.Pd) + ' = ' + f(1.25 / v.Pd) + '\\ \\mathrm{in}\\) (coarse)' : '\\(b = 1.20/' + f(v.Pd) + '+0.002 = ' + f(1.2 / v.Pd + 0.002) + '\\ \\mathrm{in}\\) (fine)') : null },
            { id: 'c', symbol: 'c', label: 'Clearance', unit: 'in', kind: 'calc', compute: v => has(v, 'Pd') ? (v.Pd < 20 ? 0.25 / v.Pd : 0.2 / v.Pd + 0.002) : undefined },
            { id: 'ht', symbol: 'h_t', label: 'Whole depth', unit: 'in', kind: 'calc', compute: v => has(v, 'a', 'b') ? v.a + v.b : undefined },
            { id: 'hk', symbol: 'h_k', label: 'Working depth', unit: 'in', kind: 'calc', compute: v => has(v, 'a') ? 2 * v.a : undefined },
            { id: 't', symbol: 't', label: 'Tooth thickness', unit: 'in', kind: 'calc', compute: v => has(v, 'p') ? v.p / 2 : undefined },
          ] },
        { id: 'geo3', title: 'Outside, root and base-circle diameters', fig: ['t8-1'],
          formula: 'D_o = \\frac{N+2}{P_d},\\qquad D_R = D - 2b,\\qquad D_b = D\\cos\\phi',
          vars: [
            { id: 'DoP', symbol: 'D_{oP}', label: 'Pinion outside diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'NP', 'Pd') ? (v.NP + 2) / v.Pd : undefined },
            { id: 'DoG', symbol: 'D_{oG}', label: 'Gear outside diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'NG', 'Pd') ? (v.NG + 2) / v.Pd : undefined },
            { id: 'DRP', symbol: 'D_{RP}', label: 'Pinion root diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'DP', 'b') ? v.DP - 2 * v.b : undefined },
            { id: 'DRG', symbol: 'D_{RG}', label: 'Gear root diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'DG', 'b') ? v.DG - 2 * v.b : undefined },
            { id: 'DbP', symbol: 'D_{bP}', label: 'Pinion base circle diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'DP', 'phi') ? v.DP * cosd(v.phi) : undefined },
            { id: 'DbG', symbol: 'D_{bG}', label: 'Gear base circle diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'DG', 'phi') ? v.DG * cosd(v.phi) : undefined },
            { id: 'mf', symbol: 'm_f', label: 'Contact ratio (Fizz formula)', kind: 'calc', digits: 3, compute: v => {
                if (!has(v, 'DoP', 'DoG', 'DbP', 'DbG', 'C', 'p', 'phi')) return undefined;
                const z = Math.sqrt(Math.max(0, (v.DoP / 2) ** 2 - (v.DbP / 2) ** 2)) + Math.sqrt(Math.max(0, (v.DoG / 2) ** 2 - (v.DbG / 2) ** 2)) - v.C * sind(v.phi);
                return z / (v.p * cosd(v.phi)); }, check: v => v.mf !== undefined && v.mf < 1.2 ? 'contact ratio should be ≥ 1.2' : null },
          ] },
      ] },

      { title: 'Forces (Sec. 9-3)', steps: [
        { id: 'force', title: 'Pitch line speed, transmitted, radial and normal loads, torques (F11–12 · M11–12)', fig: ['f9-3'],
          formula: 'v_t = \\frac{\\pi D_P n_P}{12},\\quad W_t = \\frac{33\\,000\\,P}{v_t} = \\frac{126\\,000\\,P}{nD},\\quad W_r = W_t\\tan\\phi,\\quad W_n = \\frac{W_t}{\\cos\\phi},\\quad T = \\frac{63\\,000\\,P}{n} = \\frac{W_t D}{2}',
          text: 'Use the actual power P (not P_des) for W_t — K_o enters the stress equations separately.',
          vars: [
            { id: 'vt', symbol: 'v_t', label: 'Pitch line speed', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'DP', 'nP') ? Math.PI * v.DP * v.nP / 12 : undefined, work: v => has(v, 'DP', 'nP') ? '\\(v_t = \\pi(' + f(v.DP) + ')(' + f(v.nP) + ')/12 = ' + f(Math.PI * v.DP * v.nP / 12) + '\\ \\mathrm{ft/min}\\)' : null },
            { id: 'Wt', symbol: 'W_t', label: 'Transmitted load', unit: 'lb', kind: 'calc', compute: v => has(v, 'P', 'vt') && v.vt > 0 ? 33000 * v.P / v.vt : undefined, work: v => has(v, 'P', 'vt') && v.vt > 0 ? '\\(W_t = 33\\,000(' + f(v.P) + ')/' + f(v.vt) + ' = ' + f(33000 * v.P / v.vt) + '\\ \\mathrm{lb}\\)' : null },
            { id: 'Wr', symbol: 'W_r', label: 'Radial load', unit: 'lb', kind: 'calc', compute: v => has(v, 'Wt', 'phi') ? v.Wt * tand(v.phi) : undefined },
            { id: 'Wn', symbol: 'W_n', label: 'Normal load', unit: 'lb', kind: 'calc', compute: v => has(v, 'Wt', 'phi') ? v.Wt / cosd(v.phi) : undefined },
            { id: 'TP', symbol: 'T_P', label: 'Pinion torque', unit: 'lb·in', kind: 'calc', compute: v => has(v, 'P', 'nP') ? 63000 * v.P / v.nP : undefined },
            { id: 'TG', symbol: 'T_G', label: 'Gear torque', unit: 'lb·in', kind: 'calc', compute: v => has(v, 'P', 'nG') ? 63000 * v.P / v.nG : undefined },
          ] },
      ] },

      { title: 'Stress-equation factors (Fizz steps 14–24 · Mech steps 14–19, 26–27)', steps: [
        { id: 'kv', title: 'Quality number A_v and dynamic factor K_v (F16–17 · M14–15)', fig: ['t9-4', 't9-5', 'f9-16', 't9-6'],
          formula: 'B = 0.25(A_v-5)^{0.667},\\quad C = 50+56(1-B),\\quad K_v = \\left[\\frac{C}{C+\\sqrt{v_t}}\\right]^{-B},\\quad v_{t,max} = [C+(14-A_v)]^2',
          text: 'A_v from the problem, else Table 9-5 by application or pitch-line speed (lower number = more precise; Fizz: "just guess what looks right") — default A_v = 10. A Shigley Q_v maps to A_v = 17 − Q_v (Table 9-4; midterm "A_v = 8 (Q = 9)"). The guides read K_v from Fig. 9-16; the auto value is the Table 9-6 equation of the same curves, which the course prefers ("difficult to read the graph accurately") — the midterm read ≈ 1.16 from the figure vs 1.17 by equation, both accepted.',
          after: v => has(v, 'vt') ? 'Table 9-5 by pitch-line speed (machine-tool / high-quality drives): v_t = ' + f(v.vt) + ' ft/min → A_v ' + AvT95(v.vt) + ' (Q_v ' + (17 - AvT95(v.vt)) + '). By application: cranes, punch press, mining conveyor A10; cement mixer/kiln, steel mill A11; small power drill A9; automotive transmission A6.' : '',
          vars: [
            { id: 'Av', symbol: 'A_v', label: 'AGMA quality number (Shigley Q_v in brackets)', kind: 'choice', fig: 't9-4', options: [6, 7, 8, 9, 10, 11, 12].map(q => ({ label: 'A_v = ' + q + '  (Q_v = ' + (17 - q) + ')', value: q })), default: 10 },
            { id: 'Bv', symbol: 'B', label: 'B', kind: 'calc', digits: 4, compute: v => has(v, 'Av') ? 0.25 * Math.pow(v.Av - 5, 0.667) : undefined },
            { id: 'Cv', symbol: 'C', label: 'C', kind: 'calc', digits: 4, compute: v => has(v, 'Bv') ? 50 + 56 * (1 - v.Bv) : undefined },
            { id: 'Kv', symbol: 'K_v', label: 'Dynamic factor', kind: 'lookup', fig: 'f9-16', hint: 'auto = Table 9-6 equation; or read Fig. 9-16', auto: v => has(v, 'Cv', 'Bv', 'vt') ? Math.pow(v.Cv / (v.Cv + Math.sqrt(v.vt)), -v.Bv) : undefined,
              work: v => has(v, 'Cv', 'Bv', 'vt') ? '\\(K_v = \\left[\\frac{' + f(v.Cv) + '}{' + f(v.Cv) + '+\\sqrt{' + f(v.vt) + '}}\\right]^{-' + f(v.Bv) + '} = ' + f(Math.pow(v.Cv / (v.Cv + Math.sqrt(v.vt)), -v.Bv)) + '\\)' : null },
            { id: 'vtmax', symbol: 'v_{t,max}', label: 'Max. pitch line speed for this A_v', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'Cv', 'Av') ? Math.pow(v.Cv + (14 - v.Av), 2) : undefined, check: v => has(v, 'vt', 'vtmax') && v.vt > v.vtmax ? 'v_t exceeds v_t,max — choose a lower (more precise) A_v' : null },
          ] },
        { id: 'j', title: 'Bending geometry factors J_P, J_G (F18 · M16)', fig: ['f9-10'],
          text: 'Fig. 9-10(a) for 20° ("assume 20° unless otherwise specified"), (b) for 25°. J_P: x = N_P on the curve for N_G mating teeth; J_G: x = N_G on the curve for N_P. The auto value interpolates a digitized copy of the chart (between the 17…1000-tooth mate curves) — check it against your own reading (e.g. Mott Ex. 9-7, 18/68 T: chart 0.325/0.410, auto 0.321/0.414).',
          vars: [
            { id: 'JP', symbol: 'J_P', label: 'Geometry factor, pinion', kind: 'lookup', fig: 'f9-10', digits: 3, hint: 'auto = digitized Fig. 9-10 (x = N_P, curve N_G)', auto: v => has(v, 'NP', 'NG', 'phi') ? Jchart(v.phi, v.NP, v.NG) : undefined },
            { id: 'JG', symbol: 'J_G', label: 'Geometry factor, gear', kind: 'lookup', fig: 'f9-10', digits: 3, hint: 'auto = digitized Fig. 9-10 (x = N_G, curve N_P)', auto: v => has(v, 'NP', 'NG', 'phi') ? Jchart(v.phi, v.NG, v.NP) : undefined },
          ] },
        { id: 'km', title: 'Size factor K_s and load-distribution factor K_m (F20–23 · M17–18)', eq: '9-17', fig: ['cks', 't9-2', 'f9-12', 'ccma', 'f9-13'],
          formula: 'K_m = 1 + C_{pf} + C_{ma},\\qquad C_{pf} = \\frac{F}{10D_P} - 0.025\\ (F\\le1),\\quad C_{pf} = \\frac{F}{10D_P} - 0.0375 + 0.0125F\\ (1\\le F<15)',
          text: 'K_s from Table 9-2 with P_d (1.00 for P_d ≥ 5 — the course\'s "typically K_s = 1", midterm); the Shigley formula 1.192(F√Y/P)^0.0535 is the accepted alternative (Tutorial 3: 1.088). C_pf: "use the equations if you can because the table is bad"; for F/D_P < 0.5 use F/D_P = 0.5. C_ma from Fig. 9-13 — guides and course: commercial enclosed gear units, C_ma = 0.127 + 0.0158F − 1.093×10⁻⁴F² (open 0.247 + 0.0167F − 0.765×10⁻⁴F²; precision 0.0675 + 0.0128F − 0.926×10⁻⁴F²; extra-precision 0.0380 + 0.0102F − 0.822×10⁻⁴F²). Midterm: C_pf = 0.0694, C_ma = 0.1505, K_m = 1.22.',
          vars: [
            { id: 'ksMode', label: 'K_s rule', kind: 'choice', options: [{ label: 'Table 9-2 by P_d (guides: = 1 for P_d ≥ 5)', value: 1 }, { label: 'Formula 1.192 (F√Y/P)^0.0535 (Tutorial 3)', value: 2 }], default: 1 },
            { id: 'Ks', symbol: 'K_s', label: 'Size factor', kind: 'lookup', fig: 'cks', hint: 'auto = Table 9-2 (1.00 for P_d ≥ 5) or the formula with the pinion Lewis Y', auto: v => v.ksMode === 2 ? (has(v, 'F', 'NP', 'Pd') && v.NP >= 12 ? Math.max(1, 1.192 * Math.pow(v.F * Math.sqrt(lewisY(v.NP)) / v.Pd, 0.0535)) : undefined) : (has(v, 'Pd') ? KS(v.Pd) : undefined),
              work: v => v.ksMode === 2 && has(v, 'F', 'NP', 'Pd') && v.NP >= 12 ? '\\(K_s = 1.192\\left(\\frac{' + f(v.F) + '\\sqrt{' + f(lewisY(v.NP), 3) + '}}{' + f(v.Pd) + '}\\right)^{0.0535} = ' + f(Math.max(1, 1.192 * Math.pow(v.F * Math.sqrt(lewisY(v.NP)) / v.Pd, 0.0535))) + '\\)' : null },
            { id: 'Cpf', symbol: 'C_{pf}', label: 'Pinion proportion factor', kind: 'lookup', fig: 'f9-12', digits: 4, hint: 'auto = Fig. 9-12 equations',
              auto: v => { if (!has(v, 'F', 'DP')) return undefined; const r = Math.max(v.F / (10 * v.DP), 0.05); return v.F < 1 ? r - 0.025 : r - 0.0375 + 0.0125 * v.F; },
              work: v => has(v, 'F', 'DP') ? '\\(C_{pf} = \\frac{' + f(v.F) + '}{10(' + f(v.DP) + ')}' + (v.F < 1 ? ' - 0.025' : ' - 0.0375 + 0.0125(' + f(v.F) + ')') + ' = ' + f(v.Cpf, 4) + '\\)' : null },
            { id: 'cond', label: 'Gearing condition (for C_ma)', kind: 'choice', type: 'text', options: [{ label: 'Open gearing', value: 'open' }, { label: 'Commercial enclosed gear units', value: 'commercial' }, { label: 'Precision enclosed gear units', value: 'precision' }, { label: 'Extra-precision enclosed gear units', value: 'extra' }], default: 'commercial' },
            { id: 'Cma', symbol: 'C_{ma}', label: 'Mesh alignment factor', kind: 'lookup', fig: 'f9-13', digits: 4, hint: 'auto = Fig. 9-13 curve equation', auto: v => { const k = CMA[v.cond]; return k && has(v, 'F') ? k[0] + k[1] * v.F + k[2] * v.F * v.F : undefined; },
              work: v => { const k = CMA[v.cond]; return k && has(v, 'F') ? '\\(C_{ma} = ' + k[0] + ' + ' + k[1] + '(' + f(v.F) + ') ' + (k[2] * 1e4).toFixed(3) + '\\times10^{-4}(' + f(v.F) + ')^2 = ' + f(v.Cma, 4) + '\\)' : null; } },
            { id: 'Km', symbol: 'K_m', label: 'Load-distribution factor', kind: 'calc', digits: 4, compute: v => has(v, 'Cpf', 'Cma') ? 1 + v.Cpf + v.Cma : undefined, work: v => has(v, 'Cpf', 'Cma') ? '\\(K_m = 1 + ' + f(v.Cpf, 4) + ' + ' + f(v.Cma, 4) + ' = ' + f(v.Km, 4) + '\\)' : null },
          ] },
        { id: 'kb', title: 'Rim thickness factor K_B (F24 · M19)', fig: ['f9-14', 'f9-15'],
          formula: 'm_B = \\frac{t_R}{h_t},\\qquad K_B = 1.6\\ln\\frac{2.242}{m_B}\\ (m_B<1.2),\\quad K_B = 1.0\\ (m_B\\ge1.2)',
          text: 'Fizz: "It will always be 1.00 unless it isn\'t"; Mech: "typically 1 for commercially made gears". Leave t_R blank for a solid blank.',
          vars: [
            { id: 'tR', symbol: 't_R', label: 'Rim thickness below tooth (blank = solid)', unit: 'in', kind: 'input' },
            { id: 'mB', symbol: 'm_B', label: 'Backup ratio', kind: 'calc', digits: 3, compute: v => has(v, 'tR', 'ht') ? v.tR / v.ht : undefined },
            { id: 'KB', symbol: 'K_B', label: 'Rim thickness factor', kind: 'lookup', fig: 'f9-14', hint: 'auto = 1 (solid) or the equation', auto: v => v.mB === undefined ? 1 : (v.mB < 1.2 ? 1.6 * Math.log(2.242 / v.mB) : 1) },
          ] },
        { id: 'i', title: 'Elastic coefficient C_p and pitting geometry factor I (F14–15, 19 · M26–27)', fig: ['t9-7', 'f9-17'],
          formula: 'I = \\frac{\\cos\\phi}{d_P\\left(\\frac{1}{\\rho_1}+\\frac{1}{\\rho_2}\\right)},\\quad \\rho_1 = \\sqrt{r_{oP}^2 - r_{bP}^2} - \\frac{\\pi\\cos\\phi}{P_d},\\quad \\rho_2 = C\\sin\\phi - \\rho_1\\qquad(\\text{Fig. 9-17 curves})',
          text: 'Material steel → C_p = 2300 (Table 9-7). Read I from Fig. 9-17 with the actual gear ratio and the N_P curve, same pressure angle. Fig. 9-17 plots AGMA I at the lowest point of single-tooth contact on the pinion; the auto value evaluates exactly that point (formula above), so it matches the chart. Shigley Eq. 14-23 evaluates I at the pitch point (cos φ sin φ/2 · m_G/(m_G+1)) and is the course-accepted alternative: tutorial 0.097 vs 0.1205, midterm 0.096 vs 0.117.',
          vars: [
            { id: 'Cp', symbol: 'C_p', label: 'Elastic coefficient', unit: '√psi', kind: 'lookup', fig: 't9-7', default: 2300, hint: '2300 steel/steel (guides; course standard)', check: v => v.Cp !== undefined && Math.abs(v.Cp - 2300) > 1 ? 'guides/course use 2300 √psi for steel on steel' : null },
            { id: 'I', symbol: 'I', label: 'Pitting geometry factor', kind: 'lookup', fig: 'f9-17', digits: 4, hint: 'auto = Fig. 9-17 (lowest point of single-tooth contact); Shigley Eq. 14-23 also accepted', auto: v => has(v, 'phi', 'NP', 'NG') ? I_lpstc(v.phi, v.NP, v.NG) : undefined },
          ],
          after: v => has(v, 'phi', 'mG') ? 'Fig. 9-17 value (auto formula): I = ' + (has(v, 'NP', 'NG') && I_lpstc(v.phi, v.NP, v.NG) !== undefined ? f(I_lpstc(v.phi, v.NP, v.NG), 4) : '—') + ' · Shigley Eq. 14-23 (pitch point): I = ' + f(cosd(v.phi) * sind(v.phi) / 2 * v.mG / (v.mG + 1), 4) + ' — type either into I.' : '' },
      ] },

      { title: 'Stress numbers (Fizz steps 32, 34 · Mech steps 20, 25, 28)', steps: [
        { id: 'sb', title: 'Bending stress numbers s_tP, s_tG (F32 · M20)', eq: '9-16',
          formula: 's_{tP} = \\frac{W_t P_d}{F J_P}K_o K_s K_m K_B K_v,\\qquad s_{tG} = s_{tP}\\frac{J_P}{J_G}',
          vars: [
            { id: 'stP', symbol: 's_{tP}', label: 'Pinion bending stress number', unit: 'psi', kind: 'calc', compute: v => has(v, 'Wt', 'Pd', 'F', 'JP', 'Ko', 'Ks', 'Km', 'KB', 'Kv') ? v.Wt * v.Pd / (v.F * v.JP) * v.Ko * v.Ks * v.Km * v.KB * v.Kv : undefined,
              work: v => v.stP !== undefined ? '\\(s_{tP} = \\frac{' + f(v.Wt) + '(' + f(v.Pd) + ')}{' + f(v.F) + '(' + f(v.JP, 3) + ')}(' + f(v.Ko) + ')(' + f(v.Ks) + ')(' + f(v.Km, 4) + ')(' + f(v.KB) + ')(' + f(v.Kv) + ') = ' + f(v.stP) + '\\ \\mathrm{psi}\\)' : null },
            { id: 'stG', symbol: 's_{tG}', label: 'Gear bending stress number', unit: 'psi', kind: 'calc', compute: v => has(v, 'stP', 'JP', 'JG') ? v.stP * v.JP / v.JG : undefined, work: v => v.stG !== undefined ? '\\(s_{tG} = ' + f(v.stP) + '(' + f(v.JP, 3) + '/' + f(v.JG, 3) + ') = ' + f(v.stG) + '\\ \\mathrm{psi}\\)' : null },
          ] },
        { id: 'sc', title: 'Contact stress number s_c, same for pinion and gear (F34 · M25, 28)', eq: '9-23',
          formula: 's_c = C_p\\sqrt{\\frac{W_t K_o K_s K_m K_v}{F D_P I}}',
          text: 'Always D_P (pinion). "This is the expected contact stress and will be the same for the gear and pinion" (Fizz p.48). K_B is NOT in Mott Eq. 9-23 — the Mech guide (p.73, p.88) misprints it inside the root.',
          vars: [
            { id: 'sc', symbol: 's_c', label: 'Contact stress number', unit: 'psi', kind: 'calc', compute: v => has(v, 'Cp', 'Wt', 'Ko', 'Ks', 'Km', 'Kv', 'F', 'DP', 'I') ? v.Cp * Math.sqrt(v.Wt * v.Ko * v.Ks * v.Km * v.Kv / (v.F * v.DP * v.I)) : undefined,
              work: v => v.sc !== undefined ? '\\(s_c = ' + f(v.Cp) + '\\sqrt{\\frac{' + f(v.Wt) + '(' + f(v.Ko) + ')(' + f(v.Ks) + ')(' + f(v.Km, 4) + ')(' + f(v.Kv) + ')}{' + f(v.F) + '(' + f(v.DP) + ')(' + f(v.I, 4) + ')}} = ' + f(v.sc) + '\\ \\mathrm{psi}\\)' : null },
          ] },
      ] },

      { title: 'Life, reliability, stress-cycle factors (Fizz steps 25–31 · Mech steps 21–22, 29)', steps: [
        { id: 'life', title: 'Service factor, reliability, design life, load cycles (F25–29 · M21a–d)', eq: '9-27', fig: ['t9-11', 't9-12'],
          formula: 'N_c = 60\\,L\\,n\\,q',
          text: 'Guides: "specify a service factor SF between 1.00 and 1.50 — usually pick 1.00" (Mech: "assume 1 for now"), so the stress step gives the <b>minimum</b> s_at/s_ac; then pick a steel so that 1.0 ≤ SF ≤ 1.5 (course: "AGMA suggests SF of 1 to 1.5"). Reliability: "assume 99 %" → K_R = 1.00 (tutorials with 90 % use 0.85). Life: from the problem — hours/day × days/yr × years (midterm: 1750 × 60 × 6 × 200 × 1 = 1.26×10⁸) or hours — otherwise from Table 9-12; <b>blank uses 20 000 h</b> (general industrial machines, as in Mott Ex. 9-5). AGMA strengths s_at/s_ac are for 10⁷ cycles (Y_N = Z_N = 1): to design for exactly 10⁷ cycles enter L = 10⁷/(60 n_P). q = 1 load per revolution (2 for an idler).',
          vars: [
            { id: 'SFd', symbol: 'SF', label: 'Service (design safety) factor', kind: 'input', default: 1, hint: '1.00 (guides: usually 1.00; then target 1.0–1.5)', check: v => v.SFd !== undefined && (v.SFd < 1 || v.SFd > 1.5) ? 'guides/AGMA: 1.0–1.5' : null },
            { id: 'R', symbol: 'R', label: 'Reliability', kind: 'input', default: 0.99, hint: '0.99 (guides: "assume 99 %") · 0.90 · 0.999 · 0.9999' },
            { id: 'KR', symbol: 'K_R', label: 'Reliability factor', kind: 'lookup', fig: 't9-11', digits: 3, hint: 'Table 9-11: 0.99 → 1.00, 0.90 → 0.85', auto: v => { if (!has(v, 'R')) return undefined; if (KR[v.R] !== undefined) return KR[v.R]; return v.R < 0.99 ? 0.658 - 0.0759 * Math.log(1 - v.R) : 0.5 - 0.109 * Math.log(1 - v.R); } },
            { id: 'hpd', symbol: 'h/day', label: 'Hours per day (optional)', unit: 'h', kind: 'input' },
            { id: 'dpy', symbol: 'days/yr', label: 'Days per year (optional)', unit: 'd', kind: 'input' },
            { id: 'yrs', symbol: 'yr', label: 'Years of service (optional)', unit: 'yr', kind: 'input' },
            { id: 'Lh', symbol: 'L', label: 'Design life', unit: 'h', kind: 'lookup', fig: 't9-12', hint: 'auto = h/day × days/yr × yr if given, else 20 000 h (Table 9-12, general industrial machines)', auto: v => has(v, 'hpd', 'dpy', 'yrs') ? v.hpd * v.dpy * v.yrs : L_DEF },
            { id: 'q', symbol: 'q', label: 'Load applications per revolution', kind: 'input', default: 1 },
            { id: 'NcP', symbol: 'N_{cP}', label: 'Pinion load cycles', kind: 'calc', digits: 4, compute: v => has(v, 'Lh', 'nP', 'q') ? 60 * v.Lh * v.nP * v.q : undefined, work: v => v.NcP !== undefined ? '\\(N_{cP} = 60(' + f(v.Lh) + ')(' + f(v.nP) + ')(' + f(v.q) + ') = ' + f(v.NcP) + '\\)' : null },
            { id: 'NcG', symbol: 'N_{cG}', label: 'Gear load cycles', kind: 'calc', digits: 4, compute: v => has(v, 'Lh', 'nG', 'q') ? 60 * v.Lh * v.nG * v.q : undefined, work: v => v.NcG !== undefined ? '\\(N_{cG} = 60(' + f(v.Lh) + ')(' + f(v.nG) + ')(' + f(v.q) + ') = ' + f(v.NcG) + '\\)' : null },
          ] },
        { id: 'yz', title: 'Stress cycle factors Y_N and Z_N (F30–31 · M21e, 29)', fig: ['cyn', 'czn', 'f9-21', 'f9-22'],
          formula: 'Y_N = 1.3558\\,N_c^{-0.0178}\\ (N_c \\ge 3\\times10^6),\\qquad Z_N = 1.4488\\,N_c^{-0.023}\\ (N_c \\ge 10^7)',
          text: 'Read Fig. 9-21 / 9-22; the auto value uses the equations printed on the charts — beyond the knee the <b>upper line for normal commercial gears</b> (course; the 1.6831 N^-0.0323 line is for high-precision applications only), below it the 250 HB line (Y_N = 4.9404 N^-0.1045) and Z_N = 2.466 N^-0.056. Graph readings are also accepted (midterm Z_N = 0.95 vs 0.943 by equation).',
          vars: [
            { id: 'YNP', symbol: 'Y_{NP}', label: 'Bending stress cycle factor, pinion', kind: 'lookup', fig: 'cyn', digits: 4, auto: v => has(v, 'NcP') ? YN_auto(v.NcP) : undefined, hint: 'auto = Fig. 9-21 equations (commercial line beyond the knee)', work: v => has(v, 'NcP') ? YNw('Y_{NP}', v.NcP) : null },
            { id: 'YNG', symbol: 'Y_{NG}', label: 'Bending stress cycle factor, gear', kind: 'lookup', fig: 'cyn', digits: 4, auto: v => has(v, 'NcG') ? YN_auto(v.NcG) : undefined, work: v => has(v, 'NcG') ? YNw('Y_{NG}', v.NcG) : null },
            { id: 'ZNP', symbol: 'Z_{NP}', label: 'Pitting stress cycle factor, pinion', kind: 'lookup', fig: 'czn', digits: 4, auto: v => has(v, 'NcP') ? ZN_auto(v.NcP) : undefined, hint: 'auto = Fig. 9-22 equations (commercial line beyond 10⁷)', work: v => has(v, 'NcP') ? ZNw('Z_{NP}', v.NcP) : null },
            { id: 'ZNG', symbol: 'Z_{NG}', label: 'Pitting stress cycle factor, gear', kind: 'lookup', fig: 'czn', digits: 4, auto: v => has(v, 'NcG') ? ZN_auto(v.NcG) : undefined, work: v => has(v, 'NcG') ? ZNw('Z_{NG}', v.NcG) : null },
          ] },
      ] },

      { title: 'Required strength & hardness — material selection (Fizz steps 33, 35, 37–38, 40 · Mech steps 21–23, 29–30)', steps: [
        { id: 'req', title: 'Required allowable stress numbers (F33, 35 · M21–22, 29)', eq: '9-30, 9-31',
          formula: 's_{at} > s_t\\frac{K_R\\,(SF)}{Y_N},\\qquad s_{ac} > s_c\\frac{K_R\\,(SF)}{Z_N}',
          vars: [
            { id: 'satP', symbol: 's_{at,P}', label: 'Required bending stress number, pinion', unit: 'psi', kind: 'calc', compute: v => has(v, 'stP', 'KR', 'SFd', 'YNP') ? v.stP * v.KR * v.SFd / v.YNP : undefined, work: v => v.satP !== undefined ? '\\(s_{at,P} = ' + f(v.stP) + '(' + f(v.KR, 3) + ')(' + f(v.SFd) + ')/' + f(v.YNP, 4) + ' = ' + f(v.satP) + '\\ \\mathrm{psi}\\)' : null },
            { id: 'satG', symbol: 's_{at,G}', label: 'Required bending stress number, gear', unit: 'psi', kind: 'calc', compute: v => has(v, 'stG', 'KR', 'SFd', 'YNG') ? v.stG * v.KR * v.SFd / v.YNG : undefined },
            { id: 'sacP', symbol: 's_{ac,P}', label: 'Required contact stress number, pinion', unit: 'psi', kind: 'calc', compute: v => has(v, 'sc', 'KR', 'SFd', 'ZNP') ? v.sc * v.KR * v.SFd / v.ZNP : undefined, work: v => v.sacP !== undefined ? '\\(s_{ac,P} = ' + f(v.sc) + '(' + f(v.KR, 3) + ')(' + f(v.SFd) + ')/' + f(v.ZNP, 4) + ' = ' + f(v.sacP) + '\\ \\mathrm{psi}\\)' : null },
            { id: 'sacG', symbol: 's_{ac,G}', label: 'Required contact stress number, gear', unit: 'psi', kind: 'calc', compute: v => has(v, 'sc', 'KR', 'SFd', 'ZNG') ? v.sc * v.KR * v.SFd / v.ZNG : undefined },
          ] },
        { id: 'hb', title: 'Required Brinell hardness and material (F37–38, 40 · M23, 30)', fig: ['f9-18', 'f9-19', 't9-8', 'app3a', 'app3b', 'app5', 't9-9', 't9-10'],
          formula: 'HB = \\frac{s_{at}/1000 - 12.80}{0.0773}\\ (\\text{grade 1}),\\qquad HB = \\frac{s_{ac}/1000 - 29.10}{0.322}\\ (\\text{grade 1})',
          text: 'Grade 1 is the course default (Grade 2: HB = (s_at/1000 − 16.40)/0.102, HB = (s_ac/1000 − 34.30)/0.349). Choose the LARGEST. <b>Course material step (Module 2 p27, Midterm P2 part 3):</b> pick an alloy + heat treatment from Table 9-8 / Appendix 3 with at least this hardness and quote its HB and % elongation — e.g. 4140 annealed HB 197, 4140 OQT1300 HB 235, 4140 OQT1000 HB 341, 4340 OQT1000 HB 363 (16 % el.), 4340 OQT700 HB 461 ("OQT1300" = oil-quenched &amp; tempered at 1300 °F; HB ≈ 2 × s_u ksi). Same material for pinion and gear (Fizz p.48; Mech: "design using pinion values as the gear will be the same material"); Mech: "look at appendix 3 or 5 … we normally use Appendix 3". Then confirm 1.0 ≤ SF ≤ 1.5 below. HB > 400 → flame/induction hardening or carburizing (Table 9-9, Appendix 5) instead of through-hardening (Fizz step 40).',
          vars: [
            { id: 'grade', label: 'Steel grade', kind: 'choice', options: [{ label: 'Grade 1 (guides and course default)', value: 1 }, { label: 'Grade 2', value: 2 }], default: 1 },
            { id: 'HBbP', symbol: 'HB_{bend,P}', label: 'Hardness for pinion bending', unit: 'HB', kind: 'calc', digits: 4, compute: v => has(v, 'satP', 'grade') ? Math.max(0, satHB(v.satP, v.grade)) : undefined, work: v => v.HBbP !== undefined ? '\\(HB = (' + f(v.satP / 1000) + ' - ' + (v.grade === 2 ? '16.40)/0.102' : '12.80)/0.0773') + ' = ' + f(satHB(v.satP, v.grade)) + '\\)' : null },
            { id: 'HBbG', symbol: 'HB_{bend,G}', label: 'Hardness for gear bending', unit: 'HB', kind: 'calc', digits: 4, compute: v => has(v, 'satG', 'grade') ? Math.max(0, satHB(v.satG, v.grade)) : undefined },
            { id: 'HBcP', symbol: 'HB_{cont,P}', label: 'Hardness for pinion contact', unit: 'HB', kind: 'calc', digits: 4, compute: v => has(v, 'sacP', 'grade') ? Math.max(0, sacHB(v.sacP, v.grade)) : undefined, work: v => v.HBcP !== undefined ? '\\(HB = (' + f(v.sacP / 1000) + ' - ' + (v.grade === 2 ? '34.30)/0.349' : '29.10)/0.322') + ' = ' + f(sacHB(v.sacP, v.grade)) + '\\)' : null },
            { id: 'HBcG', symbol: 'HB_{cont,G}', label: 'Hardness for gear contact', unit: 'HB', kind: 'calc', digits: 4, compute: v => has(v, 'sacG', 'grade') ? Math.max(0, sacHB(v.sacG, v.grade)) : undefined },
            { id: 'HBreq', symbol: 'HB_{req}', label: 'REQUIRED hardness (largest)', unit: 'HB', kind: 'calc', digits: 4, compute: v => { const a = [v.HBbP, v.HBbG, v.HBcP, v.HBcG].filter(x => typeof x === 'number'); return a.length ? Math.max(...a) : undefined; } },
          ],
          after: v => v.HBreq === undefined ? '' : (v.HBreq > 400 ? okbad(false, 'Required ' + f(v.HBreq, 3) + ' HB > 400: through-hardening is not adequate. Specify flame/induction-hardened (s_ac 170–175 ksi) or carburized grade-1 steel (s_at 55 ksi, s_ac 180 ksi, Table 9-9; e.g. SAE 4320 / 8620 carburized), or enlarge the gears.') : okbad(true, 'Specify a through-hardened grade-' + v.grade + ' steel with HB ≥ ' + f(Math.ceil(v.HBreq), 3) + ' for pinion and gear (' + (v.HBcP >= v.HBbP ? 'pitting' : 'bending') + ' governs). Pick from Appendix 3 / Table 9-8, e.g. SAE 1045, 4140, 4340 Q&T to at least that hardness' + (v.HBreq < 180 ? ' (any ≥ 180 HB steel is fine — below the AGMA data range)' : '') + '.')) },
      ] },

      { title: 'Check the chosen material — safety factors (Fizz steps 36, 39 · Mech steps 24, 30)', steps: [
        { id: 'mat', title: 'Allowable stress numbers of the chosen material (M24, 30)', fig: ['f9-18', 'f9-19', 'app3a', 'app3b', 'app5', 't9-9', 't9-10'],
          formula: 's_{at} = 0.0773\\,HB + 12.80\\ \\mathrm{ksi},\\qquad s_{ac} = 0.322\\,HB + 29.10\\ \\mathrm{ksi}\\quad(\\text{grade 1, through-hardened})',
          text: 'Enter the Brinell hardness of the chosen steel (Appendix 3), or type s_at / s_ac directly for case-hardened (Table 9-9) or iron/bronze (Table 9-10).',
          vars: [
            { id: 'HBP', symbol: 'HB_P', label: 'Pinion hardness', unit: 'HB', kind: 'input' },
            { id: 'HBG', symbol: 'HB_G', label: 'Gear hardness', unit: 'HB', kind: 'input', hint: 'auto = pinion HB (guides: same material for both)', auto: v => v.HBP },
            { id: 'satmP', symbol: 's_{at}', label: 'Allowable bending stress number, pinion', unit: 'psi', kind: 'lookup', fig: 'f9-18', auto: v => has(v, 'HBP', 'grade') ? satOf(v.HBP, v.grade) : undefined, hint: 'auto from Fig. 9-18; Table 9-9/9-10 for other materials' },
            { id: 'satmG', symbol: 's_{at}', label: 'Allowable bending stress number, gear', unit: 'psi', kind: 'lookup', fig: 'f9-18', auto: v => has(v, 'HBG', 'grade') ? satOf(v.HBG, v.grade) : undefined },
            { id: 'sacmP', symbol: 's_{ac}', label: 'Allowable contact stress number, pinion', unit: 'psi', kind: 'lookup', fig: 'f9-19', auto: v => has(v, 'HBP', 'grade') ? sacOf(v.HBP, v.grade) : undefined, hint: 'auto from Fig. 9-19' },
            { id: 'sacmG', symbol: 's_{ac}', label: 'Allowable contact stress number, gear', unit: 'psi', kind: 'lookup', fig: 'f9-19', auto: v => has(v, 'HBG', 'grade') ? sacOf(v.HBG, v.grade) : undefined },
          ] },
        { id: 'sf', title: 'Safety factors and power capacity — PASS / FAIL (F36, 39 · M24, 30)', eq: '9-32, 9-33',
          formula: 'SF_{bend} = \\frac{s_{at}}{s_t}\\frac{Y_N}{K_R},\\qquad SF_{cont} = \\frac{s_{ac}}{s_c}\\frac{Z_N}{K_R}',
          text: 'Fizz step 36: verify 1.0 < SF < 1.5 — higher is safe but wasteful. The contact SF uses Z_N (Mott Eq. 9-33 and Fizz p.48 print Y_N — a typo; Mech p.91 has Z_N). Contact (pitting) normally governs for long lives. Fizz step 39: power the pinion can transmit with this material at the design SF.',
          vars: [
            { id: 'SFbP', symbol: 'SF_{bend,P}', label: 'Bending safety factor, pinion', kind: 'calc', digits: 3, compute: v => has(v, 'satmP', 'stP', 'YNP', 'KR') ? v.satmP / v.stP * v.YNP / v.KR : undefined, work: v => v.SFbP !== undefined ? '\\(SF = \\frac{' + f(v.satmP) + '}{' + f(v.stP) + '}\\cdot\\frac{' + f(v.YNP, 4) + '}{' + f(v.KR, 3) + '} = ' + f(v.SFbP, 3) + '\\)' : null },
            { id: 'SFbG', symbol: 'SF_{bend,G}', label: 'Bending safety factor, gear', kind: 'calc', digits: 3, compute: v => has(v, 'satmG', 'stG', 'YNG', 'KR') ? v.satmG / v.stG * v.YNG / v.KR : undefined, work: v => v.SFbG !== undefined ? '\\(SF = \\frac{' + f(v.satmG) + '}{' + f(v.stG) + '}\\cdot\\frac{' + f(v.YNG, 4) + '}{' + f(v.KR, 3) + '} = ' + f(v.SFbG, 3) + '\\)' : null },
            { id: 'SFcP', symbol: 'SF_{cont,P}', label: 'Contact safety factor, pinion', kind: 'calc', digits: 3, compute: v => has(v, 'sacmP', 'sc', 'ZNP', 'KR') ? v.sacmP / v.sc * v.ZNP / v.KR : undefined, work: v => v.SFcP !== undefined ? '\\(SF = \\frac{' + f(v.sacmP) + '}{' + f(v.sc) + '}\\cdot\\frac{' + f(v.ZNP, 4) + '}{' + f(v.KR, 3) + '} = ' + f(v.SFcP, 3) + '\\)' : null },
            { id: 'SFcG', symbol: 'SF_{cont,G}', label: 'Contact safety factor, gear', kind: 'calc', digits: 3, compute: v => has(v, 'sacmG', 'sc', 'ZNG', 'KR') ? v.sacmG / v.sc * v.ZNG / v.KR : undefined, work: v => v.SFcG !== undefined ? '\\(SF = \\frac{' + f(v.sacmG) + '}{' + f(v.sc) + '}\\cdot\\frac{' + f(v.ZNG, 4) + '}{' + f(v.KR, 3) + '} = ' + f(v.SFcG, 3) + '\\)' : null },
            { id: 'Pcap', symbol: 'P_{cap}', label: 'Power capacity, pinion bending (Fizz step 39)', unit: 'hp', kind: 'calc', compute: v => has(v, 'satmP', 'YNP', 'F', 'JP', 'nP', 'DP', 'Pd', 'SFd', 'KR', 'Ko', 'Ks', 'Km', 'KB', 'Kv') ? v.satmP * v.YNP * v.F * v.JP * v.nP * v.DP / (126000 * v.Pd * v.SFd * v.KR * v.Ko * v.Ks * v.Km * v.KB * v.Kv) : undefined, hint: 'P_cap = s_at Y_N F J n_P D_P / (126000 P_d SF K_R K_o K_s K_m K_B K_v)' },
            { id: 'Pcapc', symbol: 'P_{cap,c}', label: 'Power capacity, pinion pitting (Fizz step 39)', unit: 'hp', kind: 'calc', compute: v => has(v, 'sacmP', 'ZNP', 'F', 'I', 'nP', 'DP', 'SFd', 'KR', 'Cp', 'Ko', 'Ks', 'Km', 'Kv') ? v.nP * v.F * v.I / (126000 * v.Ko * v.Ks * v.Km * v.Kv) * Math.pow(v.sacmP * v.DP * v.ZNP / (v.SFd * v.KR * v.Cp), 2) : undefined, hint: 'P_cap = n_P F I/(126000 K_o K_s K_m K_v) · [s_ac D_P Z_N/(SF K_R C_p)]²' },
          ],
          after: v => {
            if (!has(v, 'SFbP', 'SFbG', 'SFcP', 'SFcG')) return '<i>Enter the chosen material hardness (or s_at / s_ac) to get the safety factors.</i>';
            const d = v.SFd || 1; const mn = Math.min(v.SFbP, v.SFbG, v.SFcP, v.SFcG);
            const txt = 'Bending SF: pinion ' + f(v.SFbP, 3) + ', gear ' + f(v.SFbG, 3) + '. Contact SF: pinion ' + f(v.SFcP, 3) + ', gear ' + f(v.SFcG, 3) + '. ';
            return mn >= d ? okbad(true, 'PASS — all safety factors ≥ ' + f(d) + '. ' + txt + (mn > 1.5 ? 'Minimum ' + f(mn, 3) + ' is above the AGMA 1.0–1.5 range: the design is conservative (could use a softer/cheaper steel or smaller gears).' : 'Governing SF = ' + f(mn, 3) + ' (within AGMA 1.0–1.5).')) : okbad(false, 'FAIL — minimum SF ' + f(mn, 3) + ' < ' + f(d) + '. ' + txt + 'Use a harder/case-hardened steel, widen F, use a smaller P_d or a better quality number.');
          } },
      ] },

      { title: 'Gear train (optional) — train value', steps: [
        { id: 'train', title: 'Compound train: speed and torque chain (Fizz p.76)', fig: ['f8-42', 'tv'],
          formula: 'TV = (VR_1)(VR_2) = \\frac{N_B N_D}{N_A N_C} = \\frac{n_{in}}{n_{out}},\\qquad n_{out} = \\frac{n_{in}}{TV},\\qquad T_{out} = TV\\cdot T_{in}\\ (\\text{no losses})',
          text: 'Fizz "Gear Trains": TV = (VR)₁(VR)₂… = N_output/N_input = n_input/n_output. TV > 1 for a reducer. Leave stage 2 blank for a single pair. Each external mesh reverses the direction of rotation.',
          vars: [
            { id: 'NA', symbol: 'N_A', label: 'Stage 1 driver teeth', kind: 'input' },
            { id: 'NB', symbol: 'N_B', label: 'Stage 1 driven teeth', kind: 'input' },
            { id: 'NC', symbol: 'N_C', label: 'Stage 2 driver teeth (blank if none)', kind: 'input' },
            { id: 'ND', symbol: 'N_D', label: 'Stage 2 driven teeth', kind: 'input' },
            { id: 'nin', symbol: 'n_{in}', label: 'Input speed', unit: 'rpm', kind: 'input', auto: v => v.nP },
            { id: 'TV', symbol: 'TV', label: 'Train value', kind: 'calc', digits: 4, compute: v => has(v, 'NA', 'NB') ? (v.NB / v.NA) * (has(v, 'NC', 'ND') ? v.ND / v.NC : 1) : undefined,
              work: v => has(v, 'NA', 'NB') ? '\\(TV = \\frac{' + f(v.NB) + (has(v, 'NC', 'ND') ? '\\times' + f(v.ND) : '') + '}{' + f(v.NA) + (has(v, 'NC', 'ND') ? '\\times' + f(v.NC) : '') + '} = ' + f(v.TV, 4) + '\\)' : null },
            { id: 'nout', symbol: 'n_{out}', label: 'Output speed', unit: 'rpm', kind: 'calc', compute: v => has(v, 'TV', 'nin') ? v.nin / v.TV : undefined },
            { id: 'Tout', symbol: 'T_{out}', label: 'Output torque (100 % efficiency)', unit: 'lb·in', kind: 'calc', compute: v => has(v, 'TV', 'nin', 'P') ? 63000 * v.P / v.nin * v.TV : undefined },
          ],
          after: v => v.TV === undefined ? '' : ('Direction: ' + ((has(v, 'NC', 'ND') ? 2 : 1) % 2 ? 'odd number of meshes → output turns OPPOSITE to input' : 'even number of meshes → output turns the SAME way as input') + '.') },
      ] },
    ],
  };
})();
