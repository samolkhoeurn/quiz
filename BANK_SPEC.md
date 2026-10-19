# Question-bank specification (data/<subject>-<nn>.js)

Audience: a Cambodian grade 9 student preparing for the national grade 9 exam (ប្រឡងសញ្ញាបត្រមធ្យមសិក្សាបឋមភូមិ).
Language: Khmer. English terms in parentheses only where the textbook itself uses them or where it helps
(e.g. "ម៉ូម៉ង់ (moment)", "photosynthesis"). Numbers and formulas in math/science use Arabic digits and standard
symbols (√, ², ³, ×, ÷, ≤, ≥, π, °, cm, m/s, N, N·m, CO₂ …). Decimal **point**, as in the MoEYS and NGS textbooks: 0.5 ; 2.25 (never a comma).

## Source books (terminology, depth and exercise style must follow these)

- Maths: សៀវភៅកិច្ចការផ្ទះ គណិតវិទ្យា ថ្នាក់ទី៩ (NGS វិទ្យាល័យព្រះស៊ីសុវត្ថិ, 2021) — 18 lessons, same order as `data/subjects.js`.
  Spellings: ការេ (not ការ៉េ), ឫសការេ/ឫសគូប, រ៉ាឌីកាល់, ជ្រុងជាប់មុំកែង, «សមីការមានឫស x = …», coordinates `A(x, y)`, segments `[AB]`.
- Physics, chemistry, biology: វិទ្យាសាស្ត្រ ថ្នាក់ទី៩ (ក្រសួងអប់រំ យុវជន និងកីឡា, 2020) is the authority; the NGS workbooks,
  MoEYS teacher's guides and the NGS biology MCQ book show the question style. Voltage is written V (P = IV, V = RI);
  chemistry groups are numbered 1–18; fuse = ភុយស៊ីប; indicators ក្រដាសទួណេសុល / ផេណុលផ្តាលេអ៊ីន; moment sign: clockwise negative.
