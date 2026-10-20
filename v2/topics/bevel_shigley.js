/* Straight bevel gears — Shigley 11e (Ch. 13-15 force analysis, Ch. 15 AGMA 2003-B97 rating).
 * Merged Fizz bible pp 59-68 + Mech bible pp 68-72, 98-106 procedure, in Shigley notation.
 * Defaults follow the Fizz / Mech guide assumptions (TOPIC.assumptions, cited by guide page), with the UBC MECH 325 course
 *   conventions (v2/COURSE_CONVENTIONS.md §9) where the guides are silent: φ = 20°, F = roundest value in the guides' F_nom … F_max
 *   (Shigley's Table 13-3 min(0.3A0, 10/Pd) shown beside),
 *   forces at r_av but stress with W^t = 33 000H/v_t at the large end, Ko from the table (1.00 pre-filled), A_v 10 ↔ Q_v 7 (Table 9-5),
 *   Kmb = 1.00 (Mott: both straddle unless noted), Kx = 1, no KB, R = 0.99 → KR = CR = 1, KL/CL commercial lines, KT = 1, SF = SH = 1,
 *   grade-1 steel, Cp = 2300, Cs = 0.125F + 0.4375, Cxc = 1.5 (properly crowned — "what we usually assume"), CH = 1.
 * J and I autos are digitised from Figs. 15-7 / 15-6 (pixel-traced; 25T/25T gives J 0.217, I 0.065 = Shigley Ex. 15-1).
 * Verified against: Gear Trains Tutorial 4 Q2 / Tutorial 5 (S 15-1/15-2: uncrowned 20/60 T, Pd 6, Qv 6, 300 HB, F 1.25, 900 rpm,
 *   10^9 pinion rev, R 0.999, pinion outboard + gear straddle, Ko = SF = SH = 1; course files give no numeric answer, so the numbers
 *   below are this sheet's, hand-checked against Shigley's method): dP 3.333, vt 785.4, Kv 1.374, Ks 0.5222, Km 1.106,
 *   KLP 0.9376 (1.3558 N^-0.0178), KLG 0.9561, KR 1.25, CR 1.118, sat 15 300 → swt,P 11 476 psi, swt,G 11 702 psi;
 *   JP 0.247 / JG 0.202 (Fig 15-7: 20T with 60T mate / 60T with 20T mate; the earlier 0.235 / 0.215 were mis-reads)
 *   → bending rating 17.7 hp (pinion) / 14.8 hp (gear); Cs 0.5938, Cxc 2 (uncrowned),
 *   I 0.083 (Fig 15-6), CL 1.000, sac 125 920 → swc 112 640 psi → W^t_wear 460 lbf → wear rating 10.95 hp (Cp 2300; 11.0 hp with
 *   Cp 2290) → gearset rated 10.95 ≈ 11 hp, wear-limited. Forces at r_av for H = 10.95 hp: TP 766.8 lbf·in, r_av,P 1.469 in, Wt 522 lbf. */
