# Roller chains — sizing data and selection rules

Code: `topics/chains_common.js` (data + `CHAINS.*` helpers + `H.table` builders), used by `topics/chains_mott.js` and
`topics/chains_shigley.js` (both shells load `chains_common.js` first).

## Data digitised
| Data | Source | How |
|---|---|---|
| hp ratings No. 40/60/80, teeth 11–45 × rpm, lube zones | Mott Tables 7-14/7-15/7-16 (M325M PDF pp. 300–302) | PDF text layer (rotated page); stair-step lube lines read from the images; both cross-checked cell-by-cell against the Renold pages — zones identical, 10 cells differ by printing typos (each source kept as printed) |
| hp at 17 T, No. 25…240, Type A/B/C/C′ zones | Shigley Table 17-20 (M325S pp. 934–935) | typed from the crops; dashed zone lines read at 220–400 dpi |
| hp teeth × rpm, zones, min tensile / rated working load 1–6 strands, No. 25…240 | Renold-Jeffrey ANSI catalogue `ansi-standard-1.pdf` pp. 1–14 (course s15/s20; audit crops `renold_ansi_chain_noNN_*`) | PDF text layer; Type B = grey shading sampled from the rendered page |
| average / minimum tensile strength | Mott Table 7-12, Shigley Table 17-19 | as before |
| stocked sprocket counts | Shigley Table 17-21 | typed |

## Selection steps and rules
| Step | Table | Rule (★) |
|---|---|---|
| Chain × strands | strands 1–4 → smallest chain carrying P_des/factor (or, when the chain is fixed, strands of that chain) | `selrule`: Mott page default "fewest strands first" (Mott Ex 7-5, Fizz p.28); Shigley page default "smallest pitch first" (Shigley Ex 17-5). C′ (galling) and V > 9000 ft/min rejected |
| Chain number | every number with the current strands: rating at (N1, n1), capacity, ratio, lube, V | smallest pitch that passes |
| N1 | 11–25: N2, output speed, rating, capacity, PD1, V | smallest odd N1 ≥ 17 that passes |
| N2 | N1·VR ± 2 with output speed error, Table 17-21 stock | nearest integer that is stocked |
| Length | even lengths around Eq. 7-18/17-34 with CD, 30–50 p, CD ≥ 1.5 PD2, θ1 | nearest even; next even if a ≥ 30-pitch trial CD would fall below 30 |
| Tension | all numbers: tensile (Mott 7-12 / Shigley 17-19), Renold tensile & working load | smallest with strength ≥ 10 × F_w |

`rsrc` (rating source) on both pages: Mott tables / Shigley 17-20 × K1 / Renold catalogue. chain, strands, rated power (Htab, K1),
N2 and length are yellow lookups whose auto = ★, so the page works without clicking.

## Course picks reproduced
- HW1 P6 (Mott): 3 × No. 80, 24.02 hp/strand at 14 T, N2 28, 94 pitches. N1 table stars 17 T; the course's 14 T is the smallest passing count (shown).
- Mott Ex 7-5: single No. 60 (21.96 hp), 65 T, 122 pitches; Ex 7-6: 4 strands → No. 40, 104 pitches.
- HW1 P5: No. 120 (34 000 lb, SF 13.6). Shigley page with Table 17-19: No. 120 (28 000 lb, n = 11.2).
- HW1 P7 (Shigley, No. 80 given): 2 strands, N2 84 (85 not stocked), 141.7 rpm.
- Shigley Ex 17-5: 3 × No. 140 (72.4 hp, Type B), 76 pitches, C = 43.93 in.
- Tutorial 1 Q2: Htab 7.72 (now from the table), K1 1.373, Ha 34.98 hp.
- Martin example (s30): Mott tables → 1 × No. 60; Renold source → 1 × No. 50 (16.85 hp, Type B) = lecture choice.

## Differences noted
- Shigley Ex 17-5 labels the 2-strand No. 160 at 300 rpm "Type C"; Table 17-20's dashed line puts it in Type B (table shows B). Pick unaffected.
- Mott Ex 7-6 has CD 15.27 in < 1.5 × PD2 = 15.52 in, so "CD ≥ 150 % of PD2" is shown as information, not a reject.
- Saved sessions from before this change keep the old default chain 60 / 1 strand as typed values; Reset restores the autos.
