// frontend/App.js
import React from 'react';
import BookingList from './components/BookingList';
import './app.css';


export default function App() {
  return (
    <div className="app-container">
      <h1>Admin Dashboard</h1>
      <BookingList />
    </div>
  );
}
