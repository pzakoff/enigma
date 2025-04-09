// src/js/ui.js
import {
  calendars,
  saveCalendarsToFirebase,
  prevMonth,
  nextMonth,
  updateCalendarSelector,
  initMonthYearPicker,
  renderCalendar,
  loadCalendarsFromFirebase
} from "./calendar.js";
import {
  openPropertyEditor,
  openRoomEditor,
  renderRoomEditor,
  openReservationEditor,
  updateReservationRoomSelector,
  updateReservationGuestFields,
  renderPropertyEditor,
  closeReservationEditor
} from "./editors.js";
import { signInWithGoogle, handleSignOut } from "./auth.js";
import { bindReservationInfoEvents } from "./reservation-info.js"; // bind reservation info modal events

function bindUIEvents() {
  document.getElementById("google-signin-btn").addEventListener("click", signInWithGoogle);
  document.getElementById("signout-btn").addEventListener("click", handleSignOut);

  document.getElementById("prev-month").addEventListener("click", prevMonth);
  document.getElementById("next-month").addEventListener("click", nextMonth);

  document.getElementById("calendar-selector").addEventListener("change", () => {
    updateEditButtonVisibility();
    renderCalendar();
  });

  // Edit Rooms button – visible only in a property view
  const editRoomsBtn = document.getElementById("edit-rooms");
  if (editRoomsBtn) {
    editRoomsBtn.addEventListener("click", () => {
      console.log("Edit Rooms button clicked");
      openRoomEditor();
    });
  } else {
    console.error("Edit Rooms button (id: edit-rooms) not found");
  }

  // Add Room button – using dedicated form fields for room name, color, and max occupancy.
  document.getElementById("add-room-btn").addEventListener("click", () => {
    const selectedCalendarKey = document.getElementById("calendar-selector").value;
    console.log("Add Room clicked. Current calendar key:", selectedCalendarKey);
    if (selectedCalendarKey === "main") {
      alert("Please switch to a specific property view to add a room.");
      return;
    }
    const roomName = document.getElementById("new-room-name").value.trim();
    const roomColor = document.getElementById("new-room-color").value;
    const maxOccupancy = document.getElementById("new-room-occupancy").value;
    if (!roomName) {
      alert("Please enter a room name.");
      return;
    }
    import("./calendar.js").then(module => {
      const property = module.calendars[selectedCalendarKey];
      // Store room as an object with name, color, and maxOccupancy.
      property.rooms.push({ name: roomName, color: roomColor, maxOccupancy: maxOccupancy });
      console.log(`Room "${roomName}" added to property "${selectedCalendarKey}". Current rooms:`, property.rooms);
      import("./editors.js").then(editorModule => {
        editorModule.renderRoomEditor();
      });
      renderCalendar();
      module.saveCalendarsToFirebase();
    });
  });

  document.getElementById("close-room-editor").addEventListener("click", () => {
    document.getElementById("room-editor").style.display = "none";
    document.getElementById("modal-overlay").style.display = "none";
  });

  document.getElementById("edit-properties").addEventListener("click", openPropertyEditor);

  document.getElementById("close-property-editor").addEventListener("click", () => {
    document.getElementById("property-editor").style.display = "none";
    document.getElementById("modal-overlay").style.display = "none";
  });

  // When a new property is added.
  document.getElementById("add-new-property-btn").addEventListener("click", () => {
    const newPropInput = prompt("Enter new property name:");
    if (newPropInput) {
      import("./calendar.js").then(module => {
        const newKey = newPropInput.trim().replace(/\s+/g, "_").toLowerCase();
        if (module.calendars[newKey]) {
          alert("Property already exists!");
          return;
        }
        module.calendars[newKey] = { name: newPropInput, rooms: [], reservations: [] };
        import("./editors.js").then(editorModule => {
          editorModule.renderPropertyEditor();
        });
        updateCalendarSelector();
        renderCalendar();
        module.saveCalendarsToFirebase();
      });
    }
  });

  document.getElementById("reservation-property-selector").addEventListener("change", () => {
    import("./editors.js").then(module => {
      module.updateReservationRoomSelector();
    });
  });

  document.getElementById("reservation-num-guests").addEventListener("change", () => {
    import("./editors.js").then(module => {
      module.updateReservationGuestFields();
    });
  });

  document.getElementById("add-reservation-btn").addEventListener("click", () => {
    const currentCalendarKey = document.getElementById("calendar-selector").value;
    if (currentCalendarKey !== "main") {
      const propSelector = document.getElementById("reservation-property-selector");
      propSelector.innerHTML = "";
      const option = document.createElement("option");
      option.value = currentCalendarKey;
      import("./calendar.js").then(module => {
        option.textContent = module.calendars[currentCalendarKey].name;
        propSelector.appendChild(option);
      });
    }
    // Open the reservation modal.
    openReservationEditor();
    // ReservationEditor.js already binds the Save and Cancel buttons.
  });

  // Listen for custom event "editReservation" to open the reservation editor for edits.
  document.addEventListener("editReservation", (e) => {
    openReservationEditor(e.detail);
  });
}

function updateEditButtonVisibility() {
  const selectedCalendarKey = document.getElementById("calendar-selector").value;
  const editRoomsBtn = document.getElementById("edit-rooms");
  if (!editRoomsBtn) return;
  editRoomsBtn.style.display = selectedCalendarKey === "main" ? "none" : "inline-block";
}

async function init() {
  await loadCalendarsFromFirebase();
  updateCalendarSelector();
  renderCalendar();
  updateEditButtonVisibility();
  initMonthYearPicker();
  console.log("App initialized.");
}

document.addEventListener("DOMContentLoaded", () => {
  bindUIEvents();
  bindReservationInfoEvents(); // Bind Reservation Information modal events.
});

// Bind Dashboard button events
document.getElementById("dashboard-btn").addEventListener("click", () => {
  document.getElementById("dashboard-modal").style.display = "block";
});

document.getElementById("close-dashboard").addEventListener("click", () => {
  document.getElementById("dashboard-modal").style.display = "none";
});

export { bindUIEvents, init };