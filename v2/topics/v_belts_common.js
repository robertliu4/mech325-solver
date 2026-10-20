// V-belts — shared definition for both book pages (v_belts_mott.js / v_belts_shigley.js are one-liners).
// The course mixes three methods, so both pages offer all of them through the first step "What does the question ask?":
//   mott    – design a new drive with Mott Ch 7-4 (midterm 2025 P1, HW1 P2/P3a, Mott Ex 7-2)
//   gates   – design with the Gates Heavy-Duty V-belt manual + installation tension (Tut 2 Q2, HW1 P3b, lecture s38–40)
//   shig    – analyse a given drive with Shigley 17-3: Ha, Nb, F1/F2/Fi, nfs, life (Tut 2 Q1, Shigley Ex 17-4)
//   rate    – power capacity of an existing drive with Mott's charts (exam variant)
//   tension – Gates installation tension & deflection only (lecture s39–40)
//   geom    – geometry only: length <-> centre distance, wrap, speeds
// Guide assumptions: v2/notes/belt_assumptions.md (V1–V18); question inventory: v2/notes/v_belts_questions.md.
// Chart auto-values (yellow, override with your own reading): Mott Fig 7-14/15/16 solid curves, Fig 7-17 steps, Fig 7-18, Fig 7-19
// were digitised from the cropped figures (pixel reads, ±0.1 hp / ±0.005); Gates NEMA Tables B2/B3 and D26/D27 typed from slides 33/39.
//
// Verified against (Playwright probes, inputs → answers; see final report):
// Polish pass (past exams in v2/course/past, see v2/notes/past_exam_m1.md):
// Midterm 2023 P1 [mott]: 50 hp 1160 → 600, Ks 1.5, CDmin 30, D1 13.9 (course pick), P_Tab 30, Cθ 0.94, CL 1.02 typed → Pdes 75, 5V, D2 27.7 (auto),
//   VR 1.993, 582.1 rpm, CD 32 (auto), L 130.8 → 132 (auto), B 266.8, CD 32.61, θ1 155.6°/204.4°, ΔP 1.26 (auto), PA 29.97, 3 belts, nfs 1.20.
//   Course slips: Lp written 134.5 (the (D2−D1)²/4CD term is 1.49, not 5.20) — same 132-in belt; boxed "593 rpm" is 582 rpm.
// Midterm 2014 Q22 [shig]: 1.024 hp × 1.3 × 1.5 = 1.997 hp, A, 5-in sheave @ 1500 rpm → V 1963, Htab 2.0 (auto 1.999) → A is enough.
// Midterm 2014 Q26 [shig, f = 0.5, Hd/Nb]: B, 2 hp, 2000 rpm, d 5, Nb 1 → Fc 6.61, ΔF 25.2, e^{0.5π} 4.81, F1 38.4, F2 13.2, Fi 19.2 lbf.
// Midterm MC (2014/2016/2022/2023) [rate, N_b = 2]: per-belt power P_des/N_b = 1.41 / 1.24 / 1.41 / 0.94 hp → 1.5 / 1.4 / 1.5 / 1.1 hp belts.
// Trial CD default: 32 in clamped into D2 < CD < 3(D1+D2) (course practice); 2025 all-auto → 112 in, CD 30.5, 3 belts, nfs 1.26.
// Midterm 2025 P1 [mode mott]: 40 hp, 1150 → 590 rpm, Ks 1.3, 5V, D1 10.8 (chosen), PTab 23 (course read; chart auto 22.1), ΔP 1.26 (auto 1.25),
//   CD 32, Lstd 125 → Pdes 52, D2 21.1 (auto), VR 1.954, 589 rpm, B 299.67, CD 37.10, θ1 164.0°, Cθ 0.960 (auto), CL 1.0 (auto 1.004),
//   PA 23.29, 3 belts, nfs 1.344. Course slip: the solution writes Lp = 122.9 for CD 32 (2(32)+1.57(31.9)+0.83 = 114.9) and then takes 125.
// HW1 P2 (Mott 7-20) [mott]: 40 hp 1500 → 550, Ks 1.4, 5V → Pdes 56, D1 10.2 (auto), D2 27.7 (auto), 552 rpm, CD 36 → L 133.6 → 132 (auto),
//   CD 35.16, θ1 151.2°, Cθ 0.924 (auto, course 0.92), CL 1.014 (auto, course 1.01); PTab 25.7 (course; chart auto 24.7); course omits ΔPR
//   (set 0; auto 1.63) → 23.9 hp/belt → 3 belts.
// HW1 P3a (Mott 7-19) [mott]: 5 hp 1750 → 725, Ks 1.2, 3V → 6 hp, D1 7.95 (auto), D2 18.95 (auto), 734 rpm, V 3642, PTab 10 (auto 9.94),
//   CD 24 → 91.49 → 90 (auto), CD 23.23, θ1 152.6°, Cθ 0.93 (auto 0.929), CL 1.07 (auto 1.070) → Ha 0.93(1.07)(10 + 1.9) = 11.84,
//   1 belt. Course slip: ΔP 1.9 is read from the 5V chart (Fig 7-17); for 3V the dashed-curve gap gives ≈0.33 (auto) → 10.6 hp/belt, still 1 belt.
// Mott Ex 7-2 [mott]: 50 hp 1160 → 675, SF 1.3, 5V, D1 12.4 → 65 hp, D2 21.1 (auto), 682 rpm, vb 3766, PTab 26.39 (auto, Mott 26.4),
//   ΔP 1.153 (auto, Mott 1.15), CD 24 → 101.4 → 100 (auto), CD 23.30, θ1 158°, Cθ 0.94, CL 0.96 (Mott; auto 0.946/0.969) → 24.86 hp/belt, 3 belts.
// HW1 P3b (Gates) [gates]: 5 hp 1750 → 725, Ks 1.3, 3V, NEMA min 3.0 (auto), d 3.35, D 8.00, 3V400 → CD 10.84, Hall 0.9(2.8+0.36) = 2.844,
//   3 belts, nfs 1.31, V 1534.8, M 0.46, Y 4, Kφ 0.94 (auto 0.936) → Tst 28.12 lbf; Fmin/Fmax 2.71/2.89 lbf (course writes 7.23 lbf:
//   it divided by 6 instead of 16 in Formula D20).
// Tutorial 2 Q2 (Gates) [gates]: 60 hp 400 rpm, Ks 1.5 → 90 hp, C (Hi-Power CP), NEMA B3 min 12 (auto), 13/13 in, CD 144 → C330 (auto),
//   CD 144.6 (Gates table 145), V 1361, KG 1.2 (auto K1K2), Htab 23.3 → Hall 27.96, 4 belts, nfs 1.243; tensions with Hd/Nb: Fi 409 lbf;
//   Tst 251 lbf (M 1.6, Y 87, Kφ 1.0, motor hp 60), deflection 2.26 in, force 27.4–29.0 lbf.
// Lecture s38–40 [gates]: 3VX800, d 6, D 19, 1750 rpm, 2 hp, Ks 1.1 (slide says 1.2 but computes 1.1 × 2.0 = 2.2), KG 0.9,
//   Htab 7.68 + 0.25 → 7.14 hp, nfs 3.25, VR 3.17, 552 rpm, V 2749, C 19.28, Kφ 0.90 (auto 0.895), M 0.29, Y 4, t 18.18 (18.21 with C 19.3),
//   Tst 21.59, deflection 0.28 in, force 1.95–2.08 lbf (single belt D22/D23). Same numbers in [tension] mode.
// Tutorial 2 Q1 (S 17-19) [shig]: 60 hp 400 rpm, Ks 1.4, D, 26/26 in, C ≈ 144 → D360 (auto), Lp 363.3, C 140.8, V 2722.7, e^{0.5123π} 5.00,
//   Htab 16.94 (auto), K1 1.00, K2 1.10, Ha 18.63, Hd 84, Nb 4.51 → 5, ΔF 225.8 (Ha basis), Fc 25.9, F1 308.1, F2 82.3, Fi 169.3,
//   nfs 1.109, T1 526.6, NP 5.3e9 → > 1e9, t > 185 300 h, 31.7 yr at 16 h/day.
// Sizing tables (section → sheaves → standard length → number of belts; ★ = rule pick, Use fills the field):
//   Midterm P1: Fig 7-13 → 5V, sheave table → 10.8/21.1 (±2 %, nearest 4000 ft/min), length table → 112 in is the strict closest to
//   the correct 114.9 in (course took 125 after its 122.9 slip — note shown), belts table → 3. HW1 P2: 5V (on the 3V|5V line → larger),
//   10.2/27.7, 132, 3. HW1 P3a: 3V, 7.95/18.95, 90, 1. Ex 7-2: 5V, 12.4/21.1, 100, 3. HW1 P3b (Gates): B1 → 3V, 3.35/8.00 (first stock
//   ≥ NEMA 3.0), 3V400, 3. Tut 2 Q2 (Gates): B1 → 8V / B2 → CP (solution: "8V or 8VX and CP", chose CP), 13/13 (12-in minimum must be
//   exceeded below 575 rpm), C330, 4. Tut 2 Q1 (Shigley): chart → C (problem specifies D; Table 17-9 allows C and D), D360, 5.
//   Ex 17-4: B (chart says A but Table 17-9 caps A at 10 hp), 3 belts.
// Shigley Ex 17-4 [shig]: 10 hp 1750, Ks 1.3, 7.4/11 in, 3 × B112 → V 3390, Lp 113.8, C 42.4, φ 3.057, e^{fφ} 4.788, Htab 4.693 (auto),
//   K1 0.99, K2 1.05, Ha 4.88, Hd 13, Nb 3, Fc 11.1, ΔF 42.2 (Hd/Nb basis), F1 64.4, F2 22.2, Fi 32.2, nfs 1.13, T1 142.2, T2 116.8,
//   NP 1.1e10 → > 1e9, t > 46 600 h.
(function () {
  const NARROW = ['3V', '5V', '8V', '3VX', '5VX'];
  const CLASSIC = ['A', 'B', 'C', 'D', 'E', 'AX', 'BX', 'CX'];
  const base = s => ({ '3VX': '3V', '5VX': '5V', AX: 'A', BX: 'B', CX: 'C' }[s] || s);
  const isNarrow = s => NARROW.includes(s);
  const isClassic = s => CLASSIC.includes(s);
  const nearest = (x, arr) => arr.reduce((b, a) => Math.abs(a - x) < Math.abs(b - x) ? a : b);
  const lin = (x, xs, ys) => {  // linear interpolation, undefined outside the range or on missing (NaN) points
    if (x < xs[0] - 1e-9 || x > xs[xs.length - 1] + 1e-9) return undefined;
    for (let i = 1; i < xs.length; i++) if (x <= xs[i] + 1e-9) {
      const t = (x - xs[i - 1]) / (xs[i] - xs[i - 1]); const y = ys[i - 1] + t * (ys[i] - ys[i - 1]);
      return isNaN(y) ? (Math.abs(t) < 1e-9 ? ys[i - 1] : Math.abs(t - 1) < 1e-9 ? ys[i] : undefined) : y;
    }
    return ys[0];
  };

  // ---------------- Mott data ----------------
  // Standard sheave pitch diameters (vertical lines on Figs 7-14/15/16)
  const SHEAVES = {
    '3V': [2.60, 2.75, 2.95, 3.10, 3.30, 3.60, 4.07, 4.45, 4.70, 4.95, 5.25, 5.55, 5.95, 6.45, 6.85, 7.95, 10.55, 13.95, 18.95, 24.95, 33.45],
    '5V': [7.0, 7.4, 7.9, 8.4, 8.9, 9.15, 9.65, 10.2, 10.8, 11.7, 12.4, 13.1, 13.9, 14.9, 15.9, 21.1, 27.7, 37.4, 49.9],
    '8V': [13.0, 13.8, 14.8, 15.8, 16.8, 17.8, 18.8, 19.8, 21.0, 22.2, 22.8, 23.8, 24.8, 29.8, 39.8, 52.8, 70.8, 94.8],
  };
  // Table 7-2 standard lengths (in)
  const L3 = [25, 26.5, 28, 30, 31.5, 33.5, 35.5, 37.5, 40, 42.5, 45, 47.5, 50, 53, 56, 60, 63, 67, 71, 75, 80, 85, 90, 95, 100, 106, 112, 118, 125, 132, 140, 165];
  const L5 = [50, 53, 56, 60, 63, 67, 71, 75, 80, 85, 90, 95, 100, 106, 112, 118, 125, 132, 140, 150, 160, 170, 180, 190, 200, 212, 224, 236, 250, 265, 280, 300, 315, 335, 355];
  const L8 = [100, 106, 112, 118, 125, 132, 140, 150, 160, 170, 180, 190, 200, 212, 224, 236, 250, 265, 280, 300, 315, 335, 355, 375, 400, 425, 450, 475, 500];
  // Figs 7-14/15/16 solid curves (VR = 1), digitised at the standard sheave lines
  const PTAB = {
    '3V': { d: [2.60, 2.75, 2.95, 3.10, 3.30, 3.60, 4.07, 4.45, 4.70, 4.95, 5.25, 5.55, 5.95, 6.45, 6.85, 7.95, 9.00, 10.55], rpm: [870, 1160, 1750], p: [
      [0.85, 0.945, 1.145, 1.28, 1.465, 1.735, 2.16, 2.505, 2.735, 2.945, 3.215, 3.485, 3.84, 4.28, 4.63, 5.56, 6.41, 7.58],
      [1.12, 1.25, 1.495, 1.665, 1.895, 2.24, 2.77, 3.20, 3.485, 3.76, 4.10, 4.43, 4.885, 5.425, 5.87, 7.045, 8.14, 9.64],
      [1.48, 1.665, 2.03, 2.29, 2.625, 3.14, 3.92, 4.545, 4.96, 5.355, 5.84, 6.32, 6.955, 7.73, 8.33, 9.94, 11.355, NaN]] },
    '5V': { d: [7.0, 7.4, 7.9, 8.4, 8.9, 9.15, 9.65, 10.2, 10.8, 11.7, 12.4, 13.1, 13.9, 14.9, 15.9], rpm: [870, 1160, 1750], p: [
      [8.94, 9.9, 11.08, 12.26, 13.41, 14.0, 15.16, 16.42, 17.68, 19.65, 21.14, 22.57, 24.19, 26.17, 28.05],
      [11.43, 12.57, 14.0, 15.48, 16.93, 17.61, 19.02, 20.57, 22.25, 24.64, 26.39, 28.24, 30.22, 32.54, 34.75],
      [15.63, 17.2, 19.17, 21.1, 23.0, 23.9, 25.76, 27.74, 29.74, 32.67, 34.8, 36.72, 38.73, 41.0, NaN]] },
    '8V': { d: [13.0, 13.8, 14.8, 15.8, 16.8, 17.8, 18.8, 19.8, 21.0, 22.2, 22.8, 23.8, 24.8], rpm: [690, 870, 1160], p: [
      [32.9, 36.4, 40.88, 45.12, 49.52, 53.76, 57.92, 62.08, 66.96, 71.68, 74.08, 77.76, 81.5],
      [39.1, 43.28, 48.56, 53.76, 59.0, 63.92, 68.72, 73.36, 78.72, 84.0, 86.4, 90.5, 94.2],
      [47.7, 52.56, 58.64, 64.44, 70.4, 75.88, 81.36, 86.16, 91.76, 96.32, 98.36, NaN, NaN]] },
  };
  function chartP(sec, d, n) {
    const c = PTAB[sec]; if (!c || !(d > 0) || !(n > 0)) return undefined;
    const vals = c.p.map(row => lin(d, c.d, row));
    const r = c.rpm, lo = r[0], hi = r[r.length - 1];
    if (n < lo * 0.95 || n > hi * 1.05) return undefined;           // outside the chart's rpm curves
    let i = 0; while (i < r.length - 2 && n > r[i + 1]) i++;
    const a = vals[i], b = vals[i + 1]; if (a === undefined || b === undefined) return undefined;
    return a + (n - r[i]) / (r[i + 1] - r[i]) * (b - a);
  }
  // Fig 7-17 (5V) power added: step limits (VR rounded to 0.01) and values at 1750 rpm; ΔP ∝ rpm (1160/870 curves check to ±0.01)
  const DPR_VR = [1.02, 1.06, 1.12, 1.19, 1.27, 1.39, 1.58, 1.95, 3.39];
  const DPR_1750 = [0.14, 0.46, 0.80, 1.09, 1.32, 1.55, 1.74, 1.90, 2.01];
  const DPR_MAX = { '3V': 0.20, '5V': 1.149, '8V': 5.4 };  // hp per 1000 rpm at VR ≥ 3.38 (= dashed − solid gap of Figs 7-14/7-16; Fig 7-17 for 5V)
  function dPR(sec, n, VR) {
    if (!DPR_MAX[sec] || !(n > 0) || !(VR > 0)) return undefined;
    const r = Math.round(Math.max(VR, 1 / VR) * 100) / 100; let k = -1;
    DPR_VR.forEach((t, i) => { if (r >= t - 1e-9) k = i; });
    return k < 0 ? 0 : DPR_MAX[sec] * n / 1000 * DPR_1750[k] / 2.01;
  }
  // Fig 7-18 Cθ and Fig 7-19 CL, digitised
  const CTH_X = [80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180];
  const CTH_Y = [0.627, 0.66, 0.693, 0.722, 0.746, 0.769, 0.789, 0.807, 0.826, 0.844, 0.861, 0.876, 0.891, 0.906, 0.921, 0.936, 0.949, 0.963, 0.976, 0.99, 1.0];
  const cth = th => (th > 0) ? H.interp(Math.min(th, 180), CTH_X, CTH_Y) : undefined;
  const CLM = {
    '3V': [[25, .832], [30, .859], [35, .884], [40, .909], [45, .932], [50, .953], [60, .988], [71, 1.023], [80, 1.045], [90, 1.07], [100, 1.091], [112, 1.111], [125, 1.129], [140, 1.148], [150, 1.158], [165, 1.171]],
    '5V': [[50, .849], [60, .884], [71, .914], [80, .933], [90, .953], [100, .969], [112, .987], [125, 1.004], [140, 1.022], [160, 1.042], [180, 1.06], [200, 1.076], [224, 1.094], [250, 1.112], [280, 1.131], [300, 1.142], [335, 1.162], [355, 1.171]],
    '8V': [[100, .873], [112, .889], [125, .904], [140, .919], [160, .937], [180, .954], [200, .969], [224, .985], [250, 1.001], [280, 1.018], [300, 1.028], [335, 1.044], [375, 1.062], [400, 1.072], [425, 1.083], [450, 1.093], [500, 1.11]],
  };
  const clM = (sec, L) => { const t = CLM[base(sec)]; return (t && L > 0) ? H.interp(L, t.map(x => x[0]), t.map(x => x[1])) : undefined; };
  // Fig 7-13 selection chart in its own pixel space (log hp across, rpm up); lines read off the crop
  const F13Y = [[100, 578], [200, 497], [300, 471], [400, 450], [500, 416], [600, 391], [700, 369], [800, 355], [900, 335], [1000, 322], [1160, 307], [1750, 252], [2000, 226], [3000, 183], [3450, 165], [4000, 147], [5000, 122], [6000, 101], [7000, 82], [8000, 68], [9000, 55], [10000, 38]];


  // ---------------- Shigley data (Tables 17-9 … 17-17) ----------------
  const SEC = {   // dmin: Table 17-9 (A–E) / Table 17-17 (3V/5V/8V); conv: Table 17-11; Kb, Kc: Table 17-16; K, b: Table 17-17 (10^8–10^9 peaks)
    A: { dmin: 3.0, conv: 1.3, Kb: 220, Kc: 0.561, K: 674, b: 11.089, hp: [0.25, 10] },
    B: { dmin: 5.4, conv: 1.8, Kb: 576, Kc: 0.965, K: 1193, b: 10.926, hp: [1, 25] },
    C: { dmin: 9.0, conv: 2.9, Kb: 1600, Kc: 1.716, K: 2038, b: 11.173, hp: [15, 100] },
    D: { dmin: 13.0, conv: 3.3, Kb: 5680, Kc: 3.498, K: 4208, b: 11.105, hp: [50, 250] },
    E: { dmin: 21.6, conv: 4.5, Kb: 10850, Kc: 5.041, K: 6061, b: 11.100, hp: [100, 1e9] },
    '3V': { dmin: 2.65, conv: 0, Kb: 230, Kc: 0.425, K: 728, b: 12.464 },
    '5V': { dmin: 7.1, conv: 0, Kb: 1098, Kc: 1.217, K: 1654, b: 12.593 },
    '8V': { dmin: 12.5, conv: 0, Kb: 4830, Kc: 3.288, K: 3638, b: 12.629 },
  };
  const sd = v => SEC[base(v.sec)];
  const LENG = {   // Table 17-10 inside circumferences
    A: [26, 31, 33, 35, 38, 42, 46, 48, 51, 53, 55, 57, 60, 62, 64, 66, 68, 71, 75, 78, 80, 85, 90, 96, 105, 112, 120, 128],
    B: [35, 38, 42, 46, 48, 51, 53, 55, 57, 60, 62, 64, 65, 66, 68, 71, 75, 78, 79, 81, 83, 85, 90, 93, 97, 100, 103, 105, 112, 120, 128, 131, 136, 144, 158, 173, 180, 195, 210, 240, 270, 300],
    C: [51, 60, 68, 75, 81, 85, 90, 96, 105, 112, 120, 128, 136, 144, 158, 162, 173, 180, 195, 210, 240, 270, 300, 330, 360, 390, 420],
    D: [120, 128, 144, 158, 162, 173, 180, 195, 210, 240, 270, 300, 330, 360, 390, 420, 480, 540, 600, 660],
    E: [180, 195, 210, 240, 270, 300, 330, 360, 390, 420, 480, 540, 600, 660],
    '3V': L3, '5V': L5, '8V': L8,
  };
  const HP = {   // Table 17-12 rows [d, hp @ 1000, 2000, 3000, 4000, 5000 ft/min]; last row = "and up"
    A: [[2.6, 0.47, 0.62, 0.53, 0.15, NaN], [3.0, 0.66, 1.01, 1.12, 0.93, 0.38], [3.4, 0.81, 1.31, 1.57, 1.53, 1.12], [3.8, 0.93, 1.55, 1.92, 2.00, 1.71], [4.2, 1.03, 1.74, 2.20, 2.38, 2.19], [4.6, 1.11, 1.89, 2.44, 2.69, 2.58], [5.0, 1.17, 2.03, 2.64, 2.96, 2.89]],
    B: [[4.2, 1.07, 1.58, 1.68, 1.26, 0.22], [4.6, 1.27, 1.99, 2.29, 2.08, 1.24], [5.0, 1.44, 2.33, 2.80, 2.76, 2.10], [5.4, 1.59, 2.62, 3.24, 3.34, 2.82], [5.8, 1.72, 2.87, 3.61, 3.85, 3.45], [6.2, 1.82, 3.09, 3.94, 4.28, 4.00], [6.6, 1.92, 3.29, 4.23, 4.67, 4.48], [7.0, 2.01, 3.46, 4.49, 5.01, 4.90]],
    C: [[6.0, 1.84, 2.66, 2.72, 1.87, NaN], [7.0, 2.48, 3.94, 4.64, 4.44, 3.12], [8.0, 2.96, 4.90, 6.09, 6.36, 5.52], [9.0, 3.34, 5.65, 7.21, 7.86, 7.39], [10.0, 3.64, 6.25, 8.11, 9.06, 8.89], [11.0, 3.88, 6.74, 8.84, 10.0, 10.1], [12.0, 4.09, 7.15, 9.46, 10.9, 11.1]],
    D: [[10.0, 4.14, 6.13, 6.55, 5.09, 1.35], [11.0, 5.00, 7.83, 9.11, 8.50, 5.62], [12.0, 5.71, 9.26, 11.2, 11.4, 9.18], [13.0, 6.31, 10.5, 13.0, 13.8, 12.2], [14.0, 6.82, 11.5, 14.6, 15.8, 14.8], [15.0, 7.27, 12.4, 15.9, 17.6, 17.0], [16.0, 7.66, 13.2, 17.1, 19.2, 19.0], [17.0, 8.01, 13.9, 18.1, 20.6, 20.7]],
    E: [[16.0, 8.68, 14.0, 17.5, 18.1, 15.3], [18.0, 9.92, 16.7, 21.2, 23.0, 21.5], [20.0, 10.9, 18.7, 24.2, 26.9, 26.4], [22.0, 11.7, 20.3, 26.6, 30.2, 30.5], [24.0, 12.4, 21.6, 28.6, 32.9, 33.8], [26.0, 13.0, 22.8, 30.3, 35.1, 36.7], [28.0, 13.4, 23.7, 31.8, 37.1, 39.1]],
  };
  function htab17(sec, d, V) {
    const rows = HP[sec]; if (!rows || !(d >= rows[0][0] - 1e-9) || V < 1000 || V > 5000) return undefined;
    let r0 = rows[0], r1 = rows[0];
    for (let i = 0; i < rows.length; i++) if (rows[i][0] <= d) { r0 = rows[i]; r1 = rows[Math.min(i + 1, rows.length - 1)]; }
    const t = (r1[0] === r0[0]) ? 0 : Math.min(1, (d - r0[0]) / (r1[0] - r0[0]));
    const ys = r0.slice(1).map((x, i) => x + t * (r1[i + 1] - x));
    const val = H.interp(V, [1000, 2000, 3000, 4000, 5000], ys);
    return isNaN(val) ? undefined : val;
  }
  const K2T = {   // Table 17-14 [upper bound of nominal length, K2]
    A: [[35, 0.85], [46, 0.90], [55, 0.95], [75, 1.00], [90, 1.05], [112, 1.10], [1e9, 1.15]],
    B: [[46, 0.85], [60, 0.90], [75, 0.95], [97, 1.00], [120, 1.05], [144, 1.10], [180, 1.15], [1e9, 1.20]],
    C: [[75, 0.85], [96, 0.90], [120, 0.95], [158, 1.00], [195, 1.05], [240, 1.10], [300, 1.15], [1e9, 1.20]],
    D: [[128, 0.85], [162, 0.90], [210, 0.95], [240, 1.00], [330, 1.05], [420, 1.10], [480, 1.15], [1e9, 1.20]],
    E: [[195, 0.90], [240, 0.95], [300, 1.00], [390, 1.05], [480, 1.10], [600, 1.15], [1e9, 1.20]],
  };
  const k2 = (sec, L) => { const t = K2T[base(sec)]; if (!t || !(L > 0)) return undefined; for (const [ub, k] of t) if (L <= ub + 1e-9) return k; };
  const k1 = th => (th > 0) ? 0.143543 + 0.007468 * th - 0.000015052 * th * th : undefined;   // Table 17-13 VV curve fit (φ in degrees)

  // ---------------- Gates data (course slides 33, 39) ----------------
  const NEMA_HP = [0.5, 0.75, 1, 1.5, 2, 3, 5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300];
  const NEMA_RPM = [575, 690, 870, 1160, 1750, 3450];
  const _ = NaN;
  const B2 = [[_, _, 2.2, _, _, _], [_, _, 2.4, 2.2, _, _], [3.0, 2.5, 2.4, 2.4, 2.2, _], [3.0, 3.0, 2.4, 2.4, 2.4, 2.2], [3.8, 3.0, 3.0, 2.4, 2.4, 2.4], [4.5, 3.8, 3.0, 3.0, 2.4, 2.4], [4.5, 4.5, 3.8, 3.0, 3.0, 2.4], [5.2, 4.5, 4.4, 3.8, 3.0, 3.0], [6.0, 5.2, 4.4, 4.4, 3.8, 3.0], [6.8, 6.0, 5.2, 4.4, 4.4, 3.8], [8.2, 6.8, 6.0, 5.2, 4.4, 4.4], [9.0, 8.2, 6.8, 6.0, 4.4, 4.4], [10.0, 9.0, 6.8, 6.8, 5.2, _], [10.0, 10.0, 8.2, 6.8, 6.0, _], [11.0, 10.0, 8.4, 8.2, 6.8, _], [12.0, 11.0, 10.0, 8.0, 7.4, _], [14.0, 13.0, 9.5, 10.0, 8.6, _], [18.0, 15.0, 12.0, 10.0, 8.6, _], [20.0, 18.0, 15.0, 12.0, 10.5, _], [22.0, 20.0, 18.0, 13.0, 10.5, _], [22.0, 22.0, 22.0, _, 13.2, _], [22.0, 22.0, _, _, _, _], [27.0, 27.0, _, _, _, _]];
  const B3 = [[2.5, 2.5, 2.2, _, _, _], [3.0, 2.5, 2.4, 2.2, _, _], [3.0, 3.0, 2.4, 2.4, 2.2, _], [3.0, 3.0, 2.4, 2.4, 2.4, 2.2], [3.8, 3.0, 3.0, 2.4, 2.4, 2.4], [4.5, 3.8, 3.0, 3.0, 2.4, 2.4], [4.5, 4.5, 3.8, 3.0, 3.0, 2.6], [5.2, 4.5, 4.4, 3.8, 3.0, 3.0], [6.0, 5.2, 4.6, 4.4, 3.8, 3.0], [6.8, 6.0, 5.4, 4.6, 4.4, 3.8], [8.2, 6.8, 6.0, 5.4, 4.6, 4.4], [9.0, 8.2, 6.8, 6.0, 5.0, 4.4], [10.0, 9.0, 6.8, 6.8, 5.4, _], [10.0, 10.0, 8.2, 6.8, 6.0, _], [11.0, 10.0, 9.0, 8.2, 6.8, _], [12.0, 11.0, 10.0, 9.0, 7.4, _], [14.0, 13.0, 10.5, 10.0, 9.0, _], [18.0, 15.0, 12.5, 11.0, 10.0, _], [20.0, 18.0, 15.0, 12.5, 11.5, _], [22.0, 20.0, 18.0, 13.0, _, _], [22.0, 22.0, 22.0, _, _, _], [22.0, 22.0, _, _, _, _], [27.0, 27.0, _, _, _, _]];
  function nema(sec, hp, n) {
    if (!sec || !(hp > 0) || !(n > 0)) return undefined;
    const i = NEMA_HP.findIndex(h => h >= hp - 1e-9); if (i < 0) return undefined;
    const j = NEMA_RPM.indexOf(nearest(n, NEMA_RPM));
    const val = (isClassic(sec) ? B3 : B2)[i][j];
    return isNaN(val) ? undefined : val;
  }
  const KPHI_X = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
  const KPHI_Y = [1.00, 0.99, 0.97, 0.96, 0.94, 0.93, 0.91, 0.89, 0.87, 0.85, 0.82];
  const GMY = { '3VX': [0.29, 4], '5VX': [0.78, 13], '3V': [0.46, 4], '5V': [1.0, 11], '8V': [2.6, 22], AX: [0.47, 7], BX: [0.76, 8], CX: [1.31, 15], C: [1.6, 87] };
  // Gates stock sheave diameters (outside dia. for 3V/5V/8V, datum dia. for A–D), read off the drive-selection tables:
  //   3V: Table B6 p.B16 small/large-sheave columns (course crop gates_table_b6_3v_drives_p_b16; HW1 P3b 3.35/8.00, lecture 6.00/19.00)
  //   5V/8V: not digitised from Gates (damaged text layer) — Mott Fig 7-15/7-16 standard pitch diameters + 2a (0.10 / 0.20 in), as Gates OD = PD + 2a
  //   A: Table B21 p.B9, B: Table B22 p.B120, D: Table B24 p.B216 (VR 1.00 rows, rendered pages); C: Table B23 p.B191 (course crop, Tutorial 2 Q2)
  //   Larger driven sheaves of A–D are not all listed on those pages: beyond the list the table shows D1·VR rounded and says "check the drive table".
  const GSHEAVE = {
    '3V': [2.20, 2.35, 2.50, 2.65, 2.80, 3.00, 3.15, 3.35, 3.65, 4.12, 4.50, 4.75, 5.00, 5.30, 5.60, 6.00, 6.50, 6.90, 8.00, 10.60, 14.00, 19.00, 25.00, 33.50],
    '5V': [7.1, 7.5, 8.0, 8.5, 9.0, 9.25, 9.75, 10.3, 10.9, 11.8, 12.5, 13.2, 14.0, 15.0, 16.0, 21.2, 27.8, 37.5, 50.0],
    '8V': [13.2, 14.0, 15.0, 16.0, 17.0, 18.0, 19.0, 20.0, 21.2, 22.4, 23.0, 24.0, 25.0, 30.0, 40.0, 53.0, 71.0, 95.0],
    A: [2.20, 2.40, 2.60, 2.80, 3.00, 3.20, 3.40, 3.60, 3.80, 4.00, 4.20, 4.40, 4.60, 4.80, 5.00, 5.20, 5.40, 5.60, 5.80, 6.00, 6.20, 6.40, 6.60, 7.00],
    B: [3.40, 3.60, 3.80, 4.00, 4.20, 4.40, 4.60, 4.80, 5.00, 5.20, 5.40, 5.60, 5.80, 6.00, 6.20, 6.40, 6.60, 6.80, 7.00, 7.40, 8.00, 8.60, 9.40],
    C: [5.00, 5.60, 6.00, 7.00, 7.50, 8.00, 8.50, 9.00, 9.50, 10.00, 10.50, 11.00, 12.00, 13.00, 14.00, 16.00, 18.00, 20.00],
    D: [13.0, 13.5, 14.0, 14.5, 15.0, 15.5, 16.0, 17.0, 18.0, 20.0, 22.0, 24.0, 27.0, 33.0],
  };

  // ---------------- section-selection charts (digitised in each crop's own pixel space) ----------------
  // Each chart returns rows [{sec, label, lo, hi (hp at this rpm), inR (point inside the region)}] and the picked row.
  // Rule (Fizz p.10, Mott p.272): the section whose region contains (P_des, faster-shaft rpm); within ≈10 % of a line take the larger.
  const LN10 = x => Math.log10(x);
  function regionTable(rows, x, hpAt, near) {   // rows: [{sec,label,lo,hi}] in x-pixels; returns hp ranges + pick
    let pick = -1, nearLine = false;
    rows.forEach((r, i) => { r.inR = x > r.lo && x <= r.hi; r.hpLo = r.lo === -Infinity ? 0 : hpAt(r.lo); r.hpHi = r.hi === Infinity ? Infinity : hpAt(r.hi); if (r.inR && pick < 0) pick = i; });
    if (pick >= 0 && rows[pick].hi - x < (near || 12) && pick + 1 < rows.length && rows[pick + 1].lo <= rows[pick].hi + 1) { pick = pick + 1; nearLine = true; }
    return { rows, pick, nearLine };
  }
  // Mott Fig 7-13 (crop figures/mott/fig7-13.png): x = 348 + 271 log10(hp); y from the rpm gridlines (F13Y)
  function chart713(P, n) {
    if (!(P > 0) || !(n >= 100)) return undefined;
    const x = 348 + 271 * LN10(P), y = H.interp(LN10(n), F13Y.map(p => LN10(p[0])), F13Y.map(p => p[1]));
    if (y < 55) return { factory: true, rows: [], pick: -1 };
    let b1, b2, b3;
    if (y <= 165) { b1 = 948; b2 = 948; b3 = 948; }
    else if (y <= 268) { b1 = 563 + (578 - y) / 413 * 359; b2 = 1118; b3 = 1118; }
    else { b1 = 563 + (578 - y) / 413 * 359; b2 = 785 + (578 - y) / 310 * 269; b3 = 1190; }
    const r = regionTable([{ sec: '3V', label: '3V (or 3VX)', lo: -Infinity, hi: b1 }, { sec: '5V', label: '5V (or 5VX)', lo: b1, hi: b2 }, { sec: '8V', label: '8V (or 8VX)', lo: b2, hi: b3 }], x, xx => 10 ** ((xx - 348) / 271));
    r.factory = x > b3; return r;
  }
  // Gates Fig B1 (narrow) and B2 (classical), crop figures/course/gates_fig_b1_b2_section_charts.png (lines located by pixel scan)
  function gatesB1(P, n) {
    if (!(P > 0) || !(n > 0)) return undefined;
    const x = 348 + 230.7 * LN10(P), y = 549 - 255 * LN10(n / 100);
    const L = (x0, top) => y >= top ? x0 + 0.86 * (540 - y) : Infinity;
    const l2 = L(465, 158), l1 = y >= 183 ? L(418, 183) : l2, l3 = L(564, 208), l5 = L(750, 263);
    const r = regionTable([{ sec: '3V', label: '3V', lo: -Infinity, hi: l1 }, { sec: '3VX', label: '3VX (molded notch)', lo: -Infinity, hi: l2 }, { sec: '5V', label: '5V / 5VX', lo: l1, hi: l3 }, { sec: '8V', label: '8V / 8VX', lo: l3, hi: l5 }], x, xx => 10 ** ((xx - 348) / 230.7));
    r.beyond = x > l5; return r;
  }
  function gatesB2(P, n) {
    if (!(P > 0) || !(n > 0)) return undefined;
    const x = 329 + 236 * LN10(P), y = 1294 - 261.5 * LN10(n / 100);
    const L = (x0, s, top) => y >= top ? x0 + s * (1290 - y) : Infinity;
    const l1 = L(364, 0.876, 898), l3 = L(491, 0.860, 950), l5 = L(627, 0.852, 997), l6 = L(685, 0.842, 1018);
    return regionTable([{ sec: 'A', label: 'A / AX', lo: -Infinity, hi: l1 }, { sec: 'B', label: 'B / BX', lo: l1, hi: l3 }, { sec: 'C', label: 'C / CX', lo: l3, hi: l5 }, { sec: 'C', label: 'CP (Predator C)', lo: l5, hi: l6 }, { sec: 'D', label: 'D', lo: l5, hi: Infinity }], x, xx => 10 ** ((xx - 329) / 236));
  }
  // Course slide 27 "Recommended Nominal V-Belt Selection" (A–D), crop figures/course/vbelt_selection_chart_abcd.png.
  // The printed axes are not uniformly logarithmic, so both axes are mapped through their gridlines (pixel scan).
  const ABX = [[1, 404.5], [2, 565], [3, 639], [4, 696], [5, 747], [6, 782.5], [7, 812.5], [8, 842], [10, 902], [20, 1027.5], [30, 1101], [40, 1167], [50, 1205], [60, 1254], [100, 1370], [200, 1505], [300, 1589], [400, 1650], [500, 1710], [1300, 1868]];
  const ABY = [[100, 946], [200, 808], [300, 768], [400, 724], [435, 697], [500, 665], [575, 634], [600, 616], [690, 594], [700, 576.5], [800, 547.5], [870, 533], [900, 513], [1000, 492], [1160, 463], [1750, 362], [2000, 323], [3000, 240.5], [3450, 215], [4000, 180], [5000, 131], [6000, 94], [8000, 36]];
  function chartABCD(P, n) {
    if (!(P > 0) || !(n >= 100)) return undefined;
    const x = H.interp(LN10(P), ABX.map(p => LN10(p[0])), ABX.map(p => p[1])), y = H.interp(LN10(n), ABY.map(p => LN10(p[0])), ABY.map(p => p[1]));
    const B = (x0, s, top, plat) => y >= top ? x0 + s * (940 - y) : plat;
    const ab = B(714.5, 0.661, 253.5, 1369.5), bc = B(999, 0.687, 282.5, y >= 131.5 ? 1537 : ab), cd = B(1244, 0.763, 391, y >= 215 ? 1717 : bc), de = y >= 325.5 ? 1868 : cd;
    const hpAt = xx => 10 ** H.interp(xx, ABX.map(p => p[1]), ABX.map(p => LN10(p[0])));
    return regionTable([{ sec: 'A', label: 'A', lo: -Infinity, hi: ab }, { sec: 'B', label: 'B', lo: ab, hi: bc }, { sec: 'C', label: 'C', lo: bc, hi: cd }, { sec: 'D', label: 'D', lo: cd, hi: de }], x, hpAt);
  }
  const hpR = (lo, hi) => (lo === Infinity || !(lo === lo)) ? 'none at this speed' : (hi !== Infinity && hi <= lo * 1.001 && lo > 0) ? 'none at this speed' : (lo > 0 ? H.fmt(lo, 3) : '0') + '–' + (hi === Infinity ? '…' : H.fmt(hi, 3)) + ' hp';

  // ---------------- helpers ----------------
  const M = (...modes) => v => modes.includes(v.mode);
  const kL = v => v.mode === 'shig' ? Math.PI / 2 : 1.57;          // Shigley 17-16a uses π/2; Mott 7-12 / the course use 1.57 (and 6.28)
  const desig = (sec, L) => (sec && L > 0) ? (isNarrow(sec) ? sec + Math.round(L * 10) : sec + H.fmt(L)) : '';
  const f = (x, d) => H.fmt(x, d);
  const inUse = (cond) => cond ? ' <span style="color:#2563eb;font-weight:400">← in use</span>' : '';

  // ---------------- sizing steps: candidate tables ----------------
  // 1) Section. Mott/rate/geom: Fig 7-13; Gates: Fig B1 (narrow) + Fig B2 (classical); Shigley: Table 17-9 + course chart (slide 27).
  function secSel(v) {
    if (!H.has(v, 'Pdes', 'n1')) return undefined;
    const P = v.Pdes, n = v.n1, m = v.mode;
    if (m === 'shig') {
      const ch = chartABCD(P, n);
      const inT = s => P >= SEC[s].hp[0] && P <= SEC[s].hp[1];
      let pick = ch && ch.pick >= 0 && inT(ch.rows[ch.pick].sec) ? ch.rows[ch.pick].sec : undefined;
      if (!pick) pick = ['A', 'B', 'C', 'D', 'E'].find(inT);
      return { kind: 'shig', ch, inT, pick };
    }
    if (m === 'gates') {
      const b1 = gatesB1(P, n), b2 = gatesB2(P, n);
      return { kind: 'gates', b1, b2, pick: b1 && b1.pick >= 0 ? b1.rows[b1.pick].sec : undefined, pick2: b2 && b2.pick >= 0 ? b2.rows[b2.pick].sec : undefined };
    }
    const ch = chart713(P, n);
    return { kind: 'mott', ch, pick: ch && ch.pick >= 0 ? ch.rows[ch.pick].sec : undefined };
  }
  function secHintText(v) {
    const s = secSel(v); if (!s) return undefined;
    if (s.kind === 'shig') return (s.pick || '—') + ' (course chart slide 27 + Table 17-9)';
    if (s.kind === 'gates') return 'narrow ' + (s.pick || 'refer to Gates') + ' (Fig B1) · classical ' + (s.b2 && s.b2.pick >= 0 ? s.b2.rows[s.b2.pick].label : '—') + ' (Fig B2)';
    return (s.ch.factory && !s.pick ? 'refer to factory' : (s.pick || '—') + (s.ch.nearLine ? ' (on a line → larger section)' : '')) + ' (Fig 7-13)';
  }
  function secTableHtml(v) {
    const s = secSel(v); if (!s) return '';
    const cap = 'Select the belt section at P_{des} = ' + f(v.Pdes) + ' hp, n_{1} = ' + f(v.n1) + ' rpm';
    const yes = b => b ? 'yes' : 'no';
    if (s.kind === 'shig') {
      const rows = ['A', 'B', 'C', 'D', 'E'].map(sec => {
        const d = SEC[sec], cr = s.ch && s.ch.rows.find(r => r.sec === sec);
        return { cells: [sec + inUse(v.sec === sec), (d.hp[1] > 1e8 ? f(d.hp[0]) + ' and up' : f(d.hp[0]) + '–' + f(d.hp[1])) + ' hp', yes(s.inT(sec)), f(d.dmin) + ' in', cr ? hpR(cr.hpLo, cr.hpHi) + (cr.inR ? ' ✔' : '') : 'not on chart'],
          ok: s.inT(sec), pick: sec === s.pick, set: { sec } };
      });
      return H.table(['Section', 'hp range, one or more belts (Table 17-9)', 'P_des in range?', 'Min sheave (Table 17-9)', 'Course chart region at n_1 (slide 27)'], rows,
        { caption: cap, note: 'Rule: Table 17-9 ranges overlap, so the course chart (slide 27) decides. A section named in the problem (Tutorial 2 Q1: D360) is used as given.' });
    }
    if (s.kind === 'gates') {
      const rows = [];
      const add = (chart, r, i, pick) => rows.push({ cells: [chart, r.label + inUse(v.sec === r.sec || (r.sec === '5V' && v.sec === '5VX')), hpR(r.hpLo, r.hpHi), yes(r.inR), H.has(v, 'P') && nema(r.sec, v.P, v.n1) !== undefined ? f(nema(r.sec, v.P, v.n1)) + ' in' : '—'], ok: r.inR, pick: i === pick, set: { sec: r.sec } });
      if (s.b1) s.b1.rows.forEach((r, i) => add('Fig B1 narrow', r, i, s.b1.pick));
      if (s.b2) s.b2.rows.forEach((r, i) => add('Fig B2 classical', r, i, s.b2.pick));
      return H.table(['Chart', 'Section', 'Region at n_1', 'P_des inside?', 'NEMA min. driver sheave (B2/B3, motor hp)'], rows,
        { caption: cap + ' — Gates Fig B1 / B2', note: 'Rule (Gates p.B3): the region containing the point, one ★ per chart; near a line take the larger section. Super HC narrow belts → B1 (HW1 P3b: 3V); Hi-Power classical → B2 (Tutorial 2 Q2: CP, set as C).' });
    }
    if (!s.ch) return '';
    const rows = s.ch.rows.map((r, i) => {
      const dsm = SHEAVES[r.sec] ? SHEAVES[r.sec][0] : undefined, d4 = 48000 / (Math.PI * v.n1);
      return { cells: [r.label + inUse(base(v.sec) === r.sec), hpR(r.hpLo, r.hpHi), yes(r.inR), dsm ? f(dsm) + ' in' : '—', f(d4, 3) + ' in' + (dsm && d4 < dsm ? ' (< smallest)' : '')], ok: r.inR, pick: i === s.ch.pick, set: { sec: r.sec } };
    });
    return H.table(['Section', 'Fig 7-13 region at n_1', 'P_des inside?', 'Smallest standard sheave (Fig 7-14/15/16)', 'D_1 for 4000 ft/min'], rows,
      { caption: cap + ' — Mott Fig 7-13', note: (s.ch.nearLine ? '<b>Within ≈10 % of a line → larger section.</b> ' : '') + (s.ch.factory ? 'Outside the chart — refer to the manufacturer. ' : '') + 'Rule: the region containing (P_des, faster-shaft rpm); on a line take the larger (Fizz p.10). Midterm 2025 52 hp @ 1150 → 5V; 2023 75 hp @ 1160 → 5V.' });
  }

  // 2) Sheave pair. Mott: standard pitch diameters of Fig 7-14/15/16; Gates: stock sheaves (GSHEAVE) ≥ NEMA minimum.
  function d2For(v, D1) {
    if (!(D1 > 0) || !H.has(v, 'VRn')) return undefined;
    const ideal = D1 * v.VRn;
    if (v.mode === 'gates') {
      const g = GSHEAVE[base(v.sec)];
      if (!g || (isClassic(v.sec) && ideal > g[g.length - 1] * 1.03)) return Math.round(ideal * 10) / 10;
      return nearest(ideal, g);
    }
    const s = SHEAVES[base(v.sec)];
    return s ? nearest(ideal, s) : Math.round(ideal * 100) / 100;
  }
  function sheaveSel(v) {
    if (!v.sec || !H.has(v, 'n1', 'n2', 'VRn') || (v.mode !== 'mott' && v.mode !== 'gates')) return undefined;
    const g = v.mode === 'gates', list = g ? GSHEAVE[base(v.sec)] : SHEAVES[base(v.sec)];
    if (!list) return undefined;
    const tol = H.has(v, 'tolN2') ? v.tolN2 : 2, Vt = H.has(v, 'Vt') ? v.Vt : 4000, vmax = g ? 6500 : 5000;
    const dmin = g ? (H.has(v, 'dminN') ? v.dminN : 0) : (H.has(v, 'dminS') ? v.dminS : 0);
    const bump = g && v.n1 < 0.95 * 575;   // below the lowest NEMA column: the minimum must be exceeded (Tutorial 2 Q2: "should exceed 12 in" → 13 in)
    const rows = list.map(D1 => {
      const D2 = d2For(v, D1), VRa = D2 / D1, n2 = v.n1 / VRa, err = (n2 / v.n2 - 1) * 100, vb = Math.PI * D1 * v.n1 / 12;
      const okMin = bump ? D1 > dmin + 1e-9 : D1 >= dmin - 1e-9;
      const okV = vb >= 1000 && vb <= vmax;
      const inList = !(g && isClassic(v.sec) && D1 * v.VRn > list[list.length - 1] * 1.03);
      const Pr = g ? undefined : chartP(v.sec, D1, v.n1);
      return { D1, D2, VRa, n2, err, vb, okMin, okV, inList, ok: okMin && okV && Math.abs(err) <= tol + 1e-9, Pr: Pr === undefined ? undefined : Pr + (dPR(v.sec, v.n1, VRa) || 0) };
    });
    const oks = rows.filter(r => r.ok);
    let pick = g ? oks[0] : oks.reduce((b, r) => (!b || Math.abs(r.vb - Vt) < Math.abs(b.vb - Vt) - 1e-9) ? r : b, undefined);
    if (!pick) pick = rows.filter(r => r.okMin && r.okV).reduce((b, r) => (!b || Math.abs(r.err) < Math.abs(b.err)) ? r : b, undefined);
    return { rows, pick, g, tol, Vt, vmax, dmin, bump };
  }
  function sheaveTableHtml(v) {
    const s = sheaveSel(v); if (!s) return '';
    const near4 = s.g ? undefined : s.rows.reduce((b, r) => (!b || Math.abs(r.vb - s.Vt) < Math.abs(b.vb - s.Vt)) ? r : b, undefined);
    const shown = s.rows.filter(r => r === s.pick || r === near4 || (r.okV && (s.g ? r.D1 >= 0.85 * s.dmin : true) && Math.abs(r.err) <= Math.max(3 * s.tol, 4)));
    const rows = shown.slice(0, 14).map(r => ({
      cells: [f(r.D1) + ' in' + (r.okMin ? '' : (s.bump && r.D1 >= s.dmin - 1e-9) ? ' (= min; must exceed)' : ' (< min)'), f(r.D2) + ' in' + (r.inList ? '' : ' (check table)'), f(r.VRa, 4), f(r.n2) + ' rpm', (r.err >= 0 ? '+' : '') + f(r.err, 2) + ' %', f(r.vb) + (r.okV ? '' : ' ✘'), s.g ? (s.pick && r === s.pick ? 'first stock size ≥ min within ±' + f(s.tol) + ' %' : '') : (r.Pr !== undefined && isFinite(r.Pr) ? f(r.Pr, 3) + ' hp' : '— (off chart)')]
        .map((c, i) => i === 0 ? c + inUse(H.has(v, 'D1', 'D2') && Math.abs(v.D1 - r.D1) < 1e-6 && Math.abs(v.D2 - r.D2) < 1e-6) : c),
      ok: r.ok, pick: r === s.pick, set: { D1: r.D1, D2: r.D2 } }));
    const rule = s.g
      ? 'Rule (Gates drive tables): the smallest stock driver ≥ the NEMA minimum (' + f(s.dmin) + ' in' + (s.bump ? '; below the 575-rpm column it must be <b>exceeded</b> — Tutorial 2 Q2: 13 in' : '') + ') whose closest driven sheave gives the output speed within ±' + f(s.tol) + ' %. HW1 P3b → 3.35/8.00 in.'
      : 'Rule: closest standard D_2 to D_1·VR, output speed within ±' + f(s.tol) + ' %, belt speed 1000–5000 ft/min, nearest ' + f(s.Vt) + ' ft/min wins. Course picks: 2025 10.8/21.1, 2023 13.9/27.7 (either accepted), HW1 10.2/27.7 and 7.95/18.95. Last column = P_Tab + \\(\\Delta P_R\\) per belt.';
    return H.table(['D_1 (driver)', 'D_2 (closest to D_1·VR)', 'VR', 'n_2', 'speed error', 'v_b ft/min', s.g ? 'Note' : 'Rated hp/belt'], rows,
      { caption: 'Select the sheaves — ' + (s.g ? 'Gates stock ' + base(v.sec) + ' sheaves' : 'standard ' + base(v.sec) + ' sheaves (vertical lines of Fig 7-' + ({ '3V': 14, '5V': 15, '8V': 16 }[base(v.sec)]) + ')'), note: rule });
  }

  // 3) Standard belt length: the lengths around the required length, with the CD each gives.
  function lenSel(v) {
    const t = LENG[base(v.sec)]; if (!t || !H.has(v, 'Lreq', 'D1', 'D2')) return undefined;
    const Lc = H.has(v, 'Lc') ? v.Lc : 0, x = v.Lreq - Lc;
    let i = t.findIndex(a => a >= x); if (i < 0) i = t.length;
    const cand = t.slice(Math.max(0, i - 2), Math.min(t.length, i + 2));
    const lo = Math.min(v.D1, v.D2), hi = Math.max(v.D1, v.D2), cmin = H.has(v, 'CDmin') ? v.CDmin : 0;
    const rows = cand.map(L => {
      const Lp = L + Lc, B = 4 * Lp - 4 * kL(v) * (lo + hi), r = B * B - 32 * (hi - lo) ** 2;
      const CD = r >= 0 ? (B + Math.sqrt(r)) / 16 : undefined;
      const th1 = CD ? 180 - 2 * H.deg(Math.asin((hi - lo) / (2 * CD))) : undefined;
      const inR = CD !== undefined && CD > hi && CD < 3 * (lo + hi) && CD >= cmin - 1e-9;
      const corr = K2T[base(v.sec)] ? k2(v.sec, L) : clM(v.sec, L);
      return { L, Lp, CD, th1, inR, ok: inR && th1 >= 120, dL: L - x, corr };
    });
    const pool = rows.filter(r => r.ok).length ? rows.filter(r => r.ok) : rows.filter(r => r.CD);
    const pick = pool.reduce((b, r) => (!b || Math.abs(r.dL) < Math.abs(b.dL) - 1e-9 || (Math.abs(Math.abs(r.dL) - Math.abs(b.dL)) < 1e-9 && r.L > b.L)) ? r : b, undefined);
    return { rows, pick, x, Lc, cmin };
  }
  function lenTableHtml(v) {
    const s = lenSel(v); if (!s) return '';
    const shig = !!K2T[base(v.sec)];
    const rows = s.rows.map(r => ({
      cells: [desig(v.sec, r.L) + inUse(H.has(v, 'Lstd') && Math.abs(v.Lstd - r.L) < 1e-6), f(r.L) + ' in' + (s.Lc ? ' (L_p ' + f(r.Lp) + ')' : ''), (r.dL >= 0 ? '+' : '') + f(r.dL, 3) + ' in', r.CD ? f(r.CD) + ' in' : '—', r.inR ? 'yes' : 'no', r.th1 ? f(r.th1) + '°' : '—', r.corr !== undefined ? f(r.corr, 3) : '—'],
      ok: r.ok, pick: r === s.pick, set: { Lstd: r.L } }));
    let note = 'Rule: the standard length closest to ' + f(s.x) + ' in (tie → longer); either neighbour is accepted if \\(D_2 \\lt CD \\lt 3(D_1 + D_2)\\)' + (s.cmin ? ', CD ≥ ' + f(s.cmin) + ' in (given minimum)' : '') + ' and \\(\\theta_1 \\ge 120^\\circ\\). ' + (v.mode === 'gates' ? 'Gates numbers: 3V400 = 40.0 in, CP330 = 330 in. ' : '');
    if (!s.rows.some(r => r.ok)) note += '<b>No length keeps the CD in range</b> — fine when the problem fixes the CD. ';
    if (s.pick && H.has(v, 'Lstd') && Math.abs(v.Lstd - s.pick.L) > 1e-6) note += '<b>You use ' + f(v.Lstd) + ' in; the rule picks ' + f(s.pick.L) + ' in.</b> ' + (v.mode === 'mott' && Math.abs(v.Lstd - 125) < 1e-6 && Math.abs(v.Lreq - 114.9) < 0.6 ? 'Midterm 2025 took 125 in after a 122.9-in slip (correct L = 114.9 in). ' : '');
    return H.table(['Belt', shig ? 'Inside length (Table 17-10)' : 'Length (' + (isNarrow(v.sec) ? 'Table 7-2' : 'Table 17-10') + ')', 'L − L_req', 'Actual CD', 'CD in range?', 'θ_1', shig ? 'K_2 (Table 17-14)' : 'C_L (Fig 7-19)'], rows,
      { caption: 'Select the standard belt length (required ' + f(s.x) + ' in' + (s.Lc ? ' inside length' : '') + ')', note });
  }
  function lenPick(v) { const s = lenSel(v); return s && s.pick ? s.pick.L : undefined; }

  // Trial centre distance: the course "often takes c–c ≈ 32–40 in and goes from there" — midterm 2023 (minimum 30 in → chose 32),
  // midterm 2025 (given 32), HW1 P2 36, HW1 P3a 24/30. Default 32 in (or the given minimum), clamped into D_2 < CD < 3(D_1 + D_2).
  function cdTrial(v) {
    if (!H.has(v, 'D1', 'D2')) return undefined;
    const lo = Math.max(v.D1, v.D2), hi = 3 * (v.D1 + v.D2);
    let c = Math.max(32, H.has(v, 'CDmin') ? v.CDmin : 0);
    if (c <= lo) c = Math.ceil(lo + 1);
    if (c >= hi) c = Math.floor(hi - 1);
    return c;
  }

  // 4) Number of belts
  function nbTableHtml(v) {
    if (!H.has(v, 'Pdes', 'Pbelt') || !(v.Pbelt > 0)) return '';
    const need = v.Pdes / v.Pbelt, top = Math.min(12, Math.max(3, Math.ceil(need - 1e-9) + 1));
    const pickN = Math.max(1, Math.ceil(need - 1e-9));
    const rows = [];
    for (let N = 1; N <= top; N++) rows.push({ cells: [N + inUse(v.Nb === N), f(N * v.Pbelt) + ' hp', f(N * v.Pbelt / v.Pdes, 3), N * v.Pbelt >= v.Pdes - 1e-9 ? 'OK' : 'overloaded'], ok: N * v.Pbelt >= v.Pdes - 1e-9, pick: N === pickN, set: { Nb: N } });
    return H.table(['N_b', 'N_b·P_belt', 'n_fs = N_b·P_belt/P_des', 'vs P_des = ' + f(v.Pdes) + ' hp'], rows,
      { caption: 'Select the number of belts (' + f(v.Pbelt) + ' hp per belt)', note: 'Rule: the smallest N_b with n_fs ≥ 1 — always round <b>up</b> (midterm 2.23 → 3; Tutorial 2 Q1 4.51 → 5).' });
  }

  // 5) Standard sizes for the selected section (reference; the size in use is highlighted)
  const FR = (a, b) => '\\(\\tfrac{' + a + '}{' + b + '}\\)';
  const DIMS = {   // [top width a, thickness b (Shigley Table 17-9), thickness (Mott Fig 7-9/7-10), min sheave in, hp range]
    '3V': [FR(3, 8), '—', FR(5, 16), 2.65, '—'], '5V': [FR(5, 8), '—', FR(17, 32), 7.1, '—'], '8V': ['1', '—', FR(29, 32), 12.5, '—'],
    A: [FR(1, 2), FR(11, 32), FR(5, 16), 3.0, FR(1, 4) + '–10'], B: [FR(21, 32), FR(7, 16), FR(13, 32), 5.4, '1–25'], C: [FR(7, 8), FR(17, 32), FR(17, 32), 9.0, '15–100'],
    D: ['1' + FR(1, 4), FR(3, 4), FR(3, 4), 13.0, '50–250'], E: ['1' + FR(1, 2), '1', FR(29, 32), 21.6, '100 and up'],
  };
  const hl = (x, on) => on ? '<b style="background:#fde68a;padding:0 4px;border-radius:3px">' + x + '</b>' : x;
  function gridHtml(cap, list, isOn, note) {
    let rows = '';
    for (let i = 0; i < list.length; i += 12) rows += '<tr>' + list.slice(i, i + 12).map(x => '<td>' + hl(f(x), isOn(x)) + '</td>').join('') + '</tr>';
    return '<div class="seltab-cap">' + cap + '</div><div class="seltab-wrap"><table class="seltab"><tbody>' + rows + '</tbody></table></div>' + (note ? '<div class="seltab-note">' + note + '</div>' : '');
  }
  const near = (a, b) => a !== undefined && Math.abs(a - b) < 1e-6;
  function stdHtml(v) {
    const sb = base(v.sec || '');
    let out = H.table(['Section', 'Top width a (in)', 'Thickness b (in), Table 17-9', 'Thickness (in), Mott Fig 7-9/7-10', 'Min. sheave (in)', 'hp range'], Object.keys(DIMS).map(s => ({
      cells: [s + inUse(s === sb), DIMS[s][0], DIMS[s][1], DIMS[s][2], f(DIMS[s][3]), DIMS[s][4]], pick: s === sb, set: { sec: s } })),
      { caption: 'Section dimensions', note: 'Groove angle 40° (\\(2\\beta \\approx 36^\\circ\\) on the sheave). Min. sheave: Table 17-9 (A–E), Table 17-17 note (3V/5V/8V).' });
    const L = LENG[sb];
    if (L) out += gridHtml('Standard lengths, ' + sb + ' — ' + (isNarrow(sb) ? 'Mott Table 7-2 (pitch length, in)' : 'Shigley Table 17-10 (inside length, in); pitch length L_p = L + ' + f(SEC[sb].conv) + ' in (Table 17-11)'), L, x => near(v.Lstd, x));
    const SH = isNarrow(sb) ? SHEAVES[sb] : GSHEAVE[sb];
    if (SH) out += gridHtml('Standard sheave diameters, ' + sb + ' — ' + (isNarrow(sb) ? 'Mott Figs 7-14/15/16 (pitch diameter, in)' : 'Gates Tables B21–B24 stock (datum diameter, in)'), SH, x => near(v.D1, x) || near(v.D2, x), (v.mode === 'gates' && isNarrow(sb)) ? 'Gates outside diameters = pitch diameter + 2a (0.10 in 5V, 0.20 in 8V).' : '');
    return out;
  }

  return window.makeTopic_v_belts = function (book) {
    const isM = book === 'mott';
    const T = {
      id: 'v_belts', book,
      title: 'V-Belts — Design, Analysis & Installation',
      subtitle: 'Mott Ch 7-4 · Shigley 17-3 · Gates catalogue (course slides 22–42) — pick the question type first',
      sibling: isM ? 'v_belts_shigley.html' : 'v_belts_mott.html',
      intro: 'Three course methods: <b>Mott</b> designs a drive, <b>Shigley</b> analyses tensions and life, the <b>Gates catalogue</b> gives belts and installation tension. Pick the question type in step 1 — only its steps are shown. Yellow "auto" values are digitised chart reads; type your own reading over them.',
      figures: [],
      assumptions: [],
      sections: [],
    };

    T.figures = [
      { id: 'table7-1', book: 'mott', ref: 'Table 7-1', title: 'V-belt service factors (driven machine × driver × hours/day)', src: 'figures/mott/table7-1.png', page: 273, note: 'Course primary table. ×1.2 for a speed increaser (footnote 1).' },
      { id: 'table17-15', book: 'shigley', ref: 'Table 17-15', title: 'Suggested service factors K_s', src: 'figures/shigley/table17-15.png', page: 925, note: 'Ranges by shock and driver torque (Tutorial 2 Q1: 1.4).' },
      { id: 'ks-hours', book: 'course', ref: 'Course K_s table', title: 'Slide 35: K_s by driven class × hours/day × driver torque', src: 'figures/course/belt_service_factor_hours.png' },
      { id: 'fig7-13', book: 'mott', ref: 'Figure 7-13', title: 'Narrow-section belt selection chart (design power vs faster-shaft rpm)', src: 'figures/mott/fig7-13.png', page: 273, note: 'On a boundary take the larger section (Fizz p.10).' },
      { id: 'fig7-9', book: 'mott', ref: 'Figures 7-9 / 7-10', title: 'V-belt cross-sections: classical A–E and narrow 3V/5V/8V (top width × depth)', src: 'figures/mott/fig7-9_7-10.png', page: 271 },
      { id: 'gates-b1', book: 'course', ref: 'Gates Fig B1', title: 'Slide 32: Gates section chart (3V/5V/8V, 3VX/5VX)', src: 'figures/course/gates_section_chart_b1.png', note: 'Enter with the design hp and the faster-shaft rpm.' },
      { id: 'abcd', book: 'course', ref: 'A–D chart', title: 'Slide 27: classical A/B/C/D section chart', src: 'figures/course/vbelt_selection_chart_abcd.png' },
      { id: 'table17-9', book: 'shigley', ref: 'Table 17-9', title: 'Standard V-belt sections A–E: width, thickness, minimum sheave, hp range', src: 'figures/shigley/table17-9.png', page: 922 },
      { id: 'gates-b2b3', book: 'course', ref: 'Gates B2/B3', title: 'Slide 33: NEMA minimum driver sheaves (B2 narrow, B3 classical)', src: 'figures/course/gates_nema_min_sheave_b2_b3.png', note: 'Motor hp row × motor-rpm column (Tutorial 2 Q2: 60 hp @ 575 → 12 in).' },
      { id: 'fig7-14', book: 'mott', ref: 'Figure 7-14', title: 'Power per belt, 3V (solid VR = 1, dashed VR ≥ 3.38)', src: 'figures/mott/fig7-14.png', page: 274, note: 'Vertical lines = standard sheave pitch diameters.' },
      { id: 'fig7-15', book: 'mott', ref: 'Figure 7-15', title: 'Power per belt, 5V', src: 'figures/mott/fig7-15.png', page: 275, note: 'The printed y-label "10" should read 16.' },
      { id: 'fig7-16', book: 'mott', ref: 'Figure 7-16', title: 'Power per belt, 8V (690 / 870 / 1160 rpm)', src: 'figures/mott/fig7-16.png', page: 275, note: 'The printed labels 96/107 should read 90/100.' },
      { id: 'fig7-17', book: 'mott', ref: 'Figure 7-17', title: 'Power added for speed ratio, 5V', src: 'figures/mott/fig7-17.png', page: 276, note: 'Nothing more is added above VR = 3.38; Shigley has no \\(\\Delta P_R\\) (slide 31).' },
      { id: 'fig7-18', book: 'mott', ref: 'Figure 7-18', title: 'Wrap correction factor \\(C_\\theta\\)', src: 'figures/mott/fig7-18.png', page: 276 },
      { id: 'fig7-19', book: 'mott', ref: 'Figure 7-19', title: 'Length correction factor C_L', src: 'figures/mott/fig7-19.png', page: 276 },
      { id: 'table7-2', book: 'mott', ref: 'Table 7-2', title: 'Standard lengths, 3V/5V/8V (in)', src: 'figures/mott/table7-2.png', page: 277 },
      { id: 'fig7-4', book: 'mott', ref: 'Figure 7-4', title: 'Belt drive geometry: wrap angles, span, centre distance', src: 'figures/mott/fig7-4.png', page: 265 },
      { id: 'table17-10', book: 'shigley', ref: 'Table 17-10', title: 'Inside circumferences of standard A–E belts', src: 'figures/shigley/table17-10.png', page: 922 },
      { id: 'table17-11', book: 'shigley', ref: 'Table 17-11', title: 'Length conversion: pitch length = inside length + L_c', src: 'figures/shigley/table17-11.png', page: 922 },
      { id: 'fig17-1', book: 'shigley', ref: 'Figure 17-1', title: 'Open-belt geometry: wrap angles and length', src: 'figures/shigley/fig17-1.png', page: 904 },
      { id: 'table17-12', book: 'shigley', ref: 'Table 17-12', title: 'Rated power per belt H_tab (sheave pitch diameter × belt speed)', src: 'figures/shigley/table17-12.png', page: 924, note: 'Interpolate on belt speed; the last row applies to larger sheaves.' },
      { id: 'table17-13', book: 'shigley', ref: 'Table 17-13', title: 'Wrap correction factor K_1', src: 'figures/shigley/table17-13.png', page: 925, note: 'VV fit: \\(K_1 = 0.143543 + 0.007468\\phi - 0.000015052\\phi^2\\), \\(\\phi\\) in degrees.' },
      { id: 'table17-14', book: 'shigley', ref: 'Table 17-14', title: 'Length correction factor K_2', src: 'figures/shigley/table17-14.png', page: 925, note: 'Enter with the inside length: B112 → 1.05, D360 → 1.10.' },
      { id: 'gates-b4', book: 'course', ref: 'Gates B4', title: 'Slide 36: Gates belt lengths (3VX800 = 80.0 in, 3V400 = 40.0 in)', src: 'figures/course/gates_belt_sizes_table_b4.png' },
      { id: 'gates-b6', book: 'course', ref: 'Gates B6', title: 'Slide 37: Gates 3V/3VX drive table — CD and hp correction (colour key)', src: 'figures/course/gates_3v_centre_distance_table_b6.png', note: 'The hp correction combines wrap and length (\\(C_\\theta C_L\\) or \\(K_1K_2\\)).' },
      { id: 'gates-ex', book: 'course', ref: 'Lecture s38', title: 'Slide 38: worked 3VX800 example (6/19 in, 1750 rpm, 2 hp)', src: 'figures/course/gates_3vx_example_slide38.png' },
      { id: 'table17-16', book: 'shigley', ref: 'Table 17-16', title: 'V-belt parameters K_b (bending) and K_c (centrifugal)', src: 'figures/shigley/table17-16.png', page: 926 },
      { id: 'fig17-14', book: 'shigley', ref: 'Figure 17-14', title: 'V-belt tensions around the drive (F_1, F_2, F_i, F_c, F_b, T_1, T_2)', src: 'figures/shigley/fig17-14.png', page: 926, note: 'Bending tension F_b — ignored for flat belts — governs V-belt life.' },
      { id: 'table17-17', book: 'shigley', ref: 'Table 17-17', title: 'Durability parameters K and b (belt life)', src: 'figures/shigley/table17-17.png', page: 927, note: 'Valid for 10^8–10^9 force peaks; above 10^9 report \\(N_P \\gt 10^9\\).' },
      { id: 'gates-d19', book: 'course', ref: 'Gates D19–D35', title: 'Slide 39: Formula D19 (T_st), Tables D26 (\\(K_\\phi\\)), D27 (M, Y), Formula D35 (span)', src: 'figures/course/gates_tension_formula_d19.png', note: 'Use the MOTOR hp in D19; the square-root span formula is marked "incorrect" — use D35.' },
      { id: 'gates-d20', book: 'course', ref: 'Gates D20–D23', title: 'Slide 40: deflection force for 1/64 in per inch of span', src: 'figures/course/gates_deflection_formula_d20_d23.png' },
      { id: 'gates-tb1', book: 'course', ref: 'Gates Table B1', title: 'Gates service factors (driven machine × driver torque × hours)', src: 'figures/course/gates_table_b1_service_factors.png', note: 'Gates manual p.14. Deduct 0.2 for intermittent use (min 1.0).' },
      { id: 'gates-fb1b2', book: 'course', ref: 'Gates Fig B1 / B2', title: 'Gates section charts: B1 narrow (3V…8VX), B2 classical (A…D, CP)', src: 'figures/course/gates_fig_b1_b2_section_charts.png', note: 'Gates manual p.15.' },
      { id: 'gates-b2b3cat', book: 'course', ref: 'Gates Tables B2 / B3', title: 'NEMA minimum sheave diameters for electric motors (full table)', src: 'figures/course/gates_table_b2_b3_nema_min_sheave.png', note: 'Gates manual p.16. B2 outside dia (narrow), B3 datum dia (classical).' },
      { id: 'gates-b4cat', book: 'course', ref: 'Gates Table B4', title: 'Super HC belt numbers → outside length (narrow number = length × 10)', src: 'figures/course/gates_table_b4_super_hc_belt_lengths.png', note: 'Gates manual p.19.' },
      { id: 'gates-b17', book: 'course', ref: 'Gates Table B17', title: 'A and B belt sizes → outside circumference', src: 'figures/course/gates_table_b17_a_b_belt_lengths.png', note: 'Gates manual p.76.' },
      { id: 'gates-b18', book: 'course', ref: 'Gates Table B18', title: 'C, D and E belt sizes → outside circumference', src: 'figures/course/gates_table_b18_c_d_e_belt_lengths.png', note: 'Gates manual p.77.' },
      { id: 'gates-b19', book: 'course', ref: 'Gates Table B19', title: 'AX/BX/CX belt sizes → outside circumference', src: 'figures/course/gates_table_b19_ax_bx_cx_belt_lengths.png', note: 'Gates manual p.78.' },
      { id: 'gates-b20', book: 'course', ref: 'Gates Table B20', title: 'AP/BP/CP belt sizes → outside circumference', src: 'figures/course/gates_table_b20_ap_bp_cp_belt_lengths.png', note: 'Gates manual p.79.' },
      { id: 'gates-b6p1', book: 'course', ref: 'Gates Table B6 (p.B16)', title: '3V/3VX drive table, VR 1.92–3.46: CD and hp correction by sheave pair × belt', src: 'figures/course/gates_table_b6_3v_drives_p_b16.png', note: 'Gates manual p.28 (slide 37). Lecture: 6.00/19.00 in with 3VX800.' },
      { id: 'gates-b6p2', book: 'course', ref: 'Gates Table B6 (p.B17)', title: '3V/3VX drive table continued (belts 560–1400)', src: 'figures/course/gates_table_b6_3v_drives_p_b17.png', note: 'Gates manual p.29.' },
      { id: 'gates-b23', book: 'course', ref: 'Gates Table B23 (p.B191)', title: 'C/CX/CP drive table, VR 1.00–1.30: CD and hp correction', src: 'figures/course/gates_table_b23_c_cp_drives_p_b191.png', note: 'Gates manual p.203. Tutorial 2 Q2: 13/13 in, CP330 at C = 145 in.' },
      { id: 'gates-b9', book: 'course', ref: 'Gates Table B9', title: 'Gates rated hp per belt, 3V (+ hp for speed ratio)', src: 'figures/course/gates_table_b9_3v_hp_rating.png', note: 'Gates manual p.68.' },
      { id: 'gates-b10', book: 'course', ref: 'Gates Table B10', title: 'Gates rated hp per belt, 3VX (+ hp for speed ratio)', src: 'figures/course/gates_table_b10_3vx_hp_rating.png', note: 'Gates manual p.69. Lecture: 6.0 in @ 1750 rpm → 7.68 hp, VR 3.17 → +0.25 hp.' },
      { id: 'gates-b11', book: 'course', ref: 'Gates Table B11', title: 'Gates rated hp per belt, 5V', src: 'figures/course/gates_table_b11_5v_hp_rating.png', note: 'Gates manual p.70.' },
      { id: 'gates-b12', book: 'course', ref: 'Gates Table B12', title: 'Gates rated hp per belt, 5VX', src: 'figures/course/gates_table_b12_5vx_hp_rating.png', note: 'Gates manual p.71.' },
      { id: 'gates-b13', book: 'course', ref: 'Gates Table B13', title: 'Gates rated hp per belt, 5VP', src: 'figures/course/gates_table_b13_5vp_hp_rating.png', note: 'Gates manual p.72.' },
      { id: 'gates-b14', book: 'course', ref: 'Gates Table B14', title: 'Gates rated hp per belt, 8V', src: 'figures/course/gates_table_b14_8v_hp_rating.png', note: 'Gates manual p.73.' },
      { id: 'gates-b15', book: 'course', ref: 'Gates Table B15', title: 'Gates rated hp per belt, 8VX', src: 'figures/course/gates_table_b15_8vx_hp_rating.png', note: 'Gates manual p.74.' },
      { id: 'gates-b16', book: 'course', ref: 'Gates Table B16', title: 'Gates rated hp per belt, 8VP', src: 'figures/course/gates_table_b16_8vp_hp_rating.png', note: 'Gates manual p.75.' },
      { id: 'gates-b25', book: 'course', ref: 'Gates Table B25', title: 'Gates rated hp per belt, A', src: 'figures/course/gates_table_b25_a_hp_rating.png', note: 'Gates manual p.234.' },
      { id: 'gates-b26', book: 'course', ref: 'Gates Table B26', title: 'Gates rated hp per belt, AX', src: 'figures/course/gates_table_b26_ax_hp_rating.png', note: 'Gates manual p.235.' },
      { id: 'gates-b27', book: 'course', ref: 'Gates Table B27', title: 'Gates rated hp per belt, AP', src: 'figures/course/gates_table_b27_ap_hp_rating.png', note: 'Gates manual p.236.' },
      { id: 'gates-b28', book: 'course', ref: 'Gates Table B28', title: 'Gates rated hp per belt, B', src: 'figures/course/gates_table_b28_b_hp_rating.png', note: 'Gates manual p.237.' },
      { id: 'gates-b29', book: 'course', ref: 'Gates Table B29', title: 'Gates rated hp per belt, BX', src: 'figures/course/gates_table_b29_bx_hp_rating.png', note: 'Gates manual p.238.' },
      { id: 'gates-b30', book: 'course', ref: 'Gates Table B30', title: 'Gates rated hp per belt, BP', src: 'figures/course/gates_table_b30_bp_hp_rating.png', note: 'Gates manual p.239.' },
      { id: 'gates-b31', book: 'course', ref: 'Gates Table B31', title: 'Gates rated hp per belt, C', src: 'figures/course/gates_table_b31_c_hp_rating.png', note: 'Gates manual p.240 (damaged digits) — use Table B33 for C/CP.' },
      { id: 'gates-b32', book: 'course', ref: 'Gates Table B32', title: 'Gates rated hp per belt, CX', src: 'figures/course/gates_table_b32_cx_hp_rating.png', note: 'Gates manual p.241.' },
      { id: 'gates-b33', book: 'course', ref: 'Gates Table B33', title: 'Gates rated hp per belt, C/CP Predator', src: 'figures/course/gates_table_b33_cp_hp_rating.png', note: 'Gates manual p.242 — the course table (Tutorial 2 Q2: 23.3 hp, VR 1 → +0).' },
      { id: 'gates-b34', book: 'course', ref: 'Gates Table B34', title: 'Gates rated hp per belt, D', src: 'figures/course/gates_table_b34_d_hp_rating.png', note: 'Gates manual p.243.' },
      { id: 'gates-d24', book: 'course', ref: 'Gates p.D24', title: 'Gates tensioning page: D19, D26 (\\(K_\\phi\\)), D27 (M, Y for every section), D20–D23', src: 'figures/course/gates_d24_tensioning_d19_d26_d27.png', note: 'Gates manual p.292. New belts: 1.0–1.1 × T_st.' },
      { id: 'gates-d35', book: 'course', ref: 'Gates Formula D35', title: 'Span length \\(t = C[1 - 0.125((D - d)/C)^2]\\)', src: 'figures/course/gates_formula_d35_span_length.png', note: 'Gates manual p.313.' },
    ];

    const modeOpts = [
      { value: 'mott', label: 'Design a new drive — Mott (section → sheaves → length and CD → belts, n_fs)' },
      { value: 'gates', label: 'Design with the Gates catalogue (+ tensions, installation tension and deflection)' },
      { value: 'shig', label: 'Analyse a given drive — Shigley (H_a, belts, F_1, F_2, F_i, n_fs, life)' },
      { value: 'rate', label: 'Capacity of an existing drive — Mott charts (allowable hp, belts, n_fs, largest motor)' },
      { value: 'tension', label: 'Installation tension and deflection only (Gates D19–D23)' },
      { value: 'geom', label: 'Geometry only — belt length ↔ centre distance, wrap angles, speeds' },
    ];
    const MODE_INFO = {
      mott: 'Midterms 2023/2025 P1, HW1 P2/P3a, Mott Ex 7-2.',
      gates: 'Tutorial 2 Q2, HW1 P3b, lecture slides 38–40.',
      shig: 'Tutorial 2 Q1, Shigley Ex 17-4, midterm 2014 Q22/Q26.',
      rate: 'Exam variants: "what power can this drive carry?", "which catalogue belt is enough for N_b belts?" (midterm MC 2014–2023).',
      tension: 'Lecture slides 39–40; part (c) of Tutorial 2 Q2 / HW1 P3b.',
      geom: 'L for a chosen CD, CD for a stocked belt, wrap angles, speeds.',
    };

    // ---------------- result line ----------------
    function answer(v) {
      const m = v.mode; const out = [];
      const dz = desig(v.sec, v.Lstd);
      const sheaves = H.has(v, 'D1', 'D2') ? f(v.D1) + ' in / ' + f(v.D2) + ' in sheaves' : 'sheaves ?';
      const ok = x => x ? '<span class="result-ok">ANSWER</span> — ' : '<span class="result-bad">CHECK</span> — ';
      if (m === 'mott' || m === 'gates' || m === 'shig') {
        if (!H.has(v, 'Nb', 'nfs')) return '';
        out.push(ok(v.nfs >= 1) + 'Use <b>' + v.Nb + ' × ' + (dz || v.sec || '?') + '</b> belts' + (H.has(v, 'Lstd') ? ' (' + f(v.Lstd) + ' in)' : '') + ' on ' + sheaves + (H.has(v, 'CD') ? ' at CD = <b>' + f(v.CD) + ' in</b>' : '') + ' — n_{fs} = <b>' + f(v.nfs, 3) + '</b>.');
        out.push('Design power ' + f(v.Pdes) + ' hp (K_{s} = ' + f(v.Ks) + '); ' + f(v.Pbelt) + ' hp per belt; actual VR ' + f(v.VR) + ', output ' + f(v.n2a) + ' rpm, belt speed ' + f(v.vb) + ' ft/min, \\(\\theta_{1}\\) = ' + f(v.th1) + '°.');
        if ((m === 'shig' || m === 'gates') && H.has(v, 'F1', 'F2', 'Fi')) out.push('Per belt: F_{1} = ' + f(v.F1) + ' lbf, F_{2} = ' + f(v.F2) + ' lbf, F_{i} = ' + f(v.Fi) + ' lbf (F_{c} = ' + f(v.Fc) + ' lbf).');
        if (m === 'shig' && H.has(v, 'NP', 'thr')) out.push('Life: N_{P} ' + (v.NP > 1e9 ? '> 10^9 passes, t > ' : '= ' + f(v.NP, 3) + ' passes, t = ') + f(v.thr) + ' h' + (H.has(v, 'yrs') ? ' (' + f(v.yrs, 3) + ' years at ' + f(v.hpd) + ' h/day)' : '') + '.');
        if (m === 'gates' && H.has(v, 'Tst', 'Fmin', 'Fmax')) out.push('Installation: T_{st} = <b>' + f(v.Tst) + ' lbf</b> per strand; a mid-span force of <b>' + f(v.Fmin, 3) + '–' + f(v.Fmax, 3) + ' lbf</b> should deflect one belt ' + f(v.defl, 3) + ' in (span ' + f(v.tspan) + ' in).');
      } else if (m === 'rate') {
        if (!H.has(v, 'Pcap', 'Nb')) return '';
        out.push('<span class="result-ok">ANSWER</span> — ' + v.Nb + ' × ' + (dz || v.sec || '?') + ' on ' + sheaves + (H.has(v, 'CD') ? ', CD ' + f(v.CD) + ' in' : '') + ' can carry <b>' + f(v.Pcap) + ' hp</b> of design power (' + f(v.Pbelt) + ' hp/belt)' + (H.has(v, 'Pmax') ? ' → largest motor power <b>' + f(v.Pmax) + ' hp</b> at K_{s} = ' + f(v.Ks) + ', n_{d} = ' + f(v.nd) : '') + '.');
        if (H.has(v, 'Pdes', 'nfs')) out.push('For ' + f(v.P) + ' hp: design power ' + f(v.Pdes) + ' hp → needs ' + Math.ceil(v.Nreq - 1e-9) + ' belt(s); with ' + v.Nb + ': n_{fs} = <b>' + f(v.nfs, 3) + '</b> ' + (v.nfs >= 1 ? '(OK)' : '(<span class="result-bad">overloaded</span>)') + '.');
      } else if (m === 'tension') {
        if (!H.has(v, 'Tst', 'Fmin', 'Fmax')) return '';
        out.push('<span class="result-ok">ANSWER</span> — tension each strand to <b>T_{st} = ' + f(v.Tst) + ' lbf</b>: a force of <b>' + f(v.Fmin, 3) + '–' + f(v.Fmax, 3) + ' lbf</b> at mid-span should deflect one belt <b>' + f(v.defl, 3) + ' in</b> (span t = ' + f(v.tspan) + ' in, ' + (v.Ng >= 2 ? 'D20/D21' : 'single belt D22/D23') + ').');
      } else if (m === 'geom') {
        if (!H.has(v, 'D1', 'D2')) return '';
        out.push('<span class="result-ok">ANSWER</span> — VR = ' + f(v.VR) + (H.has(v, 'n2a') ? ', output ' + f(v.n2a) + ' rpm' : '') + (H.has(v, 'vb') ? ', belt speed ' + f(v.vb) + ' ft/min' : '') + (H.has(v, 'Lreq') ? '; for CD = ' + f(v.CDt) + ' in the belt must be L = ' + f(v.Lreq) + ' in' : '') + (H.has(v, 'CD') ? '; with the ' + (dz || f(v.Lstd) + ' in') + ' belt CD = <b>' + f(v.CD) + ' in</b>, \\(\\theta_{1}\\) = ' + f(v.th1) + '°, \\(\\theta_{2}\\) = ' + f(v.th2) + '°' : '') + '.');
      }
      return out.join('<br>');
    }

    T.sections = [
      { title: 'What does the question ask?', steps: [
        { id: 'mode', title: 'Choose the question type',
          text: 'Pick the method the question names, or the quantity it asks for. Switching keeps your numbers.',
          vars: [
            { id: 'mode', label: 'Question type', kind: 'choice', type: 'text', options: modeOpts, default: isM ? 'mott' : 'shig' },
          ],
          after: v => MODE_INFO[v.mode] ? '<span style="color:#475569">Course questions: ' + MODE_INFO[v.mode] + '</span>' : '' },
      ] },

      { title: 'Problem data', steps: [
        { id: 'in', title: 'Power and speeds', formula: 'VR = \\frac{n_1}{n_2}\\quad (n_1 = \\text{faster shaft})',
          text: 'n_1 is the faster (driving) shaft; n_2 the nominal output speed (blank if the driven sheave is given).',
          vars: [
            { id: 'P', symbol: 'P', label: 'Nominal (motor) power', unit: 'hp', kind: 'input', hint: 'not needed for geometry only' },
            { id: 'n1', symbol: 'n_1', label: 'Speed of the faster (driver) shaft', unit: 'rpm', kind: 'input' },
            { id: 'n2', symbol: 'n_2', label: 'Desired output speed (nominal)', unit: 'rpm', kind: 'input', hint: 'mid-point if a range is given' },
            { id: 'VRn', symbol: 'VR_{nom}', label: 'Nominal speed ratio', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'n1', 'n2') ? v.n1 / v.n2 : undefined,
              check: v => !H.has(v, 'VRn') ? null : v.VRn < 1 ? 'Speed increaser: Table 7-1 factors × 1.2' : v.VRn > 7 ? 'Ratio above 7:1 — beyond the cogged-belt limit' : v.VRn > 6 ? 'Ratio above 6:1 — cogged belts only (≤ 7:1)' : null },
          ] },
        { id: 'sf', title: 'Service factor and design power', when: M('mott', 'gates', 'shig', 'rate'), fig: ['table7-1', 'table17-15', 'ks-hours', 'gates-tb1'], eq: isM ? undefined : '17-19',
          formula: 'P_{des} = H_d = P\\,K_s\\,n_d',
          text: 'Always multiply the nominal power by K_s first. Mott Table 7-1 is the course table (Gates questions: Gates Table B1; Shigley Table 17-15 accepted as a range).',
          vars: [
            { id: 'Ks', symbol: 'K_s', label: 'Service factor', unit: '', kind: 'lookup', fig: isM ? 'table7-1' : 'table17-15', default: 1.3,
              hint: 'midterm 2025 1.3, 2023 1.5 · HW1 1.4 / 1.2 · Tut 2 Q1 1.4 · Gates: Tut 2 Q2 1.5',
              check: v => H.has(v, 'Ks') && (v.Ks < 1 || v.Ks > 2.4) ? 'Service factors are 1.0–2.0 (× 1.2 for a speed increaser)' : null },
            { id: 'nd', symbol: 'n_d', label: 'Design factor', unit: '', kind: 'input', default: 1.0, hint: '1.0 unless the problem states one' },
            { id: 'Pdes', symbol: 'P_{des}', label: 'Design power', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'P', 'Ks') ? v.P * v.Ks * (H.has(v, 'nd') ? v.nd : 1) : undefined,
              work: v => H.has(v, 'Pdes') ? '\\(P_{des} = ' + f(v.P) + '(' + f(v.Ks) + ')(' + f(H.has(v, 'nd') ? v.nd : 1) + ') = ' + f(v.Pdes) + '\\ \\text{hp}\\)' : null },
          ] },
      ] },

      { title: 'Belt section and standard sizes', steps: [
        { id: 'sec', title: 'Belt cross-section', fig: ['fig7-13', 'gates-b1', 'gates-fb1b2', 'table17-9', 'abcd', 'fig7-9'],
          text: 'Enter the chart with the <b>design</b> power and the faster-shaft rpm; on a boundary take the larger section. The table below lists every section — <b>Use</b> sets it.',
          vars: [
            { id: 'sec', label: 'Belt section', kind: 'choice', type: 'text', auto: v => { const s = secSel(v); return s ? s.pick : undefined; }, hint: 'auto = ★ section of the table below', options: [
              { value: '3V', label: '3V — narrow (Mott Fig 7-14)' }, { value: '5V', label: '5V — narrow (Mott Figs 7-15, 7-17)' }, { value: '8V', label: '8V — narrow (Mott Fig 7-16)' },
              { value: '3VX', label: '3VX — Gates cogged narrow' }, { value: '5VX', label: '5VX — Gates cogged narrow' },
              { value: 'A', label: 'A — classical (Shigley Table 17-12)' }, { value: 'B', label: 'B — classical' }, { value: 'C', label: 'C — classical / Gates Hi-Power CP' }, { value: 'D', label: 'D — classical' }, { value: 'E', label: 'E — classical' },
              { value: 'AX', label: 'AX — Gates Tri-Power cogged' }, { value: 'BX', label: 'BX — Gates Tri-Power cogged' }, { value: 'CX', label: 'CX — Gates Tri-Power cogged' }],
              check: v => (M('mott', 'rate')(v) && v.sec && !PTAB[v.sec]) ? 'Mott\'s charts cover 3V/5V/8V only — use the Gates or Shigley question type' : null },
            { id: 'secHint', symbol: '', label: 'Chart suggestion for P_des and n_1', unit: '', kind: 'calc', compute: v => secHintText(v) },
          ],
          after: v => secTableHtml(v) },
        { id: 'std', title: 'Standard sizes for this section', fig: ['fig7-9', 'table17-9', 'table7-2', 'table17-10', 'table17-11', 'fig7-15'],
          text: 'Reference: section dimensions, stocked belt lengths and sheave diameters. The size in use is highlighted.',
          after: v => v.sec ? stdHtml(v) : '' },
      ] },

      { title: 'Sheaves and basic rating', steps: [
        { id: 'd1', title: 'Driver sheave for ≈ 4000 ft/min (limit 5000 ft/min)', when: M('mott'), eq: 'Mott 7-2', fig: ['fig7-14', 'fig7-15', 'fig7-16'],
          formula: 'D_1 = \\frac{12\\,v_b}{\\pi n_1},\\qquad D_{1,max} = \\frac{12(5000)}{\\pi n_1}',
          text: 'Size the driver for about 4000 ft/min, then take a standard diameter (next step). The midterms worked from \\(v_b \\lt 5000\\) ft/min (2025: \\(D \\le 16.6\\) in).',
          vars: [
            { id: 'Vt', symbol: 'v_{b,target}', label: 'Target belt speed', unit: 'ft/min', kind: 'input', default: 4000, hint: 'Fizz p.11, Mech p.20, slide 25' },
            { id: 'D1calc', symbol: 'D_{1,calc}', label: 'Driver diameter for the target speed', unit: 'in', kind: 'calc', compute: v => H.has(v, 'n1', 'Vt') ? 12 * v.Vt / (Math.PI * v.n1) : undefined,
              work: v => H.has(v, 'D1calc') ? '\\(D_1 = \\frac{12(' + f(v.Vt) + ')}{\\pi(' + f(v.n1) + ')} = ' + f(v.D1calc) + '\\ \\text{in}\\)' : null },
            { id: 'D1max', symbol: 'D_{1,max}', label: 'Largest driver for 5000 ft/min', unit: 'in', kind: 'calc', compute: v => H.has(v, 'n1') ? 60000 / (Math.PI * v.n1) : undefined },
          ] },
        { id: 'nema', title: 'Gates: minimum driver sheave (NEMA Table B2 / B3)', when: M('gates'), fig: ['gates-b2b3', 'gates-b2b3cat', 'gates-b1'],
          text: 'Use the <b>motor</b> hp row and the motor-rpm column nearest n_1 (B2 narrow, B3 classical). Motors need it to limit the belt pull on their bearings.',
          vars: [
            { id: 'dminN', symbol: 'd_{min}', label: 'NEMA minimum driver sheave', unit: 'in', kind: 'lookup', fig: 'gates-b2b3cat', auto: v => nema(v.sec, v.P, v.n1), hint: 'auto = Table B2/B3 at the motor hp and nearest rpm column' },
          ] },
        { id: 'sheave', title: 'Sheaves: standard sizes, actual ratio and speeds', fig: ['fig7-14', 'fig7-15', 'fig7-16', 'table17-9', 'gates-b6'],
          formula: 'D_2 \\approx D_1\\,VR_{nom},\\quad VR = \\frac{D_2}{D_1},\\quad n_{2} = \\frac{n_1}{VR},\\quad v_b = \\frac{\\pi D_1 n_1}{12}',
          text: 'Type the sheaves the problem gives; otherwise pick a pair from the table below (closest standard D_2 to D_1·VR). Keep 1000 < v_b < 5000 ft/min (6500 absolute).',
          vars: [
            { id: 'tolN2', symbol: '\\pm', label: 'Allowed output-speed error (sheave table)', unit: '%', kind: 'input', default: 2, hint: 'course picks land within 0.2–1.3 % (2023 accepted −3 %)' },
            { id: 'dminS', symbol: 'd_{min}', label: 'Minimum sheave for the section', unit: 'in', kind: 'lookup', fig: 'table17-9', auto: v => sd(v) ? sd(v).dmin : undefined, hint: 'Table 17-9 (A–E); 3V 2.65, 5V 7.1, 8V 12.5' },
            { id: 'D1', symbol: 'D_1', label: 'Driver (small) sheave pitch diameter', unit: 'in', kind: 'lookup', fig: isM ? 'fig7-15' : 'table17-12',
              auto: v => { const s = sheaveSel(v); if (s && s.pick) return s.pick.D1; return v.mode === 'gates' ? v.dminN : !H.has(v, 'D1calc') ? undefined : SHEAVES[base(v.sec)] ? nearest(v.D1calc, SHEAVES[base(v.sec)]) : Math.round(v.D1calc * 10) / 10; },
              hint: 'auto = ★ pair of the table below — type the sheave the problem gives',
              check: v => H.has(v, 'D1', 'dminS') && v.D1 < v.dminS - 1e-9 ? 'Below the minimum sheave for this section' : (v.mode === 'gates' && H.has(v, 'D1', 'dminN') && v.D1 < v.dminN - 1e-9) ? 'Below the NEMA minimum for this motor' : null },
            { id: 'D2calc', symbol: 'D_1 VR_{nom}', label: 'Ideal driven sheave', unit: 'in', kind: 'calc', compute: v => H.has(v, 'D1', 'VRn') ? v.D1 * v.VRn : undefined },
            { id: 'D2', symbol: 'D_2', label: 'Driven (large) sheave pitch diameter', unit: 'in', kind: 'lookup', fig: isM ? 'fig7-15' : 'table17-12',
              auto: v => !H.has(v, 'D2calc') ? undefined : (v.mode === 'mott' || v.mode === 'gates') ? d2For(v, v.D1) : SHEAVES[base(v.sec)] ? nearest(v.D2calc, SHEAVES[base(v.sec)]) : Math.round(v.D2calc * 100) / 100,
              hint: 'auto = closest standard (Mott) / stock (Gates) size to D_1·VR' },
            { id: 'VR', symbol: 'VR', label: 'Actual speed ratio', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'D1', 'D2') ? v.D2 / v.D1 : undefined,
              check: v => H.has(v, 'VR') && v.VR > 6 ? 'VR > 6 (7 for cogged belts)' : null },
            { id: 'n2a', symbol: 'n_{2,act}', label: 'Actual output speed', unit: 'rpm', kind: 'calc', compute: v => H.has(v, 'n1', 'VR') ? v.n1 / v.VR : undefined,
              work: v => H.has(v, 'n2a') ? '\\(n_2 = ' + f(v.n1) + '\\,\\frac{' + f(v.D1) + '}{' + f(v.D2) + '} = ' + f(v.n2a) + '\\ \\text{rpm}\\)' : null,
              check: v => { const tol = H.has(v, 'tolN2') ? v.tolN2 : 5; return H.has(v, 'n2a', 'n2') && Math.abs(v.n2a / v.n2 - 1) * 100 > tol + 1e-9 ? 'More than ' + f(tol) + ' % from the nominal output speed' : null; } },
            { id: 'vb', symbol: 'v_b', label: 'Belt speed', unit: 'ft/min', kind: 'calc', compute: v => H.has(v, 'D1', 'n1') ? Math.PI * v.D1 * v.n1 / 12 : undefined,
              work: v => H.has(v, 'vb') ? '\\(v_b = \\frac{\\pi(' + f(v.D1) + ')(' + f(v.n1) + ')}{12} = ' + f(v.vb) + '\\ \\text{ft/min}\\)' : null,
              check: v => !H.has(v, 'vb') ? null : v.vb > 6500 ? 'Above the 6500 ft/min absolute maximum' : v.vb > 5000 ? 'Above 5000 ft/min (course limit)' : v.vb < 1000 ? 'Below 1000 ft/min — consider a chain, gears or a timing belt' : null },
          ],
          after: v => sheaveTableHtml(v) },
        { id: 'prate', title: 'Basic rating P_Tab and power added for speed ratio', when: M('mott', 'rate'), fig: ['fig7-14', 'fig7-15', 'fig7-16', 'fig7-17'],
          formula: 'P_{rated} = P_{Tab} + \\Delta P_R',
          text: 'Read the <b>solid</b> curve (VR = 1) at D_1 and n_1, interpolating between rpm curves; \\(\\Delta P_R\\) from Fig 7-17 (5V). 3V/8V: \\(\\Delta P_R\\) is a share of the dashed − solid gap (auto).',
          vars: [
            { id: 'P1', symbol: 'P_{Tab}', label: 'Basic rated power per belt (solid curve)', unit: 'hp', kind: 'lookup', fig: 'fig7-15', auto: v => chartP(v.sec, v.D1, v.n1), hint: 'auto = digitised curve — midterm 2025 read 23 hp (auto 22.1), 2023 30 hp' },
            { id: 'Padd', symbol: '\\Delta P_R', label: 'Power added for speed ratio', unit: 'hp', kind: 'lookup', fig: 'fig7-17', auto: v => dPR(v.sec, v.n1, v.VR), hint: 'Fig 7-17 (5V): 1.26 at 1160 rpm, VR ≈ 2' },
            { id: 'Prated', symbol: 'P_{rated}', label: 'Rated power per belt', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'P1', 'Padd') ? v.P1 + v.Padd : undefined,
              work: v => H.has(v, 'Prated') ? '\\(P_{rated} = ' + f(v.P1) + ' + ' + f(v.Padd) + ' = ' + f(v.Prated) + '\\ \\text{hp}\\)' : null },
          ] },
      ] },

      { title: 'Belt length and centre distance', steps: [
        { id: 'trial', title: 'Trial centre distance → required belt length', when: M('mott', 'gates', 'shig', 'rate', 'geom'), fig: ['fig7-4', 'fig17-1'], eq: 'Mott 7-12, 7-17 · Shigley 17-16a',
          formula: 'D_2 < CD < 3(D_2 + D_1),\\qquad L = 2\\,CD + 1.57(D_2 + D_1) + \\frac{(D_2 - D_1)^2}{4\\,CD}',
          text: 'Use the CD the problem gives; otherwise start near 32 in (course practice: 32–40 in) inside the range. Skip if the belt itself is given.',
          vars: [
            { id: 'CDmin', symbol: 'CD_{min}', label: 'Minimum CD, if the problem gives one', unit: 'in', kind: 'input', hint: 'midterm 2023: 30 in' },
            { id: 'CDt', symbol: 'CD_{trial}', label: 'Trial (nominal) centre distance', unit: 'in', kind: 'input', auto: cdTrial, hint: 'auto = 32 in (or the minimum) inside the range — type the CD the problem gives',
              check: v => H.has(v, 'CDt', 'D1', 'D2') && (v.CDt <= Math.max(v.D1, v.D2) || v.CDt >= 3 * (v.D1 + v.D2)) ? 'Outside \\(D_2 \\lt CD \\lt 3(D_1 + D_2)\\) — fine only if the problem fixes the CD' : (H.has(v, 'CDt', 'CDmin') && v.CDt < v.CDmin) ? 'Below the given minimum CD' : null },
            { id: 'CDlo', symbol: 'D_2', label: 'Lower limit', unit: 'in', kind: 'calc', compute: v => H.has(v, 'D2') ? v.D2 : undefined },
            { id: 'CDhi', symbol: '3(D_1+D_2)', label: 'Upper limit', unit: 'in', kind: 'calc', compute: v => H.has(v, 'D1', 'D2') ? 3 * (v.D1 + v.D2) : undefined },
            { id: 'Lreq', symbol: 'L', label: 'Required belt (pitch) length', unit: 'in', kind: 'calc', compute: v => H.has(v, 'CDt', 'D1', 'D2') ? 2 * v.CDt + kL(v) * (v.D1 + v.D2) + (v.D2 - v.D1) ** 2 / (4 * v.CDt) : undefined,
              work: v => H.has(v, 'Lreq') ? '\\(L = 2(' + f(v.CDt) + ') + ' + (v.mode === 'shig' ? '\\tfrac{\\pi}{2}' : '1.57') + '(' + f(v.D2) + ' + ' + f(v.D1) + ') + \\frac{(' + f(v.D2) + ' - ' + f(v.D1) + ')^2}{4(' + f(v.CDt) + ')} = ' + f(v.Lreq) + '\\ \\text{in}\\)' : null },
          ] },
        { id: 'belt', title: 'Standard belt → actual centre distance and wrap angles', fig: ['table7-2', 'table17-10', 'table17-11', 'gates-b4', 'gates-b4cat', 'gates-b17', 'gates-b18', 'gates-b19', 'gates-b20'], eq: 'Mott 7-13, 7-14 · Shigley 17-16b, 17-1',
          formula: '\\begin{gathered} L_p = L + L_c,\\quad B = 4L_p - 6.28(D_2 + D_1),\\quad CD = \\frac{B + \\sqrt{B^2 - 32(D_2 - D_1)^2}}{16} \\\\ \\theta_{1,2} = 180^\\circ \\mp 2\\sin^{-1}\\frac{D_2 - D_1}{2\\,CD} \\end{gathered}',
          text: 'Take the closest standard length (table below; either neighbour is accepted). Narrow belts list pitch length (L_c = 0); A–E list the inside length, so add L_c (Table 17-11). Wrap on the small sheave must exceed 120°.',
          vars: [
            { id: 'Lc', symbol: 'L_c', label: 'Length conversion (Table 17-11)', unit: 'in', kind: 'lookup', fig: 'table17-11', auto: v => (sd(v) && v.mode !== 'gates') ? sd(v).conv : (v.sec ? 0 : undefined), hint: 'A 1.3, B 1.8, C 2.9, D 3.3, E 4.5; 0 for 3V/5V/8V and Gates numbers' },
            { id: 'Lstd', symbol: 'L', label: 'Standard belt length (belt number)', unit: 'in', kind: 'lookup', fig: isM ? 'table7-2' : 'table17-10',
              auto: v => { const p = lenPick(v); if (p !== undefined) return p; const t = LENG[base(v.sec)]; return (t && H.has(v, 'Lreq')) ? nearest(v.Lreq - (H.has(v, 'Lc') ? v.Lc : 0), t) : undefined; },
              hint: 'auto = ★ length of the table below; belt name = section + length (5V1320, B112, D360)' },
            { id: 'Lp', symbol: 'L_p', label: 'Pitch length', unit: 'in', kind: 'calc', compute: v => H.has(v, 'Lstd') ? v.Lstd + (H.has(v, 'Lc') ? v.Lc : 0) : undefined },
            { id: 'B', symbol: 'B', label: 'B = 4L_p − 6.28(D_2 + D_1)', unit: 'in', kind: 'calc', compute: v => H.has(v, 'Lp', 'D1', 'D2') ? 4 * v.Lp - 4 * kL(v) * (v.D1 + v.D2) : undefined },
            { id: 'CD', symbol: 'CD', label: 'Actual centre distance', unit: 'in', kind: 'calc', compute: v => { if (!H.has(v, 'B', 'D1', 'D2')) return undefined; const r = v.B * v.B - 32 * (v.D2 - v.D1) ** 2; return r >= 0 ? (v.B + Math.sqrt(r)) / 16 : undefined; },
              work: v => H.has(v, 'CD') ? '\\(B = 4(' + f(v.Lp) + ') - ' + (v.mode === 'shig' ? '2\\pi' : '6.28') + '(' + f(v.D2) + ' + ' + f(v.D1) + ') = ' + f(v.B) + ',\\quad CD = \\frac{' + f(v.B) + ' + \\sqrt{' + f(v.B) + '^2 - 32(' + f(v.D2) + ' - ' + f(v.D1) + ')^2}}{16} = ' + f(v.CD) + '\\ \\text{in}\\)' : null,
              check: v => H.has(v, 'CD', 'D1', 'D2') && (v.CD <= v.D2 || v.CD >= 3 * (v.D1 + v.D2)) ? 'Actual CD outside \\(D_2 \\lt CD \\lt 3(D_1 + D_2)\\)' : (H.has(v, 'CD', 'CDmin') && v.CD < v.CDmin - 1e-9) ? 'Actual CD below the given minimum — take a longer belt' : null },
            { id: 'th1', symbol: '\\theta_1', label: 'Wrap angle on the small sheave', unit: '°', kind: 'calc', compute: v => H.has(v, 'D1', 'D2', 'CD') ? 180 - 2 * H.deg(Math.asin(Math.abs(v.D2 - v.D1) / (2 * v.CD))) : undefined,
              work: v => H.has(v, 'th1') ? '\\(\\theta_1 = 180^\\circ - 2\\sin^{-1}\\frac{' + f(v.D2) + ' - ' + f(v.D1) + '}{2(' + f(v.CD) + ')} = ' + f(v.th1) + '^\\circ = ' + f(H.rad(v.th1)) + '\\ \\text{rad}\\)' : null,
              check: v => H.has(v, 'th1') && v.th1 < 120 ? '\\(\\theta_1 \\lt 120^\\circ\\) — increase the CD or add an idler' : null },
            { id: 'th2', symbol: '\\theta_2', label: 'Wrap angle on the large sheave', unit: '°', kind: 'calc', compute: v => H.has(v, 'th1') ? 360 - v.th1 : undefined },
          ],
          after: v => lenTableHtml(v) },
      ] },

      { title: 'Power per belt and number of belts', steps: [
        { id: 'mcorr', title: 'Mott: wrap and length corrections → P_A', when: M('mott', 'rate'), fig: ['fig7-18', 'fig7-19'],
          formula: 'P_A = C_\\theta\\,C_L\\,(P_{Tab} + \\Delta P_R)',
          text: '\\(C_\\theta\\) from Fig 7-18 at \\(\\theta_1\\); C_L from Fig 7-19 at the standard length (midterm 2025: 164° → 0.96, 5V125 → 1.0).',
          vars: [
            { id: 'Cth', symbol: 'C_\\theta', label: 'Angle-of-wrap correction', unit: '', kind: 'lookup', fig: 'fig7-18', auto: v => cth(v.th1), hint: 'auto = digitised Fig 7-18' },
            { id: 'CL', symbol: 'C_L', label: 'Belt-length correction', unit: '', kind: 'lookup', fig: 'fig7-19', auto: v => clM(v.sec, v.Lstd), hint: 'auto = digitised Fig 7-19 curve for the section' },
            { id: 'PA', symbol: 'P_A', label: 'Allowable power per belt', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'Cth', 'CL', 'Prated') ? v.Cth * v.CL * v.Prated : undefined,
              work: v => H.has(v, 'PA') ? '\\(P_A = (' + f(v.Cth) + ')(' + f(v.CL) + ')(' + f(v.P1) + ' + ' + f(v.Padd) + ') = ' + f(v.PA) + '\\ \\text{hp}\\)' : null },
          ] },
        { id: 'gcorr', title: 'Gates: hp per belt × hp correction factor', when: M('gates'), fig: ['gates-b6', 'gates-b6p1', 'gates-b6p2', 'gates-b23', 'gates-ex', 'gates-b9', 'gates-b10', 'gates-b11', 'gates-b12', 'gates-b13', 'gates-b14', 'gates-b15', 'gates-b16', 'gates-b25', 'gates-b26', 'gates-b27', 'gates-b28', 'gates-b29', 'gates-b30', 'gates-b31', 'gates-b32', 'gates-b33', 'gates-b34'],
          formula: 'H_{all} = (\\text{hp correction})\\,(H_{tab} + \\Delta P)',
          text: 'The drive table gives the CD and the colour-keyed hp correction (wrap × length); H_tab and \\(\\Delta P\\) come from the section\'s rating table. Lecture: 0.9(7.68 + 0.25); HW1 P3b: 0.9(2.8 + 0.36).',
          vars: [
            { id: 'KG', symbol: 'K_{corr}', label: 'Gates hp correction factor', unit: '', kind: 'lookup', fig: 'gates-b6p1', auto: v => isClassic(v.sec) ? (k1(v.th1) && k2(v.sec, v.Lstd) ? k1(v.th1) * k2(v.sec, v.Lstd) : undefined) : (cth(v.th1) && clM(v.sec, v.Lstd) ? cth(v.th1) * clM(v.sec, v.Lstd) : undefined), hint: 'auto ≈ \\(C_\\theta C_L\\) (narrow) or \\(K_1K_2\\) (classical) — read the colour key' },
            { id: 'HtabG', symbol: 'H_{tab}', label: 'Gates rated hp per belt (VR = 1)', unit: 'hp', kind: 'lookup', fig: 'gates-b10', hint: 'section\'s rating table at the small sheave and rpm (B9 3V, B10 3VX, B33 C/CP …)' },
            { id: 'dPG', symbol: '\\Delta P', label: 'Additional hp for speed ratio', unit: 'hp', kind: 'lookup', fig: 'gates-b10', auto: v => H.has(v, 'VR') && v.VR < 1.015 ? 0 : undefined, hint: '0 for VR = 1.00' },
            { id: 'Hall', symbol: 'H_{all}', label: 'Allowable power per belt', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'KG', 'HtabG', 'dPG') ? v.KG * (v.HtabG + v.dPG) : undefined,
              work: v => H.has(v, 'Hall') ? '\\(H_{all} = ' + f(v.KG) + '(' + f(v.HtabG) + ' + ' + f(v.dPG) + ') = ' + f(v.Hall) + '\\ \\text{hp}\\)' : null },
          ] },
        { id: 'scorr', title: 'Shigley: H_a = K_1 K_2 H_tab', when: M('shig'), fig: ['table17-12', 'table17-13', 'table17-14'], eq: '17-17',
          formula: 'H_a = K_1 K_2 H_{tab}',
          text: 'H_tab from Table 17-12 at the small sheave and belt speed (interpolate on V); K_1 at the wrap, K_2 at the inside length. No speed-ratio bonus in Shigley.',
          vars: [
            { id: 'Htab', symbol: 'H_{tab}', label: 'Tabulated power per belt', unit: 'hp', kind: 'lookup', fig: 'table17-12', auto: v => HP[base(v.sec)] ? htab17(base(v.sec), v.D1, v.vb) : chartP(v.sec, v.D1, v.n1), hint: 'auto = Table 17-12 interpolated (3V/5V/8V: Mott solid curve)' },
            { id: 'K1', symbol: 'K_1', label: 'Angle-of-wrap correction', unit: '', kind: 'lookup', fig: 'table17-13', auto: v => k1(v.th1), hint: 'auto = VV fit (180° → 1.00)' },
            { id: 'K2', symbol: 'K_2', label: 'Belt-length correction', unit: '', kind: 'lookup', fig: 'table17-14', auto: v => k2(v.sec, v.Lstd) || clM(v.sec, v.Lstd), hint: 'Table 17-14 (A–E); 3V/5V/8V: Mott Fig 7-19' },
            { id: 'Ha', symbol: 'H_a', label: 'Allowable power per belt', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'K1', 'K2', 'Htab') ? v.K1 * v.K2 * v.Htab : undefined,
              work: v => H.has(v, 'Ha') ? '\\(H_a = ' + f(v.K1, 3) + '(' + f(v.K2, 3) + ')(' + f(v.Htab) + ') = ' + f(v.Ha) + '\\ \\text{hp}\\)' : null },
          ] },
        { id: 'nb', title: 'Number of belts and factor of safety', when: M('mott', 'gates', 'shig', 'rate'), eq: isM ? undefined : '17-20, 17-26',
          formula: 'N_b = \\left\\lceil \\frac{P_{des}}{P_{belt}} \\right\\rceil,\\qquad n_{fs} = \\frac{N_b P_{belt}}{P_{des}},\\qquad P_{max} = \\frac{N_b P_{belt}}{K_s n_d}',
          text: 'Always round N_b <b>up</b>. For an existing drive type its number of belts; with N_b given, each belt must carry \\(P_{des}/N_b\\).',
          vars: [
            { id: 'Pbelt', symbol: 'P_{belt}', label: 'Allowable power per belt', unit: 'hp', kind: 'calc', compute: v => v.mode === 'gates' ? v.Hall : v.mode === 'shig' ? v.Ha : v.PA },
            { id: 'Nreq', symbol: 'P_{des}/P_{belt}', label: 'Belts required (unrounded)', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'Pdes', 'Pbelt') ? v.Pdes / v.Pbelt : undefined },
            { id: 'Nb', symbol: 'N_b', label: 'Number of belts', unit: '', kind: 'input', auto: v => H.has(v, 'Nreq') ? Math.max(1, Math.ceil(v.Nreq - 1e-9)) : undefined, hint: 'auto = round up; type the given number for an existing drive',
              check: v => H.has(v, 'Nb', 'Nreq') && v.Nb < v.Nreq - 1e-9 ? 'Fewer belts than required — drive overloaded' : null },
            { id: 'Pper', symbol: 'P_{des}/N_b', label: 'Power each belt must carry', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'Pdes', 'Nb') ? v.Pdes / v.Nb : undefined, hint: 'pick the smallest catalogue belt with \\(H_a \\ge\\) this (midterm MC: 0.75 × 2.5 × 1.5/2 = 1.41 → 1.5 hp)' },
            { id: 'Pcap', symbol: 'N_b P_{belt}', label: 'Allowable power of the drive', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'Nb', 'Pbelt') ? v.Nb * v.Pbelt : undefined },
            { id: 'nfs', symbol: 'n_{fs}', label: 'Factor of safety', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'Pcap', 'Pdes') ? v.Pcap / v.Pdes : undefined,
              work: v => H.has(v, 'nfs') ? '\\(N_b = ' + f(v.Pdes) + '/' + f(v.Pbelt) + ' = ' + f(v.Nreq, 3) + ' \\rightarrow ' + v.Nb + ',\\qquad n_{fs} = \\frac{' + v.Nb + '(' + f(v.Pbelt) + ')}{' + f(v.Pdes) + '} = ' + f(v.nfs, 3) + '\\)' : null },
            { id: 'Pmax', symbol: 'P_{max}', label: 'Largest motor power (n_fs = 1)', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'Pcap', 'Ks') ? v.Pcap / (v.Ks * (H.has(v, 'nd') ? v.nd : 1)) : undefined },
          ],
          after: v => nbTableHtml(v) },
      ] },

      { title: 'Belt tensions and life (Shigley)', steps: [
        { id: 'dF', title: 'Torque and tension difference per belt', when: M('shig', 'gates'), fig: ['fig17-14'], eq: '17-22',
          formula: '\\Delta F = \\frac{63\\,025\\,H_{belt}}{n_1 (D_1/2)},\\qquad H_{belt} = H_a\\ \\text{or}\\ H_d/N_b',
          text: 'Tutorial 2 Q1 loads each belt to H_a; Shigley Ex 17-4, Tutorial 2 Q2 and midterm 2014 use the actual share H_d/N_b.',
          vars: [
            { id: 'dFbasis', label: 'Power per belt used for \\(\\Delta F\\)', kind: 'choice', type: 'text', default: 'Ha', options: [{ value: 'Ha', label: 'H_a — allowable per belt (Tutorial 2 Q1)' }, { value: 'HdNb', label: 'H_d/N_b — actual share (Ex 17-4, Tut 2 Q2, midterm 2014)' }] },
            { id: 'Hbelt', symbol: 'H_{belt}', label: 'Power per belt for tensions', unit: 'hp', kind: 'calc', compute: v => v.dFbasis === 'HdNb' ? (H.has(v, 'Pdes', 'Nb') ? v.Pdes / v.Nb : undefined) : v.Pbelt },
            { id: 'Tb', symbol: 'T', label: 'Torque per belt', unit: 'lbf·in', kind: 'calc', compute: v => H.has(v, 'Hbelt', 'n1') ? 63025 * v.Hbelt / v.n1 : undefined },
            { id: 'dF', symbol: '\\Delta F', label: 'Tension difference per belt', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'Tb', 'D1') ? 2 * v.Tb / v.D1 : undefined,
              work: v => H.has(v, 'dF') ? '\\(T = \\frac{63\\,025(' + f(v.Hbelt) + ')}{' + f(v.n1) + '} = ' + f(v.Tb) + '\\ \\text{lbf·in},\\quad \\Delta F = \\frac{2T}{D_1} = ' + f(v.dF) + '\\ \\text{lbf}\\)' : null },
          ] },
        { id: 'tens', title: 'F_c, F_1, F_2, F_i', when: M('shig', 'gates'), fig: ['table17-16', 'fig17-14'], eq: '17-21, 17-23 … 17-25',
          formula: 'F_c = K_c\\left(\\frac{V}{1000}\\right)^2,\\quad F_1 = F_c + \\frac{\\Delta F\\,e^{f\\phi}}{e^{f\\phi} - 1},\\quad F_2 = F_1 - \\Delta F,\\quad F_i = \\frac{F_1 + F_2}{2} - F_c',
          text: 'Effective friction f = 0.5123 (\\(F_1/F_2 \\approx 5\\) at 180°); midterm 2014 used f = 0.5. \\(\\phi\\) is the small-sheave wrap.',
          vars: [
            { id: 'fV', symbol: 'f', label: 'Effective friction coefficient (V groove)', unit: '', kind: 'lookup', fig: 'fig17-14', default: 0.5123, hint: 'Shigley Eq 17-17 note: 0.5123; midterm 2014: 0.5' },
            { id: 'efp', symbol: 'e^{f\\phi}', label: 'Friction term at the small-sheave wrap', unit: '', kind: 'calc', compute: v => H.has(v, 'th1', 'fV') ? Math.exp(v.fV * H.rad(v.th1)) : undefined },
            { id: 'Kc', symbol: 'K_c', label: 'Centrifugal parameter (Table 17-16)', unit: '', kind: 'lookup', fig: 'table17-16', auto: v => sd(v) ? sd(v).Kc : undefined },
            { id: 'Fc', symbol: 'F_c', label: 'Centrifugal tension', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'Kc', 'vb') ? v.Kc * (v.vb / 1000) ** 2 : undefined,
              work: v => H.has(v, 'Fc') ? '\\(F_c = ' + f(v.Kc) + '\\left(\\frac{' + f(v.vb) + '}{1000}\\right)^2 = ' + f(v.Fc) + '\\ \\text{lbf}\\)' : null },
            { id: 'F1', symbol: 'F_1', label: 'Tight-side tension', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'Fc', 'dF', 'efp') ? v.Fc + v.dF * v.efp / (v.efp - 1) : undefined,
              work: v => H.has(v, 'F1') ? '\\(F_1 = ' + f(v.Fc) + ' + \\frac{' + f(v.dF) + '(' + f(v.efp) + ')}{' + f(v.efp) + ' - 1} = ' + f(v.F1) + '\\ \\text{lbf}\\)' : null },
            { id: 'F2', symbol: 'F_2', label: 'Slack-side tension', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'F1', 'dF') ? v.F1 - v.dF : undefined },
            { id: 'Fi', symbol: 'F_i', label: 'Initial tension (pre-tension)', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'F1', 'F2', 'Fc') ? (v.F1 + v.F2) / 2 - v.Fc : undefined,
              work: v => H.has(v, 'Fi') ? '\\(F_i = \\frac{' + f(v.F1) + ' + ' + f(v.F2) + '}{2} - ' + f(v.Fc) + ' = ' + f(v.Fi) + '\\ \\text{lbf}\\)' : null },
          ] },
        { id: 'peaks', title: 'Peak tensions at each sheave', when: M('shig'), fig: ['table17-16', 'fig17-14'],
          formula: 'T_1 = F_1 + \\frac{K_b}{D_1},\\qquad T_2 = F_1 + \\frac{K_b}{D_2}',
          vars: [
            { id: 'Kb', symbol: 'K_b', label: 'Bending parameter (Table 17-16)', unit: '', kind: 'lookup', fig: 'table17-16', auto: v => sd(v) ? sd(v).Kb : undefined },
            { id: 'T1', symbol: 'T_1', label: 'Peak tension, small sheave', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'F1', 'Kb', 'D1') ? v.F1 + v.Kb / v.D1 : undefined,
              work: v => H.has(v, 'T1', 'T2') ? '\\(T_1 = ' + f(v.F1) + ' + \\frac{' + f(v.Kb) + '}{' + f(v.D1) + '} = ' + f(v.T1) + ',\\quad T_2 = ' + f(v.F1) + ' + \\frac{' + f(v.Kb) + '}{' + f(v.D2) + '} = ' + f(v.T2) + '\\ \\text{lbf}\\)' : null },
            { id: 'T2', symbol: 'T_2', label: 'Peak tension, large sheave', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'F1', 'Kb', 'D2') ? v.F1 + v.Kb / v.D2 : undefined },
          ] },
        { id: 'life', title: 'Life in passes, hours and years', when: M('shig'), fig: ['table17-17'],
          formula: 'N_P = \\left[\\left(\\frac{K}{T_1}\\right)^{-b} + \\left(\\frac{K}{T_2}\\right)^{-b}\\right]^{-1},\\qquad t = \\frac{N_P L_p}{720\\,V}',
          text: 'Table 17-17 is valid for 10^8–10^9 peaks: above that report \\(N_P \\gt 10^9\\) and t as a lower bound.',
          vars: [
            { id: 'K', symbol: 'K', label: 'Durability constant', unit: '', kind: 'lookup', fig: 'table17-17', auto: v => sd(v) ? sd(v).K : undefined },
            { id: 'bexp', symbol: 'b', label: 'Durability exponent', unit: '', kind: 'lookup', fig: 'table17-17', auto: v => sd(v) ? sd(v).b : undefined },
            { id: 'NP', symbol: 'N_P', label: 'Life in belt passes', unit: 'passes', kind: 'calc', digits: 3, compute: v => H.has(v, 'K', 'bexp', 'T1', 'T2') ? 1 / ((v.K / v.T1) ** (-v.bexp) + (v.K / v.T2) ** (-v.bexp)) : undefined,
              work: v => H.has(v, 'NP') ? '\\(N_P = \\left[\\left(\\frac{' + f(v.K) + '}{' + f(v.T1) + '}\\right)^{-' + f(v.bexp) + '} + \\left(\\frac{' + f(v.K) + '}{' + f(v.T2) + '}\\right)^{-' + f(v.bexp) + '}\\right]^{-1} = ' + f(v.NP, 3) + '\\)' : null,
              check: v => H.has(v, 'NP') && v.NP > 1e9 ? 'Above 10^9: report \\(N_P \\gt 10^9\\) and t as a lower bound' : null },
            { id: 'thr', symbol: 't', label: 'Life in hours', unit: 'h', kind: 'calc', compute: v => H.has(v, 'NP', 'Lp', 'vb') ? Math.min(v.NP, 1e9) * v.Lp / (720 * v.vb) : undefined,
              work: v => H.has(v, 'thr') ? '\\(t ' + (v.NP > 1e9 ? '\\gt' : '=') + ' \\frac{' + f(Math.min(v.NP, 1e9), 3) + '(' + f(v.Lp) + ')}{720(' + f(v.vb) + ')} = ' + f(v.thr) + '\\ \\text{h}\\)' : null },
            { id: 'hpd', symbol: '', label: 'Operating hours per day', unit: 'h/day', kind: 'input', hint: '2 shifts = 16 h/day (Tutorial 2 Q1)' },
            { id: 'yrs', symbol: '', label: 'Life in years', unit: 'yr', kind: 'calc', compute: v => H.has(v, 'thr', 'hpd') ? v.thr / v.hpd / 365.25 : undefined },
          ] },
      ] },

      { title: 'Installation tension and deflection (Gates)', steps: [
        { id: 'tst', title: 'Static tension per strand (Formula D19)', when: M('gates', 'tension'), fig: ['gates-d19', 'gates-d24', 'gates-ex'],
          formula: 'T_{st} = 15\\left(\\frac{2.5 - K_\\phi}{K_\\phi}\\right)\\frac{(\\text{Motor hp})(10^3)}{N\\,V} + \\frac{M V^2}{10^6}\\ \\text{lbf}',
          text: '\\(K_\\phi\\) from Table D26 at (D − d)/C, M from Table D27. Use the <b>motor</b> hp, not the design hp (Tutorial 2 Q2: 251 lbf with 60 hp, not 375 lbf with 90 hp).',
          vars: [
            { id: 'M', symbol: 'M', label: 'Constant M (Table D27)', unit: '', kind: 'lookup', fig: 'gates-d24', auto: v => GMY[v.sec] ? GMY[v.sec][0] : undefined, hint: '3VX 0.29 · 5VX 0.78 · 3V 0.46 · 5V 1.0 · 8V 2.6 · AX 0.47 · BX 0.76 · CX 1.31 · CP 1.6' },
            { id: 'Hmot', symbol: 'H_{mot}', label: 'Motor (nominal) power', unit: 'hp', kind: 'input', auto: v => v.P, hint: 'auto = P (not the design power)' },
            { id: 'Ng', symbol: 'N', label: 'Number of belts (strands)', unit: '', kind: 'input', auto: v => v.Nb, hint: 'auto = N_b from the design' },
            { id: 'Cten', symbol: 'C', label: 'Centre distance', unit: 'in', kind: 'input', auto: v => v.CD, hint: 'auto = actual CD above (or type the given C)' },
            { id: 'ddc', symbol: '(D-d)/C', label: 'Sheave-difference ratio', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'D1', 'D2', 'Cten') ? Math.abs(v.D2 - v.D1) / v.Cten : undefined },
            { id: 'Kphi', symbol: 'K_\\phi', label: 'Arc-of-contact factor (Table D26)', unit: '', kind: 'lookup', fig: 'gates-d24', auto: v => H.has(v, 'ddc') ? H.interp(v.ddc, KPHI_X, KPHI_Y) : undefined, hint: 'auto = linear interpolation of Table D26' },
            { id: 'Tst', symbol: 'T_{st}', label: 'Static tension per strand', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'Kphi', 'Hmot', 'Ng', 'vb', 'M') ? 15 * (2.5 - v.Kphi) / v.Kphi * v.Hmot * 1000 / (v.Ng * v.vb) + v.M * v.vb * v.vb / 1e6 : undefined,
              work: v => H.has(v, 'Tst') ? '\\(T_{st} = 15\\left(\\frac{2.5 - ' + f(v.Kphi) + '}{' + f(v.Kphi) + '}\\right)\\frac{' + f(v.Hmot) + '(10^3)}{' + f(v.Ng) + '(' + f(v.vb) + ')} + \\frac{' + f(v.M) + '(' + f(v.vb) + ')^2}{10^6} = ' + f(v.Tst) + '\\ \\text{lbf}\\)' : null },
          ] },
        { id: 'defl', title: 'Span length, deflection and deflection force (D35, D20–D23)', when: M('gates', 'tension'), fig: ['gates-d20', 'gates-d19', 'gates-d24', 'gates-d35'],
          formula: '\\begin{gathered} t = C\\left[1 - 0.125\\left(\\frac{D-d}{C}\\right)^2\\right],\\quad \\delta = \\frac{t}{64} \\\\ F = \\frac{(1.4 \\text{ to } 1.5)\\,T_{st} + Y}{16}\\ (\\ge 2\\ \\text{belts}),\\quad F = \\frac{(1.4 \\text{ to } 1.5)\\,T_{st} + (t/L)\\,Y}{16}\\ (1\\ \\text{belt}) \\end{gathered}',
          text: 'Push one belt at mid-span until it deflects 1/64 in per inch of span; the force should lie between the minimum and maximum.',
          vars: [
            { id: 'Y', symbol: 'Y', label: 'Constant Y (Table D27)', unit: '', kind: 'lookup', fig: 'gates-d24', auto: v => GMY[v.sec] ? GMY[v.sec][1] : undefined, hint: '3VX/3V 4 · 5VX 13 · 5V 11 · 8V 22 · AX 7 · BX 8 · CX 15 · CP 87' },
            { id: 'tspan', symbol: 't', label: 'Span length (D35)', unit: 'in', kind: 'calc', compute: v => H.has(v, 'Cten', 'ddc') ? v.Cten * (1 - 0.125 * v.ddc * v.ddc) : undefined,
              work: v => H.has(v, 'tspan') ? '\\(t = ' + f(v.Cten) + '\\left[1 - 0.125(' + f(v.ddc, 3) + ')^2\\right] = ' + f(v.tspan) + '\\ \\text{in}\\)' : null },
            { id: 'defl', symbol: '\\delta', label: 'Deflection to apply (t/64)', unit: 'in', kind: 'calc', digits: 3, compute: v => H.has(v, 'tspan') ? v.tspan / 64 : undefined },
            { id: 'Lg', symbol: 'L', label: 'Belt length (single-belt formula)', unit: 'in', kind: 'input', auto: v => v.Lstd, hint: 'auto = standard length above (3VX800 → 80 in)' },
            { id: 'Fmin', symbol: 'F_{min}', label: 'Minimum deflection force', unit: 'lbf', kind: 'calc', digits: 3, compute: v => { if (!H.has(v, 'Tst', 'Y', 'Ng')) return undefined; if (v.Ng >= 2) return (1.4 * v.Tst + v.Y) / 16; return H.has(v, 'tspan', 'Lg') ? (1.4 * v.Tst + v.tspan / v.Lg * v.Y) / 16 : undefined; },
              work: v => H.has(v, 'Fmin', 'Fmax') ? '\\(F = \\frac{(1.4,\\ 1.5)(' + f(v.Tst) + ') + ' + (v.Ng >= 2 ? f(v.Y) : '(' + f(v.tspan) + '/' + f(v.Lg) + ')(' + f(v.Y) + ')') + '}{16} = ' + f(v.Fmin, 3) + '\\text{ to }' + f(v.Fmax, 3) + '\\ \\text{lbf}\\)' : null },
            { id: 'Fmax', symbol: 'F_{max}', label: 'Maximum deflection force', unit: 'lbf', kind: 'calc', digits: 3, compute: v => { if (!H.has(v, 'Tst', 'Y', 'Ng')) return undefined; if (v.Ng >= 2) return (1.5 * v.Tst + v.Y) / 16; return H.has(v, 'tspan', 'Lg') ? (1.5 * v.Tst + v.tspan / v.Lg * v.Y) / 16 : undefined; } },
          ] },
      ] },

      { title: 'Answer', steps: [
        { id: 'answer', title: 'Answer to the question',
          text: 'Resolve any red warning above (speed, ratio, wrap, CD range, minimum sheave) before quoting it.',
          after: answer },
      ] },
    ];

    T.assumptions = [
      { text: 'Course units: hp, rpm, in, ft/min; \\(T = 63\\,025\\,P/n\\) lbf·in; 1 hp = 550 ft·lbf/s = 33 000 ft·lbf/min', src: 'Flat&V s12 · midterm MC 13', general: true },
      { text: 'K_s = 1.3 until you read your own (Mott Table 7-1; Gates questions: Table B1); Table 7-1 is for reducers — × 1.2 for a speed increaser', src: 'Fizz p.9–10 · Mech p.19 · Flat&V s28, s35', var: 'Ks' },
      { text: 'Design factor n_d = 1.0 unless stated; design power = P·K_s·n_d', src: 'Flat&V s41 · Fizz p.10', var: 'nd' },
      { text: 'Section from the chart at the design power and faster-shaft rpm; on a boundary take the larger section (chart regions digitised, ±5 % in hp)', src: 'Fizz p.10 · Mott Fig 7-13 · Gates Fig B1 (s32)', var: 'sec' },
      { text: 'Mott design: driver sized for ≈ 4000 ft/min, then the closest standard sheave; belt speed 1000–5000 ft/min (6500 absolute)', src: 'Fizz p.11 · Mech p.20 · Flat&V s25', var: 'Vt' },
      { text: 'Driven sheave: closest standard size to D_1·VR (21.1, 27.7, 18.95 in in the solutions); output speed within ±2 % for the table pick', src: 'Fizz p.14 · Mech p.20 · HW1 P2/P3a', var: 'tolN2' },
      { text: 'Gates sheaves: smallest stock sheave ≥ the NEMA minimum (must exceed it below the 575-rpm column; Tutorial 2 Q2: 12 → 13 in)', src: 'Tut 2 Q2 · HW1 P3b · Gates Tables B6, B21–B24', var: 'dminN' },
      { text: 'Speed ratio ≤ 6:1 (7:1 cogged); wrap on the small sheave > 120°', src: 'Flat&V s25, s28 · Mott p.255', step: 'belt' },
      { text: 'P_Tab auto = digitised Mott Fig 7-14/15/16 solid curve, linear between rpm curves (midterm 2025 read 23 hp where the curve gives 22.1)', src: 'Mott p.257 · Midterm 2025 P1', var: 'P1' },
      { text: '\\(\\Delta P_R\\): 5V steps of Fig 7-17 (∝ rpm); 3V/8V: same pattern on the dashed − solid gap; nothing more above VR 3.38', src: 'Mott p.257 · Fizz p.14–15 · Mech p.22–23', var: 'Padd' },
      { text: 'Trial CD ≈ 32 in (course "often takes c–c ≈ 32–40 in and goes from there"; midterm 2023 chose 32 over a 30-in minimum, 2025 gave 32, HW1 used 24/36), inside \\(D_2 \\lt CD \\lt 3(D_1 + D_2)\\); the given CD if there is one', src: 'Mott Eq 7-17 · Midterms 2023/2025 P1 · HW1 P2/P3a', var: 'CDt' },
      { text: 'Standard length: the closest Table 7-2 / 17-10 length (either neighbour accepted); L and CD from Mott 7-12/7-13 with 1.57 and 6.28 (Shigley 17-16 with \\(\\pi/2\\) in the Shigley type — same to 0.01 in)', src: 'Fizz p.15–16 · Mech p.23–24 · Midterm 2025 P1', var: 'Lstd' },
      { text: '\\(C_\\theta\\) and C_L auto = digitised Mott Figs 7-18/7-19 (reproduce Mott Ex 7-2, the midterms and HW1 to ±0.01)', src: 'Fizz p.16–17 · Mech p.24–25', var: 'CL' },
      { text: 'Gates hp correction combines wrap and length (auto ≈ \\(C_\\theta C_L\\) or \\(K_1K_2\\) — read the colour key); Gates CD ≈ Mott Eq 7-13 with the belt number as length', src: 'Flat&V s37–38 · Tut 2 Q2 · HW1 P3b', var: 'KG' },
      { text: 'Number of belts always rounded up; n_fs = N_b·P_belt/P_des', src: 'Fizz p.18 · Mech p.26 · Flat&V s41', var: 'Nb' },
      { text: 'Shigley: f = 0.5123 (\\(F_1/F_2 \\approx 5\\) at 180°), the small sheave drives, no speed-ratio bonus in H_a', src: 'Shigley Eq 17-17 · Flat&V s25, s31', var: 'fV' },
      { text: '\\(\\Delta F\\) from H_a per belt (Tutorial 2 Q1); H_d/N_b for Ex 17-4, Tutorial 2 Q2 and midterm 2014', src: 'Module 1 p12, p20 · Shigley Ex 17-4', var: 'dFbasis' },
      { text: 'Life constants K, b valid for 10^8–10^9 peaks; above that report "> 10^9" and t as a lower bound', src: 'Shigley Table 17-17 · Tut 2 Q1', step: 'life' },
      { text: 'Installation tension: Gates D19 with the MOTOR hp; \\(K_\\phi\\) interpolated in Table D26, M and Y from Table D27', src: 'Flat&V s39 · Module 1 p24', var: 'Hmot' },
      { text: 'Span \\(t = C[1 - 0.125((D - d)/C)^2]\\) (D35; the square-root form is marked incorrect); deflection t/64; D20/D21 for ≥ 2 belts, D22/D23 for one', src: 'Flat&V s39–40', step: 'defl' },
    ];

    // ---------------- examples (course cases) ----------------
    const cases = {
      mott: { mode: 'mott', P: 40, n1: 1150, n2: 590, Ks: 1.3, nd: 1, sec: '5V', D1: 10.8, P1: 23, Padd: 1.26, CDt: 32, Lstd: 125, CL: 1.0 },          // Midterm 2025 P1
      shig: { mode: 'shig', P: 60, n1: 400, n2: 400, Ks: 1.4, nd: 1, sec: 'D', D1: 26, D2: 26, CDt: 144, Lstd: 360, dFbasis: 'Ha', hpd: 16 },    // Tutorial 2 Q1
    };
    const ex = {};
    T.sections.forEach(s => s.steps.forEach(st => (st.vars || []).forEach(vr => { if (vr.kind !== 'calc') ex[vr.id] = vr.default !== undefined ? vr.default : ''; })));
    T.example = Object.assign(ex, cases[isM ? 'mott' : 'shig']);
    T._cases = cases;
    return T;
  };
})();
