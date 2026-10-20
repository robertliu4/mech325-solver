/* Spur gears — Shigley 11e (Ch. 13 geometry/forces, Ch. 14 AGMA stress). Merged Fizz 40-step + Mech-bible procedure.
 * Defaults follow the UBC MECH 325 course conventions (v2/COURSE_CONVENTIONS.md §0, §6, §7: Gear_Stress_2026 slides, Module 2 tutorial solutions, Midterm 2025).
 * Verified against: Gear Trains Tutorial 3 / Module 2 p5–15 (5 hp, 300 rpm, 16/48 T, P=6, F=2, Qv=6, 200 HB, R=0.90, 10^8 cycles, J=0.27
 *   → dP 2.667, V 209.4, Wt 787.8, Kv 1.196, Ks 1.088, Km 1.221, σ 13 904 psi, I 0.1205, σc 101 481 psi, YN 0.977, ZN 0.948, SF 2.34, SH 1.03)
 * Verified against: Midterm 2025 P2 (10 hp, 1750 → 650 rpm, P=10, NP=17, F=1.5, Qv=9, Ko=1.25, 6 h/day × 200 d × 1 yr
 *   → NG 46, dP 1.700, V 778.9, Wt 423.7, Wr 154.2, Kv 1.175, Km 1.220, I 0.117 (Eq 14-23) → σc 115.8 ksi; with Mott I = 0.096 → 127.8 ksi;
 *     N 1.26e8, ZN 0.943, Sc,min 135.5 ksi (SF 1) → HB ≥ 330; 4340 OQT1000 HB 363 → SH 1.08 ≈ 1.10) */
