// Helical springs — Mott Ch. 18 (Fizz §5.3; Example Problems 18-1 … 18-4) with the design-stress charts Figs. 18-8 … 18-13
// Course alignment (v2/COURSE_CONVENTIONS.md §14): the course has only the Module 5 reading guide — required Mott 18-1 … 18-4 (compression
// springs) and the 18-6 design example; beneficial 18-5 stability, 18-7/18-8 extension & torsion springs (Shigley 10-11 extension springs is
// required, so Mott 18-7 / Example 18-4 is implemented here as mode 3; torsion springs are not). No course worked numbers exist, so textbook
// defaults apply (service-class curves, K ≈ 1.2 trial, Ls = Dw·N for ground ends, C = 5–12, Lf/Dm < 5.2 no buckling).
// Verified against: Mott Example 18-4 (extension, A227, Fo 26.75 lb @ 4.25 in, Fi 16.25 @ 3.50, OD 0.625, Dm trial 0.5, τd 110 → 120 ksi,
//   Dw 0.072) → k 14.0, Dwt 0.072, Dm 0.553, C 7.68, K 1.19, τo 120 ksi, Na 16.3, body 1.25 in, Lf 2.21 (→ 2.50 chosen), fo 1.75,
//   FI 2.25 lb, τI 10 100 psi — reproduced.
// Verified against: Mott Example 18-2, Method 1 spreadsheet Fig. 18-16 (the `example`: A231, Fo 12 lb @ 1.25 in, Fi 8 lb @ 1.75 in, Dm 0.60,
//   τdi 130 ksi, Dw 0.0625, τd 145 ksi, τmax 170 ksi) → k 8.00, Lf 2.75, Dwt 0.055, OD 0.663, ID 0.538, Na 12.36, C 9.60, K 1.15,
//   τo 86 459 psi, Ls 0.898, Fs 14.82 lb, τs 106 768 psi, Lf/Dm 4.58, cc 0.029, Dhole ≥ 0.669 — reproduced.
// Guide assumptions: the Fizz spring pages (pp.128–146) follow Shigley; those that carry over to Mott's method are listed in `assumptions`
//   together with Mott's own defaults (the Mech guide's spring unit, p.131, is empty).
// Mott Table 18-4: G and E (psi, GPa)
const MOTT_G = {
  A227: ['Hard-drawn steel A227 (Fig. 18-8)', 11.5e6, 79.3, 28.6e6, 197], A228: ['Music wire A228 (Fig. 18-9)', 11.85e6, 81.7, 29.0e6, 200],
  A229: ['Oil-tempered A229 (Fig. 18-10)', 11.2e6, 77.2, 28.5e6, 196], A231: ['Chromium-vanadium A231 (Fig. 18-11)', 11.2e6, 77.2, 28.5e6, 196],
  A401: ['Chromium-silicon A401 (Fig. 18-12)', 11.2e6, 77.2, 29.5e6, 203], A313: ['Stainless 302/304/316 A313 (Fig. 18-13)', 10.0e6, 69.0, 28.0e6, 193],
  A313_177: ['Stainless 17-7 PH A313 (Fig. 18-13)', 10.5e6, 72.4, 29.5e6, 203], B134: ['Spring brass B134', 5.0e6, 34.5, 15.0e6, 103],
  B159: ['Phosphor bronze B159', 6.0e6, 41.4, 15.0e6, 103], B197: ['Beryllium copper B197', 7.0e6, 48.3, 17.0e6, 117],
};
const MFIG = { A227: 'fig18-8', A228: 'fig18-9', A229: 'fig18-10', A231: 'fig18-11', A401: 'fig18-12', A313: 'fig18-13', A313_177: 'fig18-13' };
const SIu = v => v.units === 'SI';
const NE = { plain: 0, pg: 1, sq: 2, sg: 2 };
const PI2 = Math.PI;

