# Textbook alignment audit — October 2026

Every Khmer question bank was checked page by page against the official books:

- **Maths**: សៀវភៅកិច្ចការផ្ទះ គណិតវិទ្យា ថ្នាក់ទី៩ (NGS វិទ្យាល័យព្រះស៊ីសុវត្ថិ, 1st edition 2021, 335 pages). Its 18 lessons match the 18 chapters exactly.
- **Physics, chemistry, biology**: វិទ្យាសាស្ត្រ ថ្នាក់ទី៩ (MoEYS student textbook, 2020 printing, 321 pages), cross-checked with the NGS workbooks for the three subjects, the MoEYS teacher's guides (physics, chemistry), the NGS biology MCQ book and two collections of physics exam papers. Chapter lists match exactly.

Site-wide changes: decimal **point** instead of comma (all books use it); book spellings (ការេ, ជ្រុងជាប់មុំកែង, ឫសការេ/ឫសគូប, ម៉ូត, ភុយស៊ីប, ក្រដាសទួណេសុល, ប្រូតូសូអ៊ែ …); coordinates written `A(x, y)`; voltage written V (P = IV); chemistry groups 1–18; off-syllabus questions removed; book sub-topics that had no questions filled in. Each revised file carries `rev: 2`; the site prefers it over an older Firestore copy until the admin presses «ធ្វើបច្ចុប្បន្នភាព … ពីឯកសារ» in the question manager.

| Bank | Before | After | Edits | Removed | Added | Audit verdict (before revision) |
|---|---|---|---|---|---|---|
| math-01 | 29 | 50 | 20 | 1 | 22 | Needs edits |
| math-02 | 42 | 47 | 19 | 15 | 20 | Needs edits (substantial). |
| math-03 | 41 | 49 | 13 | 12 | 20 | Needs rewrite (about 40% of the bank). |
| math-04 | 42 | 52 | 10 | 3 | 13 | Needs edits. |
| math-05 | 43 | 50 | 12 | 5 | 12 | Needs edits. |
| math-06 | 43 | 47 | 9 | 5 | 9 | Needs edits. |
| math-07 | 39 | 45 | 7 | 4 | 10 | Needs edits. |
| math-08 | 41 | 49 | 15 | 2 | 10 | Needs edits. |
| math-09 | 39 | 50 | 38 | 2 | 13 | Needs edits. |
| math-10 | 41 | 50 | 29 | 0 | 9 | Good — minor edits. |
| math-11 | 41 | 50 | 40 | 0 | 9 | Needs edits. |
| math-12 | 45 | 50 | 21 | 4 | 9 | Needs edits. |
| math-13 | 42 | 48 | 10 | 10 | 16 | Needs rewrite (major). |
| math-14 | 40 | 50 | 22 | 2 | 12 | Needs edits |
| math-15 | 42 | 47 | 19 | 7 | 12 | Needs edits |
| math-16 | 41 | 49 | 24 | 6 | 14 | Needs edits. |
| math-17 | 43 | 48 | 4 | 12 | 17 | Needs edits |
| math-18 | 43 | 50 | 34 | 5 | 12 | Needs edits |
| physics-01 | 25 | 44 | 15 | 1 | 20 | Needs edits + many additions. |
| physics-02 | 45 | 45 | 23 | 8 | 8 | Good content, needs edits. |
| physics-03 | 39 | 50 | 26 | 1 | 12 | Needs edits |
| physics-04 | 42 | 50 | 34 | 2 | 10 | Needs edits. |
| physics-05 | 44 | 51 | 32 | 7 | 14 | Needs edits (borderline rewrite for lesson 3). |
| chemistry-01 | 25 | 50 | 17 | 3 | 28 | Needs edits + many additions. |
| chemistry-02 | 45 | 51 | 26 | 5 | 11 | needs edits |
| chemistry-03 | 44 | 51 | 32 | 5 | 12 | needs edits |
| biology-01 | 26 | 49 | 18 | 0 | 23 | Needs edits + many additions. |
| biology-02 | 44 | 48 | 31 | 5 | 9 | Needs edits. |
| biology-03 | 40 | 50 | 34 | 7 | 17 | Needs edits |
| biology-04 | 44 | 50 | 28 | 13 | 19 | Needs rewrite (large additions). |
| biology-05 | 40 | 46 | 28 | 8 | 14 | Needs edits (moderate). |

