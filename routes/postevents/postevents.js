// endpoints related to postevent
const express = require('express');
const pool = require('../../db');

const posteventRouter = express();

posteventRouter.use(express.json());

// Get Post Event
posteventRouter.get('/:eventId', async (req, res) => {
  try {
    const getPostById = await pool.query('SELECT * FROM postevent WHERE event_id = $1;', [
      req.params.eventId,
    ]);
    res.status(200).json(getPostById.rows[0] || {});
  } catch (err) {
    res.status(400).json(err);
  }
});

// Create Post Event
posteventRouter.post('/create', async (req, res) => {
  try {
    const { eventId, description } = req.body;
    const checkPostEventExists = await pool.query('SELECT * FROM postevent WHERE event_id = $1;', [
      eventId,
    ]);
    if (checkPostEventExists.rows.length !== 0) {
      res.status(400).send(`Postevent already exists for event_id ${eventId}`);
    }
    const createPostEvent = await pool.query(
      'INSERT INTO postevent (event_id, description) VALUES($1, $2) RETURNING *;',
      [eventId, description],
    );
    res.status(200).json(createPostEvent.rows[0]);
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = posteventRouter;
