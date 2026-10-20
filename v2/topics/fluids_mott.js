// Fluid power — Parker Design Engineers Handbook + Esposito Ch. 6 (course) · Fizz §3 (pp.76–91) + Mech Unit 3 (pp.116–128) procedures.
// Neither textbook covers fluid power, so the Shigley and Mott files are identical apart from id/book/sibling.
// Example (hand-checked, guide procedure): 5000 lb lifted (case 4), μ 0.1, 50 ft/min in 1 in, 24-in stroke, mounting I, 1000 psi →
//   g 0.129, Fa 646, F = 6146 lb, Lb 12 in, d_req 2.80 → 3¼ in (8296 lb), Q 21.55 gpm, d_p,min 0.766 → 1-in sch 80 (9.6 ft/s), 14.8 → 15 hp.
// Probe-checked: Esposito 6-17M (40/20 mm, 0.0016 m³/s, 5000 N → 3.98 MPa, 1.27 m/s, 6.37 kW; 5.31 MPa, 1.70 m/s, 8.50 kW), Example 6-6
//   cushion (→ 856 psi), Parker b-6 (6000 lb, 120 ft/min in ½ in → g 1.49, 8930 lb).
// Verified against: HW3 P1 2024 (regenerative, 1000 psi, 4-in bore, 2-in rod, 14 gpm) → 9.61 → 10 hp, 3142 / 9425 lb, 1029 / 343 in/min,
//   56 gpm in the cap-end line → 1¼-in pipe — reproduced (the solution picks sch 40; sch 80 gives the same nominal size).
// Verified against: HW3 P3 (6000 lb up 30°, μ 0.2, 20-in stroke, not rigidly guided k = 2, 1000 psi) → F 4039 lb, d 2.27 → 2½ in (4909 lb),
//   Lb 40 in → rod 1⅜ (chart); b) 30 ft/min in ½ in → g 0.093 (chart 0.095), F 4597 lb (4609) < 4909 → OK — reproduced.
// Verified against: HW3 P4 (series cylinders, 3000 + 1000 lb, 1000 psi, 15 ft/min, 40 in, Lb 20 in) → 5 × 3 in + 4-in bore (exact match),
//   P2 79.6 psi, P1 203.7 psi, 15.3 gpm; with g 0.0165 → 207.1 psi — reproduced.
// Verified against: HW3 P5 (Esposito 6-27 crane, 2000 lb, 2.5 + 5 ft, 45°, β 30°) → 8485 lb, d 3.29 → 4 in (12 570 lb); load at 8 in/s →
//   cylinder 1.89 in/s = 9.43 ft/min → 6.16 gpm, ⅜-in pipe, 4.2 → 5 hp (solution: 13.8 ft/min, 8.77 gpm, ½-in pipe, 6.18 → 7.5 hp — slips, see
//   COURSE_CONVENTIONS §17; with its 13.8 ft/min the page gives 9.01 gpm, 6.19 hp → 7.5 hp).
// Verified against: final-exam review Scenario 2 (4000 lb press, 1000 psi, 8-in stroke, k 2) → 2½-in bore (4909 lb), Lb 16 → 1-in rod;
//   3 in/s → 3.83 gpm, ⅜-in pipe (8.7 ft/s), 2.63 → 3 hp; regenerative would need a 2½-in rod → 4-in bore — reproduced.
// Verified against: STQ 2022 P2 (1500 lb horizontal, μ 0.12, 50 ft/min in 0.75 in, 20-in stroke, 750 psi, trunnion k 1.5) → g 0.172 (chart
//   0.18), F 439 lb (450), 1-in bore → 1-in rod (Lb 30) forces a 1½-in bore (1325 lb), 4.6 gpm, 2.36 hp → 3 hp — reproduced.
const ROD_STD = [0.625, 1, 1.375, 1.75, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5];
const BORE_STD = [1, 1.5, 2, 2.5, 3.25, 4, 5, 6, 7, 8, 10, 12, 14];
// Parker Table b-5: rods offered with each bore
const B5 = { 1: [0.5, 0.625], 1.5: [0.625, 1], 2: [0.625, 1, 1.375], 2.5: [0.625, 1, 1.375, 1.75], 3.25: [1, 1.375, 1.75, 2], 4: [1, 1.375, 1.75, 2, 2.5],
  5: [1, 1.375, 1.75, 2, 2.5, 3, 3.5], 6: [1.375, 1.75, 2, 2.5, 3, 3.5, 4], 7: [1.375, 1.75, 2, 2.5, 3, 3.5, 4, 4.5, 5], 8: [1.375, 1.75, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5],
  10: [1.75, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7], 12: [2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5], 14: [2.5, 3, 3.5, 4, 4.5, 5, 5.5] };
const PIPE = { // nominal: [OD, ID sch40, ID sch80, ID sch160]
  '1/8': [0.405, 0.269, 0.215, null], '1/4': [0.540, 0.364, 0.302, null], '3/8': [0.675, 0.493, 0.423, null], '1/2': [0.840, 0.622, 0.546, 0.466],
  '3/4': [1.050, 0.824, 0.742, 0.614], '1': [1.315, 1.049, 0.957, 0.815], '1-1/4': [1.660, 1.380, 1.278, 1.160], '1-1/2': [1.900, 1.610, 1.500, 1.338],
  '2': [2.375, 2.067, 1.939, 1.689], '2-1/2': [2.875, 2.469, 2.323, 2.125], '3': [3.500, 3.068, 2.900, 2.624] };
