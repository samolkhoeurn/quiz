# រៀនថ្នាក់ទី៩ · កម្រងសំណួរ

Practice quizzes for a Cambodian grade 9 student: the four MoEYS subjects in Khmer (31 chapters), English *Mathematics (Year 9)* (14 chapters) and *Mathematics (Year 2)* (8 chapters) subjects following the Australian Curriculum v9.0, plus the two-team general-knowledge game.

| File | What it is |
|---|---|
| `index.html`, `app.js`, `styles.css` | The learning app: student login, chapter picker, timed quizzes (answers shown only after submit), reports, admin panel |
| `firebase-config.js` | Your Firebase project settings + the admin e-mail (see `SETUP.md`) |
| `firestore.rules` | Security rules to paste into Firebase (admin = one e-mail; students see only their own data) |
| `data/subjects.js` | Subjects and their official chapter/lesson lists; `bank: true` marks chapters that have questions; `lang: "en"` gives English chapter labels, `kids: true` gives larger text |
| `data/<subject>-<nn>.js` | One question bank per chapter: `{lv, q, o[4], a, ex}` — level 1/2/3, question, options, correct index, explanation. English banks (`enmath-*`) write maths in LaTeX between `$…$`, rendered by KaTeX |
| `general.html` | The original two-team general-knowledge quiz (no login) |

Chapter lists follow the MoEYS textbooks: *កំណែលំហាត់គណិតវិទ្យាទី៩* (18 lessons), *ឯកសារស្វ័យសិក្សារូបវិទ្យាទី៩* (5 chapters),
*សៀវភៅកិច្ចការផ្ទះជីវវិទ្យាទី៩* (5 chapters), and the MoEYS e-learning chemistry outline (3 chapters).

## Interface language

The student interface is Khmer by default. In the admin panel each student has a **ភាសាអេក្រង់** setting; choosing *English* translates every student screen (buttons, labels, result page, option letters A–D, Arabic numerals). The admin panel itself stays in Khmer.

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) (diagrams render on GitHub) or the full page at [docs/architecture.html](https://samolkhoeurn.github.io/quiz/docs/architecture.html).

## Adding a chapter

1. Copy an existing file in `data/`, e.g. `data/math-02.js`, keep `id` equal to the file name.
2. Write 20–30 questions, a mix of `lv: 1/2/3`; give every `lv: 3` question an `ex` explanation.
3. In `data/subjects.js` add `bank: true` to that chapter. Commit and push.
