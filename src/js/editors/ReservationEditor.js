/* src/js/editors/ReservationEditor.js */
import { openReservationEditor, closeReservationEditor } from "./ReservationEditorUI.js";
import { updateReservationGuestFields, updateReservationRoomSelector } from "./ReservationEditorUtils.js";
import { handleSaveReservation } from "./ReservationEditorHandlers.js";

// Re-export the functions so they are available from editors.js
export { 
  openReservationEditor, 
  closeReservationEditor, 
  handleSaveReservation, 
  updateReservationGuestFields, 
  updateReservationRoomSelector 
};