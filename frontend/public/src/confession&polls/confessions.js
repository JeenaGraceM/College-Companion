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