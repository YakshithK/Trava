import { calendar_v3, google } from 'googleapis';
import { getAirportAddressByIATA } from '../utils/getAirportsByIATA';

interface TripDetails {
  from: string;
  to: string;
  date: Date;
  flightNumber?: string;
  notes?: string;
}

export const handleAddToCalendar = async (tripDetails: TripDetails) => {
  try {
    // Format date for all-day event (YYYYMMDD)
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}${month}${day}`;
    };

    const address = await getAirportAddressByIATA(tripDetails.from);

    // Create event details
    const event = {
      summary: `Flight from ${tripDetails.from} to ${tripDetails.to}`,
      description: `${tripDetails.flightNumber ?  "Flight Number: " + tripDetails.flightNumber : ''}\n${tripDetails.notes ?  "Notes: " + tripDetails.notes : ''}`,
      start: formatDate(tripDetails.date),
      end: formatDate(tripDetails.date), // Same day for all-day event
    };

    // Create the Google Calendar event URL
    const calendarUrl = new URL('https://calendar.google.com/calendar/render');
    calendarUrl.searchParams.append('action', 'TEMPLATE');
    calendarUrl.searchParams.append('text', event.summary);
    calendarUrl.searchParams.append('details', event.description);
    calendarUrl.searchParams.append('dates', `${event.start}/${event.end}`);

    if (address) {
      calendarUrl.searchParams.append("location", address)
    }
    
    // Open the calendar URL in a new window
    window.open(calendarUrl.toString(), '_blank');

    return { success: true };
  } catch (error) {
    console.error('Error adding to Google Calendar:', error);
    throw error;
  }
};