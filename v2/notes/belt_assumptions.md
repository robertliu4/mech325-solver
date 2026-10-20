# Guide assumptions for flat belts, V-belts and timing belts (from the Fizz and Mech bibles)

These are the findings from the review pass (group `rev-belts`). I read every page in Fizz pp. 4–25 and Mech pp. 13–33 and 135–136, both as text and as rendered page images. **No edits were made to `flat_belts_*.js`, `v_belts_*.js` or `timing_belts_*.js`.** Everything below is still open for the redesign agent.

Format for each entry: **assumption** — exact text/value — source — field it maps to (current file state) — action needed.

Page numbers: the PDF page equals the printed page in both guides. "Fizz p.N" means `original_documents/Mech_325_Bible_Fizz.pdf` and "Mech p.N" means `original_documents/Mech_325_Bible_Mech.pdf`.

---------------------------------------------------------------------------------------------------

## 1. Flat belts (`flat_belts_shigley.js`, `flat_belts_mott.js`; both follow Shigley)

Mech p.15 says "This guide follows Shigley and so should you." Mott does not cover flat belts.

| # | Assumption (guide wording / value) | Source | Field (current) | Status / action |
|---|---|---|---|---|
| F1 | In a DESIGN question you are given only C, d and D (or VR), n and Hnom, and you choose the belt yourself from Table 17-2. In an analysis question you are also given b, t, the material, w and f. | Mech p.15 | `spec`, `b` (no default) | Text only. |
| F2 | "Ks … and nd … For flat belts, they are usually given to you". | Mech p.16 | `Ks` default 1.25 (course examples), `nd` default 1.0 | OK. Say in the assumption text that the guides give no numeric Ks: 1.25 is the course value and nd = 1 is implied by Fizz `T = 63025 Hnom Ks nd / n`. |
| F3 | Velocity ratio VR = Vdriver/Vdriven = D/d. | Mech p.16 | `VRin` / `VR` | OK. |
| F4 | The open-belt equations are the default. "For crossed belts φ = π + 2 sin⁻¹((D+d)/2C) and both pulleys have the same angle of wrap"; L = √(4C² − (D+d)²) + ½(D+d)φ. | Mech p.16 footnotes 12–13 | `cfg` default 'open' | OK. The crossed-belt formulas in both files are correct. |
| F5 | "If it's a 'design' question, find all [wrap angles, length, Hd] to be safe". | Mech p.16 footnote 11 | — | Text only. |
| F6 | g = **32.17 ft/s²** in Fc = (w/g)(V/60)². | Fizz p.6 (Mech p.17 uses **32.2**) | hard-coded 32.17 | OK: this matches Shigley and the course. Add an assumption line noting that Mech uses 32.2 (the difference is about 0.1 %). |
| F7 | Cv = 1 for polyamide and urethane belts. Use Fig 17-9 only for leather. | Fizz p.9, Mech p.17 | `Cv` auto | OK. |
| F8 | Cp = 1 for urethane belts. For the other materials use Table 17-4 entered with the SMALL-pulley diameter. | Mech p.17 | `Cp` auto | OK. Note that the Table 17-4 column breakpoints in the code (4.25, 8.5, 13, 17, 31.5 in) are a calculator choice for diameters that fall between table columns. |
| F9 | The belt runs at its operating limit: F1 = (F1)a, so ΔF = (F1)a − F2 = 2T/d. | Fizz p.6 ("F1 = (F1)a at operation limit"), Mech p.17–18 | `F2`, `Fi` | OK. |
| F10 | Ha = (F1a − F2)V/33 000 "should equal your design horsepower". Fizz writes Ha = Hnom Ks nd. | Mech p.18, Fizz p.6 | `Ha` | OK: it reproduces Hd by construction. |
| F11 | nfs = Ha/(Hnom Ks). | Fizz p.6, Mech p.18 | `nfs` | OK. |
| F12 | Friction check: f′ = (1/φd) ln[(F1a − Fc)/(F2 − Fc)], computed with the SMALL-pulley wrap. Require f′ < f, "or else you will need to change the design". | Fizz p.6, Mech p.18 | `fp`, `after` | OK. |
| F13 | dip = C²w/(96 Fi), with C in inches. Mech writes this as 12(C/12)²w/(8 Fi), which is the same thing. | Fizz p.6, Mech p.18 | `dip` | OK. |
| F14 | (Not from the guides.) Specific weight γ for leather and urethane is a range in Table 17-2 (0.035–0.045 and 0.038–0.045). The calculator uses mid-range values: 0.040 for leather and 0.042 for urethane. | Shigley Table 17-2 (shown on Fizz p.8, Mech p.15) | `gamma` auto | Calculator choice. List it as an assumption with source "Table 17-2 (calculator mid-range)". |

