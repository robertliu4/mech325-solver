/* Rack & pinion — Shigley 11e. Kinematics follow the Fizz p75 / Mech p114 procedure (Mott Sec. 8-13 / Table 8-10, which Shigley
 * does not cover); the tooth-strength check reuses the Shigley spur-gear AGMA bending equation (Ch. 14).
 * Defaults follow the Fizz / Mech guide assumptions (TOPIC.assumptions, cited by guide page): the rack pages (Fizz pp 75-76, Mech
 *   pp 114-115) cover the kinematics only; the bending add-on uses the guides' spur-gear assumptions (φ = 20°, F = nominal 12/Pd,
 *   Av from Table 9-5 → A10 ↔ Q7, Ks from Table 9-2 (1.00 for Pd ≥ 5), Cma commercial enclosed, KB = 1, KR = 1 at 99 %, SF = 1, grade-1
 *   steel St = 77.3 HB + 12 800) plus the course conventions (v2/COURSE_CONVENTIONS.md §7, §11): rack = interference limit
 *   NP = 2k/sin²φ (Gear Trains Tut 1 Q3h → 18 teeth at 20°), Ko 1.0 pre-filled, Kv by Eq. 14-27, YN = 1 (10^7), KT = 1, and the plastic-gear
 *   Lewis check of Helical/Bevel s31–34 (σt = Wt Pd SF/(F Y), Mott Table 9-15 Y).
 * Verified against: Mott Ex. 8-9 (24 T, Pd 6, 125 rpm, 20 ft → DP 4.000, B 1.333, B-C 3.333 in, Vrack 130.9 ft/min, t 9.167 s, 19.09 rev)
 *   and Gear Trains Tut 1 Q3h (20° FD pinion with a rack → NP,min = 2/sin²20° = 17.1 → 18 teeth). The example's bending part (1 hp, F 1 in,
 *   Q_v 7, J 0.37 = Fig. 14-6 for 24 T with the 1000-tooth/rack curve — was 0.35, a mis-read) is illustrative: Wt 252.1 lbf, σ 5 373 psi. */
