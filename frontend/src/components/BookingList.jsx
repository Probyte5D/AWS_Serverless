// frontend/components/BookingList.js
// Componente React per visualizzare la lista delle prenotazioni paginata
// Utilizzo Redux per gestire lo stato delle prenotazioni e supporta caricamento "Load More"
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBookings } from '../redux/bookingsSlice';
import BookingCard from './BookingCard';

export default function BookingList() {
  // =======================
  // Stato globale Redux
  // =======================
  // 'bookings' contiene la lista delle prenotazioni attuali
  const bookings = useSelector(state => state.bookings.list);
  // 'lastKey' è la chiave per la paginazione: indica se ci sono altre pagine da caricare
  const lastKey = useSelector(state => state.bookings.lastKey);
  // 'dispatch' serve per chiamare le azioni Redux, qui fetchBookings
  const dispatch = useDispatch();

  // =======================
  // Stato locale componente
  // =======================
  // 'loading' indica se i dati sono in caricamento
  const [loading, setLoading] = useState(false);
  // 'error' contiene eventuale messaggio di errore
  const [error, setError] = useState(null);

  // =======================
  // useEffect: caricamento iniziale
  // =======================
  // Al montaggio del componente, carico la prima pagina di prenotazioni
  useEffect(() => {
    loadBookings();
  }, []);

  // =======================
  // Funzione loadBookings
  // =======================
  // Carico prenotazioni dal backend
  // Gestisce loader e reset errore
  const loadBookings = async () => {
    setLoading(true);  
    setError(null);     
    try {
      // Chiama Redux action fetchBookings passando la lastKey per paginazione
      await dispatch(fetchBookings(lastKey || 0));
    } catch (err) {
      // Se c'è un errore, salva messaggio nello stato locale
      setError('Errore nel caricamento delle prenotazioni.');
      console.error(err);
    } finally {
      // Nasconde loader indipendentemente dall'esito
      setLoading(false);
    }
  };

  // =======================
  // Funzione loadMore
  // =======================
  // Richiama loadBookings solo se esiste una pagina successiva
  const loadMore = () => {
    if (lastKey !== null) {
      loadBookings();
    }
  };

  // =======================
  // Render componente
  // =======================
  return (
    <div className="bookings-container">
      <h2>Bookings</h2>

      {/* Mappa tutte le prenotazioni e le mostra con BookingCard */}
      {bookings.map(b => (
        <BookingCard key={b.bookingId} booking={b} />
      ))}

      {/* Messaggio di caricamento */}
      {loading && <p>Caricamento in corso...</p>}

      {/* Messaggio di errore */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Pulsante Load More, visibile solo se ci sono altre pagine e non è in caricamento */}
      {lastKey !== null && !loading && (
        <button className="load-more-btn" onClick={loadMore}>
          Load More
        </button>
      )}
    </div>
  );
}
