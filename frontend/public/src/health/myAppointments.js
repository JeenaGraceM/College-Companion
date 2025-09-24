// myAppointments.js

// Containers
const upcomingContainer = document.getElementById('upcoming_appointments');
const pastContainer = document.getElementById('past_appointments');

// Main function to fetch and display appointments for the student
async function fetchAppointmentsForStudent() {
  try {
    // Get userId from URL query params (if redirected from another page)
    const params = new URLSearchParams(window.location.search);
    const userIdFromQuery = params.get('userId');

    let student;
    // If userId is present in URL, fetch that user; else, fetch dummy user
    if (userIdFromQuery) {
      const userRes = await fetch(`http://localhost:5000/api/users/${userIdFromQuery}`);
      if (!userRes.ok) throw new Error(`User fetch failed: ${userRes.status}`);
      student = await userRes.json();
    } else {
      const userRes = await fetch('http://localhost:5000/api/dummy/user');
      if (!userRes.ok) throw new Error(`User fetch failed: ${userRes.status}`);
      student = await userRes.json();
    }
    console.log('Student:', student);

    // ✅ FIX: use the correct backend route
    const res = await fetch(`http://localhost:5000/api/appointments/users/${student._id}`);
    if (!res.ok) throw new Error(`Appointments fetch failed: ${res.status}`);
    const appointments = await res.json();

    // If no appointments, show message
    if (!appointments || appointments.length === 0) {
      upcomingContainer.innerHTML = '<li>No upcoming appointments.</li>';
      pastContainer.innerHTML = '<li>No past appointments.</li>';
      return;
    }

    // Split into upcoming & past
    const now = new Date();
    const upcoming = [];
    const past = [];

    appointments.forEach(app => {
      const rawDate = app.appointment_date || app.date || app.appointmentDate;
      const appDate = rawDate ? new Date(rawDate) : null;
      if (appDate && appDate >= now) {
        upcoming.push(app);
      } else {
        past.push(app);
      }
    });

    // Render
    renderAppointments(upcoming, upcomingContainer, "No upcoming appointments.");
    renderAppointments(past, pastContainer, "No past appointments.");
  } catch (err) {
    console.error('Error loading appointments:', err);
    upcomingContainer.innerHTML = '<li>Error loading appointments.</li>';
    pastContainer.innerHTML = '<li>Error loading appointments.</li>';
  }
}

// Render appointment list items
function renderAppointments(list, container, emptyMessage) {
  container.innerHTML = '';

  if (!list || list.length === 0) {
    container.innerHTML = `<li>${emptyMessage}</li>`;
    return;
  }

  list.forEach(app => {
    const li = document.createElement('li');

    const rawDate = app.appointment_date || app.date || app.appointmentDate || '';
    const displayDate = rawDate ? rawDate.split('T')[0] : 'Unknown';

    li.innerHTML = `
      <strong>Doctor:</strong> ${app.doctor_id?.name || "N/A"} <br>
      <strong>Date:</strong> ${displayDate} <br>
      <strong>Slot:</strong> ${app.slot || 'N/A'} <br>
      <strong>Status:</strong> ${app.status || 'Pending'}
    `;

    container.appendChild(li);
  });
}

// Start fetching appointments when script loads
fetchAppointmentsForStudent();
