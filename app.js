// រៀនថ្នាក់ទី៩ — main application (static site + Firebase Auth/Firestore)
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword, updatePassword }
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, addDoc, collection, query, where, getDocs, deleteDoc }
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig, ADMIN_EMAIL, STUDENT_EMAIL_DOMAIN } from "./firebase-config.js?v=8";
import { SUBJECTS, LEVELS } from "./data/subjects.js";

/* ---------- helpers ---------- */
const $ = (id) => document.getElementById(id);
const app = $("app"), topnav = $("topnav");
const km = (n) => String(n).replace(/\d/g, (d) => "០១២៣៤៥៦៧៨៩"[d]);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// Math formatting: draw √ and ∛ with an overline that spans the radicand.  √(a+b) → bar over "a+b";  √49, 2√3, √0,09, √x² → bar over the token.
const RAD_TOKEN = String.raw`(?:\d+(?:[,.]\d+)?|[a-zA-Z])(?:[²³])?`;
const RAD_SPAN = String.raw`<span class="rad">(?:(?!<\/span><\/span>).)*<\/span><\/span>`;
const FRAC_SIDE = String.raw`(?:\d*(?:${RAD_SPAN})|\d+(?:[,.]\d+)?[a-zA-Zπ]?′?|[a-zA-Zπ]′?|\([^()]*\))`;
const FRAC_RE = new RegExp(String.raw`(?<![\w/])(${FRAC_SIDE})\s*/\s*(${FRAC_SIDE})(?![/\d])`, "g");
const mf = (s) => esc(s)
  .replace(/([√∛])\(([^()]*)\)/g, (m, r, inner) => `<span class="rad"><span class="rs">${r}</span><span class="ri">${inner}</span></span>`)
  .replace(new RegExp(`([√∛])(${RAD_TOKEN})`, "g"), (m, r, tok) => `<span class="rad"><span class="rs">${r}</span><span class="ri">${tok}</span></span>`)
  .replace(FRAC_RE, (m, num, den) => {
    // stack only real fractions (a side has a digit, a radical or a bracket); leave units like m/s, km/h, a/b inline
    if (!/\d|class="rad"|\(/.test(num + den)) return m;
    const strip = (x) => (x.startsWith("(") && x.endsWith(")") ? x.slice(1, -1) : x);
    return `<span class="frac"><span class="fn">${strip(num)}</span><span class="fd">${strip(den)}</span></span>`;
  });
const LETTERS = ["ក", "ខ", "គ", "ឃ"];
const pct = (s, t) => (t ? Math.round((100 * s) / t) : 0);
const pointsOf = (a) => (a.points != null ? a.points : pct(a.score, a.total));   // older attempts had no points field → % correct
const WEIGHT = { 1: 1, 2: 2, 3: 3 };          // relative weight of easy / medium / hard
const QUIZ_SIZE = 25;                          // questions drawn per attempt (bank may hold up to 100)
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
// Stratified random draw: keep the bank's easy/medium/hard proportions, order easy → hard, shuffle within level.
function drawQuestions(bank) {
  const n = bank.questions.length, size = Math.min(bank.quizSize || QUIZ_SIZE, n);
  const byLv = { 1: [], 2: [], 3: [] };
  bank.questions.forEach((q, i) => byLv[q.lv].push(i));
  const want = { 1: 0, 2: 0, 3: 0 }; let left = size;
  for (const l of [1, 2, 3]) { want[l] = Math.min(byLv[l].length, Math.round((size * byLv[l].length) / n)); left -= want[l]; }
  for (const l of [3, 2, 1]) { while (left > 0 && want[l] < byLv[l].length) { want[l]++; left--; } while (left < 0 && want[l] > 0) { want[l]--; left++; } }
  return [1, 2, 3].flatMap((l) => shuffle(byLv[l]).slice(0, want[l]));
}
// Points per drawn question, weighted by level, summing to exactly 100 (remainder goes to the hardest questions).
function assignPoints(qs) {
  const W = qs.reduce((t, q) => t + WEIGHT[q.lv], 0);
  const pts = qs.map((q) => Math.floor((100 * WEIGHT[q.lv]) / W));
  let rem = 100 - pts.reduce((a, b) => a + b, 0);
  const order = qs.map((q, i) => i).sort((a, b) => WEIGHT[qs[b].lv] - WEIGHT[qs[a].lv]);
  for (let k = 0; rem > 0; k = (k + 1) % order.length) { pts[order[k]]++; rem--; }
  return pts;
}
const secs = (ms) => km((ms / 1000).toFixed(1).replace(".", ",")) + " វិ";
const mins = (ms) => { const s = Math.round(ms / 1000); return s < 60 ? km(s) + " វិ" : `${km(Math.floor(s / 60))} នាទី ${km(s % 60)} វិ`; };
const fmtDate = (ms) => { const d = new Date(ms); return km(`${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`); };
const subjectOf = (id) => SUBJECTS.find((s) => s.id === id);
const chapterOf = (bankId) => { for (const s of SUBJECTS) { const c = s.chapters.find((c) => c.id === bankId); if (c) return { s, c }; } return null; };
const ALL_BANKS = SUBJECTS.flatMap((s) => s.chapters.filter((c) => c.bank).map((c) => c.id));
const studentEmail = (u) => `${u.trim().toLowerCase()}@${STUDENT_EMAIL_DOMAIN}`;
const bankCache = {};
async function loadBank(id) { if (!bankCache[id]) bankCache[id] = (await import(`./data/${id}.js`)).default; return bankCache[id]; }

/* ---------- firebase ---------- */
const configured = firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("PASTE");
let auth, db;
if (configured) {
  const fb = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(fb); db = getFirestore(fb);
}

/* ---------- state ---------- */
const S = { user: null, profile: null, isAdmin: false, attempts: null, quiz: null, admin: { tab: "students", students: null, sel: null, attempts: {}, view: null } };

/* ---------- boot ---------- */
if (!configured) renderSetupNeeded();
else onAuthStateChanged(auth, async (user) => {
  S.user = user; S.profile = null; S.attempts = null; S.quiz = null;
  if (!user) { renderLogin(); return; }
  S.isAdmin = (user.email || "").toLowerCase() === ADMIN_EMAIL.toLowerCase();
  if (S.isAdmin) { renderAdmin(); return; }
  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists() || snap.data().active === false) {
    const signedAs = user.email || "(no e-mail)";
    await signOut(auth);
    renderLogin(`គណនីនេះមិនទាន់ត្រូវបានបើកឲ្យប្រើទេ។ សូមទាក់ទងអ្នកគ្រប់គ្រង។ (signed in as ${signedAs}; admin is ${ADMIN_EMAIL})`);
    return;
  }
  S.profile = snap.data();
  renderStudentHome();
});

