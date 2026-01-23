// frontend/redux/bookingsSlice.js
// Slice Redux per gestire lo stato delle prenotazioni (bookings) nell’admin dashboard.

import { createSlice } from '@reduxjs/toolkit';

// URL completo della tua API Gateway Lambda
const API_URL = 'https://57mn62c8y1.execute-api.eu-north-1.amazonaws.com/getBookings';

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: { list: [], lastKey: null },
  reducers: {
    // Aggiunge prenotazioni ricevute dal backend
    addBookings: (state, action) => {
      const newBookings = action.payload.bookings || [];
      state.list.push(...newBookings);
      state.lastKey = action.payload.lastKey ?? null;
    }
  }
});

export const { addBookings } = bookingsSlice.actions;

// Thunk asincrono per chiamare la Lambda e aggiornare lo store
export const fetchBookings = (lastKey = null) => async (dispatch) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit: 50, lastKey })
    });

    if (!res.ok) {
      throw new Error(`Errore API: ${res.status} ${res.statusText}`);
    }

    const result = await res.json();
    dispatch(addBookings(result));

  } catch (err) {
    console.error('Errore fetchBookings:', err);
  }
};

// Export del reducer per essere incluso nello store principale
export default bookingsSlice.reducer;
