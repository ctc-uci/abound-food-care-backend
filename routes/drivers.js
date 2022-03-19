// endpoints related to drivers
const express = require('express');

const driverRouter = express();
const pool = require('../server/db');

driverRouter.use(express.json());

// Create Driver Endpoint
driverRouter.post('/create', async (req, res) => {
  try {
    const { userId, vehicleType, distance } = req.body;
    const createDriver = await pool.query(
      'INSERT INTO driver(user_id, vehicle_type, distance) VALUES($1, $2, $3) RETURNING *;',
      [userId, vehicleType, distance],
    );
    res.status(200).send(createDriver.rows[0]);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Get Driver By Id Endpoint
driverRouter.get('/:id', async (req, res) => {
  try {
    const getDriverById = await pool.query('SELECT * FROM driver WHERE user_id = $1;', [
      req.params.id,
    ]);
    const data = getDriverById.rows[0];
    res.status(200).send(data || {});
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = driverRouter;
