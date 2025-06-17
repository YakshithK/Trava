
type TripDetails = {
  from: string;
  to: string;
  date: Date | undefined;
  airline: string;
  flightNumber: string;
};

export const handleAddToCalendar = (tripDetails: TripDetails) => {
  const { from, to, date, airline, flightNumber } = tripDetails;
  
  if (!date) {
    console.error("Date is required for calendar event");
    return;
  }

  const startTime = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const endTime = new Date(date.getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const eventTitle = `Flight ${airline} ${flightNumber}: ${from} to ${to}`;
  const eventDetails = `Flight from ${from} to ${to} with ${airline} (Flight ${flightNumber})`;
  
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(eventDetails)}`;
  
  window.open(googleCalendarUrl, '_blank');
};
