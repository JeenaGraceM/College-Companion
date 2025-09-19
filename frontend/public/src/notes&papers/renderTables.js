// Store all uploaded files (both Notes and Past Papers)
const uploadedFiles = [];

/**
 * Renders uploaded files into separate tables:
 * - Notes Table
 * - Past Question Papers Table
 * 
 * This function reads the `uploadedFiles` array and dynamically creates
 * table rows depending on the file type.
 */
function renderTables() {
  // Get the table body elements for Notes and Past Papers
  const notesBody = document.querySelector("#notesTable tbody");
  const papersBody = document.querySelector("#papersTable tbody");

  // Clear existing rows before re-rendering
  notesBody.innerHTML = "";
  papersBody.innerHTML = "";

  // Loop through all uploaded files and place them in the correct table
  uploadedFiles.forEach(file => {
    // Create a new table row for the file
    const row = document.createElement("tr");

    if (file.type === "Notes") {
      // If the file is a Note → Add details to Notes table
      row.innerHTML = `
        <td>${file.programme}</td>
        <td>${file.course}</td>
        <td>${file.branch}</td>
        <td>${file.semester}</td>
        <td>${file.fileName}</td>
      `;
      notesBody.appendChild(row); // Add the row to Notes table

    } else if (file.type === "Past Papers") {
      // If the file is a Past Question Paper → Add details to Papers table
      row.innerHTML = `
        <td>${file.programme}</td>
        <td>${file.course}</td>
        <td>${file.branch}</td>
        <td>${file.semester}</td>
        <td>${file.year}</td>   <!-- Year is only for past papers -->
        <td>${file.fileName}</td>
      `;
      papersBody.appendChild(row); // Add the row to Papers table
    }
  });
}
