// Helical springs — Shigley Ch. 10 (Fizz §5.3 "iterate d" / "calculate from C" paths; Examples 10-1 … 10-4, 10-6)
// Course alignment (v2/COURSE_CONVENTIONS.md §14): Module 5 reading guide — Shigley 10-1 … 10-4, 10-9, 10-11 required. Course worked numbers:
// HW5 P6 (Shigley 10-6), Selected Tutorial Questions 2022 P3 (Shigley 10-3/10-5, parts 1 and 2), RAP quiz — see v2/notes/past_exam_m5.md.
// Verified against: Shigley Example 10-6 (hard-drawn 0.035 in, OD 0.248, r1 0.106, r2 0.089, Fi 1.19 lbf, Nb 12.17, F 5.25 lbf) → C 6.086,
//   KB 1.234, Na 12.57, k 17.91, L0 0.817, τi 15.1 kpsi (preferred 14.2–21.2), Sut 264.7, n 1.45, σA 156.9 kpsi, nA 1.27, nB 1.35 — reproduced.
// Verified against: Shigley Example 10-2, d = 0.080 column (the `example`, mode 1) → C 10.53, D 0.843, OD 0.923, Na 10.1, Ls 0.964, L0 3.264,
//   (L0)cr 4.43, ns 1.2, fom −0.417 — reproduced; the mode-1 candidate table reproduces the Example 10-2 table and picks its d = 0.075 in.
// Verified against: Shigley Example 10-3 (mode 2: A227, plain ends, 18 lbf @ 2.25 in, Fs 24 lbf, C 10 → d 0.0916 → 13 ga 0.0915, ns 1.198).
// Verified against: HW5 P6 (10-6: OQ&T 4 mm, C 10 → D 40, plain, L0 80, 50 N @ 15 mm, mode 3) → k 3.333, OD 44, Na = Nt 11.6, Ls 50.4,
//   Sut 1431, Ssy 715.5, Fs 98.7, KB 1.135, τs 178.4, ns 4.01 — reproduced (solution 4.02).
// Verified against: STQ 2022 P3 part 1 (music wire 0.105, OD 1.225, plain-ground, Nt 12, (ns)d = 1, mode 3) → Sut 279, Ssy 125.4 kpsi, KB 1.126,
//   F to closure 45.2 lbf, k 11.55, L0 5.17, p 0.431, (L0)cr 5.89, /5 = 1.18 < L0 → may buckle — reproduced; part 2 (A227 2 mm, OD 22, sg,
//   Nt 8.5, n 2, α 1) → 48.6 N, 3.05 N/mm, 32.9 mm, p 4.45 mm, (L0)cr/5 = 10.5 mm — reproduced.
// Material data: Shigley Table 10-4 (A, m, relative cost) and Table 10-5 (E, G). A_us kpsi·in^m, A_si MPa·mm^m; G/E rows [dmax in, G Mpsi, G GPa, E Mpsi, E GPa]
const SPR_MAT = {
  A228: { name: 'Music wire A228', cost: 2.6, cls: 'cd', rows: [{ dmax: 1e9, m: 0.145, Aus: 201, Asi: 2211 }],
    G: [[0.032, 12.0, 82.7, 29.5, 203.4], [0.063, 11.85, 81.7, 29.0, 200], [0.125, 11.75, 81.0, 28.5, 196.5], [1e9, 11.6, 80.0, 28.0, 193]] },
  A227: { name: 'Hard-drawn wire A227', cost: 1.0, cls: 'cd', rows: [{ dmax: 1e9, m: 0.190, Aus: 140, Asi: 1783 }],
    G: [[0.032, 11.7, 80.7, 28.8, 198.6], [0.063, 11.6, 80.0, 28.7, 197.9], [0.125, 11.5, 79.3, 28.6, 197.2], [1e9, 11.4, 78.6, 28.5, 196.5]] },
  A229: { name: 'Oil-tempered (OQ&T) wire A229', cost: 1.3, cls: 'ht', rows: [{ dmax: 1e9, m: 0.187, Aus: 147, Asi: 1855 }], G: [[1e9, 11.2, 77.2, 28.5, 196.5]] },
  A232: { name: 'Chrome-vanadium wire A232', cost: 3.1, cls: 'ht', rows: [{ dmax: 1e9, m: 0.168, Aus: 169, Asi: 2005 }], G: [[1e9, 11.2, 77.2, 29.5, 203.4]] },
  A401: { name: 'Chrome-silicon wire A401', cost: 4.0, cls: 'ht', rows: [{ dmax: 1e9, m: 0.108, Aus: 202, Asi: 1974 }], G: [[1e9, 11.2, 77.2, 29.5, 203.4]] },
  A313: { name: '302 stainless wire A313', cost: 9.0, cls: 'ss', rows: [{ dmax: 0.10, m: 0.146, Aus: 169, Asi: 1867 }, { dmax: 0.20, m: 0.263, Aus: 128, Asi: 2065 }, { dmax: 1e9, m: 0.478, Aus: 90, Asi: 2911 }], G: [[1e9, 10, 69.0, 28, 193]] },
  B159: { name: 'Phosphor-bronze wire B159', cost: 8.0, cls: 'nf', rows: [{ dmax: 0.022, m: 0, Aus: 145, Asi: 1000 }, { dmax: 0.075, m: 0.028, Aus: 121, Asi: 913 }, { dmax: 1e9, m: 0.064, Aus: 110, Asi: 932 }], G: [[1e9, 6, 41.4, 15, 103.4]] },
};
const SPR_FRAC = { cd: [0.45, 0.65], ht: [0.50, 0.70], ss: [0.35, 0.60], nf: [0.35, 0.60] };      // Table 10-6 (before / after set removal)
const EXT_FRAC = { cd: [0.45, 0.40, 0.75], ht: [0.45, 0.40, 0.75], ss: [0.35, 0.30, 0.55], nf: [0.35, 0.30, 0.55] };   // Table 10-7
// Table A-28: gauge, Washburn & Moen (steel wire except music wire), music wire (in); preferred metric sizes (Mott Table 18-2)
const GAUGE = ['7/0', '6/0', '5/0', '4/0', '3/0', '2/0', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40'];
const WM = [0.4900, 0.4615, 0.4305, 0.3938, 0.3625, 0.3310, 0.3065, 0.2830, 0.2625, 0.2437, 0.2253, 0.2070, 0.1920, 0.1770, 0.1620, 0.1483, 0.1350, 0.1205, 0.1055, 0.0915, 0.0800, 0.0720, 0.0625, 0.0540, 0.0475, 0.0410, 0.0348, 0.0317, 0.0286, 0.0258, 0.0230, 0.0204, 0.0181, 0.0173, 0.0162, 0.0150, 0.0140, 0.0132, 0.0128, 0.0118, 0.0104, 0.0095, 0.0090, 0.0085, 0.0080, 0.0075, 0.0070];
const MW = [null, 0.004, 0.005, 0.006, 0.007, 0.008, 0.009, 0.010, 0.011, 0.012, 0.013, 0.014, 0.016, 0.018, 0.020, 0.022, 0.024, 0.026, 0.029, 0.031, 0.033, 0.035, 0.037, 0.039, 0.041, 0.043, 0.045, 0.047, 0.049, 0.051, 0.055, 0.059, 0.063, 0.067, 0.071, 0.075, 0.080, 0.085, 0.090, 0.095, 0.100, 0.106, 0.112, 0.118, 0.124, 0.130, 0.138];
const METRIC = [0.2, 0.22, 0.25, 0.28, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.8, 0.9, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.5, 2.8, 3.0, 3.5, 3.8, 4.0, 4.5, 4.8, 5.0, 5.5, 6.0, 6.5, 7.0, 8.0, 8.5, 9.0, 10, 11, 12, 13];
const EXT = v => v.mode === 'ext';
const CMP = v => v.mode !== 'ext';
const SI = v => v.units === 'SI';
const dInOf = (v, d) => (d === undefined ? undefined : (SI(v) ? d / 25.4 : d));
const dIn = v => dInOf(v, v.d);
const matRowAt = (v, d) => { const M = SPR_MAT[v.mat]; if (!M) return undefined; if (d === undefined) return M.rows.length === 1 ? M.rows[0] : undefined; const di = dInOf(v, d); return M.rows.find(r => di <= r.dmax) || M.rows[M.rows.length - 1]; };
const matRow = v => matRowAt(v, v.d);
const matGAt = (v, d) => { const M = SPR_MAT[v.mat]; if (!M) return undefined; const di = d === undefined ? 0.0641 : dInOf(v, d); return M.G.find(r => di <= r[0]) || M.G[M.G.length - 1]; };
const matG = v => matGAt(v, v.d);
const KU = v => SI(v) ? 1 : 1000;
const ENDS = { plain: [0, 'Na', 'd(Nt+1)'], pg: [1, 'Na+1', 'dNt'], sq: [2, 'Na+2', 'd(Nt+1)'], sg: [2, 'Na+2', 'dNt'] };
const Ne = v => ENDS[v.ends] ? ENDS[v.ends][0] : undefined;
const Ls_of = (v, Nt, d) => (d === undefined ? v.d : d) * ((v.ends === 'pg' || v.ends === 'sg') ? Nt : Nt + 1);
const PI = Math.PI;
const TX = (x, d) => String(H.fmt(x, d)).replace(/e([+-]?)(\d+)$/, (m, s, e) => '\\times10^{' + (s === '-' ? '-' : '') + e + '}');
const FsDesign = v => v.Fsg !== undefined ? v.Fsg : (H.has(v, 'Fmax', 'xi') ? (1 + v.xi) * v.Fmax : undefined);
// one candidate wire diameter through the whole static design (modes 1 and 2) — used by the selection table
function trial(v, d) {
  const r = matRowAt(v, d), g = matGAt(v, d), M = SPR_MAT[v.mat]; if (!r || !g || !M) return undefined;
  const frac = SPR_FRAC[M.cls][v.set === 1 ? 1 : 0], Sut = (SI(v) ? r.Asi : r.Aus) / Math.pow(d, r.m) * KU(v), Ssy = frac * Sut;
  const G = SI(v) ? g[2] * 1000 : g[1] * 1e6, Fs = FsDesign(v); if (Fs === undefined || !H.has(v, 'nsd')) return undefined;
  let C;
  if (v.mode === 'C') C = v.Ctry; else { const a = Ssy / v.nsd, b = 8 * Fs / (PI * d * d), q = (2 * a - b) / (4 * b), rr = q * q - 3 * a / (4 * b); C = rr >= 0 ? q + Math.sqrt(rr) : undefined; }
  if (!(C > 1)) return { d, C };
  const D = C * d, KB = (4 * C + 2) / (4 * C - 3), ts = KB * 8 * Fs * D / (PI * d * d * d), ns = Ssy / ts;
  const k = H.has(v, 'Fmax', 'ymax') && v.ymax > 0 ? v.Fmax / v.ymax : undefined;
  const Na = k ? Math.pow(d, 4) * G / (8 * Math.pow(D, 3) * k) : undefined, Nt = Na !== undefined && Ne(v) !== undefined ? Na + Ne(v) : undefined;
  const Ls = Nt !== undefined ? Ls_of(v, Nt, d) : undefined, L0 = Ls !== undefined && k ? Ls + Fs / k : undefined, L0cr = H.has(v, 'alpha') ? 2.63 * D / v.alpha : undefined;
  const fom = Nt !== undefined ? -M.cost * PI * PI * d * d * Nt * D / 4 : undefined;
  const ok = C >= 4 && C <= 12 && Na >= 3 && Na <= 15 && ns >= 0.99 * v.nsd && (L0cr === undefined || L0 < L0cr) && (!H.has(v, 'Lmax') || L0 <= v.Lmax) && (!H.has(v, 'Lsmax') || Ls <= v.Lsmax);
  return { d, C, D, ns, Na, L0, L0cr, fom, ok };
}
function wireList(v) {
  if (SI(v)) return METRIC.map(d => ({ g: d + ' mm', d }));
  const col = v.mat === 'A228' ? MW : WM;
  return GAUGE.map((g, i) => ({ g: (v.mat === 'A228' ? 'music ' : 'W&M ') + g, d: col[i] })).filter(x => x.d).sort((a, b) => a.d - b.d);
}
function wireTable(v) {
  if (EXT(v) || v.mode === 'given' || !H.has(v, 'Fmax', 'nsd')) return '';
  const list = wireList(v), u = SI(v) ? ' mm' : ' in';
  if (v.mode === 'C') {
    if (!H.has(v, 'dcalc')) return '';
    const k = list.findIndex(x => x.d >= v.dcalc * 0.995); if (k < 0) return '';
    const rows = list.slice(Math.max(0, k - 2), k + 4).map(x => ({ x, t: trial(v, x.d) }));
    const pk = rows.find(r => r.t && r.t.ns >= 0.99 * v.nsd);
    return H.table(['Wire', 'd', '\\(n_s\\) at closure', '\\(N_a\\)', '\\(L_0\\)', 'fom'], rows.map(r => ({ cells: [r.x.g + (v.d === r.x.d ? ' ✔' : ''), H.fmt(r.x.d) + u, r.t ? H.fmt(r.t.ns, 3) : '—', r.t && r.t.Na !== undefined ? H.fmt(r.t.Na, 3) : '—', r.t && r.t.L0 !== undefined ? H.fmt(r.t.L0, 4) : '—', r.t && r.t.fom !== undefined ? H.fmt(r.t.fom, 3) : '—'],
      ok: !!(r.t && r.t.ns >= 0.99 * v.nsd), pick: r === pk, set: { d: r.x.d } })),
      { caption: 'Select the wire — Table A-28' + (SI(v) ? ' (preferred metric sizes)' : (v.mat === 'A228' ? ' music-wire gauge' : ' W&M gauge')) + ' near \\(d_{calc} = ' + TX(v.dcalc, 4) + '\\)' + u, note: 'Rule (Fizz p.145, Ex. 10-3): the standard size nearest \\(d_{calc}\\) that keeps \\(n_s \\ge (n_s)_d\\) (1 % tolerance, as Ex. 10-3 accepts 1.198); a larger wire raises \\(n_s\\).' });
  }
  const rows = list.map(x => ({ x, t: trial(v, x.d) })).filter(r => r.t && r.t.C >= 3 && r.t.C <= 16);
  if (!rows.length) return '';
  const feas = rows.filter(r => r.t.ok); const pk = feas.length ? feas.reduce((a, b) => (b.t.fom > a.t.fom ? b : a)) : undefined;
  return H.table(['Wire', 'd', 'C', '\\(N_a\\)', '\\(L_0\\)', '\\((L_0)_{cr}\\)', 'fom', 'feasible'], rows.map(r => ({ cells: [r.x.g + (v.d === r.x.d ? ' ✔' : ''), H.fmt(r.x.d) + u, H.fmt(r.t.C, 3), H.fmt(r.t.Na, 3), H.fmt(r.t.L0, 4), H.fmt(r.t.L0cr, 4), H.fmt(r.t.fom, 3), r.t.ok ? 'yes' : 'no'],
    ok: r.t.ok, pick: r === pk, set: { d: r.x.d } })),
    { caption: 'Candidate wires — the Example 10-2 table, live', note: 'Rule (Fizz p.143, Ex. 10-2): drop rows outside 4 ≤ C ≤ 12, 3 ≤ \\(N_a\\) ≤ 15 or with \\(L_0 \\ge (L_0)_{cr}\\) / over a length limit; of the rest pick the largest (least negative) fom.' });
}

window.TOPIC = {
  id: 'springs', book: 'shigley',
  title: 'Helical Compression Springs — Static & Fatigue Design',
  subtitle: 'Shigley Ch. 10-1 … 10-9, 10-11 · Fizz guide §5.3 (Examples 10-1 … 10-6, HW5 P6)',
  sibling: 'springs_mott.html',
  intro: 'Pick a <b>mode</b>: (1) choose d — C from Eq. 10-23 for \\(n_s = 1.2\\), compare wires by fom (Ex. 10-2); (2) choose C — solve d, take the next standard wire (Ex. 10-3); (3) spring given — analyse known d, D, \\(N_t\\), \\(L_0\\); (4) extension spring (10-11, Ex. 10-6). '
    + 'Then rate, coils, lengths, buckling, design conditions, surge and (if \\(F_{min}\\) is given) fatigue. Units: US (lbf, in, psi) or SI (N, mm, MPa).',
  example: { units: 'US', Fmax: 20, ymax: 2, xi: 0.15, nsd: 1.2, mat: 'A228', set: 0, ends: 'sg', mode: 'd', d: 0.080, alpha: 0.5 },

  assumptions: [
    { text: 'Overrun to closure \\(\\xi = 0.15\\): \\(F_s = 1.15F_{max}\\) unless the solid force is given', src: 'Fizz p.138 · Fizz p.136', var: 'xi' },
    { text: 'Design factor at solid height \\((n_s)_d = 1.2\\) (set 1 for "just reaches yield at closure")', src: 'Fizz p.138', var: 'nsd' },
    { text: 'Mode 2 ("calculate from C") is the preferred path, starting at C = 10', src: 'Fizz p.143 · Fizz p.145', var: 'mode' },
    { text: 'If \\(N_a\\) falls outside 3–15, change C within 4–12', src: 'Fizz p.145', var: 'Ctry' },
    { text: 'E, G from Table 10-5 for d > 0.064 in until d is chosen, then the row of the actual d', src: 'Fizz p.137 · Shigley Ex. 10-2', var: 'G' },
    { text: 'As-wound: \\(S_{sy}\\) = 0.45 \\(S_{ut}\\) (music wire, cold-drawn), 0.50 (hardened & tempered), 0.35 (stainless, nonferrous); set removed 0.65', src: 'Fizz p.139 · Fizz p.142', var: 'frac' },
    { text: 'Squared-and-ground ends (needed on flat plates)', src: 'Fizz p.131 · Fizz p.146', var: 'ends' },
    { text: 'Eq. 10-23: take the larger root for C', src: 'Fizz p.137', var: 'C' },
    { text: 'Bergsträsser \\(K_B = (4C+2)/(4C-3)\\) (Wahl \\(K_W\\) differs by ≈ 1 %)', src: 'Fizz p.129', var: 'KB' },
    { text: 'Flat parallel ends: \\(\\alpha = 0.5\\); steel is absolutely stable when \\(L_0 < 2.63D/\\alpha\\)', src: 'Fizz p.131 · Fizz p.146', var: 'alpha' },
    { text: 'Design conditions 4 ≤ C ≤ 12, 3 ≤ \\(N_a\\) ≤ 15, \\(\\xi \\ge 0.15\\), \\(n_s \\ge 1.2\\); largest fom wins', src: 'Fizz p.136 · Fizz p.143', var: 'fom' },
    { text: 'Surge: \\(f = \\tfrac12\\sqrt{kg/W}\\), keep f ≥ 15× the operating frequency; steel \\(\\gamma\\) = 0.284 lbf/in\\(^3\\)', src: 'Fizz p.135', step: 'freq' },
    { text: 'Fatigue: Zimmerli unpeened \\(S_{sa}\\) = 35, \\(S_{sm}\\) = 55 kpsi, \\(S_{su} = 0.67S_{ut}\\); Gerber by default', src: 'Fizz p.135', var: 'peen' },
  ],

  figures: [
    { id: 'fig10-1', ref: 'Figure 10-1', title: 'Axially loaded helical spring: the wire carries direct shear F and torsion T = FD/2', src: 'figures/shigley/fig10-1.png', page: 547 },
    { id: 'fig10-2', ref: 'Figure 10-2', title: 'End types: plain, squared (closed), squared & ground, plain & ground', src: 'figures/shigley/fig10-2.png', page: 549 },
    { id: 'table10-1', ref: 'Table 10-1', title: 'Formulas by end type: \\(N_e\\), \\(N_t\\), \\(L_0\\), \\(L_s\\), pitch', src: 'figures/shigley/table10-1.png', page: 550, note: 'Squared & ground: \\(N_t = N_a + 2\\), \\(L_s = dN_t\\), \\(L_0 = pN_a + 2d\\).' },
    { id: 'table10-2', ref: 'Table 10-2', title: 'End-condition constant \\(\\alpha\\) for buckling', src: 'figures/shigley/table10-2.png', page: 551, note: 'Flat parallel surfaces: \\(\\alpha = 0.5\\); pivoted ends: 1.' },
    { id: 'table10-4', ref: 'Table 10-4', title: 'Constants A and m of \\(S_{ut} = A/d^m\\), and relative cost', src: 'figures/shigley/table10-4.png', page: 553, note: 'A in kpsi·in\\(^m\\) (d in in) or MPa·mm\\(^m\\) (d in mm).' },
    { id: 'table10-5', ref: 'Table 10-5', title: 'E and G of spring wires (by diameter for A228 / A227)', src: 'figures/shigley/table10-5.png', page: 554 },
    { id: 'table10-6', ref: 'Table 10-6', title: 'Maximum allowable torsional stress, static: % of \\(S_{ut}\\) before / after set removal', src: 'figures/shigley/table10-6.png', page: 555 },
    { id: 'fig10-3', ref: 'Figure 10-3', title: 'Static spring design flowchart (over a rod / free / in a hole)', src: 'figures/shigley/fig10-3.png', page: 558 },
    { id: 'ex10-2', ref: 'Example 10-2 table', title: 'Example 10-2: candidate wire sizes with the constraints shaded', src: 'figures/shigley/ex10-2-table.png', page: 560, note: 'Mode 1 shows this table live under the design-mode step.' },
    { id: 'tableA-28a', ref: 'Table A-28 (a)', title: 'Wire gauge decimal equivalents — gauges 7/0 to 17', src: 'figures/shigley/tableA-28a.png', page: 1088, note: 'Music-wire column for A228; Washburn & Moen for other steel wire.' },
    { id: 'tableA-28b', ref: 'Table A-28 (b)', title: 'Wire gauge decimal equivalents — gauges 18 to 40', src: 'figures/shigley/tableA-28b.png', page: 1089 },
    { id: 'fig10-6', ref: 'Figure 10-6', title: 'Extension-spring ends: bending at A (radius \\(r_1\\)) and torsion at B (radius \\(r_2\\))', src: 'figures/shigley/fig10-6.png', page: 572 },
    { id: 'fig10-7', ref: 'Figure 10-7', title: 'Extension spring: F–y curve with initial tension \\(F_i\\), free length inside hooks, preferred initial-tension stress vs C', src: 'figures/shigley/fig10-7.png', page: 573, note: 'Eq. 10-41: \\(\\tau_i = 33\\,500/e^{0.105C} \\pm 1000\\,[4 - (C-3)/6.5]\\) psi.' },
    { id: 'table10-7', ref: 'Table 10-7', title: 'Allowable stresses for extension springs, static: % \\(S_{ut}\\) in body / end torsion / end bending', src: 'figures/shigley/table10-7.png', page: 574, note: 'Steels: 45 / 40 / 75 %; stainless, nonferrous: 35 / 30 / 55 %.' },
  ],

  sections: [
    { title: 'Inputs', steps: [
      { id: 'in', title: 'Loads, deflection and design factors', fig: ['fig10-1'], eq: '10-17 … 10-21',
        formula: 'k = \\frac{F_{max}}{y_{max}} \\qquad F_s = (1+\\xi)F_{max}',
        text: 'Spring rate k = force ÷ deflection. Enter the solid-height force if the problem states it (Ex. 10-3).',
        vars: [
          { id: 'units', label: 'Unit system', kind: 'choice', type: 'text', options: [{ label: 'US: lbf, in, psi (A in kpsi)', value: 'US' }, { label: 'SI: N, mm, MPa', value: 'SI' }], default: 'US' },
          { id: 'Fmax', symbol: 'F_{max}', label: 'Maximum working force', unit: 'lbf / N', kind: 'input' },
          { id: 'ymax', symbol: 'y_{max}', label: 'Deflection at \\(F_{max}\\) (from free length)', unit: 'in / mm', kind: 'input', hint: 'blank if the spring is given' },
          { id: 'Fmin', symbol: 'F_{min}', label: 'Minimum working force (fatigue only)', unit: 'lbf / N', kind: 'input', hint: 'blank = static design' },
          { id: 'Fsg', symbol: 'F_{s,given}', label: 'Force at solid height, if specified', unit: 'lbf / N', kind: 'input' },
          { id: 'xi', symbol: '\\xi', label: 'Fractional overrun to closure', kind: 'input', default: 0.15, check: v => (v.xi !== undefined && v.xi < 0.15) ? 'Shigley recommends \\(\\xi \\ge 0.15\\)' : null },
          { id: 'nsd', symbol: '(n_s)_d', label: 'Design factor at solid height', kind: 'input', default: 1.2 },
        ] },
      { id: 'matl', title: 'Material and end type', fig: ['table10-4', 'table10-6', 'fig10-2', 'table10-1'],
        vars: [
          { id: 'mat', label: 'Wire material (ASTM)', kind: 'choice', type: 'text', options: Object.keys(SPR_MAT).map(k => ({ label: SPR_MAT[k].name, value: k })), default: 'A228' },
          { id: 'set', label: 'Set removal', kind: 'choice', options: [{ label: 'As-wound (no set removal) — with \\(K_B\\)', value: 0 }, { label: 'Set removed — Table 10-6 right column', value: 1 }], default: 0 },
          { id: 'ends', label: 'End type (Table 10-1)', kind: 'choice', type: 'text', options: [{ label: 'Plain', value: 'plain' }, { label: 'Plain and ground', value: 'pg' }, { label: 'Squared or closed', value: 'sq' }, { label: 'Squared and ground', value: 'sg' }], default: 'sg' },
        ] },
      { id: 'mprop', title: 'Material properties from the tables', fig: ['table10-4', 'table10-5', 'table10-6', 'table10-7'],
        text: 'Pre-filled from the tables once d is known; overwrite if your edition differs.',
        vars: [
          { id: 'A', symbol: 'A', label: 'Strength constant', unit: 'kpsi·in^m / MPa·mm^m', kind: 'lookup', fig: 'table10-4', auto: v => { const r = matRow(v); return r ? (SI(v) ? r.Asi : r.Aus) : undefined; } },
          { id: 'm', symbol: 'm', label: 'Exponent', kind: 'lookup', fig: 'table10-4', auto: v => { const r = matRow(v); return r ? r.m : undefined; } },
          { id: 'G', symbol: 'G', label: 'Shear modulus', unit: 'psi / MPa', kind: 'lookup', fig: 'table10-5', auto: v => { const g = matG(v); return g ? (SI(v) ? g[2] * 1000 : g[1] * 1e6) : undefined; } },
          { id: 'E', symbol: 'E', label: 'Elastic modulus', unit: 'psi / MPa', kind: 'lookup', fig: 'table10-5', auto: v => { const g = matG(v); return g ? (SI(v) ? g[4] * 1000 : g[3] * 1e6) : undefined; } },
          { id: 'frac', symbol: 'S_{sy}/S_{ut}', label: 'Allowable fraction of \\(S_{ut}\\)', kind: 'lookup', fig: 'table10-6', auto: v => { const M = SPR_MAT[v.mat]; if (!M) return undefined; return EXT(v) ? EXT_FRAC[M.cls][0] : SPR_FRAC[M.cls][v.set === 1 ? 1 : 0]; }, hint: 'Table 10-6; extension springs Table 10-7 body' },
          { id: 'cost', label: 'Relative material cost', kind: 'lookup', fig: 'table10-4', auto: v => SPR_MAT[v.mat] ? SPR_MAT[v.mat].cost : undefined },
        ] },
      { id: 'mode', title: 'Design mode and the decision variable', fig: ['fig10-3', 'tableA-28a', 'tableA-28b'],
        text: 'Mode 1: trial standard d. Mode 2: trial C, then a standard d near \\(d_{calc}\\). Mode 3: d and D (= OD − d), plus \\(N_t\\), \\(L_0\\) if known. The live table picks the wire.',
        vars: [
          { id: 'mode', label: 'Mode', kind: 'choice', type: 'text', options: [{ label: '1 · Choose wire d (Fig. 10-3 / Ex. 10-2)', value: 'd' }, { label: '2 · Choose index C, solve d (Ex. 10-3)', value: 'C' }, { label: '3 · Spring given: d and D known (Ex. 10-1, HW5 P6)', value: 'given' }, { label: '4 · Extension spring given (10-11 / Ex. 10-6)', value: 'ext' }], default: 'C' },
          { id: 'Ctry', symbol: 'C_{trial}', label: 'Trial spring index (mode 2)', kind: 'input', default: 10, hint: '4–12' },
          { id: 'dcalc', symbol: 'd_{calc}', label: 'Wire diameter for \\((n_s)_d\\) at C (mode 2)', unit: 'in / mm', kind: 'calc', digits: 4,
            compute: v => { if (v.mode !== 'C' || !H.has(v, 'Ctry', 'Fmax', 'nsd', 'frac', 'A', 'm')) return undefined;
              const KB = (4 * v.Ctry + 2) / (4 * v.Ctry - 3); const Fs = FsDesign(v); if (Fs === undefined) return undefined;
              return Math.pow(8 * v.nsd * Fs * KB * v.Ctry / (PI * v.frac * v.A * KU(v)), 1 / (2 - v.m)); },
            work: v => v.dcalc !== undefined ? '\\(d = \\left[\\dfrac{8\\,n_s F_s K_B C}{\\pi\\,(' + TX(v.frac) + ')\\,A' + (SI(v) ? '' : '\\times10^3') + '}\\right]^{1/(2-m)} = ' + TX(v.dcalc, 4) + '\\)' : null },
          { id: 'd', symbol: 'd', label: 'Wire diameter (standard size)', unit: 'in / mm', kind: 'lookup', fig: 'tableA-28a', hint: 'Table A-28 — see the table below' },
          { id: 'Dg', symbol: 'D', label: 'Mean coil diameter (modes 3, 4)', unit: 'in / mm', kind: 'input', hint: 'D = OD − d = Cd' },
          { id: 'Ntg', symbol: 'N_t', label: 'Total coils, if given (mode 3)', kind: 'input' },
          { id: 'L0g', symbol: 'L_0', label: 'Free length, if given (mode 3)', unit: 'in / mm', kind: 'input' },
        ],
        after: v => wireTable(v) },
      { id: 'xin', title: 'Extension spring data (mode 4)', fig: ['fig10-6', 'fig10-7'], when: EXT,
        text: '\\(N_b\\) = body coils; \\(F_i\\) = initial tension; \\(r_1\\) = hook radius for bending at A, \\(r_2\\) = bend radius for torsion at B (Fig. 10-6).',
        vars: [
          { id: 'Nbg', symbol: 'N_b', label: 'Number of body coils', kind: 'input' },
          { id: 'Fi', symbol: 'F_i', label: 'Initial tension', unit: 'lbf / N', kind: 'input', default: 0 },
          { id: 'r1', symbol: 'r_1', label: 'Hook mean radius (bending, A)', unit: 'in / mm', kind: 'input' },
          { id: 'r2', symbol: 'r_2', label: 'Hook bend radius (torsion, B)', unit: 'in / mm', kind: 'input' },
        ] },
    ] },

    { title: 'Strength and spring index', steps: [
      { id: 'str', title: 'Tensile and torsional yield strength', eq: '10-14, Table 10-6', fig: ['table10-4', 'table10-6'],
        formula: 'S_{ut} = \\frac{A}{d^m} \\qquad S_{sy} = (\\text{fraction})\\,S_{ut}',
        vars: [
          { id: 'Sut', symbol: 'S_{ut}', label: 'Minimum tensile strength', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'A', 'm', 'd') ? v.A / Math.pow(v.d, v.m) * KU(v) : undefined,
            work: v => H.has(v, 'Sut') ? '\\(S_{ut} = \\dfrac{' + TX(v.A) + '}{' + TX(v.d) + '^{' + TX(v.m) + '}} = ' + TX(v.A / Math.pow(v.d, v.m), 4) + (SI(v) ? '\\ \\text{MPa}' : '\\ \\text{kpsi}') + '\\)' : null },
          { id: 'Ssy', symbol: 'S_{sy}', label: 'Torsional yield strength', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'Sut', 'frac') ? v.frac * v.Sut : undefined,
            work: v => H.has(v, 'Ssy') ? '\\(S_{sy} = ' + TX(v.frac) + '(' + TX(v.Sut, 5) + ') = ' + TX(v.Ssy, 5) + '\\)' : null },
        ] },
      { id: 'cidx', title: 'Spring index C and mean diameter D', eq: '10-1, 10-23', fig: ['fig10-3'],
        formula: 'C = \\frac{D}{d} \\qquad \\alpha = \\frac{S_{sy}}{n_s},\\; \\beta = \\frac{8F_s}{\\pi d^2},\\; C = \\frac{2\\alpha-\\beta}{4\\beta} + \\sqrt{\\left(\\frac{2\\alpha-\\beta}{4\\beta}\\right)^2 - \\frac{3\\alpha}{4\\beta}}',
        text: 'C = coil diameter ÷ wire diameter. Mode 1 solves Eq. 10-23; mode 2 keeps the trial C; modes 3–4 use D/d. Over a rod or in a hole, set D from it (mode 3).',
        vars: [
          { id: 'Fsafe', symbol: 'F_{s,allow}', label: 'Closure force giving \\(n_s = (n_s)_d\\)', unit: 'lbf / N', kind: 'calc', digits: 4, compute: v => (CMP(v) && H.has(v, 'Ssy', 'nsd', 'd', 'D', 'KB') && v.D > 0) ? PI * Math.pow(v.d, 3) * v.Ssy / (8 * v.KB * v.D * v.nsd) : undefined,
            work: v => (v.mode === 'given' && H.has(v, 'Fsafe')) ? '\\(F = \\dfrac{\\pi d^3 S_{sy}}{8 K_B D\\,(n_s)_d} = \\dfrac{\\pi(' + TX(v.d) + ')^3(' + TX(v.Ssy, 5) + ')}{8(' + TX(v.KB, 4) + ')(' + TX(v.D, 4) + ')(' + TX(v.nsd) + ')} = ' + TX(v.Fsafe, 4) + '\\)' : null },
          { id: 'Fs', symbol: 'F_s', label: 'Force at closure', unit: 'lbf / N', kind: 'calc', compute: v => v.Fsg !== undefined ? v.Fsg : (H.has(v, 'L0g', 'Ls', 'k') ? v.k * (v.L0g - v.Ls) : (H.has(v, 'Fmax', 'xi') ? (1 + v.xi) * v.Fmax : (v.mode === 'given' ? v.Fsafe : undefined))),
            hint: 'given \\(F_s\\); else \\(k(L_0 - L_s)\\); else \\((1+\\xi)F_{max}\\); mode 3 with no load: the yield-safe force' },
          { id: 'xie', symbol: '\\xi_{eff}', label: 'Effective overrun \\(F_s/F_{max} - 1\\)', kind: 'calc', digits: 3, compute: v => H.has(v, 'Fs', 'Fmax') && v.Fmax > 0 ? v.Fs / v.Fmax - 1 : undefined },
          { id: 'alph', symbol: '\\alpha', label: '\\(S_{sy}/n_s\\)', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => (v.mode === 'd' && H.has(v, 'Ssy', 'nsd')) ? v.Ssy / v.nsd : undefined },
          { id: 'beta', symbol: '\\beta', label: '\\(8F_s/\\pi d^2\\)', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => (v.mode === 'd' && H.has(v, 'Fs', 'd')) ? 8 * v.Fs / (PI * v.d * v.d) : undefined },
          { id: 'C', symbol: 'C', label: 'Spring index', kind: 'calc', digits: 4, compute: v => {
              if (v.mode === 'C') return v.Ctry;
              if (v.mode === 'given' || v.mode === 'ext') return H.has(v, 'Dg', 'd') ? v.Dg / v.d : undefined;
              if (!H.has(v, 'alph', 'beta')) return undefined; const a = (2 * v.alph - v.beta) / (4 * v.beta); const r = a * a - 3 * v.alph / (4 * v.beta); return r >= 0 ? a + Math.sqrt(r) : undefined; },
            work: v => (v.mode === 'd' && H.has(v, 'alph', 'beta', 'C')) ? '\\(C = \\dfrac{2(' + TX(v.alph, 5) + ') - ' + TX(v.beta, 5) + '}{4(' + TX(v.beta, 5) + ')} + \\sqrt{\\left[\\dfrac{2(' + TX(v.alph, 5) + ') - ' + TX(v.beta, 5) + '}{4(' + TX(v.beta, 5) + ')}\\right]^2 - \\dfrac{3(' + TX(v.alph, 5) + ')}{4(' + TX(v.beta, 5) + ')}} = ' + TX(v.C, 4) + '\\)' : null,
            check: v => (v.C !== undefined && (v.C < 4 || v.C > 12)) ? 'Outside 4 ≤ C ≤ 12 (Eq. 10-18)' : null },
          { id: 'D', symbol: 'D', label: 'Mean coil diameter', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => (v.mode === 'given' || v.mode === 'ext') ? v.Dg : (H.has(v, 'C', 'd') ? v.C * v.d : undefined) },
          { id: 'OD', symbol: 'OD', label: 'Outside diameter (minimum hole)', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'D', 'd') ? v.D + v.d : undefined },
          { id: 'ID', symbol: 'ID', label: 'Inside diameter (maximum rod)', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'D', 'd') ? v.D - v.d : undefined },
        ] },
      { id: 'stress', title: 'Shear stress at closure and static factor of safety', eq: '10-5, 10-7', fig: ['fig10-1'], when: CMP,
        formula: 'K_B = \\frac{4C+2}{4C-3} \\qquad \\tau_s = K_B\\,\\frac{8 F_s D}{\\pi d^3} \\qquad n_s = \\frac{S_{sy}}{\\tau_s}',
        text: 'The wire carries direct shear plus torsional shear; \\(K_B\\) adds both and the curvature effect (higher stress on the inside of the coil).',
        vars: [
          { id: 'KB', symbol: 'K_B', label: 'Bergsträsser factor', kind: 'calc', digits: 4, compute: v => H.has(v, 'C') ? (4 * v.C + 2) / (4 * v.C - 3) : undefined },
          { id: 'KW', symbol: 'K_W', label: 'Wahl factor (reference)', kind: 'calc', digits: 4, compute: v => H.has(v, 'C') ? (4 * v.C - 1) / (4 * v.C - 4) + 0.615 / v.C : undefined },
          { id: 'taus', symbol: '\\tau_s', label: 'Shear stress at solid height', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'KB', 'Fs', 'D', 'd') ? v.KB * 8 * v.Fs * v.D / (PI * Math.pow(v.d, 3)) : undefined,
            work: v => H.has(v, 'taus') ? '\\(\\tau_s = ' + TX(v.KB, 4) + '\\,\\dfrac{8(' + TX(v.Fs) + ')(' + TX(v.D, 4) + ')}{\\pi(' + TX(v.d) + ')^3} = ' + TX(v.taus, 5) + '\\)' : null },
          { id: 'taumax', symbol: '\\tau_{max}', label: 'Shear stress at \\(F_{max}\\)', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'KB', 'Fmax', 'D', 'd') ? v.KB * 8 * v.Fmax * v.D / (PI * Math.pow(v.d, 3)) : undefined },
          { id: 'ns', symbol: 'n_s', label: 'Factor of safety at closure', kind: 'calc', digits: 3, compute: v => H.has(v, 'Ssy', 'taus') && v.taus > 0 ? v.Ssy / v.taus : undefined,
            work: v => H.has(v, 'ns') ? '\\(n_s = ' + TX(v.Ssy, 5) + '/' + TX(v.taus, 5) + ' = ' + TX(v.ns, 3) + '\\)' : null },
        ],
        after: v => v.ns === undefined ? '' : (v.ns >= (v.nsd || 1.2) - 1e-6 ? '<span class="result-ok">\\(n_s = ' + TX(v.ns, 3) + ' \\ge ' + TX(v.nsd || 1.2) + '\\) — no yield when compressed solid.</span>' : '<span class="result-bad">\\(n_s = ' + TX(v.ns, 3) + ' < ' + TX(v.nsd || 1.2) + '\\) — yields at solid height: larger d, smaller C or stronger wire.</span>') },
    ] },

    { title: 'Rate, coils and lengths', steps: [
      { id: 'rate', title: 'Spring rate and number of coils', eq: '10-9, 10-40, Table 10-1', fig: ['table10-1', 'fig10-7'],
        formula: 'k = \\frac{d^4 G}{8 D^3 N_a} \\qquad N_a = \\frac{d^4 G}{8 D^3 k} \\qquad N_t = N_a + N_e',
        text: 'Given \\(N_t\\): \\(N_a = N_t - N_e\\) and k follows; otherwise k = \\(F_{max}/y_{max}\\).',
        vars: [
          { id: 'Nag', symbol: 'N_{a,given}', label: 'Active coils from \\(N_t\\) (mode 3) or \\(N_b + G/E\\) (mode 4)', kind: 'calc', digits: 4, compute: v => EXT(v) ? (H.has(v, 'Nbg', 'G', 'E') ? v.Nbg + v.G / v.E : undefined) : ((H.has(v, 'Ntg') && Ne(v) !== undefined) ? v.Ntg - Ne(v) : undefined),
            work: v => (EXT(v) && H.has(v, 'Nag')) ? '\\(N_a = N_b + G/E = ' + TX(v.Nbg) + ' + ' + TX(v.G, 4) + '/' + TX(v.E, 4) + ' = ' + TX(v.Nag, 4) + '\\)' : null },
          { id: 'k', symbol: 'k', label: 'Spring rate', unit: 'lbf/in / N/mm', kind: 'calc', digits: 4, compute: v => {
              if (H.has(v, 'Nag', 'd', 'G', 'D') && v.Nag > 0) return Math.pow(v.d, 4) * v.G / (8 * Math.pow(v.D, 3) * v.Nag);
              return (H.has(v, 'Fmax', 'ymax') && v.ymax > 0) ? v.Fmax / v.ymax : undefined; },
            work: v => H.has(v, 'Nag', 'd', 'G', 'D') && v.Nag > 0 ? '\\(k = \\dfrac{(' + TX(v.d) + ')^4(' + TX(v.G, 4) + ')}{8(' + TX(v.D, 4) + ')^3(' + TX(v.Nag, 4) + ')} = ' + TX(v.k, 4) + '\\)' : (H.has(v, 'Fmax', 'ymax') ? '\\(k = ' + TX(v.Fmax) + '/' + TX(v.ymax) + ' = ' + TX(v.k, 4) + '\\)' : null) },
          { id: 'Na', symbol: 'N_a', label: 'Active coils', kind: 'calc', digits: 4, compute: v => H.has(v, 'Nag') ? v.Nag : (H.has(v, 'd', 'G', 'D', 'k') && v.k > 0 ? Math.pow(v.d, 4) * v.G / (8 * Math.pow(v.D, 3) * v.k) : undefined),
            work: v => (!H.has(v, 'Nag') && H.has(v, 'Na')) ? '\\(N_a = \\dfrac{(' + TX(v.d) + ')^4(' + TX(v.G, 4) + ')}{8(' + TX(v.D, 4) + ')^3(' + TX(v.k, 4) + ')} = ' + TX(v.Na, 4) + '\\)' : null,
            check: v => (v.Na !== undefined && (v.Na < 3 || v.Na > 15)) ? 'Outside 3 ≤ \\(N_a\\) ≤ 15 (Eq. 10-19)' : null },
          { id: 'Nt', symbol: 'N_t', label: 'Total coils', kind: 'calc', digits: 4, compute: v => EXT(v) ? v.Nbg : (H.has(v, 'Ntg') ? v.Ntg : (H.has(v, 'Na') && Ne(v) !== undefined ? v.Na + Ne(v) : undefined)) },
        ] },
      { id: 'len', title: 'Solid length, free length, pitch', eq: 'Table 10-1', fig: ['table10-1', 'fig10-2'], when: CMP,
        formula: 'y_s = \\frac{F_s}{k} \\qquad L_0 = L_s + y_s \\qquad p = \\frac{L_0 - (\\text{end allowance})}{N_a}',
        text: 'With \\(F_s\\) = the yield-safe force this is the "solid-safe" free length (STQ 10-3 c).',
        vars: [
          { id: 'Ls', symbol: 'L_s', label: 'Solid length', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'Nt', 'd') && ENDS[v.ends] ? Ls_of(v, v.Nt) : undefined,
            work: v => H.has(v, 'Ls') ? '\\(L_s = ' + ((v.ends === 'pg' || v.ends === 'sg') ? TX(v.d) + '(' + TX(v.Nt, 4) + ')' : TX(v.d) + '(' + TX(v.Nt, 4) + ' + 1)') + ' = ' + TX(v.Ls, 4) + '\\)' : null },
          { id: 'ys', symbol: 'y_s', label: 'Deflection to closure', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'L0g', 'Ls') ? v.L0g - v.Ls : (H.has(v, 'Fs', 'k') && v.k > 0 ? v.Fs / v.k : undefined) },
          { id: 'L0', symbol: 'L_0', label: 'Free length', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'L0g') ? v.L0g : (H.has(v, 'Ls', 'ys') ? v.Ls + v.ys : undefined),
            work: v => (!H.has(v, 'L0g') && H.has(v, 'L0')) ? '\\(L_0 = ' + TX(v.Ls, 4) + ' + ' + TX(v.ys, 4) + ' = ' + TX(v.L0, 4) + '\\)' : null },
          { id: 'Fsact', symbol: 'F_{s,act}', label: 'Force at solid height \\(k\\,y_s\\)', unit: 'lbf / N', kind: 'calc', compute: v => H.has(v, 'k', 'ys') ? v.k * v.ys : undefined },
          { id: 'p', symbol: 'p', label: 'Pitch', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => { if (!H.has(v, 'L0', 'Na', 'd') || !ENDS[v.ends]) return undefined;
              return { plain: (v.L0 - v.d) / v.Na, pg: v.L0 / (v.Na + 1), sq: (v.L0 - 3 * v.d) / v.Na, sg: (v.L0 - 2 * v.d) / v.Na }[v.ends]; } },
          { id: 'Lmax', symbol: 'L_{0,limit}', label: 'Free-length limit, if any', unit: 'in / mm', kind: 'input' },
          { id: 'Lsmax', symbol: 'L_{s,limit}', label: 'Solid-length limit, if any', unit: 'in / mm', kind: 'input' },
        ],
        after: v => { let s = '';
          if (H.has(v, 'Lmax', 'L0')) s += v.L0 <= v.Lmax ? '<span class="result-ok">\\(L_0\\) within the limit.</span> ' : '<span class="result-bad">\\(L_0 = ' + TX(v.L0, 4) + '\\) exceeds ' + H.fmt(v.Lmax) + '.</span> ';
          if (H.has(v, 'Lsmax', 'Ls')) s += v.Ls <= v.Lsmax ? '<span class="result-ok">\\(L_s\\) within the limit.</span>' : '<span class="result-bad">\\(L_s = ' + TX(v.Ls, 4) + '\\) exceeds ' + H.fmt(v.Lsmax) + '.</span>';
          return s; } },
      { id: 'buck', title: 'Buckling (stability)', eq: '10-10 … 10-13', fig: ['table10-2'], when: CMP,
        formula: "(L_0)_{cr} = \\frac{2.63\\,D}{\\alpha}\\;(\\text{steel}) \\qquad L_0 < \\frac{(L_0)_{cr}}{n} \\qquad y_{cr} = L_0 C'_1\\left[1 - \\left(1 - \\frac{C'_2}{\\lambda_{eff}^2}\\right)^{1/2}\\right]",
        text: 'Absolutely stable if \\(L_0 < (L_0)_{cr}/n\\); otherwise compare \\(y_{cr}\\) (Eq. 10-10) with the working deflection.',
        vars: [
          { id: 'alpha', symbol: '\\alpha', label: 'End-condition constant', kind: 'choice', options: [{ label: '0.5 — flat parallel surfaces (fixed–fixed)', value: 0.5 }, { label: '0.707 — fixed–hinged', value: 0.707 }, { label: '1.0 — hinged–hinged (pivoted)', value: 1 }, { label: '2.0 — clamped–free', value: 2 }], default: 0.5 },
          { id: 'nbk', symbol: 'n', label: 'Buckling safety factor', kind: 'input', default: 1, hint: 'STQ 10-5: 5' },
          { id: 'L0cr', symbol: '(L_0)_{cr}', label: 'Critical free length (steel)', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'D', 'alpha') ? 2.63 * v.D / v.alpha : undefined,
            work: v => H.has(v, 'L0cr') ? '\\((L_0)_{cr} = 2.63(' + TX(v.D, 4) + ')/' + TX(v.alpha) + ' = ' + TX(v.L0cr, 4) + (v.nbk > 1 ? ',\\quad (L_0)_{cr}/' + TX(v.nbk) + ' = ' + TX(v.L0cr / v.nbk, 4) : '') + '\\)' : null },
          { id: 'alphreq', symbol: '\\alpha_{req}', label: 'Largest stable \\(\\alpha = 2.63D/L_0\\)', kind: 'calc', digits: 3, compute: v => H.has(v, 'D', 'L0') && v.L0 > 0 ? 2.63 * v.D / v.L0 : undefined },
          { id: 'ycr', symbol: 'y_{cr}', label: 'Critical deflection (Eq. 10-10)', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => { if (!H.has(v, 'L0', 'D', 'alpha', 'E', 'G')) return undefined;
              const C1 = v.E / (2 * (v.E - v.G)), C2 = 2 * PI * PI * (v.E - v.G) / (2 * v.G + v.E), lam = v.alpha * v.L0 / v.D; const t = 1 - C2 / (lam * lam); return t < 0 ? Infinity : v.L0 * C1 * (1 - Math.sqrt(t)); } },
        ],
        after: v => { if (!H.has(v, 'L0', 'L0cr')) return ''; const lim = v.L0cr / (v.nbk > 0 ? v.nbk : 1);
          if (v.L0 < lim) return '<span class="result-ok">\\(L_0 = ' + TX(v.L0, 4) + ' < ' + TX(lim, 4) + '\\) — stable, no buckling.</span>';
          let s = '<span class="result-bad">\\(L_0 = ' + TX(v.L0, 4) + ' \\ge ' + TX(lim, 4) + '\\) — may buckle (needs \\(\\alpha \\le ' + TX(v.alphreq, 3) + '\\)).</span>';
          if (H.has(v, 'ycr', 'ys') && isFinite(v.ycr)) s += ' \\(y_{cr} = ' + TX(v.ycr, 4) + '\\)' + (v.ycr > v.ys ? ' > \\(y_s\\): no buckling before closure.' : ' < \\(y_s\\): guide it on a rod or in a hole.');
          return s; } },
    ] },

    { title: 'Design assessment', steps: [
      { id: 'assess', title: 'Design conditions and figure of merit', eq: '10-18 … 10-22', fig: ['ex10-2', 'fig10-3'], when: CMP,
        formula: 'fom = -(\\text{rel. cost})\\,\\frac{\\pi^2 d^2 N_t D}{4}',
        text: 'Mode 1: the candidate table under the mode step compares every wire size at once.',
        vars: [
          { id: 'fom', symbol: 'fom', label: 'Figure of merit (\\(\\gamma\\) omitted)', kind: 'calc', digits: 4, compute: v => H.has(v, 'cost', 'd', 'Nt', 'D') ? -v.cost * PI * PI * v.d * v.d * v.Nt * v.D / 4 : undefined,
            work: v => H.has(v, 'fom') ? '\\(fom = -' + TX(v.cost) + '\\pi^2(' + TX(v.d) + ')^2(' + TX(v.Nt, 4) + ')(' + TX(v.D, 4) + ')/4 = ' + TX(v.fom, 4) + '\\)' : null },
        ],
        after: v => { if (v.C === undefined) return '';
          const rows = [['4 ≤ C ≤ 12', v.C, v.C >= 4 && v.C <= 12], ['3 ≤ \\(N_a\\) ≤ 15', v.Na, v.Na !== undefined && v.Na >= 3 && v.Na <= 15], ['\\(\\xi \\ge 0.15\\)', v.xie, v.xie === undefined || v.xie >= 0.15 - 1e-9], ['\\(n_s \\ge (n_s)_d\\)', v.ns, v.ns !== undefined && v.ns >= (v.nsd || 1.2) - 1e-6], ['\\(L_0 < (L_0)_{cr}\\)', v.L0, v.L0 !== undefined && v.L0cr !== undefined && v.L0 < v.L0cr]];
          if (H.has(v, 'Lmax')) rows.push(['\\(L_0\\) ≤ limit', v.L0, v.L0 <= v.Lmax]); if (H.has(v, 'Lsmax')) rows.push(['\\(L_s\\) ≤ limit', v.Ls, v.Ls <= v.Lsmax]);
          const ok = rows.every(r => r[2]);
          return rows.map(r => r[0] + ': <b>' + H.fmt(r[1], 4) + '</b> ' + (r[2] ? '<span class="result-ok">✓</span>' : '<span class="result-bad">✗</span>')).join(' · ') + '<br>'
            + (ok ? '<span class="result-ok"><b>FEASIBLE</b> — fom = ' + H.fmt(v.fom, 4) + '.</span>' : '<span class="result-bad"><b>INFEASIBLE</b> for this d — another wire (mode 1) or C (mode 2).</span>'); } },
      { id: 'freq', title: 'Critical (surge) frequency', eq: '10-25 … 10-27',
        formula: 'W = \\frac{\\pi^2 d^2 D N_a \\gamma}{4} \\qquad f = \\frac{1}{2}\\sqrt{\\frac{k g}{W}}\\ (\\text{both ends on plates})',
        text: 'Keep f at least 15–20× the operating frequency. g = 386 in/s\\(^2\\) (9810 mm/s\\(^2\\)).',
        vars: [
          { id: 'gamma', symbol: '\\gamma', label: 'Specific weight of the wire', unit: 'lbf/in^3 / N/mm^3', kind: 'input', auto: v => SI(v) ? 7.65e-5 : 0.284, hint: 'steel: 0.284 lbf/in\\(^3\\) = \\(7.65\\times10^{-5}\\) N/mm\\(^3\\)' },
          { id: 'W', symbol: 'W', label: 'Weight of the active coils', unit: 'lbf / N', kind: 'calc', digits: 4, compute: v => H.has(v, 'd', 'D', 'Na', 'gamma') ? PI * PI * v.d * v.d * v.D * v.Na * v.gamma / 4 : undefined },
          { id: 'fn', symbol: 'f', label: 'Fundamental frequency', unit: 'Hz', kind: 'calc', digits: 4, compute: v => H.has(v, 'k', 'W') && v.W > 0 ? 0.5 * Math.sqrt(v.k * (SI(v) ? 9810 : 386.1) / v.W) : undefined,
            work: v => H.has(v, 'fn') ? '\\(f = \\tfrac12\\sqrt{' + TX(v.k, 4) + '(' + (SI(v) ? '9810' : '386') + ')/' + TX(v.W, 4) + '} = ' + TX(v.fn, 4) + '\\ \\text{Hz}\\)' : null },
          { id: 'fop', symbol: 'f_{op}', label: 'Operating frequency (if cyclic)', unit: 'Hz', kind: 'input' },
        ],
        after: v => H.has(v, 'fn', 'fop') && v.fop > 0 ? (v.fn / v.fop >= 15 ? '<span class="result-ok">\\(f/f_{op} = ' + TX(v.fn / v.fop, 3) + ' \\ge 15\\) — no surge.</span>' : '<span class="result-bad">\\(f/f_{op} = ' + TX(v.fn / v.fop, 3) + ' < 15\\) — raise k or lower W.</span>') : '' },
    ] },

    { title: 'Fatigue (if \\(F_{min}\\) is given)', steps: [
      { id: 'fat', title: 'Alternating and mean shear stresses', eq: '10-31 … 10-33',
        formula: 'F_a = \\frac{F_{max}-F_{min}}{2},\\; F_m = \\frac{F_{max}+F_{min}}{2} \\qquad \\tau_a = K_B\\frac{8F_a D}{\\pi d^3},\\; \\tau_m = K_B\\frac{8F_m D}{\\pi d^3}',
        vars: [
          { id: 'Fa', symbol: 'F_a', label: 'Alternating force', unit: 'lbf / N', kind: 'calc', compute: v => H.has(v, 'Fmax', 'Fmin') ? (v.Fmax - v.Fmin) / 2 : undefined },
          { id: 'Fm', symbol: 'F_m', label: 'Mean force', unit: 'lbf / N', kind: 'calc', compute: v => H.has(v, 'Fmax', 'Fmin') ? (v.Fmax + v.Fmin) / 2 : undefined },
          { id: 'taua', symbol: '\\tau_a', label: 'Alternating shear stress', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'KB', 'Fa', 'D', 'd') ? v.KB * 8 * v.Fa * v.D / (PI * Math.pow(v.d, 3)) : undefined,
            work: v => H.has(v, 'taua') ? '\\(\\tau_a = ' + TX(v.KB, 4) + '\\dfrac{8(' + TX(v.Fa) + ')(' + TX(v.D, 4) + ')}{\\pi(' + TX(v.d) + ')^3} = ' + TX(v.taua, 5) + '\\)' : null },
          { id: 'taum', symbol: '\\tau_m', label: 'Mean shear stress', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'KB', 'Fm', 'D', 'd') ? v.KB * 8 * v.Fm * v.D / (PI * Math.pow(v.d, 3)) : undefined },
        ],
        when: v => H.has(v, 'Fmin') },
      { id: 'sse', title: 'Zimmerli data and shear endurance limit', eq: '10-28 … 10-30',
        formula: 'S_{su} = 0.67 S_{ut} \\qquad S_{se} = \\frac{S_{sa}}{1 - S_{sm}/S_{su}}\\ (\\text{Goodman}) \\qquad S_{se} = \\frac{S_{sa}}{1 - (S_{sm}/S_{su})^2}\\ (\\text{Gerber})',
        text: 'Zimmerli (d < ⅜ in): unpeened \\(S_{sa}\\) = 35 kpsi (241 MPa), \\(S_{sm}\\) = 55 kpsi (379 MPa); peened 57.5 / 77.5 kpsi (398 / 534 MPa).',
        vars: [
          { id: 'peen', label: 'Surface', kind: 'choice', options: [{ label: 'Unpeened', value: 0 }, { label: 'Shot-peened', value: 1 }], default: 0 },
          { id: 'crit', label: 'Fatigue criterion', kind: 'choice', type: 'text', options: [{ label: 'Gerber (common for springs)', value: 'gerber' }, { label: 'Goodman', value: 'goodman' }, { label: 'Sines (ignores mean stress)', value: 'sines' }], default: 'gerber' },
          { id: 'Ssa', symbol: 'S_{sa}', label: 'Zimmerli alternating strength', unit: 'psi / MPa', kind: 'calc', compute: v => v.peen === 1 ? (SI(v) ? 398 : 57500) : (SI(v) ? 241 : 35000) },
          { id: 'Ssm', symbol: 'S_{sm}', label: 'Zimmerli mean strength', unit: 'psi / MPa', kind: 'calc', compute: v => v.peen === 1 ? (SI(v) ? 534 : 77500) : (SI(v) ? 379 : 55000) },
          { id: 'Ssu', symbol: 'S_{su}', label: 'Torsional modulus of rupture', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'Sut') ? 0.67 * v.Sut : undefined },
          { id: 'Sse', symbol: 'S_{se}', label: 'Shear endurance limit', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => { if (!H.has(v, 'Ssa', 'Ssm', 'Ssu')) return undefined; const r = v.Ssm / v.Ssu;
              return v.crit === 'goodman' ? v.Ssa / (1 - r) : v.crit === 'sines' ? v.Ssa : v.Ssa / (1 - r * r); },
            work: v => H.has(v, 'Sse') && v.crit !== 'sines' ? '\\(S_{se} = \\dfrac{' + TX(v.Ssa) + '}{1 - (' + TX(v.Ssm) + '/' + TX(v.Ssu, 5) + ')' + (v.crit === 'gerber' ? '^2' : '') + '} = ' + TX(v.Sse, 5) + '\\)' : null },
        ],
        when: v => H.has(v, 'Fmin') },
      { id: 'nf', title: 'Fatigue factor of safety', eq: '6-41 / 6-48 in shear',
        formula: "n_f = \\left(\\frac{\\tau_a}{S_{se}} + \\frac{\\tau_m}{S_{su}}\\right)^{-1}\\ (\\text{Goodman}) \\qquad n_f = \\frac12\\left(\\frac{S_{su}}{\\tau_m}\\right)^2\\frac{\\tau_a}{S_{se}}\\left[-1 + \\sqrt{1 + \\left(\\frac{2\\tau_m S_{se}}{S_{su}\\tau_a}\\right)^2}\\right]\\ (\\text{Gerber})",
        vars: [
          { id: 'nfat', symbol: 'n_f', label: 'Fatigue factor of safety', kind: 'calc', digits: 3, compute: v => { if (!H.has(v, 'taua', 'taum', 'Sse', 'Ssu') || v.taua <= 0) return undefined;
              if (v.crit === 'goodman') return 1 / (v.taua / v.Sse + v.taum / v.Ssu);
              if (v.crit === 'sines') return v.Ssa / v.taua;
              if (v.taum <= 0) return v.Sse / v.taua;
              const q = 2 * v.taum * v.Sse / (v.Ssu * v.taua); return 0.5 * Math.pow(v.Ssu / v.taum, 2) * (v.taua / v.Sse) * (-1 + Math.sqrt(1 + q * q)); },
            work: v => H.has(v, 'nfat') ? (v.crit === 'gerber' ? '\\(n_f = \\tfrac12\\left(\\dfrac{' + TX(v.Ssu, 5) + '}{' + TX(v.taum, 5) + '}\\right)^2\\dfrac{' + TX(v.taua, 5) + '}{' + TX(v.Sse, 5) + '}\\left[-1 + \\sqrt{1 + \\left(\\dfrac{2(' + TX(v.taum, 5) + ')(' + TX(v.Sse, 5) + ')}{' + TX(v.Ssu, 5) + '(' + TX(v.taua, 5) + ')}\\right)^2}\\right] = ' + TX(v.nfat, 3) + '\\)'
              : v.crit === 'goodman' ? '\\(n_f = \\left(\\dfrac{' + TX(v.taua, 5) + '}{' + TX(v.Sse, 5) + '} + \\dfrac{' + TX(v.taum, 5) + '}{' + TX(v.Ssu, 5) + '}\\right)^{-1} = ' + TX(v.nfat, 3) + '\\)' : '\\(n_f = ' + TX(v.Ssa) + '/' + TX(v.taua, 5) + ' = ' + TX(v.nfat, 3) + '\\)') : null },
          { id: 'ny', symbol: 'n_y', label: 'Static yield check \\(S_{sy}/\\tau_{max}\\)', kind: 'calc', digits: 3, compute: v => H.has(v, 'Ssy', 'taumax') && v.taumax > 0 ? v.Ssy / v.taumax : undefined },
        ],
        when: v => H.has(v, 'Fmin'),
        after: v => v.nfat === undefined ? '' : (v.nfat >= 1 ? '<span class="result-ok">PASS — fatigue \\(n_f = ' + TX(v.nfat, 3) + '\\) (' + v.crit + ', Zimmerli).</span>' : '<span class="result-bad">FAIL — \\(n_f = ' + TX(v.nfat, 3) + ' < 1\\): shot-peen, larger d or smaller load range.</span>') },
    ] },

    { title: 'Extension springs (Shigley 10-11, mode 4)', steps: [
      { id: 'xgeo', title: 'Free length, deflection and body stress', eq: '10-38, 10-39, 10-9', fig: ['fig10-7', 'table10-7'], when: EXT,
        formula: 'L_0 = (2C - 1 + N_b)\\,d \\qquad y_{max} = \\frac{F_{max} - F_i}{k} \\qquad \\tau_{max} = K_B\\frac{8F_{max}D}{\\pi d^3} \\qquad n = \\frac{S_{sy}}{\\tau_{max}}',
        text: 'The body is analysed like a compression spring; free length is measured inside the hooks.',
        vars: [
          { id: 'xL0', symbol: 'L_0', label: 'Free length inside hooks', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'C', 'Nbg', 'd') ? (2 * v.C - 1 + v.Nbg) * v.d : undefined,
            work: v => H.has(v, 'xL0') ? '\\(L_0 = [2(' + TX(v.C, 4) + ') - 1 + ' + TX(v.Nbg) + '](' + TX(v.d) + ') = ' + TX(v.xL0, 4) + '\\)' : null },
          { id: 'xy', symbol: 'y_{max}', label: 'Extension under \\(F_{max}\\)', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => (H.has(v, 'Fmax', 'Fi', 'k') && v.k > 0) ? (v.Fmax - v.Fi) / v.k : undefined },
          { id: 'xLmax', symbol: 'L_{max}', label: 'Loaded length \\(L_0 + y_{max}\\)', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'xL0', 'xy') ? v.xL0 + v.xy : undefined },
          { id: 'xtau', symbol: '\\tau_{max}', label: 'Body shear stress at \\(F_{max}\\)', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'KB', 'Fmax', 'D', 'd') ? v.KB * 8 * v.Fmax * v.D / (PI * Math.pow(v.d, 3)) : undefined,
            work: v => H.has(v, 'xtau') ? '\\(\\tau_{max} = ' + TX(v.KB, 4) + '\\dfrac{8(' + TX(v.Fmax) + ')(' + TX(v.D, 4) + ')}{\\pi(' + TX(v.d) + ')^3} = ' + TX(v.xtau, 5) + '\\)' : null },
          { id: 'xn', symbol: 'n', label: 'Body factor of safety', kind: 'calc', digits: 3, compute: v => (H.has(v, 'Ssy', 'xtau') && v.xtau > 0) ? v.Ssy / v.xtau : undefined },
        ] },
      { id: 'xinit', title: 'Initial tension check', eq: '10-41', fig: ['fig10-7'], when: EXT,
        formula: '(\\tau_i)_{uncorr} = \\frac{8F_iD}{\\pi d^3} \\qquad (\\tau_i)_{pref} = \\frac{33\\,500}{e^{0.105C}} \\pm 1000\\left(4 - \\frac{C-3}{6.5}\\right)\\ \\text{psi}',
        vars: [
          { id: 'xtaui', symbol: '(\\tau_i)_{uncorr}', label: 'Uncorrected initial-tension stress', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'Fi', 'D', 'd') ? 8 * v.Fi * v.D / (PI * Math.pow(v.d, 3)) : undefined },
          { id: 'xtlo', symbol: '(\\tau_i)_{min}', label: 'Preferred range, lower', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'C') ? (33500 / Math.exp(0.105 * v.C) - 1000 * (4 - (v.C - 3) / 6.5)) * (SI(v) ? 0.006895 : 1) : undefined },
          { id: 'xthi', symbol: '(\\tau_i)_{max}', label: 'Preferred range, upper', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'C') ? (33500 / Math.exp(0.105 * v.C) + 1000 * (4 - (v.C - 3) / 6.5)) * (SI(v) ? 0.006895 : 1) : undefined },
        ],
        after: v => H.has(v, 'xtaui', 'xtlo', 'xthi') ? ((v.xtaui >= v.xtlo && v.xtaui <= v.xthi) ? '<span class="result-ok">Initial tension inside the preferred range.</span>' : '<span class="result-bad">Initial tension outside the preferred range (special order).</span>') : '' },
      { id: 'xhookA', title: 'Hook bending at A', eq: '10-34, 10-35', fig: ['fig10-6', 'table10-7'], when: EXT,
        formula: '(K)_A = \\frac{4C_1^2 - C_1 - 1}{4C_1(C_1 - 1)},\\; C_1 = \\frac{2r_1}{d} \\qquad \\sigma_A = F\\left[(K)_A\\frac{16D}{\\pi d^3} + \\frac{4}{\\pi d^2}\\right] \\qquad n_A = \\frac{0.75S_{ut}}{\\sigma_A}',
        vars: [
          { id: 'C1', symbol: 'C_1', label: 'Hook bending index \\(2r_1/d\\)', kind: 'calc', digits: 4, compute: v => H.has(v, 'r1', 'd') ? 2 * v.r1 / v.d : undefined, check: v => (v.C1 !== undefined && v.C1 < 4) ? '\\(C_1 < 4\\) — very high hook stress' : null },
          { id: 'KA', symbol: '(K)_A', label: 'Bending stress-correction factor', kind: 'calc', digits: 4, compute: v => (H.has(v, 'C1') && v.C1 > 1) ? (4 * v.C1 * v.C1 - v.C1 - 1) / (4 * v.C1 * (v.C1 - 1)) : undefined },
          { id: 'sigA', symbol: '\\sigma_A', label: 'Hook tensile stress at A', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'Fmax', 'KA', 'D', 'd') ? v.Fmax * (v.KA * 16 * v.D / (PI * Math.pow(v.d, 3)) + 4 / (PI * v.d * v.d)) : undefined,
            work: v => H.has(v, 'sigA') ? '\\(\\sigma_A = ' + TX(v.Fmax) + '\\left[' + TX(v.KA, 4) + '\\dfrac{16(' + TX(v.D, 4) + ')}{\\pi(' + TX(v.d) + ')^3} + \\dfrac{4}{\\pi(' + TX(v.d) + ')^2}\\right] = ' + TX(v.sigA, 5) + '\\)' : null },
          { id: 'fracA', symbol: 'S_y/S_{ut}', label: 'Table 10-7 end-bending fraction', kind: 'lookup', fig: 'table10-7', auto: v => SPR_MAT[v.mat] ? EXT_FRAC[SPR_MAT[v.mat].cls][2] : undefined },
          { id: 'nA', symbol: 'n_A', label: 'Factor of safety at A', kind: 'calc', digits: 3, compute: v => (H.has(v, 'fracA', 'Sut', 'sigA') && v.sigA > 0) ? v.fracA * v.Sut / v.sigA : undefined },
        ] },
      { id: 'xhookB', title: 'Hook torsion at B', eq: '10-36, 10-37', fig: ['fig10-6', 'table10-7'], when: EXT,
        formula: '(K)_B = \\frac{4C_2 - 1}{4C_2 - 4},\\; C_2 = \\frac{2r_2}{d} \\qquad \\tau_B = (K)_B\\frac{8FD}{\\pi d^3} \\qquad n_B = \\frac{0.40S_{ut}}{\\tau_B}',
        vars: [
          { id: 'C2', symbol: 'C_2', label: 'Hook torsion index \\(2r_2/d\\)', kind: 'calc', digits: 4, compute: v => H.has(v, 'r2', 'd') ? 2 * v.r2 / v.d : undefined, check: v => (v.C2 !== undefined && v.C2 < 4) ? '\\(C_2 < 4\\) — very high hook stress' : null },
          { id: 'KB2', symbol: '(K)_B', label: 'Torsion stress-correction factor', kind: 'calc', digits: 4, compute: v => (H.has(v, 'C2') && v.C2 > 1) ? (4 * v.C2 - 1) / (4 * v.C2 - 4) : undefined },
          { id: 'tauB', symbol: '\\tau_B', label: 'Hook torsional stress at B', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'Fmax', 'KB2', 'D', 'd') ? v.KB2 * 8 * v.Fmax * v.D / (PI * Math.pow(v.d, 3)) : undefined },
          { id: 'fracB', symbol: 'S_{sy}/S_{ut}', label: 'Table 10-7 end-torsion fraction', kind: 'lookup', fig: 'table10-7', auto: v => SPR_MAT[v.mat] ? EXT_FRAC[SPR_MAT[v.mat].cls][1] : undefined },
          { id: 'nB', symbol: 'n_B', label: 'Factor of safety at B', kind: 'calc', digits: 3, compute: v => (H.has(v, 'fracB', 'Sut', 'tauB') && v.tauB > 0) ? v.fracB * v.Sut / v.tauB : undefined },
        ] },
    ] },

    { title: 'Result', steps: [
      { id: 'result', title: 'Overall verdict', vars: [],
        after: v => {
          const ck = b => b ? '<span class="result-ok">✓</span>' : '<span class="result-bad">✗</span>';
          if (EXT(v)) {
            if (v.xn === undefined) return '<span>Enter the extension-spring data (mode 4).</span>';
            const rows = [['body n', v.xn, v.xn >= 1], ['hook \\(n_A\\)', v.nA, v.nA !== undefined && v.nA >= 1], ['hook \\(n_B\\)', v.nB, v.nB !== undefined && v.nB >= 1], ['\\(\\tau_i\\) in range', v.xtaui, H.has(v, 'xtaui', 'xtlo', 'xthi') && v.xtaui >= v.xtlo && v.xtaui <= v.xthi]];
            if (v.nfat !== undefined) rows.push(['fatigue \\(n_f\\)', v.nfat, v.nfat >= 1]);
            const ok = rows.every(r => r[2]);
            return rows.map(r => r[0] + ' = <b>' + H.fmt(r[1], 3) + '</b> ' + ck(r[2])).join(' · ') + '<br>' + (ok ? '<span class="result-ok"><b>PASS</b> — d = ' + H.fmt(v.d) + ', D = ' + H.fmt(v.D, 4) + ', \\(N_b\\) = ' + H.fmt(v.Nbg) + ', k = ' + H.fmt(v.k, 4) + ', \\(L_0\\) = ' + H.fmt(v.xL0, 4) + '.</span>' : '<span class="result-bad"><b>FAIL</b> — larger d, larger hook radii or stronger wire.</span>');
          }
          if (v.C === undefined) return '<span>Enter the loads, material and a trial d / C.</span>';
          const stable = v.L0 !== undefined && v.L0cr !== undefined && v.L0 < v.L0cr / (v.nbk > 0 ? v.nbk : 1);
          const cond = v.C >= 4 && v.C <= 12 && v.Na >= 3 && v.Na <= 15 && (v.xie === undefined || v.xie >= 0.15 - 1e-9) && v.ns >= (v.nsd || 1.2) - 1e-6 && stable && (!H.has(v, 'Lmax') || v.L0 <= v.Lmax) && (!H.has(v, 'Lsmax') || v.Ls <= v.Lsmax);
          const fat = v.nfat === undefined || v.nfat >= 1; const frq = !H.has(v, 'fn', 'fop') || v.fop <= 0 || v.fn / v.fop >= 15;
          return ((cond && fat && frq) ? '<span class="result-ok"><b>PASS</b> — ' : '<span class="result-bad"><b>FAIL</b> — ') + 'd = ' + H.fmt(v.d) + ', D = ' + H.fmt(v.D, 4) + ' (C = ' + H.fmt(v.C, 3) + '), \\(N_a\\) = ' + H.fmt(v.Na, 3) + ', \\(N_t\\) = ' + H.fmt(v.Nt, 3) + ', \\(L_0\\) = ' + H.fmt(v.L0, 4) + ', k = ' + H.fmt(v.k, 4) + ', \\(n_s\\) = ' + H.fmt(v.ns, 3) + (v.nfat !== undefined ? ', \\(n_f\\) = ' + H.fmt(v.nfat, 3) : '') + '. ' + (cond ? 'All design conditions met' : 'A design condition fails (see the assessment)') + (fat ? '' : '; fatigue \\(n_f\\) < 1') + (frq ? '' : '; surge ratio < 15') + '.</span>'; } },
    ] },
  ],
};
