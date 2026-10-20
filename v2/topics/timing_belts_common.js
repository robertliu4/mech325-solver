// Synchronous (timing) belts — shared definition for timing_belts_shigley.js / timing_belts_mott.js (window.makeTopic_timing_belts(book)).
// Course method: Mott 7-8 + Gates Table No. 4, the 7-step procedure of "Timing Belts 2023" s5–s11 (Shigley §17-4 has no selection method).
// Question types (step 1 `mode`): design | check | kin — inventory in v2/notes/timing_belts_questions.md.
// Assumptions from v2/notes/belt_assumptions.md §3 (Fizz p.18–25, Mech p.27–33) + course slides s4–s12.
// Tables embedded for auto-fill: Mott 7-4 (PD, flange, bushings), 7-5 (bores), 7-7 (sprocket pairs, belt list), 7-8 (SF),
// 7-9/7-10 (ratings, parsed from the Mott PDF text layer), 7-11 (C_L); Gates Table No. 4 (course slide 7, transcribed as printed —
// note it prints 2.2 in for 20 hp @ 3450 rpm, smaller than 15 hp's 4.0, probably a catalogue misprint).
//
// Verified against (Playwright probe, values as shown by the calculator):
//  design HW1 P4 (Mott 7-43): 5 hp AC normal torque @1750 → fan 700 rpm, 22 h/day; everything else auto →
//         SF 1.8 → Pdes 9.0 hp; 8 mm; Gates Table 4 min 2.7 in; pair 32/80 (VR 2.5, n2 700 rpm); PD 3.208 / 8.020 in; 8.02 < CD < 33.7;
//         920-8MGT (115 teeth) → CD 8.974 in; 30 mm; Prated 21.2 hp; CL 1.0; Padj 21.2; SF = 21.2/9.0 = 2.36; v 1470 ft/min;
//         θ1 148.9°, 13 teeth in mesh; bushings 1210 / 2517 — all match the HW1 solution (P32-8MGT-30 / P80-8MGT-30 / 920-8MGT-30).
//  design Mott Ex 7-4: 20 hp normal-torque motor 1750 → gear pump 875, 16–24 h/day, CD 22 ± 0.375, shafts 1.625 / 1.375, OD ≤ 14 →
//         SF 1.7 → 34 hp; Gates min 4.0 in removes 22…36T; 40:80 passes bores (30 mm column: 2012) but 28.6 × 1.10 = 31.5 hp < 34 at 30 mm;
//         auto-pick 56:112, 1800-8MGT, CD 22.03, Prated 43.2 × CL 1.20 = 51.84 hp, v 2572 ft/min, bushings 2012 / 2517 — matches Mott
//         (Mott eliminates 40:80 by the 20-mm-column bushing 1610 instead; same final drive).
//  check  HW1 P4 drive as built (32/80, 920 belt, 30 mm, SF 1.8): Padj 21.2 ≥ 9.0, SF 2.36, max nominal power 21.2/1.8 = 11.8 hp.
//  Sizing tables: pitch (Fig 7-27 regions) → 8 mm for HW1 P4 and Ex 7-4; sprocket pairs (Table 7-7 + eliminations) → 32:80 (HW1 P4,
//         36:90 also listed) and 56:112 (Ex 7-4; 22–36T fail the Gates 4.0-in minimum, 40:80 fails 30-mm power); belt → 920 (HW1 P4),
//         1800 (Ex 7-4, CD 22 ± 0.375); width → 30 mm in both.
//  kin    Mott Ex 7-3: 32/80, 1200-8MGT, 1400 rpm → PD 3.208 / 8.020, VR 2.50, n2 560 rpm, v 1175.8 ft/min, CD 14.61 in (Table 7-7: 14.61).
(function () {
  'use strict';
  // Mott Table 7-4 — 8 mm sprockets: teeth → [pitch dia in, flange dia in (NaN = none), bushing by width {20,30,50,85} ('MPB' = plain bore)]
  const T74 = {
    22: [2.206, 2.559, { 20: 1108, 30: 1108 }], 24: [2.406, 2.756, { 20: 1108, 30: 1108 }], 26: [2.607, 2.953, { 20: 1108, 30: 1108 }],
    28: [2.807, 3.15, { 20: 1108, 30: 1108, 50: 'MPB' }], 30: [3.008, 3.346, { 20: 1210, 30: 1210, 50: 1210 }], 32: [3.208, 3.543, { 20: 1210, 30: 1210, 50: 1210 }],
    34: [3.409, 3.819, { 20: 1610, 30: 1610, 50: 1610, 85: 1615 }], 36: [3.609, 3.937, { 20: 1610, 30: 1610, 50: 1610, 85: 1615 }], 38: [3.810, 4.134, { 20: 1610, 30: 1610, 50: 1610, 85: 1610 }],
    40: [4.010, 4.331, { 20: 1610, 30: 2012, 50: 2012, 85: 2012 }], 44: [4.411, 4.764, { 20: 2012, 30: 2012, 50: 2012, 85: 2012 }], 48: [4.812, 5.157, { 20: 2012, 30: 2012, 50: 2012, 85: 2012 }],
    56: [5.614, 5.945, { 20: 2012, 30: 2012, 50: 2517, 85: 2517 }], 64: [6.416, 6.772, { 20: 2012, 30: 2517, 50: 2517, 85: 2517 }], 72: [7.218, 7.598, { 20: 2012, 30: 2517, 50: 2517, 85: 3020 }],
    80: [8.020, 8.386, { 20: 2517, 30: 2517, 50: 2517, 85: 3020 }], 90: [9.023, NaN, { 20: 2517, 30: 2517, 50: 3020, 85: 3020 }], 112: [11.229, NaN, { 30: 2517, 50: 3020, 85: 3020 }],
    144: [14.437, NaN, { 30: 2517, 50: 3020, 85: 3535 }], 192: [19.249, NaN, { 50: 3020, 85: 3535 }],
  };
  // Mott Table 7-5 — taper-lock bushing: size → [min bore, max bore] in
  const T75 = { 1008: [0.5, 0.875], 1108: [0.5, 1.0], 1210: [0.5, 1.25], 1610: [0.5, 1.5], 1615: [0.5, 1.5], 2012: [0.5, 1.875], 2517: [0.5, 2.25], 3020: [0.875, 2.75], 3525: [1.188, 3.25], 3535: [1.188, 3.25], 4030: [1.438, 3.625], 4040: [1.438, 3.625], 4535: [1.938, 4.25], 4545: [1.938, 4.25], 5040: [2.438, 4.5], 6050: [4.438, 6.0], 7060: [4.938, 7.0] };
  // Mott Table 7-11 — length correction factor by belt designation (pitch length, mm)
  const T711 = { 384: 0.70, 480: 0.80, 560: 0.80, 600: 0.80, 640: 0.90, 720: 0.90, 800: 0.90, 840: 0.90, 880: 0.90, 920: 1.00, 960: 1.00, 1040: 1.00, 1064: 1.00, 1120: 1.00, 1160: 1.00, 1200: 1.00, 1224: 1.00, 1280: 1.10, 1440: 1.10, 1512: 1.10, 1584: 1.10, 1600: 1.10, 1760: 1.10, 1800: 1.20, 2000: 1.20, 2200: 1.20, 2400: 1.20, 2600: 1.20, 2800: 1.20, 3048: 1.20, 3280: 1.20, 3600: 1.20, 4400: 1.20 };
  // Mott Table 7-7 — sprocket combinations (driver, driven) and the belts it lists
  const PAIRS = [[22, 22], [24, 24], [26, 26], [28, 28], [30, 30], [32, 32], [34, 34], [36, 36], [38, 38], [40, 40], [44, 44], [48, 48], [56, 56], [64, 64], [72, 72], [80, 80],
    [24, 30], [32, 40], [64, 80], [72, 90], [24, 32], [30, 40], [36, 48], [48, 64], [24, 36], [32, 48], [48, 72],
    [22, 44], [24, 48], [28, 56], [32, 64], [36, 72], [40, 80], [56, 112], [72, 144], [32, 80], [36, 90], [24, 72], [30, 90], [48, 144]];
  const BELTS77 = [920, 960, 1040, 1064, 1120, 1160, 1200, 1224, 1280, 1440, 1512, 1584, 1600, 1760, 1800, 2000];
  // Mott Table 7-8 (= Gates Table No. 5, course slide 5): class → { normal: [≤8 h, 8–16 h, 16–24 h], high: [...] }
  const T78 = {
    1: { normal: [1.0, 1.2, 1.4], high: [1.2, 1.4, 1.6] }, 2: { normal: [1.1, 1.3, 1.5], high: [1.3, 1.5, 1.7] },
    3: { normal: [1.2, 1.4, 1.6], high: [1.6, 1.8, 2.0] }, 4: { normal: [1.3, 1.5, 1.7], high: [1.6, 1.8, 2.0] },
    5: { normal: [1.4, 1.6, 1.8], high: [1.8, 2.0, 2.2] }, 6: { normal: [1.5, 1.7, 1.9], high: [1.9, 2.1, 2.3] },
    7: { normal: [1.6, 1.8, 2.0], high: [2.0, 2.2, 2.4] }, 8: { normal: [1.7, 1.9, 2.1], high: [2.1, 2.3, 2.5] },
  };
  const CLASSES = [
    { value: '1', label: 'Display, instrumentation, measuring, medical, office/projection equipment' },
    { value: '2', label: 'Appliances, sweepers, sewing machines; oven/drum screens; light woodworking (band saws, drills, lathes)' },
    { value: '3', label: 'Agitators for liquids; light-package belt conveyors; drill press, lathes, saws; laundry; heavy woodworking' },
    { value: '4', label: 'Agitators for semi-liquids; centrifugal compressors; ore/coal/sand belt conveyors; dough mixers; line shafts; machine tools; paper presses; printing; centrifugal & gear pumps; revolving/vibrating screens' },
    { value: '5', label: 'Brick machinery; apron/pan/bucket/elevator conveyors; extractors, washers; fans & centrifugal blowers; generators; hoists; rubber calenders/mills/extruders' },
    { value: '6', label: 'Centrifuges; screw conveyors; hammer mills; paper pulpers; textile machinery' },
    { value: '7', label: 'Positive-displacement blowers; mine fans; pulverizers' },
    { value: '8', label: 'Reciprocating compressors and pumps; crushers; ball/rod/pebble mills; saw-mill equipment' },
  ];
  // Gates Table No. 4 (course slide 7) — minimum motor-sprocket PD (in): rows motor hp, columns 575/690/870/1160/1750/3450 rpm (NaN = not listed)
  const G4_RPM = [575, 690, 870, 1160, 1750, 3450];
  const G4 = [[0.5, NaN, NaN, 2.0, NaN, NaN, NaN], [0.75, NaN, NaN, 2.2, 2.0, NaN, NaN], [1, 2.7, 2.3, 2.2, 2.2, 2.0, NaN], [1.5, 2.7, 2.7, 2.2, 2.2, 2.2, 2.0],
    [2, 3.4, 2.7, 2.7, 2.2, 2.2, 2.2], [3, 4.1, 3.4, 2.7, 2.7, 2.2, 2.2], [5, 4.1, 4.1, 3.4, 2.7, 2.7, 2.2], [7.5, 4.7, 4.1, 4.0, 3.4, 2.7, 2.7],
    [10, 5.4, 4.7, 4.0, 4.0, 3.4, 2.7], [15, 6.1, 5.4, 4.7, 4.0, 4.0, 4.0], [20, 7.4, 6.1, 5.4, 4.7, 4.0, 2.2], [25, 8.1, 7.4, 6.1, 5.4, 4.0, 4.0],
    [30, 9.0, 8.1, 6.1, 6.1, 4.7, NaN], [40, 9.0, 9.0, 7.4, 6.1, 5.4, NaN], [50, 9.9, 9.0, 7.6, 7.4, 6.1, NaN], [60, 10.8, 9.9, 9.0, 7.2, 6.7, NaN],
    [75, 12.6, 11.7, 8.6, 9.0, 7.7, NaN], [100, 16.2, 13.5, 10.8, 9.0, 7.7, NaN], [125, 18.0, 16.2, 13.5, 10.8, 9.5, NaN], [150, 19.8, 18.0, 16.2, 11.7, 9.5, NaN],
    [200, 19.8, 19.8, 19.8, NaN, 11.9, NaN], [250, 19.8, 19.8, NaN, NaN, NaN, NaN], [300, 24.3, 24.3, NaN, NaN, NaN, NaN]];
  // Mott Tables 7-9 (30 mm) and 7-10 (50 mm) — base rated hp: rows = rpm of faster shaft, columns = small-sprocket teeth (short rows = blank cells)
  const R30 = { cols: [22,24,26,28,30,32,34,36,38,40,44,48,56,64,72,80], rpm: [10,20,40,60,100,200,300,400,500,600,700,800,870,1000,1160,1200,1400,1600,1750,2000,2400,2800,3200,3450,4000,4500,5000,5500], hp: [
    [0.1,0.12,0.13,0.15,0.16,0.17,0.19,0.2,0.22,0.23,0.26,0.29,0.34,0.4,0.45,0.51],
    [0.2,0.22,0.25,0.28,0.31,0.33,0.36,0.39,0.42,0.44,0.5,0.55,0.66,0.76,0.87,0.98],
    [0.37,0.43,0.48,0.53,0.59,0.64,0.69,0.75,0.8,0.85,0.96,1.06,1.27,1.47,1.68,1.88],
    [0.54,0.62,0.7,0.78,0.86,0.94,1.01,1.09,1.17,1.25,1.4,1.55,1.86,2.16,2.46,2.76],
    [0.87,1,1.12,1.25,1.38,1.51,1.63,1.76,1.89,2.01,2.26,2.51,3,3.49,3.98,4.47],
    [1.64,1.89,2.13,2.38,2.63,2.87,3.12,3.36,3.6,3.84,4.33,4.8,5.76,6.7,7.64,8.58],
    [2.37,2.74,3.1,3.46,3.82,4.18,4.54,4.9,5.25,5.61,6.32,7.02,8.42,9.8,11.2,12.5],
    [3.08,3.56,4.04,4.51,4.99,5.46,5.93,6.4,6.87,7.33,8.26,9.18,11,12.8,14.6,16.4],
    [3.77,4.36,4.95,5.54,6.13,6.71,7.29,7.87,8.45,9.02,10.2,11.3,13.6,15.8,18,20.2],
    [4.45,5.15,5.85,6.55,7.25,7.94,8.63,9.31,10,10.7,12,13.4,16.1,18.7,21.4,24],
    [5.11,5.93,6.74,7.54,8.35,9.15,9.95,10.7,11.5,12.3,13.9,15.5,18.6,21.6,24.7,27.7],
    [5.77,6.69,7.61,8.52,9.44,10.3,11.2,12.1,13,13.9,15.7,17.5,21,24.5,27.9,31.4],
    [6.22,7.22,8.22,9.2,10.2,11.2,12.2,13.1,14.1,15.1,17,18.9,22.7,26.5,30.2,33.9],
    [7.05,8.19,9.33,10.5,11.6,12.7,13.8,14.9,16,17.1,19.3,21.5,25.8,30.1,34.3,38.5],
    [8.06,9.37,10.7,12,13.3,14.5,15.8,17.1,18.4,19.6,22.2,24.7,29.6,34.5,39.4,44.2],
    [8.31,9.66,11,12.3,13.7,15,16.3,17.6,19,20.3,22.9,25.4,30.6,35.6,40.6,45.6],
    [9.54,11.1,12.7,14.2,15.7,17.3,18.8,20.3,21.8,23.3,26.3,29.3,35.2,41,46.8,52.4],
    [10.7,12.5,14.3,16,17.8,19.5,21.2,23,24.7,26.4,29.8,33.1,39.8,46.3,52.8,59.1],
    [11.6,13.6,15.5,17.4,19.3,21.2,23,24.9,26.8,28.6,32.3,36,43.2,50.3,57.2,64.1],
    [13.1,15.3,17.5,19.6,21.8,23.9,26,28.1,30.2,32.3,36.5,40.6,48.7,56.7,64.5,72.1],
    [15.4,18,20.5,23.1,25.6,28.1,30.7,33.1,35.6,38.1,43,47.8,57.3,66.6,75.6,84.4],
    [17.6,20.6,23.6,26.5,29.4,32.3,35.2,38,40.9,43.7,49.3,54.8,65.6,76.1,86.2,96],
    [19.8,23.2,26.5,29.8,33.1,36.4,39.6,42.8,46,49.2,55.4,61.6,73.6,85.2,96.2],
    [21.1,24.7,28.3,31.9,35.4,38.9,42.3,45.8,49.2,52.5,59.2,65.7,78.4,90.6,102.2],
    [24,28.1,32.2,36.2,40.3,44.2,48.1,52,55.9,59.7,67.1,74.5,88.5],
    [26.6,31.1,35.6,40.1,44.5,48.9,53.2,57.5,61.7,65.9,74,82],
    [29,34,39,43.8,48.7,53.4,58.1,62.8,67.3,71.8,80.6,89.1],
    [31.4,36.8,42.2,47.5,52.7,57.8,62.9,67.8,72.7,77.5,86.8],
  ] };
  const R50 = { cols: [28,30,32,34,36,38,40,44,48,56,64,72,80], rpm: [10,20,40,60,100,200,300,400,500,600,700,800,870,1000,1160,1200,1400,1600,1750,2000,2400,2800,3200,3450,4000,4500,5000,5500], hp: [
    [0.25,0.28,0.3,0.33,0.35,0.38,0.4,0.45,0.5,0.59,0.69,0.78,0.88],
    [0.49,0.53,0.58,0.63,0.68,0.72,0.77,0.86,0.96,1.14,1.33,1.51,1.7],
    [0.93,1.02,1.11,1.21,1.3,1.39,1.48,1.66,1.84,2.2,2.56,2.92,3.27],
    [1.35,1.49,1.63,1.76,1.9,2.03,2.17,2.43,2.7,3.23,3.75,4.28,4.8],
    [2.18,2.4,2.62,2.84,3.06,3.28,3.5,3.93,4.36,5.22,6.08,6.92,7.77],
    [4.14,4.57,4.99,5.42,5.84,6.26,6.68,7.52,8.35,10,11.7,13.3,14.9],
    [6.02,6.65,7.27,7.9,8.52,9.14,9.75,11,12.2,14.6,17,19.4,21.8],
    [7.85,8.67,9.49,10.3,11.1,11.9,12.7,14.4,16,19.2,22.3,25.5,28.6],
    [9.63,10.7,11.7,12.7,13.7,14.7,15.7,17.7,19.7,23.6,27.5,31.4,35.2],
    [11.4,12.6,13.8,15,16.2,17.4,18.6,20.9,23.3,28,32.6,37.2,41.7],
    [13.1,14.5,15.9,17.3,18.7,20.1,21.4,24.2,26.9,32.3,37.6,42.9,48.2],
    [14.8,16.4,18,19.6,21.1,22.7,24.2,27.3,30.4,36.5,42.6,48.6,54.5],
    [16,17.7,19.4,21.1,22.8,24.5,26.2,29.5,32.9,39.5,46,52.5,58.9],
    [18.2,20.1,22.1,24,25.9,27.9,29.8,33.6,37.4,44.9,52.4,59.7,67],
    [20.8,23.1,25.3,27.5,29.7,32,34.1,38.5,42.9,51.5,60,68.5,76.8],
    [21.5,23.8,26.1,28.4,30.7,33,35.2,39.8,44.2,53.1,61.9,70.6,79.2],
    [24.7,27.4,30,32.7,35.3,38,40.6,45.8,51,61.2,71.3,81.3,91.2],
    [27.9,30.9,33.9,36.9,39.9,42.9,45.9,51.8,57.6,69.2,80.6,91.8,102.9],
    [30.2,33.5,36.8,40.1,43.3,46.6,49.8,56.2,62.5,75,87.4,99.5,111.4],
    [34.1,37.8,41.5,45.2,48.9,52.6,56.2,63.4,70.6,84.7,98.5,112.1,125.4],
    [40.2,44.6,48.9,53.3,57.6,62,66.2,74.7,83.1,99.7,115.8,131.5,146.8],
    [46.1,51.2,56.2,61.2,66.2,71.1,76,85.7,95.3,114.1,132.3,149.9,166.9],
    [51.9,57.6,63.2,68.9,74.5,80,85.5,96.4,107.1,128,148.1,167.4],
    [55.4,61.5,67.6,73.6,79.6,85.5,91.3,102.9,114.3,136.4,157.5,177.7],
    [63,70,76.9,83.7,90.4,97.1,103.7,116.8,129.5,154],
    [69.7,77.4,85,92.6,100,107.3,114.5,128.7,142.5],
    [76.2,84.7,92.9,101.1,109.1,117.1,124.9,140.1,154.9],
    [82.5,91.6,100.5,109.3,117.9,126.4,134.7,150.9],
  ] };

  const M = v => v.mode || 'design';
  const on = (...ms) => v => ms.indexOf(M(v)) >= 0;
  const F = (x, d) => H.fmt(x, d);
  const pitchIn = v => (v.pitch || 8) / 25.4;
  const pdOf = (N, v) => T74[N] ? T74[N][0] : (N > 0 ? N * pitchIn(v || {}) / Math.PI : undefined);
  const odOf = N => T74[N] ? (isNaN(T74[N][1]) ? T74[N][0] : T74[N][1]) : undefined;
  const bushOf = (N, w) => (T74[N] && T74[N][2][w] !== undefined) ? T74[N][2][w] : undefined;
  const cdOf = (Lp, PD1, PD2) => { const B = 4 * Lp - 6.28 * (PD1 + PD2); const r = B * B - 32 * (PD2 - PD1) ** 2; return r >= 0 ? (B + Math.sqrt(r)) / 16 : undefined; };
  function gates4(hp, rpm) {
    const row = G4.find(r => r[0] >= hp - 1e-9); if (!row) return undefined;
    let ci = 0; G4_RPM.forEach((r, i) => { if (Math.abs(r - rpm) < Math.abs(G4_RPM[ci] - rpm)) ci = i; });
    const x = row[ci + 1]; return isNaN(x) ? undefined : x;
  }
  function rating(N, rpm, w) {
    const tab = w === 50 ? R50 : w === 30 ? R30 : null; if (!tab || !(rpm > 0)) return undefined;
    const ci = tab.cols.indexOf(N); if (ci < 0) return undefined;
    const rs = tab.rpm, val = i => tab.hp[i][ci];
    if (rpm < rs[0] || rpm > rs[rs.length - 1]) return undefined;
    for (let i = 0; i < rs.length; i++) {
      if (Math.abs(rpm - rs[i]) < 1e-9) return val(i);
      if (rpm < rs[i]) { const a = val(i - 1), b = val(i); if (a === undefined || b === undefined) return undefined; return a + (b - a) * (rpm - rs[i - 1]) / (rs[i] - rs[i - 1]); }
    }
    return undefined;
  }
  // belt for a sprocket pair: CD within CDnom ± tol when given, else the shortest Table 7-7 belt with D2 < CD < 3(D1 + D2)
  function chooseBelt(N1, N2, v, strict) {
    const P1 = pdOf(N1, v), P2 = pdOf(N2, v); if (!(P1 > 0 && P2 > 0)) return null;
    const lo = Math.max(P1, P2), hi = 3 * (P1 + P2);
    const list = BELTS77.map(b => ({ b, cd: cdOf(b / 25.4, P1, P2) })).filter(x => x.cd !== undefined && x.cd > lo && x.cd < hi);
    if (!list.length) return null;
    if (H.has(v, 'CDnom')) {
      const tol = v.CDtol > 0 ? v.CDtol : 0;
      const near = list.slice().sort((a, b) => Math.abs(a.cd - v.CDnom) - Math.abs(b.cd - v.CDnom));
      if (tol > 0 && Math.abs(near[0].cd - v.CDnom) > tol + 1e-9 && strict) return null;
      return near[0];
    }
    return list[0];
  }
  const widthsOf = v => v.width === '30' ? [30] : v.width === '50' ? [50] : [30, 50];
  // course steps 3–5 as one search: smallest driver at the nearest Table 7-7 ratio that passes Gates min, bores, D_max, CD and power
  function pick(v) {
    if (!H.has(v, 'VR', 'Pdes', 'n1') || v.VR < 1) return null;
    let best = Infinity; PAIRS.forEach(p => { const d = Math.abs(p[1] / p[0] - v.VR); if (d < best) best = d; });
    const group = PAIRS.filter(p => Math.abs(Math.abs(p[1] / p[0] - v.VR) - best) < 1e-9).sort((a, b) => a[0] - b[0]);
    for (const w of widthsOf(v)) for (const [N1, N2] of group) {
      if (H.has(v, 'PDmin') && pdOf(N1, v) < v.PDmin - 1e-9) continue;
      const b1 = bushOf(N1, w), b2 = bushOf(N2, w); if (b1 === undefined || b2 === undefined) continue;
      if (H.has(v, 'dsh1') && T75[b1] && (v.dsh1 > T75[b1][1] || v.dsh1 < T75[b1][0])) continue;
      if (H.has(v, 'dsh2') && T75[b2] && (v.dsh2 > T75[b2][1] || v.dsh2 < T75[b2][0])) continue;
      if (H.has(v, 'Dmax') && (odOf(N1) > v.Dmax || odOf(N2) > v.Dmax)) continue;
      const bt = chooseBelt(N1, N2, v, true); if (!bt) continue;
      const P = rating(N1, v.n1, w); if (P === undefined || P * (T711[bt.b] || 1) < v.Pdes) continue;
      return { N1, N2, belt: bt.b, w };
    }
    return null;
  }
  const nFast = v => Math.max(v.n1 || 0, v.n2a || 0);
  const nSmall = v => Math.min(v.N1, v.N2);
  function effWidth(v) {     // width actually used
    if (v.width === '30' || v.width === '50') return Number(v.width);
    if (!H.has(v, 'N1', 'N2')) return 30;
    const cl = T711[v.belt] || 1, r30 = rating(nSmall(v), nFast(v), 30);
    if (r30 !== undefined && (!H.has(v, 'Pdes') || r30 * cl >= v.Pdes)) return 30;
    return rating(nSmall(v), nFast(v), 50) !== undefined ? 50 : 30;
  }
  const bushTxt = (N, w) => { const b = bushOf(N, w); if (b === undefined) return 'not made in ' + w + ' mm'; if (!T75[b]) return String(b) + ' (plain bore)'; return b + ' — bore ' + T75[b][0].toFixed(3) + '–' + T75[b][1].toFixed(3) + ' in'; };

  // ---------------- sizing tables (★ = rule pick, Use fills the field) ----------------
  const inUse = c => c ? ' <span style="color:#2563eb;font-weight:400">← in use</span>' : '';
  // Mott Fig 7-27 pitch regions, digitised in the crop's pixel space (figures/mott/fig7-27.png, lines located by pixel scan):
  // x = 134 + 302.75 log10(hp/0.1), y = 948 − 300 log10(rpm/10); boundary lines x = x0 + k (y0 − y) with their plateaus.
  function fig727(P, n) {
    if (!(P > 0) || !(n > 0)) return undefined;
    const x = 134 + 302.75 * Math.log10(P / 0.1), y = 948 - 300 * Math.log10(n / 10);
    const hpAt = xx => 0.1 * 10 ** ((xx - 134) / 302.75);
    const b58 = y >= 202.5 ? 233 + 0.990 * (700 - y) : y >= 167 ? 725.5 : Infinity;
    const b814 = y >= 263.6 ? 380 + 1.0134 * (940 - y) : y >= 167 ? 1065.5 : b58;
    const b1420 = y >= 432.4 ? 659.5 + 1.0153 * (940 - y) : y >= 205 ? 1174.5 : b814;
    const b20 = y >= 413 ? 813 + 1.0096 * (940 - y) : y >= 256 ? 1345 : b1420;
    const rows = [{ p: 5, lo: -Infinity, hi: b58 }, { p: 8, lo: b58, hi: b814 }, { p: 14, lo: b814, hi: b1420 }, { p: 20, lo: b1420, hi: b20 }];
    let pick = -1;
    rows.forEach((r, i) => { r.inR = x > r.lo && x <= r.hi; r.hpLo = r.lo === -Infinity ? 0 : hpAt(r.lo); r.hpHi = r.hi === Infinity ? Infinity : hpAt(r.hi); r.none = r.hi <= r.lo + 0.5; if (r.inR && pick < 0) pick = i; });
    let nearLine = false;
    if (pick >= 0 && rows[pick].hi - x < 12 && pick + 1 < rows.length && !rows[pick + 1].none) { pick++; nearLine = true; }
    return { rows, pick, nearLine, outside: x > b20 };
  }
  const hpRange = r => r.none ? 'none at this speed' : (r.hpLo > 0 ? F(r.hpLo, 3) : '0') + '–' + (r.hpHi === Infinity ? '…' : F(r.hpHi, 3)) + ' hp';
  function pitchTableHtml(v) {
    if (!H.has(v, 'Pdes', 'n1')) return '';
    const nf = Math.max(v.n1, H.has(v, 'n2') ? v.n2 : 0), c = fig727(v.Pdes, nf); if (!c) return '';
    const rows = c.rows.map((r, i) => ({ cells: [r.p + ' mm' + (r.p === 8 ? ' (8MGT)' : '') + inUse(Number(v.pitch) === r.p), hpRange(r), r.inR ? 'yes' : 'no', r.p === 8 ? 'Tables 7-4 … 7-11' : 'manufacturer\'s catalogue only'], ok: r.inR, pick: i === c.pick, set: { pitch: r.p } }));
    return H.table(['Pitch', 'Fig 7-27 region at ' + F(nf) + ' rpm', 'P_des = ' + F(v.Pdes) + ' hp inside?', 'Sprocket/rating data'], rows,
      { caption: 'Select the belt pitch — Fig 7-27 at the faster-shaft speed', note: (c.nearLine ? '<b>Within ≈10 % of a boundary → the larger pitch is picked.</b> ' : '') + (c.outside ? 'Outside the chart — consult the manufacturer. ' : '') + 'Rule: the pitch whose region on Fig 7-27 contains (P<sub>des</sub>, rpm of the faster shaft) (Timing s6). Mott tabulates only 8 mm ("I could bet my entire fortune that it will be 8 mm", Mech p.28) — HW1 P4 (9 hp, 1750 rpm) and Mott Ex 7-4 (34 hp, 1750 rpm) are both 8 mm. Regions digitised from the figure (±5 %).' });
  }
  // sprocket-pair candidates: same checks as pick(), reported per pair and width
  function evalPair(v, N1, N2) {
    const P1 = pdOf(N1, v), P2 = pdOf(N2, v), out = { N1, N2, P1, P2, VRp: N2 / N1, why: [] };
    out.okMin = !(H.has(v, 'PDmin') && P1 < v.PDmin - 1e-9);
    out.okD = !(H.has(v, 'Dmax') && (odOf(N1) > v.Dmax || odOf(N2) > v.Dmax));
    const bt = chooseBelt(N1, N2, v, true); out.belt = bt ? bt.b : undefined; out.cd = bt ? bt.cd : undefined;
    out.w = {};
    [30, 50].forEach(w => {
      const b1 = bushOf(N1, w), b2 = bushOf(N2, w);
      let bore = b1 !== undefined && b2 !== undefined;
      if (bore && H.has(v, 'dsh1') && T75[b1] && (v.dsh1 > T75[b1][1] || v.dsh1 < T75[b1][0])) bore = false;
      if (bore && H.has(v, 'dsh2') && T75[b2] && (v.dsh2 > T75[b2][1] || v.dsh2 < T75[b2][0])) bore = false;
      const P = rating(N1, v.n1, w), Pa = (P !== undefined && bt) ? P * (T711[bt.b] || 1) : undefined;
      out.w[w] = { bore, Pa, okP: Pa !== undefined && H.has(v, 'Pdes') && Pa >= v.Pdes, made: b1 !== undefined && b2 !== undefined };
    });
    out.ok = out.okMin && out.okD && !!bt && (out.w[30].bore && out.w[30].okP || out.w[50].bore && out.w[50].okP);
    return out;
  }
  function pairTableHtml(v) {
    if (M(v) !== 'design' || !H.has(v, 'VR', 'n1') || v.VR < 1) return '';
    let best = Infinity; PAIRS.forEach(p => { const d = Math.abs(p[1] / p[0] - v.VR); if (d < best) best = d; });
    const cand = PAIRS.filter(p => Math.abs(p[1] / p[0] - v.VR) <= Math.max(best + 1e-9, 0.02 * v.VR)).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const pk = pick(v);
    const yesno = (b, t) => b ? (t || 'yes') : 'no';
    const rows = cand.map(([N1, N2]) => {
      const e = evalPair(v, N1, N2);
      const wc = w => !e.w[w].made ? 'not made' : !e.w[w].bore ? 'bore ✘' : e.w[w].Pa === undefined ? '—' : F(e.w[w].Pa, 3) + ' hp' + (e.w[w].okP ? ' ✔' : ' ✘');
      return { cells: [N1 + ' : ' + N2 + inUse(v.N1 === N1 && v.N2 === N2), F(e.VRp, 4) + ' (' + F(v.n1 / e.VRp) + ' rpm)', F(e.P1, 4) + ' in' + (e.okMin ? '' : ' < ' + F(v.PDmin) + ' ✘'), yesno(e.okD, H.has(v, 'Dmax') ? 'yes' : '—'), e.belt ? e.belt + ' (CD ' + F(e.cd) + ')' : 'none in range ✘', wc(30), wc(50)],
        ok: e.ok, pick: !!(pk && pk.N1 === N1 && pk.N2 === N2), set: { N1, N2, PD1: '', PD2: '', belt: '' } };
    });
    return H.table(['N_1 : N_2', 'VR (n_2)', 'PD_1 (≥ Gates min)', 'OD ≤ D_max', 'Belt (CD in)', 'P_rated·C_L 30 mm', 'P_rated·C_L 50 mm'], rows,
      { caption: 'Select the sprockets — Table 7-7 pairs for VR = ' + F(v.VR, 4) + (H.has(v, 'Pdes') ? ', P_des = ' + F(v.Pdes) + ' hp' : ''),
        note: 'Rule (Fizz p.20–23, Mech p.29, Mott Ex 7-4): list every Table 7-7 pair at the ratio, then eliminate — driver PD below the Gates Table 4 minimum (course step 3), bushing bores that cannot fit the shafts (Table 7-4/7-5), flange OD above D<sub>max</sub>, no belt giving the CD, rating × C<sub>L</sub> below P<sub>des</sub> — and keep the <b>smallest driver</b>, at the narrowest width that works (30 mm before 50 mm). HW1 P4: 32:80 or 36:90 → 32:80; Mott Ex 7-4: 56:112. Use also clears the belt and PDs so they re-fill.' });
  }
  function beltTableHtml(v) {
    if (!H.has(v, 'N1', 'N2') || !(v.pitch === 8 || !H.has(v, 'pitch'))) return '';
    const P1 = H.has(v, 'PD1') ? v.PD1 : pdOf(v.N1, v), P2 = H.has(v, 'PD2') ? v.PD2 : pdOf(v.N2, v); if (!(P1 > 0 && P2 > 0)) return '';
    const lo = Math.max(P1, P2), hi = 3 * (P1 + P2), hasNom = H.has(v, 'CDnom'), tol = v.CDtol > 0 ? v.CDtol : 0;
    const cb = chooseBelt(v.N1, v.N2, v, false), pb = cb ? cb.b : undefined;
    const all = BELTS77.map(b => { const cd = cdOf(b / 25.4, P1, P2); const th = cd ? 180 - 2 * H.deg(Math.asin(Math.abs(P2 - P1) / (2 * cd))) : undefined; return { b, cd, th, inR: cd !== undefined && cd > lo && cd < hi, inNom: hasNom && cd !== undefined && Math.abs(cd - v.CDnom) <= tol + 1e-9 }; });
    let pi = all.findIndex(r => r.b === pb); if (pi < 0) pi = 0;
    const shown = all.slice(Math.max(0, pi - 2), pi + 5);
    const rows = shown.map(r => ({ cells: [r.b + '-8MGT (' + Math.round(r.b / 8) + ' teeth)' + inUse(v.belt === r.b), F(r.b / 25.4, 4) + ' in', r.cd !== undefined ? F(r.cd, 4) + ' in' : '—', r.inR ? 'yes' : 'no', hasNom ? (r.inNom ? 'yes' : 'no') + ' (' + (r.cd !== undefined ? (r.cd - v.CDnom >= 0 ? '+' : '') + F(r.cd - v.CDnom, 3) : '—') + ')' : '—', T711[r.b] !== undefined ? F(T711[r.b]) : '—', r.th ? Math.floor(Math.min(v.N1, v.N2) * r.th / 360) : '—'],
      ok: hasNom ? r.inR && (tol > 0 ? r.inNom : true) : r.inR, pick: r.b === pb, set: { belt: r.b } }));
    return H.table(['Belt', 'L_p', 'CD (Mott 7-13)', 'D_2 < CD < 3(D_1+D_2)?', hasNom ? 'within ' + F(v.CDnom) + ' ± ' + F(tol) + ' in?' : 'CD given?', 'C_L (Table 7-11)', 'teeth in mesh'], rows,
      { caption: 'Select the belt length — Table 7-7 belts for ' + v.N1 + ' : ' + v.N2,
        note: 'Rule: ' + (hasNom ? 'the belt whose CD is closest to the given ' + F(v.CDnom) + ' in, within ± the slot adjustment (Fizz p.23, Mech p.31, Mott Ex 7-4).' : 'no CD given → the shortest Table 7-7 belt with D<sub>2</sub> &lt; CD &lt; 3(D<sub>1</sub> + D<sub>2</sub>) (course step 4; HW1 P4: 920-8MGT, CD 8.97 in — the student solution\'s 1040-8MGT, CD 11.40 in, is also inside the range).') + ' C<sub>L</sub> multiplies the rating in the next step; at least 6 teeth in mesh.' });
  }
  function widthTableHtml(v) {
    if (!H.has(v, 'N1', 'N2', 'n1')) return '';
    const Ns = nSmall(v), nf = nFast(v), cl = H.has(v, 'CL') ? v.CL : (T711[v.belt] || 1), ew = effWidth(v);
    const rows = [20, 30, 50, 85].map(w => {
      const P = (w === 30 || w === 50) ? rating(Ns, nf, w) : undefined, Pa = P !== undefined ? P * cl : undefined;
      const ok = Pa !== undefined && (!H.has(v, 'Pdes') || Pa >= v.Pdes);
      return { cells: [w + ' mm' + inUse((v.width === String(w)) || (v.width === 'auto' && ew === w)), w === 30 ? 'Table 7-9' : w === 50 ? 'Table 7-10' : 'not in Mott (catalogue)', P !== undefined ? F(P, 3) + ' hp' : '—', Pa !== undefined ? F(Pa, 3) + ' hp' : '—', H.has(v, 'Pdes') && Pa !== undefined ? F(Pa / v.Pdes, 3) : '—'],
        ok: Pa === undefined ? false : ok, pick: w === ew && ok, set: (w === 30 || w === 50) ? { width: String(w), Prated: '' } : undefined };
    });
    return H.table(['Width', 'Rating table', 'P_rated (' + Ns + ' T, ' + F(nf) + ' rpm)', 'P_adj = P_rated·C_L (' + F(cl) + ')', 'SF = P_adj/P_des'], rows,
      { caption: 'Select the belt width' + (H.has(v, 'Pdes') ? ' — P_des = ' + F(v.Pdes) + ' hp' : ''), note: 'Rule: the narrowest width whose adjusted rating covers P<sub>des</sub> (Timing s9: "select the width to exceed the design hp"). Mott prints only 30 mm (Table 7-9) and 50 mm (Table 7-10); 20 and 85 mm need the manufacturer\'s catalogue. HW1 P4: 30 mm, 21.2 hp ≥ 9.0 hp. Mech p.31 suggests starting at 50 mm — safe but usually wider than needed. Use clears a typed P<sub>rated</sub>.' });
  }

  const MODES = [
    { value: 'design', label: 'Design a drive — pitch, sprockets, belt, width and CD (course 7 steps, Mott 7-8)' },
    { value: 'check', label: 'Check an existing drive — rated vs design power, SF, belt speed, length correction' },
    { value: 'kin', label: 'Kinematics only — pitch diameters, ratio, output speed, belt speed, CD (Mott Ex 7-3)' },
  ];
  const HELP = {
    design: '<b>Given</b> motor power and speed, required output speed, driven machine and hours (optionally CD ± slot, shaft sizes, max sprocket OD). <b>Asked</b> SF, design power, pitch, sprockets, belt, width, CD, SF = P<sub>allow</sub>/P<sub>des</sub>, belt speed and the part numbers. Steps follow the course\'s 7 steps (HW1 P4, Mott Ex 7-4); sprockets, belt and width are auto-picked — type over any yellow field to try your own.',
    check: '<b>Given</b> an existing drive: power, speed, service, sprockets, belt, width. <b>Asked</b> whether the belt rating (× C<sub>L</sub>) covers the design power, the actual SF, the largest motor power it can carry, the belt speed and teeth in mesh.',
    kin: '<b>Given</b> sprockets, belt and input speed. <b>Asked</b> pitch diameters, velocity ratio, driven speed, belt speed and centre distance (Mott Ex 7-3).',
  };

  function result(v) {
    const m = M(v), ok = '<span class="result-ok">', bad = '<span class="result-bad">', e = '</span>';
    const life = ' Expect a belt life of 3–5 years (replace annually in critical drives).';
    if (!H.has(v, 'N1', 'N2', 'belt')) return m === 'design' && H.has(v, 'Pdes', 'VR') ? bad + 'No Table 7-7 combination passes' + e + ' — relax a limit, check the pitch on Fig. 7-27 (14 mm needs the manufacturer\'s tables), or enter sprockets by hand.' : '';
    const vOK = !H.has(v, 'vb') || v.vb <= 6500, tOK = !H.has(v, 'TIM') || v.TIM >= 6;
    if (m === 'kin') return ok + 'Kinematics' + e + ' — PD<sub>1</sub> = ' + F(v.PD1) + ' in, PD<sub>2</sub> = ' + F(v.PD2) + ' in, VR = ' + F(v.VRa) + ', driven speed ' + F(v.n2a) + ' rpm, belt speed ' + F(v.vb) + ' ft/min' + (vOK ? '' : ' (' + bad + '> 6500' + e + ')') + ', CD = ' + F(v.CD) + ' in with the ' + v.belt + '-8MGT belt (' + F(v.Nbelt) + ' teeth).';
    const pOK = H.has(v, 'Padj', 'Pdes') && v.Padj >= v.Pdes, w = effWidth(v), p = v.pitch || 8;
    const verdict = (pOK && vOK && tOK ? ok + 'PASS' + e : bad + 'CHECK' + e);
    const sf = H.has(v, 'SFa') ? ' → SF = ' + F(v.Padj) + '/' + F(v.Pdes) + ' = ' + F(v.SFa, 3) : '';
    if (m === 'check') return verdict + ' — P<sub>adj</sub> = P<sub>rated</sub> × C<sub>L</sub> = ' + F(v.Prated) + ' × ' + F(v.CL) + ' = ' + F(v.Padj) + ' hp ' + (pOK ? '≥' : '&lt;') + ' P<sub>des</sub> = ' + F(v.Pdes) + ' hp' + sf +
      '; the drive can carry up to ' + F(v.Pmax) + ' hp of motor power at SF ' + F(v.SF) + '; belt speed ' + F(v.vb) + ' ft/min' + (vOK ? ' (< 6500)' : ' (' + bad + '> 6500' + e + ')') + '; ' + F(v.TIM) + ' teeth in mesh' + (tOK ? '.' : ' (' + bad + '< 6' + e + ').') + life;
    return verdict + ' — Specify P' + v.N1 + '-' + p + 'MGT-' + w + ' (driver, ' + bushTxt(v.N1, w).split(' —')[0] + ' bushing), P' + v.N2 + '-' + p + 'MGT-' + w + ' (driven, ' + bushTxt(v.N2, w).split(' —')[0] + ' bushing) and a ' + v.belt + '-' + p + 'MGT-' + w + ' belt; CD = ' + F(v.CD) + ' in; output ' + F(v.n2a) + ' rpm. ' +
      'P<sub>adj</sub> = ' + F(v.Prated) + ' × ' + F(v.CL) + ' = ' + F(v.Padj) + ' hp vs P<sub>des</sub> = ' + F(v.Pdes) + ' hp' + sf + '; v = ' + F(v.vb) + ' ft/min' + (vOK ? (v.vb > 4000 ? ' (above the 3500–4000 target: noisier)' : ' (< 6500)') : ' (' + bad + '> 6500' + e + ')') + '.' + life;
  }

  window.makeTopic_timing_belts = function (book) {
    const shig = book === 'shigley';
    return {
      id: 'timing_belts', book: book,
      title: 'Synchronous (Timing) Belts — Drive Selection',
      subtitle: shig ? 'Shigley §17-4 has no selection method — course uses Mott 7-8 tables + Gates Table No. 4' : 'Mott 7-8 (Tables 7-4 … 7-11, Fig. 7-27) · course 7-step procedure + Gates Table No. 4',
      sibling: shig ? 'timing_belts_mott.html' : 'timing_belts_shigley.html',
      intro: (shig ? '<b>Shigley §17-4 gives only the nomenclature</b> (Fig. 17-15) and inch pitches (Table 17-18) and says timing-belt selection "is so similar to V belts that it will not be presented" — the course, Fizz and Mech all use Mott, so this page does too (figures marked Mott). ' : '') +
        'Pick what the question asks in step 1; only the steps it needs are shown, in the order of the course procedure (Timing Belts s5–s11): ① P<sub>des</sub> = P<sub>rated</sub> × SF (Table 7-8) → ② pitch (Fig. 7-27) → ③ small sprocket ≥ Gates Table No. 4 minimum → ④ sprockets, belt and CD (Table 7-7) → ⑤ width (Table 7-9/7-10) → ⑥ speed &lt; 6500 ft/min and P<sub>rated</sub> × C<sub>L</sub> (Table 7-11) → ⑦ fittings (Table 7-4/7-5). ' +
        'Every table is built in: yellow fields fill themselves; type over one to try a different sprocket, belt or chart reading.',
      example: { mode: 'design', P: 5, n1: 1750, n2: 700, cls: '5', drv: 'normal', hrs: '24', SF: '', CDnom: '', CDtol: '', dsh1: '', dsh2: '', Dmax: '', pitch: 8, PDmin: '', N1: '', N2: '', PD1: '', PD2: '', belt: '', width: 'auto', Prated: '', CL: '' },

      assumptions: [
        { text: 'Service factor from Mott Table 7-8 (the same table as Gates Table No. 5 on slide 5): driven-machine class × driver × hours per day', src: 'Timing s5 · Fizz p.18–19 · Mech p.27–28', var: 'SF' },
        { text: 'Belt pitch 8 mm — the only pitch Mott tabulates ("I could bet my entire fortune that it will be 8 mm"); still confirm on Fig. 7-27', src: 'Fizz p.20 · Mech p.28 · HW1 P4', var: 'pitch' },
        { text: 'The driver is a general-purpose electric motor, so the small sprocket must be at least the NEMA minimum PD of Gates Table No. 4 (motor hp rounded up, nearest rpm column) — course step 3, which the guides skip; type 0 for an engine drive', src: 'Timing s7 (course) · HW1 P4', var: 'PDmin' },
        { text: 'Sprocket pairs from Table 7-7 at the nearest listed ratio; the auto-pick takes the smallest driver that passes the Gates minimum, shaft bores (Table 7-4/7-5), D_max, CD and power ("list them all, then eliminate")', src: 'Fizz p.20–23 · Mech p.29 · Mott Ex 7-4', },
        { text: 'No centre distance given: course rule D_2 < CD < 3(D_1 + D_2) with the shortest Table 7-7 belt that meets it (HW1 P4: 920-8MGT, CD 8.97 in). CD given: the belt closest to it, within ± the slot adjustment', src: 'Timing s8 · HW1 P4 · Mech p.27 fn 20 · Fizz p.23', var: 'CDtol' },
        { text: 'CD from the belt pitch length by Mott Eq. 7-13, B = 4L_p − 6.28(PD_2 + PD_1); it reproduces Table 7-7 to ±0.01 in', src: 'Mott Eq. 7-12/7-13 · Fizz p.16' },
        { text: 'Belt width: the narrowest Mott table width that carries P_des — 30 mm first, then 50 mm (HW1 P4 and Mott Ex 7-4 both end at 30 mm). Mech suggests starting at 50 mm: safe, but usually wider than needed', src: 'Timing s9 · HW1 P4 · Mech p.31 fn 25', var: 'width', value: 'auto' },
        { text: 'Rated power from Table 7-9 (30 mm) / 7-10 (50 mm) by small-sprocket teeth and rpm of the faster shaft, interpolated linearly on rpm', src: 'Timing s9 · Mech p.31 fn 24', var: 'Prated' },
        { text: 'P_adj = P_rated × C_L (Table 7-11) must be at least P_des; SF = P_allowable/P_design. Fizz p.25 only says P_adj may differ from P_des — the course requires it to exceed it', src: 'Timing s9–s10 · HW1 P4 · Mech p.31', var: 'CL' },
        { text: 'Belt speed below 6500 ft/min (hard limit); 3500–4000 ft/min is the target (HW1 compares with 3500)', src: 'Timing s4, s10 · Fizz p.25 · Mech p.33' },
        { text: 'At least 6 teeth in mesh on the small sprocket; ratios mostly below 6:1', src: 'Timing s4' },
        { text: 'Bushings from the Table 7-4 column of the chosen width (Mott Ex 7-4 eliminates pairs with the 20 mm column; with 30 mm the final drive is the same 56:112)', src: 'Mott Tables 7-4/7-5 · Fizz p.21–22' },
        { text: 'Belt life 3–5 years in typical industrial service; replace annually in critical drives', src: 'Timing s12' },
      ],

      figures: [
        { id: 'table7-8', ref: 'Table 7-8', book: 'mott', title: 'Service factor SF (driven machine × driver × hours) — same as Gates Table No. 5 (slide 5)', src: 'figures/mott/table7-8.png', page: 286 },
        { id: 'fig7-27', ref: 'Figure 7-27', book: 'mott', title: 'Belt pitch selection guide for GT belts (design hp vs rpm of the faster shaft)', src: 'figures/mott/fig7-27.png', page: 287, note: 'Expect 8 mm: the only pitch with tables in Mott (7-4 … 7-11).' },
        { id: 'gates4', ref: 'Gates Table 4 (s7)', book: 'course', title: 'Minimum sprocket pitch diameters for general-purpose electric motors (NEMA) — motor hp × rpm', src: 'figures/course/timing_gates_min_sprocket_dia_table4.png', note: '"Not in Mott." Motor sprocket PD ≥ this. 5 hp @ 1750 → 2.7 in; 10 hp → 3.4; 20 hp → 4.0. (20 hp @ 3450 prints 2.2 — likely a misprint.)' },
        { id: 'gates4-full', ref: 'Gates Table No. 4 (catalogue p.16)', book: 'course', title: 'Minimum recommended sprocket pitch diameters for general-purpose electric motors (synchronous belt drives), full table with footnotes', src: 'figures/course/gates_timing_table4_min_sprocket_pd.png', note: 'Catalogue - Gates Timing Belts Design Guide (1).pdf p.16 (printed p.14) — original of the slide-7 crop. Motor hp row × motor rpm column (60 Hz; 50 Hz rpm marked *).' },
        { id: 'gates5', ref: 'Gates Table No. 5 (catalogue p.17)', book: 'course', title: 'Poly Chain GT Carbon service factors: driven machine × driver (normal / high torque) × service hours', src: 'figures/course/gates_timing_table5_service_factors.png', note: 'Catalogue - Gates Timing Belts Design Guide (1).pdf p.17 (printed p.15) — the table on slide 5. Same values as Mott Table 7-8.' },
        { id: 'table7-7a', ref: 'Table 7-7 (a)', book: 'mott', title: '8 mm GT drive selection table — VR 1.000–1.333: centre distance for each belt', src: 'figures/mott/table7-7a.png', page: 284, note: 'Rows = driver:driven teeth, columns = belt (pitch length mm, teeth); entries = CD in inches.' },
        { id: 'table7-7b', ref: 'Table 7-7 (b)', book: 'mott', title: '8 mm GT drive selection table — VR 1.333–3.000 (continued)', src: 'figures/mott/table7-7b.png', page: 285 },
        { id: 'table7-4', ref: 'Table 7-4', book: 'mott', title: '8 mm sprockets: pitch dia, flange dia, part number and bushing for each belt width', src: 'figures/mott/table7-4.png', page: 282 },
        { id: 'table7-5', ref: 'Table 7-5', book: 'mott', title: 'Taper-lock bushings: min and max bore', src: 'figures/mott/table7-5.png', page: 282 },
        { id: 'table7-9', ref: 'Table 7-9', book: 'mott', title: '8M GT belt power rating — 30 mm width (rpm of faster shaft × small-sprocket teeth)', src: 'figures/mott/table7-9.png', page: 288, note: 'Interpolate on rpm.' },
        { id: 'table7-10', ref: 'Table 7-10', book: 'mott', title: '8M GT belt power rating — 50 mm width', src: 'figures/mott/table7-10.png', page: 289 },
        { id: 'table7-11', ref: 'Table 7-11', book: 'mott', title: '8M GT belt length correction factor C_L by belt designation', src: 'figures/mott/table7-11.png', page: 290 },
        { id: 'table7-6', ref: 'Table 7-6', book: 'mott', title: 'Synchronous belt types and sizes (pitches, widths, lengths)', src: 'figures/mott/table7-6.png', page: 283 },
        { id: 'fig7-28', ref: 'Figure 7-28', book: 'mott', title: 'Synchronous belt drive nomenclature (Example 7-3)', src: 'figures/mott/fig7-28.png', page: 290 },
        { id: 'fig7-26', ref: 'Figure 7-26', book: 'mott', title: 'Drive with adjustable centre distance and tensioner', src: 'figures/mott/fig7-26.png', page: 283 },
        { id: 'fig7-4', ref: 'Figure 7-4', book: 'mott', title: 'Belt/chain drive geometry — wrap angle', src: 'figures/mott/fig7-4.png', page: 265 },
        { id: 'fig17-15', ref: 'Figure 17-15', book: 'shigley', title: 'Timing-belt drive: pitch line, pitch circle, outside and root diameters', src: 'figures/shigley/fig17-15.png', page: 929 },
        { id: 'table17-18', ref: 'Table 17-18', book: 'shigley', title: 'Standard inch pitches of timing belts (XL, L, H, XH, XXH)', src: 'figures/shigley/table17-18.png', page: 930, note: 'Inch series; the course uses the metric 8 mm GT tables in Mott.' },
      ],

      sections: [
        { title: '1 · What does the question ask?', steps: [
          { id: 'q', title: 'Question type',
            vars: [{ id: 'mode', label: 'The question asks for…', kind: 'choice', type: 'text', allowBlank: false, default: 'design', options: MODES }],
            after: v => HELP[M(v)] || '' },
        ] },

        { title: '2 · Problem data', steps: [
          { id: 'in', title: 'Power and speeds', fig: shig ? ['fig17-15', 'fig7-28'] : ['fig7-28'],
            vars: [
              { id: 'P', symbol: 'P_{rated}', label: 'Motor (rated) power', unit: 'hp', kind: 'input', hint: 'not needed for kinematics' },
              { id: 'n1', symbol: 'n_1', label: 'Driving (motor) sprocket speed', unit: 'rpm', kind: 'input' },
              { id: 'n2', symbol: 'n_2', label: 'Required driven speed', unit: 'rpm', kind: 'input', hint: 'design question; otherwise optional' },
              { id: 'VR', symbol: 'VR', label: 'Velocity ratio n_1/n_2', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'n1', 'n2') ? v.n1 / v.n2 : undefined,
                check: v => (H.has(v, 'VR') && v.VR < 1 && M(v) === 'design') ? 'Speed increaser — Table 7-7 lists reducers; enter the sprockets by hand' : null },
            ] },
          { id: 'sf', title: 'Course step 1: service factor and design power', when: on('design', 'check'), fig: ['table7-8', 'gates5'],
            formula: 'P_{des} = P_{rated}\\times SF',
            vars: [
              { id: 'cls', label: 'Driven machine (Table 7-8 row)', kind: 'choice', type: 'text', options: CLASSES },
              { id: 'drv', label: 'Driver', kind: 'choice', type: 'text', options: [
                { value: 'normal', label: 'Normal torque — AC squirrel-cage, synchronous, split-phase, inverter; DC shunt/stepper; multi-cylinder engine' },
                { value: 'high', label: 'High torque — AC high-slip, single-phase, slip-ring; DC series/compound/servo; 1-cylinder engine, line shafts, clutches' }] },
              { id: 'hrs', label: 'Service', kind: 'choice', type: 'text', options: [{ value: '8', label: 'Intermittent — up to 8 h/day or seasonal' }, { value: '16', label: 'Normal — 8–16 h/day' }, { value: '24', label: 'Continuous — 16–24 h/day' }] },
              { id: 'SF', symbol: 'SF', label: 'Service factor', unit: '', kind: 'lookup', fig: 'table7-8', hint: 'Table 7-8 (auto from the three choices above)',
                auto: v => (T78[v.cls] && v.drv && v.hrs) ? T78[v.cls][v.drv][{ 8: 0, 16: 1, 24: 2 }[v.hrs]] : undefined,
                check: v => (H.has(v, 'SF') && (v.SF < 1 || v.SF > 2.5)) ? 'Table 7-8 gives 1.0–2.5' : null },
              { id: 'Pdes', symbol: 'P_{des}', label: 'Design power', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'P', 'SF') ? v.P * v.SF : undefined,
                work: v => H.has(v, 'Pdes') ? '\\(P_{des} = ' + F(v.P) + '(' + F(v.SF) + ') = ' + F(v.Pdes) + '\\ \\text{hp}\\)' : null },
            ] },
          { id: 'lim', title: 'Limits given in the question (optional)', when: on('design'), fig: ['fig7-26', 'table7-5'],
            text: 'Leave blank what the question does not give. A centre distance with slots (Mott Ex 7-4: 22 ± 0.375 in) makes the belt pick stay in range; shaft sizes eliminate sprockets whose bushing cannot be bored to fit; D<sub>max</sub> eliminates large sprockets.',
            vars: [
              { id: 'CDnom', symbol: 'CD_{nom}', label: 'Nominal centre distance', unit: 'in', kind: 'input', hint: 'blank = course rule D_2 < CD < 3(D_1 + D_2)' },
              { id: 'CDtol', symbol: '\\pm', label: 'Centre-distance adjustment', unit: 'in', kind: 'input', default: 0, hint: 'half the slot length' },
              { id: 'dsh1', symbol: 'd_{shaft,1}', label: 'Motor shaft diameter', unit: 'in', kind: 'input' },
              { id: 'dsh2', symbol: 'd_{shaft,2}', label: 'Driven shaft diameter', unit: 'in', kind: 'input' },
              { id: 'Dmax', symbol: 'D_{max}', label: 'Largest sprocket OD allowed', unit: 'in', kind: 'input' },
            ] },
          { id: 'pitch', title: 'Course steps 2–3: belt pitch and smallest motor sprocket', when: on('design', 'check'), fig: ['fig7-27', 'gates4', 'gates4-full', 'table7-6'],
            text: 'Fig. 7-27: design power vs rpm of the faster shaft — the table below lists every pitch with its region at your speed (★ = the region containing the point). Gates Table No. 4: the motor sprocket pitch diameter must be at least this (limits the belt pull on the motor bearings).',
            vars: [
              { id: 'pitch', label: 'Belt pitch (Fig. 7-27)', kind: 'choice', allowBlank: false, options: [{ label: '5 mm', value: 5 }, { label: '8 mm (8MGT) — tabulated in Mott', value: 8 }, { label: '14 mm', value: 14 }, { label: '20 mm', value: 20 }], default: 8,
                check: v => (H.has(v, 'pitch') && v.pitch !== 8) ? 'Mott only tabulates 8 mm: sprocket, belt and rating auto-fills below assume 8 mm' : null },
              { id: 'PDmin', symbol: 'PD_{min}', label: 'Minimum motor-sprocket PD (Gates Table 4)', unit: 'in', kind: 'lookup', fig: 'gates4', hint: 'Gates Table No. 4: motor hp × rpm; 0 if not a motor', auto: v => H.has(v, 'P', 'n1') ? gates4(v.P, v.n1) : undefined },
            ],
            after: v => pitchTableHtml(v) },
        ] },

        { title: '3 · Solution', steps: [
          { id: 'spk', title: 'Course step 4: sprockets for the ratio', fig: ['table7-7a', 'table7-7b', 'table7-4'], eq: '7-4',
            formula: 'VR = \\frac{N_2}{N_1},\\qquad PD = \\frac{N\\,p}{\\pi}\\ \\text{(Table 7-4)}',
            text: 'Design: the table below lists the Table 7-7 pairs at the ratio with every elimination check (Gates minimum, bores, D<sub>max</sub>, CD, power at 30/50 mm); the ★ pair — the smallest driver that passes — is the auto value. Check/kinematics: enter the given sprockets.',
            vars: [
              { id: 'N1', symbol: 'N_1', label: 'Driver sprocket teeth', unit: '', kind: 'lookup', fig: 'table7-7b', hint: 'Table 7-7 (design: auto-picked)', auto: v => M(v) === 'design' ? (pick(v) || {}).N1 : undefined },
              { id: 'N2', symbol: 'N_2', label: 'Driven sprocket teeth', unit: '', kind: 'lookup', fig: 'table7-7b', hint: 'Table 7-7 (design: auto-picked)',
                auto: v => { if (M(v) !== 'design') return undefined; const p = pick(v); if (p && p.N1 === v.N1) return p.N2; if (!H.has(v, 'N1', 'VR')) return undefined;
                  const c = PAIRS.filter(q => q[0] === v.N1).sort((a, b) => Math.abs(a[1] / a[0] - v.VR) - Math.abs(b[1] / b[0] - v.VR)); return c.length ? c[0][1] : Math.round(v.N1 * v.VR); } },
              { id: 'VRa', symbol: 'VR', label: 'Actual velocity ratio', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'N1', 'N2') ? v.N2 / v.N1 : undefined,
                check: v => (H.has(v, 'VRa', 'VR') && Math.abs(v.VRa / v.VR - 1) > 0.02) ? 'Differs from the required ratio by more than 2 %' : (H.has(v, 'VRa') && Math.max(v.VRa, 1 / v.VRa) > 6) ? 'Ratio above 6:1 (slide 4: mostly below 6:1)' : null },
              { id: 'n2a', symbol: 'n_2', label: 'Actual driven speed', unit: 'rpm', kind: 'calc', compute: v => H.has(v, 'n1', 'VRa') ? v.n1 / v.VRa : undefined },
              { id: 'PD1', symbol: 'PD_1', label: 'Driver pitch diameter', unit: 'in', kind: 'lookup', fig: 'table7-4', hint: 'Table 7-4', auto: v => H.has(v, 'N1') ? pdOf(v.N1, v) : undefined,
                check: v => (H.has(v, 'PD1', 'PDmin') && v.PD1 < v.PDmin - 1e-9 && M(v) !== 'kin') ? 'Below the Gates Table 4 minimum ' + F(v.PDmin) + ' in — use a larger motor sprocket' : null },
              { id: 'PD2', symbol: 'PD_2', label: 'Driven pitch diameter', unit: 'in', kind: 'lookup', fig: 'table7-4', hint: 'Table 7-4', auto: v => H.has(v, 'N2') ? pdOf(v.N2, v) : undefined },
            ],
            after: v => pairTableHtml(v) },
          { id: 'blt', title: 'Course step 4: belt and centre distance', fig: ['table7-7a', 'table7-7b', 'table7-11'], eq: shig ? '17-1, 17-16b ≡ Mott 7-13' : '7-12, 7-13, 7-14',
            formula: 'L_p = \\frac{N_{belt}\\,p}{25.4},\\quad B = 4L_p - 6.28(PD_2 + PD_1),\\quad CD = \\frac{B + \\sqrt{B^2 - 32(PD_2 - PD_1)^2}}{16}',
            vars: [
              { id: 'belt', symbol: '', label: 'Belt designation = pitch length', unit: 'mm', kind: 'lookup', fig: 'table7-7b', hint: 'Table 7-7 column, e.g. 920 → 920-8MGT',
                auto: v => (M(v) === 'design' && H.has(v, 'N1', 'N2')) ? (chooseBelt(v.N1, v.N2, v, false) || {}).b : undefined,
                check: v => (H.has(v, 'belt') && T711[v.belt] === undefined) ? 'Not a Table 7-11 belt length' : null },
              { id: 'Nbelt', symbol: 'N_{belt}', label: 'Belt teeth', unit: '', kind: 'calc', compute: v => H.has(v, 'belt') ? Math.round(v.belt / (v.pitch || 8)) : undefined },
              { id: 'Lp', symbol: 'L_p', label: 'Belt pitch length', unit: 'in', kind: 'calc', compute: v => H.has(v, 'belt') ? v.belt / 25.4 : undefined },
              { id: 'CDlo', symbol: 'D_2', label: 'Lower CD limit', unit: 'in', kind: 'calc', compute: v => H.has(v, 'PD1', 'PD2') ? Math.max(v.PD1, v.PD2) : undefined },
              { id: 'CDhi', symbol: '3(D_1+D_2)', label: 'Upper CD limit', unit: 'in', kind: 'calc', compute: v => H.has(v, 'PD1', 'PD2') ? 3 * (v.PD1 + v.PD2) : undefined },
              { id: 'CD', symbol: 'CD', label: 'Centre distance', unit: 'in', kind: 'calc', compute: v => H.has(v, 'Lp', 'PD1', 'PD2') ? cdOf(v.Lp, v.PD1, v.PD2) : undefined,
                work: v => H.has(v, 'CD') ? '\\(B = 4(' + F(v.Lp) + ') - 6.28(' + F(v.PD2) + ' + ' + F(v.PD1) + ') = ' + F(4 * v.Lp - 6.28 * (v.PD1 + v.PD2)) + ';\\quad CD = ' + F(v.CD) + '\\ \\text{in}\\)' : null,
                check: v => (H.has(v, 'CD', 'CDnom') && M(v) === 'design' && Math.abs(v.CD - v.CDnom) > (v.CDtol || 0) + 1e-6) ? 'Outside ' + F(v.CDnom - (v.CDtol || 0)) + '–' + F(v.CDnom + (v.CDtol || 0)) + ' in' :
                  (H.has(v, 'CD', 'CDlo', 'CDhi') && (v.CD <= v.CDlo || v.CD >= v.CDhi)) ? 'Outside the course range D_2 < CD < 3(D_1 + D_2)' : null },
              { id: 'th1', symbol: '\\theta_1', label: 'Wrap on the small sprocket', unit: '°', kind: 'calc', compute: v => H.has(v, 'PD1', 'PD2', 'CD') ? 180 - 2 * H.deg(Math.asin(Math.abs(v.PD2 - v.PD1) / (2 * v.CD))) : undefined,
                work: v => H.has(v, 'th1') ? '\\(\\theta_1 = 180^\\circ - 2\\sin^{-1}\\frac{' + F(v.PD2) + ' - ' + F(v.PD1) + '}{2(' + F(v.CD) + ')} = ' + F(v.th1) + '^\\circ;\\quad TIM = ' + F(Math.min(v.N1, v.N2)) + '(' + F(v.th1) + ')/360 = ' + F(v.TIM) + '\\)' : null },
              { id: 'TIM', symbol: 'TIM', label: 'Teeth in mesh, small sprocket', unit: '', kind: 'calc', compute: v => H.has(v, 'th1', 'N1', 'N2') ? Math.floor(nSmall(v) * v.th1 / 360) : undefined,
                check: v => (H.has(v, 'TIM') && v.TIM < 6) ? 'Fewer than 6 teeth in mesh (slide 4)' : null },
            ],
            after: v => M(v) === 'design' ? beltTableHtml(v) : '' },
          { id: 'pow', title: 'Course steps 5–6: belt width, rating and length correction', when: on('design', 'check'), fig: ['table7-9', 'table7-10', 'table7-11'],
            formula: 'P_{adj} = P_{rated}\\times C_L \\ \\ge\\ P_{des},\\qquad SF = \\frac{P_{adj}}{P_{des}},\\qquad P_{max} = \\frac{P_{adj}}{SF_{Table\\,7\\text{-}8}}',
            text: 'Row = rpm of the faster shaft (interpolate), column = teeth on the small sprocket. Mott only prints the 30 and 50 mm tables (20/85 mm are in the manufacturer\'s catalogue).',
            vars: [
              { id: 'width', label: 'Belt width', kind: 'choice', type: 'text', allowBlank: false, default: 'auto', options: [{ label: 'auto — 30 mm, or 50 mm if 30 mm is short', value: 'auto' }, { label: '30 mm (Table 7-9)', value: '30' }, { label: '50 mm (Table 7-10)', value: '50' }] },
              { id: 'Prated', symbol: 'P_{rated}', label: 'Base rated power', unit: 'hp', kind: 'lookup', fig: 'table7-9', hint: 'Table 7-9 (30 mm) / 7-10 (50 mm)',
                auto: v => H.has(v, 'N1', 'N2') ? rating(nSmall(v), nFast(v), effWidth(v)) : undefined,
                check: v => (H.has(v, 'N1', 'N2', 'n1') && !H.has(v, 'Prated')) ? 'No table value for these teeth/rpm/width — read the catalogue' : null },
              { id: 'CL', symbol: 'C_L', label: 'Length correction factor', unit: '', kind: 'lookup', fig: 'table7-11', hint: 'Table 7-11, by belt designation', auto: v => H.has(v, 'belt') ? T711[v.belt] : undefined },
              { id: 'Padj', symbol: 'P_{adj}', label: 'Adjusted rated power', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'Prated', 'CL') ? v.Prated * v.CL : undefined,
                work: v => H.has(v, 'Padj') ? '\\(P_{adj} = ' + F(v.Prated) + '(' + F(v.CL) + ') = ' + F(v.Padj) + '\\ \\text{hp}\\)' : null,
                check: v => (H.has(v, 'Padj', 'Pdes') && v.Padj < v.Pdes) ? 'Below P_des — use the wider belt or a larger sprocket' : null },
              { id: 'SFa', symbol: 'SF', label: 'Safety factor P_allow/P_des', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'Padj', 'Pdes') ? v.Padj / v.Pdes : undefined,
                work: v => H.has(v, 'SFa') ? '\\(SF = ' + F(v.Padj) + '/' + F(v.Pdes) + ' = ' + F(v.SFa, 3) + '\\)' : null },
              { id: 'Pmax', symbol: 'P_{max}', label: 'Largest motor power this drive carries', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'Padj', 'SF') ? v.Padj / v.SF : undefined },
            ],
            after: v => widthTableHtml(v) },
          { id: 'spd', title: 'Course step 6: belt speed', eq: shig ? '(e) V = πdn/12' : '7-2',
            formula: 'v_{belt} = \\frac{\\pi\\,PD_1\\,n_1}{12} < 6500\\ \\text{ft/min}\\quad(\\text{target }3500\\text{–}4000)',
            vars: [
              { id: 'vb', symbol: 'v_{belt}', label: 'Belt speed', unit: 'ft/min', kind: 'calc', compute: v => H.has(v, 'PD1', 'n1') ? Math.PI * v.PD1 * v.n1 / 12 : undefined,
                work: v => H.has(v, 'vb') ? '\\(v_{belt} = \\pi(' + F(v.PD1) + ')(' + F(v.n1) + ')/12 = ' + F(v.vb) + '\\ \\text{ft/min}\\)' : null,
                check: v => (H.has(v, 'vb') && v.vb > 6500) ? 'Above the 6500 ft/min limit' : (H.has(v, 'vb') && v.vb > 4000) ? 'Above the 3500–4000 ft/min target — noisier' : null },
            ] },
          { id: 'bush', title: 'Course step 7: fittings — bushings and outside diameters', when: on('design'), fig: ['table7-4', 'table7-5'],
            text: 'The bushing comes from the Table 7-4 column for the belt width; its bore range (Table 7-5) must include the shaft.',
            vars: [
              { id: 'bush1', symbol: '', label: 'Driver bushing (Table 7-4/7-5)', unit: '', kind: 'calc', compute: v => H.has(v, 'N1') ? bushTxt(v.N1, effWidth(v)) : undefined,
                check: v => { const b = bushOf(v.N1, effWidth(v)); return (H.has(v, 'dsh1') && T75[b] && (v.dsh1 > T75[b][1] || v.dsh1 < T75[b][0])) ? 'Motor shaft ' + F(v.dsh1) + ' in does not fit this bushing' : null; } },
              { id: 'bush2', symbol: '', label: 'Driven bushing (Table 7-4/7-5)', unit: '', kind: 'calc', compute: v => H.has(v, 'N2') ? bushTxt(v.N2, effWidth(v)) : undefined,
                check: v => { const b = bushOf(v.N2, effWidth(v)); return (H.has(v, 'dsh2') && T75[b] && (v.dsh2 > T75[b][1] || v.dsh2 < T75[b][0])) ? 'Driven shaft ' + F(v.dsh2) + ' in does not fit this bushing' : null; } },
              { id: 'OD1', symbol: 'OD_1', label: 'Driver flange OD', unit: 'in', kind: 'calc', compute: v => H.has(v, 'N1') ? odOf(v.N1) : undefined,
                check: v => (H.has(v, 'OD1', 'Dmax') && v.OD1 > v.Dmax) ? 'Larger than D_max' : null },
              { id: 'OD2', symbol: 'OD_2', label: 'Driven flange OD (PD if no flange)', unit: 'in', kind: 'calc', compute: v => H.has(v, 'N2') ? odOf(v.N2) : undefined,
                check: v => (H.has(v, 'OD2', 'Dmax') && v.OD2 > v.Dmax) ? 'Larger than D_max' : null },
            ] },
        ] },

        { title: '4 · Answer', steps: [
          { id: 'res', title: 'Result — what the question asked for', after: result },
        ] },
      ],
    };
  };
})();
