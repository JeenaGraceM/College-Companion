/**
 * Constructor function to represent an uploaded file.
 * 
 * @param {string} programme - Programme name (e.g., B.Tech, M.Sc.).
 * @param {string} course - Course name or subject.
 * @param {string} branch - Branch/department (e.g., CSE, ECE).
 * @param {number} semester - Semester number (1, 2, etc.).
 * @param {string} type - File type: "Notes" or "Past Papers".
 * @param {number|string} year - Year of the past paper (only if type is "Past Papers").
 * @param {string} fileName - Name of the uploaded file.
 */
function UploadedFile(programme, course, branch, semester, type, year, fileName) {
  this.programme = programme;
  this.course = course;
  this.branch = branch;
  this.semester = semester;
  this.type = type;
  this.year = year || ""; // Optional field, defaults to empty if not provided
  this.fileName = fileName;
}

/**
 * Handles the form submission for uploading files.
 * Prevents default form submission, collects data,
 * saves the file to the server, and updates the UI.
 * 
 * @param {Event} event - The form submit event.
 */
function handleFormSubmit(event) {
  event.preventDefault(); // Prevent the page from reloading

  // Collect input values from form fields
  const programme = document.getElementById("programme").value.trim();
  const course = document.getElementById("course").value.trim();
  const branch = document.getElementById("branch").value.trim();
  const semester = parseInt(document.getElementById("semester").value, 10);
  const type = document.getElementById("fileType").value;

  // Year is only applicable if the file type is "Past Papers"
  const year = (type === "Past Papers")
    ? parseInt(document.getElementById("year").value, 10)
    : "";

  // Get the uploaded file's name
  const fileInput = document.getElementById("fileInput").files[0];
  const fileName = fileInput ? fileInput.name : "";

  // Create a new UploadedFile object
  const newFile = new UploadedFile(
    programme, course, branch, semester, type, year, fileName
  );

  // Add to our in-memory array of uploaded files
  uploadedFiles.push(newFile);

  // Save file to the server (mock async function)
  saveFileToServer(newFile).then(() => {
    alert("📤 File uploaded successfully!");
    renderTables(); // Refresh the tables after upload
  });

  // Reset the form for the next upload
  event.target.reset();

  // Hide/show year field depending on the file type
  toggleYearField();
}

/* ---------------- Event Listeners ---------------- */

// Update year field visibility when file type changes
document.getElementById("fileType").addEventListener("change", toggleYearField);

// Handle the upload form submission
document.getElementById("uploadForm").addEventListener("submit", handleFormSubmit);

// Initialize year field state on page load
toggleYearField();
