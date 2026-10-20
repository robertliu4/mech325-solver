// Flat belts — shared definition for flat_belts_shigley.js / flat_belts_mott.js (window.makeTopic_flat_belts(book)).
// Course method: Shigley Ch 17-2 only, in the order of Flat&V slide 17 "Ref: Flat Belt Analysis Procedure" (Mott has no flat-belt design).
// Question types (step 1 `mode`): analyse | width | capacity | tension | catalogue | geometry — inventory in v2/notes/flat_belts_questions.md.
// Assumptions from v2/notes/belt_assumptions.md §1 (Fizz p.6/p.9, Mech p.15–18) + course slides s12–s21.
//
// Verified against (Playwright probe, values as shown by the calculator):
//  analyse  Tutorial 1 Q1 (S 17-2): F-1 6 in, d=2, D=4, C=108 in, 1750 rpm, 2 hp, Ks 1.25, nd 1 → V 916.3, w 0.126, Fc 0.9135, T 90.04,
//           Cp 0.70, (F1)a 147, F2 56.96, Fi 101.1, Ha 2.5, nfs 1.00, f′ 0.307 < 0.5, φd 3.1231 rad, L 225.4, dip 0.151 in — all match the
//           worked solution (its typed θd = 3.132 is a slip for 3.123; L and dip are unaffected).
//  analyse  HW1 P1 (S 17-3 mod.): A-3 12 in, d=5, VR 0.5 → D=10, C=240 in, 1750 rpm, 3 hp, Ks 1.25, nd 1 → V 2291, w 0.786, Cp 0.70,
//           (F1)a 840, F2 786 (= the boxed answers); Fc 35.63, T 135.1, ΔF 54.02, Fi 777.4, Ha 3.75, nfs 1.00, f′ 0.0223, L 503.6, dip 0.607 in.
//           The typed solution's Fc 17.0, T 90.0, Fi 486.1, Ha 2.5, L 450.9, dip 0.586 belong to the 4-in/2-hp/18-ft version
//           (COURSE_CONVENTIONS §17) and cannot come from the stated inputs.
//  analyse  Shigley Ex 17-1: A-3 6 in, d=6, D=18, C=96, 1750 rpm, 15 hp, Ks 1.25, nd 1.1 → φd 3.0165, e^{fφ} 11.17, V 2749, w 0.393, Fc 25.65,
//           T 742.8, ΔF 247.6, (F1)a 420, F2 172.4, Fi 270.6, Ha 20.62, f′ 0.328, nfs 1.10, dip 0.139 in — Shigley: 25.6/742.8/420/172.4/270.6/
//           20.6/0.328/1.1/0.14.
//  analyse  Tutorial 3 Q2 a–d (S 17-4, no posted answer): A-3 6 in, d=D=48, C=192, 380 rpm, 60 hp, Ks 1.1, nd 1 → φ = π, e^{fφ} 12.35,
//           V 4775, w 0.393, Fc 77.4, T 10 946, ΔF 456.1, Cp 1.0, (F1)a 600, F2 143.9, Fi 294.5, Ha 66.0, nfs 1.00, f′ 0.656 < 0.8 (no slip),
//           L 534.8 in, dip 0.513 in.  Part e (`tension`): Fi,min 268.3 lbf → F1 573.7, F2 117.6, f′ = 0.80 (= f), dip 0.563 in.
//  width    Shigley Ex 17-2: A-3, d=16, D=36, C=192, 860 rpm, 60 hp, Ks 1.15, nd 1.05 → Hd 72.45, T 5309, ΔF 663.7, Cp 0.94, a0 94.0, a2 7.342,
//           e^{fφ} 11.36, b_min 8.398 (Shigley 8.40). b = 10 in: Fc 73.42, (F1)a 940, F2 276.3, Fi 534.7, Ha 72.45, f′ 0.478, dip 0.471
//           (Shigley 73.4/940/276/535/72.5/0.479/0.470). Auto width 9 in: (F1)a 846, F2 182.3, Fi 448.1, f′ 0.627 (Shigley's 9-in line 846/182/448/0.63).
//  width    Tutorial 2 Q3 c–d (S 17-6 b–c, Ex 17-1 drive): b_min 4.138 in (a0 70, a2 4.275); at b = 4.138: (F1)a 289.7, Fc 17.69, F2 42.06,
//           Fi 148.2 (= Fi,min of part a, 148.1), f′ = f = 0.80, Ha 20.62, nfs 1.10.
//  tension  S 17-6 a / Tutorial 2 Q3 a (Ex 17-1 drive): Fi,min = (T/d)(e^{fφ}+1)/(e^{fφ}−1) = 148.1 lbf → F1 297.6, F2 50.0, dip 0.255 in.
//  capacity Ex 17-1 belt as built (6 in A-3) at slip: F1 = (F1)a = 420, F2 60.96, ΔF 359, T_max 1077 lbf·in, Ha,max 29.91 hp, Hnom,max 21.75 hp,
//           Fi 214.8 lbf (dip 0.176 in), nfs for 15 hp = 1.60. (No course answer — the tutorial's wording "torque capacity at the point of slip".)
//  catalogue Ex 17-1 drive with Habasit A-3 (36 N/mm, t 3.4 mm): (F1)a = 36 × 6 × 5.710 = 1233 lbf, Fc 26.41, F2 985.8, Fi 1083, f′ 0.0761,
//           narrowest catalogue width 1.352 in (no course answer; slide 21 gives only the N/mm values).
//  Sizing tables: belt (Table 17-2 rows that fit the small pulley, a0 and b_min at H_d; ★ = narrowest → F-1 for Tutorial 1, A-3 for
//           Ex 17-1 and HW1 P1 (the course belts); Ex 17-2's d = 16 in admits
//           A-2…A-5 and leather, ★ A-5 3.94 in, the problem's A-3 needs 8.40 in), standard width (whole inches ≥ b_min: Ex 17-2 ★ 9 in,
//           Shigley took the catalogue's 10 in — both lines shown), Habasit type (catalogue mode, fits by min pulley mm, b_min per type).
//  geometry crossed d=6, D=18, C=96 → φ = 3.3922 rad (194.4°) on both pulleys, L 231.2 in; open belt L 230.1 in → C from L = 96.0 in.
// Polish pass: Ex 17-1, HW1 P1 (2024 = same) and Tutorial 1 re-run unchanged; midterm 2016/2022 short answers (Fig 17-8 labels, effective
//   friction f′) are stated in the Fig 17-8 note and the friction-check step. Standard sizes step: Table 17-2 thickness/plies/widths.
(function () {
  'use strict';
  // Shigley Table 17-2 — flat/round belt materials: t in, γ lbf/in³, Fa lbf/in at 600 ft/min, f, dmin in.
  const SPECS = {
    'Leather 1 ply, t = 11/64 in':  { t: 11 / 64, g: 0.040, Fa: 30,  f: 0.4, dmin: 3,    mat: 'leather' },
    'Leather 1 ply, t = 13/64 in':  { t: 13 / 64, g: 0.040, Fa: 33,  f: 0.4, dmin: 3.5,  mat: 'leather' },
    'Leather 2 ply, t = 18/64 in':  { t: 18 / 64, g: 0.040, Fa: 41,  f: 0.4, dmin: 4.5,  mat: 'leather' },
    'Leather 2 ply, t = 20/64 in':  { t: 20 / 64, g: 0.040, Fa: 50,  f: 0.4, dmin: 6,    mat: 'leather' },
    'Leather 2 ply, t = 23/64 in':  { t: 23 / 64, g: 0.040, Fa: 60,  f: 0.4, dmin: 9,    mat: 'leather' },
    'Polyamide F-0 (t = 0.03 in)':  { t: 0.03, g: 0.035, Fa: 10,  f: 0.5, dmin: 0.60, mat: 'F-0' },
    'Polyamide F-1 (t = 0.05 in)':  { t: 0.05, g: 0.035, Fa: 35,  f: 0.5, dmin: 1.0,  mat: 'F-1' },
    'Polyamide F-2 (t = 0.07 in)':  { t: 0.07, g: 0.051, Fa: 60,  f: 0.5, dmin: 2.4,  mat: 'F-2' },
    'Polyamide A-2 (t = 0.11 in)':  { t: 0.11, g: 0.037, Fa: 60,  f: 0.8, dmin: 2.4,  mat: 'A-2' },
    'Polyamide A-3 (t = 0.13 in)':  { t: 0.13, g: 0.042, Fa: 100, f: 0.8, dmin: 4.3,  mat: 'A-3' },
    'Polyamide A-4 (t = 0.20 in)':  { t: 0.20, g: 0.039, Fa: 175, f: 0.8, dmin: 9.5,  mat: 'A-4' },
    'Polyamide A-5 (t = 0.25 in)':  { t: 0.25, g: 0.039, Fa: 275, f: 0.8, dmin: 13.5, mat: 'A-5' },
    'Urethane flat 0.50 × 0.062 in': { t: 0.062, g: 0.042, Fa: 5.2,  f: 0.7, dmin: 0.38, mat: 'urethane', b: 0.50 },
    'Urethane flat 0.75 × 0.078 in': { t: 0.078, g: 0.042, Fa: 9.8,  f: 0.7, dmin: 0.50, mat: 'urethane', b: 0.75 },
    'Urethane flat 1.25 × 0.090 in': { t: 0.090, g: 0.042, Fa: 18.9, f: 0.7, dmin: 0.50, mat: 'urethane', b: 1.25 },
  };
  // Shigley Table 17-4 — Cp by small-pulley diameter. Columns 1.6–4 | 4.5–8 | 9–12.5 | 14, 16 | 18–31.5 | over 31.5 in (NaN = "—").
  const CP = {
    leather: [0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    'F-0': [0.95, 1, 1, 1, 1, 1], 'F-1': [0.70, 0.92, 0.95, 1, 1, 1], 'F-2': [0.73, 0.86, 0.96, 1, 1, 1],
    'A-2': [0.73, 0.86, 0.96, 1, 1, 1], 'A-3': [NaN, 0.70, 0.87, 0.94, 0.96, 1], 'A-4': [NaN, NaN, 0.71, 0.80, 0.85, 0.92],
    'A-5': [NaN, NaN, NaN, 0.72, 0.77, 0.91], urethane: [1, 1, 1, 1, 1, 1],
  };
  const cpCol = d => d <= 4.25 ? 0 : d <= 8.5 ? 1 : d <= 13 ? 2 : d <= 17 ? 3 : d <= 31.5 ? 4 : 5;
  // Habasit power-transmission belts (Flat&V slide 21): code → [thickness mm, min pulley mm, k1% N/mm, nominal peripheral force (F1)a N/mm]
  const HAB = {
    'TC-10EF': [1.8, 25, 5, 10], 'TC-20EF': [2.0, 25, 10, 21], 'TC-20/25EF': [2.5, 50, 11, 23], 'TC-35ER': [2.5, 50, 18, 38],
    'TC-35/30ER': [3.0, 50, 18, 38], 'TC-35/35ER': [3.5, 70, 18, 38], 'TC-55ER': [3.0, 70, 25, 53],
    'TCF-20EL': [2.6, 80, 10, 21], 'TCF-35EL': [3.0, 100, 18, 38], 'TCF-55EL': [3.5, 150, 25, 53], 'TCF-20H': [1.5, 25, 10, 20], 'TCF-50H': [2.0, 60, 24, 48],
    'S-10/15': [1.5, 40, 4.4, 12], 'S-18/20': [2.0, 60, 8, 22], 'S-18/30': [3.0, 60, 8, 22], 'S-33/40': [4.0, 125, 13, 37], 'S-33/50': [5.0, 125, 13, 37],
    'S-140H': [1.7, 40, 4.8, 13], 'S-141H': [2.3, 40, 4.8, 13], 'S-250H': [2.3, 100, 11, 29], 'S-250HR': [2.6, 100, 11, 29], 'S-251H': [3.0, 100, 11, 29],
    'S-321H': [3.2, 125, 13, 35], 'S-390H': [3.2, 160, 14, 38], 'S-391H': [4.0, 160, 14, 38],
    'A-2': [2.7, 60, 7.5, 22], 'A-3': [3.4, 125, 12, 36], 'A-4': [5.0, 300, 21, 63], 'A-5': [6.8, 450, 30, 92],
    'TF-10': [1.7, 25, 10, 10], 'TF-15': [2.0, 30, 15, 15], 'TF-15H': [1.5, 30, 15, 15], 'TF-22': [2.4, 60, 22, 22], 'TF-33': [3.0, 100, 33, 33],
    'TF-50': [3.9, 125, 50, 50], 'TF-75T': [4.4, 200, 75, 75],
  };
  const HAB_GROUP = c => /^TCF?-/.test(c) ? 'polyester' : /^S-/.test(c) ? 'polyamide S' : /^A-/.test(c) ? 'polyamide A' : 'aramide (Kevlar)';
  const HAB_TABLE17_2 = { 'A-2': 'Polyamide A-2 (t = 0.11 in)', 'A-3': 'Polyamide A-3 (t = 0.13 in)', 'A-4': 'Polyamide A-4 (t = 0.20 in)', 'A-5': 'Polyamide A-5 (t = 0.25 in)' };
  const NMM = 25.4 / 4.44822;   // 1 N/mm = 5.710 lbf/in
  const G = 32.17;              // ft/s^{2} (course, Fizz p.6, Shigley)

  const M = v => v.mode || 'analyse';
  const on = (...ms) => v => ms.indexOf(M(v)) >= 0;
  const notGeo = v => M(v) !== 'geometry';
  const spec = v => SPECS[v.spec];
  const hab = v => HAB[v.hab];
  const bw = v => (M(v) === 'width' ? v.bsel : v.b);                       // width actually used
  const Cof = v => (H.has(v, 'C') ? v.C : v.Cfound);                       // centre distance actually used
  const cr = v => v.cfg === 'crossed';
  const F = (x, d) => H.fmt(x, d);

  function beltLength(d, D, C, crossed) {
    const s = crossed ? D + d : D - d;
    if (Math.abs(s) > 2 * C) return undefined;
    const a = Math.asin(s / (2 * C));
    if (crossed) return Math.sqrt(4 * C * C - s * s) + 0.5 * (D + d) * (Math.PI + 2 * a);
    return Math.sqrt(4 * C * C - s * s) + 0.5 * (D * (Math.PI + 2 * a) + d * (Math.PI - 2 * a));
  }
  function solveC(d, D, L, crossed) {   // L(C) increases with C → bisection
    let lo = (crossed ? D + d : D - d) / 2 + 1e-9, hi = L / 2;
    if (!(hi > lo)) return undefined;
    const L0 = beltLength(d, D, lo, crossed);
    if (L0 === undefined || L0 > L) return undefined;
    for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; (beltLength(d, D, m, crossed) < L ? lo = m : hi = m); }
    return (lo + hi) / 2;
  }

  // ---------------- sizing tables (★ = rule pick, Use fills the field) ----------------
  const inUse = c => c ? ' <span style="color:#2563eb;font-weight:400">← in use</span>' : '';
  // Shigley Table 17-3 — urethane flat belts: min pulley dia by (pulley rpm / belt length in ft): ≤ 250 | 250–499 | 500–1000
  const T173 = { 0.062: [0.38, 0.44, 0.50], 0.078: [0.50, 0.63, 0.75], 0.090: [0.50, 0.63, 0.75] };
  function dminFor(s, v) {
    if (s.mat !== 'urethane') return s.dmin + ((s.dmin >= 6 && s.mat === 'leather' && bw(v) >= 8) ? 2 : 0);   // Table 17-2 footnote a
    const r = H.has(v, 'n', 'L') ? v.n / (v.L / 12) : undefined, row = T173[s.t];
    return r === undefined ? row[0] : row[r <= 250 ? 0 : r < 500 ? 1 : 2];
  }
  const cvOf = (s, V) => s.mat !== 'leather' ? 1 : (V > 0 ? H.interp(V / 1000, [0, 1, 2, 3, 4, 5, 6], [1.0, 0.99, 0.97, 0.94, 0.90, 0.83, 0.74]) : undefined);
  const dFd = v => H.has(v, 'Hd', 'n', 'd') ? 2 * 63025 * v.Hd / (v.n * v.d) : undefined;
  // narrowest width with f′ = f at H_d (Ex 17-2): b = ΔF/(a0 − a2) · e^{fφ}/(e^{fφ} − 1)
  function bminFor(a0, gamma, t, f, v) {
    const dF = dFd(v); if (dF === undefined || !H.has(v, 'V', 'phi')) return undefined;
    const a2 = 12 * gamma * t / G * (v.V / 60) ** 2, e = Math.exp(f * v.phi);
    return a0 > a2 ? dF / (a0 - a2) * e / (e - 1) : undefined;
  }
  function specRows(v) {
    if (!H.has(v, 'd')) return undefined;
    const rows = Object.keys(SPECS).map(k => {
      const s = SPECS[k], cpr = CP[s.mat], cp = cpr ? cpr[cpCol(v.d)] : undefined, cv = cvOf(s, v.V), dmin = dminFor(s, v);
      const fits = v.d >= dmin - 1e-9 && !isNaN(cp);
      const a0 = (!isNaN(cp) && cv !== undefined) ? s.Fa * cp * cv : undefined;
      let bmin = a0 !== undefined ? bminFor(a0, s.g, s.t, s.f, v) : undefined;
      const fixed = s.b;   // urethane flat belts come in one width
      return { k, s, cp, cv, dmin, fits, a0, bmin, ok: fits && bmin !== undefined && (!fixed || bmin <= fixed + 1e-9) };
    });
    const oks = rows.filter(r => r.ok);
    const pick = oks.reduce((b, r) => (!b || r.bmin < b.bmin) ? r : b, undefined);
    return { rows, pick };
  }
  function specTableHtml(v) {
    const R = specRows(v); if (!R) return '';
    const sh = H.has(v, 'Hd', 'V', 'phi');
    const rows = R.rows.map(r => ({ cells: [r.k + inUse(v.spec === r.k), F(r.dmin) + ' in' + (r.fits ? ' ✔' : ' ✘'), isNaN(r.cp) || r.cp === undefined ? '— ✘' : F(r.cp), F(r.s.Fa), F(r.s.g, 3), F(r.s.f), r.a0 !== undefined ? F(r.a0, 3) : '—', sh ? (r.bmin !== undefined ? F(r.bmin, 3) + ' in' + (r.s.b ? (r.bmin <= r.s.b ? ' ≤ ' : ' > ') + F(r.s.b) + ' (fixed)' : '') : 'cannot carry') : '—'],
      ok: r.ok, pick: R.pick === r, set: { spec: r.k, Fa: '', dmin: '', Cp: '', Cv: '', t: '', gamma: '', f: '' } }));
    return H.table(['Belt (Table 17-2)', 'd_min vs d = ' + F(v.d) + ' in', 'C_p (Table 17-4)', 'F_a lbf/in', '\\(\\gamma\\) (\\(\\mathrm{lbf/in^3}\\))', 'f', 'a_0 = F_a·C_p·C_v lbf/in', 'b_min' + (H.has(v, 'Hd') ? ' (H_d ' + F(v.Hd) + ' hp)' : '')], rows,
      { caption: 'Select the belt — Table 17-2 belts that fit the ' + F(v.d) + '-in small pulley',
        note: 'A belt fits when \\(d \\ge d_{min}\\) and Table 17-4 lists a C_p. b_min = narrowest width carrying H_d without slip (Ex 17-2). ★ = fitting belt needing the narrowest width (calculator choice; Tutorial 1 F-1, Ex 17-1 and HW1 A-3). Use also clears typed table reads.' });
  }
  // standard widths: whole inches from b_min up (Shigley Ex 17-2 took the catalogue's 10 in)
  function widthRows(v, bmin, F1aPerIn) {
    if (!(bmin > 0) || !(F1aPerIn > 0) || !H.has(v, 'gamma', 't', 'V', 'phi')) return undefined;
    const dF = dFd(v); if (dF === undefined) return undefined;
    const b0 = Math.ceil(bmin - 1e-9), list = [b0 - 1, b0, b0 + 1, b0 + 2].filter(b => b > 0);
    return list.map(b => {
      const w = 12 * v.gamma * b * v.t, Fc = w / G * (v.V / 60) ** 2, F1a = F1aPerIn * b, F2 = F1a - dF, Fi = (F1a + F2) / 2 - Fc;
      const fp = F2 > Fc ? Math.log((F1a - Fc) / (F2 - Fc)) / v.phi : undefined;
      return { b, Fc, F1a, F2, Fi, fp, ok: b >= bmin - 1e-9 && fp !== undefined, dip: (Cof(v) > 0 && Fi > 0) ? Cof(v) ** 2 * w / (96 * Fi) : undefined, pick: b === b0 };
    });
  }
  function widthTableHtml(v, mode) {
    const cat = mode === 'catalogue', bmin = cat ? bminCat(v) : v.bmin, perIn = cat ? v.ka : (H.has(v, 'Fa', 'Cp', 'Cv') ? v.Fa * v.Cp * v.Cv : undefined);
    const rows = widthRows(v, bmin, perIn); if (!rows) return '';
    const field = cat ? 'b' : 'bsel';
    return H.table(['Width b', '(F_1)_a', 'F_c', 'F_2', 'F_i', "\\(f^{\\prime}\\) vs f = " + F(v.f), 'dip'], rows.map(r => ({
      cells: [F(r.b) + ' in' + inUse(H.has(v, field) && Math.abs(v[field] - r.b) < 1e-9 || (!H.has(v, field) && !cat && r.pick)), F(r.F1a) + ' lbf', F(r.Fc) + ' lbf', F(r.F2) + ' lbf', F(r.Fi) + ' lbf', r.fp !== undefined ? F(r.fp, 3) + (r.fp < v.f - 1e-9 ? ' < f' : ' ≥ f ✘') : 'F_2 ≤ F_c ✘', r.dip !== undefined ? F(r.dip, 3) + ' in' : '—'],
      ok: r.ok, pick: r.pick, set: { [field]: r.b } })),
      { caption: 'Select a standard width — b_{min} = ' + F(bmin, 4) + ' in', note: 'Rule: the next available width ≥ b_{min}; whole inches here. Shigley Ex 17-2 took the catalogue\'s next width, 10 in (b_{min} 8.40 in) — the 9-in line is also shown in the example. A width below b_{min} slips (\\(f^{\\prime}\\) ≥ f) at the design power.' + (cat ? ' Habasit belts are made to width; whole inches are shown for comparison with Shigley.' : '') });
  }
  function habTableHtml(v) {
    if (!H.has(v, 'd')) return '';
    const dF = dFd(v), dmm = v.d * 25.4;
    const rows = Object.keys(HAB).map(c => {
      const h = HAB[c], ka = h[3] * NMM, t = h[0] / 25.4, g = HAB_TABLE17_2[c] ? SPECS[HAB_TABLE17_2[c]].g : 0.042, f = HAB_TABLE17_2[c] ? SPECS[HAB_TABLE17_2[c]].f : 0.5;
      const fits = dmm >= h[1] - 1e-9, bmin = dF !== undefined ? bminFor(ka, g, t, f, v) : undefined;
      return { c, h, ka, fits, bmin, ok: fits && bmin !== undefined };
    });
    const pick = rows.filter(r => r.ok).reduce((b, r) => (!b || r.bmin < b.bmin) ? r : b, undefined);
    return H.table(['Code', 'Type', 't mm', 'min pulley mm vs ' + F(dmm, 3), "F_a' N/mm", '(F_1)_a per inch', 'b_min at H_d'], rows.map(r => ({
      cells: [r.c + inUse(v.hab === r.c), HAB_GROUP(r.c), F(r.h[0]), F(r.h[1]) + (r.fits ? ' ✔' : ' ✘'), F(r.h[3]), F(r.ka, 3) + ' lbf/in', r.bmin !== undefined ? F(r.bmin, 3) + ' in' : '—'],
      ok: r.ok, pick: r === pick, set: { hab: r.c, kN: '', tmm: '', dminmm: '' } })),
      { caption: 'Select the Habasit belt type (slide 21 / catalogue p.9)', note: 'A type fits when the small pulley ≥ the catalogue minimum. (F_1)_a = force per unit width × b (1 N/mm = 5.710 lbf/in). ★ = narrowest fitting belt (calculator choice); course highlights S-250H, A-3, TF-22.' });
  }

  // Standard sizes (Shigley Table 17-2): thickness / plies of every belt; widths as used in the course and Shigley
  function stdFlat(v) {
    const rows = Object.keys(SPECS).map(k => { const sp = SPECS[k], ply = /(\d) ply/.exec(k);
      return { cells: [k.replace(/ \(t = .*\)$/, '').replace(/, t = .*$/, '') + inUse(v.spec === k), sp.mat === 'leather' ? (ply ? ply[1] : '—') : '—', F(sp.t, 3) + ' in (' + F(sp.t * 25.4, 3) + ' mm)', sp.b ? F(sp.b) + ' in (fixed)' : 'to order', F(sp.dmin) + ' in', F(sp.Fa) + ' lbf/in'], pick: v.spec === k, set: { spec: k, Fa: '', dmin: '', Cp: '', Cv: '', t: '', gamma: '', f: '' } }; });
    return H.table(['Belt', 'Plies', 'Thickness t', 'Width', 'd_min', 'F_a'], rows,
      { caption: 'Standard flat-belt sizes — Shigley Table 17-2', note: 'Widths: polyamide and leather belts are cut to width — the course and Shigley use whole inches (Ex 17-1 6 in, Ex 17-2 10 in, HW1 P1 12 in); Habasit lists (F_1)_a per mm of width.' });
  }

  const MODES = [
    { value: 'analyse', label: 'Analyse a given drive at the tension limit — F_c, (F_1)_a, F_2, F_i, H_a, n_fs, \\(f^{\\prime}\\), L, dip (course 9 steps)' },
    { value: 'width', label: 'Size the belt — minimum width b for a given power (Shigley Ex 17-2)' },
    { value: 'capacity', label: 'Power capacity of a given belt — most torque/power before it slips' },
    { value: 'tension', label: 'Initial tension & dip — minimum F_i for no slip, the tensions it gives, the dip to set it' },
    { value: 'catalogue', label: 'Catalogue check — Habasit (F_1)_a per unit width (slide 21)' },
    { value: 'geometry', label: 'Geometry only — wrap angles and belt length, open or crossed; C from a belt length' },
  ];
  const HELP = {
    analyse: 'Course 9 steps (slide 17): Tutorial 1, HW1 P1, Ex 17-1, Tutorial 3 Q2. Asked: F_c, F_i, \\((F_1)_a\\), F_2, H_a, n_fs, \\(f^{\\prime}\\), L, dip.',
    width: 'Narrowest belt that carries H_d without slip (\\(f^{\\prime} = f\\)), then the tensions for the width you pick (Ex 17-2, Tutorial 2 Q3 c–d).',
    capacity: 'Largest torque/power of a given belt: tight side at \\((F_1)_a\\), friction fully developed, and the F_i that needs (Tutorial 2 Q3 a).',
    tension: 'Smallest F_i for no slip (Eq 17-9), the tensions at the F_i you set, and the dip that sets it (S 17-6 a, Tutorial 3 Q2 e).',
    catalogue: 'Course 9 steps with \\((F_1)_a\\) = Habasit force per unit width × b (slide 21).',
    geometry: 'Wrap angles \\(\\phi_d\\), \\(\\phi_D\\) and length L (open or crossed), or C for a stocked belt (Eqs 17-1 … 17-4).',
  };

  function bminCat(v) {   // narrowest catalogue width with \\(f^{\\prime}\\) = f at the design torque (same algebra as Ex 17-2, a0 = catalogue force per width)
    if (!H.has(v, 'dF', 'efp', 'ka', 'gamma', 't', 'V')) return undefined;
    const a2 = 12 * v.gamma * v.t / G * (v.V / 60) ** 2;
    return v.ka > a2 ? v.dF / (v.ka - a2) * v.efp / (v.efp - 1) : undefined;
  }
  function result(v) {
    const m = M(v);
    const ok = '<span class="result-ok">', bad = '<span class="result-bad">', e = '</span>';
    if (m === 'geometry') {
      if (!H.has(v, 'phi', 'L')) return '';
      return ok + (cr(v) ? 'Crossed' : 'Open') + ' belt' + e + ' — d = ' + F(v.d) + ' in, D = ' + F(v.Dg) + ' in, C = ' + F(Cof(v)) + ' in' + (!H.has(v, 'C') && H.has(v, 'Cfound') ? ' (from L = ' + F(v.Lgiven) + ' in)' : '') +
        ': \\(\\phi_{d}\\) = ' + F(v.phi, 4) + ' rad (' + F(v.phideg) + '°), \\(\\phi_{D}\\) = ' + F(v.phiD, 4) + ' rad; belt length L = ' + F(v.L) + ' in.';
    }
    if (m === 'capacity') {
      if (!H.has(v, 'Hcap', 'Tcap')) return '';
      return ok + 'Capacity' + e + ' — with F_{1} = \\((F_{1})_{a}\\) = ' + F(v.F1a) + ' lbf and \\(f^{\\prime}\\) = f = ' + F(v.f) + ': F_{2} = ' + F(v.F2s) + ' lbf, T_{max} = ' + F(v.Tcap) + ' lbf·in, H_{a,max} = ' + F(v.Hcap) +
        ' hp → largest nominal power H_{nom} = ' + F(v.Hnmax) + ' hp (K_{s} = ' + F(v.Ks) + ', n_{d} = ' + F(v.nd) + '). Needs F_{i} = ' + F(v.Fis) + ' lbf (dip ' + F(v.dipC, 3) + ' in).' +
        (H.has(v, 'nfsC') ? ' For H_{nom} = ' + F(v.Hnom) + ' hp: n_{fs} = ' + F(v.nfsC, 3) + (v.nfsC >= (v.nd || 1) ? ' — OK.' : ' — ' + bad + 'below n_{d}' + e + '.') : '');
    }
    if (m === 'tension') {
      if (!H.has(v, 'Fimin', 'Fiset', 'F1t', 'F2t')) return '';
      const slip = H.has(v, 'fpt', 'f') && v.fpt > v.f + 1e-6, over = H.has(v, 'F1a') && v.F1t > v.F1a + 1e-6, neg = v.F2t <= v.Fc;
      return (slip || over || neg ? bad + 'CHECK' + e : ok + 'OK' + e) + ' — minimum initial tension for no slip F_{i,min} = ' + F(v.Fimin) + ' lbf. At F_{i} = ' + F(v.Fiset) + ' lbf: F_{1} = ' + F(v.F1t) + ' lbf' +
        (H.has(v, 'F1a') ? (over ? ' &gt; ' : ' ≤ ') + '\\((F_{1})_{a}\\) = ' + F(v.F1a) + ' lbf' : '') + ', F_{2} = ' + F(v.F2t) + ' lbf, \\(f^{\\prime}\\) = ' + F(v.fpt, 3) + (slip ? ' &gt; ' : ' ≤ ') + 'f = ' + F(v.f) +
        (slip ? ' (slips — raise F_{i})' : '') + '; set it with a dip of ' + F(v.dipt, 3) + ' in over C = ' + F(Cof(v)) + ' in. A lower F_{i} (down to F_{i,min}) lowers F_{1} and lengthens belt life.';
    }
    if (!H.has(v, 'fp', 'f', 'nfs')) return (m === 'width' && H.has(v, 'bmin')) ? 'Minimum width b_{min} = ' + F(v.bmin) + ' in — pick a width ≥ b_{min} in the width step.' : '';
    const slip = v.fp >= v.f, low = v.nfs < (v.nd || 1) - 1e-3;
    let s = (slip || low ? bad + 'FAIL' + e : ok + 'PASS' + e) + ' — ';
    if (m === 'width') s += 'use b = ' + F(bw(v)) + ' in (b_{min} = ' + F(v.bmin) + ' in). ';
    if (m === 'catalogue') { const bc = bminCat(v); s += 'Habasit ' + (v.hab || '') + ': \\((F_{1})_{a}\\) = ' + F(v.kN) + ' N/mm × ' + F(bw(v)) + ' in = ' + F(v.F1a) + ' lbf' + (bc !== undefined ? '; narrowest catalogue belt that carries H_{d} without slipping: b_{min} = ' + F(bc) + ' in' : '') + '. '; }
    s += 'At the tension limit: F_{c} = ' + F(v.Fc) + ' lbf, \\((F_{1})_{a}\\) = ' + F(v.F1a) + ' lbf, F_{2} = ' + F(v.F2) + ' lbf, F_{i} = ' + F(v.Fi) + ' lbf; H_{a} = ' + F(v.Ha) + ' hp, n_{fs} = ' + F(v.nfs, 3) +
      '; \\(f^{\\prime}\\) = ' + F(v.fp, 3) + (slip ? ' ≥ ' : ' &lt; ') + 'f = ' + F(v.f) + (slip ? ' — the belt slips: widen it or increase wrap' : ' (no slip)') + '; L = ' + F(v.L) + ' in; dip = ' + F(v.dip, 3) + ' in.';
    return s;
  }

  window.makeTopic_flat_belts = function (book) {
    const mott = book === 'mott';
    const S = { book: 'shigley' };
    return {
      id: 'flat_belts', book: book,
      title: 'Flat Belts — Analysis & Design',
      subtitle: mott ? 'Mott has no flat-belt design: Shigley Ch. 17-2 method (course), Mott Fig. 7-4 kinematics' : 'Shigley Ch. 17-2 · course 9-step procedure (Flat&V slide 17)',
      sibling: mott ? 'flat_belts_shigley.html' : 'flat_belts_mott.html',
      intro: (mott ? '<b>Mott has no flat-belt design</b>; the course uses Shigley Ch 17, with Mott Fig 7-4 for geometry. ' : '') +
        'Pick the question type in step 1; the steps follow the course <b>Flat Belt Analysis Procedure</b> (slide 17). Yellow fields fill from Table 17-2/17-4 once you pick the belt.',
      example: { mode: 'analyse', d: 2, D: 4, VRin: '', C: 108, cfg: 'open', Hnom: 2, n: 1750, Ks: 1.25, nd: 1, spec: 'Polyamide F-1 (t = 0.05 in)', b: 6 },

      assumptions: [
        { text: 'Belt runs at its tension limit, \\(F_1 = (F_1)_a\\), so \\((F_1)_a - F_2 = 2T/d\\)', src: 'Flat&V s17 step 4 · Fizz p.6 · Mech p.17', step: 'tens' },
        { text: 'K_s = 1.25 unless given (Tutorial 1, HW1 P1, Ex 17-1); Table 17-15 ranges', src: 'Mech p.16 · Flat&V s14', var: 'Ks' },
        { text: 'Design factor n_d = 1.0 unless stated', src: 'Flat&V s13 · Fizz p.6', var: 'nd' },
        { text: 'Open belt unless the question says crossed (crossed: \\(\\phi = \\pi + 2\\sin^{-1}\\frac{D+d}{2C}\\) on both pulleys)', src: 'Mech p.16 · Shigley Eqs 17-3/17-4', var: 'cfg' },
        { text: 'The SMALL-pulley wrap \\(\\phi_d\\) is used in \\(e^{f\\phi}\\) and \\(f^{\\prime}\\) — it slips first', src: 'Fizz p.6 · Mech p.18 · Flat&V s16', step: 'spd' },
        { text: '\\(g = 32.17\\ \\mathrm{ft/s^2}\\) in F_c (Mech writes 32.2)', src: 'Flat&V s12 · Fizz p.6 · Mech p.17', step: 'fc' },
        { text: 'f, t, \\(\\gamma\\), F_a, d_min from Table 17-2 (f = 0.4–0.8); leather/urethane \\(\\gamma\\) mid values 0.040/0.042 \\(\\mathrm{lbf/in^3}\\)', src: 'Flat&V s15–16 · Fizz p.8 · Mech p.15', var: 'f' },
        { text: 'C_p from Table 17-4 at the SMALL pulley (between columns use the left one); C_v = 1 except leather (Fig 17-9)', src: 'Flat&V s13 · Fizz p.9 · Mech p.17', var: 'Cp' },
        { text: 'n_fs = H_a/(H_nom K_s); at the tension limit it returns n_d', src: 'Flat&V s17 step 9 · Fizz p.6', step: 'chk' },
        { text: 'dip = \\(C^2 w/(96 F_i)\\), C in inches', src: 'Shigley Eq 17-13 · Fizz p.6 · Mech p.18', step: 'chk' },
        { text: 'Minimum width at \\(f^{\\prime} = f\\), rounded up to a whole inch (Ex 17-2 used the catalogue 10 in)', src: 'Shigley Ex 17-2', var: 'bsel' },
        { text: '\\(F_{i,min} = (T/d)(e^{f\\phi}+1)/(e^{f\\phi}-1)\\); for any other F_i use \\(F_1 = F_i + F_c + T/d\\)', src: 'Shigley Eq 17-9 · Fizz p.6', var: 'Fiset' },
        { text: 'Catalogue \\((F_1)_a\\) = force per unit width × b (1 N/mm = 5.710 lbf/in); weight and friction from Table 17-2', src: 'Flat&V s21 (Habasit)', var: 'kN' },
      ],

      figures: [
        { id: 'fig17-1', ref: 'Figure 17-1', book: 'shigley', title: 'Flat-belt geometry: (a) open belt, (b) crossed belt — wrap angles and length', src: 'figures/shigley/fig17-1.png', page: 904, note: 'Open: \\(\\phi_d = \\pi - 2\\sin^{-1}\\frac{D-d}{2C}\\), \\(\\phi_D = \\pi + 2\\sin^{-1}\\frac{D-d}{2C}\\). Crossed: \\(\\phi = \\pi + 2\\sin^{-1}\\frac{D+d}{2C}\\) on both.' },
        { id: 'fig7-4', ref: 'Figure 7-4', book: 'mott', title: 'Belt drive geometry (Mott): \\(\\theta_{1,2} = 180^\\circ \\mp 2\\phi\\), span, centre distance', src: 'figures/mott/fig7-4.png', page: 265, note: 'Shigley Eqs 17-1/17-2 in degrees (Mott Eqs 7-5 … 7-11).' },
        { id: 'fig17-2', ref: 'Figure 17-2', book: 'shigley', title: 'Non-reversing (open) and reversing (crossed) belt drives', src: 'figures/shigley/fig17-2.png', page: 904 },
        { id: 'table17-2', ref: 'Table 17-2', book: 'shigley', title: 'Flat- and round-belt materials (t, d_min, F_a, \\(\\gamma\\), f)', src: 'figures/shigley/table17-2.png', page: 911, note: 'F_a = allowable tension per inch of width at 600 ft/min; leather and urethane \\(\\gamma\\) are ranges (mid values used).' },
        { id: 'table17-3', ref: 'Table 17-3', book: 'shigley', title: 'Minimum pulley sizes for urethane flat and round belts', src: 'figures/shigley/table17-3.png', page: 912 },
        { id: 'table17-4', ref: 'Table 17-4', book: 'shigley', title: 'Pulley correction factor C_p for flat belts (enter with the SMALL pulley diameter)', src: 'figures/shigley/table17-4.png', page: 912, note: '"—" means the pulley is too small for that belt. C_p = 1 for urethane.' },
        { id: 'fig17-9', ref: 'Figure 17-9', book: 'shigley', title: 'Velocity correction factor C_v for leather belts', src: 'figures/shigley/fig17-9.png', page: 910, note: 'C_v = 1 for polyamide and urethane. Leather: enter with V (thousands of ft/min) and the thickness.' },
        { id: 'table17-15', ref: 'Table 17-15', book: 'shigley', title: 'Suggested service factors K_s ("use this table for flat belts", slide 14)', src: 'figures/shigley/table17-15.png', page: 925, note: 'Uniform 1.0–1.2 / 1.1–1.3; light shock 1.1–1.3 / 1.2–1.4; medium 1.2–1.4 / 1.4–1.6; heavy 1.3–1.5 / 1.5–1.8 (normal / high-torque source).' },
        { id: 'habasit', ref: 'Habasit table (s21)', book: 'course', title: 'Flat-belt nominal peripheral force per unit width = (F_1)_a: S-250H 29 N/mm, A-3 36 N/mm, TF-22 22 N/mm', src: 'figures/course/flat_belt_habasit_table.png', note: '(F_1)_a = (N/mm) × width. 1 N/mm = 5.710 lbf/in. Also gives thickness and minimum pulley diameter (mm).' },
        { id: 'habasit-full', ref: 'Habasit HabaDRIVE product key data (p.9)', book: 'course', title: 'Full Habasit table: belt code → thickness, minimum pulley diameter, k1% tensile force, nominal peripheral force per unit width (polyester TC/TCF, polyamide S/A, aramide TF)', src: 'figures/course/habasit_habadrive_product_key_data.png', note: 'Flat Belts Engineering Guide Habisit.pdf p.9 — the original of the slide-21 crop. Last column (N/mm) × belt width = (F_1)_a; 1 N/mm = 5.710 lbf/in.' },
        { id: 'habasit-crown', ref: 'Habasit recommended crown height (p.20)', book: 'course', title: 'Recommended pulley crown height h (mm) by pulley diameter and pulley width (ISO 22)', src: 'figures/course/habasit_recommended_crown_height.png', note: 'Flat Belts Engineering Guide Habisit.pdf p.20 (slide 19). At least one pulley, preferably the larger, must be crowned; crown heights above the table lose tracking.' },
        { id: 'habasit-crown2', ref: 'Habasit pulley crown shape (p.19)', book: 'course', title: 'Crown profile guideline: regular symmetrical curve; no conical or cylindrical-conical pulleys', src: 'figures/course/habasit_pulley_crown_guideline.png', note: 'Flat Belts Engineering Guide Habisit.pdf p.19 (slide 19).' },
        { id: 'habasit-k1', ref: 'Habasit k1% value (p.16)', book: 'course', title: 'Tensile force for 1 % elongation k_1% and belt relaxation after running-in', src: 'figures/course/habasit_k1_tensile_force_relaxation.png', note: 'Flat Belts Engineering Guide Habisit.pdf p.16 (Flat&V slide 18).' },
        { id: 'habasit-shaft', ref: 'Habasit shaft load and nominal peripheral force (p.17)', book: 'course', title: 'Shaft load drops 40–50 % after relaxation; nominal peripheral force = k_{1%} × admissible elongation × friction, per unit width', src: 'figures/course/habasit_shaft_load_peripheral_force.png', note: 'Flat Belts Engineering Guide Habisit.pdf p.17 (Flat&V slide 18).' },
        { id: 'fig17-7', ref: 'Figure 17-7', book: 'shigley', title: 'Forces on a pulley: F_1 = F_i + F_c + T/d, F_2 = F_i + F_c − T/d', src: 'figures/shigley/fig17-7.png', page: 908 },
        { id: 'fig17-8', ref: 'Figure 17-8', book: 'shigley', title: 'Belt tensions F_1, F_2 vs initial tension F_i (slide 11)', src: 'figures/shigley/fig17-8.png', page: 910, note: 'Midterm 2016/2022 labels: tight side F_1, slack side F_2, gap \\(F_1 - F_2 = 2T/d\\), intercept F_c, top line \\((F_1)_a\\) (max allowable).' },
        { id: 'fig17-11', ref: 'Figure 17-11', book: 'shigley', title: 'Belt-tensioning schemes; catenary dip', src: 'figures/shigley/fig17-11.png', page: 915 },
      ],

      sections: [
        { title: '1 · What does the question ask?', steps: [
          { id: 'q', title: 'Question type',
            vars: [{ id: 'mode', label: 'The question asks for…', kind: 'choice', type: 'text', allowBlank: false, default: 'analyse', options: MODES }],
            after: v => HELP[M(v)] || '' },
        ] },

        { title: '2 · Problem data', steps: [
          { id: 'in', title: 'Pulleys and centre distance', fig: mott ? ['fig7-4', 'fig17-2'] : ['fig17-1', 'fig17-2'],
            text: 'Give D, or leave it blank and give the ratio (2 or 0.5 both mean D = 2d). C in inches (feet × 12).',
            vars: [
              { id: 'd', symbol: 'd', label: 'Small (driving) pulley diameter', unit: 'in', kind: 'input' },
              { id: 'D', symbol: 'D', label: 'Large (driven) pulley diameter', unit: 'in', kind: 'input', hint: 'blank → D from the ratio' },
              { id: 'VRin', symbol: 'VR', label: 'Velocity ratio (only if D is not given)', unit: '', kind: 'input', hint: '2 or 0.5 → D = 2d' },
              { id: 'C', symbol: 'C', label: 'Centre distance', unit: 'in', kind: 'input', hint: 'geometry question with a stocked belt: leave blank and give L below' },
              { id: 'cfg', label: 'Belt arrangement', kind: 'choice', type: 'text', allowBlank: false, options: [{ label: 'Open belt (same rotation)', value: 'open' }, { label: 'Crossed belt (reversing)', value: 'crossed' }], default: 'open' },
              { id: 'Dg', symbol: 'D', label: 'Large pulley diameter used', unit: 'in', kind: 'calc',
                compute: v => H.has(v, 'D') ? v.D : (H.has(v, 'VRin', 'd') && v.VRin > 0 ? (v.VRin >= 1 ? v.VRin * v.d : v.d / v.VRin) : undefined) },
              { id: 'VR', symbol: 'D/d', label: 'Velocity ratio', unit: '', kind: 'calc', compute: v => H.has(v, 'Dg', 'd') ? v.Dg / v.d : undefined },
            ] },
          { id: 'geoL', title: 'Centre distance for a stocked belt length (optional)', when: on('geometry'), eq: '17-2 / 17-4 solved for C',
            text: 'Belt length given instead of C: C is solved from Eq 17-2 (open) or 17-4 (crossed).',
            vars: [
              { id: 'Lgiven', symbol: 'L', label: 'Belt length', unit: 'in', kind: 'input', hint: 'optional' },
              { id: 'Cfound', symbol: 'C', label: 'Centre distance for that length', unit: 'in', kind: 'calc', compute: v => H.has(v, 'Lgiven', 'd', 'Dg') ? solveC(v.d, v.Dg, v.Lgiven, cr(v)) : undefined,
                check: v => (H.has(v, 'Lgiven', 'C')) ? 'C is also given — the given C is used' : (H.has(v, 'Lgiven', 'd', 'Dg') && !H.has(v, 'Cfound')) ? 'This belt is too short for these pulleys' : null },
            ] },
          { id: 'pw', title: 'Power, speed and service factor', when: notGeo, fig: ['table17-15'], eq: '17-19',
            formula: 'H_d = H_{nom}K_s n_d,\\qquad n_2 = n\\,\\frac{d}{D}',
            vars: [
              { id: 'Hnom', symbol: 'H_{nom}', label: 'Nominal (transmitted) power', unit: 'hp', kind: 'input', hint: 'capacity question: optional — only used for n_fs' },
              { id: 'n', symbol: 'n', label: 'Small (driving) pulley speed', unit: 'rpm', kind: 'input' },
              { id: 'Ks', symbol: 'K_s', label: 'Service factor', unit: '', kind: 'lookup', fig: 'table17-15', default: 1.25, hint: 'Table 17-15 — use the value the problem gives (course: 1.25)',
                check: v => (H.has(v, 'Ks') && (v.Ks < 1 || v.Ks > 1.8)) ? 'Table 17-15 gives 1.0–1.8' : null },
              { id: 'nd', symbol: 'n_d', label: 'Design factor', unit: '', kind: 'input', default: 1.0, hint: 'course: 1.0 unless stated' },
              { id: 'n2', symbol: 'n_2', label: 'Driven pulley speed', unit: 'rpm', kind: 'calc', compute: v => H.has(v, 'n', 'VR') ? v.n / v.VR : undefined },
              { id: 'Hd', symbol: 'H_d', label: 'Design power', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'Hnom', 'Ks', 'nd') ? v.Hnom * v.Ks * v.nd : undefined,
                work: v => H.has(v, 'Hd') ? '\\(H_d = H_{nom}K_s n_d = ' + F(v.Hnom) + '(' + F(v.Ks) + ')(' + F(v.nd) + ') = ' + F(v.Hd) + '\\ \\text{hp}\\)' : null },
            ] },
          { id: 'spec', title: 'Belt material — Table 17-2, corrections C_p and C_v', when: v => notGeo(v) && M(v) !== 'catalogue', fig: ['table17-2', 'table17-4', 'fig17-9', 'table17-3'],
            text: 'Pick the belt the problem names, or choose from the table below. F_a, d_min, C_p and C_v fill in — type over them to use your own reading.',
            vars: [
              { id: 'spec', label: 'Belt (Table 17-2)', kind: 'choice', type: 'text', options: Object.keys(SPECS) },
              { id: 'Fa', symbol: 'F_a', label: 'Allowable tension per inch of width', unit: 'lbf/in', kind: 'lookup', fig: 'table17-2', hint: 'Table 17-2 (at 600 ft/min)', auto: v => spec(v) ? spec(v).Fa : undefined },
              { id: 'dmin', symbol: 'd_{min}', label: 'Minimum pulley diameter', unit: 'in', kind: 'lookup', fig: 'table17-2', hint: 'Table 17-2 (urethane: Table 17-3)', auto: v => spec(v) ? spec(v).dmin : undefined,
                check: v => (H.has(v, 'dmin', 'd') && v.d < v.dmin) ? 'Small pulley is below the minimum diameter for this belt' : null },
              { id: 'Cp', symbol: 'C_p', label: 'Pulley correction factor', unit: '', kind: 'lookup', fig: 'table17-4', hint: 'Table 17-4, column of the small pulley d',
                auto: v => { if (!spec(v) || !H.has(v, 'd')) return undefined; const r = CP[spec(v).mat]; const x = r ? r[cpCol(v.d)] : undefined; return isNaN(x) ? undefined : x; },
                check: v => (spec(v) && H.has(v, 'd') && CP[spec(v).mat] && isNaN(CP[spec(v).mat][cpCol(v.d)]) && !H.has(v, 'Cp')) ? 'Table 17-4 shows "—": the pulley is too small for this belt' : null },
              { id: 'Cv', symbol: 'C_v', label: 'Velocity correction factor', unit: '', kind: 'lookup', fig: 'fig17-9', hint: '1 for polyamide/urethane; leather: Fig. 17-9 (auto = rough fit)',
                auto: v => { if (!spec(v)) return undefined; if (spec(v).mat !== 'leather') return 1; if (!H.has(v, 'V')) return undefined; return H.interp(v.V / 1000, [0, 1, 2, 3, 4, 5, 6], [1.0, 0.99, 0.97, 0.94, 0.90, 0.83, 0.74]); } },
            ],
            after: v => specTableHtml(v) },
          { id: 'hab', title: 'Catalogue belt — Habasit (slide 21)', when: on('catalogue'), fig: ['habasit', 'habasit-full', 'habasit-crown', 'habasit-shaft', 'habasit-k1'],
            text: 'The catalogue gives \\((F_1)_a\\) directly as a force per unit width — no C_p or C_v.',
            vars: [
              { id: 'hab', label: 'Belt code', kind: 'choice', type: 'text', options: Object.keys(HAB).map(c => ({ value: c, label: c + ' — ' + HAB_GROUP(c) + ', ' + HAB[c][3] + ' N/mm' })) },
              { id: 'kN', symbol: "F_{a}'", label: 'Nominal peripheral force per unit width', unit: 'N/mm', kind: 'lookup', fig: 'habasit-full', hint: 'Habasit table, last column', auto: v => hab(v) ? hab(v)[3] : undefined },
              { id: 'tmm', symbol: 't', label: 'Thickness', unit: 'mm', kind: 'lookup', fig: 'habasit', hint: 'Habasit table', auto: v => hab(v) ? hab(v)[0] : undefined },
              { id: 'dminmm', symbol: 'd_{min}', label: 'Minimum pulley diameter', unit: 'mm', kind: 'lookup', fig: 'habasit', hint: 'Habasit table', auto: v => hab(v) ? hab(v)[1] : undefined,
                check: v => (H.has(v, 'dminmm', 'd') && v.d * 25.4 < v.dminmm) ? 'Small pulley (' + F(v.d * 25.4) + ' mm) is below the catalogue minimum' : null },
              { id: 'ka', symbol: "F_{a}'", label: 'Same, in lbf per inch of width', unit: 'lbf/in', kind: 'calc', compute: v => H.has(v, 'kN') ? v.kN * NMM : undefined,
                work: v => H.has(v, 'ka') ? '\\(' + F(v.kN) + '\\ \\text{N/mm} \\times 5.710 = ' + F(v.ka) + '\\ \\text{lbf/in}\\)' : null },
            ],
            after: v => habTableHtml(v) },
          { id: 'prop', title: 'Thickness, specific weight and friction', when: notGeo, fig: ['table17-2'],
            vars: [
              { id: 't', symbol: 't', label: 'Belt thickness', unit: 'in', kind: 'lookup', fig: 'table17-2', hint: 'Table 17-2 (catalogue: mm ÷ 25.4)',
                auto: v => M(v) === 'catalogue' ? (H.has(v, 'tmm') ? v.tmm / 25.4 : undefined) : (spec(v) ? spec(v).t : undefined) },
              { id: 'gamma', symbol: '\\gamma', label: 'Specific weight', unit: 'lbf/in^{3}', kind: 'lookup', fig: 'table17-2', hint: 'Table 17-2',
                auto: v => M(v) === 'catalogue' ? (v.hab ? (HAB_TABLE17_2[v.hab] ? SPECS[HAB_TABLE17_2[v.hab]].g : 0.042) : undefined) : (spec(v) ? spec(v).g : undefined) },
              { id: 'f', symbol: 'f', label: 'Coefficient of friction', unit: '', kind: 'lookup', fig: 'table17-2', hint: 'Table 17-2 (course range 0.4–0.8)',
                auto: v => M(v) === 'catalogue' ? (v.hab ? (HAB_TABLE17_2[v.hab] ? SPECS[HAB_TABLE17_2[v.hab]].f : 0.5) : undefined) : (spec(v) ? spec(v).f : undefined),
                check: v => (H.has(v, 'f') && (v.f < 0.4 || v.f > 0.8)) ? 'Course: f is 0.4–0.8 for flat belts' : null },
            ] },
          { id: 'wid', title: 'Belt width', when: on('analyse', 'capacity', 'tension', 'catalogue'),
            vars: [
              { id: 'b', symbol: 'b', label: 'Belt width', unit: 'in', kind: 'input', hint: 'urethane: fixed by the belt (auto)', auto: v => spec(v) && spec(v).b ? spec(v).b : undefined },
            ],
            after: v => M(v) === 'catalogue' ? widthTableHtml(v, 'catalogue') : '' },
          { id: 'std', title: 'Standard sizes — thickness, plies and widths', when: notGeo, fig: ['table17-2', 'habasit-full'],
            text: 'Reference: Table 17-2 sizes; the belt in use is highlighted.',
            after: v => stdFlat(v) },
        ] },

        { title: '3 · Solution', steps: [
          { id: 'geo', title: 'Wrap angles and belt length', fig: mott ? ['fig7-4', 'fig17-1'] : ['fig17-1', 'fig7-4'], eq: mott ? '17-1 … 17-4 (Mott 7-5 … 7-11)' : '17-1 … 17-4',
            formula: '\\phi_d = \\pi - 2\\sin^{-1}\\frac{D-d}{2C},\\quad \\phi_D = \\pi + 2\\sin^{-1}\\frac{D-d}{2C},\\quad L = \\sqrt{4C^2-(D-d)^2} + \\tfrac12 (D\\phi_D + d\\phi_d)',
            text: 'Open belt shown. Crossed: replace D − d by D + d; both pulleys wrap \\(\\phi = \\pi + 2\\sin^{-1}\\frac{D+d}{2C}\\) and \\(L = \\sqrt{4C^2 - (D+d)^2} + \\tfrac12(D+d)\\phi\\).',
            vars: [
              { id: 'alpha', symbol: '\\sin^{-1}\\frac{D \\mp d}{2C}', label: 'Belt angle', unit: 'rad', kind: 'calc', digits: 5,
                compute: v => (H.has(v, 'Dg', 'd') && Cof(v) > 0) ? Math.asin((cr(v) ? v.Dg + v.d : v.Dg - v.d) / (2 * Cof(v))) : undefined },
              { id: 'phi', symbol: '\\phi_d', label: 'Wrap angle, small pulley', unit: 'rad', kind: 'calc', digits: 5, compute: v => H.has(v, 'alpha') ? (cr(v) ? Math.PI + 2 * v.alpha : Math.PI - 2 * v.alpha) : undefined,
                work: v => H.has(v, 'phi') ? '\\(\\phi_d = \\pi ' + (cr(v) ? '+' : '-') + ' 2\\sin^{-1}\\frac{' + F(v.Dg) + (cr(v) ? '+' : '-') + F(v.d) + '}{2(' + F(Cof(v)) + ')} = ' + F(v.phi, 5) + '\\ \\text{rad}\\)' : null },
              { id: 'phideg', symbol: '\\phi_d', label: 'Wrap angle, small pulley', unit: '°', kind: 'calc', compute: v => H.has(v, 'phi') ? H.deg(v.phi) : undefined,
                check: v => (H.has(v, 'phideg') && v.phideg < 120) ? 'Wrap below 120° (course belt rule, slide 25) — poor friction; increase C or use an idler' : null },
              { id: 'phiD', symbol: '\\phi_D', label: 'Wrap angle, large pulley', unit: 'rad', kind: 'calc', digits: 5, compute: v => H.has(v, 'alpha') ? Math.PI + 2 * v.alpha : undefined },
              { id: 'L', symbol: 'L', label: 'Belt length', unit: 'in', kind: 'calc', compute: v => (H.has(v, 'Dg', 'd') && Cof(v) > 0) ? beltLength(v.d, v.Dg, Cof(v), cr(v)) : undefined,
                work: v => (H.has(v, 'L') && !cr(v)) ? '\\(L = \\sqrt{4(' + F(Cof(v)) + ')^2 - (' + F(v.Dg) + '-' + F(v.d) + ')^2} + \\tfrac12[' + F(v.Dg) + '(' + F(v.phiD, 4) + ') + ' + F(v.d) + '(' + F(v.phi, 4) + ')] = ' + F(v.L) + '\\ \\text{in}\\)'
                  : H.has(v, 'L') ? '\\(L = \\sqrt{4(' + F(Cof(v)) + ')^2 - (' + F(v.Dg) + '+' + F(v.d) + ')^2} + \\tfrac12(' + F(v.Dg) + '+' + F(v.d) + ')(' + F(v.phi, 4) + ') = ' + F(v.L) + '\\ \\text{in}\\)' : null },
            ] },
          { id: 'spd', title: 'Course step 1: belt speed and \\(e^{f\\phi}\\)', when: notGeo, eq: '(e), 17-7',
            formula: 'V = \\frac{\\pi d n}{12}\\ \\text{ft/min},\\qquad e^{f\\phi_d}',
            vars: [
              { id: 'V', symbol: 'V', label: 'Belt speed', unit: 'ft/min', kind: 'calc', compute: v => H.has(v, 'd', 'n') ? Math.PI * v.d * v.n / 12 : undefined,
                work: v => H.has(v, 'V') ? '\\(V = \\pi(' + F(v.d) + ')(' + F(v.n) + ')/12 = ' + F(v.V) + '\\ \\text{ft/min}\\)' : null },
              { id: 'efp', symbol: 'e^{f\\phi}', label: 'Friction term', unit: '', kind: 'calc', compute: v => H.has(v, 'f', 'phi') ? Math.exp(v.f * v.phi) : undefined,
                work: v => H.has(v, 'efp') ? '\\(e^{f\\phi} = \\exp[' + F(v.f) + '(' + F(v.phi, 5) + ')] = ' + F(v.efp) + '\\)' : null },
            ] },
          { id: 'bmin', title: 'Minimum width for full friction development', when: on('width'), fig: ['table17-4'], eq: '17-8, 17-12 (Ex 17-2, Prob 17-5)',
            formula: 'b_{min} = \\frac{\\Delta F}{a_0 - a_2}\\,\\frac{e^{f\\phi}}{e^{f\\phi}-1},\\qquad a_0 = F_aC_pC_v,\\quad a_2 = \\frac{12\\gamma t}{32.17}\\left(\\frac{V}{60}\\right)^2,\\quad \\Delta F = \\frac{2T}{d} = \\frac{2(63\\,025)H_d}{nd}',
            text: 'Per inch of width: allowable tight side a_0, centrifugal a_2. Setting \\(f^{\\prime} = f\\) at the design torque gives the narrowest belt; then pick a width ≥ b_min.',
            vars: [
              { id: 'a0', symbol: 'a_0', label: 'Allowable tension per inch, F_a·C_p·C_v', unit: 'lbf/in', kind: 'calc', compute: v => H.has(v, 'Fa', 'Cp', 'Cv') ? v.Fa * v.Cp * v.Cv : undefined },
              { id: 'a2', symbol: 'a_2', label: 'Centrifugal tension per inch of width', unit: 'lbf/in', kind: 'calc', compute: v => H.has(v, 'gamma', 't', 'V') ? 12 * v.gamma * v.t / G * (v.V / 60) ** 2 : undefined },
              { id: 'bmin', symbol: 'b_{min}', label: 'Minimum belt width', unit: 'in', kind: 'calc', compute: v => {
                  if (!H.has(v, 'Hd', 'n', 'd', 'efp', 'a0', 'a2') || v.a0 <= v.a2) return undefined;
                  return 2 * 63025 * v.Hd / (v.n * v.d) / (v.a0 - v.a2) * v.efp / (v.efp - 1); },
                work: v => H.has(v, 'bmin') ? '\\(\\Delta F = 2(63\\,025)(' + F(v.Hd) + ')/[' + F(v.n) + '(' + F(v.d) + ')] = ' + F(2 * 63025 * v.Hd / (v.n * v.d)) + '\\ \\text{lbf};\\quad b_{min} = \\frac{' + F(2 * 63025 * v.Hd / (v.n * v.d)) + '}{' + F(v.a0) + ' - ' + F(v.a2) + '}\\cdot\\frac{' + F(v.efp) + '}{' + F(v.efp) + ' - 1} = ' + F(v.bmin) + '\\ \\text{in}\\)' : null },
              { id: 'bsel', symbol: 'b', label: 'Width chosen', unit: 'in', kind: 'lookup', hint: 'next available width; auto = next whole inch (Shigley Ex 17-2: catalogue gave 10 in)',
                auto: v => H.has(v, 'bmin') ? Math.ceil(v.bmin - 1e-9) : undefined,
                check: v => (H.has(v, 'bsel', 'bmin') && v.bsel < v.bmin - 1e-9) ? 'Narrower than b_min — the belt will slip' : null },
            ],
            after: v => widthTableHtml(v, 'width') },
          { id: 'fc', title: 'Course step 2: centrifugal tension', when: notGeo, eq: '(e)',
            formula: 'w = 12\\gamma b t\\ \\text{lbf/ft},\\qquad F_c = \\frac{w}{32.17}\\left(\\frac{V}{60}\\right)^2',
            vars: [
              { id: 'w', symbol: 'w', label: 'Belt weight per foot', unit: 'lbf/ft', kind: 'calc', compute: v => H.has(v, 'gamma', 't') && bw(v) > 0 ? 12 * v.gamma * bw(v) * v.t : undefined,
                work: v => H.has(v, 'w') ? '\\(w = 12(' + F(v.gamma) + ')(' + F(bw(v)) + ')(' + F(v.t) + ') = ' + F(v.w) + '\\ \\text{lbf/ft}\\)' : null },
              { id: 'Fc', symbol: 'F_c', label: 'Centrifugal tension', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'w', 'V') ? v.w / G * (v.V / 60) ** 2 : undefined,
                work: v => H.has(v, 'Fc') ? '\\(F_c = \\frac{' + F(v.w) + '}{32.17}\\left(\\frac{' + F(v.V) + '}{60}\\right)^2 = ' + F(v.Fc) + '\\ \\text{lbf}\\)' : null },
            ] },
          { id: 'trq', title: 'Course steps 3–4: torque and tension difference', when: on('analyse', 'width', 'tension', 'catalogue'), eq: '(h)',
            formula: 'T = \\frac{63\\,025\\,H_{nom}K_s n_d}{n},\\qquad (F_1)_a - F_2 = \\frac{2T}{d}',
            vars: [
              { id: 'T', symbol: 'T', label: 'Torque at the design power', unit: 'lbf·in', kind: 'calc', compute: v => H.has(v, 'Hd', 'n') ? 63025 * v.Hd / v.n : undefined,
                work: v => H.has(v, 'T') ? '\\(T = 63\\,025(' + F(v.Hnom) + ')(' + F(v.Ks) + ')(' + F(v.nd) + ')/' + F(v.n) + ' = ' + F(v.T) + '\\ \\text{lbf·in}\\)' : null },
              { id: 'dF', symbol: '\\Delta F', label: 'Tension difference 2T/d', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'T', 'd') ? 2 * v.T / v.d : undefined,
                work: v => H.has(v, 'dF') ? '\\(\\Delta F = 2(' + F(v.T) + ')/' + F(v.d) + ' = ' + F(v.dF) + '\\ \\text{lbf}\\)' : null },
            ] },
          { id: 'f1a', title: 'Course step 5: allowable tight-side tension (F_1)_a', when: notGeo, fig: ['table17-4', 'fig17-9', 'habasit'], eq: '17-12',
            formula: '(F_1)_a = b\\,F_a\\,C_p\\,C_v\\qquad\\text{(catalogue: } (F_1)_a = F_a\'\\,b\\text{)}',
            vars: [
              { id: 'F1a', symbol: '(F_1)_a', label: 'Allowable largest tension', unit: 'lbf', kind: 'calc',
                compute: v => M(v) === 'catalogue' ? (H.has(v, 'ka') && bw(v) > 0 ? v.ka * bw(v) : undefined) : (H.has(v, 'Fa', 'Cp', 'Cv') && bw(v) > 0 ? bw(v) * v.Fa * v.Cp * v.Cv : undefined),
                work: v => !H.has(v, 'F1a') ? null : M(v) === 'catalogue' ? '\\((F_1)_a = ' + F(v.ka) + '(' + F(bw(v)) + ') = ' + F(v.F1a) + '\\ \\text{lbf}\\)'
                  : '\\((F_1)_a = bF_aC_pC_v = ' + F(bw(v)) + '(' + F(v.Fa) + ')(' + F(v.Cp) + ')(' + F(v.Cv) + ') = ' + F(v.F1a) + '\\ \\text{lbf}\\)' },
            ] },
          { id: 'tens', title: 'Course steps 6–7: slack side, initial tension, power carried', when: on('analyse', 'width', 'catalogue'), fig: ['fig17-7', 'fig17-8'], eq: '(i), (j)',
            formula: 'F_2 = (F_1)_a - \\Delta F,\\qquad F_i = \\frac{(F_1)_a + F_2}{2} - F_c,\\qquad H_a = \\frac{[(F_1)_a - F_2]\\,V}{33\\,000}',
            text: 'Shaft load (slide 7): \\((F_1 + F_2)\\cos\\theta\\) along the centre line, \\((F_1 - F_2)\\sin\\theta\\) across it (\\(\\theta\\) = belt angle).',
            vars: [
              { id: 'F2', symbol: 'F_2', label: 'Slack-side tension', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'F1a', 'dF') ? v.F1a - v.dF : undefined,
                work: v => H.has(v, 'F2') ? '\\(F_2 = ' + F(v.F1a) + ' - ' + F(v.dF) + ' = ' + F(v.F2) + '\\ \\text{lbf}\\)' : null,
                check: v => (H.has(v, 'F2', 'Fc') && v.F2 <= v.Fc) ? 'F_2 ≤ F_c: this belt cannot carry the torque — widen it or use a stronger belt' : null },
              { id: 'Fi', symbol: 'F_i', label: 'Initial tension', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'F1a', 'F2', 'Fc') ? (v.F1a + v.F2) / 2 - v.Fc : undefined,
                work: v => H.has(v, 'Fi') ? '\\(F_i = \\frac{' + F(v.F1a) + ' + ' + F(v.F2) + '}{2} - ' + F(v.Fc) + ' = ' + F(v.Fi) + '\\ \\text{lbf}\\)' : null },
              { id: 'Ha', symbol: 'H_a', label: 'Allowable (transmitted) power', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'F1a', 'F2', 'V') ? (v.F1a - v.F2) * v.V / 33000 : undefined,
                work: v => H.has(v, 'Ha') ? '\\(H_a = (' + F(v.F1a) + ' - ' + F(v.F2) + ')(' + F(v.V) + ')/33\\,000 = ' + F(v.Ha) + '\\ \\text{hp}\\)' : null },
              { id: 'Rsh', symbol: 'R', label: 'Belt load on the pulley shaft', unit: 'lbf', kind: 'calc',
                compute: v => H.has(v, 'F1a', 'F2', 'alpha') ? Math.hypot((v.F1a + v.F2) * Math.cos(v.alpha), (v.F1a - v.F2) * Math.sin(v.alpha)) : undefined },
            ] },
          { id: 'chk', title: 'Course steps 8–9: friction check, factor of safety, dip', when: on('analyse', 'width', 'catalogue'), fig: ['fig17-11'], eq: '17-7, 17-13',
            text: '\\(f^{\\prime}\\) is the friction the belt actually needs for the tension ratio and wrap ("effective friction", midterm 2022); no slip while \\(f^{\\prime} \\lt f\\).',
            formula: "f' = \\frac{1}{\\phi_d}\\ln\\frac{(F_1)_a - F_c}{F_2 - F_c} < f,\\qquad n_{fs} = \\frac{H_a}{H_{nom}K_s},\\qquad \\text{dip} = \\frac{C^2 w}{96 F_i}",
            vars: [
              { id: 'fp', symbol: "f'", label: 'Friction developed', unit: '', kind: 'calc', digits: 3, compute: v => (H.has(v, 'phi', 'F1a', 'F2', 'Fc') && v.F2 > v.Fc) ? Math.log((v.F1a - v.Fc) / (v.F2 - v.Fc)) / v.phi : undefined,
                work: v => H.has(v, 'fp') ? "\\(f' = \\frac{1}{" + F(v.phi, 5) + '}\\ln\\frac{' + F(v.F1a) + ' - ' + F(v.Fc) + '}{' + F(v.F2) + ' - ' + F(v.Fc) + '} = ' + F(v.fp, 3) + '\\)' : null,
                check: v => (H.has(v, 'fp', 'f') && v.fp >= v.f) ? '\\(f^{\\prime}\\) ≥ f — the belt slips' : null },
              { id: 'nfs', symbol: 'n_{fs}', label: 'Factor of safety', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'Ha', 'Hnom', 'Ks') ? v.Ha / (v.Hnom * v.Ks) : undefined,
                work: v => H.has(v, 'nfs') ? '\\(n_{fs} = \\frac{' + F(v.Ha) + '}{' + F(v.Hnom) + '(' + F(v.Ks) + ')} = ' + F(v.nfs, 3) + '\\)' : null,
                check: v => (H.has(v, 'nfs', 'nd') && v.nfs < v.nd - 1e-3) ? 'n_fs below n_d' : null },
              { id: 'dip', symbol: '\\text{dip}', label: 'Catenary dip at F_i', unit: 'in', kind: 'calc', digits: 3, compute: v => (H.has(v, 'w', 'Fi') && Cof(v) > 0 && v.Fi > 0) ? Cof(v) ** 2 * v.w / (96 * v.Fi) : undefined,
                work: v => H.has(v, 'dip') ? '\\(\\text{dip} = \\frac{(' + F(Cof(v)) + ')^2(' + F(v.w) + ')}{96(' + F(v.Fi) + ')} = ' + F(v.dip, 3) + '\\ \\text{in}\\)' : null },
            ] },
          { id: 'cap', title: 'Capacity: tight side at (F_1)_a with friction fully developed', when: on('capacity'), fig: ['fig17-8'], eq: '17-7, 17-12',
            formula: 'F_2 = F_c + \\frac{(F_1)_a - F_c}{e^{f\\phi}},\\quad T_{max} = [(F_1)_a - F_2]\\frac{d}{2},\\quad H_{a} = \\frac{[(F_1)_a - F_2]V}{33\\,000},\\quad H_{nom,max} = \\frac{H_a}{K_s n_d}',
            vars: [
              { id: 'F2s', symbol: 'F_2', label: 'Slack side at the point of slip', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'F1a', 'Fc', 'efp') ? v.Fc + (v.F1a - v.Fc) / v.efp : undefined,
                work: v => H.has(v, 'F2s') ? '\\(F_2 = ' + F(v.Fc) + ' + \\frac{' + F(v.F1a) + ' - ' + F(v.Fc) + '}{' + F(v.efp) + '} = ' + F(v.F2s) + '\\ \\text{lbf}\\)' : null,
                check: v => (H.has(v, 'F1a', 'Fc') && v.F1a <= v.Fc) ? '(F_1)_a ≤ F_c: the belt is too fast to carry any load' : null },
              { id: 'dFs', symbol: '\\Delta F', label: 'Largest tension difference', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'F1a', 'F2s') ? v.F1a - v.F2s : undefined },
              { id: 'Tcap', symbol: 'T_{max}', label: 'Torque capacity', unit: 'lbf·in', kind: 'calc', compute: v => H.has(v, 'dFs', 'd') ? v.dFs * v.d / 2 : undefined },
              { id: 'Hcap', symbol: 'H_a', label: 'Power capacity (allowable power)', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'dFs', 'V') ? v.dFs * v.V / 33000 : undefined,
                work: v => H.has(v, 'Hcap') ? '\\(H_a = ' + F(v.dFs) + '(' + F(v.V) + ')/33\\,000 = ' + F(v.Hcap) + '\\ \\text{hp}\\)' : null },
              { id: 'Hnmax', symbol: 'H_{nom,max}', label: 'Largest nominal power', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'Hcap', 'Ks', 'nd') ? v.Hcap / (v.Ks * v.nd) : undefined },
              { id: 'Fis', symbol: 'F_i', label: 'Initial tension this needs', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'F1a', 'F2s', 'Fc') ? (v.F1a + v.F2s) / 2 - v.Fc : undefined },
              { id: 'dipC', symbol: '\\text{dip}', label: 'Dip that sets this F_i', unit: 'in', kind: 'calc', digits: 3, compute: v => (H.has(v, 'w', 'Fis') && Cof(v) > 0 && v.Fis > 0) ? Cof(v) ** 2 * v.w / (96 * v.Fis) : undefined },
              { id: 'nfsC', symbol: 'n_{fs}', label: 'Factor of safety for the stated H_nom', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'Hcap', 'Hnom', 'Ks') ? v.Hcap / (v.Hnom * v.Ks) : undefined },
            ] },
          { id: 'ten', title: 'Initial tension: minimum for no slip, tensions at the F_i you set, dip', when: on('tension'), fig: ['fig17-7', 'fig17-8', 'fig17-11'], eq: '17-9, 17-13',
            formula: 'F_{i,min} = \\frac{T}{d}\\,\\frac{e^{f\\phi}+1}{e^{f\\phi}-1},\\qquad F_1 = F_i + F_c + \\frac{T}{d},\\quad F_2 = F_i + F_c - \\frac{T}{d},\\qquad \\text{dip} = \\frac{C^2w}{96F_i}',
            text: 'Below F_{i,min} the belt slips; above it F_1 rises and life drops. Blank F_i = the minimum; a measured dip gives F_i the other way round.',
            vars: [
              { id: 'Fimin', symbol: 'F_{i,min}', label: 'Smallest initial tension (no slip)', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'T', 'd', 'efp') ? v.T / v.d * (v.efp + 1) / (v.efp - 1) : undefined,
                work: v => H.has(v, 'Fimin') ? '\\(F_{i,min} = \\frac{' + F(v.T) + '}{' + F(v.d) + '}\\cdot\\frac{' + F(v.efp) + '+1}{' + F(v.efp) + '-1} = ' + F(v.Fimin) + '\\ \\text{lbf}\\)' : null },
              { id: 'Fiset', symbol: 'F_i', label: 'Initial tension set', unit: 'lbf', kind: 'input', hint: 'blank = F_i,min', auto: v => H.has(v, 'Fimin') ? v.Fimin : undefined },
              { id: 'F1t', symbol: 'F_1', label: 'Tight-side tension', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'Fiset', 'Fc', 'T', 'd') ? v.Fiset + v.Fc + v.T / v.d : undefined,
                check: v => (H.has(v, 'F1t', 'F1a') && v.F1t > v.F1a + 1e-6) ? 'F_1 above (F_1)_a = ' + F(v.F1a) + ' lbf — overstressed' : null },
              { id: 'F2t', symbol: 'F_2', label: 'Slack-side tension', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'Fiset', 'Fc', 'T', 'd') ? v.Fiset + v.Fc - v.T / v.d : undefined },
              { id: 'fpt', symbol: "f'", label: 'Friction developed at this F_i', unit: '', kind: 'calc', digits: 3, compute: v => (H.has(v, 'F1t', 'F2t', 'Fc', 'phi') && v.F2t > v.Fc) ? Math.log((v.F1t - v.Fc) / (v.F2t - v.Fc)) / v.phi : undefined,
                check: v => (H.has(v, 'fpt', 'f') && v.fpt > v.f + 1e-6) ? '\\(f^{\\prime}\\) > f — slips at this F_i' : null },
              { id: 'dipt', symbol: '\\text{dip}', label: 'Dip that sets this F_i', unit: 'in', kind: 'calc', digits: 3, compute: v => (H.has(v, 'w', 'Fiset') && Cof(v) > 0 && v.Fiset > 0) ? Cof(v) ** 2 * v.w / (96 * v.Fiset) : undefined,
                work: v => H.has(v, 'dipt') ? '\\(\\text{dip} = \\frac{(' + F(Cof(v)) + ')^2(' + F(v.w) + ')}{96(' + F(v.Fiset) + ')} = ' + F(v.dipt, 3) + '\\ \\text{in}\\)' : null },
              { id: 'dipin', symbol: '\\text{dip}', label: 'Measured dip (optional)', unit: 'in', kind: 'input', hint: 'to find F_i from a dip' },
              { id: 'Fidip', symbol: 'F_i', label: 'Initial tension from that dip', unit: 'lbf', kind: 'calc', compute: v => (H.has(v, 'w', 'dipin') && Cof(v) > 0 && v.dipin > 0) ? Cof(v) ** 2 * v.w / (96 * v.dipin) : undefined },
            ] },
        ] },

        { title: '4 · Answer', steps: [
          { id: 'res', title: 'Result — what the question asked for', after: result },
        ] },
      ],
    };
  };
})();
