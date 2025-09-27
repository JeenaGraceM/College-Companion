// appointmentDetails.js

// Get references to form and doctor name display
const appointmentForm = document.getElementById('appointment_booking');
const doctorName = document.getElementById('doctor-name');
let selectedDate = null; // Currently selected date for booking
let savedAppointments = {}; // Booked slots by date: { "YYYY-MM-DD": { tasks: [...], notes: "..." } }
let leaveDates = []; // Dates when doctor is on leave

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

// Fetch doctor, student, leave, and appointment details
async function fetchDetails() {
  try {
    if (!doctorId || !studentId) return;


    // Fetch doctor info
    const doctorRes = await fetch(`http://localhost:5000/api/doctors/${doctorId}`);
    if (!doctorRes.ok) throw new Error(`Doctor fetch failed: ${doctorRes.status}`);
    const doctor = await doctorRes.json();
    console.log('Doctor:', doctor);

    // Fetch student info (optional, for local use)
    const userRes = await fetch(`http://localhost:5000/api/dummy/user`);  // correct this part before finalising
    if (!userRes.ok) throw new Error(`User fetch failed: ${userRes.status}`);
    const user = await userRes.json();
    console.log('Student:', user);

    // Show doctor name and specialization
    doctorName.innerHTML = `<h2>${doctor.fullName || ''}</h2><p>Specialization: ${doctor.specialization || 'Not provided'}</p>`;

    // Fetch doctor's leave dates
    const resLeaves = await fetch(`http://localhost:5000/api/leaves/doctor/${doctorId}`);
    if (resLeaves.ok) {
      const leaves = await resLeaves.json();
      // Normalize leave dates to "YYYY-MM-DD"
      if (Array.isArray(leaves)) {
        leaveDates = leaves.map(l => (typeof l === 'string' ? l : (l.date || '').split('T')[0])).filter(Boolean);
      }
    } else {
      console.warn('Leaves fetch failed:', resLeaves.status);
    }

    // Fetch doctor's existing appointments
    const resAppointment = await fetch(`http://localhost:5000/api/appointments/doctor/${doctorId}`);
    if (resAppointment.ok) {
      const appointments = await resAppointment.json();
      appointments.forEach(app => {
        // Normalize appointment date to "YYYY-MM-DD"
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

// Save new appointments for selected date and slots
async function saveAppointments(date, slots, notes) {
  try {
    // Disable submit button while saving
    const submitBtn = appointmentForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    // POST one appointment per slot to server
    for (const slot of slots) {
      const payload = {
        doctor_id: doctorId,
        student_id: studentId,
        appointment_date: dateToIsoZ(date),
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
      await res.json(); // Wait for completion
    }

    // Update local state after saving
    if (!savedAppointments[date]) savedAppointments[date] = { tasks: [], notes: '' };
    savedAppointments[date].tasks.push(...slots);
    if (notes) savedAppointments[date].notes = notes;

    showMessage(`Saved ${slots.length} appointment(s) for ${date}`);
  } catch (err) {
    console.error('Error saving appointments:', err);
    showMessage('Error saving appointment. The slot may have been taken. Try again.', 'error');
  } finally {
    // Re-enable submit button
    const submitBtn = appointmentForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = false;
  }
}

// Generate events for calendar (booked and leave days)
function generateCalendarEvents() {
  const events = [];
  const totalSlots = 10; // update if your slots per day change

  // Add booked days
  Object.keys(savedAppointments).forEach(date => {
    const bookedCount = savedAppointments[date].tasks.length;

    if (bookedCount >= totalSlots) {
      // All slots booked → mark fully booked in red
      events.push({
        title: `Fully Booked (${bookedCount})`,
        start: date,
        color: 'red'
      });
    } else {
      // Partially booked → mark normally
      events.push({
        title: `Booked (${bookedCount})`,
        start: date,
        color: 'orange'
      });
    }
  });

  // Add leave days
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


// Show popup for selecting slots on a date
function showPopup(dateStr) {
  const popup = document.getElementById('popup');
  const dateTitle = document.getElementById('popup-date');
  const checkboxList = document.getElementById('checkbox-list');

  dateTitle.innerHTML = `Select appointment time <br><strong>${dateStr}</strong>`;

  // List of possible slots
  const defaultTasks = [
    '11.00-11.30', '11.30-12.00', '12.00-12.30', '12.30-1.00',
    '2.00-2.30', '2.30-3.00', '3.00-3.30', '3.30-4.00',
    '4.00-4.30', '4.30-5.00'
  ];
  const bookedTasks = savedAppointments[dateStr]?.tasks || [];

  // Render checkboxes for slots, disable if already booked
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

// Hide the popup
function closePopup() {
  const popup = document.getElementById('popup');
  if (popup) popup.style.display = 'none';
  selectedDate = null;
}

// Show a temporary message (success or error)
function showMessage(message, type = 'success') {
  const msg = document.createElement('div');
  msg.textContent = message;
  msg.className = `snackbar ${type}`;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3000);
}

// On page load, fetch details and set up calendar and form
document.addEventListener('DOMContentLoaded', async () => {
  await fetchDetails();

  // Set up the calendar UI
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

  // Handle appointment form submission
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

      // Prevent double-booking client-side
      const alreadyBooked = savedAppointments[selectedDate]?.tasks || [];
      const newTasks = tasks.filter(t => !alreadyBooked.includes(t));
      if (!newTasks.length) {
        showMessage('All selected slots already booked.', 'error');
        return;
      }

      await saveAppointments(selectedDate, newTasks, textarea?.value?.trim() || '');

      // Refresh calendar events after booking
      calendar.removeAllEvents();
      calendar.addEventSource(generateCalendarEvents());

      // Clear form and close popup
      if (textarea) textarea.value = '';
      closePopup();
    });
  }
});


