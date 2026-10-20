/* Boundary-lubricated bearings (bushings) — Shigley 11e, Ch. 12 Sec. 12-15.
 * Procedure: Fizz bible pp. 92-95 (Shigley Ex. 12-10 method). Mech bible unit 4 (PDF p. 129) is empty.
 * Verified against: Shigley Ex. 12-10 (F = 50 lbf, 300 rev/min, nd = 2, Oiles 500): Lmin = 1.34 in, ID 3/4 x OD 1 1/8 x L 1 1/2,
 *   Pmax = 113 psi, P = 88.9 psi, V = 58.9 ft/min, PV = 5240, w = 0.000320 in after 800 h -> PASS. */
window.TOPIC = {
  id: 'bushings', book: 'shigley',
  title: 'Bushings — Boundary-Lubricated Bearings',
  subtitle: 'Shigley Ch. 12 Sec. 12-15 · Fizz pp. 92-95 · PV method',
  sibling: 'bushings_mott.html',
  intro: 'Select a dry / boundary-lubricated bushing (Oiles-type) for a radial load <i>F</i> at speed <i>N</i>. ' +
    'Procedure (Fizz p. 93 = Shigley Example 12-10): read material data from Tables 12-9/12-10, size the minimum length from the temperature-rise ' +
    'equation (12-49), pick a stock bushing from Table 12-12, check <i>L/D</i>, then verify <i>P<sub>max</sub></i>, <i>V</i>, <i>PV</i> and wear against the ' +
    'service limits in Table 12-11 (or Table 12-8 / 12-9 for other materials). Units: lbf, rpm, in, °F, psi, ft/min.',
  example: { F: 50, N: 300, nd: 2, Tf: 300, Tinf: 70, hCR: 2.7, J: 778, mat: 'Oiles 500', fs: 0.03, K: 0.6e-10, PVlim: 46700, Pmaxlim: 3560, Vlim: 100, Tlim: 300, ID: 0.75, OD: 1.125, L: 1.5, t: 800, wmax: 0.001 },

  assumptions: [
    { text: 'Bushing is an Oiles 500 SP unless another material is named: K = 0.6×10^{-10}, limiting PV = 46 700 psi·ft/min (Table 12-9)', src: 'Fizz p.93 · Fizz p.94', var: 'mat' },
    { text: 'Friction coefficient f_s = 0.03 (Oiles 500SP row of Table 12-10)', src: 'Fizz p.93', var: 'fs' },
    { text: 'ħ_{CR} = 2.7 Btu/(h·ft²·°F) unless the question gives another value', src: 'Fizz p.93', var: 'hCR' },
    { text: 'J = 778 ft·lbf/Btu', src: 'Fizz p.93', var: 'J' },
    { text: 'Ambient T_{∞} = 70 °F if no value is given (the textbook value)', src: 'Fizz p.94', var: 'Tinf' },
    { text: 'T_f = the maximum (lubricant / bushing) temperature — 300 °F for Oiles 500 SP (Table 12-11) when the question gives none', src: 'Fizz p.93 · Fizz p.95 · Shigley Ex. 12-10', var: 'Tf', value: 300 },
    { text: 'Design factor n_d = 1 when none is given (the guides give no value; Shigley Ex. 12-10 uses 2)', src: 'Shigley Ex. 12-10', var: 'nd' },
    { text: 'Pick the smallest stock bushing in Table 12-12 with L ≥ L_{min}, and ID bigger than the shaft diameter if one is given', src: 'Fizz p.94' },
    { text: 'Keep 0.5 ≤ L/D ≤ 2, otherwise choose another bushing (Eq. 12-44; Fizz p.94 prints the inequality reversed)', src: 'Fizz p.94' },
    { text: 'Service-range limits of Oiles 500 SP: P_{max} &lt; 3560 psi, V &lt; 100 ft/min, PV &lt; 46 700, T &lt; 300 °F (Table 12-11)', src: 'Fizz p.94 · Fizz p.95', var: 'Pmaxlim' },
    { text: 'Linear wear w is only checked when the question gives a maximum wear', src: 'Fizz p.95' },
  ],

  figures: [
    { id: 'fig12-39', ref: 'Figure 12-39', title: 'Sliding block subjected to wear (definition of K)', src: 'figures/shigley/fig12-39.png', page: 693 },
    { id: 'fig12-40', ref: 'Figure 12-40', title: 'Pressure distribution on a boundary-lubricated bushing (Pmax vs nominal P)', src: 'figures/shigley/fig12-40.png', page: 694 },
    { id: 'fig12-41', ref: 'Figure 12-41', title: 'Journal/bushing nomenclature (Example 12-9)', src: 'figures/shigley/fig12-41.png', page: 695 },
    { id: 't12-8', ref: 'Table 12-8', title: 'Materials for boundary-lubricated bearings and their operating limits (max load psi, max temp °F, max speed fpm, max PV)', src: 'figures/shigley/table12-8.png', page: 692,
      note: 'Use when the problem names a generic material (cast bronze, nylon, Teflon…). For Oiles 500 SP use Table 12-11.' },
    { id: 't12-9', ref: 'Table 12-9', title: 'Wear factors K and limiting PV (Oiles materials)', src: 'figures/shigley/table12-9.png', page: 693,
      note: 'K in in³·min/(lbf·ft·h); PV in psi·ft/min. Oiles 500: K = 0.6×10⁻¹⁰, PV = 46 700.' },
    { id: 't12-10', ref: 'Table 12-10', title: 'Coefficients of friction fs by bearing type', src: 'figures/shigley/table12-10.png', page: 693,
      note: 'Oiles 500SP: fs = 0.03.' },
    { id: 't12-11', ref: 'Table 12-11', title: 'Oiles 500 SP service range: Pmax < 3560 psi, Vmax < 100 ft/min, PV < 46 700, T < 300 °F', src: 'figures/shigley/table12-11.png', page: 695 },
    { id: 't12-12', ref: 'Table 12-12', title: 'Available bushing sizes (ID, OD, L in inches) — bullets mark stocked combinations', src: 'figures/shigley/table12-12.png', page: 697,
      note: 'Pick a row (ID/OD) and a column (L) that has a bullet. L must exceed Lmin and ID must exceed the shaft diameter if one is given.' },
  ],

  sections: [
    { title: 'Inputs', steps: [
      { id: 'in', title: 'Problem data', fig: ['fig12-41'],
        text: 'Radial load, journal speed, design factor and the temperature limits. Fizz pp. 93-94: use <i>T<sub>∞</sub></i> = 70 °F, ' +
          '<i>ħ<sub>CR</sub></i> = 2.7 Btu/(h·ft²·°F) and <i>J</i> = 778 ft·lbf/Btu unless the question gives other values; <i>T<sub>f</sub></i> left blank uses the material temperature limit (300 °F for Oiles 500 SP).',
        vars: [
          { id: 'F', symbol: 'F', label: 'Radial load', unit: 'lbf', kind: 'input' },
          { id: 'N', symbol: 'N', label: 'Journal speed', unit: 'rev/min', kind: 'input' },
          { id: 'nd', symbol: 'n_d', label: 'Design factor', unit: '', kind: 'input', default: 1, hint: 'applied to F everywhere (Shigley uses n_d F); Ex. 12-10 uses 2' },
          { id: 'Tf', symbol: 'T_f', label: 'Max. lubricant / bushing temperature', unit: '°F', kind: 'input', auto: v => v.Tlim, hint: 'blank → material limit T_max (300 °F for Oiles 500 SP, Table 12-11)' },
          { id: 'Tinf', symbol: 'T_\\infty', label: 'Ambient temperature', unit: '°F', kind: 'input', default: 70 },
          { id: 'hCR', symbol: '\\hbar_{CR}', label: 'Combined heat-transfer coefficient', unit: 'Btu/(h·ft²·°F)', kind: 'input', default: 2.7 },
          { id: 'J', symbol: 'J', label: 'Mechanical equivalent of heat', unit: 'ft·lbf/Btu', kind: 'input', default: 778 },
          { id: 'Dj', symbol: 'D_j', label: 'Shaft (journal) diameter, if given', unit: 'in', kind: 'input', hint: 'optional — bushing ID must be ≥ this' },
        ] },
      { id: 'mat', title: 'Material data (Step 1)', fig: ['t12-9', 't12-10', 't12-8', 't12-11'],
        text: 'Read the wear factor <i>K</i>, the limiting <i>PV</i> and the friction coefficient <i>f<sub>s</sub></i> for the bushing material. ' +
          'The service limits default to Oiles 500 SP (Table 12-11); overwrite them from Table 12-8 for other materials.',
        vars: [
          { id: 'mat', label: 'Bushing material', kind: 'choice', type: 'text', default: 'Oiles 500',
            options: ['Oiles 500', 'Oiles 800', 'Polyactal copolymer', 'Polyactal homopolymer', '66 nylon', '66 nylon + 15% PTFE', '66 nylon + 15% PTFE + 30% glass', '66 nylon + 2.5% MoS2', '6 nylon', 'Polycarbonate + 15% PTFE', 'Sintered bronze', 'Phenol + 25% glass fiber', 'other (Table 12-8)'] },
          { id: 'K', symbol: 'K', label: 'Wear factor', unit: 'in³·min/(lbf·ft·h)', kind: 'lookup', fig: 't12-9', hint: 'e.g. 0.6e-10 for Oiles 500',
            auto: v => ({ 'Oiles 500': 0.6e-10, 'Oiles 800': 3e-10, 'Polyactal copolymer': 50e-10, 'Polyactal homopolymer': 60e-10, '66 nylon': 200e-10, '66 nylon + 15% PTFE': 13e-10, '66 nylon + 15% PTFE + 30% glass': 16e-10, '66 nylon + 2.5% MoS2': 200e-10, '6 nylon': 200e-10, 'Polycarbonate + 15% PTFE': 75e-10, 'Sintered bronze': 102e-10, 'Phenol + 25% glass fiber': 8e-10 })[v.mat] },
          { id: 'PVlim', symbol: '(PV)_{lim}', label: 'Limiting PV', unit: 'psi·ft/min', kind: 'lookup', fig: 't12-9',
            auto: v => ({ 'Oiles 500': 46700, 'Oiles 800': 18000, 'Polyactal copolymer': 5000, 'Polyactal homopolymer': 3000, '66 nylon': 2000, '66 nylon + 15% PTFE': 7000, '66 nylon + 15% PTFE + 30% glass': 10000, '66 nylon + 2.5% MoS2': 2000, '6 nylon': 2000, 'Polycarbonate + 15% PTFE': 7000, 'Sintered bronze': 8500, 'Phenol + 25% glass fiber': 11500 })[v.mat] },
          { id: 'fs', symbol: 'f_s', label: 'Coefficient of friction', unit: '', kind: 'lookup', fig: 't12-10', default: 0.03, hint: 'Oiles 500SP / 300 / 2000 / Drymet: 0.03; Oiles 80 / Toughmet / Cermet: 0.05' },
          { id: 'Pmaxlim', symbol: 'P_{max,lim}', label: 'Allowable characteristic pressure', unit: 'psi', kind: 'lookup', fig: 't12-11', default: 3560, hint: 'Table 12-11 (Oiles 500 SP) or "Maximum load" column of Table 12-8' },
          { id: 'Vlim', symbol: 'V_{max}', label: 'Allowable velocity', unit: 'ft/min', kind: 'lookup', fig: 't12-11', default: 100, hint: 'Table 12-11 (Oiles 500 SP) or "Maximum speed" column of Table 12-8' },
          { id: 'Tlim', symbol: 'T_{max}', label: 'Allowable temperature', unit: '°F', kind: 'lookup', fig: 't12-11', default: 300 },
        ],
        after: v => (H.has(v, 'Tf', 'Tlim') && v.Tf > v.Tlim) ? '<span class="result-bad">T_f exceeds the material temperature limit</span>' : '' },
    ] },

    { title: 'Sizing', steps: [
      { id: 'lmin', title: 'Minimum bushing length from temperature rise (Step 2)', eq: '12-49', fig: ['t12-10'],
        formula: 'L \\ge \\frac{720\\, f_s\\, n_d F N}{J\\, \\hbar_{CR}\\,(T_f - T_\\infty)}',
        text: 'Equation (12-49) with <i>n<sub>d</sub>F</i> in place of <i>F</i> (Shigley Ex. 12-10). It assumes a pillow-block housing with surface area ≈ 2π<i>DL</i>/144 ft².',
        vars: [
          { id: 'Lmin', symbol: 'L_{min}', label: 'Minimum length', unit: 'in', kind: 'calc', digits: 4,
            compute: v => H.has(v, 'fs', 'nd', 'F', 'N', 'J', 'hCR', 'Tf', 'Tinf') && v.Tf > v.Tinf ? 720 * v.fs * v.nd * v.F * v.N / (v.J * v.hCR * (v.Tf - v.Tinf)) : undefined,
            work: v => v.Lmin !== undefined ? '\\(L_{min} = \\dfrac{720(' + H.fmt(v.fs) + ')(' + H.fmt(v.nd) + ')(' + H.fmt(v.F) + ')(' + H.fmt(v.N) + ')}{' + H.fmt(v.J) + '(' + H.fmt(v.hCR) + ')(' + H.fmt(v.Tf) + '-' + H.fmt(v.Tinf) + ')} = ' + H.fmt(v.Lmin) + '\\text{ in}\\)' : null,
            check: v => (H.has(v, 'Tf', 'Tinf') && v.Tf <= v.Tinf) ? 'T_f must exceed T_∞' : null },
        ] },
      { id: 'sel', title: 'Select a stock bushing (Step 3)', fig: ['t12-12'],
        text: 'From Table 12-12 choose ID, OD and L such that <i>L ≥ L<sub>min</sub></i> and ID ≥ shaft diameter (if given). ' +
          'Fizz tip: start with the smallest bushing that satisfies the length, then move up if a later check fails.',
        vars: [
          { id: 'ID', symbol: 'ID = D', label: 'Bushing inner diameter', unit: 'in', kind: 'lookup', fig: 't12-12',
            check: v => (H.has(v, 'ID', 'Dj') && v.ID < v.Dj) ? 'ID is smaller than the shaft diameter — pick a larger ID' : null },
          { id: 'OD', symbol: 'OD', label: 'Bushing outer diameter', unit: 'in', kind: 'lookup', fig: 't12-12' },
          { id: 'L', symbol: 'L', label: 'Bushing length', unit: 'in', kind: 'lookup', fig: 't12-12',
            check: v => (H.has(v, 'L', 'Lmin') && v.L < v.Lmin) ? 'L < Lmin — choose a longer bushing' : null },
        ] },
      { id: 'ld', title: 'Length-to-diameter ratio (Step 4)', eq: '12-44', formula: '0.5 \\le L/D \\le 2',
        vars: [
          { id: 'LD', symbol: 'L/D', label: 'L/D ratio', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'L', 'ID') && v.ID > 0 ? v.L / v.ID : undefined,
            check: v => (v.LD !== undefined && (v.LD < 0.5 || v.LD > 2)) ? 'Outside 0.5 ≤ L/D ≤ 2 (Eq. 12-44) — choose another bushing' : null },
        ],
        after: v => v.LD === undefined ? '' : (v.LD >= 0.5 && v.LD <= 2) ? '<span class="result-ok">L/D = ' + H.fmt(v.LD, 3) + ' is within 0.5–2 ✔</span>' : '<span class="result-bad">L/D = ' + H.fmt(v.LD, 3) + ' is outside 0.5–2 ✘ — e.g. Shigley Ex. 12-10 rejected ID 5/8 × L 1½ (L/D = 2.4) and took ID ¾ × L 1½ (L/D = 2).</span>' },
    ] },

    { title: 'Verification (Steps 5–10)', steps: [
      { id: 'pmax', title: 'Characteristic (peak) pressure', eq: '12-42', fig: ['fig12-40', 't12-11'],
        formula: 'P_{max} = \\frac{4}{\\pi}\\,\\frac{n_d F}{D L}',
        text: 'The cosine pressure distribution of Fig. 12-40 peaks at 4/π times the nominal pressure. Must be below <i>P<sub>max,lim</sub></i>.',
        vars: [
          { id: 'Pmax', symbol: 'P_{max}', label: 'Characteristic pressure', unit: 'psi', kind: 'calc', digits: 4,
            compute: v => H.has(v, 'nd', 'F', 'ID', 'L') && v.ID * v.L > 0 ? 4 / Math.PI * v.nd * v.F / (v.ID * v.L) : undefined,
            work: v => v.Pmax !== undefined ? '\\(P_{max} = \\dfrac{4}{\\pi}\\dfrac{' + H.fmt(v.nd) + '(' + H.fmt(v.F) + ')}{' + H.fmt(v.ID) + '(' + H.fmt(v.L) + ')} = ' + H.fmt(v.Pmax) + '\\text{ psi}\\)' : null },
        ],
        after: v => (v.Pmax === undefined || v.Pmaxlim === undefined) ? '' : v.Pmax < v.Pmaxlim ? '<span class="result-ok">' + H.fmt(v.Pmax) + ' psi &lt; ' + H.fmt(v.Pmaxlim) + ' psi ✔</span>' : '<span class="result-bad">' + H.fmt(v.Pmax) + ' psi ≥ ' + H.fmt(v.Pmaxlim) + ' psi ✘ — larger bushing needed</span>' },
      { id: 'pnom', title: 'Nominal pressure', eq: '12-39', formula: 'P = \\frac{n_d F}{D L}',
        vars: [
          { id: 'P', symbol: 'P', label: 'Nominal pressure', unit: 'psi', kind: 'calc', digits: 4,
            compute: v => H.has(v, 'nd', 'F', 'ID', 'L') && v.ID * v.L > 0 ? v.nd * v.F / (v.ID * v.L) : undefined,
            work: v => v.P !== undefined ? '\\(P = \\dfrac{' + H.fmt(v.nd) + '(' + H.fmt(v.F) + ')}{' + H.fmt(v.ID) + '(' + H.fmt(v.L) + ')} = ' + H.fmt(v.P) + '\\text{ psi}\\)' : null },
        ] },
      { id: 'vel', title: 'Surface velocity', eq: '12-40', formula: 'V = \\frac{\\pi D N}{12}', fig: ['t12-11'],
        vars: [
          { id: 'V', symbol: 'V', label: 'Sliding velocity', unit: 'ft/min', kind: 'calc', digits: 4,
            compute: v => H.has(v, 'ID', 'N') ? Math.PI * v.ID * v.N / 12 : undefined,
            work: v => v.V !== undefined ? '\\(V = \\dfrac{\\pi(' + H.fmt(v.ID) + ')(' + H.fmt(v.N) + ')}{12} = ' + H.fmt(v.V) + '\\text{ ft/min}\\)' : null },
        ],
        after: v => (v.V === undefined || v.Vlim === undefined) ? '' : v.V < v.Vlim ? '<span class="result-ok">' + H.fmt(v.V) + ' &lt; ' + H.fmt(v.Vlim) + ' ft/min ✔</span>' : '<span class="result-bad">' + H.fmt(v.V) + ' ≥ ' + H.fmt(v.Vlim) + ' ft/min ✘</span>' },
      { id: 'pv', title: 'PV product', eq: '12-41', formula: 'PV = P \\, V = \\frac{\\pi}{12}\\frac{n_d F N}{L}', fig: ['t12-9', 't12-11'],
        text: 'Note PV is independent of <i>D</i> (Eq. 12-41) — only a longer bushing lowers it.',
        vars: [
          { id: 'PV', symbol: 'PV', label: 'PV product', unit: 'psi·ft/min', kind: 'calc', digits: 5,
            compute: v => H.has(v, 'P', 'V') ? v.P * v.V : undefined,
            work: v => v.PV !== undefined ? '\\(PV = ' + H.fmt(v.P) + '(' + H.fmt(v.V) + ') = ' + H.fmt(v.PV, 5) + '\\text{ psi·ft/min}\\)' : null },
        ],
        after: v => (v.PV === undefined || v.PVlim === undefined) ? '' : v.PV < v.PVlim ? '<span class="result-ok">' + H.fmt(v.PV, 5) + ' &lt; ' + H.fmt(v.PVlim, 5) + ' ✔</span>' : '<span class="result-bad">' + H.fmt(v.PV, 5) + ' ≥ ' + H.fmt(v.PVlim, 5) + ' ✘ — increase L</span>' },
      { id: 'wear', title: 'Linear wear (Step 10 — only if a wear limit is given)', eq: '12-43', fig: ['fig12-39', 't12-9'],
        formula: 'w = K\\,P_{max} V t = \\frac{K\\, n_d F N t}{3L}',
        text: 'Uses the peak pressure (Eq. 12-42) in the wear law (12-38). Leave <i>t</i> blank if the question gives no wear requirement.',
        vars: [
          { id: 't', symbol: 't', label: 'Operating time', unit: 'h', kind: 'input' },
          { id: 'wmax', symbol: 'w_{max}', label: 'Allowable wear', unit: 'in', kind: 'input' },
          { id: 'w', symbol: 'w', label: 'Radial wear', unit: 'in', kind: 'calc', digits: 4,
            compute: v => H.has(v, 'K', 'nd', 'F', 'N', 't', 'L') && v.L > 0 ? v.K * v.nd * v.F * v.N * v.t / (3 * v.L) : undefined,
            work: v => v.w !== undefined ? '\\(w = \\dfrac{' + H.fmt(v.K) + '(' + H.fmt(v.nd) + ')(' + H.fmt(v.F) + ')(' + H.fmt(v.N) + ')(' + H.fmt(v.t) + ')}{3(' + H.fmt(v.L) + ')} = ' + H.fmt(v.w) + '\\text{ in}\\)' : null },
          { id: 'tlife', symbol: 't_{w}', label: 'Hours to reach w_max (inverse, Ex. 12-9)', unit: 'h', kind: 'calc', digits: 4,
            compute: v => H.has(v, 'K', 'nd', 'F', 'N', 'wmax', 'L') && v.K * v.nd * v.F * v.N > 0 ? 3 * v.L * v.wmax / (v.K * v.nd * v.F * v.N) : undefined },
        ],
        after: v => (v.w === undefined || v.wmax === undefined) ? '' : v.w < v.wmax ? '<span class="result-ok">w = ' + H.fmt(v.w) + ' in &lt; ' + H.fmt(v.wmax) + ' in ✔</span>' : '<span class="result-bad">w = ' + H.fmt(v.w) + ' in ≥ ' + H.fmt(v.wmax) + ' in ✘ — increase L or choose a lower-K material</span>' },
    ] },

    { title: 'Result', steps: [
      { id: 'res', title: 'Summary (Step 11)', fig: ['t12-12'],
        vars: [
          { id: 'ok', label: 'All checks', kind: 'calc', compute: v => {
            if (!H.has(v, 'Pmax', 'V', 'PV', 'LD')) return undefined;
            const bad = [];
            if (v.L < v.Lmin) bad.push('L<Lmin');
            if (v.LD < 0.5 || v.LD > 2) bad.push('L/D');
            if (v.Pmax >= v.Pmaxlim) bad.push('Pmax');
            if (v.V >= v.Vlim) bad.push('V');
            if (v.PV >= v.PVlim) bad.push('PV');
            if (v.w !== undefined && v.wmax !== undefined && v.w >= v.wmax) bad.push('wear');
            if (H.has(v, 'Dj') && v.ID < v.Dj) bad.push('ID<Dj');
            return bad.length ? 'FAIL: ' + bad.join(', ') : 'PASS';
          } },
        ],
        after: v => v.ok === undefined ? '' : v.ok === 'PASS'
          ? '<span class="result-ok">Acceptable bushing: ID = ' + H.fmt(v.ID) + ' in, OD = ' + H.fmt(v.OD) + ' in, L = ' + H.fmt(v.L) + ' in (' + (v.mat || '') + '). All service-range limits satisfied.</span>'
          : '<span class="result-bad">' + v.ok + ' — go back to Step 3 and select a larger / longer bushing or a different material.</span>' },
    ] },
  ],
};
