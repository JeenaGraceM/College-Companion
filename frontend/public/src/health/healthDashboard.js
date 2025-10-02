const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "../loginPage.html";
}
// ===== END NEW =====

// Get the container where doctor entries will be displayed
const container = document.getElementById('Entries');

// Fetch all doctors and the current user, then render the list
async function fetchEntries() {
  try {
    // ===== NEW: Fetch real logged-in user using token =====
    const userRes = await fetch('http://localhost:5000/api/auth/profile', {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!userRes.ok) {
      // If token is invalid, redirect to login
      localStorage.removeItem("token");
      window.location.href = "../loginPage.html";
      return;
    }
    const user = await userRes.json();
    console.log('Fetched user:', user);
    // ===== END NEW =====

    // Fetch all doctors
    const res = await fetch('http://localhost:5000/api/doctors');
    if (!res.ok) throw new Error('Failed to fetch entries');
    const entries = await res.json();
    console.log('Fetched doctors:', entries);

    // Render the doctor cards
    renderEntries(entries, user);

  } catch (error) {
    // Show error if anything fails
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

    // Doctor's name (backend may use fullName or name)
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
    button.onclick = () => {
      try {
        if (!entry._id) throw new Error('Doctor ID is missing');
        if (!user._id) throw new Error('User ID is missing');
        // Redirect to appointment details page with doctorId and userId in URL
        window.location.href = `appointmentDetails.html?doctorId=${entry._id}&userId=${user._id}`;
      } catch (err) {
        console.error('Redirect Failed', err);
        alert('Oops... An error occurred while trying to book an appointment.');
      }
    };

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