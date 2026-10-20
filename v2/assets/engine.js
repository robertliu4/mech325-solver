/* MECH 325 v2 calculator engine.
 * A topic file defines window.TOPIC (see v2/SCHEMA.md). This file renders it.
 * No build step; works from file://.
 */
(function () {
  'use strict';
  const T = window.TOPIC;
  if (!T) { document.body.innerHTML = '<p style="padding:20px">No TOPIC defined.</p>'; return; }

  const BOOKNAME = { shigley: 'Shigley 11e', mott: 'Mott 6e', fizz: 'Fizz guide', mech: 'Mech guide', 'Fizz bible': 'Fizz guide', 'Mech bible': 'Mech guide' };
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

  function figChip(fid) {
    const f = figById[fid];
    if (!f) return el('span', 'chip', fid);
    const isTable = /table/i.test(f.ref || '');
    const c = el('span', 'chip' + (isTable ? ' table' : ''), (isTable ? '📋 ' : '📈 ') + f.ref);
    c.title = f.title || '';
    c.onclick = () => showFig(fid);
    return c;
  }

  function buildMain() {
    const main = document.getElementById('main');
    main.innerHTML = '';
    if (T.intro) main.appendChild(el('div', 'callout', T.intro));
    main.appendChild(el('div', 'legend',
      '<span class="l-in">you enter</span><span class="l-lk">look up in table / graph (yellow)</span><span class="l-ca">calculated (green)</span>'));
    let n = 0;
    (T.sections || []).forEach(sec => {
      main.appendChild(el('div', 'section-title', sec.title));
      if (sec.text) main.appendChild(el('div', 'callout', sec.text));
      (sec.steps || []).forEach(st => {
        n++;
        const card = el('div', 'step'); card.id = 'step-' + (st.id || n); st._el = card;
        const h = el('h3'); h.appendChild(el('span', 'num', (st.num !== undefined ? st.num : n) + '.')); h.appendChild(el('span', '', st.title || '')); card.appendChild(h);
        if (st.text) card.appendChild(el('div', 'text', st.text));
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
    if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([main]).catch(() => { });
  }

  function buildVar(vr) {
    const kind = vr.kind || 'input';
    const d = el('div', 'var ' + kind); vr._el = d;
    const lab = el('label');
    const sym = vr.symbol ? '\\(' + vr.symbol + '\\)' : '';
    lab.innerHTML = '<span><span class="sym">' + sym + '</span> ' + (vr.label || '') + '</span>' + (vr.unit ? '<span class="unit">' + vr.unit + '</span>' : '');
    d.appendChild(lab);
    const ctl = el('div', 'ctl');
    let inp;
    if (kind === 'choice') {
      inp = el('select');
      (vr.options || []).forEach(o => {
        const opt = el('option'); opt.value = String(o.value !== undefined ? o.value : o); opt.textContent = o.label !== undefined ? o.label : String(o); inp.appendChild(opt);
      });
      if (vr.allowBlank !== false) { const b = el('option'); b.value = ''; b.textContent = '— select —'; inp.insertBefore(b, inp.firstChild); }
      inp.value = raw[vr.id] !== undefined ? String(raw[vr.id]) : '';
      inp.onchange = () => { raw[vr.id] = inp.value; update(); };
    } else if (kind === 'calc') {
      inp = el('input'); inp.readOnly = true; inp.tabIndex = -1;
    } else {
      inp = el('input'); inp.type = 'text'; inp.inputMode = 'decimal'; inp.placeholder = vr.placeholder || '';
      inp.value = raw[vr.id] !== undefined ? raw[vr.id] : '';
      inp.oninput = () => { raw[vr.id] = inp.value; update(); };
    }
    inp.id = 'v-' + vr.id; vr._inp = inp;
    ctl.appendChild(inp);
    if (vr.fig) {
      const f = figById[vr.fig];
      const b = el('button', 'fig-btn', (f ? (/table/i.test(f.ref) ? '📋 ' : '📈 ') + f.ref : '📖 ' + vr.fig));
      b.type = 'button'; b.title = f ? (f.title || '') : ''; b.onclick = () => showFig(vr.fig);
      ctl.appendChild(b);
    }
    d.appendChild(ctl);
    if (vr.hint) d.appendChild(el('div', 'hint', vr.hint));
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
        vr._inp.placeholder = 'auto: ' + (typeof v[vr.id] === 'number' ? H.fmt(v[vr.id], vr.digits) : v[vr.id]);
      } else if (vr.auto) { vr._inp.placeholder = vr.placeholder || ''; }
      // warnings
      let msg = null;
      try { if (vr.check) msg = vr.check(v); } catch (e) { msg = null; }
      if (msg) { vr._warn.textContent = msg; vr._warn.style.display = ''; vr._el.classList.add('warned'); }
      else { vr._warn.style.display = 'none'; vr._el.classList.remove('warned'); }
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
        if (lines.length) { st._work.innerHTML = lines.map(l => '<div>' + l + '</div>').join(''); st._work.style.display = ''; toTypeset.push(st._work); }
        else st._work.style.display = 'none';
      }
      if (st._after) { let html = ''; try { html = st.after(v) || ''; } catch (e) { } st._after.innerHTML = html; if (html) toTypeset.push(st._after); }
    }));
    if (window.MathJax && MathJax.typesetPromise && toTypeset.length) MathJax.typesetPromise(toTypeset).catch(() => { });
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
      c.appendChild(el('div', 'ref ' + book, (BOOKNAME[book] || book) + ' · ' + f.ref));
      if (f.title) c.appendChild(el('div', 'ttl', f.title));
      if (f.src) {
        const img = el('img'); img.loading = 'lazy'; img.src = f.src; img.alt = f.ref;
        img.onerror = () => { c.classList.add('missing'); img.remove(); c.appendChild(el('div', 'missing-note', 'Image not found: ' + f.src)); };
        img.onclick = () => openLightbox(f);
        c.appendChild(img);
      } else {
        c.classList.add('missing'); c.appendChild(el('div', 'missing-note', 'No image — see textbook.'));
      }
      if (f.note) c.appendChild(el('div', 'note', f.note));
      if (f.page) {
        const pdf = BOOKPDF[book];
        c.appendChild(el('div', 'pg', 'PDF page ' + f.page + (pdf ? ' · <a href="' + pdf + '#page=' + f.page + '" target="_blank">open in textbook</a>' : '')));
      }
      list.appendChild(c);
    });
    filt.oninput = () => {
      const q = filt.value.trim().toLowerCase().replace(/[–—]/g, '-');
      (T.figures || []).forEach(f => {
        const hay = ((f.ref || '') + ' ' + (f.title || '') + ' ' + (f.note || '')).toLowerCase().replace(/[–—]/g, '-');
        f._el.style.display = (!q || hay.includes(q)) ? '' : 'none';
      });
    };
  }

  function showFig(fid) {
    const f = figById[fid]; if (!f || !f._el) return;
    const panel = document.getElementById('figpanel');
    const filt = panel.querySelector('.figfilter'); if (filt && filt.value) { filt.value = ''; filt.oninput(); }
    f._el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    f._el.classList.add('flash'); setTimeout(() => f._el.classList.remove('flash'), 1600);
    if (window.innerWidth <= 1100) f._el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function openLightbox(f) {
    const lb = document.getElementById('lightbox');
    lb.querySelector('img').src = f.src;
    lb.querySelector('.cap').textContent = (BOOKNAME[f.book || T.book] || '') + ' · ' + f.ref + (f.title ? ' — ' + f.title : '');
    lb.classList.add('open');
  }

  // ---------- summary ----------
  function openSummary() {
    const m = document.getElementById('summary');
    const box = m.querySelector('.box');
    let rows = '', text = T.title + ' (' + (BOOKNAME[T.book] || T.book) + ')\n';
    (T.sections || []).forEach(sec => {
      rows += '<tr><th colspan="4" style="background:#f8fafc">' + sec.title + '</th></tr>';
      text += '\n== ' + sec.title + '\n';
      (sec.steps || []).forEach(st => {
        let vis = true; try { if (st.when) vis = !!st.when(v); } catch (e) { }
        if (!vis) return;
        (st.vars || []).forEach(vr => {
          const val = v[vr.id];
          if (val === undefined || val === '') return;
          const s = typeof val === 'number' ? H.fmt(val, vr.digits || 5) : String(val);
          const kind = vr.kind === 'calc' ? 'calc' : vr.kind === 'lookup' ? 'lookup' : 'input';
          rows += '<tr><td>' + (vr.symbol ? '\\(' + vr.symbol + '\\)' : '') + '</td><td>' + (vr.label || '') + '</td><td class="v">' + s + '</td><td>' + (vr.unit || '') + ' <small style="color:#9ca3af">' + kind + '</small></td></tr>';
          text += (vr.plain || vr.id).padEnd(12) + ' = ' + s + (vr.unit ? ' ' + vr.unit : '') + '   (' + (vr.label || '') + ', ' + kind + ')\n';
        });
      });
    });
    box.innerHTML = '<h2>Summary of values</h2><table>' + rows + '</table><div class="actions"><button id="copy-sum">Copy as text</button><button id="close-sum">Close</button></div>';
    box.querySelector('#copy-sum').onclick = () => { navigator.clipboard.writeText(text).then(() => toast('Copied')); };
    box.querySelector('#close-sum').onclick = () => m.classList.remove('open');
    m.classList.add('open');
    if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([box]).catch(() => { });
  }

  function toast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1400); }

  // ---------- page skeleton ----------
  function buildPage() {
    document.title = T.title + ' — ' + (BOOKNAME[T.book] || T.book);
    document.body.innerHTML = `
      <div class="topbar">
        <a class="home" href="index.html">⌂ MECH 325</a>
        <h1>${T.title}</h1>
        <span class="badge ${T.book}">${BOOKNAME[T.book] || T.book}</span>
        <span class="sub">${T.subtitle || ''}</span>
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
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { document.getElementById('lightbox').classList.remove('open'); document.getElementById('summary').classList.remove('open'); } });
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