function nav(html) { topnav.innerHTML = html; }
const logoutBtn = () => `<button class="btn ghost sm" id="logout">ចាកចេញ</button>`;
document.addEventListener("click", (e) => { if (e.target.closest("#logout")) signOut(auth); });

/* ======================================================================
   SETUP / LOGIN
====================================================================== */
function renderSetupNeeded() {
  nav("");
  app.innerHTML = `<div class="card">
    <h1>ត្រូវការការកំណត់ Firebase</h1>
    <div class="notice warn">The site is published, but <code>firebase-config.js</code> still has the placeholder values.
    Follow <strong>SETUP.md</strong> in the repository (about 10 minutes): create the free Firebase project, enable
    Email/Password sign-in, create the Firestore database, paste the config into <code>firebase-config.js</code>,
    publish <code>firestore.rules</code>, create the admin account, then push again.</div>
    <p class="muted small">Until then the general-knowledge game still works: <a href="general.html">general.html</a></p>
  </div>`;
}

function renderLogin(err) {
  nav("");
  app.innerHTML = `<div class="card" style="max-width:440px;margin:24px auto 0">
    <h1>ចូលប្រើប្រាស់</h1>
    <p class="muted small">សិស្ស៖ វាយឈ្មោះអ្នកប្រើ និងពាក្យសម្ងាត់ដែលអ្នកគ្រប់គ្រងបានផ្តល់ឲ្យ។</p>
    ${err ? `<div class="notice bad">${esc(err)}</div>` : ""}
    <form id="loginForm" class="field" style="gap:12px">
      <div class="field"><label for="lu">ឈ្មោះអ្នកប្រើ ឬអ៊ីមែល</label><input id="lu" autocomplete="username" required autocapitalize="off"></div>
      <div class="field"><label for="lp">ពាក្យសម្ងាត់</label><input id="lp" type="password" autocomplete="current-password" required></div>
      <button class="btn primary" id="loginBtn">ចូល</button>
    </form>
    <p class="muted small">មិនមានគណនី? <a href="general.html">លេងល្បែងចំណេះដឹងទូទៅ</a> ដោយមិនចាំបាច់ចូល។</p>
  </div>`;
  $("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const u = $("lu").value.trim(), p = $("lp").value;
    const email = u.includes("@") ? u : studentEmail(u);
    $("loginBtn").disabled = true;
    try { await signInWithEmailAndPassword(auth, email, p); }
    catch (ex) { renderLogin(ex.code === "auth/invalid-credential" || ex.code === "auth/wrong-password" || ex.code === "auth/user-not-found" ? "ឈ្មោះអ្នកប្រើ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ។" : "ចូលមិនបាន៖ " + ex.code); }
  });
}

/* ======================================================================
   STUDENT
====================================================================== */
async function myAttempts() {
  if (S.attempts) return S.attempts;
  const qs = await getDocs(query(collection(db, "attempts"), where("uid", "==", S.user.uid)));
  S.attempts = qs.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => b.finishedAt - a.finishedAt);
  return S.attempts;
}
const allowedSet = () => new Set(S.profile?.allowed || []);

async function renderStudentHome() {
  nav(`<span class="who">${esc(S.profile.displayName || S.profile.username)}</span><button class="btn ghost sm" id="histBtn">ប្រវត្តិ</button><button class="btn ghost sm" id="pwBtn">ប្តូរពាក្យសម្ងាត់</button>${logoutBtn()}`);
  const allowed = allowedSet();
  const attempts = await myAttempts();
  app.innerHTML = `<div class="card">
    <h1>សួស្តី ${esc(S.profile.displayName || S.profile.username)}!</h1>
    <p class="muted">ជ្រើសរើសមុខវិជ្ជា រួចជ្រើសរើសមេរៀន/ជំពូកដែលចង់អនុវត្ត។ ចម្លើយត្រឹមត្រូវបង្ហាញបន្ទាប់ពីដាក់ស្នើប៉ុណ្ណោះ។</p>
    <div class="subjects">${SUBJECTS.map((s) => {
      const n = s.chapters.filter((c) => allowed.has(c.id) && c.bank).length;
      const done = attempts.filter((a) => a.subject === s.id).length;
      return `<button class="subject" style="--sc:${s.color}" data-subj="${s.id}" ${n ? "" : "disabled"}>
        <span class="name">${esc(s.name)}</span><span class="cnt">${n ? `${km(n)} ${s.unit}បើកឲ្យអនុវត្ត` : "មិនទាន់បើក"}</span>
        <span class="cnt">${done ? `បានធ្វើ ${km(done)} ដង` : ""}</span></button>`;
    }).join("")}</div>
  </div>`;
  app.querySelectorAll("[data-subj]").forEach((b) => b.addEventListener("click", () => renderChapterList(b.dataset.subj)));
  $("histBtn").addEventListener("click", () => renderHistory());
  $("pwBtn").addEventListener("click", () => renderChangePassword());
}

