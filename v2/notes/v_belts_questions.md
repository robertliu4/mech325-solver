# V-belts: question types in MECH 325 and how the calculator answers them

Calculator: `v2/topics/v_belts_common.js` (used by both `v_belts_mott.html` and `v_belts_shigley.html`). Step 1, "What does the question ask?", picks one of six question types (`mode`). Each type shows only its own steps, in the order the course solutions use.

Sources read: Flat&V-belts 2024 slides s22–s42, Tutorial 2 (2023) Q1/Q2, Selected Tutorial Solutions M1 (2025) p11–24, HW1 2025 solutions p5–9 (handwritten pages rasterised), Midterm 2025 Book 2 P1 and the MC questions (scanned), Mott Ex 7-2, Shigley Ex 17-4, Fizz guide pp. 9–18 and Mech guide pp. 19–26.

## Course questions

| # | Question type (mode) | Source | Given | Asked | Steps that answer it |
|---|---|---|---|---|---|
| 1 | Design a new drive, Mott (`mott`) | **Midterm 2025 P1** | AC motor (normal torque) → textile machine, 10 h/day, 40 hp, 1150 rpm, 590 rpm nominal, CD 32 in | (a) service factor; (b) section, sheaves, number of belts, final VR; (c) final CD; (d) n_fs | Power & speeds → Ks/P_des → section (Fig 7-13) → D1 for 4000 ft/min → standard sheaves → P_Tab + ΔP_R → trial CD → L → Table 7-2 → actual CD, θ1 → Cθ, CL → belts, n_fs → Answer |
| 2 | Design a new drive, Mott (`mott`) | HW1 P2 (Mott 7-20) | 6-cyl engine → heavy conveyor, 16 h/day, 40 hp, 1500 → 550 rpm | belt type, number of belts, sheaves, actual VR, CD | same as #1 |
| 3 | Design a new drive, Mott (`mott`) | HW1 P3a (Mott 7-19) | AC normal torque → fan, 22 h/day, 5 hp, 1750 → 725 rpm | same as #2 | same as #1 |
| 4 | Design a new drive, Mott (`mott`) | Mott Example 7-2 | 50 hp, 1160 → 675 rpm, bucket elevator, 12 h/day | complete design | same as #1 |
| 5 | Gates catalogue design + installation (`gates`) | HW1 P3b | as #3, using the Gates manual | design; comparison with Mott; belt pre-tension; minimum mid-span deflection force | Ks (Table B1) → section (Fig B1) → NEMA minimum sheave (B2/B3) → sheaves and belt (drive table) → CD → hp correction × (H_tab + ΔP) → belts, n_fs → (tensions) → T_st (D19) → span, t/64, force (D35, D20–D23) |
| 6 | Gates catalogue design + installation (`gates`) | **Tutorial 2 Q2** | 60 hp 4-cyl engine → brick machine, 2 shifts, equal sheaves, ~12 ft, 400 rpm | (a) number of belts; (b) n_fs, F1, F2, Fi (comment vs Q1); (c) Gates static tension, mid-span deflection, force range | same as #5; the Shigley tension steps use H_d/N_b (gives the solution's Fi = 409 lbf) |
| 7 | Gates installation (`gates` or `tension`) | Lecture example s38–40 | 3VX800, 6/19 in sheaves, 1750 rpm, 2 hp, light shock 8 h/day | VR, fan speed, H_d, P_A, n_fs, V, C, Kφ, span, T_st, deflection, force | `gates`: full chain; `tension`: sheaves → belt → CD → D19 → D35 → D22/D23 |
| 8 | Analyse a given drive, Shigley (`shig`) | **Tutorial 2 Q1** (S 17-19) | 60 hp engine → medium-shock brick machine, 2 shifts, 26/26 in sheaves, ~12 ft, 400 rpm, D360 belts | (a) number of belts; (b) F1, F2, Fi, n_fs; (c) life in passes, hours, days | Ks → geometry (Lp, C, φ, V) → H_tab, K1, K2, H_a → N_b, n_fs → ΔF (H_a basis) → Fc, F1, F2, Fi → T1, T2 → N_P, t, years |
| 9 | Analyse a given drive, Shigley (`shig`) | Shigley Example 17-4 | 10 hp 1750 rpm, 7.4/11 in, 3 × B112, Ks 1.2 + 0.1 | full analysis and life | same as #8 with N_b typed (3) and the H_d/N_b basis |
| 10 | Concept MC (no calculator) | Midterm MC 9, 10, 13; SA 16 | — | which tension is ignored for flat belts (bending F_b); ranking of drive capacity; hp → ft·lbf/s (×550); chains vs V-belts | slide 24 tension diagram (Shigley Fig 17-14 in the figure panel) |

## Exam variants (inverse problems) and where they are answered

