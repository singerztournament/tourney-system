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
// DELETE a bowler by ID
app.delete('/bowlers/:id', (req, res) => {
  const id = parseInt(req.params.id);
  bowlers = bowlers.filter((b) => b.id !== id);
  res.status(204).end();
});

// UPDATE a bowler by ID
app.put('/bowlers/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, division } = req.body;
  const index = bowlers.findIndex((b) => b.id === id);

  if (index === -1) return res.status(404).json({ error: 'Bowler not found' });

  if (name) bowlers[index].name = name;
  if (division) bowlers[index].division = division;

  res.json(bowlers[index]);
});