async function renderChapterList(subjId) {
  const s = subjectOf(subjId), allowed = allowedSet(), attempts = await myAttempts();
  app.innerHTML = `<div class="card">
    <div class="row between"><h1 style="color:${s.color}">${esc(s.name)}</h1><button class="btn ghost sm" id="back">← ត្រឡប់</button></div>
    <div class="chapters">${s.chapters.map((c) => {
      const open = allowed.has(c.id) && c.bank;
      const mine = attempts.filter((a) => a.bankId === c.id);
      const best = mine.length ? Math.max(...mine.map((a) => pointsOf(a))) : null;
      const meta = !c.bank ? "មិនទាន់មានសំណួរ" : !allowed.has(c.id) ? "មិនទាន់បើក" : mine.length ? `បានធ្វើ ${km(mine.length)} ដង<br>ល្អបំផុត ${km(best)} / ១០០` : "មិនទាន់ធ្វើ";
      return `<button class="chapter" style="--sc:${s.color}" data-bank="${c.id}" ${open ? "" : "disabled"}>
        <span class="n">${km(c.n)}</span><span class="t">${s.unit}ទី${km(c.n)}៖ ${esc(c.title)}${c.sub ? `<span class="sub">${esc(c.sub)}</span>` : ""}</span><span class="meta">${meta}</span></button>`;
    }).join("")}</div>
  </div>`;
  $("back").addEventListener("click", renderStudentHome);
  app.querySelectorAll("[data-bank]").forEach((b) => b.addEventListener("click", () => renderQuizIntro(b.dataset.bank)));
}

async function renderQuizIntro(bankId) {
  const bank = await loadBank(bankId), { s, c } = chapterOf(bankId);
  const n = bank.questions.length, size = Math.min(bank.quizSize || QUIZ_SIZE, n), lv = [1, 2, 3].map((l) => bank.questions.filter((q) => q.lv === l).length);
  app.innerHTML = `<div class="card">
    <div class="row"><span class="chip" style="border-color:${s.color};color:${s.color}">${esc(s.name)}</span><span class="chip">${s.unit}ទី${km(c.n)}</span></div>
    <h1>${esc(bank.title)}</h1>
    <div class="stats">
      <div class="stat"><div class="v">${km(size)}</div><div class="l">សំណួរក្នុងតេស្តម្តង</div></div>
      <div class="stat"><div class="v">${km(n)}</div><div class="l">សំណួរក្នុងធនាគារ (${km(lv[0])} / ${km(lv[1])} / ${km(lv[2])})</div></div>
      <div class="stat"><div class="v">១០០</div><div class="l">ពិន្ទុសរុប</div></div>
    </div>
    <div class="notice">
      <strong>របៀបធ្វើ៖</strong> សំណួរត្រូវបានចាប់យកដោយចៃដន្យពីធនាគារ ដូច្នេះការធ្វើម្តងទៀតនឹងបានសំណួរខុសគ្នា។ ជ្រើសរើសចម្លើយមួយក្នុងចំណោមបួន។ សំណួរពិបាកមានពិន្ទុច្រើនជាង (ងាយ ១ : មធ្យម ២ : ពិបាក ៣) សរុប ១០០ ពិន្ទុ។ អ្នកអាចត្រឡប់ទៅកែចម្លើយបាន មុនពេលដាក់ស្នើ។
      ពេលវេលាដែលចំណាយលើសំណួរនីមួយៗត្រូវបានកត់ត្រា ប៉ុន្តែគ្មានការកំណត់ពេលទេ។ ចម្លើយត្រឹមត្រូវ និងការពន្យល់ បង្ហាញបន្ទាប់ពីដាក់ស្នើ។
    </div>
    <div class="row between"><button class="btn ghost" id="back">← ត្រឡប់</button><button class="btn primary" id="start">ចាប់ផ្តើម</button></div>
  </div>`;
  $("back").addEventListener("click", () => renderChapterList(s.id));
  $("start").addEventListener("click", () => startQuiz(bank));
}

/* ---------- quiz engine ---------- */
function startQuiz(bank) {
  const idx = drawQuestions(bank);
  const qs = idx.map((qi) => {
    const q = bank.questions[qi]; const perm = shuffle([0, 1, 2, 3]);          // perm[k] = original option shown at position k
    return { qi, lv: q.lv, q: q.q, o: perm.map((k) => q.o[k]), perm, a: perm.indexOf(q.a), ex: q.ex };
  });
  assignPoints(qs).forEach((p, i) => (qs[i].pts = p));
  S.quiz = { bank, qs, i: 0, chosen: Array(qs.length).fill(null), ms: Array(qs.length).fill(0), t0: performance.now(), startedAt: Date.now(), confirm: false };
  nav(`<span class="who">${esc(S.profile.displayName || S.profile.username)}</span><button class="btn ghost sm" id="quitBtn">បោះបង់</button>`);
  $("quitBtn").addEventListener("click", () => { if (!S.quiz.quitConfirm) { S.quiz.quitConfirm = true; renderQuestion(); } });
  window.addEventListener("beforeunload", warnUnload);
  renderQuestion();
}
function warnUnload(e) { if (S.quiz) { e.preventDefault(); e.returnValue = ""; } }
function tick() { const now = performance.now(); S.quiz.ms[S.quiz.i] += now - S.quiz.t0; S.quiz.t0 = now; }
function goto(i) { tick(); S.quiz.i = i; S.quiz.confirm = false; renderQuestion(); }

