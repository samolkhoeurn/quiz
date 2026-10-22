// រៀនថ្នាក់ទី៩ — main application (static site + Firebase Auth/Firestore)
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword, updatePassword }
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, addDoc, collection, query, where, getDocs, deleteDoc }
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig, ADMIN_EMAIL, STUDENT_EMAIL_DOMAIN } from "./firebase-config.js?v=20";
import { SUBJECTS, LEVELS } from "./data/subjects.js?v=20";

/* ---------- helpers ---------- */
const $ = (id) => document.getElementById(id);
const app = $("app"), topnav = $("topnav");
const km = (n) => (S.uiLang === "en" ? String(n) : String(n).replace(/\d/g, (d) => "០១២៣៤៥៦៧៨៩"[d]));
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// Math formatting: draw √ and ∛ with an overline that spans the radicand.  √(a+b) → bar over "a+b";  √49, 2√3, √0,09, √x² → bar over the token.
const RAD_TOKEN = String.raw`(?:\d+(?:[,.]\d+)?|[a-zA-Z])(?:[²³])?`;
const RAD_SPAN = String.raw`<span class="rad">(?:(?!<\/span><\/span>).)*<\/span><\/span>`;
const FRAC_SIDE = String.raw`(?:\d*(?:${RAD_SPAN})|\d+(?:[,.]\d+)?[a-zA-Zπ]?′?|[a-zA-Zπ]′?|\([^()]*\))`;
const FRAC_RE = new RegExp(String.raw`(?<![\w/])(${FRAC_SIDE})\s*/\s*(${FRAC_SIDE})(?![/\d])`, "g");
const mfPlain = (s) => esc(s)
  .replace(/([√∛])\(([^()]*)\)/g, (m, r, inner) => `<span class="rad"><span class="rs">${r}</span><span class="ri">${inner}</span></span>`)
  .replace(new RegExp(`([√∛])(${RAD_TOKEN})`, "g"), (m, r, tok) => `<span class="rad"><span class="rs">${r}</span><span class="ri">${tok}</span></span>`)
  .replace(FRAC_RE, (m, num, den) => {
    // stack only real fractions (a side has a digit, a radical or a bracket); leave units like m/s, km/h, a/b inline
    if (!/\d|class="rad"|\(/.test(num + den)) return m;
    const strip = (x) => (x.startsWith("(") && x.endsWith(")") ? x.slice(1, -1) : x);
    return `<span class="frac"><span class="fn">${strip(num)}</span><span class="fd">${strip(den)}</span></span>`;
  });
// LaTeX-aware formatting: text between unescaped $…$ is typeset with KaTeX (loaded in index.html); \$ is a literal dollar.
// Strings without $ go through the plain-text rules above (used by the Khmer banks).
const mf = (s) => {
  const str = String(s ?? "");
  if (!str.includes("$")) return mfPlain(str);
  const parts = str.split(/(?<!\\)\$/);           // odd indexes are math
  return parts.map((seg, k) => {
    if (k % 2 === 0) return esc(seg.replace(/\\\$/g, "$"));
    if (!window.katex) return `<code>${esc(seg)}</code>`;
    try { return window.katex.renderToString(seg, { throwOnError: false, output: "html" }); } catch { return esc(seg); }
  }).join("");
};
const LETTERS_KM = ["ក", "ខ", "គ", "ឃ"], LETTERS_EN = ["A", "B", "C", "D"];
const LETTERS = new Proxy([], { get: (_, k) => (S.uiLang === "en" || S.quizLang === "en" ? LETTERS_EN : LETTERS_KM)[k] });
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
const secs = (ms) => km((ms / 1000).toFixed(1)) + " វិ";   // decimal point, as in the MoEYS/NGS textbooks
const mins = (ms) => { const s = Math.round(ms / 1000); return s < 60 ? km(s) + " វិ" : `${km(Math.floor(s / 60))} នាទី ${km(s % 60)} វិ`; };
const fmtDate = (ms) => { const d = new Date(ms); return km(`${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`); };
const subjectOf = (id) => SUBJECTS.find((s) => s.id === id);
const sName = (s) => (S.uiLang === "en" && s.lang !== "en" && s.en ? s.en : s.name);
const unitOf = (s, c) => (s.lang === "en" ? `${s.unit} ${c.n}` : `${s.unit}ទី${km(c.n)}`);   // "Chapter 3" vs "មេរៀនទី៣"
const chapterOf = (bankId) => { for (const s of SUBJECTS) { const c = s.chapters.find((c) => c.id === bankId); if (c) return { s, c }; } return null; };
const ALL_BANKS = SUBJECTS.flatMap((s) => s.chapters.filter((c) => c.bank).map((c) => c.id));
const studentEmail = (u) => `${u.trim().toLowerCase()}@${STUDENT_EMAIL_DOMAIN}`;
const bankCache = {};
const fileBankCache = {};
async function loadFileBank(id) { if (!fileBankCache[id]) fileBankCache[id] = (await import(`./data/${id}.js?v=20`)).default; return fileBankCache[id]; }
// A chapter edited online lives in Firestore (banks/{id}) and overrides the file version; otherwise the file is used.
// Exception: when the file carries a higher `rev` than the Firestore copy (a revised file was pushed), the file wins
// until the admin updates the database from the question manager (button in the DB status line).
const revOf = (b) => Number(b?.rev) || 1;
async function loadBank(id) {
  if (bankCache[id]) return bankCache[id];
  let bank = null;
  if (db) { try { const snap = await getDoc(doc(db, "banks", id)); if (snap.exists()) bank = { ...snap.data(), fromDb: true }; } catch (e) { console.warn("banks read failed", e.code); } }
  if (bank) { const file = await loadFileBank(id); if (revOf(file) > revOf(bank)) bank = { ...file, fromDb: false, staleDb: bank }; }
  if (!bank) bank = { ...(await loadFileBank(id)), fromDb: false };
  bankCache[id] = bank; return bank;
}
const filePayload = (b, source) => { const p = { id: b.id, subject: b.subject, title: b.title, rev: revOf(b), questions: b.questions, updatedAt: Date.now(), updatedBy: S.user.email, source }; if (b.quizSize) p.quizSize = b.quizSize; return p; };

/* ---------- firebase ---------- */
const configured = firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("PASTE");
let auth, db;
if (configured) {
  const fb = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(fb); db = getFirestore(fb);
}

/* ---------- state ---------- */
const S = { user: null, profile: null, isAdmin: false, attempts: null, quiz: null, uiLang: "km", quizLang: "km", kids: false, admin: { tab: "students", students: null, sel: null, attempts: {}, view: null } };

/* ---------- boot ---------- */
if (!configured) renderSetupNeeded();
else onAuthStateChanged(auth, async (user) => {
  S.user = user; S.profile = null; S.attempts = null; S.quiz = null;
  S.uiLang = "km"; S.kids = false; document.body.classList.remove("kids");
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
  S.uiLang = S.profile.lang === "en" ? "en" : "km";
  document.documentElement.lang = S.uiLang;
  if (S.uiLang === "en") translateNode(document.body);
  renderStudentHome();
});

function nav(html) { topnav.innerHTML = html; }

/* ---------- English interface for students with lang = "en" ----------
   Student screens are written in Khmer; when the student's profile says lang "en", the text nodes are
   translated after each render (longest phrases first). Numbers are already Arabic in that mode (see km). */
const EN = [
  ["កម្រងសំណួរសិក្សា", "Study Quizzes"], ["ខ្មែរ · អូស្ត្រាលី", "Khmer · Australian"],
  ["សំណួរតាមកម្មវិធីសិក្សាកម្ពុជា និងអូស្ត្រាលី", "Questions following the Cambodian and Australian curricula"],
  ["សិស្ស៖ វាយឈ្មោះអ្នកប្រើ និងពាក្យសម្ងាត់ដែលអ្នកគ្រប់គ្រងបានផ្តល់ឲ្យ។", "Students: type the username and password your teacher gave you."],
  ["ជ្រើសរើសមុខវិជ្ជា រួចជ្រើសរើសមេរៀន/ជំពូកដែលចង់អនុវត្ត។ ចម្លើយត្រឹមត្រូវបង្ហាញបន្ទាប់ពីដាក់ស្នើប៉ុណ្ណោះ។", "Pick a subject, then pick a chapter to practise. The answers are shown after you finish."],
  ["សំណួរត្រូវបានចាប់យកដោយចៃដន្យពីធនាគារ ដូច្នេះការធ្វើម្តងទៀតនឹងបានសំណួរខុសគ្នា។ ជ្រើសរើសចម្លើយមួយក្នុងចំណោមបួន។ សំណួរពិបាកមានពិន្ទុច្រើនជាង (ងាយ ១ : មធ្យម ២ : ពិបាក ៣) សរុប ១០០ ពិន្ទុ។ អ្នកអាចត្រឡប់ទៅកែចម្លើយបាន មុនពេលដាក់ស្នើ។", "The questions are picked at random, so every try is different. Choose one of the four answers. Harder questions are worth more points (easy 1 : medium 2 : hard 3), 100 points in total. You can go back and change an answer before you finish."],
  ["ពេលវេលាដែលចំណាយលើសំណួរនីមួយៗត្រូវបានកត់ត្រា ប៉ុន្តែគ្មានការកំណត់ពេលទេ។ ចម្លើយត្រឹមត្រូវ និងការពន្យល់ បង្ហាញបន្ទាប់ពីដាក់ស្នើ។", "The time you spend on each question is recorded, but there is no time limit. The correct answers and explanations are shown after you finish."],
  ["បោះបង់ការធ្វើតេស្តនេះ? ចម្លើយនឹងមិនត្រូវបានរក្សាទុកទេ។", "Stop this quiz? Your answers will not be saved."],
  ["ដាក់ស្នើឥឡូវនេះ? បន្ទាប់ពីដាក់ស្នើ មិនអាចកែចម្លើយបានទេ។", "Finish now? You cannot change answers afterwards."],
  ["ក្រុមនីមួយៗជ្រើសរើសចម្លើយមួយ រួចចុច «បង្ហាញចម្លើយ»", ""],
  ["លទ្ធផលមិនត្រូវបានរក្សាទុកទេ (", "The result could not be saved ("], ["។ សូមថតអេក្រង់ទុក។", "). Please take a screenshot."],
  ["។ ពណ៌បៃតង = ត្រឹមត្រូវ, ក្រហម = ខុស ឬមិនបានឆ្លើយ។", ". Green = correct, red = wrong or not answered."],
  ["សំណួរដែលចំណាយពេលយូរបំផុត៖ ទី", "Slowest question: number "],
  ["មិនទាន់មានការធ្វើតេស្តទេ។", "No quizzes yet."], ["ប្រវត្តិការធ្វើតេស្ត", "My quiz history"],
  ["ឈ្មោះអ្នកប្រើ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ។", "Wrong username or password."],
  ["សូមចាកចេញ ហើយចូលម្តងទៀត រួចព្យាយាមម្តងទៀត។", "Please log out, log in again and retry."],
  ["បានប្តូរពាក្យសម្ងាត់រួចរាល់។", "Password changed."], ["ពាក្យសម្ងាត់ថ្មី (យ៉ាងតិច ៦ តួ)", "New password (at least 6 characters)"],
  ["កំពុងរក្សាទុកលទ្ធផល…", "Saving your result…"], ["កំពុងទាញ…", "Loading…"],
  ["សំណួរក្នុងតេស្តម្តង", "questions in this quiz"], ["សំណួរក្នុងធនាគារ (", "questions in the bank ("], ["ពិន្ទុសរុប", "total points"],
  ["ពិន្ទុ · ត្រឹមត្រូវ ", "points · correct "], ["មធ្យម / សំណួរ", "average / question"], ["ពេលសរុប", "total time"],
  ["សំណួរមិនទាន់ឆ្លើយ។ ", "unanswered. "], ["· បានឆ្លើយ ", "· answered "], ["សំណួរទី ", "Question "],
  ["(ចម្លើយរបស់អ្នក)", "(your answer)"], ["មិនបានឆ្លើយ", "Not answered"], ["ការពន្យល់៖", "Explanation:"],
  ["បើកឲ្យអនុវត្ត", " open"], ["មិនទាន់មានសំណួរ", "No questions yet"], ["មិនទាន់បើក", "Not open yet"], ["មិនទាន់ធ្វើ", "Not tried yet"],
  ["បានធ្វើ ", "Tried "], [" ដង", " time(s)"], ["ល្អបំផុត ", "Best "], ["នៅសល់ ", "Still "],
  ["ប្តូរពាក្យសម្ងាត់", "Change password"], ["ឈ្មោះអ្នកប្រើ ឬអ៊ីមែល", "Username or e-mail"], ["ឈ្មោះអ្នកប្រើ", "Username"], ["ពាក្យសម្ងាត់", "Password"],
  ["ចូលប្រើប្រាស់", "Log in"], ["ចាកចេញ", "Log out"], ["ប្រវត្តិ", "History"], ["សួស្តី ", "Hello "],
  ["របៀបធ្វើ៖", "How it works:"], ["ចាប់ផ្តើម", "Start"], ["ត្រឡប់", "Back"], ["បោះបង់", "Quit"],
  ["បាទ/ចាស បោះបង់", "Yes, quit"], ["បន្តធ្វើ", "Keep going"], ["ដាក់ស្នើ", "Finish"], ["បន្ទាប់", "Next"], ["មុន", "Previous"],
  ["ធ្វើម្តងទៀត", "Try again"], ["រក្សាទុក", "Save"], ["លទ្ធផល", "Result"], [" របស់ ", " for "],
  ["កាលបរិច្ឆេទ", "Date"], ["មុខវិជ្ជា", "Subject"], ["មេរៀន/ជំពូក", "Chapter"], ["ពិន្ទុ", "points"], ["ពេល", "time"],
  ["ងាយ", "easy"], ["មធ្យម", "medium"], ["ពិបាក", "hard"], ["សំណួរ", "questions"],
  [" វិ", " s"], [" នាទី ", " min "], ["១០០", "100"],
].filter(([k, v]) => v).sort((a, b) => b[0].length - a[0].length);
function translateNode(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes) {
    if (!/[\u1780-\u17FF]/.test(n.nodeValue)) continue;
    let v = n.nodeValue; for (const [kh, en] of EN) v = v.split(kh).join(en); n.nodeValue = v;
  }
  root.querySelectorAll?.("[placeholder],[title]").forEach((el) => { for (const at of ["placeholder", "title"]) { const v = el.getAttribute(at); if (v && /[\u1780-\u17FF]/.test(v)) { let t = v; for (const [kh, en] of EN) t = t.split(kh).join(en); el.setAttribute(at, t); } } });
}
new MutationObserver((muts) => { if (S.uiLang !== "en" || S.isAdmin) return; for (const m of muts) m.addedNodes.forEach((n) => { if (n.nodeType === 1) translateNode(n); else if (n.nodeType === 3) translateNode(n.parentNode); }); })
  .observe(document.body, { childList: true, subtree: true });
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
      <div class="field"><label for="lu">ឈ្មោះអ្នកប្រើ ឬអ៊ីមែល · Username</label><input id="lu" autocomplete="username" required autocapitalize="off"></div>
      <div class="field"><label for="lp">ពាក្យសម្ងាត់ · Password</label><input id="lp" type="password" autocomplete="current-password" required></div>
      <button class="btn primary" id="loginBtn">ចូល · Log in</button>
    </form>
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
  S.kids = false; document.body.classList.remove("kids");
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
        <span class="name">${esc(sName(s))}</span><span class="cnt">${n ? (s.lang === "en" ? `${n} ${s.unit.toLowerCase()}${n > 1 ? "s" : ""} open` : `${km(n)} ${s.unit}បើកឲ្យអនុវត្ត`) : "មិនទាន់បើក"}</span>
        <span class="cnt">${done ? `បានធ្វើ ${km(done)} ដង` : ""}</span></button>`;
    }).join("")}</div>
  </div>`;
  app.querySelectorAll("[data-subj]").forEach((b) => b.addEventListener("click", () => renderChapterList(b.dataset.subj)));
  $("histBtn").addEventListener("click", () => renderHistory());
  $("pwBtn").addEventListener("click", () => renderChangePassword());
}

