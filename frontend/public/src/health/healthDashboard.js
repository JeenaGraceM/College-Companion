// healthDashboard.js

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user")); // ✅ read stored user

// Get the container where doctor entries will be displayed
const container = document.getElementById('Entries');

// Optional: Add extra doctor dashboard page access button
function showDoctorPageButton() {
  if (user && user.role === 'doctor') {
    const btn = document.createElement('button');
    btn.id = 'doctor_page';
    btn.textContent = 'Doctor Dashboard';
    btn.onclick = () => window.location.href = 'doctorDashboard.html';
    document.body.insertBefore(btn, container);
  }
}

// Fetch all doctors and the current user, then render the list
async function fetchEntries() {
  try {
    if (!user) throw new Error("User not logged in or missing from localStorage");
    console.log('Loaded user from localStorage:', user);

    // Show doctor page button if role is doctor
    showDoctorPageButton();

    // Fetch all doctors
    const res = await fetch('http://localhost:5000/api/doctors', {
      headers: { "Authorization": `Bearer ${token}` } // optional if protected
    });
    if (!res.ok) throw new Error('Failed to fetch entries');
    const entries = await res.json();
    console.log('Fetched doctors:', entries);

    // Render the doctor cards
    renderEntries(entries, user);

  } catch (error) {
    console.error('Error fetching entries:', error);
    container.innerHTML = '<p>Error loading entries. Please try again later.</p>';
  }
}

// Render doctor cards with booking button
function renderEntries(entries, user) {
  container.innerHTML = '';

  if (!entries || entries.length === 0) {
    container.innerHTML = '<p>No doctors available.</p>';
    return;
  }

  entries.forEach(entry => {
    const card = document.createElement('div');
    card.className = 'card';

    // Doctor's name
    const h1 = document.createElement('h1');
    h1.textContent = entry.fullName || entry.name || 'Unnamed Doctor';

    // Doctor's specialization
    const h3 = document.createElement('h3');
    h3.textContent = entry.specialization || 'Specialization not provided';

    // Doctor's contact info
    const ul = document.createElement('ul');
    ul.textContent = 'Contact:';
    if (Array.isArray(entry.contact)) {
      entry.contact.forEach(c => {
        const li = document.createElement('li');
        li.textContent = `${c.type || 'tel'}: ${c.value || ''}`;
        ul.appendChild(li);
      });
    } else if (entry.email) {
      const li = document.createElement('li');
      li.textContent = `email: ${entry.email}`;
      ul.appendChild(li);
    }

    // Book Appointment button
    const button = document.createElement('button');
    button.textContent = 'Book Appointment';

    // ✅ Freeze button for doctors
    if (user.role === 'doctor') {
      button.disabled = true;
      button.textContent = 'Booking Disabled';
      button.style.cursor = 'not-allowed';
      button.style.backgroundColor = '#999';
      button.title = 'Doctors cannot book appointments';
    } else {
      button.onclick = () => {
        try {
          if (!entry._id) throw new Error('Doctor ID is missing');
          if (!user || !user.id) throw new Error('User ID is missing');
          window.location.href = `appointmentDetails.html?doctorId=${entry._id}&userId=${user.id}`;
        } catch (err) {
          console.error('Redirect Failed', err);
          alert('Oops... An error occurred while trying to book an appointment.');
        }
      };
    }

    // Add all elements to card and card to container
    card.appendChild(h1);
    card.appendChild(h3);
    card.appendChild(ul);
    card.appendChild(button);
    container.appendChild(card);
  });
}

// Start fetching entries when script loads
fetchEntries();
