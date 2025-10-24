document.addEventListener('DOMContentLoaded', () => {
    const lostFoundForm = document.getElementById('lost-found-form');
    const lostFoundContainer = document.getElementById('lost-found-container');
    const itemImagesInput = document.getElementById('item-images');
    const customUploadBtn = document.getElementById('custom-upload-btn');
    const imagePreviewContainer = document.getElementById('image-preview-container');

    if (customUploadBtn) {
        customUploadBtn.addEventListener('click', () => {
            itemImagesInput.click();
        });
    }

    if (itemImagesInput) {
        itemImagesInput.addEventListener('change', (event) => {
            imagePreviewContainer.innerHTML = ''; // Clear previous previews
            const files = event.target.files;
            if (files.length > 5) {
                alert('You can only upload a maximum of 5 images.');
                event.target.value = '';
                return;
            }
            for (const file of files) {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.alt = file.name;
                        imagePreviewContainer.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                }
            }
        });
    }

    if (lostFoundForm) {
        lostFoundForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(lostFoundForm);
            
            console.log('Form data ready to be sent to server:');
            for (const [key, value] of formData.entries()) {
                console.log(key, value);
            }

            
            alert('Form data logged to console. Server is not active to process the request.');
        });
    }
});
// API Base URL
const API_BASE = 'http://localhost:3001/api';

// Common function to show messages
function showMessage(message, type = 'success') {
    alert(message);
}

// Lost & Found functionality
if (document.getElementById('lost-found-form')) {
    const form = document.getElementById('lost-found-form');
    const container = document.getElementById('lost-found-container');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            itemType: document.getElementById('item-type').value,
            itemName: document.getElementById('item-name').value,
            description: document.getElementById('description').value,
            contactInfo: document.getElementById('contact-info').value
        };

        try {
            const response = await fetch(`${API_BASE}/lostfound`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                showMessage('Item submitted successfully!');
                form.reset();
                loadLostFoundItems();
            } else {
                showMessage('Error: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error submitting item', 'error');
        }
    });

    async function loadLostFoundItems() {
        try {
            const response = await fetch(`${API_BASE}/lostfound`);
            const result = await response.json();
            
            container.innerHTML = '';
            
            if (result.success && result.data.length > 0) {
                result.data.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'lost-found-item';
                    itemDiv.innerHTML = `
                        <h3>${item.itemType}: ${item.itemName}</h3>
                        <p><strong>Description:</strong> ${item.description}</p>
                        <p><strong>Contact:</strong> ${item.contactInfo}</p>
                        <p><strong>Posted:</strong> ${new Date(item.createdAt).toLocaleDateString()}</p>
                    `;
                    container.appendChild(itemDiv);
                });
            } else {
                container.innerHTML = '<p>No items found. Be the first to post one!</p>';
            }
        } catch (error) {
            console.error('Error loading items:', error);
            container.innerHTML = '<p>Error loading items. Please try again later.</p>';
        }
    }

    // Load items when page loads
    loadLostFoundItems();
}

// Confessions functionality
if (document.getElementById('confession-form')) {
    const form = document.getElementById('confession-form');
    const container = document.getElementById('confession-container');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const content = document.getElementById('confession-text').value.trim();
        
        if (!content) {
            showMessage('Please enter a confession', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/confessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content })
            });

            const result = await response.json();

            if (result.success) {
                showMessage('Confession posted successfully!');
                form.reset();
                loadConfessions();
            } else {
                showMessage('Error: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error posting confession', 'error');
        }
    });

    async function loadConfessions() {
        try {
            const response = await fetch(`${API_BASE}/confessions`);
            const result = await response.json();
            
            container.innerHTML = '';
            
            if (result.success && result.data.length > 0) {
                result.data.forEach(confession => {
                    const confessionDiv = document.createElement('div');
                    confessionDiv.className = 'confession';
                    confessionDiv.innerHTML = `
                        <p>${confession.content}</p>
                        <small>Posted on ${new Date(confession.date).toLocaleDateString()}</small>
                    `;
                    container.appendChild(confessionDiv);
                });
            } else {
                container.innerHTML = '<p>No confessions yet. Be the first to share!</p>';
            }
        } catch (error) {
            console.error('Error loading confessions:', error);
            container.innerHTML = '<p>Error loading confessions. Please try again later.</p>';
        }
    }

    // Load confessions when page loads
    loadConfessions();
}

// Polls functionality
if (document.getElementById('poll-container')) {
    const pollContainer = document.getElementById('poll-container');
    const resultsContainer = document.getElementById('poll-results-container');

    async function loadPoll() {
        try {
            const response = await fetch(`${API_BASE}/poll/daily`);
            const result = await response.json();
            
            if (result.success && result.data) {
                const poll = result.data;
                displayPoll(poll);
            } else {
                pollContainer.innerHTML = '<p>No active poll at the moment.</p>';
            }
        } catch (error) {
            console.error('Error loading poll:', error);
            pollContainer.innerHTML = '<p>Error loading poll. Please try again later.</p>';
        }
    }

    function displayPoll(poll) {
        pollContainer.innerHTML = `
            <h3>${poll.question}</h3>
            <div id="poll-options">
                ${poll.options.map((option, index) => `
                    <div class="poll-option" data-index="${index}">
                        ${option.text}
                    </div>
                `).join('')}
            </div>
            <button onclick="showResults('${poll._id}')">View Results</button>
        `;

        // Add click event to options
        document.querySelectorAll('.poll-option').forEach(option => {
            option.addEventListener('click', async function() {
                const optionIndex = parseInt(this.getAttribute('data-index'));
                await vote(poll._id, optionIndex);
            });
        });
    }

    async function vote(pollId, optionIndex) {
        try {
            const response = await fetch(`${API_BASE}/poll/vote/${pollId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ optionIndex })
            });

            const result = await response.json();

            if (result.success) {
                showMessage('Vote recorded successfully!');
                showResults(pollId);
            } else {
                showMessage('Error: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error voting:', error);
            showMessage('Error recording vote', 'error');
        }
    }

    async function showResults(pollId) {
        try {
            const response = await fetch(`${API_BASE}/poll/daily`);
            const result = await response.json();
            
            if (result.success && result.data) {
                const poll = result.data;
                const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
                
                resultsContainer.innerHTML = `
                    <h3>Results: ${poll.question}</h3>
                    ${poll.options.map(option => {
                        const percentage = totalVotes > 0 ? (option.votes / totalVotes * 100).toFixed(1) : 0;
                        return `
                            <div>
                                <strong>${option.text}:</strong> 
                                ${option.votes} votes (${percentage}%)
                            </div>
                        `;
                    }).join('')}
                    <p><strong>Total votes:</strong> ${totalVotes}</p>
                    <button onclick="hideResults()">Back to Poll</button>
                `;
                
                resultsContainer.style.display = 'block';
                pollContainer.style.display = 'none';
            }
        } catch (error) {
            console.error('Error loading results:', error);
        }
    }

    // Make functions global for onclick handlers
    window.showResults = showResults;
    window.hideResults = function() {
        resultsContainer.style.display = 'none';
        pollContainer.style.display = 'block';
    };

    // Load poll when page loads
    loadPoll();
}

// Home page functionality
if (document.querySelector('.welcome-section')) {
    console.log('Welcome to Campus Connect!');
}