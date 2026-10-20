// V-belts — Mott Ch. 7-4 (merged Fizz §1.4 + Mech §8.3.2 procedure, Mott symbols; Example Problem 7-2)
// Course alignment (v2/COURSE_CONVENTIONS.md §0, §2): the midterm uses Mott exclusively. Defaults: SF from Mott Table 7-1 (1.3 = midterm
// value), nd = 1.0, D1 sized for 4000 ft/min (auto = nearest standard sheave), V < 5000 ft/min → D1max shown, D2 < CD < 3(D1+D2),
// standard length from Table 7-2 (either neighbour accepted; midterm chose the larger), B-formula for CD (Eq. 7-13), θ1 > 120°,
// PA = Cθ·CL·(PTab + ΔPR) (slide 30), nfs = Nb·PA/Pdes. Gates catalogue tensioning (Formulas D19, D35, D20–D23; slides 39–40) appended
// as course-only steps. CL curve (Fig 7-19) re-read so that 3V @ 90 in → 1.09, 5V @ 125 → 1.00 as in the course solutions.
// Verified against: Midterm 2025 P1: 40 hp, 1150 → 590 rpm, SF 1.3, 5V, D1 10.8, D2 21.1 → Hd 52, VR 1.95, 589 rpm, D1max 16.6; the solution's
//   Lp 122.9 corresponds to a trial CD of 36 in (with the stated 32 in Eq. 7-12 gives 114.9); with Lstd 125 (larger neighbour): B 299.67,
//   CD 37.10, θ1 164.0°, θ2 196.0°, Cθ 0.96 (auto 0.962), CL 1.0, PTab 23 + ΔP 1.26 → 23.29 hp/belt, NB 3, nfs 1.34 — all reproduced.
// Verified against: HW1 P2 (Mott 7-20): 40 hp 1500 → 550 rpm, SF 1.4 → 56 hp, 5V, D1 10.2 (auto), D2 27.7 (auto), n2 552, CD 36 →
//   Lp 133.6 → 132, CD 35.16, θ1 151.2°, Cθ 0.92, CL 1.00 (course 1.01), 25.7 hp → 23.9 (23.6 with CL 1.00) hp/belt → 3 belts.
// Verified against: HW1 P3a (Mott 7-19): 5 hp 1750 → 725 rpm, SF 1.2 → 6 hp, 3V, D1 7.95 (auto), D2 18.95 (auto), 734 rpm, V 3642,
//   PTab 10 + ΔP 1.4, CD 24 → L 91.49 → 90, CD 23.23, θ1 152.6°, Cθ 0.93, CL 1.09 → 11.6 hp/belt → 1 belt.
// Verified against: Lecture example (Flat&V s38–40): 3VX800, d 6, D 19, 1750 rpm, 2 hp, Hd 2.2 → VR 3.17, 552 rpm, PA 0.9(7.68+0.25) = 7.14,
//   nfs 3.25, V 2749, CD 19.3, Kφ 0.90 (auto 0.896), M 0.29, Y 4 → t 18.21, Tst 21.58, deflection 0.28, force 1.95–2.08 lbf.
// Verified against: Tutorial 2 Q2 (Gates, Module 1 p15–24): CP belts, 4 belts, V 1361, 60 hp nominal, Kφ 1.0, M 1.6, Y 87 → Tst 251 lbf,
//   deflection forces 27.4–29.0 lbf (motor hp, not design hp, in D19).
(function () {
  // Standard sheave pitch diameters shown on Figures 7-14, 7-15, 7-16
  const SHEAVES = {
    '3V': [2.60, 2.75, 2.95, 3.10, 3.30, 3.60, 4.07, 4.45, 4.70, 4.95, 5.25, 5.55, 5.95, 6.45, 6.85, 7.95, 10.55, 13.95, 18.95, 24.95, 33.45],
    '5V': [7.0, 7.4, 7.9, 8.4, 8.9, 9.15, 9.65, 10.2, 10.8, 11.7, 12.4, 13.1, 13.9, 14.9, 15.9, 21.1, 27.7, 37.4, 49.9],
    '8V': [13.0, 13.8, 14.8, 15.8, 16.8, 17.8, 18.8, 19.8, 21.0, 22.2, 22.8, 23.8, 24.8, 29.8, 39.8, 52.8, 70.8, 94.8],
  };
  // Table 7-2 standard belt lengths (in)
  const L3 = [25, 26.5, 28, 30, 31.5, 33.5, 35.5, 37.5, 40, 42.5, 45, 47.5, 50, 53, 56, 60, 63, 67, 71, 75, 80, 85, 90, 95, 100, 106, 112, 118, 125, 132, 140, 165];
  const L5 = [50, 53, 56, 60, 63, 67, 71, 75, 80, 85, 90, 95, 100, 106, 112, 118, 125, 132, 140, 150, 160, 170, 180, 190, 200, 212, 224, 236, 250, 265, 280, 300, 315, 335, 355];
  const L8 = [100, 106, 112, 118, 125, 132, 140, 150, 160, 170, 180, 190, 200, 212, 224, 236, 250, 265, 280, 300, 315, 335, 355, 375, 400, 425, 450, 475, 500];
  const LENGTHS = { '3V': L3, '5V': L5, '8V': L8 };
  // Figure 7-19 CL curve reads (belt length in → CL) — re-read against the course solutions (3V @ 90 → 1.09; 5V @ 125 → 1.00, @ 132 → 1.01)
  const CL = {
    '3V': [[25, 0.83], [40, 0.95], [50, 0.99], [75, 1.07], [90, 1.095], [100, 1.11], [125, 1.14], [150, 1.165], [165, 1.17]],
    '5V': [[50, 0.845], [75, 0.93], [100, 0.97], [125, 1.00], [150, 1.025], [200, 1.07], [250, 1.10], [300, 1.135], [350, 1.17]],
    '8V': [[100, 0.87], [150, 0.92], [200, 0.96], [250, 1.00], [300, 1.03], [350, 1.055], [400, 1.075], [450, 1.095]],
  };
  // Figure 7-18 Cθ curve reads
  const CTH_X = [80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180];
  const CTH_Y = [0.63, 0.69, 0.74, 0.78, 0.82, 0.86, 0.89, 0.92, 0.95, 0.98, 1.00];
  // Gates Table D26 (Kφ vs (D−d)/C) and Table D27 (M, Y by cross-section)
  const KPHI_X = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
  const KPHI_Y = [1.00, 0.99, 0.97, 0.96, 0.94, 0.93, 0.91, 0.89, 0.87, 0.85, 0.82];
  const GATES = { '3VX': [0.29, 4], '5VX': [0.78, 13], '5V': [1.0, 11], '8V': [2.6, 22], 'AX': [0.47, 7], 'BX': [0.76, 8], 'CX': [1.31, 15], 'CP (C)': [1.6, 87] };
  const nearest = (x, arr) => arr.reduce((b, a) => Math.abs(a - x) < Math.abs(b - x) ? a : b);

  window.TOPIC = {
    id: 'v_belts', book: 'mott',
    title: 'V-Belts — Drive Design',
    subtitle: 'Mott Ch. 7-4 (Table 7-1/7-2, Figs. 7-13 … 7-19, Eqs. 7-12 … 7-17) · merged Fizz §1.4 + Mech §8.3.2 · course Gates tensioning',
    sibling: 'v_belts_shigley.html',
    intro: 'Mott\'s 12-step narrow-section (3V/5V/8V) V-belt design (Example Problem 7-2): design power with the Table 7-1 service factor → belt section from Figure 7-13 → sheaves sized for ≈4000 ft/min from the standard sizes on Figures 7-14/15/16 → rated power per belt P<sub>A</sub> = C<sub>θ</sub>C<sub>L</sub>(P<sub>Tab</sub> + ΔP<sub>R</sub>) → trial centre distance, belt length, standard length from Table 7-2 and actual CD → wrap angle, C<sub>θ</sub> (Fig. 7-18) and C<sub>L</sub> (Fig. 7-19) → number of belts and n<sub>fs</sub>. <b>Course defaults</b> come from MECH 325 "Flexible belts — Flat and V-belts" slides 22–42, Midterm 2025 P1 and HW1 P2/P3 (the midterm uses Mott exclusively): K<sub>s</sub> from Mott Table 7-1 (1.3 for the midterm\'s AC motor → textile machine), n<sub>d</sub> = 1.0, 4000 ft/min target with V &lt; 5000, D<sub>2</sub> &lt; CD &lt; 3(D<sub>1</sub>+D<sub>2</sub>), wrap &gt; 120°, belts rounded up. The last two steps add the Gates catalogue installation-tension method (Formulas D19/D35/D20–D23, slides 39–40, Tutorial 2 Q2) — use the Shigley page for F<sub>1</sub>/F<sub>2</sub>/F<sub>i</sub> and belt life.',
    example: { P: 40, n1: 1150, n2: 590, SF: 1.3, nd: 1, sec: '5V', D1: 10.8, D2: 21.1, P1: 23, Padd: 1.26, CDt: 36, Lstd: 125, Cth: 0.96, CL: 1.0 },

    figures: [
      { id: 'table7-1', ref: 'Table 7-1', title: 'V-belt service factors (driven machine × driver type × hours/day)', src: 'figures/mott/table7-1.png', page: 273, note: 'Primary course table. Midterm 2025: AC motor normal torque → textile machine 10 h/day = 1.3 (Shigley Table 17-15 range 1.2–1.4 also accepted).' },
      { id: 'ks-hours', ref: 'Service factors by hours (slide 35)', book: 'course', title: 'Belt service factors Ks: driven-machine class × hours/day (<8, <16, >16) × driver (smooth 100–200 % / coarse 200–400 % starting torque)', src: 'figures/course/belt_service_factor_hours.png', note: 'Light 1.0/1.1/1.2 | 1.1/1.2/1.3; medium 1.1/1.2/1.3 | 1.2/1.3/1.4; heavy 1.2/1.3/1.4 | 1.3/1.4/1.6; very heavy 1.3/1.4/1.5 | 1.5/1.6/1.8.' },
      { id: 'fig7-13', ref: 'Figure 7-13', title: 'Belt section selection chart (design power vs speed of faster shaft)', src: 'figures/mott/fig7-13.png', page: 273, note: 'On a boundary choose the larger section (Fizz).' },
      { id: 'abcd', ref: 'Classical A/B/C/D selection chart (slide 27)', book: 'course', title: '"Recommended Nominal V-Belt Selection" for classical A/B/C/D/E sections', src: 'figures/course/vbelt_selection_chart_abcd.png', note: 'Course-only chart for the inch sections rated in Shigley Table 17-12.' },
      { id: 'fig7-14', ref: 'Figure 7-14', title: 'Power rating per belt: 3V (solid = VR 1.0, dashed = VR ≥ 3.38)', src: 'figures/mott/fig7-14.png', page: 274, note: 'Vertical lines are the standard sheave pitch diameters.' },
      { id: 'fig7-15', ref: 'Figure 7-15', title: 'Power rating per belt: 5V', src: 'figures/mott/fig7-15.png', page: 275 },
      { id: 'fig7-16', ref: 'Figure 7-16', title: 'Power rating per belt: 8V', src: 'figures/mott/fig7-16.png', page: 275 },
      { id: 'fig7-17', ref: 'Figure 7-17', title: 'Power added vs speed ratio: 5V belts', src: 'figures/mott/fig7-17.png', page: 276, note: 'Catalog data are step-wise; above VR = 3.38 nothing more is added. For 3V/8V interpolate between the solid and dashed curves of Figs 7-14/7-16 instead (Mech bible formula). Course slide 31: "Shigley does not include speed-ratio power correction ΔPR".' },
      { id: 'fig7-18', ref: 'Figure 7-18', title: 'Angle-of-wrap correction factor Cθ', src: 'figures/mott/fig7-18.png', page: 276 },
      { id: 'fig7-19', ref: 'Figure 7-19', title: 'Belt-length correction factor CL', src: 'figures/mott/fig7-19.png', page: 276 },
      { id: 'table7-2', ref: 'Table 7-2', title: 'Standard belt lengths for 3V, 5V and 8V belts', src: 'figures/mott/table7-2.png', page: 277 },
      { id: 'fig7-4', ref: 'Figure 7-4', title: 'Belt drive configuration — wrap angles, span, centre distance', src: 'figures/mott/fig7-4.png', page: 265 },
      { id: 'gates-b10', ref: 'Gates Table B10 (slide 34)', book: 'course', title: 'Gates 3VX horsepower ratings per belt + additional hp (ΔP) columns', src: 'figures/course/gates_3vx_power_rating_table_b10.png' },
      { id: 'gates-b4', ref: 'Gates Table B4 (slide 36)', book: 'course', title: 'Gates belt length table (3VX800 etc.)', src: 'figures/course/gates_belt_sizes_table_b4.png' },
      { id: 'gates-b6', ref: 'Gates Table B6 (slide 37)', book: 'course', title: 'Gates 3V sheave / centre-distance table with combined wrap + length "HP correction" colour key', src: 'figures/course/gates_3v_centre_distance_table_b6.png', note: 'Gates tables include BOTH the wrap and length corrections in one factor.' },
      { id: 'gates-ex', ref: 'Lecture example (slide 38)', book: 'course', title: 'Worked 3VX800 example: 6 in / 19 in sheaves, 1750 rpm, 2 hp', src: 'figures/course/gates_3vx_example_slide38.png' },
      { id: 'gates-d19', ref: 'Gates Formula D19, Tables D26/D27, Formula D35 (slide 39)', book: 'course', title: 'Static installation tension Tst, arc factor Kφ, constants M and Y, span length t', src: 'figures/course/gates_tension_formula_d19.png', note: 'Use the MOTOR (nominal) hp in D19, not the design hp. The square-root span formula on the Gates page is marked "incorrect" — use D35.' },
      { id: 'gates-d20', ref: 'Gates Formulas D20–D23 (slide 40)', book: 'course', title: 'Minimum / maximum deflection forces for 1/64 in per inch of span', src: 'figures/course/gates_deflection_formula_d20_d23.png' },
    ],

    sections: [
      { title: 'Step 1–3: design power, section, ratio', steps: [
        { id: 'in', title: 'Design power', fig: ['table7-1', 'ks-hours'], formula: 'P_{des} = P \\cdot SF \\cdot n_d,\\qquad VR = \\frac{n_1}{n_2}\\ (n_1 > n_2)',
          text: 'Course rule: always multiply the nominal power by the service factor first. Mott Table 7-1 is the primary table: pick the driven-machine row (smooth / light / moderate / heavy shock) and the driver column (AC normal-torque or high-torque) for the hours per day. The course also gives its own hours/driver table (slide 35) and accepts the Shigley Table 17-15 range. n<sub>d</sub> = 1.0 unless the problem states otherwise.',
          vars: [
            { id: 'P', symbol: 'P', label: 'Rated power of prime mover', unit: 'hp', kind: 'input' },
            { id: 'n1', symbol: 'n_1', label: 'Input (faster shaft) speed', unit: 'rpm', kind: 'input' },
            { id: 'n2', symbol: 'n_2', label: 'Desired output speed', unit: 'rpm', kind: 'input', hint: 'mid-point if a range is given' },
            { id: 'SF', symbol: 'SF', label: 'Service factor Ks', unit: '', kind: 'lookup', fig: 'table7-1', default: 1.3, hint: 'Mott Table 7-1. Midterm 2025: 1.3; HW1 P2 (engine → heavy conveyor 16 h) 1.4; HW1 P3 (AC normal → fan 22 h) 1.2', check: v => (H.has(v, 'SF') && (v.SF < 1 || v.SF > 2)) ? 'SF is 1.0–2.0 in Table 7-1' : null },
            { id: 'nd', symbol: 'n_d', label: 'Design factor', unit: '', kind: 'input', default: 1.0, hint: 'course: nd = 1.0 unless stated' },
            { id: 'Pdes', symbol: 'P_{des}', label: 'Design power', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'P', 'SF') ? v.P * v.SF * (H.has(v, 'nd') ? v.nd : 1) : undefined,
              work: v => H.has(v, 'Pdes') ? '\\(P_{des} = ' + H.fmt(v.P) + '(' + H.fmt(v.SF) + ')(' + H.fmt(H.has(v, 'nd') ? v.nd : 1) + ') = ' + H.fmt(v.Pdes) + '\\ \\text{hp}\\)' : null },
            { id: 'VRn', symbol: 'VR', label: 'Nominal speed ratio', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'n1', 'n2') ? v.n1 / v.n2 : undefined,
              check: v => (H.has(v, 'VRn') && v.VRn > 6) ? 'Course: max ratio ≈ 6:1 plain (7:1 cogged)' : null },
          ] },
        { id: 'sec', title: 'Belt section', fig: ['fig7-13', 'abcd'],
          text: 'Enter Figure 7-13 with P<sub>des</sub> on the x-axis and n<sub>1</sub> on the y-axis (midterm: 52 hp @ 1150 rpm → 5V). The course also shows the classical A/B/C/D chart (slide 27) for inch sections — those are rated on the Shigley page.',
          vars: [
            { id: 'sec', label: 'Belt section', kind: 'choice', type: 'text', options: ['3V', '5V', '8V'] },
          ] },
      ] },

      { title: 'Step 4–6: sheave sizes', steps: [
        { id: 'd1', title: 'Driving sheave for vb ≈ 4000 ft/min (limit 5000 ft/min)', eq: '7-2', formula: 'D_1 \\approx \\frac{12 (4000)}{\\pi n_1},\\qquad D_{1,max} = \\frac{12 (5000)}{\\pi n_1}',
          text: 'Course: belt speed 1000–5000 ft/min with 4000 ft/min as the target (HW1: D<sub>1</sub> ≈ 12·4000/(π n<sub>1</sub>)); the midterm instead worked from the limit V &lt; 5000 → D ≤ 16.6 in at 1150 rpm and read Fig 7-15 at the 10.8 in sheave. Choose a standard pitch diameter from the vertical lines of Figure 7-14/15/16 (auto = nearest standard size to the 4000 ft/min value). Round the driven sheave up if between sizes.',
          fig: ['fig7-14', 'fig7-15', 'fig7-16'],
          vars: [
            { id: 'D1calc', symbol: 'D_{1,calc}', label: 'Driving sheave for 4000 ft/min', unit: 'in', kind: 'calc', compute: v => H.has(v, 'n1') ? 12 * 4000 / (Math.PI * v.n1) : undefined,
              work: v => H.has(v, 'D1calc') ? '\\(D_1 = \\frac{12(4000)}{\\pi(' + H.fmt(v.n1) + ')} = ' + H.fmt(v.D1calc) + '\\ \\text{in}\\)' : null },
            { id: 'D1max', symbol: 'D_{1,max}', label: 'Largest sheave for 5000 ft/min', unit: 'in', kind: 'calc', compute: v => H.has(v, 'n1') ? 12 * 5000 / (Math.PI * v.n1) : undefined },
            { id: 'D1', symbol: 'D_1', label: 'Standard driving sheave', unit: 'in', kind: 'lookup', fig: 'fig7-15', auto: v => (SHEAVES[v.sec] && H.has(v, 'D1calc')) ? nearest(v.D1calc, SHEAVES[v.sec]) : undefined, hint: 'try several trial sizes (Table 7-3 style); must be ≤ D1,max',
              check: v => (H.has(v, 'D1', 'D1max') && v.D1 > v.D1max) ? 'D1 gives V > 5000 ft/min' : null },
            { id: 'D2calc', symbol: 'D_{2,calc}', label: 'Driven sheave = D1·VR', unit: 'in', kind: 'calc', compute: v => H.has(v, 'D1', 'VRn') ? v.D1 * v.VRn : undefined },
            { id: 'D2', symbol: 'D_2', label: 'Standard driven sheave', unit: 'in', kind: 'lookup', fig: 'fig7-15', auto: v => (SHEAVES[v.sec] && H.has(v, 'D2calc')) ? nearest(v.D2calc, SHEAVES[v.sec]) : undefined, hint: 'auto = nearest standard size; course: round up' },
            { id: 'VR', symbol: 'VR', label: 'Actual speed ratio D2/D1', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'D1', 'D2') ? v.D2 / v.D1 : undefined },
            { id: 'n2a', symbol: 'n_{2,act}', label: 'Actual output speed', unit: 'rpm', kind: 'calc', compute: v => H.has(v, 'n1', 'VR') ? v.n1 / v.VR : undefined,
              check: v => (H.has(v, 'n2a', 'n2') && Math.abs(v.n2a / v.n2 - 1) > 0.05) ? 'Output speed differs from target by more than 5 % — try other sheave sizes' : null },
            { id: 'vb', symbol: 'v_b', label: 'Actual belt speed', unit: 'ft/min', kind: 'calc', compute: v => H.has(v, 'D1', 'n1') ? Math.PI * v.D1 * v.n1 / 12 : undefined,
              work: v => H.has(v, 'vb') ? '\\(v_b = \\frac{\\pi(' + H.fmt(v.D1) + ')(' + H.fmt(v.n1) + ')}{12} = ' + H.fmt(v.vb) + '\\ \\text{ft/min}\\)' : null,
              check: v => (H.has(v, 'vb') && v.vb > 6500) ? 'Above the 6500 ft/min maximum' : (H.has(v, 'vb') && v.vb > 5000) ? 'Above 5000 ft/min — course limit; consult sheave supplier' : (H.has(v, 'vb') && v.vb < 1000) ? 'Below 1000 ft/min — consider gears/chain' : null },
          ] },
      ] },

      { title: 'Step 7: rated power per belt', steps: [
        { id: 'rate', title: 'Basic rating PTab and power added ΔPR for speed ratio', fig: ['fig7-14', 'fig7-15', 'fig7-16', 'fig7-17', 'gates-b10'],
          formula: 'P_{rated} = P_{Tab} + \\Delta P_R\\qquad\\text{(3V/8V, Mech bible):}\\ P_{rated} = P_2 + \\frac{VR - 3.38}{3.38 - 1}(P_2 - P_1)',
          text: 'Read the solid curve for D<sub>1</sub> at n<sub>1</sub> (interpolate between the 870/1160/1750 rpm curves if needed) → P<sub>Tab</sub> (midterm: Fig 7-15 @ 1160 rpm, 10.8 in → 23 hp). For a 5V belt read the power added from Figure 7-17 at the actual VR (midterm 1.26). For 3V and 8V read the dashed curve (rating at VR ≥ 3.38) → P<sub>2</sub>; the auto value for ΔP<sub>R</sub> then interpolates linearly between VR = 1 and 3.38. VR &gt; 3.38 adds nothing more.',
          vars: [
            { id: 'P1', symbol: 'P_{Tab}', label: 'Basic rated power (solid curve, VR = 1)', unit: 'hp', kind: 'lookup', fig: 'fig7-15' },
            { id: 'P2', symbol: 'P_2', label: 'Rating on dashed curve (VR ≥ 3.38) — 3V/8V only', unit: 'hp', kind: 'lookup', fig: 'fig7-14', hint: 'leave blank for 5V (use Fig 7-17)' },
            { id: 'Padd', symbol: '\\Delta P_R', label: 'Power added for speed ratio', unit: 'hp', kind: 'lookup', fig: 'fig7-17',
              auto: v => (H.has(v, 'P1', 'P2', 'VR')) ? Math.max(0, (v.P2 - v.P1) * Math.min(v.VR - 1, 2.38) / 2.38) : (H.has(v, 'VR') && v.VR <= 1.02 ? 0 : undefined) },
            { id: 'Prated', symbol: 'P_{rated}', label: 'Rated power per belt (PTab + ΔPR)', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'P1', 'Padd') ? v.P1 + v.Padd : undefined,
              work: v => H.has(v, 'Prated') ? '\\(P_{Tab} + \\Delta P_R = ' + H.fmt(v.P1) + ' + ' + H.fmt(v.Padd) + ' = ' + H.fmt(v.Prated) + '\\ \\text{hp}\\)' : null },
          ] },
      ] },

      { title: 'Step 8–9: centre distance and belt length', steps: [
        { id: 'len', title: 'Trial CD, belt length, standard length and actual CD', fig: ['table7-2', 'fig7-4', 'gates-b4', 'gates-b6'], eq: '7-12, 7-13, 7-17',
          formula: 'D_2 < CD < 3(D_2 + D_1);\\quad L = 2CD + 1.57(D_2 + D_1) + \\frac{(D_2 - D_1)^2}{4CD};\\quad B = 4L - 6.28(D_2 + D_1),\\ CD = \\frac{B + \\sqrt{B^2 - 32(D_2 - D_1)^2}}{16}',
          text: 'Choose CD<sub>trial</sub> in the allowed range (use the given centre distance if the problem states one — midterm: 32 in). Pick a standard length for the section from Table 7-2 (auto = nearest; the course accepts either neighbour — the midterm chose the larger, 125 in for L = 122.9), then recompute the actual CD with the B-formula (Eq. 7-13).',
          vars: [
            { id: 'CDt', symbol: 'CD_{trial}', label: 'Trial centre distance', unit: 'in', kind: 'input', auto: v => H.has(v, 'D2', 'D1') ? Math.ceil(v.D2 * 1.15) : undefined,
              check: v => (H.has(v, 'CDt', 'D1', 'D2') && (v.CDt <= v.D2 || v.CDt >= 3 * (v.D1 + v.D2))) ? 'Outside D2 < CD < 3(D2 + D1)' : null },
            { id: 'CDlo', symbol: 'CD_{min}', label: 'Lower limit D2', unit: 'in', kind: 'calc', compute: v => H.has(v, 'D2') ? v.D2 : undefined },
            { id: 'CDhi', symbol: 'CD_{max}', label: 'Upper limit 3(D2 + D1)', unit: 'in', kind: 'calc', compute: v => H.has(v, 'D1', 'D2') ? 3 * (v.D1 + v.D2) : undefined },
            { id: 'Lreq', symbol: 'L', label: 'Required belt length', unit: 'in', kind: 'calc', compute: v => H.has(v, 'CDt', 'D1', 'D2') ? 2 * v.CDt + 1.57 * (v.D1 + v.D2) + (v.D2 - v.D1) ** 2 / (4 * v.CDt) : undefined,
              work: v => H.has(v, 'Lreq') ? '\\(L = 2(' + H.fmt(v.CDt) + ') + 1.57(' + H.fmt(v.D2) + '+' + H.fmt(v.D1) + ') + \\frac{(' + H.fmt(v.D2) + '-' + H.fmt(v.D1) + ')^2}{4(' + H.fmt(v.CDt) + ')} = ' + H.fmt(v.Lreq) + '\\ \\text{in}\\)' : null },
            { id: 'Lstd', symbol: 'L_{std}', label: 'Standard belt length', unit: 'in', kind: 'lookup', fig: 'table7-2', auto: v => (LENGTHS[v.sec] && H.has(v, 'Lreq')) ? nearest(v.Lreq, LENGTHS[v.sec]) : undefined, hint: 'auto = nearest Table 7-2 length; either neighbour accepted (midterm took the larger)' },
            { id: 'B', symbol: 'B', label: 'B = 4L − 6.28(D2 + D1)', unit: 'in', kind: 'calc', compute: v => H.has(v, 'Lstd', 'D1', 'D2') ? 4 * v.Lstd - 6.28 * (v.D1 + v.D2) : undefined },
            { id: 'CD', symbol: 'CD', label: 'Actual centre distance', unit: 'in', kind: 'calc', compute: v => { if (!H.has(v, 'B', 'D1', 'D2')) return undefined; const r = v.B * v.B - 32 * (v.D2 - v.D1) ** 2; return r >= 0 ? (v.B + Math.sqrt(r)) / 16 : undefined; },
              work: v => H.has(v, 'CD') ? '\\(CD = \\frac{' + H.fmt(v.B) + ' + \\sqrt{' + H.fmt(v.B) + '^2 - 32(' + H.fmt(v.D2) + '-' + H.fmt(v.D1) + ')^2}}{16} = ' + H.fmt(v.CD) + '\\ \\text{in}\\)' : null,
              check: v => (H.has(v, 'CD', 'D1', 'D2') && (v.CD <= v.D2 || v.CD >= 3 * (v.D1 + v.D2))) ? 'Actual CD outside D2 < CD < 3(D2 + D1)' : null },
          ] },
      ] },

      { title: 'Step 10–12: corrections, number of belts, factor of safety', steps: [
        { id: 'wrap', title: 'Angle of wrap and correction factors', fig: ['fig7-18', 'fig7-19'], eq: '7-14, 7-15',
          formula: '\\theta_1 = 180^\\circ - 2\\sin^{-1}\\frac{D_2 - D_1}{2CD},\\qquad \\theta_2 = 180^\\circ + 2\\sin^{-1}\\frac{D_2 - D_1}{2CD}',
          text: 'θ<sub>1</sub> must exceed 120° (course). C<sub>θ</sub> from Figure 7-18 at θ<sub>1</sub>; C<sub>L</sub> from Figure 7-19 at the standard length for the section (auto values are reads of the curves — check the charts; midterm 164° → 0.96, 5V 125 in → 1.0).',
          vars: [
            { id: 'th1', symbol: '\\theta_1', label: 'Wrap angle, small sheave', unit: '°', kind: 'calc', compute: v => H.has(v, 'D1', 'D2', 'CD') ? 180 - 2 * H.deg(Math.asin((v.D2 - v.D1) / (2 * v.CD))) : undefined,
              work: v => H.has(v, 'th1') ? '\\(\\theta_1 = 180^\\circ - 2\\sin^{-1}\\frac{' + H.fmt(v.D2) + '-' + H.fmt(v.D1) + '}{2(' + H.fmt(v.CD) + ')} = ' + H.fmt(v.th1) + '^\\circ\\)' : null,
              check: v => (H.has(v, 'th1') && v.th1 < 120) ? 'θ1 < 120° — increase CD' : null },
            { id: 'th2', symbol: '\\theta_2', label: 'Wrap angle, large sheave', unit: '°', kind: 'calc', compute: v => H.has(v, 'th1') ? 360 - v.th1 : undefined },
            { id: 'Cth', symbol: 'C_\\theta', label: 'Angle-of-wrap correction factor', unit: '', kind: 'lookup', fig: 'fig7-18', auto: v => H.has(v, 'th1') ? H.interp(v.th1, CTH_X, CTH_Y) : undefined },
            { id: 'CL', symbol: 'C_L', label: 'Belt-length correction factor', unit: '', kind: 'lookup', fig: 'fig7-19', auto: v => (CL[v.sec] && H.has(v, 'Lstd')) ? H.interp(v.Lstd, CL[v.sec].map(x => x[0]), CL[v.sec].map(x => x[1])) : undefined },
          ] },
        { id: 'nb', title: 'Allowable power per belt, number of belts and factor of safety', formula: 'P_A = C_\\theta C_L (P_{Tab} + \\Delta P_R),\\qquad N_{belts} = \\left\\lceil \\frac{P_{des}}{P_A} \\right\\rceil,\\qquad n_{fs} = \\frac{N_{belts} P_A}{P_{des}}',
          text: 'Course slide 30/41: P<sub>A</sub> = C<sub>θ</sub>C<sub>L</sub>(P<sub>Tab</sub> + ΔP<sub>R</sub>); round the number of belts up; n<sub>fs</sub> = allowable power / design power (midterm: 3 × 23.29 / 52 = 1.34).',
          vars: [
            { id: 'Pcorr', symbol: 'P_A', label: 'Allowable (corrected) power per belt', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'Cth', 'CL', 'Prated') ? v.Cth * v.CL * v.Prated : undefined,
              work: v => H.has(v, 'Pcorr') ? '\\(P_A = (' + H.fmt(v.Cth) + ')(' + H.fmt(v.CL) + ')(' + H.fmt(v.P1) + ' + ' + H.fmt(v.Padd) + ') = ' + H.fmt(v.Pcorr) + '\\ \\text{hp}\\)' : null },
            { id: 'Ncalc', symbol: 'P_{des}/P_A', label: 'Belts required (unrounded)', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'Pdes', 'Pcorr') ? v.Pdes / v.Pcorr : undefined },
            { id: 'Nb', symbol: 'N_{belts}', label: 'Number of belts (round UP)', unit: '', kind: 'calc', compute: v => H.has(v, 'Ncalc') ? Math.ceil(v.Ncalc - 1e-9) : undefined,
              work: v => H.has(v, 'Nb') ? '\\(N = ' + H.fmt(v.Pdes) + '/' + H.fmt(v.Pcorr) + ' = ' + H.fmt(v.Ncalc, 3) + ' \\rightarrow ' + v.Nb + '\\ \\text{belts}\\)' : null },
            { id: 'nfs', symbol: 'n_{fs}', label: 'Factor of safety', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'Nb', 'Pcorr', 'Pdes') ? v.Nb * v.Pcorr / v.Pdes : undefined,
              work: v => H.has(v, 'nfs') ? '\\(n_{fs} = \\frac{' + v.Nb + '(' + H.fmt(v.Pcorr) + ')}{' + H.fmt(v.Pdes) + '} = ' + H.fmt(v.nfs, 3) + '\\)' : null },
          ],
          after: v => {
            if (!H.has(v, 'Nb')) return '';
            return '<span class="result-ok">Design summary</span> — ' + v.Nb + ' × ' + (v.sec || '') + H.fmt(v.Lstd) + ' belts; sheaves ' + H.fmt(v.D1) + ' in (driver, ' + v.Nb + ' grooves) and ' + H.fmt(v.D2) + ' in (driven); CD = ' + H.fmt(v.CD) + ' in; wrap ' + H.fmt(v.th1) + '°; actual output speed ' + H.fmt(v.n2a) + ' rpm; belt speed ' + H.fmt(v.vb) + ' ft/min; design power ' + H.fmt(v.Pdes) + ' hp vs ' + H.fmt(v.Nb * v.Pcorr) + ' hp capacity (n<sub>fs</sub> = ' + H.fmt(v.nfs, 3) + ').';
          } },
      ] },

      { title: 'Course add-on: Gates installation tension and deflection check (slides 39–40)', steps: [
        { id: 'gates', title: 'Static installation tension per strand (Gates Formula D19) and span length (D35)', fig: ['gates-d19', 'gates-ex'],
          formula: 'T_{st} = 15\\left(\\frac{2.5 - K_\\phi}{K_\\phi}\\right)\\frac{(\\text{Motor HP})(10^3)}{N\\,V} + \\frac{M V^2}{10^6}\\ \\text{lbf},\\qquad t = C\\left[1 - 0.125\\left(\\frac{D-d}{C}\\right)^2\\right]',
          text: 'Pick the Gates cross-section to fill M and Y (Table D27). K<sub>φ</sub> (Table D26) is read at (D − d)/C (auto = linear interpolation; lecture example 0.67 → 0.90). Use the <b>motor (nominal) hp</b>, the number of belts N and the belt speed V from the design above (Module 1 p24; using the design hp overstates T<sub>st</sub>). The square-root span formula printed on the Gates page is marked "incorrect" by the course — Formula D35 is used here.',
          vars: [
            { id: 'gsec', label: 'Gates cross-section (Table D27)', kind: 'choice', type: 'text', options: Object.keys(GATES), hint: 'leave blank to skip the tensioning check' },
            { id: 'M', symbol: 'M', label: 'Constant M (Table D27)', unit: '', kind: 'lookup', fig: 'gates-d19', auto: v => GATES[v.gsec] ? GATES[v.gsec][0] : undefined },
            { id: 'Y', symbol: 'Y', label: 'Constant Y (Table D27)', unit: '', kind: 'lookup', fig: 'gates-d19', auto: v => GATES[v.gsec] ? GATES[v.gsec][1] : undefined },
            { id: 'Hmot', symbol: '\\text{Motor HP}', label: 'Motor (nominal) horsepower', unit: 'hp', kind: 'input', auto: v => H.has(v, 'P') ? v.P : undefined, hint: 'auto = rated power P above (NOT the design power)' },
            { id: 'Ng', symbol: 'N', label: 'Number of belts', unit: '', kind: 'input', auto: v => H.has(v, 'Nb') ? v.Nb : undefined, hint: 'auto = N_belts above' },
            { id: 'ddc', symbol: '(D-d)/C', label: 'Sheave difference ratio', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'D1', 'D2', 'CD') ? (v.D2 - v.D1) / v.CD : undefined },
            { id: 'Kphi', symbol: 'K_\\phi', label: 'Arc of contact factor (Table D26)', unit: '', kind: 'lookup', fig: 'gates-d19', auto: v => H.has(v, 'ddc') ? H.interp(v.ddc, KPHI_X, KPHI_Y) : undefined },
            { id: 'Tst', symbol: 'T_{st}', label: 'Static tension per strand', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'Kphi', 'Hmot', 'Ng', 'vb', 'M') ? 15 * (2.5 - v.Kphi) / v.Kphi * v.Hmot * 1000 / (v.Ng * v.vb) + v.M * v.vb * v.vb / 1e6 : undefined,
              work: v => H.has(v, 'Tst') ? '\\(T_{st} = 15\\left(\\frac{2.5 - ' + H.fmt(v.Kphi) + '}{' + H.fmt(v.Kphi) + '}\\right)\\frac{' + H.fmt(v.Hmot) + '(10^3)}{' + v.Ng + '(' + H.fmt(v.vb) + ')} + \\frac{' + H.fmt(v.M) + '(' + H.fmt(v.vb) + ')^2}{10^6} = ' + H.fmt(v.Tst) + '\\ \\text{lbf}\\)' : null },
            { id: 'tspan', symbol: 't', label: 'Span length (Formula D35)', unit: 'in', kind: 'calc', compute: v => H.has(v, 'CD', 'ddc') ? v.CD * (1 - 0.125 * v.ddc * v.ddc) : undefined,
              work: v => H.has(v, 'tspan') ? '\\(t = ' + H.fmt(v.CD) + '\\left[1 - 0.125(' + H.fmt(v.ddc, 3) + ')^2\\right] = ' + H.fmt(v.tspan) + '\\ \\text{in}\\)' : null },
            { id: 'defl', symbol: 't/64', label: 'Deflection to apply (1/64 in per inch of span)', unit: 'in', kind: 'calc', digits: 3, compute: v => H.has(v, 'tspan') ? v.tspan / 64 : undefined },
          ] },
        { id: 'defl', title: 'Deflection forces (Gates Formulas D20–D23)', fig: ['gates-d20'],
          formula: '\\ge 2\\ \\text{belts: } F_{min} = \\frac{1.4 T_{st} + Y}{16},\\ F_{max} = \\frac{1.5 T_{st} + Y}{16};\\qquad \\text{1 belt: } F_{min} = \\frac{1.4 T_{st} + (t/L)Y}{16},\\ F_{max} = \\frac{1.5 T_{st} + (t/L)Y}{16}',
          text: 'Force applied at mid-span to deflect one belt by t/64. For a single belt the Y term is scaled by span/belt length (lecture: 3VX800, t = 18.21 in, L = 80 in → 1.95–2.08 lbf; Tutorial 2 Q2 with 4 CP belts → 27.4–29.0 lbf).',
          vars: [
            { id: 'Lg', symbol: 'L', label: 'Belt length (for the single-belt formula)', unit: 'in', kind: 'input', auto: v => H.has(v, 'Lstd') ? v.Lstd : undefined, hint: 'auto = standard length above' },
            { id: 'Fmin', symbol: 'F_{min}', label: 'Minimum deflection force', unit: 'lbf', kind: 'calc', digits: 3, compute: v => { if (!H.has(v, 'Tst', 'Y', 'Ng')) return undefined; if (v.Ng >= 2) return (1.4 * v.Tst + v.Y) / 16; return H.has(v, 'tspan', 'Lg') ? (1.4 * v.Tst + v.tspan / v.Lg * v.Y) / 16 : undefined; },
              work: v => H.has(v, 'Fmin') ? '\\(F_{min} = \\frac{1.4(' + H.fmt(v.Tst) + ') + ' + (v.Ng >= 2 ? H.fmt(v.Y) : '(' + H.fmt(v.tspan) + '/' + H.fmt(v.Lg) + ')' + H.fmt(v.Y)) + '}{16} = ' + H.fmt(v.Fmin, 3) + '\\ \\text{lbf}\\)' : null },
            { id: 'Fmax', symbol: 'F_{max}', label: 'Maximum deflection force', unit: 'lbf', kind: 'calc', digits: 3, compute: v => { if (!H.has(v, 'Tst', 'Y', 'Ng')) return undefined; if (v.Ng >= 2) return (1.5 * v.Tst + v.Y) / 16; return H.has(v, 'tspan', 'Lg') ? (1.5 * v.Tst + v.tspan / v.Lg * v.Y) / 16 : undefined; } },
          ],
          after: v => H.has(v, 'Fmin', 'Fmax', 'defl') ? '<span class="result-ok">Installation</span> — tension each strand to T<sub>st</sub> = ' + H.fmt(v.Tst) + ' lbf: a force of ' + H.fmt(v.Fmin, 3) + '–' + H.fmt(v.Fmax, 3) + ' lbf at mid-span should deflect one belt ' + H.fmt(v.defl, 3) + ' in (span ' + H.fmt(v.tspan) + ' in).' : '' },
      ] },
    ],
  };
})();
