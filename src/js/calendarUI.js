// src/js/CalendarUI.js
import { calendars, state, ensurePropertyData } from "./calendarsData.js";
const DateTime = luxon.DateTime;

/**
 * Updates the property selector in the UI.
 */
function updateCalendarSelector() {
  const dropdown = document.getElementById("calendar-selector");
  if (!dropdown) return;
  dropdown.innerHTML = "";
  const mainOption = document.createElement("option");
  mainOption.value = "main";
  mainOption.textContent = "Main Calendar";
  dropdown.appendChild(mainOption);
  for (const key in calendars) {
    if (key === "main") continue;
    const option = document.createElement("option");
    option.value = key;
    option.textContent = calendars[key].name;
    dropdown.appendChild(option);
  }
}

/**
 * Initialize month/year dropdown pickers.
 */
function initMonthYearPicker() {
  const monthPicker = document.getElementById("month-picker");
  const yearPicker = document.getElementById("year-picker");
  if (!monthPicker || !yearPicker) {
    console.warn("Month/Year picker elements not found.");
    return;
  }
  // Luxon months are 1-based; <select> is 0-based.
  monthPicker.value = state.currentDate.month - 1;
  const currentYear = state.currentDate.year;
  const startYear = currentYear - 50;
  const endYear = currentYear + 50;
  yearPicker.innerHTML = "";
  for (let y = startYear; y <= endYear; y++) {
    const option = document.createElement("option");
    option.value = y;
    option.textContent = y;
    if (y === currentYear) option.selected = true;
    yearPicker.appendChild(option);
  }
  monthPicker.addEventListener("change", updateCalendarDate);
  yearPicker.addEventListener("change", updateCalendarDate);
}

/**
 * Update state.currentDate based on dropdowns then re-render the calendar.
 */
function updateCalendarDate() {
  const monthPicker = document.getElementById("month-picker");
  const yearPicker = document.getElementById("year-picker");
  if (!monthPicker || !yearPicker) return;
  const newMonth = parseInt(monthPicker.value, 10) + 1;
  const newYear = parseInt(yearPicker.value, 10);
  state.currentDate = state.currentDate.set({ year: newYear, month: newMonth });
  renderCalendar();
}

/**
 * Render the calendar table.
 */
