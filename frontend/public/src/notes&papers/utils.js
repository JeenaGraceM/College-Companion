function toggleYearField() {
      const fileType = document.getElementById("fileType").value;
      const yearField = document.getElementById("yearField");
      const yearInput = document.getElementById("year");

      if (fileType === "Past Papers") {
        yearField.style.display = "block";
        yearInput.required = true;
      } else {
        yearField.style.display = "none";
        yearInput.required = false;
        yearInput.value = ""; // Clear the value when switching to Notes
      }
    }