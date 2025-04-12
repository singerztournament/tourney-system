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
    fetchStandings(); // Refresh standings after scores are added
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

      {/* Existing code omitted for brevity: Add Bowler, Rounds, Scores... */}

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
