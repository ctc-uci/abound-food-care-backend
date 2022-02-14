// endpoints related to events
const express = require('express');
const pool = require('../../db');

const eventRouter = express();

eventRouter.use(express.json());

function snakeToCamel(events) {
  return events.map((event) => ({
    name: event.name,
    ntype: event.ntype,
    location: event.location,
    startDateTime: event.start_date_time,
    endDateTime: event.end_date_time,
    volunteerRequirements: event.volunteer_requirements,
    volunteerCapacity: event.volunteer_requirements,
    fileAttachments: event.file_attachments,
    notes: event.notes,
    id: event.id,
  }));
}

// Get Event Endpoint
eventRouter.get('/:id', async (req, res) => {
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
eventRouter.post('/create', async (req, res) => {
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

// Update Event Endpoint
eventRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
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

    const updateEventResponse = await pool.query(
      `UPDATE event
        SET
        name = $1,
        ntype = $2,
        location = $3,
        start_date_time = $4,
        end_date_time = $5,
        volunteer_type = $6,
        volunteer_requirements = $7,
        volunteer_capacity = $8,
        file_attachments = $9,
        notes = $10
        WHERE event_id = $11
        RETURNING *`,
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
        id,
      ],
    );
    if (updateEventResponse.rowCount === 0) {
      res.status(400).json();
    } else {
      const newEventResponse = snakeToCamel(updateEventResponse.rows);
      res.status(200).json(newEventResponse);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json(err.message);
  }
});

module.exports = eventRouter;
