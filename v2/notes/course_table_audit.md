# Course-material table / chart / diagram audit

Every page of the 31 course PDFs in `v2/course/` (557 pages) was rendered into 3×3 contact sheets (70 dpi) and read;
pages with a table, chart, design-data figure or useful diagram were re-rendered at 110–200 dpi.
Catalogue pages that the course uses are cropped from the original catalogues in `/home/claude/catalogues/` (200 dpi).

Status key: **T** = same as a textbook figure already in the topic files (named) · **C** = course crop that already existed in
`v2/figures/course/` · **NEW** = cropped by this audit (file name given; all in `v2/figures/course/` unless a textbook path is shown) ·
**–** = photo / narrative / problem statement only, nothing to crop.

## Pages audited

| File | Pages | Notes |
|---|---|---|
| Flexible belts Flat and Vbelts-2024.pdf | 42 | slides |
| Flexible belts Intro and Chains-2023.pdf | 34 | slides |
| Timing Belts 2023.pdf | 15 | slides |
| Wire Rope 2025.pdf | 28 | slides |
| Gear_Kinematics_and_Forces_-2024.pdf | 45 | slides |
| Gear_Stress_2026.pdf | 52 | slides |
| Helical_Bevel_and_Plastic_Gears_with_Materaisl_Review_2025.pdf | 68 | slides |
| Worm_Gears_2024.pdf | 20 | slides |
| MECH 325 2023 Flex Drives Tutorial 1 / 2, 2025 Tutorial 3 | 5 + 6 + 5 | worked solutions with pasted Shigley tables |
| Gear Trains Tutorials 1, 2 (2025), 3 (2022), 4 (2023), 5 (2026) | 2 + 2 + 1 + 1 + 1 | problem statements / train sketches |
| Selected Tutorial Questions Module 1 (2025) / Module 2 (2023) | 30 + 38 | worked solutions (M2 scanned) |
| ME325 2025 Homework Assignment 1 Solutions | 21 | |
| 325-Midterm-2025 / Solutions | 12 + 16 | scanned |
| Module #5 Springs, Fasteners, and Linear Drives 2024 | 3 | reading guide (text only) |
| ME325 Group Project (2026) | 6 | text only; no tables |
| Fluid Power Basics Part 1 / Part 2 | 25 + 27 | scanned narrative lessons; one vacuum table, no design data |
| Fluid Power Calculation Handouts 2017 | 16 | Parker Design Engineers Handbook pages |
| Actuator Selection Handouts / mechanical motions / motor and pump hand outs | 8 + 8 + 8 | Parker handbook pages |
| Fluid Power Practice Problems | 4 | Esposito Ch 6 |
| Fluid Power Symbols | 8 | ANSI Y32.10 sheets |
| **Total** | **557** | |

## Inventory