(function () {
  // engine.js (which defines window.H) loads after this file, so only call H lazily inside functions
  const r = d => d * Math.PI / 180, fmt = (x, d) => H.fmt(x, d);
  const has = (v, ...a) => H.has(v, ...a);
  const sq = Math.sqrt;
  const STD_P = [2, 2.25, 2.5, 3, 4, 6, 8, 10, 12, 16, 20, 24, 32];                                // Table 13-2 diametral pitches
  const STD_M = [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 25, 32, 40, 50];             // Table 13-2 preferred modules
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
    id: 'bevel', book: 'shigley',
    title: 'Straight Bevel Gears — Geometry, Forces & AGMA Stress',
    subtitle: 'Shigley Ch. 13-15 (forces) & Ch. 15 (ANSI/AGMA 2003-B97) · merged Fizz + Mech guide procedure',
    sibling: 'bevel_mott.html',
    intro: 'Straight bevel gears on 90° shafts in Shigley notation: cone geometry → forces with directions → AGMA bending \\(s_t\\) (Eq. 15-3) and contact \\(s_c\\) (Eq. 15-1) → permissible stresses → safety factors, required hardness and the power rating. Yellow = chart/table reading (auto estimate until you type yours). Example = Tutorial 5 (Shigley 15-1/15-2) at its ≈ 11 hp rating.',
    example: { H: 10.95, nP: 900, NP: 20, NG: 60, Pd: 6, F: 1.25, phi: 20, Ko: 1.0, Qv: 6, Kmb: 1.1, Cxc: 2, SF: 1, SH: 1, R: 0.999, NLin: 1e9, HB: 300, grade: 1, Cp: 2300, JP: 0.247, JG: 0.202, I: 0.083, KT: 1, CH: 1 },

    assumptions: [
      { text: 'Straight bevel teeth, 90° shafts, \\(\\phi\\) = 20° unless given (Figs. 15-6/15-7 are for 20°)', src: 'Fizz p.42, p.65 · Mech p.79, p.100', var: 'phi' },
      { text: 'Face width not given → the roundest value in \\(0.3A_0 \\le F \\le \\min(A_0/3, 10/P_d)\\) (“preferably a whole number”)', src: 'Fizz p.60 · Mech p.69', var: 'F' },
      { text: 'Shaft/bearing forces at the mean radius \\(r_{av}\\); AGMA stresses with \\(W^t = 2T/d_P\\) at the large end (a question may ask for forces at \\(d_P\\) — choose it in step 5)', src: 'Fizz p.61 · Mech p.72, p.98 · Helical/Bevel s18 (course)', var: 'frad', value: 'mean' },
      { text: '\\(K_o\\) from Table 15-2 for the stated shocks; pre-filled 1.00 (course tutorials)', src: 'Fizz p.62 · Mech p.98', var: 'Ko' },
      { text: 'Quality from Table 9-5 if not given: \\(A_v = 10\\) ↔ \\(Q_v = 7\\) (\\(Q_v = 17 - A_v\\))', src: 'Fizz p.63 · Mech p.99 · Mott Sec. 10-9', var: 'Qv' },
      { text: '\\(K_{mb} = 1.00\\) (both straddle-mounted) unless the mounting is stated', src: 'Fizz p.62 · Mech p.98 · Mott Sec. 10-9', var: 'Kmb' },
      { text: '\\(K_x = 1\\) for straight bevel teeth; no rim-thickness factor \\(K_B\\)', src: 'Helical/Bevel s21, s23 (course)', step: 'ks' },
      { text: '99 % reliability → \\(K_R = C_R = 1\\)', src: 'Fizz p.65 · Mech p.100', var: 'R' },
      { text: 'Life in hours or cycles; if not given use Mott Table 9-12 (20 000–30 000 h general industrial)', src: 'Fizz p.65 · Mech p.101', step: 'life' },
      { text: '\\(K_L = 1.3558N_L^{-0.0178}\\) above \\(3\\times10^6\\) cycles (commercial line); \\(C_L = 3.4822N_L^{-0.0602}\\)', src: 'Fizz p.66, p.68 · Mech p.102–103', var: 'KLP' },
      { text: '\\(K_T = 1\\) (oil below 250 °F)', src: 'Helical/Bevel s23 (course)', var: 'KT' },
      { text: '\\(S_F = 1\\) (AGMA range 1–1.5) to find the minimum strength or the power rating', src: 'Fizz p.65–66 · Mech p.100', var: 'SF' },
      { text: 'Through-hardened grade 1 steel for \\(s_{at}\\), \\(s_{ac}\\)', src: 'Mech p.84, p.102 · Fizz p.68', var: 'grade' },
      { text: '\\(C_p = 2300\\sqrt{\\text{psi}}\\) (steel on steel)', src: 'Fizz p.66 · Mech p.102', var: 'Cp' },
      { text: '\\(C_s = 0.125F + 0.4375\\) (Eq. 15-12, 0.5–4.5 in)', src: 'Fizz p.66 · Mech p.102', var: 'Cs' },
      { text: '\\(C_{xc} = 1.5\\) (properly crowned); 2.0 only when the problem says uncrowned', src: 'Fizz p.67 · Mech p.102 · Helical/Bevel s26 (course)', var: 'Cxc' },
      { text: '\\(C_H = 1\\) (same hardness)', src: 'Helical/Bevel s28 (course)', var: 'CH' },
      { text: '\\(S_H = 1\\); compare \\(n_w = S_H^2\\) with \\(S_F\\)', src: 'Fizz p.68 · Mech p.104 · Helical/Bevel s30 (course)', var: 'SH' },
    ],

    figures: [
      { id: 'f13-16', ref: 'Figure 13-16', title: 'Terminology of bevel gears (cone distance \\(A_0\\), pitch angles \\(\\gamma\\), \\(\\Gamma\\), face F, back cone)', src: 'figures/shigley/fig13-16.png', page: 717 },
      { id: 't13-3', ref: 'Table 13-3', title: 'Tooth proportions for 20° straight bevel-gear teeth (working depth, clearance, face width limits, minimum teeth)', src: 'figures/shigley/table13-3.png', page: 723 },
      { id: 'f13-31', ref: 'Figure 13-31', title: 'Bevel-gear tooth forces \\(W_t\\), \\(W_r\\), \\(W_a\\) acting at the mean radius \\(r_{av}\\)', src: 'figures/shigley/fig13-31.png', page: 735,
        note: '\\(W_r\\) points to the gear axis; \\(W_a\\) pushes each gear away from the apex. Pinion \\(W_r\\) = gear \\(W_a\\) and vice-versa.' },
      { id: 'f15-14', ref: 'Figure 15-14', title: '"Road map" of straight-bevel wear (contact) equations', src: 'figures/shigley/fig15-14.png', page: 828 },
      { id: 'f15-15', ref: 'Figure 15-15', title: '"Road map" of straight-bevel bending equations', src: 'figures/shigley/fig15-15.png', page: 829 },
      { id: 't15-2', ref: 'Table 15-2', title: 'Overload factor \\(K_o\\) (\\(K_A\\)) — prime mover vs driven machine', src: 'figures/shigley/table15-2.png', page: 818, note: 'Speed-decreasing drives. Uniform/uniform = 1.00.' },
      { id: 't9-5', ref: 'Table 9-5', book: 'mott', title: 'Recommended AGMA quality numbers \\(A_v\\) — the table both guides use', src: 'figures/mott/table9-5.png', page: 399, note: '\\(Q_v = 17 - A_v\\). Speed rows: 0–800 ft/min A10, 800–2000 A8, 2000–4000 A6.' },
      { id: 'f15-5', ref: 'Figure 15-5', title: 'Dynamic factor \\(K_v\\) vs pitch-line velocity for \\(Q_v\\) = 5…11', src: 'figures/shigley/fig15-5.png', page: 819, note: 'Curve fit Eqs. 15-5/15-6; valid up to \\(v_{t,max}\\) (Eq. 15-8).' },
      { id: 't9-12', ref: 'Table 9-12', book: 'mott', title: 'Recommended design life (hours) — used by both guides when the life is not given', src: 'figures/mott/table9-12.png', page: 411, note: 'General industrial machines 20 000–30 000 h; \\(N_L = 60L_hn\\).' },
      { id: 'f15-6', ref: 'Figure 15-6', title: 'Contact geometry factor I (\\(Z_I\\)), straight bevel, 20°, 90° shafts', src: 'figures/shigley/fig15-6.png', page: 821, note: 'Enter ordinate with pinion teeth, move to the gear-teeth contour, read I on the abscissa.' },
      { id: 'f15-7', ref: 'Figure 15-7', title: 'Bending geometry factor J (\\(Y_J\\)), straight bevel, 20°, 90° shafts', src: 'figures/shigley/fig15-7.png', page: 821, note: 'Ordinate = teeth on the gear you want J for; curves = teeth in its mate. Read once for the pinion, once for the gear.' },
      { id: 'f15-8', ref: 'Figure 15-8', title: 'Contact stress-cycle factor \\(C_L\\) (\\(Z_{NT}\\))', src: 'figures/shigley/fig15-8.png', page: 822, note: 'Eq. 15-14: \\(C_L = 2\\) below \\(10^4\\); \\(3.4822N_L^{-0.0602}\\) for \\(10^4 \\le N_L \\le 10^{10}\\).' },
      { id: 'f15-9', ref: 'Figure 15-9', title: 'Bending stress-cycle factor \\(K_L\\) (\\(Y_{NT}\\))', src: 'figures/shigley/fig15-9.png', page: 823, note: 'Above \\(3\\times10^6\\) cycles use \\(K_L = 1.3558N_L^{-0.0178}\\) (course); \\(1.683N_L^{-0.0323}\\) is for critical service.' },
      { id: 'f15-10', ref: 'Figure 15-10', title: 'Hardness-ratio factor \\(C_H\\) (\\(Z_W\\)) for through-hardened pinion and gear', src: 'figures/shigley/fig15-10.png', page: 823, note: '\\(C_H = 1\\) when \\(H_{BP}/H_{BG} < 1.2\\).' },
      { id: 't15-3', ref: 'Table 15-3', title: 'Reliability factors \\(C_R\\) (\\(Z_Z\\)) and \\(K_R\\) (\\(Y_Z\\))', src: 'figures/shigley/table15-3.png', page: 824, note: '\\(C_R = \\sqrt{K_R}\\); Eqs. 15-19/15-20.' },
      { id: 't15-4', ref: 'Table 15-4', title: 'Allowable contact stress number \\(s_{ac}\\) for steel gears', src: 'figures/shigley/table15-4.png', page: 825 },
      { id: 'f15-12', ref: 'Figure 15-12', title: 'Allowable contact stress number \\(s_{ac}\\) vs Brinell hardness (through-hardened steel)', src: 'figures/shigley/fig15-12.png', page: 826, note: 'Eq. 15-22: grade 1 \\(s_{ac} = 341H_B + 23\\,620\\) psi; grade 2 \\(363.6H_B + 29\\,560\\) psi.' },
      { id: 't15-6', ref: 'Table 15-6', title: 'Allowable bending stress number \\(s_{at}\\) for steel gears', src: 'figures/shigley/table15-6.png', page: 826 },
      { id: 'f15-13', ref: 'Figure 15-13', title: 'Allowable bending stress number \\(s_{at}\\) vs Brinell hardness (through-hardened steel)', src: 'figures/shigley/fig15-13.png', page: 827, note: 'Eq. 15-23: grade 1 \\(s_{at} = 44H_B + 2100\\) psi; grade 2 \\(48H_B + 5980\\) psi.' },
      { id: 't14-8', ref: 'Table 14-8', title: 'Elastic coefficient \\(C_p\\) (\\(\\sqrt{\\text{psi}}\\))', src: 'figures/shigley/table14-8.png', page: 783, note: 'Steel on steel: 2300 (course) or 2290 (after Eq. 15-21) — either accepted.' },
      // ---- course-only slides (Helical_Bevel_and_Plastic_Gears_with_Materials_Review_2025.pdf) ----
      { id: 'cwt', ref: 'Helical/Bevel s18', book: 'course', title: 'Bevel bending road map, Table 15-2 \\(K_o\\) and the course note: forces at \\(d_{av}\\), strength with \\(W^t = 2T/d_P\\)', src: 'figures/course/bevel_ko_wt_large_end.png', note: 'Speed-increasing drives add \\(0.01(N_G/N_P)^2\\) to \\(K_o\\).' },
      { id: 'cks', ref: 'Helical/Bevel s21', book: 'course', title: 'Bevel size, load-distribution and curvature factors \\(K_s\\), \\(K_m\\), \\(K_x\\) (course slide)', src: 'figures/course/bevel_ks_km_kx_course.png', note: '\\(K_s = 0.4867 + 0.2132/P_d\\), \\(K_m = K_{mb} + 0.0036F^2\\) (\\(K_{mb}\\) = 1.00/1.10/1.25), \\(K_x = 1\\).' },
      { id: 'ckl', ref: 'Helical/Bevel s23', book: 'course', title: 'Bevel stress-cycle factor \\(K_L\\) — “use this line for commercial gears”; \\(K_T = K_R = 1\\); no \\(K_B\\)', src: 'figures/course/bevel_kl_course.png', note: '\\(K_L = 6.1514N^{-0.1192}\\) up to \\(3\\times10^6\\), then \\(1.3558N^{-0.0178}\\).' },
      { id: 'ccs', ref: 'Helical/Bevel s26', book: 'course', title: 'Bevel pitting size factor \\(C_s\\) and crowning factor \\(C_{xc}\\) — “use 1.5 for commercial gears”', src: 'figures/course/bevel_cs_cxc_course.png', note: '\\(C_s = 0.125F + 0.4375\\) (0.5–4.5 in); \\(C_{xc}\\) = 1.5 crowned, 2.0 uncrowned.' },
      { id: 'ccr', ref: 'Helical/Bevel s29', book: 'course', title: 'Bevel contact-stress reliability factor \\(C_R = \\sqrt{K_R}\\) (Table 15-3) and \\(K_T = 1\\) below 250 °F', src: 'figures/course/bevel_cr_course.png', note: '1 in 100 → \\(C_R = K_R = 1\\); 1 in 1000 → 1.12 / 1.25.' },
      { id: 'gk-qv', ref: 'Gear Kinematics s42', book: 'course', title: 'AGMA quality number Q_v by accuracy level (minimal 4–5 … highest 14–15) and how it is produced', src: 'figures/course/gear_agma_quality_accuracy_levels.png', note: 'Gear_Kinematics_and_Forces_-2024.pdf slide 42. Use with the application table to pick Q_v / A_v.' },
      { id: 'm-t2-2', ref: 'Table 2-2', book: 'mott', title: 'Hardness scales vs tensile strength (HB, HRB, HRC, ksi, MPa) with Figure 2-6 conversion chart', src: 'figures/mott/table2-2_fig2-6.png', page: 49, note: '\\(s_u \\approx 0.50H_B\\) ksi (Mott Eq. 2-8).' },
      { id: 'm-f9-20', ref: 'Figure 9-20', book: 'mott', title: 'Effective case depth h_e for carburized gears vs normal diametral pitch (normal / heavy case)', src: 'figures/mott/fig9-20.png', page: 409, note: 'Helical/Bevel s57 (case hardening): case depth typically 0.010–0.040 in.' },
      { id: 'khk108', ref: 'KHK p.T108', book: 'course', title: 'KHK bending strength of plastic bevel and worm gears, sliding-speed limits for plastic worm pairs', src: 'figures/course/khk_plastic_bevel_worm_strength_t108.png', note: 'KHK Gears Technical Information.pdf p.108 (T108).' },
    ],

    sections: [
      { title: '1 · Problem data', steps: [
        { id: 'in', title: 'Drive data', fig: ['f13-16', 't13-3'],
          text: 'Everything the question gives. Face width not given → the roundest value in the guides’ range (section 2); type yours to override. The standard pitches are listed below.',
          vars: [
            { id: 'H', symbol: 'H', label: 'Transmitted power', unit: 'hp', kind: 'input' },
            { id: 'nP', symbol: 'n_P', label: 'Pinion speed', unit: 'rev/min', kind: 'input' },
            { id: 'NP', symbol: 'N_P', label: 'Pinion teeth', kind: 'input', check: v => (v.NP !== undefined && v.NP < 13) ? 'Table 13-3: at least 13 teeth for 20° straight bevel' : null },
            { id: 'NG', symbol: 'N_G', label: 'Gear teeth', kind: 'input' },
            { id: 'Pd', symbol: 'P_d', label: 'Diametral pitch (at large end)', unit: 'teeth/in', kind: 'input' },
            { id: 'F', symbol: 'F', label: 'Face width', unit: 'in', kind: 'input', hint: 'auto = roundest value in \\(F_{nom}\\) … \\(F_{max}\\)',
              auto: v => has(v, 'Fnom', 'Fmax') ? niceF(v.Fnom, v.Fmax) : undefined,
              check: v => (has(v, 'F', 'Fmax') && v.F > v.Fmax * 1.001) ? 'F exceeds F_max = min(A_0/3, 10/P_d) = ' + fmt(v.Fmax, 3) + ' in' : null },
            { id: 'phi', symbol: '\\phi', label: 'Pressure angle', kind: 'choice', options: [{ label: '20° (standard)', value: 20 }, { label: '22.5°', value: 22.5 }, { label: '25°', value: 25 }], default: 20, hint: 'Figs 15-6/15-7 are for 20°' },
          ],
          after: v => stdTable(v, { Pd: 'Pd', N: 'NP', list: STD_P, mods: STD_M, ref: 'Table 13-2', mref: 'preferred modules, Table 13-2', dlabel: '\\(d_P\\) at the large end (in)' }) },
      ] },

      { title: '2 · Geometry (Eqs. 13-14, Table 13-3)', steps: [
        { id: 'geo', title: 'Pitch diameters, ratio and pitch angles', eq: '13-14', fig: ['f13-16'],
          formula: 'd_P = \\frac{N_P}{P_d},\\quad d_G = \\frac{N_G}{P_d},\\quad m_G = \\frac{N_G}{N_P},\\quad \\gamma = \\tan^{-1}\\frac{N_P}{N_G},\\quad \\Gamma = \\tan^{-1}\\frac{N_G}{N_P}',
          vars: [
            { id: 'dP', symbol: 'd_P', label: 'Pinion pitch diameter (large end)', unit: 'in', kind: 'calc', compute: v => has(v, 'NP', 'Pd') ? v.NP / v.Pd : undefined },
            { id: 'dG', symbol: 'd_G', label: 'Gear pitch diameter (large end)', unit: 'in', kind: 'calc', compute: v => has(v, 'NG', 'Pd') ? v.NG / v.Pd : undefined },
            { id: 'mG', symbol: 'm_G', label: 'Gear ratio', kind: 'calc', compute: v => has(v, 'NP', 'NG') ? v.NG / v.NP : undefined },
            { id: 'gam', symbol: '\\gamma', label: 'Pinion pitch angle', unit: '°', kind: 'calc', compute: v => has(v, 'NP', 'NG') ? H.deg(Math.atan(v.NP / v.NG)) : undefined,
              work: v => has(v, 'NP', 'NG') ? '\\(\\gamma = \\tan^{-1}(' + v.NP + '/' + v.NG + ') = ' + fmt(H.deg(Math.atan(v.NP / v.NG))) + '^\\circ\\)' : null },
            { id: 'Gam', symbol: '\\Gamma', label: 'Gear pitch angle', unit: '°', kind: 'calc', compute: v => has(v, 'gam') ? 90 - v.gam : undefined },
            { id: 'nG', symbol: 'n_G', label: 'Gear speed', unit: 'rev/min', kind: 'calc', compute: v => has(v, 'nP', 'mG') ? v.nP / v.mG : undefined },
          ] },
        { id: 'cone', title: 'Cone distance, face-width limit, mean radius', fig: ['f13-16', 't13-3'],
          text: '\\(A_0\\) = outer cone distance. Shigley Table 13-3: \\(F = \\min(0.3A_0, 10/P_d)\\); the guides use \\(F_{nom} = 0.3A_0 \\le F \\le F_{max} = \\min(A_0/3, 10/P_d)\\). Forces act at the mean radius \\(r_{av}\\).',
          formula: 'A_0 = \\frac{d_G}{2\\sin\\Gamma} = \\frac{d_P}{2\\sin\\gamma},\\qquad r_{av,P} = \\frac{d_P}{2} - \\frac{F}{2}\\sin\\gamma,\\qquad R_{av,G} = \\frac{d_G}{2} - \\frac{F}{2}\\sin\\Gamma',
          vars: [
            { id: 'A0', symbol: 'A_0', label: 'Outer cone distance', unit: 'in', kind: 'calc', compute: v => has(v, 'dP', 'gam') ? v.dP / (2 * Math.sin(r(v.gam))) : undefined,
              work: v => has(v, 'dP', 'gam') ? '\\(A_0 = ' + fmt(v.dP) + '/(2\\sin ' + fmt(v.gam) + '^\\circ) = ' + fmt(v.dP / (2 * Math.sin(r(v.gam)))) + '\\) in' : null },
            { id: 'F13', symbol: 'F_{13-3}', label: 'Table 13-3 face width \\(\\min(0.3A_0, 10/P_d)\\)', unit: 'in', kind: 'calc', digits: 3, compute: v => has(v, 'A0', 'Pd') ? Math.min(0.3 * v.A0, 10 / v.Pd) : undefined,
              work: v => has(v, 'A0', 'Pd') ? '\\(F = \\min(0.3(' + fmt(v.A0) + '),\\ 10/' + fmt(v.Pd) + ') = \\min(' + fmt(0.3 * v.A0, 3) + ',\\ ' + fmt(10 / v.Pd, 3) + ') = ' + fmt(Math.min(0.3 * v.A0, 10 / v.Pd), 3) + '\\) in' : null },
            { id: 'Fnom', symbol: 'F_{nom}', label: 'Guides’ nominal face width \\(0.3A_0\\)', unit: 'in', kind: 'calc', digits: 3, compute: v => has(v, 'A0') ? 0.3 * v.A0 : undefined },
            { id: 'Fmax', symbol: 'F_{max}', label: 'Guides’ maximum \\(\\min(A_0/3, 10/P_d)\\)', unit: 'in', kind: 'calc', digits: 3, compute: v => has(v, 'A0', 'Pd') ? Math.min(v.A0 / 3, 10 / v.Pd) : undefined },
            { id: 'Am', symbol: 'A_m', label: 'Mean cone distance \\(A_0 - F/2\\)', unit: 'in', kind: 'calc', compute: v => has(v, 'A0', 'F') ? v.A0 - v.F / 2 : undefined },
            { id: 'ravP', symbol: 'r_{av,P}', label: 'Pinion mean radius', unit: 'in', kind: 'calc', compute: v => has(v, 'dP', 'F', 'gam') ? v.dP / 2 - v.F / 2 * Math.sin(r(v.gam)) : undefined,
              work: v => has(v, 'dP', 'F', 'gam') ? '\\(r_{av,P} = ' + fmt(v.dP) + '/2 - (' + fmt(v.F) + '/2)\\sin ' + fmt(v.gam) + '^\\circ = ' + fmt(v.dP / 2 - v.F / 2 * Math.sin(r(v.gam))) + '\\) in' : null },
            { id: 'RavG', symbol: 'R_{av,G}', label: 'Gear mean radius', unit: 'in', kind: 'calc', compute: v => has(v, 'dG', 'F', 'Gam') ? v.dG / 2 - v.F / 2 * Math.sin(r(v.Gam)) : undefined },
            { id: 'dav', symbol: 'd_{av}', label: 'Mean pinion diameter \\(d_P - F\\cos\\Gamma\\)', unit: 'in', kind: 'calc', compute: v => has(v, 'dP', 'F', 'Gam') ? v.dP - v.F * Math.cos(r(v.Gam)) : undefined, hint: '\\(= 2r_{av,P}\\)' },
          ],
          after: v => {
            if (!has(v, 'F', 'F13', 'Fnom', 'Fmax')) return '';
            const s = v.F <= v.Fmax * 1.001 ? '<span class="result-ok">F = ' + fmt(v.F, 3) + ' in is within F_{max} = ' + fmt(v.Fmax, 3) + ' in — OK' + (v.F < v.Fnom * 0.999 ? ' (below F_{nom} = ' + fmt(v.Fnom, 3) + ' in: allowed, a narrower face)' : '') + '</span>' : '<span class="result-bad">F = ' + fmt(v.F, 3) + ' in exceeds F_{max} = ' + fmt(v.Fmax, 3) + ' in</span>';
            return s + (v.F > v.F13 * 1.001 ? ' <span class="muted">(above Shigley’s Table 13-3 value ' + fmt(v.F13, 3) + ' in, which treats \\(0.3A_0\\) as the limit)</span>' : '');
          } },
        { id: 'teeth', title: 'Tooth proportions at the large end (Table 13-3)', fig: ['t13-3'],
          formula: 'h_k = \\frac{2.0}{P_d},\\quad c = \\frac{0.188}{P_d} + 0.002,\\quad a_G = \\frac{0.54}{P_d} + \\frac{0.460}{P_d\\, m_{90}^2},\\quad a_P = h_k - a_G',
          vars: [
            { id: 'hk', symbol: 'h_k', label: 'Working depth', unit: 'in', kind: 'calc', compute: v => has(v, 'Pd') ? 2 / v.Pd : undefined },
            { id: 'cl', symbol: 'c', label: 'Clearance', unit: 'in', kind: 'calc', compute: v => has(v, 'Pd') ? 0.188 / v.Pd + 0.002 : undefined },
            { id: 'aG', symbol: 'a_G', label: 'Gear addendum (\\(m_{90} = m_G\\) for 90° shafts)', unit: 'in', kind: 'calc', compute: v => has(v, 'Pd', 'mG') ? 0.54 / v.Pd + 0.460 / (v.Pd * v.mG * v.mG) : undefined },
            { id: 'aP', symbol: 'a_P', label: 'Pinion addendum', unit: 'in', kind: 'calc', compute: v => has(v, 'hk', 'aG') ? v.hk - v.aG : undefined },
            { id: 'bG', symbol: 'b_G', label: 'Gear dedendum \\(h_k + c - a_G\\)', unit: 'in', kind: 'calc', compute: v => has(v, 'hk', 'cl', 'aG') ? v.hk + v.cl - v.aG : undefined },
            { id: 'bP', symbol: 'b_P', label: 'Pinion dedendum \\(h_k + c - a_P\\)', unit: 'in', kind: 'calc', compute: v => has(v, 'hk', 'cl', 'aP') ? v.hk + v.cl - v.aP : undefined },
            { id: 'doP', symbol: 'd_{oP}', label: 'Pinion outside diameter \\(d_P + 2a_P\\cos\\gamma\\)', unit: 'in', kind: 'calc', compute: v => has(v, 'dP', 'aP', 'gam') ? v.dP + 2 * v.aP * Math.cos(r(v.gam)) : undefined },
            { id: 'doG', symbol: 'd_{oG}', label: 'Gear outside diameter \\(d_G + 2a_G\\cos\\Gamma\\)', unit: 'in', kind: 'calc', compute: v => has(v, 'dG', 'aG', 'Gam') ? v.dG + 2 * v.aG * Math.cos(r(v.Gam)) : undefined },
          ] },
      ] },

      { title: '3 · Force analysis (Sec. 13-15) — forces at the mean radius', text: 'Shaft/bearing loads act at the tooth midpoint \\(r_{av}\\) (Eq. 13-37); the AGMA stresses in section 4 use \\(W^t = 2T/d_P\\) at the large end. A question may ask for the forces at \\(d_P\\) instead (Midterm 2023) — pick that below.', steps: [
        { id: 'force', title: 'Tangential, radial and axial loads', eq: '13-37, 13-38', fig: ['f13-31', 'cwt'],
          formula: 'T_P = \\frac{63\\,025\\,H}{n_P},\\quad W_t = \\frac{T_P}{r_{av,P}},\\quad W_r = W_t\\tan\\phi\\cos\\gamma,\\quad W_a = W_t\\tan\\phi\\sin\\gamma',
          text: 'Directions: on the driven gear \\(W_t\\) acts with its motion at the mesh, on the driver it opposes motion. \\(W_r\\) points to that gear’s own axis; \\(W_a\\) is along its axis and pushes it away from the cone apex (toward its back), so one bearing takes it as thrust. For 90° shafts the pinion \\(W_r\\) is the gear \\(W_a\\) and vice-versa.',
          vars: [
            { id: 'TP', symbol: 'T_P', label: 'Pinion torque', unit: 'lbf·in', kind: 'calc', compute: v => has(v, 'H', 'nP') ? 63025 * v.H / v.nP : undefined,
              work: v => has(v, 'H', 'nP') ? '\\(T_P = 63\\,025(' + fmt(v.H) + ')/' + fmt(v.nP) + ' = ' + fmt(63025 * v.H / v.nP) + '\\) lbf·in' : null },
            { id: 'TG', symbol: 'T_G', label: 'Gear torque', unit: 'lbf·in', kind: 'calc', compute: v => has(v, 'TP', 'mG') ? v.TP * v.mG : undefined },
            { id: 'frad', label: 'Force radius', kind: 'choice', type: 'text', options: [{ label: 'mean radius \\(r_{av}\\) (course / Shigley)', value: 'mean' }, { label: 'large-end pitch radius \\(d_P/2\\) (if asked)', value: 'large' }], default: 'mean' },
            { id: 'Wt_f', symbol: 'W_t', label: 'Tangential load (same on both gears)', unit: 'lbf', kind: 'input', hint: 'auto = \\(T_P/r\\); type it if given', auto: v => { const rr = v.frad === 'large' ? v.dP / 2 : v.ravP; return has(v, 'TP') && rr > 0 ? v.TP / rr : undefined; },
              work: v => { const rr = v.frad === 'large' ? v.dP / 2 : v.ravP; return has(v, 'TP') && rr > 0 ? '\\(W_t = ' + fmt(v.TP) + '/' + fmt(rr) + ' = ' + fmt(v.TP / rr) + '\\) lbf' : null; } },
            { id: 'WrP', symbol: 'W_{rP}', label: 'Pinion radial load \\(W_t\\tan\\phi\\cos\\gamma\\)', unit: 'lbf', kind: 'calc', compute: v => has(v, 'Wt_f', 'phi', 'gam') ? v.Wt_f * Math.tan(r(v.phi)) * Math.cos(r(v.gam)) : undefined,
              work: v => has(v, 'Wt_f', 'phi', 'gam') ? '\\(W_{rP} = ' + fmt(v.Wt_f) + '\\tan ' + v.phi + '^\\circ \\cos ' + fmt(v.gam) + '^\\circ = ' + fmt(v.Wt_f * Math.tan(r(v.phi)) * Math.cos(r(v.gam))) + '\\) lbf' : null },
            { id: 'WaP', symbol: 'W_{aP}', label: 'Pinion axial (thrust) load \\(W_t\\tan\\phi\\sin\\gamma\\)', unit: 'lbf', kind: 'calc', compute: v => has(v, 'Wt_f', 'phi', 'gam') ? v.Wt_f * Math.tan(r(v.phi)) * Math.sin(r(v.gam)) : undefined,
              work: v => has(v, 'Wt_f', 'phi', 'gam') ? '\\(W_{aP} = ' + fmt(v.Wt_f) + '\\tan ' + v.phi + '^\\circ \\sin ' + fmt(v.gam) + '^\\circ = ' + fmt(v.Wt_f * Math.tan(r(v.phi)) * Math.sin(r(v.gam))) + '\\) lbf' : null },
            { id: 'WrG', symbol: 'W_{rG}', label: 'Gear radial load \\(W_t\\tan\\phi\\cos\\Gamma\\) (= pinion axial)', unit: 'lbf', kind: 'calc', compute: v => has(v, 'Wt_f', 'phi', 'Gam') ? v.Wt_f * Math.tan(r(v.phi)) * Math.cos(r(v.Gam)) : undefined },
            { id: 'WaG', symbol: 'W_{aG}', label: 'Gear axial load \\(W_t\\tan\\phi\\sin\\Gamma\\) (= pinion radial)', unit: 'lbf', kind: 'calc', compute: v => has(v, 'Wt_f', 'phi', 'Gam') ? v.Wt_f * Math.tan(r(v.phi)) * Math.sin(r(v.Gam)) : undefined },
            { id: 'Wres', symbol: 'W', label: 'Resultant tooth force \\(W_t/\\cos\\phi\\)', unit: 'lbf', kind: 'calc', compute: v => has(v, 'Wt_f', 'phi') ? v.Wt_f / Math.cos(r(v.phi)) : undefined },
          ],
          after: v => has(v, 'Wt_f') ? '<span class="muted">Bearing reactions: put \\(\\mathbf{W} = (W_t, W_r, W_a)\\) at the mean radius, sum moments about one bearing (\\(\\mathbf{M} = \\mathbf{r}\\times\\mathbf{F}\\)), then sum forces; the thrust goes to one bearing only (Shigley Ex. 13-8, HW2 P5).</span>' : '' },
      ] },

      { title: '4 · AGMA bending stress \\(s_t\\) (Eq. 15-3)', steps: [
        { id: 'wt', title: 'Pitch-line velocity and transmitted load (large end)', eq: '15-7', fig: ['f15-15', 'cwt'],
          formula: 'v_t = \\frac{\\pi d_P n_P}{12},\\qquad W^t = \\frac{33\\,000\\,H}{v_t} = \\frac{2T_P}{d_P}',
          text: 'The AGMA stress numbers use \\(W^t = 2T/d_P\\) at the large end (course, Helical/Bevel s18), not the \\(W_t\\) at \\(r_{av}\\).',
          vars: [
            { id: 'vt', symbol: 'v_t', label: 'Pitch-line velocity', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'dP', 'nP') ? Math.PI * v.dP * v.nP / 12 : undefined,
              work: v => has(v, 'dP', 'nP') ? '\\(v_t = \\pi(' + fmt(v.dP) + ')(' + fmt(v.nP) + ')/12 = ' + fmt(Math.PI * v.dP * v.nP / 12) + '\\) ft/min' : null },
            { id: 'Wt', symbol: 'W^t', label: 'Transmitted load for stress (large end)', unit: 'lbf', kind: 'input', hint: 'auto = \\(33\\,000H/v_t\\); type it if given', auto: v => has(v, 'H', 'vt') ? 33000 * v.H / v.vt : undefined,
              work: v => has(v, 'H', 'vt', 'TP', 'dP') ? '\\(W^t = 33\\,000(' + fmt(v.H) + ')/' + fmt(v.vt) + ' = 2(' + fmt(v.TP) + ')/' + fmt(v.dP) + ' = ' + fmt(33000 * v.H / v.vt) + '\\) lbf' : null },
          ] },
        { id: 'ko', title: 'Overload factor \\(K_o\\) and dynamic factor \\(K_v\\)', eq: '15-5 … 15-8', fig: ['t15-2', 'cwt', 't9-5', 'f15-5', 'gk-qv'],
          text: '\\(K_o\\) from Table 15-2 (tutorials 1.0). \\(Q_v\\) as given, else Table 9-5 with \\(Q_v = 17 - A_v\\) (a problem giving \\(A_v = 8\\) means \\(Q_v = 9\\)). \\(K_v\\) by Eq. 15-5.',
          formula: 'B = 0.25(12 - Q_v)^{2/3},\\quad A = 50 + 56(1-B),\\quad K_v = \\left(\\frac{A + \\sqrt{v_t}}{A}\\right)^{B},\\quad v_{t,max} = [A + (Q_v - 3)]^2',
          vars: [
            { id: 'Ko', symbol: 'K_o', label: 'Overload factor', kind: 'lookup', fig: 't15-2', default: 1.0, hint: 'Table 15-2; 1.00 = uniform/uniform (course tutorials)' },
            { id: 'Qv', symbol: 'Q_v', label: 'Transmission accuracy (quality) number (Mott A_v in brackets)', kind: 'choice', fig: 't9-5', options: [5, 6, 7, 8, 9, 10, 11].map(q => ({ label: 'Q_v = ' + q + '  (A_v = ' + (17 - q) + ')', value: q })), default: 7, hint: 'given, or Table 9-5 (A_v 10 = Q_v 7); Tutorial 5: Q_v = 6',
              check: v => (has(v, 'vt', 'Qv') && 17 - v.Qv > avSpeed(v.vt)) ? 'Table 9-5 speed rows suggest A_v = ' + avSpeed(v.vt) + ' or better (Q_v = ' + (17 - avSpeed(v.vt)) + ' or higher) at v_t = ' + fmt(v.vt) + ' ft/min' : null },
            { id: 'Bv', symbol: 'B', label: 'B', kind: 'calc', compute: v => has(v, 'Qv') ? 0.25 * Math.pow(12 - v.Qv, 2 / 3) : undefined },
            { id: 'Av', symbol: 'A', label: 'A', kind: 'calc', compute: v => has(v, 'Bv') ? 50 + 56 * (1 - v.Bv) : undefined },
            { id: 'Kv', symbol: 'K_v', label: 'Dynamic factor', kind: 'lookup', fig: 'f15-5', hint: 'auto = Eq. 15-5 curve fit; confirm on Fig. 15-5',
              auto: v => has(v, 'Av', 'Bv', 'vt') ? Math.pow((v.Av + sq(v.vt)) / v.Av, v.Bv) : undefined,
              work: v => has(v, 'Av', 'Bv', 'vt') ? '\\(K_v = \\left(\\frac{' + fmt(v.Av) + ' + \\sqrt{' + fmt(v.vt) + '}}{' + fmt(v.Av) + '}\\right)^{' + fmt(v.Bv, 3) + '} = ' + fmt(Math.pow((v.Av + sq(v.vt)) / v.Av, v.Bv)) + '\\)' : null },
            { id: 'vtmax', symbol: 'v_{t,max}', label: 'Max. velocity for this \\(Q_v\\) (Eq. 15-8)', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'Av', 'Qv') ? Math.pow(v.Av + (v.Qv - 3), 2) : undefined,
              check: v => (has(v, 'vt', 'vtmax') && v.vt > v.vtmax) ? 'v_t exceeds v_{t,max} — raise Q_v' : null },
          ] },
        { id: 'ks', title: 'Size, load-distribution and curvature factors \\(K_s\\), \\(K_m\\), \\(K_x\\)', eq: '15-10, 15-11, 15-13', fig: ['cks'],
          text: '\\(K_s\\) by formula, \\(K_m\\) from face width and mounting, \\(K_x = 1\\) for straight bevel. Pinion outboard + gear straddle = one member straddle-mounted, \\(K_{mb} = 1.10\\).',
          formula: 'K_s = \\begin{cases}0.4867 + 0.2132/P_d & 0.5 \\le P_d \\le 16\\\\ 0.5 & P_d \\gt  16\\end{cases}\\qquad K_m = K_{mb} + 0.0036F^2 \\qquad K_x = 1',
          vars: [
            { id: 'Ks', symbol: 'K_s', label: 'Size factor for bending', kind: 'calc', compute: v => has(v, 'Pd') ? (v.Pd > 16 ? 0.5 : 0.4867 + 0.2132 / v.Pd) : undefined,
              work: v => has(v, 'Pd') ? (v.Pd > 16 ? '\\(K_s = 0.5\\ (P_d > 16)\\)' : '\\(K_s = 0.4867 + 0.2132/' + fmt(v.Pd) + ' = ' + fmt(0.4867 + 0.2132 / v.Pd) + '\\)') : null },
            { id: 'Kmb', symbol: 'K_{mb}', label: 'Mounting factor', kind: 'choice', options: [{ label: '1.00 — both members straddle-mounted', value: 1.0 }, { label: '1.10 — one member straddle-mounted', value: 1.1 }, { label: '1.25 — neither straddle-mounted (outboard)', value: 1.25 }], default: 1.0 },
            { id: 'Km', symbol: 'K_m', label: 'Load-distribution factor', kind: 'lookup', fig: 'cks', hint: 'auto = \\(K_{mb} + 0.0036F^2\\); type a given value', auto: v => has(v, 'Kmb', 'F') ? v.Kmb + 0.0036 * v.F * v.F : undefined,
              work: v => has(v, 'Kmb', 'F') ? '\\(K_m = ' + fmt(v.Kmb) + ' + 0.0036(' + fmt(v.F) + ')^2 = ' + fmt(v.Kmb + 0.0036 * v.F * v.F) + '\\)' : null },
            { id: 'Kx', symbol: 'K_x', label: 'Lengthwise curvature factor (straight bevel)', kind: 'calc', compute: () => 1 },
          ] },
        { id: 'j', title: 'Bending geometry factors J (Fig. 15-7)', fig: ['f15-7'],
          text: '\\(J_P\\): ordinate \\(N_P\\) on the \\(N_G\\) curve; \\(J_G\\): ordinate \\(N_G\\) on the \\(N_P\\) curve (25T/25T → 0.216). \\(J_G < J_P\\) for a reduction, so the gear can govern bending. Auto = digitized chart (within 0.005).',
          vars: [
            { id: 'JP', symbol: 'J_P', label: 'Pinion geometry factor', kind: 'lookup', fig: 'f15-7', auto: v => has(v, 'NP', 'NG') ? jChart(v.NP, v.NG) : undefined, hint: 'Fig. 15-7: ordinate \\(N_P\\), curve \\(N_G\\)' },
            { id: 'JG', symbol: 'J_G', label: 'Gear geometry factor', kind: 'lookup', fig: 'f15-7', auto: v => has(v, 'NP', 'NG') ? jChart(v.NG, v.NP) : undefined, hint: 'Fig. 15-7: ordinate \\(N_G\\), curve \\(N_P\\)' },
          ] },
        { id: 'st', title: 'Bending stress numbers', eq: '15-3',
          formula: 's_t = \\frac{W^t}{F} P_d K_o K_v \\frac{K_s K_m}{K_x J}',
          vars: [
            { id: 'stP', symbol: 's_{tP}', label: 'Pinion bending stress', unit: 'psi', kind: 'calc', compute: v => has(v, 'Wt', 'F', 'Pd', 'Ko', 'Kv', 'Ks', 'Km', 'JP') ? v.Wt / v.F * v.Pd * v.Ko * v.Kv * v.Ks * v.Km / v.JP : undefined,
              work: v => has(v, 'Wt', 'F', 'Pd', 'Ko', 'Kv', 'Ks', 'Km', 'JP') ? '\\(s_{tP} = \\frac{' + fmt(v.Wt) + '}{' + fmt(v.F) + '}(' + fmt(v.Pd) + ')(' + fmt(v.Ko) + ')(' + fmt(v.Kv) + ')\\frac{' + fmt(v.Ks) + '(' + fmt(v.Km) + ')}{(1)' + fmt(v.JP) + '} = ' + fmt(v.Wt / v.F * v.Pd * v.Ko * v.Kv * v.Ks * v.Km / v.JP, 5) + '\\) psi' : null },
            { id: 'stG', symbol: 's_{tG}', label: 'Gear bending stress', unit: 'psi', kind: 'calc', compute: v => has(v, 'Wt', 'F', 'Pd', 'Ko', 'Kv', 'Ks', 'Km', 'JG') ? v.Wt / v.F * v.Pd * v.Ko * v.Kv * v.Ks * v.Km / v.JG : undefined },
          ] },
      ] },

      { title: '5 · Permissible bending stress \\(s_{wt}\\) (Eq. 15-4) and bending safety', steps: [
        { id: 'life', title: 'Design life, reliability and stress-cycle factors', eq: '15-15, 15-19, 15-20', fig: ['f15-9', 'ckl', 't15-3', 'ccr'],
          formula: 'N_L = 60\\,L_h\\,n,\\qquad K_L = \\begin{cases}2.7 & N_L\\lt 10^3\\\\ 6.1514N_L^{-0.1192} & 10^3\\le N_L\\lt 3(10^6)\\\\ 1.3558N_L^{-0.0178} & N_L\\ge 3(10^6)\\ \\text{(general)}\\end{cases}',
          text: 'Life in hours, or pinion revolutions directly (Tutorial 5: \\(10^9\\)); the gear sees \\(1/m_G\\) of the pinion cycles. Commercial line for \\(K_L\\); 99 % → \\(K_R = 1\\) (0.999 → 1.25); \\(K_T = 1\\); no \\(K_B\\).',
          vars: [
            { id: 'NLin', symbol: 'N_{L,given}', label: 'Pinion life in revolutions (if given directly)', kind: 'input', hint: 'e.g. 1e9 (Tutorial 5); blank = use hours' },
            { id: 'Lh', symbol: 'L_h', label: 'Design life in hours (if given instead)', unit: 'h', kind: 'lookup', fig: 't9-12', hint: 'given, or Mott Table 9-12 (general industrial 20 000–30 000 h)' },
            { id: 'NLP', symbol: 'N_{LP}', label: 'Pinion load cycles', kind: 'calc', compute: v => has(v, 'NLin') ? v.NLin : (has(v, 'Lh', 'nP') ? 60 * v.Lh * v.nP : undefined), work: v => !has(v, 'NLin') && has(v, 'Lh', 'nP') ? '\\(N_{LP} = 60(' + fmt(v.Lh) + ')(' + fmt(v.nP) + ') = ' + fmt(60 * v.Lh * v.nP, 3) + '\\)' : null },
            { id: 'NLG', symbol: 'N_{LG}', label: 'Gear load cycles \\(N_{LP}/m_G\\)', kind: 'calc', compute: v => has(v, 'NLP', 'mG') ? v.NLP / v.mG : undefined, work: v => has(v, 'NLP', 'mG') ? '\\(N_{LG} = ' + fmt(v.NLP, 3) + '/' + fmt(v.mG) + ' = ' + fmt(v.NLP / v.mG, 3) + '\\)' : null },
            { id: 'KLP', symbol: 'K_{LP}', label: 'Bending stress-cycle factor, pinion', kind: 'lookup', fig: 'f15-9', auto: v => has(v, 'NLP') ? KLfit(v.NLP) : undefined, hint: 'auto = Eq. 15-15, commercial line (course)',
              work: v => has(v, 'NLP') ? '\\(K_{LP} = ' + (v.NLP < 1e3 ? '2.7' : v.NLP < 3e6 ? '6.1514(' + fmt(v.NLP, 3) + ')^{-0.1192}' : '1.3558(' + fmt(v.NLP, 3) + ')^{-0.0178}') + ' = ' + fmt(KLfit(v.NLP)) + '\\)' : null },
            { id: 'KLG', symbol: 'K_{LG}', label: 'Bending stress-cycle factor, gear', kind: 'lookup', fig: 'f15-9', auto: v => has(v, 'NLG') ? KLfit(v.NLG) : undefined, hint: 'auto = Eq. 15-15, commercial line' },
            { id: 'R', symbol: 'R', label: 'Reliability', kind: 'choice', options: [{ label: '0.90', value: 0.9 }, { label: '0.99 (usual)', value: 0.99 }, { label: '0.995', value: 0.995 }, { label: '0.999', value: 0.999 }, { label: '0.9999', value: 0.9999 }], default: 0.99 },
            { id: 'KR', symbol: 'K_R', label: 'Reliability factor, bending', kind: 'lookup', fig: 't15-3', auto: v => has(v, 'R') ? KRfit(v.R) : undefined, hint: 'Table 15-3 / Eqs. 15-19, 15-20; course: 1.00 at 99 %' },
            { id: 'CR', symbol: 'C_R', label: 'Reliability factor, pitting \\(= \\sqrt{K_R}\\)', kind: 'calc', compute: v => has(v, 'KR') ? sq(v.KR) : undefined, work: v => has(v, 'KR') ? '\\(C_R = \\sqrt{' + fmt(v.KR) + '} = ' + fmt(sq(v.KR)) + '\\)' : null },
            { id: 'KT', symbol: 'K_T', label: 'Temperature factor', kind: 'input', default: 1, hint: '1 below 250 °F (course: always assumed)' },
            { id: 'SF', symbol: 'S_F', label: 'Bending factor of safety (design)', kind: 'input', default: 1, hint: 'guides: "we always just assume SF = 1" (AGMA range 1–1.5)' },
          ] },
        { id: 'sat', title: 'Allowable bending stress number \\(s_{at}\\) and permissible stress', eq: '15-23, 15-4', fig: ['f15-13', 't15-6'],
          formula: 's_{at} = \\begin{cases}44\\,H_B + 2100 & \\text{grade 1}\\\\ 48\\,H_B + 5980 & \\text{grade 2}\\end{cases}\\qquad s_{wt} = \\frac{s_{at} K_L}{S_F K_T K_R}',
          text: 'Material given → enter its core \\(H_B\\) and grade to check the design; selecting a material → leave \\(H_B\\) blank and read section 7. Case-hardened or nitrided steel: type \\(s_{at}\\) from Table 15-6.',
          vars: [
            { id: 'HB', symbol: 'H_B', label: 'Core Brinell hardness of pinion & gear (through-hardened)', unit: 'HB', kind: 'input', hint: 'blank = material unknown' },
            { id: 'grade', symbol: '', label: 'AGMA material grade', kind: 'choice', options: [{ label: 'Grade 1 (usual)', value: 1 }, { label: 'Grade 2', value: 2 }], default: 1 },
            { id: 'sat', symbol: 's_{at}', label: 'Allowable bending stress number', unit: 'psi', kind: 'lookup', fig: 'f15-13', auto: v => has(v, 'HB', 'grade') ? (v.grade === 2 ? 48 * v.HB + 5980 : 44 * v.HB + 2100) : undefined, hint: 'auto = Eq. 15-23 from HB; or Table 15-6 value',
              work: v => has(v, 'HB', 'grade') ? '\\(s_{at} = ' + (v.grade === 2 ? '48(' + v.HB + ') + 5980' : '44(' + v.HB + ') + 2100') + ' = ' + fmt(v.grade === 2 ? 48 * v.HB + 5980 : 44 * v.HB + 2100, 5) + '\\) psi' : null },
            { id: 'swtP', symbol: 's_{wt,P}', label: 'Permissible bending stress, pinion', unit: 'psi', kind: 'calc', compute: v => has(v, 'sat', 'KLP', 'SF', 'KT', 'KR') ? v.sat * v.KLP / (v.SF * v.KT * v.KR) : undefined,
              work: v => has(v, 'sat', 'KLP', 'SF', 'KT', 'KR') ? '\\(s_{wt,P} = \\frac{' + fmt(v.sat, 5) + '(' + fmt(v.KLP) + ')}{' + fmt(v.SF) + '(' + fmt(v.KT) + ')(' + fmt(v.KR) + ')} = ' + fmt(v.sat * v.KLP / (v.SF * v.KT * v.KR), 5) + '\\) psi' : null },
            { id: 'swtG', symbol: 's_{wt,G}', label: 'Permissible bending stress, gear', unit: 'psi', kind: 'calc', compute: v => has(v, 'sat', 'KLG', 'SF', 'KT', 'KR') ? v.sat * v.KLG / (v.SF * v.KT * v.KR) : undefined },
            { id: 'nBP', symbol: 'n_{B,P}', label: 'Actual bending safety factor, pinion \\(s_{wt}S_F/s_t\\)', kind: 'calc', compute: v => has(v, 'swtP', 'stP', 'SF') ? v.swtP * v.SF / v.stP : undefined },
            { id: 'nBG', symbol: 'n_{B,G}', label: 'Actual bending safety factor, gear', kind: 'calc', compute: v => has(v, 'swtG', 'stG', 'SF') ? v.swtG * v.SF / v.stG : undefined },
          ],
          after: v => {
            if (!has(v, 'nBP', 'nBG', 'SF')) return '';
            const ok = v.nBP >= v.SF * 0.999 && v.nBG >= v.SF * 0.999;
            return ok ? '<span class="result-ok">Bending PASS — n_B = ' + fmt(v.nBP, 3) + ' (pinion), ' + fmt(v.nBG, 3) + ' (gear), at least S_F = ' + fmt(v.SF) + '</span>'
              : '<span class="result-bad">Bending FAIL — n_B = ' + fmt(v.nBP, 3) + ' (pinion), ' + fmt(v.nBG, 3) + ' (gear) &lt; S_F = ' + fmt(v.SF) + '</span>';
          } },
      ] },

      { title: '6 · AGMA contact (pitting) stress \\(s_c\\) (Eq. 15-1) and wear safety', steps: [
        { id: 'cfac', title: 'Pitting factors \\(C_p\\), \\(C_s\\), \\(C_{xc}\\), I', eq: '15-9, 15-12, 15-21', fig: ['t14-8', 'ccs', 'f15-6'],
          text: 'Guides: \\(C_p = 2300\\sqrt{\\text{psi}}\\), \\(C_s = 0.125F + 0.4375\\), \\(C_{xc} = 1.5\\) for properly crowned teeth (2.0 only when the problem says uncrowned, as in Tutorial 5).',
          formula: 'C_s = \\begin{cases}0.5 & F\\lt 0.5\\\\ 0.125F + 0.4375 & 0.5\\le F\\le 4.5\\\\ 1 & F\\gt 4.5\\end{cases}\\qquad C_{xc} = \\begin{cases}1.5 & \\text{crowned}\\\\ 2.0 & \\text{uncrowned}\\end{cases}',
          vars: [
            { id: 'Cp', symbol: 'C_p', label: 'Elastic coefficient', unit: '\\(\\sqrt{\\text{psi}}\\)', kind: 'lookup', fig: 't14-8', default: 2300, hint: '2300 steel on steel; 2290 also accepted' },
            { id: 'Cs', symbol: 'C_s', label: 'Size factor for pitting', kind: 'calc', compute: v => has(v, 'F') ? (v.F < 0.5 ? 0.5 : v.F > 4.5 ? 1 : 0.125 * v.F + 0.4375) : undefined,
              work: v => has(v, 'F') ? '\\(C_s = 0.125(' + fmt(v.F) + ') + 0.4375 = ' + fmt(v.F < 0.5 ? 0.5 : v.F > 4.5 ? 1 : 0.125 * v.F + 0.4375) + '\\)' : null },
            { id: 'Cxc', symbol: 'C_{xc}', label: 'Crowning factor', kind: 'choice', options: [{ label: '1.5 — properly crowned (usual)', value: 1.5 }, { label: '2.0 — uncrowned (only if the problem says so)', value: 2.0 }], default: 1.5 },
            { id: 'I', symbol: 'I', label: 'Contact geometry factor', kind: 'lookup', fig: 'f15-6', auto: v => has(v, 'NP', 'NG') ? iChart(v.NP, v.NG) : undefined, hint: 'Fig. 15-6: ordinate \\(N_P\\), curve \\(N_G\\) (auto = digitized chart)' },
          ] },
        { id: 'sc', title: 'Contact stress number', eq: '15-1',
          formula: 's_c = C_p\\left(\\frac{W^t}{F\\,d_P\\,I}K_o K_v K_m C_s C_{xc}\\right)^{1/2}',
          text: 'One contact stress for pinion and gear; use the pinion \\(d_P\\).',
          vars: [
            { id: 'sc', symbol: 's_c', label: 'Contact stress number', unit: 'psi', kind: 'calc', compute: v => has(v, 'Cp', 'Wt', 'F', 'dP', 'I', 'Ko', 'Kv', 'Km', 'Cs', 'Cxc') ? v.Cp * sq(v.Wt / (v.F * v.dP * v.I) * v.Ko * v.Kv * v.Km * v.Cs * v.Cxc) : undefined,
              work: v => has(v, 'Cp', 'Wt', 'F', 'dP', 'I', 'Ko', 'Kv', 'Km', 'Cs', 'Cxc') ? '\\(s_c = ' + fmt(v.Cp) + '\\left[\\frac{' + fmt(v.Wt) + '}{' + fmt(v.F) + '(' + fmt(v.dP) + ')' + fmt(v.I) + '}(' + fmt(v.Ko) + ')(' + fmt(v.Kv) + ')(' + fmt(v.Km) + ')(' + fmt(v.Cs) + ')(' + fmt(v.Cxc) + ')\\right]^{1/2} = ' + fmt(v.Cp * sq(v.Wt / (v.F * v.dP * v.I) * v.Ko * v.Kv * v.Km * v.Cs * v.Cxc), 5) + '\\) psi' : null },
          ] },
        { id: 'swc', title: 'Permissible contact stress \\(s_{wc}\\) and wear safety', eq: '15-14, 15-22, 15-2', fig: ['f15-8', 'f15-12', 't15-4', 'f15-10', 'ccr'],
          text: '\\(C_L = 3.4822N_L^{-0.0602}\\) (Fig. 15-8), \\(C_H = 1\\), \\(C_R = \\sqrt{K_R}\\). Compare \\(n_w = S_H^2\\) with \\(S_F\\).',
          formula: '\\begin{aligned} C_L &= \\begin{cases}2 & N_L\\lt 10^4\\\\ 3.4822N_L^{-0.0602} & N_L\\ge 10^4\\end{cases},\\qquad s_{ac} = \\begin{cases}341H_B + 23\\,620 & \\text{grade 1}\\\\ 363.6H_B + 29\\,560 & \\text{grade 2}\\end{cases} \\\\ s_{wc} &= \\frac{s_{ac} C_L C_H}{S_H K_T C_R}\\end{aligned}',
          vars: [
            { id: 'CL', symbol: 'C_L', label: 'Pitting stress-cycle factor (pinion cycles)', kind: 'lookup', fig: 'f15-8', auto: v => has(v, 'NLP') ? (v.NLP < 1e4 ? 2 : 3.4822 * Math.pow(v.NLP, -0.0602)) : undefined, hint: 'auto = Eq. 15-14',
              work: v => has(v, 'NLP') ? '\\(C_L = ' + (v.NLP < 1e4 ? '2' : '3.4822(' + fmt(v.NLP, 3) + ')^{-0.0602} = ' + fmt(3.4822 * Math.pow(v.NLP, -0.0602))) + '\\)' : null },
            { id: 'CH', symbol: 'C_H', label: 'Hardness-ratio factor', kind: 'lookup', fig: 'f15-10', default: 1, hint: '1 when \\(H_{BP}/H_{BG} < 1.2\\)' },
            { id: 'SH', symbol: 'S_H', label: 'Wear factor of safety (design, on stress)', kind: 'input', default: 1, hint: 'tutorials rate power with \\(S_H = 1\\)' },
            { id: 'sac', symbol: 's_{ac}', label: 'Allowable contact stress number', unit: 'psi', kind: 'lookup', fig: 'f15-12', auto: v => has(v, 'HB', 'grade') ? (v.grade === 2 ? 363.6 * v.HB + 29560 : 341 * v.HB + 23620) : undefined, hint: 'auto = Eq. 15-22 from HB; or Table 15-4',
              work: v => has(v, 'HB', 'grade') ? '\\(s_{ac} = ' + (v.grade === 2 ? '363.6(' + v.HB + ') + 29\\,560' : '341(' + v.HB + ') + 23\\,620') + ' = ' + fmt(v.grade === 2 ? 363.6 * v.HB + 29560 : 341 * v.HB + 23620, 5) + '\\) psi' : null },
            { id: 'swc', symbol: 's_{wc}', label: 'Permissible contact stress', unit: 'psi', kind: 'calc', compute: v => has(v, 'sac', 'CL', 'CH', 'SH', 'KT', 'CR') ? v.sac * v.CL * v.CH / (v.SH * v.KT * v.CR) : undefined,
              work: v => has(v, 'sac', 'CL', 'CH', 'SH', 'KT', 'CR') ? '\\(s_{wc} = \\frac{' + fmt(v.sac, 5) + '(' + fmt(v.CL) + ')(' + fmt(v.CH) + ')}{' + fmt(v.SH) + '(' + fmt(v.KT) + ')(' + fmt(v.CR) + ')} = ' + fmt(v.sac * v.CL * v.CH / (v.SH * v.KT * v.CR), 5) + '\\) psi' : null },
            { id: 'nH', symbol: 'S_H', label: 'Actual wear safety factor \\(s_{wc}S_H/s_c\\)', kind: 'calc', compute: v => has(v, 'swc', 'sc', 'SH') ? v.swc * v.SH / v.sc : undefined },
            { id: 'nw', symbol: 'n_w', label: 'Wear safety factor on load \\(S_H^2\\) (compare with \\(S_F\\))', kind: 'calc', compute: v => has(v, 'nH') ? v.nH * v.nH : undefined },
          ],
          after: v => {
            if (!has(v, 'nH', 'SH')) return '';
            return v.nH >= v.SH * 0.999 ? '<span class="result-ok">Wear PASS — S_H = ' + fmt(v.nH, 3) + ', at least ' + fmt(v.SH) + ' (n_w = ' + fmt(v.nw, 3) + ' on load)</span>'
              : '<span class="result-bad">Wear FAIL — S_H = ' + fmt(v.nH, 3) + ' &lt; ' + fmt(v.SH) + '</span>';
          } },
      ] },

      { title: '7 · Result — required hardness / verdict', steps: [
        { id: 'res', title: 'Required through-hardened steel (Eqs. 15-22, 15-23 solved for \\(H_B\\))', fig: ['f15-13', 'f15-12', 'm-t2-2', 'm-f9-20', 'khk108'],
          text: 'Set \\(s_{wt} = s_t\\) and \\(s_{wc} = s_c\\) and solve for \\(H_B\\); pick a steel above the largest value (Shigley App. A-20/A-21, Mott App. 3). Above ≈ 400 HB use flame/induction or carburized case hardening.',
          vars: [
            { id: 'satReqP', symbol: 's_{at,req}', label: 'Required allowable bending stress (pinion) \\(s_tS_FK_TK_R/K_L\\)', unit: 'psi', kind: 'calc', compute: v => has(v, 'stP', 'SF', 'KT', 'KR', 'KLP') ? v.stP * v.SF * v.KT * v.KR / v.KLP : undefined },
            { id: 'satReqG', symbol: 's_{at,req,G}', label: 'Required allowable bending stress (gear)', unit: 'psi', kind: 'calc', compute: v => has(v, 'stG', 'SF', 'KT', 'KR', 'KLG') ? v.stG * v.SF * v.KT * v.KR / v.KLG : undefined },
            { id: 'sacReq', symbol: 's_{ac,req}', label: 'Required allowable contact stress \\(s_cS_HK_TC_R/(C_LC_H)\\)', unit: 'psi', kind: 'calc', compute: v => has(v, 'sc', 'SH', 'KT', 'CR', 'CL', 'CH') ? v.sc * v.SH * v.KT * v.CR / (v.CL * v.CH) : undefined },
            { id: 'HBb', symbol: 'H_{B,bend}', label: 'Required HB for bending (worse of pinion/gear)', unit: 'HB', kind: 'calc', digits: 3, compute: v => has(v, 'satReqP', 'satReqG', 'grade') ? hbBend(Math.max(v.satReqP, v.satReqG), v.grade) : undefined,
              work: v => has(v, 'satReqP', 'satReqG', 'grade') ? '\\(H_B = (' + fmt(Math.max(v.satReqP, v.satReqG), 5) + ' - ' + (v.grade === 2 ? '5980)/48' : '2100)/44') + ' = ' + fmt(hbBend(Math.max(v.satReqP, v.satReqG), v.grade), 3) + '\\)' : null },
            { id: 'HBc', symbol: 'H_{B,wear}', label: 'Required HB for pitting', unit: 'HB', kind: 'calc', digits: 3, compute: v => has(v, 'sacReq', 'grade') ? hbWear(v.sacReq, v.grade) : undefined,
              work: v => has(v, 'sacReq', 'grade') ? '\\(H_B = (' + fmt(v.sacReq, 5) + ' - ' + (v.grade === 2 ? '29\\,560)/363.6' : '23\\,620)/341') + ' = ' + fmt(hbWear(v.sacReq, v.grade), 3) + '\\)' : null },
            { id: 'HBreq', symbol: 'H_{B,req}', label: 'Governing required hardness', unit: 'HB', kind: 'calc', digits: 3, compute: v => has(v, 'HBb', 'HBc') ? Math.max(v.HBb, v.HBc) : undefined },
          ],
          after: v => {
            if (!has(v, 'HBreq')) return '';
            const gov = v.HBc >= v.HBb ? 'pitting (wear)' : 'bending';
            let s = '<b>Required: through-hardened grade ' + v.grade + ' steel, core hardness of at least ' + fmt(Math.ceil(v.HBreq), 3) + ' HB</b> — governed by ' + gov + '.';
            if (v.HBreq > 400) s += ' <span class="result-bad">Above 400 HB: specify flame/induction or carburized case-hardened steel (Tables 15-4 / 15-6) or enlarge the gears.</span>';
            if (has(v, 'HB')) {
              const ok = v.HB >= v.HBreq - 0.5;
              s += ok ? ' <span class="result-ok">Given ' + v.HB + ' HB is at least ' + fmt(v.HBreq, 3) + ' HB → DESIGN PASSES (bending n = ' + fmt(Math.min(v.nBP, v.nBG), 3) + ', wear S_H = ' + fmt(v.nH, 3) + ').</span>'
                : ' <span class="result-bad">Given ' + v.HB + ' HB &lt; ' + fmt(v.HBreq, 3) + ' HB → DESIGN FAILS in ' + gov + '.</span>';
            }
            return s;
          } },
      ] },

      { title: '8 · Power rating of the gearset (Tutorial 5) — set \\(s_t = s_{wt}\\) and \\(s_c = s_{wc}\\)', text: 'For a given material and \\(S_F = S_H = 1\\), solve Eqs. 15-3 and 15-1 for the load the teeth can carry and convert to power. The rating is the smallest of pinion bending, gear bending and wear.', steps: [
        { id: 'rate', title: 'Allowable \\(W^t\\) and power in bending (pinion, gear) and in wear', eq: '15-3, 15-1', fig: ['f15-15', 'f15-14'],
          formula: 'W^t_{bend} = \\frac{s_{wt}\\,F\\,K_x J}{P_d K_o K_v K_s K_m},\\qquad W^t_{wear} = \\left(\\frac{s_{wc}}{C_p}\\right)^2\\frac{F\\,d_P\\,I}{K_o K_v K_m C_s C_{xc}},\\qquad H = \\frac{W^t v_t}{33\\,000}',
          vars: [
            { id: 'WtbP', symbol: 'W^t_{bend,P}', label: 'Allowable load, pinion bending', unit: 'lbf', kind: 'calc', compute: v => has(v, 'swtP', 'F', 'JP', 'Pd', 'Ko', 'Kv', 'Ks', 'Km') ? v.swtP * v.F * v.JP / (v.Pd * v.Ko * v.Kv * v.Ks * v.Km) : undefined,
              work: v => has(v, 'swtP', 'F', 'JP', 'Pd', 'Ko', 'Kv', 'Ks', 'Km') ? '\\(W^t_{bend,P} = \\frac{' + fmt(v.swtP, 5) + '(' + fmt(v.F) + ')(1)(' + fmt(v.JP) + ')}{' + fmt(v.Pd) + '(' + fmt(v.Ko) + ')(' + fmt(v.Kv) + ')(' + fmt(v.Ks) + ')(' + fmt(v.Km) + ')} = ' + fmt(v.swtP * v.F * v.JP / (v.Pd * v.Ko * v.Kv * v.Ks * v.Km)) + '\\) lbf' : null },
            { id: 'HbP', symbol: 'H_{bend,P}', label: 'Power rating, pinion bending', unit: 'hp', kind: 'calc', compute: v => has(v, 'WtbP', 'vt') ? v.WtbP * v.vt / 33000 : undefined,
              work: v => has(v, 'WtbP', 'vt') ? '\\(H_{bend,P} = ' + fmt(v.WtbP) + '(' + fmt(v.vt) + ')/33\\,000 = ' + fmt(v.WtbP * v.vt / 33000, 3) + '\\) hp' : null },
            { id: 'WtbG', symbol: 'W^t_{bend,G}', label: 'Allowable load, gear bending', unit: 'lbf', kind: 'calc', compute: v => has(v, 'swtG', 'F', 'JG', 'Pd', 'Ko', 'Kv', 'Ks', 'Km') ? v.swtG * v.F * v.JG / (v.Pd * v.Ko * v.Kv * v.Ks * v.Km) : undefined },
            { id: 'HbG', symbol: 'H_{bend,G}', label: 'Power rating, gear bending', unit: 'hp', kind: 'calc', compute: v => has(v, 'WtbG', 'vt') ? v.WtbG * v.vt / 33000 : undefined },
            { id: 'Wtw', symbol: 'W^t_{wear}', label: 'Allowable load, pitting', unit: 'lbf', kind: 'calc', compute: v => has(v, 'swc', 'Cp', 'F', 'dP', 'I', 'Ko', 'Kv', 'Km', 'Cs', 'Cxc') ? Math.pow(v.swc / v.Cp, 2) * v.F * v.dP * v.I / (v.Ko * v.Kv * v.Km * v.Cs * v.Cxc) : undefined,
              work: v => has(v, 'swc', 'Cp', 'F', 'dP', 'I', 'Ko', 'Kv', 'Km', 'Cs', 'Cxc') ? '\\(W^t_{wear} = \\left(\\frac{' + fmt(v.swc, 5) + '}{' + fmt(v.Cp) + '}\\right)^2\\frac{' + fmt(v.F) + '(' + fmt(v.dP) + ')(' + fmt(v.I) + ')}{(' + fmt(v.Ko) + ')(' + fmt(v.Kv) + ')(' + fmt(v.Km) + ')(' + fmt(v.Cs) + ')(' + fmt(v.Cxc) + ')} = ' + fmt(Math.pow(v.swc / v.Cp, 2) * v.F * v.dP * v.I / (v.Ko * v.Kv * v.Km * v.Cs * v.Cxc)) + '\\) lbf' : null },
            { id: 'Hw', symbol: 'H_{wear}', label: 'Power rating, pitting', unit: 'hp', kind: 'calc', compute: v => has(v, 'Wtw', 'vt') ? v.Wtw * v.vt / 33000 : undefined,
              work: v => has(v, 'Wtw', 'vt') ? '\\(H_{wear} = ' + fmt(v.Wtw) + '(' + fmt(v.vt) + ')/33\\,000 = ' + fmt(v.Wtw * v.vt / 33000, 3) + '\\) hp' : null },
            { id: 'Hrate', symbol: 'H_{rated}', label: 'Power rating of the gearset (minimum)', unit: 'hp', kind: 'calc', compute: v => has(v, 'HbP', 'HbG', 'Hw') ? Math.min(v.HbP, v.HbG, v.Hw) : undefined },
          ],
          after: v => {
            if (!has(v, 'Hrate')) return '';
            const gov = v.Hw <= Math.min(v.HbP, v.HbG) ? 'wear (pitting)' : (v.HbP <= v.HbG ? 'pinion bending' : 'gear bending');
            let s = '<b>Power rating = ' + fmt(v.Hrate, 3) + ' hp</b> (bending: pinion ' + fmt(v.HbP, 3) + ' hp, gear ' + fmt(v.HbG, 3) + ' hp; wear ' + fmt(v.Hw, 3) + ' hp) — limited by ' + gov + ', with S_F = ' + fmt(v.SF) + ', S_H = ' + fmt(v.SH) + (has(v, 'HB') ? ' and ' + v.HB + ' HB' : ' and the s_{at}, s_{ac} entered') + '.';
            if (has(v, 'H')) s += v.H <= v.Hrate * 1.001 ? ' <span class="result-ok">H = ' + fmt(v.H) + ' hp is within the rating.</span>' : ' <span class="result-bad">H = ' + fmt(v.H) + ' hp exceeds the rating.</span>';
            return s;
          } },
      ] },
    ],
  };

  // --- helper fits (approximate; students must read the charts) ---
  function KLfit(N) { return N < 1e3 ? 2.7 : N < 3e6 ? 6.1514 * Math.pow(N, -0.1192) : 1.3558 * Math.pow(N, -0.0178); }
  function KRfit(R) { return R >= 0.99 ? 0.50 - 0.25 * Math.log10(1 - R) : 0.70 - 0.15 * Math.log10(1 - R); }
  function hbBend(sat, g) { return g === 2 ? (sat - 5980) / 48 : (sat - 2100) / 44; }
  function hbWear(sac, g) { return g === 2 ? (sac - 29560) / 363.6 : (sac - 23620) / 341; }
  // Table 9-5 pitch-line-speed rows (the guides' fallback for A_v); A4 is beyond the Kv charts, so the lowest used is A6.
  function avSpeed(vt) { return vt <= 800 ? 10 : vt <= 2000 ? 8 : 6; }
  // Mech p.69: pick F in [Fnom, Fmax], "preferably a whole number" — roundest value in range, else the midpoint (Mech footnote 52).
  function niceF(lo, hi) {
    for (const st of [1, 0.5, 0.25, 0.125]) { const f = Math.ceil(lo / st - 1e-9) * st; if (f <= hi + 1e-9) return f; }
    return (lo + hi) / 2;
  }
  // Bilinear interpolation on a digitised chart (clamped at the edges).
  function grid2(x, xs, y, ys, T) {
    const loc = (a, arr) => { if (a <= arr[0]) return [0, 0]; if (a >= arr[arr.length - 1]) return [arr.length - 2, 1]; let i = 1; while (a > arr[i]) i++; return [i - 1, (a - arr[i - 1]) / (arr[i] - arr[i - 1])]; };
    const [i, s] = loc(x, xs), [j, t] = loc(y, ys);
    return (1 - s) * (1 - t) * T[i][j] + s * (1 - t) * T[i + 1][j] + (1 - s) * t * T[i][j + 1] + s * t * T[i + 1][j + 1];
  }
  // Fig. 15-7 (= Mott Fig. 10-15) pixel-traced: J for the member with N teeth (rows) meshing with M teeth (columns).
  // Off-chart corners (M = 13 below N = 30, M ≥ 60 above N = M) are clamped to the curve ends. 25/25 → 0.217 (Ex. 15-1: 0.216).
  const JN = [13, 15, 16, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 100];
  const JM = [13, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100];
  const JT = [
    [0.167, 0.175, 0.198, 0.205, 0.216, 0.221, 0.224, 0.227, 0.227, 0.227, 0.227, 0.241, 0.248, 0.253],
    [0.167, 0.175, 0.200, 0.211, 0.220, 0.224, 0.228, 0.230, 0.232, 0.234, 0.237, 0.248, 0.256, 0.262],
    [0.167, 0.175, 0.201, 0.214, 0.222, 0.227, 0.230, 0.233, 0.236, 0.239, 0.241, 0.251, 0.260, 0.265],
    [0.167, 0.175, 0.200, 0.221, 0.231, 0.237, 0.241, 0.244, 0.247, 0.247, 0.255, 0.264, 0.273, 0.279],
    [0.167, 0.179, 0.197, 0.217, 0.234, 0.245, 0.251, 0.254, 0.258, 0.260, 0.268, 0.277, 0.286, 0.293],
    [0.167, 0.180, 0.198, 0.214, 0.231, 0.245, 0.254, 0.259, 0.265, 0.267, 0.280, 0.288, 0.297, 0.305],
    [0.169, 0.181, 0.199, 0.214, 0.229, 0.240, 0.253, 0.260, 0.267, 0.276, 0.289, 0.298, 0.307, 0.315],
    [0.170, 0.182, 0.201, 0.215, 0.227, 0.238, 0.249, 0.259, 0.268, 0.283, 0.297, 0.307, 0.316, 0.324],
    [0.172, 0.182, 0.202, 0.217, 0.226, 0.237, 0.246, 0.256, 0.270, 0.294, 0.311, 0.321, 0.331, 0.339],
    [0.172, 0.181, 0.202, 0.216, 0.229, 0.241, 0.253, 0.265, 0.276, 0.300, 0.321, 0.333, 0.343, 0.351],
    [0.177, 0.186, 0.210, 0.227, 0.239, 0.251, 0.262, 0.273, 0.283, 0.300, 0.328, 0.341, 0.352, 0.360],
    [0.184, 0.193, 0.220, 0.237, 0.248, 0.259, 0.270, 0.280, 0.289, 0.300, 0.328, 0.346, 0.359, 0.368],
    [0.189, 0.199, 0.226, 0.245, 0.256, 0.267, 0.277, 0.286, 0.295, 0.300, 0.328, 0.346, 0.363, 0.373],
    [0.191, 0.202, 0.230, 0.250, 0.262, 0.272, 0.282, 0.292, 0.300, 0.300, 0.328, 0.346, 0.363, 0.377],
  ];
  function jChart(N, M) { return grid2(N, JN, M, JM, JT); }
  // Fig. 15-6 (= Mott Fig. 10-19) pixel-traced: I vs pinion teeth (rows) and gear teeth (columns); cells with N_G < N_P hold the
  // curve-end value. 25/25 → 0.065 (Ex. 15-1), 16/48 → 0.077 (Mott Ex. 10-7), 20/60 → 0.083.
  const IN = [13, 14, 15, 16, 18, 20, 22, 25, 28, 30, 35, 40, 45, 50];
  const IM = [15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100];
  const IT = [
    [0.0568, 0.0623, 0.0649, 0.0665, 0.0680, 0.0693, 0.0696, 0.0700, 0.0710, 0.0733, 0.0770, 0.0790, 0.0815],
    [0.0570, 0.0631, 0.0663, 0.0686, 0.0703, 0.0717, 0.0724, 0.0730, 0.0737, 0.0760, 0.0799, 0.0821, 0.0848],
    [0.0571, 0.0635, 0.0676, 0.0700, 0.0721, 0.0736, 0.0746, 0.0753, 0.0761, 0.0784, 0.0826, 0.0853, 0.0878],
    [0.0571, 0.0636, 0.0684, 0.0711, 0.0735, 0.0752, 0.0763, 0.0772, 0.0780, 0.0804, 0.0849, 0.0881, 0.0907],
    [0.0571, 0.0632, 0.0688, 0.0724, 0.0751, 0.0771, 0.0788, 0.0797, 0.0808, 0.0837, 0.0885, 0.0923, 0.0951],
    [0.0571, 0.0619, 0.0682, 0.0727, 0.0757, 0.0781, 0.0802, 0.0814, 0.0828, 0.0863, 0.0914, 0.0954, 0.0985],
    [0.0571, 0.0619, 0.0670, 0.0722, 0.0756, 0.0784, 0.0809, 0.0824, 0.0842, 0.0883, 0.0936, 0.0978, 0.1012],
    [0.0571, 0.0619, 0.0650, 0.0704, 0.0747, 0.0780, 0.0811, 0.0829, 0.0855, 0.0906, 0.0962, 0.1005, 0.1042],
    [0.0571, 0.0619, 0.0650, 0.0684, 0.0729, 0.0768, 0.0804, 0.0826, 0.0861, 0.0921, 0.0979, 0.1023, 0.1063],
    [0.0571, 0.0619, 0.0650, 0.0672, 0.0715, 0.0756, 0.0795, 0.0820, 0.0863, 0.0927, 0.0986, 0.1030, 0.1073],
    [0.0571, 0.0619, 0.0650, 0.0672, 0.0681, 0.0724, 0.0763, 0.0795, 0.0860, 0.0931, 0.0994, 0.1039, 0.1085],
    [0.0571, 0.0619, 0.0650, 0.0672, 0.0681, 0.0695, 0.0731, 0.0767, 0.0848, 0.0922, 0.0989, 0.1035, 0.1084],
    [0.0571, 0.0619, 0.0650, 0.0672, 0.0681, 0.0695, 0.0700, 0.0747, 0.0834, 0.0911, 0.0977, 0.1028, 0.1078],
    [0.0571, 0.0619, 0.0650, 0.0672, 0.0681, 0.0695, 0.0700, 0.0723, 0.0821, 0.0900, 0.0966, 0.1021, 0.1071],
  ];
  function iChart(NP, NG) { return grid2(Math.min(NP, NG), IN, Math.max(NP, NG), IM, IT); }
})();
