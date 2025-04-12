import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [name, setName] = useState('');
  const [division, setDivision] = useState('');
  const [bowlers, setBowlers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDivision, setEditDivision] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBowlers = async () => {
    try {
      const res = await fetch(`${API_URL}/bowlers`);
      const data = await res.json();
      setBowlers(data);
    } catch {
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

  const handleDelete = async (id) => {
    await fetch(`${API_URL}/bowlers/${id}`, {
      method: 'DELETE',
    });
    setBowlers((prev) => prev.filter((b) => b.id !== id));
  };

  const handleEdit = (bowler) => {
    setEditingId(bowler.id);
    setEditName(bowler.name);
    setEditDivision(bowler.division);
  };

  const handleSaveEdit = async (id) => {
    const res = await fetch(`${API_URL}/bowlers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, division: editDivision }),
    });

    if (res.ok) {
      const updated = await res.json();
      setBowlers((prev) =>
        prev.map((b) => (b.id === id ? updated : b))
      );
      setEditingId(null);
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
            <li key={b.id} style={{ marginBottom: '0.5rem' }}>
              {editingId === b.id ? (
                <>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <input
                    value={editDivision}
                    onChange={(e) => setEditDivision(e.target.value)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <button onClick={() => handleSaveEdit(b.id)}>Save</button>
                  <button onClick={() => setEditingId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  {b.name} — {b.division}
                  <button
                    style={{ marginLeft: '1rem' }}
                    onClick={() => handleEdit(b)}
                  >
                    Edit
                  </button>
                  <button
                    style={{ marginLeft: '0.5rem' }}
                    onClick={() => handleDelete(b.id)}
                  >
                    Delete
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