**Errors found but not fixed (flat belts):** none of substance. The equations, the crossed-belt branch, the Cp table, the K-values and the example (Shigley Ex 17-1) all check out against Shigley pp. 904–915. Two minor points:
- The `phideg < 150°` warning is not from either guide or the textbook. It is harmless, but the text could say where 150° comes from, or drop it.
- In `flat_belts_mott.js` the intro sentence "Both bibles follow Shigley here (Mott does not cover flat-belt design)" appears twice.

---------------------------------------------------------------------------------------------------

## 2. V-belts (`v_belts_mott.js` = guide procedure; `v_belts_shigley.js` = Shigley analysis)

Both guides follow Mott (Fizz §1.4; Mech p.19: "This guide follows Mott"). Mech p.19 footnote 14 adds: "If the question asks for Tension per Strand (Tst), Fmin, or deflection, have a look in Shigley".

| # | Assumption (guide wording / value) | Source | Field (current) | Status / action |
|---|---|---|---|---|
| V1 | Design power = Hin · SF (Fizz), or Hd = Hnom·Ks (Mech), with SF from **Mott Table 7-1**. No nd appears, which implies nd = 1. | Fizz p.10, Mech p.19 | Mott: `SF` default 1.3, `nd` default 1. Shigley: `Ks` default 1.3, `nd` 1 | OK. The guides give no numeric default: 1.3 is the midterm value (course). |
| V2 | Table 7-1 factors are for speed REDUCERS. For speed increasers multiply by 1.2 (footnote 1 of the table as reproduced in both guides). | Fizz p.10, Mech p.19 (table footnote) | `SF` | Not handled. Add it to the hint or the assumption text, or add a "speed increaser ×1.2" toggle. |
| V3 | "Select the belt section. If at the boundary between two different types of belts, be conservative and choose the larger one". | Fizz p.10 | `sec` (no default) | Only in the Mott figure note. Add it as an assumption in both files. |
| V4 | VR = n1/n2 with n1 > n2. Mech writes VR = Vdriving/Vdriven = D/d = ndriving/ndriven. | Fizz p.11, Mech p.19 | `VRn` / `VR` | OK. |
| V5 | **Size the driving sheave for a belt speed of V = 4000 ft/min**: d = 12V/(πn). Fizz: "this is a standard speed we use since belt speed should not surpass 5000 ft/min, with a hard max at 6500 ft/min". Mech footnote 15: "the velocity value is a place holder". | Fizz p.11, Mech p.20 | Mott: `D1calc` hard-codes 4000. Shigley: `d` auto hard-codes 4000 | Works, but there is no field that carries the 4000. Suggest a `Vt` input (default 4000) that `D1calc`/`d` use, so the assumptions panel can show "using 4000 ft/min". |
| V6 | Belt speed should not surpass 5000 ft/min. **Hard max 6500 ft/min.** | Fizz p.11 (Mott p.272 also says: < 1000 ft/min → consider another drive type) | Mott: `vb` check (6500 / 5000 / 1000). Shigley: `V` check (> 5000 or < 1000) | OK. The Shigley check could also mention 6500. |
| V7 | "Make sure your final velocity is within 5 % of 4000 ft/min" (that is, 3800–4200 ft/min). Footnote 16: several trials of d may be needed. | Mech p.21 | — | Not implemented. Possible soft check on `vb`/`V`. Be aware that the midterm example (V = 3252 ft/min, D1 = 10.8 chosen from V < 5000) would then show a warning. **Separate issue:** `v_belts_mott.js` `n2a` has a "±5 % of target OUTPUT speed" check that is not from the guides. Mech's 5 % applies to belt speed. Either relabel that check as a calculator/course choice or move it to belt speed. |
| V8 | Choose the **closest** standard sheave size for D1. Then D2 = VR·D1 (D2 > D1) and choose the **closest** standard size again. | Fizz p.11–14, Mech p.20 | Mott: `D1`, `D2` auto = nearest | Auto is OK. **Inconsistency:** the `d1` step text says "Round the driven sheave up if between sizes" and the `D2` hint says "course: round up". Both guides say closest. Reword so the guides' rule (closest) is the default and the course's round-up is a note. |
| V9 | Recompute the actual VR = D2/D1, the output speed and the belt speed. | Fizz p.14, Mech p.21 | `VR`, `n2a`, `vb` | OK. |
| V10 | Rated power: the solid curve is VR = 1 and the dashed curve is VR = 3.38. **5V:** add ΔP from Fig 7-17. **3V/8V:** Hr = P2 + (VR − 3.38)/(3.38 − 1)·(P2 − P1). "If the actual speed ratio is higher than 1, use [Fig 7-17] to find the power added." | Fizz p.14–15, Mech p.22–23 | Mott: `P1`, `P2`, `Padd` auto | OK for 3V/8V. There is no auto for 5V: the Fig 7-17 step function could be tabulated. Step boundaries are VR 1.01/1.05/1.11/1.18/1.26/1.38/1.57/1.94/3.38. Steps at 1750 rpm: 0.14, 0.46, 0.80, 1.09, 1.32, 1.55, 1.74, 1.90, 2.01. At 1160 rpm: ≈0.10, 0.30, 0.52, 0.72, 0.87, 1.02, 1.15, 1.26, 1.33. At 870 rpm: ≈0.08, 0.22, 0.40, 0.54, 0.66, 0.77, 0.86, 0.94, 1.00. Read these from Fizz p.15 / Mech p.23 and double-check before use. |
| V11 | **"For a VR greater than 3.38, assume the dashed line doesn't increase further, and your rated power doesn't change much."** | Mech p.23 footnote 17 | Mott: `Padd` auto caps at VR = 3.38 (`min(VR−1, 2.38)`) | OK. List it as an assumption linked to `Padd`. |
| V12 | Trial centre distance **D2 < CD < 3(D2 + D1)**. Mech adds "Try being closer to D". | Fizz p.15, Mech p.23 (also Mott Eq 7-17) | Mott: `CDt` auto = ceil(1.15·D2), with a range check. Shigley: `Ct` optional input with a range check | OK. The 1.15·D2 factor is a calculator choice consistent with "closer to D". Say so in the assumption. |
| V13 | Lp = 2CD + 1.57(D2 + D1) + (D2 − D1)²/(4CD). Select the **closest** standard length from Table 7-2. | Fizz p.15 ("closest"), Mech p.23 ("closest") | Mott: `Lstd` auto = nearest. Shigley: `L` auto = nearest | OK. The course accepts either neighbour (the midterm took the larger). |
| V14 | Actual CD from B = 4Lp − 6.28(D2 + D1) and CD = [B + √(B² − 32(D2 − D1)²)]/16. | Fizz p.16, Mech p.24 | `B`, `CD` | OK. The Mott Eq numbers 7-12 to 7-15 and 7-17 were verified against Mott pp. 269–272. |
| V15 | θ1 = 180° − 2 sin⁻¹((D2 − D1)/2CD). Fizz: "Probably won't be asked to compute the angle of wrap for the big sheave". | Fizz p.16, Mech p.24 | `th1`, `th2` | OK. The θ1 > 120° check comes from Mott p.272 and the course, not the guides. |
| V16 | Corrected rating = Cθ·CL·P (Fig 7-18, Fig 7-19). | Fizz p.17, Mech p.25 | `Cth`, `CL`, `Pcorr` | OK. |
| V17 | Number of belts = design power / corrected rating, **always rounded up** ("if you get 2.01, you'll need 3 belts"). | Fizz p.18, Mech p.26 | `Nb` = ceil | OK. |
| V18 | Shigley file only: for tensions, Ha per belt is used for ΔF (course Tutorial 2), whereas Shigley Ex 17-4 uses Hd/Nb. | course (not the guides) | `dFbasis` default 'Ha' | Calculator/course choice. List it as an assumption. |

