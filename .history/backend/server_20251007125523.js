// backend/server.js
// Server Express per gestire le richieste del frontend al backend.
// Espone l’endpoint /getBookings per ottenere prenotazioni paginabili e arricchite con dati ospite.
import express from 'express';
import cors from 'cors';
import { getBookings } from './getBookings.js';
const app = express();
// Middleware:
// cors() >permette al frontend (anche su domini diversi) di fare richieste al backend

app.use(cors());
// express.json() >permette di leggere il body delle richieste in formato JSON
app.use(express.json());

// Endpoint POST /getBookings
// Il frontend invia { limit, lastKey } per la paginazione
app.post('/getBookings', async (req, res) => {
  const { limit, lastKey } = req.body;

  try {
     // Chiama la funzione getBookings definita in getBookings.js
    // Restituisce prenotazioni filtrate e arricchite con dati ospite
    const result = await getBookings({ limit, lastKey });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Errore server", error: err.message });
  }
});

app.listen(5000, () => console.log('Backend listening on port 5000'));