const PIPE_ORDER = ['1/8', '1/4', '3/8', '1/2', '3/4', '1', '1-1/4', '1-1/2', '2', '2-1/2', '3'];   // (object key order would put '1', '2', '3' first)
const MOTOR_HP = [0.5, 0.75, 1, 1.5, 2, 3, 5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200];
const KFAC = { I: 0.5, II: 0.7, III: 2.0, IV: 1.0, V: 1.5, VI: 2.0 };
const nextStd = (x, list) => list.find(s => s >= x - 1e-9);
const A = d => Math.PI * d * d / 4;
const SCOL = v => v.sched === 40 ? 1 : v.sched === 160 ? 3 : 2;
const pipePick = v => { if (!H.has(v, 'dpmin')) return undefined; const col = SCOL(v); for (const k of PIPE_ORDER) { const id = PIPE[k][col]; if (id && id >= v.dpmin) return { nom: k, id }; } return undefined; };
const ESI = v => v.eunits === 'SI';
const eAp = v => H.has(v, 'edb') ? (ESI(v) ? A(v.edb / 1000) : A(v.edb)) : undefined;
const eAr = v => H.has(v, 'edr') ? (ESI(v) ? A(v.edr / 1000) : A(v.edr)) : undefined;
const REGPUSH = v => v.circuit === 'regen' && v.mode !== 'pull';
// rated force of a bore/rod pair for the design stroke at the cylinder pressure
const rated = (v, b, r) => v.mode === 'pull' ? v.pcyl * (A(b) - A(r)) : (v.circuit === 'regen' ? v.pcyl * A(r) : v.pcyl * A(b));
const rodFor = (v, b) => { const need = H.has(v, 'drod') ? v.drod : (H.has(v, 'drodmin') ? v.drodmin : 0); return (B5[b] || []).find(r => r >= need - 1e-9); };
const borePick = v => { if (!H.has(v, 'F', 'pcyl')) return undefined; for (const b of BORE_STD) { const r = rodFor(v, b); if (r === undefined) continue; if (rated(v, b, r) >= v.F - 1e-9) return b; } return undefined; };
const fracTex = s => s.replace(/^(\d+)-(\d+)\/(\d+)$/, '$1\\tfrac{$2}{$3}').replace(/^(\d+) (\d+)\/(\d+)$/, '$1\\tfrac{$2}{$3}').replace(/^(\d+)\/(\d+)$/, '\\tfrac{$1}{$2}');
const inch = x => { const w = Math.floor(x + 1e-9), f = x - w; const m = { 0.125: '1/8', 0.25: '1/4', 0.375: '3/8', 0.5: '1/2', 0.625: '5/8', 0.75: '3/4', 0.875: '7/8' }; const k = Object.keys(m).find(q => Math.abs(f - q) < 1e-6); return k ? '\\(' + fracTex((w ? w + ' ' : '') + m[k]) + '\\)' : String(+x.toFixed(3)); };
const nomVal = k => k.split('-').reduce((a, t) => a + (t.includes('/') ? Number(t.split('/')[0]) / Number(t.split('/')[1]) : Number(t)), 0);
const TX = (x, d) => String(H.fmt(x, d)).replace(/e([+-]?)(\d+)$/, (m, s, e) => '\\times10^{' + (s === '-' ? '-' : '') + e + '}');
function boreTable(v) {
  if (!H.has(v, 'F', 'pcyl') || v.F <= 0) return '';
  const pk = borePick(v); const i0 = pk ? BORE_STD.indexOf(pk) : BORE_STD.length - 1;
  const rows = BORE_STD.slice(Math.max(0, i0 - 2), i0 + 3).map(b => { const r = rodFor(v, b); const Fr = r !== undefined ? rated(v, b, r) : undefined; return { b, r, Fr, ok: r !== undefined && Fr >= v.F - 1e-9 }; });
  return H.table(['Bore', 'Rods offered (Table b-5)', 'Rod used', (v.mode === 'pull' ? 'Pull' : 'Push') + ' force at ' + H.fmt(v.pcyl) + ' psi', '≥ F = ' + H.fmt(v.F) + ' lb?'],
    rows.map(x => ({ cells: [inch(x.b) + ' in' + (v.dbore === x.b ? ' ✔' : ''), (B5[x.b] || []).map(inch).join(', '), x.r !== undefined ? inch(x.r) : 'none ≥ rod min', x.Fr !== undefined ? H.fmt(x.Fr, 4) + ' lb' : '—', x.ok ? 'yes' : 'no'],
      ok: x.ok, pick: x.b === pk, set: x.r !== undefined ? { dbore: x.b, drod: x.r } : undefined })),
    { caption: 'Select the cylinder — standard bore with a rod at least the chart minimum', note: 'Rule (Fizz p.84, Mech p.118/122): the smallest standard bore whose rated force covers the thrust and that is offered with the required rod (STQ 2022: 1-in rod needs a 1½-in bore). Regenerative push: force = p × rod area, so the rod sets the bore.' });
}
function pipeTable(v) {
  if (!H.has(v, 'Qline', 'vmax')) return '';
  const col = SCOL(v), keys = PIPE_ORDER.filter(k => PIPE[k][col]); const vel = id => v.Qline * 231 / 60 / (12 * A(id));
  const pk = keys.find(k => vel(PIPE[k][col]) <= v.vmax); const i0 = pk ? keys.indexOf(pk) : keys.length - 1;
  return H.table(['Nominal', 'ID (sch ' + v.sched + ')', 'Velocity at ' + H.fmt(v.Qline, 3) + ' gpm', '≤ ' + H.fmt(v.vmax) + ' ft/s?'],
    keys.slice(Math.max(0, i0 - 2), i0 + 3).map(k => ({ cells: [inch(nomVal(k)) + ' in' + (v.nom === k ? ' ✔' : ''), PIPE[k][col] + ' in', H.fmt(vel(PIPE[k][col]), 3) + ' ft/s', vel(PIPE[k][col]) <= v.vmax ? 'yes' : 'no'],
      ok: vel(PIPE[k][col]) <= v.vmax, pick: k === pk, set: { nom: k, dID: PIPE[k][col] } })),
    { caption: 'Select the pipe — schedule ' + v.sched, note: 'Rule (Fizz p.85, Mech p.123): the smallest nominal size that keeps the line velocity ≤ 15 ft/s. Pipe size = nominal OD designation; the schedule number sets the wall (40 low, 80 medium, 160 high pressure).' });
}
// two cylinders in series: annulus of cylinder 1 feeds cylinder 2
function seriesTable(v) {
  if (v.series !== 'yes') return '';
  const cands = []; BORE_STD.forEach(b1 => (B5[b1] || []).forEach(r1 => { const ann = b1 * b1 - r1 * r1; BORE_STD.forEach(b2 => { const mis = Math.abs(b2 * b2 - ann) / (b2 * b2); if (mis < 0.03 && b2 < b1) cands.push({ b1, r1, b2, mis }); }); }));
  const need = H.has(v, 'F1s', 'F2s', 'pcyl') ? (v.F1s + v.F2s) * (1 + (v.gs || 0)) / v.pcyl : undefined;
  const ok = c => (need === undefined || A(c.b1) >= need - 1e-9) && (!H.has(v, 'drodmin') || c.r1 >= v.drodmin - 1e-9);
  const pk = cands.find(ok);
  return H.table(['Cylinder 1 (bore × rod)', 'Annulus', 'Cylinder 2 bore', 'Area mismatch', 'Bore 1 area ≥ ' + (need !== undefined ? H.fmt(need, 3) : '—') + ' in\\(^2\\)?'],
    cands.map(c => ({ cells: [inch(c.b1) + ' × ' + inch(c.r1) + (v.ds1 === c.b1 && v.dr1 === c.r1 ? ' ✔' : ''), H.fmt(A(c.b1) - A(c.r1), 4) + ' in\\(^2\\)', inch(c.b2) + ' (' + H.fmt(A(c.b2), 4) + ' in\\(^2\\))', H.fmt(100 * c.mis, 2) + ' %', ok(c) ? 'yes' : 'no'],
      ok: ok(c), pick: c === pk, set: { ds1: c.b1, dr1: c.r1, ds2: c.b2 } })),
    { caption: 'Synchronised pair — annulus of cylinder 1 = bore area of cylinder 2', note: 'Rule (HW3 P4): equal areas give equal extension speeds; pick the smallest pair whose cylinder-1 bore carries both loads (\\((F_1+F_2)(1+g)/p\\)).' });
}

