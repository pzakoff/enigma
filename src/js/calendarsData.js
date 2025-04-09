// src/js/calendarsData.js
import { db } from "./firebase.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
const DateTime = luxon.DateTime;

/**
 * Main calendars object
 */
let calendars = {
  main: { name: "Main Calendar" }
};

/**
 * A state object for mutable data.
 */
const state = {
  currentDate: DateTime.local().setZone("Europe/Sofia")
};

/**
 * Firestore document reference for storing calendar data.
 */
const docRef = doc(db, "calendars", "data");

/**
 * Ensure a property has the necessary arrays.
 */
function ensurePropertyData(propertyKey) {
  if (!calendars[propertyKey].rooms) {
    calendars[propertyKey].rooms = [];
  }
  if (!calendars[propertyKey].reservations) {
    calendars[propertyKey].reservations = [];
  }
}

/**
 * Load calendars from Firestore.
 */
async function loadCalendarsFromFirebase() {
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.calendars) {
        calendars = data.calendars;
      }
    } else {
      console.log("No data found in Firestore; using default calendars.");
    }
  } catch (error) {
    console.error("Error loading calendars:", error);
  }
}

/**
 * Save calendars to Firestore.
 */
async function saveCalendarsToFirebase() {
  try {
    await setDoc(docRef, { calendars });
    console.log("Calendars saved to Firebase");
  } catch (error) {
    console.error("Error saving calendars:", error);
  }
}

export { calendars, state, ensurePropertyData, loadCalendarsFromFirebase, saveCalendarsToFirebase };