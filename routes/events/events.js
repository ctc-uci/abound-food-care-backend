// endpoints related to events
const express = require('express');

const eventRouter = express();
const pool = require('../../db');

eventRouter.use(express.json());

// Create Event Endpoint
eventRouter.post('/users/create', async (req, res) => {
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

module.exports = eventRouter;
