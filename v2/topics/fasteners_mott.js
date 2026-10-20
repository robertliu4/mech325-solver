// Bolted joints — Mott Ch. 19-2 … 19-6 (Example 19-1) + Mott 20-3 (Example 20-1) with Shigley Ch. 8 joint analysis (Fizz §5.4)
// Course alignment (v2/COURSE_CONVENTIONS.md §14): Module 5 reading guide — Mott 19-2, 19-4, 19-6 and 20-3 as alternatives / beneficial to
// Shigley 8-x. Joint stiffness, C, safety factors and fatigue stay Shigley's (Mott has none). Course worked numbers: HW5 P1–P3, final-exam
// review Scenario 3, STQ 2022 (8-34) — all Shigley problems, reproduced here with the same steps (see v2/notes/past_exam_m5.md).
// Verified against: Mott Example 19-1 (the `example`: 12 000 lb clamp, 3 bolts, SAE 5, K 0.15) → P 4000 lb, σall 63.75 ksi, At,req 0.0627 in²
//   → ⅜-16 UNC (At 0.0775, ★ in the size table), T = KDP = 225 lb·in — reproduced.
// Verified against: Mott Example 20-1 (P 3500 lb, a 12 in, 4 bolts at (±2.0, ±1.5) in, A325 τallow 17.5 ksi): Fs 875, M 42 000, r 2.50,
//   Σr² 25, F1 4200, R1 4928 lb, As 0.282 in², D 0.599 → 5/8 in — reproduced.
// Verified against (same steps as the Shigley page): Shigley Ex. 8-4 / 8-5 / 8-7, HW5 P1 (km 4.19 Mlbf/in), HW5 P2 (nL 1.60, n0 1.20,
//   nf 0.856), HW5 P3 (n 0.728 / 1.07 / 0.534 / 1.91), final review Scenario 3 (np 1.02, nf 15.2), STQ 8-34 (nf 2.77, Gerber 4.19, nL 3.50).
// Bolt grades: [label, unitSystem, [ [dmax, Sp, Sut, Sy, Se], ... ] ]  (US: in & kpsi, Table 8-9/8-10/8-17; SI: mm & MPa, Table 8-11/8-17)
const BOLT_GRADES = {
  sae1: ['SAE 1 (¼–1½ in)', 'US', [[1e9, 33, 60, 36, null]]],
  sae2: ['SAE 2 (¼–¾: 55/74/57; ⅞–1½: 33/60/36)', 'US', [[0.75, 55, 74, 57, null], [1e9, 33, 60, 36, null]]],
  sae4: ['SAE 4 (¼–1½ in)', 'US', [[1e9, 65, 115, 100, null]]],
  sae5: ['SAE 5 (¼–1: 85/120/92; 1⅛–1½: 74/105/81)', 'US', [[1, 85, 120, 92, 18.6], [1e9, 74, 105, 81, 16.3]]],
  sae52: ['SAE 5.2 (¼–1 in)', 'US', [[1e9, 85, 120, 92, null]]],
  sae7: ['SAE 7 (¼–1½ in)', 'US', [[1e9, 105, 133, 115, 20.6]]],
  sae8: ['SAE 8 (¼–1½ in)', 'US', [[1e9, 120, 150, 130, 23.2]]],
  sae82: ['SAE 8.2 (¼–1 in)', 'US', [[1e9, 120, 150, 130, null]]],
  a307: ['ASTM A307 (¼–1½ in)', 'US', [[1e9, 33, 60, 36, null]]],
  a325: ['ASTM A325 (½–1: 85/120/92; 1⅛–1½: 74/105/81)', 'US', [[1, 85, 120, 92, null], [1e9, 74, 105, 81, null]]],
  a354bc: ['ASTM A354 BC (¼–2½: 105/125/109; 2¾–4: 95/115/99)', 'US', [[2.5, 105, 125, 109, null], [1e9, 95, 115, 99, null]]],
  a354bd: ['ASTM A354 BD (¼–4 in)', 'US', [[1e9, 120, 150, 130, null]]],
  a449: ['ASTM A449 (¼–1: 85/120/92; 1⅛–1½: 74/105/81; 1¾–3: 55/90/58)', 'US', [[1, 85, 120, 92, null], [1.5, 74, 105, 81, null], [1e9, 55, 90, 58, null]]],
  a490: ['ASTM A490 (½–1½ in)', 'US', [[1e9, 120, 150, 130, null]]],
  iso46: ['ISO 4.6 (M5–M36)', 'SI', [[1e9, 225, 400, 240, null]]],
  iso48: ['ISO 4.8 (M1.6–M16)', 'SI', [[1e9, 310, 420, 340, null]]],
  iso58: ['ISO 5.8 (M5–M24)', 'SI', [[1e9, 380, 520, 420, null]]],
  iso88: ['ISO 8.8 (M16–M36)', 'SI', [[1e9, 600, 830, 660, 129]]],
  iso98: ['ISO 9.8 (M1.6–M16)', 'SI', [[1e9, 650, 900, 720, 140]]],
  iso109: ['ISO 10.9 (M5–M36)', 'SI', [[1e9, 830, 1040, 940, 162]]],
  iso129: ['ISO 12.9 (M1.6–M36)', 'SI', [[1e9, 970, 1220, 1100, 190]]],
};
// Table 8-2: [size, d, UNC n, At, Ar, UNF n, At, Ar]; Table 8-1: [d mm, coarse p, At, Ar, fine p, At, Ar]
const UN = [['10', 0.19, 24, 0.0175, 0.0145, 32, 0.02, 0.0175], ['12', 0.216, 24, 0.0242, 0.0206, 28, 0.0258, 0.0226], ['1/4', 0.25, 20, 0.0318, 0.0269, 28, 0.0364, 0.0326],
  ['5/16', 0.3125, 18, 0.0524, 0.0454, 24, 0.058, 0.0524], ['3/8', 0.375, 16, 0.0775, 0.0678, 24, 0.0878, 0.0809], ['7/16', 0.4375, 14, 0.1063, 0.0933, 20, 0.1187, 0.109],
  ['1/2', 0.5, 13, 0.1419, 0.1257, 20, 0.1599, 0.1486], ['9/16', 0.5625, 12, 0.182, 0.162, 18, 0.203, 0.189], ['5/8', 0.625, 11, 0.226, 0.202, 18, 0.256, 0.24],
  ['3/4', 0.75, 10, 0.334, 0.302, 16, 0.373, 0.351], ['7/8', 0.875, 9, 0.462, 0.419, 14, 0.509, 0.48], ['1', 1, 8, 0.606, 0.551, 12, 0.663, 0.625],
  ['1 1/4', 1.25, 7, 0.969, 0.89, 12, 1.073, 1.024], ['1 1/2', 1.5, 6, 1.405, 1.294, 12, 1.581, 1.521]];
const ISO = [[3, 0.5, 5.03, 4.47], [4, 0.7, 8.78, 7.75], [5, 0.8, 14.2, 12.7], [6, 1, 20.1, 17.9], [8, 1.25, 36.6, 32.8, 1, 39.2, 36.0], [10, 1.5, 58.0, 52.3, 1.25, 61.2, 56.3],
  [12, 1.75, 84.3, 76.3, 1.25, 92.1, 86.0], [14, 2, 115, 104, 1.5, 125, 116], [16, 2, 157, 144, 1.5, 167, 157], [20, 2.5, 245, 225, 1.5, 272, 259], [24, 3, 353, 324, 2, 384, 365],
  [30, 3.5, 561, 519, 2, 621, 596], [36, 4, 817, 759, 2, 915, 884], [42, 4.5, 1120, 1050, 2, 1260, 1230], [48, 5, 1470, 1380, 2, 1670, 1630]];
