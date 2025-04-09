// src/js/auth.js
import { auth } from "./firebase.js";
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { init } from "./ui.js";

const provider = new GoogleAuthProvider();

function signInWithGoogle() {
  signInWithPopup(auth, provider)
    .then((result) => {
      console.log("Signed in as:", result.user.uid);
      document.getElementById("signin-container").style.display = "none";
      document.getElementById("calendar-app").style.display = "block";
      init();
    })
    .catch((error) => {
      console.error("Google sign-in failed:", error);
    });
}

function handleSignOut() {
  signOut(auth)
    .then(() => {
      console.log("User signed out successfully");
    })
    .catch((error) => {
      console.error("Error signing out:", error);
    });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is signed in:", user.uid);
    document.getElementById("signin-container").style.display = "none";
    document.getElementById("calendar-app").style.display = "block";
    init();
  } else {
    console.log("User is signed out");
    document.getElementById("signin-container").style.display = "block";
    document.getElementById("calendar-app").style.display = "none";
  }
});

export { signInWithGoogle, handleSignOut };