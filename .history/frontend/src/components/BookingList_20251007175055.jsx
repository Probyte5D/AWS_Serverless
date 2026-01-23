// frontend/components/BookingList.js
// Componente React per visualizzare la lista delle prenotazioni paginata
// Utilizza Redux per gestire lo stato delle prenotazioni e supporta caricamento "Load More"
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBookings } from '../redux/bookingsSlice';
import BookingCard from './BookingCard';

export default function BookingList() {
  // Redux state // lista delle prenotazioni // chiave per la pagina successiva// serve per chiamare le actions Redux
  const bookings = useSelector(state => state.bookings.list);
  const lastKey = useSelector(state => state.bookings.lastKey);
  const dispatch = useDispatch();
// Local state// stato caricamento// stato errore
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carica le prime prenotazioni al montaggio del componente
  useEffect(() => {
    loadBookings();
  }, []);

  // Funzione per caricare prenotazioni dal backend// mostra loader// reset errore
  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
       // chiama l'action Redux fetchBookings
      // passa lastKey per paginazione backend
      await dispatch(fetchBookings(lastKey || 0));
    } catch (err) {
      setError('Errore nel caricamento delle prenotazioni.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
// Funzione per caricare la pagina successiva
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
