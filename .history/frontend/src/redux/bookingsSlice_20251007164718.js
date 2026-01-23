import { createSlice } from '@reduxjs/toolkit';

const API_URL = 'https://57mn62c8y1.execute-api.eu-north-1.amazonaws.com/getBookings';

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

// 💥 Forza un errore 413 (payload da 10 MB)
export const fetchBookings = (lastKey) => async (dispatch) => {
  try {
    // Genera stringa da 10 MB
    const hugeString = "x".repeat(10 * 1024 * 1024); // 10 MB di dati

    const bodyPayload = {
      limit: 10000,
      lastKey: lastKey || undefined,
      filler: hugeString
    };

    console.log("🚀 Inviando payload da ~10MB per testare errore 413...");

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload)
    });

    console.log("✅ Status:", res.status, res.statusText);

    if (res.status === 413) {
      console.error("💥 API Gateway ha rifiutato la richiesta (413 Payload Too Large)");
      return;
    }

    if (!res.ok) {
      throw new Error(`Errore API: ${res.status} ${res.statusText}`);
    }

    const result = await res.json();
    dispatch(addBookings(result));

  } catch (err) {
    console.error('💥 Errore fetchBookings (probabile crash 413):', err);
  }
};

export default bookingsSlice.reducer;
