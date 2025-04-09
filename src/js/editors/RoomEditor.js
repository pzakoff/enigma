// src/js/editors/RoomEditor.js
import { calendars, saveCalendarsToFirebase } from "../calendar.js";
import { renderCalendar } from "../calendar.js";

export function openRoomEditor() {
  const selectedCalendarKey = document.getElementById("calendar-selector").value;
  if (selectedCalendarKey === "main") return;
  renderRoomEditor();
  document.getElementById("modal-overlay").style.display = "block";
  document.getElementById("room-editor").style.display = "block";
}

export function closeRoomEditor() {
  document.getElementById("room-editor").style.display = "none";
  document.getElementById("modal-overlay").style.display = "none";
}

export function renderRoomEditor() {
  const selectedCalendarKey = document.getElementById("calendar-selector").value;
  const roomListEl = document.getElementById("room-list");
  roomListEl.innerHTML = "";
  const property = calendars[selectedCalendarKey];
  const rooms = property.rooms || [];
  rooms.forEach((room, index) => {
    // Convert room to object if necessary.
    if (typeof room !== "object") {
      room = { name: room, color: "#0071c2" };
      property.rooms[index] = room;
    }
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.alignItems = "center";
    li.style.justifyContent = "space-between";
    li.style.padding = "10px";
    li.style.borderBottom = "1px solid #ccc";
    
    const nameSpan = document.createElement("span");
    nameSpan.textContent = room.name;
    nameSpan.style.flexGrow = "1";
    nameSpan.style.padding = "5px";
    nameSpan.style.backgroundColor = room.color || "#0071c2";
    nameSpan.style.color = "#fff";
    
    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = room.color || "#0071c2";
    colorInput.style.marginLeft = "10px";
    colorInput.addEventListener("change", () => {
      room.color = colorInput.value;
      saveCalendarsToFirebase();
      renderCalendar();
    });
    
    const renameBtn = document.createElement("button");
    renameBtn.textContent = "Rename";
    renameBtn.style.marginLeft = "10px";
    renameBtn.addEventListener("click", () => {
      const newName = prompt("Enter new name for the room:", room.name);
      if (newName) {
        room.name = newName;
        renderRoomEditor();
        renderCalendar();
        saveCalendarsToFirebase();
      }
    });
    
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to delete this room?")) {
        property.rooms.splice(index, 1);
        renderRoomEditor();
        renderCalendar();
        saveCalendarsToFirebase();
      }
    });
    
    li.appendChild(nameSpan);
    li.appendChild(colorInput);
    li.appendChild(renameBtn);
    li.appendChild(deleteBtn);
    roomListEl.appendChild(li);
  });
  
  // Add new room form.
  const addDiv = document.createElement("div");
  addDiv.style.marginTop = "10px";
  addDiv.style.padding = "10px";
  addDiv.style.border = "1px solid #0071c2";
  addDiv.style.borderRadius = "4px";
  
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "New Room Name";
  nameInput.style.marginRight = "10px";
  
  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.value = "#0071c2";
  colorInput.style.marginRight = "10px";
  
  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Room";
  addBtn.addEventListener("click", () => {
    const newName = nameInput.value.trim();
    if (!newName) {
      alert("Please enter a room name.");
      return;
    }
    property.rooms.push({ name: newName, color: colorInput.value });
    nameInput.value = "";
    colorInput.value = "#0071c2";
    renderRoomEditor();
    renderCalendar();
    saveCalendarsToFirebase();
  });
  
  addDiv.appendChild(nameInput);
  addDiv.appendChild(colorInput);
  addDiv.appendChild(addBtn);
  roomListEl.appendChild(addDiv);
}