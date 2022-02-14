// endpoints related to volunteer_at_events
const express = require('express');
const pool = require('../../db');

const volunteerAtEventsRouter = express();

volunteerAtEventsRouter.use(express.json());

// Get Volunteers By Event
volunteerAtEventsRouter.get('/:id', async (req, res) => {
  try {
    const getVolunteerByEvent = await pool.query(
      'SELECT user_id FROM volunteer_at_events WHERE event_id = $1;',
      [req.params.id],
    );
    res.status(200).json(getVolunteerByEvent.rows);
  } catch (err) {
    res.status(400).json(err);
  }
});

// Create Volunteer At Event
volunteerAtEventsRouter.post('/create', async (req, res) => {
  try {
    const { userId, eventId, notes } = req.body;
    const createVolunteerAtEvent = await pool.query(
      'INSERT INTO volunteer_at_events (user_id, event_id, notes) VALUES($1, $2, $3) RETURNING *;',
      [userId, eventId, notes],
    );
    res.status(200).json(createVolunteerAtEvent.rows[0]);
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = volunteerAtEventsRouter;
