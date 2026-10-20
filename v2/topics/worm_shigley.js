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
 *   0.025(966)/(0.025 sin λ − cos 20° cos λ) = −25.85 lbf (Hf 0.532 hp, not 0.608). */
(function () {
  const r = d => d * Math.PI / 180, fmt = (x, d) => H.fmt(x, d);
  const has = (v, ...a) => H.has(v, ...a);
  const sin = Math.sin, cos = Math.cos, tan = Math.tan, sq = Math.sqrt;

  window.TOPIC = {
    id: 'worm', book: 'shigley',
    title: 'Worm Gearsets — Geometry, Forces, Efficiency & AGMA Rating',
    subtitle: 'Shigley Secs. 13-11, 13-17, 15-6 … 15-9 (ANSI/AGMA 6034-B92) · merged Fizz + Mech guide procedure',
    sibling: 'worm_mott.html',
    intro: 'Single-enveloping cylindrical worm (steel) driving a bronze worm gear on 90° shafts. Enter the output power, speeds, threads/teeth, worm diameter and pitch, then the sheet follows the 21-step bible procedure in Shigley notation: lead & lead angle → center distance and tooth proportions → velocities → coefficient of friction f (Eq. 15-38 / Fig. 13-38) → efficiency and self-locking check → forces on gear and worm with directions (Fig. 13-36, Eq. 13-42) → AGMA allowable tangential load (W<sup>t</sup>)<sub>all</sub> (Eq. 15-28) → Buckingham bending stress (Eq. 15-53) → heat balance and sump temperature (Eqs. 15-49 … 15-52) → PASS/FAIL. <b>Defaults follow the Fizz / Mech guide assumptions</b> listed in the panel below (the guides\' worm procedure is Mott\'s; course-slide values where the guides are silent): f from Eq. 15-38 (= the guides\' μ formula), static f = 0.15 for the self-locking test f<sub>static</sub> &gt; cos φ<sub>n</sub> tan λ (λ &lt; 6°), K<sub>a</sub> = n<sub>d</sub> = 1 unless given (applied to the output power, Eq. 15-58), F<sub>e</sub> ≤ 0.67 d, y = 0.125 at φ<sub>n</sub> = 20°, phosphor-bronze σ<sub>all</sub> = 24 ksi, sand-cast bronze for C<sub>s</sub>, "better to assume no fan", lubricant limit 250 °F (120 °C). Load the example to reproduce the Module 2 example (1-thread worm, 56T gear, 1 hp out at 1725 rpm, d = 1.5 in, P<sub>t</sub> = 8, K<sub>a</sub> = 1.25).',
    example: { H0: 1, nW: 1725, NW: 1, NG: 56, d: 1.5, Pt: 8, phin: 20, Ka: 1.25, nd: 1, FG: 0.5, A: 1700, ta: 70, fan: 0, mat: 'sand', fstat: 0.15, tmax: 250, sall: 24000 },

    assumptions: [
      { text: 'Normal pressure angle φ_n = 20° unless given (y, K_w and λ_max all depend on it); the guides convert a transverse angle with tan φ_n = tan φ_t cos λ', src: 'Fizz p.70 · Mech p.108 · course Module 2', var: 'phin' },
      { text: 'Application factor K_a = 1 unless given — the guides\' gear force W_tG = 2T_o/D_G carries no application factor; the course Module 2 example gives K_a = 1.25', src: 'Fizz p.72 · Mech p.110', var: 'Ka' },
      { text: 'Design factor n_d = 1 unless stated', src: 'course Module 2 · course Chains s26', var: 'nd' },
      { text: 'Gear force from Shigley Eq. 15-58, W^t_G = 33 000 n_d H_0 K_a/(V_G e) (course method); the guides use W_tG = 2T_o/D_G with no K_a and no ÷e — shown beside as 2T_o/D', src: 'Fizz p.72 · Mech p.110' },
      { text: 'Running friction from the AGMA curve (Eq. 15-38 = the guides\' formula): \\(f = 0.103\\,e^{-0.110V_s^{0.45}} + 0.012\\) for V_s > 10 ft/min (\\(0.124\\,e^{-0.074V_s^{0.645}}\\) below)', src: 'Fizz p.72 · Mech p.110', var: 'f' },
      { text: 'Static friction f = 0.15 (the guides\' value at V_s = 0) for the self-locking test f_stat > cos φ_n tan λ; rule of thumb λ < 6° (Mott: ≤ 5°)', src: 'Fizz p.72 · Mech p.110 · course Worm Gears s11', var: 'fstat' },
      { text: 'Lewis form factor y from Table 10-5 by φ_n (0.100 / 0.125 / 0.150 / 0.175 for 14.5° / 20° / 25° / 30°)', src: 'Fizz p.73 · Mech p.111', var: 'y' },
      { text: 'Bending verdict with Shigley Eq. 15-53 (no dynamic factor, course); the guides divide W_tG by K_v = 1200/(1200 + v_tG) first — shown as σ_d', src: 'Fizz p.73 · Mech p.111 · course Worm Gears s19' },
      { text: 'Allowable bending stress of the bronze gear σ_all = 24 ksi (phosphor bronze; manganese bronze 17 ksi)', src: 'course Worm Gears s19 · Mott Sec. 10-11', var: 'sall' },
      { text: 'Sand-cast bronze for C_s unless stated ("most common"; Mott Ex. 10-10 assumes sand cast)', src: 'Fizz p.74 · Mech p.112 · course Worm Gears', var: 'mat' },
      { text: 'Mean gear diameter D_m = D (standard addendum) in C_s and (W^t)_all — the guides use D_G', src: 'Fizz p.74 · Mech p.112' },
      { text: 'Gear face width not given → F_G = 2d/3 (Eq. 15-48, p_x > 0.16 in); the guides\' rule F_G = √(D_oW² − D_W²) ≈ 6/P_d is shown beside', src: 'Fizz p.71 · Mech p.108', var: 'FG' },
      { text: 'Effective face width F_e = min(F_G, 0.67d) (Eq. 15-28, Mott Eq. 10-42); both guides print D_W/3 — the textbook limit is used', src: 'Fizz p.74 · Mech p.113', var: 'Fe' },
      { text: 'No fan on the worm shaft ("better to assume no fan")', src: 'course Module 2 p36', var: 'fan' },
      { text: 'Ambient t_a = 70 °F if not given; oil-sump limit 250 °F (120 °C)', src: 'course Worm Gears s20', var: 'tmax' },
      { text: 'Case area not given → AGMA minimum lateral area A_min = 43.2C^{1.7} (Eq. 15-52)', src: 'course Worm Gears s20', var: 'Ause' },
    ],

    figures: [
      { id: 'f13-20', ref: 'Figure 13-20', title: 'Nomenclature of a single-enveloping worm gearset (axial pitch, lead, lead angle, pitch diameters)', src: 'figures/shigley/fig13-20.png', page: 721 },
      { id: 'f13-21', ref: 'Figure 13-21', title: 'Face width FG of the worm gear (tangent to worm pitch circle between addendum-circle intersections)', src: 'figures/shigley/fig13-21.png', page: 724 },
      { id: 't13-5', ref: 'Table 13-5', title: 'Recommended pressure angles and tooth depths vs lead angle', src: 'figures/shigley/table13-5.png', page: 724 },
      { id: 't15-8', ref: 'Table 15-8', title: 'Cylindrical worm dimensions common to worm and gear (a, b, ht as fractions of px)', src: 'figures/shigley/table15-8.png', page: 836 },
      { id: 't15-9', ref: 'Table 15-9', title: 'Largest lead angle λmax for a normal pressure angle φn', src: 'figures/shigley/table15-9.png', page: 840 },
      { id: 't15-10', ref: 'Table 15-10', title: 'Minimum number of gear teeth for a normal pressure angle', src: 'figures/shigley/table15-10.png', page: 843 },
      { id: 'f13-36', ref: 'Figure 13-36', title: 'Forces on the worm pitch cylinder (W^x, W^y, W^z and friction fW)', src: 'figures/shigley/fig13-36.png', page: 740,
        note: 'Gear axis ∥ x, worm axis ∥ z. W^x = worm tangential = gear axial; W^y = radial (separating) on both; W^z = worm axial = gear tangential. Gear forces are equal and opposite to the worm forces (Eq. 13-42).' },
      { id: 'f13-37', ref: 'Figure 13-37', title: 'Velocity components in worm gearing (VW, VG, VS)', src: 'figures/shigley/fig13-37.png', page: 742 },
      { id: 'f13-38', ref: 'Figure 13-38', title: 'Coefficient of friction f vs sliding velocity (curve A cast iron/cast iron, curve B hardened steel/phosphor bronze)', src: 'figures/shigley/fig13-38.png', page: 742, note: 'The AGMA fit Eq. 15-38 is used as the auto-estimate; both are accepted.' },
      { id: 't13-6', ref: 'Table 13-6', title: 'Efficiency of worm gearsets for f = 0.05 vs lead angle', src: 'figures/shigley/table13-6.png', page: 741 },
      { id: 'f10-27', ref: 'Figure 10-27', title: 'Materials factor Cs vs mean gear diameter (sand-cast, chill-cast, centrifugal bronze)', src: 'figures/mott/fig10-27.png', page: 479, book: 'mott', note: 'Shigley gives only the equations (15-32 … 15-35); the chart is Mott\'s and is what the course slides show.' },
      { id: 'f10-28', ref: 'Figure 10-28', title: 'Ratio correction factor Cm vs gear ratio', src: 'figures/mott/fig10-28.png', page: 479, book: 'mott', note: 'Equation form: Shigley Eq. 15-36.' },
      { id: 'f10-29', ref: 'Figure 10-29', title: 'Velocity factor Cv vs sliding velocity', src: 'figures/mott/fig10-29.png', page: 480, book: 'mott', note: 'Equation form: Shigley Eq. 15-37.' },
      { id: 'f10-25', ref: 'Figure 10-25', title: 'Coefficient of friction vs sliding velocity, steel worm / bronze gear (AGMA, same as Eq. 15-38)', src: 'figures/mott/fig10-25.png', page: 475, book: 'mott' },
      { id: 'f10-26', ref: 'Figure 10-26', book: 'mott', title: 'Efficiency vs lead angle for several friction coefficients (φn = 20°)', src: 'figures/mott/fig10-26.png', page: 476, note: 'Worm Gears slide 10 shows this chart: efficiency drops sharply for λ < 20°.' },
      { id: 't15-11', ref: 'Table 15-11', title: 'Buckingham wear factor Kw for worm gearing', src: 'figures/shigley/table15-11.png', page: 847 },
      // ---- course-only slides (Worm_Gears_2024.pdf) ----
      { id: 'csl', ref: 'Worm Gears s11', book: 'course', title: 'Self-locking wormgear sets: λ < 6°, static f ≈ 0.15, criterion f_static > cos φn tan λ (with Mott Fig. 10-26 efficiency vs lead angle)', src: 'figures/course/worm_self_locking_course.png' },
      { id: 'cbend', ref: 'Worm Gears s19', book: 'course', title: 'Bending stress in worm-gear teeth: σa = W^t_G/(pn Fe y), y = 0.125 at 20°, compare with σall = 24 ksi (phosphor bronze)', src: 'figures/course/worm_bending_course.png', note: '"Mott uses a modified dynamic load value (see 10-11)" — shown as the second stress value.' },
      { id: 'cheat', ref: 'Worm Gears s20', book: 'course', title: 'Heat issues: Hloss, ħCR with/without fan, sump temperature ts, AGMA minimum lateral area', src: 'figures/course/worm_heat_course.png', note: 'Module 2 p36: "better to assume no fan".' },
    ],

    sections: [
      { title: '1 · Problem data', steps: [
        { id: 'in', title: 'Given', fig: ['f13-20', 't13-5', 't15-10'],
          text: 'Worm gearsets are specified by output power (efficiency is low, so H<sub>0</sub> is what the driven machine needs), worm speed, number of worm threads N<sub>W</sub>, gear teeth N<sub>G</sub>, worm pitch diameter d, and the gear transverse diametral pitch P<sub>t</sub> (= π/p<sub>x</sub>). If a center distance C is given instead of d, use d = 2C − D once D is known.',
          vars: [
            { id: 'H0', symbol: 'H_0', label: 'Output power (at the gear)', unit: 'hp', kind: 'input' },
            { id: 'nW', symbol: 'n_W', label: 'Worm speed', unit: 'rev/min', kind: 'input' },
            { id: 'NW', symbol: 'N_W', label: 'Number of worm threads (starts)', kind: 'input', hint: '1 … 4 typical; 1 for self-locking' },
            { id: 'NG', symbol: 'N_G', label: 'Worm-gear teeth', kind: 'input' },
            { id: 'd', symbol: 'd', label: 'Worm pitch diameter', unit: 'in', kind: 'input', hint: 'check against Eq. 15-27 range below' },
            { id: 'Pt', symbol: 'P_t', label: 'Transverse diametral pitch of gear', unit: 'teeth/in', kind: 'input', hint: 'or type π/px' },
            { id: 'phin', symbol: '\\phi_n', label: 'Normal pressure angle', kind: 'choice', options: [{ label: '14.5°', value: 14.5 }, { label: '20°', value: 20 }, { label: '25°', value: 25 }, { label: '30°', value: 30 }], default: 20, hint: 'Table 13-5 pairs it with λ' },
            { id: 'Ka', symbol: 'K_a', label: 'Application factor', kind: 'input', default: 1, hint: '1 unless given (guides: no K_a); same idea as K_o; course Module 2 example 1.25' },
            { id: 'nd', symbol: 'n_d', label: 'Design factor', kind: 'input', default: 1, hint: 'course: nd = 1.0 unless stated' },
            { id: 'FG', symbol: 'F_G', label: 'Gear face width', unit: 'in', kind: 'input', hint: 'auto = (F_G)_rec of Eq. 15-48 (2d/3 for p_x > 0.16 in); F_e is capped at 0.67 d',
              auto: v => has(v, 'FGrec') ? v.FGrec : undefined },
            { id: 'mat', symbol: '', label: 'Gear bronze (for Cs)', kind: 'choice', type: 'text', options: [{ label: 'Sand-cast bronze (course: "most common")', value: 'sand' }, { label: 'Chilled-cast (static chill / forged) bronze', value: 'chilled' }, { label: 'Centrifugally cast bronze', value: 'centrifugal' }], default: 'sand' },
          ] },
      ] },

      { title: '2 · Geometry (Secs. 13-11, 15-6) — bible steps 1-2', steps: [
        { id: 'g1', title: 'Ratio, gear diameter, pitches, lead and lead angle', eq: '13-25, 13-27, 13-28', fig: ['f13-20', 't15-9'],
          formula: 'm_G = \\frac{N_G}{N_W},\\quad p_x = p_t = \\frac{\\pi}{P_t},\\quad D = \\frac{N_G}{P_t},\\quad L = p_x N_W,\\quad \\tan\\lambda = \\frac{L}{\\pi d}',
          vars: [
            { id: 'mG', symbol: 'm_G', label: 'Gear ratio (= nW/nG)', kind: 'calc', compute: v => has(v, 'NG', 'NW') ? v.NG / v.NW : undefined },
            { id: 'nG', symbol: 'n_G', label: 'Gear speed', unit: 'rev/min', kind: 'calc', compute: v => has(v, 'nW', 'mG') ? v.nW / v.mG : undefined },
            { id: 'px', symbol: 'p_x', label: 'Axial pitch of worm = circular pitch of gear', unit: 'in', kind: 'calc', compute: v => has(v, 'Pt') ? Math.PI / v.Pt : undefined,
              work: v => has(v, 'Pt') ? '\\(p_x = \\pi/' + fmt(v.Pt) + ' = ' + fmt(Math.PI / v.Pt) + '\\) in' : null },
            { id: 'D', symbol: 'D', label: 'Gear pitch diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'NG', 'Pt') ? v.NG / v.Pt : undefined },
            { id: 'L', symbol: 'L', label: 'Lead', unit: 'in', kind: 'calc', compute: v => has(v, 'px', 'NW') ? v.px * v.NW : undefined, work: v => has(v, 'px', 'NW') ? '\\(L = ' + fmt(v.px) + '(' + v.NW + ') = ' + fmt(v.px * v.NW) + '\\) in' : null },
            { id: 'lam', symbol: '\\lambda', label: 'Lead angle', unit: '°', kind: 'calc', compute: v => has(v, 'L', 'd') ? H.deg(Math.atan(v.L / (Math.PI * v.d))) : undefined,
              work: v => has(v, 'L', 'd') ? '\\(\\lambda = \\tan^{-1}\\frac{' + fmt(v.L) + '}{\\pi(' + fmt(v.d) + ')} = ' + fmt(H.deg(Math.atan(v.L / (Math.PI * v.d)))) + '^\\circ\\)' : null,
              check: v => has(v, 'lam', 'phin') ? (v.lam > ({ 14.5: 16, 20: 25, 25: 35, 30: 45 })[v.phin] ? 'λ exceeds Table 15-9 λmax for φn = ' + v.phin + '°' : null) : null },
            { id: 'psiG', symbol: '\\psi_G', label: 'Gear helix angle (= λ for 90° shafts)', unit: '°', kind: 'calc', compute: v => has(v, 'lam') ? v.lam : undefined },
            { id: 'NGmin', symbol: '(N_G)_{min}', label: 'Minimum gear teeth (Table 15-10)', kind: 'calc', compute: v => has(v, 'phin') ? ({ 14.5: 40, 20: 21, 25: 14, 30: 10 })[v.phin] : undefined,
              check: v => (has(v, 'NG', 'NGmin') && v.NG < v.NGmin) ? 'NG below Table 15-10 minimum' : null },
          ] },
        { id: 'g2', title: 'Center distance and worm-diameter range', eq: '13-26, 15-27',
          formula: 'C = \\frac{d + D}{2},\\qquad \\frac{C^{0.875}}{3.0} \\le d \\le \\frac{C^{0.875}}{1.7}\\ (13\\text{-}26,\\ \\text{course}),\\qquad \\frac{C^{0.875}}{3} \\le d \\le \\frac{C^{0.875}}{1.6}\\ (15\\text{-}27)',
          vars: [
            { id: 'C', symbol: 'C', label: 'Center distance', unit: 'in', kind: 'calc', compute: v => has(v, 'd', 'D') ? (v.d + v.D) / 2 : undefined, work: v => has(v, 'd', 'D') ? '\\(C = (' + fmt(v.d) + ' + ' + fmt(v.D) + ')/2 = ' + fmt((v.d + v.D) / 2) + '\\) in' : null },
            { id: 'dlo', symbol: 'd_{lo}', label: 'C^0.875 / 3.0', unit: 'in', kind: 'calc', compute: v => has(v, 'C') ? Math.pow(v.C, 0.875) / 3 : undefined, work: v => has(v, 'C') ? '\\(' + fmt(v.C) + '^{0.875}/3.0 = ' + fmt(Math.pow(v.C, 0.875) / 3) + '\\) in' : null },
            { id: 'dhi', symbol: 'd_{hi}', label: 'C^0.875 / 1.7 (Eq. 13-26, course)', unit: 'in', kind: 'calc', compute: v => has(v, 'C') ? Math.pow(v.C, 0.875) / 1.7 : undefined, work: v => has(v, 'C') ? '\\(' + fmt(v.C) + '^{0.875}/1.7 = ' + fmt(Math.pow(v.C, 0.875) / 1.7) + '\\) in' : null },
            { id: 'dhi16', symbol: 'd_{hi}\\ (15\\text{-}27)', label: 'C^0.875 / 1.6 (AGMA, Eq. 15-27)', unit: 'in', kind: 'calc', compute: v => has(v, 'C') ? Math.pow(v.C, 0.875) / 1.6 : undefined },
          ],
          after: v => has(v, 'd', 'dlo', 'dhi') ? (v.d >= v.dlo && v.d <= v.dhi ? '<span class="result-ok">d = ' + fmt(v.d) + ' in is inside the recommended range ' + fmt(v.dlo) + ' … ' + fmt(v.dhi) + ' in</span>' : '<span class="result-bad">d = ' + fmt(v.d) + ' in is outside the recommended range ' + fmt(v.dlo) + ' … ' + fmt(v.dhi) + ' in (Eq. 13-26) — acceptable if the set is given, flag it in a design</span>') : '' },
        { id: 'g3', title: 'Tooth proportions (Eqs. 15-39 … 15-48, Table 15-8)', fig: ['t15-8', 'f13-21'],
          formula: 'a = 0.3183p_x,\\ b = 0.3683p_x,\\ h_t = 0.6866p_x,\\ d_o = d + 2a,\\ d_r = d - 2b,\\ D_t = D + 2a,\\ D_r = D - 2b,\\ c = b - a,\\ (F_W)_{max} = 2\\sqrt{2Da},\\ (F_G)_{rec} = \\tfrac{2}{3}d',
          text: 'Valid for N<sub>W</sub> ≤ 2 at 14.5°/20° (Table 15-8 gives the 25° / N<sub>W</sub> > 2 fractions). The bible\'s F<sub>G</sub> = √(d<sub>o</sub>² − d²) ≈ 2p ≈ 6/P<sub>d</sub> is the Mott rule; Shigley Eq. 15-48 uses 2d/3 (= the Fe cap of Eq. 15-28).',
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
            { id: 'FGrec', symbol: '(F_G)_{rec}', label: 'Recommended gear face width (Eq. 15-48: 2d/3 for p_x > 0.16 in)', unit: 'in', kind: 'calc', compute: v => has(v, 'd', 'px') ? (v.px > 0.16 ? 2 * v.d / 3 : (has(v, 'do', 'cl', 'a') ? 1.125 * sq(Math.pow(v.do + 2 * v.cl, 2) - Math.pow(v.do - 4 * v.a, 2)) : undefined)) : undefined,
              work: v => has(v, 'd', 'px') ? (v.px > 0.16 ? '\\((F_G)_{rec} = 2(' + fmt(v.d) + ')/3 = ' + fmt(2 * v.d / 3) + '\\) in' : (has(v, 'do', 'cl', 'a') ? '\\((F_G)_{rec} = 1.125\\sqrt{(' + fmt(v.do) + ' + 2(' + fmt(v.cl) + '))^2 - (' + fmt(v.do) + ' - 4(' + fmt(v.a) + '))^2} = ' + fmt(1.125 * sq(Math.pow(v.do + 2 * v.cl, 2) - Math.pow(v.do - 4 * v.a, 2))) + '\\) in' : null)) : null },
            { id: 'FGmott', symbol: 'F_G\\ (\\text{bible})', label: 'Bible rule √(do² − d²) ≈ 6/Pd', unit: 'in', kind: 'calc', compute: v => has(v, 'do', 'd') ? sq(v.do * v.do - v.d * v.d) : undefined },
            { id: 'pn', symbol: 'p_n', label: 'Normal circular pitch px cos λ', unit: 'in', kind: 'calc', compute: v => has(v, 'px', 'lam') ? v.px * cos(r(v.lam)) : undefined },
          ] },
      ] },

      { title: '3 · Velocities and friction — bible steps 3-5', steps: [
        { id: 'vel', title: 'Pitch-line and sliding velocities', eq: '13-47, 15-62', fig: ['f13-37'],
          formula: 'V_W = \\frac{\\pi d\\, n_W}{12},\\quad V_G = \\frac{\\pi D\\, n_G}{12},\\quad V_s = \\frac{V_W}{\\cos\\lambda} = \\frac{V_G}{\\sin\\lambda}',
          vars: [
            { id: 'VW', symbol: 'V_W', label: 'Worm pitch-line velocity', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'd', 'nW') ? Math.PI * v.d * v.nW / 12 : undefined, work: v => has(v, 'd', 'nW') ? '\\(V_W = \\pi(' + fmt(v.d) + ')(' + fmt(v.nW) + ')/12 = ' + fmt(Math.PI * v.d * v.nW / 12) + '\\) ft/min' : null },
            { id: 'VG', symbol: 'V_G', label: 'Gear pitch-line velocity', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'D', 'nG') ? Math.PI * v.D * v.nG / 12 : undefined, work: v => has(v, 'D', 'nG') ? '\\(V_G = \\pi(' + fmt(v.D) + ')(' + fmt(v.nG) + ')/12 = ' + fmt(Math.PI * v.D * v.nG / 12) + '\\) ft/min' : null },
            { id: 'Vs', symbol: 'V_s', label: 'Sliding velocity', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'VW', 'lam') ? v.VW / cos(r(v.lam)) : undefined, work: v => has(v, 'VW', 'lam') ? '\\(V_s = ' + fmt(v.VW) + '/\\cos ' + fmt(v.lam) + '^\\circ = ' + fmt(v.VW / cos(r(v.lam))) + '\\) ft/min' : null },
          ] },
        { id: 'fric', title: 'Coefficient of friction', eq: '15-38', fig: ['f13-38', 'f10-25', 'csl'],
          text: 'Course: use the AGMA fit (Eq. 15-38, identical to Mott Fig. 10-25 / Eq. 10-27) for the running value; the <b>static</b> value for the self-locking test is ≈ 0.15 (steel on bronze).',
          formula: 'f = \\begin{cases}0.15 & V_s = 0\\\\ 0.124\\exp(-0.074V_s^{0.645}) & 0 \\lt  V_s \\le 10\\\\ 0.103\\exp(-0.110V_s^{0.450}) + 0.012 & V_s \\gt  10\\ \\text{ft/min}\\end{cases}',
          vars: [
            { id: 'f', symbol: 'f', label: 'Coefficient of friction (running)', kind: 'lookup', fig: 'f13-38', hint: 'auto = AGMA Eq. 15-38; or read Fig. 13-38 curve B (steel/bronze)',
              auto: v => has(v, 'Vs') ? fFit(v.Vs) : undefined,
              work: v => has(v, 'Vs') ? (v.Vs > 10 ? '\\(f = 0.103\\exp[-0.110(' + fmt(v.Vs) + ')^{0.450}] + 0.012 = ' + fmt(fFit(v.Vs), 3) + '\\)' : '\\(f = 0.124\\exp[-0.074(' + fmt(v.Vs) + ')^{0.645}] = ' + fmt(fFit(v.Vs), 3) + '\\)') : null },
            { id: 'fstat', symbol: 'f_{stat}', label: 'Static coefficient of friction', kind: 'input', default: 0.15, hint: '≈ 0.15 steel/bronze (course, Mott Fig. 10-25 at Vs = 0)' },
          ] },
      ] },

      { title: '4 · Efficiency and self-locking — bible steps 8-10', steps: [
        { id: 'eff', title: 'Mechanical efficiency and self-locking', eq: '13-46, 15-54, 15-55', fig: ['t13-6', 'csl', 'f10-26'],
          text: 'Course (Worm Gears s11): "in general λ &lt; 6° ensures self-locking"; check it with f<sub>static</sub> &gt; cos φ<sub>n</sub> tan λ (the reverse of Eq. 15-56; Module 2 p31).',
          formula: 'e_W = \\frac{\\cos\\phi_n - f\\tan\\lambda}{\\cos\\phi_n + f\\cot\\lambda}\\ (\\text{worm driving}),\\qquad e_G = \\frac{\\cos\\phi_n - f\\cot\\lambda}{\\cos\\phi_n + f\\tan\\lambda}\\ (\\text{gear driving})',
          vars: [
            { id: 'e', symbol: 'e_W', label: 'Efficiency, worm driving', kind: 'calc', compute: v => has(v, 'phin', 'f', 'lam') ? (cos(r(v.phin)) - v.f * tan(r(v.lam))) / (cos(r(v.phin)) + v.f / tan(r(v.lam))) : undefined,
              work: v => has(v, 'phin', 'f', 'lam') ? '\\(e = \\frac{\\cos ' + v.phin + '^\\circ - ' + fmt(v.f, 3) + '\\tan ' + fmt(v.lam) + '^\\circ}{\\cos ' + v.phin + '^\\circ + ' + fmt(v.f, 3) + '\\cot ' + fmt(v.lam) + '^\\circ} = ' + fmt((cos(r(v.phin)) - v.f * tan(r(v.lam))) / (cos(r(v.phin)) + v.f / tan(r(v.lam)))) + '\\)' : null },
            { id: 'eG', symbol: 'e_G', label: 'Efficiency, gear driving (back-driving)', kind: 'calc', compute: v => has(v, 'phin', 'f', 'lam') ? (cos(r(v.phin)) - v.f / tan(r(v.lam))) / (cos(r(v.phin)) + v.f * tan(r(v.lam))) : undefined },
            { id: 'Hin', symbol: 'H_{in}', label: 'Input power H0/e (nominal)', unit: 'hp', kind: 'calc', compute: v => has(v, 'H0', 'e') ? v.H0 / v.e : undefined },
            { id: 'lock', symbol: '\\cos\\phi_n\\tan\\lambda', label: 'Self-locking criterion value (compare with f_stat)', kind: 'calc', compute: v => has(v, 'phin', 'lam') ? cos(r(v.phin)) * tan(r(v.lam)) : undefined },
          ],
          after: v => {
            if (!has(v, 'lock', 'fstat', 'lam')) return '';
            const sl = v.fstat > v.lock;
            return (sl ? '<span class="result-ok">Self-locking: f<sub>stat</sub> = ' + fmt(v.fstat) + ' &gt; cos φ<sub>n</sub> tan λ = ' + fmt(v.lock, 3) + ' (Eq. 15-56 not satisfied → gear cannot drive the worm)' : '<span class="result-bad">NOT self-locking: f<sub>stat</sub> = ' + fmt(v.fstat) + ' &lt; cos φ<sub>n</sub> tan λ = ' + fmt(v.lock, 3) + ' — the gear can back-drive the worm') + '; λ = ' + fmt(v.lam) + '° (course rule of thumb: λ &lt; 6° ⇒ self-locking' + (v.eG < 0 ? ', e<sub>G</sub> &lt; 0 confirms' : '') + ').</span>';
          } },
      ] },

      { title: '5 · Forces — bible steps 6-7 (Secs. 13-17, 15-7)', steps: [
        { id: 'fg', title: 'Gear tangential force from output power, then worm tangential force', eq: '15-58, 15-57',
          formula: 'W^t_G = \\frac{33\\,000\\,n_d H_0 K_a}{V_G\\,e},\\qquad W^t_W = W^t_G\\,\\frac{\\cos\\phi_n\\sin\\lambda + f\\cos\\lambda}{\\cos\\phi_n\\cos\\lambda - f\\sin\\lambda}',
          text: 'Shigley (and the course, Module 2 p32) fold the design factor n<sub>d</sub> and application factor K<sub>a</sub> into the gear load and divide the output power by the efficiency. (The bible/Mott route W<sub>tG</sub> = 2T<sub>o</sub>/D with T<sub>o</sub> = 63 000 H<sub>0</sub>/n<sub>G</sub> gives the same number when n<sub>d</sub> = K<sub>a</sub> = 1 and e is not applied — shown for comparison.)',
          vars: [
            { id: 'WtG', symbol: 'W^t_G', label: 'Gear tangential force (design)', unit: 'lbf', kind: 'calc', compute: v => has(v, 'nd', 'H0', 'Ka', 'VG', 'e') ? 33000 * v.nd * v.H0 * v.Ka / (v.VG * v.e) : undefined,
              work: v => has(v, 'nd', 'H0', 'Ka', 'VG', 'e') ? '\\(W^t_G = \\frac{33\\,000(' + fmt(v.nd) + ')(' + fmt(v.H0) + ')(' + fmt(v.Ka) + ')}{' + fmt(v.VG) + '(' + fmt(v.e) + ')} = ' + fmt(33000 * v.nd * v.H0 * v.Ka / (v.VG * v.e)) + '\\) lbf' : null },
            { id: 'To', symbol: 'T_o', label: 'Nominal output torque 63 000 H0/nG', unit: 'lbf·in', kind: 'calc', compute: v => has(v, 'H0', 'nG') ? 63000 * v.H0 / v.nG : undefined },
            { id: 'WtG0', symbol: '2T_o/D', label: 'Nominal gear tangential force (bible form, no Ka, nd, e)', unit: 'lbf', kind: 'calc', compute: v => has(v, 'To', 'D') ? 2 * v.To / v.D : undefined },
            { id: 'WtW', symbol: 'W^t_W', label: 'Worm tangential force', unit: 'lbf', kind: 'calc', compute: v => has(v, 'WtG', 'phin', 'lam', 'f') ? v.WtG * (cos(r(v.phin)) * sin(r(v.lam)) + v.f * cos(r(v.lam))) / (cos(r(v.phin)) * cos(r(v.lam)) - v.f * sin(r(v.lam))) : undefined,
              work: v => has(v, 'WtG', 'phin', 'lam', 'f') ? '\\(W^t_W = ' + fmt(v.WtG) + '\\frac{\\cos ' + v.phin + '^\\circ\\sin ' + fmt(v.lam) + '^\\circ + ' + fmt(v.f, 3) + '\\cos ' + fmt(v.lam) + '^\\circ}{\\cos ' + v.phin + '^\\circ\\cos ' + fmt(v.lam) + '^\\circ - ' + fmt(v.f, 3) + '\\sin ' + fmt(v.lam) + '^\\circ} = ' + fmt(v.WtG * (cos(r(v.phin)) * sin(r(v.lam)) + v.f * cos(r(v.lam))) / (cos(r(v.phin)) * cos(r(v.lam)) - v.f * sin(r(v.lam)))) + '\\) lbf' : null },
          ] },
        { id: 'fall', title: 'All three components on worm and gear, with directions', eq: '13-42, 13-43', fig: ['f13-36'],
          formula: 'W = \\frac{W^z}{\\cos\\phi_n\\cos\\lambda - f\\sin\\lambda},\\quad W^x = W(\\cos\\phi_n\\sin\\lambda + f\\cos\\lambda),\\quad W^y = W\\sin\\phi_n,\\quad W^z = W(\\cos\\phi_n\\cos\\lambda - f\\sin\\lambda)',
          text: '<b>Directions (Fig. 13-36, right-handed axes, gear axis ∥ x, worm axis ∥ z):</b> W<sup>x</sup> is the worm\'s tangential force and the gear\'s axial (thrust) force; W<sup>y</sup> is the radial/separating force on both, pointing from the mesh toward each member\'s own axis; W<sup>z</sup> is the worm\'s axial thrust and the gear\'s tangential force. Each gear force is equal and opposite to the worm force (W<sub>Wt</sub> = −W<sub>Ga</sub>, W<sub>Wr</sub> = −W<sub>Gr</sub>, W<sub>Wa</sub> = −W<sub>Gt</sub>). To get senses, use the bolt-and-nut analogy: turn a right-hand worm clockwise (viewed from the worm\'s free end) and the gear tooth in mesh moves along −z, so the worm is pushed along +z (Ex. 13-10).',
          vars: [
            { id: 'Wn', symbol: 'W', label: 'Normal (total) tooth force', unit: 'lbf', kind: 'calc', compute: v => has(v, 'WtG', 'phin', 'lam', 'f') ? v.WtG / (cos(r(v.phin)) * cos(r(v.lam)) - v.f * sin(r(v.lam))) : undefined },
            { id: 'Wx', symbol: 'W^x', label: 'Worm tangential = gear axial', unit: 'lbf', kind: 'calc', compute: v => has(v, 'WtW') ? v.WtW : undefined },
            { id: 'Wy', symbol: 'W^y', label: 'Radial (separating) force on worm and gear', unit: 'lbf', kind: 'calc', compute: v => has(v, 'Wn', 'phin') ? v.Wn * sin(r(v.phin)) : undefined,
              work: v => has(v, 'Wn', 'phin') ? '\\(W^y = ' + fmt(v.Wn) + '\\sin ' + v.phin + '^\\circ = ' + fmt(v.Wn * sin(r(v.phin))) + '\\) lbf' : null },
            { id: 'Wz', symbol: 'W^z', label: 'Worm axial = gear tangential', unit: 'lbf', kind: 'calc', compute: v => has(v, 'WtG') ? v.WtG : undefined },
            { id: 'Wf', symbol: 'W_f', label: 'Friction force (Eq. 15-61; sign per Fig. 13-36)', unit: 'lbf', kind: 'calc', compute: v => has(v, 'f', 'WtG', 'lam', 'phin') ? v.f * v.WtG / (v.f * sin(r(v.lam)) - cos(r(v.phin)) * cos(r(v.lam))) : undefined,
              work: v => has(v, 'f', 'WtG', 'lam', 'phin') ? '\\(W_f = \\frac{' + fmt(v.f, 3) + '(' + fmt(v.WtG) + ')}{' + fmt(v.f, 3) + '\\sin ' + fmt(v.lam) + '^\\circ - \\cos ' + v.phin + '^\\circ\\cos ' + fmt(v.lam) + '^\\circ} = ' + fmt(v.f * v.WtG / (v.f * sin(r(v.lam)) - cos(r(v.phin)) * cos(r(v.lam)))) + '\\) lbf' : null },
            { id: 'TW', symbol: 'T_W', label: 'Worm (input) torque  W^t_W d/2', unit: 'lbf·in', kind: 'calc', compute: v => has(v, 'WtW', 'd') ? v.WtW * v.d / 2 : undefined },
            { id: 'TG', symbol: 'T_G', label: 'Gear (output) torque  W^t_G D/2', unit: 'lbf·in', kind: 'calc', compute: v => has(v, 'WtG', 'D') ? v.WtG * v.D / 2 : undefined },
          ] },
        { id: 'pow', title: 'Power bookkeeping', eq: '15-59, 15-60, 15-63',
          formula: 'H_W = \\frac{W^t_W V_W}{33\\,000},\\quad H_G = \\frac{W^t_G V_G}{33\\,000},\\quad H_f = \\frac{|W_f|V_s}{33\\,000}',
          vars: [
            { id: 'HW', symbol: 'H_W', label: 'Worm (input) power', unit: 'hp', kind: 'calc', compute: v => has(v, 'WtW', 'VW') ? v.WtW * v.VW / 33000 : undefined, work: v => has(v, 'WtW', 'VW') ? '\\(H_W = ' + fmt(v.WtW) + '(' + fmt(v.VW) + ')/33\\,000 = ' + fmt(v.WtW * v.VW / 33000) + '\\) hp' : null },
            { id: 'HG', symbol: 'H_G', label: 'Gear (output) power delivered', unit: 'hp', kind: 'calc', compute: v => has(v, 'WtG', 'VG') ? v.WtG * v.VG / 33000 : undefined, work: v => has(v, 'WtG', 'VG') ? '\\(H_G = ' + fmt(v.WtG) + '(' + fmt(v.VG) + ')/33\\,000 = ' + fmt(v.WtG * v.VG / 33000) + '\\) hp' : null },
            { id: 'Hf', symbol: 'H_f', label: 'Friction power', unit: 'hp', kind: 'calc', compute: v => has(v, 'Wf', 'Vs') ? Math.abs(v.Wf) * v.Vs / 33000 : undefined },
          ],
          after: v => has(v, 'HG', 'H0') ? (v.HG >= v.H0 * 0.999 ? '<span class="result-ok">H<sub>G</sub> = ' + fmt(v.HG, 3) + ' hp ≥ required ' + fmt(v.H0) + ' hp (includes K<sub>a</sub> n<sub>d</sub>) — gear power satisfactory</span>' : '<span class="result-bad">H<sub>G</sub> &lt; H<sub>0</sub></span>') : '' },
      ] },

      { title: '6 · AGMA surface durability — bible steps 16-21 (Eq. 15-28)', steps: [
        { id: 'cfac', title: 'Materials, ratio-correction and velocity factors', eq: '15-32 … 15-37', fig: ['f10-27', 'f10-28', 'f10-29'],
          formula: '\\begin{aligned} C_s &= \\begin{cases}1000 & D_m \\le D^* \\\\ k_1 - k_2\\log D_m & D_m \\gt D^*\\end{cases} \\\\ C_m &= \\begin{cases}0.02\\sqrt{-m_G^2 + 40m_G - 76} + 0.46 & 3\\lt m_G\\le 20\\\\ 0.0107\\sqrt{-m_G^2 + 56m_G + 5145} & 20\\lt m_G\\le 76\\\\ 1.1483 - 0.00658m_G & m_G\\gt 76\\end{cases} \\\\ C_v &= \\begin{cases}0.659e^{-0.0011V_s} & V_s\\lt 700\\\\ 13.31V_s^{-0.571} & 700\\le V_s\\lt 3000\\\\ 65.52V_s^{-0.774} & V_s\\ge 3000\\end{cases}\\end{aligned}',
          text: 'C<sub>s</sub>: sand-cast 1190 − 477 log D<sub>m</sub> (D<sub>m</sub> &gt; 2.5 in), chilled-cast 1412 − 456 log D<sub>m</sub> (D<sub>m</sub> &gt; 8 in), centrifugal 1251 − 180 log D<sub>m</sub> (D<sub>m</sub> &gt; 25 in), else 1000 — all for C &gt; 3 in; for C ≤ 3 in, C<sub>s</sub> = 720 + 10.37C³ (Eq. 15-32). D<sub>m</sub> ≈ D for standard addendum.',
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
          text: 'Course: the effective face width is capped at 0.67 d<sub>m</sub> (mean worm diameter ≈ d); the mesh "survives at least 25 000 h" when W<sup>t</sup><sub>G</sub> &lt; (W<sup>t</sup>)<sub>all</sub>.',
          vars: [
            { id: 'Fe', symbol: 'F_e', label: 'Effective face width', unit: 'in', kind: 'calc', compute: v => has(v, 'FG', 'd') ? Math.min(v.FG, 0.67 * v.d) : undefined,
              work: v => has(v, 'FG', 'd') ? '\\(F_e = \\min(' + fmt(v.FG) + ',\\ 0.67(' + fmt(v.d) + ') = ' + fmt(0.67 * v.d) + ') = ' + fmt(Math.min(v.FG, 0.67 * v.d)) + '\\) in' : null },
            { id: 'Wall', symbol: '(W^t)_{all}', label: 'Allowable (rated) tangential load', unit: 'lbf', kind: 'calc', compute: v => has(v, 'Cs', 'D', 'Fe', 'Cm', 'Cv') ? v.Cs * Math.pow(v.D, 0.8) * v.Fe * v.Cm * v.Cv : undefined,
              work: v => has(v, 'Cs', 'D', 'Fe', 'Cm', 'Cv') ? '\\((W^t)_{all} = ' + fmt(v.Cs) + '(' + fmt(v.D) + ')^{0.8}(' + fmt(v.Fe) + ')(' + fmt(v.Cm, 3) + ')(' + fmt(v.Cv, 3) + ') = ' + fmt(v.Cs * Math.pow(v.D, 0.8) * v.Fe * v.Cm * v.Cv) + '\\) lbf' : null },
            { id: 'Fereq', symbol: '(F_e)_{req}', label: 'Face width needed for W^t_G', unit: 'in', kind: 'calc', compute: v => has(v, 'WtG', 'Cs', 'D', 'Cm', 'Cv') ? v.WtG / (v.Cs * Math.pow(v.D, 0.8) * v.Cm * v.Cv) : undefined },
            { id: 'nwear', symbol: 'n_{wear}', label: 'Wear margin (W^t)_all / W^t_G', kind: 'calc', compute: v => has(v, 'Wall', 'WtG') ? v.Wall / v.WtG : undefined },
          ],
          after: v => has(v, 'Wall', 'WtG') ? (v.Wall >= v.WtG ? '<span class="result-ok">Pitting/wear PASS — (W<sup>t</sup>)<sub>all</sub> = ' + fmt(v.Wall) + ' lbf ≥ W<sup>t</sup><sub>G</sub> = ' + fmt(v.WtG) + ' lbf (margin ' + fmt(v.nwear, 3) + ')</span>' : '<span class="result-bad">Pitting/wear FAIL — (W<sup>t</sup>)<sub>all</sub> = ' + fmt(v.Wall) + ' lbf &lt; W<sup>t</sup><sub>G</sub> = ' + fmt(v.WtG) + ' lbf; need F<sub>e</sub> ≥ ' + fmt(v.Fereq, 3) + ' in or a harder/larger gear</span>') : '' },
        { id: 'buck', title: 'Buckingham wear load (alternative check, Sec. 15-9)', eq: '15-64', fig: ['t15-11'],
          formula: '(W^t_G)_{all} = K_w\\, d_G F_e',
          vars: [
            { id: 'Kw', symbol: 'K_w', label: 'Wear factor (Table 15-11)', kind: 'lookup', fig: 't15-11', hint: 'hardened steel / bronze: 60 (14.5°), 80 (20°), 100 (25°), 120 (30°)',
              auto: v => has(v, 'phin') ? ({ 14.5: 60, 20: 80, 25: 100, 30: 120 })[v.phin] : undefined },
            { id: 'WallB', symbol: '(W^t_G)_{all,B}', label: 'Buckingham allowable load', unit: 'lbf', kind: 'calc', compute: v => has(v, 'Kw', 'D', 'Fe') ? v.Kw * v.D * v.Fe : undefined },
          ] },
      ] },

      { title: '7 · Gear-tooth bending (Eq. 15-53) — bible steps 11-15', steps: [
        { id: 'bend', title: 'Buckingham/Lewis bending stress in the worm-gear teeth', eq: '15-53', fig: ['cbend'],
          formula: '\\sigma_a = \\frac{W^t_G}{p_n F_e\\, y},\\qquad p_n = p_x\\cos\\lambda',
          text: 'Only the gear teeth are checked (worm threads are much stronger). y = 0.100 (14.5°), <b>0.125 (20°, course)</b>, 0.150 (25°), 0.175 (30°). Course: compare σ<sub>a</sub> with the gear material fatigue strength, <b>σ<sub>all</sub> = 24 ksi for bronze gears</b> (phosphor bronze, most common; manganese bronze 17 ksi). The Mott/bible variant divides W<sub>tG</sub> by K<sub>v</sub> = 1200/(1200 + V<sub>G</sub>) first — shown as the second (more conservative) value; the course quotes both.',
          vars: [
            { id: 'y', symbol: 'y', label: 'Lewis form factor', kind: 'lookup', fig: 'cbend', auto: v => has(v, 'phin') ? ({ 14.5: 0.100, 20: 0.125, 25: 0.150, 30: 0.175 })[v.phin] : undefined, hint: 'after Eq. 15-53 / Mott Table 10-5; course: 0.125 at 20°' },
            { id: 'sig', symbol: '\\sigma_a', label: 'Gear bending stress', unit: 'psi', kind: 'calc', compute: v => has(v, 'WtG', 'pn', 'Fe', 'y') ? v.WtG / (v.pn * v.Fe * v.y) : undefined,
              work: v => has(v, 'WtG', 'pn', 'Fe', 'y') ? '\\(\\sigma_a = \\frac{' + fmt(v.WtG) + '}{' + fmt(v.pn) + '(' + fmt(v.Fe) + ')(' + fmt(v.y, 3) + ')} = ' + fmt(v.WtG / (v.pn * v.Fe * v.y), 5) + '\\) psi' : null },
            { id: 'KvM', symbol: 'K_v', label: 'Mott dynamic factor 1200/(1200 + VG)', kind: 'calc', compute: v => has(v, 'VG') ? 1200 / (1200 + v.VG) : undefined },
            { id: 'sigd', symbol: '\\sigma_d', label: 'Bending stress with dynamic load (Mott / bible form)', unit: 'psi', kind: 'calc', compute: v => has(v, 'sig', 'KvM') ? v.sig / v.KvM : undefined },
            { id: 'sall', symbol: '\\sigma_{all}', label: 'Allowable bending (fatigue) stress of gear bronze', unit: 'psi', kind: 'input', default: 24000, hint: '24 000 phosphor bronze (course default); 17 000 manganese bronze' },
            { id: 'nb', symbol: 'n_{bend}', label: 'Bending safety factor σall/σa (Eq. 15-53, course)', kind: 'calc', compute: v => has(v, 'sall', 'sig') ? v.sall / v.sig : undefined, work: v => has(v, 'sall', 'sig') ? '\\(n = ' + fmt(v.sall, 5) + '/' + fmt(v.sig, 5) + ' = ' + fmt(v.sall / v.sig, 3) + '\\)' : null },
            { id: 'nbM', symbol: 'n_{bend,Mott}', label: 'Bending safety factor with the Mott dynamic load σall/σd', kind: 'calc', compute: v => has(v, 'sall', 'sigd') ? v.sall / v.sigd : undefined },
          ],
          after: v => has(v, 'nb') ? (v.nb >= 1 ? '<span class="result-ok">Bending PASS — n = ' + fmt(v.nb, 3) + ' (σ<sub>a</sub> = ' + fmt(v.sig, 4) + ' psi ≤ ' + fmt(v.sall, 4) + ' psi; Mott form σ<sub>d</sub> = ' + fmt(v.sigd, 4) + ' psi, n = ' + fmt(v.nbM, 3) + ')</span>' : '<span class="result-bad">Bending FAIL — σ<sub>a</sub> = ' + fmt(v.sig, 4) + ' psi &gt; ' + fmt(v.sall, 4) + ' psi (n = ' + fmt(v.nb, 3) + '; Mott form ' + fmt(v.sigd, 4) + ' psi): widen the face (up to 0.67 d), coarser pitch or a larger set</span>') : '' },
      ] },

      { title: '8 · Heat dissipation (Eqs. 15-49 … 15-52)', steps: [
        { id: 'heat', title: 'Heat loss, case area and oil-sump temperature', eq: '15-49 … 15-52', fig: ['cheat'],
          formula: 'H_{loss} = 33\\,000(1-e)H_{in},\\quad \\hbar_{CR} = \\begin{cases}n_W/6494 + 0.13 & \\text{no fan}\\\\ n_W/3939 + 0.13 & \\text{fan on worm shaft}\\end{cases},\\quad t_s = t_a + \\frac{H_{loss}}{\\hbar_{CR}A},\\quad A_{min} = 43.20C^{1.7}',
          text: 'H<sub>in</sub> is the worm input power H<sub>W</sub> from section 5. A is the <b>total</b> lateral case area in in² (the course example gives 850 in² per side → 1700). Course: "better to assume no fan"; the lubricant limit is 250 °F (120 °C) — AGMA practice for mineral oil is often quoted as 200 °F.',
          vars: [
            { id: 'fan', symbol: '', label: 'Cooling', kind: 'choice', options: [{ label: 'No fan on worm shaft (course default)', value: 0 }, { label: 'Fan on worm shaft', value: 1 }], default: 0 },
            { id: 'A', symbol: 'A', label: 'Case lateral area (total)', unit: 'in²', kind: 'input', hint: 'blank → use Amin' },
            { id: 'ta', symbol: 't_a', label: 'Ambient temperature', unit: '°F', kind: 'input', default: 70 },
            { id: 'tmax', symbol: 't_{max}', label: 'Oil temperature limit', unit: '°F', kind: 'input', default: 250, hint: 'course: 250 °F (120 °C) lubricant limit; 200 °F conservative' },
            { id: 'Hloss', symbol: 'H_{loss}', label: 'Heat loss rate', unit: 'ft·lbf/min', kind: 'calc', compute: v => has(v, 'e', 'HW') ? 33000 * (1 - v.e) * v.HW : undefined,
              work: v => has(v, 'e', 'HW') ? '\\(H_{loss} = 33\\,000(1 - ' + fmt(v.e, 3) + ')(' + fmt(v.HW, 3) + ') = ' + fmt(33000 * (1 - v.e) * v.HW, 5) + '\\) ft·lbf/min' : null },
            { id: 'hcr', symbol: '\\hbar_{CR}', label: 'Combined heat-transfer coefficient', unit: 'ft·lbf/(min·in²·°F)', kind: 'calc', compute: v => has(v, 'nW', 'fan') ? v.nW / (v.fan ? 3939 : 6494) + 0.13 : undefined,
              work: v => has(v, 'nW', 'fan') ? '\\(\\hbar_{CR} = ' + fmt(v.nW) + '/' + (v.fan ? 3939 : 6494) + ' + 0.13 = ' + fmt(v.nW / (v.fan ? 3939 : 6494) + 0.13, 3) + '\\)' : null },
            { id: 'Amin', symbol: 'A_{min}', label: 'AGMA minimum lateral area', unit: 'in²', kind: 'calc', compute: v => has(v, 'C') ? 43.2 * Math.pow(v.C, 1.7) : undefined, work: v => has(v, 'C') ? '\\(A_{min} = 43.2(' + fmt(v.C) + ')^{1.7} = ' + fmt(43.2 * Math.pow(v.C, 1.7)) + '\\) in²' : null },
            { id: 'Ause', symbol: 'A_{used}', label: 'Area used in the balance', unit: 'in²', kind: 'calc', compute: v => has(v, 'A') ? v.A : (has(v, 'Amin') ? v.Amin : undefined) },
            { id: 'ts', symbol: 't_s', label: 'Oil sump temperature', unit: '°F', kind: 'calc', compute: v => has(v, 'ta', 'Hloss', 'hcr', 'Ause') ? v.ta + v.Hloss / (v.hcr * v.Ause) : undefined,
              work: v => has(v, 'ta', 'Hloss', 'hcr', 'Ause') ? '\\(t_s = ' + fmt(v.ta) + ' + \\frac{' + fmt(v.Hloss, 5) + '}{' + fmt(v.hcr, 3) + '(' + fmt(v.Ause) + ')} = ' + fmt(v.ta + v.Hloss / (v.hcr * v.Ause)) + '^\\circ\\)F' : null },
          ],
          after: v => {
            if (!has(v, 'ts')) return '';
            const lim = has(v, 'tmax') ? v.tmax : 250;
            let s = v.ts <= lim ? '<span class="result-ok">Thermal OK — t<sub>s</sub> = ' + fmt(v.ts) + ' °F ≤ ' + fmt(lim) + ' °F</span>' : '<span class="result-bad">Thermal problem — t<sub>s</sub> = ' + fmt(v.ts) + ' °F &gt; ' + fmt(lim) + ' °F: add a fan, more case area or external cooling</span>';
            if (has(v, 'A', 'Amin') && v.A < v.Amin) s += ' <span class="result-bad">(case area ' + fmt(v.A) + ' in² is below AGMA A<sub>min</sub> = ' + fmt(v.Amin) + ' in²)</span>';
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
            if (has(v, 'ts')) items.push((v.ts <= lim ? 'thermal OK' : 'thermal FAIL') + ' (t_s = ' + fmt(v.ts) + ' °F)');
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
