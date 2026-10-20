/* Rack & pinion — Shigley 11e. Kinematics follow the Fizz p75 / Mech p114 procedure (Mott Sec. 8-13 / Table 8-10, which Shigley
 * does not cover); the tooth-strength check reuses the Shigley spur-gear AGMA bending equation (Ch. 14). */
(function () {
  const r = d => d * Math.PI / 180, fmt = (x, d) => H.fmt(x, d);
  const has = (v, ...a) => H.has(v, ...a);
  const sq = Math.sqrt;
  // Mott Table 8-10 (example rack specifications): Pd → B (pitch line to back), overall thickness, face width
  const T810 = { 64: [0.109, 0.125, 0.125], 48: [0.104, 0.125, 0.125], 32: [0.156, 0.187, 0.187], 24: [0.208, 0.250, 0.25], 20: [0.450, 0.500, 0.5], 16: [0.688, 0.750, 0.75], 12: [0.917, 1.000, 1], 10: [1.150, 1.250, 1.25], 8: [1.375, 1.500, 1.5], 6: [1.333, 1.500, 2], 5: [1.300, 1.500, 2.5], 4: [1.750, 2.000, 3.5] };

  window.TOPIC = {
    id: 'rack', book: 'shigley',
    title: 'Rack & Pinion — Kinematics, Forces & Tooth Strength',
    subtitle: 'Fizz p. 75 / Mech p. 114 procedure (rack data from Mott Table 8-10) · strength check via Shigley Ch. 14 spur equations',
    sibling: 'rack_mott.html',
    intro: 'A pinion driving a straight rack. <b>Shigley has no rack-and-pinion section</b>, so the kinematics and the rack dimension B come from Mott (Sec. 8-13, Table 8-10) — those figures are tagged <em>Mott</em>. Enter the pinion (P<sub>d</sub>, N<sub>P</sub>, n<sub>P</sub>) and the travel; the sheet gives pitch diameter, pinion-centre-to-rack-back distance, rack speed, time and pinion revolutions, then the tooth forces and a bending check with Shigley\'s spur-gear AGMA equation (Eq. 14-15) — the rack is a spur gear of infinite radius, so use the ∞ / rack column of Fig. 14-6 for J. For a full spur treatment (contact stress, all K-factors) carry W<sub>t</sub> into the <a href="spur_shigley.html">spur-gear calculator</a>. Load the example to reproduce Mott Example 8-9 (24T, P<sub>d</sub> = 6, 125 rpm, 20 ft).',
    example: { Pd: 6, NP: 24, nP: 125, s: 20, phi: 20, H: 1, Ko: 1.25, Qv: 7, Km: 1.3, F: 1.0, JP: 0.35, HB: 200 },

    figures: [
      { id: 'f8-45', ref: 'Figure 8-45', title: 'Rack driven by a pinion — B, overall thickness, pitch line, rack velocity', src: 'figures/mott/fig8-45.png', page: 366, book: 'mott' },
      { id: 't8-10', ref: 'Table 8-10', title: 'Example rack specifications: pitch line to back B, thickness, face width vs Pd', src: 'figures/mott/table8-10.png', page: 367, book: 'mott', note: 'Auto-fill uses this table when Pd is a listed value.' },
      { id: 'f8-46', ref: 'Figure 8-46', title: 'Pinion and rack of Mott Example 8-9', src: 'figures/mott/fig8-46.png', page: 367, book: 'mott' },
      { id: 'f13-29', ref: 'Figure 13-29', title: 'Spur-gear tooth forces (Wt, Wr, W) — same on a rack tooth', src: 'figures/shigley/fig13-29.png', page: 732, note: 'Wr = Wt tan φ points toward the pinion axis / into the rack; the force on the rack is along the rack (Wt) plus the separating force (Wr).' },
      { id: 't15-2', ref: 'Table 15-2', title: 'Overload factor Ko (also used for spur gears in this course)', src: 'figures/shigley/table15-2.png', page: 818 },
      { id: 'f14-9', ref: 'Figure 14-9', title: 'Dynamic factor Kv (Eqs. 14-27, 14-28 with Qv)', src: 'figures/shigley/fig14-9.png', page: 785 },
      { id: 'f14-6', ref: 'Figure 14-6', title: 'Spur geometry factor J — use the rack / 1000-teeth mate curve for the pinion', src: 'figures/shigley/fig14-6.png', page: 780, note: 'Pinion J: ordinate NP, "number of teeth in mating gear" = ∞ (rack). Rack tooth J: top of the chart (N → ∞) with mate NP.' },
      { id: 'f14-2', ref: 'Figure 14-2', title: 'Allowable bending stress sat for through-hardened steel (grade 1: sat = 77.3 HB + 12 800 psi)', src: 'figures/shigley/fig14-2.png', page: 773 },
    ],

    sections: [
      { title: '1 · Given', steps: [
        { id: 'in', title: 'Pinion, rack and duty', fig: ['f8-45'],
          vars: [
            { id: 'Pd', symbol: 'P_d', label: 'Diametral pitch', unit: 'teeth/in', kind: 'input' },
            { id: 'NP', symbol: 'N_P', label: 'Pinion teeth', kind: 'input' },
            { id: 'nP', symbol: 'n_P', label: 'Pinion speed', unit: 'rev/min', kind: 'input' },
            { id: 's', symbol: 's_{rack}', label: 'Rack travel of interest', unit: 'ft', kind: 'input', hint: 'optional — for time and revolutions' },
            { id: 'phi', symbol: '\\phi', label: 'Pressure angle', unit: '°', kind: 'choice', options: [{ label: '20°', value: 20 }, { label: '25°', value: 25 }, { label: '14.5°', value: 14.5 }], default: 20 },
            { id: 'H', symbol: 'H', label: 'Power at the pinion (if a force analysis is wanted)', unit: 'hp', kind: 'input', hint: 'or give the rack force below' },
            { id: 'Frack', symbol: 'F_{rack}', label: 'Force the rack must deliver (alternative to H)', unit: 'lbf', kind: 'input' },
          ] },
      ] },

      { title: '2 · Kinematics (Fizz / Mech steps 1-6)', steps: [
        { id: 'k1', title: 'Steps 1-3 — pitch diameter, B, pinion centre to rack back', fig: ['t8-10', 'f8-46'],
          formula: 'D_P = \\frac{N_P}{P_d},\\qquad B\\text{-}C = B + \\frac{D_P}{2}',
          vars: [
            { id: 'DP', symbol: 'D_P', label: 'Pinion pitch diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'NP', 'Pd') ? v.NP / v.Pd : undefined, work: v => has(v, 'NP', 'Pd') ? '\\(D_P = ' + v.NP + '/' + fmt(v.Pd) + ' = ' + fmt(v.NP / v.Pd) + '\\) in' : null },
            { id: 'B', symbol: 'B', label: 'Pitch line to back of rack', unit: 'in', kind: 'lookup', fig: 't8-10', auto: v => has(v, 'Pd') && T810[v.Pd] ? T810[v.Pd][0] : undefined, hint: 'Table 8-10 (Mott) — manufacturer data in practice' },
            { id: 'thk', symbol: 't', label: 'Rack overall thickness (Table 8-10)', unit: 'in', kind: 'lookup', fig: 't8-10', auto: v => has(v, 'Pd') && T810[v.Pd] ? T810[v.Pd][1] : undefined },
            { id: 'Frk', symbol: 'F_{r}', label: 'Rack face width (Table 8-10)', unit: 'in', kind: 'lookup', fig: 't8-10', auto: v => has(v, 'Pd') && T810[v.Pd] ? T810[v.Pd][2] : undefined },
            { id: 'BC', symbol: 'B\\text{-}C', label: 'Back of rack to pinion centreline', unit: 'in', kind: 'calc', compute: v => has(v, 'B', 'DP') ? v.B + v.DP / 2 : undefined, work: v => has(v, 'B', 'DP') ? '\\(B\\text{-}C = ' + fmt(v.B) + ' + ' + fmt(v.DP) + '/2 = ' + fmt(v.B + v.DP / 2) + '\\) in' : null },
          ] },
        { id: 'k2', title: 'Steps 4-6 — rack speed, time, pinion revolutions',
          formula: 'v_t = V_{rack} = \\frac{\\pi D_P n_P}{12}\\ \\text{ft/min},\\qquad t = \\frac{60\\,s_{rack}}{V_{rack}}\\ \\text{s},\\qquad \\theta_P = \\frac{12\\,s_{rack}}{\\pi D_P}\\ \\text{rev} = \\frac{6}{\\pi}\\cdot\\frac{2s_{rack}}{D_P}',
          text: 'The rack speed equals the pinion pitch-line speed. Distance per pinion revolution = πD<sub>P</sub> (= N<sub>P</sub> × circular pitch).',
          vars: [
            { id: 'Vrack', symbol: 'V_{rack}', label: 'Rack (and pitch-line) speed', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'DP', 'nP') ? Math.PI * v.DP * v.nP / 12 : undefined,
              work: v => has(v, 'DP', 'nP') ? '\\(V_{rack} = \\pi(' + fmt(v.DP) + ')(' + fmt(v.nP) + ')/12 = ' + fmt(Math.PI * v.DP * v.nP / 12) + '\\) ft/min' : null },
            { id: 'Vips', symbol: 'V_{rack}', label: 'Rack speed', unit: 'in/s', kind: 'calc', compute: v => has(v, 'Vrack') ? v.Vrack * 12 / 60 : undefined },
            { id: 'srev', symbol: 's/\\text{rev}', label: 'Rack travel per pinion revolution πDP', unit: 'in', kind: 'calc', compute: v => has(v, 'DP') ? Math.PI * v.DP : undefined },
            { id: 't', symbol: 't', label: 'Time to travel s_rack', unit: 's', kind: 'calc', compute: v => has(v, 's', 'Vrack') ? 60 * v.s / v.Vrack : undefined, work: v => has(v, 's', 'Vrack') ? '\\(t = 60(' + fmt(v.s) + ')/' + fmt(v.Vrack) + ' = ' + fmt(60 * v.s / v.Vrack) + '\\) s' : null },
            { id: 'thP', symbol: '\\theta_P', label: 'Pinion revolutions for s_rack', unit: 'rev', kind: 'calc', compute: v => has(v, 's', 'DP') ? 12 * v.s / (Math.PI * v.DP) : undefined, work: v => has(v, 's', 'DP') ? '\\(\\theta_P = 12(' + fmt(v.s) + ')/(\\pi\\cdot ' + fmt(v.DP) + ') = ' + fmt(12 * v.s / (Math.PI * v.DP)) + '\\) rev' : null },
          ] },
      ] },

      { title: '3 · Forces (Sec. 13-14 spur-gear force analysis)', steps: [
        { id: 'f', title: 'Tangential, radial and normal tooth forces', eq: '13-35, 13-36', fig: ['f13-29'],
          formula: 'T = \\frac{63\\,025\\,H}{n_P},\\quad W_t = \\frac{2T}{D_P} = \\frac{33\\,000\\,H}{V_{rack}},\\quad W_r = W_t\\tan\\phi,\\quad W = \\frac{W_t}{\\cos\\phi}',
          text: 'W<sub>t</sub> is the force pushing the rack along its length (= F<sub>rack</sub>); W<sub>r</sub> is the separating force pushing the rack away from the pinion (normal to the rack back). If the rack force is given instead of power, the sheet works backwards to the torque and power the pinion needs.',
          vars: [
            { id: 'Wt', symbol: 'W_t', label: 'Tangential force (on rack and pinion)', unit: 'lbf', kind: 'calc', compute: v => has(v, 'Frack') ? v.Frack : (has(v, 'H', 'Vrack') ? 33000 * v.H / v.Vrack : undefined),
              work: v => !has(v, 'Frack') && has(v, 'H', 'Vrack') ? '\\(W_t = 33\\,000(' + fmt(v.H) + ')/' + fmt(v.Vrack) + ' = ' + fmt(33000 * v.H / v.Vrack) + '\\) lbf' : null },
            { id: 'T', symbol: 'T', label: 'Pinion torque', unit: 'lbf·in', kind: 'calc', compute: v => has(v, 'Wt', 'DP') ? v.Wt * v.DP / 2 : undefined, work: v => has(v, 'Wt', 'DP') ? '\\(T = W_t D_P/2 = ' + fmt(v.Wt) + '(' + fmt(v.DP) + ')/2 = ' + fmt(v.Wt * v.DP / 2) + '\\) lbf·in' : null },
            { id: 'Hreq', symbol: 'H', label: 'Power at the pinion', unit: 'hp', kind: 'calc', compute: v => has(v, 'Wt', 'Vrack') ? v.Wt * v.Vrack / 33000 : undefined },
            { id: 'Wr', symbol: 'W_r', label: 'Radial (separating) force', unit: 'lbf', kind: 'calc', compute: v => has(v, 'Wt', 'phi') ? v.Wt * Math.tan(r(v.phi)) : undefined, work: v => has(v, 'Wt', 'phi') ? '\\(W_r = ' + fmt(v.Wt) + '\\tan ' + v.phi + '^\\circ = ' + fmt(v.Wt * Math.tan(r(v.phi))) + '\\) lbf' : null },
            { id: 'Wn', symbol: 'W', label: 'Normal force along the line of action', unit: 'lbf', kind: 'calc', compute: v => has(v, 'Wt', 'phi') ? v.Wt / Math.cos(r(v.phi)) : undefined },
          ] },
      ] },

      { title: '4 · Tooth bending check — spur-gear AGMA equation (Eq. 14-15)', text: 'The rack is a spur gear of infinite diameter, so the pinion/rack mesh is rated exactly like a spur pair. This is a bending-only check with the usual course simplifications (K<sub>s</sub> = K<sub>B</sub> = 1); for the complete spur procedure (K<sub>m</sub> from Eq. 14-30, contact stress, life and reliability factors) take W<sub>t</sub> to the <a href="spur_shigley.html">spur-gear calculator</a>.', steps: [
        { id: 'st', title: 'Bending stress and required hardness', eq: '14-15, 14-27', fig: ['t15-2', 'f14-9', 'f14-6', 'f14-2'],
          formula: '\\sigma = W_t K_o K_v K_s\\frac{P_d}{F}\\frac{K_m K_B}{J},\\qquad K_v = \\left(\\frac{A + \\sqrt{V}}{A}\\right)^B,\\ B = 0.25(12 - Q_v)^{2/3},\\ A = 50 + 56(1 - B)',
          vars: [
            { id: 'F', symbol: 'F', label: 'Face width (pinion / rack, the smaller)', unit: 'in', kind: 'input', hint: 'Table 8-10 rack face width is a guide' },
            { id: 'Ko', symbol: 'K_o', label: 'Overload factor', kind: 'lookup', fig: 't15-2', default: 1.0 },
            { id: 'Qv', symbol: 'Q_v', label: 'Quality number', kind: 'choice', options: [5, 6, 7, 8, 9, 10, 11], default: 7 },
            { id: 'Kv', symbol: 'K_v', label: 'Dynamic factor', kind: 'lookup', fig: 'f14-9', auto: v => has(v, 'Qv', 'Vrack') ? (function () { const B = 0.25 * Math.pow(12 - v.Qv, 2 / 3), A = 50 + 56 * (1 - B); return Math.pow((A + sq(v.Vrack)) / A, B); })() : undefined, hint: 'auto = Eq. 14-27' },
            { id: 'Km', symbol: 'K_m', label: 'Load-distribution factor', kind: 'input', default: 1.3, hint: 'Eq. 14-30 in the spur calculator; 1.2-1.4 typical for narrow faces' },
            { id: 'JP', symbol: 'J', label: 'Geometry factor (pinion, mate = rack)', kind: 'lookup', fig: 'f14-6', hint: 'Fig. 14-6: ordinate NP, mating-gear curve = 1000 / rack' },
            { id: 'sig', symbol: '\\sigma', label: 'Bending stress (pinion tooth)', unit: 'psi', kind: 'calc', compute: v => has(v, 'Wt', 'Ko', 'Kv', 'Pd', 'F', 'Km', 'JP') ? v.Wt * v.Ko * v.Kv * v.Pd / v.F * v.Km / v.JP : undefined,
              work: v => has(v, 'Wt', 'Ko', 'Kv', 'Pd', 'F', 'Km', 'JP') ? '\\(\\sigma = ' + fmt(v.Wt) + '(' + fmt(v.Ko) + ')(' + fmt(v.Kv) + ')(1)\\frac{' + fmt(v.Pd) + '}{' + fmt(v.F) + '}\\frac{' + fmt(v.Km) + '(1)}{' + fmt(v.JP) + '} = ' + fmt(v.Wt * v.Ko * v.Kv * v.Pd / v.F * v.Km / v.JP, 5) + '\\) psi' : null },
            { id: 'HB', symbol: 'H_B', label: 'Steel hardness (grade 1 through-hardened), if known', unit: 'HB', kind: 'input' },
            { id: 'sat', symbol: 'S_t', label: 'Allowable bending stress', unit: 'psi', kind: 'lookup', fig: 'f14-2', auto: v => has(v, 'HB') ? 77.3 * v.HB + 12800 : undefined, hint: 'auto = Fig. 14-2 grade 1 line: 77.3 HB + 12 800' },
            { id: 'SF', symbol: 'S_F', label: 'Bending safety factor S_t/σ (YN = KT = KR = 1)', kind: 'calc', compute: v => has(v, 'sat', 'sig') ? v.sat / v.sig : undefined },
            { id: 'HBreq', symbol: 'H_{B,req}', label: 'Hardness for S_F = 1 (grade 1)', unit: 'HB', kind: 'calc', digits: 3, compute: v => has(v, 'sig') ? Math.max(0, (v.sig - 12800) / 77.3) : undefined },
          ],
          after: v => {
            if (!has(v, 'sig')) return '';
            let s = 'Required grade-1 through-hardened steel: ≥ ' + fmt(Math.max(0, Math.ceil(v.HBreq)), 3) + ' HB for S<sub>F</sub> = 1 (scale up by your design factor).';
            if (has(v, 'SF')) s += v.SF >= 1 ? ' <span class="result-ok">PASS — S<sub>F</sub> = ' + fmt(v.SF, 3) + ' with ' + v.HB + ' HB</span>' : ' <span class="result-bad">FAIL — S<sub>F</sub> = ' + fmt(v.SF, 3) + ' with ' + v.HB + ' HB</span>';
            return s;
          } },
      ] },
    ],
  };
})();
