/* Rack & pinion — Mott 6e (Sec. 8-13, Table 8-10, Example 8-9). Kinematics follow the Fizz p75 / Mech p114 procedure;
 * the tooth-strength check reuses Mott's spur-gear bending stress equation (Ch. 9, Eq. 9-15).
 * Defaults follow the UBC MECH 325 course conventions (v2/COURSE_CONVENTIONS.md §0, §6, §7, §11): no dedicated course document for racks —
 *   the course treats the rack as the limiting case of interference (Gear Trains Tut 1 Q3h "smallest pinion that will run with a rack":
 *   NP = 2k/sin²φ → 18 teeth at 20°) plus the spur force equations; the bending check uses the course spur defaults (Ko tutorials 1.0,
 *   Kv by equation with Qv ↔ Av = 17 − Qv, Ks = 1, Km = 1 + Cpf + Cma commercial-enclosed, KB = 1, YN = 1 at 10^7, KT = 1, KR = 1 at 99 %,
 *   grade-1 steel St = 77.3 HB + 12 800, SF = 1 to find the minimum strength then pick a steel with 1 ≤ SF ≤ 1.5) and the plastic-gear
 *   Lewis check of Helical/Bevel s31–34 (σt = Wt Pd SF/(F Y), Mott Table 9-15 Y).
 * Verified against: Mott Ex. 8-9 (24 T, Pd 6, 125 rpm, 20 ft → DP 4.000, B 1.333, B-C 3.333 in, Vrack 130.9 ft/min, t 9.167 s, 19.09 rev)
 *   and Gear Trains Tut 1 Q3h (20° FD pinion with a rack → NP,min = 2/sin²20° = 17.1 → 18 teeth). */
