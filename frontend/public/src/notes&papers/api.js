/**
 * Simulates saving a file to a server.
 * 
 * @param {Object} fileObj - The file object containing details like name, size, etc.
 * @returns {Promise<void>} - Resolves after simulating a short server delay.
 */
function saveFileToServer(fileObj) {
  return new Promise(resolve => {

    // Simulate a network or server processing delay (500ms)
    setTimeout(() => {

      // Log confirmation message for debugging or feedback
      console.log("✅ File saved to server:", fileObj);

      // Resolve the promise (indicates file save is complete)
      resolve();

    }, 500); // 500 milliseconds delay to mimic real server time
  });
}
