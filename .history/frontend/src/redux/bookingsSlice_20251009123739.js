// frontend/redux/bookingsSlice.js
import { createSlice } from '@reduxjs/toolkit';

// URL completo della tua API Gateway Lambda
const API_URL = import.meta.env.VITE_API_URL;


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

// Thunk asincrono
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
