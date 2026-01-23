// backend/testGetBookings.js
import { getBookings } from './getBookings.js';

async function test() {
  let lastKey = null;
  let page = 1;

  do {
    console.log(`\n--- Pagina ${page} ---`);
    const result = await getBookings({ limit: 50, lastKey });
    console.log("Prenotazioni ricevute:", result.bookings.map(b => ({
      bookingId: b.bookingId,
      guestName: b.guest?.guestName || null,
      bookingDate: b.bookingDate
    })));

    lastKey = result.lastKey;
    page++;
  } while (lastKey !== null);

  console.log("\nTest completato.");
}

test().catch(err => console.error("Errore test:", err));
