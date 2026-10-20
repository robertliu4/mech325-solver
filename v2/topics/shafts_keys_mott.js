/* Shafts & keys — Mott 6e Ch. 12 (Eq. 12-24 / 12-16) with Ch. 5 endurance factors and Ch. 11 keys.
 * Procedure: Fizz bible pp. 106-122 (31 steps) — this is the bible's native method. Mech bible unit 5 (PDF p. 130) is empty.
 * Verified against: Mott Design Example 12-1, point C left (SAE 1144 OQT 1000: su 118, sy 83 ksi, sn = 42 ksi, Cs = 0.75, CR = 0.81, N = 2,
 *   Mx = 12 230, My = 16 800 -> M = 20 780 lb·in, T = 21 000 lb·in, profile keyseat Kt = 2.0): s'n = 25.5 ksi, D = 3.22 in, specified 4.000 in;
 *   Mott Example Problem 11-1 key (D = 2.00 in, T = 2965 lb·in, 1/2 sq SAE 1018, N = 3): L = 0.659 in -> 1.50 in, S = 1.718 in, T = 2.223 in;
 *   Final-exam review Q1 (SAE 1050 CD su 100 / sy 84, sn 38 ksi, CR 0.81, Cs 0.85 -> s'n = 26 163 psi, N 2.5): B (M 500, T 326, profile keyseat 2.0) D = 0.992 -> 1.000 in,
 *   key 1/4 sq L = 0.241 in; C (M 0, T 326) D = 0.441 in, shear only (Kt 2.5, V 250) 0.419 in; coupling D (0.5 in, 1/8 key) L = 0.966 in;
 *   HW4 2023 P8 (SAE 1137 CD su 98 / sy 82, s'n = 23 976 psi, N 3): bearing C (Kt 2.5, M 10 911, T 2625) D = 3.26 in; spur gear D (ring Kt 3, M 4390, T 3938)
 *   2.563 x 1.06 = 2.72 in -> 2.75; keys N = 4: gear 5/8 sq 0.679 in, V-belt 3/8 sq 1.38 in, chain 3/8 sq 0.691 in;
 *   HW4 2023/2024 P6 (Mott 11-4: 110 hp, 1700 rpm, D 2.5, 5/8 sq 1018, N 3): T 4076, L = 0.580 in -> hub 3.25 in; spline 6B K = 201 -> 208 (Table 11-6);
 *   Tutorial 2022 Q4 (Mott 12-23: M 4056, T 3150, ring Kt 3, s'n 17.9 ksi, sy 51 ksi, N 3): D = 2.75 in, x 1.06 = 2.92 in. */
