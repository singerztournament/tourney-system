import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  // Bowler states
  const [name, setName] = useState('');
  const [division, setDivision] = useState('');
  const [bowlers, setBowlers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDivision, setEditDivision] = useState('');

  // Round states
  const [rounds, setRounds] = useState([]);
  const [roundName, setRoundName] = useState('');
  const [games, setGames] = useState(6);
  const [roundType, setRoundType] = useState('Qualifying');
  const [bonus, setBonus] = useState('');

  // Score entry
  const [selectedRoundId, setSelectedRoundId] = useState('');
  const [selectedBowlerId, setSelectedBowlerId] = useState('');
  const [gameScores, setGameScores] = useState([]);
  const [scoreList, setScoreList] = useState([]);

  // Standings
  const [standings, setStandings] = useState([]);

  const fetchBowlers = async () => {
    const res = await fetch(`${API_URL}/bowlers`);
    const data = await res.json();
    setBowlers(data);
  };

  const fetchRounds = async () => {
    const res = await fetch(`${API_URL}/rounds`);
    const data = await res.json();
    setRounds(data);
  };

  const fetchScores = async () => {
    const res = await fetch(`${API_URL}/scores`);
    const data = await res.json();
    setScoreList(data);
  };

  const fetchStandings = async () => {
    const res = await fetch(`${API_URL}/standings`);
    const data = await res.json();
    setStandings(data);
  };

  useEffect(() => {
    fetchBowlers();
    fetchRounds();
    fetchScores();
    fetchStandings();
  }, []);

  const handleAddBowler = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/bowlers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, division }),
    });
    const newBowler = await res.json();
    setBowlers((prev) => [...prev, newBowler]);
    setName('');
    setDivision('');
  };

  const handleDelete = async (id) => {
    await fetch(`${API_URL}/bowlers/${id}`, { method: 'DELETE' });
    setBowlers((prev) => prev.filter((b) => b.id !== id));
  };

  const handleEdit = (b) => {
    setEditingId(b.id);
    setEditName(b.name);
    setEditDivision(b.division);
  };

  const handleSaveEdit = async (id) => {
    const res = await fetch(`${API_URL}/bowlers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, division: editDivision }),
    });
    const updated = await res.json();
    setBowlers((prev) => prev.map((b) => (b.id === id ? updated : b)));
    setEditingId(null);
  };

  const handleAddRound = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/rounds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: roundName,
        games: parseInt(games),
        type: roundType,
        bonus: bonus || null,
      }),
    });
    const newRound = await res.json();
    setRounds((prev) => [...prev, newRound]);
    setRoundName('');
    setGames(6);
    setRoundType('Qualifying');
    setBonus('');
  };

  const handleSelectRound = (id) => {
    setSelectedRoundId(id);
    const round = rounds.find((r) => r.id === parseInt(id));
    setGameScores(new Array(round?.games || 0).fill(''));
  };

  const handleScoreChange = (index, value) => {
    const updated = [...gameScores];
    updated[index] = value;
    setGameScores(updated);
  };

  const handleSubmitScores = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bowlerId: parseInt(selectedBowlerId),
        roundId: parseInt(selectedRoundId),
        scores: gameScores,
      }),
    });
    const newScore = await res.json();
    setScoreList((prev) => [...prev, newScore]);
    setSelectedBowlerId('');
    setSelectedRoundId('');
    setGameScores([]);
    fetchStandings();
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Tournament Standings', 20, 20);

    standings.forEach((s, idx) => {
      const bowler = bowlers.find((b) => b.id === s.bowlerId);
      const name = bowler?.name || 'Unknown';
      doc.text(`${idx + 1}. ${name} — ${s.total} pins`, 20, 30 + idx * 10);
    });

    doc.save('standings.pdf');
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Tournament System</h1>

      {/* Bowler Form */}
      <h2>Add Bowler</h2>
      <form onSubmit={handleAddBowler} style={{ marginBottom: '2rem' }}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginRight: '1rem' }}
        />
        <input
          placeholder="Division"
          value={division}
          onChange={(e) => setDivision(e.target.value)}
          style={{ marginRight: '1rem' }}
        />
        <button type="submit">Add Bowler</button>
      </form>

      <ul>
        {bowlers.map((b) => (
          <li key={b.id} style={{ marginBottom: '0.5rem' }}>
            {editingId === b.id ? (
              <>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                <input value={editDivision} onChange={(e) => setEditDivision(e.target.value)} />
                <button onClick={() => handleSaveEdit(b.id)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                {b.name} — {b.division}
                <button onClick={() => handleEdit(b)} style={{ marginLeft: '1rem' }}>Edit</button>
                <button onClick={() => handleDelete(b.id)} style={{ marginLeft: '0.5rem' }}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Round Form */}
      <h2 style={{ marginTop: '3rem' }}>Create Round</h2>
      <form onSubmit={handleAddRound}>
        <input
          placeholder="Round Name"
          value={roundName}
          onChange={(e) => setRoundName(e.target.value)}
          style={{ marginRight: '1rem' }}
        />
        <select value={games} onChange={(e) => setGames(e.target.value)} style={{ marginRight: '1rem' }}>
          {[3, 4, 5, 6, 7, 8].map((g) => (
            <option key={g} value={g}>{g} Games</option>
          ))}
        </select>
        <select value={roundType} onChange={(e) => setRoundType(e.target.value)} style={{ marginRight: '1rem' }}>
          <option value="Qualifying">Qualifying</option>
          <option value="Matchplay">Matchplay</option>
          <option value="Finals">Finals</option>
        </select>
       <input
          placeholder="Bonus Logic (optional)"
          value={bonus}
          onChange={(e) => setBonus(e.target.value)}
          style={{ marginRight: '1rem' }}
        />
        <button type="submit">Add Round</button>
      </form>

      <ul style={{ marginTop: '1rem' }}>
        {rounds.map((r) => (
          <li key={r.id}>
            {r.name} — {r.games} games — {r.type}
            {r.bonus && <> (Bonus: {r.bonus})</>}
          </li>
        ))}
      </ul>

      {/* Score Entry */}
      <h2 style={{ marginTop: '3rem' }}>Enter Scores</h2>
      <form onSubmit={handleSubmitScores}>
        <select value={selectedRoundId} onChange={(e) => handleSelectRound(e.target.value)} style={{ marginRight: '1rem' }}>
          <option value="">Select Round</option>
          {rounds.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <select value={selectedBowlerId} onChange={(e) => setSelectedBowlerId(e.target.value)} style={{ marginRight: '1rem' }}>
          <option value="">Select Bowler</option>
          {bowlers.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        {gameScores.map((score, idx) => (
          <input
            key={idx}
            placeholder={`G${idx + 1}`}
            value={score}
            onChange={(e) => handleScoreChange(idx, e.target.value)}
            style={{ width: '60px', marginRight: '0.5rem' }}
          />
        ))}

        <button type="submit" style={{ marginLeft: '1rem' }}>Submit Scores</button>
      </form>

      <h3 style={{ marginTop: '2rem' }}>Submitted Scores</h3>
      <ul>
        {scoreList.map((s) => {
          const bowler = bowlers.find((b) => b.id === s.bowlerId);
          const round = rounds.find((r) => r.id === s.roundId);
          return (
            <li key={s.id}>
              {bowler?.name || 'Unknown'} – {round?.name || 'Unknown'}: {s.scores.join(', ')}
            </li>
          );
        })}
      </ul>

      {/* Standings */}
      <h2 style={{ marginTop: '3rem' }}>Standings</h2>
      <button onClick={downloadPDF} style={{ marginBottom: '1rem' }}>
        Download Standings PDF
      </button>
      <ul>
        {standings.map((s, idx) => {
          const bowler = bowlers.find((b) => b.id === s.bowlerId);
          return (
            <li key={s.bowlerId}>
              {idx + 1}. {bowler?.name || 'Unknown'} — {s.total} pins
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default App;
