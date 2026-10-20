#!/usr/bin/env python3
"""Headless check: python3 v2/tools/shot.py v2/spur_shigley.html [out.png] [--example]
Prints console errors, missing images, and the computed values after optionally loading the example."""
import sys, os, json
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
path=sys.argv[1]; out=[a for a in sys.argv[2:] if a.endswith('.png')]; ex='--example' in sys.argv
url='file://'+os.path.abspath(path if os.path.isabs(path) else os.path.join(ROOT,path))
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1500,'height':1000})
    pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.on('pageerror', lambda e: errs.append('PAGEERROR '+str(e)))
    pg.goto(url); pg.wait_for_timeout(1500)
    if ex and pg.query_selector('#btn-example'):
        pg.evaluate("localStorage.clear()"); pg.click('#btn-example'); pg.wait_for_timeout(600)
    missing=pg.evaluate("Array.from(document.querySelectorAll('.figcard.missing')).map(e=>e.innerText.split('\\n')[0])")
    vals=pg.evaluate("""() => { const o={}; document.querySelectorAll('.var').forEach(d=>{const i=d.querySelector('input,select'); if(i&&i.value!=='') o[i.id.replace('v-','')]=i.value;}); return o; }""")
    nsteps=pg.evaluate("document.querySelectorAll('.step:not(.hidden)').length")
    nfig=pg.evaluate("document.querySelectorAll('.figcard').length")
    if out: pg.screenshot(path=out[0], full_page=True)
    b.close()
print('steps',nsteps,'figures',nfig)
print('ERRORS:',errs if errs else 'none')
print('MISSING FIGURES:',missing if missing else 'none')
print('VALUES:',json.dumps(vals))
