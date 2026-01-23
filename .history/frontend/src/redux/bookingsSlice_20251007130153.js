// frontend/redux/bookingsSlice.js
// Slice Redux ( libreria) per gestire lo stato delle prenotazioni (bookings) nell’admin dashboard.
// Serve a centralizzare le prenotazioni, la paginazione e l’aggiornamento dati dal backend.

import { createSlice } from '@reduxjs/toolkit';
// Slice principale
const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: { list: [], lastKey: 0 },
  reducers: {
    // Funzione che aggiunge prenotazioni ricevute dal backend
    addBookings: (state, action) => {
      const newBookings = action.payload.bookings || []; // fallback se undefined
      state.list.push(...newBookings);
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
