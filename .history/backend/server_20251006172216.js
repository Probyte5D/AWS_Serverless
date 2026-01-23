// backend/server.js
import express from 'express';
import cors from 'cors';
import { getBookings } from './getBookings.js';

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