function renderQuestion() {
  const Q = S.quiz, q = Q.qs[Q.i], n = Q.qs.length, answered = Q.chosen.filter((c) => c != null).length;
  app.innerHTML = `<div class="card">
    ${Q.quitConfirm ? `<div class="notice bad row between"><span>បោះបង់ការធ្វើតេស្តនេះ? ចម្លើយនឹងមិនត្រូវបានរក្សាទុកទេ។</span><span class="row"><button class="btn danger sm" id="quitYes">បាទ/ចាស បោះបង់</button><button class="btn ghost sm" id="quitNo">បន្តធ្វើ</button></span></div>` : ""}
    <div class="qhead"><span class="muted">សំណួរទី ${km(Q.i + 1)} / ${km(n)} · បានឆ្លើយ ${km(answered)}</span><span class="row"><span class="chip lv${q.lv}">${LEVELS[q.lv]}</span><span class="chip pts">${km(q.pts)} ពិន្ទុ</span></span></div>
    <div class="progressbar"><i style="width:${(100 * answered) / n}%"></i></div>
    <p class="qtext">${km(Q.i + 1)}. ${mf(q.q)}</p>
    <div class="opts">${q.o.map((t, k) => `<button class="opt ${Q.chosen[Q.i] === k ? "sel" : ""}" data-k="${k}" aria-pressed="${Q.chosen[Q.i] === k}"><span class="k">${LETTERS[k]}</span><span>${mf(t)}</span></button>`).join("")}</div>
    <div class="dots">${Q.qs.map((_, k) => `<button class="dot ${Q.chosen[k] != null ? "done" : ""} ${k === Q.i ? "cur" : ""}" data-go="${k}" title="សំណួរទី ${km(k + 1)}">${km(k + 1)}</button>`).join("")}</div>
    ${Q.confirm ? `<div class="notice warn row between"><span>${answered < n ? `នៅសល់ ${km(n - answered)} សំណួរមិនទាន់ឆ្លើយ។ ` : ""}ដាក់ស្នើឥឡូវនេះ? បន្ទាប់ពីដាក់ស្នើ មិនអាចកែចម្លើយបានទេ។</span><span class="row"><button class="btn primary sm" id="submitYes">ដាក់ស្នើ</button><button class="btn ghost sm" id="submitNo">ត្រឡប់</button></span></div>` : ""}
    <div class="row between">
      <button class="btn" id="prev" ${Q.i === 0 ? "disabled" : ""}>← មុន</button>
      <span class="row">
        ${Q.i < n - 1 ? `<button class="btn" id="next">បន្ទាប់ →</button>` : ""}
        <button class="btn primary" id="submit">ដាក់ស្នើ</button>
      </span>
    </div>
  </div>`;
  app.querySelectorAll("[data-k]").forEach((b) => b.addEventListener("click", () => { Q.chosen[Q.i] = +b.dataset.k; if (Q.i < n - 1 && !Q.confirm) goto(Q.i + 1); else renderQuestion(); }));
  app.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => goto(+b.dataset.go)));
  $("prev").addEventListener("click", () => goto(Q.i - 1));
  $("next")?.addEventListener("click", () => goto(Q.i + 1));
  $("submit").addEventListener("click", () => { tick(); Q.confirm = true; renderQuestion(); });
  $("submitYes")?.addEventListener("click", submitQuiz);
  $("submitNo")?.addEventListener("click", () => { Q.confirm = false; renderQuestion(); });
  $("quitYes")?.addEventListener("click", () => { window.removeEventListener("beforeunload", warnUnload); S.quiz = null; renderStudentHome(); });
  $("quitNo")?.addEventListener("click", () => { Q.quitConfirm = false; renderQuestion(); });
}

async function submitQuiz() {
  tick();
  const Q = S.quiz, bank = Q.bank;
  // answers are stored in bank terms: i = index in the bank, chosen = original option index
  const answers = Q.qs.map((q, k) => ({ i: q.qi, lv: q.lv, pts: q.pts, chosen: Q.chosen[k] == null ? null : q.perm[Q.chosen[k]], correct: Q.chosen[k] === q.a, ms: Math.round(Q.ms[k]) }));
  const attempt = {
    uid: S.user.uid, username: S.profile.username, displayName: S.profile.displayName || S.profile.username,
    bankId: bank.id, subject: bank.subject, title: bank.title,
    startedAt: Q.startedAt, finishedAt: Date.now(), totalMs: answers.reduce((a, b) => a + b.ms, 0),
    score: answers.filter((a) => a.correct).length, total: answers.length, answers,
    points: answers.filter((a) => a.correct).reduce((t, a) => t + a.pts, 0), maxPoints: 100, bankSize: bank.questions.length,
  };
  window.removeEventListener("beforeunload", warnUnload);
  S.quiz = null;
  app.innerHTML = `<div class="card center"><p class="muted">កំពុងរក្សាទុកលទ្ធផល…</p></div>`;
  try { const ref = await addDoc(collection(db, "attempts"), attempt); attempt.id = ref.id; S.attempts = null; }
  catch (ex) { attempt.saveError = ex.code || String(ex); }
  renderResult(attempt, bank, () => renderStudentHome());
}

