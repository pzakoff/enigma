/* src/js/editors/ReservationEditorHandlers.js */
import { calendars, saveCalendarsToFirebase } from "../calendar.js";
import { renderCalendar } from "../calendar.js";
// Use CDN for Luxon
import { DateTime } from "https://cdn.jsdelivr.net/npm/luxon@3.3.0/build/es6/luxon.js";

/**
 * Close the reservation editor modal.
 */
export function closeReservationEditor() {
  document.getElementById("reservation-editor").style.display = "none";
  document.getElementById("modal-overlay").style.display = "none";
}

/**
 * Handle saving the reservation: perform overlap checks, gather data, save to Firestore, and re-render.
 */
export function handleSaveReservation() {
  const propKey = document.getElementById("reservation-property-selector").value;
  const room = document.getElementById("reservation-room-selector").value;
  const startDate = document.getElementById("reservation-start-date").value;
  const endDate = document.getElementById("reservation-end-date").value;
  const numGuests = parseInt(document.getElementById("reservation-num-guests").value, 10);

  const newStart = DateTime.fromFormat(startDate, "yyyy-MM-dd", { zone: "Europe/Sofia" });
  const newEnd = DateTime.fromFormat(endDate, "yyyy-MM-dd", { zone: "Europe/Sofia" });

  const reservations = calendars[propKey].reservations || [];
  const existingId = document.getElementById("reservation-editor").dataset.reservationId;

  // Overlap check.
  for (let i = 0; i < reservations.length; i++) {
    const r = reservations[i];
    if (r.room !== room) continue;
    if (existingId && existingId === r.id) continue;

    const existStart = DateTime.fromFormat(r.startDate, "yyyy-MM-dd", { zone: "Europe/Sofia" });
    const existEnd = DateTime.fromFormat(r.endDate, "yyyy-MM-dd", { zone: "Europe/Sofia" });

    if (newStart < existEnd && newEnd > existStart) {
      if (!(newStart.valueOf() === existEnd.valueOf() || newEnd.valueOf() === existStart.valueOf())) {
        alert("This reservation overlaps with an existing reservation. Please adjust your dates.");
        return;
      }
    }
  }

  // Gather guest details.
  const guests = [];
  let validGuestFound = false;
  const guestFields = document.querySelectorAll("#reservation-guests-container .guest-field");
  guestFields.forEach((field) => {
    const firstName = field.querySelector(".first-name").value.trim();
    const lastName = field.querySelector(".last-name").value.trim();
    const address = field.querySelector(".address").value.trim();
    const personalNumber = field.querySelector(".personal-number").value.trim();
    const telephone = field.querySelector(".telephone").value.trim();
    const email = field.querySelector(".email").value.trim();
    if (firstName && lastName) {
      validGuestFound = true;
    }
    guests.push({
      firstName,
      lastName,
      address,
      personalNumber,
      telephone,
      email,
    });
  });
  if (!validGuestFound) {
    alert("Please provide at least one guest's first and last name.");
    return;
  }

  const price = document.getElementById("reservation-price").value;
  const additionalInfo = document.getElementById("reservation-additional-info").value;
  const reservationColor = document.getElementById("reservation-color").value;
  const reservationSource = document.getElementById("reservation-source").value;
  const breakfast = document.getElementById("reservation-breakfast").checked;
  const breakfastCount = parseInt(document.getElementById("reservation-breakfast-count").value, 10) || 0;

  let reservation = {
    id: existingId ? existingId : Date.now().toString(),
    propertyKey: propKey,
    room,
    startDate,
    endDate,
    numGuests,
    guests,
    price,
    additionalInfo,
    color: reservationColor,
    source: reservationSource,
    breakfast,
    breakfastCount,
  };

  console.log("Reservation added:", reservation);

  if (existingId) {
    const index = reservations.findIndex((r) => r.id === existingId);
    if (index !== -1) {
      reservations[index] = reservation;
    }
  } else {
    reservations.push(reservation);
  }

  saveCalendarsToFirebase().then(() => {
    renderCalendar();
    closeReservationEditor();
  });
}