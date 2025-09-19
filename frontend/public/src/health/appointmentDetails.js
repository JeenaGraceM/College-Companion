// appointmentDetails.js
const appointmentForm = document.getElementById('appointment_booking');
const doctorName = document.getElementById('doctor-name');
let selectedDate = null;
let savedAppointments = {}; // { "YYYY-MM-DD": { tasks: [...], notes: "..." } }
let leaveDates = [];

const params = new URLSearchParams(window.location.search);
const doctorId = params.get('doctorId');
const studentId = params.get('userId');

if (!doctorId || !studentId) {
  console.warn('Missing doctorId or userId in URL. Make sure healthDashboard passes them.');
}

// helper: convert "YYYY-MM-DD" to ISO midnight Z (safe)
function dateToIsoZ(dateStr) {
  // treat as date only -> midnight UTC (server may convert to local)
  return new Date(dateStr + 'T00:00:00.000Z').toISOString();
}

async function fetchDetails() {
  try {
    if (!doctorId || !studentId) return; // nothing to do if missing

    // Fetch student (optional local use)
    const userRes = await fetch(`http://localhost:5000/api/users/${studentId}`);
    if (!userRes.ok) throw new Error(`User fetch failed: ${userRes.status}`);
    const user = await userRes.json();
    console.log('Student:', user);

    // Fetch doctor
    const doctorRes = await fetch(`http://localhost:5000/api/medicalstaff/${doctorId}`);
    if (!doctorRes.ok) throw new Error(`Doctor fetch failed: ${doctorRes.status}`);
    const doctor = await doctorRes.json();
    console.log('Doctor:', doctor);

    doctorName.innerHTML = `<h2>Dr. ${doctor.name || ''}</h2><p>Specialization: ${doctor.specialization || ''}</p>`;

    // Fetch leaves — handle both formats: array of strings or array of objects {date}
    const resLeaves = await fetch(`http://localhost:5000/api/leaves/doctor/${doctorId}`);
    if (resLeaves.ok) {
      const leaves = await resLeaves.json();
      if (Array.isArray(leaves)) {
        leaveDates = leaves.map(l => (typeof l === 'string' ? l : (l.date || '').split('T')[0])).filter(Boolean);
      }
    } else {
      console.warn('Leaves fetch failed:', resLeaves.status);
    }

    // Fetch doctor appointments
    const resAppointment = await fetch(`http://localhost:5000/api/appointments/doctor/${doctorId}`);
    if (resAppointment.ok) {
      const appointments = await resAppointment.json();
      appointments.forEach(app => {
        // convert appointment_date (ISO) -> YYYY-MM-DD
        let dateKey = '';
        if (app.appointment_date) {
          dateKey = app.appointment_date.split('T')[0];
        } else if (app.date) {
          dateKey = app.date.split('T')[0];
        }
        if (!dateKey) return;
        if (!savedAppointments[dateKey]) savedAppointments[dateKey] = { tasks: [], notes: '' };
        if (app.slot) savedAppointments[dateKey].tasks.push(app.slot);
        if (app.notes) savedAppointments[dateKey].notes = app.notes;
      });
    } else {
      console.warn('Appointments fetch failed:', resAppointment.status);
    }

    console.log('leaveDates:', leaveDates, 'savedAppointments:', savedAppointments);
  } catch (err) {
    console.error('Error in fetchDetails:', err);
  }
}

