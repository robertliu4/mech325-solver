/* Shafts & keys — Mott 6e Ch. 12 (Eq. 12-24 / 12-16) with Ch. 5 endurance factors and Ch. 11 keys.
 * Procedure: Fizz bible pp. 106-122 (31 steps) — this is the bible's native method. Mech bible unit 5 (PDF p. 130) is empty.
 * Verified against: Mott Design Example 12-1, point C left (SAE 1144 OQT 1000: su 118, sy 83 ksi, sn = 42 ksi, Cs = 0.75, CR = 0.81, N = 2,
 *   Mx = 12 230, My = 16 800 -> M = 20 780 lb·in, T = 21 000 lb·in, profile keyseat Kt = 2.0): s'n = 25.5 ksi, D = 3.22 in, specified 4.000 in;
 *   Mott Example Problem 11-1 key (D = 2.00 in, T = 2965 lb·in, 1/2 sq SAE 1018, N = 3): L = 0.659 in -> 1.50 in, S = 1.718 in, T = 2.223 in. */
(function () {
  const CM = { 'Wrought steel': 1.00, 'Cast steel': 0.80, 'Powdered steel': 0.76, 'Malleable cast iron': 0.80, 'Gray cast iron': 0.70, 'Ductile cast iron': 0.66 };
  const CR = { 0.5: 1.0, 0.9: 0.90, 0.99: 0.81, 0.999: 0.75 };
  const KT = { 'Profile keyseat': 2.0, 'Sled-runner keyseat': 1.6, 'Shoulder fillet — sharp (bearing seat side)': 2.5, 'Shoulder fillet — well rounded (gear / sheave)': 1.5, 'Bearing seat (press fit)': 1.0, 'Retaining-ring groove': 3.0, 'Plain shaft': 1.0 };
  // Fig 5-11 estimate: Shigley surface fits × 0.5 su (close to Mott's curves) — a placeholder until the chart is read
  const SN = { 'Machined or cold drawn': [2.00, -0.217], 'Ground': [1.21, -0.067], 'Polished': [1.0, 0], 'As-rolled / hot-rolled': [11.0, -0.650], 'As-forged': [12.7, -0.758] };
  const Cs = D => D === undefined ? undefined : D <= 0.3 ? 1 : D <= 2 ? Math.pow(D / 0.3, -0.11) : D < 10 ? 0.859 - 0.02125 * D : undefined;
  const comp = v => v.ctype || '';
  const D24 = (v, Kt, M, T) => H.has(v, 'N', 'snp', 'sy') && M !== undefined && T !== undefined && v.snp > 0 && v.sy > 0 ? Math.cbrt(32 * v.N / Math.PI * Math.sqrt(Math.pow(Kt * M / (v.snp * 1000), 2) + 0.75 * Math.pow(T / (v.sy * 1000), 2))) : undefined;

  window.TOPIC = {
    id: 'shafts_keys', book: 'mott',
    title: 'Shafts & Keys',
    subtitle: 'Mott Ch. 12 Eq. 12-24 + Ch. 5 factors + Ch. 11 keys · Fizz pp. 106-122 (31 steps)',
    sibling: 'shafts_keys_shigley.html',
    intro: '<b>Section A</b> follows the Fizz 31-step procedure (Mott Design Example 12-1): torque <i>T</i> = 63 000<i>P</i>/<i>n</i> (Step 1), forces from each gear / sheave (Step 2), FBD, reactions and shear-moment-torque diagrams by hand (Steps 3-8), stress-concentration factors <i>K<sub>t</sub></i> (Step 9), material and the modified endurance strength ' +
      '<i>s′<sub>n</sub> = s<sub>n</sub>C<sub>m</sub>C<sub>st</sub>C<sub>R</sub>C<sub>s</sub></i> (Steps 10-16), then the diameter <i>D</i> from Eq. (12-24) — or Eq. (12-16) where only shear acts (Step 17), ×1.06 at ring grooves (Step 18), most-restrictive value per section (Step 19), second pass with a better <i>C<sub>s</sub></i> (Step 20), bearing-bore and preferred-size rounding (Steps 21-25). ' +
      'Enter the loads for one critical point at a time (left / centre / right of each component). <b>Section B</b> is the key design of Steps 26-31 (Mott Ch. 11). Units: hp, rpm, lb, in, psi/ksi. Loaded example: Mott Ex. 12-1 point C (left) and Ex. 11-1 key.',
    example: { P: 200, n: 600, ctype: 'spur gear', Dp: 10, phi: 20, N: 2, Mx: 12230, My: 16800, V: 0, feat: 'Profile keyseat', mat: 'SAE 1144 OQT 1000', su: 118, sy: 83, steel: 'Wrought steel', stress: 'bending (Cst = 1.0)', surf: 'Machined or cold drawn', sn: 42, rel: 0.99, Dguess: 4, Cs: 0.75, ring: 'no', Dsel: 4.0, dkey: 2.0, Tkey: 2965, W: 0.5, Hk: 0.5, keymat: 'SAE 1018', syk: 54, Nk: 3, Lhub: 1.75, Lsel: 1.5, Ck: 0.005 },

    assumptions: [
      { text: 'Torque T = 63 000 P/n (P in hp); the torques along the shaft must sum to zero', src: 'Fizz p.106' },
      { text: 'Pressure angle φ = 20° unless the problem states otherwise', src: 'Fizz p.42', var: 'phi' },
      { text: 'Belt tension ratio F_1/F_2 = 5 for V-belts and 3 for flat belts if not given → F_{shaft} = (2T/D)(k + 1)/(k − 1) = 1.5 or 2.0 × 2T/D', src: 'Fizz p.107', var: 'kb_' },
      { text: 'Keyseats are profile keyseats (K_t = 2.0) unless told otherwise; sled-runner 1.6', src: 'Fizz p.108 · Fizz p.109' },
      { text: 'Gears and sheaves sit against well-rounded fillets (K_t = 1.5)', src: 'Fizz p.109' },
      { text: 'Bearing seats: well-rounded fillet (1.5) on the small-diameter side, press fit at the seat (K_t = 1), sharp fillet (2.5) on the large-diameter side', src: 'Fizz p.109' },
      { text: 'Retaining-ring grooves K_t = 3.0 on the small side of gears, and the computed diameter ×1.06', src: 'Fizz p.109 · Fizz p.112' },
      { text: 'Wrought steel, C_m = 1.00, if the material type is not specified', src: 'Fizz p.109', var: 'steel' },
      { text: 'Bending stress, C_{st} = 1.0 (almost always)', src: 'Fizz p.109', var: 'stress' },
      { text: 'Surface machined or cold drawn when not specified (s_n from that curve of Fig. 5-11)', src: 'Fizz p.110', var: 'surf' },
      { text: 'Reliability 99 % as the safe guess → C_R = 0.81', src: 'Fizz p.111', var: 'rel' },
      { text: 'First-pass size factor C_s = 0.8 (≈ 2 in shaft); redo with a better C_s if the diameters come out far from 2 in (Mott Ex. 12-1 guesses 0.75)', src: 'Fizz p.111 · Fizz p.112', var: 'Cs', value: 0.8 },
      { text: 'Shaft design factor N = 3 (Mott uses 2.5–3; Ex. 12-1 uses 2); the guide gives no shaft value', src: 'Mott Sec. 12-5', var: 'N' },
      { text: 'Bearing at a seat: L_2 = rpm × 60 × h/day × days/month × 12 × years, L_1 = C_R·10^6 for reliability ≠ 90 %, k = 3.00 ball / 3.33 tapered (see the bearing calculators)', src: 'Fizz p.113' },
      { text: 'Key material SAE 1018 (s_y = 54 ksi), weaker than the shaft so Eq. 11-5 applies', src: 'Fizz p.119', var: 'syk' },
      { text: 'Key design factor N = 3 if not given', src: 'Fizz p.121', var: 'Nk' },
      { text: 'Key length: over ~2 in is too long (increase the shaft diameter); 1–1.5 in is good, under 1 in best; round up to a standard size', src: 'Fizz p.122' },
      { text: 'Keyseat allowance C = +0.005 in clearance for parallel keys (−0.020 in for taper keys)', src: 'Fizz p.122', var: 'Ck' },
    ],

    figures: [
      { id: 'fig12-2', ref: 'Figure 12-2', title: 'Proposed shaft geometry: sharp fillets at bearing seats (r3, r5), well-rounded at gears (r1, r2, r4), profile keyseats at A and C, retaining-ring groove', src: 'figures/mott/fig12-2.png', page: 529 },
      { id: 'fig12-4', ref: 'Figure 12-4', title: 'Directions for forces on mating spur gears: Wt pushes the driven gear round, Wr pushes it away', src: 'figures/mott/fig12-4.png', page: 530 },
      { id: 'fig12-6', ref: 'Figure 12-6', title: 'Forces on belt sheaves: F1 (tight) + F2 (slack) = bending force FB; net torque (F1 − F2)D/2', src: 'figures/mott/fig12-6.png', page: 532 },
      { id: 'fig12-7', ref: 'Figure 12-7', title: 'Profile keyseat (Kt = 2.0) vs sled-runner keyseat (Kt = 1.6)', src: 'figures/mott/fig12-7.png', page: 533 },
      { id: 'fig12-8', ref: 'Figure 12-8', title: 'Sharp fillet at a bearing seat (Kt = 2.5, r/d ≈ 0.03) vs well-rounded fillet at a gear (Kt = 1.5, r/d ≈ 0.19)', src: 'figures/mott/fig12-8.png', page: 534 },
      { id: 'app3a', ref: 'Appendix 3', title: 'Design properties of carbon and alloy steels — su, sy, elongation, HB (1020 … 4150)', src: 'figures/mott/appendix3a.png', page: 804 },
      { id: 'app3b', ref: 'Appendix 3 (cont.)', title: 'Steels 4340 … 9255', src: 'figures/mott/appendix3b.png', page: 805 },
      { id: 'fig5-11a', ref: 'Figure 5-11(a)', title: 'Endurance limit sn vs tensile strength su (U.S. units) for polished, ground, machined/cold-drawn, as-rolled, as-forged surfaces', src: 'figures/mott/fig5-11a.png', page: 196,
        note: 'Fizz Step 13: if the finish is not given assume machined / cold drawn. Ex. 12-1: su = 118 ksi → sn ≈ 42 ksi.' },
      { id: 'fig5-11b', ref: 'Figure 5-11(b)', title: 'Endurance limit vs tensile strength (SI units)', src: 'figures/mott/fig5-11b.png', page: 196 },
      { id: 't5-3', ref: 'Table 5-3', title: 'Approximate reliability factors CR (0.50 → 1.0, 0.90 → 0.90, 0.99 → 0.81, 0.999 → 0.75)', src: 'figures/mott/table5-3.png', page: 198 },
      { id: 'fig5-12', ref: 'Figure 5-12', title: 'Size factor Cs vs diameter (in / mm)', src: 'figures/mott/fig5-12.png', page: 198 },
      { id: 't5-4', ref: 'Table 5-4', title: 'Size factor equations: Cs = 1 (D ≤ 0.3 in), (D/0.3)^−0.11 (0.3–2 in), 0.859 − 0.02125D (2–10 in)', src: 'figures/mott/table5-4.png', page: 198 },
      { id: 'ta2-1', ref: 'Table A2-1', title: 'Preferred basic sizes (fractional in, decimal in, mm) — Fizz Steps 25 and 30', src: 'figures/mott/tablea2-1.png', page: 801 },
      { id: 't14-3a', ref: 'Table 14-3', title: 'Deep-groove ball bearing bores (bearing seats must match a bore: Fizz Steps 22-24)', src: 'figures/mott/table14-3a.png', page: 589 },
      { id: 't11-1', ref: 'Table 11-1', title: 'Key size (W, H) vs shaft diameter, inch and metric', src: 'figures/mott/table11-1.png', page: 490, note: 'Sizes above the horizontal line are square.' },
      { id: 't11-4', ref: 'Table 11-4', title: 'Materials used for keys — su, sy (SAE 1018: sy = 54 ksi)', src: 'figures/mott/table11-4.png', page: 493 },
      { id: 'fig11-4', ref: 'Figure 11-4', title: 'Forces on a key: shear area WL, bearing area L(H/2), F = T/(D/2)', src: 'figures/mott/fig11-4.png', page: 494 },
      { id: 'proc11', ref: 'Sec. 11-4 procedure', title: 'Mott design procedure for parallel keys (10 steps)', src: 'figures/mott/proc11-4.png', page: 494 },
      { id: 'fig11-2', ref: 'Figure 11-2', title: 'Dimensions for parallel keyseats: chordal height Y, shaft keyseat S, hub keyway T', src: 'figures/mott/fig11-2.png', page: 491 },
      { id: 't11-2', ref: 'Table 11-2', title: 'Suggested fillet radii and key chamfers', src: 'figures/mott/table11-2.png', page: 491 },
    ],

    sections: [
      { title: 'Section A · Loads (Fizz Steps 1–8)', steps: [
        { id: 'tq', title: 'Step 1 — torque at each component', eq: '12-1', formula: 'T = \\frac{63\\,000\\,P}{n}',
          text: 'Repeat per gear / sheave; the torques along the shaft must sum to zero. The torque diagram only changes at components, never at bearings.',
          vars: [
            { id: 'P', symbol: 'P', label: 'Power at this component', unit: 'hp', kind: 'input' },
            { id: 'n', symbol: 'n', label: 'Shaft speed', unit: 'rpm', kind: 'input' },
            { id: 'T1', symbol: 'T', label: 'Torque', unit: 'lb·in', kind: 'calc', digits: 5, compute: v => H.has(v, 'P', 'n') && v.n > 0 ? 63000 * v.P / v.n : undefined,
              work: v => v.T1 !== undefined ? '\\(T = \\dfrac{63\\,000(' + H.fmt(v.P) + ')}{' + H.fmt(v.n) + '} = ' + H.fmt(v.T1, 5) + '\\text{ lb·in}\\)' : null },
          ] },
        { id: 'forces', title: 'Step 2 — forces from the component', eq: '12-2 / 12-3 / 12-12 / 12-13', fig: ['fig12-4', 'fig12-6'],
          formula: 'W_t = \\frac{2T}{D} \\qquad W_r = W_t\\tan\\phi\\ \\text{(spur)},\\ W_t\\frac{\\tan\\phi_n}{\\cos\\psi}\\ \\text{(helical)},\\ W_t\\tan\\phi\\cos\\gamma\\ \\text{(bevel)} \\qquad W_x = W_t\\tan\\psi\\ \\text{(helical)},\\ W_t\\tan\\phi\\sin\\gamma\\ \\text{(bevel)} \\qquad F_{shaft} = \\frac{2T}{D}\\frac{k+1}{k-1}\\ \\text{(belts)}',
          text: 'Chain: F = 2T/D along the chain (Eq. 12-5). V-belt: k = F1/F2 = 5 → F<sub>B</sub> = 1.5·(2T/D) (Eq. 12-12). Flat belt: k = 3 → 2.0·(2T/D) (Eq. 12-13). Worm gears: use the worm calculator. Resolve into x and y for the FBD.',
          vars: [
            { id: 'ctype', label: 'Component', kind: 'choice', type: 'text', default: 'spur gear', options: ['spur gear', 'helical gear', 'bevel gear', 'chain sprocket', 'V-belt sheave', 'flat-belt pulley'] },
            { id: 'Dp', symbol: 'D', label: 'Pitch diameter', unit: 'in', kind: 'input' },
            { id: 'phi', symbol: '\\phi', label: 'Pressure angle (spur/bevel) or φn (helical)', unit: '°', kind: 'input', default: 20 },
            { id: 'psi', symbol: '\\psi', label: 'Helix angle (helical only)', unit: '°', kind: 'input' },
            { id: 'gam', symbol: '\\gamma', label: 'Pitch cone angle (bevel only)', unit: '°', kind: 'input' },
            { id: 'kb_', symbol: 'k', label: 'Belt tension ratio F1/F2', unit: '', kind: 'input', auto: v => /V-belt/.test(comp(v)) ? 5 : /flat/.test(comp(v)) ? 3 : undefined },
            { id: 'Wt', symbol: 'W_t', label: 'Tangential force (or 2T/D)', unit: 'lb', kind: 'calc', digits: 4, compute: v => H.has(v, 'T1', 'Dp') && v.Dp > 0 ? 2 * v.T1 / v.Dp : undefined,
              work: v => v.Wt !== undefined ? '\\(W_t = \\dfrac{' + H.fmt(v.T1, 5) + '}{' + H.fmt(v.Dp) + '/2} = ' + H.fmt(v.Wt) + '\\text{ lb}\\)' : null },
            { id: 'Wr', symbol: 'W_r', label: 'Radial force', unit: 'lb', kind: 'calc', digits: 4, compute: v => {
              if (v.Wt === undefined || !H.has(v, 'phi')) return undefined; const c = comp(v);
              if (c === 'spur gear') return v.Wt * Math.tan(H.rad(v.phi));
              if (c === 'helical gear') return H.has(v, 'psi') ? v.Wt * Math.tan(H.rad(v.phi)) / Math.cos(H.rad(v.psi)) : undefined;
              if (c === 'bevel gear') return H.has(v, 'gam') ? v.Wt * Math.tan(H.rad(v.phi)) * Math.cos(H.rad(v.gam)) : undefined;
              return undefined; },
              work: v => v.Wr !== undefined && comp(v) === 'spur gear' ? '\\(W_r = ' + H.fmt(v.Wt) + '\\tan ' + H.fmt(v.phi) + '^\\circ = ' + H.fmt(v.Wr) + '\\text{ lb}\\)' : null },
            { id: 'Wx', symbol: 'W_x', label: 'Axial force (helical / bevel)', unit: 'lb', kind: 'calc', digits: 4, compute: v => {
              if (v.Wt === undefined) return undefined; const c = comp(v);
              if (c === 'helical gear') return H.has(v, 'psi') ? v.Wt * Math.tan(H.rad(v.psi)) : undefined;
              if (c === 'bevel gear') return H.has(v, 'phi', 'gam') ? v.Wt * Math.tan(H.rad(v.phi)) * Math.sin(H.rad(v.gam)) : undefined;
              return undefined; } },
            { id: 'Fsh', symbol: 'F_{shaft}', label: 'Bending force on shaft (chain / belt)', unit: 'lb', kind: 'calc', digits: 4, compute: v => {
              if (v.Wt === undefined) return undefined; const c = comp(v);
              if (c === 'chain sprocket') return v.Wt;
              if (/belt/.test(c)) return H.has(v, 'kb_') && v.kb_ > 1 ? v.Wt * (v.kb_ + 1) / (v.kb_ - 1) : undefined;
              return undefined; } },
          ] },
        { id: 'pt', title: 'Steps 3–8 — resultant loads at the point being sized', fig: ['fig12-2'],
          formula: 'M = \\sqrt{M_x^2 + M_y^2} \\qquad V = \\sqrt{V_x^2 + V_y^2}',
          text: 'Draw the FBD (ΣF<sub>x</sub> = ΣF<sub>y</sub> = ΣM<sub>x</sub> = ΣM<sub>y</sub> = 0, plus ΣF<sub>z</sub> = 0 if a gear gives an axial force), then shear and bending-moment diagrams in both planes and the torque diagram. Enter the resultants at this point. ' +
            'Ex. 12-1 point C: M<sub>x</sub> = 12 230, M<sub>y</sub> = 16 800 → M = 20 780 lb·in, T = 21 000 lb·in to the left of C, T = 0 to the right.',
          vars: [
            { id: 'Mx', symbol: 'M_x', label: 'Bending moment, x-plane', unit: 'lb·in', kind: 'input' },
            { id: 'My', symbol: 'M_y', label: 'Bending moment, y-plane', unit: 'lb·in', kind: 'input' },
            { id: 'M', symbol: 'M', label: 'Resultant bending moment', unit: 'lb·in', kind: 'input', auto: v => H.has(v, 'Mx', 'My') ? Math.hypot(v.Mx, v.My) : undefined, hint: 'auto = √(Mx²+My²), or type it',
              work: v => H.has(v, 'Mx', 'My') ? '\\(M = \\sqrt{' + H.fmt(v.Mx, 5) + '^2 + ' + H.fmt(v.My, 5) + '^2} = ' + H.fmt(Math.hypot(v.Mx, v.My), 5) + '\\text{ lb·in}\\)' : null },
            { id: 'T', symbol: 'T', label: 'Torque at this point', unit: 'lb·in', kind: 'input', auto: v => v.T1, hint: '0 if outside the torque path (e.g. right of the last gear)' },
            { id: 'V', symbol: 'V', label: 'Resultant shear force (for shear-only points, e.g. bearing seats)', unit: 'lb', kind: 'input', default: 0 },
          ] },
      ] },

      { title: 'Section A · Stress concentration & strength (Steps 9–16)', steps: [
        { id: 'kt', title: 'Step 9 — stress concentration factor', fig: ['fig12-7', 'fig12-8', 'fig12-2'],
          text: 'Mott preliminary values (Sec. 12-4): profile keyseat 2.0, sled-runner 1.6, sharp fillet 2.5, well-rounded fillet 1.5, retaining-ring groove 3.0; the bearing seat itself (press fit) 1.0. Three K<sub>t</sub> values per component (left / centre / right); if two discontinuities coincide use the larger. K<sub>t</sub> applies to bending only in Eq. (12-24).',
          vars: [
            { id: 'feat', label: 'Feature at this point', kind: 'choice', type: 'text', default: 'Profile keyseat', options: Object.keys(KT) },
            { id: 'Kt', symbol: 'K_t', label: 'Stress concentration factor', unit: '', kind: 'lookup', fig: 'fig12-8', auto: v => KT[v.feat] },
          ] },
        { id: 'mat', title: 'Step 10 — shaft material', fig: ['app3a', 'app3b'],
          vars: [
            { id: 'mat', label: 'Material', kind: 'input', type: 'text', hint: 'e.g. SAE 1144 OQT 1000, SAE 1040 CD' },
            { id: 'su', symbol: 's_u', label: 'Tensile strength', unit: 'ksi', kind: 'lookup', fig: 'app3a' },
            { id: 'sy', symbol: 's_y', label: 'Yield strength', unit: 'ksi', kind: 'lookup', fig: 'app3a' },
          ] },
        { id: 'sn', title: 'Steps 11–16 — modified endurance strength', eq: '5-21', fig: ['fig5-11a', 'fig5-11b', 't5-3', 'fig5-12', 't5-4'],
          formula: "s'_n = s_n\\, C_m\\, C_{st}\\, C_R\\, C_s",
          text: 'C<sub>m</sub>: wrought 1.00, cast steel 0.80, powdered 0.76, malleable CI 0.80, gray CI 0.70, ductile CI 0.66. C<sub>st</sub>: 1.0 bending, 0.8 axial. s<sub>n</sub> from Fig. 5-11 (assume machined / cold drawn if not told). C<sub>R</sub> from Table 5-3 (99 % → 0.81 is the safe guess). ' +
            'C<sub>s</sub> needs the diameter: Fizz guesses 0.8 (≈ 2 in); Mott Ex. 12-1 guesses 0.75 for a large shaft. Enter a trial diameter for the Table 5-4 estimate, or type C<sub>s</sub> directly.',
          vars: [
            { id: 'steel', label: 'Material type (Cm)', kind: 'choice', type: 'text', default: 'Wrought steel', options: Object.keys(CM) },
            { id: 'Cm', symbol: 'C_m', label: 'Material factor', unit: '', kind: 'calc', digits: 3, compute: v => CM[v.steel] },
            { id: 'stress', label: 'Type of stress (Cst)', kind: 'choice', type: 'text', default: 'bending (Cst = 1.0)', options: ['bending (Cst = 1.0)', 'axial tension (Cst = 0.8)'] },
            { id: 'Cst', symbol: 'C_{st}', label: 'Type-of-stress factor', unit: '', kind: 'calc', digits: 2, compute: v => v.stress ? (/axial/.test(v.stress) ? 0.8 : 1) : undefined },
            { id: 'surf', label: 'Surface condition (Fig. 5-11 curve)', kind: 'choice', type: 'text', default: 'Machined or cold drawn', options: Object.keys(SN) },
            { id: 'sn', symbol: 's_n', label: 'Endurance limit from Fig. 5-11', unit: 'ksi', kind: 'lookup', fig: 'fig5-11a', auto: v => H.has(v, 'su') && SN[v.surf] ? SN[v.surf][0] * Math.pow(v.su, SN[v.surf][1]) * 0.5 * Math.min(v.su, 200) : undefined, hint: 'auto is a curve-fit estimate — read the graph' },
            { id: 'rel', label: 'Desired reliability', kind: 'choice', default: 0.99, options: [0.5, 0.9, 0.99, 0.999] },
            { id: 'CRf', symbol: 'C_R', label: 'Reliability factor', unit: '', kind: 'lookup', fig: 't5-3', auto: v => CR[v.rel] },
            { id: 'Dguess', symbol: 'D_{guess}', label: 'Trial diameter for Cs', unit: 'in', kind: 'input', hint: 'blank → Cs = 0.8 (Fizz Step 15)' },
            { id: 'Cs', symbol: 'C_s', label: 'Size factor', unit: '', kind: 'lookup', fig: 'fig5-12', auto: v => v.Dguess !== undefined ? Cs(v.Dguess) : 0.8,
              work: v => v.Dguess !== undefined && Cs(v.Dguess) !== undefined ? '\\(C_s = ' + (v.Dguess <= 2 ? '(' + H.fmt(v.Dguess) + '/0.3)^{-0.11}' : '0.859 - 0.02125(' + H.fmt(v.Dguess) + ')') + ' = ' + H.fmt(Cs(v.Dguess)) + '\\)' : null },
            { id: 'snp', symbol: "s'_n", label: 'Modified endurance strength', unit: 'ksi', kind: 'calc', digits: 4, compute: v => H.has(v, 'sn', 'Cm', 'Cst', 'CRf', 'Cs') ? v.sn * v.Cm * v.Cst * v.CRf * v.Cs : undefined,
              work: v => v.snp !== undefined ? "\\(s'_n = " + H.fmt(v.sn) + '(' + H.fmt(v.Cm) + ')(' + H.fmt(v.Cst) + ')(' + H.fmt(v.CRf) + ')(' + H.fmt(v.Cs) + ') = ' + H.fmt(v.snp) + '\\text{ ksi}\\)' : null },
          ] },
      ] },

      { title: 'Section A · Diameter (Steps 17–25)', steps: [
        { id: 'dia', title: 'Steps 17–18 — minimum diameter', eq: '12-24 / 12-16', fig: ['ta2-1'],
          formula: "D = \\left[\\frac{32N}{\\pi}\\sqrt{\\left(\\frac{K_t M}{s'_n}\\right)^2 + \\frac{3}{4}\\left(\\frac{T}{s_y}\\right)^2}\\right]^{1/3} \\qquad D = \\sqrt{\\frac{2.94\\,K_t V N}{s'_n}}\\ \\text{(shear only)}",
          text: 'Eq. (12-24) for bending and/or torsion (use it even with M = 0 or T = 0). Eq. (12-16) where only vertical shear acts (bearing seats at the ends of the torque path); the larger governs. Mott typically uses N = 2.5–3 (default 3); Ex. 12-1 uses 2. (The Fizz "assume 3 if not given" is stated for the key, Step 28.) Retaining-ring groove: multiply by 1.06 (Fizz Step 18).',
          vars: [
            { id: 'N', symbol: 'N', label: 'Design factor', unit: '', kind: 'input', default: 3 },
            { id: 'D24', symbol: 'D_{12\\text{-}24}', label: 'Diameter from Eq. 12-24', unit: 'in', kind: 'calc', digits: 4, compute: v => D24(v, v.Kt, v.M, v.T),
              work: v => v.D24 !== undefined ? '\\(D = \\left[\\dfrac{32(' + H.fmt(v.N) + ')}{\\pi}\\sqrt{\\left(\\dfrac{' + H.fmt(v.Kt) + '(' + H.fmt(v.M, 5) + ')}{' + H.fmt(v.snp * 1000, 5) + '}\\right)^2 + \\dfrac{3}{4}\\left(\\dfrac{' + H.fmt(v.T, 5) + '}{' + H.fmt(v.sy * 1000, 5) + '}\\right)^2}\\right]^{1/3} = ' + H.fmt(v.D24) + '\\text{ in}\\)' : null },
            { id: 'D16', symbol: 'D_{12\\text{-}16}', label: 'Diameter from Eq. 12-16 (shear only)', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'Kt', 'V', 'N', 'snp') && v.V > 0 ? Math.sqrt(2.94 * v.Kt * v.V * v.N / (v.snp * 1000)) : undefined,
              work: v => v.D16 !== undefined ? '\\(D = \\sqrt{\\dfrac{2.94(' + H.fmt(v.Kt) + ')(' + H.fmt(v.V) + ')(' + H.fmt(v.N) + ')}{' + H.fmt(v.snp * 1000, 5) + '}} = ' + H.fmt(v.D16) + '\\text{ in}\\)' : null },
            { id: 'ring', label: 'Retaining-ring groove at this point?', kind: 'choice', type: 'text', default: 'no', options: ['no', 'yes (×1.06)'] },
            { id: 'Dmin', symbol: 'D_{min}', label: 'Governing minimum diameter', unit: 'in', kind: 'calc', digits: 4, compute: v => { let d = v.D24; if (d === undefined && v.D16 !== undefined) d = v.D16; if (d === undefined) return undefined; if (v.D16 !== undefined && v.D16 > d) d = v.D16; if (/yes/.test(v.ring || '')) d *= 1.06; return d; },
              work: v => v.Dmin !== undefined && /yes/.test(v.ring || '') ? '\\(D_{ring} = 1.06 D = ' + H.fmt(v.Dmin) + '\\text{ in}\\)' : null },
            { id: 'Cs2', symbol: 'C_s', label: 'Cs at the computed diameter (Step 20 check)', unit: '', kind: 'calc', digits: 4, compute: v => Cs(v.Dmin) },
          ],
          after: v => {
            if (v.Dmin === undefined) return '';
            const re = (v.Cs2 !== undefined && v.Cs !== undefined && Math.abs(v.Cs2 - v.Cs) > 0.05) ? ' <span class="result-bad">C<sub>s</sub> at this size is ' + H.fmt(v.Cs2, 3) + ' vs assumed ' + H.fmt(v.Cs, 3) + ' — do a 2nd iteration (Step 20): enter D<sub>guess</sub> = ' + H.fmt(v.Dmin, 3) + '.</span>' : ' <span class="result-ok">C<sub>s</sub> consistent with the assumed value ✔</span>';
            return '<span class="result-ok">D<sub>min</sub> = ' + H.fmt(v.Dmin) + ' in at this point.</span>' + re;
          } },
        { id: 'round', title: 'Steps 19–25 — most restrictive diameter, bearing bore, preferred size', fig: ['ta2-1', 't14-3a'],
          text: 'Take the largest D<sub>min</sub> among the points that share a shaft section (Step 19). At bearing seats the diameter is the bearing bore from Table 14-3 (Steps 21-24: C = P<sub>2</sub>(L<sub>2</sub>/(C<sub>R</sub>·10⁶))^{1/k} — see the ball-bearing calculator); neighbouring sections must be ≥ the bore (shoulders). Elsewhere round <i>up</i> to a preferred basic size (Table A2-1).',
          vars: [
            { id: 'Dsel', symbol: 'D', label: 'Specified diameter at this point', unit: 'in', kind: 'lookup', fig: 'ta2-1', check: v => (H.has(v, 'Dsel', 'Dmin') && v.Dsel < v.Dmin) ? 'Smaller than Dmin' : null },
            { id: 'Nact', symbol: 'N', label: 'Actual design factor at D (Eq. 12-23 solved for N)', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'Dsel', 'Kt', 'M', 'T', 'snp', 'sy') && v.Dsel > 0 ? (() => { const s = Math.sqrt(Math.pow(v.Kt * v.M / (v.snp * 1000), 2) + 0.75 * Math.pow(v.T / (v.sy * 1000), 2)); return s > 0 ? Math.PI * Math.pow(v.Dsel, 3) / (32 * s) : undefined; })() : undefined },
          ],
          after: v => !H.has(v, 'Dsel', 'Dmin') ? '' : v.Dsel >= v.Dmin ? '<span class="result-ok">D = ' + H.fmt(v.Dsel) + ' in ≥ ' + H.fmt(v.Dmin) + ' in ✔' + (v.Nact !== undefined ? ' (actual N = ' + H.fmt(v.Nact, 3) + ')' : '') + ' — repeat Section A for the next point.</span>' : '<span class="result-bad">Specified diameter is below the minimum.</span>' },
      ] },

      { title: 'Section B · Key design (Steps 26–31)', steps: [
        { id: 'ksize', title: 'Steps 26–27 — key material and size', fig: ['t11-4', 't11-1', 'proc11'],
          text: 'SAE 1018 (s<sub>y</sub> = 54 ksi) is the usual choice; keep the key weaker than shaft and hub so Eq. (11-5) applies. Width ≈ D/4 from Table 11-1 at the shaft diameter under the component.',
          vars: [
            { id: 'dkey', symbol: 'D', label: 'Shaft diameter at the component', unit: 'in', kind: 'input', auto: v => v.Dsel },
            { id: 'Tkey', symbol: 'T', label: 'Torque at that point', unit: 'lb·in', kind: 'input', auto: v => v.T1 },
            { id: 'W', symbol: 'W', label: 'Key width', unit: 'in', kind: 'lookup', fig: 't11-1' },
            { id: 'Hk', symbol: 'H', label: 'Key height', unit: 'in', kind: 'lookup', fig: 't11-1', auto: v => v.W, hint: 'square key: H = W' },
            { id: 'keymat', label: 'Key material', kind: 'input', type: 'text', default: 'SAE 1018' },
            { id: 'syk', symbol: 's_y', label: 'Yield strength of the key', unit: 'ksi', kind: 'lookup', fig: 't11-4', default: 54 },
            { id: 'syw', symbol: 's_{y,min}', label: 'Lowest yield strength of key / shaft / hub (for bearing)', unit: 'ksi', kind: 'input', auto: v => v.syk, hint: 'defaults to the key' },
            { id: 'Nk', symbol: 'N', label: 'Design factor', unit: '', kind: 'input', default: 3 },
            { id: 'Lhub', symbol: 'L_{hub}', label: 'Hub length (if known)', unit: 'in', kind: 'input' },
          ] },
        { id: 'klen', title: 'Step 28 — minimum key length', eq: '11-2 / 11-4 / 11-5', fig: ['fig11-4'],
          formula: 'L_{min} = \\frac{4TN}{D\\,W\\,s_y}\\ \\text{(square key, key weakest)} \\qquad L_{shear} = \\frac{2T}{\\tau_d D W},\\ \\tau_d = \\frac{0.5 s_y}{N} \\qquad L_{bear} = \\frac{4T}{\\sigma_d D H},\\ \\sigma_d = \\frac{s_{y,min}}{N}',
          text: 'Fizz 28a: square key and key is the weakest material → Eq. (11-5). Fizz 28b: rectangular key, or shaft/hub weaker → take the larger of shear (11-2) and bearing (11-4). Step 29: &gt; 2 in is too long — enlarge the shaft, use two keys or a stronger key; 1–1.5 in is good, &lt; 1 in best.',
          vars: [
            { id: 'L5', symbol: 'L_{min}', label: 'Eq. 11-5 (square key, key weakest)', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'Tkey', 'Nk', 'dkey', 'W', 'syk') && v.dkey * v.W * v.syk > 0 ? 4 * v.Tkey * v.Nk / (v.dkey * v.W * v.syk * 1000) : undefined,
              work: v => v.L5 !== undefined ? '\\(L = \\dfrac{4(' + H.fmt(v.Tkey, 5) + ')(' + H.fmt(v.Nk) + ')}{(' + H.fmt(v.dkey) + ')(' + H.fmt(v.W) + ')(' + H.fmt(v.syk * 1000, 5) + ')} = ' + H.fmt(v.L5) + '\\text{ in}\\)' : null },
            { id: 'Lsh', symbol: 'L_{shear}', label: 'Eq. 11-2 (shear of key)', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'Tkey', 'Nk', 'dkey', 'W', 'syk') && v.dkey * v.W * v.syk > 0 ? 2 * v.Tkey / ((0.5 * v.syk * 1000 / v.Nk) * v.dkey * v.W) : undefined },
            { id: 'Lbr', symbol: 'L_{bear}', label: 'Eq. 11-4 (bearing / compression on weakest)', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'Tkey', 'Nk', 'dkey', 'Hk', 'syw') && v.dkey * v.Hk * v.syw > 0 ? 4 * v.Tkey / ((v.syw * 1000 / v.Nk) * v.dkey * v.Hk) : undefined },
            { id: 'Lmin', symbol: 'L_{min}', label: 'Required key length (governing)', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'Lsh', 'Lbr') ? Math.max(v.Lsh, v.Lbr) : undefined },
            { id: 'Lsel', symbol: 'L', label: 'Specified key length (Step 30, preferred size)', unit: 'in', kind: 'lookup', fig: 'ta2-1', hint: 'round up; ≤ hub length; keep clear of ring grooves / fillets',
              check: v => (H.has(v, 'Lsel', 'Lmin') && v.Lsel < v.Lmin) ? 'Shorter than required' : (H.has(v, 'Lsel', 'Lhub') && v.Lsel > v.Lhub) ? 'Longer than the hub — stronger key material or two keys' : null },
          ],
          after: v => v.Lmin === undefined ? '' : v.Lmin > 2 ? '<span class="result-bad">L<sub>min</sub> = ' + H.fmt(v.Lmin) + ' in &gt; 2 in — increase the shaft diameter or key strength (Fizz Step 29).</span>' : '<span class="result-ok">Key ' + H.fmt(v.W) + ' × ' + H.fmt(v.Hk) + ' in, L<sub>min</sub> = ' + H.fmt(v.Lmin) + ' in (' + (v.Lbr >= v.Lsh ? 'bearing' : 'shear') + ' governs)' + (v.Lsel !== undefined ? ' → specify ' + H.fmt(v.W) + ' × ' + H.fmt(v.Hk) + ' × ' + H.fmt(v.Lsel) + ' in' : '') + ' ✔</span>' },
        { id: 'kseat', title: 'Step 31 — keyseat and keyway dimensions', fig: ['fig11-2', 't11-2'],
          formula: 'Y = \\frac{D - \\sqrt{D^2 - W^2}}{2} \\qquad S = D - Y - \\frac{H}{2} = \\frac{D - H + \\sqrt{D^2 - W^2}}{2} \\qquad T = D - Y + \\frac{H}{2} + C = \\frac{D + H + \\sqrt{D^2 - W^2}}{2} + C',
          text: 'C = +0.005 in clearance for parallel keys, −0.020 in interference for taper keys (Fig. 11-2). Mott Ex. 11-1: D = 2.000, ½ × ½ key → S = 1.718 in, T = 2.223 in.',
          vars: [
            { id: 'Ck', symbol: 'C', label: 'Allowance', unit: 'in', kind: 'choice', default: 0.005, options: [{ label: '+0.005 parallel key', value: 0.005 }, { label: '−0.020 taper key', value: -0.02 }] },
            { id: 'Y', symbol: 'Y', label: 'Chordal height', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'dkey', 'W') && v.dkey > v.W ? (v.dkey - Math.sqrt(v.dkey * v.dkey - v.W * v.W)) / 2 : undefined },
            { id: 'Sk', symbol: 'S', label: 'Shaft keyseat dimension', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'dkey', 'W', 'Hk') && v.dkey > v.W ? (v.dkey - v.Hk + Math.sqrt(v.dkey * v.dkey - v.W * v.W)) / 2 : undefined,
              work: v => v.Sk !== undefined ? '\\(S = \\dfrac{' + H.fmt(v.dkey) + ' - ' + H.fmt(v.Hk) + ' + \\sqrt{' + H.fmt(v.dkey) + '^2 - ' + H.fmt(v.W) + '^2}}{2} = ' + H.fmt(v.Sk) + '\\text{ in}\\)' : null },
            { id: 'Tk', symbol: 'T', label: 'Hub keyway dimension', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'dkey', 'W', 'Hk', 'Ck') && v.dkey > v.W ? (v.dkey + v.Hk + Math.sqrt(v.dkey * v.dkey - v.W * v.W)) / 2 + v.Ck : undefined,
              work: v => v.Tk !== undefined ? '\\(T = \\dfrac{' + H.fmt(v.dkey) + ' + ' + H.fmt(v.Hk) + ' + \\sqrt{' + H.fmt(v.dkey) + '^2 - ' + H.fmt(v.W) + '^2}}{2} + (' + H.fmt(v.Ck) + ') = ' + H.fmt(v.Tk) + '\\text{ in}\\)' : null },
          ],
          after: v => v.Sk !== undefined ? '<span class="result-ok">Keyseat: S = ' + H.fmt(v.Sk) + ' in (shaft), T = ' + H.fmt(v.Tk) + ' in (hub), depth H/2 = ' + H.fmt(v.Hk / 2) + ' in.</span>' : '' },
      ] },
    ],
  };
})();
