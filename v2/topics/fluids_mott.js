// Fluid power — Parker Design Engineers Handbook + Esposito Ch. 6 (course) · Fizz §3 (pp.76–91) + Mech Unit 3 (pp.116–128) procedures.
// Neither textbook covers fluid power, so the Shigley and Mott files are identical apart from id/book/sibling.
// Guide assumptions are listed in `assumptions` and carried by the field defaults (1000 psi, μ ignored unless given, F = Fw + Ff + Fa,
//   g formula, 15 ft/s, schedule 80, 0.85 pump efficiency, 3-phase motor).
// Example (hand-checked, guide procedure): 5000 lb lifted (case 4) with μ 0.1 to 50 ft/min in 1 in, 24-in stroke, mounting I, 1000 psi →
//   g 0.129, Fa 646, F = 5000 + 500 + 646 = 6146 lb, Lb 12 in, d_bore,req 2.80 → 3¼ in (8296 lb push), Q 21.55 gpm, d_p,min 0.766 →
//   1-in sch 80 (9.6 ft/s), HP = 21.55(1000)/(1714 × 0.85) = 14.8 → 15 hp.
// Probe-checked: Esposito 6-17M (40/20 mm, 0.0016 m³/s, 5000 N → 3.98 MPa, 1.27 m/s, 6.37 kW; 5.31 MPa, 1.70 m/s, 8.50 kW), Example 6-6
//   cushion (→ 856 psi), Parker b-6 (6000 lb, 120 ft/min in ½ in → g 1.49, 8930 lb; Parker rounds g to 1.50 → 9000 lb).
// Standard sizes from the Parker Design Engineers Handbook tables (reproduced in both student guides)
const ROD_STD = [0.625, 1, 1.375, 1.75, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5];
const BORE_STD = [1, 1.5, 2, 2.5, 3.25, 4, 5, 6, 7, 8, 10, 12, 14];
const PIPE = { // nominal: [OD, ID sch40, ID sch80, ID sch160]
  '1/8': [0.405, 0.269, 0.215, null], '1/4': [0.540, 0.364, 0.302, null], '3/8': [0.675, 0.493, 0.423, null], '1/2': [0.840, 0.622, 0.546, 0.466],
  '3/4': [1.050, 0.824, 0.742, 0.614], '1': [1.315, 1.049, 0.957, 0.815], '1-1/4': [1.660, 1.380, 1.278, 1.160], '1-1/2': [1.900, 1.610, 1.500, 1.338],
  '2': [2.375, 2.067, 1.939, 1.689], '2-1/2': [2.875, 2.469, 2.323, 2.125], '3': [3.500, 3.068, 2.900, 2.624] };
const MOTOR_HP = [0.5, 0.75, 1, 1.5, 2, 3, 5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200];
const KFAC = { I: 0.5, II: 0.7, III: 2.0, IV: 1.0, V: 1.5, VI: 2.0 };
const nextStd = (x, list) => list.find(s => s >= x - 1e-9);
const pipePick = v => { if (!H.has(v, 'dpmin')) return undefined; const col = v.sched === 40 ? 1 : v.sched === 160 ? 3 : 2; for (const k of Object.keys(PIPE)) { const id = PIPE[k][col]; if (id && id >= v.dpmin) return { nom: k, id }; } return undefined; };
const A = d => Math.PI * d * d / 4;
const ESI = v => v.eunits === 'SI';
const eAp = v => H.has(v, 'edb') ? (ESI(v) ? A(v.edb / 1000) : A(v.edb)) : undefined;      // m² or in²
const eAr = v => H.has(v, 'edr') ? (ESI(v) ? A(v.edr / 1000) : A(v.edr)) : undefined;

