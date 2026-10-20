/* Ball & cylindrical roller bearings — Mott 6e Ch. 14 (Secs 14-6 .. 14-11).
 * Procedure: Fizz bible pp. 96-100 (Shigley-style Weibull) mapped onto Mott's C = Pd (Ld/1e6)^(1/k) with the
 * reliability adjustment of Eq. 14-6 / Table 14-6 (also used by Fizz p. 113 Step 21). Mech bible unit 4 (PDF p. 129) is empty.
 * Verified against: Mott Example Problem 14-4 (R = 1850 lb, T = 675 lb, 1150 rpm, 20 000 h, Dmin = 3.10 in, Y assumed 1.50):
 *   P = 2049 lb, Ld = 1.38e9 rev, C = 22 807 lb -> 6316 (C = 27 878, Co = 19 447); T/Co = 0.0347, e = 0.25, Y = 1.78 (Mott's reading),
 *   P = 2238 lb, C = 24 910 lb -> 6316 still OK -> PASS (table pick 6316). Ex. 14-2/14-3 radial only: 650 lb, 600 rpm, 30 000 h,
 *   Dmin 1.48 in -> C = 6670 lb -> 6208 (table pick);
 *   Final-exam review Q1(d) (1160 rpm, 6 h/day, 20 days/month, 5 yr = 501e6 rev; C: 250 lb, bore >= 11.2 mm -> C10 1985 lb -> 6301, S 17 mm;
 *   A: 166 lb -> 1318 lb -> 6201 at the same 12 mm bore);
 *   HW4 2023 P8(e) (240 rpm, 8 h/day, 20 days/month, 5 yr = 1.38e8 rev; B: 678 lb, bore >= 59 mm -> 3507 lb -> 6012 (6655), S 67 mm;
 *   C: 1307 lb, bore >= 83 mm -> 6760 lb -> 6017 (11 106), S 92 mm); HW4 2024 P8(e) (480 rpm -> 2.76e8 rev, 373 lb, bore >= 14.6 mm ->
 *   C ≈ 2430 lb (solution 2453) -> 6302 (2563 lb), S 20 mm). */