**Errors found but not fixed (V-belts):**
- `v_belts_mott.js`: see the V8 inconsistency (the step text and hint say "round up" while the auto and the guides say closest) and the V7 note (the 5 % check is on output speed, not belt speed).
- `v_belts_shigley.js`: the equations were checked against Shigley pp. 921–927 (17-16a/b, 17-17 K1 curve fit, Tables 17-9/11/16/17, F1/F2/Fi, nfs, life) and are all correct. The `V` check message only mentions 1000–5000. Consider adding the 6500 hard maximum (Fizz p.11).
- No numeric errors in either example. The Midterm 2025 P1 and Tutorial 2 Q1 baselines reproduce as listed in the file headers.

---------------------------------------------------------------------------------------------------

## 3. Timing (synchronous) belts (`timing_belts_mott.js`, `timing_belts_shigley.js`; both use Mott tables)

| # | Assumption (guide wording / value) | Source | Field (current) | Status / action |
|---|---|---|---|---|
| T1 | Given data: Hnom, n, VR, a nominal CD and minor details (maximum sprocket diameter, operating hours, shaft diameters). **"The CD is usually given as a range with some ± tolerance."** | Mech p.27 (footnote 20) | `CDnom`, `CDtol` (default 0) | OK. The guides give no numeric tolerance. List it as an assumption linked to `CDtol` and tell the student to enter the ± value. |
| T2 | Pdes = Prated·SF, with SF from **Mott Table 7-8**. | Fizz p.18–19, Mech p.27–28 | `SF` default 1.5 | The guides give no numeric value. 1.5 is a calculator default; the HW1 value is 1.8. |
| T3 | **Belt pitch: 8 mm.** Fizz: "You're probably going to get an 8mm pitch because that is all this textbook has data for". Mech: "I could bet my entire fortune that it will be 8 mm, but do check anyways". | Fizz p.20, Mech p.28 footnote 21 | `pitch` default 8 | OK. List it as an assumption linked to `pitch`. |
| T4 | VR = n_driving/n_driven. List ALL candidate driver/driven combinations from Table 7-7, then eliminate. | Fizz p.20 | `VR`, `N1`, `N2` | OK. |
| T5 | Bore check: eliminate any combination whose driving-sprocket max bore is smaller than the motor shaft (Fizz). Mech: "Min. Bore < Shaft Diameter < Max. Bore". Use Tables 7-4/7-5. | Fizz p.21–23, Mech p.29 | `bore1max`, `bore1min`, etc. | OK. |
| T6 | If a sprocket diameter limit is given, eliminate candidates whose **flange** diameter (Table 7-4) exceeds it. | Fizz p.23 | `OD1`, `OD2` vs `Dmax` | OK. Sprockets without a flange (N/A) fall back to the pitch diameter, which is a calculator choice. |
| T7 | "You should hopefully be left with one combination … Otherwise, just choose a random one that meets all requirements." | Fizz p.23 | — | Text only. |
| T8 | If a CD range is given, use Table 7-7 to pick the belt whose CD falls in the range. | Fizz p.23, Mech p.31 | `belt`, `CD` check vs `CDnom ± CDtol` | OK. |
| T9 | **Belt width: "You basically have two choices here, 30 mm or 50 mm" … "if 30 mm doesn't work, 50 mm will probably work, so starting off with 50 mm may be smart!"** | Mech p.31 footnotes 23 and 25 | `width` default **30** | The guide's starting value is 50 mm and the course HW1 used 30 mm. Per the review brief, the default should probably be 50, with a note saying the course HW1 used 30. That change would also mean pointing the `Prated` figure link at Table 7-10. The examples set `width: 30` explicitly, so they are unaffected. |
| T10 | Rated power from Table 7-9 (30 mm) / 7-10 (50 mm). **Interpolate on rpm** if needed ("If you are given a weird n value, you need to interpolate"). | Mech p.31 footnote 24 | `Prated` (lookup, no auto) | OK. |
| T11 | Padj = Prated·CL (CL from Table 7-11 by belt designation). Mech: "make sure it is well above" Pdes. Fizz: "It's fine if the value is very different than Pdes". | Fizz p.25, Mech p.31 | `CL` auto, `Padj` check | OK. |
| T12 | **Belt speed must not exceed 6500 ft/min.** | Fizz p.25, Mech p.33 | `vb` check | OK. The 3500–4000 target warning is the course's. |
| T13 | Specify the belt and sprocket names clearly (for example P32-8MGT-30, 920-8MGT-30). | Mech p.33 | `after` text | OK. |

**Errors found but not fixed (timing belts):**
- `timing_belts_shigley.js`, step `belt`: the eq chip reads "17-16b, 17-1" but the formula shown is Mott's B-form (7-13). The two are algebraically identical (B/16 = ¼[Lp − 1.57(D1+D2)]), so the chip is acceptable. Mention the equivalence or show the Mott number too.
- Table data in both files (Table 7-4 PD/flange/bushings, 7-5 bores, 7-11 CL) were spot-checked against Fizz p.22/25 and Mech p.29–30 and match.
- The `width` default (30) differs from Mech's suggested starting value of 50 (see T9).
- No numeric errors. HW1 P4 reproduces: Pdes 9.0, PD 3.208/8.020, CD 8.974, Prated 21.2, CL 1.0, SF 2.36, V 1470.

---------------------------------------------------------------------------------------------------

## Common to all three topics

- Both guides use **Mott** for V-belt and timing-belt selection and **Shigley** for flat belts (Mech p.13: "Don't use Shigley for exam questions, except for Flat Belt Questions [and] Mine Hoist Problems").
- Mech p.14: all guides are for two-pulley systems. "For systems of 3 or more pulleys, solve for 2 pulleys at a time".
