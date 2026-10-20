/* Worm gearsets — Shigley 11e (Sec. 13-11 geometry, 13-17 forces, 15-6…15-9 AGMA rating, heat, Buckingham).
 * Merged Fizz bible pp 69-74 + Mech bible pp 107-113 procedure, in Shigley notation.
 * Defaults follow the Fizz / Mech guide assumptions (TOPIC.assumptions, cited by guide page; the guides' worm procedure is Mott's), with
 *   the UBC MECH 325 course conventions (v2/COURSE_CONVENTIONS.md §10: Worm_Gears_2024 slides, Module 2 p28–37) where the guides are silent:
 *   φn = 20°, f from Eq 15-38 (= the guides' μ formula), static f = 0.15 (the guides' value at Vs = 0) with self-locking when
 *   f_static > cos φn tan λ (λ < 6°), Ka = 1 and nd = 1 unless given (the guides' W_tG = 2To/DG has no application factor; the course
 *   example gives Ka = 1.25), W^t_G from Shigley 15-58, Fe ≤ 0.67 d (guides print DW/3), y from Table 10-5 (0.125 at 20°), bronze
 *   σall = 24 ksi (Shigley 15-53 for the verdict, the guides' Mott Kv form beside), sand-cast bronze, Dm = D, d range C^0.875/3 … /1.7,
 *   "better to assume no fan", ta 70 °F, lubricant limit 250 °F.
 * Verified against: Module 2 p28–37 worked example ("adapted from Shigley"): 1-thread steel worm 1725 rpm, NG 56, 1 hp out, d 1.5, Pt 8,
 *   φn 20°, Ka 1.25, nd 1, F 0.5, sand-cast bronze, 850 in² per side (A = 1700), ta 70 °F → mG 56, D 7.0, px 0.3927, C 4.25
 *   (d range 1.182–2.087 OK), a 0.125, b 0.1446, ht 0.2696, do 1.75, dr 1.211, Dt 7.25, Dr 6.711, c 0.0196, (FW)max 2.646,
 *   VW 677.4, VG 56.45, L 0.3927, λ 4.764°, pn 0.3913, Vs 679.8, f 0.0250, cos20° tan λ = 0.078 < 0.15 → self-locking, e 0.7563,
 *   W^t_G 966.1, W^t_W 106.4, Cs 786.9, Cm 0.767, Cv 0.312, HW 2.185, HG 1.653, σa 39 500 psi (Mott Kv 0.955 → 41 360) > 24 ksi FAIL,
 *   Hloss 17 570, hCR 0.396 no fan → ts 96.1 °F (fan 0.568 → 88 °F) — all reproduced.
 *   Also reproduces Shigley Ex. 15-3 (H0 3 hp, 1800 rpm, NW 1, NG 24, d 3, Pt 4, φn 14.5°, Ka 1.25, chill-cast, A 600 in², FG blank →
 *   auto 2d/3 = 2 in): f 0.0178, e 0.818, W^t_G 1284, W^t_W 131, Cm 0.823, Cv 0.211, (W^t)all 1456, Wf −23.7, Hf 1.02, HW 5.61, HG 4.58,
 *   σ 8 200 psi, ts 207.5 °F.
 *   NOT reproduced on purpose (slips in the course solution, which copied numbers from Shigley Ex. 15-3): the solution's (W^t)all = 1787
 *   uses Fe = 2 in although F = 0.5 in (sheet: Fe = 0.5 → 447 lbf < 966 → wear FAIL; the solution's own redesign at F = 7/8 in gives 782 lbf,
 *   consistent with Fe = F); Amin = 1642 uses C = 8.5 in instead of C = 4.25 (sheet: 505.5 in²); Wf = −29.5 is an arithmetic slip for
 *   0.025(966)/(0.025 sin λ − cos 20° cos λ) = −25.85 lbf (Hf 0.532 hp, not 0.608).
 * Verified against (gears polish, v2/notes/past_exam_gears.md): worm-turns step for midterm MC3 (2014/2022/2023/2024: 24 × 2/96 = 0.5 rev); HW2 P9 data on this page (Pt 10, d 1.25, NG 40,
 *   φn 14.5°) gives λ 4.57°, C 2.625, f 0.0324. */
