import { configureStore } from '@reduxjs/toolkit';
import bookingsReducer from './redux/bookingsSlice';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom/client';
import App from './App';

const store = configureStore({
  reducer: { bookings: bookingsReducer }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}><App /></Provider>
);