/* ---------- result / attempt detail (shared by student & admin) ---------- */
async function renderResult(attempt, bank, back, who) {
  bank = bank || (await loadBank(attempt.bankId));
  const { s, c } = chapterOf(attempt.bankId);
  const p = pointsOf(attempt);
  const byLv = [1, 2, 3].map((l) => { const as = attempt.answers.filter((a) => a.lv === l); return { l, c: as.filter((a) => a.correct).length, t: as.length }; });
  const slowest = [...attempt.answers].sort((a, b) => b.ms - a.ms)[0];
  nav(`${who ? `<span class="who">${esc(who)}</span>` : ""}${logoutBtn()}`);
  app.innerHTML = `<div class="card">
    <div class="row between"><div class="row"><span class="chip" style="border-color:${s.color};color:${s.color}">${esc(s.name)}</span><span class="chip">${s.unit}ទី${km(c.n)}</span><span class="chip">${fmtDate(attempt.finishedAt)}</span></div><button class="btn ghost sm" id="back">← ត្រឡប់</button></div>
    <h1>${esc(bank.title)} — លទ្ធផល${attempt.displayName ? ` របស់ ${esc(attempt.displayName)}` : ""}</h1>
    ${attempt.saveError ? `<div class="notice bad">លទ្ធផលមិនត្រូវបានរក្សាទុកទេ (${esc(attempt.saveError)})។ សូមថតអេក្រង់ទុក។</div>` : ""}
    <div class="stats">
      <div class="stat"><div class="v ${p >= 50 ? "ok-text" : "bad-text"}">${km(p)} / ១០០</div><div class="l">ពិន្ទុ · ត្រឹមត្រូវ ${km(attempt.score)} / ${km(attempt.total)} សំណួរ</div></div>
      <div class="stat"><div class="v">${mins(attempt.totalMs)}</div><div class="l">ពេលសរុប</div></div>
      <div class="stat"><div class="v">${secs(attempt.totalMs / attempt.total)}</div><div class="l">មធ្យម / សំណួរ</div></div>
      ${byLv.map((x) => `<div class="stat"><div class="v">${km(x.c)}/${km(x.t)}</div><div class="l">${LEVELS[x.l]}</div></div>`).join("")}
    </div>
    <p class="muted small">សំណួរដែលចំណាយពេលយូរបំផុត៖ ទី${km(attempt.answers.indexOf(slowest) + 1)} (${secs(slowest.ms)})។ ពណ៌បៃតង = ត្រឹមត្រូវ, ក្រហម = ខុស ឬមិនបានឆ្លើយ។</p>
    <div class="dots">${attempt.answers.map((a, i) => `<a class="dot ${a.correct ? "ok" : "bad"}" href="#q${i + 1}">${km(i + 1)}</a>`).join("")}</div>
    <div style="display:grid;gap:22px">${attempt.answers.map((a, i) => {
      const q = bank.questions[a.i];
      return `<section id="q${i + 1}" style="display:grid;gap:8px">
        <div class="row between"><strong>${km(i + 1)}. ${mf(q.q)}</strong><span class="row"><span class="chip lv${q.lv}">${LEVELS[q.lv]}</span>${a.pts != null ? `<span class="chip pts">${a.correct ? "+" : ""}${km(a.correct ? a.pts : 0)} / ${km(a.pts)}</span>` : ""}<span class="chip">${secs(a.ms)}</span></span></div>
        <div class="opts">${q.o.map((t, k) => `<div class="opt ${k === q.a ? "right" : a.chosen === k ? "wrong" : ""}"><span class="k">${LETTERS[k]}</span><span>${mf(t)}${k === q.a ? " ✓" : ""}${a.chosen === k && k !== q.a ? " ✗ (ចម្លើយរបស់អ្នក)" : ""}</span></div>`).join("")}</div>
        ${a.chosen == null ? `<div class="bad-text small">មិនបានឆ្លើយ</div>` : ""}
        ${q.ex ? `<div class="explain"><strong>ការពន្យល់៖</strong> ${mf(q.ex)}</div>` : ""}
      </section>`;
    }).join("")}</div>
    <div class="row between"><button class="btn ghost" id="back2">← ត្រឡប់</button>${who ? "" : `<button class="btn primary" id="again">ធ្វើម្តងទៀត</button>`}</div>
  </div>`;
  $("back").addEventListener("click", back); $("back2").addEventListener("click", back);
  $("again")?.addEventListener("click", () => renderQuizIntro(attempt.bankId));
}

async function renderHistory() {
  const attempts = await myAttempts();
  nav(`<span class="who">${esc(S.profile.displayName || S.profile.username)}</span>${logoutBtn()}`);
  app.innerHTML = `<div class="card">
    <div class="row between"><h1>ប្រវត្តិការធ្វើតេស្ត</h1><button class="btn ghost sm" id="back">← ត្រឡប់</button></div>
    ${attempts.length ? `<div class="tablewrap"><table><thead><tr><th>កាលបរិច្ឆេទ</th><th>មុខវិជ្ជា</th><th>មេរៀន/ជំពូក</th><th class="num">ពិន្ទុ</th><th class="num">ពេល</th></tr></thead><tbody>
      ${attempts.map((a) => `<tr class="clickable" data-id="${a.id}"><td>${fmtDate(a.finishedAt)}</td><td>${esc(subjectOf(a.subject)?.name)}</td><td>${esc(a.title)}</td><td class="num ${pointsOf(a) >= 50 ? "ok-text" : "bad-text"}">${km(pointsOf(a))} / ១០០ <span class="muted small">(${km(a.score)}/${km(a.total)})</span></td><td class="num">${mins(a.totalMs)}</td></tr>`).join("")}
    </tbody></table></div>` : `<p class="muted">មិនទាន់មានការធ្វើតេស្តទេ។</p>`}
  </div>`;
  $("back").addEventListener("click", renderStudentHome);
  app.querySelectorAll("[data-id]").forEach((r) => r.addEventListener("click", () => renderResult(attempts.find((a) => a.id === r.dataset.id), null, renderHistory)));
}

function renderChangePassword(msg) {
  app.innerHTML = `<div class="card" style="max-width:440px">
    <div class="row between"><h1>ប្តូរពាក្យសម្ងាត់</h1><button class="btn ghost sm" id="back">← ត្រឡប់</button></div>
    ${msg ? `<div class="notice ${msg.ok ? "ok" : "bad"}">${esc(msg.text)}</div>` : ""}
    <form id="pwForm" style="display:grid;gap:12px">
      <div class="field"><label for="np">ពាក្យសម្ងាត់ថ្មី (យ៉ាងតិច ៦ តួ)</label><input id="np" type="password" minlength="6" required autocomplete="new-password"></div>
      <button class="btn primary">រក្សាទុក</button>
    </form></div>`;
  $("back").addEventListener("click", renderStudentHome);
  $("pwForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    try { await updatePassword(S.user, $("np").value); renderChangePassword({ ok: true, text: "បានប្តូរពាក្យសម្ងាត់រួចរាល់។" }); }
    catch (ex) { renderChangePassword({ ok: false, text: ex.code === "auth/requires-recent-login" ? "សូមចាកចេញ ហើយចូលម្តងទៀត រួចព្យាយាមម្តងទៀត។" : "បរាជ័យ៖ " + ex.code }); }
  });
}

