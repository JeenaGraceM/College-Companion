document.addEventListener('DOMContentLoaded', () => {
    const lostFoundForm = document.getElementById('lost-found-form');
    const lostFoundContainer = document.getElementById('lost-found-container');
    const itemImagesInput = document.getElementById('item-images');
    const customUploadBtn = document.getElementById('custom-upload-btn');
    const imagePreviewContainer = document.getElementById('image-preview-container');

    // Image upload handling
    if (customUploadBtn) {
        customUploadBtn.addEventListener('click', () => {
            itemImagesInput.click();
        });
    }

    if (itemImagesInput) {
        itemImagesInput.addEventListener('change', (event) => {
            imagePreviewContainer.innerHTML = '';
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

    // FORM SUBMISSION
    if (lostFoundForm) {
        lostFoundForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            // Get form data
            const formData = {
                itemType: document.getElementById('item-type').value,
                itemName: document.getElementById('item-name').value,
                description: document.getElementById('description').value,
                contactInfo: document.getElementById('contact-info').value,
                imageUrls: [] // For now, we'll handle images later
            };

            console.log('Sending to server:', formData);

            try {
                const response = await fetch('http://localhost:5000/api/lostfound', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    const result = await response.json();
                    alert('Item submitted successfully!');
                    lostFoundForm.reset();
                    imagePreviewContainer.innerHTML = '';
                    loadLostFoundItems(); // Refresh the list
                } else {
                    const error = await response.json();
                    alert('Error: ' + error.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to submit item. Please check if the server is running.');
            }
        });
    }

    // Function to load and display lost & found items
    async function loadLostFoundItems() {
        try {
            const response = await fetch('http://localhost:5000/api/lostfound');
            if (response.ok) {
                const items = await response.json();
                displayLostFoundItems(items);
            } else {
                lostFoundContainer.innerHTML = '<p>Failed to load items. Please try again later.</p>';
            }
        } catch (error) {
            console.error('Error loading items:', error);
            lostFoundContainer.innerHTML = '<p>Error loading items. Make sure the server is running.</p>';
        }
    }

    // Function to display items
    function displayLostFoundItems(items) {
        if (!lostFoundContainer) return;
        
        if (items.length === 0) {
            lostFoundContainer.innerHTML = '<p>No items found. Be the first to post!</p>';
            return;
        }
        
        lostFoundContainer.innerHTML = '';
        
        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'lost-found-item';
            itemElement.innerHTML = `
                <h3>${item.itemType}: ${item.itemName}</h3>
                <p><strong>Description:</strong> ${item.description}</p>
                <p><strong>Contact:</strong> ${item.contactInfo}</p>
                <p><strong>Status:</strong> ${item.status}</p>
                <small>Posted: ${new Date(item.createdAt).toLocaleDateString()}</small>
            `;
            lostFoundContainer.appendChild(itemElement);
        });
    }

    // Load items when page loads
    loadLostFoundItems();
});