## Per-chapter verdicts

### math-01

**Needs edits** (not a rewrite): what is there is mathematically sound and matches the book's topics, but it covers only
the first half of the lesson; division of radicals, bringing a number into a radical, sums/differences with coefficients,
cube-root operations, numeric values, powers and the cylinder/comparison problems are absent, and the spelling/decimal
conventions differ from the book. Three most important fixes: (1) add the missing sub-topics ៣ខ, ៣ឃ, ៣ង, ៣ច with cube
roots and coefficients (22 additions → 50 questions, 30/40/30); (2) switch this bank to the decimal point and the
spelling ការេ / រ៉ាឌីកាល់ / បំបាត់រ៉ាឌីកាល់ពីភាគបែង as the book writes them; (3) replace [9], remove [28], and fix
the answer-position skew (no a = 3).

### math-02

**Needs edits (substantial).** The mathematics is sound and the percent part matches the book well, but a third of the
bank (direct/inverse proportion, map scale, sharing in ratio) is not in this lesson, while the book's compound-interest
formula, unit conversions, «percent of a percent» and loan profit/loss problems are absent. Notation differs on every
numeric item (decimal comma, «30 %»).
Top 3 fixes: (1) remove the 15 off-syllabus questions and add the 20 book-type questions in the patch (compound
interest P_t = P₀(1 + r)^t, find n, reverse percent, unit conversion, ex ៩/១០ types); (2) switch to the decimal
point and «N%»; (3) make proportion word problems show the book's «a/b = c/d ⇒ ad = bc» set-up.

### math-03

**Needs rewrite (about 40% of the bank).** Nine questions are monomial/polynomial vocabulary the book never
teaches, while the book's two biggest blocks — rational expressions (§៣, 15 of the 38 exercises) and the cube
formulas — have zero questions, and trinomial factorisation (34 book items) has one. What remains (expansion, square
formulas, common factor, a² − b²) is correct and well written.
Top 3 fixes: (1) add rational-expression questions (simplify, ×, ÷, +, evaluate at a value) and cube-formula
questions; (2) replace the 12 off-book items with trinomials by វិធីគុណខ្វែង / វិធីបំពេញនិងបន្ថយតួ and «find a» items;
(3) fix spelling/notation: និទស្សន៍, × instead of ·, ការេ, decimal point.

### math-04

**Needs edits.** Linear equations, fraction equations and word problems are correct and close to the book's style; but
two whole book sections — §៣ «សមីការដែលអង្គទីមួយជាផលគុណនៃកត្តា» (A × B = 0, 9 + 6 + 5 exercises) and §៤ quadratics
by factoring with ឫសឌុប — have no questions at all, and the «infinitely many roots» wording differs from the book.
Top 3 fixes: (1) add product-of-factors / factored-quadratic questions (patch adds 7); (2) replace the trivial
one-step items with book-type word problems (legs count, transfer, two-digit number) and an unknown-in-denominator
item; (3) adopt the book's phrases «សមីការមានឫសច្រើនរាប់មិនអស់», «ភាគបែងរួមគឺ … លុបភាគបែងចោល», decimal point and h / km/h.

### math-05

**Needs edits.** The solving questions are correct and in the book's spirit, but the bank has no «ប្រព័ន្ធវិសមីការ» (book §៣, 6 exercises), uses the decimal comma where the book uses the point, and describes number lines / degenerate cases with words the book does not use.
Top fixes: (1) add systems of two inequalities with «តំបន់ប្រសព្វគ្នា / ប្រព័ន្ធវិសមីការគ្មានចម្លើយ»; (2) switch to the decimal point and to the book's phrases «វិសមីការមានចម្លើយគ្រប់តម្លៃ x», «វិសមីការគ្មានចម្លើយ», «រង្វង់ក្រចក / ឃ្នាប», «ទិសដៅផ្ទុយ»; (3) remove the interval-notation question and add book-style word problems (bank notes, consecutive odd integers, triangle side).
Patch: 11 edits, 5 removals, 12 additions → 50 questions (lv1 12 / lv2 20 / lv3 18).

### math-06

