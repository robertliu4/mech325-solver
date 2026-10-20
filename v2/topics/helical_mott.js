/* Helical gears — Mott 6e (Sec. 8-7 geometry, 10-2 forces, 10-3/10-4 stresses). Merged Fizz + Mech-guide procedure.
 * Defaults follow the Fizz / Mech student guides (see TOPIC.assumptions), with the UBC MECH 325 course conventions noted where they differ (v2/COURSE_CONVENTIONS.md §6–8: Helical_Bevel_…_2025 slides, Module 2 p16–27, Gear Trains Tut 4).
 * Verified against: Gear Trains Tutorial 4 / Module 2 p16–27 with Mott factors (5 hp, 300 rpm, 16/48 T, P_nd = 6, ψ = 25°, F = 2, A_v = 11, J_P = 0.45,
 *   I = 0.199 (Table 10-1), K_s formula 1.088, R = 0.90, 10^8 cycles → P_d 5.438, D_P 2.942, v_t 231.1, W_t 714, K_v 1.206, K_m 1.214, s_t 6851 psi,
 *   s_c 71.7 ksi (course "71.0 with Mott I"), s_at,min 5962 psi (course 5947), s_ac,min 64.2 ksi; with I = 0.190 (Eq. 14-23) s_c 73.3 ksi, s_ac,min 65.7 ksi (course 66.2);
 *   HB 235 → SF 5.19 bending, 1.63 contact (course 1.58)).
 * Verified against: Gear Trains Tutorial 1 Q1 (P_nd = 6, ψ = 25°, 16/36 T → P_d 5.438, D_P 2.942, D_G 6.620, C 4.78 in).
 * Auto J (digitized Figs. 10-5/10-6/10-7): Mott Ex. 10-3 (24 T, 75-T mate, ψ 15°) → J_P 0.479 (book 0.48); lecture 20T/100T ψ 20° → 0.457×1.01, 0.549×0.935 (course 0.46×1.01, 0.55×0.935).
 * Defaults = Fizz/Mech guide assumptions (review 2026-10): P_nd 12, N_P 24, F = 2p_x, A_v 10, K_s Table 9-2, life 20 000 h when none given. */
