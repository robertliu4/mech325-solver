# MECH 325 (UBC, 2026W) — course conventions, standard values and test cases

Source of truth for calculator authors. Everything below was read from the files in `v2/course/`; each item
cites the file and slide/page (1-based PDF page). Where the course and the textbook differ, the course value is
listed and the difference is flagged with **COURSE**. Abbreviations: S = Shigley 11e (course also quotes 2024
release page numbers), M = Mott 6e. "s12" = slide/PDF page 12 of the named deck.

Course-only tables/charts (not in either textbook) are cropped into `v2/figures/course/` — see §16.

Files with NO text layer (scanned): `325-Midterm-2025*.pdf`, `Fluid Power *.pdf`, `Actuator Selection
Handouts.pdf`, `mechanical motions hand out.pdf`, `motor and pump hand outs.pdf`. Facts from those were read from
rasterised pages (handwritten solutions read by eye; OCR used for the Parker handbook text).

---------------------------------------------------------------------------------------------------------------

## 0. Course-wide conventions (apply to every topic)

| Convention | Value | Source |
|---|---|---|
| Units | US customary throughout: hp, lbf, in, ft/min, rpm, psi. Metric given only as an aside ("10 teeth/in (module = 2.5 mm)", "10 HP (7.5 kW)"). Midterm says "you can choose imperial or metric". | Midterm 2025 P2 (Solutions p13) |
| Torque | `T [lbf·in] = 63 025 H[hp] / n[rpm]`; `Ft = 60 000 H[W]/(π d[mm] n)` for SI | Gear Kinematics s17; Flat&V s12 |
| Power | `H [hp] = (F1−F2) V / 33 000` with V in ft/min; `H = T ω`; hp→ft·lbf/s **multiply by 550** (midterm MC 13) | Flat&V s12; Midterm MC13 |
| Pitch-line / belt speed | `V = π d n / 12` ft/min (d in inches) | everywhere |
| Design (service) factor | **Always multiply nominal power by a service/overload factor first**: belts `Hd = Hnom·Ks·nd`, chains `Hd = Hnom·Ks·nd`, gears `Wt·Ko`. `nd = 1.0` unless stated ("nd design factor (normally = 1.0)"). | Chains s26; Flat&V s41; HW1 P1 |
| Factor of safety definition | `nfs = (allowable power) / (design power)` = `N_b·Ha / Hd` (belts/chains), `SF = σ_all/σ` (gears). Midterm: `nfs = Hall/Hd = 3×23.29/52 = 1.34`. | Flat&V s41; Chains s26; Midterm P1 |
| Gear SF target | "AGMA suggests SF of 1 to 1.5"; tutorial solves for the *minimum strength number* with SF = 1.0 and then picks a material so that 1.0 ≤ SF ≤ 1.5 | Gear Stress s41, s46; Module 2 p22–27; Midterm P2 part 3 |
| Reliability | 99 % → `KR = 1.00` "normally"; tutorial problems use 0.90 → 0.85. Midterm assumed "KR = 1.0 for Reliability = 0.99 assumed". | Gear Stress s38; Midterm Sol p17 |
| Temperature | `KT = 1.0` for T < 250 °F (120 °C) — always assumed | Gear Stress s39; Helical/Bevel s23, s29 |
| Life | AGMA strengths are at 10^7 cycles; stress-cycle factors from the **upper** ("normal commercial gears") line of Fig 14-14/14-15. Cycles = rpm × 60 × h/day × days/yr × years (midterm: 1750×60×6×200×1 = 1.26×10^8). | Gear Stress s37, s44; Midterm Sol p17 |
| Steel on steel | `Cp = 2300 √psi (191 √MPa)` — stated as the normal case | Gear Stress s30; Midterm Sol p15 |
| Rounding/selection | Round number of belts/strands **up** to integer; chain length to an **even** integer number of pitches (and odd sprocket teeth); belt length to next standard catalogue length (either neighbour accepted, midterm chose the larger); gear teeth to integer; sheave sizes to catalogue sizes. | Chains s24/s28; Midterm P1; HW1 |
| Interference | min pinion teeth 17 for φ = 20° full depth | Gear Kinematics s26 |
| Which text | Course teaches both and marks both: V-belts/chains/timing belts/wire-rope *design* follow **Mott** (Table 7-1, Fig 7-13…7-19, Table 7-2, Eq 7-12/7-13/7-14), flat belts and belt/chain/rope *analysis* follow **Shigley** (Ch 17). Gears: equations from Shigley Ch 14/15 with Mott's factor charts/tables accepted as alternatives (Fig 9-16, 9-17, Table 9-1, 9-2, 9-6). Midterm solutions give **both** Mott and Shigley answers where they differ (I = 0.096 Mott vs 0.117 Shigley). | Midterm Sol p10, p15–16 |

---------------------------------------------------------------------------------------------------------------

## 1. Flat belts  (Flexible belts Flat and Vbelts-2024.pdf s3–s21; Tutorials; HW1 P1)

Textbook: **Shigley Ch 17** only (Mott not used for flat belts).

### Equations (Flat&V s5, s11, s12, s13, s16)
- Geometry: `θd = π − 2 sin⁻¹((D−d)/2C)`, `θD = π + 2 sin⁻¹((D−d)/2C)` (17-1); `L = √(4C² − (D−d)²) + ½(DθD + dθd)` (17-2). Angles in radians.
- `(F1−Fc)/(F2−Fc) = e^{fφ}`;  `Fc = (w/32.17)(V/60)²` with `w = 12 γ b t` lbf/ft (γ lbf/in³) — course and HW use **32.17**;
  `T = (d/2)(F1−F2)`;  `T = Fi d (e^{fφ}+1)/(e^{fφ}−1)`;  `H = (F1−F2)V/33 000`.
- `(F1)a = b·Fa·Cp·Cv` (17-12): Fa from Table 17-2, Cp from Table 17-4, **Cv = 1 except leather belts** (Fig 17-9).
- `Ha = Hnom·Ks·nd`, Ks from **Shigley Table 17-15** ("Use this Table for Flat Belts" — s14). Table reproduced on s14: Uniform 1.0–1.2 / 1.1–1.3; Light shock 1.1–1.3 / 1.2–1.4; Medium 1.2–1.4 / 1.4–1.6; Heavy 1.3–1.5 / 1.5–1.8 (normal / high-torque driver).
- Friction development `f' = (1/φ) ln[(F1a−Fc)/(F2−Fc)]`; no slip if `f > f'`; f range 0.4–0.8 (s16).
- `Fi = (F1+F2)/2 − Fc`; dip `= C² w / (96 Fi)` (17-13, C in ft, w lbf/ft, dip in inches).

### Standard procedure (Flat&V s17 "Ref: Flat Belt Analysis Procedure") — this order is what the solutions follow
1. `e^{fφ}` from geometry and f (Table 17-2)
2. `Fc` from w and V
3. `T = 63 025 Hnom Ks nd / n`
4. `F1a − F2 = 2T/d`, assume F1 = (F1)a
5. `(F1)a = Fa b Cp Cv`
6. `F2`
7. `Fi = (F1+F2)/2 − Fc`
8. check `f > f'`
9. `nfs = Ha/(Hnom Ks)` where `Ha = (F1a − F2)V/33 000` (confirm nd)

### Test cases
| Case | Inputs | Answers | Source |
|---|---|---|---|
| HW1 P1 (S 17-3 mod.) | 12-in polyamide A-3 (t=0.13, Fa=100, γ=0.042, f=0.8), d=5, VR=0.5 (D=10), C=20 ft, 1750 rpm, 3 hp, Ks=1.25, nd=1 | V=2290 ft/min; w=0.786 lbf/ft; θd=3.123 rad; Fc=17.0 lbf (text uses V=1833?—see note); T=90.0 lbf·in... ; Cp=0.70; (F1)a=840 lbf; F2=786 lbf; Fi=486.1; f'=0.0297<0.8 OK; Ha=2.5 hp; nfs=1; L=450.9 in; dip=0.586 in. **Note:** the typed solution mixes numbers from the 4-in/2-hp version (V=1833, ΔF=45) — treat only the boxed values as authoritative. | HW1 Solutions p1–3 |
| Tutorial 1 Q (S 17-2) | 6-in polyamide F-1 (t=0.05, Fa=35, γ=0.035, f=0.5), d=2, VR 0.5 (D=4), C=9 ft, 1750 rpm, 2 hp, Ks=1.25, nd=1 | V=916.3 ft/min; w=0.126 lbf/ft; Fc=0.913 lbf; Cp=0.70; (F1)a=147 lbf; T=90.0 lbf·in; F2=57 lbf; Fi=101.1 lbf; Ha=2.5 hp; nfs=1.0; θd=3.132 rad, L=225.4 in; dip=0.151 in | Module 1 Sel. Solutions p2–4 |
| S Example 17-1 (reproduced) | 6-in polyamide A-3, 15 hp, Ks=1.25, nd=1.1, d=6, D=18, C=8 ft, 1750 rpm | θ=3.0165 rad, e^{fφ}=11.17, V=2749, w=0.393, Fc=25.6, T=742.8 lbf·in … (Shigley answers) | Module 1 p5 |
| Tutorial 3 Q2 (S 17-4) | 6-in polyamide A-3, two 48-in CI pulleys, 16 ft, 60 hp @ 380 rpm, Ks=1.10, nd=1.0 | find Fc, Fi, F1a, F2, Ha, f', L | Flex Tutorial 3 (no solution in files) |

Habasit catalogue page (s21) gives (F1)a as "nominal peripheral force per unit width": S-250H 29 N/mm, A-3 36 N/mm, TF-22 22 N/mm — **COURSE** figure `flat_belt_habasit_table.png`.

---------------------------------------------------------------------------------------------------------------

## 2. V-belts  (Flat&V s22–s42; Tutorial 2; HW1 P2/P3; Midterm 2025 P1)

Textbooks: **Mott Ch 7 for design/selection** (the midterm uses Mott exclusively), **Shigley 17-3 for tensions,
friction and life**.

