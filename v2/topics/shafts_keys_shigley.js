/* Shafts & keys — Shigley 11e Ch. 7 (DE-Goodman / DE-Gerber, Secs 7-4, 7-7) with Ch. 6 Marin factors.
 * Procedure: Fizz bible pp. 106-122 (31 steps, written for Mott's equation) mapped onto Shigley's method:
 *   torque → component forces → (FBD / shear-moment diagrams by hand) → M, T at the critical point → Kt, q, Kf → Se → d → key.
 * Mech bible unit 5 (PDF p. 130) is empty.
 * Verified against: Shigley Ex. 7-2 point I, 2nd pass (1020 CD, Sut 68 / Sy 57 kpsi, Ma = 3651, Tm = 3240 lbf·in, d = 1.625 in,
 *   Kt 1.6 / Kts 1.35, q 0.82 / qs 0.85, ke = 1, n = 1.5): ka = 0.801, kb = 0.835, Se = 22.7 kpsi, Kf = 1.49, Kfs = 1.30,
 *   sigma'a = 12 910 psi, sigma'm = 8659 psi, nf = 1.44, ny = 2.64; Shigley Ex. 7-6 key (T = 4200 lbf·in, d = 1 7/16, 3/8 sq, 1018 CD 54 kpsi, n = 1.5):
 *   F = 5843 lbf, l = 0.75 in shear, 0.87 in crushing (Table 7-6 pick 3/8 x 3/8);
 *   HW4 2023/2024 P7 (Shigley 7-6 mod.: d 1.5, Se given 40, Sut 90, Kfb 2.0, Kfs 1.5, Kfa 2.3, Ma 973.1, Tm 1875, Fm 173 lbf): nf = 4.38 with and without the axial force;
 *   Tutorial 2022 Q3 (Ex. 7-6 8e/9e: d 2 in, 600 rpm): 5 hp -> T 525, F 525 lbf -> setscrew n 4: 2100 lbf -> 7/16 (2500); dowel double shear n 3: 1575 -> 0.125 (3200);
 *   taper single shear -> 0.188; 40 hp -> T 4200, Sy 70 kpsi, n 2.5: 1/2 x 3/8 key l = 0.80 in (crushing), 1/2 x 1/2 l = 0.60 in;
 *   HW4 P6 pin (Mott 11-4: 110 hp, 1700 rpm, d 2.5): F = 3262 lbf, n 3 -> 9787 lbf -> dowel 0.250 (12 800);
 *   Midterm 2014 Q25 (SI, DE-Soderberg: Sut 820, Sy 650, Se 280 MPa, Kf 1.75, Kfs 2.2, Ma 95, Tm 52 N·m, n 1.8): d = 23.9 mm. */