(function () {
  const r = d => d * Math.PI / 180, fmt = (x, d) => H.fmt(x, d);
  const has = (v, ...a) => H.has(v, ...a);
  const sq = Math.sqrt;
  const STD_P = [2, 2.25, 2.5, 3, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48];   // Table 13-2 diametral pitches
  const STD_M = [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 25];   // Table 13-2 preferred modules
  // standard diametral pitch list with Use buttons; ★ = the pitch in use
  const stdTable = (v, o) => {
    const cur = v[o.Pd], N = v[o.N], S = o.sym || 'P_d';
    const near = (x, l) => l.reduce((a, b) => Math.abs(b - x) < Math.abs(a - x) ? b : a);
    const rows = o.list.map(p => ({ cells: [H.fmt(p), H.fmt(25.4 / p, 3), H.fmt(near(25.4 / p, o.mods)), N > 0 ? H.fmt(N / p, 4) : '—'], pick: p === cur, set: { [o.Pd]: p } }));
    return H.table(['\\(' + S + '\\)', '\\(m = 25.4/' + S + '\\) (mm)', 'nearest std. \\(m\\)', o.dlabel || '\\(d_P\\) (in)'], rows, {
      caption: 'Standard diametral pitches (' + o.ref + ')' + (o.list.indexOf(cur) >= 0 ? ' — ★ = in use' : (cur > 0 ? ' — ' + H.fmt(cur) + ' is not in this list' : '')),
      note: '“Use” sets \\(' + S + '\\); a given module converts with \\(' + S + ' = 25.4/m\\) (' + o.mref + ').' });
  };
  // Mott Table 8-10 (example rack specifications): Pd → B (pitch line to back), overall thickness, face width
  // Course Helical/Bevel s33 (Mott Table 9-15) Lewis Y, load near the pitch point: N → [14.5° FD, 20° FD, 20° stub]
  const Y915_N = [26, 28, 30, 34, 38, 43, 50];
  const Y915 = { 14.5: [0.522, 0.535, 0.540, 0.553, 0.566, 0.575, 0.588], 20: [0.588, 0.597, 0.606, 0.628, 0.651, 0.672, 0.694], stub: [0.678, 0.688, 0.698, 0.714, 0.729, 0.739, 0.758] };
  const lewisY = (N, phi) => (N >= 26 && N <= 50 && Y915[phi]) ? H.interp(N, Y915_N, Y915[phi]) : undefined;
  // Course spur K_m rule (Gear Stress s16–20): Cpf with the 0.05 floor, Cma curve 2 commercial enclosed, Cmc = Cpm = Ce = 1
  const Cpf = (F, d) => { let x = F / (10 * d); if (x < 0.05) x = 0.05; return F <= 1 ? x - 0.025 : x - 0.0375 + 0.0125 * F; };
  const Cma = F => 0.127 + 0.0158 * F - 0.930e-4 * F * F;
  const T810 = { 64: [0.109, 0.125, 0.125], 48: [0.104, 0.125, 0.125], 32: [0.156, 0.187, 0.187], 24: [0.208, 0.250, 0.25], 20: [0.450, 0.500, 0.5], 16: [0.688, 0.750, 0.75], 12: [0.917, 1.000, 1], 10: [1.150, 1.250, 1.25], 8: [1.375, 1.500, 1.5], 6: [1.333, 1.500, 2], 5: [1.300, 1.500, 2.5], 4: [1.750, 2.000, 3.5] };
  // Mott Table 9-2 size factor (Mech p.80): 1.00 for Pd ≥ 5, interpolated below.
  const ksTable = Pd => Pd >= 5 ? 1.0 : H.interp(Pd, [1.25, 2, 3, 4, 5], [1.40, 1.25, 1.15, 1.05, 1.00]);
  // Table 9-5 pitch-line-speed rows (the guides' fallback for A_v); A4 is beyond the Kv charts, so the lowest used is A6.
  const avSpeed = vt => vt <= 800 ? 10 : vt <= 2000 ? 8 : 6;

  window.TOPIC = {
    id: 'rack', book: 'shigley',
    title: 'Rack & Pinion — Kinematics, Forces & Tooth Strength',
    subtitle: 'Fizz p. 75 / Mech p. 114 procedure (rack data from Mott Table 8-10) · strength check via Shigley Ch. 14 spur equations',
    sibling: 'rack_mott.html',
    intro: 'A pinion driving a straight rack. Shigley has no rack section, so the kinematics and dimension \\(B\\) come from Mott (Sec. 8-13, Table 8-10). Enter \\(P_d\\), \\(N_P\\), \\(n_P\\) and the travel → \\(D_P\\), centre-to-rack-back, rack speed, time, pinion turns → forces with directions → bending check with Eq. 14-15 (J from the rack curve of Fig. 14-6). For contact stress carry \\(W_t\\) to the <a href=\"spur_shigley.html\">spur-gear calculator</a>. Example = Mott Ex. 8-9 (24T, \\(P_d\\) = 6, 125 rpm, 20 ft).',
    example: { Pd: 6, NP: 24, nP: 125, s: 20, phi: 20, H: 1, Ko: 1.0, Qv: 7, F: 1.0, JP: 0.37, HB: 200, SFd: 1 },

    assumptions: [
      { text: '\\(\\phi\\) = 20° full depth unless given', src: 'Fizz p.42 · Mech p.79', var: 'phi' },
      { text: 'Rack \\(B\\), thickness and face width from Mott Table 8-10 when \\(P_d\\) is listed (manufacturer data in practice)', src: 'Fizz p.76 · Mech p.115', var: 'B' },
      { text: 'Smallest pinion with a rack: \\(N_P = 2k/\\sin^2\\phi\\), full depth \\(k = 1\\) (18 teeth at 20°)', src: 'course Gear Trains Tut 1 Q3h', var: 'k' },
      { text: 'No face width given → nominal \\(F = 12/P_d\\) (range \\(8/P_d\\) … \\(16/P_d\\))', src: 'Fizz p.40 · Mech p.77', var: 'F' },
      { text: '\\(K_o\\) for the stated shocks; pre-filled 1.00 (uniform/uniform, tutorials)', src: 'Mech p.74 · course Gear Stress s12', var: 'Ko' },
      { text: 'Quality not given → \\(A_v\\) = 10, i.e. \\(Q_v\\) = 7 (ordinary drives below 800 ft/min)', src: 'Fizz p.41 · Mech p.77', var: 'Qv' },
      { text: '\\(K_s\\) from Mott Table 9-2: 1.00 for \\(P_d \\ge 5\\)', src: 'Mech p.80 · course Gear Stress s15', var: 'Ks' },
      { text: '\\(K_m = 1 + C_{pf} + C_{ma}\\), commercial enclosed (\\(C_{mc} = C_{pm} = C_e = 1\\))', src: 'Fizz p.44 · Mech p.80 · course Gear Stress s19–20', var: 'Km' },
      { text: '\\(K_B = 1\\), \\(K_R = 1\\) (99 %), \\(K_T = 1\\), \\(Y_N = 1\\) (\\(10^7\\) cycles) — other lives in the spur calculator', src: 'Fizz p.45 · Mech p.81–82 · course Gear Stress s37–39', step: 'st' },
      { text: 'Solve with \\(S_F = 1\\), then pick a steel with \\(S_F\\) of 1 … 1.5', src: 'Fizz p.45 · Mech p.82', var: 'SFd' },
      { text: 'Through-hardened grade 1 steel, \\(S_t = 77.3H_B + 12\\,800\\) psi', src: 'Mech p.84 · Fizz p.40', var: 'sat' },
      { text: 'Plastic pinion: overload SF = 1 in the Lewis check unless given', src: 'course Helical/Bevel s33', var: 'SFp' },
    ],

    figures: [
      { id: 'f8-45', ref: 'Figure 8-45', title: 'Rack driven by a pinion — \\(B\\), overall thickness, pitch line, rack velocity', src: 'figures/mott/fig8-45.png', page: 366, book: 'mott' },
      { id: 't8-10', ref: 'Table 8-10', title: 'Example rack specifications: pitch line to back \\(B\\), thickness, face width vs \\(P_d\\)', src: 'figures/mott/table8-10.png', page: 367, book: 'mott', note: 'Auto-fill uses this table when \\(P_d\\) is listed.' },
      { id: 'f8-46', ref: 'Figure 8-46', title: 'Pinion and rack of Mott Example 8-9', src: 'figures/mott/fig8-46.png', page: 367, book: 'mott' },
      { id: 'f13-29', ref: 'Figure 13-29', title: 'Spur-gear tooth forces (\\(W_t\\), \\(W_r\\), \\(W\\)) — same on a rack tooth', src: 'figures/shigley/fig13-29.png', page: 732, note: '\\(W_r = W_t\\tan\\phi\\) separates pinion and rack; \\(W_t\\) acts along the rack.' },
      { id: 'ko', ref: 'Figure 14-17', title: 'Table of overload factors \\(K_o\\) (bottom of the spur bending road map)', src: 'figures/shigley/fig14-17-ko.png', page: 793, note: 'Rows = power source, columns = driven machine; uniform/uniform = 1.00.' },
      { id: 't9-5', ref: 'Table 9-5', book: 'mott', title: 'Recommended AGMA quality numbers \\(A_v\\) (by application or pitch-line speed)', src: 'figures/mott/table9-5.png', page: 399, note: '\\(Q_v = 17 - A_v\\). Speed rows: to 800 ft/min A10, 2000 A8, 4000 A6, above A4.' },
      { id: 'f14-9', ref: 'Figure 14-9', title: 'Dynamic factor \\(K_v\\) (Eqs. 14-27, 14-28 with \\(Q_v\\))', src: 'figures/shigley/fig14-9.png', page: 785 },
      { id: 't9-2', ref: 'Table 9-2', book: 'mott', title: 'Suggested size factors \\(K_s\\) (the table the Mech guide uses)', src: 'figures/mott/table9-2.png', page: 395, note: '\\(K_s\\) = 1.00 for \\(P_d \\ge 5\\); 1.05 (4), 1.15 (3), 1.25 (2), 1.40 (1.25).' },
      { id: 'f14-6', ref: 'Figure 14-6', title: 'Spur geometry factor \\(J\\) — use the rack / 1000-teeth mate curve for the pinion', src: 'figures/shigley/fig14-6.png', page: 780, note: 'Pinion: ordinate \\(N_P\\), mate curve 1000 (rack).' },
      { id: 'f14-2', ref: 'Figure 14-2', title: 'Allowable bending stress for through-hardened steel (grade 1: \\(S_t = 77.3H_B + 12\\,800\\) psi)', src: 'figures/shigley/fig14-2.png', page: 773 },
      // ---- course-only slides ----
      { id: 'cko', ref: 'Gear Stress s12', book: 'course', title: 'Overload factor \\(K_o\\) — Shigley table and Mott Table 9-1 side by side', src: 'figures/course/ko_shigley_vs_mott.png', note: 'Either accepted; tutorials use \\(K_o\\) = 1.' },
      { id: 'ckv', ref: 'Gear Stress s14', book: 'course', title: '\\(K_v\\) analytical method and Mott Table 9-4: \\(A_v = 17 - Q_v\\)', src: 'figures/course/gear_kv_q_av_table.png' },
      { id: 'ckm', ref: 'Gear Stress s19', book: 'course', title: '\\(K_m\\) (Shigley form) with the course annotations: \\(C_{mc} = C_e = 1\\)', src: 'figures/course/gear_km_shigley_annotated.png' },
      { id: 'ccma', ref: 'Gear Stress s20', book: 'course', title: '\\(C_{pf}\\) and \\(C_{ma}\\) — “default to curve 2 (commercial enclosed gear units)”', src: 'figures/course/gear_cma_curve2.png' },
      { id: 'cteeth', ref: 'Helical/Bevel s33', book: 'course', title: 'Plastic-gear Lewis stress \\(\\sigma_t = W_tP_d(SF)/(FY)\\), Mott Table 9-15 \\(Y\\), standard tooth proportions', src: 'figures/course/standard_gear_teeth_table.png', note: '\\(Y\\) for load near the pitch point, 26–50 teeth.' },
      { id: 'm-t8-7', ref: 'Table 8-7', book: 'mott', title: 'Number of pinion teeth to ensure no interference (rack: 32/18/12)', src: 'figures/mott/table8-7.png', page: 338, note: 'Gear Kinematics s27: 20° full depth needs at least 18 teeth with a rack.' },
      { id: 'm-t9-14', ref: 'Table 9-14', book: 'mott', title: 'Approximate allowable bending stress \\(s_{at}\\) for plastic gears (unfilled / glass-filled)', src: 'figures/mott/table9-14.png', page: 431, note: 'Helical/Bevel s32 (plastic gears, Mott).' },
      { id: 'khk106', ref: 'KHK p.T106', book: 'course', title: 'KHK plastic spur gears: Lewis bending strength \\(F = myb\\sigma_bK_v\\) (Nylon MC901) and its factors', src: 'figures/course/khk_plastic_spur_bending_strength_t106.png', note: 'KHK Gears Technical Information p.T106; Helical/Bevel s34.' },
      { id: 'khk107', ref: 'KHK p.T107', book: 'course', title: 'KHK plastic gears: speed factor and temperature factor charts, surface (Hertz) strength of Duracon spur gears and allowable surface stress', src: 'figures/course/khk_plastic_spur_factors_surface_strength_t107.png', note: 'KHK Gears Technical Information p.T107.' },
    ],

    sections: [
      { title: '1 · Given', steps: [
        { id: 'in', title: 'Pinion, rack and duty', fig: ['f8-45'],
          vars: [
            { id: 'Pd', symbol: 'P_d', label: 'Diametral pitch', unit: 'teeth/in', kind: 'input' },
            { id: 'NP', symbol: 'N_P', label: 'Pinion teeth', kind: 'input' },
            { id: 'nP', symbol: 'n_P', label: 'Pinion speed', unit: 'rev/min', kind: 'input' },
            { id: 's', symbol: 's_{rack}', label: 'Rack travel of interest', unit: 'ft', kind: 'input', hint: 'optional — for time and revolutions' },
            { id: 'phi', symbol: '\\phi', label: 'Pressure angle', unit: '°', kind: 'choice', options: [{ label: '20°', value: 20 }, { label: '25°', value: 25 }, { label: '14.5°', value: 14.5 }], default: 20 },
            { id: 'H', symbol: 'H', label: 'Power at the pinion (if a force analysis is wanted)', unit: 'hp', kind: 'input', hint: 'or give the rack force below' },
            { id: 'Frack', symbol: 'F_{rack}', label: 'Force the rack must deliver (alternative to H)', unit: 'lbf', kind: 'input' },
          ],
          after: v => stdTable(v, { Pd: 'Pd', N: 'NP', list: STD_P, mods: STD_M, ref: 'Table 13-2', mref: 'preferred modules, Table 13-2' }) },
      ] },

      { title: '2 · Kinematics (Fizz / Mech steps 1-6)', steps: [
        { id: 'k1', title: 'Steps 1-3 — pitch diameter, B, pinion centre to rack back', fig: ['t8-10', 'f8-46'],
          formula: 'D_P = \\frac{N_P}{P_d},\\qquad B\\text{-}C = B + \\frac{D_P}{2}',
          vars: [
            { id: 'DP', symbol: 'D_P', label: 'Pinion pitch diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'NP', 'Pd') ? v.NP / v.Pd : undefined, work: v => has(v, 'NP', 'Pd') ? '\\(D_P = ' + v.NP + '/' + fmt(v.Pd) + ' = ' + fmt(v.NP / v.Pd) + '\\) in' : null },
            { id: 'B', symbol: 'B', label: 'Pitch line to back of rack', unit: 'in', kind: 'lookup', fig: 't8-10', auto: v => has(v, 'Pd') && T810[v.Pd] ? T810[v.Pd][0] : undefined, hint: 'Table 8-10 (Mott) — manufacturer data in practice' },
            { id: 'thk', symbol: 't', label: 'Rack overall thickness (Table 8-10)', unit: 'in', kind: 'lookup', fig: 't8-10', auto: v => has(v, 'Pd') && T810[v.Pd] ? T810[v.Pd][1] : undefined },
            { id: 'Frk', symbol: 'F_{r}', label: 'Rack face width (Table 8-10)', unit: 'in', kind: 'lookup', fig: 't8-10', auto: v => has(v, 'Pd') && T810[v.Pd] ? T810[v.Pd][2] : undefined },
            { id: 'BC', symbol: 'B\\text{-}C', label: 'Back of rack to pinion centreline', unit: 'in', kind: 'calc', compute: v => has(v, 'B', 'DP') ? v.B + v.DP / 2 : undefined, work: v => has(v, 'B', 'DP') ? '\\(B\\text{-}C = ' + fmt(v.B) + ' + ' + fmt(v.DP) + '/2 = ' + fmt(v.B + v.DP / 2) + '\\) in' : null },
          ] },
        { id: 'intf', title: 'Interference check — smallest pinion that runs with a rack (Eq. 13-11 with an infinite gear)', fig: ['m-t8-7'], eq: '13-11, 13-13',
          formula: 'N_{P,min} = \\frac{2k}{\\sin^2\\phi}\\quad (k = 1\\ \\text{full depth}, 0.8\\ \\text{stub})',
          text: 'A rack is a gear of infinite radius, so Eq. 13-11 reduces to \\(N_P = 2k/\\sin^2\\phi\\): 17.1 → <b>18 teeth</b> at 20° (12 at 25°, 32 at 14.5°). Fewer teeth undercut the pinion.',
          vars: [
            { id: 'k', symbol: 'k', label: 'Addendum factor', kind: 'choice', options: [{ label: '1 — full depth', value: 1 }, { label: '0.8 — stub', value: 0.8 }], default: 1 },
            { id: 'NPmin', symbol: 'N_{P,min}', label: 'Minimum pinion teeth with a rack', kind: 'calc', digits: 4, compute: v => has(v, 'k', 'phi') ? 2 * v.k / Math.pow(Math.sin(r(v.phi)), 2) : undefined,
              work: v => has(v, 'k', 'phi') ? '\\(N_{P,min} = 2(' + v.k + ')/\\sin^2 ' + v.phi + '^\\circ = ' + fmt(2 * v.k / Math.pow(Math.sin(r(v.phi)), 2)) + ' \\rightarrow ' + Math.ceil(2 * v.k / Math.pow(Math.sin(r(v.phi)), 2) - 1e-9) + '\\) teeth' : null },
          ],
          after: v => has(v, 'NP', 'NPmin') ? (v.NP >= v.NPmin ? '<span class="result-ok">\\(N_P = ' + v.NP + '\\), at least ' + Math.ceil(v.NPmin - 1e-9) + ' — no interference with the rack</span>' : '<span class="result-bad">\\(N_P = ' + v.NP + '\\) is below ' + Math.ceil(v.NPmin - 1e-9) + ' — the rack will interfere (undercut) with this pinion</span>') : '' },
        { id: 'k2', title: 'Steps 4-6 — rack speed, time, pinion revolutions',
          formula: 'v_t = V_{rack} = \\frac{\\pi D_P n_P}{12}\\ \\text{ft/min},\\qquad t = \\frac{60\\,s_{rack}}{V_{rack}}\\ \\text{s},\\qquad \\theta_P = \\frac{12\\,s_{rack}}{\\pi D_P}\\ \\text{rev} = \\frac{6}{\\pi}\\cdot\\frac{2s_{rack}}{D_P}',
          text: 'Rack speed = pinion pitch-line speed; travel per pinion revolution = \\(\\pi D_P\\).',
          vars: [
            { id: 'Vrack', symbol: 'V_{rack}', label: 'Rack (and pitch-line) speed', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'DP', 'nP') ? Math.PI * v.DP * v.nP / 12 : undefined,
              work: v => has(v, 'DP', 'nP') ? '\\(V_{rack} = \\pi(' + fmt(v.DP) + ')(' + fmt(v.nP) + ')/12 = ' + fmt(Math.PI * v.DP * v.nP / 12) + '\\) ft/min' : null },
            { id: 'Vips', symbol: 'V_{rack}', label: 'Rack speed', unit: 'in/s', kind: 'calc', compute: v => has(v, 'Vrack') ? v.Vrack * 12 / 60 : undefined },
            { id: 'srev', symbol: 's/\\text{rev}', label: 'Rack travel per pinion revolution \\(\\pi D_P\\)', unit: 'in', kind: 'calc', compute: v => has(v, 'DP') ? Math.PI * v.DP : undefined },
            { id: 't', symbol: 't', label: 'Time to travel \\(s_{rack}\\)', unit: 's', kind: 'calc', compute: v => has(v, 's', 'Vrack') ? 60 * v.s / v.Vrack : undefined, work: v => has(v, 's', 'Vrack') ? '\\(t = 60(' + fmt(v.s) + ')/' + fmt(v.Vrack) + ' = ' + fmt(60 * v.s / v.Vrack) + '\\) s' : null },
            { id: 'thP', symbol: '\\theta_P', label: 'Pinion revolutions for \\(s_{rack}\\)', unit: 'rev', kind: 'calc', compute: v => has(v, 's', 'DP') ? 12 * v.s / (Math.PI * v.DP) : undefined, work: v => has(v, 's', 'DP') ? '\\(\\theta_P = 12(' + fmt(v.s) + ')/(\\pi\\cdot ' + fmt(v.DP) + ') = ' + fmt(12 * v.s / (Math.PI * v.DP)) + '\\) rev' : null },
          ] },
      ] },

      { title: '3 · Forces (Sec. 13-14 spur-gear force analysis)', steps: [
        { id: 'f', title: 'Tangential, radial and normal tooth forces', eq: '13-35, 13-36', fig: ['f13-29'],
          formula: 'T = \\frac{63\\,025\\,H}{n_P},\\quad W_t = \\frac{2T}{D_P} = \\frac{33\\,000\\,H}{V_{rack}},\\quad W_r = W_t\\tan\\phi,\\quad W = \\frac{W_t}{\\cos\\phi}',
          text: 'Driving pinion: \\(W_t\\) on the pinion opposes its rotation; on the rack it acts along the rack in the direction the rack moves (= pinion pitch-point velocity). \\(W_r\\) pushes the rack away from the pinion (carried by the rack guides) and the pinion toward its own centre. Given a rack force instead of power, the sheet works back to torque and power.',
          vars: [
            { id: 'Wt', symbol: 'W_t', label: 'Tangential force (on rack and pinion)', unit: 'lbf', kind: 'calc', compute: v => has(v, 'Frack') ? v.Frack : (has(v, 'H', 'Vrack') ? 33000 * v.H / v.Vrack : undefined),
              work: v => !has(v, 'Frack') && has(v, 'H', 'Vrack') ? '\\(W_t = 33\\,000(' + fmt(v.H) + ')/' + fmt(v.Vrack) + ' = ' + fmt(33000 * v.H / v.Vrack) + '\\) lbf' : null },
            { id: 'T', symbol: 'T', label: 'Pinion torque', unit: 'lbf·in', kind: 'calc', compute: v => has(v, 'Wt', 'DP') ? v.Wt * v.DP / 2 : undefined, work: v => has(v, 'Wt', 'DP') ? '\\(T = W_t D_P/2 = ' + fmt(v.Wt) + '(' + fmt(v.DP) + ')/2 = ' + fmt(v.Wt * v.DP / 2) + '\\) lbf·in' : null },
            { id: 'Hreq', symbol: 'H', label: 'Power at the pinion', unit: 'hp', kind: 'calc', compute: v => has(v, 'Wt', 'Vrack') ? v.Wt * v.Vrack / 33000 : undefined },
            { id: 'Wr', symbol: 'W_r', label: 'Radial (separating) force', unit: 'lbf', kind: 'calc', compute: v => has(v, 'Wt', 'phi') ? v.Wt * Math.tan(r(v.phi)) : undefined, work: v => has(v, 'Wt', 'phi') ? '\\(W_r = ' + fmt(v.Wt) + '\\tan ' + v.phi + '^\\circ = ' + fmt(v.Wt * Math.tan(r(v.phi))) + '\\) lbf' : null },
            { id: 'Wn', symbol: 'W', label: 'Normal force along the line of action', unit: 'lbf', kind: 'calc', compute: v => has(v, 'Wt', 'phi') ? v.Wt / Math.cos(r(v.phi)) : undefined },
          ] },
      ] },

      { title: '4 · Tooth bending check — spur-gear AGMA equation (Eq. 14-15)', text: 'The rack is a spur gear of infinite diameter, so the mesh is rated like a spur pair (bending only; contact stress in the <a href=\"spur_shigley.html\">spur-gear calculator</a>).', steps: [
        { id: 'fac', title: 'Face width and stress factors', eq: '14-27, 14-30', fig: ['ko', 'cko', 't9-5', 'f14-9', 'ckv', 't9-2', 'ckm', 'ccma', 'f14-6'],
          formula: 'K_v = \\left(\\frac{A + \\sqrt{V}}{A}\\right)^B,\\ B = 0.25(12 - Q_v)^{2/3},\\ A = 50 + 56(1 - B),\\qquad K_m = 1 + C_{pf} + C_{ma}',
          vars: [
            { id: 'F', symbol: 'F', label: 'Face width (pinion / rack, the smaller)', unit: 'in', kind: 'input', hint: 'auto = nominal \\(12/P_d\\); range \\(8/P_d\\) … \\(16/P_d\\)',
              auto: v => has(v, 'Pd') ? 12 / v.Pd : undefined },
            { id: 'Ko', symbol: 'K_o', label: 'Overload factor', kind: 'lookup', fig: 'ko', default: 1.0, hint: 'Fig. 14-17 table or Mott Table 9-1; 1.00 uniform' },
            { id: 'Qv', symbol: 'Q_v', label: 'Quality number (Mott \\(A_v\\) in brackets)', kind: 'choice', fig: 't9-5', options: [5, 6, 7, 8, 9, 10, 11].map(q => ({ label: 'Q_v = ' + q + '  (A_v = ' + (17 - q) + ')', value: q })), default: 7, hint: 'given, or Table 9-5 (\\(A_v\\) 10 = \\(Q_v\\) 7)',
              check: v => (has(v, 'Vrack', 'Qv') && 17 - v.Qv > avSpeed(v.Vrack)) ? 'Table 9-5 speed rows suggest \\(A_v\\) of ' + avSpeed(v.Vrack) + ' or better (\\(Q_v\\) at least ' + (17 - avSpeed(v.Vrack)) + ') at ' + fmt(v.Vrack) + ' ft/min' : null },
            { id: 'Kv', symbol: 'K_v', label: 'Dynamic factor', kind: 'lookup', fig: 'f14-9', auto: v => has(v, 'Qv', 'Vrack') ? (function () { const B = 0.25 * Math.pow(12 - v.Qv, 2 / 3), A = 50 + 56 * (1 - B); return Math.pow((A + sq(v.Vrack)) / A, B); })() : undefined, hint: 'auto = Eq. 14-27',
              work: v => has(v, 'Qv', 'Vrack') ? (function () { const B = 0.25 * Math.pow(12 - v.Qv, 2 / 3), A = 50 + 56 * (1 - B); return '\\(B = ' + fmt(B, 3) + ',\\ A = ' + fmt(A) + ',\\ K_v = ((' + fmt(A) + ' + \\sqrt{' + fmt(v.Vrack) + '})/' + fmt(A) + ')^{' + fmt(B, 3) + '} = ' + fmt(Math.pow((A + sq(v.Vrack)) / A, B)) + '\\)'; })() : null },
            { id: 'Ks', symbol: 'K_s', label: 'Size factor', kind: 'lookup', fig: 't9-2', auto: v => has(v, 'Pd') ? ksTable(v.Pd) : undefined, hint: 'auto = Mott Table 9-2 (1.00 for \\(P_d \\ge 5\\))' },
            { id: 'Cpf', symbol: 'C_{pf}', label: 'Pinion-proportion factor (Eq. 14-32, course 0.05 floor)', kind: 'calc', compute: v => has(v, 'F', 'DP') ? Cpf(v.F, v.DP) : undefined,
              work: v => has(v, 'F', 'DP') ? '\\(F/(10d_P) = ' + fmt(v.F / (10 * v.DP), 3) + (v.F / (10 * v.DP) < 0.05 ? ' \\rightarrow 0.05' : '') + ';\\ C_{pf} = ' + fmt(Cpf(v.F, v.DP), 3) + '\\)' : null },
            { id: 'Cma', symbol: 'C_{ma}', label: 'Mesh-alignment factor, commercial enclosed (Eq. 14-34 curve 2)', kind: 'calc', compute: v => has(v, 'F') ? Cma(v.F) : undefined,
              work: v => has(v, 'F') ? '\\(C_{ma} = 0.127 + 0.0158(' + fmt(v.F) + ') - 0.930(10^{-4})(' + fmt(v.F) + ')^2 = ' + fmt(Cma(v.F), 3) + '\\)' : null },
            { id: 'Km', symbol: 'K_m', label: 'Load-distribution factor', kind: 'lookup', fig: 'ckm', auto: v => has(v, 'Cpf', 'Cma') ? 1 + v.Cpf + v.Cma : undefined, hint: 'auto = \\(1 + C_{pf} + C_{ma}\\); override if given' },
            { id: 'JP', symbol: 'J', label: 'Geometry factor (pinion, mate = rack)', kind: 'lookup', fig: 'f14-6', hint: 'Fig. 14-6: ordinate \\(N_P\\), mate curve 1000 (rack); 24T → 0.37' },
          ] },
        { id: 'st', title: 'Bending stress and required hardness', eq: '14-15', fig: ['f14-2'],
          formula: '\\sigma = W_t K_o K_v K_s\\frac{P_d}{F}\\frac{K_m K_B}{J},\\qquad S_{t,min} = \\frac{\\sigma\\,S_F K_T K_R}{Y_N},\\qquad S_t = 77.3H_B + 12\\,800\\ (\\text{grade 1})',
          vars: [
            { id: 'sig', symbol: '\\sigma', label: 'Bending stress (pinion tooth)', unit: 'psi', kind: 'calc', compute: v => has(v, 'Wt', 'Ko', 'Kv', 'Ks', 'Pd', 'F', 'Km', 'JP') ? v.Wt * v.Ko * v.Kv * v.Ks * v.Pd / v.F * v.Km / v.JP : undefined,
              work: v => has(v, 'Wt', 'Ko', 'Kv', 'Ks', 'Pd', 'F', 'Km', 'JP') ? '\\(\\sigma = ' + fmt(v.Wt) + '(' + fmt(v.Ko) + ')(' + fmt(v.Kv) + ')(' + fmt(v.Ks) + ')\\frac{' + fmt(v.Pd) + '}{' + fmt(v.F) + '}\\frac{' + fmt(v.Km) + '(1)}{' + fmt(v.JP) + '} = ' + fmt(v.Wt * v.Ko * v.Kv * v.Ks * v.Pd / v.F * v.Km / v.JP, 5) + '\\) psi' : null },
            { id: 'SFd', symbol: 'S_{F,d}', label: 'Design factor of safety target', kind: 'input', default: 1, hint: 'solve with 1, then pick a steel giving 1 … 1.5' },
            { id: 'StMin', symbol: 'S_{t,min}', label: 'Minimum bending strength number \\(\\sigma S_{F,d}K_TK_R/Y_N\\)', unit: 'psi', kind: 'calc', compute: v => has(v, 'sig', 'SFd') ? v.sig * v.SFd : undefined, work: v => has(v, 'sig', 'SFd') ? '\\(S_{t,min} = ' + fmt(v.sig, 5) + '(' + fmt(v.SFd) + ')(1)(1)/1 = ' + fmt(v.sig * v.SFd, 5) + '\\) psi' : null },
            { id: 'HBreq', symbol: 'H_{B,req}', label: 'Required hardness (grade 1: \\((S_{t,min} - 12\\,800)/77.3\\))', unit: 'HB', kind: 'calc', digits: 3, compute: v => has(v, 'StMin') ? Math.max(0, (v.StMin - 12800) / 77.3) : undefined, work: v => has(v, 'StMin') ? '\\(H_B = (' + fmt(v.StMin, 5) + ' - 12\\,800)/77.3 = ' + fmt(Math.max(0, (v.StMin - 12800) / 77.3), 3) + '\\)' : null },
            { id: 'HB', symbol: 'H_B', label: 'Hardness of the chosen steel (grade 1 through-hardened; Mott Table 9-8 / App. 3)', unit: 'HB', kind: 'input', hint: '4140: annealed 197, OQT1300 235, OQT1000 341' },
            { id: 'sat', symbol: 'S_t', label: 'Allowable bending stress of the chosen steel', unit: 'psi', kind: 'lookup', fig: 'f14-2', auto: v => has(v, 'HB') ? 77.3 * v.HB + 12800 : undefined, hint: 'auto = Fig. 14-2 grade 1: \\(77.3H_B + 12\\,800\\)' },
            { id: 'SF', symbol: 'S_F', label: 'Actual bending safety factor \\(S_tY_N/(K_TK_R\\sigma)\\)', kind: 'calc', compute: v => has(v, 'sat', 'sig') ? v.sat / v.sig : undefined, work: v => has(v, 'sat', 'sig') ? '\\(S_F = ' + fmt(v.sat, 5) + '(1)/(1)(1)(' + fmt(v.sig, 5) + ') = ' + fmt(v.sat / v.sig, 3) + '\\)' : null },
          ],
          after: v => {
            if (!has(v, 'sig')) return '';
            let s = 'Required grade-1 through-hardened steel: at least ' + fmt(Math.max(0, Math.ceil(v.HBreq)), 3) + ' HB for \\(S_F\\) = ' + fmt(v.SFd) + '. Pick an alloy/heat treatment with this core hardness (Mott Table 9-8 / App. 3) and quote its % elongation.';
            if (has(v, 'SF')) s += v.SF >= v.SFd ? ' <span class="result-ok">PASS — \\(S_F\\) = ' + fmt(v.SF, 3) + ' with ' + v.HB + ' HB' + (v.SF > 1.5 ? ' (above the AGMA 1–1.5 range: a softer/cheaper steel would do)' : '') + '</span>' : ' <span class="result-bad">FAIL — \\(S_F\\) = ' + fmt(v.SF, 3) + ', below ' + fmt(v.SFd) + ' with ' + v.HB + ' HB</span>';
            return s;
          } },
      ] },

      { title: '5 · Plastic pinion — Lewis check (course Helical/Bevel s31–34, Mott Table 9-15)', text: 'Optional: plastic pinion — unmodified Lewis equation with \\(Y\\) for \\(J\\) and an overload SF; compare with the KHK catalogue strength for the true safety factor.', steps: [
        { id: 'plastic', title: 'Lewis bending stress in a plastic pinion', fig: ['cteeth', 'm-t9-14', 'khk106', 'khk107'],
          formula: '\\sigma_t = \\frac{W_t P_d\\,(SF)}{F\\,Y}',
          vars: [
            { id: 'Yform', symbol: '', label: 'Tooth form for Y', kind: 'choice', type: 'text', options: [{ label: '20° full depth', value: '20' }, { label: '14.5° full depth', value: '14.5' }, { label: '20° stub', value: 'stub' }], default: '20' },
            { id: 'Y', symbol: 'Y', label: 'Lewis form factor (load near pitch point)', kind: 'lookup', fig: 'cteeth', auto: v => has(v, 'NP', 'Yform') ? lewisY(v.NP, v.Yform) : undefined, hint: 'Table 9-15: 26–50 teeth; else Shigley Table 14-2' },
            { id: 'SFp', symbol: 'SF', label: 'Overload ("design") factor', kind: 'input', default: 1, hint: 'overload factor applied to the load' },
            { id: 'sigP', symbol: '\\sigma_t', label: 'Lewis bending stress', unit: 'psi', kind: 'calc', compute: v => has(v, 'Wt', 'Pd', 'SFp', 'F', 'Y') ? v.Wt * v.Pd * v.SFp / (v.F * v.Y) : undefined,
              work: v => has(v, 'Wt', 'Pd', 'SFp', 'F', 'Y') ? '\\(\\sigma_t = \\frac{' + fmt(v.Wt) + '(' + fmt(v.Pd) + ')(' + fmt(v.SFp) + ')}{' + fmt(v.F) + '(' + fmt(v.Y, 3) + ')} = ' + fmt(v.Wt * v.Pd * v.SFp / (v.F * v.Y), 5) + '\\) psi' : null },
            { id: 'sPl', symbol: '\\sigma_{all}', label: 'Plastic bending strength (catalogue)', unit: 'psi', kind: 'input', hint: 'KHK catalogue, e.g. nylon about 6 ksi, acetal 8 ksi' },
            { id: 'SFpl', symbol: 'SF_{true}', label: 'True safety factor \\(\\sigma_{all}/\\sigma_t\\)', kind: 'calc', compute: v => has(v, 'sPl', 'sigP') ? v.sPl / v.sigP : undefined },
          ],
          after: v => has(v, 'SFpl') ? (v.SFpl >= 1 ? '<span class="result-ok">Plastic pinion OK — \\(SF_{true}\\) = ' + fmt(v.SFpl, 3) + '</span>' : '<span class="result-bad">Plastic pinion FAILS — \\(SF_{true}\\) = ' + fmt(v.SFpl, 3) + ': wider face, coarser pitch or a stronger plastic</span>') : '' },
      ] },
    ],
  };
})();
