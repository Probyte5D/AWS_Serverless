const express = require('express');
const cors = require('cors');
const { getBookings } = require('./getBookings');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/getBookings', (req, res) => {
  const { limit, lastKey } = req.body;
  const result = getBookings({ limit, lastKey });
  res.json(result);
});

app.listen(5000, () => console.log('Backend listening on port 5000'));
