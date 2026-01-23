// backend/server.js
// Server Express per gestire le richieste del frontend al backend.
// Espone l’endpoint /getBookings per ottenere prenotazioni paginabili e arricchite con dati ospite.
import express from 'express';
import cors from 'cors';
import { getBookings } from './getBookings.js';
// Middleware:
// cors() >permette al frontend (anche su domini diversi) di fare richieste al backend
const app = express();
app.use(cors());
app.use(express.json());

app.post('/getBookings', async (req, res) => {
  const { limit, lastKey } = req.body;

  try {
    const result = await getBookings({ limit, lastKey });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Errore server", error: err.message });
  }
});

app.listen(5000, () => console.log('Backend listening on port 5000'));