**Needs edits.** The frequency / cumulative-frequency arithmetic is correct and matches the book's definitions (f↓ = ប្រេកង់សរុប − …), but 5 questions are on topics the book does not teach in this lesson (population/sample, tally marks, class-width rule), the book's own definitions of f↑ / f↓ and the «ក្រាបនៃពហុកោណ» are never asked, and several terms differ (ប្រេកង់ធៀបកើន → ប្រេកង់កើនធៀប, ទទឹងថ្នាក់ → ប្រវែងចន្លោះ, English glosses).
Top fixes: (1) remove the 5 off-syllabus questions; (2) align terminology to the book (ប្រេកង់សរុប, ប្រេកង់កើនធៀប f↑%, ប្រវែងចន្លោះ, no English); (3) add book-style class-table reading questions (last 30 minutes, less than 15 minutes, unequal age classes) and the f↑ / f↓ / polygon definitions.
Patch: 9 edits, 5 removals, 9 additions → 47 questions (lv1 13 / lv2 20 / lv3 14).

### math-07

**Needs edits.** Arithmetic is sound and the three measures are well covered for raw lists, but the bank spells «ម៉ូដ» where the book writes «ម៉ូត», contains 4 questions outside the book's lesson (range ×2, percentage weights, outlier concept), and barely covers the book's §៤ខ grouped-data method (ថ្នាក់ម៉ូត, ថ្នាក់នៃមេដ្យាន from the cumulative table, x̄ by ផ្ចិតនៃថ្នាក់).
Top fixes: (1) ម៉ូដ → ម៉ូត everywhere and drop «មធ្យមនព្វន្ត / មធ្យមថ្លឹង / មេគុណ»; (2) remove the range and weighted-percentage questions; (3) add grouped-data questions (modal class, median class via f↑, mean by class midpoints) and recall items for Me / (n + 1)/2.
Patch: 7 edits, 4 removals, 10 additions → 45 questions (lv1 15 / lv2 16 / lv3 14).

### math-08

