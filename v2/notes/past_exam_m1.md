# Module 1 (belts, chains, wire rope) — past-exam inventory and calculator check

Sources: `v2/course/past/` — midterms 2014 (answers), 2016, 2021, 2022, 2023 (questions + solutions), 2024 (solutions);
HW1 2024 solutions (same problems as the HW1 already in COURSE_CONVENTIONS §1–5); HW2 2024 (gears only); final-exam review and
"Selected Tutorial Questions 2022" (no Module 1 problems — shafts/bearings/fluids/fasteners); "All RAP.pdf" (Module 1 quiz, 12 MC).
Scanned files were rasterised at 110 dpi and read by eye. Probes: `localStorage m325v2:<id>:<book>` with the raw inputs below.
✔ = reproduced by the calculator; values in brackets are the calculator's.

## Long-answer problems

| Source | Topic / page (mode) | Given | Asked | Course answer | Calculator |
|---|---|---|---|---|---|
| Midterm 2014 Q22 | V-belts, Shigley (`shig`) | T 4.87 N·m at 157 rad/s (1.024 hp), 1500 rpm, Ks 1.3, nd 1.5, 5-in sheave | section | Hd 1.997 hp, V 1963 ft/min → A is sufficient at 5 in | ✔ Hd 1.997, V 1963, Htab(A, 5 in) 1.999 |
| Midterm 2014 Q26 | V-belts, Shigley (`shig`, f = 0.5, ΔF on Hd/Nb) | B belt (Kb 576, Kc 0.965), Hd 2 hp, Nb 1, 2000 rpm, d 5 in, f 0.5, φ = π | Fc, ΔF, F1, F2, Fi | 6.609, 25.2, 38.4, 13.22, 19.20 lbf | ✔ 6.614, 25.21, 38.44, 13.23, 19.22 (new `fV` field) |
| Midterm 2021 P1 | Chains, Mott + Shigley | AC motor HT → reciprocating pump, 6 h/day, 700 → 300 rpm, 5 hp, CD 30 in, nd 1 | SF; chain and teeth (N1 < 20); links; lube; SF | SF 1.3 → 6.5 hp; 17/40 T, VR 2.353, 297.5 rpm; Mott 1 × No. 60 (17.25 hp), FS 2.65; Shigley No. 50, Htab "7.33" → 1.19; #50 at 30 in: 124.8 → 124 links; Type B | ✔ Mott 17.25 hp, FS 2.65, Type B; Shigley Htab 7.73, nfs 1.19 (the 7.33 is a copy slip — 7.73/6.5 = 1.19); Cp 48 → 124.8 → 124 (new "CD in inches" field) |
| Midterm 2022 P1 | Timing belts (`design`) | AC normal → centrifugal pump, 18 h/day, 1160 → 600 rpm, 6 hp, minimum CD 18 in | belt, sprockets, speed, SF | SF 1.7 → 10.2 hp; 8 mm; 28/56 T (22 T 8.86, 24 T 9.37, 28 T 12.0 hp); 1280-8MGT (160 T), CD 18.53; CL 1.10 → 13.2 hp; SF 1.3; PD 2.807/5.614; V 852.4 ft/min | ✔ with N1 28 and PDmin 0: 1280 belt (new `CDmin` field), CD 18.53, 12.0 × 1.1 = 13.2, SF 1.29, V 852.5. Auto (Gates Table 4 minimum 3.4 in for 6 hp @ 1160) picks 36:72 / 1440 instead |
| Midterm 2023 P1 | V-belts, Mott (`mott`) | AC motor HT → heavy conveyor, 8 h/day, 1160 → 600 rpm, 50 hp, minimum CD 30 in | belt, sheaves, belts, speed, CD, SF | Ks 1.5 → 75 hp; 5V; 13.9/27.7 (VR 1.99); CD 32 → Lp 134.5 → 132; B 266.75; CD 32.61; θ1 155.6°; ΔP 1.26, Cθ 0.94, CL 1.02, Htab 30 → 29.97 hp; 3 belts; nfs 1.20; 583 rpm | ✔ CD 32 (auto, new default), L 130.8 → 132 (auto), CD 32.61, θ1 155.6°, ΔP 1.26 (auto), PA 29.97, 3 belts, nfs 1.20, 582.1 rpm |
| Midterm 2024 P1 | Chains, Mott + Shigley | AC motor HT → hammer mill, 8 h/day, 1150 → 450 rpm, 10 hp, CD 36 in | SF; chain and teeth; links; lube; SF | Ks 1.5 → 15 hp; 18/46 T; Mott 1 × No. 60 25.04 hp, FS 1.67, 128.4 → "129"; Shigley No. 50 × 2: 12.1 × 1.06 × 1.7 = 21.8, nfs 1.45, 147.5 → "147"; No. 60 × 1: 22.0, 1.47; Type B | ✔ Mott 25.04, FS 1.67, Type B, L 128.4 → 128; Shigley 12.13 × 1.064 × 1.7 = 21.93, 1.46; No. 60 22.1, 1.47; L 147.5 → 148 |
| HW1 2024 P1–P8 | flat, V, timing, chains, rope | identical to the HW1 cases in COURSE_CONVENTIONS §1–5 | — | (as listed there) | ✔ re-run: P1 flat (V 2291, (F1)a 840, F2 786), P2/P3a V-belt (CD 35.16 / 23.23, 3 / 1 belts), P3b Gates (Tst 28.12, 2.71–2.89 lbf), P4 timing (32/80, 920, SF 2.36), P5 chain No. 120 SF 13.6, P7 2 × No. 80, P8 rope nf 1.125 / 1.04 |

