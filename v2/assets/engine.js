/* MECH 325 v2 calculator engine.
 * A topic file defines window.TOPIC (see v2/SCHEMA.md). This file renders it.
 * No build step; works from file://.
 */
(function () {
  'use strict';
  const T = window.TOPIC;
  if (!T) { document.body.innerHTML = '<p style="padding:20px">No TOPIC defined.</p>'; return; }

  const BOOKNAME = { shigley: 'Shigley 11e', mott: 'Mott 6e', fizz: 'Fizz guide', mech: 'Mech guide', 'Fizz bible': 'Fizz guide', 'Mech bible': 'Mech guide', course: 'Course slides' };
  const BOOKPDF = { shigley: '../original_documents/M325S.pdf', mott: '../original_documents/M325M.pdf', fizz: '../original_documents/Mech_325_Bible_Fizz.pdf', mech: '../original_documents/Mech_325_Bible_Mech.pdf', 'Fizz bible': '../original_documents/Mech_325_Bible_Fizz.pdf', 'Mech bible': '../original_documents/Mech_325_Bible_Mech.pdf' };
  const STORE_KEY = 'm325v2:' + T.id + ':' + T.book;

  // ---------- helpers exposed to topic files ----------
  const H = window.H = {
    num(x) { return (typeof x === 'number' && isFinite(x)) ? x : undefined; },
    has(v, ...ids) { return ids.every(id => v[id] !== undefined && v[id] !== '' && !(typeof v[id] === 'number' && !isFinite(v[id]))); },
    fmt(x, d) {
      if (x === undefined || x === null || x === '') return '';
      if (typeof x !== 'number') return String(x);
      if (!isFinite(x)) return '—';
      d = d || 4;
      if (x === 0) return '0';
      const ax = Math.abs(x);
      if (ax >= 1e6 || ax < 1e-3) return x.toExponential(d - 1).replace(/\.?0+e/, 'e');
      const mag = Math.floor(Math.log10(ax));
      const dec = Math.max(0, d - 1 - mag);
      return Number(x.toFixed(dec)).toString();
    },
    rad(deg) { return deg * Math.PI / 180; },
    deg(rad) { return rad * 180 / Math.PI; },
    interp(x, xs, ys) { // linear interpolation on a table
      if (x <= xs[0]) return ys[0];
      if (x >= xs[xs.length - 1]) return ys[ys.length - 1];
      for (let i = 1; i < xs.length; i++) if (x <= xs[i]) {
        const t = (x - xs[i - 1]) / (xs[i] - xs[i - 1]);
        return ys[i - 1] + t * (ys[i] - ys[i - 1]);
      }
      return ys[ys.length - 1];
    },
  };

  // ---------- state ----------
  const allVars = [];  // flat list in definition order
  const varById = {};
  const figById = {};
  (T.figures || []).forEach(f => figById[f.id] = f);
  (T.sections || []).forEach((sec, si) => (sec.steps || []).forEach((st, sti) => {
    st._sec = si; st._idx = sti;
    (st.vars || []).forEach(vr => { vr._step = st; allVars.push(vr); varById[vr.id] = vr; });
  }));

  let v = {};           // current values (numbers / strings)
  let raw = {};         // raw input strings for inputs so typing isn't clobbered

  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if (s && s.raw) raw = s.raw;
    } catch (e) { raw = {}; }
    allVars.forEach(vr => {
      if (vr.kind === 'calc') return;
      if (raw[vr.id] === undefined && vr.default !== undefined) raw[vr.id] = String(vr.default);
    });
  }
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify({ raw })); } catch (e) { } }

  function parseRaw(vr) {
    const r = raw[vr.id];
    if (r === undefined || r === null || r === '') return undefined;
    if (vr.kind === 'choice' || vr.type === 'text') {
      const n = Number(r);
      return (vr.numeric !== false && r.trim() !== '' && !isNaN(n) && vr.type !== 'text') ? n : r;
    }
    const n = Number(r);
    return isNaN(n) ? undefined : n;
  }

  function recompute() {
    v = {};
    allVars.forEach(vr => { if (vr.kind !== 'calc') v[vr.id] = parseRaw(vr); });
    const autoIds = allVars.filter(vr => (vr.kind === 'lookup' || vr.kind === 'input') && vr.auto && v[vr.id] === undefined).map(vr => vr.id);
    for (let pass = 0; pass < 6; pass++) {
      allVars.forEach(vr => {
        if (vr.kind === 'calc') {
          try { const r = vr.compute ? vr.compute(v) : undefined; v[vr.id] = (typeof r === 'number' && !isFinite(r)) ? undefined : r; }
          catch (e) { v[vr.id] = undefined; }
        } else if (vr.auto && autoIds.includes(vr.id)) {
          try { const r = vr.auto(v); v[vr.id] = (typeof r === 'number' && isFinite(r)) ? r : (typeof r === 'string' ? r : undefined); } catch (e) { v[vr.id] = undefined; }
        }
      });
    }
  }

  // ---------- rendering ----------
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };

  // ---------- rich text: "K_o" → K<sub>o</sub>, "10^7" → 10<sup>7</sup>, outside \( math \) and outside HTML tags ----------
  const SUBRE = /([\p{L}\p{N}\)\]′'*])_(\{([^{}]*)\}|[\p{L}\p{N}]+(?:,[\p{L}\p{N}]+)*)/gu;
  const SUPRE = /([\p{L}\p{N}\)\]′']|<\/sub>)\^(\{([^{}]*)\}|\(([^()]*)\)|[-+−]?[\p{L}\p{N}.]*[\p{L}\p{N}])/gu;
  const FILERE = /[\p{L}\p{N}]+(?:_[\p{L}\p{N}.]+){2,}/gu;   // Gear_Stress_2026 → Gear Stress 2026
  const ENUM = /(\d(?:\.\d+)?)e([+-]?)(\d{1,3})\b(?![\p{L}])/gu;               // 3e+7 → 3×10^7
  const texE = (m) => m.replace(ENUM, (x, a, sg, b) => a + '\\times10^{' + (sg === '-' ? '-' : '') + b.replace(/^0+(?=\d)/, '') + '}');
  function richSeg(s) {
    s = s.replace(ENUM, (x, a, sg, b) => a + '×10<sup>' + (sg === '-' ? '−' : '') + b.replace(/^0+(?=\d)/, '') + '</sup>');
    if (s.indexOf('_') < 0 && s.indexOf('^') < 0) return s;
    s = s.replace(FILERE, m => m.replace(/_/g, ' '));
    s = s.replace(SUBRE, (m, b, sub, br) => b + '<sub>' + (br !== undefined ? br : sub) + '</sub>');
    s = s.replace(SUPRE, (m, b, sup, br, pr) => b + '<sup>' + (br !== undefined ? richSeg(br) : pr !== undefined ? richSeg(pr) : sup) + '</sup>');
    return s;
  }
  const SEGRE = /(\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$|<\/?[A-Za-z!][^<>]*>|&[#\w]+;)/g;
  function rich(html) {
    if (html === undefined || html === null) return '';
    html = String(html);
    if (html.indexOf('_') < 0 && html.indexOf('^') < 0 && !/\de[+-]?\d/.test(html)) return html;
    let out = '', last = 0, m; SEGRE.lastIndex = 0;
    while ((m = SEGRE.exec(html))) { out += richSeg(html.slice(last, m.index)) + (/^\\[(\[]/.test(m[0]) ? texE(m[0]) : m[0]); last = SEGRE.lastIndex; }
    return out + richSeg(html.slice(last));
  }
  const SUBS = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', a: 'ₐ', e: 'ₑ', h: 'ₕ', i: 'ᵢ', j: 'ⱼ', k: 'ₖ', l: 'ₗ', m: 'ₘ', n: 'ₙ', o: 'ₒ', p: 'ₚ', r: 'ᵣ', s: 'ₛ', t: 'ₜ', u: 'ᵤ', v: 'ᵥ', x: 'ₓ', '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎', 'β': 'ᵦ', 'γ': 'ᵧ', 'ρ': 'ᵨ', 'φ': 'ᵩ', 'χ': 'ᵪ' };
  const SUPS = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻', '−': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', '.': '·', '/': 'ᐟ', a: 'ᵃ', b: 'ᵇ', c: 'ᶜ', d: 'ᵈ', e: 'ᵉ', f: 'ᶠ', g: 'ᵍ', h: 'ʰ', i: 'ⁱ', j: 'ʲ', k: 'ᵏ', l: 'ˡ', m: 'ᵐ', n: 'ⁿ', o: 'ᵒ', p: 'ᵖ', r: 'ʳ', s: 'ˢ', t: 'ᵗ', u: 'ᵘ', v: 'ᵛ', w: 'ʷ', x: 'ˣ', y: 'ʸ', z: 'ᶻ' };
  const TEXSYM = { alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', Delta: 'Δ', epsilon: 'ε', varepsilon: 'ε', eta: 'η', theta: 'θ', lambda: 'λ', mu: 'μ', nu: 'ν', pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ', phi: 'φ', varphi: 'φ', psi: 'ψ', omega: 'ω', Omega: 'Ω', cdot: '·', times: '×', le: '≤', leq: '≤', ge: '≥', geq: '≥', approx: '≈', sqrt: '√', infty: '∞', circ: '°', prime: '′', to: '→', rightarrow: '→', pm: '±', ne: '≠', neq: '≠' };
  const mapAll = (str, M) => { let o = ''; for (const ch of str) { if (M[ch] === undefined) return null; o += M[ch]; } return o; };
  // plain text (tooltips, native <option>, copy-as-text): unicode sub/superscripts where possible
  function plain(s, keepUnderscore) {
    if (s === undefined || s === null) return '';
    s = String(s).replace(/<\/?[A-Za-z!][^<>]*>/g, '').replace(/\\[()\[\]]/g, '')
      .replace(/\\(?:mathrm|text|mathit|operatorname)\{([^{}]*)\}/g, '$1')
      .replace(/\\([A-Za-z]+)/g, (m, w) => TEXSYM[w] !== undefined ? TEXSYM[w] : w)
      .replace(/\\,|\;|\\!|\\ /g, ' ');
    s = s.replace(FILERE, m => m.replace(/_/g, ' '));
    s = s.replace(SUBRE, (m, b, sub, br) => { const t = br !== undefined ? br : sub; const u = mapAll(t, SUBS); return b + (u !== null ? u : (keepUnderscore ? '_' + (t.length > 1 ? '{' + t + '}' : t) : t)); });
    s = s.replace(SUPRE, (m, b, sup, br, pr) => { const t = br !== undefined ? br : pr !== undefined ? pr : sup; const u = mapAll(t, SUPS); return b + (u !== null ? u : '^' + (t.length > 1 ? '(' + t + ')' : t)); });
    return s.replace(/[{}]/g, '');
  }
  window.H.rich = rich; window.H.plain = plain;
  const typeset = (els) => { if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise(els.filter(Boolean)).catch(() => { }); };
  // links "Fizz p.42" / "Mech p. 79" to the guide PDFs
  function linkSrc(s) {
    return rich(s).replace(/\b(Fizz|Mech)(?: guide| bible)?\s*pp?\.\s*(\d+)(?:\s*[–-]\s*(\d+))?/g, (m, g, p1) =>
      '<a href="' + BOOKPDF[g.toLowerCase()] + '#page=' + p1 + '" target="_blank">' + m + '</a>');
  }

  function figChip(fid) {
    const f = figById[fid];
    if (!f) return el('span', 'chip', fid);
    const isTable = /table/i.test(f.ref || '');
    const c = el('span', 'chip' + (isTable ? ' table' : ''), (isTable ? '📋 ' : '📈 ') + rich(f.ref));
    c.title = plain(f.title || '');
    c.onclick = () => showFig(fid);
    return c;
  }

  function buildMain() {
    const main = document.getElementById('main');
    main.innerHTML = '';
    if (T.intro) main.appendChild(el('div', 'callout', rich(T.intro)));
    if (T.assumptions && T.assumptions.length) main.appendChild(buildAssumptions());
    main.appendChild(el('div', 'legend',
      '<span class="l-in">you enter</span><span class="l-lk">look up in table / graph (yellow)</span><span class="l-ca">calculated (green)</span>'));
    let n = 0;
    (T.sections || []).forEach(sec => {
      main.appendChild(el('div', 'section-title', rich(sec.title)));
      if (sec.text) main.appendChild(el('div', 'callout', rich(sec.text)));
      (sec.steps || []).forEach(st => {
        n++;
        const card = el('div', 'step'); card.id = 'step-' + (st.id || n); st._el = card;
        const h = el('h3'); h.appendChild(el('span', 'num', (st.num !== undefined ? st.num : n) + '.')); h.appendChild(el('span', '', rich(st.title || ''))); card.appendChild(h);
        if (st.text) card.appendChild(el('div', 'text', rich(st.text)));
        const refs = [];
        const figs = st.fig ? (Array.isArray(st.fig) ? st.fig : [st.fig]) : [];
        if (st.eq) refs.push(el('span', 'chip eq', 'Eq. ' + st.eq));
        figs.forEach(f => refs.push(figChip(f)));
        if (refs.length) { const r = el('div', 'figrefs'); refs.forEach(x => r.appendChild(x)); card.appendChild(r); }
        if (st.formula) { const f = el('div', 'formula'); f.textContent = '\\[' + st.formula + '\\]'; card.appendChild(f); }
        if (st.vars && st.vars.length) {
          const vs = el('div', 'vars');
          st.vars.forEach(vr => vs.appendChild(buildVar(vr)));
          card.appendChild(vs);
        }
        if (st.work || st.vars && st.vars.some(x => x.work)) { const w = el('div', 'work'); w.style.display = 'none'; card.appendChild(w); st._work = w; }
        if (st.after) { const a = el('div', 'text'); a.style.marginTop = '8px'; card.appendChild(a); st._after = a; }
        main.appendChild(card);
      });
    });
    typeset([main]);
  }

  function buildAssumptions() {
    const box = el('details', 'assume'); box.open = true;
    box.appendChild(el('summary', '', 'Assumptions used <span class="n">(' + T.assumptions.length + ')</span><span class="why">from the Fizz / Mech guides unless noted · values linked to a field update live; change the field to override</span>'));
    const ul = el('ul');
    T.assumptions.forEach(a => {
      const li = el('li'); a._li = li;
      li.appendChild(el('span', 'a-text', rich(a.text)));
      if (a.var && varById[a.var]) {
        const b = el('button', 'a-val'); b.type = 'button'; a._val = b;
        b.onclick = () => { const vr = varById[a.var]; if (vr && vr._el) { vr._el.scrollIntoView({ behavior: 'smooth', block: 'center' }); vr._el.classList.add('flash'); setTimeout(() => vr._el.classList.remove('flash'), 1400); } };
        li.appendChild(b);
      }
      if (a.src) li.appendChild(el('span', 'a-src', linkSrc(a.src)));
      ul.appendChild(li);
    });
    box.appendChild(ul);
    return box;
  }

  function updateAssumptions() {
    (T.assumptions || []).forEach(a => {
      if (!a._val) return;
      const vr = varById[a.var]; const cur = v[a.var];
      const assumed = a.value !== undefined ? a.value : vr.default;
      const show = (x) => { if (x === undefined || x === '') return '—'; if (vr.kind === 'choice') { const o = (vr.options || []).find(o => String(o.value !== undefined ? o.value : o) === String(x)); if (o) return plain(o.label !== undefined ? o.label : o); } return typeof x === 'number' ? H.fmt(x, vr.digits || 4) : String(x); };
      const typed = raw[a.var] !== undefined && raw[a.var] !== '';
      const changed = assumed !== undefined
        ? (cur !== undefined && String(cur) !== String(assumed) && !(typeof cur === 'number' && Math.abs(cur - Number(assumed)) < 1e-9))
        : (!!vr.auto && typed);   // assumption carried by an auto-fill: overriding it by typing counts as a change
      a._val.textContent = (changed ? 'you set ' : (vr.auto && !typed ? 'auto ' : 'using ')) + show(cur) + (vr.unit ? ' ' + plain(vr.unit) : '');
      a._li.classList.toggle('changed', changed);
    });
  }

  function buildChoice(vr) {
    const wrap = el('div', 'rsel');
    const sel = el('select', 'rsel-native'); sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true');
    const btn = el('button', 'rsel-btn'); btn.type = 'button';
    const list = el('div', 'rsel-list');
    const opts = [];
    if (vr.allowBlank !== false) opts.push({ value: '', label: '— select —' });
    (vr.options || []).forEach(o => opts.push({ value: String(o.value !== undefined ? o.value : o), label: String(o.label !== undefined ? o.label : o) }));
    opts.forEach(o => {
      const no = el('option'); no.value = o.value; no.textContent = plain(o.label, true); sel.appendChild(no);
      const d = el('div', 'rsel-opt', rich(o.label)); o._el = d;
      d.onmousedown = (e) => e.preventDefault();
      d.onclick = (e) => { e.stopPropagation(); choose(o.value); close(); btn.focus(); };
      list.appendChild(d);
    });
    let shown = null;
    const sync = () => {
      const o = opts.find(x => x.value === sel.value) || opts[0];
      opts.forEach(x => x._el.classList.toggle('sel', x === o));
      if (shown === o) return; shown = o;
      btn.innerHTML = '<span class="rsel-lab">' + rich(o ? o.label : '') + '</span><span class="rsel-car">▾</span>';
      if (o && /\\\(/.test(o.label)) typeset([btn]);
    };
    const choose = (val) => { sel.value = val; raw[vr.id] = val; sync(); update(); };
    const open = () => { document.querySelectorAll('.rsel.open').forEach(x => x !== wrap && x.classList.remove('open')); wrap.classList.add('open'); const cur = list.querySelector('.sel'); if (cur) cur.scrollIntoView({ block: 'nearest' }); };
    const close = () => wrap.classList.remove('open');
    btn.onclick = (e) => { e.stopPropagation(); wrap.classList.contains('open') ? close() : open(); };
    btn.onkeydown = (e) => {
      const i = opts.findIndex(x => x.value === sel.value);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); const j = Math.min(opts.length - 1, Math.max(0, i + (e.key === 'ArrowDown' ? 1 : -1))); if (j !== i) choose(opts[j].value); }
      else if (e.key === 'Escape') close();
    };
    sel.onchange = () => { raw[vr.id] = sel.value; sync(); update(); };
    sel.value = raw[vr.id] !== undefined ? String(raw[vr.id]) : '';
    wrap.appendChild(btn); wrap.appendChild(list); wrap.appendChild(sel);
    vr._sync = sync; sync();
    return { wrap, sel };
  }

  function buildVar(vr) {
    const kind = vr.kind || 'input';
    const d = el('div', 'var ' + kind); vr._el = d;
    const lab = el('label');
    const sym = vr.symbol ? '\\(' + vr.symbol + '\\)' : '';
    lab.innerHTML = '<span><span class="sym">' + sym + '</span> ' + rich(vr.label || '') + '</span>' + (vr.unit ? '<span class="unit">' + rich(vr.unit) + '</span>' : '');
    d.appendChild(lab);
    const ctl = el('div', 'ctl');
    let inp;
    let ctlNode = null;
    if (kind === 'choice') {
      const r = buildChoice(vr); inp = r.sel; ctlNode = r.wrap;
    } else if (kind === 'calc') {
      inp = el('input'); inp.readOnly = true; inp.tabIndex = -1;
    } else {
      inp = el('input'); inp.type = 'text'; inp.inputMode = 'decimal'; inp.placeholder = vr.placeholder || '';
      inp.value = raw[vr.id] !== undefined ? raw[vr.id] : '';
      inp.oninput = () => { raw[vr.id] = inp.value; update(); };
    }
    inp.id = 'v-' + vr.id; vr._inp = inp;
    ctl.appendChild(ctlNode || inp);
    if (vr.fig) {
      const f = figById[vr.fig];
      const b = el('button', 'fig-btn', (f ? (/table/i.test(f.ref) ? '📋 ' : '📈 ') + rich(f.ref) : '📖 ' + vr.fig));
      b.type = 'button'; b.title = f ? plain(f.title || '') : ''; b.onclick = () => showFig(vr.fig);
      ctl.appendChild(b);
    }
    d.appendChild(ctl);
    if (vr.hint) d.appendChild(el('div', 'hint', rich(vr.hint)));
    const w = el('div', 'warn'); w.style.display = 'none'; d.appendChild(w); vr._warn = w;
    return d;
  }

  function update() {
    recompute();
    allVars.forEach(vr => {
      if (vr.kind === 'calc') {
        const val = v[vr.id];
        vr._inp.value = (val === undefined) ? '' : (typeof val === 'number' ? H.fmt(val, vr.digits) : String(val));
      } else if (vr.auto && (raw[vr.id] === undefined || raw[vr.id] === '') && v[vr.id] !== undefined) {
        vr._inp.placeholder = 'auto: ' + (typeof v[vr.id] === 'number' ? H.fmt(v[vr.id], vr.digits) : plain(v[vr.id]));
      } else if (vr.auto) { vr._inp.placeholder = plain(vr.placeholder || ''); }
      if (vr._sync) vr._sync();
      // warnings
      let msg = null;
      try { if (vr.check) msg = vr.check(v); } catch (e) { msg = null; }
      if (msg) { if (vr._warnMsg !== msg) { vr._warn.innerHTML = rich(msg); vr._warnMsg = msg; if (/\\\(/.test(msg)) typeset([vr._warn]); } vr._warn.style.display = ''; vr._el.classList.add('warned'); }
      else { vr._warn.style.display = 'none'; vr._warnMsg = null; vr._el.classList.remove('warned'); }
    });
    const toTypeset = [];
    let visN = 0;
    (T.sections || []).forEach(sec => (sec.steps || []).forEach(st => {
      // visibility
      let vis = true; try { if (st.when) vis = !!st.when(v); } catch (e) { vis = true; }
      st._el.classList.toggle('hidden', !vis);
      if (!vis) return;
      if (st.num === undefined) { visN++; st._el.querySelector('.num').textContent = visN + '.'; }
      // work lines
      if (st._work) {
        let lines = [];
        try { if (st.work) { const r = st.work(v); if (r) lines.push(r); } } catch (e) { }
        (st.vars || []).forEach(vr => { try { if (vr.work) { const r = vr.work(v); if (r) lines.push(r); } } catch (e) { } });
        if (lines.length) { st._work.innerHTML = lines.map(l => '<div>' + rich(l) + '</div>').join(''); st._work.style.display = ''; toTypeset.push(st._work); }
        else st._work.style.display = 'none';
      }
      if (st._after) { let html = ''; try { html = st.after(v) || ''; } catch (e) { } html = rich(html); if (st._afterHtml !== html) { st._after.innerHTML = html; st._afterHtml = html; if (html) toTypeset.push(st._after); } }
    }));
    if (toTypeset.length) typeset(toTypeset);
    updateAssumptions();
    save();
  }

  // ---------- figure panel ----------
  function buildFigs() {
    const p = document.getElementById('figs');
    p.innerHTML = '';
    p.appendChild(el('h2', '', 'Figures & tables — ' + (BOOKNAME[T.book] || T.book)));
    const filt = el('input', 'figfilter'); filt.placeholder = 'filter figures… (e.g. "14-6", "Ko")'; p.appendChild(filt);
    const list = el('div'); p.appendChild(list);
    (T.figures || []).forEach(f => {
      const c = el('div', 'figcard'); c.id = 'fig-' + f.id; f._el = c;
      const book = f.book || T.book;
      c.appendChild(el('div', 'ref ' + String(book).split(' ')[0], (BOOKNAME[book] || book) + ' · ' + rich(f.ref)));
      if (f.title) c.appendChild(el('div', 'ttl', rich(f.title)));
      if (f.src) {
        const img = el('img'); img.decoding = 'async'; img.src = f.src; img.alt = plain(f.ref);
        img.onerror = () => { c.classList.add('missing'); img.remove(); c.appendChild(el('div', 'missing-note', 'Image not found: ' + f.src)); };
        img.onclick = () => openLightbox(f);
        c.appendChild(img);
      } else {
        c.classList.add('missing'); c.appendChild(el('div', 'missing-note', 'No image — see textbook.'));
      }
      if (f.note) c.appendChild(el('div', 'note', rich(f.note)));
      if (f.page) {
        const pdf = BOOKPDF[book];
        c.appendChild(el('div', 'pg', 'PDF page ' + f.page + (pdf ? ' · <a href="' + pdf + '#page=' + f.page + '" target="_blank">open in textbook</a>' : '')));
      }
      list.appendChild(c);
    });
    filt.oninput = () => {
      const q = filt.value.trim().toLowerCase().replace(/[–—]/g, '-');
      (T.figures || []).forEach(f => {
        const hay = plain((f.ref || '') + ' ' + (f.title || '') + ' ' + (f.note || '')).toLowerCase() + ' ' + ((f.title || '') + ' ' + (f.note || '')).replace(/[_{}\\]/g, '').toLowerCase().replace(/[–—]/g, '-');
        f._el.style.display = (!q || hay.includes(q)) ? '' : 'none';
      });
    };
    typeset([p]);
  }

  function showFig(fid) {
    const f = figById[fid]; if (!f || !f._el) return;
    const panel = document.getElementById('figpanel');
    const filt = panel.querySelector('.figfilter'); if (filt && filt.value) { filt.value = ''; filt.oninput(); }
    const stacked = window.innerWidth <= 1100;
    const align = (behavior) => {
      const r = f._el.getBoundingClientRect();
      if (stacked) window.scrollTo({ top: window.scrollY + r.top - 70, behavior });
      else panel.scrollTo({ top: panel.scrollTop + (r.top - panel.getBoundingClientRect().top) - 8, behavior });
    };
    align('smooth');
    // images above the target may still be loading and push it down: re-align once they finish
    const pending = Array.from(panel.querySelectorAll('img')).filter(im => !im.complete && (im.compareDocumentPosition(f._el) & Node.DOCUMENT_POSITION_FOLLOWING || f._el.contains(im)));
    if (pending.length) {
      let left = pending.length; const t0 = Date.now();
      const done = () => { if (--left === 0 && Date.now() - t0 < 4000) align('auto'); };
      pending.forEach(im => { im.addEventListener('load', done, { once: true }); im.addEventListener('error', done, { once: true }); });
    }
    setTimeout(() => align('auto'), 700);
    f._el.classList.add('flash'); setTimeout(() => f._el.classList.remove('flash'), 1600);
  }

  function openLightbox(f) {
    const lb = document.getElementById('lightbox');
    lb.querySelector('img').src = f.src;
    lb.querySelector('.cap').textContent = (BOOKNAME[f.book || T.book] || '') + ' · ' + plain(f.ref) + (f.title ? ' — ' + plain(f.title) : '');
    lb.classList.add('open');
  }

  // ---------- summary ----------
  function openSummary() {
    const m = document.getElementById('summary');
    const box = m.querySelector('.box');
    let rows = '', text = T.title + ' (' + (BOOKNAME[T.book] || T.book) + ')\n';
    (T.sections || []).forEach(sec => {
      rows += '<tr><th colspan="4" style="background:#f8fafc">' + rich(sec.title) + '</th></tr>';
      text += '\n== ' + plain(sec.title, true) + '\n';
      (sec.steps || []).forEach(st => {
        let vis = true; try { if (st.when) vis = !!st.when(v); } catch (e) { }
        if (!vis) return;
        (st.vars || []).forEach(vr => {
          const val = v[vr.id];
          if (val === undefined || val === '') return;
          const s = typeof val === 'number' ? H.fmt(val, vr.digits || 5) : String(val);
          const kind = vr.kind === 'calc' ? 'calc' : vr.kind === 'lookup' ? 'lookup' : 'input';
          rows += '<tr><td>' + (vr.symbol ? '\\(' + vr.symbol + '\\)' : '') + '</td><td>' + rich(vr.label || '') + '</td><td class="v">' + rich(s) + '</td><td>' + rich(vr.unit || '') + ' <small style="color:#9ca3af">' + kind + '</small></td></tr>';
          text += plain(vr.plain || (vr.symbol ? vr.symbol : vr.id), true).padEnd(12) + ' = ' + plain(s, true) + (vr.unit ? ' ' + plain(vr.unit, true) : '') + '   (' + plain(vr.label || '', true) + ', ' + kind + ')\n';
        });
      });
    });
    let arows = '';
    if (T.assumptions && T.assumptions.length) {
      text = text.replace('\n', '\n\nAssumptions:\n' + T.assumptions.map(a => '- ' + plain(a.text, true) + (a._val ? ' [' + a._val.textContent + ']' : '') + (a.src ? ' (' + plain(a.src, true) + ')' : '')).join('\n') + '\n');
      arows = '<h3 style="margin:6px 0">Assumptions</h3><ul style="margin:0 0 12px 18px;font-size:.88rem">' + T.assumptions.map(a => '<li>' + rich(a.text) + (a._val ? ' <b>[' + a._val.textContent + ']</b>' : '') + (a.src ? ' <small style="color:#6b7280">(' + rich(a.src) + ')</small>' : '') + '</li>').join('') + '</ul>';
    }
    box.innerHTML = '<h2>Summary of values</h2>' + arows + '<table>' + rows + '</table><div class="actions"><button id="copy-sum">Copy as text</button><button id="close-sum">Close</button></div>';
    box.querySelector('#copy-sum').onclick = () => { navigator.clipboard.writeText(text).then(() => toast('Copied')); };
    box.querySelector('#close-sum').onclick = () => m.classList.remove('open');
    m.classList.add('open');
    typeset([box]);
  }

  function toast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1400); }

  // ---------- page skeleton ----------
  function buildPage() {
    document.title = plain(T.title) + ' — ' + (BOOKNAME[T.book] || T.book);
    document.body.innerHTML = `
      <div class="topbar">
        <a class="home" href="index.html">⌂ MECH 325</a>
        <h1>${rich(T.title)}</h1>
        <span class="badge ${T.book}">${BOOKNAME[T.book] || T.book}</span>
        <span class="sub">${rich(T.subtitle || '')}</span>
        <span class="spacer"></span>
        ${T.sibling ? '<a class="btn sibling" href="' + T.sibling + '">Switch to ' + (T.book === 'shigley' ? 'Mott' : 'Shigley') + ' version →</a>' : ''}
        ${T.example ? '<button id="btn-example">Load example</button>' : ''}
        <button id="btn-summary">Summary / copy</button>
        <button id="btn-reset">Reset</button>
      </div>
      <div class="wrap">
        <div id="main"></div>
        <div id="figpanel" class="figpanel"><div id="figs"></div></div>
      </div>
      <div id="lightbox" class="lightbox"><img alt=""><div class="cap"></div></div>
      <div id="summary" class="modal"><div class="box"></div></div>
      <div id="toast" class="toast"></div>`;
    document.getElementById('lightbox').onclick = (e) => { document.getElementById('lightbox').classList.remove('open'); };
    document.getElementById('summary').onclick = (e) => { if (e.target.id === 'summary') e.target.classList.remove('open'); };
    document.getElementById('btn-summary').onclick = openSummary;
    document.getElementById('btn-reset').onclick = () => {
      if (!confirm('Clear all entered values for this calculator?')) return;
      raw = {}; localStorage.removeItem(STORE_KEY); load();
      allVars.forEach(vr => { if (vr._inp && vr.kind !== 'calc') vr._inp.value = raw[vr.id] !== undefined ? raw[vr.id] : ''; });
      update(); toast('Reset');
    };
    const ex = document.getElementById('btn-example');
    if (ex) ex.onclick = () => {
      Object.keys(T.example).forEach(k => { raw[k] = String(T.example[k]); const vr = varById[k]; if (vr && vr._inp) vr._inp.value = raw[k]; });
      update(); toast('Example loaded');
    };
    document.addEventListener('click', () => document.querySelectorAll('.rsel.open').forEach(x => x.classList.remove('open')));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { document.querySelectorAll('.rsel.open').forEach(x => x.classList.remove('open')); document.getElementById('lightbox').classList.remove('open'); document.getElementById('summary').classList.remove('open'); } });
  }

  function init() {
    load();
    buildPage();
    buildMain();
    buildFigs();
    update();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
