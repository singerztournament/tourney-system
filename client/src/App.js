import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [name, setName] = useState('');
  const [division, setDivision] = useState('');
  const [bowlers, setBowlers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBowlers = async () => {
    try {
      const res = await fetch(`${API_URL}/bowlers`);
      const data = await res.json();
      setBowlers(data);
    } catch (err) {
      setError('Failed to load bowlers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBowlers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !division) return;

    const res = await fetch(`${API_URL}/bowlers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, division }),
    });

    if (res.ok) {
      const newBowler = await res.json();
      setBowlers((prev) => [...prev, newBowler]);
      setName('');
      setDivision('');
    } else {
      setError('Error adding bowler');
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Tournament System</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
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

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading ? (
        <p>Loading bowlers...</p>
      ) : (
        <ul>
          {bowlers.map((b) => (
            <li key={b.id}>
              {b.name} — {b.division}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
