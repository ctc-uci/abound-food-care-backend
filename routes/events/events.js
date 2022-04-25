const express = require('express');
const { pool, db } = require('../../server/db');
const { isNumeric, isZipCode, keysToCamel } = require('../utils');
const { updateEventRequirements, updateEventWaivers, getEventsQuery } = require('./eventsUtils');

const eventRouter = express();

// get all events
eventRouter.get('/', async (req, res) => {
  try {
    const conditions = '';
    const events = await pool.query(getEventsQuery(conditions));
    res.status(200).json(keysToCamel(events.rows));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get Total # Of Events
eventRouter.get('/total', async (req, res) => {
  try {
    const numEvents = await pool.query('SELECT COUNT(*) FROM events');
    res.status(200).json(numEvents.rows[0]);
  } catch (err) {
    res.status(400).json(err);
  }
});

eventRouter.get('/upcoming', async (req, res) => {
  try {
    const currDate = new Date();
    const conditions = 'WHERE start_datetime >= $1';
    const events = await pool.query(getEventsQuery(conditions), [currDate]);
    res.status(200).json(keysToCamel(events.rows));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

eventRouter.get('/past', async (req, res) => {
  try {
    const currDate = new Date();
    const conditions = 'WHERE start_datetime < $1';
    const events = await pool.query(getEventsQuery(conditions), [currDate]);
    res.status(200).json(keysToCamel(events.rows));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// get an event
eventRouter.get('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    isNumeric(eventId, 'Event Id must be a number');
    const conditions = 'WHERE events.event_id = $1';
    const event = await pool.query(getEventsQuery(conditions), [eventId]);
    res.status(200).json(keysToCamel(event.rows));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// add an event
eventRouter.post('/', async (req, res) => {
  try {
    const {
      name,
      eventType,
      addressStreet,
      addressZip,
      addressCity,
      addressState,
      startDatetime,
      endDatetime,
      volunteerCapacity,
      notes,
      requirements,
      waivers,
    } = req.body;
    isZipCode(addressZip, 'Invalid Zip Code');
    isNumeric(volunteerCapacity, 'Volunteer Capacity is not a Number');
    let newEvent = await db.query(
      `INSERT INTO events (
        name, event_type, address_street, address_zip, address_city,
        address_state, start_datetime, end_datetime, volunteer_capacity
        ${notes ? ', notes' : ''})
      VALUES (
        $(name), $(eventType), $(addressStreet), $(addressZip), $(addressCity),
        $(addressState), $(startDatetime), $(endDatetime), $(volunteerCapacity)
        ${notes ? ', $(notes)' : ''})
      RETURNING *;`,
      {
        name,
        eventType,
        addressStreet,
        addressZip,
        addressCity,
        addressState,
        startDatetime,
        endDatetime,
        volunteerCapacity,
        notes,
      },
    );
    const eventId = newEvent[0].event_id;
    await updateEventRequirements(requirements, eventId);
    newEvent = await updateEventWaivers(waivers, eventId);
    res.status(200).json(keysToCamel(newEvent));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// update an event
eventRouter.put('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    isNumeric(eventId, 'Event Id must be a number');
    const {
      name,
      eventType,
      addressStreet,
      addressZip,
      addressCity,
      addressState,
      startDatetime,
      endDatetime,
      volunteerCapacity,
      notes,
      posteventText,
      requirements,
      waivers,
    } = req.body;
    isZipCode(addressZip, 'Invalid Zip Code');
    isNumeric(volunteerCapacity, 'Volunteer Capacity is not a Number');
    await db.query(
      `UPDATE events
      SET
        name = $(name),
        event_type = $(eventType),
        address_street = $(addressStreet),
        address_zip = $(addressZip),
        address_city = $(addressCity),
        address_state = $(addressState),
        start_datetime = $(startDatetime),
        end_datetime = $(endDatetime),
        volunteer_capacity = $(volunteerCapacity)
        ${notes ? ', notes = $(notes)' : ''}
        ${posteventText ? ', postevent_text = $(posteventText)' : ''}
      WHERE event_id = $(eventId)
      RETURNING *;`,
      {
        name,
        eventType,
        addressStreet,
        addressZip,
        addressCity,
        addressState,
        startDatetime,
        endDatetime,
        volunteerCapacity,
        notes,
        posteventText,
        eventId,
      },
    );
    await updateEventRequirements(requirements, eventId, true);
    const updatedEvent = await updateEventWaivers(waivers, eventId, true);
    res.status(200).json(keysToCamel(updatedEvent));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// add postevent text
// do not think this request is needed because can just use above request to update post event text
// * needed for submitting post event text bc above request requires information that cannot be sent in req
eventRouter.put('/add_post_text/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    isNumeric(eventId, 'Event Id must be a number');
    const { posteventText } = req.body;
    const updatedEvent = await pool.query(
      `UPDATE events
      SET postevent_text = $1
      WHERE event_id = $2
      RETURNING *;`,
      [posteventText, eventId],
    );
    res.status(200).json(keysToCamel(updatedEvent.rows[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// delete an event
eventRouter.delete('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    isNumeric(eventId, 'Event Id must be a number');
    const deletedEvent = await pool.query(
      `DELETE FROM events
      WHERE event_id = $1
      RETURNING *;`,
      [eventId],
    );
    res.status(200).json(keysToCamel(deletedEvent.rows[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get Volunteers By Event
eventRouter.get('/:id/volunteers', async (req, res) => {
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

module.exports = eventRouter;