- Do not test content these books do not teach at grade 9 (e.g. Snell's law with sines, F = BIL, antibiotics, Pythagorean-triple vocabulary).
- Every revised bank carries `rev: 2`; bump `rev` whenever a file is revised so the site prefers it over an older Firestore copy.

## File format (ES module)

```js
// <subject Khmer> ថ្នាក់ទី៩ · <ជំពូក/មេរៀន>ទី<n> · <title>
// (lesson sub-headings as comments between question groups)
export default {
  id: "math-02",            // MUST equal the file name without .js
  subject: "math",          // math | physics | chemistry | biology
  title: "សមាមាត្រ",         // exactly the official chapter/lesson title from data/subjects.js
  rev: 2,                   // file revision; a higher rev than the Firestore copy makes the site use the file
  questions: [
    { lv: 1, q: "…?", o: ["…", "…", "…", "…"], a: 2 },
    { lv: 2, q: "…?", o: ["…", "…", "…", "…"], a: 0, ex: "…" },
    { lv: 3, q: "…?", o: ["…", "…", "…", "…"], a: 1, ex: "…" },
  ],
};
```

Fields: `lv` 1 = ងាយ (recall / one-step), 2 = មធ្យម (two steps, apply a formula, interpret), 3 = ពិបាក (multi-step,
word problem, reasoning, common-trap). `q` question text. `o` exactly 4 options, all distinct, all plausible
(distractors should be typical student mistakes, not nonsense). `a` index 0–3 of the correct option. `ex` worked
explanation: **required for every lv 3**, recommended for lv 2, optional for lv 1. Write the explanation the way a
good teacher would: the key formula/idea, the computation, and why the trap answers are wrong when relevant.

## Quantity and mix per bank

- 36–45 questions per chapter (the app draws 25 at random per attempt, stratified by level, so the bank must be larger than 25).
- Mix roughly 30 % lv 1, 40 % lv 2, 30 % lv 3 (validator requires at least 20 % / 25 % / 15 %).
- Cover every lesson (មេរៀន) of the chapter; group questions by lesson with a `// ---- មេរៀនទី១ … ----` comment.
- Vary the correct answer position (roughly even spread of a = 0,1,2,3). Do not make the longest option always correct.
- No two questions may be near-duplicates. Numeric questions: vary the numbers; include at least a few realistic
  Cambodian-context word problems (riel, km between provinces, rice fields, Tonle Sap, etc.) where natural.
- Every fact and every computation must be correct — double-check arithmetic before writing the answer index.
  Explanations must agree with the marked answer.

## Scoring (handled by the app, for information)

Each attempt: 25 questions drawn; points weighted ងាយ 1 : មធ្យម 2 : ពិបាក 3 and scaled to total exactly 100.
Options are shuffled per attempt, so never write options like "ទាំង ក និង ខ" or "គ្មានចម្លើយណាត្រឹមត្រូវ" that depend on position.

## Validate before finishing

```
node scripts/validate.mjs math-02 math-03
```

must print ✓ for each bank and "0 problem(s)".

---

# English banks with LaTeX (subject `enmath`, Australian Curriculum v9.0 Year 9)

Everything above applies (format, 36–45 questions, 30/40/30 % mix, explanations on every hard question, 4 distinct
plausible options, even spread of `a`, validator must pass). Differences:

- **Language: English**, Australian spelling (metre, litre, colour, factorise), Australian contexts (dollars and cents,
  GST 10 %, km/h, AFL/cricket/netball, Sydney–Melbourne distances, a 4 L milk carton, NAPLAN-style wording).
  Decimal **point** (0.5, 2.25), thousands with a space or comma consistently (12 500).
- **Mathematics is written in LaTeX between `$…$`** and typeset by KaTeX. Examples:
  `$\sqrt{60}$`, `$\sqrt[3]{-27}$`, `$\frac{2}{3}$`, `$x^2$`, `$3 \times 10^{-4}$`, `$2^{-3}$`, `$a^m \times a^n = a^{m+n}$`,
  `$\dfrac{x+1}{2} = 5$`, `$\sin 30^\circ$`, `$\tan \theta = \frac{\text{opposite}}{\text{adjacent}}$`, `$\pi \approx 3.14$`,
  `$P(A \cap B)$`, `$\$1\,250$` (dollar sign inside maths is `\$`), `$12\,500$`, `$\le$`, `$\ge$`, `$\ne$`, `$\approx$`.
  Plain English sentences stay outside the `$…$`. Every number that is part of a calculation should be inside `$…$`
  so it is set in maths font; short counts in prose ("3 students") may stay plain.
- **A dollar sign in plain text must be escaped as `\$`** (e.g. "costs \$45"). Unescaped `$` always opens/closes maths.
- Do not use Unicode maths symbols (√ ² ³ × ÷ ≤) in these banks; use LaTeX inside `$…$`.
- No `\begin{align}`/display maths; keep each expression inline. Use `\text{…}` for words inside maths.
- Options are plain strings too and may contain `$…$`, e.g. `"$5\sqrt{2}$"`, `"$x = -3$ or $x = 5$"`.
- Each chapter must cover the Year 9 content descriptions listed for it in `data/subjects.js` (`sub` field) and should
  include a few "mathematical modelling" style word problems (AC9M9A05 / AC9M9M05) with interpretation of the answer.
- `title` must equal the chapter title in `data/subjects.js` exactly.

---

# Year 2 banks (subject `enmathy2`, Australian Curriculum v9.0 Year 2, age 7–8)

All the English/LaTeX rules above apply, with these changes for young learners:

- **Set `quizSize: 15`** in the bank object (next to `id`, `subject`, `title`) so a quiz draws 15 questions, not 25.
- **Very simple English**: short sentences, everyday words, one idea per question. A Year 2 child (or a parent reading
  aloud) must understand it. Example: "Tom has 14 marbles. He gives 6 to Mia. How many marbles does Tom have now?"
- **Every question has an `ex`**, one or two short friendly sentences that show the thinking
  ("Count on from 14: 15, 16, 17, 18. So 14 + 4 = 18."). Hard questions too, of course.
- Numbers and sums in LaTeX: `$14 + 4 = 18$`, `$36 = 30 + 6$`, `$\frac{1}{2}$`, `$\frac{1}{4}$`, `$2 \times 5$`, `$10 \div 2$`.
  Money as `\$4.50` in prose or `$\$4.50$` in maths; coins: 5c, 10c, 20c, 50c, \$1, \$2; notes \$5, \$10, \$20, \$50, \$100.
- Levels: lv 1 = recall/one step, lv 2 = two steps or a word problem, lv 3 = reasoning, comparison or a two-step word
  problem — still Year 2 difficulty, never Year 3+ content (no numbers beyond 1000, no formal multiplication beyond
  2s, 5s and 10s, no fractions other than halves, quarters, eighths).
- No pictures are available, so describe things in words ("a shape with 3 straight sides", "the hour hand points to 3
  and the minute hand points to 12", "a row of 4 apples, 3 rows").
- Use Australian contexts a child knows: school, playground, lunch box, dollars and cents, kangaroos, the beach.
- Options: 4 distinct, child-plausible answers (common slips like off-by-one, forgetting to regroup). Even spread of `a`.
- 36–45 questions per chapter, grouped by the `sub` topics with comments; title must equal `data/subjects.js` exactly.

---

# General-knowledge banks (subject `gk`, ចំណេះដឹងទូទៅ, 34 themed rounds)

- **Khmer language.** Use English (Latin script) for foreign proper nouns that have no established Khmer form or
  would be unrecognisable transliterated: people (Albert Einstein, Lionel Messi), places (Paris, Mount Everest),
  brands and works (Google, "Romeo and Juliet"). Well-known Khmer forms stay Khmer (បារាំង, ជប៉ុន, អង់គ្លេស, ទន្លេមេគង្គ).
  Pattern: Khmer sentence with the English name inline, e.g. "អ្នកណាបានសរសេរ «Romeo and Juliet»?" / "ទីក្រុង Paris ជារាជធានីនៃប្រទេសណា?".
- **Exactly 30 questions per round** and `quizSize: 30` in the bank object (a round is played in full; order and options are shuffled).
- Level mix about 35 % easy / 40 % medium / 25 % hard. Points are weighted by level in the app.
- **Every question has a short `ex`** (one sentence of context: "Angkor Wat was built in the early 12th century under Suryavarman II").
- **Facts must be stable and verifiable**: no "current" office-holders, no "latest" records that change yearly, no
  disputed claims. Prefer facts true for decades (capitals, founding years, inventors, geography, classic works, rules of sports).
  Dates for Cambodian history follow the MoEYS textbooks (e.g. independence 9 November 1953, Angkor Wat 12th century, Paris Peace Agreements 23 October 1991).
- Use Khmer digits for years and counts in prose only where natural; Arabic digits are acceptable (ឆ្នាំ 1953 or ១៩៥៣ — be consistent within a bank).
- Each round covers only its theme (title in `data/subjects.js`), with variety inside the theme; no two rounds should repeat a fact.
- 4 options, distinct and plausible (same category: four cities, four years, four people), even spread of `a`.
