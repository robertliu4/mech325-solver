# Bearings, bushings, shafts & keys — past course questions and how the calculators answer them

Calculators: `bushings_{shigley,mott}`, `ball_cyl_bearings_{shigley,mott}`, `tapered_bearings_{shigley,mott}`, `shafts_keys_{shigley,mott}`.
Sources read (v2/course/past): HW4 solutions 2023 and 2024 (typed + handwritten pages rasterised), final-exam review solutions (scanned, read at 110 dpi),
"Selected Tutorial Questions for Final Exam Study 2022" (scanned, OCR + images), All RAP.pdf (bearings/shafts quiz), Midterm 2014 answers (Part 1 MC + Part 2 LA Q24, Q25).
The other midterms (2016, 2021–2025), HW1–HW3 and HW5 have no bearing / bushing / shaft / key questions (HW5 "bearing" = bolt bearing stress and Thomson linear bearings, handled by fasteners / ball_screws).
All numeric cases below were reproduced with a Playwright probe (localStorage state) — "pass" = calculator value matches the course answer to the shown digits.

## Numeric questions

| # | Source | Given | Asked | Course answer | Calculator | Result |
|---|---|---|---|---|---|---|
| 1 | HW4 2023 P1a (Mott 16-4 mod.) | bushing D 0.50 in, 75 lbf, 600 rpm, L/D 0.5–1.5, n_d = 2 | pV, material (Table 16-1) | L = 1.5D: p 200 psi, V 78.5 fpm, pV 15 700, design 31 400 → porous bronze / BU; L = D: p 300, 47 124 → porous bronze | bushings_mott (n_d stays 1; the "n_d = 2" is Mott's 2·pV) — 200 / 78.54 / 15 708 / 31 416, table ★ porous bronze | pass |
| 2 | HW4 2023 P1b | + f_s 0.04, ħ 2.7, J 778, 70 °F, porous bronze (Shigley Table 12-8, 150 °F) | compare with Shigley (temperature rise) | L needed 15.42 in; T_f(L = 0.75) = 1715 °F; T_f(0.5) ≈ 2540 °F → not feasible, use a rolling bearing | bushings_shigley (mat Porous bronze, n_d 2): L_T 15.42, T_f 1715 °F → FAIL; bushings_mott temperature step same | pass |
| 3 | HW4 2024 P1a (Mott 16-7 mod.) | 3.00 in, 800 lbf, 350 rpm, L = 1.5D | pV, material | p 59.3, V 275, pV 16 290, design 32 580 → porous bronze / BU | bushings_mott 59.26 / 274.9 / 16 290 / 32 579, ★ porous bronze | pass |
| 4 | HW4 2023/24 P2 (Shigley 12-27) | Oiles SP500, w 0.002 in in 1000 h, 200 rpm, 100 lbf, n_d 2, f_s 0.03, 300 °F, 70 °F, D 1.25 in | bushing size, Oiles limits | L_wear 0.40, L_heat 1.788 → 1¼ × 1⅝ × 2 (L/D 1.6); P_max 101.9 psi, V 65.4 fpm, PV 5236 | bushings_shigley: L_w 0.40, L_T 1.788, table ★ 1¼ × 1⅝ × 2, 101.9 / 65.45 / 5236, PASS | pass |
| 5 | HW4 2023 P3 (Shigley 11-23) | 02-30 mm, F_a 2 kN, F_r 5 kN, 400 rpm, R 0.99 | F_e, life | Y_2 1.27, F_e 5.34 kN, x_D 10.66, 444 h | ball_cyl_shigley thrust + "Check a given bearing": F_a/C_0 0.2, F_e 5.34, x 10.66, 444.2 h (Y_2 typed 1.27; auto 1.266) | pass |
| 6 | HW4 2024 P3 (Shigley 11-22) | 02-65 mm, F_a 3, F_r 7 kN, outer ring, 500 rpm, 10 kh, R 0.95 | F_e; adequate? | Y_2 1.53, F_e 9.29 kN, C_10 req 73.4 kN > 55.9 → no | Y_2 1.534, F_e 9.305, C_10 73.5 kN, life 4400 h < 10 000 → FAIL | pass |
| 7 | HW4 2023/24 P4 (Shigley 11-35 mod.) | countershaft, R_O 195, R_E 196 N, 1500 rpm, 60 kh, R 0.98 for the pair, a_f 1 | deep-groove bearings | x_D 5400, C_10 5.7 kN → 02-12 mm (6.89 kN) | R_D 0.98995, x_D 5400, C_10 5.694 kN, table ★ 02-12 mm | pass |
| 8 | HW4 2024 P4d | SKF 6201-2Z, C 7.28 kN, P_u 0.039 kN, P 0.196 kN, η_c 0.5, κ 1 | SKF modified life | a_1 0.25, a_SKF 0.3 → L_nm = 3843 × 10⁶ rev < 5400 | ball_cyl_shigley SKF step: a_1 auto 0.25, η_c P_u/P 0.0995, L_nm 3843 | pass |
| 9 | HW4 2023/24 P5 (Shigley 11-50) | tapered: F_rA 875, F_rB 625, F_ae 250 lbf, 150 rpm, 90 kh, R 0.9, shafts 1.125 / 1.000 in | Timken bearings | F_iA 274, F_iB 196 → Eq. 11-19; C_10B 1208 → 07100/07196 (1570, K 1.45); C_10A 1990 → 15590/15520 (2480, K 1.69); trial 2 F_eA 1120, 2160 lbf OK | tapered_shigley: 274.2 / 195.8, C_10B 1208.5, C_10A 1969.8 (KB still 1.5 in trial 1), table ★ 07100/07196 and 15590/15520; trial 2 F_eA 1115, C_10A 2155.7 | pass |
| 10 | HW4 2023/24 P6 (Mott 11-4 mod.) | 110 hp, 1700 rpm, bore 2.5 in, hub 3.25, SAE 1018 key, N 3 | key, spline (B fit), pin | 5/8 sq key, L 0.580 → 3.25 in; spline K = 201 → 4B (219) or 6B (208); dowel pin 0.250 in (9787 lbf req.) | shafts_keys_mott: Table 11-1 ★ 5/8 sq, L 0.5797; spline K 200.7, ★ 6B (208); pin table ★ 0.250 dowel (shafts_keys_shigley too) | pass |
| 11 | HW4 2023/24 P7 (Shigley 7-6 mod.) | d 1.5 in, S_e 40, S_ut 90, S_y 65 kpsi, K_fb 2.0, K_fs 1.5, K_fa 2.3, M_a 973.1, T_m 1875, F_m 173 lbf | n_f with and without axial force | 4.38 both (axial negligible) | shafts_keys_shigley (S_e given, axial inputs): 4.38 / 4.38 | pass |
| 12 | HW4 2023 P8 (Mott 12-26 mod.) | SAE 1137 CD (s_u 98, s_y 82, s_n 37 ksi, C_s 0.8, C_R 0.81), N 3; C: M 10 911, T 2625, sharp fillet; D: M 4390, T 3938, ring grooves | diameters, keys (N 4), bearings (8 h/day, 20 d/mo, 5 yr, 90 %) | C: 3.26 in; D: 2.72 → 2.75 in; keys 5/8 sq 0.679, 3/8 sq 1.38, 3/8 sq 0.691; L 1.38e8 rev; B 678 lb → 3500 lb → 6012 (later 6212 for shoulders); C 1307 lb → 6753 lb → 6017 | shafts_keys_mott: s'_n 23 976, D_C 3.264, D_D 2.563 × 1.06 = 2.717 → ★ 2 3/4; key lengths same; ball_cyl_mott: L_d 1.382e8, 3506 lb → ★ 6012 (S 67 mm), 6758 lb → ★ 6017 (S 92 mm) | pass |
| 13 | HW4 2024 P8 (Mott 12-24 mod.) | SAE 1137 OQT 1300, 480 rpm, 8 h/day, 20 d/mo, 5 yr; A 373 lb, bore ≥ 14.6 mm | bearings | C = 2453 lb → 6302 (2563), S 20 mm | ball_cyl_mott: L_d 2.765e8, C 2430 lb, ★ 6302 (S 20 / H 37) | pass (C 1 % low — solution value not reproducible from 373 lb, see §17) |
| 14 | Final review Q1 (b–c) | spur gear shaft, 6 hp, 1160 rpm, SAE 1050 CD (s_u 100, s_y 84, s_n 38, C_R 0.81, C_s 0.85), N 2.5; B: M 500, T 326, profile keyseat | s'_n, D at B, key | s'_n 26 163 psi, D 0.992 → 1.000 in; 1/4 sq key L 0.241 in | shafts_keys_mott: 26.16 ksi, 0.9923, ★ 1 in, Table 11-1 ★ 1/4 sq, L 0.2415 | pass |
| 15 | Final review Q1 (d–e) | C: T 326, V 250, sharp fillet 2.5; life 1160 rpm × 6 h/day × 20 d/mo × 5 yr; loads 250 / 166 lb | D at C, bearings, coupling key | D 0.441 (12-24, M = 0) vs 0.419 (12-16); L 501e6, C 1985 lb → 6301 (S 17 mm); A 1318 lb → 6201; coupling 0.5 in, 1/8 key, L 0.966 | shafts_keys_mott: 0.4407 / 0.419; ball_cyl_mott: 5.011e8, 1986 → ★ 6301 (S 17), 1319 → ★ 6201 (S 16) | pass |
| 16 | Tutorial 2022 Q1 (Shigley 12-22, 9e) | Oiles 500, 1 × 1 in, 500 lbf, 200 rpm, w 0.005 in, f_1 1.8, f_2 1 | revolutions to w; wear for 1e6 rev with Oiles 800, 800 lbf, 80 rpm, f_1 2 | 1389 h = 16.7e6 rev; w = 2.67e-3 in | bushings_shigley (f_1 f_2 input): 1389 h, 1.667e7 rev; 0.002667 in | pass |
| 17 | Tutorial 2022 Q2 (Shigley 11-6, 8e) | F_r 8, F_a 5 kN, outer ring 1000 rpm, 5 kh, R 0.95, angular contact | C_10, bearing | 90 mm: Y_2 1.64, F_e 13.58, 106.6 kN; 95 mm: Y_2 1.694, F_e 13.87, 108.9 < 121 → 02-95 | Y_2 1.641 / 1.694, F_e 13.58 / 13.85, C_10 106.7 / 108.8 kN, PASS | pass |
| 18 | Tutorial 2022 Q3 (Shigley Ex. 7-6, 8e/9e) | d 2 in, 600 rpm, 5 hp; then 40 hp, S_y 70 kpsi, n 2.5 | setscrew (n 4), dowel pin (double shear, n 3), taper pin (single shear), gib-head key | 7/16 setscrew; 0.125 dowel; 0.188 taper; ½ × ⅜ key 0.80 in or ½ × ½ 0.60 in | shafts_keys_shigley: T 525, F 525 → ★ 7/16, ★ 0.125 dowel, ★ 0.188 taper (single shear); key l_shear 0.52, l_crush 0.80; Table 7-6 shows 0.60 for ½ × ½ | pass |
| 19 | Tutorial 2022 Q4 (Mott 12-23) | gear C: M 4056, T 3150, ring groove K_t 3, SAE 1117 CD (s_n 26, C_s 0.85, C_R 0.81, s_y 51 ksi), N 3 | D at C | 2.75 in; ×1.06 = 2.92 in | shafts_keys_mott: s'_n 17.9, 2.752, 2.917 | pass |
| 20 | Midterm 2014 Q24 | x_D 20, a_f 1.2, F_D 1600 N, R 0.995, SKF Weibull | C_10, bore | 9.93 kN → 20 mm | ball_cyl_shigley: 9.928 kN, ★ 02-20 mm | pass |
| 21 | Midterm 2014 Q25 | SI: S_ut 820, S_y 650, S_e 280 MPa, K_f 1.75, K_fs 2.2, M_a 95, T_m 52 N·m, n 1.8, DE-Soderberg | d | 23.9 mm | shafts_keys_shigley (SI units, Soderberg): 23.92 mm, table ★ 25 mm | pass |

Textbook examples kept as loaded examples / headers: Shigley Ex. 12-10, 11-7, 11-8, 7-2, 7-6; Mott Ex. 16-1, 14-2/14-3, 14-4, 14-5, 12-1, 11-1 (all pass).

## Conceptual questions (RAP quiz, Midterm 2014 MC) and where the page states the rule

| Question | Answer | Where stated |
|---|---|---|
| RAP Q2: NOT a characteristic of bushings | "PV rating is derived from the maximum pressure and linear speed" (PV uses the nominal pressure) | bushings: PV step formula \(PV = P V\) with nominal P; P_max is a separate check |
| 2014 MC 11: increase what to shorten a bushing | its PV rating | bushings_shigley PV step: "PV does not depend on D: only a longer bushing lowers it" |
| RAP Q3: load–life trade-off | \(F L^{1/a}\) = constant | ball_cyl_shigley life step text |
| RAP Q4: L_10 | life 90 % of bearings reach or exceed | ball_cyl (both) life / reliability step text |
| RAP Q5: thrust in ball-bearing selection | equivalent radial load doing the same damage | ball_cyl_shigley thrust step text |
| RAP Q6: fits with a rotating inner ring (chain drive) | inner race interference, outer race clearance | ball_cyl (both) first step text |
| RAP Q7: drawback of retaining rings | stress concentration | shafts: K_t of ring groove (5.0 Shigley / 3.0 Mott) + ×1.06 rule |
| RAP Q8: component in the picture | Woodruff key | shafts_keys_shigley Fig. 7-17 |
| RAP Q9 / 2014 MC 12: tapered rollers in pairs / best for | constrain axial motion and set preload; large radial + axial in both directions | tapered (both) first step text |
| RAP Q10: key design consideration | key must be secured against axial motion | shafts assumptions (key) |
| RAP Q11: FALSE statement | "fatigue K_f is the same as static K_t" (false) | shafts_keys_shigley K_t step text; Mott: K_t only on the bending term |
| RAP Q12: cannot transmit torque | retaining ring | shafts pins/alternatives step text |
| 2014 MC 13–14, SA 16, 18 | fatigue criteria, shaft stress type, diagrams, layout critique | shafts step texts (M_a / T_m convention); no calculation |

## Additions made for these questions
- bushings_shigley: wear-length L_w and L_min = max(L_T, L_w); live Table 12-12 selection (★ + Use); temperature at the chosen L; f_1 f_2 factor; revolutions to w_max; Table 12-8 generic materials with limits.
- bushings_mott: Table 16-1 selection table; temperature-at-L check with T_max.
- ball_cyl_bearings_shigley: Table 11-2 / 11-3 selection tables in every selection step; minimum-bore filter; "check a given bearing" (life at R_D, reliability at design life); optional SKF L_nm step (a_1, a_SKF, η_c crops added).
- ball_cyl_bearings_mott: Table 14-3 selection tables (bore filter, S/H shoulders); design life from h/day × days/month × 12 × years.
- tapered_bearings_shigley: Fig. 11-15 selection tables (bore filter per bearing, rating in N or lbf).
- tapered_bearings_mott: Table 14-7 selection tables.
- shafts_keys_shigley: preferred-diameter table with n_f, n_y at each size; Table 7-6 key table; given-S_e override; axial-force terms; DE-Soderberg; SI unit mode; setscrew (Table 7-4) and pin tables.
- shafts_keys_mott: preferred-diameter table (Table A2-1) with actual N; Table 11-1 key table; spline (Table 11-6) and pin alternatives.
