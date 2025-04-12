import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  // Bowler state
  const [bowlers, setBowlers] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [scores, setScores] = useState([]);

  // New bowler form
  const [name, setName] = useState('');
  const [division, setDivision] = useState('');

  // New round form
  const [roundName, setRoundName] = useState('');
  const [games, setGames] = useState(6);
  const [roundType, setRoundType] = useState('Qualifying');
  const [bonus, setBonus] = useState('');

  // Score entry form
  const [selectedRound, setSelectedRound] = useState('');
  const [selectedBowler, setSelectedBowler] = useState('');
  const [gameScores, setGameScores] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/bowlers`).then((res) => res.json()).then(setBowlers);
    fetch(`${API_URL}/rounds`).then((res) => res.json()).then(setRounds);
    fetch(`${API_URL}/scores`).then((res) => res.json()).then(setScores);
  }, []);

  const handleAddBowler = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/bowlers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, division }),
    });
    const newB = await res.json();
    setBowlers([...bowlers, newB]);
    setName('');
    setDivision('');
  };

  const handleAddRound = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/rounds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: roundName, games, type: roundType, bonus }),
    });
    const newR = await res.json();
    setRounds([...rounds, newR]);
    setRoundName('');
    setGames(6);
    setRoundType('Qualifying');
    setBonus('');
  };

  const handleScoreChange = (index, value) => {
    const newScores = [...gameScores];
    newScores[index] = value;
    setGameScores(newScores);
  };

  const handleSubmitScore = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bowlerId: parseInt(selectedBowler),
        roundId: parseInt(selectedRound),
        scores: gameScores.map((g) => parseInt(g)),
      }),
    });
    const newScore = await res.json();
    setScores([...scores, newScore]);
    setSelectedBowler('');
    setSelectedRound('');
    setGameScores([]);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Tournament System</h1>

      <h2>Add Bowler</h2>
      <form onSubmit={handleAddBowler}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <input value={division} onChange={(e) => setDivision(e.target.value)} placeholder="Division" />
        <button type="submit">Add Bowler</button>
      </form>

      <h2>Create Round</h2>
      <form onSubmit={handleAddRound}>
        <input value={roundName} onChange={(e) => setRoundName(e.target.value)} placeholder="Round Name" />
        <select value={games} onChange={(e) => setGames(parseInt(e.target.value))}>
          {[3,4,5,6,7,8].map((g) => <option key={g} value={g}>{g} Games</option>)}
        </select>
        <select value={roundType} onChange={(e) => setRoundType(e.target.value)}>
          <option value="Qualifying">Qualifying</option>
          <option value="Matchplay">Matchplay</option>
        </select>
        <input value={bonus} onChange={(e) => setBonus(e.target.value)} placeholder="Bonus Logic (optional)" />
        <button type="submit">Add Round</button>
      </form>

      <h2>Enter Scores</h2>
      <form onSubmit={handleSubmitScore}>
        <select value={selectedRound} onChange={(e) => {
          const roundId = e.target.value;
          setSelectedRound(roundId);
          const round = rounds.find(r => r.id === parseInt(roundId));
          if (round) {
            setGameScores(Array(round.games).fill(''));
          }
        }}>
          <option value="">Select Round</option>
          {rounds.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>

        <select value={selectedBowler} onChange={(e) => setSelectedBowler(e.target.value)}>
          <option value="">Select Bowler</option>
          {bowlers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>

        {gameScores.map((score, idx) => (
          <input
            key={idx}
            value={score}
            type="number"
            placeholder={`G${idx + 1}`}
            onChange={(e) => handleScoreChange(idx, e.target.value)}
            style={{ width: '60px', marginRight: '0.5rem' }}
          />
        ))}

        <button type="submit">Submit Score</button>
      </form>

      <h3>All Scores</h3>
      <ul>
        {scores.map((s) => {
          const bowler = bowlers.find(b => b.id === s.bowlerId);
          const round = rounds.find(r => r.id === s.roundId);
          return (
            <li key={s.id}>
              {bowler?.name} – {round?.name}: {s.scores.join(', ')}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default App;
