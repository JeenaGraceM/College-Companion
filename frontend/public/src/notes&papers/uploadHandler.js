document.getElementById('uploadForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const programme = document.getElementById('programme').value;
      const course = document.getElementById('course').value;
      const branch = document.getElementById('branch').value;
      const semester = document.getElementById('semester').value;
      const fileType = document.getElementById('fileType').value;
      const year = document.getElementById('year').value;
      const fileInput = document.getElementById('fileInput');

      // Validate file selection
      if (!fileInput.files.length) {
        alert('❌ Please select a file.');
        return;
      }

      // Validate required fields
      if (!programme || !course || !branch || !semester) {
        alert('❌ Please fill all required fields: Programme, Course, Branch, and Semester');
        return;
      }

      // Additional validation for past papers
      if (fileType === 'Past Papers') {
        if (!year) {
          alert('❌ Please enter the year for past papers');
          document.getElementById('year').focus();
          return;
        }
        
        // Validate year format (should be a number between 2000-2100)
        const yearNum = parseInt(year);
        if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
          alert('❌ Please enter a valid year between 2000 and 2100');
          document.getElementById('year').focus();
          return;
        }
      }

      const formData = new FormData();
      formData.append('file', fileInput.files[0]);
      formData.append('programme', programme);
      formData.append('course', course);
      formData.append('branch', branch);
      formData.append('semester', semester);
      
      // Only append year for past papers
      if (fileType === 'Past Papers') {
        formData.append('year', year);
      }

      try {
        // Use the full backend URL
        const baseURL = 'http://localhost:5000';
        const endpoint = fileType === 'Notes' ? '/api/notes/upload' : '/api/past_papers/upload';
        const url = baseURL + endpoint;
        
        console.log('📤 Uploading to:', url);
        console.log('📊 FormData entries:');
        for (let [key, value] of formData.entries()) {
          console.log(`  ${key}:`, value);
        }

        // Show loading state
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = '📤 Uploading...';
        submitButton.disabled = true;

        const res = await fetch(url, { 
          method: 'POST', 
          body: formData 
        });

        console.log('📨 Response status:', res.status);
        console.log('📨 Response status text:', res.statusText);

        if (!res.ok) {
          const text = await res.text();
          console.error('❌ Server response text:', text);
          throw new Error(`Server returned ${res.status}: ${text}`);
        }

        const data = await res.json();
        console.log('📨 Parsed response data:', data);

        if (data.success) {
          alert('✅ File uploaded successfully to MongoDB Atlas');
          
          // Clear the form
          document.getElementById('uploadForm').reset();
          document.getElementById('yearField').style.display = 'none';
          
          // Refresh the tables to show new data
          await renderTables();
        } else {
          alert('❌ Upload failed: ' + (data.message || 'Unknown error'));
        }

      } catch (err) {
        console.error('❌ Upload error:', err);
        alert('❌ Upload failed: ' + err.message);
      } finally {
        // Reset button state
        const submitButton = document.querySelector('#uploadForm button[type="submit"]');
        if (submitButton) {
          submitButton.textContent = '📤 Upload';
          submitButton.disabled = false;
        }
      }
    });

    // Initialize the form when page loads
    document.addEventListener('DOMContentLoaded', function() {
      // Add event listener to file type dropdown
      document.getElementById('fileType').addEventListener('change', toggleYearField);
      
      // Initial render of tables
      renderTables();
    });