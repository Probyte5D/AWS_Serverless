// frontend/redux/bookingsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const API_URL = process.env.REACT_APP_API_URL;

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: { list: [], lastKey: undefined }, 
  reducers: {
    addBookings: (state, action) => {
      const newBookings = action.payload.bookings || [];
      state.list.push(...newBookings);
      state.lastKey = action.payload.lastKey || null;
    }
  }
});

export const { addBookings } = bookingsSlice.actions;

// Thunk asincrono per fetch delle prenotazioni
export const fetchBookings = (lastKey) => async (dispatch) => {
  try {
    const bodyPayload = {
      limit: 50,
      lastKey: lastKey || undefined
    };

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload)
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

export default bookingsSlice.reducer;
