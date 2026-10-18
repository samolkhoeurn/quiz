// ===================================================================
//  Firebase configuration — fill this in once (see SETUP.md, step 3)
//  Paste the object Firebase shows you under
//  Project settings → General → Your apps → SDK setup and configuration
// ===================================================================
export const firebaseConfig = {
  apiKey: "PASTE_API_KEY",
  authDomain: "PASTE_PROJECT_ID.firebaseapp.com",
  projectId: "PASTE_PROJECT_ID",
  storageBucket: "PASTE_PROJECT_ID.appspot.com",
  messagingSenderId: "PASTE_SENDER_ID",
  appId: "PASTE_APP_ID",
};

// The one e-mail address that gets the admin screen.
// Must match exactly the e-mail of the user you create in Firebase → Authentication (SETUP.md, step 5)
// and the ADMIN_EMAIL inside firestore.rules.
export const ADMIN_EMAIL = "samol.khoeurn@imc.com";

// Students log in with a short username; internally it becomes <username>@g9quiz.local
export const STUDENT_EMAIL_DOMAIN = "g9quiz.local";
