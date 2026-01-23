// frontend/components/BookingCard.js
import React from 'react';

export default function BookingCard({ booking }) {
  return (
    <div className="booking-card">
      <div className="booking-date">
        {new Date(booking.bookingDate).toLocaleDateString()}
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
