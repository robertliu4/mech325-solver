# Past-exam coverage — group m5 (power screws, ball screws, springs, fasteners, fluid power)

Sources searched (v2/course/past/): midterms 2014, 2016, 2021, 2022, 2023 (+ solution), 2024 solutions; HW1–HW5 solutions
2023/2024; final-exam review solutions; Selected Tutorial Questions for Final Exam Study 2022 (STQ); All RAP.pdf. Scanned files
were rasterised at 110 dpi and OCR'd; handwritten pages read by eye.

**No questions on these topics** in the 2021, 2022, 2023, 2024 midterms (gears, belts, chains, wire rope only — the 2024 bonus MC
"hp → ft·lb/s, multiply by 550" is generic). HW1, HW2 and HW4 2023 have none either; HW4 2024 P9 is the linear-bearing part of HW5 P5.

Status: **PASS** = the calculator reproduces the answer (probe with `localStorage m325v2:<id>:<book>`); numbers in brackets are the
posted solution's. "Page" = which calculator(s) carry the question type.

## Power screws

| # | Source | Given | Asked | Answer (solution) | Page / status |
|---|---|---|---|---|---|
| 1 | HW5 P4 2023 (Mott 17) | 30 000 lb, σ < 10 000 psi, τ < 6000 psi, f 0.15, fc 0.06 at r 2 in, 10 hp | screw, nut length, raise/lower torque, e, max speed | At,req 3.0 → 2½-3 Acme (At 3.802, As 4.075); h 1.227 → 1.25 in; Tc 3600; TR 6994; total 10 594; lower 7335; e 0.150; n 59.5 rpm; V 0.330 in/s | Shigley: exact (dm = (D+Dr)/2). Mott: Tu 6973 / 10 573 / 7313 with Dp (−0.3 %), e 0.151, n 59.6 — PASS. Live Acme table ★ 2½-3 |
| 2 | HW5 P4 2024 | 27 000 lb, σ 10 000, τ 5000 | same | page: At,req 2.70 → **2¼-3** (At 2.982), h 1.496 → **1.50 in** (the posted 2024 sheet is the 2023 solution) | both pages — PASS (slip noted) |
| 3 | Final review Sc. 3 c | square thread p = L = 5 mm, dm 22 mm, f 0.15, 2400 N, rolling collar | drive torque, efficiency, ball screw? | T 5.93 N·m, e 32.2 %; a ball screw would be more efficient | both — PASS (5934 N·mm, 0.322) |
| 4 | STQ 2022 P2 (Shigley 8-6) | twin 2-in Acme, p ¼, 5000 lb, f 0.05, fc 0.08, dc 3.5, 60:1 gears η 0.95, 1720 rpm | press speed, motor hp | 7.17 in/min; TR 221.0, Tc 350, 571 lbf·in/screw; 0.547 hp | Shigley — PASS (new N screws / η inputs) |
| 5 | Midterm 2014 MC 7 | square vs Acme, split nut | true statement | (b) a split nut allows backlash adjustment on an Acme screw | thread-form step text states it |
| 6 | Midterm 2014 Q17 | TT = TR + Tc | efficiency with friction removed | e = F l /(2π TT) | efficiency step (formula + "f = 0" line) |
| 7 | Midterm 2016 MC 8 | nut with 10 threads | load on first 7 threads | (e) ≈ 100 % | Shigley stress section: 0.38 / 0.25 / 0.18 F …, 7th carries ~0 |
| 8 | Midterm 2016 Q19 | TR, TL formulas | self-locking condition; thread efficiency | π f dm > l (f > l/π dm); e = Fl/(2π TR) | Shigley self-locking + efficiency steps |

## Ball screws / linear bearings

| # | Source | Given | Asked | Answer (solution) | Page / status |
|---|---|---|---|---|---|
| 9 | HW5 P5 a–c 2023/2024 | 900 lb, 36 in/cycle, 12 cycles/h, 10 yr, 2 in/s | screw, torque, power | 3.78 × 10⁷ in (24 h/day, 365 d); ¾-in 2-tpi 0.50 lead; T 79.6 lb·in; 240 rpm; 0.303 hp | both pages — PASS; new size table ★ ¾ in (938 lb ≥ 900) |
| 10 | HW5 P5 d–e | Thomson charts, SF 2.5, both ends fixed | max length, max speed (0.8 nc) | ≈ 53 in (p.149 chart), ≈ 1850 rpm (p.147) | new "Maximum length and speed (Thomson)" step: 56.1 in by the p.142 formula with S = 0.8; 1904 rpm at 53 in (chart reading tolerance) |
| 11 | HW5 P5 f = HW4 2024 P9 | 300-lb table, 900 lb axial 6 in below rails, bearings 8 in apart, HRC 60 | Thomson SSU pillow blocks | Fb = 75 + 675/2 = 412.5 lb, K0 = KS = 1, SSUPB10 (⅝ in) ≈ 500 lb → SF 1.21; friction ≈ 1 lb | new linear-bearing step — PASS |
| 12 | RAP Q2 | ball screws | FALSE statement | "column buckling is not a consideration" | intro + buckling step |