(function () {
  const r = d => d * Math.PI / 180, fmt = (x, d) => H.fmt(x, d);
  const has = (v, ...a) => H.has(v, ...a);
  const sin = Math.sin, cos = Math.cos, tan = Math.tan, sq = Math.sqrt;
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

  window.TOPIC = {
    id: 'worm', book: 'shigley',
    title: 'Worm Gearsets — Geometry, Forces, Efficiency & AGMA Rating',
    subtitle: 'Shigley Secs. 13-11, 13-17, 15-6 … 15-9 (ANSI/AGMA 6034-B92) · merged Fizz + Mech guide procedure',
    sibling: 'worm_mott.html',
    intro: 'Steel worm driving a bronze gear on 90° shafts, Shigley notation: lead angle → \\(C\\) and tooth proportions → \\(V_s\\), \\(f\\) → efficiency and self-locking → forces with directions → AGMA \\((W^t)_{all}\\) (Eq. 15-28) → bending (Eq. 15-53) → heat balance → verdict. Yellow = chart reading (auto estimate until you type yours). Example = course Module 2 worked example (1-thread worm, 56T gear, 1 hp out at 1725 rpm, \\(d\\) = 1.5 in, \\(P_t\\) = 8, \\(K_a\\) = 1.25).',
    example: { H0: 1, nW: 1725, NW: 1, NG: 56, d: 1.5, Pt: 8, phin: 20, Ka: 1.25, nd: 1, FG: 0.5, A: 1700, ta: 70, fan: 0, mat: 'sand', fstat: 0.15, tmax: 250, sall: 24000 },

    assumptions: [
      { text: '\\(\\phi_n\\) = 20° unless given; a transverse angle converts with \\(\\tan\\phi_n = \\tan\\phi_t\\cos\\lambda\\)', src: 'Fizz p.70 · Mech p.108 · course Module 2', var: 'phin' },
      { text: '\\(K_a = 1\\) unless given (the guides’ \\(W_{tG} = 2T_o/D_G\\) has none; the Module 2 example uses 1.25)', src: 'Fizz p.72 · Mech p.110', var: 'Ka' },
      { text: '\\(n_d = 1\\) unless stated', src: 'course Module 2 · course Chains s26', var: 'nd' },
      { text: 'Gear load from Eq. 15-58, \\(W^t_G = 33\\,000n_dH_0K_a/(V_Ge)\\) (course); the guides’ \\(2T_o/D\\) is shown beside', src: 'Fizz p.72 · Mech p.110', step: 'fg' },
      { text: 'Running \\(f\\) from the AGMA fit, Eq. 15-38 (= the guides’ \\(\\mu\\) formula)', src: 'Fizz p.72 · Mech p.110', var: 'f' },
      { text: 'Static \\(f\\) = 0.15 for the self-locking test \\(f_{stat} > \\cos\\phi_n\\tan\\lambda\\); rule of thumb \\(\\lambda\\) < 6° (Mott: 5°)', src: 'Fizz p.72 · Mech p.110 · course Worm Gears s11', var: 'fstat' },
      { text: 'Efficiency depends on \\(f\\), \\(\\phi_n\\) and \\(\\lambda\\); it drops sharply for \\(\\lambda\\) below about 20°', src: 'course Worm Gears s10 · RAP quiz', step: 'eff' },
      { text: '\\(y\\) by \\(\\phi_n\\): 0.100 / 0.125 / 0.150 / 0.175 for 14.5° / 20° / 25° / 30°', src: 'Fizz p.73 · Mech p.111', var: 'y' },
      { text: 'Bending verdict with Eq. 15-53 (no dynamic factor); the guides’ \\(K_v = 1200/(1200 + V_G)\\) form is shown as \\(\\sigma_d\\)', src: 'Fizz p.73 · Mech p.111 · course Worm Gears s19', step: 'bend' },
      { text: '\\(\\sigma_{all}\\) = 24 ksi phosphor bronze (manganese bronze 17 ksi)', src: 'course Worm Gears s19 · Mott Sec. 10-11', var: 'sall' },
      { text: 'Sand-cast bronze for \\(C_s\\) unless stated (“most common”)', src: 'Fizz p.74 · Mech p.112 · course Worm Gears', var: 'mat' },
      { text: '\\(D_m = D\\) (standard addendum) in \\(C_s\\) and \\((W^t)_{all}\\); the guides use \\(D_G\\)', src: 'Fizz p.74 · Mech p.112', step: 'cfac' },
      { text: 'No face width given → \\(F_G = 2d/3\\) (Eq. 15-48); the guides’ \\(\\sqrt{d_o^2 - d^2} \\approx 6/P_d\\) is shown beside', src: 'Fizz p.71 · Mech p.108', var: 'FG' },
      { text: '\\(F_e = \\min(F_G,\\ 0.67d)\\) (Eq. 15-28); both guides print \\(D_W/3\\)', src: 'Fizz p.74 · Mech p.113', var: 'Fe' },
      { text: 'No fan on the worm shaft (“better to assume no fan”)', src: 'course Module 2 p36', var: 'fan' },
      { text: '\\(t_a\\) = 70 °F if not given; oil-sump limit 250 °F (120 °C)', src: 'course Worm Gears s20', var: 'tmax' },
      { text: 'Case area not given → AGMA minimum \\(A_{min} = 43.2C^{1.7}\\) (Eq. 15-52)', src: 'course Worm Gears s20', step: 'heat' },
    ],

    figures: [
      { id: 'f13-20', ref: 'Figure 13-20', title: 'Nomenclature of a single-enveloping worm gearset (axial pitch, lead, lead angle, pitch diameters)', src: 'figures/shigley/fig13-20.png', page: 721 },
      { id: 'f13-21', ref: 'Figure 13-21', title: 'Face width \\(F_G\\) of the worm gear (tangent to the worm pitch circle between addendum-circle intersections)', src: 'figures/shigley/fig13-21.png', page: 724 },
      { id: 't13-5', ref: 'Table 13-5', title: 'Recommended pressure angles and tooth depths vs lead angle', src: 'figures/shigley/table13-5.png', page: 724 },
      { id: 't15-8', ref: 'Table 15-8', title: 'Cylindrical worm dimensions common to worm and gear (\\(a\\), \\(b\\), \\(h_t\\) as fractions of \\(p_x\\))', src: 'figures/shigley/table15-8.png', page: 836 },
      { id: 't15-9', ref: 'Table 15-9', title: 'Largest lead angle \\(\\lambda_{max}\\) for a normal pressure angle \\(\\phi_n\\)', src: 'figures/shigley/table15-9.png', page: 840 },
      { id: 't15-10', ref: 'Table 15-10', title: 'Minimum number of gear teeth for a normal pressure angle', src: 'figures/shigley/table15-10.png', page: 843 },
      { id: 'f13-36', ref: 'Figure 13-36', title: 'Forces on the worm pitch cylinder (\\(W^x\\), \\(W^y\\), \\(W^z\\) and friction \\(fW\\))', src: 'figures/shigley/fig13-36.png', page: 740,
        note: 'Gear axis along x, worm axis along z: \\(W^x\\) = worm tangential = gear axial, \\(W^y\\) = radial on both, \\(W^z\\) = worm axial = gear tangential (equal and opposite pairs).' },
      { id: 'f13-37', ref: 'Figure 13-37', title: 'Velocity components in worm gearing (\\(V_W\\), \\(V_G\\), \\(V_S\\))', src: 'figures/shigley/fig13-37.png', page: 742 },
      { id: 'f13-38', ref: 'Figure 13-38', title: 'Coefficient of friction \\(f\\) vs sliding velocity (curve A cast iron/cast iron, curve B hardened steel/phosphor bronze)', src: 'figures/shigley/fig13-38.png', page: 742, note: 'The AGMA fit Eq. 15-38 is used as the auto-estimate; both are accepted.' },
      { id: 't13-6', ref: 'Table 13-6', title: 'Efficiency of worm gearsets for \\(f\\) = 0.05 vs lead angle', src: 'figures/shigley/table13-6.png', page: 741 },
      { id: 'f10-27', ref: 'Figure 10-27', title: 'Materials factor \\(C_s\\) vs mean gear diameter (sand-cast, chill-cast, centrifugal bronze)', src: 'figures/mott/fig10-27.png', page: 479, book: 'mott', note: 'Shigley gives only Eqs. 15-32 … 15-35; the course slides show this Mott chart.' },
      { id: 'f10-28', ref: 'Figure 10-28', title: 'Ratio correction factor \\(C_m\\) vs gear ratio', src: 'figures/mott/fig10-28.png', page: 479, book: 'mott', note: 'Equation form: Shigley Eq. 15-36.' },
      { id: 'f10-29', ref: 'Figure 10-29', title: 'Velocity factor \\(C_v\\) vs sliding velocity', src: 'figures/mott/fig10-29.png', page: 480, book: 'mott', note: 'Equation form: Shigley Eq. 15-37.' },
      { id: 'f10-25', ref: 'Figure 10-25', title: 'Coefficient of friction vs sliding velocity, steel worm / bronze gear (AGMA, same as Eq. 15-38)', src: 'figures/mott/fig10-25.png', page: 475, book: 'mott' },
      { id: 'f10-26', ref: 'Figure 10-26', book: 'mott', title: 'Efficiency vs lead angle for several friction coefficients (\\(\\phi_n\\) = 20°)', src: 'figures/mott/fig10-26.png', page: 476, note: 'Worm Gears s10: efficiency drops sharply for \\(\\lambda\\) < 20°.' },
      { id: 't15-11', ref: 'Table 15-11', title: 'Buckingham wear factor \\(K_w\\) for worm gearing', src: 'figures/shigley/table15-11.png', page: 847 },
      // ---- course-only slides (Worm_Gears_2024.pdf) ----
      { id: 'csl', ref: 'Worm Gears s11', book: 'course', title: 'Self-locking wormgear sets: \\(\\lambda\\) < 6°, static \\(f \\approx 0.15\\), criterion \\(f_{stat} > \\cos\\phi_n\\tan\\lambda\\)', src: 'figures/course/worm_self_locking_course.png' },
      { id: 'cbend', ref: 'Worm Gears s19', book: 'course', title: 'Bending stress in worm-gear teeth: \\(\\sigma_a = W^t_G/(p_nF_ey)\\), \\(y\\) = 0.125 at 20°, \\(\\sigma_{all}\\) = 24 ksi', src: 'figures/course/worm_bending_course.png', note: '“Mott uses a modified dynamic load value” — shown as the second stress.' },
      { id: 'cheat', ref: 'Worm Gears s20', book: 'course', title: 'Heat issues: \\(H_{loss}\\), \\(\\hbar_{CR}\\) with/without fan, sump temperature \\(t_s\\), AGMA minimum lateral area', src: 'figures/course/worm_heat_course.png', note: 'Module 2 p36: "better to assume no fan".' },
    ],

    sections: [
      { title: '1 · Problem data', steps: [
        { id: 'in', title: 'Given', fig: ['f13-20', 't13-5', 't15-10'],
          text: 'Give the output power \\(H_0\\) (what the machine needs), worm speed, threads \\(N_W\\), gear teeth \\(N_G\\), worm diameter \\(d\\) and gear transverse pitch \\(P_t = \\pi/p_x\\). If \\(C\\) is given instead of \\(d\\), use \\(d = 2C - D\\).',
          vars: [
            { id: 'H0', symbol: 'H_0', label: 'Output power (at the gear)', unit: 'hp', kind: 'input' },
            { id: 'nW', symbol: 'n_W', label: 'Worm speed', unit: 'rev/min', kind: 'input' },
            { id: 'NW', symbol: 'N_W', label: 'Number of worm threads (starts)', kind: 'input', hint: '1 … 4 typical; 1 for self-locking' },
            { id: 'NG', symbol: 'N_G', label: 'Worm-gear teeth', kind: 'input' },
            { id: 'd', symbol: 'd', label: 'Worm pitch diameter', unit: 'in', kind: 'input', hint: 'check against Eq. 15-27 range below' },
            { id: 'Pt', symbol: 'P_t', label: 'Transverse diametral pitch of gear', unit: 'teeth/in', kind: 'input', hint: 'or \\(\\pi/p_x\\); standard list below' },
            { id: 'phin', symbol: '\\phi_n', label: 'Normal pressure angle', kind: 'choice', options: [{ label: '14.5°', value: 14.5 }, { label: '20°', value: 20 }, { label: '25°', value: 25 }, { label: '30°', value: 30 }], default: 20, hint: 'Table 13-5 pairs it with \\(\\lambda\\)' },
            { id: 'Ka', symbol: 'K_a', label: 'Application factor', kind: 'input', default: 1, hint: '1 unless given; Module 2 example 1.25' },
            { id: 'nd', symbol: 'n_d', label: 'Design factor', kind: 'input', default: 1, hint: '1 unless stated' },
            { id: 'FG', symbol: 'F_G', label: 'Gear face width', unit: 'in', kind: 'input', hint: 'auto = Eq. 15-48 \\((F_G)_{rec}\\); \\(F_e\\) capped at 0.67\\(d\\)',
              auto: v => has(v, 'FGrec') ? v.FGrec : undefined },
            { id: 'mat', symbol: '', label: 'Gear bronze (for \\(C_s\\))', kind: 'choice', type: 'text', options: [{ label: 'Sand-cast bronze (course: "most common")', value: 'sand' }, { label: 'Chilled-cast (static chill / forged) bronze', value: 'chilled' }, { label: 'Centrifugally cast bronze', value: 'centrifugal' }], default: 'sand' },
          ],
          after: v => stdTable(v, { Pd: 'Pt', N: 'NG', list: STD_P, mods: STD_M, ref: 'Table 13-2', mref: 'preferred modules, Table 13-2', dlabel: '\\(D\\) (in)', sym: 'P_t' }) },
        { id: 'kin', title: 'Worm turns → gear turns (kinematics)', eq: '13-25',
          text: 'Each worm revolution advances the gear by \\(N_W\\) teeth, so gear turns = worm turns \\(\\times N_W/N_G\\). Sense: the worm acts as a screw and the gear tooth in mesh moves along the worm axis like a nut (step 5 below).',
          formula: '\\text{gear turns} = \\text{worm turns}\\cdot\\frac{N_W}{N_G},\\qquad n_G = \\frac{n_W N_W}{N_G}',
          vars: [
            { id: 'wrev', symbol: '\\text{worm turns}', label: 'Worm revolutions (if asked)', unit: 'rev', kind: 'input', hint: 'e.g. 24 turns of a 2-start worm on a 96T gear' },
            { id: 'grev', symbol: '\\text{gear turns}', label: 'Gear revolutions', unit: 'rev', kind: 'calc', compute: v => has(v, 'wrev', 'NW', 'NG') ? v.wrev * v.NW / v.NG : undefined,
              work: v => has(v, 'wrev', 'NW', 'NG') ? '\\(' + fmt(v.wrev) + '(' + fmt(v.NW) + ')/' + fmt(v.NG) + ' = ' + fmt(v.wrev * v.NW / v.NG) + '\\) rev (' + fmt(360 * v.wrev * v.NW / v.NG) + '°)' : null },
          ] },
      ] },

      { title: '2 · Geometry (Secs. 13-11, 15-6) — bible steps 1-2', steps: [
        { id: 'g1', title: 'Ratio, gear diameter, pitches, lead and lead angle', eq: '13-25, 13-27, 13-28', fig: ['f13-20', 't15-9'],
          formula: 'm_G = \\frac{N_G}{N_W},\\quad p_x = p_t = \\frac{\\pi}{P_t},\\quad D = \\frac{N_G}{P_t},\\quad L = p_x N_W,\\quad \\tan\\lambda = \\frac{L}{\\pi d}',
          vars: [
            { id: 'mG', symbol: 'm_G', label: 'Gear ratio \\(n_W/n_G\\)', kind: 'calc', compute: v => has(v, 'NG', 'NW') ? v.NG / v.NW : undefined },
            { id: 'nG', symbol: 'n_G', label: 'Gear speed', unit: 'rev/min', kind: 'calc', compute: v => has(v, 'nW', 'mG') ? v.nW / v.mG : undefined },
            { id: 'px', symbol: 'p_x', label: 'Axial pitch of worm = circular pitch of gear', unit: 'in', kind: 'calc', compute: v => has(v, 'Pt') ? Math.PI / v.Pt : undefined,
              work: v => has(v, 'Pt') ? '\\(p_x = \\pi/' + fmt(v.Pt) + ' = ' + fmt(Math.PI / v.Pt) + '\\) in' : null },
            { id: 'D', symbol: 'D', label: 'Gear pitch diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'NG', 'Pt') ? v.NG / v.Pt : undefined },
            { id: 'L', symbol: 'L', label: 'Lead', unit: 'in', kind: 'calc', compute: v => has(v, 'px', 'NW') ? v.px * v.NW : undefined, work: v => has(v, 'px', 'NW') ? '\\(L = ' + fmt(v.px) + '(' + v.NW + ') = ' + fmt(v.px * v.NW) + '\\) in' : null },
            { id: 'lam', symbol: '\\lambda', label: 'Lead angle', unit: '°', kind: 'calc', compute: v => has(v, 'L', 'd') ? H.deg(Math.atan(v.L / (Math.PI * v.d))) : undefined,
              work: v => has(v, 'L', 'd') ? '\\(\\lambda = \\tan^{-1}\\frac{' + fmt(v.L) + '}{\\pi(' + fmt(v.d) + ')} = ' + fmt(H.deg(Math.atan(v.L / (Math.PI * v.d)))) + '^\\circ\\)' : null,
              check: v => has(v, 'lam', 'phin') ? (v.lam > ({ 14.5: 16, 20: 25, 25: 35, 30: 45 })[v.phin] ? 'lead angle exceeds Table 15-9 \\(\\lambda_{max}\\) for \\(\\phi_n\\) = ' + v.phin + '°' : null) : null },
            { id: 'psiG', symbol: '\\psi_G', label: 'Gear helix angle (= \\(\\lambda\\) for 90° shafts)', unit: '°', kind: 'calc', compute: v => has(v, 'lam') ? v.lam : undefined },
            { id: 'NGmin', symbol: '(N_G)_{min}', label: 'Minimum gear teeth (Table 15-10)', kind: 'calc', compute: v => has(v, 'phin') ? ({ 14.5: 40, 20: 21, 25: 14, 30: 10 })[v.phin] : undefined,
              check: v => (has(v, 'NG', 'NGmin') && v.NG < v.NGmin) ? '\\(N_G\\) below the Table 15-10 minimum' : null },
          ] },
        { id: 'g2', title: 'Center distance and worm-diameter range', eq: '13-26, 15-27',
          formula: 'C = \\frac{d + D}{2},\\qquad \\frac{C^{0.875}}{3.0} \\le d \\le \\frac{C^{0.875}}{1.7}\\ (13\\text{-}26,\\ \\text{course}),\\qquad \\frac{C^{0.875}}{3} \\le d \\le \\frac{C^{0.875}}{1.6}\\ (15\\text{-}27)',
          vars: [
            { id: 'C', symbol: 'C', label: 'Center distance', unit: 'in', kind: 'calc', compute: v => has(v, 'd', 'D') ? (v.d + v.D) / 2 : undefined, work: v => has(v, 'd', 'D') ? '\\(C = (' + fmt(v.d) + ' + ' + fmt(v.D) + ')/2 = ' + fmt((v.d + v.D) / 2) + '\\) in' : null },
            { id: 'dlo', symbol: 'd_{lo}', label: 'Lower limit \\(C^{0.875}/3.0\\)', unit: 'in', kind: 'calc', compute: v => has(v, 'C') ? Math.pow(v.C, 0.875) / 3 : undefined, work: v => has(v, 'C') ? '\\(' + fmt(v.C) + '^{0.875}/3.0 = ' + fmt(Math.pow(v.C, 0.875) / 3) + '\\) in' : null },
            { id: 'dhi', symbol: 'd_{hi}', label: 'Upper limit \\(C^{0.875}/1.7\\) (Eq. 13-26, course)', unit: 'in', kind: 'calc', compute: v => has(v, 'C') ? Math.pow(v.C, 0.875) / 1.7 : undefined, work: v => has(v, 'C') ? '\\(' + fmt(v.C) + '^{0.875}/1.7 = ' + fmt(Math.pow(v.C, 0.875) / 1.7) + '\\) in' : null },
            { id: 'dhi16', symbol: 'd_{hi}\\ (15\\text{-}27)', label: 'AGMA upper limit \\(C^{0.875}/1.6\\) (Eq. 15-27)', unit: 'in', kind: 'calc', compute: v => has(v, 'C') ? Math.pow(v.C, 0.875) / 1.6 : undefined },
          ],
          after: v => has(v, 'd', 'dlo', 'dhi') ? (v.d >= v.dlo && v.d <= v.dhi ? '<span class="result-ok">d = ' + fmt(v.d) + ' in is inside the recommended range ' + fmt(v.dlo) + ' … ' + fmt(v.dhi) + ' in</span>' : '<span class="result-bad">d = ' + fmt(v.d) + ' in is outside ' + fmt(v.dlo) + ' … ' + fmt(v.dhi) + ' in (Eq. 13-26) — fine for a given set, flag it in a design</span>') : '' },
        { id: 'g3', title: 'Tooth proportions (Eqs. 15-39 … 15-48, Table 15-8)', fig: ['t15-8', 'f13-21'],
          formula: 'a = 0.3183p_x,\\ b = 0.3683p_x,\\ h_t = 0.6866p_x,\\ d_o = d + 2a,\\ d_r = d - 2b,\\ D_t = D + 2a,\\ D_r = D - 2b,\\ c = b - a,\\ (F_W)_{max} = 2\\sqrt{2Da},\\ (F_G)_{rec} = \\tfrac{2}{3}d',
          text: 'Fractions valid for \\(N_W \\le 2\\) at 14.5°/20° (Table 15-8 has the others). Shigley Eq. 15-48 uses \\(F_G = 2d/3\\); the guides’ (Mott) rule \\(\\sqrt{d_o^2 - d^2} \\approx 6/P_d\\) is shown for comparison.',
          vars: [
            { id: 'a', symbol: 'a', label: 'Addendum', unit: 'in', kind: 'calc', compute: v => has(v, 'px') ? 0.3183 * v.px : undefined },
            { id: 'b', symbol: 'b', label: 'Dedendum', unit: 'in', kind: 'calc', compute: v => has(v, 'px') ? 0.3683 * v.px : undefined },
            { id: 'ht', symbol: 'h_t', label: 'Whole depth', unit: 'in', kind: 'calc', compute: v => has(v, 'px') ? (v.px >= 0.16 ? 0.6866 * v.px : 0.7003 * v.px + 0.002) : undefined },
            { id: 'do', symbol: 'd_o', label: 'Worm outside diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'd', 'a') ? v.d + 2 * v.a : undefined },
            { id: 'dr', symbol: 'd_r', label: 'Worm root diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'd', 'b') ? v.d - 2 * v.b : undefined },
            { id: 'Dt', symbol: 'D_t', label: 'Gear throat diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'D', 'a') ? v.D + 2 * v.a : undefined },
            { id: 'Dr', symbol: 'D_r', label: 'Gear root diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'D', 'b') ? v.D - 2 * v.b : undefined },
            { id: 'cl', symbol: 'c', label: 'Clearance', unit: 'in', kind: 'calc', compute: v => has(v, 'a', 'b') ? v.b - v.a : undefined },
            { id: 'FWmax', symbol: '(F_W)_{max}', label: 'Worm face length', unit: 'in', kind: 'calc', compute: v => has(v, 'D', 'a') ? 2 * sq(2 * v.D * v.a) : undefined },
            { id: 'FGrec', symbol: '(F_G)_{rec}', label: 'Recommended gear face width (Eq. 15-48: \\(2d/3\\) for \\(p_x\\) > 0.16 in)', unit: 'in', kind: 'calc', compute: v => has(v, 'd', 'px') ? (v.px > 0.16 ? 2 * v.d / 3 : (has(v, 'do', 'cl', 'a') ? 1.125 * sq(Math.pow(v.do + 2 * v.cl, 2) - Math.pow(v.do - 4 * v.a, 2)) : undefined)) : undefined,
              work: v => has(v, 'd', 'px') ? (v.px > 0.16 ? '\\((F_G)_{rec} = 2(' + fmt(v.d) + ')/3 = ' + fmt(2 * v.d / 3) + '\\) in' : (has(v, 'do', 'cl', 'a') ? '\\((F_G)_{rec} = 1.125\\sqrt{(' + fmt(v.do) + ' + 2(' + fmt(v.cl) + '))^2 - (' + fmt(v.do) + ' - 4(' + fmt(v.a) + '))^2} = ' + fmt(1.125 * sq(Math.pow(v.do + 2 * v.cl, 2) - Math.pow(v.do - 4 * v.a, 2))) + '\\) in' : null)) : null },
            { id: 'FGmott', symbol: 'F_G\\ (\\text{bible})', label: 'Guide rule \\(\\sqrt{d_o^2 - d^2} \\approx 6/P_d\\)', unit: 'in', kind: 'calc', compute: v => has(v, 'do', 'd') ? sq(v.do * v.do - v.d * v.d) : undefined },
            { id: 'pn', symbol: 'p_n', label: 'Normal circular pitch \\(p_x\\cos\\lambda\\)', unit: 'in', kind: 'calc', compute: v => has(v, 'px', 'lam') ? v.px * cos(r(v.lam)) : undefined },
          ] },
      ] },

      { title: '3 · Velocities and friction — bible steps 3-5', steps: [
        { id: 'vel', title: 'Pitch-line and sliding velocities', eq: '13-47, 15-62', fig: ['f13-37'],
          text: 'Worm meshes are predominantly sliding (\\(V_s > V_W\\)); spur and bevel teeth mostly roll.',
          formula: 'V_W = \\frac{\\pi d\\, n_W}{12},\\quad V_G = \\frac{\\pi D\\, n_G}{12},\\quad V_s = \\frac{V_W}{\\cos\\lambda} = \\frac{V_G}{\\sin\\lambda}',
          vars: [
            { id: 'VW', symbol: 'V_W', label: 'Worm pitch-line velocity', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'd', 'nW') ? Math.PI * v.d * v.nW / 12 : undefined, work: v => has(v, 'd', 'nW') ? '\\(V_W = \\pi(' + fmt(v.d) + ')(' + fmt(v.nW) + ')/12 = ' + fmt(Math.PI * v.d * v.nW / 12) + '\\) ft/min' : null },
            { id: 'VG', symbol: 'V_G', label: 'Gear pitch-line velocity', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'D', 'nG') ? Math.PI * v.D * v.nG / 12 : undefined, work: v => has(v, 'D', 'nG') ? '\\(V_G = \\pi(' + fmt(v.D) + ')(' + fmt(v.nG) + ')/12 = ' + fmt(Math.PI * v.D * v.nG / 12) + '\\) ft/min' : null },
            { id: 'Vs', symbol: 'V_s', label: 'Sliding velocity', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'VW', 'lam') ? v.VW / cos(r(v.lam)) : undefined, work: v => has(v, 'VW', 'lam') ? '\\(V_s = ' + fmt(v.VW) + '/\\cos ' + fmt(v.lam) + '^\\circ = ' + fmt(v.VW / cos(r(v.lam))) + '\\) ft/min' : null },
          ] },
        { id: 'fric', title: 'Coefficient of friction', eq: '15-38', fig: ['f13-38', 'f10-25', 'csl'],
          text: 'Running \\(f\\) from the AGMA fit (Eq. 15-38 = Mott Eq. 10-27); the static value for the self-locking test is about 0.15 (steel on bronze).',
          formula: 'f = \\begin{cases}0.15 & V_s = 0\\\\ 0.124\\exp(-0.074V_s^{0.645}) & 0 \\lt  V_s \\le 10\\\\ 0.103\\exp(-0.110V_s^{0.450}) + 0.012 & V_s \\gt  10\\ \\text{ft/min}\\end{cases}',
          vars: [
            { id: 'f', symbol: 'f', label: 'Coefficient of friction (running)', kind: 'lookup', fig: 'f13-38', hint: 'auto = Eq. 15-38; or Fig. 13-38 curve B',
              auto: v => has(v, 'Vs') ? fFit(v.Vs) : undefined,
              work: v => has(v, 'Vs') ? (v.Vs > 10 ? '\\(f = 0.103\\exp[-0.110(' + fmt(v.Vs) + ')^{0.450}] + 0.012 = ' + fmt(fFit(v.Vs), 3) + '\\)' : '\\(f = 0.124\\exp[-0.074(' + fmt(v.Vs) + ')^{0.645}] = ' + fmt(fFit(v.Vs), 3) + '\\)') : null },
            { id: 'fstat', symbol: 'f_{stat}', label: 'Static coefficient of friction', kind: 'input', default: 0.15, hint: 'about 0.15 steel/bronze (Fig. 10-25 at \\(V_s\\) = 0)' },
          ] },
      ] },

      { title: '4 · Efficiency and self-locking — bible steps 8-10', steps: [
        { id: 'eff', title: 'Mechanical efficiency and self-locking', eq: '13-46, 15-54, 15-55', fig: ['t13-6', 'csl', 'f10-26'],
          text: 'Efficiency depends on \\(f\\), \\(\\phi_n\\) and \\(\\lambda\\). Self-locking when \\(f_{stat} > \\cos\\phi_n\\tan\\lambda\\) (Module 2 p31); rule of thumb \\(\\lambda\\) < 6°.',
          formula: 'e_W = \\frac{\\cos\\phi_n - f\\tan\\lambda}{\\cos\\phi_n + f\\cot\\lambda}\\ (\\text{worm driving}),\\qquad e_G = \\frac{\\cos\\phi_n - f\\cot\\lambda}{\\cos\\phi_n + f\\tan\\lambda}\\ (\\text{gear driving})',
          vars: [
            { id: 'e', symbol: 'e_W', label: 'Efficiency, worm driving', kind: 'calc', compute: v => has(v, 'phin', 'f', 'lam') ? (cos(r(v.phin)) - v.f * tan(r(v.lam))) / (cos(r(v.phin)) + v.f / tan(r(v.lam))) : undefined,
              work: v => has(v, 'phin', 'f', 'lam') ? '\\(e = \\frac{\\cos ' + v.phin + '^\\circ - ' + fmt(v.f, 3) + '\\tan ' + fmt(v.lam) + '^\\circ}{\\cos ' + v.phin + '^\\circ + ' + fmt(v.f, 3) + '\\cot ' + fmt(v.lam) + '^\\circ} = ' + fmt((cos(r(v.phin)) - v.f * tan(r(v.lam))) / (cos(r(v.phin)) + v.f / tan(r(v.lam)))) + '\\)' : null },
            { id: 'eG', symbol: 'e_G', label: 'Efficiency, gear driving (back-driving)', kind: 'calc', compute: v => has(v, 'phin', 'f', 'lam') ? (cos(r(v.phin)) - v.f / tan(r(v.lam))) / (cos(r(v.phin)) + v.f * tan(r(v.lam))) : undefined },
            { id: 'Hin', symbol: 'H_{in}', label: 'Input power \\(H_0/e\\) (nominal)', unit: 'hp', kind: 'calc', compute: v => has(v, 'H0', 'e') ? v.H0 / v.e : undefined },
            { id: 'lock', symbol: '\\cos\\phi_n\\tan\\lambda', label: 'Self-locking criterion (compare with \\(f_{stat}\\))', kind: 'calc', compute: v => has(v, 'phin', 'lam') ? cos(r(v.phin)) * tan(r(v.lam)) : undefined },
          ],
          after: v => {
            if (!has(v, 'lock', 'fstat', 'lam')) return '';
            const sl = v.fstat > v.lock;
            return (sl ? '<span class="result-ok">Self-locking: \\(f_{stat} = ' + fmt(v.fstat) + ' > \\cos\\phi_n\\tan\\lambda = ' + fmt(v.lock, 3) + '\\) — the gear cannot drive the worm' : '<span class="result-bad">Not self-locking: \\(f_{stat} = ' + fmt(v.fstat) + ' < \\cos\\phi_n\\tan\\lambda = ' + fmt(v.lock, 3) + '\\) — the gear can back-drive the worm') + '; \\(\\lambda = ' + fmt(v.lam) + '^\\circ\\) (rule of thumb: below 6° is self-locking' + (v.eG < 0 ? '; \\(e_G < 0\\) confirms' : '') + ').</span>';
          } },
      ] },

      { title: '5 · Forces — bible steps 6-7 (Secs. 13-17, 15-7)', steps: [
        { id: 'fg', title: 'Gear tangential force from output power, then worm tangential force', eq: '15-58, 15-57',
          formula: 'W^t_G = \\frac{33\\,000\\,n_d H_0 K_a}{V_G\\,e},\\qquad W^t_W = W^t_G\\,\\frac{\\cos\\phi_n\\sin\\lambda + f\\cos\\lambda}{\\cos\\phi_n\\cos\\lambda - f\\sin\\lambda}',
          text: 'Shigley and the course fold \\(n_d\\) and \\(K_a\\) into the gear load and divide by \\(e\\). The guides’ \\(2T_o/D\\) (no \\(K_a\\), \\(n_d\\), \\(e\\)) is shown for comparison.',
          vars: [
            { id: 'WtG', symbol: 'W^t_G', label: 'Gear tangential force (design)', unit: 'lbf', kind: 'calc', compute: v => has(v, 'nd', 'H0', 'Ka', 'VG', 'e') ? 33000 * v.nd * v.H0 * v.Ka / (v.VG * v.e) : undefined,
              work: v => has(v, 'nd', 'H0', 'Ka', 'VG', 'e') ? '\\(W^t_G = \\frac{33\\,000(' + fmt(v.nd) + ')(' + fmt(v.H0) + ')(' + fmt(v.Ka) + ')}{' + fmt(v.VG) + '(' + fmt(v.e) + ')} = ' + fmt(33000 * v.nd * v.H0 * v.Ka / (v.VG * v.e)) + '\\) lbf' : null },
            { id: 'To', symbol: 'T_o', label: 'Nominal output torque \\(63\\,000H_0/n_G\\)', unit: 'lbf·in', kind: 'calc', compute: v => has(v, 'H0', 'nG') ? 63000 * v.H0 / v.nG : undefined },
            { id: 'WtG0', symbol: '2T_o/D', label: 'Nominal gear tangential force (guide form, no \\(K_a\\), \\(n_d\\), \\(e\\))', unit: 'lbf', kind: 'calc', compute: v => has(v, 'To', 'D') ? 2 * v.To / v.D : undefined },
            { id: 'WtW', symbol: 'W^t_W', label: 'Worm tangential force', unit: 'lbf', kind: 'calc', compute: v => has(v, 'WtG', 'phin', 'lam', 'f') ? v.WtG * (cos(r(v.phin)) * sin(r(v.lam)) + v.f * cos(r(v.lam))) / (cos(r(v.phin)) * cos(r(v.lam)) - v.f * sin(r(v.lam))) : undefined,
              work: v => has(v, 'WtG', 'phin', 'lam', 'f') ? '\\(W^t_W = ' + fmt(v.WtG) + '\\frac{\\cos ' + v.phin + '^\\circ\\sin ' + fmt(v.lam) + '^\\circ + ' + fmt(v.f, 3) + '\\cos ' + fmt(v.lam) + '^\\circ}{\\cos ' + v.phin + '^\\circ\\cos ' + fmt(v.lam) + '^\\circ - ' + fmt(v.f, 3) + '\\sin ' + fmt(v.lam) + '^\\circ} = ' + fmt(v.WtG * (cos(r(v.phin)) * sin(r(v.lam)) + v.f * cos(r(v.lam))) / (cos(r(v.phin)) * cos(r(v.lam)) - v.f * sin(r(v.lam)))) + '\\) lbf' : null },
          ] },
        { id: 'fall', title: 'All three components on worm and gear, with directions', eq: '13-42, 13-43', fig: ['f13-36'],
          formula: 'W = \\frac{W^z}{\\cos\\phi_n\\cos\\lambda - f\\sin\\lambda},\\quad W^x = W(\\cos\\phi_n\\sin\\lambda + f\\cos\\lambda),\\quad W^y = W\\sin\\phi_n,\\quad W^z = W(\\cos\\phi_n\\cos\\lambda - f\\sin\\lambda)',
          text: 'Equal and opposite pairs: \\(W_{Wt} = W_{Ga}\\), \\(W_{Wa} = W_{Gt}\\), \\(W_{Wr} = W_{Gr}\\); radial forces point to each member’s own axis. Senses: the worm is a screw — a RH worm turned CW (viewed from its free end) drives the gear tooth along \\(-z\\) and is pushed along \\(+z\\) (Ex. 13-10).',
          vars: [
            { id: 'Wn', symbol: 'W', label: 'Normal (total) tooth force', unit: 'lbf', kind: 'calc', compute: v => has(v, 'WtG', 'phin', 'lam', 'f') ? v.WtG / (cos(r(v.phin)) * cos(r(v.lam)) - v.f * sin(r(v.lam))) : undefined },
            { id: 'Wx', symbol: 'W^x', label: 'Worm tangential = gear axial', unit: 'lbf', kind: 'calc', compute: v => has(v, 'WtW') ? v.WtW : undefined },
            { id: 'Wy', symbol: 'W^y', label: 'Radial (separating) force on worm and gear', unit: 'lbf', kind: 'calc', compute: v => has(v, 'Wn', 'phin') ? v.Wn * sin(r(v.phin)) : undefined,
              work: v => has(v, 'Wn', 'phin') ? '\\(W^y = ' + fmt(v.Wn) + '\\sin ' + v.phin + '^\\circ = ' + fmt(v.Wn * sin(r(v.phin))) + '\\) lbf' : null },
            { id: 'Wz', symbol: 'W^z', label: 'Worm axial = gear tangential', unit: 'lbf', kind: 'calc', compute: v => has(v, 'WtG') ? v.WtG : undefined },
            { id: 'Wf', symbol: 'W_f', label: 'Friction force (Eq. 15-61; sign per Fig. 13-36)', unit: 'lbf', kind: 'calc', compute: v => has(v, 'f', 'WtG', 'lam', 'phin') ? v.f * v.WtG / (v.f * sin(r(v.lam)) - cos(r(v.phin)) * cos(r(v.lam))) : undefined,
              work: v => has(v, 'f', 'WtG', 'lam', 'phin') ? '\\(W_f = \\frac{' + fmt(v.f, 3) + '(' + fmt(v.WtG) + ')}{' + fmt(v.f, 3) + '\\sin ' + fmt(v.lam) + '^\\circ - \\cos ' + v.phin + '^\\circ\\cos ' + fmt(v.lam) + '^\\circ} = ' + fmt(v.f * v.WtG / (v.f * sin(r(v.lam)) - cos(r(v.phin)) * cos(r(v.lam)))) + '\\) lbf' : null },
            { id: 'TW', symbol: 'T_W', label: 'Worm (input) torque \\(W^t_Wd/2\\)', unit: 'lbf·in', kind: 'calc', compute: v => has(v, 'WtW', 'd') ? v.WtW * v.d / 2 : undefined },
            { id: 'TG', symbol: 'T_G', label: 'Gear (output) torque \\(W^t_GD/2\\)', unit: 'lbf·in', kind: 'calc', compute: v => has(v, 'WtG', 'D') ? v.WtG * v.D / 2 : undefined },
          ] },
        { id: 'pow', title: 'Power bookkeeping', eq: '15-59, 15-60, 15-63',
          formula: 'H_W = \\frac{W^t_W V_W}{33\\,000},\\quad H_G = \\frac{W^t_G V_G}{33\\,000},\\quad H_f = \\frac{|W_f|V_s}{33\\,000}',
          vars: [
            { id: 'HW', symbol: 'H_W', label: 'Worm (input) power', unit: 'hp', kind: 'calc', compute: v => has(v, 'WtW', 'VW') ? v.WtW * v.VW / 33000 : undefined, work: v => has(v, 'WtW', 'VW') ? '\\(H_W = ' + fmt(v.WtW) + '(' + fmt(v.VW) + ')/33\\,000 = ' + fmt(v.WtW * v.VW / 33000) + '\\) hp' : null },
            { id: 'HG', symbol: 'H_G', label: 'Gear (output) power delivered', unit: 'hp', kind: 'calc', compute: v => has(v, 'WtG', 'VG') ? v.WtG * v.VG / 33000 : undefined, work: v => has(v, 'WtG', 'VG') ? '\\(H_G = ' + fmt(v.WtG) + '(' + fmt(v.VG) + ')/33\\,000 = ' + fmt(v.WtG * v.VG / 33000) + '\\) hp' : null },
            { id: 'Hf', symbol: 'H_f', label: 'Friction power', unit: 'hp', kind: 'calc', compute: v => has(v, 'Wf', 'Vs') ? Math.abs(v.Wf) * v.Vs / 33000 : undefined },
          ],
          after: v => has(v, 'HG', 'H0') ? (v.HG >= v.H0 * 0.999 ? '<span class="result-ok">\\(H_G = ' + fmt(v.HG, 3) + '\\) hp, at least the required ' + fmt(v.H0) + ' hp (includes \\(K_an_d\\))</span>' : '<span class="result-bad">\\(H_G < H_0\\)</span>') : '' },
      ] },

      { title: '6 · AGMA surface durability — bible steps 16-21 (Eq. 15-28)', steps: [
        { id: 'cfac', title: 'Materials, ratio-correction and velocity factors', eq: '15-32 … 15-37', fig: ['f10-27', 'f10-28', 'f10-29'],
          formula: '\\begin{aligned} C_s &= \\begin{cases}1000 & D_m \\le D^* \\\\ k_1 - k_2\\log D_m & D_m \\gt D^*\\end{cases} \\\\ C_m &= \\begin{cases}0.02\\sqrt{-m_G^2 + 40m_G - 76} + 0.46 & 3\\lt m_G\\le 20\\\\ 0.0107\\sqrt{-m_G^2 + 56m_G + 5145} & 20\\lt m_G\\le 76\\\\ 1.1483 - 0.00658m_G & m_G\\gt 76\\end{cases} \\\\ C_v &= \\begin{cases}0.659e^{-0.0011V_s} & V_s\\lt 700\\\\ 13.31V_s^{-0.571} & 700\\le V_s\\lt 3000\\\\ 65.52V_s^{-0.774} & V_s\\ge 3000\\end{cases}\\end{aligned}',
          text: '\\(C_s\\) for \\(C\\) > 3 in: sand-cast \\(1190 - 477\\log D_m\\) (\\(D_m\\) > 2.5 in), chilled \\(1412 - 456\\log D_m\\) (> 8 in), centrifugal \\(1251 - 180\\log D_m\\) (> 25 in), else 1000; \\(C \\le 3\\) in: \\(720 + 10.37C^3\\).',
          vars: [
            { id: 'Cs', symbol: 'C_s', label: 'Materials factor', kind: 'lookup', fig: 'f10-27', auto: v => has(v, 'D', 'C', 'mat') ? CsFit(v.D, v.C, v.mat) : undefined, hint: 'auto = Eqs. 15-32 … 15-35',
              work: v => has(v, 'D', 'C', 'mat') ? '\\(C_s = ' + CsWork(v.D, v.C, v.mat) + '\\)' : null },
            { id: 'Cm', symbol: 'C_m', label: 'Ratio correction factor', kind: 'lookup', fig: 'f10-28', auto: v => has(v, 'mG') ? CmFit(v.mG) : undefined, hint: 'auto = Eq. 15-36',
              work: v => has(v, 'mG') ? '\\(C_m = ' + CmWork(v.mG) + '\\)' : null },
            { id: 'Cv', symbol: 'C_v', label: 'Velocity factor', kind: 'lookup', fig: 'f10-29', auto: v => has(v, 'Vs') ? CvFit(v.Vs) : undefined, hint: 'auto = Eq. 15-37',
              work: v => has(v, 'Vs') ? '\\(C_v = ' + CvWork(v.Vs) + '\\)' : null },
          ] },
        { id: 'wall', title: 'Allowable tangential load and pitting check', eq: '15-28',
          formula: 'F_e = \\min(F_G,\\ 0.67d),\\qquad (W^t)_{all} = C_s D_m^{0.8} F_e C_m C_v',
          text: '\\(F_e\\) is capped at \\(0.67d\\); the mesh “survives at least 25 000 h” when \\(W^t_G \\le (W^t)_{all}\\).',
          vars: [
            { id: 'Fe', symbol: 'F_e', label: 'Effective face width', unit: 'in', kind: 'calc', compute: v => has(v, 'FG', 'd') ? Math.min(v.FG, 0.67 * v.d) : undefined,
              work: v => has(v, 'FG', 'd') ? '\\(F_e = \\min(' + fmt(v.FG) + ',\\ 0.67(' + fmt(v.d) + ') = ' + fmt(0.67 * v.d) + ') = ' + fmt(Math.min(v.FG, 0.67 * v.d)) + '\\) in' : null },
            { id: 'Wall', symbol: '(W^t)_{all}', label: 'Allowable (rated) tangential load', unit: 'lbf', kind: 'calc', compute: v => has(v, 'Cs', 'D', 'Fe', 'Cm', 'Cv') ? v.Cs * Math.pow(v.D, 0.8) * v.Fe * v.Cm * v.Cv : undefined,
              work: v => has(v, 'Cs', 'D', 'Fe', 'Cm', 'Cv') ? '\\((W^t)_{all} = ' + fmt(v.Cs) + '(' + fmt(v.D) + ')^{0.8}(' + fmt(v.Fe) + ')(' + fmt(v.Cm, 3) + ')(' + fmt(v.Cv, 3) + ') = ' + fmt(v.Cs * Math.pow(v.D, 0.8) * v.Fe * v.Cm * v.Cv) + '\\) lbf' : null },
            { id: 'Fereq', symbol: '(F_e)_{req}', label: 'Face width needed for \\(W^t_G\\)', unit: 'in', kind: 'calc', compute: v => has(v, 'WtG', 'Cs', 'D', 'Cm', 'Cv') ? v.WtG / (v.Cs * Math.pow(v.D, 0.8) * v.Cm * v.Cv) : undefined },
            { id: 'nwear', symbol: 'n_{wear}', label: 'Wear margin \\((W^t)_{all}/W^t_G\\)', kind: 'calc', compute: v => has(v, 'Wall', 'WtG') ? v.Wall / v.WtG : undefined },
          ],
          after: v => has(v, 'Wall', 'WtG') ? (v.Wall >= v.WtG ? '<span class="result-ok">Pitting/wear PASS — \\((W^t)_{all} = ' + fmt(v.Wall) + '\\) lbf \\(\\ge W^t_G = ' + fmt(v.WtG) + '\\) lbf (margin ' + fmt(v.nwear, 3) + ')</span>' : '<span class="result-bad">Pitting/wear FAIL — \\((W^t)_{all} = ' + fmt(v.Wall) + '\\) lbf \\(< W^t_G = ' + fmt(v.WtG) + '\\) lbf; need \\(F_e \\ge ' + fmt(v.Fereq, 3) + '\\) in or a harder/larger gear</span>') : '' },
        { id: 'buck', title: 'Buckingham wear load (alternative check, Sec. 15-9)', eq: '15-64', fig: ['t15-11'],
          formula: '(W^t_G)_{all} = K_w\\, d_G F_e',
          vars: [
            { id: 'Kw', symbol: 'K_w', label: 'Wear factor (Table 15-11)', kind: 'lookup', fig: 't15-11', hint: 'steel/bronze: 60, 80, 100, 120 at 14.5°, 20°, 25°, 30°',
              auto: v => has(v, 'phin') ? ({ 14.5: 60, 20: 80, 25: 100, 30: 120 })[v.phin] : undefined },
            { id: 'WallB', symbol: '(W^t_G)_{all,B}', label: 'Buckingham allowable load', unit: 'lbf', kind: 'calc', compute: v => has(v, 'Kw', 'D', 'Fe') ? v.Kw * v.D * v.Fe : undefined },
          ] },
      ] },

      { title: '7 · Gear-tooth bending (Eq. 15-53) — bible steps 11-15', steps: [
        { id: 'bend', title: 'Buckingham/Lewis bending stress in the worm-gear teeth', eq: '15-53', fig: ['cbend'],
          formula: '\\sigma_a = \\frac{W^t_G}{p_n F_e\\, y},\\qquad p_n = p_x\\cos\\lambda',
          text: 'Only the gear teeth are checked. Compare \\(\\sigma_a\\) with \\(\\sigma_{all}\\) = 24 ksi (phosphor bronze; manganese 17 ksi); the guides’ form divides by \\(K_v = 1200/(1200 + V_G)\\) first (second value).',
          vars: [
            { id: 'y', symbol: 'y', label: 'Lewis form factor', kind: 'lookup', fig: 'cbend', auto: v => has(v, 'phin') ? ({ 14.5: 0.100, 20: 0.125, 25: 0.150, 30: 0.175 })[v.phin] : undefined, hint: 'Mott Table 10-5; 0.125 at 20°' },
            { id: 'sig', symbol: '\\sigma_a', label: 'Gear bending stress', unit: 'psi', kind: 'calc', compute: v => has(v, 'WtG', 'pn', 'Fe', 'y') ? v.WtG / (v.pn * v.Fe * v.y) : undefined,
              work: v => has(v, 'WtG', 'pn', 'Fe', 'y') ? '\\(\\sigma_a = \\frac{' + fmt(v.WtG) + '}{' + fmt(v.pn) + '(' + fmt(v.Fe) + ')(' + fmt(v.y, 3) + ')} = ' + fmt(v.WtG / (v.pn * v.Fe * v.y), 5) + '\\) psi' : null },
            { id: 'KvM', symbol: 'K_v', label: 'Mott dynamic factor \\(1200/(1200 + V_G)\\)', kind: 'calc', compute: v => has(v, 'VG') ? 1200 / (1200 + v.VG) : undefined },
            { id: 'sigd', symbol: '\\sigma_d', label: 'Bending stress with dynamic load (Mott / guide form)', unit: 'psi', kind: 'calc', compute: v => has(v, 'sig', 'KvM') ? v.sig / v.KvM : undefined },
            { id: 'sall', symbol: '\\sigma_{all}', label: 'Allowable bending (fatigue) stress of gear bronze', unit: 'psi', kind: 'input', default: 24000, hint: '24 000 phosphor bronze; 17 000 manganese bronze' },
            { id: 'nb', symbol: 'n_{bend}', label: 'Bending safety factor \\(\\sigma_{all}/\\sigma_a\\) (Eq. 15-53)', kind: 'calc', compute: v => has(v, 'sall', 'sig') ? v.sall / v.sig : undefined, work: v => has(v, 'sall', 'sig') ? '\\(n = ' + fmt(v.sall, 5) + '/' + fmt(v.sig, 5) + ' = ' + fmt(v.sall / v.sig, 3) + '\\)' : null },
            { id: 'nbM', symbol: 'n_{bend,Mott}', label: 'Bending safety factor with the Mott dynamic load \\(\\sigma_{all}/\\sigma_d\\)', kind: 'calc', compute: v => has(v, 'sall', 'sigd') ? v.sall / v.sigd : undefined },
          ],
          after: v => has(v, 'nb') ? (v.nb >= 1 ? '<span class="result-ok">Bending PASS — n = ' + fmt(v.nb, 3) + ' (\\(\\sigma_a = ' + fmt(v.sig, 4) + '\\) psi; Mott form \\(\\sigma_d = ' + fmt(v.sigd, 4) + '\\) psi, n = ' + fmt(v.nbM, 3) + ')</span>' : '<span class="result-bad">Bending FAIL — \\(\\sigma_a = ' + fmt(v.sig, 4) + '\\) psi above ' + fmt(v.sall, 4) + ' psi (n = ' + fmt(v.nb, 3) + '; Mott form ' + fmt(v.sigd, 4) + ' psi): widen the face (up to \\(0.67d\\)), coarser pitch or a larger set</span>') : '' },
      ] },

      { title: '8 · Heat dissipation (Eqs. 15-49 … 15-52)', steps: [
        { id: 'heat', title: 'Heat loss, case area and oil-sump temperature', eq: '15-49 … 15-52', fig: ['cheat'],
          formula: 'H_{loss} = 33\\,000(1-e)H_{in},\\quad \\hbar_{CR} = \\begin{cases}n_W/6494 + 0.13 & \\text{no fan}\\\\ n_W/3939 + 0.13 & \\text{fan on worm shaft}\\end{cases},\\quad t_s = t_a + \\frac{H_{loss}}{\\hbar_{CR}A},\\quad A_{min} = 43.20C^{1.7}',
          text: '\\(H_{in}\\) is the worm power \\(H_W\\) (section 5); \\(A\\) is the total lateral case area (course example: 850 in\\(^2\\) per side, so 1700). Assume no fan; oil limit 250 °F (AGMA mineral oil often 200 °F).',
          vars: [
            { id: 'fan', symbol: '', label: 'Cooling', kind: 'choice', options: [{ label: 'No fan on worm shaft (course default)', value: 0 }, { label: 'Fan on worm shaft', value: 1 }], default: 0 },
            { id: 'A', symbol: 'A', label: 'Case lateral area (total)', unit: 'in^2', kind: 'input', hint: 'blank → use \\(A_{min}\\)' },
            { id: 'ta', symbol: 't_a', label: 'Ambient temperature', unit: '°F', kind: 'input', default: 70 },
            { id: 'tmax', symbol: 't_{max}', label: 'Oil temperature limit', unit: '°F', kind: 'input', default: 250, hint: '250 °F (120 °C) course limit; 200 °F conservative' },
            { id: 'Hloss', symbol: 'H_{loss}', label: 'Heat loss rate', unit: 'ft·lbf/min', kind: 'calc', compute: v => has(v, 'e', 'HW') ? 33000 * (1 - v.e) * v.HW : undefined,
              work: v => has(v, 'e', 'HW') ? '\\(H_{loss} = 33\\,000(1 - ' + fmt(v.e, 3) + ')(' + fmt(v.HW, 3) + ') = ' + fmt(33000 * (1 - v.e) * v.HW, 5) + '\\) ft·lbf/min' : null },
            { id: 'hcr', symbol: '\\hbar_{CR}', label: 'Combined heat-transfer coefficient', unit: 'ft·lbf/(min·in^2·°F)', kind: 'calc', compute: v => has(v, 'nW', 'fan') ? v.nW / (v.fan ? 3939 : 6494) + 0.13 : undefined,
              work: v => has(v, 'nW', 'fan') ? '\\(\\hbar_{CR} = ' + fmt(v.nW) + '/' + (v.fan ? 3939 : 6494) + ' + 0.13 = ' + fmt(v.nW / (v.fan ? 3939 : 6494) + 0.13, 3) + '\\)' : null },
            { id: 'Amin', symbol: 'A_{min}', label: 'AGMA minimum lateral area', unit: 'in^2', kind: 'calc', compute: v => has(v, 'C') ? 43.2 * Math.pow(v.C, 1.7) : undefined, work: v => has(v, 'C') ? '\\(A_{min} = 43.2(' + fmt(v.C) + ')^{1.7} = ' + fmt(43.2 * Math.pow(v.C, 1.7)) + '\\) in\\(^2\\)' : null },
            { id: 'Ause', symbol: 'A_{used}', label: 'Area used in the balance', unit: 'in^2', kind: 'calc', compute: v => has(v, 'A') ? v.A : (has(v, 'Amin') ? v.Amin : undefined) },
            { id: 'ts', symbol: 't_s', label: 'Oil sump temperature', unit: '°F', kind: 'calc', compute: v => has(v, 'ta', 'Hloss', 'hcr', 'Ause') ? v.ta + v.Hloss / (v.hcr * v.Ause) : undefined,
              work: v => has(v, 'ta', 'Hloss', 'hcr', 'Ause') ? '\\(t_s = ' + fmt(v.ta) + ' + \\frac{' + fmt(v.Hloss, 5) + '}{' + fmt(v.hcr, 3) + '(' + fmt(v.Ause) + ')} = ' + fmt(v.ta + v.Hloss / (v.hcr * v.Ause)) + '^\\circ\\)F' : null },
          ],
          after: v => {
            if (!has(v, 'ts')) return '';
            const lim = has(v, 'tmax') ? v.tmax : 250;
            let s = v.ts <= lim ? '<span class="result-ok">Thermal OK — \\(t_s = ' + fmt(v.ts) + '\\) °F, within ' + fmt(lim) + ' °F</span>' : '<span class="result-bad">Thermal problem — \\(t_s = ' + fmt(v.ts) + '\\) °F above ' + fmt(lim) + ' °F: add a fan, more case area or external cooling</span>';
            if (has(v, 'A', 'Amin') && v.A < v.Amin) s += ' <span class="result-bad">(case area ' + fmt(v.A) + ' in\\(^2\\) is below AGMA \\(A_{min}\\) = ' + fmt(v.Amin) + ' in\\(^2\\))</span>';
            return s;
          } },
      ] },

      { title: '9 · Verdict', steps: [
        { id: 'res', title: 'Summary',
          vars: [
            { id: 'eff_pct', symbol: 'e', label: 'Efficiency', unit: '%', kind: 'calc', compute: v => has(v, 'e') ? 100 * v.e : undefined },
          ],
          after: v => {
            if (!has(v, 'Wall', 'WtG')) return '';
            const items = [];
            items.push((v.Wall >= v.WtG ? 'wear OK' : 'wear FAIL') + ' (' + fmt(v.Wall) + ' vs ' + fmt(v.WtG) + ' lbf)');
            if (has(v, 'nb')) items.push((v.nb >= 1 ? 'bending OK' : 'bending FAIL') + ' (n = ' + fmt(v.nb, 3) + ')');
            const lim = has(v, 'tmax') ? v.tmax : 250;
            if (has(v, 'ts')) items.push((v.ts <= lim ? 'thermal OK' : 'thermal FAIL') + ' (\\(t_s\\) = ' + fmt(v.ts) + ' °F)');
            const ok = v.Wall >= v.WtG && (!has(v, 'nb') || v.nb >= 1) && (!has(v, 'ts') || v.ts <= lim);
            return '<b>' + (ok ? '<span class="result-ok">DESIGN PASSES</span>' : '<span class="result-bad">DESIGN FAILS</span>') + '</b> — ' + items.join('; ') + '. Efficiency ' + fmt(100 * v.e, 3) + ' %, input ' + fmt(v.HW, 3) + ' hp for ' + fmt(v.H0) + ' hp out' + (v.lock < v.fstat ? '; self-locking' : '; not self-locking') + '.';
          } },
      ] },
    ],
  };

  function fFit(Vs) { return Vs <= 0 ? 0.15 : Vs <= 10 ? 0.124 * Math.exp(-0.074 * Math.pow(Vs, 0.645)) : 0.103 * Math.exp(-0.110 * Math.pow(Vs, 0.450)) + 0.012; }
  function CsFit(Dm, C, mat) {
    if (C <= 3) return 720 + 10.37 * C * C * C;
    const lg = Math.log10(Dm);
    if (mat === 'sand') return Dm <= 2.5 ? 1000 : 1190 - 477 * lg;
    if (mat === 'centrifugal') return Dm <= 25 ? 1000 : 1251 - 180 * lg;
    return Dm <= 8 ? 1000 : 1412 - 456 * lg;
  }
  function CsWork(Dm, C, mat) {
    if (C <= 3) return '720 + 10.37(' + fmt(C) + ')^3 = ' + fmt(CsFit(Dm, C, mat)) + '\\ (C \\le 3)';
    const lim = mat === 'sand' ? 2.5 : mat === 'centrifugal' ? 25 : 8;
    if (Dm <= lim) return '1000\\ (D_m = ' + fmt(Dm) + ' \\le ' + lim + '\\text{ in})';
    const k = mat === 'sand' ? [1190, 477] : mat === 'centrifugal' ? [1251, 180] : [1412, 456];
    return k[0] + ' - ' + k[1] + '\\log(' + fmt(Dm) + ') = ' + fmt(CsFit(Dm, C, mat));
  }
  function CmFit(m) { return m <= 20 ? 0.02 * sq(Math.max(0, -m * m + 40 * m - 76)) + 0.46 : m <= 76 ? 0.0107 * sq(-m * m + 56 * m + 5145) : 1.1483 - 0.00658 * m; }
  function CmWork(m) { return (m <= 20 ? '0.02\\sqrt{-' + fmt(m) + '^2 + 40(' + fmt(m) + ') - 76} + 0.46' : m <= 76 ? '0.0107\\sqrt{-' + fmt(m) + '^2 + 56(' + fmt(m) + ') + 5145}' : '1.1483 - 0.00658(' + fmt(m) + ')') + ' = ' + fmt(CmFit(m), 3); }
  function CvFit(Vs) { return Vs < 700 ? 0.659 * Math.exp(-0.0011 * Vs) : Vs < 3000 ? 13.31 * Math.pow(Vs, -0.571) : 65.52 * Math.pow(Vs, -0.774); }
  function CvWork(Vs) { return (Vs < 700 ? '0.659e^{-0.0011(' + fmt(Vs) + ')}' : Vs < 3000 ? '13.31(' + fmt(Vs) + ')^{-0.571}' : '65.52(' + fmt(Vs) + ')^{-0.774}') + ' = ' + fmt(CvFit(Vs), 3); }
})();
