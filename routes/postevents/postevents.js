// endpoints related to postevent
const express = require('express');
const pool = require('../../db');

const posteventRouter = express();

posteventRouter.use(express.json());

function snakeToCamel(postevents) {
  return postevents.map((postevent) => ({
    posteventId: postevent.postevent_id,
    eventId: postevent.event_id,
    description: postevent.description,
  }));
}

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

// Update Post Event Endpoint
posteventRouter.put('/:posteventId', async (req, res) => {
  try {
    const { description } = req.body;
    const updatePostEvents = await pool.query(
      'UPDATE postevent SET description = $1 WHERE event_id = $2 RETURNING *;',
      [description, req.params.posteventId],
    );
    if (updatePostEvents.rows.length === 0) {
      res.status(400).json();
    } else {
      res.status(200).json(snakeToCamel(updatePostEvents.rows));
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = posteventRouter;
