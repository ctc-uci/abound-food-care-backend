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

// Create Event Endpoint
app.post('/users/create', async (req, res) => {
  try {
    const {
      name,
      ntype,
      location,
      startDateTime,
      endDateTime,
      volunteerType,
      volunteerRequirements,
      volunteerCapacity,
      fileAttachments,
      notes,
    } = req.body;
    const createEvent = await pool.query(
      'INSERT INTO users(name, ntype, location, startDateTime, endDateTime, volunteerType, volunteerCapacity, fileAttachments, notes) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;',
      [
        name,
        ntype,
        location,
        startDateTime,
        endDateTime,
        volunteerType,
        volunteerRequirements,
        volunteerCapacity,
        fileAttachments,
        notes,
      ],
    );
    res.json(createEvent.rows[0]);
  } catch (err) {
    res.json();
  }
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
