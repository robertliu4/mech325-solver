/* Helical gears — Mott 6e (Sec. 8-7 geometry, 10-2 forces, 10-3/10-4 stresses). Merged Fizz + Mech-guide procedure.
 * Defaults follow the UBC MECH 325 course conventions (v2/COURSE_CONVENTIONS.md §6–8: Helical_Bevel_…_2025 slides, Module 2 p16–27, Gear Trains Tut 4).
 * Verified against: Gear Trains Tutorial 4 / Module 2 p16–27 with Mott factors (5 hp, 300 rpm, 16/48 T, P_nd = 6, ψ = 25°, F = 2, A_v = 11, J_P = 0.45,
 *   I = 0.199 (Table 10-1), K_s formula 1.088, R = 0.90, 10^8 cycles → P_d 5.438, D_P 2.942, v_t 231.1, W_t 714, K_v 1.206, K_m 1.214, s_t 6851 psi,
 *   s_c 71.7 ksi (course "71.0 with Mott I"), s_at,min 5962 psi (course 5947), s_ac,min 64.2 ksi; with I = 0.190 (Eq. 14-23) s_c 73.3 ksi, s_ac,min 65.7 ksi (course 66.2);
 *   HB 235 → SF 5.19 bending, 1.63 contact (course 1.58)).
 * Verified against: Gear Trains Tutorial 1 Q1 (P_nd = 6, ψ = 25°, 16/36 T → P_d 5.438, D_P 2.942, D_G 6.620, C 4.78 in). */