/* ======================================================================
   ADMIN
====================================================================== */
async function loadStudents(force) {
  if (S.admin.students && !force) return S.admin.students;
  const qs = await getDocs(collection(db, "users"));
  S.admin.students = qs.docs.map((d) => ({ uid: d.id, ...d.data() })).sort((a, b) => (a.displayName || a.username).localeCompare(b.displayName || b.username));
  return S.admin.students;
}
async function studentAttempts(uid, force) {
  if (S.admin.attempts[uid] && !force) return S.admin.attempts[uid];
  const qs = await getDocs(query(collection(db, "attempts"), where("uid", "==", uid)));
  S.admin.attempts[uid] = qs.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => b.finishedAt - a.finishedAt);
  return S.admin.attempts[uid];
}

async function renderAdmin(tab) {
  if (tab) S.admin.tab = tab;
  nav(`<span class="who">អ្នកគ្រប់គ្រង · ${esc(S.user.email)}</span>${logoutBtn()}`);
  const students = await loadStudents();
  app.innerHTML = `<div class="card">
    <h1>ផ្ទាំងគ្រប់គ្រង</h1>
    <div class="tabs"><button class="tab ${S.admin.tab === "students" ? "on" : ""}" data-tab="students">សិស្ស និងសិទ្ធិ</button><button class="tab ${S.admin.tab === "reports" ? "on" : ""}" data-tab="reports">របាយការណ៍</button><button class="tab ${S.admin.tab === "banks" ? "on" : ""}" data-tab="banks">កម្រងសំណួរ</button></div>
    <div id="tabBody"></div>
  </div>`;
  app.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => renderAdmin(b.dataset.tab)));
  if (S.admin.tab === "students") renderAdminStudents(students);
  else if (S.admin.tab === "reports") renderAdminReports(students);
  else renderAdminBanks();
}

function renderAdminStudents(students, msg) {
  const sel = students.find((x) => x.uid === S.admin.sel);
  $("tabBody").innerHTML = `<div class="grid2" style="margin-top:14px">
    <div style="display:grid;gap:14px">
      <h2>សិស្ស (${km(students.length)})</h2>
      <div class="studentlist">${students.map((u) => `<button class="student ${u.uid === S.admin.sel ? "on" : ""}" data-uid="${u.uid}"><span><strong>${esc(u.displayName || u.username)}</strong><br><span class="muted small">@${esc(u.username)} · បើក ${km((u.allowed || []).filter((id) => ALL_BANKS.includes(id)).length)}/${km(ALL_BANKS.length)}${u.active === false ? " · <span class='bad-text'>បិទ</span>" : ""}</span></span><span class="muted">›</span></button>`).join("") || `<p class="muted">មិនទាន់មានសិស្ស។ បង្កើតគណនីខាងស្តាំ។</p>`}</div>
      <h2>បង្កើតគណនីសិស្សថ្មី</h2>
      ${msg ? `<div class="notice ${msg.ok ? "ok" : "bad"}">${esc(msg.text)}</div>` : ""}
      <form id="newUser" style="display:grid;gap:10px">
        <div class="field"><label for="nName">ឈ្មោះ (បង្ហាញ)</label><input id="nName" required placeholder="ឧ. សុខា"></div>
        <div class="field"><label for="nUser">ឈ្មោះអ្នកប្រើ (អក្សរឡាតាំង a–z, 0–9, . _)</label><input id="nUser" required pattern="[a-z0-9._]{3,20}" autocapitalize="off" placeholder="ឧ. sokha"></div>
        <div class="field"><label for="nPw">ពាក្យសម្ងាត់ (យ៉ាងតិច ៦ តួ)</label><input id="nPw" required minlength="6" placeholder="ឧ. sokha2026"></div>
        <button class="btn primary" id="nBtn">បង្កើត</button>
        <p class="muted small">សូមកត់ត្រាពាក្យសម្ងាត់ទុក៖ អ្នកគ្រប់គ្រងមិនអាចមើលវាវិញបានទេ។ បើភ្លេច សិស្សប្តូរខ្លួនឯងបន្ទាប់ពីចូល ឬអ្នកបង្កើតគណនីថ្មី។</p>
      </form>
    </div>
    <div id="perm">${sel ? permPanel(sel) : `<div class="notice">ជ្រើសរើសសិស្សម្នាក់ ដើម្បីកំណត់ថាមេរៀន/ជំពូកណាដែលគាត់អាចមើលឃើញ។</div>`}</div>
  </div>`;
  $("tabBody").querySelectorAll("[data-uid]").forEach((b) => b.addEventListener("click", () => { S.admin.sel = b.dataset.uid; renderAdminStudents(students); }));
  $("newUser").addEventListener("submit", createStudent);
  if (sel) wirePermPanel(sel, students);
}