function renderCalendar() {
  console.log("[renderCalendar] currentDate:", state.currentDate.toISO());
  const calendarContainer = document.getElementById("calendar");
  if (!calendarContainer) {
    console.warn("Calendar container not found.");
    return;
  }
  calendarContainer.innerHTML = "";
  const selectedCalendarKey = document.getElementById("calendar-selector")?.value || "main";
  const daysInMonth = state.currentDate.daysInMonth;
  const table = document.createElement("table");
  table.classList.add("calendar-table");

  // Header row
  const headerRow = document.createElement("tr");
  const headerCell = document.createElement("th");
  headerCell.textContent = "Room / Date";
  headerCell.setAttribute("data-col", "0");
  headerRow.appendChild(headerCell);
  for (let d = 1; d <= daysInMonth; d++) {
    const th = document.createElement("th");
    th.textContent = d;
    th.setAttribute("data-col", d);
    headerRow.appendChild(th);
  }
  table.appendChild(headerRow);

  let roomCounter = 1;
  if (selectedCalendarKey === "main") {
    let anyProperties = false;
    for (const key in calendars) {
      if (key === "main") continue;
      anyProperties = true;
      ensurePropertyData(key);
      const propertyCalendar = calendars[key];

      // Property header row
      const groupRow = document.createElement("tr");
      const groupCell = document.createElement("td");
      groupCell.colSpan = daysInMonth + 1;
      groupCell.textContent = propertyCalendar.name;
      // If a color is set for the property, use it as background.
      if (propertyCalendar.color) {
        groupCell.style.backgroundColor = propertyCalendar.color;
        groupCell.style.color = "#fff";
      } else {
        groupCell.style.backgroundColor = "#0071c2";
        groupCell.style.color = "#fff";
      }
      groupCell.classList.add("group-header");
      groupRow.appendChild(groupCell);
      table.appendChild(groupRow);

      // Rooms for this property
      propertyCalendar.rooms.forEach((room) => {
        let roomName, roomColor;
        if (typeof room === "object") {
          roomName = room.name;
          roomColor = room.color;
        } else {
          roomName = room;
          roomColor = "#0071c2"; // default
        }
        const row = document.createElement("tr");
        row.style.position = "relative";
        const roomCell = document.createElement("td");
        roomCell.textContent = roomName;
        roomCell.setAttribute("data-row", roomCounter);
        roomCell.setAttribute("data-col", "0");
        // Set the background color to the room's color.
        roomCell.style.backgroundColor = roomColor;
        roomCell.style.color = "#fff";
        roomCell.style.fontWeight = "bold";
        roomCell.style.padding = "5px";
        row.appendChild(roomCell);

        // Create day cells
        for (let d = 1; d <= daysInMonth; d++) {
          const cell = document.createElement("td");
          cell.classList.add("date-cell");
          cell.setAttribute("data-row", roomCounter);
          cell.setAttribute("data-col", d);
          row.appendChild(cell);
        }
        // Add reservation overlays
        propertyCalendar.reservations.forEach((reservation) => {
          if (reservation.room === roomName) {
            addReservationOverlay(row, reservation);
          }
        });
        table.appendChild(row);
        roomCounter++;
      });
    }
    if (!anyProperties) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = daysInMonth + 1;
      cell.textContent = "No property calendars added.";
      row.appendChild(cell);
      table.appendChild(row);
    }
  } else {
    ensurePropertyData(selectedCalendarKey);
    const propertyCalendar = calendars[selectedCalendarKey];
    propertyCalendar.rooms.forEach((room) => {
      let roomName, roomColor;
      if (typeof room === "object") {
        roomName = room.name;
        roomColor = room.color;
      } else {
        roomName = room;
        roomColor = "#0071c2";
      }
      const row = document.createElement("tr");
      row.style.position = "relative";
      const roomCell = document.createElement("td");
      roomCell.textContent = roomName;
      roomCell.setAttribute("data-row", roomCounter);
      roomCell.setAttribute("data-col", "0");
      roomCell.style.backgroundColor = roomColor;
      roomCell.style.color = "#fff";
      roomCell.style.fontWeight = "bold";
      roomCell.style.padding = "5px";
      row.appendChild(roomCell);
      for (let d = 1; d <= daysInMonth; d++) {
        const cell = document.createElement("td");
        cell.classList.add("date-cell");
        cell.setAttribute("data-row", roomCounter);
        cell.setAttribute("data-col", d);
        row.appendChild(cell);
      }
      propertyCalendar.reservations.forEach((reservation) => {
        if (reservation.room === roomName) {
          addReservationOverlay(row, reservation);
        }
      });
      table.appendChild(row);
      roomCounter++;
    });
  }
  calendarContainer.appendChild(table);
  bindGridHover();
}

/**
 * Adds a reservation overlay spanning from the start date cell to the end date cell.
 */