const WILEMAN = { steel: [0.78715, 0.62873, 30.0, 207], aluminum: [0.79670, 0.63816, 10.3, 71], copper: [0.79568, 0.63553, 17.3, 119], ci: [0.77871, 0.61616, 14.5, 100], general: [0.78952, 0.62914, null, null] };
const FS_SI = v => v.units === 'SI';
const gradeRowAt = (v, g, d) => { const G = BOLT_GRADES[g]; if (!G || d === undefined) return undefined; return G[2].find(r => d <= r[0]) || G[2][G[2].length - 1]; };
const gradeRow = v => gradeRowAt(v, v.grade, v.d);
function mottSizeTable(v) {
  if (!H.has(v, 'Atreq')) return '';
  const list = threads(v); const k = list.findIndex(t => t.At >= v.Atreq - 1e-9); if (k < 0) return '<span class="result-bad">Larger than the table — more bolts.</span>';
  return H.table(['Thread', '\\(A_t\\)', '\\(A_t \\ge A_{t,req}\\)?'], list.slice(Math.max(0, k - 2), k + 4).map(t => ({ cells: [t.lab + (t.d === v.d ? ' ✔' : ''), t.At, t.At >= v.Atreq ? 'yes' : 'no'], ok: t.At >= v.Atreq, pick: t === list[k],
    set: FS_SI(v) ? { d: t.d, pitch: t.p, At: t.At } : { d: t.d, tpi: t.n, At: t.At } })),
    { caption: 'Select the bolt — Table ' + (FS_SI(v) ? '19-5' : '19-4') + ', \\(A_{t,req} = ' + TX(v.Atreq, 4) + '\\)', note: 'Rule (Mott Ex. 19-1): the smallest thread with \\(A_t \\ge A_{t,req}\\). Use also fills step 1.' });
}
const KS = v => FS_SI(v) ? 1 : 1000;
const frust = (E, d, t, D) => { if (!(E > 0 && d > 0 && t > 0 && D > d)) return undefined; const a = 1.155 * t; return 0.5774 * Math.PI * E * d / Math.log((a + D - d) * (D + d) / ((a + D + d) * (D - d))); };
const fracTex = s => s.replace(/^(\d+) (\d+)\/(\d+)$/, '$1\\tfrac{$2}{$3}').replace(/^(\d+)\/(\d+)$/, '\\tfrac{$1}{$2}');
const TX = (x, d) => String(H.fmt(x, d)).replace(/e([+-]?)(\d+)$/, (m, s, e) => '\\times10^{' + (s === '-' ? '-' : '') + e + '}');
// thread list for the unit system: {lab, d, n|p, At, Ar, series}
function threads(v) {
  if (FS_SI(v)) { const fine = H.has(v, 'pitch', 'd') && ISO.some(r => r[0] === v.d && r[4] === v.pitch && r[1] !== v.pitch);
    return ISO.filter(r => !fine || r[4]).map(r => fine ? { lab: 'M' + r[0] + ' × ' + r[4], d: r[0], p: r[4], At: r[5], Ar: r[6] } : { lab: 'M' + r[0] + ' × ' + r[1], d: r[0], p: r[1], At: r[2], Ar: r[3] }); }
  const fine = H.has(v, 'tpi', 'd') && UN.some(r => r[1] === v.d && r[5] === v.tpi && r[2] !== v.tpi);
  return UN.map(r => fine ? { lab: '\\(' + fracTex(r[0]) + '\\)-' + r[5] + ' UNF', d: r[1], n: r[5], At: r[6], Ar: r[7] } : { lab: '\\(' + fracTex(r[0]) + '\\)-' + r[2] + ' UNC', d: r[1], n: r[2], At: r[3], Ar: r[4] });
}
// static factors for a candidate bolt (At, Sp) with the current C, P and preload rule
function facs(v, At, Sp) {
  if (!H.has(v, 'C', 'P') || !(v.P > 0)) return undefined; const Fi = v.preload === 0 ? v.Fig : v.preload * At * Sp; if (Fi === undefined) return undefined;
  return { np: Sp * At / (v.C * v.P + Fi), nL: (Sp * At - Fi) / (v.C * v.P), n0: Fi / (v.P * (1 - v.C)) };
}
const okF = (v, f) => f && f.np >= 1 && f.nL >= (H.has(v, 'nLt') ? v.nLt : 1) && f.n0 >= 1;
function sizeTable(v) {
  const r0 = BOLT_GRADES[v.grade]; if (!r0 || r0[1] !== (FS_SI(v) ? 'SI' : 'US') || !H.has(v, 'C', 'P')) return '';
  const list = threads(v).map(t => { const g = gradeRowAt(v, v.grade, t.d); const f = g ? facs(v, t.At, g[1] * KS(v)) : undefined; return { t, f }; });
  const pk = list.find(x => okF(v, x.f)); const i = pk ? list.indexOf(pk) : list.findIndex(x => x.t.d === v.d);
  const shown = list.slice(Math.max(0, (i < 0 ? 0 : i) - 3), (i < 0 ? 0 : i) + 4);
  return H.table(['Thread', '\\(A_t\\)', '\\(n_p\\)', '\\(n_L\\)', '\\(n_0\\)'], shown.map(x => ({ cells: [x.t.lab + (x.t.d === v.d ? ' ✔' : ''), x.t.At, x.f ? H.fmt(x.f.np, 3) : '—', x.f ? H.fmt(x.f.nL, 3) : '—', x.f ? H.fmt(x.f.n0, 3) : '—'],
    ok: okF(v, x.f), pick: x === pk, set: FS_SI(v) ? { d: x.t.d, pitch: x.t.p, At: x.t.At } : { d: x.t.d, tpi: x.t.n, At: x.t.At } })),
    { caption: 'Select the bolt size — Table ' + (FS_SI(v) ? '8-1' : '8-2') + ', ' + BOLT_GRADES[v.grade][0].split(' (')[0] + ', P = ' + H.fmt(v.P, 4) + ' per bolt', note: 'Rule: the smallest size with \\(n_p \\ge 1\\), \\(n_0 \\ge 1\\) and \\(n_L \\ge\\) ' + (H.has(v, 'nLt') ? H.fmt(v.nLt) + ' (target)' : '1') + '; C is held at the current ' + H.fmt(v.C, 3) + ' (it changes slightly with d — Use recomputes). Standard sizes are catalogued by the major diameter.' });
}
function gradeTable(v) {
  if (!H.has(v, 'd', 'At')) return '';
  const sys = FS_SI(v) ? 'SI' : 'US';
  const rows = Object.keys(BOLT_GRADES).filter(k => BOLT_GRADES[k][1] === sys).map(k => { const g = gradeRowAt(v, k, v.d); return { k, g, f: facs(v, v.At, g[1] * KS(v)) }; }).sort((a, b) => a.g[1] - b.g[1] || a.g[2] - b.g[2]);
  const pk = rows.find(x => okF(v, x.f));
  return H.table(['Grade', '\\(S_p\\)', '\\(S_{ut}\\)', '\\(S_y\\)', '\\(S_e\\)', '\\(n_L\\)', '\\(n_0\\)'], rows.map(x => ({ cells: [BOLT_GRADES[x.k][0].split(' (')[0] + (v.grade === x.k ? ' ✔' : ''), x.g[1], x.g[2], x.g[3], x.g[4] || '—', x.f ? H.fmt(x.f.nL, 3) : '—', x.f ? H.fmt(x.f.n0, 3) : '—'],
    ok: x.f ? okF(v, x.f) : undefined, pick: x === pk, set: { grade: x.k, Sp: '', Sut: '', Sy: '', Se: '' } })),
    { caption: 'Bolt grades for d = ' + H.fmt(v.d) + (FS_SI(v) ? ' mm (Table 8-11, MPa)' : ' in (Tables 8-9 / 8-10, kpsi)'), note: 'Rule: the lowest-strength grade that meets \\(n_L\\) (target or 1) and \\(n_0 \\ge 1\\). Metric class X.Y: \\(S_{ut} \\approx 100X\\) MPa, \\(S_y \\approx 0.1Y\\,S_{ut}\\) (4.8 → 400 / 320 MPa). Rolled threads have a higher endurance strength than cut threads.' });
}