window.TOPIC = {
  id: 'fluids', book: 'mott',
  title: 'Fluid Power — Hydraulic Cylinder, Pump, Pipe & Motor Sizing',
  subtitle: 'Course: Parker Design Engineers Handbook (Fluid Power Calculation / motor & pump / mechanical motions handouts) + Esposito Ch. 6 practice problems · Fizz §3 + Mech Unit 3 procedures',
  sibling: 'fluids_shigley.html',
  intro: '<b>Neither Shigley nor Mott covers fluid power.</b> The course sources are the <b>Parker "Design Engineers Handbook"</b> pages handed out (Fluid Power Calculation Handouts 2017: cylinder force tables b-1/b-2, stroke factors b-4, rod graph b-1, acceleration factor b-2, port-size/velocity table b-5, motor-hp table c-1; motor &amp; pump handouts i-8/i-9; mechanical-motions handout b-18 … b-21), the Parker <i>Fluid Power Basics</i> decks, and <b>Esposito Ch. 6</b> (key equations 6-1 … 6-11 and the assigned practice problems 6-15 … 6-27). '
    + 'The two student guides reproduce the same Parker pages, so the figure panel is labelled by guide page and the course-only pages are labelled "Course slides". The "Mott 6e" / "Shigley 11e" badge on this page is only the engine\'s label — no textbook content is used. '
    + 'Procedure (Parker b-5 … b-7 as in both guides): load → acceleration force factor g (Graph b-2 or g = 0.0000517 v²/s) → total thrust → stroke factor &amp; basic length (Table b-4) → minimum rod diameter (Graph b-1) → bore from working pressure (Table b-1 or F = pA; regular or regenerative circuit) → extension / retraction check (Esposito 6-1 … 6-5) → pump flow (gpm, Parker i-8/i-9) → pipe size (≤ 15 ft/s, Table b-5) → motor horsepower (Table c-1, 85 % pump efficiency) → cushion pressure (Esposito 6-10/6-11) → result. '
    + 'Parker convention: <b>select the pump and motor for 10–25 % more pressure than the actuator needs</b> (line losses) — the "loss allowance" input does this. US units throughout: lb, in, ft/min, psi, gpm, hp (the Esposito check step also takes SI for the metric practice problems).',
  example: { p: 1000, loss: 0, L: 24, Fw: 5000, mu: 0.1, loadcase: 'v4', v: 50, s: 1, mount: 'I', drod: 1, circuit: 'regular', mode: 'push', dbore: 3.25, sched: 80, eff: 0.85 },

  assumptions: [
    { text: 'Relief-valve (operating) pressure = 1000 psi when the problem does not give one', src: 'Mech p.118 · Mech p.117', var: 'p' },
    { text: 'Fixed-displacement pump (constant gpm) with a relief valve holding the pressure constant; in the regular (non-regenerative) circuit the retraction is faster and weaker than the extension', src: 'Fizz p.77', var: 'circuit' },
    { text: 'The full relief pressure acts at the cylinder (no line loss), as in both guides; the Parker handbook (course) sizes the pump 10–25 % above the cylinder pressure — enter that as the loss allowance', src: 'Mech p.118', var: 'loss' },
    { text: 'Load friction only if a coefficient of friction is given, otherwise ignored; cylinder friction is insignificant (chart note)', src: 'Fizz p.78 · Fizz p.79', var: 'mu' },
    { text: 'Total thrust F = F_w + F_f + F_a — weight, friction and acceleration all add (load case 4); the Mech guide instead picks the chart formula for the actual motion (horizontal F = Wg ± f, vertical F = Wg ± W)', src: 'Fizz p.79 · Mech p.122', var: 'loadcase' },
    { text: 'Acceleration force factor from g = 0.0000517 v²/s (v in ft/min, s in in) — "more reliable" than reading the chart', src: 'Fizz p.78 · Mech p.122', var: 'g' },
    { text: 'Rod from the rod-selection graph at (thrust, basic length L_b = kL), rounded up to the next standard rod', src: 'Fizz p.80 · Mech p.119', var: 'drod' },
    { text: 'Bore rounded up to the next standard size (Table b-1 push force ≥ thrust at the operating pressure); for pull deduct the rod; if the rod is not offered for that bore, take a larger bore', src: 'Fizz p.84 · Mech p.118 · Mech p.122', var: 'dbore' },
    { text: 'Extension flow uses the full bore (rod = 0): Q = v_p A_p (12/231) gpm', src: 'Fizz p.84 · Mech p.123', var: 'Q' },
    { text: 'Maximum line velocity 15 ft/s ("we always use"); take the smallest pipe that meets it', src: 'Fizz p.85 · Mech p.123', var: 'vmax' },
    { text: 'Schedule 80 pipe ("just assume Schedule 80" — the proper schedule depends on pressure and material)', src: 'Fizz p.85', var: 'sched' },
    { text: 'Motor horsepower HP = Q p/(1714 × 0.85) — 0.85 is the assumed pump efficiency (Parker Table c-1)', src: 'Fizz p.88 · Mech p.123', var: 'eff' },
    { text: 'Next standard 3-phase motor (industrial supply); voltage and starter details chosen arbitrarily', src: 'Fizz p.88 · Mech p.123 · Mech p.124', var: 'HPmotor' },
    { text: 'Hydraulic power P = pQ/1714 (no efficiency) with 1 in³/s = 60/231 gpm; accumulators are not calculated in this course', src: 'Fizz pp.89–91', var: 'Phyd' },
  ],

  figures: [
    { id: 'keyeq', ref: 'Esposito §6.10 key equations', title: 'Esposito Ch. 6 key equations 6-1 … 6-11: cylinder force, velocity, power (US & SI), lever classes, cushion deceleration and pressure', src: 'figures/course/fluid_esposito_6-10_key_equations.png', book: 'course', note: 'Fluid Power Practice Problems.pdf p.1. HP = vF/550 = Q p/1714; kW = v F = Q p (m³/s × kPa).' },
    { id: 'nonregen', ref: 'Fizz p.77 non-regen circuit', title: 'Basic non-regenerative circuit: pump, relief valve, 4-way valve, cylinder', src: 'figures/bibles/fizz_p77_nonregen_circuit.png', book: 'Fizz bible', note: 'Push uses full bore area; retraction is faster and weaker because the rod occupies part of the bore.' },
    { id: 'regen', ref: 'Fizz p.77 regen circuit (Fig. 13-22)', title: 'Regenerative circuit: rod-end fluid is returned to the cap end on extension', src: 'figures/bibles/fizz_p77_regen_circuit.png', book: 'Fizz bible', note: 'Push force = p × rod area; the rod/annulus area ratio sets the push/pull speed and force ratio. Equal if A1 = A2.' },
    { id: 'areas', ref: 'Fizz p.83 piston areas', title: 'Piston areas: A1 = annulus (bore − rod), A2 = rod area', src: 'figures/bibles/fizz_p83_piston_areas.png', book: 'Fizz bible' },
    { id: 'lever', ref: 'Parker b-18 levers & toggle', title: 'Cylinder applications: 1st/2nd/3rd-class levers, toggle, straight-line motions; toggle force T = F·A/(2B) with worked example (8300 lb, A = 14 in, B = ½ in → 116 200 lb)', src: 'figures/course/fluid_parker_b18_lever_toggle.png', book: 'course' },
    { id: 'pwrfac', ref: 'Parker b-19 power & chord factors', title: 'Effective thrust of a cylinder working at angle A to the lever (power factor = sin A, Table b-11); stroke for a hinged lever by chord factor (Table b-12)', src: 'figures/course/fluid_parker_b19_power_chord_factor.png', book: 'course', note: 'Example: 3.25-in bore at 1000 psi → 8300 lb; at 65° effective thrust = 8300 × 0.906 = 7520 lb.' },
    { id: 'crane', ref: 'Parker b-20 cranes & beams', title: 'Crane / boom: only the thrust component at right angles to the beam turns it; moments about the fulcrum; heavy-beam example', src: 'figures/course/fluid_parker_b20_crane_beam.png', book: 'course', note: 'Add 10–15 % to the cylinder thrust for friction losses.' },
    { id: 'lever2', ref: 'Parker b-21 rotary & 2nd-class lever', title: 'Rotary motion T = 4FR (four cylinders); second-class lever F cos φ (d1 + d2) = Load · d1, φ within ±15° → cos φ ≈ 1; example 4000 lb, d1 = 10, d2 = 20 → F = 1333 lb → 2.7 in² at 500 psi → 2-in bore', src: 'figures/course/fluid_parker_b21_rotary_second_class_lever.png', book: 'course' },
    { id: 'gchart', ref: 'Mech p.122 g-chart (Parker Graph b-2)', title: 'g — acceleration force factor vs. velocity (ft/min) and distance s (in); load-case formulas top-left', src: 'figures/bibles/mech_p122_accel_force_factor_chart.png', book: 'Mech bible', note: 'Horizontal: (1) F = Wg, (2) F = Wg + f, (3) F = Wg − f. Vertical: (4) F = Wg + W (accelerate up / decelerate down), (5) F = Wg − W. Formula: g = 0.0000517 v²/s. Parker example: 6000 lb, 120 ft/min in ½ in → g = 1.50, F = 9000 lb (9900 lb with f = 900 lb).' },
    { id: 'gchart2', ref: 'Fizz p.79 g-chart', title: 'Acceleration force factor chart (Fizz copy with s-lines marked)', src: 'figures/bibles/fizz_p79_accel_force_factor_chart.png', book: 'Fizz bible' },
    { id: 'kfac', ref: 'Fizz p.80 stroke-factor table (Parker Table b-4)', title: 'Piston rod — stroke selection table: mounting style → stroke factor k', src: 'figures/bibles/fizz_p80_stroke_factor_table.png', book: 'Fizz bible', note: 'I fixed & rigidly guided 0.50; II pivoted & rigidly guided 0.70; III supported, not rigidly guided 2.00; IV trunnion on head 1.00; V intermediate trunnion 1.50; VI trunnion on cap / clevis 2.00.' },
    { id: 'rodchart', ref: 'Mech p.119 rod chart (Parker Graph b-1)', title: 'Piston rod — stroke selection graph: thrust (lb) vs basic length (in) → minimum rod diameter', src: 'figures/bibles/mech_p119_rod_selection_chart.png', book: 'Mech bible', note: 'Enter thrust on the x-axis and basic length on the y-axis; the first curve to the right/above gives the rod. Standard rods: 5/8, 1, 1⅜, 1¾, 2, 2½, 3, 3½, 4, 4½, 5, 5½ in.' },
    { id: 'rodchart2', ref: 'Fizz p.81 rod chart', title: 'Rod selection graph (Fizz copy)', src: 'figures/bibles/fizz_p81_rod_selection_chart.png', book: 'Fizz bible' },
    { id: 'forceus', ref: 'Fizz p.82 force table (Parker Table b-1)', title: 'Theoretical push-stroke force (lb) by bore and pressure; deduct the rod row for pull; displacement per inch of stroke', src: 'figures/bibles/fizz_p82_push_pull_forces_us.png', book: 'Fizz bible', note: 'Standard bores: 1, 1½, 2, 2½, 3¼, 4, 5, 6, 7, 8, 10, 12, 14 in. Pull force = push force of bore − push force of rod diameter.' },
    { id: 'forcesi', ref: 'Fizz p.83 SI force table (Parker Table b-2)', title: 'Cylinder push force in newtons at various pressures in bar', src: 'figures/bibles/fizz_p83_push_forces_si.png', book: 'Fizz bible' },
    { id: 'pumpf', ref: 'Parker i-8 pump formulas', title: 'Hydraulic pump calculation formulas: GPM = rpm × d/231, volumetric / mechanical / overall efficiency, Hp = GPM × PSI/(1714 × eff), Hp = T·rpm/63 025, power = 231 Q p/12 ft·lb/min', src: 'figures/course/fluid_parker_i8_pump_formulas.png', book: 'course' },
    { id: 'pumpx', ref: 'Parker i-9 pump sizing examples', title: 'Pump sizing: 10–25 % pressure margin; hand-pump strokes; GPM = A·L·60/(231·t): 5-in piston at 2 in/s → 10.1 gpm; 5-in bore × 2-in rod × 18-in stroke, 12-s cycle → 14 gpm', src: 'figures/course/fluid_parker_i9_pump_sizing_examples.png', book: 'course' },
    { id: 'pipe', ref: 'Fizz p.85 pipe table', title: 'Pipe OD and inside diameter for schedule 40 / 80 / 160 (Method 1)', src: 'figures/bibles/fizz_p85_pipe_schedule_table.png', book: 'Fizz bible', note: 'Schedule 40 low pressure, 80 medium, 160 high. Fizz: assume schedule 80 unless told otherwise.' },
    { id: 'flowa', ref: 'Fizz p.86 flow table (a) (Parker Table b-5)', title: 'Fluid displacement at 10 ft/min piston speed and fluid velocity through extra-heavy pipe (Method 2)', src: 'figures/bibles/fizz_p86_flow_velocity_table_a.png', book: 'Fizz bible', note: 'Mech guide: Q_true = (piston speed / 10) × Q_table; pipe velocity × (speed/10) must be < 15 ft/s. Use rod = 0 for extension.' },
    { id: 'flowb', ref: 'Fizz p.87 flow table (b)', title: 'Flow & velocity table continued', src: 'figures/bibles/fizz_p87_flow_velocity_table_b.png', book: 'Fizz bible' },
    { id: 'hp', ref: 'Fizz p.88 motor HP table (Parker Table c-1)', title: 'Motor horsepower required to drive a hydraulic pump vs gpm and psi (85 % efficiency)', src: 'figures/bibles/fizz_p88_motor_hp_table.png', book: 'Fizz bible', note: 'HP = GPM × PSI / (1714 × 0.85). At 4000 psi double the 2000 psi column.' },
    { id: 'starters', ref: 'Fizz p.89 motor-starter table (Parker c-5)', title: 'Three-phase and single-phase motor starter tables (standard HP ratings)', src: 'figures/bibles/fizz_p89_motor_starters.png', book: 'Fizz bible', note: 'Industrial: choose a 3-phase motor; voltage is arbitrary for this course.' },
    { id: 'cushion', ref: 'Esposito Example 6-6 (Fig. 6-17)', title: 'Cylinder cushion problem: 1500 lb, 18.2 gpm, 3-in piston, 1-in cushion plunger, 0.75-in cushion, p1 = 750 psi, CF = 0.12 → p2 = 856 psi', src: 'figures/course/fluid_esposito_ex6-6_cushion.png', book: 'course' },
    { id: 'seqsym', ref: 'Fizz p.90 sequence valve', title: 'Sequence valve symbol', src: 'figures/bibles/fizz_p90_sequence_valve_symbol.png', book: 'Fizz bible' },
    { id: 'seqckt', ref: 'Fizz p.90 sequence circuit', title: 'Two cylinders sequenced with sequence valves and check valves', src: 'figures/bibles/fizz_p90_sequence_circuit.png', book: 'Fizz bible' },
    { id: 'symdir', ref: 'Mech p.125 directional valves', title: 'Directional control valve envelopes: ports blocked / flow paths', src: 'figures/bibles/mech_p125_directional_valve_symbols.png', book: 'Mech bible' },
    { id: 'symchk', ref: 'Mech p.125 check valves', title: 'Check valves, pilot-operated to open / close', src: 'figures/bibles/mech_p125_check_valve_symbols.png', book: 'Mech bible' },
    { id: 'sym2w', ref: 'Mech p.126 2-way valves', title: 'Two-way valves, normally closed / normally open', src: 'figures/bibles/mech_p126_two_way_valve_symbols.png', book: 'Mech bible' },
    { id: 'sym4w', ref: 'Mech p.127 4-way valve', title: '3-position 4-way valve: normal, actuated left, actuated right', src: 'figures/bibles/mech_p127_four_way_three_position.png', book: 'Mech bible' },
    { id: 'symrel', ref: 'Mech p.127 relief valve', title: 'Pressure relief valve symbol, normal and relieving', src: 'figures/bibles/mech_p127_pressure_relief_symbol.png', book: 'Mech bible' },
    { id: 'symred', ref: 'Mech p.128 reducing valve', title: 'Pressure reducing valve symbol', src: 'figures/bibles/mech_p128_pressure_reducing_symbol.png', book: 'Mech bible' },
  ],

  sections: [
    { title: 'Step 1: Inputs — pressure, stroke, circuit', steps: [
      { id: 'in', title: 'Given data and circuit type', fig: ['nonregen', 'regen', 'areas', 'seqckt', 'symdir', 'sym4w', 'symrel'],
        text: 'Relief (pump) pressure — assume 1000 psi if not given (Mech guide). Parker (b-6, i-9): pick the pump/motor for <b>10–25 % more pressure than needed at the cylinder</b> to cover line losses — e.g. a 1000-psi pump sized with 750 psi at a 4-in cylinder. Enter that allowance as a percentage (0 if the problem gives the pressure <i>at the cylinder</i>). Choose regular (non-regenerative) or regenerative circuit and whether the design stroke is push or pull. Valve symbols (sequence, directional, relief, reducing, check) are in the figure panel — sequence valves open only above a set pressure so cylinders actuate in order; accumulators store pressure like capacitors (no calculation required in this course).',
        vars: [
          { id: 'p', symbol: 'p_{pump}', label: 'Pump / relief-valve pressure', unit: 'psi', kind: 'input', default: 1000 },
          { id: 'loss', symbol: '\\%', label: 'Line-loss allowance (Parker: 10–25 %)', unit: '%', kind: 'input', default: 0, hint: '0 = pressure given at the cylinder; 25 → 1000 psi pump gives 750 psi at the cylinder' },
          { id: 'pcyl', symbol: 'p', label: 'Working pressure at the cylinder', unit: 'psi', kind: 'calc', compute: v => H.has(v, 'p', 'loss') ? v.p * (1 - v.loss / 100) : undefined,
            work: v => H.has(v, 'pcyl') && v.loss > 0 ? '\\(p = ' + H.fmt(v.p) + '(1 - ' + H.fmt(v.loss / 100) + ') = ' + H.fmt(v.pcyl) + '\\ \\text{psi}\\)' : null },
          { id: 'L', symbol: 'L', label: 'Stroke length', unit: 'in', kind: 'input' },
          { id: 'circuit', label: 'Circuit', kind: 'choice', type: 'text', options: [{ label: 'Regular (non-regenerative)', value: 'regular' }, { label: 'Regenerative', value: 'regen' }], default: 'regular' },
          { id: 'mode', label: 'Design stroke', kind: 'choice', type: 'text', options: [{ label: 'Push (extend)', value: 'push' }, { label: 'Pull (retract)', value: 'pull' }], default: 'push' },
        ] },
    ] },

    { title: 'Step 2: Load on the cylinder (Parker b-6/b-7, Esposito 6-21 … 6-27)', steps: [
      { id: 'lever', title: 'If the cylinder drives a lever: cylinder force from the load (Esposito 6-7 … 6-9, Parker b-21)', fig: ['keyeq', 'lever', 'lever2', 'pwrfac'],
        formula: '\\text{1st: } F_{cyl} = \\frac{L_2}{L_1\\cos\\phi}F_{load} \\qquad \\text{2nd: } F_{cyl} = \\frac{L_2}{(L_1+L_2)\\cos\\phi}F_{load} \\qquad \\text{3rd: } F_{cyl} = \\frac{L_1+L_2}{L_2\\cos\\phi}F_{load}',
        text: 'Optional — skip if the cylinder pushes the load directly. φ is the angle between the cylinder axis and the perpendicular to the lever (Parker: cos φ ≈ 1 while φ is within ±15°). 1st class: fulcrum between cylinder (arm L<sub>1</sub>) and load (arm L<sub>2</sub>). 2nd class: load at L<sub>2</sub> from the fulcrum, cylinder at L<sub>1</sub> + L<sub>2</sub> (Parker b-21: F cos φ (d<sub>1</sub>+d<sub>2</sub>) = Load·d<sub>1</sub>). 3rd class: cylinder at L<sub>2</sub>, load at L<sub>1</sub> + L<sub>2</sub>. Practice problem 6-25: F<sub>load</sub> = 4444 N, L<sub>1</sub> = L<sub>2</sub>, φ = 0 → 4444 / 2222 / 8888 N. Copy F<sub>cyl</sub> into "Weight of load" below (with load case Static) if the lever load is the only force.',
        vars: [
          { id: 'lclass', label: 'Lever class', kind: 'choice', options: [{ label: '1st class — fulcrum between cylinder and load', value: 1 }, { label: '2nd class — load between fulcrum and cylinder', value: 2 }, { label: '3rd class — cylinder between fulcrum and load', value: 3 }], default: 2 },
          { id: 'Fload', symbol: 'F_{load}', label: 'Load on the lever', unit: 'lb (or N)', kind: 'input' },
          { id: 'L1', symbol: 'L_1', label: 'Lever arm L1', unit: 'in (any unit)', kind: 'input' },
          { id: 'L2', symbol: 'L_2', label: 'Lever arm L2', unit: 'in (same unit)', kind: 'input' },
          { id: 'phi', symbol: '\\phi', label: 'Cylinder angle from the lever normal', unit: '°', kind: 'input', default: 0 },
          { id: 'Fcyl', symbol: 'F_{cyl}', label: 'Cylinder force required', unit: 'lb (or N)', kind: 'calc', compute: v => { if (!H.has(v, 'Fload', 'L1', 'L2', 'phi')) return undefined; const c = Math.cos(H.rad(v.phi)); if (c <= 0) return undefined;
              return v.lclass === 1 ? v.L2 / (v.L1 * c) * v.Fload : v.lclass === 3 ? (v.L1 + v.L2) / (v.L2 * c) * v.Fload : v.L2 / ((v.L1 + v.L2) * c) * v.Fload; },
            work: v => H.has(v, 'Fcyl') ? '\\(F_{cyl} = ' + ({ 1: '\\dfrac{' + H.fmt(v.L2) + '}{' + H.fmt(v.L1) + '\\cos ' + H.fmt(v.phi) + '^\\circ}', 2: '\\dfrac{' + H.fmt(v.L2) + '}{(' + H.fmt(v.L1) + ' + ' + H.fmt(v.L2) + ')\\cos ' + H.fmt(v.phi) + '^\\circ}', 3: '\\dfrac{' + H.fmt(v.L1) + ' + ' + H.fmt(v.L2) + '}{' + H.fmt(v.L2) + '\\cos ' + H.fmt(v.phi) + '^\\circ}' })[v.lclass] + '(' + H.fmt(v.Fload) + ') = ' + H.fmt(v.Fcyl) + '\\)' : null },
        ] },
      { id: 'crane', title: 'Crane boom (Parker b-20, Esposito 6-27)', fig: ['crane', 'lever2'],
        formula: 'F_{cyl}\\,d_1\\sin\\beta = W\\,(d_1+d_2)\\cos\\alpha',
        text: 'Optional. Only the thrust component perpendicular to the boom turns it (moments about the pivot): β = angle between cylinder and boom, α = boom angle above horizontal, d<sub>1</sub> = pivot-to-cylinder distance along the boom, d<sub>1</sub>+d<sub>2</sub> = pivot-to-load. Practice problem 6-27 (Fig. 6-27: 2000 lb, 2.5 ft + 5 ft, boom 45°, cylinder 75° → β = 30°) → 8480 lb. Parker b-20 adds 10–15 % to the thrust for friction.',
        vars: [
          { id: 'Wc', symbol: 'W', label: 'Crane load', unit: 'lb', kind: 'input' },
          { id: 'd1', symbol: 'd_1', label: 'Pivot → cylinder attachment (along boom)', unit: 'ft or in', kind: 'input' },
          { id: 'd2', symbol: 'd_2', label: 'Cylinder attachment → load (along boom)', unit: 'same unit', kind: 'input' },
          { id: 'alpha', symbol: '\\alpha', label: 'Boom angle above horizontal', unit: '°', kind: 'input' },
          { id: 'beta', symbol: '\\beta', label: 'Angle between cylinder and boom', unit: '°', kind: 'input' },
          { id: 'Fcr', symbol: 'F_{cyl}', label: 'Crane cylinder thrust', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'Wc', 'd1', 'd2', 'alpha', 'beta') && Math.sin(H.rad(v.beta)) > 0 ? v.Wc * (v.d1 + v.d2) * Math.cos(H.rad(v.alpha)) / (v.d1 * Math.sin(H.rad(v.beta))) : undefined,
            work: v => H.has(v, 'Fcr') ? '\\(F_{cyl} = \\dfrac{' + H.fmt(v.Wc) + '(' + H.fmt(v.d1) + ' + ' + H.fmt(v.d2) + ')\\cos ' + H.fmt(v.alpha) + '^\\circ}{' + H.fmt(v.d1) + '\\sin ' + H.fmt(v.beta) + '^\\circ} = ' + H.fmt(v.Fcr) + '\\ \\text{lb}\\)' : null },
        ] },
      { id: 'toggle', title: 'Toggle mechanism and cylinder working at an angle (Parker b-18 / b-19)', fig: ['lever', 'pwrfac'],
        formula: 'T_{toggle} = \\frac{F\\,A}{2B} \\qquad F_{eff} = F\\sin A',
        text: 'Optional. Toggle (Parker b-18): T = F·A/(2B), A = toggle lever length, B = offset from vertical; example 8300 lb, A = 14 in, B = ½ in → 116 200 lb. Angled cylinder (Parker b-19): effective thrust = F × sin(angle A between cylinder and lever) — the "power factor"; 8300 lb at 65° → 7520 lb.',
        vars: [
          { id: 'Ftog', symbol: 'F', label: 'Cylinder thrust', unit: 'lb', kind: 'input' },
          { id: 'Atog', symbol: 'A', label: 'Toggle lever length', unit: 'in', kind: 'input' },
          { id: 'Btog', symbol: 'B', label: 'Toggle offset from vertical', unit: 'in', kind: 'input' },
          { id: 'Ttog', symbol: 'T', label: 'Toggle force', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'Ftog', 'Atog', 'Btog') && v.Btog > 0 ? v.Ftog * v.Atog / (2 * v.Btog) : undefined,
            work: v => H.has(v, 'Ttog') ? '\\(T = \\dfrac{' + H.fmt(v.Ftog) + '(' + H.fmt(v.Atog) + ')}{2(' + H.fmt(v.Btog) + ')} = ' + H.fmt(v.Ttog) + '\\ \\text{lb}\\)' : null },
          { id: 'angA', symbol: 'A', label: 'Angle between cylinder and lever', unit: '°', kind: 'input', default: 90 },
          { id: 'Feff', symbol: 'F_{eff}', label: 'Effective thrust F sin A', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'Ftog', 'angA') ? v.Ftog * Math.sin(H.rad(v.angA)) : undefined },
        ] },
      { id: 'load', title: 'Weight, friction and load case', fig: ['gchart', 'gchart2', 'keyeq'],
        formula: 'F_f = \\mu F_w\\ (\\text{horizontal}) \\qquad \\text{incline: } F = W(\\sin\\theta + \\mu\\cos\\theta) + W g',
        text: 'Parker Graph b-2 load cases: (1) horizontal accelerate/decelerate F = Wg; (2) accelerate and overcome friction F = Wg + f; (3) decelerate against friction F = Wg − f; (4) vertical accelerate up / decelerate down F = Wg + W; (5) accelerate down / decelerate up F = Wg − W. (6) Incline (Esposito 6-21/6-23): the weight component along the slope W sin θ plus friction μ W cos θ. Practice problems: 6-21 (5000 lb on 30°, 3-in piston, no friction) → 354 psi; 6-23 (6000 lb up 30°, μ = 0.15, 1000 psi) → 2.19-in piston.',
        vars: [
          { id: 'Fw', symbol: 'F_w', label: 'Weight of load W', unit: 'lb', kind: 'input', hint: 'or the lever / crane cylinder force from above' },
          { id: 'mu', symbol: '\\mu', label: 'Coefficient of friction (if given)', kind: 'input', default: 0 },
          { id: 'theta', symbol: '\\theta', label: 'Incline angle (case 6 only)', unit: '°', kind: 'input', default: 30 },
          { id: 'Ffg', symbol: 'F_{f,given}', label: 'Friction force if given directly', unit: 'lb', kind: 'input' },
          { id: 'loadcase', label: 'Load case (chart formula)', kind: 'choice', type: 'text', options: [{ label: '(1) Horizontal: F = Wg', value: 'h1' }, { label: '(2) Horizontal, accelerate + friction: F = Wg + f', value: 'h2' }, { label: '(3) Horizontal, decelerate with friction: F = Wg − f', value: 'h3' }, { label: '(4) Vertical up (accel up / decel down): F = Wg + W — Fizz default F = F_w + F_f + F_a', value: 'v4' }, { label: '(5) Vertical down (accel down / decel up): F = Wg − W', value: 'v5' }, { label: '(6) Up an incline: F = W(sin θ + μ cos θ) + Wg', value: 'inc' }, { label: 'Static only: F = W + f (no acceleration)', value: 'static' }], default: 'v4' },
          { id: 'Ff', symbol: 'F_f', label: 'Friction force', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'Ffg') ? v.Ffg : (H.has(v, 'Fw', 'mu') ? (v.loadcase === 'inc' && H.has(v, 'theta') ? v.mu * v.Fw * Math.cos(H.rad(v.theta)) : v.mu * v.Fw) : undefined),
            work: v => (!H.has(v, 'Ffg') && H.has(v, 'Ff') && v.mu > 0) ? '\\(F_f = ' + H.fmt(v.mu) + '(' + H.fmt(v.Fw) + ')' + (v.loadcase === 'inc' ? '\\cos ' + H.fmt(v.theta) + '^\\circ' : '') + ' = ' + H.fmt(v.Ff) + '\\ \\text{lb}\\)' : null },
        ] },
      { id: 'force', title: 'Acceleration force factor g → total thrust', fig: ['gchart', 'gchart2'],
        formula: 'g = \\frac{v^2}{s}(0.0000517) \\qquad F_a = F_w\\,g \\qquad F = F_a \\pm W \\pm F_f\\ (\\text{by load case})',
        text: 'v in ft/min (the speed reached), s in inches (distance over which it is reached). Parker worked example (b-6): 6000 lb to 120 ft/min in ½ in → g = 1.50 (formula 1.49), F = 9000 lb; with f = 900 lb → 9900 lb. Leave v and s blank (or choose Static) when there is no acceleration.',
        vars: [
          { id: 'v', symbol: 'v', label: 'Velocity to reach', unit: 'ft/min', kind: 'input' },
          { id: 's', symbol: 's', label: 'Distance to reach it', unit: 'in', kind: 'input' },
          { id: 'g', symbol: 'g', label: 'Acceleration force factor', kind: 'lookup', fig: 'gchart', auto: v => H.has(v, 'v', 's') && v.s > 0 ? v.v * v.v / v.s * 0.0000517 : (v.loadcase === 'static' || !H.has(v, 'v') ? 0 : undefined), hint: 'Graph b-2, or auto = 0.0000517 v²/s (0 when no acceleration)' },
          { id: 'Fa', symbol: 'F_a', label: 'Acceleration force Wg', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'Fw', 'g') ? v.Fw * v.g : undefined,
            work: v => H.has(v, 'v', 's', 'g', 'Fw') && v.g > 0 ? '\\(g = \\dfrac{' + H.fmt(v.v) + '^2}{' + H.fmt(v.s) + '}(0.0000517) = ' + H.fmt(v.g, 4) + ',\\quad F_a = ' + H.fmt(v.Fw) + '(' + H.fmt(v.g, 4) + ') = ' + H.fmt(v.Fa) + '\\)' : null },
          { id: 'F', symbol: 'F', label: 'Total thrust (force on piston)', unit: 'lb', kind: 'calc', compute: v => { if (!H.has(v, 'Fw', 'Ff')) return undefined; const Fa = v.Fa === undefined ? 0 : v.Fa;
              switch (v.loadcase) { case 'h1': return Fa; case 'h2': return Fa + v.Ff; case 'h3': return Fa - v.Ff; case 'v4': return Fa + v.Fw + v.Ff; case 'v5': return Fa - v.Fw + v.Ff; case 'inc': return H.has(v, 'theta') ? Fa + v.Fw * Math.sin(H.rad(v.theta)) + v.Ff : undefined; default: return v.Fw + v.Ff; } },
            work: v => H.has(v, 'F') ? '\\(F = ' + ({ h1: 'W g', h2: 'W g + f', h3: 'W g - f', v4: 'W g + W + f', v5: 'W g - W + f', inc: 'W g + W\\sin\\theta + \\mu W\\cos\\theta', static: 'W + f' })[v.loadcase] + ' = ' + H.fmt(v.F) + '\\ \\text{lb}\\)' : null,
            check: v => (v.F !== undefined && v.F <= 0) ? 'Thrust ≤ 0 — the load drives itself; size for the other stroke' : null },
        ] },
    ] },

    { title: 'Step 3–4: Basic length and minimum rod diameter (buckling, Parker b-4 … b-6)', steps: [
      { id: 'Lb', title: 'Stroke factor and basic length', fig: ['kfac'], formula: 'L_b = k\\,L',
        vars: [
          { id: 'mount', label: 'Mounting style (case)', kind: 'choice', type: 'text', options: [{ label: 'I — fixed and rigidly guided (k = 0.50)', value: 'I' }, { label: 'II — pivoted and rigidly guided (0.70)', value: 'II' }, { label: 'III — supported but not rigidly guided (2.00)', value: 'III' }, { label: 'IV — trunnion on head, pivoted & guided (1.00)', value: 'IV' }, { label: 'V — intermediate trunnion (1.50)', value: 'V' }, { label: 'VI — trunnion on cap / clevis on cap (2.00)', value: 'VI' }], default: 'I' },
          { id: 'k', symbol: 'k', label: 'Stroke factor', kind: 'lookup', fig: 'kfac', auto: v => KFAC[v.mount], hint: 'Parker Table b-4 (auto from the mounting case)' },
          { id: 'Lb', symbol: 'L_b', label: 'Basic length', unit: 'in', kind: 'calc', compute: v => H.has(v, 'k', 'L') ? v.k * v.L : undefined, work: v => H.has(v, 'Lb') ? '\\(L_b = ' + H.fmt(v.k) + '(' + H.fmt(v.L) + ') = ' + H.fmt(v.Lb) + '\\ \\text{in}\\)' : null },
        ] },
      { id: 'rod', title: 'Minimum rod diameter from the rod-selection graph', fig: ['rodchart', 'rodchart2'],
        text: 'Enter thrust F (x-axis) and basic length Lb (y-axis); read the rod-diameter curve at or above the point and round <b>up</b> to a standard rod. (Instructor note on the practice problems: "add rod diameter selection by adding extension = 12 or 16 inches".) A regenerative circuit or push/pull balancing may need a bigger rod than this minimum.',
        vars: [
          { id: 'drodmin', symbol: 'd_{rod,min}', label: 'Rod diameter read from chart', unit: 'in', kind: 'lookup', fig: 'rodchart', hint: 'Graph b-1; standard: ⅝, 1, 1⅜, 1¾, 2, 2½, 3, 3½, 4, 4½, 5, 5½' },
          { id: 'drod', symbol: 'd_{rod}', label: 'Rod diameter selected (standard)', unit: 'in', kind: 'lookup', fig: 'forceus', auto: v => H.has(v, 'drodmin') ? nextStd(v.drodmin, ROD_STD) : undefined, hint: 'auto = next standard rod ≥ chart minimum',
            check: v => (H.has(v, 'drod', 'drodmin') && v.drod < v.drodmin) ? 'Smaller than the chart minimum — buckling risk' : (H.has(v, 'drod') && !ROD_STD.includes(v.drod) ? 'Not a standard rod size' : null) },
        ] },
    ] },

    { title: 'Step 5: Bore from working pressure (Parker Table b-1, Esposito 6-1/6-3)', steps: [
      { id: 'bore', title: 'Required bore for the design stroke, F = pA', fig: ['forceus', 'forcesi', 'areas', 'keyeq'],
        formula: 'A_1 = \\tfrac{\\pi}{4}(d_b^2 - d_r^2),\\; A_2 = \\tfrac{\\pi}{4}d_r^2 \\qquad F_{push} = p(A_1+A_2)\\ [\\text{regen: } pA_2],\\quad F_{pull} = pA_1',
        text: 'Regular push: d<sub>bore</sub> = √(4F/πp). Pull (either circuit): d<sub>bore</sub> = √(4F/πp + d<sub>rod</sub>²). Regenerative push: the force is set by the rod, d<sub>rod</sub> ≥ √(4F/πp) — the bore then only sets the pull force / speed ratio. Round the bore up to a standard size (or read the push/pull force table). p is the pressure <i>at the cylinder</i> (after the loss allowance).',
        vars: [
          { id: 'dreq', symbol: 'd_{req}', label: 'Required diameter for the design stroke', unit: 'in', kind: 'calc', digits: 4, compute: v => { if (!H.has(v, 'F', 'pcyl') || v.F <= 0) return undefined; const base = 4 * v.F / (Math.PI * v.pcyl);
              if (v.mode === 'pull') return H.has(v, 'drod') ? Math.sqrt(base + v.drod * v.drod) : undefined; return Math.sqrt(base); },
            work: v => H.has(v, 'dreq') ? (v.mode === 'pull' ? '\\(d_{bore} = \\sqrt{\\dfrac{4(' + H.fmt(v.F) + ')}{\\pi(' + H.fmt(v.pcyl) + ')} + ' + H.fmt(v.drod) + '^2} = ' + H.fmt(v.dreq, 4) + '\\)' : '\\(d_{' + (v.circuit === 'regen' ? 'rod' : 'bore') + '} = \\sqrt{\\dfrac{4(' + H.fmt(v.F) + ')}{\\pi(' + H.fmt(v.pcyl) + ')}} = ' + H.fmt(v.dreq, 4) + '\\)') : null,
            hint: 'regen push: this is the required ROD diameter' },
          { id: 'dbore', symbol: 'd_{bore}', label: 'Bore selected (standard)', unit: 'in', kind: 'lookup', fig: 'forceus', auto: v => { if (v.circuit === 'regen' && v.mode === 'push') return H.has(v, 'drod') ? nextStd(v.drod * 1.001 + 0.25, BORE_STD) : undefined; return H.has(v, 'dreq') ? nextStd(v.dreq, BORE_STD) : undefined; },
            hint: 'Table b-1 standard bores: 1, 1½, 2, 2½, 3¼, 4, 5, 6, 7, 8, 10, 12, 14', check: v => (H.has(v, 'dbore', 'drod') && v.dbore <= v.drod) ? 'Bore must exceed the rod' : (H.has(v, 'dbore') && !BORE_STD.includes(v.dbore) ? 'Not a standard bore' : null) },
          { id: 'A1', symbol: 'A_1', label: 'Annulus area', unit: 'in²', kind: 'calc', digits: 4, compute: v => H.has(v, 'dbore', 'drod') ? A(v.dbore) - A(v.drod) : undefined },
          { id: 'A2', symbol: 'A_2', label: 'Rod area', unit: 'in²', kind: 'calc', digits: 4, compute: v => H.has(v, 'drod') ? A(v.drod) : undefined },
          { id: 'Fpush', symbol: 'F_{push}', label: 'Rated push force at p', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'pcyl', 'A1', 'A2') ? v.pcyl * (v.circuit === 'regen' ? v.A2 : v.A1 + v.A2) : undefined,
            work: v => H.has(v, 'Fpush') ? '\\(F_{push} = ' + H.fmt(v.pcyl) + '(' + (v.circuit === 'regen' ? H.fmt(v.A2, 4) : H.fmt(v.A1 + v.A2, 4)) + ') = ' + H.fmt(v.Fpush) + '\\)' : null },
          { id: 'Fpull', symbol: 'F_{pull}', label: 'Rated pull force at p', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'pcyl', 'A1') ? v.pcyl * v.A1 : undefined },
          { id: 'ratio', symbol: 'F_{push}/F_{pull}', label: 'Push / pull force ratio', kind: 'calc', digits: 3, compute: v => H.has(v, 'Fpush', 'Fpull') && v.Fpull > 0 ? v.Fpush / v.Fpull : undefined },
          { id: 'preq', symbol: 'p_{req}', label: 'Pressure actually needed for F with chosen sizes', unit: 'psi', kind: 'calc', compute: v => { if (!H.has(v, 'F', 'A1', 'A2')) return undefined; const Aeff = v.mode === 'pull' ? v.A1 : (v.circuit === 'regen' ? v.A2 : v.A1 + v.A2); return Aeff > 0 ? v.F / Aeff : undefined; } },
        ],
        after: v => { if (!H.has(v, 'F', 'Fpush', 'Fpull')) return ''; const rated = v.mode === 'pull' ? v.Fpull : v.Fpush;
          return rated >= v.F ? '<span class="result-ok">Rated ' + v.mode + ' force ' + H.fmt(rated) + ' lb ≥ required thrust ' + H.fmt(v.F) + ' lb at ' + H.fmt(v.pcyl) + ' psi (needs only ' + H.fmt(v.preq) + ' psi).</span>' : '<span class="result-bad">Rated ' + v.mode + ' force ' + H.fmt(rated) + ' lb &lt; required ' + H.fmt(v.F) + ' lb — larger bore' + (v.circuit === 'regen' && v.mode === 'push' ? ' / rod' : '') + ' or higher pressure (' + H.fmt(v.preq) + ' psi).</span>' + (v.circuit === 'regen' ? ' Regenerative: equal push/pull needs A1 = A2, i.e. d<sub>bore</sub> = √2 d<sub>rod</sub>.' : ''); } },
    ] },

    { title: 'Step 6: Extension / retraction check of a cylinder (Esposito 6-1 … 6-5; practice problems 6-15 … 6-19)', steps: [
      { id: 'ecyl', title: 'Cylinder, flow and load (US or SI)', fig: ['keyeq', 'areas'],
        formula: 'A_p = \\tfrac{\\pi}{4}d_b^2 \\qquad A_r = \\tfrac{\\pi}{4}d_r^2',
        text: 'Esposito-style analysis of a <i>given</i> cylinder: blank fields default to the bore, rod, pump flow and thrust chosen above (US only). For the metric practice problems switch to SI and enter mm, m³/s and N (6-17M: 40 mm bore, 20 mm rod, 0.0016 m³/s, 5000 N → 3.98 MPa, 1.27 m/s, 6.37 kW extending; 5.31 MPa, 1.70 m/s, 8.50 kW retracting). 6-15E: 3-in bore, 1.5-in rod, 8 gpm in → 6.00 gpm out while extending.',
        vars: [
          { id: 'eunits', label: 'Units', kind: 'choice', type: 'text', options: [{ label: 'US: in, gpm, lb → psi, ft/s, hp', value: 'US' }, { label: 'SI: mm, m³/s, N → MPa, m/s, kW', value: 'SI' }], default: 'US' },
          { id: 'edb', symbol: 'd_b', label: 'Bore (piston) diameter', unit: 'in / mm', kind: 'input', auto: v => ESI(v) ? undefined : v.dbore, hint: 'blank = selected bore' },
          { id: 'edr', symbol: 'd_r', label: 'Rod diameter', unit: 'in / mm', kind: 'input', auto: v => ESI(v) ? undefined : v.drod, hint: 'blank = selected rod' },
          { id: 'eQ', symbol: 'Q_{in}', label: 'Flow into the cylinder', unit: 'gpm / m³/s', kind: 'input', auto: v => ESI(v) ? undefined : v.Q, hint: 'blank = pump flow from step 7' },
          { id: 'eF', symbol: 'F', label: 'Load (same for both strokes)', unit: 'lb / N', kind: 'input', auto: v => ESI(v) ? undefined : v.F, hint: 'blank = total thrust from step 2' },
          { id: 'eAp', symbol: 'A_p', label: 'Piston area', unit: 'in² / m²', kind: 'calc', digits: 5, compute: eAp },
          { id: 'eAr', symbol: 'A_r', label: 'Rod area', unit: 'in² / m²', kind: 'calc', digits: 5, compute: eAr },
        ] },
      { id: 'eext', title: 'Extension and retraction: pressure, velocity, power', eq: 'Esposito 6-1 … 6-5', fig: ['keyeq'],
        formula: 'p_{ext} = \\frac{F}{A_p},\\; v_{ext} = \\frac{Q_{in}}{A_p} \\qquad p_{ret} = \\frac{F}{A_p - A_r},\\; v_{ret} = \\frac{Q_{in}}{A_p - A_r} \\qquad HP = \\frac{v\\,F}{550} = \\frac{Q\\,p}{1714},\\quad kW = vF = Qp',
        text: 'US: v (ft/s) = Q(gpm)·231/(60·12·A); HP = v(ft/s)·F(lb)/550 = Q(gpm)·p(psi)/1714. SI: v = Q/A, kW = v(m/s)·F(kN) = Q(m³/s)·p(kPa). Q<sub>out</sub> during extension = Q<sub>in</sub>(A<sub>p</sub> − A<sub>r</sub>)/A<sub>p</sub>.',
        vars: [
          { id: 'epext', symbol: 'p_{ext}', label: 'Pressure needed to extend', unit: 'psi / MPa', kind: 'calc', digits: 4, compute: v => H.has(v, 'eF', 'eAp') ? v.eF / v.eAp / (ESI(v) ? 1e6 : 1) : undefined,
            work: v => H.has(v, 'epext') ? '\\(p_{ext} = \\dfrac{' + H.fmt(v.eF) + '}{' + H.fmt(v.eAp, 5) + '} = ' + H.fmt(v.epext) + (ESI(v) ? '\\ \\text{MPa}' : '\\ \\text{psi}') + '\\)' : null },
          { id: 'evext', symbol: 'v_{ext}', label: 'Extension velocity', unit: 'ft/s / m/s', kind: 'calc', digits: 4, compute: v => H.has(v, 'eQ', 'eAp') ? (ESI(v) ? v.eQ / v.eAp : v.eQ * 231 / 60 / 12 / v.eAp) : undefined,
            work: v => H.has(v, 'evext') ? (ESI(v) ? '\\(v_{ext} = ' + H.fmt(v.eQ) + '/' + H.fmt(v.eAp, 5) + ' = ' + H.fmt(v.evext) + '\\ \\text{m/s}\\)' : '\\(v_{ext} = \\dfrac{' + H.fmt(v.eQ) + '(231)/(60 \\cdot 12)}{' + H.fmt(v.eAp, 4) + '} = ' + H.fmt(v.evext) + '\\ \\text{ft/s}\\)') : null },
          { id: 'ePext', symbol: 'P_{ext}', label: 'Power while extending', unit: 'hp / kW', kind: 'calc', digits: 4, compute: v => H.has(v, 'evext', 'eF') ? (ESI(v) ? v.evext * v.eF / 1000 : v.evext * v.eF / 550) : undefined,
            work: v => H.has(v, 'ePext') ? (ESI(v) ? '\\(P = ' + H.fmt(v.evext) + '(' + H.fmt(v.eF / 1000) + '\\ \\text{kN}) = ' + H.fmt(v.ePext) + '\\ \\text{kW}\\)' : '\\(HP = \\dfrac{' + H.fmt(v.evext) + '(' + H.fmt(v.eF) + ')}{550} = ' + H.fmt(v.ePext) + '\\ \\text{hp}\\)') : null },
          { id: 'eQout', symbol: 'Q_{out}', label: 'Flow leaving the rod end while extending', unit: 'gpm / m³/s', kind: 'calc', digits: 4, compute: v => H.has(v, 'eQ', 'eAp', 'eAr') ? v.eQ * (v.eAp - v.eAr) / v.eAp : undefined },
          { id: 'epret', symbol: 'p_{ret}', label: 'Pressure needed to retract', unit: 'psi / MPa', kind: 'calc', digits: 4, compute: v => H.has(v, 'eF', 'eAp', 'eAr') && v.eAp > v.eAr ? v.eF / (v.eAp - v.eAr) / (ESI(v) ? 1e6 : 1) : undefined,
            work: v => H.has(v, 'epret') ? '\\(p_{ret} = \\dfrac{' + H.fmt(v.eF) + '}{' + H.fmt(v.eAp, 5) + ' - ' + H.fmt(v.eAr, 5) + '} = ' + H.fmt(v.epret) + (ESI(v) ? '\\ \\text{MPa}' : '\\ \\text{psi}') + '\\)' : null },
          { id: 'evret', symbol: 'v_{ret}', label: 'Retraction velocity', unit: 'ft/s / m/s', kind: 'calc', digits: 4, compute: v => H.has(v, 'eQ', 'eAp', 'eAr') && v.eAp > v.eAr ? (ESI(v) ? v.eQ / (v.eAp - v.eAr) : v.eQ * 231 / 60 / 12 / (v.eAp - v.eAr)) : undefined },
          { id: 'ePret', symbol: 'P_{ret}', label: 'Power while retracting', unit: 'hp / kW', kind: 'calc', digits: 4, compute: v => H.has(v, 'evret', 'eF') ? (ESI(v) ? v.evret * v.eF / 1000 : v.evret * v.eF / 550) : undefined },
        ],
        after: v => H.has(v, 'epext', 'epret') ? '<span>Retraction needs ' + H.fmt(v.epret / v.epext, 3) + '× the extension pressure and runs ' + H.fmt(v.evret / v.evext, 3) + '× as fast (same Q). ' + (H.has(v, 'pcyl') && !ESI(v) ? (Math.max(v.epext, v.epret) <= v.pcyl ? '<span class="result-ok">Both ≤ ' + H.fmt(v.pcyl) + ' psi available at the cylinder.</span>' : '<span class="result-bad">Exceeds the ' + H.fmt(v.pcyl) + ' psi available at the cylinder on at least one stroke.</span>') : '') + '</span>' : '' },
    ] },

    { title: 'Step 7: Pump flow rate (Parker i-8 / i-9)', steps: [
      { id: 'flow', title: 'Pump capacity Q for the required piston speed', fig: ['flowa', 'flowb', 'pumpx'],
        formula: 'Q = v_p A_p \\frac{12}{231}\\ \\text{gpm}\\quad(v_p\\ \\text{ft/min},\\ A_p\\ \\text{in}^2) \\qquad \\text{Mech: } Q_{true} = \\frac{v_p}{10}\\,Q_{table}',
        text: 'Regular circuit: push uses the full bore area, pull the annulus. Regenerative: push uses the rod area (fluid recirculates), pull the annulus. The pump must deliver the larger of the two if both speeds are specified. Speed in ft/min (in/s × 5). Parker i-9 example: 5-in piston at 2 in/s (10 ft/min) → 19.6 × 10 × 12/231 = 10.1 gpm.',
        vars: [
          { id: 'vp', symbol: 'v_p', label: 'Required piston speed', unit: 'ft/min', kind: 'input', hint: 'blank → uses v from step 2' },
          { id: 'vpu', symbol: 'v_{p}', label: 'Piston speed used', unit: 'ft/min', kind: 'calc', compute: v => H.has(v, 'vp') ? v.vp : v.v },
          { id: 'Qpush', symbol: 'Q_{push}', label: 'Flow for push at vp', unit: 'gpm', kind: 'calc', digits: 4, compute: v => H.has(v, 'vpu', 'A1', 'A2') ? v.vpu * (v.circuit === 'regen' ? v.A2 : v.A1 + v.A2) * 12 / 231 : undefined,
            work: v => H.has(v, 'Qpush') ? '\\(Q_{push} = ' + H.fmt(v.vpu) + '(' + H.fmt(v.circuit === 'regen' ? v.A2 : v.A1 + v.A2, 4) + ')\\dfrac{12}{231} = ' + H.fmt(v.Qpush, 4) + '\\ \\text{gpm}\\)' : null },
          { id: 'Qpull', symbol: 'Q_{pull}', label: 'Flow for pull at vp', unit: 'gpm', kind: 'calc', digits: 4, compute: v => H.has(v, 'vpu', 'A1') ? v.vpu * v.A1 * 12 / 231 : undefined },
          { id: 'Q', symbol: 'Q', label: 'Pump flow for the design stroke', unit: 'gpm', kind: 'calc', digits: 4, compute: v => v.mode === 'pull' ? v.Qpull : v.Qpush },
          { id: 'tstroke', symbol: 't', label: 'Time for one stroke at vp', unit: 's', kind: 'calc', digits: 4, compute: v => H.has(v, 'L', 'vpu') && v.vpu > 0 ? v.L / (12 * v.vpu) * 60 : undefined },
          { id: 'vother', symbol: 'v_{other}', label: 'Speed of the other stroke with this pump', unit: 'ft/min', kind: 'calc', digits: 4, compute: v => { if (!H.has(v, 'Q', 'A1', 'A2')) return undefined; const Ao = v.mode === 'pull' ? (v.circuit === 'regen' ? v.A2 : v.A1 + v.A2) : v.A1; return Ao > 0 ? v.Q * 231 / (12 * Ao) : undefined; } },
        ] },
      { id: 'pump', title: 'Pump from a cycle time, displacement and efficiencies (Parker i-8 / i-9)', fig: ['pumpf', 'pumpx'],
        formula: 'Q_{cycle} = \\frac{(A_{bore} + A_{annulus})\\,L \\cdot 60}{231\\,t_{cycle}} \\qquad Q_{theor} = \\frac{d\\ (\\text{in}^3/\\text{rev})\\,n}{231} \\qquad \\eta_v = \\frac{Q_{actual}}{Q_{theor}}',
        text: 'Optional. If the problem gives a <b>total cycle time</b> (out and back) instead of a speed, Parker sizes the pump from the oil volume per cycle: 5-in bore, 2-in rod, 18-in stroke, 12-s cycle → 36.1 × 18 × 60/(231 × 12) = 14 gpm. The required displacement of a pump turning at n rpm follows from GPM = n·d/231 with the volumetric efficiency.',
        vars: [
          { id: 'tcyc', symbol: 't_{cycle}', label: 'Total cycle time (extend + retract)', unit: 's', kind: 'input' },
          { id: 'Qcyc', symbol: 'Q_{cycle}', label: 'Pump flow for that cycle time', unit: 'gpm', kind: 'calc', digits: 4, compute: v => H.has(v, 'tcyc', 'A1', 'A2', 'L') && v.tcyc > 0 ? (v.A1 + v.A2 + v.A1) * v.L * 60 / (231 * v.tcyc) : undefined,
            work: v => H.has(v, 'Qcyc') ? '\\(Q = \\dfrac{(' + H.fmt(v.A1 + v.A2, 4) + ' + ' + H.fmt(v.A1, 4) + ')(' + H.fmt(v.L) + ')(60)}{231(' + H.fmt(v.tcyc) + ')} = ' + H.fmt(v.Qcyc, 4) + '\\ \\text{gpm}\\)' : null },
          { id: 'rpm', symbol: 'n', label: 'Pump shaft speed', unit: 'rpm', kind: 'input', hint: 'industrial: 1800 or 1200 rpm' },
          { id: 'etav', symbol: '\\eta_v', label: 'Volumetric efficiency', kind: 'input', default: 1, hint: 'Q_actual / Q_theoretical' },
          { id: 'disp', symbol: 'd', label: 'Required pump displacement', unit: 'in³/rev', kind: 'calc', digits: 4, compute: v => { const Qn = H.has(v, 'Qcyc') ? Math.max(v.Qcyc, v.Q || 0) : v.Q; return H.has(v, 'rpm', 'etav') && Qn !== undefined && v.rpm > 0 && v.etav > 0 ? 231 * Qn / (v.rpm * v.etav) : undefined; },
            work: v => H.has(v, 'disp') ? '\\(d = \\dfrac{231\\,Q}{n\\,\\eta_v} = \\dfrac{231(' + H.fmt(H.has(v, 'Qcyc') ? Math.max(v.Qcyc, v.Q || 0) : v.Q, 4) + ')}{' + H.fmt(v.rpm) + '(' + H.fmt(v.etav) + ')} = ' + H.fmt(v.disp, 4) + '\\ \\text{in}^3/\\text{rev}\\)' : null },
        ],
        after: v => H.has(v, 'Qcyc', 'Q') ? '<span>Pump must deliver the larger of Q<sub>cycle</sub> = ' + H.fmt(v.Qcyc, 3) + ' gpm and the speed-based Q = ' + H.fmt(v.Q, 3) + ' gpm → <b>' + H.fmt(Math.max(v.Qcyc, v.Q), 3) + ' gpm</b> (the pipe and motor steps use the speed-based Q; overwrite v<sub>p</sub> above if the cycle governs).</span>' : '' },
    ] },

    { title: 'Step 8–10: Pipe sizing (Parker b-8: ≤ 15 ft/s)', steps: [
      { id: 'pipe', title: 'Minimum pipe diameter for 15 ft/s, then a standard pipe', fig: ['pipe', 'flowa', 'flowb'],
        formula: 'd_p = \\sqrt{\\frac{4Q}{\\pi v}\\cdot\\frac{231}{720}} \\quad (v = 15\\ \\text{ft/s},\\ Q\\ \\text{gpm}) \\qquad v_{act} = \\frac{Q\\,(231/60)}{12\\,(\\pi d_{ID}^2/4)}',
        text: 'Method 1 (Fizz): schedule by pressure (40 low, 80 medium, 160 high — assume 80), pick the first inside diameter ≥ d<sub>p</sub> in the pipe table. Method 2 (Mech / Parker Table b-5): read the fluid velocity column for the bore/rod at 10 ft/min, scale by v<sub>p</sub>/10 and keep it below 15 ft/s.',
        vars: [
          { id: 'vmax', symbol: 'v_{max}', label: 'Max fluid velocity', unit: 'ft/s', kind: 'input', default: 15 },
          { id: 'dpmin', symbol: 'd_{p,min}', label: 'Minimum pipe inside diameter', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'Q', 'vmax') && v.vmax > 0 ? Math.sqrt(4 * v.Q / (Math.PI * v.vmax) * 231 / 720) : undefined,
            work: v => H.has(v, 'dpmin') ? '\\(d_p = \\sqrt{\\dfrac{4(' + H.fmt(v.Q, 4) + ')}{\\pi(' + H.fmt(v.vmax) + ')}\\cdot\\dfrac{231}{720}} = ' + H.fmt(v.dpmin, 4) + '\\ \\text{in}\\)' : null },
          { id: 'sched', label: 'Pipe schedule', kind: 'choice', options: [{ label: 'Schedule 40 — low pressure', value: 40 }, { label: 'Schedule 80 — medium (default)', value: 80 }, { label: 'Schedule 160 — high pressure', value: 160 }], default: 80 },
          { id: 'nom', label: 'Nominal pipe size', kind: 'lookup', type: 'text', fig: 'pipe', hint: 'first table ID ≥ dp,min (auto pick shown below)', auto: v => { const pk = pipePick(v); return pk ? pk.nom : undefined; } },
          { id: 'dID', symbol: 'd_{ID}', label: 'Pipe inside diameter', unit: 'in', kind: 'lookup', fig: 'pipe', hint: 'auto = ID of the table pick', auto: v => { const pk = pipePick(v); return pk ? pk.id : undefined; } },
          { id: 'vact', symbol: 'v_{act}', label: 'Actual fluid velocity', unit: 'ft/s', kind: 'calc', digits: 4, compute: v => H.has(v, 'Q', 'dID') && v.dID > 0 ? v.Q * 231 / 60 / (12 * A(v.dID)) : undefined },
        ],
        after: v => { const pk = pipePick(v); let s = pk ? '<span>Table pick: <b>' + pk.nom + ' in nominal, schedule ' + v.sched + '</b> (ID ' + H.fmt(pk.id) + ' in).</span> ' : '';
          if (H.has(v, 'vact', 'vmax')) s += v.vact <= v.vmax ? '<span class="result-ok">Fluid velocity ' + H.fmt(v.vact, 3) + ' ft/s ≤ ' + H.fmt(v.vmax) + ' ft/s — OK.</span>' : '<span class="result-bad">Fluid velocity ' + H.fmt(v.vact, 3) + ' ft/s &gt; ' + H.fmt(v.vmax) + ' — next pipe size.</span>'; return s; } },
    ] },

    { title: 'Step 11–12: Motor horsepower (Parker Table c-1)', steps: [
      { id: 'hp', title: 'Pump drive power and standard motor', fig: ['hp', 'starters', 'pumpf'],
        formula: 'HP = \\frac{Q\\,p_{pump}}{1714\\,\\eta} \\qquad (\\eta = 0.85) \\qquad\\text{Parker Basics: } HP = 0.000583\\,Q\\,p',
        text: 'Uses the pump (relief) pressure, not the reduced cylinder pressure. Table c-1 is built from HP = GPM × PSI/(1714 × 0.85); at 4000 psi double the 2000-psi column. Parker i-8 also gives HP = T·n/63 025 for a motor-torque check.',
        vars: [
          { id: 'eff', symbol: '\\eta', label: 'Pump / drive efficiency', kind: 'input', default: 0.85 },
          { id: 'HP', symbol: 'HP', label: 'Required horsepower', unit: 'hp', kind: 'calc', digits: 4, compute: v => H.has(v, 'Q', 'p', 'eff') && v.eff > 0 ? v.Q * v.p / (1714 * v.eff) : undefined,
            work: v => H.has(v, 'HP') ? '\\(HP = \\dfrac{' + H.fmt(v.Q, 4) + '(' + H.fmt(v.p) + ')}{1714(' + H.fmt(v.eff) + ')} = ' + H.fmt(v.HP, 4) + '\\ \\text{hp}\\)' : null },
          { id: 'HPmotor', symbol: 'HP_{motor}', label: 'Standard motor selected', unit: 'hp', kind: 'lookup', fig: 'starters', auto: v => H.has(v, 'HP') ? nextStd(v.HP, MOTOR_HP) : undefined, hint: 'auto = next standard size; choose 3-phase for industrial' },
          { id: 'Phyd', symbol: 'P_{hyd}', label: 'Hydraulic power delivered pQ/1714', unit: 'hp', kind: 'calc', digits: 4, compute: v => H.has(v, 'Q', 'p') ? v.Q * v.p / 1714 : undefined },
          { id: 'Tmot', symbol: 'T', label: 'Motor torque at the pump speed (if n given)', unit: 'lb·in', kind: 'calc', digits: 4, compute: v => H.has(v, 'HP', 'rpm') && v.rpm > 0 ? 63025 * v.HP / v.rpm : undefined },
        ] },
    ] },

    { title: 'Step 13: Cushion deceleration pressure (Esposito 6-10 / 6-11, Parker b-7)', steps: [
      { id: 'cush', title: 'Pressure developed in the cushion while stopping the load', eq: 'Esposito 6-10, 6-11', fig: ['cushion', 'keyeq'],
        formula: 'a = \\frac{v^2}{2S} \\qquad p_2 = \\frac{(W/g)\\,a + p_1 A_{piston} - (CF)\\,W}{A_{piston} - A_{cushion\\ plunger}}',
        text: 'Optional check (Example 6-6): the fluid trapped by the cushion plunger must stop the moving mass <i>and</i> resist the pump pressure p<sub>1</sub> still acting on the full piston; friction CF·W helps. v is the steady piston speed before the cushion (ft/s = ft/min ÷ 60), S the cushion length. Example 6-6: 1500 lb, 18.2 gpm into a 3-in piston (0.83 ft/s), 1-in plunger, S = 0.75 in, p<sub>1</sub> = 750 psi, CF = 0.12 → a = 5.51 ft/s², p<sub>2</sub> = 856 psi — the cylinder must be rated for 856 psi, not the 750-psi relief setting. Parker b-7 does the same with the g-chart: 6000 lb, 120 ft/min, 1-in cushion → g = 0.74, F = Wg − f = 3540 lb, plus 750 psi × 19.64 in² = 14 730 lb → 18 270 lb on the 16.5-in² annulus = 1107 psi.',
        vars: [
          { id: 'dbc', symbol: 'd_{piston}', label: 'Piston (bore) diameter', unit: 'in', kind: 'input', auto: v => v.dbore, hint: 'blank = selected bore' },
          { id: 'dcp', symbol: 'd_{plunger}', label: 'Cushion plunger diameter', unit: 'in', kind: 'input', hint: 'given; Parker: rod diameter (annulus)' },
          { id: 'Wcu', symbol: 'W', label: 'Weight being stopped (load + piston/rod)', unit: 'lb', kind: 'input', auto: v => v.Fw, hint: 'blank = load weight' },
          { id: 'CF', symbol: 'CF', label: 'Coefficient of friction', kind: 'input', auto: v => v.mu, hint: 'blank = μ from step 2' },
          { id: 'vc', symbol: 'v', label: 'Piston speed entering the cushion', unit: 'ft/min', kind: 'input', auto: v => v.vpu, hint: 'blank = piston speed; = Q·231/(60·12·A) from the flow' },
          { id: 'Sc', symbol: 'S', label: 'Cushion length (deceleration distance)', unit: 'in', kind: 'input' },
          { id: 'p1', symbol: 'p_1', label: 'Pressure on the piston (relief setting)', unit: 'psi', kind: 'input', auto: v => v.pcyl, hint: 'blank = cylinder working pressure' },
          { id: 'ac', symbol: 'a', label: 'Deceleration', unit: 'ft/s²', kind: 'calc', digits: 4, compute: v => H.has(v, 'vc', 'Sc') && v.Sc > 0 ? Math.pow(v.vc / 60, 2) / (2 * v.Sc / 12) : undefined,
            work: v => H.has(v, 'ac') ? '\\(a = \\dfrac{(' + H.fmt(v.vc / 60, 3) + '\\ \\text{ft/s})^2}{2(' + H.fmt(v.Sc) + '/12\\ \\text{ft})} = ' + H.fmt(v.ac, 4) + '\\ \\text{ft/s}^2\\)' : null },
          { id: 'p2', symbol: 'p_2', label: 'Cushion pressure', unit: 'psi', kind: 'calc', digits: 4, compute: v => H.has(v, 'dbc', 'dcp', 'Wcu', 'CF', 'ac', 'p1') && A(v.dbc) > A(v.dcp) ? (v.Wcu / 32.2 * v.ac + v.p1 * A(v.dbc) - v.CF * v.Wcu) / (A(v.dbc) - A(v.dcp)) : undefined,
            work: v => H.has(v, 'p2') ? '\\(p_2 = \\dfrac{(' + H.fmt(v.Wcu) + '/32.2)(' + H.fmt(v.ac, 4) + ') + ' + H.fmt(v.p1) + '(' + H.fmt(A(v.dbc), 4) + ') - ' + H.fmt(v.CF) + '(' + H.fmt(v.Wcu) + ')}{' + H.fmt(A(v.dbc), 4) + ' - ' + H.fmt(A(v.dcp), 4) + '} = ' + H.fmt(v.p2) + '\\ \\text{psi}\\)' : null },
        ],
        after: v => H.has(v, 'p2', 'p1') ? (v.p2 > v.p1 ? '<span class="result-bad">Cushion pressure ' + H.fmt(v.p2) + ' psi exceeds the ' + H.fmt(v.p1) + ' psi relief setting — the cylinder must be rated for ' + H.fmt(v.p2) + ' psi (non-shock rating).</span>' : '<span class="result-ok">Cushion pressure ' + H.fmt(v.p2) + ' psi ≤ relief setting ' + H.fmt(v.p1) + ' psi.</span>') : '' },
    ] },

    { title: 'Result', steps: [
      { id: 'result', title: 'Selected system and checks', fig: ['nonregen', 'regen', 'seqsym', 'seqckt', 'symchk', 'sym2w', 'symred'],
        text: 'Summary of the Parker sizing: cylinder, circuit, pump, pipe and motor. The checks are thrust (rated force ≥ required), pipe velocity (≤ 15 ft/s) and, if computed, the cushion pressure against the cylinder rating.',
        vars: [
          { id: 'HPreq', symbol: 'HP_{req}', label: 'Required motor power', unit: 'hp', kind: 'calc', digits: 4, compute: v => v.HP },
          { id: 'HPsel', symbol: 'HP_{motor}', label: 'Motor selected', unit: 'hp', kind: 'calc', compute: v => v.HPmotor },
        ],
        after: v => { if (!H.has(v, 'F', 'Fpush', 'Fpull')) return '<span>Complete steps 1–5 to get the result.</span>';
          const rated = v.mode === 'pull' ? v.Fpull : v.Fpush; const checks = [['thrust', rated >= v.F]];
          if (H.has(v, 'vact', 'vmax')) checks.push(['pipe velocity', v.vact <= v.vmax]); if (H.has(v, 'p2', 'p1')) checks.push(['cushion pressure', v.p2 <= v.p1]); if (H.has(v, 'HPmotor', 'HP')) checks.push(['motor', v.HPmotor >= v.HP]);
          const bad = checks.filter(c => !c[1]).map(c => c[0]);
          const sys = (H.has(v, 'dbore') ? H.fmt(v.dbore) + '-in bore × ' + H.fmt(v.drod) + '-in rod, ' : '') + (H.has(v, 'L') ? H.fmt(v.L) + '-in stroke, ' : '') + (v.circuit === 'regen' ? 'regenerative' : 'non-regenerative') + ' circuit; ' + H.fmt(v.p) + ' psi pump (' + H.fmt(v.pcyl) + ' psi at the cylinder); ' + (H.has(v, 'Q') ? 'pump ' + H.fmt(v.Q, 3) + ' gpm; ' : '') + (pipePick(v) ? pipePick(v).nom + '-in sch ' + v.sched + ' pipe; ' : '') + (H.has(v, 'HPmotor') ? H.fmt(v.HPmotor) + ' hp motor (required ' + H.fmt(v.HP, 3) + ' hp)' : '') + '.';
          return bad.length ? '<span class="result-bad"><b>FAIL</b> — ' + bad.join(', ') + ' check(s) not met. ' + sys + '</span>' : '<span class="result-ok"><b>PASS</b> — ' + sys + '</span>'; } },
    ] },
  ],
};
