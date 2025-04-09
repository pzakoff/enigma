// src/js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getAuth, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgy_znR_EnMSRejBKFDeDIgluZ25bT8NY",
  authDomain: "project-enigma-9a96b.firebaseapp.com",
  databaseURL: "https://project-enigma-9a96b-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "project-enigma-9a96b",
  storageBucket: "project-enigma-9a96b.appspot.com",
  messagingSenderId: "412018832411",
  appId: "1:412018832411:web:d30c0013f6f39bcf7534be",
  measurementId: "G-MXXWZSEM9Y"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Ensure auth state is persisted in the browser
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting auth persistence:", error);
});

export { app, analytics, db, auth };