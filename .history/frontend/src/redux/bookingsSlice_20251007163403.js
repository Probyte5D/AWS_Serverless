// frontend/redux/bookingsSlice.js
import { createSlice } from '@reduxjs/toolkit';

// URL completo della tua API Gateway Lambda
const API_URL = 'https://57mn62c8y1.execute-api.eu-north-1.amazonaws.com/getBookings';

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: { list: [], lastKey: undefined }, // meglio undefined inizialmente
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
    // Se lastKey è 0 o null, invialo come undefined
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