(function () {
  const KA = { 'Ground': [1.21, -0.067, 1.38], 'Machined or cold-drawn': [2.00, -0.217, 3.04], 'Hot-rolled': [11.0, -0.650, 38.6], 'As-forged': [12.7, -0.758, 54.9] };   // a (kpsi), b, a (MPa)
  const SI = v => /SI/.test(v.sys || ''), sF = v => SI(v) ? 1 : 1000, mF = v => SI(v) ? 1000 : 1;   // strength → psi | MPa, moment → lbf·in | N·mm
  const kaOf = v => H.has(v, 'Sut') && KA[v.surf] ? (SI(v) ? KA[v.surf][2] : KA[v.surf][0]) * Math.pow(v.Sut, KA[v.surf][1]) : undefined;
  const KE = { 50: 1.000, 90: 0.897, 95: 0.868, 99: 0.814, 99.9: 0.753, 99.99: 0.702 };
  const KT1 = { // Table 7-1 first-iteration estimates [Kt bending, Kts torsion]
    'Shoulder fillet — sharp (r/d = 0.02)': [2.7, 2.2], 'Shoulder fillet — well rounded (r/d = 0.1)': [1.7, 1.5],
    'Profile (end-mill) keyseat (r/d = 0.02)': [2.14, 3.0], 'Sled-runner keyseat (K_ts not tabulated → 3.0 used)': [1.7, 3.0], 'Retaining-ring groove': [5.0, 3.0], 'Bearing seat, press fit / plain (K_t = 1)': [1, 1], 'Chart value (enter below)': [undefined, undefined] };
  const kbIn = d => d === undefined ? undefined : d <= 0.3 ? 1 : d <= 2 ? Math.pow(d / 0.3, -0.107) : 0.91 * Math.pow(d, -0.157);
  const kbMm = d => d === undefined ? undefined : d <= 7.62 ? 1 : d <= 51 ? Math.pow(d / 7.62, -0.107) : 1.51 * Math.pow(d, -0.157);
  const kbV = (v, d) => SI(v) ? kbMm(d) : kbIn(d);
  const neuberB = S => 0.246 - 3.08e-3 * S + 1.51e-5 * S * S - 2.67e-8 * S * S * S;   // √a bending, Sut kpsi
  const neuberT = S => 0.190 - 2.51e-3 * S + 1.35e-5 * S * S - 2.67e-8 * S * S * S;   // √a torsion
  const AB = v => {
    if (!H.has(v, 'Kf', 'Kfs', 'Ma', 'Mm', 'Ta', 'Tm')) return undefined;
    const m = mF(v); return { A: m * Math.sqrt(4 * Math.pow(v.Kf * v.Ma, 2) + 3 * Math.pow(v.Kfs * v.Ta, 2)), B: m * Math.sqrt(4 * Math.pow(v.Kf * v.Mm, 2) + 3 * Math.pow(v.Kfs * v.Tm, 2)) };
  };
  const dGood = v => { const r = AB(v); return r && H.has(v, 'n', 'Se', 'Sut') ? Math.cbrt(16 * v.n / Math.PI * (r.A / (v.Se * sF(v)) + r.B / (v.Sut * sF(v)))) : undefined; };
  const dSod = v => { const r = AB(v); return r && H.has(v, 'n', 'Se', 'Sy') ? Math.cbrt(16 * v.n / Math.PI * (r.A / (v.Se * sF(v)) + r.B / (v.Sy * sF(v)))) : undefined; };
  const dGerb = v => { const r = AB(v); if (!r || !H.has(v, 'n', 'Se', 'Sut') || r.A === 0) return undefined; const Se = v.Se * sF(v), Sut = v.Sut * sF(v); return Math.cbrt(8 * v.n * r.A / (Math.PI * Se) * (1 + Math.sqrt(1 + Math.pow(2 * r.B * Se / (r.A * Sut), 2)))); };
  const dShear = v => H.has(v, 'Kfs', 'V', 'n', 'Se') && v.V > 0 ? Math.sqrt(2.94 * v.Kfs * v.V * v.n / (v.Se * sF(v))) : undefined;   // Mott 12-16 form with Shigley Se
  const comp = v => v.ctype || '';
  const SeAt = (v, d) => v.Segiven !== undefined ? v.Segiven : (H.has(v, 'ka', 'kc', 'kd', 'ke', 'kf', 'Sep') && kbV(v, d) !== undefined ? v.ka * kbV(v, d) * v.kc * v.kd * v.ke * v.kf * v.Sep : undefined);
  // von Mises stresses at diameter d (Eqs 6-66/6-67 with axial terms)
  const vm = (v, d, alt) => {
    if (!H.has(v, 'Kf', 'Kfs') || !(d > 0)) return undefined;
    const M = (alt ? v.Ma : v.Mm) * mF(v), T = (alt ? v.Ta : v.Tm) * mF(v), P = (alt ? v.Fax : v.Fmx) || 0, Kfa = v.Kfa !== undefined ? v.Kfa : v.Kf;
    if (!isFinite(M) || !isFinite(T)) return undefined;
    const sb = v.Kf * 32 * M / (Math.PI * d * d * d) + Kfa * 4 * P / (Math.PI * d * d), t = v.Kfs * 16 * T / (Math.PI * d * d * d);
    return Math.sqrt(sb * sb + 3 * t * t);
  };
  const nfAt = (v, d) => { const sa = vm(v, d, true), sm = vm(v, d, false), Se = SeAt(v, d); return sa !== undefined && sm !== undefined && Se && v.Sut ? 1 / (sa / (Se * sF(v)) + (sm / ((/Soderberg/.test(v.crit || '') ? v.Sy : v.Sut) * sF(v)))) : undefined; };
  const nyAt = (v, d) => { const sa = vm(v, d, true), sm = vm(v, d, false); return sa !== undefined && sm !== undefined && v.Sy && sa + sm > 0 ? v.Sy * sF(v) / (sa + sm) : undefined; };
  // Table A-17 fractional preferred sizes (in)
  const PM = [5, 6, 8, 10, 11, 12, 14, 16, 18, 20, 22, 25, 28, 30, 32, 35, 40, 45, 50, 60, 80, 100, 120, 140, 160, 180, 200, 250, 300];
  const PF = [0.25, 0.3125, 0.375, 0.4375, 0.5, 0.5625, 0.625, 0.6875, 0.75, 0.875, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4, 4.25, 4.5, 4.75, 5, 5.25, 5.5, 5.75, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];
  const fr = x => { const w = Math.floor(x + 1e-9), f = x - w; if (f < 1e-6) return String(w); let den = 16, num = Math.round(f * 16); while (num % 2 === 0) { num /= 2; den /= 2; } return (w ? w + ' ' : '') + num + '/' + den; };
  function diaTable(v) {
    if (!(v.dmin > 0) || !(v.n > 0)) return '';
    const L = SI(v) ? PM : PF, i0 = L.findIndex(x => x >= v.dmin - 1e-9); if (i0 < 0) return '';
    let picked = false;
    const rows = L.slice(Math.max(0, i0 - 1), i0 + 3).map(d => {
      const nf = nfAt(v, d), ny = nyAt(v, d), ok = nf !== undefined && ny !== undefined ? nf >= v.n && ny >= v.n : d >= v.dmin;
      const pk = ok && !picked; if (pk) picked = true;
      return { cells: [SI(v) ? d + ' mm' : fr(d) + ' (' + H.fmt(d, 4) + ')', H.fmt(kbV(v, d), 3), nf !== undefined ? H.fmt(nf, 3) : '—', ny !== undefined ? H.fmt(ny, 3) : '—', d >= v.dmin - 1e-9 ? '≥ d_min' : 'below d_min'], ok, pick: pk, set: { dsel: d } };
    });
    return H.table(['d (Table A-17)', 'k_b', 'n_f (' + (/Soderberg/.test(v.crit || '') ? 'Soderberg' : 'Goodman') + ')', 'n_y', 'vs d_min'], rows, {
      caption: 'Preferred diameters around d_min = ' + H.fmt(v.dmin) + (SI(v) ? ' mm' : ' in') + ' (design factor ' + H.fmt(v.n) + ')',
      note: 'Pick = smallest preferred size with n_f and n_y ≥ the design factor (k_b re-evaluated at each d). Ex. 7-2 tried 1.625 in (below its 1.69 estimate): n_f = 1.44 at the shoulder.',
    });
  }
  // Table 7-6: over, to, w, h
  const T76 = [[5 / 16, 7 / 16, 3 / 32, 3 / 32], [7 / 16, 9 / 16, 1 / 8, 3 / 32], [7 / 16, 9 / 16, 1 / 8, 1 / 8], [9 / 16, 7 / 8, 3 / 16, 1 / 8], [9 / 16, 7 / 8, 3 / 16, 3 / 16],
    [7 / 8, 1.25, 1 / 4, 3 / 16], [7 / 8, 1.25, 1 / 4, 1 / 4], [1.25, 1.375, 5 / 16, 1 / 4], [1.25, 1.375, 5 / 16, 5 / 16], [1.375, 1.75, 3 / 8, 1 / 4], [1.375, 1.75, 3 / 8, 3 / 8],
    [1.75, 2.25, 1 / 2, 3 / 8], [1.75, 2.25, 1 / 2, 1 / 2], [2.25, 2.75, 5 / 8, 7 / 16], [2.25, 2.75, 5 / 8, 5 / 8], [2.75, 3.25, 3 / 4, 1 / 2], [2.75, 3.25, 3 / 4, 3 / 4]];
  const lsh = (v, w) => H.has(v, 'Fk', 'nk', 'Syk') ? v.Fk * v.nk / (0.577 * v.Syk * 1000 * w) : undefined;
  const lcr = (v, h) => H.has(v, 'Fk', 'nk', 'Syk') ? 2 * v.Fk * v.nk / (v.Syk * 1000 * h) : undefined;
  function keyTable(v) {
    if (!(v.dkey > 0)) return '';
    const inR = r => v.dkey > r[0] + 1e-9 && v.dkey <= r[1] + 1e-9;
    const k = T76.findIndex(r => inR(r) && Math.abs(r[2] - r[3]) < 1e-9);
    if (k < 0) return '<div class="seltab-note">d = ' + H.fmt(v.dkey) + ' in is outside Table 7-6 (5/16 – 3 1/4 in).</div>';
    const rows = T76.map((r, i) => ({ r, i })).filter(o => inR(o.r) || Math.abs(o.i - k) <= 2).map(({ r, i }) => {
      const a = lsh(v, r[2]), b = lcr(v, r[3]);
      return { cells: [fr(r[0]) + ' – ' + fr(r[1]), fr(r[2]) + ' × ' + fr(r[3]), fr(r[3] / 2), a !== undefined ? H.fmt(Math.max(a, b), 3) : '—'], ok: inR(r), pick: i === k, set: { w: r[2], hk: r[3] } };
    });
    return H.table(['shaft d over – to (in)', 'key w × h (in)', 'keyway depth h/2', 'l_min (in)'], rows, {
      caption: 'Table 7-6 keys for d = ' + H.fmt(v.dkey) + ' in',
      note: 'Pick = the square key (h = w) in the shaft-diameter row; the rectangular one is the alternative (tutorial Q3: ½ × ⅜ needs 0.80 in, ½ × ½ needs 0.60 in).',
    });
  }
  // Table 7-4 setscrews and the course pin table (double shear, lbf)
  const T74 = [['#10', 540], ['1/4', 1000], ['5/16', 1500], ['3/8', 2000], ['7/16', 2500], ['1/2', 3000], ['9/16', 3500], ['5/8', 4000], ['3/4', 5000], ['7/8', 6000], ['1', 7000]];
  const PINS = { Clevis: [null, null, null, 6400, 11330, 25490, 45320, 70810, 101970, 138780, 181270], Dowel: [null, 800, 3200, 7200, 12800, 28700, 51000, 79800, 114000, 156000, 204000],
    Taper: [null, 700, 2900, 6600, 11800, 26400, 46900, 73400, 104900, 143500, 187700], Grooved: [200, 780, 3120, 6990, 12430, 27950, 49700, null, null, null, null],
    Spring: [null, 425, 2100, 4400, 7200, 17600, 25800, 46000, 66000, null, null], 'Spiral, heavy duty': [null, 450, 2100, 4400, 7700, 17600, 30000, 46000, 66000, null, null] };
  const PIND = [0.031, 0.062, 0.125, 0.188, 0.250, 0.375, 0.500, 0.625, 0.750, 0.875, 1.000];
  function pinTables(v) {
    if (!(v.Fpin > 0)) return '';
    const need = v.Fpin * (v.npin || 1), needS = v.Fpin * (v.nset || 1), dbl = !/single/.test(v.shear || '');
    let out = '';
    const ks = T74.findIndex(r => r[1] >= needS);
    out += H.table(['Setscrew size (in)', 'holding power (lbf)', 'vs required'], T74.filter((r, i) => ks < 0 ? i >= T74.length - 2 : Math.abs(i - ks) <= 1).map(r => ({ cells: [r[0], r[1], H.fmt(r[1] / needS, 3)], ok: r[1] >= needS, pick: r === T74[ks] })),
      { caption: 'Cup-point setscrew (Table 7-4): need ' + H.fmt(needS, 5) + ' lbf', note: 'Setscrew diameter ≈ ¼ of the shaft diameter is the usual rule.' });
    const col = PINS[v.ptype] || PINS.Dowel, cap = i => col[i] === null ? null : (dbl ? col[i] : col[i] / 2);
    const kp = PIND.findIndex((d, i) => cap(i) !== null && cap(i) >= need);
    out += H.table(['Pin diameter (in)', v.ptype + ' failure load' + (dbl ? ' (double shear)' : ' ÷ 2 (single shear)'), 'vs required'],
      PIND.map((d, i) => ({ d, i })).filter(o => cap(o.i) !== null && (kp < 0 || Math.abs(o.i - kp) <= 1)).map(({ d, i }) => ({ cells: [d.toFixed(3), H.fmt(cap(i), 6), H.fmt(cap(i) / need, 3)], ok: cap(i) >= need, pick: i === kp })),
      { caption: v.ptype + ' pin: need ' + H.fmt(need, 5) + ' lbf', note: 'Failure load = tangential force at the shaft–hub interface; a pin through the shaft is in double shear.' });
    return out;
  }

  window.TOPIC = {
    id: 'shafts_keys', book: 'shigley',
    title: 'Shafts & Keys',
    subtitle: 'Shigley Ch. 7 (DE-Goodman / DE-Gerber) + Ch. 6 Marin factors · Fizz pp. 106-122',
    sibling: 'shafts_keys_mott.html',
    intro: '<b>Section A</b> sizes the shaft at one critical point: torque and component forces, then (from your own FBD and moment/torque diagrams) <i>M</i>, <i>T</i>, <i>V</i> there; ' +
      'stress concentration → \\(K_{f}\\), Marin factors → \\(S_{e}\\), DE-Goodman Eq. 7-8 → <i>d</i>, then re-check \\(n_{f}\\), \\(n_{y}\\) at the rounded size. Repeat per point. ' +
      '<b>Section B</b> sizes the key (Table 7-6) and alternatives (setscrew, pin). Loaded example: Shigley Ex. 7-2 point I and Ex. 7-6.',
    example: { H: 30.84, nrpm: 600, ctype: 'spur gear', Dp: 12, phi: 20, Ma: 3651, Mm: 0, Ta: 0, Tm: 3240, V: 0, mat: '1020 CD', Sut: 68, Sy: 57, surf: 'Machined or cold-drawn', dguess: 1.625, kc: 1, kd: 1, rel: 50, kf: 1, feat: 'Chart value (enter below)', Kt: 1.6, Kts: 1.35, r: 0.16, q: 0.82, qs: 0.85, n: 1.5, crit: 'DE-Goodman (Eq. 7-8)', ring: 'no', dsel: 1.625, dkey: 1.4375, Tkey: 4200, w: 0.375, hk: 0.375, Syk: 54, nk: 1.5, Lhub: 1.75, Ck: 0.005 },

    assumptions: [
      { text: 'Torque \\(T = 63\\,025\\,H/n\\) (Fizz writes 63 000); torques along the shaft sum to zero', src: 'Fizz p.106', step: 'tq' },
      { text: 'Pressure angle φ = 20° unless stated', src: 'Fizz p.42', var: 'phi' },
      { text: 'Belt tension ratio \\(F_1/F_2\\) = 5 (V-belt) or 3 (flat) if not given → \\(F_{\\mathrm{shaft}} = (2T/D)(k+1)/(k-1)\\)', src: 'Fizz p.107', var: 'kb_' },
      { text: 'Keyseats are profile (end-milled) unless told otherwise — Table 7-1: K_t = 2.14, K_{ts} = 3.0 (Fizz/Mott 2.0)', src: 'Fizz p.108 · Fizz p.109', var: 'feat' },
      { text: 'Gears / sheaves sit on well-rounded fillets (K_t = 1.7, K_{ts} = 1.5); bearing seats: press fit (K_t = 1) with a sharp fillet on the large side (2.7 / 2.2); ring grooves 5.0 and ×1.06 on d', src: 'Fizz p.109 · Fizz p.112', step: 'kt' },
      { text: 'Wrought steel, k_f = 1 (Fizz C_m = 1); combined bending + torsion, k_c = 1 (Fizz C_{st} = 1)', src: 'Fizz p.109', var: 'kf' },
      { text: 'Surface machined or cold drawn when not specified', src: 'Fizz p.110', var: 'surf' },
      { text: 'Reliability 99 % as the safe guess (k_e = 0.814 ↔ Fizz C_R = 0.81); Ex. 7-2 uses k_e = 1', src: 'Fizz p.111', var: 'rel', value: 99 },
      { text: 'First-pass size factor 0.8 (≈ 2 in shaft) until d is known, then iterate (Ex. 7-2 guesses 0.9)', src: 'Fizz p.111 · Fizz p.112', var: 'kb', value: 0.8 },
      { text: 'Temperature factor k_d = 1 (room temperature)', src: 'Shigley Ex. 7-2', var: 'kd' },
      { text: 'Shaft design factor n = 1.5 (Shigley Ex. 7-2); Mott uses 2.5–3', src: 'Shigley Ex. 7-2', var: 'n' },
      { text: 'Key material SAE 1018 (S_y = 54 kpsi), weaker than shaft and hub', src: 'Fizz p.119', var: 'Syk' },
      { text: 'Key design factor 3 if not given (Ex. 7-6 uses 1.5); keep the key ≤ 2 in long (1–1.5 good) and secure it axially', src: 'Fizz p.121 · Fizz p.122', var: 'nk' },
      { text: 'Keyseat allowance C = +0.005 in for parallel keys (−0.020 in taper keys)', src: 'Fizz p.122', var: 'Ck' },
    ],

    figures: [
      { id: 'fig12-4', ref: 'Figure 12-4', book: 'mott', title: 'Directions of forces on mating spur gears (Fizz Step 2a diagram)', src: 'figures/mott/fig12-4.png', page: 530 },
      { id: 'fig12-6', ref: 'Figure 12-6', book: 'mott', title: 'Forces on belt sheaves: \\(F_1, F_2\\), net torque and bending force \\(F_B = F_1 + F_2\\)', src: 'figures/mott/fig12-6.png', page: 532 },
      { id: 'fig7-10', ref: 'Figure 7-10', title: 'Shaft layout of Ex. 7-2: gears, bearings, shoulders, retaining rings — the critical points', src: 'figures/shigley/fig7-10.png', page: 407 },
      { id: 'fig12-2', ref: 'Figure 12-2', book: 'mott', title: 'Typical shaft geometry: sharp fillets at bearing seats, well-rounded at gears, profile keyseats, ring groove', src: 'figures/mott/fig12-2.png', page: 529 },
      { id: 'ta-20', ref: 'Table A-20', title: 'ASTM minimum tensile & yield strengths, hot-rolled and cold-drawn steels', src: 'figures/shigley/tablea-20.png', page: 1077, note: 'Ex. 7-2: 1020 CD, S_ut = 68, S_y = 57 kpsi.' },
      { id: 't6-2', ref: 'Table 6-2', title: 'Surface factor \\(k_a = a S_{ut}^b\\) parameters (Eq. 6-18)', src: 'figures/shigley/table6-2.png', page: 332 },
      { id: 'fig6-24', ref: 'Figure 6-24', title: 'Surface factor k_a vs S_ut for common finishes', src: 'figures/shigley/fig6-24.png', page: 331 },
      { id: 'eq6-19', ref: 'Eq. (6-19)', title: 'Size factor k_b for rotating round bars (k_b = 1 for d < 0.3 in and for axial loading)', src: 'figures/shigley/eq6-19.png', page: 333 },
      { id: 't6-4', ref: 'Table 6-4', title: 'Reliability factor k_e (50 % → 1.000 … 99 % → 0.814)', src: 'figures/shigley/table6-4.png', page: 338 },
      { id: 't7-1', ref: 'Table 7-1', title: 'First-iteration estimates of K_t and K_{ts}: shoulders, keyseats, retaining-ring groove', src: 'figures/shigley/table7-1.png', page: 407,
        note: 'Use until dimensions are known; then Figs A-15-8/9 (shoulder), A-15-14/15 (groove), A-15-16/17 (ring groove).' },
      { id: 'a15-9', ref: 'Figure A-15-9', title: 'K_t — round shaft with shoulder fillet in bending', src: 'figures/shigley/figa-15-9.png', page: 1065 },
      { id: 'a15-8', ref: 'Figure A-15-8', title: 'K_{ts} — round shaft with shoulder fillet in torsion', src: 'figures/shigley/figa-15-8.png', page: 1065 },
      { id: 'a15-14', ref: 'Figure A-15-14', title: 'K_t — grooved round bar in bending', src: 'figures/shigley/figa-15-14.png', page: 1067 },
      { id: 'a15-15', ref: 'Figure A-15-15', title: 'K_{ts} — grooved round bar in torsion', src: 'figures/shigley/figa-15-15.png', page: 1067 },
      { id: 'a15-16', ref: 'Figure A-15-16', title: 'K_t — flat-bottom (retaining-ring) groove in bending', src: 'figures/shigley/figa-15-16.png', page: 1068 },
      { id: 'a15-17', ref: 'Figure A-15-17', title: 'K_{ts} — flat-bottom groove in torsion', src: 'figures/shigley/figa-15-17.png', page: 1069 },
      { id: 'fig6-26', ref: 'Figure 6-26', title: 'Notch sensitivity q, reversed bending / axial, vs notch radius and S_ut', src: 'figures/shigley/fig6-26.png', page: 342 },
      { id: 'fig6-27', ref: 'Figure 6-27', title: 'Notch sensitivity q_s, reversed torsion', src: 'figures/shigley/fig6-27.png', page: 343 },
      { id: 'ta-17', ref: 'Table A-17', title: 'Preferred sizes (fractional / decimal inches, mm)', src: 'figures/shigley/tablea-17.png', page: 1072 },
      { id: 't7-6', ref: 'Table 7-6', title: 'Inch dimensions for standard square and rectangular keys vs shaft diameter (w, h, keyway depth)', src: 'figures/shigley/table7-6.png', page: 424 },
      { id: 't7-4', ref: 'Table 7-4', title: 'Typical holding power of cup-point socket setscrews (seating torque, lbf)', src: 'figures/shigley/table7-4.png', page: 422 },
      { id: 'pins', ref: 'Pin failure loads (course notes)', book: 'course', title: 'Nominal failure load in double shear (lb) for clevis, dowel, taper, grooved, spring and spiral pins', src: 'figures/course/pin_double_shear_failure_loads.png', note: 'Class-notes table used in HW4 P6 and the 2022 tutorial; single shear ≈ half.' },
      { id: 'fig7-17', ref: 'Figure 7-17', title: 'Gib-head key and Woodruff key', src: 'figures/shigley/fig7-17.png', page: 424 },
      { id: 'fig7-19', ref: 'Figure 7-19', title: 'Key force geometry (Ex. 7-6): F = T/r, shear across a-b, crushing on half the face', src: 'figures/shigley/fig7-19.png', page: 427 },
      { id: 'fig11-2', ref: 'Figure 11-2', book: 'mott', title: 'Keyseat / keyway dimensions Y, S, T (Fizz Step 31 — Shigley has no equivalent)', src: 'figures/mott/fig11-2.png', page: 491 },
    ],

    sections: [
      { title: 'Section A · Shaft diameter — loads', steps: [
        { id: 'tq', title: 'Step 1 — torque from power and speed', eq: '3-42', formula: 'T = \\frac{63\\,025\\,H}{n}',
          text: 'Do this for every gear / sheave; the torques along the shaft must sum to zero.',
          vars: [
            { id: 'sys', label: 'Units for Section A', kind: 'choice', type: 'text', default: 'US: lbf·in, kpsi, in', options: ['US: lbf·in, kpsi, in', 'SI: N·m, MPa, mm'], hint: 'SI: moments in N·m, strengths in MPa, d in mm (keys stay in inches)' },
            { id: 'H', symbol: 'H', label: 'Power at the component', unit: 'hp', kind: 'input' },
            { id: 'nrpm', symbol: 'n', label: 'Shaft speed', unit: 'rev/min', kind: 'input' },
            { id: 'T1', symbol: 'T', label: 'Torque', unit: 'lbf·in', kind: 'calc', digits: 5, compute: v => H.has(v, 'H', 'nrpm') && v.nrpm > 0 ? 63025 * v.H / v.nrpm : undefined,
              work: v => v.T1 !== undefined ? '\\(T = \\dfrac{63\\,025(' + H.fmt(v.H) + ')}{' + H.fmt(v.nrpm) + '} = ' + H.fmt(v.T1, 5) + '\\text{ lbf·in}\\)' : null },
          ] },
        { id: 'forces', title: 'Step 2 — forces from the component', fig: ['fig12-4', 'fig12-6'],
          formula: 'W_t = \\frac{2T}{D} \\qquad W_r = W_t\\tan\\phi\\ \\text{(spur)},\\ W_t\\frac{\\tan\\phi_n}{\\cos\\psi}\\ \\text{(helical)},\\ W_t\\tan\\phi\\cos\\gamma\\ \\text{(bevel)} \\qquad W_x = W_t\\tan\\psi\\ \\text{(helical)},\\ W_t\\tan\\phi\\sin\\gamma\\ \\text{(bevel)} \\qquad F_{\\mathrm{shaft}} = \\frac{2T}{D}\\frac{k+1}{k-1}\\ \\text{(belts)}',
          text: 'Chain: \\(F = 2T/D\\); V-belt k = 5 → \\(1.5(2T/D)\\); flat belt k = 3 → \\(2.0(2T/D)\\). Resolve into x and y for the FBD.',
          vars: [
            { id: 'ctype', label: 'Component', kind: 'choice', type: 'text', default: 'spur gear', options: ['spur gear', 'helical gear', 'bevel gear', 'chain sprocket', 'V-belt sheave', 'flat-belt pulley'] },
            { id: 'Dp', symbol: 'D', label: 'Pitch diameter', unit: 'in', kind: 'input' },
            { id: 'phi', symbol: '\\phi', label: 'Pressure angle (normal angle \\(\\phi_n\\) for helical)', unit: '°', kind: 'input', default: 20 },
            { id: 'psi', symbol: '\\psi', label: 'Helix angle (helical only)', unit: '°', kind: 'input' },
            { id: 'gam', symbol: '\\gamma', label: 'Pitch cone angle of this gear (bevel only)', unit: '°', kind: 'input' },
            { id: 'kb_', symbol: 'k', label: 'Belt tension ratio \\(F_1/F_2\\) (belts only)', unit: '', kind: 'input', auto: v => /V-belt/.test(comp(v)) ? 5 : /flat/.test(comp(v)) ? 3 : undefined },
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
            { id: 'Fsh', symbol: 'F_{\\mathrm{shaft}}', label: 'Bending force on shaft (chain / belt)', unit: 'lbf', kind: 'calc', digits: 4, compute: v => {
              if (v.Wt === undefined) return undefined; const c = comp(v);
              if (c === 'chain sprocket') return v.Wt;
              if (/belt/.test(c)) return H.has(v, 'kb_') && v.kb_ > 1 ? v.Wt * (v.kb_ + 1) / (v.kb_ - 1) : undefined;
              return undefined; } },
          ] },
        { id: 'pt', title: 'Steps 3–8 — loads at the critical point (from your FBD and diagrams)', fig: ['fig7-10'],
          formula: 'M = \\sqrt{M_x^2 + M_y^2} \\qquad V = \\sqrt{V_x^2 + V_y^2}',
          text: 'Solve \\(\\Sigma F = 0\\), \\(\\Sigma M = 0\\) for the reactions, draw shear/moment diagrams in both planes and the torque diagram (torque changes only at gears/sheaves). Rotating shaft, steady loads: \\(M_{a}\\) = resultant moment, \\(T_{m}\\) = torque, \\(M_{m}\\) = \\(T_{a}\\) = 0.',
          vars: [
            { id: 'Mx', symbol: 'M_x', label: 'Bending moment, plane 1', unit: 'lbf·in | N·m', kind: 'input', hint: 'optional helper' },
            { id: 'My', symbol: 'M_y', label: 'Bending moment, plane 2', unit: 'lbf·in | N·m', kind: 'input', hint: 'optional helper' },
            { id: 'Ma', symbol: 'M_a', label: 'Alternating bending moment', unit: 'lbf·in | N·m', kind: 'input', auto: v => H.has(v, 'Mx', 'My') ? Math.hypot(v.Mx, v.My) : undefined, hint: 'blank → from M_x, M_y' },
            { id: 'Mm', symbol: 'M_m', label: 'Mean bending moment', unit: 'lbf·in | N·m', kind: 'input', default: 0 },
            { id: 'Tm', symbol: 'T_m', label: 'Mean (steady) torque', unit: 'lbf·in | N·m', kind: 'input', auto: v => SI(v) ? undefined : v.T1 },
            { id: 'Ta', symbol: 'T_a', label: 'Alternating torque', unit: 'lbf·in | N·m', kind: 'input', default: 0 },
            { id: 'Fmx', symbol: 'F_m', label: 'Mean axial force (thrust through this point)', unit: 'lbf | N', kind: 'input', hint: 'optional — used in the check (HW4 P7); usually negligible' },
            { id: 'Fax', symbol: 'F_a', label: 'Alternating axial force', unit: 'lbf | N', kind: 'input', hint: 'optional' },
            { id: 'V', symbol: 'V', label: 'Resultant shear force (shear-only points)', unit: 'lbf | N', kind: 'input', default: 0 },
          ] },
      ] },

      { title: 'Section A · Strength', steps: [
        { id: 'mat', title: 'Step 10 — shaft material', eq: '6-10', fig: ['ta-20'], formula: "S'_e = 0.5\\,S_{ut}\\ (S_{ut} \\le 200\\ \\text{kpsi}),\\quad 100\\ \\text{kpsi otherwise}",
          vars: [
            { id: 'mat', label: 'Material', kind: 'input', type: 'text', hint: 'e.g. 1020 CD, 1045 HR' },
            { id: 'Sut', symbol: 'S_{ut}', label: 'Tensile strength', unit: 'kpsi | MPa', kind: 'lookup', fig: 'ta-20' },
            { id: 'Sy', symbol: 'S_y', label: 'Yield strength', unit: 'kpsi | MPa', kind: 'lookup', fig: 'ta-20' },
            { id: 'Sep', symbol: "S'_e", label: 'Rotating-beam endurance limit', unit: 'kpsi | MPa', kind: 'calc', digits: 4, compute: v => v.Sut !== undefined ? (v.Sut <= (SI(v) ? 1400 : 200) ? 0.5 * v.Sut : (SI(v) ? 700 : 100)) : undefined },
          ] },
        { id: 'marin', title: 'Steps 11–16 — Marin factors and S_e', eq: '6-17', fig: ['t6-2', 'fig6-24', 'eq6-19', 't6-4'],
          formula: "S_e = k_a k_b k_c k_d k_e k_f\\, S'_e \\qquad k_a = a S_{ut}^{\\,b} \\qquad k_b = (d/0.3)^{-0.107}\\ (0.3 \\le d \\le 2\\ \\text{in}),\\ 0.91 d^{-0.157}\\ (2 < d \\le 10)",
          text: 'Fizz\'s \\(s_n, C_m, C_{st}, C_R, C_s\\) are Shigley\'s \\(k_a \\ldots k_e\\). \\(k_{b}\\) needs a diameter: 0.8 until <i>d</i> is known. If the problem gives a fully corrected \\(S_{e}\\), type it below instead.',
          vars: [
            { id: 'surf', label: 'Surface finish', kind: 'choice', type: 'text', default: 'Machined or cold-drawn', options: Object.keys(KA) },
            { id: 'ka', symbol: 'k_a', label: 'Surface factor', unit: '', kind: 'lookup', fig: 't6-2', auto: kaOf,
              work: v => kaOf(v) !== undefined ? '\\(k_a = ' + (SI(v) ? KA[v.surf][2] : KA[v.surf][0]) + '(' + H.fmt(v.Sut) + ')^{' + KA[v.surf][1] + '} = ' + H.fmt(kaOf(v)) + '\\)' : null },
            { id: 'dguess', symbol: 'd_{\\mathrm{guess}}', label: 'Trial diameter for k_b', unit: 'in | mm', kind: 'input', hint: 'blank → k_b = 0.8' },
            { id: 'kb', symbol: 'k_b', label: 'Size factor', unit: '', kind: 'lookup', fig: 'eq6-19', auto: v => v.dguess !== undefined ? kbV(v, v.dguess) : 0.8,
              work: v => v.dguess !== undefined ? '\\(k_b = ' + H.fmt(kbV(v, v.dguess)) + '\\)' + (SI(v) ? ' (d in mm: \\((d/7.62)^{-0.107}\\) up to 51 mm)' : '') : null },
            { id: 'kc', symbol: 'k_c', label: 'Load factor (1 for combined loading)', unit: '', kind: 'input', default: 1 },
            { id: 'kd', symbol: 'k_d', label: 'Temperature factor', unit: '', kind: 'input', default: 1 },
            { id: 'rel', label: 'Reliability for k_e', kind: 'choice', default: 99, options: [{ label: '50 % (k_e = 1.000)', value: 50 }, { label: '90 % (0.897)', value: 90 }, { label: '95 % (0.868)', value: 95 }, { label: '99 % (0.814)', value: 99 }, { label: '99.9 % (0.753)', value: 99.9 }, { label: '99.99 % (0.702)', value: 99.99 }] },
            { id: 'ke', symbol: 'k_e', label: 'Reliability factor', unit: '', kind: 'lookup', fig: 't6-4', auto: v => KE[v.rel] },
            { id: 'kf', symbol: 'k_f', label: 'Miscellaneous-effects factor', unit: '', kind: 'input', default: 1 },
            { id: 'Segiven', symbol: 'S_{e,\\mathrm{given}}', label: 'Fully corrected S_e, if the problem gives it', unit: 'kpsi | MPa', kind: 'input', hint: 'overrides the Marin product (HW4 P7: 40 kpsi)' },
            { id: 'Se', symbol: 'S_e', label: 'Endurance limit at the critical point', unit: 'kpsi | MPa', kind: 'calc', digits: 4, compute: v => v.Segiven !== undefined ? v.Segiven : H.has(v, 'ka', 'kb', 'kc', 'kd', 'ke', 'kf', 'Sep') ? v.ka * v.kb * v.kc * v.kd * v.ke * v.kf * v.Sep : undefined,
              work: v => v.Se !== undefined && v.Segiven === undefined ? '\\(S_e = ' + H.fmt(v.ka) + '(' + H.fmt(v.kb) + ')(' + H.fmt(v.kc) + ')(' + H.fmt(v.kd) + ')(' + H.fmt(v.ke) + ')(' + H.fmt(v.kf) + ')(' + H.fmt(v.Sep) + ') = ' + H.fmt(v.Se) + '\\text{ kpsi}\\)' : null },
          ] },
        { id: 'kt', title: 'Step 9 — stress concentration and fatigue factors', eq: '6-32', fig: ['t7-1', 'fig12-2', 'a15-9', 'a15-8', 'a15-14', 'a15-15', 'a15-16', 'a15-17', 'fig6-26', 'fig6-27'],
          formula: 'K_f = 1 + q(K_t - 1) \\qquad K_{fs} = 1 + q_s(K_{ts} - 1) \\qquad q = \\frac{1}{1 + \\sqrt{a}/\\sqrt{r}}',
          text: 'First pass: Table 7-1 with \\(K_f = K_t\\). Once <i>d</i>, <i>D</i>, <i>r</i> are known: A-15 charts and <i>q</i> (auto from <i>r</i> and \\(S_{ut}\\), Eqs 6-35/6-36). Fatigue \\(K_f\\) is not the static \\(K_t\\).',
          vars: [
            { id: 'feat', label: 'Feature at this point', kind: 'choice', type: 'text', default: 'Profile (end-mill) keyseat (r/d = 0.02)', options: Object.keys(KT1) },
            { id: 'Kt', symbol: 'K_t', label: 'Bending stress-concentration factor', unit: '', kind: 'lookup', fig: 't7-1', auto: v => KT1[v.feat] ? KT1[v.feat][0] : undefined },
            { id: 'Kts', symbol: 'K_{ts}', label: 'Torsional stress-concentration factor', unit: '', kind: 'lookup', fig: 't7-1', auto: v => KT1[v.feat] ? KT1[v.feat][1] : undefined },
            { id: 'r', symbol: 'r', label: 'Notch (fillet) radius, if known', unit: 'in | mm', kind: 'input', hint: 'blank → q = q_s = 1 (K_f = K_t)' },
            { id: 'q', symbol: 'q', label: 'Notch sensitivity, bending', unit: '', kind: 'lookup', fig: 'fig6-26', auto: v => H.has(v, 'r', 'Sut') && v.r > 0 ? 1 / (1 + neuberB(SI(v) ? v.Sut / 6.895 : v.Sut) / Math.sqrt(SI(v) ? v.r / 25.4 : v.r)) : 1 },
            { id: 'qs', symbol: 'q_s', label: 'Notch sensitivity, torsion', unit: '', kind: 'lookup', fig: 'fig6-27', auto: v => H.has(v, 'r', 'Sut') && v.r > 0 ? 1 / (1 + neuberT(SI(v) ? v.Sut / 6.895 : v.Sut) / Math.sqrt(SI(v) ? v.r / 25.4 : v.r)) : 1 },
            { id: 'Kf', symbol: 'K_f', label: 'Fatigue factor, bending', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'Kt', 'q') ? 1 + v.q * (v.Kt - 1) : undefined,
              work: v => v.Kf !== undefined ? '\\(K_f = 1 + ' + H.fmt(v.q) + '(' + H.fmt(v.Kt) + ' - 1) = ' + H.fmt(v.Kf) + '\\)' : null },
            { id: 'Kfs', symbol: 'K_{fs}', label: 'Fatigue factor, torsion', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'Kts', 'qs') ? 1 + v.qs * (v.Kts - 1) : undefined,
              work: v => v.Kfs !== undefined ? '\\(K_{fs} = 1 + ' + H.fmt(v.qs) + '(' + H.fmt(v.Kts) + ' - 1) = ' + H.fmt(v.Kfs) + '\\)' : null },
            { id: 'Kfa', symbol: 'K_{f,ax}', label: 'Fatigue factor, axial (only with an axial force)', unit: '', kind: 'lookup', fig: 't7-1', auto: v => v.Kf, hint: 'blank → K_f' },
          ] },
      ] },

      { title: 'Section A · Diameter', steps: [
        { id: 'dia', title: 'Step 17 — minimum diameter at the point', eq: '7-6 / 7-8 / 7-12', fig: ['ta-17'],
          formula: 'A = \\sqrt{4(K_f M_a)^2 + 3(K_{fs}T_a)^2},\\quad B = \\sqrt{4(K_f M_m)^2 + 3(K_{fs}T_m)^2} \\qquad d_{\\mathrm{Goodman}} = \\left[\\frac{16n}{\\pi}\\left(\\frac{A}{S_e} + \\frac{B}{S_{ut}}\\right)\\right]^{1/3} \\qquad d_{\\mathrm{Gerber}} = \\left(\\frac{8nA}{\\pi S_e}\\left\\{1 + \\left[1 + \\left(\\frac{2BS_e}{AS_{ut}}\\right)^2\\right]^{1/2}\\right\\}\\right)^{1/3}',
          text: 'DE-Goodman is the usual (conservative) choice. Shear-only points (bearing seats with no torque): \\(d = \\sqrt{2.94 K_{fs} V n/S_e}\\) (Mott Eq. 12-16 form). Ring groove ×1.06. Round to Table A-17 using the table below.',
          vars: [
            { id: 'n', symbol: 'n', label: 'Design factor', unit: '', kind: 'input', default: 1.5 },
            { id: 'crit', label: 'Criterion', kind: 'choice', type: 'text', default: 'DE-Goodman (Eq. 7-8)', options: ['DE-Goodman (Eq. 7-8)', 'DE-Gerber (Eq. 7-12)', 'DE-Soderberg (S_y in place of S_ut)'] },
            { id: 'A', symbol: 'A', label: 'Alternating term', unit: 'lbf·in | N·mm', kind: 'calc', digits: 5, compute: v => { const r = AB(v); return r && r.A; } },
            { id: 'B', symbol: 'B', label: 'Mean term', unit: 'lbf·in | N·mm', kind: 'calc', digits: 5, compute: v => { const r = AB(v); return r && r.B; } },
            { id: 'dG', symbol: 'd_{\\mathrm{Goodman}}', label: 'DE-Goodman diameter', unit: 'in | mm', kind: 'calc', digits: 4, compute: dGood,
              work: v => v.dG !== undefined ? '\\(d = \\left[\\dfrac{16(' + H.fmt(v.n) + ')}{\\pi}\\left(\\dfrac{' + H.fmt(v.A, 5) + '}{' + H.fmt(v.Se * sF(v), 5) + '} + \\dfrac{' + H.fmt(v.B, 5) + '}{' + H.fmt(v.Sut * sF(v), 5) + '}\\right)\\right]^{1/3} = ' + H.fmt(v.dG) + '\\text{ in}\\)' : null },
            { id: 'dGb', symbol: 'd_{\\mathrm{Gerber}}', label: 'DE-Gerber diameter', unit: 'in | mm', kind: 'calc', digits: 4, compute: dGerb },
            { id: 'dS', symbol: 'd_{\\mathrm{Soderberg}}', label: 'DE-Soderberg diameter', unit: 'in | mm', kind: 'calc', digits: 4, compute: dSod },
            { id: 'dV', symbol: 'd_{\\mathrm{shear}}', label: 'Shear-only diameter (if V given)', unit: 'in | mm', kind: 'calc', digits: 4, compute: dShear },
            { id: 'ring', label: 'Retaining-ring groove here?', kind: 'choice', type: 'text', default: 'no', options: ['no', 'yes (×1.06)'] },
            { id: 'dmin', symbol: 'd_{\\mathrm{min}}', label: 'Governing minimum diameter', unit: 'in | mm', kind: 'calc', digits: 4, compute: v => {
              let d = v.crit === 'DE-Gerber (Eq. 7-12)' ? v.dGb : /Soderberg/.test(v.crit || '') ? v.dS : v.dG; if (d === undefined) return undefined;
              if (v.dV !== undefined && v.dV > d) d = v.dV; if (/yes/.test(v.ring || '')) d *= 1.06; return d; } },
            { id: 'dsel', symbol: 'd', label: 'Selected (preferred-size) diameter', unit: 'in | mm', kind: 'lookup', fig: 'ta-17', hint: 'Table A-17; ≥ bearing bore at bearing seats' },
          ],
          after: diaTable },
        { id: 'chk', title: 'Steps 19–20 — check the selected diameter', eq: '6-66 / 6-67 / 7-16', fig: ['eq6-19', 'a15-9', 'a15-8', 'fig6-26'],
          formula: "\\sigma'_a = \\left[\\left(K_f\\frac{32M_a}{\\pi d^3} + K_{f,ax}\\frac{4F_a}{\\pi d^2}\\right)^2 + 3\\left(K_{fs}\\frac{16T_a}{\\pi d^3}\\right)^2\\right]^{1/2} \\qquad \\frac{1}{n_f} = \\frac{\\sigma'_a}{S_e} + \\frac{\\sigma'_m}{S_{ut}} \\qquad n_y = \\frac{S_y}{\\sigma'_a + \\sigma'_m}",
          text: '\\(\\sigma\'_m\\) is the same with mean values. \\(k_{b}\\) is re-evaluated at the selected <i>d</i>; re-read \\(K_{t}\\) with the real <i>r/d</i>, <i>D/d</i>. Go up one preferred size if \\(n_f\\) is too low.',
          vars: [
            { id: 'kb2', symbol: 'k_b', label: 'Size factor at selected d', unit: '', kind: 'lookup', fig: 'eq6-19', auto: v => kbV(v, v.dsel) },
            { id: 'Se2', symbol: 'S_e', label: 'Endurance limit with updated k_b', unit: 'kpsi | MPa', kind: 'calc', digits: 4, compute: v => v.Segiven !== undefined ? v.Segiven : H.has(v, 'ka', 'kb2', 'kc', 'kd', 'ke', 'kf', 'Sep') ? v.ka * v.kb2 * v.kc * v.kd * v.ke * v.kf * v.Sep : undefined },
            { id: 'sa', symbol: "\\sigma'_a", label: 'Alternating von Mises stress', unit: 'psi | MPa', kind: 'calc', digits: 5, compute: v => vm(v, v.dsel, true),
              work: v => v.sa !== undefined && v.Ta === 0 && !v.Fax ? "\\(\\sigma'_a = \\dfrac{32(" + H.fmt(v.Kf) + ')(' + H.fmt(v.Ma) + ')}{\\pi(' + H.fmt(v.dsel) + ')^3} = ' + H.fmt(v.sa, 5) + '\\text{ psi}\\)' : null },
            { id: 'sm', symbol: "\\sigma'_m", label: 'Mean von Mises stress', unit: 'psi | MPa', kind: 'calc', digits: 5, compute: v => vm(v, v.dsel, false),
              work: v => v.sm !== undefined && v.Mm === 0 && !v.Fmx ? "\\(\\sigma'_m = \\sqrt{3}\\dfrac{16(" + H.fmt(v.Kfs) + ')(' + H.fmt(v.Tm) + ')}{\\pi(' + H.fmt(v.dsel) + ')^3} = ' + H.fmt(v.sm, 5) + '\\text{ psi}\\)' : null },
            { id: 'nf', symbol: 'n_f', label: 'Fatigue factor of safety (DE-Goodman)', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'sa', 'sm', 'Se2', 'Sut') ? 1 / (v.sa / (v.Se2 * sF(v)) + v.sm / (v.Sut * sF(v))) : undefined,
              work: v => v.nf !== undefined ? '\\(\\dfrac{1}{n_f} = \\dfrac{' + H.fmt(v.sa, 5) + '}{' + H.fmt(v.Se2 * sF(v), 5) + '} + \\dfrac{' + H.fmt(v.sm, 5) + '}{' + H.fmt(v.Sut * sF(v), 5) + '} \\Rightarrow n_f = ' + H.fmt(v.nf, 3) + '\\)' : null },
            { id: 'nfG', symbol: 'n_f', label: 'Fatigue factor of safety (DE-Gerber)', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'sa', 'sm', 'Se2', 'Sut') && v.sa > 0 && v.sm > 0 ? (() => { const Se = v.Se2 * sF(v), Sut = v.Sut * sF(v); return 0.5 * Math.pow(Sut / v.sm, 2) * (v.sa / Se) * (-1 + Math.sqrt(1 + Math.pow(2 * v.sm * Se / (Sut * v.sa), 2))); })() : undefined },
            { id: 'ny', symbol: 'n_y', label: 'Yield factor of safety (conservative)', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'sa', 'sm', 'Sy') && (v.sa + v.sm) > 0 ? v.Sy * sF(v) / (v.sa + v.sm) : undefined },
            { id: 'nfS', symbol: 'n_f', label: 'Fatigue factor of safety (DE-Soderberg)', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'sa', 'sm', 'Se2', 'Sy') ? 1 / (v.sa / (v.Se2 * sF(v)) + v.sm / (v.Sy * sF(v))) : undefined },
          ],
          after: v => !H.has(v, 'nf', 'ny', 'n') ? '' : (v.nf >= v.n && v.ny >= v.n) ? '<span class="result-ok">d = ' + H.fmt(v.dsel) + (SI(v) ? ' mm' : ' in') + ': n_f = ' + H.fmt(v.nf, 3) + ', n_y = ' + H.fmt(v.ny, 3) + ' ≥ ' + H.fmt(v.n) + ' ✔ — repeat at the next critical point.</span>' : '<span class="result-bad">n_f = ' + H.fmt(v.nf, 3) + ', n_y = ' + H.fmt(v.ny, 3) + ' below ' + H.fmt(v.n) + ' — next preferred size up.</span>' },
      ] },

      { title: 'Section B · Key design', steps: [
        { id: 'ksize', title: 'Steps 26–27 — key size and material', fig: ['t7-6', 'fig7-17', 'ta-20'],
          text: 'Key width ≈ d/4 from Table 7-6 (pick below). Key material weaker than shaft and hub so the key fails first (1018 CD, 54 kpsi).',
          vars: [
            { id: 'dkey', symbol: 'd', label: 'Shaft diameter at the hub', unit: 'in', kind: 'input', auto: v => SI(v) ? undefined : v.dsel },
            { id: 'Tkey', symbol: 'T', label: 'Torque through the key', unit: 'lbf·in', kind: 'input', auto: v => SI(v) ? undefined : v.T1 },
            { id: 'w', symbol: 'w', label: 'Key width', unit: 'in', kind: 'lookup', fig: 't7-6' },
            { id: 'hk', symbol: 'h', label: 'Key height', unit: 'in', kind: 'lookup', fig: 't7-6', auto: v => v.w, hint: 'square key: h = w' },
            { id: 'Syk', symbol: 'S_y', label: 'Yield strength of the weakest of key / shaft / hub', unit: 'kpsi', kind: 'lookup', fig: 'ta-20', default: 54 },
            { id: 'nk', symbol: 'n', label: 'Design factor for the key', unit: '', kind: 'input', default: 3 },
            { id: 'Lhub', symbol: 'L_{\\mathrm{hub}}', label: 'Hub length (if known)', unit: 'in', kind: 'input' },
          ],
          after: keyTable },
        { id: 'klen', title: 'Step 28 — required key length', fig: ['fig7-19'],
          formula: 'F = \\frac{2T}{d} \\qquad l_{\\mathrm{shear}} = \\frac{F\\,n}{0.577\\,S_y\\, w} \\qquad l_{\\mathrm{crush}} = \\frac{2F\\,n}{S_y\\, h}',
          text: 'Shear (\\(S_{sy} = 0.577S_y\\)) and crushing on half the key face; the larger governs. Over ~2 in → bigger shaft or stronger key.',
          vars: [
            { id: 'Fk', symbol: 'F', label: 'Force on key', unit: 'lbf', kind: 'calc', digits: 4, compute: v => H.has(v, 'Tkey', 'dkey') && v.dkey > 0 ? 2 * v.Tkey / v.dkey : undefined,
              work: v => v.Fk !== undefined ? '\\(F = \\dfrac{' + H.fmt(v.Tkey, 5) + '}{' + H.fmt(v.dkey) + '/2} = ' + H.fmt(v.Fk) + '\\text{ lbf}\\)' : null },
            { id: 'lsh', symbol: 'l_{\\mathrm{shear}}', label: 'Length for shear', unit: 'in', kind: 'calc', digits: 4, compute: v => v.w > 0 ? lsh(v, v.w) : undefined,
              work: v => v.lsh !== undefined ? '\\(l = \\dfrac{' + H.fmt(v.Fk) + '(' + H.fmt(v.nk) + ')}{0.577(' + H.fmt(v.Syk * 1000, 5) + ')(' + H.fmt(v.w) + ')} = ' + H.fmt(v.lsh) + '\\text{ in}\\)' : null },
            { id: 'lcr', symbol: 'l_{\\mathrm{crush}}', label: 'Length for crushing', unit: 'in', kind: 'calc', digits: 4, compute: v => v.hk > 0 ? lcr(v, v.hk) : undefined,
              work: v => v.lcr !== undefined ? '\\(l = \\dfrac{2(' + H.fmt(v.Fk) + ')(' + H.fmt(v.nk) + ')}{' + H.fmt(v.Syk * 1000, 5) + '(' + H.fmt(v.hk) + ')} = ' + H.fmt(v.lcr) + '\\text{ in}\\)' : null },
            { id: 'lmin', symbol: 'l_{\\mathrm{min}}', label: 'Required length (larger)', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'lsh', 'lcr') ? Math.max(v.lsh, v.lcr) : undefined },
            { id: 'lsel', symbol: 'l', label: 'Specified key length (preferred size)', unit: 'in', kind: 'lookup', fig: 'ta-17', hint: 'round up; ≤ hub length',
              check: v => (H.has(v, 'lsel', 'lmin') && v.lsel < v.lmin) ? 'Shorter than required' : (H.has(v, 'lsel', 'Lhub') && v.lsel > v.Lhub) ? 'Longer than the hub' : null },
          ],
          after: v => v.lmin === undefined ? '' : (v.lmin > 2 ? '<span class="result-bad">l_min = ' + H.fmt(v.lmin) + ' in is large (&gt; 2 in) — bigger shaft, two keys or a stronger key.</span>' : '<span class="result-ok">Key ' + H.fmt(v.w) + ' × ' + H.fmt(v.hk) + ' in, l_min = ' + H.fmt(v.lmin) + ' in (' + (v.lcr >= v.lsh ? 'crushing' : 'shear') + ' governs)' + (v.lsel !== undefined ? ' → l = ' + H.fmt(v.lsel) + ' in' : '') + ' ✔</span>') },
        { id: 'kseat', title: 'Step 31 — keyseat and keyway depths (Mott Fig. 11-2)', fig: ['fig11-2', 't7-6'],
          formula: 'Y = \\frac{d - \\sqrt{d^2 - w^2}}{2} \\qquad S = \\frac{d - h + \\sqrt{d^2 - w^2}}{2} \\qquad T_{\\mathrm{hub}} = \\frac{d + h + \\sqrt{d^2 - w^2}}{2} + C',
          vars: [
            { id: 'Ck', symbol: 'C', label: 'Allowance', unit: 'in', kind: 'choice', default: 0.005, options: [{ label: '+0.005 parallel key', value: 0.005 }, { label: '−0.020 taper key', value: -0.02 }] },
            { id: 'Y', symbol: 'Y', label: 'Chordal height', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'dkey', 'w') && v.dkey > v.w ? (v.dkey - Math.sqrt(v.dkey * v.dkey - v.w * v.w)) / 2 : undefined },
            { id: 'Sk', symbol: 'S', label: 'Shaft keyseat dimension', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'dkey', 'w', 'hk') && v.dkey > v.w ? (v.dkey - v.hk + Math.sqrt(v.dkey * v.dkey - v.w * v.w)) / 2 : undefined },
            { id: 'Tk', symbol: 'T', label: 'Hub keyway dimension', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'dkey', 'w', 'hk', 'Ck') && v.dkey > v.w ? (v.dkey + v.hk + Math.sqrt(v.dkey * v.dkey - v.w * v.w)) / 2 + v.Ck : undefined },
          ] },
        { id: 'pins', title: 'Alternatives — setscrew or pin', fig: ['t7-4', 'pins'],
          formula: 'F = \\frac{T}{d/2} \\qquad F_{\\mathrm{req}} = n\\,F',
          text: 'Force at the shaft surface times the design factor must not exceed the setscrew holding power (Table 7-4) or the pin failure load. A retaining ring cannot transmit torque.',
          vars: [
            { id: 'Fpin', symbol: 'F', label: 'Tangential force at the shaft surface', unit: 'lbf', kind: 'calc', digits: 5, compute: v => H.has(v, 'Tkey', 'dkey') && v.dkey > 0 ? 2 * v.Tkey / v.dkey : undefined },
            { id: 'nset', symbol: 'n_{\\mathrm{set}}', label: 'Design factor, setscrew', unit: '', kind: 'input', default: 4, hint: '4 is the usual minimum under dynamic load' },
            { id: 'npin', symbol: 'n_{\\mathrm{pin}}', label: 'Design factor, pin', unit: '', kind: 'input', default: 3 },
            { id: 'ptype', label: 'Pin type', kind: 'choice', type: 'text', default: 'Dowel', options: Object.keys(PINS) },
            { id: 'shear', label: 'Pin loading', kind: 'choice', type: 'text', default: 'double shear (through the shaft)', options: ['double shear (through the shaft)', 'single shear'] },
          ],
          after: pinTables },
      ] },
    ],
  };
})();
