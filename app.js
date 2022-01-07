const express = require('express');
const cors = require('cors');
const pool = require('./db');

require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: `${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`,
  }),
  express.json(),
);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

app.post('/driver/create', async (req, res) => {
  try {
    const { userId, vehicleType, distance } = req.body;
    const createDriver = await pool.query(
      'INSERT INTO users(user_id, vehicle_type, distance) VALUES($1, $2, $3) RETURNING *;',
      [userId, vehicleType, distance],
    );
    res.json(createDriver.rows[0]);
  } catch (err) {
    res.json();
  }
});
