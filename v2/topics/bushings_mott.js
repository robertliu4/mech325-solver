/* Boundary-lubricated plain bearings — Mott 6e Ch. 16 Sec. 16-5 (pV method).
 * Fizz bible pp. 92-95 follows Shigley's Oiles procedure; this file keeps the same step order but uses Mott's
 * symbols (p, V, pV), Mott's design rule (design pV = 2·pV, material from Table 16-1) and Fig. 16-4 clearance.
 * Steps the Fizz bible needs that Mott lacks (thermal Lmin, wear factor K, Oiles limits) use Shigley tables flagged book:'shigley'. */
window.TOPIC = {
  id: 'bushings', book: 'mott',
  title: 'Bushings — Boundary-Lubricated Bearings',
  subtitle: 'Mott Ch. 16 Sec. 16-5 · Fizz pp. 92-95 · pV method',
  sibling: 'bushings_shigley.html',
  intro: 'Mott designs a boundary-lubricated bearing by trial diameter and <i>L/D</i>: compute bearing pressure <i>p = F/(LD)</i>, journal speed <i>V = πDn/12</i>, ' +
    'the product <i>pV</i>, double it for a design value, and choose a material from Table 16-1 whose rated <i>pV</i> exceeds it (Example Problems 16-1, 16-2). ' +
    'The Fizz bible (p. 93) instead starts from Shigley\'s thermal minimum-length equation and Oiles tables; those steps are included below with the Shigley tables so either exam style works. ' +
    'U.S. units: lb, rpm, in, psi, ft/min (SI alternative noted where Mott gives it).',
  example: { F: 150, n: 500, Dmin: 1.5, D: 1.5, LD: 1.0, L: 1.5, nd: 1, fs: 0.03, Tf: '', Tinf: 70, hCR: 2.7, J: 778, pVrated: 30000, matName: 'Babbitt high-tin (89%)', rule: 'Mott: rated ≥ 2·pV', Cd: 0.002 },

  figures: [
    { id: 'fig16-1', ref: 'Figure 16-1', title: 'Bearing geometry: journal, bearing, radial clearance Cr = (Db − Dj)/2, diametral clearance Cd = Db − Dj', src: 'figures/mott/fig16-1.png', page: 632 },
    { id: 'proc', ref: 'Procedure 16-5', title: 'Mott design procedure for boundary-lubricated plain surface bearings (Steps 1-11)', src: 'figures/mott/proc16-5.png', page: 638 },
    { id: 't16-1', ref: 'Table 16-1', title: 'Typical performance parameters (rated pV) for bearing materials in boundary lubrication', src: 'figures/mott/table16-1.png', page: 637,
      note: 'Choose the first material whose rated pV ≥ design pV = 2·(pV). psi·fpm and MPa·m/s columns; 1 psi·fpm = 3.50×10⁻⁵ MPa·m/s.' },
    { id: 'fig16-4', ref: 'Figure 16-4', title: 'Minimum recommended diametral clearance vs journal diameter and speed', src: 'figures/mott/fig16-4.png', page: 638,
      note: 'Rule of thumb: 0.001 in clearance per inch of journal diameter.' },
    { id: 't12-9', ref: 'Table 12-9', book: 'shigley', title: 'Wear factors K and limiting PV (Oiles materials) — used by the Fizz thermal/wear steps', src: 'figures/shigley/table12-9.png', page: 693 },
    { id: 't12-10', ref: 'Table 12-10', book: 'shigley', title: 'Coefficients of friction fs — needed for the Fizz minimum-length equation', src: 'figures/shigley/table12-10.png', page: 693 },
    { id: 't12-11', ref: 'Table 12-11', book: 'shigley', title: 'Oiles 500 SP service range (Pmax < 3560 psi, V < 100 ft/min, PV < 46 700)', src: 'figures/shigley/table12-11.png', page: 695 },
    { id: 't12-12', ref: 'Table 12-12', book: 'shigley', title: 'Available bushing sizes (ID / OD / L, inches)', src: 'figures/shigley/table12-12.png', page: 697 },
  ],

  sections: [
    { title: 'Inputs', steps: [
      { id: 'in', title: 'Given information', fig: ['fig16-1', 'proc'],
        text: 'Mott: radial load <i>F</i>, speed <i>n</i> and the nominal minimum shaft diameter <i>D<sub>min</sub></i> (from the shaft stress/deflection analysis). ' +
          'Fizz additionally uses a design factor <i>n<sub>d</sub></i> on the load and the temperature data for the minimum-length equation.',
        vars: [
          { id: 'F', symbol: 'F', label: 'Radial load', unit: 'lb', kind: 'input' },
          { id: 'n', symbol: 'n', label: 'Rotational speed', unit: 'rpm', kind: 'input' },
          { id: 'Dmin', symbol: 'D_{min}', label: 'Minimum acceptable journal diameter', unit: 'in', kind: 'input', hint: 'optional' },
          { id: 'nd', symbol: 'n_d', label: 'Design factor on load (Fizz / Shigley)', unit: '', kind: 'input', default: 1 },
        ] },
      { id: 'thermal', title: 'Fizz Step 2 — minimum length from temperature rise (Shigley Eq. 12-49)', fig: ['t12-10'],
        formula: 'L \\ge \\frac{720\\, f_s\\, n_d F n}{J\\, \\hbar_{CR}\\,(T_f - T_\\infty)}',
        text: 'Mott has no equivalent; the Fizz bible always runs this first. Defaults <i>T<sub>∞</sub></i> = 70 °F, <i>ħ<sub>CR</sub></i> = 2.7, <i>J</i> = 778. Skip (leave <i>T<sub>f</sub></i> blank) if the problem is a pure Mott pV design.',
        vars: [
          { id: 'fs', symbol: 'f_s', label: 'Coefficient of friction', unit: '', kind: 'lookup', fig: 't12-10', default: 0.03 },
          { id: 'Tf', symbol: 'T_f', label: 'Max. bearing temperature', unit: '°F', kind: 'input' },
          { id: 'Tinf', symbol: 'T_\\infty', label: 'Ambient temperature', unit: '°F', kind: 'input', default: 70 },
          { id: 'hCR', symbol: '\\hbar_{CR}', label: 'Heat-transfer coefficient', unit: 'Btu/(h·ft²·°F)', kind: 'input', default: 2.7 },
          { id: 'J', symbol: 'J', label: 'Mechanical equivalent of heat', unit: 'ft·lbf/Btu', kind: 'input', default: 778 },
          { id: 'Lmin', symbol: 'L_{min}', label: 'Minimum length', unit: 'in', kind: 'calc', digits: 4,
            compute: v => H.has(v, 'fs', 'nd', 'F', 'n', 'J', 'hCR', 'Tf', 'Tinf') && v.Tf > v.Tinf ? 720 * v.fs * v.nd * v.F * v.n / (v.J * v.hCR * (v.Tf - v.Tinf)) : undefined,
            work: v => v.Lmin !== undefined ? '\\(L_{min} = \\dfrac{720(' + H.fmt(v.fs) + ')(' + H.fmt(v.nd) + ')(' + H.fmt(v.F) + ')(' + H.fmt(v.n) + ')}{' + H.fmt(v.J) + '(' + H.fmt(v.hCR) + ')(' + H.fmt(v.Tf) + '-' + H.fmt(v.Tinf) + ')} = ' + H.fmt(v.Lmin) + '\\text{ in}\\)' : null },
        ] },
    ] },

    { title: 'Geometry (Mott Steps 1–4)', steps: [
      { id: 'geo', title: 'Trial diameter, L/D ratio and length', fig: ['t12-12'],
        text: 'Mott Step 1: try <i>D = D<sub>min</sub></i> (or the next convenient size). Step 2: pick <i>L/D</i> in 0.5–2.0 — Mott recommends <i>L/D</i> = 1 for dry or oil-impregnated porous bearings and 1.5 for carbon-graphite. ' +
          'Step 3: <i>L = D(L/D)</i>. Step 4: round <i>L</i> to a convenient (stock) value — if the question gives a catalogue, use Shigley Table 12-12 sizes and make sure <i>L ≥ L<sub>min</sub></i>.',
        vars: [
          { id: 'D', symbol: 'D', label: 'Trial bearing (journal) diameter', unit: 'in', kind: 'input',
            check: v => (H.has(v, 'D', 'Dmin') && v.D < v.Dmin) ? 'D is below the minimum shaft diameter' : null },
          { id: 'LD', symbol: 'L/D', label: 'Target length-to-diameter ratio', unit: '', kind: 'input', default: 1,
            check: v => (v.LD !== undefined && (v.LD < 0.5 || v.LD > 2)) ? 'Mott recommends 0.5 ≤ L/D ≤ 2.0' : null },
          { id: 'Lnom', symbol: 'L_{nom}', label: 'Nominal length D·(L/D)', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'D', 'LD') ? v.D * v.LD : undefined },
          { id: 'L', symbol: 'L', label: 'Specified bearing length (convenient value)', unit: 'in', kind: 'input', hint: 'defaults to Lnom if blank', auto: v => v.Lnom,
            check: v => (H.has(v, 'L', 'Lmin') && v.L < v.Lmin) ? 'L < Lmin from the thermal equation' : null },
          { id: 'LDact', symbol: 'L/D', label: 'Actual L/D', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'L', 'D') && v.D > 0 ? v.L / v.D : undefined,
            check: v => (v.LDact !== undefined && (v.LDact < 0.5 || v.LDact > 2)) ? 'Actual L/D outside 0.5–2' : null },
        ] },
    ] },

    { title: 'pV analysis (Mott Steps 5–9)', steps: [
      { id: 'p', title: 'Bearing pressure', eq: '16-1', formula: 'p = \\frac{n_d F}{L D}',
        text: 'Projected-area pressure. Mott uses <i>F</i> directly; with the Fizz design factor the load is <i>n<sub>d</sub>F</i>. (SI: N and mm → MPa.)',
        vars: [
          { id: 'p', symbol: 'p', label: 'Bearing pressure', unit: 'psi', kind: 'calc', digits: 4,
            compute: v => H.has(v, 'nd', 'F', 'L', 'D') && v.L * v.D > 0 ? v.nd * v.F / (v.L * v.D) : undefined,
            work: v => v.p !== undefined ? '\\(p = \\dfrac{' + H.fmt(v.nd) + '(' + H.fmt(v.F) + ')}{' + H.fmt(v.L) + '(' + H.fmt(v.D) + ')} = ' + H.fmt(v.p) + '\\text{ psi}\\)' : null },
          { id: 'pmax', symbol: 'p_{max}', label: 'Peak pressure (4/π)·p — Fizz / Shigley Eq. 12-42 check', unit: 'psi', kind: 'calc', digits: 4, compute: v => v.p !== undefined ? 4 / Math.PI * v.p : undefined },
        ] },
      { id: 'V', title: 'Linear speed of the journal surface', formula: 'V = \\frac{\\pi D n}{12}\\ \\text{ft/min} \\qquad \\left(V = \\frac{\\pi D n}{60\\,000}\\ \\text{m/s with } D \\text{ in mm}\\right)',
        text: '1.0 ft/min = 0.005 08 m/s; 1.0 m/s = 197 ft/min.',
        vars: [
          { id: 'V', symbol: 'V', label: 'Journal surface speed', unit: 'ft/min', kind: 'calc', digits: 4,
            compute: v => H.has(v, 'D', 'n') ? Math.PI * v.D * v.n / 12 : undefined,
            work: v => v.V !== undefined ? '\\(V = \\dfrac{\\pi(' + H.fmt(v.D) + ')(' + H.fmt(v.n) + ')}{12} = ' + H.fmt(v.V) + '\\text{ ft/min}\\)' : null },
        ] },
      { id: 'pV', title: 'pV factor and design value', formula: 'pV = p\\,V \\qquad (pV)_{design} = 2\\,(pV)',
        text: 'Mott Step 8: a practical design value is one-half of the limiting pV, so the material must be rated at ≥ 2·(pV). (1 psi·fpm = 3.50×10⁻⁵ MPa·m/s.)',
        vars: [
          { id: 'pV', symbol: 'pV', label: 'pV factor', unit: 'psi·fpm', kind: 'calc', digits: 5,
            compute: v => H.has(v, 'p', 'V') ? v.p * v.V : undefined,
            work: v => v.pV !== undefined ? '\\(pV = ' + H.fmt(v.p) + '(' + H.fmt(v.V) + ') = ' + H.fmt(v.pV, 5) + '\\text{ psi·fpm}\\)' : null },
          { id: 'pVdes', symbol: '(pV)_{design}', label: 'Design value 2·pV', unit: 'psi·fpm', kind: 'calc', digits: 5, compute: v => v.pV !== undefined ? 2 * v.pV : undefined },
          { id: 'pVSI', symbol: '(pV)_{design}', label: 'Design value in SI', unit: 'MPa·m/s', kind: 'calc', digits: 4, compute: v => v.pVdes !== undefined ? v.pVdes * 3.5e-5 : undefined },
        ] },
      { id: 'mat', title: 'Specify a material (Mott Step 9)', fig: ['t16-1', 't12-9', 't12-11'],
        text: 'From Table 16-1 pick a material with rated <i>pV</i> ≥ (<i>pV</i>)<sub>design</sub>. Fizz/Oiles style instead: compare the un-doubled <i>pV</i> to the limiting PV of Table 12-9 (e.g. 46 700 for Oiles 500) and also check <i>p<sub>max</sub></i> &lt; 3560 psi and <i>V</i> &lt; 100 ft/min (Table 12-11).',
        vars: [
          { id: 'matName', label: 'Material chosen', kind: 'input', type: 'text', hint: 'e.g. Babbitt high-tin, Porous bronze, Oiles 500' },
          { id: 'pVrated', symbol: '(pV)_{rated}', label: 'Rated / limiting pV of the material', unit: 'psi·fpm', kind: 'lookup', fig: 't16-1' },
          { id: 'rule', label: 'Acceptance rule', kind: 'choice', type: 'text', default: 'Mott: rated ≥ 2·pV', options: ['Mott: rated ≥ 2·pV', 'Fizz/Oiles: limit > pV'] },
          { id: 'Plim', symbol: 'p_{max,lim}', label: 'Max. pressure limit (Oiles style only)', unit: 'psi', kind: 'lookup', fig: 't12-11', default: 3560 },
          { id: 'Vlim', symbol: 'V_{max}', label: 'Max. velocity limit (Oiles style only)', unit: 'ft/min', kind: 'lookup', fig: 't12-11', default: 100 },
        ],
        after: v => {
          if (!H.has(v, 'pV', 'pVrated')) return '';
          const mott = v.rule !== 'Fizz/Oiles: limit > pV';
          const ok = mott ? v.pVrated >= v.pVdes : (v.pV < v.pVrated && (v.Plim === undefined || v.pmax < v.Plim) && (v.Vlim === undefined || v.V < v.Vlim));
          return ok ? '<span class="result-ok">' + (v.matName || 'Material') + ' is adequate: rated pV ' + H.fmt(v.pVrated, 5) + ' vs ' + (mott ? 'design 2·pV = ' + H.fmt(v.pVdes, 5) : 'pV = ' + H.fmt(v.pV, 5)) + ' ✔</span>'
            : '<span class="result-bad">Not adequate — pick a higher-pV material from Table 16-1 or enlarge D / L (Mott Ex. 16-2 alternate design).</span>';
        } },
    ] },

    { title: 'Wear & clearance (Mott Steps 10–11, Fizz Step 10)', steps: [
      { id: 'wear', title: 'Linear wear (if a wear limit is given — Shigley Eq. 12-43)', fig: ['t12-9'],
        formula: 'w = \\frac{K\\, n_d F n\\, t}{3L}',
        text: 'Mott does not give a wear equation; the Fizz bible uses Shigley\'s with the Oiles wear factor <i>K</i>. Leave blank if not required.',
        vars: [
          { id: 'K', symbol: 'K', label: 'Wear factor', unit: 'in³·min/(lbf·ft·h)', kind: 'lookup', fig: 't12-9', hint: 'Oiles 500: 0.6e-10' },
          { id: 't', symbol: 't', label: 'Operating time', unit: 'h', kind: 'input' },
          { id: 'wmax', symbol: 'w_{max}', label: 'Allowable wear', unit: 'in', kind: 'input' },
          { id: 'w', symbol: 'w', label: 'Radial wear', unit: 'in', kind: 'calc', digits: 4,
            compute: v => H.has(v, 'K', 'nd', 'F', 'n', 't', 'L') && v.L > 0 ? v.K * v.nd * v.F * v.n * v.t / (3 * v.L) : undefined,
            work: v => v.w !== undefined ? '\\(w = \\dfrac{' + H.fmt(v.K) + '(' + H.fmt(v.nd) + ')(' + H.fmt(v.F) + ')(' + H.fmt(v.n) + ')(' + H.fmt(v.t) + ')}{3(' + H.fmt(v.L) + ')} = ' + H.fmt(v.w) + '\\text{ in}\\)' : null },
        ],
        after: v => (v.w === undefined || v.wmax === undefined) ? '' : v.w < v.wmax ? '<span class="result-ok">w &lt; w_max ✔</span>' : '<span class="result-bad">w ≥ w_max ✘ — lengthen the bushing</span>' },
      { id: 'clr', title: 'Nominal diametral clearance', eq: '16-?', fig: ['fig16-4', 'fig16-1'],
        formula: 'C_d = D_b - D_j = 2C_r \\qquad C_d \\approx 0.001\\ \\text{in per inch of } D \\ \\text{(rule of thumb)}',
        text: 'Mott Step 11: read the minimum recommended clearance from Fig. 16-4 for the journal diameter and speed (Ex. 16-1: D = 1.50 in, 500 rpm → C<sub>d</sub> = 0.002 in).',
        vars: [
          { id: 'Cd', symbol: 'C_d', label: 'Diametral clearance', unit: 'in', kind: 'lookup', fig: 'fig16-4', auto: v => v.D ? 0.001 * v.D : undefined },
          { id: 'Cr', symbol: 'C_r', label: 'Radial clearance', unit: 'in', kind: 'calc', digits: 4, compute: v => v.Cd !== undefined ? v.Cd / 2 : undefined },
          { id: 'Db', symbol: 'D_b', label: 'Bearing bore = D + Cd', unit: 'in', kind: 'calc', digits: 5, compute: v => H.has(v, 'D', 'Cd') ? v.D + v.Cd : undefined },
        ] },
    ] },

    { title: 'Result', steps: [
      { id: 'res', title: 'Summary',
        vars: [
          { id: 'ok', label: 'Design status', kind: 'calc', compute: v => {
            if (!H.has(v, 'pV', 'pVrated')) return undefined;
            const mott = v.rule !== 'Fizz/Oiles: limit > pV';
            const bad = [];
            if (mott ? v.pVrated < v.pVdes : v.pV >= v.pVrated) bad.push('pV');
            if (!mott && v.Plim !== undefined && v.pmax >= v.Plim) bad.push('pmax');
            if (!mott && v.Vlim !== undefined && v.V >= v.Vlim) bad.push('V');
            if (v.Lmin !== undefined && v.L < v.Lmin) bad.push('L<Lmin');
            if (v.LDact < 0.5 || v.LDact > 2) bad.push('L/D');
            if (v.w !== undefined && v.wmax !== undefined && v.w >= v.wmax) bad.push('wear');
            return bad.length ? 'FAIL: ' + bad.join(', ') : 'PASS';
          } },
        ],
        after: v => v.ok === undefined ? '' : v.ok === 'PASS'
          ? '<span class="result-ok">Bearing: D = ' + H.fmt(v.D) + ' in, L = ' + H.fmt(v.L) + ' in, ' + (v.matName || 'material') + ' (rated pV ' + H.fmt(v.pVrated, 5) + ' psi·fpm)' + (v.Cd !== undefined ? ', C_d = ' + H.fmt(v.Cd) + ' in' : '') + '. ✔</span>'
          : '<span class="result-bad">' + v.ok + ' — revise D, L/D or material and recompute.</span>' },
    ] },
  ],
};
