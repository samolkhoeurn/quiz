# Question-bank specification (data/<subject>-<nn>.js)

Audience: a Cambodian grade 9 student preparing for the national grade 9 exam (ប្រឡងសញ្ញាបត្រមធ្យមសិក្សាបឋមភូមិ).
Language: Khmer. English terms in parentheses only where the textbook itself uses them or where it helps
(e.g. "ម៉ូម៉ង់ (moment)", "photosynthesis"). Numbers and formulas in math/science use Arabic digits and standard
symbols (√, ², ³, ×, ÷, ≤, ≥, π, °, cm, m/s, N, N·m, CO₂ …). Decimal comma as in Khmer textbooks: 0,5 ; 2,25.

## File format (ES module)

```js
// <subject Khmer> ថ្នាក់ទី៩ · <ជំពូក/មេរៀន>ទី<n> · <title>
// (lesson sub-headings as comments between question groups)
export default {
  id: "math-02",            // MUST equal the file name without .js
  subject: "math",          // math | physics | chemistry | biology
  title: "សមាមាត្រ",         // exactly the official chapter/lesson title from data/subjects.js
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