### Flat & V-belts lecture (Flexible belts Flat and Vbelts-2024.pdf)
| Slide | Item | Used for | Status |
|---|---|---|---|
| s4 | belt drive kinematics sketch | geometry | T Mott Fig 7-4 |
| s5 | open/crossed belt geometry | wrap angles | T Shigley Fig 17-1 |
| s6–7 | belt configurations | – | T Shigley Fig 17-2 |
| s10–11 | tension diagram, F1/F2 vs Fi | tensions | T Shigley Fig 17-7, 17-8 |
| s13–14 | Table 17-4 Cp, Table 17-15 Ks ("use for flat belts") | Cp, Ks | T |
| s15 | Table 17-2 belt properties | f, t, γ, Fa | T |
| s18 | Habasit k1 % / relaxation / shaft-load charts | background, (F1)a | NEW habasit_k1_tensile_force_relaxation, habasit_shaft_load_peripheral_force |
| s19 | Habasit pulley crown height table + crown shape | pulley design | NEW habasit_recommended_crown_height, habasit_pulley_crown_guideline |
| s21 | Habasit HabaDRIVE key data (slide crop) | (F1)a per width | C flat_belt_habasit_table → full page NEW habasit_habadrive_product_key_data |
| s22–24 | V-belt wedge, belt styles, V tension diagram | – | T Shigley Fig 17-12/17-14 |
| s25 | Mott V sections + Shigley Table 17-9 | section | T |
| s26 | Mott Fig 7-13, Table 7-2 | section, length | T |
| s27 | A–D nominal V-belt selection chart | classical section | C vbelt_selection_chart_abcd |
| s28–31 | Mott Table 7-1, Fig 7-14…7-19; Shigley 17-13/17-14 | ratings, corrections | T |
| s32 | Gates Fig B1 (slide) | section | C gates_section_chart_b1 → full page NEW gates_fig_b1_b2_section_charts (B1 + B2) |
| s33 | Gates Tables B2/B3 (slide) | NEMA min sheave | C gates_nema_min_sheave_b2_b3 → NEW gates_table_b2_b3_nema_min_sheave |
| s34 | Gates Table B10 3VX ratings (slide) | Htab, ΔP | C gates_3vx_power_rating_table_b10 → NEW full ratings for every section: gates_table_b9 (3V), b10 (3VX), b11 (5V), b12 (5VX), b13 (5VP), b14 (8V), b15 (8VX), b16 (8VP), b25 (A), b26 (AX), b27 (AP), b28 (B), b29 (BX), b30 (BP), b31 (C), b32 (CX), b33 (C/CP), b34 (D) `_hp_rating` |
| s35 | course Ks × hours table | Ks | C belt_service_factor_hours; Gates Table B1 NEW gates_table_b1_service_factors |
| s36 | Gates Table B4 belt lengths (slide) | belt no. → length | C gates_belt_sizes_table_b4 → NEW gates_table_b4_super_hc_belt_lengths; classical NEW gates_table_b17…b20 belt lengths |
| s37–38 | Gates Table B6 3V drive table, worked example | CD, hp correction | C gates_3v_centre_distance_table_b6, gates_3vx_example_slide38 → full pages NEW gates_table_b6_3v_drives_p_b16 / _p_b17 |
| s39 | Formula D19, Tables D26/D27, D35 (slide) | Tst, Kφ, M, Y, span | C gates_tension_formula_d19 → full page NEW gates_d24_tensioning_d19_d26_d27 (D27 all sections), gates_formula_d35_span_length |
| s40 | Formulas D20–D23 | deflection force | C gates_deflection_formula_d20_d23 (also on NEW D24 page) |
| s41–42 | procedure | – | – |

### Chains lecture (Flexible belts Intro and Chains-2023.pdf)
| Slide | Item | Used for | Status |
|---|---|---|---|
| s3, s6–10 | drive terminology, configurations, kinematics | – | T Mott Fig 7-4 / 7-33 |
| s12 | Tsubaki roller chain construction | parts | NEW tsubaki_roller_chain_construction |
| s13–14 | chain parts, Mott Table 7-12 | pitch, strength | T |
| s15 | ANSI #50 dims / tensile / working loads (slide) | tension chains (HW1 P5) | C chain_ansi50_strength_table → NEW full Renold-Jeffrey ANSI pages for every chain no. 25…240 (renold_ansi_chain_noXX_dims_hp_rating) |
| s16–19 | chordal action, power-limit regions, Shigley eqs | – | T Shigley Fig 17-17/17-18, Tables 17-19…17-23 |
| s20 | Renold No. 50 hp table (slide) | rating | C chain_renold_no50_hp_rating (+ NEW renold_ansi_chain_no50) |
| s21 | Renold kW–rpm chart | rating | C chain_renold_power_limit_chart |
| s22–23 | Mott lubrication, Table 7-17 / 7-18 | Ks, lube | T |
| s24–28 | Renold 50 again, Shigley 17-20/22/23, CD eqs | – | T / C |
| s29–30 | Martin service factors + example | Ks | C chain_martin_* ; alternative Ks NEW tsubaki_chain_service_factors, tsubaki_rs_provisional_selection_graph |
| s33–34 | Renold safety factors, nd multipliers | nd | C chain_renold_safety_factors, chain_renold_design_factor_multipliers |

(The Renold Chain Reference PDF has no rating tables — they are in `ansi-standard-1.pdf`, the Renold-Jeffrey ANSI catalogue.)

