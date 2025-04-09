// src/js/reservation-info.js
import { calendars } from "./calendar.js";
const DateTime = luxon.DateTime; // Use Luxon

function openReservationInfoModal() {
  const modal = document.getElementById("reservation-info-modal");
  if (!modal) return;
  modal.style.display = "block";
  // Initialize Flatpickr for date inputs (assuming global flatpickr is available)
  flatpickr("#info-start-date", { dateFormat: "Y-m-d" });
  flatpickr("#info-end-date", { dateFormat: "Y-m-d" });
  populatePropertySelector();
}

function closeReservationInfoModal() {
  const modal = document.getElementById("reservation-info-modal");
  if (!modal) return;
  modal.style.display = "none";
  clearTable();
}

function populatePropertySelector() {
  const selector = document.getElementById("info-property-selector");
  if (!selector) return;
  selector.innerHTML = "";
  
  // Add "All Properties" option
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Properties";
  selector.appendChild(allOption);
  
  for (const key in calendars) {
    if (key === "main") continue;
    const option = document.createElement("option");
    option.value = key;
    option.textContent = calendars[key].name;
    selector.appendChild(option);
  }
}

function clearTable() {
  const table = document.getElementById("reservation-info-table");
  if (!table) return;
  const tbody = table.querySelector("tbody");
  if (tbody) tbody.innerHTML = "";
}

function filterReservations() {
  const startDateInput = document.getElementById("info-start-date")?.value;
  const endDateInput = document.getElementById("info-end-date")?.value;
  const propertyFilter = document.getElementById("info-property-selector")?.value;
  
  if (!startDateInput || !endDateInput) {
    alert("Please select both start and end dates.");
    return;
  }
  
  // Parse input dates in Bulgarian time zone using Luxon
  const filterStart = DateTime.fromISO(startDateInput, { zone: "Europe/Sofia" });
  const filterEnd = DateTime.fromISO(endDateInput, { zone: "Europe/Sofia" });
  
  clearTable();
  const table = document.getElementById("reservation-info-table");
  if (!table) return;
  const tbody = table.querySelector("tbody");
  if (!tbody) return;
  
  // Determine which properties to check
  const propertyKeys = propertyFilter === "all" 
    ? Object.keys(calendars).filter(key => key !== "main") 
    : [propertyFilter];
  
  propertyKeys.forEach(propKey => {
    const property = calendars[propKey];
    if (!property || !property.reservations) return;
    
    property.reservations.forEach(reservation => {
      // Parse reservation dates using Luxon in Bulgarian time zone.
      const resStart = DateTime.fromISO(reservation.startDate, { zone: "Europe/Sofia" });
      const resEnd = DateTime.fromISO(reservation.endDate, { zone: "Europe/Sofia" });
      
      // Check if the reservation overlaps with the filter period.
      if (resEnd >= filterStart && resStart <= filterEnd) {
        const row = document.createElement("tr");
        
        // Reservation Period Cell – format using Luxon.
        const periodCell = document.createElement("td");
        periodCell.textContent = `${resStart.toFormat("yyyy-MM-dd")} to ${resEnd.toFormat("yyyy-MM-dd")}`;
        row.appendChild(periodCell);
        
        // Guest details (assuming at least one guest)
        const guest = reservation.guests && reservation.guests[0] ? reservation.guests[0] : {};
        const guestNameCell = document.createElement("td");
        guestNameCell.textContent = guest.firstName && guest.lastName ? `${guest.firstName} ${guest.lastName}` : "";
        row.appendChild(guestNameCell);
        
        const phoneCell = document.createElement("td");
        phoneCell.textContent = guest.telephone || "";
        row.appendChild(phoneCell);
        
        const personalNumberCell = document.createElement("td");
        personalNumberCell.textContent = guest.personalNumber || "";
        row.appendChild(personalNumberCell);
        
        const emailCell = document.createElement("td");
        emailCell.textContent = guest.email || "";
        row.appendChild(emailCell);
        
        const additionalInfoCell = document.createElement("td");
        additionalInfoCell.textContent = reservation.additionalInfo || "";
        row.appendChild(additionalInfoCell);
        
        const sourceCell = document.createElement("td");
        sourceCell.textContent = reservation.source || "";
        row.appendChild(sourceCell);
        
        const priceCell = document.createElement("td");
        priceCell.textContent = reservation.price || "";
        row.appendChild(priceCell);
        
        tbody.appendChild(row);
      }
    });
  });
}

// Export CSV Function
function exportTableToCSV(filename) {
  const csv = [];
  const rows = document.querySelectorAll("#reservation-info-table tr");
  rows.forEach(row => {
    const cols = row.querySelectorAll("td, th");
    const rowData = [];
    cols.forEach(col => {
      rowData.push('"' + col.innerText.replace(/"/g, '""') + '"');
    });
    csv.push(rowData.join(","));
  });
  
  const csvFile = new Blob([csv.join("\n")], { type: "text/csv" });
  const downloadLink = document.createElement("a");
  downloadLink.download = filename;
  downloadLink.href = window.URL.createObjectURL(csvFile);
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

// Export PDF Function (requires jsPDF and jsPDF-AutoTable libraries)
function exportTableToPDF(filename) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.autoTable({ 
    html: '#reservation-info-table',
    theme: 'grid'
  });
  doc.save(filename);
}

function bindReservationInfoEvents() {
  const infoBtn = document.getElementById("reservation-info-btn");
  if (infoBtn) {
    infoBtn.addEventListener("click", openReservationInfoModal);
  }
  const closeBtn = document.getElementById("close-reservation-info");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeReservationInfoModal);
  }
  const filterBtn = document.getElementById("filter-info-btn");
  if (filterBtn) {
    filterBtn.addEventListener("click", filterReservations);
  }
  const exportCSVBtn = document.getElementById("export-csv-btn");
  if (exportCSVBtn) {
    exportCSVBtn.addEventListener("click", () => {
      exportTableToCSV("reservations.csv");
    });
  }
  const exportPDFBtn = document.getElementById("export-pdf-btn");
  if (exportPDFBtn) {
    exportPDFBtn.addEventListener("click", () => {
      exportTableToPDF("reservations.pdf");
    });
  }
}

export { bindReservationInfoEvents };