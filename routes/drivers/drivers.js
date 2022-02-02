// endpoints related to drivers
const express = require('express');

const driverRouter = express();
const pool = require('../../db');

driverRouter.use(express.json());

// Create Driver Endpoint
driverRouter.post('/driver/create', async (req, res) => {
  try {
    const { userId, vehicleType, distance } = req.body;
    const createDriver = await pool.query(
      'INSERT INTO driver(user_id, vehicle_type, distance) VALUES($1, $2, $3) RETURNING *;',
      [userId, vehicleType, distance],
    );
    res.json(createDriver.rows[0]);
  } catch (err) {
    res.json();
  }
});

// Get Driver By Id Endpoint
driverRouter.get('/driver/:id/get', async (req, res) => {
  try {
    const getDriverById = await pool.query('SELECT * FROM driver WHERE user_id = $1;', [
      req.params.id,
    ]);
    res.status(200).json(getDriverById.rows);
  } catch (err) {
    res.status(400).json();
  }
});

module.exports = driverRouter;
