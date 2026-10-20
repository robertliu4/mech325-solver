# Flat belts: question inventory (MECH 325)

Course method: **Shigley Ch 17-2 only** (Mott has no flat-belt design; Mech p.13/p.15 "This guide follows Shigley").
Procedure order = Flat&V slide 17 "Ref: Flat Belt Analysis Procedure": 1 e^{fφ} → 2 Fc → 3 T = 63 025 Hnom Ks nd/n →
4 (F1)a − F2 = 2T/d (assume F1 = (F1)a) → 5 (F1)a = b Fa Cp Cv → 6 F2 → 7 Fi = (F1 + F2)/2 − Fc → 8 check f > f′ →
9 nfs = Ha/(Hnom Ks) (confirm nd). Then L (17-2) and dip (17-13). Catalogue alternative for (F1)a: Habasit table (slide 21).

Calculator: `v2/topics/flat_belts_common.js` (modes = the `mode` choice in step 1). Step ids in brackets.

## Question types found in the course files

| # | Question type (mode) | Source | Given | Asked | Steps that answer it |
|---|---|---|---|---|---|
| 1 | Analyse a given drive at the tension limit (`analyse`) | Tutorial 1 Q1 (S 17-2) with worked solution (Module 1 Sel. Sol. p1–4) | 6-in F-1, d = 2 in, VR 0.5, C = 9 ft, 1750 rpm, 2 hp, Ks 1.25 | Fc, Fi, (F1)a, F2, Ha, nfs, L, dip | in → pw → spec → prop → wid → geo → spd → fc → trq → f1a → tens → chk → res |
| 1 | same | HW1 P1 (S 17-3 mod.) | 12-in A-3, d = 5 in, VR 0.5, C = 20 ft, 1750 rpm, 3 hp, Ks 1.25, nd 1 | Fc, Fi, (F1)a, F2; Ha, nfs, L; dip | same |
| 1 | same | Shigley Ex 17-1 (reproduced Module 1 p5) | 6-in A-3, d = 6, D = 18, C = 8 ft, 1750 rpm, 15 hp, Ks 1.25, nd 1.1 | Fc, T; (F1)a, F2, Fi, Ha; nfs; dip 0.14 in | same |
| 1 | same | Tutorial 3 Q2 (S 17-4) a–d | 6-in A-3, two 48-in CI pulleys, C = 16 ft, 60 hp @ 380 rpm, Ks 1.10, nd 1.0 | Fc, Fi, (F1)a, F2; Ha; f′ (slip?); L | same |
| 2 | Size the belt: minimum width for a power (`width`) | Shigley Ex 17-2; S 17-5 (derive b formula); Tutorial 2 Q3 c–d (S 17-6 b–c) | power, speeds, d, D, C, belt material, Ks, nd | b_min for full friction (f′ = f) at Hd, next available width, then (F1)a, Fc, Fi, F2, power, nfs, f′, dip | … → spd → bmin → fc → trq → f1a → tens → chk → res |
| 3 | Power (torque) capacity of a given belt (`capacity`) | Tutorial 2 Q3 a ("torque capacity that would put the drive as built at the point of slip") | drive + belt (b), Ks, nd | max torque / power with F1 = (F1)a **and** f′ = f; Fi needed; largest Hnom = Ha/(Ks nd); nfs for a stated Hnom | … → spd → fc → f1a → cap → res |
| 4 | Initial tension & dip (`tension`) | S 17-6 a (min Fi at the point of slip); Tutorial 3 Q2 e ("reduce the pre-tension to improve belt life → new tensions"); Ex 17-1 dip; S 17-1 (F1 restoring f) | drive + belt + power | Fi,min = (T/d)(e^{fφ}+1)/(e^{fφ}−1) (Eq 17-9); F1 = Fi + Fc + T/d, F2 = Fi + Fc − T/d; f′ at the set Fi; dip = C²w/(96 Fi); or Fi from a measured dip | … → spd → fc → trq → f1a → ten → res |
| 5 | Catalogue check (`catalogue`) | Flat&V slide 21 (Habasit: S-250H 29 N/mm, A-3 36 N/mm, TF-22 22 N/mm) | drive + catalogue belt code + width | (F1)a = (N/mm)·b, then the same 9 steps; minimum catalogue width | … → hab → prop → wid → … → f1a → tens → chk → res |
| 6 | Geometry only, open or crossed (`geometry`) | Flat&V s5 (Eq 17-1/17-2), s6 (twisted / reversing drives), Mech p.16 fn 12–13 (crossed), S 17-3 (double the dimensions) | d, D (or VR), C, open/crossed; or a stocked belt length | wrap angles φd, φD, belt length L; centre distance C for a given L | in → geoL → geo → res |

## Variants an exam could ask (covered by re-running a mode)

| Variant | How to answer with the calculator |
|---|---|
| Double the width / all dimensions (S 17-7, S 17-3) | `analyse` with the new b (or d, D, C) and compare |
| Effect of speed on capacity | `capacity`: raise n → V ↑ → Fc ∝ V² ↑ → (F1)a − Fc ↓; Ha first rises then falls |
| Effect of centre distance | `geometry`/`analyse`: larger C → larger φd → larger e^{fφ} → less Fi needed, f′ ↓ |
| Speed ratio / output speed | step `pw` shows n₂ = n·d/D |
| Belt load on the shaft (S 17-8, slide 7 Rx = (F1+F2)cos θ, Ry = (F1−F2)sin θ) | step `tens` → `Rsh` |
| Leather belt | Table 17-2 leather spec; Cv from Fig 17-9 (auto fit) |
| Efficiency (S 17-11: ≈ 98 %) | text only (Flat&V s22 lists flat 98 %) |

## Conceptual (multiple-choice) items seen in the course

- Midterm 2025 MC 9: the tension component present in V-belts but ignored for flat belts that governs belt life → **bending tension F_b**.
- Midterm 2025 MC 10: power capacity for similar size, lowest → highest: **flat belt < V-belt < roller chain**.
- Midterm 2025 MC 13: hp → ft·lbf/s **multiply by 550**.
- Slides 18–19: flat belts need crowned pulleys; trapezoidal crowning for conveyors (self-tracking).

## Sizing tables
- **Belt** (step "Belt material"): every Table 17-2 row — d_min (Table 17-2; urethane Table 17-3 by rpm per foot of belt; leather 2-ply footnote +2 in for b ≥ 8 in) vs the small pulley, C_p (Table 17-4, "—" = does not fit), F_a, γ, f, a_0 = F_aC_pC_v and b_min at H_d (Ex 17-2 formula). ★ = the fitting belt that needs the narrowest width (calculator choice; the guides give no rule) → Tutorial 1 F-1, Ex 17-1 / HW1 P1 A-3; Ex 17-2 stars A-5 (problem names A-3).
- **Width** (`width` mode, and `catalogue` mode): whole inches around b_min with (F_1)_a, F_c, F_2, F_i, f′, dip → ★ next whole inch ≥ b_min (Ex 17-2: 9 in; Shigley took the catalogue's 10 in, both shown).
- **Habasit type** (`catalogue` mode): all catalogue codes with min pulley (mm) vs d, F_a′ (N/mm) → lbf/in and b_min → ★ narrowest fitting type.