### Design rules (Flat&V s25, s28, s29)
- V-belt η ≈ 70–94 % (flat 98 %); effective friction `f' = f / sin(β/2)` with 2β ≈ 36° groove (s22).
- Max ratio 6:1 plain, 7:1 cogged. `F1/F2 ≈ 5` (Shigley uses `e^{fφ}=5` for V-belts). Wrap on small sheave > 120°. Idler on slack side.
- Belt speed 1000–5000 ft/min, **4000 ft/min target** (HW1: `D1 ≈ 12·4000/(π n1)`; midterm: limit V < 5000 → `D ≤ 16.6"` at 1150 rpm).
- Centre distance `D2 < CD < 3(D2 + D1)` (Mott Eq 7-17). Round driven sheave **up**.
- Belt pitch length `Lp = 2CD + 1.57(D2+D1) + (D2−D1)²/(4CD)` (Mott 7-12); select standard length from **Mott Table 7-2**; actual `CD = [B + √(B² − 32(D2−D1)²)]/16`, `B = 4Lp − 6.28(D2+D1)` (Mott 7-13).
- Wrap `θ1 = 180° − 2 sin⁻¹((D2−D1)/2CD)` (Mott 7-14).
- Allowable power per belt **PA = Cθ·CL·(PTab + ΔPR)** (s30) — Cθ Mott Fig 7-18, CL Fig 7-19, PTab Fig 7-14/7-15/7-16 (3V/5V/8V), ΔPR Fig 7-17. **"Shigley does not include speed-ratio power correction ΔPR"** (s31).
- Shigley form: `Ha = K1 K2 Htab` (K1 Table 17-13 wrap, K2 Table 17-14 length), `Hd = Hnom Ks nd`, `Nb ≥ Hd/Ha`, `nfs = Nb Ha/Hd` (s41).
- Service factor: **Mott Table 7-1** (`Pd = Pnom Ks`, s28) is the primary; Shigley Table 17-15 accepted as a range (midterm: "Mott Table 7-1 Ks = 1.3; Shigley Table 17-15 1.2 < Ks < 1.4"). Course also provides its own hours/driver table (s35, **COURSE** `belt_service_factor_hours.png`): rows by driven machine class × (<8 h, <16 h, >16 h) × (smooth driver 100–200 % starting torque / coarse driver 200–400 %): light 1.0 1.1 1.2 | 1.1 1.2 1.3; medium 1.1 1.2 1.3 | 1.2 1.3 1.4; heavy 1.2 1.3 1.4 | 1.3 1.4 1.6; very heavy 1.3 1.4 1.5 | 1.5 1.6 1.8.
- Belt section selection: Mott Fig 7-13 (3V/5V/8V) — s26; course also shows a classical A/B/C/D chart "Recommended Nominal V-Belt Selection" (s27, **COURSE** `vbelt_selection_chart_abcd.png`).

### Shigley analysis order (s42)
1 geometry (Lp, C, φ, V) → 2 Hd, Ha → 3 Nb → 4 tensions Fc, F1, F2, Fi (Table 17-16 Kc for Fc = Kc(V/1000)², Eq 17-21/17-22, `Fi = (T/d)(e^{fφ}+1)/(e^{fφ}−1)`, `F1 = Fc + Fi·2e^{fφ}/(e^{fφ}+1)`, `F2 = F1 − ΔF`) → 5 check `f/sin(β/2) > f'` → 6 nfs → 7 life (Ex 17-4: Table 17-16 Kb, Table 17-17 K, b; `Np = [(K/T1)^{-b} + (K/T2)^{-b}]^{-1}`, `t = Np Lp/(720 V)`).

### Gates catalogue method (s32–s40, Tutorial 2 Q2, HW1 P3b) — course add-on, not in either text
- Gates Table B1 service factor (brick machine, multi-cyl engine, >10 h/day → 1.5; AC motor/fan 22 h → 1.3), Fig B1/B2 section charts, Table B2/B3 min sheave diameter per NEMA motor hp/rpm, belt tables (B6…) that **include both wrap and length correction** ("HP correction value"), Table B10 etc. power ratings, ΔP additional hp.
- Tensioning (**Formula D19**): `Tst = 15 ((2.5 − Kφ)/Kφ) (Motor HP ×10³)/(N·V) + M V²/10⁶` lbf, Kφ from Table D26 (arc of contact vs (D−d)/C: 0→1.00, 0.1→0.99, 0.2→0.97, 0.3→0.96, 0.4→0.94, 0.5→0.93, 0.6→0.91, 0.7→0.89), M and Y from Table D27 (3VX M=0.29 Y=4; 5VX 0.78/13; 5V 1.0/11; 8V 2.6/22; AX 0.47/7; BX 0.76/8; CX 1.31/15; CP M=1.6 Y=87 per Module 1 p24). **Use motor (nominal) HP, not design HP** in D19 (Module 1 p24 explains).
- Span `t = C[1 − 0.125((D−d)/C)²]` (Formula D35; the sqrt form on the Gates page is marked "Formula incorrect"). Deflection = t/64 in.
- Deflection force, ≥2 belts: `min = (1.4 Tst + Y)/16`, `max = (1.5 Tst + Y)/16` (D20/D21); single belt: `(1.4 Tst + (t/L)Y)/16`, `(1.5 Tst + (t/L)Y)/16` (D22/D23).
- Figures: `gates_3vx_power_rating_table_b10.png` (s34), `gates_belt_sizes_table_b4.png` (s36), `gates_3v_centre_distance_table_b6.png` (s37), `gates_3vx_example_slide38.png` (s38), `gates_tension_formula_d19.png` (s39), `gates_deflection_formula_d20_d23.png` (s40).