### Timing belts (Timing Belts 2023.pdf)
| Slide | Item | Status |
|---|---|---|
| s2, s4 | belt construction, tooth profiles | T Mott Fig 7-23…7-25 (not in topic; diagrams only) |
| s5 | Gates Table No. 5 service factors | T Mott Table 7-8 (same values) + NEW gates_timing_table5_service_factors |
| s6 | Mott Fig 7-27 pitch selection | T |
| s7 | Gates Table No. 4 min sprocket PD (slide) | C timing_gates_min_sprocket_dia_table4 → NEW gates_timing_table4_min_sprocket_pd |
| s8–11 | Mott Tables 7-7, 7-9, 7-11, 7-4, 7-5 | T |

### Wire rope (Wire Rope 2025.pdf)
| Slide | Item | Status |
|---|---|---|
| s3–4 | lays, cores | T Shigley Fig 17-19 |
| s6 | Mott Table 7-25 | T |
| s7 | Wesco 6×19 FC EIPS | C wire_rope_wesco_6x19_eips |
| s8 | Wesco 6×19 IWRC | NEW wire_rope_wesco_6x19_iwrc |
| s9 | Wesco 7×7 / 7×19 aircraft cable | NEW wire_rope_wesco_7x7_7x19_aircraft |
| s10–11 | swivel note; Wesco PRO34K non-rotating | NEW wire_rope_wesco_pro34k |
| s12 | σ = Er dw/D, Shigley Fig 17-20 strength loss | T |
| s13 | full bending vs knuckle sheaves (Figs 8–10) | NEW wire_rope_full_bending_knuckle_sheaves |
| s15–20 | Shigley Tables 17-24, 17-27, 17-26, 17-25, equations | T |
| s21 | Wesco WLL slings | C wire_rope_wesco_wll_slings |
| s22 | Shigley Fig 17-21 | T |
| s23 | Wesco end-fitting efficiency ratings (also HW1 p17) | NEW wire_rope_wesco_end_fitting_efficiency |
| s25 | clips table | C wire_rope_clips_table |
| catalogue | West Coast Wire Rope p.17 D/d factors, p.22 6×19 bright | NEW westcoast_sheave_dd_bending_efficiency, westcoast_6x19_bright_fc_iwrc |

(The "Wesco Industries" slide pages are not in the West Coast Wire Rope catalogue supplied; slides 7–9, 11, 23 are therefore cropped from the lecture at 200 dpi.)

### Gear kinematics & forces (Gear_Kinematics_and_Forces_-2024.pdf)
| Slide | Item | Status |
|---|---|---|
| s6 | spur-tooth nomenclature activity (also Midterm Q14) | NEW textbook crop figures/shigley/fig13-5.png (Shigley Fig 13-5) |
| s12 | right-angle drives: helical hand / thrust bearing side | NEW gear_helical_hand_thrust_directions |
| s13, s19–22 | trains, involute, Mott Fig 8-14 / diametral pitch chart | T |
| s25–26 | contact ratio, interference eq | – (formula in topics) |
| s27 | Mott Table 8-7 min pinion teeth | NEW figures/mott/table8-7.png |
| s29–39 | spur / bevel / helical force diagrams, Ex 13-8 | T Shigley Fig 13-31/13-33/13-34/13-37, Mott Fig 8-21/8-22 |
| s41 | cost vs AGMA quality | NEW gear_cost_vs_accuracy_qv |
| s42 | AGMA Qv by accuracy level | NEW gear_agma_quality_accuracy_levels |
| s45 | cost vs number of stages | – |

### Gear stress (Gear_Stress_2026.pdf)
All charts are Shigley/Mott reproductions already in spur/helical topics (Lewis Y Table 14-2 / Mott 9-15, J Fig 14-6 / 9-17, Kv Fig 14-9 / 9-16,
Ks, Km Fig 14-10/14-11, KB Fig 14-16 / 9-14, Cp Table 14-8, St/Sc Fig 14-2/14-5, Tables 14-3/14-6, YN/ZN Fig 14-14/14-15, KR Table 14-10, CH Fig 14-12/14-13)
plus course crops C ko_shigley_vs_mott, gear_kv_q_av_table, gear_ks_course, gear_km_shigley_annotated, gear_cma_curve2, gear_yn_course_line, gear_zn_course_line, gear_stress_procedure.
s26–28 Hertz stress diagrams: – (explanatory only). Nothing missing.

