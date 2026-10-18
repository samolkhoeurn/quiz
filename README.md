# រៀនថ្នាក់ទី៩ · កម្រងសំណួរ

Practice quizzes for a Cambodian grade 9 student (MoEYS curriculum) in Khmer, plus the two-team general-knowledge game.

| File | What it is |
|---|---|
| `index.html`, `app.js`, `styles.css` | The learning app: student login, chapter picker, timed quizzes (answers shown only after submit), reports, admin panel |
| `firebase-config.js` | Your Firebase project settings + the admin e-mail (see `SETUP.md`) |
| `firestore.rules` | Security rules to paste into Firebase (admin = one e-mail; students see only their own data) |
| `data/subjects.js` | Subjects and their official chapter/lesson lists; `bank: true` marks chapters that have questions |
| `data/<subject>-<nn>.js` | One question bank per chapter: `{lv, q, o[4], a, ex}` — level 1/2/3, question, options, correct index, explanation |
| `general.html` | The original two-team general-knowledge quiz (no login) |

Chapter lists follow the MoEYS textbooks: *កំណែលំហាត់គណិតវិទ្យាទី៩* (18 lessons), *ឯកសារស្វ័យសិក្សារូបវិទ្យាទី៩* (5 chapters),
*សៀវភៅកិច្ចការផ្ទះជីវវិទ្យាទី៩* (5 chapters), and the MoEYS e-learning chemistry outline (3 chapters).

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) (diagrams render on GitHub) or the full page at [docs/architecture.html](https://samolkhoeurn.github.io/quiz/docs/architecture.html).

## Adding a chapter

1. Copy an existing file in `data/`, e.g. `data/math-02.js`, keep `id` equal to the file name.
2. Write 20–30 questions, a mix of `lv: 1/2/3`; give every `lv: 3` question an `ex` explanation.
3. In `data/subjects.js` add `bank: true` to that chapter. Commit and push.
