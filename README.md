# ប្រឡងប្រជ្ញា ក្រុម A និង B

A two-team Khmer general-knowledge quiz: 30 questions (9 Cambodia, 6 ASEAN, 15 world), 100 points in total.
Easy questions are worth 2 points, medium 3 and hard 5.

The whole site is the single file `index.html` — no build step, no server. It is published with GitHub Pages.

## Editing questions

Open `index.html` and find the `QUESTIONS` array near the top of the `<script>` block. Each entry looks like:

```js
{cat:"KH", pts:3, q:"Question text?", o:["option ក","option ខ","option គ","option ឃ"], a:1},
```

`cat` is `KH` (Cambodia), `AS` (ASEAN) or `WD` (world); `pts` is 2, 3 or 5; `a` is the index (0–3) of the correct option.
Keep the points summing to 100 if you change the set.