async function saveAppointments(date, slots, notes) {
  try {
    // disable form while saving
    const submitBtn = appointmentForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    // POST one appointment per slot (server expects separate documents)
    for (const slot of slots) {
      const payload = {
        doctor_id: doctorId,
        student_id: studentId,
        appointment_date: dateToIsoZ(date), // ISO string midnight UTC for that date
        slot,
        notes: notes || ''
      };

      const res = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Failed to save slot ${slot}: ${res.status} ${txt}`);
      }
      await res.json(); // ignore response body but wait for completion
    }

    // update local state
    if (!savedAppointments[date]) savedAppointments[date] = { tasks: [], notes: '' };
    savedAppointments[date].tasks.push(...slots);
    if (notes) savedAppointments[date].notes = notes;

    showMessage(`Saved ${slots.length} appointment(s) for ${date}`);
  } catch (err) {
    console.error('Error saving appointments:', err);
    showMessage('Error saving appointment. The slot may have been taken. Try again.', 'error');
  } finally {
    const submitBtn = appointmentForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = false;
  }
}

function generateCalendarEvents() {
  const events = [];
  // booked days
  Object.keys(savedAppointments).forEach(date => {
    const bookedCount = savedAppointments[date].tasks.length;
    events.push({
      title: `Booked (${bookedCount})`,
      start: date
    });
  });
  // leaves (push after so leaves may show differently in UI)
  leaveDates.forEach(date => {
    // if also booked, show combined title
    const isBooked = !!savedAppointments[date];
    events.push({
      title: isBooked ? `Leave & Booked (${savedAppointments[date].tasks.length})` : 'Doctor on Leave',
      start: date
    });
  });
  return events;
}

function showPopup(dateStr) {
  const popup = document.getElementById('popup');
  const dateTitle = document.getElementById('popup-date');
  const checkboxList = document.getElementById('checkbox-list');

  dateTitle.innerHTML = `Select appointment time <br><strong>${dateStr}</strong>`;

  const defaultTasks = [
    '11.00-11.30', '11.30-12.00', '12.00-12.30', '12.30-1.00',
    '2.00-2.30', '2.30-3.00', '3.00-3.30', '3.30-4.00',
    '4.00-4.30', '4.30-5.00'
  ];
  const bookedTasks = savedAppointments[dateStr]?.tasks || [];

  checkboxList.innerHTML = defaultTasks.map(task => {
    const isBooked = bookedTasks.includes(task);
    return `
      <label style="color: ${isBooked ? '#999' : '#333'};">
        <input type="checkbox" value="${task}" ${isBooked ? 'disabled' : ''}>
        ${task} ${isBooked ? '(Booked)' : ''}
      </label>
    `;
  }).join('<br/>');

  popup.style.display = 'block';
}

function closePopup() {
  const popup = document.getElementById('popup');
  if (popup) popup.style.display = 'none';
  selectedDate = null;
}

function showMessage(message, type = 'success') {
  const msg = document.createElement('div');
  msg.textContent = message;
  msg.className = `snackbar ${type}`;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', async () => {
  await fetchDetails();

  const calendarEl = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    selectable: true,
    events: generateCalendarEvents(),
    dateClick: (info) => {
      const isLeave = leaveDates.includes(info.dateStr);
      const isBooked = savedAppointments[info.dateStr] !== undefined;
      if (isLeave) {
        showMessage(`Doctor is on leave on ${info.dateStr}`, 'error');
        return;
      }
      selectedDate = info.dateStr;
      showPopup(info.dateStr);
    }
  });
  calendar.render();

  // handle submit (book appointment)
  if (appointmentForm) {
    appointmentForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const textarea = document.getElementById('appointment_info');
      const checkboxes = document.querySelectorAll('#checkbox-list input:checked');
      const tasks = Array.from(checkboxes).map(cb => cb.value);

      if (!selectedDate) {
        showMessage('Please select a date first.', 'error');
        return;
      }
      if (!tasks.length) {
        showMessage('Please select at least one appointment slot.', 'error');
        return;
      }

      // prevent double-booking client-side
      const alreadyBooked = savedAppointments[selectedDate]?.tasks || [];
      const newTasks = tasks.filter(t => !alreadyBooked.includes(t));
      if (!newTasks.length) {
        showMessage('All selected slots already booked.', 'error');
        return;
      }

      await saveAppointments(selectedDate, newTasks, textarea?.value?.trim() || '');

      // update calendar events
      calendar.removeAllEvents();
      calendar.addEventSource(generateCalendarEvents());

      // cleanup UI
      if (textarea) textarea.value = '';
      closePopup();
    });
  }
});
