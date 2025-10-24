document.addEventListener('DOMContentLoaded', () => {
    const createPollForm = document.getElementById('create-poll-form');
    const pollContainer = document.getElementById('poll-container');
    const pollResultsContainer = document.getElementById('poll-results-container');
    const addOptionBtn = document.getElementById('add-option-btn');

    // Add option button
    if (addOptionBtn) {
        addOptionBtn.addEventListener('click', () => {
            const optionsContainer = document.getElementById('poll-options-container');
            const optionCount = optionsContainer.children.length;
            const newOption = document.createElement('input');
            newOption.type = 'text';
            newOption.className = 'poll-option-input';
            newOption.placeholder = `Option ${optionCount + 1}`;
            newOption.required = true;
            optionsContainer.appendChild(newOption);
        });
    }

    // Create poll form
    if (createPollForm) {
        createPollForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const question = document.getElementById('poll-question').value;
            const optionInputs = document.querySelectorAll('.poll-option-input');
            const options = Array.from(optionInputs)
                .map(input => input.value.trim())
                .filter(value => value !== '');

            if (options.length < 2) {
                alert('Please add at least 2 options');
                return;
            }

            const pollData = {
                question,
                options: options.map(text => ({ text, votes: 0 }))
            };

            try {
                const response = await fetch('http://localhost:5000/api/poll', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(pollData)
                });

                if (response.ok) {
                    const result = await response.json();
                    alert('Poll created successfully!');
                    createPollForm.reset();
                    loadCurrentPoll();
                } else {
                    const error = await response.json();
                    alert('Error: ' + error.message);
                }
            } catch (error) {
                console.error('Error creating poll:', error);
                alert('Failed to create poll. Please check if the server is running.');
            }
        });
    }

    // Load current poll
    loadCurrentPoll();
});

async function loadCurrentPoll() {
    try {
        const response = await fetch('http://localhost:5000/api/poll/daily');
        if (response.ok) {
            const poll = await response.json();
            displayPoll(poll);
        } else {
            document.getElementById('poll-container').innerHTML = '<p>No active poll available.</p>';
        }
    } catch (error) {
        console.error('Error loading poll:', error);
        document.getElementById('poll-container').innerHTML = '<p>Error loading poll. Make sure the server is running.</p>';
    }
}

function displayPoll(poll) {
    const pollContainer = document.getElementById('poll-container');
    const resultsContainer = document.getElementById('poll-results-container');
    
    pollContainer.innerHTML = `
        <div class="poll-question">
            <h3>${poll.question}</h3>
            <p><small>Created: ${new Date(poll.date).toLocaleDateString()}</small></p>
        </div>
        <div class="poll-options">
            ${poll.options.map((option, index) => `
                <button class="poll-option-btn" onclick="voteOnPoll('${poll._id}', ${index})">
                    ${option.text}
                </button>
            `).join('')}
        </div>
    `;
    
    resultsContainer.style.display = 'none';
    pollContainer.style.display = 'block';
}

async function voteOnPoll(pollId, optionIndex) {
    try {
        const response = await fetch(`http://localhost:5000/api/poll/vote/${pollId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ optionIndex })
        });

        if (response.ok) {
            const updatedPoll = await response.json();
            displayPollResults(updatedPoll);
            alert('Vote recorded!');
        } else {
            const error = await response.json();
            alert('Error: ' + error.message);
        }
    } catch (error) {
        console.error('Error voting:', error);
        alert('Failed to vote. Please try again.');
    }
}

function displayPollResults(poll) {
    const pollContainer = document.getElementById('poll-container');
    const resultsContainer = document.getElementById('poll-results-container');
    const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
    
    resultsContainer.innerHTML = `
        <h3>Results: ${poll.question}</h3>
        <div class="poll-results">
            ${poll.options.map(option => {
                const percentage = totalVotes > 0 ? (option.votes / totalVotes * 100).toFixed(1) : 0;
                return `
                    <div class="poll-result-item">
                        <div class="result-text">${option.text}</div>
                        <div class="result-bar-container">
                            <div class="result-bar" style="width: ${percentage}%"></div>
                        </div>
                        <div class="result-stats">${option.votes} votes (${percentage}%)</div>
                    </div>
                `;
            }).join('')}
        </div>
        <p><strong>Total votes:</strong> ${totalVotes}</p>
    `;
    
    pollContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
}