### Test cases
| Case | Inputs | Answers | Source |
|---|---|---|---|
| **Midterm 2025 P1** (Mott method) | AC motor normal torque → textile machine, 10 h/day, 1150 rpm, 40 hp, 590 rpm nominal, CD 32 in | Ks=1.3 (Mott T7-1); Hd=52 hp; Fig 7-13 → 5V; VR=1.949; V<5000 → D≤16.6"; Fig 7-15 @1160 rpm, 10.8" sheave Htab≈23 hp; select D1=10.8, D2=21.1, VR=1.95, out 589 rpm; 21.1<CD<95.7, CD=32; Lp=122.9 → Table 7-2 118 or 125, pick 125; B=299.67, CD=37.10 in; θ1=164.0°, θ2=196.0°; ΔP=1.26 (Fig 7-17), Cθ=0.96 (Fig 7-18), CL=1.0 (Fig 7-19); Ha=0.96(1.0)(23+1.26)=23.29 hp/belt; NB=3; nfs=3(23.29)/52=1.34 | Midterm Solutions p10–12 |
| HW1 P2 (Mott 7-20) | 6-cyl engine → heavy conveyor 16 h/day, 1500 rpm, 40 hp, 550 rpm | SF 1.4, Pd 56 hp, 5V; ratio 2.73; D1≈12·4000/(π1500)=10.2 → D2=27.7, n2=552; rated 25.7 hp (Fig 7-15); 27.7<CD<114, CD≈36 → Lp≈133.6 → 132 in; actual CD 35.16; θ1 151.2°, θ2 208.8°; Cθ 0.92, CL 1.01; 23.9 hp/belt; 56/23.9=2.35 → **3 belts** | HW1 p5 |
| HW1 P3a (Mott 7-19) | AC normal torque → fan 22 h/day, 1750 rpm, 5 hp, 725 rpm | Ks=1.2, Hd=6 hp, 3V; ratio 2.41; D1 7.95, D2 18.95, 734 rpm; V=3642 fpm; Htab 10 hp, ΔP 1.4 → 11.4; CD 24 → L 91.49 → 90 in; CD 23.23; θ1 152.6°; Cθ 0.93, CL 1.09; Ha 11.6 hp; **1 belt**. (Mott's own answer: CD≈30 → L 100, CD 28.35, Cθ 0.94, CL 1.09, 10.55 hp/belt, one belt.) | HW1 p6–8 |
| HW1 P3b (Gates) | same | Gates Table B1 Ks=1.3 → 6.5 hp; 3V; min sheave 3.0"; d1=3.35, D2=8.00, CD=10.8", belt 3V400; hp correction 0.9; Htab 2.8+0.16 … ≈2.66 hp/belt → 3 belts; Tst with Kφ=0.94 | HW1 p9 |
| Tutorial 2 Q1 (S 17-19, Shigley) | 60 hp 4-cyl IC engine → medium-shock brick machine, 2 shifts; two 26-in sheaves, 12 ft, 400 rpm, D360 belts | Ks=1.4 (Table 17-15); Lp=363.3; C=140.8 in; V=2722.7; e^{0.5123π}=5.0; K1=1 (180°), K2=1.10; Htab=16.94 (Table 17-12 interp.); Ha=18.63 hp/belt; Hd=84 hp; Nb=4.51 → **5 belts**; ΔF=225.8 lbf/belt, T=2935 lbf·in/belt; Fc=25.9 (Kc=3.498); Fi=169.3; F1=308.1; F2=82.3; nfs=1.109; life: T1=526.6 (Kb=5680 Table 17-16), K=4208 b=11.105 → Np>10⁹ passes, t>185 320 h, 31.7 yr | Module 1 p11–14 |
| Tutorial 2 Q2 (Gates) | same, equal sheaves | Table B1 Ks=1.5 → 90 hp; Hi-Power CP (C) belts; Table B3 min sheave 12" → choose 13"; CP330, CD=145"; V=1361 fpm; HP correction 1.2 (Table B23); Htab=23.3 (Table B33); Hall=1.2(23.3+0)=27.96; 90/27.96=3.22 → **4 belts**; nfs=1.24; Tst=251 lbf (M=1.6, Y=87, Kφ=1.0, nominal 60 hp) [375 lbf if design hp]; t=CD=145", deflection 2.25"; force 27.4–29.0 lbf | Module 1 p15–24 |
| Lecture example (s38–40) | 3VX800, d=6", D=19", 1750 rpm, 2 hp light shock 8 h/day | VR 3.17, 552 rpm, Ks 1.2 → Hd 2.2 (slide typo "1.1(2.0)"); Cθ·CL=0.9; PA=0.9(7.68+0.25)=7.14 hp; nfs 3.25; V=2750 fpm; C=19.3"; Kφ 0.90; M=0.29, Y=4; t=18.21"; Tst=21.58 lbf; deflection 0.28"; force 1.95–2.08 lbf | Flat&V s38–40 |

---------------------------------------------------------------------------------------------------------------

## 3. Timing (synchronous) belts  (Timing Belts 2023.pdf; HW1 P4)

Textbook: **Mott 7-8** (Table 7-8 service factor, Fig 7-27 pitch selection, Table 7-7 sprocket/belt combos,
Table 7-4 sprocket PDs, Table 7-9 width ratings, Table 7-11 length correction) + Gates catalogue Table 4.

- Design considerations (s4): curved tooth (GT) for speed/power, trapezoidal for indexing; ≥6 teeth in mesh; ratios mostly < 6:1; belt speed **3500–4000 ft/min, avoid > 6500** (s4, s10 "Vbelt < 6500 fpm"; HW1 compares against 3500).
- Procedure (s5–s11), 7 steps: 1 `Pdes = Prated × SF` (Table 7-8) → 2 belt pitch from Fig 7-27 (design power vs rpm of faster shaft) → 3 small sprocket ≥ NEMA minimum from **Gates Table No. 4** (not in Mott; **COURSE** `timing_gates_min_sprocket_dia_table4.png`; e.g. 5 hp @1750 → 2.7 in, 10 hp @1750 → 3.4, 20 hp @1750 → 4.0) → 4 sprockets & belt length from Table 7-7 for the ratio, choose CD (`D2 < CD < 3(D1+D2)` V-belt rule reused) → 5 belt width from Table 7-9 so rating > design power → 6 check V < 6500 and `Rated_adj = Rated × CL` (Table 7-11) → 7 fittings.
- SF = Pallowable/Pdesign.
- Life 3–5 years typical; critical applications replace annually (s12).

Test case HW1 P4 (Mott 7-43): 5 hp AC normal @1750, fan 700 rpm, 22 h/day → VR 2.5; Table 7-8 SF = 1.8 → 9.0 hp; Fig 7-27 → 8 mm pitch; Table 7-7 options 32/80 or 36/90; Table 7-9 30 mm width: 32T@1750 = 21.2 hp, 36T = 24.9 hp → pick 32/80; Table 7-4 PD1 = 3.208", PD2 = 8.020"; 8" < CD < 33"; Table 7-7 115-tooth belt, CL = 8.97 in (student solution: 130-tooth 1040-8MGT, CD 11.40"); Table 7-11 CL = 1.0; SF = 21.2/9.0 = 2.36; V = 1470 ft/min < 3500 OK. Spec: P32-8MGT-30 / P80-8MGT-30 / 920-8MGT belt. (HW1 p10–12)

---------------------------------------------------------------------------------------------------------------

## 4. Roller chains  (Flexible belts Intro and Chains-2023.pdf s12–s34; Tutorial 1; HW1 P5–P7)

Textbooks: **Shigley 17-5** (Table 17-19/20/21/22/23, Eq 17-29…17-39) and **Mott 7-10/7-11** (Table 7-5…7-9,
7-17, 7-18, Fig 7-xx) — both taught; Martin/Renold catalogue pages used too.

- Chain number: first digit(s) × 1/8 in = pitch (#40 = ½", #100 = 1¼") (s14).
- `D = p / sin(180°/N)`; `V = N p n /12` ft/min (s17).
- Power limits (s19, Shigley 17-32/33/35): link-plate `H1 = 0.004 N1^{1.08} n1^{0.9} p^{(3−0.07p)}` (Klp 0.0022 for no. 41, 0.004 otherwise); roller/bushing `H2 = 1000 Kr N1^{1.5} p^{0.8}/n1^{1.5}` (Kr = 29 for no. 25/35, 3.4 for no. 41, **17 for no. 40–240**); wear H3 (17-35). "Pre-extreme horsepower" = link-plate fatigue region (midterm MC 8).
- Rating-table basis (s24): 15 000 h full load, 17-tooth sprocket, 1:1, single strand of 100 links, SF 1.0, recommended lubrication, minimum of pre- and post-extreme. Guidelines: `CD ≥ 150 % of larger sprocket dia`, CD 30–60 pitches (s24) / **30–50 pitches** (s28, HW1 P6 "30 to 50 pitches recommended"); adjust CD to actual chain length; **odd sprocket teeth + even number of links**.
- Shigley selection (s26): `Ha = K1 K2 Htab` (K1 Table 17-22 teeth correction — note K1 uses the *pre/post-extreme* exponent 1.5 vs 1.08; K2 Table 17-23 strands: 2→1.7, 3→2.5, 4→3.3, 5→3.9, 6→4.6), `Hd = Hnom Ks nd` (nd = 1.0 normally), `Nb ≥ Hd/Ha`, `nfs = Nb Ha/Hd`. Full-life correction Eq 17-39 uses **Kr = 17** ("not indicated in Shigley text", Module 1 p9).
- Procedure (s27): 1 design power (service factor) → 2 tentative pitch → 3 small sprocket teeth, **avoid < 17 (Martin: 17 min recommended, 15 common, as low as 7)** → 4 large sprocket, **7:1 ratio near maximum** → 5 check Hd below limiting power → 6 `V ≤ 9000 ft/min` → 7 chain length, integer pitches: `L/p = 2C/p + (N1+N2)/2 + (N2−N1)²/(4π² C/p)` (17-34), round, recompute C (17-36).
- Service factors: Shigley Table 17-15 (belt table reused); Mott Table 7-17; Martin Table II (**COURSE** `chain_martin_service_factors.png`, s29): Uniform 1.0/1.0/1.2, Moderate shock 1.2/1.3/1.4, Heavy shock 1.4/1.5/1.7 for (IC engine hydraulic drive / electric motor or turbine / IC engine mechanical drive); add 0.2 per unfavourable condition. HW1 P7 uses Ks = 1.5 ("moderate shock, 2-cyl engine… outdoors"); HW1 P6 uses Mott Table 7-17 SF = 1.4 (6-cyl engine, heavy conveyor).
- Lubrication: Type A manual/drip, B bath/disc, C oil stream (regions on the rating table); Mott Table 7-18 lubricant by temperature (SAE 20 for 20–40 °F, SAE 30 for 40–100 °F, SAE 40 for 100–120 °F, SAE 50 for 120–140 °F) (s22). Life reduced up to 300× with no lubrication (s31).
- Life (s31): 8×10⁶ cycles or 15 000 h, whichever first; replace sprockets every 3rd chain.
- Static/tension sizing (HW1 P5, Mott 7-26): **tensile strength ≥ 10 × working load**: 2500 lb per strand → 25 000 lb → No. 120 chain (TS 34 000 lb, Mott Table 7-12)... final SF = 34 000/2500 = 13.6.
- Renold design-factor increases (s34, **COURSE** `chain_renold_design_factor_multipliers.png`): lubrication × cleanliness (regular 1.00/1.25/1.50 for clean/moderately clean/dirty; occasional 1.25/1.50/1.75; none 1.50/1.50/1.75) and temperature × load (+10…150 °C 1.00/1.34/1.88 smooth/moderate/heavy shocks; 0…10 °C 1.25/1.88/2.38; −20…0 °C 1.50/2.50/3.13; −40…−20 °C 1.88/3.13/4.13). Renold nominal safety factor on breaking (s33, `chain_renold_safety_factors.png`): 5.0 (10⁶ cycles) / 6.0 (2×10⁶) dynamic ≤ working load; 8.0 (8×10⁶) dynamic occasionally 20 % over; 10.0 passenger lifts; 12.0 harsh environments; below 8 → increased wear unless lubrication improved.
- ANSI #50 strength table (s15, `chain_ansi50_strength_table.png`): #50 single strand min tensile 4880 lb, working 1400 lb; 50-2 9760/2380; 50-3 14 640/3500; 50-4 19 520/4620; 50-5 24 400/5460; 50-6 29 280/6440 lb.
- Renold No. 50 hp rating table (s20, `chain_renold_no50_hp_rating.png`), e.g. 17T @1200 rpm = 16.85 hp (Type B), 18T @300 = 4.71 hp.

### Test cases
| Case | Inputs | Answers | Source |
|---|---|---|---|
| Tutorial 1 Q2 (S 17-26) | No. 40-4, N1=21 @2000 rpm, N2=84, C≈20 in | p=0.5; L/p=135 → L=67.5 in; Htab=7.72 hp (Table 17-20 @2000 rpm, post-extreme); K1=(21/17)^{1.5}=1.37; K2=3.3; Ha=34.9 hp; H1 (17-32)=12.84 hp ×3.3=42.4; H2 (17-33)=10.5 ×3.3=34.7 (roller governs); 20 000 h life (17-39, Kr=17): H2=10.56 → 34.8 hp; T=91.4 lbf·ft; D=3.355 in; chain tension 654 lbf | Module 1 p7–10 |
| Tutorial 1 Q1 (S 17-25) | No. 60 double strand, 13T @300 rpm, 52T, 82 links | find Ha, C, torque & tension at 0.7 Ha | Flex Tutorial 1 (no solution) |
| HW1 P6 (Mott 7-40) | 6-cyl engine → heavy conveyor, 500 rpm, 40 hp, 250 rpm | SF 1.4 → 56 hp; 3 strands (factor 2.5) → 22.4 hp/strand; No. 80 (p=1.00); N1=14, N2=28; D1=4.494, D2=8.931 in; CD 36 pitches → L 93.1 → **94 pitches**; actual CD 36.432 in; wrap 173°/187° (>120° required) | HW1 p14 |
| HW1 P7 (S 17-27) | 700 rpm 25 hp motor → 2-cyl pump 140 rpm, No. 80 | Ks=1.5, nd=1 → Hd=37.5 hp (student wrote 41.25 with nd=1.1); N1=17 (K1=1), N2=85→84; Htab (Table 17-20, No. 80 @700 rpm) = 31 hp; K2=1.7 (2 strands) → 52.7 ≥ Hd → **2 strands**, 17/84 teeth, output 141.7 rpm | HW1 p15 |
| Lecture (Martin) | 10 hp motor 1200→300 rpm, 30" centres, moderate shock | SF 1.3 → 13 hp; No. 50, 18T driver; 70T driven; 142 pitches | Chains s30 |

---------------------------------------------------------------------------------------------------------------

## 5. Wire rope  (Wire Rope 2025.pdf; Tutorial 3; HW1 P8)

Textbook: **Shigley 17-6** (Table 17-24, 17-25, 17-26, 17-27, Fig 17-21, Eq 17-41…17-47); Mott Table 7-25 and
Wesco catalogue pages shown for breaking strengths.

- Strength tables: S Table 17-24 nominal Su on **nominal area d²·π/4** (6×19 monitor 106 kpsi, plow 93, mild plow 80; 6×7 100/88/76; 6×37 100/88; 8×19 92/80; w = 1.50d², 1.60d², 1.55d², 1.45d² lbf/ft; min sheave 42d, 26–34d, 18d, 21–26d; Er 14/12/11/10 Mpsi). S Table 17-27: 6×7 D=42d (72d better), dw=0.111d, Am=0.38d², Er=13×10⁶; 6×19 30d (45d), 0.067d, 0.40d², 12×10⁶; 6×37 18d (27d), 0.048d, 0.40d², 12×10⁶ (s15–s16).
- `Fu = (Su)nom · Am` (course uses Table 17-24 nominal strength × π d²/4; Tutorial: 106 kpsi × π(2)²/4 = 333 kip). Compare with catalogue: Wesco 6×19 FC EIPS 2" = 352 000 lb (s7, `wire_rope_wesco_6x19_eips.png`; 1 ton = 2000 lbf).
- Bending: `Fb = Er dw Am / D` (17-41/17-42); full bending for departure angle > 12°; "better sheave diameter" 45d is used in the tutorial for margin.
- Bearing pressure `p = 2F/(dD)` (17-43) vs Table 17-26 (6×19 regular lay: wood 250, CI 480, cast steel 900, chilled CI 1100, Mn steel 2400 psi).
- Tension `Ft = (W/m + w l)(1 + a/g)`, g = 32.2 ft/s² (17-47).
- Fatigue `Ff = (p/Su) Su D d / 2` (17-44) with (p/Su) from Fig 17-21 (values ×10⁻³; 6×19 @10⁶ bends → 0.0014; @10⁵ → 0.004) and **Su of the individual wire: IPS/monitor 240–280 kpsi → use 240 kpsi** (lowest of range), plow 210–240, mild plow 180–210 (s22, HW1 "Su = 240 kpsi (plow steel)").
- Factors of safety (s19–s22): `n = Fu/Ft`; static with bending `ns = (Fu − Fb)/Ft` (17-46); fatigue `nf = (Ff − Fb)/Ft` (17-45); Table 17-25 minimum factors (mine shafts ≤500 ft 8.0, 1000–2000 ft 7.0, 2000–3000 6.0, >3000 5.0; hoisting 5.0; haulage 6.0; cranes/derricks 6.0; electric hoists 7.0; passenger elevators 7.6–11.9 by speed). Wesco WLL tables use design factor 5:1, basket D/d = 25 (s21).
- End fittings (Canvas note, HW1 p17–19, **COURSE** `wire_rope_clips_table.png`): Flemish eye splice efficiency 92.5 % (1.625") / 95 % (0.75"); wire-rope clips 80 % when torqued correctly; multiply nf by efficiency. Clip table: 3/4" rope → 4 clips, 18" turnback, 130 ft·lb; 1" → 5 clips, 26", 225 ft·lb; 2" → 8 clips, 71", 750 ft·lb.
- Remedy for low fatigue SF: smaller diameter, multiple ropes (Ex 17-6).

### Test cases
| Case | Inputs | Answers | Source |
|---|---|---|---|
| Tutorial 3 Q1 (S 17-29) | 2-in 6×19 monitor, 4 tons, 480 ft, 6-ft drum, cast-steel sheaves min 3 ft, 1200 ft/min, a=2 ft/s² | sheave chosen 45d = 90 in; Fu = 106(π·4/4) = 333 kip; wl = 1.6(4)(480) = 3072 lbf; Ft = (8+3.072)(1+2/32.2) = 11.76 kip; Fb = 12e6(0.067·2)(0.40·4)/90 = 28.6 kip; (p/Su)=0.0014 → Ff = 0.0014(240)(90)(2)/2 = 30.3 kip; n = 333/11.76 = 28.3; ns = (333−28.6)/11.76 = 25.9; nf (no bending) 2.6; **nf = (30.3−28.6)/11.76 = 0.14** → unacceptable for infinite life; at 10⁵ bends (p/Su = 0.004) Ff ≈ 69 kip (solution uses D = 72 in drum here) → nf ≈ 3.4; ~1000 days at 100 ops/day | Module 1 p25–30 |
| HW1 P8 (S 17-31) | 2000-ft hoist, 72-in drum, 6×19 monitor, W = 8000 lbf, a = 2 ft/s² | Su nom 106 kpsi; Su 240 kpsi; (p/Su)=0.0014; Ff = 0.0014(240)(72)/2·d = 12.1d kip; wl = 3.2d² kip; Ft = (8 + 3.2d²)(1+2/32.2) = 8.5 + 3.4d² kip; nf = 12.1d/(8.5+3.4d²): d=0.5→0.650, 1.0→1.020, 1.5→1.124, **1.625→1.125 max**, 1.75→1.120, 2.0→1.095. (b) m=4: Ft = 2.12+3.4d², nf max **2.250 at d = 0.75**. (c) 1.625": Flemish 0.925×1.125 = 1.04 OK, clips 0.80×1.125 = 0.9 NO; 0.75": 0.95×2.25 = 2.14, clips 1.80; 4 clips, 18" turnback, 130 ft·lb | HW1 p15–21 |

---------------------------------------------------------------------------------------------------------------

## 6. Gear kinematics, geometry and forces  (Gear_Kinematics_and_Forces_-2024.pdf; Gear Trains Tut 1–2; Midterm P2)

Textbook: Shigley Ch 13 (Eq 13-1 … 13-45; Fig 13-22 helical) with Mott p319 for contact ratio.

- `P = N/d`; `mG = NG/NP` (faster/slower; "1:n"); train value e = ∏(driving teeth)/∏(driven teeth), sign by inspection ("mating teeth move same direction") (s8–s10).
- Contact ratio `mc = qt/p = Lab/(p cosφ)`; min 1.2, typical 1.5 (s25).
- Interference: `Np = 2k/((1+2m) sin²φ) [m + √(m² + (1+2m) sin²φ)]`, k = 1 full depth; 17 teeth for φ = 20° (s26). Tutorial 1 Q3: smallest pinion with itself, with mG = 2.5, with rack.
- Spur forces: `T = 63 025 H/n`; `Wt = T/(d/2)`; `Wr = Wt tanφ`; `Wn = √(Wt² + Wr²)` (= Wt/cosφ).
- Helical (s36–37): `Wr = Wn sinφn`, `Wt = Wn cosφn cosψ`, `Wa = Wn cosφn sinψ`; `Pt = Pn cosψ`; `tanφt = tanφn/cosψ`; `px = pt/tanψ`; F ≈ 2 px (Helical deck s3).
- Bevel (s33–34): `γ = tan⁻¹(NP/NG)`; `rave,P = d/2 − (F/2) sinγ`, `rave,G = D/2 − (F/2) cosγ`; `Wt = T/rave` (**forces at the average radius**); `Wr = Wt tanφ cosγ`; `Wa = Wt tanφ sinγ`. Strength analysis (AGMA) uses `Wt = 2T/dp` at the *large end* instead (Helical/Bevel s18).
- Standard tooth proportions (Helical/Bevel s33 table, `standard_gear_teeth_table.png`): 20° FD a = 1/P, b = 1.25/P, c = 0.25/P, working depth 2/P, whole 2.25/P, t = 1.571/P, face width 9/P < F < 13/P; 20° stub a = 0.8/P, b = 1/P; 25° FD as 20° FD.

### Test cases
| Case | Inputs | Answers | Source |
|---|---|---|---|
| Midterm 2025 P2 part 1 | 1750 rpm → 650 nominal, 10 hp, φ = 20°, Pd = 10, NP = 17 | VRnom 2.69 → NG = 45.76 → **46**, VR 2.705, out 647 rpm; dP = 1.700, dG = 4.600 in; V = 778.9 ft/min; T = 360.1 lbf·in; Wt = 423.7, Wr = 154.2, Wn = 450.9 lbf | Midterm Sol p13–14 |
| Midterm MC 6/7 | gears 17/34 and 16/40, 1800 rpm CW, 750 W | 360 rpm same direction (CW); T_out = 19.9 N·m | Midterm Sol p3 |
| Midterm MC 3 | 2-start worm, 80-tooth gear, 20 worm revs | ½ rotation (of gear) | Midterm Sol p2 |
| Gear Tut 1 Q1 (S 13-16) | shaft a 900 rpm; 2/3 spur P=10, N2=14, N3=54; 4/5 helical Pn=6, ψ=25°, N4=16, N5=36 | nb = 900(14/54) = 233 rpm CW; Cab = (1.4+5.4)/2 = 3.4 in; Pt = 6cos25° = 5.44; d4 = 2.94, d5 = 6.61; Cbc = 4.78 in; nc = 233(16/36) = 103.6 rpm CCW; thrust on shaft b +z, shaft c −z | Module 2 p1–3 |
| Gear Tut 2 Q2 (S 13-47/53) | 4 helical gears, φn = 20°, ψ = 30°, idler shaft b with 54T & 14T, Pn = 7, W3t = 500 lbf | W3 = 614.4, W3r = 210.2, W3a = 288.7; W4t = 500(54/14) = 1929; W4r = 811; W4a = 1114; shaft b force = (−601 i + 825 j − 2429 k) lbf | Module 2 p3–4 |
| Gear Tut 2 Q1 (S 13-49) | 16T/32T straight bevel, 2.5 hp @ 240 rpm, forces at tooth midpoints | contact force vector + bearing reactions (no solution in files) | Gear Trains Tut 2 |

---------------------------------------------------------------------------------------------------------------

## 7. Spur gear stress (AGMA)  (Gear_Stress_2026.pdf; Gear Trains Tut 3; Midterm P2 parts 2–3)

Textbook: **Shigley Ch 14** equations (14-15…14-18, 14-21…14-43, roadmap Figs 14-17/14-18), with **Mott Ch 9**
tables/charts explicitly accepted as substitutes (Table 9-1 Ko, 9-2 Ks, 9-6 Kv, Fig 9-11, 9-12, 9-13, 9-16, 9-17,
9-22, Table 9-7/9-8). Symbols: `Wt(Shigley) = Wt(Mott)` (s5, s22).

### Equations
- Bending `σ = Wt Ko Kv Ks (Pd/F)(Km KB/J)`; `σall = St YN/(SF KT KR)`; `SF = St YN/(KT KR σ)` (s5, s41).
- Contact `σc = Cp √(Wt Ko Kv Ks Km Cf/(dp F I))`; `σc,all = Sc ZN CH/(SH KT KR)`; `SH = Sc ZN CH/(KT KR σc)` (s24, s46).
- Compare `nb` with **`nc²`** (linear/helical contact) or `nc³` (spherical) when deciding which mode governs (s48, Helical s67; Module 2 p27 "(SF)² = 2.50").

### Factor conventions (what the course actually assumes)
| Factor | Course rule | Source |
|---|---|---|
| Ko | Shigley table (uniform 1.00/1.25/1.75; light 1.25/1.50/2.00; medium 1.50/1.75/2.25) **or Mott Table 9-1** ("more conservative": uniform 1.00/1.25/1.50/1.75; light 1.20/1.40/1.75/2.25; moderate 1.30/1.70/2.00/2.75). Tutorials: Ko = 1 (smooth/uniform). Midterm gives Ko = 1.25 (uniform source, light shock). `ko_shigley_vs_mott.png` | s12 |
| Kv | Shigley Fig 14-9 by Qv **or** Eq 14-27/28: `B = 0.25(12−Qv)^{2/3}`, `A = 50+56(1−B)`, `Kv = ((A+√V)/A)^B` (preferred: "difficult to read the graph accurately"). Mott Table 9-6 with Av: `B = 0.25(Av−5)^{0.667}`, `C = 50+56(1−B)`, `Kv = (C/(C+√Vt))^{−B}`. Quality: AGMA Q in Shigley "no longer in use" → Mott Table 9-4 maps Q↔Av (Q5=A12…Q6=A11, Q7=A10, Q8=A9, Q9=A8, Q10=A7, Q11=A6, Q12=A5). Midterm: "Av = 8 (Q = 9)". | s13–14 |
| Ks | **"Typically Ks = 1"**; or `Ks = 1.192 (F√Y/P)^{0.0535}` (Y Table 14-2); Mott Table 9-2: Pd ≥ 5 → 1.00, 4 → 1.05, 3 → 1.15, 2 → 1.25, 1.25 → 1.40. Instructor: "I normally will suggest we default to 1.0" but tutorial keeps 1.088 (F=2, Y=0.296, P=6). Midterm: Ks = 1.0 since Pd > 5. | s15; Module 2 p7, p18 |
| Km | Shigley Eq 14-30 `Km = 1 + Cmc(Cpf Cpm + Cma Ce)`: Cmc = 1 (uncrowned, "normally"), Cpf from 14-32 (**use 0.025 floor rule: F ≤ 1 → F/(10dp) − 0.025; 1 < F ≤ 17 → F/(10dp) − 0.0375 + 0.0125F**; if F/(10dp) < 0.05 use 0.05), Cpm = 1 (straddle, S1/S < 0.175), Cma **curve 2 "commercial enclosed gear units" by default** (Eq 14-34: A=0.127, B=0.0158, C=−0.930e-4 → Cma = 0.127 + 0.0158F − 0.930e-4 F²), Ce = 1 ("normally 1.0 for commercial gears"). Mott simplified `Km = 1 + Cpf + Cma` (9-17) gives the same number; Mott Cma commercial `0.127 + 0.0158F − 1.093e-4 F²`. Midterm used Mott form: Cpf = 0.0694, Cma = 0.1505, Km = 1.22. | s16–20; Midterm Sol p16 |
| KB | 1.0 ("normally", mB > 1.2; solid pinion) | s21 |
| J | Shigley Fig 14-6 (spur; 16T pinion with 48T gear → J ≈ 0.27 back-calculated from tutorial σ) | s9 |
| I | Shigley Eq 14-23 `I = cosφ sinφ/(2mN) · mG/(mG+1)`, mN = 1 spur; **or Mott Fig 9-17** (read value; "slightly different but easier"). Tutorial: 0.1205 (S) vs 0.097 (M) for Np=16, mG=3; midterm 0.117 (S) vs 0.096 (M) for Np=17, mG=2.70 — both accepted. | s31–32 |
| Cp | 2300 √psi steel/steel (Table 14-8 / Mott Table 9-7) | s30 |
| Cf | 1.0 (not in Mott) | s33 |
| St | Table 14-3 / Fig 14-2: Grade 1 through-hardened `St = 77.3 HB + 12 800 psi`; Grade 2 `102 HB + 16 400`. (Grade 1 is the default.) | s35–36 |
| Sc | Table 14-6 / Fig 14-5: Grade 1 `Sc = 322 HB + 29 100 psi`; Grade 2 `349 HB + 34 300`. | s42–43 |
| YN | Fig 14-14; for N > 10⁷ use **`YN = 1.3558 N^{−0.0178}`** ("use this line for normal commercial gears"; 1.6831 N^{−0.0323} is "high precision applications only"). Tutorial also reads ≈0.95 at 10⁸ and notes Shigley's 0.977 is "less conservative". | s37 |
| ZN | Fig 14-15; **`ZN = 1.4488 N^{−0.023}`** for normal commercial gears (nitrided 1.249 N^{−0.0138}). Tutorial: 0.948 by formula, or 0.90 reading the centre of the shaded zone; midterm 0.943 or 0.95. | s44 |
| CH | gear only; = 1 for pinion; "neglect or use 1" when same hardness | s45 |
| KR | Table 14-10 (0.9999 1.50; 0.999 1.25; **0.99 1.00**; 0.90 0.85; 0.50 0.70) | s38 |
| KT | 1.0 (< 250 °F) | s39 |
| SF, SH | 1 to 1.5 suggested; solve for minimum St/Sc with SF = 1 then pick HB | s41, s46 |
| Face width | Shigley roadmap `3/P ≤ F ≤ 5π/P`, initial median 4π/P (s22, s49); **Mott `8/Pd < F < 12/Pd`** (s51; standard-teeth table says 9/P–13/P). Fig 9-11 (Mott) gives first estimate of Pd from design power Ko·Hnom and pinion rpm. | s22, s49–51 |
| HB ↔ Su | HB ≈ 2 × Su(ksi) (i.e. Su ≈ 0.5 HB ksi) | Helical/Bevel s38 |
| Materials | Mott Table 9-8 / Appendix A3 (through-hardened: 1045, 4140, 4150, 4340, 4350; carburized: 1020, 4118, 4320, 4820, 8620, 9310). Pick alloy + heat treatment by HB (e.g. 4140 annealed HB 197, 4140 OQT1300 HB 235, 4140 OQT1000 HB 341, 4340 OQT1000 HB 363, 4340 OQT700 HB 461) and quote % elongation for ductility. "OQT1300" = oil quenched & tempered at 1300 °F. | Module 2 p27; Midterm Sol p17, p6 |

### Procedure (s47): design parameters (geometry, material, power, loading) → loads (d, V, Wt) → factors
(Ki, J, YN, Ci, I, ZN) → working stresses σ, σc → allowable → SF, SH > 1 → pass/fail; repeat for pinion and gear.
Design of a mesh (s49–50): a-priori decisions (load, speed, reliability, life, Ko, mG, tooth system, Qv) → choose
Pd and face width → pinion material/core hardness → check bending → Sc needed → case hardness → check wear →
same for gear → iterate.

### Test cases
| Case | Inputs | Answers | Source |
|---|---|---|---|
| **Gear Tut 3 (S 14-19/14-20)** | commercial enclosed, φ=20°, NP=16, NG=48, 300 rpm, F=2 in, P=6, Grade 1 TH 200 HB, Qv=6, uncrowned, centred, accurate/rigid, life 10⁸, R=0.90, 5 hp | dP=2.667; V=209.5; Wt=787.6 lbf; Ko=1; B=0.8255, A=59.77, **Kv=1.196**; Ks=1.088 (Mott table 1.00); Cpf=0.0625 (F/(10dp)=0.075 → 0.075−0.0375+0.025), Cma=0.16, **Km=1.223**; KB=1; J≈0.27; **σ=13 904 psi**; St=28 260; YN=0.977 (0.95 graph); KT=1; KR=0.85; **SF=2.34**. Contact: Cp=2300, Cf=1, I=0.1205 (Mott 0.097); **σc=101 485 psi (101.5 ksi)**; Sc=93 500; ZN=0.948 (0.90); **SH=1.03** (0.94 with ZN=0.9) → wear marginal, raise hardness or widen face to 2.5–3 in | Module 2 p5–15 |
| **Midterm 2025 P2 parts 2–3** | pinion only: F=1.5, φ=20°, Av=8 (Q=9), steel, commercial enclosure, Ko=1.25, Wt=423.7, dP=1.7, NP=17, mG=2.70, V=779 fpm | Cp=2300; I=0.096 (Mott Fig 9-17) / 0.117 (Eq 14-23); sc,nom=95.6 ksi; Kv≈1.16 (Fig) / 1.17 (B=0.520, A=76.88); Km=1.22; KB=1.0; Ks=1.0; **sc = 127.8 ksi (Mott I) / 115.8 ksi (Shigley I)**. Part 3: 6 h/day, 200 d/yr, 1 yr → 1.26×10⁸ cycles; ZN=0.95 (Fig 9-22/14-15) or 0.943; KT=1, KR=1 (0.99 assumed); Sac,min = 127.8/0.94 = 135.5 ksi; Grade 1 `0.322 HB + 29.1` → **HB ≥ 330**; choose 4340 OQT1000 HB 363, 16 % el., SF = 0.322(363)+29.1 = 146/135.5 ≈ **1.10** ("AGMA SF between 1.0–1.5"); flame/induction hardening discussed | Midterm Sol p15–17 |

---------------------------------------------------------------------------------------------------------------

## 8. Helical gear stress  (Helical_Bevel_…_2025.pdf s2–s13; Gear Trains Tut 4; Module 2 p16–27)

Textbook: Shigley Ch 14 (same equations; Fig 14-7 J', Fig 14-8 multiplier, Eq 14-21…14-26 for I); Mott Fig 10-5/10-6 & Table 10-1 accepted.

- Only J (bending) and I (contact) change vs spur (s6, s10). **Transverse pitch `Pt = Pn cosψ` is used in `σ = Wt Ko Kv Ks (Pt/F)(Km KB/J)`** and for dP (tutorial: dP = 16/5.438 = 2.942 in).
- `J = KJ' × J'`: J' from the 75-tooth-mate chart (Fig 14-7), multiplier from Fig 14-8 for the actual mating gear ("KJ' is not an official AGMA variable"). Example s7: 20T/100T ψ=20°: Jp = 0.46×1.01 = 0.47, JG = 0.55×0.935 = 0.51 (spur: 0.34/0.435). Shigley Fig 14-7 reads J' = 0.505 vs Mott Fig 10-5 0.46 for the same case (s9). Tutorial extrapolates below 20T: 16T @ψ=25° → J' ≈ 0.47 ("likely a little conservative"). Helix ≈ 15° optimal.
- `I = cosφt sinφt/(2mN) · mG/(mG+1)` (14-23), `mN = pN/(0.95 Z)` (14-21), `pN = pn cosφn` (14-24), Z (14-25) with `a = 1/Pn`, `rb = r cosφt` (14-26), `φt = tan⁻¹(tanφn/cosψ)` (s13). Tutorial: φt = 21.9°, Z, mN = 0.6937?, I = 0.193 (S) vs 0.199 (Mott Table 10-1) — handwritten corrections give **I = 0.190** for ψ = 25°.
- Instructor changed Shigley's 30° helix to **25°** "to use the charts in Mott" (Module 2 p16).

Test case (Gear Tut 4, S 14-22 mod.): as Tut 3 but helical ψ=25°, Pn=6 → Pt=5.438, dP=2.942, V=231.1, **Wt=714 lbf** (682.3 is the 30° value); Ko=1; Kv=1.21; Ks=1.088 (→1.09); Cpf=0.0554, Cma=0.16, Km=1.22; KB=1; J≈0.45 (0.47 × ≈0.96); min St for SF=1: **5947 psi (5.9 ksi)** → with 200 HB (28.3 ksi) SF = 4.8; contact: Cp 2300, Cf 1, I 0.190 (Mott 0.199), **σc ≈ 74.0 ksi** (71.0 with Mott I; 69 640 psi printed is the 30°/682-lbf value); min Sc = 66.2 ksi; 200 HB → SF 1.41; material 4140 OQT1300 HB 235 → 104.8/66.2 = 1.58 (SF² = 2.50), or 4140 annealed HB 197 → 1.40 (SF² = 1.96); Shigley App A-21 4140 Q&T 650 °C HB 230 → 1.56. (Module 2 p16–27.)

---------------------------------------------------------------------------------------------------------------

## 9. Straight bevel gear stress  (Helical_Bevel_… s14–s30; Gear Trains Tut 4 Q2 / Tut 5)

Textbook: **Shigley Ch 15** (Eq 15-3…15-24, Tables 15-1…15-5, Figs 15-5…15-15) with Mott Ch 10 figure numbers
quoted alongside (Fig 10-8, 10-9, 10-15, Eq 10-17, 10-21).

- Bending `st = (Wt/F) Pd Ko Kv (Ks Km)/(Kx J)`; `swt = sat KL/(SF KT KR)`; `SF = σall/σ` (s17). Contact `sc = Cp √(Wt/(F dp I) · Ko Kv Km Cs Cxc)`; `swc = sac CL CH/(SH KT CR)` (s24); `SH = σc,all/σc`, **`nw = SH²`** comparable with SF (s30).
- Wt for strength = `2T/dp` at the large end (not the average radius used for forces) (s18).
- Ko: Table 15-2 "slightly higher than spur" (uniform 1.00/1.25/1.50/1.75+; light 1.10/1.35/1.60/1.85; medium 1.25/1.50/1.75/2.00; heavy 1.50/1.75/2.00/2.25); speed-increasing drives add 0.01(NG/NP)². Tutorial 5 sets Ko = 1.0, SF = SH = 1.0 (power-rating problem).
- Kv: same as spur/helical (Fig 15-5/15-6; Eq 15-5…15-8) (s20).
- `Ks = 0.4867 + 0.2132/Pd` (0.5 ≤ Pd ≤ 16), 0.5 for Pd > 16 (15-10); `Km = Kmb + 0.0036 F²` with Kmb = 1.00 both straddle / 1.10 one / 1.25 neither (15-11); `Kx = 1.0` straight bevel (s21).
- J: Fig 15-7 (Mott 10-15); I: Fig 15-6 (Mott 10-9), pinion only analysed when same material (s19, s25).
- `KL`: Fig 15-9 = case-hardened line of 14-14: `KL = 6.1514 N^{−0.1192}` (10³–10⁷), **`KL = 1.3558 N^{−0.0178}` for N > 10⁷ commercial** (1.683 N^{−0.0323} critical) (s23). `CL = 3.4822 N^{−0.0602}` (Fig 15-8, N > 10⁴) (s28).
- KT = 1.0 (< 120 °C); KR = 1.0 (99 %); **no KB for bevel (= 1.0)** (s23). `CR = √KR` — Table 15-3: 1/10 000 → CR 1.22/KR 1.50; 1/1000 → 1.12/1.25; 1/100 → 1.00/1.00; 1/10 → 0.92/0.85; 1/2 → 0.84/0.70 (s29). CH = 1.0 normally (s28).
- `Cs = 0.5` (F < 0.5 in), `0.125F + 0.4375` (0.5 ≤ F ≤ 4.5 in), 1 above (chart in Mott units caps at 0.83 for F ≥ 80 mm) (15-12); **`Cxc = 1.5` for commercial (properly crowned) gears**, 2.0 uncrowned (15-13) (s26).
- Face width `F = min(0.3 Ao, 10/Pd)`, `Ao = dp/(2 sinγ)` (15-24) (s30). Cp same as spur.
- sat Table 15-4, sac Table 15-5 (s22, s27, s66).

Test case (Gear Tut 4 Q2 / Tut 5, S 15-1/15-2): uncrowned straight bevel NP = 20, Pd = 6, transmission accuracy 6, both TH 300 HB, NG = 60, life 10⁹ pinion revs, R = 0.999, shaft angle 90°, 900 rpm, F = 1.25 in, φn = 20°, pinion outboard (cantilevered), gear straddle, Ko = 1.0, SF = SH = 1.0 → power rating in bending and in wear, and overall (Tutorial sheets; no numeric solution in files — Shigley Ex/Prob 15-1 answers apply).

---------------------------------------------------------------------------------------------------------------

## 10. Worm gears  (Worm_Gears_2024.pdf; Module 2 p28–37 "Adapted from Shigley 15-?/Mott")

Textbook: **Shigley 13-11, 15-5…15-8** (Eq 13-26…13-46, 15-28…15-63, Table 15-8, 15-9) with **Mott Fig 10-25
(friction), 10-26 (efficiency), 10-27 (Cs), 10-28 (Cm), 10-29 (Cv), Table 10-5 (Y), Eq 10-27, 10-37**.

- Geometry: `dG = NG pt/π`; `L = px NW`; `tanλ = L/(π dW)`; recommended `C^{0.875}/3.0 ≤ dW ≤ C^{0.875}/1.7` (13-26); Table 15-8 proportions (a = 0.3183 px, b = 0.3683 px, ht = 0.6866 px for φn ≤ 25°), Eq 15-39…15-47 (`(FW)max = 2√(2 D a)`); Table 15-9 max lead angle (φn 14.5° → 16°, 20° → 25°, 25° → 35°, 30° → 45°); `VR = n_worm/n_gear`; face FG = tangent length within addendum circle (s3–5).
- Velocities: `VW = π dW nW/12`, `VG = π dG nG/12`, `Vs = VW/cosλ` (s12).
- Friction **f = 0.103 exp(−0.110 Vs^{0.450}) + 0.012** (15-38, Vs > 10 ft/min; Mott 10-27); efficiency `η = (cosφn − f tanλ)/(cosφn + f cotλ)` (13-46); forces from 13-41…13-45 / 15-57, 15-58: `WGt = 33 000 nd Ho Ka/(VG η)` (**design factor nd and application factor Ka applied to output power**), `WWt = WGt (cosφn sinλ + f cosλ)/(cosφn cosλ − f sinλ)`; `Wf = f WGt/(f sinλ − cosφn cosλ)` (15-61); `Hf = |Wf| Vs/33 000` (15-63).
- Self-locking: generally λ < 6°; **static f ≈ 0.15** (steel on bronze, Mott Fig 10-25); self-locking if `f_static > cosφn tanλ` (s11; Module 2 p31 uses the reverse of 15-56).
- Durability `(Wt)all = Cs Dm^{0.8} Fe Cm Cv` (15-28); `Fe ≤ 0.67 dm` (mean worm dia); Cs: `720 + 10.37 C³` (C ≤ 3 in), sand-cast C > 3: 1000 (Dm ≤ 2.5) / `1190 − 477 log Dm`; chilled-cast 1000 (≤ 8) / `1412 − 456 log Dm`; centrifugal 1000 (≤ 25) / `1251 − 180 log Dm` (15-32…35; sand-cast = "most common gears"); Cm (15-36): `0.02√(−mG² + 40mG − 76) + 0.46` (3 < mG ≤ 20), `0.0107√(−mG² + 56mG + 5145)` (20–76), `1.1483 − 0.00658 mG` (> 76); Cv (15-37): `0.659 e^{−0.0011 Vs}` (< 700 fpm), `13.31 Vs^{−0.571}` (700–3000), `65.52 Vs^{−0.774}` (> 3000). Mesh survives "at least 25 000 h" if WGt < (Wt)all.
- Bending (gear only): `σa = WGt/(pn Fe y)` (15-53), **y = 0.125 for φ = 20°** (Mott Table 10-5); Mott variant (10-37) with dynamic load `Wd = Wt/Kv`, `Kv = 1200/(1200 + VG)`; **bronze gears σall = 24 ksi** (phosphor bronze, most common) (s19).
- Heat: `Hloss = 33 000(1−e) Hin`; `hCR = nW/6494 + 0.13` (no fan) or `nW/3939 + 0.13` (fan on worm shaft); `ts = ta + Hloss/(hCR A)`; `Amin = 43.20 C^{1.7}` in² (15-49…52); lubricant limit 250 °F (120 °C); "better to assume no fan" (s20; Module 2 p36).

Test case (Module 2 p28–37, "Adapted from Shigley"): single-thread steel worm 1725 rpm, NG = 56, 1 hp output, dW = 1.5 in, Pt = 8, φn = 20°, ta = 70 °F, Ka = 1.25, nd = 1.0, F = 0.5 in, lateral area 850 in² per side, sand-cast phosphor bronze → mG = 56, dG = 7.0, px = pt = 0.3927, C = 4.25 (dW range 1.182–2.09 OK); a = 0.125, b = 0.1446, ht = 0.2696, do = 1.75, dr = 1.21, Dt = 7.25, Dr = 6.711, c = 0.0196, (FW)max = 2.646; VW = 677.4, VG = 56.45, L = 0.3927, λ = 4.764° (self-locking, < 5°), pn = 0.3913, Vs = 679.8 fpm; f = 0.0250; cos20°·tan4.764° = 0.078 < 0.15 → self-locking; **η = 0.7563**; WGt = 966 lbf, WWt = 106.4 lbf; Cs = 787, Cm = 0.767, Cv = 0.312, **(Wt)all = 1787 lbf > 966 OK**; Wf = 29.5 lbf, Hf = 0.608 hp; HW = 2.18 hp, HG = 1.65 hp; bending σ = 39 500 psi (Mott Kv = 0.955, Wd = 1011 → 41 357 psi) > 24 ksi → reject (at 1.0 hp: 23 940 psi just OK); heat: Amin = 1642 < 1700 in²; Hloss = 17 530 ft·lbf/min; hCR = 0.568 (fan) → ts = 88.2 °F (no fan hCR 0.396 → ≈96 °F); redesign: F = 0.86 → 7/8 in gives 23 622 psi (SF 1.02) but (Wt)all = 782 < 966 → increase worm to ≈2 in.

---------------------------------------------------------------------------------------------------------------

## 11. Rack and pinion, plastic gears

- Rack: no dedicated course document; treated as the limiting case of interference (Tut 1 Q3h "smallest pinion that will run with a rack") and spur force equations.
- Plastic gears (Helical/Bevel s31–34, Mott): `σt = Wt Pd (SF)/(F Y)` with Lewis Y (Mott Table 9-15, load near pitch point; e.g. 20° FD: 26T 0.588, 30T 0.606, 34T 0.628, 38T 0.651, 43T 0.672, 50T 0.694) and SF = overload/"design" SF; compare with plastic strength (KHK catalogue) for the true SF. High Pd (small teeth) typical.

---------------------------------------------------------------------------------------------------------------

## 12. Gear trains (speed/direction)

See §6. Rules used in solutions: `n_out = e · n_in` with e = product of driver teeth / product of driven teeth;
compound shafts share speed (n3 = n4); direction by inspection; idlers do not change magnitude; planetary needs
two inputs (Gear Kinematics s14–16). Differential problem (Tut 2 Q3): N2 = 16, N3 = 48, N4 = 14, N5 = N6 = 20,
driveshaft 900 rpm (no numeric solution in files).

---------------------------------------------------------------------------------------------------------------

## 13. Bearings, shafts & keys

**No course lecture/tutorial documents for these topics exist in `v2/course/`.** The project brief lists
"shafts, gears, fasteners, bearings and springs" as course elements (Group Project p2). Calculator authors should
follow the textbooks (Shigley Ch 7, 11; Mott Ch 11, 12, 14, 16) and the student guides; no course-specific
overrides were found. The only bearing-related course rule: bevel/helical thrust directions and bearing reactions
from the gear forces (Gear Kinematics s38–39; Tut 2 Q1 "bearing A takes radial and thrust").

---------------------------------------------------------------------------------------------------------------

## 14. Springs, fasteners, power screws, ball screws, linear bearings  (Module #5 reading guide 2024)

Only a reading guide exists (3 pp). Required readings define the scope:
- Threaded fasteners: Shigley 8-1, 8-2 (power-screw power/torque/force; **or Mott 17-2**), 8-3/8-4 (preload, stiffness), 8-6 (bolt strength, **or Mott 19-2**; "look over the tables but do not memorize"), 8-7…8-9 (external load, torque–preload, joint), 8-11 (fatigue of tension joints), 8-12 (shear joints, **eccentric loading emphasised**; Mott 20-3 beneficial). Beneficial: 8-5 member stiffness, Mott 19-4 (torque–preload, clamping-force measurement), Mott 19-6 (thread stripping — "not discussed in Shigley").
- Ball screws: **Mott 17-3** (life, torque, power) and **17-4** (column buckling, critical speed); Thomson catalogue (engineering info pp. 139–142, 146–149 imperial / 150–153, 155–158 metric) for life, buckling, speed selection.
- Linear bearings: Thomson Round Rail Linear Guide catalogue (not in any text).
- Springs: Mott 18-1…18-4 or Shigley 10-1…10-4 (helical compression), Mott 18-6 design example, Shigley 10-9 (fatigue) and 10-11 (extension springs) required; stability (S 10-5 / M 18-5), materials (S 10-6), static design (S 10-7), critical frequency (S 10-8), torsion springs (M 18-7/18-8, S 10-12) beneficial.
No numeric conventions or worked examples for these topics appear in the course files.

---------------------------------------------------------------------------------------------------------------

## 15. Fluid power  (Parker "Fluid Power Basics" 1/2, Parker Design Engineers Handbook pages, Esposito Ch 6 pages, ANSI Y32.10 symbols)

All scanned; the course follows the **Parker Design Engineers Handbook** (cylinders section b, pumps/motors section c) and **Esposito Ch 6** for cylinder problems.

- Cylinder equations (Esposito 6.10): `Fext = p Ap` (6-1), `vext = Qin/Ap` (6-2), `Fret = p(Ap − Ar)` (6-3), `vret = Qin/(Ap − Ar)` (6-4); `HP = v(ft/s)·F(lb)/550 = Q(gpm)·p(psi)/1714` (6-5), `kW = v(m/s)·F(kN) = Q(m³/s)·p(kPa)` (6-5M); levers (6-7…6-9); cushion deceleration `a = v²/(2S)` (6-10), cushion pressure `p2 = [(W/g)a + p1 Apiston − (CF)W]/(Apiston − Acushion)` (6-11). Example 6-6: 1500 lb, 18.2 gpm, 3" piston, 1" plunger, p1 = 750 psi, CF = 0.12 → p2 = 856 psi.
- Parker handbook: Table b-1/b-2 theoretical push/pull force per bore and pressure (deduct rod area for pull); mounting classes & stroke factors (fixed + rigidly guided 0.5; pivoted + rigidly guided 1.0; supported not rigidly guided 2.0; trunnion on head 1.0; intermediate trunnion 1.5; cap trunnion/clevis 2.0): **basic length = stroke × stroke factor**, thrust = bore area × pressure → Graph b-1 gives rod diameter and stop-tube length; acceleration force factor g (Graph b-2): `F = Wg` (horizontal), `F = Wg + f` (with friction), `F = Wg − f` (deceleration), vertical `F = Wg ± W`; line fluid velocity ≤ 15 ft/s; Table c-1 **motor hp to drive pump = GPM × PSI/(1714 × 0.85)** (85 % pump efficiency; at 4000 psi double the 2000 psi value); pump formulas: `GPM_theor = disp(in³/rev) × rpm/231`, volumetric/mechanical/overall efficiency definitions, select pump & motor for **10–25 % more pressure than needed at the actuator** (losses), pump sizing from cylinder volume per cycle (36.1 in² × 18 in × 60/(231 × 12 s) = 14 gpm example). Parker Basics: `HP = GPM × PSI × 0.000583`.
- Mechanical motions handout: lever formula valid while applied force within 15° of the normal; crane `F sinβ d1 = L(d1 + d2)`; toggle `T = F·A/(2B)`.
- Test problems with answers (Esposito ch 6 page in `Fluid Power Practice Problems.pdf` p3; instructor note: "add rod diameter selection by adding extension = 12 or 16 inches"): 6-15 → 6.00 gpm out (3" bore, 1.5" rod, 8 gpm in); 6-17 (40 mm bore, 20 mm rod, 0.0016 m³/s, 5000 N) → 3.98 MPa, 1.27 m/s, 6.37 kW, 5.31 MPa, 1.70 m/s, 8.50 kW; 6-19 → ¼·p·Apiston; 6-21 (3" piston, inclined 5000 lb) → 354 psi; 6-23 (6000 lb up incline, μ = 0.15, 1000 psi) → 2.19 in; 6-25 → 4444 N, 2222 N, 8888 N; 6-27 (crane, 2000 lb) → 8480 lb.

---------------------------------------------------------------------------------------------------------------

## 16. Course-only figures (cropped to `v2/figures/course/`, 200 dpi)

| File | What | Slide |
|---|---|---|
| `belt_service_factor_hours.png` | Belt service factors Ks by driven class × hours/day × driver type (not Mott 7-1 / Shigley 17-15) | Flat&V s35 |
| `vbelt_selection_chart_abcd.png` | "Recommended Nominal V-Belt Selection" A/B/C/D classical-section chart | Flat&V s27 |
| `flat_belt_habasit_table.png` | Habasit flat-belt (F1)a per unit width table | Flat&V s21 |
| `gates_3vx_power_rating_table_b10.png` | Gates 3VX hp ratings + ΔP columns (lecture example) | Flat&V s34 |
| `gates_belt_sizes_table_b4.png` | Gates belt length table (3VX800 etc.) | Flat&V s36 |
| `gates_3v_centre_distance_table_b6.png` | Gates 3V sheave/CD table with combined wrap+length correction colour key | Flat&V s37 |
| `gates_3vx_example_slide38.png` | worked 3VX800 example numbers | Flat&V s38 |
| `gates_tension_formula_d19.png` | Formula D19, Table D26 Kφ, Table D27 M & Y, Formula D35 span | Flat&V s39 |
| `gates_deflection_formula_d20_d23.png` | Formulas D20–D23 deflection forces, example | Flat&V s40 |
| `chain_ansi50_strength_table.png` | ANSI #50 chain dimensions, tensile & working loads, 1–6 strands | Chains s15 |
| `chain_renold_no50_hp_rating.png` | Renold Jeffrey No. 50 single-strand hp table + strand factors + lube types | Chains s20 |
| `chain_renold_power_limit_chart.png` | Renold kW-vs-rpm limit chart | Chains s21 |
| `chain_martin_service_factors.png` | Martin catalogue service factors & selection notes | Chains s29 |
| `chain_martin_selection_example.png` | Martin selection example (10 hp, 1200→300 rpm) | Chains s30 |
| `chain_renold_safety_factors.png` | Renold nominal safety factors vs cycles/application | Chains s33 |
| `chain_renold_design_factor_multipliers.png` | Renold nd multipliers: lubrication/cleanliness, temperature/load | Chains s34 |
| `timing_gates_min_sprocket_dia_table4.png` | Gates Table No. 4 minimum sprocket PD per NEMA motor ("not in Mott") | Timing s7 |
| `wire_rope_wesco_6x19_eips.png` | Wesco 6×19 FC EIPS breaking strengths (bright/galvanised) | Wire Rope s7 |
| `wire_rope_wesco_wll_slings.png` | Wesco WLL single-leg & 2-leg bridle tables (5:1) | Wire Rope s21 |
| `wire_rope_clips_table.png` | wire-rope clip count / turn-back / torque table (Canvas notes) | HW1 Solutions p19 |
| `ko_shigley_vs_mott.png` | Shigley vs Mott Table 9-1 overload factors side by side | Gear Stress s12 |
| `helical_j_modifier_example.png` | J = KJ'·J' explanation and worked numbers | Helical/Bevel s7 |
| `standard_gear_teeth_table.png` | Mott Table 9-15 Lewis Y + standard tooth proportions (20° FD / stub / 25°) | Helical/Bevel s33 |

### Added by the course-table audit (see `v2/notes/course_table_audit.md`; catalogue crops come from `/home/claude/catalogues/`)

| File(s) | What | Source | Topic |
|---|---|---|---|
| `gates_table_b1_service_factors.png` | Gates service factors | Gates V-belt manual p.14 (B2) | v_belts |
| `gates_fig_b1_b2_section_charts.png` | Gates section charts B1 (narrow) + B2 (classical) | p.15 (B3) | v_belts |
| `gates_table_b2_b3_nema_min_sheave.png` | NEMA min sheave B2/B3 full table | p.16 (B4) | v_belts |
| `gates_table_b4_super_hc_belt_lengths.png`, `gates_table_b17_a_b_…`, `b18_c_d_e_…`, `b19_ax_bx_cx_…`, `b20_ap_bp_cp_belt_lengths.png` | belt sizes / lengths | pp.19, 76–79 | v_belts |
| `gates_table_b6_3v_drives_p_b16.png`, `…_p_b17.png` | 3V/3VX drive tables (CD + hp-correction colour) | pp.28–29 (slide 37 page) | v_belts |
| `gates_table_b23_c_cp_drives_p_b191.png` | C/CX/CP drive table VR 1.00–1.30 | p.203 (Module 1 p19) | v_belts |
| `gates_table_bNN_<sec>_hp_rating.png` (B9 3V … B16 8VP, B25 A … B34 D, 18 files) | rated hp per belt + additional hp for speed ratio | pp.68–75, 234–243 | v_belts |
| `gates_d24_tensioning_d19_d26_d27.png` | page D24: D19, D26 Kφ, D27 M/Y (all sections), D20–D23 | p.292 | v_belts |
| `gates_formula_d35_span_length.png` | Formula D35 span | p.313 | v_belts |
| `gates_timing_table4_min_sprocket_pd.png`, `gates_timing_table5_service_factors.png` | Gates synchronous Table 4 / Table 5 | Gates timing guide pp.16–17 | timing_belts |
| `habasit_habadrive_product_key_data.png`, `habasit_recommended_crown_height.png`, `habasit_pulley_crown_guideline.png`, `habasit_k1_tensile_force_relaxation.png`, `habasit_shaft_load_peripheral_force.png` | Habasit key data, crown, k1 %, shaft load | Habasit guide pp.9, 16–17, 19–20 (slides 18–21) | flat_belts |
| `renold_ansi_chain_noNN_dims_hp_rating.png` (No. 25 … 240, 14 files) | ANSI chain dims, tensile/working load 1–6 strands, hp table, strand factors | ansi-standard-1.pdf pp.1–14 | chains |
| `tsubaki_chain_service_factors.png`, `tsubaki_rs_provisional_selection_graph.png`, `tsubaki_roller_chain_construction.png` | Tsubaki selection factors, selection graph, chain parts | Tsubaki pp.175, 176, 14 | chains |
| `wire_rope_wesco_6x19_iwrc.png`, `…_7x7_7x19_aircraft.png`, `…_pro34k.png`, `…_end_fitting_efficiency.png`, `wire_rope_full_bending_knuckle_sheaves.png` | Wesco catalogue slides, termination efficiencies, knuckle sheaves | Wire Rope s8, s9, s11, s23, s13 | wire_rope |
| `westcoast_sheave_dd_bending_efficiency.png`, `westcoast_6x19_bright_fc_iwrc.png` | D/d efficiency & life, min D/d; 6×19 breaking strength | West Coast pp.18, 23 | wire_rope |
| `thomson_ballscrew_pNNN_*.png` (14 files: 139–142, 146–153, 157–158) | Thomson ball-screw engineering pages (Module 5 reading list) | Thomson ball screw catalogue | ball_screws |
| `thomson_roundrail_p26_…`, `p27_…`, `p263_…`, `p264_…`, `p265_…` | Ball Bushing life/load factors, product example | Thomson RoundRail | ball_screws |
| `oiles_500sp1_service_range_properties.png`, `oiles_500sp1_spb_bushing_sizes.png`, `oiles_operating_motion_pv.png` | OILES 500SP1 data, SPB sizes, PV vs motion | OILES pp.94, 95, 172 | bushings |
| `skf_deep_groove_ball_d25_30_p272.png`, `skf_cylindrical_roller_d15_25_p516.png`, `skf_tapered_roller_d15_32_p694.png` | example SKF product-table pages | SKF pp.274, 518, 696 | ball_cyl / tapered bearings |
| `khk_plastic_spur_bending_strength_t106.png`, `…_factors_surface_strength_t107.png`, `khk_plastic_bevel_worm_strength_t108.png` | KHK plastic gear strength | KHK tech info pp.106–108 (Helical/Bevel s34) | spur, rack, bevel |
| `gear_agma_quality_accuracy_levels.png`, `gear_cost_vs_accuracy_qv.png`, `gear_helical_hand_thrust_directions.png` | Qv by accuracy level; cost vs Qv; helical hand/thrust | Gear Kinematics s42, s41, s12 | spur, helical, bevel |
| `fluid_parker_b3_mounting_styles.png`, `fluid_parker_b4_mounting_classes_stroke_table.png`, `fluid_parker_b23_first_class_lever.png`, `fluid_parker_b24_toggle_variation.png`, `fluid_parker_b25_lifts_hinged_lever.png`, `fluid_parker_i10_pump_calc_continued.png` | Parker handbook pages | Calc Handouts p3–4, mechanical motions p6–8, motor & pump p8 | fluids |

Earlier course crops that were not yet listed above: `bevel_cr_course`, `bevel_cs_cxc_course`, `bevel_kl_course`, `bevel_ko_wt_large_end`,
`bevel_ks_km_kx_course` (Helical/Bevel s18–s29), `gear_cma_curve2`, `gear_km_shigley_annotated`, `gear_ks_course`, `gear_kv_q_av_table`,
`gear_stress_procedure`, `gear_yn_course_line`, `gear_zn_course_line` (Gear Stress), `worm_bending_course`, `worm_heat_course`,
`worm_self_locking_course` (Worm s11/s19/s20), `gates_section_chart_b1`, `gates_nema_min_sheave_b2_b3` (Flat&V s32–33),
`fluid_esposito_*`, `fluid_parker_b18…b21`, `fluid_parker_i8/i9` (fluid handouts).

New textbook crops made by the audit: `figures/mott/table8-7.png`, `table9-14.png`, `table2-2_fig2-6.png`, `fig2-12.png`, `table2-8.png`,
`table2-9.png`, `fig9-20.png`, `figures/shigley/fig13-5.png`.

Everything else shown in the decks is a direct reproduction of a Shigley/Mott table or figure (Table 17-2, 17-4,
17-15, 17-24…17-27, Fig 17-21, Table 14-3/14-6/14-8/14-10, Fig 14-6/14-7/14-9/14-11/14-14/14-15/14-17/14-18,
Table 15-2/15-3/15-8/15-9, Fig 15-8/15-9/15-14/15-15, Mott Table 7-1/7-2/7-4/7-7/7-8/7-9/7-11/7-18/7-25, Fig
7-13…7-19, 7-27, Table 9-1/9-2/9-4/9-6/9-15, Fig 9-11/9-12/9-13/9-16/9-17, Fig 10-5/10-9/10-15/10-25…10-29) — use
the textbook crops in `v2/figures/shigley` and `v2/figures/mott`.

---------------------------------------------------------------------------------------------------------------

## 17. Known inconsistencies in the course documents (so authors don't "fix" the wrong thing)
- HW1 P1 typed solution mixes two problem versions (4-in/2-hp numbers in the derivation, 5-in/3-hp in the boxed answers).
- Flat&V s38: "Ks = 1.2 (light shock) → HD = 1.1(2.0) = 2.2 HP" (typo; 2.2 = 1.1×2).
- Chains s24 says CD 30–60 pitches; s28 and Mott spreadsheet say 30–50.
- Module 2 helical solution: printed Shigley numbers are for ψ = 30° (Wt 682.3, σc 69 640); handwritten corrections (714 lbf, dP 2.942, I 0.190, σc ≈ 74 ksi) are for the 25° version actually assigned.
- Tutorial 3 wire rope: Ff for 10⁵ bends computed with D = 72 in (drum) although the 90-in sheave was used elsewhere.
- Wire Rope s19 reproduces Shigley Table 17-25 but the slide heading calls them "factors of safety"; HW1 calls 240 kpsi "plow steel" though it is the monitor/IPS lower bound.

### Added during calculator alignment — Worm Gears 2024 / Module 2 p28–37 worked solution
- (W^t)all = 1787 lbf in the slides uses Fe = 2 in (carried over from Shigley Ex 15-3) although the problem's F = 0.5 in; with Fe = F the allowable is ≈447 lbf and wear fails (the slides' own redesign at F = 7/8 in → 782 lbf is consistent with Fe = F). Calculators use Fe = min(F, 0.67 dm).
- Amin = 1642 in² uses C = 8.5 in instead of the problem's C = 4.25 in (correct ≈ 506 in²).
- Wf = −29.5 lbf is an arithmetic slip for −25.9 lbf (Hf 0.53 hp, not 0.61).

### Added during V-belt rebuild — course-solution slips found (calculators follow the correct value)
- Midterm 2025 P1: Lp written as 122.9 in for CD 32 — correct value is 114.9 in; the 125-in belt then chosen gives CD 37.10 as in the solution.
- HW1 P3a: ΔP 1.9 hp was read from the 5V chart; the 3V value is ≈0.33 hp (still 1 belt). The table row in §2 above (ΔP 1.4, CL 1.09, 11.6 hp) does not match the handwritten solution either; calculator gives CL 1.07, 11.84 hp/belt.
- HW1 P2: solution omits ΔPR.
- HW1 P3b: deflection force 7.23 lbf divides by 6 instead of 16 (correct 2.71–2.89 lbf).
- Lecture s38–40: slide states Ks = 1.2 but computes with 1.1.
- Tutorial 1 (S 17-2): typed θ = 3.132 rad is a slip for 3.123 rad.
