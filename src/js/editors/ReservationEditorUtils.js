/* src/js/editors/ReservationEditorUtils.js */
import { calendars } from "../calendar.js";
// Use CDN for Luxon
import { DateTime } from "https://cdn.jsdelivr.net/npm/luxon@3.3.0/build/es6/luxon.js";

/**
 * Calculate disabled date ranges for a given property and room.
 */
export function getDisabledDateRanges(propertyKey, room) {
  const disabled = [];
  if (!calendars[propertyKey] || !calendars[propertyKey].reservations) return disabled;
  calendars[propertyKey].reservations.forEach((reservation) => {
    if (reservation.room !== room) return;
    const start = DateTime.fromFormat(reservation.startDate, "yyyy-MM-dd", {
      zone: "Europe/Sofia",
    });
    const end = DateTime.fromFormat(reservation.endDate, "yyyy-MM-dd", {
      zone: "Europe/Sofia",
    });
    const diffDays = end.diff(start, "days").days;
    if (diffDays >= 2) {
      // Create disabled range from day after start to day before end.
      const from = start.plus({ days: 1 }).toJSDate();
      const to = end.minus({ days: 1 }).toJSDate();
      disabled.push({ from, to });
    }
  });
  return disabled;
}

/**
 * Update the guest number dropdown based on the selected room's max occupancy.
 */
export function updateReservationGuestOptions() {
  const roomSelector = document.getElementById("reservation-room-selector");
  const guestSelect = document.getElementById("reservation-num-guests");
  guestSelect.innerHTML = "";

  const selectedOption = roomSelector.options[roomSelector.selectedIndex];
  let maxOccupancy = parseInt(selectedOption?.dataset.maxOccupancy, 10);
  if (!maxOccupancy || isNaN(maxOccupancy)) {
    maxOccupancy = 4; // Default value.
  }

  for (let i = 1; i <= maxOccupancy; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = i;
    guestSelect.appendChild(opt);
  }
}

/**
 * Toggle the visibility of the breakfast count field.
 */
export function toggleBreakfastCount() {
  const breakfastCheckbox = document.getElementById("reservation-breakfast");
  const breakfastCountField = document.getElementById("reservation-breakfast-count");
  if (breakfastCheckbox.checked) {
    breakfastCountField.style.display = "inline-block";
  } else {
    breakfastCountField.style.display = "none";
    breakfastCountField.value = 0;
  }
}

/**
 * Update the guest fields (one set per guest) based on the number of guests.
 */
export function updateReservationGuestFields() {
  const numGuests = parseInt(document.getElementById("reservation-num-guests").value, 10);
  const container = document.getElementById("reservation-guests-container");
  container.innerHTML = "";

  const inputs = [
    { label: "First Name:", class: "first-name", type: "text", pattern: "^[A-Za-z\\s]+$" },
    { label: "Last Name:", class: "last-name", type: "text", pattern: "^[A-Za-z\\s]+$" },
    { label: "Address:", class: "address", type: "text" },
    { label: "Personal Number:", class: "personal-number", type: "text", pattern: "^[0-9]+$" },
    { label: "Telephone:", class: "telephone", type: "text", pattern: "^[0-9]+$" },
    { label: "Email:", class: "email", type: "email" },
  ];

  for (let i = 1; i <= numGuests; i++) {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "guest-field";
    fieldset.style.border = "1px solid #ccc";
    fieldset.style.padding = "10px";
    fieldset.style.marginBottom = "15px";
    fieldset.style.borderRadius = "4px";

    const legend = document.createElement("legend");
    legend.textContent = "Guest " + i;
    legend.style.fontWeight = "bold";
    legend.style.marginBottom = "10px";
    fieldset.appendChild(legend);

    inputs.forEach((info) => {
      const label = document.createElement("label");
      label.textContent = info.label;
      label.setAttribute("for", `guest-${i}-${info.class}`);
      label.style.display = "block";
      label.style.marginBottom = "5px";

      const input = document.createElement("input");
      input.type = info.type;
      input.className = info.class;
      input.id = `guest-${i}-${info.class}`;
      input.name = `guest-${i}-${info.class}`;
      input.style.width = "100%";
      input.style.padding = "8px";
      input.style.marginBottom = "10px";
      input.style.border = "1px solid #ccc";
      input.style.borderRadius = "4px";

      if (info.pattern) {
        input.setAttribute("pattern", info.pattern);
      }

      fieldset.appendChild(label);
      fieldset.appendChild(input);
    });
    container.appendChild(fieldset);
  }
}

/**
 * Update the reservation room selector dropdown based on the property.
 */
export function updateReservationRoomSelector() {
  const propertyKey = document.getElementById("reservation-property-selector").value;
  const roomSelector = document.getElementById("reservation-room-selector");
  roomSelector.innerHTML = "";

  if (calendars[propertyKey] && calendars[propertyKey].rooms) {
    calendars[propertyKey].rooms.forEach((room) => {
      let roomObj, roomName;
      if (typeof room === "object") {
        roomObj = room;
        roomName = room.name;
      } else {
        roomObj = { name: room, maxOccupancy: null, color: "#0071c2" };
        roomName = room;
      }
      const option = document.createElement("option");
      option.value = roomName;
      option.textContent = roomName;
      if (roomObj.maxOccupancy) {
        option.dataset.maxOccupancy = roomObj.maxOccupancy;
      }
      roomSelector.appendChild(option);
    });
  }
}