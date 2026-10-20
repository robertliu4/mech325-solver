/* Helical gears — Shigley 11e (Sec. 13-10 geometry, 13-15 forces, Ch. 14 AGMA with helical J and I). Merged Fizz + Mech-guide procedure.
 * Defaults follow the Fizz / Mech student guides (see TOPIC.assumptions), with the UBC MECH 325 course conventions noted where they differ (v2/COURSE_CONVENTIONS.md §6–8: Helical_Bevel_…_2025 slides s2–s13, Module 2 p16–27, Gear Trains Tut 4).
 * Verified against: Gear Trains Tutorial 4 / Module 2 p16–27 (Shigley 14-22 mod.: 5 hp, 300 rpm, 16/48 T, P_n = 6, ψ = 25°, F = 2, Q_v = 6, K_s formula,
 *   J' = 0.47 × K_J' 0.96, R = 0.90, 10^8 cycles → P_t 5.438, d_P 2.942, V 231.1, W_t 714, K_v 1.206, K_s 1.088, K_m 1.214, J 0.451, σ 6850 psi,
 *   S_t,min (SF = 1) 5961 psi (course 5947), I 0.1909 (course 0.190), σ_c 73.2 ksi (course ≈ 74.0), S_c,min 65.6 ksi (course 66.2), 200 HB → S_F 4.74 (4.8), S_H 1.43 (1.41)).
 * Verified against: Gear Trains Tutorial 1 Q1 / Module 2 p1–3 (P_n = 6, ψ = 25°, 16/36 T → P_t 5.438, d_4 2.942, d_5 6.620, C 4.78 in).
 * Auto J′/K_J′ (digitized Figs. 14-7/14-8): 16 T, ψ 25° → J′ 0.468 (tutorial 0.47); lecture 20T/100T, ψ 20° → J′ 0.505 (course: Shigley 0.505), K 1.01, gear K 0.933 (0.935).
 * Defaults = Fizz/Mech guide assumptions (review 2026-10): P_n 12, N_P 24, F = 2p_x, Q_v 7, K_s Mott Table 9-2, life 20 000 h when none given. */
