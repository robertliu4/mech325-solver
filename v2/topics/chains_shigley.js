// Roller chain — Shigley Ch. 17-5 (merged Fizz §1.6 + Mech §8.3.4; Example 17-5)
(function () {
  // Table 17-19: ANSI chain number → [pitch in, min tensile strength lbf, weight lbf/ft]
  const CHAIN = { 25: [0.25, 780, 0.09], 35: [0.375, 1760, 0.21], 41: [0.5, 1500, 0.25], 40: [0.5, 3130, 0.42], 50: [0.625, 4880, 0.69], 60: [0.75, 7030, 1.00], 80: [1.0, 12500, 1.71], 100: [1.25, 19500, 2.58], 120: [1.5, 28000, 3.87], 140: [1.75, 38000, 4.95], 160: [2.0, 50000, 6.61], 180: [2.25, 63000, 9.06], 200: [2.5, 78000, 10.96], 240: [3.0, 112000, 16.4] };
  const K2 = { 1: 1.0, 2: 1.7, 3: 2.5, 4: 3.3, 5: 3.9, 6: 4.6, 8: 6.0 };
  const Kr = no => (no === 25 || no === 35) ? 29 : (no === 41 ? 3.4 : 17);
  // helpers that fall back to the table / rounding so that auto-lookups do not depend on other autos (engine runs autos once)
  const pv = v => H.has(v, 'p') ? v.p : (CHAIN[v.chain] ? CHAIN[v.chain][0] : undefined);
  const N2v = v => H.has(v, 'N2') ? v.N2 : (H.has(v, 'N1', 'n1', 'n2') ? Math.round(v.N1 * v.n1 / v.n2) : undefined);
  const H1 = v => { const p = pv(v); return (H.has(v, 'n1') && p !== undefined) ? (v.chain === 41 ? 0.0022 : 0.004) * 17 ** 1.08 * v.n1 ** 0.9 * p ** (3 - 0.07 * p) : undefined; };
  const H2 = v => { const p = pv(v); return (H.has(v, 'n1') && p !== undefined) ? 1000 * Kr(v.chain) * 17 ** 1.5 * p ** 0.8 / v.n1 ** 1.5 : undefined; };
  const Lpc = v => { const N2 = N2v(v); return (H.has(v, 'Cp', 'N1') && N2 !== undefined) ? 2 * v.Cp + (v.N1 + N2) / 2 + (N2 - v.N1) ** 2 / (4 * Math.PI * Math.PI * v.Cp) : undefined; };

  window.TOPIC = {
    id: 'chains', book: 'shigley',
    title: 'Roller Chain — Selection & Geometry',
    subtitle: 'Shigley Ch. 17-5 (Tables 17-19 … 17-23, Eqs. 17-29 … 17-38) · merged Fizz §1.6 + Mech §8.3.4',
    sibling: 'chains_mott.html',
    intro: 'Shigley\'s roller-chain method (Example 17-5): design power H<sub>d</sub> = H<sub>nom</sub>K<sub>s</sub>n<sub>d</sub>, tabulated 17-tooth rating H<sub>tab</sub> from Table 17-20 (the auto estimate is min(H₁, H₂) of Eqs. 17-32/17-33, which is how the table was built), tooth factor K<sub>1</sub> (Table 17-22) and strand factor K<sub>2</sub> (Table 17-23) → allowable power H<sub>a</sub> = K<sub>1</sub>K<sub>2</sub>H<sub>tab</sub>. Then sprocket pitch diameters (Eq. 17-29), chain length in pitches (Eq. 17-34, round to an even integer), centre distance (Eqs. 17-35/36) and the wrap angles the bibles add from Mott. The Mech bible notes Shigley\'s process "is very similar" to Mott\'s but the rating needs the two correction factors.',
    example: { Hnom: 90, n1: 300, n2: 150, Ks: 1.3, nd: 1.5, N1: 17, chain: 140, strands: 3, Cp: 25 },

    figures: [
      { id: 'fig17-16', ref: 'Figure 17-16', title: 'Roller chain nomenclature (pitch, width, roller diameter, strand spacing)', src: 'figures/shigley/fig17-16.png', page: 930 },
      { id: 'fig17-17', ref: 'Figure 17-17', title: 'Engagement of chain and sprocket — pitch angle γ, pitch diameter D', src: 'figures/shigley/fig17-17.png', page: 932 },
      { id: 'fig17-18', ref: 'Figure 17-18', title: 'Chordal speed variation vs number of teeth', src: 'figures/shigley/fig17-18.png', page: 933 },
      { id: 'table17-19', ref: 'Table 17-19', title: 'Dimensions of American Standard roller chains (pitch, width, tensile strength, weight)', src: 'figures/shigley/table17-19.png', page: 931 },
      { id: 'table17-20a', ref: 'Table 17-20 (a)', title: 'Rated hp of single-strand chain, 17-tooth sprocket — chains 25 … 60, with lubrication type zones', src: 'figures/shigley/table17-20a.png', page: 934, note: 'Type A manual/drip; B bath/disk; C oil stream. Pre-extreme (rising) entries = link-plate fatigue, Eq. 17-32; post-extreme (falling) = roller impact, Eq. 17-33.' },
      { id: 'table17-20b', ref: 'Table 17-20 (b)', title: 'Rated hp of single-strand chain, 17-tooth sprocket — chains 80 … 240', src: 'figures/shigley/table17-20b.png', page: 935, note: "Type C′ = galling region: submit to manufacturer." },
      { id: 'table17-21', ref: 'Table 17-21', title: 'Available sprocket tooth counts (one supplier)', src: 'figures/shigley/table17-21.png', page: 935 },
      { id: 'table17-22', ref: 'Table 17-22', title: 'Tooth correction factor K1 (pre-/post-extreme)', src: 'figures/shigley/table17-22.png', page: 936, note: 'General: K1 = (N1/17)^1.08 pre-extreme, (N1/17)^1.5 post-extreme.' },
      { id: 'table17-23', ref: 'Table 17-23', title: 'Multiple-strand factors K2', src: 'figures/shigley/table17-23.png', page: 936 },
      { id: 'table17-15', ref: 'Table 17-15', title: 'Service factors Ks (V-belt table; use the same classes for chains)', src: 'figures/shigley/table17-15.png', page: 925 },
      { id: 'fig7-4', ref: 'Figure 7-4', book: 'mott', title: 'Belt/chain configuration — wrap angle geometry (Mott)', src: 'figures/mott/fig7-4.png', page: 265 },
    ],

    sections: [
      { title: 'Inputs', steps: [
        { id: 'in', title: 'Problem data and design power', fig: ['table17-15'], eq: '17-38', formula: 'H_d = H_{nom} K_s n_d,\\qquad VR = \\frac{n_1}{n_2}',
          text: 'Ks for shock (moderate shock ≈ 1.3) and nd for exigencies (Example 17-5 used nd = 1.5 for an 18-h day, poor lubrication, dirt and cold). If the output speed is a range use its midpoint.',
          vars: [
            { id: 'Hnom', symbol: 'H_{nom}', label: 'Nominal power', unit: 'hp', kind: 'input' },
            { id: 'n1', symbol: 'n_1', label: 'Small (driving) sprocket speed', unit: 'rpm', kind: 'input' },
            { id: 'n2', symbol: 'n_2', label: 'Desired output speed', unit: 'rpm', kind: 'input' },
            { id: 'Ks', symbol: 'K_s', label: 'Service factor', unit: '', kind: 'lookup', fig: 'table17-15', default: 1.0 },
            { id: 'nd', symbol: 'n_d', label: 'Design factor', unit: '', kind: 'input', default: 1.0 },
            { id: 'Hd', symbol: 'H_d', label: 'Design power', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'Hnom', 'Ks', 'nd') ? v.Hnom * v.Ks * v.nd : undefined,
              work: v => H.has(v, 'Hd') ? '\\(H_d = ' + H.fmt(v.Hnom) + '(' + H.fmt(v.Ks) + ')(' + H.fmt(v.nd) + ') = ' + H.fmt(v.Hd) + '\\ \\text{hp}\\)' : null },
            { id: 'VR', symbol: 'VR', label: 'Velocity ratio', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'n1', 'n2') ? v.n1 / v.n2 : undefined,
              check: v => (H.has(v, 'VR') && v.VR > 6) ? 'Ratios above 6:1 shorten chain life — consider two stages' : null },
          ] },
        { id: 'spk', title: 'Sprocket teeth', fig: ['table17-21', 'fig17-17'],
          text: 'Use at least 17 teeth on the driver (odd numbers preferred: 17, 19, 21 …) unless speed is very low; the driven sprocket should not exceed 120 teeth. N₂ = N₁·VR rounded to an integer, then recompute the output speed.',
          vars: [
            { id: 'N1', symbol: 'N_1', label: 'Driving sprocket teeth', unit: '', kind: 'input', default: 17, check: v => (H.has(v, 'N1') && v.N1 < 17 && (v.n1 || 101) >= 100) ? 'N1 < 17: only for very slow or space-limited drives' : null },
            { id: 'N2', symbol: 'N_2', label: 'Driven sprocket teeth', unit: '', kind: 'input', auto: v => H.has(v, 'N1', 'VR') ? Math.round(v.N1 * v.VR) : undefined, hint: 'auto = round(N1·VR); check availability in Table 17-21',
              check: v => (H.has(v, 'N2') && v.N2 > 120) ? 'N2 > 120 teeth: not made in standard sizes' : null },
            { id: 'VRa', symbol: 'VR_{act}', label: 'Actual ratio N2/N1', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'N1', 'N2') ? v.N2 / v.N1 : undefined },
            { id: 'n2a', symbol: 'n_{2,act}', label: 'Actual output speed', unit: 'rpm', kind: 'calc', compute: v => H.has(v, 'n1', 'VRa') ? v.n1 / v.VRa : undefined },
          ] },
      ] },

      { title: 'Chain selection & capacity', steps: [
        { id: 'chain', title: 'Chain number, strands and corrected rating', fig: ['table17-19', 'table17-20a', 'table17-20b', 'table17-22', 'table17-23'], eq: '17-32, 17-33, 17-37',
          formula: 'H_1 = 0.004 N_1^{1.08} n_1^{0.9} p^{(3 - 0.07p)},\\quad H_2 = \\frac{1000 K_r N_1^{1.5} p^{0.8}}{n_1^{1.5}},\\quad H_{tab} = \\min(H_1,H_2)\\ (N_1 = 17),\\quad H_a = K_1 K_2 H_{tab}',
          text: 'Design approach (Example 17-5): the required table rating is H<sub>tab,req</sub> = H<sub>d</sub>/(K<sub>1</sub>K<sub>2</sub>); form a table of strands → required H<sub>tab</sub> → smallest chain in Table 17-20 that provides it at n₁ (with its lubrication type). The auto H<sub>tab</sub> is min(H₁, H₂) at the chosen chain and N₁ = 17 — read Table 17-20 to confirm (K<sub>r</sub> = 29 for No. 25/35, 3.4 for No. 41, 17 for No. 40–240; constant 0.0022 instead of 0.004 for No. 41). K<sub>1</sub> uses the pre-extreme exponent when H₁ governs, post-extreme when H₂ governs.',
          vars: [
            { id: 'chain', label: 'ANSI chain number', kind: 'choice', options: Object.keys(CHAIN).map(Number) },
            { id: 'p', symbol: 'p', label: 'Chain pitch', unit: 'in', kind: 'lookup', fig: 'table17-19', auto: v => CHAIN[v.chain] ? CHAIN[v.chain][0] : undefined },
            { id: 'strands', label: 'Number of strands', kind: 'choice', options: [1, 2, 3, 4, 5, 6, 8], default: 1 },
            { id: 'K2', symbol: 'K_2', label: 'Multiple-strand factor', unit: '', kind: 'lookup', fig: 'table17-23', auto: v => K2[v.strands] },
            { id: 'H1', symbol: 'H_1', label: 'Link-plate limited power (17 T)', unit: 'hp', kind: 'calc', compute: H1 },
            { id: 'H2', symbol: 'H_2', label: 'Roller-impact limited power (17 T)', unit: 'hp', kind: 'calc', compute: H2 },
            { id: 'Htab', symbol: 'H_{tab}', label: 'Tabulated rating (Table 17-20)', unit: 'hp', kind: 'lookup', fig: 'table17-20a', auto: v => { const a = H1(v), b = H2(v); return (a !== undefined && b !== undefined) ? Math.min(a, b) : undefined; } },
            { id: 'K1', symbol: 'K_1', label: 'Tooth correction factor', unit: '', kind: 'lookup', fig: 'table17-22', auto: v => { const a = H1(v), b = H2(v); return (H.has(v, 'N1') && a !== undefined && b !== undefined) ? Math.pow(v.N1 / 17, a <= b ? 1.08 : 1.5) : undefined; } },
            { id: 'Ha', symbol: 'H_a', label: 'Allowable power', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'K1', 'K2', 'Htab') ? v.K1 * v.K2 * v.Htab : undefined,
              work: v => H.has(v, 'Ha') ? '\\(H_a = K_1K_2H_{tab} = ' + H.fmt(v.K1, 3) + '(' + H.fmt(v.K2) + ')(' + H.fmt(v.Htab) + ') = ' + H.fmt(v.Ha) + '\\ \\text{hp}\\)' : null },
            { id: 'Htreq', symbol: 'H_{tab,req}', label: 'Required table rating = Hd/(K1 K2)', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'Hd', 'K1', 'K2') ? v.Hd / (v.K1 * v.K2) : undefined,
              work: v => H.has(v, 'Htreq') ? '\\(H_{tab,req} = \\frac{n_dK_sH_{nom}}{K_1K_2} = \\frac{' + H.fmt(v.Hd) + '}{' + H.fmt(v.K1, 3) + '(' + H.fmt(v.K2) + ')} = ' + H.fmt(v.Htreq) + '\\ \\text{hp}\\)' : null },
            { id: 'lub', label: 'Lubrication type (zone in Table 17-20)', kind: 'choice', type: 'text', options: ['A — manual or drip', 'B — bath or disk', 'C — oil stream', "C′ — galling region (consult manufacturer)"] },
          ],
          after: v => H.has(v, 'Ha', 'Hd') ? (v.Ha >= v.Hd ? '<span class="result-ok">Capacity OK</span> — H<sub>a</sub> = ' + H.fmt(v.Ha) + ' hp ≥ H<sub>d</sub> = ' + H.fmt(v.Hd) + ' hp' : '<span class="result-bad">Insufficient</span> — H<sub>a</sub> = ' + H.fmt(v.Ha) + ' hp &lt; H<sub>d</sub> = ' + H.fmt(v.Hd) + ' hp: choose a larger chain or more strands') : '' },
      ] },

      { title: 'Geometry', steps: [
        { id: 'pd', title: 'Pitch diameters and chain velocity', fig: ['fig17-17', 'fig17-18'], eq: '17-29, 17-30, 17-31',
          formula: 'D = \\frac{p}{\\sin(180^\\circ/N)},\\qquad V = \\frac{N p n}{12},\\qquad \\frac{\\Delta V}{V} = \\frac{\\pi}{N}\\left[\\frac{1}{\\sin(180^\\circ/N)} - \\frac{1}{\\tan(180^\\circ/N)}\\right]',
          vars: [
            { id: 'D1', symbol: 'D_1', label: 'Driving sprocket pitch diameter', unit: 'in', kind: 'calc', compute: v => H.has(v, 'p', 'N1') ? v.p / Math.sin(Math.PI / v.N1) : undefined,
              work: v => H.has(v, 'D1') ? '\\(D_1 = \\frac{' + H.fmt(v.p) + '}{\\sin(180^\\circ/' + v.N1 + ')} = ' + H.fmt(v.D1) + '\\ \\text{in}\\)' : null },
            { id: 'D2', symbol: 'D_2', label: 'Driven sprocket pitch diameter', unit: 'in', kind: 'calc', compute: v => H.has(v, 'p', 'N2') ? v.p / Math.sin(Math.PI / v.N2) : undefined },
            { id: 'V', symbol: 'V', label: 'Chain velocity', unit: 'ft/min', kind: 'calc', compute: v => H.has(v, 'N1', 'p', 'n1') ? v.N1 * v.p * v.n1 / 12 : undefined },
            { id: 'dV', symbol: '\\Delta V/V', label: 'Chordal speed variation', unit: '%', kind: 'calc', digits: 3, compute: v => H.has(v, 'N1') ? 100 * Math.PI / v.N1 * (1 / Math.sin(Math.PI / v.N1) - 1 / Math.tan(Math.PI / v.N1)) : undefined },
          ] },
        { id: 'len', title: 'Chain length and centre distance', fig: ['fig7-4'], eq: '17-34, 17-35, 17-36',
          formula: '\\frac{L}{p} \\approx \\frac{2C}{p} + \\frac{N_1+N_2}{2} + \\frac{(N_2-N_1)^2}{4\\pi^2 C/p},\\qquad A = \\frac{N_1+N_2}{2} - \\frac{L}{p},\\qquad C = \\frac{p}{4}\\left[-A + \\sqrt{A^2 - 8\\left(\\frac{N_2-N_1}{2\\pi}\\right)^2}\\right]',
          text: 'Choose a trial C/p of 30–50 pitches (40 is typical; Example 17-5 used a short drive C/p = 25). Round the chain length to an EVEN number of pitches to avoid an offset link, then recompute C.',
          vars: [
            { id: 'Cp', symbol: 'C/p', label: 'Trial centre distance', unit: 'pitches', kind: 'input', default: 40, check: v => (H.has(v, 'Cp') && (v.Cp < 30 || v.Cp > 50)) ? 'Recommended 30–50 pitches' : null },
            { id: 'Lpc', symbol: 'L/p', label: 'Chain length (computed)', unit: 'pitches', kind: 'calc', compute: Lpc,
              work: v => H.has(v, 'Lpc') ? '\\(L/p = 2(' + H.fmt(v.Cp) + ') + \\frac{' + v.N1 + '+' + v.N2 + '}{2} + \\frac{(' + v.N2 + '-' + v.N1 + ')^2}{4\\pi^2(' + H.fmt(v.Cp) + ')} = ' + H.fmt(v.Lpc) + '\\ \\text{pitches}\\)' : null },
            { id: 'Lp', symbol: 'L/p', label: 'Chain length used (even integer)', unit: 'pitches', kind: 'input', auto: v => { const l = Lpc(v); return l !== undefined ? 2 * Math.round(l / 2) : undefined; }, hint: 'auto = nearest even integer; override if desired' },
            { id: 'Lin', symbol: 'L', label: 'Chain length', unit: 'in', kind: 'calc', compute: v => H.has(v, 'Lp', 'p') ? v.Lp * v.p : undefined },
            { id: 'A', symbol: 'A', label: 'A = (N1 + N2)/2 − L/p', unit: '', kind: 'calc', compute: v => H.has(v, 'Lp', 'N1', 'N2') ? (v.N1 + v.N2) / 2 - v.Lp : undefined },
            { id: 'Cpa', symbol: 'C/p', label: 'Actual centre distance', unit: 'pitches', kind: 'calc', compute: v => { if (!H.has(v, 'A', 'N1', 'N2')) return undefined; const r = v.A * v.A - 8 * ((v.N2 - v.N1) / (2 * Math.PI)) ** 2; return r >= 0 ? 0.25 * (-v.A + Math.sqrt(r)) : undefined; },
              work: v => H.has(v, 'Cpa') ? '\\(C = \\frac{p}{4}\\left[' + H.fmt(-v.A) + ' + \\sqrt{' + H.fmt(v.A) + '^2 - 8\\left(\\frac{' + v.N2 + '-' + v.N1 + '}{2\\pi}\\right)^2}\\right] = ' + H.fmt(v.Cpa) + 'p\\)' : null },
            { id: 'C', symbol: 'C', label: 'Actual centre distance', unit: 'in', kind: 'calc', compute: v => H.has(v, 'Cpa', 'p') ? v.Cpa * v.p : undefined,
              work: v => H.has(v, 'C') ? '\\(C = ' + H.fmt(v.Cpa) + '(' + H.fmt(v.p) + ') = ' + H.fmt(v.C) + '\\ \\text{in}\\)' : null },
          ] },
        { id: 'wrap', title: 'Angle of wrap (Mott Eqs. 7-21/7-22, as in both bibles)', fig: ['fig7-4'],
          formula: '\\theta_1 = 180^\\circ - 2\\sin^{-1}\\frac{D_2 - D_1}{2C},\\qquad \\theta_2 = 180^\\circ + 2\\sin^{-1}\\frac{D_2 - D_1}{2C}',
          vars: [
            { id: 'th1', symbol: '\\theta_1', label: 'Wrap on small sprocket', unit: '°', kind: 'calc', compute: v => H.has(v, 'D1', 'D2', 'C') ? 180 - 2 * H.deg(Math.asin((v.D2 - v.D1) / (2 * v.C))) : undefined,
              check: v => (H.has(v, 'th1') && v.th1 < 120) ? 'θ1 < 120° — increase centre distance' : null },
            { id: 'th2', symbol: '\\theta_2', label: 'Wrap on large sprocket', unit: '°', kind: 'calc', compute: v => H.has(v, 'th1') ? 360 - v.th1 : undefined },
          ] },
      ] },

      { title: 'Result', steps: [
        { id: 'res', title: 'Factor of safety and summary', formula: 'n_{fs} = \\frac{H_a}{H_d}\\quad(\\text{Fizz: } FS = P_{allowed}/P_{des})',
          vars: [
            { id: 'nfs', symbol: 'H_a/H_d', label: 'Capacity ratio', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'Ha', 'Hd') ? v.Ha / v.Hd : undefined },
            { id: 'Ft', symbol: 'F', label: 'Chain tension (tight side)', unit: 'lbf', kind: 'calc', compute: v => H.has(v, 'Hd', 'V') ? 33000 * v.Hd / v.V : undefined },
            { id: 'nten', symbol: 'n_{tensile}', label: 'Min tensile strength / tension', unit: '', kind: 'calc', digits: 3, compute: v => (H.has(v, 'Ft') && CHAIN[v.chain]) ? CHAIN[v.chain][1] * (v.strands || 1) / v.Ft : undefined, hint: 'Fizz: for load-carrying use ≤ 10 % of tensile strength' },
          ],
          after: v => {
            if (!H.has(v, 'Ha', 'Hd')) return '';
            const ok = v.Ha >= v.Hd && (!H.has(v, 'th1') || v.th1 >= 120);
            return (ok ? '<span class="result-ok">PASS</span>' : '<span class="result-bad">FAIL</span>') + ' — ' + (v.strands || 1) + ' strand(s) of No. ' + (v.chain || '?') + ' chain (p = ' + H.fmt(v.p) + ' in), N₁ = ' + v.N1 + ', N₂ = ' + v.N2 + ', L = ' + H.fmt(v.Lp) + ' pitches = ' + H.fmt(v.Lin) + ' in, C = ' + H.fmt(v.C) + ' in; H<sub>a</sub> = ' + H.fmt(v.Ha) + ' hp vs H<sub>d</sub> = ' + H.fmt(v.Hd) + ' hp' + (v.lub ? '; lubrication type ' + v.lub.split(' ')[0] : '') + '. Durability basis: 15 000 h, 100 pitches, recommended lubrication.';
          } },
      ] },
    ],
  };
})();
