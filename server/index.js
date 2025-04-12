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
