// Roller chain — Mott Ch. 7-6 (merged Fizz §1.6 + Mech §8.3.4.1; Example Problems 7-5 / 7-6)
(function () {
  // Table 7-12: chain number → [pitch in, average tensile strength lb]
  const CHAIN = { 25: [0.25, 925], 35: [0.375, 2100], 41: [0.5, 2000], 40: [0.5, 3700], 50: [0.625, 6100], 60: [0.75, 8500], 80: [1.0, 14500], 100: [1.25, 24000], 120: [1.5, 34000], 140: [1.75, 46000], 160: [2.0, 58000], 180: [2.25, 80000], 200: [2.5, 95000], 240: [3.0, 130000] };
  // Table 7-17 service factors [hydraulic, electric/turbine, IC engine]
  const SF = { smooth: [1.0, 1.0, 1.2], moderate: [1.2, 1.3, 1.4], heavy: [1.4, 1.5, 1.7] };
  const DRV = { hydraulic: 0, electric: 1, engine: 2 };
  const STRAND = { 1: 1.0, 2: 1.7, 3: 2.5, 4: 3.3 };
  const pv = v => H.has(v, 'p') ? v.p : (CHAIN[v.chain] ? CHAIN[v.chain][0] : undefined);
  const N2v = v => H.has(v, 'N2') ? v.N2 : (H.has(v, 'N1', 'VR') ? Math.round(v.N1 * v.VR) : undefined);
  const Lc = v => { const N2 = N2v(v); return (H.has(v, 'CDt', 'N1') && N2 !== undefined) ? 2 * v.CDt + (v.N1 + N2) / 2 + (N2 - v.N1) ** 2 / (4 * Math.PI * Math.PI * v.CDt) : undefined; };

  window.TOPIC = {
    id: 'chains', book: 'mott',
    title: 'Roller Chain — Drive Design',
    subtitle: 'Mott Ch. 7-6 (Tables 7-12 … 7-18, Eqs. 7-18 … 7-22) · merged Fizz §1.6 + Mech §8.3.4',
    sibling: 'chains_shigley.html',
    intro: 'Mott\'s chain-drive design (Example Problem 7-5): service factor from Table 7-17 → design power → choose chain pitch and small-sprocket teeth from the horsepower-rating Tables 7-14 (No. 40), 7-15 (No. 60) and 7-16 (No. 80), which also give the lubrication type (multi-strand designs divide the design power by the strand factor 1.7/2.5/3.3) → N₂ = N₁·VR → pitch diameters (Eq. 7-20) → trial centre distance 30–50 pitches → chain length (Eq. 7-18, round to an even integer) → actual CD (Eq. 7-19) → wrap angles (Eqs. 7-21/7-22, θ₁ ≥ 120°) → factor of safety. Mech bible tip: "you can never go wrong with a No. 60 chain"; No. 40 often fails and No. 80 is usually overkill.',
    example: { P: 15, n1: 900, n2: 235, load: 'moderate', driver: 'engine', chain: 60, strands: 1, N1: 17, Prated: 21.96, lub: 'B', CDt: 40 },

    figures: [
      { id: 'fig7-33', ref: 'Figure 7-33', title: 'Basic arrangement of an industrial chain drive (tight/slack strands)', src: 'figures/mott/fig7-33.png', page: 295 },
      { id: 'fig7-4', ref: 'Figure 7-4', title: 'Belt/chain drive configuration — wrap angles, span, CD', src: 'figures/mott/fig7-4.png', page: 265 },
      { id: 'table7-12', ref: 'Table 7-12', title: 'U.S. roller chain sizes: pitch and average tensile strength', src: 'figures/mott/table7-12.png', page: 296, note: 'For a chain used in tension (lifting) use only 10 % of the average tensile strength.' },
      { id: 'table7-17', ref: 'Table 7-17', title: 'Service factors for chain drives (load type × driver)', src: 'figures/mott/table7-17.png', page: 303 },
      { id: 'table7-14', ref: 'Table 7-14', title: 'Horsepower ratings — single-strand No. 40 chain (teeth × rpm, lubrication zones)', src: 'figures/mott/table7-14.png', page: 300, note: 'Interpolate on rpm. Zones: Type A manual/drip, B bath/disc, C oil stream.' },
      { id: 'table7-15', ref: 'Table 7-15', title: 'Horsepower ratings — single-strand No. 60 chain', src: 'figures/mott/table7-15.png', page: 301 },
      { id: 'table7-16', ref: 'Table 7-16', title: 'Horsepower ratings — single-strand No. 80 chain', src: 'figures/mott/table7-16.png', page: 302 },
      { id: 'table7-18', ref: 'Table 7-18', title: 'Recommended lubricant for chain drives', src: 'figures/mott/table7-18.png', page: 303 },
      { id: 'fig7-36', ref: 'Figure 7-36', title: 'Lubrication methods: Type A drip, Type B bath/disc, Type C oil stream', src: 'figures/mott/fig7-36.png', page: 304 },
      { id: 'fig7-38', ref: 'Figure 7-38', title: 'Scale layouts of the Example 7-5 / 7-6 chain drives', src: 'figures/mott/fig7-38.png', page: 306 },
      { id: 'table17-20a', ref: 'Table 17-20 (a)', book: 'shigley', title: 'Shigley rating table for other chain numbers (25 … 60, 17 T)', src: 'figures/shigley/table17-20a.png', page: 934, note: 'Use when the chain is not No. 40/60/80 (Mott tabulates only those three).' },
      { id: 'table17-20b', ref: 'Table 17-20 (b)', book: 'shigley', title: 'Shigley rating table (80 … 240, 17 T)', src: 'figures/shigley/table17-20b.png', page: 935 },
    ],

    sections: [
      { title: 'Steps 1–2: design power and ratio', steps: [
        { id: 'in', title: 'Service factor and design power', fig: ['table7-17'], formula: 'P_{des} = SF \\cdot P,\\qquad VR = \\frac{n_1}{n_2}\\ (n_1 > n_2)',
          text: 'Pick the load type and driver; SF auto-fills from Table 7-17. If the output speed is a range, use its midpoint for VR.',
          vars: [
            { id: 'P', symbol: 'P', label: 'Power delivered to the chain drive', unit: 'hp', kind: 'input' },
            { id: 'n1', symbol: 'n_1', label: 'Small (driving) sprocket speed', unit: 'rpm', kind: 'input' },
            { id: 'n2', symbol: 'n_2', label: 'Desired output speed (midpoint of range)', unit: 'rpm', kind: 'input' },
            { id: 'load', label: 'Load type', kind: 'choice', type: 'text', options: [{ label: 'Smooth (agitators, fans, generators, centrifugal pumps, light conveyors)', value: 'smooth' }, { label: 'Moderate shock (bucket elevators, machine tools, cranes, heavy conveyors, mixers, recip. pumps)', value: 'moderate' }, { label: 'Heavy shock (punch presses, hammer mills, crushers, rolling mills, logging hoists)', value: 'heavy' }] },
            { id: 'driver', label: 'Type of driver', kind: 'choice', type: 'text', options: [{ label: 'Hydraulic drive', value: 'hydraulic' }, { label: 'Electric motor or turbine', value: 'electric' }, { label: 'Internal combustion engine, mechanical drive', value: 'engine' }] },
            { id: 'SF', symbol: 'SF', label: 'Service factor', unit: '', kind: 'lookup', fig: 'table7-17', auto: v => (SF[v.load] && DRV[v.driver] !== undefined) ? SF[v.load][DRV[v.driver]] : undefined },
            { id: 'Pdes', symbol: 'P_{des}', label: 'Design power', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'P', 'SF') ? v.P * v.SF : undefined,
              work: v => H.has(v, 'Pdes') ? '\\(P_{des} = ' + H.fmt(v.SF) + '(' + H.fmt(v.P) + ') = ' + H.fmt(v.Pdes) + '\\ \\text{hp}\\)' : null },
            { id: 'VR', symbol: 'VR', label: 'Desired ratio', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'n1', 'n2') ? v.n1 / v.n2 : undefined, check: v => (H.has(v, 'VR') && v.VR > 7) ? 'Ratio > 7: use two stages' : null },
          ] },
      ] },

      { title: 'Step 3: chain and small sprocket', steps: [
        { id: 'sel', title: 'Strands, chain number, N1 and rated power', fig: ['table7-12', 'table7-14', 'table7-15', 'table7-16', 'fig7-36'],
          formula: 'P_{per\\,strand} = \\frac{P_{des}}{\\text{strand factor}} \\le P_{rated}',
          text: 'For a single strand enter Table 7-14/15/16 at n₁ and read the rating for N₁ (≥ 17 teeth unless n₁ &lt; 100 rpm; also keep N₁·VR ≤ 120). Interpolate between rpm columns. For a smaller drive use 2/3/4 strands (factors 1.7/2.5/3.3, Example 7-6) and compare the rating with the power per strand. Note the lubrication-type zone of the table cell. Chains other than 40/60/80: use Shigley Table 17-20 (17 T) or a catalogue.',
          vars: [
            { id: 'strands', label: 'Number of strands', kind: 'choice', options: [1, 2, 3, 4], default: 1 },
            { id: 'sfac', symbol: '', label: 'Strand (power capacity) factor', unit: '', kind: 'calc', compute: v => STRAND[v.strands] },
            { id: 'Pstrand', symbol: 'P_{per\\,strand}', label: 'Required power per strand', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'Pdes', 'sfac') ? v.Pdes / v.sfac : undefined,
              work: v => (H.has(v, 'Pstrand') && v.strands > 1) ? '\\(P = ' + H.fmt(v.Pdes) + '/' + H.fmt(v.sfac) + ' = ' + H.fmt(v.Pstrand) + '\\ \\text{hp per strand}\\)' : null },
            { id: 'chain', label: 'Chain number', kind: 'choice', options: Object.keys(CHAIN).map(Number), default: 60 },
            { id: 'p', symbol: 'p', label: 'Chain pitch', unit: 'in', kind: 'lookup', fig: 'table7-12', auto: v => CHAIN[v.chain] ? CHAIN[v.chain][0] : undefined },
            { id: 'Ts', symbol: '', label: 'Average tensile strength', unit: 'lb', kind: 'lookup', fig: 'table7-12', auto: v => CHAIN[v.chain] ? CHAIN[v.chain][1] : undefined },
            { id: 'N1', symbol: 'N_1', label: 'Small sprocket teeth', unit: '', kind: 'input', default: 17,
              check: v => (H.has(v, 'N1') && v.N1 < 17 && (v.n1 || 101) >= 100) ? 'Minimum 17 teeth unless n1 < 100 rpm' : (H.has(v, 'N1', 'VR') && v.N1 * v.VR > 120) ? 'N1·VR > 120: large sprocket would exceed 120 teeth' : null },
            { id: 'Prated', symbol: 'P_{rated}', label: 'Rated power per strand (Table 7-14/15/16)', unit: 'hp', kind: 'lookup', fig: 'table7-15', check: v => (H.has(v, 'Prated', 'Pstrand') && v.Prated < v.Pstrand) ? 'Rated power below the required power per strand — larger chain, more teeth or more strands' : null },
            { id: 'lub', label: 'Lubrication type (from table zone)', kind: 'choice', type: 'text', options: [{ label: 'A — manual or drip', value: 'A' }, { label: 'B — bath or disc', value: 'B' }, { label: 'C — oil stream', value: 'C' }] },
          ] },
      ] },

      { title: 'Steps 4–6: sprockets', steps: [
        { id: 'spk', title: 'Large sprocket, actual output speed, pitch diameters', eq: '7-20', formula: 'N_2 = N_1 \\cdot VR\\ (\\text{integer}),\\qquad n_2 = n_1\\frac{N_1}{N_2},\\qquad PD = \\frac{p}{\\sin(180^\\circ/N)}',
          vars: [
            { id: 'N2', symbol: 'N_2', label: 'Large sprocket teeth', unit: '', kind: 'input', auto: v => H.has(v, 'N1', 'VR') ? Math.round(v.N1 * v.VR) : undefined, hint: 'auto = N1·VR rounded', check: v => (H.has(v, 'N2') && v.N2 > 120) ? 'More than 120 teeth' : null },
            { id: 'VRa', symbol: 'VR_{act}', label: 'Actual ratio', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'N1', 'N2') ? v.N2 / v.N1 : undefined },
            { id: 'n2a', symbol: 'n_{2,act}', label: 'Actual output speed', unit: 'rpm', kind: 'calc', compute: v => H.has(v, 'n1', 'N1', 'N2') ? v.n1 * v.N1 / v.N2 : undefined,
              work: v => H.has(v, 'n2a') ? '\\(n_2 = ' + H.fmt(v.n1) + '(' + v.N1 + '/' + v.N2 + ') = ' + H.fmt(v.n2a) + '\\ \\text{rpm}\\)' : null },
            { id: 'PD1', symbol: 'PD_1', label: 'Small sprocket pitch diameter', unit: 'in', kind: 'calc', compute: v => H.has(v, 'p', 'N1') ? v.p / Math.sin(Math.PI / v.N1) : undefined,
              work: v => H.has(v, 'PD1') ? '\\(PD_1 = \\frac{' + H.fmt(v.p) + '}{\\sin(180^\\circ/' + v.N1 + ')} = ' + H.fmt(v.PD1) + '\\ \\text{in}\\)' : null },
            { id: 'PD2', symbol: 'PD_2', label: 'Large sprocket pitch diameter', unit: 'in', kind: 'calc', compute: v => H.has(v, 'p', 'N2') ? v.p / Math.sin(Math.PI / v.N2) : undefined,
              work: v => H.has(v, 'PD2') ? '\\(PD_2 = \\frac{' + H.fmt(v.p) + '}{\\sin(180^\\circ/' + v.N2 + ')} = ' + H.fmt(v.PD2) + '\\ \\text{in}\\)' : null },
          ] },
      ] },

      { title: 'Steps 7–9: centre distance and chain length', steps: [
        { id: 'len', title: 'Nominal CD, chain length and actual CD', fig: ['fig7-4', 'fig7-38'], eq: '7-18, 7-19',
          formula: 'L_c = 2CD + \\frac{N_2+N_1}{2} + \\frac{(N_2-N_1)^2}{4\\pi^2 CD},\\qquad CD = \\frac14\\left[L_c - \\frac{N_2+N_1}{2} + \\sqrt{\\left(L_c - \\frac{N_2+N_1}{2}\\right)^2 - \\frac{8(N_2-N_1)^2}{4\\pi^2}}\\right]',
          text: 'All in pitches. Recommended CD 30–50 pitches (40 typical). Round L<sub>c</sub> to an even integer (Mott: an even number of pitches avoids an offset link), then recompute CD; the computed CD is a maximum (no sag) — provide adjustment.',
          vars: [
            { id: 'CDt', symbol: 'CD_{nom}', label: 'Nominal centre distance', unit: 'pitches', kind: 'input', default: 40, check: v => (H.has(v, 'CDt') && (v.CDt < 30 || v.CDt > 50)) ? 'Recommended 30–50 pitches' : null },
            { id: 'Lcc', symbol: 'L_c', label: 'Chain length (computed)', unit: 'pitches', kind: 'calc', compute: Lc,
              work: v => H.has(v, 'Lcc') ? '\\(L_c = 2(' + H.fmt(v.CDt) + ') + \\frac{' + v.N2 + '+' + v.N1 + '}{2} + \\frac{(' + v.N2 + '-' + v.N1 + ')^2}{4\\pi^2(' + H.fmt(v.CDt) + ')} = ' + H.fmt(v.Lcc) + '\\ \\text{pitches}\\)' : null },
            { id: 'Lc', symbol: 'L_c', label: 'Chain length used (even integer)', unit: 'pitches', kind: 'input', auto: v => { const l = Lc(v); return l !== undefined ? 2 * Math.round(l / 2) : undefined; }, hint: 'auto = nearest even integer' },
            { id: 'Lin', symbol: 'L_c', label: 'Chain length', unit: 'in', kind: 'calc', compute: v => H.has(v, 'Lc', 'p') ? v.Lc * v.p : undefined },
            { id: 'CD', symbol: 'CD', label: 'Actual centre distance', unit: 'pitches', kind: 'calc', compute: v => { if (!H.has(v, 'Lc', 'N1', 'N2')) return undefined; const q = v.Lc - (v.N1 + v.N2) / 2; const r = q * q - 8 * (v.N2 - v.N1) ** 2 / (4 * Math.PI * Math.PI); return r >= 0 ? 0.25 * (q + Math.sqrt(r)) : undefined; },
              work: v => H.has(v, 'CD') ? '\\(CD = \\frac14\\left[' + H.fmt(v.Lc) + ' - \\frac{' + v.N2 + '+' + v.N1 + '}{2} + \\sqrt{\\left(' + H.fmt(v.Lc) + ' - \\frac{' + v.N2 + '+' + v.N1 + '}{2}\\right)^2 - \\frac{8(' + v.N2 + '-' + v.N1 + ')^2}{4\\pi^2}}\\right] = ' + H.fmt(v.CD) + '\\ \\text{pitches}\\)' : null },
            { id: 'CDin', symbol: 'CD', label: 'Actual centre distance', unit: 'in', kind: 'calc', compute: v => H.has(v, 'CD', 'p') ? v.CD * v.p : undefined,
              work: v => H.has(v, 'CDin') ? '\\(CD = ' + H.fmt(v.CD) + '(' + H.fmt(v.p) + ') = ' + H.fmt(v.CDin) + '\\ \\text{in}\\)' : null },
          ] },
      ] },

      { title: 'Steps 10–11: wrap angles and result', steps: [
        { id: 'wrap', title: 'Angle of wrap on each sprocket', fig: ['fig7-4'], eq: '7-21, 7-22',
          formula: '\\theta_1 = 180^\\circ - 2\\sin^{-1}\\left[\\frac{PD_2 - PD_1}{2CD}\\right],\\qquad \\theta_2 = 180^\\circ + 2\\sin^{-1}\\left[\\frac{PD_2 - PD_1}{2CD}\\right]\\quad(CD\\ \\text{in inches})',
          vars: [
            { id: 'th1', symbol: '\\theta_1', label: 'Wrap on small sprocket', unit: '°', kind: 'calc', compute: v => H.has(v, 'PD1', 'PD2', 'CDin') ? 180 - 2 * H.deg(Math.asin((v.PD2 - v.PD1) / (2 * v.CDin))) : undefined,
              work: v => H.has(v, 'th1') ? '\\(\\theta_1 = 180^\\circ - 2\\sin^{-1}\\left[\\frac{' + H.fmt(v.PD2) + ' - ' + H.fmt(v.PD1) + '}{2(' + H.fmt(v.CDin) + ')}\\right] = ' + H.fmt(v.th1) + '^\\circ\\)' : null,
              check: v => (H.has(v, 'th1') && v.th1 < 120) ? 'θ1 < 120° — increase CD' : null },
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
