// Synchronous (timing) belts — Mott Ch. 7-5 (merged Fizz §1.5 + Mech §8.3.3; Example Problem 7-4)
// Course alignment (v2/COURSE_CONVENTIONS.md §0, §3): "Timing Belts 2023" slides s4–s12 + HW1 P4. Seven-step procedure: SF (Table 7-8) →
// pitch (Fig 7-27) → small sprocket ≥ NEMA minimum from Gates Table No. 4 (course-only figure, auto lookup) → sprockets/belt from
// Table 7-7 with D2 < CD < 3(D1+D2) → width from Table 7-9 → V < 6500 ft/min (3500–4000 target) and Rated × CL (Table 7-11) → SF = Pallow/Pdes.
// Verified against: HW1 P4 (Mott 7-43): 5 hp AC normal @1750 → fan 700 rpm, 22 h/day: SF 1.8 → 9.0 hp; 8 mm; 32/80 teeth (VR 2.5);
//   PD1 3.208, PD2 8.020; Gates Table 4 min 2.7 in OK; 8 < CD < 33; 920-8MGT (115 T) → CD 8.97 in; Prated 21.2 (30 mm), CL 1.0;
//   SF 21.2/9.0 = 2.36; V 1470 ft/min < 3500 — all reproduced.
(function () {
  // Table 7-4 — 8 mm pitch sprockets: teeth → [pitch dia in, flange dia in, bushing size by width 20/30/50/85]
  const T74 = {
    22: [2.206, 2.559, { 20: 1108, 30: 1108 }], 24: [2.406, 2.756, { 20: 1108, 30: 1108 }], 26: [2.607, 2.953, { 20: 1108, 30: 1108 }],
    28: [2.807, 3.15, { 20: 1108, 30: 1108, 50: 'MPB' }], 30: [3.008, 3.346, { 20: 1210, 30: 1210, 50: 1210 }], 32: [3.208, 3.543, { 20: 1210, 30: 1210, 50: 1210 }],
    34: [3.409, 3.819, { 20: 1610, 30: 1610, 50: 1610, 85: 1615 }], 36: [3.609, 3.937, { 20: 1610, 30: 1610, 50: 1610, 85: 1615 }], 38: [3.810, 4.134, { 20: 1610, 30: 1610, 50: 1610, 85: 1610 }],
    40: [4.010, 4.331, { 20: 1610, 30: 2012, 50: 2012, 85: 2012 }], 44: [4.411, 4.764, { 20: 2012, 30: 2012, 50: 2012, 85: 2012 }], 48: [4.812, 5.157, { 20: 2012, 30: 2012, 50: 2012, 85: 2012 }],
    56: [5.614, 5.945, { 20: 2012, 30: 2012, 50: 2517, 85: 2517 }], 64: [6.416, 6.772, { 20: 2012, 30: 2517, 50: 2517, 85: 2517 }], 72: [7.218, 7.598, { 20: 2012, 30: 2517, 50: 2517, 85: 3020 }],
    80: [8.020, 8.386, { 20: 2517, 30: 2517, 50: 2517, 85: 3020 }], 90: [9.023, NaN, { 20: 2517, 30: 2517, 50: 3020, 85: 3020 }], 112: [11.229, NaN, { 30: 2517, 50: 3020, 85: 3020 }],
    144: [14.437, NaN, { 30: 2517, 50: 3020, 85: 3535 }], 192: [19.249, NaN, { 50: 3020, 85: 3535 }],
  };
  // Table 7-5 — taper-lock bushing: size → [min bore, max bore] in
  const T75 = { 1008: [0.5, 0.875], 1108: [0.5, 1.0], 1210: [0.5, 1.25], 1610: [0.5, 1.5], 1615: [0.5, 1.5], 2012: [0.5, 1.875], 2517: [0.5, 2.25], 3020: [0.875, 2.75], 3525: [1.188, 3.25], 3535: [1.188, 3.25], 4030: [1.438, 3.625], 4040: [1.438, 3.625], 4535: [1.938, 4.25], 4545: [1.938, 4.25], 5040: [2.438, 4.5], 6050: [4.438, 6.0], 7060: [4.938, 7.0] };
  // Table 7-11 — belt length correction factor by belt designation (pitch length, mm)
  const T711 = { 384: 0.70, 480: 0.80, 560: 0.80, 600: 0.80, 640: 0.90, 720: 0.90, 800: 0.90, 840: 0.90, 880: 0.90, 920: 1.00, 960: 1.00, 1040: 1.00, 1064: 1.00, 1120: 1.00, 1160: 1.00, 1200: 1.00, 1224: 1.00, 1280: 1.10, 1440: 1.10, 1512: 1.10, 1584: 1.10, 1600: 1.10, 1760: 1.10, 1800: 1.20, 2000: 1.20, 2200: 1.20, 2400: 1.20, 2600: 1.20, 2800: 1.20, 3048: 1.20, 3280: 1.20, 3600: 1.20, 4400: 1.20 };
  const BELTS = Object.keys(T711).map(Number);
  // Gates Table No. 4 — minimum motor-sprocket PD (in): rows motor hp, columns rpm 575/690/870/1160/1750/3450 (NaN = not listed)
  const G4_RPM = [575, 690, 870, 1160, 1750, 3450];
  const G4 = [[0.5, NaN, NaN, 2.0, NaN, NaN, NaN], [0.75, NaN, NaN, 2.2, 2.0, NaN, NaN], [1, 2.7, 2.3, 2.2, 2.2, 2.0, NaN], [1.5, 2.7, 2.7, 2.2, 2.2, 2.2, 2.0],
    [2, 3.4, 2.7, 2.7, 2.2, 2.2, 2.2], [3, 4.1, 3.4, 2.7, 2.7, 2.2, 2.2], [5, 4.1, 4.1, 3.4, 2.7, 2.7, 2.2], [7.5, 4.7, 4.1, 4.0, 3.4, 2.7, 2.7],
    [10, 5.4, 4.7, 4.0, 4.0, 3.4, 2.7], [15, 6.1, 5.4, 4.7, 4.0, 4.0, 4.0], [20, 7.4, 6.1, 5.4, 4.7, 4.0, 4.0], [25, 8.1, 7.4, 6.1, 5.4, 4.0, 4.0],
    [30, 9.0, 8.1, 6.1, 6.1, 4.7, NaN], [40, 9.0, 9.0, 7.4, 6.1, 5.4, NaN], [50, 9.9, 9.0, 7.6, 7.4, 6.1, NaN], [60, 10.8, 9.9, 9.0, 7.2, 6.7, NaN],
    [75, 12.6, 11.7, 8.6, 9.0, 7.7, NaN], [100, 16.2, 13.5, 10.8, 9.0, 7.7, NaN], [125, 18.0, 16.2, 13.5, 10.8, 9.5, NaN], [150, 19.8, 18.0, 16.2, 11.7, 9.5, NaN], [200, 19.8, 19.8, 19.8, NaN, 11.9, NaN]];
  const gates4 = (hp, rpm) => { const row = G4.find(r => r[0] >= hp - 1e-9); if (!row) return undefined; let ci = 0; G4_RPM.forEach((r, i) => { if (Math.abs(r - rpm) < Math.abs(G4_RPM[ci] - rpm)) ci = i; }); const x = row[ci + 1]; return isNaN(x) ? undefined : x; };
  const nearest = (x, arr) => arr.reduce((b, a) => Math.abs(a - x) < Math.abs(b - x) ? a : b);
  const pitchIn = v => (v.pitch || 8) / 25.4;
  const bush = (N, w) => (T74[N] && T74[N][2][w]) ? T74[N][2][w] : undefined;
  const boreOf = (N, w, i) => { const b = bush(N, w); return (typeof b === 'number' && T75[b]) ? T75[b][i] : undefined; };

  window.TOPIC = {
    id: 'timing_belts', book: 'shigley',
    title: 'Synchronous (Timing) Belts — Drive Selection',
    subtitle: 'Shigley Ch. 17-4 (Table 17-18, Fig. 17-15) + Mott Ch. 7-5 tables · merged Fizz §1.5 + Mech §8.3.3',
    sibling: 'timing_belts_mott.html',
    intro: '<b>Shigley barely covers timing belts</b>: §17-4 gives only the nomenclature (Figure 17-15) and the inch-series pitches (Table 17-18) and says "the design and selection process for timing belts is so similar to that for V belts that the process will not be presented here." Both bibles therefore follow Mott, and so does this page — every selection table and chart below is Mott\'s (marked "Mott" in the figure panel); only the geometry equations are cross-referenced to Shigley (Eq. 17-1 wrap angle, Eq. 17-16b centre distance). Mott\'s General Selection Procedure for GT-style synchronous belts (Example Problem 7-4): service factor (Table 7-8) → design power → belt pitch from Figure 7-27 (the book only tabulates the <b>8 mm</b> pitch, so that is what you will use) → candidate sprocket pairs for the velocity ratio from Table 7-7 → eliminate pairs that fail the shaft-bore (Tables 7-4/7-5) and sprocket-diameter limits → belt length / centre distance from Table 7-7 → belt width from the power-rating Tables 7-9 (30 mm) / 7-10 (50 mm) with the length factor of Table 7-11 → belt-speed check. Pitch diameters, flange diameters, bushings and bores auto-fill from Tables 7-4/7-5 for 8 mm sprockets; the rated power must be read from Table 7-9/7-10. <b>Course defaults</b> (MECH 325 "Timing Belts 2023" slides 4–12, HW1 P4): SF from Mott Table 7-8 (1.8 for the HW1 AC-motor → fan, 22 h/day case), the small sprocket must also satisfy the NEMA minimum of Gates Table No. 4 (not in Mott — course figure, auto-filled), D<sub>2</sub> &lt; CD &lt; 3(D<sub>1</sub> + D<sub>2</sub>), belt speed 3500–4000 ft/min target and never above 6500, SF = P<sub>allowable</sub>/P<sub>design</sub>.',
    example: { P: 5, n1: 1750, n2: 700, CDnom: 9, CDtol: 0.5, SF: 1.8, pitch: 8, N1: 32, N2: 80, belt: 920, width: 30, Prated: 21.2 },

    figures: [
      { id: 'fig17-15', ref: 'Figure 17-15', title: 'Timing-belt drive: pitch line, pitch circle, outside and root diameters', src: 'figures/shigley/fig17-15.png', page: 929 },
      { id: 'table17-18', ref: 'Table 17-18', title: 'Standard pitches of (inch-series) timing belts XL, L, H, XH, XXH', src: 'figures/shigley/table17-18.png', page: 930, note: 'Inch pitches; the metric 8 mm GT pitch used in the Mott tables is the course standard.' },
      { id: 'table7-8', ref: 'Table 7-8', title: 'Service factor SF (driven machine × driver × hours of service)', src: 'figures/mott/table7-8.png', book: 'mott', page: 286 },
      { id: 'fig7-27', ref: 'Figure 7-27', title: 'Belt pitch selection guide for GT-style belts (design hp vs rpm of faster shaft)', src: 'figures/mott/fig7-27.png', book: 'mott', page: 287, note: 'Expect 8 mm: it is the only pitch with full data in the book (Tables 7-4 … 7-11).' },
      { id: 'table7-6', ref: 'Table 7-6', title: 'Types and sizes of synchronous belt drives (pitch, widths, teeth, lengths)', src: 'figures/mott/table7-6.png', book: 'mott', page: 283 },
      { id: 'table7-7a', ref: 'Table 7-7 (a)', title: '8 mm pitch GT drive selection table — VR 1.000–1.333: centre distance for each belt', src: 'figures/mott/table7-7a.png', book: 'mott', page: 284, note: 'Rows = driver:driven teeth, columns = belt designation (pitch length mm, teeth). Values are centre distances in inches.' },
      { id: 'table7-7b', ref: 'Table 7-7 (b)', title: '8 mm pitch GT drive selection table — VR 1.333–3.000 (continued)', src: 'figures/mott/table7-7b.png', book: 'mott', page: 285 },
      { id: 'gates4', ref: 'Gates Table No. 4 (slide 7)', book: 'course', title: 'Minimum recommended sprocket pitch diameters for general-purpose electric motors (NEMA) — motor hp × rpm', src: 'figures/course/timing_gates_min_sprocket_dia_table4.png', note: '"Not in Mott." Enter with the motor nameplate hp (round up) and rpm; the motor sprocket PD must be at least this. 5 hp @ 1750 → 2.7 in; 10 hp → 3.4; 20 hp → 4.0.' },
      { id: 'table7-4', ref: 'Table 7-4', title: 'Sprockets with 8 mm belt pitch: pitch dia, flange dia, sprocket number, bushing size per belt width', src: 'figures/mott/table7-4.png', book: 'mott', page: 282 },
      { id: 'table7-5', ref: 'Table 7-5', title: 'Taper-lock bushing: min and max bore', src: 'figures/mott/table7-5.png', book: 'mott', page: 282 },
      { id: 'table7-9', ref: 'Table 7-9', title: '8M GT belt power rating — 30 mm width (rpm × small-sprocket grooves)', src: 'figures/mott/table7-9.png', book: 'mott', page: 288, note: 'Interpolate on rpm if needed.' },
      { id: 'table7-10', ref: 'Table 7-10', title: '8M GT belt power rating — 50 mm width', src: 'figures/mott/table7-10.png', book: 'mott', page: 289 },
      { id: 'table7-11', ref: 'Table 7-11', title: '8M GT belt length correction factor CL by belt designation', src: 'figures/mott/table7-11.png', book: 'mott', page: 290 },
      { id: 'fig7-28', ref: 'Figure 7-28', title: 'Synchronous belt drive nomenclature (Example 7-3)', src: 'figures/mott/fig7-28.png', book: 'mott', page: 290 },
      { id: 'fig7-26', ref: 'Figure 7-26', title: 'Belt drive with an adjustable centre distance and tensioner', src: 'figures/mott/fig7-26.png', book: 'mott', page: 283 },
      { id: 'fig7-4', ref: 'Figure 7-4', title: 'Belt/chain drive configuration — wrap angle geometry', src: 'figures/mott/fig7-4.png', book: 'mott', page: 265 },
    ],

    sections: [
      { title: 'Steps 1–4: specifications and design power', steps: [
        { id: 'in', title: 'Design specifications', fig: ['fig17-15', 'fig7-28'],
          text: 'Required: driver power, speeds (or VR) and the nominal centre distance with its adjustment range. Optional limits: shaft diameters (bore check) and a maximum sprocket OD (space check).',
          vars: [
            { id: 'P', symbol: 'P_{rated}', label: 'Rated power of driver', unit: 'hp', kind: 'input' },
            { id: 'n1', symbol: 'n_{driving}', label: 'Driving sprocket speed', unit: 'rpm', kind: 'input' },
            { id: 'n2', symbol: 'n_{driven}', label: 'Driven sprocket speed', unit: 'rpm', kind: 'input' },
            { id: 'CDnom', symbol: 'CD_{nom}', label: 'Nominal centre distance', unit: 'in', kind: 'input' },
            { id: 'CDtol', symbol: '\\pm', label: 'Centre-distance adjustment', unit: 'in', kind: 'input', default: 0, hint: 'half-range of the slots, e.g. 0.375' },
            { id: 'dsh1', symbol: 'd_{shaft,1}', label: 'Driver (motor) shaft diameter', unit: 'in', kind: 'input', hint: 'optional' },
            { id: 'dsh2', symbol: 'd_{shaft,2}', label: 'Driven shaft diameter', unit: 'in', kind: 'input', hint: 'optional' },
            { id: 'Dmax', symbol: 'D_{max}', label: 'Max sprocket OD allowed', unit: 'in', kind: 'input', hint: 'optional space limit' },
          ] },
        { id: 'sf', title: 'Service factor and design power', fig: ['table7-8'], formula: 'P_{des} = P_{rated}\\cdot SF,\\qquad VR = \\frac{n_{driving}}{n_{driven}}',
          vars: [
            { id: 'SF', symbol: 'SF', label: 'Service factor', unit: '', kind: 'lookup', fig: 'table7-8', default: 1.5, hint: 'Mott Table 7-8 (driven machine × driver × hours). HW1 P4: AC normal-torque → fan, 22 h/day = 1.8', check: v => (H.has(v, 'SF') && (v.SF < 1 || v.SF > 2.5)) ? 'SF is 1.0–2.5 in Table 7-8' : null },
            { id: 'Pdes', symbol: 'P_{des}', label: 'Design power', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'P', 'SF') ? v.P * v.SF : undefined,
              work: v => H.has(v, 'Pdes') ? '\\(P_{des} = ' + H.fmt(v.P) + '(' + H.fmt(v.SF) + ') = ' + H.fmt(v.Pdes) + '\\ \\text{hp}\\)' : null },
            { id: 'VR', symbol: 'VR', label: 'Velocity ratio', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'n1', 'n2') ? v.n1 / v.n2 : undefined },
          ] },
        { id: 'pitch', title: 'Belt pitch', fig: ['fig7-27', 'table7-6', 'table17-18'],
          text: 'Enter Figure 7-27 with P<sub>des</sub> and the rpm of the faster (smaller) sprocket. The tables that follow are for 8 mm (8MGT).',
          vars: [
            { id: 'pitch', label: 'Belt pitch', kind: 'choice', options: [{ label: '5 mm', value: 5 }, { label: '8 mm (8MGT) — tabulated', value: 8 }, { label: '14 mm', value: 14 }, { label: '20 mm', value: 20 }], default: 8,
              check: v => (H.has(v, 'pitch') && v.pitch !== 8) ? 'Only the 8 mm pitch has sprocket/belt/rating tables in Mott — auto-fills below assume 8 mm' : null },
          ] },
      ] },

      { title: 'Steps 5–6: sprockets', steps: [
        { id: 'spk', title: 'Candidate sprocket pair and pitch diameters (≥ NEMA minimum, Gates Table 4)', fig: ['table7-7a', 'table7-7b', 'table7-4', 'gates4'], eq: '7-4',
          formula: 'VR = \\frac{N_{driven}}{N_{driving}},\\qquad PD = \\frac{N\\,p}{\\pi}',
          text: 'List every driver:driven pair in Table 7-7 with the required VR (e.g. VR 2.00 → 22:44, 24:48, 28:56, 32:64, 36:72, 40:80, 56:112, 72:144), then test each against the limits in the next step. Pitch and flange diameters auto-fill from Table 7-4. Course step 3: the motor sprocket must be at least the NEMA minimum PD of Gates Table No. 4 for the motor hp and rpm (auto-filled; e.g. 5 hp @ 1750 rpm → 2.7 in). The ≥ 6 teeth-in-mesh rule is satisfied automatically for the Table 7-7 pairs.',
          vars: [
            { id: 'N1', symbol: 'N_{driving}', label: 'Driver sprocket teeth', unit: '', kind: 'lookup', fig: 'table7-7a' },
            { id: 'N2', symbol: 'N_{driven}', label: 'Driven sprocket teeth', unit: '', kind: 'lookup', fig: 'table7-7a', auto: v => H.has(v, 'N1', 'VR') ? nearest(v.N1 * v.VR, Object.keys(T74).map(Number)) : undefined },
            { id: 'VRa', symbol: 'VR_{act}', label: 'Actual velocity ratio', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'N1', 'N2') ? v.N2 / v.N1 : undefined,
              check: v => (H.has(v, 'VRa', 'VR') && Math.abs(v.VRa / v.VR - 1) > 0.02) ? 'Actual ratio differs from the required VR by more than 2 %' : null },
            { id: 'n2a', symbol: 'n_{driven,act}', label: 'Actual driven speed', unit: 'rpm', kind: 'calc', compute: v => H.has(v, 'n1', 'VRa') ? v.n1 / v.VRa : undefined },
            { id: 'PDmin', symbol: 'PD_{min}', label: 'NEMA minimum motor-sprocket PD (Gates Table 4)', unit: 'in', kind: 'lookup', fig: 'gates4', auto: v => H.has(v, 'P', 'n1') ? gates4(v.P, v.n1) : undefined },
            { id: 'PD1', symbol: 'PD_1', label: 'Driver pitch diameter', unit: 'in', kind: 'lookup', fig: 'table7-4', auto: v => H.has(v, 'N1') ? (T74[v.N1] ? T74[v.N1][0] : v.N1 * pitchIn(v) / Math.PI) : undefined,
              check: v => (H.has(v, 'PD1', 'PDmin') && v.PD1 < v.PDmin) ? 'Driver sprocket below the NEMA minimum (Gates Table 4) — pick a larger pair' : null },
            { id: 'PD2', symbol: 'PD_2', label: 'Driven pitch diameter', unit: 'in', kind: 'lookup', fig: 'table7-4', auto: v => H.has(v, 'N2') ? (T74[v.N2] ? T74[v.N2][0] : v.N2 * pitchIn(v) / Math.PI) : undefined },
          ] },
        { id: 'lim', title: 'Eliminate by bore size and sprocket diameter', fig: ['table7-4', 'table7-5'],
          formula: '\\text{bore}_{min} < d_{shaft} < \\text{bore}_{max}\\ \\text{(Table 7-5)},\\qquad \\text{flange OD} \\le D_{max}',
          text: 'Table 7-4 gives the bushing size for each sprocket and belt width; Table 7-5 gives that bushing\'s bore range. A sprocket whose max bore is smaller than the shaft is rejected. Sprockets without a flange (N/A) use the pitch diameter for the size check.',
          vars: [
            { id: 'width', label: 'Belt width (sets bushing column)', kind: 'choice', options: [{ label: '20 mm', value: 20 }, { label: '30 mm', value: 30 }, { label: '50 mm', value: 50 }, { label: '85 mm', value: 85 }], default: 30 },
            { id: 'bush1', symbol: '', label: 'Driver bushing size (Table 7-4)', unit: '', kind: 'lookup', fig: 'table7-4', auto: v => { const b = bush(v.N1, v.width); return typeof b === 'number' ? b : undefined; } },
            { id: 'bore1max', symbol: '', label: 'Driver bushing max bore', unit: 'in', kind: 'lookup', fig: 'table7-5', auto: v => H.has(v, 'bush1') && T75[v.bush1] ? T75[v.bush1][1] : boreOf(v.N1, v.width, 1),
              check: v => (H.has(v, 'bore1max', 'dsh1') && v.dsh1 > v.bore1max) ? 'REJECT: motor shaft larger than max bore — use a bigger driver sprocket' : null },
            { id: 'bore1min', symbol: '', label: 'Driver bushing min bore', unit: 'in', kind: 'lookup', fig: 'table7-5', auto: v => H.has(v, 'bush1') && T75[v.bush1] ? T75[v.bush1][0] : boreOf(v.N1, v.width, 0),
              check: v => (H.has(v, 'bore1min', 'dsh1') && v.dsh1 < v.bore1min) ? 'Shaft smaller than min bore' : null },
            { id: 'bush2', symbol: '', label: 'Driven bushing size (Table 7-4)', unit: '', kind: 'lookup', fig: 'table7-4', auto: v => { const b = bush(v.N2, v.width); return typeof b === 'number' ? b : undefined; } },
            { id: 'bore2max', symbol: '', label: 'Driven bushing max bore', unit: 'in', kind: 'lookup', fig: 'table7-5', auto: v => H.has(v, 'bush2') && T75[v.bush2] ? T75[v.bush2][1] : boreOf(v.N2, v.width, 1),
              check: v => (H.has(v, 'bore2max', 'dsh2') && v.dsh2 > v.bore2max) ? 'REJECT: driven shaft larger than max bore' : null },
            { id: 'bore2min', symbol: '', label: 'Driven bushing min bore', unit: 'in', kind: 'lookup', fig: 'table7-5', auto: v => H.has(v, 'bush2') && T75[v.bush2] ? T75[v.bush2][0] : boreOf(v.N2, v.width, 0),
              check: v => (H.has(v, 'bore2min', 'dsh2') && v.dsh2 < v.bore2min) ? 'Shaft smaller than min bore' : null },
            { id: 'OD1', symbol: 'OD_1', label: 'Driver flange (outside) diameter', unit: 'in', kind: 'lookup', fig: 'table7-4', auto: v => (T74[v.N1] && !isNaN(T74[v.N1][1])) ? T74[v.N1][1] : (H.has(v, 'PD1') ? v.PD1 : undefined),
              check: v => (H.has(v, 'OD1', 'Dmax') && v.OD1 > v.Dmax) ? 'REJECT: driver sprocket exceeds Dmax' : null },
            { id: 'OD2', symbol: 'OD_2', label: 'Driven flange (outside) diameter', unit: 'in', kind: 'lookup', fig: 'table7-4', auto: v => (T74[v.N2] && !isNaN(T74[v.N2][1])) ? T74[v.N2][1] : (H.has(v, 'PD2') ? v.PD2 : undefined),
              check: v => (H.has(v, 'OD2', 'Dmax') && v.OD2 > v.Dmax) ? 'REJECT: driven sprocket exceeds Dmax' : null },
          ],
          after: v => {
            const bad = [];
            if (H.has(v, 'bore1max', 'dsh1') && v.dsh1 > v.bore1max) bad.push('driver bore');
            if (H.has(v, 'bore2max', 'dsh2') && v.dsh2 > v.bore2max) bad.push('driven bore');
            if (H.has(v, 'OD1', 'Dmax') && v.OD1 > v.Dmax) bad.push('driver OD');
            if (H.has(v, 'OD2', 'Dmax') && v.OD2 > v.Dmax) bad.push('driven OD');
            if (!H.has(v, 'N1', 'N2')) return '';
            return bad.length ? '<span class="result-bad">' + v.N1 + ':' + v.N2 + ' rejected</span> (' + bad.join(', ') + ') — try the next candidate pair.' : '<span class="result-ok">' + v.N1 + ':' + v.N2 + ' passes the bore and size limits.</span>';
          } },
      ] },

      { title: 'Step 7: belt length and centre distance', steps: [
        { id: 'belt', title: 'Belt designation from Table 7-7', fig: ['table7-7a', 'table7-7b', 'fig7-26'], eq: '17-16b, 17-1',
          formula: 'L_p = \\frac{N_{belt}\\,p}{25.4}\\ \\text{in},\\qquad B = 4L_p - 6.28(PD_2 + PD_1),\\qquad CD = \\frac{B + \\sqrt{B^2 - 32(PD_2 - PD_1)^2}}{16}',
          text: 'Course step 4: CD must satisfy D<sub>2</sub> &lt; CD &lt; 3(D<sub>1</sub> + D<sub>2</sub>) (V-belt rule reused; HW1: 8 in &lt; CD &lt; 33 in). In the row for your sprocket pair, find the belt whose centre distance falls inside CD<sub>nom</sub> ± tolerance (or inside those bounds when no CD is specified). Enter the belt designation number (its pitch length in mm, e.g. 1800 for 1800-8MGT). The centre distance is also computed here from the belt-length equation (should match Table 7-7 to ±0.01 in).',
          vars: [
            { id: 'CDlo', symbol: 'CD_{min}', label: 'Lower limit D2', unit: 'in', kind: 'calc', compute: v => H.has(v, 'PD2') ? v.PD2 : undefined },
            { id: 'CDhi', symbol: 'CD_{max}', label: 'Upper limit 3(D1 + D2)', unit: 'in', kind: 'calc', compute: v => H.has(v, 'PD1', 'PD2') ? 3 * (v.PD1 + v.PD2) : undefined },
            { id: 'belt', symbol: '', label: 'Belt designation (pitch length, mm)', unit: 'mm', kind: 'lookup', fig: 'table7-7b', hint: 'e.g. 920 → 920-8MGT (115 teeth)' },
            { id: 'Nbelt', symbol: 'N_{belt}', label: 'Belt teeth', unit: '', kind: 'calc', compute: v => H.has(v, 'belt') ? Math.round(v.belt / (v.pitch || 8)) : undefined },
            { id: 'Lp', symbol: 'L_p', label: 'Belt pitch length', unit: 'in', kind: 'calc', compute: v => H.has(v, 'belt') ? v.belt / 25.4 : undefined },
            { id: 'CD', symbol: 'CD', label: 'Centre distance (computed)', unit: 'in', kind: 'calc', compute: v => { if (!H.has(v, 'Lp', 'PD1', 'PD2')) return undefined; const B = 4 * v.Lp - 6.28 * (v.PD1 + v.PD2); const r = B * B - 32 * (v.PD2 - v.PD1) ** 2; return r >= 0 ? (B + Math.sqrt(r)) / 16 : undefined; },
              work: v => H.has(v, 'CD') ? '\\(B = 4(' + H.fmt(v.Lp) + ') - 6.28(' + H.fmt(v.PD2) + '+' + H.fmt(v.PD1) + ') = ' + H.fmt(4 * v.Lp - 6.28 * (v.PD1 + v.PD2)) + ';\\quad CD = ' + H.fmt(v.CD) + '\\ \\text{in}\\)' : null,
              check: v => (H.has(v, 'CD', 'CDnom') && Math.abs(v.CD - v.CDnom) > (v.CDtol || 0) + 1e-6) ? 'CD outside the allowed range ' + H.fmt(v.CDnom - (v.CDtol || 0)) + '–' + H.fmt(v.CDnom + (v.CDtol || 0)) + ' in' : (H.has(v, 'CD', 'CDlo', 'CDhi') && (v.CD < v.CDlo || v.CD > v.CDhi)) ? 'CD outside D2 < CD < 3(D1 + D2)' : null },
            { id: 'CDtab', symbol: 'CD_{tab}', label: 'Centre distance read from Table 7-7 (optional)', unit: 'in', kind: 'lookup', fig: 'table7-7b', },
            { id: 'th1', symbol: '\\theta_1', label: 'Wrap on small sprocket', unit: '°', kind: 'calc', compute: v => H.has(v, 'PD1', 'PD2', 'CD') ? 180 - 2 * H.deg(Math.asin((v.PD2 - v.PD1) / (2 * v.CD))) : undefined },
          ] },
      ] },

      { title: 'Steps 8–10: belt width and rated power', steps: [
        { id: 'pow', title: 'Rated power, length correction, adjusted power', fig: ['table7-9', 'table7-10', 'table7-11'],
          formula: 'P_{adj} = P_{rated}\\cdot C_L \\ \\ge\\ P_{des}',
          text: 'Table 7-9 (30 mm) or 7-10 (50 mm): row = rpm of the faster shaft, column = teeth on the small sprocket; interpolate on rpm. Mech bible tip: if 30 mm is short, 50 mm will usually do, so starting at 50 mm is conservative. C<sub>L</sub> auto-fills from Table 7-11 for the belt designation entered above.',
          vars: [
            { id: 'Prated', symbol: 'P_{rated}', label: 'Base rated power (Table 7-9 / 7-10)', unit: 'hp', kind: 'lookup', fig: 'table7-9' },
            { id: 'CL', symbol: 'C_L', label: 'Belt length correction factor', unit: '', kind: 'lookup', fig: 'table7-11', auto: v => H.has(v, 'belt') ? T711[v.belt] : undefined },
            { id: 'Padj', symbol: 'P_{adj}', label: 'Adjusted rated power', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'Prated', 'CL') ? v.Prated * v.CL : undefined,
              work: v => H.has(v, 'Padj') ? '\\(P_{adj} = ' + H.fmt(v.Prated) + '(' + H.fmt(v.CL) + ') = ' + H.fmt(v.Padj) + '\\ \\text{hp}\\)' : null,
              check: v => (H.has(v, 'Padj', 'Pdes') && v.Padj < v.Pdes) ? 'Padj < Pdes — use the wider belt' : null },
            { id: 'margin', symbol: 'SF_{act}', label: 'Safety factor = Pallowable / Pdesign (course)', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'Padj', 'Pdes') ? v.Padj / v.Pdes : undefined,
              work: v => H.has(v, 'margin') ? '\\(SF = P_{allow}/P_{des} = ' + H.fmt(v.Padj) + '/' + H.fmt(v.Pdes) + ' = ' + H.fmt(v.margin, 3) + '\\)' : null },
          ] },
      ] },

      { title: 'Steps 11–12: belt speed and specification', steps: [
        { id: 'spd', title: 'Belt speed check', eq: 'Shigley (e): V = πdn/12', formula: 'v_{belt} = \\frac{PD_1}{2}\\,\\omega_1 = \\frac{\\pi\\,PD_1\\,n_1}{12} \\le 6500\\ \\text{ft/min}\\ (\\text{target } 3500\\text{–}4000)',
          text: 'Course: belt speed 3500–4000 ft/min is the design target; HW1 compares against 3500 and the hard limit is 6500 ft/min.',
          vars: [
            { id: 'vb', symbol: 'v_{belt}', label: 'Belt speed', unit: 'ft/min', kind: 'calc', compute: v => H.has(v, 'PD1', 'n1') ? Math.PI * v.PD1 * v.n1 / 12 : undefined,
              work: v => H.has(v, 'vb') ? '\\(v_{belt} = \\frac{' + H.fmt(v.PD1) + '}{2}(' + H.fmt(v.n1) + ')\\frac{2\\pi}{12} = ' + H.fmt(v.vb) + '\\ \\text{ft/min}\\)' : null,
              check: v => (H.has(v, 'vb') && v.vb > 6500) ? 'Exceeds the 6500 ft/min limit' : (H.has(v, 'vb') && v.vb > 4000) ? 'Above the 3500–4000 ft/min target: expect more noise' : null },
          ],
          after: v => {
            if (!H.has(v, 'N1', 'N2', 'belt')) return '';
            const ok = H.has(v, 'Padj', 'Pdes', 'vb') && v.Padj >= v.Pdes && v.vb <= 6500;
            const w = v.width || 30; const p = v.pitch || 8;
            return (ok ? '<span class="result-ok">PASS</span>' : '<span class="result-bad">CHECK</span>') + ' — Specify: P' + v.N1 + '-' + p + 'MGT-' + w + ' driver sprocket' + (v.bush1 ? ' with ' + v.bush1 + ' bushing' : '') + '; P' + v.N2 + '-' + p + 'MGT-' + w + ' driven sprocket' + (v.bush2 ? ' with ' + v.bush2 + ' bushing' : '') + '; ' + v.belt + '-' + p + 'MGT-' + w + ' belt; CD = ' + H.fmt(v.CD) + ' in; output ' + H.fmt(v.n2a) + ' rpm; P<sub>adj</sub> = ' + H.fmt(v.Padj) + ' hp vs P<sub>des</sub> = ' + H.fmt(v.Pdes) + ' hp (SF = ' + H.fmt(v.margin, 3) + '); v<sub>belt</sub> = ' + H.fmt(v.vb) + ' ft/min.';
          } },
      ] },
    ],
  };
})();
