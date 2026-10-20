// Standard sizes from the handbook tables reproduced in both student guides
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

window.TOPIC = {
  id: 'fluids', book: 'mott',
  title: 'Fluid Power — Hydraulic Cylinder, Pump, Pipe & Motor Sizing',
  subtitle: 'Fizz guide §3 (pp. 76–91) + Mech guide Unit 3 (pp. 116–128) merged · handbook tables from both guides',
  sibling: 'fluids_shigley.html',
  intro: '<b>Neither Shigley nor Mott covers fluid power</b>; this calculator follows the two student guides, which both work from the course "Design Engineers Handbook" tables (reproduced here, labelled by guide and page). The “Mott 6e” / “Shigley 11e” badges on this page are only the engine\'s two labels — every figure is from the guides. '
    + 'Procedure (union of both guides): load → acceleration force factor g (chart or g = 0.0000517 v²/s) → total thrust → stroke factor and basic length (mounting table) → minimum rod diameter (rod-selection chart) → bore from working pressure (push/pull force table or F = pA, regular or regenerative circuit) → pump flow (gpm) → pipe size (≤ 15 ft/s, schedule table) → motor horsepower → circuit-analysis helpers. US units throughout: lb, in, ft/min, psi, gpm, hp.',
  example: { p: 1000, L: 24, Fw: 5000, mu: 0.1, loadcase: 'v4', v: 50, s: 1, mount: 'I', drod: 1, circuit: 'regular', mode: 'push', dbore: 3.25, sched: 80, eff: 0.85 },

  figures: [
    { id: 'nonregen', ref: 'Fizz p.77 non-regen circuit', title: 'Basic non-regenerative circuit: pump, relief valve, 4-way valve, cylinder', src: 'figures/bibles/fizz_p77_nonregen_circuit.png', book: 'Fizz bible', note: 'Push uses full bore area; retraction is faster and weaker because the rod occupies part of the bore.' },
    { id: 'regen', ref: 'Fizz p.77 regen circuit (Fig. 13-22)', title: 'Regenerative circuit: rod-end fluid is returned to the cap end on extension', src: 'figures/bibles/fizz_p77_regen_circuit.png', book: 'Fizz bible', note: 'Push force = p × rod area; the rod/annulus area ratio sets the push/pull speed and force ratio. Equal if A1 = A2.' },
    { id: 'areas', ref: 'Fizz p.83 piston areas', title: 'Piston areas: A1 = annulus (bore − rod), A2 = rod area', src: 'figures/bibles/fizz_p83_piston_areas.png', book: 'Fizz bible' },
    { id: 'gchart', ref: 'Mech p.122 g-chart', title: 'g — acceleration force factor vs. velocity (ft/min) and distance s (in); load-case formulas top-left', src: 'figures/bibles/mech_p122_accel_force_factor_chart.png', book: 'Mech bible', note: 'Horizontal: (1) F = Wg, (2) F = Wg + f, (3) F = Wg − f. Vertical: (4) F = Wg + W (accelerate up / decelerate down), (5) F = Wg − W. Formula: g = 0.0000517 v²/s.' },
    { id: 'gchart2', ref: 'Fizz p.79 g-chart', title: 'Acceleration force factor chart (Fizz copy with s-lines marked)', src: 'figures/bibles/fizz_p79_accel_force_factor_chart.png', book: 'Fizz bible' },
    { id: 'kfac', ref: 'Fizz p.80 stroke-factor table', title: 'Piston rod — stroke selection table: mounting style → stroke factor k', src: 'figures/bibles/fizz_p80_stroke_factor_table.png', book: 'Fizz bible', note: 'I fixed & rigidly guided 0.50; II pivoted & rigidly guided 0.70; III supported, not rigidly guided 2.00; IV trunnion on head 1.00; V intermediate trunnion 1.50; VI trunnion on cap / clevis 2.00.' },
    { id: 'rodchart', ref: 'Mech p.119 rod chart', title: 'Piston rod — stroke selection graph: thrust (lb) vs basic length (in) → minimum rod diameter', src: 'figures/bibles/mech_p119_rod_selection_chart.png', book: 'Mech bible', note: 'Enter thrust on the x-axis and basic length on the y-axis; the first curve to the right/above gives the rod. Standard rods: 5/8, 1, 1⅜, 1¾, 2, 2½, 3, 3½, 4, 4½, 5, 5½ in.' },
    { id: 'rodchart2', ref: 'Fizz p.81 rod chart', title: 'Rod selection graph (Fizz copy)', src: 'figures/bibles/fizz_p81_rod_selection_chart.png', book: 'Fizz bible' },
    { id: 'forceus', ref: 'Fizz p.82 force table', title: 'Theoretical push-stroke force (lb) by bore and pressure; deduct the rod row for pull; displacement per inch of stroke', src: 'figures/bibles/fizz_p82_push_pull_forces_us.png', book: 'Fizz bible', note: 'Standard bores: 1, 1½, 2, 2½, 3¼, 4, 5, 6, 7, 8, 10, 12, 14 in. Pull force = push force of bore − push force of rod diameter.' },
    { id: 'forcesi', ref: 'Fizz p.83 SI force table', title: 'Cylinder push force in newtons at various pressures in bar', src: 'figures/bibles/fizz_p83_push_forces_si.png', book: 'Fizz bible' },
    { id: 'pipe', ref: 'Fizz p.85 pipe table', title: 'Pipe OD and inside diameter for schedule 40 / 80 / 160 (Method 1)', src: 'figures/bibles/fizz_p85_pipe_schedule_table.png', book: 'Fizz bible', note: 'Schedule 40 low pressure, 80 medium, 160 high. Fizz: assume schedule 80 unless told otherwise.' },
    { id: 'flowa', ref: 'Fizz p.86 flow table (a)', title: 'Fluid displacement at 10 ft/min piston speed and fluid velocity through extra-heavy pipe (Method 2)', src: 'figures/bibles/fizz_p86_flow_velocity_table_a.png', book: 'Fizz bible', note: 'Mech guide: Q_true = (piston speed / 10) × Q_table; pipe velocity × (speed/10) must be < 15 ft/s. Use rod = 0 for extension.' },
    { id: 'flowb', ref: 'Fizz p.87 flow table (b)', title: 'Flow & velocity table continued', src: 'figures/bibles/fizz_p87_flow_velocity_table_b.png', book: 'Fizz bible' },
    { id: 'hp', ref: 'Fizz p.88 motor HP table', title: 'Motor horsepower required to drive a hydraulic pump vs gpm and psi (85 % efficiency)', src: 'figures/bibles/fizz_p88_motor_hp_table.png', book: 'Fizz bible' },
    { id: 'starters', ref: 'Fizz p.89 motor-starter table', title: 'Three-phase and single-phase motor starter tables (standard HP ratings)', src: 'figures/bibles/fizz_p89_motor_starters.png', book: 'Fizz bible', note: 'Industrial: choose a 3-phase motor; voltage is arbitrary for this course.' },
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
    { title: 'Step 1: Load on the cylinder', steps: [
      { id: 'in', title: 'Given data and circuit type', fig: ['nonregen', 'regen', 'areas'],
        text: 'Relief (working) pressure — assume 1000 psi if not given (Mech guide). Choose regular (non-regenerative) or regenerative circuit and whether the design stroke is push or pull.',
        vars: [
          { id: 'p', symbol: 'p', label: 'Working / relief pressure', unit: 'psi', kind: 'input', default: 1000 },
          { id: 'L', symbol: 'L', label: 'Stroke length', unit: 'in', kind: 'input' },
          { id: 'circuit', label: 'Circuit', kind: 'choice', type: 'text', options: [{ label: 'Regular (non-regenerative)', value: 'regular' }, { label: 'Regenerative', value: 'regen' }], default: 'regular' },
          { id: 'mode', label: 'Design stroke', kind: 'choice', type: 'text', options: [{ label: 'Push (extend)', value: 'push' }, { label: 'Pull (retract)', value: 'pull' }], default: 'push' },
        ] },
      { id: 'force', title: 'Weight, friction, acceleration → total thrust', fig: ['gchart', 'gchart2'],
        formula: 'g = \\frac{v^2}{s}(0.0000517) \\qquad F_a = F_w\\,g \\qquad F = F_w(\\text{if vertical}) + F_f + F_a',
        text: 'v in ft/min (the speed reached), s in inches (distance over which it is reached). Friction F<sub>f</sub> = μ F<sub>w</sub> if a coefficient is given (horizontal load), otherwise enter it or leave 0. The chart\'s load cases: (1) horizontal accelerate/decelerate F = Wg; (2) accelerate and overcome friction F = Wg + f; (3) decelerate against friction F = Wg − f; (4) vertical accelerate up / decelerate down F = Wg + W; (5) accelerate down / decelerate up F = Wg − W.',
        vars: [
          { id: 'Fw', symbol: 'F_w', label: 'Weight of load W', unit: 'lb', kind: 'input' },
          { id: 'mu', symbol: '\\mu', label: 'Coefficient of friction (if given)', kind: 'input', default: 0 },
          { id: 'Ffg', symbol: 'F_{f,given}', label: 'Friction force if given directly', unit: 'lb', kind: 'input' },
          { id: 'loadcase', label: 'Load case (chart formula)', kind: 'choice', type: 'text', options: [{ label: '(1) Horizontal: F = Wg', value: 'h1' }, { label: '(2) Horizontal, accelerate + friction: F = Wg + f', value: 'h2' }, { label: '(3) Horizontal, decelerate with friction: F = Wg − f', value: 'h3' }, { label: '(4) Vertical up (accel up / decel down): F = Wg + W', value: 'v4' }, { label: '(5) Vertical down (accel down / decel up): F = Wg − W', value: 'v5' }, { label: 'Static only: F = W + f (no acceleration)', value: 'static' }], default: 'h2' },
          { id: 'v', symbol: 'v', label: 'Velocity to reach', unit: 'ft/min', kind: 'input' },
          { id: 's', symbol: 's', label: 'Distance to reach it', unit: 'in', kind: 'input' },
          { id: 'g', symbol: 'g', label: 'Acceleration force factor', kind: 'lookup', fig: 'gchart', auto: v => H.has(v, 'v', 's') && v.s > 0 ? v.v * v.v / v.s * 0.0000517 : (v.loadcase === 'static' ? 0 : undefined), hint: 'chart, or auto = 0.0000517 v²/s' },
          { id: 'Ff', symbol: 'F_f', label: 'Friction force', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'Ffg') ? v.Ffg : (H.has(v, 'Fw', 'mu') ? v.mu * v.Fw : undefined) },
          { id: 'Fa', symbol: 'F_a', label: 'Acceleration force Wg', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'Fw', 'g') ? v.Fw * v.g : undefined,
            work: v => H.has(v, 'v', 's', 'g', 'Fw') ? '\\(g = \\dfrac{' + H.fmt(v.v) + '^2}{' + H.fmt(v.s) + '}(0.0000517) = ' + H.fmt(v.g, 4) + ',\\quad F_a = ' + H.fmt(v.Fw) + '(' + H.fmt(v.g, 4) + ') = ' + H.fmt(v.Fa) + '\\)' : null },
          { id: 'F', symbol: 'F', label: 'Total thrust (force on piston)', unit: 'lb', kind: 'calc', compute: v => { if (!H.has(v, 'Fw', 'Ff')) return undefined; const Fa = v.Fa === undefined ? 0 : v.Fa;
              switch (v.loadcase) { case 'h1': return Fa; case 'h2': return Fa + v.Ff; case 'h3': return Fa - v.Ff; case 'v4': return Fa + v.Fw + v.Ff; case 'v5': return Fa - v.Fw + v.Ff; default: return v.Fw + v.Ff; } },
            work: v => H.has(v, 'F') ? '\\(F = ' + ({ h1: 'W g', h2: 'W g + f', h3: 'W g - f', v4: 'W g + W + f', v5: 'W g - W + f', static: 'W + f' })[v.loadcase] + ' = ' + H.fmt(v.F) + '\\ \\text{lb}\\)' : null,
            check: v => (v.F !== undefined && v.F <= 0) ? 'Thrust ≤ 0 — the load drives itself; size for the other stroke' : null },
        ] },
    ] },

    { title: 'Step 2–4: Basic length and minimum rod diameter (buckling)', steps: [
      { id: 'Lb', title: 'Stroke factor and basic length', fig: ['kfac'], formula: 'L_b = k\\,L',
        vars: [
          { id: 'mount', label: 'Mounting style (case)', kind: 'choice', type: 'text', options: [{ label: 'I — fixed and rigidly guided (k = 0.50)', value: 'I' }, { label: 'II — pivoted and rigidly guided (0.70)', value: 'II' }, { label: 'III — supported but not rigidly guided (2.00)', value: 'III' }, { label: 'IV — trunnion on head, pivoted & guided (1.00)', value: 'IV' }, { label: 'V — intermediate trunnion (1.50)', value: 'V' }, { label: 'VI — trunnion on cap / clevis on cap (2.00)', value: 'VI' }], default: 'I' },
          { id: 'k', symbol: 'k', label: 'Stroke factor', kind: 'lookup', fig: 'kfac', auto: v => KFAC[v.mount] },
          { id: 'Lb', symbol: 'L_b', label: 'Basic length', unit: 'in', kind: 'calc', compute: v => H.has(v, 'k', 'L') ? v.k * v.L : undefined, work: v => H.has(v, 'Lb') ? '\\(L_b = ' + H.fmt(v.k) + '(' + H.fmt(v.L) + ') = ' + H.fmt(v.Lb) + '\\ \\text{in}\\)' : null },
        ] },
      { id: 'rod', title: 'Minimum rod diameter from the rod-selection graph', fig: ['rodchart', 'rodchart2'],
        text: 'Enter thrust F (x-axis) and basic length Lb (y-axis); read the rod-diameter curve at or above the point and round <b>up</b> to a standard rod. A regenerative circuit or push/pull balancing may need a bigger rod than this minimum.',
        vars: [
          { id: 'drodmin', symbol: 'd_{rod,min}', label: 'Rod diameter read from chart', unit: 'in', kind: 'lookup', fig: 'rodchart', hint: 'standard: ⅝, 1, 1⅜, 1¾, 2, 2½, 3, 3½, 4, 4½, 5, 5½' },
          { id: 'drod', symbol: 'd_{rod}', label: 'Rod diameter selected (standard)', unit: 'in', kind: 'lookup', fig: 'forceus', auto: v => H.has(v, 'drodmin') ? nextStd(v.drodmin, ROD_STD) : undefined,
            check: v => (H.has(v, 'drod', 'drodmin') && v.drod < v.drodmin) ? 'Smaller than the chart minimum — buckling risk' : (H.has(v, 'drod') && !ROD_STD.includes(v.drod) ? 'Not a standard rod size' : null) },
        ] },
    ] },

    { title: 'Step 5: Bore from working pressure', steps: [
      { id: 'bore', title: 'Required bore for the design stroke, F = pA', fig: ['forceus', 'forcesi', 'areas'],
        formula: 'A_1 = \\tfrac{\\pi}{4}(d_b^2 - d_r^2),\\; A_2 = \\tfrac{\\pi}{4}d_r^2 \\qquad F_{push} = p(A_1+A_2)\\ [\\text{regen: } pA_2],\\quad F_{pull} = pA_1',
        text: 'Regular push: d<sub>bore</sub> = √(4F/πp). Pull (either circuit): d<sub>bore</sub> = √(4F/πp + d<sub>rod</sub>²). Regenerative push: the force is set by the rod, d<sub>rod</sub> ≥ √(4F/πp) — the bore then only sets the pull force / speed ratio. Round the bore up to a standard size (or read the push/pull force table).',
        vars: [
          { id: 'dreq', symbol: 'd_{req}', label: 'Required diameter for the design stroke', unit: 'in', kind: 'calc', digits: 4, compute: v => { if (!H.has(v, 'F', 'p') || v.F <= 0) return undefined; const base = 4 * v.F / (Math.PI * v.p);
              if (v.mode === 'pull') return H.has(v, 'drod') ? Math.sqrt(base + v.drod * v.drod) : undefined; if (v.circuit === 'regen') return Math.sqrt(base); return Math.sqrt(base); },
            work: v => H.has(v, 'dreq') ? (v.mode === 'pull' ? '\\(d_{bore} = \\sqrt{\\dfrac{4(' + H.fmt(v.F) + ')}{\\pi(' + H.fmt(v.p) + ')} + ' + H.fmt(v.drod) + '^2} = ' + H.fmt(v.dreq, 4) + '\\)' : '\\(d_{' + (v.circuit === 'regen' ? 'rod' : 'bore') + '} = \\sqrt{\\dfrac{4(' + H.fmt(v.F) + ')}{\\pi(' + H.fmt(v.p) + ')}} = ' + H.fmt(v.dreq, 4) + '\\)') : null,
            hint: 'regen push: this is the required ROD diameter' },
          { id: 'dbore', symbol: 'd_{bore}', label: 'Bore selected (standard)', unit: 'in', kind: 'lookup', fig: 'forceus', auto: v => { if (v.circuit === 'regen' && v.mode === 'push') return H.has(v, 'drod') ? nextStd(v.drod * 1.001 + 0.25, BORE_STD) : undefined; return H.has(v, 'dreq') ? nextStd(v.dreq, BORE_STD) : undefined; },
            hint: 'standard: 1, 1½, 2, 2½, 3¼, 4, 5, 6, 7, 8, 10, 12, 14', check: v => (H.has(v, 'dbore', 'drod') && v.dbore <= v.drod) ? 'Bore must exceed the rod' : (H.has(v, 'dbore') && !BORE_STD.includes(v.dbore) ? 'Not a standard bore' : null) },
          { id: 'A1', symbol: 'A_1', label: 'Annulus area', unit: 'in²', kind: 'calc', digits: 4, compute: v => H.has(v, 'dbore', 'drod') ? A(v.dbore) - A(v.drod) : undefined },
          { id: 'A2', symbol: 'A_2', label: 'Rod area', unit: 'in²', kind: 'calc', digits: 4, compute: v => H.has(v, 'drod') ? A(v.drod) : undefined },
          { id: 'Fpush', symbol: 'F_{push}', label: 'Rated push force at p', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'p', 'A1', 'A2') ? v.p * (v.circuit === 'regen' ? v.A2 : v.A1 + v.A2) : undefined,
            work: v => H.has(v, 'Fpush') ? '\\(F_{push} = ' + H.fmt(v.p) + '(' + (v.circuit === 'regen' ? H.fmt(v.A2, 4) : H.fmt(v.A1 + v.A2, 4)) + ') = ' + H.fmt(v.Fpush) + '\\)' : null },
          { id: 'Fpull', symbol: 'F_{pull}', label: 'Rated pull force at p', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'p', 'A1') ? v.p * v.A1 : undefined },
          { id: 'ratio', symbol: 'F_{push}/F_{pull}', label: 'Push / pull force ratio', kind: 'calc', digits: 3, compute: v => H.has(v, 'Fpush', 'Fpull') && v.Fpull > 0 ? v.Fpush / v.Fpull : undefined },
          { id: 'preq', symbol: 'p_{req}', label: 'Pressure actually needed for F with chosen sizes', unit: 'psi', kind: 'calc', compute: v => { if (!H.has(v, 'F', 'A1', 'A2')) return undefined; const Aeff = v.mode === 'pull' ? v.A1 : (v.circuit === 'regen' ? v.A2 : v.A1 + v.A2); return Aeff > 0 ? v.F / Aeff : undefined; } },
        ],
        after: v => { if (!H.has(v, 'F', 'Fpush', 'Fpull')) return ''; const rated = v.mode === 'pull' ? v.Fpull : v.Fpush;
          return rated >= v.F ? '<span class="result-ok">Rated ' + v.mode + ' force ' + H.fmt(rated) + ' lb ≥ required thrust ' + H.fmt(v.F) + ' lb at ' + H.fmt(v.p) + ' psi (needs only ' + H.fmt(v.preq) + ' psi).</span>' : '<span class="result-bad">Rated ' + v.mode + ' force ' + H.fmt(rated) + ' lb &lt; required ' + H.fmt(v.F) + ' lb — larger bore' + (v.circuit === 'regen' && v.mode === 'push' ? ' / rod' : '') + ' or higher pressure (' + H.fmt(v.preq) + ' psi).</span>' + (v.circuit === 'regen' ? ' Regenerative: equal push/pull needs A1 = A2, i.e. d<sub>bore</sub> = √2 d<sub>rod</sub>.' : ''); } },
    ] },

    { title: 'Step 6–7: Pump flow rate', steps: [
      { id: 'flow', title: 'Pump capacity Q for the required piston speed', fig: ['flowa', 'flowb'],
        formula: 'Q = v_p A_p \\frac{12}{231}\\ \\text{gpm}\\quad(v_p\\ \\text{ft/min},\\ A_p\\ \\text{in}^2) \\qquad \\text{Mech: } Q_{true} = \\frac{v_p}{10}\\,Q_{table}',
        text: 'Regular circuit: push uses the full bore area, pull the annulus. Regenerative: push uses the rod area (fluid recirculates), pull the annulus. The pump must deliver the larger of the two if both speeds are specified. Speed in ft/min (in/s × 5).',
        vars: [
          { id: 'vp', symbol: 'v_p', label: 'Required piston speed', unit: 'ft/min', kind: 'input', hint: 'blank → uses v from step 1' },
          { id: 'vpu', symbol: 'v_{p}', label: 'Piston speed used', unit: 'ft/min', kind: 'calc', compute: v => H.has(v, 'vp') ? v.vp : v.v },
          { id: 'Qpush', symbol: 'Q_{push}', label: 'Flow for push at vp', unit: 'gpm', kind: 'calc', digits: 4, compute: v => H.has(v, 'vpu', 'A1', 'A2') ? v.vpu * (v.circuit === 'regen' ? v.A2 : v.A1 + v.A2) * 12 / 231 : undefined,
            work: v => H.has(v, 'Qpush') ? '\\(Q_{push} = ' + H.fmt(v.vpu) + '(' + H.fmt(v.circuit === 'regen' ? v.A2 : v.A1 + v.A2, 4) + ')\\dfrac{12}{231} = ' + H.fmt(v.Qpush, 4) + '\\ \\text{gpm}\\)' : null },
          { id: 'Qpull', symbol: 'Q_{pull}', label: 'Flow for pull at vp', unit: 'gpm', kind: 'calc', digits: 4, compute: v => H.has(v, 'vpu', 'A1') ? v.vpu * v.A1 * 12 / 231 : undefined },
          { id: 'Q', symbol: 'Q', label: 'Pump flow for the design stroke', unit: 'gpm', kind: 'calc', digits: 4, compute: v => v.mode === 'pull' ? v.Qpull : v.Qpush },
          { id: 'tstroke', symbol: 't', label: 'Time for one stroke at vp', unit: 's', kind: 'calc', digits: 4, compute: v => H.has(v, 'L', 'vpu') && v.vpu > 0 ? v.L / (12 * v.vpu) * 60 : undefined },
          { id: 'vother', symbol: 'v_{other}', label: 'Speed of the other stroke with this pump', unit: 'ft/min', kind: 'calc', digits: 4, compute: v => { if (!H.has(v, 'Q', 'A1', 'A2')) return undefined; const Ao = v.mode === 'pull' ? (v.circuit === 'regen' ? v.A2 : v.A1 + v.A2) : v.A1; return Ao > 0 ? v.Q * 231 / (12 * Ao) : undefined; } },
        ] },
    ] },

    { title: 'Step 8–10: Pipe sizing', steps: [
      { id: 'pipe', title: 'Minimum pipe diameter for 15 ft/s, then a standard pipe', fig: ['pipe', 'flowa', 'flowb'],
        formula: 'd_p = \\sqrt{\\frac{4Q}{\\pi v}\\cdot\\frac{231}{720}} \\quad (v = 15\\ \\text{ft/s},\\ Q\\ \\text{gpm}) \\qquad v_{act} = \\frac{Q\\,(231/60)}{12\\,(\\pi d_{ID}^2/4)}',
        text: 'Method 1 (Fizz): schedule by pressure (40 low, 80 medium, 160 high — assume 80), pick the first inside diameter ≥ d<sub>p</sub> in the pipe table. Method 2 (Mech): read the fluid velocity column for the bore/rod at 10 ft/min, scale by v<sub>p</sub>/10 and keep it below 15 ft/s.',
        vars: [
          { id: 'vmax', symbol: 'v_{max}', label: 'Max fluid velocity', unit: 'ft/s', kind: 'input', default: 15 },
          { id: 'dpmin', symbol: 'd_{p,min}', label: 'Minimum pipe inside diameter', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'Q', 'vmax') && v.vmax > 0 ? Math.sqrt(4 * v.Q / (Math.PI * v.vmax) * 231 / 720) : undefined,
            work: v => H.has(v, 'dpmin') ? '\\(d_p = \\sqrt{\\dfrac{4(' + H.fmt(v.Q, 4) + ')}{\\pi(' + H.fmt(v.vmax) + ')}\\cdot\\dfrac{231}{720}} = ' + H.fmt(v.dpmin, 4) + '\\ \\text{in}\\)' : null },
          { id: 'sched', label: 'Pipe schedule', kind: 'choice', options: [{ label: 'Schedule 40 — low pressure', value: 40 }, { label: 'Schedule 80 — medium (default)', value: 80 }, { label: 'Schedule 160 — high pressure', value: 160 }], default: 80 },
          { id: 'nom', label: 'Nominal pipe size', kind: 'lookup', type: 'text', fig: 'pipe', hint: 'auto: first table ID ≥ dp,min', auto: undefined },
          { id: 'dID', symbol: 'd_{ID}', label: 'Pipe inside diameter', unit: 'in', kind: 'lookup', fig: 'pipe', auto: v => { const pk = pipePick(v); return pk ? pk.id : undefined; } },
          { id: 'vact', symbol: 'v_{act}', label: 'Actual fluid velocity', unit: 'ft/s', kind: 'calc', digits: 4, compute: v => H.has(v, 'Q', 'dID') && v.dID > 0 ? v.Q * 231 / 60 / (12 * A(v.dID)) : undefined },
        ],
        after: v => { const pk = pipePick(v); let s = pk ? '<span>Table pick: <b>' + pk.nom + ' in nominal, schedule ' + v.sched + '</b> (ID ' + H.fmt(pk.id) + ' in).</span> ' : '';
          if (H.has(v, 'vact', 'vmax')) s += v.vact <= v.vmax ? '<span class="result-ok">Fluid velocity ' + H.fmt(v.vact, 3) + ' ft/s ≤ ' + H.fmt(v.vmax) + ' ft/s — OK.</span>' : '<span class="result-bad">Fluid velocity ' + H.fmt(v.vact, 3) + ' ft/s &gt; ' + H.fmt(v.vmax) + ' — next pipe size.</span>'; return s; } },
    ] },

    { title: 'Step 11–12: Motor horsepower', steps: [
      { id: 'hp', title: 'Pump drive power and standard motor', fig: ['hp', 'starters'],
        formula: 'HP = \\frac{Q\\,p}{1714\\,\\eta} \\qquad (\\eta = 0.85)',
        vars: [
          { id: 'eff', symbol: '\\eta', label: 'Pump / drive efficiency', kind: 'input', default: 0.85 },
          { id: 'HP', symbol: 'HP', label: 'Required horsepower', unit: 'hp', kind: 'calc', digits: 4, compute: v => H.has(v, 'Q', 'p', 'eff') && v.eff > 0 ? v.Q * v.p / (1714 * v.eff) : undefined,
            work: v => H.has(v, 'HP') ? '\\(HP = \\dfrac{' + H.fmt(v.Q, 4) + '(' + H.fmt(v.p) + ')}{1714(' + H.fmt(v.eff) + ')} = ' + H.fmt(v.HP, 4) + '\\ \\text{hp}\\)' : null },
          { id: 'HPmotor', symbol: 'HP_{motor}', label: 'Standard motor selected', unit: 'hp', kind: 'lookup', fig: 'starters', auto: v => H.has(v, 'HP') ? nextStd(v.HP, MOTOR_HP) : undefined, hint: 'auto = next standard size; choose 3-phase for industrial' },
          { id: 'Phyd', symbol: 'P_{hyd}', label: 'Hydraulic power delivered pQ/1714', unit: 'hp', kind: 'calc', digits: 4, compute: v => H.has(v, 'Q', 'p') ? v.Q * v.p / 1714 : undefined },
        ],
        after: v => { if (!H.has(v, 'HPmotor')) return '';
          return '<span class="result-ok"><b>System:</b> ' + (H.has(v, 'dbore') ? H.fmt(v.dbore) + '-in bore × ' + H.fmt(v.drod) + '-in rod, ' : '') + (H.has(v, 'L') ? H.fmt(v.L) + '-in stroke, ' : '') + (v.circuit === 'regen' ? 'regenerative' : 'non-regenerative') + ' circuit at ' + H.fmt(v.p) + ' psi; pump ' + H.fmt(v.Q, 3) + ' gpm; ' + (pipePick(v) ? pipePick(v).nom + '-in sch ' + v.sched + ' pipe; ' : '') + H.fmt(v.HPmotor) + ' hp motor (required ' + H.fmt(v.HP, 3) + ' hp).</span>'; } },
    ] },

    { title: 'Circuit analysis helpers (Fizz §3.3)', steps: [
      { id: 'helpers', title: 'Flow, speed and power conversions for a given component', fig: ['seqsym', 'seqckt', 'symdir', 'symchk', 'sym2w', 'sym4w', 'symrel', 'symred'],
        formula: 'Q = A v \\qquad 1\\ \\text{in}^3/\\text{s} = \\frac{60}{231}\\ \\text{gpm} \\qquad \\text{Power} = \\frac{p\\,Q}{1714}\\ \\text{hp}',
        text: 'For analysing a given circuit: enter a pump flow and a cylinder area to get piston speed, or a pressure to get power. Sequence valves open only above a set pressure (so cylinders actuate in order); accumulators store pressure like capacitors (no calculation required in this course). Valve symbols are in the figure panel.',
        vars: [
          { id: 'Qg', symbol: 'Q_{given}', label: 'Pump / line flow', unit: 'gpm', kind: 'input' },
          { id: 'Ag', symbol: 'A', label: 'Area the flow acts on', unit: 'in²', kind: 'input', hint: 'full bore π d²/4 or annulus' },
          { id: 'vcalc', symbol: 'v', label: 'Piston speed', unit: 'in/s', kind: 'calc', digits: 4, compute: v => H.has(v, 'Qg', 'Ag') && v.Ag > 0 ? v.Qg * 231 / 60 / v.Ag : undefined },
          { id: 'vcalc2', symbol: 'v', label: 'Piston speed', unit: 'ft/min', kind: 'calc', digits: 4, compute: v => H.has(v, 'vcalc') ? v.vcalc * 5 : undefined },
          { id: 'pg', symbol: 'p', label: 'Line pressure', unit: 'psi', kind: 'input' },
          { id: 'Pg', symbol: 'P', label: 'Hydraulic power', unit: 'hp', kind: 'calc', digits: 4, compute: v => H.has(v, 'Qg', 'pg') ? v.Qg * v.pg / 1714 : undefined },
          { id: 'Fg', symbol: 'F', label: 'Force on that area', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'pg', 'Ag') ? v.pg * v.Ag : undefined },
        ] },
    ] },
  ],
};
