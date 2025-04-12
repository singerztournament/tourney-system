const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Simple ping route to test
app.get('/', (req, res) => {
  res.send('Tournament API running');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
let bowlers = [];

app.post('/bowlers', (req, res) => {
  const { name, division } = req.body;
  if (!name || !division) {
    return res.status(400).json({ error: 'Missing name or division' });
  }

  const newBowler = { id: Date.now(), name, division };
  bowlers.push(newBowler);
  res.status(201).json(newBowler);
});

app.get('/bowlers', (req, res) => {
  res.json(bowlers);
});