### Helical, bevel, plastic, materials (Helical_Bevel_…_2025.pdf)
| Slide | Item | Status |
|---|---|---|
| s2–13 | helical geometry/J/I | T + C helical_j_modifier_example |
| s14–30 | bevel geometry, forces, factors | T + C bevel_* (5 crops) |
| s32 | Mott Table 9-14 plastic gear sat | NEW figures/mott/table9-14.png |
| s33 | Mott Table 9-15 / standard teeth | C standard_gear_teeth_table |
| s34 | "See KHK Gear Information Catalogue" | NEW khk_plastic_spur_bending_strength_t106, khk_plastic_spur_factors_surface_strength_t107, khk_plastic_bevel_worm_strength_t108 |
| s35–41 | steel review, Fe–C diagram, hardness, Fig 2-12 designation | NEW figures/mott/table2-2_fig2-6.png, figures/mott/fig2-12.png |
| s43–44 | Mott Tables 2-9, 2-8 | NEW figures/mott/table2-9.png, figures/mott/table2-8.png |
| s45–54 | hot/cold working, heat treatment charts | – (explanatory) |
| s55–64 | Mott App 3/5, Fig 9-20 case depth | T Appendix 3/5; NEW figures/mott/fig9-20.png |
| s61–68 | Shigley Table 14-3/14-6, Fig 14-2/14-5/14-12, Mott Table 10-4, roadmaps | T |

### Worm gears (Worm_Gears_2024.pdf)
s10 efficiency vs lead angle (Mott Fig 10-26: T in worm_mott, now also added to worm_shigley), s11/s19/s20 C worm_* crops, s12–13 velocity/force diagrams T (Shigley Fig 13-36/13-37), s15–18 Mott Figs 10-27…10-29 T. Nothing else.

### Tutorials, HW1, Selected Tutorial Questions, Midterm
| Source | Tables shown | Status |
|---|---|---|
| Flex Drives Tut 1–3 | Shigley Tables 17-2, 17-4, 17-11…17-17, 17-19…17-27, Fig 17-21 | T |
| HW1 Sol p5–14 | Mott Tables 7-1/7-2/7-7…7-11/7-27/7-28, Figs 7-13/7-14/7-27; Gates B1–B6, D19, D35; chain spreadsheet | T, C, NEW Gates full pages |
| HW1 Sol p17 | Wesco efficiency ratings | NEW wire_rope_wesco_end_fitting_efficiency |
| HW1 Sol p19 | clips table | C |
| Module 1 p16–23 | Gates Table B1, Fig B1/B2, B3, Table B23 (p.B191), Table B33, page D24 | NEW gates_table_b1_service_factors, gates_fig_b1_b2_section_charts, gates_table_b2_b3_nema_min_sheave, gates_table_b23_c_cp_drives_p_b191, gates_table_b33_cp_hp_rating, gates_d24_tensioning_d19_d26_d27 |
| Module 1 p26–27 | Wesco 6×19, Fig 17-21 | C, T |
| Module 2 (scanned) | Mott Table 9-2, 9-8, App 3; Shigley Figs 14-5…14-15; Table 15-8 + worm nomenclature; Mott Figs 10-25…10-29 | T |
| Midterm 2025 + Sol | Mott Table 7-1/7-2, Figs 7-13/7-15/7-17/7-18/7-19, Fig 9-9…9-22, App 3; Q14 nomenclature | T; NEW fig13-5 |
| Gear Trains Tut 1–5 | problem sketches only | – |