function addReservationOverlay(row, reservation) {
  const resStart = DateTime.fromFormat(reservation.startDate, "yyyy-MM-dd", { zone: "Europe/Sofia" });
  const resEnd = DateTime.fromFormat(reservation.endDate, "yyyy-MM-dd", { zone: "Europe/Sofia" });
  const monthStart = state.currentDate.set({ day: 1 });
  const monthEnd = state.currentDate.set({ day: state.currentDate.daysInMonth });
  if (resEnd < monthStart || resStart > monthEnd) return;
  const effectiveStart = resStart < monthStart ? monthStart : resStart;
  const effectiveEnd = resEnd > monthEnd ? monthEnd : resEnd;
  const startDay = effectiveStart.day;
  const endDay = effectiveEnd.day;
  const startCell = row.querySelector(`td[data-col="${startDay}"]`);
  const endCell = row.querySelector(`td[data-col="${endDay}"]`);
  if (!startCell || !endCell) return;
  row.style.position = "relative";
  requestAnimationFrame(() => {
    const startOffset = startCell.offsetLeft + startCell.offsetWidth / 2;
    const endOffset = endCell.offsetLeft + endCell.offsetWidth / 2;
    const totalWidth = endOffset - startOffset;
    if (totalWidth <= 0) return;
    const overlay = document.createElement("div");
    overlay.className = "reservation";
    overlay.style.position = "absolute";
    overlay.style.left = startOffset + "px";
    overlay.style.top = "0";
    overlay.style.height = "100%";
    overlay.style.width = totalWidth + "px";
    overlay.style.backgroundColor = reservation.color || "#0071c2";
    overlay.style.color = "#fff";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.borderRadius = "4px";
    overlay.style.zIndex = "1";
    if (reservation.guests && reservation.guests.length > 0) {
      overlay.textContent = reservation.guests[0].firstName + " " + reservation.guests[0].lastName;
    }
    overlay.addEventListener("mouseenter", (e) => {
      const popup = document.getElementById("reservation-popup");
      if (!popup) return;
      const info = `Room: ${reservation.room}
Dates: ${resStart.toFormat("yyyy-MM-dd")} to ${resEnd.toFormat("yyyy-MM-dd")}
Price: ${reservation.price}
Guests: ${(reservation.guests || [])
        .map((g) => g.firstName + " " + g.lastName)
        .join(", ")}
Additional Info: ${reservation.additionalInfo || ""}`;
      popup.innerText = info;
      popup.style.left = (e.pageX + 10) + "px";
      popup.style.top = (e.pageY + 10) + "px";
      popup.style.display = "block";
    });
    overlay.addEventListener("mouseleave", () => {
      const popup = document.getElementById("reservation-popup");
      if (popup) popup.style.display = "none";
    });
    overlay.addEventListener("click", () => {
      const event = new CustomEvent("editReservation", { detail: reservation });
      document.dispatchEvent(event);
    });
    row.appendChild(overlay);
  });
}

/**
 * Bind hover events to grid cells.
 */
function bindGridHover() {
  // Only attach listeners to cells that are not in the first column (data-col != "0")
  const cells = document.querySelectorAll(
    "#calendar table [data-col]:not([data-col='0'])"
  );
  cells.forEach((cell) => {
    cell.addEventListener("mouseenter", () => {
      const row = cell.getAttribute("data-row");
      const col = cell.getAttribute("data-col");
      // Highlight all cells in the row except the first column.
      document
        .querySelectorAll(`#calendar table [data-row="${row}"]`)
        .forEach((el) => {
          if (el.getAttribute("data-col") !== "0") {
            el.classList.add("highlight-row");
          }
        });
      // Highlight all cells in the hovered column except the first column.
      document
        .querySelectorAll(`#calendar table [data-col="${col}"]`)
        .forEach((el) => {
          if (el.getAttribute("data-col") !== "0") {
            el.classList.add("highlight-col");
          }
        });
    });
    cell.addEventListener("mouseleave", () => {
      const row = cell.getAttribute("data-row");
      const col = cell.getAttribute("data-col");
      document
        .querySelectorAll(`#calendar table [data-row="${row}"]`)
        .forEach((el) => {
          if (el.getAttribute("data-col") !== "0") {
            el.classList.remove("highlight-row");
          }
        });
      document
        .querySelectorAll(`#calendar table [data-col="${col}"]`)
        .forEach((el) => {
          if (el.getAttribute("data-col") !== "0") {
            el.classList.remove("highlight-col");
          }
        });
    });
  });
}

/**
 * Navigate to the previous month.
 */
function prevMonth() {
  state.currentDate = state.currentDate.minus({ months: 1 });
  const monthPicker = document.getElementById("month-picker");
  const yearPicker = document.getElementById("year-picker");
  if (monthPicker) monthPicker.value = state.currentDate.month - 1;
  if (yearPicker) yearPicker.value = state.currentDate.year;
  renderCalendar();
}

/**
 * Navigate to the next month.
 */
function nextMonth() {
  state.currentDate = state.currentDate.plus({ months: 1 });
  const monthPicker = document.getElementById("month-picker");
  const yearPicker = document.getElementById("year-picker");
  if (monthPicker) monthPicker.value = state.currentDate.month - 1;
  if (yearPicker) yearPicker.value = state.currentDate.year;
  renderCalendar();
}

export {
  updateCalendarSelector,
  initMonthYearPicker,
  updateCalendarDate,
  renderCalendar,
  prevMonth,
  nextMonth
};