## Springs

| # | Source | Given | Asked | Answer (solution) | Page / status |
|---|---|---|---|---|---|
| 13 | HW5 P6 (Shigley 10-6) | OQ&T 4 mm, C 10, plain ends, L0 80 mm, 50 N → 15 mm | k, hole, Nt, Ls, ns at solid | 3.333 N/mm; OD 44 mm; Na = Nt = 11.6; Ls 50.4 mm; Sut 1431, Ssy 715.5, Fs 98.66 N, KB 1.135, τs 178.2 MPa, ns 4.02 | Shigley mode 3 — PASS (ns 4.00; unrounded Na). Mott design mode — k, Na, Ls, Fs, τs 180 MPa (Wahl) |
| 14 | STQ 2022 P3 part 1 (Shigley 10-3/10-5) | music wire 0.105 in, OD 1.225, plain-ground, Nt 12 | F to yield at closure; k; solid-safe L0; pitch; buckling (n = 5) | 45.2 lbf; 11.55 lbf/in; 5.17 in; 0.431 in; (L0)cr 5.89, /5 = 1.18 < 5.17 → may buckle | Shigley mode 3 with (ns)d = 1, buckling factor 5 — PASS (new yield-safe force / buckling SF) |
| 15 | STQ 2022 P3 part 2 | A227 2 mm, OD 22, sq-ground, Nt 8½, SF 2, pivoted ends | same | 48.6 N; 3.05 N/mm; 32.9 mm; 4.45 mm; 52.6/5 = 10.5 < 32.9 → may buckle | Shigley — PASS |
| 16 | RAP Q8–Q11 | definitions | k, C, wire stress, curvature | k = force/deflection; C = coil ÷ wire diameter; direct + torsional shear; unequal stress inside/outside the coil | stated in the input / index / stress step texts (both books) |

## Fasteners

| # | Source | Given | Asked | Answer (solution) | Page / status |
|---|---|---|---|---|---|
| 17 | HW5 P1 (8-17) | ½-13 UNC gr 8, two 2-in Al plates, washers 0.095 (ID 0.531), nut 7/16 | bolt length, kb, km | 4.75 in; 1.322 Mlbf/in; frusta 89.20 / 9.24 → 4.19 Mlbf/in | both — PASS |
| 18 | HW5 P2 (8-29 mod) | kb 3, km 12 Mlbf/in, 80 kip / 6 bolts, ½-13 gr 8, 0.75 Fp, lubricated | Fi, T, wrench, nL, n0, nf (Goodman) | 12.77 kip; 1149 lbf·in = 95.8 ft·lb; ¾ in; 1.60; 1.20; σa 9.39, σm 99.39 → 0.856 | both — PASS (new "given" kb / km inputs, wrench ≈ 1.5d) |
| 19 | HW5 P3 (8-77) | 3 × M12 × 1.75 ISO 5.8 at 0, ±32 mm, 12 kN at 200 mm, 8-mm 1020 HR bracket, 136 deep | n for bolt shear, bolt bearing, bracket bearing, bracket bending | F 37.7 kN; τ 333 MPa → 0.728; σ 393 → 1.07 / 0.534; I 1.48 × 10⁶ mm⁴, σ 110 → 1.91 | both — PASS (new separate bolt/member bearing + bracket-bending step) |
| 20 | Final review Sc. 3 a–b | 4 × M8 × 1.25 ISO 4.6, kb 0.24, km 1.30 × 10⁹ N/m, 2400 N, Fi 8 kN, Se 48 MPa | C, yield n, fatigue n | 0.156; σb 221.1 → 1.02 (proof); σa 1.28 → nf 15.2 | both — PASS |
| 21 | STQ 2022 P2 (8-34, 8th ed.) | ¾-16 UNF SAE 5, 1.5-in CI joint, 0.134 washers, 6 kip repeated, Fi 25 kip | L, kb, km, C, nf Goodman / Gerber, overproof load factor | 2.41 → 2½ in; 6.78; 14.40 Mlbf/in; 0.320; 2.77; 4.19; 3.50 | both — PASS (kb 6.776, nf 2.76 / 4.19, nL 3.49 with At formula) |
| 22 | RAP Q1, Q4–Q7, Q12 | definitions | — | sizes by major diameter; pitch does not set kb directly; rolled threads stronger in fatigue; pivot = bolt-group centroid; ½-in nut → ¾-in wrench; ISO 4.8 ≈ 400 / 320 MPa | stated in the bolt, kb, fatigue, shear-joint, torque steps and the grade-table note |

