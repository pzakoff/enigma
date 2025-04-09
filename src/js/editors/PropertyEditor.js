/* src/js/editors/PropertyEditor.js */
import { calendars, saveCalendarsToFirebase } from "../calendar.js";
import { updateCalendarSelector, renderCalendar } from "../calendar.js";
import { makeModalDraggable } from "./modalHelper.js";

export function openPropertyEditor() {
  const modal = document.getElementById("property-editor");
  
  // Remove any existing content so we start fresh.
  modal.innerHTML = "";
  
  // Create a new header for the modal.
  const header = document.createElement("div");
  header.className = "modal-header";
  header.style.backgroundColor = "#0071c2";
  header.style.color = "#fff";
  header.style.padding = "10px";
  header.style.display = "flex";
  header.style.alignItems = "center";
  header.style.cursor = "move";
  
  // Title in the header.
  const title = document.createElement("span");
  title.textContent = "Edit Properties";
  title.style.flexGrow = "1";
  title.style.fontSize = "18px";
  title.style.fontWeight = "bold";
  
  // Create a new close button.
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Close";
  closeBtn.style.backgroundColor = "#005b99";
  closeBtn.style.color = "#fff";
  closeBtn.style.border = "none";
  closeBtn.style.padding = "5px 10px";
  closeBtn.style.borderRadius = "4px";
  closeBtn.addEventListener("click", closePropertyEditor);
  
  header.appendChild(title);
  header.appendChild(closeBtn);
  modal.appendChild(header);
  
  // Create a container for the editor content.
  const content = document.createElement("div");
  content.id = "property-content";
  modal.appendChild(content);
  
  renderPropertyEditor();
  
  document.getElementById("modal-overlay").style.display = "block";
  modal.style.display = "block";
  
  // Make the modal draggable by its header.
  makeModalDraggable(modal);
}

export function closePropertyEditor() {
  document.getElementById("property-editor").style.display = "none";
  document.getElementById("modal-overlay").style.display = "none";
}

export function renderPropertyEditor() {
  const content = document.getElementById("property-content");
  if (!content) return;
  content.innerHTML = "";
  
  const propertyListEl = document.createElement("ul");
  propertyListEl.id = "property-list";
  propertyListEl.style.listStyleType = "none";
  propertyListEl.style.padding = "0";
  let propertiesFound = false;
  
  // Loop through properties (skipping 'main').
  for (const key in calendars) {
    if (key === "main") continue;
    propertiesFound = true;
    
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.alignItems = "center";
    li.style.justifyContent = "space-between";
    li.style.padding = "10px";
    li.style.borderBottom = "1px solid #ccc";
    
    // Display the property name with its color.
    const nameSpan = document.createElement("span");
    nameSpan.textContent = calendars[key].name;
    nameSpan.style.flexGrow = "1";
    nameSpan.style.padding = "5px";
    nameSpan.style.backgroundColor = calendars[key].color || "#0071c2";
    nameSpan.style.color = "#fff";
    
    // Color picker to update the property's color.
    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = calendars[key].color || "#0071c2";
    colorInput.style.marginLeft = "10px";
    colorInput.addEventListener("change", () => {
      calendars[key].color = colorInput.value;
      saveCalendarsToFirebase();
      renderCalendar();
    });
    
    // Rename button.
    const renameBtn = document.createElement("button");
    renameBtn.textContent = "Rename";
    renameBtn.style.marginLeft = "10px";
    renameBtn.style.backgroundColor = "#0071c2";
    renameBtn.style.color = "#fff";
    renameBtn.style.border = "none";
    renameBtn.style.padding = "5px 10px";
    renameBtn.style.borderRadius = "4px";
    renameBtn.addEventListener("click", () => {
      const newName = prompt("Enter new name for the property:", calendars[key].name);
      if (newName) {
        const newKey = newName.trim().replace(/\s+/g, "_").toLowerCase();
        if (newKey !== key) {
          if (calendars[newKey]) {
            alert("A property with that name already exists!");
            return;
          }
          calendars[newKey] = { ...calendars[key], name: newName };
          delete calendars[key];
        } else {
          calendars[key].name = newName;
        }
        renderPropertyEditor();
        updateCalendarSelector();
        renderCalendar();
        saveCalendarsToFirebase();
      }
    });
    
    // Delete button.
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.style.backgroundColor = "#d9534f";
    deleteBtn.style.color = "#fff";
    deleteBtn.style.border = "none";
    deleteBtn.style.padding = "5px 10px";
    deleteBtn.style.borderRadius = "4px";
    deleteBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to delete this property?")) {
        delete calendars[key];
        renderPropertyEditor();
        updateCalendarSelector();
        renderCalendar();
        saveCalendarsToFirebase();
      }
    });
    
    li.appendChild(nameSpan);
    li.appendChild(colorInput);
    li.appendChild(renameBtn);
    li.appendChild(deleteBtn);
    propertyListEl.appendChild(li);
  }
  
  if (!propertiesFound) {
    const li = document.createElement("li");
    li.textContent = "No property calendars added.";
    propertyListEl.appendChild(li);
  }
  
  // Add a new Add Property button.
  const addPropertyBtn = document.createElement("button");
  addPropertyBtn.textContent = "Add Property";
  addPropertyBtn.style.backgroundColor = "#0071c2";
  addPropertyBtn.style.color = "#fff";
  addPropertyBtn.style.border = "none";
  addPropertyBtn.style.padding = "10px 15px";
  addPropertyBtn.style.borderRadius = "4px";
  addPropertyBtn.style.marginTop = "10px";
  addPropertyBtn.addEventListener("click", () => {
    const newPropInput = prompt("Enter new property name:");
    if (newPropInput) {
      const newKey = newPropInput.trim().replace(/\s+/g, "_").toLowerCase();
      if (calendars[newKey]) {
        alert("A property with that name already exists!");
        return;
      }
      calendars[newKey] = { name: newPropInput, rooms: [], reservations: [] };
      renderPropertyEditor();
      updateCalendarSelector();
      renderCalendar();
      saveCalendarsToFirebase();
    }
  });
  
  content.appendChild(propertyListEl);
  content.appendChild(addPropertyBtn);
}