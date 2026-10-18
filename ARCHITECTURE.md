# Architecture

Full write-up with diagrams and the scale-tier comparison: **[docs/architecture.html](https://samolkhoeurn.github.io/quiz/docs/architecture.html)** (served by GitHub Pages).

## Today

No server of our own. The browser downloads static files from GitHub Pages and talks directly to Firebase.

```mermaid
flowchart LR
  subgraph laptop [Your laptop]
    repo[quiz/ folder<br/>GitHub Desktop]
  end
  subgraph github [GitHub - free]
    gh[(Repository)]
    pages[GitHub Pages CDN<br/>index.html, app.js,<br/>data/subjects.js + 31 banks]
  end
  subgraph firebase [Google Firebase - free tier]
    auth[Authentication<br/>e-mail + password]
    fs[(Firestore<br/>users/{uid}: allowed[], active<br/>attempts/{id}: points, answers[])]
  end
  student[Student browser<br/>draws 25 questions, scores to 100]
  admin[Admin browser<br/>same app, admin e-mail]

  repo -- git push --> gh -- publishes on push --> pages
  pages -- GET static files --> student
  pages -- GET static files --> admin
  student -- sign in --> auth
  student -- read own user, write 1 attempt --> fs
  admin -- create students, set allowed[], read all attempts --> fs
  admin -. create student login .-> auth
```

Security lives in `firestore.rules`: the admin e-mail may read/write everything; a student may read their own `users` document and create/read their own `attempts`. Question content never touches the database; it ships in the static files and is versioned in git.

## Limits that matter first

| Concern | Today | Comfortable up to | What breaks first |
|---|---|---|---|
| Students | created one by one | ~30 | no password reset without server code |
| Admins | one hard-coded e-mail | 1 | a second teacher needs a `role` field |
| Question banks | 31 files, 1,240 q | thousands of q | authoring/review effort; keys visible client-side |
| Reports | aggregate all attempts in browser | ~1,000 attempts/student | add a `summary/{uid}` doc |
| Firestore free tier | tens of ops/day | ~300 students × 1 quiz/day | 50k reads/day, then pay-as-you-go |

## Scale tiers

```mermaid
flowchart TB
  t1[Tier 1 - today<br/>1 admin, few students, $0<br/>grading in browser]
  t2[Tier 2 - tutoring group<br/>+ users.role for teachers<br/>+ summary/{uid} per student<br/>+ 1 Cloud Function: reset pw, bulk create]
  t3[Tier 3 - school / product<br/>+ server-side grading, keys never leave server<br/>+ banks in Firestore with content admin UI<br/>+ orgs / classes, Blaze billing]
  t1 --> t2 --> t3
```

Each tier keeps everything from the previous one. The bank format `{lv, q, o, a, ex}` and the attempt format (`answers[]` with chosen, correct, pts, ms) are designed to stay stable through all three.