window.TOPIC = {
  id: 'springs', book: 'mott',
  title: 'Helical Compression Springs — Analysis & Design',
  subtitle: 'Mott Ch. 18-3 … 18-6 (Example Problems 18-1, 18-2) · Fizz guide §5.3',
  sibling: 'springs_shigley.html',
  intro: 'Mott\'s procedure: the allowable stress is read from the <b>design-stress charts</b> (Figs. 18-8 … 18-13) for the material, wire size and service class (light / average / severe) instead of being computed from Sut. '
    + '<b>Design mode</b> (Example 18-2, Method 1): two force–length points → rate k and free length; a trial mean diameter and design stress give a trial wire size (Eq. 18-7); pick a standard wire (Table 18-2), then check stress at the operating load against the average-service curve and at solid length against the light-service curve, find the coils (Eq. 18-8), lengths, buckling (Fig. 18-15), coil clearance and hole size. '
    + '<b>Analysis mode</b> (Example 18-1): a measured spring (Lf, OD, Dw, N) is checked the same way. <b>Extension mode</b> (Mott 18-7, Example 18-4): same body stress and coil equations, then body length D<sub>w</sub>(N<sub>a</sub> + 1) + end loops, initial force F<sub>I</sub> = F<sub>o</sub> − k f<sub>o</sub>, initial-tension stress vs Figure 18-21 and the end-loop stresses σ<sub>A</sub>, τ<sub>B</sub> (Eqs. 18-13 … 18-16). Units: US (lb, in, psi) or SI (N, mm, MPa). <b>Course note:</b> MECH 325 provides only the Module 5 reading guide for springs (Mott 18-1 … 18-4 and the 18-6 design example required; 18-5, 18-7, 18-8 beneficial) and no worked numbers, so the textbook defaults apply unchanged.',
  example: { units: 'US', mode: 'design', Fo: 12, Lo: 1.25, Fi: 8, Li: 1.75, mat: 'A231', service: 'avg', Dmt: 0.6, tdi: 130000, Dw: 0.0625, td: 145000, tmax: 170000, ends: 'sg', Dhole: 0.75 },

  assumptions: [
    { text: 'Squared-and-ground ends (ends that sit on flat plates must be squared and ground): N_a = N − 2, L_s = D_w N', src: 'Fizz p.131 · Fizz p.146', var: 'ends' },
    { text: 'Design stress from the "average service" curve of Figs. 18-8 … 18-13; the light-service curve is the maximum allowable stress for the solid-height check — Mott 18-4', src: 'Mott §18-4', var: 'service' },
    { text: 'Trial wire diameter with Wahl factor K ≈ 1.2 (Eq. 18-7, Method 1); Method 2 also assumes C ≈ 7 — Mott 18-6', src: 'Mott §18-6' },
    { text: 'Spring index best between 4 and 12 (Fizz); Mott asks for C ≥ 5 (forming cracks below 5), typically 5–12', src: 'Fizz p.129 · Mott §18-4', var: 'C' },
    { text: 'Stress with the Wahl factor K (Mott Eq. 18-5); the Shigley-based Fizz guide uses the Bergsträsser K_B, about 1 % lower', src: 'Fizz p.129', var: 'K' },
    { text: 'Fixed ends on flat plates (Fig. 18-15 curve A): no buckling when L_f/D_m < 5.2 — the same limit as Fizz\'s steel rule L_0 < 2.63 D/α with α = 0.5', src: 'Fizz p.131 · Mott Fig. 18-15', var: 'curve' },
    { text: 'Coil clearance at the operating length > D_w/10; hole diameter > OD + D_w/10; pitch angle below about 12° — Mott 18-3 / 18-6', src: 'Mott §18-3' },
    { text: 'The Fizz (Shigley) design conditions 3 ≤ N_a ≤ 15 and n_s ≥ 1.2 at solid height do not apply here: Mott checks τ_o ≤ τ_d and τ_s ≤ τ_max from the charts', src: 'Fizz p.136' },
    { text: 'Extension springs: full loop at each end adds one ID per end; loop radius R_1 = D_m/2 and bend radius R_2 = 2.5 D_w (C_2 = 5) unless the drawing gives them; loop torsion limited to 0.9 τ_d, loop bending to ≈ τ_d/0.6 (torsion-spring charts; Shigley Table 10-7 ratio 0.45/0.75) — Mott 18-7', src: 'Mott Ex. 18-4', var: 'R2' },
  ],

  figures: [
    { id: 'fig18-5', ref: 'Figure 18-5', title: 'Notation for diameters: OD, Dm, ID, Dw', src: 'figures/mott/fig18-5.png', page: 677 },
    { id: 'fig18-6', ref: 'Figure 18-6', title: 'Notation for lengths and forces: Lf, Li, Lo, Ls; Fi, Fo, Fs; coil clearance', src: 'figures/mott/fig18-6.png', page: 678 },
    { id: 'fig18-3', ref: 'Figure 18-3', title: 'End treatments: plain, squared & ground, squared, plain ground', src: 'figures/mott/fig18-3.png', page: 675, note: 'Active coils: plain Na = N; plain & ground Na = N − 1; squared or squared & ground Na = N − 2.' },
    { id: 'fig18-7', ref: 'Figure 18-7', title: 'Pitch angle λ = tan⁻¹[p/(π Dm)] — keep below ≈ 12°', src: 'figures/mott/fig18-7.png', page: 679 },
    { id: 'table18-2a', ref: 'Table 18-2 (a)', title: 'Wire gages and diameters — gages 7/0 to 19 (U.S. Steel Wire, Music wire, B&S, metric)', src: 'figures/mott/table18-2a.png', page: 677 },
    { id: 'table18-2b', ref: 'Table 18-2 (b)', title: 'Wire gages and diameters — gages 20 to 40', src: 'figures/mott/table18-2b.png', page: 678 },
    { id: 'table18-4', ref: 'Table 18-4', title: 'Shear modulus G and tension modulus E of spring wires', src: 'figures/mott/table18-4.png', page: 685 },
    { id: 'fig18-8', ref: 'Figure 18-8', title: 'Design shear stresses — ASTM A227 hard-drawn', src: 'figures/mott/fig18-8.png', page: 681, note: 'Light service = max allowable (solid-height check); average service = design stress for normal use; severe = > 10⁶ cycles / shock.' },
    { id: 'fig18-9', ref: 'Figure 18-9', title: 'Design shear stresses — ASTM A228 music wire', src: 'figures/mott/fig18-9.png', page: 682 },
    { id: 'fig18-10', ref: 'Figure 18-10', title: 'Design shear stresses — ASTM A229 oil-tempered', src: 'figures/mott/fig18-10.png', page: 682 },
    { id: 'fig18-11', ref: 'Figure 18-11', title: 'Design shear stresses — ASTM A231 chromium-vanadium', src: 'figures/mott/fig18-11.png', page: 682 },
    { id: 'fig18-12', ref: 'Figure 18-12', title: 'Design shear stresses — ASTM A401 chromium-silicon', src: 'figures/mott/fig18-12.png', page: 683 },
    { id: 'fig18-13', ref: 'Figure 18-13', title: 'Design shear stresses — ASTM A313 stainless (302; ×0.95 for 304, ×0.85 for 316)', src: 'figures/mott/fig18-13.png', page: 683 },
    { id: 'fig18-14', ref: 'Figure 18-14', title: 'Wahl factor K vs spring index C', src: 'figures/mott/fig18-14.png', page: 684 },
    { id: 'fig18-19', ref: 'Figure 18-19 / 18-20', title: 'Extension spring nomenclature (body Dw(Na + 1), hook and loop lengths) and load–deflection curve with initial force FI', src: 'figures/mott/fig18-19-20.png', page: 696 },
    { id: 'fig18-21', ref: 'Figure 18-21', title: 'Recommended torsional stress due to initial tension vs spring index C (preferred range)', src: 'figures/mott/fig18-21.png', page: 696, note: 'The auto estimate is Shigley Eq. 10-41 (same Associated Spring data): 33 500/exp(0.105C) ± 1000(4 − (C − 3)/6.5) psi.' },
    { id: 'fig18-22', ref: 'Figure 18-22', title: 'Stresses in the ends of an extension spring: bending at A (R1), torsion at B (R2)', src: 'figures/mott/fig18-22.png', page: 696 },
    { id: 'fig18-15', ref: 'Figure 18-15', title: 'Buckling criteria: critical fo/Lf vs Lf/Dm for end conditions A, B, C', src: 'figures/mott/fig18-15.png', page: 685, note: 'Curve A: fixed (squared & ground on flat plates); B: one fixed, one pinned; C: both pinned. For Lf/Dm < 5.2 (curve A) buckling will not occur.' },
  ],

  sections: [
    { title: 'Inputs', steps: [
      { id: 'in', title: 'Mode, forces and lengths', fig: ['fig18-6'], eq: '18-1',
        formula: 'k = \\frac{F_o - F_i}{L_i - L_o} \\qquad L_f = L_i + \\frac{F_i}{k}',
        text: '<b>Design:</b> operating force Fo at length Lo, and a second point (installed force Fi at Li). If only the free length is known, set Fi = 0 and Li = Lf. <b>Analysis:</b> enter the measured spring below and the operating force Fo.',
        vars: [
          { id: 'units', label: 'Unit system', kind: 'choice', type: 'text', options: [{ label: 'US: lb, in, psi', value: 'US' }, { label: 'SI: N, mm, MPa', value: 'SI' }], default: 'US' },
          { id: 'mode', label: 'Mode', kind: 'choice', type: 'text', options: [{ label: 'Design a compression spring (Example 18-2)', value: 'design' }, { label: 'Analyse a given compression spring (Example 18-1)', value: 'analyse' }, { label: 'Design an extension spring (18-7, Example 18-4)', value: 'ext' }], default: 'design' },
          { id: 'Fo', symbol: 'F_o', label: 'Operating force (max normal load)', unit: 'lb / N', kind: 'input' },
          { id: 'Lo', symbol: 'L_o', label: 'Operating length', unit: 'in / mm', kind: 'input', hint: 'design / extension modes (extension: the longer, pulled length)' },
          { id: 'Fi', symbol: 'F_i', label: 'Installed force (0 if free length known)', unit: 'lb / N', kind: 'input', default: 0 },
          { id: 'Li', symbol: 'L_i', label: 'Installed length (= Lf if Fi = 0)', unit: 'in / mm', kind: 'input', hint: 'design / extension modes' },
        ] },
      { id: 'ina', title: 'Given spring (analysis mode) or required OD (extension mode)', fig: ['fig18-5'], when: v => v.mode !== 'design',
        vars: [
          { id: 'Lfg', symbol: 'L_f', label: 'Free length (analysis mode)', unit: 'in / mm', kind: 'input' },
          { id: 'ODg', symbol: 'OD', label: 'Outside diameter (analysis mode; extension: required OD)', unit: 'in / mm', kind: 'input', hint: 'extension: Dm = OD − Dw replaces the trial Dm once Dw is chosen' },
          { id: 'Ng', symbol: 'N', label: 'Total coils (analysis mode)', kind: 'input' },
        ] },
      { id: 'mat', title: 'Material, service and end type', fig: ['table18-4', 'fig18-3'],
        vars: [
          { id: 'mat', label: 'Wire material', kind: 'choice', type: 'text', options: Object.keys(MOTT_G).map(k => ({ label: MOTT_G[k][0], value: k })), default: 'A231' },
          { id: 'G', symbol: 'G', label: 'Shear modulus', unit: 'psi / MPa', kind: 'lookup', fig: 'table18-4', auto: v => MOTT_G[v.mat] ? (SIu(v) ? MOTT_G[v.mat][2] * 1000 : MOTT_G[v.mat][1]) : undefined, hint: 'Table 18-4 (e.g. A231: 11.2e6 psi / 77.2 GPa)' },
          { id: 'service', label: 'Service class (design-stress curve)', kind: 'choice', type: 'text', options: [{ label: 'Light — static / < 10⁴ cycles', value: 'light' }, { label: 'Average — typical, up to 10⁶ cycles', value: 'avg' }, { label: 'Severe — > 10⁶ cycles or shock', value: 'severe' }], default: 'avg' },
          { id: 'ends', label: 'End type', kind: 'choice', type: 'text', options: [{ label: 'Squared and ground (Na = N − 2)', value: 'sg' }, { label: 'Squared / closed (Na = N − 2)', value: 'sq' }, { label: 'Plain and ground (Na = N − 1)', value: 'pg' }, { label: 'Plain (Na = N)', value: 'plain' }], default: 'sg' },
        ] },
    ] },

    { title: 'Rate, free length and trial wire size (design)', steps: [
      { id: 'rate', title: 'Spring rate and free length', eq: '18-1a', fig: ['fig18-6'],
        vars: [
          { id: 'k', symbol: 'k', label: 'Spring rate', unit: 'lb/in / N/mm', kind: 'calc', digits: 4, compute: v => {
              if (v.mode === 'analyse') return (H.has(v, 'Fo', 'fo') && v.fo > 0) ? v.Fo / v.fo : undefined;
              if (v.mode === 'ext') return (H.has(v, 'Fo', 'Fi', 'Li', 'Lo') && v.Lo !== v.Li) ? (v.Fo - v.Fi) / (v.Lo - v.Li) : undefined;
              return (H.has(v, 'Fo', 'Fi', 'Li', 'Lo') && v.Li !== v.Lo) ? (v.Fo - v.Fi) / (v.Li - v.Lo) : undefined; },
            work: v => (v.mode !== 'analyse' && H.has(v, 'Fo', 'Fi', 'Li', 'Lo')) ? (v.mode === 'ext' ? '\\(k = \\dfrac{' + H.fmt(v.Fo) + ' - ' + H.fmt(v.Fi) + '}{' + H.fmt(v.Lo) + ' - ' + H.fmt(v.Li) + '} = ' + H.fmt(v.k, 4) + '\\)' : '\\(k = \\dfrac{' + H.fmt(v.Fo) + ' - ' + H.fmt(v.Fi) + '}{' + H.fmt(v.Li) + ' - ' + H.fmt(v.Lo) + '} = ' + H.fmt(v.k, 4) + '\\)') : (v.mode === 'analyse' && H.has(v, 'Fo', 'fo') ? '\\(k = F_o/f_o = ' + H.fmt(v.Fo) + '/' + H.fmt(v.fo, 4) + ' = ' + H.fmt(v.k, 4) + '\\)' : null) },
          { id: 'Lf', symbol: 'L_f', label: 'Free length', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => v.mode === 'analyse' ? v.Lfg : (v.mode === 'ext' ? (H.has(v, 'Lfx') ? v.Lfx : v.Lfcalc) : (H.has(v, 'Li', 'Fi', 'k') && v.k > 0 ? v.Li + v.Fi / v.k : undefined)), hint: 'extension: from the body-length step below'
            , work: v => (v.mode === 'design' && H.has(v, 'Li', 'Fi', 'k')) ? '\\(L_f = ' + H.fmt(v.Li) + ' + ' + H.fmt(v.Fi) + '/' + H.fmt(v.k, 4) + ' = ' + H.fmt(v.Lf, 4) + '\\)' : null },
        ] },
      { id: 'trial', title: 'Trial mean diameter, design stress and trial wire diameter', eq: '18-7', fig: ['fig18-5', 'fig18-8', 'fig18-9', 'fig18-10', 'fig18-11', 'fig18-12', 'fig18-13'],
        formula: 'D_w = \\left[\\frac{8 K F_o D_m}{\\pi\\tau_d}\\right]^{1/3} \\approx \\left[\\frac{3.06\\,F_o D_m}{\\tau_d}\\right]^{1/3}\\ (K \\approx 1.2)',
        text: 'Choose Dm to fit the space (smaller than any hole, larger than any rod). Estimate the design stress from the material chart (the curve for your service class) at a guessed wire size; it is corrected after a standard wire is picked. Method 2 (Example 18-3) instead assumes C = 7: \\(D_w = \\sqrt{8(1.2)(7)F_o/(\\pi\\tau_d)}\\).',
        vars: [
          { id: 'Dmt', symbol: 'D_m', label: 'Trial mean diameter', unit: 'in / mm', kind: 'input' },
          { id: 'tdi', symbol: '\\tau_{d,i}', label: 'Initial design-stress estimate', unit: 'psi / MPa', kind: 'lookup', fig: 'fig18-11', hint: 'read the service curve for the material' },
          { id: 'Dwt', symbol: 'D_{w,t}', label: 'Trial wire diameter (Eq. 18-7)', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'Fo', 'Dmt', 'tdi') && v.tdi > 0 ? Math.pow(8 * 1.2 * v.Fo * v.Dmt / (Math.PI * v.tdi), 1 / 3) : undefined,
            work: v => H.has(v, 'Dwt') ? '\\(D_w = \\left[\\dfrac{3.06(' + H.fmt(v.Fo) + ')(' + H.fmt(v.Dmt) + ')}{' + H.fmt(v.tdi) + '}\\right]^{1/3} = ' + H.fmt(v.Dwt, 4) + '\\)' : null },
          { id: 'Dwt2', symbol: 'D_{w,t}^{(C=7)}', label: 'Trial wire diameter, Method 2 (Eq. 18-9 with C = 7, K = 1.2)', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'Fo', 'tdi') && v.tdi > 0 ? Math.sqrt(8 * 1.2 * 7 * v.Fo / (Math.PI * v.tdi)) : undefined },
        ],
        when: v => v.mode !== 'analyse' },
    ] },

    { title: 'Standard wire and allowable stresses', steps: [
      { id: 'wire', title: 'Standard wire diameter and chart stresses', fig: ['table18-2a', 'table18-2b', 'fig18-8', 'fig18-9', 'fig18-10', 'fig18-11', 'fig18-12', 'fig18-13'],
        text: 'Pick the next larger standard size from Table 18-2 (design) or enter the measured wire (analysis). Then re-read the chart at that diameter: <b>design stress</b> from the service curve, and <b>maximum allowable stress</b> from the <i>light-service</i> curve (used for the solid-height check).',
        vars: [
          { id: 'Dw', symbol: 'D_w', label: 'Wire diameter (standard)', unit: 'in / mm', kind: 'lookup', fig: 'table18-2a', hint: 'Table 18-2: next standard size ≥ trial (Ex. 18-4: 0.072 in = 15 ga U.S. Steel Wire)', check: v => (v.mode !== 'analyse' && H.has(v, 'Dw', 'Dwt') && v.Dw < v.Dwt) ? 'Smaller than the trial size — stress will exceed the design stress' : null },
          { id: 'td', symbol: '\\tau_d', label: 'Design stress at Dw (service curve)', unit: 'psi / MPa', kind: 'lookup', fig: 'fig18-11', hint: 'e.g. A231, 0.0625 in: ≈ 145 ksi average' },
          { id: 'tmax', symbol: '\\tau_{max}', label: 'Max allowable stress at Dw (light-service curve)', unit: 'psi / MPa', kind: 'lookup', fig: 'fig18-11', hint: 'e.g. A231, 0.0625 in: ≈ 170 ksi' },
        ] },
    ] },

    { title: 'Geometry, index, stress', steps: [
      { id: 'geo', title: 'Diameters, spring index, Wahl factor', eq: '18-5', fig: ['fig18-5', 'fig18-14'],
        formula: 'C = \\frac{D_m}{D_w} \\qquad K = \\frac{4C-1}{4C-4} + \\frac{0.615}{C}',
        vars: [
          { id: 'Dm', symbol: 'D_m', label: 'Mean diameter', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => (v.mode === 'analyse' || (v.mode === 'ext' && H.has(v, 'ODg'))) ? (H.has(v, 'ODg', 'Dw') ? v.ODg - v.Dw : undefined) : v.Dmt },
          { id: 'OD', symbol: 'OD', label: 'Outside diameter', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'Dm', 'Dw') ? v.Dm + v.Dw : undefined },
          { id: 'ID', symbol: 'ID', label: 'Inside diameter', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'Dm', 'Dw') ? v.Dm - v.Dw : undefined },
          { id: 'C', symbol: 'C', label: 'Spring index', kind: 'calc', digits: 4, compute: v => H.has(v, 'Dm', 'Dw') && v.Dw > 0 ? v.Dm / v.Dw : undefined, check: v => (v.C !== undefined && v.C < 5) ? 'Mott: C should be ≥ 5 (forming cracks below 5); typical 5–12' : (v.C > 12 ? 'C > 12 — springs tangle; consider a smaller Dm' : null) },
          { id: 'K', symbol: 'K', label: 'Wahl factor', kind: 'calc', digits: 4, compute: v => H.has(v, 'C') && v.C > 1 ? (4 * v.C - 1) / (4 * v.C - 4) + 0.615 / v.C : undefined,
            work: v => H.has(v, 'K') ? '\\(K = \\dfrac{4(' + H.fmt(v.C, 4) + ') - 1}{4(' + H.fmt(v.C, 4) + ') - 4} + \\dfrac{0.615}{' + H.fmt(v.C, 4) + '} = ' + H.fmt(v.K, 4) + '\\)' : null },
        ] },
      { id: 'stress', title: 'Stress at the operating force', eq: '18-4', formula: '\\tau_o = \\frac{8 K F_o D_m}{\\pi D_w^3} = \\frac{8 K F_o C}{\\pi D_w^2}',
        vars: [
          { id: 'tauo', symbol: '\\tau_o', label: 'Operating shear stress', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'K', 'Fo', 'Dm', 'Dw') ? 8 * v.K * v.Fo * v.Dm / (Math.PI * Math.pow(v.Dw, 3)) : undefined,
            work: v => H.has(v, 'tauo') ? '\\(\\tau_o = \\dfrac{8(' + H.fmt(v.K, 4) + ')(' + H.fmt(v.Fo) + ')(' + H.fmt(v.Dm, 4) + ')}{\\pi(' + H.fmt(v.Dw) + ')^3} = ' + H.fmt(v.tauo, 5) + '\\)' : null },
          { id: 'nso', symbol: '\\tau_d/\\tau_o', label: 'Margin against design stress', kind: 'calc', digits: 3, compute: v => H.has(v, 'td', 'tauo') && v.tauo > 0 ? v.td / v.tauo : undefined },
        ],
        after: v => H.has(v, 'td', 'tauo') ? (v.tauo <= v.td ? '<span class="result-ok">τo = ' + H.fmt(v.tauo, 5) + ' ≤ τd = ' + H.fmt(v.td) + ' — safe at the operating load.</span>' : '<span class="result-bad">τo = ' + H.fmt(v.tauo, 5) + ' &gt; τd = ' + H.fmt(v.td) + ' — increase Dw or reduce Dm.</span>') : '' },
    ] },

    { title: 'Coils, lengths, solid-height check', steps: [
      { id: 'coils', title: 'Number of coils and deflection', eq: '18-6, 18-8', fig: ['fig18-3'],
        formula: 'N_a = \\frac{G D_w}{8 k C^3} \\quad(\\text{design}) \\qquad f_o = \\frac{8 F_o C^3 N_a}{G D_w} \\quad(\\text{analysis})',
        vars: [
          { id: 'Na', symbol: 'N_a', label: 'Active coils', kind: 'calc', digits: 4, compute: v => {
              if (v.mode === 'analyse') return H.has(v, 'Ng') ? v.Ng - NE[v.ends] : undefined;
              return H.has(v, 'G', 'Dw', 'k', 'C') && v.k > 0 ? v.G * v.Dw / (8 * v.k * Math.pow(v.C, 3)) : undefined; },
            work: v => (v.mode !== 'analyse' && H.has(v, 'Na')) ? '\\(N_a = \\dfrac{' + H.fmt(v.G, 4) + '(' + H.fmt(v.Dw) + ')}{8(' + H.fmt(v.k, 4) + ')(' + H.fmt(v.C, 4) + ')^3} = ' + H.fmt(v.Na, 4) + '\\)' : null,
            check: v => (v.Na !== undefined && v.Na < 3) ? 'Fewer than 3 active coils' : null },
          { id: 'N', symbol: 'N', label: 'Total coils', kind: 'calc', digits: 4, compute: v => v.mode === 'analyse' ? v.Ng : (H.has(v, 'Na') ? v.Na + NE[v.ends] : undefined) },
          { id: 'fo', symbol: 'f_o', label: 'Operating deflection from free length (extension: Lo − Lf)', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => {
              if (v.mode === 'analyse') return H.has(v, 'Fo', 'C', 'Na', 'G', 'Dw') ? 8 * v.Fo * Math.pow(v.C, 3) * v.Na / (v.G * v.Dw) : undefined;
              if (v.mode === 'ext') return H.has(v, 'Lf', 'Lo') ? v.Lo - v.Lf : undefined;
              return H.has(v, 'Lf', 'Lo') ? v.Lf - v.Lo : undefined; },
            work: v => (v.mode === 'analyse' && H.has(v, 'fo')) ? '\\(f_o = \\dfrac{8(' + H.fmt(v.Fo) + ')(' + H.fmt(v.C, 4) + ')^3(' + H.fmt(v.Na, 4) + ')}{' + H.fmt(v.G, 4) + '(' + H.fmt(v.Dw) + ')} = ' + H.fmt(v.fo, 4) + '\\)' : null },
          { id: 'Loa', symbol: 'L_o', label: 'Operating length', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => v.mode === 'analyse' ? (H.has(v, 'Lf', 'fo') ? v.Lf - v.fo : undefined) : v.Lo },
        ] },
      { id: 'solid', title: 'Solid length, force and stress at solid height', when: v => v.mode !== 'ext', formula: 'L_s = D_w N \\;(\\text{ground ends}) \\quad\\text{or}\\quad D_w(N+1) \\qquad F_s = k(L_f - L_s) \\qquad \\tau_s = \\tau_o\\frac{F_s}{F_o}',
        text: 'Mott uses Ls = Dw·N for squared & ground ends (Example 18-1 / 18-2). For un-ground ends Shigley Table 10-1 adds one wire diameter: Ls = Dw(N + 1). The stress at solid height must stay below the light-service (maximum allowable) curve or the spring takes a permanent set.',
        vars: [
          { id: 'Ls', symbol: 'L_s', label: 'Solid length', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'Dw', 'N') ? ((v.ends === 'sg' || v.ends === 'pg') ? v.Dw * v.N : v.Dw * (v.N + 1)) : undefined },
          { id: 'Fs', symbol: 'F_s', label: 'Force at solid length', unit: 'lb / N', kind: 'calc', digits: 4, compute: v => H.has(v, 'k', 'Lf', 'Ls') ? v.k * (v.Lf - v.Ls) : undefined,
            work: v => H.has(v, 'Fs') ? '\\(F_s = ' + H.fmt(v.k, 4) + '(' + H.fmt(v.Lf, 4) + ' - ' + H.fmt(v.Ls, 4) + ') = ' + H.fmt(v.Fs, 4) + '\\)' : null },
          { id: 'taus', symbol: '\\tau_s', label: 'Stress at solid length', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'tauo', 'Fs', 'Fo') && v.Fo > 0 ? v.tauo * v.Fs / v.Fo : undefined,
            work: v => H.has(v, 'taus') ? '\\(\\tau_s = ' + H.fmt(v.tauo, 5) + '(' + H.fmt(v.Fs, 4) + '/' + H.fmt(v.Fo) + ') = ' + H.fmt(v.taus, 5) + '\\)' : null },
        ],
        after: v => { let s = '';
          if (H.has(v, 'Ls', 'Loa')) s += v.Ls < v.Loa ? '<span class="result-ok">Ls = ' + H.fmt(v.Ls, 4) + ' &lt; Lo = ' + H.fmt(v.Loa, 4) + '.</span> ' : '<span class="result-bad">Ls = ' + H.fmt(v.Ls, 4) + ' ≥ Lo = ' + H.fmt(v.Loa, 4) + ' — spring goes solid before the operating length! Fewer coils / smaller Dw.</span> ';
          if (H.has(v, 'taus', 'tmax')) s += v.taus <= v.tmax ? '<span class="result-ok">τs = ' + H.fmt(v.taus, 5) + ' ≤ τmax = ' + H.fmt(v.tmax) + ' — no yielding at solid height.</span>' : '<span class="result-bad">τs = ' + H.fmt(v.taus, 5) + ' &gt; τmax = ' + H.fmt(v.tmax) + ' — permanent set when compressed solid.</span>';
          return s; } },
    ] },

    { title: 'Buckling, clearances, installation', steps: [
      { id: 'buck', title: 'Buckling check', fig: ['fig18-15'], when: v => v.mode !== 'ext', formula: '\\frac{L_f}{D_m} \\;\\rightarrow\\; \\left(\\frac{f_o}{L_f}\\right)_{cr} \\text{ from Fig. 18-15}',
        text: 'Read the critical deflection ratio for the end condition (curve A = squared & ground on flat plates). If Lf/Dm < 5.2 (curve A) buckling cannot occur. The yellow value is pre-filled with an estimate from the same theory (Shigley Eq. 10-10 with steel E, G).',
        vars: [
          { id: 'curve', label: 'End condition (Fig. 18-15 curve)', kind: 'choice', options: [{ label: 'A — fixed ends (squared & ground on flat plates)', value: 0.5 }, { label: 'B — one fixed, one pinned', value: 0.707 }, { label: 'C — both pinned', value: 1 }], default: 0.5 },
          { id: 'LfDm', symbol: 'L_f/D_m', label: 'Slenderness ratio', kind: 'calc', digits: 4, compute: v => H.has(v, 'Lf', 'Dm') && v.Dm > 0 ? v.Lf / v.Dm : undefined },
          { id: 'rcr', symbol: '(f_o/L_f)_{cr}', label: 'Critical deflection ratio', kind: 'lookup', fig: 'fig18-15', hint: 'Fig. 18-15 curve A/B/C at Lf/Dm (auto = Shigley Eq. 10-10 estimate)', auto: v => { if (!H.has(v, 'LfDm', 'curve')) return undefined;
              const E = 28.5, G = 11.5; const C1 = E / (2 * (E - G)), C2 = 2 * Math.PI * Math.PI * (E - G) / (2 * G + E); const lam = v.curve * v.LfDm; const t = 1 - C2 / (lam * lam); return t < 0 ? 1 : C1 * (1 - Math.sqrt(t)); } },
          { id: 'ract', symbol: 'f_o/L_f', label: 'Actual deflection ratio at Fo', kind: 'calc', digits: 4, compute: v => H.has(v, 'fo', 'Lf') && v.Lf > 0 ? v.fo / v.Lf : undefined },
        ],
        after: v => H.has(v, 'LfDm') ? ((v.curve === 0.5 && v.LfDm < 5.2) ? '<span class="result-ok">Lf/Dm = ' + H.fmt(v.LfDm, 3) + ' &lt; 5.2 — buckling will not occur.</span>' : (H.has(v, 'rcr', 'ract') ? (v.ract < v.rcr ? '<span class="result-ok">fo/Lf = ' + H.fmt(v.ract, 3) + ' &lt; critical ' + H.fmt(v.rcr, 3) + ' — stable.</span>' : '<span class="result-bad">fo/Lf = ' + H.fmt(v.ract, 3) + ' ≥ critical ' + H.fmt(v.rcr, 3) + ' — the spring will buckle; guide it in a hole or over a rod.</span>') : '')) : '' },
      { id: 'clr', title: 'Coil clearance, pitch, pitch angle, hole size', eq: '18-2', fig: ['fig18-7'], when: v => v.mode !== 'ext',
        formula: 'c_c = \\frac{L_o - L_s}{N_a} > \\frac{D_w}{10} \\qquad p = \\frac{L_f - (\\text{end allowance})}{N_a} \\qquad \\lambda = \\tan^{-1}\\frac{p}{\\pi D_m} < 12^\\circ \\qquad D_{hole} > OD + \\frac{D_w}{10}',
        vars: [
          { id: 'cc', symbol: 'c_c', label: 'Coil clearance at Lo', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'Loa', 'Ls', 'Na') && v.Na > 0 ? (v.Loa - v.Ls) / v.Na : undefined },
          { id: 'ccmin', symbol: 'D_w/10', label: 'Minimum recommended clearance', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'Dw') ? v.Dw / 10 : undefined },
          { id: 'p', symbol: 'p', label: 'Pitch', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'Lf', 'Na', 'Dw') && v.Na > 0 ? ({ sg: (v.Lf - 2 * v.Dw) / v.Na, sq: (v.Lf - 3 * v.Dw) / v.Na, pg: v.Lf / (v.Na + 1), plain: (v.Lf - v.Dw) / v.Na })[v.ends] : undefined },
          { id: 'lam', symbol: '\\lambda', label: 'Pitch angle', unit: '°', kind: 'calc', digits: 3, compute: v => H.has(v, 'p', 'Dm') ? H.deg(Math.atan(v.p / (Math.PI * v.Dm))) : undefined, check: v => v.lam > 12 ? 'Pitch angle > 12° — formulas lose accuracy' : null },
          { id: 'Dhmin', symbol: 'D_{hole,min}', label: 'Minimum hole diameter', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'OD', 'Dw') ? v.OD + v.Dw / 10 : undefined },
          { id: 'Dhole', symbol: 'D_{hole}', label: 'Available hole diameter (if any)', unit: 'in / mm', kind: 'input' },
        ],
        after: v => { let s = '';
          if (H.has(v, 'cc', 'ccmin')) s += v.cc > v.ccmin ? '<span class="result-ok">Coil clearance ' + H.fmt(v.cc, 4) + ' &gt; ' + H.fmt(v.ccmin, 4) + ' OK.</span> ' : '<span class="result-bad">Coil clearance ' + H.fmt(v.cc, 4) + ' ≤ Dw/10 = ' + H.fmt(v.ccmin, 4) + ' — too tight.</span> ';
          if (H.has(v, 'Dhole', 'Dhmin')) s += v.Dhole >= v.Dhmin ? '<span class="result-ok">Hole ' + H.fmt(v.Dhole) + ' ≥ ' + H.fmt(v.Dhmin, 4) + ' OK.</span>' : '<span class="result-bad">Hole ' + H.fmt(v.Dhole) + ' is smaller than the required ' + H.fmt(v.Dhmin, 4) + '.</span>';
          if (H.has(v, 'tauo', 'td', 'taus', 'tmax', 'Ls', 'Loa')) {
            const ok = v.tauo <= v.td && v.taus <= v.tmax && v.Ls < v.Loa && (!H.has(v, 'cc', 'ccmin') || v.cc > v.ccmin) && (!H.has(v, 'Dhole', 'Dhmin') || v.Dhole >= v.Dhmin);
            s += '<div style="margin-top:6px">' + (ok ? '<span class="result-ok"><b>DESIGN OK</b> — ' : '<span class="result-bad"><b>REVISE</b> — ') + MOTT_G[v.mat][0].split(' (')[0] + ', Dw = ' + H.fmt(v.Dw) + ', Dm = ' + H.fmt(v.Dm, 4) + ' (OD ' + H.fmt(v.OD, 4) + ', ID ' + H.fmt(v.ID, 4) + '), Na = ' + H.fmt(v.Na, 4) + ', N = ' + H.fmt(v.N, 4) + ' ' + v.ends + ' ends, Lf = ' + H.fmt(v.Lf, 4) + ', Ls = ' + H.fmt(v.Ls, 4) + ', k = ' + H.fmt(v.k, 4) + '.</span></div>'; }
          return s; } },
    ] },

    { title: 'Extension springs (Mott 18-7, Example 18-4)', steps: [
      { id: 'xlen', title: 'Body length, end loops and free length', fig: ['fig18-19'], when: v => v.mode === 'ext',
        formula: 'L_{body} = D_w(N_a + 1) \\qquad L_f = L_{body} + 2\\,(\\text{end allowance})',
        text: 'All coils of an extension spring are active. Example 18-4 proposes a full loop at each end, adding one ID per end; if the resulting F<sub>I</sub> below comes out negative the free length is too short — enter a longer chosen L<sub>f</sub> (Mott revised 2.21 → 2.50 in) and redesign the ends.',
        vars: [
          { id: 'Lbody', symbol: 'L_{body}', label: 'Body length Dw(Na + 1)', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'Dw', 'Na') ? v.Dw * (v.Na + 1) : undefined,
            work: v => H.has(v, 'Lbody') ? '\\(L_{body} = ' + H.fmt(v.Dw) + '(' + H.fmt(v.Na, 4) + ' + 1) = ' + H.fmt(v.Lbody, 4) + '\\)' : null },
          { id: 'Lend', symbol: 'L_{end}', label: 'Length added per end loop', unit: 'in / mm', kind: 'input', auto: v => H.has(v, 'ID') ? v.ID : undefined, hint: 'auto = ID (full loop, Example 18-4); consult the springmaker for other ends' },
          { id: 'Lfcalc', symbol: 'L_{f,calc}', label: 'Free length with the proposed ends', unit: 'in / mm', kind: 'calc', digits: 4, compute: v => H.has(v, 'Lbody', 'Lend') ? v.Lbody + 2 * v.Lend : undefined,
            work: v => H.has(v, 'Lfcalc') ? '\\(L_f = ' + H.fmt(v.Lbody, 4) + ' + 2(' + H.fmt(v.Lend, 4) + ') = ' + H.fmt(v.Lfcalc, 4) + '\\)' : null },
          { id: 'Lfx', symbol: 'L_{f,chosen}', label: 'Chosen free length (overrides)', unit: 'in / mm', kind: 'input', hint: 'blank = calculated; Example 18-4 chose 2.50 in', check: v => (H.has(v, 'Lfx', 'Lo') && v.Lfx >= v.Lo) ? 'Free length must be shorter than the operating length' : null },
        ] },
      { id: 'xinit', title: 'Initial force and initial-tension stress', fig: ['fig18-19', 'fig18-21'], when: v => v.mode === 'ext',
        formula: 'F_I = F_o - k f_o \\qquad \\tau_I = \\tau_o\\frac{F_I}{F_o} \\quad \\text{vs Fig. 18-21 at } C',
        text: 'F<sub>I</sub> is the force at which the coils just begin to separate (typically 10–25 % of the maximum design force). Compare τ<sub>I</sub> with the preferred band of Figure 18-21 for the spring index.',
        vars: [
          { id: 'FI', symbol: 'F_I', label: 'Initial force', unit: 'lb / N', kind: 'calc', digits: 4, compute: v => H.has(v, 'Fo', 'k', 'fo') ? v.Fo - v.k * v.fo : undefined,
            work: v => H.has(v, 'FI') ? '\\(F_I = ' + H.fmt(v.Fo) + ' - ' + H.fmt(v.k, 4) + '(' + H.fmt(v.fo, 4) + ') = ' + H.fmt(v.FI, 4) + '\\)' : null,
            check: v => (v.FI !== undefined && v.FI < 0) ? 'Negative initial force — the free length is too short for the specified lengths' : null },
          { id: 'tauI', symbol: '\\tau_I', label: 'Torsional stress due to initial tension', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => (H.has(v, 'tauo', 'FI', 'Fo') && v.Fo > 0) ? v.tauo * v.FI / v.Fo : undefined,
            work: v => H.has(v, 'tauI') ? '\\(\\tau_I = ' + H.fmt(v.tauo, 5) + '(' + H.fmt(v.FI, 4) + '/' + H.fmt(v.Fo) + ') = ' + H.fmt(v.tauI, 5) + '\\)' : null },
          { id: 'tIlo', symbol: '\\tau_{I,min}', label: 'Preferred range, lower (Fig. 18-21)', unit: 'psi / MPa', kind: 'lookup', fig: 'fig18-21', auto: v => H.has(v, 'C') ? (33500 / Math.exp(0.105 * v.C) - 1000 * (4 - (v.C - 3) / 6.5)) * (SIu(v) ? 0.006895 : 1) : undefined, hint: 'read the lower curve at C (auto = Shigley Eq. 10-41)' },
          { id: 'tIhi', symbol: '\\tau_{I,max}', label: 'Preferred range, upper (Fig. 18-21)', unit: 'psi / MPa', kind: 'lookup', fig: 'fig18-21', auto: v => H.has(v, 'C') ? (33500 / Math.exp(0.105 * v.C) + 1000 * (4 - (v.C - 3) / 6.5)) * (SIu(v) ? 0.006895 : 1) : undefined, hint: 'read the upper curve at C' },
        ],
        after: v => H.has(v, 'tauI', 'tIlo', 'tIhi') ? ((v.tauI >= v.tIlo && v.tauI <= v.tIhi) ? '<span class="result-ok">τI = ' + H.fmt(v.tauI, 4) + ' is inside the preferred range ' + H.fmt(v.tIlo, 4) + ' – ' + H.fmt(v.tIhi, 4) + '.</span>' : '<span class="result-bad">τI = ' + H.fmt(v.tauI, 4) + ' is outside the preferred range ' + H.fmt(v.tIlo, 4) + ' – ' + H.fmt(v.tIhi, 4) + ' — adjust Lf or the number of coils (Mott: small adjustments / prototype).</span>') : '' },
      { id: 'xhookA', title: 'End loop: bending stress at A', eq: '18-13, 18-14', fig: ['fig18-22'], when: v => v.mode === 'ext',
        formula: '\\sigma_A = \\frac{16 D_m F_o K_1}{\\pi D_w^3} + \\frac{4F_o}{\\pi D_w^2} \\qquad K_1 = \\frac{4C_1^2 - C_1 - 1}{4C_1(C_1 - 1)},\\; C_1 = \\frac{2R_1}{D_w}',
        text: 'R<sub>1</sub> = mean radius of the loop in the plane of the coil (Figure 18-22a). C<sub>1</sub> should be > 4. Compare σ<sub>A</sub> with the allowable <i>bending</i> stress for torsion springs (Mott 18-8 charts; Shigley Table 10-7 uses 0.75 S<sub>ut</sub>).',
        vars: [
          { id: 'R1', symbol: 'R_1', label: 'Loop mean radius (bending)', unit: 'in / mm', kind: 'input', auto: v => H.has(v, 'Dm') ? v.Dm / 2 : undefined, hint: 'auto = Dm/2 (loop of the same diameter as the body)' },
          { id: 'C1', symbol: 'C_1', label: 'Loop index 2R1/Dw', kind: 'calc', digits: 4, compute: v => H.has(v, 'R1', 'Dw') ? 2 * v.R1 / v.Dw : undefined, check: v => (v.C1 !== undefined && v.C1 < 4) ? 'C1 < 4 — high loop stress; increase R1' : null },
          { id: 'K1', symbol: 'K_1', label: 'Bending curvature factor', kind: 'calc', digits: 4, compute: v => (H.has(v, 'C1') && v.C1 > 1) ? (4 * v.C1 * v.C1 - v.C1 - 1) / (4 * v.C1 * (v.C1 - 1)) : undefined },
          { id: 'sigA', symbol: '\\sigma_A', label: 'Bending stress at A', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'Dm', 'Fo', 'K1', 'Dw') ? 16 * v.Dm * v.Fo * v.K1 / (Math.PI * Math.pow(v.Dw, 3)) + 4 * v.Fo / (Math.PI * v.Dw * v.Dw) : undefined,
            work: v => H.has(v, 'sigA') ? '\\(\\sigma_A = \\dfrac{16(' + H.fmt(v.Dm, 4) + ')(' + H.fmt(v.Fo) + ')(' + H.fmt(v.K1, 4) + ')}{\\pi(' + H.fmt(v.Dw) + ')^3} + \\dfrac{4(' + H.fmt(v.Fo) + ')}{\\pi(' + H.fmt(v.Dw) + ')^2} = ' + H.fmt(v.sigA, 5) + '\\)' : null },
          { id: 'sbA', symbol: '\\sigma_{d,bend}', label: 'Allowable bending stress for the loop', unit: 'psi / MPa', kind: 'lookup', fig: 'fig18-22', auto: v => H.has(v, 'td') ? v.td / 0.6 : undefined, hint: 'Mott 18-8 torsion-spring design-stress charts; auto ≈ τd/0.6 (Shigley Table 10-7: 0.75 Sut)' },
        ] },
      { id: 'xhookB', title: 'End loop: torsional stress at B', eq: '18-15, 18-16', fig: ['fig18-22'], when: v => v.mode === 'ext',
        formula: '\\tau_B = \\frac{8 D_m F_o K_2}{\\pi D_w^3} \\qquad K_2 = \\frac{4C_2 - 1}{4C_2 - 4},\\; C_2 = \\frac{2R_2}{D_w}',
        text: 'R<sub>2</sub> = bend radius at right angles to the coil (Figure 18-22b). Mott: compare τ<sub>B</sub> with the design-stress curves (Figs. 18-8 … 18-13), some designers reducing them by about 10 %.',
        vars: [
          { id: 'R2', symbol: 'R_2', label: 'Loop bend radius (torsion)', unit: 'in / mm', kind: 'input', auto: v => H.has(v, 'Dw') ? 2.5 * v.Dw : undefined, hint: 'auto = 2.5 Dw (C2 = 5); use the drawing value' },
          { id: 'C2', symbol: 'C_2', label: 'Bend index 2R2/Dw', kind: 'calc', digits: 4, compute: v => H.has(v, 'R2', 'Dw') ? 2 * v.R2 / v.Dw : undefined, check: v => (v.C2 !== undefined && v.C2 < 4) ? 'C2 < 4 — high loop stress; increase R2' : null },
          { id: 'K2', symbol: 'K_2', label: 'Torsion curvature factor', kind: 'calc', digits: 4, compute: v => (H.has(v, 'C2') && v.C2 > 1) ? (4 * v.C2 - 1) / (4 * v.C2 - 4) : undefined },
          { id: 'tauB', symbol: '\\tau_B', label: 'Torsional stress at B', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'Dm', 'Fo', 'K2', 'Dw') ? 8 * v.Dm * v.Fo * v.K2 / (Math.PI * Math.pow(v.Dw, 3)) : undefined,
            work: v => H.has(v, 'tauB') ? '\\(\\tau_B = \\dfrac{8(' + H.fmt(v.Dm, 4) + ')(' + H.fmt(v.Fo) + ')(' + H.fmt(v.K2, 4) + ')}{\\pi(' + H.fmt(v.Dw) + ')^3} = ' + H.fmt(v.tauB, 5) + '\\)' : null },
          { id: 'tdB', symbol: '0.9\\tau_d', label: 'Allowable for the loop (design stress − 10 %)', unit: 'psi / MPa', kind: 'calc', digits: 5, compute: v => H.has(v, 'td') ? 0.9 * v.td : undefined },
        ] },
    ] },

    { title: 'Result', steps: [
      { id: 'result', title: 'Overall verdict', vars: [],
        after: v => {
          if (v.mode === 'ext') {
            if (!H.has(v, 'tauo', 'td', 'FI')) return '<span>Complete the extension-spring steps to get the verdict.</span>';
            const rows = [['τo ≤ τd (±1 %)', v.tauo <= 1.01 * v.td], ['FI > 0', v.FI > 0], ['τI in Fig. 18-21 band', H.has(v, 'tauI', 'tIlo', 'tIhi') && v.tauI >= v.tIlo && v.tauI <= v.tIhi], ['loop σA ≤ allowable', !H.has(v, 'sigA', 'sbA') || v.sigA <= v.sbA], ['loop τB ≤ 0.9 τd', !H.has(v, 'tauB', 'tdB') || v.tauB <= v.tdB]];
            const ok = rows.every(r => r[1]);
            return rows.map(r => r[0] + ' ' + (r[1] ? '<span class="result-ok">✓</span>' : '<span class="result-bad">✗</span>')).join(' · ') + '<br>' + (ok ? '<span class="result-ok"><b>PASS</b> — ' : '<span class="result-bad"><b>FAIL</b> — ') + MOTT_G[v.mat][0].split(' (')[0] + ' extension spring: Dw = ' + H.fmt(v.Dw) + ', Dm = ' + H.fmt(v.Dm, 4) + ' (OD ' + H.fmt(v.OD, 4) + '), Na = ' + H.fmt(v.Na, 4) + ', k = ' + H.fmt(v.k, 4) + ', Lf = ' + H.fmt(v.Lf, 4) + ', FI = ' + H.fmt(v.FI, 4) + ', τI = ' + H.fmt(v.tauI, 5) + '.</span>';
          }
          if (!H.has(v, 'tauo', 'td', 'taus', 'tmax', 'Ls', 'Loa')) return '<span>Complete the stress and solid-height steps to get the verdict.</span>';
          const buck = H.has(v, 'LfDm') ? ((v.curve === 0.5 && v.LfDm < 5.2) || (H.has(v, 'rcr', 'ract') && v.ract < v.rcr)) : true;
          const rows = [['τo ≤ τd (±1 %)', v.tauo <= 1.01 * v.td], ['τs ≤ τmax', v.taus <= v.tmax], ['Ls < Lo', v.Ls < v.Loa], ['no buckling', buck], ['coil clearance > Dw/10', !H.has(v, 'cc', 'ccmin') || v.cc > v.ccmin], ['fits hole', !H.has(v, 'Dhole', 'Dhmin') || v.Dhole >= v.Dhmin]];
          const ok = rows.every(r => r[1]);
          return rows.map(r => r[0] + ' ' + (r[1] ? '<span class="result-ok">✓</span>' : '<span class="result-bad">✗</span>')).join(' · ') + '<br>' + (ok ? '<span class="result-ok"><b>PASS</b> — ' : '<span class="result-bad"><b>FAIL</b> — ') + MOTT_G[v.mat][0].split(' (')[0] + ', Dw = ' + H.fmt(v.Dw) + ', Dm = ' + H.fmt(v.Dm, 4) + ' (OD ' + H.fmt(v.OD, 4) + ', ID ' + H.fmt(v.ID, 4) + '), Na = ' + H.fmt(v.Na, 4) + ', N = ' + H.fmt(v.N, 4) + ' ' + v.ends + ' ends, Lf = ' + H.fmt(v.Lf, 4) + ', Ls = ' + H.fmt(v.Ls, 4) + ', k = ' + H.fmt(v.k, 4) + '.</span>'; } },
    ] },
  ],
};
