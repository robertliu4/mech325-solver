# Gears (spur, helical, bevel, worm, rack, gear trains): past course questions and how the calculators answer them

Calculators: `spur_{shigley,mott}` (includes the general gear-train section), `helical_{shigley,mott}`, `bevel_{shigley,mott}`, `worm_{shigley,mott}`, `rack_{shigley,mott}`.
Sources read (v2/course/past): midterms 2014, 2016, 2021, 2022, 2023, 2024, 2025 (MC, short answer, long answer), HW2 2024 solutions (P2–P10 incl. spreadsheet P8),
final-review sets, All RAP.pdf (gear quiz). HW3 is fluid power, and the 2022 "Selected Tutorials" have no gear questions. HW4 gear content is shafts and bearings only (see past_exam_bearings.md).
Every numeric case below was reproduced with a Playwright probe (localStorage state). "Pass" means the calculator matches the course answer to the digits shown, or the difference comes from a course slip listed in COURSE_CONVENTIONS §17.

## Numeric questions

| # | Source | Given | Asked | Course answer | Calculator | Result |
|---|---|---|---|---|---|---|
| 1 | Midterm 2025 P2 | spur, Shigley | geometry, forces, AGMA contact, life | NG 46, dP 1.7, V 778.9, Wt 423.7, Wr 154.2, Kv 1.175, Km 1.22, I 0.1173, σc 115.8 ksi, N 1.26e8, ZN 0.943 | spur_shigley: same values. Fig. 9-11 trial Pd pick = 10 (★ in the standard-pitch table) | pass |
| 2 | Midterm 2021 P2 | 5 hp 1750 rpm, 16/51, P 12, F 1, Qv 10, Ko 1.25 | forces, σc, HB | V 610.9, Wt 270.1, Wr 98.31, Kv 1.108, Km 1.193, I 0.1223, σc 120.4 ksi, HB 282 | 610.9 / 270.1 / 98.31 / 1.108 / 1.193 / 0.1223 / 120.3 ksi / 283 | pass |
| 3 | Midterm 2016 Q15b, 2021 Q17 | C = 6 in, P 16, VR 3 | teeth, diameters | NP 48, NG 144, dP 3, dG 9 | spur: new "required C" input → NP 48, NG 144, 3 / 9 in | pass |
| 4 | Midterm 2016 LA21 | idler train 20 hp 2500 rpm P6, 17 → 20 (idler) → 60 | Wt, Wr, centre distance | Wt 356.2, Wr 129.6, C 3.083 + 6.667 = 9.75 in | train section: 355.9 / 129.5; centre chain 3.083 + 6.667 = 9.75 | pass |
| 5 | Midterm 2016 LA22 | Wt 450, Ko 1.5, Kv 1.6, Km 1.6, P6, F2, J 0.30 / 0.31 | σ pinion / idler | 17 280 / 16 722 psi | 17 280 / 16 723 | pass |
| 6 | Midterm 2016 LA23 | grade 2, 330 HB, YN 0.95, KR 0.85 | SF | σall,P 55 949, SF 5.6 (idler 4.3) | 55 949 → 5.6 / 4.3 | pass |
| 7 | HW2 P4 (Shigley 13-43 mod.) | 30 hp 1200 rpm, 18/54 × 2, P10 | speeds, torques, forces | 400 / 133.3 rpm; T_in 1576, T_out 14 181 lbf·in; Wt 1751 / 5252, Wr 637 / 1912 | train section: same | pass |
| 8 | Midterm 2014 MC6 | planetary: sun 15 → ring 100 (internal), planet = idler, 2000 rpm CW | ring speed, direction | 300 rpm, opposite | train (stage mesh "internal", idler teeth): 300 rpm, opposite | pass |
| 9 | Midterm 2016 MC7 | ring 150 → sun 15 | speed ratio, direction | 1000 rpm, opposite | 1000 rpm, opposite | pass |
| 10 | Midterm 2014 LA21 | 2 kW 3000 rpm, 15/30, η 0.97 | output speed, torque | 1500 rpm, 12.35 N·m | 1500 rpm, 12.35 N·m (SI torque output) | pass |
| 11 | Midterm 2023 MC6/7 | 15/32, 24/75, 1800 rpm CW, 750 W | output speed and direction, torque | 270 rpm CW, 26.5 N·m | 270 CW, 26.5 N·m | pass |
| 12 | Midterm 2024/2021 MC6/7 | 17/34, 16/40 | speed, torque | 360 rpm CW, 19.9 N·m | same | pass |
| 13 | Midterm 2022 MC6/7 | 17/51, 18/36, 1000 W | speed, torque | 300 rpm CW, 31.8 N·m | same | pass |
| 14 | Midterm 2016 MC4 / MC6 | 20/40 cm, 500 W 300 rpm; 19/38, 16/64, 1600 rpm | torque; speed | 31.8 N·m; 200 rpm | same | pass |
| 15 | HW2 P7 (Mott 9-60) | spur, Mott | full design | Ko 1.5, Pdes 7.5, Pd 10, NG 56, nG 385.7, C 3.7, vt 565.5, Wt 291.8, Cpf 0.04417, Cma 0.1458, Km 1.19, st 17 090, sc 125 530 | spur_mott: Pd auto 10 (Fig. 9-11), 17 089, 125 525, rest same | pass |
| 16 | Midterm 2024 P2 | helical 20 hp 1750 → 450, Pn 10, ψ 20°, 19T, Ko 2.25, F 1.5, Qv 9 | forces, σ, HB | NG 74, Pt 9.397, dP 2.022, V 926.3, Wt 712.5, φt 21.17, Wr 276, Wa 259.3, W 806.9, Kv 1.189, Km 1.206; σ 28.9 ksi (Shigley J 0.50), 31.4 ksi (Mott J 0.46); HB 233 / 267 | helical_shigley 28.8 ksi, HB 231; helical_mott 31.3 ksi, HB 265; all other values same | pass |
| 17 | Midterm 2022 P2 | helical, transverse P 12, ψ 15°, 20T, 15 hp 1160 → 600, Ko 1.5, F 2, Av 8 | forces, st, HB | Pn 12.42, NG 39, dP 1.667, Wt 975.6, Wr 367.7, Wa 261.4, Km 1.27, st 29.09 ksi | new transverse-pitch input: Pn 12.42, Wt 978, Wr 368.5, Wa 262, Km 1.266, st 29.1 ksi | pass (Wt slip, §17) |
| 18 | Midterm 2014 Q15 | ψ 30°, N 35, d 5 | pn | 0.3887 in | 0.3887 | pass |
| 19 | HW2 P6 (Shigley 13-54) | helical layshaft | Pt, d, φt, T, forces | 5.196, 3.079 / 8.083, 22.8°, 916.1, Wt 595, Wa 343.5, Wr 250.1 | same; directions from the hand rule (solution's sign set is inconsistent, §17) | pass |
| 20 | HW2 P3 (Mott 8-42) | helical geometry | Pd, pitches, D, φt, F/px | 8.485, 0.3702, 0.2618, 0.3702, 5.657, 27.24°, 4.05 | same | pass |
| 21 | HW2 P8 (spreadsheet) | helical, PdIn 18, J 0.453 / 0.486, I 0.205, Kv 1.24, Km 1.24 | st, sc, sat, sac | 40 219 / 37 488, 161 614, 42 786, 179 572 | 40 111 / 37 387, 161 397, 42 671, 179 330 | pass (within 0.3 %; sheet's Wr uses 20° transverse) |
| 22 | Midterm 2023 P2 | bevel 10 hp 1750, 20/60, P10, F1, Ko 1.5, Av 8 / Qv 9, Kmb 1.1, J 0.25, 1500 h, forces at the large end | forces, st, life, HB, SF | γ 18.43, vt 916.3, Wt 360.1, Wr 124.4, Wa 41.45, Kv 1.188, Ks 0.508, Km 1.104, st 14 396, KL 0.969, sat 14 857, HB 290, SF 1.15 (4140 OQT1000) | new force-radius choice "large end": same; st 14 398, sat 14 860, HB 290, SF 1.151 | pass |
| 23 | HW2 P5 (Shigley 13-50) | bevel 18/30, Wt 25 | gear forces | γ 30.96, WrG 4.682, WaG 7.803 | same | pass |
| 24 | HW2 P10 (Mott 10-14 mod.) | 3 hp 300 rpm 15/45, P10, F 1.25, Ko 1.5, Kmb 1.25, J 0.234 / 0.182, I 0.075, 1000 h | st, sc, KL, CL | st 28 968, sc 238 091, KL / CL | Wt 840.3, Kv 1.071, Ks 0.508, Km 1.256, st 29 443, sc 238 320, KLP 1.007, KLG 1.027, CL 1.274 | pass (Ks slip in the solution, §17) |
| 25 | HW2 P9 (Mott 8-52 / 10-18) | worm NW 1, DW 1.25, Pd 10, φn 14.5°, NG 40, F 0.625, To 924 lb·in at 30 rpm, chilled bronze | geometry, forces, η, σ, WtR | λ 4.57°, DG 4.0, C 2.625, vs 394, WtG 462, WxG 52.6, WrG 120, μ 0.0324, Wf 15.5, PL 0.185 hp, Pi 0.625 hp, η 70.4 %, Kv 0.974, Wd 474, σ 24 235 psi, Cs 1000, Cm 0.815, Cv 0.43, WtR 659–664 lb > 462 OK | worm_mott: 4.574°, 4, 2.625, 394, 462, 52.56, 120.2, 0.0324, 15.55, 0.1856, 0.6255, 70.3 %, 0.9745, 474.1, 24 223, 1000, 0.814, 0.427, 658.8 → OK | pass |
| 26 | Module 2 worm example | 1-thread, NG 56, 1 hp out, 1725 rpm, d 1.5, Pt 8, Ka 1.25 | full rating | λ 4.764°, e 0.756, W^t_G 966.1, σa 39 500 psi, ts 96.1 °F | worm_shigley example: same (Wall 446.9: slide's 1787 is a slip, §17) | pass |
| 27 | Midterm 2014 MC3, 2022 MC3, 2023 MC3, 2024 MC3 | 2-start worm, 96T gear, 24 worm turns (2023: 80T, 20 turns) | gear rotation | ½ revolution | new worm "turns" step: 24(2)/96 = 0.5 rev (180°); 20(2)/80 = 0.5 | pass |
| 28 | HW2 P2 (Mott 8-81) | rack, NP 30, Pd 12, 50 rpm, 7 ft | dP, B, centre to back, V, t, revolutions | 2.5, 0.917, 2.167, 32.725 ft/min, 12.834 s, 10.695 rev | rack_{shigley,mott}: 2.5, 0.917, 2.167, 32.72, 12.83, 10.7 | pass |
| 29 | Midterm 2014 MC2, 2021 MC4, 2022 MC4 | N, d | Pd | Pd = N/d = 20 | spur geometry (and the standard-pitch table) | pass |
| 30 | Midterm 2023 MC5, 2024 MC5 | helical N, d | Pd = N/d | 20/8 = 2.5; 36/3 = 12 | helical geometry | pass |
| 31 | Midterm 2014 MC5 | T, ω | power | P = Tω = 200 W | train section torque from power (inverse) | rule |

## Conceptual (MC / short answer / RAP), each stated as a one-line rule on the page

| Source | Statement | Where it is stated |
|---|---|---|
| 2016 MC1, 2023 MC1, 2021/2024 MC1 | Spur and bevel teeth mostly roll; worm meshes are predominantly sliding | worm `vel` / `v` step text |
| 2021/2023 MC2 | Worm forces are equal and opposite pairs: W_Wt = W_Ga, W_Wa = W_Gt, W_Wr = W_Gr | worm `fall` / `f6` text, Fig. 10-24 note |
| 2021 MC9, RAP | Worm efficiency depends on f, φn and λ (drops sharply below λ ≈ 20°) | worm `eff` / `f7` text + assumption |
| RAP | Worm self-locking when λ < 5–6° / f_static > cos φn tan λ | worm `eff` / `mu` after + assumption |
| 2014 MC4 | Worm bearing force direction: worm acts as a screw (RH worm CW pushes along +z) | worm `fall` text |
| 2016 MC2, 2022 MC2, 2024 MC2 | Involute generated from the base circle; φ fixes the base circle | spur geometry (unchanged) |
| 2016 MC5, 2022 MC4 | Radial force exists because of φ; increasing φ (e.g. 24°) increases Wr = Wt tan φ | spur assumption linked to the force step |
| 2016 SA15a, 2021/2024 SA16 | Interference: 17–18 teeth minimum at 20° FD with a rack (2k/sin²φ) | rack `intf` step, spur interference check |
| 2014 MC1, 2021 MC3, 2024 MC4 | Herringbone = two opposite-hand helicals, thrust cancels | helical intro/assumptions (unchanged) |
| 2016 MC3, 2023 MC4 | Hypoid = offset bevel axes | bevel figures (unchanged) |
| 2022 MC10, RAP | Planetary trains have more than one DOF; an idler (planet) changes direction only, not \|e\| | spur assumption linked to the train step + idler note |
| RAP | FALSE: "pinion with an internal gear rotates opposite" — internal meshes do not reverse | train section (mesh = internal) |
| RAP | Module ≈ reciprocal of Pd (m = 25.4/Pd); mating gears share Pd | standard-pitch table note |
| 2022 SA16 | Helical advantages: smoother, quieter, higher load; cost = thrust | helical intro (unchanged) |
| 2023 SA4 | Through vs case hardening | spur steel assumption (HB > 400 → flame/induction or carburizing) and `hb` text |

Final-review gear content (spur gear Wt 391, Wr 142 on a shaft) is a shaft problem (shafts_keys pages).