async function renderChapterList(subjId) {
  const s = subjectOf(subjId), allowed = allowedSet(), attempts = await myAttempts();
  S.kids = !!s.kids; document.body.classList.toggle("kids", S.kids);
  app.innerHTML = `<div class="card">
    <div class="row between"><h1 style="color:${s.color}">${esc(sName(s))}</h1><button class="btn ghost sm" id="back">← ត្រឡប់</button></div>
    <div class="chapters">${s.chapters.map((c) => {
      const open = allowed.has(c.id) && c.bank;
      const mine = attempts.filter((a) => a.bankId === c.id);
      const best = mine.length ? Math.max(...mine.map((a) => pointsOf(a))) : null;
      const meta = !c.bank ? "មិនទាន់មានសំណួរ" : !allowed.has(c.id) ? "មិនទាន់បើក" : mine.length ? `បានធ្វើ ${km(mine.length)} ដង<br>ល្អបំផុត ${km(best)} / ១០០` : "មិនទាន់ធ្វើ";
      return `<button class="chapter" style="--sc:${s.color}" data-bank="${c.id}" ${open ? "" : "disabled"}>
        <span class="n">${km(c.n)}</span><span class="t">${unitOf(s, c)}៖ ${esc(c.title)}${c.sub ? `<span class="sub">${esc(c.sub)}</span>` : ""}</span><span class="meta">${meta}</span></button>`;
    }).join("")}</div>
  </div>`;
  $("back").addEventListener("click", renderStudentHome);
  app.querySelectorAll("[data-bank]").forEach((b) => b.addEventListener("click", () => renderQuizIntro(b.dataset.bank)));
}

