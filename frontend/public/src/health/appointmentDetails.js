function generateCalendarEvents() {
  const events = [];
  const totalSlots = 10; // update if your slots per day change

  // Add booked days
  Object.keys(savedAppointments).forEach(date => {
    const bookedCount = savedAppointments[date].tasks.length;

    if (bookedCount >= totalSlots) {
      // All slots booked → mark fully booked in red
      events.push({
        title: `Fully Booked (${bookedCount})`,
        start: date,
        color: 'red'
      });
    } else {
      // Partially booked → mark normally
      events.push({
        title: `Booked (${bookedCount})`,
        start: date,
        color: 'orange'
      });
    }
  });

  // Add leave days
  leaveDates.forEach(date => {
    const isBooked = !!savedAppointments[date];
    events.push({
      title: isBooked
        ? `Leave & Booked (${savedAppointments[date].tasks.length})`
        : 'Doctor on Leave',
      start: date,
      color: 'gray'
    });
  });

  return events;
}
