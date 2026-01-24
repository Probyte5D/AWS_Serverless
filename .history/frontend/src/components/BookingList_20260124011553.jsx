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
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      await dispatch(fetchBookings(lastKey || null));
    } catch (err) {
      setError('Errore nel caricamento delle prenotazioni.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (lastKey !== null && !loading) loadBookings();
  };

  const filteredBookings = bookings.filter(b =>
    b.guest?.guestName?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="bookings-container">
      <h2>Bookings</h2>

      <input
        type="text"
        placeholder="Cerca guest..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="guest-filter-input"
      />

      {filteredBookings.map(b => (
        <BookingCard key={b.bookingId} booking={b} />
      ))}

      {loading && <p className="loading-text">Caricamento in corso...</p>}
      {error && <p className="error-text">{error}</p>}

      {lastKey !== null && !loading && (
        <button className="load-more-btn" onClick={loadMore}>
          Carica altre
        </button>
      )}
    </div>
  );
}