async function renderQuizIntro(bankId) {
  const bank = await loadBank(bankId), { s, c } = chapterOf(bankId);
  S.quizLang = s.lang === "en" ? "en" : "km";
  const n = bank.questions.length, size = Math.min(bank.quizSize || QUIZ_SIZE, n), lv = [1, 2, 3].map((l) => bank.questions.filter((q) => q.lv === l).length);
  app.innerHTML = `<div class="card">
    <div class="row"><span class="chip" style="border-color:${s.color};color:${s.color}">${esc(sName(s))}</span><span class="chip">${unitOf(s, c)}</span></div>
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
    ${s.team ? `<div class="notice" style="background:var(--panel)"><strong>លេងជាក្រុម៖</strong> ក្រុម A និងក្រុម B ឆ្លើយសំណួរដូចគ្នាម្តងមួយៗ រួចបង្ហាញចម្លើយ និងបូកពិន្ទុក្រុមនីមួយៗ (ដូចល្បែងចំណេះដឹងទូទៅ) ។ លទ្ធផលល្បែងក្រុមមិនត្រូវបានរក្សាទុកក្នុងរបាយការណ៍ទេ។</div>` : ""}
    <div class="row between"><button class="btn ghost" id="back">← ត្រឡប់</button><span class="row">${s.team ? `<button class="btn" id="startTeam">លេងជាក្រុម A / B</button>` : ""}<button class="btn primary" id="start">${s.team ? "ធ្វើម្នាក់ឯង" : "ចាប់ផ្តើម"}</button></span></div>
  </div>`;
  $("back").addEventListener("click", () => renderChapterList(s.id));
  $("start").addEventListener("click", () => startQuiz(bank));
  $("startTeam")?.addEventListener("click", () => startTeamQuiz(bank));
}

