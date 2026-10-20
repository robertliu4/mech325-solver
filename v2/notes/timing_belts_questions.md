# Timing (synchronous) belts: question inventory (MECH 325)

Course method: **Mott 7-8** (Table 7-8 service factor, Fig 7-27 pitch, Table 7-7 sprocket/belt combinations, Table 7-4 sprockets,
Table 7-5 bushings, Tables 7-9/7-10 ratings, Table 7-11 length factor) + **Gates Table No. 4** minimum motor sprocket (course
slide 7, "not in Mott"). Shigley §17-4 has only nomenclature (Fig 17-15, Table 17-18) and says the process is "so similar to V belts
that it will not be presented".

Course 7-step procedure ("Timing Belts 2023" s5–s11): 1 Pdes = Prated × SF (Table 7-8) → 2 pitch (Fig 7-27) → 3 small sprocket ≥
Gates Table 4 minimum → 4 sprockets & belt length from Table 7-7 for the VR, choose CD → 5 width so that the rating exceeds Pdes
(Table 7-9/7-10) → 6 check V < 6500 ft/min and Rated_adj = Rated × CL (Table 7-11), return to 3–4 if needed → 7 fittings (Table 7-4/7-5).
Rules (s4): ≥ 6 teeth in mesh, ratios mostly < 6:1, V about 3500–4000 ft/min, avoid > 6500. Life 3–5 years, critical drives annually (s12).

Calculator: `v2/topics/timing_belts_common.js` (modes = the `mode` choice in step 1). Step ids in brackets.

## Question types found in the course files

| # | Question type (mode) | Source | Given | Asked | Steps that answer it |
|---|---|---|---|---|---|
| 1 | Design a drive (`design`) | HW1 P4 (Mott 7-43), solution HW1 p10–12 | 5 hp AC normal-torque motor @ 1750 rpm → fan @ 700 rpm, 22 h/day | SF, Pdes, pitch, sprockets, PDs, belt, CD, width, CL, SF = Pallow/Pdes, belt speed, specification | in → sf → lim → pitch → spk → blt → pow → spd → bush → res |
| 1 | same, with space/shaft/CD limits | Mott Ex 7-4 | 20 hp motor 1750 → gear pump 875 rpm, 16–24 h/day, CD 22 ± 0.375 in, shafts 1.625/1.375 in, driven OD ≤ 14 in | complete drive incl. bushings | same (limits entered in `lim`) |
| 2 | Check an existing drive (`check`) | variant of HW1 P4 / s9–s10 ("select the width to exceed the design hp", "apply belt length correction") | power, speeds, service, sprockets, belt, width | rated vs design power, SF, max power the drive can carry, belt speed, length correction, teeth in mesh, Gates minimum | in → sf → pitch → spk → blt → pow → spd → res |
| 3 | Kinematics only (`kin`) | Mott Ex 7-3 | sprockets 32/80, 1200-8MGT belt, 1400 rpm | PDs, VR, driven speed, belt speed, CD from Table 7-7 | in → spk → blt → spd → res |

## Variants an exam could ask (covered by a mode)

| Variant | How to answer |
|---|---|
| Belt for a given CD ± slot adjustment (Mott Ex 7-4 step 9) | `design`: enter CDnom and ± in `lim` — the belt auto-pick keeps CD in range |
| Eliminate sprocket pairs by shaft bore / max OD (Mott Ex 7-4 step 8; Fizz p.21–23) | `design`: shaft diameters and D_max in `lim`; bushings and bores shown in `bush` |
| Maximum nominal power a given drive can carry | `check`: P_max = P_adj / SF |
| Wider belt needed? | `pow`: width "auto" goes 30 mm → 50 mm when 30 mm is short |
| Output speed / belt speed / CD for a stocked belt | `kin` |
| Teeth in mesh ≥ 6, ratio < 6:1, V < 6500 ft/min | checks on `blt`, `spk`, `spd` |
| Life / replacement interval | s12: 3–5 years typical, annually for critical drives (stated in the result) |

## Conceptual items (slides 13–15 "Scenario" questions)

Choose flat / V / timing / chain: precision machine, bidirectional, low power, small radial load → **timing belt**;
continuous low-speed gas-tank crusher → **roller chain**; quiet, smooth, low-cost scooter → **timing belt** (quiet, no lubrication).

## Sizing tables
- **Pitch** (step "belt pitch"): Mott Fig 7-27 regions digitised (5/8/14/20 mm) at the faster-shaft rpm → ★ region containing P_des (HW1 P4 and Ex 7-4: 8 mm). Only 8 mm has Mott tables.
- **Sprockets** (step 4): every Table 7-7 pair at the ratio with the elimination checks (Gates Table 4 minimum PD, Table 7-4/7-5 bores, D_max, a belt giving the CD, P_rated·C_L at 30 and 50 mm) → ★ = `pick()` (smallest driver, narrowest width). HW1 P4 32:80 (36:90 also passes); Ex 7-4 56:112.
- **Belt**: Table 7-7 belts for the pair with CD, course range, CD ± slot, C_L, teeth in mesh → ★ shortest in range (HW1 P4 920) or closest to the given CD (Ex 7-4 1800).
- **Width**: 20/30/50/85 mm — 30/50 from Tables 7-9/7-10 × C_L vs P_des; 20/85 mm not in Mott → ★ narrowest that passes (30 mm in both cases).
