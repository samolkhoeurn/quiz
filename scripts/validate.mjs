// node scripts/validate.mjs [bankId ...]   — validates question banks in data/
import { readdirSync } from "fs";
import { pathToFileURL } from "url";
const dir = new URL("../data/", import.meta.url);
const ids = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(dir).filter((f) => /^[a-z]+-\d\d\.js$/.test(f)).map((f) => f.slice(0, -3));
let problems = 0, total = 0;
const norm = (s) => String(s).replace(/\s+/g, " ").trim();
// Optional LaTeX check: uses a globally installed katex if present (npm i -g katex)
let katex = null;
try { const { createRequire } = await import("module"); const { execSync } = await import("child_process");
  katex = createRequire(import.meta.url)(execSync("npm root -g").toString().trim() + "/katex"); } catch { katex = null; }
function checkLatex(text, tag) {
  const parts = String(text).split(/(?<!\\)\$/);
  if (parts.length % 2 === 0) { console.log(`✗ ${tag}: unbalanced $ in "${norm(text).slice(0, 60)}"`); return 1; }
  if (!katex) return 0;
  let bad = 0;
  parts.forEach((seg, k) => { if (k % 2) { try { katex.renderToString(seg, { throwOnError: true }); } catch (e) { console.log(`✗ ${tag}: LaTeX error in "$${seg}$" — ${e.message.split("\n")[0]}`); bad++; } } });
  return bad;
}
for (const id of ids.sort()) {
  let b;
  try { b = (await import(pathToFileURL(new URL(id + ".js", dir).pathname).href)).default; }
  catch (e) { console.log(`✗ ${id}: cannot import — ${e.message.split("\n")[0]}`); problems++; continue; }
  const subj = id.split("-")[0];
  if (b.id !== id) { console.log(`✗ ${id}: id field is "${b.id}"`); problems++; }
  if (b.subject !== subj) { console.log(`✗ ${id}: subject field is "${b.subject}"`); problems++; }
  if (!b.title) { console.log(`✗ ${id}: missing title`); problems++; }
  if (!Array.isArray(b.questions) || b.questions.length < 20) { console.log(`✗ ${id}: only ${b.questions?.length ?? 0} questions (need ≥20)`); problems++; }
  if (b.questions?.length > 100) { console.log(`✗ ${id}: ${b.questions.length} questions (max 100)`); problems++; }
  const lv = { 1: 0, 2: 0, 3: 0 }, seen = new Set();
  (b.questions || []).forEach((q, i) => {
    total++;
    const tag = `${id} #${i + 1}`;
    if (!q.q || norm(q.q).length < 8) { console.log(`✗ ${tag}: question text too short`); problems++; }
    if (!Array.isArray(q.o) || q.o.length !== 4) { console.log(`✗ ${tag}: needs exactly 4 options`); problems++; return; }
    if (q.o.some((o) => !String(o).trim())) { console.log(`✗ ${tag}: empty option`); problems++; }
    if (new Set(q.o.map(norm)).size !== 4) { console.log(`✗ ${tag}: duplicate options`); problems++; }
    if (!Number.isInteger(q.a) || q.a < 0 || q.a > 3) { console.log(`✗ ${tag}: answer index must be 0–3`); problems++; }
    if (![1, 2, 3].includes(q.lv)) { console.log(`✗ ${tag}: lv must be 1, 2 or 3`); problems++; } else lv[q.lv]++;
    if (q.lv === 3 && !(q.ex && norm(q.ex).length > 15)) { console.log(`✗ ${tag}: hard question needs an explanation (ex)`); problems++; }
    const key = norm(q.q); if (seen.has(key)) { console.log(`✗ ${tag}: duplicate question`); problems++; } seen.add(key);
    for (const txt of [q.q, ...q.o, q.ex || ""]) problems += checkLatex(txt, tag);
    if (subj === "enmath" && /[√²³×÷≤≥≠]/.test(q.q + q.o.join("") + (q.ex || ""))) { console.log(`✗ ${tag}: use LaTeX instead of Unicode maths symbols in English banks`); problems++; }
  });
  const n = b.questions?.length || 0;
  const share = (k) => (n ? Math.round((100 * lv[k]) / n) : 0);
  if (n && (share(1) < 20 || share(2) < 25 || share(3) < 15)) { console.log(`✗ ${id}: level mix too uneven — easy ${lv[1]}, medium ${lv[2]}, hard ${lv[3]} (want roughly 30/40/30 %)`); problems++; }
  console.log(`${problems ? "·" : "✓"} ${id.padEnd(13)} ${String(n).padStart(3)} q   easy ${lv[1]}  medium ${lv[2]}  hard ${lv[3]}   "${b.title}"`);
}
console.log(`\n${ids.length} banks, ${total} questions, ${problems} problem(s)`);
process.exit(problems ? 1 : 0);
