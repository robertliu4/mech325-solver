#!/usr/bin/env python3
"""Find raw LaTeX-ish text that is NOT rendered as math (e.g. "K_f", "\\sigma", "x^2") and MathJax errors.
python3 v2/tools/textscan.py [filter]      -> prints one line per problem: file | where | snippet
"""
import os, sys, glob, json
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UNI = '--unicode' in sys.argv
args = [a for a in sys.argv[1:] if not a.startswith('--')]
filt = args[0] if args else ''
files = sorted(f for f in glob.glob(os.path.join(ROOT, 'v2', '*_*.html')) if filt in os.path.basename(f))
JS = r"""
() => {
  const out = [];
  const bad = /([A-Za-z0-9\)\]\}]_[A-Za-z0-9{\\])|(\\[a-zA-Z]{2,})|([A-Za-z0-9\)]\^[{0-9A-Za-z\-])|(\$[^$\s][^$]*\$)/;
  const where = (n) => { let e = n.parentElement; const parts = []; while (e && e !== document.body && parts.length < 4) { if (e.id) { parts.unshift('#' + e.id); break; } if (e.className && typeof e.className === 'string') parts.unshift('.' + e.className.split(' ')[0]); e = e.parentElement; } return parts.join(' '); };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: (n) => {
    let e = n.parentElement;
    while (e) { const t = e.tagName; if (t === 'SELECT' || t === 'SCRIPT' || t === 'STYLE' || t === 'MJX-CONTAINER' || t === 'MJX-ASSISTIVE-MML' || t === 'svg' || t === 'SVG') return NodeFilter.FILTER_REJECT; e = e.parentElement; }
    return NodeFilter.FILTER_ACCEPT; } });
  let n; while ((n = walker.nextNode())) { const s = n.nodeValue; const m = s.match(bad); if (m) out.push(['text', where(n), s.trim().slice(Math.max(0, m.index - 30), m.index + 40)]); }
  document.querySelectorAll('mjx-merror, [data-mjx-error]').forEach(e => { const c = e.closest('mjx-container'); out.push(['MATHJAX-ERROR', (e.getAttribute('data-mjx-error') || ''), (c && c.parentElement ? c.parentElement.innerText.slice(0, 80) : '')]); });
  document.querySelectorAll('select:not(.rsel-native) option').forEach(o => { if (bad.test(o.textContent)) out.push(['option', o.parentElement.id, o.textContent]); });
  document.querySelectorAll('input').forEach(i => { if (i.placeholder && bad.test(i.placeholder)) out.push(['placeholder', i.id, i.placeholder]); });
  document.querySelectorAll('[title]').forEach(i => { if (bad.test(i.title)) out.push(['title-attr', i.className, i.title.slice(0, 80)]); });
  // soft: formulas typed in Unicode instead of TeX (φd, sin⁻¹, x², √(…), (D−d)/2C …) — only with --unicode
  if (window.__UNI) {
    const uni = /([α-ωΑ-Ω][a-zA-Z]\b)|(sin⁻¹|cos⁻¹|tan⁻¹)|([A-Za-z\)][⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)|(√\()|(\([A-Za-z][−\-+][A-Za-z]\)\/)/;
    const w2 = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: (n) => { let e = n.parentElement; while (e) { const t = e.tagName; if (t === 'SELECT' || t === 'SCRIPT' || t === 'STYLE' || t === 'MJX-CONTAINER' || t === 'svg') return NodeFilter.FILTER_REJECT; e = e.parentElement; } return NodeFilter.FILTER_ACCEPT; } });
    let k; while ((k = w2.nextNode())) { const s2 = k.nodeValue; const m2 = s2.match(uni); if (m2) out.push(['unicode-math', where(k), s2.trim().slice(Math.max(0, m2.index - 30), m2.index + 50)]); }
  }
  return out;
}
"""
total = 0
with sync_playwright() as p:
    b = p.chromium.launch()
    for f in files:
        pg = b.new_page(viewport={'width': 1500, 'height': 1000})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + f)
        pg.wait_for_timeout(1200)
        pg.evaluate('localStorage.clear()')
        if pg.query_selector('#btn-example'):
            pg.click('#btn-example')
        pg.wait_for_timeout(2500)
        if UNI: pg.evaluate('window.__UNI = true')
        res = pg.evaluate(JS)
        name = os.path.basename(f)
        seen = set()
        for kind, w, s in res:
            key = (kind, s)
            if key in seen: continue
            seen.add(key)
            total += 1
            print(f"{name:30s} | {kind:13s} | {w[:28]:28s} | {s}")
        for e in errs:
            print(f"{name:30s} | PAGEERROR     | {e[:120]}")
        pg.close()
    b.close()
print(f"\n{total} findings")
