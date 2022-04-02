const express = require('express');
const { pool } = require('../../server/db');
const { keysToCamel } = require('../utils');
const updateAvailabilities = require('./availabilityUtils');

const availabilityRouter = express();

const getAvailabilitiesQuery = (conditions = '') =>
  `SELECT user_id, array_agg(to_jsonb(availability.*) - 'user_id' ORDER BY availability.day_of_week) as availabilities
  FROM availability
  ${conditions}
  GROUP BY user_id`;

// get availability for a user
availabilityRouter.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const conditions = `WHERE user_id = $1`;
    const user = await pool.query(getAvailabilitiesQuery(conditions), [userId]);
    res.status(200).send(keysToCamel(user.rows[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// get all availability
availabilityRouter.get('/', async (req, res) => {
  try {
    const user = await pool.query(getAvailabilitiesQuery());
    res.status(200).send(keysToCamel(user.rows));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// add availability
availabilityRouter.post('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { availabilities } = req.body;
    const availabilties = await updateAvailabilities(
      availabilities,
      userId,
      getAvailabilitiesQuery,
    );
    res.status(200).send(keysToCamel(availabilties));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// update availability
availabilityRouter.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { availabilities } = req.body;
    const availabilties = await updateAvailabilities(
      availabilities,
      userId,
      getAvailabilitiesQuery,
      true,
    );
    res.status(200).send(keysToCamel(availabilties));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// delete availability
availabilityRouter.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await pool.query(`DELETE FROM availability WHERE user_id = $1 RETURNING *;`, [
      userId,
    ]);
    res.status(200).send(keysToCamel(user.rows));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = availabilityRouter;
