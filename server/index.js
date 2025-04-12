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
let rounds = [];

app.post('/rounds', (req, res) => {
  const { name, games, type, bonus } = req.body;
  if (!name || !games || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newRound = {
    id: Date.now(),
    name,
    games,
    type,
    bonus: bonus || null,
  };
  rounds.push(newRound);
  res.status(201).json(newRound);
});

app.get('/rounds', (req, res) => {
  res.json(rounds);
});
let scores = [];

app.post('/scores', (req, res) => {
  const { bowlerId, roundId, scores: gameScores } = req.body;

  if (!bowlerId || !roundId || !Array.isArray(gameScores)) {
    return res.status(400).json({ error: 'Missing required score data' });
  }

  const newScore = {
    id: Date.now(),
    bowlerId,
    roundId,
    scores: gameScores.map(Number), // ensure numbers
  };

  scores.push(newScore);
  res.status(201).json(newScore);
});

app.get('/scores', (req, res) => {
  res.json(scores);
});
app.get('/standings', (req, res) => {
  const bowlerTotals = {};

  scores.forEach((scoreEntry) => {
    const { bowlerId, scores: gameScores } = scoreEntry;
    const total = gameScores.reduce((sum, s) => sum + Number(s), 0);
    if (!bowlerTotals[bowlerId]) {
      bowlerTotals[bowlerId] = 0;
    }
    bowlerTotals[bowlerId] += total;
  });

  const results = Object.entries(bowlerTotals).map(([bowlerId, total]) => ({
    bowlerId: Number(bowlerId),
    total,
  }));

  // Sort highest to lowest
  results.sort((a, b) => b.total - a.total);

  res.json(results);
});
