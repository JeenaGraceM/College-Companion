const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const yyyy = today.getFullYear();
  document.getElementById("date").textContent = `${dd}/${mm}/${yyyy}`;