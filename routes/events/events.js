// endpoints related to events
const express = require('express');
const pool = require('../../db');

const eventRouter = express();

eventRouter.use(express.json());
// endpoints related to events

// Get Event Endpoint
eventRouter.get('/event/:id', async (req, res) => {
  try {
    const getEventById = await pool.query('SELECT * FROM event WHERE event_id = $1;', [
      req.params.id,
    ]);
    res.json(getEventById.rows);
  } catch (err) {
    res.json();
  }
});

// Create Event Endpoint
eventRouter.post('/event/create', async (req, res) => {
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
      'INSERT INTO event(name, ntype, location, startDateTime, endDateTime, volunteerType, volunteerCapacity, fileAttachments, notes) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;',
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

module.exports = eventRouter;
