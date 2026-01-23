// frontend/components/BookingList.js
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBookings } from '../redux/bookingsSlice';

export default function BookingList() {
  const bookings = useSelector(state => state.bookings.list);
  const lastKey = useSelector(state => state.bookings.lastKey);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  const loadMore = () => {
    if (lastKey !== null) {
      dispatch(fetchBookings(lastKey));
    }
  };

  return (
    <div>
      <h2>Bookings</h2>
      <ul>
        {bookings.map(b => (
          <li key={b.bookingId}>
            {b.bookingDate} - {b.guest?.guestName || b.guestName}
          </li>
        ))}
      </ul>
      {lastKey !== null && (
        <button onClick={loadMore}>Load More</button>
      )}
    </div>
  );
}
