/* Shafts & keys — Shigley 11e Ch. 7 (DE-Goodman / DE-Gerber, Secs 7-4, 7-7) with Ch. 6 Marin factors.
 * Procedure: Fizz bible pp. 106-122 (31 steps, written for Mott's equation) mapped onto Shigley's method:
 *   torque → component forces → (FBD / shear-moment diagrams by hand) → M, T at the critical point → Kt, q, Kf → Se → d → key.
 * Mech bible unit 5 (PDF p. 130) is empty.
 * Verified against: Shigley Ex. 7-2 point I, 2nd pass (1020 CD, Sut 68 / Sy 57 kpsi, Ma = 3651, Tm = 3240 lbf·in, d = 1.625 in,
 *   Kt 1.6 / Kts 1.35, q 0.82 / qs 0.85, ke = 1, n = 1.5): ka = 0.801, kb = 0.835, Se = 22.7 kpsi, Kf = 1.49, Kfs = 1.30,
 *   sigma'a = 12 910 psi, sigma'm = 8659 psi, nf = 1.44, ny = 2.64; Shigley Ex. 7-6 key (T = 4200 lbf·in, d = 1 7/16, 3/8 sq, 1018 CD 54 kpsi, n = 1.5):
 *   F = 5843 lbf, l = 0.75 in shear, 0.87 in crushing. */
