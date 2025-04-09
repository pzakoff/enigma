/* src/js/editors/ReservationEditorUI.js */
import { makeModalDraggable } from "./modalHelper.js";
import {
  getDisabledDateRanges,
  updateReservationGuestOptions,
  toggleBreakfastCount,
  updateReservationGuestFields,
  updateReservationRoomSelector
} from "./ReservationEditorUtils.js";
import {
  handleSaveReservation,
  closeReservationEditor as closeRes  // <--- Renamed import here
} from "./ReservationEditorHandlers.js";
import { calendars } from "../calendar.js";
import { renderCalendar } from "../calendar.js";

// Re-export the renamed import as 'closeReservationEditor'
export { closeRes as closeReservationEditor };

// Import Luxon from a CDN ESM build
import { DateTime } from "https://cdn.jsdelivr.net/npm/luxon@3.3.0/build/es6/luxon.js";

/**
 * Use a single-file build of Flatpickr from Skypack.
 * Removing the version specifier may help prevent 404 errors.
 */
import flatpickr from "https://cdn.skypack.dev/flatpickr";

export function openReservationEditor(existingReservation = null) {
  const reservationEditor = document.getElementById("reservation-editor");
  delete reservationEditor.dataset.reservationId;

  // Create or update the draggable header
  let header = reservationEditor.querySelector(".modal-header");
  if (!header) {
    header = document.createElement("div");
    header.className = "modal-header";
    header.style.backgroundColor = "#0071c2";
    header.style.color = "#fff";
    header.style.padding = "10px";
    header.style.fontSize = "18px";
    header.style.fontWeight = "bold";
    header.style.cursor = "move";
    reservationEditor.insertBefore(header, reservationEditor.firstChild);
  }
  header.textContent = existingReservation ? "Edit Reservation" : "Add Reservation";

  // Remove any extra header below the draggable header.
  const extraHeader = reservationEditor.querySelector("h2");
  if (extraHeader) {
    extraHeader.remove();
  }

  // Show/hide the delete button if it exists.
  const deleteBtn = document.getElementById("delete-reservation-btn");
  if (deleteBtn) {
    deleteBtn.style.display = existingReservation ? "inline-block" : "none";
  }

  // Populate the property selector
  const currentCalendarKey = document.getElementById("calendar-selector").value;
  const propertySelector = document.getElementById("reservation-property-selector");
  propertySelector.innerHTML = "";

  if (currentCalendarKey === "main") {
    for (const key in calendars) {
      if (key === "main") continue;
      const option = document.createElement("option");
      option.value = key;
      option.textContent = calendars[key].name;
      propertySelector.appendChild(option);
    }
  } else {
    const option = document.createElement("option");
    option.value = currentCalendarKey;
    option.textContent = calendars[currentCalendarKey].name;
    propertySelector.appendChild(option);
  }

  updateReservationRoomSelector();

  // Bind events for room selection and breakfast checkbox
  const roomSelector = document.getElementById("reservation-room-selector");
  roomSelector.addEventListener("change", updateReservationGuestOptions);
  updateReservationGuestOptions();

  const breakfastCheckbox = document.getElementById("reservation-breakfast");
  breakfastCheckbox.addEventListener("change", toggleBreakfastCount);
  toggleBreakfastCount();

  // Handle new or existing reservation data
  if (!existingReservation) {
    // New reservation defaults
    const todayStr = DateTime.local().setZone("Europe/Sofia").toFormat("yyyy-MM-dd");
    const nextWeekStr = DateTime.local().setZone("Europe/Sofia").plus({ days: 7 }).toFormat("yyyy-MM-dd");

    document.getElementById("reservation-start-date").value = todayStr;
    document.getElementById("reservation-end-date").value = nextWeekStr;
    document.getElementById("reservation-date-range").value = `${todayStr} to ${nextWeekStr}`;
    document.getElementById("reservation-color").value = "#0071c2";
    document.getElementById("reservation-source").value = "personal";
    document.getElementById("reservation-price").value = "";
    document.getElementById("reservation-additional-info").value = "";
    document.getElementById("reservation-breakfast").checked = false;
    document.getElementById("reservation-breakfast-count").value = 0;
    document.getElementById("reservation-num-guests").value = "1";
    updateReservationGuestFields();
  } else {
    // Existing reservation: populate the form with data
    document.getElementById("reservation-property-selector").value = existingReservation.propertyKey;
    updateReservationRoomSelector();
    document.getElementById("reservation-room-selector").value = existingReservation.room;
    document.getElementById("reservation-start-date").value = existingReservation.startDate;
    document.getElementById("reservation-end-date").value = existingReservation.endDate;
    document.getElementById("reservation-date-range").value =
      `${existingReservation.startDate} to ${existingReservation.endDate}`;
    document.getElementById("reservation-num-guests").value = existingReservation.numGuests;
    document.getElementById("reservation-breakfast").checked = existingReservation.breakfast || false;
    document.getElementById("reservation-breakfast-count").value = existingReservation.breakfastCount || 0;
    updateReservationGuestOptions();
    updateReservationGuestFields();

    const container = document.getElementById("reservation-guests-container");
    const guestFields = container.querySelectorAll(".guest-field");
    existingReservation.guests.forEach((guest, index) => {
      if (guestFields[index]) {
        guestFields[index].querySelector(".first-name").value = guest.firstName;
        guestFields[index].querySelector(".last-name").value = guest.lastName;
        guestFields[index].querySelector(".address").value = guest.address;
        guestFields[index].querySelector(".personal-number").value = guest.personalNumber;
        guestFields[index].querySelector(".telephone").value = guest.telephone;
        guestFields[index].querySelector(".email").value = guest.email;
      }
    });

    document.getElementById("reservation-price").value = existingReservation.price;
    document.getElementById("reservation-additional-info").value = existingReservation.additionalInfo;
    document.getElementById("reservation-color").value = existingReservation.color || "#0071c2";
    document.getElementById("reservation-source").value = existingReservation.source || "personal";

    reservationEditor.dataset.reservationId = existingReservation.id;
  }

  // Initialize the date range picker (Flatpickr)
  const dateRangeInput = document.getElementById("reservation-date-range");
  if (dateRangeInput._flatpickr) {
    dateRangeInput._flatpickr.destroy();
  }
  const roomVal = document.getElementById("reservation-room-selector").value;
  const disabledRanges = getDisabledDateRanges(currentCalendarKey, roomVal);

  flatpickr("#reservation-date-range", {
    mode: "range",
    dateFormat: "Y-m-d",
    defaultDate: [
      document.getElementById("reservation-start-date").value,
      document.getElementById("reservation-end-date").value,
    ],
    disable: disabledRanges,
    onChange: function (selectedDates) {
      if (selectedDates.length === 2) {
        const start = DateTime.fromJSDate(selectedDates[0])
          .setZone("Europe/Sofia")
          .toFormat("yyyy-MM-dd");
        const end = DateTime.fromJSDate(selectedDates[1])
          .setZone("Europe/Sofia")
          .toFormat("yyyy-MM-dd");
        document.getElementById("reservation-start-date").value = start;
        document.getElementById("reservation-end-date").value = end;
      }
    },
  });

  // Style and bind action buttons
  const saveBtn = document.getElementById("save-reservation-btn");
  saveBtn.onclick = handleSaveReservation;
  saveBtn.style.backgroundColor = "#0071c2";
  saveBtn.style.color = "#fff";
  saveBtn.style.border = "none";
  saveBtn.style.padding = "10px 15px";
  saveBtn.style.borderRadius = "4px";
  saveBtn.style.marginRight = "10px";
  saveBtn.style.cursor = "pointer";

  const closeBtn = document.getElementById("close-reservation-editor");
  // Now we attach the locally imported function (closeRes) to the button
  closeBtn.onclick = closeRes;
  closeBtn.style.backgroundColor = "#d9534f";
  closeBtn.style.color = "#fff";
  closeBtn.style.border = "none";
  closeBtn.style.padding = "10px 15px";
  closeBtn.style.borderRadius = "4px";
  closeBtn.style.cursor = "pointer";

  // Show the modal and make it draggable
  document.getElementById("modal-overlay").style.display = "block";
  reservationEditor.style.display = "block";
  makeModalDraggable(reservationEditor);
}