function permPanel(u) {
  const allowed = new Set(u.allowed || []);
  return `<div style="display:grid;gap:12px">
    <div class="row between"><h2>${esc(u.displayName || u.username)} <span class="muted small">@${esc(u.username)}</span></h2>
      <label class="row small"><input type="checkbox" id="active" ${u.active === false ? "" : "checked"}> គណនីសកម្ម</label></div>
    <p class="muted small">ធីកមេរៀន/ជំពូកដែលសិស្សអាចធ្វើបាន។ ជំពូកដែលមិនទាន់មានសំណួរ បង្ហាញស្រអាប់។</p>
    ${SUBJECTS.map((s) => `<div class="subjhead"><h3 style="color:${s.color}">${esc(s.name)}</h3><span class="row"><button class="btn ghost sm" data-all="${s.id}">ទាំងអស់</button><button class="btn ghost sm" data-none="${s.id}">គ្មាន</button></span></div>
      <div class="checks">${s.chapters.map((c) => `<label class="check ${c.bank ? "" : "no"}"><input type="checkbox" data-ch="${c.id}" data-s="${s.id}" ${allowed.has(c.id) ? "checked" : ""} ${c.bank ? "" : "disabled"}><span>${s.unit}ទី${km(c.n)}៖ ${esc(c.title)}${c.bank ? "" : " <span class='muted small'>(មិនទាន់មានសំណួរ)</span>"}</span></label>`).join("")}</div>`).join("")}
    <div class="row between"><span id="permMsg" class="small">${S.admin.permSaved ? `<span class="ok-text">បានរក្សាទុក ✓</span>` : ""}</span><button class="btn primary" id="savePerm">រក្សាទុកសិទ្ធិ</button></div>
  </div>`;
}
function wirePermPanel(u, students) {
  const perm = $("perm");
  perm.querySelectorAll("[data-all]").forEach((b) => b.addEventListener("click", () => perm.querySelectorAll(`[data-s="${b.dataset.all}"]:not(:disabled)`).forEach((c) => (c.checked = true))));
  perm.querySelectorAll("[data-none]").forEach((b) => b.addEventListener("click", () => perm.querySelectorAll(`[data-s="${b.dataset.none}"]`).forEach((c) => (c.checked = false))));
  $("savePerm").addEventListener("click", async () => {
    const allowed = [...perm.querySelectorAll("[data-ch]:checked")].map((c) => c.dataset.ch);
    const active = $("active").checked;
    $("savePerm").disabled = true;
    try {
      await updateDoc(doc(db, "users", u.uid), { allowed, active });
      u.allowed = allowed; u.active = active;
      S.admin.permSaved = true;
      renderAdminStudents(students);
      S.admin.permSaved = false;
    } catch (ex) { $("permMsg").innerHTML = `<span class="bad-text">បរាជ័យ៖ ${esc(ex.code || ex)}</span>`; $("savePerm").disabled = false; }
  });
}

async function createStudent(e) {
  e.preventDefault();
  const displayName = $("nName").value.trim(), username = $("nUser").value.trim().toLowerCase(), pw = $("nPw").value;
  $("nBtn").disabled = true;
  // A second Firebase app instance creates the account without signing the admin out.
  const name = "secondary-" + Date.now();
  const sec = initializeApp(firebaseConfig, name), secAuth = getAuth(sec);
  try {
    const cred = await createUserWithEmailAndPassword(secAuth, studentEmail(username), pw);
    await setDoc(doc(db, "users", cred.user.uid), { username, displayName, allowed: [], active: true, createdAt: Date.now() });
    await signOut(secAuth);
    S.admin.sel = cred.user.uid;
    renderAdminStudents(await loadStudents(true), { ok: true, text: `បានបង្កើតគណនី @${username} ។ ឥឡូវកំណត់សិទ្ធិខាងស្តាំ រួចប្រាប់សិស្សនូវឈ្មោះអ្នកប្រើ និងពាក្យសម្ងាត់។` });
  } catch (ex) {
    renderAdminStudents(await loadStudents(), { ok: false, text: ex.code === "auth/email-already-in-use" ? "ឈ្មោះអ្នកប្រើនេះមានរួចហើយ។" : "បរាជ័យ៖ " + (ex.code || ex) });
  }
}

