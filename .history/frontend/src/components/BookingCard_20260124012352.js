import React from 'react';
import { format, isWithinInterval, addDays, subDays } from 'date-fns';

export default function BookingCard({ booking }) {
  const bookingDate = new Date(booking.bookingDate);
  const now = new Date();
  const isUpcoming = isWithinInterval(bookingDate, {
    start: subDays(now, 0),
    end: addDays(now, 7)
  });

  return (
    <div className={`booking-card ${isUpcoming ? 'highlight' : ''}`}>
      <div className="booking-date">
        {booking.bookingDate ? format(bookingDate, 'dd/MM/yyyy') : '-'}
      </div>
      <div className="booking-guest">
        {booking.guest?.guestName || booking.guestName || 'Guest sconosciuto'}
      </div>
      <div className="booking-email">
        {booking.guest?.email || '-'}
      </div>
    </div>
  );
}
//blu/azzurre (highlight) sono solo le prenotazioni nei prossimi 7 giorni.