/* Rack & pinion — Mott 6e (Sec. 8-13, Table 8-10, Example 8-9). Kinematics follow the Fizz p75 / Mech p114 procedure;
 * the tooth-strength check reuses Mott's spur-gear bending stress equation (Ch. 9, Eq. 9-15). */
(function () {
  const r = d => d * Math.PI / 180, fmt = (x, d) => H.fmt(x, d);
  const has = (v, ...a) => H.has(v, ...a);
  const sq = Math.sqrt;
  // Table 8-10: Pd → [B, overall thickness, face width]
  const T810 = { 64: [0.109, 0.125, 0.125], 48: [0.104, 0.125, 0.125], 32: [0.156, 0.187, 0.187], 24: [0.208, 0.250, 0.25], 20: [0.450, 0.500, 0.5], 16: [0.688, 0.750, 0.75], 12: [0.917, 1.000, 1], 10: [1.150, 1.250, 1.25], 8: [1.375, 1.500, 1.5], 6: [1.333, 1.500, 2], 5: [1.300, 1.500, 2.5], 4: [1.750, 2.000, 3.5] };

  window.TOPIC = {
    id: 'rack', book: 'mott',
    title: 'Rack & Pinion — Kinematics, Forces & Tooth Strength',
    subtitle: 'Mott Sec. 8-13 (Table 8-10, Example 8-9) · Fizz p. 75 / Mech p. 114 procedure · strength via Mott Ch. 9 spur equations',
    sibling: 'rack_shigley.html',
    intro: 'A pinion driving a straight rack (Fig. 8-45). Enter the pinion (P<sub>d</sub>, N<sub>P</sub>, n<sub>P</sub>) and the travel; the sheet gives D<sub>P</sub>, the pitch-line-to-back dimension B (Table 8-10), the pinion-centreline-to-rack-back distance, rack velocity, travel time and pinion revolutions (Mott Ex. 8-9), then the tooth forces (Sec. 9-3) and a bending check with the spur-gear stress equation (Eq. 9-15) — the rack is a spur gear with an infinite number of teeth, so read J for the pinion with the ∞-tooth mate curve of Fig. 9-10. For the complete spur procedure (K<sub>m</sub> = 1 + C<sub>pf</sub> + C<sub>ma</sub>, contact stress, Y<sub>N</sub>, K<sub>R</sub>) take W<sub>t</sub> to the <a href="spur_mott.html">spur-gear calculator</a>. Load the example to reproduce Example 8-9 (24T, P<sub>d</sub> = 6, 125 rpm, 20 ft).',
    example: { Pd: 6, NP: 24, nP: 125, s: 20, phi: 20, P: 1, Ko: 1.25, Av: 10, Km: 1.3, F: 1.0, JP: 0.37, HB: 200 },

    figures: [
      { id: 'f8-45', ref: 'Figure 8-45', title: 'Rack driven by a pinion — B, overall thickness, pitch line, rack velocity vR', src: 'figures/mott/fig8-45.png', page: 366 },
      { id: 't8-10', ref: 'Table 8-10', title: 'Example rack specifications: pitch line to back B, thickness, face width vs Pd', src: 'figures/mott/table8-10.png', page: 367, note: 'Auto-fill uses this table when Pd is a listed value; use manufacturer data in practice.' },
      { id: 'f8-46', ref: 'Figure 8-46', title: 'Pinion and rack of Example Problem 8-9', src: 'figures/mott/fig8-46.png', page: 367 },
      { id: 't9-1', ref: 'Table 9-1', title: 'Suggested overload factors Ko', src: 'figures/mott/table9-1.png', page: 395 },
      { id: 't9-5', ref: 'Table 9-5', title: 'Recommended AGMA quality numbers Av', src: 'figures/mott/table9-5.png', page: 399 },
      { id: 'f9-16', ref: 'Figure 9-16', title: 'Dynamic factor Kv', src: 'figures/mott/fig9-16.png', page: 400 },
      { id: 't9-6', ref: 'Table 9-6', title: 'Analytical method for Kv', src: 'figures/mott/table9-6.png', page: 401 },
      { id: 'f9-10', ref: 'Figure 9-10', title: 'Spur geometry factor J — use the ∞ (rack) mating-gear curve for the pinion', src: 'figures/mott/fig9-10.png', page: 393, note: 'Pinion: ordinate NP, "number of teeth in mating gear" = ∞. Rack tooth: right-hand end of the chart (∞) with mate NP.' },
      { id: 'f9-18', ref: 'Figure 9-18', title: 'Allowable bending stress number sat vs HB, through-hardened steel (grade 1: sat = 0.0773 HB + 12.80 ksi)', src: 'figures/mott/fig9-18.png', page: 407 },
    ],

    sections: [
      { title: 'Given', steps: [
        { id: 'in', title: 'Pinion, rack and duty', fig: ['f8-45'],
          vars: [
            { id: 'Pd', symbol: 'P_d', label: 'Diametral pitch', unit: 'teeth/in', kind: 'input' },
            { id: 'NP', symbol: 'N_P', label: 'Pinion teeth', kind: 'input' },
            { id: 'nP', symbol: 'n_P', label: 'Pinion speed', unit: 'rpm', kind: 'input' },
            { id: 's', symbol: 's_{rack}', label: 'Rack travel of interest', unit: 'ft', kind: 'input', hint: 'optional — for t and θP' },
            { id: 'phi', symbol: '\\phi', label: 'Pressure angle', unit: '°', kind: 'choice', options: [{ label: '20°', value: 20 }, { label: '25°', value: 25 }, { label: '14.5°', value: 14.5 }], default: 20 },
            { id: 'P', symbol: 'P', label: 'Power at the pinion (if a force analysis is wanted)', unit: 'hp', kind: 'input', hint: 'or give the rack force below' },
            { id: 'Frack', symbol: 'F_{rack}', label: 'Force the rack must deliver (alternative to P)', unit: 'lb', kind: 'input' },
          ] },
      ] },

      { title: 'Steps 1-3 · Pitch diameter and rack location', steps: [
        { id: 'k1', title: 'DP, B from Table 8-10, back-of-rack to pinion centreline', fig: ['t8-10', 'f8-46'],
          formula: 'D_P = \\frac{N_P}{P_d},\\qquad B\\text{-}C = B + \\frac{D_P}{2}',
          vars: [
            { id: 'DP', symbol: 'D_P', label: 'Pinion pitch diameter', unit: 'in', kind: 'calc', compute: v => has(v, 'NP', 'Pd') ? v.NP / v.Pd : undefined, work: v => has(v, 'NP', 'Pd') ? '\\(D_P = ' + v.NP + '/' + fmt(v.Pd) + ' = ' + fmt(v.NP / v.Pd) + '\\) in' : null },
            { id: 'B', symbol: 'B', label: 'Pitch line to back of rack', unit: 'in', kind: 'lookup', fig: 't8-10', auto: v => has(v, 'Pd') && T810[v.Pd] ? T810[v.Pd][0] : undefined, hint: 'Table 8-10' },
            { id: 'thk', symbol: 't', label: 'Rack overall thickness', unit: 'in', kind: 'lookup', fig: 't8-10', auto: v => has(v, 'Pd') && T810[v.Pd] ? T810[v.Pd][1] : undefined },
            { id: 'Frk', symbol: 'F_{rack}', label: 'Rack face width (Table 8-10)', unit: 'in', kind: 'lookup', fig: 't8-10', auto: v => has(v, 'Pd') && T810[v.Pd] ? T810[v.Pd][2] : undefined },
            { id: 'BC', symbol: 'B\\text{-}C', label: 'Back of rack to pinion centreline', unit: 'in', kind: 'calc', compute: v => has(v, 'B', 'DP') ? v.B + v.DP / 2 : undefined, work: v => has(v, 'B', 'DP') ? '\\(B\\text{-}C = ' + fmt(v.B) + ' + ' + fmt(v.DP) + '/2 = ' + fmt(v.B + v.DP / 2) + '\\) in' : null },
          ] },
      ] },

      { title: 'Steps 4-6 · Velocity of rack, time, pinion revolutions', steps: [
        { id: 'k2', title: 'Kinematics', eq: '8-35, 8-37',
          formula: 'v_R = v_t = \\frac{D_P}{2}\\omega_P = \\frac{\\pi D_P n_P}{12}\\ \\text{ft/min},\\qquad t = \\frac{s_{rack}}{V_{rack}}\\cdot 60\\ \\text{s},\\qquad s_{rack} = \\frac{D_P}{2}\\theta_P \\Rightarrow \\theta_P = \\frac{12\\,s_{rack}}{\\pi D_P}\\ \\text{rev}',
          text: 'The bibles write the velocity as (π/6)(D<sub>P</sub>n<sub>P</sub>/2) — identical to πD<sub>P</sub>n<sub>P</sub>/12 — and the revolutions as (6/π)(2s<sub>rack</sub>/D<sub>P</sub>).',
          vars: [
            { id: 'Vrack', symbol: 'V_{rack}', label: 'Rack velocity (= pinion pitch-line speed)', unit: 'ft/min', kind: 'calc', compute: v => has(v, 'DP', 'nP') ? Math.PI * v.DP * v.nP / 12 : undefined,
              work: v => has(v, 'DP', 'nP') ? '\\(V_{rack} = \\pi(' + fmt(v.DP) + ')(' + fmt(v.nP) + ')/12 = ' + fmt(Math.PI * v.DP * v.nP / 12) + '\\) ft/min' : null },
            { id: 'Vips', symbol: 'V_{rack}', label: 'Rack velocity', unit: 'in/s', kind: 'calc', compute: v => has(v, 'Vrack') ? v.Vrack / 5 : undefined },
            { id: 'srev', symbol: 's/\\text{rev}', label: 'Travel per pinion revolution πDP', unit: 'in', kind: 'calc', compute: v => has(v, 'DP') ? Math.PI * v.DP : undefined },
            { id: 't', symbol: 't', label: 'Time to move s_rack', unit: 's', kind: 'calc', compute: v => has(v, 's', 'Vrack') ? 60 * v.s / v.Vrack : undefined, work: v => has(v, 's', 'Vrack') ? '\\(t = \\frac{' + fmt(v.s) + '\\text{ ft}}{' + fmt(v.Vrack) + '\\text{ ft/min}}\\cdot 60 = ' + fmt(60 * v.s / v.Vrack) + '\\) s' : null },
            { id: 'thP', symbol: '\\theta_P', label: 'Pinion revolutions', unit: 'rev', kind: 'calc', compute: v => has(v, 's', 'DP') ? 12 * v.s / (Math.PI * v.DP) : undefined,
              work: v => has(v, 's', 'DP') ? '\\(\\theta_P = \\frac{s_{rack}}{D_P/2} = \\frac{' + fmt(v.s) + '(12)}{' + fmt(v.DP / 2) + '} = ' + fmt(24 * v.s / v.DP) + '\\text{ rad} = ' + fmt(12 * v.s / (Math.PI * v.DP)) + '\\) rev' : null },
          ] },
      ] },

      { title: 'Forces (Sec. 9-3 spur-gear forces)', steps: [
        { id: 'f', title: 'Torque, tangential, radial and normal forces',
          formula: 'T = \\frac{63\\,000P}{n_P},\\quad W_t = \\frac{T}{D_P/2} = \\frac{33\\,000P}{v_t},\\quad W_r = W_t\\tan\\phi,\\quad W_n = \\frac{W_t}{\\cos\\phi}',
          text: 'W<sub>t</sub> drives the rack along its length (it equals the rack output force); W<sub>r</sub> pushes the rack away from the pinion, normal to the rack back — the rack guides must carry it. If the rack force is given, the sheet works back to the pinion torque and power.',
          vars: [
            { id: 'Wt', symbol: 'W_t', label: 'Tangential force', unit: 'lb', kind: 'calc', compute: v => has(v, 'Frack') ? v.Frack : (has(v, 'P', 'Vrack') ? 33000 * v.P / v.Vrack : undefined),
              work: v => !has(v, 'Frack') && has(v, 'P', 'Vrack') ? '\\(W_t = 33\\,000(' + fmt(v.P) + ')/' + fmt(v.Vrack) + ' = ' + fmt(33000 * v.P / v.Vrack) + '\\) lb' : null },
            { id: 'T', symbol: 'T', label: 'Pinion torque', unit: 'lb·in', kind: 'calc', compute: v => has(v, 'Wt', 'DP') ? v.Wt * v.DP / 2 : undefined, work: v => has(v, 'Wt', 'DP') ? '\\(T = ' + fmt(v.Wt) + '(' + fmt(v.DP) + '/2) = ' + fmt(v.Wt * v.DP / 2) + '\\) lb·in' : null },
            { id: 'Preq', symbol: 'P', label: 'Power at the pinion', unit: 'hp', kind: 'calc', compute: v => has(v, 'Wt', 'Vrack') ? v.Wt * v.Vrack / 33000 : undefined },
            { id: 'Wr', symbol: 'W_r', label: 'Radial (separating) force', unit: 'lb', kind: 'calc', compute: v => has(v, 'Wt', 'phi') ? v.Wt * Math.tan(r(v.phi)) : undefined, work: v => has(v, 'Wt', 'phi') ? '\\(W_r = ' + fmt(v.Wt) + '\\tan ' + v.phi + '^\\circ = ' + fmt(v.Wt * Math.tan(r(v.phi))) + '\\) lb' : null },
            { id: 'Wn', symbol: 'W_n', label: 'Normal force', unit: 'lb', kind: 'calc', compute: v => has(v, 'Wt', 'phi') ? v.Wt / Math.cos(r(v.phi)) : undefined },
          ] },
      ] },

      { title: 'Tooth bending check — spur-gear equation (Eq. 9-15)', text: 'A rack is a spur gear with infinite pitch diameter, so the pinion/rack mesh is rated like a spur pair. This is a bending-only check with K<sub>s</sub> = 1 (P<sub>d</sub> ≥ 5, Table 9-2) and K<sub>B</sub> = 1; for the complete spur procedure use the <a href="spur_mott.html">spur-gear calculator</a> with this W<sub>t</sub>.', steps: [
        { id: 'st', title: 'Bending stress number and required hardness', eq: '9-15', fig: ['t9-1', 't9-5', 'f9-16', 't9-6', 'f9-10', 'f9-18'],
          formula: 's_t = \\frac{W_t P_d}{F J}K_o K_s K_m K_B K_v,\\qquad K_v = \\left[\\frac{C}{C + \\sqrt{v_t}}\\right]^{-B},\\ B = 0.25(A_v - 5)^{0.667},\\ C = 50 + 56(1 - B)',
          vars: [
            { id: 'F', symbol: 'F', label: 'Face width (smaller of pinion / rack)', unit: 'in', kind: 'input', hint: 'Table 8-10 rack face width is a guide' },
            { id: 'Ko', symbol: 'K_o', label: 'Overload factor', kind: 'lookup', fig: 't9-1', default: 1.0 },
            { id: 'Av', symbol: 'A_v', label: 'Quality number', kind: 'choice', options: [6, 7, 8, 9, 10, 11, 12], default: 10, hint: 'Table 9-5' },
            { id: 'Kv', symbol: 'K_v', label: 'Dynamic factor', kind: 'lookup', fig: 'f9-16', auto: v => has(v, 'Av', 'Vrack') ? (function () { const B = 0.25 * Math.pow(v.Av - 5, 0.667), C = 50 + 56 * (1 - B); return Math.pow(C / (C + sq(v.Vrack)), -B); })() : undefined, hint: 'auto = Table 9-6 equations' },
            { id: 'Km', symbol: 'K_m', label: 'Load-distribution factor 1 + Cpf + Cma', kind: 'input', default: 1.3, hint: 'Figs 9-12/9-13 in the spur calculator; ~1.2-1.4' },
            { id: 'JP', symbol: 'J', label: 'Geometry factor (pinion with rack mate)', kind: 'lookup', fig: 'f9-10', hint: 'Fig. 9-10: ordinate NP, mating-gear curve ∞' },
            { id: 'st', symbol: 's_t', label: 'Bending stress number (pinion tooth)', unit: 'psi', kind: 'calc', compute: v => has(v, 'Wt', 'Pd', 'F', 'JP', 'Ko', 'Km', 'Kv') ? v.Wt * v.Pd / (v.F * v.JP) * v.Ko * v.Km * v.Kv : undefined,
              work: v => has(v, 'Wt', 'Pd', 'F', 'JP', 'Ko', 'Km', 'Kv') ? '\\(s_t = \\frac{' + fmt(v.Wt) + '(' + fmt(v.Pd) + ')}{' + fmt(v.F) + '(' + fmt(v.JP) + ')}(' + fmt(v.Ko) + ')(1)(' + fmt(v.Km) + ')(1)(' + fmt(v.Kv) + ') = ' + fmt(v.Wt * v.Pd / (v.F * v.JP) * v.Ko * v.Km * v.Kv, 5) + '\\) psi' : null },
            { id: 'HB', symbol: 'HB', label: 'Steel hardness (grade 1 through-hardened), if known', unit: 'HB', kind: 'input' },
            { id: 'sat', symbol: 's_{at}', label: 'Allowable bending stress number', unit: 'psi', kind: 'lookup', fig: 'f9-18', auto: v => has(v, 'HB') ? 77.3 * v.HB + 12800 : undefined, hint: 'auto = Fig. 9-18 grade 1: 0.0773 HB + 12.80 ksi' },
            { id: 'SF', symbol: 'SF', label: 'Safety factor sat/st (YN = KR = 1)', kind: 'calc', compute: v => has(v, 'sat', 'st') ? v.sat / v.st : undefined },
            { id: 'HBreq', symbol: 'HB_{req}', label: 'Hardness for SF = 1 (grade 1)', unit: 'HB', kind: 'calc', digits: 3, compute: v => has(v, 'st') ? Math.max(0, (v.st / 1000 - 12.80) / 0.0773) : undefined },
          ],
          after: v => {
            if (!has(v, 'st')) return '';
            let s = 'Required grade-1 through-hardened steel: ≥ ' + fmt(Math.max(0, Math.ceil(v.HBreq)), 3) + ' HB for SF = 1 (scale by your service factor).';
            if (has(v, 'SF')) s += v.SF >= 1 ? ' <span class="result-ok">PASS — SF = ' + fmt(v.SF, 3) + ' with ' + v.HB + ' HB</span>' : ' <span class="result-bad">FAIL — SF = ' + fmt(v.SF, 3) + ' with ' + v.HB + ' HB</span>';
            return s;
          } },
      ] },
    ],
  };
})();
