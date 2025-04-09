// src/js/app.js
import { bindUIEvents, init } from "./ui.js";

document.addEventListener("DOMContentLoaded", () => {
  bindUIEvents();
  // The auth module's onAuthStateChanged will call init() if the user is already signed in.
});