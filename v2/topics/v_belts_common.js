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
// Midterm 2025 P1 [mode mott]: 40 hp, 1150 → 590 rpm, Ks 1.3, 5V, D1 10.8 (chosen), PTab 23 (course read; chart auto 22.1), ΔP 1.26 (auto 1.25),
//   CD 32, Lstd 125 → Pdes 52, D2 21.1 (auto), VR 1.954, 589 rpm, B 299.67, CD 37.10, θ1 164.0°, Cθ 0.960 (auto), CL 1.0 (auto 1.004),
//   PA 23.29, 3 belts, nfs 1.344. Course slip: the solution writes Lp = 122.9 for CD 32 (2(32)+1.57(31.9)+0.83 = 114.9) and then takes 125.
// HW1 P2 (Mott 7-20) [mott]: 40 hp 1500 → 550, Ks 1.4, 5V → Pdes 56, D1 10.2 (auto), D2 27.7 (auto), 552 rpm, CD 36 → L 133.6 → 132 (auto),
//   CD 35.16, θ1 151.2°, Cθ 0.924 (auto, course 0.92), CL 1.014 (auto, course 1.01); PTab 25.7 (course; chart auto 24.7); course omits ΔPR
//   (set 0; auto 1.63) → 23.9 hp/belt → 3 belts.
// HW1 P3a (Mott 7-19) [mott]: 5 hp 1750 → 725, Ks 1.2, 3V → 6 hp, D1 7.95 (auto), D2 18.95 (auto), 734 rpm, V 3642, PTab 10 (auto 9.94),
//   CD 24 → 91.49 → 90 (auto), CD 23.23, θ1 152.6°, Cθ 0.93 (auto 0.929), CL 1.07 (auto 1.070) → Ha 11.84 with the solution's ΔP 1.9,
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
  function fig713(P, n) {
    if (!(P > 0) || !(n >= 100)) return undefined;
    const x = 348 + 271 * Math.log10(P);
    const y = H.interp(Math.log10(n), F13Y.map(p => Math.log10(p[0])), F13Y.map(p => p[1]));
    if (y < 55) return 'refer to factory (above 9000 rpm)';
    const near = (xl, a, b) => Math.abs(x - xl) < 12 ? 'on the ' + a + '|' + b + ' line → ' + b + ' (Fizz: take the larger)' : null;
    if (y <= 165) return x <= 948 ? '3V (or 3VX)' : 'refer to factory';
    const x1 = 563 + (578 - y) / 413 * 359;
    if (x <= x1) return near(x1, '3V', '5V') || '3V (or 3VX)';
    if (y <= 268) return x <= 1118 ? (near(x1, '3V', '5V') || '5V (or 5VX)') : 'refer to factory';
    const x2 = 785 + (578 - y) / 310 * 269;
    if (x <= x2) return near(x1, '3V', '5V') || near(x2, '5V', '8V') || '5V (or 5VX)';
    return near(x2, '5V', '8V') || (x < 1190 ? '8V (or 8VX)' : 'refer to factory');
  }

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

  // ---------------- helpers ----------------
  const M = (...modes) => v => modes.includes(v.mode);
  const kL = v => v.mode === 'shig' ? Math.PI / 2 : 1.57;          // Shigley 17-16a uses π/2; Mott 7-12 / the course use 1.57 (and 6.28)
  const desig = (sec, L) => (sec && L > 0) ? (isNarrow(sec) ? sec + Math.round(L * 10) : sec + H.fmt(L)) : '';
  const f = (x, d) => H.fmt(x, d);

  return window.makeTopic_v_belts = function (book) {
    const isM = book === 'mott';
    const T = {
      id: 'v_belts', book,
      title: 'V-Belts — Design, Analysis & Installation',
      subtitle: 'Mott Ch 7-4 · Shigley 17-3 · Gates catalogue (course slides 22–42) — pick the question type first',
      sibling: isM ? 'v_belts_shigley.html' : 'v_belts_mott.html',
      intro: 'The course uses <b>three</b> V-belt methods: <b>Mott</b> to design a drive (midterm 2025 P1, HW1 P2/P3a), <b>Shigley</b> to analyse a given drive for tensions, n<sub>fs</sub> and life (Tutorial 2 Q1), and the <b>Gates catalogue</b> for the number of belts and installation tension/deflection (Tutorial 2 Q2, HW1 P3b, lecture slides 38–40). Both book pages offer all of them: choose what the question asks in step 1 and only the steps that question needs are shown, in the order the course solutions use. Yellow fields with an "auto" value are chart/table reads (digitised from the figures on the right) — check them against the chart and type your own reading. Switching the question type keeps your numbers, so a Mott design can be followed by its tensions (Shigley) or installation tension (Gates).',
      figures: [],
      assumptions: [],
      sections: [],
    };

    T.figures = [
      { id: 'table7-1', book: 'mott', ref: 'Table 7-1', title: 'V-belt service factors (driven machine × driver × hours/day)', src: 'figures/mott/table7-1.png', page: 273, note: 'Course primary table (slide 28). Factors are for speed reducers; ×1.2 for speed increasers (footnote 1). Midterm 2025: AC normal torque → textile machine, 10 h/day → 1.3.' },
      { id: 'table17-15', book: 'shigley', ref: 'Table 17-15', title: 'Suggested service factors Ks for V-belt drives', src: 'figures/shigley/table17-15.png', page: 925, note: 'Ranges by shock level and driver torque. Tutorial 2 Q1 (IC engine → medium-shock brick machine) took 1.4.' },
      { id: 'ks-hours', book: 'course', ref: 'Belt service factors (slide 35)', title: 'Course table: driven-machine class × hours/day × driver (smooth / coarse starting torque)', src: 'figures/course/belt_service_factor_hours.png', note: 'Light 1.0/1.1/1.2 | 1.1/1.2/1.3; medium 1.1/1.2/1.3 | 1.2/1.3/1.4; heavy 1.2/1.3/1.4 | 1.3/1.4/1.6; very heavy 1.3/1.4/1.5 | 1.5/1.6/1.8 (<8, <16, >16 h).' },
      { id: 'fig7-13', book: 'mott', ref: 'Figure 7-13', title: 'Narrow-section belt selection chart (design power vs speed of faster shaft)', src: 'figures/mott/fig7-13.png', page: 273, note: 'On a boundary choose the larger section (Fizz p.10).' },
      { id: 'gates-b1', book: 'course', ref: 'Gates Figure B1 (slide 32)', title: 'Gates cross-section selection chart (Super HC 3V/5V/8V and 3VX/5VX)', src: 'figures/course/gates_section_chart_b1.png', note: 'Enter with design hp (hp × service factor) and the faster-shaft rpm.' },
      { id: 'abcd', book: 'course', ref: 'Classical A–D chart (slide 27)', title: '"Recommended Nominal V-Belt Selection" for the classical A/B/C/D sections', src: 'figures/course/vbelt_selection_chart_abcd.png' },
      { id: 'table17-9', book: 'shigley', ref: 'Table 17-9', title: 'Standard V-belt sections A–E: width, thickness, minimum sheave diameter, hp range', src: 'figures/shigley/table17-9.png', page: 922 },
      { id: 'gates-b2b3', book: 'course', ref: 'Gates Tables B2/B3 (slide 33)', title: 'NEMA minimum driver-sheave diameters for electric motors (B2: Super HC 3V/5V/8V/3VX/5VX; B3: Hi-Power A–D, Tri-Power AX/BX/CX)', src: 'figures/course/gates_nema_min_sheave_b2_b3.png', note: 'Enter with the MOTOR hp and the motor-rpm column (Tutorial 2 Q2: 60 hp, 400 rpm → 575 column → 12 in; HW1 P3b: 5 hp @ 1750 → 3.0 in).' },
      { id: 'fig7-14', book: 'mott', ref: 'Figure 7-14', title: 'Power rating per belt: 3V (solid VR = 1, dashed VR ≥ 3.38)', src: 'figures/mott/fig7-14.png', page: 274, note: 'Vertical lines are the standard sheave pitch diameters.' },
      { id: 'fig7-15', book: 'mott', ref: 'Figure 7-15', title: 'Power rating per belt: 5V', src: 'figures/mott/fig7-15.png', page: 275, note: 'The printed y-axis label "10" should read 16 (gridlines every 4 hp).' },
      { id: 'fig7-16', book: 'mott', ref: 'Figure 7-16', title: 'Power rating per belt: 8V (690 / 870 / 1160 rpm)', src: 'figures/mott/fig7-16.png', page: 275, note: 'The printed y-axis labels 96/107 should read 90/100.' },
      { id: 'fig7-17', book: 'mott', ref: 'Figure 7-17', title: 'Power added vs speed ratio: 5V belts', src: 'figures/mott/fig7-17.png', page: 276, note: 'Step-wise catalogue data; nothing more is added above VR = 3.38. Slide 31: "Shigley does not include ΔP_R".' },
      { id: 'fig7-18', book: 'mott', ref: 'Figure 7-18', title: 'Angle-of-wrap correction factor Cθ', src: 'figures/mott/fig7-18.png', page: 276 },
      { id: 'fig7-19', book: 'mott', ref: 'Figure 7-19', title: 'Belt-length correction factor CL', src: 'figures/mott/fig7-19.png', page: 276 },
      { id: 'table7-2', book: 'mott', ref: 'Table 7-2', title: 'Standard belt lengths for 3V, 5V and 8V belts (in)', src: 'figures/mott/table7-2.png', page: 277 },
      { id: 'fig7-4', book: 'mott', ref: 'Figure 7-4', title: 'Belt drive geometry: wrap angles, span, centre distance', src: 'figures/mott/fig7-4.png', page: 265 },
      { id: 'table17-10', book: 'shigley', ref: 'Table 17-10', title: 'Inside circumferences of standard V belts (A–E)', src: 'figures/shigley/table17-10.png', page: 922 },
      { id: 'table17-11', book: 'shigley', ref: 'Table 17-11', title: 'Length conversion: pitch length = inside circumference + quantity', src: 'figures/shigley/table17-11.png', page: 922 },
      { id: 'fig17-1', book: 'shigley', ref: 'Figure 17-1', title: 'Open-belt geometry: wrap angles and length', src: 'figures/shigley/fig17-1.png', page: 904 },
      { id: 'table17-12', book: 'shigley', ref: 'Table 17-12', title: 'Horsepower ratings of standard V belts (Htab vs sheave pitch diameter and belt speed)', src: 'figures/shigley/table17-12.png', page: 924, note: 'Interpolate on belt speed; the last row of each section applies to all larger sheaves ("and up").' },
      { id: 'table17-13', book: 'shigley', ref: 'Table 17-13', title: 'Angle-of-wrap correction factor K1', src: 'figures/shigley/table17-13.png', page: 925, note: 'VV column fit: K1 = 0.143543 + 0.007468φ − 0.000015052φ² (φ in degrees).' },
      { id: 'table17-14', book: 'shigley', ref: 'Table 17-14', title: 'Belt-length correction factor K2', src: 'figures/shigley/table17-14.png', page: 925, note: 'Enter with the nominal (inside) length, e.g. B112 → 1.05, D360 → 1.10.' },
      { id: 'gates-b10', book: 'course', ref: 'Gates Table B10 (slide 34)', title: 'Gates 3VX horsepower per belt + additional hp for speed ratio', src: 'figures/course/gates_3vx_power_rating_table_b10.png', note: 'Lecture example: 6.0 in @ 1750 rpm → 7.68 hp; VR ≈ 3 → +0.25 hp.' },
      { id: 'gates-b4', book: 'course', ref: 'Gates Table B4 (slide 36)', title: 'Gates belt lengths (3VX800 = 80.0 in, 3V400 = 40.0 in …)', src: 'figures/course/gates_belt_sizes_table_b4.png' },
      { id: 'gates-b6', book: 'course', ref: 'Gates Table B6 (slide 37)', title: 'Gates 3V/3VX drive table: sheave pair × belt → centre distance, colour key = hp correction factor', src: 'figures/course/gates_3v_centre_distance_table_b6.png', note: 'The hp correction combines the wrap AND length corrections (Cθ·CL or K1·K2).' },
      { id: 'gates-ex', book: 'course', ref: 'Lecture example (slide 38)', title: 'Worked 3VX800 example: 6 / 19 in sheaves, 1750 rpm, 2 hp', src: 'figures/course/gates_3vx_example_slide38.png' },
      { id: 'table17-16', book: 'shigley', ref: 'Table 17-16', title: 'V-belt parameters Kb (bending) and Kc (centrifugal)', src: 'figures/shigley/table17-16.png', page: 926 },
      { id: 'fig17-14', book: 'shigley', ref: 'Figure 17-14', title: 'V-belt tensions around the drive (F1, F2, Fi, Fc, Fb, T1, T2)', src: 'figures/shigley/fig17-14.png', page: 926 },
      { id: 'table17-17', book: 'shigley', ref: 'Table 17-17', title: 'Durability parameters K and b (belt life)', src: 'figures/shigley/table17-17.png', page: 927, note: 'Valid for 10^8–10^9 force peaks (3V/5V/8V also 10^9–10^10). Above 10^9 report "NP > 10^9".' },
      { id: 'gates-d19', book: 'course', ref: 'Gates D19, D26, D27, D35 (slide 39)', title: 'Static tension per strand Tst, arc factor Kφ, constants M and Y, span length t', src: 'figures/course/gates_tension_formula_d19.png', note: 'Use the MOTOR (nominal) hp in D19. The square-root span formula on the Gates page is marked "incorrect" — use D35.' },
      { id: 'gates-d20', book: 'course', ref: 'Gates D20–D23 (slide 40)', title: 'Minimum / maximum force to deflect one belt 1/64 in per inch of span', src: 'figures/course/gates_deflection_formula_d20_d23.png' },
    ];

    const modeOpts = [
      { value: 'mott', label: 'Design a new drive — Mott (service factor → section → sheaves → length & CD → number of belts, n<sub>fs</sub>)' },
      { value: 'gates', label: 'Design with the Gates catalogue (+ belt tensions and installation tension / deflection)' },
      { value: 'shig', label: 'Analyse a given drive — Shigley (H<sub>a</sub>, number of belts, F<sub>1</sub>, F<sub>2</sub>, F<sub>i</sub>, n<sub>fs</sub>, life)' },
      { value: 'rate', label: 'Power capacity of an existing drive — Mott charts (allowable hp, belts needed, n<sub>fs</sub>, max motor hp)' },
      { value: 'tension', label: 'Installation tension & deflection only (Gates D19–D23)' },
      { value: 'geom', label: 'Geometry only: belt length ↔ centre distance, wrap angles, speeds' },
    ];
    const MODE_INFO = {
      mott: 'Course solutions: Midterm 2025 P1, HW1 P2 (Mott 7-20), HW1 P3a (Mott 7-19); Mott Example 7-2. Order: Ks → P<sub>des</sub> → Fig 7-13 section → D<sub>1</sub> for ≈4000 ft/min → standard D<sub>2</sub> → P<sub>Tab</sub> + ΔP<sub>R</sub> → trial CD → L → Table 7-2 → actual CD → θ<sub>1</sub>, C<sub>θ</sub>, C<sub>L</sub> → belts, n<sub>fs</sub>.',
      gates: 'Course solutions: Tutorial 2 Q2, HW1 P3b, lecture slides 38–40. Order: Ks (Gates Table B1) → design hp → Fig B1 section → NEMA minimum sheave (B2/B3) → sheaves + belt from the drive table (CD) → hp correction × (H<sub>tab</sub> + ΔP) → belts, n<sub>fs</sub> → F<sub>1</sub>, F<sub>2</sub>, F<sub>i</sub> (Shigley eqs) → T<sub>st</sub> (D19) → span, deflection and force (D35, D20–D23).',
      shig: 'Course solutions: Tutorial 2 Q1 (Shigley 17-19); Shigley Example 17-4. Order (slide 42): geometry (L<sub>p</sub>, C, φ, V) → H<sub>d</sub>, H<sub>a</sub> = K<sub>1</sub>K<sub>2</sub>H<sub>tab</sub> → N<sub>b</sub> → F<sub>c</sub>, ΔF, F<sub>1</sub>, F<sub>2</sub>, F<sub>i</sub> → n<sub>fs</sub> → life (passes, hours, years).',
      rate: 'Exam variant ("what power can this drive carry?", "how many belts does it need?", "what happens if the speed / CD changes?"). Type the given section, sheaves, belt length (or CD) and number of belts; the answer is the allowable power N<sub>b</sub>P<sub>A</sub> and the largest motor power N<sub>b</sub>P<sub>A</sub>/(K<sub>s</sub>n<sub>d</sub>).',
      tension: 'Lecture slides 39–40 (and part (c) of Tutorial 2 Q2 / HW1 P3b): section → M, Y (Table D27); sheaves, belt or CD, speed → (D − d)/C → K<sub>φ</sub> (Table D26) → T<sub>st</sub> (D19, motor hp) → span t (D35) → deflection t/64 → force range (D20/D21 for ≥ 2 belts, D22/D23 for one belt).',
      geom: 'Speeds (VR, output rpm, belt speed), L for a chosen CD (Mott 7-12 / Shigley 17-16a), CD for a stocked belt (Mott 7-13 / Shigley 17-16b), wrap angles (7-14 / 17-1) and the course limits (V 1000–5000 ft/min, ratio ≤ 6, θ<sub>1</sub> > 120°, D<sub>2</sub> < CD < 3(D<sub>1</sub> + D<sub>2</sub>)).',
    };

    // ---------------- result line ----------------
    function answer(v) {
      const m = v.mode; const out = [];
      const dz = desig(v.sec, v.Lstd);
      const sheaves = H.has(v, 'D1', 'D2') ? f(v.D1) + ' in / ' + f(v.D2) + ' in sheaves' : 'sheaves ?';
      const ok = x => x ? '<span class="result-ok">ANSWER</span> — ' : '<span class="result-bad">CHECK</span> — ';
      if (m === 'mott' || m === 'gates' || m === 'shig') {
        if (!H.has(v, 'Nb', 'nfs')) return '';
        out.push(ok(v.nfs >= 1) + 'Use <b>' + v.Nb + ' × ' + (dz || v.sec || '?') + '</b> belts' + (H.has(v, 'Lstd') ? ' (' + f(v.Lstd) + ' in)' : '') + ' on ' + sheaves + (H.has(v, 'CD') ? ' at CD = <b>' + f(v.CD) + ' in</b>' : '') + ' — n<sub>fs</sub> = <b>' + f(v.nfs, 3) + '</b>.');
        out.push('Design power ' + f(v.Pdes) + ' hp (K<sub>s</sub> = ' + f(v.Ks) + '); ' + f(v.Pbelt) + ' hp per belt; actual VR ' + f(v.VR) + ', output ' + f(v.n2a) + ' rpm, belt speed ' + f(v.vb) + ' ft/min, θ<sub>1</sub> = ' + f(v.th1) + '°.');
        if ((m === 'shig' || m === 'gates') && H.has(v, 'F1', 'F2', 'Fi')) out.push('Per belt: F<sub>1</sub> = ' + f(v.F1) + ' lbf, F<sub>2</sub> = ' + f(v.F2) + ' lbf, F<sub>i</sub> = ' + f(v.Fi) + ' lbf (F<sub>c</sub> = ' + f(v.Fc) + ' lbf).');
        if (m === 'shig' && H.has(v, 'NP', 'thr')) out.push('Life: N<sub>P</sub> ' + (v.NP > 1e9 ? '> 10^9 passes, t > ' : '= ' + f(v.NP, 3) + ' passes, t = ') + f(v.thr) + ' h' + (H.has(v, 'yrs') ? ' (' + f(v.yrs, 3) + ' years at ' + f(v.hpd) + ' h/day)' : '') + '.');
        if (m === 'gates' && H.has(v, 'Tst', 'Fmin', 'Fmax')) out.push('Installation: T<sub>st</sub> = <b>' + f(v.Tst) + ' lbf</b> per strand; a mid-span force of <b>' + f(v.Fmin, 3) + '–' + f(v.Fmax, 3) + ' lbf</b> should deflect one belt ' + f(v.defl, 3) + ' in (span ' + f(v.tspan) + ' in).');
      } else if (m === 'rate') {
        if (!H.has(v, 'Pcap', 'Nb')) return '';
        out.push('<span class="result-ok">ANSWER</span> — ' + v.Nb + ' × ' + (dz || v.sec || '?') + ' on ' + sheaves + (H.has(v, 'CD') ? ', CD ' + f(v.CD) + ' in' : '') + ' can carry <b>' + f(v.Pcap) + ' hp</b> of design power (' + f(v.Pbelt) + ' hp/belt)' + (H.has(v, 'Pmax') ? ' → largest motor power <b>' + f(v.Pmax) + ' hp</b> at K<sub>s</sub> = ' + f(v.Ks) + ', n<sub>d</sub> = ' + f(v.nd) : '') + '.');
        if (H.has(v, 'Pdes', 'nfs')) out.push('For ' + f(v.P) + ' hp: design power ' + f(v.Pdes) + ' hp → needs ' + Math.ceil(v.Nreq - 1e-9) + ' belt(s); with ' + v.Nb + ': n<sub>fs</sub> = <b>' + f(v.nfs, 3) + '</b> ' + (v.nfs >= 1 ? '(OK)' : '(<span class="result-bad">overloaded</span>)') + '.');
      } else if (m === 'tension') {
        if (!H.has(v, 'Tst', 'Fmin', 'Fmax')) return '';
        out.push('<span class="result-ok">ANSWER</span> — tension each strand to <b>T<sub>st</sub> = ' + f(v.Tst) + ' lbf</b>: a force of <b>' + f(v.Fmin, 3) + '–' + f(v.Fmax, 3) + ' lbf</b> at mid-span should deflect one belt <b>' + f(v.defl, 3) + ' in</b> (span t = ' + f(v.tspan) + ' in, ' + (v.Ng >= 2 ? 'D20/D21' : 'single belt D22/D23') + ').');
      } else if (m === 'geom') {
        if (!H.has(v, 'D1', 'D2')) return '';
        out.push('<span class="result-ok">ANSWER</span> — VR = ' + f(v.VR) + (H.has(v, 'n2a') ? ', output ' + f(v.n2a) + ' rpm' : '') + (H.has(v, 'vb') ? ', belt speed ' + f(v.vb) + ' ft/min' : '') + (H.has(v, 'Lreq') ? '; for CD = ' + f(v.CDt) + ' in the belt must be L = ' + f(v.Lreq) + ' in' : '') + (H.has(v, 'CD') ? '; with the ' + (dz || f(v.Lstd) + ' in') + ' belt CD = <b>' + f(v.CD) + ' in</b>, θ<sub>1</sub> = ' + f(v.th1) + '°, θ<sub>2</sub> = ' + f(v.th2) + '°' : '') + '.');
      }
      return out.join('<br>');
    }

    T.sections = [
      { title: 'What does the question ask?', steps: [
        { id: 'mode', title: 'Choose the question type',
          text: 'Pick the method the question names (Mott / Gates manual / Shigley) or the quantity it asks for. Inputs the question gives are white; yellow fields are chart or table reads (an "auto" grey value is pre-filled and can be overwritten).',
          vars: [
            { id: 'mode', label: 'Question type', kind: 'choice', type: 'text', options: modeOpts, default: isM ? 'mott' : 'shig' },
          ],
          after: v => MODE_INFO[v.mode] ? '<span style="color:#475569">' + MODE_INFO[v.mode] + '</span>' : '' },
      ] },

      { title: 'Problem data', steps: [
        { id: 'in', title: 'Power and speeds', formula: 'VR = \\frac{n_1}{n_2}\\quad (n_1 = \\text{faster shaft})',
          text: 'The faster (driving) shaft is n<sub>1</sub>; for a speed reducer the small sheave is on it. n<sub>2</sub> is the desired (nominal) output speed — leave blank if the driven sheave is given.',
          vars: [
            { id: 'P', symbol: 'P', label: 'Nominal (motor) power', unit: 'hp', kind: 'input', hint: 'rated power of the prime mover — not needed for geometry only' },
            { id: 'n1', symbol: 'n_1', label: 'Speed of the faster (driver) shaft', unit: 'rpm', kind: 'input' },
            { id: 'n2', symbol: 'n_2', label: 'Desired output speed (nominal)', unit: 'rpm', kind: 'input', hint: 'mid-point if a range is given' },
            { id: 'VRn', symbol: 'VR_{nom}', label: 'Nominal speed ratio n1/n2', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'n1', 'n2') ? v.n1 / v.n2 : undefined,
              check: v => !H.has(v, 'VRn') ? null : v.VRn < 1 ? 'n2 > n1: speed INCREASER — Table 7-1 factors × 1.2 (footnote 1)' : v.VRn > 7 ? 'Ratio above 7:1 — beyond the cogged-belt limit (slide 25)' : v.VRn > 6 ? 'Ratio above 6:1 — only cogged belts (≤ 7:1) (slide 25)' : null },
          ] },
        { id: 'sf', title: 'Service factor and design power', when: M('mott', 'gates', 'shig', 'rate'), fig: ['table7-1', 'table17-15', 'ks-hours'], eq: isM ? 'Mott Table 7-1' : '17-19',
          formula: 'P_{des} = H_d = P\\,K_s\\,n_d',
          text: 'Always multiply the nominal power by the service factor first (slide 28/41). Mott Table 7-1 is the course\'s primary table (driven-machine row × driver column × hours/day); Gates questions use Gates Table B1 (Tutorial 2 Q2: multi-cylinder engine, brick machine, > 10 h → 1.5; HW1 P3b: AC motor, fan, 22 h → 1.3); the course also gives its own hours table (slide 35) and accepts the Shigley Table 17-15 range (midterm: "1.2 < K<sub>s</sub> < 1.4").',
          vars: [
            { id: 'Ks', symbol: 'K_s', label: 'Service factor', unit: '', kind: 'lookup', fig: isM ? 'table7-1' : 'table17-15', default: 1.3,
              hint: 'Midterm 1.3 · HW1 P2 1.4 · HW1 P3a 1.2 · Tut 2 Q1 1.4 · Gates: Tut 2 Q2 1.5, HW1 P3b 1.3',
              check: v => H.has(v, 'Ks') && (v.Ks < 1 || v.Ks > 2.4) ? 'Service factors are 1.0–2.0 (× 1.2 for a speed increaser)' : null },
            { id: 'nd', symbol: 'n_d', label: 'Design factor', unit: '', kind: 'input', default: 1.0, hint: 'course: n_d = 1.0 unless the problem states one' },
            { id: 'Pdes', symbol: 'P_{des}', label: 'Design power', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'P', 'Ks') ? v.P * v.Ks * (H.has(v, 'nd') ? v.nd : 1) : undefined,
              work: v => H.has(v, 'Pdes') ? '\\(P_{des} = ' + f(v.P) + '(' + f(v.Ks) + ')(' + f(H.has(v, 'nd') ? v.nd : 1) + ') = ' + f(v.Pdes) + '\\ \\text{hp}\\)' : null },
          ] },
        { id: 'sec', title: 'Belt cross-section', fig: ['fig7-13', 'gates-b1', 'table17-9', 'abcd'],
          text: 'Narrow sections 3V/5V/8V (Mott Fig 7-13, Gates Fig B1; 3VX/5VX are the cogged Gates versions) or the classical A–E sections (Shigley Table 17-9 hp ranges, course chart slide 27). Enter the chart with the <b>design</b> power and the faster-shaft speed; on a boundary take the larger section. For the Gates tension step the section also sets M and Y (3V = Super HC PowerBand row as in HW1 P3b; C = Hi-Power CP as in Tutorial 2 Q2).',
          vars: [
            { id: 'sec', label: 'Belt section', kind: 'choice', type: 'text', options: [
              { value: '3V', label: '3V — narrow (Mott Fig 7-14)' }, { value: '5V', label: '5V — narrow (Mott Fig 7-15, 7-17)' }, { value: '8V', label: '8V — narrow (Mott Fig 7-16)' },
              { value: '3VX', label: '3VX — Gates cogged narrow' }, { value: '5VX', label: '5VX — Gates cogged narrow' },
              { value: 'A', label: 'A — classical (Shigley Table 17-12)' }, { value: 'B', label: 'B — classical' }, { value: 'C', label: 'C — classical / Gates Hi-Power CP' }, { value: 'D', label: 'D — classical' }, { value: 'E', label: 'E — classical' },
              { value: 'AX', label: 'AX — Gates Tri-Power cogged' }, { value: 'BX', label: 'BX — Gates Tri-Power cogged' }, { value: 'CX', label: 'CX — Gates Tri-Power cogged' }],
              check: v => (M('mott', 'rate')(v) && v.sec && !PTAB[v.sec]) ? 'Mott\'s rating charts cover 3V, 5V and 8V only — use the Gates (3VX/5VX/AX…) or Shigley (A–E) question type' : null },
            { id: 'secHint', symbol: '', label: 'Chart suggestion for P_des and n_1', unit: '', kind: 'calc',
              compute: v => {
                if (!H.has(v, 'Pdes', 'n1')) return undefined;
                if (v.mode === 'shig' || isClassic(v.sec)) { const ok = Object.keys(SEC).filter(s => SEC[s].hp && v.Pdes >= SEC[s].hp[0] && v.Pdes <= SEC[s].hp[1]); return (ok.length ? ok.join(' or ') : '—') + ' (Table 17-9 hp range); narrow: ' + fig713(v.Pdes, v.n1); }
                return fig713(v.Pdes, v.n1) + ' (Fig 7-13)';
              } },
          ] },
      ] },

      { title: 'Sheaves and speeds', steps: [
        { id: 'd1', title: 'Driver sheave for ≈ 4000 ft/min (limit 5000 ft/min)', when: M('mott'), eq: 'Mott 7-2', fig: ['fig7-14', 'fig7-15', 'fig7-16'],
          formula: 'D_1 = \\frac{12\\,v_b}{\\pi n_1},\\qquad D_{1,max} = \\frac{12(5000)}{\\pi n_1}',
          text: 'Size the driver for the target belt speed (4000 ft/min), then pick a standard pitch diameter from the vertical lines of Fig 7-14/15/16 (next step). Smaller trial sizes are fine as long as the output speed is close — Mott Table 7-3 lists trials; the midterm worked from V &lt; 5000 (D ≤ 16.6 in) and chose 10.8 in.',
          vars: [
            { id: 'Vt', symbol: 'v_{b,target}', label: 'Target belt speed', unit: 'ft/min', kind: 'input', default: 4000, hint: 'Fizz p.11, Mech p.20, slide 25' },
            { id: 'D1calc', symbol: 'D_{1,calc}', label: 'Driver diameter for the target speed', unit: 'in', kind: 'calc', compute: v => H.has(v, 'n1', 'Vt') ? 12 * v.Vt / (Math.PI * v.n1) : undefined,
              work: v => H.has(v, 'D1calc') ? '\\(D_1 = \\frac{12(' + f(v.Vt) + ')}{\\pi(' + f(v.n1) + ')} = ' + f(v.D1calc) + '\\ \\text{in}\\)' : null },
            { id: 'D1max', symbol: 'D_{1,max}', label: 'Largest driver for 5000 ft/min', unit: 'in', kind: 'calc', compute: v => H.has(v, 'n1') ? 60000 / (Math.PI * v.n1) : undefined },
          ] },
        { id: 'nema', title: 'Gates: minimum driver sheave (NEMA Table B2 / B3)', when: M('gates'), fig: ['gates-b2b3', 'gates-b1'],
          text: 'Motors need a minimum sheave to limit the belt pull on their bearings. Use the <b>motor</b> hp row (next larger) and the motor-rpm column nearest n<sub>1</sub> — Table B2 for Super HC narrow belts, B3 for Hi-Power/Tri-Power classical belts. Then choose a stock sheave at least this large from the Gates drive table.',
          vars: [
            { id: 'dminN', symbol: 'd_{min}', label: 'NEMA minimum driver sheave', unit: 'in', kind: 'lookup', fig: 'gates-b2b3', auto: v => nema(v.sec, v.P, v.n1), hint: 'auto = Table B2/B3 at motor hp and nearest rpm column' },
          ] },
        { id: 'sheave', title: 'Sheaves: standard sizes, actual ratio and speeds', when: v => true, fig: ['fig7-14', 'fig7-15', 'fig7-16', 'table17-9', 'gates-b6'],
          formula: 'D_2 \\approx D_1\\,VR_{nom},\\quad VR = \\frac{D_2}{D_1},\\quad n_{2} = \\frac{n_1}{VR},\\quad v_b = \\frac{\\pi D_1 n_1}{12}',
          text: 'Type the sheaves the problem gives. Otherwise: Mott — the closest standard size for D<sub>1</sub> and for D<sub>2</sub> = D<sub>1</sub>·VR (the course solutions take the closest size: 21.1, 27.7, 18.95 in; slide 29 says "round up"); Gates — a stock sheave ≥ the NEMA minimum from the drive table. Course limits: 1000 &lt; v<sub>b</sub> &lt; 5000 ft/min (6500 absolute), output within a few % of the target.',
          vars: [
            { id: 'dminS', symbol: 'd_{min}', label: 'Minimum sheave for the section', unit: 'in', kind: 'lookup', fig: 'table17-9', auto: v => sd(v) ? sd(v).dmin : undefined, hint: 'Table 17-9 (A–E) / Table 17-17 (3V 2.65, 5V 7.1, 8V 12.5)' },
            { id: 'D1', symbol: 'D_1', label: 'Driver (small) sheave pitch diameter', unit: 'in', kind: 'lookup', fig: isM ? 'fig7-15' : 'table17-12',
              auto: v => v.mode === 'gates' ? v.dminN : !H.has(v, 'D1calc') ? undefined : SHEAVES[base(v.sec)] ? nearest(v.D1calc, SHEAVES[base(v.sec)]) : Math.round(v.D1calc * 10) / 10,
              hint: 'auto = standard size nearest the 4000 ft/min value (Gates: the NEMA minimum) — type the sheave the problem gives',
              check: v => H.has(v, 'D1', 'dminS') && v.D1 < v.dminS - 1e-9 ? 'Below the minimum sheave diameter for this section' : (v.mode === 'gates' && H.has(v, 'D1', 'dminN') && v.D1 < v.dminN - 1e-9) ? 'Below the NEMA minimum for this motor' : null },
            { id: 'D2calc', symbol: 'D_1 VR_{nom}', label: 'Ideal driven sheave', unit: 'in', kind: 'calc', compute: v => H.has(v, 'D1', 'VRn') ? v.D1 * v.VRn : undefined },
            { id: 'D2', symbol: 'D_2', label: 'Driven (large) sheave pitch diameter', unit: 'in', kind: 'lookup', fig: isM ? 'fig7-15' : 'table17-12',
              auto: v => !H.has(v, 'D2calc') ? undefined : (v.mode !== 'gates' && SHEAVES[base(v.sec)]) ? nearest(v.D2calc, SHEAVES[base(v.sec)]) : Math.round(v.D2calc * 100) / 100,
              hint: 'Mott auto = closest standard size (other standard sizes are listed on the figure)' },
            { id: 'VR', symbol: 'VR', label: 'Actual speed ratio D2/D1', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'D1', 'D2') ? v.D2 / v.D1 : undefined,
              check: v => H.has(v, 'VR') && v.VR > 6 ? 'VR > 6 (7 for cogged belts) — slide 25' : null },
            { id: 'n2a', symbol: 'n_{2,act}', label: 'Actual output speed', unit: 'rpm', kind: 'calc', compute: v => H.has(v, 'n1', 'VR') ? v.n1 / v.VR : undefined,
              work: v => H.has(v, 'n2a') ? '\\(n_2 = ' + f(v.n1) + '\\,\\frac{' + f(v.D1) + '}{' + f(v.D2) + '} = ' + f(v.n2a) + '\\ \\text{rpm}\\)' : null,
              check: v => H.has(v, 'n2a', 'n2') && Math.abs(v.n2a / v.n2 - 1) > 0.05 ? 'More than 5 % from the nominal output speed — try another sheave pair (calculator check)' : null },
            { id: 'vb', symbol: 'v_b', label: 'Belt speed', unit: 'ft/min', kind: 'calc', compute: v => H.has(v, 'D1', 'n1') ? Math.PI * v.D1 * v.n1 / 12 : undefined,
              work: v => H.has(v, 'vb') ? '\\(v_b = \\frac{\\pi(' + f(v.D1) + ')(' + f(v.n1) + ')}{12} = ' + f(v.vb) + '\\ \\text{ft/min}\\)' : null,
              check: v => !H.has(v, 'vb') ? null : v.vb > 6500 ? 'Above the 6500 ft/min absolute maximum' : v.vb > 5000 ? 'Above 5000 ft/min — course limit (consult the sheave supplier)' : v.vb < 1000 ? 'Below 1000 ft/min — consider a chain, gear or timing belt (Mott p.255)' : null },
          ] },
      ] },

      { title: 'Rated power per belt (Mott)', steps: [
        { id: 'prate', title: 'Basic rating P_Tab and power added for speed ratio ΔP_R', when: M('mott', 'rate'), fig: ['fig7-14', 'fig7-15', 'fig7-16', 'fig7-17'],
          formula: 'P_{rated} = P_{Tab} + \\Delta P_R',
          text: 'Read the <b>solid</b> curve (VR = 1) at D<sub>1</sub> and n<sub>1</sub>, interpolating between the rpm curves (midterm: 10.8 in at 1160 rpm → 23 hp). 5V: ΔP<sub>R</sub> from the steps of Fig 7-17 (midterm 1.26, Mott Ex 7-2 1.15). 3V/8V: the dashed curve is the rating at VR ≥ 3.38, so ΔP<sub>R</sub> is part of the dashed − solid gap (Mott: "a rough interpolation between the two curves"; Mech p.23 interpolates linearly in VR). The auto value applies the Fig 7-17 step pattern to that gap.',
          vars: [
            { id: 'P1', symbol: 'P_{Tab}', label: 'Basic rated power per belt (solid curve)', unit: 'hp', kind: 'lookup', fig: 'fig7-15', auto: v => chartP(v.sec, v.D1, v.n1), hint: 'auto = digitised solid curve, linear in rpm between curves — check your chart reading' },
            { id: 'Padd', symbol: '\\Delta P_R', label: 'Power added for speed ratio', unit: 'hp', kind: 'lookup', fig: 'fig7-17', auto: v => dPR(v.sec, v.n1, v.VR), hint: 'Fig 7-17 (5V); 3V/8V: share of the dashed − solid gap' },
            { id: 'Prated', symbol: 'P_{rated}', label: 'Rated power per belt', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'P1', 'Padd') ? v.P1 + v.Padd : undefined,
              work: v => H.has(v, 'Prated') ? '\\(P_{rated} = ' + f(v.P1) + ' + ' + f(v.Padd) + ' = ' + f(v.Prated) + '\\ \\text{hp}\\)' : null },
          ] },
      ] },

      { title: 'Belt length and centre distance', steps: [
        { id: 'trial', title: 'Trial centre distance → required belt length', when: M('mott', 'gates', 'shig', 'rate', 'geom'), fig: ['fig7-4', 'fig17-1'], eq: 'Mott 7-12, 7-17 · Shigley 17-16a',
          formula: 'D_2 < CD < 3(D_2 + D_1),\\qquad L = 2\\,CD + 1.57(D_2 + D_1) + \\frac{(D_2 - D_1)^2}{4\\,CD}',
          text: 'Use the centre distance the problem gives (midterm 32 in, Tutorial 2 "about 12 ft" = 144 in); otherwise choose one in the range — Mech: "try being closer to D". Skip this step if the belt itself is given (type it in the next step).',
          vars: [
            { id: 'CDt', symbol: 'CD_{trial}', label: 'Trial (nominal) centre distance', unit: 'in', kind: 'input', auto: v => H.has(v, 'D2', 'D1') ? Math.ceil(1.15 * Math.max(v.D2, v.D1)) : undefined, hint: 'auto = 1.15·D2 rounded up (a calculator choice near the lower limit) — type the CD the problem gives',
              check: v => H.has(v, 'CDt', 'D1', 'D2') && (v.CDt <= v.D2 || v.CDt >= 3 * (v.D1 + v.D2)) ? 'Outside the recommended D2 < CD < 3(D2 + D1) (Mott Eq 7-17) — acceptable only if the problem fixes the CD (Tutorial 2: 12 ft)' : null },
            { id: 'CDlo', symbol: 'D_2', label: 'Lower limit', unit: 'in', kind: 'calc', compute: v => H.has(v, 'D2') ? v.D2 : undefined },
            { id: 'CDhi', symbol: '3(D_1+D_2)', label: 'Upper limit', unit: 'in', kind: 'calc', compute: v => H.has(v, 'D1', 'D2') ? 3 * (v.D1 + v.D2) : undefined },
            { id: 'Lreq', symbol: 'L', label: 'Required belt (pitch) length', unit: 'in', kind: 'calc', compute: v => H.has(v, 'CDt', 'D1', 'D2') ? 2 * v.CDt + kL(v) * (v.D1 + v.D2) + (v.D2 - v.D1) ** 2 / (4 * v.CDt) : undefined,
              work: v => H.has(v, 'Lreq') ? '\\(L = 2(' + f(v.CDt) + ') + ' + (v.mode === 'shig' ? '\\tfrac{\\pi}{2}' : '1.57') + '(' + f(v.D2) + ' + ' + f(v.D1) + ') + \\frac{(' + f(v.D2) + ' - ' + f(v.D1) + ')^2}{4(' + f(v.CDt) + ')} = ' + f(v.Lreq) + '\\ \\text{in}\\)' : null },
          ] },
        { id: 'belt', title: 'Standard belt → actual centre distance and wrap angles', when: v => true, fig: ['table7-2', 'table17-10', 'table17-11', 'gates-b4'], eq: 'Mott 7-13, 7-14 · Shigley 17-16b, 17-1',
          formula: 'L_p = L + L_c,\\quad B = 4L_p - 6.28(D_2 + D_1),\\quad CD = \\frac{B + \\sqrt{B^2 - 32(D_2 - D_1)^2}}{16},\\quad \\theta_{1,2} = 180^\\circ \\mp 2\\sin^{-1}\\frac{D_2 - D_1}{2\\,CD}',
          text: 'Standard length: Mott Table 7-2 for 3V/5V/8V (the length is the pitch length, L<sub>c</sub> = 0), Shigley Table 17-10 for A–E (inside circumference; add L<sub>c</sub> from Table 17-11 to get L<sub>p</sub>), or the number in the Gates belt name (3V400 = 40.0 in, 3VX800 = 80.0 in, CP330 = 330 in). The guides take the closest length; the course accepts either neighbour. Shigley\'s Eq 17-16b is the same equation written with π/2. Wrap on the small sheave must exceed 120°.',
          vars: [
            { id: 'Lc', symbol: 'L_c', label: 'Length conversion (Table 17-11)', unit: 'in', kind: 'lookup', fig: 'table17-11', auto: v => (sd(v) && v.mode !== 'gates') ? sd(v).conv : (v.sec ? 0 : undefined), hint: 'A 1.3, B 1.8, C 2.9, D 3.3, E 4.5; 0 for 3V/5V/8V and Gates belt numbers' },
            { id: 'Lstd', symbol: 'L', label: 'Standard belt length (belt number)', unit: 'in', kind: 'lookup', fig: isM ? 'table7-2' : 'table17-10',
              auto: v => { const t = LENG[base(v.sec)]; return (t && H.has(v, 'Lreq')) ? nearest(v.Lreq - (H.has(v, 'Lc') ? v.Lc : 0), t) : undefined; },
              hint: 'auto = closest standard length; belt name = section + length (5V1250, B112, D360)' },
            { id: 'Lp', symbol: 'L_p', label: 'Pitch length', unit: 'in', kind: 'calc', compute: v => H.has(v, 'Lstd') ? v.Lstd + (H.has(v, 'Lc') ? v.Lc : 0) : undefined },
            { id: 'B', symbol: 'B', label: 'B = 4L_p − 6.28(D_2 + D_1)', unit: 'in', kind: 'calc', compute: v => H.has(v, 'Lp', 'D1', 'D2') ? 4 * v.Lp - 4 * kL(v) * (v.D1 + v.D2) : undefined },
            { id: 'CD', symbol: 'CD', label: 'Actual centre distance', unit: 'in', kind: 'calc', compute: v => { if (!H.has(v, 'B', 'D1', 'D2')) return undefined; const r = v.B * v.B - 32 * (v.D2 - v.D1) ** 2; return r >= 0 ? (v.B + Math.sqrt(r)) / 16 : undefined; },
              work: v => H.has(v, 'CD') ? '\\(B = 4(' + f(v.Lp) + ') - ' + (v.mode === 'shig' ? '2\\pi' : '6.28') + '(' + f(v.D2) + ' + ' + f(v.D1) + ') = ' + f(v.B) + ',\\quad CD = \\frac{' + f(v.B) + ' + \\sqrt{' + f(v.B) + '^2 - 32(' + f(v.D2) + ' - ' + f(v.D1) + ')^2}}{16} = ' + f(v.CD) + '\\ \\text{in}\\)' : null,
              check: v => H.has(v, 'CD', 'D1', 'D2') && (v.CD <= v.D2 || v.CD >= 3 * (v.D1 + v.D2)) ? 'Actual CD outside the recommended D2 < CD < 3(D2 + D1)' : null },
            { id: 'th1', symbol: '\\theta_1', label: 'Wrap angle on the small sheave', unit: '°', kind: 'calc', compute: v => H.has(v, 'D1', 'D2', 'CD') ? 180 - 2 * H.deg(Math.asin(Math.abs(v.D2 - v.D1) / (2 * v.CD))) : undefined,
              work: v => H.has(v, 'th1') ? '\\(\\theta_1 = 180^\\circ - 2\\sin^{-1}\\frac{' + f(v.D2) + ' - ' + f(v.D1) + '}{2(' + f(v.CD) + ')} = ' + f(v.th1) + '^\\circ = ' + f(H.rad(v.th1)) + '\\ \\text{rad}\\)' : null,
              check: v => H.has(v, 'th1') && v.th1 < 120 ? 'θ1 < 120° — increase the centre distance or use an idler (slide 25)' : null },
            { id: 'th2', symbol: '\\theta_2', label: 'Wrap angle on the large sheave', unit: '°', kind: 'calc', compute: v => H.has(v, 'th1') ? 360 - v.th1 : undefined },
          ],
          after: v => {
            const t = LENG[base(v.sec)]; if (!t || !H.has(v, 'Lstd', 'Lreq') || v.mode === 'gates') return '';
            const x = v.Lreq - (H.has(v, 'Lc') ? v.Lc : 0); const lo = t.filter(a => a <= x).pop(), hi = t.find(a => a >= x);
            return (v.Lstd !== lo && v.Lstd !== hi) ? '<span style="color:#92400e">Note: ' + f(v.Lstd) + ' in is not next to the required ' + f(x) + ' in (neighbours ' + (lo || '—') + ' / ' + (hi || '—') + ') — fine only if a longer/shorter CD is wanted. (Midterm 2025: the solution wrote L = 122.9 in for CD = 32 in — the sum is 114.9 — and took 125 in.)</span>' : '';
          } },
      ] },

      { title: 'Allowable power per belt', steps: [
        { id: 'mcorr', title: 'Mott: wrap and length corrections → P_A', when: M('mott', 'rate'), fig: ['fig7-18', 'fig7-19'],
          formula: 'P_A = C_\\theta\\,C_L\\,(P_{Tab} + \\Delta P_R)',
          text: 'C<sub>θ</sub> from Fig 7-18 at θ<sub>1</sub>; C<sub>L</sub> from Fig 7-19 at the standard length for the section (midterm 164° → 0.96, 5V 125 in → 1.0; HW1 3V 90 in → 1.07). Slide 30.',
          vars: [
            { id: 'Cth', symbol: 'C_\\theta', label: 'Angle-of-wrap correction', unit: '', kind: 'lookup', fig: 'fig7-18', auto: v => cth(v.th1), hint: 'auto = digitised Fig 7-18' },
            { id: 'CL', symbol: 'C_L', label: 'Belt-length correction', unit: '', kind: 'lookup', fig: 'fig7-19', auto: v => clM(v.sec, v.Lstd), hint: 'auto = digitised Fig 7-19 curve for the section' },
            { id: 'PA', symbol: 'P_A', label: 'Allowable power per belt', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'Cth', 'CL', 'Prated') ? v.Cth * v.CL * v.Prated : undefined,
              work: v => H.has(v, 'PA') ? '\\(P_A = (' + f(v.Cth) + ')(' + f(v.CL) + ')(' + f(v.P1) + ' + ' + f(v.Padd) + ') = ' + f(v.PA) + '\\ \\text{hp}\\)' : null },
          ] },
        { id: 'gcorr', title: 'Gates: hp per belt × hp correction factor', when: M('gates'), fig: ['gates-b6', 'gates-b10', 'gates-ex'],
          formula: 'H_{all} = (\\text{hp correction})\\,(H_{tab} + \\Delta P)',
          text: 'From the Gates drive table for the section (B6 for 3V/3VX…): the sheave pair and belt give the CD and the colour-keyed <b>hp correction factor</b>, which already combines the wrap and length corrections (slide 37). H<sub>tab</sub> and the additional hp for speed ratio ΔP come from the rating table (B9 3V, B10 3VX, B33 CP …). Course values: lecture 0.9(7.68 + 0.25); HW1 P3b 0.9(2.8 + 0.36); Tutorial 2 Q2 1.2(23.3 + 0).',
          vars: [
            { id: 'KG', symbol: 'K_{corr}', label: 'Gates hp correction factor', unit: '', kind: 'lookup', fig: 'gates-b6', auto: v => isClassic(v.sec) ? (k1(v.th1) && k2(v.sec, v.Lstd) ? k1(v.th1) * k2(v.sec, v.Lstd) : undefined) : (cth(v.th1) && clM(v.sec, v.Lstd) ? cth(v.th1) * clM(v.sec, v.Lstd) : undefined), hint: 'auto ≈ Cθ·CL (narrow) or K1·K2 (classical) — read the table\'s colour key' },
            { id: 'HtabG', symbol: 'H_{tab}', label: 'Gates rated hp per belt (VR = 1)', unit: 'hp', kind: 'lookup', fig: 'gates-b10', hint: 'Gates rating table at the small sheave and rpm' },
            { id: 'dPG', symbol: '\\Delta P', label: 'Additional hp for speed ratio', unit: 'hp', kind: 'lookup', fig: 'gates-b10', auto: v => H.has(v, 'VR') && v.VR < 1.015 ? 0 : undefined, hint: '0 for VR = 1.00; else the "additional hp" column' },
            { id: 'Hall', symbol: 'H_{all}', label: 'Allowable power per belt', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'KG', 'HtabG', 'dPG') ? v.KG * (v.HtabG + v.dPG) : undefined,
              work: v => H.has(v, 'Hall') ? '\\(H_{all} = ' + f(v.KG) + '(' + f(v.HtabG) + ' + ' + f(v.dPG) + ') = ' + f(v.Hall) + '\\ \\text{hp}\\)' : null },
          ] },
        { id: 'scorr', title: 'Shigley: H_a = K_1 K_2 H_tab', when: M('shig'), fig: ['table17-12', 'table17-13', 'table17-14'], eq: '17-17',
          formula: 'H_a = K_1 K_2 H_{tab}',
          text: 'H<sub>tab</sub> from Table 17-12 at the small-sheave diameter and the belt speed (interpolate on V; Tutorial 2 Q1: D, 26 in, 2723 ft/min → 16.94 hp). K<sub>1</sub> (Table 17-13) at the wrap angle, K<sub>2</sub> (Table 17-14) at the nominal length. No speed-ratio bonus in Shigley (slide 31). For 3V/5V/8V the auto H<sub>tab</sub> uses Mott\'s solid curve.',
          vars: [
            { id: 'Htab', symbol: 'H_{tab}', label: 'Tabulated power per belt', unit: 'hp', kind: 'lookup', fig: 'table17-12', auto: v => HP[base(v.sec)] ? htab17(base(v.sec), v.D1, v.vb) : chartP(v.sec, v.D1, v.n1), hint: 'auto = Table 17-12 interpolated on V and d' },
            { id: 'K1', symbol: 'K_1', label: 'Angle-of-wrap correction', unit: '', kind: 'lookup', fig: 'table17-13', auto: v => k1(v.th1), hint: 'auto = VV curve fit (180° → 1.00, 175° → 0.99)' },
            { id: 'K2', symbol: 'K_2', label: 'Belt-length correction', unit: '', kind: 'lookup', fig: 'table17-14', auto: v => k2(v.sec, v.Lstd) || clM(v.sec, v.Lstd), hint: 'Table 17-14 (A–E); 3V/5V/8V auto uses Mott Fig 7-19' },
            { id: 'Ha', symbol: 'H_a', label: 'Allowable power per belt', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'K1', 'K2', 'Htab') ? v.K1 * v.K2 * v.Htab : undefined,
              work: v => H.has(v, 'Ha') ? '\\(H_a = ' + f(v.K1, 3) + '(' + f(v.K2, 3) + ')(' + f(v.Htab) + ') = ' + f(v.Ha) + '\\ \\text{hp}\\)' : null },
          ] },
        { id: 'nb', title: 'Number of belts and factor of safety', when: M('mott', 'gates', 'shig', 'rate'), eq: isM ? 'slide 30/41' : '17-20, 17-26',
          formula: 'N_b = \\left\\lceil \\frac{P_{des}}{P_{belt}} \\right\\rceil,\\qquad n_{fs} = \\frac{N_b P_{belt}}{P_{des}},\\qquad P_{max} = \\frac{N_b P_{belt}}{K_s n_d}',
          text: 'Always round the number of belts <b>up</b> ("2.01 → 3", Mech p.26). n<sub>fs</sub> = allowable / design power (midterm 3 × 23.29 / 52 = 1.34). For an existing drive type the number of belts it has.',
          vars: [
            { id: 'Pbelt', symbol: 'P_{belt}', label: 'Allowable power per belt', unit: 'hp', kind: 'calc', compute: v => v.mode === 'gates' ? v.Hall : v.mode === 'shig' ? v.Ha : v.PA },
            { id: 'Nreq', symbol: 'P_{des}/P_{belt}', label: 'Belts required (unrounded)', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'Pdes', 'Pbelt') ? v.Pdes / v.Pbelt : undefined },
            { id: 'Nb', symbol: 'N_b', label: 'Number of belts', unit: '', kind: 'input', auto: v => H.has(v, 'Nreq') ? Math.max(1, Math.ceil(v.Nreq - 1e-9)) : undefined, hint: 'auto = round up; type the given number for an existing drive',
              check: v => H.has(v, 'Nb', 'Nreq') && v.Nb < v.Nreq - 1e-9 ? 'Fewer belts than required — drive overloaded' : null },
            { id: 'Pcap', symbol: 'N_b P_{belt}', label: 'Allowable power of the drive', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'Nb', 'Pbelt') ? v.Nb * v.Pbelt : undefined },
            { id: 'nfs', symbol: 'n_{fs}', label: 'Factor of safety', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'Pcap', 'Pdes') ? v.Pcap / v.Pdes : undefined,
              work: v => H.has(v, 'nfs') ? '\\(N_b = ' + f(v.Pdes) + '/' + f(v.Pbelt) + ' = ' + f(v.Nreq, 3) + ' \\rightarrow ' + v.Nb + ',\\qquad n_{fs} = \\frac{' + v.Nb + '(' + f(v.Pbelt) + ')}{' + f(v.Pdes) + '} = ' + f(v.nfs, 3) + '\\)' : null },
            { id: 'Pmax', symbol: 'P_{max}', label: 'Largest motor power (n_fs = 1)', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'Pcap', 'Ks') ? v.Pcap / (v.Ks * (H.has(v, 'nd') ? v.nd : 1)) : undefined },
          ] },
      ] },

      { title: 'Belt tensions (Shigley Eq 17-21 … 17-25)', steps: [
        { id: 'dF', title: 'Torque and tension difference per belt', when: M('shig', 'gates'), fig: ['fig17-14'], eq: '17-22',
          formula: '\\Delta F = \\frac{63\\,025\\,H_{belt}}{n_1 (D_1/2)},\\qquad H_{belt} = H_a\\ \\text{(Tut. 2 Q1)}\\ \\text{or}\\ \\frac{H_d}{N_b}\\ \\text{(Ex. 17-4, Tut. 2 Q2)}',
          text: 'Course Tutorial 2 Q1 loads each belt to its allowable power H<sub>a</sub>; Shigley Ex 17-4 and the Tutorial 2 Q2 comparison (F<sub>i</sub> = 409 lbf) use the actual share H<sub>d</sub>/N<sub>b</sub>. Choose what the question expects. The small sheave is taken as the driver.',
          vars: [
            { id: 'dFbasis', label: 'Power per belt used for ΔF', kind: 'choice', type: 'text', default: 'Ha', options: [{ value: 'Ha', label: 'H<sub>a</sub> — allowable per belt (course Tutorial 2 Q1)' }, { value: 'HdNb', label: 'H<sub>d</sub>/N<sub>b</sub> — actual share (Shigley Ex 17-4, Tut 2 Q2)' }] },
            { id: 'Hbelt', symbol: 'H_{belt}', label: 'Power per belt for tensions', unit: 'hp', kind: 'calc', compute: v => v.dFbasis === 'HdNb' ? (H.has(v, 'Pdes', 'Nb') ? v.Pdes / v.Nb : undefined) : v.Pbelt },
            { id: 'Tb', symbol: 'T', label: 'Torque per belt', unit: 'lbf·in', kind: 'calc', compute: v => H.has(v, 'Hbelt', 'n1') ? 63025 * v.Hbelt / v.n1 : undefined },
            { id: 'dF', symbol: '\\Delta F', label: 'Tension difference per belt', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'Tb', 'D1') ? 2 * v.Tb / v.D1 : undefined,
              work: v => H.has(v, 'dF') ? '\\(T = \\frac{63\\,025(' + f(v.Hbelt) + ')}{' + f(v.n1) + '} = ' + f(v.Tb) + '\\ \\text{lbf·in},\\quad \\Delta F = \\frac{2T}{D_1} = ' + f(v.dF) + '\\ \\text{lbf}\\)' : null },
          ] },
        { id: 'tens', title: 'F_c, F_1, F_2, F_i', when: M('shig', 'gates'), fig: ['table17-16', 'fig17-14'], eq: '17-21, 17-23 … 17-25',
          formula: 'F_c = K_c\\left(\\frac{V}{1000}\\right)^2,\\quad F_1 = F_c + \\frac{\\Delta F\\,e^{f\\phi}}{e^{f\\phi} - 1},\\quad F_2 = F_1 - \\Delta F,\\quad F_i = \\frac{F_1 + F_2}{2} - F_c',
          text: 'Gates\' effective friction f = 0.5123 for V grooves (Shigley), i.e. F<sub>1</sub>/F<sub>2</sub> ≈ 5 at 180° (slide 25). The friction is fully developed by construction, so the slide-42 check f/sin(β/2) &gt; f′ is met.',
          vars: [
            { id: 'efp', symbol: 'e^{0.5123\\phi}', label: 'Friction term at the small-sheave wrap', unit: '', kind: 'calc', compute: v => H.has(v, 'th1') ? Math.exp(0.5123 * H.rad(v.th1)) : undefined },
            { id: 'Kc', symbol: 'K_c', label: 'Centrifugal parameter (Table 17-16)', unit: '', kind: 'lookup', fig: 'table17-16', auto: v => sd(v) ? sd(v).Kc : undefined },
            { id: 'Fc', symbol: 'F_c', label: 'Centrifugal tension', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'Kc', 'vb') ? v.Kc * (v.vb / 1000) ** 2 : undefined,
              work: v => H.has(v, 'Fc') ? '\\(F_c = ' + f(v.Kc) + '\\left(\\frac{' + f(v.vb) + '}{1000}\\right)^2 = ' + f(v.Fc) + '\\ \\text{lbf}\\)' : null },
            { id: 'F1', symbol: 'F_1', label: 'Tight-side tension', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'Fc', 'dF', 'efp') ? v.Fc + v.dF * v.efp / (v.efp - 1) : undefined,
              work: v => H.has(v, 'F1') ? '\\(F_1 = ' + f(v.Fc) + ' + \\frac{' + f(v.dF) + '(' + f(v.efp) + ')}{' + f(v.efp) + ' - 1} = ' + f(v.F1) + '\\ \\text{lbf}\\)' : null },
            { id: 'F2', symbol: 'F_2', label: 'Slack-side tension', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'F1', 'dF') ? v.F1 - v.dF : undefined },
            { id: 'Fi', symbol: 'F_i', label: 'Initial tension (pre-tension)', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'F1', 'F2', 'Fc') ? (v.F1 + v.F2) / 2 - v.Fc : undefined,
              work: v => H.has(v, 'Fi') ? '\\(F_i = \\frac{' + f(v.F1) + ' + ' + f(v.F2) + '}{2} - ' + f(v.Fc) + ' = ' + f(v.Fi) + '\\ \\text{lbf}\\)' : null },
          ] },
      ] },

      { title: 'Belt life (Shigley Eq 17-27, 17-28)', steps: [
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
          text: 'Table 17-17 constants are valid for 10<sup>8</sup>–10<sup>9</sup> force peaks: if N<sub>P</sub> &gt; 10<sup>9</sup>, report N<sub>P</sub> &gt; 10<sup>9</sup> and t as a lower bound (Ex 17-4, Tutorial 2 Q1).',
          vars: [
            { id: 'K', symbol: 'K', label: 'Durability constant', unit: '', kind: 'lookup', fig: 'table17-17', auto: v => sd(v) ? sd(v).K : undefined },
            { id: 'bexp', symbol: 'b', label: 'Durability exponent', unit: '', kind: 'lookup', fig: 'table17-17', auto: v => sd(v) ? sd(v).b : undefined },
            { id: 'NP', symbol: 'N_P', label: 'Life in belt passes', unit: 'passes', kind: 'calc', digits: 3, compute: v => H.has(v, 'K', 'bexp', 'T1', 'T2') ? 1 / ((v.K / v.T1) ** (-v.bexp) + (v.K / v.T2) ** (-v.bexp)) : undefined,
              work: v => H.has(v, 'NP') ? '\\(N_P = \\left[\\left(\\frac{' + f(v.K) + '}{' + f(v.T1) + '}\\right)^{-' + f(v.bexp) + '} + \\left(\\frac{' + f(v.K) + '}{' + f(v.T2) + '}\\right)^{-' + f(v.bexp) + '}\\right]^{-1} = ' + f(v.NP, 3) + '\\)' : null,
              check: v => H.has(v, 'NP') && v.NP > 1e9 ? 'N_P > 10^9: outside Table 17-17 — report N_P > 10^9 and t as a lower bound' : null },
            { id: 'thr', symbol: 't', label: 'Life in hours', unit: 'h', kind: 'calc', compute: v => H.has(v, 'NP', 'Lp', 'vb') ? Math.min(v.NP, 1e9) * v.Lp / (720 * v.vb) : undefined,
              work: v => H.has(v, 'thr') ? '\\(t ' + (v.NP > 1e9 ? '>' : '=') + ' \\frac{' + f(Math.min(v.NP, 1e9), 3) + '(' + f(v.Lp) + ')}{720(' + f(v.vb) + ')} = ' + f(v.thr) + '\\ \\text{h}\\)' : null },
            { id: 'hpd', symbol: '', label: 'Operating hours per day', unit: 'h/day', kind: 'input', hint: '2 shifts = 16 h/day (Tutorial 2 Q1)' },
            { id: 'yrs', symbol: '', label: 'Life in years', unit: 'yr', kind: 'calc', compute: v => H.has(v, 'thr', 'hpd') ? v.thr / v.hpd / 365.25 : undefined },
          ] },
      ] },

      { title: 'Installation tension (Gates manual, slides 39–40)', steps: [
        { id: 'tst', title: 'Static tension per strand (Formula D19)', when: M('gates', 'tension'), fig: ['gates-d19', 'gates-ex'],
          formula: 'T_{st} = 15\\left(\\frac{2.5 - K_\\phi}{K_\\phi}\\right)\\frac{(\\text{Motor hp})(10^3)}{N\\,V} + \\frac{M V^2}{10^6}\\ \\text{lbf}',
          text: 'K<sub>φ</sub> from Table D26 at (D − d)/C (180° → 1.00; lecture 0.67 → 0.90); M from Table D27. Use the <b>motor (nominal) hp</b>, not the design hp — Tutorial 2 Q2: 251 lbf with 60 hp vs 375 lbf with 90 hp (Module 1 p24). The Mech guide says to look in Shigley for T<sub>st</sub>; the course uses this Gates formula.',
          vars: [
            { id: 'M', symbol: 'M', label: 'Constant M (Table D27)', unit: '', kind: 'lookup', fig: 'gates-d19', auto: v => GMY[v.sec] ? GMY[v.sec][0] : undefined, hint: '3VX 0.29 · 5VX 0.78 · 3V 0.46 · 5V 1.0 · 8V 2.6 · AX 0.47 · BX 0.76 · CX 1.31 · CP (C) 1.6' },
            { id: 'Hmot', symbol: '\\text{Motor hp}', label: 'Motor (nominal) power', unit: 'hp', kind: 'input', auto: v => v.P, hint: 'auto = P (not the design power)' },
            { id: 'Ng', symbol: 'N', label: 'Number of belts (strands)', unit: '', kind: 'input', auto: v => v.Nb, hint: 'auto = N_b from the design' },
            { id: 'Cten', symbol: 'C', label: 'Centre distance', unit: 'in', kind: 'input', auto: v => v.CD, hint: 'auto = actual CD above (or type the given C)' },
            { id: 'ddc', symbol: '(D-d)/C', label: 'Sheave-difference ratio', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'D1', 'D2', 'Cten') ? Math.abs(v.D2 - v.D1) / v.Cten : undefined },
            { id: 'Kphi', symbol: 'K_\\phi', label: 'Arc-of-contact factor (Table D26)', unit: '', kind: 'lookup', fig: 'gates-d19', auto: v => H.has(v, 'ddc') ? H.interp(v.ddc, KPHI_X, KPHI_Y) : undefined, hint: 'auto = linear interpolation of Table D26' },
            { id: 'Tst', symbol: 'T_{st}', label: 'Static tension per strand', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'Kphi', 'Hmot', 'Ng', 'vb', 'M') ? 15 * (2.5 - v.Kphi) / v.Kphi * v.Hmot * 1000 / (v.Ng * v.vb) + v.M * v.vb * v.vb / 1e6 : undefined,
              work: v => H.has(v, 'Tst') ? '\\(T_{st} = 15\\left(\\frac{2.5 - ' + f(v.Kphi) + '}{' + f(v.Kphi) + '}\\right)\\frac{' + f(v.Hmot) + '(10^3)}{' + f(v.Ng) + '(' + f(v.vb) + ')} + \\frac{' + f(v.M) + '(' + f(v.vb) + ')^2}{10^6} = ' + f(v.Tst) + '\\ \\text{lbf}\\)' : null },
          ] },
        { id: 'defl', title: 'Span length, deflection and deflection force (D35, D20–D23)', when: M('gates', 'tension'), fig: ['gates-d20', 'gates-d19'],
          formula: 't = C\\left[1 - 0.125\\left(\\frac{D-d}{C}\\right)^2\\right],\\quad \\delta = \\frac{t}{64},\\quad F = \\frac{(1.4 \\text{ to } 1.5)\\,T_{st} + Y}{16}\\ (\\ge 2\\ \\text{belts}),\\quad F = \\frac{(1.4 \\text{ to } 1.5)\\,T_{st} + (t/L)\\,Y}{16}\\ (1\\ \\text{belt})',
          text: 'Push one belt at mid-span until it deflects 1/64 in per inch of span; the force should lie between the minimum and maximum. The square-root span formula printed on the Gates page is marked "incorrect" on slide 39 — Formula D35 is used.',
          vars: [
            { id: 'Y', symbol: 'Y', label: 'Constant Y (Table D27)', unit: '', kind: 'lookup', fig: 'gates-d19', auto: v => GMY[v.sec] ? GMY[v.sec][1] : undefined, hint: '3VX/3V 4 · 5VX 13 · 5V 11 · 8V 22 · AX 7 · BX 8 · CX 15 · CP (C) 87' },
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
        { id: 'answer', title: 'Answer to the question', when: v => true,
          text: 'The line below states what the chosen question type asks for. Red warnings above (speed, ratio, wrap, CD range, minimum sheave) must be resolved before quoting it.',
          after: answer },
      ] },
    ];

    T.assumptions = [
      { text: 'Service factor K_s = 1.3 until you read your own: Mott Table 7-1 is the course\'s primary table (midterm: AC normal torque → textile machine, 10 h/day); Gates questions use Gates Table B1; Shigley Table 17-15 accepted as a range', src: 'Fizz p.9–10 · Mech p.19 · Flat&V s28, s35 · Midterm P1', var: 'Ks' },
      { text: 'Table 7-1 factors are for speed reducers — multiply by 1.2 for a speed increaser (flagged when n_2 > n_1)', src: 'Fizz p.10 · Mech p.19 (table footnote)' },
      { text: 'Design factor n_d = 1.0 unless the problem states one; design power = P·K_s·n_d', src: 'Flat&V s41 · Fizz p.10', var: 'nd' },
      { text: 'Section from the chart at the design power and faster-shaft rpm; on a boundary take the larger section (the auto suggestion flags points within ≈10 % of a line)', src: 'Fizz p.10 · Mott Fig 7-13 · Gates Fig B1 (s32)' },
      { text: 'Mott design: driver sized for a belt speed of 4000 ft/min, then the closest standard sheave', src: 'Fizz p.11 · Mech p.20 · Flat&V s25', var: 'Vt' },
      { text: 'Belt speed 1000–5000 ft/min (6500 absolute). Mech\'s "within 5 % of 4000 ft/min" is not used — the course solutions run at 3252 (midterm) and 3642 ft/min', src: 'Fizz p.11 · Mott p.255 · Flat&V s25 · Mech p.21 (not followed)' },
      { text: 'Driven sheave: closest standard size to D_1·VR, as in every course solution (21.1, 27.7, 18.95 in) — slide 29 says "round up"; output speed flagged if more than 5 % off (calculator check)', src: 'Fizz p.14 · Mech p.20 · HW1 P2/P3a · Flat&V s29', var: 'D2' },
      { text: 'Speed ratio ≤ 6:1 (7:1 cogged); wrap on the small sheave > 120°', src: 'Flat&V s25, s28 · Mott p.255' },
      { text: 'P_Tab auto = Mott Fig 7-14/15/16 solid curve digitised at the standard sheaves, linear between rpm curves (midterm read 23 hp where the curve gives 22.1 — type your reading)', src: 'Mott p.257 · Midterm P1', var: 'P1' },
      { text: 'ΔP_R: 5V steps of Fig 7-17 (∝ rpm); 3V/8V the same step pattern applied to the dashed − solid gap. Mech\'s linear formula P_2 + (VR − 3.38)/(3.38 − 1)(P_2 − P_1) is the accepted rough alternative; nothing more above VR 3.38', src: 'Mott p.257 · Fizz p.14–15 · Mech p.22–23', var: 'Padd' },
      { text: 'Trial CD in D_2 < CD < 3(D_2 + D_1), "closer to D"; the given CD if the problem has one (auto 1.15·D_2 is a calculator choice)', src: 'Mott Eq 7-17 · Fizz p.15 · Mech p.23 · Flat&V s29', var: 'CDt' },
      { text: 'Standard length: closest Table 7-2 / Table 17-10 length (course accepts either neighbour — midterm took the larger); length and CD from Mott 7-12/7-13 with 1.57 and 6.28 (Shigley 17-16a/b with π/2 in the Shigley question type — same to 0.01 in)', src: 'Fizz p.15–16 · Mech p.23–24 · Midterm P1', var: 'Lstd' },
      { text: 'C_θ and C_L auto = digitised Mott Fig 7-18 / 7-19 (reproduce Mott Ex 7-2, the midterm and HW1 reads to ±0.01)', src: 'Fizz p.16–17 · Mech p.24–25', var: 'CL' },
      { text: 'Number of belts always rounded up; n_fs = N_b·P_belt / P_des', src: 'Fizz p.18 · Mech p.26 · Flat&V s41 · Midterm P1', var: 'Nb' },
      { text: 'Gates hp correction combines wrap and length (auto ≈ C_θ·C_L or K_1·K_2 — read the drive table\'s colour key); Gates CD ≈ Mott Eq 7-13 with the belt number as length (reproduces 19.3, 10.8, 145 in)', src: 'Flat&V s37–38 · Tut 2 Q2 · HW1 P3b', var: 'KG' },
      { text: 'NEMA minimum driver sheave from Gates Table B2 (narrow) / B3 (classical) at the motor hp (next larger row) and the nearest motor-rpm column', src: 'Flat&V s33 · Tut 2 Q2 · HW1 P3b', var: 'dminN' },
      { text: 'Shigley: effective friction 0.5123 (F_1/F_2 ≈ 5 at 180°); the small sheave is the driver; no speed-ratio bonus in H_a', src: 'Shigley Eq 17-17 · Flat&V s25, s31' },
      { text: 'ΔF from H_a per belt (course Tutorial 2 Q1); switch to H_d/N_b for Shigley Ex 17-4 or the Tutorial 2 Q2 comparison (F_i = 409 lbf)', src: 'Module 1 p12, p20 · Shigley Ex 17-4', var: 'dFbasis' },
      { text: 'Life constants K, b for 10^8–10^9 peaks; N_P > 10^9 reported as "> 10^9" with t a lower bound', src: 'Shigley Table 17-17 · Tut 2 Q1' },
      { text: 'Installation tension: Gates D19 with the MOTOR hp (not design hp); Mech p.19 says "look in Shigley" — the course uses the Gates manual', src: 'Flat&V s39 · Module 1 p24 · Mech p.19 (not followed)', var: 'Hmot' },
      { text: 'K_φ by linear interpolation of Table D26; M, Y from Table D27 (3V = Super HC PowerBand row 0.46/4 as HW1 P3b; C = Hi-Power CP 1.6/87 as Tut 2 Q2)', src: 'Flat&V s39 · HW1 P3b · Tut 2 Q2', var: 'M' },
      { text: 'Span t = C[1 − 0.125((D − d)/C)^2] (D35; the sqrt formula is marked incorrect); deflection t/64; D20/D21 for ≥ 2 belts, D22/D23 for one belt', src: 'Flat&V s39–40' },
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