### Module 5 reading guide (springs, fasteners, screws, linear bearings)
Points to Thomson ball-screw catalogue pp.139–142, 146–149 (inch) / 150–153, 155–158 (metric) and the Thomson RoundRail catalogue.
| Item | Status |
|---|---|
| Thomson pp.139–142, 146–153, 157–158 | NEW thomson_ballscrew_p139…p158 (14 pages; p.155 accuracy table skipped) |
| RoundRail engineering pp.257–259 + product example pp.26–27 | NEW thomson_roundrail_p263/_p264/_p265/_p26/_p27 |
| Springs / fasteners / power screws | T (textbook sections only; no tables in the guide) |

### Bearings (no lecture deck; bible references)
| Item | Status |
|---|---|
| OILES 500SP (Fizz p.94) | T Shigley Table 12-11 + NEW oiles_500sp1_service_range_properties, oiles_500sp1_spb_bushing_sizes, oiles_operating_motion_pv |
| SKF tables (Fizz p.97/102: "SKF common for ball/roller") | NEW example pages skf_deep_groove_ball_d25_30_p272, skf_cylindrical_roller_d15_25_p516, skf_tapered_roller_d15_32_p694 |

### Fluid power handouts
| Source | Item | Status |
|---|---|---|
| Calc Handouts p2 / Actuator p1 | Parker Table b-1/b-2 push/pull forces | T (bible crops fizz_p82/p83) |
| Calc p3 / Actuator p2 | mounting styles (illus. b-1) | NEW fluid_parker_b3_mounting_styles |
| Calc p4 / Actuator p3 | mounting classes Table b-3 | NEW fluid_parker_b4_mounting_classes_stroke_table |
| Calc p5–7 | stroke factor table b-4, Graph b-1, g-chart b-2 | T (bible crops) |
| Calc p8–11 | port size / piston speed Table b-5 | T (bible crops fizz_p86/87) |
| Calc p13, p16 | motor hp c-1, starters c-5 | T (bible crops) |
| Calc p14–15 | NEMA motor frame dims, enclosures | – (not used in calculations) |
| mechanical motions p1–5 | Parker b-18…b-22 | C fluid_parker_b18…b21 |
| mechanical motions p6 | first-class lever + variation (b-23) | NEW fluid_parker_b23_first_class_lever |
| mechanical motions p7 | toggle variation, rolling/sliding loads (b-24) | NEW fluid_parker_b24_toggle_variation |
| mechanical motions p8 | lifts, hinged lever (b-25) | NEW fluid_parker_b25_lifts_hinged_lever |
| motor & pump p1–5 | c-2 motor hp, enclosures, adapters, pump selection factors | T / – |
| motor & pump p6–8 | i-8, i-9, i-10 pump calc | C i-8, i-9; NEW fluid_parker_i10_pump_calc_continued |
| Practice Problems | Esposito 6.10, Ex 6-6 | C |
| Symbols | ANSI Y32.10 | T (Mech bible symbol crops) |
| Fluid Power Basics 1/2 | narrative lessons | – |

## Counts
- Items catalogued: ≈ 200 (tables, charts, design-data figures and diagrams across the 557 pages).
- Already present: ≈ 150 (textbook figures in the topic files, or the 48 earlier course crops).
- Newly cropped: **99** course/catalogue PNGs in `v2/figures/course/` + **8** textbook crops (`figures/mott/table8-7, table9-14, table2-2_fig2-6, fig2-12, table2-8, table2-9, fig9-20`, `figures/shigley/fig13-5`).

## Not found / not cropped
- Gates Table B31 (C Hi-Power II ratings, catalogue p.240): the PDF page has a damaged embedded font (many digits missing); cropped anyway, note points to B33 (the table the course uses).
- Wesco Industries "PowerStrand" catalogue (slides 7–9, 11, 21, 23) is not among the supplied catalogues; the West Coast Wire Rope catalogue is a different company. Slide crops are used.
- Martin chain catalogue (slides 29–30) is not supplied; slide crops remain.
- KHK spur-gear catalogue, Boston Gear, SKF mounted, KBC, dc1: no course page or worked solution references a specific table; nothing cropped (project brief only says "catalogue pages" generically).
- Thomson ball-screw p.155 (accuracy / permissible travel variation) skipped — not used in any calculation.
