// Roller chain — Shigley Ch. 17-5 (merged Fizz §1.6 + Mech §8.3.4; Example 17-5)
// Course alignment (v2/COURSE_CONVENTIONS.md §0, §4): "Flexible belts Intro and Chains" slides 12–34, Tutorial 1, HW1 P5–P7. Defaults:
// Ks 1.3 (moderate shock, electric motor — Martin Table II / Mott 7-17; HW1 P7 used 1.5 for a 2-cyl engine outdoors), nd = 1.0, N1 = 17
// (avoid fewer), ratio ≤ 7:1, K2 strand factors 1.7/2.5/3.3/3.9/4.6, Kr = 17 for No. 40–240 (29 for 25/35, 3.4 for 41), rating basis
// 15 000 h / 17 T / 100 pitches, CD 30–50 pitches and ≥ 150 % of the large sprocket, V ≤ 9000 ft/min, even number of pitches,
// wrap > 120°, life correction Eq. 17-39 with Kr = 17 ("not indicated in Shigley text", Module 1 p9).
// Verified against: Tutorial 1 Q2 (S 17-26, Module 1 p7–10): No. 40-4, N1 21 @ 2000 rpm, N2 84, C/p 40 → L/p 135 (kept odd by the
//   solution; auto rounds to 136), L 67.5 in, Htab 7.72 (auto 7.72 from Table 17-20), K1 1.37, K2 3.3, Ha 34.9; H1(21 T) 12.84 → ×3.3 = 42.4;
//   H2(21 T) 10.5 → 34.7 (roller governs); 20 000 h, 135 pitches: H2 10.56 → 34.8 hp; T 91.4 lbf·ft, D1 3.355 in, tension 654 lbf.
// Verified against: HW1 P7 (S 17-27): 25 hp @ 700 rpm → 140 rpm, No. 80, Ks 1.5, nd 1 → Hd 37.5; N1 17 (K1 = 1), N2 85 (solution used
//   84 — now the N2 auto, 85 is not stocked for No. 80 in Table 17-21); Htab 31.0 hp (Table 17-20), K2 1.7 → Ha 52.7 ≥ 37.5 → 2 strands, 141.7 rpm.
// Guide assumptions (review pass): `assumptions` lists Fizz §1.6 / Mech §8.3.4 rules; chain default No. 60 (Mech p.34), N1 = 17 (Mech p.36),
//   Ks figure now Mott Table 7-17 (the table both guides use for chains).
// SIZING (v2/SIZING_BRIEF.md): data + pick rules live in chains_common.js (loaded first by chains_shigley.html). Selection tables with Use
//   buttons: sprocket teeth N1 / N2 (Inputs), chain × strands and every chain number (Chain selection), even chain lengths (Geometry), chain in
//   tension. chain / strands / Htab / K1 / N2 / Lp are yellow lookups whose auto = the ★ pick (Htab now = Table 17-20 interpolated, not Eq. 17-32/33).
// Picks verified (Playwright, rating source = Shigley Table 17-20, rule = smallest pitch first):
//   Shigley Ex 17-5: 90 hp × 1.3 × 1.5 = 175.5 hp @ 300 rpm, 17/34 T, C/p 25 → strands table 1: No. 200 (C′, rejected), 2: No. 160 (105 hp),
//     3: No. 140 (72.4 hp, B), 4: No. 140 → ★ 3 × No. 140 = Shigley's decision; L 75.79 → 76 ★, C 25.104p = 43.93 in. (Shigley labels the
//     2-strand No. 160 "C"; the dashed line of Table 17-20 puts 300 rpm in Type B — the table shows B.)
//   HW1 P7: chain No. 80 given → strands auto 2 (31.0 × 1.7 = 52.7 ≥ 37.5) = course; N1 table ★ 17, N2 table ★ 85 (course took 84, listed).
//   Tutorial 1 Q2 (analysis, chain 40-4 given): Htab auto 7.72 (Table 17-20 @ 2000 rpm) = course, K1 1.373 → Ha 34.98 hp.
// Polish pass (past exams): Midterm 2021 P1 [Shigley]: 6.5 hp, No. 50, 17/40 T @ 700 rpm → Htab 7.73 (solution's 7.33 is a copy slip —
//   its nfs 1.19 uses 7.73), Type B, CD 30 in = 48 p → L 124.8 → 124 links — matches.
// Midterm 2024 P1 [Shigley]: 15 hp @ 1150, 18/46 T, CD 36 in → No. 50 × 2: Htab 12.13 (sol 12.1), K1 1.064, K2 1.7 → Ha 21.9 (21.8), nfs 1.46 (1.45);
//   No. 60 × 1: Htab 20.78, Ha 22.1, nfs 1.47 — matches; L 147.5 → 148 (solution took odd 147 — slip).
(function () {
  // Table 17-19: ANSI chain number → [pitch in, min tensile strength lbf, weight lbf/ft]
  const C = window.CHAINS;
  const CHAIN = C.T17_19;
  const K2 = { 1: 1.0, 2: 1.7, 3: 2.5, 4: 3.3, 5: 3.9, 6: 4.6, 8: 6.0 };
  const Kr = no => (no === 25 || no === 35) ? 29 : (no === 41 ? 3.4 : 17);
  // helpers that fall back to the table / rounding so that auto-lookups do not depend on other autos (engine runs autos once)
  const pv = v => H.has(v, 'p') ? v.p : (CHAIN[v.chain] ? CHAIN[v.chain][0] : undefined);
  const N2v = v => H.has(v, 'N2') ? v.N2 : (H.has(v, 'N1', 'n1', 'n2') ? Math.round(v.N1 * v.n1 / v.n2) : undefined);
  const H1 = v => { const p = pv(v); return (H.has(v, 'n1') && p !== undefined) ? (v.chain === 41 ? 0.0022 : 0.004) * 17 ** 1.08 * v.n1 ** 0.9 * p ** (3 - 0.07 * p) : undefined; };
  const H2 = v => { const p = pv(v); return (H.has(v, 'n1') && p !== undefined) ? 1000 * Kr(v.chain) * 17 ** 1.5 * p ** 0.8 / v.n1 ** 1.5 : undefined; };
  // selection context for chains_common.js tables / picks
  const opt = v => ({ src: v.rsrc || 'shig', rule: v.selrule || 'pitch', P: v.Hd, N1: v.N1, n1: v.n1, n2: v.n2, VR: v.VR, chain: v.chain, strands: v.strands,
    sList: [1, 2, 3, 4], fac: K2, sym: 'H_d', clear: { Htab: '', K1: '' }, N2id: 'N2' });
  const TSmin = {}; Object.keys(CHAIN).forEach(k => { TSmin[k] = CHAIN[k][1]; });
  const tensPick = v => H.has(v, 'Fw') ? C.ORDER.find(no => CHAIN[no][1] >= 10 * v.Fw) : undefined;
  const Lpc = v => { const N2 = N2v(v); return (H.has(v, 'Cp', 'N1') && N2 !== undefined) ? 2 * v.Cp + (v.N1 + N2) / 2 + (N2 - v.N1) ** 2 / (4 * Math.PI * Math.PI * v.Cp) : undefined; };

  window.TOPIC = {
    id: 'chains', book: 'shigley',
    title: 'Roller Chain — Selection & Geometry',
    subtitle: 'Shigley Ch. 17-5 (Tables 17-19 … 17-23, Eqs. 17-29 … 17-38) · merged Fizz §1.6 + Mech §8.3.4',
    sibling: 'chains_mott.html',
    intro: 'Shigley roller-chain method (Ex 17-5): H_d = H_nom K_s n_d → H_tab (Table 17-20, 17 T) × K_1 × K_2 = H_a ≥ H_d → pitch diameters → length in pitches (even) → C → wrap. Every table is built in; ★ rows are the rule picks, <b>Use</b> fills the field.',
    example: { Hnom: 25, n1: 700, n2: 140, Ks: 1.5, nd: 1, N1: 17, chain: 80, Cp: 40, Lh: 15000 },
    assumptions: [
      { text: 'Chain number: first digit(s) × 1/8 in = pitch (No. 40 = 1/2 in); chains fail by wear — lubrication type comes from the rating table', src: 'Chains s14, s22 · RAP quiz', general: true },
      { text: 'Pre-extreme horsepower = link-plate fatigue limit (Eq 17-32); post-extreme = roller/bushing impact fatigue (Eq 17-33)', src: 'Chains s19 · midterms 2021–2024 MC', general: true },
      { text: 'K_s = 1.3 (moderate shock, electric motor; Mott Table 7-17 / Martin); n_d = 1.0 unless stated', src: 'Fizz p.27 · Mech p.34 · Chains s26', var: 'Ks' },
      { text: 'Output speed range → midpoint for VR', src: 'Fizz p.28 · Mech p.34', var: 'n2' },
      { text: 'N_1 = 17 so K_1 = 1; never fewer than 17 above 100 rpm, odd preferred; N_2 stocked (Table 17-21), ≤ 120', src: 'Mech p.36 · Fizz p.28 · HW1 P7', var: 'N1' },
      { text: 'Chain: smallest pitch first, then fewest strands (Ex 17-5: 3 × No. 140); "fewest strands first" available — midterm 2024 gives 2 × No. 50 or 1 × No. 60', src: 'Shigley Ex 17-5 · Mech p.34', var: 'selrule' },
      { text: 'K_2 = 1.7 / 2.5 / 3.3 / 3.9 / 4.6 for 2–6 strands (Table 17-23)', src: 'Fizz p.28 · Mech p.36', var: 'strands' },
      { text: 'H_tab from Table 17-20, linear in rpm; Mott Tables 7-14/15/16 or the Renold pages selectable', src: 'Fizz p.28 · Chains s20, s25', var: 'Htab' },
      { text: 'Trial C/p = 40 pitches (30–50); a CD given in inches is divided by p (midterms 2021: 30 in, 2024: 36 in)', src: 'Fizz p.30 · Mech p.35 · Chains s28', var: 'Cp', value: 40 },
      { text: 'Chain length: nearest EVEN number of pitches; next even if C drops below 30 pitches', src: 'Mech p.35 · Shigley Ex 17-5', var: 'Lp' },
      { text: 'Wrap ≥ 120°; V ≤ 9000 ft/min; C ≥ 1.5 × large-sprocket diameter', src: 'Fizz p.31 · Chains s24, s27', step: 'wrap' },
      { text: 'Rating basis 15 000 h, 17 T, 100 pitches; Eq 17-39 life correction with K_r = 17', src: 'Chains s24 · Module 1 p9', var: 'Lh' },
      { text: 'Chain in tension: strength ≥ 10 × working load', src: 'Fizz p.27 · HW1 P5', step: 'tens' },
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
      { id: 'renold-sf', ref: 'Renold safety factors (slide 33)', book: 'course', title: 'Renold nominal safety factor on breaking load vs cycles and application', src: 'figures/course/chain_renold_safety_factors.png', note: '5.0 (10^{6} cycles) / 6.0 (2×10^{6}) dynamic ≤ working load; 8.0 (8×10^{6}, occasional 20 % overload); 10 passenger lifts; 12 harsh environments.' },
      { id: 'renold-nd', ref: 'Renold design-factor multipliers (slide 34)', book: 'course', title: 'Renold nd multipliers: lubrication × cleanliness and temperature × load', src: 'figures/course/chain_renold_design_factor_multipliers.png', note: 'Regular lube 1.00/1.25/1.50 (clean / moderately clean / dirty); occasional 1.25/1.50/1.75; none 1.50/1.50/1.75. +10…150 °C 1.00/1.34/1.88 (smooth/moderate/heavy); 0…10 °C 1.25/1.88/2.38; −20…0 °C 1.50/2.50/3.13; −40…−20 °C 1.88/3.13/4.13.' },
      { id: 'rj25', ref: 'Renold ANSI No. 25 (p.1)', book: 'course', title: 'Renold ANSI No. 25: dimensions, tensile and working loads (1–6 strands), hp rating (teeth × rpm, lube A/B/C)', src: 'figures/course/renold_ansi_chain_no25_dims_hp_rating.png', note: 'Renold catalogue p.1. Rating = table hp × strand factor (1.7, 2.5, 3.3, 3.9, 4.6 for 2–6).' },
      { id: 'rj35', ref: 'Renold ANSI No. 35 (p.2)', book: 'course', title: 'Renold ANSI No. 35: dimensions, tensile and working loads (1–6 strands), hp rating (teeth × rpm, lube A/B/C)', src: 'figures/course/renold_ansi_chain_no35_dims_hp_rating.png', note: 'Renold catalogue p.2. Rating = table hp × strand factor (1.7, 2.5, 3.3, 3.9, 4.6 for 2–6).' },
      { id: 'rj40', ref: 'Renold ANSI No. 40 (p.3)', book: 'course', title: 'Renold ANSI No. 40: dimensions, tensile and working loads (1–6 strands), hp rating (teeth × rpm, lube A/B/C)', src: 'figures/course/renold_ansi_chain_no40_dims_hp_rating.png', note: 'Renold catalogue p.3. Rating = table hp × strand factor (1.7, 2.5, 3.3, 3.9, 4.6 for 2–6).' },
      { id: 'rj41', ref: 'Renold ANSI No. 41 (p.4)', book: 'course', title: 'Renold ANSI No. 41: dimensions, tensile and working loads (1–6 strands), hp rating (teeth × rpm, lube A/B/C)', src: 'figures/course/renold_ansi_chain_no41_dims_hp_rating.png', note: 'Renold catalogue p.4. Rating = table hp × strand factor (1.7, 2.5, 3.3, 3.9, 4.6 for 2–6).' },
      { id: 'rj50', ref: 'Renold ANSI No. 50 (p.5)', book: 'course', title: 'Renold ANSI No. 50: dimensions, tensile and working loads (1–6 strands), hp rating (teeth × rpm, lube A/B/C)', src: 'figures/course/renold_ansi_chain_no50_dims_hp_rating.png', note: 'Renold catalogue p.5. Rating = table hp × strand factor (1.7, 2.5, 3.3, 3.9, 4.6 for 2–6).' },
      { id: 'rj60', ref: 'Renold ANSI No. 60 (p.6)', book: 'course', title: 'Renold ANSI No. 60: dimensions, tensile and working loads (1–6 strands), hp rating (teeth × rpm, lube A/B/C)', src: 'figures/course/renold_ansi_chain_no60_dims_hp_rating.png', note: 'Renold catalogue p.6. Rating = table hp × strand factor (1.7, 2.5, 3.3, 3.9, 4.6 for 2–6).' },
      { id: 'rj80', ref: 'Renold ANSI No. 80 (p.7)', book: 'course', title: 'Renold ANSI No. 80: dimensions, tensile and working loads (1–6 strands), hp rating (teeth × rpm, lube A/B/C)', src: 'figures/course/renold_ansi_chain_no80_dims_hp_rating.png', note: 'Renold catalogue p.7. Rating = table hp × strand factor (1.7, 2.5, 3.3, 3.9, 4.6 for 2–6).' },
      { id: 'rj100', ref: 'Renold ANSI No. 100 (p.8)', book: 'course', title: 'Renold ANSI No. 100: dimensions, tensile and working loads (1–6 strands), hp rating (teeth × rpm, lube A/B/C)', src: 'figures/course/renold_ansi_chain_no100_dims_hp_rating.png', note: 'Renold catalogue p.8. Rating = table hp × strand factor (1.7, 2.5, 3.3, 3.9, 4.6 for 2–6).' },
      { id: 'rj120', ref: 'Renold ANSI No. 120 (p.9)', book: 'course', title: 'Renold ANSI No. 120: dimensions, tensile and working loads (1–6 strands), hp rating (teeth × rpm, lube A/B/C)', src: 'figures/course/renold_ansi_chain_no120_dims_hp_rating.png', note: 'Renold catalogue p.9. Rating = table hp × strand factor (1.7, 2.5, 3.3, 3.9, 4.6 for 2–6).' },
      { id: 'rj140', ref: 'Renold ANSI No. 140 (p.10)', book: 'course', title: 'Renold ANSI No. 140: dimensions, tensile and working loads (1–6 strands), hp rating (teeth × rpm, lube A/B/C)', src: 'figures/course/renold_ansi_chain_no140_dims_hp_rating.png', note: 'Renold catalogue p.10. Rating = table hp × strand factor (1.7, 2.5, 3.3, 3.9, 4.6 for 2–6).' },
      { id: 'rj160', ref: 'Renold ANSI No. 160 (p.11)', book: 'course', title: 'Renold ANSI No. 160: dimensions, tensile and working loads (1–6 strands), hp rating (teeth × rpm, lube A/B/C)', src: 'figures/course/renold_ansi_chain_no160_dims_hp_rating.png', note: 'Renold catalogue p.11. Rating = table hp × strand factor (1.7, 2.5, 3.3, 3.9, 4.6 for 2–6).' },
      { id: 'rj180', ref: 'Renold ANSI No. 180 (p.12)', book: 'course', title: 'Renold ANSI No. 180: dimensions, tensile and working loads (1–6 strands), hp rating (teeth × rpm, lube A/B/C)', src: 'figures/course/renold_ansi_chain_no180_dims_hp_rating.png', note: 'Renold catalogue p.12. Rating = table hp × strand factor (1.7, 2.5, 3.3, 3.9, 4.6 for 2–6).' },
      { id: 'rj200', ref: 'Renold ANSI No. 200 (p.13)', book: 'course', title: 'Renold ANSI No. 200: dimensions, tensile and working loads (1–6 strands), hp rating (teeth × rpm, lube A/B/C)', src: 'figures/course/renold_ansi_chain_no200_dims_hp_rating.png', note: 'Renold catalogue p.13. Rating = table hp × strand factor (1.7, 2.5, 3.3, 3.9, 4.6 for 2–6).' },
      { id: 'rj240', ref: 'Renold ANSI No. 240 (p.14)', book: 'course', title: 'Renold ANSI No. 240: dimensions, tensile and working loads (1–6 strands), hp rating (teeth × rpm, lube A/B/C)', src: 'figures/course/renold_ansi_chain_no240_dims_hp_rating.png', note: 'Renold catalogue p.14. Rating = table hp × strand factor (1.7, 2.5, 3.3, 3.9, 4.6 for 2–6).' },
      { id: 'tsu-sf', ref: 'Tsubaki service factors (catalogue p.174)', book: 'course', title: 'Tsubaki selection factors: multi-strand factor, service factor Ks (smooth / moderate / large impact × motor or engine), speed factor Kn, teeth factor Kz, shock factor K chart', src: 'figures/course/tsubaki_chain_service_factors.png', note: 'tsubakimoto chains.pdf p.175 (printed 174). Alternative to Mott Table 7-17 / Martin table; design kW = kW × Ks.' },
      { id: 'tsu-graph', ref: 'Tsubaki provisional selection graph (p.175)', book: 'course', title: 'RS roller chain provisional selection graph: design kW vs small-sprocket rpm → chain number (single, double, triple strand)', src: 'figures/course/tsubaki_rs_provisional_selection_graph.png', note: 'tsubakimoto chains.pdf p.176 (printed 175). Tentative selection only: confirm with the rating table.' },
      { id: 'tsu-constr', ref: 'Tsubaki roller chain construction (p.13)', book: 'course', title: 'Roller chain construction: pin, bush, roller, inner/outer plates, connecting and offset links', src: 'figures/course/tsubaki_roller_chain_construction.png', note: 'tsubakimoto chains.pdf p.14 (printed 13); the diagram on Chains slide 12.' },
      { id: 'table7-14', ref: 'Table 7-14', book: 'mott', title: 'Mott horsepower ratings — single-strand No. 40 (teeth × rpm, lubrication zones)', src: 'figures/mott/table7-14.png', page: 300, note: 'Rating source "Mott" in the selection tables (teeth rows replace K1).' },
      { id: 'table7-15', ref: 'Table 7-15', book: 'mott', title: 'Mott horsepower ratings — single-strand No. 60', src: 'figures/mott/table7-15.png', page: 301 },
      { id: 'table7-16', ref: 'Table 7-16', book: 'mott', title: 'Mott horsepower ratings — single-strand No. 80', src: 'figures/mott/table7-16.png', page: 302 },
      { id: 'fig7-4', ref: 'Figure 7-4', book: 'mott', title: 'Belt/chain configuration — wrap angle geometry (Mott)', src: 'figures/mott/fig7-4.png', page: 265 },
    ],

    sections: [
      { title: 'Inputs', steps: [
        { id: 'in', title: 'Problem data and design power', fig: ['table7-17', 'table17-15', 'martin-sf', 'renold-nd', 'tsu-sf'], eq: '17-38', formula: 'H_d = H_{nom} K_s n_d,\\qquad VR = \\frac{n_1}{n_2}',
          text: 'Always multiply the nominal power by K_s first (Mott Table 7-17, Shigley Table 17-15 or Martin). Output-speed range → midpoint.',
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
          text: '<b>Rule:</b> N_1 = smallest odd count ≥ 17 that carries H_d (17 gives K_1 = 1); N_2 = N_1·VR rounded to a stocked count, ≤ 120. More teeth → less chordal speed variation.',
          vars: [
            { id: 'N1', symbol: 'N_1', label: 'Driving sprocket teeth', unit: '', kind: 'input', default: 17, hint: 'Mech: use 17 so K1 = 1; never fewer than 17 above 100 rpm', check: v => (H.has(v, 'N1') && v.N1 < 17 && !(H.has(v, 'n1') && v.n1 < 100)) ? 'Fewer than 17 teeth above 100 rpm (Fizz p.28; Martin minimum recommended)' : null },
            { id: 'N2', symbol: 'N_2', label: 'Driven sprocket teeth', unit: '', kind: 'lookup', fig: 'table17-21', auto: v => C.n2pick(v.N1, v.VR, v.chain), hint: 'auto = ★ of the N2 table: N1·VR rounded to the nearest integer stocked in Table 17-21 (Fizz: nearest; Mech rounds up)',
              check: v => (H.has(v, 'N2') && v.N2 > 120) ? 'N2 > 120 teeth: not made in standard sizes' : null },
            { id: 'VRa', symbol: 'VR_{act}', label: 'Actual ratio N2/N1', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'N1', 'N2') ? v.N2 / v.N1 : undefined },
            { id: 'n2a', symbol: 'n_{2,act}', label: 'Actual output speed', unit: 'rpm', kind: 'calc', compute: v => H.has(v, 'n1', 'VRa') ? v.n1 / v.VRa : undefined },
          ],
          after: v => C.teethTable(opt(v)) + C.n2Table(opt(v)) },
      ] },

      { title: 'Chain selection & capacity', steps: [
        { id: 'chain', title: 'Select the chain: number, strands and corrected rating', fig: ['table17-19', 'table17-20a', 'table17-20b', 'table17-22', 'table17-23', 'table7-14', 'table7-15', 'table7-16', 'renold-hp', 'renold-limit', 'ansi50', 'rj40', 'rj50', 'rj60', 'rj80', 'rj100', 'tsu-graph', 'tsu-constr'], eq: '17-32, 17-33, 17-37',
          formula: 'H_1 = 0.004 N_1^{1.08} n_1^{0.9} p^{(3 - 0.07p)},\\quad H_2 = \\frac{1000 K_r N_1^{1.5} p^{0.8}}{n_1^{1.5}},\\quad H_{tab}\\ \\text{from Table 17-20 at } n_1,\\quad H_a = K_1 K_2 H_{tab} \\ge H_d',
          text: '<b>Rule</b> (Ex 17-5): tabulate strands → required \\(H_{tab} = H_d/(K_1K_2)\\) → smallest Table 17-20 chain, reject region C′, take the smallest pitch. K_1 uses 1.08 when the link-plate limit H_1 governs, 1.5 when the roller limit H_2 governs.',
          vars: [
            { id: 'rsrc', label: 'Rating source', kind: 'choice', type: 'text', allowBlank: false, default: 'shig', options: [{ label: 'Shigley Table 17-20 (17 T) × K_1', value: 'shig' }, { label: 'Mott Tables 7-14/15/16 (No. 40/60/80, teeth × rpm)', value: 'mott' }, { label: 'Renold ANSI catalogue pages — all numbers (course s20)', value: 'renold' }] },
            { id: 'selrule', label: 'Selection rule', kind: 'choice', type: 'text', allowBlank: false, default: 'pitch', options: [{ label: 'Smallest pitch first, then fewest strands (Shigley Ex. 17-5)', value: 'pitch' }, { label: 'Fewest strands first, then smallest chain (Mott Ex. 7-5, Fizz)', value: 'strands' }] },
            { id: 'strands', symbol: '', label: 'Number of strands', unit: '', kind: 'lookup', fig: 'table17-23', auto: v => { const o = opt(v); if (!H.has(v, 'Hd')) return 1; if (H.has(v, 'chain')) return C.fewestStrands(o, v.chain); const k = C.pick(o); return k ? k.strands : undefined; },
              hint: 'auto = ★ pick of the selection table; Table 17-23 has 1–6 (and 8)', check: v => (H.has(v, 'strands') && !K2[v.strands]) ? 'Table 17-23 lists 1–6 and 8 strands' : null },
            { id: 'chain', symbol: '', label: 'ANSI chain number', unit: '', kind: 'lookup', fig: 'table17-19',
              auto: v => { const o = opt(v); if (!H.has(v, 'Hd')) return tensPick(v); if (H.has(v, 'strands')) return C.smallestFor(o, v.strands); const k = C.pick(o); return k ? k.chain : undefined; },
              hint: 'auto = ★ pick; Mech: No. 40 often fails, No. 80 usually overkill', check: v => (H.has(v, 'chain') && !CHAIN[v.chain]) ? 'Not an ANSI chain number (Table 17-19: 25, 35, 40, 41, 50, 60, 80 … 240)' : null },
            { id: 'p', symbol: 'p', label: 'Chain pitch', unit: 'in', kind: 'lookup', fig: 'table17-19', auto: v => CHAIN[v.chain] ? CHAIN[v.chain][0] : undefined },
            { id: 'K2', symbol: 'K_2', label: 'Multiple-strand factor', unit: '', kind: 'lookup', fig: 'table17-23', auto: v => K2[v.strands] },
            { id: 'H1', symbol: 'H_1', label: 'Link-plate limited power (17 T)', unit: 'hp', kind: 'calc', compute: H1 },
            { id: 'H2', symbol: 'H_2', label: 'Roller-impact limited power (17 T)', unit: 'hp', kind: 'calc', compute: H2 },
            { id: 'Htab', symbol: 'H_{tab}', label: 'Tabulated rating at 17 T (Table 17-20)', unit: 'hp', kind: 'lookup', fig: 'table17-20a', auto: v => C.rating(v.rsrc || 'shig', v.chain, 17, v.n1).h17, hint: 'auto = Table 17-20 interpolated on rpm (or the 17-T row of the chosen source)' },
            { id: 'K1', symbol: 'K_1', label: 'Tooth correction factor', unit: '', kind: 'lookup', fig: 'table17-22', auto: v => { if ((v.rsrc || 'shig') !== 'shig') return C.rating(v.rsrc, v.chain, v.N1, v.n1).k1; const a = H1(v), b = H2(v); return (H.has(v, 'N1') && a !== undefined && b !== undefined) ? Math.pow(v.N1 / 17, a <= b ? 1.08 : 1.5) : undefined; },
              hint: 'Table 17-22: (N1/17)^1.08 pre-extreme, ^1.5 post-extreme; Mott/Renold source: rating(N1)/rating(17)' },
            { id: 'Ha', symbol: 'H_a', label: 'Allowable power', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'K1', 'K2', 'Htab') ? v.K1 * v.K2 * v.Htab : undefined,
              work: v => H.has(v, 'Ha') ? '\\(H_a = K_1K_2H_{tab} = ' + H.fmt(v.K1, 3) + '(' + H.fmt(v.K2) + ')(' + H.fmt(v.Htab) + ') = ' + H.fmt(v.Ha) + '\\ \\text{hp}\\)' : null },
            { id: 'Htreq', symbol: 'H_{tab,req}', label: 'Required table rating = Hd/(K1 K2)', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'Hd', 'K1', 'K2') ? v.Hd / (v.K1 * v.K2) : undefined,
              work: v => H.has(v, 'Htreq') ? '\\(H_{tab,req} = \\frac{n_dK_sH_{nom}}{K_1K_2} = \\frac{' + H.fmt(v.Hd) + '}{' + H.fmt(v.K1, 3) + '(' + H.fmt(v.K2) + ')} = ' + H.fmt(v.Htreq) + '\\ \\text{hp}\\)' : null },
            { id: 'lub', symbol: '', label: 'Lubrication type (table zone)', unit: '', kind: 'calc', compute: v => { const r = C.rating(v.rsrc || 'shig', v.chain, v.N1, v.n1); return r.z ? C.LUBE[r.z] : undefined; } },
          ],
          after: v => (H.has(v, 'Ha', 'Hd') ? (v.Ha >= v.Hd ? '<span class="result-ok">Capacity OK</span> — H_{a} = ' + H.fmt(v.Ha) + ' hp ≥ H_{d} = ' + H.fmt(v.Hd) + ' hp' : '<span class="result-bad">Insufficient</span> — H_{a} = ' + H.fmt(v.Ha) + ' hp &lt; H_{d} = ' + H.fmt(v.Hd) + ' hp: choose a larger chain or more strands') : '') + C.strandsTable(opt(v)) + C.chainTable(opt(v)) },
        { id: 'std', title: 'Standard chain sizes', fig: ['table17-19', 'fig17-16', 'ansi50'],
          text: 'Reference: Table 17-19 dimensions and strengths; the chain in use is highlighted.',
          after: v => C.dimsTable(v.chain, 'shigley') },
        { id: 'life', title: 'Equation check at the actual N1 and life correction (course Tutorial 1)', eq: '17-32, 17-33, 17-39',
          formula: "H_1 = 0.004 N_1^{1.08} n_1^{0.9} p^{(3-0.07p)},\\quad H_2 = \\frac{1000 K_r N_1^{1.5} p^{0.8}}{n_1^{1.5}},\\quad H_2' = H_2\\left(\\frac{L/p}{100}\\right)^{0.4}\\left(\\frac{15\\,000}{h}\\right)^{0.4},\\quad H = K_2\\min(H_1, H_2')",
          text: 'Tutorial 1: Eqs 17-32/17-33 at the actual N_1 (21 T → H_1 12.84, H_2 10.5 hp; roller governs), then Eq 17-39 for life h and length L/p with K_r = 17.',
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
          text: 'Start at C/p = 40 (30–50) or the given CD ÷ p; round L/p to the nearest <b>even</b> integer (no offset link), then recompute C.',
          vars: [
            { id: 'Cgin', symbol: 'C_{given}', label: 'Centre distance given in inches (optional)', unit: 'in', kind: 'input', hint: 'midterm 2021: 30 in, 2024: 36 in' },
            { id: 'Cp', symbol: 'C/p', label: 'Trial centre distance', unit: 'pitches', kind: 'input', auto: v => H.has(v, 'Cgin', 'p') ? v.Cgin / v.p : 40, hint: 'auto = 40 pitches, or the given inches ÷ p', check: v => (H.has(v, 'Cp') && (v.Cp < 30 || v.Cp > 50)) ? 'Course: 30–50 pitches recommended' : null },
            { id: 'Lpc', symbol: 'L/p', label: 'Chain length (computed)', unit: 'pitches', kind: 'calc', compute: Lpc,
              work: v => H.has(v, 'Lpc') ? '\\(L/p = 2(' + H.fmt(v.Cp) + ') + \\frac{' + v.N1 + '+' + v.N2 + '}{2} + \\frac{(' + v.N2 + '-' + v.N1 + ')^2}{4\\pi^2(' + H.fmt(v.Cp) + ')} = ' + H.fmt(v.Lpc) + '\\ \\text{pitches}\\)' : null },
            { id: 'Lp', symbol: 'L/p', label: 'Chain length used (even integer)', unit: 'pitches', kind: 'lookup', fig: 'fig17-16', auto: v => { const N2 = N2v(v); return (H.has(v, 'Cp', 'N1') && N2 !== undefined) ? C.pickLength(v.N1, N2, v.Cp) : undefined; }, hint: 'auto = ★ pick of the length table (nearest even; next even if CD would drop below 30 p)' },
            { id: 'Lin', symbol: 'L', label: 'Chain length', unit: 'in', kind: 'calc', compute: v => H.has(v, 'Lp', 'p') ? v.Lp * v.p : undefined },
            { id: 'A', symbol: 'A', label: 'A = (N1 + N2)/2 − L/p', unit: '', kind: 'calc', compute: v => H.has(v, 'Lp', 'N1', 'N2') ? (v.N1 + v.N2) / 2 - v.Lp : undefined },
            { id: 'Cpa', symbol: 'C/p', label: 'Actual centre distance', unit: 'pitches', kind: 'calc', compute: v => { if (!H.has(v, 'A', 'N1', 'N2')) return undefined; const r = v.A * v.A - 8 * ((v.N2 - v.N1) / (2 * Math.PI)) ** 2; return r >= 0 ? 0.25 * (-v.A + Math.sqrt(r)) : undefined; },
              work: v => H.has(v, 'Cpa') ? '\\(C = \\frac{p}{4}\\left[' + H.fmt(-v.A) + ' + \\sqrt{' + H.fmt(v.A) + '^2 - 8\\left(\\frac{' + v.N2 + '-' + v.N1 + '}{2\\pi}\\right)^2}\\right] = ' + H.fmt(v.Cpa) + 'p\\)' : null },
            { id: 'C', symbol: 'C', label: 'Actual centre distance', unit: 'in', kind: 'calc', compute: v => H.has(v, 'Cpa', 'p') ? v.Cpa * v.p : undefined,
              work: v => H.has(v, 'C') ? '\\(C = ' + H.fmt(v.Cpa) + '(' + H.fmt(v.p) + ') = ' + H.fmt(v.C) + '\\ \\text{in}\\)' : null,
              check: v => (H.has(v, 'C', 'D2') && v.C < 1.5 * v.D2) ? 'Course: CD should be ≥ 150 % of the large sprocket diameter' : null },
          ],
          after: v => C.lengthTable({ N1: v.N1, N2: v.N2, C: v.Cp, p: v.p, Lid: 'Lp' }) },
        { id: 'wrap', title: 'Angle of wrap (Mott Eqs. 7-21/7-22, as in both bibles)', fig: ['fig7-4'],
          formula: '\\theta_1 = 180^\\circ - 2\\sin^{-1}\\frac{D_2 - D_1}{2C},\\qquad \\theta_2 = 180^\\circ + 2\\sin^{-1}\\frac{D_2 - D_1}{2C}',
          vars: [
            { id: 'th1', symbol: '\\theta_1', label: 'Wrap on small sprocket', unit: '°', kind: 'calc', compute: v => H.has(v, 'D1', 'D2', 'C') ? 180 - 2 * H.deg(Math.asin((v.D2 - v.D1) / (2 * v.C))) : undefined,
              check: v => (H.has(v, 'th1') && v.th1 < 120) ? '\\(\\theta_1\\) < 120° — increase centre distance' : null },
            { id: 'th2', symbol: '\\theta_2', label: 'Wrap on large sprocket', unit: '°', kind: 'calc', compute: v => H.has(v, 'th1') ? 360 - v.th1 : undefined },
          ] },
      ] },

      { title: 'Chain in tension (optional)', steps: [
        { id: 'tens', title: 'Chain used as a tension member (lifting / static load) — course HW1 P5', fig: ['table17-19', 'ansi50', 'renold-sf', 'rj50', 'rj80', 'rj120'],
          formula: '\\text{tensile strength} \\ge 10 \\times F_w,\\qquad n = \\frac{\\text{tensile strength}}{F_w}',
          text: 'Optional (chain carrying a load, HW1 P5): smallest chain with minimum tensile strength ≥ 10 × working load per strand.',
          vars: [
            { id: 'Fw', symbol: 'F_w', label: 'Working load per strand', unit: 'lbf', kind: 'input', hint: 'leave blank for a power-transmission drive' },
            { id: 'nFw', symbol: 'n', label: 'Min tensile strength / working load', unit: '', kind: 'calc', digits: 3, compute: v => (H.has(v, 'Fw') && v.Fw > 0 && CHAIN[v.chain]) ? CHAIN[v.chain][1] / v.Fw : undefined,
              work: v => H.has(v, 'nFw') ? '\\(n = ' + H.fmt(CHAIN[v.chain][1]) + '/' + H.fmt(v.Fw) + ' = ' + H.fmt(v.nFw, 3) + '\\)' : null,
              check: v => (H.has(v, 'nFw') && v.nFw < 10) ? 'Below the course minimum of 10 — pick a larger chain' : null },
          ],
          after: v => C.tensionTable({ Fw: v.Fw, TS: TSmin, TSlabel: 'Shigley Table 17-19 min tensile' }) },
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
            return (ok ? '<span class="result-ok">PASS</span>' : '<span class="result-bad">FAIL</span>') + ' — ' + (v.strands || 1) + ' strand(s) of No. ' + (v.chain || '?') + ' chain (p = ' + H.fmt(v.p) + ' in), N_1 = ' + v.N1 + ', N_2 = ' + v.N2 + ', L = ' + H.fmt(v.Lp) + ' pitches = ' + H.fmt(v.Lin) + ' in, C = ' + H.fmt(v.C) + ' in; H_{a} = ' + H.fmt(v.Ha) + ' hp vs H_{d} = ' + H.fmt(v.Hd) + ' hp' + (v.lub ? '; Type ' + v.lub + ' lubrication' : '') + '. Durability basis: 15 000 h, 100 pitches, recommended lubrication.';
          } },
      ] },
    ],
  };
})();