(function () {
  // ---------- local helpers ----------
  const has = (v, ...ids) => H.has(v, ...ids);
  const f = (x, d) => H.fmt(x, d);
  const cosd = a => Math.cos(H.rad(a)), sind = a => Math.sin(H.rad(a)), tand = a => Math.tan(H.rad(a));
  // Table 14-2 Lewis form factor Y (20°, full depth)
  const Y_N = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 24, 26, 28, 30, 34, 38, 43, 50, 60, 75, 100, 150, 300, 400];
  const Y_V = [0.245, 0.261, 0.277, 0.29, 0.296, 0.303, 0.309, 0.314, 0.322, 0.328, 0.331, 0.337, 0.346, 0.353, 0.359, 0.371, 0.384, 0.397, 0.409, 0.422, 0.435, 0.447, 0.46, 0.472, 0.48];
  const lewisY = N => H.interp(N, Y_N, Y_V);
  // rough read of Fig 14-6 (load at HPSTC, mate ≈ 50–85 teeth). Only a placeholder until the chart is read.
  const J_N = [12, 15, 17, 20, 24, 30, 35, 40, 45, 50, 60, 80, 125, 275, 1000];
  const J_V = [0.24, 0.27, 0.30, 0.335, 0.36, 0.385, 0.40, 0.41, 0.42, 0.425, 0.44, 0.455, 0.47, 0.49, 0.50];
  const Jest = N => (N >= 12) ? H.interp(N, J_N, J_V) : undefined;
  // Table 14-9 constants for Cma (Eq 14-34)
  const CMA = { open: [0.247, 0.0167, -0.765e-4], commercial: [0.127, 0.0158, -0.930e-4], precision: [0.0675, 0.0128, -0.926e-4], extra: [0.00360, 0.0102, -0.822e-4] };
  // Ko table (Fig 14-17 / 14-18)
  const KO = { uniform: { uniform: 1.00, moderate: 1.25, heavy: 1.75 }, light: { uniform: 1.25, moderate: 1.50, heavy: 2.00 }, medium: { uniform: 1.50, moderate: 1.75, heavy: 2.25 } };
  const KR = { 0.5: 0.70, 0.9: 0.85, 0.99: 1.00, 0.999: 1.25, 0.9999: 1.50 };
  const Ks_eq = (F, N, P) => { if (!(F > 0 && N > 0 && P > 0)) return undefined; const k = 1.192 * Math.pow(F * Math.sqrt(lewisY(N)) / P, 0.0535); return k < 1 ? 1 : k; };
  const YN_auto = N => N >= 1e7 ? 1.3558 * Math.pow(N, -0.0178) : Math.max(1, 4.9404 * Math.pow(N, -0.1045)); // 250 HB line below 10^7
  const ZN_auto = N => N >= 1e7 ? 1.4488 * Math.pow(N, -0.023) : 2.466 * Math.pow(N, -0.056);
  const okbad = (ok, txt) => '<span class="' + (ok ? 'result-ok' : 'result-bad') + '">' + txt + '</span>';

  window.TOPIC = {
    id: 'spur', book: 'shigley',
    title: 'Spur Gears — Design & AGMA Stress',
    subtitle: 'Shigley Ch. 13–14 · Fizz 40-step + Mech-guide procedure merged',
    sibling: 'spur_mott.html',
    intro: 'Full spur-gear design in Shigley notation: inputs → tooth geometry → forces → AGMA bending (Eq. 14-15) and contact (Eq. 14-16) stress → fully-corrected strengths (Eqs. 14-17/14-18) → <b>required Brinell hardness</b> (grade-1/2 steel, Figs. 14-2 &amp; 14-5) and factors of safety <i>S<sub>F</sub></i>, <i>S<sub>H</sub></i> (Eqs. 14-41/14-42) for a chosen material. Yellow fields are chart/table readings — an <i>auto</i> estimate from the textbook curve-fit is filled in until you type the value you read. <b>Defaults are the MECH 325 course assumptions</b> (Gear_Stress_2026 slides, Module 2 tutorials, Midterm 2025): C<sub>p</sub> = 2300 √psi, C<sub>f</sub> = 1, K<sub>s</sub> = 1 (or the Lewis-Y formula), K<sub>B</sub> = 1, K<sub>T</sub> = 1, K<sub>R</sub> = 1.00 at 99 %, C<sub>H</sub> = 1, C<sub>mc</sub> = C<sub>pm</sub> = C<sub>e</sub> = 1 with C<sub>ma</sub> curve 2 (commercial enclosed), K<sub>v</sub> by Eq. 14-27 with Mott\'s Q<sub>v</sub> ↔ A<sub>v</sub> mapping, life 10<sup>7</sup> cycles on the upper (commercial) Y<sub>N</sub>/Z<sub>N</sub> lines, grade-1 through-hardened steel, S<sub>F</sub> = 1 to find the minimum strength then a steel from Mott Table 9-8 / App. 3. Example = Midterm 2025 P2 (10 hp, 1750 → 650 rpm, 17 T, P<sub>d</sub> = 10).',
    example: { P: 10, nP: 1750, nGd: 650, src: 'uniform', drv: 'moderate', phi: 20, Pd: 10, NP: 17, F: 1.5, Qv: 9, ksMode: 1, Cmc: 1, Cpm: 1, cond: 'commercial', Ce: 1, Cp: 2300, R: 0.99, hpd: 6, dpy: 200, yrs: 1, grade: 1, HBP: 363, HBG: 363, SFd: 1 },

    figures: [
      { id: 't13-1', ref: 'Table 13-1', title: 'Standard tooth systems for spur gears (addendum, dedendum)', src: 'figures/shigley/table13-1.png', page: 722, note: 'Full-depth 20° is the course default: a = 1/P, b = 1.25/P.' },
      { id: 't13-2', ref: 'Table 13-2', title: 'Standard diametral pitches and modules (cutters available)', src: 'figures/shigley/table13-2.png', page: 722, note: 'Pick P from the coarse list for power gearing. Fine pitch = P ≥ 20.' },
      { id: 'm9-11', ref: 'Figure 9-11', book: 'mott', title: 'Trial diametral pitch from design power & pinion speed (Mott)', src: 'figures/mott/fig9-11.png', page: 394, note: 'Shigley has no equivalent chart; the course uses Mott Fig. 9-11 to pick a trial P_d from P_des = K_o P and n_P. Round to the nearest standard pitch (smaller P_d = bigger teeth = stronger).' },
      { id: 'f13-29', ref: 'Figure 13-29', title: 'Resolution of gear forces (tangential & radial components)', src: 'figures/shigley/fig13-29.png', page: 732, note: 'W_t drives the torque; W_r = W_t tan φ separates the gears and loads the bearings.' },
      { id: 'f13-23', ref: 'Figure 13-23', title: 'Gear train — train value e (Eq. 13-30)', src: 'figures/shigley/fig13-23.png', page: 725, note: 'e = ± (product of driving tooth numbers)/(product of driven); n_L = e n_F. Idlers cancel.' },
      { id: 'ko', ref: 'Figure 14-17', title: 'Table of overload factors K_o (bottom of road map)', src: 'figures/shigley/fig14-17-ko.png', page: 793, note: 'Rows = power source, columns = driven machine. Shigley has only three driven-machine columns (uniform / moderate / heavy shock); Mott Table 9-1 is more conservative and has four.' },
      { id: 'mko', ref: 'Table 9-1', book: 'mott', title: 'Suggested overload factors K_o (Mott — more conservative)', src: 'figures/mott/table9-1.png', page: 395 },
      { id: 'av', ref: 'Table 9-5', book: 'mott', title: 'Recommended AGMA quality numbers A_v (Mott)', src: 'figures/mott/table9-5.png', page: 399, note: 'Shigley uses Q_v (old AGMA 2000). A_v + Q_v = 17, e.g. A_v = 11 ≈ Q_v = 6, A_v = 10 ≈ Q_v = 7.' },
      { id: 'f14-9', ref: 'Figure 14-9', title: 'Dynamic factor K_v vs pitch-line velocity (curves of Q_v)', src: 'figures/shigley/fig14-9.png', page: 785, note: 'Curves are Eq. 14-27; the end of each curve is the maximum allowed velocity, Eq. 14-29.' },
      { id: 'eq14-27', ref: 'Equations 14-27 to 14-29', title: 'K_v curve-fit: A, B from Q_v; (V_t)_max', src: 'figures/shigley/eq14-27-29.png', page: 784 },
      { id: 't14-2', ref: 'Table 14-2', title: 'Lewis form factor Y (for the optional size-factor equation)', src: 'figures/shigley/table14-2.png', page: 765, note: 'Only needed if you use K_s = 1.192 (F√Y / P)^0.0535 (Eq. (a), Sec. 14-10). Otherwise K_s = 1.' },
      { id: 'f14-6', ref: 'Figure 14-6', title: 'Spur-gear bending geometry factor J (20°, full depth)', src: 'figures/shigley/fig14-6.png', page: 780, note: 'Enter on the x-axis with the teeth of the gear you want J for; pick the curve of the MATING gear\'s tooth count (load at HPSTC). Do this twice: J_P (x = N_P, curve N_G) and J_G (x = N_G, curve N_P).' },
      { id: 'f14-10', ref: 'Figure 14-10', title: 'Definition of S and S₁ for C_pm (straddle vs offset pinion)', src: 'figures/shigley/fig14-10.png', page: 787 },
      { id: 'eq14-30', ref: 'Equations 14-30 to 14-35', title: 'Load-distribution factor K_m = 1 + C_mc(C_pf C_pm + C_ma C_e)', src: 'figures/shigley/eq14-30-35.png', page: 787 },
      { id: 't14-9', ref: 'Table 14-9', title: 'Constants A, B, C for C_ma = A + BF + CF² (Eq. 14-34)', src: 'figures/shigley/table14-9.png', page: 787, note: 'Course default: commercial, enclosed units.' },
      { id: 'f14-11', ref: 'Figure 14-11', title: 'Mesh alignment factor C_ma vs face width', src: 'figures/shigley/fig14-11.png', page: 788, note: 'Curve 2 (commercial enclosed) unless told otherwise.' },
      { id: 'f14-16', ref: 'Figure 14-16', title: 'Rim-thickness factor K_B vs backup ratio m_B = t_R/h_t', src: 'figures/shigley/fig14-16.png', page: 791, note: 'Solid gear blank → m_B ≥ 1.2 → K_B = 1.' },
      { id: 't14-8', ref: 'Table 14-8', title: 'Elastic coefficient C_p, √psi', src: 'figures/shigley/table14-8.png', page: 783, note: 'Steel on steel: 2300 √psi.' },
      { id: 'f14-2', ref: 'Figure 14-2', title: 'Gear bending strength S_t vs Brinell hardness (through-hardened steel)', src: 'figures/shigley/fig14-2.png', page: 773, note: 'Grade 1: S_t = 77.3 H_B + 12 800 psi. Grade 2: S_t = 102 H_B + 16 400 psi.' },
      { id: 't14-3', ref: 'Table 14-3', title: 'Bending strength S_t for steel gears (case-hardened values)', src: 'figures/shigley/table14-3.png', page: 775, note: 'Use when the material is flame/induction hardened, carburized or nitrided — type S_t directly in the material check.' },
      { id: 't14-4', ref: 'Table 14-4', title: 'Bending strength S_t for iron and bronze gears', src: 'figures/shigley/table14-4.png', page: 776 },
      { id: 'f14-3', ref: 'Figure 14-3', title: 'S_t for nitrided through-hardened steels', src: 'figures/shigley/fig14-3.png', page: 774 },
      { id: 'f14-4', ref: 'Figure 14-4', title: 'S_t for nitriding steels (Nitralloy, 2.5% Cr)', src: 'figures/shigley/fig14-4.png', page: 774 },
      { id: 'f14-5', ref: 'Figure 14-5', title: 'Gear contact strength S_c vs Brinell hardness (through-hardened steel)', src: 'figures/shigley/fig14-5.png', page: 776, note: 'Grade 1: S_c = 322 H_B + 29 100 psi. Grade 2: S_c = 349 H_B + 34 300 psi.' },
      { id: 't14-6', ref: 'Table 14-6', title: 'Contact strength S_c for steel gears (case-hardened values)', src: 'figures/shigley/table14-6.png', page: 777 },
      { id: 't14-7', ref: 'Table 14-7', title: 'Contact strength S_c for iron and bronze gears', src: 'figures/shigley/table14-7.png', page: 778 },
      { id: 'f14-14', ref: 'Figure 14-14', title: 'Bending stress-cycle factor Y_N', src: 'figures/shigley/fig14-14.png', page: 790, note: 'Course: use the upper line Y_N = 1.3558 N^-0.0178 beyond 10⁷ cycles for normal commercial gears.' },
      { id: 'f14-15', ref: 'Figure 14-15', title: 'Pitting stress-cycle factor Z_N', src: 'figures/shigley/fig14-15.png', page: 790, note: 'Upper line Z_N = 1.4488 N^-0.023 beyond 10⁷ cycles.' },
      { id: 't14-10', ref: 'Table 14-10', title: 'Reliability factor K_R', src: 'figures/shigley/table14-10.png', page: 791, note: '99 % → K_R = 1.00 (course default). Eq. 14-38 for other values.' },
      { id: 'f14-12', ref: 'Figure 14-12', title: 'Hardness-ratio factor C_H (through-hardened, gear only)', src: 'figures/shigley/fig14-12.png', page: 789, note: 'C_H = 1 for the pinion. For the gear, Eq. 14-36 with H_BP/H_BG. If H_BP/H_BG < 1.2, C_H = 1.' },
      { id: 'f14-13', ref: 'Figure 14-13', title: 'Hardness-ratio factor C_H (surface-hardened pinion)', src: 'figures/shigley/fig14-13.png', page: 789 },
      { id: 'f14-17', ref: 'Figure 14-17', title: 'Road map — spur gear BENDING (Eqs. 14-15, 14-17, 14-41)', src: 'figures/shigley/fig14-17.png', page: 793 },
      { id: 'f14-18', ref: 'Figure 14-18', title: 'Road map — spur gear WEAR (Eqs. 14-16, 14-18, 14-42)', src: 'figures/shigley/fig14-18.png', page: 794 },
      { id: 'mlife', ref: 'Table 9-12', book: 'mott', title: 'Recommended design life (hours) — Mott', src: 'figures/mott/table9-12.png', page: 411, note: 'Shigley gives no life table; general industrial machines 20 000–30 000 h. Course default when nothing is given: 10⁷ cycles.' },
      { id: 'mf9-17', ref: 'Figure 9-17', book: 'mott', title: 'Pitting geometry factor I (Mott) — accepted alternative to Eq. 14-23', src: 'figures/mott/fig9-17.png', page: 405, note: 'Course: "slightly different but easier". Midterm gives both: I = 0.096 (Mott) vs 0.117 (Eq. 14-23) for 17 T, m_G = 2.7.' },
      { id: 'mt9-8', ref: 'Table 9-8', book: 'mott', title: 'Gear materials: through-hardened and carburized alloys (Mott)', src: 'figures/mott/table9-8.png', page: 406, note: 'Course material-selection step: pick an alloy + heat treatment whose HB exceeds the required value and quote HB and % elongation from Appendix 3.' },
      { id: 'mapp3a', ref: 'Appendix 3', book: 'mott', title: 'Steel properties: s_u, s_y, % elongation, HB (1020 … 4150)', src: 'figures/mott/appendix3a.png', page: 804, note: 'e.g. 4140 annealed HB 197, 4140 OQT1300 HB 235, 4140 OQT1000 HB 341.' },
      { id: 'mapp3b', ref: 'Appendix 3 (cont.)', book: 'mott', title: 'Steel properties (4340 … 9255)', src: 'figures/mott/appendix3b.png', page: 805, note: 'e.g. 4340 OQT1000 HB 363 (16 % el.), 4340 OQT700 HB 461. HB ≈ 2 × S_u (ksi).' },
      // ---- course-only slides (v2/COURSE_CONVENTIONS.md §16) ----
      { id: 'cko', ref: 'Gear Stress s12', book: 'course', title: 'Overload factor K_o — Shigley table and Mott Table 9-1 side by side', src: 'figures/course/ko_shigley_vs_mott.png', note: 'Either is accepted; Mott is "more conservative". Tutorials: K_o = 1 (uniform). Midterm: K_o = 1.25 (uniform source, light shock).' },
      { id: 'ckv', ref: 'Gear Stress s14', book: 'course', title: 'K_v analytical method and Mott Table 9-4: Q_v ↔ A_v mapping', src: 'figures/course/gear_kv_q_av_table.png', note: 'Q5 = A12, Q6 = A11, Q7 = A10, Q8 = A9, Q9 = A8, Q10 = A7, Q11 = A6 (A_v + Q_v = 17). Course prefers the equation: "difficult to read the graph accurately".' },
      { id: 'cks', ref: 'Gear Stress s15', book: 'course', title: 'Size factor K_s: "Typically K_s = 1" or the Lewis-Y formula / Mott Table 9-2', src: 'figures/course/gear_ks_course.png', note: 'Instructor: "I normally will suggest we default to 1.0"; the tutorial keeps K_s = 1.088 from the formula — both accepted.' },
      { id: 'ckm', ref: 'Gear Stress s19', book: 'course', title: 'K_m (Shigley form) with the course annotations: C_mc = 1, C_e = 1', src: 'figures/course/gear_km_shigley_annotated.png' },
      { id: 'ccma', ref: 'Gear Stress s20', book: 'course', title: 'C_pm and C_ma — "default to curve 2 (commercial enclosed gear units)"', src: 'figures/course/gear_cma_curve2.png' },
      { id: 'cyn', ref: 'Gear Stress s37', book: 'course', title: 'Y_N — "use this line for normal commercial gears" (1.3558 N^-0.0178)', src: 'figures/course/gear_yn_course_line.png', note: 'The 1.6831 N^-0.0323 line is for high-precision applications only.' },
      { id: 'czn', ref: 'Gear Stress s44', book: 'course', title: 'Z_N — normal commercial gears line (1.4488 N^-0.023)', src: 'figures/course/gear_zn_course_line.png' },
      { id: 'cproc', ref: 'Gear Stress s47', book: 'course', title: 'Gear stress analysis procedure flow chart', src: 'figures/course/gear_stress_procedure.png', note: 'Design parameters → loads → factors → working stresses → allowable stresses → S_F, S_H > 1 (pinion and gear).' },
      { id: 'cteeth', ref: 'Helical/Bevel s33', book: 'course', title: 'Standard gear teeth proportions (20° FD / 20° stub / 25° FD) and Lewis Y table', src: 'figures/course/standard_gear_teeth_table.png', note: 'a = 1/P, b = 1.25/P, c = 0.25/P, whole depth 2.25/P, t = 1.571/P, face width 9/P < F < 13/P.' },
    ],

    sections: [
      // ================= INPUTS =================
      { title: 'Inputs & design decisions', steps: [
        { id: 'in', title: 'Power, speeds and overload', fig: ['cko', 'ko', 'mko', 'cproc'],
          text: 'Enter nameplate power and pinion speed. Choose the shock class of the power source and the driven machine; the overload factor K_o is read from the K_o table on the road map (Fig. 14-17) — the course shows it side by side with Mott Table 9-1 and accepts either (tutorials use K_o = 1 for uniform/uniform; the midterm gave K_o = 1.25). Design power P_des = K_o P is what the Mott chart (Fig. 9-11) uses to pick a pitch. Units: US customary throughout (hp, lbf, in, ft/min, rpm, psi).',
          formula: 'P_{des} = K_o\\,P \\qquad VR = \\frac{n_P}{n_G}',
          vars: [
            { id: 'P', symbol: 'H', label: 'Transmitted power', unit: 'hp', kind: 'input' },
            { id: 'nP', symbol: 'n_P', label: 'Pinion (input) speed', unit: 'rpm', kind: 'input' },
            { id: 'nGd', symbol: 'n_{G,des}', label: 'Desired gear (output) speed', unit: 'rpm', kind: 'input', hint: 'middle of the allowed range if a range is given; leave blank if N_G is given' },
            { id: 'src', label: 'Power source', kind: 'choice', type: 'text', options: [{ label: 'Uniform (electric motor, turbine)', value: 'uniform' }, { label: 'Light shock (multi-cyl. engine)', value: 'light' }, { label: 'Medium shock (single-cyl. engine)', value: 'medium' }], default: 'uniform' },
            { id: 'drv', label: 'Driven machine', kind: 'choice', type: 'text', options: [{ label: 'Uniform', value: 'uniform' }, { label: 'Moderate shock', value: 'moderate' }, { label: 'Heavy shock', value: 'heavy' }], default: 'uniform' },
            { id: 'Ko', symbol: 'K_o', label: 'Overload factor', kind: 'lookup', fig: 'cko', hint: 'auto from the two selects (Shigley table). Mott Table 9-1 (more conservative) is also accepted — type it to override.',
              auto: v => (KO[v.src] && KO[v.src][v.drv]) || undefined,
              check: v => (v.Ko !== undefined && (v.Ko < 1 || v.Ko > 3)) ? 'K_o is normally 1.0–2.75' : null },
            { id: 'Pdes', symbol: 'P_{des}', label: 'Design power', unit: 'hp', kind: 'calc', compute: v => has(v, 'P', 'Ko') ? v.P * v.Ko : undefined,
              work: v => has(v, 'P', 'Ko') ? '\\(P_{des} = ' + f(v.Ko) + ' \\times ' + f(v.P) + ' = ' + f(v.P * v.Ko) + '\\ \\mathrm{hp}\\)' : null },
            { id: 'VRd', symbol: 'VR_{des}', label: 'Desired velocity ratio', kind: 'calc', compute: v => has(v, 'nP', 'nGd') && v.nGd > 0 ? v.nP / v.nGd : undefined },
          ] },
        { id: 'tooth', title: 'Tooth system, pitch and tooth numbers', fig: ['t13-1', 'cteeth', 't13-2', 'm9-11'],
          text: 'Pressure angle 20° full depth unless stated (course standard-teeth table: a = 1/P, b = 1.25/P, c = 0.25/P). Read a trial diametral pitch from Mott Fig. 9-11 with P_des and n_P (round to the smaller standard P_d from Table 13-2 — bigger teeth). Choose N_P ≥ 17 (no interference at 20°, Eq. 13-11 / Gear Kinematics s26; Fizz: 17–20). N_G = N_P·VR rounded to an integer (midterm: 17 × 2.69 = 45.8 → 46); the actual ratio and output speed follow.',
          formula: 'N_G = N_P \\cdot VR \\quad\\Rightarrow\\quad m_G = \\frac{N_G}{N_P}, \\qquad n_G = n_P\\frac{N_P}{N_G}',
          vars: [
            { id: 'phi', symbol: '\\phi', label: 'Pressure angle', unit: '°', kind: 'choice', options: [{ label: '20° full depth', value: 20 }, { label: '25° full depth', value: 25 }, { label: '14.5° (obsolete)', value: 14.5 }], default: 20 },
            { id: 'Pd', symbol: 'P_d', label: 'Diametral pitch', unit: 'teeth/in', kind: 'lookup', fig: 'm9-11', hint: 'from Mott Fig. 9-11 (or given). Standard values Table 13-2. Module given? P_d = 25.4/m',
              check: v => v.Pd !== undefined && [1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 32, 40, 48, 64, 72, 80, 96, 120].indexOf(v.Pd) < 0 ? 'not a standard pitch (Table 13-2 / Mott 8-3)' : null },
            { id: 'NP', symbol: 'N_P', label: 'Pinion teeth', kind: 'input', hint: 'typically 17–20', check: v => v.NP !== undefined && v.NP < 17 && v.phi === 20 ? 'N_P < 17 → interference risk at 20° (Eq. 13-11)' : (v.NP !== undefined && v.NP !== Math.round(v.NP) ? 'must be an integer' : null) },
            { id: 'NG', symbol: 'N_G', label: 'Gear teeth', kind: 'input', hint: 'auto = round(N_P·VR_des); type the given value if specified',
              auto: v => has(v, 'NP', 'VRd') ? Math.round(v.NP * v.VRd) : undefined,
              check: v => v.NG !== undefined && v.NG !== Math.round(v.NG) ? 'must be an integer' : null },
            { id: 'mG', symbol: 'm_G', label: 'Actual gear ratio N_G/N_P', kind: 'calc', eq: '14-22', compute: v => has(v, 'NP', 'NG') ? v.NG / v.NP : undefined },
            { id: 'nG', symbol: 'n_G', label: 'Actual gear speed', unit: 'rpm', kind: 'calc', compute: v => has(v, 'nP', 'NP', 'NG') ? v.nP * v.NP / v.NG : undefined,
              work: v => has(v, 'nP', 'NP', 'NG') ? '\\(n_G = ' + f(v.nP) + '\\times' + f(v.NP) + '/' + f(v.NG) + ' = ' + f(v.nP * v.NP / v.NG) + '\\ \\mathrm{rpm}\\)' : null },
          ],
          after: v => has(v, 'nG', 'nGd') ? (Math.abs(v.nG - v.nGd) / v.nGd < 0.05 ? okbad(true, 'n_G is within 5 % of the target (' + f(v.nGd) + ' rpm). Check it lies inside the range given in the problem; otherwise try another N_P.') : okbad(false, 'n_G = ' + f(v.nG) + ' rpm differs from target ' + f(v.nGd) + ' rpm by ' + f(100 * Math.abs(v.nG - v.nGd) / v.nGd, 3) + ' % — check the allowed range, else change N_P.')) : '' },
        { id: 'fw', title: 'Face width', fig: ['cteeth', 't13-2'],
          text: 'Course rules (Gear Stress s22, s49–51): Shigley road map 3/P ≤ F ≤ 5π/P with an initial median 4π/P ≈ 12.6/P; Mott 8/P_d < F < 12/P_d; the standard-teeth table says 9/P < F < 13/P. The auto value is the Shigley median 4π/P — round to a convenient size. Also keep 0.5 < F/d_P < 2 (Shigley K_m procedure requires F/d_P ≤ 2).',
          formula: 'F_{nom} = \\frac{4\\pi}{P_d} \\approx \\frac{12}{P_d}, \\qquad \\frac{8}{P_d} < F < \\frac{12}{P_d}\\ (\\text{Mott}),\\quad \\frac{3}{P_d} \\le F \\le \\frac{5\\pi}{P_d}\\ (\\text{Shigley})',
          vars: [
            { id: 'F', symbol: 'F', label: 'Face width', unit: 'in', kind: 'input', hint: 'auto = 4π/P_d (round to a convenient size)', auto: v => has(v, 'Pd') ? 4 * Math.PI / v.Pd : undefined,
              check: v => has(v, 'F', 'Pd') && (v.F < 3 / v.Pd || v.F > 5 * Math.PI / v.Pd) ? 'outside Shigley 3/P_d … 5π/P_d = ' + f(3 / v.Pd, 3) + ' … ' + f(5 * Math.PI / v.Pd, 3) + ' in' : (has(v, 'F', 'Pd') && (v.F < 8 / v.Pd || v.F > 12 / v.Pd) ? 'outside the Mott range 8/P_d … 12/P_d = ' + f(8 / v.Pd, 3) + ' … ' + f(12 / v.Pd, 3) + ' in (allowed by Shigley 3/P … 5π/P)' : null) },
            { id: 'FdP', symbol: 'F/d_P', label: 'Face width to pinion diameter ratio', kind: 'calc', digits: 3, compute: v => has(v, 'F', 'dP') ? v.F / v.dP : undefined, check: v => v.FdP !== undefined && (v.FdP > 2 || v.FdP < 0.5) ? 'F/d_P should be 0.5–2 (K_m procedure valid for F/d_P ≤ 2)' : null },
          ] },
      ] },

      // ================= GEOMETRY =================
      { title: 'Tooth geometry (Mech-guide "spec question")', text: 'Eqs. 13-1 to 13-6 and Table 13-1. All lengths in inches. Coarse pitch P_d < 20 uses b = 1.25/P_d, c = 0.25/P_d; fine pitch P_d ≥ 20 uses b = 1.20/P_d + 0.002, c = 0.20/P_d + 0.002 (Mott Table 8-1).', steps: [
        { id: 'geo1', title: 'Pitch diameters, centre distance, circular pitch, module', eq: '13-1 … 13-3', fig: ['t13-1'],
          formula: 'd_P = \\frac{N_P}{P_d},\\quad d_G = \\frac{N_G}{P_d},\\quad C = \\frac{N_P+N_G}{2P_d},\\quad p = \\frac{\\pi}{P_d},\\quad m = \\frac{25.4}{P_d}',
          vars: [
            { id: 'dP', symbol: 'd_P', label: 'Pinion pitch diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'NP', 'Pd') ? v.NP / v.Pd : undefined, work: v => has(v, 'NP', 'Pd') ? '\\(d_P = ' + f(v.NP) + '/' + f(v.Pd) + ' = ' + f(v.NP / v.Pd) + '\\ \\mathrm{in}\\)' : null },
            { id: 'dG', symbol: 'd_G', label: 'Gear pitch diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'NG', 'Pd') ? v.NG / v.Pd : undefined, work: v => has(v, 'NG', 'Pd') ? '\\(d_G = ' + f(v.NG) + '/' + f(v.Pd) + ' = ' + f(v.NG / v.Pd) + '\\ \\mathrm{in}\\)' : null },
            { id: 'C', symbol: 'C', label: 'Centre distance', unit: 'in', kind: 'calc', compute: v => has(v, 'dP', 'dG') ? (v.dP + v.dG) / 2 : undefined, work: v => has(v, 'dP', 'dG') ? '\\(C = (' + f(v.dP) + ' + ' + f(v.dG) + ')/2 = ' + f((v.dP + v.dG) / 2) + '\\ \\mathrm{in}\\)' : null },
            { id: 'p', symbol: 'p', label: 'Circular pitch', unit: 'in', kind: 'calc', compute: v => has(v, 'Pd') ? Math.PI / v.Pd : undefined },
            { id: 'm', symbol: 'm', label: 'Module (metric equivalent)', unit: 'mm', kind: 'calc', compute: v => has(v, 'Pd') ? 25.4 / v.Pd : undefined },
          ] },
        { id: 'geo2', title: 'Tooth proportions (full-depth system)', fig: ['t13-1'],
          formula: 'a = \\frac{1}{P_d},\\quad b = \\frac{1.25}{P_d}\\ (P_d<20),\\quad c = b - a,\\quad h_t = a+b,\\quad h_k = 2a,\\quad t = \\frac{p}{2}',
          vars: [
            { id: 'a', symbol: 'a', label: 'Addendum', unit: 'in', kind: 'calc', compute: v => has(v, 'Pd') ? 1 / v.Pd : undefined },
            { id: 'b', symbol: 'b', label: 'Dedendum', unit: 'in', kind: 'calc', compute: v => has(v, 'Pd') ? (v.Pd < 20 ? 1.25 / v.Pd : 1.2 / v.Pd + 0.002) : undefined, work: v => has(v, 'Pd') ? (v.Pd < 20 ? '\\(b = 1.25/' + f(v.Pd) + ' = ' + f(1.25 / v.Pd) + '\\ \\mathrm{in}\\) (coarse pitch)' : '\\(b = 1.20/' + f(v.Pd) + ' + 0.002 = ' + f(1.2 / v.Pd + 0.002) + '\\ \\mathrm{in}\\) (fine pitch)') : null },
            { id: 'c', symbol: 'c', label: 'Clearance', unit: 'in', kind: 'calc', compute: v => has(v, 'Pd') ? (v.Pd < 20 ? 0.25 / v.Pd : 0.2 / v.Pd + 0.002) : undefined },
            { id: 'ht', symbol: 'h_t', label: 'Whole depth', unit: 'in', kind: 'calc', compute: v => has(v, 'a', 'b') ? v.a + v.b : undefined },
            { id: 'hk', symbol: 'h_k', label: 'Working depth', unit: 'in', kind: 'calc', compute: v => has(v, 'a') ? 2 * v.a : undefined },
            { id: 't', symbol: 't', label: 'Tooth thickness', unit: 'in', kind: 'calc', compute: v => has(v, 'p') ? v.p / 2 : undefined },
          ] },
        { id: 'geo3', title: 'Outside, root and base circle diameters; contact ratio', eq: '13-6, 13-7',
          formula: 'd_o = \\frac{N+2}{P_d},\\quad d_R = d - 2b,\\quad d_b = d\\cos\\phi,\\qquad m_c = \\frac{\\sqrt{r_{oP}^2 - r_{bP}^2} + \\sqrt{r_{oG}^2 - r_{bG}^2} - C\\sin\\phi}{p\\cos\\phi}',
          vars: [
            { id: 'doP', symbol: 'd_{oP}', label: 'Pinion outside diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'NP', 'Pd') ? (v.NP + 2) / v.Pd : undefined },
            { id: 'doG', symbol: 'd_{oG}', label: 'Gear outside diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'NG', 'Pd') ? (v.NG + 2) / v.Pd : undefined },
            { id: 'dRP', symbol: 'd_{RP}', label: 'Pinion root diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'dP', 'b') ? v.dP - 2 * v.b : undefined },
            { id: 'dRG', symbol: 'd_{RG}', label: 'Gear root diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'dG', 'b') ? v.dG - 2 * v.b : undefined },
            { id: 'dbP', symbol: 'd_{bP}', label: 'Pinion base circle diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'dP', 'phi') ? v.dP * cosd(v.phi) : undefined },
            { id: 'dbG', symbol: 'd_{bG}', label: 'Gear base circle diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'dG', 'phi') ? v.dG * cosd(v.phi) : undefined },
            { id: 'mc', symbol: 'm_c', label: 'Contact ratio', kind: 'calc', digits: 3, compute: v => {
                if (!has(v, 'doP', 'doG', 'dbP', 'dbG', 'C', 'p', 'phi')) return undefined;
                const z = Math.sqrt(Math.max(0, (v.doP / 2) ** 2 - (v.dbP / 2) ** 2)) + Math.sqrt(Math.max(0, (v.doG / 2) ** 2 - (v.dbG / 2) ** 2)) - v.C * sind(v.phi);
                return z / (v.p * cosd(v.phi)); },
              check: v => v.mc !== undefined && v.mc < 1.2 ? 'contact ratio should be ≥ 1.2 (typically ≈1.5)' : null },
          ] },
      ] },

      // ================= FORCES =================
      { title: 'Forces and torque', steps: [
        { id: 'force', title: 'Pitch-line velocity, transmitted load, radial & normal force, torque', eq: '13-34, 13-35', fig: ['f13-29'],
          formula: 'V = \\frac{\\pi d_P n_P}{12},\\quad W_t = \\frac{33\\,000\\,H}{V},\\quad W_r = W_t\\tan\\phi,\\quad W = \\frac{W_t}{\\cos\\phi},\\quad T = \\frac{W_t d}{2} = \\frac{63\\,025\\,H}{n}',
          text: 'Use the nameplate power H (not P_des) for W_t — K_o enters the stress equations separately. W_t is the same on pinion and gear; torques differ by m_G.',
          vars: [
            { id: 'V', symbol: 'V', label: 'Pitch-line velocity', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'dP', 'nP') ? Math.PI * v.dP * v.nP / 12 : undefined, work: v => has(v, 'dP', 'nP') ? '\\(V = \\pi(' + f(v.dP) + ')(' + f(v.nP) + ')/12 = ' + f(Math.PI * v.dP * v.nP / 12) + '\\ \\mathrm{ft/min}\\)' : null },
            { id: 'Wt', symbol: 'W_t', label: 'Transmitted (tangential) load', unit: 'lbf', kind: 'calc', compute: v => has(v, 'P', 'V') && v.V > 0 ? 33000 * v.P / v.V : undefined, work: v => has(v, 'P', 'V') && v.V > 0 ? '\\(W_t = 33\\,000(' + f(v.P) + ')/' + f(v.V) + ' = ' + f(33000 * v.P / v.V) + '\\ \\mathrm{lbf}\\)' : null },
            { id: 'Wr', symbol: 'W_r', label: 'Radial (separating) force', unit: 'lbf', kind: 'calc', compute: v => has(v, 'Wt', 'phi') ? v.Wt * tand(v.phi) : undefined },
            { id: 'Wn', symbol: 'W', label: 'Normal force (along pressure line)', unit: 'lbf', kind: 'calc', compute: v => has(v, 'Wt', 'phi') ? v.Wt / cosd(v.phi) : undefined },
            { id: 'TP', symbol: 'T_P', label: 'Pinion torque', unit: 'lbf·in', kind: 'calc', compute: v => has(v, 'Wt', 'dP') ? v.Wt * v.dP / 2 : undefined },
            { id: 'TG', symbol: 'T_G', label: 'Gear torque', unit: 'lbf·in', kind: 'calc', compute: v => has(v, 'Wt', 'dG') ? v.Wt * v.dG / 2 : undefined },
          ] },
      ] },

      // ================= AGMA FACTORS =================
      { title: 'AGMA factors for the stress equations', text: 'Road maps: Fig. 14-17 (bending) and Fig. 14-18 (wear). Each factor below has an <i>auto</i> curve-fit; type the chart reading to override.', steps: [
        { id: 'kv', title: 'Quality number and dynamic factor K_v', eq: '14-27 … 14-29', fig: ['ckv', 'f14-9', 'eq14-27', 'av'],
          formula: 'K_v = \\left(\\frac{A+\\sqrt{V}}{A}\\right)^B,\\quad B = 0.25(12-Q_v)^{2/3},\\quad A = 50+56(1-B),\\quad (V_t)_{max} = [A+(Q_v-3)]^2',
          text: 'Course: use the equation (Eq. 14-27; "difficult to read the graph accurately"). Shigley\'s AGMA Q_v numbers are "no longer in use" — Mott Table 9-4 maps them to A_v (Q5 = A12 … Q11 = A6, i.e. A_v + Q_v = 17); a problem stating A_v = 8 means Q_v = 9 (midterm). Q_v 3–7 commercial, 8–12 precision; when nothing is stated Q_v = 6 … 7.',
          vars: [
            { id: 'Qv', symbol: 'Q_v', label: 'AGMA quality number (Mott A_v in brackets)', kind: 'choice', fig: 'ckv', options: [5, 6, 7, 8, 9, 10, 11].map(q => ({ label: 'Q_v = ' + q + '  (A_v = ' + (17 - q) + ')', value: q })), default: 6 },
            { id: 'Bv', symbol: 'B', label: 'Exponent B', kind: 'calc', digits: 4, compute: v => has(v, 'Qv') ? 0.25 * Math.pow(12 - v.Qv, 2 / 3) : undefined },
            { id: 'Av', symbol: 'A', label: 'Constant A', kind: 'calc', digits: 4, compute: v => has(v, 'Bv') ? 50 + 56 * (1 - v.Bv) : undefined },
            { id: 'Kv', symbol: 'K_v', label: 'Dynamic factor', kind: 'lookup', fig: 'f14-9', hint: 'auto = Eq. 14-27; or read Fig. 14-9', auto: v => has(v, 'Av', 'Bv', 'V') ? Math.pow((v.Av + Math.sqrt(v.V)) / v.Av, v.Bv) : undefined,
              work: v => has(v, 'Av', 'Bv', 'V') ? '\\(K_v = \\left(\\frac{' + f(v.Av) + ' + \\sqrt{' + f(v.V) + '}}{' + f(v.Av) + '}\\right)^{' + f(v.Bv) + '} = ' + f(Math.pow((v.Av + Math.sqrt(v.V)) / v.Av, v.Bv)) + '\\)' : null },
            { id: 'Vmax', symbol: '(V_t)_{max}', label: 'Max. pitch-line velocity for this Q_v', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'Av', 'Qv') ? Math.pow(v.Av + (v.Qv - 3), 2) : undefined, check: v => has(v, 'V', 'Vmax') && v.V > v.Vmax ? 'V exceeds (V_t)max — use a higher quality number' : null },
          ] },
        { id: 'ks', title: 'Size factor K_s', fig: ['cks', 't14-2'],
          text: 'Course (Gear Stress s15): "Typically K_s = 1" — the instructor\'s default, and what the midterm used (P_d > 5). The accepted alternative is Shigley Eq. (a), Sec. 14-10 with the Lewis Y of Table 14-2 (Tutorial 3 keeps K_s = 1.088 for F = 2, Y = 0.296, P = 6). Mott Table 9-2 (1.00 for P_d ≥ 5) gives the same answer as K_s = 1 for ordinary pitches. If the equation gives < 1 use 1.',
          formula: 'K_s = 1\\ \\ (\\text{course default})\\qquad\\text{or}\\qquad K_s = 1.192\\left(\\frac{F\\sqrt{Y}}{P_d}\\right)^{0.0535}\\ \\ (\\ge 1)',
          vars: [
            { id: 'ksMode', label: 'K_s rule', kind: 'choice', options: [{ label: 'K_s = 1 (course default)', value: 1 }, { label: 'Formula 1.192 (F√Y/P)^0.0535 (Shigley Ex. 14-4, Tutorial 3)', value: 2 }], default: 1 },
            { id: 'YP', symbol: 'Y_P', label: 'Lewis form factor, pinion', kind: 'lookup', fig: 't14-2', digits: 3, auto: v => has(v, 'NP') && v.NP >= 12 ? lewisY(v.NP) : undefined, hint: 'Table 14-2 (interpolated) — only used by the formula' },
            { id: 'YG', symbol: 'Y_G', label: 'Lewis form factor, gear', kind: 'lookup', fig: 't14-2', digits: 3, auto: v => has(v, 'NG') && v.NG >= 12 ? lewisY(v.NG) : undefined },
            { id: 'KsP', symbol: '(K_s)_P', label: 'Size factor, pinion', kind: 'lookup', fig: 'cks', hint: 'auto = 1 or the formula, per the rule above', auto: v => v.ksMode === 2 ? (has(v, 'F', 'YP', 'Pd') ? Math.max(1, 1.192 * Math.pow(v.F * Math.sqrt(v.YP) / v.Pd, 0.0535)) : undefined) : 1,
              work: v => v.ksMode === 2 && has(v, 'F', 'YP', 'Pd') ? '\\((K_s)_P = 1.192\\left(\\frac{' + f(v.F) + '\\sqrt{' + f(v.YP, 3) + '}}{' + f(v.Pd) + '}\\right)^{0.0535} = ' + f(Math.max(1, 1.192 * Math.pow(v.F * Math.sqrt(v.YP) / v.Pd, 0.0535))) + '\\)' : null },
            { id: 'KsG', symbol: '(K_s)_G', label: 'Size factor, gear', kind: 'lookup', fig: 'cks', auto: v => v.ksMode === 2 ? (has(v, 'F', 'YG', 'Pd') ? Math.max(1, 1.192 * Math.pow(v.F * Math.sqrt(v.YG) / v.Pd, 0.0535)) : undefined) : 1 },
          ] },
        { id: 'km', title: 'Load-distribution factor K_m', eq: '14-30 … 14-35', fig: ['ckm', 'ccma', 'eq14-30', 'f14-10', 'f14-11', 't14-9'],
          formula: 'K_m = 1 + C_{mc}\\,(C_{pf}C_{pm} + C_{ma}C_e)',
          text: 'Course defaults (Gear Stress s16–20): C_mc = 1 ("normally uncrowned"); C_pf from Eq. 14-32 (use F/(10d_P) = 0.05 if smaller); C_pm = 1 (straddle-mounted pinion, S₁/S < 0.175); C_ma from curve 2 "commercial enclosed gear units" unless other information is given (Table 14-9: 0.127 + 0.0158F − 0.930×10⁻⁴F²); C_e = 1 ("normally 1.0 for commercial gears"). Mott\'s simpler K_m = 1 + C_pf + C_ma (Eq. 9-17) gives the same number (Mott\'s C_ma constant is −1.093×10⁻⁴ — negligible difference; midterm: C_pf = 0.0694, C_ma = 0.1505, K_m = 1.22).',
          vars: [
            { id: 'Cmc', symbol: 'C_{mc}', label: 'Lead correction factor', kind: 'choice', options: [{ label: '1 — uncrowned teeth (normal)', value: 1 }, { label: '0.8 — crowned teeth', value: 0.8 }], default: 1 },
            { id: 'Cpf', symbol: 'C_{pf}', label: 'Pinion proportion factor', kind: 'lookup', fig: 'eq14-30', digits: 4, hint: 'auto = Eq. 14-32',
              auto: v => { if (!has(v, 'F', 'dP')) return undefined; const r = Math.max(v.F / (10 * v.dP), 0.05); return v.F <= 1 ? r - 0.025 : v.F <= 17 ? r - 0.0375 + 0.0125 * v.F : r - 0.1109 + 0.0207 * v.F - 0.000228 * v.F * v.F; },
              work: v => has(v, 'F', 'dP') ? '\\(C_{pf} = \\frac{' + f(v.F) + '}{10(' + f(v.dP) + ')}' + (v.F <= 1 ? ' - 0.025' : v.F <= 17 ? ' - 0.0375 + 0.0125(' + f(v.F) + ')' : ' - 0.1109 + 0.0207F - 0.000228F^2') + ' = ' + f(v.Cpf, 4) + '\\)' : null },
            { id: 'Cpm', symbol: 'C_{pm}', label: 'Pinion proportion modifier', kind: 'choice', fig: 'f14-10', options: [{ label: '1 — straddle mounted, S₁/S < 0.175', value: 1 }, { label: '1.1 — S₁/S ≥ 0.175', value: 1.1 }], default: 1 },
            { id: 'cond', label: 'Gearing condition (for C_ma)', kind: 'choice', type: 'text', options: [{ label: 'Open gearing (curve 1)', value: 'open' }, { label: 'Commercial enclosed units (curve 2)', value: 'commercial' }, { label: 'Precision enclosed (curve 3)', value: 'precision' }, { label: 'Extra-precision enclosed (curve 4)', value: 'extra' }], default: 'commercial' },
            { id: 'Cma', symbol: 'C_{ma}', label: 'Mesh alignment factor', kind: 'lookup', fig: 'f14-11', digits: 4, hint: 'auto = A + BF + CF² (Table 14-9)',
              auto: v => { const k = CMA[v.cond]; return k && has(v, 'F') ? k[0] + k[1] * v.F + k[2] * v.F * v.F : undefined; },
              work: v => { const k = CMA[v.cond]; return k && has(v, 'F') ? '\\(C_{ma} = ' + k[0] + ' + ' + k[1] + '(' + f(v.F) + ') ' + (k[2] * 1e4).toFixed(3) + '\\times10^{-4}(' + f(v.F) + ')^2 = ' + f(v.Cma, 4) + '\\)' : null; } },
            { id: 'Ce', symbol: 'C_e', label: 'Mesh alignment correction', kind: 'choice', options: [{ label: '1 — all other conditions', value: 1 }, { label: '0.8 — adjusted at assembly / lapped', value: 0.8 }], default: 1 },
            { id: 'Km', symbol: 'K_m', label: 'Load-distribution factor', kind: 'calc', digits: 4, compute: v => has(v, 'Cmc', 'Cpf', 'Cpm', 'Cma', 'Ce') ? 1 + v.Cmc * (v.Cpf * v.Cpm + v.Cma * v.Ce) : undefined,
              work: v => has(v, 'Cmc', 'Cpf', 'Cpm', 'Cma', 'Ce') ? '\\(K_m = 1 + ' + f(v.Cmc) + '[' + f(v.Cpf, 4) + '(' + f(v.Cpm) + ') + ' + f(v.Cma, 4) + '(' + f(v.Ce) + ')] = ' + f(v.Km, 4) + '\\)' : null },
          ] },
        { id: 'kb', title: 'Rim-thickness factor K_B', eq: '14-39, 14-40', fig: ['f14-16'],
          formula: 'm_B = \\frac{t_R}{h_t},\\qquad K_B = 1.6\\ln\\frac{2.242}{m_B}\\ (m_B<1.2),\\quad K_B = 1\\ (m_B \\ge 1.2)',
          text: 'Course: "Normally K_B = 1.0" (solid blank, m_B ≥ 1.2). Only enter a rim thickness for a rimmed/spoked gear.',
          vars: [
            { id: 'tR', symbol: 't_R', label: 'Rim thickness below tooth (blank = solid gear)', unit: 'in', kind: 'input' },
            { id: 'mB', symbol: 'm_B', label: 'Backup ratio', kind: 'calc', digits: 3, compute: v => has(v, 'tR', 'ht') ? v.tR / v.ht : undefined },
            { id: 'KB', symbol: 'K_B', label: 'Rim-thickness factor', kind: 'lookup', fig: 'f14-16', hint: 'auto = 1 (solid) or Eq. 14-40', auto: v => v.mB === undefined ? 1 : (v.mB < 1.2 ? 1.6 * Math.log(2.242 / v.mB) : 1) },
          ] },
        { id: 'j', title: 'Bending geometry factors J_P, J_G', fig: ['f14-6'],
          text: 'Fig. 14-6 (20°, full depth, load at highest point of single-tooth contact). J_P: x = N_P on the curve for N_G mating teeth. J_G: x = N_G on the curve for N_P. The auto value is only a rough read of the mid curves — always read the chart. For 25° teeth use Mott Fig. 9-10(b).',
          vars: [
            { id: 'JP', symbol: 'J_P', label: 'Geometry factor, pinion', kind: 'lookup', fig: 'f14-6', digits: 3, hint: 'ROUGH auto estimate — read Fig. 14-6', auto: v => has(v, 'NP') && v.phi === 20 ? Jest(v.NP) : undefined },
            { id: 'JG', symbol: 'J_G', label: 'Geometry factor, gear', kind: 'lookup', fig: 'f14-6', digits: 3, hint: 'ROUGH auto estimate — read Fig. 14-6', auto: v => has(v, 'NG') && v.phi === 20 ? Jest(v.NG) : undefined },
          ] },
        { id: 'i', title: 'Pitting geometry factor I and elastic coefficient C_p', eq: '14-23, 14-13', fig: ['t14-8', 'mf9-17'],
          formula: 'I = \\frac{\\cos\\phi_t\\sin\\phi_t}{2m_N}\\,\\frac{m_G}{m_G+1}\\quad (m_N = 1 \\text{ for spur}),\\qquad C_p = \\sqrt{\\frac{1}{\\pi\\left[\\frac{1-\\nu_P^2}{E_P} + \\frac{1-\\nu_G^2}{E_G}\\right]}}',
          text: 'Two accepted routes (Gear Stress s31–32): Shigley Eq. 14-23 (auto) or a reading of Mott Fig. 9-17 ("slightly different but easier" — tutorial 0.1205 vs 0.097, midterm 0.117 vs 0.096). Type the Mott reading to use it. Steel on steel: C_p = 2300 √psi (Table 14-8 / Mott Table 9-7) — "the normal case". Surface condition factor C_f = 1 (not in Mott).',
          vars: [
            { id: 'I', symbol: 'I', label: 'Pitting geometry factor', kind: 'lookup', fig: 'mf9-17', digits: 4, hint: 'auto = Eq. 14-23; or type the Mott Fig. 9-17 reading', auto: v => has(v, 'phi', 'mG') ? cosd(v.phi) * sind(v.phi) / 2 * v.mG / (v.mG + 1) : undefined,
              work: v => has(v, 'phi', 'mG') ? '\\(I = \\frac{\\cos ' + f(v.phi) + '^\\circ \\sin ' + f(v.phi) + '^\\circ}{2}\\cdot\\frac{' + f(v.mG) + '}{' + f(v.mG) + '+1} = ' + f(cosd(v.phi) * sind(v.phi) / 2 * v.mG / (v.mG + 1), 4) + '\\)' : null },
            { id: 'Cp', symbol: 'C_p', label: 'Elastic coefficient', unit: '√psi', kind: 'lookup', fig: 't14-8', default: 2300, hint: 'Table 14-8; 2300 for steel–steel (course standard)', check: v => v.Cp !== undefined && Math.abs(v.Cp - 2300) > 1 ? 'course standard is 2300 √psi for steel on steel — only change for other materials' : null },
            { id: 'Cf', symbol: 'C_f', label: 'Surface condition factor', kind: 'input', default: 1, hint: '1 (course: no AGMA values; not in Mott)', check: v => v.Cf !== undefined && v.Cf !== 1 ? 'course assumes C_f = 1' : null },
          ] },
      ] },

      // ================= STRESS =================
      { title: 'AGMA stress numbers', steps: [
        { id: 'sb', title: 'Bending stress σ (pinion and gear)', eq: '14-15', fig: ['f14-17'],
          formula: '\\sigma = W_t K_o K_v K_s \\frac{P_d}{F}\\frac{K_m K_B}{J}',
          vars: [
            { id: 'sP', symbol: '\\sigma_P', label: 'Pinion bending stress', unit: 'psi', kind: 'calc', compute: v => has(v, 'Wt', 'Ko', 'Kv', 'KsP', 'Pd', 'F', 'Km', 'KB', 'JP') ? v.Wt * v.Ko * v.Kv * v.KsP * v.Pd / v.F * v.Km * v.KB / v.JP : undefined,
              work: v => v.sP !== undefined ? '\\(\\sigma_P = ' + f(v.Wt) + '(' + f(v.Ko) + ')(' + f(v.Kv) + ')(' + f(v.KsP) + ')\\frac{' + f(v.Pd) + '}{' + f(v.F) + '}\\frac{' + f(v.Km, 4) + '(' + f(v.KB) + ')}{' + f(v.JP, 3) + '} = ' + f(v.sP) + '\\ \\mathrm{psi}\\)' : null },
            { id: 'sG', symbol: '\\sigma_G', label: 'Gear bending stress', unit: 'psi', kind: 'calc', compute: v => has(v, 'Wt', 'Ko', 'Kv', 'KsG', 'Pd', 'F', 'Km', 'KB', 'JG') ? v.Wt * v.Ko * v.Kv * v.KsG * v.Pd / v.F * v.Km * v.KB / v.JG : undefined,
              work: v => v.sG !== undefined ? '\\(\\sigma_G = ' + f(v.Wt) + '(' + f(v.Ko) + ')(' + f(v.Kv) + ')(' + f(v.KsG) + ')\\frac{' + f(v.Pd) + '}{' + f(v.F) + '}\\frac{' + f(v.Km, 4) + '(' + f(v.KB) + ')}{' + f(v.JG, 3) + '} = ' + f(v.sG) + '\\ \\mathrm{psi}\\)' : null },
          ] },
        { id: 'sc', title: 'Contact stress σ_c', eq: '14-16', fig: ['f14-18'],
          formula: '\\sigma_c = C_p\\sqrt{W_t K_o K_v K_s \\frac{K_m}{d_P F}\\frac{C_f}{I}}',
          text: 'Always use the pinion diameter d_P. Pinion and gear see the same contact stress except for K_s (Shigley) — Mott uses one value.',
          vars: [
            { id: 'scP', symbol: '(\\sigma_c)_P', label: 'Contact stress, pinion', unit: 'psi', kind: 'calc', compute: v => has(v, 'Cp', 'Wt', 'Ko', 'Kv', 'KsP', 'Km', 'dP', 'F', 'Cf', 'I') ? v.Cp * Math.sqrt(v.Wt * v.Ko * v.Kv * v.KsP * v.Km / (v.dP * v.F) * v.Cf / v.I) : undefined,
              work: v => v.scP !== undefined ? '\\((\\sigma_c)_P = ' + f(v.Cp) + '\\sqrt{' + f(v.Wt) + '(' + f(v.Ko) + ')(' + f(v.Kv) + ')(' + f(v.KsP) + ')\\frac{' + f(v.Km, 4) + '}{' + f(v.dP) + '(' + f(v.F) + ')}\\frac{' + f(v.Cf) + '}{' + f(v.I, 4) + '}} = ' + f(v.scP) + '\\ \\mathrm{psi}\\)' : null },
            { id: 'scG', symbol: '(\\sigma_c)_G', label: 'Contact stress, gear', unit: 'psi', kind: 'calc', compute: v => has(v, 'scP', 'KsP', 'KsG') ? v.scP * Math.sqrt(v.KsG / v.KsP) : undefined },
          ] },
      ] },

      // ================= STRENGTH MODIFIERS =================
      { title: 'Life, reliability and strength modifiers', steps: [
        { id: 'life', title: 'Design life, load cycles and stress-cycle factors Y_N, Z_N', eq: '§14-13', fig: ['cyn', 'czn', 'f14-14', 'f14-15', 'mlife'],
          formula: 'N = n \\times 60 \\times \\tfrac{h}{day} \\times \\tfrac{days}{yr} \\times yr = 60\\,L\\,n\\,q,\\qquad Y_N = 1.3558N^{-0.0178},\\quad Z_N = 1.4488N^{-0.023}\\ \\ (N\\ge10^7)',
          text: 'Course (Gear Stress s37, s44; Midterm): AGMA strengths are at 10⁷ cycles — <b>leave the life blank to use 10⁷ (Y_N = Z_N = 1)</b>. Otherwise give hours/day × days/yr × years (midterm: 1750 × 60 × 6 × 200 × 1 = 1.26×10⁸) or a life in hours (Mott Table 9-12). Beyond 10⁷ use the <b>upper line for normal commercial gears</b> (Y_N = 1.3558 N^-0.0178, Z_N = 1.4488 N^-0.023); the 1.6831 N^-0.0323 line is for high-precision applications only. Tutorials also accept a graph reading (0.95 at 10⁸; Z_N 0.90 at the centre of the shaded zone). q = 1 load per revolution (2 for an idler); the gear sees N_P/m_G cycles.',
          vars: [
            { id: 'hpd', symbol: 'h/day', label: 'Hours per day (optional)', unit: 'h', kind: 'input' },
            { id: 'dpy', symbol: 'days/yr', label: 'Days per year (optional)', unit: 'd', kind: 'input' },
            { id: 'yrs', symbol: 'yr', label: 'Years of service (optional)', unit: 'yr', kind: 'input' },
            { id: 'Lh', symbol: 'L', label: 'Design life (blank = 10⁷ cycles)', unit: 'h', kind: 'lookup', fig: 'mlife', hint: 'auto = h/day × days/yr × yr; or Mott Table 9-12; blank → AGMA 10⁷ cycles', auto: v => has(v, 'hpd', 'dpy', 'yrs') ? v.hpd * v.dpy * v.yrs : undefined },
            { id: 'q', symbol: 'q', label: 'Load applications per revolution', kind: 'input', default: 1 },
            { id: 'NcP', symbol: 'N_P', label: 'Pinion load cycles', kind: 'calc', digits: 4, compute: v => has(v, 'Lh', 'nP', 'q') ? 60 * v.Lh * v.nP * v.q : 1e7, work: v => has(v, 'Lh', 'nP', 'q') ? '\\(N_P = 60(' + f(v.Lh) + ')(' + f(v.nP) + ')(' + f(v.q) + ') = ' + f(v.NcP) + '\\)' : 'no life given → AGMA reference 10⁷ cycles' },
            { id: 'NcG', symbol: 'N_G', label: 'Gear load cycles', kind: 'calc', digits: 4, compute: v => has(v, 'Lh', 'nG', 'q') ? 60 * v.Lh * v.nG * v.q : 1e7, work: v => has(v, 'Lh', 'nG', 'q') ? '\\(N_G = 60(' + f(v.Lh) + ')(' + f(v.nG) + ')(' + f(v.q) + ') = ' + f(v.NcG) + '\\)' : null },
            { id: 'YNP', symbol: '(Y_N)_P', label: 'Bending stress-cycle factor, pinion', kind: 'lookup', fig: 'cyn', digits: 4, auto: v => !has(v, 'Lh') ? 1 : has(v, 'NcP') ? YN_auto(v.NcP) : undefined, hint: 'auto = 1.3558 N^-0.0178 (N ≥ 10⁷, commercial line)',
              work: v => has(v, 'Lh', 'NcP') && v.NcP >= 1e7 ? '\\((Y_N)_P = 1.3558(' + f(v.NcP, 3) + ')^{-0.0178} = ' + f(YN_auto(v.NcP), 4) + '\\)' : null },
            { id: 'YNG', symbol: '(Y_N)_G', label: 'Bending stress-cycle factor, gear', kind: 'lookup', fig: 'cyn', digits: 4, auto: v => !has(v, 'Lh') ? 1 : has(v, 'NcG') ? YN_auto(v.NcG) : undefined },
            { id: 'ZNP', symbol: '(Z_N)_P', label: 'Pitting stress-cycle factor, pinion', kind: 'lookup', fig: 'czn', digits: 4, auto: v => !has(v, 'Lh') ? 1 : has(v, 'NcP') ? ZN_auto(v.NcP) : undefined, hint: 'auto = 1.4488 N^-0.023 (N ≥ 10⁷, commercial line)',
              work: v => has(v, 'Lh', 'NcP') && v.NcP >= 1e7 ? '\\((Z_N)_P = 1.4488(' + f(v.NcP, 3) + ')^{-0.023} = ' + f(ZN_auto(v.NcP), 4) + '\\)' : null },
            { id: 'ZNG', symbol: '(Z_N)_G', label: 'Pitting stress-cycle factor, gear', kind: 'lookup', fig: 'czn', digits: 4, auto: v => !has(v, 'Lh') ? 1 : has(v, 'NcG') ? ZN_auto(v.NcG) : undefined },
          ] },
        { id: 'rel', title: 'Reliability K_R, temperature K_T, design safety factor', eq: '14-38', fig: ['t14-10'],
          formula: 'K_R = 0.658 - 0.0759\\ln(1-R)\\ (0.5<R<0.99);\\quad K_R = 0.50 - 0.109\\ln(1-R)\\ (0.99\\le R\\le 0.9999)',
          text: 'Course defaults: 99 % reliability → K_R = 1.00 "normally" (midterm: "K_R = 1.0 for reliability = 0.99 assumed"; tutorials with R = 0.90 use 0.85). K_T = 1 for T < 250 °F — always assumed. "AGMA suggests S_F of 1 to 1.5": the course solves for the <b>minimum strength with S_F = 1</b>, then picks a material so that 1.0 ≤ S_F ≤ 1.5. The same design factor is applied to bending and wear.',
          vars: [
            { id: 'R', symbol: 'R', label: 'Reliability', kind: 'input', default: 0.99, hint: '0.99 (course default) · 0.90 · 0.999 · 0.9999' },
            { id: 'KR', symbol: 'K_R', label: 'Reliability factor', kind: 'lookup', fig: 't14-10', digits: 3, hint: 'Table 14-10: 0.99 → 1.00, 0.90 → 0.85', auto: v => { if (!has(v, 'R')) return undefined; if (KR[v.R] !== undefined) return KR[v.R]; return v.R < 0.99 ? 0.658 - 0.0759 * Math.log(1 - v.R) : 0.5 - 0.109 * Math.log(1 - v.R); } },
            { id: 'KT', symbol: 'K_T', label: 'Temperature factor', kind: 'input', default: 1, hint: '1 for T < 250 °F (120 °C)', check: v => v.KT !== undefined && v.KT !== 1 ? 'course always assumes K_T = 1 (T < 250 °F)' : null },
            { id: 'SFd', symbol: '(S_F)_d', label: 'Design factor of safety (bending & wear)', kind: 'input', default: 1, hint: '1.0 (course: solve for min strength at S_F = 1, then target 1.0–1.5)', check: v => v.SFd !== undefined && (v.SFd < 1 || v.SFd > 1.5) ? 'AGMA suggests 1.0–1.5' : null },
          ] },
      ] },

      // ================= REQUIRED STRENGTH / MATERIAL =================
      { title: 'Required strength and hardness (design)', text: 'Rearranging Eqs. 14-17 and 14-18 with σ_all = σ gives the minimum gear strengths; Figs. 14-2 and 14-5 then give the minimum Brinell hardness for a through-hardened steel of the chosen grade. The pinion normally governs; use the same material for both.', steps: [
        { id: 'req', title: 'Required bending and contact strengths', eq: '14-17, 14-18',
          formula: 'S_{t,req} = \\frac{\\sigma\\,(S_F)_d\\,K_T K_R}{Y_N},\\qquad S_{c,req} = \\frac{\\sigma_c\\,(S_H)_d\\,K_T K_R}{Z_N C_H}',
          vars: [
            { id: 'StreqP', symbol: 'S_{t,req,P}', label: 'Required bending strength, pinion', unit: 'psi', kind: 'calc', compute: v => has(v, 'sP', 'SFd', 'KT', 'KR', 'YNP') ? v.sP * v.SFd * v.KT * v.KR / v.YNP : undefined, work: v => v.StreqP !== undefined ? '\\(S_{t,req,P} = ' + f(v.sP) + '(' + f(v.SFd) + ')(' + f(v.KT) + ')(' + f(v.KR, 3) + ')/' + f(v.YNP, 4) + ' = ' + f(v.StreqP) + '\\ \\mathrm{psi}\\)' : null },
            { id: 'StreqG', symbol: 'S_{t,req,G}', label: 'Required bending strength, gear', unit: 'psi', kind: 'calc', compute: v => has(v, 'sG', 'SFd', 'KT', 'KR', 'YNG') ? v.sG * v.SFd * v.KT * v.KR / v.YNG : undefined },
            { id: 'ScreqP', symbol: 'S_{c,req,P}', label: 'Required contact strength, pinion', unit: 'psi', kind: 'calc', compute: v => has(v, 'scP', 'SFd', 'KT', 'KR', 'ZNP') ? v.scP * v.SFd * v.KT * v.KR / v.ZNP : undefined, work: v => v.ScreqP !== undefined ? '\\(S_{c,req,P} = ' + f(v.scP) + '(' + f(v.SFd) + ')(' + f(v.KT) + ')(' + f(v.KR, 3) + ')/' + f(v.ZNP, 4) + ' = ' + f(v.ScreqP) + '\\ \\mathrm{psi}\\)' : null },
            { id: 'ScreqG', symbol: 'S_{c,req,G}', label: 'Required contact strength, gear (C_H = 1)', unit: 'psi', kind: 'calc', compute: v => has(v, 'scG', 'SFd', 'KT', 'KR', 'ZNG') ? v.scG * v.SFd * v.KT * v.KR / v.ZNG : undefined },
          ] },
        { id: 'hb', title: 'Required Brinell hardness (through-hardened steel) → pick a steel', fig: ['f14-2', 'f14-5', 'mt9-8', 'mapp3a', 'mapp3b', 't14-3', 't14-6'],
          formula: 'H_{B} = \\frac{S_t - 12\\,800}{77.3}\\ (\\text{grade 1 bending}),\\qquad H_B = \\frac{S_c - 29\\,100}{322}\\ (\\text{grade 1 contact})',
          text: 'Grade 1 is the course default (Grade 2: S_t = 102 H_B + 16 400, S_c = 349 H_B + 34 300). Take the LARGEST hardness. <b>Course material step (Module 2 p27, Midterm P2 part 3):</b> choose an alloy and heat treatment from Mott Table 9-8 / Appendix 3 whose HB exceeds the requirement and quote its HB and % elongation (ductility) — e.g. 4140 annealed HB 197, 4140 OQT1300 HB 235, 4140 OQT1000 HB 341, 4340 OQT1000 HB 363 (16 % el.), 4340 OQT700 HB 461; "OQT1300" = oil-quenched &amp; tempered at 1300 °F; HB ≈ 2 × S_u (ksi). Then enter that HB below and confirm 1.0 ≤ S_F ≤ 1.5. Through-hardening is only valid up to ≈ 400 H_B — above that specify flame/induction hardening or carburizing (Tables 14-3 / 14-6).',
          vars: [
            { id: 'grade', label: 'Steel grade', kind: 'choice', options: [{ label: 'Grade 1 (course default)', value: 1 }, { label: 'Grade 2', value: 2 }], default: 1 },
            { id: 'HBbP', symbol: 'H_{B,bend,P}', label: 'Hardness for pinion bending', unit: 'HB', kind: 'calc', digits: 4, compute: v => has(v, 'StreqP', 'grade') ? Math.max(0, v.grade === 2 ? (v.StreqP - 16400) / 102 : (v.StreqP - 12800) / 77.3) : undefined, work: v => v.HBbP !== undefined ? '\\(H_B = (' + f(v.StreqP) + ' - ' + (v.grade === 2 ? '16\\,400)/102' : '12\\,800)/77.3') + ' = ' + f(v.HBbP) + '\\)' : null },
            { id: 'HBbG', symbol: 'H_{B,bend,G}', label: 'Hardness for gear bending', unit: 'HB', kind: 'calc', digits: 4, compute: v => has(v, 'StreqG', 'grade') ? Math.max(0, v.grade === 2 ? (v.StreqG - 16400) / 102 : (v.StreqG - 12800) / 77.3) : undefined },
            { id: 'HBcP', symbol: 'H_{B,cont,P}', label: 'Hardness for pinion contact', unit: 'HB', kind: 'calc', digits: 4, compute: v => has(v, 'ScreqP', 'grade') ? Math.max(0, v.grade === 2 ? (v.ScreqP - 34300) / 349 : (v.ScreqP - 29100) / 322) : undefined, work: v => v.HBcP !== undefined ? '\\(H_B = (' + f(v.ScreqP) + ' - ' + (v.grade === 2 ? '34\\,300)/349' : '29\\,100)/322') + ' = ' + f(v.HBcP) + '\\)' : null },
            { id: 'HBcG', symbol: 'H_{B,cont,G}', label: 'Hardness for gear contact', unit: 'HB', kind: 'calc', digits: 4, compute: v => has(v, 'ScreqG', 'grade') ? Math.max(0, v.grade === 2 ? (v.ScreqG - 34300) / 349 : (v.ScreqG - 29100) / 322) : undefined },
            { id: 'HBreq', symbol: 'H_{B,req}', label: 'REQUIRED hardness (max of the four)', unit: 'HB', kind: 'calc', digits: 4, compute: v => { const a = [v.HBbP, v.HBbG, v.HBcP, v.HBcG].filter(x => typeof x === 'number'); return a.length ? Math.max(...a) : undefined; } },
          ],
          after: v => v.HBreq === undefined ? '' : (v.HBreq > 400 ? okbad(false, 'Required ' + f(v.HBreq, 3) + ' HB > 400 HB: through-hardening is not adequate — specify flame/induction-hardened (Table 14-6: S_c = 170–175 kpsi) or carburized (S_c = 180 kpsi, S_t = 55 kpsi) grade-1 steel, or enlarge the gears.') : v.HBreq < 180 ? okbad(true, 'Required hardness ' + f(v.HBreq, 3) + ' HB is below the AGMA data range (180–400 HB) — any through-hardened steel ≥ 180 HB (e.g. 1045, 4140) will do; contact governs: ' + (v.HBcP >= v.HBbP ? 'yes' : 'no') + '.') : okbad(true, 'Specify a through-hardened grade-' + v.grade + ' steel with surface hardness ≥ ' + f(Math.ceil(v.HBreq), 3) + ' HB for both gears (' + (v.HBcP >= v.HBbP ? 'pitting' : 'bending') + ' governs). Pick a material from Shigley Table A-21 / Mott App. 3 with at least this HB (e.g. 4140 Q&T, 4340 Q&T).')) },
      ] },

      // ================= CHECK A MATERIAL =================
      { title: 'Check a chosen material — factors of safety', text: 'Enter the Brinell hardness of the pinion and gear you actually chose (through-hardened) — or type S_t and S_c directly from Tables 14-3/14-6 for case-hardened steels, Tables 14-4/14-7 for iron/bronze.', steps: [
        { id: 'mat', title: 'Material strengths S_t, S_c and hardness-ratio factor C_H', eq: '14-36', fig: ['f14-2', 'f14-5', 'f14-12', 't14-3', 't14-6'],
          formula: 'C_H = 1 + A\'(m_G - 1),\\quad A\' = 8.98(10^{-3})\\frac{H_{BP}}{H_{BG}} - 8.29(10^{-3})\\ \\ (1.2 \\le H_{BP}/H_{BG} \\le 1.7)',
          vars: [
            { id: 'HBP', symbol: 'H_{BP}', label: 'Pinion Brinell hardness', unit: 'HB', kind: 'input' },
            { id: 'HBG', symbol: 'H_{BG}', label: 'Gear Brinell hardness', unit: 'HB', kind: 'input', hint: 'same material → same as pinion' },
            { id: 'StP', symbol: '(S_t)_P', label: 'Pinion bending strength', unit: 'psi', kind: 'lookup', fig: 'f14-2', auto: v => has(v, 'HBP', 'grade') ? (v.grade === 2 ? 102 * v.HBP + 16400 : 77.3 * v.HBP + 12800) : undefined, hint: 'auto from Fig. 14-2; type Table 14-3 value for case-hardened' },
            { id: 'StG', symbol: '(S_t)_G', label: 'Gear bending strength', unit: 'psi', kind: 'lookup', fig: 'f14-2', auto: v => has(v, 'HBG', 'grade') ? (v.grade === 2 ? 102 * v.HBG + 16400 : 77.3 * v.HBG + 12800) : undefined },
            { id: 'ScP', symbol: '(S_c)_P', label: 'Pinion contact strength', unit: 'psi', kind: 'lookup', fig: 'f14-5', auto: v => has(v, 'HBP', 'grade') ? (v.grade === 2 ? 349 * v.HBP + 34300 : 322 * v.HBP + 29100) : undefined, hint: 'auto from Fig. 14-5; type Table 14-6 value for case-hardened' },
            { id: 'ScG', symbol: '(S_c)_G', label: 'Gear contact strength', unit: 'psi', kind: 'lookup', fig: 'f14-5', auto: v => has(v, 'HBG', 'grade') ? (v.grade === 2 ? 349 * v.HBG + 34300 : 322 * v.HBG + 29100) : undefined },
            { id: 'CH', symbol: 'C_H', label: 'Hardness-ratio factor (gear only; = 1 for the pinion)', kind: 'lookup', fig: 'f14-12', digits: 4, hint: 'course: 1 for the pinion, "neglect or use 1" for the gear when same hardness; auto = Eq. 14-36 (1 if H_BP/H_BG < 1.2)',
              auto: v => { if (!has(v, 'HBP', 'HBG', 'mG')) return 1; const r = v.HBP / v.HBG; const A = r < 1.2 ? 0 : r > 1.7 ? 0.00698 : 8.98e-3 * r - 8.29e-3; return 1 + A * (v.mG - 1); } },
          ] },
        { id: 'sf', title: 'Factors of safety S_F (bending) and S_H (wear) — PASS / FAIL', eq: '14-41, 14-42', fig: ['f14-17', 'f14-18'],
          formula: 'S_F = \\frac{S_t Y_N/(K_T K_R)}{\\sigma},\\qquad S_H = \\frac{S_c Z_N C_H/(K_T K_R)}{\\sigma_c}',
          text: 'Compare S_F with S_H² (linear-contact gears) to decide whether bending or wear is the threat. The mesh must have every factor ≥ the design factor.',
          vars: [
            { id: 'sallP', symbol: '\\sigma_{all,P}', label: 'Allowable bending stress, pinion', unit: 'psi', kind: 'calc', compute: v => has(v, 'StP', 'YNP', 'KT', 'KR', 'SFd') ? v.StP * v.YNP / (v.KT * v.KR * v.SFd) : undefined },
            { id: 'SFP', symbol: '(S_F)_P', label: 'Bending safety factor, pinion', kind: 'calc', digits: 3, compute: v => has(v, 'StP', 'YNP', 'KT', 'KR', 'sP') ? v.StP * v.YNP / (v.KT * v.KR) / v.sP : undefined, work: v => v.SFP !== undefined ? '\\((S_F)_P = \\frac{' + f(v.StP) + '(' + f(v.YNP, 4) + ')/[' + f(v.KT) + '(' + f(v.KR, 3) + ')]}{' + f(v.sP) + '} = ' + f(v.SFP, 3) + '\\)' : null },
            { id: 'SFG', symbol: '(S_F)_G', label: 'Bending safety factor, gear', kind: 'calc', digits: 3, compute: v => has(v, 'StG', 'YNG', 'KT', 'KR', 'sG') ? v.StG * v.YNG / (v.KT * v.KR) / v.sG : undefined, work: v => v.SFG !== undefined ? '\\((S_F)_G = \\frac{' + f(v.StG) + '(' + f(v.YNG, 4) + ')/[' + f(v.KT) + '(' + f(v.KR, 3) + ')]}{' + f(v.sG) + '} = ' + f(v.SFG, 3) + '\\)' : null },
            { id: 'SHP', symbol: '(S_H)_P', label: 'Wear safety factor, pinion', kind: 'calc', digits: 3, compute: v => has(v, 'ScP', 'ZNP', 'KT', 'KR', 'scP') ? v.ScP * v.ZNP / (v.KT * v.KR) / v.scP : undefined, work: v => v.SHP !== undefined ? '\\((S_H)_P = \\frac{' + f(v.ScP) + '(' + f(v.ZNP, 4) + ')/[' + f(v.KT) + '(' + f(v.KR, 3) + ')]}{' + f(v.scP) + '} = ' + f(v.SHP, 3) + '\\)' : null },
            { id: 'SHG', symbol: '(S_H)_G', label: 'Wear safety factor, gear (with C_H)', kind: 'calc', digits: 3, compute: v => has(v, 'ScG', 'ZNG', 'CH', 'KT', 'KR', 'scG') ? v.ScG * v.ZNG * v.CH / (v.KT * v.KR) / v.scG : undefined, work: v => v.SHG !== undefined ? '\\((S_H)_G = \\frac{' + f(v.ScG) + '(' + f(v.ZNG, 4) + ')(' + f(v.CH, 4) + ')/[' + f(v.KT) + '(' + f(v.KR, 3) + ')]}{' + f(v.scG) + '} = ' + f(v.SHG, 3) + '\\)' : null },
            { id: 'SH2P', symbol: '(S_H)_P^2', label: 'Wear factor squared, pinion (compare with S_F)', kind: 'calc', digits: 3, compute: v => v.SHP !== undefined ? v.SHP * v.SHP : undefined },
            { id: 'SH2G', symbol: '(S_H)_G^2', label: 'Wear factor squared, gear', kind: 'calc', digits: 3, compute: v => v.SHG !== undefined ? v.SHG * v.SHG : undefined },
          ],
          after: v => {
            if (!has(v, 'SFP', 'SFG', 'SHP', 'SHG')) return '<i>Enter a material (hardness or S_t/S_c) to get the factors of safety.</i>';
            const d = v.SFd || 1; const mn = Math.min(v.SFP, v.SFG, v.SHP, v.SHG);
            const threatP = v.SFP < v.SH2P ? 'bending' : 'wear', threatG = v.SFG < v.SH2G ? 'bending' : 'wear';
            const txt = 'Pinion: S_F = ' + f(v.SFP, 3) + ', S_H = ' + f(v.SHP, 3) + ' (S_H² = ' + f(v.SH2P, 3) + ') → threat is ' + threatP + '. Gear: S_F = ' + f(v.SFG, 3) + ', S_H = ' + f(v.SHG, 3) + ' (S_H² = ' + f(v.SH2G, 3) + ') → threat is ' + threatG + '. ';
            const range = mn > 1.5 ? ' Governing factor ' + f(mn, 3) + ' is above the AGMA 1.0–1.5 target — acceptable but conservative (a softer/cheaper steel or smaller gears would do).' : ' Governing factor ' + f(mn, 3) + ' lies in the AGMA 1.0–1.5 target range.';
            return mn >= d ? okbad(true, 'PASS — every factor of safety ≥ design factor ' + f(d) + '. ' + txt + range) : okbad(false, 'FAIL — minimum factor of safety ' + f(mn, 3) + ' < ' + f(d) + '. ' + txt + 'Increase hardness / case-harden, widen F, lower P_d or raise quality.');
          } },
      ] },

      // ================= GEAR TRAIN =================
      { title: 'Gear train (optional) — train value', steps: [
        { id: 'train', title: 'Compound train: speed and torque chain', eq: '13-30, 13-31', fig: ['f13-23'],
          formula: 'e = \\pm\\frac{\\prod N_{driving}}{\\prod N_{driven}} = \\frac{N_2 N_4}{N_3 N_5},\\qquad n_L = e\\,n_F,\\qquad T_L = \\frac{T_F}{|e|}\\ (\\text{no losses})',
          text: 'Fizz "Gear Trains": TV = (VR)₁(VR)₂… = n_in/n_out = N_out/N_in — the reciprocal of Shigley\'s e. Sign: an odd number of external meshes reverses rotation (e negative). Leave stage 2 blank for a single pair. Idlers cancel.',
          vars: [
            { id: 'N2', symbol: 'N_2', label: 'Stage 1 driver teeth', kind: 'input' },
            { id: 'N3', symbol: 'N_3', label: 'Stage 1 driven teeth', kind: 'input' },
            { id: 'N4', symbol: 'N_4', label: 'Stage 2 driver teeth (blank if none)', kind: 'input' },
            { id: 'N5', symbol: 'N_5', label: 'Stage 2 driven teeth', kind: 'input' },
            { id: 'nF', symbol: 'n_F', label: 'First gear speed', unit: 'rpm', kind: 'input', auto: v => v.nP },
            { id: 'e', symbol: 'e', label: 'Train value (magnitude)', kind: 'calc', digits: 4, compute: v => has(v, 'N2', 'N3') ? (v.N2 / v.N3) * (has(v, 'N4', 'N5') ? v.N4 / v.N5 : 1) : undefined,
              work: v => has(v, 'N2', 'N3') ? '\\(e = \\frac{' + f(v.N2) + (has(v, 'N4', 'N5') ? '\\times' + f(v.N4) : '') + '}{' + f(v.N3) + (has(v, 'N4', 'N5') ? '\\times' + f(v.N5) : '') + '} = ' + f(v.e, 4) + '\\), TV = 1/e = ' + f(1 / v.e, 4) : null },
            { id: 'TV', symbol: 'TV', label: 'Train value, Fizz/Mott form n_in/n_out', kind: 'calc', digits: 4, compute: v => v.e ? 1 / v.e : undefined },
            { id: 'nL', symbol: 'n_L', label: 'Last gear speed', unit: 'rpm', kind: 'calc', compute: v => has(v, 'e', 'nF') ? v.e * v.nF : undefined },
            { id: 'TL', symbol: 'T_L', label: 'Output torque (100 % efficiency)', unit: 'lbf·in', kind: 'calc', compute: v => has(v, 'e', 'nF', 'P') && v.e > 0 ? 63025 * v.P / (v.e * v.nF) : undefined },
          ],
          after: v => v.e === undefined ? '' : ('Direction: ' + ((has(v, 'N4', 'N5') ? 2 : 1) % 2 ? 'odd number of meshes → output turns OPPOSITE to input (e < 0)' : 'even number of meshes → output turns the SAME way as input (e > 0)') + '.') },
      ] },
    ],
  };
})();
