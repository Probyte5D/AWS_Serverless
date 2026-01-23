// frontend/redux/bookingsSlice.js
// Slice Redux ( libreria) per gestire lo stato delle prenotazioni (bookings) nell’admin dashboard.
// Serve a centralizzare le prenotazioni, la paginazione e l’aggiornamento dati dal backend.

import { createSlice } from '@reduxjs/toolkit';
// Slice principale  // Nome dello slice //list è l'Array di prenotazioni già arricchite con dati guest mentre Last key Chiave per paginazione (0 = prima pagina)
const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: { list: [], lastKey: 0 },
  reducers: {

       // Funzione che aggiunge prenotazioni ricevute dal backend
    // - Se action.payload.bookings è undefined, usa un array vuoto /Fallback
    // - Concateno le nuove prenotazioni con quelle già presenti usando PUSH
    // - lastkey PAYLOADAggiorna lastKey con la chiave della prossima pagina, se disponibile

    addBookings: (state, action) => {
      const newBookings = action.payload.bookings || []; 
      state.list.push(...newBookings)
      state.lastKey = action.payload.lastKey || null;
    }

  }
});
// Export dell’azione addBookings FUNZ PRECEDENT per essere usata nei componenti o thunk
export const { addBookings } = bookingsSlice.actions;
// Thunk asincrono per chiamare il backend e aggiornare lo store + POST a /getBookings con limit e lastKey per gestire paginazione

//FETCHBBOKINGS chiamata / diapatch result > redux che agigorna lo stato .In Redux, un thunk è una funzione che può fare cose extra prima di cambiare lo stato.Normalmente un reducer prende lo stato e un’azione e restituisce un nuovo stato sincronamente. Un thunk, invece, ti permette di fare operazioni asincrone (es. chiamate al backend) prima di aggiornare lo stato.


export const fetchBookings = (lastKey = 0) => async (dispatch) => {
  const res = await fetch('http://localhost:5000/getBookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ limit: 50, lastKey })
  });
  const result = await res.json();
  dispatch(addBookings(result));
};

// Export del reducer per essere incluso nello store principale
export default bookingsSlice.reducer;