## Multiple choice / short answer (concept checks — the page states the rule)

| Source | Question | Answer | Where the page says it |
|---|---|---|---|
| 2014 MC8, 2021 MC8, 2024 MC9 | Tension present in V-belts, ignored for flat belts, governs life | bending tension F_b | V-belt Fig 17-14 note |
| 2014 MC9 / 2016 MC10 / 2022 MC9 / 2023 MC9 | Smallest catalogue belt for 2 belts: H_nom, Ks, nd given | P_des/N_b = 1.41 → 1.5 hp; 1.24 → 1.4 hp; 1.41 → 1.5 hp; 0.94 → 1.1 hp | V-belt `rate` mode, new field "Power each belt must carry" ✔ |
| 2014 MC10 | Timing belt torque, F1 130 N, F2 40 N, PD 20 cm | (130 − 40)(0.1) = 9 N·m | (hand calc; T = ΔF·d/2) |
| 2014 Q19, 2016 Q16 | Sketch V-belt tension profile vs flat belt | add F_b peaks at each pulley (F_b1 > F_b2) | Fig 17-14 |
| 2014 Q20 | Chain vs timing belt difference; how to reduce it | chordal speed variation; more sprocket teeth | chain teeth-step text, Shigley ΔV/V field |
| 2016 Q17, 2022 SA1 | Label the F1/F2 vs F_i diagram | F_1, F_2, (F_1)_a, F_c, F_1 − F_2 = 2T/d | flat-belt Fig 17-8 note |
| 2022 SA2 | Power from tensions; "effective friction" | H = (F1 − F2)V/33 000; f′ from tension ratio and wrap, no slip if f′ < f | flat-belt step 8–9 text |
| 2016 MC9, 2022 MC11, 2023 MC11 | Rank drives by capacity | flat < V < chain | (concept) |
| 2016 MC13 | Not a way to raise chain power | upgrading lubrication (key) | (concept) |
| 2021 MC7, 2023 MC8, 2024 MC8 / 2022 MC8, RAP Q9 | Post-/pre-extreme horsepower | post = roller/bushing fatigue; pre = link-plate fatigue | Shigley chain assumption + rating note |
| 2021 MC11, 2024 MC11 | Chordal speed variation | rise and fall of the chain on the sprocket | chain teeth texts |
| 2021/2023/2024 MC12, RAP Q11 | Working load of wire rope: FALSE statement | "must determine the maximum sheave diameter" | wire-rope assumption (both pages) |
| 2022 MC12 | SF for a high-speed passenger elevator | 9–11 (Table 17-25) | wire-rope assumption / FoS step |
| 2021/2024 MC13, 2022 MC13, 2023 MC13, RAP Q7 | hp ↔ ft·lbf/s, ft·lbf/min | × 550; ÷ 550; ÷ 33 000 | V-belt general assumption |
| 2023 SA3 | V-belts vs chains | quiet, no lube, absorb shock; need pre-tension, slip, lower power | (concept) |
| RAP Q1 | Pitch diameter statement | timing-belt PD is larger than the pulley OD | timing sprocket-step text |
| RAP Q2–Q3 | Timing belts | like a roller chain; no lube, low pre-tension, no chordal variation, ≥ 6 teeth in mesh | timing general assumption |
| RAP Q4–Q5 | Chains fail by wear; minimum sprocket teeth 17 | | chain assumptions |
| RAP Q6 | Minimum SF for crane/winch hoisting | 5 | wire-rope nreq default |
| RAP Q10 | Wire rope FALSE | "lubrication should never be used" | (concept) |
| RAP Q8, Q12 | Flat-belt sensitivity; variable-speed drive (conical pulleys) | | (concept) |

## Course-solution slips found (calculators follow the correct value)
- Midterm 2023 P1: L = 134.5 in for CD 32 in — the (D2 − D1)²/4CD term is 1.49, not 5.20 (L = 130.8 in); the 132-in belt is unchanged. Boxed output "593 rpm" is 582 rpm.
- Midterm 2021 P1 (Shigley): Htab written 7.33 hp after reading 7.73; nfs 1.19 uses 7.73.
- Midterm 2024 P1: chain lengths rounded to odd counts (129, 147) "so odd links mesh with even teeth" — the course rule (Chains s24, Mott) is an even number of pitches with odd sprocket teeth; the calculator gives 128 and 148.
- Midterm 2022 P1: 22 T @ 1160 rpm listed as 8.86 hp (Table 7-9: 8.06); the solution does not apply Gates Table No. 4 (6 hp @ 1160 rpm → 3.4 in minimum; the chosen 28 T sprocket is 2.807 in).

## Trial centre distance practice (belts)
2023 midterm: "minimum 30 in" → chose 32; 2025 midterm: CD 32 given; HW1 P2: 36 (note "30, 40, 48 also OK"); HW1 P3a: 24 (note "20, 24, 36, 48 OK"); chains: CD in inches given (30, 36 in) → ÷ p. V-belt trial CD now defaults to 32 in (or the given minimum) inside D2 < CD < 3(D1 + D2); chains keep 40 pitches unless a CD in inches is given.
