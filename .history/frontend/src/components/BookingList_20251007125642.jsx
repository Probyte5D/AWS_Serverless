// frontend/components/BookingList.js
// Componente React che mostra la lista delle prenotazioni nell’admin dashboard.
// Si collega al Redux store per ottenere i dati delle prenotazioni dal backend
// e supporta la paginazione “Load More” per non caricare tutte le prenotazioni in una volta.

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBookings } from '../redux/bookingsSlice';
import BookingCard from './BookingCard';

export default function BookingList() {
  const bookings = useSelector(state => state.bookings.list);
  const lastKey = useSelector(state => state.bookings.lastKey);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  const loadMore = () => {
    if (lastKey !== null) {
      dispatch(fetchBookings(lastKey));
    }
  };

  return (
    <div className="bookings-container">
      <h2>Bookings</h2>
      {bookings.map(b => (
        <BookingCard key={b.bookingId} booking={b} />
      ))}
      {lastKey !== null && (
        <button className="load-more-btn" onClick={loadMore}>
          Load More
        </button>
      )}
    </div>
  );
}
