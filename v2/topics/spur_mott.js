/* Spur gears — Mott 6e (Ch. 8 kinematics, Ch. 9 design). Merged Fizz 40-step + Mech-bible procedure (both guides follow Mott). */
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
  // rough read of Fig 9-10(a) J (20°, HPSTC, mate ≈ 50–85 teeth) – placeholder only
  const J_N = [12, 15, 17, 20, 24, 30, 35, 40, 45, 50, 60, 80, 125, 275, 1000];
  const J_V = [0.24, 0.27, 0.30, 0.335, 0.36, 0.385, 0.40, 0.41, 0.42, 0.425, 0.44, 0.455, 0.47, 0.49, 0.50];
  const Jest = N => (N >= 12) ? H.interp(N, J_N, J_V) : undefined;
  const YN_auto = N => N >= 1e7 ? 1.3558 * Math.pow(N, -0.0178) : Math.max(1, 4.9404 * Math.pow(N, -0.1045));
  const ZN_auto = N => N >= 1e7 ? 1.4488 * Math.pow(N, -0.023) : 2.466 * Math.pow(N, -0.056);
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
    intro: 'The Fizz 40-step / Mech-guide spur-gear design, in Mott notation: design power → trial pitch (Fig. 9-11) → tooth numbers & geometry (Table 8-1) → forces → bending stress number s<sub>t</sub> (Eq. 9-16) and contact stress number s<sub>c</sub> (Eq. 9-23) → life/reliability adjustments (Eqs. 9-30/9-31) → <b>required hardness</b> from Figs. 9-18/9-19 → safety factors (Eqs. 9-32/9-33) for the chosen material. Yellow fields are chart/table readings; an <i>auto</i> curve-fit estimate is shown until you type your reading. Use 4 decimals. Example = Mott Example Problems 9-3 … 9-6 (25 hp industrial saw, 1750 → 500 rpm).',
    example: { P: 25, nP: 1750, nGd: 500, src: 'uniform', drv: 'moderate', phi: 20, Pd: 6, NP: 20, NG: 70, F: 2, Av: 10, JP: 0.335, JG: 0.420, Ks: 1, cond: 'commercial', Cp: 2300, I: 0.108, R: 0.999, Lh: 20000, grade: 1, HBP: 363, HBG: 363, SFd: 1 },

    figures: [
      { id: 't9-1', ref: 'Table 9-1', title: 'Suggested overload factors K_o', src: 'figures/mott/table9-1.png', page: 395, note: 'Rows = power source (uniform: electric motor; light: multi-cylinder engine; moderate: single-cylinder engine). Columns = driven machine.' },
      { id: 'f9-11', ref: 'Figure 9-11', title: 'Design power vs pinion speed → trial diametral pitch', src: 'figures/mott/fig9-11.png', page: 394, note: 'Enter with P_des = K_o P and n_P; read the P_d curve above the point and round to the SMALLER standard P_d (bigger teeth). Curves assume N_P = 24, HB 300 steel.' },
      { id: 't8-3', ref: 'Table 8-3', title: 'Standard diametral pitches', src: 'figures/mott/table8-3.png', page: 332 },
      { id: 't8-1', ref: 'Table 8-1', title: 'Gear tooth features, diameters, centre distance — all formulas', src: 'figures/mott/table8-1.png', page: 331, note: 'Coarse pitch P_d < 20 vs fine pitch P_d ≥ 20 (dedendum & clearance differ).' },
      { id: 'f9-3', ref: 'Figure 9-3', title: 'Forces on gear teeth: W_t, W_r, W_n', src: 'figures/mott/fig9-3.png', page: 384 },
      { id: 'f8-42', ref: 'Figure 8-42', title: 'Double-reduction gear train — train value', src: 'figures/mott/fig8-42.png', page: 363, note: 'TV = (VR₁)(VR₂) = (N_B/N_A)(N_D/N_C) = n_in/n_out.' },
      { id: 'tv', ref: 'Train value (Sec. 8-9)', title: 'Train value definition', src: 'figures/mott/eq-train-value.png', page: 363 },
      { id: 't9-5', ref: 'Table 9-5', title: 'Recommended AGMA quality numbers A_v', src: 'figures/mott/table9-5.png', page: 399, note: 'By application, or by pitch-line speed for machine-tool-type drives. Fizz: "just guess what looks right" — A_v 10 for ordinary industrial drives.' },
      { id: 'f9-16', ref: 'Figure 9-16', title: 'Dynamic factor K_v vs pitch line velocity (curves of A_v)', src: 'figures/mott/fig9-16.png', page: 400 },
      { id: 't9-6', ref: 'Table 9-6', title: 'Analytical K_v: B, C from A_v; v_t,max', src: 'figures/mott/table9-6.png', page: 401 },
      { id: 'f9-10', ref: 'Figure 9-10', title: 'Bending geometry factor J (a) 20° (b) 25°', src: 'figures/mott/fig9-10.png', page: 393, note: 'x-axis = teeth of the gear you want J for; curve = teeth of the MATING gear (load at HPSTC). J_P: x = N_P, curve N_G. J_G: x = N_G, curve N_P.' },
      { id: 't9-2', ref: 'Table 9-2', title: 'Suggested size factors K_s', src: 'figures/mott/table9-2.png', page: 395, note: 'K_s = 1.00 for P_d ≥ 5.' },
      { id: 'f9-12', ref: 'Figure 9-12', title: 'Pinion proportion factor C_pf', src: 'figures/mott/fig9-12.png', page: 396, note: 'Fizz step 20: "use the equations if you can because the table is bad". For F/D_P < 0.5 use the 0.5 curve.' },
      { id: 'f9-13', ref: 'Figure 9-13', title: 'Mesh alignment factor C_ma (with curve equations)', src: 'figures/mott/fig9-13.png', page: 397, note: 'Course default: commercial enclosed gear units.' },
      { id: 'f9-14', ref: 'Figure 9-14', title: 'Rim thickness factor K_B', src: 'figures/mott/fig9-14.png', page: 397, note: 'Solid blank → K_B = 1.0.' },
      { id: 'f9-15', ref: 'Figure 9-15', title: 'Pinion on a keyed shaft — measure t_R above the keyway', src: 'figures/mott/fig9-15.png', page: 398 },
      { id: 't9-7', ref: 'Table 9-7', title: 'Elastic coefficient C_p', src: 'figures/mott/table9-7.png', page: 404, note: 'Steel–steel: 2300 (lb/in²)^0.5.' },
      { id: 'f9-17', ref: 'Figure 9-17', title: 'Pitting geometry factor I (a) 20° (b) 25°', src: 'figures/mott/fig9-17.png', page: 405, note: 'Enter with gear ratio m_G, pick the N_P curve. Auto value = Shigley Eq. 14-23 (same AGMA formula at the pitch point, slightly different from Mott\'s LPSTC curves).' },
      { id: 'f9-18', ref: 'Figure 9-18', title: 'Allowable bending stress number s_at vs HB (through-hardened steel)', src: 'figures/mott/fig9-18.png', page: 407, note: 'Grade 1: s_at = 0.0773 HB + 12.80 ksi → HB = (s_at − 12.80)/0.0773. Grade 2: s_at = 0.102 HB + 16.40 ksi.' },
      { id: 'f9-19', ref: 'Figure 9-19', title: 'Allowable contact stress number s_ac vs HB (through-hardened steel)', src: 'figures/mott/fig9-19.png', page: 408, note: 'Grade 1: s_ac = 0.322 HB + 29.10 ksi → HB = (s_ac − 29.10)/0.322. Grade 2: s_ac = 0.349 HB + 34.30 ksi.' },
      { id: 't9-8', ref: 'Table 9-8', title: 'Examples of gear materials (through-hardening vs carburizing alloys)', src: 'figures/mott/table9-8.png', page: 406 },
      { id: 't9-9', ref: 'Table 9-9', title: 'Allowable stress numbers for case-hardened grade-1 steel', src: 'figures/mott/table9-9.png', page: 409, note: 'Use when HB_req > 400: flame/induction (s_ac 170–175 ksi), carburized (s_at 55, s_ac 180 ksi).' },
      { id: 't9-10', ref: 'Table 9-10', title: 'Allowable stress numbers for iron and bronze gears', src: 'figures/mott/table9-10.png', page: 410 },
      { id: 't9-11', ref: 'Table 9-11', title: 'Reliability factor K_R', src: 'figures/mott/table9-11.png', page: 411, note: '99 % → K_R = 1.00 (course default).' },
      { id: 't9-12', ref: 'Table 9-12', title: 'Recommended design life (hours)', src: 'figures/mott/table9-12.png', page: 411, note: 'General industrial machines: 20 000–30 000 h.' },
      { id: 'f9-21', ref: 'Figure 9-21', title: 'Bending strength stress cycle factor Y_N', src: 'figures/mott/fig9-21.png', page: 412, note: 'Y_N = 1.3558 N_c^−0.0178 beyond 10⁷ cycles.' },
      { id: 'f9-22', ref: 'Figure 9-22', title: 'Pitting resistance stress cycle factor Z_N', src: 'figures/mott/fig9-22.png', page: 412, note: 'Z_N = 1.4488 N_c^−0.023 beyond 10⁷ cycles.' },
    ],

    sections: [
      { title: 'Inputs & design decisions (Fizz steps 1–10)', steps: [
        { id: 'in', title: 'Power, speeds and overload factor', fig: ['t9-1'],
          text: 'Steps 1–3: identify the shock of the power source and the driven machine, read K_o from Table 9-1 and compute the design power.',
          formula: 'P_{des} = K_o\\,P \\qquad VR = \\frac{n_P}{n_G}',
          vars: [
            { id: 'P', symbol: 'P', label: 'Transmitted power', unit: 'hp', kind: 'input' },
            { id: 'nP', symbol: 'n_P', label: 'Pinion (input) speed', unit: 'rpm', kind: 'input' },
            { id: 'nGd', symbol: 'n_{G,des}', label: 'Desired gear (output) speed', unit: 'rpm', kind: 'input', hint: 'middle of the allowed range; blank if N_G is given' },
            { id: 'src', label: 'Power source', kind: 'choice', type: 'text', options: [{ label: 'Uniform (electric motor, turbine)', value: 'uniform' }, { label: 'Light shock (multi-cyl. engine)', value: 'light' }, { label: 'Moderate shock (single-cyl. engine)', value: 'moderate' }], default: 'uniform' },
            { id: 'drv', label: 'Driven machine', kind: 'choice', type: 'text', options: [{ label: 'Uniform (generator, conveyor)', value: 'uniform' }, { label: 'Light shock (fans, pumps)', value: 'light' }, { label: 'Moderate shock (saws, machine tools, mixers)', value: 'moderate' }, { label: 'Heavy shock (crushers, punch press)', value: 'heavy' }], default: 'uniform' },
            { id: 'Ko', symbol: 'K_o', label: 'Overload factor', kind: 'lookup', fig: 't9-1', hint: 'auto from the two selects (Table 9-1)', auto: v => (KO[v.src] && KO[v.src][v.drv]) || undefined, check: v => v.Ko !== undefined && (v.Ko < 1 || v.Ko > 3) ? 'K_o is normally 1.0–2.75' : null },
            { id: 'Pdes', symbol: 'P_{des}', label: 'Design power', unit: 'hp', kind: 'calc', compute: v => has(v, 'P', 'Ko') ? v.P * v.Ko : undefined, work: v => has(v, 'P', 'Ko') ? '\\(P_{des} = ' + f(v.Ko) + '\\times' + f(v.P) + ' = ' + f(v.P * v.Ko) + '\\ \\mathrm{hp}\\)' : null },
            { id: 'VRd', symbol: 'VR_{des}', label: 'Desired velocity ratio', kind: 'calc', compute: v => has(v, 'nP', 'nGd') && v.nGd > 0 ? v.nP / v.nGd : undefined },
          ] },
        { id: 'tooth', title: 'Diametral pitch and tooth numbers', fig: ['f9-11', 't8-3'],
          text: 'Step 4: read P_d from Fig. 9-11 with P_des and n_P (round to the smaller standard value). Step 5: N_P between 17 and 20. Steps 7–10: N_G = N_P·VR rounded to an integer, then the actual VR and n_G — check n_G is inside the allowed range, otherwise try another N_P.',
          formula: 'N_G = N_P\\,VR\\ (\\text{integer}),\\qquad VR = m_G = \\frac{N_G}{N_P},\\qquad n_G = n_P\\frac{N_P}{N_G}',
          vars: [
            { id: 'phi', symbol: '\\phi', label: 'Pressure angle', unit: '°', kind: 'choice', options: [{ label: '20° full depth', value: 20 }, { label: '25° full depth', value: 25 }, { label: '14.5°', value: 14.5 }], default: 20 },
            { id: 'Pd', symbol: 'P_d', label: 'Diametral pitch', unit: 'teeth/in', kind: 'lookup', fig: 'f9-11', hint: 'Fig. 9-11, or given. Module given? P_d = 25.4/m', check: v => v.Pd !== undefined && [1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 32, 48, 64, 72, 80, 96, 120].indexOf(v.Pd) < 0 ? 'not a standard pitch (Table 8-3)' : null },
            { id: 'NP', symbol: 'N_P', label: 'Pinion teeth', kind: 'input', hint: '17 – 20', check: v => v.NP !== undefined && v.NP < 17 && v.phi === 20 ? 'N_P < 17 → interference at 20° (Table 8-7)' : (v.NP !== undefined && v.NP !== Math.round(v.NP) ? 'must be an integer' : null) },
            { id: 'NG', symbol: 'N_G', label: 'Gear teeth', kind: 'input', hint: 'auto = round(N_P·VR_des); type the given value if specified', auto: v => has(v, 'NP', 'VRd') ? Math.round(v.NP * v.VRd) : undefined, check: v => v.NG !== undefined && v.NG !== Math.round(v.NG) ? 'must be an integer' : null },
            { id: 'mG', symbol: 'VR = m_G', label: 'Actual velocity (gear) ratio', kind: 'calc', compute: v => has(v, 'NP', 'NG') ? v.NG / v.NP : undefined },
            { id: 'nG', symbol: 'n_G', label: 'Actual gear speed', unit: 'rpm', kind: 'calc', compute: v => has(v, 'nP', 'NP', 'NG') ? v.nP * v.NP / v.NG : undefined, work: v => has(v, 'nP', 'NP', 'NG') ? '\\(n_G = ' + f(v.nP) + '\\times' + f(v.NP) + '/' + f(v.NG) + ' = ' + f(v.nP * v.NP / v.NG) + '\\ \\mathrm{rpm}\\)' : null },
          ],
          after: v => has(v, 'nG', 'nGd') ? (Math.abs(v.nG - v.nGd) / v.nGd < 0.05 ? okbad(true, 'n_G within 5 % of target ' + f(v.nGd) + ' rpm — confirm it is inside the specified range.') : okbad(false, 'n_G = ' + f(v.nG) + ' rpm is ' + f(100 * Math.abs(v.nG - v.nGd) / v.nGd, 3) + ' % off target — check the allowed range, else change N_P.')) : '' },
        { id: 'fw', title: 'Face width (step 13)', fig: ['t8-1'],
          formula: 'F_{nom} = \\frac{12}{P_d},\\qquad \\frac{8}{P_d} < F < \\frac{16}{P_d},\\qquad 0.5 < \\frac{F}{D_P} < 2',
          vars: [
            { id: 'F', symbol: 'F', label: 'Face width', unit: 'in', kind: 'input', hint: 'auto = 12/P_d', auto: v => has(v, 'Pd') ? 12 / v.Pd : undefined, check: v => has(v, 'F', 'Pd') && (v.F < 8 / v.Pd || v.F > 16 / v.Pd) ? 'outside 8/P_d … 16/P_d = ' + f(8 / v.Pd, 3) + ' … ' + f(16 / v.Pd, 3) + ' in' : null },
            { id: 'FdP', symbol: 'F/D_P', label: 'Face width to pinion diameter ratio', kind: 'calc', digits: 3, compute: v => has(v, 'F', 'DP') ? v.F / v.DP : undefined, check: v => v.FdP !== undefined && (v.FdP > 2 || v.FdP < 0.5) ? 'F/D_P should be between 0.5 and 2 — try a different F' : null },
          ] },
      ] },

      { title: 'Tooth geometry (Mech-guide spec question, Table 8-1)', text: 'All lengths in inches. Coarse pitch P_d < 20: b = 1.25/P_d, c = 0.25/P_d. Fine pitch P_d ≥ 20: b = 1.20/P_d + 0.002, c = 0.20/P_d + 0.002.', steps: [
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

      { title: 'Forces (step 12, Sec. 9-3)', steps: [
        { id: 'force', title: 'Pitch line speed, transmitted, radial and normal loads, torques', fig: ['f9-3'],
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

      { title: 'Stress-equation factors (steps 14–24)', steps: [
        { id: 'kv', title: 'Quality number A_v and dynamic factor K_v (steps 16–17)', fig: ['t9-5', 'f9-16', 't9-6'],
          formula: 'B = 0.25(A_v-5)^{0.667},\\quad C = 50+56(1-B),\\quad K_v = \\left[\\frac{C}{C+\\sqrt{v_t}}\\right]^{-B},\\quad v_{t,max} = [C+(14-A_v)]^2',
          text: 'A_v from Table 9-5 (lower number = more precise). Read K_v from Fig. 9-16 or use the Table 9-6 equations (auto).',
          vars: [
            { id: 'Av', symbol: 'A_v', label: 'AGMA quality number', kind: 'choice', fig: 't9-5', options: [6, 7, 8, 9, 10, 11, 12].map(q => ({ label: 'A_v = ' + q, value: q })), default: 10 },
            { id: 'Bv', symbol: 'B', label: 'B', kind: 'calc', digits: 4, compute: v => has(v, 'Av') ? 0.25 * Math.pow(v.Av - 5, 0.667) : undefined },
            { id: 'Cv', symbol: 'C', label: 'C', kind: 'calc', digits: 4, compute: v => has(v, 'Bv') ? 50 + 56 * (1 - v.Bv) : undefined },
            { id: 'Kv', symbol: 'K_v', label: 'Dynamic factor', kind: 'lookup', fig: 'f9-16', hint: 'auto = Table 9-6 equation; or read Fig. 9-16', auto: v => has(v, 'Cv', 'Bv', 'vt') ? Math.pow(v.Cv / (v.Cv + Math.sqrt(v.vt)), -v.Bv) : undefined,
              work: v => has(v, 'Cv', 'Bv', 'vt') ? '\\(K_v = \\left[\\frac{' + f(v.Cv) + '}{' + f(v.Cv) + '+\\sqrt{' + f(v.vt) + '}}\\right]^{-' + f(v.Bv) + '} = ' + f(Math.pow(v.Cv / (v.Cv + Math.sqrt(v.vt)), -v.Bv)) + '\\)' : null },
            { id: 'vtmax', symbol: 'v_{t,max}', label: 'Max. pitch line speed for this A_v', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'Cv', 'Av') ? Math.pow(v.Cv + (14 - v.Av), 2) : undefined, check: v => has(v, 'vt', 'vtmax') && v.vt > v.vtmax ? 'v_t exceeds v_t,max — choose a lower (more precise) A_v' : null },
          ] },
        { id: 'j', title: 'Bending geometry factors J_P, J_G (step 18)', fig: ['f9-10'],
          text: 'Fig. 9-10(a) for 20°, (b) for 25°. J_P: x = N_P on the curve for N_G mating teeth; J_G: x = N_G on the curve for N_P. The auto value is only a rough read of the mid curves — read the chart.',
          vars: [
            { id: 'JP', symbol: 'J_P', label: 'Geometry factor, pinion', kind: 'lookup', fig: 'f9-10', digits: 3, hint: 'ROUGH auto estimate — read Fig. 9-10', auto: v => has(v, 'NP') && v.phi === 20 ? Jest(v.NP) : undefined },
            { id: 'JG', symbol: 'J_G', label: 'Geometry factor, gear', kind: 'lookup', fig: 'f9-10', digits: 3, hint: 'ROUGH auto estimate — read Fig. 9-10', auto: v => has(v, 'NG') && v.phi === 20 ? Jest(v.NG) : undefined },
          ] },
        { id: 'km', title: 'Size factor K_s and load-distribution factor K_m (steps 20–23)', eq: '9-17', fig: ['t9-2', 'f9-12', 'f9-13'],
          formula: 'K_m = 1 + C_{pf} + C_{ma},\\qquad C_{pf} = \\frac{F}{10D_P} - 0.025\\ (F<1),\\quad C_{pf} = \\frac{F}{10D_P} - 0.0375 + 0.0125F\\ (1\\le F<15)',
          text: 'C_ma from Fig. 9-13: commercial enclosed C_ma = 0.127 + 0.0158F − 1.093×10⁻⁴F² (open 0.247 + 0.0167F − 0.765×10⁻⁴F²; precision 0.0675 + 0.0128F − 0.926×10⁻⁴F²; extra-precision 0.0380 + 0.0102F − 0.822×10⁻⁴F²). For F/D_P < 0.5 use F/D_P = 0.5.',
          vars: [
            { id: 'Ks', symbol: 'K_s', label: 'Size factor', kind: 'lookup', fig: 't9-2', hint: 'auto = Table 9-2 (1.00 for P_d ≥ 5)', auto: v => has(v, 'Pd') ? KS(v.Pd) : undefined },
            { id: 'Cpf', symbol: 'C_{pf}', label: 'Pinion proportion factor', kind: 'lookup', fig: 'f9-12', digits: 4, hint: 'auto = Fig. 9-12 equations',
              auto: v => { if (!has(v, 'F', 'DP')) return undefined; const r = Math.max(v.F / (10 * v.DP), 0.05); return v.F < 1 ? r - 0.025 : r - 0.0375 + 0.0125 * v.F; },
              work: v => has(v, 'F', 'DP') ? '\\(C_{pf} = \\frac{' + f(v.F) + '}{10(' + f(v.DP) + ')}' + (v.F < 1 ? ' - 0.025' : ' - 0.0375 + 0.0125(' + f(v.F) + ')') + ' = ' + f(v.Cpf, 4) + '\\)' : null },
            { id: 'cond', label: 'Gearing condition (for C_ma)', kind: 'choice', type: 'text', options: [{ label: 'Open gearing', value: 'open' }, { label: 'Commercial enclosed gear units', value: 'commercial' }, { label: 'Precision enclosed gear units', value: 'precision' }, { label: 'Extra-precision enclosed gear units', value: 'extra' }], default: 'commercial' },
            { id: 'Cma', symbol: 'C_{ma}', label: 'Mesh alignment factor', kind: 'lookup', fig: 'f9-13', digits: 4, hint: 'auto = Fig. 9-13 curve equation', auto: v => { const k = CMA[v.cond]; return k && has(v, 'F') ? k[0] + k[1] * v.F + k[2] * v.F * v.F : undefined; },
              work: v => { const k = CMA[v.cond]; return k && has(v, 'F') ? '\\(C_{ma} = ' + k[0] + ' + ' + k[1] + '(' + f(v.F) + ') ' + (k[2] * 1e4).toFixed(3) + '\\times10^{-4}(' + f(v.F) + ')^2 = ' + f(v.Cma, 4) + '\\)' : null; } },
            { id: 'Km', symbol: 'K_m', label: 'Load-distribution factor', kind: 'calc', digits: 4, compute: v => has(v, 'Cpf', 'Cma') ? 1 + v.Cpf + v.Cma : undefined, work: v => has(v, 'Cpf', 'Cma') ? '\\(K_m = 1 + ' + f(v.Cpf, 4) + ' + ' + f(v.Cma, 4) + ' = ' + f(v.Km, 4) + '\\)' : null },
          ] },
        { id: 'kb', title: 'Rim thickness factor K_B (step 24)', fig: ['f9-14', 'f9-15'],
          formula: 'm_B = \\frac{t_R}{h_t},\\qquad K_B = 1.6\\ln\\frac{2.242}{m_B}\\ (m_B<1.2),\\quad K_B = 1.0\\ (m_B\\ge1.2)',
          text: '"It will always be 1.00 unless it isn\'t." Leave t_R blank for a solid blank.',
          vars: [
            { id: 'tR', symbol: 't_R', label: 'Rim thickness below tooth (blank = solid)', unit: 'in', kind: 'input' },
            { id: 'mB', symbol: 'm_B', label: 'Backup ratio', kind: 'calc', digits: 3, compute: v => has(v, 'tR', 'ht') ? v.tR / v.ht : undefined },
            { id: 'KB', symbol: 'K_B', label: 'Rim thickness factor', kind: 'lookup', fig: 'f9-14', hint: 'auto = 1 (solid) or the equation', auto: v => v.mB === undefined ? 1 : (v.mB < 1.2 ? 1.6 * Math.log(2.242 / v.mB) : 1) },
          ] },
        { id: 'i', title: 'Elastic coefficient C_p and pitting geometry factor I (steps 15, 19)', fig: ['t9-7', 'f9-17'],
          formula: 'I\\ \\text{(auto, AGMA pitch-point form)} = \\frac{\\cos\\phi\\sin\\phi}{2}\\,\\frac{m_G}{m_G+1}',
          text: 'C_p = 2300 for steel on steel (Table 9-7). Read I from Fig. 9-17 with the gear ratio and N_P curve (Mott\'s curves are at the lowest point of single-tooth contact, so they run a little below the auto value).',
          vars: [
            { id: 'Cp', symbol: 'C_p', label: 'Elastic coefficient', unit: '√psi', kind: 'lookup', fig: 't9-7', default: 2300 },
            { id: 'I', symbol: 'I', label: 'Pitting geometry factor', kind: 'lookup', fig: 'f9-17', digits: 4, hint: 'read Fig. 9-17; auto = formula estimate', auto: v => has(v, 'phi', 'mG') ? cosd(v.phi) * sind(v.phi) / 2 * v.mG / (v.mG + 1) : undefined },
          ] },
      ] },

      { title: 'Stress numbers (steps 32, 34)', steps: [
        { id: 'sb', title: 'Bending stress numbers s_tP, s_tG', eq: '9-16',
          formula: 's_{tP} = \\frac{W_t P_d}{F J_P}K_o K_s K_m K_B K_v,\\qquad s_{tG} = s_{tP}\\frac{J_P}{J_G}',
          vars: [
            { id: 'stP', symbol: 's_{tP}', label: 'Pinion bending stress number', unit: 'psi', kind: 'calc', compute: v => has(v, 'Wt', 'Pd', 'F', 'JP', 'Ko', 'Ks', 'Km', 'KB', 'Kv') ? v.Wt * v.Pd / (v.F * v.JP) * v.Ko * v.Ks * v.Km * v.KB * v.Kv : undefined,
              work: v => v.stP !== undefined ? '\\(s_{tP} = \\frac{' + f(v.Wt) + '(' + f(v.Pd) + ')}{' + f(v.F) + '(' + f(v.JP, 3) + ')}(' + f(v.Ko) + ')(' + f(v.Ks) + ')(' + f(v.Km, 4) + ')(' + f(v.KB) + ')(' + f(v.Kv) + ') = ' + f(v.stP) + '\\ \\mathrm{psi}\\)' : null },
            { id: 'stG', symbol: 's_{tG}', label: 'Gear bending stress number', unit: 'psi', kind: 'calc', compute: v => has(v, 'stP', 'JP', 'JG') ? v.stP * v.JP / v.JG : undefined, work: v => v.stG !== undefined ? '\\(s_{tG} = ' + f(v.stP) + '(' + f(v.JP, 3) + '/' + f(v.JG, 3) + ') = ' + f(v.stG) + '\\ \\mathrm{psi}\\)' : null },
          ] },
        { id: 'sc', title: 'Contact stress number s_c (same for pinion and gear)', eq: '9-23',
          formula: 's_c = C_p\\sqrt{\\frac{W_t K_o K_s K_m K_v}{F D_P I}}',
          text: 'Always D_P (pinion). K_B is NOT in the contact equation (the Mech guide misprints it).',
          vars: [
            { id: 'sc', symbol: 's_c', label: 'Contact stress number', unit: 'psi', kind: 'calc', compute: v => has(v, 'Cp', 'Wt', 'Ko', 'Ks', 'Km', 'Kv', 'F', 'DP', 'I') ? v.Cp * Math.sqrt(v.Wt * v.Ko * v.Ks * v.Km * v.Kv / (v.F * v.DP * v.I)) : undefined,
              work: v => v.sc !== undefined ? '\\(s_c = ' + f(v.Cp) + '\\sqrt{\\frac{' + f(v.Wt) + '(' + f(v.Ko) + ')(' + f(v.Ks) + ')(' + f(v.Km, 4) + ')(' + f(v.Kv) + ')}{' + f(v.F) + '(' + f(v.DP) + ')(' + f(v.I, 4) + ')}} = ' + f(v.sc) + '\\ \\mathrm{psi}\\)' : null },
          ] },
      ] },

      { title: 'Life, reliability, stress-cycle factors (steps 25–31)', steps: [
        { id: 'life', title: 'Service factor, reliability, design life, load cycles', eq: '9-27', fig: ['t9-11', 't9-12'],
          formula: 'N_c = 60\\,L\\,n\\,q',
          text: 'SF 1.00–1.50 (1.00 unless the data are uncertain). 99 % reliability → K_R = 1.00. Life from Table 9-12 if not given (general industrial 20 000–30 000 h). q = 1 load per revolution (2 for an idler).',
          vars: [
            { id: 'SFd', symbol: 'SF', label: 'Service (design safety) factor', kind: 'input', default: 1, hint: '1.00 – 1.50', check: v => v.SFd !== undefined && (v.SFd < 1 || v.SFd > 1.5) ? 'AGMA: 1.0–1.5' : null },
            { id: 'R', symbol: 'R', label: 'Reliability', kind: 'input', default: 0.99, hint: '0.90 / 0.99 / 0.999 / 0.9999' },
            { id: 'KR', symbol: 'K_R', label: 'Reliability factor', kind: 'lookup', fig: 't9-11', digits: 3, auto: v => { if (!has(v, 'R')) return undefined; if (KR[v.R] !== undefined) return KR[v.R]; return v.R < 0.99 ? 0.658 - 0.0759 * Math.log(1 - v.R) : 0.5 - 0.109 * Math.log(1 - v.R); } },
            { id: 'Lh', symbol: 'L', label: 'Design life', unit: 'h', kind: 'lookup', fig: 't9-12' },
            { id: 'q', symbol: 'q', label: 'Load applications per revolution', kind: 'input', default: 1 },
            { id: 'NcP', symbol: 'N_{cP}', label: 'Pinion load cycles', kind: 'calc', digits: 4, compute: v => has(v, 'Lh', 'nP', 'q') ? 60 * v.Lh * v.nP * v.q : undefined, work: v => v.NcP !== undefined ? '\\(N_{cP} = 60(' + f(v.Lh) + ')(' + f(v.nP) + ')(' + f(v.q) + ') = ' + f(v.NcP) + '\\)' : null },
            { id: 'NcG', symbol: 'N_{cG}', label: 'Gear load cycles', kind: 'calc', digits: 4, compute: v => has(v, 'Lh', 'nG', 'q') ? 60 * v.Lh * v.nG * v.q : undefined, work: v => v.NcG !== undefined ? '\\(N_{cG} = 60(' + f(v.Lh) + ')(' + f(v.nG) + ')(' + f(v.q) + ') = ' + f(v.NcG) + '\\)' : null },
          ] },
        { id: 'yz', title: 'Stress cycle factors Y_N and Z_N (steps 30–31)', fig: ['f9-21', 'f9-22'],
          formula: 'Y_N = 1.3558\\,N_c^{-0.0178},\\qquad Z_N = 1.4488\\,N_c^{-0.023}\\qquad (N_c \\ge 10^7)',
          vars: [
            { id: 'YNP', symbol: 'Y_{NP}', label: 'Bending stress cycle factor, pinion', kind: 'lookup', fig: 'f9-21', digits: 4, auto: v => has(v, 'NcP') ? YN_auto(v.NcP) : undefined, hint: 'auto = curve equation; read Fig. 9-21' },
            { id: 'YNG', symbol: 'Y_{NG}', label: 'Bending stress cycle factor, gear', kind: 'lookup', fig: 'f9-21', digits: 4, auto: v => has(v, 'NcG') ? YN_auto(v.NcG) : undefined },
            { id: 'ZNP', symbol: 'Z_{NP}', label: 'Pitting stress cycle factor, pinion', kind: 'lookup', fig: 'f9-22', digits: 4, auto: v => has(v, 'NcP') ? ZN_auto(v.NcP) : undefined, hint: 'auto = curve equation; read Fig. 9-22' },
            { id: 'ZNG', symbol: 'Z_{NG}', label: 'Pitting stress cycle factor, gear', kind: 'lookup', fig: 'f9-22', digits: 4, auto: v => has(v, 'NcG') ? ZN_auto(v.NcG) : undefined },
          ] },
      ] },

      { title: 'Required strength & hardness — material selection (steps 33, 35, 37–38)', steps: [
        { id: 'req', title: 'Required allowable stress numbers', eq: '9-30, 9-31',
          formula: 's_{at} > s_t\\frac{K_R\\,(SF)}{Y_N},\\qquad s_{ac} > s_c\\frac{K_R\\,(SF)}{Z_N}',
          vars: [
            { id: 'satP', symbol: 's_{at,P}', label: 'Required bending stress number, pinion', unit: 'psi', kind: 'calc', compute: v => has(v, 'stP', 'KR', 'SFd', 'YNP') ? v.stP * v.KR * v.SFd / v.YNP : undefined, work: v => v.satP !== undefined ? '\\(s_{at,P} = ' + f(v.stP) + '(' + f(v.KR, 3) + ')(' + f(v.SFd) + ')/' + f(v.YNP, 4) + ' = ' + f(v.satP) + '\\ \\mathrm{psi}\\)' : null },
            { id: 'satG', symbol: 's_{at,G}', label: 'Required bending stress number, gear', unit: 'psi', kind: 'calc', compute: v => has(v, 'stG', 'KR', 'SFd', 'YNG') ? v.stG * v.KR * v.SFd / v.YNG : undefined },
            { id: 'sacP', symbol: 's_{ac,P}', label: 'Required contact stress number, pinion', unit: 'psi', kind: 'calc', compute: v => has(v, 'sc', 'KR', 'SFd', 'ZNP') ? v.sc * v.KR * v.SFd / v.ZNP : undefined, work: v => v.sacP !== undefined ? '\\(s_{ac,P} = ' + f(v.sc) + '(' + f(v.KR, 3) + ')(' + f(v.SFd) + ')/' + f(v.ZNP, 4) + ' = ' + f(v.sacP) + '\\ \\mathrm{psi}\\)' : null },
            { id: 'sacG', symbol: 's_{ac,G}', label: 'Required contact stress number, gear', unit: 'psi', kind: 'calc', compute: v => has(v, 'sc', 'KR', 'SFd', 'ZNG') ? v.sc * v.KR * v.SFd / v.ZNG : undefined },
          ] },
        { id: 'hb', title: 'Required Brinell hardness (step 37) and material (step 38)', fig: ['f9-18', 'f9-19', 't9-8', 't9-9', 't9-10'],
          formula: 'HB = \\frac{s_{at}/1000 - 12.80}{0.0773}\\ (\\text{grade 1}),\\qquad HB = \\frac{s_{ac}/1000 - 29.10}{0.322}\\ (\\text{grade 1})',
          text: 'Grade 2: HB = (s_at/1000 − 16.40)/0.102, HB = (s_ac/1000 − 34.30)/0.349. Choose the LARGEST. Pick a steel from Appendix 3 (through-hardened) with at least this hardness; same material for pinion and gear. HB > 400 → flame/induction hardening or carburizing (Table 9-9) instead of through-hardening (step 40).',
          vars: [
            { id: 'grade', label: 'Steel grade', kind: 'choice', options: [{ label: 'Grade 1 (course default)', value: 1 }, { label: 'Grade 2', value: 2 }], default: 1 },
            { id: 'HBbP', symbol: 'HB_{bend,P}', label: 'Hardness for pinion bending', unit: 'HB', kind: 'calc', digits: 4, compute: v => has(v, 'satP', 'grade') ? Math.max(0, satHB(v.satP, v.grade)) : undefined, work: v => v.HBbP !== undefined ? '\\(HB = (' + f(v.satP / 1000) + ' - ' + (v.grade === 2 ? '16.40)/0.102' : '12.80)/0.0773') + ' = ' + f(satHB(v.satP, v.grade)) + '\\)' : null },
            { id: 'HBbG', symbol: 'HB_{bend,G}', label: 'Hardness for gear bending', unit: 'HB', kind: 'calc', digits: 4, compute: v => has(v, 'satG', 'grade') ? Math.max(0, satHB(v.satG, v.grade)) : undefined },
            { id: 'HBcP', symbol: 'HB_{cont,P}', label: 'Hardness for pinion contact', unit: 'HB', kind: 'calc', digits: 4, compute: v => has(v, 'sacP', 'grade') ? Math.max(0, sacHB(v.sacP, v.grade)) : undefined, work: v => v.HBcP !== undefined ? '\\(HB = (' + f(v.sacP / 1000) + ' - ' + (v.grade === 2 ? '34.30)/0.349' : '29.10)/0.322') + ' = ' + f(sacHB(v.sacP, v.grade)) + '\\)' : null },
            { id: 'HBcG', symbol: 'HB_{cont,G}', label: 'Hardness for gear contact', unit: 'HB', kind: 'calc', digits: 4, compute: v => has(v, 'sacG', 'grade') ? Math.max(0, sacHB(v.sacG, v.grade)) : undefined },
            { id: 'HBreq', symbol: 'HB_{req}', label: 'REQUIRED hardness (largest)', unit: 'HB', kind: 'calc', digits: 4, compute: v => { const a = [v.HBbP, v.HBbG, v.HBcP, v.HBcG].filter(x => typeof x === 'number'); return a.length ? Math.max(...a) : undefined; } },
          ],
          after: v => v.HBreq === undefined ? '' : (v.HBreq > 400 ? okbad(false, 'Required ' + f(v.HBreq, 3) + ' HB > 400: through-hardening is not adequate. Specify flame/induction-hardened (s_ac 170–175 ksi) or carburized grade-1 steel (s_at 55 ksi, s_ac 180 ksi, Table 9-9; e.g. SAE 4320 / 8620 carburized), or enlarge the gears.') : okbad(true, 'Specify a through-hardened grade-' + v.grade + ' steel with HB ≥ ' + f(Math.ceil(v.HBreq), 3) + ' for pinion and gear (' + (v.HBcP >= v.HBbP ? 'pitting' : 'bending') + ' governs). Pick from Appendix 3 / Table 9-8, e.g. SAE 1045, 4140, 4340 Q&T to at least that hardness' + (v.HBreq < 180 ? ' (any ≥ 180 HB steel is fine — below the AGMA data range)' : '') + '.')) },
      ] },

      { title: 'Check the chosen material — safety factors (steps 36, 39)', steps: [
        { id: 'mat', title: 'Allowable stress numbers of the chosen material', fig: ['f9-18', 'f9-19', 't9-9', 't9-10'],
          formula: 's_{at} = 0.0773\\,HB + 12.80\\ \\mathrm{ksi},\\qquad s_{ac} = 0.322\\,HB + 29.10\\ \\mathrm{ksi}\\quad(\\text{grade 1, through-hardened})',
          text: 'Enter the Brinell hardness of the chosen steel (Appendix 3), or type s_at / s_ac directly for case-hardened (Table 9-9) or iron/bronze (Table 9-10).',
          vars: [
            { id: 'HBP', symbol: 'HB_P', label: 'Pinion hardness', unit: 'HB', kind: 'input' },
            { id: 'HBG', symbol: 'HB_G', label: 'Gear hardness', unit: 'HB', kind: 'input', hint: 'same material → same HB' },
            { id: 'satmP', symbol: 's_{at}', label: 'Allowable bending stress number, pinion', unit: 'psi', kind: 'lookup', fig: 'f9-18', auto: v => has(v, 'HBP', 'grade') ? satOf(v.HBP, v.grade) : undefined, hint: 'auto from Fig. 9-18; Table 9-9/9-10 for other materials' },
            { id: 'satmG', symbol: 's_{at}', label: 'Allowable bending stress number, gear', unit: 'psi', kind: 'lookup', fig: 'f9-18', auto: v => has(v, 'HBG', 'grade') ? satOf(v.HBG, v.grade) : undefined },
            { id: 'sacmP', symbol: 's_{ac}', label: 'Allowable contact stress number, pinion', unit: 'psi', kind: 'lookup', fig: 'f9-19', auto: v => has(v, 'HBP', 'grade') ? sacOf(v.HBP, v.grade) : undefined, hint: 'auto from Fig. 9-19' },
            { id: 'sacmG', symbol: 's_{ac}', label: 'Allowable contact stress number, gear', unit: 'psi', kind: 'lookup', fig: 'f9-19', auto: v => has(v, 'HBG', 'grade') ? sacOf(v.HBG, v.grade) : undefined },
          ] },
        { id: 'sf', title: 'Safety factors — PASS / FAIL', eq: '9-32, 9-33',
          formula: 'SF_{bend} = \\frac{s_{at}}{s_t}\\frac{Y_N}{K_R},\\qquad SF_{cont} = \\frac{s_{ac}}{s_c}\\frac{Z_N}{K_R}',
          text: 'Fizz step 36: verify 1.0 < SF < 1.5 (AGMA range) — higher is safe but wasteful. Contact (pitting) normally governs for long lives.',
          vars: [
            { id: 'SFbP', symbol: 'SF_{bend,P}', label: 'Bending safety factor, pinion', kind: 'calc', digits: 3, compute: v => has(v, 'satmP', 'stP', 'YNP', 'KR') ? v.satmP / v.stP * v.YNP / v.KR : undefined, work: v => v.SFbP !== undefined ? '\\(SF = \\frac{' + f(v.satmP) + '}{' + f(v.stP) + '}\\cdot\\frac{' + f(v.YNP, 4) + '}{' + f(v.KR, 3) + '} = ' + f(v.SFbP, 3) + '\\)' : null },
            { id: 'SFbG', symbol: 'SF_{bend,G}', label: 'Bending safety factor, gear', kind: 'calc', digits: 3, compute: v => has(v, 'satmG', 'stG', 'YNG', 'KR') ? v.satmG / v.stG * v.YNG / v.KR : undefined, work: v => v.SFbG !== undefined ? '\\(SF = \\frac{' + f(v.satmG) + '}{' + f(v.stG) + '}\\cdot\\frac{' + f(v.YNG, 4) + '}{' + f(v.KR, 3) + '} = ' + f(v.SFbG, 3) + '\\)' : null },
            { id: 'SFcP', symbol: 'SF_{cont,P}', label: 'Contact safety factor, pinion', kind: 'calc', digits: 3, compute: v => has(v, 'sacmP', 'sc', 'ZNP', 'KR') ? v.sacmP / v.sc * v.ZNP / v.KR : undefined, work: v => v.SFcP !== undefined ? '\\(SF = \\frac{' + f(v.sacmP) + '}{' + f(v.sc) + '}\\cdot\\frac{' + f(v.ZNP, 4) + '}{' + f(v.KR, 3) + '} = ' + f(v.SFcP, 3) + '\\)' : null },
            { id: 'SFcG', symbol: 'SF_{cont,G}', label: 'Contact safety factor, gear', kind: 'calc', digits: 3, compute: v => has(v, 'sacmG', 'sc', 'ZNG', 'KR') ? v.sacmG / v.sc * v.ZNG / v.KR : undefined, work: v => v.SFcG !== undefined ? '\\(SF = \\frac{' + f(v.sacmG) + '}{' + f(v.sc) + '}\\cdot\\frac{' + f(v.ZNG, 4) + '}{' + f(v.KR, 3) + '} = ' + f(v.SFcG, 3) + '\\)' : null },
            { id: 'Pcap', symbol: 'P_{cap}', label: 'Power capacity, bending (Fizz step 39)', unit: 'hp', kind: 'calc', compute: v => has(v, 'satmP', 'YNP', 'F', 'JP', 'nP', 'DP', 'Pd', 'SFd', 'KR', 'Ko', 'Ks', 'Km', 'KB', 'Kv') ? v.satmP * v.YNP * v.F * v.JP * v.nP * v.DP / (126000 * v.Pd * v.SFd * v.KR * v.Ko * v.Ks * v.Km * v.KB * v.Kv) : undefined, hint: 'P_cap = s_at Y_N F J n_P D_P / (126000 P_d SF K_R K_o K_s K_m K_B K_v)' },
            { id: 'Pcapc', symbol: 'P_{cap,c}', label: 'Power capacity, pitting (Fizz step 39)', unit: 'hp', kind: 'calc', compute: v => has(v, 'sacmP', 'ZNP', 'F', 'I', 'nP', 'DP', 'SFd', 'KR', 'Cp', 'Ko', 'Ks', 'Km', 'Kv') ? v.nP * v.F * v.I / (126000 * v.Ko * v.Ks * v.Km * v.Kv) * Math.pow(v.sacmP * v.DP * v.ZNP / (v.SFd * v.KR * v.Cp), 2) : undefined, hint: 'P_cap = n_P F I/(126000 K_o K_s K_m K_v) · [s_ac D_P Z_N/(SF K_R C_p)]²' },
          ],
          after: v => {
            if (!has(v, 'SFbP', 'SFbG', 'SFcP', 'SFcG')) return '<i>Enter the chosen material hardness (or s_at / s_ac) to get the safety factors.</i>';
            const d = v.SFd || 1; const mn = Math.min(v.SFbP, v.SFbG, v.SFcP, v.SFcG);
            const txt = 'Bending SF: pinion ' + f(v.SFbP, 3) + ', gear ' + f(v.SFbG, 3) + '. Contact SF: pinion ' + f(v.SFcP, 3) + ', gear ' + f(v.SFcG, 3) + '. ';
            return mn >= d ? okbad(true, 'PASS — all safety factors ≥ ' + f(d) + '. ' + txt + (mn > 1.5 ? 'Minimum ' + f(mn, 3) + ' is above the AGMA 1.0–1.5 range: the design is conservative (could use a softer/cheaper steel or smaller gears).' : 'Governing SF = ' + f(mn, 3) + ' (within AGMA 1.0–1.5).')) : okbad(false, 'FAIL — minimum SF ' + f(mn, 3) + ' < ' + f(d) + '. ' + txt + 'Use a harder/case-hardened steel, widen F, use a smaller P_d or a better quality number.');
          } },
      ] },

      { title: 'Gear train (optional) — train value', steps: [
        { id: 'train', title: 'Compound train: speed and torque chain', fig: ['f8-42', 'tv'],
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