(function () {
  const r = d => d * Math.PI / 180, fmt = (x, d) => H.fmt(x, d);
  const has = (v, ...a) => H.has(v, ...a);
  const sq = Math.sqrt;
  // Table 8-10: Pd → [B, overall thickness, face width]
  // Course Helical/Bevel s33 (Mott Table 9-15) Lewis Y, load near the pitch point: N → [14.5° FD, 20° FD, 20° stub]
  const Y915_N = [26, 28, 30, 34, 38, 43, 50];
  const Y915 = { 14.5: [0.522, 0.535, 0.540, 0.553, 0.566, 0.575, 0.588], 20: [0.588, 0.597, 0.606, 0.628, 0.651, 0.672, 0.694], stub: [0.678, 0.688, 0.698, 0.714, 0.729, 0.739, 0.758] };
  const lewisY = (N, phi) => (N >= 26 && N <= 50 && Y915[phi]) ? H.interp(N, Y915_N, Y915[phi]) : undefined;
  // Course spur K_m rule (Gear Stress s16–20): Cpf with the 0.05 floor, Cma curve 2 commercial enclosed, Cmc = Cpm = Ce = 1
  const Cpf = (F, d) => { let x = F / (10 * d); if (x < 0.05) x = 0.05; return F <= 1 ? x - 0.025 : x - 0.0375 + 0.0125 * F; };
  const Cma = F => 0.127 + 0.0158 * F - 0.930e-4 * F * F;
  const T810 = { 64: [0.109, 0.125, 0.125], 48: [0.104, 0.125, 0.125], 32: [0.156, 0.187, 0.187], 24: [0.208, 0.250, 0.25], 20: [0.450, 0.500, 0.5], 16: [0.688, 0.750, 0.75], 12: [0.917, 1.000, 1], 10: [1.150, 1.250, 1.25], 8: [1.375, 1.500, 1.5], 6: [1.333, 1.500, 2], 5: [1.300, 1.500, 2.5], 4: [1.750, 2.000, 3.5] };

  window.TOPIC = {
    id: 'rack', book: 'mott',
    title: 'Rack & Pinion — Kinematics, Forces & Tooth Strength',
    subtitle: 'Mott Sec. 8-13 (Table 8-10, Example 8-9) · Fizz p. 75 / Mech p. 114 procedure · strength via Mott Ch. 9 spur equations',
    sibling: 'rack_shigley.html',
    intro: 'A pinion driving a straight rack (Fig. 8-45). Enter the pinion (P<sub>d</sub>, N<sub>P</sub>, n<sub>P</sub>) and the travel; the sheet gives D<sub>P</sub>, the pitch-line-to-back dimension B (Table 8-10), the pinion-centreline-to-rack-back distance, rack velocity, travel time and pinion revolutions (Mott Ex. 8-9), then the tooth forces (Sec. 9-3) and a bending check with the spur-gear stress equation (Eq. 9-15) — the rack is a spur gear with an infinite number of teeth, so read J for the pinion with the ∞-tooth mate curve of Fig. 9-10. For the complete spur procedure (contact stress, Y<sub>N</sub>, K<sub>R</sub>) take W<sub>t</sub> to the <a href="spur_mott.html">spur-gear calculator</a>. <b>Defaults are the MECH 325 course assumptions</b> (no dedicated rack document — Gear Trains Tutorial 1 Q3h treats the rack as the interference limit N<sub>P</sub> = 2k/sin²φ, and the spur conventions of Gear_Stress_2026 apply: K<sub>o</sub> = 1 in tutorials (Table 9-1), K<sub>v</sub> by the Table 9-6 equations with A<sub>v</sub> = 17 − Q<sub>v</sub>, K<sub>s</sub> = K<sub>B</sub> = 1, K<sub>m</sub> = 1 + C<sub>pf</sub> + C<sub>ma</sub> commercial enclosed, Y<sub>N</sub> = 1 at 10<sup>7</sup> cycles, K<sub>R</sub> = 1 at 99 %, grade-1 steel, SF = 1 to find the minimum s<sub>at</sub> then a steel from Table 9-8 / App. 3 with 1 ≤ SF ≤ 1.5). A plastic-pinion Lewis check (Helical/Bevel s31–34) is at the end. Load the example to reproduce Example 8-9 (24T, P<sub>d</sub> = 6, 125 rpm, 20 ft).',
    example: { Pd: 6, NP: 24, nP: 125, s: 20, phi: 20, P: 1, Ko: 1.0, Av: 10, F: 1.0, JP: 0.37, HB: 200, SFd: 1 },

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
      { id: 'f9-12', ref: 'Figure 9-12', title: 'Pinion proportion factor Cpf', src: 'figures/mott/fig9-12.png', page: 397 },
      { id: 'f9-13', ref: 'Figure 9-13', title: 'Mesh alignment factor Cma', src: 'figures/mott/fig9-13.png', page: 398 },
      // ---- course-only slides ----
      { id: 'cko', ref: 'Gear Stress s12', book: 'course', title: 'Overload factor Ko — Shigley table and Mott Table 9-1 side by side', src: 'figures/course/ko_shigley_vs_mott.png', note: 'Either accepted; Mott is "more conservative". Tutorials use Ko = 1.' },
      { id: 'ckv', ref: 'Gear Stress s14', book: 'course', title: 'Kv analytical method and Mott Table 9-4: Qv ↔ Av mapping (Av = 17 − Qv)', src: 'figures/course/gear_kv_q_av_table.png' },
      { id: 'ccma', ref: 'Gear Stress s20', book: 'course', title: 'Cpf and Cma — "default to curve 2 (commercial enclosed gear units)"', src: 'figures/course/gear_cma_curve2.png' },
      { id: 'cteeth', ref: 'Helical/Bevel s33', book: 'course', title: 'Plastic-gear Lewis stress σt = Wt Pd (SF)/(F Y), Mott Table 9-15 Y, and standard tooth proportions', src: 'figures/course/standard_gear_teeth_table.png', note: 'Y for load near the pitch point, 26–50 teeth. Compare σt with the plastic strength (KHK catalogue) for the true safety factor.' },
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

      { title: 'Interference · smallest pinion that runs with a rack (course Tutorial 1 Q3h)', steps: [
        { id: 'intf', title: 'Minimum pinion teeth with a rack mate',
          formula: 'N_{P,min} = \\frac{2k}{\\sin^2\\phi}\\quad (k = 1\\ \\text{full depth}, 0.8\\ \\text{stub})',
          text: 'A rack is a gear of infinite radius, so the Shigley interference equation (13-11) reduces to N<sub>P</sub> = 2k/sin²φ — 17.1 → <b>18 teeth</b> at 20° full depth (11.2 → 12 at 25°; 31.9 → 32 at 14.5°). Mott Table 8-7 gives the same limits for a rack; fewer teeth undercut the pinion.',
          vars: [
            { id: 'k', symbol: 'k', label: 'Addendum factor', kind: 'choice', options: [{ label: '1 — full depth', value: 1 }, { label: '0.8 — stub', value: 0.8 }], default: 1 },
            { id: 'NPmin', symbol: 'N_{P,min}', label: 'Minimum pinion teeth with a rack', kind: 'calc', digits: 4, compute: v => has(v, 'k', 'phi') ? 2 * v.k / Math.pow(Math.sin(r(v.phi)), 2) : undefined,
              work: v => has(v, 'k', 'phi') ? '\\(N_{P,min} = 2(' + v.k + ')/\\sin^2 ' + v.phi + '^\\circ = ' + fmt(2 * v.k / Math.pow(Math.sin(r(v.phi)), 2)) + ' \\rightarrow ' + Math.ceil(2 * v.k / Math.pow(Math.sin(r(v.phi)), 2) - 1e-9) + '\\) teeth' : null },
          ],
          after: v => has(v, 'NP', 'NPmin') ? (v.NP >= v.NPmin ? '<span class="result-ok">N<sub>P</sub> = ' + v.NP + ' ≥ ' + Math.ceil(v.NPmin - 1e-9) + ' — no interference with the rack</span>' : '<span class="result-bad">N<sub>P</sub> = ' + v.NP + ' &lt; ' + Math.ceil(v.NPmin - 1e-9) + ' — the rack will interfere (undercut) with this pinion</span>') : '' },
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

      { title: 'Tooth bending check — spur-gear equation (Eq. 9-15)', text: 'A rack is a spur gear with infinite pitch diameter, so the pinion/rack mesh is rated like a spur pair. Bending-only check with the course spur defaults (Gear_Stress_2026): K<sub>s</sub> = 1 (P<sub>d</sub> ≥ 5, Table 9-2), K<sub>B</sub> = 1, K<sub>m</sub> = 1 + C<sub>pf</sub> + C<sub>ma</sub> (Eq. 9-17, commercial enclosed), Y<sub>N</sub> = 1 at 10<sup>7</sup> cycles, K<sub>R</sub> = 1 at 99 %. For the complete spur procedure use the <a href="spur_mott.html">spur-gear calculator</a> with this W<sub>t</sub>.', steps: [
        { id: 'st', title: 'Bending stress number and required hardness', eq: '9-15, 9-17', fig: ['t9-1', 'cko', 't9-5', 'f9-16', 't9-6', 'ckv', 'f9-12', 'f9-13', 'ccma', 'f9-10', 'f9-18'],
          formula: 's_t = \\frac{W_t P_d}{F J}K_o K_s K_m K_B K_v,\\qquad K_v = \\left[\\frac{C}{C + \\sqrt{v_t}}\\right]^{-B},\\ B = 0.25(A_v - 5)^{0.667},\\ C = 50 + 56(1 - B),\\qquad K_m = 1 + C_{pf} + C_{ma}',
          vars: [
            { id: 'F', symbol: 'F', label: 'Face width (smaller of pinion / rack)', unit: 'in', kind: 'input', hint: 'Table 8-10 rack face width is a guide; Mott rule 8/Pd < F < 12/Pd' },
            { id: 'Ko', symbol: 'K_o', label: 'Overload factor', kind: 'lookup', fig: 't9-1', default: 1.0, hint: 'Table 9-1 (course accepts Shigley\'s too); tutorials 1.0' },
            { id: 'Av', symbol: 'A_v', label: 'Quality number', kind: 'choice', options: [6, 7, 8, 9, 10, 11, 12], default: 10, hint: 'Table 9-5; Av = 17 − Qv (Shigley)' },
            { id: 'Kv', symbol: 'K_v', label: 'Dynamic factor', kind: 'lookup', fig: 'f9-16', auto: v => has(v, 'Av', 'Vrack') ? (function () { const B = 0.25 * Math.pow(v.Av - 5, 0.667), C = 50 + 56 * (1 - B); return Math.pow(C / (C + sq(v.Vrack)), -B); })() : undefined, hint: 'auto = Table 9-6 equations (course prefers the equation)',
              work: v => has(v, 'Av', 'Vrack') ? (function () { const B = 0.25 * Math.pow(v.Av - 5, 0.667), C = 50 + 56 * (1 - B); return '\\(B = ' + fmt(B, 3) + ',\\ C = ' + fmt(C) + ',\\ K_v = [' + fmt(C) + '/(' + fmt(C) + ' + \\sqrt{' + fmt(v.Vrack) + '})]^{-' + fmt(B, 3) + '} = ' + fmt(Math.pow(C / (C + sq(v.Vrack)), -B)) + '\\)'; })() : null },
            { id: 'Cpf', symbol: 'C_{pf}', label: 'Pinion proportion factor (Fig. 9-12 equations, course 0.05 floor)', kind: 'lookup', fig: 'f9-12', auto: v => has(v, 'F', 'DP') ? Cpf(v.F, v.DP) : undefined,
              work: v => has(v, 'F', 'DP') ? '\\(F/(10D_P) = ' + fmt(v.F / (10 * v.DP), 3) + (v.F / (10 * v.DP) < 0.05 ? ' \\rightarrow 0.05' : '') + ';\\ C_{pf} = ' + fmt(Cpf(v.F, v.DP), 3) + '\\)' : null },
            { id: 'Cma', symbol: 'C_{ma}', label: 'Mesh alignment factor, commercial enclosed (Fig. 9-13)', kind: 'lookup', fig: 'f9-13', auto: v => has(v, 'F') ? 0.127 + 0.0158 * v.F - 1.093e-4 * v.F * v.F : undefined, hint: 'auto = Mott curve 0.127 + 0.0158F − 1.093e-4 F²',
              work: v => has(v, 'F') ? '\\(C_{ma} = 0.127 + 0.0158(' + fmt(v.F) + ') - 1.093(10^{-4})(' + fmt(v.F) + ')^2 = ' + fmt(0.127 + 0.0158 * v.F - 1.093e-4 * v.F * v.F, 3) + '\\)' : null },
            { id: 'Km', symbol: 'K_m', label: 'Load-distribution factor', kind: 'lookup', fig: 'ccma', auto: v => has(v, 'Cpf', 'Cma') ? 1 + v.Cpf + v.Cma : undefined, hint: 'auto = 1 + Cpf + Cma (Eq. 9-17); override if given' },
            { id: 'JP', symbol: 'J', label: 'Geometry factor (pinion with rack mate)', kind: 'lookup', fig: 'f9-10', hint: 'Fig. 9-10: ordinate NP, mating-gear curve ∞' },
            { id: 'st', symbol: 's_t', label: 'Bending stress number (pinion tooth)', unit: 'psi', kind: 'calc', compute: v => has(v, 'Wt', 'Pd', 'F', 'JP', 'Ko', 'Km', 'Kv') ? v.Wt * v.Pd / (v.F * v.JP) * v.Ko * v.Km * v.Kv : undefined,
              work: v => has(v, 'Wt', 'Pd', 'F', 'JP', 'Ko', 'Km', 'Kv') ? '\\(s_t = \\frac{' + fmt(v.Wt) + '(' + fmt(v.Pd) + ')}{' + fmt(v.F) + '(' + fmt(v.JP) + ')}(' + fmt(v.Ko) + ')(1)(' + fmt(v.Km) + ')(1)(' + fmt(v.Kv) + ') = ' + fmt(v.Wt * v.Pd / (v.F * v.JP) * v.Ko * v.Km * v.Kv, 5) + '\\) psi' : null },
            { id: 'SFd', symbol: 'SF_d', label: 'Design safety factor target', kind: 'input', default: 1, hint: 'course: solve with SF = 1, then pick a steel giving 1 ≤ SF ≤ 1.5' },
            { id: 'satMin', symbol: 's_{at,min}', label: 'Minimum allowable bending stress number  s_t (SF) K_R/Y_N', unit: 'psi', kind: 'calc', compute: v => has(v, 'st', 'SFd') ? v.st * v.SFd : undefined, work: v => has(v, 'st', 'SFd') ? '\\(s_{at,min} = ' + fmt(v.st, 5) + '(' + fmt(v.SFd) + ')(1)/1 = ' + fmt(v.st * v.SFd, 5) + '\\) psi' : null },
            { id: 'HBreq', symbol: 'HB_{req}', label: 'Required hardness (grade 1: (sat,min − 12.80 ksi)/0.0773)', unit: 'HB', kind: 'calc', digits: 3, compute: v => has(v, 'satMin') ? Math.max(0, (v.satMin / 1000 - 12.80) / 0.0773) : undefined, work: v => has(v, 'satMin') ? '\\(HB = (' + fmt(v.satMin / 1000) + ' - 12.80)/0.0773 = ' + fmt(Math.max(0, (v.satMin / 1000 - 12.80) / 0.0773), 3) + '\\)' : null },
            { id: 'HB', symbol: 'HB', label: 'Hardness of the chosen steel (grade 1 through-hardened; Table 9-8 / App. 3)', unit: 'HB', kind: 'input', hint: 'e.g. 4140 annealed 197, 4140 OQT1300 235, 4140 OQT1000 341, 4340 OQT1000 363' },
            { id: 'sat', symbol: 's_{at}', label: 'Allowable bending stress number of the chosen steel', unit: 'psi', kind: 'lookup', fig: 'f9-18', auto: v => has(v, 'HB') ? 77.3 * v.HB + 12800 : undefined, hint: 'auto = Fig. 9-18 grade 1: 0.0773 HB + 12.80 ksi' },
            { id: 'SF', symbol: 'SF', label: 'Actual safety factor sat YN/(KR st)', kind: 'calc', compute: v => has(v, 'sat', 'st') ? v.sat / v.st : undefined, work: v => has(v, 'sat', 'st') ? '\\(SF = ' + fmt(v.sat, 5) + '(1)/(1)(' + fmt(v.st, 5) + ') = ' + fmt(v.sat / v.st, 3) + '\\)' : null },
          ],
          after: v => {
            if (!has(v, 'st')) return '';
            let s = 'Required grade-1 through-hardened steel: ≥ ' + fmt(Math.max(0, Math.ceil(v.HBreq)), 3) + ' HB for SF = ' + fmt(v.SFd) + '. Pick an alloy/heat treatment with at least this hardness (Table 9-8 / App. 3) and quote its % elongation.';
            if (has(v, 'SF')) s += v.SF >= v.SFd ? ' <span class="result-ok">PASS — SF = ' + fmt(v.SF, 3) + ' with ' + v.HB + ' HB' + (v.SF > 1.5 ? ' (above the AGMA 1–1.5 range: a softer/cheaper steel would do)' : '') + '</span>' : ' <span class="result-bad">FAIL — SF = ' + fmt(v.SF, 3) + ' &lt; ' + fmt(v.SFd) + ' with ' + v.HB + ' HB</span>';
            return s;
          } },
      ] },

      { title: 'Plastic pinion — Lewis check (course Helical/Bevel s31–34, Table 9-15)', text: 'Optional: for a plastic (nylon, acetal …) pinion the course uses the unmodified Lewis equation with Y in place of J and an overload "design" SF, then compares with the plastic\'s strength from the KHK catalogue to get the true safety factor. High P<sub>d</sub> (small teeth) is typical.', steps: [
        { id: 'plastic', title: 'Lewis bending stress in a plastic pinion', fig: ['cteeth'],
          formula: '\\sigma_t = \\frac{W_t P_d\\,(SF)}{F\\,Y}',
          vars: [
            { id: 'Yform', symbol: '', label: 'Tooth form for Y', kind: 'choice', type: 'text', options: [{ label: '20° full depth', value: '20' }, { label: '14.5° full depth', value: '14.5' }, { label: '20° stub', value: 'stub' }], default: '20' },
            { id: 'Y', symbol: 'Y', label: 'Lewis form factor (load near pitch point)', kind: 'lookup', fig: 'cteeth', auto: v => has(v, 'NP', 'Yform') ? lewisY(v.NP, v.Yform) : undefined, hint: 'Table 9-15 covers 26–50 teeth' },
            { id: 'SFp', symbol: 'SF', label: 'Overload ("design") factor', kind: 'input', default: 1, hint: 'service/overload factor applied to the load' },
            { id: 'sigP', symbol: '\\sigma_t', label: 'Lewis bending stress', unit: 'psi', kind: 'calc', compute: v => has(v, 'Wt', 'Pd', 'SFp', 'F', 'Y') ? v.Wt * v.Pd * v.SFp / (v.F * v.Y) : undefined,
              work: v => has(v, 'Wt', 'Pd', 'SFp', 'F', 'Y') ? '\\(\\sigma_t = \\frac{' + fmt(v.Wt) + '(' + fmt(v.Pd) + ')(' + fmt(v.SFp) + ')}{' + fmt(v.F) + '(' + fmt(v.Y, 3) + ')} = ' + fmt(v.Wt * v.Pd * v.SFp / (v.F * v.Y), 5) + '\\) psi' : null },
            { id: 'sPl', symbol: '\\sigma_{all}', label: 'Plastic bending strength (catalogue)', unit: 'psi', kind: 'input', hint: 'KHK catalogue, e.g. nylon ≈ 6 ksi, acetal ≈ 8 ksi' },
            { id: 'SFpl', symbol: 'SF_{true}', label: 'True safety factor σall/σt', kind: 'calc', compute: v => has(v, 'sPl', 'sigP') ? v.sPl / v.sigP : undefined },
          ],
          after: v => has(v, 'SFpl') ? (v.SFpl >= 1 ? '<span class="result-ok">Plastic pinion OK — SF<sub>true</sub> = ' + fmt(v.SFpl, 3) + '</span>' : '<span class="result-bad">Plastic pinion FAILS — SF<sub>true</sub> = ' + fmt(v.SFpl, 3) + ': wider face, coarser pitch or a stronger plastic</span>') : '' },
      ] },
    ],
  };
})();
