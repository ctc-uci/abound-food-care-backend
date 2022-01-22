const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;
require('dotenv').config();

app.use(
  cors({
    origin: `${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`,
  }),
  express.json(),
);

app.listen(PORT, () => {});

app.get('/users/:id', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
    res.json(user.rows[0]);
  } catch (err) {
    res.json();
  }
});