/* ---------- team mode (Team A vs Team B on the same questions) ---------- */
function drawSet(bank) {
  const idx = drawQuestions(bank);
  const qs = idx.map((qi) => { const q = bank.questions[qi]; const perm = shuffle([0, 1, 2, 3]); return { qi, lv: q.lv, q: q.q, o: perm.map((k) => q.o[k]), perm, a: perm.indexOf(q.a), ex: q.ex }; });
  assignPoints(qs).forEach((p, i) => (qs[i].pts = p));
  return qs;
}
function startTeamQuiz(bank) {
  const qs = drawSet(bank);
  S.quiz = null;
  S.team = { bank, qs, i: 0, picks: qs.map(() => ({})), revealed: false, scoreA: 0, scoreB: 0, nameA: "ក្រុម A", nameB: "ក្រុម B", log: [], quitConfirm: false };
  nav(`<span class="who">${esc(S.profile?.displayName || "")}</span><button class="btn ghost sm" id="teamQuit">បោះបង់</button>`);
  $("teamQuit").addEventListener("click", () => { S.team.quitConfirm = true; renderTeam(); });
  renderTeam();
}
function teamPanel(team) {
  const T = S.team, q = T.qs[T.i], chosen = T.picks[T.i][team], name = team === "A" ? T.nameA : T.nameB, done = T.revealed;
  const state = chosen == null ? "កំពុងរង់ចាំចម្លើយ…" : done ? "" : "បានជ្រើសរើស ✓";
  const result = !done ? "" : chosen == null ? `<div class="result bad">មិនបានឆ្លើយ · ០ ពិន្ទុ</div>` : chosen === q.a ? `<div class="result ok">ត្រឹមត្រូវ! +${km(q.pts)} ពិន្ទុ</div>` : `<div class="result bad">ខុស · ០ ពិន្ទុ</div>`;
  return `<section class="team ${team.toLowerCase()}"><h2><span>${esc(name)}</span><span class="state">${state}</span></h2><div class="opts">${q.o.map((t, k) => {
    let cls = "opt"; if (!done && chosen === k) cls += " sel"; if (done) { if (k === q.a) cls += " right"; else if (chosen === k) cls += " wrong"; }
    return `<button class="${cls}" ${done ? "disabled" : ""} data-team="${team}" data-k="${k}"><span class="k">${LETTERS[k]}</span><span>${mf(t)}</span></button>`; }).join("")}</div>${result}</section>`;
}
function renderTeam() {
  const T = S.team, n = T.qs.length;
  if (T.i >= n) return renderTeamFinal();
  const q = T.qs[T.i], p = T.picks[T.i], both = p.A != null && p.B != null;
  app.innerHTML = `<div class="card">
    ${T.quitConfirm ? `<div class="notice bad row between"><span>បោះបង់ល្បែងនេះ?</span><span class="row"><button class="btn danger sm" id="tqYes">បាទ/ចាស បោះបង់</button><button class="btn ghost sm" id="tqNo">បន្តលេង</button></span></div>` : ""}
    <div class="scores">
      <div class="score a"><input id="tnA" value="${esc(T.nameA)}" aria-label="ឈ្មោះក្រុម A"><div class="num">${km(T.scoreA)}</div><small>ពិន្ទុ / ១០០</small></div>
      <div class="vs">ទល់</div>
      <div class="score b"><input id="tnB" value="${esc(T.nameB)}" aria-label="ឈ្មោះក្រុម B"><div class="num">${km(T.scoreB)}</div><small>ពិន្ទុ / ១០០</small></div>
    </div>
    <div class="qhead"><span class="muted">សំណួរទី ${km(T.i + 1)} / ${km(n)}</span><span class="row"><span class="chip lv${q.lv}">${LEVELS[q.lv]}</span><span class="chip pts">${km(q.pts)} ពិន្ទុ</span></span></div>
    <p class="qtext">${km(T.i + 1)}. ${mf(q.q)}</p>
    <div class="teams">${teamPanel("A")}${teamPanel("B")}</div>
    ${T.revealed ? `<div class="answerline">ចម្លើយត្រឹមត្រូវ៖ ${LETTERS[q.a]}. ${mf(q.o[q.a])}</div>${q.ex ? `<div class="explain"><strong>ការពន្យល់៖</strong> ${mf(q.ex)}</div>` : ""}` : ""}
    <div class="actions"><span class="hint">${T.revealed ? "" : both ? "ក្រុមទាំងពីរបានឆ្លើយរួចហើយ" : "ក្រុមនីមួយៗជ្រើសរើសចម្លើយមួយ រួចចុច «បង្ហាញចម្លើយ»"}</span>
      ${T.revealed ? `<button class="btn primary" id="tNext">${T.i + 1 === n ? "មើលលទ្ធផល" : "សំណួរបន្ទាប់ →"}</button>` : `<button class="btn primary" id="tReveal" ${both ? "" : "disabled"}>បង្ហាញចម្លើយ</button>`}
    </div></div>`;
  app.querySelectorAll("[data-team]").forEach((b) => b.addEventListener("click", () => { if (T.revealed) return; T.picks[T.i][b.dataset.team] = +b.dataset.k; renderTeam(); }));
  $("tReveal")?.addEventListener("click", () => { const gA = p.A === q.a, gB = p.B === q.a; if (gA) T.scoreA += q.pts; if (gB) T.scoreB += q.pts; T.log.push({ A: gA, B: gB }); T.revealed = true; renderTeam(); });
  $("tNext")?.addEventListener("click", () => { T.i++; T.revealed = false; renderTeam(); });
  $("tqYes")?.addEventListener("click", () => { S.team = null; renderStudentHome(); });
  $("tqNo")?.addEventListener("click", () => { T.quitConfirm = false; renderTeam(); });
  $("tnA").addEventListener("input", (e) => (T.nameA = e.target.value || "ក្រុម A"));
  $("tnB").addEventListener("input", (e) => (T.nameB = e.target.value || "ក្រុម B"));
  $("tnA").addEventListener("change", renderTeam); $("tnB").addEventListener("change", renderTeam);
}
function renderTeamFinal() {
  const T = S.team, a = T.scoreA, b = T.scoreB, { s } = chapterOf(T.bank.id);
  const winner = a === b ? "ស្មើគ្នា!" : a > b ? `${esc(T.nameA)} ឈ្នះ!` : `${esc(T.nameB)} ឈ្នះ!`;
  nav(`${logoutBtn()}`);
  app.innerHTML = `<div class="card final">
    <div class="row"><span class="chip" style="border-color:${s.color};color:${s.color}">${esc(sName(s))}</span><span class="chip">${esc(T.bank.title)}</span></div>
    <div class="winner">${winner}</div>
    <div style="font-size:1.4rem;font-weight:700;font-variant-numeric:tabular-nums"><span style="color:var(--teamA)">${esc(T.nameA)} ${km(a)}</span> &nbsp;·&nbsp; <span style="color:var(--teamB)">${esc(T.nameB)} ${km(b)}</span></div>
    <div class="stats" style="width:100%;max-width:520px"><div class="stat"><div class="v">${km(T.log.filter((x) => x.A).length)} / ${km(T.qs.length)}</div><div class="l">${esc(T.nameA)} ត្រឹមត្រូវ</div></div><div class="stat"><div class="v">${km(T.log.filter((x) => x.B).length)} / ${km(T.qs.length)}</div><div class="l">${esc(T.nameB)} ត្រឹមត្រូវ</div></div></div>
    <div class="row"><button class="btn" id="tAgain">លេងម្តងទៀត</button><button class="btn primary" id="tHome">ត្រឡប់ទៅទំព័រដើម</button></div></div>`;
  $("tAgain").addEventListener("click", () => startTeamQuiz(T.bank));
  $("tHome").addEventListener("click", () => { S.team = null; renderStudentHome(); });
  if (Math.max(a, b) === 100 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) fireworks(6000);
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
  S.celebrate = true;
  renderResult(attempt, bank, () => renderStudentHome());
}

