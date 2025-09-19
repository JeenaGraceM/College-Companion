// myAppointments.js
const container = document.getElementById('Entries');

async function fetchAppointmentsForStudent() {
  try {
    // Try query param userId first (in case redirected)
    const params = new URLSearchParams(window.location.search);
    const userIdFromQuery = params.get('userId');

    let student;
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

    const res = await fetch(`http://localhost:5000/api/appointments/student/${student._id}`);
    if (!res.ok) throw new Error(`Appointments fetch failed: ${res.status}`);
    const appointments = await res.json();

    if (!appointments || appointments.length === 0) {
      container.innerHTML = '<p>No appointments found.</p>';
      return;
    }

    // For each appointment fetch doctor details (could be optimized server-side)
    const doctorCache = {};
    const enriched = await Promise.all(appointments.map(async (app) => {
      const docId = app.doctor_id || app.doctorId || app.doctor;
      if (!docId) return { app };
      if (!doctorCache[docId]) {
        try {
          const dres = await fetch(`http://localhost:5000/api/medicalstaff/${docId}`);
          if (dres.ok) doctorCache[docId] = await dres.json();
          else doctorCache[docId] = null;
        } catch (err) {
          doctorCache[docId] = null;
        }
      }
      return { app, doctor: doctorCache[docId] };
    }));

    renderAppointments(enriched, student);
  } catch (err) {
    console.error('Error loading appointments:', err);
    container.innerHTML = '<p>Error loading appointments. Please try again later.</p>';
  }
}

function renderAppointments(list, student) {
  container.innerHTML = '';
  list.forEach(item => {
    const app = item.app;
    const doctor = item.doctor;
    const card = document.createElement('div');
    card.className = 'card';

    const h1 = document.createElement('h1');
    h1.textContent = doctor ? `Dr. ${doctor.name}` : 'Doctor';

    const pDate = document.createElement('p');
    // appointment_date could be ISO or date-only; normalize
    const rawDate = app.appointment_date || app.date || app.appointmentDate || '';
    const displayDate = rawDate ? (rawDate.split('T')[0]) : (app.appointment_date || 'Unknown');
    pDate.textContent = `Date: ${displayDate}`;

    const pSlot = document.createElement('p');
    pSlot.textContent = `Slot: ${app.slot || app.tasks?.join(', ') || 'N/A'}`;

    const pNotes = document.createElement('p');
    pNotes.textContent = `Notes: ${app.notes || ''}`;

    const pStatus = document.createElement('p');
    pStatus.textContent = `Status: ${app.status || 'Pending'}`;

    card.appendChild(h1);
    card.appendChild(pDate);
    card.appendChild(pSlot);
    card.appendChild(pNotes);
    card.appendChild(pStatus);

    container.appendChild(card);
  });
}

fetchAppointmentsForStudent();
