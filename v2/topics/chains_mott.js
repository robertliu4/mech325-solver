// Roller chain — Mott Ch. 7-6 (merged Fizz §1.6 + Mech §8.3.4.1; Example Problems 7-5 / 7-6)
// Course alignment (v2/COURSE_CONVENTIONS.md §0, §4): "Flexible belts Intro and Chains" slides 12–34, HW1 P5/P6. SF from Mott Table 7-17
// (auto from load × driver; Martin Table II shown as a course figure), nd = 1.0 (Renold multipliers available), N1 ≥ 17, ratio ≤ 7:1,
// strand factors 1.7/2.5/3.3, CD 30–50 pitches and ≥ 150 % of the large sprocket, even number of pitches, wrap > 120°, V ≤ 9000 ft/min,
// tensile strength ≥ 10 × working load for chain used in tension (HW1 P5).
// Verified against: HW1 P6 (Mott 7-40): 6-cyl engine → heavy conveyor, 40 hp, 500 → 250 rpm: SF 1.4 → 56 hp; 3 strands → 22.4 hp/strand;
//   No. 80, N1 14, N2 28, PD1 4.494, PD2 8.931; CD 36 pitches → Lc 93.1 → 94; CD 36.43 in; wrap 173°/187°. Prated = 24.02 hp/strand
//   (Table 7-16, 14 T @ 500 rpm; the course spreadsheet gives no rating — earlier versions used 23.0) → Pallow 60.05 hp, FS 1.07.
// Guide assumptions (review pass): `assumptions` below lists Fizz §1.6 / Mech §8.3.4 rules; defaults chain No. 60, N1 17, 1 strand, CD 40 p.
// Verified against: HW1 P5 (Mott 7-26): 2500 lb per strand lifting → ≥ 25 000 lb → No. 120 (34 000 lb) → SF 13.6.
// Verified against: Lecture Martin example (slide 30): 10 hp 1200 → 300 rpm, moderate shock, electric motor → SF 1.3, 13 hp; No. 50, 18 T;
//   with the catalogue's 70 T and CD 30 in = 48 pitches → 142 pitches (auto N2 = 72 for an exact 4:1).
// SIZING (v2/SIZING_BRIEF.md): data + pick rules live in chains_common.js (loaded first by chains_mott.html). Selection tables with Use buttons:
//   chain × strands and every chain number (Step 3), small-sprocket teeth and N2 (Steps 4–6), even chain lengths (Steps 7–9), chain in tension.
//   chain / strands / Prated / N2 / Lc are yellow lookups whose auto = the ★ pick, so the page also works without clicking.
// Picks verified (Playwright, rating source = Mott tables, rule = fewest strands first):
//   HW1 P6: 56 hp @ 500 rpm, N1 14 → 1 & 2 strands: nothing in Mott's tables; 3 strands → No. 80 (24.02 ≥ 22.4) ★ = course 3 × No. 80;
//     teeth table stars 17 T (odd ≥ 17) and shows 14 T as the smallest passing count the course used; length 93.1 → 94 ★.
//   Mott Ex 7-5: 15 hp × 1.4 = 21 hp @ 900 rpm, 17 T → single No. 60, 21.96 hp (interpolated 800/1000 rpm), Type B ★; N2 65.11 → 65 ★;
//     L 122.5 → 122 ★, CD 39.77 p = 29.83 in. Ex 7-6: strands = 4 → chain auto No. 40 (6.57 ≥ 6.36 hp/strand), L 102.9 → 104 ★ (CD ≥ 30 p).
//   HW1 P5: Fw 2500 lb → No. 120 (34 000 ≥ 25 000 lb) ★, SF 13.6. Martin s30 (13 hp @ 1200 rpm): Mott tables → 1 × No. 60 (No. 50 is not in
//     Mott); rating source Renold → 1 × No. 50 (16.85 hp, Type B) = the Martin/lecture choice.
// Polish pass (past exams, v2/notes/past_exam_m1.md): Midterm 2021 P1 [Mott]: 5 hp AC high torque → recip. pump, 700 → 300 rpm, CD 30 in,
//   SF 1.3 → 6.5 hp, N1 17 → 1 × No. 60 (17.25 hp interpolated 600/800 rpm), Type B, N2 40, 297.5 rpm, FS 2.65 — matches; 30 in = 40 p → 108 pitches.
// Midterm 2024 P1 [Mott]: 10 hp AC high torque → hammer mill, 1150 → 450, CD 36 in, SF 1.5 → 15 hp, N1 18 → 1 × No. 60 (25.04 hp), N2 46,
//   FS 1.67, Type B — matches; 36 in = 48 p → L 128.4 → 128 (the solution rounds to odd 129 — slip, an odd count needs an offset link).
(function () {
  // Table 7-12: chain number → [pitch in, average tensile strength lb]
  const CHAIN = { 25: [0.25, 925], 35: [0.375, 2100], 41: [0.5, 2000], 40: [0.5, 3700], 50: [0.625, 6100], 60: [0.75, 8500], 80: [1.0, 14500], 100: [1.25, 24000], 120: [1.5, 34000], 140: [1.75, 46000], 160: [2.0, 58000], 180: [2.25, 80000], 200: [2.5, 95000], 240: [3.0, 130000] };
  // Table 7-17 service factors [hydraulic, electric/turbine, IC engine]
  const C = window.CHAINS;
  const SF = { smooth: [1.0, 1.0, 1.2], moderate: [1.2, 1.3, 1.4], heavy: [1.4, 1.5, 1.7] };
  const DRV = { hydraulic: 0, electric: 1, engine: 2 };
  const STRAND = { 1: 1.0, 2: 1.7, 3: 2.5, 4: 3.3 };
  // selection context for chains_common.js tables / picks
  const opt = v => ({ src: v.rsrc || 'mott', rule: v.selrule || 'strands', P: v.Pdes, N1: v.N1, n1: v.n1, n2: v.n2, VR: v.VR, chain: v.chain, strands: v.strands,
    sList: [1, 2, 3, 4], fac: STRAND, sym: 'P_des', clear: { Prated: '' }, N2id: 'N2' });
  const tensPick = v => H.has(v, 'Fw') ? C.ORDER.find(no => CHAIN[no][1] >= 10 * v.Fw) : undefined;
  const N2v = v => H.has(v, 'N2') ? v.N2 : (H.has(v, 'N1', 'VR') ? Math.round(v.N1 * v.VR) : undefined);
  const Lc = v => { const N2 = N2v(v); return (H.has(v, 'CDt', 'N1') && N2 !== undefined) ? 2 * v.CDt + (v.N1 + N2) / 2 + (N2 - v.N1) ** 2 / (4 * Math.PI * Math.PI * v.CDt) : undefined; };

  window.TOPIC = {
    id: 'chains', book: 'mott',
    title: 'Roller Chain — Drive Design',
    subtitle: 'Mott Ch. 7-6 (Tables 7-12 … 7-18, Eqs. 7-18 … 7-22) · merged Fizz §1.6 + Mech §8.3.4',
    sibling: 'chains_shigley.html',
    intro: 'Mott chain-drive design (Ex 7-5): design power → chain and small sprocket from Tables 7-14/15/16 → N_2 → pitch diameters → length in pitches (even) → actual CD → wrap → factor of safety. Every table is built in; ★ rows are the rule picks, <b>Use</b> fills the field.',
    example: { P: 40, n1: 500, n2: 250, load: 'moderate', driver: 'engine', nd: 1, N1: 14, CDt: 36 },
    assumptions: [
      { text: 'Chain number: first digit(s) × 1/8 in = pitch (No. 40 = 1/2 in); chains fail by wear — lubrication type comes from the rating table', src: 'Chains s14, s22 · RAP quiz', general: true },
      { text: 'SF from Mott Table 7-17 (load × driver); n_d = 1.0 unless stated (Renold multipliers only if asked)', src: 'Fizz p.27 · Mech p.34 · Chains s26', var: 'SF' },
      { text: 'Output speed given as a range → its midpoint for VR', src: 'Fizz p.28 · Mech p.34', var: 'n2' },
      { text: 'Chain: smallest chain that carries P_des, single strand first, then 2/3/4 strands (factors 1.7/2.5/3.3) — Mott Ex 7-5; HW1 P6 → 3 × No. 80; midterms 2021/2024 → 1 × No. 60', src: 'Fizz p.28 · Mech p.34–36 · Mott Ex 7-5', var: 'selrule' },
      { text: 'Ratings from Mott Tables 7-14/15/16 (No. 40/60/80), linear between rpm columns; other numbers from Shigley Table 17-20 × K_1 or the Renold pages', src: 'Mott §7-11 · Chains s20', var: 'rsrc' },
      { text: 'Small sprocket N_1 ≥ 17 teeth (fewer only below 100 rpm), odd preferred; N_2 ≤ 120', src: 'Fizz p.28 · Mech p.34 · Martin s29', var: 'N1' },
      { text: 'N_2 = N_1·VR rounded to the nearest stocked integer (Mott Ex 7-5: 65.11 → 65)', src: 'Fizz p.30 · Mech p.35 · Shigley Table 17-21', var: 'N2' },
      { text: 'Nominal CD 40 pitches (30–50); a CD given in inches is divided by the pitch (midterms 2021: 30 in, 2024: 36 in)', src: 'Fizz p.30 · Mech p.35 · Chains s28', var: 'CDt', value: 40 },
      { text: 'Chain length rounded to the nearest EVEN number of pitches (no offset link); next even if CD drops below 30 pitches', src: 'Mech p.35 · Mott Ex 7-5/7-6', var: 'Lc' },
      { text: 'Wrap on the small sprocket ≥ 120°; V ≤ 9000 ft/min; CD ≥ 1.5 × large-sprocket diameter', src: 'Fizz p.31 · Chains s24, s27', step: 'wrap' },
      { text: 'FS = P_allowed/P_des, P_allowed = table rating × strand factor', src: 'Fizz p.31 · Mech p.36', step: 'res' },
      { text: 'Chain in tension (lifting): strength ≥ 10 × working load', src: 'Fizz p.27 · HW1 P5', step: 'tens' },
    ],

    figures: [
      { id: 'fig7-33', ref: 'Figure 7-33', title: 'Basic arrangement of an industrial chain drive (tight/slack strands)', src: 'figures/mott/fig7-33.png', page: 295 },
      { id: 'fig7-4', ref: 'Figure 7-4', title: 'Belt/chain drive configuration — wrap angles, span, CD', src: 'figures/mott/fig7-4.png', page: 265 },
      { id: 'table7-12', ref: 'Table 7-12', title: 'U.S. roller chain sizes: pitch and average tensile strength', src: 'figures/mott/table7-12.png', page: 296, note: 'For a chain used in tension (lifting) use only 10 % of the average tensile strength.' },
      { id: 'table7-17', ref: 'Table 7-17', title: 'Service factors for chain drives (load type × driver)', src: 'figures/mott/table7-17.png', page: 303, note: 'HW1 P6: 6-cyl engine → heavy conveyor (moderate shock) = 1.4.' },
      { id: 'martin-sf', ref: 'Martin catalogue Table II (slide 29)', book: 'course', title: 'Martin chain service factors and selection notes', src: 'figures/course/chain_martin_service_factors.png', note: 'Uniform 1.0/1.0/1.2, moderate shock 1.2/1.3/1.4, heavy shock 1.4/1.5/1.7 for (IC engine hydraulic / electric motor or turbine / IC engine mechanical); add 0.2 per unfavourable condition. 17 teeth minimum recommended.' },
      { id: 'martin-ex', ref: 'Martin selection example (slide 30)', book: 'course', title: 'Martin example: 10 hp 1200 → 300 rpm, 30 in centres, moderate shock → SF 1.3, No. 50, 18 T / 70 T, 142 pitches', src: 'figures/course/chain_martin_selection_example.png' },
      { id: 'ansi50', ref: 'ANSI No. 50 strength table (slide 15)', book: 'course', title: 'ANSI #50 chain dimensions, minimum tensile and working loads for 1–6 strands', src: 'figures/course/chain_ansi50_strength_table.png' },
      { id: 'renold-hp', ref: 'Renold No. 50 hp rating (slide 20)', book: 'course', title: 'Renold Jeffrey No. 50 single-strand hp table with strand factors and lubrication types', src: 'figures/course/chain_renold_no50_hp_rating.png', note: 'Use for No. 50 chain (Mott tabulates only 40/60/80). 17 T @ 1200 rpm = 16.85 hp (Type B).' },
      { id: 'renold-limit', ref: 'Renold power-limit chart (slide 21)', book: 'course', title: 'Renold kW vs rpm limit chart', src: 'figures/course/chain_renold_power_limit_chart.png' },
      { id: 'renold-sf', ref: 'Renold safety factors (slide 33)', book: 'course', title: 'Renold nominal safety factor on breaking load vs cycles and application', src: 'figures/course/chain_renold_safety_factors.png', note: '5.0 (10^{6} cycles) / 6.0 (2×10^{6}); 8.0 (8×10^{6}); 10 passenger lifts; 12 harsh environments.' },
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
      { id: 'table7-14', ref: 'Table 7-14', title: 'Horsepower ratings — single-strand No. 40 chain (teeth × rpm, lubrication zones)', src: 'figures/mott/table7-14.png', page: 300, note: 'Interpolate on rpm. Zones: Type A manual/drip, B bath/disc, C oil stream.' },
      { id: 'table7-15', ref: 'Table 7-15', title: 'Horsepower ratings — single-strand No. 60 chain', src: 'figures/mott/table7-15.png', page: 301 },
      { id: 'table7-16', ref: 'Table 7-16', title: 'Horsepower ratings — single-strand No. 80 chain', src: 'figures/mott/table7-16.png', page: 302 },
      { id: 'table7-18', ref: 'Table 7-18', title: 'Recommended lubricant for chain drives', src: 'figures/mott/table7-18.png', page: 303 },
      { id: 'fig7-36', ref: 'Figure 7-36', title: 'Lubrication methods: Type A drip, Type B bath/disc, Type C oil stream', src: 'figures/mott/fig7-36.png', page: 304 },
      { id: 'fig7-38', ref: 'Figure 7-38', title: 'Scale layouts of the Example 7-5 / 7-6 chain drives', src: 'figures/mott/fig7-38.png', page: 306 },
      { id: 'table17-20a', ref: 'Table 17-20 (a)', book: 'shigley', title: 'Shigley rating table for other chain numbers (25 … 60, 17 T)', src: 'figures/shigley/table17-20a.png', page: 934, note: 'Use when the chain is not No. 40/60/80 (Mott tabulates only those three).' },
      { id: 'table17-20b', ref: 'Table 17-20 (b)', book: 'shigley', title: 'Shigley rating table (80 … 240, 17 T)', src: 'figures/shigley/table17-20b.png', page: 935 },
      { id: 'table17-21', ref: 'Table 17-21', book: 'shigley', title: 'Single-strand sprocket tooth counts available from one supplier (Morse)', src: 'figures/shigley/table17-21.png', page: 935, note: 'Used in the N_2 table ("stocked" column).' },
    ],

    sections: [
      { title: 'Steps 1–2: design power and ratio', steps: [
        { id: 'in', title: 'Service factor and design power', fig: ['table7-17', 'martin-sf', 'renold-nd', 'tsu-sf'], formula: 'P_{des} = SF \\cdot P \\cdot n_d,\\qquad VR = \\frac{n_1}{n_2}\\ (n_1 > n_2)',
          text: 'Always multiply the nominal power by SF first. Pick load type and driver; SF fills from Mott Table 7-17. Output-speed range → use its midpoint.',
          vars: [
            { id: 'P', symbol: 'P', label: 'Power delivered to the chain drive', unit: 'hp', kind: 'input' },
            { id: 'n1', symbol: 'n_1', label: 'Small (driving) sprocket speed', unit: 'rpm', kind: 'input' },
            { id: 'n2', symbol: 'n_2', label: 'Desired output speed (midpoint of range)', unit: 'rpm', kind: 'input' },
            { id: 'load', label: 'Load type', kind: 'choice', type: 'text', options: [{ label: 'Smooth (agitators, fans, generators, centrifugal pumps, light conveyors)', value: 'smooth' }, { label: 'Moderate shock (bucket elevators, machine tools, cranes, heavy conveyors, mixers, recip. pumps)', value: 'moderate' }, { label: 'Heavy shock (punch presses, hammer mills, crushers, rolling mills, logging hoists)', value: 'heavy' }] },
            { id: 'driver', label: 'Type of driver', kind: 'choice', type: 'text', options: [{ label: 'Hydraulic drive', value: 'hydraulic' }, { label: 'Electric motor or turbine', value: 'electric' }, { label: 'Internal combustion engine, mechanical drive', value: 'engine' }] },
            { id: 'SF', symbol: 'SF', label: 'Service factor', unit: '', kind: 'lookup', fig: 'table7-17', auto: v => (SF[v.load] && DRV[v.driver] !== undefined) ? SF[v.load][DRV[v.driver]] : undefined, hint: 'HW1 P6: 1.4; Martin lecture example: 1.3' },
            { id: 'nd', symbol: 'n_d', label: 'Design factor', unit: '', kind: 'lookup', fig: 'renold-nd', default: 1.0, hint: 'course: nd = 1.0 unless stated' },
            { id: 'Pdes', symbol: 'P_{des}', label: 'Design power', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'P', 'SF') ? v.P * v.SF * (H.has(v, 'nd') ? v.nd : 1) : undefined,
              work: v => H.has(v, 'Pdes') ? '\\(P_{des} = ' + H.fmt(v.SF) + '(' + H.fmt(v.P) + ')(' + H.fmt(H.has(v, 'nd') ? v.nd : 1) + ') = ' + H.fmt(v.Pdes) + '\\ \\text{hp}\\)' : null },
            { id: 'VR', symbol: 'VR', label: 'Desired ratio', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'n1', 'n2') ? v.n1 / v.n2 : undefined, check: v => (H.has(v, 'VR') && v.VR > 7) ? 'Course: 7:1 is near the maximum — use two stages' : null },
          ] },
      ] },

      { title: 'Step 3: chain and small sprocket', steps: [
        { id: 'sel', title: 'Select the chain: number, strands and rated power', fig: ['table7-14', 'table7-15', 'table7-16', 'table7-12', 'fig7-36', 'table17-20a', 'table17-20b', 'renold-hp', 'rj50', 'rj60', 'rj80', 'rj100', 'tsu-graph', 'renold-limit', 'tsu-constr'],
          formula: 'P_{per\\,strand} = \\frac{P_{des}}{\\text{strand factor}} \\le P_{rated}(N_1, n_1)',
          text: '<b>Rule:</b> smallest chain whose rating at N_1 and n_1 covers the power per strand — single strand first, then 2/3/4 (Mott Ex 7-5). The table zone gives the lubrication type. Ratings assume 15 000 h, 17 T, 100 pitches.',
          vars: [
            { id: 'N1', symbol: 'N_1', label: 'Small sprocket teeth (trial)', unit: '', kind: 'input', default: 17, hint: 'Fizz/Mech: 17 or more (fewer only below 100 rpm); Martin: 17 recommended, 15 common — see the teeth table in Steps 4–6',
              check: v => (H.has(v, 'N1') && v.N1 < 17 && !(H.has(v, 'n1') && v.n1 < 100)) ? 'Fewer than 17 teeth above 100 rpm (Fizz p.28) — HW1 P6 accepted 14 at 500 rpm with a 3-strand No. 80' : (H.has(v, 'N1', 'VR') && v.N1 * v.VR > 120) ? 'N1·VR > 120: large sprocket would exceed 120 teeth' : null },
            { id: 'rsrc', label: 'Rating source', kind: 'choice', type: 'text', allowBlank: false, default: 'mott', options: [{ label: 'Mott Tables 7-14/15/16 (No. 40/60/80)', value: 'mott' }, { label: 'Shigley Table 17-20 (17 T) × K_1 — all numbers', value: 'shig' }, { label: 'Renold ANSI catalogue pages — all numbers (course s20)', value: 'renold' }] },
            { id: 'selrule', label: 'Selection rule', kind: 'choice', type: 'text', allowBlank: false, default: 'strands', options: [{ label: 'Fewest strands first, then smallest chain (Mott Ex. 7-5, Fizz)', value: 'strands' }, { label: 'Smallest pitch first, then fewest strands (Shigley Ex. 17-5)', value: 'pitch' }] },
            { id: 'strands', symbol: '', label: 'Number of strands', unit: '', kind: 'lookup', fig: 'table7-14', auto: v => { const o = opt(v); if (!H.has(v, 'Pdes')) return 1; if (H.has(v, 'chain')) return C.fewestStrands(o, v.chain); const k = C.pick(o); return k ? k.strands : undefined; },
              hint: 'auto = ★ pick of the selection table (1–4)', check: v => (H.has(v, 'strands') && !STRAND[v.strands]) ? 'Mott gives factors for 1–4 strands only' : null },
            { id: 'sfac', symbol: '', label: 'Strand (power capacity) factor', unit: '', kind: 'calc', compute: v => STRAND[v.strands] },
            { id: 'Pstrand', symbol: 'P_{per\\,strand}', label: 'Required power per strand', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'Pdes', 'sfac') ? v.Pdes / v.sfac : undefined,
              work: v => (H.has(v, 'Pstrand') && v.strands > 1) ? '\\(P = ' + H.fmt(v.Pdes) + '/' + H.fmt(v.sfac) + ' = ' + H.fmt(v.Pstrand) + '\\ \\text{hp per strand}\\)' : null },
            { id: 'chain', symbol: '', label: 'Chain number', unit: '', kind: 'lookup', fig: 'table7-12',
              auto: v => { const o = opt(v); if (!H.has(v, 'Pdes')) return tensPick(v); if (H.has(v, 'strands')) return C.smallestFor(o, v.strands); const k = C.pick(o); return k ? k.chain : undefined; },
              hint: 'auto = ★ pick; Mech: No. 40 often fails, No. 80 usually overkill', check: v => (H.has(v, 'chain') && !CHAIN[v.chain]) ? 'Not an ANSI chain number (Table 7-12: 25, 35, 40, 41, 50, 60, 80 … 240)' : null },
            { id: 'p', symbol: 'p', label: 'Chain pitch', unit: 'in', kind: 'lookup', fig: 'table7-12', auto: v => CHAIN[v.chain] ? CHAIN[v.chain][0] : undefined },
            { id: 'Ts', symbol: '', label: 'Average tensile strength', unit: 'lb', kind: 'lookup', fig: 'table7-12', auto: v => CHAIN[v.chain] ? CHAIN[v.chain][1] : undefined },
            { id: 'Prated', symbol: 'P_{rated}', label: 'Rated power per strand at N1, n1', unit: 'hp', kind: 'lookup', fig: 'table7-15',
              auto: v => { const r = C.rating(v.rsrc || 'mott', v.chain, v.N1, v.n1); return r.hp; }, hint: 'auto = table reading (interpolated) from the rating source',
              check: v => (H.has(v, 'Prated', 'Pstrand') && v.Prated < v.Pstrand) ? 'Rated power below the required power per strand — larger chain, more teeth or more strands' : null },
            { id: 'lub', symbol: '', label: 'Lubrication type (table zone)', unit: '', kind: 'calc', compute: v => { const r = C.rating(v.rsrc || 'mott', v.chain, v.N1, v.n1); return r.z ? C.LUBE[r.z] : undefined; } },
          ],
          after: v => C.strandsTable(opt(v)) + C.chainTable(opt(v)) },
        { id: 'std', title: 'Standard chain sizes', fig: ['table7-12', 'ansi50', 'tsu-constr'],
          text: 'Reference: pitch, width, roller and strength of every ANSI chain; the chain in use is highlighted.',
          after: v => C.dimsTable(v.chain, 'mott') },
        { id: 'tens', title: 'Chain used in tension (lifting / static load) — course HW1 P5', fig: ['table7-12', 'ansi50', 'renold-sf', 'rj50', 'rj60', 'rj80'],
          formula: '\\text{tensile strength} \\ge 10 \\times \\text{working load per strand},\\qquad SF = \\frac{\\text{tensile strength}}{\\text{working load}}',
          text: 'Optional (chain carrying a load, HW1 P5): smallest chain with average tensile strength ≥ 10 × working load per strand.',
          vars: [
            { id: 'Fw', symbol: 'F_w', label: 'Working load per strand', unit: 'lb', kind: 'input', hint: 'leave blank for a power-transmission drive' },
            { id: 'Treq', symbol: '', label: 'Required tensile strength (10 × Fw)', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'Fw') ? 10 * v.Fw : undefined },
            { id: 'SFt', symbol: 'SF_{tension}', label: 'Tensile strength / working load', unit: '', kind: 'calc', digits: 3, compute: v => (H.has(v, 'Fw', 'Ts') && v.Fw > 0) ? v.Ts / v.Fw : undefined,
              work: v => H.has(v, 'SFt') ? '\\(SF = ' + H.fmt(v.Ts) + '/' + H.fmt(v.Fw) + ' = ' + H.fmt(v.SFt, 3) + '\\)' : null,
              check: v => (H.has(v, 'SFt') && v.SFt < 10) ? 'Below the course minimum of 10 — pick a larger chain (Table 7-12)' : null },
          ],
          after: v => C.tensionTable({ Fw: v.Fw, TS: C.T7_12, TSlabel: 'Mott Table 7-12 average tensile' }) + (H.has(v, 'SFt') ? (v.SFt >= 10 ? '<span class="result-ok">OK</span> — No. ' + v.chain + ' chain: ' + H.fmt(v.Ts) + ' lb ≥ 10 × ' + H.fmt(v.Fw) + ' lb (SF = ' + H.fmt(v.SFt, 3) + ')' : '<span class="result-bad">Too small</span> — need ≥ ' + H.fmt(v.Treq) + ' lb tensile strength; next size up from Table 7-12') : '') },
      ] },

      { title: 'Steps 4–6: sprockets', steps: [
        { id: 'spk', title: 'Sprocket teeth, actual output speed, pitch diameters', eq: '7-20', fig: ['table7-14', 'table7-15', 'table7-16', 'table17-21'], formula: 'N_2 = N_1 \\cdot VR\\ (\\text{integer}),\\qquad n_2 = n_1\\frac{N_1}{N_2},\\qquad PD = \\frac{p}{\\sin(180^\\circ/N)}',
          text: '<b>Rule:</b> smallest <b>odd</b> N_1 ≥ 17 that still carries the load; N_2 = N_1·VR rounded to a stocked count, then check the output speed. More teeth → less chordal speed variation.',
          vars: [
            { id: 'N2', symbol: 'N_2', label: 'Large sprocket teeth', unit: '', kind: 'lookup', fig: 'table17-21', auto: v => C.n2pick(v.N1, v.VR, v.chain), hint: 'auto = ★ of the N2 table: N1·VR rounded to the nearest integer stocked in Table 17-21 (Fizz: nearest; Mech rounds up)', check: v => (H.has(v, 'N2') && v.N2 > 120) ? 'More than 120 teeth' : null },
            { id: 'VRa', symbol: 'VR_{act}', label: 'Actual ratio', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'N1', 'N2') ? v.N2 / v.N1 : undefined },
            { id: 'n2a', symbol: 'n_{2,act}', label: 'Actual output speed', unit: 'rpm', kind: 'calc', compute: v => H.has(v, 'n1', 'N1', 'N2') ? v.n1 * v.N1 / v.N2 : undefined,
              work: v => H.has(v, 'n2a') ? '\\(n_2 = ' + H.fmt(v.n1) + '(' + v.N1 + '/' + v.N2 + ') = ' + H.fmt(v.n2a) + '\\ \\text{rpm}\\)' : null },
            { id: 'PD1', symbol: 'PD_1', label: 'Small sprocket pitch diameter', unit: 'in', kind: 'calc', compute: v => H.has(v, 'p', 'N1') ? v.p / Math.sin(Math.PI / v.N1) : undefined,
              work: v => H.has(v, 'PD1') ? '\\(PD_1 = \\frac{' + H.fmt(v.p) + '}{\\sin(180^\\circ/' + v.N1 + ')} = ' + H.fmt(v.PD1) + '\\ \\text{in}\\)' : null },
            { id: 'PD2', symbol: 'PD_2', label: 'Large sprocket pitch diameter', unit: 'in', kind: 'calc', compute: v => H.has(v, 'p', 'N2') ? v.p / Math.sin(Math.PI / v.N2) : undefined,
              work: v => H.has(v, 'PD2') ? '\\(PD_2 = \\frac{' + H.fmt(v.p) + '}{\\sin(180^\\circ/' + v.N2 + ')} = ' + H.fmt(v.PD2) + '\\ \\text{in}\\)' : null },
          ],
          after: v => C.teethTable(opt(v)) + C.n2Table(opt(v)) },
      ] },

      { title: 'Steps 7–9: centre distance and chain length', steps: [
        { id: 'len', title: 'Nominal CD, chain length and actual CD', fig: ['fig7-4', 'fig7-38'], eq: '7-18, 7-19',
          formula: 'L_c = 2CD + \\frac{N_2+N_1}{2} + \\frac{(N_2-N_1)^2}{4\\pi^2 CD},\\qquad CD = \\frac14\\left[L_c - \\frac{N_2+N_1}{2} + \\sqrt{\\left(L_c - \\frac{N_2+N_1}{2}\\right)^2 - \\frac{8(N_2-N_1)^2}{4\\pi^2}}\\right]',
          text: 'All in pitches. Start at 40 pitches (30–50) or the given CD ÷ p; round L_c to the nearest <b>even</b> integer, then recompute CD (a maximum — provide adjustment).',
          vars: [
            { id: 'CDgin', symbol: 'CD_{given}', label: 'Centre distance given in inches (optional)', unit: 'in', kind: 'input', hint: 'midterm 2021: 30 in, 2024: 36 in' },
            { id: 'CDt', symbol: 'CD_{nom}', label: 'Nominal centre distance', unit: 'pitches', kind: 'input', auto: v => H.has(v, 'CDgin', 'p') ? v.CDgin / v.p : 40, hint: 'auto = 40 pitches, or the given inches ÷ p', check: v => (H.has(v, 'CDt') && (v.CDt < 30 || v.CDt > 50)) ? 'Course: 30–50 pitches recommended' : null },
            { id: 'Lcc', symbol: 'L_c', label: 'Chain length (computed)', unit: 'pitches', kind: 'calc', compute: Lc,
              work: v => H.has(v, 'Lcc') ? '\\(L_c = 2(' + H.fmt(v.CDt) + ') + \\frac{' + v.N2 + '+' + v.N1 + '}{2} + \\frac{(' + v.N2 + '-' + v.N1 + ')^2}{4\\pi^2(' + H.fmt(v.CDt) + ')} = ' + H.fmt(v.Lcc) + '\\ \\text{pitches}\\)' : null },
            { id: 'Lc', symbol: 'L_c', label: 'Chain length used (even integer)', unit: 'pitches', kind: 'lookup', fig: 'fig7-38', auto: v => { const N2 = N2v(v); return (H.has(v, 'N1', 'CDt') && N2 !== undefined) ? C.pickLength(v.N1, N2, v.CDt) : undefined; }, hint: 'auto = ★ pick of the length table (nearest even; next even if CD would drop below 30 p)' },
            { id: 'Lin', symbol: 'L_c', label: 'Chain length', unit: 'in', kind: 'calc', compute: v => H.has(v, 'Lc', 'p') ? v.Lc * v.p : undefined },
            { id: 'CD', symbol: 'CD', label: 'Actual centre distance', unit: 'pitches', kind: 'calc', compute: v => { if (!H.has(v, 'Lc', 'N1', 'N2')) return undefined; const q = v.Lc - (v.N1 + v.N2) / 2; const r = q * q - 8 * (v.N2 - v.N1) ** 2 / (4 * Math.PI * Math.PI); return r >= 0 ? 0.25 * (q + Math.sqrt(r)) : undefined; },
              work: v => H.has(v, 'CD') ? '\\(CD = \\frac14\\left[' + H.fmt(v.Lc) + ' - \\frac{' + v.N2 + '+' + v.N1 + '}{2} + \\sqrt{\\left(' + H.fmt(v.Lc) + ' - \\frac{' + v.N2 + '+' + v.N1 + '}{2}\\right)^2 - \\frac{8(' + v.N2 + '-' + v.N1 + ')^2}{4\\pi^2}}\\right] = ' + H.fmt(v.CD) + '\\ \\text{pitches}\\)' : null },
            { id: 'CDin', symbol: 'CD', label: 'Actual centre distance', unit: 'in', kind: 'calc', compute: v => H.has(v, 'CD', 'p') ? v.CD * v.p : undefined,
              work: v => H.has(v, 'CDin') ? '\\(CD = ' + H.fmt(v.CD) + '(' + H.fmt(v.p) + ') = ' + H.fmt(v.CDin) + '\\ \\text{in}\\)' : null,
              check: v => (H.has(v, 'CDin', 'PD2') && v.CDin < 1.5 * v.PD2) ? 'Course: CD should be ≥ 150 % of the large sprocket diameter' : null },
            { id: 'Vc', symbol: 'V', label: 'Chain velocity', unit: 'ft/min', kind: 'calc', compute: v => H.has(v, 'N1', 'p', 'n1') ? v.N1 * v.p * v.n1 / 12 : undefined, check: v => (H.has(v, 'Vc') && v.Vc > 9000) ? 'Course: V must not exceed 9000 ft/min' : null },
          ],
          after: v => C.lengthTable({ N1: v.N1, N2: v.N2, C: v.CDt, p: v.p, Lid: 'Lc' }) },
      ] },

      { title: 'Steps 10–11: wrap angles and result', steps: [
        { id: 'wrap', title: 'Angle of wrap on each sprocket', fig: ['fig7-4'], eq: '7-21, 7-22',
          formula: '\\theta_1 = 180^\\circ - 2\\sin^{-1}\\left[\\frac{PD_2 - PD_1}{2CD}\\right],\\qquad \\theta_2 = 180^\\circ + 2\\sin^{-1}\\left[\\frac{PD_2 - PD_1}{2CD}\\right]\\quad(CD\\ \\text{in inches})',
          vars: [
            { id: 'th1', symbol: '\\theta_1', label: 'Wrap on small sprocket', unit: '°', kind: 'calc', compute: v => H.has(v, 'PD1', 'PD2', 'CDin') ? 180 - 2 * H.deg(Math.asin((v.PD2 - v.PD1) / (2 * v.CDin))) : undefined,
              work: v => H.has(v, 'th1') ? '\\(\\theta_1 = 180^\\circ - 2\\sin^{-1}\\left[\\frac{' + H.fmt(v.PD2) + ' - ' + H.fmt(v.PD1) + '}{2(' + H.fmt(v.CDin) + ')}\\right] = ' + H.fmt(v.th1) + '^\\circ\\)' : null,
              check: v => (H.has(v, 'th1') && v.th1 < 120) ? '\\(\\theta_1\\) < 120° (course requirement) — increase CD' : null },
            { id: 'th2', symbol: '\\theta_2', label: 'Wrap on large sprocket', unit: '°', kind: 'calc', compute: v => H.has(v, 'th1') ? 360 - v.th1 : undefined },
          ] },
        { id: 'res', title: 'Allowed power, strand check and factor of safety', formula: 'P_{allowed} = P_{rated}\\times\\text{strand factor},\\qquad FS = \\frac{P_{allowed}}{P_{des}},\\qquad \\frac{H_d}{H_r\\times\\text{strand factor}} < 1',
          vars: [
            { id: 'Pallow', symbol: 'P_{allowed}', label: 'Allowed power', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'Prated', 'sfac') ? v.Prated * v.sfac : undefined },
            { id: 'FS', symbol: 'FS', label: 'Factor of safety', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'Pallow', 'Pdes') ? v.Pallow / v.Pdes : undefined,
              work: v => H.has(v, 'FS') ? '\\(FS = ' + H.fmt(v.Pallow) + '/' + H.fmt(v.Pdes) + ' = ' + H.fmt(v.FS, 3) + '\\)' : null },
            { id: 'sfreq', symbol: '', label: 'Strand factor required Hd/Hr', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'Pdes', 'Prated') ? v.Pdes / v.Prated : undefined, hint: 'pick the first strand factor (1, 1.7, 2.5, 3.3) above this' },
          ],
          after: v => {
            if (!H.has(v, 'FS')) return '';
            const ok = v.FS >= 1 && (!H.has(v, 'th1') || v.th1 >= 120);
            const need = H.has(v, 'sfreq') ? ([1, 2, 3, 4].find(k => STRAND[k] >= v.sfreq) || '>4') : '?';
            return (ok ? '<span class="result-ok">PASS</span>' : '<span class="result-bad">FAIL</span>') + ' — ' + (v.strands || 1) + '-strand No. ' + v.chain + ' chain, p = ' + H.fmt(v.p) + ' in; sprockets ' + v.N1 + ' T (PD ' + H.fmt(v.PD1) + ' in) and ' + v.N2 + ' T (PD ' + H.fmt(v.PD2) + ' in); length ' + H.fmt(v.Lc) + ' pitches = ' + H.fmt(v.Lin) + ' in; CD = ' + H.fmt(v.CDin) + ' in (max); output ' + H.fmt(v.n2a) + ' rpm; FS = ' + H.fmt(v.FS, 3) + (v.lub ? '; Type ' + v.lub + ' lubrication' : '') + '. Minimum strands for this chain/teeth: ' + need + '.';
          } },
      ] },
    ],
  };
})();