window.TOPIC = {
  id: 'fasteners', book: 'mott',
  title: 'Bolted Joints — Stiffness, Preload, Safety Factors, Fatigue & Shear',
  subtitle: 'Mott Ch. 19-2 … 19-6, 20-3 (Examples 19-1, 20-1) · joint analysis from Shigley Ch. 8 · Fizz guide §5.4',
  sibling: 'fasteners_shigley.html',
  intro: 'Mott 19 sizes the bolt from the clamping load (0.75 × proof) and gives the torque T = KDP and thread stripping; joint stiffness, C, safety factors and fatigue follow Shigley Ch. 8 (Mott has none), and eccentric shear joints Mott 20-3 / Shigley 8-12. '
    + 'Units: US (in, lbf, psi) or SI (mm, N, MPa).',
  example: { units: 'US', Pclamp: 12000, Nm: 3, grade: 'sae5', d: 0.375, tpi: 16, Km: 0.15, Ptot: 12000, N: 3, preload: 0.75, K: 0.15 },

  assumptions: [
    { text: 'Mott sizing: allowable stress = 0.75 × proof strength (clamping load 0.75 × proof load)', src: 'Mott §19-4 · Fizz p.153', var: 'fprf' },
    { text: 'Mott torque T = KDP with K = 0.15 (commercial, any lubricant; 0.20 clean and dry)', src: 'Mott Eq. 19-3', var: 'Km' },
    { text: 'Mott 20-1 sizes shear bolts with the AISC allowable of Table 20-1 (A325 / A449: 17.5 ksi)', src: 'Mott Table 20-1', var: 'tall' },
    { text: 'Bolt length rounded up to the nearest ¼ in (SI: next 5 mm) above l + H (nut) or h + 1.5d (cap screw)', src: 'Fizz p.147', var: 'L' },
    { text: 'Steel bolt E = 30 Mpsi (207 GPa) unless stated', src: 'Shigley Table A-5', var: 'Eb' },
    { text: 'Pressure cone at 30° from a washer-face diameter 1.5d, widening to mid-grip, then converging', src: 'Fizz p.149', var: 'f1D' },
    { text: 'Frustum hole diameter = bolt d for plates, the inner diameter for washers', src: 'Fizz p.150', var: 'f1d' },
    { text: 'Identical halves: compute the top half and halve it, \\(k_m = k_{top}/2\\)', src: 'Fizz pp.150–151', step: 'frustak' },
    { text: 'Preload \\(F_i = 0.75A_tS_p\\) for reused fasteners (0.90 for permanent joints)', src: 'Fizz p.153', var: 'preload' },
    { text: 'Torque factor K = 0.20 when the bolt condition is not stated (0.18 lubricated)', src: 'Fizz p.153 · Shigley §8-8', var: 'K' },
    { text: 'Fatigue: Goodman with the fully corrected \\(S_e\\) of Table 8-17; repeated load 0 → P', src: 'Fizz pp.154–155', var: 'Pmin' },
    { text: 'Shear joints: \\(n_d\\) = 1.5 and bolt shear yield \\(0.577S_y\\)', src: 'Shigley Ex. 8-6', var: 'ndsj' },
  ],

  figures: [
    { id: 'table19-1', ref: 'Table 19-1', title: 'SAE grades of steels for fasteners (tensile, yield, proof, ksi)', src: 'figures/mott/table19-1.png', page: 710 },
    { id: 'table19-2', ref: 'Table 19-2', title: 'ASTM grades for bolt steels', src: 'figures/mott/table19-2.png', page: 711 },
    { id: 'table19-3', ref: 'Table 19-3', title: 'Metric grades of steels for bolts (MPa)', src: 'figures/mott/table19-3.png', page: 711 },
    { id: 'table19-4', ref: 'Table 19-4', title: 'American Standard threads: UNC / UNF tensile-stress areas', src: 'figures/mott/table19-4.png', page: 712 },
    { id: 'table19-5', ref: 'Table 19-5', title: 'Metric threads: coarse / fine tensile-stress areas', src: 'figures/mott/table19-5.png', page: 713 },
    { id: 'fig8-13', book: 'shigley', ref: 'Figure 8-13 / 8-14', title: 'Tension-loaded bolted joint with nut (a) and cap screw (b); l = grip', src: 'figures/shigley/fig8-13-14.png', page: 457 },
    { id: 'table8-7', book: 'shigley', ref: 'Table 8-7', title: 'Procedure for fastener stiffness (grip, length, \\(L_T\\), \\(l_d\\), \\(l_t\\), \\(k_b\\))', src: 'figures/shigley/table8-7.png', page: 459 },
    { id: 'table8-2', book: 'shigley', ref: 'Table 8-2', title: 'UNC / UNF: tensile-stress area \\(A_t\\) and minor-diameter area \\(A_r\\)', src: 'figures/shigley/table8-2.png', page: 446 },
    { id: 'table8-1', book: 'shigley', ref: 'Table 8-1', title: 'Metric coarse / fine: \\(A_t\\) and \\(A_r\\)', src: 'figures/shigley/table8-1.png', page: 445 },
    { id: 'fig8-15', book: 'shigley', ref: 'Figure 8-15', title: 'Member compression as a hollow-cone frustum (\\(\\alpha = 30^\\circ\\))', src: 'figures/shigley/fig8-15.png', page: 460 },
    { id: 'fig8-17', book: 'shigley', ref: 'Figure 8-17', title: 'Example 8-2: frusta through a washer + two plates', src: 'figures/shigley/fig8-17.png', page: 463, note: 'Start at 1.5d on the washer face, spread at 30° to mid-grip, then converge; a new frustum at each material change.' },
    { id: 'table8-8', book: 'shigley', ref: 'Table 8-8', title: 'Wileman stiffness parameters A, B and E', src: 'figures/shigley/table8-8.png', page: 462 },
    { id: 'fig8-16', book: 'shigley', ref: 'Figure 8-16', title: 'Dimensionless member stiffness \\(k_m/(Ed)\\) vs d/l', src: 'figures/shigley/fig8-16.png', page: 462 },
    { id: 'fig8-18', book: 'shigley', ref: 'Figure 8-18 / 8-19', title: 'Spring model of preload + external load; force–deflection diagram', src: 'figures/shigley/fig8-18-19.png', page: 468 },
    { id: 'table8-9', book: 'shigley', ref: 'Table 8-9', title: 'SAE bolt grades: proof, tensile, yield strength (kpsi)', src: 'figures/shigley/table8-9.png', page: 465 },
    { id: 'table8-10', book: 'shigley', ref: 'Table 8-10', title: 'ASTM bolt grades', src: 'figures/shigley/table8-10.png', page: 466 },
    { id: 'table8-11', book: 'shigley', ref: 'Table 8-11', title: 'Metric property classes (MPa)', src: 'figures/shigley/table8-11.png', page: 467 },
    { id: 'table8-15', book: 'shigley', ref: 'Table 8-15', title: 'Torque factor K for \\(T = KF_id\\)', src: 'figures/shigley/table8-15.png', page: 471 },
    { id: 'table8-17', book: 'shigley', ref: 'Table 8-17', title: 'Fully corrected endurance strengths \\(S_e\\) for rolled threads (\\(K_f\\) included)', src: 'figures/shigley/table8-17.png', page: 478 },
    { id: 'fig8-28', book: 'shigley', ref: 'Figure 8-28', title: 'Centroid of a bolt group (Eq. 8-56) — the pivot for the moment', src: 'figures/shigley/fig8-28.png', page: 488 },
    { id: 'fig8-29', book: 'shigley', ref: 'Figure 8-29', title: 'Beam bolted at both ends: primary (\\(F\'\\)) and secondary (\\(F\'\'\\)) shear', src: 'figures/shigley/fig8-29.png', page: 489 },
    { id: 'fig8-30', book: 'shigley', ref: 'Figure 8-30', title: 'Example 8-7: bar cantilevered to a channel with four M16 bolts (mm)', src: 'figures/shigley/fig8-30.png', page: 490 },
    { id: 'fig8-31', book: 'shigley', ref: 'Figure 8-31', title: 'Example 8-7: vector sum of \\(F\'\\) and \\(F\'\'\\) at each bolt', src: 'figures/shigley/fig8-31.png', page: 491, note: '\\(F\' = 4\\) kN, \\(F\'\' = 17.7\\) kN → \\(F_A = F_B = 21.0\\) kN.' },
    { id: 'fig8-22', book: 'shigley', ref: 'Figure 8-22', title: 'Fluctuating-stress diagram: Goodman line and the bolt load line from \\(\\sigma_i\\)', src: 'figures/shigley/fig8-22.png', page: 479 },
    { id: 'fig20-4', ref: 'Figure 20-4', title: 'Eccentrically loaded bolted joint: motor bracket, P at distance a', src: 'figures/mott/fig20-4.png', page: 727 },
    { id: 'table20-1', ref: 'Table 20-1', title: 'AISC allowable stresses for bolts: shear and tension by ASTM grade', src: 'figures/mott/table20-1.png', page: 727, note: 'Shear: A307 10 ksi, A325/A449 17.5 ksi, A490 22 ksi.' },
    { id: 'fig20-5', ref: 'Figure 20-5', title: 'Example 20-1: 4-bolt pattern and forces on bolt 1 (\\(F_s\\) = 875, \\(F_1\\) = 4200, \\(R_1\\) = 4928 lb)', src: 'figures/mott/fig20-5.png', page: 728 },
  ],

  sections: [
    { title: 'Mott 19-4: Size the bolt from the clamping load (Example 19-1)', steps: [
      { id: 'msize', title: 'Clamping load per bolt → required area → bolt', eq: '19-1, 19-2', fig: ['table19-1', 'table19-2', 'table19-3', 'table19-4', 'table19-5'],
        formula: 'P = \\frac{P_{clamp}}{N} \\qquad \\sigma_{allow} = 0.75\\,S_p \\qquad A_{t,req} = \\frac{P}{\\sigma_{allow}}',
        text: 'Pick the grade (step 4), then the smallest thread with \\(A_t \\ge A_{t,req}\\) — the table below; Use fills step 1.',
        vars: [
          { id: 'Pclamp', symbol: 'P_{clamp}', label: 'Total clamping force required', unit: 'lb / N', kind: 'input' },
          { id: 'Nm', symbol: 'N', label: 'Number of bolts sharing it', kind: 'input', default: 1 },
          { id: 'Pb1', symbol: 'P', label: 'Clamping load per bolt', unit: 'lb / N', kind: 'calc', digits: 4, compute: v => H.has(v, 'Pclamp', 'Nm') && v.Nm > 0 ? v.Pclamp / v.Nm : undefined },
          { id: 'fprf', label: 'Fraction of proof strength', kind: 'input', default: 0.75 },
          { id: 'Spm', symbol: 'S_p', label: 'Proof strength of the grade', unit: 'psi / MPa', kind: 'lookup', fig: 'table19-1', auto: v => { const g = BOLT_GRADES[v.grade]; const r = g ? g[2][0] : undefined; const r2 = gradeRow(v) || r; return r2 ? r2[1] * KS(v) : undefined; }, hint: 'auto from the grade in step 4' },
          { id: 'sall', symbol: '\\sigma_{allow}', label: 'Allowable bolt stress', unit: 'psi / MPa', kind: 'calc', digits: 4, compute: v => H.has(v, 'fprf', 'Spm') ? v.fprf * v.Spm : undefined },
          { id: 'Atreq', symbol: 'A_{t,req}', label: 'Required tensile-stress area', unit: 'in^2 / mm^2', kind: 'calc', digits: 4, compute: v => H.has(v, 'Pb1', 'sall') && v.sall > 0 ? v.Pb1 / v.sall : undefined,
            work: v => H.has(v, 'Atreq') ? '\\(A_{t,req} = \\dfrac{' + TX(v.Pb1, 4) + '}{' + TX(v.fprf) + '(' + TX(v.Spm) + ')} = ' + TX(v.Atreq, 4) + '\\)' : null },
        ],
        after: v => mottSizeTable(v) },
      { id: 'mtq', title: 'Mott 19-4: tightening torque', eq: '19-3', formula: 'T = K D P',
        vars: [
          { id: 'Km', symbol: 'K', label: 'Torque constant (Mott)', kind: 'input', default: 0.15, hint: '0.15 commercial; 0.20 clean & dry' },
          { id: 'Tm', symbol: 'T', label: 'Tightening torque (Eq. 19-3)', unit: 'lb·in / N·mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'Km', 'd', 'Pb1') ? v.Km * v.d * v.Pb1 : undefined,
            work: v => H.has(v, 'Tm') ? '\\(T = ' + TX(v.Km) + '(' + TX(v.d) + ')(' + TX(v.Pb1, 4) + ') = ' + TX(v.Tm, 4) + '\\)' : null },
        ] },
      { id: 'strip', title: 'Mott 19-6: thread stripping — length of engagement', eq: '19-14, 19-15, 19-12', fig: ['table19-4'],
        formula: 'L_e = \\frac{4A_t}{\\pi\\,PD_{nom}}\\ (\\text{equal strength}) \\qquad L_e \\approx \\frac{S_{ut,B}}{S_{ut,N}}\\,\\frac{2A_t}{\\pi D\\,[0.5 + 0.57735\\,n(D - PD_{nom})]}\\ (\\text{weaker nut})',
        text: 'Engagement that makes the threads as strong in shear as the bolt in tension (not in Shigley). Nominal dimensions are used.',
        vars: [
          { id: 'PDnom', symbol: 'PD_{nom}', label: 'Nominal pitch diameter', unit: 'in / mm', kind: 'lookup', fig: 'table19-4', auto: v => { if (!H.has(v, 'd')) return undefined; if (FS_SI(v)) return H.has(v, 'pitch') ? v.d - 0.6495 * v.pitch : undefined; return H.has(v, 'tpi') ? v.d - 0.6495 / v.tpi : undefined; }, hint: 'auto = d − 0.6495p' },
          { id: 'Leq', symbol: 'L_{e}', label: 'Required engagement, nut as strong as bolt', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => (H.has(v, 'At', 'PDnom') && v.PDnom > 0) ? 4 * v.At / (Math.PI * v.PDnom) : undefined },
          { id: 'SutN', symbol: 'S_{ut,N}', label: 'Tensile strength of a weaker nut / tapped member', unit: 'psi / MPa', kind: 'input', hint: 'e.g. gray CI 25 ksi' },
          { id: 'Lew', symbol: 'L_{e,weak}', label: 'Required engagement, weaker member', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => { if (!H.has(v, 'SutN', 'Sut', 'At', 'd', 'PDnom') || v.SutN <= 0) return undefined; const n = FS_SI(v) ? (H.has(v, 'pitch') ? 1 / v.pitch : undefined) : v.tpi; if (!n) return undefined; return v.Sut / v.SutN * 2 * v.At / (Math.PI * v.d * (0.5 + 0.57735 * n * (v.d - v.PDnom))); } },
          { id: 'Leact', symbol: 'L_{e,actual}', label: 'Actual engagement (nut height or tapped depth)', unit: 'in / mm', kind: 'input', auto: v => v.joint === 'b' ? v.t2 : v.Hn },
        ],
        after: v => { const req = H.has(v, 'Lew') ? v.Lew : v.Leq; if (!H.has(v, 'Leact') || req === undefined) return '';
          return v.Leact >= req ? '<span class="result-ok">Engagement ' + H.fmt(v.Leact, 4) + ' ≥ ' + H.fmt(req, 4) + ' — the bolt fails before the threads strip.</span>' : '<span class="result-bad">Engagement ' + H.fmt(v.Leact, 4) + ' &lt; ' + H.fmt(req, 4) + ' — threads strip first.</span>'; } },
    ] },
    { title: 'Step 1 (Shigley): Bolt, grip and length', steps: [
      { id: 'bolt', title: 'Bolt size and thread', fig: ['table19-4', 'table19-5', 'table8-2', 'table8-1'],
        formula: 'A_d = \\frac{\\pi d^2}{4} \\qquad A_t = 0.7854\\left(d - \\frac{0.9743}{n}\\right)^2\\ (\\text{UN}) \\quad A_t = 0.7854(d - 0.9382p)^2\\ (\\text{metric})',
        text: 'Read \\(A_t\\) from Table 8-2 / 8-1 (the auto value is the same formula). The size table below appears once the load and C are known.',
        vars: [
          { id: 'units', label: 'Unit system', kind: 'choice', type: 'text', options: [{ label: 'US: in, lbf, psi', value: 'US' }, { label: 'SI: mm, N, MPa', value: 'SI' }], default: 'US' },
          { id: 'd', symbol: 'd', label: 'Nominal (major) bolt diameter', unit: 'in / mm', kind: 'input' },
          { id: 'tpi', symbol: 'n', label: 'Threads per inch (US)', kind: 'input', hint: '⅝-11 UNC → 11' },
          { id: 'pitch', symbol: 'p', label: 'Pitch (metric)', unit: 'mm', kind: 'input', hint: 'M12 × 1.75 → 1.75' },
          { id: 'Ad', symbol: 'A_d', label: 'Major-diameter area', unit: 'in^2 / mm^2', kind: 'calc', digits: 4, compute: v => H.has(v, 'd') ? Math.PI * v.d * v.d / 4 : undefined },
          { id: 'At', symbol: 'A_t', label: 'Tensile-stress area', unit: 'in^2 / mm^2', kind: 'lookup', fig: 'table8-2', hint: 'Table 8-2 / 8-1', auto: v => { if (!H.has(v, 'd')) return undefined;
              if (FS_SI(v)) return H.has(v, 'pitch') ? 0.7854 * Math.pow(v.d - 0.9382 * v.pitch, 2) : undefined; return H.has(v, 'tpi') ? 0.7854 * Math.pow(v.d - 0.9743 / v.tpi, 2) : undefined; } },
          { id: 'Eb', symbol: 'E', label: 'Bolt modulus', unit: 'psi / MPa', kind: 'input', auto: v => FS_SI(v) ? 207000 : 30e6, hint: 'steel 30 Mpsi / 207 GPa' },
        ],
        after: v => sizeTable(v) },
      { id: 'grip', title: 'Joint members (Table 8-7)', fig: ['table8-7', 'fig8-13'],
        formula: '(a)\\; l = \\sum t,\\;\\; L > l + H \\qquad (b)\\; l = h + \\tfrac{t_2}{2}\\ (t_2 < d)\\ \\text{or}\\ h + \\tfrac{d}{2},\\;\\; L > h + 1.5d',
        text: '(a) bolt and nut: the grip is everything clamped, washers included. (b) cap screw into a tapped member of thickness \\(t_2\\); h = washer + upper member.',
        vars: [
          { id: 'joint', label: 'Joint type', kind: 'choice', type: 'text', options: [{ label: '(a) Bolt with nut', value: 'a' }, { label: '(b) Cap screw into a tapped member', value: 'b' }], default: 'a' },
          { id: 'tw1', symbol: 't_{w1}', label: 'Washer under the head', unit: 'in / mm', kind: 'input', default: 0, hint: 'Table A-32: ½ N = 0.095 in' },
          { id: 't1', symbol: 't_1', label: 'Upper member thickness', unit: 'in / mm', kind: 'input' },
          { id: 't2', symbol: 't_2', label: 'Lower member thickness', unit: 'in / mm', kind: 'input' },
          { id: 'tw2', symbol: 't_{w2}', label: 'Washer under the nut (a)', unit: 'in / mm', kind: 'input', default: 0 },
          { id: 'Hn', symbol: 'H', label: 'Nut height (a)', unit: 'in / mm', kind: 'input', hint: 'Table A-31; ½ in: 7/16, ⅝ in: 35/64' },
        ] },
      { id: 'glen', title: 'Grip length and bolt length', fig: ['table8-7'],
        vars: [
          { id: 'h', symbol: 'h', label: '\\(h = t_{w1} + t_1\\) (b)', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => (v.joint === 'b' && H.has(v, 'tw1', 't1')) ? v.tw1 + v.t1 : undefined },
          { id: 'l', symbol: 'l', label: 'Grip length', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => { if (v.joint === 'b') return H.has(v, 'h', 't2', 'd') ? v.h + (v.t2 < v.d ? v.t2 / 2 : v.d / 2) : undefined; return H.has(v, 'tw1', 't1', 't2', 'tw2') ? v.tw1 + v.t1 + v.t2 + v.tw2 : undefined; },
            work: v => H.has(v, 'l') ? (v.joint === 'b' ? '\\(l = h + ' + (v.t2 < v.d ? 't_2/2' : 'd/2') + ' = ' + TX(v.h, 4) + ' + ' + TX((v.t2 < v.d ? v.t2 : v.d) / 2, 4) + ' = ' + TX(v.l, 4) + '\\)' : '\\(l = ' + TX(v.tw1) + ' + ' + TX(v.t1) + ' + ' + TX(v.t2) + ' + ' + TX(v.tw2) + ' = ' + TX(v.l, 4) + '\\)') : null },
          { id: 'Lmin', symbol: 'L_{min}', label: 'Minimum bolt length', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => v.joint === 'b' ? (H.has(v, 'h', 'd') ? v.h + 1.5 * v.d : undefined) : (H.has(v, 'l', 'Hn') ? v.l + v.Hn : undefined) },
          { id: 'L', symbol: 'L', label: 'Bolt length used (standard)', unit: 'in / mm', kind: 'lookup', fig: 'table8-7', hint: 'auto: up to ¼ in (US) or 5 mm (SI)', auto: v => H.has(v, 'Lmin') ? (FS_SI(v) ? Math.ceil(v.Lmin / 5) * 5 : Math.ceil(v.Lmin * 4 - 1e-9) / 4) : undefined },
        ] },
    ] },

    { title: 'Step 2: Bolt stiffness', steps: [
      { id: 'kb', title: 'Threaded length and bolt stiffness', eq: '8-13, 8-14, 8-17', fig: ['table8-7'],
        formula: 'L_T = 2d + \\tfrac14\\ (L \\le 6\\ \\text{in}),\\; 2d + \\tfrac12\\ (L > 6) \\quad l_d = L - L_T,\\; l_t = l - l_d \\qquad k_b = \\frac{A_d A_t E}{A_d l_t + A_t l_d}',
        text: 'Metric \\(L_T\\) = 2d + 6 (L ≤ 125 mm), 2d + 12 (≤ 200), 2d + 25 mm. The thread pitch does not enter \\(k_b\\) except through \\(A_t\\). If \\(k_b\\) is given, type it.',
        vars: [
          { id: 'LT', symbol: 'L_T', label: 'Threaded length', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => { if (!H.has(v, 'd', 'L')) return undefined;
              if (FS_SI(v)) return v.L <= 125 && v.d <= 48 ? 2 * v.d + 6 : (v.L <= 200 ? 2 * v.d + 12 : 2 * v.d + 25); return v.L <= 6 ? 2 * v.d + 0.25 : 2 * v.d + 0.5; } },
          { id: 'ld', symbol: 'l_d', label: 'Unthreaded length in the grip', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'L', 'LT') ? Math.max(0, v.L - v.LT) : undefined },
          { id: 'lt', symbol: 'l_t', label: 'Threaded length in the grip', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'l', 'ld') ? v.l - v.ld : undefined, check: v => (v.lt !== undefined && v.lt < 0) ? '\\(l_t < 0\\): grip is all shank — \\(k_b = A_dE/l\\)' : null },
          { id: 'kbg', symbol: 'k_{b,given}', label: 'Bolt stiffness, if given', unit: 'lbf/in / N/mm', kind: 'input', hint: 'HW5 P2: 3 Mlbf/in' },
          { id: 'kb', symbol: 'k_b', label: 'Bolt stiffness', unit: 'lbf/in / N/mm', kind: 'calc', digits: 4, compute: v => { if (H.has(v, 'kbg')) return v.kbg; if (!H.has(v, 'Ad', 'At', 'Eb', 'lt', 'ld')) return undefined; if (v.lt <= 0) return v.Ad * v.Eb / v.l; return v.Ad * v.At * v.Eb / (v.Ad * v.lt + v.At * v.ld); },
            work: v => !H.has(v, 'kbg') && H.has(v, 'kb') && v.lt > 0 ? '\\(k_b = \\dfrac{' + TX(v.Ad, 4) + '(' + TX(v.At, 4) + ')(' + TX(v.Eb, 3) + ')}{' + TX(v.Ad, 4) + '(' + TX(v.lt, 4) + ') + ' + TX(v.At, 4) + '(' + TX(v.ld, 4) + ')} = ' + TX(v.kb, 4) + '\\)' : null },
        ] },
    ] },

    { title: 'Step 3: Member stiffness', steps: [
      { id: 'km', title: 'Member stiffness — choose the method', eq: '8-20, 8-22, 8-23', fig: ['fig8-15', 'fig8-17', 'table8-8', 'fig8-16'],
        formula: 'k_m = \\frac{0.5774\\pi E d}{2\\ln\\left(5\\,\\dfrac{0.5774 l + 0.5d}{0.5774 l + 2.5d}\\right)}\\ (8\\text{-}22) \\qquad k_m = E d A e^{B d/l}\\ (8\\text{-}23)',
        text: 'Eqs. 8-22 / 8-23 need all members of one material. Mixed materials or washers: stack frusta (Eq. 8-20).',
        vars: [
          { id: 'kmm', label: 'Method', kind: 'choice', type: 'text', options: [{ label: 'Eq. 8-22 — same material, 30°, \\(d_w = 1.5d\\)', value: 'eq822' }, { label: 'Eq. 8-23 — Wileman, Table 8-8', value: 'wileman' }, { label: 'Eq. 8-20 — stack of frusta', value: 'frusta' }, { label: 'Given in the problem', value: 'given' }], default: 'eq822' },
          { id: 'kmg', symbol: 'k_{m,given}', label: 'Member stiffness, if given', unit: 'lbf/in / N/mm', kind: 'input', hint: 'HW5 P2: 12 Mlbf/in per bolt' },
          { id: 'matm', label: 'Member material (Table 8-8)', kind: 'choice', type: 'text', options: [{ label: 'Steel', value: 'steel' }, { label: 'Aluminum', value: 'aluminum' }, { label: 'Copper', value: 'copper' }, { label: 'Gray cast iron', value: 'ci' }, { label: 'Other (general A, B)', value: 'general' }], default: 'steel' },
          { id: 'Em', symbol: 'E_m', label: 'Member modulus', unit: 'psi / MPa', kind: 'lookup', fig: 'table8-8', auto: v => { const w = WILEMAN[v.matm]; return w && w[2] ? (FS_SI(v) ? w[3] * 1000 : w[2] * 1e6) : undefined; }, hint: 'CI: 14–16 Mpsi in the examples' },
          { id: 'Aw', symbol: 'A', label: 'Wileman A', kind: 'lookup', fig: 'table8-8', auto: v => WILEMAN[v.matm] ? WILEMAN[v.matm][0] : undefined },
          { id: 'Bw', symbol: 'B', label: 'Wileman B', kind: 'lookup', fig: 'table8-8', auto: v => WILEMAN[v.matm] ? WILEMAN[v.matm][1] : undefined },
          { id: 'km822', symbol: 'k_m^{(8\\text{-}22)}', label: '\\(k_m\\) by Eq. 8-22', unit: 'lbf/in / N/mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'Em', 'd', 'l') ? 0.5774 * Math.PI * v.Em * v.d / (2 * Math.log(5 * (0.5774 * v.l + 0.5 * v.d) / (0.5774 * v.l + 2.5 * v.d))) : undefined,
            work: v => v.kmm === 'eq822' && H.has(v, 'km822') ? '\\(k_m = \\dfrac{0.5774\\pi(' + TX(v.Em, 3) + ')(' + TX(v.d) + ')}{2\\ln\\left[5\\,\\dfrac{0.5774(' + TX(v.l, 4) + ') + 0.5(' + TX(v.d) + ')}{0.5774(' + TX(v.l, 4) + ') + 2.5(' + TX(v.d) + ')}\\right]} = ' + TX(v.km822, 4) + '\\)' : null },
          { id: 'km823', symbol: 'k_m^{(8\\text{-}23)}', label: '\\(k_m\\) by Eq. 8-23', unit: 'lbf/in / N/mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'Em', 'd', 'l', 'Aw', 'Bw') ? v.Em * v.d * v.Aw * Math.exp(v.Bw * v.d / v.l) : undefined,
            work: v => v.kmm === 'wileman' && H.has(v, 'km823') ? '\\(k_m = ' + TX(v.Em, 3) + '(' + TX(v.d) + ')(' + TX(v.Aw, 5) + ')\\exp[' + TX(v.Bw, 5) + '(' + TX(v.d) + ')/' + TX(v.l, 4) + '] = ' + TX(v.km823, 4) + '\\)' : null },
        ] },
      { id: 'frusta', title: 'Frusta stack (Eq. 8-20) — frusta 1 and 2', fig: ['fig8-17', 'fig8-15'],
        text: 'Number frusta from the head to the nut. D = narrow-end diameter: 1.5d at the head / nut, then \\(D_{prev} + 1.155t_{prev}\\) while expanding (HW5 P1: Al frustum D = 0.75 + 1.155(0.095) = 0.860 in).',
        vars: [
          { id: 'f1t', symbol: 't_1', label: 'Frustum 1 thickness', unit: 'in / mm', kind: 'input' }, { id: 'f1D', symbol: 'D_1', label: 'Frustum 1 narrow-end diameter', unit: 'in / mm', kind: 'lookup', fig: 'fig8-17', hint: '1.5d at the head', auto: v => H.has(v, 'd') ? 1.5 * v.d : undefined },
          { id: 'f1E', symbol: 'E_1', label: 'Frustum 1 modulus', unit: 'psi / MPa', kind: 'input' }, { id: 'f1d', symbol: 'd_1', label: 'Frustum 1 hole diameter', unit: 'in / mm', kind: 'input', auto: v => v.d, hint: 'washer: its inner diameter' },
          { id: 'f2t', symbol: 't_2', label: 'Frustum 2 thickness', unit: 'in / mm', kind: 'input' }, { id: 'f2D', symbol: 'D_2', label: 'Frustum 2 narrow-end diameter', unit: 'in / mm', kind: 'input' },
          { id: 'f2E', symbol: 'E_2', label: 'Frustum 2 modulus', unit: 'psi / MPa', kind: 'input' }, { id: 'f2d', symbol: 'd_2', label: 'Frustum 2 hole diameter', unit: 'in / mm', kind: 'input', auto: v => v.d },
        ],
        when: v => v.kmm === 'frusta' },
      { id: 'frusta2', title: 'Frusta 3 and 4', fig: ['fig8-17'], text: 'Leave unused rows blank.',
        vars: [
          { id: 'f3t', symbol: 't_3', label: 'Frustum 3 thickness', unit: 'in / mm', kind: 'input' }, { id: 'f3D', symbol: 'D_3', label: 'Frustum 3 narrow-end diameter', unit: 'in / mm', kind: 'input' },
          { id: 'f3E', symbol: 'E_3', label: 'Frustum 3 modulus', unit: 'psi / MPa', kind: 'input' }, { id: 'f3d', symbol: 'd_3', label: 'Frustum 3 hole diameter', unit: 'in / mm', kind: 'input', auto: v => v.d },
          { id: 'f4t', symbol: 't_4', label: 'Frustum 4 thickness', unit: 'in / mm', kind: 'input' }, { id: 'f4D', symbol: 'D_4', label: 'Frustum 4 narrow-end diameter', unit: 'in / mm', kind: 'input' },
          { id: 'f4E', symbol: 'E_4', label: 'Frustum 4 modulus', unit: 'psi / MPa', kind: 'input' }, { id: 'f4d', symbol: 'd_4', label: 'Frustum 4 hole diameter', unit: 'in / mm', kind: 'input', auto: v => v.d },
        ],
        when: v => v.kmm === 'frusta' },
      { id: 'frusta3', title: 'Frustum 5', fig: ['fig8-17'], text: 'Leave blank if not needed.',
        vars: [
          { id: 'f5t', symbol: 't_5', label: 'Frustum 5 thickness', unit: 'in / mm', kind: 'input' }, { id: 'f5D', symbol: 'D_5', label: 'Frustum 5 narrow-end diameter', unit: 'in / mm', kind: 'input' },
          { id: 'f5E', symbol: 'E_5', label: 'Frustum 5 modulus', unit: 'psi / MPa', kind: 'input' }, { id: 'f5d', symbol: 'd_5', label: 'Frustum 5 hole diameter', unit: 'in / mm', kind: 'input', auto: v => v.d },
        ],
        when: v => v.kmm === 'frusta' },
      { id: 'frustak', title: 'Frustum stiffnesses and the combined member stiffness', eq: '8-20', fig: ['fig8-17'],
        formula: 'k_i = \\frac{0.5774\\pi E_i d_i}{\\ln\\dfrac{(1.155t_i + D_i - d_i)(D_i + d_i)}{(1.155t_i + D_i + d_i)(D_i - d_i)}} \\qquad \\frac{1}{k_m} = \\sum\\frac{1}{k_i}',
        vars: [
          { id: 'f1k', symbol: 'k_1', label: '\\(k_1\\)', unit: 'lbf/in / N/mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'f1t', 'f1D', 'f1E', 'f1d') ? frust(v.f1E, v.f1d, v.f1t, v.f1D) : undefined,
            work: v => H.has(v, 'f1k') ? '\\(k_1 = \\dfrac{0.5774\\pi(' + TX(v.f1E, 3) + ')(' + TX(v.f1d) + ')}{\\ln\\dfrac{[1.155(' + TX(v.f1t) + ') + ' + TX(v.f1D, 4) + ' - ' + TX(v.f1d) + '](' + TX(v.f1D, 4) + ' + ' + TX(v.f1d) + ')}{[1.155(' + TX(v.f1t) + ') + ' + TX(v.f1D, 4) + ' + ' + TX(v.f1d) + '](' + TX(v.f1D, 4) + ' - ' + TX(v.f1d) + ')}} = ' + TX(v.f1k, 4) + '\\)' : null },
          { id: 'f2k', symbol: 'k_2', label: '\\(k_2\\)', unit: 'lbf/in / N/mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'f2t', 'f2D', 'f2E', 'f2d') ? frust(v.f2E, v.f2d, v.f2t, v.f2D) : undefined },
          { id: 'f3k', symbol: 'k_3', label: '\\(k_3\\)', unit: 'lbf/in / N/mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'f3t', 'f3D', 'f3E', 'f3d') ? frust(v.f3E, v.f3d, v.f3t, v.f3D) : undefined },
          { id: 'f4k', symbol: 'k_4', label: '\\(k_4\\)', unit: 'lbf/in / N/mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'f4t', 'f4D', 'f4E', 'f4d') ? frust(v.f4E, v.f4d, v.f4t, v.f4D) : undefined },
          { id: 'f5k', symbol: 'k_5', label: '\\(k_5\\)', unit: 'lbf/in / N/mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'f5t', 'f5D', 'f5E', 'f5d') ? frust(v.f5E, v.f5d, v.f5t, v.f5D) : undefined },
          { id: 'kmfr', symbol: 'k_m^{(frusta)}', label: '\\(k_m = 1/\\sum(1/k_i)\\)', unit: 'lbf/in / N/mm', kind: 'calc', digits: 4, compute: v => { const ks = ['f1k', 'f2k', 'f3k', 'f4k', 'f5k'].map(k => v[k]).filter(x => x !== undefined && x > 0); return ks.length ? 1 / ks.reduce((s, k) => s + 1 / k, 0) : undefined; },
            work: v => H.has(v, 'kmfr') ? '\\(\\dfrac{1}{k_m} = ' + ['f1k', 'f2k', 'f3k', 'f4k', 'f5k'].filter(k => v[k] > 0).map(k => '\\dfrac{1}{' + TX(v[k], 4) + '}').join(' + ') + ' \\Rightarrow k_m = ' + TX(v.kmfr, 4) + '\\)' : null },
        ],
        when: v => v.kmm === 'frusta' },
      { id: 'C', title: 'Joint stiffness constant', eq: '8-24 … (f)', fig: ['fig8-18'], formula: 'C = \\frac{k_b}{k_b + k_m} \\qquad P_b = CP,\\; P_m = (1 - C)P',
        text: 'C is the fraction of the external load taken by the bolt.',
        vars: [
          { id: 'km', symbol: 'k_m', label: 'Member stiffness used', unit: 'lbf/in / N/mm', kind: 'calc', digits: 4, compute: v => v.kmm === 'given' ? v.kmg : v.kmm === 'frusta' ? v.kmfr : v.kmm === 'wileman' ? v.km823 : v.km822 },
          { id: 'C', symbol: 'C', label: 'Joint stiffness constant', kind: 'calc', digits: 4, compute: v => H.has(v, 'kb', 'km') ? v.kb / (v.kb + v.km) : undefined,
            work: v => H.has(v, 'C') ? '\\(C = \\dfrac{' + TX(v.kb, 4) + '}{' + TX(v.kb, 4) + ' + ' + TX(v.km, 4) + '} = ' + TX(v.C, 4) + '\\)' : null },
        ] },
    ] },

    { title: 'Step 4: Strength, preload and torque', steps: [
      { id: 'str', title: 'Bolt grade → \\(S_p\\), \\(S_{ut}\\), \\(S_y\\), \\(S_e\\)', fig: ['table8-9', 'table8-10', 'table8-11', 'table8-17'],
        text: 'Auto-filled from the tables by grade and diameter. \\(S_e\\) (Table 8-17) is for rolled threads and already includes \\(K_f\\).',
        vars: [
          { id: 'grade', label: 'Bolt grade / class', kind: 'choice', type: 'text', options: Object.keys(BOLT_GRADES).map(k => ({ label: BOLT_GRADES[k][0], value: k })), default: 'sae5' },
          { id: 'Sp', symbol: 'S_p', label: 'Proof strength', unit: 'psi / MPa', kind: 'lookup', fig: 'table8-9', auto: v => { const r = gradeRow(v); return r ? r[1] * KS(v) : undefined; } },
          { id: 'Sut', symbol: 'S_{ut}', label: 'Tensile strength', unit: 'psi / MPa', kind: 'lookup', fig: 'table8-9', auto: v => { const r = gradeRow(v); return r ? r[2] * KS(v) : undefined; } },
          { id: 'Sy', symbol: 'S_y', label: 'Yield strength', unit: 'psi / MPa', kind: 'lookup', fig: 'table8-9', auto: v => { const r = gradeRow(v); return r ? r[3] * KS(v) : undefined; } },
          { id: 'Se', symbol: 'S_e', label: 'Endurance strength (fatigue only)', unit: 'psi / MPa', kind: 'lookup', fig: 'table8-17', auto: v => { const r = gradeRow(v); return r && r[4] ? r[4] * KS(v) : undefined; }, hint: 'blank if Table 8-17 has no entry' },
        ],
        after: v => ((BOLT_GRADES[v.grade] && BOLT_GRADES[v.grade][1] !== (FS_SI(v) ? 'SI' : 'US')) ? '<span class="result-bad">This grade is tabulated in ' + BOLT_GRADES[v.grade][1] + ' units — switch the unit system or the grade.</span>' : '') + gradeTable(v) },
      { id: 'pre', title: 'Load per bolt and preload', eq: '8-31, 8-32',
        formula: 'P = \\frac{P_{tot}}{N} \\qquad F_p = A_t S_p \\qquad F_i = 0.75F_p\\ (\\text{reused}),\\; 0.90F_p\\ (\\text{permanent})',
        vars: [
          { id: 'Ptot', symbol: 'P_{tot}', label: 'Total external tensile load on the joint', unit: 'lbf / N', kind: 'input' },
          { id: 'N', symbol: 'N', label: 'Number of bolts', kind: 'input', default: 1 },
          { id: 'P', symbol: 'P', label: 'External load per bolt', unit: 'lbf / N', kind: 'calc', digits: 4, compute: v => H.has(v, 'Ptot', 'N') && v.N > 0 ? v.Ptot / v.N : undefined },
          { id: 'Fp', symbol: 'F_p', label: 'Proof load', unit: 'lbf / N', kind: 'calc', digits: 4, compute: v => H.has(v, 'At', 'Sp') ? v.At * v.Sp : undefined },
          { id: 'preload', label: 'Preload rule', kind: 'choice', options: [{ label: '\\(0.75F_p\\) — reused fasteners', value: 0.75 }, { label: '\\(0.90F_p\\) — permanent connection', value: 0.9 }, { label: '\\(0.60F_p\\)', value: 0.6 }, { label: '\\(1.00F_p\\)', value: 1 }, { label: 'Given directly (enter \\(F_i\\))', value: 0 }], default: 0.75 },
          { id: 'Fig', symbol: 'F_{i,given}', label: 'Preload if given', unit: 'lbf / N', kind: 'input' },
          { id: 'Fi', symbol: 'F_i', label: 'Preload used', unit: 'lbf / N', kind: 'calc', digits: 4, compute: v => v.preload === 0 ? v.Fig : (H.has(v, 'Fp', 'preload') ? v.preload * v.Fp : undefined),
            work: v => (v.preload !== 0 && H.has(v, 'Fi')) ? '\\(F_i = ' + TX(v.preload) + '(' + TX(v.At, 4) + ')(' + TX(v.Sp) + ') = ' + TX(v.Fi, 4) + '\\)' : null },
        ] },
      { id: 'tq', title: 'Preload stress, wrench torque and wrench size', eq: '8-27', fig: ['table8-15'], formula: 'T = K F_i d \\qquad \\text{wrench (across flats)} \\approx 1.5d',
        text: 'A hex nut takes a wrench about 1.5d across flats (½-in nut → ¾-in wrench).',
        vars: [
          { id: 'sigi', symbol: '\\sigma_i', label: 'Preload stress \\(F_i/A_t\\)', unit: 'psi / MPa', kind: 'calc', digits: 4, compute: v => H.has(v, 'Fi', 'At') ? v.Fi / v.At : undefined },
          { id: 'K', symbol: 'K', label: 'Torque factor', kind: 'lookup', fig: 'table8-15', default: 0.2, hint: '0.30 black, 0.20 zinc-plated / not stated, 0.18 lubricated, 0.16 cadmium' },
          { id: 'T', symbol: 'T', label: 'Wrench torque', unit: 'lbf·in / N·mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'K', 'Fi', 'd') ? v.K * v.Fi * v.d : undefined,
            work: v => H.has(v, 'T') ? '\\(T = ' + TX(v.K) + '(' + TX(v.Fi, 4) + ')(' + TX(v.d) + ') = ' + TX(v.T, 4) + (FS_SI(v) ? '\\ \\text{N·mm}' : '\\ \\text{lbf·in} = ' + TX(v.T / 12, 4) + '\\ \\text{ft·lbf}') + '\\)' : null },
          { id: 'wr', symbol: 'W', label: 'Wrench size ≈ 1.5d', unit: 'in / mm', kind: 'calc', digits: 3, compute: v => H.has(v, 'd') ? 1.5 * v.d : undefined },
        ],
        after: v => { if (!H.has(v, 'T')) return ''; const lim = FS_SI(v) ? 113000 : 1000; return v.T > lim ? '<span class="result-bad">T above ≈ 1000 lbf·in (113 N·m) — "VERY high" for a hand wrench: use a torque multiplier or more, smaller bolts.</span>' : '<span class="result-ok">Achievable with a hand torque wrench.</span>'; } },
    ] },

    { title: 'Step 5: Static factors of safety', steps: [
      { id: 'static', title: 'Bolt stress, yielding, overload and separation', eq: '8-24, 8-28, 8-29, 8-30',
        formula: 'F_b = CP + F_i \\qquad n_p = \\frac{S_p A_t}{CP + F_i} \\qquad n_L = \\frac{S_p A_t - F_i}{CP} \\qquad n_0 = \\frac{F_i}{P(1 - C)}',
        vars: [
          { id: 'Fb', symbol: 'F_b', label: 'Resultant bolt load', unit: 'lbf / N', kind: 'calc', digits: 4, compute: v => H.has(v, 'C', 'P', 'Fi') ? v.C * v.P + v.Fi : undefined },
          { id: 'sigb', symbol: '\\sigma_b', label: 'Bolt stress under service load', unit: 'psi / MPa', kind: 'calc', digits: 4, compute: v => H.has(v, 'Fb', 'At') ? v.Fb / v.At : undefined,
            work: v => H.has(v, 'sigb') ? '\\(\\sigma_b = \\dfrac{' + TX(v.C, 4) + '(' + TX(v.P, 4) + ') + ' + TX(v.Fi, 4) + '}{' + TX(v.At, 4) + '} = ' + TX(v.sigb, 4) + '\\)' : null },
          { id: 'np', symbol: 'n_p', label: 'Yielding factor (proof)', kind: 'calc', digits: 3, compute: v => H.has(v, 'Sp', 'At', 'Fb') && v.Fb > 0 ? v.Sp * v.At / v.Fb : undefined,
            work: v => H.has(v, 'np') ? '\\(n_p = \\dfrac{' + TX(v.Sp) + '(' + TX(v.At, 4) + ')}{' + TX(v.Fb, 4) + '} = ' + TX(v.np, 3) + '\\)' : null },
          { id: 'nL', symbol: 'n_L', label: 'Load (overload) factor', kind: 'calc', digits: 3, compute: v => H.has(v, 'Sp', 'At', 'Fi', 'C', 'P') && v.C * v.P > 0 ? (v.Sp * v.At - v.Fi) / (v.C * v.P) : undefined,
            work: v => H.has(v, 'nL') ? '\\(n_L = \\dfrac{' + TX(v.Sp) + '(' + TX(v.At, 4) + ') - ' + TX(v.Fi, 4) + '}{' + TX(v.C, 4) + '(' + TX(v.P, 4) + ')} = ' + TX(v.nL, 3) + '\\)' : null },
          { id: 'n0', symbol: 'n_0', label: 'Joint-separation factor', kind: 'calc', digits: 3, compute: v => H.has(v, 'Fi', 'P', 'C') && v.P > 0 ? v.Fi / (v.P * (1 - v.C)) : undefined,
            work: v => H.has(v, 'n0') ? '\\(n_0 = \\dfrac{' + TX(v.Fi, 4) + '}{' + TX(v.P, 4) + '(1 - ' + TX(v.C, 4) + ')} = ' + TX(v.n0, 3) + '\\)' : null },
          { id: 'nLt', symbol: 'n_{L,target}', label: 'Required load factor (to size N)', kind: 'input', hint: 'Example 8-4: 2' },
          { id: 'Nreq', symbol: 'N_{req}', label: 'Bolts needed for the target \\(n_L\\)', kind: 'calc', digits: 3, compute: v => H.has(v, 'C', 'nLt', 'Ptot', 'Sp', 'At', 'Fi') && (v.Sp * v.At - v.Fi) > 0 ? v.C * v.nLt * v.Ptot / (v.Sp * v.At - v.Fi) : undefined,
            work: v => H.has(v, 'Nreq') ? '\\(N = \\dfrac{C n_L P_{tot}}{S_p A_t - F_i} = \\dfrac{' + TX(v.C, 4) + '(' + TX(v.nLt) + ')(' + TX(v.Ptot) + ')}{' + TX(v.Sp) + '(' + TX(v.At, 4) + ') - ' + TX(v.Fi, 4) + '} = ' + TX(v.Nreq, 3) + ' \\rightarrow ' + Math.ceil(v.Nreq - 1e-9) + '\\)' : null },
        ],
        after: v => { if (v.np === undefined) return '';
          const bad = []; if (v.np < 1) bad.push('proof exceeded (\\(n_p < 1\\))'); if (v.nL < 1) bad.push('\\(n_L < 1\\)'); if (v.n0 < 1) bad.push('joint separates (\\(n_0 < 1\\))');
          let s = bad.length ? '<span class="result-bad">FAIL — ' + bad.join('; ') + '. Higher grade, larger or more bolts.</span>' : '<span class="result-ok">Static PASS — members carry ' + H.fmt(100 * (1 - v.C), 3) + ' % of P.</span>';
          if (H.has(v, 'Nreq')) s += ' Use at least ' + Math.ceil(v.Nreq - 1e-9) + ' bolts.'; return s; } },
    ] },

    { title: 'Step 6: Fatigue (fluctuating external load)', steps: [
      { id: 'fat', title: 'Alternating and midrange stresses', eq: '8-35 … 8-37', fig: ['fig8-22', 'table8-17'],
        formula: '\\sigma_a = \\frac{C(P_{max} - P_{min})}{2A_t} \\qquad \\sigma_m = \\frac{C(P_{max} + P_{min})}{2A_t} + \\frac{F_i}{A_t}',
        text: 'Per-bolt loads; default repeated load 0 → P. Fatigue cracks start at the first engaged thread; rolled threads have a higher \\(S_e\\) than cut threads.',
        vars: [
          { id: 'Pmax', symbol: 'P_{max}', label: 'Max external load per bolt', unit: 'lbf / N', kind: 'input', hint: 'blank = P' },
          { id: 'Pmin', symbol: 'P_{min}', label: 'Min external load per bolt', unit: 'lbf / N', kind: 'input', default: 0 },
          { id: 'fcrit', label: 'Criterion', kind: 'choice', type: 'text', options: [{ label: 'Goodman (Eq. 8-38 / 8-45)', value: 'goodman' }, { label: 'Gerber (Eq. 8-46, repeated load)', value: 'gerber' }, { label: 'ASME-elliptic (Eq. 8-47, repeated load)', value: 'asme' }], default: 'goodman' },
          { id: 'Pmx', symbol: 'P_{max}', label: '\\(P_{max}\\) used', unit: 'lbf / N', kind: 'calc', digits: 4, compute: v => H.has(v, 'Pmax') ? v.Pmax : v.P },
          { id: 'siga', symbol: '\\sigma_a', label: 'Alternating stress', unit: 'psi / MPa', kind: 'calc', digits: 4, compute: v => H.has(v, 'C', 'Pmx', 'Pmin', 'At') ? v.C * (v.Pmx - v.Pmin) / (2 * v.At) : undefined,
            work: v => H.has(v, 'siga') ? '\\(\\sigma_a = \\dfrac{' + TX(v.C, 4) + '(' + TX(v.Pmx, 4) + ' - ' + TX(v.Pmin) + ')}{2(' + TX(v.At, 4) + ')} = ' + TX(v.siga, 4) + '\\)' : null },
          { id: 'sigm', symbol: '\\sigma_m', label: 'Midrange stress', unit: 'psi / MPa', kind: 'calc', digits: 4, compute: v => H.has(v, 'C', 'Pmx', 'Pmin', 'At', 'Fi') ? v.C * (v.Pmx + v.Pmin) / (2 * v.At) + v.Fi / v.At : undefined,
            work: v => H.has(v, 'sigm') ? '\\(\\sigma_m = ' + TX(v.siga, 4) + ' + \\dfrac{' + TX(v.Fi, 4) + '}{' + TX(v.At, 4) + '} = ' + TX(v.sigm, 4) + '\\)' : null },
        ],
        when: v => H.has(v, 'Se') && H.has(v, 'C') },
      { id: 'nfs', title: 'Fatigue factor of safety and yield check', eq: '8-38, 8-46, 8-47, 8-51', fig: ['fig8-22'],
        formula: 'n_f = \\frac{S_e(S_{ut} - \\sigma_i)}{S_{ut}\\sigma_a + S_e(\\sigma_m - \\sigma_i)}\\ (\\text{Goodman}) \\qquad n_p = \\frac{S_p}{\\sigma_m + \\sigma_a}',
        vars: [
          { id: 'nf', symbol: 'n_f', label: 'Fatigue factor of safety', kind: 'calc', digits: 3, compute: v => { if (!H.has(v, 'Se', 'Sut', 'sigi', 'siga', 'sigm') || v.siga <= 0) return undefined;
              if (v.fcrit === 'gerber' && v.Pmin === 0) return (v.Sut * Math.sqrt(v.Sut * v.Sut + 4 * v.Se * (v.Se + v.sigi)) - v.Sut * v.Sut - 2 * v.sigi * v.Se) / (2 * v.siga * v.Se);
              if (v.fcrit === 'asme' && v.Pmin === 0 && H.has(v, 'Sp')) return v.Se / (v.siga * (v.Sp * v.Sp + v.Se * v.Se)) * (v.Sp * Math.sqrt(v.Sp * v.Sp + v.Se * v.Se - v.sigi * v.sigi) - v.sigi * v.Se);
              return v.Se * (v.Sut - v.sigi) / (v.Sut * v.siga + v.Se * (v.sigm - v.sigi)); },
            work: v => H.has(v, 'nf') ? ((v.fcrit === 'goodman' || v.Pmin !== 0) ? '\\(n_f = \\dfrac{' + TX(v.Se) + '(' + TX(v.Sut) + ' - ' + TX(v.sigi, 4) + ')}{' + TX(v.Sut) + '(' + TX(v.siga, 4) + ') + ' + TX(v.Se) + '(' + TX(v.sigm, 4) + ' - ' + TX(v.sigi, 4) + ')} = ' + TX(v.nf, 3) + '\\)' : '\\(n_f = ' + TX(v.nf, 3) + '\\) (' + (v.fcrit === 'gerber' ? 'Eq. 8-46' : 'Eq. 8-47') + ')') : null },
          { id: 'npf', symbol: 'n_p', label: 'Yield check \\(S_p/(\\sigma_m + \\sigma_a)\\)', kind: 'calc', digits: 3, compute: v => H.has(v, 'Sp', 'sigm', 'siga') && (v.sigm + v.siga) > 0 ? v.Sp / (v.sigm + v.siga) : undefined },
          { id: 'Fimax', symbol: 'F_{i,max}', label: 'Preload ceiling \\((1 - C)S_{ut}A_t\\)', unit: 'lbf / N', kind: 'calc', digits: 4, compute: v => H.has(v, 'C', 'Sut', 'At') ? (1 - v.C) * v.Sut * v.At : undefined },
        ],
        when: v => H.has(v, 'Se') && H.has(v, 'C'),
        after: v => v.nf === undefined ? '<span>Enter \\(S_e\\) for the fatigue factor.</span>' : (v.nf >= 1 ? '<span class="result-ok">Fatigue PASS — \\(n_f = ' + TX(v.nf, 3) + '\\) (' + v.fcrit + ').</span>' : '<span class="result-bad">Fatigue FAIL — \\(n_f = ' + TX(v.nf, 3) + ' < 1\\): more, larger or higher-grade bolts.</span>') },
    ] },

    { title: 'Step 7: Shear joints with eccentric loading (Shigley 8-12)', text: 'Primary shear \\(F\' = V/n\\); the moment about the bolt-group <b>centroid</b> (the pivot) gives secondary shear \\(F\'\' = Mr/\\sum r^2\\), perpendicular to each radius; the critical bolt is where they add.', steps: [
      { id: 'sj', title: 'Shear-joint analysis', vars: [
        { id: 'sj', label: 'Analyse a shear joint?', kind: 'choice', type: 'text', options: [{ label: 'No — tension joint only', value: 'none' }, { label: 'Yes — bolt group in shear (Ex. 8-7, HW5 P3)', value: 'shear' }], default: 'none' },
      ] },
      { id: 'sjin', title: 'Loads on the bolt group', eq: '8-56, 8-57', fig: ['fig8-29', 'fig8-30', 'fig8-31'], when: v => v.sj === 'shear',
        formula: "F' = \\frac{V}{n} \\qquad M = V e",
        text: 'V = total shear on the group (along y); e = distance from its line of action to the centroid, or enter M.',
        vars: [
          { id: 'V', symbol: 'V', label: 'Shear force on the bolt group', unit: 'lbf / N', kind: 'input' },
          { id: 'e', symbol: 'e', label: 'Eccentricity of V from the centroid', unit: 'in / mm', kind: 'input' },
          { id: 'Mg', symbol: 'M_{given}', label: 'Moment about the centroid, if given', unit: 'lbf·in / N·mm', kind: 'input' },
          { id: 'M', symbol: 'M', label: 'Moment carried by the group', unit: 'lbf·in / N·mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'Mg') ? v.Mg : (H.has(v, 'V', 'e') ? v.V * v.e : undefined) },
          { id: 'nb', symbol: 'n', label: 'Number of bolts in the group', kind: 'input', default: 4 },
          { id: 'Fp1', symbol: "F'", label: 'Primary shear per bolt', unit: 'lbf / N', kind: 'calc', digits: 4, compute: v => (H.has(v, 'V', 'nb') && v.nb > 0) ? v.V / v.nb : undefined },
        ] },
      { id: 'sjgeo', title: 'Critical bolt: secondary shear and resultant', eq: '8-57', fig: ['fig8-31', 'fig8-28'], when: v => v.sj === 'shear',
        formula: "F'' = \\frac{M r}{\\sum r^2} \\qquad F = \\sqrt{F'^2 + F''^2 + 2F'F''\\,\\frac{|x_b|}{r}}",
        text: 'Give the farthest bolt\'s position from the centroid (V along y). \\(\\sum r^2\\) auto = n\\(r^2\\); type the true sum if radii differ (HW5 P3: 2(32)\\(^2\\), the middle bolt has r = 0).',
        vars: [
          { id: 'xb', symbol: 'x_b', label: 'Critical bolt x (across V)', unit: 'in / mm', kind: 'input', hint: 'Ex. 8-7: 75 mm' },
          { id: 'yb', symbol: 'y_b', label: 'Critical bolt y (along V)', unit: 'in / mm', kind: 'input', hint: 'Ex. 8-7: 60 mm' },
          { id: 'rb', symbol: 'r', label: 'Radius to the critical bolt', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'xb', 'yb') ? Math.sqrt(v.xb * v.xb + v.yb * v.yb) : undefined },
          { id: 'Sr2', symbol: '\\sum r^2', label: '\\(\\sum r^2\\) over all bolts', unit: 'in^2 / mm^2', kind: 'input', auto: v => H.has(v, 'nb', 'rb') ? v.nb * v.rb * v.rb : undefined, hint: 'auto = n\\(r^2\\)' },
          { id: 'Fpp', symbol: "F''", label: 'Secondary shear on the critical bolt', unit: 'lbf / N', kind: 'calc', digits: 4, compute: v => (H.has(v, 'M', 'rb', 'Sr2') && v.Sr2 > 0) ? v.M * v.rb / v.Sr2 : undefined,
            work: v => H.has(v, 'Fpp') ? "\\(F'' = \\dfrac{" + TX(v.M, 4) + '(' + TX(v.rb, 4) + ')}{' + TX(v.Sr2, 4) + '} = ' + TX(v.Fpp, 4) + '\\)' : null },
          { id: 'Fres', symbol: 'F', label: 'Resultant on the critical bolt', unit: 'lbf / N', kind: 'calc', digits: 4, compute: v => (H.has(v, 'Fp1', 'Fpp', 'xb', 'rb') && v.rb > 0) ? Math.sqrt(v.Fp1 * v.Fp1 + v.Fpp * v.Fpp + 2 * v.Fp1 * v.Fpp * Math.abs(v.xb) / v.rb) : undefined,
            work: v => H.has(v, 'Fres') ? '\\(F = \\sqrt{' + TX(v.Fp1, 4) + '^2 + ' + TX(v.Fpp, 4) + '^2 + 2(' + TX(v.Fp1, 4) + ')(' + TX(v.Fpp, 4) + ')(' + TX(Math.abs(v.xb) / v.rb, 4) + ')} = ' + TX(v.Fres, 4) + '\\)' : null },
        ] },
      { id: 'sjstr', title: 'Bolt shear and bearing stresses', fig: ['fig8-30'], when: v => v.sj === 'shear',
        formula: '\\tau = \\frac{F}{A_s} \\qquad \\sigma_{br} = \\frac{F}{t\\,d}',
        text: 'Keep threads out of the shear plane (shoulder bolts); otherwise use \\(A_r\\) (Ex. 8-7: 146 vs 104 MPa).',
        vars: [
          { id: 'dsj', symbol: 'd', label: 'Bolt diameter in the shear plane', unit: 'in / mm', kind: 'input', auto: v => v.d },
          { id: 'sarea', label: 'Shear area', kind: 'choice', type: 'text', options: [{ label: 'Body (shank) — \\(\\pi d^2/4\\)', value: 'body' }, { label: 'Threads in the shear plane — \\(A_r\\)', value: 'thread' }], default: 'body' },
          { id: 'As', symbol: 'A_s', label: 'Shear area per bolt', unit: 'in^2 / mm^2', kind: 'calc', digits: 4, compute: v => { if (!H.has(v, 'dsj')) return undefined; if (v.sarea !== 'thread') return Math.PI * v.dsj * v.dsj / 4;
              const dr = FS_SI(v) ? (H.has(v, 'pitch') ? v.dsj - 1.226869 * v.pitch : undefined) : (H.has(v, 'tpi') ? v.dsj - 1.299038 / v.tpi : undefined); return dr > 0 ? Math.PI * dr * dr / 4 : undefined; } },
          { id: 'tau', symbol: '\\tau', label: 'Shear stress in the critical bolt', unit: 'psi / MPa', kind: 'calc', digits: 4, compute: v => (H.has(v, 'Fres', 'As') && v.As > 0) ? v.Fres / v.As : undefined,
            work: v => H.has(v, 'tau') ? '\\(\\tau = ' + TX(v.Fres, 4) + '/' + TX(v.As, 4) + ' = ' + TX(v.tau, 4) + '\\)' : null },
          { id: 'tmem', symbol: 't', label: 'Thinnest member thickness', unit: 'in / mm', kind: 'input', hint: 'HW5 P3: 8 mm bracket' },
          { id: 'sigbr', symbol: '\\sigma_{br}', label: 'Bearing stress (bolt and member)', unit: 'psi / MPa', kind: 'calc', digits: 4, compute: v => (H.has(v, 'Fres', 'tmem', 'dsj') && v.tmem * v.dsj > 0) ? v.Fres / (v.tmem * v.dsj) : undefined,
            work: v => H.has(v, 'sigbr') ? '\\(\\sigma_{br} = \\dfrac{' + TX(v.Fres, 4) + '}{' + TX(v.tmem) + '(' + TX(v.dsj) + ')} = ' + TX(v.sigbr, 4) + '\\)' : null },
        ] },
      { id: 'sjfos', title: 'Shear-joint factors of safety', fig: ['table8-9'], when: v => v.sj === 'shear',
        formula: 'n_{shear} = \\frac{0.577 S_{y,bolt}}{\\tau} \\qquad n_{bear} = \\frac{S_y}{\\sigma_{br}}\\ (\\text{bolt and member})',
        vars: [
          { id: 'Syb', symbol: 'S_{y,bolt}', label: 'Bolt yield strength', unit: 'psi / MPa', kind: 'input', auto: v => v.Sy, hint: 'auto = grade from step 4' },
          { id: 'Sym', symbol: 'S_{y,mem}', label: 'Member yield strength', unit: 'psi / MPa', kind: 'input', hint: 'Table A-20 (1020 HR: 210 MPa)' },
          { id: 'ndsj', symbol: 'n_d', label: 'Required design factor', kind: 'input', default: 1.5 },
          { id: 'nsh', symbol: 'n_{shear}', label: 'Bolt shear factor of safety', kind: 'calc', digits: 3, compute: v => (H.has(v, 'Syb', 'tau') && v.tau > 0) ? 0.577 * v.Syb / v.tau : undefined,
            work: v => H.has(v, 'nsh') ? '\\(n = 0.577(' + TX(v.Syb) + ')/' + TX(v.tau, 4) + ' = ' + TX(v.nsh, 3) + '\\)' : null },
          { id: 'nbrb', symbol: 'n_{bear,bolt}', label: 'Bearing on the bolt', kind: 'calc', digits: 3, compute: v => H.has(v, 'Syb', 'sigbr') && v.sigbr > 0 ? v.Syb / v.sigbr : undefined },
          { id: 'nbr', symbol: 'n_{bear,mem}', label: 'Bearing on the member', kind: 'calc', digits: 3, compute: v => H.has(v, 'Sym', 'sigbr') && v.sigbr > 0 ? v.Sym / v.sigbr : undefined },
          { id: 'tall', symbol: '\\tau_{allow}', label: 'AISC allowable shear stress (Table 20-1)', unit: 'psi / MPa', kind: 'lookup', fig: 'table20-1', auto: v => v.units === 'SI' ? 121 : 17500, hint: 'A307 10, A325/A449 17.5, A490 22 ksi' },
          { id: 'Asreq', symbol: 'A_{s,req}', label: 'Required bolt area \\(F/\\tau_{allow}\\)', unit: 'in^2 / mm^2', kind: 'calc', digits: 4, compute: v => (H.has(v, 'Fres', 'tall') && v.tall > 0) ? v.Fres / v.tall : undefined },
          { id: 'Dreq', symbol: 'D_{req}', label: 'Required bolt diameter', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'Asreq') ? Math.sqrt(4 * v.Asreq / Math.PI) : undefined,
            work: v => H.has(v, 'Dreq') ? '\\(D = \\sqrt{4(' + TX(v.Asreq, 4) + ')/\\pi} = ' + TX(v.Dreq, 4) + ' \\rightarrow\\) next standard size' : null },
        ],
        after: v => { if (!H.has(v, 'nsh')) return '';
          const nd = v.ndsj || 1; const ns = [v.nsh, v.nbrb, v.nbr].filter(x => x !== undefined); const ok = ns.every(x => x >= nd);
          return (ok ? '<span class="result-ok">Shear joint PASS — ' : '<span class="result-bad">Shear joint FAIL — ') + 'F = ' + H.fmt(v.Fres, 4) + ', \\(n_{shear}\\) = ' + H.fmt(v.nsh, 3) + (v.nbrb !== undefined ? ', bolt bearing ' + H.fmt(v.nbrb, 3) : '') + (v.nbr !== undefined ? ', member bearing ' + H.fmt(v.nbr, 3) : '') + ' vs \\(n_d\\) = ' + H.fmt(nd) + '.' + (H.has(v, 'Dreq') ? ' Mott 20-1: \\(A_s\\) = ' + H.fmt(v.Asreq, 4) + ' → D ≥ ' + H.fmt(v.Dreq, 4) + ' (next standard size).' : '') + '</span>'; } },
      { id: 'sjbend', title: 'Bending of the bracket at the bolt line (HW5 P3)', fig: ['fig8-30'], when: v => v.sj === 'shear',
        formula: 'I = \\frac{t h^3}{12} - \\sum_{holes}\\left(\\frac{t d^3}{12} + t\\,d\\,y_i^2\\right) \\qquad \\sigma = \\frac{M(h/2)}{I} \\qquad n = \\frac{S_{y,mem}}{\\sigma}',
        text: 'Plate of thickness t and depth h with a row of holes along the depth (one at the centre, pairs at ±a). Optional.',
        vars: [
          { id: 'hbr', symbol: 'h', label: 'Bracket depth at the bolt line', unit: 'in / mm', kind: 'input', hint: 'HW5 P3: 136 mm' },
          { id: 'nhc', symbol: 'n_{hc}', label: 'Holes on the neutral axis', kind: 'input', default: 1 },
          { id: 'abr', symbol: 'a', label: 'Distance of the outer hole pair from the axis', unit: 'in / mm', kind: 'input', hint: 'HW5 P3: 32 mm' },
          { id: 'Ibr', symbol: 'I', label: 'Net second moment of area', unit: 'in^4 / mm^4', kind: 'calc', digits: 4, compute: v => { if (!H.has(v, 'tmem', 'hbr', 'dsj')) return undefined; const t = v.tmem, d = v.dsj; const nh = (v.nhc || 0) + (H.has(v, 'abr') ? 2 : 0);
              return t * Math.pow(v.hbr, 3) / 12 - nh * t * d * d * d / 12 - (H.has(v, 'abr') ? 2 * t * d * v.abr * v.abr : 0); },
            work: v => H.has(v, 'Ibr') ? '\\(I = \\dfrac{' + TX(v.tmem) + '(' + TX(v.hbr) + ')^3}{12} - ' + ((v.nhc || 0) + (H.has(v, 'abr') ? 2 : 0)) + '\\dfrac{' + TX(v.tmem) + '(' + TX(v.dsj) + ')^3}{12}' + (H.has(v, 'abr') ? ' - 2(' + TX(v.abr) + ')^2(' + TX(v.tmem) + ')(' + TX(v.dsj) + ')' : '') + ' = ' + TX(v.Ibr, 4) + '\\)' : null },
          { id: 'sbr', symbol: '\\sigma', label: 'Bending stress at the bolt line', unit: 'psi / MPa', kind: 'calc', digits: 4, compute: v => H.has(v, 'M', 'hbr', 'Ibr') && v.Ibr > 0 ? v.M * v.hbr / 2 / v.Ibr : undefined,
            work: v => H.has(v, 'sbr') ? '\\(\\sigma = \\dfrac{' + TX(v.M, 4) + '(' + TX(v.hbr / 2) + ')}{' + TX(v.Ibr, 4) + '} = ' + TX(v.sbr, 4) + '\\)' : null },
          { id: 'nbend', symbol: 'n_{bend}', label: 'Bracket bending factor of safety', kind: 'calc', digits: 3, compute: v => H.has(v, 'Sym', 'sbr') && v.sbr > 0 ? v.Sym / v.sbr : undefined },
        ] },
    ] },

    { title: 'Result', steps: [
      { id: 'result', title: 'Overall verdict', vars: [],
        after: v => {
          const ck = t => t ? '<span class="result-ok">✓</span>' : '<span class="result-bad">✗</span>';
          const parts = []; let ok = true;
          if (v.np !== undefined) { const t = v.np >= 1 && v.nL >= 1 && v.n0 >= 1; ok = ok && t; parts.push('tension: \\(n_p\\) = ' + H.fmt(v.np, 3) + ', \\(n_L\\) = ' + H.fmt(v.nL, 3) + ', \\(n_0\\) = ' + H.fmt(v.n0, 3) + ' ' + ck(t)); }
          if (v.nf !== undefined) { const t = v.nf >= 1; ok = ok && t; parts.push('fatigue \\(n_f\\) = ' + H.fmt(v.nf, 3) + ' ' + ck(t)); }
          if (v.sj === 'shear' && v.nsh !== undefined) { const nd = v.ndsj || 1; const t = [v.nsh, v.nbrb, v.nbr, v.nbend].filter(x => x !== undefined).every(x => x >= nd); ok = ok && t; parts.push('shear joint (min ' + H.fmt(Math.min(...[v.nsh, v.nbrb, v.nbr, v.nbend].filter(x => x !== undefined)), 3) + ' vs ' + H.fmt(nd) + ') ' + ck(t)); }
          if (!parts.length) return '<span>Complete the steps above.</span>';
          return (ok ? '<span class="result-ok"><b>PASS</b></span> — ' : '<span class="result-bad"><b>FAIL</b></span> — ') + parts.join('; ') + (H.has(v, 'd') ? ' (d = ' + H.fmt(v.d) + (BOLT_GRADES[v.grade] ? ', ' + BOLT_GRADES[v.grade][0].split(' (')[0] : '') + (H.has(v, 'T') ? ', T = ' + H.fmt(v.T, 4) : '') + ').' : '.'); } },
    ] },
  ],
};