(function () {
  const has = (v, ...ids) => H.has(v, ...ids);
  const f = (x, d) => H.fmt(x, d);
  const cosd = a => Math.cos(H.rad(a)), sind = a => Math.sin(H.rad(a)), tand = a => Math.tan(H.rad(a));
  const KO = { uniform: { uniform: 1.00, light: 1.25, moderate: 1.50, heavy: 1.75 }, light: { uniform: 1.20, light: 1.40, moderate: 1.75, heavy: 2.25 }, moderate: { uniform: 1.30, light: 1.70, moderate: 2.00, heavy: 2.75 } };
  const KS = Pd => Pd >= 5 ? 1.00 : Pd >= 4 ? 1.05 : Pd >= 3 ? 1.15 : Pd >= 2 ? 1.25 : 1.40;
  const CMA = { open: [0.247, 0.0167, -0.765e-4], commercial: [0.127, 0.0158, -1.093e-4], precision: [0.0675, 0.0128, -0.926e-4], extra: [0.0380, 0.0102, -0.822e-4] };
  const KR = { 0.9: 0.85, 0.99: 1.00, 0.999: 1.25, 0.9999: 1.50 };
  const YN_auto = N => N >= 1e7 ? 1.3558 * Math.pow(N, -0.0178) : Math.max(1, 4.9404 * Math.pow(N, -0.1045));
  const ZN_auto = N => N >= 1e7 ? 1.4488 * Math.pow(N, -0.023) : 2.466 * Math.pow(N, -0.056);
  const okbad = (ok, txt) => '<span class="' + (ok ? 'result-ok' : 'result-bad') + '">' + txt + '</span>';
  // Shigley Table 14-2 Lewis Y (20° FD) — only for the optional K_s formula the course also accepts
  const Y_N = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 24, 26, 28, 30, 34, 38, 43, 50, 60, 75, 100, 150, 300, 400];
  const Y_V = [0.245, 0.261, 0.277, 0.29, 0.296, 0.303, 0.309, 0.314, 0.322, 0.328, 0.331, 0.337, 0.346, 0.353, 0.359, 0.371, 0.384, 0.397, 0.409, 0.422, 0.435, 0.447, 0.46, 0.472, 0.48];
  const lewisY = N => H.interp(N, Y_N, Y_V);
  const satHB = (s, g) => g === 2 ? (s / 1000 - 16.40) / 0.102 : (s / 1000 - 12.80) / 0.0773;
  const sacHB = (s, g) => g === 2 ? (s / 1000 - 34.30) / 0.349 : (s / 1000 - 29.10) / 0.322;
  const satOf = (HB, g) => (g === 2 ? 0.102 * HB + 16.40 : 0.0773 * HB + 12.80) * 1000;
  const sacOf = (HB, g) => (g === 2 ? 0.349 * HB + 34.30 : 0.322 * HB + 29.10) * 1000;
  // rough read of Fig 10-6(a) J' (20° normal, 75-tooth mate, ψ 15–25°) and (b) multiplier
  const Jp = N => H.interp(N, [20, 30, 60, 150, 500], [0.47, 0.51, 0.55, 0.58, 0.60]);
  const Jmult = Nm => H.interp(Nm, [20, 30, 50, 75, 150, 500], [0.93, 0.96, 0.985, 1.0, 1.015, 1.03]);
  // Tables 10-1 (20° normal) and 10-2 (25° normal): I for helix 15° and 25°. rows = gear teeth, cols = pinion teeth (lower triangle)
  const TAB = {
    20: { 15: { P: [17, 21, 26, 35, 55], G: [17, 21, 26, 35, 55, 135], V: [[0.124], [0.139, 0.128], [0.154, 0.143, 0.132], [0.175, 0.165, 0.154, 0.137], [0.204, 0.196, 0.187, 0.171, 0.143], [0.244, 0.241, 0.237, 0.229, 0.209]] },
          25: { P: [14, 17, 21, 26, 35, 55], G: [14, 17, 21, 26, 35, 55, 135], V: [[0.123], [0.137, 0.126], [0.152, 0.142, 0.130], [0.167, 0.157, 0.146, 0.134], [0.187, 0.178, 0.168, 0.156, 0.138], [0.213, 0.207, 0.199, 0.189, 0.173, 0.144], [0.248, 0.247, 0.244, 0.239, 0.230, 0.210]] } },
    25: { 15: { P: [14, 17, 21, 26, 35, 55], G: [14, 17, 21, 26, 35, 55, 135], V: [[0.130], [0.144, 0.133], [0.160, 0.149, 0.137], [0.175, 0.165, 0.153, 0.140], [0.195, 0.186, 0.175, 0.163, 0.143], [0.222, 0.215, 0.206, 0.195, 0.178, 0.148], [0.257, 0.255, 0.251, 0.246, 0.236, 0.214]] },
          25: { P: [12, 14, 17, 21, 26, 35, 55], G: [12, 14, 17, 21, 26, 35, 55, 135], V: [[0.129], [0.141, 0.132], [0.155, 0.146, 0.135], [0.170, 0.162, 0.151, 0.138], [0.185, 0.177, 0.166, 0.154, 0.141], [0.203, 0.197, 0.188, 0.176, 0.163, 0.144], [0.227, 0.223, 0.216, 0.207, 0.196, 0.178, 0.148], [0.259, 0.258, 0.255, 0.251, 0.246, 0.235, 0.213]] } } };
  function tabI(T, NP, NG) {
    const cell = (gi, pi) => (T.V[gi] && T.V[gi][pi] !== undefined) ? T.V[gi][pi] : undefined;
    const colAt = (gi, N) => { // interpolate along pinion columns for gear row gi
      const P = T.P; if (N <= P[0]) return cell(gi, 0);
      for (let i = 1; i < P.length; i++) if (N <= P[i]) { const a = cell(gi, i - 1), b = cell(gi, i); if (a === undefined) return undefined; if (b === undefined) return a; return a + (b - a) * (N - P[i - 1]) / (P[i] - P[i - 1]); }
      return cell(gi, P.length - 1);
    };
    const G = T.G; let gi = G.findIndex(g => NG <= g); if (gi < 0) gi = G.length - 1;
    if (gi === 0) return colAt(0, NP);
    const a = colAt(gi - 1, NP), b = colAt(gi, NP); if (a === undefined || b === undefined) return b !== undefined ? b : undefined;
    return a + (b - a) * (NG - G[gi - 1]) / (G[gi] - G[gi - 1]);
  }
  function Iauto(phin, psi, NP, NG) {
    const t = TAB[phin]; if (!t || !(NP > 0 && NG >= NP)) return undefined;
    const i15 = tabI(t[15], NP, NG), i25 = tabI(t[25], NP, NG); if (i15 === undefined || i25 === undefined) return undefined;
    const w = Math.min(1, Math.max(0, (psi - 15) / 10)); return i15 + (i25 - i15) * w;
  }

  window.TOPIC = {
    id: 'helical', book: 'mott',
    title: 'Helical Gears — Geometry, Forces & AGMA Stress',
    subtitle: 'Mott Sec. 8-7, 10-1 … 10-5 · Fizz + Mech-guide procedure merged',
    sibling: 'helical_shigley.html',
    intro: 'Parallel-shaft helical gears in Mott notation. Same procedure as the spur-gear page — <b>only J and I change</b> (course): the <b>transverse</b> P_d = P_nd cos ψ goes in the bending equation and in D_P; J = K × J′ from Figs. 10-5/10-6/10-7 (by normal pressure angle, J′ for a 75-tooth mate times the multiplier for the actual mate — the course\'s "K_J′"); I from Tables 10-1/10-2 (ψ = 15° and 25°; Shigley Eq. 14-23 accepted as the alternative). <b>Defaults are the MECH 325 course assumptions</b>: C_p = 2300, K_s = 1 (Table 9-2; Lewis-Y formula accepted), K_B = 1, K_R = 1.00 at 99 %, K_m = 1 + C_pf + C_ma with commercial-enclosed C_ma, K_v by Table 9-6 with A_v = 17 − Q_v, life 10⁷ on the commercial Y_N/Z_N lines, Grade 1 steel, SF = 1 then a steel from Table 9-8 / App. 3. The instructor set <b>ψ = 25°</b> in the tutorial "to use the charts in Mott" (≈ 15° is optimal). Fizz default when nothing is given: P_nd = 12, N_P = 24, F_nom = 2 p_x. Example = Gear Trains Tutorial 4 (5 hp, 300 rpm, 16/48 T, P_nd = 6, ψ = 25°).',
    example: { P: 5, nP: 300, src: 'uniform', drv: 'uniform', Pnd: 6, psi: 25, phin: 20, NP: 16, NG: 48, F: 2, Av: 11, JpP: 0.47, KJP: 0.96, JpG: 0.54, KJG: 0.93, ksMode: 2, I: 0.199, cond: 'commercial', Cp: 2300, R: 0.9, Lh: 5555.56, grade: 1, HBP: 235, HBG: 235, SFd: 1 },

    figures: [
      { id: 'f8-21', ref: 'Figure 8-21', title: 'Three primary planes of a helical rack: p_t, p_n, p_x, φ_n, φ_t, ψ', src: 'figures/mott/fig8-21.png', page: 342 },
      { id: 'f10-4', ref: 'Figure 10-4', title: 'Helical gear geometry and forces W_t, W_r, W_x', src: 'figures/mott/fig10-4.png', page: 448 },
      { id: 't8-3', ref: 'Table 8-3', title: 'Standard diametral pitches', src: 'figures/mott/table8-3.png', page: 332 },
      { id: 't9-1', ref: 'Table 9-1', title: 'Suggested overload factors K_o', src: 'figures/mott/table9-1.png', page: 395 },
      { id: 'f9-11', ref: 'Figure 9-11', title: 'Trial diametral pitch from design power & pinion speed (spur basis)', src: 'figures/mott/fig9-11.png', page: 394, note: 'Rough guide only for helical gears. Fizz: just use P_nd = 12 and N_P = 24.' },
      { id: 't9-5', ref: 'Table 9-5', title: 'Recommended quality numbers A_v', src: 'figures/mott/table9-5.png', page: 399 },
      { id: 'f9-16', ref: 'Figure 9-16', title: 'Dynamic factor K_v', src: 'figures/mott/fig9-16.png', page: 400 },
      { id: 't9-6', ref: 'Table 9-6', title: 'Analytical K_v (B, C from A_v)', src: 'figures/mott/table9-6.png', page: 401 },
      { id: 'f10-5', ref: 'Figure 10-5', title: 'Helical J for 15° normal pressure angle (+ multiplier)', src: 'figures/mott/fig10-5.png', page: 451 },
      { id: 'f10-6', ref: 'Figure 10-6', title: 'Helical J for 20° normal pressure angle (+ multiplier)', src: 'figures/mott/fig10-6.png', page: 452, note: '(a) J′ vs helix angle ψ, curve = teeth of the gear wanted (75-tooth mate). (b) multiplier for the actual mating tooth count. J = J′ × K. Lecture: 20T pinion / 100T gear at ψ = 20° → J_P = 0.505 × 1.01, J_G ≈ 0.55 × 0.935.' },
      { id: 'f10-7', ref: 'Figure 10-7', title: 'Helical J for 22° normal pressure angle (+ multiplier)', src: 'figures/mott/fig10-7.png', page: 453, note: '"I swear he will never give you a 22° one but if he does it is what it is."' },
      { id: 't10-1', ref: 'Table 10-1', title: 'Pitting geometry factor I, 20° normal pressure angle (ψ = 15° and 25°)', src: 'figures/mott/table10-1.png', page: 454, note: 'Rows = gear teeth, columns = pinion teeth. Interpolate (auto does bilinear + helix interpolation between 15° and 25°).' },
      { id: 't10-2', ref: 'Table 10-2', title: 'Pitting geometry factor I, 25° normal pressure angle (ψ = 15° and 25°)', src: 'figures/mott/table10-2.png', page: 455 },
      { id: 't9-2', ref: 'Table 9-2', title: 'Size factor K_s', src: 'figures/mott/table9-2.png', page: 395 },
      { id: 'f9-12', ref: 'Figure 9-12', title: 'Pinion proportion factor C_pf', src: 'figures/mott/fig9-12.png', page: 396 },
      { id: 'f9-13', ref: 'Figure 9-13', title: 'Mesh alignment factor C_ma', src: 'figures/mott/fig9-13.png', page: 397 },
      { id: 'f9-14', ref: 'Figure 9-14', title: 'Rim thickness factor K_B', src: 'figures/mott/fig9-14.png', page: 397 },
      { id: 't9-7', ref: 'Table 9-7', title: 'Elastic coefficient C_p', src: 'figures/mott/table9-7.png', page: 404 },
      { id: 'f9-18', ref: 'Figure 9-18', title: 'Allowable bending stress number s_at vs HB', src: 'figures/mott/fig9-18.png', page: 407, note: 'Grade 1: HB = (s_at − 12.80)/0.0773 (ksi).' },
      { id: 'f9-19', ref: 'Figure 9-19', title: 'Allowable contact stress number s_ac vs HB', src: 'figures/mott/fig9-19.png', page: 408, note: 'Grade 1: HB = (s_ac − 29.10)/0.322 (ksi).' },
      { id: 't9-8', ref: 'Table 9-8', title: 'Examples of gear materials', src: 'figures/mott/table9-8.png', page: 406 },
      { id: 't9-9', ref: 'Table 9-9', title: 'Allowable stress numbers, case-hardened grade-1 steel', src: 'figures/mott/table9-9.png', page: 409 },
      { id: 't9-10', ref: 'Table 9-10', title: 'Allowable stress numbers, iron and bronze', src: 'figures/mott/table9-10.png', page: 410 },
      { id: 't9-11', ref: 'Table 9-11', title: 'Reliability factor K_R', src: 'figures/mott/table9-11.png', page: 411 },
      { id: 't9-12', ref: 'Table 9-12', title: 'Recommended design life', src: 'figures/mott/table9-12.png', page: 411 },
      { id: 'f9-21', ref: 'Figure 9-21', title: 'Bending stress cycle factor Y_N', src: 'figures/mott/fig9-21.png', page: 412 },
      { id: 'f9-22', ref: 'Figure 9-22', title: 'Pitting stress cycle factor Z_N', src: 'figures/mott/fig9-22.png', page: 412, note: 'Upper line 1.4488 N^-0.023 for normal commercial gears.' },
      { id: 'app3a', ref: 'Appendix 3', title: 'Design properties of carbon and alloy steels — s_u, s_y, % elongation, HB (1020 … 4150)', src: 'figures/mott/appendix3a.png', page: 804, note: 'Tutorial 4: 4140 OQT1300 HB 235 → SF 1.58; 4140 annealed HB 197 → 1.40.' },
      { id: 'app3b', ref: 'Appendix 3 (cont.)', title: 'Steels 4340 … 9255', src: 'figures/mott/appendix3b.png', page: 805 },
      { id: 't9-4', ref: 'Table 9-4', book: 'course', title: 'Q_v ↔ A_v mapping (Table 9-4 on the course K_v slide)', src: 'figures/course/gear_kv_q_av_table.png', note: 'A_v = 17 − Q_v. Course prefers the Table 9-6 equation.' },
      // ---- course-only slides (v2/COURSE_CONVENTIONS.md §16) ----
      { id: 'cj', ref: 'Helical/Bevel s7', book: 'course', title: 'J = K_J′ × J′ — course explanation and worked numbers (20T/100T, ψ = 20°)', src: 'figures/course/helical_j_modifier_example.png', note: 'J_P = 0.46 × 1.01 = 0.47, J_G = 0.55 × 0.935 = 0.51. Mott Fig. 10-5/10-6 reads J′ = 0.46 vs Shigley Fig. 14-7 0.505 — either accepted. Tutorial: 16 T at ψ = 25° → J′ ≈ 0.47.' },
      { id: 'cko', ref: 'Gear Stress s12', book: 'course', title: 'Overload factor K_o — Shigley table and Mott Table 9-1 side by side', src: 'figures/course/ko_shigley_vs_mott.png', note: 'Either accepted; tutorials use K_o = 1.' },
      { id: 'cks', ref: 'Gear Stress s15', book: 'course', title: 'Size factor K_s: "Typically K_s = 1", Table 9-2 or the Lewis-Y formula', src: 'figures/course/gear_ks_course.png' },
      { id: 'ccma', ref: 'Gear Stress s20', book: 'course', title: 'C_ma — "default to curve 2 (commercial enclosed gear units)"', src: 'figures/course/gear_cma_curve2.png' },
      { id: 'cyn', ref: 'Gear Stress s37', book: 'course', title: 'Y_N — "use this line for normal commercial gears"', src: 'figures/course/gear_yn_course_line.png' },
      { id: 'czn', ref: 'Gear Stress s44', book: 'course', title: 'Z_N — normal commercial gears line', src: 'figures/course/gear_zn_course_line.png' },
      { id: 'cteeth', ref: 'Helical/Bevel s33', book: 'course', title: 'Standard gear teeth proportions and Lewis Y table', src: 'figures/course/standard_gear_teeth_table.png' },
    ],

    sections: [
      { title: 'Inputs & design decisions (Fizz steps 1–5)', steps: [
        { id: 'in', title: 'Power, speeds, overload factor', fig: ['cko', 't9-1'],
          text: 'K_o from Table 9-1 (course accepts Shigley\'s table too; tutorials use K_o = 1). US customary units throughout.',
          formula: 'P_{des} = K_o P,\\qquad VR = \\frac{n_P}{n_G} = \\frac{N_G}{N_P}',
          vars: [
            { id: 'P', symbol: 'P', label: 'Transmitted power', unit: 'hp', kind: 'input' },
            { id: 'nP', symbol: 'n_P', label: 'Pinion speed', unit: 'rpm', kind: 'input' },
            { id: 'nGd', symbol: 'n_{G,des}', label: 'Desired gear speed (blank if N_G given)', unit: 'rpm', kind: 'input' },
            { id: 'src', label: 'Power source', kind: 'choice', type: 'text', options: [{ label: 'Uniform (electric motor)', value: 'uniform' }, { label: 'Light shock', value: 'light' }, { label: 'Moderate shock', value: 'moderate' }], default: 'uniform' },
            { id: 'drv', label: 'Driven machine', kind: 'choice', type: 'text', options: [{ label: 'Uniform', value: 'uniform' }, { label: 'Light shock', value: 'light' }, { label: 'Moderate shock (machine tools, saws)', value: 'moderate' }, { label: 'Heavy shock', value: 'heavy' }], default: 'uniform' },
            { id: 'Ko', symbol: 'K_o', label: 'Overload factor', kind: 'lookup', fig: 'cko', hint: 'auto from the two selects (Table 9-1)', auto: v => (KO[v.src] && KO[v.src][v.drv]) || undefined },
            { id: 'Pdes', symbol: 'P_{des}', label: 'Design power', unit: 'hp', kind: 'calc', compute: v => has(v, 'P', 'Ko') ? v.P * v.Ko : undefined },
            { id: 'VRd', symbol: 'VR_{des}', label: 'Desired velocity ratio', kind: 'calc', compute: v => has(v, 'nP', 'nGd') && v.nGd > 0 ? v.nP / v.nGd : undefined },
          ] },
        { id: 'tooth', title: 'Normal diametral pitch, helix angle, normal pressure angle, tooth numbers', fig: ['t8-3', 'f9-11'],
          text: 'Fizz step 3: "take a wild guess for P_nd and N_P — the textbook example used P_nd = 12 and N_P = 24, so use those every time." Helix angle from the problem (15° is optimal; 15–30° typical). <b>Course note:</b> the instructor changed Shigley\'s 30° helix to ψ = 25° so that Mott\'s 15°/25° J and I charts/tables apply — expect 15° or 25°. Step 5: N_G = N_P·VR rounded.',
          vars: [
            { id: 'Pnd', symbol: 'P_{nd}', label: 'Normal diametral pitch', unit: 'teeth/in', kind: 'input', default: 12, hint: 'transverse P_d given instead? P_nd = P_d / cos ψ' },
            { id: 'psi', symbol: '\\psi', label: 'Helix angle', unit: '°', kind: 'input', default: 15, hint: '15° optimal; course tutorial uses 25°', check: v => v.psi !== undefined && (v.psi < 5 || v.psi > 45) ? 'helix angles are normally 10–30°' : (v.psi !== undefined && v.psi !== 15 && v.psi !== 25 ? 'Tables 10-1/10-2 only tabulate ψ = 15° and 25° — interpolate (auto) or use Shigley Eq. 14-23' : null) },
            { id: 'phin', symbol: '\\phi_n', label: 'Normal pressure angle', unit: '°', kind: 'choice', options: [{ label: '20° (Fig. 10-6, Table 10-1)', value: 20 }, { label: '15° (Fig. 10-5)', value: 15 }, { label: '22° (Fig. 10-7)', value: 22 }, { label: '25° (Table 10-2)', value: 25 }], default: 20 },
            { id: 'NP', symbol: 'N_P', label: 'Pinion teeth', kind: 'input', default: 24 },
            { id: 'NG', symbol: 'N_G', label: 'Gear teeth', kind: 'input', hint: 'auto = round(N_P·VR_des)', auto: v => has(v, 'NP', 'VRd') ? Math.round(v.NP * v.VRd) : undefined },
            { id: 'mG', symbol: 'VR = m_G', label: 'Actual velocity ratio', kind: 'calc', compute: v => has(v, 'NP', 'NG') ? v.NG / v.NP : undefined },
            { id: 'nG', symbol: 'n_G', label: 'Actual gear speed', unit: 'rpm', kind: 'calc', compute: v => has(v, 'nP', 'NP', 'NG') ? v.nP * v.NP / v.NG : undefined },
          ] },
      ] },

      { title: 'Helical geometry (Mech-guide spec question, Sec. 8-7)', steps: [
        { id: 'geo1', title: 'Transverse diametral pitch, circular pitches, axial pitch, transverse pressure angle', eq: '8-11 … 8-16',
          fig: ['f8-21'],
          formula: 'P_d = P_{nd}\\cos\\psi,\\quad p_t = \\frac{\\pi}{P_d},\\quad p_n = p_t\\cos\\psi,\\quad p_x = \\frac{p_t}{\\tan\\psi} = \\frac{\\pi}{P_d\\tan\\psi},\\quad \\phi_t = \\tan^{-1}\\frac{\\tan\\phi_n}{\\cos\\psi}',
          vars: [
            { id: 'Pd', symbol: 'P_d', label: 'Transverse diametral pitch', unit: 'teeth/in', kind: 'calc', compute: v => has(v, 'Pnd', 'psi') ? v.Pnd * cosd(v.psi) : undefined, work: v => has(v, 'Pnd', 'psi') ? '\\(P_d = ' + f(v.Pnd) + '\\cos ' + f(v.psi) + '^\\circ = ' + f(v.Pnd * cosd(v.psi)) + '\\)' : null },
            { id: 'pt', symbol: 'p_t', label: 'Transverse circular pitch', unit: 'in', kind: 'calc', compute: v => has(v, 'Pd') ? Math.PI / v.Pd : undefined },
            { id: 'pn', symbol: 'p_n', label: 'Normal circular pitch', unit: 'in', kind: 'calc', compute: v => has(v, 'pt', 'psi') ? v.pt * cosd(v.psi) : undefined },
            { id: 'px', symbol: 'p_x', label: 'Axial pitch', unit: 'in', kind: 'calc', compute: v => has(v, 'Pd', 'psi') ? Math.PI / (v.Pd * tand(v.psi)) : undefined, work: v => has(v, 'Pd', 'psi') ? '\\(p_x = \\pi/[' + f(v.Pd) + '\\tan ' + f(v.psi) + '^\\circ] = ' + f(Math.PI / (v.Pd * tand(v.psi))) + '\\ \\mathrm{in}\\)' : null },
            { id: 'phit', symbol: '\\phi_t', label: 'Transverse pressure angle', unit: '°', kind: 'calc', compute: v => has(v, 'phin', 'psi') ? H.deg(Math.atan(tand(v.phin) / cosd(v.psi))) : undefined, work: v => has(v, 'phin', 'psi') ? '\\(\\phi_t = \\tan^{-1}[\\tan ' + f(v.phin) + '^\\circ/\\cos ' + f(v.psi) + '^\\circ] = ' + f(H.deg(Math.atan(tand(v.phin) / cosd(v.psi)))) + '^\\circ\\)' : null },
            { id: 'mn', symbol: 'm_n', label: 'Normal module (metric equivalent)', unit: 'mm', kind: 'calc', compute: v => has(v, 'Pnd') ? 25.4 / v.Pnd : undefined },
          ] },
        { id: 'geo2', title: 'Pitch diameters, centre distance, face width, number of axial pitches', fig: ['f8-21'],
          formula: 'D = \\frac{N}{P_d},\\quad C = \\frac{N_P+N_G}{2P_d},\\quad F_{nom} = 2p_x,\\quad \\frac{F}{p_x} > 2\\ (\\text{full helical action})',
          text: 'Use the TRANSVERSE P_d for diameters, not P_nd. Fizz step 8: F_nom = 2 p_x, "round it however you want so that the value is convenient".',
          vars: [
            { id: 'DP', symbol: 'D_P', label: 'Pinion pitch diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'NP', 'Pd') ? v.NP / v.Pd : undefined, work: v => has(v, 'NP', 'Pd') ? '\\(D_P = ' + f(v.NP) + '/' + f(v.Pd) + ' = ' + f(v.NP / v.Pd) + '\\ \\mathrm{in}\\)' : null },
            { id: 'DG', symbol: 'D_G', label: 'Gear pitch diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'NG', 'Pd') ? v.NG / v.Pd : undefined },
            { id: 'C', symbol: 'C', label: 'Centre distance', unit: 'in', kind: 'calc', compute: v => has(v, 'DP', 'DG') ? (v.DP + v.DG) / 2 : undefined },
            { id: 'Fnom', symbol: 'F_{nom}', label: 'Nominal face width 2 p_x', unit: 'in', kind: 'calc', compute: v => has(v, 'px') ? 2 * v.px : undefined },
            { id: 'F', symbol: 'F', label: 'Face width (chosen)', unit: 'in', kind: 'input', hint: 'auto = 2 p_x; round up to a convenient value', auto: v => has(v, 'px') ? 2 * v.px : undefined },
            { id: 'nax', symbol: 'F/p_x', label: 'Number of axial pitches in face width', kind: 'calc', digits: 3, compute: v => has(v, 'F', 'px') ? v.F / v.px : undefined, check: v => v.nax !== undefined && v.nax < 2 ? 'F/p_x < 2: no full helical action — widen F' : null },
            { id: 'FdP', symbol: 'F/D_P', label: 'Face width / pinion diameter', kind: 'calc', digits: 3, compute: v => has(v, 'F', 'DP') ? v.F / v.DP : undefined, check: v => v.FdP !== undefined && v.FdP > 2 ? 'F/D_P > 2 — face too wide' : null },
          ] },
      ] },

      { title: 'Forces (Sec. 10-2)', steps: [
        { id: 'force', title: 'Pitch line speed, tangential, radial, axial loads, torque', eq: '10-4 … 10-9', fig: ['f10-4'],
          formula: 'v_t = \\frac{\\pi D_P n_P}{12},\\quad W_t = \\frac{33\\,000P}{v_t},\\quad W_r = W_t\\tan\\phi_t,\\quad W_x = W_t\\tan\\psi,\\quad W_N = \\frac{W_t}{\\cos\\phi_n\\cos\\psi},\\quad T = \\frac{63\\,000P}{n}',
          vars: [
            { id: 'vt', symbol: 'v_t', label: 'Pitch line speed', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'DP', 'nP') ? Math.PI * v.DP * v.nP / 12 : undefined, work: v => has(v, 'DP', 'nP') ? '\\(v_t = \\pi(' + f(v.DP) + ')(' + f(v.nP) + ')/12 = ' + f(Math.PI * v.DP * v.nP / 12) + '\\ \\mathrm{ft/min}\\)' : null },
            { id: 'Wt', symbol: 'W_t', label: 'Tangential (transmitted) force', unit: 'lb', kind: 'calc', compute: v => has(v, 'P', 'vt') && v.vt > 0 ? 33000 * v.P / v.vt : undefined, work: v => has(v, 'P', 'vt') && v.vt > 0 ? '\\(W_t = 33\\,000(' + f(v.P) + ')/' + f(v.vt) + ' = ' + f(33000 * v.P / v.vt) + '\\ \\mathrm{lb}\\)' : null },
            { id: 'Wr', symbol: 'W_r', label: 'Radial force', unit: 'lb', kind: 'calc', compute: v => has(v, 'Wt', 'phit') ? v.Wt * tand(v.phit) : undefined, work: v => has(v, 'Wt', 'phit') ? '\\(W_r = ' + f(v.Wt) + '\\tan ' + f(v.phit) + '^\\circ = ' + f(v.Wt * tand(v.phit)) + '\\ \\mathrm{lb}\\)' : null },
            { id: 'Wx', symbol: 'W_x', label: 'Axial (thrust) force', unit: 'lb', kind: 'calc', compute: v => has(v, 'Wt', 'psi') ? v.Wt * tand(v.psi) : undefined, work: v => has(v, 'Wt', 'psi') ? '\\(W_x = ' + f(v.Wt) + '\\tan ' + f(v.psi) + '^\\circ = ' + f(v.Wt * tand(v.psi)) + '\\ \\mathrm{lb}\\)' : null },
            { id: 'WN', symbol: 'W_N', label: 'True normal force', unit: 'lb', kind: 'calc', compute: v => has(v, 'Wt', 'phin', 'psi') ? v.Wt / (cosd(v.phin) * cosd(v.psi)) : undefined },
            { id: 'TP', symbol: 'T_P', label: 'Pinion torque', unit: 'lb·in', kind: 'calc', compute: v => has(v, 'P', 'nP') ? 63000 * v.P / v.nP : undefined },
            { id: 'TG', symbol: 'T_G', label: 'Gear torque', unit: 'lb·in', kind: 'calc', compute: v => has(v, 'P', 'nG') ? 63000 * v.P / v.nG : undefined },
          ] },
      ] },

      { title: 'Stress-equation factors (same as spur except J and I)', steps: [
        { id: 'kv', title: 'Quality number A_v and dynamic factor K_v', fig: ['t9-4', 't9-5', 'f9-16', 't9-6'],
          formula: 'B = 0.25(A_v-5)^{0.667},\\quad C = 50+56(1-B),\\quad K_v = \\left[\\frac{C}{C+\\sqrt{v_t}}\\right]^{-B}',
          text: 'A Shigley Q_v maps to A_v = 17 − Q_v (Table 9-4). Course prefers the Table 9-6 equation (auto). Tutorial 4: Q_v = 6 = A_v 11, K_v = 1.21.',
          vars: [
            { id: 'Av', symbol: 'A_v', label: 'AGMA quality number (Shigley Q_v in brackets)', kind: 'choice', fig: 't9-4', options: [6, 7, 8, 9, 10, 11, 12].map(q => ({ label: 'A_v = ' + q + '  (Q_v = ' + (17 - q) + ')', value: q })), default: 10 },
            { id: 'Bv', symbol: 'B', label: 'B', kind: 'calc', digits: 4, compute: v => has(v, 'Av') ? 0.25 * Math.pow(v.Av - 5, 0.667) : undefined },
            { id: 'Cv', symbol: 'C', label: 'C', kind: 'calc', digits: 4, compute: v => has(v, 'Bv') ? 50 + 56 * (1 - v.Bv) : undefined },
            { id: 'Kv', symbol: 'K_v', label: 'Dynamic factor', kind: 'lookup', fig: 'f9-16', hint: 'auto = Table 9-6; or read Fig. 9-16', auto: v => has(v, 'Cv', 'Bv', 'vt') ? Math.pow(v.Cv / (v.Cv + Math.sqrt(v.vt)), -v.Bv) : undefined,
              work: v => has(v, 'Cv', 'Bv', 'vt') ? '\\(K_v = \\left[\\frac{' + f(v.Cv) + '}{' + f(v.Cv) + '+\\sqrt{' + f(v.vt) + '}}\\right]^{-' + f(v.Bv) + '} = ' + f(Math.pow(v.Cv / (v.Cv + Math.sqrt(v.vt)), -v.Bv)) + '\\)' : null },
            { id: 'vtmax', symbol: 'v_{t,max}', label: 'Max. pitch line speed for this A_v', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'Cv', 'Av') ? Math.pow(v.Cv + (14 - v.Av), 2) : undefined, check: v => has(v, 'vt', 'vtmax') && v.vt > v.vtmax ? 'v_t exceeds v_t,max — use a lower A_v' : null },
          ] },
        { id: 'j', title: 'Helical bending geometry factors J = K_J′ × J′ (Fizz step 11)', fig: ['cj', 'f10-5', 'f10-6', 'f10-7'],
          text: 'Pick the figure by NORMAL pressure angle (15° → Fig. 10-5, 20° → Fig. 10-6, 22° → Fig. 10-7). Part (a): x = ψ, curve = tooth number of the gear wanted (75-tooth mate). Part (b): multiplier K for the actual mating tooth count (1.0 at 75). J_P = J′(N_P) × K(N_G); J_G = J′(N_G) × K(N_P). Mott Ex. 10-3 reads J_P = 0.48 directly (24 T with 75-T gear). Auto values are rough reads for 20° only.',
          vars: [
            { id: 'JpP', symbol: 'J\'_P', label: 'J′ pinion (part a)', kind: 'lookup', fig: 'f10-6', digits: 3, hint: 'ROUGH auto — read the chart', auto: v => has(v, 'NP') && v.phin === 20 ? Jp(v.NP) : undefined },
            { id: 'KJP', symbol: 'K_P', label: 'Multiplier for pinion (mate = N_G, part b)', kind: 'lookup', fig: 'f10-6', digits: 3, auto: v => has(v, 'NG') ? Jmult(v.NG) : undefined },
            { id: 'JP', symbol: 'J_P', label: 'Geometry factor, pinion', kind: 'calc', digits: 3, compute: v => has(v, 'JpP', 'KJP') ? v.JpP * v.KJP : undefined, work: v => v.JP !== undefined ? '\\(J_P = ' + f(v.JpP, 3) + '\\times' + f(v.KJP, 3) + ' = ' + f(v.JP, 3) + '\\)' : null },
            { id: 'JpG', symbol: 'J\'_G', label: 'J′ gear (part a)', kind: 'lookup', fig: 'f10-6', digits: 3, hint: 'ROUGH auto — read the chart', auto: v => has(v, 'NG') && v.phin === 20 ? Jp(v.NG) : undefined },
            { id: 'KJG', symbol: 'K_G', label: 'Multiplier for gear (mate = N_P, part b)', kind: 'lookup', fig: 'f10-6', digits: 3, auto: v => has(v, 'NP') ? Jmult(v.NP) : undefined },
            { id: 'JG', symbol: 'J_G', label: 'Geometry factor, gear', kind: 'calc', digits: 3, compute: v => has(v, 'JpG', 'KJG') ? v.JpG * v.KJG : undefined, work: v => v.JG !== undefined ? '\\(J_G = ' + f(v.JpG, 3) + '\\times' + f(v.KJG, 3) + ' = ' + f(v.JG, 3) + '\\)' : null },
          ] },
        { id: 'i', title: 'Pitting geometry factor I (Fizz step 12) and elastic coefficient C_p', fig: ['t10-1', 't10-2', 't9-7'],
          text: 'Table 10-1 for φ_n = 20°, Table 10-2 for 25°; each has parts for ψ = 15° and 25°. Enter with gear teeth (row) and pinion teeth (column), interpolate. The auto value interpolates the table in N_P, N_G and ψ (15°–25°). Course: Shigley Eq. 14-23 is the accepted alternative (tutorial: 0.199 Mott vs 0.190 Shigley for 16/48 T, ψ = 25°). C_p = 2300 for steel/steel (course standard).',
          vars: [
            { id: 'I', symbol: 'I', label: 'Pitting geometry factor', kind: 'lookup', fig: 't10-1', digits: 4, hint: 'auto = interpolated Table 10-1/10-2; Shigley Eq. 14-23 also accepted', auto: v => has(v, 'phin', 'psi', 'NP', 'NG') ? Iauto(v.phin, v.psi, v.NP, v.NG) : undefined,
              check: v => v.psi !== undefined && (v.psi < 15 || v.psi > 25) ? 'ψ outside the 15°–25° table range — use the nearer table part' : null },
            { id: 'Cp', symbol: 'C_p', label: 'Elastic coefficient', unit: '√psi', kind: 'lookup', fig: 't9-7', default: 2300, hint: '2300 steel/steel (course standard)', check: v => v.Cp !== undefined && Math.abs(v.Cp - 2300) > 1 ? 'course standard is 2300 √psi for steel on steel' : null },
          ] },
        { id: 'km', title: 'Size factor K_s and load-distribution factor K_m', eq: '9-17', fig: ['cks', 't9-2', 'f9-12', 'ccma', 'f9-13'],
          formula: 'K_m = 1 + C_{pf} + C_{ma},\\qquad C_{pf} = \\frac{F}{10D_P} - 0.0375 + 0.0125F\\ (1\\le F<15)',
          text: 'K_s: course "typically K_s = 1" (Table 9-2 gives 1.00 for P_d ≥ 5); the Shigley formula 1.192(F√Y/P_n)^0.0535 is the accepted alternative (Tutorial 4: 1.088 → 1.09). Use the transverse P_d for Table 9-2 and D_P for C_pf. Course default C_ma curve: commercial enclosed, C_ma = 0.127 + 0.0158F − 1.093×10⁻⁴F². Tutorial 4: C_pf = 0.0554, C_ma = 0.16, K_m = 1.22.',
          vars: [
            { id: 'ksMode', label: 'K_s rule', kind: 'choice', options: [{ label: 'Table 9-2 / K_s = 1 (course default)', value: 1 }, { label: 'Formula 1.192 (F√Y/P_nd)^0.0535 (Tutorial 4)', value: 2 }], default: 1 },
            { id: 'Ks', symbol: 'K_s', label: 'Size factor', kind: 'lookup', fig: 'cks', hint: 'auto = Table 9-2 or the formula with the pinion Lewis Y', auto: v => v.ksMode === 2 ? (has(v, 'F', 'NP', 'Pnd') && v.NP >= 12 ? Math.max(1, 1.192 * Math.pow(v.F * Math.sqrt(lewisY(v.NP)) / v.Pnd, 0.0535)) : undefined) : (has(v, 'Pd') ? KS(v.Pd) : undefined),
              work: v => v.ksMode === 2 && has(v, 'F', 'NP', 'Pnd') && v.NP >= 12 ? '\\(K_s = 1.192\\left(\\frac{' + f(v.F) + '\\sqrt{' + f(lewisY(v.NP), 3) + '}}{' + f(v.Pnd) + '}\\right)^{0.0535} = ' + f(Math.max(1, 1.192 * Math.pow(v.F * Math.sqrt(lewisY(v.NP)) / v.Pnd, 0.0535))) + '\\)' : null },
            { id: 'Cpf', symbol: 'C_{pf}', label: 'Pinion proportion factor', kind: 'lookup', fig: 'f9-12', digits: 4, auto: v => { if (!has(v, 'F', 'DP')) return undefined; const r = Math.max(v.F / (10 * v.DP), 0.05); return v.F < 1 ? r - 0.025 : r - 0.0375 + 0.0125 * v.F; },
              work: v => has(v, 'F', 'DP') ? '\\(C_{pf} = \\frac{' + f(v.F) + '}{10(' + f(v.DP) + ')}' + (v.F < 1 ? ' - 0.025' : ' - 0.0375 + 0.0125(' + f(v.F) + ')') + ' = ' + f(v.Cpf, 4) + '\\)' : null },
            { id: 'cond', label: 'Gearing condition (for C_ma)', kind: 'choice', type: 'text', options: [{ label: 'Open gearing', value: 'open' }, { label: 'Commercial enclosed gear units', value: 'commercial' }, { label: 'Precision enclosed gear units', value: 'precision' }, { label: 'Extra-precision enclosed gear units', value: 'extra' }], default: 'commercial' },
            { id: 'Cma', symbol: 'C_{ma}', label: 'Mesh alignment factor', kind: 'lookup', fig: 'f9-13', digits: 4, auto: v => { const k = CMA[v.cond]; return k && has(v, 'F') ? k[0] + k[1] * v.F + k[2] * v.F * v.F : undefined; },
              work: v => { const k = CMA[v.cond]; return k && has(v, 'F') ? '\\(C_{ma} = ' + k[0] + ' + ' + k[1] + '(' + f(v.F) + ') ' + (k[2] * 1e4).toFixed(3) + '\\times10^{-4}(' + f(v.F) + ')^2 = ' + f(v.Cma, 4) + '\\)' : null; } },
            { id: 'Km', symbol: 'K_m', label: 'Load-distribution factor', kind: 'calc', digits: 4, compute: v => has(v, 'Cpf', 'Cma') ? 1 + v.Cpf + v.Cma : undefined, work: v => v.Km !== undefined ? '\\(K_m = 1 + ' + f(v.Cpf, 4) + ' + ' + f(v.Cma, 4) + ' = ' + f(v.Km, 4) + '\\)' : null },
          ] },
        { id: 'kb', title: 'Rim thickness factor K_B', fig: ['f9-14'],
          formula: 'm_B = t_R/h_t,\\quad K_B = 1.6\\ln(2.242/m_B)\\ (m_B<1.2),\\ 1.0\\ (m_B\\ge1.2)',
          vars: [
            { id: 'tR', symbol: 't_R', label: 'Rim thickness (blank = solid)', unit: 'in', kind: 'input' },
            { id: 'ht', symbol: 'h_t', label: 'Whole depth 2.25/P_nd', unit: 'in', kind: 'calc', compute: v => has(v, 'Pnd') ? 2.25 / v.Pnd : undefined },
            { id: 'mB', symbol: 'm_B', label: 'Backup ratio', kind: 'calc', digits: 3, compute: v => has(v, 'tR', 'ht') ? v.tR / v.ht : undefined },
            { id: 'KB', symbol: 'K_B', label: 'Rim thickness factor', kind: 'lookup', fig: 'f9-14', auto: v => v.mB === undefined ? 1 : (v.mB < 1.2 ? 1.6 * Math.log(2.242 / v.mB) : 1) },
          ] },
      ] },

      { title: 'Stress numbers (Fizz step 13 → spur steps 32, 34)', steps: [
        { id: 'sb', title: 'Bending stress numbers', eq: '9-16',
          formula: 's_{tP} = \\frac{W_t P_d}{F J_P}K_o K_s K_m K_B K_v,\\qquad s_{tG} = s_{tP}\\frac{J_P}{J_G}',
          text: 'Use the TRANSVERSE diametral pitch P_d.',
          vars: [
            { id: 'stP', symbol: 's_{tP}', label: 'Pinion bending stress number', unit: 'psi', kind: 'calc', compute: v => has(v, 'Wt', 'Pd', 'F', 'JP', 'Ko', 'Ks', 'Km', 'KB', 'Kv') ? v.Wt * v.Pd / (v.F * v.JP) * v.Ko * v.Ks * v.Km * v.KB * v.Kv : undefined,
              work: v => v.stP !== undefined ? '\\(s_{tP} = \\frac{' + f(v.Wt) + '(' + f(v.Pd) + ')}{' + f(v.F) + '(' + f(v.JP, 3) + ')}(' + f(v.Ko) + ')(' + f(v.Ks) + ')(' + f(v.Km, 4) + ')(' + f(v.KB) + ')(' + f(v.Kv) + ') = ' + f(v.stP) + '\\ \\mathrm{psi}\\)' : null },
            { id: 'stG', symbol: 's_{tG}', label: 'Gear bending stress number', unit: 'psi', kind: 'calc', compute: v => has(v, 'stP', 'JP', 'JG') ? v.stP * v.JP / v.JG : undefined },
          ] },
        { id: 'sc', title: 'Contact stress number', eq: '9-23',
          formula: 's_c = C_p\\sqrt{\\frac{W_t K_o K_s K_m K_v}{F D_P I}}',
          vars: [
            { id: 'sc', symbol: 's_c', label: 'Contact stress number', unit: 'psi', kind: 'calc', compute: v => has(v, 'Cp', 'Wt', 'Ko', 'Ks', 'Km', 'Kv', 'F', 'DP', 'I') ? v.Cp * Math.sqrt(v.Wt * v.Ko * v.Ks * v.Km * v.Kv / (v.F * v.DP * v.I)) : undefined,
              work: v => v.sc !== undefined ? '\\(s_c = ' + f(v.Cp) + '\\sqrt{\\frac{' + f(v.Wt) + '(' + f(v.Ko) + ')(' + f(v.Ks) + ')(' + f(v.Km, 4) + ')(' + f(v.Kv) + ')}{' + f(v.F) + '(' + f(v.DP) + ')(' + f(v.I, 4) + ')}} = ' + f(v.sc) + '\\ \\mathrm{psi}\\)' : null },
          ] },
      ] },

      { title: 'Life, reliability, stress-cycle factors', steps: [
        { id: 'life', title: 'Service factor, reliability, design life, load cycles', eq: '9-27', fig: ['t9-11', 't9-12'],
          formula: 'N_c = n \\times 60 \\times \\tfrac{h}{day} \\times \\tfrac{days}{yr} \\times yr = 60\\,L\\,n\\,q',
          text: 'Course: solve for the minimum s_at/s_ac with SF = 1.00, then pick a steel giving 1.0 ≤ SF ≤ 1.5. 99 % → K_R = 1.00 (tutorials with 90 % use 0.85). AGMA strengths are at 10⁷ cycles — <b>leave the life blank to use 10⁷ (Y_N = Z_N = 1)</b>; otherwise give hours/day × days/yr × years or a life in hours (Table 9-12).',
          vars: [
            { id: 'SFd', symbol: 'SF', label: 'Service (design safety) factor', kind: 'input', default: 1, hint: '1.00 (course); target 1.0–1.5', check: v => v.SFd !== undefined && (v.SFd < 1 || v.SFd > 1.5) ? 'AGMA: 1.0–1.5' : null },
            { id: 'R', symbol: 'R', label: 'Reliability', kind: 'input', default: 0.99, hint: '0.99 (course default) · 0.90 · 0.999' },
            { id: 'KR', symbol: 'K_R', label: 'Reliability factor', kind: 'lookup', fig: 't9-11', digits: 3, hint: 'Table 9-11: 0.99 → 1.00, 0.90 → 0.85', auto: v => { if (!has(v, 'R')) return undefined; if (KR[v.R] !== undefined) return KR[v.R]; return v.R < 0.99 ? 0.658 - 0.0759 * Math.log(1 - v.R) : 0.5 - 0.109 * Math.log(1 - v.R); } },
            { id: 'hpd', symbol: 'h/day', label: 'Hours per day (optional)', unit: 'h', kind: 'input' },
            { id: 'dpy', symbol: 'days/yr', label: 'Days per year (optional)', unit: 'd', kind: 'input' },
            { id: 'yrs', symbol: 'yr', label: 'Years of service (optional)', unit: 'yr', kind: 'input' },
            { id: 'Lh', symbol: 'L', label: 'Design life (blank = 10⁷ cycles)', unit: 'h', kind: 'lookup', fig: 't9-12', hint: 'auto = h/day × days/yr × yr; blank → AGMA 10⁷ cycles', auto: v => has(v, 'hpd', 'dpy', 'yrs') ? v.hpd * v.dpy * v.yrs : undefined },
            { id: 'q', symbol: 'q', label: 'Load applications per revolution', kind: 'input', default: 1 },
            { id: 'NcP', symbol: 'N_{cP}', label: 'Pinion load cycles', kind: 'calc', digits: 4, compute: v => has(v, 'Lh', 'nP', 'q') ? 60 * v.Lh * v.nP * v.q : 1e7, work: v => has(v, 'Lh', 'nP', 'q') ? '\\(N_{cP} = 60(' + f(v.Lh) + ')(' + f(v.nP) + ')(' + f(v.q) + ') = ' + f(v.NcP) + '\\)' : 'no life given → AGMA reference 10⁷ cycles' },
            { id: 'NcG', symbol: 'N_{cG}', label: 'Gear load cycles', kind: 'calc', digits: 4, compute: v => has(v, 'Lh', 'nG', 'q') ? 60 * v.Lh * v.nG * v.q : 1e7 },
          ] },
        { id: 'yz', title: 'Stress cycle factors Y_N and Z_N', fig: ['cyn', 'czn', 'f9-21', 'f9-22'],
          formula: 'Y_N = 1.3558N_c^{-0.0178},\\qquad Z_N = 1.4488N_c^{-0.023}\\qquad(N_c\\ge10^7)',
          text: 'Course: beyond 10⁷ cycles use the upper line for normal commercial gears (auto); graph readings accepted.',
          vars: [
            { id: 'YNP', symbol: 'Y_{NP}', label: 'Y_N pinion', kind: 'lookup', fig: 'cyn', digits: 4, auto: v => !has(v, 'Lh') ? 1 : has(v, 'NcP') ? YN_auto(v.NcP) : undefined },
            { id: 'YNG', symbol: 'Y_{NG}', label: 'Y_N gear', kind: 'lookup', fig: 'cyn', digits: 4, auto: v => !has(v, 'Lh') ? 1 : has(v, 'NcG') ? YN_auto(v.NcG) : undefined },
            { id: 'ZNP', symbol: 'Z_{NP}', label: 'Z_N pinion', kind: 'lookup', fig: 'czn', digits: 4, auto: v => !has(v, 'Lh') ? 1 : has(v, 'NcP') ? ZN_auto(v.NcP) : undefined },
            { id: 'ZNG', symbol: 'Z_{NG}', label: 'Z_N gear', kind: 'lookup', fig: 'czn', digits: 4, auto: v => !has(v, 'Lh') ? 1 : has(v, 'NcG') ? ZN_auto(v.NcG) : undefined },
          ] },
      ] },

      { title: 'Required strength & hardness — material selection', steps: [
        { id: 'req', title: 'Required allowable stress numbers and Brinell hardness → pick a steel', eq: '9-30, 9-31', fig: ['f9-18', 'f9-19', 't9-8', 'app3a', 'app3b', 't9-9', 't9-10'],
          text: 'Course flow (Module 2 p22–27): minimum s_at / s_ac at SF = 1 (tutorial: 5.9 ksi and 66.2 ksi), then a Grade 1 steel from Table 9-8 / Appendix 3 with HB above the requirement, quoting HB and % elongation — tutorial: 4140 OQT1300 HB 235 → SF 1.58 (SF² = 2.50) or 4140 annealed HB 197 → 1.40. Enter the chosen HB below and confirm 1.0 ≤ SF ≤ 1.5.',
          formula: 's_{at} > s_t\\frac{K_R(SF)}{Y_N},\\quad s_{ac} > s_c\\frac{K_R(SF)}{Z_N};\\qquad HB = \\frac{s_{at}/1000-12.80}{0.0773},\\ HB = \\frac{s_{ac}/1000-29.10}{0.322}\\ (\\text{grade 1})',
          vars: [
            { id: 'grade', label: 'Steel grade', kind: 'choice', options: [{ label: 'Grade 1 (course default)', value: 1 }, { label: 'Grade 2', value: 2 }], default: 1 },
            { id: 'satP', symbol: 's_{at,P}', label: 'Required bending stress number, pinion', unit: 'psi', kind: 'calc', compute: v => has(v, 'stP', 'KR', 'SFd', 'YNP') ? v.stP * v.KR * v.SFd / v.YNP : undefined, work: v => v.satP !== undefined ? '\\(s_{at,P} = ' + f(v.stP) + '(' + f(v.KR, 3) + ')(' + f(v.SFd) + ')/' + f(v.YNP, 4) + ' = ' + f(v.satP) + '\\ \\mathrm{psi}\\)' : null },
            { id: 'satG', symbol: 's_{at,G}', label: 'Required bending stress number, gear', unit: 'psi', kind: 'calc', compute: v => has(v, 'stG', 'KR', 'SFd', 'YNG') ? v.stG * v.KR * v.SFd / v.YNG : undefined },
            { id: 'sacP', symbol: 's_{ac,P}', label: 'Required contact stress number, pinion', unit: 'psi', kind: 'calc', compute: v => has(v, 'sc', 'KR', 'SFd', 'ZNP') ? v.sc * v.KR * v.SFd / v.ZNP : undefined, work: v => v.sacP !== undefined ? '\\(s_{ac,P} = ' + f(v.sc) + '(' + f(v.KR, 3) + ')(' + f(v.SFd) + ')/' + f(v.ZNP, 4) + ' = ' + f(v.sacP) + '\\ \\mathrm{psi}\\)' : null },
            { id: 'sacG', symbol: 's_{ac,G}', label: 'Required contact stress number, gear', unit: 'psi', kind: 'calc', compute: v => has(v, 'sc', 'KR', 'SFd', 'ZNG') ? v.sc * v.KR * v.SFd / v.ZNG : undefined },
            { id: 'HBbP', symbol: 'HB_{bend,P}', label: 'Hardness for pinion bending', unit: 'HB', kind: 'calc', digits: 4, compute: v => has(v, 'satP', 'grade') ? Math.max(0, satHB(v.satP, v.grade)) : undefined },
            { id: 'HBbG', symbol: 'HB_{bend,G}', label: 'Hardness for gear bending', unit: 'HB', kind: 'calc', digits: 4, compute: v => has(v, 'satG', 'grade') ? Math.max(0, satHB(v.satG, v.grade)) : undefined },
            { id: 'HBcP', symbol: 'HB_{cont,P}', label: 'Hardness for pinion contact', unit: 'HB', kind: 'calc', digits: 4, compute: v => has(v, 'sacP', 'grade') ? Math.max(0, sacHB(v.sacP, v.grade)) : undefined, work: v => v.HBcP !== undefined ? '\\(HB = (' + f(v.sacP / 1000) + ' - ' + (v.grade === 2 ? '34.30)/0.349' : '29.10)/0.322') + ' = ' + f(sacHB(v.sacP, v.grade)) + '\\)' : null },
            { id: 'HBcG', symbol: 'HB_{cont,G}', label: 'Hardness for gear contact', unit: 'HB', kind: 'calc', digits: 4, compute: v => has(v, 'sacG', 'grade') ? Math.max(0, sacHB(v.sacG, v.grade)) : undefined },
            { id: 'HBreq', symbol: 'HB_{req}', label: 'REQUIRED hardness (largest)', unit: 'HB', kind: 'calc', digits: 4, compute: v => { const a = [v.HBbP, v.HBbG, v.HBcP, v.HBcG].filter(x => typeof x === 'number'); return a.length ? Math.max(...a) : undefined; } },
          ],
          after: v => v.HBreq === undefined ? '' : (v.HBreq > 400 ? okbad(false, 'Required ' + f(v.HBreq, 3) + ' HB > 400: through-hardening is not adequate. Specify flame/induction-hardened (s_ac 170–175 ksi) or carburized grade-1 steel (s_at 55, s_ac 180 ksi — Table 9-9; e.g. AISI 4320 SOQT 450, HRC 59 case), or enlarge the gears.') : okbad(true, 'Specify a through-hardened grade-' + v.grade + ' steel with HB ≥ ' + f(Math.ceil(v.HBreq), 3) + ' for pinion and gear (' + (v.HBcP >= v.HBbP ? 'pitting' : 'bending') + ' governs). Pick from Appendix 3 / Table 9-8 (e.g. 1045, 4140, 4340 Q&T)' + (v.HBreq < 180 ? ' — below the AGMA data range, any ≥ 180 HB steel is fine' : '') + '.')) },
      ] },

      { title: 'Check the chosen material — safety factors', steps: [
        { id: 'mat', title: 'Allowable stress numbers of the chosen material', fig: ['f9-18', 'f9-19', 't9-9', 't9-10'],
          text: 'Enter the Brinell hardness of the chosen through-hardened steel, or type s_at / s_ac directly (Table 9-9 case-hardened: carburized s_at = 55 000, s_ac = 180 000 psi).',
          vars: [
            { id: 'HBP', symbol: 'HB_P', label: 'Pinion hardness', unit: 'HB', kind: 'input' },
            { id: 'HBG', symbol: 'HB_G', label: 'Gear hardness', unit: 'HB', kind: 'input' },
            { id: 'satmP', symbol: 's_{at}', label: 'Allowable bending stress number, pinion', unit: 'psi', kind: 'lookup', fig: 'f9-18', auto: v => has(v, 'HBP', 'grade') ? satOf(v.HBP, v.grade) : undefined },
            { id: 'satmG', symbol: 's_{at}', label: 'Allowable bending stress number, gear', unit: 'psi', kind: 'lookup', fig: 'f9-18', auto: v => has(v, 'HBG', 'grade') ? satOf(v.HBG, v.grade) : undefined },
            { id: 'sacmP', symbol: 's_{ac}', label: 'Allowable contact stress number, pinion', unit: 'psi', kind: 'lookup', fig: 'f9-19', auto: v => has(v, 'HBP', 'grade') ? sacOf(v.HBP, v.grade) : undefined },
            { id: 'sacmG', symbol: 's_{ac}', label: 'Allowable contact stress number, gear', unit: 'psi', kind: 'lookup', fig: 'f9-19', auto: v => has(v, 'HBG', 'grade') ? sacOf(v.HBG, v.grade) : undefined },
          ] },
        { id: 'sf', title: 'Safety factors — PASS / FAIL', eq: '9-32, 9-33',
          formula: 'SF_{bend} = \\frac{s_{at}}{s_t}\\frac{Y_N}{K_R},\\qquad SF_{cont} = \\frac{s_{ac}}{s_c}\\frac{Z_N}{K_R}',
          vars: [
            { id: 'SFbP', symbol: 'SF_{bend,P}', label: 'Bending safety factor, pinion', kind: 'calc', digits: 3, compute: v => has(v, 'satmP', 'stP', 'YNP', 'KR') ? v.satmP / v.stP * v.YNP / v.KR : undefined, work: v => v.SFbP !== undefined ? '\\(SF = \\frac{' + f(v.satmP) + '}{' + f(v.stP) + '}\\cdot\\frac{' + f(v.YNP, 4) + '}{' + f(v.KR, 3) + '} = ' + f(v.SFbP, 3) + '\\)' : null },
            { id: 'SFbG', symbol: 'SF_{bend,G}', label: 'Bending safety factor, gear', kind: 'calc', digits: 3, compute: v => has(v, 'satmG', 'stG', 'YNG', 'KR') ? v.satmG / v.stG * v.YNG / v.KR : undefined },
            { id: 'SFcP', symbol: 'SF_{cont,P}', label: 'Contact safety factor, pinion', kind: 'calc', digits: 3, compute: v => has(v, 'sacmP', 'sc', 'ZNP', 'KR') ? v.sacmP / v.sc * v.ZNP / v.KR : undefined, work: v => v.SFcP !== undefined ? '\\(SF = \\frac{' + f(v.sacmP) + '}{' + f(v.sc) + '}\\cdot\\frac{' + f(v.ZNP, 4) + '}{' + f(v.KR, 3) + '} = ' + f(v.SFcP, 3) + '\\)' : null },
            { id: 'SFcG', symbol: 'SF_{cont,G}', label: 'Contact safety factor, gear', kind: 'calc', digits: 3, compute: v => has(v, 'sacmG', 'sc', 'ZNG', 'KR') ? v.sacmG / v.sc * v.ZNG / v.KR : undefined },
          ],
          after: v => {
            if (!has(v, 'SFbP', 'SFbG', 'SFcP', 'SFcG')) return '<i>Enter the chosen material hardness (or s_at / s_ac) to get the safety factors.</i>';
            const d = v.SFd || 1; const mn = Math.min(v.SFbP, v.SFbG, v.SFcP, v.SFcG);
            const txt = 'Bending SF: pinion ' + f(v.SFbP, 3) + ', gear ' + f(v.SFbG, 3) + '. Contact SF: pinion ' + f(v.SFcP, 3) + ', gear ' + f(v.SFcG, 3) + '. ';
            return mn >= d ? okbad(true, 'PASS — all safety factors ≥ ' + f(d) + '. ' + txt + (mn > 1.5 ? 'Minimum ' + f(mn, 3) + ' exceeds the AGMA 1.0–1.5 range: conservative design.' : 'Governing SF = ' + f(mn, 3) + '.')) : okbad(false, 'FAIL — minimum SF ' + f(mn, 3) + ' < ' + f(d) + '. ' + txt + 'Use a harder / case-hardened steel, widen F, or reduce P_nd.');
          } },
      ] },
    ],
  };
})();
