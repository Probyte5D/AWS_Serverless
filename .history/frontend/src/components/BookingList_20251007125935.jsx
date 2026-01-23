// frontend/components/BookingList.js
// Componente React che mostra la lista delle prenotazioni nell’admin dashboard.
// Si collega al Redux store per ottenere i dati delle prenotazioni dal backend
// e supporta la paginazione “Load More” per non caricare tutte le prenotazioni in una volta.

// Import React e hook
import React, { useEffect } from 'react';
// Import Redux hook per leggere e modificare lo store
import { useSelector, useDispatch } from 'react-redux';
// Import funzione che chiama il backend e aggiorna lo store
import { fetchBookings } from '../redux/bookingsSlice';
// Import componente per mostrare i dettagli di ogni singola prenotazione
import BookingCard from './BookingCard';

export default function BookingList() {
   // useSelector legge lo stato dal Redux store
  // bookings > array delle prenotazioni arricchite con dati guest
  const bookings = useSelector(state => state.bookings.list);
  // lastKey > chiave per caricare la pagina successiva (paginazione)
  const lastKey = useSelector(state => state.bookings.lastKey);
  
  // useDispatch permette di inviare azioni al Redux store
  const dispatch = useDispatch();

  // useEffect: al montaggio del componente, carica le prime prenotazioni dal backend
  // dispatch(fetchBookings()) chiama l'API backend /getBookings e aggiorna lo store
  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  // Funzione Load More: viene chiamata cliccando il pulsante "Load More"
  // Se lastKey non è null, significa che ci sono altre pagine da caricare
  // Chiama fetchBookings passando lastKey per ottenere la pagina successiva
  const loadMore = () => {
    if (lastKey !== null) {
      dispatch(fetchBookings(lastKey));
    }
  };
// Render del componente
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
