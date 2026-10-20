/* Boundary-lubricated plain bearings — Mott 6e Ch. 16 Sec. 16-5 (pV method).
 * Fizz bible pp. 92-95 follows Shigley's Oiles procedure; this file keeps the same step order but uses Mott's
 * symbols (p, V, pV), Mott's design rule (design pV = 2·pV, material from Table 16-1) and Fig. 16-4 clearance.
 * Steps the Fizz bible needs that Mott lacks (thermal Lmin, wear factor K, Oiles limits) use Shigley tables flagged book:'shigley'.
 * Mech bible unit 4 (PDF p. 129) is empty.
 * Verified against: Mott Example Problem 16-1 (150 lb, 500 rpm, Dmin = 1.50 in, L/D = 1): p = 66.7 psi, V = 196 ft/min,
 *   pV = 13 100, design pV = 26 200 -> table pick DP11 dry (28 600; Mott chose high-tin babbitt 30 000), Cd = 0.002 in -> PASS;
 *   HW4 2023 P1a (0.50 in, 75 lb, 600 rpm, L = 1.5D): p = 200 psi, V = 78.5 ft/min, pV = 15 700, design 31 400 -> porous bronze;
 *   (L = D): p = 300, design 47 124 -> porous bronze; P1b (fs 0.04, nd 2, Tmax 150 F): L_T = 15.42 in, T_f(L = 0.75) = 1715 F -> not feasible;
 *   HW4 2024 P1a (3.00 in, 800 lb, 350 rpm, L = 1.5D): p = 59.3 psi, V = 275 ft/min, pV = 16 290, design 32 580 -> porous bronze. */