(function () {
  const has = (v, ...ids) => H.has(v, ...ids);
  const f = (x, d) => H.fmt(x, d);
  const cosd = a => Math.cos(H.rad(a)), sind = a => Math.sin(H.rad(a)), tand = a => Math.tan(H.rad(a));
  const KO = { uniform: { uniform: 1.00, light: 1.25, moderate: 1.50, heavy: 1.75 }, light: { uniform: 1.20, light: 1.40, moderate: 1.75, heavy: 2.25 }, moderate: { uniform: 1.30, light: 1.70, moderate: 2.00, heavy: 2.75 } };
  const KS = Pd => Pd >= 5 ? 1.00 : Pd >= 4 ? 1.05 : Pd >= 3 ? 1.15 : Pd >= 2 ? 1.25 : 1.40;
  const CMA = { open: [0.247, 0.0167, -0.765e-4], commercial: [0.127, 0.0158, -1.093e-4], precision: [0.0675, 0.0128, -0.926e-4], extra: [0.0380, 0.0102, -0.822e-4] };
  const KR = { 0.9: 0.85, 0.99: 1.00, 0.999: 1.25, 0.9999: 1.50 };
  // Fig 9-21: 250 HB line below the knee (≈3×10⁶), upper "normal commercial" line above it. Fig 9-22: knee at 10⁷.
  const YN_auto = N => N >= 3e6 ? 1.3558 * Math.pow(N, -0.0178) : 4.9404 * Math.pow(Math.max(N, 1e3), -0.1045);
  const ZN_auto = N => N >= 1e7 ? 1.4488 * Math.pow(N, -0.023) : 2.466 * Math.pow(Math.max(N, 1e4), -0.056);
  const YNw = (sym, N) => '\\(' + sym + ' = ' + (N >= 3e6 ? '1.3558(' + f(N, 3) + ')^{-0.0178}' : '4.9404(' + f(N, 3) + ')^{-0.1045}') + ' = ' + f(YN_auto(N), 4) + '\\)';
  const ZNw = (sym, N) => '\\(' + sym + ' = ' + (N >= 1e7 ? '1.4488(' + f(N, 3) + ')^{-0.023}' : '2.466(' + f(N, 3) + ')^{-0.056}') + ' = ' + f(ZN_auto(N), 4) + '\\)';
  const AvT95 = vt => vt <= 800 ? 10 : vt <= 2000 ? 8 : vt <= 4000 ? 6 : 4;   // Table 9-5 by pitch-line speed
  const L_DEF = 20000;   // Table 9-12 "general industrial machines" — used when no life is given (guides; Mott Ex. 9-5)
  const okbad = (ok, txt) => '<span class="' + (ok ? 'result-ok' : 'result-bad') + '">' + txt + '</span>';
  // Shigley Table 14-2 Lewis Y (20° FD) — only for the optional K_s formula the course also accepts
  const Y_N = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 24, 26, 28, 30, 34, 38, 43, 50, 60, 75, 100, 150, 300, 400];
  const Y_V = [0.245, 0.261, 0.277, 0.29, 0.296, 0.303, 0.309, 0.314, 0.322, 0.328, 0.331, 0.337, 0.346, 0.353, 0.359, 0.371, 0.384, 0.397, 0.409, 0.422, 0.435, 0.447, 0.46, 0.472, 0.48];
  const lewisY = N => H.interp(N, Y_N, Y_V);
  const satHB = (s, g) => g === 2 ? (s / 1000 - 16.40) / 0.102 : (s / 1000 - 12.80) / 0.0773;
  const sacHB = (s, g) => g === 2 ? (s / 1000 - 34.30) / 0.349 : (s / 1000 - 29.10) / 0.322;
  const satOf = (HB, g) => (g === 2 ? 0.102 * HB + 16.40 : 0.0773 * HB + 12.80) * 1000;
  const sacOf = (HB, g) => (g === 2 ? 0.349 * HB + 34.30 : 0.322 * HB + 29.10) * 1000;
  // Figs 10-5 (φ_n 15°), 10-6 (20°), 10-7 (22°) digitized: (a) J′ for a 75-tooth mate, cols N = 20, 30, 60, 150, 500; (b) multiplier K, cols mate = 20, 30, 50, 75, 150, 500; rows ψ
  const PSI = [5.5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30, 32.5, 34.5];
  const JP_N = [20, 30, 60, 150, 500], KJ_N = [20, 30, 50, 75, 150, 500];
  const JCH = {
    15: { J: [[0.4018, 0.4766, 0.5632, 0.6391, 0.6796], [0.413, 0.4873, 0.5728, 0.6459, 0.6875], [0.4237, 0.4974, 0.5807, 0.651, 0.6915], [0.4299, 0.5013, 0.584, 0.6515, 0.692], [0.4339, 0.5019, 0.5846, 0.6476, 0.6903], [0.4344, 0.5008, 0.5807, 0.6403, 0.6841], [0.4333, 0.4963, 0.5728, 0.629, 0.6706], [0.4288, 0.4884, 0.5615, 0.6133, 0.6515], [0.422, 0.4783, 0.5475, 0.5947, 0.6296], [0.4142, 0.4642, 0.53, 0.5728, 0.6037], [0.4046, 0.4485, 0.5092, 0.5475, 0.5767], [0.3939, 0.4305, 0.4867, 0.5182, 0.5452], [0.3844, 0.4159, 0.4665, 0.4929, 0.5177]],
          K: [[0.8958, 0.9388, 0.9756, 1, 1.036, 1.0666], [0.8958, 0.9388, 0.975, 1, 1.0362, 1.0674], [0.8958, 0.9388, 0.9747, 1, 1.0362, 1.068], [0.8958, 0.939, 0.975, 1, 1.0362, 1.068], [0.8963, 0.9393, 0.975, 1, 1.0365, 1.0677], [0.8975, 0.9399, 0.975, 1, 1.0357, 1.0666], [0.8986, 0.9404, 0.9756, 1, 1.0351, 1.0654], [0.9003, 0.9416, 0.9761, 1, 1.034, 1.0638], [0.9022, 0.943, 0.977, 1, 1.0329, 1.061], [0.9042, 0.9444, 0.9784, 1, 1.0312, 1.0581], [0.9067, 0.9466, 0.9801, 1, 1.0284, 1.0542], [0.9101, 0.9486, 0.982, 1, 1.0253, 1.0486], [0.9129, 0.9506, 0.9837, 1, 1.0228, 1.0435]] },
    20: { J: [[0.4337, 0.4761, 0.5218, 0.5562, 0.5793], [0.445, 0.4862, 0.5314, 0.5652, 0.5872], [0.4546, 0.4953, 0.5387, 0.5726, 0.5935], [0.4608, 0.5003, 0.5427, 0.5765, 0.5951], [0.4625, 0.5003, 0.5427, 0.5754, 0.5929], [0.4614, 0.4986, 0.5387, 0.5709, 0.5872], [0.4569, 0.4924, 0.5314, 0.5624, 0.5777], [0.4501, 0.484, 0.5201, 0.5506, 0.5641], [0.4411, 0.4727, 0.5071, 0.5348, 0.5477], [0.4292, 0.4586, 0.4913, 0.5161, 0.5286], [0.4151, 0.4422, 0.4727, 0.4947, 0.506], [0.3999, 0.4247, 0.4518, 0.4699, 0.4812], [0.3858, 0.4078, 0.4326, 0.4479, 0.4586]],
          K: [[0.9283, 0.9521, 0.9801, 1, 1.0188, 1.0367], [0.9289, 0.9527, 0.9801, 1, 1.0188, 1.0361], [0.9295, 0.9541, 0.9804, 1, 1.0186, 1.0355], [0.93, 0.9549, 0.9804, 1, 1.0183, 1.0347], [0.9312, 0.9561, 0.9812, 1, 1.0183, 1.0335], [0.9323, 0.9572, 0.9815, 1, 1.0177, 1.0324], [0.9346, 0.9583, 0.9821, 1, 1.0174, 1.0318], [0.9363, 0.9597, 0.9826, 1, 1.0169, 1.0307], [0.9385, 0.9614, 0.9838, 1, 1.016, 1.029], [0.9413, 0.9634, 0.9843, 1, 1.0149, 1.0273], [0.9445, 0.9657, 0.9866, 1, 1.0137, 1.0259], [0.9487, 0.9682, 0.9883, 1, 1.0118, 1.0234], [0.9527, 0.9702, 0.99, 1, 1.0104, 1.0222]] },
    22: { J: [[0.4667, 0.5245, 0.5935, 0.6361, 0.6642], [0.479, 0.5368, 0.6058, 0.6502, 0.6777], [0.4908, 0.5486, 0.6159, 0.6614, 0.6878], [0.4987, 0.5559, 0.6215, 0.6659, 0.6911], [0.5031, 0.5593, 0.6232, 0.667, 0.6911], [0.5031, 0.5593, 0.621, 0.6636, 0.6883], [0.5009, 0.5559, 0.6159, 0.6558, 0.6805], [0.4964, 0.5486, 0.6064, 0.6457, 0.6687], [0.4897, 0.5385, 0.5918, 0.6294, 0.653], [0.4796, 0.5256, 0.5744, 0.6103, 0.6316], [0.4684, 0.5099, 0.5548, 0.5879, 0.607], [0.4554, 0.4925, 0.5318, 0.5609, 0.5778], [0.4442, 0.4756, 0.5104, 0.5363, 0.5514]],
          K: [[0.9443, 0.9613, 0.9853, 1, 1.0179, 1.032], [0.9443, 0.9618, 0.9851, 1, 1.0182, 1.032], [0.9443, 0.9624, 0.9851, 1, 1.0185, 1.0323], [0.9448, 0.963, 0.9856, 1, 1.0185, 1.0326], [0.9448, 0.9635, 0.9856, 1, 1.019, 1.0326], [0.946, 0.9641, 0.9856, 1, 1.019, 1.0326], [0.9471, 0.9652, 0.9862, 1, 1.019, 1.032], [0.9485, 0.9669, 0.9865, 1, 1.019, 1.0309], [0.9502, 0.9686, 0.987, 1, 1.0185, 1.0295], [0.9522, 0.9709, 0.9882, 1, 1.0176, 1.0281], [0.9545, 0.9732, 0.9899, 1, 1.0162, 1.0264], [0.9573, 0.9754, 0.9913, 1, 1.0148, 1.0241], [0.9601, 0.978, 0.993, 1, 1.0136, 1.0219]] } };
  // bilinear chart read: linear in ψ (clamped to the chart), linear in ln N (extrapolated below the lowest curve down to 12 T, clamped above the top curve)
  function chart2(NS, V, psi, N) {
    if (!(N > 0) || !(psi >= 0)) return undefined;
    const p = Math.min(Math.max(psi, PSI[0]), PSI[PSI.length - 1]);
    let i = PSI.length - 2; for (let k = 0; k < PSI.length - 1; k++) if (p <= PSI[k + 1]) { i = k; break; }
    const tp = (p - PSI[i]) / (PSI[i + 1] - PSI[i]);
    const n = Math.min(Math.max(N, 12), NS[NS.length - 1]);
    let j = NS.length - 2; for (let k = 0; k < NS.length - 1; k++) if (n <= NS[k + 1]) { j = k; break; }
    const tn = Math.log(n / NS[j]) / Math.log(NS[j + 1] / NS[j]);
    const at = r => V[r][j] + (V[r][j + 1] - V[r][j]) * tn;
    return at(i) + (at(i + 1) - at(i)) * tp;
  }
  const Jprime = (phin, psi, N) => JCH[phin] ? chart2(JP_N, JCH[phin].J, psi, N) : undefined;
  const Jmult = (phin, psi, Nm) => JCH[phin] ? chart2(KJ_N, JCH[phin].K, psi, Nm) : undefined;
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
    intro: 'Parallel-shaft helical gears in Mott notation. Same procedure as the spur-gear page — <b>only J and I change</b> (course): the <b>transverse</b> P_d = P_nd cos ψ goes in the bending equation and in D_P; J = K × J′ from Figs. 10-5/10-6/10-7 (by normal pressure angle, J′ for a 75-tooth mate times the multiplier for the actual mate — the course\'s "K_J′"); I from Tables 10-1/10-2 (ψ = 15° and 25°; Shigley Eq. 14-23 accepted as the alternative). <b>Defaults are the Fizz / Mech guide assumptions</b> (helical procedure = spur procedure with P_nd = 12 and N_P = 24 when nothing is given, F_nom = 2 p_x, only J and I changed) — see "Assumptions used" for each one with its page, and the course value where it differs. Step titles carry the guide step numbers (F = Fizz helical list, M = Mech helical list). The instructor set <b>ψ = 25°</b> in the tutorial "to use the charts in Mott" (≈ 15° is optimal). Example = Gear Trains Tutorial 4 (5 hp, 300 rpm, 16/48 T, P_nd = 6, ψ = 25°).',
    example: { P: 5, nP: 300, src: 'uniform', drv: 'uniform', Pnd: 6, psi: 25, phin: 20, NP: 16, NG: 48, F: 2, Av: 11, JpP: 0.47, KJP: 0.96, JpG: 0.54, KJG: 0.93, ksMode: 2, I: 0.199, cond: 'commercial', Cp: 2300, R: 0.9, Lh: 5555.56, q: 1, grade: 1, HBP: 235, HBG: 235, SFd: 1 },

    assumptions: [
      { text: 'US customary units (hp, lb, in, ft/min, rpm, psi; ksi inside the hardness equations)', src: 'Mech p.63, p.84' },
      { text: 'Shock classes as Mott lists them (uniform = electric motor, light = water turbine / variable-speed drive, moderate = multicylinder engine); K_o from Table 9-1 (default uniform → uniform, K_o = 1.00)', src: 'Fizz p.54 · Mech p.91', var: 'Ko', value: 1 },
      { text: 'Normal diametral pitch P_nd = 12 when the problem gives none ("the one textbook example used P_nd = 12 and N_P = 24 so let\'s just use those every single time")', src: 'Fizz p.54 · Mech p.92', var: 'Pnd', value: 12 },
      { text: 'Pinion teeth N_P = 24 when the problem gives none', src: 'Fizz p.54 · Mech p.92', var: 'NP', value: 24 },
      { text: 'Helix angle from the problem ("use the helix angle given in the question") — default 15° (Mott Ex. 10-3; course: ≈ 15° optimal, the tutorial uses 25° so the 15°/25° tables apply)', src: 'Mech p.92 · Helical/Bevel s7 (course)', var: 'psi', value: 15 },
      { text: 'Normal pressure angle φ_n = 20° unless stated (as for spur gears); J figure (10-5/10-6/10-7) and I table (10-1/10-2) are picked by φ_n', src: 'Fizz p.42, p.55 · Mech p.93', var: 'phin', value: 20 },
      { text: 'n_G given; otherwise choose it as in the spur procedure; N_G from VR = N_G/N_P = n_P/n_G', src: 'Fizz p.55 · Mech p.92', var: 'NG' },
      { text: 'Use the TRANSVERSE P_d = P_nd cos ψ for diameters, W_t and the bending equation ("the P_d we are using is not the normal one")', src: 'Mech p.61, p.92 · Helical/Bevel s6 (course)', var: 'Pd' },
      { text: 'Face width F_nom = 2 p_x, rounded to a convenient value; full helical action needs F/p_x > 2', src: 'Fizz p.53, p.55 · Mech p.67, p.92', var: 'F' },
      { text: 'All other factors as in the spur procedure: steel → C_p = 2300 √psi', src: 'Fizz p.55 · Mech p.93', var: 'Cp', value: 2300 },
      { text: 'A_v from Table 9-5 by application or speed — default A_v = 10 (Q_v 7); the course tutorial used A_v = 11 (Q_v 6)', src: 'Fizz p.41, p.55 · Mech p.77', var: 'Av', value: 10 },
      { text: 'K_v from Fig. 9-16 — auto = Table 9-6 equation of the same curves', src: 'Fizz p.41 · Mech p.78 · Gear Stress s14 (course)', var: 'Kv' },
      { text: 'J = J′ (75-tooth mate) × multiplier for the actual mate, from Fig. 10-5/10-6/10-7 by φ_n — auto = digitized charts', src: 'Fizz p.55–57 · Mech p.93–96 · Helical/Bevel s7 (course)', var: 'JP' },
      { text: 'I from Table 10-1 (φ_n 20°) / 10-2 (25°), ψ = 15° or 25° parts — auto interpolates in N_P, N_G and ψ; Shigley Eq. 14-23 is the course-accepted alternative (tutorial 0.199 vs 0.190)', src: 'Fizz p.57–58 · Mech p.97 · Helical/Bevel s10–13 (course)', var: 'I' },
      { text: 'K_s from Table 9-2 by P_d (1.00 for P_d ≥ 5 — course "typically K_s = 1"); the tutorial used the Lewis-Y formula (1.088), selectable', src: 'Fizz p.45 · Mech p.80 · Gear Stress s15 (course)', var: 'ksMode', value: 1 },
      { text: 'C_pf from the Fig. 9-12 equations; C_ma for commercial enclosed gear units; K_m = 1 + C_pf + C_ma', src: 'Fizz p.44–45 · Mech p.80 · Gear Stress s20 (course)', var: 'cond', value: 'commercial' },
      { text: 'K_B = 1.00 (solid blank)', src: 'Fizz p.45 · Mech p.81', var: 'KB', value: 1 },
      { text: 'Service factor SF = 1.00 when sizing, then a material giving 1.0 ≤ SF ≤ 1.5', src: 'Fizz p.45, p.48 · Mech p.82', var: 'SFd', value: 1 },
      { text: 'Reliability 99 % → K_R = 1.00', src: 'Fizz p.45–46 · Mech p.82', var: 'R', value: 0.99 },
      { text: 'Design life from the problem, otherwise Table 9-12 — blank uses 20 000 h (general industrial machines); q = 1 load per revolution', src: 'Fizz p.46 · Mech p.82', var: 'Lh', value: 20000 },
      { text: 'Y_N, Z_N from Figs. 9-21/9-22, upper "normal commercial gears" lines beyond the knee', src: 'Fizz p.46–47 · Mech p.83, p.90 · Gear Stress s37, s44 (course)', var: 'YNP' },
      { text: 'Grade 1 through-hardened steel; same material for pinion and gear (gear HB defaults to the pinion HB)', src: 'Fizz p.48 · Mech p.73, p.84', var: 'HBG' },
      { text: 'Steel from Appendix 3 (Appendix 5 carburized); required HB > 400 → flame/induction hardening or carburizing (Table 9-9)', src: 'Fizz p.48–51 · Mech p.84–87' },
    ],

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
      { id: 'f10-6', ref: 'Figure 10-6', title: 'Helical J for 20° normal pressure angle (+ multiplier)', src: 'figures/mott/fig10-6.png', page: 452, note: '(a) J′ vs helix angle ψ, curve = teeth of the gear wanted (75-tooth mate). (b) multiplier for the actual mating tooth count. J = J′ × K. Lecture (s7, read on this chart): 20T pinion / 100T gear at ψ = 20° → J_P = 0.46 × 1.01 = 0.47, J_G = 0.55 × 0.935 = 0.51 (Shigley Fig. 14-7 gives J′ = 0.505 for the pinion).' },
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
      { id: 't9-12', ref: 'Table 9-12', title: 'Recommended design life', src: 'figures/mott/table9-12.png', page: 411, note: 'Guides: take the life from this table when none is given — the calculator then uses 20 000 h (general industrial machines).' },
      { id: 'f9-21', ref: 'Figure 9-21', title: 'Bending stress cycle factor Y_N', src: 'figures/mott/fig9-21.png', page: 412 },
      { id: 'f9-22', ref: 'Figure 9-22', title: 'Pitting stress cycle factor Z_N', src: 'figures/mott/fig9-22.png', page: 412, note: 'Upper line 1.4488 N^-0.023 for normal commercial gears.' },
      { id: 'app3a', ref: 'Appendix 3', title: 'Design properties of carbon and alloy steels — s_u, s_y, % elongation, HB (1020 … 4150)', src: 'figures/mott/appendix3a.png', page: 804, note: 'Tutorial 4: 4140 OQT1300 HB 235 → SF 1.58; 4140 annealed HB 197 → 1.40.' },
      { id: 'app3b', ref: 'Appendix 3 (cont.)', title: 'Steels 4340 … 9255', src: 'figures/mott/appendix3b.png', page: 805 },
      { id: 'app5', ref: 'Appendix 5', title: 'Properties of carburized steels (core HB, case HRC)', src: 'figures/mott/appendix5.png', page: 808, note: 'Mech guide: "appendix 3 or 5 … we normally use Appendix 3".' },
      { id: 't9-4', ref: 'Table 9-4', book: 'course', title: 'Q_v ↔ A_v mapping (Table 9-4 on the course K_v slide)', src: 'figures/course/gear_kv_q_av_table.png', note: 'A_v = 17 − Q_v. Course prefers the Table 9-6 equation.' },
      // ---- course-only slides (v2/COURSE_CONVENTIONS.md §16) ----
      { id: 'cj', ref: 'Helical/Bevel s7', book: 'course', title: 'J = K_J′ × J′ — course explanation and worked numbers (20T/100T, ψ = 20°)', src: 'figures/course/helical_j_modifier_example.png', note: 'J_P = 0.46 × 1.01 = 0.47, J_G = 0.55 × 0.935 = 0.51. Mott Fig. 10-5/10-6 reads J′ = 0.46 vs Shigley Fig. 14-7 0.505 — either accepted. Tutorial: 16 T at ψ = 25° → J′ ≈ 0.47.' },
      { id: 'cko', ref: 'Gear Stress s12', book: 'course', title: 'Overload factor K_o — Shigley table and Mott Table 9-1 side by side', src: 'figures/course/ko_shigley_vs_mott.png', note: 'Either accepted; tutorials use K_o = 1.' },
      { id: 'cks', ref: 'Gear Stress s15', book: 'course', title: 'Size factor K_s: "Typically K_s = 1", Table 9-2 or the Lewis-Y formula', src: 'figures/course/gear_ks_course.png' },
      { id: 'ccma', ref: 'Gear Stress s20', book: 'course', title: 'C_ma — "default to curve 2 (commercial enclosed gear units)"', src: 'figures/course/gear_cma_curve2.png' },
      { id: 'cyn', ref: 'Gear Stress s37', book: 'course', title: 'Y_N — "use this line for normal commercial gears"', src: 'figures/course/gear_yn_course_line.png' },
      { id: 'czn', ref: 'Gear Stress s44', book: 'course', title: 'Z_N — normal commercial gears line', src: 'figures/course/gear_zn_course_line.png' },
      { id: 'cteeth', ref: 'Helical/Bevel s33', book: 'course', title: 'Standard gear teeth proportions and Lewis Y table', src: 'figures/course/standard_gear_teeth_table.png' },
      { id: 'gk-qv', ref: 'Gear Kinematics s42', book: 'course', title: 'AGMA quality number Q_v by accuracy level (minimal 4–5 … highest 14–15) and how it is produced', src: 'figures/course/gear_agma_quality_accuracy_levels.png', note: 'Gear_Kinematics_and_Forces_-2024.pdf slide 42. Use with the application table to pick Q_v / A_v.' },
      { id: 'm-t2-2', ref: 'Table 2-2', title: 'Hardness scales vs tensile strength (HB, HRB, HRC, ksi, MPa) with Figure 2-6 conversion chart', src: 'figures/mott/table2-2_fig2-6.png', page: 49, note: 'Helical/Bevel s38 (material review). s_u ≈ 0.50 HB ksi (Mott Eq. 2-8).' },
      { id: 'm-f2-12', ref: 'Figure 2-12', title: 'SAE/AISI steel designation system (alloy group, carbon content)', src: 'figures/mott/fig2-12.png', page: 61, note: 'Helical/Bevel s41.' },
      { id: 'm-t2-8', ref: 'Table 2-8', title: 'Alloy groups in the SAE numbering system', src: 'figures/mott/table2-8.png', page: 61, note: 'Helical/Bevel s44.' },
      { id: 'm-t2-9', ref: 'Table 2-9', title: 'Uses of some steels (1040 shafts/gears, 4140/4340/4640/8650 gears …)', src: 'figures/mott/table2-9.png', page: 63, note: 'Helical/Bevel s43.' },
      { id: 'm-f9-20', ref: 'Figure 9-20', title: 'Effective case depth h_e for carburized gears vs normal diametral pitch (normal / heavy case)', src: 'figures/mott/fig9-20.png', page: 409, note: 'Helical/Bevel s57 (case hardening): case depth typically 0.010–0.040 in.' },
      { id: 'gk-hand', ref: 'Gear Kinematics s12', book: 'course', title: 'Helical hand and thrust direction for parallel/crossed (right-angle) helical drives: which side the thrust bearing goes for RH/LH, driver and rotation', src: 'figures/course/gear_helical_hand_thrust_directions.png', note: 'Gear_Kinematics_and_Forces_-2024.pdf slide 12.' },
    ],

    sections: [
      { title: 'Inputs & design decisions (Fizz helical steps 1–5 · Mech helical steps 1–7)', steps: [
        { id: 'in', title: 'Power, speeds, overload factor (F1–2 · M1–3)', fig: ['cko', 't9-1'],
          text: 'Shock classes as for spur gears (Mott: uniform source = electric motor or constant-speed gas turbine; light shock = water turbine, variable-speed drive; moderate shock = multicylinder engine); K_o from Table 9-1 (course accepts Shigley\'s table too; tutorials use K_o = 1). US customary units throughout.',
          formula: 'P_{des} = K_o P,\\qquad VR = \\frac{n_P}{n_G} = \\frac{N_G}{N_P}',
          vars: [
            { id: 'P', symbol: 'P', label: 'Transmitted power', unit: 'hp', kind: 'input' },
            { id: 'nP', symbol: 'n_P', label: 'Pinion speed', unit: 'rpm', kind: 'input' },
            { id: 'nGd', symbol: 'n_{G,des}', label: 'Desired gear speed (blank if N_G given)', unit: 'rpm', kind: 'input' },
            { id: 'src', label: 'Power source', kind: 'choice', type: 'text', options: [{ label: 'Uniform (electric motor, constant-speed gas turbine)', value: 'uniform' }, { label: 'Light shock (water turbine, variable-speed drive)', value: 'light' }, { label: 'Moderate shock (multicylinder engine)', value: 'moderate' }], default: 'uniform' },
            { id: 'drv', label: 'Driven machine', kind: 'choice', type: 'text', options: [{ label: 'Uniform (continuous-duty generator, paper/film winders)', value: 'uniform' }, { label: 'Light shock (fans, low-speed centrifugal pumps, uniformly loaded conveyors)', value: 'light' }, { label: 'Moderate shock (machine tools, saws, mixers, heavy-duty conveyors)', value: 'moderate' }, { label: 'Heavy shock (crushers, punch presses, hammer mills)', value: 'heavy' }], default: 'uniform' },
            { id: 'Ko', symbol: 'K_o', label: 'Overload factor', kind: 'lookup', fig: 'cko', hint: 'auto from the two selects (Table 9-1)', auto: v => (KO[v.src] && KO[v.src][v.drv]) || undefined },
            { id: 'Pdes', symbol: 'P_{des}', label: 'Design power', unit: 'hp', kind: 'calc', compute: v => has(v, 'P', 'Ko') ? v.P * v.Ko : undefined },
            { id: 'VRd', symbol: 'VR_{des}', label: 'Desired velocity ratio', kind: 'calc', compute: v => has(v, 'nP', 'nGd') && v.nGd > 0 ? v.nP / v.nGd : undefined },
          ] },
        { id: 'tooth', title: 'Normal diametral pitch, helix angle, normal pressure angle, tooth numbers (F3, 5 · M4, 7)', fig: ['t8-3', 'f9-11'],
          text: 'Fizz step 3 / Mech step 4: "take a wild guess for P_nd and N_P — the textbook example used P_nd = 12 and N_P = 24, so use those every time." Helix angle from the problem (Mech: "use the helix angle given in the question") (15° is optimal; 15–30° typical). <b>Course note:</b> the instructor changed Shigley\'s 30° helix to ψ = 25° so that Mott\'s 15°/25° J and I charts/tables apply — expect 15° or 25°. Step 5: N_G = N_P·VR rounded.',
          vars: [
            { id: 'Pnd', symbol: 'P_{nd}', label: 'Normal diametral pitch', unit: 'teeth/in', kind: 'input', default: 12, hint: 'transverse P_d given instead? P_nd = P_d / cos ψ' },
            { id: 'psi', symbol: '\\psi', label: 'Helix angle', unit: '°', kind: 'input', default: 15, hint: '15° optimal; course tutorial uses 25°', check: v => v.psi !== undefined && (v.psi < 5 || v.psi > 45) ? 'helix angles are normally 10–30°' : (v.psi !== undefined && v.psi !== 15 && v.psi !== 25 ? 'Tables 10-1/10-2 only tabulate ψ = 15° and 25° — interpolate (auto) or use Shigley Eq. 14-23' : null) },
            { id: 'phin', symbol: '\\phi_n', label: 'Normal pressure angle', kind: 'choice', options: [{ label: '20° (Fig. 10-6, Table 10-1)', value: 20 }, { label: '15° (Fig. 10-5)', value: 15 }, { label: '22° (Fig. 10-7)', value: 22 }, { label: '25° (Table 10-2)', value: 25 }], default: 20 },
            { id: 'NP', symbol: 'N_P', label: 'Pinion teeth', kind: 'input', default: 24 },
            { id: 'NG', symbol: 'N_G', label: 'Gear teeth', kind: 'input', hint: 'auto = round(N_P·VR_des)', auto: v => has(v, 'NP', 'VRd') ? Math.round(v.NP * v.VRd) : undefined },
            { id: 'mG', symbol: 'VR = m_G', label: 'Actual velocity ratio', kind: 'calc', compute: v => has(v, 'NP', 'NG') ? v.NG / v.NP : undefined },
            { id: 'nG', symbol: 'n_G', label: 'Actual gear speed', unit: 'rpm', kind: 'calc', compute: v => has(v, 'nP', 'NP', 'NG') ? v.nP * v.NP / v.NG : undefined },
          ] },
      ] },

      { title: 'Helical geometry (Mech-guide spec question steps 1–6 · Fizz helical steps 4–9, Sec. 8-7)', steps: [
        { id: 'geo1', title: 'Transverse diametral pitch, circular pitches, axial pitch, transverse pressure angle (F4, 6 · M5–6, 8)', eq: '8-11 … 8-16',
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
        { id: 'geo2', title: 'Pitch diameters, centre distance, face width, number of axial pitches (F7–9 · M9–11)', fig: ['f8-21'],
          formula: 'D = \\frac{N}{P_d},\\quad C = \\frac{N_P+N_G}{2P_d},\\quad F_{nom} = 2p_x,\\quad \\frac{F}{p_x} > 2\\ (\\text{full helical action})',
          text: 'Use the TRANSVERSE P_d for diameters, not P_nd (Mech: "the P_d we are using is not the normal one"). Fizz step 8 / Mech step 10: F_nom = 2 p_x, "round it however you want so that the value is convenient"; full helical action when F/p_x > 2.',
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
        { id: 'force', title: 'Pitch line speed, tangential, radial, axial loads, torque (F9 · M11)', eq: '10-4 … 10-9', fig: ['f10-4', 'gk-hand'],
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

      { title: 'Stress-equation factors — as for spur gears except J and I (Fizz helical steps 10–12 · Mech helical steps 12–14)', steps: [
        { id: 'kv', title: 'Quality number A_v and dynamic factor K_v (F10 · M12)', fig: ['t9-4', 't9-5', 'f9-16', 't9-6', 'gk-qv'],
          formula: 'B = 0.25(A_v-5)^{0.667},\\quad C = 50+56(1-B),\\quad K_v = \\left[\\frac{C}{C+\\sqrt{v_t}}\\right]^{-B}',
          text: 'A_v from the problem, else Table 9-5 by application or pitch-line speed (spur step 16) — default A_v = 10. A Shigley Q_v maps to A_v = 17 − Q_v (Table 9-4). K_v: the guides read Fig. 9-16; the auto is the Table 9-6 equation of the same curves (course prefers it). Tutorial 4: Q_v = 6 = A_v 11, K_v = 1.21.',
          after: v => has(v, 'vt') ? 'Table 9-5 by pitch-line speed: v_t = ' + f(v.vt) + ' ft/min → A_v ' + AvT95(v.vt) + ' (Q_v ' + (17 - AvT95(v.vt)) + ').' : '',
          vars: [
            { id: 'Av', symbol: 'A_v', label: 'AGMA quality number (Shigley Q_v in brackets)', kind: 'choice', fig: 't9-4', options: [6, 7, 8, 9, 10, 11, 12].map(q => ({ label: 'A_v = ' + q + '  (Q_v = ' + (17 - q) + ')', value: q })), default: 10 },
            { id: 'Bv', symbol: 'B', label: 'B', kind: 'calc', digits: 4, compute: v => has(v, 'Av') ? 0.25 * Math.pow(v.Av - 5, 0.667) : undefined },
            { id: 'Cv', symbol: 'C', label: 'C', kind: 'calc', digits: 4, compute: v => has(v, 'Bv') ? 50 + 56 * (1 - v.Bv) : undefined },
            { id: 'Kv', symbol: 'K_v', label: 'Dynamic factor', kind: 'lookup', fig: 'f9-16', hint: 'auto = Table 9-6; or read Fig. 9-16', auto: v => has(v, 'Cv', 'Bv', 'vt') ? Math.pow(v.Cv / (v.Cv + Math.sqrt(v.vt)), -v.Bv) : undefined,
              work: v => has(v, 'Cv', 'Bv', 'vt') ? '\\(K_v = \\left[\\frac{' + f(v.Cv) + '}{' + f(v.Cv) + '+\\sqrt{' + f(v.vt) + '}}\\right]^{-' + f(v.Bv) + '} = ' + f(Math.pow(v.Cv / (v.Cv + Math.sqrt(v.vt)), -v.Bv)) + '\\)' : null },
            { id: 'vtmax', symbol: 'v_{t,max}', label: 'Max. pitch line speed for this A_v', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'Cv', 'Av') ? Math.pow(v.Cv + (14 - v.Av), 2) : undefined, check: v => has(v, 'vt', 'vtmax') && v.vt > v.vtmax ? 'v_t exceeds v_t,max — use a lower A_v' : null },
          ] },
        { id: 'km', title: 'Size factor K_s and load-distribution factor K_m (spur F20–23 · M17–18)', eq: '9-17', fig: ['cks', 't9-2', 'f9-12', 'ccma', 'f9-13'],
          formula: 'K_m = 1 + C_{pf} + C_{ma},\\qquad C_{pf} = \\frac{F}{10D_P} - 0.0375 + 0.0125F\\ (1\\le F<15)',
          text: 'K_s from Table 9-2 with the transverse P_d (1.00 for P_d ≥ 5 — course "typically K_s = 1"); the Shigley formula 1.192(F√Y/P_n)^0.0535 is the accepted alternative (Tutorial 4: 1.088 → 1.09). Use the transverse P_d for Table 9-2 and D_P for C_pf. Course default C_ma curve: commercial enclosed, C_ma = 0.127 + 0.0158F − 1.093×10⁻⁴F². Tutorial 4: C_pf = 0.0554, C_ma = 0.16, K_m = 1.22.',
          vars: [
            { id: 'ksMode', label: 'K_s rule', kind: 'choice', options: [{ label: 'Table 9-2 by P_d (guides: = 1 for P_d ≥ 5)', value: 1 }, { label: 'Formula 1.192 (F√Y/P_nd)^0.0535 (Tutorial 4)', value: 2 }], default: 1 },
            { id: 'Ks', symbol: 'K_s', label: 'Size factor', kind: 'lookup', fig: 'cks', hint: 'auto = Table 9-2 or the formula with the pinion Lewis Y', auto: v => v.ksMode === 2 ? (has(v, 'F', 'NP', 'Pnd') && v.NP >= 12 ? Math.max(1, 1.192 * Math.pow(v.F * Math.sqrt(lewisY(v.NP)) / v.Pnd, 0.0535)) : undefined) : (has(v, 'Pd') ? KS(v.Pd) : undefined),
              work: v => v.ksMode === 2 && has(v, 'F', 'NP', 'Pnd') && v.NP >= 12 ? '\\(K_s = 1.192\\left(\\frac{' + f(v.F) + '\\sqrt{' + f(lewisY(v.NP), 3) + '}}{' + f(v.Pnd) + '}\\right)^{0.0535} = ' + f(Math.max(1, 1.192 * Math.pow(v.F * Math.sqrt(lewisY(v.NP)) / v.Pnd, 0.0535))) + '\\)' : null },
            { id: 'Cpf', symbol: 'C_{pf}', label: 'Pinion proportion factor', kind: 'lookup', fig: 'f9-12', digits: 4, auto: v => { if (!has(v, 'F', 'DP')) return undefined; const r = Math.max(v.F / (10 * v.DP), 0.05); return v.F < 1 ? r - 0.025 : r - 0.0375 + 0.0125 * v.F; },
              work: v => has(v, 'F', 'DP') ? '\\(C_{pf} = \\frac{' + f(v.F) + '}{10(' + f(v.DP) + ')}' + (v.F < 1 ? ' - 0.025' : ' - 0.0375 + 0.0125(' + f(v.F) + ')') + ' = ' + f(v.Cpf, 4) + '\\)' : null },
            { id: 'cond', label: 'Gearing condition (for C_ma)', kind: 'choice', type: 'text', options: [{ label: 'Open gearing', value: 'open' }, { label: 'Commercial enclosed gear units', value: 'commercial' }, { label: 'Precision enclosed gear units', value: 'precision' }, { label: 'Extra-precision enclosed gear units', value: 'extra' }], default: 'commercial' },
            { id: 'Cma', symbol: 'C_{ma}', label: 'Mesh alignment factor', kind: 'lookup', fig: 'f9-13', digits: 4, auto: v => { const k = CMA[v.cond]; return k && has(v, 'F') ? k[0] + k[1] * v.F + k[2] * v.F * v.F : undefined; },
              work: v => { const k = CMA[v.cond]; return k && has(v, 'F') ? '\\(C_{ma} = ' + k[0] + ' + ' + k[1] + '(' + f(v.F) + ') ' + (k[2] * 1e4).toFixed(3) + '\\times10^{-4}(' + f(v.F) + ')^2 = ' + f(v.Cma, 4) + '\\)' : null; } },
            { id: 'Km', symbol: 'K_m', label: 'Load-distribution factor', kind: 'calc', digits: 4, compute: v => has(v, 'Cpf', 'Cma') ? 1 + v.Cpf + v.Cma : undefined, work: v => v.Km !== undefined ? '\\(K_m = 1 + ' + f(v.Cpf, 4) + ' + ' + f(v.Cma, 4) + ' = ' + f(v.Km, 4) + '\\)' : null },
          ] },
        { id: 'kb', title: 'Rim thickness factor K_B (spur F24 · M19)', fig: ['f9-14'],
          formula: 'm_B = t_R/h_t,\\quad K_B = 1.6\\ln(2.242/m_B)\\ (m_B<1.2),\\ 1.0\\ (m_B\\ge1.2)',
          text: 'Guides: "always 1.00 unless it isn\'t" — leave t_R blank for a solid blank.',
          vars: [
            { id: 'tR', symbol: 't_R', label: 'Rim thickness (blank = solid)', unit: 'in', kind: 'input' },
            { id: 'ht', symbol: 'h_t', label: 'Whole depth 2.25/P_nd', unit: 'in', kind: 'calc', compute: v => has(v, 'Pnd') ? 2.25 / v.Pnd : undefined },
            { id: 'mB', symbol: 'm_B', label: 'Backup ratio', kind: 'calc', digits: 3, compute: v => has(v, 'tR', 'ht') ? v.tR / v.ht : undefined },
            { id: 'KB', symbol: 'K_B', label: 'Rim thickness factor', kind: 'lookup', fig: 'f9-14', auto: v => v.mB === undefined ? 1 : (v.mB < 1.2 ? 1.6 * Math.log(2.242 / v.mB) : 1) },
          ] },
        { id: 'j', title: 'Helical bending geometry factors J = K_J′ × J′ (F11 · M13)', fig: ['cj', 'f10-5', 'f10-6', 'f10-7'],
          text: 'Pick the figure by NORMAL pressure angle (15° → Fig. 10-5, 20° → Fig. 10-6, 22° → Fig. 10-7). Part (a): x = ψ, curve = tooth number of the gear wanted (75-tooth mate). Part (b): multiplier K for the actual mating tooth count (1.0 at 75). J_P = J′(N_P) × K(N_G); J_G = J′(N_G) × K(N_P). Mott Ex. 10-3 reads J_P = 0.48 directly (24 T with 75-T gear). Auto values interpolate digitized copies of the chart for the selected φ_n (15°, 20°, 22°) in ψ and tooth count (extrapolated below 20 T) — compare with your own reading.',
          vars: [
            { id: 'JpP', symbol: 'J\'_P', label: 'J′ pinion (part a)', kind: 'lookup', fig: 'f10-6', digits: 3, hint: 'auto = digitized chart (x = ψ, curve N_P)', auto: v => has(v, 'NP', 'psi', 'phin') ? Jprime(v.phin, v.psi, v.NP) : undefined },
            { id: 'KJP', symbol: 'K_P', label: 'Multiplier for pinion (mate = N_G, part b)', kind: 'lookup', fig: 'f10-6', digits: 3, hint: 'auto = digitized chart (x = ψ, curve N_G)', auto: v => has(v, 'NG', 'psi', 'phin') ? Jmult(v.phin, v.psi, v.NG) : undefined },
            { id: 'JP', symbol: 'J_P', label: 'Geometry factor, pinion', kind: 'calc', digits: 3, compute: v => has(v, 'JpP', 'KJP') ? v.JpP * v.KJP : undefined, work: v => v.JP !== undefined ? '\\(J_P = ' + f(v.JpP, 3) + '\\times' + f(v.KJP, 3) + ' = ' + f(v.JP, 3) + '\\)' : null },
            { id: 'JpG', symbol: 'J\'_G', label: 'J′ gear (part a)', kind: 'lookup', fig: 'f10-6', digits: 3, hint: 'auto = digitized chart (x = ψ, curve N_G)', auto: v => has(v, 'NG', 'psi', 'phin') ? Jprime(v.phin, v.psi, v.NG) : undefined },
            { id: 'KJG', symbol: 'K_G', label: 'Multiplier for gear (mate = N_P, part b)', kind: 'lookup', fig: 'f10-6', digits: 3, hint: 'auto = digitized chart (x = ψ, curve N_P)', auto: v => has(v, 'NP', 'psi', 'phin') ? Jmult(v.phin, v.psi, v.NP) : undefined },
            { id: 'JG', symbol: 'J_G', label: 'Geometry factor, gear', kind: 'calc', digits: 3, compute: v => has(v, 'JpG', 'KJG') ? v.JpG * v.KJG : undefined, work: v => v.JG !== undefined ? '\\(J_G = ' + f(v.JpG, 3) + '\\times' + f(v.KJG, 3) + ' = ' + f(v.JG, 3) + '\\)' : null },
          ] },
        { id: 'i', title: 'Pitting geometry factor I and elastic coefficient C_p (F12 · M14)', fig: ['t10-1', 't10-2', 't9-7'],
          text: 'Table 10-1 for φ_n = 20°, Table 10-2 for 25°; each has parts for ψ = 15° and 25°. Enter with gear teeth (row) and pinion teeth (column), interpolate. The auto value interpolates the table in N_P, N_G and ψ (15°–25°). Course: Shigley Eq. 14-23 is the accepted alternative (tutorial: 0.199 Mott vs 0.190 Shigley for 16/48 T, ψ = 25°). C_p = 2300 for steel/steel (course standard).',
          vars: [
            { id: 'I', symbol: 'I', label: 'Pitting geometry factor', kind: 'lookup', fig: 't10-1', digits: 4, hint: 'auto = interpolated Table 10-1/10-2; Shigley Eq. 14-23 also accepted', auto: v => has(v, 'phin', 'psi', 'NP', 'NG') ? Iauto(v.phin, v.psi, v.NP, v.NG) : undefined,
              check: v => v.psi !== undefined && (v.psi < 15 || v.psi > 25) ? 'ψ outside the 15°–25° table range — use the nearer table part' : null },
            { id: 'Cp', symbol: 'C_p', label: 'Elastic coefficient', unit: '√psi', kind: 'lookup', fig: 't9-7', default: 2300, hint: '2300 steel/steel (guides; course standard)', check: v => v.Cp !== undefined && Math.abs(v.Cp - 2300) > 1 ? 'guides/course use 2300 √psi for steel on steel' : null },
          ] },
      ] },

      { title: 'Stress numbers (Fizz helical step 13 → spur steps 32, 34 · Mech helical step 12)', steps: [
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

      { title: 'Life, reliability, stress-cycle factors (spur Fizz steps 25–31 · Mech steps 21, 29)', steps: [
        { id: 'life', title: 'Service factor, reliability, design life, load cycles (spur F25–29)', eq: '9-27', fig: ['t9-11', 't9-12'],
          formula: 'N_c = n \\times 60 \\times \\tfrac{h}{day} \\times \\tfrac{days}{yr} \\times yr = 60\\,L\\,n\\,q',
          text: 'Guides: SF "usually 1.00" to find the minimum s_at/s_ac, then pick a steel giving 1.0 ≤ SF ≤ 1.5; "assume 99 %" → K_R = 1.00 (tutorials with 90 % use 0.85). Life from the problem (hours/day × days/yr × years, or hours), otherwise Table 9-12 — <b>blank uses 20 000 h</b> (general industrial machines). AGMA strengths are for 10⁷ cycles (Y_N = Z_N = 1): for exactly 10⁷ cycles enter L = 10⁷/(60 n_P).',
          vars: [
            { id: 'SFd', symbol: 'SF', label: 'Service (design safety) factor', kind: 'input', default: 1, hint: '1.00 (guides); target 1.0–1.5', check: v => v.SFd !== undefined && (v.SFd < 1 || v.SFd > 1.5) ? 'guides/AGMA: 1.0–1.5' : null },
            { id: 'R', symbol: 'R', label: 'Reliability', kind: 'input', default: 0.99, hint: '0.99 (guides) · 0.90 · 0.999' },
            { id: 'KR', symbol: 'K_R', label: 'Reliability factor', kind: 'lookup', fig: 't9-11', digits: 3, hint: 'Table 9-11: 0.99 → 1.00, 0.90 → 0.85', auto: v => { if (!has(v, 'R')) return undefined; if (KR[v.R] !== undefined) return KR[v.R]; return v.R < 0.99 ? 0.658 - 0.0759 * Math.log(1 - v.R) : 0.5 - 0.109 * Math.log(1 - v.R); } },
            { id: 'hpd', symbol: 'h/day', label: 'Hours per day (optional)', unit: 'h', kind: 'input' },
            { id: 'dpy', symbol: 'days/yr', label: 'Days per year (optional)', unit: 'd', kind: 'input' },
            { id: 'yrs', symbol: 'yr', label: 'Years of service (optional)', unit: 'yr', kind: 'input' },
            { id: 'Lh', symbol: 'L', label: 'Design life', unit: 'h', kind: 'lookup', fig: 't9-12', hint: 'auto = h/day × days/yr × yr if given, else 20 000 h (Table 9-12)', auto: v => has(v, 'hpd', 'dpy', 'yrs') ? v.hpd * v.dpy * v.yrs : L_DEF },
            { id: 'q', symbol: 'q', label: 'Load applications per revolution', kind: 'input', default: 1 },
            { id: 'NcP', symbol: 'N_{cP}', label: 'Pinion load cycles', kind: 'calc', digits: 4, compute: v => has(v, 'Lh', 'nP', 'q') ? 60 * v.Lh * v.nP * v.q : undefined, work: v => v.NcP !== undefined ? '\\(N_{cP} = 60(' + f(v.Lh) + ')(' + f(v.nP) + ')(' + f(v.q) + ') = ' + f(v.NcP) + '\\)' : null },
            { id: 'NcG', symbol: 'N_{cG}', label: 'Gear load cycles', kind: 'calc', digits: 4, compute: v => has(v, 'Lh', 'nG', 'q') ? 60 * v.Lh * v.nG * v.q : undefined },
          ] },
        { id: 'yz', title: 'Stress cycle factors Y_N and Z_N (spur F30–31)', fig: ['cyn', 'czn', 'f9-21', 'f9-22'],
          formula: 'Y_N = 1.3558N_c^{-0.0178}\\ (N_c\\ge3\\times10^6),\\qquad Z_N = 1.4488N_c^{-0.023}\\ (N_c\\ge10^7)',
          text: 'Read Figs. 9-21/9-22; the auto uses the equations printed on the charts — beyond the knee the upper line for normal commercial gears (course), below it the 250 HB line and 2.466 N^-0.056. Graph readings accepted.',
          vars: [
            { id: 'YNP', symbol: 'Y_{NP}', label: 'Y_N pinion', kind: 'lookup', fig: 'cyn', digits: 4, auto: v => has(v, 'NcP') ? YN_auto(v.NcP) : undefined, work: v => has(v, 'NcP') ? YNw('Y_{NP}', v.NcP) : null },
            { id: 'YNG', symbol: 'Y_{NG}', label: 'Y_N gear', kind: 'lookup', fig: 'cyn', digits: 4, auto: v => has(v, 'NcG') ? YN_auto(v.NcG) : undefined, work: v => has(v, 'NcG') ? YNw('Y_{NG}', v.NcG) : null },
            { id: 'ZNP', symbol: 'Z_{NP}', label: 'Z_N pinion', kind: 'lookup', fig: 'czn', digits: 4, auto: v => has(v, 'NcP') ? ZN_auto(v.NcP) : undefined, work: v => has(v, 'NcP') ? ZNw('Z_{NP}', v.NcP) : null },
            { id: 'ZNG', symbol: 'Z_{NG}', label: 'Z_N gear', kind: 'lookup', fig: 'czn', digits: 4, auto: v => has(v, 'NcG') ? ZN_auto(v.NcG) : undefined, work: v => has(v, 'NcG') ? ZNw('Z_{NG}', v.NcG) : null },
          ] },
      ] },

      { title: 'Required strength & hardness — material selection (spur Fizz steps 33, 35, 37–38, 40)', steps: [
        { id: 'req', title: 'Required allowable stress numbers and Brinell hardness → pick a steel (spur F33–38)', eq: '9-30, 9-31', fig: ['f9-18', 'f9-19', 't9-8', 'app3a', 'app3b', 'app5', 't9-9', 't9-10', 'm-t2-2', 'm-t2-9', 'm-t2-8', 'm-f2-12'],
          text: 'Course flow (Module 2 p22–27): minimum s_at / s_ac at SF = 1 (tutorial: 5.9 ksi and 66.2 ksi), then a Grade 1 steel from Table 9-8 / Appendix 3 with HB above the requirement, quoting HB and % elongation — tutorial: 4140 OQT1300 HB 235 → SF 1.58 (SF² = 2.50) or 4140 annealed HB 197 → 1.40. Enter the chosen HB below and confirm 1.0 ≤ SF ≤ 1.5.',
          formula: 's_{at} > s_t\\frac{K_R(SF)}{Y_N},\\quad s_{ac} > s_c\\frac{K_R(SF)}{Z_N};\\qquad HB = \\frac{s_{at}/1000-12.80}{0.0773},\\ HB = \\frac{s_{ac}/1000-29.10}{0.322}\\ (\\text{grade 1})',
          vars: [
            { id: 'grade', label: 'Steel grade', kind: 'choice', options: [{ label: 'Grade 1 (guides and course default)', value: 1 }, { label: 'Grade 2', value: 2 }], default: 1 },
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

      { title: 'Check the chosen material — safety factors (spur Fizz step 36)', steps: [
        { id: 'mat', title: 'Allowable stress numbers of the chosen material', fig: ['f9-18', 'f9-19', 'app3a', 'app3b', 'app5', 't9-9', 't9-10', 'm-f9-20'],
          text: 'Enter the Brinell hardness of the chosen through-hardened steel, or type s_at / s_ac directly (Table 9-9 case-hardened: carburized s_at = 55 000, s_ac = 180 000 psi).',
          vars: [
            { id: 'HBP', symbol: 'HB_P', label: 'Pinion hardness', unit: 'HB', kind: 'input' },
            { id: 'HBG', symbol: 'HB_G', label: 'Gear hardness', unit: 'HB', kind: 'input', hint: 'auto = pinion HB (guides: same material for both)', auto: v => v.HBP },
            { id: 'satmP', symbol: 's_{at}', label: 'Allowable bending stress number, pinion', unit: 'psi', kind: 'lookup', fig: 'f9-18', auto: v => has(v, 'HBP', 'grade') ? satOf(v.HBP, v.grade) : undefined },
            { id: 'satmG', symbol: 's_{at}', label: 'Allowable bending stress number, gear', unit: 'psi', kind: 'lookup', fig: 'f9-18', auto: v => has(v, 'HBG', 'grade') ? satOf(v.HBG, v.grade) : undefined },
            { id: 'sacmP', symbol: 's_{ac}', label: 'Allowable contact stress number, pinion', unit: 'psi', kind: 'lookup', fig: 'f9-19', auto: v => has(v, 'HBP', 'grade') ? sacOf(v.HBP, v.grade) : undefined },
            { id: 'sacmG', symbol: 's_{ac}', label: 'Allowable contact stress number, gear', unit: 'psi', kind: 'lookup', fig: 'f9-19', auto: v => has(v, 'HBG', 'grade') ? sacOf(v.HBG, v.grade) : undefined },
          ] },
        { id: 'sf', title: 'Safety factors — PASS / FAIL', eq: '9-32, 9-33',
          formula: 'SF_{bend} = \\frac{s_{at}}{s_t}\\frac{Y_N}{K_R},\\qquad SF_{cont} = \\frac{s_{ac}}{s_c}\\frac{Z_N}{K_R}',
          text: 'Fizz step 36: verify 1.0 < SF < 1.5. The contact SF uses Z_N (Mott Eq. 9-33 and Fizz p.48 print Y_N — a typo; Mech p.91 has Z_N).',
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
