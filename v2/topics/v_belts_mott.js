// V-belts — Mott Ch. 7-4 (merged Fizz §1.4 + Mech §8.3.2 procedure, Mott symbols; Example Problem 7-2)
(function () {
  // Standard sheave pitch diameters shown on Figures 7-14, 7-15, 7-16
  const SHEAVES = {
    '3V': [2.60, 2.75, 2.95, 3.10, 3.30, 3.60, 4.07, 4.45, 4.70, 4.95, 5.25, 5.55, 5.95, 6.45, 6.85, 7.95, 10.55, 13.95, 18.95, 24.95, 33.45],
    '5V': [7.0, 7.4, 7.9, 8.4, 8.9, 9.15, 9.65, 10.2, 10.8, 11.7, 12.4, 13.1, 13.9, 14.9, 15.9, 21.1, 27.7, 37.4, 49.9],
    '8V': [13.0, 13.8, 14.8, 15.8, 16.8, 17.8, 18.8, 19.8, 21.0, 22.2, 22.8, 23.8, 24.8, 29.8, 39.8, 52.8, 70.8, 94.8],
  };
  // Table 7-2 standard belt lengths (in)
  const L3 = [25, 26.5, 28, 30, 31.5, 33.5, 35.5, 37.5, 40, 42.5, 45, 47.5, 50, 53, 56, 60, 63, 67, 71, 75, 80, 85, 90, 95, 100, 106, 112, 118, 125, 132, 140, 165];
  const L5 = [50, 53, 56, 60, 63, 67, 71, 75, 80, 85, 90, 95, 100, 106, 112, 118, 125, 132, 140, 150, 160, 170, 180, 190, 200, 212, 224, 236, 250, 265, 280, 300, 315, 335, 355];
  const L8 = [100, 106, 112, 118, 125, 132, 140, 150, 160, 170, 180, 190, 200, 212, 224, 236, 250, 265, 280, 300, 315, 335, 355, 375, 400, 425, 450, 475, 500];
  const LENGTHS = { '3V': L3, '5V': L5, '8V': L8 };
  // Figure 7-19 CL curve reads (belt length in → CL)
  const CL = {
    '3V': [[25, 0.83], [50, 0.95], [75, 1.02], [100, 1.07], [125, 1.11], [150, 1.14], [165, 1.17]],
    '5V': [[50, 0.85], [75, 0.92], [100, 0.96], [125, 0.99], [150, 1.02], [200, 1.07], [250, 1.10], [300, 1.13], [350, 1.17]],
    '8V': [[100, 0.87], [150, 0.93], [200, 0.97], [250, 1.00], [300, 1.03], [350, 1.05], [400, 1.07], [450, 1.09]],
  };
  // Figure 7-18 Cθ curve reads
  const CTH_X = [80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180];
  const CTH_Y = [0.63, 0.69, 0.74, 0.78, 0.82, 0.86, 0.89, 0.92, 0.95, 0.98, 1.00];
  const nearest = (x, arr) => arr.reduce((b, a) => Math.abs(a - x) < Math.abs(b - x) ? a : b);

  window.TOPIC = {
    id: 'v_belts', book: 'mott',
    title: 'V-Belts — Drive Design',
    subtitle: 'Mott Ch. 7-4 (Table 7-1/7-2, Figs. 7-13 … 7-19, Eqs. 7-12 … 7-17) · merged Fizz §1.4 + Mech §8.3.2',
    sibling: 'v_belts_shigley.html',
    intro: 'Mott\'s 12-step narrow-section (3V/5V/8V) V-belt design (Example Problem 7-2): design power with the Table 7-1 service factor → belt section from Figure 7-13 → sheaves sized for ≈4000 ft/min from the standard sizes on Figures 7-14/15/16 → rated power per belt (basic curve + "power added" for speed ratio) → trial centre distance, belt length, standard length from Table 7-2 and actual CD → wrap angle, C<sub>θ</sub> (Fig. 7-18) and C<sub>L</sub> (Fig. 7-19) → number of belts. Both bibles recommend this method for exams; use the Shigley page if tensions or belt life are asked.',
    example: { P: 50, n1: 1160, n2: 675, SF: 1.3, sec: '5V', D1: 12.4, D2: 21.1, P1: 26.4, Padd: 1.15, CDt: 24, Lstd: 100, Cth: 0.94, CL: 0.96 },

    figures: [
      { id: 'table7-1', ref: 'Table 7-1', title: 'V-belt service factors (driven machine × driver type × hours/day)', src: 'figures/mott/table7-1.png', page: 273 },
      { id: 'fig7-13', ref: 'Figure 7-13', title: 'Belt section selection chart (design power vs speed of faster shaft)', src: 'figures/mott/fig7-13.png', page: 273, note: 'On a boundary choose the larger section (Fizz).' },
      { id: 'fig7-14', ref: 'Figure 7-14', title: 'Power rating per belt: 3V (solid = VR 1.0, dashed = VR ≥ 3.38)', src: 'figures/mott/fig7-14.png', page: 274, note: 'Vertical lines are the standard sheave pitch diameters.' },
      { id: 'fig7-15', ref: 'Figure 7-15', title: 'Power rating per belt: 5V', src: 'figures/mott/fig7-15.png', page: 275 },
      { id: 'fig7-16', ref: 'Figure 7-16', title: 'Power rating per belt: 8V', src: 'figures/mott/fig7-16.png', page: 275 },
      { id: 'fig7-17', ref: 'Figure 7-17', title: 'Power added vs speed ratio: 5V belts', src: 'figures/mott/fig7-17.png', page: 276, note: 'Catalog data are step-wise; above VR = 3.38 nothing more is added. For 3V/8V interpolate between the solid and dashed curves of Figs 7-14/7-16 instead (Mech bible formula).' },
      { id: 'fig7-18', ref: 'Figure 7-18', title: 'Angle-of-wrap correction factor Cθ', src: 'figures/mott/fig7-18.png', page: 276 },
      { id: 'fig7-19', ref: 'Figure 7-19', title: 'Belt-length correction factor CL', src: 'figures/mott/fig7-19.png', page: 276 },
      { id: 'table7-2', ref: 'Table 7-2', title: 'Standard belt lengths for 3V, 5V and 8V belts', src: 'figures/mott/table7-2.png', page: 277 },
      { id: 'fig7-4', ref: 'Figure 7-4', title: 'Belt drive configuration — wrap angles, span, centre distance', src: 'figures/mott/fig7-4.png', page: 265 },
    ],

    sections: [
      { title: 'Step 1–3: design power, section, ratio', steps: [
        { id: 'in', title: 'Design power', fig: ['table7-1'], formula: 'P_{des} = P \\cdot SF,\\qquad VR = \\frac{n_1}{n_2}\\ (n_1 > n_2)',
          text: 'Table 7-1: pick the driven-machine row (smooth / light / moderate / heavy shock) and the driver column (AC normal-torque or high-torque) for the hours per day.',
          vars: [
            { id: 'P', symbol: 'P', label: 'Rated power of prime mover', unit: 'hp', kind: 'input' },
            { id: 'n1', symbol: 'n_1', label: 'Input (faster shaft) speed', unit: 'rpm', kind: 'input' },
            { id: 'n2', symbol: 'n_2', label: 'Desired output speed', unit: 'rpm', kind: 'input', hint: 'mid-point if a range is given' },
            { id: 'SF', symbol: 'SF', label: 'Service factor', unit: '', kind: 'lookup', fig: 'table7-1', default: 1.3, check: v => (H.has(v, 'SF') && (v.SF < 1 || v.SF > 2)) ? 'SF is 1.0–2.0 in Table 7-1' : null },
            { id: 'Pdes', symbol: 'P_{des}', label: 'Design power', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'P', 'SF') ? v.P * v.SF : undefined,
              work: v => H.has(v, 'Pdes') ? '\\(P_{des} = ' + H.fmt(v.P) + '(' + H.fmt(v.SF) + ') = ' + H.fmt(v.Pdes) + '\\ \\text{hp}\\)' : null },
            { id: 'VRn', symbol: 'VR', label: 'Nominal speed ratio', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'n1', 'n2') ? v.n1 / v.n2 : undefined },
          ] },
        { id: 'sec', title: 'Belt section', fig: ['fig7-13'],
          text: 'Enter Figure 7-13 with P<sub>des</sub> on the x-axis and n<sub>1</sub> on the y-axis.',
          vars: [
            { id: 'sec', label: 'Belt section', kind: 'choice', type: 'text', options: ['3V', '5V', '8V'] },
          ] },
      ] },

      { title: 'Step 4–6: sheave sizes', steps: [
        { id: 'd1', title: 'Driving sheave for vb ≈ 4000 ft/min', eq: '7-2', formula: 'v_b = \\frac{D_1 n_1}{2}\\cdot\\frac{2\\pi}{12}\\ \\Rightarrow\\ D_1 = \\frac{2 v_b}{n_1}\\cdot\\frac{12}{2\\pi} = \\frac{12 (4000)}{\\pi n_1}',
          text: 'Then choose a standard pitch diameter from the vertical lines of Figure 7-14/15/16 near this value (auto = nearest standard size). Belt speed should stay under 5000 ft/min (hard max 6500); Mech bible: keep v<sub>b</sub> within ±5 % of 4000 ft/min if you can.',
          fig: ['fig7-14', 'fig7-15', 'fig7-16'],
          vars: [
            { id: 'D1calc', symbol: 'D_{1,calc}', label: 'Driving sheave for 4000 ft/min', unit: 'in', kind: 'calc', compute: v => H.has(v, 'n1') ? 12 * 4000 / (Math.PI * v.n1) : undefined,
              work: v => H.has(v, 'D1calc') ? '\\(D_1 = \\frac{2(4000)}{' + H.fmt(v.n1) + '}\\cdot\\frac{12}{2\\pi} = ' + H.fmt(v.D1calc) + '\\ \\text{in}\\)' : null },
            { id: 'D1', symbol: 'D_1', label: 'Standard driving sheave', unit: 'in', kind: 'lookup', fig: 'fig7-15', auto: v => (SHEAVES[v.sec] && H.has(v, 'D1calc')) ? nearest(v.D1calc, SHEAVES[v.sec]) : undefined, hint: 'try several trial sizes (Table 7-3 style)' },
            { id: 'D2calc', symbol: 'D_{2,calc}', label: 'Driven sheave = D1·VR', unit: 'in', kind: 'calc', compute: v => H.has(v, 'D1', 'VRn') ? v.D1 * v.VRn : undefined },
            { id: 'D2', symbol: 'D_2', label: 'Standard driven sheave', unit: 'in', kind: 'lookup', fig: 'fig7-15', auto: v => (SHEAVES[v.sec] && H.has(v, 'D2calc')) ? nearest(v.D2calc, SHEAVES[v.sec]) : undefined },
            { id: 'VR', symbol: 'VR', label: 'Actual speed ratio D2/D1', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'D1', 'D2') ? v.D2 / v.D1 : undefined },
            { id: 'n2a', symbol: 'n_{2,act}', label: 'Actual output speed', unit: 'rpm', kind: 'calc', compute: v => H.has(v, 'n1', 'VR') ? v.n1 / v.VR : undefined,
              check: v => (H.has(v, 'n2a', 'n2') && Math.abs(v.n2a / v.n2 - 1) > 0.05) ? 'Output speed differs from target by more than 5 % — try other sheave sizes' : null },
            { id: 'vb', symbol: 'v_b', label: 'Actual belt speed', unit: 'ft/min', kind: 'calc', compute: v => H.has(v, 'D1', 'n1') ? Math.PI * v.D1 * v.n1 / 12 : undefined,
              work: v => H.has(v, 'vb') ? '\\(v_b = \\frac{' + H.fmt(v.D1) + '}{2}(' + H.fmt(v.n1) + ')\\frac{2\\pi}{12} = ' + H.fmt(v.vb) + '\\ \\text{ft/min}\\)' : null,
              check: v => (H.has(v, 'vb') && v.vb > 6500) ? 'Above the 6500 ft/min maximum' : (H.has(v, 'vb') && v.vb > 5000) ? 'Above 5000 ft/min — consult sheave supplier' : (H.has(v, 'vb') && v.vb < 1000) ? 'Below 1000 ft/min — consider gears/chain' : null },
          ] },
      ] },

      { title: 'Step 7: rated power per belt', steps: [
        { id: 'rate', title: 'Basic rating and power added for speed ratio', fig: ['fig7-14', 'fig7-15', 'fig7-16', 'fig7-17'],
          formula: 'P_{rated} = P_1 + P_{add}\\qquad\\text{(3V/8V, Mech bible):}\\ P_{rated} = P_2 + \\frac{VR - 3.38}{3.38 - 1}(P_2 - P_1)',
          text: 'Read the solid curve for D<sub>1</sub> at n<sub>1</sub> (interpolate between the 870/1160/1750 rpm curves if needed) → P<sub>1</sub>. For a 5V belt read the power added from Figure 7-17 at the actual VR. For 3V and 8V read the dashed curve (rating at VR ≥ 3.38) → P<sub>2</sub>; the auto value for P<sub>add</sub> then interpolates linearly between VR = 1 and 3.38. VR &gt; 3.38 adds nothing more.',
          vars: [
            { id: 'P1', symbol: 'P_1', label: 'Basic rated power (solid curve, VR = 1)', unit: 'hp', kind: 'lookup', fig: 'fig7-15' },
            { id: 'P2', symbol: 'P_2', label: 'Rating on dashed curve (VR ≥ 3.38) — 3V/8V only', unit: 'hp', kind: 'lookup', fig: 'fig7-14', hint: 'leave blank for 5V (use Fig 7-17)' },
            { id: 'Padd', symbol: 'P_{add}', label: 'Power added for speed ratio', unit: 'hp', kind: 'lookup', fig: 'fig7-17',
              auto: v => (H.has(v, 'P1', 'P2', 'VR')) ? Math.max(0, (v.P2 - v.P1) * Math.min(v.VR - 1, 2.38) / 2.38) : (H.has(v, 'VR') && v.VR <= 1.02 ? 0 : undefined) },
            { id: 'Prated', symbol: 'P_{rated}', label: 'Rated power per belt', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'P1', 'Padd') ? v.P1 + v.Padd : undefined,
              work: v => H.has(v, 'Prated') ? '\\(P_{rated} = ' + H.fmt(v.P1) + ' + ' + H.fmt(v.Padd) + ' = ' + H.fmt(v.Prated) + '\\ \\text{hp}\\)' : null },
          ] },
      ] },

      { title: 'Step 8–9: centre distance and belt length', steps: [
        { id: 'len', title: 'Trial CD, belt length, standard length and actual CD', fig: ['table7-2', 'fig7-4'], eq: '7-12, 7-13, 7-17',
          formula: 'D_2 < CD < 3(D_2 + D_1);\\quad L = 2CD + 1.57(D_2 + D_1) + \\frac{(D_2 - D_1)^2}{4CD};\\quad B = 4L - 6.28(D_2 + D_1),\\ CD = \\frac{B + \\sqrt{B^2 - 32(D_2 - D_1)^2}}{16}',
          text: 'Choose CD<sub>trial</sub> in the allowed range (Mech bible: stay close to D<sub>2</sub> to save space). Pick the nearest standard length for the section from Table 7-2 (auto), then recompute the actual CD.',
          vars: [
            { id: 'CDt', symbol: 'CD_{trial}', label: 'Trial centre distance', unit: 'in', kind: 'input', auto: v => H.has(v, 'D2', 'D1') ? Math.ceil(v.D2 * 1.15) : undefined,
              check: v => (H.has(v, 'CDt', 'D1', 'D2') && (v.CDt <= v.D2 || v.CDt >= 3 * (v.D1 + v.D2))) ? 'Outside D2 < CD < 3(D2 + D1)' : null },
            { id: 'CDlo', symbol: 'CD_{min}', label: 'Lower limit D2', unit: 'in', kind: 'calc', compute: v => H.has(v, 'D2') ? v.D2 : undefined },
            { id: 'CDhi', symbol: 'CD_{max}', label: 'Upper limit 3(D2 + D1)', unit: 'in', kind: 'calc', compute: v => H.has(v, 'D1', 'D2') ? 3 * (v.D1 + v.D2) : undefined },
            { id: 'Lreq', symbol: 'L', label: 'Required belt length', unit: 'in', kind: 'calc', compute: v => H.has(v, 'CDt', 'D1', 'D2') ? 2 * v.CDt + 1.57 * (v.D1 + v.D2) + (v.D2 - v.D1) ** 2 / (4 * v.CDt) : undefined,
              work: v => H.has(v, 'Lreq') ? '\\(L = 2(' + H.fmt(v.CDt) + ') + 1.57(' + H.fmt(v.D2) + '+' + H.fmt(v.D1) + ') + \\frac{(' + H.fmt(v.D2) + '-' + H.fmt(v.D1) + ')^2}{4(' + H.fmt(v.CDt) + ')} = ' + H.fmt(v.Lreq) + '\\ \\text{in}\\)' : null },
            { id: 'Lstd', symbol: 'L_{std}', label: 'Standard belt length', unit: 'in', kind: 'lookup', fig: 'table7-2', auto: v => (LENGTHS[v.sec] && H.has(v, 'Lreq')) ? nearest(v.Lreq, LENGTHS[v.sec]) : undefined },
            { id: 'B', symbol: 'B', label: 'B = 4L − 6.28(D2 + D1)', unit: 'in', kind: 'calc', compute: v => H.has(v, 'Lstd', 'D1', 'D2') ? 4 * v.Lstd - 6.28 * (v.D1 + v.D2) : undefined },
            { id: 'CD', symbol: 'CD', label: 'Actual centre distance', unit: 'in', kind: 'calc', compute: v => { if (!H.has(v, 'B', 'D1', 'D2')) return undefined; const r = v.B * v.B - 32 * (v.D2 - v.D1) ** 2; return r >= 0 ? (v.B + Math.sqrt(r)) / 16 : undefined; },
              work: v => H.has(v, 'CD') ? '\\(CD = \\frac{' + H.fmt(v.B) + ' + \\sqrt{' + H.fmt(v.B) + '^2 - 32(' + H.fmt(v.D2) + '-' + H.fmt(v.D1) + ')^2}}{16} = ' + H.fmt(v.CD) + '\\ \\text{in}\\)' : null },
          ] },
      ] },

      { title: 'Step 10–12: corrections and number of belts', steps: [
        { id: 'wrap', title: 'Angle of wrap and correction factors', fig: ['fig7-18', 'fig7-19'], eq: '7-14, 7-15',
          formula: '\\theta_1 = 180^\\circ - 2\\sin^{-1}\\frac{D_2 - D_1}{2CD},\\qquad \\theta_2 = 180^\\circ + 2\\sin^{-1}\\frac{D_2 - D_1}{2CD}',
          text: 'θ<sub>1</sub> should exceed 120°. C<sub>θ</sub> from Figure 7-18 at θ<sub>1</sub>; C<sub>L</sub> from Figure 7-19 at the standard length for the section (auto values are reads of the curves — check the charts).',
          vars: [
            { id: 'th1', symbol: '\\theta_1', label: 'Wrap angle, small sheave', unit: '°', kind: 'calc', compute: v => H.has(v, 'D1', 'D2', 'CD') ? 180 - 2 * H.deg(Math.asin((v.D2 - v.D1) / (2 * v.CD))) : undefined,
              work: v => H.has(v, 'th1') ? '\\(\\theta_1 = 180^\\circ - 2\\sin^{-1}\\frac{' + H.fmt(v.D2) + '-' + H.fmt(v.D1) + '}{2(' + H.fmt(v.CD) + ')} = ' + H.fmt(v.th1) + '^\\circ\\)' : null,
              check: v => (H.has(v, 'th1') && v.th1 < 120) ? 'θ1 < 120° — increase CD' : null },
            { id: 'th2', symbol: '\\theta_2', label: 'Wrap angle, large sheave', unit: '°', kind: 'calc', compute: v => H.has(v, 'th1') ? 360 - v.th1 : undefined },
            { id: 'Cth', symbol: 'C_\\theta', label: 'Angle-of-wrap correction factor', unit: '', kind: 'lookup', fig: 'fig7-18', auto: v => H.has(v, 'th1') ? H.interp(v.th1, CTH_X, CTH_Y) : undefined },
            { id: 'CL', symbol: 'C_L', label: 'Belt-length correction factor', unit: '', kind: 'lookup', fig: 'fig7-19', auto: v => (CL[v.sec] && H.has(v, 'Lstd')) ? H.interp(v.Lstd, CL[v.sec].map(x => x[0]), CL[v.sec].map(x => x[1])) : undefined },
          ] },
        { id: 'nb', title: 'Corrected power rating and number of belts', formula: 'P_{corr} = C_\\theta C_L P_{rated},\\qquad N_{belts} = \\left\\lceil \\frac{P_{des}}{P_{corr}} \\right\\rceil',
          vars: [
            { id: 'Pcorr', symbol: 'P_{corr}', label: 'Corrected power rating per belt', unit: 'hp', kind: 'calc', compute: v => H.has(v, 'Cth', 'CL', 'Prated') ? v.Cth * v.CL * v.Prated : undefined,
              work: v => H.has(v, 'Pcorr') ? '\\(P_{corr} = (' + H.fmt(v.Cth) + ')(' + H.fmt(v.CL) + ')(' + H.fmt(v.Prated) + ') = ' + H.fmt(v.Pcorr) + '\\ \\text{hp}\\)' : null },
            { id: 'Ncalc', symbol: 'P_{des}/P_{corr}', label: 'Belts required (unrounded)', unit: '', kind: 'calc', digits: 3, compute: v => H.has(v, 'Pdes', 'Pcorr') ? v.Pdes / v.Pcorr : undefined },
            { id: 'Nb', symbol: 'N_{belts}', label: 'Number of belts (round UP)', unit: '', kind: 'calc', compute: v => H.has(v, 'Ncalc') ? Math.ceil(v.Ncalc - 1e-9) : undefined,
              work: v => H.has(v, 'Nb') ? '\\(N = ' + H.fmt(v.Pdes) + '/' + H.fmt(v.Pcorr) + ' = ' + H.fmt(v.Ncalc, 3) + ' \\rightarrow ' + v.Nb + '\\ \\text{belts}\\)' : null },
          ],
          after: v => {
            if (!H.has(v, 'Nb')) return '';
            return '<span class="result-ok">Design summary</span> — ' + v.Nb + ' × ' + (v.sec || '') + ' belts, ' + H.fmt(v.Lstd) + ' in length; sheaves ' + H.fmt(v.D1) + ' in (driver, ' + v.Nb + ' grooves) and ' + H.fmt(v.D2) + ' in (driven); CD = ' + H.fmt(v.CD) + ' in; actual output speed ' + H.fmt(v.n2a) + ' rpm; belt speed ' + H.fmt(v.vb) + ' ft/min; design power ' + H.fmt(v.Pdes) + ' hp vs ' + H.fmt(v.Nb * v.Pcorr) + ' hp capacity.';
          } },
      ] },
    ],
  };
})();
