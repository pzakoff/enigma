/* src/js/editors/modalHelper.js */
export function makeModalDraggable(modal) {
  let offsetX = 0, offsetY = 0;
  const header = modal.querySelector(".modal-header");
  if (!header) return; // If no header exists, do not bind dragging.
  header.style.cursor = "move";
  header.addEventListener("mousedown", dragMouseDown);

  function dragMouseDown(e) {
    e.preventDefault();
    // Get the current bounding rectangle and set left/top explicitly to prevent jump.
    const rect = modal.getBoundingClientRect();
    modal.style.left = rect.left + "px";
    modal.style.top = rect.top + "px";
    modal.style.transform = "none"; // Remove the centering transform.
    
    // Calculate the offset from the mouse click relative to the modal's top-left corner.
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    document.addEventListener("mousemove", elementDrag);
    document.addEventListener("mouseup", closeDragElement);
  }

  function elementDrag(e) {
    e.preventDefault();
    // Update the modal's position as the mouse moves.
    modal.style.left = (e.clientX - offsetX) + "px";
    modal.style.top = (e.clientY - offsetY) + "px";
    modal.style.position = "fixed";
  }

  function closeDragElement() {
    document.removeEventListener("mousemove", elementDrag);
    document.removeEventListener("mouseup", closeDragElement);
  }
}