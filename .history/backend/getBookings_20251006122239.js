// backend/getBookings.js

// Simulazione tabella DynamoDB
const BOOKINGS = Array.from({ length: 200 }, (_, i) => ({
  bookingId: `B${i + 1}`,
  guestId: `G${i + 1}`,
  guestName: `Guest ${i + 1}`,
  bookingDate: `2025-10-${String((i % 30) + 1).padStart(2,"0")}`
}));

function getBookings({ limit = 50, lastKey = 0 }) {
  const start = lastKey;
  const end = start + limit;
  const slice = BOOKINGS.slice(start, end);
  const nextKey = end < BOOKINGS.length ? end : null;

  return {
    bookings: slice,
    lastKey: nextKey
  };
}

// Export come se fosse Lambda
module.exports = { getBookings };