async function renderAdminReports(students) {
  const body = $("tabBody");
  const sel = students.find((x) => x.uid === S.admin.sel) || students[0];
  if (!sel) { body.innerHTML = `<p class="muted" style="margin-top:14px">មិនទាន់មានសិស្ស។</p>`; return; }
  S.admin.sel = sel.uid;
  body.innerHTML = `<div style="display:grid;gap:14px;margin-top:14px">
    <div class="row between"><div class="field"><label for="pick">សិស្ស</label><select id="pick">${students.map((u) => `<option value="${u.uid}" ${u.uid === sel.uid ? "selected" : ""}>${esc(u.displayName || u.username)} (@${esc(u.username)})</option>`).join("")}</select></div><button class="btn ghost sm" id="refresh">ផ្ទុកឡើងវិញ</button></div>
    <div id="rep"><p class="muted">កំពុងទាញ…</p></div></div>`;
  $("pick").addEventListener("change", (e) => { S.admin.sel = e.target.value; renderAdminReports(students); });
  $("refresh").addEventListener("click", async () => { await studentAttempts(sel.uid, true); renderAdminReports(students); });
  const attempts = await studentAttempts(sel.uid);
  const rep = $("rep");
  if (!attempts.length) { rep.innerHTML = `<p class="muted">សិស្សនេះមិនទាន់បានធ្វើតេស្តណាមួយទេ។</p>`; return; }
  const totalMs = attempts.reduce((a, b) => a + b.totalMs, 0), totalQ = attempts.reduce((a, b) => a + b.total, 0), totalC = attempts.reduce((a, b) => a + b.score, 0);
  const avgPts = Math.round(attempts.reduce((a, b) => a + pointsOf(b), 0) / attempts.length);
  // per-chapter summary
  const rows = ALL_BANKS.map((id) => {
    const as = attempts.filter((a) => a.bankId === id); if (!as.length) return "";
    const { s, c } = chapterOf(id); const best = Math.max(...as.map((a) => pointsOf(a))); const last = as[0];
    const avgMs = as.reduce((x, a) => x + a.totalMs / a.total, 0) / as.length;
    return `<tr><td><span style="color:${s.color};font-weight:600">${esc(s.name)}</span><br><span class="small">${s.unit}ទី${km(c.n)} ${esc(c.title)}</span></td><td class="num">${km(as.length)}</td><td class="num">${km(best)}</td><td class="num">${km(pointsOf(last))}</td><td><div class="bar"><i style="width:${pointsOf(last)}%"></i></div></td><td class="num">${secs(avgMs)}</td></tr>`;
  }).join("");
  // weak spots: questions wrong in latest attempt per bank
  const weak = [];
  for (const id of ALL_BANKS) { const last = attempts.find((a) => a.bankId === id); if (!last) continue; const bank = await loadBank(id); last.answers.filter((a) => !a.correct).forEach((a) => weak.push({ bank, a })); }
  rep.innerHTML = `
    <div class="stats">
      <div class="stat"><div class="v">${km(attempts.length)}</div><div class="l">តេស្តបានធ្វើ</div></div>
      <div class="stat"><div class="v ${avgPts >= 50 ? "ok-text" : "bad-text"}">${km(avgPts)} / ១០០</div><div class="l">ពិន្ទុមធ្យម · ត្រឹមត្រូវ ${km(totalC)}/${km(totalQ)} សំណួរ</div></div>
      <div class="stat"><div class="v">${mins(totalMs)}</div><div class="l">ពេលសរុប</div></div>
      <div class="stat"><div class="v">${fmtDate(attempts[0].finishedAt)}</div><div class="l">ចុងក្រោយ</div></div>
    </div>
    <h2 style="margin-top:14px">សង្ខេបតាមមេរៀន/ជំពូក</h2>
    <div class="tablewrap"><table><thead><tr><th>មេរៀន/ជំពូក</th><th class="num">ដង</th><th class="num">ល្អបំផុត /១០០</th><th class="num">ចុងក្រោយ /១០០</th><th></th><th class="num">មធ្យម/សំណួរ</th></tr></thead><tbody>${rows}</tbody></table></div>
    <h2 style="margin-top:14px">តេស្តទាំងអស់ <span class="muted small">(ចុចដើម្បីមើលលម្អិតតាមសំណួរ និងពេលវេលា)</span></h2>
    <div class="tablewrap"><table><thead><tr><th>កាលបរិច្ឆេទ</th><th>មេរៀន/ជំពូក</th><th class="num">ពិន្ទុ</th><th class="num">ងាយ</th><th class="num">មធ្យម</th><th class="num">ពិបាក</th><th class="num">ពេល</th></tr></thead><tbody>
      ${attempts.map((a) => { const lv = (l) => { const x = a.answers.filter((z) => z.lv === l); return `${km(x.filter((z) => z.correct).length)}/${km(x.length)}`; };
        return `<tr class="clickable" data-id="${a.id}"><td>${fmtDate(a.finishedAt)}</td><td>${esc(subjectOf(a.subject)?.name)} · ${esc(a.title)}</td><td class="num ${pointsOf(a) >= 50 ? "ok-text" : "bad-text"}">${km(pointsOf(a))} / ១០០ <span class="muted small">(${km(a.score)}/${km(a.total)})</span></td><td class="num">${lv(1)}</td><td class="num">${lv(2)}</td><td class="num">${lv(3)}</td><td class="num">${mins(a.totalMs)}</td></tr>`; }).join("")}
    </tbody></table></div>
    ${weak.length ? `<h2 style="margin-top:14px">សំណួរដែលខុសក្នុងតេស្តចុងក្រោយ (${km(weak.length)})</h2>
    <div class="tablewrap"><table><thead><tr><th>មេរៀន/ជំពូក</th><th>សំណួរ</th><th>កម្រិត</th><th class="num">ពេល</th></tr></thead><tbody>
      ${weak.map(({ bank, a }) => `<tr><td class="small">${esc(bank.title)}</td><td>${km(a.i + 1)}. ${mf(bank.questions[a.i].q)}</td><td><span class="chip lv${a.lv}">${LEVELS[a.lv]}</span></td><td class="num">${secs(a.ms)}</td></tr>`).join("")}
    </tbody></table></div>` : ""}`;
  rep.querySelectorAll("[data-id]").forEach((r) => r.addEventListener("click", () => renderResult(attempts.find((a) => a.id === r.dataset.id), null, () => renderAdmin("reports"), `អ្នកគ្រប់គ្រង · ${S.user.email}`)));
}

async function renderAdminBanks() {
  const body = $("tabBody");
  const items = [];
  for (const s of SUBJECTS) for (const c of s.chapters) {
    let n = "", lv = "";
    if (c.bank) { const b = await loadBank(c.id); n = km(b.questions.length); lv = [1, 2, 3].map((l) => km(b.questions.filter((q) => q.lv === l).length)).join(" / "); }
    items.push(`<tr><td><span style="color:${s.color};font-weight:600">${esc(s.name)}</span></td><td>${s.unit}ទី${km(c.n)}៖ ${esc(c.title)}${c.sub ? `<br><span class="muted small">${esc(c.sub)}</span>` : ""}</td><td>${c.bank ? `<span class="ok-text">មាន</span>` : `<span class="muted">មិនទាន់</span>`}</td><td class="num">${n}</td><td class="num">${lv}</td></tr>`);
  }
  body.innerHTML = `<div style="margin-top:14px;display:grid;gap:10px">
    <p class="muted small">សំណួររក្សាទុកក្នុងឯកសារ <code>data/&lt;id&gt;.js</code> ក្នុង repository ។ ដើម្បីបន្ថែមជំពូក៖ បន្ថែមឯកសារ រួចដាក់ <code>bank: true</code> ក្នុង <code>data/subjects.js</code> ហើយ push ។</p>
    <div class="tablewrap"><table><thead><tr><th>មុខវិជ្ជា</th><th>មេរៀន/ជំពូក</th><th>សំណួរ</th><th class="num">ចំនួន</th><th class="num">ងាយ / មធ្យម / ពិបាក</th></tr></thead><tbody>${items.join("")}</tbody></table></div></div>`;
}
