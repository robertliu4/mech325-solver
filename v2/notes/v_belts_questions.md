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
