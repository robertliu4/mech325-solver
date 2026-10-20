// Roller chain — Shigley Ch. 17-5 (merged Fizz §1.6 + Mech §8.3.4; Example 17-5)
// Course alignment (v2/COURSE_CONVENTIONS.md §0, §4): "Flexible belts Intro and Chains" slides 12–34, Tutorial 1, HW1 P5–P7. Defaults:
// Ks 1.3 (moderate shock, electric motor — Martin Table II / Mott 7-17; HW1 P7 used 1.5 for a 2-cyl engine outdoors), nd = 1.0, N1 = 17
// (avoid fewer), ratio ≤ 7:1, K2 strand factors 1.7/2.5/3.3/3.9/4.6, Kr = 17 for No. 40–240 (29 for 25/35, 3.4 for 41), rating basis
// 15 000 h / 17 T / 100 pitches, CD 30–50 pitches and ≥ 150 % of the large sprocket, V ≤ 9000 ft/min, even number of pitches,
// wrap > 120°, life correction Eq. 17-39 with Kr = 17 ("not indicated in Shigley text", Module 1 p9).
// Verified against: Tutorial 1 Q2 (S 17-26, Module 1 p7–10): No. 40-4, N1 21 @ 2000 rpm, N2 84, C/p 40 → L/p 135 (kept odd by the
//   solution; auto rounds to 136), L 67.5 in, Htab 7.72 (auto 7.65), K1 1.37, K2 3.3, Ha 34.9; H1(21 T) 12.84 → ×3.3 = 42.4;
//   H2(21 T) 10.5 → 34.7 (roller governs); 20 000 h, 135 pitches: H2 10.56 → 34.8 hp; T 91.4 lbf·ft, D1 3.355 in, tension 654 lbf.
// Verified against: HW1 P7 (S 17-27): 25 hp @ 700 rpm → 140 rpm, No. 80, Ks 1.5, nd 1 → Hd 37.5; N1 17 (K1 = 1), N2 85 (solution used
//   84); Htab 31.0 hp (Table 17-20; auto 31.01, Eq. 17-32 governs), K2 1.7 → Ha 52.7 ≥ 37.5 → 2 strands, output 140 rpm (141.7 with 84 T).
// Guide assumptions (review pass): `assumptions` lists Fizz §1.6 / Mech §8.3.4 rules; chain default No. 60 (Mech p.34), N1 = 17 (Mech p.36),
//   Ks figure now Mott Table 7-17 (the table both guides use for chains).
(function () {
  // Table 17-19: ANSI chain number → [pitch in, min tensile strength lbf, weight lbf/ft]
  const CHAIN = { 25: [0.25, 780, 0.09], 35: [0.375, 1760, 0.21], 41: [0.5, 1500, 0.25], 40: [0.5, 3130, 0.42], 50: [0.625, 4880, 0.69], 60: [0.75, 7030, 1.00], 80: [1.0, 12500, 1.71], 100: [1.25, 19500, 2.58], 120: [1.5, 28000, 3.87], 140: [1.75, 38000, 4.95], 160: [2.0, 50000, 6.61], 180: [2.25, 63000, 9.06], 200: [2.5, 78000, 10.96], 240: [3.0, 112000, 16.4] };
  const K2 = { 1: 1.0, 2: 1.7, 3: 2.5, 4: 3.3, 5: 3.9, 6: 4.6, 8: 6.0 };
  const Kr = no => (no === 25 || no === 35) ? 29 : (no === 41 ? 3.4 : 17);
  // helpers that fall back to the table / rounding so that auto-lookups do not depend on other autos (engine runs autos once)
  const pv = v => H.has(v, 'p') ? v.p : (CHAIN[v.chain] ? CHAIN[v.chain][0] : undefined);
  const N2v = v => H.has(v, 'N2') ? v.N2 : (H.has(v, 'N1', 'n1', 'n2') ? Math.round(v.N1 * v.n1 / v.n2) : undefined);
  const H1 = v => { const p = pv(v); return (H.has(v, 'n1') && p !== undefined) ? (v.chain === 41 ? 0.0022 : 0.004) * 17 ** 1.08 * v.n1 ** 0.9 * p ** (3 - 0.07 * p) : undefined; };
  const H2 = v => { const p = pv(v); return (H.has(v, 'n1') && p !== undefined) ? 1000 * Kr(v.chain) * 17 ** 1.5 * p ** 0.8 / v.n1 ** 1.5 : undefined; };
  const Lpc = v => { const N2 = N2v(v); return (H.has(v, 'Cp', 'N1') && N2 !== undefined) ? 2 * v.Cp + (v.N1 + N2) / 2 + (N2 - v.N1) ** 2 / (4 * Math.PI * Math.PI * v.Cp) : undefined; };

  window.TOPIC = {
    id: 'chains', book: 'shigley',
    title: 'Roller Chain — Selection & Geometry',
    subtitle: 'Shigley Ch. 17-5 (Tables 17-19 … 17-23, Eqs. 17-29 … 17-38) · merged Fizz §1.6 + Mech §8.3.4',
    sibling: 'chains_mott.html',
    intro: 'Shigley\'s roller-chain method (Example 17-5): design power H<sub>d</sub> = H<sub>nom</sub>K<sub>s</sub>n<sub>d</sub>, tabulated 17-tooth rating H<sub>tab</sub> from Table 17-20 (the auto estimate is min(H₁, H₂) of Eqs. 17-32/17-33, which is how the table was built), tooth factor K<sub>1</sub> (Table 17-22) and strand factor K<sub>2</sub> (Table 17-23) → allowable power H<sub>a</sub> = K<sub>1</sub>K<sub>2</sub>H<sub>tab</sub>. Then sprocket pitch diameters (Eq. 17-29), chain length in pitches (Eq. 17-34, round to an even integer), centre distance (Eqs. 17-35/36) and the wrap angles the bibles add from Mott. The Mech bible notes Shigley\'s process "is very similar" to Mott\'s but the rating needs the two correction factors. <b>Course defaults</b> (MECH 325 "Flexible belts — Intro and Chains" slides 12–34, Tutorial 1, HW1 P5–P7): H<sub>d</sub> = H<sub>nom</sub>K<sub>s</sub>n<sub>d</sub> with n<sub>d</sub> = 1.0 and K<sub>s</sub> from Shigley Table 17-15 / Mott 7-17 / Martin Table II (course figure), at least 17 teeth on the driver, ratio ≤ 7:1, K<sub>r</sub> = 17, rating basis 15 000 h, CD 30–50 pitches and ≥ 1.5 × large-sprocket diameter, even number of pitches, wrap &gt; 120°, V ≤ 9000 ft/min; the Eq. 17-39 life correction uses K<sub>r</sub> = 17.',
    example: { Hnom: 25, n1: 700, n2: 140, Ks: 1.5, nd: 1, N1: 17, chain: 80, strands: 2, Cp: 40, Lh: 15000 },
    assumptions: [
      { text: 'Service factor K_s from Mott Table 7-17 (both guides; Shigley Table 17-15 or the Martin catalogue also accepted) — default 1.3 = moderate shock, electric motor (also Shigley Ex. 17-5)', src: 'Fizz p.27 · Mech p.34', var: 'Ks' },
      { text: 'No extra design factor: the guides use P_{des} = SF·P, i.e. n_d = 1.0 (Shigley Ex. 17-5 chose 1.5; Renold multipliers if stated)', src: 'Fizz p.27 · Mech p.34 · course Chains s26', var: 'nd' },
      { text: 'Output speed given as a range → use its midpoint for VR', src: 'Fizz p.28 · Mech p.34', var: 'n2' },
      { text: 'Use N_1 = 17 teeth so that K_1 = 1 ("you just need Nd to be 17 to not have to do too much work"); never fewer than 17 unless n_1 < 100 rpm', src: 'Mech p.36 · Fizz p.28', var: 'N1' },
      { text: 'N_2 = N_1·VR rounded to the nearest integer (Mech rounds up); N_2 ≤ 120 teeth', src: 'Fizz p.28 · Fizz p.30 · Mech p.35', var: 'N2' },
      { text: 'Start with a No. 60 chain (No. 40 often fails, No. 80 is usually overkill), then change size or add strands', src: 'Mech p.34', var: 'chain' },
      { text: 'Single strand first; strand factors K_2 = 1.7 / 2.5 / 3.3 for 2 / 3 / 4 strands', src: 'Fizz p.28 · Mech p.36', var: 'strands' },
      { text: 'H_{tab} from Table 17-20 (interpolate on rpm; the zone gives the lubrication type); H_a = K_1K_2H_{tab} must be at least H_d', src: 'Fizz p.28 · Mech p.36', var: 'Htab' },
      { text: 'Trial centre distance 40 pitches (30–50 recommended)', src: 'Fizz p.30 · Mech p.35', var: 'Cp' },
      { text: 'Chain length rounded to the nearest EVEN number of pitches (Shigley Ex. 17-5: 75.79 → 76); Fizz rounds to the nearest integer, Mech rounds up', src: 'Mech p.35 · Fizz p.30', var: 'Lp' },
      { text: 'Angle of wrap on the small sprocket at least 120°', src: 'Fizz p.31' },
      { text: 'Factor of safety = allowable power / design power = H_a/H_d', src: 'Fizz p.31 · Mech p.36' },
      { text: 'Rating basis 15 000 h, 17-tooth sprocket, 100 pitches; Eq. 17-39 life correction with K_r = 17 for No. 40–240 (course)', src: 'course Chains s24 · Module 1 p9', var: 'Lh' },
      { text: 'Chain used as a tension member: only 10 % of the tensile strength is usable (strength ≥ 10 × working load)', src: 'Fizz p.27 · course HW1 P5' },
    ],

    figures: [
      { id: 'fig17-16', ref: 'Figure 17-16', title: 'Roller chain nomenclature (pitch, width, roller diameter, strand spacing)', src: 'figures/shigley/fig17-16.png', page: 930 },
      { id: 'fig17-17', ref: 'Figure 17-17', title: 'Engagement of chain and sprocket — pitch angle γ, pitch diameter D', src: 'figures/shigley/fig17-17.png', page: 932 },
      { id: 'fig17-18', ref: 'Figure 17-18', title: 'Chordal speed variation vs number of teeth', src: 'figures/shigley/fig17-18.png', page: 933 },
      { id: 'table17-19', ref: 'Table 17-19', title: 'Dimensions of American Standard roller chains (pitch, width, tensile strength, weight)', src: 'figures/shigley/table17-19.png', page: 931 },
      { id: 'table17-20a', ref: 'Table 17-20 (a)', title: 'Rated hp of single-strand chain, 17-tooth sprocket — chains 25 … 60, with lubrication type zones', src: 'figures/shigley/table17-20a.png', page: 934, note: 'Type A manual/drip; B bath/disk; C oil stream. Pre-extreme (rising) entries = link-plate fatigue, Eq. 17-32; post-extreme (falling) = roller impact, Eq. 17-33.' },
      { id: 'table17-20b', ref: 'Table 17-20 (b)', title: 'Rated hp of single-strand chain, 17-tooth sprocket — chains 80 … 240', src: 'figures/shigley/table17-20b.png', page: 935, note: "Type C′ = galling region: submit to manufacturer." },
      { id: 'table17-21', ref: 'Table 17-21', title: 'Available sprocket tooth counts (one supplier)', src: 'figures/shigley/table17-21.png', page: 935 },
      { id: 'table17-22', ref: 'Table 17-22', title: 'Tooth correction factor K1 (pre-/post-extreme)', src: 'figures/shigley/table17-22.png', page: 936, note: 'General: K1 = (N1/17)^1.08 pre-extreme, (N1/17)^1.5 post-extreme.' },
      { id: 'table17-23', ref: 'Table 17-23', title: 'Multiple-strand factors K2', src: 'figures/shigley/table17-23.png', page: 936 },
      { id: 'table7-17', ref: 'Table 7-17', book: 'mott', title: 'Service factors for chain drives (load type × driver) — the table both bibles use', src: 'figures/mott/table7-17.png', page: 303, note: 'Smooth 1.0/1.0/1.2, moderate shock 1.2/1.3/1.4, heavy shock 1.4/1.5/1.7 for hydraulic drive / electric motor or turbine / IC engine with mechanical drive.' },
      { id: 'table17-15', ref: 'Table 17-15', title: 'Service factors Ks (V-belt table; use the same classes for chains)', src: 'figures/shigley/table17-15.png', page: 925 },
      { id: 'martin-sf', ref: 'Martin catalogue Table II (slide 29)', book: 'course', title: 'Martin chain service factors and selection notes', src: 'figures/course/chain_martin_service_factors.png', note: 'Uniform 1.0/1.0/1.2, moderate shock 1.2/1.3/1.4, heavy shock 1.4/1.5/1.7 for (IC engine hydraulic / electric motor or turbine / IC engine mechanical); add 0.2 per unfavourable condition. 17 teeth minimum recommended (15 common, 7 possible).' },
      { id: 'martin-ex', ref: 'Martin selection example (slide 30)', book: 'course', title: 'Martin example: 10 hp motor 1200 → 300 rpm, 30 in centres, moderate shock → SF 1.3, No. 50, 18 T / 70 T, 142 pitches', src: 'figures/course/chain_martin_selection_example.png' },
      { id: 'ansi50', ref: 'ANSI No. 50 strength table (slide 15)', book: 'course', title: 'ANSI #50 chain dimensions, minimum tensile and working loads for 1–6 strands', src: 'figures/course/chain_ansi50_strength_table.png', note: '#50: 4880 lb tensile / 1400 lb working per strand; 50-2 9760/2380; 50-3 14 640/3500; 50-4 19 520/4620; 50-5 24 400/5460; 50-6 29 280/6440.' },
      { id: 'renold-hp', ref: 'Renold No. 50 hp rating (slide 20)', book: 'course', title: 'Renold Jeffrey No. 50 single-strand hp table with strand factors and lubrication types', src: 'figures/course/chain_renold_no50_hp_rating.png', note: 'e.g. 17 T @ 1200 rpm = 16.85 hp (Type B); 18 T @ 300 rpm = 4.71 hp.' },
      { id: 'renold-limit', ref: 'Renold power-limit chart (slide 21)', book: 'course', title: 'Renold kW vs rpm limit chart (link-plate fatigue / roller impact / galling regions)', src: 'figures/course/chain_renold_power_limit_chart.png' },
      { id: 'renold-sf', ref: 'Renold safety factors (slide 33)', book: 'course', title: 'Renold nominal safety factor on breaking load vs cycles and application', src: 'figures/course/chain_renold_safety_factors.png', note: '5.0 (10⁶ cycles) / 6.0 (2×10⁶) dynamic ≤ working load; 8.0 (8×10⁶, occasional 20 % overload); 10 passenger lifts; 12 harsh environments.' },
      { id: 'renold-nd', ref: 'Renold design-factor multipliers (slide 34)', book: 'course', title: 'Renold nd multipliers: lubrication × cleanliness and temperature × load', src: 'figures/course/chain_renold_design_factor_multipliers.png', note: 'Regular lube 1.00/1.25/1.50 (clean / moderately clean / dirty); occasional 1.25/1.50/1.75; none 1.50/1.50/1.75. +10…150 °C 1.00/1.34/1.88 (smooth/moderate/heavy); 0…10 °C 1.25/1.88/2.38; −20…0 °C 1.50/2.50/3.13; −40…−20 °C 1.88/3.13/4.13.' },
      { id: 'fig7-4', ref: 'Figure 7-4', book: 'mott', title: 'Belt/chain configuration — wrap angle geometry (Mott)', src: 'figures/mott/fig7-4.png', page: 265 },
    ],

    sections: [
      { title: 'Inputs', steps: [
        { id: 'in', title: 'Problem data and design power', fig: ['table7-17', 'table17-15', 'martin-sf', 'renold-nd'], eq: '17-38', formula: 'H_d = H_{nom} K_s n_d,\\qquad VR = \\frac{n_1}{n_2}',
          text: 'Course rule: always multiply the nominal power by the service factor first. Ks from Mott Table 7-17 (both bibles), Shigley Table 17-15 or the Martin catalogue (HW1 P7: 1.5 for moderate shock, 2-cyl engine, outdoors; HW1 P6: 1.4 for a 6-cyl engine → heavy conveyor). nd = 1.0 normally; the Renold multipliers (slide 34) give nd &gt; 1 for poor lubrication, dirt or cold (Example 17-5 used 1.5). If the output speed is a range use its midpoint.',
          vars: [
            { id: 'Hnom', symbol: 'H_{nom}', label: 'Nominal power', unit: 'hp', kind: 'input' },
            { id: 'n1', symbol: 'n_1', label: 'Small (driving) sprocket speed', unit: 'rpm', kind: 'input' },
            { id: 'n2', symbol: 'n_2', label: 'Desired output speed', unit: 'rpm', kind: 'input' },
            { id: 'Ks', symbol: 'K_s', label: 'Service factor', unit: '', kind: 'lookup', fig: 'table7-17', default: 1.3, hint: 'Mott Table 7-17: 1.3 = moderate shock, electric motor; HW1 P7 1.5, HW1 P6 1.4', check: v => (H.has(v, 'Ks') && (v.Ks < 1 || v.Ks > 2.5)) ? 'Ks is normally 1.0–1.7 (+0.2 per unfavourable condition)' : null },
            { id: 'nd', symbol: 'n_d', label: 'Design factor', unit: '', kind: 'lookup', fig: 'renold-nd', default: 1.0, hint: 'course: nd = 1.0 unless stated (Renold multipliers for lubrication / dirt / temperature)' },
            { id: 'Hd', symbol: 'H_d', label: 'Design power', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'Hnom', 'Ks', 'nd') ? v.Hnom * v.Ks * v.nd : undefined,
              work: v => H.has(v, 'Hd') ? '\\(H_d = ' + H.fmt(v.Hnom) + '(' + H.fmt(v.Ks) + ')(' + H.fmt(v.nd) + ') = ' + H.fmt(v.Hd) + '\\ \\text{hp}\\)' : null },
            { id: 'VR', symbol: 'VR', label: 'Velocity ratio', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'n1', 'n2') ? v.n1 / v.n2 : undefined,
              check: v => (H.has(v, 'VR') && v.VR > 7) ? 'Course: 7:1 is near the maximum ratio — consider two stages' : null },
          ] },
        { id: 'spk', title: 'Sprocket teeth', fig: ['table17-21', 'fig17-17'],
          text: 'Course step 3: avoid fewer than 17 teeth on the driver (Martin: 17 minimum recommended, 15 common, as low as 7); odd numbers preferred (17, 19, 21 …); the driven sprocket should not exceed 120 teeth. N₂ = N₁·VR rounded to an integer (HW1 P7 chose 84 for 85), then recompute the output speed.',
          vars: [
            { id: 'N1', symbol: 'N_1', label: 'Driving sprocket teeth', unit: '', kind: 'input', default: 17, hint: 'Mech: use 17 so K1 = 1; never fewer than 17 above 100 rpm', check: v => (H.has(v, 'N1') && v.N1 < 17 && !(H.has(v, 'n1') && v.n1 < 100)) ? 'Fewer than 17 teeth above 100 rpm (Fizz p.28; Martin minimum recommended)' : null },
            { id: 'N2', symbol: 'N_2', label: 'Driven sprocket teeth', unit: '', kind: 'input', auto: v => H.has(v, 'N1', 'VR') ? Math.round(v.N1 * v.VR) : undefined, hint: 'auto = round(N1·VR); check availability in Table 17-21',
              check: v => (H.has(v, 'N2') && v.N2 > 120) ? 'N2 > 120 teeth: not made in standard sizes' : null },
            { id: 'VRa', symbol: 'VR_{act}', label: 'Actual ratio N2/N1', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'N1', 'N2') ? v.N2 / v.N1 : undefined },
            { id: 'n2a', symbol: 'n_{2,act}', label: 'Actual output speed', unit: 'rpm', kind: 'calc', compute: v => H.has(v, 'n1', 'VRa') ? v.n1 / v.VRa : undefined },
          ] },
      ] },

      { title: 'Chain selection & capacity', steps: [
        { id: 'chain', title: 'Chain number, strands and corrected rating', fig: ['table17-19', 'table17-20a', 'table17-20b', 'table17-22', 'table17-23', 'renold-hp', 'renold-limit', 'ansi50'], eq: '17-32, 17-33, 17-37',
          formula: 'H_1 = 0.004 N_1^{1.08} n_1^{0.9} p^{(3 - 0.07p)},\\quad H_2 = \\frac{1000 K_r N_1^{1.5} p^{0.8}}{n_1^{1.5}},\\quad H_{tab} = \\min(H_1,H_2)\\ (N_1 = 17),\\quad H_a = K_1 K_2 H_{tab}',
          text: 'Design approach (Example 17-5): the required table rating is H<sub>tab,req</sub> = H<sub>d</sub>/(K<sub>1</sub>K<sub>2</sub>); form a table of strands → required H<sub>tab</sub> → smallest chain in Table 17-20 that provides it at n₁ (with its lubrication type). The auto H<sub>tab</sub> is min(H₁, H₂) at the chosen chain and N₁ = 17 — read Table 17-20 to confirm (K<sub>r</sub> = 29 for No. 25/35, 3.4 for No. 41, 17 for No. 40–240; constant 0.0022 instead of 0.004 for No. 41). K<sub>1</sub> uses the pre-extreme exponent 1.08 when H₁ governs, post-extreme 1.5 when H₂ governs. Course (slide 24): the table is based on 15 000 h at full load, 17-tooth sprocket, 1:1 ratio, single strand of 100 pitches, SF 1.0 and recommended lubrication; K<sub>2</sub> = 1.7 / 2.5 / 3.3 / 3.9 / 4.6 for 2–6 strands.',
          vars: [
            { id: 'chain', label: 'ANSI chain number', kind: 'choice', options: Object.keys(CHAIN).map(Number), default: 60, hint: 'Mech: start with No. 60; change size or strands until Ha ≥ Hd' },
            { id: 'p', symbol: 'p', label: 'Chain pitch', unit: 'in', kind: 'lookup', fig: 'table17-19', auto: v => CHAIN[v.chain] ? CHAIN[v.chain][0] : undefined },
            { id: 'strands', label: 'Number of strands', kind: 'choice', options: [1, 2, 3, 4, 5, 6, 8], default: 1 },
            { id: 'K2', symbol: 'K_2', label: 'Multiple-strand factor', unit: '', kind: 'lookup', fig: 'table17-23', auto: v => K2[v.strands] },
            { id: 'H1', symbol: 'H_1', label: 'Link-plate limited power (17 T)', unit: 'hp', kind: 'calc', compute: H1 },
            { id: 'H2', symbol: 'H_2', label: 'Roller-impact limited power (17 T)', unit: 'hp', kind: 'calc', compute: H2 },
            { id: 'Htab', symbol: 'H_{tab}', label: 'Tabulated rating (Table 17-20)', unit: 'hp', kind: 'lookup', fig: 'table17-20a', auto: v => { const a = H1(v), b = H2(v); return (a !== undefined && b !== undefined) ? Math.min(a, b) : undefined; } },
            { id: 'K1', symbol: 'K_1', label: 'Tooth correction factor', unit: '', kind: 'lookup', fig: 'table17-22', auto: v => { const a = H1(v), b = H2(v); return (H.has(v, 'N1') && a !== undefined && b !== undefined) ? Math.pow(v.N1 / 17, a <= b ? 1.08 : 1.5) : undefined; } },
            { id: 'Ha', symbol: 'H_a', label: 'Allowable power', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'K1', 'K2', 'Htab') ? v.K1 * v.K2 * v.Htab : undefined,
              work: v => H.has(v, 'Ha') ? '\\(H_a = K_1K_2H_{tab} = ' + H.fmt(v.K1, 3) + '(' + H.fmt(v.K2) + ')(' + H.fmt(v.Htab) + ') = ' + H.fmt(v.Ha) + '\\ \\text{hp}\\)' : null },
            { id: 'Htreq', symbol: 'H_{tab,req}', label: 'Required table rating = Hd/(K1 K2)', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'Hd', 'K1', 'K2') ? v.Hd / (v.K1 * v.K2) : undefined,
              work: v => H.has(v, 'Htreq') ? '\\(H_{tab,req} = \\frac{n_dK_sH_{nom}}{K_1K_2} = \\frac{' + H.fmt(v.Hd) + '}{' + H.fmt(v.K1, 3) + '(' + H.fmt(v.K2) + ')} = ' + H.fmt(v.Htreq) + '\\ \\text{hp}\\)' : null },
            { id: 'lub', label: 'Lubrication type (zone in Table 17-20)', kind: 'choice', type: 'text', options: ['A — manual or drip', 'B — bath or disk', 'C — oil stream', "C′ — galling region (consult manufacturer)"] },
          ],
          after: v => H.has(v, 'Ha', 'Hd') ? (v.Ha >= v.Hd ? '<span class="result-ok">Capacity OK</span> — H<sub>a</sub> = ' + H.fmt(v.Ha) + ' hp ≥ H<sub>d</sub> = ' + H.fmt(v.Hd) + ' hp' : '<span class="result-bad">Insufficient</span> — H<sub>a</sub> = ' + H.fmt(v.Ha) + ' hp &lt; H<sub>d</sub> = ' + H.fmt(v.Hd) + ' hp: choose a larger chain or more strands') : '' },
        { id: 'life', title: 'Equation check at the actual N1 and life correction (course Tutorial 1)', eq: '17-32, 17-33, 17-39',
          formula: "H_1 = 0.004 N_1^{1.08} n_1^{0.9} p^{(3-0.07p)},\\quad H_2 = \\frac{1000 K_r N_1^{1.5} p^{0.8}}{n_1^{1.5}},\\quad H_2' = H_2\\left(\\frac{L/p}{100}\\right)^{0.4}\\left(\\frac{15\\,000}{h}\\right)^{0.4},\\quad H = K_2\\min(H_1, H_2')",
          text: 'The course evaluates Eqs. 17-32/17-33 directly at the actual tooth count (Tutorial 1: 21 T → H₁ 12.84, H₂ 10.5 hp per strand, roller limit governs) and then applies the full-life correction Eq. 17-39 for the required hours h and the chain length in pitches, with K<sub>r</sub> = 17 ("not indicated in Shigley text"). h = 15 000 h is the rating-table basis (course: 15 000 h or 8×10⁶ cycles, whichever first).',
          vars: [
            { id: 'Lh', symbol: 'h', label: 'Required chain life', unit: 'h', kind: 'input', default: 15000, hint: 'rating basis 15 000 h' },
            { id: 'H1N', symbol: 'H_1(N_1)', label: 'Link-plate limit at actual N1 (per strand)', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'N1', 'n1', 'p') ? (v.chain === 41 ? 0.0022 : 0.004) * v.N1 ** 1.08 * v.n1 ** 0.9 * v.p ** (3 - 0.07 * v.p) : undefined },
            { id: 'H2N', symbol: 'H_2(N_1)', label: 'Roller-impact limit at actual N1 (per strand)', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'N1', 'n1', 'p') ? 1000 * Kr(v.chain) * v.N1 ** 1.5 * v.p ** 0.8 / v.n1 ** 1.5 : undefined },
            { id: 'H2L', symbol: "H_2'", label: 'Roller limit corrected for life and length (Eq. 17-39)', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'H2N', 'Lp', 'Lh') ? v.H2N * (v.Lp / 100) ** 0.4 * (15000 / v.Lh) ** 0.4 : undefined,
              work: v => H.has(v, 'H2L') ? "\\(H_2' = " + H.fmt(v.H2N) + '\\left(\\frac{' + H.fmt(v.Lp) + '}{100}\\right)^{0.4}\\left(\\frac{15\\,000}{' + H.fmt(v.Lh) + '}\\right)^{0.4} = ' + H.fmt(v.H2L) + '\\ \\text{hp}\\)' : null },
            { id: 'HaN', symbol: 'H_{a,eq}', label: 'Allowable power from the equations, all strands', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'H1N', 'H2L', 'K2') ? v.K2 * Math.min(v.H1N, v.H2L) : undefined,
              work: v => H.has(v, 'HaN') ? '\\(H = ' + H.fmt(v.K2) + '\\min(' + H.fmt(v.H1N) + ',\\ ' + H.fmt(v.H2L) + ') = ' + H.fmt(v.HaN) + '\\ \\text{hp}\\quad(' + (v.H1N <= v.H2L ? 'link-plate' : 'roller-bushing') + '\\ \\text{governs})\\)' : null },
          ] },
      ] },

      { title: 'Geometry', steps: [
        { id: 'pd', title: 'Pitch diameters and chain velocity', fig: ['fig17-17', 'fig17-18'], eq: '17-29, 17-30, 17-31',
          formula: 'D = \\frac{p}{\\sin(180^\\circ/N)},\\qquad V = \\frac{N p n}{12},\\qquad \\frac{\\Delta V}{V} = \\frac{\\pi}{N}\\left[\\frac{1}{\\sin(180^\\circ/N)} - \\frac{1}{\\tan(180^\\circ/N)}\\right]',
          vars: [
            { id: 'D1', symbol: 'D_1', label: 'Driving sprocket pitch diameter', unit: 'in', kind: 'calc', compute: v => H.has(v, 'p', 'N1') ? v.p / Math.sin(Math.PI / v.N1) : undefined,
              work: v => H.has(v, 'D1') ? '\\(D_1 = \\frac{' + H.fmt(v.p) + '}{\\sin(180^\\circ/' + v.N1 + ')} = ' + H.fmt(v.D1) + '\\ \\text{in}\\)' : null },
            { id: 'D2', symbol: 'D_2', label: 'Driven sprocket pitch diameter', unit: 'in', kind: 'calc', compute: v => H.has(v, 'p', 'N2') ? v.p / Math.sin(Math.PI / v.N2) : undefined },
            { id: 'V', symbol: 'V', label: 'Chain velocity', unit: 'ft/min', kind: 'calc', compute: v => H.has(v, 'N1', 'p', 'n1') ? v.N1 * v.p * v.n1 / 12 : undefined, check: v => (H.has(v, 'V') && v.V > 9000) ? 'Course: V must not exceed 9000 ft/min' : null },
            { id: 'dV', symbol: '\\Delta V/V', label: 'Chordal speed variation', unit: '%', kind: 'calc', digits: 3, compute: v => H.has(v, 'N1') ? 100 * Math.PI / v.N1 * (1 / Math.sin(Math.PI / v.N1) - 1 / Math.tan(Math.PI / v.N1)) : undefined },
          ] },
        { id: 'len', title: 'Chain length and centre distance', fig: ['fig7-4'], eq: '17-34, 17-35, 17-36',
          formula: '\\frac{L}{p} \\approx \\frac{2C}{p} + \\frac{N_1+N_2}{2} + \\frac{(N_2-N_1)^2}{4\\pi^2 C/p},\\qquad A = \\frac{N_1+N_2}{2} - \\frac{L}{p},\\qquad C = \\frac{p}{4}\\left[-A + \\sqrt{A^2 - 8\\left(\\frac{N_2-N_1}{2\\pi}\\right)^2}\\right]',
          text: 'Course: trial C/p of 30–50 pitches (40 typical; Example 17-5 used a short drive C/p = 25) and C ≥ 150 % of the large sprocket diameter. Round the chain length to an EVEN number of pitches to avoid an offset link (Tutorial 1 Q2 kept 135 — override the auto if the question does), then recompute C.',
          vars: [
            { id: 'Cp', symbol: 'C/p', label: 'Trial centre distance', unit: 'pitches', kind: 'input', default: 40, check: v => (H.has(v, 'Cp') && (v.Cp < 30 || v.Cp > 50)) ? 'Course: 30–50 pitches recommended' : null },
            { id: 'Lpc', symbol: 'L/p', label: 'Chain length (computed)', unit: 'pitches', kind: 'calc', compute: Lpc,
              work: v => H.has(v, 'Lpc') ? '\\(L/p = 2(' + H.fmt(v.Cp) + ') + \\frac{' + v.N1 + '+' + v.N2 + '}{2} + \\frac{(' + v.N2 + '-' + v.N1 + ')^2}{4\\pi^2(' + H.fmt(v.Cp) + ')} = ' + H.fmt(v.Lpc) + '\\ \\text{pitches}\\)' : null },
            { id: 'Lp', symbol: 'L/p', label: 'Chain length used (even integer)', unit: 'pitches', kind: 'input', auto: v => { const l = Lpc(v); return l !== undefined ? 2 * Math.round(l / 2) : undefined; }, hint: 'auto = nearest even integer; override if desired' },
            { id: 'Lin', symbol: 'L', label: 'Chain length', unit: 'in', kind: 'calc', compute: v => H.has(v, 'Lp', 'p') ? v.Lp * v.p : undefined },
            { id: 'A', symbol: 'A', label: 'A = (N1 + N2)/2 − L/p', unit: '', kind: 'calc', compute: v => H.has(v, 'Lp', 'N1', 'N2') ? (v.N1 + v.N2) / 2 - v.Lp : undefined },
            { id: 'Cpa', symbol: 'C/p', label: 'Actual centre distance', unit: 'pitches', kind: 'calc', compute: v => { if (!H.has(v, 'A', 'N1', 'N2')) return undefined; const r = v.A * v.A - 8 * ((v.N2 - v.N1) / (2 * Math.PI)) ** 2; return r >= 0 ? 0.25 * (-v.A + Math.sqrt(r)) : undefined; },
              work: v => H.has(v, 'Cpa') ? '\\(C = \\frac{p}{4}\\left[' + H.fmt(-v.A) + ' + \\sqrt{' + H.fmt(v.A) + '^2 - 8\\left(\\frac{' + v.N2 + '-' + v.N1 + '}{2\\pi}\\right)^2}\\right] = ' + H.fmt(v.Cpa) + 'p\\)' : null },
            { id: 'C', symbol: 'C', label: 'Actual centre distance', unit: 'in', kind: 'calc', compute: v => H.has(v, 'Cpa', 'p') ? v.Cpa * v.p : undefined,
              work: v => H.has(v, 'C') ? '\\(C = ' + H.fmt(v.Cpa) + '(' + H.fmt(v.p) + ') = ' + H.fmt(v.C) + '\\ \\text{in}\\)' : null,
              check: v => (H.has(v, 'C', 'D2') && v.C < 1.5 * v.D2) ? 'Course: CD should be ≥ 150 % of the large sprocket diameter' : null },
          ] },
        { id: 'wrap', title: 'Angle of wrap (Mott Eqs. 7-21/7-22, as in both bibles)', fig: ['fig7-4'],
          formula: '\\theta_1 = 180^\\circ - 2\\sin^{-1}\\frac{D_2 - D_1}{2C},\\qquad \\theta_2 = 180^\\circ + 2\\sin^{-1}\\frac{D_2 - D_1}{2C}',
          vars: [
            { id: 'th1', symbol: '\\theta_1', label: 'Wrap on small sprocket', unit: '°', kind: 'calc', compute: v => H.has(v, 'D1', 'D2', 'C') ? 180 - 2 * H.deg(Math.asin((v.D2 - v.D1) / (2 * v.C))) : undefined,
              check: v => (H.has(v, 'th1') && v.th1 < 120) ? 'θ1 < 120° — increase centre distance' : null },
            { id: 'th2', symbol: '\\theta_2', label: 'Wrap on large sprocket', unit: '°', kind: 'calc', compute: v => H.has(v, 'th1') ? 360 - v.th1 : undefined },
          ] },
      ] },

      { title: 'Result', steps: [
        { id: 'res', title: 'Factor of safety and summary', formula: 'n_{fs} = \\frac{H_a}{H_d}\\quad(\\text{Fizz: } FS = P_{allowed}/P_{des})',
          vars: [
            { id: 'nfs', symbol: 'H_a/H_d', label: 'Capacity ratio', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'Ha', 'Hd') ? v.Ha / v.Hd : undefined },
            { id: 'Hx', symbol: 'H', label: 'Power used for torque/tension (Hd, else Ha)', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'Hd') ? v.Hd : (H.has(v, 'Ha') ? v.Ha : undefined), hint: 'Tutorial 1 Q2 (analysis, no Hnom) uses Ha' },
            { id: 'T1', symbol: 'T', label: 'Torque on the small sprocket', unit: 'lbf·in', kind: 'calc', compute: v => H.has(v, 'Hx', 'n1') ? 63025 * v.Hx / v.n1 : undefined,
              work: v => H.has(v, 'T1') ? '\\(T = 63\\,025(' + H.fmt(v.Hx) + ')/' + H.fmt(v.n1) + ' = ' + H.fmt(v.T1) + '\\ \\text{lbf·in} = ' + H.fmt(v.T1 / 12) + '\\ \\text{lbf·ft}\\)' : null },
            { id: 'Ft', symbol: 'F', label: 'Chain tension (tight side) = 2T/D1', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'T1', 'D1') ? 2 * v.T1 / v.D1 : undefined,
              work: v => H.has(v, 'Ft') ? '\\(F = 2T/D_1 = 2(' + H.fmt(v.T1) + ')/' + H.fmt(v.D1) + ' = ' + H.fmt(v.Ft) + '\\ \\text{lbf}\\)' : null },
            { id: 'nten', symbol: 'n_{tensile}', label: 'Min tensile strength / tension', unit: '', kind: 'calc', digits: 3, compute: v => (H.has(v, 'Ft') && CHAIN[v.chain]) ? CHAIN[v.chain][1] * (v.strands || 1) / v.Ft : undefined, hint: 'course (HW1 P5): tensile strength ≥ 10 × working load for lifting; Renold: ≥ 8 on breaking load', fig: 'renold-sf',
              check: v => (H.has(v, 'nten') && v.nten < 8) ? 'Below the Renold nominal safety factor of 8 (10 × for load-carrying chain)' : null },
          ],
          after: v => {
            if (!H.has(v, 'Ha', 'Hd')) return '';
            const ok = v.Ha >= v.Hd && (!H.has(v, 'th1') || v.th1 >= 120);
            return (ok ? '<span class="result-ok">PASS</span>' : '<span class="result-bad">FAIL</span>') + ' — ' + (v.strands || 1) + ' strand(s) of No. ' + (v.chain || '?') + ' chain (p = ' + H.fmt(v.p) + ' in), N₁ = ' + v.N1 + ', N₂ = ' + v.N2 + ', L = ' + H.fmt(v.Lp) + ' pitches = ' + H.fmt(v.Lin) + ' in, C = ' + H.fmt(v.C) + ' in; H<sub>a</sub> = ' + H.fmt(v.Ha) + ' hp vs H<sub>d</sub> = ' + H.fmt(v.Hd) + ' hp' + (v.lub ? '; lubrication type ' + v.lub.split(' ')[0] : '') + '. Durability basis: 15 000 h, 100 pitches, recommended lubrication.';
          } },
      ] },
    ],
  };
})();
