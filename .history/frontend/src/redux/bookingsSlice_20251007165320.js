import { createSlice } from '@reduxjs/toolkit';

// URL completo della tua API Gateway Lambda
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

// 🔥 TEST: invia un payload molto grande per provocare 413
export const fetchBookings = (lastKey) => async (dispatch) => {
  try {
    // Crea un corpo con 1 MB di dati casuali
    const hugeString = "x".repeat(1024 * 1024); // 1 MB di "x"
    
    const bodyPayload = {
      limit: 5000,           // esageratamente alto
      lastKey: lastKey || undefined,
      filler: hugeString     // campo enorme per superare il limite API Gateway
    };

    console.log("🚀 Inviando payload grande (~1MB) per testare limite API Gateway...");

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload)
    });

    console.log("✅ Status:", res.status, res.statusText);

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