/* ---------- result / attempt detail (shared by student & admin) ---------- */
async function renderResult(attempt, bank, back, who) {
  bank = bank || (await loadBank(attempt.bankId));
  const { s, c } = chapterOf(attempt.bankId);
  S.quizLang = s.lang === "en" ? "en" : "km";
  const p = pointsOf(attempt);
  const byLv = [1, 2, 3].map((l) => { const as = attempt.answers.filter((a) => a.lv === l); return { l, c: as.filter((a) => a.correct).length, t: as.length }; });
  const slowest = [...attempt.answers].sort((a, b) => b.ms - a.ms)[0];
  nav(`${who ? `<span class="who">${esc(who)}</span>` : ""}${logoutBtn()}`);
  app.innerHTML = `<div class="card">
    <div class="row between"><div class="row"><span class="chip" style="border-color:${s.color};color:${s.color}">${esc(sName(s))}</span><span class="chip">${unitOf(s, c)}</span><span class="chip">${fmtDate(attempt.finishedAt)}</span></div><button class="btn ghost sm" id="back">← ត្រឡប់</button></div>
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
        <div class="opts">${q.o.map((t, k) => `<div class="opt ${k === q.a ? "right" : a.chosen === k ? "wrong" : ""}"><span class="k">${LETTERS[k]}</span><span>${mf(t)}${k === q.a ? " ✓" : ""}${a.chosen === k && k !== q.a ? (S.quizLang === "en" ? " ✗ (your answer)" : " ✗ (ចម្លើយរបស់អ្នក)") : ""}</span></div>`).join("")}</div>
        ${a.chosen == null ? `<div class="bad-text small">មិនបានឆ្លើយ</div>` : ""}
        ${q.ex ? `<div class="explain"><strong>${S.quizLang === "en" ? "Explanation:" : "ការពន្យល់៖"}</strong> ${mf(q.ex)}</div>` : ""}
      </section>`;
    }).join("")}</div>
    <div class="row between"><button class="btn ghost" id="back2">← ត្រឡប់</button>${who ? "" : `<button class="btn primary" id="again">ធ្វើម្តងទៀត</button>`}</div>
  </div>`;
  $("back").addEventListener("click", back); $("back2").addEventListener("click", back);
  $("again")?.addEventListener("click", () => renderQuizIntro(attempt.bankId));
  if (S.celebrate) { S.celebrate = false; celebrate(p, attempt); }
}

async function renderHistory() {
  const attempts = await myAttempts();
  nav(`<span class="who">${esc(S.profile.displayName || S.profile.username)}</span>${logoutBtn()}`);
  app.innerHTML = `<div class="card">
    <div class="row between"><h1>ប្រវត្តិការធ្វើតេស្ត</h1><button class="btn ghost sm" id="back">← ត្រឡប់</button></div>
    ${attempts.length ? `<div class="tablewrap"><table><thead><tr><th>កាលបរិច្ឆេទ</th><th>មុខវិជ្ជា</th><th>មេរៀន/ជំពូក</th><th class="num">ពិន្ទុ</th><th class="num">ពេល</th></tr></thead><tbody>
      ${attempts.map((a) => `<tr class="clickable" data-id="${a.id}"><td>${fmtDate(a.finishedAt)}</td><td>${esc(sName(subjectOf(a.subject) || {}))}</td><td>${esc(a.title)}</td><td class="num ${pointsOf(a) >= 50 ? "ok-text" : "bad-text"}">${km(pointsOf(a))} / ១០០ <span class="muted small">(${km(a.score)}/${km(a.total)})</span></td><td class="num">${mins(a.totalMs)}</td></tr>`).join("")}
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

/* ---------- celebration: fireworks for a perfect 100, a cheer for 80+ ---------- */
function celebrate(points, attempt) {
  const en = S.uiLang === "en" || S.quizLang === "en";
  const name = esc(attempt.displayName || "");
  let title, text;
  if (points === 100) { title = en ? "Perfect score!" : "ពិន្ទុពេញ!"; text = en ? `Amazing, ${name}! 100 out of 100 — every answer right.` : `អស្ចារ្យណាស់ ${name}! ១០០ លើ ១០០ — ត្រឹមត្រូវទាំងអស់។`; }
  else if (points >= 80) { title = en ? "Great work!" : "ល្អណាស់!"; text = en ? `${name}, that's ${points} out of 100. Keep it up!` : `${name} បាន ${km(points)} លើ ១០០ — បន្តខិតខំទៀត!`; }
  else return;
  const card = app.querySelector(".card");
  const banner = document.createElement("div");
  banner.className = "cheer" + (points === 100 ? " gold" : "");
  banner.innerHTML = `<div class="cheer-title">${points === 100 ? "🎆 " : "⭐ "}${title}</div><div>${text}</div>`;
  card.insertBefore(banner, card.children[1]);
  if (points === 100 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) fireworks(7000);
}
function fireworks(duration) {
  const cv = document.createElement("canvas"); cv.className = "fireworks"; document.body.appendChild(cv);
  const ctx = cv.getContext("2d"); let W, H; const fit = () => { W = cv.width = innerWidth * devicePixelRatio; H = cv.height = innerHeight * devicePixelRatio; }; fit(); addEventListener("resize", fit);
  const rockets = [], sparks = [], hues = [45, 350, 200, 120, 280, 20];
  const launch = () => rockets.push({ x: W * (0.15 + 0.7 * Math.random()), y: H, vx: (Math.random() - 0.5) * 2 * devicePixelRatio, vy: -(9 + Math.random() * 4) * devicePixelRatio * (H / 900 / devicePixelRatio + 0.6), hue: hues[Math.floor(Math.random() * hues.length)], fuse: 55 + Math.random() * 25 });
  const burst = (r) => { const n = 90 + Math.random() * 50; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + Math.random() * 0.1, sp = (2 + Math.random() * 4) * devicePixelRatio; sparks.push({ x: r.x, y: r.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, hue: r.hue + (Math.random() * 30 - 15), life: 1, decay: 0.012 + Math.random() * 0.012, size: (1.2 + Math.random() * 1.6) * devicePixelRatio }); } };
  for (let i = 0; i < 3; i++) burst({ x: W * (0.2 + 0.6 * Math.random()), y: H * (0.2 + 0.3 * Math.random()), hue: hues[i * 2] });   // instant opening bursts
  const t0 = performance.now(); let last = 0, stop = false;
  function frame(t) {
    if (stop) return;
    ctx.globalCompositeOperation = "destination-out"; ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = "lighter";
    if (t - t0 < duration - 1800 && t - last > 330) { launch(); if (Math.random() < 0.6) launch(); last = t; }
    for (let i = rockets.length - 1; i >= 0; i--) { const r = rockets[i]; r.x += r.vx; r.y += r.vy; r.vy += 0.12 * devicePixelRatio; r.fuse--; ctx.fillStyle = `hsl(${r.hue} 100% 70%)`; ctx.beginPath(); ctx.arc(r.x, r.y, 2.2 * devicePixelRatio, 0, 7); ctx.fill(); if (r.fuse <= 0 || r.vy > -1) { burst(r); rockets.splice(i, 1); } }
    for (let i = sparks.length - 1; i >= 0; i--) { const p = sparks[i]; p.x += p.vx; p.y += p.vy; p.vy += 0.05 * devicePixelRatio; p.vx *= 0.985; p.vy *= 0.985; p.life -= p.decay; if (p.life <= 0) { sparks.splice(i, 1); continue; } ctx.fillStyle = `hsl(${p.hue} 100% ${55 + 35 * p.life}% / ${p.life})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, 7); ctx.fill(); }
    if (t - t0 < duration || rockets.length || sparks.length) requestAnimationFrame(frame); else end();
  }
  const end = () => { stop = true; removeEventListener("resize", fit); cv.classList.add("out"); setTimeout(() => cv.remove(), 600); };
  cv.addEventListener("click", end);
  requestAnimationFrame(frame);
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
      <span class="row small"><label class="row small"><input type="checkbox" id="active" ${u.active === false ? "" : "checked"}> គណនីសកម្ម</label>
      <label class="row small">ភាសាអេក្រង់ <select id="ulang"><option value="km" ${u.lang === "en" ? "" : "selected"}>ខ្មែរ</option><option value="en" ${u.lang === "en" ? "selected" : ""}>English</option></select></label></span></div>
    <p class="muted small">ធីកមេរៀន/ជំពូកដែលសិស្សអាចធ្វើបាន។ ជំពូកដែលមិនទាន់មានសំណួរ បង្ហាញស្រអាប់។</p>
    ${SUBJECTS.map((s) => `<div class="subjhead"><h3 style="color:${s.color}">${esc(sName(s))}</h3><span class="row"><button class="btn ghost sm" data-all="${s.id}">ទាំងអស់</button><button class="btn ghost sm" data-none="${s.id}">គ្មាន</button></span></div>
      <div class="checks">${s.chapters.map((c) => `<label class="check ${c.bank ? "" : "no"}"><input type="checkbox" data-ch="${c.id}" data-s="${s.id}" ${allowed.has(c.id) ? "checked" : ""} ${c.bank ? "" : "disabled"}><span>${unitOf(s, c)}៖ ${esc(c.title)}${c.bank ? "" : " <span class='muted small'>(មិនទាន់មានសំណួរ)</span>"}</span></label>`).join("")}</div>`).join("")}
    <div class="row between"><span id="permMsg" class="small">${S.admin.permSaved ? `<span class="ok-text">បានរក្សាទុក ✓</span>` : ""}</span><button class="btn primary" id="savePerm">រក្សាទុកសិទ្ធិ</button></div>
  </div>`;
}
function wirePermPanel(u, students) {
  const perm = $("perm");
  perm.querySelectorAll("[data-all]").forEach((b) => b.addEventListener("click", () => perm.querySelectorAll(`[data-s="${b.dataset.all}"]:not(:disabled)`).forEach((c) => (c.checked = true))));
  perm.querySelectorAll("[data-none]").forEach((b) => b.addEventListener("click", () => perm.querySelectorAll(`[data-s="${b.dataset.none}"]`).forEach((c) => (c.checked = false))));
  $("savePerm").addEventListener("click", async () => {
    const allowed = [...perm.querySelectorAll("[data-ch]:checked")].map((c) => c.dataset.ch);
    const active = $("active").checked, lang = $("ulang").value;
    $("savePerm").disabled = true;
    try {
      await updateDoc(doc(db, "users", u.uid), { allowed, active, lang });
      u.allowed = allowed; u.active = active; u.lang = lang;
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
    return `<tr><td><span style="color:${s.color};font-weight:600">${esc(sName(s))}</span><br><span class="small">${unitOf(s, c)} ${esc(c.title)}</span></td><td class="num">${km(as.length)}</td><td class="num">${km(best)}</td><td class="num">${km(pointsOf(last))}</td><td><div class="bar"><i style="width:${pointsOf(last)}%"></i></div></td><td class="num">${secs(avgMs)}</td></tr>`;
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
        return `<tr class="clickable" data-id="${a.id}"><td>${fmtDate(a.finishedAt)}</td><td>${esc(sName(subjectOf(a.subject) || {}))} · ${esc(a.title)}</td><td class="num ${pointsOf(a) >= 50 ? "ok-text" : "bad-text"}">${km(pointsOf(a))} / ១០០ <span class="muted small">(${km(a.score)}/${km(a.total)})</span></td><td class="num">${lv(1)}</td><td class="num">${lv(2)}</td><td class="num">${lv(3)}</td><td class="num">${mins(a.totalMs)}</td></tr>`; }).join("")}
    </tbody></table></div>
    ${weak.length ? `<h2 style="margin-top:14px">សំណួរដែលខុសក្នុងតេស្តចុងក្រោយ (${km(weak.length)})</h2>
    <div class="tablewrap"><table><thead><tr><th>មេរៀន/ជំពូក</th><th>សំណួរ</th><th>កម្រិត</th><th class="num">ពេល</th></tr></thead><tbody>
      ${weak.map(({ bank, a }) => `<tr><td class="small">${esc(bank.title)}</td><td>${km(a.i + 1)}. ${mf(bank.questions[a.i].q)}</td><td><span class="chip lv${a.lv}">${LEVELS[a.lv]}</span></td><td class="num">${secs(a.ms)}</td></tr>`).join("")}
    </tbody></table></div>` : ""}`;
  rep.querySelectorAll("[data-id]").forEach((r) => r.addEventListener("click", () => renderResult(attempts.find((a) => a.id === r.dataset.id), null, () => renderAdmin("reports"), `អ្នកគ្រប់គ្រង · ${S.user.email}`)));
}

/* ---------- question manager (admin) ---------- */
const QM = { subj: null, bank: null, data: null, dirty: false, edit: null, filter: "", lv: 0, stats: null, msg: null };
async function renderAdminBanks() {
  const body = $("tabBody");
  if (!QM.subj) QM.subj = SUBJECTS[0].id;
  const subj = subjectOf(QM.subj);
  const chapters = subj.chapters.filter((c) => c.bank);
  if (!QM.bank || !chapters.some((c) => c.id === QM.bank)) { QM.bank = chapters[0]?.id || null; QM.data = null; QM.dirty = false; QM.edit = null; QM.stats = null; }
  body.innerHTML = `<div style="margin-top:14px;display:grid;gap:14px">
    <div class="notice row between" id="qmDbStatus"><span>កំពុងពិនិត្យមូលដ្ឋានទិន្នន័យ…</span></div>
    <div class="row" style="gap:14px;align-items:flex-end">
      <div class="field"><label for="qmSubj">មុខវិជ្ជា</label><select id="qmSubj">${SUBJECTS.map((x) => `<option value="${x.id}" ${x.id === QM.subj ? "selected" : ""}>${esc(x.name)}</option>`).join("")}</select></div>
      <div class="field" style="min-width:260px"><label for="qmBank">មេរៀន/ជំពូក</label><select id="qmBank">${chapters.map((c) => `<option value="${c.id}" ${c.id === QM.bank ? "selected" : ""}>${unitOf(subj, c)}៖ ${esc(c.title)}</option>`).join("")}</select></div>
      <div class="field" style="flex:1;min-width:200px"><label for="qmFind">ស្វែងរក</label><input id="qmFind" value="${esc(QM.filter)}" placeholder="ពាក្យក្នុងសំណួរ ចម្លើយ ឬការពន្យល់"></div>
      <div class="field"><label for="qmLv">កម្រិត</label><select id="qmLv"><option value="0">ទាំងអស់</option>${[1, 2, 3].map((l) => `<option value="${l}" ${QM.lv === l ? "selected" : ""}>${LEVELS[l]}</option>`).join("")}</select></div>
    </div>
    <div id="qmBody"><p class="muted">កំពុងទាញ…</p></div>
  </div>`;
  $("qmSubj").addEventListener("change", (e) => { QM.subj = e.target.value; QM.bank = null; QM.filter = ""; renderAdminBanks(); });
  $("qmBank").addEventListener("change", (e) => { if (QM.dirty && !confirmDiscard()) { e.target.value = QM.bank; return; } QM.bank = e.target.value; QM.data = null; QM.dirty = false; QM.edit = null; QM.stats = null; renderAdminBanks(); });
  $("qmFind").addEventListener("input", (e) => { QM.filter = e.target.value; renderQmList(); });
  $("qmLv").addEventListener("change", (e) => { QM.lv = +e.target.value; renderQmList(); });
  renderDbStatus();
  if (!QM.bank) { $("qmBody").innerHTML = `<p class="muted">មុខវិជ្ជានេះមិនទាន់មានសំណួរទេ។</p>`; return; }
  if (!QM.data) { const b = await loadBank(QM.bank); QM.data = JSON.parse(JSON.stringify({ id: b.id, subject: b.subject, title: b.title, rev: revOf(b), quizSize: b.quizSize || null, questions: b.questions })); QM.fromDb = !!b.fromDb; QM.staleDb = !!b.staleDb; }
  renderQmList();
  if (!QM.stats) loadQmStats();
}
// How many chapters live in Firestore; one-click import of the rest from the files.
async function renderDbStatus() {
  const el = $("qmDbStatus"); if (!el) return;
  let docs = [];
  try { docs = (await getDocs(collection(db, "banks"))).docs; } catch (e) { el.innerHTML = `<span class="bad-text">អានមូលដ្ឋានទិន្នន័យមិនបាន (${esc(e.code || e)}) — សូមពិនិត្យ firestore.rules ផ្នែក banks។</span>`; return; }
  const dbRev = Object.fromEntries(docs.map((d) => [d.id, revOf(d.data())]));
  QM.inDb = new Set(docs.map((d) => d.id));
  const missing = ALL_BANKS.filter((id) => !QM.inDb.has(id));
  // chapters whose file is newer than the database copy (file rev > db rev)
  const stale = [];
  for (const id of ALL_BANKS) if (QM.inDb.has(id)) { try { if (revOf(await loadFileBank(id)) > dbRev[id]) stale.push(id); } catch {} }
  const total = ALL_BANKS.length;
  el.innerHTML = `<span><strong>មូលដ្ឋានទិន្នន័យ Firestore៖</strong> ${km(docs.length)} / ${km(total)} ជំពូកនៅក្នុងមូលដ្ឋានទិន្នន័យ${missing.length ? ` · ${km(missing.length)} ជំពូកនៅតែអានពីឯកសារ` : ""}${stale.length ? ` · <span class="warn-text">${km(stale.length)} ជំពូកមានឯកសារកំណែថ្មីជាង (កំពុងប្រើឯកសារ)</span>` : ""}${!missing.length && !stale.length ? " · ទាំងអស់អានពីមូលដ្ឋានទិន្នន័យ" : ""}</span>
    ${missing.length ? `<button class="btn sm primary" id="qmImportAll">នាំចូល ${km(missing.length)} ជំពូកទៅមូលដ្ឋានទិន្នន័យ</button>` : ""}
    ${stale.length ? `<button class="btn sm primary" id="qmUpdateAll">ធ្វើបច្ចុប្បន្នភាព ${km(stale.length)} ជំពូកពីឯកសារ</button>` : ""}
    ${!missing.length && !stale.length ? `<span class="ok-text small">✓ សំណួរទាំងអស់ស្ថិតក្នុង Firestore</span>` : ""}`;
  const pushFromFiles = (ids, source) => async (e) => {
    e.target.disabled = true; let n = 0;
    for (const id of ids) {
      try { await setDoc(doc(db, "banks", id), filePayload(await loadFileBank(id), source)); delete bankCache[id]; n++; e.target.textContent = `កំពុងដំណើរការ… ${km(n)} / ${km(ids.length)}`; }
      catch (err) { el.innerHTML = `<span class="bad-text">បរាជ័យនៅ ${id}: ${esc(err.code || err)}</span>`; return; }
    }
    QM.data = null; renderAdminBanks();
  };
  $("qmImportAll")?.addEventListener("click", pushFromFiles(missing, "file"));
  $("qmUpdateAll")?.addEventListener("click", pushFromFiles(stale, "file-update"));
}
function confirmDiscard() { QM.msg = { bad: true, text: "មានការកែប្រែមិនទាន់រក្សាទុក។ សូមចុច «រក្សាទុកទៅមូលដ្ឋានទិន្នន័យ» ឬ «បោះបង់ការកែប្រែ» ជាមុនសិន។" }; renderQmList(); return false; }
async function loadQmStats() {
  try {
    const qs = await getDocs(query(collection(db, "attempts"), where("bankId", "==", QM.bank)));
    const st = {}; qs.docs.forEach((d) => d.data().answers?.forEach((a) => { const k = String(a.i); st[k] = st[k] || { n: 0, c: 0, ms: 0 }; st[k].n++; if (a.correct) st[k].c++; st[k].ms += a.ms || 0; }));
    QM.stats = st;
  } catch (e) { QM.stats = {}; }
  renderQmList();
}
const qmMatches = (q) => { const f = QM.filter.trim().toLowerCase(); return (!QM.lv || q.lv === QM.lv) && (!f || [q.q, ...q.o, q.ex || ""].join(" ").toLowerCase().includes(f)); };
function renderQmList() {
  const el = $("qmBody"); if (!el || !QM.data) return;
  const D = QM.data, { s, c } = chapterOf(D.id);
  const lvCount = [1, 2, 3].map((l) => D.questions.filter((q) => q.lv === l).length);
  const rows = D.questions.map((q, i) => ({ q, i })).filter(({ q }) => qmMatches(q));
  const stat = (i) => { const x = QM.stats?.[String(i)]; if (!x) return `<span class="muted small">—</span>`; const pc = Math.round((100 * x.c) / x.n); return `<span class="${pc >= 60 ? "ok-text" : pc >= 35 ? "" : "bad-text"}">${km(pc)}%</span><br><span class="muted small">${km(x.n)} ដង · ${secs(x.ms / x.n)}</span>`; };
  el.innerHTML = `
    <div class="row between">
      <div class="row"><span class="chip" style="border-color:${s.color};color:${s.color}">${esc(s.name)}</span><span class="chip">${unitOf(s, c)}</span><span class="chip">${km(D.questions.length)} សំណួរ · ${km(lvCount[0])} / ${km(lvCount[1])} / ${km(lvCount[2])}</span>
        <span class="chip ${QM.fromDb ? "lv2" : ""}">${QM.fromDb ? "កំណែកែប្រែលើអ៊ីនធឺណិត" : `កំណែពីឯកសារ (កំណែ ${km(D.rev || 1)})`}</span>${QM.staleDb ? `<span class="chip lv3" title="ឯកសារថ្មីជាងកំណែក្នុង Firestore — ចុច «រក្សាទុកទៅមូលដ្ឋានទិន្នន័យ» ដើម្បីធ្វើបច្ចុប្បន្នភាព">កំណែ Firestore ចាស់</span>` : ""}${QM.dirty ? `<span class="chip lv3">មិនទាន់រក្សាទុក</span>` : ""}</div>
      <div class="row">
        <button class="btn sm" id="qmAdd">+ បន្ថែមសំណួរ</button>
        <button class="btn sm" id="qmExport" title="ទាញយកជាឯកសារ data/${D.id}.js">នាំចេញ .js</button>
        ${QM.fromDb ? `<button class="btn sm danger" id="qmReset">ត្រឡប់ទៅកំណែឯកសារ</button>` : ""}
        <button class="btn sm ghost" id="qmDiscard" ${QM.dirty ? "" : "disabled"}>បោះបង់ការកែប្រែ</button>
        <button class="btn sm primary" id="qmSave" ${QM.dirty || QM.staleDb ? "" : "disabled"}>រក្សាទុកទៅមូលដ្ឋានទិន្នន័យ</button>
      </div>
    </div>
    ${QM.msg ? `<div class="notice ${QM.msg.bad ? "bad" : "ok"}">${esc(QM.msg.text)}</div>` : ""}
    <p class="muted small">ចុច «កែ» ដើម្បីកែសំណួរ។ ការកែប្រែមានប្រសិទ្ធភាពសម្រាប់សិស្សភ្លាមៗ បន្ទាប់ពី «រក្សាទុកទៅមូលដ្ឋានទិន្នន័យ»។ ជួរឈរ «លទ្ធផល» បង្ហាញភាគរយដែលសិស្សឆ្លើយត្រូវ។</p>
    <div class="tablewrap"><table class="qm"><thead><tr><th>#</th><th>កម្រិត</th><th style="min-width:320px">សំណួរ និងចម្លើយ</th><th>លទ្ធផល</th><th></th></tr></thead><tbody>
      ${rows.map(({ q, i }) => QM.edit === i ? qmEditorRow(q, i) : `<tr>
        <td class="num">${km(i + 1)}</td><td><span class="chip lv${q.lv}">${LEVELS[q.lv]}</span></td>
        <td><div class="qm-q">${mf(q.q)}</div><ol class="qm-o">${q.o.map((o, k) => `<li class="${k === q.a ? "ok-text" : ""}">${LETTERS[k]}. ${mf(o)}${k === q.a ? " ✓" : ""}</li>`).join("")}</ol>${q.ex ? `<div class="qm-ex">${mf(q.ex)}</div>` : ""}</td>
        <td>${stat(i)}</td>
        <td class="num"><button class="btn sm" data-edit="${i}">កែ</button> <button class="btn sm danger" data-del="${i}">លុប</button></td></tr>`).join("")}
      ${rows.length ? "" : `<tr><td colspan="5" class="muted">គ្មានសំណួរត្រូវនឹងការស្វែងរក។</td></tr>`}
    </tbody></table></div>`;
  QM.msg = null;
  el.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => { QM.edit = +b.dataset.edit; renderQmList(); }));
  el.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => { const i = +b.dataset.del; if (!b.dataset.sure) { b.dataset.sure = "1"; b.textContent = "លុបពិតមែន?"; return; } D.questions.splice(i, 1); QM.dirty = true; QM.edit = null; renderQmList(); }));
  $("qmAdd").addEventListener("click", () => { D.questions.push({ lv: 2, q: "", o: ["", "", "", ""], a: 0, ex: "" }); QM.edit = D.questions.length - 1; QM.filter = ""; QM.lv = 0; renderQmList(); $(`qmEdit${QM.edit}`)?.scrollIntoView({ block: "center" }); });
  $("qmSave").addEventListener("click", saveQmBank);
  $("qmDiscard").addEventListener("click", () => { QM.data = null; QM.dirty = false; QM.edit = null; renderAdminBanks(); });
  $("qmExport").addEventListener("click", exportQmBank);
  $("qmReset")?.addEventListener("click", async (e) => { if (!e.target.dataset.sure) { e.target.dataset.sure = "1"; e.target.textContent = "លុបកំណែអ៊ីនធឺណិត ហើយប្រើឯកសារវិញ?"; return; } await deleteDoc(doc(db, "banks", D.id)); delete bankCache[D.id]; QM.data = null; QM.dirty = false; QM.msg = { text: "បានត្រឡប់ទៅកំណែឯកសារ។" }; renderAdminBanks(); });
  wireQmEditor();
}
function qmEditorRow(q, i) {
  return `<tr id="qmEdit${i}"><td class="num">${km(i + 1)}</td><td colspan="4"><div class="qm-editor">
    <div class="row"><label class="row small">កម្រិត <select id="qeLv">${[1, 2, 3].map((l) => `<option value="${l}" ${q.lv === l ? "selected" : ""}>${LEVELS[l]}</option>`).join("")}</select></label><span class="muted small">គណិតសរសេរក្នុង $…$ (ឧ. $\\frac{2}{3}$, $\\sqrt{60}$) ឬប្រើ √ និង / សម្រាប់ធនាគារខ្មែរ</span></div>
    <div class="field"><label>សំណួរ</label><textarea id="qeQ" rows="2">${esc(q.q)}</textarea></div>
    ${q.o.map((o, k) => `<div class="field row" style="flex-wrap:nowrap"><label class="row small" style="white-space:nowrap"><input type="radio" name="qeA" value="${k}" ${q.a === k ? "checked" : ""}> ${LETTERS[k]}</label><input id="qeO${k}" value="${esc(o)}" placeholder="ចម្លើយ ${LETTERS[k]}"></div>`).join("")}
    <div class="field"><label>ការពន្យល់ (ចាំបាច់សម្រាប់កម្រិតពិបាក)</label><textarea id="qeEx" rows="2">${esc(q.ex || "")}</textarea></div>
    <div class="row between"><div id="qePreview" class="qm-preview"></div><span class="row"><button class="btn sm ghost" id="qeCancel">បោះបង់</button><button class="btn sm primary" id="qeOk">យល់ព្រម</button></span></div>
    <div id="qeErr" class="bad-text small"></div>
  </div></td></tr>`;
}
function wireQmEditor() {
  if (QM.edit == null || !$("qeQ")) return;
  const D = QM.data, i = QM.edit;
  const read = () => ({ lv: +$("qeLv").value, q: $("qeQ").value.trim(), o: [0, 1, 2, 3].map((k) => $(`qeO${k}`).value.trim()), a: +(document.querySelector('input[name="qeA"]:checked')?.value ?? 0), ex: $("qeEx").value.trim() });
  const preview = () => { const q = read(); $("qePreview").innerHTML = `<div class="qm-q">${mf(q.q)}</div><ol class="qm-o">${q.o.map((o, k) => `<li class="${k === q.a ? "ok-text" : ""}">${LETTERS[k]}. ${mf(o)}</li>`).join("")}</ol>${q.ex ? `<div class="qm-ex">${mf(q.ex)}</div>` : ""}`; };
  ["qeQ", "qeEx", "qeO0", "qeO1", "qeO2", "qeO3"].forEach((id) => $(id).addEventListener("input", preview));
  document.querySelectorAll('input[name="qeA"]').forEach((r) => r.addEventListener("change", preview));
  preview();
  $("qeCancel").addEventListener("click", () => { if (!D.questions[i].q && D.questions[i].o.every((o) => !o)) D.questions.splice(i, 1); QM.edit = null; renderQmList(); });
  $("qeOk").addEventListener("click", () => {
    const q = read(); const err = validateQ(q);
    if (err) { $("qeErr").textContent = err; return; }
    if (!q.ex) delete q.ex;
    D.questions[i] = q; QM.dirty = true; QM.edit = null; renderQmList();
  });
}
function validateQ(q) {
  if (q.q.length < 5) return "សំណួរខ្លីពេក។";
  if (q.o.some((o) => !o)) return "ត្រូវបំពេញចម្លើយទាំងបួន។";
  if (new Set(q.o.map((o) => o.replace(/\s+/g, " "))).size !== 4) return "ចម្លើយត្រូវខុសគ្នាទាំងបួន។";
  if (q.lv === 3 && q.ex.length < 10) return "សំណួរកម្រិតពិបាកត្រូវមានការពន្យល់។";
  for (const t of [q.q, ...q.o, q.ex]) if ((t.split(/(?<!\\)\$/).length - 1) % 2) return "សញ្ញា $ មិនគូ (unbalanced) ក្នុង៖ " + t.slice(0, 40);
  return "";
}
async function saveQmBank() {
  const D = QM.data;
  if (D.questions.length < 15) { QM.msg = { bad: true, text: "ត្រូវមានយ៉ាងតិច ១៥ សំណួរក្នុងមេរៀនមួយ។" }; renderQmList(); return; }
  $("qmSave").disabled = true;
  try {
    const payload = { id: D.id, subject: D.subject, title: D.title, rev: D.rev || 1, questions: D.questions, updatedAt: Date.now(), updatedBy: S.user.email }; if (D.quizSize) payload.quizSize = D.quizSize;
    await setDoc(doc(db, "banks", D.id), payload);
    bankCache[D.id] = { ...payload, fromDb: true }; QM.fromDb = true; QM.staleDb = false; QM.dirty = false; QM.msg = { text: `បានរក្សាទុក ${km(D.questions.length)} សំណួរ។ សិស្សនឹងឃើញកំណែថ្មីនៅពេលចាប់ផ្តើមតេស្តបន្ទាប់។` };
  } catch (e) { QM.msg = { bad: true, text: "រក្សាទុកមិនបាន៖ " + (e.code || e) + (String(e.code).includes("permission") ? " — សូមពិនិត្យថា firestore.rules មានផ្នែក banks (មើល SETUP.md)។" : "") }; }
  renderQmList();
}
function exportQmBank() {
  const D = QM.data, { s, c } = chapterOf(D.id);
  const js = (v) => JSON.stringify(v);
  const lines = D.questions.map((q) => `    { lv: ${q.lv}, q: ${js(q.q)}, o: [${q.o.map(js).join(", ")}], a: ${q.a}${q.ex ? `,\n      ex: ${js(q.ex)}` : ""} },`);
  const out = `// ${s.name} · ${unitOf(s, c)} · ${D.title}\n// exported from the online question manager ${new Date().toISOString().slice(0, 10)}\nexport default {\n  id: ${js(D.id)},\n  subject: ${js(D.subject)},\n  title: ${js(D.title)},\n  rev: ${D.rev || 1},${D.quizSize ? `\n  quizSize: ${D.quizSize},` : ""}\n  questions: [\n${lines.join("\n")}\n  ],\n};\n`;
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([out], { type: "text/javascript" })); a.download = `${D.id}.js`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
