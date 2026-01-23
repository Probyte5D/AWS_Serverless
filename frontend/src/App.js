// frontend/App.js
// Componente principale dell'applicazione React.
// Serve da contenitore della dashboard e include la lista delle prenotazioni.
import React from 'react';
import BookingList from './components/BookingList';
import './App.css';

// booking list Componente che renderizza tutte le prenotazioni
export default function App() {
  return (
    <div className="app-container">
      <h1>Admin Dashboard</h1>
      <BookingList />
    </div>
  );
}
