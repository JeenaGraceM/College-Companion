// appointmentDetails.js

// Get references to form and doctor name display
const appointmentForm = document.getElementById('appointment_booking');
const doctorName = document.getElementById('doctor-name');
let selectedDate = null; // Currently selected date for booking
let savedAppointments = {}; // Booked slots by date: { "YYYY-MM-DD": { tasks: [...], notes: "..." } }
let leaveDates = []; // Dates when doctor is on leave
let tempSelectedSlots = [];
let calendar; // global calendar instance

// --- Secure fetch helper (always include JWT token) ---
async function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No token found in localStorage. User may not be logged in.");
    throw new Error("Unauthorized - no token");
  }
  const headers = {
    ...(options.headers || {}),
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };
  return fetch(url, { ...options, headers });
}

// Get doctorId and studentId from URL query params
const params = new URLSearchParams(window.location.search);
const doctorId = params.get('doctorId');
const studentId = params.get('userId');

if (!doctorId || !studentId) {
  console.warn('Missing doctorId or userId in URL. Make sure healthDashboard passes them.');
}

// Helper: convert "YYYY-MM-DD" to ISO string at midnight UTC
function dateToIsoZ(dateStr) {
  return new Date(dateStr + 'T00:00:00.000Z').toISOString();
}

// Fetch doctor, leave, and appointment details
async function fetchDetails() {
  try {
    if (!doctorId || !studentId) return;

    // Doctor info
    const doctorRes = await authFetch(`http://localhost:5000/api/doctors/${doctorId}`);
    if (!doctorRes.ok) throw new Error(`Doctor fetch failed: ${doctorRes.status}`);
    const doctor = await doctorRes.json();
    doctorName.innerHTML = `<h2>${doctor.fullName || ''}</h2><p>Specialization: ${doctor.specialization || 'Not provided'}</p>`;

    // Doctor's leave dates
    const resLeaves = await authFetch(`http://localhost:5000/api/leaves/doctor/${doctorId}`);
    if (resLeaves.ok) {
      const leaves = await resLeaves.json();
      leaveDates = (Array.isArray(leaves) ? leaves : [])
        .map(l => (typeof l === 'string' ? l : (l.date || '').split('T')[0]))
        .filter(Boolean);
    }

    // Doctor's existing appointments
    const resAppointment = await authFetch(`http://localhost:5000/api/appointments/doctor/${doctorId}`);
    if (resAppointment.ok) {
      const appointments = await resAppointment.json();
      appointments.forEach(app => {
        let dateKey = app.appointment_date
          ? app.appointment_date.split('T')[0]
          : (app.date || '').split('T')[0];
        if (!dateKey) return;
        if (!savedAppointments[dateKey]) savedAppointments[dateKey] = { tasks: [], notes: '' };
        if (app.slot) savedAppointments[dateKey].tasks.push(app.slot);
        if (app.notes) savedAppointments[dateKey].notes = app.notes;
      });
    }

    console.log('leaveDates:', leaveDates, 'savedAppointments:', savedAppointments);
  } catch (err) {
    console.error('Error in fetchDetails:', err);
  }
}

// Save new appointments for selected date and slots
async function saveAppointments(date, slots, notes) {
  try {
    const submitBtn = appointmentForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    for (const slot of slots) {
      const payload = {
        doctor_id: doctorId,
        student_id: studentId,
        appointment_date: dateToIsoZ(date),
        slot,
        notes: notes || ''
      };

      const res = await authFetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Failed to save slot ${slot}: ${res.status} ${txt}`);
      }
      await res.json();
    }

    if (!savedAppointments[date]) savedAppointments[date] = { tasks: [], notes: '' };
    savedAppointments[date].tasks.push(...slots);
    if (notes) savedAppointments[date].notes = notes;

    showBookingSuccess();
  } catch (err) {
    console.error('Error saving appointments:', err);
  } finally {
    const submitBtn = appointmentForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = false;
  }
}

// Generate events for calendar (booked and leave days)
function generateCalendarEvents() {
  const events = [];
  const totalSlots = 10;

  Object.keys(savedAppointments).forEach(date => {
    const bookedCount = savedAppointments[date].tasks.length;
    if (bookedCount >= totalSlots) {
      events.push({ title: `Fully Booked (${bookedCount})`, start: date, color: 'red' });
    } else {
      events.push({ title: `Booked (${bookedCount})`, start: date, color: 'orange' });
    }
  });

  leaveDates.forEach(date => {
    const isBooked = !!savedAppointments[date];
    events.push({
      title: isBooked
        ? `Leave & Booked (${savedAppointments[date].tasks.length})`
        : 'Doctor on Leave',
      start: date,
      color: 'gray'
    });
  });

  return events;
}

// Show popup for selecting slots
function showPopup(dateStr) {
  const popup = document.getElementById('popup');
  const dateTitle = document.getElementById('popup-date');
  const checkboxList = document.getElementById('checkbox-list');

  dateTitle.innerHTML = `Select appointment time <br><strong>${dateStr}</strong>`;

  const defaultTasks = [
    '11.00 am - 11.30 am', '11.30 am - 12.00 pm ', '12.00 pm - 12.30 pm', '12.30 pm - 1.00 pm ',
    '2.00 pm - 2.30 pm', '2.30 pm - 3.00 pm', '3.00  pm - 3.30  pm', '3.30 pm - 4.00 pm',
    '4.00  pm - 4.30 pm', '4.30 pm - 5.00 pm'
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
}

function showBookingSuccess() {
  const modal = document.getElementById('booking-success');
  const goBtn = document.getElementById('go-dashboard');
  modal.style.display = 'flex';
  goBtn.onclick = () => {
    window.location.href = `healthDashboard.html`;
  };
}

function showMessage(message, type = 'success') {
  const msg = document.createElement('div');
  msg.textContent = message;
  msg.className = `snackbar ${type}`;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3000);
}

function saveDate() {
  const checkboxes = document.querySelectorAll('#checkbox-list input:checked');
  tempSelectedSlots = Array.from(checkboxes).map(cb => cb.value);

  if (!selectedDate) {
    showMessage('Please select a date first.', 'error');
    return;
  }
  if (!tempSelectedSlots.length) {
    showMessage('Please select at least one appointment slot.', 'error');
    return;
  }

  closePopup();
  showMessage('Slots selected. Please enter notes and press "Book Appointment".', 'success');
}

// On page load
document.addEventListener('DOMContentLoaded', async () => {
  await fetchDetails();

  const calendarEl = document.getElementById('calendar');
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    selectable: true,
    events: generateCalendarEvents(),
    dateClick: (info) => {
      const isLeave = leaveDates.includes(info.dateStr);
      if (isLeave) {
        showMessage(`Doctor is on leave on ${info.dateStr}`, 'error');
        return;
      }
      selectedDate = info.dateStr;
      showPopup(info.dateStr);
    }
  });
  calendar.render();

  if (appointmentForm) {
    appointmentForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!selectedDate) {
        showMessage('Please select a date first.', 'error');
        return;
      }
      if (!tempSelectedSlots.length) {
        showMessage('Please select slots from the popup first.', 'error');
        return;
      }

      const textarea = document.getElementById('appointment_info');
      const notes = textarea?.value?.trim() || '';

      await saveAppointments(selectedDate, tempSelectedSlots, notes);

      calendar.removeAllEvents();
      calendar.addEventSource(generateCalendarEvents());

      tempSelectedSlots = [];
      if (textarea) textarea.value = '';
      closePopup();
    });
  }
});