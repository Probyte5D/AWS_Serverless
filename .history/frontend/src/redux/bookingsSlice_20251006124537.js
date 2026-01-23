import { createSlice } from '@reduxjs/toolkit';

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: { list: [], lastKey: 0 },
  reducers: {
    addBookings: (state, action) => {
      state.list.push(...action.payload.bookings);
      state.lastKey = action.payload.lastKey;
    }
  }
});

export const { addBookings } = bookingsSlice.actions;

// Chiamata al backend separato
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
