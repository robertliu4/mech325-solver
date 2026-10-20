#!/usr/bin/env python3
"""Run the headless check on every v2 calculator and summarise.
python3 v2/tools/qa.py            # all
python3 v2/tools/qa.py spur       # only files containing 'spur'
"""
import os, sys, glob, subprocess, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
filt = sys.argv[1] if len(sys.argv) > 1 else ''
files = sorted(f for f in glob.glob(os.path.join(ROOT, 'v2', '*_*.html')) if filt in os.path.basename(f) and not os.path.basename(f).startswith('_'))
bad = 0
for f in files:
    name = os.path.basename(f)
    r = subprocess.run([sys.executable, os.path.join(ROOT, 'v2/tools/shot.py'), f, '--example'], capture_output=True, text=True)
    out = r.stdout + r.stderr
    steps = re.search(r'steps (\d+) figures (\d+)', out)
    errs = re.search(r'ERRORS: (.*)', out); miss = re.search(r'MISSING FIGURES: (.*)', out)
    e = errs.group(1) if errs else 'n/a'; m = miss.group(1) if miss else 'n/a'
    # count values
    vals = re.search(r'VALUES: (\{.*\})', out)
    nv = len(re.findall(r'"[^"]+":', vals.group(1))) if vals else 0
    flag = '' if (e == 'none' and m == 'none') else '  <-- CHECK'
    if flag: bad += 1
    print(f"{name:32s} steps={steps.group(1) if steps else '?':>3} figs={steps.group(2) if steps else '?':>3} values={nv:>3} errors={e[:70]} missing={m[:60]}{flag}")
print(f"\n{len(files)} files, {bad} need attention")
