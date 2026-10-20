/* Straight bevel gears — Mott 6e (Sec. 8-8 geometry Table 8-8, Sec. 10-6/10-7 forces, Sec. 10-9 AGMA 2003 stresses).
 * Merged Fizz bible pp 59-68 + Mech bible pp 68-72, 98-106 procedure, in Mott notation.
 * Defaults follow the Fizz / Mech guide assumptions (TOPIC.assumptions, cited by guide page; both guides are written "using Mott"),
 *   with the UBC MECH 325 course conventions (v2/COURSE_CONVENTIONS.md §9) where the guides are silent: φ = 20°, F = roundest value in
 *   Fnom … Fmax, forces at r_m but stress with Wt = 33 000P/vt at the large end, Ko from Table 9-1 (1.00 pre-filled), Av = 10 (Table 9-5),
 *   Kmb = 1.00 (Mott: both straddle unless noted), R = 0.99 → KR = CR = 1, KL/CL commercial lines, SF = 1, grade-1 steel, Cp = 2300,
 *   Cs = 0.125F + 0.4375, Cxc = 1.5 (properly crowned — "the assumption we use").
 * J and I autos are digitised from Figs. 10-15 / 10-19 (same AGMA charts as Shigley 15-7 / 15-6; 16T/48T → JP 0.235, JG 0.186, I 0.077).
 * Verified against (Load example): Mott Ex. 8-3 + 10-4 … 10-8 (16T/48T, Pd 8, F 1.00, 2.5 hp at 600 rpm, Ko 1.5, Av 11, both
 *   straddle, 15 000 h, R 0.99, SF 1): Do 6.041, do 2.369, Wt(rm) 311.8 (book 313), Wt 262.6 (263), Ks 0.5134, Km 1.004, Kv 1.239 (1.24),
 *   JP 0.230 → st 8749 psi (book 8764 with Wt 263), KL 0.948, sat 9229 (9245) → 162 HB; Cs 0.56, Cxc 1.5, I 0.077 → sc 118 900
 *   (119 044), CL 1.038, sac 114 556 (114 686) → 267 HB → SAE 1040 WQT 1000, 269 HB. Gear (not in the book): JG 0.186 (chart) →
 *   st,G 10 820 psi → 207 HB, still below the 267 HB pitting requirement.
 *   Also checked with Gear Trains Tutorial 5 (S 15-1/15-2: uncrowned 20/60 T, Pd 6, Av 11, 300 HB, F 1.25, 900 rpm, 10^9 rev,
 *   R 0.999, Kmb 1.1, Cxc 2, Ko = SF = 1): JP 0.247 / JG 0.202 → bending 17.7 / 14.8 hp; I 0.083, CR 1.12 (Table 10-3) → wear 10.9 hp
 *   → gearset ≈ 11 hp, wear-limited (same as the Shigley sheet). */
