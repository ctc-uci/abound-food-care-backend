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
    volunteerType: event.volunteer_type,
    volunteerRequirements: event.volunteer_requirements,
    volunteerCapacity: event.volunteer_capacity,
    fileAttachments: event.fileAttachments,
    notes: event.notes,
    id: event.event_id,
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
    const createEventResponse = await pool.query(
      `INSERT INTO event(
        name,
        ntype,
        location,
        start_date_time,
        end_date_time,
        volunteer_type,
        volunteer_requirements,
        volunteer_capacity,
        file_attachments,
        notes)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
      ],
    );
    if (createEventResponse.rowCount === 0) {
      res.status(400).send();
    } else {
      const event = snakeToCamel(createEventResponse.rows);
      res.status(200).send(event);
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = eventRouter;
