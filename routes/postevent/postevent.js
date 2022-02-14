// endpoints related to postevent
const express = require('express');
const pool = require('../../db');

const posteventRouter = express();

posteventRouter.use(express.json());

// Get Post Event
posteventRouter.get('/:id', async (req, res) => {
  try {
    const getPostById = await pool.query('SELECT * FROM event WHERE postevent_id = $1;', [
      req.params.id,
    ]);
    res.status(200).json(getPostById.rows);
  } catch (err) {
    res.status(400).json(err);
  }
});

// Create Post Event
posteventRouter.post('/create', async (req, res) => {
  try {
    const { eventId, posteventId, description } = req.body;
    const createPostEvent = await pool.query(
      'INSERT INTO postevent (event_id, postevent_id, description) VALUES($1, $2, $3) RETURNING *;',
      [eventId, posteventId, description],
    );
    res.status(200).json(createPostEvent.rows[0]);
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = posteventRouter;