(function () {
  const KA = { 'Ground': [1.21, -0.067], 'Machined or cold-drawn': [2.00, -0.217], 'Hot-rolled': [11.0, -0.650], 'As-forged': [12.7, -0.758] };
  const KE = { 50: 1.000, 90: 0.897, 95: 0.868, 99: 0.814, 99.9: 0.753, 99.99: 0.702 };
  const KT1 = { // Table 7-1 first-iteration estimates [Kt bending, Kts torsion]
    'Shoulder fillet — sharp (r/d = 0.02)': [2.7, 2.2], 'Shoulder fillet — well rounded (r/d = 0.1)': [1.7, 1.5],
    'Profile (end-mill) keyseat (r/d = 0.02)': [2.14, 3.0], 'Sled-runner keyseat (Kts not tabulated → 3.0 used)': [1.7, 3.0], 'Retaining-ring groove': [5.0, 3.0], 'Bearing seat, press fit / plain (Kt = 1)': [1, 1], 'Chart value (enter below)': [undefined, undefined] };
  const kb = d => d === undefined ? undefined : d <= 0.3 ? 1 : d <= 2 ? Math.pow(d / 0.3, -0.107) : 0.91 * Math.pow(d, -0.157);
  const neuberB = S => 0.246 - 3.08e-3 * S + 1.51e-5 * S * S - 2.67e-8 * S * S * S;   // √a bending, Sut kpsi
  const neuberT = S => 0.190 - 2.51e-3 * S + 1.35e-5 * S * S - 2.67e-8 * S * S * S;   // √a torsion
  const AB = v => {
    if (!H.has(v, 'Kf', 'Kfs', 'Ma', 'Mm', 'Ta', 'Tm')) return undefined;
    return { A: Math.sqrt(4 * Math.pow(v.Kf * v.Ma, 2) + 3 * Math.pow(v.Kfs * v.Ta, 2)), B: Math.sqrt(4 * Math.pow(v.Kf * v.Mm, 2) + 3 * Math.pow(v.Kfs * v.Tm, 2)) };
  };
  const dGood = v => { const r = AB(v); return r && H.has(v, 'n', 'Se', 'Sut') ? Math.cbrt(16 * v.n / Math.PI * (r.A / (v.Se * 1000) + r.B / (v.Sut * 1000))) : undefined; };
  const dGerb = v => { const r = AB(v); if (!r || !H.has(v, 'n', 'Se', 'Sut') || r.A === 0) return undefined; const Se = v.Se * 1000, Sut = v.Sut * 1000; return Math.cbrt(8 * v.n * r.A / (Math.PI * Se) * (1 + Math.sqrt(1 + Math.pow(2 * r.B * Se / (r.A * Sut), 2)))); };
  const dShear = v => H.has(v, 'Kfs', 'V', 'n', 'Se') && v.V > 0 ? Math.sqrt(2.94 * v.Kfs * v.V * v.n / (v.Se * 1000)) : undefined;   // Mott 12-16 with Shigley Se (Fizz Step 17b); 2.94 = 16/(3π·0.577) already holds the shear factor
  const comp = v => v.ctype || '';

  window.TOPIC = {
    id: 'shafts_keys', book: 'shigley',
    title: 'Shafts & Keys',
    subtitle: 'Shigley Ch. 7 (DE-Goodman / DE-Gerber) + Ch. 6 Marin factors · Fizz pp. 106-122',
    sibling: 'shafts_keys_mott.html',
    intro: '<b>Section A</b> sizes the shaft at one critical point: get the torque and the gear/sheave forces (Fizz Steps 1-2), draw the FBD and shear/moment/torque diagrams by hand (Steps 3-8) and enter the resultant <i>M</i>, <i>T</i>, <i>V</i> there; ' +
      'estimate <i>K<sub>t</sub></i>, <i>K<sub>ts</sub></i> from Table 7-1 (or the A-15 charts once dimensions exist), convert to <i>K<sub>f</sub></i> with notch sensitivity, build <i>S<sub>e</sub></i> from the Marin factors, then solve DE-Goodman Eq. (7-8) (or DE-Gerber 7-12) for <i>d</i> — Shigley\'s equivalent of Fizz Step 17 / Mott Eq. 12-24. ' +
      'Re-run the point with the rounded diameter to check <i>k<sub>b</sub></i>, <i>n<sub>f</sub></i> and the yield factor <i>n<sub>y</sub></i>. Repeat for each location (left / centre / right of every component, Fizz Step 17). ' +
      '<b>Section B</b> sizes a parallel key (Table 7-6, Ex. 7-6). Units: lbf, in, kpsi, hp, rev/min. Loaded example: Shigley Ex. 7-2 point I and Ex. 7-6.',
    example: { H: 30.84, nrpm: 600, ctype: 'spur gear', Dp: 12, phi: 20, Ma: 3651, Mm: 0, Ta: 0, Tm: 3240, V: 0, mat: '1020 CD', Sut: 68, Sy: 57, surf: 'Machined or cold-drawn', dguess: 1.625, kc: 1, kd: 1, rel: 50, kf: 1, feat: 'Chart value (enter below)', Kt: 1.6, Kts: 1.35, r: 0.16, q: 0.82, qs: 0.85, n: 1.5, crit: 'DE-Goodman (Eq. 7-8)', ring: 'no', dsel: 1.625, dkey: 1.4375, Tkey: 4200, w: 0.375, hk: 0.375, Syk: 54, nk: 1.5, Lhub: 1.75, Ck: 0.005 },

    assumptions: [
      { text: 'Torque T = 63 025 H/n (Shigley Eq. 3-42; Fizz writes 63 000, Mott\'s constant); torques along the shaft must sum to zero', src: 'Fizz p.106' },
      { text: 'Pressure angle φ = 20° unless the problem states otherwise', src: 'Fizz p.42', var: 'phi' },
      { text: 'Belt tension ratio F_1/F_2 = 5 for V-belts and 3 for flat belts if not given → F_{shaft} = (2T/D)(k + 1)/(k − 1)', src: 'Fizz p.107', var: 'kb_' },
      { text: 'Keyseats are profile (end-milled) unless told otherwise — Shigley Table 7-1: K_t = 2.14, K_{ts} = 3.0 (Fizz/Mott value K_t = 2.0)', src: 'Fizz p.108 · Fizz p.109' },
      { text: 'Gears and sheaves sit against well-rounded fillets (K_t = 1.7, K_{ts} = 1.5; Fizz/Mott 1.5)', src: 'Fizz p.109' },
      { text: 'Bearing seats: well-rounded fillet on the small side, press fit at the seat (K_t = 1), sharp fillet on the large side (K_t = 2.7, K_{ts} = 2.2; Fizz/Mott 2.5); retaining-ring grooves K_t = 5.0 (Fizz/Mott 3.0) and ×1.06 on the diameter', src: 'Fizz p.109 · Fizz p.112' },
      { text: 'Wrought steel when the material is not specified (Fizz C_m = 1 — Shigley\'s Marin factors are for wrought steel, k_f = 1)', src: 'Fizz p.109', var: 'kf' },
      { text: 'Bending is the governing stress type (Fizz C_{st} = 1 ↔ Shigley load factor k_c = 1 for combined bending + torsion)', src: 'Fizz p.109', var: 'kc' },
      { text: 'Surface machined or cold drawn when not specified', src: 'Fizz p.110', var: 'surf' },
      { text: 'Reliability 99 % as the safe guess (Fizz C_R = 0.81 ↔ Shigley k_e = 0.814); Shigley Ex. 7-2 uses k_e = 1 (50 %)', src: 'Fizz p.111', var: 'rel', value: 99 },
      { text: 'First-pass size factor 0.8 (≈ 2 in shaft) until a diameter is known, then iterate (Shigley Ex. 7-2 guesses k_b = 0.9)', src: 'Fizz p.111 · Fizz p.112', var: 'kb', value: 0.8 },
      { text: 'Temperature factor k_d = 1 (room temperature) — not in the guides', src: 'Shigley Ex. 7-2', var: 'kd' },
      { text: 'Shaft design factor n = 1.5 (Shigley Ex. 7-2); the guides give no shaft value (Mott uses 2.5–3)', src: 'Shigley Ex. 7-2', var: 'n' },
      { text: 'Key material SAE 1018 (S_y = 54 kpsi), weaker than the shaft', src: 'Fizz p.119', var: 'Syk' },
      { text: 'Key design factor n = 3 if not given (Shigley Ex. 7-6 uses 1.5)', src: 'Fizz p.121', var: 'nk' },
      { text: 'Key length: over ~2 in is too long (increase the shaft diameter); 1–1.5 in is good, under 1 in best; round up to a standard size', src: 'Fizz p.122' },
      { text: 'Keyseat allowance C = +0.005 in clearance for parallel keys (−0.020 in for taper keys)', src: 'Fizz p.122', var: 'Ck' },
    ],

    figures: [
      { id: 'fig12-4', ref: 'Figure 12-4', book: 'mott', title: 'Directions of forces on mating spur gears (action on driven gear B, reaction on driver A) — Fizz Step 2a diagram', src: 'figures/mott/fig12-4.png', page: 530 },
      { id: 'fig12-6', ref: 'Figure 12-6', book: 'mott', title: 'Forces on belt sheaves: tight/slack tensions F1, F2, net torque and bending force FB = F1 + F2', src: 'figures/mott/fig12-6.png', page: 532 },
      { id: 'fig7-10', ref: 'Figure 7-10', title: 'Shaft layout of Ex. 7-2: gears, bearings, shoulders, retaining rings — the critical points to check', src: 'figures/shigley/fig7-10.png', page: 407 },
      { id: 'fig12-2', ref: 'Figure 12-2', book: 'mott', title: 'Typical shaft geometry: sharp fillets at bearing seats, well-rounded at gears, profile keyseats, retaining-ring groove (Fizz Step 9 diagram)', src: 'figures/mott/fig12-2.png', page: 529 },
      { id: 'ta-20', ref: 'Table A-20', title: 'ASTM minimum tensile & yield strengths for hot-rolled (HR) and cold-drawn (CD) steels', src: 'figures/shigley/tablea-20.png', page: 1077, note: 'Ex. 7-2 uses 1020 CD: Sut = 68, Sy = 57 kpsi.' },
      { id: 't6-2', ref: 'Table 6-2', title: 'Surface factor ka = a·Sut^b curve-fit parameters (Eq. 6-18)', src: 'figures/shigley/table6-2.png', page: 332 },
      { id: 'fig6-24', ref: 'Figure 6-24', title: 'Trends for surface factor ka vs Sut (polished, ground, machined/cold-drawn, hot-rolled, as-forged)', src: 'figures/shigley/fig6-24.png', page: 331 },
      { id: 'eq6-19', ref: 'Eq. (6-19)', title: 'Size factor kb for rotating round bars in bending / torsion (kb = 1 for d < 0.3 in and for axial loading)', src: 'figures/shigley/eq6-19.png', page: 333 },
      { id: 't6-4', ref: 'Table 6-4', title: 'Reliability factor ke (50 % → 1.000 … 99 % → 0.814)', src: 'figures/shigley/table6-4.png', page: 338 },
      { id: 't7-1', ref: 'Table 7-1', title: 'First-iteration estimates for Kt and Kts: sharp / well-rounded shoulder, end-mill keyseat, sled-runner keyseat, retaining-ring groove', src: 'figures/shigley/table7-1.png', page: 407,
        note: 'Use only until actual dimensions are known; then read Figs A-15-8/9 (shoulder), A-15-14/15 (groove) or A-15-16/17 (flat-bottom ring groove).' },
      { id: 'a15-9', ref: 'Figure A-15-9', title: 'Kt — round shaft with shoulder fillet in bending (vs r/d, D/d)', src: 'figures/shigley/figa-15-9.png', page: 1065 },
      { id: 'a15-8', ref: 'Figure A-15-8', title: 'Kts — round shaft with shoulder fillet in torsion', src: 'figures/shigley/figa-15-8.png', page: 1065 },
      { id: 'a15-14', ref: 'Figure A-15-14', title: 'Kt — grooved round bar in bending', src: 'figures/shigley/figa-15-14.png', page: 1067 },
      { id: 'a15-15', ref: 'Figure A-15-15', title: 'Kts — grooved round bar in torsion', src: 'figures/shigley/figa-15-15.png', page: 1067 },
      { id: 'a15-16', ref: 'Figure A-15-16', title: 'Kt — round shaft with flat-bottom groove (retaining ring) in bending', src: 'figures/shigley/figa-15-16.png', page: 1068 },
      { id: 'a15-17', ref: 'Figure A-15-17', title: 'Kts — round shaft with flat-bottom groove in torsion', src: 'figures/shigley/figa-15-17.png', page: 1069 },
      { id: 'fig6-26', ref: 'Figure 6-26', title: 'Notch sensitivity q for steels in reversed bending / axial vs notch radius and Sut', src: 'figures/shigley/fig6-26.png', page: 342 },
      { id: 'fig6-27', ref: 'Figure 6-27', title: 'Notch sensitivity qs in reversed torsion', src: 'figures/shigley/fig6-27.png', page: 343 },
      { id: 'ta-17', ref: 'Table A-17', title: 'Preferred sizes (fractional / decimal inches, mm) for rounding diameters and key lengths', src: 'figures/shigley/tablea-17.png', page: 1072 },
      { id: 't7-6', ref: 'Table 7-6', title: 'Inch dimensions for standard square and rectangular keys vs shaft diameter (w, h, keyway depth)', src: 'figures/shigley/table7-6.png', page: 424 },
      { id: 'fig7-17', ref: 'Figure 7-17', title: 'Gib-head key and Woodruff key', src: 'figures/shigley/fig7-17.png', page: 424 },
      { id: 'fig7-19', ref: 'Figure 7-19', title: 'Key force geometry (Ex. 7-6): F = T/r acts on the key, shear across a-b, crushing on half the face', src: 'figures/shigley/fig7-19.png', page: 427 },
      { id: 'fig11-2', ref: 'Figure 11-2', book: 'mott', title: 'Keyseat / keyway dimensions Y, S, T (Fizz Step 31 — Shigley has no equivalent)', src: 'figures/mott/fig11-2.png', page: 491 },
    ],

    sections: [
      { title: 'Section A · Shaft diameter — loads', steps: [
        { id: 'tq', title: 'Step 1 — torque from power and speed', eq: '3-42', formula: 'T = \\frac{63\\,025\\,H}{n}',
          text: 'Do this for every gear / sheave on the shaft and check that the torques sum to zero (power in = power out). Fizz writes 63 000; Shigley uses 63 025.',
          vars: [
            { id: 'H', symbol: 'H', label: 'Power at the component', unit: 'hp', kind: 'input' },
            { id: 'nrpm', symbol: 'n', label: 'Shaft speed', unit: 'rev/min', kind: 'input' },
            { id: 'T1', symbol: 'T', label: 'Torque', unit: 'lbf·in', kind: 'calc', digits: 5, compute: v => H.has(v, 'H', 'nrpm') && v.nrpm > 0 ? 63025 * v.H / v.nrpm : undefined,
              work: v => v.T1 !== undefined ? '\\(T = \\dfrac{63\\,025(' + H.fmt(v.H) + ')}{' + H.fmt(v.nrpm) + '} = ' + H.fmt(v.T1, 5) + '\\text{ lbf·in}\\)' : null },
          ] },
        { id: 'forces', title: 'Step 2 — forces from the component', fig: ['fig12-4', 'fig12-6'],
          formula: 'W_t = \\frac{2T}{D} \\qquad W_r = W_t\\tan\\phi\\ \\text{(spur)},\\ W_t\\frac{\\tan\\phi_n}{\\cos\\psi}\\ \\text{(helical)},\\ W_t\\tan\\phi\\cos\\gamma\\ \\text{(bevel)} \\qquad W_x = W_t\\tan\\psi\\ \\text{(helical)},\\ W_t\\tan\\phi\\sin\\gamma\\ \\text{(bevel)} \\qquad F_{shaft} = \\frac{2T}{D}\\frac{k+1}{k-1}\\ \\text{(belts)}',
          text: 'Fizz Step 2: chain sprockets load the shaft with 2T/D; V-belts with tension ratio k = 5 (F<sub>shaft</sub> = 1.5·2T/D) and flat belts with k = 3 (2.0·2T/D) unless given. Worm gears: use the worm calculator. Resolve each force into x and y before the FBD.',
          vars: [
            { id: 'ctype', label: 'Component', kind: 'choice', type: 'text', default: 'spur gear', options: ['spur gear', 'helical gear', 'bevel gear', 'chain sprocket', 'V-belt sheave', 'flat-belt pulley'] },
            { id: 'Dp', symbol: 'D', label: 'Pitch diameter', unit: 'in', kind: 'input' },
            { id: 'phi', symbol: '\\phi', label: 'Pressure angle (spur/bevel) or normal pressure angle φn (helical)', unit: '°', kind: 'input', default: 20 },
            { id: 'psi', symbol: '\\psi', label: 'Helix angle (helical only)', unit: '°', kind: 'input' },
            { id: 'gam', symbol: '\\gamma', label: 'Pitch cone angle of this gear (bevel only)', unit: '°', kind: 'input' },
            { id: 'kb_', symbol: 'k', label: 'Belt tension ratio F1/F2 (belts only)', unit: '', kind: 'input', auto: v => /V-belt/.test(comp(v)) ? 5 : /flat/.test(comp(v)) ? 3 : undefined },
            { id: 'Wt', symbol: 'W_t', label: 'Tangential force (or 2T/D)', unit: 'lbf', kind: 'calc', digits: 4, compute: v => H.has(v, 'T1', 'Dp') && v.Dp > 0 ? 2 * v.T1 / v.Dp : undefined,
              work: v => v.Wt !== undefined ? '\\(W_t = \\dfrac{2(' + H.fmt(v.T1, 5) + ')}{' + H.fmt(v.Dp) + '} = ' + H.fmt(v.Wt) + '\\text{ lbf}\\)' : null },
            { id: 'Wr', symbol: 'W_r', label: 'Radial force', unit: 'lbf', kind: 'calc', digits: 4, compute: v => {
              if (v.Wt === undefined || !H.has(v, 'phi')) return undefined; const c = comp(v);
              if (c === 'spur gear') return v.Wt * Math.tan(H.rad(v.phi));
              if (c === 'helical gear') return H.has(v, 'psi') ? v.Wt * Math.tan(H.rad(v.phi)) / Math.cos(H.rad(v.psi)) : undefined;
              if (c === 'bevel gear') return H.has(v, 'gam') ? v.Wt * Math.tan(H.rad(v.phi)) * Math.cos(H.rad(v.gam)) : undefined;
              return undefined; } },
            { id: 'Wx', symbol: 'W_x', label: 'Axial force (helical / bevel)', unit: 'lbf', kind: 'calc', digits: 4, compute: v => {
              if (v.Wt === undefined) return undefined; const c = comp(v);
              if (c === 'helical gear') return H.has(v, 'psi') ? v.Wt * Math.tan(H.rad(v.psi)) : undefined;
              if (c === 'bevel gear') return H.has(v, 'phi', 'gam') ? v.Wt * Math.tan(H.rad(v.phi)) * Math.sin(H.rad(v.gam)) : undefined;
              return undefined; } },
            { id: 'Fsh', symbol: 'F_{shaft}', label: 'Bending force on shaft (chain / belt)', unit: 'lbf', kind: 'calc', digits: 4, compute: v => {
              if (v.Wt === undefined) return undefined; const c = comp(v);
              if (c === 'chain sprocket') return v.Wt;
              if (/belt/.test(c)) return H.has(v, 'kb_') && v.kb_ > 1 ? v.Wt * (v.kb_ + 1) / (v.kb_ - 1) : undefined;
              return undefined; } },
          ] },
        { id: 'pt', title: 'Steps 3–8 — loads at the critical point (from your FBD and diagrams)', fig: ['fig7-10'],
          formula: 'M = \\sqrt{M_x^2 + M_y^2} \\qquad V = \\sqrt{V_x^2 + V_y^2}',
          text: 'Draw the FBD, solve ΣF = 0, ΣM = 0 for the bearing reactions, draw shear and moment diagrams in both planes and the torque diagram (torque changes only at gears, not bearings). ' +
            'For a rotating shaft with steady torque and steady transverse loads: <i>M<sub>a</sub></i> = resultant bending moment (completely reversed), <i>M<sub>m</sub></i> = 0, <i>T<sub>m</sub></i> = torque, <i>T<sub>a</sub></i> = 0. Enter the resultants at the point you are sizing.',
          vars: [
            { id: 'Mx', symbol: 'M_x', label: 'Bending moment, plane 1', unit: 'lbf·in', kind: 'input', hint: 'optional helper' },
            { id: 'My', symbol: 'M_y', label: 'Bending moment, plane 2', unit: 'lbf·in', kind: 'input', hint: 'optional helper' },
            { id: 'Ma', symbol: 'M_a', label: 'Alternating bending moment', unit: 'lbf·in', kind: 'input', auto: v => H.has(v, 'Mx', 'My') ? Math.hypot(v.Mx, v.My) : undefined, hint: 'auto = √(Mx²+My²)' },
            { id: 'Mm', symbol: 'M_m', label: 'Mean bending moment', unit: 'lbf·in', kind: 'input', default: 0 },
            { id: 'Tm', symbol: 'T_m', label: 'Mean (steady) torque', unit: 'lbf·in', kind: 'input', auto: v => v.T1 },
            { id: 'Ta', symbol: 'T_a', label: 'Alternating torque', unit: 'lbf·in', kind: 'input', default: 0 },
            { id: 'V', symbol: 'V', label: 'Resultant shear force (for the shear-only check at bearings)', unit: 'lbf', kind: 'input', default: 0 },
          ] },
      ] },

      { title: 'Section A · Strength', steps: [
        { id: 'mat', title: 'Step 10 — shaft material', eq: '6-10', fig: ['ta-20'], formula: "S'_e = 0.5\\,S_{ut}\\ (S_{ut} \\le 200\\ \\text{kpsi}),\\quad 100\\ \\text{kpsi otherwise}",
          vars: [
            { id: 'mat', label: 'Material', kind: 'input', type: 'text', hint: 'e.g. 1020 CD, 1045 HR' },
            { id: 'Sut', symbol: 'S_{ut}', label: 'Tensile strength', unit: 'kpsi', kind: 'lookup', fig: 'ta-20' },
            { id: 'Sy', symbol: 'S_y', label: 'Yield strength', unit: 'kpsi', kind: 'lookup', fig: 'ta-20' },
            { id: 'Sep', symbol: "S'_e", label: 'Rotating-beam endurance limit', unit: 'kpsi', kind: 'calc', digits: 4, compute: v => v.Sut !== undefined ? (v.Sut <= 200 ? 0.5 * v.Sut : 100) : undefined },
          ] },
        { id: 'marin', title: 'Steps 11–16 — Marin factors and Se', eq: '6-17', fig: ['t6-2', 'fig6-24', 'eq6-19', 't6-4'],
          formula: 'S_e = k_a k_b k_c k_d k_e k_f\\, S\'_e \\qquad k_a = a S_{ut}^{\\,b} \\qquad k_b = (d/0.3)^{-0.107}\\ (0.3 \\le d \\le 2\\ \\text{in}),\\ 0.91 d^{-0.157}\\ (2 < d \\le 10)',
          text: 'Fizz\'s <i>s<sub>n</sub></i> graph + C<sub>m</sub>, C<sub>st</sub>, C<sub>R</sub>, C<sub>s</sub> are Shigley\'s k<sub>a</sub> … k<sub>e</sub>. Size factor needs a diameter you do not have yet: Fizz guesses 0.8 (≈ 2 in, pre-filled; Ex. 7-2 guesses k<sub>b</sub> = 0.9) — come back once <i>d</i> is known. Fizz\'s safe reliability guess is 99 % (k<sub>e</sub> = 0.814; Ex. 7-2 uses 1). k<sub>c</sub> = 1 for combined bending + torsion, k<sub>d</sub> = 1 at room temperature, k<sub>f</sub> = 1.',
          vars: [
            { id: 'surf', label: 'Surface finish', kind: 'choice', type: 'text', default: 'Machined or cold-drawn', options: Object.keys(KA) },
            { id: 'ka', symbol: 'k_a', label: 'Surface factor', unit: '', kind: 'lookup', fig: 't6-2', auto: v => H.has(v, 'Sut') && KA[v.surf] ? KA[v.surf][0] * Math.pow(v.Sut, KA[v.surf][1]) : undefined,
              work: v => H.has(v, 'Sut') && KA[v.surf] ? '\\(k_a = ' + KA[v.surf][0] + '(' + H.fmt(v.Sut) + ')^{' + KA[v.surf][1] + '} = ' + H.fmt(KA[v.surf][0] * Math.pow(v.Sut, KA[v.surf][1])) + '\\)' : null },
            { id: 'dguess', symbol: 'd_{guess}', label: 'Trial diameter for kb', unit: 'in', kind: 'input', hint: 'leave blank to use kb = 0.8 (Fizz first guess, ≈ 2 in)' },
            { id: 'kb', symbol: 'k_b', label: 'Size factor', unit: '', kind: 'lookup', fig: 'eq6-19', auto: v => v.dguess !== undefined ? kb(v.dguess) : 0.8,
              work: v => v.dguess !== undefined ? (v.dguess <= 2 ? '\\(k_b = (' + H.fmt(v.dguess) + '/0.3)^{-0.107} = ' : '\\(k_b = 0.91(' + H.fmt(v.dguess) + ')^{-0.157} = ') + H.fmt(kb(v.dguess)) + '\\)' : null },
            { id: 'kc', symbol: 'k_c', label: 'Load factor (1 for combined loading)', unit: '', kind: 'input', default: 1 },
            { id: 'kd', symbol: 'k_d', label: 'Temperature factor', unit: '', kind: 'input', default: 1 },
            { id: 'rel', label: 'Reliability for ke', kind: 'choice', default: 99, options: [{ label: '50 % (ke = 1.000)', value: 50 }, { label: '90 % (0.897)', value: 90 }, { label: '95 % (0.868)', value: 95 }, { label: '99 % (0.814)', value: 99 }, { label: '99.9 % (0.753)', value: 99.9 }, { label: '99.99 % (0.702)', value: 99.99 }] },
            { id: 'ke', symbol: 'k_e', label: 'Reliability factor', unit: '', kind: 'lookup', fig: 't6-4', auto: v => KE[v.rel] },
            { id: 'kf', symbol: 'k_f', label: 'Miscellaneous-effects factor', unit: '', kind: 'input', default: 1 },
            { id: 'Se', symbol: 'S_e', label: 'Endurance limit at the critical point', unit: 'kpsi', kind: 'calc', digits: 4, compute: v => H.has(v, 'ka', 'kb', 'kc', 'kd', 'ke', 'kf', 'Sep') ? v.ka * v.kb * v.kc * v.kd * v.ke * v.kf * v.Sep : undefined,
              work: v => v.Se !== undefined ? '\\(S_e = ' + H.fmt(v.ka) + '(' + H.fmt(v.kb) + ')(' + H.fmt(v.kc) + ')(' + H.fmt(v.kd) + ')(' + H.fmt(v.ke) + ')(' + H.fmt(v.kf) + ')(' + H.fmt(v.Sep) + ') = ' + H.fmt(v.Se) + '\\text{ kpsi}\\)' : null },
          ] },
        { id: 'kt', title: 'Step 9 — stress concentration and fatigue factors', eq: '6-32', fig: ['t7-1', 'fig12-2', 'a15-9', 'a15-8', 'a15-14', 'a15-15', 'a15-16', 'a15-17', 'fig6-26', 'fig6-27'],
          formula: 'K_f = 1 + q(K_t - 1) \\qquad K_{fs} = 1 + q_s(K_{ts} - 1) \\qquad q = \\frac{1}{1 + \\sqrt{a}/\\sqrt{r}}',
          text: 'Fizz Step 9 values (keyseat 2.0 / 1.6, sharp fillet 2.5, rounded 1.5, bearing seat 1.0, retaining ring 3.0) are Mott\'s; Shigley\'s first-iteration set is Table 7-1. Fizz rules for <i>where</i>: keyseats are profile unless told otherwise; gears / sheaves sit on well-rounded fillets; a bearing has a well-rounded fillet on its small side, a press fit (K<sub>t</sub> = 1) at the seat and a sharp fillet on its large side; retaining rings sit on the small side of gears. With the first pass take <i>K<sub>f</sub> = K<sub>t</sub></i> (conservative, Ex. 7-2). ' +
            'Once <i>d</i>, <i>D</i> and <i>r</i> are known read <i>K<sub>t</sub></i> from the A-15 charts and <i>q</i> from Fig 6-26/6-27 (auto: Neuber Eqs 6-35/6-36 from <i>r</i> and <i>S<sub>ut</sub></i>).',
          vars: [
            { id: 'feat', label: 'Feature at this point', kind: 'choice', type: 'text', default: 'Profile (end-mill) keyseat (r/d = 0.02)', options: Object.keys(KT1) },
            { id: 'Kt', symbol: 'K_t', label: 'Bending stress-concentration factor', unit: '', kind: 'lookup', fig: 't7-1', auto: v => KT1[v.feat] ? KT1[v.feat][0] : undefined },
            { id: 'Kts', symbol: 'K_{ts}', label: 'Torsional stress-concentration factor', unit: '', kind: 'lookup', fig: 't7-1', auto: v => KT1[v.feat] ? KT1[v.feat][1] : undefined },
            { id: 'r', symbol: 'r', label: 'Notch (fillet) radius, if known', unit: 'in', kind: 'input', hint: 'blank → q = qs = 1 (Kf = Kt)' },
            { id: 'q', symbol: 'q', label: 'Notch sensitivity, bending', unit: '', kind: 'lookup', fig: 'fig6-26', auto: v => H.has(v, 'r', 'Sut') && v.r > 0 ? 1 / (1 + neuberB(v.Sut) / Math.sqrt(v.r)) : 1 },
            { id: 'qs', symbol: 'q_s', label: 'Notch sensitivity, torsion', unit: '', kind: 'lookup', fig: 'fig6-27', auto: v => H.has(v, 'r', 'Sut') && v.r > 0 ? 1 / (1 + neuberT(v.Sut) / Math.sqrt(v.r)) : 1 },
            { id: 'Kf', symbol: 'K_f', label: 'Fatigue stress-concentration factor, bending', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'Kt', 'q') ? 1 + v.q * (v.Kt - 1) : undefined,
              work: v => v.Kf !== undefined ? '\\(K_f = 1 + ' + H.fmt(v.q) + '(' + H.fmt(v.Kt) + ' - 1) = ' + H.fmt(v.Kf) + '\\)' : null },
            { id: 'Kfs', symbol: 'K_{fs}', label: 'Fatigue stress-concentration factor, torsion', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'Kts', 'qs') ? 1 + v.qs * (v.Kts - 1) : undefined,
              work: v => v.Kfs !== undefined ? '\\(K_{fs} = 1 + ' + H.fmt(v.qs) + '(' + H.fmt(v.Kts) + ' - 1) = ' + H.fmt(v.Kfs) + '\\)' : null },
          ] },
      ] },

      { title: 'Section A · Diameter', steps: [
        { id: 'dia', title: 'Step 17 — minimum diameter at the point', eq: '7-6 / 7-8 / 7-12', fig: ['ta-17'],
          formula: 'A = \\sqrt{4(K_f M_a)^2 + 3(K_{fs}T_a)^2},\\quad B = \\sqrt{4(K_f M_m)^2 + 3(K_{fs}T_m)^2} \\qquad d_{Goodman} = \\left[\\frac{16n}{\\pi}\\left(\\frac{A}{S_e} + \\frac{B}{S_{ut}}\\right)\\right]^{1/3} \\qquad d_{Gerber} = \\left(\\frac{8nA}{\\pi S_e}\\left\\{1 + \\left[1 + \\left(\\frac{2BS_e}{AS_{ut}}\\right)^2\\right]^{1/2}\\right\\}\\right)^{1/3}',
          text: 'DE-Goodman is conservative and the usual first choice; DE-Gerber fits the data better. Where only shear exists (bearing seats with no torque, Fizz Step 17b) the shear-only estimate <i>d = √(2.94 K<sub>fs</sub> V n / S<sub>e</sub>)</i> (Mott Eq. 12-16 form — the 2.94 = 16/(3π·0.577) already contains the distortion-energy shear factor) is shown too. ' +
            'Retaining-ring grooves: Fizz Step 18 multiplies the result by 1.06 (groove depth). Round to a preferred size (Table A-17); Ex. 7-2 rounded 1.69 <i>down</i> to 1.625 because the estimates were conservative, then re-checked.',
          vars: [
            { id: 'n', symbol: 'n', label: 'Design factor', unit: '', kind: 'input', default: 1.5, hint: 'Shigley Ex. 7-2 uses 1.5; Mott uses 2.5–3 (no guide value)' },
            { id: 'crit', label: 'Criterion', kind: 'choice', type: 'text', default: 'DE-Goodman (Eq. 7-8)', options: ['DE-Goodman (Eq. 7-8)', 'DE-Gerber (Eq. 7-12)'] },
            { id: 'A', symbol: 'A', label: 'Alternating term', unit: 'lbf·in', kind: 'calc', digits: 5, compute: v => { const r = AB(v); return r && r.A; } },
            { id: 'B', symbol: 'B', label: 'Mean term', unit: 'lbf·in', kind: 'calc', digits: 5, compute: v => { const r = AB(v); return r && r.B; } },
            { id: 'dG', symbol: 'd_{Goodman}', label: 'DE-Goodman diameter', unit: 'in', kind: 'calc', digits: 4, compute: dGood,
              work: v => v.dG !== undefined ? '\\(d = \\left[\\dfrac{16(' + H.fmt(v.n) + ')}{\\pi}\\left(\\dfrac{' + H.fmt(v.A, 5) + '}{' + H.fmt(v.Se * 1000, 5) + '} + \\dfrac{' + H.fmt(v.B, 5) + '}{' + H.fmt(v.Sut * 1000, 5) + '}\\right)\\right]^{1/3} = ' + H.fmt(v.dG) + '\\text{ in}\\)' : null },
            { id: 'dGb', symbol: 'd_{Gerber}', label: 'DE-Gerber diameter', unit: 'in', kind: 'calc', digits: 4, compute: dGerb },
            { id: 'dV', symbol: 'd_{shear}', label: 'Shear-only diameter (if V given)', unit: 'in', kind: 'calc', digits: 4, compute: dShear },
            { id: 'ring', label: 'Retaining-ring groove here?', kind: 'choice', type: 'text', default: 'no', options: ['no', 'yes (×1.06)'] },
            { id: 'dmin', symbol: 'd_{min}', label: 'Governing minimum diameter', unit: 'in', kind: 'calc', digits: 4, compute: v => {
              let d = v.crit === 'DE-Gerber (Eq. 7-12)' ? v.dGb : v.dG; if (d === undefined) return undefined;
              if (v.dV !== undefined && v.dV > d) d = v.dV; if (/yes/.test(v.ring || '')) d *= 1.06; return d; } },
            { id: 'dsel', symbol: 'd', label: 'Selected (preferred-size) diameter', unit: 'in', kind: 'lookup', fig: 'ta-17', hint: 'round to Table A-17; keep ≥ bearing bore at bearing seats' },
          ],
          after: v => v.dmin === undefined ? '' : '<span class="result-ok">d<sub>min</sub> = ' + H.fmt(v.dmin) + ' in at this point' + (v.dsel !== undefined ? (v.dsel >= v.dmin ? ' → selected ' + H.fmt(v.dsel) + ' in ✔' : ' → selected ' + H.fmt(v.dsel) + ' in is smaller; verify n<sub>f</sub> below (Ex. 7-2 accepts this if n<sub>f</sub> ≥ required)') : '') + '</span>' },
        { id: 'chk', title: 'Steps 19–20 — check the selected diameter (2nd iteration)', eq: '7-4 / 7-5 / 7-7 / 7-16', fig: ['eq6-19', 'a15-9', 'a15-8', 'fig6-26'],
          formula: "\\sigma'_a = \\frac{32K_f M_a}{\\pi d^3} \\qquad \\sigma'_m = \\sqrt{3}\\,\\frac{16K_{fs}T_m}{\\pi d^3} \\qquad \\frac{1}{n_f} = \\frac{\\sigma'_a}{S_e} + \\frac{\\sigma'_m}{S_{ut}} \\qquad n_y = \\frac{S_y}{\\sigma'_a + \\sigma'_m}",
          text: 'With <i>d</i> chosen: update <i>k<sub>b</sub></i> (auto from the selected <i>d</i>), re-read <i>K<sub>t</sub></i> with the real <i>r/d</i> and <i>D/d</i>, then compute the fatigue and (conservative) yield factors of safety. If <i>n<sub>f</sub></i> &lt; required, go up one preferred size.',
          vars: [
            { id: 'kb2', symbol: 'k_b', label: 'Size factor at selected d', unit: '', kind: 'lookup', fig: 'eq6-19', auto: v => kb(v.dsel) },
            { id: 'Se2', symbol: 'S_e', label: 'Endurance limit with updated kb', unit: 'kpsi', kind: 'calc', digits: 4, compute: v => H.has(v, 'ka', 'kb2', 'kc', 'kd', 'ke', 'kf', 'Sep') ? v.ka * v.kb2 * v.kc * v.kd * v.ke * v.kf * v.Sep : undefined },
            { id: 'sa', symbol: "\\sigma'_a", label: 'Alternating von Mises stress', unit: 'psi', kind: 'calc', digits: 5, compute: v => H.has(v, 'Kf', 'Kfs', 'Ma', 'Ta', 'dsel') && v.dsel > 0 ? Math.sqrt(Math.pow(32 * v.Kf * v.Ma / (Math.PI * Math.pow(v.dsel, 3)), 2) + 3 * Math.pow(16 * v.Kfs * v.Ta / (Math.PI * Math.pow(v.dsel, 3)), 2)) : undefined,
              work: v => v.sa !== undefined && v.Ta === 0 ? "\\(\\sigma'_a = \\dfrac{32(" + H.fmt(v.Kf) + ')(' + H.fmt(v.Ma) + ')}{\\pi(' + H.fmt(v.dsel) + ')^3} = ' + H.fmt(v.sa, 5) + '\\text{ psi}\\)' : null },
            { id: 'sm', symbol: "\\sigma'_m", label: 'Mean von Mises stress', unit: 'psi', kind: 'calc', digits: 5, compute: v => H.has(v, 'Kf', 'Kfs', 'Mm', 'Tm', 'dsel') && v.dsel > 0 ? Math.sqrt(Math.pow(32 * v.Kf * v.Mm / (Math.PI * Math.pow(v.dsel, 3)), 2) + 3 * Math.pow(16 * v.Kfs * v.Tm / (Math.PI * Math.pow(v.dsel, 3)), 2)) : undefined,
              work: v => v.sm !== undefined && v.Mm === 0 ? "\\(\\sigma'_m = \\sqrt{3}\\dfrac{16(" + H.fmt(v.Kfs) + ')(' + H.fmt(v.Tm) + ')}{\\pi(' + H.fmt(v.dsel) + ')^3} = ' + H.fmt(v.sm, 5) + '\\text{ psi}\\)' : null },
            { id: 'nf', symbol: 'n_f', label: 'Fatigue factor of safety (DE-Goodman)', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'sa', 'sm', 'Se2', 'Sut') ? 1 / (v.sa / (v.Se2 * 1000) + v.sm / (v.Sut * 1000)) : undefined,
              work: v => v.nf !== undefined ? '\\(\\dfrac{1}{n_f} = \\dfrac{' + H.fmt(v.sa, 5) + '}{' + H.fmt(v.Se2 * 1000, 5) + '} + \\dfrac{' + H.fmt(v.sm, 5) + '}{' + H.fmt(v.Sut * 1000, 5) + '} \\Rightarrow n_f = ' + H.fmt(v.nf, 3) + '\\)' : null },
            { id: 'nfG', symbol: 'n_f', label: 'Fatigue factor of safety (DE-Gerber)', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'sa', 'sm', 'Se2', 'Sut') && v.sa > 0 ? (() => { const Se = v.Se2 * 1000, Sut = v.Sut * 1000; return 0.5 * Math.pow(Sut / v.sm, 2) * (v.sa / Se) * (-1 + Math.sqrt(1 + Math.pow(2 * v.sm * Se / (Sut * v.sa), 2))); })() : undefined },
            { id: 'ny', symbol: 'n_y', label: 'Yield factor of safety (conservative)', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'sa', 'sm', 'Sy') && (v.sa + v.sm) > 0 ? v.Sy * 1000 / (v.sa + v.sm) : undefined },
          ],
          after: v => !H.has(v, 'nf', 'ny', 'n') ? '' : (v.nf >= v.n && v.ny >= v.n) ? '<span class="result-ok">d = ' + H.fmt(v.dsel) + ' in: n<sub>f</sub> = ' + H.fmt(v.nf, 3) + ' and n<sub>y</sub> = ' + H.fmt(v.ny, 3) + ' both ≥ ' + H.fmt(v.n) + ' ✔ — repeat Section A at the next critical point.</span>' : '<span class="result-bad">n<sub>f</sub> = ' + H.fmt(v.nf, 3) + ', n<sub>y</sub> = ' + H.fmt(v.ny, 3) + ' — below the required ' + H.fmt(v.n) + '; choose the next preferred size up.</span>' },
      ] },

      { title: 'Section B · Key design', steps: [
        { id: 'ksize', title: 'Steps 26–27 — key size and material', fig: ['t7-6', 'fig7-17', 'ta-20'],
          text: 'Key width ≈ d/4 (Table 7-6 gives w, h vs shaft diameter; above the horizontal line in Mott\'s table keys are square). Choose a key material weaker than the shaft so the key fails first — low-carbon 1018 CD (S<sub>y</sub> = 54 kpsi) is standard (Ex. 7-6). Design factor: Shigley Ex. 7-6 uses 1.5; Fizz / Mott default 3.',
          vars: [
            { id: 'dkey', symbol: 'd', label: 'Shaft diameter at the hub', unit: 'in', kind: 'input', auto: v => v.dsel },
            { id: 'Tkey', symbol: 'T', label: 'Torque transmitted through the key', unit: 'lbf·in', kind: 'input', auto: v => v.T1 },
            { id: 'w', symbol: 'w', label: 'Key width', unit: 'in', kind: 'lookup', fig: 't7-6' },
            { id: 'hk', symbol: 'h', label: 'Key height', unit: 'in', kind: 'lookup', fig: 't7-6', auto: v => v.w, hint: 'square key: h = w' },
            { id: 'Syk', symbol: 'S_y', label: 'Yield strength of the weakest of key / shaft / hub', unit: 'kpsi', kind: 'lookup', fig: 'ta-20', default: 54 },
            { id: 'nk', symbol: 'n', label: 'Design factor for the key', unit: '', kind: 'input', default: 3 },
            { id: 'Lhub', symbol: 'L_{hub}', label: 'Hub length (if known)', unit: 'in', kind: 'input' },
          ] },
        { id: 'klen', title: 'Step 28 — required key length', fig: ['fig7-19'],
          formula: 'F = \\frac{2T}{d} \\qquad l_{shear} = \\frac{F\\,n}{0.577\\,S_y\\, w} \\qquad l_{crush} = \\frac{2F\\,n}{S_y\\, h} \\qquad \\left(= \\frac{4Tn}{d\\,w\\,S_y}\\ \\text{for a square key, Fizz 28a}\\right)',
          text: 'Shear across the key (distortion-energy S<sub>sy</sub> = 0.577S<sub>y</sub>) and crushing on half the key face (Ex. 7-6). Crushing normally governs; the larger length is required. Fizz Step 29: keep it under ~2 in (ideally ≤ 1–1.5 in), else increase the shaft diameter or use a stronger key.',
          vars: [
            { id: 'Fk', symbol: 'F', label: 'Force on key', unit: 'lbf', kind: 'calc', digits: 4, compute: v => H.has(v, 'Tkey', 'dkey') && v.dkey > 0 ? 2 * v.Tkey / v.dkey : undefined,
              work: v => v.Fk !== undefined ? '\\(F = \\dfrac{' + H.fmt(v.Tkey, 5) + '}{' + H.fmt(v.dkey) + '/2} = ' + H.fmt(v.Fk) + '\\text{ lbf}\\)' : null },
            { id: 'lsh', symbol: 'l_{shear}', label: 'Length for shear', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'Fk', 'nk', 'Syk', 'w') && v.w > 0 ? v.Fk * v.nk / (0.577 * v.Syk * 1000 * v.w) : undefined,
              work: v => v.lsh !== undefined ? '\\(\\dfrac{0.577(' + H.fmt(v.Syk) + ')10^3}{' + H.fmt(v.nk) + '} = \\dfrac{' + H.fmt(v.Fk) + '}{' + H.fmt(v.w) + '\\,l} \\Rightarrow l = ' + H.fmt(v.lsh) + '\\text{ in}\\)' : null },
            { id: 'lcr', symbol: 'l_{crush}', label: 'Length for crushing', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'Fk', 'nk', 'Syk', 'hk') && v.hk > 0 ? 2 * v.Fk * v.nk / (v.Syk * 1000 * v.hk) : undefined,
              work: v => v.lcr !== undefined ? '\\(\\dfrac{' + H.fmt(v.Syk) + '\\times10^3}{' + H.fmt(v.nk) + '} = \\dfrac{' + H.fmt(v.Fk) + '}{' + H.fmt(v.hk) + '\\,l/2} \\Rightarrow l = ' + H.fmt(v.lcr) + '\\text{ in}\\)' : null },
            { id: 'lmin', symbol: 'l_{min}', label: 'Required length (larger)', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'lsh', 'lcr') ? Math.max(v.lsh, v.lcr) : undefined },
            { id: 'lsel', symbol: 'l', label: 'Specified key length (preferred size)', unit: 'in', kind: 'lookup', fig: 'ta-17', hint: 'round up, Table A-17; ≤ hub length, clear of fillets/grooves',
              check: v => (H.has(v, 'lsel', 'lmin') && v.lsel < v.lmin) ? 'Shorter than required' : (H.has(v, 'lsel', 'Lhub') && v.lsel > v.Lhub) ? 'Longer than the hub' : null },
          ],
          after: v => v.lmin === undefined ? '' : (v.lmin > 2 ? '<span class="result-bad">l<sub>min</sub> = ' + H.fmt(v.lmin) + ' in is large (&gt; 2 in) — consider a bigger shaft diameter, two keys, or a stronger key material.</span>' : '<span class="result-ok">Key ' + H.fmt(v.w) + ' × ' + H.fmt(v.hk) + ' in, l<sub>min</sub> = ' + H.fmt(v.lmin) + ' in (' + (v.lcr >= v.lsh ? 'crushing' : 'shear') + ' governs)' + (v.lsel !== undefined ? ' → specify l = ' + H.fmt(v.lsel) + ' in' : '') + ' ✔</span>') },
        { id: 'kseat', title: 'Step 31 — keyseat and keyway depths (Mott Fig. 11-2)', fig: ['fig11-2', 't7-6'],
          formula: 'Y = \\frac{d - \\sqrt{d^2 - w^2}}{2} \\qquad S = \\frac{d - h + \\sqrt{d^2 - w^2}}{2} \\qquad T_{hub} = \\frac{d + h + \\sqrt{d^2 - w^2}}{2} + C',
          text: 'Shigley tabulates only the keyway depth (h/2) in Table 7-6; the Fizz bible wants the machining dimensions S (shaft) and T (hub) with allowance C = +0.005 in for parallel keys, −0.020 in for taper keys.',
          vars: [
            { id: 'Ck', symbol: 'C', label: 'Allowance', unit: 'in', kind: 'choice', default: 0.005, options: [{ label: '+0.005 parallel key', value: 0.005 }, { label: '−0.020 taper key', value: -0.02 }] },
            { id: 'Y', symbol: 'Y', label: 'Chordal height', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'dkey', 'w') && v.dkey > v.w ? (v.dkey - Math.sqrt(v.dkey * v.dkey - v.w * v.w)) / 2 : undefined },
            { id: 'Sk', symbol: 'S', label: 'Shaft keyseat dimension', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'dkey', 'w', 'hk') && v.dkey > v.w ? (v.dkey - v.hk + Math.sqrt(v.dkey * v.dkey - v.w * v.w)) / 2 : undefined },
            { id: 'Tk', symbol: 'T', label: 'Hub keyway dimension', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'dkey', 'w', 'hk', 'Ck') && v.dkey > v.w ? (v.dkey + v.hk + Math.sqrt(v.dkey * v.dkey - v.w * v.w)) / 2 + v.Ck : undefined },
          ] },
      ] },
    ],
  };
})();