**Needs edits.** All probabilities are computed correctly and the ករណីស្រប/ករណីអាច wording matches the book, but the coin vocabulary (ក្បាល vs the book's មុខ H / ខ្នង T), «បាល់» vs «ឃ្លី», the missing «ប្រូបាបបំពេញ P′» formula, and the thin coverage of the book's §៣ counting rule, two-way/frequency tables and two-draw problems (ទី ៧–១២) make it feel foreign to a student of this book; 3 playing-card questions are off-syllabus.
Top fixes: (1) rewrite coin questions with H/T and bags with ឃ្លី, state complements as P + P′ = 1; (2) add k₁ × k₂ × … counting items, a frequency-table probability, a two-draw (pairs) and a spinner-twice problem; (3) drop two of the three playing-card questions and give probabilities as fractions.
Patch: 12 edits, 2 removals, 10 additions → 49 questions (lv1 14 / lv2 19 / lv3 16).

### math-09

**Needs edits.** The mathematics is sound and the two formulas are covered abundantly, but the bank's notation (semicolon coordinates, decimal commas, «អង្កត់ AB», ការ៉េ) differs from the book on every question, and the book's §៣ exercise families on circles, quadrilateral classification by sides/diagonals, inverse midpoints and midpoint-parallelogram proofs are nearly absent.
Top fixes: (1) switch to «(x, y)», decimal point, fractions for halves and «[AB]»; (2) add circle/diameter, square-vs-rhombus and Varignon-type items (done: 13 additions); (3) drop the two off-lesson coordinate-recall items and lower [10] [11] to lv1.
Patch: 37 edits (22 notation-only, 15 substantive), 2 removals, 13 additions → 50 questions (lv1 14 / lv2 20 / lv3 16).

### math-10

**Good — minor edits.** Every answer checks out, the slope / intercept / parallel / perpendicular material matches the book's ចំណាំ closely, and the application items ([8] [37] [38]) echo §៣. What differs is surface notation ((x ; y), decimal commas), two vocabulary items (ផ្ដេក → ដេក, មេដ្យាទ័រ → ខ្សែមេដ្យាទ័រ), and thin coverage of the book's two-point formula, ខ្សែមេដ្យាទ័រ, general-form slopes and base-year models.
Top fixes: (1) notation sweep «(x, y)» + decimal point / fractions; (2) add the two-point form, a ខ្សែមេដ្យាទ័រ item, general-form slope/pair items and a 1990-base-year model (done: 9 additions); (3) rename ផ្ដេក/មេដ្យាទ័រ.
Patch: 28 edits (21 notation-only, 7 substantive), 0 removals, 9 additions → 50 questions (lv1 14 / lv2 20 / lv3 16).

### math-11

**Needs edits.** The bank's systems, solutions and word problems are all correct and of the right kind (prices, banknotes, ages, rectangle, boat), but a student of this book would miss the vocabulary: «គូចម្លើយមួយគត់ / គ្មានគូចម្លើយ / ច្រើនរាប់មិនអស់», «ត្រួតលើគ្នា», the named methods «វិធីជំនួស» and «វិធីបូកបំបាត់», the answer form «x = …, y = …» and the «តាង x, y» step; three of the book's exercise types (Ax + By = c through two points, 1/x–1/y systems, parallel growth table) were absent.
Top fixes: (1) adopt the book's solution-count wording and «x = …, y = …» answers; (2) name the methods and write word-problem explanations as «តាង x, y → ប្រព័ន្ធ → ដោះស្រាយ → ផ្ទៀងផ្ទាត់»; (3) add the three missing exercise types plus pair-checking and m/n-parameter items (done: 9 additions).
Patch: 40 edits (12 notation-only, 28 substantive), 0 removals, 9 additions → 50 questions (lv1 14 / lv2 19 / lv3 17).

### math-12

**Needs edits.** Mathematics sound; theorem/converse/square/equilateral well covered, but wording differs from the book and two application sub-topics are absent. Top fixes: (1) add ប្រលេពីប៉ែតកែង/cube/cone and ត្រីកោណកន្លះសម័ង្ស plus radical-sided triangles; (2) global pass ជ្រុងជាប់មុំកែង, ការេ, decimal point; (3) remove [20] [21] [18] [6], reword [16]. Patch: 21 edits, 4 removals, 9 additions → 50 questions (14/21/15).

### math-13

**Needs rewrite (major).** The chord/tangent core is correct and well covered, but a fifth of the bank is a different lesson (circle measurement) and four of the book's seven headings have no question. Top fixes: (1) add ទីតាំងរង្វង់ and បន្ទាត់ប៉ះរួម; (2) add ចតុកោណចារឹកក្រៅរង្វង់ and tangent ∥ chord; (3) remove [33]–[41], switch to decimal point and the book's wording. Patch: 9 edits, 10 removals, 16 additions → 48 questions (14/21/13).

### math-14

**Needs edits** (no wrong answers; terminology and coverage gaps). After the patch: 40 − 2 + 12 = 50 questions, mix 15/19/16.
Top fixes: (1) add the three missing theorem families — exterior angle of a cyclic quadrilateral (ចំណាំ ៤.២), មុំក្នុងរង្វង់ (½ sum)
and មុំក្រៅរង្វង់ (½ difference) — which the book's exercises 4, 5, 8, 9, 12, 13, 17, 21 depend on; (2) replace «ទល់នឹងធ្នូ»
by the book's «ស្កាត់ដោយធ្នូ» and drop English glosses; (3) switch decimals to the point and remove the two
duplicates/off-lesson items [6], [15].

### math-15

**Needs edits** (mathematics correct, but a third of the bank — midsegment, Varignon, shadows — is not in this lesson of the
book, while the book's own headline configuration, several parallels on two transversals, has only two questions).
After the patch: 42 − 7 + 12 = 47 questions, mix 13/21/13.
Top fixes: (1) remove the midsegment/Varignon/shadow block and add parallel-transversal (ex. 6 style) and trapezoid
(ចំណាំ ៣.២) questions; (2) switch every decimal comma to the point as the book does; (3) de-duplicate [16]/[17] and
[23]/[24], and replace the meaningless distractor in [12].

### math-16

**Needs edits.** The mathematics is sound (all 41 answers verified), but the bank speaks a different dialect: «ផលធៀបភាពដូចគ្នា» instead of the book's «ផលធៀបដំណូច», «មុំ-មុំ» instead of «ករណី ម.ម», decimal commas instead of the book's points, and it spends 11 questions on map scale and k² (lesson-18 material) while giving only 2 to the book's §៣ metric relations (h² = mn, c² = am, bc = ah, 1/h² = 1/b² + 1/c²) and none to the circle/segment-division/similar-cone exercises that fill 20 of the 24 pages.
Top fixes: (1) adopt ផលធៀបដំណូច / ករណី ម.ម, ជ.ម.ជ, ជ.ជ.ជ and decimal points; (2) remove the 4 map-scale items and 2 redundant k² items; (3) add §៣ right-triangle relations, half-circle CD ⟂ AB, chord and tangent–secant computations, segment division a/b, and the similar-cone volume ratio.
Patch: 24 edits, 6 removals, 14 additions → 49 questions (lv1 14 / lv2 21 / lv3 14).

### math-17

**Needs edits** (structural). Everything the bank says about polygons is correct and in the book's own words, but 11 of 43 questions are off-lesson (special quadrilaterals, hexagon area) while the book's §១ definitions and its favourite exercise shapes — «find x from labelled angles», exterior angles «y, 2y, …», and the comparative regular-polygon problems (ទី ១២, ១៣, ១៦, ១៩, ២០) — are thin or absent.
Top fixes: (1) remove [32]–[42] and one redundant diagonal question; (2) add §១ recall (definition «ខ្សែកាច់បិទជិត», convex/concave, សត្តកោណ, regular definition) and labelled-angle problems; (3) add the book's comparative regular-polygon items (interior + exterior sum, exterior compared with octagon/nonagon, interior − exterior).
Patch: 4 edits, 12 removals, 17 additions → 48 questions (lv1 15 / lv2 20 / lv3 13).

### math-18

**Needs edits** (and a missing sub-topic). The formula questions are correct and at the right level, but the bank reads like a generic solids chapter: «ស្វ៊ែរ», «ជើងកោន», «កម្ពស់ទេរ», «ផ្ទៃក្រឡាសរុប», «ព្រីសកែង», π ≈ 3,14 with commas — none of which is how this book writes — and §២ (area ratio = square of the ratio, volume ratio = cube of the ratio, plans/photos/similar cones and pyramids) is entirely absent while 5 questions compute cylinder/prism/cube surface areas the book never teaches.
Top fixes: (1) rename to ស្វ៊ែ/ប៊ុល, ជនេត្រ, អាប៉ូតែម, ផ្ទៃក្រឡាទាំងអស់, ប្រលេពីប៉ែតកែង and switch to the decimal point; (2) add §២: k² and k³ statements and applications (butterfly triangles, photo/plan scale, two cones, pyramid cut at SA′ = ½SA, machines); (3) remove the surface-area-of-cylinder/cube/prism items.
Patch: 32 edits, 5 removals, 12 additions → 50 questions (lv1 14 / lv2 20 / lv3 16).

### physics-01

**Needs edits + many additions.** The arithmetic is sound, but the bank is small and about 40 % of the items use vocabulary the book does not. Three most important fixes: (1) sign convention of moments — [12] must key ម៉ូម៉ង់អវិជ្ជមាន for clockwise; (2) add the lesson-1 content the book stresses (position of the resultant d₂/d₁ = F₁/F₂, several parallel forces, bridge/support decomposition) and lesson-3 content (plumb-line method, សប់/មិនសប់/គ្មានលំនឹង, map-of-Cambodia and roof-load applications); (3) switch to the book's vocabulary (លំនឹងសប់, ខ្សែឈរនៃទីប្រជុំទម្ងន់, ប្លង់បាតទ្រ, ខ្សែសកម្មនៃកម្លាំង, ដងថ្លឹង) and remove the cosine-law item [7]. Patch: 15 edits, 1 removal, 20 additions → 44 questions (lv1 14 / lv2 19 / lv3 11).

### physics-02

**Good content, needs edits.** Every computation checked is correct and the lever / inclined plane / pulley / efficiency lessons are well covered; the main faults are vocabulary and classification. Three most important fixes: (1) relabel the wheel-and-axle items [20] [22] [23] [26] [27] as **ត្រីយ** and give កង់យោង the book's belt-wheel meaning; (2) fix [7] (class-1/2 "save force" conflict with the book) and use the book's efficiency vocabulary (កម្មន្តបានការ / កម្មន្តសរុប / កម្មន្តមិនបានការ, no «W_j»); (3) add the missing book topics — lever work conservation, wedge, bicycle ថាសឈ្នាន់/លីប, belt-wheel speed/MA, «MA = ចំនួនខ្សែទ្របន្ទុក», class-3 example — and switch to the decimal point. Patch: 23 edits, 8 removals, 8 additions → 45 questions (lv1 16 / lv2 17 / lv3 12).

### physics-03

**Needs edits** (no rewrite): the bank's physics and arithmetic are correct and its topics track the two lessons well, but its notation (U, decimal comma, ហ្វុយស៊ីប) differs from the textbook on almost every formula question, and a handful of items use off-book devices/terms (LED, ឌីសហ្សង់ទ័រ, two-way switch, wire gauge). Three most important fixes: (1) switch voltage symbol U → V and decimal comma → point throughout, and spell ភុយស៊ីប; (2) remove [32] and reword [30],[33],[34],[37],[38] to the book's own wording and devices; (3) add the missing §1.5 items (Q = mcΔt, R = P/I², RI²t = mcΔt, q = It) and the lesson-2 facts (50 Hz, ខ្សែណឺត, switch-on-neutral consequence, three causes, fuse-fault scenario) — 12 additions bring the bank to 50.

### physics-04

**Needs edits.** All five lessons are covered at roughly the right depth and the arithmetic is correct, but the bank imports grade-11 material (F = BIL, tesla, ampere-turns, angle dependence) and uses many non-textbook terms. Top fixes: (1) remove/rewrite the formula-based items 19, 22, 14, 18, 20 in favour of the book's qualitative factors and hand-rule questions; (2) switch to the book's vocabulary — ស្ពៀ, វិធានកណ្តាប់ដៃស្តាំ/វិធានដៃឆ្វេង, ដែកសុទ្ធ, កុំមុយតាទ័រ/ជ្រាស, របុំបឋម/របុំមធ្យម, ស្ទឹក/ស្ទឺវ៉ុលទ័រ, ផារ៉ាដេ, ទ្រនិច, Vp/Vs/Np/Ns, decimal point; (3) add the missing sub-topics (ទង្វើមេដែក, field-strength factors, frame equilibrium, induction right-hand rule) and replace [31], whose answer conflicts with the textbook's wording.

### physics-05

**Needs edits (borderline rewrite for lesson 3).** Lessons 1, 2 and 4 are well covered, but 8 of 44 items test content the grade-9 book does not teach (Snell's law, critical angle, eye defects, signed lens distances, half-height mirror), one item [3] is factually wrong, and the image vocabulary (និម្មិត/ត្រង់/ច្រាស) differs from the book's (មិនពិត/ឈរត្រង់/ឈរបញ្ច្រាស) in a dozen questions. Top fixes: (1) remove 29, 30, 31, 42, 39, 20, 10 and replace them with book-level items (pinhole sizes, concave-mirror cases, headlamp focus, diamond index, real depth, periscope, lens definition); (2) correct [3] (translucent = ស្រអាប់) and the ម្លប់/ស្រមោល distinction in [6]; (3) adopt the book's image terminology, elements (O, C, F, OF = ½OC), colour names (លំខាក, ស្ពិច) and decimal point, and keep the lens equation only in lv 3 items tied to the review exercise.

### chemistry-01

**Needs edits + many additions.** The 25 existing items are mostly factually right, but 4 are off-book (10, 17, 21, 22), the group notation (IA/VIIA…) and several key terms (ម៉ង់ដេឡេអេវ, លេខអាតូមិក, វ៉ាឡង់, រចនាសម្ព័ន្ធ) differ from the textbook, and the whole of L2 (alkali metals, halogens, noble gases — properties, uses, data tables, the Na + H₂O equation) and L1 §4 (using the table: Si/C, Sr/Ca, Li batteries) are almost absent.
Top 3 fixes: (1) remove 10, 17, 22 and re-target 21 to the book's metal→non-metal period trend; (2) switch all group labels to ក្រុម 1/2/17/18 and adopt the book's terms (មិនដេលេយេវ, លេខអាតូម, អេឡិចត្រុងស្រទាប់ក្រៅ, ទម្រង់អេឡិចត្រុង, ស្រទាប់ផ្អែត); (3) add the 28 questions in the patch covering L2 (groups 1, 17, 18: properties, tables, uses, 2Na + 2H₂O → 2NaOH + H₂) and L1 §4.
Note: the chemistry textbook uses a decimal point (0.53 g/cm³); the patch follows the book — convert to a comma only if the project enforces it globally.

### chemistry-02

Needs edits. Facts and equations in the bank are almost all correct, but the vocabulary is not the textbook's (អាឡូត្រូព, ក្រាហ្វីត, ឆេះពេញលេញ, លីតមុស, ស័ង្កសី, -ិក acid names, "reducing agent") and two preparations (KMnO₄) plus several contexts (hemoglobin, adsorption, greenhouse, activity series) are outside the book, while book-core topics (C + CuO, carbonates, ថ្មកំបោរ → កំបោររស់/ងាប់, Fe → Fe₃O₄, industrial O₂/H₂, ចំហេះច្រាល/ដំ, metal + water) have no questions.
Top 3 fixes: (1) rename every term to the book's spelling (សណ្ឋានវិសមរូប, ក្រាភីត, ចំហេះសព្វ/មិនសព្វ, រេដុកទ័រ/អុកស៊ីតករ, សង្ក័សី, អាស៊ីតក្លរីឌ្រិច, ស៊ុលផាត); (2) replace the KMnO₄ items [20],[28] with the book's H₂O₂ and HgO, and fix [25] (ចំហេះ) and [35] (collected over water); (3) add the missing book topics (11 new questions in the patch; bank becomes 51 questions).

### chemistry-03

Needs edits (substantial). The bank's chemistry is mostly right, but it reads like a generic textbook rather than the MoEYS one: wrong indicator names and colours (លីតមុស, ភេណុលតាលេអ៊ីន ផ្កាឈូក, universal indicator), wrong lime names (កំបោរឆៅ/ទុំ), non-book acid spellings, «អព្យាក្រឹតកម្ម/អព្យាក្រឹត» instead of «បន្សាប/ណឺត», one wrong reaction ([21] Mg + HNO₃ → H₂), five valence-formula items, and the whole salt-reactions section (salt + metal/acid/base/salt), base definition, base + acid oxide/ammonium salt, concentrated H₂SO₄, acid uses and molar concentration are absent.
Top 3 fixes: (1) terminology sweep to the book's words (ទួណេសុល, ផេណុលផ្តាលេអ៊ីន → ក្រហម, បន្សាប, ណឺត, បាសអាល់កាលី, កំបោររស់/កំបោរងាប់, -ិច acids, ស៊ុលផាត); (2) replace [19], [21], [36], [39] and the surplus valence items with book experiments/exercises; (3) add the salt-reaction, base and C_M questions (12 new questions in the patch).

### biology-01

**Needs edits + many additions.** What exists is factually sound, but it is a generic photosynthesis quiz: ~40 % of the book's content (three tissue types, spongy mesophyll, venation, the two stages of photosynthesis and of respiration, the O₂ and CO₂ experiments, the numeric factors, root respiration/ploughing, chapter-review applications) is absent, several key terms differ from the textbook (កោសិកាឆ្មាំ, ប៉ាលីសាដ, សរសៃស្លឹក, កាបូនឌីអុកស៊ីត, ស្នូល, ស្វាយជីព), and the answer sits at position 1 in 69 % of questions. Top fixes: (1) terminology sweep to the book's words; (2) rewrite the photosynthesis equation in the book's 6CO₂ + 12H₂O form and drop the aerobic/fermentation wording; (3) add the 23 questions in the patch covering the missing lessons.

### biology-02

**Needs edits.** Coverage of neurons, CNS and reflexes is good and the reasoning questions are well made, but the bank consistently uses non-textbook vocabulary (ដេនឌ្រីត, ចលនាឆ្លុះ/រង្វង់ឆ្លុះ, អ្នកទទួល, ភ្នាសខួរ, ទឹកខួរឆ្អឹងខ្នង, សរសៃប្រសាទក្បាល) and five questions test content the book never teaches (myelin ×2, hypothalamus, dopamine, reflex centres in the brainstem). Top fixes: (1) terminology sweep to the book's words (ដង់ឌ្រីត, រេផ្លិច/ធ្នូរេផ្លិច, ធ្មួល, ស្រោមខួរ/ទឹកខួរ, សរសៃប្រសាទលលាដ៍ក្បាល); (2) remove [6], [12], [21], [40], [42] and simplify [8], [11], [20], [26] to the book's explanations; (3) add the missing book topics — nerve structure, impulse speed, drugs (នីកូទីន, កាហ្វេអ៊ីន), polio, the doctor's knee-jerk test, the chapter-review «hit on the back of the head» question.

### biology-03

**Needs edits** (large terminology pass + 7 removals + 17 additions; no rewrite). The bank is scientifically sound and the
right difficulty, but it was written in Western-textbook vocabulary (lysozyme, HCl, histamine, CD4, macrophage, cilia,
«ជួរការពារ», «កោសិកាឈាមស», «កោសិកាចងចាំ», «អណ្តើក») that a MoEYS student will not recognise, and it skips two book sections.
Three most important fixes:
1. Adopt the book's terms everywhere: របាំងការពារទីមួយ/ទីពីរ/ទីបី, សារពាង្គកាយ, គោលិកាស, តំណែងរលាក, ការឡើងកម្តៅ, រោមញ័រ, ឡាំផូស៊ីត B/T លំនឹក, ផាល, សិប្បនិមិត្ត, យថាប្រភេទ.
2. Add the missing book content: the four stages of តំណបស៊ាំ (lesson 2 objective 1), អាំងទែផេរ៉ុង, and វិធីថែរក្សាសុខភាព (30 នាទី exercise, 9–10 ម៉ោង sleep, hygiene habits).
3. Remove off-syllabus items (monocytes, thymus, allergy, HIV transmission [ជំពូក4], antigenic drift, transplant rejection, autoimmunity) and replace lysozyme/histamine/CD4 facts with the book's wording and numbers (40 °C / 45 °C).

### biology-04

**Needs rewrite (large additions).** Lesson 1 is covered reasonably but with wrong/foreign terminology; Lesson 2's two biggest sections
— ជំងឺកាមរោគ (5 diseases) and ជំងឺអេដស៍ (10 pages, 6 of the 10 chapter-end MCQs) — have **zero** questions, while 12 questions cover
material the book never teaches (dengue ×6, antibiotics ×3, BMI ×2, worms). Three most important fixes: (1) add STD + AIDS questions
(pathogen names, 3 stages, 3 routes/non-routes, prevention, «ស្រោមអនាម័យមិន 100 %»); (2) remove the dengue/antibiotic/BMI/worm items and
replace with book content (virus structure, bacteria shapes/toxins, អាមីប, សាឌីយ៉ា, ទល់លាមក, ជំងឺស្លេក, មហារីក causes, លើសឈាម cause);
(3) switch to the book's vocabulary (ប្រូតូសូអ៊ែ, ប្លាស្មូដ្យូម, កោសិកាធ្មល, សម្ភារៈតំណពូជ, សំបកប្រូតេអ៊ីន, ភ្នាសគ្រោង, ណ្វៃយ៉ូ, មូសដែកគោលញី, ស្រែង).

### biology-05

**Needs edits (moderate).** The bank's reasoning questions are good and mostly on-topic, with strong Cambodian context, but 7 items cover material
outside the chapter (dams ×3, noise ×2, biodiversity ×2) and the chapter's **air-pollutant catalogue (SO₂, NO, សំណ, មេតាន/អ៊ីដ្រូកាបូ) and its prevention list
are almost absent**, as are the book's basic frames (3 human actions, 3 waste forms, សំណល់បំបែកបាន/មិនបាន, thermal pollution). Top fixes:
(1) add the pollutant-by-pollutant questions (source + health effect) and the prevention measures (trees, unleaded fuel, zoning, catalytic converter);
(2) remove dams/noise/biodiversity and replace with the book's frames (3 actions, 3 waste forms, renewable cycle, biodegradable vs not, thermal pollution, compost);
(3) align vocabulary: ស្ពាន់ធ័រឌីអុកស៊ីត, អាសូតអុកស៊ីត, អូសូន, ក្លរ៉ូភ្លុយរ៉ូកាបូន, ខ្សែអាហារ, «ទប់បង្ហាងកម្តៅ → បម្រែបម្រួលអាកាសធាតុ», book definition of ការបំពុល.