| Variant | Mode | How |
|---|---|---|
| Power capacity of a given drive / largest motor it can take | `rate` (Mott charts) or `shig` | Type the section, sheaves, belt length and N_b. The answer gives N_b·P_belt and P_max = N_b·P_belt/(Ks·n_d). |
| Number of belts for an existing drive | `rate` / `shig` | Leave N_b blank to get the rounded-up value. |
| n_fs for a given number of belts | `rate` / `shig` / `mott` | Type N_b. |
| Output speed, actual VR, belt speed | `geom` (or any mode) | Sheaves step. |
| Belt length for a chosen CD | `geom` | Trial CD → L (Mott 7-12 / Shigley 17-16a). |
| CD for a stocked belt length | `geom` | Type L in the standard-belt step → CD (Mott 7-13 / Shigley 17-16b). |
| Max sheave for V < 5000 ft/min; driver for 4000 ft/min | `mott` | Driver-sheave step (D1,max, D1 for v_target). |
| Ratio / wrap / speed / CD-range checks | all | Warnings: ratio > 6 (7 cogged), θ1 < 120°, V outside 1000–5000 (6500 max), CD outside D2 to 3(D1+D2), sheave below the minimum. |
| Speed increaser | all | Warning on VR_nom < 1: Table 7-1 × 1.2. |
| Required initial tension Fi / F1, F2 | `shig` (or `gates`) | Tension steps; choose the ΔF basis. |
| Installation tension and deflection force | `tension` (or `gates`) | D19 with the motor hp, D26 Kφ, D27 M/Y, D35 span, D20–D23. |
| Effect of changing speed or CD on capacity | `rate` | Change n1 or the belt/CD. The P_Tab, ΔP_R, Cθ and CL auto values update. |
| Belt life (passes, hours, years) | `shig` | Life steps; N_P > 10^9 is reported as a lower bound. |

## Course-solution slips found (not "fixed" in the calculator; noted in the steps and the header)
- Midterm P1: the solution writes L = 122.9 in for CD = 32 in (the correct sum is 114.9 in) and then picks 125 in. The final answers (CD 37.10, 3 belts, n_fs 1.34) follow from the 125-in belt. The example reproduces them with L = 125.
- HW1 P3a (handwritten): ΔP_R = 1.9 hp is read from the 5V chart (Fig 7-17) for a 3V belt. The 3V value is about 0.33 hp. Either way the drive needs one belt.
- HW1 P2: the solution omits ΔP_R (Fig 7-17 gives about 1.6 hp at VR 2.72 and 1500 rpm). The drive still needs 3 belts.
- HW1 P3b: the minimum deflection force is divided by 6 instead of 16 (it shows 7.23 lbf). The correct value is (1.4·28.12 + 4)/16 = 2.71 lbf.
- Lecture s38: the slide says "Ks = 1.2" but computes H_D = 1.1(2.0) = 2.2 hp. The verification uses 1.1.
- COURSE_CONVENTIONS §2 lists HW1 P3a as "ΔP 1.4, CL 1.09, Ha 11.6". The handwritten solution actually shows ΔP 1.9, CL 1.07 and Ha 11.84. The typed variant uses CD 30, 100 in, CL 1.09 and gives 10.55 hp.

## Sizing tables ("which size do I pick, and why")
Each choice is a live table under its step (★ = rule pick, greyed = fails, **Use** fills the field; the yellow field's auto value is the ★ row):

| Step | Data in the calculator | Rule | Course picks reproduced |
|---|---|---|---|
| Section | Mott Fig 7-13, Gates Fig B1 (narrow) + B2 (classical), course A–D chart (slide 27) — region lines digitised by pixel scan of the crops; Shigley Table 17-9 hp ranges and min sheaves | region containing (P_des, faster rpm); within ≈10 % of a line → larger (Fizz p.10). Shigley: chart region if inside Table 17-9's range, else the smallest section whose range contains P_des | Midterm 5V; HW1 P2 5V (on the 3V/5V line); HW1 P3a 3V; Ex 7-2 5V; HW1 P3b 3V (B1); Tut 2 Q2 8V (B1) / CP (B2) — solution "8V or 8VX and CP", chose CP; Ex 17-4 B |
| Sheaves | Mott standard pitch diameters (Fig 7-14/15/16); Gates stock lists: 3V Table B6, A/B/C/D Tables B21–B24 (VR 1.00 rows), 5V/8V = Mott list + 2a | Mott: closest standard D2 to D1·VR, output within ±2 % (`tolN2`), belt speed nearest 4000 ft/min, 1000–5000 ft/min. Gates: smallest stock sheave ≥ NEMA minimum (must *exceed* it below the 575-rpm column) within ±2 % | Midterm 10.8/21.1; HW1 P2 10.2/27.7; HW1 P3a 7.95/18.95; Ex 7-2 12.4/21.1; HW1 P3b 3.35/8.00; Tut 2 Q2 13/13 |
| Length | Table 7-2 (3V/5V/8V), Table 17-10 (+ Table 17-11 L_c) | closest standard length (tie → longer), CD in D2 < CD < 3(D1+D2), θ1 ≥ 120° | HW1 P2 132; HW1 P3a 90; Ex 7-2 100; HW1 P3b 40 (3V400); Tut 2 Q2 C330; Tut 2 Q1 D360. **Midterm: the rule gives 112 in** for the correct L = 114.9 in; the course took 125 in after its 122.9-in slip — the table notes it and the example keeps 125 |
| Belts | N_b = 1 … ⌈P_des/P_belt⌉ + 1 | smallest N_b with n_fs ≥ 1 | 3, 3, 1, 3, 3, 4, 5, 3 |

Not digitised: Gates rating tables (B9–B34) and the drive tables' CD / hp-correction colour key stay manual reads; Gates 5V/8V stock sheaves are Mott's list + 2a (the catalogue text layer is damaged).
