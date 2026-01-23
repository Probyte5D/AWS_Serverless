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
    // Fallback se undefined// Concateno nuove prenotazioni con METODO PUSH// Aggiorno chiave pagina successiva con lastkey PAYLOAD
    addBookings: (state, action) => {
      const newBookings = action.payload.bookings || []; 
      state.list.push(...newBookings)
      state.lastKey = action.payload.lastKey || null;
    }

  }
});

export const { addBookings } = bookingsSlice.actions;

export const fetchBookings = (lastKey = 0) => async (dispatch) => {
  const res = await fetch('http://localhost:5000/getBookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ limit: 50, lastKey })
  });
  const result = await res.json();
  dispatch(addBookings(result));
};

export default bookingsSlice.reducer;