(function () {
  const r = d => d * Math.PI / 180, fmt = (x, d) => H.fmt(x, d);
  const has = (v, ...a) => H.has(v, ...a);
  const sq = Math.sqrt;

  window.TOPIC = {
    id: 'bevel', book: 'mott',
    title: 'Straight Bevel Gears — Geometry, Forces & AGMA Stress',
    subtitle: 'Mott Ch. 8 (Table 8-8 geometry) & Ch. 10 (Secs. 10-6 … 10-9, AGMA 2003-C10) · merged Fizz + Mech guide procedure',
    sibling: 'bevel_shigley.html',
    intro: 'Straight bevel gears on 90° shafts, Mott\'s way. Enter the drive data, then: full Table 8-8 geometry (cone angles, cone distance, face width range, mean addenda/dedenda, outside diameters) → forces at the mean radius r<sub>m</sub> with directions (Fig. 10-8) → bending stress number s<sub>t</sub> (Eq. 10-14) and contact stress number s<sub>c</sub> (Eq. 10-19) → required allowable stresses s<sub>at</sub>, s<sub>ac</sub> (Eqs. 10-18, 10-22) → required Brinell hardness (Figs. 10-17, 10-21) and, if a material is given, the actual safety factors. Yellow cells are chart/table lookups with an auto-estimate (textbook equation, or the chart digitised); confirm by reading the figure. <b>Defaults follow the Fizz / Mech guide assumptions</b> listed in the panel below (both guides are written "using Mott"; course-slide values where the guides are silent): φ = 20°, SF = 1, 99 % reliability (K<sub>R</sub> = C<sub>R</sub> = 1), C<sub>p</sub> = 2300 √psi, C<sub>s</sub> = 0.125F + 0.4375, C<sub>xc</sub> = 1.5 for properly crowned teeth, grade-1 steel, K<sub>L</sub>/C<sub>L</sub> on the "commercial gears" lines of Figs. 10-16/10-20; forces at the mean radius but stresses with W<sub>t</sub> = 33 000P/v<sub>t</sub> at the large end. The last section gives the <b>power rating</b> (Tutorial 5 question). Load the example to reproduce Mott Example Problems 8-3 and 10-4 … 10-8 (16T/48T, P<sub>d</sub> = 8, 2.5 hp at 600 rpm); the Tutorial 5 case (20T/60T, P<sub>d</sub> = 6, A<sub>v</sub> = 11, 300 HB, 10<sup>9</sup> rev, R = 0.999) is in the header comment of the topic file.',
    example: { P: 2.5, nP: 600, NP: 16, NG: 48, Pd: 8, F: 1.0, phi: 20, Ko: 1.5, Av: 11, Kmb: 1.0, Cxc: 1.5, SF: 1, R: 0.99, Lh: 15000, Cp: 2300, JP: 0.230, I: 0.077, Cs: 0.56, grade: 1, HB: 269 },

    assumptions: [
      { text: 'Straight bevel teeth, 90° shafts, pressure angle φ = 20° unless given — the J and I charts (Figs. 10-15/10-19) are for 20°; Mott: "typically 20°"', src: 'Fizz p.42 · Mech p.79 (spur guide) · Fizz p.65 · Mech p.100 · Mott Sec. 8-8', var: 'phi' },
      { text: 'Face width not given → choose F in F_nom = 0.30A_o ≤ F ≤ F_max = min(A_o/3, 10/P_d) ("check both F_max equations"), "preferably a whole number": auto takes the roundest value in range (whole in, ½, ¼, ⅛), else the midpoint (Mech\'s Matlab code)', src: 'Fizz p.60 · Mech p.69', var: 'F' },
      { text: 'Shaft/bearing forces at the mean radius (W_t = T/r_m); stresses with W_t = 33 000P/v_t at the outer pitch diameter ("top one for force analysis, bottom one for design selection")', src: 'Fizz p.61 · Mech p.72 · Mech p.98' },
      { text: 'K_o from Table 9-1 for the stated shocks ("from the spur gear guide") — no default; pre-filled 1.00 (uniform/uniform), as in the course tutorials', src: 'Fizz p.62 · Mech p.98', var: 'Ko' },
      { text: 'A_v from Table 9-5 by application or pitch-line speed if not given ("just guess what looks right"): A_v = 10 pre-filled (ordinary industrial drives, v_t < 800 ft/min). Mott\'s own example uses A_v = 11', src: 'Fizz p.63 · Mech p.99', var: 'Av' },
      { text: 'K_mb = 1.00 (both gears straddle-mounted) unless the mounting is stated — the guides list 1.00 / 1.10 / 1.25 with no default; Mott: "problems in this book can assume that both gears are straddle mounted unless otherwise noted"', src: 'Fizz p.62 · Mech p.98 · Mott Sec. 10-9', var: 'Kmb' },
      { text: 'Mott\'s bevel equations have no K_x, K_B or K_T (all = 1 in the course\'s Shigley form)', src: 'course Helical/Bevel s21, s23' },
      { text: 'Safety factor SF = 1 ("usually pick 1.00", "we always just assume SF = 1"; range 1–1.5)', src: 'Fizz p.65 · Fizz p.66 · Mech p.100', var: 'SF' },
      { text: '99 % reliability → K_R = 1 and C_R = 1 (Table 10-3)', src: 'Fizz p.65 · Mech p.100', var: 'R' },
      { text: 'Life given in hours or cycles; if not given take the hours from Table 9-12 (e.g. 20 000–30 000 h general industrial; Mott Ex. 10-8 uses 15 000 h)', src: 'Fizz p.65 · Mech p.101' },
      { text: 'K_L on the line the guides print, 1.3558 N^{−0.0178} above 3×10^6 cycles (commercial drives); C_L = 3.4822 N^{−0.0602}', src: 'Fizz p.66 · Fizz p.68 · Mech p.102 · Mech p.103', var: 'KLP' },
      { text: 'Through-hardened grade 1 steel, bevel charts Figs. 10-17/10-21 (not the spur ones); material from Appendix 3', src: 'Mech p.84 · Mech p.105 · Fizz p.68', var: 'grade' },
      { text: 'C_p = 2300 √psi (steel on steel)', src: 'Fizz p.66 · Mech p.102', var: 'Cp' },
      { text: 'C_s = 0.125F + 0.4375 (Fig. 10-18: 0.50 below 0.5 in, 0.83 above 3.14 in)', src: 'Fizz p.66 · Mech p.102', var: 'Cs' },
      { text: 'C_xc = 1.5 — properly crowned teeth, "this is the assumption we use"; 2.0 only for non-crowned teeth (Tutorial 5)', src: 'Fizz p.67 · Mech p.102 · course Helical/Bevel s26', var: 'Cxc' },
      { text: 'Safety factors of a chosen steel from SF = s_at K_L/(s_t K_R) and SF = s_ac C_L/(s_c C_R) — checked for pinion and gear', src: 'Mech p.104' },
    ],

    figures: [
      { id: 'f8-22', ref: 'Figure 8-22', title: 'Types of bevel gears and key dimensions of a straight bevel pair (Ao, Am, F, mounting distances)', src: 'figures/mott/fig8-22.png', page: 344 },
      { id: 't8-8', ref: 'Table 8-8', title: 'Geometrical features of straight bevel gears (all formulas used in section 2)', src: 'figures/mott/table8-8.png', page: 345 },
      { id: 'f10-8', ref: 'Figure 10-8', title: 'Forces on bevel gears — free-body diagrams of pinion and gear', src: 'figures/mott/fig10-8.png', page: 456,
        note: 'W_t tangent to the pitch cone at mid-face; W_r toward the gear\'s own axis; W_x along the axis pushing the gear away from the apex (thrust). Pinion radial = gear axial, pinion axial = gear radial; the pairs act in opposite directions (action/reaction).' },
      { id: 't9-1', ref: 'Table 9-1', title: 'Suggested overload factors Ko', src: 'figures/mott/table9-1.png', page: 395 },
      { id: 'f10-13', ref: 'Figure 10-13', title: 'Size factor for bending Ks for bevel gears', src: 'figures/mott/fig10-13.png', page: 463, note: 'Eq. 10-15: Ks = 0.4867 + 0.2133/Pd; Ks = 0.50 for Pd ≥ 16.' },
      { id: 'f10-14', ref: 'Figure 10-14', title: 'Load-distribution factor Km for crowned bevel teeth', src: 'figures/mott/fig10-14.png', page: 464, note: 'Eq. 10-16: Km = Kmb + 0.0036 F². Kmb = 1.0 both straddle, 1.1 one straddle, 1.25 neither.' },
      { id: 't9-5', ref: 'Table 9-5', title: 'Recommended AGMA quality numbers Av', src: 'figures/mott/table9-5.png', page: 399, note: 'A-system: A11 least accurate … A4 most accurate. Also from pitch-line speed (lower table).' },
      { id: 'f9-16', ref: 'Figure 9-16', title: 'Dynamic factor Kv vs pitch-line speed (Av curves)', src: 'figures/mott/fig9-16.png', page: 400, note: 'Same chart as spur/helical gears.' },
      { id: 't9-6', ref: 'Table 9-6', title: 'Analytical method for Kv (B, C constants)', src: 'figures/mott/table9-6.png', page: 401 },
      { id: 'f10-15', ref: 'Figure 10-15', title: 'Geometry factor J for straight bevel gears, 20°, 90° shafts', src: 'figures/mott/fig10-15.png', page: 465, note: 'Ordinate = teeth on the gear you want J for, curves = teeth in its mate. Read JP (NP vs NG curve) and JG (NG vs NP curve).' },
      { id: 't10-3', ref: 'Table 10-3', title: 'Reliability factors KR (bending) and CR (contact) for bevel gears', src: 'figures/mott/table10-3.png', page: 466 },
      { id: 't9-12', ref: 'Table 9-12', title: 'Recommended design life', src: 'figures/mott/table9-12.png', page: 411 },
      { id: 'f10-16', ref: 'Figure 10-16', title: 'Bending stress-cycle factor KL (bevel — differs from spur YN)', src: 'figures/mott/fig10-16.png', page: 466, note: 'KL = 6.1514 NL^-0.1192 (1e3 … 3e6); KL = 1.3558 NL^-0.0178 above ~3e6 (commercial drives).' },
      { id: 'f10-17', ref: 'Figure 10-17', title: 'Allowable bending stress number sat vs HB (through-hardened, bevel)', src: 'figures/mott/fig10-17.png', page: 467, note: 'Grade 1: sat = 0.044 HB + 2.10 ksi → HB = (sat − 2.10)/0.044. Grade 2: sat = 0.048 HB + 5.98 ksi. NOT the spur chart (Fig. 9-18).' },
      { id: 't10-4', ref: 'Table 10-4', title: 'Allowable stress numbers for case-hardened bevel gears', src: 'figures/mott/table10-4.png', page: 466 },
      { id: 't9-7', ref: 'Table 9-7', title: 'Elastic coefficient Cp', src: 'figures/mott/table9-7.png', page: 404, note: 'Steel/steel = 2300 √psi.' },
      { id: 'f10-18', ref: 'Figure 10-18', title: 'Pitting-resistance size factor Cs vs face width', src: 'figures/mott/fig10-18.png', page: 468, note: 'Eq. 10-20: Cs = 0.125 F + 0.4375 (0.5 ≤ F ≤ 3.14 in); 0.5 below, 0.83 above.' },
      { id: 'f10-19', ref: 'Figure 10-19', title: 'Pitting geometry factor I for straight bevel gears', src: 'figures/mott/fig10-19.png', page: 468, note: 'Ordinate = pinion teeth, curves = gear teeth, read I on the abscissa.' },
      { id: 'f10-20', ref: 'Figure 10-20', title: 'Contact stress-cycle factor CL (bevel — differs from spur ZN)', src: 'figures/mott/fig10-20.png', page: 470, note: 'CL = 3.4822 NL^-0.0602 for NL ≥ 1e4; 2.0 below.' },
      { id: 'f10-21', ref: 'Figure 10-21', title: 'Allowable contact stress number sac vs HB (through-hardened, bevel)', src: 'figures/mott/fig10-21.png', page: 470, note: 'Grade 1: sac = 0.341 HB + 23.62 ksi → HB = (sac − 23.62)/0.341. Grade 2: 0.3636 HB + 29.56 ksi. NOT the spur chart (Fig. 9-19).' },
      // ---- course-only slides (Helical_Bevel_and_Plastic_Gears_with_Materials_Review_2025.pdf) ----
      { id: 'cwt', ref: 'Helical/Bevel s18', book: 'course', title: 'Bevel bending road map and Ko table, with the course note: forces at the average diameter, strength with Wt = 2T/d at the large end', src: 'figures/course/bevel_ko_wt_large_end.png', note: 'Course Ko table (Shigley Table 15-2) is "slightly higher than spur gears"; Mott Table 9-1 is accepted too. Tutorials use Ko = 1.0.' },
      { id: 'cks', ref: 'Helical/Bevel s21', book: 'course', title: 'Bevel size, load-distribution and curvature factors Ks, Km, Kx (course slide reproducing Mott Figs. 10-13/10-14)', src: 'figures/course/bevel_ks_km_kx_course.png', note: 'Ks = 0.4867 + 0.2133/Pd, Km = Kmb + 0.0036F² with Kmb = 1.00 / 1.10 / 1.25, Kx = 1.0 for straight bevel.' },
      { id: 'ckl', ref: 'Helical/Bevel s23', book: 'course', title: 'Bevel stress-cycle factor KL — "use this line for commercial gears"; KT = 1, KR = 1 at 99 %; no KB', src: 'figures/course/bevel_kl_course.png', note: 'KL = 6.1514 NL^-0.1192 up to ~3×10^6, then 1.3558 NL^-0.0178 (commercial); 1.683 NL^-0.0323 is for critical applications only.' },
      { id: 'ccs', ref: 'Helical/Bevel s26', book: 'course', title: 'Bevel pitting size factor Cs and crowning factor Cxc — "use Cxc = 1.5 for commercial gears"', src: 'figures/course/bevel_cs_cxc_course.png', note: 'Cs = 0.5 (F < 0.5 in), 0.125F + 0.4375 (0.5 ≤ F ≤ 4.5 in); the Mott chart (mm) caps at 0.83 above 80 mm. Cxc = 1.5 crowned, 2.0 uncrowned.' },
      { id: 'ccr', ref: 'Helical/Bevel s29', book: 'course', title: 'Bevel contact-stress reliability factor CR = √KR (Table 10-3 / Shigley 15-3), KT = 1 below 250 °F', src: 'figures/course/bevel_cr_course.png' },
      { id: 'gk-qv', ref: 'Gear Kinematics s42', book: 'course', title: 'AGMA quality number Q_v by accuracy level (minimal 4–5 … highest 14–15) and how it is produced', src: 'figures/course/gear_agma_quality_accuracy_levels.png', note: 'Gear_Kinematics_and_Forces_-2024.pdf slide 42. Use with the application table to pick Q_v / A_v.' },
      { id: 'm-t2-2', ref: 'Table 2-2', title: 'Hardness scales vs tensile strength (HB, HRB, HRC, ksi, MPa) with Figure 2-6 conversion chart', src: 'figures/mott/table2-2_fig2-6.png', page: 49, note: 'Helical/Bevel s38 (material review). s_u ≈ 0.50 HB ksi (Mott Eq. 2-8).' },
      { id: 'm-f9-20', ref: 'Figure 9-20', title: 'Effective case depth h_e for carburized gears vs normal diametral pitch (normal / heavy case)', src: 'figures/mott/fig9-20.png', page: 409, note: 'Helical/Bevel s57 (case hardening): case depth typically 0.010–0.040 in.' },
      { id: 'khk108', ref: 'KHK p.T108', book: 'course', title: 'KHK bending strength of plastic bevel and worm gears, sliding-speed limits for plastic worm pairs', src: 'figures/course/khk_plastic_bevel_worm_strength_t108.png', note: 'KHK Gears Technical Information.pdf p.108 (T108).' },
    ],

    sections: [
      { title: '1 · Problem data', steps: [
        { id: 'in', title: 'Drive data', fig: ['f8-22'],
          text: 'What a bevel question gives: P<sub>d</sub>, N<sub>P</sub>, N<sub>G</sub>, φ, power, pinion speed, and often the face width. If F is not given, the sheet picks the roundest value inside the Table 8-8 range F<sub>nom</sub> … F<sub>max</sub> computed in section 2 (Mech: "preferably a whole number") — type your own value to override.',
          vars: [
            { id: 'P', symbol: 'P', label: 'Transmitted power', unit: 'hp', kind: 'input' },
            { id: 'nP', symbol: 'n_P', label: 'Pinion speed', unit: 'rpm', kind: 'input' },
            { id: 'NP', symbol: 'N_P', label: 'Pinion teeth', kind: 'input', check: v => (v.NP !== undefined && v.NP < 12) ? 'Mott: minimum 12 teeth for straight bevel' : null },
            { id: 'NG', symbol: 'N_G', label: 'Gear teeth', kind: 'input' },
            { id: 'Pd', symbol: 'P_d', label: 'Diametral pitch (outer transverse)', unit: 'teeth/in', kind: 'input' },
            { id: 'F', symbol: 'F', label: 'Face width', unit: 'in', kind: 'input', hint: 'auto = roundest value in F_nom … F_max (whole in, then ½, ¼, ⅛)',
              auto: v => has(v, 'Fnom', 'Fmax') ? niceF(v.Fnom, v.Fmax) : undefined,
              check: v => has(v, 'F', 'Fnom', 'Fmax') ? (v.F > v.Fmax * 1.001 ? 'F exceeds Fmax = ' + fmt(v.Fmax, 3) + ' in' : v.F < v.Fnom * 0.999 ? 'F is below Fnom = ' + fmt(v.Fnom, 3) + ' in (allowed but not recommended)' : null) : null },
            { id: 'phi', symbol: '\\phi', label: 'Pressure angle', kind: 'choice', options: [{ label: '20° (standard)', value: 20 }, { label: '22.5°', value: 22.5 }, { label: '25°', value: 25 }], default: 20, hint: 'Figs 10-15/10-19 are for 20°' },
          ] },
      ] },

      { title: '2 · Geometry — Table 8-8 (Mech bible steps 1-10)', steps: [
        { id: 'g1', title: 'Gear ratio, pitch diameters, pitch cone angles', fig: ['t8-8'],
          formula: 'm_G = \\frac{N_G}{N_P},\\quad d = \\frac{N_P}{P_d},\\quad D = \\frac{N_G}{P_d},\\quad \\gamma = \\tan^{-1}\\frac{N_P}{N_G},\\quad \\Gamma = \\tan^{-1}\\frac{N_G}{N_P}',
          vars: [
            { id: 'mG', symbol: 'm_G', label: 'Gear ratio', kind: 'calc', compute: v => has(v, 'NP', 'NG') ? v.NG / v.NP : undefined },
            { id: 'd', symbol: 'd', label: 'Pinion pitch diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'NP', 'Pd') ? v.NP / v.Pd : undefined },
            { id: 'D', symbol: 'D', label: 'Gear pitch diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'NG', 'Pd') ? v.NG / v.Pd : undefined },
            { id: 'gam', symbol: '\\gamma', label: 'Pinion pitch cone angle', unit: '°', kind: 'calc', compute: v => has(v, 'NP', 'NG') ? H.deg(Math.atan(v.NP / v.NG)) : undefined,
              work: v => has(v, 'NP', 'NG') ? '\\(\\gamma = \\tan^{-1}(' + v.NP + '/' + v.NG + ') = ' + fmt(H.deg(Math.atan(v.NP / v.NG))) + '^\\circ,\\ \\Gamma = 90^\\circ - \\gamma = ' + fmt(90 - H.deg(Math.atan(v.NP / v.NG))) + '^\\circ\\)' : null },
            { id: 'Gam', symbol: '\\Gamma', label: 'Gear pitch cone angle', unit: '°', kind: 'calc', compute: v => has(v, 'gam') ? 90 - v.gam : undefined },
            { id: 'nG', symbol: 'n_G', label: 'Gear speed', unit: 'rpm', kind: 'calc', compute: v => has(v, 'nP', 'mG') ? v.nP / v.mG : undefined },
          ] },
        { id: 'g2', title: 'Outer cone distance and face width range', fig: ['t8-8', 'f8-22'],
          formula: 'A_o = \\frac{0.5D}{\\sin\\Gamma},\\qquad F_{nom} = 0.30A_o,\\qquad F_{max} = \\min\\left(\\frac{A_o}{3},\\ \\frac{10}{P_d}\\right),\\qquad F_{nom}\\le F\\le F_{max}',
          vars: [
            { id: 'Ao', symbol: 'A_o', label: 'Outer cone distance', unit: 'in', kind: 'calc', compute: v => has(v, 'D', 'Gam') ? 0.5 * v.D / Math.sin(r(v.Gam)) : undefined,
              work: v => has(v, 'D', 'Gam') ? '\\(A_o = 0.5(' + fmt(v.D) + ')/\\sin ' + fmt(v.Gam) + '^\\circ = ' + fmt(0.5 * v.D / Math.sin(r(v.Gam))) + '\\) in' : null },
            { id: 'Fnom', symbol: 'F_{nom}', label: 'Nominal face width', unit: 'in', kind: 'calc', digits: 3, compute: v => has(v, 'Ao') ? 0.3 * v.Ao : undefined },
            { id: 'Fmax', symbol: 'F_{max}', label: 'Maximum face width (check both!)', unit: 'in', kind: 'calc', digits: 3, compute: v => has(v, 'Ao', 'Pd') ? Math.min(v.Ao / 3, 10 / v.Pd) : undefined,
              work: v => has(v, 'Ao', 'Pd') ? '\\(F_{max} = \\min(' + fmt(v.Ao) + '/3,\\ 10/' + fmt(v.Pd) + ') = \\min(' + fmt(v.Ao / 3, 3) + ',\\ ' + fmt(10 / v.Pd, 3) + ') = ' + fmt(Math.min(v.Ao / 3, 10 / v.Pd), 3) + '\\) in' : null },
          ],
          after: v => has(v, 'Fnom', 'Fmax') ? 'Choose F in ' + fmt(v.Fnom, 3) + ' … ' + fmt(v.Fmax, 3) + ' in' + (has(v, 'F') ? (v.F >= v.Fnom * 0.999 && v.F <= v.Fmax * 1.001 ? ' — <span class="result-ok">F = ' + fmt(v.F, 3) + ' in is in range</span>' : ' — <span class="result-bad">F = ' + fmt(v.F, 3) + ' in is outside the range</span>') : '') : '' },
        { id: 'g3', title: 'Mean cone distance, mean pitch, mean working depth, clearance', fig: ['t8-8'],
          formula: 'A_m = A_o - 0.5F,\\quad p_m = \\frac{\\pi}{P_d}\\frac{A_m}{A_o},\\quad h = \\frac{2.00}{P_d}\\frac{A_m}{A_o},\\quad c = 0.125h,\\quad h_m = h + c',
          vars: [
            { id: 'Am', symbol: 'A_m', label: 'Mean cone distance', unit: 'in', kind: 'calc', compute: v => has(v, 'Ao', 'F') ? v.Ao - 0.5 * v.F : undefined },
            { id: 'ratio', symbol: 'A_m/A_o', label: 'Ratio (recurs below)', kind: 'calc', compute: v => has(v, 'Am', 'Ao') ? v.Am / v.Ao : undefined },
            { id: 'pm', symbol: 'p_m', label: 'Mean circular pitch', unit: 'in', kind: 'calc', compute: v => has(v, 'Pd', 'ratio') ? Math.PI / v.Pd * v.ratio : undefined },
            { id: 'h', symbol: 'h', label: 'Mean working depth', unit: 'in', kind: 'calc', compute: v => has(v, 'Pd', 'ratio') ? 2 / v.Pd * v.ratio : undefined },
            { id: 'c', symbol: 'c', label: 'Clearance', unit: 'in', kind: 'calc', compute: v => has(v, 'h') ? 0.125 * v.h : undefined },
            { id: 'hm', symbol: 'h_m', label: 'Mean whole depth', unit: 'in', kind: 'calc', compute: v => has(v, 'h', 'c') ? v.h + v.c : undefined },
          ] },
        { id: 'g4', title: 'Mean addendum and dedendum of gear and pinion', fig: ['t8-8'],
          formula: 'c_1 = 0.210 + \\frac{0.290}{m_G^2},\\quad a_G = c_1 h,\\quad a_P = h - a_G,\\quad b_G = h_m - a_G,\\quad b_P = h_m - a_P',
          vars: [
            { id: 'c1', symbol: 'c_1', label: 'Mean addendum factor', kind: 'calc', compute: v => has(v, 'mG') ? 0.210 + 0.290 / (v.mG * v.mG) : undefined },
            { id: 'aG', symbol: 'a_G', label: 'Gear mean addendum', unit: 'in', kind: 'calc', compute: v => has(v, 'c1', 'h') ? v.c1 * v.h : undefined },
            { id: 'aP', symbol: 'a_P', label: 'Pinion mean addendum', unit: 'in', kind: 'calc', compute: v => has(v, 'h', 'aG') ? v.h - v.aG : undefined },
            { id: 'bG', symbol: 'b_G', label: 'Gear mean dedendum', unit: 'in', kind: 'calc', compute: v => has(v, 'hm', 'aG') ? v.hm - v.aG : undefined },
            { id: 'bP', symbol: 'b_P', label: 'Pinion mean dedendum', unit: 'in', kind: 'calc', compute: v => has(v, 'hm', 'aP') ? v.hm - v.aP : undefined },
          ] },
        { id: 'g5', title: 'Dedendum angles, outer addenda, outside diameters', fig: ['t8-8'],
          formula: '\\delta_G = \\tan^{-1}\\frac{b_G}{A_m},\\ \\delta_P = \\tan^{-1}\\frac{b_P}{A_m},\\ a_{oG} = a_G + 0.5F\\tan\\delta_P,\\ a_{oP} = a_P + 0.5F\\tan\\delta_G,\\ D_o = D + 2a_{oG}\\cos\\Gamma,\\ d_o = d + 2a_{oP}\\cos\\gamma',
          vars: [
            { id: 'dG', symbol: '\\delta_G', label: 'Gear dedendum angle', unit: '°', kind: 'calc', compute: v => has(v, 'bG', 'Am') ? H.deg(Math.atan(v.bG / v.Am)) : undefined },
            { id: 'dP', symbol: '\\delta_P', label: 'Pinion dedendum angle', unit: '°', kind: 'calc', compute: v => has(v, 'bP', 'Am') ? H.deg(Math.atan(v.bP / v.Am)) : undefined },
            { id: 'aoG', symbol: 'a_{oG}', label: 'Gear outer addendum', unit: 'in', kind: 'calc', compute: v => has(v, 'aG', 'F', 'dP') ? v.aG + 0.5 * v.F * Math.tan(r(v.dP)) : undefined },
            { id: 'aoP', symbol: 'a_{oP}', label: 'Pinion outer addendum', unit: 'in', kind: 'calc', compute: v => has(v, 'aP', 'F', 'dG') ? v.aP + 0.5 * v.F * Math.tan(r(v.dG)) : undefined },
            { id: 'Do', symbol: 'D_o', label: 'Gear outside diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'D', 'aoG', 'Gam') ? v.D + 2 * v.aoG * Math.cos(r(v.Gam)) : undefined,
              work: v => has(v, 'D', 'aoG', 'Gam') ? '\\(D_o = ' + fmt(v.D) + ' + 2(' + fmt(v.aoG) + ')\\cos ' + fmt(v.Gam) + '^\\circ = ' + fmt(v.D + 2 * v.aoG * Math.cos(r(v.Gam))) + '\\) in' : null },
            { id: 'do', symbol: 'd_o', label: 'Pinion outside diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'd', 'aoP', 'gam') ? v.d + 2 * v.aoP * Math.cos(r(v.gam)) : undefined,
              work: v => has(v, 'd', 'aoP', 'gam') ? '\\(d_o = ' + fmt(v.d) + ' + 2(' + fmt(v.aoP) + ')\\cos ' + fmt(v.gam) + '^\\circ = ' + fmt(v.d + 2 * v.aoP * Math.cos(r(v.gam))) + '\\) in' : null },
          ] },
      ] },

      { title: '3 · Forces on straight bevel gears (Sec. 10-6, Eqs. 10-10 … 10-13)', text: 'For shaft and bearing analysis the forces act at the <b>mid-face</b> (mean radius r<sub>m</sub>, R<sub>m</sub>) — the course rule "forces at the average radius" (Gear Kinematics s33–34). The stress analysis in section 4 uses W<sub>t</sub> = 2T/d at the outer pitch radius instead (Helical/Bevel s18); the difference is absorbed by J and I. Both bibles note the two W<sub>t</sub> formulas differ — use r<sub>m</sub> for forces, pitch diameter for stress.', steps: [
        { id: 'fp', title: 'Pinion forces', eq: '10-10 … 10-13', fig: ['f10-8', 'cwt'],
          formula: 'T_P = \\frac{63\\,000P}{n_P},\\quad r_m = \\frac{d}{2} - \\frac{F}{2}\\sin\\gamma,\\quad W_{tP} = \\frac{T_P}{r_m},\\quad W_{rP} = W_t\\tan\\phi\\cos\\gamma,\\quad W_{xP} = W_t\\tan\\phi\\sin\\gamma',
          text: '<b>Directions:</b> W<sub>t</sub> on the driven gear is in its direction of motion at the mesh (on the driving pinion it opposes motion). W<sub>r</sub> points toward the gear\'s own axis (causes shaft bending). W<sub>x</sub> is parallel to the axis and pushes the gear <i>away from its mate / away from the cone apex</i> — a thrust load for one bearing, and it also produces a moment W<sub>x</sub>·r<sub>m</sub> on the shaft. Pinion and gear forces are action-reaction pairs: W<sub>rP</sub> = W<sub>xG</sub>, W<sub>xP</sub> = W<sub>rG</sub>.',
          vars: [
            { id: 'TP', symbol: 'T_P', label: 'Pinion torque', unit: 'lb·in', kind: 'calc', compute: v => has(v, 'P', 'nP') ? 63000 * v.P / v.nP : undefined,
              work: v => has(v, 'P', 'nP') ? '\\(T_P = 63\\,000(' + fmt(v.P) + ')/' + fmt(v.nP) + ' = ' + fmt(63000 * v.P / v.nP) + '\\) lb·in' : null },
            { id: 'rm', symbol: 'r_m', label: 'Pinion mean radius', unit: 'in', kind: 'calc', compute: v => has(v, 'd', 'F', 'gam') ? v.d / 2 - v.F / 2 * Math.sin(r(v.gam)) : undefined,
              work: v => has(v, 'd', 'F', 'gam') ? '\\(r_m = ' + fmt(v.d) + '/2 - (' + fmt(v.F) + '/2)\\sin ' + fmt(v.gam) + '^\\circ = ' + fmt(v.d / 2 - v.F / 2 * Math.sin(r(v.gam))) + '\\) in' : null },
            { id: 'WtP', symbol: 'W_{tP}', label: 'Tangential force', unit: 'lb', kind: 'calc', compute: v => has(v, 'TP', 'rm') ? v.TP / v.rm : undefined,
              work: v => has(v, 'TP', 'rm') ? '\\(W_{tP} = ' + fmt(v.TP) + '/' + fmt(v.rm) + ' = ' + fmt(v.TP / v.rm) + '\\) lb' : null },
            { id: 'WrP', symbol: 'W_{rP}', label: 'Radial force', unit: 'lb', kind: 'calc', compute: v => has(v, 'WtP', 'phi', 'gam') ? v.WtP * Math.tan(r(v.phi)) * Math.cos(r(v.gam)) : undefined,
              work: v => has(v, 'WtP', 'phi', 'gam') ? '\\(W_{rP} = ' + fmt(v.WtP) + '\\tan ' + v.phi + '^\\circ\\cos ' + fmt(v.gam) + '^\\circ = ' + fmt(v.WtP * Math.tan(r(v.phi)) * Math.cos(r(v.gam))) + '\\) lb' : null },
            { id: 'WxP', symbol: 'W_{xP}', label: 'Axial (thrust) force', unit: 'lb', kind: 'calc', compute: v => has(v, 'WtP', 'phi', 'gam') ? v.WtP * Math.tan(r(v.phi)) * Math.sin(r(v.gam)) : undefined,
              work: v => has(v, 'WtP', 'phi', 'gam') ? '\\(W_{xP} = ' + fmt(v.WtP) + '\\tan ' + v.phi + '^\\circ\\sin ' + fmt(v.gam) + '^\\circ = ' + fmt(v.WtP * Math.tan(r(v.phi)) * Math.sin(r(v.gam))) + '\\) lb' : null },
          ] },
        { id: 'fg', title: 'Gear forces', fig: ['f10-8'],
          formula: 'T_G = \\frac{63\\,000P}{n_G},\\quad R_m = \\frac{D}{2} - \\frac{F}{2}\\sin\\Gamma,\\quad W_{tG} = \\frac{T_G}{R_m},\\quad W_{rG} = W_t\\tan\\phi\\cos\\Gamma,\\quad W_{xG} = W_t\\tan\\phi\\sin\\Gamma',
          vars: [
            { id: 'TG', symbol: 'T_G', label: 'Gear torque', unit: 'lb·in', kind: 'calc', compute: v => has(v, 'P', 'nG') ? 63000 * v.P / v.nG : undefined },
            { id: 'Rm', symbol: 'R_m', label: 'Gear mean radius', unit: 'in', kind: 'calc', compute: v => has(v, 'D', 'F', 'Gam') ? v.D / 2 - v.F / 2 * Math.sin(r(v.Gam)) : undefined },
            { id: 'WtG', symbol: 'W_{tG}', label: 'Tangential force (= W_tP)', unit: 'lb', kind: 'calc', compute: v => has(v, 'TG', 'Rm') ? v.TG / v.Rm : undefined },
            { id: 'WrG', symbol: 'W_{rG}', label: 'Radial force (= W_xP)', unit: 'lb', kind: 'calc', compute: v => has(v, 'WtG', 'phi', 'Gam') ? v.WtG * Math.tan(r(v.phi)) * Math.cos(r(v.Gam)) : undefined },
            { id: 'WxG', symbol: 'W_{xG}', label: 'Axial force (= W_rP)', unit: 'lb', kind: 'calc', compute: v => has(v, 'WtG', 'phi', 'Gam') ? v.WtG * Math.tan(r(v.phi)) * Math.sin(r(v.Gam)) : undefined },
          ],
          after: v => has(v, 'WtG') ? '<span class="muted">Bearing reactions (Sec. 10-7): treat the x-z and x-y planes separately; W<sub>x</sub> gives a concentrated moment W<sub>x</sub>·r<sub>m</sub> and is carried by the thrust bearing only (Mott Ex. 10-5).</span>' : '' },
      ] },

      { title: '4 · Bending stress number s_t (Sec. 10-9, Eq. 10-14) — Mech bible steps 1-10', steps: [
        { id: 's1', title: 'Transmitted load and pitch-line speed (at the outer pitch diameter)', fig: ['t9-1', 'cwt'],
          formula: 'v_t = \\frac{\\pi d\\, n_P}{12},\\qquad W_t = \\frac{33\\,000P}{v_t} = \\frac{T_P}{d/2}',
          text: 'Course convention (Helical/Bevel s18): the AGMA stress numbers use W<sub>t</sub> = 2T/d at the <b>large end</b>, not the mid-face force of section 3. K<sub>o</sub>: Mott Table 9-1 or the course/Shigley bevel table (slightly higher); tutorials use 1.0.',
          vars: [
            { id: 'vt', symbol: 'v_t', label: 'Pitch-line speed', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'd', 'nP') ? Math.PI * v.d * v.nP / 12 : undefined,
              work: v => has(v, 'd', 'nP') ? '\\(v_t = \\pi(' + fmt(v.d) + ')(' + fmt(v.nP) + ')/12 = ' + fmt(Math.PI * v.d * v.nP / 12) + '\\) ft/min' : null },
            { id: 'Wt', symbol: 'W_t', label: 'Transmitted load for stress', unit: 'lb', kind: 'calc', compute: v => has(v, 'P', 'vt') ? 33000 * v.P / v.vt : undefined,
              work: v => has(v, 'P', 'vt') ? '\\(W_t = 33\\,000(' + fmt(v.P) + ')/' + fmt(v.vt) + ' = ' + fmt(33000 * v.P / v.vt) + '\\) lb' : null },
            { id: 'Ko', symbol: 'K_o', label: 'Overload factor', kind: 'lookup', fig: 't9-1', default: 1.0, hint: 'Table 9-1 or course bevel table; tutorials use 1.0' },
          ] },
        { id: 's2', title: 'Size and load-distribution factors (bevel-specific)', eq: '10-15, 10-16', fig: ['f10-13', 'f10-14', 'cks'],
          formula: 'K_s = \\begin{cases}0.4867 + 0.2133/P_d & P_d \\lt  16\\\\ 0.50 & P_d \\ge 16\\end{cases}\\qquad K_m = K_{mb} + 0.0036F^2\\qquad (K_x = 1,\\ K_B = 1)',
          text: 'Course (Helical/Bevel s21): K<sub>s</sub> is a formula, K<sub>m</sub> depends only on face width and mounting; K<sub>x</sub> = 1 for straight bevel and there is no rim-thickness factor. Tutorial 5: pinion outboard (cantilevered) + gear straddle → one member straddle-mounted, K<sub>mb</sub> = 1.10.',
          vars: [
            { id: 'Ks', symbol: 'K_s', label: 'Size factor', kind: 'calc', compute: v => has(v, 'Pd') ? (v.Pd >= 16 ? 0.5 : 0.4867 + 0.2133 / v.Pd) : undefined,
              work: v => has(v, 'Pd') ? (v.Pd >= 16 ? '\\(K_s = 0.50\\) (P_d ≥ 16)' : '\\(K_s = 0.4867 + 0.2133/' + fmt(v.Pd) + ' = ' + fmt(0.4867 + 0.2133 / v.Pd) + '\\)') : null },
            { id: 'Kmb', symbol: 'K_{mb}', label: 'Mounting factor', kind: 'choice', options: [{ label: '1.00 — both gears straddle mounted (book default)', value: 1.0 }, { label: '1.10 — one gear straddle mounted', value: 1.1 }, { label: '1.25 — neither straddle mounted', value: 1.25 }], default: 1.0 },
            { id: 'Km', symbol: 'K_m', label: 'Load-distribution factor', kind: 'calc', compute: v => has(v, 'Kmb', 'F') ? v.Kmb + 0.0036 * v.F * v.F : undefined,
              work: v => has(v, 'Kmb', 'F') ? '\\(K_m = ' + fmt(v.Kmb) + ' + 0.0036(' + fmt(v.F) + ')^2 = ' + fmt(v.Kmb + 0.0036 * v.F * v.F) + '\\)' : null },
          ] },
        { id: 's3', title: 'Quality number and dynamic factor', fig: ['t9-5', 'f9-16', 't9-6', 'gk-qv'],
          formula: 'B = 0.25(A_v - 5.0)^{0.667},\\quad C = 50 + 56(1.0 - B),\\quad K_v = \\left[\\frac{C}{C + \\sqrt{v_t}}\\right]^{-B}',
          text: 'Use A<sub>v</sub> if given (Mech); otherwise pick from Table 9-5 by application or pitch-line speed (Fizz: "just guess what looks right") — A10 for ordinary industrial drives and speeds below 800 ft/min (pre-filled), A8 for 800–2000 ft/min, A6 for 2000–4000 ft/min. Mott\'s example uses A11 ("general commercial processing").',
          vars: [
            { id: 'Av', symbol: 'A_v', label: 'AGMA quality number (Shigley Q_v in brackets)', kind: 'choice', fig: 't9-5', options: [6, 7, 8, 9, 10, 11, 12].map(q => ({ label: 'A_v = ' + q + '  (Q_v = ' + (17 - q) + ')', value: q })), default: 10, hint: 'Table 9-5; A_v = 17 − Q_v (Tutorial 5: Q_v 6 → A_v 11)',
              check: v => (has(v, 'vt', 'Av') && v.Av > avSpeed(v.vt)) ? 'Table 9-5 speed rows suggest A_v ≤ ' + avSpeed(v.vt) + ' at v_t = ' + fmt(v.vt) + ' ft/min' : null },
            { id: 'Kv', symbol: 'K_v', label: 'Dynamic factor', kind: 'lookup', fig: 'f9-16', hint: 'auto = Table 9-6 equations; confirm on Fig. 9-16',
              auto: v => has(v, 'Av', 'vt') ? kvFit(v.Av, v.vt) : undefined,
              work: v => has(v, 'Av', 'vt') ? (function () { const B = 0.25 * Math.pow(v.Av - 5, 0.667), C = 50 + 56 * (1 - B); return '\\(B = ' + fmt(B, 3) + ',\\ C = ' + fmt(C) + ',\\ K_v = [' + fmt(C) + '/(' + fmt(C) + ' + \\sqrt{' + fmt(v.vt) + '})]^{-' + fmt(B, 3) + '} = ' + fmt(kvFit(v.Av, v.vt)) + '\\)'; })() : null },
            { id: 'vtmax', symbol: 'v_{t,max}', label: 'Max speed for this Av (Table 9-6)', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'Av') ? Math.pow(50 + 56 * (1 - 0.25 * Math.pow(v.Av - 5, 0.667)) + (14 - v.Av), 2) : undefined,
              check: v => (has(v, 'vt', 'vtmax') && v.vt > v.vtmax) ? 'vt > vt,max — a more accurate quality (lower Av) is needed' : null },
          ] },
        { id: 's4', title: 'Geometry factor J (the "mutant octopus" graph) and bending stress', eq: '10-14', fig: ['f10-15'],
          formula: 's_t = \\frac{W_t P_d K_o K_s K_m K_v}{F\\,J}',
          text: 'Read J<sub>P</sub> with ordinate N<sub>P</sub> on the N<sub>G</sub> curve and J<sub>G</sub> with ordinate N<sub>G</sub> on the N<sub>P</sub> curve (Mott Ex. 10-6: 16T pinion with 48T gear → J<sub>P</sub> = 0.230). For a reduction J<sub>G</sub> &lt; J<sub>P</sub> (the pinion has the long addendum), so check the <b>gear</b> too — it can govern bending. Auto values interpolate a digitised copy of the chart (±0.005) — confirm on the figure.',
          vars: [
            { id: 'JP', symbol: 'J_P', label: 'Pinion geometry factor', kind: 'lookup', fig: 'f10-15', auto: v => has(v, 'NP', 'NG') ? jChart(v.NP, v.NG) : undefined, hint: 'ordinate N_P, curve N_G' },
            { id: 'JG', symbol: 'J_G', label: 'Gear geometry factor', kind: 'lookup', fig: 'f10-15', auto: v => has(v, 'NP', 'NG') ? jChart(v.NG, v.NP) : undefined, hint: 'ordinate N_G, curve N_P' },
            { id: 'stP', symbol: 's_{tP}', label: 'Pinion bending stress number', unit: 'psi', kind: 'calc', compute: v => has(v, 'Wt', 'Pd', 'Ko', 'Ks', 'Km', 'Kv', 'F', 'JP') ? v.Wt * v.Pd * v.Ko * v.Ks * v.Km * v.Kv / (v.F * v.JP) : undefined,
              work: v => has(v, 'Wt', 'Pd', 'Ko', 'Ks', 'Km', 'Kv', 'F', 'JP') ? '\\(s_{tP} = \\frac{(' + fmt(v.Wt) + ')(' + fmt(v.Pd) + ')(' + fmt(v.Ko) + ')(' + fmt(v.Ks) + ')(' + fmt(v.Km) + ')(' + fmt(v.Kv) + ')}{(' + fmt(v.F) + ')(' + fmt(v.JP) + ')} = ' + fmt(v.Wt * v.Pd * v.Ko * v.Ks * v.Km * v.Kv / (v.F * v.JP), 5) + '\\) psi' : null },
            { id: 'stG', symbol: 's_{tG}', label: 'Gear bending stress number', unit: 'psi', kind: 'calc', compute: v => has(v, 'Wt', 'Pd', 'Ko', 'Ks', 'Km', 'Kv', 'F', 'JG') ? v.Wt * v.Pd * v.Ko * v.Ks * v.Km * v.Kv / (v.F * v.JG) : undefined },
          ] },
      ] },

      { title: '5 · Required bending strength s_at (Eq. 10-18) — steps 11-16', steps: [
        { id: 'b1', title: 'Service factor, reliability, life and stress-cycle factor', fig: ['t10-3', 'ccr', 't9-12', 'f10-16', 'ckl'],
          formula: 'N_{LP} = 60\\,L_h\\,n_P,\\quad N_{LG} = N_{LP}/m_G,\\qquad K_L = \\begin{cases}6.1514N_L^{-0.1192} & 10^3 \\le N_L \\lt  3\\times10^6\\\\ 1.3558N_L^{-0.0178} & N_L \\ge 3\\times10^6\\end{cases}',
          text: 'Guides: SF between 1.00 and 1.50, "usually pick 1.00"; assume 99 % reliability → K<sub>R</sub> = C<sub>R</sub> = 1 (Table 10-3); life in hours from the question or Table 9-12 (or directly in pinion revolutions — Tutorial 5: 10<sup>9</sup>); K<sub>L</sub> from the "commercial gears" line of Fig. 10-16.',
          vars: [
            { id: 'SF', symbol: 'SF', label: 'Service (safety) factor', kind: 'input', default: 1, hint: 'guides: "usually pick 1.00" (range 1.00–1.50)' },
            { id: 'R', symbol: 'R', label: 'Reliability', kind: 'choice', options: [{ label: '0.90', value: 0.9 }, { label: '0.99 (usual)', value: 0.99 }, { label: '0.999', value: 0.999 }, { label: '0.9999', value: 0.9999 }], default: 0.99 },
            { id: 'KR', symbol: 'K_R', label: 'Reliability factor, bending', kind: 'lookup', fig: 't10-3', auto: v => has(v, 'R') ? ({ 0.9: 0.85, 0.99: 1.0, 0.999: 1.25, 0.9999: 1.5 })[v.R] : undefined },
            { id: 'CR', symbol: 'C_R', label: 'Reliability factor, contact', kind: 'lookup', fig: 't10-3', auto: v => has(v, 'R') ? ({ 0.9: 0.92, 0.99: 1.0, 0.999: 1.12, 0.9999: 1.22 })[v.R] : undefined },
            { id: 'NLin', symbol: 'N_{L,given}', label: 'Pinion life in revolutions (if given directly)', kind: 'input', hint: 'e.g. 1e9 (Tutorial 5); blank → use hours' },
            { id: 'Lh', symbol: 'L_h', label: 'Design life in hours (if given instead)', unit: 'h', kind: 'lookup', fig: 't9-12', hint: 'given, or Table 9-12 (e.g. 15 000 h general industrial)' },
            { id: 'NLP', symbol: 'N_{LP}', label: 'Pinion load cycles', kind: 'calc', compute: v => has(v, 'NLin') ? v.NLin : (has(v, 'Lh', 'nP') ? 60 * v.Lh * v.nP : undefined), work: v => !has(v, 'NLin') && has(v, 'Lh', 'nP') ? '\\(N_{LP} = 60(' + fmt(v.Lh) + ')(' + fmt(v.nP) + ') = ' + fmt(60 * v.Lh * v.nP, 3) + '\\)' : null },
            { id: 'NLG', symbol: 'N_{LG}', label: 'Gear load cycles  N_LP / m_G', kind: 'calc', compute: v => has(v, 'NLP', 'mG') ? v.NLP / v.mG : undefined },
            { id: 'KLP', symbol: 'K_{LP}', label: 'Stress-cycle factor (bending), pinion', kind: 'lookup', fig: 'f10-16', auto: v => has(v, 'NLP') ? KLfit(v.NLP) : undefined, hint: 'auto = Fig. 10-16 equation',
              work: v => has(v, 'NLP') ? '\\(K_{LP} = ' + (v.NLP >= 3e6 ? '1.3558' : '6.1514') + '(' + fmt(v.NLP, 3) + ')^{' + (v.NLP >= 3e6 ? '-0.0178' : '-0.1192') + '} = ' + fmt(KLfit(v.NLP)) + '\\)' : null },
            { id: 'KLG', symbol: 'K_{LG}', label: 'Stress-cycle factor (bending), gear', kind: 'lookup', fig: 'f10-16', auto: v => has(v, 'NLG') ? KLfit(v.NLG) : undefined },
          ] },
        { id: 'b2', title: 'Required allowable bending stress number', eq: '10-18', fig: ['f10-17', 't10-4'],
          formula: 's_{at} = \\frac{s_t\\,(SF)\\,K_R}{K_L}\\qquad\\Rightarrow\\qquad HB_{req} = \\frac{s_{at}[\\text{ksi}] - 2.10}{0.044}\\ (\\text{grade 1})',
          vars: [
            { id: 'satP', symbol: 's_{at,P}', label: 'Required sat, pinion', unit: 'psi', kind: 'calc', compute: v => has(v, 'stP', 'SF', 'KR', 'KLP') ? v.stP * v.SF * v.KR / v.KLP : undefined,
              work: v => has(v, 'stP', 'SF', 'KR', 'KLP') ? '\\(s_{at,P} = \\frac{' + fmt(v.stP, 5) + '(' + fmt(v.SF) + ')(' + fmt(v.KR) + ')}{' + fmt(v.KLP) + '} = ' + fmt(v.stP * v.SF * v.KR / v.KLP, 5) + '\\) psi = ' + fmt(v.stP * v.SF * v.KR / v.KLP / 1000) + ' ksi' : null },
            { id: 'satG', symbol: 's_{at,G}', label: 'Required sat, gear', unit: 'psi', kind: 'calc', compute: v => has(v, 'stG', 'SF', 'KR', 'KLG') ? v.stG * v.SF * v.KR / v.KLG : undefined },
            { id: 'grade', symbol: '', label: 'Steel grade for Figs 10-17 / 10-21', kind: 'choice', options: [{ label: 'Grade 1 (usual)', value: 1 }, { label: 'Grade 2', value: 2 }], default: 1 },
            { id: 'HBbP', symbol: 'HB_{bend,P}', label: 'Required hardness for bending, pinion', unit: 'HB', kind: 'lookup', fig: 'f10-17', digits: 3, auto: v => has(v, 'satP', 'grade') ? hbBend(v.satP, v.grade) : undefined, hint: 'auto = Fig. 10-17 equation' },
            { id: 'HBbG', symbol: 'HB_{bend,G}', label: 'Required hardness for bending, gear', unit: 'HB', kind: 'lookup', fig: 'f10-17', digits: 3, auto: v => has(v, 'satG', 'grade') ? hbBend(v.satG, v.grade) : undefined },
          ] },
      ] },

      { title: '6 · Contact stress number s_c (Eq. 10-19) and required s_ac (Eq. 10-22) — steps 17-25', steps: [
        { id: 'c1', title: 'Pitting factors Cp, Cs, Cxc, I', eq: '10-20', fig: ['t9-7', 'f10-18', 'ccs', 'f10-19'],
          formula: 'C_s = 0.125F + 0.4375\\ (0.5\\le F\\le 3.14\\text{ in}),\\qquad C_{xc} = 1.5\\ (\\text{crowned}),\\ 2.0\\ (\\text{uncrowned})',
          text: 'Guides: C<sub>p</sub> = 2300 √psi for steel, C<sub>s</sub> = 0.125F + 0.4375, and C<sub>xc</sub> = 1.5 for properly crowned teeth — "this is the assumption we use" (course s26: "1.5 for commercial gears"). Use 2.0 only when the problem says <i>uncrowned</i> (Tutorial 5).',
          vars: [
            { id: 'Cp', symbol: 'C_p', label: 'Elastic coefficient', unit: '√psi', kind: 'lookup', fig: 't9-7', default: 2300, hint: '2300 steel/steel (guides)' },
            { id: 'Cs', symbol: 'C_s', label: 'Pitting size factor', kind: 'lookup', fig: 'f10-18', auto: v => has(v, 'F') ? csMott(v.F) : undefined, hint: 'auto = Eq. 10-20 (Mott Ex. 10-7 reads 0.56 for F = 1.00)',
              work: v => has(v, 'F') ? (v.F <= 0.5 ? '\\(C_s = 0.50\\) (F ≤ 0.5 in)' : v.F >= 3.14 ? '\\(C_s = 0.83\\) (F ≥ 3.14 in)' : '\\(C_s = 0.125(' + fmt(v.F) + ') + 0.4375 = ' + fmt(csMott(v.F)) + '\\)') : null },
            { id: 'Cxc', symbol: 'C_{xc}', label: 'Crowning factor', kind: 'choice', options: [{ label: '1.5 — properly crowned (the guides\' assumption)', value: 1.5 }, { label: '2.0 — non-crowned (only if the problem says so)', value: 2.0 }], default: 1.5 },
            { id: 'I', symbol: 'I', label: 'Pitting geometry factor', kind: 'lookup', fig: 'f10-19', auto: v => has(v, 'NP', 'NG') ? iChart(v.NP, v.NG) : undefined, hint: 'ordinate N_P, curve N_G (auto = digitised chart; 16T/48T → 0.077)' },
          ] },
        { id: 'c2', title: 'Contact stress number', eq: '10-19',
          formula: 's_c = C_p\\sqrt{\\frac{W_t K_o K_m K_v C_s C_{xc}}{F\\,D_P\\,I}}',
          text: 'Use the <b>pinion</b> pitch diameter D<sub>P</sub> = d. One value serves both gears.',
          vars: [
            { id: 'sc', symbol: 's_c', label: 'Contact stress number', unit: 'psi', kind: 'calc', compute: v => has(v, 'Cp', 'Wt', 'Ko', 'Km', 'Kv', 'Cs', 'Cxc', 'F', 'd', 'I') ? v.Cp * sq(v.Wt * v.Ko * v.Km * v.Kv * v.Cs * v.Cxc / (v.F * v.d * v.I)) : undefined,
              work: v => has(v, 'Cp', 'Wt', 'Ko', 'Km', 'Kv', 'Cs', 'Cxc', 'F', 'd', 'I') ? '\\(s_c = ' + fmt(v.Cp) + '\\sqrt{\\frac{(' + fmt(v.Wt) + ')(' + fmt(v.Ko) + ')(' + fmt(v.Km) + ')(' + fmt(v.Kv) + ')(' + fmt(v.Cs) + ')(' + fmt(v.Cxc) + ')}{(' + fmt(v.F) + ')(' + fmt(v.d) + ')(' + fmt(v.I) + ')}} = ' + fmt(v.Cp * sq(v.Wt * v.Ko * v.Km * v.Kv * v.Cs * v.Cxc / (v.F * v.d * v.I)), 6) + '\\) psi' : null },
          ] },
        { id: 'c3', title: 'Stress-cycle factor CL and required allowable contact stress', eq: '10-22', fig: ['f10-20', 'f10-21', 't10-4'],
          formula: 'C_L = 3.4822N_L^{-0.0602}\\ (N_L \\ge 10^4),\\qquad s_{ac} = \\frac{s_c\\,(SF)\\,C_R}{C_L}\\qquad\\Rightarrow\\qquad HB_{req} = \\frac{s_{ac}[\\text{ksi}] - 23.62}{0.341}\\ (\\text{grade 1})',
          vars: [
            { id: 'CL', symbol: 'C_L', label: 'Stress-cycle factor (contact), pinion cycles', kind: 'lookup', fig: 'f10-20', auto: v => has(v, 'NLP') ? (v.NLP < 1e4 ? 2 : 3.4822 * Math.pow(v.NLP, -0.0602)) : undefined, hint: 'auto = Fig. 10-20 equation',
              work: v => has(v, 'NLP') ? '\\(C_L = 3.4822(' + fmt(v.NLP, 3) + ')^{-0.0602} = ' + fmt(3.4822 * Math.pow(v.NLP, -0.0602)) + '\\)' : null },
            { id: 'sac', symbol: 's_{ac}', label: 'Required allowable contact stress number', unit: 'psi', kind: 'calc', compute: v => has(v, 'sc', 'SF', 'CR', 'CL') ? v.sc * v.SF * v.CR / v.CL : undefined,
              work: v => has(v, 'sc', 'SF', 'CR', 'CL') ? '\\(s_{ac} = \\frac{' + fmt(v.sc, 6) + '(' + fmt(v.SF) + ')(' + fmt(v.CR) + ')}{' + fmt(v.CL) + '} = ' + fmt(v.sc * v.SF * v.CR / v.CL, 6) + '\\) psi = ' + fmt(v.sc * v.SF * v.CR / v.CL / 1000) + ' ksi' : null },
            { id: 'HBc', symbol: 'HB_{contact}', label: 'Required hardness for pitting', unit: 'HB', kind: 'lookup', fig: 'f10-21', digits: 3, auto: v => has(v, 'sac', 'grade') ? hbWear(v.sac, v.grade) : undefined, hint: 'auto = Fig. 10-21 equation',
              work: v => has(v, 'sac', 'grade') ? '\\(HB = (' + fmt(v.sac / 1000) + ' - ' + (v.grade === 2 ? '29.56)/0.3636' : '23.62)/0.341') + ' = ' + fmt(hbWear(v.sac, v.grade), 3) + '\\)' : null },
          ] },
      ] },

      { title: '7 · Material selection and safety factors (Mech bible step 24-26)', steps: [
        { id: 'res', title: 'Specify material, then verify SF', fig: ['f10-17', 'f10-21', 't10-4', 'm-t2-2', 'm-f9-20', 'khk108'],
          formula: 'SF_{bending} = \\frac{s_{at,actual}K_L}{s_t K_R},\\qquad SF_{contact} = \\frac{s_{ac,actual}C_L}{s_c C_R}',
          text: 'The governing requirement is the largest HB. Pick a through-hardened steel from Mott App. 3 / Fig. A4-1 with at least that hardness (Mott Ex. 10-8: 267 HB → SAE 1040 WQT 1000, 269 HB). Above 400 HB specify flame/induction or carburized case hardening (Table 10-4). Enter the chosen hardness to get the actual safety factors; note the bevel SF formula differs from the spur one.',
          vars: [
            { id: 'HBreq', symbol: 'HB_{req}', label: 'Governing required hardness', unit: 'HB', kind: 'calc', digits: 3, compute: v => has(v, 'HBbP', 'HBbG', 'HBc') ? Math.max(v.HBbP, v.HBbG, v.HBc) : undefined },
            { id: 'HB', symbol: 'HB', label: 'Hardness of selected steel (both gears)', unit: 'HB', kind: 'input', hint: 'blank = not yet chosen' },
            { id: 'satAct', symbol: 's_{at,actual}', label: 'Actual allowable bending stress (Fig. 10-17)', unit: 'psi', kind: 'lookup', fig: 'f10-17', auto: v => has(v, 'HB', 'grade') ? (v.grade === 2 ? 48 * v.HB + 5980 : 44 * v.HB + 2100) : undefined },
            { id: 'sacAct', symbol: 's_{ac,actual}', label: 'Actual allowable contact stress (Fig. 10-21)', unit: 'psi', kind: 'lookup', fig: 'f10-21', auto: v => has(v, 'HB', 'grade') ? (v.grade === 2 ? 363.6 * v.HB + 29560 : 341 * v.HB + 23620) : undefined },
            { id: 'SFbP', symbol: 'SF_{bend,P}', label: 'Bending safety factor, pinion', kind: 'calc', compute: v => has(v, 'satAct', 'KLP', 'stP', 'KR') ? v.satAct * v.KLP / (v.stP * v.KR) : undefined,
              work: v => has(v, 'satAct', 'KLP', 'stP', 'KR') ? '\\(SF_{bend,P} = \\frac{' + fmt(v.satAct, 5) + '(' + fmt(v.KLP) + ')}{' + fmt(v.stP, 5) + '(' + fmt(v.KR) + ')} = ' + fmt(v.satAct * v.KLP / (v.stP * v.KR), 3) + '\\)' : null },
            { id: 'SFbG', symbol: 'SF_{bend,G}', label: 'Bending safety factor, gear', kind: 'calc', compute: v => has(v, 'satAct', 'KLG', 'stG', 'KR') ? v.satAct * v.KLG / (v.stG * v.KR) : undefined,
              work: v => has(v, 'satAct', 'KLG', 'stG', 'KR') ? '\\(SF_{bend,G} = \\frac{' + fmt(v.satAct, 5) + '(' + fmt(v.KLG) + ')}{' + fmt(v.stG, 5) + '(' + fmt(v.KR) + ')} = ' + fmt(v.satAct * v.KLG / (v.stG * v.KR), 3) + '\\)' : null },
            { id: 'SFc', symbol: 'SF_{contact}', label: 'Contact safety factor', kind: 'calc', compute: v => has(v, 'sacAct', 'CL', 'sc', 'CR') ? v.sacAct * v.CL / (v.sc * v.CR) : undefined,
              work: v => has(v, 'sacAct', 'CL', 'sc', 'CR') ? '\\(SF_{contact} = \\frac{' + fmt(v.sacAct, 6) + '(' + fmt(v.CL) + ')}{' + fmt(v.sc, 6) + '(' + fmt(v.CR) + ')} = ' + fmt(v.sacAct * v.CL / (v.sc * v.CR), 3) + '\\)' : null },
          ],
          after: v => {
            if (!has(v, 'HBreq')) return '';
            const gov = v.HBc >= Math.max(v.HBbP, v.HBbG) ? 'pitting resistance' : 'bending';
            let s = '<b>Required: grade ' + v.grade + ' through-hardened steel ≥ ' + fmt(Math.ceil(v.HBreq), 3) + ' HB</b> (bending needs ' + fmt(Math.max(v.HBbP, v.HBbG), 3) + ' HB, pitting needs ' + fmt(v.HBc, 3) + ' HB — ' + gov + ' governs).';
            if (v.HBreq > 400) s += ' <span class="result-bad">Above 400 HB: use case-hardened steel (Table 10-4) or a larger gearset.</span>';
            if (has(v, 'SFbP', 'SFbG', 'SFc', 'SF')) {
              const sfb = Math.min(v.SFbP, v.SFbG), mat = has(v, 'HB') ? v.HB + ' HB' : 'the s<sub>at</sub>, s<sub>ac</sub> entered';
              const ok = sfb >= v.SF * 0.999 && v.SFc >= v.SF * 0.999;
              s += ok ? ' <span class="result-ok">Selected ' + mat + ': PASS — SF<sub>bend</sub> = ' + fmt(sfb, 3) + ' (' + (v.SFbG < v.SFbP ? 'gear' : 'pinion') + '), SF<sub>contact</sub> = ' + fmt(v.SFc, 3) + ' ≥ ' + fmt(v.SF) + '</span>'
                : ' <span class="result-bad">Selected ' + mat + ': FAIL — SF<sub>bend</sub> = ' + fmt(sfb, 3) + ' (' + (v.SFbG < v.SFbP ? 'gear' : 'pinion') + '), SF<sub>contact</sub> = ' + fmt(v.SFc, 3) + ' (need ≥ ' + fmt(v.SF) + ')</span>';
            }
            return s;
          } },
      ] },

      { title: '8 · Power rating of the gearset (Tutorial 5 question) — s_t = s_wt, s_c = s_wc', text: 'For the <i>selected</i> hardness HB (section 7) and SF = 1, solve Eqs. 10-14 and 10-19 for the load the teeth can carry and convert to power with v<sub>t</sub>. Independent of the P typed in section 1. Course order: bending rating of pinion and gear, then wear rating, then the overall (smallest).', steps: [
        { id: 'rate', title: 'Allowable Wt and power in bending (pinion, gear) and in pitting', eq: '10-14, 10-19',
          formula: 'W_{t,bend} = \\frac{s_{at,actual}K_L}{(SF)K_R}\\cdot\\frac{F\\,J}{P_d K_o K_s K_m K_v},\\qquad W_{t,wear} = \\left(\\frac{s_{ac,actual}C_L}{(SF)\\,C_R\\,C_p}\\right)^2\\frac{F\\,d\\,I}{K_o K_m K_v C_s C_{xc}},\\qquad P = \\frac{W_t v_t}{33\\,000}',
          vars: [
            { id: 'WtbP', symbol: 'W_{t,bend,P}', label: 'Allowable load, pinion bending', unit: 'lb', kind: 'calc', compute: v => has(v, 'satAct', 'KLP', 'SF', 'KR', 'F', 'JP', 'Pd', 'Ko', 'Ks', 'Km', 'Kv') ? v.satAct * v.KLP / (v.SF * v.KR) * v.F * v.JP / (v.Pd * v.Ko * v.Ks * v.Km * v.Kv) : undefined,
              work: v => has(v, 'satAct', 'KLP', 'SF', 'KR', 'F', 'JP', 'Pd', 'Ko', 'Ks', 'Km', 'Kv') ? '\\(W_{t,bend,P} = \\frac{' + fmt(v.satAct, 5) + '(' + fmt(v.KLP) + ')}{' + fmt(v.SF) + '(' + fmt(v.KR) + ')}\\cdot\\frac{' + fmt(v.F) + '(' + fmt(v.JP) + ')}{' + fmt(v.Pd) + '(' + fmt(v.Ko) + ')(' + fmt(v.Ks) + ')(' + fmt(v.Km) + ')(' + fmt(v.Kv) + ')} = ' + fmt(v.satAct * v.KLP / (v.SF * v.KR) * v.F * v.JP / (v.Pd * v.Ko * v.Ks * v.Km * v.Kv)) + '\\) lb' : null },
            { id: 'PbP', symbol: 'P_{bend,P}', label: 'Power rating, pinion bending', unit: 'hp', kind: 'calc', compute: v => has(v, 'WtbP', 'vt') ? v.WtbP * v.vt / 33000 : undefined,
              work: v => has(v, 'WtbP', 'vt') ? '\\(P_{bend,P} = ' + fmt(v.WtbP) + '(' + fmt(v.vt) + ')/33\\,000 = ' + fmt(v.WtbP * v.vt / 33000, 3) + '\\) hp' : null },
            { id: 'WtbG', symbol: 'W_{t,bend,G}', label: 'Allowable load, gear bending', unit: 'lb', kind: 'calc', compute: v => has(v, 'satAct', 'KLG', 'SF', 'KR', 'F', 'JG', 'Pd', 'Ko', 'Ks', 'Km', 'Kv') ? v.satAct * v.KLG / (v.SF * v.KR) * v.F * v.JG / (v.Pd * v.Ko * v.Ks * v.Km * v.Kv) : undefined },
            { id: 'PbG', symbol: 'P_{bend,G}', label: 'Power rating, gear bending', unit: 'hp', kind: 'calc', compute: v => has(v, 'WtbG', 'vt') ? v.WtbG * v.vt / 33000 : undefined },
            { id: 'Wtw', symbol: 'W_{t,wear}', label: 'Allowable load, pitting', unit: 'lb', kind: 'calc', compute: v => has(v, 'sacAct', 'CL', 'SF', 'CR', 'Cp', 'F', 'd', 'I', 'Ko', 'Km', 'Kv', 'Cs', 'Cxc') ? Math.pow(v.sacAct * v.CL / (v.SF * v.CR * v.Cp), 2) * v.F * v.d * v.I / (v.Ko * v.Km * v.Kv * v.Cs * v.Cxc) : undefined,
              work: v => has(v, 'sacAct', 'CL', 'SF', 'CR', 'Cp', 'F', 'd', 'I', 'Ko', 'Km', 'Kv', 'Cs', 'Cxc') ? '\\(W_{t,wear} = \\left(\\frac{' + fmt(v.sacAct, 6) + '(' + fmt(v.CL) + ')}{' + fmt(v.SF) + '(' + fmt(v.CR) + ')(' + fmt(v.Cp) + ')}\\right)^2\\frac{' + fmt(v.F) + '(' + fmt(v.d) + ')(' + fmt(v.I) + ')}{(' + fmt(v.Ko) + ')(' + fmt(v.Km) + ')(' + fmt(v.Kv) + ')(' + fmt(v.Cs) + ')(' + fmt(v.Cxc) + ')} = ' + fmt(Math.pow(v.sacAct * v.CL / (v.SF * v.CR * v.Cp), 2) * v.F * v.d * v.I / (v.Ko * v.Km * v.Kv * v.Cs * v.Cxc)) + '\\) lb' : null },
            { id: 'Pw', symbol: 'P_{wear}', label: 'Power rating, pitting', unit: 'hp', kind: 'calc', compute: v => has(v, 'Wtw', 'vt') ? v.Wtw * v.vt / 33000 : undefined,
              work: v => has(v, 'Wtw', 'vt') ? '\\(P_{wear} = ' + fmt(v.Wtw) + '(' + fmt(v.vt) + ')/33\\,000 = ' + fmt(v.Wtw * v.vt / 33000, 3) + '\\) hp' : null },
            { id: 'Prate', symbol: 'P_{rated}', label: 'Power rating of the gearset (minimum)', unit: 'hp', kind: 'calc', compute: v => has(v, 'PbP', 'PbG', 'Pw') ? Math.min(v.PbP, v.PbG, v.Pw) : undefined },
          ],
          after: v => {
            if (!has(v, 'Prate')) return '';
            const gov = v.Pw <= Math.min(v.PbP, v.PbG) ? 'pitting' : (v.PbP <= v.PbG ? 'pinion bending' : 'gear bending');
            let s = '<b>Power rating = ' + fmt(v.Prate, 3) + ' hp</b> (bending: pinion ' + fmt(v.PbP, 3) + ' hp, gear ' + fmt(v.PbG, 3) + ' hp; pitting ' + fmt(v.Pw, 3) + ' hp) — limited by ' + gov + ' with SF = ' + fmt(v.SF) + (has(v, 'HB') ? ' and ' + v.HB + ' HB' : ' and the s<sub>at</sub>, s<sub>ac</sub> entered') + '.';
            if (has(v, 'P')) s += v.P <= v.Prate * 1.001 ? ' <span class="result-ok">P = ' + fmt(v.P) + ' hp ≤ rating.</span>' : ' <span class="result-bad">P = ' + fmt(v.P) + ' hp exceeds the rating.</span>';
            return s;
          } },
      ] },
    ],
  };

  function kvFit(Av, vt) { const B = 0.25 * Math.pow(Av - 5, 0.667), C = 50 + 56 * (1 - B); return Math.pow(C / (C + sq(vt)), -B); }
  function KLfit(N) { return N < 1e3 ? 2.7 : N < 3e6 ? 6.1514 * Math.pow(N, -0.1192) : 1.3558 * Math.pow(N, -0.0178); }
  function hbBend(sat, g) { return g === 2 ? (sat / 1000 - 5.98) / 0.048 : (sat / 1000 - 2.10) / 0.044; }
  function hbWear(sac, g) { return g === 2 ? (sac / 1000 - 29.56) / 0.3636 : (sac / 1000 - 23.62) / 0.341; }
  function csMott(F) { return F <= 0.5 ? 0.5 : F >= 3.14 ? 0.83 : 0.125 * F + 0.4375; }
  // Table 9-5 pitch-line-speed rows (the guides' fallback for A_v); A4 is beyond Fig. 9-16, so the lowest used is A6.
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
  // Fig. 10-15 (= Shigley Fig. 15-7, same AGMA chart) pixel-traced: J for the member with N teeth (rows) meshing with M teeth (columns).
  // Off-chart corners are clamped to the curve ends. 16/48 → 0.235 (Mott Ex. 10-6 reads 0.230); 25/25 → 0.217.
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
  // Fig. 10-19 (= Shigley Fig. 15-6) pixel-traced: I vs pinion teeth (rows) and gear teeth (columns); cells with N_G < N_P hold the
  // curve-end value. 16/48 → 0.077 (Mott Ex. 10-7), 25/25 → 0.065, 20/60 → 0.083.
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
