window.TOPIC = {
  id: 'sample', book: 'shigley', title: 'Sample topic', subtitle: 'engine smoke test', sibling: '_sample_mott.html',
  example: { P: 25, Ko: 1.25, NP: 18, Pd: 8 },
  figures: [
    { id: 'j', ref: 'Figure 14-6', title: 'Spur-gear geometry factor J', src: 'figures/shigley/fig14-6.png', page: 780, note: 'Read J for pinion and gear tooth counts.' },
    { id: 'ko', ref: 'Table 14-x', title: 'Overload factor', src: 'figures/shigley/nope.png', page: 1 },
  ],
  sections: [
    { title: 'Inputs', steps: [
      { id: 'in', title: 'Problem data', fig: ['ko'], formula: 'H_{des} = H K_o', eq: '14-1',
        vars: [
          { id: 'P', symbol: 'H', label: 'Power', unit: 'hp', kind: 'input' },
          { id: 'Ko', symbol: 'K_o', label: 'Overload factor', kind: 'lookup', fig: 'ko', default: 1.25, check: v => v.Ko > 3 ? 'too big' : null },
          { id: 'Pdes', symbol: 'H_{des}', label: 'Design power', unit: 'hp', kind: 'calc', compute: v => H.has(v,'P','Ko') ? v.P*v.Ko : undefined,
            work: v => H.has(v,'P','Ko') ? '\\(H_{des}=' + H.fmt(v.P) + '\\times' + H.fmt(v.Ko) + '=' + H.fmt(v.P*v.Ko) + '\\)' : null },
          { id: 'phi', symbol: '\\phi', label: 'Pressure angle', unit: '°', kind: 'choice', options: [{label:'20°',value:20},{label:'25°',value:25}], default: 20 },
        ] },
      { id: 'geo', title: 'Geometry', formula: 'd_P = N_P / P_d', vars: [
          { id: 'NP', symbol: 'N_P', label: 'Pinion teeth', kind: 'input' },
          { id: 'Pd', symbol: 'P_d', label: 'Diametral pitch', unit: '1/in', kind: 'input' },
          { id: 'dP', symbol: 'd_P', label: 'Pinion pitch dia', unit: 'in', kind: 'calc', compute: v => H.has(v,'NP','Pd') ? v.NP/v.Pd : undefined },
          { id: 'JP', symbol: 'J_P', label: 'Geometry factor', kind: 'lookup', fig: 'j', auto: v => v.NP ? 0.2 + 0.15*Math.log10(v.NP) : undefined },
        ], after: v => v.dP ? '<span class="result-ok">d_P ok</span>' : '' },
    ] },
  ],
};
