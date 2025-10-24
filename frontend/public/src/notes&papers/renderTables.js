async function renderTables() {
      console.log('🔄 Starting to render tables...');
      
      try {
        const baseURL = 'http://localhost:5000';
        
        // Get table bodies
        const notesBody = document.querySelector("#notesTable tbody");
        const papersBody = document.querySelector("#papersTable tbody");

        // Clear existing rows
        notesBody.innerHTML = "";
        papersBody.innerHTML = "";

        let notesData = [];
        let papersData = [];

        // Fetch notes
        try {
          const notesResponse = await fetch(`${baseURL}/api/notes/`);
          if (notesResponse.ok) {
            notesData = await notesResponse.json();
            console.log(`✅ Loaded ${notesData.length} notes`);
          }
        } catch (notesError) {
          console.error('❌ Error fetching notes:', notesError);
          notesData = [];
        }

        // Fetch past papers
        try {
          const papersResponse = await fetch(`${baseURL}/api/past_papers/`);
          if (papersResponse.ok) {
            papersData = await papersResponse.json();
            console.log(`✅ Loaded ${papersData.length} past papers`);
          }
        } catch (papersError) {
          console.error('❌ Error fetching past papers:', papersError);
          papersData = [];
        }

        // Render notes with clickable filenames
        if (notesData.length > 0) {
          notesData.forEach(note => {
            const row = document.createElement("tr");
            row.innerHTML = `
              <td>${note.programme}</td>
              <td>${note.course}</td>
              <td>${note.branch}</td>
              <td>${note.semester}</td>
              <td>
                <a href="${baseURL}/api/notes/download/${note.fileName}" 
                   class="file-link" 
                   title="Click to download"
                   data-filename="${note.fileName}">
                  ${note.originalName || note.fileName}
                </a>
                <div class="file-actions">
                  <button class="view-btn" onclick="viewFile('notes', '${note.fileName}')">👁️ View</button>
                  <button class="download-btn" onclick="downloadFile('notes', '${note.fileName}', '${note.originalName || note.fileName}')">📥 Download</button>
                </div>
              </td>
            `;
            notesBody.appendChild(row);
          });
        } else {
          notesBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #666;">No notes uploaded yet</td></tr>';
        }

        // Render past papers with clickable filenames
        if (papersData.length > 0) {
          papersData.forEach(paper => {
            const row = document.createElement("tr");
            row.innerHTML = `
              <td>${paper.programme}</td>
              <td>${paper.course}</td>
              <td>${paper.branch}</td>
              <td>${paper.semester}</td>
              <td>${paper.year}</td>
              <td>
                <a href="${baseURL}/api/past_papers/download/${paper.fileName}" 
                   class="file-link" 
                   title="Click to download"
                   data-filename="${paper.fileName}">
                  ${paper.originalName || paper.fileName}
                </a>
                <div class="file-actions">
                  <button class="view-btn" onclick="viewFile('past_papers', '${paper.fileName}')">👁️ View</button>
                  <button class="download-btn" onclick="downloadFile('past_papers', '${paper.fileName}', '${paper.originalName || paper.fileName}')">📥 Download</button>
                </div>
              </td>
            `;
            papersBody.appendChild(row);
          });
        } else {
          papersBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #666;">No past papers uploaded yet</td></tr>';
        }

        console.log('✅ Tables rendered successfully');

      } catch (error) {
        console.error('❌ Unexpected error in renderTables:', error);
      }
    }

    // Download file function
    function downloadFile(type, filename, originalName) {
      const baseURL = 'http://localhost:5000';
      const url = `${baseURL}/api/${type}/download/${filename}`;
      
      // Create a temporary anchor tag to trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`📥 Downloading ${type}: ${filename}`);
    }

    // View file function
    function viewFile(type, filename) {
      const baseURL = 'http://localhost:5000';
      const url = `${baseURL}/api/${type}/view/${filename}`;
      
      // Open in new tab for viewing
      window.open(url, '_blank');
      
      console.log(`👁️ Viewing ${type}: ${filename}`);
    }