## Fluid power

| # | Source | Given | Asked | Answer (solution) | Page / status |
|---|---|---|---|---|---|
| 23 | HW3 P1 2024 | regenerative, relief 1000 psi, 4-in bore, 2-in rod, 14 gpm | pump power, max loads, speeds, line flows, pipe | 9.61 → 10 hp; 3141 / 9424 lb; 1029 / 343 in/min; 56 gpm cap line, 18.7 gpm return; 1.23 in → 1¼-in pipe | both — PASS (new regenerative analysis, given-Q input, cap-line flow sizing) |
| 24 | HW3 P2 | two cylinders, sequence valves, pilot-operated DCVs | sequence | 1 extends, 2 extends, 1 retracts, 2 retracts | qualitative — stated in the step-1 component note |
| 25 | HW3 P3 | 6000 lb up 30°, μ 0.2, not guided, 20-in stroke, 1000 psi; 0.5 ft/s in 0.5 in | bore, rod; accel check | F 4039 lb → 2.27 → 2½ in; k 2, Lb 40 → 1⅜ rod; g 0.095 → 4609 lb < 4909 OK | both — PASS (g 0.093 by formula, F 4598) |
| 26 | HW3 P4 | 3000 + 1000 lb in series, 1000 psi, 15 ft/min, 40 in, rigid | bores, rods, pump, accel within ¾ in | 5 × 3 in + 4 in (A 12.57 in²); p2 79.6, p1 203.7 psi; 15.3 gpm; g 0.0165 → 207.1 psi | new "series cylinders" step + pair table ★ 5 × 3 / 4 — PASS |
| 27 | HW3 P5 (Esposito 6-27) | 2000-lb crane, 2.5 + 5 ft, 45°, β 30°; 1000 psi; 14-in extension; 8 in/s | F, bore, rod, pump, pipe, motor, accel | 8485 lb; 3.29 → 4 in; k 2, Lb 28 → 1⅜; (13.8 ft/min, 8.77 gpm, ½-in pipe, 6.18 → 7.5 hp) | page: 9.43 ft/min, 6.16 gpm, ⅜-in pipe, 4.2 → 5 hp — **solution slip** (see §17); new load-speed → cylinder-speed calc |
| 28 | Final review Sc. 2 | press 4000 lb, 1000 psi, 8-in stroke, vertical, not guided; 3 in/s | cylinder, rod, flow, pipe, motor, accel, regen? | 2½-in bore (4910 lb), k 2 → Lb 16 → 1-in rod; 3.83 gpm; ⅜-in pipe 8.7 ft/s; 2.63 → 3 hp; accel +5 %; regen needs 2½ rod → 4-in bore | both — PASS |
| 29 | STQ 2022 P2 | 1500 lb horizontal, 50 ft/min, 20 in, μ 0.12, accel in 0.75 in, 750 psi | bore, rod, pump, hp, cost cut | g 0.18 → 450 lb → 1 in (588 lb); trunnion k 1.5, Lb 30 → 1-in rod → 1½ bore (1325 lb); 4.6 gpm; 2.36 → 3 hp; 500 psi → 1.57 hp, 400 psi → 1.26 hp | both — PASS (g 0.172 by formula; Table b-5 rod check moves the bore to 1½) |
| 30 | RAP fluid quiz Q1–Q12 | definitions / symbols | — | pump = varying volume; accumulator stores potential energy; check valve bypasses a flow control; spring-centred directional valves; cracking pressure; GPM; tubing can be bent; 10–25 % margin for friction, direction changes, viscosity; regen: equal pressure both ends, fixed pump gives constant flow; relief valve normally closed; pilot-operated check; gear pumps give constant flow | step-1 note, assumptions, pipe step, figure panel (symbols) |

## Tables added (★ pick + Use)
- Power screws (both): Mott Table 17-1 / 17-1M Acme / trapezoidal screws (first row with At ≥ At,req; nut length per row).
- Ball screws (both): Mott Fig. 17-8 sizes with rated load at the required travel (smallest adequate).
- Springs: Shigley Table A-28 (music-wire / W&M; metric preferred) — mode 2 nearest gauge keeping ns ≥ (ns)d; mode 1 the live Example 10-2
  candidate table (feasibility + fom, ★ largest fom); Mott Table 18-2 next size above the trial Dw.
- Fasteners (both): Tables 8-2 / 8-1 (19-4 / 19-5) bolt size by np, nL, n0; Tables 8-9 / 8-10 / 8-11 grade table; Mott 19-1 sizing table by At,req.
- Fluids (both): Parker Table b-5 bore / rod combinations (rod must be offered with the bore); pipe schedule table (≤ 15 ft/s); series-cylinder pair table.
