# Setting up accounts and reports (Firebase) — one-time, about 10 minutes

The quiz site itself is static and lives on GitHub Pages. Student logins, chapter permissions
and the results reports are stored in **Firebase** (Google), which is free at this scale
(Spark plan: 50 000 reads / 20 000 writes per day — a family will never get close).

You only do this once. Afterwards everything is managed from the admin screen on the site.

## 1. Create the Firebase project

1. Go to <https://console.firebase.google.com> and sign in with a Google account.
2. Click **Create a project** (or *Add project*). Name it e.g. `khmer-quiz`.
3. When asked about Google Analytics, turn it **off** (not needed). Click *Create project*, then *Continue*.

## 2. Turn on Email/Password sign-in

1. In the left menu choose **Build → Authentication**, then **Get started**.
2. Open the **Sign-in method** tab, click **Email/Password**, switch the first toggle **Enable** on, *Save*.
   (Leave "Email link (passwordless)" off.)

## 3. Register the web app and copy its config

1. Click the gear icon next to *Project Overview* → **Project settings**.
2. Scroll to **Your apps**, click the **</>** (Web) icon. Nickname: `quiz-site`. Do **not** tick Firebase Hosting. *Register app*.
3. Firebase shows a block like:

   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "khmer-quiz-xxxxx.firebaseapp.com",
     projectId: "khmer-quiz-xxxxx",
     storageBucket: "khmer-quiz-xxxxx.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abcdef"
   };
   ```

4. Open `firebase-config.js` in the repository and replace the `PASTE_...` values with yours (keep the quotes).
   Also check `ADMIN_EMAIL` is the e-mail address you want to use as admin.

   This config is not a secret — it is meant to be public in the page. Security comes from the rules in step 4.

## 4. Create the Firestore database and publish the security rules

1. Left menu **Build → Firestore Database** → **Create database**.
2. Location: choose `asia-southeast1 (Singapore)`. Click *Next*.
3. Choose **Start in production mode** (locked). *Create*.
4. Open the **Rules** tab. Delete everything in the editor and paste the full contents of `firestore.rules`
   from the repository. **Change the e-mail** in the `isAdmin()` function to the same `ADMIN_EMAIL`. Click **Publish**.

## 5. Create the admin account

1. **Build → Authentication → Users** tab → **Add user**.
2. E-mail: the `ADMIN_EMAIL` address. Password: choose a strong one. *Add user*.

   The admin is recognised purely by this e-mail (it is checked in the rules and in the site), so nothing else is needed.

## 6. Allow the site's domain

1. **Authentication → Settings → Authorized domains** → *Add domain*.
2. Add `samolkhoeurn.github.io` (and later your custom domain, e.g. `khmerquiz.com`). `localhost` is already there.

## 7. Push and test

1. Commit and push the edited `firebase-config.js` (GitHub Desktop: *Commit to main* → *Push origin*).
2. Open the site, log in with the admin e-mail and password. You land on **ផ្ទាំងគ្រប់គ្រង**.
3. Tab **សិស្ស និងសិទ្ធិ** → create a student (name, username such as `sokha`, password). Tick the chapters he may see → **រក្សាទុកសិទ្ធិ**.
4. Give him the username and password. He logs in on the same site, sees only the chapters you ticked, takes a quiz,
   and the result appears for you under **របាយការណ៍** (with per-question timing).

## Everyday use

- **Open/close chapters**: admin → សិស្ស និងសិទ្ធិ → pick the student → tick/untick → save. Takes effect on his next page load.
- **Reports**: admin → របាយការណ៍ → pick the student. Summary per chapter, every attempt, the questions he got wrong last time; click an attempt for the full per-question breakdown with seconds spent.
- **Add a chapter's questions**: a new file `data/<subject>-<nn>.js` plus `bank: true` on that chapter in `data/subjects.js`, then push.
- **Forgotten student password**: the student can change it himself after logging in (ប្តូរពាក្យសម្ងាត់). If he cannot log in at all, create a new account for him (old results stay attached to the old account); or reset it in Firebase console → Authentication → Users → ⋮ → *Reset password* is e-mail based and will not work for the `@g9quiz.local` usernames, so creating a new account is the practical route.
- **Disable a student**: untick *គណនីសកម្ម* in his permissions panel.

## Troubleshooting

- *The page shows "ត្រូវការការកំណត់ Firebase"* → `firebase-config.js` still contains `PASTE_` values, or the push has not finished.
- *Login says `auth/unauthorized-domain`* → step 6.
- *Admin sees "Missing or insufficient permissions"* → the e-mail in `firestore.rules` does not match the admin's e-mail exactly (case matters), or the rules were not published.
- *Student creation fails with `auth/operation-not-allowed`* → step 2 (Email/Password not enabled).
