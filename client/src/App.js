import React, { useEffect, useState } from 'react';

function App() {
  const [apiMessage, setApiMessage] = useState('Loading...');

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/`)
      .then((res) => res.text())
      .then((data) => setApiMessage(data))
      .catch(() => setApiMessage('Failed to reach backend.'));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Tournament System</h1>
      <p>Backend says: {apiMessage}</p>
    </div>
  );
}

export default App;