(function () {
  const has = (v, ...ids) => H.has(v, ...ids);
  const f = (x, d) => H.fmt(x, d);
  const cosd = a => Math.cos(H.rad(a)), sind = a => Math.sin(H.rad(a)), tand = a => Math.tan(H.rad(a));
  const Y_N = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 24, 26, 28, 30, 34, 38, 43, 50, 60, 75, 100, 150, 300, 400];
  const Y_V = [0.245, 0.261, 0.277, 0.29, 0.296, 0.303, 0.309, 0.314, 0.322, 0.328, 0.331, 0.337, 0.346, 0.353, 0.359, 0.371, 0.384, 0.397, 0.409, 0.422, 0.435, 0.447, 0.46, 0.472, 0.48];
  const lewisY = N => H.interp(N, Y_N, Y_V);
  // Fig 14-7 (J′, 20° normal, 75-tooth mate) and Fig 14-8 (multiplier for the actual mate) digitized: rows = helix angle ψ, cols = teeth
  const PSI = [5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30, 32.5, 34.5];
  const JP_N = [20, 30, 60, 150, 500];
  const JP_V = [[0.4693, 0.5255, 0.5831, 0.6251, 0.6506], [0.4848, 0.5385, 0.5974, 0.6398, 0.6645], [0.4952, 0.5463, 0.6065, 0.6498, 0.6745], [0.5022, 0.5515, 0.6121, 0.6554, 0.6805], [0.5061, 0.5541, 0.6147, 0.6554, 0.6818], [0.5074, 0.5545, 0.6121, 0.6511, 0.6779], [0.5048, 0.5506, 0.6043, 0.6411, 0.6667], [0.4996, 0.5433, 0.5922, 0.6273, 0.6506], [0.4905, 0.532, 0.5766, 0.6091, 0.6303], [0.4788, 0.5177, 0.558, 0.5879, 0.6074], [0.4645, 0.5, 0.5364, 0.5632, 0.581], [0.4485, 0.4805, 0.5121, 0.5355, 0.5511], [0.4355, 0.4641, 0.4896, 0.5113, 0.5225]];
  const KJ_N = [20, 30, 50, 75, 150, 500];
  const KJ_V = [[0.9285, 0.953, 0.9809, 1, 1.021, 1.0382], [0.9285, 0.9536, 0.9811, 1, 1.0208, 1.0376], [0.929, 0.9545, 0.9811, 1, 1.0206, 1.0369], [0.9296, 0.9554, 0.9815, 1, 1.0202, 1.0361], [0.9305, 0.9564, 0.9818, 1, 1.0197, 1.0352], [0.9318, 0.9575, 0.9824, 1, 1.0193, 1.0343], [0.9335, 0.9588, 0.9828, 1, 1.0187, 1.033], [0.9354, 0.9601, 0.9837, 1, 1.018, 1.0318], [0.9378, 0.9618, 0.9845, 1, 1.0172, 1.0303], [0.9408, 0.9635, 0.9854, 1, 1.0161, 1.0283], [0.9442, 0.9657, 0.9869, 1, 1.0148, 1.0262], [0.9483, 0.9687, 0.9888, 1, 1.0131, 1.0236], [0.9524, 0.9721, 0.9914, 1, 1.0112, 1.021]];
  // bilinear chart read: linear in ψ (clamped 5–34.5°), linear in ln N (extrapolated below the lowest curve down to 12 T — the tutorial's 16 T case — clamped above the top curve)
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
  // Mott Tables 10-1 (20° normal) / 10-2 (25° normal): I for ψ = 15° and 25° — what both guides read (shown as a hint under the I step)
  const TAB = {
    20: { 15: { P: [17, 21, 26, 35, 55], G: [17, 21, 26, 35, 55, 135], V: [[0.124], [0.139, 0.128], [0.154, 0.143, 0.132], [0.175, 0.165, 0.154, 0.137], [0.204, 0.196, 0.187, 0.171, 0.143], [0.244, 0.241, 0.237, 0.229, 0.209]] },
          25: { P: [14, 17, 21, 26, 35, 55], G: [14, 17, 21, 26, 35, 55, 135], V: [[0.123], [0.137, 0.126], [0.152, 0.142, 0.130], [0.167, 0.157, 0.146, 0.134], [0.187, 0.178, 0.168, 0.156, 0.138], [0.213, 0.207, 0.199, 0.189, 0.173, 0.144], [0.248, 0.247, 0.244, 0.239, 0.230, 0.210]] } },
    25: { 15: { P: [14, 17, 21, 26, 35, 55], G: [14, 17, 21, 26, 35, 55, 135], V: [[0.130], [0.144, 0.133], [0.160, 0.149, 0.137], [0.175, 0.165, 0.153, 0.140], [0.195, 0.186, 0.175, 0.163, 0.143], [0.222, 0.215, 0.206, 0.195, 0.178, 0.148], [0.257, 0.255, 0.251, 0.246, 0.236, 0.214]] },
          25: { P: [12, 14, 17, 21, 26, 35, 55], G: [12, 14, 17, 21, 26, 35, 55, 135], V: [[0.129], [0.141, 0.132], [0.155, 0.146, 0.135], [0.170, 0.162, 0.151, 0.138], [0.185, 0.177, 0.166, 0.154, 0.141], [0.203, 0.197, 0.188, 0.176, 0.163, 0.144], [0.227, 0.223, 0.216, 0.207, 0.196, 0.178, 0.148], [0.259, 0.258, 0.255, 0.251, 0.246, 0.235, 0.213]] } } };
  function tabI(T, NP, NG) {
    const cell = (gi, pi) => (T.V[gi] && T.V[gi][pi] !== undefined) ? T.V[gi][pi] : undefined;
    const colAt = (gi, N) => { const P = T.P; if (N <= P[0]) return cell(gi, 0);
      for (let i = 1; i < P.length; i++) if (N <= P[i]) { const a = cell(gi, i - 1), b = cell(gi, i); if (a === undefined) return undefined; if (b === undefined) return a; return a + (b - a) * (N - P[i - 1]) / (P[i] - P[i - 1]); }
      return cell(gi, P.length - 1); };
    const G = T.G; let gi = G.findIndex(g => NG <= g); if (gi < 0) gi = G.length - 1;
    if (gi === 0) return colAt(0, NP);
    const a = colAt(gi - 1, NP), b = colAt(gi, NP); if (a === undefined || b === undefined) return b !== undefined ? b : undefined;
    return a + (b - a) * (NG - G[gi - 1]) / (G[gi] - G[gi - 1]);
  }
  function IMott(phin, psi, NP, NG) {
    const t = TAB[phin]; if (!t || !(NP > 0 && NG >= NP)) return undefined;
    const i15 = tabI(t[15], NP, NG), i25 = tabI(t[25], NP, NG); if (i15 === undefined || i25 === undefined) return undefined;
    const w = Math.min(1, Math.max(0, (psi - 15) / 10)); return i15 + (i25 - i15) * w;
  }
  const KS92 = Pd => Pd >= 5 ? 1.00 : Pd >= 4 ? 1.05 : Pd >= 3 ? 1.15 : Pd >= 2 ? 1.25 : 1.40;   // Mott Table 9-2 (the guides' K_s)
  const AvT95 = V => V <= 800 ? 10 : V <= 2000 ? 8 : V <= 4000 ? 6 : 4;                         // Mott Table 9-5 by pitch-line speed (A_v = 17 − Q_v)
  const L_DEF = 20000;   // Mott Table 9-12 "general industrial machines" — used when no life is given (guides)
  const CMA = { open: [0.247, 0.0167, -0.765e-4], commercial: [0.127, 0.0158, -0.930e-4], precision: [0.0675, 0.0128, -0.926e-4], extra: [0.00360, 0.0102, -0.822e-4] };
  const KO = { uniform: { uniform: 1.00, moderate: 1.25, heavy: 1.75 }, light: { uniform: 1.25, moderate: 1.50, heavy: 2.00 }, medium: { uniform: 1.50, moderate: 1.75, heavy: 2.25 } };
  const KR = { 0.5: 0.70, 0.9: 0.85, 0.99: 1.00, 0.999: 1.25, 0.9999: 1.50 };
  // Fig 14-14: 250 HB line below the knee (≈3×10⁶), upper "normal commercial" line above it. Fig 14-15: knee at 10⁷.
  const YN_auto = N => N >= 3e6 ? 1.3558 * Math.pow(N, -0.0178) : 4.9404 * Math.pow(Math.max(N, 1e3), -0.1045);
  const ZN_auto = N => N >= 1e7 ? 1.4488 * Math.pow(N, -0.023) : 2.466 * Math.pow(Math.max(N, 1e4), -0.056);
  const YNw = (sym, N) => '\\(' + sym + ' = ' + (N >= 3e6 ? '1.3558(' + f(N, 3) + ')^{-0.0178}' : '4.9404(' + f(N, 3) + ')^{-0.1045}') + ' = ' + f(YN_auto(N), 4) + '\\)';
  const ZNw = (sym, N) => '\\(' + sym + ' = ' + (N >= 1e7 ? '1.4488(' + f(N, 3) + ')^{-0.023}' : '2.466(' + f(N, 3) + ')^{-0.056}') + ' = ' + f(ZN_auto(N), 4) + '\\)';
  const okbad = (ok, txt) => '<span class="' + (ok ? 'result-ok' : 'result-bad') + '">' + txt + '</span>';
  const STD_P = [2, 2.25, 2.5, 3, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48];                       // Table 13-2 diametral pitches (use as P_n)
  const STD_M = [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 25, 32, 40, 50];             // Table 13-2 preferred modules
  // ---- Mott Fig. 9-11 digitized: design-power capacity (hp) of each P_d curve vs pinion rpm (log-log interpolation) ----
  const F911_N = [200, 300, 400, 600, 800, 1000, 1200, 1500, 1800, 2100, 2400, 2700, 3000, 3300, 3600];
  const F911 = { 3: [77.95, 100.86, 125.1, 175.99, 229.1, 283.78, null, null, null, null, null, null, null, null, null], 4: [36.25, 46.75, 57.13, 77.6, 97.73, 117.59, 137.19, 166.15, 194.62, 222.62, 250.15, 277.24, null, null, null], 5: [22.27, 27.89, 33.74, 45.52, 57.14, 68.46, 79.42, 95.17, 110.05, 124.08, 137.28, 149.7, 161.37, 172.34, 182.64], 6: [12.94, 15.79, 18.88, 25.3, 31.8, 38.28, 44.68, 54.07, 63.16, 71.93, 80.36, 88.45, 96.2, 103.62, 110.72], 8: [4.08, 5.91, 7.65, 10.98, 14.16, 17.22, 20.21, 24.57, 28.83, 33, 37.11, 41.16, 45.17, 49.14, 53.08], 10: [2.37, 3.25, 4.13, 5.86, 7.55, 9.2, 10.79, 13.07, 15.24, 17.28, 19.22, 21.04, 22.77, 24.41, 25.96], 12: [1.28, 1.77, 2.3, 3.39, 4.49, 5.57, 6.6, 8.05, 9.38, 10.58, 11.65, 12.61, 13.46, 14.2, 14.85], 16: [0.68, 0.83, 1.02, 1.45, 1.92, 2.39, 2.87, 3.57, 4.24, 4.87, 5.46, 6, 6.5, 6.95, 7.36], 20: [null, 0.46, 0.53, 0.72, 0.94, 1.19, 1.45, 1.83, 2.2, 2.54, 2.86, 3.13, 3.37, 3.57, 3.74], 24: [null, null, null, 0.45, 0.59, 0.73, 0.87, 1.08, 1.28, 1.48, 1.66, 1.83, 1.99, 2.14, 2.27], 32: [null, null, null, null, null, null, null, 0.49, 0.57, 0.64, 0.72, 0.79, 0.87, 0.95, 1.03] };
  const cap911 = (P, n) => {
    const r = F911[P]; if (!r || !(n >= F911_N[0] && n <= F911_N[F911_N.length - 1])) return undefined;
    let i = 0; while (i < F911_N.length - 2 && n > F911_N[i + 1]) i++;
    const a = r[i], b = r[i + 1]; if (a === null || b === null) return undefined;
    const t = Math.log(n / F911_N[i]) / Math.log(F911_N[i + 1] / F911_N[i]);
    return Math.exp(Math.log(a) + t * (Math.log(b) - Math.log(a)));
  };
  // pick = finest standard pitch whose curve lies on/above the point (P_des, n_P) — "round to the smaller P_d"
  const pick911 = (Pdes, n, list) => { let best; list.forEach(p => { const c = cap911(p, n); if (c !== undefined && c >= Pdes && (best === undefined || p > best)) best = p; }); return best; };
  const nearest = (x, list) => list.reduce((a, b) => Math.abs(b - x) < Math.abs(a - x) ? b : a);
  // standard-pitch selection table with Use buttons (pick = Fig. 9-11 choice)
  const pdTable = (v, o) => {
    const Pdes = v[o.Pdes], n = v[o.n], NP = v[o.NP], cur = v[o.Pd], S = o.sym || 'P_d';
    const pk = Pdes > 0 && n > 0 ? pick911(Pdes, n, o.list) : undefined;
    const rows = o.list.map(p => {
      const c = cap911(p, n), m = 25.4 / p;
      return { cells: [f(p) + (p === cur ? ' (in use)' : ''), f(m, 3), f(nearest(m, o.mods)), c === undefined ? '—' : f(c, 3), c === undefined || !(Pdes > 0) ? '—' : (c >= Pdes ? 'yes' : 'no'), NP > 0 ? f(NP / p / (o.dfac ? o.dfac(v) : 1), 4) : '—'].concat(o.noF ? [] : [f(12 / p, 3)]),
        pick: p === pk, ok: c === undefined || !(Pdes > 0) ? undefined : c >= Pdes, set: { [o.Pd]: p } };
    });
    return H.table(['\\(' + S + '\\)', '\\(m = 25.4/' + S + '\\) (mm)', 'nearest std. \\(m\\)', 'Fig. 9-11 capacity (hp)', '\\(\\ge P_{des}\\)?', o.dcol || '\\(d_P\\) (in)'].concat(o.noF ? [] : ['\\(12/' + S + '\\) (in)']), rows, {
      caption: 'Standard diametral pitches (' + o.ref + ')' + (pk ? ' — Fig. 9-11 pick for \\(P_{des}\\) = ' + f(Pdes) + ' hp at ' + f(n) + ' rpm: ' + pk : ''),
      note: (o.note || 'Pick = the finest standard pitch whose Fig. 9-11 curve lies above the point (bigger teeth are stronger).') + ' “Use” sets \\(' + S + '\\); a module converts with \\(' + S + ' = 25.4/m\\) (' + o.mref + ').' });
  };
  // force directions on a spur pair: x right, y up, z out of the page
  const DIRS = { right: [1, 0], left: [-1, 0], above: [0, 1], below: [0, -1] };
  const ax = (x, y) => '\\(' + (Math.abs(x) > 0.5 ? (x > 0 ? '+x' : '-x') : (y > 0 ? '+y' : '-y')) + '\\)';
  const forceDirs = (v, Wt, Wr) => {
    const u = DIRS[v.gpos]; if (!u || !(Wt > 0)) return '';
    const s = v.rotP === 'cw' ? -1 : 1, vel = [-s * u[1], s * u[0]];   // pinion surface velocity at the mesh
    const k = v.pdrv === 'gear' ? -1 : 1;                              // the driver is resisted, the driven gear is pushed
    const tP = [-k * vel[0], -k * vel[1]];
    return 'On the pinion: \\(W_t\\) = ' + f(Wt) + ' lbf toward ' + ax(tP[0], tP[1]) + ', \\(W_r\\) = ' + f(Wr) + ' lbf toward ' + ax(-u[0], -u[1]) + ' (its centre). On the gear: \\(W_t\\) toward ' + ax(-tP[0], -tP[1]) + ', \\(W_r\\) toward ' + ax(u[0], u[1]) + '. The gear turns ' + (s > 0 ? 'CW' : 'CCW') + ' (x right, y up).';
  };
  // helical thrust: driver = hand of its helix (right hand for RH), fingers curl with the rotation, thumb = thrust on the driver
  const thrustDir = (v, Wa) => {
    if (!(Wa > 0)) return '';
    const h = v.hand === 'LH' ? -1 : 1, s = v.rotP === 'cw' ? -1 : 1, k = v.pdrv === 'gear' ? -1 : 1, t = k * h * s;
    const z = d => d > 0 ? '\\(+z\\) (out of the page)' : '\\(-z\\) (into the page)';
    return ' Thrust \\(W_a\\) = ' + f(Wa) + ' lbf: on the pinion (' + (h > 0 ? 'RH' : 'LH') + ') toward ' + z(t) + ', on the gear (' + (h > 0 ? 'LH' : 'RH') + ') toward ' + z(-t) + '.';
  };

  window.TOPIC = {
    id: 'helical', book: 'shigley',
    title: 'Helical Gears — Geometry, Forces & AGMA Stress',
    subtitle: 'Shigley Sec. 13-10, 13-15, Ch. 14 · Fizz + Mech-guide procedure merged',
    sibling: 'helical_mott.html',
    intro: 'Parallel-shaft helical gears in Shigley notation. Same AGMA road map as spur gears — only J and I change, and the bending equation and diameters use the transverse pitch \\(P_t = P_n\\cos\\psi\\). Yellow = chart/table reading (auto estimate until you type yours). F/M in step titles = Fizz / Mech-guide helical step numbers. Example = Gear Trains Tutorial 4 (\\(\\psi\\) = 25°).',
    example: { P: 5, nP: 300, src: 'uniform', drv: 'uniform', Pn: 6, psi: 25, phin: 20, NP: 16, NG: 48, F: 2, Qv: 6, ksMode: 2, JpP: 0.47, KJP: 0.96, JpG: 0.54, KJG: 0.93, Cmc: 1, Cpm: 1, cond: 'commercial', Ce: 1, Cp: 2300, Cf: 1, R: 0.9, KT: 1, Lh: 5555.56, q: 1, grade: 1, HBP: 200, HBG: 200, SFd: 1 },

    assumptions: [
      { text: 'US customary units (hp, lbf, in, ft/min, rpm, psi)', src: 'Mech p.63' },
      { text: '\\(K_o\\) from the Shigley table (uniform/uniform → 1.00); Mott Table 9-1 also accepted', src: 'Fizz p.54 · Mech p.91 · Gear Stress s12 (course)', var: 'Ko', value: 1 },
      { text: 'Normal diametral pitch \\(P_n = 12\\) and \\(N_P = 24\\) when the problem gives none (guides)', src: 'Fizz p.54 · Mech p.92', var: 'Pn', value: 12 },
      { text: 'Pinion teeth \\(N_P = 24\\) when not given', src: 'Fizz p.54 · Mech p.92', var: 'NP', value: 24 },
      { text: 'Helix angle from the problem, else 15° (≈ optimal); course problems use 15° or 25° so Mott’s charts apply', src: 'Mech p.92 · Helical/Bevel s7 (course)', var: 'psi', value: 15 },
      { text: 'Normal pressure angle \\(\\phi_n\\) = 20° unless stated', src: 'Fizz p.42, p.55 · Mech p.93', var: 'phin', value: 20 },
      { text: '\\(N_G = N_P \\cdot VR\\) rounded, as for spur gears', src: 'Fizz p.55 · Mech p.92', var: 'NG' },
      { text: 'Diameters, \\(W_t\\) and the bending equation use the transverse pitch \\(P_t = P_n\\cos\\psi\\)', src: 'Mech p.61, p.92 · Helical/Bevel s6 (course)', var: 'Pt' },
      { text: 'Face width \\(F = 2p_x\\) rounded; full helical action needs \\(F/p_x \\ge 2\\)', src: 'Fizz p.53, p.55 · Mech p.67, p.92', var: 'F' },
      { text: 'Steel on steel: \\(C_p = 2300\\sqrt{\\text{psi}}\\)', src: 'Fizz p.55 · Mech p.93', var: 'Cp', value: 2300 },
      { text: 'Quality from Mott Table 9-5 if not given: \\(Q_v = 7\\) (\\(A_v = 10\\))', src: 'Fizz p.41, p.55 · Mech p.77', var: 'Qv', value: 7 },
      { text: '\\(K_v\\) from Eq. 14-27 (course: use the equation)', src: 'Fizz p.41 · Mech p.78 · Gear Stress s14 (course)', var: 'Kv' },
      { text: '\\(C_{pf}\\) from Eq. 14-32 (transverse \\(d_P\\)); \\(C_{ma}\\) for commercial enclosed gear units', src: 'Fizz p.44 · Mech p.80 · Gear Stress s20 (course)', var: 'cond', value: 'commercial' },
      { text: '\\(C_{mc} = C_{pm} = C_e = 1\\), so \\(K_m = 1 + C_{pf} + C_{ma}\\)', src: 'Fizz p.45 · Mech p.80 · Gear Stress s19–20 (course)', var: 'Cmc', value: 1 },
      { text: '\\(K_s\\) from Mott Table 9-2 (= 1 for \\(P \\ge 5\\)); the tutorial’s Lewis-Y formula (1.088) is selectable', src: 'Fizz p.45 · Mech p.80 · Gear Stress s15 (course)', var: 'ksMode', value: 1 },
      { text: '\\(K_B = 1\\) (solid blank)', src: 'Fizz p.45 · Mech p.81', var: 'KB', value: 1 },
      { text: '\\(J = K_{J\'}J\'\\): Fig. 14-7 (75-tooth mate) times the Fig. 14-8 multiplier; auto = digitized charts', src: 'Fizz p.55–57 · Mech p.93–96 · Helical/Bevel s7 (course)', var: 'JP' },
      { text: '\\(I\\) from Eq. 14-23 with \\(m_N\\); the guides read Mott Table 10-1/10-2 (tutorial 0.199 vs 0.190) — both accepted', src: 'Fizz p.57–58 · Mech p.97 · Helical/Bevel s10–13 (course)', var: 'I' },
      { text: 'Size with \\(S_F = S_H = 1\\), then a steel giving \\(1.0 \\le S_F \\le 1.5\\)', src: 'Fizz p.45, p.48 · Mech p.82', var: 'SFd', value: 1 },
      { text: '99 % reliability → \\(K_R = 1.00\\)', src: 'Fizz p.45–46 · Mech p.82', var: 'R', value: 0.99 },
      { text: '\\(K_T = 1\\) and \\(C_f = 1\\) — course values', src: 'Gear Stress s33, s39 (course)', var: 'KT', value: 1 },
      { text: 'Life from the problem, otherwise 20 000 h (Mott Table 9-12); q = 1', src: 'Fizz p.46 · Mech p.82', var: 'Lh', value: 20000 },
      { text: '\\(Y_N\\), \\(Z_N\\) on the upper “normal commercial” lines', src: 'Fizz p.46–47 · Mech p.83, p.90 · Gear Stress s37, s44 (course)', var: 'YNP' },
      { text: 'Grade 1 through-hardened steel, same for pinion and gear (\\(C_H = 1\\))', src: 'Fizz p.48 · Mech p.73, p.84', var: 'HBG' },
      { text: 'Steel from Mott Appendix 3 (Appendix 5 carburized); required \\(H_B > 400\\) → flame/induction hardening or carburizing', src: 'Fizz p.48–51 · Mech p.84–87', step: 'req' },
    ],

    figures: [
      { id: 'f13-18', ref: 'Figure 13-18', title: 'Nomenclature of helical gears: \\(p_t\\), \\(p_n\\), \\(p_x\\), \\(\\psi\\), \\(\\phi_n\\), \\(\\phi_t\\)', src: 'figures/shigley/fig13-18.png', page: 718 },
      { id: 't13-4', ref: 'Table 13-4', title: 'Standard tooth proportions for helical gears (based on \\(P_n\\))', src: 'figures/shigley/table13-4.png', page: 723, note: '\\(a = 1/P_n\\), \\(b = 1.25/P_n\\), \\(d = N/(P_n\\cos\\psi)\\), \\(d_b = d\\cos\\phi_t\\).' },
      { id: 't13-2', ref: 'Table 13-2', title: 'Standard diametral pitches (use as \\(P_n\\))', src: 'figures/shigley/table13-2.png', page: 722 },
      { id: 'f13-33', ref: 'Figure 13-33', title: 'Tooth forces on a right-hand helical gear: \\(W_t\\), \\(W_r\\), \\(W_a\\)', src: 'figures/shigley/fig13-33.png', page: 738, note: '\\(W_r = W_t\\tan\\phi_t\\), \\(W_a = W_t\\tan\\psi\\), \\(W = W_t/(\\cos\\phi_n\\cos\\psi)\\).' },
      { id: 'ko', ref: 'Figure 14-17', title: 'Table of overload factors K_o', src: 'figures/shigley/fig14-17-ko.png', page: 793 },
      { id: 'mko', ref: 'Table 9-1', book: 'mott', title: 'Suggested overload factors K_o (Mott, more conservative)', src: 'figures/mott/table9-1.png', page: 395 },
      { id: 'm9-11', ref: 'Figure 9-11', book: 'mott', title: 'Trial diametral pitch from design power & pinion speed (Mott, spur basis)', src: 'figures/mott/fig9-11.png', page: 394, note: 'Rough guide only for helical gears; the guides take \\(P_n = 12\\), \\(N_P = 24\\).' },
      { id: 'av', ref: 'Table 9-5', book: 'mott', title: 'Recommended AGMA quality numbers A_v (A_v + Q_v = 17)', src: 'figures/mott/table9-5.png', page: 399 },
      { id: 'f14-9', ref: 'Figure 14-9', title: 'Dynamic factor K_v', src: 'figures/shigley/fig14-9.png', page: 785 },
      { id: 'eq14-27', ref: 'Equations 14-27 to 14-29', title: 'K_v curve fit', src: 'figures/shigley/eq14-27-29.png', page: 784 },
      { id: 't14-2', ref: 'Table 14-2', title: 'Lewis form factor Y (optional size factor equation)', src: 'figures/shigley/table14-2.png', page: 765 },
      { id: 'f14-7', ref: 'Figure 14-7', title: 'Helical-gear geometry factor J′ (20° normal, 75-tooth mate)', src: 'figures/shigley/fig14-7.png', page: 781, note: 'x = \\(\\psi\\), curve = teeth of the gear you want; then multiply by Fig. 14-8. Below 20 teeth extrapolate (tutorial: 16 T at 25° → 0.47).' },
      { id: 'f14-8', ref: 'Figure 14-8', title: 'J′-factor multipliers (mating gear teeth ≠ 75)', src: 'figures/shigley/fig14-8.png', page: 782, note: 'x = \\(\\psi\\), curve = teeth in the mating gear.' },
      { id: 'f14-10', ref: 'Figure 14-10', title: 'S and \\(S_1\\) for \\(C_{pm}\\)', src: 'figures/shigley/fig14-10.png', page: 787 },
      { id: 'eq14-30', ref: 'Equations 14-30 to 14-35', title: 'K_m components', src: 'figures/shigley/eq14-30-35.png', page: 787 },
      { id: 't14-9', ref: 'Table 14-9', title: 'C_ma constants A, B, C', src: 'figures/shigley/table14-9.png', page: 787 },
      { id: 'f14-11', ref: 'Figure 14-11', title: 'Mesh alignment factor C_ma', src: 'figures/shigley/fig14-11.png', page: 788 },
      { id: 'f14-16', ref: 'Figure 14-16', title: 'Rim-thickness factor K_B', src: 'figures/shigley/fig14-16.png', page: 791 },
      { id: 't14-8', ref: 'Table 14-8', title: 'Elastic coefficient C_p', src: 'figures/shigley/table14-8.png', page: 783 },
      { id: 'f14-2', ref: 'Figure 14-2', title: 'Bending strength \\(S_t\\) vs \\(H_B\\) (through-hardened)', src: 'figures/shigley/fig14-2.png', page: 773 },
      { id: 'f14-5', ref: 'Figure 14-5', title: 'Contact strength S_c vs H_B (through-hardened)', src: 'figures/shigley/fig14-5.png', page: 776 },
      { id: 't14-3', ref: 'Table 14-3', title: 'S_t for steel gears (case-hardened)', src: 'figures/shigley/table14-3.png', page: 775 },
      { id: 't14-6', ref: 'Table 14-6', title: 'S_c for steel gears (case-hardened)', src: 'figures/shigley/table14-6.png', page: 777 },
      { id: 'f14-14', ref: 'Figure 14-14', title: 'Y_N', src: 'figures/shigley/fig14-14.png', page: 790 },
      { id: 'f14-15', ref: 'Figure 14-15', title: 'Z_N', src: 'figures/shigley/fig14-15.png', page: 790 },
      { id: 't14-10', ref: 'Table 14-10', title: 'Reliability factor K_R', src: 'figures/shigley/table14-10.png', page: 791 },
      { id: 'f14-12', ref: 'Figure 14-12', title: 'Hardness-ratio factor C_H', src: 'figures/shigley/fig14-12.png', page: 789 },
      { id: 'f14-17', ref: 'Figure 14-17', title: 'Road map — bending', src: 'figures/shigley/fig14-17.png', page: 793 },
      { id: 'f14-18', ref: 'Figure 14-18', title: 'Road map — wear', src: 'figures/shigley/fig14-18.png', page: 794 },
      { id: 'mlife', ref: 'Table 9-12', book: 'mott', title: 'Recommended design life (hours)', src: 'figures/mott/table9-12.png', page: 411, note: 'Guides: take the life from this table when the problem gives none — the calculator then uses 20 000 h (general industrial machines).' },
      { id: 'mks', ref: 'Table 9-2', book: 'mott', title: 'Suggested size factors K_s (Mott — the guides\' K_s)', src: 'figures/mott/table9-2.png', page: 395, note: '\\(K_s = 1.00\\) for \\(P_d \\ge 5\\).' },
      { id: 'mt10-1', ref: 'Table 10-1', book: 'mott', title: 'Pitting geometry factor I for 20° normal pressure angle, \\(\\psi\\) = 15° and 25° (Mott) — the guides’ I', src: 'figures/mott/table10-1.png', page: 454, note: 'Tutorial: I = 0.199 (Mott) vs 0.190 (Eq. 14-23) for 16/48 T, \\(\\psi\\) = 25°.' },
      { id: 'mt10-2', ref: 'Table 10-2', book: 'mott', title: 'Pitting geometry factor I for 25° normal pressure angle, \\(\\psi\\) = 15° and 25° (Mott)', src: 'figures/mott/table10-2.png', page: 455 },
      { id: 'mf10-6', ref: 'Figure 10-6', book: 'mott', title: 'Helical J′ and multiplier, 20° normal pressure angle (Mott) — accepted alternative', src: 'figures/mott/fig10-6.png', page: 452, note: 'Shigley Fig. 14-7 reads 0.505 vs Mott 0.46 for the 20T/100T, \\(\\psi\\) = 20° lecture example; either is accepted.' },
      { id: 'mt9-8', ref: 'Table 9-8', book: 'mott', title: 'Gear materials: through-hardened and carburized alloys (Mott)', src: 'figures/mott/table9-8.png', page: 406, note: 'Pick alloy + heat treatment by HB; quote HB and % elongation.' },
      { id: 'mapp3a', ref: 'Appendix 3', book: 'mott', title: 'Steel properties: \\(s_u\\), \\(s_y\\), % elongation, HB (1020 … 4150)', src: 'figures/mott/appendix3a.png', page: 804, note: 'Tutorial 4: 4140 OQT1300 HB 235 → SF 1.58; 4140 annealed HB 197 → 1.40.' },
      { id: 'mapp3b', ref: 'Appendix 3 (cont.)', book: 'mott', title: 'Steel properties (4340 … 9255)', src: 'figures/mott/appendix3b.png', page: 805 },
      { id: 'mapp5', ref: 'Appendix 5', book: 'mott', title: 'Properties of carburized steels (core HB, case HRC)', src: 'figures/mott/appendix5.png', page: 808, note: 'Carburized steels (Appendix 3 is the normal choice).' },
      // ---- course-only slides (v2/COURSE_CONVENTIONS.md §16) ----
      { id: 'cj', ref: 'Helical/Bevel s7', book: 'course', title: '\\(J = K_{J\'}J\'\\) — course explanation and worked numbers (20T/100T, \\(\\psi\\) = 20°)', src: 'figures/course/helical_j_modifier_example.png', note: '\\(J_P = 0.46 \\times 1.01 = 0.47\\), \\(J_G = 0.55 \\times 0.935 = 0.51\\).' },
      { id: 'cko', ref: 'Gear Stress s12', book: 'course', title: 'Overload factor K_o — Shigley table and Mott Table 9-1 side by side', src: 'figures/course/ko_shigley_vs_mott.png', note: 'Either accepted; tutorials use K_o = 1.' },
      { id: 'ckv', ref: 'Gear Stress s14', book: 'course', title: '\\(K_v\\) analytical method and Mott Table 9-4 (\\(Q_v\\) ↔ \\(A_v\\))', src: 'figures/course/gear_kv_q_av_table.png', note: '\\(A_v + Q_v = 17\\). Course prefers the equation.' },
      { id: 'cks', ref: 'Gear Stress s15', book: 'course', title: 'Size factor \\(K_s\\): typically 1, or the Lewis-Y formula', src: 'figures/course/gear_ks_course.png', note: 'Tutorial 4 keeps \\(K_s\\) = 1.088 from the formula.' },
      { id: 'ckm', ref: 'Gear Stress s19', book: 'course', title: '\\(K_m\\) (Shigley form) with the course annotations: \\(C_{mc} = 1\\), \\(C_e = 1\\)', src: 'figures/course/gear_km_shigley_annotated.png' },
      { id: 'ccma', ref: 'Gear Stress s20', book: 'course', title: 'C_ma — "default to curve 2 (commercial enclosed gear units)"', src: 'figures/course/gear_cma_curve2.png' },
      { id: 'cyn', ref: 'Gear Stress s37', book: 'course', title: 'Y_N — "use this line for normal commercial gears"', src: 'figures/course/gear_yn_course_line.png' },
      { id: 'czn', ref: 'Gear Stress s44', book: 'course', title: 'Z_N — normal commercial gears line', src: 'figures/course/gear_zn_course_line.png' },
      { id: 'cteeth', ref: 'Helical/Bevel s33', book: 'course', title: 'Standard gear teeth proportions and Lewis Y table', src: 'figures/course/standard_gear_teeth_table.png' },
      { id: 'gk-qv', ref: 'Gear Kinematics s42', book: 'course', title: 'AGMA quality number Q_v by accuracy level (minimal 4–5 … highest 14–15) and how it is produced', src: 'figures/course/gear_agma_quality_accuracy_levels.png', note: 'Gear_Kinematics_and_Forces_-2024.pdf slide 42. Use with the application table to pick Q_v / A_v.' },
      { id: 'm-t2-2', ref: 'Table 2-2', book: 'mott', title: 'Hardness scales vs tensile strength (HB, HRB, HRC, ksi, MPa) with Figure 2-6 conversion chart', src: 'figures/mott/table2-2_fig2-6.png', page: 49, note: '\\(s_u \\approx 0.50H_B\\) ksi (Mott Eq. 2-8).' },
      { id: 'm-f2-12', ref: 'Figure 2-12', book: 'mott', title: 'SAE/AISI steel designation system (alloy group, carbon content)', src: 'figures/mott/fig2-12.png', page: 61, note: 'Helical/Bevel s41.' },
      { id: 'm-t2-8', ref: 'Table 2-8', book: 'mott', title: 'Alloy groups in the SAE numbering system', src: 'figures/mott/table2-8.png', page: 61, note: 'Helical/Bevel s44.' },
      { id: 'm-t2-9', ref: 'Table 2-9', book: 'mott', title: 'Uses of some steels (1040 shafts/gears, 4140/4340/4640/8650 gears …)', src: 'figures/mott/table2-9.png', page: 63, note: 'Helical/Bevel s43.' },
      { id: 'm-f9-20', ref: 'Figure 9-20', book: 'mott', title: 'Effective case depth h_e for carburized gears vs normal diametral pitch (normal / heavy case)', src: 'figures/mott/fig9-20.png', page: 409, note: 'Helical/Bevel s57 (case hardening): case depth typically 0.010–0.040 in.' },
      { id: 'gk-hand', ref: 'Gear Kinematics s12', book: 'course', title: 'Helical hand and thrust direction for parallel/crossed (right-angle) helical drives: which side the thrust bearing goes for RH/LH, driver and rotation', src: 'figures/course/gear_helical_hand_thrust_directions.png', note: 'Gear_Kinematics_and_Forces_-2024.pdf slide 12.' },
    ],

    sections: [
      { title: 'Inputs & design decisions (Fizz helical steps 1–5 · Mech helical steps 1–7)', steps: [
        { id: 'in', title: 'Power, speeds, overload (F1–2 · M1–3)', fig: ['cko', 'ko', 'mko'],
          text: 'Nameplate power, pinion speed and shock classes as for spur gears; \\(K_o\\) from the Shigley table (Mott Table 9-1 also accepted).',
          formula: 'P_{des} = K_o P,\\qquad VR = \\frac{n_P}{n_G}',
          vars: [
            { id: 'P', symbol: 'H', label: 'Transmitted power', unit: 'hp', kind: 'input' },
            { id: 'nP', symbol: 'n_P', label: 'Pinion speed', unit: 'rpm', kind: 'input' },
            { id: 'nGd', symbol: 'n_{G,des}', label: 'Desired gear speed (blank if N_G given)', unit: 'rpm', kind: 'input' },
            { id: 'src', label: 'Power source', kind: 'choice', type: 'text', options: [{ label: 'Uniform (electric motor, constant-speed gas turbine)', value: 'uniform' }, { label: 'Light shock (water turbine, variable-speed drive)', value: 'light' }, { label: 'Medium shock (multicylinder engine)', value: 'medium' }], default: 'uniform' },
            { id: 'drv', label: 'Driven machine', kind: 'choice', type: 'text', options: [{ label: 'Uniform (generators, paper/film winders)', value: 'uniform' }, { label: 'Moderate shock (machine tools, saws, mixers, pumps, conveyors)', value: 'moderate' }, { label: 'Heavy shock (crushers, punch presses, hammer mills)', value: 'heavy' }], default: 'uniform' },
            { id: 'Ko', symbol: 'K_o', label: 'Overload factor', kind: 'lookup', fig: 'cko', hint: 'auto from the two selects (Shigley); Mott Table 9-1 also accepted', auto: v => (KO[v.src] && KO[v.src][v.drv]) || undefined },
            { id: 'Pdes', symbol: 'P_{des}', label: 'Design power', unit: 'hp', kind: 'calc', compute: v => has(v, 'P', 'Ko') ? v.P * v.Ko : undefined },
            { id: 'VRd', symbol: 'VR_{des}', label: 'Desired velocity ratio', kind: 'input', hint: 'auto = \\(n_P/n_G\\); type it if only the ratio is given', auto: v => has(v, 'nP', 'nGd') && v.nGd > 0 ? v.nP / v.nGd : undefined },
          ] },
        { id: 'tooth', title: 'Normal pitch, helix angle, pressure angle, tooth numbers (F3, 5 · M4, 7)', fig: ['t13-2', 'm9-11', 't13-4'],
          text: 'Helical teeth are cut in the normal plane: give \\(P_n\\) and \\(\\phi_n\\) (a transverse \\(P_t\\) given instead converts with \\(P_n = P_t/\\cos\\psi\\)). Guides: \\(P_n = 12\\), \\(N_P = 24\\) when nothing is given. Standard pitches with Use buttons are listed below.',
          formula: 'N_G = N_P\\,VR,\\qquad m_G = \\frac{N_G}{N_P},\\qquad n_G = n_P\\frac{N_P}{N_G}',
          vars: [
            { id: 'Pn', symbol: 'P_n', label: 'Normal diametral pitch', unit: 'teeth/in', kind: 'input', auto: v => has(v, 'PtIn', 'psi') ? v.PtIn / cosd(v.psi) : 12, hint: 'given, or the guides’ 12' },
            { id: 'PtIn', symbol: 'P_{t,given}', label: 'Transverse pitch, if the problem gives it instead', unit: 'teeth/in', kind: 'input', hint: 'sets \\(P_n = P_t/\\cos\\psi\\)' },
            { id: 'psi', symbol: '\\psi', label: 'Helix angle', unit: '°', kind: 'input', default: 15, hint: '15° optimal; course problems use 15°, 20° or 25°', check: v => v.psi !== undefined && (v.psi < 5 || v.psi > 45) ? 'helix angles are normally 10–30°' : (v.psi !== undefined && v.psi !== 15 && v.psi !== 25 ? 'Mott Tables 10-1/10-2 only tabulate 15° and 25° — use Eq. 14-23 (auto) or interpolate' : null) },
            { id: 'phin', symbol: '\\phi_n', label: 'Normal pressure angle', kind: 'choice', options: [{ label: '20° (standard)', value: 20 }, { label: '14.5°', value: 14.5 }, { label: '25°', value: 25 }], default: 20 },
            { id: 'NP', symbol: 'N_P', label: 'Pinion teeth', kind: 'input', default: 24, hint: 'Fizz default 24' },
            { id: 'NG', symbol: 'N_G', label: 'Gear teeth', kind: 'input', hint: 'auto = round(N_P·VR_des)', auto: v => has(v, 'NP', 'VRd') ? Math.round(v.NP * v.VRd) : undefined },
            { id: 'mG', symbol: 'm_G', label: 'Gear ratio', kind: 'calc', compute: v => has(v, 'NP', 'NG') ? v.NG / v.NP : undefined },
            { id: 'nG', symbol: 'n_G', label: 'Actual gear speed', unit: 'rpm', kind: 'calc', compute: v => has(v, 'nP', 'NP', 'NG') ? v.nP * v.NP / v.NG : undefined },
          ],
          after: v => pdTable(v, { Pdes: 'Pdes', n: 'nP', NP: 'NP', Pd: 'Pn', sym: 'P_n', list: STD_P, mods: STD_M, ref: 'Table 13-2, used as \\(P_n\\)', mref: 'normal module', dfac: v => cosd(v.psi || 0), dcol: '\\(d_P = N_P/(P_n\\cos\\psi)\\) (in)', noF: true, note: 'Fig. 9-11 is a spur chart — a rough guide only for helical gears.' }) },
      ] },

      { title: 'Helical geometry (Mech-guide spec question steps 1–6 · Fizz helical steps 4–9)', steps: [
        { id: 'geo1', title: 'Transverse pitch, circular pitches, axial pitch, transverse pressure angle (F4, 6 · M5–6, 8)', eq: '13-16 … 13-19', fig: ['f13-18'],
          formula: 'P_t = P_n\\cos\\psi,\\quad p_t = \\frac{\\pi}{P_t},\\quad p_n = p_t\\cos\\psi = \\frac{\\pi}{P_n},\\quad p_x = \\frac{p_t}{\\tan\\psi},\\quad \\tan\\phi_t = \\frac{\\tan\\phi_n}{\\cos\\psi}',
          vars: [
            { id: 'Pt', symbol: 'P_t', label: 'Transverse diametral pitch', unit: 'teeth/in', kind: 'calc', compute: v => has(v, 'Pn', 'psi') ? v.Pn * cosd(v.psi) : undefined, work: v => has(v, 'Pn', 'psi') ? '\\(P_t = ' + f(v.Pn) + '\\cos ' + f(v.psi) + '^\\circ = ' + f(v.Pn * cosd(v.psi)) + '\\ \\mathrm{teeth/in}\\)' : null },
            { id: 'pt', symbol: 'p_t', label: 'Transverse circular pitch', unit: 'in', kind: 'calc', compute: v => has(v, 'Pt') ? Math.PI / v.Pt : undefined },
            { id: 'pn', symbol: 'p_n', label: 'Normal circular pitch', unit: 'in', kind: 'calc', compute: v => has(v, 'pt', 'psi') ? v.pt * cosd(v.psi) : undefined },
            { id: 'px', symbol: 'p_x', label: 'Axial pitch', unit: 'in', kind: 'calc', compute: v => has(v, 'pt', 'psi') ? v.pt / tand(v.psi) : undefined, work: v => has(v, 'pt', 'psi') ? '\\(p_x = ' + f(v.pt) + '/\\tan ' + f(v.psi) + '^\\circ = ' + f(v.pt / tand(v.psi)) + '\\ \\mathrm{in}\\)' : null },
            { id: 'phit', symbol: '\\phi_t', label: 'Transverse pressure angle', unit: '°', kind: 'calc', compute: v => has(v, 'phin', 'psi') ? H.deg(Math.atan(tand(v.phin) / cosd(v.psi))) : undefined, work: v => has(v, 'phin', 'psi') ? '\\(\\phi_t = \\tan^{-1}(\\tan ' + f(v.phin) + '^\\circ/\\cos ' + f(v.psi) + '^\\circ) = ' + f(H.deg(Math.atan(tand(v.phin) / cosd(v.psi)))) + '^\\circ\\)' : null },
          ] },
        { id: 'geo2', title: 'Pitch diameters, centre distance, face width, face-contact ratio, virtual teeth (F7–9 · M9–11)', eq: '13-20, 14-19', fig: ['t13-4'],
          formula: 'd = \\frac{N}{P_t} = \\frac{N}{P_n\\cos\\psi},\\quad C = \\frac{d_P+d_G}{2},\\quad m_F = \\frac{F}{p_x} \\ge 2,\\quad N\' = \\frac{N}{\\cos^3\\psi}',
          text: 'Diameters use the transverse pitch \\(P_t\\). Guides: \\(F = 2p_x\\) rounded to a convenient value; full helical action needs \\(F/p_x \\ge 2\\). \\(N\'\\) = virtual (equivalent spur) teeth.',
          vars: [
            { id: 'dP', symbol: 'd_P', label: 'Pinion pitch diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'NP', 'Pt') ? v.NP / v.Pt : undefined, work: v => has(v, 'NP', 'Pt') ? '\\(d_P = ' + f(v.NP) + '/' + f(v.Pt) + ' = ' + f(v.NP / v.Pt) + '\\ \\mathrm{in}\\)' : null },
            { id: 'dG', symbol: 'd_G', label: 'Gear pitch diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'NG', 'Pt') ? v.NG / v.Pt : undefined },
            { id: 'C', symbol: 'C', label: 'Centre distance', unit: 'in', kind: 'calc', compute: v => has(v, 'dP', 'dG') ? (v.dP + v.dG) / 2 : undefined },
            { id: 'F', symbol: 'F', label: 'Face width', unit: 'in', kind: 'input', hint: 'auto = \\(2p_x\\) (nominal); round to a convenient value', auto: v => has(v, 'px') ? 2 * v.px : undefined },
            { id: 'mF', symbol: 'm_F', label: 'Face-contact ratio \\(F/p_x\\)', kind: 'calc', digits: 3, compute: v => has(v, 'F', 'px') ? v.F / v.px : undefined, check: v => v.mF !== undefined && v.mF < 2 ? 'm_F < 2: not full helical action; Figs. 14-7/14-8 need m_F of at least 2' : null },
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
        { id: 'force', title: 'Pitch-line velocity, tangential, radial, axial and normal forces, torque (F9 · M11)', eq: '13-35, 13-40', fig: ['f13-33', 'gk-hand'],
          formula: 'V = \\frac{\\pi d_P n_P}{12},\\quad W_t = \\frac{33\\,000H}{V},\\quad W_r = W_t\\tan\\phi_t,\\quad W_a = W_t\\tan\\psi,\\quad W = \\frac{W_t}{\\cos\\phi_n\\cos\\psi},\\quad T = \\frac{W_t d}{2}',
          text: '\\(W_a\\) is the thrust one bearing must carry. Choose rotation, layout and hand for the directions. Thrust rule: on the driver use the hand of its helix (right hand for RH), fingers curl with the rotation, thumb = thrust; the driven gear gets the opposite.',
          vars: [
            { id: 'V', symbol: 'V', label: 'Pitch-line velocity', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'dP', 'nP') ? Math.PI * v.dP * v.nP / 12 : undefined, work: v => has(v, 'dP', 'nP') ? '\\(V = \\pi(' + f(v.dP) + ')(' + f(v.nP) + ')/12 = ' + f(Math.PI * v.dP * v.nP / 12) + '\\ \\mathrm{ft/min}\\)' : null },
            { id: 'Wt', symbol: 'W_t', label: 'Transmitted load', unit: 'lbf', kind: 'input', hint: 'auto = \\(33\\,000H/V\\); type it if given', auto: v => has(v, 'P', 'V') && v.V > 0 ? 33000 * v.P / v.V : undefined, work: v => has(v, 'P', 'V') && v.V > 0 ? '\\(W_t = 33\\,000(' + f(v.P) + ')/' + f(v.V) + ' = ' + f(33000 * v.P / v.V) + '\\ \\mathrm{lbf}\\)' : null },
            { id: 'Wr', symbol: 'W_r', label: 'Radial force', unit: 'lbf', kind: 'calc', compute: v => has(v, 'Wt', 'phit') ? v.Wt * tand(v.phit) : undefined, work: v => has(v, 'Wt', 'phit') ? '\\(W_r = ' + f(v.Wt) + '\\tan ' + f(v.phit) + '^\\circ = ' + f(v.Wt * tand(v.phit)) + '\\ \\mathrm{lbf}\\)' : null },
            { id: 'Wa', symbol: 'W_a', label: 'Axial (thrust) force', unit: 'lbf', kind: 'calc', compute: v => has(v, 'Wt', 'psi') ? v.Wt * tand(v.psi) : undefined, work: v => has(v, 'Wt', 'psi') ? '\\(W_a = ' + f(v.Wt) + '\\tan ' + f(v.psi) + '^\\circ = ' + f(v.Wt * tand(v.psi)) + '\\ \\mathrm{lbf}\\)' : null },
            { id: 'W', symbol: 'W', label: 'Total normal force', unit: 'lbf', kind: 'calc', compute: v => has(v, 'Wt', 'phin', 'psi') ? v.Wt / (cosd(v.phin) * cosd(v.psi)) : undefined },
            { id: 'TP', symbol: 'T_P', label: 'Pinion torque', unit: 'lbf·in', kind: 'calc', compute: v => has(v, 'Wt', 'dP') ? v.Wt * v.dP / 2 : undefined },
            { id: 'TG', symbol: 'T_G', label: 'Gear torque', unit: 'lbf·in', kind: 'calc', compute: v => has(v, 'Wt', 'dG') ? v.Wt * v.dG / 2 : undefined },
            { id: 'rotP', label: 'Pinion rotation (viewed from +z, out of the page)', kind: 'choice', type: 'text', options: [{ label: 'CW', value: 'cw' }, { label: 'CCW', value: 'ccw' }], default: 'cw' },
            { id: 'gpos', label: 'Gear position relative to the pinion', kind: 'choice', type: 'text', options: [{ label: 'right', value: 'right' }, { label: 'left', value: 'left' }, { label: 'above', value: 'above' }, { label: 'below', value: 'below' }], default: 'right' },
            { id: 'hand', label: 'Pinion helix hand', kind: 'choice', type: 'text', options: [{ label: 'right-hand (RH)', value: 'RH' }, { label: 'left-hand (LH)', value: 'LH' }], default: 'RH' },
            { id: 'pdrv', label: 'Driver', kind: 'choice', type: 'text', options: [{ label: 'pinion drives', value: 'pinion' }, { label: 'gear drives', value: 'gear' }], default: 'pinion' },
          ],
          after: v => forceDirs(v, v.Wt, v.Wr) + thrustDir(v, v.Wa) },
      ] },

      { title: 'AGMA factors — as for spur gears except J and I (Fizz helical steps 10–12 · Mech helical steps 12–14)', steps: [
        { id: 'kv', title: 'Quality number and dynamic factor K_v (F10 · M12)', eq: '14-27 … 14-29', fig: ['ckv', 'f14-9', 'eq14-27', 'av', 'gk-qv'],
          formula: 'K_v = \\left(\\frac{A+\\sqrt V}{A}\\right)^B,\\quad B = 0.25(12-Q_v)^{2/3},\\quad A = 50+56(1-B)',
          text: 'Quality number from the problem, else Mott Table 9-5 (default \\(Q_v = 7\\)); \\(A_v = 17 - Q_v\\). Tutorial: \\(Q_v = 6\\), \\(K_v = 1.21\\).',
          after: v => has(v, 'V') ? 'Mott Table 9-5 by speed: V = ' + f(v.V) + ' ft/min → A_v = ' + AvT95(v.V) + ' (Q_v = ' + (17 - AvT95(v.V)) + ').' : '',
          vars: [
            { id: 'Qv', symbol: 'Q_v', label: 'AGMA quality number (Mott A_v in brackets)', kind: 'choice', fig: 'ckv', options: [5, 6, 7, 8, 9, 10, 11].map(q => ({ label: 'Q_v = ' + q + '  (A_v = ' + (17 - q) + ')', value: q })), default: 7 },
            { id: 'Bv', symbol: 'B', label: 'B', kind: 'calc', digits: 4, compute: v => has(v, 'Qv') ? 0.25 * Math.pow(12 - v.Qv, 2 / 3) : undefined },
            { id: 'Av', symbol: 'A', label: 'A', kind: 'calc', digits: 4, compute: v => has(v, 'Bv') ? 50 + 56 * (1 - v.Bv) : undefined },
            { id: 'Kv', symbol: 'K_v', label: 'Dynamic factor', kind: 'lookup', fig: 'f14-9', hint: 'auto = Eq. 14-27', auto: v => has(v, 'Av', 'Bv', 'V') ? Math.pow((v.Av + Math.sqrt(v.V)) / v.Av, v.Bv) : undefined,
              work: v => has(v, 'Av', 'Bv', 'V') ? '\\(K_v = \\left(\\frac{' + f(v.Av) + '+\\sqrt{' + f(v.V) + '}}{' + f(v.Av) + '}\\right)^{' + f(v.Bv) + '} = ' + f(Math.pow((v.Av + Math.sqrt(v.V)) / v.Av, v.Bv)) + '\\)' : null },
            { id: 'Vmax', symbol: '(V_t)_{max}', label: 'Max. velocity for this Q_v', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'Av', 'Qv') ? Math.pow(v.Av + (v.Qv - 3), 2) : undefined, check: v => has(v, 'V', 'Vmax') && v.V > v.Vmax ? 'V exceeds (V_t)_{max} — raise Q_v' : null },
          ] },
        { id: 'ks', title: 'Size factors K_s (spur F23 · M17)', fig: ['cks', 'mks', 't14-2'],
          formula: 'K_s = \\text{Table 9-2}(P_t)\\ \\ (= 1 \\text{ for } P_t \\ge 5)\\qquad\\text{or}\\qquad K_s = 1.192\\left(\\frac{F\\sqrt Y}{P_n}\\right)^{0.0535}\\ (\\ge 1)',
          text: 'Guides: Mott Table 9-2 with the transverse pitch (1.00 for \\(P \\ge 5\\)). Accepted alternative: Shigley’s Lewis-Y formula with \\(P = P_n\\) (Tutorial 4: 1.088).',
          vars: [
            { id: 'ksMode', label: 'K_s rule', kind: 'choice', options: [{ label: 'Mott Table 9-2 by \\(P_t\\) (= 1 for \\(P \\ge 5\\))', value: 1 }, { label: 'Shigley formula with Lewis Y (Tutorial 4)', value: 2 }], default: 1 },
            { id: 'KsP', symbol: '(K_s)_P', label: 'Size factor, pinion', kind: 'lookup', fig: 'cks', hint: 'auto = Table 9-2 or the formula, per the rule above', auto: v => v.ksMode === 2 ? (has(v, 'F', 'NP', 'Pn') && v.NP >= 12 ? Math.max(1, 1.192 * Math.pow(v.F * Math.sqrt(lewisY(v.NP)) / v.Pn, 0.0535)) : undefined) : (has(v, 'Pt') ? KS92(v.Pt) : undefined),
              work: v => v.ksMode === 2 && has(v, 'F', 'NP', 'Pn') && v.NP >= 12 ? '\\((K_s)_P = 1.192\\left(\\frac{' + f(v.F) + '\\sqrt{' + f(lewisY(v.NP), 3) + '}}{' + f(v.Pn) + '}\\right)^{0.0535} = ' + f(Math.max(1, 1.192 * Math.pow(v.F * Math.sqrt(lewisY(v.NP)) / v.Pn, 0.0535))) + '\\)' : null },
            { id: 'KsG', symbol: '(K_s)_G', label: 'Size factor, gear', kind: 'lookup', fig: 'cks', auto: v => v.ksMode === 2 ? (has(v, 'F', 'NG', 'Pn') && v.NG >= 12 ? Math.max(1, 1.192 * Math.pow(v.F * Math.sqrt(lewisY(v.NG)) / v.Pn, 0.0535)) : undefined) : (has(v, 'Pt') ? KS92(v.Pt) : undefined) },
          ] },
        { id: 'km', title: 'Load-distribution factor K_m (spur F20–22 · M18)', eq: '14-30 … 14-35', fig: ['ckm', 'ccma', 'eq14-30', 'f14-10', 'f14-11', 't14-9'],
          formula: 'K_m = 1 + C_{mc}(C_{pf}C_{pm} + C_{ma}C_e)',
          text: 'Guides: \\(K_m = 1 + C_{pf} + C_{ma}\\) (Eq. 14-30 with \\(C_{mc} = C_{pm} = C_e = 1\\)); use the transverse \\(d_P\\) in \\(C_{pf}\\). Tutorial 4: \\(C_{pf} = 0.0554\\), \\(C_{ma} = 0.16\\), \\(K_m = 1.22\\).',
          vars: [
            { id: 'Cmc', symbol: 'C_{mc}', label: 'Lead correction', kind: 'choice', options: [{ label: '1 — uncrowned', value: 1 }, { label: '0.8 — crowned', value: 0.8 }], default: 1 },
            { id: 'Cpf', symbol: 'C_{pf}', label: 'Pinion proportion factor', kind: 'lookup', fig: 'eq14-30', digits: 4, hint: 'auto = Eq. 14-32 with d_P (transverse)',
              auto: v => { if (!has(v, 'F', 'dP')) return undefined; const r = Math.max(v.F / (10 * v.dP), 0.05); return v.F <= 1 ? r - 0.025 : v.F <= 17 ? r - 0.0375 + 0.0125 * v.F : r - 0.1109 + 0.0207 * v.F - 0.000228 * v.F * v.F; },
              work: v => has(v, 'F', 'dP') ? '\\(C_{pf} = \\frac{' + f(v.F) + '}{10(' + f(v.dP) + ')}' + (v.F <= 1 ? ' - 0.025' : v.F <= 17 ? ' - 0.0375 + 0.0125(' + f(v.F) + ')' : ' - 0.1109 + 0.0207F - 0.000228F^2') + ' = ' + f(v.Cpf, 4) + '\\)' : null },
            { id: 'Cpm', symbol: 'C_{pm}', label: 'Pinion proportion modifier', kind: 'choice', fig: 'f14-10', options: [{ label: '1 — straddle mounted, \\(S_1/S < 0.175\\)', value: 1 }, { label: '1.1 — \\(S_1/S \\ge 0.175\\)', value: 1.1 }], default: 1 },
            { id: 'cond', label: 'Gearing condition', kind: 'choice', type: 'text', options: [{ label: 'Open gearing', value: 'open' }, { label: 'Commercial enclosed units', value: 'commercial' }, { label: 'Precision enclosed', value: 'precision' }, { label: 'Extra-precision enclosed', value: 'extra' }], default: 'commercial' },
            { id: 'Cma', symbol: 'C_{ma}', label: 'Mesh alignment factor', kind: 'lookup', fig: 'f14-11', digits: 4, hint: 'auto = Table 14-9', auto: v => { const k = CMA[v.cond]; return k && has(v, 'F') ? k[0] + k[1] * v.F + k[2] * v.F * v.F : undefined; } },
            { id: 'Ce', symbol: 'C_e', label: 'Mesh alignment correction', kind: 'choice', options: [{ label: '1 — normal', value: 1 }, { label: '0.8 — adjusted/lapped at assembly', value: 0.8 }], default: 1 },
            { id: 'Km', symbol: 'K_m', label: 'Load-distribution factor', kind: 'lookup', fig: 'eq14-30', hint: 'auto = Eq. 14-30; type a given value', digits: 4, auto: v => has(v, 'Cmc', 'Cpf', 'Cpm', 'Cma', 'Ce') ? 1 + v.Cmc * (v.Cpf * v.Cpm + v.Cma * v.Ce) : undefined, work: v => v.Km !== undefined ? '\\(K_m = 1 + ' + f(v.Cmc) + '[' + f(v.Cpf, 4) + '(' + f(v.Cpm) + ') + ' + f(v.Cma, 4) + '(' + f(v.Ce) + ')] = ' + f(v.Km, 4) + '\\)' : null },
          ] },
        { id: 'kb', title: 'Rim-thickness factor K_B (spur F24 · M19)', eq: '14-40', fig: ['f14-16'],
          formula: 'm_B = t_R/h_t,\\quad K_B = 1.6\\ln(2.242/m_B)\\ (m_B<1.2),\\ 1\\ (m_B\\ge1.2)',
          text: '\\(K_B = 1\\) unless the gear is rimmed — leave \\(t_R\\) blank for a solid blank.',
          vars: [
            { id: 'tR', symbol: 't_R', label: 'Rim thickness (blank = solid)', unit: 'in', kind: 'input' },
            { id: 'mB', symbol: 'm_B', label: 'Backup ratio', kind: 'calc', digits: 3, compute: v => has(v, 'tR', 'ht') ? v.tR / v.ht : undefined },
            { id: 'KB', symbol: 'K_B', label: 'Rim-thickness factor', kind: 'lookup', fig: 'f14-16', auto: v => v.mB === undefined ? 1 : (v.mB < 1.2 ? 1.6 * Math.log(2.242 / v.mB) : 1) },
          ] },
        { id: 'j', title: 'Helical bending geometry factors \\(J = K_{J\'}J\'\\) (F11 · M13)', fig: ['cj', 'f14-7', 'f14-8', 'mf10-6'],
          text: '\\(J = K_{J\'}J\'\\): \\(J\'\\) from Fig. 14-7 (x = \\(\\psi\\), curve = own teeth, 75-tooth mate) times the Fig. 14-8 multiplier for the actual mate. Lecture: 20T/100T at 20° → \\(J_P = 0.47\\), \\(J_G = 0.51\\); tutorial 16 T at 25° → \\(0.47 \\times 0.96\\). Mott Fig. 10-6 also accepted.',
          vars: [
            { id: 'JpP', symbol: 'J\'_P', label: '\\(J\'\\) pinion (Fig. 14-7)', kind: 'lookup', fig: 'f14-7', digits: 3, hint: 'auto = digitized Fig. 14-7 (x = \\(\\psi\\), curve \\(N_P\\))', auto: v => has(v, 'NP', 'psi') && v.phin === 20 ? chart2(JP_N, JP_V, v.psi, v.NP) : undefined, check: v => has(v, 'NP') && v.NP < 20 ? 'Fig. 14-7 starts at 20 T — extrapolate (tutorial: 16 T at 25° → 0.47)' : null },
            { id: 'KJP', symbol: 'K_{J\'P}', label: 'Multiplier for the pinion (mate = \\(N_G\\), Fig. 14-8)', kind: 'lookup', fig: 'f14-8', digits: 3, hint: 'auto = digitized Fig. 14-8 (x = \\(\\psi\\), curve \\(N_G\\))', auto: v => has(v, 'NG', 'psi') && v.phin === 20 ? chart2(KJ_N, KJ_V, v.psi, v.NG) : undefined },
            { id: 'JP', symbol: 'J_P', label: 'Geometry factor, pinion', kind: 'calc', digits: 3, compute: v => has(v, 'JpP', 'KJP') ? v.JpP * v.KJP : undefined, work: v => v.JP !== undefined ? '\\(J_P = K_{J\'}J\' = ' + f(v.KJP, 3) + '\\times' + f(v.JpP, 3) + ' = ' + f(v.JP, 3) + '\\)' : null },
            { id: 'JpG', symbol: 'J\'_G', label: '\\(J\'\\) gear (Fig. 14-7)', kind: 'lookup', fig: 'f14-7', digits: 3, hint: 'auto = digitized Fig. 14-7 (x = \\(\\psi\\), curve \\(N_G\\))', auto: v => has(v, 'NG', 'psi') && v.phin === 20 ? chart2(JP_N, JP_V, v.psi, v.NG) : undefined },
            { id: 'KJG', symbol: 'K_{J\'G}', label: 'Multiplier for the gear (mate = \\(N_P\\), Fig. 14-8)', kind: 'lookup', fig: 'f14-8', digits: 3, hint: 'auto = digitized Fig. 14-8 (x = \\(\\psi\\), curve \\(N_P\\))', auto: v => has(v, 'NP', 'psi') && v.phin === 20 ? chart2(KJ_N, KJ_V, v.psi, v.NP) : undefined },
            { id: 'JG', symbol: 'J_G', label: 'Geometry factor, gear', kind: 'calc', digits: 3, compute: v => has(v, 'JpG', 'KJG') ? v.JpG * v.KJG : undefined, work: v => v.JG !== undefined ? '\\(J_G = ' + f(v.JpG, 3) + '\\times' + f(v.KJG, 3) + ' = ' + f(v.JG, 3) + '\\)' : null },
          ] },
        { id: 'i', title: 'Pitting geometry factor I (helical) and elastic coefficient C_p (F12 · M14)', eq: '14-21 … 14-25', fig: ['t14-8', 'mt10-1', 'mt10-2'],
          formula: 'Z = \\sqrt{(r_P+a)^2 - r_{bP}^2} + \\sqrt{(r_G+a)^2 - r_{bG}^2} - (r_P+r_G)\\sin\\phi_t,\\quad p_N = p_n\\cos\\phi_n,\\quad m_N = \\frac{p_N}{0.95Z},\\quad I = \\frac{\\cos\\phi_t\\sin\\phi_t}{2m_N}\\frac{m_G}{m_G+1}',
          text: 'Auto \\(I\\) = Eq. 14-23 with the load-sharing ratio \\(m_N\\); Z is capped at \\((r_P + r_G)\\sin\\phi_t\\) per term. The guides read Mott Table 10-1 (value below; tutorial 0.199 vs 0.190) — type it to use it. Steel \\(C_p = 2300\\sqrt{\\text{psi}}\\), \\(C_f = 1\\).',
          after: v => has(v, 'phin', 'psi', 'NP', 'NG') && IMott(v.phin, v.psi, v.NP, v.NG) !== undefined ? 'Mott Table 10-' + (v.phin === 25 ? '2' : '1') + ' (guides route), interpolated for N_P = ' + f(v.NP) + ', N_G = ' + f(v.NG) + ', \\(\\psi\\) = ' + f(v.psi) + '°: I = ' + f(IMott(v.phin, v.psi, v.NP, v.NG), 4) + (v.psi < 15 || v.psi > 25 ? ' (helix outside 15–25°: nearest table part)' : '') + '.' : '',
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
            { id: 'Cp', symbol: 'C_p', label: 'Elastic coefficient', unit: '\\(\\sqrt{\\text{psi}}\\)', kind: 'lookup', fig: 't14-8', default: 2300, hint: '2300 for steel on steel', check: v => v.Cp !== undefined && Math.abs(v.Cp - 2300) > 1 ? 'steel on steel is \\(2300\\sqrt{\\text{psi}}\\)' : null },
            { id: 'Cf', symbol: 'C_f', label: 'Surface condition factor', kind: 'input', default: 1, hint: '1 (course)', check: v => v.Cf !== undefined && v.Cf !== 1 ? 'course assumes C_f = 1' : null },
          ] },
      ] },

      { title: 'AGMA stress numbers — use the transverse pitch \\(P_t\\) (Fizz helical step 13 → spur steps 32–35)', steps: [
        { id: 'sb', title: 'Bending stress \\(\\sigma\\) (F13 → spur F32)', eq: '14-15', fig: ['f14-17'],
          formula: '\\sigma = W_t K_o K_v K_s\\frac{P_t}{F}\\frac{K_m K_B}{J}',
          text: 'The transverse pitch \\(P_t = P_n\\cos\\psi\\) goes in the bending equation (and in \\(d_P\\)).',
          vars: [
            { id: 'sP', symbol: '\\sigma_P', label: 'Pinion bending stress', unit: 'psi', kind: 'calc', compute: v => has(v, 'Wt', 'Ko', 'Kv', 'KsP', 'Pt', 'F', 'Km', 'KB', 'JP') ? v.Wt * v.Ko * v.Kv * v.KsP * v.Pt / v.F * v.Km * v.KB / v.JP : undefined,
              work: v => v.sP !== undefined ? '\\(\\sigma_P = ' + f(v.Wt) + '(' + f(v.Ko) + ')(' + f(v.Kv) + ')(' + f(v.KsP) + ')\\frac{' + f(v.Pt) + '}{' + f(v.F) + '}\\frac{' + f(v.Km, 4) + '(' + f(v.KB) + ')}{' + f(v.JP, 3) + '} = ' + f(v.sP) + '\\ \\mathrm{psi}\\)' : null },
            { id: 'sG', symbol: '\\sigma_G', label: 'Gear bending stress', unit: 'psi', kind: 'calc', compute: v => has(v, 'Wt', 'Ko', 'Kv', 'KsG', 'Pt', 'F', 'Km', 'KB', 'JG') ? v.Wt * v.Ko * v.Kv * v.KsG * v.Pt / v.F * v.Km * v.KB / v.JG : undefined,
              work: v => v.sG !== undefined ? '\\(\\sigma_G = ' + f(v.Wt) + '(' + f(v.Ko) + ')(' + f(v.Kv) + ')(' + f(v.KsG) + ')\\frac{' + f(v.Pt) + '}{' + f(v.F) + '}\\frac{' + f(v.Km, 4) + '(' + f(v.KB) + ')}{' + f(v.JG, 3) + '} = ' + f(v.sG) + '\\ \\mathrm{psi}\\)' : null },
          ] },
        { id: 'sc', title: 'Contact stress \\(\\sigma_c\\) (spur F34)', eq: '14-16', fig: ['f14-18'],
          formula: '\\sigma_c = C_p\\sqrt{W_t K_o K_v K_s\\frac{K_m}{d_P F}\\frac{C_f}{I}}',
          vars: [
            { id: 'scP', symbol: '(\\sigma_c)_P', label: 'Contact stress, pinion', unit: 'psi', kind: 'calc', compute: v => has(v, 'Cp', 'Wt', 'Ko', 'Kv', 'KsP', 'Km', 'dP', 'F', 'Cf', 'I') ? v.Cp * Math.sqrt(v.Wt * v.Ko * v.Kv * v.KsP * v.Km / (v.dP * v.F) * v.Cf / v.I) : undefined,
              work: v => v.scP !== undefined ? '\\((\\sigma_c)_P = ' + f(v.Cp) + '\\sqrt{' + f(v.Wt) + '(' + f(v.Ko) + ')(' + f(v.Kv) + ')(' + f(v.KsP) + ')\\frac{' + f(v.Km, 4) + '}{' + f(v.dP) + '(' + f(v.F) + ')}\\frac{' + f(v.Cf) + '}{' + f(v.I, 4) + '}} = ' + f(v.scP) + '\\ \\mathrm{psi}\\)' : null },
            { id: 'scG', symbol: '(\\sigma_c)_G', label: 'Contact stress, gear', unit: 'psi', kind: 'calc', compute: v => has(v, 'scP', 'KsP', 'KsG') ? v.scP * Math.sqrt(v.KsG / v.KsP) : undefined },
          ] },
      ] },

      { title: 'Life, reliability and strength modifiers (spur Fizz steps 25–31 · Mech steps 21, 29)', steps: [
        { id: 'rel', title: 'Reliability K_R, temperature K_T, design factor (spur F25–27)', eq: '14-38', fig: ['t14-10'],
          text: 'Guides: 99 % → \\(K_R = 1.00\\) (90 % → 0.85); size with design factor 1, then a steel giving \\(1.0 \\le S_F \\le 1.5\\). \\(K_T = 1\\) below 250 °F.',
          vars: [
            { id: 'R', symbol: 'R', label: 'Reliability', kind: 'input', default: 0.99, hint: '0.99 (guides) · 0.90 · 0.999' },
            { id: 'KR', symbol: 'K_R', label: 'Reliability factor', kind: 'lookup', fig: 't14-10', digits: 3, hint: 'Table 14-10: 0.99 → 1.00, 0.90 → 0.85', auto: v => { if (!has(v, 'R')) return undefined; if (KR[v.R] !== undefined) return KR[v.R]; return v.R < 0.99 ? 0.658 - 0.0759 * Math.log(1 - v.R) : 0.5 - 0.109 * Math.log(1 - v.R); } },
            { id: 'KT', symbol: 'K_T', label: 'Temperature factor', kind: 'input', default: 1, hint: '1 for T < 250 °F', check: v => v.KT !== undefined && v.KT !== 1 ? 'course always assumes K_T = 1' : null },
            { id: 'SFd', symbol: '(S_F)_d', label: 'Design factor of safety', kind: 'input', default: 1, hint: '1.0 (course); target 1.0–1.5', check: v => v.SFd !== undefined && (v.SFd < 1 || v.SFd > 1.5) ? 'AGMA suggests 1.0–1.5' : null },
          ] },
        { id: 'life', title: 'Design life, load cycles, Y_N and Z_N (spur F28–31)', fig: ['cyn', 'czn', 'f14-14', 'f14-15', 'mlife'],
          formula: 'N = n \\times 60 \\times \\tfrac{h}{day} \\times \\tfrac{days}{yr} \\times yr = 60\\,L\\,n\\,q,\\quad Y_N = 1.3558N^{-0.0178}\\ (N\\ge3\\times10^6),\\quad Z_N = 1.4488N^{-0.023}\\ (N\\ge10^7)',
          text: 'Life = (h/day)(days/yr)(years) or hours; blank uses 20 000 h. Upper “normal commercial” lines beyond the knee. Tutorial 4: \\(10^8\\) cycles → \\(Y_N\\) 0.977, \\(Z_N\\) 0.948.',
          vars: [
            { id: 'hpd', symbol: 'h/day', label: 'Hours per day (optional)', unit: 'h', kind: 'input' },
            { id: 'dpy', symbol: 'days/yr', label: 'Days per year (optional)', unit: 'd', kind: 'input' },
            { id: 'yrs', symbol: 'yr', label: 'Years of service (optional)', unit: 'yr', kind: 'input' },
            { id: 'Lh', symbol: 'L', label: 'Design life', unit: 'h', kind: 'lookup', fig: 'mlife', hint: 'auto = (h/day)(days/yr)(yr) if given, else 20 000 h (Mott Table 9-12)', auto: v => has(v, 'hpd', 'dpy', 'yrs') ? v.hpd * v.dpy * v.yrs : L_DEF },
            { id: 'q', symbol: 'q', label: 'Load applications per revolution', kind: 'input', default: 1 },
            { id: 'NcP', symbol: 'N_P', label: 'Pinion load cycles', kind: 'calc', digits: 4, compute: v => has(v, 'Lh', 'nP', 'q') ? 60 * v.Lh * v.nP * v.q : undefined, work: v => v.NcP !== undefined ? '\\(N_P = 60(' + f(v.Lh) + ')(' + f(v.nP) + ')(' + f(v.q) + ') = ' + f(v.NcP) + '\\)' : null },
            { id: 'NcG', symbol: 'N_G', label: 'Gear load cycles', kind: 'calc', digits: 4, compute: v => has(v, 'Lh', 'nG', 'q') ? 60 * v.Lh * v.nG * v.q : undefined },
            { id: 'YNP', symbol: '(Y_N)_P', label: 'Y_N pinion', kind: 'lookup', fig: 'cyn', digits: 4, hint: 'auto = Fig. 14-14 equations (commercial line)', auto: v => has(v, 'NcP') ? YN_auto(v.NcP) : undefined, work: v => has(v, 'NcP') ? YNw('(Y_N)_P', v.NcP) : null },
            { id: 'YNG', symbol: '(Y_N)_G', label: 'Y_N gear', kind: 'lookup', fig: 'cyn', digits: 4, auto: v => has(v, 'NcG') ? YN_auto(v.NcG) : undefined, work: v => has(v, 'NcG') ? YNw('(Y_N)_G', v.NcG) : null },
            { id: 'ZNP', symbol: '(Z_N)_P', label: 'Z_N pinion', kind: 'lookup', fig: 'czn', digits: 4, hint: 'auto = Fig. 14-15 equations (commercial line)', auto: v => has(v, 'NcP') ? ZN_auto(v.NcP) : undefined, work: v => has(v, 'NcP') ? ZNw('(Z_N)_P', v.NcP) : null },
            { id: 'ZNG', symbol: '(Z_N)_G', label: 'Z_N gear', kind: 'lookup', fig: 'czn', digits: 4, auto: v => has(v, 'NcG') ? ZN_auto(v.NcG) : undefined, work: v => has(v, 'NcG') ? ZNw('(Z_N)_G', v.NcG) : null },
          ] },
      ] },

      { title: 'Required strength and hardness — design (spur Fizz steps 33, 35, 37–38, 40)', steps: [
        { id: 'req', title: 'Required S_t, S_c and Brinell hardness → pick a steel (spur F33–38)', eq: '14-17, 14-18', fig: ['f14-2', 'f14-5', 'mt9-8', 'mapp3a', 'mapp3b', 'mapp5', 't14-3', 't14-6', 'm-t2-2', 'm-t2-9', 'm-t2-8', 'm-f2-12'],
          formula: 'S_{t,req} = \\frac{\\sigma(S_F)_d K_T K_R}{Y_N},\\quad S_{c,req} = \\frac{\\sigma_c(S_H)_d K_T K_R}{Z_N};\\qquad H_B = \\frac{S_t-12\\,800}{77.3},\\ H_B = \\frac{S_c-29\\,100}{322}\\ (\\text{grade 1})',
          text: 'Minimum \\(S_t\\), \\(S_c\\) at \\(S_F = 1\\) (tutorial 5.9 and 66.2 ksi), then a Grade 1 steel above the hardness (tutorial: 4140 OQT1300 HB 235 → \\(S_H = 1.58\\); 4140 annealed HB 197 → 1.40). Enter the chosen HB below.',
          vars: [
            { id: 'grade', label: 'Steel grade', kind: 'choice', options: [{ label: 'Grade 1 (guides and course default)', value: 1 }, { label: 'Grade 2', value: 2 }], default: 1 },
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
          after: v => v.HBreq === undefined ? '' : (v.HBreq > 400 ? okbad(false, 'Required ' + f(v.HBreq, 3) + ' HB > 400: through-hardening not adequate — specify flame/induction-hardened or carburized grade-1 steel (Tables 14-3/14-6) or enlarge the gears.') : okbad(true, 'Specify a through-hardened grade-' + v.grade + ' steel with H_B of at least ' + f(Math.ceil(v.HBreq), 3) + ' for both gears (' + (v.HBcP >= v.HBbP ? 'pitting' : 'bending') + ' governs)' + (v.HBreq < 180 ? ' — below the AGMA data range, any steel of 180 HB or more is fine' : '') + '.')) },
      ] },

      { title: 'Check a chosen material — factors of safety (spur Fizz step 36)', steps: [
        { id: 'mat', title: 'Material strengths and hardness-ratio factor C_H', eq: '14-36', fig: ['f14-2', 'f14-5', 'f14-12', 't14-3', 't14-6', 'mapp3a', 'mapp3b', 'm-f9-20'],
          vars: [
            { id: 'HBP', symbol: 'H_{BP}', label: 'Pinion Brinell hardness', unit: 'HB', kind: 'input' },
            { id: 'HBG', symbol: 'H_{BG}', label: 'Gear Brinell hardness', unit: 'HB', kind: 'input', hint: 'auto = pinion H_B (guides: same material for both)', auto: v => v.HBP },
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
            { id: 'SH2P', symbol: '(S_H)_P^2', label: 'Compare with \\(S_F\\) (pinion)', kind: 'calc', digits: 3, compute: v => v.SHP !== undefined ? v.SHP * v.SHP : undefined },
            { id: 'SH2G', symbol: '(S_H)_G^2', label: 'Compare with S_F (gear)', kind: 'calc', digits: 3, compute: v => v.SHG !== undefined ? v.SHG * v.SHG : undefined },
          ],
          after: v => {
            if (!has(v, 'SFP', 'SFG', 'SHP', 'SHG')) return '<i>Enter a material (hardness or S_t/S_c) to get the factors of safety.</i>';
            const d = v.SFd || 1; const mn = Math.min(v.SFP, v.SFG, v.SHP, v.SHG);
            const txt = 'Pinion: S_F = ' + f(v.SFP, 3) + ', S_H = ' + f(v.SHP, 3) + ' (S_H^2 = ' + f(v.SH2P, 3) + ') → threat is ' + (v.SFP < v.SH2P ? 'bending' : 'wear') + '. Gear: S_F = ' + f(v.SFG, 3) + ', S_H = ' + f(v.SHG, 3) + ' (S_H^2 = ' + f(v.SH2G, 3) + ') → threat is ' + (v.SFG < v.SH2G ? 'bending' : 'wear') + '. ';
            const range = mn > 1.5 ? ' Governing factor ' + f(mn, 3) + ' is above the AGMA 1.0–1.5 target — conservative.' : ' Governing factor ' + f(mn, 3) + ' lies in the AGMA 1.0–1.5 target range.';
            return mn >= d ? okbad(true, 'PASS — all factors of safety are at least ' + f(d) + '. ' + txt + range) : okbad(false, 'FAIL — minimum factor of safety ' + f(mn, 3) + ' < ' + f(d) + '. ' + txt + 'Harden / case-harden, widen F, reduce P_n or raise quality.');
          } },
      ] },
    ],
  };
})();
