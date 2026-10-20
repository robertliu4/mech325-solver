// Wire rope — Mott Ch. 7-7 (merged Fizz §1.7 + Mech §8.3.5.1 Mott guide; Example Problems 7-7 / 7-8), with Shigley mine-hoist equations
(function () {
  // Table 7-22: construction → [suggested D/d, minimum D/d]
  const DD = { '6x7': [72, 42], '6x19 Seale': [51, 34], '6x21 Filler Wire': [45, 30], '6x25 Filler Wire': [39, 26], '6x31 Warrington Seale': [39, 26], '6x36 Warrington Seale': [35, 23], '6x41 Seale Filler Wire': [20, 20], '6x41 Warrington Seale': [32, 21], '6x42 Tiller': [21, 14], '8x19 Seale': [41, 27], '8x25 Filler Wire': [32, 21] };
  // Table 7-23: nominal dia in → groove radius new / worn (in)
  const GR_D = [0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4, 4.5, 5];
  const GR_N = [0.137, 0.201, 0.271, 0.334, 0.401, 0.468, 0.543, 0.669, 0.803, 0.939, 1.070, 1.338, 1.607, 1.869, 2.139, 2.396, 2.663];
  const GR_W = [0.129, 0.190, 0.256, 0.320, 0.380, 0.440, 0.513, 0.639, 0.759, 0.897, 1.019, 1.279, 1.538, 1.794, 2.050, 2.298, 2.557];
  // Table 7-25: dia in → [FC w lb/ft, FC IPS tons, FC XIP tons, IWRC w, IWRC IPS, IWRC XIP]
  const T725 = {
    0.25: [0.105, 2.74, 3.02, 0.116, 2.94, 3.4], 0.3125: [0.164, 4.26, 4.69, 0.18, 4.58, 5.27], 0.375: [0.236, 6.1, 6.72, 0.26, 6.56, 7.55], 0.4375: [0.32, 8.27, 9.1, 0.35, 8.89, 10.2],
    0.5: [0.42, 10.7, 11.8, 0.46, 11.5, 13.3], 0.5625: [0.53, 13.5, 14.9, 0.59, 14.5, 16.8], 0.625: [0.66, 16.7, 18.3, 0.72, 17.9, 20.6], 0.75: [0.95, 23.8, 26.2, 1.04, 25.6, 29.4],
    0.875: [1.29, 32.2, 35.4, 1.42, 34.6, 39.8], 1: [1.68, 41.8, 46, 1.85, 44.9, 51.7], 1.125: [2.13, 52.6, 57.8, 2.34, 56.5, 65], 1.25: [2.63, 64.6, 71.1, 2.89, 69.4, 79.9],
    1.375: [3.18, 77.7, 85.5, 3.5, 83.5, 96], 1.5: [3.78, 92, 101, 4.16, 98.9, 114], 1.625: [4.44, 107, 118, 4.88, 115, 132], 1.75: [5.15, 124, 137, 5.67, 133, 153],
    1.875: [5.91, 141, 156, 6.5, 152, 174], 2: [6.72, 160, 176, 7.39, 172, 198], 2.125: [7.59, 179, 197, 8.35, 192, 221], 2.25: [8.51, 200, 220, 9.36, 215, 247],
  };
  const T725D = Object.keys(T725).map(Number);
  const row = d => { const k = T725D.find(x => Math.abs(x - d) < 1e-6); return k !== undefined ? T725[k] : undefined; };
  const col = v => (v.core === 'IWRC' ? 3 : 0) + (v.grade === 'XIP' ? 2 : v.grade === 'IPS' ? 1 : undefined);
  // Shigley Table 17-27 for the hoist section
  const ROPE = { '6x7': { w: 1.50, dw: 0.111, Am: 0.38, Er: 13e6 }, '6x19': { w: 1.60, dw: 0.067, Am: 0.40, Er: 12e6 }, '6x37': { w: 1.55, dw: 0.048, Am: 0.40, Er: 12e6 } };
  const BENDS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0];
  const PSU = { '6x19': [3.4, 2.3, 1.9, 1.7, 1.6, 1.5, 1.45, 1.4], '6x37': [3.6, 2.5, 2.1, 1.9, 1.8, 1.75, 1.7, 1.65], '6x7': [3.0, 2.0, 1.65, 1.5, 1.4, 1.3, 1.25, 1.2] };
  const SU = { IPS: 240, PS: 210, XIP: 260, MPS: 180 };
  const hoist = v => v.mode === 'hoist';

  window.TOPIC = {
    id: 'wire_rope', book: 'mott',
    title: 'Wire Rope — Sheave/Drum Design & Working Load',
    subtitle: 'Mott Ch. 7-7 (Tables 7-19 … 7-25, Figs. 7-41 … 7-51, Eqs. 7-23 … 7-25) · merged Fizz §1.7 + Mech §8.3.5',
    sibling: 'wire_rope_shigley.html',
    intro: 'Mott\'s wire-rope guide (Mech bible §8.3.5.1, Example Problems 7-7/7-8): nominal diameter (Table 7-19) and classification (Table 7-20) → D/d ratio (Table 7-22) and tread diameter → drum groove depth h = 0.374d, drum diameter D + 2h, groove radius (Table 7-23), pitch 2.065r–2.18r, fleet angle ½°–2° → sheave groove depth 1.5d–1.75d, throat angle 35°–45°, pitch and rim diameters → rope grade (Table 7-24), minimum breaking force and weight (Table 7-25, auto-filled for standard sizes) → maximum working load = breaking force / SF (SF ≥ 5 for human safety). The optional <b>mine-hoist</b> block at the end applies Shigley\'s F<sub>t</sub>, F<sub>f</sub>, F<sub>b</sub>, n<sub>f</sub>, n<sub>s</sub> equations (figures from Shigley) because Mott has no fatigue method — the Mech bible says to use that for any problem with acceleration.',
    example: { d: 1.25, cons: '6x19 Seale', ratioSel: 'suggested', fleet: 1.0, hs: 2.0, throat: 40, grade: 'XIP', core: 'FC', SF: 5, mode: 'none' },

    figures: [
      { id: 'fig7-41', ref: 'Figure 7-41', title: 'Wire rope construction (wires, strands, core)', src: 'figures/mott/fig7-41.png', page: 309 },
      { id: 'table7-19', ref: 'Table 7-19', title: 'Nominal wire rope diameters (in / mm)', src: 'figures/mott/table7-19.png', page: 309 },
      { id: 'table7-20', ref: 'Table 7-20', title: 'Wire rope classification by wires per strand and outer wires', src: 'figures/mott/table7-20.png', page: 310 },
      { id: 'table7-21', ref: 'Table 7-21', title: 'Strand construction: single layer, Seale, filler wire, Warrington, combined', src: 'figures/mott/table7-21.png', page: 310 },
      { id: 'fig7-43', ref: 'Figure 7-43', title: 'Types of lay of wire rope', src: 'figures/mott/fig7-43.png', page: 311 },
      { id: 'table7-22', ref: 'Table 7-22', title: 'Sheave and drum diameter factors — suggested and minimum D/d', src: 'figures/mott/table7-22.png', page: 312 },
      { id: 'fig7-48', ref: 'Figure 7-48', title: 'Relative rope service life vs D/d ratio', src: 'figures/mott/fig7-48.png', page: 313 },
      { id: 'fig7-49', ref: 'Figure 7-49', title: 'Sheave design: tread, pitch and rim diameters, groove depth h, radius r, throat angle', src: 'figures/mott/fig7-49.png', page: 313 },
      { id: 'table7-23', ref: 'Table 7-23', title: 'Recommended sheave and drum groove radius (new / worn)', src: 'figures/mott/table7-23.png', page: 314, note: 'Use "new" unless told otherwise; a groove worn below the "worn" radius must be re-machined.' },
      { id: 'fig7-50', ref: 'Figure 7-50', title: 'Grooved drum design details: pitch, groove depth h, flange and drum diameters', src: 'figures/mott/fig7-50.png', page: 314 },
      { id: 'fig7-51', ref: 'Figure 7-51', title: 'Fleet angle', src: 'figures/mott/fig7-51.png', page: 315 },
      { id: 'table7-24', ref: 'Table 7-24', title: 'Grades of wire rope: PS, IPS, XIP tensile strengths', src: 'figures/mott/table7-24.png', page: 315 },
      { id: 'table7-25', ref: 'Table 7-25', title: '6×19 and 6×36 class technical data: weight/ft and minimum breaking force (tons) for IPS/XIP, fiber core and IWRC', src: 'figures/mott/table7-25.png', page: 316 },
      { id: 'table7-26', ref: 'Table 7-26', title: 'Properties of standard 6×19 and 6×36 ropes', src: 'figures/mott/table7-26.png', page: 317 },
      { id: 'table17-27', ref: 'Table 17-27', book: 'shigley', title: 'Shigley rope properties for the hoist equations (w, dw, Am, Er)', src: 'figures/shigley/table17-27.png', page: 944 },
      { id: 'fig17-21', ref: 'Figure 17-21', book: 'shigley', title: 'Shigley fatigue chart 1000·p/Su vs bends to failure', src: 'figures/shigley/fig17-21.png', page: 943, note: 'Divide the reading by 1000.' },
      { id: 'fig17-23', ref: 'Figure 17-23', book: 'shigley', title: 'Mine hoist geometry (Shigley Example 17-6)', src: 'figures/shigley/fig17-23.png', page: 946 },
      { id: 'table17-25', ref: 'Table 17-25', book: 'shigley', title: 'Shigley minimum factors of safety by application', src: 'figures/shigley/table17-25.png', page: 941 },
    ],

    sections: [
      { title: 'Step 1–2: rope and tread diameter', steps: [
        { id: 'rope', title: 'Rope diameter, classification and D/d ratio', fig: ['table7-19', 'table7-20', 'table7-21', 'table7-22', 'fig7-48'],
          formula: 'D = \\left(\\frac{D}{d}\\right)_{\\text{Table 7-22}} \\times d',
          text: 'If the rope type is given as "wires per strand", classify it with Table 7-20. Use the suggested D/d for long life, the minimum only when space is tight (Figure 7-48 shows the life penalty).',
          vars: [
            { id: 'd', symbol: 'd', label: 'Nominal rope diameter', unit: 'in', kind: 'input', hint: 'standard sizes in Table 7-19' },
            { id: 'cons', label: 'Rope construction', kind: 'choice', type: 'text', options: Object.keys(DD) },
            { id: 'ratioSel', label: 'Use which D/d', kind: 'choice', type: 'text', options: [{ label: 'Suggested', value: 'suggested' }, { label: 'Minimum', value: 'minimum' }], default: 'suggested' },
            { id: 'Dd', symbol: 'D/d', label: 'Sheave/drum diameter factor', unit: '', kind: 'lookup', fig: 'table7-22', auto: v => DD[v.cons] ? DD[v.cons][v.ratioSel === 'minimum' ? 1 : 0] : undefined },
            { id: 'D', symbol: 'D', label: 'Tread diameter', unit: 'in', kind: 'calc', compute: v => H.has(v, 'Dd', 'd') ? v.Dd * v.d : undefined,
              work: v => H.has(v, 'D') ? '\\(D = ' + H.fmt(v.Dd) + '(' + H.fmt(v.d) + ') = ' + H.fmt(v.D) + '\\ \\text{in}\\)' : null },
          ] },
      ] },

      { title: 'Step 3: drum', steps: [
        { id: 'drum', title: 'Drum groove depth, drum diameter, groove radius, pitch, fleet angle', fig: ['fig7-50', 'table7-23', 'fig7-51'], eq: '7-24, 7-25',
          formula: 'h_{drum} = 0.374d,\\qquad D_{drum} = D + 2h,\\qquad 2.065r < p < 2.18r,\\qquad 0.5^\\circ \\le \\text{fleet angle} \\le 2^\\circ',
          vars: [
            { id: 'hd', symbol: 'h_{drum}', label: 'Minimum drum groove depth', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'd') ? 0.374 * v.d : undefined,
              work: v => H.has(v, 'hd') ? '\\(h = 0.374(' + H.fmt(v.d) + ') = ' + H.fmt(v.hd, 4) + '\\ \\text{in}\\)' : null },
            { id: 'Ddrum', symbol: 'D_{drum}', label: 'Drum diameter', unit: 'in', kind: 'calc', compute: v => H.has(v, 'D', 'hd') ? v.D + 2 * v.hd : undefined,
              work: v => H.has(v, 'Ddrum') ? '\\(D_{drum} = ' + H.fmt(v.D) + ' + 2(' + H.fmt(v.hd, 4) + ') = ' + H.fmt(v.Ddrum) + '\\ \\text{in}\\)' : null },
            { id: 'r', symbol: 'r', label: 'Groove radius (new)', unit: 'in', kind: 'lookup', fig: 'table7-23', auto: v => H.has(v, 'd') ? H.interp(v.d, GR_D, GR_N) : undefined },
            { id: 'rw', symbol: 'r_{worn}', label: 'Groove radius (worn limit)', unit: 'in', kind: 'lookup', fig: 'table7-23', auto: v => H.has(v, 'd') ? H.interp(v.d, GR_D, GR_W) : undefined },
            { id: 'pmin', symbol: 'p_{min}', label: 'Groove pitch lower limit 2.065r', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'r') ? 2.065 * v.r : undefined },
            { id: 'pmax', symbol: 'p_{max}', label: 'Groove pitch upper limit 2.18r', unit: 'in', kind: 'calc', digits: 4, compute: v => H.has(v, 'r') ? 2.18 * v.r : undefined },
            { id: 'pitch', symbol: 'p', label: 'Chosen groove pitch', unit: 'in', kind: 'input', auto: v => H.has(v, 'pmin', 'pmax') ? (v.pmin + v.pmax) / 2 : undefined,
              check: v => (H.has(v, 'pitch', 'pmin', 'pmax') && (v.pitch < v.pmin || v.pitch > v.pmax)) ? 'Pitch outside 2.065r–2.18r' : null },
            { id: 'fleet', symbol: '', label: 'Fleet angle', unit: '°', kind: 'input', default: 1.0, check: v => (H.has(v, 'fleet') && (v.fleet < 0.5 || v.fleet > 2)) ? 'Fleet angle must be ½°–2° (max 1½° on a smooth drum)' : null },
          ] },
      ] },

      { title: 'Step 4: sheave', steps: [
        { id: 'sheave', title: 'Sheave groove depth, throat angle, pitch and rim diameters', fig: ['fig7-49'], eq: '7-23',
          formula: '1.5d \\le h_{sheave} \\le 1.75d,\\qquad 35^\\circ \\le \\text{throat} \\le 45^\\circ,\\qquad D_{pitch} = D + 2d,\\qquad D_{rim} = D + 2h_{sheave}',
          vars: [
            { id: 'hsmin', symbol: 'h_{min}', label: 'Groove depth lower limit 1.5d', unit: 'in', kind: 'calc', compute: v => H.has(v, 'd') ? 1.5 * v.d : undefined },
            { id: 'hsmax', symbol: 'h_{max}', label: 'Groove depth upper limit 1.75d', unit: 'in', kind: 'calc', compute: v => H.has(v, 'd') ? 1.75 * v.d : undefined },
            { id: 'hs', symbol: 'h_{sheave}', label: 'Chosen sheave groove depth', unit: 'in', kind: 'input', auto: v => H.has(v, 'd') ? 1.5 * v.d : undefined,
              check: v => (H.has(v, 'hs', 'hsmin', 'hsmax') && (v.hs < v.hsmin - 1e-9 || v.hs > v.hsmax + 1e-9)) ? 'Outside 1.5d–1.75d' : null },
            { id: 'throat', symbol: '', label: 'Throat angle', unit: '°', kind: 'input', default: 40, check: v => (H.has(v, 'throat') && (v.throat < 35 || v.throat > 45)) ? 'Throat angle must be 35°–45°' : null },
            { id: 'Dpitch', symbol: 'D_{pitch}', label: 'Sheave pitch diameter', unit: 'in', kind: 'calc', compute: v => H.has(v, 'D', 'd') ? v.D + 2 * v.d : undefined },
            { id: 'Drim', symbol: 'D_{rim}', label: 'Sheave rim diameter', unit: 'in', kind: 'calc', compute: v => H.has(v, 'D', 'hs') ? v.D + 2 * v.hs : undefined },
          ] },
      ] },

      { title: 'Steps 5–6: grade and working load', steps: [
        { id: 'wl', title: 'Rope grade, breaking force and maximum working load', fig: ['table7-24', 'table7-25', 'table7-26'],
          formula: '\\text{Max. working load} = \\frac{\\text{Min. breaking force}}{SF}\\qquad(1\\ \\text{ton} = 2000\\ \\text{lb})',
          text: 'Table 7-25 covers the 6×19 and 6×36 classes with fibre core (FC) or IWRC in IPS and XIP; breaking force auto-fills for standard diameters. SF ≥ 5 for overhead cranes, gantry cranes, hoists and anything involving human safety (Mech bible: "just use 5 if not sure").',
          vars: [
            { id: 'grade', label: 'Rope grade', kind: 'choice', type: 'text', options: [{ label: 'PS — plow steel (1570 N/mm²)', value: 'PS' }, { label: 'IPS — improved plow steel (1770 N/mm²)', value: 'IPS' }, { label: 'XIP — extra improved plow steel (1960 N/mm²)', value: 'XIP' }], default: 'IPS' },
            { id: 'core', label: 'Core', kind: 'choice', type: 'text', options: [{ label: 'Fiber core (FC)', value: 'FC' }, { label: 'IWRC — independent wire rope core', value: 'IWRC' }], default: 'FC' },
            { id: 'Fbr', symbol: 'F_{br}', label: 'Minimum breaking force', unit: 'tons', kind: 'lookup', fig: 'table7-25', auto: v => { const r = H.has(v, 'd') ? row(v.d) : undefined; const c = col(v); return (r && c !== undefined) ? r[c] : undefined; }, hint: 'PS is not tabulated — scale IPS by 1570/1770' },
            { id: 'wft', symbol: 'w', label: 'Weight per foot', unit: 'lb/ft', kind: 'lookup', fig: 'table7-25', auto: v => { const r = H.has(v, 'd') ? row(v.d) : undefined; return r ? r[v.core === 'IWRC' ? 3 : 0] : undefined; } },
            { id: 'SF', symbol: 'SF', label: 'Service (design) factor', unit: '', kind: 'input', default: 5, check: v => (H.has(v, 'SF') && v.SF < 5) ? 'SF < 5 is not allowed where human safety is involved' : null },
            { id: 'MWL', symbol: '', label: 'Maximum working load', unit: 'tons', kind: 'calc', compute: v => H.has(v, 'Fbr', 'SF') ? v.Fbr / v.SF : undefined,
              work: v => H.has(v, 'MWL') ? '\\(\\text{MWL} = ' + H.fmt(v.Fbr) + '/' + H.fmt(v.SF) + ' = ' + H.fmt(v.MWL) + '\\ \\text{tons} = ' + H.fmt(v.MWL * 2000) + '\\ \\text{lb}\\)' : null },
            { id: 'MWLlb', symbol: '', label: 'Maximum working load', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'MWL') ? v.MWL * 2000 : undefined },
            { id: 'Wapp', symbol: 'W', label: 'Applied load incl. rope weight and shock (optional)', unit: 'lb', kind: 'input', check: v => (H.has(v, 'Wapp', 'MWLlb') && v.Wapp > v.MWLlb) ? 'Applied load exceeds the maximum working load' : null },
            { id: 'Lrope', symbol: 'L', label: 'Rope length (optional, for total rope weight)', unit: 'ft', kind: 'input' },
            { id: 'Wrope', symbol: 'wL', label: 'Total rope weight', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'wft', 'Lrope') ? v.wft * v.Lrope : undefined },
          ],
          after: v => {
            if (!H.has(v, 'MWL')) return '';
            const ok = !H.has(v, 'Wapp') || v.Wapp <= v.MWLlb;
            return (ok ? '<span class="result-ok">OK</span>' : '<span class="result-bad">OVERLOADED</span>') + ' — ' + H.fmt(v.d) + ' in ' + (v.cons || '') + ' ' + (v.grade || '') + ' ' + (v.core || '') + ' rope: breaking force ' + H.fmt(v.Fbr) + ' tons, MWL = ' + H.fmt(v.MWL) + ' tons = ' + H.fmt(v.MWLlb) + ' lb at SF = ' + H.fmt(v.SF) + '; tread D = ' + H.fmt(v.D) + ' in, drum ' + H.fmt(v.Ddrum) + ' in, sheave pitch ' + H.fmt(v.Dpitch) + ' in / rim ' + H.fmt(v.Drim) + ' in.';
          } },
      ] },

      { title: 'Optional: mine-hoist / acceleration analysis (Shigley)', text: 'Mott has no fatigue method. For problems with acceleration or a required fatigue factor the Mech bible switches to Shigley §17-6 (Example 17-6); the equations and figures here are Shigley\'s.', steps: [
        { id: 'mode', title: 'Enable hoist analysis', vars: [
          { id: 'mode', label: 'Analysis', kind: 'choice', type: 'text', options: [{ label: 'Not needed (static working-load check above)', value: 'none' }, { label: 'Mine hoist — tension, fatigue and static factors of safety', value: 'hoist' }], default: 'none' },
        ] },
        { id: 'hoist', title: 'Rope tension, fatigue and bending loads', fig: ['fig17-23', 'table17-27', 'fig17-21'], when: hoist,
          formula: 'F_t = \\left(\\frac{W}{m} + wL\\right)\\left(1 + \\frac{a}{32.2}\\right),\\quad F_f = \\frac{(p/S_u)S_u D d}{2},\\quad F_b = \\frac{E_r d_w A_m}{D}',
          vars: [
            { id: 'srope', label: 'Shigley rope class', kind: 'choice', type: 'text', options: ['6x7', '6x19', '6x37'], default: '6x19' },
            { id: 'W', symbol: 'W', label: 'Weight at the end of the rope', unit: 'lb', kind: 'input' },
            { id: 'm', symbol: 'm', label: 'Number of ropes', unit: '', kind: 'input', default: 1 },
            { id: 'L', symbol: 'L', label: 'Max suspended length', unit: 'ft', kind: 'input', default: 0 },
            { id: 'a', symbol: 'a', label: 'Max acceleration', unit: 'ft/s²', kind: 'input', default: 0 },
            { id: 'ws', symbol: 'w', label: 'Weight per foot (Shigley, no core)', unit: 'lb/ft', kind: 'lookup', fig: 'table17-27', auto: v => (ROPE[v.srope] && H.has(v, 'd')) ? ROPE[v.srope].w * v.d * v.d : undefined },
            { id: 'dw', symbol: 'd_w', label: 'Wire diameter', unit: 'in', kind: 'lookup', fig: 'table17-27', auto: v => (ROPE[v.srope] && H.has(v, 'd')) ? ROPE[v.srope].dw * v.d : undefined },
            { id: 'Am', symbol: 'A_m', label: 'Metal area', unit: 'in²', kind: 'lookup', fig: 'table17-27', auto: v => (ROPE[v.srope] && H.has(v, 'd')) ? ROPE[v.srope].Am * v.d * v.d : undefined },
            { id: 'Er', symbol: 'E_r', label: 'Rope modulus', unit: 'psi', kind: 'lookup', fig: 'table17-27', auto: v => ROPE[v.srope] ? ROPE[v.srope].Er : undefined },
            { id: 'Su', symbol: 'S_u', label: 'Wire ultimate strength', unit: 'kpsi', kind: 'lookup', fig: 'fig17-21', auto: v => SU[v.grade], hint: 'IPS 240–280, PS 210–240, mild 180–210 (lower bound)' },
            { id: 'bends', symbol: 'N_{bends}', label: 'Bends to failure', unit: 'millions', kind: 'input', default: 1.0 },
            { id: 'psu', symbol: '1000\\,p/S_u', label: 'Pressure–strength ratio ×1000', unit: '', kind: 'lookup', fig: 'fig17-21', auto: v => (PSU[v.srope] && H.has(v, 'bends')) ? H.interp(v.bends, BENDS, PSU[v.srope]) : undefined },
            { id: 'Ft', symbol: 'F_t', label: 'Rope tension', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'W', 'm', 'ws', 'L', 'a') ? (v.W / v.m + v.ws * v.L) * (1 + v.a / 32.2) : undefined,
              work: v => H.has(v, 'Ft') ? '\\(F_t = \\left(\\frac{' + H.fmt(v.W) + '}{' + H.fmt(v.m) + '} + ' + H.fmt(v.ws) + '(' + H.fmt(v.L) + ')\\right)\\left(1 + \\frac{' + H.fmt(v.a) + '}{32.2}\\right) = ' + H.fmt(v.Ft) + '\\ \\text{lb}\\)' : null },
            { id: 'Ff', symbol: 'F_f', label: 'Fatigue tension', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'psu', 'Su', 'D', 'd') ? v.psu * v.Su * v.D * v.d / 2 : undefined },
            { id: 'Fb', symbol: 'F_b', label: 'Bending tension', unit: 'lb', kind: 'calc', compute: v => H.has(v, 'Er', 'dw', 'Am', 'D') ? v.Er * v.dw * v.Am / v.D : undefined },
          ] },
        { id: 'fos', title: 'Factors of safety', fig: ['table17-25'], when: hoist,
          formula: 'n_f = \\frac{F_f - F_b}{F_t},\\qquad n_s = \\frac{F_u - F_b}{F_t},\\qquad F_u = \\text{breaking force}',
          vars: [
            { id: 'nreq', symbol: 'n_{req}', label: 'Required factor of safety', unit: '', kind: 'lookup', fig: 'table17-25', default: 5 },
            { id: 'nf', symbol: 'n_f', label: 'Fatigue factor of safety', unit: '', kind: 'calc', digits: 4, compute: v => (H.has(v, 'Ff', 'Fb', 'Ft') && v.Ft > 0) ? (v.Ff - v.Fb) / v.Ft : undefined,
              work: v => H.has(v, 'nf') ? '\\(n_f = \\frac{' + H.fmt(v.Ff) + ' - ' + H.fmt(v.Fb) + '}{' + H.fmt(v.Ft) + '} = ' + H.fmt(v.nf, 4) + '\\)' : null },
            { id: 'ns', symbol: 'n_s', label: 'Static factor of safety', unit: '', kind: 'calc', digits: 4, compute: v => (H.has(v, 'Fbr', 'Fb', 'Ft') && v.Ft > 0) ? (v.Fbr * 2000 - v.Fb) / v.Ft : undefined },
          ],
          after: v => {
            if (!hoist(v) || !H.has(v, 'nf')) return '';
            const req = v.nreq || 5;
            return (v.nf >= req ? '<span class="result-ok">PASS</span>' : '<span class="result-bad">FAIL</span>') + ' — n<sub>f</sub> = ' + H.fmt(v.nf, 3) + (H.has(v, 'ns') ? ', n<sub>s</sub> = ' + H.fmt(v.ns, 3) : '') + ' vs required ' + H.fmt(req) + ' for ' + H.fmt(v.m) + ' × ' + H.fmt(v.d) + ' in rope. n<sub>f</sub> has a maximum in d: compare neighbouring standard sizes (Table 7-19).';
          } },
      ] },
    ],
  };
})();