(function () {
  // Mott Table 14-5
  const TC0 = [0.014, 0.028, 0.056, 0.084, 0.110, 0.170, 0.280, 0.420, 0.560];
  const E = [0.19, 0.22, 0.26, 0.28, 0.30, 0.34, 0.38, 0.42, 0.44];
  const Y = [2.30, 1.99, 1.71, 1.55, 1.45, 1.31, 1.15, 1.04, 1.00];
  const CRtab = { 90: 1.0, 95: 0.62, 96: 0.53, 97: 0.44, 98: 0.33, 99: 0.21 };
  // Table 14-3: number, bore mm, bore in, Co lb, C lb, min shaft shoulder S mm, max housing shoulder H mm
  const T143 = [['6000', 10, 0.3937, 441, 1039, 12, 24], ['6200', 10, 0.3937, 531, 1140, 14, 26], ['6300', 10, 0.3937, 1812, 764, 14, 31],
    ['6001', 12, 0.4724, 531, 1140, 14, 26], ['6201', 12, 0.4724, 697, 1549, 16, 28], ['6301', 12, 0.4724, 933, 2192, 17, 32],
    ['6002', 15, 0.5906, 641, 1257, 17, 30], ['6202', 15, 0.5906, 843, 1754, 19, 31], ['6302', 15, 0.5906, 1214, 2563, 20, 37],
    ['6003', 17, 0.6693, 731, 1360, 19, 33], ['6203', 17, 0.6693, 1068, 2149, 21, 36], ['6303', 17, 0.6693, 1473, 3035, 22, 42],
    ['6004', 20, 0.7874, 1124, 2104, 24, 38], ['6204', 20, 0.7874, 1473, 2855, 25, 42], ['6304', 20, 0.7874, 1754, 3575, 27, 45],
    ['6005', 25, 0.9843, 1473, 2518, 29, 43], ['6205', 25, 0.9843, 1754, 3147, 30, 47], ['6305', 25, 0.9843, 2608, 5058, 32, 55],
    ['6006', 30, 1.1811, 1866, 2990, 35, 50], ['6206', 30, 1.1811, 2518, 4384, 35, 57], ['6306', 30, 1.1811, 3597, 6317, 37, 65],
    ['6007', 35, 1.3780, 2293, 3575, 40, 57], ['6207', 35, 1.3780, 3440, 5733, 42, 65], ['6307', 35, 1.3780, 4272, 7464, 43, 72],
    ['6008', 40, 1.5748, 2608, 3777, 45, 63], ['6208', 40, 1.5748, 4272, 6902, 47, 73], ['6308', 40, 1.5748, 5396, 9218, 48, 82],
    ['6009', 45, 1.7717, 3282, 4676, 50, 70], ['6209', 45, 1.7717, 4856, 7464, 52, 78], ['6309', 45, 1.7717, 7082, 11848, 53, 92],
    ['6010', 50, 1.9685, 3597, 4856, 55, 75], ['6210', 50, 1.9685, 5216, 7891, 57, 83], ['6310', 50, 1.9685, 8543, 13894, 59, 101],
    ['6011', 55, 2.1654, 4766, 6317, 62, 83], ['6211', 55, 2.1654, 6520, 9802, 63, 92], ['6311', 55, 2.1654, 10117, 16075, 64, 111],
    ['6012', 60, 2.3622, 5216, 6655, 67, 88], ['6212', 60, 2.3622, 7307, 10679, 68, 102], ['6312', 60, 2.3622, 11691, 18413, 71, 119],
    ['6013', 65, 2.5591, 5621, 6902, 72, 93], ['6213', 65, 2.5591, 9105, 12567, 73, 112], ['6313', 65, 2.5591, 13489, 20751, 76, 129],
    ['6014', 70, 2.7559, 6969, 8476, 77, 103], ['6214', 70, 2.7559, 10117, 13602, 78, 117], ['6314', 70, 2.7559, 15288, 23381, 81, 139],
    ['6015', 75, 2.9528, 7531, 8925, 82, 108], ['6215', 75, 2.9528, 11016, 14906, 83, 122], ['6315', 75, 2.9528, 17199, 25629, 86, 149],
    ['6016', 80, 3.1496, 8993, 10679, 87, 118], ['6216', 80, 3.1496, 12365, 15782, 89, 131], ['6316', 80, 3.1496, 19447, 27878, 91, 159],
    ['6017', 85, 3.3465, 9667, 11106, 92, 123], ['6217', 85, 3.3465, 14388, 18705, 94, 141], ['6317', 85, 3.3465, 21695, 29901, 98, 167],
    ['6018', 90, 3.5433, 11241, 13152, 98, 132], ['6218', 90, 3.5433, 16524, 21493, 99, 151], ['6318', 90, 3.5433, 24281, 32149, 103, 177],
    ['6019', 95, 3.7402, 12140, 13602, 103, 137], ['6219', 95, 3.7402, 18323, 24281, 106, 159], ['6319', 95, 3.7402, 26529, 34397, 108, 187],
    ['6020', 100, 3.9370, 12140, 13602, 108, 142], ['6220', 100, 3.9370, 20908, 27878, 111, 169], ['6320', 100, 3.9370, 31475, 39119, 113, 202],
    ['6021', 105, 4.1339, 14726, 16367, 114, 151], ['6221', 105, 4.1339, 23381, 29901, 116, 179], ['6321', 105, 4.1339, 34397, 40917, 118, 212],
    ['6022', 110, 4.3307, 16524, 18413, 119, 161], ['6222', 110, 4.3307, 26529, 32149, 121, 189], ['6322', 110, 4.3307, 40468, 45638, 123, 227],
    ['6024', 120, 4.7244, 17986, 19155, 129, 171], ['6224', 120, 4.7244, 26529, 32824, 131, 204], ['6324', 120, 4.7244, 41817, 46763, 133, 247],
    ['6026', 130, 5.1181, 22482, 23831, 139, 191], ['6226', 130, 5.1181, 29676, 35072, 143, 217], ['6326', 130, 5.1181, 48561, 51484, 146, 264]];
  const thrust = v => v.mode === 'radial + thrust';
  const first = (...a) => a.find(x => x !== undefined);
  const Creq = (v, P) => H.has(v, 'Ld', 'CR', 'k') && P !== undefined && v.CR > 0 ? P * Math.pow(v.Ld / (v.CR * 1e6), 1 / v.k) : undefined;
  // selection: smallest bore ≥ Dmin, lightest series (00 → 02 → 03) with C ≥ required
  function selTab(v, req, ids) {
    if (!(req > 0)) return '';
    const all = T143.filter(r => !(v.Dmin > 0) || r[2] >= v.Dmin - 1e-4);
    const k = all.findIndex(r => r[4] >= req);
    const lo = Math.max(0, (k < 0 ? all.length : k) - 2), rows = all.slice(lo, lo + 5).map((r, i) => {
      const set = {}; ids.forEach((id, j) => { if (id) set[id] = [r[0], r[2], r[4], r[3]][j]; });
      return { cells: [r[0], r[1] + ' (' + r[2] + ')', H.fmt(r[4], 6), H.fmt(r[3], 6), H.fmt(r[4] / req, 3), r[5] + ' / ' + r[6]], ok: r[4] >= req, pick: lo + i === k, set };
    });
    return H.table(['Bearing', 'bore mm (in)', 'C (lb)', 'C_o (lb)', 'C / required', 'S / H shoulder (mm)'], rows, {
      caption: 'Table 14-3 candidates for C ≥ ' + H.fmt(req, 5) + ' lb' + (v.Dmin > 0 ? ', bore ≥ ' + H.fmt(v.Dmin) + ' in (' + H.fmt(v.Dmin * 25.4, 3) + ' mm)' : ''),
      note: 'Pick = smallest bore that fits the shaft, lightest series (60xx → 62xx → 63xx) with C ≥ required. Specify the shaft shoulder ≥ S. Course: review Q1 → 6301 (S 17 mm); HW4 2023 P8 → 6012 / 6017; Mott Ex. 14-3 → 6208.' + (k < 0 ? ' <b>No bearing in Table 14-3 is large enough.</b>' : ''),
    });
  }

  window.TOPIC = {
    id: 'ball_cyl_bearings', book: 'mott',
    title: 'Ball & Cylindrical Roller Bearings',
    subtitle: 'Mott Ch. 14 Secs 14-6 to 14-11 · Fizz pp. 96-101, 113 · basic dynamic load rating C',
    sibling: 'ball_cyl_bearings_shigley.html',
    intro: 'Mott sizes a bearing by the required <b>basic dynamic load rating</b> \\(C = P_d (L_d/10^6)^{1/k}\\) (Eq. 14-3), <i>k</i> = 3 ball, 3.33 roller; above 90 % reliability the \\(10^6\\) is multiplied by \\(C_{R}\\) (Table 14-6). ' +
      'Thrust: \\(P = VXR + YT\\) with <i>Y</i> depending on \\(T/C_o\\) of the bearing — assume <i>Y</i>, select from Table 14-3, re-read, repeat (Ex. 14-4 is loaded).',
    example: { mode: 'radial + thrust', R: 1850, Tload: 675, n: 1150, Lh: 20000, rel: 90, btype: 'single-row deep-groove ball (k = 3)', ring: 'inner race rotates (V = 1.0)', Dmin: 3.10, X: 0.56, Ya: 1.50, bear1: '6316', bore1: 3.1496, Csel1: 27878, Co1: 19447, e1: 0.25, Yb: 1.78, bear2: '6316', Csel2: 27878 },

    assumptions: [
      { text: 'Rotation factor V = 1.0 (inner race rotates); 1.2 if the outer race rotates', src: 'Fizz p.99 · Mott Sec. 14-9', var: 'ring' },
      { text: 'Design life from Table 14-4 if not given; course problems build it up as rpm × 60 × h/day × days/month × 12 × years', src: 'Fizz p.97 · Fizz p.113', var: 'Lh' },
      { text: 'Reliability 90 % (catalogue L_10, C_R = 1) unless stated; otherwise \\(L_1 = C_R \\cdot 10^6\\) (Table 14-6)', src: 'Fizz p.113', var: 'rel' },
      { text: 'Load-life exponent k = 3.00 ball, 3.33 roller', src: 'Fizz p.113 · Fizz p.98', var: 'k' },
      { text: 'Thrust case: assume T/R > e, X = 0.56, Y = 1.63 first (Fizz; Mott Ex. 14-4 assumes 1.50)', src: 'Fizz p.99 · Mott Sec. 14-10', var: 'Ya' },
      { text: 'Interpolate e and Y in Table 14-5 at the actual T/C_o (first row if below 0.014)', src: 'Fizz p.100 · Fizz p.101', step: 'Y1' },
      { text: 'Repeat until the same bearing is selected twice in a row', src: 'Fizz p.101', step: 'it2' },
    ],

    figures: [
      { id: 'fig14-1', ref: 'Figure 14-1', title: 'Single-row deep-groove ball bearing nomenclature (bore d, OD D, width B, races, cage)', src: 'figures/mott/fig14-1.png', page: 581 },
      { id: 'fig14-3', ref: 'Figures 14-3 / 14-4', title: 'Angular-contact ball bearing and cylindrical roller bearing', src: 'figures/mott/fig14-3-4.png', page: 583 },
      { id: 't14-1', ref: 'Table 14-1', title: 'Comparison of bearing types: radial, thrust and misalignment capability', src: 'figures/mott/table14-1.png', page: 582 },
      { id: 't14-4', ref: 'Table 14-4', title: 'Recommended design life L_10 (hours) by application', src: 'figures/mott/table14-4.png', page: 592 },
      { id: 't14-6', ref: 'Table 14-6', title: 'Life adjustment factors for reliability C_R (90 % → 1.0 … 99 % → 0.21)', src: 'figures/mott/table14-6.png', page: 595 },
      { id: 'proc', ref: 'Sec. 14-10 procedure', title: 'Mott procedure for selecting a bearing — radial and thrust load', src: 'figures/mott/proc14-10.png', page: 594 },
      { id: 't14-5', ref: 'Table 14-5', title: 'Radial and thrust factors e, Y vs T/C_o for single-row deep-groove ball bearings (X = 0.56)', src: 'figures/mott/table14-5.png', page: 594,
        note: 'Mott Ex. 14-4 reads e ≈ 0.25, Y = 1.78 at T/C_o = 0.0347.' },
      { id: 't14-3a', ref: 'Table 14-3', title: 'Deep-groove ball bearings 6000–6308 (bore 10–40 mm): C_o, C, shoulders S, H', src: 'figures/mott/table14-3a.png', page: 589,
        note: '100-series extra light, 200 light, 300 medium.' },
      { id: 't14-3b', ref: 'Table 14-3 (cont.)', title: 'Bearings 6009–6316 (bore 45–80 mm)', src: 'figures/mott/table14-3b.png', page: 590 },
      { id: 't14-3c', ref: 'Table 14-3 (cont.)', title: 'Bearings 6017–6326 (bore 85–130 mm)', src: 'figures/mott/table14-3c.png', page: 591 },
      { id: 'skf-dg', ref: 'SKF table 1.1 (catalogue p.272)', book: 'course', title: 'SKF single-row deep groove ball bearings, d = 25–30 mm (6205, 6305 …)', src: 'figures/course/skf_deep_groove_ball_d25_30_p272.png' },
      { id: 'skf-cyl', ref: 'SKF table 6.1 (catalogue p.516)', book: 'course', title: 'SKF single-row cylindrical roller bearings, d = 15–25 mm', src: 'figures/course/skf_cylindrical_roller_d15_25_p516.png' },
    ],

    sections: [
      { title: 'Inputs', steps: [
        { id: 'in', title: 'Loads, speed and bearing type', fig: ['fig14-1', 't14-1', 'fig14-3'],
          text: 'Radial load <i>R</i> = resultant bearing reaction; thrust <i>T</i> only on the bearing that takes it. Rotating inner race → interference fit on the shaft, clearance in the housing.',
          vars: [
            { id: 'mode', label: 'Loading', kind: 'choice', type: 'text', default: 'radial only', options: ['radial only', 'radial + thrust'] },
            { id: 'Rx', symbol: 'R_x', label: 'Radial reaction, x', unit: 'lb', kind: 'input', hint: 'optional' },
            { id: 'Ry', symbol: 'R_y', label: 'Radial reaction, y', unit: 'lb', kind: 'input', hint: 'optional' },
            { id: 'R', symbol: 'R', label: 'Radial load', unit: 'lb', kind: 'input', auto: v => H.has(v, 'Rx', 'Ry') ? Math.hypot(v.Rx, v.Ry) : undefined, hint: 'blank → from R_x, R_y' },
            { id: 'Tload', symbol: 'T', label: 'Thrust load', unit: 'lb', kind: 'input' },
            { id: 'n', symbol: 'n', label: 'Shaft speed', unit: 'rpm', kind: 'input' },
            { id: 'Dmin', symbol: 'D_{\\mathrm{min}}', label: 'Minimum shaft diameter at the bearing', unit: 'in', kind: 'input', hint: 'bore must be ≥ this' },
            { id: 'btype', label: 'Bearing type', kind: 'choice', type: 'text', default: 'single-row deep-groove ball (k = 3)', options: ['single-row deep-groove ball (k = 3)', 'angular-contact ball (k = 3)', 'cylindrical roller (k = 3.33)'] },
            { id: 'k', symbol: 'k', label: 'Load-life exponent', unit: '', kind: 'calc', digits: 3, compute: v => v.btype ? (/roller/.test(v.btype) ? 3.33 : 3) : undefined },
            { id: 'ring', label: 'Rotating race', kind: 'choice', type: 'text', default: 'inner race rotates (V = 1.0)', options: ['inner race rotates (V = 1.0)', 'outer race rotates (V = 1.2)'] },
            { id: 'V', symbol: 'V', label: 'Rotation factor', unit: '', kind: 'calc', digits: 2, compute: v => v.ring ? (/outer/.test(v.ring) ? 1.2 : 1) : undefined },
          ] },
        { id: 'life', title: 'Design life', fig: ['t14-4'], formula: 'L_d = (h)(\\text{rpm})(60) \\qquad h = (\\text{h/day})(\\text{days/month})(12)(\\text{years})',
          text: 'Type the hours (Table 14-4) or the usage pattern (review Q1: 6 h/day, 20 days/month, 5 years = 7200 h).',
          vars: [
            { id: 'hpd', symbol: 'h/\\text{day}', label: 'Hours per day', unit: 'h', kind: 'input', hint: 'optional' },
            { id: 'dpm', symbol: '\\text{days/mo}', label: 'Days per month', unit: '', kind: 'input', hint: 'optional' },
            { id: 'yrs', symbol: '\\text{years}', label: 'Years', unit: '', kind: 'input', hint: 'optional' },
            { id: 'Lh', symbol: 'h', label: 'Design life', unit: 'h', kind: 'lookup', fig: 't14-4', auto: v => H.has(v, 'hpd', 'dpm', 'yrs') ? v.hpd * v.dpm * 12 * v.yrs : undefined },
            { id: 'Ld', symbol: 'L_d', label: 'Design life in revolutions', unit: 'rev', kind: 'calc', digits: 4, compute: v => H.has(v, 'Lh', 'n') ? v.Lh * v.n * 60 : undefined,
              work: v => v.Ld !== undefined ? '\\(L_d = (' + H.fmt(v.Lh) + ')(' + H.fmt(v.n) + ')(60) = ' + H.fmt(v.Ld) + '\\text{ rev}\\)' : null },
          ] },
        { id: 'rel', title: 'Reliability adjustment', eq: '14-6', fig: ['t14-6'], formula: 'L_1 = C_R \\cdot 10^6',
          text: 'Catalogue ratings are \\(L_{10}\\) (90 % of bearings reach it). Higher reliability shrinks the rated life by \\(C_{R}\\).',
          vars: [
            { id: 'rel', symbol: 'R', label: 'Required reliability', unit: '%', kind: 'choice', default: 90, options: [90, 95, 96, 97, 98, 99] },
            { id: 'CR', symbol: 'C_R', label: 'Reliability factor', unit: '', kind: 'lookup', fig: 't14-6', auto: v => CRtab[v.rel] },
            { id: 'L1', symbol: 'L_1', label: 'Adjusted catalogue life', unit: 'rev', kind: 'calc', digits: 4, compute: v => v.CR !== undefined ? v.CR * 1e6 : undefined },
          ] },
      ] },

      { title: 'Radial load only (Mott Sec. 14-9)', steps: [
        { id: 'Cr', title: 'Design load and required C', eq: '14-4 / 14-3', when: v => !thrust(v),
          formula: 'P_d = V R \\qquad C = P_d \\left(\\frac{L_d}{C_R \\cdot 10^6}\\right)^{1/k}',
          vars: [
            { id: 'Pr', symbol: 'P_d', label: 'Design load', unit: 'lb', kind: 'calc', digits: 4, compute: v => H.has(v, 'V', 'R') ? v.V * v.R : undefined },
            { id: 'Creq', symbol: 'C', label: 'Required C', unit: 'lb', kind: 'calc', digits: 4, compute: v => Creq(v, v.Pr),
              work: v => v.Creq !== undefined ? '\\(C = ' + H.fmt(v.Pr) + '\\left(\\dfrac{' + H.fmt(v.Ld) + '}{' + H.fmt(v.CR) + '\\times 10^6}\\right)^{1/' + H.fmt(v.k) + '} = ' + H.fmt(v.Creq) + '\\text{ lb}\\)' : null },
            { id: 'CreqkN', symbol: 'C', label: 'Required C in kN', unit: 'kN', kind: 'calc', digits: 4, compute: v => v.Creq !== undefined ? v.Creq / 224.809 : undefined },
          ] },
        { id: 'selr', title: 'Select from Table 14-3', fig: ['t14-3a', 't14-3b', 't14-3c', 'skf-dg', 'skf-cyl'], when: v => !thrust(v),
          text: 'Pick from the table (★) or read Table 14-3: bore ≥ \\(D_{\\mathrm{min}}\\), dynamic <i>C</i> ≥ required.',
          vars: [
            { id: 'bearR', label: 'Bearing number', kind: 'input', type: 'text', hint: 'e.g. 6208' },
            { id: 'boreR', symbol: 'd', label: 'Bore', unit: 'in', kind: 'lookup', fig: 't14-3a', check: v => (H.has(v, 'boreR', 'Dmin') && v.boreR < v.Dmin) ? 'Bore is smaller than the minimum shaft diameter' : null },
            { id: 'CselR', symbol: 'C_{\\mathrm{cat}}', label: 'Catalogue dynamic C', unit: 'lb', kind: 'lookup', fig: 't14-3a' },
            { id: 'L10act', symbol: 'L_{10}', label: 'Expected life of the selection (Eq. 14-1)', unit: 'rev', kind: 'calc', digits: 4, compute: v => H.has(v, 'CselR', 'Pr', 'k', 'CR') && v.Pr > 0 ? v.CR * 1e6 * Math.pow(v.CselR / v.Pr, v.k) : undefined },
          ],
          after: v => selTab(v, v.Creq, ['bearR', 'boreR', 'CselR']) + (!H.has(v, 'CselR', 'Creq') ? '' : v.CselR >= v.Creq ? '<span class="result-ok">' + (v.bearR || 'Bearing') + ': C = ' + H.fmt(v.CselR) + ' lb ≥ ' + H.fmt(v.Creq) + ' lb ✔ (life ≈ ' + H.fmt(v.L10act / 60 / v.n) + ' h)</span>' : '<span class="result-bad">Under-rated — heavier series or larger bore.</span>') },
      ] },

      { title: 'Radial + thrust (Mott Sec. 14-10) — iteration 1', steps: [
        { id: 'P1', title: 'Steps 1–2 — assume Y, equivalent load', eq: '14-5', fig: ['proc', 't14-5'], when: thrust,
          formula: 'P = V X R + Y T',
          text: 'X = 0.56 in every row of Table 14-5. Either first-guess Y converges to the same bearing.',
          vars: [
            { id: 'X', symbol: 'X', label: 'Radial factor', unit: '', kind: 'lookup', fig: 't14-5', default: 0.56 },
            { id: 'Ya', symbol: 'Y', label: 'Assumed thrust factor', unit: '', kind: 'lookup', fig: 't14-5', default: 1.63, hint: 'Fizz 1.63; Mott Ex. 14-4 uses 1.50' },
            { id: 'P1', symbol: 'P', label: 'Equivalent load (1st)', unit: 'lb', kind: 'calc', digits: 4, compute: v => H.has(v, 'V', 'X', 'R', 'Ya', 'Tload') ? v.V * v.X * v.R + v.Ya * v.Tload : undefined,
              work: v => v.P1 !== undefined ? '\\(P = (' + H.fmt(v.V) + ')(' + H.fmt(v.X) + ')(' + H.fmt(v.R) + ') + ' + H.fmt(v.Ya) + '(' + H.fmt(v.Tload) + ') = ' + H.fmt(v.P1) + '\\text{ lb}\\)' : null },
          ] },
        { id: 'C1', title: 'Steps 3–5 — required C, candidate bearing, its C_o', eq: '14-3', fig: ['t14-3a', 't14-3b', 't14-3c'], when: thrust,
          formula: 'C = P \\left(\\frac{L_d}{C_R \\cdot 10^6}\\right)^{1/k}',
          vars: [
            { id: 'C1', symbol: 'C', label: 'Required C (1st)', unit: 'lb', kind: 'calc', digits: 4, compute: v => Creq(v, v.P1),
              work: v => v.C1 !== undefined ? '\\(C = ' + H.fmt(v.P1) + '\\left(\\dfrac{' + H.fmt(v.Ld) + '}{' + H.fmt(v.CR) + '\\times10^6}\\right)^{1/' + H.fmt(v.k) + '} = ' + H.fmt(v.C1) + '\\text{ lb}\\)' : null },
            { id: 'bear1', label: 'Candidate bearing', kind: 'input', type: 'text', hint: 'e.g. 6316' },
            { id: 'bore1', symbol: 'd', label: 'Bore', unit: 'in', kind: 'lookup', fig: 't14-3b', check: v => (H.has(v, 'bore1', 'Dmin') && v.bore1 < v.Dmin) ? 'Bore < D_min' : null },
            { id: 'Csel1', symbol: 'C_{\\mathrm{cat}}', label: 'Catalogue dynamic C', unit: 'lb', kind: 'lookup', fig: 't14-3b' },
            { id: 'Co1', symbol: 'C_o', label: 'Catalogue static C_o', unit: 'lb', kind: 'lookup', fig: 't14-3b' },
          ],
          after: v => selTab(v, v.C1, ['bear1', 'bore1', 'Csel1', 'Co1']) },
        { id: 'Y1', title: 'Steps 6–9 — T/C_o, e, new Y, recompute P and C', fig: ['t14-5'], when: thrust,
          text: 'If \\(T/R < e\\) the thrust is negligible: \\(P = VR\\). Mott Ex. 14-4 reads e ≈ 0.25, Y = 1.78 at \\(T/C_o\\) = 0.0347 (straight-line interpolation: 0.23, 1.92) — same 6316 either way.',
          vars: [
            { id: 'TCo1', symbol: 'T/C_o', label: 'Thrust ratio', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'Tload', 'Co1') && v.Co1 > 0 ? v.Tload / v.Co1 : undefined },
            { id: 'e1', symbol: 'e', label: 'Limit ratio', unit: '', kind: 'lookup', fig: 't14-5', auto: v => v.TCo1 !== undefined ? H.interp(v.TCo1, TC0, E) : undefined },
            { id: 'TR', symbol: 'T/R', label: 'Thrust-to-radial ratio', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'Tload', 'R') && v.R > 0 ? v.Tload / v.R : undefined },
            { id: 'Yb', symbol: 'Y', label: 'Thrust factor from Table 14-5', unit: '', kind: 'lookup', fig: 't14-5', auto: v => v.TCo1 !== undefined ? H.interp(v.TCo1, TC0, Y) : undefined },
            { id: 'P2', symbol: 'P', label: 'Equivalent load (2nd)', unit: 'lb', kind: 'calc', digits: 4,
              compute: v => !H.has(v, 'V', 'R', 'TR', 'e1') ? undefined : v.TR > v.e1 ? (H.has(v, 'X', 'Yb', 'Tload') ? v.V * v.X * v.R + v.Yb * v.Tload : undefined) : v.V * v.R,
              work: v => v.P2 === undefined ? null : v.TR > v.e1 ? '\\(T/R = ' + H.fmt(v.TR) + ' > e = ' + H.fmt(v.e1) + ':\\ P = (' + H.fmt(v.V) + ')(' + H.fmt(v.X) + ')(' + H.fmt(v.R) + ') + ' + H.fmt(v.Yb) + '(' + H.fmt(v.Tload) + ') = ' + H.fmt(v.P2) + '\\)' : '\\(T/R \\le e:\\ P = VR = ' + H.fmt(v.P2) + '\\)' },
            { id: 'C2', symbol: 'C', label: 'Required C (2nd)', unit: 'lb', kind: 'calc', digits: 4, compute: v => Creq(v, v.P2),
              work: v => v.C2 !== undefined ? '\\(C = ' + H.fmt(v.P2) + '\\left(\\dfrac{' + H.fmt(v.Ld) + '}{' + H.fmt(v.CR) + '\\times10^6}\\right)^{1/' + H.fmt(v.k) + '} = ' + H.fmt(v.C2) + '\\text{ lb}\\)' : null },
            { id: 'bear2', label: 'Bearing that satisfies the new C', kind: 'input', type: 'text' },
            { id: 'Csel2', symbol: 'C_{\\mathrm{cat}}', label: 'Its catalogue C', unit: 'lb', kind: 'lookup', fig: 't14-3b' },
            { id: 'Co2', symbol: 'C_o', label: 'Its catalogue C_o (if a different bearing)', unit: 'lb', kind: 'lookup', fig: 't14-3b' },
          ],
          after: v => selTab(v, v.C2, ['bear2', null, 'Csel2', 'Co2']) + (!H.has(v, 'Csel1', 'Csel2', 'C2') ? '' : (v.Csel1 >= v.C2 && v.Csel1 === v.Csel2) ? '<span class="result-ok">' + (v.bear1 || 'Candidate') + ' still satisfies C = ' + H.fmt(v.C2) + ' lb → converged ✔</span>' : '<span class="result-ok">Bearing changed — iteration 2 with the new C_o.</span>') },
      ] },

      { title: 'Radial + thrust — iteration 2', steps: [
        { id: 'it2', title: 'Repeat Steps 5–9 with the new C_o', fig: ['t14-5', 't14-3b'], when: v => thrust(v) && H.has(v, 'Co2'),
          vars: [
            { id: 'TCo2', symbol: 'T/C_o', label: 'Thrust ratio', unit: '', kind: 'calc', digits: 4, compute: v => H.has(v, 'Tload', 'Co2') && v.Co2 > 0 ? v.Tload / v.Co2 : undefined },
            { id: 'e2', symbol: 'e', label: 'Limit ratio', unit: '', kind: 'lookup', fig: 't14-5', auto: v => v.TCo2 !== undefined ? H.interp(v.TCo2, TC0, E) : undefined },
            { id: 'Yc', symbol: 'Y', label: 'Thrust factor', unit: '', kind: 'lookup', fig: 't14-5', auto: v => v.TCo2 !== undefined ? H.interp(v.TCo2, TC0, Y) : undefined },
            { id: 'P3', symbol: 'P', label: 'Equivalent load (3rd)', unit: 'lb', kind: 'calc', digits: 4,
              compute: v => !H.has(v, 'V', 'R', 'TR', 'e2') ? undefined : v.TR > v.e2 ? (H.has(v, 'X', 'Yc', 'Tload') ? v.V * v.X * v.R + v.Yc * v.Tload : undefined) : v.V * v.R },
            { id: 'C3', symbol: 'C', label: 'Required C (3rd)', unit: 'lb', kind: 'calc', digits: 4, compute: v => Creq(v, v.P3) },
            { id: 'bear3', label: 'Bearing selected now', kind: 'input', type: 'text' },
            { id: 'Csel3', symbol: 'C_{\\mathrm{cat}}', label: 'Its catalogue C', unit: 'lb', kind: 'lookup', fig: 't14-3b' },
          ],
          after: v => selTab(v, v.C3, ['bear3', null, 'Csel3']) + (!H.has(v, 'Csel2', 'Csel3', 'C3') ? '' : (v.Csel2 === v.Csel3 && v.Csel3 >= v.C3) ? '<span class="result-ok">Same bearing twice → converged ✔</span>' : '<span class="result-bad">Not converged — feed the new C_o back and repeat.</span>') },
      ] },

      { title: 'Result', steps: [
        { id: 'res', title: 'Final bearing', fig: ['t14-3a'],
          text: 'Record number, bore, OD, width, fillet radius and shoulder diameters <i>S</i>/<i>H</i> — the bore becomes the shaft diameter at the seat (Fizz Step 23).',
          vars: [
            { id: 'final', label: 'Status', kind: 'calc', compute: v => {
              if (!thrust(v)) return H.has(v, 'CselR', 'Creq') ? (v.CselR >= v.Creq ? 'PASS' : 'FAIL') : undefined;
              const req = first(v.C3, v.C2), cat = first(v.Csel3, v.Csel2);
              return (req === undefined || cat === undefined) ? undefined : cat >= req ? 'PASS' : 'FAIL';
            } },
          ],
          after: v => v.final === undefined ? '' : v.final === 'PASS' ? '<span class="result-ok">Selected bearing meets the required C for ' + H.fmt(v.Lh) + ' h at ' + H.fmt(v.n) + ' rpm, ' + v.rel + ' % reliability.</span>' : '<span class="result-bad">Selected bearing is under-rated.</span>' },
      ] },
    ],
  };
})();
