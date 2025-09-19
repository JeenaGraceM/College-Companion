// healthDashboard.js
const container = document.getElementById('Entries');

async function fetchEntries() {
  try {       // User fetch (dummy user for now)
    const userRes = await fetch('http://localhost:5000/api/dummy/user');
    if (!userRes.ok) throw new Error(`User fetch failed: ${userRes.status}`);
    const user = await userRes.json();
    console.log('Fetched user:', user);

    // Fetch medical staff entries
    const res = await fetch('http://localhost:5000/api/medicalstaff');
    if (!res.ok) throw new Error('Failed to fetch entries');
    const entries = await res.json();
    console.log('Fetched entries:', entries);

    renderEntries(entries, user);

  } catch (error) {
    console.error('Error fetching entries:', error);
    container.innerHTML = '<p>Error loading entries. Please try again later.</p>';
  }
}

function renderEntries(entries, user) {
  container.innerHTML = '';

  if (!entries || entries.length === 0) {
    container.innerHTML = '<p>No entries available.</p>';
    return;
  }

  entries.forEach(entry => {
    const card = document.createElement('div');
    card.className = 'card';

    const h1 = document.createElement('h1');
    h1.textContent = entry.name || 'Unnamed';

    const h3 = document.createElement('h3');
    h3.textContent = entry.specialization || 'General';

    const ul = document.createElement('ul');
    ul.textContent = 'Contact:';
    
    if (Array.isArray(entry.contact)) {
      entry.contact.forEach(c => {
        const li = document.createElement('li');
        li.textContent = `${c.type || 'tel'}: ${c.value || ''}`;
        ul.appendChild(li);
      });
    }

    const button = document.createElement('button');
    button.textContent = 'Book Appointment';
    button.onclick = () => {
      try {
        if (!entry._id) throw new Error('Entry ID is missing');
        // Pass doctorId + userId
        window.location.href = `appointmentDetails.html?doctorId=${entry._id}&userId=${user._id}`;
      } catch (err) {
        console.error('Redirect Failed', err);
        alert('Oops... An error occurred while trying to book an appointment.');
      }
    };

    card.appendChild(h1);
    card.appendChild(h3);
    card.appendChild(ul);
    card.appendChild(button);
    container.appendChild(card);
  });
}

fetchEntries();
