// ===============================
// Doctor Dashboard JS
// ===============================

const API_BASE = "http://localhost:5000/api";

// Get user and token from localStorage
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "null");

if (!user || user.role?.toLowerCase() !== "doctor" || !token) {
  alert("You must log in as a doctor first.");
  window.location.href = "loginPage.html";
  throw new Error("Unauthorized access");
}

const doctor_id = user.id || user._id;

// DOM Elements
const profileName = document.getElementById("doctor_name");
const profileEmail = document.getElementById("doctor_email");
const profileSpecialization = document.getElementById("doctor_specialization");

const leaveForm = document.getElementById("leaveForm");
const leaveDateInput = document.getElementById("leave_date");
const leaveReasonInput = document.getElementById("reason");
const leaveTableBody = document.getElementById("leaveTableBody");

// Optional appointment lists
const upcomingList = document.getElementById("upcoming_appointments") || createUL("upcoming_appointments");
const pastList = document.getElementById("past_appointments") || createUL("past_appointments");

// Helper to create missing UL dynamically
function createUL(id) {
  const ul = document.createElement("ul");
  ul.id = id;
  document.body.appendChild(ul);
  return ul;
}

// ================== Profile ==================
async function fetchProfile() {
  try {
    const res = await fetch(`${API_BASE}/doctors/${doctor_id}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Profile fetch failed");

    const doctor = await res.json();
    profileName.textContent = doctor.fullName || "N/A";
    profileEmail.textContent = doctor.email || "N/A";
    profileSpecialization.textContent = doctor.specialization || "N/A";
  } catch (err) {
    console.error("Error fetching profile:", err);
    profileName.textContent = "Error";
    profileEmail.textContent = "Error";
    profileSpecialization.textContent = "Error";
  }
}

// ================== Leaves ==================
async function loadLeaves() {
  try {
    const res = await fetch(`${API_BASE}/leaves/doctor/${doctor_id}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch leaves");

    const leaves = await res.json();
    leaveTableBody.innerHTML = "";

    if (!leaves || leaves.length === 0) {
      leaveTableBody.innerHTML = `<tr><td colspan="3">No leaves found</td></tr>`;
      return;
    }

    leaves.forEach(l => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${new Date(l.leave_date).toLocaleDateString()}</td>
        <td>${l.reason || "-"}</td>
        <td><button onclick="deleteLeave('${l._id}')">Delete</button></td>
      `;
      leaveTableBody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error loading leaves:", err);
  }
}

async function addLeave(e) {
  e.preventDefault();

  const leave_date = leaveDateInput.value; // YYYY-MM-DD format
  const reason = leaveReasonInput.value;

  if (!leave_date) {
    alert("Please select a leave date");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/leaves`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({ 
        doctor_id: doctor_id,       // backend expects doctor_id
        leave_date: leave_date,    // use YYYY-MM-DD directly
        reason: reason
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Server response:", errText);
      throw new Error("Leave add failed");
    }

    leaveForm.reset();
    loadLeaves();
  } catch (err) {
    console.error("Error adding leave:", err);
    alert("Failed to add leave. Check console for details.");
  }
}

async function deleteLeave(id) {
  if (!confirm("Delete this leave?")) return;

  try {
    const res = await fetch(`${API_BASE}/leaves/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Failed to delete leave");

    loadLeaves();
  } catch (err) {
    console.error("Error deleting leave:", err);
    alert("Failed to delete leave");
  }
}

// ================== Appointments ==================
async function fetchAppointments() {
  try {
    const res = await fetch(`${API_BASE}/appointments/doctor/${doctor_id}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch appointments");

    const apps = await res.json();
    const now = new Date();

    upcomingList.innerHTML = "";
    pastList.innerHTML = "";

    apps.forEach(app => {
      const date = new Date(app.appointment_date || app.date);
      const li = document.createElement("li");
      li.textContent = `${date.toLocaleDateString()} - ${app.student_id?.fullName || "Unknown"} (${app.status || "Pending"})`;

      if (date >= now) {
        upcomingList.appendChild(li);
      } else {
        pastList.appendChild(li);
      }
    });

    if (upcomingList.innerHTML === "") upcomingList.innerHTML = "<li>No upcoming appointments</li>";
    if (pastList.innerHTML === "") pastList.innerHTML = "<li>No past appointments</li>";

  } catch (err) {
    console.error("Error loading appointments:", err);
  }
}

// ================== Initialize ==================
document.addEventListener("DOMContentLoaded", () => {
  fetchProfile();
  loadLeaves();
  fetchAppointments();

  leaveForm.addEventListener("submit", addLeave);
});
