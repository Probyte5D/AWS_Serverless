import { createSlice } from '@reduxjs/toolkit';
import { getBookings } from '../../backend/getBookings'; // il backend simulato

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

// Funzione per simulare chiamata al backend
export const fetchBookings = (lastKey = 0) => async (dispatch) => {
  const result = getBookings({ limit: 50, lastKey });
  dispatch(addBookings(result));
};

export default bookingsSlice.reducer;
