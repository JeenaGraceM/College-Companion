/**
 * Toggles the visibility of the "Year" field in the form
 * based on the selected file type.
 * 
 * If the user selects "Past Papers", the "Year" input field
 * will be shown. Otherwise, it will be hidden.
 */
function toggleYearField() {
  // Get the currently selected file type (e.g., "Notes" or "Past Papers")
  const fileType = document.getElementById("fileType").value;

  // Get the "Year" field container
  const yearField = document.getElementById("yearField");

  // Show the year field only when "Past Papers" is selected
  if (fileType === "Past Papers") {
    yearField.style.display = "block";
  } else {
    yearField.style.display = "none";
  }
}