window.TOPIC = {
  id: 'fluids', book: 'mott',
  title: 'Fluid Power — Cylinder, Pump, Pipe & Motor Sizing',
  subtitle: 'Course: Parker Design Engineers Handbook + Esposito Ch. 6 · Fizz §3 + Mech Unit 3 (HW3, final-exam review)',
  sibling: 'fluids_shigley.html',
  intro: '<b>Neither Shigley nor Mott covers fluid power</b> — this page follows the Parker handbook pages and Esposito Ch. 6 used in the course; the book badge is only a label. '
    + 'Load → g → thrust → stroke factor and rod → bore → pump flow → pipe (≤ 15 ft/s) → motor hp → cushion → result. US units (lb, in, ft/min, psi, gpm, hp); the Esposito check also takes SI.',
  example: { p: 1000, loss: 0, L: 24, Fw: 5000, mu: 0.1, loadcase: 'v4', v: 50, s: 1, mount: 'I', drod: 1, circuit: 'regular', mode: 'push', dbore: 3.25, sched: 80, eff: 0.85 },

  assumptions: [
    { text: 'Relief-valve pressure 1000 psi when not given', src: 'Mech p.118 · Mech p.117', var: 'p' },
    { text: 'Fixed-displacement pump: constant gpm whatever the pressure; the relief valve sets the maximum pressure', src: 'Fizz p.77 · RAP', var: 'circuit' },
    { text: 'Full relief pressure at the cylinder (no line loss) as in both guides; Parker sizes the pump 10–25 % above the cylinder pressure for friction, direction changes and viscosity', src: 'Mech p.118 · Parker i-9', var: 'loss' },
    { text: 'Load friction only if μ is given; cylinder friction is ignored', src: 'Fizz p.78 · Fizz p.79', var: 'mu' },
    { text: 'Thrust F = weight + friction + acceleration force (case 4)', src: 'Fizz p.79 · Mech p.122', var: 'loadcase' },
    { text: 'Acceleration factor \\(g = 0.0000517\\,v^2/s\\) (v ft/min, s in) — "more reliable" than the chart', src: 'Fizz p.78 · Mech p.122', var: 'g' },
    { text: 'Rod from Graph b-1 at (thrust, \\(L_b = kL\\)), rounded up to a standard rod', src: 'Fizz p.80 · Mech p.119', var: 'drod' },
    { text: 'Bore: next standard size whose force covers the thrust and that is offered with the rod (Table b-5)', src: 'Fizz p.84 · Mech p.118 · Mech p.122', var: 'dbore' },
    { text: 'Extension flow uses the full bore: \\(Q = v_pA_p(12/231)\\) gpm', src: 'Fizz p.84 · Mech p.123', var: 'Q' },
    { text: 'Line velocity ≤ 15 ft/s; smallest pipe that meets it', src: 'Fizz p.85 · Mech p.123', var: 'vmax' },
    { text: 'Schedule 80 pipe unless told otherwise', src: 'Fizz p.85', var: 'sched' },
    { text: 'Motor \\(HP = Qp/(1714 \\times 0.85)\\), next standard 3-phase motor', src: 'Fizz p.88 · Mech p.123', var: 'eff' },
  ],

  figures: [
    { id: 'keyeq', ref: 'Esposito §6.10 key equations', title: 'Esposito key equations 6-1 … 6-11: cylinder force, velocity, power, levers, cushion', src: 'figures/course/fluid_esposito_6-10_key_equations.png', book: 'course', note: '\\(HP = vF/550 = Qp/1714\\); kW = vF (m/s, kN) = Qp (m\\(^3\\)/s, kPa).' },
    { id: 'nonregen', ref: 'Fizz p.77 non-regen circuit', title: 'Basic non-regenerative circuit: pump, relief valve, 4-way valve, cylinder', src: 'figures/bibles/fizz_p77_nonregen_circuit.png', book: 'Fizz bible', note: 'Push uses the full bore; retraction is faster and weaker (the rod fills part of the bore).' },
    { id: 'regen', ref: 'Fizz p.77 regen circuit (Fig. 13-22)', title: 'Regenerative circuit: rod-end oil returns to the cap end on extension', src: 'figures/bibles/fizz_p77_regen_circuit.png', book: 'Fizz bible', note: 'Both ports see the same pressure: push force = p × rod area, speed = Q/rod area.' },
    { id: 'areas', ref: 'Fizz p.83 piston areas', title: 'Piston areas: \\(A_1\\) = annulus, \\(A_2\\) = rod area', src: 'figures/bibles/fizz_p83_piston_areas.png', book: 'Fizz bible' },
    { id: 'lever', ref: 'Parker b-18 levers & toggle', title: 'Levers, toggle and straight-line motions; toggle force T = FA/(2B)', src: 'figures/course/fluid_parker_b18_lever_toggle.png', book: 'course' },
    { id: 'pwrfac', ref: 'Parker b-19 power & chord factors', title: 'Effective thrust of a cylinder at angle A (power factor sin A); hinged-lever stroke (chord factor)', src: 'figures/course/fluid_parker_b19_power_chord_factor.png', book: 'course' },
    { id: 'crane', ref: 'Parker b-20 cranes & beams', title: 'Crane / boom: only the thrust component normal to the beam turns it', src: 'figures/course/fluid_parker_b20_crane_beam.png', book: 'course', note: 'Add 10–15 % to the thrust for friction.' },
    { id: 'lever2', ref: 'Parker b-21 rotary & 2nd-class lever', title: 'Rotary motion T = 4FR; second-class lever \\(F\\cos\\phi(d_1 + d_2) = \\text{Load}\\cdot d_1\\)', src: 'figures/course/fluid_parker_b21_rotary_second_class_lever.png', book: 'course' },
    { id: 'gchart', ref: 'Graph b-2 (Mech p.122)', title: 'Acceleration force factor g vs velocity (ft/min) and distance s (in); load-case formulas', src: 'figures/bibles/mech_p122_accel_force_factor_chart.png', book: 'Mech bible', note: 'Horizontal: F = Wg, Wg + f, Wg − f. Vertical: F = Wg + W, Wg − W.' },
    { id: 'gchart2', ref: 'Fizz p.79 g-chart', title: 'Acceleration force factor chart (Fizz copy)', src: 'figures/bibles/fizz_p79_accel_force_factor_chart.png', book: 'Fizz bible' },
    { id: 'kfac', ref: 'Table b-4 (Fizz p.80)', title: 'Rod–stroke selection: mounting → stroke factor k', src: 'figures/bibles/fizz_p80_stroke_factor_table.png', book: 'Fizz bible', note: 'I 0.50, II 0.70, III 2.00, IV 1.00, V 1.50, VI 2.00.' },
    { id: 'rodchart', ref: 'Graph b-1 (Mech p.119)', title: 'Rod–stroke selection graph: thrust vs basic length → minimum rod', src: 'figures/bibles/mech_p119_rod_selection_chart.png', book: 'Mech bible', note: 'Standard rods ⅝, 1, 1⅜, 1¾, 2, 2½, 3, 3½, 4, 4½, 5, 5½ in.' },
    { id: 'rodchart2', ref: 'Fizz p.81 rod chart', title: 'Rod selection graph (Fizz copy)', src: 'figures/bibles/fizz_p81_rod_selection_chart.png', book: 'Fizz bible' },
    { id: 'forceus', ref: 'Table b-1 (Fizz p.82)', title: 'Push force (lb) by bore and pressure; deduct the rod row for pull', src: 'figures/bibles/fizz_p82_push_pull_forces_us.png', book: 'Fizz bible', note: 'Misprint: 3-in bore at 750 psi reads 3,502 lb; should be 5,302 lb.' },
    { id: 'forcesi', ref: 'Table b-2 (Fizz p.83)', title: 'Cylinder push force (N) at pressures in bar', src: 'figures/bibles/fizz_p83_push_forces_si.png', book: 'Fizz bible' },
    { id: 'pumpf', ref: 'Parker i-8 pump formulas', title: 'Pump formulas: GPM = rpm × d/231, efficiencies, \\(HP = GPM\\cdot PSI/(1714\\,\\eta)\\), \\(HP = T\\cdot rpm/63\\,025\\)', src: 'figures/course/fluid_parker_i8_pump_formulas.png', book: 'course' },
    { id: 'pumpx', ref: 'Parker i-9 pump sizing examples', title: 'Pump sizing: 10–25 % pressure margin; GPM = A·L·60/(231 t)', src: 'figures/course/fluid_parker_i9_pump_sizing_examples.png', book: 'course' },
    { id: 'pk-b3', ref: 'Parker b-3 mounting styles', book: 'course', title: 'Cylinder mounting styles (tie rod, flange, side lug, trunnion, clevis)', src: 'figures/course/fluid_parker_b3_mounting_styles.png' },
    { id: 'pk-b4', ref: 'Parker b-4 mounting classes (Table b-3)', book: 'course', title: 'Mounting classes and groups; stroke considerations', src: 'figures/course/fluid_parker_b4_mounting_classes_stroke_table.png' },
    { id: 'pk-b23', ref: 'Parker b-23 first-class lever', book: 'course', title: 'First-class lever formulas and worked problems', src: 'figures/course/fluid_parker_b23_first_class_lever.png' },
    { id: 'pk-b24', ref: 'Parker b-24 toggle variation', book: 'course', title: 'Toggle variation; cylinders moving horizontal loads', src: 'figures/course/fluid_parker_b24_toggle_variation.png', note: 'Sliding loads need ≈ ½–¾ of the weight to start.' },
    { id: 'pk-b25', ref: 'Parker b-25 lifts and hinged lever', book: 'course', title: 'Lifting cylinders (size for 25 % over the load) and hinged-lever stroke', src: 'figures/course/fluid_parker_b25_lifts_hinged_lever.png' },
    { id: 'pk-i10', ref: 'Parker i-10 pump calc (continued)', book: 'course', title: 'Pump calculation continued: 14 gpm cycle example and relief-valve setting', src: 'figures/course/fluid_parker_i10_pump_calc_continued.png' },
    { id: 'pipe', ref: 'Pipe table (Fizz p.85)', title: 'Pipe OD and ID for schedule 40 / 80 / 160', src: 'figures/bibles/fizz_p85_pipe_schedule_table.png', book: 'Fizz bible' },
    { id: 'flowa', ref: 'Table b-5 (Fizz p.86)', title: 'Bore/rod combinations: displacement at 10 ft/min and fluid velocity in extra-heavy pipe', src: 'figures/bibles/fizz_p86_flow_velocity_table_a.png', book: 'Fizz bible', note: 'Scale by \\(v_p/10\\); keep the velocity ≤ 15 ft/s.' },
    { id: 'flowb', ref: 'Fizz p.87 flow table (b)', title: 'Flow and velocity table continued (7–14-in bores)', src: 'figures/bibles/fizz_p87_flow_velocity_table_b.png', book: 'Fizz bible' },
    { id: 'hp', ref: 'Table c-1 (Fizz p.88)', title: 'Motor hp to drive a pump vs gpm and psi (85 % efficiency)', src: 'figures/bibles/fizz_p88_motor_hp_table.png', book: 'Fizz bible' },
    { id: 'starters', ref: 'Table c-5 (Fizz p.89)', title: 'Three-phase / single-phase motor starters (standard hp)', src: 'figures/bibles/fizz_p89_motor_starters.png', book: 'Fizz bible' },
    { id: 'cushion', ref: 'Esposito Example 6-6 (Fig. 6-17)', title: 'Cushion problem: 1500 lb, 18.2 gpm, 3-in piston, 1-in plunger → \\(p_2\\) = 856 psi', src: 'figures/course/fluid_esposito_ex6-6_cushion.png', book: 'course' },
    { id: 'seqsym', ref: 'Fizz p.90 sequence valve', title: 'Sequence valve symbol', src: 'figures/bibles/fizz_p90_sequence_valve_symbol.png', book: 'Fizz bible' },
    { id: 'seqckt', ref: 'Fizz p.90 sequence circuit', title: 'Two cylinders sequenced with sequence and check valves', src: 'figures/bibles/fizz_p90_sequence_circuit.png', book: 'Fizz bible' },
    { id: 'symdir', ref: 'Mech p.125 directional valves', title: 'Directional control valve envelopes', src: 'figures/bibles/mech_p125_directional_valve_symbols.png', book: 'Mech bible' },
    { id: 'symchk', ref: 'Mech p.125 check valves', title: 'Check valves, pilot-operated to open / close', src: 'figures/bibles/mech_p125_check_valve_symbols.png', book: 'Mech bible' },
    { id: 'sym2w', ref: 'Mech p.126 2-way valves', title: 'Two-way valves, normally closed / open', src: 'figures/bibles/mech_p126_two_way_valve_symbols.png', book: 'Mech bible' },
    { id: 'sym4w', ref: 'Mech p.127 4-way valve', title: '3-position 4-way valve', src: 'figures/bibles/mech_p127_four_way_three_position.png', book: 'Mech bible' },
    { id: 'symrel', ref: 'Mech p.127 relief valve', title: 'Pressure relief valve (normally closed)', src: 'figures/bibles/mech_p127_pressure_relief_symbol.png', book: 'Mech bible' },
    { id: 'symred', ref: 'Mech p.128 reducing valve', title: 'Pressure reducing valve (normally open)', src: 'figures/bibles/mech_p128_pressure_reducing_symbol.png', book: 'Mech bible' },
  ],

  sections: [
    { title: 'Step 1: Inputs — pressure, stroke, circuit', steps: [
      { id: 'in', title: 'Given data and circuit type', fig: ['nonregen', 'regen', 'areas', 'seqckt', 'symdir', 'sym4w', 'symrel', 'symchk'],
        text: 'Relief pressure 1000 psi if not given; the loss allowance (10–25 %) lowers the pressure at the cylinder. Regenerative: both ports at the same pressure, push = \\(pA_{rod}\\), speed = \\(Q/A_{rod}\\).',
        vars: [
          { id: 'p', symbol: 'p_{pump}', label: 'Pump / relief-valve pressure', unit: 'psi', kind: 'input', default: 1000 },
          { id: 'loss', symbol: '\\%', label: 'Line-loss allowance (Parker 10–25 %)', unit: '%', kind: 'input', default: 0, hint: '0 = pressure given at the cylinder' },
          { id: 'pcyl', symbol: 'p', label: 'Working pressure at the cylinder', unit: 'psi', kind: 'calc', compute: v => H.has(v, 'p', 'loss') ? v.p * (1 - v.loss / 100) : undefined },
          { id: 'L', symbol: 'L', label: 'Stroke length', unit: 'in', kind: 'input' },
          { id: 'circuit', label: 'Circuit', kind: 'choice', type: 'text', options: [{ label: 'Regular (non-regenerative)', value: 'regular' }, { label: 'Regenerative', value: 'regen' }], default: 'regular' },
          { id: 'mode', label: 'Design stroke', kind: 'choice', type: 'text', options: [{ label: 'Push (extend)', value: 'push' }, { label: 'Pull (retract)', value: 'pull' }], default: 'push' },
        ],
        after: v => '<span class="seltab-note">Components (RAP): a pump moves oil by an increasing/decreasing volume in its housing; an accumulator stores potential energy; a check valve lets flow bypass a flow-control valve; cracking pressure = pressure at which a valve starts to open; relief valves are normally closed, reducing valves normally open; directional valves (2-, 3-, 4-way spool, often spring-centred) are worked manually, mechanically, electrically or by pilot pressure; sequence valves open above a set pressure so cylinders move in order (HW3 P2: 1 extends, 2 extends, 1 retracts, 2 retracts).</span>' },
    ] },

    { title: 'Step 2: Load on the cylinder (Parker b-6/b-7, Esposito 6-21 … 6-27)', steps: [
      { id: 'lever', title: 'Lever: cylinder force from the load (Esposito 6-7 … 6-9)', fig: ['keyeq', 'lever', 'lever2', 'pwrfac', 'pk-b23'],
        formula: '\\text{1st: } F_{cyl} = \\frac{L_2}{L_1\\cos\\phi}F_{load} \\qquad \\text{2nd: } F_{cyl} = \\frac{L_2}{(L_1+L_2)\\cos\\phi}F_{load} \\qquad \\text{3rd: } F_{cyl} = \\frac{L_1+L_2}{L_2\\cos\\phi}F_{load}',
        text: 'Optional. \\(\\phi\\) = cylinder angle from the lever normal (cos φ ≈ 1 within ±15°). Problem 6-25: 4444 N, \\(L_1 = L_2\\) → 4444 / 2222 / 8888 N.',
        vars: [
          { id: 'lclass', label: 'Lever class', kind: 'choice', options: [{ label: '1st — fulcrum between cylinder and load', value: 1 }, { label: '2nd — load between fulcrum and cylinder', value: 2 }, { label: '3rd — cylinder between fulcrum and load', value: 3 }], default: 2 },
          { id: 'Fload', symbol: 'F_{load}', label: 'Load on the lever', unit: 'lb (or N)', kind: 'input' },
          { id: 'L1', symbol: 'L_1', label: 'Lever arm \\(L_1\\)', unit: 'any length', kind: 'input' },
          { id: 'L2', symbol: 'L_2', label: 'Lever arm \\(L_2\\)', unit: 'same unit', kind: 'input' },
          { id: 'phi', symbol: '\\phi', label: 'Cylinder angle from the lever normal', unit: '°', kind: 'input', default: 0 },
          { id: 'Fcyl', symbol: 'F_{cyl}', label: 'Cylinder force required', unit: 'lb (or N)', kind: 'calc', compute: v => { if (!H.has(v, 'Fload', 'L1', 'L2', 'phi')) return undefined; const c = Math.cos(H.rad(v.phi)); if (c <= 0) return undefined;
              return v.lclass === 1 ? v.L2 / (v.L1 * c) * v.Fload : v.lclass === 3 ? (v.L1 + v.L2) / (v.L2 * c) * v.Fload : v.L2 / ((v.L1 + v.L2) * c) * v.Fload; } },
        ] },
      { id: 'crane', title: 'Crane boom (Parker b-20, Esposito 6-27, HW3 P5)', fig: ['crane', 'lever2'],
        formula: 'F_{cyl}\\,d_1\\sin\\beta = W\\,(d_1+d_2)\\cos\\alpha \\qquad v_{cyl} = v_{load}\\,\\frac{d_1\\sin\\beta}{(d_1+d_2)\\cos\\alpha}',
        text: 'Optional. \\(\\beta\\) = cylinder-to-boom angle, \\(\\alpha\\) = boom angle; moments about the pivot. A vertical load speed converts to a cylinder speed with the second formula.',
        vars: [
          { id: 'Wc', symbol: 'W', label: 'Crane load', unit: 'lb', kind: 'input' },
          { id: 'd1', symbol: 'd_1', label: 'Pivot → cylinder attachment', unit: 'ft or in', kind: 'input' },
          { id: 'd2', symbol: 'd_2', label: 'Cylinder attachment → load', unit: 'same unit', kind: 'input' },
          { id: 'alpha', symbol: '\\alpha', label: 'Boom angle above horizontal', unit: '°', kind: 'input' },
          { id: 'beta', symbol: '\\beta', label: 'Angle between cylinder and boom', unit: '°', kind: 'input' },
          { id: 'Fcr', symbol: 'F_{cyl}', label: 'Crane cylinder thrust', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'Wc', 'd1', 'd2', 'alpha', 'beta') && Math.sin(H.rad(v.beta)) > 0 ? v.Wc * (v.d1 + v.d2) * Math.cos(H.rad(v.alpha)) / (v.d1 * Math.sin(H.rad(v.beta))) : undefined,
            work: v => H.has(v, 'Fcr') ? '\\(F_{cyl} = \\dfrac{' + TX(v.Wc) + '(' + TX(v.d1) + ' + ' + TX(v.d2) + ')\\cos ' + TX(v.alpha) + '^\\circ}{' + TX(v.d1) + '\\sin ' + TX(v.beta) + '^\\circ} = ' + TX(v.Fcr) + '\\ \\text{lb}\\)' : null },
          { id: 'vload', symbol: 'v_{load}', label: 'Vertical speed of the load (if given)', unit: 'any speed', kind: 'input', hint: 'HW3 P5: 8 in/s' },
          { id: 'vcyl', symbol: 'v_{cyl}', label: 'Cylinder extension speed', unit: 'same unit', kind: 'calc', digits: 4, compute: v => H.has(v, 'vload', 'd1', 'd2', 'alpha', 'beta') && Math.cos(H.rad(v.alpha)) > 0 ? v.vload * v.d1 * Math.sin(H.rad(v.beta)) / ((v.d1 + v.d2) * Math.cos(H.rad(v.alpha))) : undefined,
            work: v => H.has(v, 'vcyl') ? '\\(v_{cyl} = ' + TX(v.vload) + '\\dfrac{' + TX(v.d1) + '\\sin ' + TX(v.beta) + '^\\circ}{(' + TX(v.d1) + ' + ' + TX(v.d2) + ')\\cos ' + TX(v.alpha) + '^\\circ} = ' + TX(v.vcyl, 4) + '\\)' : null },
        ] },
      { id: 'toggle', title: 'Toggle and cylinder at an angle (Parker b-18 / b-19)', fig: ['lever', 'pwrfac', 'pk-b24'],
        formula: 'T_{toggle} = \\frac{F\\,A}{2B} \\qquad F_{eff} = F\\sin A',
        text: 'Optional. Example: 8300 lb, A = 14 in, B = ½ in → 116 200 lb; 8300 lb at 65° → 7520 lb.',
        vars: [
          { id: 'Ftog', symbol: 'F', label: 'Cylinder thrust', unit: 'lb', kind: 'input' },
          { id: 'Atog', symbol: 'A', label: 'Toggle lever length', unit: 'in', kind: 'input' },
          { id: 'Btog', symbol: 'B', label: 'Toggle offset', unit: 'in', kind: 'input' },
          { id: 'Ttog', symbol: 'T', label: 'Toggle force', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'Ftog', 'Atog', 'Btog') && v.Btog > 0 ? v.Ftog * v.Atog / (2 * v.Btog) : undefined },
          { id: 'angA', symbol: 'A', label: 'Angle between cylinder and lever', unit: '°', kind: 'input', default: 90 },
          { id: 'Feff', symbol: 'F_{eff}', label: 'Effective thrust \\(F\\sin A\\)', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'Ftog', 'angA') ? v.Ftog * Math.sin(H.rad(v.angA)) : undefined },
        ] },
      { id: 'load', title: 'Weight, friction and load case', fig: ['gchart', 'gchart2', 'keyeq', 'pk-b24', 'pk-b25'],
        formula: 'F_f = \\mu W\\ (\\text{horizontal}) \\qquad \\text{incline: } F = W(\\sin\\theta + \\mu\\cos\\theta) + Wg',
        text: 'Graph b-2 cases: (1) F = Wg; (2) Wg + f; (3) Wg − f; (4) vertical up Wg + W; (5) Wg − W; (6) incline (Esposito 6-21/6-23, HW3 P3). Use Static for no acceleration.',
        vars: [
          { id: 'Fw', symbol: 'W', label: 'Weight of the load', unit: 'lb', kind: 'input', hint: 'or the lever / crane cylinder force' },
          { id: 'mu', symbol: '\\mu', label: 'Coefficient of friction (if given)', kind: 'input', default: 0 },
          { id: 'theta', symbol: '\\theta', label: 'Incline angle (case 6)', unit: '°', kind: 'input', default: 30 },
          { id: 'Ffg', symbol: 'F_{f,given}', label: 'Friction force if given directly', unit: 'lb', kind: 'input' },
          { id: 'loadcase', label: 'Load case', kind: 'choice', type: 'text', options: [{ label: '(1) Horizontal: F = Wg', value: 'h1' }, { label: '(2) Horizontal, accelerate + friction: F = Wg + f', value: 'h2' }, { label: '(3) Horizontal, decelerate: F = Wg − f', value: 'h3' }, { label: '(4) Vertical up: F = Wg + W (+ f)', value: 'v4' }, { label: '(5) Vertical down: F = Wg − W', value: 'v5' }, { label: '(6) Up an incline: \\(W(\\sin\\theta + \\mu\\cos\\theta) + Wg\\)', value: 'inc' }, { label: 'Static: F = W + f', value: 'static' }], default: 'v4' },
          { id: 'Ff', symbol: 'F_f', label: 'Friction force', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'Ffg') ? v.Ffg : (H.has(v, 'Fw', 'mu') ? (v.loadcase === 'inc' && H.has(v, 'theta') ? v.mu * v.Fw * Math.cos(H.rad(v.theta)) : v.mu * v.Fw) : undefined),
            work: v => (!H.has(v, 'Ffg') && H.has(v, 'Ff') && v.mu > 0) ? '\\(F_f = ' + TX(v.mu) + '(' + TX(v.Fw) + ')' + (v.loadcase === 'inc' ? '\\cos ' + TX(v.theta) + '^\\circ' : '') + ' = ' + TX(v.Ff) + '\\ \\text{lb}\\)' : null },
        ] },
      { id: 'force', title: 'Acceleration force factor g → total thrust', fig: ['gchart', 'gchart2'],
        formula: 'g = 0.0000517\\,\\frac{v^2}{s} \\qquad F_a = W g \\qquad F = F_a \\pm W \\pm F_f',
        text: 'v in ft/min (in/s × 5), s in inches. Leave v blank when there is no acceleration.',
        vars: [
          { id: 'v', symbol: 'v', label: 'Velocity to reach', unit: 'ft/min', kind: 'input' },
          { id: 's', symbol: 's', label: 'Distance to reach it', unit: 'in', kind: 'input' },
          { id: 'g', symbol: 'g', label: 'Acceleration force factor', kind: 'lookup', fig: 'gchart', auto: v => H.has(v, 'v', 's') && v.s > 0 ? v.v * v.v / v.s * 0.0000517 : (v.loadcase === 'static' || !H.has(v, 'v') ? 0 : undefined), hint: 'Graph b-2 (auto = formula; 0 without acceleration)' },
          { id: 'Fa', symbol: 'F_a', label: 'Acceleration force Wg', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'Fw', 'g') ? v.Fw * v.g : undefined,
            work: v => H.has(v, 'v', 's', 'g', 'Fw') && v.g > 0 ? '\\(g = 0.0000517\\,\\dfrac{' + TX(v.v) + '^2}{' + TX(v.s) + '} = ' + TX(v.g, 4) + ',\\quad F_a = ' + TX(v.Fw) + '(' + TX(v.g, 4) + ') = ' + TX(v.Fa) + '\\)' : null },
          { id: 'F', symbol: 'F', label: 'Total thrust on the piston', unit: 'lb', kind: 'calc', compute: v => { if (!H.has(v, 'Fw', 'Ff')) return undefined; const Fa = v.Fa === undefined ? 0 : v.Fa;
              switch (v.loadcase) { case 'h1': return Fa; case 'h2': return Fa + v.Ff; case 'h3': return Fa - v.Ff; case 'v4': return Fa + v.Fw + v.Ff; case 'v5': return Fa - v.Fw + v.Ff; case 'inc': return H.has(v, 'theta') ? Fa + v.Fw * Math.sin(H.rad(v.theta)) + v.Ff : undefined; default: return v.Fw + v.Ff; } },
            work: v => H.has(v, 'F') ? '\\(F = ' + ({ h1: 'W g', h2: 'W g + f', h3: 'W g - f', v4: 'W g + W + f', v5: 'W g - W + f', inc: 'W g + W\\sin\\theta + \\mu W\\cos\\theta', static: 'W + f' })[v.loadcase] + ' = ' + TX(v.F) + '\\ \\text{lb}\\)' : null,
            check: v => (v.F !== undefined && v.F <= 0) ? 'Thrust ≤ 0 — size for the other stroke' : null },
        ] },
    ] },

    { title: 'Step 3–4: Basic length and minimum rod (Parker b-4 … b-6)', steps: [
      { id: 'Lb', title: 'Stroke factor and basic length', fig: ['kfac', 'pk-b3', 'pk-b4'], formula: 'L_b = k\\,L',
        vars: [
          { id: 'mount', label: 'Mounting style', kind: 'choice', type: 'text', options: [{ label: 'I — fixed and rigidly guided (k = 0.50)', value: 'I' }, { label: 'II — pivoted and rigidly guided (0.70)', value: 'II' }, { label: 'III — supported, not rigidly guided (2.00)', value: 'III' }, { label: 'IV — trunnion on head (1.00)', value: 'IV' }, { label: 'V — intermediate trunnion (1.50)', value: 'V' }, { label: 'VI — trunnion / clevis on cap (2.00)', value: 'VI' }], default: 'I' },
          { id: 'k', symbol: 'k', label: 'Stroke factor', kind: 'lookup', fig: 'kfac', auto: v => KFAC[v.mount], hint: 'Table b-4' },
          { id: 'Lb', symbol: 'L_b', label: 'Basic length', unit: 'in', kind: 'calc', compute: v => H.has(v, 'k', 'L') ? v.k * v.L : undefined },
        ] },
      { id: 'rod', title: 'Minimum rod diameter (Graph b-1)', fig: ['rodchart', 'rodchart2'],
        text: 'Enter thrust (x) and basic length (y); read the rod curve at or above the point and round up to a standard rod.',
        vars: [
          { id: 'drodmin', symbol: 'd_{rod,min}', label: 'Rod diameter from the chart', unit: 'in', kind: 'lookup', fig: 'rodchart', hint: 'Graph b-1' },
          { id: 'drod', symbol: 'd_{rod}', label: 'Rod diameter selected (standard)', unit: 'in', kind: 'lookup', fig: 'forceus', auto: v => { const need = Math.max(H.has(v, 'drodmin') ? v.drodmin : 0, REGPUSH(v) && H.has(v, 'dreq') ? v.dreq : 0); return need > 0 ? nextStd(need, ROD_STD) : undefined; }, hint: 'auto = next standard rod (regen push: also ≥ \\(d_{req}\\))',
            check: v => (H.has(v, 'drod', 'drodmin') && v.drod < v.drodmin) ? 'Below the chart minimum — buckling risk' : null },
        ] },
    ] },

    { title: 'Step 5: Bore from working pressure (Table b-1, Esposito 6-1/6-3)', steps: [
      { id: 'bore', title: 'Required bore for the design stroke, F = pA', fig: ['forceus', 'flowa', 'forcesi', 'areas', 'keyeq'],
        formula: 'A_1 = \\tfrac{\\pi}{4}(d_b^2 - d_r^2),\\; A_2 = \\tfrac{\\pi}{4}d_r^2 \\qquad F_{push} = p(A_1+A_2)\\ [\\text{regen: } pA_2] \\qquad F_{pull} = pA_1',
        text: 'Regular push \\(d_b = \\sqrt{4F/\\pi p}\\); pull \\(d_b = \\sqrt{4F/\\pi p + d_r^2}\\); regenerative push sizes the rod. The table picks the standard bore.',
        vars: [
          { id: 'dreq', symbol: 'd_{req}', label: 'Required diameter (bore; regen push: rod)', unit: 'in', kind: 'calc', digits: 4, compute: v => { if (!H.has(v, 'F', 'pcyl') || v.F <= 0) return undefined; const base = 4 * v.F / (Math.PI * v.pcyl);
              if (v.mode === 'pull') return H.has(v, 'drod') ? Math.sqrt(base + v.drod * v.drod) : undefined; return Math.sqrt(base); },
            work: v => H.has(v, 'dreq') ? (v.mode === 'pull' ? '\\(d_b = \\sqrt{\\dfrac{4(' + TX(v.F) + ')}{\\pi(' + TX(v.pcyl) + ')} + ' + TX(v.drod) + '^2} = ' + TX(v.dreq, 4) + '\\)' : '\\(d_{' + (v.circuit === 'regen' ? 'rod' : 'bore') + '} = \\sqrt{\\dfrac{4(' + TX(v.F) + ')}{\\pi(' + TX(v.pcyl) + ')}} = ' + TX(v.dreq, 4) + '\\)') : null },
          { id: 'dbore', symbol: 'd_{bore}', label: 'Bore selected (standard)', unit: 'in', kind: 'lookup', fig: 'forceus', auto: v => borePick(v),
            hint: 'standard bores 1, 1½, 2, 2½, 3¼, 4, 5, 6, 7, 8, 10, 12, 14', check: v => (H.has(v, 'dbore', 'drod') && v.dbore <= v.drod) ? 'Bore must exceed the rod' : (H.has(v, 'dbore') && !BORE_STD.includes(v.dbore) ? 'Not a standard bore' : null) },
          { id: 'A1', symbol: 'A_1', label: 'Annulus area', unit: 'in^2', kind: 'calc', digits: 4, compute: v => H.has(v, 'dbore', 'drod') ? A(v.dbore) - A(v.drod) : undefined },
          { id: 'A2', symbol: 'A_2', label: 'Rod area', unit: 'in^2', kind: 'calc', digits: 4, compute: v => H.has(v, 'drod') ? A(v.drod) : undefined },
          { id: 'Fpush', symbol: 'F_{push}', label: 'Maximum push (extension) force at p', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'pcyl', 'A1', 'A2') ? v.pcyl * (v.circuit === 'regen' ? v.A2 : v.A1 + v.A2) : undefined,
            work: v => H.has(v, 'Fpush') ? '\\(F_{push} = ' + TX(v.pcyl) + '(' + (v.circuit === 'regen' ? TX(v.A2, 4) : TX(v.A1 + v.A2, 4)) + ') = ' + TX(v.Fpush) + '\\ \\text{lb}\\)' : null },
          { id: 'Fpull', symbol: 'F_{pull}', label: 'Maximum pull (retraction) force at p', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'pcyl', 'A1') ? v.pcyl * v.A1 : undefined,
            work: v => H.has(v, 'Fpull') ? '\\(F_{pull} = ' + TX(v.pcyl) + '(' + TX(v.A1, 4) + ') = ' + TX(v.Fpull) + '\\ \\text{lb}\\)' : null },
          { id: 'preq', symbol: 'p_{req}', label: 'Pressure needed for F with these sizes', unit: 'psi', kind: 'calc', compute: v => { if (!H.has(v, 'F', 'A1', 'A2')) return undefined; const Aeff = v.mode === 'pull' ? v.A1 : (v.circuit === 'regen' ? v.A2 : v.A1 + v.A2); return Aeff > 0 ? v.F / Aeff : undefined; } },
        ],
        after: v => boreTable(v) + (H.has(v, 'F', 'Fpush', 'Fpull') ? ((v.mode === 'pull' ? v.Fpull : v.Fpush) >= v.F ? '<span class="result-ok">Rated ' + v.mode + ' force ≥ thrust ' + H.fmt(v.F) + ' lb (needs only ' + H.fmt(v.preq) + ' psi).</span>' : '<span class="result-bad">Rated ' + v.mode + ' force below the thrust — larger bore' + (REGPUSH(v) ? ' / rod' : '') + ' or ' + H.fmt(v.preq) + ' psi.</span>') : '') },
      { id: 'series', title: 'Two cylinders in series (synchronised, HW3 P4)', fig: ['flowa', 'areas'],
        formula: 'A_{ann,1} = A_{bore,2} \\qquad p_2 = \\frac{F_2(1+g)}{A_{bore,2}} \\qquad p_1 = \\frac{F_1(1+g) + p_2A_{ann,1}}{A_{bore,1}} \\qquad Q = v\\,A_{bore,1}\\frac{12}{231}',
        text: 'Optional. Oil from cylinder 1\'s rod end drives cylinder 2, so equal areas give equal speeds.',
        vars: [
          { id: 'series', label: 'Series (synchronised) pair?', kind: 'choice', type: 'text', options: [{ label: 'No', value: 'no' }, { label: 'Yes', value: 'yes' }], default: 'no' },
          { id: 'F1s', symbol: 'F_1', label: 'Load on cylinder 1', unit: 'lb', kind: 'input' },
          { id: 'F2s', symbol: 'F_2', label: 'Load on cylinder 2', unit: 'lb', kind: 'input' },
          { id: 'gs', symbol: 'g', label: 'Acceleration factor (0 if none)', kind: 'input', default: 0 },
          { id: 'ds1', symbol: 'd_{b1}', label: 'Cylinder 1 bore', unit: 'in', kind: 'input' },
          { id: 'dr1', symbol: 'd_{r1}', label: 'Cylinder 1 rod', unit: 'in', kind: 'input' },
          { id: 'ds2', symbol: 'd_{b2}', label: 'Cylinder 2 bore', unit: 'in', kind: 'input', auto: v => H.has(v, 'ds1', 'dr1') ? Math.sqrt(v.ds1 * v.ds1 - v.dr1 * v.dr1) : undefined, hint: 'auto = \\(\\sqrt{d_{b1}^2 - d_{r1}^2}\\)' },
          { id: 'p2s', symbol: 'p_2', label: 'Pressure in cylinder 2', unit: 'psi', kind: 'calc', compute: v => H.has(v, 'F2s', 'ds2', 'gs') ? v.F2s * (1 + v.gs) / A(v.ds2) : undefined },
          { id: 'p1s', symbol: 'p_1', label: 'Pressure in cylinder 1 (pump)', unit: 'psi', kind: 'calc', compute: v => H.has(v, 'F1s', 'p2s', 'ds1', 'dr1', 'gs') ? (v.F1s * (1 + v.gs) + v.p2s * (A(v.ds1) - A(v.dr1))) / A(v.ds1) : undefined,
            work: v => H.has(v, 'p1s') ? '\\(p_1 = \\dfrac{' + TX(v.F1s * (1 + v.gs)) + ' + ' + TX(v.p2s) + '(' + TX(A(v.ds1) - A(v.dr1), 4) + ')}{' + TX(A(v.ds1), 4) + '} = ' + TX(v.p1s) + '\\ \\text{psi}\\)' : null },
          { id: 'Qs', symbol: 'Q', label: 'Pump flow at the piston speed below', unit: 'gpm', kind: 'calc', digits: 4, compute: v => H.has(v, 'ds1', 'vpu') ? v.vpu * A(v.ds1) * 12 / 231 : undefined },
        ],
        after: v => seriesTable(v) + (H.has(v, 'p1s', 'pcyl') ? (v.p1s <= v.pcyl ? ' <span class="result-ok">\\(p_1\\) ≤ ' + H.fmt(v.pcyl) + ' psi — lower the relief setting to suit.</span>' : ' <span class="result-bad">\\(p_1\\) exceeds the available pressure.</span>') : '') },
    ] },

    { title: 'Step 6: Extension / retraction of a given cylinder (Esposito 6-1 … 6-5)', steps: [
      { id: 'ecyl', title: 'Cylinder, flow and load (US or SI)', fig: ['keyeq', 'areas'],
        formula: 'A_p = \\tfrac{\\pi}{4}d_b^2 \\qquad A_r = \\tfrac{\\pi}{4}d_r^2',
        text: 'Blank fields take the bore, rod, pump flow and thrust from above (US). Metric problems: SI with mm, m\\(^3\\)/s, N (6-17M: 40/20 mm, 0.0016 m\\(^3\\)/s, 5000 N → 3.98 MPa, 1.27 m/s).',
        vars: [
          { id: 'eunits', label: 'Units', kind: 'choice', type: 'text', options: [{ label: 'US: in, gpm, lb → psi, ft/s, hp', value: 'US' }, { label: 'SI: mm, m\\(^3\\)/s, N → MPa, m/s, kW', value: 'SI' }], default: 'US' },
          { id: 'edb', symbol: 'd_b', label: 'Bore (piston) diameter', unit: 'in / mm', kind: 'input', auto: v => ESI(v) ? undefined : v.dbore, hint: 'blank = selected bore' },
          { id: 'edr', symbol: 'd_r', label: 'Rod diameter', unit: 'in / mm', kind: 'input', auto: v => ESI(v) ? undefined : v.drod, hint: 'blank = selected rod' },
          { id: 'eQ', symbol: 'Q_{in}', label: 'Pump flow into the cylinder', unit: 'gpm / m^3/s', kind: 'input', auto: v => ESI(v) ? undefined : v.Q, hint: 'blank = pump flow (step 7)' },
          { id: 'eF', symbol: 'F', label: 'Load (both strokes)', unit: 'lb / N', kind: 'input', auto: v => ESI(v) ? undefined : v.F, hint: 'blank = thrust (step 2)' },
          { id: 'eAp', symbol: 'A_p', label: 'Piston area', unit: 'in^2 / m^2', kind: 'calc', digits: 5, compute: eAp },
          { id: 'eAr', symbol: 'A_r', label: 'Rod area', unit: 'in^2 / m^2', kind: 'calc', digits: 5, compute: eAr },
        ] },
      { id: 'eext', title: 'Extension and retraction: pressure, velocity, power', eq: 'Esposito 6-1 … 6-5', fig: ['keyeq', 'regen'],
        formula: 'p_{ext} = \\frac{F}{A_{ext}},\\; v_{ext} = \\frac{Q}{A_{ext}}\\ (A_{ext} = A_p,\\ \\text{regen } A_r) \\qquad p_{ret} = \\frac{F}{A_p - A_r},\\; v_{ret} = \\frac{Q}{A_p - A_r} \\qquad HP = \\frac{vF}{550} = \\frac{Qp}{1714}',
        text: 'Regenerative extension: the cap-end line carries \\(Q A_p/A_r\\) (pump + rod-end oil). Retraction out-flow \\(= Q A_p/(A_p - A_r)\\).',
        vars: [
          { id: 'epext', symbol: 'p_{ext}', label: 'Pressure needed to extend', unit: 'psi / MPa', kind: 'calc', digits: 4, compute: v => { const Ae = v.circuit === 'regen' ? v.eAr : v.eAp; return H.has(v, 'eF') && Ae > 0 ? v.eF / Ae / (ESI(v) ? 1e6 : 1) : undefined; },
            work: v => H.has(v, 'epext') ? '\\(p_{ext} = \\dfrac{' + TX(v.eF) + '}{' + TX(v.circuit === 'regen' ? v.eAr : v.eAp, 5) + '} = ' + TX(v.epext) + (ESI(v) ? '\\ \\text{MPa}' : '\\ \\text{psi}') + '\\)' : null },
          { id: 'evext', symbol: 'v_{ext}', label: 'Extension velocity', unit: 'ft/s / m/s', kind: 'calc', digits: 4, compute: v => { const Ae = v.circuit === 'regen' ? v.eAr : v.eAp; return H.has(v, 'eQ') && Ae > 0 ? (ESI(v) ? v.eQ / Ae : v.eQ * 231 / 60 / 12 / Ae) : undefined; },
            work: v => H.has(v, 'evext') ? (ESI(v) ? '\\(v_{ext} = ' + TX(v.evext) + '\\ \\text{m/s}\\)' : '\\(v_{ext} = \\dfrac{' + TX(v.eQ) + '(231)}{' + TX(v.circuit === 'regen' ? v.eAr : v.eAp, 4) + '} = ' + TX(v.evext * 720) + '\\ \\text{in/min} = ' + TX(v.evext) + '\\ \\text{ft/s}\\)') : null },
          { id: 'ePext', symbol: 'P_{ext}', label: 'Power while extending', unit: 'hp / kW', kind: 'calc', digits: 4, compute: v => H.has(v, 'evext', 'eF') ? (ESI(v) ? v.evext * v.eF / 1000 : v.evext * v.eF / 550) : undefined },
          { id: 'eQcap', symbol: 'Q_{cap}', label: 'Flow in the cap-end line while extending', unit: 'gpm / m^3/s', kind: 'calc', digits: 4, compute: v => H.has(v, 'eQ', 'eAp', 'eAr') ? (v.circuit === 'regen' ? v.eQ * v.eAp / v.eAr : v.eQ) : undefined },
          { id: 'eQout', symbol: 'Q_{out}', label: 'Flow leaving the rod end (regular extension)', unit: 'gpm / m^3/s', kind: 'calc', digits: 4, compute: v => H.has(v, 'eQ', 'eAp', 'eAr') && v.circuit !== 'regen' ? v.eQ * (v.eAp - v.eAr) / v.eAp : undefined },
          { id: 'epret', symbol: 'p_{ret}', label: 'Pressure needed to retract', unit: 'psi / MPa', kind: 'calc', digits: 4, compute: v => H.has(v, 'eF', 'eAp', 'eAr') && v.eAp > v.eAr ? v.eF / (v.eAp - v.eAr) / (ESI(v) ? 1e6 : 1) : undefined },
          { id: 'evret', symbol: 'v_{ret}', label: 'Retraction velocity', unit: 'ft/s / m/s', kind: 'calc', digits: 4, compute: v => H.has(v, 'eQ', 'eAp', 'eAr') && v.eAp > v.eAr ? (ESI(v) ? v.eQ / (v.eAp - v.eAr) : v.eQ * 231 / 60 / 12 / (v.eAp - v.eAr)) : undefined },
          { id: 'eQret', symbol: 'Q_{out,ret}', label: 'Cap-end out-flow while retracting', unit: 'gpm / m^3/s', kind: 'calc', digits: 4, compute: v => H.has(v, 'eQ', 'eAp', 'eAr') && v.eAp > v.eAr ? v.eQ * v.eAp / (v.eAp - v.eAr) : undefined },
          { id: 'ePret', symbol: 'P_{ret}', label: 'Power while retracting', unit: 'hp / kW', kind: 'calc', digits: 4, compute: v => H.has(v, 'evret', 'eF') ? (ESI(v) ? v.evret * v.eF / 1000 : v.evret * v.eF / 550) : undefined },
        ],
        after: v => H.has(v, 'epext', 'epret') && H.has(v, 'pcyl') && !ESI(v) ? (Math.max(v.epext, v.epret) <= v.pcyl ? '<span class="result-ok">Both strokes need ≤ ' + H.fmt(v.pcyl) + ' psi.</span>' : '<span class="result-bad">One stroke needs more than ' + H.fmt(v.pcyl) + ' psi.</span>') : '' },
    ] },

    { title: 'Step 7: Pump flow rate (Parker i-8 / i-9)', steps: [
      { id: 'flow', title: 'Pump capacity for the required piston speed', fig: ['flowa', 'flowb', 'pumpx'],
        formula: 'Q = v_p A_p\\,\\frac{12}{231}\\ \\text{gpm}\\quad(v_p\\ \\text{ft/min},\\ A_p\\ \\text{in}^2) \\qquad Q = \\frac{v_p}{10}\\,Q_{table}',
        text: 'Push uses the bore area (regen: rod area), pull the annulus. Or type the pump flow if it is given.',
        vars: [
          { id: 'vp', symbol: 'v_p', label: 'Required piston speed', unit: 'ft/min', kind: 'input', hint: 'blank → v from step 2; in/s × 5' },
          { id: 'vpu', symbol: 'v_p', label: 'Piston speed used', unit: 'ft/min', kind: 'calc', compute: v => H.has(v, 'vp') ? v.vp : v.v },
          { id: 'Qg', symbol: 'Q_{given}', label: 'Pump flow, if given', unit: 'gpm', kind: 'input', hint: 'HW3 P1: 14 gpm' },
          { id: 'Qpush', symbol: 'Q_{push}', label: 'Flow for push at \\(v_p\\)', unit: 'gpm', kind: 'calc', digits: 4, compute: v => H.has(v, 'vpu', 'A1', 'A2') ? v.vpu * (v.circuit === 'regen' ? v.A2 : v.A1 + v.A2) * 12 / 231 : undefined,
            work: v => H.has(v, 'Qpush') ? '\\(Q_{push} = ' + TX(v.vpu) + '(' + TX(v.circuit === 'regen' ? v.A2 : v.A1 + v.A2, 4) + ')\\dfrac{12}{231} = ' + TX(v.Qpush, 4) + '\\ \\text{gpm}\\)' : null },
          { id: 'Qpull', symbol: 'Q_{pull}', label: 'Flow for pull at \\(v_p\\)', unit: 'gpm', kind: 'calc', digits: 4, compute: v => H.has(v, 'vpu', 'A1') ? v.vpu * v.A1 * 12 / 231 : undefined },
          { id: 'Q', symbol: 'Q', label: 'Pump flow used', unit: 'gpm', kind: 'calc', digits: 4, compute: v => H.has(v, 'Qg') ? v.Qg : (v.mode === 'pull' ? v.Qpull : v.Qpush) },
          { id: 'tstroke', symbol: 't', label: 'Time for one stroke', unit: 's', kind: 'calc', digits: 4, compute: v => H.has(v, 'L', 'vpu') && v.vpu > 0 ? v.L / (12 * v.vpu) * 60 : undefined },
        ] },
      { id: 'pump', title: 'Pump from a cycle time and displacement (Parker i-8 / i-9)', fig: ['pumpf', 'pumpx', 'pk-i10'],
        formula: 'Q_{cycle} = \\frac{(A_{bore} + A_{ann})\\,L\\cdot 60}{231\\,t_{cycle}} \\qquad d = \\frac{231\\,Q}{n\\,\\eta_v}\\ \\text{in}^3/\\text{rev}',
        text: 'Optional: total cycle time instead of a speed (Parker: 5 × 2 in, 18 in, 12 s → 14 gpm).',
        vars: [
          { id: 'tcyc', symbol: 't_{cycle}', label: 'Total cycle time (extend + retract)', unit: 's', kind: 'input' },
          { id: 'Qcyc', symbol: 'Q_{cycle}', label: 'Pump flow for that cycle time', unit: 'gpm', kind: 'calc', digits: 4, compute: v => H.has(v, 'tcyc', 'A1', 'A2', 'L') && v.tcyc > 0 ? (v.A1 + v.A2 + v.A1) * v.L * 60 / (231 * v.tcyc) : undefined },
          { id: 'rpm', symbol: 'n', label: 'Pump shaft speed', unit: 'rpm', kind: 'input', hint: '1800 or 1200 rpm' },
          { id: 'etav', symbol: '\\eta_v', label: 'Volumetric efficiency', kind: 'input', default: 1 },
          { id: 'disp', symbol: 'd', label: 'Required pump displacement', unit: 'in^3/rev', kind: 'calc', digits: 4, compute: v => { const Qn = H.has(v, 'Qcyc') ? Math.max(v.Qcyc, v.Q || 0) : v.Q; return H.has(v, 'rpm', 'etav') && Qn !== undefined && v.rpm > 0 && v.etav > 0 ? 231 * Qn / (v.rpm * v.etav) : undefined; } },
        ] },
    ] },

    { title: 'Step 8–10: Pipe sizing (≤ 15 ft/s)', steps: [
      { id: 'pipe', title: 'Minimum pipe diameter, then a standard pipe', fig: ['pipe', 'flowa', 'flowb'],
        formula: 'd_p = \\sqrt{\\frac{4Q}{\\pi v}\\cdot\\frac{231}{720}}\\ (Q\\ \\text{gpm},\\ v\\ \\text{ft/s}) \\qquad v_{act} = \\frac{Q\\,(231/60)}{12\\,(\\pi d_{ID}^2/4)}',
        text: 'Size for the largest line flow (regen: the cap-end line). Tubing can be bent; pipe is rigid and threaded.',
        vars: [
          { id: 'vmax', symbol: 'v_{max}', label: 'Max fluid velocity', unit: 'ft/s', kind: 'input', default: 15 },
          { id: 'Qline', symbol: 'Q_{line}', label: 'Line flow to size for', unit: 'gpm', kind: 'input', auto: v => H.has(v, 'Q') ? (v.circuit === 'regen' && v.mode !== 'pull' && H.has(v, 'A1', 'A2') && v.A2 > 0 ? v.Q * (v.A1 + v.A2) / v.A2 : v.Q) : undefined, hint: 'auto = pump flow (regen push: \\(Q A_p/A_r\\))' },
          { id: 'dpmin', symbol: 'd_{p,min}', label: 'Minimum pipe inside diameter', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'Qline', 'vmax') && v.vmax > 0 ? Math.sqrt(4 * v.Qline / (Math.PI * v.vmax) * 231 / 720) : undefined,
            work: v => H.has(v, 'dpmin') ? '\\(d_p = \\sqrt{\\dfrac{4(' + TX(v.Qline, 4) + ')}{\\pi(' + TX(v.vmax) + ')}\\cdot\\dfrac{231}{720}} = ' + TX(v.dpmin, 4) + '\\ \\text{in}\\)' : null },
          { id: 'sched', label: 'Pipe schedule', kind: 'choice', options: [{ label: 'Schedule 40 — low pressure', value: 40 }, { label: 'Schedule 80 — medium (default)', value: 80 }, { label: 'Schedule 160 — high pressure', value: 160 }], default: 80 },
          { id: 'nom', label: 'Nominal pipe size', kind: 'lookup', type: 'text', fig: 'pipe', hint: 'auto = table pick', auto: v => { const pk = pipePick(v); return pk ? pk.nom : undefined; } },
          { id: 'dID', symbol: 'd_{ID}', label: 'Pipe inside diameter', unit: 'in', kind: 'lookup', fig: 'pipe', auto: v => { const pk = pipePick(v); return pk ? pk.id : undefined; } },
          { id: 'vact', symbol: 'v_{act}', label: 'Actual fluid velocity', unit: 'ft/s', kind: 'calc', digits: 4, compute: v => H.has(v, 'Qline', 'dID') && v.dID > 0 ? v.Qline * 231 / 60 / (12 * A(v.dID)) : undefined },
        ],
        after: v => pipeTable(v) + (H.has(v, 'vact', 'vmax') ? (v.vact <= v.vmax ? '<span class="result-ok">' + H.fmt(v.vact, 3) + ' ft/s ≤ ' + H.fmt(v.vmax) + ' ft/s.</span>' : '<span class="result-bad">' + H.fmt(v.vact, 3) + ' ft/s > ' + H.fmt(v.vmax) + ' — next size up.</span>') : '') },
    ] },

    { title: 'Step 11–12: Motor horsepower (Parker Table c-1)', steps: [
      { id: 'hp', title: 'Pump drive power and standard motor', fig: ['hp', 'starters', 'pumpf'],
        formula: 'HP = \\frac{Q\\,p_{pump}}{1714\\,\\eta}\\quad(\\eta = 0.85) \\qquad HP = 0.000583\\,Qp\\ (\\text{Parker Basics})',
        text: 'Uses the pump (relief) pressure. Table c-1: at 4000 psi double the 2000-psi column.',
        vars: [
          { id: 'eff', symbol: '\\eta', label: 'Pump / drive efficiency', kind: 'input', default: 0.85 },
          { id: 'HP', symbol: 'HP', label: 'Required horsepower', unit: 'hp', kind: 'calc', digits: 4, compute: v => H.has(v, 'Q', 'p', 'eff') && v.eff > 0 ? v.Q * v.p / (1714 * v.eff) : undefined,
            work: v => H.has(v, 'HP') ? '\\(HP = \\dfrac{' + TX(v.Q, 4) + '(' + TX(v.p) + ')}{1714(' + TX(v.eff) + ')} = ' + TX(v.HP, 4) + '\\ \\text{hp}\\)' : null },
          { id: 'HPmotor', symbol: 'HP_{motor}', label: 'Standard motor selected', unit: 'hp', kind: 'lookup', fig: 'starters', auto: v => H.has(v, 'HP') ? nextStd(v.HP, MOTOR_HP) : undefined, hint: 'auto = next standard size (3-phase)' },
          { id: 'Phyd', symbol: 'P_{hyd}', label: 'Hydraulic power \\(Qp/1714\\)', unit: 'hp', kind: 'calc', digits: 4, compute: v => H.has(v, 'Q', 'p') ? v.Q * v.p / 1714 : undefined },
          { id: 'Tmot', symbol: 'T', label: 'Motor torque at the pump speed', unit: 'lb·in', kind: 'calc', digits: 4, compute: v => H.has(v, 'HP', 'rpm') && v.rpm > 0 ? 63025 * v.HP / v.rpm : undefined },
        ] },
    ] },

    { title: 'Step 13: Cushion deceleration pressure (Esposito 6-10 / 6-11)', steps: [
      { id: 'cush', title: 'Pressure in the cushion while stopping the load', eq: 'Esposito 6-10, 6-11', fig: ['cushion', 'keyeq'],
        formula: 'a = \\frac{v^2}{2S} \\qquad p_2 = \\frac{(W/g)\\,a + p_1 A_{piston} - (CF)\\,W}{A_{piston} - A_{plunger}}',
        text: 'Optional. Example 6-6: 1500 lb, 3-in piston, 1-in plunger, S = ¾ in, \\(p_1\\) = 750 psi, CF 0.12 → a = 5.51 ft/s\\(^2\\), \\(p_2\\) = 856 psi.',
        vars: [
          { id: 'dbc', symbol: 'd_{piston}', label: 'Piston (bore) diameter', unit: 'in', kind: 'input', auto: v => v.dbore },
          { id: 'dcp', symbol: 'd_{plunger}', label: 'Cushion plunger diameter', unit: 'in', kind: 'input' },
          { id: 'Wcu', symbol: 'W', label: 'Weight being stopped', unit: 'lb', kind: 'input', auto: v => v.Fw },
          { id: 'CF', symbol: 'CF', label: 'Coefficient of friction', kind: 'input', auto: v => v.mu },
          { id: 'vc', symbol: 'v', label: 'Piston speed entering the cushion', unit: 'ft/min', kind: 'input', auto: v => v.vpu },
          { id: 'Sc', symbol: 'S', label: 'Cushion length', unit: 'in', kind: 'input' },
          { id: 'p1', symbol: 'p_1', label: 'Pressure on the piston', unit: 'psi', kind: 'input', auto: v => v.pcyl },
          { id: 'ac', symbol: 'a', label: 'Deceleration', unit: 'ft/s^2', kind: 'calc', digits: 4, compute: v => H.has(v, 'vc', 'Sc') && v.Sc > 0 ? Math.pow(v.vc / 60, 2) / (2 * v.Sc / 12) : undefined },
          { id: 'p2', symbol: 'p_2', label: 'Cushion pressure', unit: 'psi', kind: 'calc', digits: 4, compute: v => H.has(v, 'dbc', 'dcp', 'Wcu', 'CF', 'ac', 'p1') && A(v.dbc) > A(v.dcp) ? (v.Wcu / 32.2 * v.ac + v.p1 * A(v.dbc) - v.CF * v.Wcu) / (A(v.dbc) - A(v.dcp)) : undefined,
            work: v => H.has(v, 'p2') ? '\\(p_2 = \\dfrac{(' + TX(v.Wcu) + '/32.2)(' + TX(v.ac, 4) + ') + ' + TX(v.p1) + '(' + TX(A(v.dbc), 4) + ') - ' + TX(v.CF) + '(' + TX(v.Wcu) + ')}{' + TX(A(v.dbc), 4) + ' - ' + TX(A(v.dcp), 4) + '} = ' + TX(v.p2) + '\\ \\text{psi}\\)' : null },
        ],
        after: v => H.has(v, 'p2', 'p1') ? (v.p2 > v.p1 ? '<span class="result-bad">Cushion ' + H.fmt(v.p2) + ' psi > ' + H.fmt(v.p1) + ' psi — rate the cylinder for ' + H.fmt(v.p2) + ' psi.</span>' : '<span class="result-ok">Cushion ' + H.fmt(v.p2) + ' psi ≤ ' + H.fmt(v.p1) + ' psi.</span>') : '' },
    ] },

    { title: 'Result', steps: [
      { id: 'result', title: 'Selected system and checks', fig: ['nonregen', 'regen', 'seqsym', 'seqckt', 'symchk', 'sym2w', 'symred'],
        vars: [],
        after: v => { if (!H.has(v, 'F', 'Fpush', 'Fpull')) return '<span>Complete steps 1–5.</span>';
          const r = v.mode === 'pull' ? v.Fpull : v.Fpush; const checks = [['thrust', r >= v.F]];
          if (H.has(v, 'vact', 'vmax')) checks.push(['pipe velocity', v.vact <= v.vmax]); if (H.has(v, 'p2', 'p1')) checks.push(['cushion', v.p2 <= v.p1]); if (H.has(v, 'HPmotor', 'HP')) checks.push(['motor', v.HPmotor >= v.HP]);
          const bad = checks.filter(c => !c[1]).map(c => c[0]); const pk = pipePick(v);
          const sys = (H.has(v, 'dbore') ? inch(v.dbore) + '-in bore × ' + (H.has(v, 'drod') ? inch(v.drod) : '?') + '-in rod, ' : '') + (H.has(v, 'L') ? H.fmt(v.L) + '-in stroke, ' : '') + (v.circuit === 'regen' ? 'regenerative' : 'regular') + ' circuit, ' + H.fmt(v.p) + ' psi; ' + (H.has(v, 'Q') ? H.fmt(v.Q, 3) + ' gpm; ' : '') + (pk ? inch(nomVal(pk.nom)) + '-in sch ' + v.sched + ' pipe; ' : '') + (H.has(v, 'HPmotor') ? H.fmt(v.HPmotor) + ' hp motor (' + H.fmt(v.HP, 3) + ' hp needed)' : '') + '.';
          return bad.length ? '<span class="result-bad"><b>FAIL</b> — ' + bad.join(', ') + '. ' + sys + '</span>' : '<span class="result-ok"><b>PASS</b> — ' + sys + '</span>'; } },
    ] },
  ],
};
