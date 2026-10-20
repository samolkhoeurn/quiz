# រៀនថ្នាក់ទី៩ · កម្រងសំណួរ

Practice quizzes for a Cambodian grade 9 student: the four MoEYS subjects in Khmer (31 chapters), English *Mathematics (Year 9)* (14 chapters) and *Mathematics (Year 2)* (8 chapters) following the Australian Curriculum v9.0, a Khmer *General knowledge* subject (34 themed rounds of 30 questions) that can be played solo or as Team A vs Team B, and *សិស្សពូកែ* — maths-competition preparation in 7 topic banks (15-question quizzes, every question with a worked solution) built from the national outstanding-student exam papers 1997–2023 and two សិស្សពូកែ problem books. The original stand-alone two-team game remains at `general.html`.

| File | What it is |
|---|---|
| `index.html`, `app.js`, `styles.css` | The learning app: student login, chapter picker, timed quizzes (answers shown only after submit), reports, admin panel |
| `firebase-config.js` | Your Firebase project settings + the admin e-mail (see `SETUP.md`) |
| `firestore.rules` | Security rules to paste into Firebase (admin = one e-mail; students see only their own data; `banks` = chapters edited online) |
| `data/subjects.js` | Subjects and their official chapter/lesson lists; `bank: true` marks chapters that have questions; `lang: "en"` gives English chapter labels, `kids: true` gives larger text |
| `data/<subject>-<nn>.js` | One question bank per chapter: `{lv, q, o[4], a, ex}` — level 1/2/3, question, options, correct index, explanation. English banks (`enmath-*`) write maths in LaTeX between `$…$`, rendered by KaTeX |
| `general.html` | The original two-team general-knowledge quiz (no login) |

Chapter lists and question content follow the official books: the NGS *សៀវភៅកិច្ចការផ្ទះ គណិតវិទ្យា ថ្នាក់ទី៩* (2021, 18 lessons)
for maths, and the MoEYS student textbook *វិទ្យាសាស្ត្រ ថ្នាក់ទី៩* (2020) for physics (5 chapters), chemistry (3) and biology (5),
cross-checked against the NGS workbooks, the MoEYS teacher's guides and the NGS biology MCQ book. All 31 Khmer banks were
revised against these books in October 2026 (`rev: 2` in each file; 1 500+ questions, 44–52 per chapter).

## Interface language

The student interface is Khmer by default. In the admin panel each student has a **ភាសាអេក្រង់** setting; choosing *English* translates every student screen (buttons, labels, result page, option letters A–D, Arabic numerals). The admin panel itself stays in Khmer.

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) (diagrams render on GitHub) or the full page at [docs/architecture.html](https://samolkhoeurn.github.io/quiz/docs/architecture.html).

## Editing questions online

The admin tab កម្រងសំណួរ is a question manager: browse every chapter with the maths rendered, search, filter by level, see
each question's hit rate from real attempts, edit with live preview, delete, add. Saved chapters live in Firestore
(`banks/{id}`) and override the file; «នាំចេញ .js» exports a chapter back to file format so the repository can be updated.

## Adding a chapter

1. Copy an existing file in `data/`, e.g. `data/math-02.js`, keep `id` equal to the file name.
2. Write 20–30 questions, a mix of `lv: 1/2/3`; give every `lv: 3` question an `ex` explanation.
3. In `data/subjects.js` add `bank: true` to that chapter. Commit and push.

**Not yet covered:** the MoEYS textbook *វិទ្យាសាស្ត្រ ថ្នាក់ទី៩* also has an earth-science part (ផែនដីវិទ្យា, 3 chapters: ទឹកសាបនិងការបំពុល · ចលនាក្នុងផែនដី · បញ្ហាបរិស្ថានពិភពលោក, book pp. 262–317). No quiz banks exist for it yet.
