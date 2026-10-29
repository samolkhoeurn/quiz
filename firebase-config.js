// ===================================================================
//  Firebase configuration — fill this in once (see SETUP.md, step 3)
//  Paste the object Firebase shows you under
//  Project settings → General → Your apps → SDK setup and configuration
// ===================================================================
export const firebaseConfig = {
  apiKey: "AIzaSyC2x_MUaUszkrtR5MFDAf_WmnNVRCmthG0",
  authDomain: "khmer-quiz-aa213.firebaseapp.com",
  projectId: "khmer-quiz-aa213",
  storageBucket: "khmer-quiz-aa213.firebasestorage.app",
  messagingSenderId: "261600310413",
  appId: "1:261600310413:web:06647a1aa85df7185e1ec4",
};

// The one e-mail address that gets the admin screen.
// Must match exactly the e-mail of the user you create in Firebase → Authentication (SETUP.md, step 5)
// and the ADMIN_EMAIL inside firestore.rules.
// Admin accounts (all lower-case). Keep the same list inside isAdmin() in firestore.rules.
export const ADMIN_EMAILS = ["samol.khoeurn@gmail.com"];
export const ADMIN_EMAIL = ADMIN_EMAILS[0];

// Students log in with a short username; internally it becomes <username>@g9quiz.local
export const STUDENT_EMAIL_DOMAIN = "g9quiz.local";
