// frontend/index.js
// Punto di ingresso React e configurazione dello store Redux.
import { configureStore } from '@reduxjs/toolkit';
// Slice per le prenotazioni
import bookingsReducer from './redux/bookingsSlice';
// Permette ai componenti di accedere allo store
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom/client';
import App from './App';
// Creazione dello store Redux
const store = configureStore({
  reducer: { bookings: bookingsReducer }
});
// Render dell'app dentro l'elemento root
ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}><App /></Provider>
);