(function () {
  const T161 = [['Vespel SP-21 polyimide', 300000], ['DP11, oiled', 286000], ['Manganese bronze (C86200)', 150000], ['Aluminum bronze (C95400)', 125000], ['DX10, dry or oiled', 80000],
    ['Leaded tin bronze (C93800)', 75000], ['DU', 51400], ['BU dry lubricant bearing', 51000], ['Porous bronze/oil impregnated', 50000], ['Babbitt: high tin (89%)', 30000],
    ['DP11, dry', 28600], ['Babbitt: low tin (10%)', 18000], ['Graphite/Metallized', 15000], ['Rulon PTFE: 641', 10000], ['Rulon PTFE: J', 7500], ['Polyurethane: UHMW', 4000], ['Nylon 101', 3000]];
  const fizz = v => v.rule === 'Fizz/Oiles: limit > pV';
  function matTable(v) {
    if (v.pV === undefined) return '';
    const need = fizz(v) ? v.pV : v.pVdes;
    let best; T161.forEach(r => { if (r[1] >= need && (!best || r[1] < best[1])) best = r; });
    const asc = T161.slice().reverse(), low = asc.filter(r => r[1] < need).slice(-2), high = asc.filter(r => r[1] >= need).slice(0, 5);
    const rows = low.concat(high).map(r => ({ cells: [r[0], H.fmt(r[1], 6), H.fmt(r[1] / need, 3), r[1] >= need ? 'ok' : 'too low'], ok: r[1] >= need, pick: r === best, set: { matName: r[0], pVrated: r[1] } }));
    return H.table(['Material (Table 16-1)', 'rated pV (psi·fpm)', 'rated / required', 'check'], rows, {
      caption: 'Materials vs required pV = ' + H.fmt(need, 5) + ' psi·fpm (' + (fizz(v) ? 'plain pV, Fizz rule' : '2·pV, Mott rule') + ')',
      note: 'Pick = lowest rated pV that still covers the requirement. Course HW4 P1: "porous bronze or BU" (31 400 and 32 580); Mott Ex. 16-1 chose high-tin babbitt (30 000) — any row marked ok is acceptable.',
    });
  }

  window.TOPIC = {
    id: 'bushings', book: 'mott',
    title: 'Bushings — Boundary-Lubricated Bearings',
    subtitle: 'Mott Ch. 16 Sec. 16-5 · Fizz pp. 92-95 · pV method',
    sibling: 'bushings_shigley.html',
    intro: 'Mott: choose <i>D</i> and <i>L/D</i>, compute <i>p = F/(LD)</i>, <i>V = πDn/12</i> and <i>pV</i>, double it and pick a Table 16-1 material rated above that (Ex. 16-1). ' +
      'The Fizz/Shigley temperature-rise length and the Oiles limits are included (Shigley tables) because the course asks for both (HW4 P1b).',
    example: { F: 150, n: 500, Dmin: 1.5, D: 1.5, LD: 1.0, L: 1.5, nd: 1, fs: 0.03, Tinf: 70, hCR: 2.7, J: 778, pVrated: 30000, matName: 'Babbitt: high tin (89%)', rule: 'Mott: rated ≥ 2·pV', Cd: 0.002 },

    assumptions: [
      { text: 'Trial D = D_min and L/D = 1 (dry or oil-impregnated porous bearings; 1.5 for carbon-graphite), always within 0.5–2.0', src: 'Mott Sec. 16-5 steps 1–2', var: 'LD' },
      { text: 'Acceptance: rated pV ≥ design pV = 2·(pV) (Mott); the Fizz/Oiles route compares the plain pV with the Oiles limit', src: 'Mott Sec. 16-5 step 8 · Fizz p.95', var: 'rule' },
      { text: 'Design factor on the load n_d = 1 — the course\'s "n_d = 2" for this method is the 2·pV doubling, not a second factor on F', src: 'Mott Ex. 16-1 · HW4 P1', var: 'nd' },
      { text: 'Oiles 500 SP limits for the Fizz route: P_max < 3560 psi, V < 100 ft/min (Shigley Table 12-11)', src: 'Fizz p.94 · Fizz p.95', var: 'Plim' },
      { text: 'Thermal step: f_s = 0.03 (Oiles 500SP), \\(\\hbar_{CR}\\) = 2.7, J = 778 unless given', src: 'Fizz p.93', var: 'fs' },
      { text: 'Ambient \\(T_\\infty\\) = 70 °F if not given', src: 'Fizz p.94', var: 'Tinf' },
      { text: 'T_f = 300 °F (Oiles 500 SP) on the Fizz route; blank on the Mott route (thermal length skipped)', src: 'Fizz p.93 · Fizz p.95', var: 'Tf', value: 300 },
      { text: 'Diametral clearance ≈ 0.001 in per inch of journal diameter until read from Fig. 16-4', src: 'Mott Sec. 16-5 step 11', var: 'Cd' },
      { text: 'Linear wear only checked when a maximum wear is given (Oiles K)', src: 'Fizz p.95', var: 'wmax' },
    ],

    figures: [
      { id: 'fig16-1', ref: 'Figure 16-1', title: 'Bearing geometry: radial clearance \\(C_r = (D_b - D_j)/2\\), diametral clearance \\(C_d = D_b - D_j\\)', src: 'figures/mott/fig16-1.png', page: 632 },
      { id: 'proc', ref: 'Sec. 16-5 procedure', title: 'Mott design procedure for boundary-lubricated plain surface bearings (Steps 1-11)', src: 'figures/mott/proc16-5.png', page: 638 },
      { id: 't16-1', ref: 'Table 16-1', title: 'Rated pV of bearing materials in boundary lubrication', src: 'figures/mott/table16-1.png', page: 637,
        note: 'Rated pV must be ≥ 2·(pV). \\(1\\ \\text{psi·fpm} = 3.50\\times10^{-5}\\) MPa·m/s.' },
      { id: 'fig16-4', ref: 'Figure 16-4', title: 'Minimum recommended diametral clearance vs journal diameter and speed', src: 'figures/mott/fig16-4.png', page: 638 },
      { id: 't12-8', ref: 'Table 12-8', book: 'shigley', title: 'Generic bushing materials: maximum load, temperature, speed, PV (porous bronze 150 °F)', src: 'figures/shigley/table12-8.png', page: 692 },
      { id: 't12-9', ref: 'Table 12-9', book: 'shigley', title: 'Wear factors K and limiting PV (Oiles materials)', src: 'figures/shigley/table12-9.png', page: 693 },
      { id: 't12-10', ref: 'Table 12-10', book: 'shigley', title: 'Coefficients of friction f_s', src: 'figures/shigley/table12-10.png', page: 693 },
      { id: 't12-11', ref: 'Table 12-11', book: 'shigley', title: 'Oiles 500 SP service range (P_max < 3560 psi, V < 100 ft/min, PV < 46 700)', src: 'figures/shigley/table12-11.png', page: 695 },
      { id: 'oiles-sp', ref: 'OILES 500SP1 data (catalogue p.94)', book: 'course', title: 'OILES 500SP1 service range and mechanical properties (dry: P_max 29 N/mm^2, V_max 0.50 m/s, PV 1.65 N/mm^2·m/s)', src: 'figures/course/oiles_500sp1_service_range_properties.png' },
      { id: 'oiles-spb', ref: 'OILES SPB 500SP1 bushing sizes (p.95)', book: 'course', title: 'Standard SPB (500SP1-SL1) bushing part numbers: I.D. × O.D. × length (mm)', src: 'figures/course/oiles_500sp1_spb_bushing_sizes.png' },
      { id: 'oiles-pv', ref: 'OILES PV vs motion and temperature (p.172)', book: 'course', title: 'OILES design notes: allowable PV by motion type, PV vs temperature, mating-shaft hardness', src: 'figures/course/oiles_operating_motion_pv.png' },
      { id: 't12-12', ref: 'Table 12-12', book: 'shigley', title: 'Available bushing sizes (ID / OD / L, inches)', src: 'figures/shigley/table12-12.png', page: 697 },
    ],

    sections: [
      { title: 'Inputs', steps: [
        { id: 'in', title: 'Given information', fig: ['fig16-1', 'proc'],
          text: 'Radial load, speed and the minimum shaft diameter from the shaft analysis.',
          vars: [
            { id: 'F', symbol: 'F', label: 'Radial load', unit: 'lb', kind: 'input' },
            { id: 'n', symbol: 'n', label: 'Rotational speed', unit: 'rpm', kind: 'input' },
            { id: 'Dmin', symbol: 'D_{min}', label: 'Minimum journal diameter', unit: 'in', kind: 'input', hint: 'optional' },
            { id: 'nd', symbol: 'n_d', label: 'Design factor on the load (Fizz / Shigley)', unit: '', kind: 'input', default: 1 },
          ] },
        { id: 'thermal', title: 'Fizz Step 2 — minimum length from temperature rise (Shigley Eq. 12-49)', fig: ['t12-10', 't12-8'],
          formula: 'L_T = \\frac{720\\, f_s\\, n_d F n}{J\\, \\hbar_{CR}\\,(T_f - T_\\infty)}',
          text: 'Mott has no equivalent; leave <i>T<sub>f</sub></i> blank on the Mott route to skip it.',
          vars: [
            { id: 'fs', symbol: 'f_s', label: 'Coefficient of friction', unit: '', kind: 'lookup', fig: 't12-10', default: 0.03 },
            { id: 'Tf', symbol: 'T_f', label: 'Max. bearing temperature', unit: '°F', kind: 'input', auto: v => fizz(v) ? 300 : undefined, hint: 'Fizz route: blank → 300 °F' },
            { id: 'Tinf', symbol: 'T_\\infty', label: 'Ambient temperature', unit: '°F', kind: 'input', default: 70 },
            { id: 'hCR', symbol: '\\hbar_{CR}', label: 'Heat-transfer coefficient', unit: 'Btu/(h·ft^2·°F)', kind: 'input', default: 2.7 },
            { id: 'J', symbol: 'J', label: 'Mechanical equivalent of heat', unit: 'ft·lbf/Btu', kind: 'input', default: 778 },
            { id: 'Lmin', symbol: 'L_T', label: 'Minimum length', unit: 'in', kind: 'calc', digits: 4,
              compute: v => H.has(v, 'fs', 'nd', 'F', 'n', 'J', 'hCR', 'Tf', 'Tinf') && v.Tf > v.Tinf ? 720 * v.fs * v.nd * v.F * v.n / (v.J * v.hCR * (v.Tf - v.Tinf)) : undefined,
              work: v => v.Lmin !== undefined ? '\\(L_T = \\dfrac{720(' + H.fmt(v.fs) + ')(' + H.fmt(v.nd) + ')(' + H.fmt(v.F) + ')(' + H.fmt(v.n) + ')}{' + H.fmt(v.J) + '(' + H.fmt(v.hCR) + ')(' + H.fmt(v.Tf) + '-' + H.fmt(v.Tinf) + ')} = ' + H.fmt(v.Lmin) + '\\text{ in}\\)' : null },
          ] },
      ] },

      { title: 'Geometry (Mott Steps 1–4)', steps: [
        { id: 'geo', title: 'Trial diameter, L/D and length', fig: ['t12-12', 'oiles-spb'],
          text: 'Try <i>D = D<sub>min</sub></i>, pick <i>L/D</i> in 0.5–2.0 (1 for porous / dry bearings, 1.5 for carbon-graphite) and round <i>L</i> to a convenient size.',
          vars: [
            { id: 'D', symbol: 'D', label: 'Trial bearing (journal) diameter', unit: 'in', kind: 'input',
              check: v => (H.has(v, 'D', 'Dmin') && v.D < v.Dmin) ? 'D is below the minimum shaft diameter' : null },
            { id: 'LD', symbol: 'L/D', label: 'Target length-to-diameter ratio', unit: '', kind: 'input', default: 1,
              check: v => (v.LD !== undefined && (v.LD < 0.5 || v.LD > 2)) ? 'Mott recommends 0.5 ≤ L/D ≤ 2.0' : null },
            { id: 'Lnom', symbol: 'L_{nom}', label: 'Nominal length D·(L/D)', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'D', 'LD') ? v.D * v.LD : undefined },
            { id: 'L', symbol: 'L', label: 'Specified bearing length', unit: 'in', kind: 'input', hint: 'blank → L_nom', auto: v => v.Lnom,
              check: v => (H.has(v, 'L', 'Lmin') && v.L < v.Lmin) ? 'L < L_T from the thermal equation' : null },
            { id: 'LDact', symbol: 'L/D', label: 'Actual L/D', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'L', 'D') && v.D > 0 ? v.L / v.D : undefined,
              check: v => (v.LDact !== undefined && (v.LDact < 0.5 || v.LDact > 2)) ? 'Actual L/D outside 0.5–2' : null },
          ] },
      ] },

      { title: 'pV analysis (Mott Steps 5–9)', steps: [
        { id: 'p', title: 'Bearing pressure', eq: '16-1', formula: 'p = \\frac{n_d F}{L D} \\qquad p_{max} = \\frac{4}{\\pi}\\,p',
          vars: [
            { id: 'p', symbol: 'p', label: 'Bearing pressure', unit: 'psi', kind: 'calc', digits: 4,
              compute: v => H.has(v, 'nd', 'F', 'L', 'D') && v.L * v.D > 0 ? v.nd * v.F / (v.L * v.D) : undefined,
              work: v => v.p !== undefined ? '\\(p = \\dfrac{' + H.fmt(v.nd) + '(' + H.fmt(v.F) + ')}{' + H.fmt(v.L) + '(' + H.fmt(v.D) + ')} = ' + H.fmt(v.p) + '\\text{ psi}\\)' : null },
            { id: 'pmax', symbol: 'p_{max}', label: 'Peak pressure (Shigley Eq. 12-42, Oiles check)', unit: 'psi', kind: 'calc', digits: 4, compute: v => v.p !== undefined ? 4 / Math.PI * v.p : undefined },
          ] },
        { id: 'V', title: 'Linear speed of the journal surface', formula: 'V = \\frac{\\pi D n}{12}\\ \\text{ft/min}',
          vars: [
            { id: 'V', symbol: 'V', label: 'Journal surface speed', unit: 'ft/min', kind: 'calc', digits: 4,
              compute: v => H.has(v, 'D', 'n') ? Math.PI * v.D * v.n / 12 : undefined,
              work: v => v.V !== undefined ? '\\(V = \\dfrac{\\pi(' + H.fmt(v.D) + ')(' + H.fmt(v.n) + ')}{12} = ' + H.fmt(v.V) + '\\text{ ft/min}\\)' : null },
          ] },
        { id: 'pV', title: 'pV factor and design value', formula: 'pV = p\\,V \\qquad (pV)_{design} = 2\\,(pV)',
          text: 'Mott Step 8: design at half the rated pV, i.e. the material must be rated ≥ 2·(pV).',
          vars: [
            { id: 'pV', symbol: 'pV', label: 'pV factor', unit: 'psi·fpm', kind: 'calc', digits: 5,
              compute: v => H.has(v, 'p', 'V') ? v.p * v.V : undefined,
              work: v => v.pV !== undefined ? '\\(pV = ' + H.fmt(v.p) + '(' + H.fmt(v.V) + ') = ' + H.fmt(v.pV, 5) + '\\text{ psi·fpm}\\)' : null },
            { id: 'pVdes', symbol: '(pV)_{design}', label: 'Design value 2·pV', unit: 'psi·fpm', kind: 'calc', digits: 5, compute: v => v.pV !== undefined ? 2 * v.pV : undefined },
            { id: 'pVSI', symbol: '(pV)_{design}', label: 'Design value in SI', unit: 'MPa·m/s', kind: 'calc', digits: 4, compute: v => v.pVdes !== undefined ? v.pVdes * 3.5e-5 : undefined },
          ] },
        { id: 'mat', title: 'Specify a material (Mott Step 9)', fig: ['t16-1', 't12-9', 't12-11', 'oiles-sp', 'oiles-pv'],
          text: 'Pick from the table (★) or read Table 16-1. Fizz/Oiles rule: plain pV against the Oiles limit (46 700 for Oiles 500) plus \\(p_{max}\\) and <i>V</i> limits.',
          vars: [
            { id: 'rule', label: 'Acceptance rule', kind: 'choice', type: 'text', default: 'Mott: rated ≥ 2·pV', options: ['Mott: rated ≥ 2·pV', 'Fizz/Oiles: limit > pV'] },
            { id: 'matName', label: 'Material chosen', kind: 'input', type: 'text', hint: 'e.g. Porous bronze, Oiles 500' },
            { id: 'pVrated', symbol: '(pV)_{rated}', label: 'Rated / limiting pV of the material', unit: 'psi·fpm', kind: 'lookup', fig: 't16-1', auto: v => fizz(v) ? 46700 : undefined, hint: 'Fizz/Oiles rule → 46 700 (Oiles 500)' },
            { id: 'Plim', symbol: 'p_{max,lim}', label: 'Max. pressure limit (Oiles route)', unit: 'psi', kind: 'lookup', fig: 't12-11', default: 3560 },
            { id: 'Vlim', symbol: 'V_{max}', label: 'Max. velocity limit (Oiles route)', unit: 'ft/min', kind: 'lookup', fig: 't12-11', default: 100 },
          ],
          after: v => {
            const tab = matTable(v);
            if (!H.has(v, 'pV', 'pVrated')) return tab;
            const ok = !fizz(v) ? v.pVrated >= v.pVdes : (v.pV < v.pVrated && (v.Plim === undefined || v.pmax < v.Plim) && (v.Vlim === undefined || v.V < v.Vlim));
            return tab + (ok ? '<span class="result-ok">' + (v.matName || 'Material') + ' is adequate: rated ' + H.fmt(v.pVrated, 5) + ' vs ' + (fizz(v) ? 'pV ' + H.fmt(v.pV, 5) : '2·pV ' + H.fmt(v.pVdes, 5)) + ' ✔</span>'
              : '<span class="result-bad">Not adequate — higher-pV material, or a larger D / L.</span>');
          } },
        { id: 'temp', title: 'Temperature at the chosen length (Shigley Eq. 12-49)', fig: ['t12-8', 't12-10'],
          formula: 'T = T_\\infty + \\frac{720\\, f_s\\, n_d F n}{J\\, \\hbar_{CR}\\, L}',
          text: 'Course comparison (HW4 P1b): Mott ignores heat — this shows whether the bushing survives (e.g. porous bronze \\(T_{max}\\) = 150 °F, Shigley Table 12-8).',
          vars: [
            { id: 'Tmax', symbol: 'T_{max}', label: 'Material temperature limit', unit: '°F', kind: 'lookup', fig: 't12-8', hint: 'optional — Table 12-8 or Oiles 300 °F' },
            { id: 'Tact', symbol: 'T', label: 'Steady bearing temperature', unit: '°F', kind: 'calc', digits: 4,
              compute: v => H.has(v, 'Tinf', 'fs', 'nd', 'F', 'n', 'J', 'hCR', 'L') && v.L > 0 ? v.Tinf + 720 * v.fs * v.nd * v.F * v.n / (v.J * v.hCR * v.L) : undefined,
              work: v => v.Tact !== undefined ? '\\(T = ' + H.fmt(v.Tinf) + ' + \\dfrac{720(' + H.fmt(v.fs) + ')(' + H.fmt(v.nd) + ')(' + H.fmt(v.F) + ')(' + H.fmt(v.n) + ')}{' + H.fmt(v.J) + '(' + H.fmt(v.hCR) + ')(' + H.fmt(v.L) + ')} = ' + H.fmt(v.Tact) + '\\ ^\\circ\\text{F}\\)' : null },
          ],
          after: v => !H.has(v, 'Tact', 'Tmax') ? '' : v.Tact <= v.Tmax ? '<span class="result-ok">' + H.fmt(v.Tact) + ' °F ≤ ' + H.fmt(v.Tmax) + ' °F ✔</span>' : '<span class="result-bad">' + H.fmt(v.Tact) + ' °F &gt; ' + H.fmt(v.Tmax) + ' °F ✘ — bushing not feasible: lengthen it or use a rolling bearing</span>' },
      ] },

      { title: 'Wear & clearance (Mott Steps 10–11, Fizz Step 10)', steps: [
        { id: 'wear', title: 'Linear wear (if a wear limit is given — Shigley Eq. 12-43)', fig: ['t12-9'],
          formula: 'w = \\frac{K\\, n_d F n\\, t}{3L}',
          vars: [
            { id: 'K', symbol: 'K', label: 'Wear factor', unit: 'in^3·min/(lbf·ft·h)', kind: 'lookup', fig: 't12-9', default: 0.6e-10, hint: 'Oiles 500 (Shigley Table 12-9)' },
            { id: 't', symbol: 't', label: 'Operating time', unit: 'h', kind: 'input' },
            { id: 'wmax', symbol: 'w_{max}', label: 'Allowable wear', unit: 'in', kind: 'input' },
            { id: 'w', symbol: 'w', label: 'Radial wear', unit: 'in', kind: 'calc', digits: 4,
              compute: v => H.has(v, 'K', 'nd', 'F', 'n', 't', 'L') && v.L > 0 ? v.K * v.nd * v.F * v.n * v.t / (3 * v.L) : undefined,
              work: v => v.w !== undefined ? '\\(w = \\dfrac{' + H.fmt(v.K) + '(' + H.fmt(v.nd) + ')(' + H.fmt(v.F) + ')(' + H.fmt(v.n) + ')(' + H.fmt(v.t) + ')}{3(' + H.fmt(v.L) + ')} = ' + H.fmt(v.w) + '\\text{ in}\\)' : null },
          ],
          after: v => (v.w === undefined || v.wmax === undefined) ? '' : v.w < v.wmax ? '<span class="result-ok">w &lt; w_max ✔</span>' : '<span class="result-bad">w ≥ w_max ✘ — lengthen the bushing</span>' },
        { id: 'clr', title: 'Nominal diametral clearance', fig: ['fig16-4', 'fig16-1'],
          formula: 'C_d = D_b - D_j = 2C_r',
          text: 'Read Fig. 16-4 at the journal diameter and speed (Ex. 16-1: 1.50 in, 500 rpm → 0.002 in).',
          vars: [
            { id: 'Cd', symbol: 'C_d', label: 'Diametral clearance', unit: 'in', kind: 'lookup', fig: 'fig16-4', auto: v => v.D ? 0.001 * v.D : undefined },
            { id: 'Cr', symbol: 'C_r', label: 'Radial clearance', unit: 'in', kind: 'calc', digits: 4, compute: v => v.Cd !== undefined ? v.Cd / 2 : undefined },
            { id: 'Db', symbol: 'D_b', label: 'Bearing bore D + C_d', unit: 'in', kind: 'calc', digits: 5, compute: v => H.has(v, 'D', 'Cd') ? v.D + v.Cd : undefined },
          ] },
      ] },

      { title: 'Result', steps: [
        { id: 'res', title: 'Summary',
          vars: [
            { id: 'ok', label: 'Design status', kind: 'calc', compute: v => {
              if (!H.has(v, 'pV', 'pVrated')) return undefined;
              const bad = [];
              if (!fizz(v) ? v.pVrated < v.pVdes : v.pV >= v.pVrated) bad.push('pV');
              if (fizz(v) && v.Plim !== undefined && v.pmax >= v.Plim) bad.push('p_max');
              if (fizz(v) && v.Vlim !== undefined && v.V >= v.Vlim) bad.push('V');
              if (v.Lmin !== undefined && v.L < v.Lmin) bad.push('L < L_T');
              if (v.Tact !== undefined && v.Tmax !== undefined && v.Tact > v.Tmax) bad.push('temperature');
              if (v.LDact < 0.5 || v.LDact > 2) bad.push('L/D');
              if (v.w !== undefined && v.wmax !== undefined && v.w >= v.wmax) bad.push('wear');
              return bad.length ? 'FAIL: ' + bad.join(', ') : 'PASS';
            } },
          ],
          after: v => v.ok === undefined ? '' : v.ok === 'PASS'
            ? '<span class="result-ok">Bearing: D = ' + H.fmt(v.D) + ' in, L = ' + H.fmt(v.L) + ' in, ' + (v.matName || 'material') + ' (rated pV ' + H.fmt(v.pVrated, 5) + ')' + (v.Cd !== undefined ? ', C_d = ' + H.fmt(v.Cd) + ' in' : '') + ' ✔</span>'
            : '<span class="result-bad">' + v.ok + ' — revise D, L/D or material.</span>' },
      ] },
    ],
  };
})();
