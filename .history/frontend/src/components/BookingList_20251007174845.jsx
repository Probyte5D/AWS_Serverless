// frontend/components/BookingList.js
// Componente React per visualizzare la lista delle prenotazioni paginata
// Utilizza Redux per gestire lo stato delle prenotazioni e supporta caricamento "Load More"
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBookings } from '../redux/bookingsSlice';
import BookingCard from './BookingCard';

export default function BookingList() {
  const bookings = useSelector(state => state.bookings.list);
  const lastKey = useSelector(state => state.bookings.lastKey);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carica le prime prenotazioni al montaggio del componente
  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      await dispatch(fetchBookings(lastKey || 0));
    } catch (err) {
      setError('Errore nel caricamento delle prenotazioni.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (lastKey !== null) {
      loadBookings();
    }
  };

  return (
    <div className="bookings-container">
      <h2>Bookings</h2>

      {bookings.map(b => (
        <BookingCard key={b.bookingId} booking={b} />
      ))}

      {loading && <p>Caricamento in corso...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {lastKey !== null && !loading && (
        <button className="load-more-btn" onClick={loadMore}>
          Load More
        </button>
      )}
    </div>
  );
}