(function () {
  const CM = { 'Wrought steel': 1.00, 'Cast steel': 0.80, 'Powdered steel': 0.76, 'Malleable cast iron': 0.80, 'Gray cast iron': 0.70, 'Ductile cast iron': 0.66 };
  const CR = { 0.5: 1.0, 0.9: 0.90, 0.99: 0.81, 0.999: 0.75 };
  const KT = { 'Profile keyseat': 2.0, 'Sled-runner keyseat': 1.6, 'Shoulder fillet — sharp (bearing seat side)': 2.5, 'Shoulder fillet — well rounded (gear / sheave)': 1.5, 'Bearing seat (press fit)': 1.0, 'Retaining-ring groove': 3.0, 'Plain shaft': 1.0 };
  // Fig 5-11 estimate: Shigley surface fits × 0.5 su (close to Mott's curves) — a placeholder until the chart is read
  const SN = { 'Machined or cold drawn': [2.00, -0.217], 'Ground': [1.21, -0.067], 'Polished': [1.0, 0], 'As-rolled / hot-rolled': [11.0, -0.650], 'As-forged': [12.7, -0.758] };
  const Cs = D => D === undefined ? undefined : D <= 0.3 ? 1 : D <= 2 ? Math.pow(D / 0.3, -0.11) : D < 10 ? 0.859 - 0.02125 * D : undefined;
  const comp = v => v.ctype || '';
  const D24 = (v, Kt, M, T) => H.has(v, 'N', 'snp', 'sy') && M !== undefined && T !== undefined && v.snp > 0 && v.sy > 0 ? Math.cbrt(32 * v.N / Math.PI * Math.sqrt(Math.pow(Kt * M / (v.snp * 1000), 2) + 0.75 * Math.pow(T / (v.sy * 1000), 2))) : undefined;
  // Table A2-1 fractional preferred sizes (in)
  const PF = [0.25, 0.3125, 0.375, 0.4375, 0.5, 0.5625, 0.625, 0.6875, 0.75, 0.875, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4, 4.25, 4.5, 4.75, 5, 5.25, 5.5, 5.75, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];
  const fr = x => { const w = Math.floor(x + 1e-9), f = x - w; if (f < 1e-6) return String(w); let den = 16, num = Math.round(f * 16); while (num % 2 === 0) { num /= 2; den /= 2; } return (w ? w + ' ' : '') + num + '/' + den; };
  const Nat = (v, D) => { if (!H.has(v, 'Kt', 'M', 'T', 'snp', 'sy') || !(D > 0)) return undefined; const s = Math.sqrt(Math.pow(v.Kt * v.M / (v.snp * 1000), 2) + 0.75 * Math.pow(v.T / (v.sy * 1000), 2)); return s > 0 ? Math.PI * Math.pow(D / (/yes/.test(v.ring || '') ? 1.06 : 1), 3) / (32 * s) : undefined; };
  function diaTable(v) {
    if (!(v.Dmin > 0)) return '';
    const i0 = PF.findIndex(x => x >= v.Dmin - 1e-9); if (i0 < 0) return '';
    const rows = PF.slice(Math.max(0, i0 - 1), i0 + 3).map(D => ({ cells: [fr(D) + ' (' + D.toFixed(3) + ')', Nat(v, D) !== undefined ? H.fmt(Nat(v, D), 3) : '—', D >= v.Dmin - 1e-9 ? '≥ D_min' : 'below D_min'], ok: D >= v.Dmin - 1e-9, pick: D === PF[i0], set: { Dsel: D } }));
    return H.table(['D (Table A2-1)', 'actual N (Eq. 12-24)', 'vs D_min'], rows, {
      caption: 'Preferred sizes around D_min = ' + H.fmt(v.Dmin) + ' in',
      note: 'Pick = next preferred size up (review Q1: 0.992 → 1.000; HW4 2023 P8: 2.72 → 2.75). A larger step is fine when neighbouring sections or shoulders need it (HW4: 1.50 chosen for 0.90).',
    });
  }
  // Table 11-1 (inch): over, to, W, H
  const T111 = [[0.3125, 0.4375, 0.09375, 0.09375], [0.4375, 0.5625, 0.125, 0.125], [0.5625, 0.875, 0.1875, 0.1875], [0.875, 1.25, 0.25, 0.25], [1.25, 1.375, 0.3125, 0.3125], [1.375, 1.75, 0.375, 0.375],
    [1.75, 2.25, 0.5, 0.5], [2.25, 2.75, 0.625, 0.625], [2.75, 3.25, 0.75, 0.75], [3.25, 3.75, 0.875, 0.875], [3.75, 4.5, 1.0, 1.0], [4.5, 5.5, 1.25, 1.25], [5.5, 6.5, 1.5, 1.5],
    [6.5, 7.5, 1.75, 1.5], [7.5, 9, 2.0, 1.5], [9, 11, 2.5, 1.75], [11, 13, 3.0, 2.0]];
  function keyTable(v) {
    if (!(v.dkey > 0)) return '';
    const k = T111.findIndex(r => v.dkey > r[0] + 1e-9 && v.dkey <= r[1] + 1e-9);
    if (k < 0) return '<div class="seltab-note">D = ' + H.fmt(v.dkey) + ' in is outside Table 11-1.</div>';
    const L = (W, Hh) => H.has(v, 'Tkey', 'Nk', 'syk', 'syw') ? Math.max(2 * v.Tkey / ((0.5 * v.syk * 1000 / v.Nk) * v.dkey * W), 4 * v.Tkey / ((v.syw * 1000 / v.Nk) * v.dkey * Hh)) : undefined;
    const rows = T111.map((r, i) => ({ r, i })).filter(o => Math.abs(o.i - k) <= 1).map(({ r, i }) => ({ cells: [r[0] + ' – ' + r[1], fr(r[2]) + ' × ' + fr(r[3]), L(r[2], r[3]) !== undefined ? H.fmt(L(r[2], r[3]), 3) : '—'], ok: i === k, pick: i === k, set: { W: r[2], Hk: r[3] } }));
    return H.table(['shaft D over – to (in)', 'key W × H (in)', 'L_min (in)'], rows, { caption: 'Table 11-1 key for D = ' + H.fmt(v.dkey) + ' in', note: 'Pick = the row containing D (sizes up to 6.5 in are square).' });
  }
  // Table 11-6 straight splines: torque capacity per inch = K D^2; course pin table (double shear, lb)
  const T116 = [['4', 'A', 139], ['4', 'B', 219], ['6', 'A', 143], ['6', 'B', 208], ['6', 'C', 270], ['10', 'A', 215], ['10', 'B', 326], ['10', 'C', 430], ['16', 'A', 344], ['16', 'B', 521], ['16', 'C', 688]];
  const PINS = { Clevis: [null, null, null, 6400, 11330, 25490, 45320, 70810, 101970, 138780, 181270], Dowel: [null, 800, 3200, 7200, 12800, 28700, 51000, 79800, 114000, 156000, 204000],
    Taper: [null, 700, 2900, 6600, 11800, 26400, 46900, 73400, 104900, 143500, 187700], Grooved: [200, 780, 3120, 6990, 12430, 27950, 49700, null, null, null, null],
    Spring: [null, 425, 2100, 4400, 7200, 17600, 25800, 46000, 66000, null, null], 'Spiral, heavy duty': [null, 450, 2100, 4400, 7700, 17600, 30000, 46000, 66000, null, null] };
  const PIND = [0.031, 0.062, 0.125, 0.188, 0.250, 0.375, 0.500, 0.625, 0.750, 0.875, 1.000];
  function altTables(v) {
    let out = '';
    if (v.Kreq > 0) {
      const fits = T116.filter(r => r[1] === (v.fit || 'B')); let k = -1; fits.forEach((r, i) => { if (r[2] >= v.Kreq && (k < 0 || r[2] < fits[k][2])) k = i; });
      out += H.table(['Splines', 'fit', 'K (T = K D^2 per in)', 'capacity at D, L (lb·in)', 'vs T'], fits.map((r, i) => ({ cells: [r[0], r[1], r[2], H.fmt(r[2] * v.dkey * v.dkey * v.Lsp, 5), H.fmt(r[2] / v.Kreq, 3)], ok: r[2] >= v.Kreq, pick: i === k })),
        { caption: 'Table 11-6 straight splines, fit ' + (v.fit || 'B') + ': need K ≥ T/(D^2 L) = ' + H.fmt(v.Kreq, 4), note: 'HW4 P6: K = 201 → 6 splines B (208) or 4 B (219); with a design factor 3 the course went to 16 splines.' });
    }
    if (v.Fpin > 0) {
      const need = v.Fpin * (v.npin || 1), col = PINS[v.ptype] || PINS.Dowel, dbl = !/single/.test(v.shear || ''), cap = i => col[i] === null ? null : (dbl ? col[i] : col[i] / 2);
      const kp = PIND.findIndex((d, i) => cap(i) !== null && cap(i) >= need);
      out += H.table(['Pin diameter (in)', v.ptype + (dbl ? ' (double shear)' : ' ÷ 2 (single shear)'), 'vs required'],
        PIND.map((d, i) => ({ d, i })).filter(o => cap(o.i) !== null && (kp < 0 ? o.i >= PIND.length - 2 : Math.abs(o.i - kp) <= 1)).map(({ d, i }) => ({ cells: [d.toFixed(3), H.fmt(cap(i), 6), H.fmt(cap(i) / need, 3)], ok: cap(i) >= need, pick: i === kp })),
        { caption: v.ptype + ' pin: need ' + H.fmt(need, 5) + ' lb', note: 'HW4 P6: F = 3262.5 lb × 3 → 0.250 in dowel (12 800 lb). A pin also acts as a mechanical fuse.' });
    }
    return out;
  }

  window.TOPIC = {
    id: 'shafts_keys', book: 'mott',
    title: 'Shafts & Keys',
    subtitle: 'Mott Ch. 12 Eq. 12-24 + Ch. 5 factors + Ch. 11 keys · Fizz pp. 106-122 (31 steps)',
    sibling: 'shafts_keys_shigley.html',
    intro: '<b>Section A</b> is the Fizz 31-step procedure (Mott Design Example 12-1): torque, component forces, then (from your own FBD and diagrams) <i>M</i>, <i>T</i>, <i>V</i> at one critical point; ' +
      '\\(K_t\\), \\(s\'_n = s_n C_m C_{st} C_R C_s\\), and <i>D</i> from Eq. 12-24 (or 12-16 for shear only), ×1.06 at ring grooves, rounded to a preferred size. Repeat per point. ' +
      '<b>Section B</b>: key (Table 11-1), spline and pin alternatives. Loaded example: Mott Ex. 12-1 point C and Ex. 11-1.',
    example: { P: 200, n: 600, ctype: 'spur gear', Dp: 10, phi: 20, N: 2, Mx: 12230, My: 16800, V: 0, feat: 'Profile keyseat', mat: 'SAE 1144 OQT 1000', su: 118, sy: 83, steel: 'Wrought steel', stress: 'bending (Cst = 1.0)', surf: 'Machined or cold drawn', sn: 42, rel: 0.99, Dguess: 4, Cs: 0.75, ring: 'no', Dsel: 4.0, dkey: 2.0, Tkey: 2965, W: 0.5, Hk: 0.5, keymat: 'SAE 1018', syk: 54, Nk: 3, Lhub: 1.75, Lsel: 1.5, Ck: 0.005 },

    assumptions: [
      { text: 'Torque \\(T = 63\\,000\\,P/n\\) (P in hp); torques along the shaft sum to zero', src: 'Fizz p.106', step: 'tq' },
      { text: 'Pressure angle φ = 20° unless the problem states otherwise', src: 'Fizz p.42', var: 'phi' },
      { text: 'Belt tension ratio \\(F_1/F_2\\) = 5 (V-belt) or 3 (flat) if not given → \\(F_{\\mathrm{shaft}} = 1.5\\) or \\(2.0 \\times 2T/D\\)', src: 'Fizz p.107', var: 'kb_' },
      { text: 'Keyseats are profile (K_t = 2.0) unless told otherwise; sled-runner 1.6', src: 'Fizz p.108 · Fizz p.109', var: 'feat' },
      { text: 'Gears / sheaves on well-rounded fillets (1.5); bearing seats press fit (1.0) with a sharp fillet (2.5) on the large side; ring grooves 3.0 and the diameter ×1.06', src: 'Fizz p.109 · Fizz p.112', step: 'kt' },
      { text: 'Wrought steel, C_m = 1.00, if the material type is not specified', src: 'Fizz p.109', var: 'steel' },
      { text: 'Bending stress, C_{st} = 1.0 (almost always)', src: 'Fizz p.109', var: 'stress' },
      { text: 'Surface machined or cold drawn when not specified (s_n from that curve of Fig. 5-11)', src: 'Fizz p.110', var: 'surf' },
      { text: 'Reliability 99 % as the safe guess → C_R = 0.81', src: 'Fizz p.111', var: 'rel' },
      { text: 'First-pass size factor C_s = 0.8 (≈ 2 in shaft); redo with a better C_s if the diameters come out far from 2 in (Mott Ex. 12-1 guesses 0.75)', src: 'Fizz p.111 · Fizz p.112', var: 'Cs', value: 0.8 },
      { text: 'Shaft design factor N = 3 (Mott uses 2.5–3; Ex. 12-1 uses 2); the guide gives no shaft value', src: 'Mott Sec. 12-5', var: 'N' },
      { text: 'Bearing seats: life = rpm × 60 × h/day × days/month × 12 × years, size the bearing in the ball-bearing calculator; seat diameter = its bore', src: 'Fizz p.113', step: 'round' },
      { text: 'Key material SAE 1018 (s_y = 54 ksi), weaker than the shaft so Eq. 11-5 applies', src: 'Fizz p.119', var: 'syk' },
      { text: 'Key design factor N = 3 if not given (HW4 2023 P8 used 4); keep the key ≤ 2 in (1–1.5 good, often the hub length) and secure it axially', src: 'Fizz p.121 · Fizz p.122', var: 'Nk' },
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
      { id: 't5-4', ref: 'Table 5-4', title: 'Size factor equations: C_s = 1 (D ≤ 0.3 in), \\((D/0.3)^{-0.11}\\) (0.3–2 in), 0.859 − 0.02125D (2–10 in)', src: 'figures/mott/table5-4.png', page: 198 },
      { id: 'ta2-1', ref: 'Table A2-1', title: 'Preferred basic sizes (fractional in, decimal in, mm) — Fizz Steps 25 and 30', src: 'figures/mott/tablea2-1.png', page: 801 },
      { id: 't14-3a', ref: 'Table 14-3', title: 'Deep-groove ball bearing bores (bearing seats must match a bore: Fizz Steps 22-24)', src: 'figures/mott/table14-3a.png', page: 589 },
      { id: 't11-1', ref: 'Table 11-1', title: 'Key size (W, H) vs shaft diameter, inch and metric', src: 'figures/mott/table11-1.png', page: 490, note: 'Sizes above the horizontal line are square.' },
      { id: 't11-4', ref: 'Table 11-4', title: 'Materials used for keys — su, sy (SAE 1018: sy = 54 ksi)', src: 'figures/mott/table11-4.png', page: 493 },
      { id: 'fig11-4', ref: 'Figure 11-4', title: 'Forces on a key: shear area WL, bearing area L(H/2), F = T/(D/2)', src: 'figures/mott/fig11-4.png', page: 494 },
      { id: 'proc11', ref: 'Sec. 11-4 procedure', title: 'Mott design procedure for parallel keys (10 steps)', src: 'figures/mott/proc11-4.png', page: 494 },
      { id: 'fig11-2', ref: 'Figure 11-2', title: 'Dimensions for parallel keyseats: chordal height Y, shaft keyseat S, hub keyway T', src: 'figures/mott/fig11-2.png', page: 491 },
      { id: 't11-2', ref: 'Table 11-2', title: 'Suggested fillet radii and key chamfers', src: 'figures/mott/table11-2.png', page: 491 },
      { id: 't11-5', ref: 'Table 11-5', title: 'Formulas for SAE straight splines (W, h, d for fits A, B, C)', src: 'figures/mott/table11-5.png', page: 497 },
      { id: 't11-6', ref: 'Table 11-6', title: 'Torque capacity of straight splines per inch of length: \\(T = K D^2\\)', src: 'figures/mott/table11-6.png', page: 497 },
      { id: 'pins', ref: 'Pin failure loads (course notes)', book: 'course', title: 'Nominal failure load in double shear (lb) for clevis, dowel, taper, grooved, spring and spiral pins', src: 'figures/course/pin_double_shear_failure_loads.png', note: 'Class-notes table used in HW4 P6; single shear ≈ half.' },
    ],

    sections: [
      { title: 'Section A · Loads (Fizz Steps 1–8)', steps: [
        { id: 'tq', title: 'Step 1 — torque at each component', eq: '12-1', formula: 'T = \\frac{63\\,000\\,P}{n}',
          text: 'Repeat per gear / sheave; the torques sum to zero. The torque diagram changes only at components, never at bearings.',
          vars: [
            { id: 'P', symbol: 'P', label: 'Power at this component', unit: 'hp', kind: 'input' },
            { id: 'n', symbol: 'n', label: 'Shaft speed', unit: 'rpm', kind: 'input' },
            { id: 'T1', symbol: 'T', label: 'Torque', unit: 'lb·in', kind: 'calc', digits: 5, compute: v => H.has(v, 'P', 'n') && v.n > 0 ? 63000 * v.P / v.n : undefined,
              work: v => v.T1 !== undefined ? '\\(T = \\dfrac{63\\,000(' + H.fmt(v.P) + ')}{' + H.fmt(v.n) + '} = ' + H.fmt(v.T1, 5) + '\\text{ lb·in}\\)' : null },
          ] },
        { id: 'forces', title: 'Step 2 — forces from the component', eq: '12-2 / 12-3 / 12-12 / 12-13', fig: ['fig12-4', 'fig12-6'],
          formula: 'W_t = \\frac{2T}{D} \\qquad W_r = W_t\\tan\\phi\\ \\text{(spur)},\\ W_t\\frac{\\tan\\phi_n}{\\cos\\psi}\\ \\text{(helical)},\\ W_t\\tan\\phi\\cos\\gamma\\ \\text{(bevel)} \\qquad W_x = W_t\\tan\\psi\\ \\text{(helical)},\\ W_t\\tan\\phi\\sin\\gamma\\ \\text{(bevel)} \\qquad F_{\\mathrm{shaft}} = \\frac{2T}{D}\\frac{k+1}{k-1}\\ \\text{(belts)}',
          text: 'Chain: \\(F = 2T/D\\) (Eq. 12-5). V-belt: \\(F_B = 1.5(2T/D)\\) (Eq. 12-12). Flat belt: \\(2.0(2T/D)\\) (Eq. 12-13). Resolve into x and y.',
          vars: [
            { id: 'ctype', label: 'Component', kind: 'choice', type: 'text', default: 'spur gear', options: ['spur gear', 'helical gear', 'bevel gear', 'chain sprocket', 'V-belt sheave', 'flat-belt pulley'] },
            { id: 'Dp', symbol: 'D', label: 'Pitch diameter', unit: 'in', kind: 'input' },
            { id: 'phi', symbol: '\\phi', label: 'Pressure angle (normal angle \\(\\phi_n\\) for helical)', unit: '°', kind: 'input', default: 20 },
            { id: 'psi', symbol: '\\psi', label: 'Helix angle (helical only)', unit: '°', kind: 'input' },
            { id: 'gam', symbol: '\\gamma', label: 'Pitch cone angle (bevel only)', unit: '°', kind: 'input' },
            { id: 'kb_', symbol: 'k', label: 'Belt tension ratio \\(F_1/F_2\\)', unit: '', kind: 'input', auto: v => /V-belt/.test(comp(v)) ? 5 : /flat/.test(comp(v)) ? 3 : undefined },
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
            { id: 'Fsh', symbol: 'F_{\\mathrm{shaft}}', label: 'Bending force on shaft (chain / belt)', unit: 'lb', kind: 'calc', digits: 4, compute: v => {
              if (v.Wt === undefined) return undefined; const c = comp(v);
              if (c === 'chain sprocket') return v.Wt;
              if (/belt/.test(c)) return H.has(v, 'kb_') && v.kb_ > 1 ? v.Wt * (v.kb_ + 1) / (v.kb_ - 1) : undefined;
              return undefined; } },
          ] },
        { id: 'pt', title: 'Steps 3–8 — resultant loads at the point being sized', fig: ['fig12-2'],
          formula: 'M = \\sqrt{M_x^2 + M_y^2} \\qquad V = \\sqrt{V_x^2 + V_y^2}',
          text: 'FBD (\\(\\Sigma F = 0\\), \\(\\Sigma M = 0\\) in both planes), shear / moment diagrams in both planes and the torque diagram; enter the resultants here. A bearing at the shaft end sees only shear (Eq. 12-16).',
          vars: [
            { id: 'Mx', symbol: 'M_x', label: 'Bending moment, x-plane', unit: 'lb·in', kind: 'input' },
            { id: 'My', symbol: 'M_y', label: 'Bending moment, y-plane', unit: 'lb·in', kind: 'input' },
            { id: 'M', symbol: 'M', label: 'Resultant bending moment', unit: 'lb·in', kind: 'input', auto: v => H.has(v, 'Mx', 'My') ? Math.hypot(v.Mx, v.My) : undefined, hint: 'blank → from M_x, M_y',
              work: v => H.has(v, 'Mx', 'My') ? '\\(M = \\sqrt{' + H.fmt(v.Mx, 5) + '^2 + ' + H.fmt(v.My, 5) + '^2} = ' + H.fmt(Math.hypot(v.Mx, v.My), 5) + '\\text{ lb·in}\\)' : null },
            { id: 'T', symbol: 'T', label: 'Torque at this point', unit: 'lb·in', kind: 'input', auto: v => v.T1, hint: '0 if outside the torque path (e.g. right of the last gear)' },
            { id: 'V', symbol: 'V', label: 'Resultant shear force (for shear-only points, e.g. bearing seats)', unit: 'lb', kind: 'input', default: 0 },
          ] },
      ] },

      { title: 'Section A · Stress concentration & strength (Steps 9–16)', steps: [
        { id: 'kt', title: 'Step 9 — stress concentration factor', fig: ['fig12-7', 'fig12-8', 'fig12-2'],
          text: 'Mott Sec. 12-4 values: profile keyseat 2.0, sled-runner 1.6, sharp fillet 2.5, well-rounded 1.5, ring groove 3.0, press-fit seat 1.0. Where two coincide use the larger; \\(K_t\\) multiplies only the bending term of Eq. 12-24.',
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
          text: '\\(s_n\\) from Fig. 5-11 (machined if not told), \\(C_R\\) Table 5-3. \\(C_s\\) needs a diameter: 0.8 first (review Q1 used 0.85 at 1.5 in), or enter a trial diameter.',
          vars: [
            { id: 'steel', label: 'Material type (Cm)', kind: 'choice', type: 'text', default: 'Wrought steel', options: Object.keys(CM) },
            { id: 'Cm', symbol: 'C_m', label: 'Material factor', unit: '', kind: 'calc', digits: 3, compute: v => CM[v.steel] },
            { id: 'stress', label: 'Type of stress (Cst)', kind: 'choice', type: 'text', default: 'bending (Cst = 1.0)', options: ['bending (Cst = 1.0)', 'axial tension (Cst = 0.8)'] },
            { id: 'Cst', symbol: 'C_{st}', label: 'Type-of-stress factor', unit: '', kind: 'calc', digits: 2, compute: v => v.stress ? (/axial/.test(v.stress) ? 0.8 : 1) : undefined },
            { id: 'surf', label: 'Surface condition (Fig. 5-11 curve)', kind: 'choice', type: 'text', default: 'Machined or cold drawn', options: Object.keys(SN) },
            { id: 'sn', symbol: 's_n', label: 'Endurance limit from Fig. 5-11', unit: 'ksi', kind: 'lookup', fig: 'fig5-11a', auto: v => H.has(v, 'su') && SN[v.surf] ? SN[v.surf][0] * Math.pow(v.su, SN[v.surf][1]) * 0.5 * Math.min(v.su, 200) : undefined, hint: 'auto is a curve-fit estimate — read the graph' },
            { id: 'rel', label: 'Desired reliability', kind: 'choice', default: 0.99, options: [0.5, 0.9, 0.99, 0.999] },
            { id: 'CRf', symbol: 'C_R', label: 'Reliability factor', unit: '', kind: 'lookup', fig: 't5-3', auto: v => CR[v.rel] },
            { id: 'Dguess', symbol: 'D_{\\mathrm{guess}}', label: 'Trial diameter for Cs', unit: 'in', kind: 'input', hint: 'blank → Cs = 0.8 (Fizz Step 15)' },
            { id: 'Cs', symbol: 'C_s', label: 'Size factor', unit: '', kind: 'lookup', fig: 'fig5-12', auto: v => v.Dguess !== undefined ? Cs(v.Dguess) : 0.8,
              work: v => v.Dguess !== undefined && Cs(v.Dguess) !== undefined ? '\\(C_s = ' + (v.Dguess <= 2 ? '(' + H.fmt(v.Dguess) + '/0.3)^{-0.11}' : '0.859 - 0.02125(' + H.fmt(v.Dguess) + ')') + ' = ' + H.fmt(Cs(v.Dguess)) + '\\)' : null },
            { id: 'snp', symbol: "s'_n", label: 'Modified endurance strength', unit: 'ksi', kind: 'calc', digits: 4, compute: v => H.has(v, 'sn', 'Cm', 'Cst', 'CRf', 'Cs') ? v.sn * v.Cm * v.Cst * v.CRf * v.Cs : undefined,
              work: v => v.snp !== undefined ? "\\(s'_n = " + H.fmt(v.sn) + '(' + H.fmt(v.Cm) + ')(' + H.fmt(v.Cst) + ')(' + H.fmt(v.CRf) + ')(' + H.fmt(v.Cs) + ') = ' + H.fmt(v.snp) + '\\text{ ksi}\\)' : null },
          ] },
      ] },

      { title: 'Section A · Diameter (Steps 17–25)', steps: [
        { id: 'dia', title: 'Steps 17–18 — minimum diameter', eq: '12-24 / 12-16', fig: ['ta2-1'],
          formula: "D = \\left[\\frac{32N}{\\pi}\\sqrt{\\left(\\frac{K_t M}{s'_n}\\right)^2 + \\frac{3}{4}\\left(\\frac{T}{s_y}\\right)^2}\\right]^{1/3} \\qquad D = \\sqrt{\\frac{2.94\\,K_t V N}{s'_n}}\\ \\text{(shear only)}",
          text: 'Eq. 12-24 for bending and/or torsion (also with M = 0, review Q1 at C); Eq. 12-16 where only shear acts; the larger governs. Ring groove: ×1.06.',
          vars: [
            { id: 'N', symbol: 'N', label: 'Design factor', unit: '', kind: 'input', default: 3 },
            { id: 'D24', symbol: 'D_{12\\text{-}24}', label: 'Diameter from Eq. 12-24', unit: 'in', kind: 'calc', digits: 4, compute: v => D24(v, v.Kt, v.M, v.T),
              work: v => v.D24 !== undefined ? '\\(D = \\left[\\dfrac{32(' + H.fmt(v.N) + ')}{\\pi}\\sqrt{\\left(\\dfrac{' + H.fmt(v.Kt) + '(' + H.fmt(v.M, 5) + ')}{' + H.fmt(v.snp * 1000, 5) + '}\\right)^2 + \\dfrac{3}{4}\\left(\\dfrac{' + H.fmt(v.T, 5) + '}{' + H.fmt(v.sy * 1000, 5) + '}\\right)^2}\\right]^{1/3} = ' + H.fmt(v.D24) + '\\text{ in}\\)' : null },
            { id: 'D16', symbol: 'D_{12\\text{-}16}', label: 'Diameter from Eq. 12-16 (shear only)', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'Kt', 'V', 'N', 'snp') && v.V > 0 ? Math.sqrt(2.94 * v.Kt * v.V * v.N / (v.snp * 1000)) : undefined,
              work: v => v.D16 !== undefined ? '\\(D = \\sqrt{\\dfrac{2.94(' + H.fmt(v.Kt) + ')(' + H.fmt(v.V) + ')(' + H.fmt(v.N) + ')}{' + H.fmt(v.snp * 1000, 5) + '}} = ' + H.fmt(v.D16) + '\\text{ in}\\)' : null },
            { id: 'ring', label: 'Retaining-ring groove at this point?', kind: 'choice', type: 'text', default: 'no', options: ['no', 'yes (×1.06)'] },
            { id: 'Dmin', symbol: 'D_{\\mathrm{min}}', label: 'Governing minimum diameter', unit: 'in', kind: 'calc', digits: 4, compute: v => { let d = v.D24; if (d === undefined && v.D16 !== undefined) d = v.D16; if (d === undefined) return undefined; if (v.D16 !== undefined && v.D16 > d) d = v.D16; if (/yes/.test(v.ring || '')) d *= 1.06; return d; },
              work: v => v.Dmin !== undefined && /yes/.test(v.ring || '') ? '\\(D_{\\mathrm{ring}} = 1.06 D = ' + H.fmt(v.Dmin) + '\\text{ in}\\)' : null },
            { id: 'Cs2', symbol: 'C_s', label: 'Cs at the computed diameter (Step 20 check)', unit: '', kind: 'calc', digits: 4, compute: v => Cs(v.Dmin) },
          ],
          after: v => {
            if (v.Dmin === undefined) return '';
            const re = (v.Cs2 !== undefined && v.Cs !== undefined && Math.abs(v.Cs2 - v.Cs) > 0.05) ? ' <span class="result-bad">C_s at this size is ' + H.fmt(v.Cs2, 3) + ' vs assumed ' + H.fmt(v.Cs, 3) + ' — do a 2nd iteration (Step 20): enter D_guess = ' + H.fmt(v.Dmin, 3) + '.</span>' : ' <span class="result-ok">C_s consistent with the assumed value ✔</span>';
            return '<span class="result-ok">D_min = ' + H.fmt(v.Dmin) + ' in at this point.</span>' + re;
          } },
        { id: 'round', title: 'Steps 19–25 — most restrictive diameter, bearing bore, preferred size', fig: ['ta2-1', 't14-3a'],
          text: 'Largest \\(D_{\\mathrm{min}}\\) of the points on a section; at bearing seats use the bearing bore (ball-bearing calculator), shoulders ≥ its S. Elsewhere round <i>up</i> to Table A2-1 (pick below).',
          vars: [
            { id: 'Dsel', symbol: 'D', label: 'Specified diameter at this point', unit: 'in', kind: 'lookup', fig: 'ta2-1', check: v => (H.has(v, 'Dsel', 'Dmin') && v.Dsel < v.Dmin) ? 'Smaller than Dmin' : null },
            { id: 'Nact', symbol: 'N', label: 'Actual design factor at D (Eq. 12-23 solved for N)', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'Dsel', 'Kt', 'M', 'T', 'snp', 'sy') && v.Dsel > 0 ? (() => { const s = Math.sqrt(Math.pow(v.Kt * v.M / (v.snp * 1000), 2) + 0.75 * Math.pow(v.T / (v.sy * 1000), 2)); return s > 0 ? Math.PI * Math.pow(v.Dsel, 3) / (32 * s) : undefined; })() : undefined },
          ],
          after: v => diaTable(v) + (!H.has(v, 'Dsel', 'Dmin') ? '' : v.Dsel >= v.Dmin ? '<span class="result-ok">D = ' + H.fmt(v.Dsel) + ' in ≥ ' + H.fmt(v.Dmin) + ' in ✔' + (v.Nact !== undefined ? ' (actual N = ' + H.fmt(v.Nact, 3) + ')' : '') + ' — repeat Section A for the next point.</span>' : '<span class="result-bad">Specified diameter is below the minimum.</span>') },
      ] },

      { title: 'Section B · Key design (Steps 26–31)', steps: [
        { id: 'ksize', title: 'Steps 26–27 — key material and size', fig: ['t11-4', 't11-1', 'proc11'],
          text: 'Width ≈ D/4 from Table 11-1 (pick below). SAE 1018 key (54 ksi) weaker than shaft and hub so Eq. 11-5 applies.',
          vars: [
            { id: 'dkey', symbol: 'D', label: 'Shaft diameter at the component', unit: 'in', kind: 'input', auto: v => v.Dsel },
            { id: 'Tkey', symbol: 'T', label: 'Torque at that point', unit: 'lb·in', kind: 'input', auto: v => v.T1 },
            { id: 'W', symbol: 'W', label: 'Key width', unit: 'in', kind: 'lookup', fig: 't11-1' },
            { id: 'Hk', symbol: 'H', label: 'Key height', unit: 'in', kind: 'lookup', fig: 't11-1', auto: v => v.W, hint: 'square key: H = W' },
            { id: 'keymat', label: 'Key material', kind: 'input', type: 'text', default: 'SAE 1018' },
            { id: 'syk', symbol: 's_y', label: 'Yield strength of the key', unit: 'ksi', kind: 'lookup', fig: 't11-4', default: 54 },
            { id: 'syw', symbol: 's_{y,min}', label: 'Lowest yield strength of key / shaft / hub (for bearing)', unit: 'ksi', kind: 'input', auto: v => v.syk, hint: 'defaults to the key' },
            { id: 'Nk', symbol: 'N', label: 'Design factor', unit: '', kind: 'input', default: 3 },
            { id: 'Lhub', symbol: 'L_{\\mathrm{hub}}', label: 'Hub length (if known)', unit: 'in', kind: 'input' },
          ],
          after: keyTable },
        { id: 'klen', title: 'Step 28 — minimum key length', eq: '11-2 / 11-4 / 11-5', fig: ['fig11-4'],
          formula: 'L_{\\mathrm{min}} = \\frac{4TN}{D\\,W\\,s_y}\\ \\text{(square key, key weakest)} \\qquad L_{\\mathrm{shear}} = \\frac{2T}{\\tau_d D W},\\ \\tau_d = \\frac{0.5 s_y}{N} \\qquad L_{\\mathrm{bear}} = \\frac{4T}{\\sigma_d D H},\\ \\sigma_d = \\frac{s_{y,min}}{N}',
          text: 'Square key, key weakest: Eq. 11-5. Otherwise the larger of shear (11-2) and bearing (11-4). Over 2 in → bigger shaft, two keys or stronger key.',
          vars: [
            { id: 'L5', symbol: 'L_{\\mathrm{min}}', label: 'Eq. 11-5 (square key, key weakest)', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'Tkey', 'Nk', 'dkey', 'W', 'syk') && v.dkey * v.W * v.syk > 0 ? 4 * v.Tkey * v.Nk / (v.dkey * v.W * v.syk * 1000) : undefined,
              work: v => v.L5 !== undefined ? '\\(L = \\dfrac{4(' + H.fmt(v.Tkey, 5) + ')(' + H.fmt(v.Nk) + ')}{(' + H.fmt(v.dkey) + ')(' + H.fmt(v.W) + ')(' + H.fmt(v.syk * 1000, 5) + ')} = ' + H.fmt(v.L5) + '\\text{ in}\\)' : null },
            { id: 'Lsh', symbol: 'L_{\\mathrm{shear}}', label: 'Eq. 11-2 (shear of key)', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'Tkey', 'Nk', 'dkey', 'W', 'syk') && v.dkey * v.W * v.syk > 0 ? 2 * v.Tkey / ((0.5 * v.syk * 1000 / v.Nk) * v.dkey * v.W) : undefined },
            { id: 'Lbr', symbol: 'L_{\\mathrm{bear}}', label: 'Eq. 11-4 (bearing / compression on weakest)', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'Tkey', 'Nk', 'dkey', 'Hk', 'syw') && v.dkey * v.Hk * v.syw > 0 ? 4 * v.Tkey / ((v.syw * 1000 / v.Nk) * v.dkey * v.Hk) : undefined },
            { id: 'Lmin', symbol: 'L_{\\mathrm{min}}', label: 'Required key length (governing)', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'Lsh', 'Lbr') ? Math.max(v.Lsh, v.Lbr) : undefined },
            { id: 'Lsel', symbol: 'L', label: 'Specified key length (Step 30, preferred size)', unit: 'in', kind: 'lookup', fig: 'ta2-1', hint: 'round up; ≤ hub length; keep clear of ring grooves / fillets',
              check: v => (H.has(v, 'Lsel', 'Lmin') && v.Lsel < v.Lmin) ? 'Shorter than required' : (H.has(v, 'Lsel', 'Lhub') && v.Lsel > v.Lhub) ? 'Longer than the hub — stronger key material or two keys' : null },
          ],
          after: v => v.Lmin === undefined ? '' : v.Lmin > 2 ? '<span class="result-bad">L_min = ' + H.fmt(v.Lmin) + ' in &gt; 2 in — increase the shaft diameter or key strength (Fizz Step 29).</span>' : '<span class="result-ok">Key ' + H.fmt(v.W) + ' × ' + H.fmt(v.Hk) + ' in, L_min = ' + H.fmt(v.Lmin) + ' in (' + (v.Lbr >= v.Lsh ? 'bearing' : 'shear') + ' governs)' + (v.Lsel !== undefined ? ' → specify ' + H.fmt(v.W) + ' × ' + H.fmt(v.Hk) + ' × ' + H.fmt(v.Lsel) + ' in' : '') + ' ✔</span>' },
        { id: 'kseat', title: 'Step 31 — keyseat and keyway dimensions', fig: ['fig11-2', 't11-2'],
          formula: 'Y = \\frac{D - \\sqrt{D^2 - W^2}}{2} \\qquad S = D - Y - \\frac{H}{2} = \\frac{D - H + \\sqrt{D^2 - W^2}}{2} \\qquad T = D - Y + \\frac{H}{2} + C = \\frac{D + H + \\sqrt{D^2 - W^2}}{2} + C',
          text: 'C = +0.005 in (parallel keys) or −0.020 in (taper keys). Mott Ex. 11-1: D = 2.000, ½ × ½ key → S = 1.718 in, T = 2.223 in.',
          vars: [
            { id: 'Ck', symbol: 'C', label: 'Allowance', unit: 'in', kind: 'choice', default: 0.005, options: [{ label: '+0.005 parallel key', value: 0.005 }, { label: '−0.020 taper key', value: -0.02 }] },
            { id: 'Y', symbol: 'Y', label: 'Chordal height', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'dkey', 'W') && v.dkey > v.W ? (v.dkey - Math.sqrt(v.dkey * v.dkey - v.W * v.W)) / 2 : undefined },
            { id: 'Sk', symbol: 'S', label: 'Shaft keyseat dimension', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'dkey', 'W', 'Hk') && v.dkey > v.W ? (v.dkey - v.Hk + Math.sqrt(v.dkey * v.dkey - v.W * v.W)) / 2 : undefined,
              work: v => v.Sk !== undefined ? '\\(S = \\dfrac{' + H.fmt(v.dkey) + ' - ' + H.fmt(v.Hk) + ' + \\sqrt{' + H.fmt(v.dkey) + '^2 - ' + H.fmt(v.W) + '^2}}{2} = ' + H.fmt(v.Sk) + '\\text{ in}\\)' : null },
            { id: 'Tk', symbol: 'T', label: 'Hub keyway dimension', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'dkey', 'W', 'Hk', 'Ck') && v.dkey > v.W ? (v.dkey + v.Hk + Math.sqrt(v.dkey * v.dkey - v.W * v.W)) / 2 + v.Ck : undefined,
              work: v => v.Tk !== undefined ? '\\(T = \\dfrac{' + H.fmt(v.dkey) + ' + ' + H.fmt(v.Hk) + ' + \\sqrt{' + H.fmt(v.dkey) + '^2 - ' + H.fmt(v.W) + '^2}}{2} + (' + H.fmt(v.Ck) + ') = ' + H.fmt(v.Tk) + '\\text{ in}\\)' : null },
          ],
          after: v => v.Sk !== undefined ? '<span class="result-ok">Keyseat: S = ' + H.fmt(v.Sk) + ' in (shaft), T = ' + H.fmt(v.Tk) + ' in (hub), depth H/2 = ' + H.fmt(v.Hk / 2) + ' in.</span>' : '' },
        { id: 'alt', title: 'Alternatives — spline or pin', eq: '11-9', fig: ['t11-5', 't11-6', 'pins'],
          formula: 'T = K D^2 L\\ \\ (\\text{Table 11-6}) \\qquad F = \\frac{T}{D/2},\\ \\ F_{\\mathrm{req}} = N F',
          text: 'Spline: required \\(K = T/(D^2 L)\\) with L = hub length; fit A permanent, B slides without load, C slides under load. Pin: compare N·F with the failure load. A retaining ring cannot transmit torque.',
          vars: [
            { id: 'Lsp', symbol: 'L', label: 'Spline length (hub length)', unit: 'in', kind: 'input', auto: v => v.Lhub },
            { id: 'fit', label: 'Spline fit', kind: 'choice', type: 'text', default: 'B', options: ['A', 'B', 'C'] },
            { id: 'Kreq', symbol: 'K_{\\mathrm{req}}', label: 'Required spline constant', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'Tkey', 'dkey', 'Lsp') && v.dkey * v.Lsp > 0 ? v.Tkey * (v.Nsp || 1) / (v.dkey * v.dkey * v.Lsp) : undefined,
              work: v => v.Kreq !== undefined ? '\\(K = \\dfrac{' + H.fmt(v.Nsp || 1) + '(' + H.fmt(v.Tkey, 5) + ')}{' + H.fmt(v.dkey) + '^2(' + H.fmt(v.Lsp) + ')} = ' + H.fmt(v.Kreq, 4) + '\\)' : null },
            { id: 'Nsp', symbol: 'N_{sp}', label: 'Design factor on spline torque', unit: '', kind: 'input', default: 1, hint: 'HW4 P6 used 1 (K = 201), then discussed 3' },
            { id: 'Fpin', symbol: 'F', label: 'Tangential force at the shaft surface', unit: 'lb', kind: 'calc', digits: 5, compute: v => H.has(v, 'Tkey', 'dkey') && v.dkey > 0 ? 2 * v.Tkey / v.dkey : undefined },
            { id: 'npin', symbol: 'N_{\\mathrm{pin}}', label: 'Design factor, pin', unit: '', kind: 'input', default: 3 },
            { id: 'ptype', label: 'Pin type', kind: 'choice', type: 'text', default: 'Dowel', options: Object.keys(PINS) },
            { id: 'shear', label: 'Pin loading', kind: 'choice', type: 'text', default: 'double shear (through the shaft)', options: ['double shear (through the shaft)', 'single shear'] },
          ],
          after: altTables },
      ] },
    ],
  };
})();
