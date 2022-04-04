const express = require('express');
const { pool, db } = require('../server/db');
const { keysToCamel, isNumeric, isBoolean } = require('./utils');

const volunteerHoursRouter = express();

// get all submitted hours
volunteerHoursRouter.get('/', async (req, res) => {
  try {
    const submittedHours = await pool.query(
      `SELECT *
      FROM volunteer_at_events
      WHERE volunteer_at_events.submitted = True;`,
    );
    res.status(200).json(keysToCamel(submittedHours.rows));
  } catch (err) {
    res.status(400).json(err.message);
  }
});

// get all hours for a volunteer
volunteerHoursRouter.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const submittedHours = await pool.query(
      `SELECT *
      FROM volunteer_at_events
      WHERE volunteer_at_events.user_id = $1;`,
      [userId],
    );
    res.status(200).json(keysToCamel(submittedHours.rows));
  } catch (err) {
    res.status(400).json(err.message);
  }
});

// create unsubmitted hours for a volunteer
// need to decide whether num_hours is calculated on the frontend or backend
volunteerHoursRouter.post('/:userId/:eventId', async (req, res) => {
  try {
    const { userId, eventId } = req.params;
    isNumeric(eventId, 'Event Id must be a number');
    const { startDatetime, endDatetime, submitted, approved, declined, notes } = req.body;
    isBoolean(submitted, 'Submitted must be a boolean value');
    isBoolean(approved, 'Approved must be a boolean value');
    isBoolean(declined, 'Declined must be a boolean value');

    const start = new Date(startDatetime);
    const end = new Date(endDatetime);
    const diff = end.getTime() - start.getTime();
    const numHours = parseInt(diff / (60000 * 60), 10);

    const unsubmittedHours = await db.query(
      `UPDATE volunteer_at_events
      SET
        start_datetime = $(startDatetime),
        end_datetime = $(endDatetime),
        submitted = $(submitted),
        approved = $(approved),
        declined = $(declined),
        num_hours = $(numHours)
        ${notes ? ', notes = $(notes)' : ''}
      WHERE user_id = $(userId) AND event_id = $(eventId)
      RETURNING *;`,
      {
        startDatetime,
        endDatetime,
        submitted,
        approved,
        declined,
        numHours,
        notes,
        userId,
        eventId,
      },
    );
    res.status(200).json(keysToCamel(unsubmittedHours[0]));
  } catch (err) {
    res.status(400).json(err.message);
  }
});

// submit hours for a volunteer

// create unsubmitted hours
volunteerHoursRouter.post('/create', async (req, res) => {
  try {
    const { userId, eventId, startDatetime, endDatetime, notes } = req.body;
    // calculate number of hours
    const start = new Date(startDatetime);
    const end = new Date(endDatetime);
    const diff = end.getTime() - start.getTime();
    const numHours = parseInt(diff / (60000 * 60), 10);

    const createdHours = await pool.query(
      'INSERT INTO volunteer_hours(user_id, event_id, start_datetime, end_datetime, approved, num_hours, notes, submitted, declined) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;',
      [userId, eventId, startDatetime, endDatetime, false, numHours, notes, false, false],
    );
    if (createdHours.rows.length === 0) {
      res.status(400).json();
    } else {
      res.status(200).json(createdHours.rows);
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// submitHours
volunteerHoursRouter.put('/submit', async (req, res) => {
  try {
    const { userId, eventId, startDatetime, endDatetime, approved, notes } = req.body;
    const start = new Date(startDatetime);
    const end = new Date(endDatetime);
    const diff = end.getTime() - start.getTime();
    const numHours = parseInt(diff / (60000 * 60), 10);

    const createdHours = await pool.query(
      'UPDATE volunteer_hours SET start_datetime = $3, end_datetime = $4, approved = $5, num_hours = $6, notes = $7, submitted = $8 WHERE user_id = $1 AND event_id = $2 RETURNING *;',
      [userId, eventId, startDatetime, endDatetime, approved, numHours, notes, true],
    );
    if (createdHours.rows.length === 0) {
      res.status(400).json();
    } else {
      res.status(200).json(createdHours.rows);
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// getUnsubmittedHours
volunteerHoursRouter.get('/unsubmitted', async (req, res) => {
  try {
    const unsubmittedHours = await pool.query(
      'SELECT * FROM volunteer_hours WHERE submitted = False;',
    );
    res.status(200).json(unsubmittedHours.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// getSubmittedHours
volunteerHoursRouter.get('/submitted', async (req, res) => {
  try {
    const submittedHours = await pool.query(
      'SELECT * FROM volunteer_hours WHERE submitted = True;',
    );
    res.status(200).json(submittedHours.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// getUnsubmittedHoursByUserId
volunteerHoursRouter.get('/unsubmittedUser/:id', async (req, res) => {
  try {
    const unsubmittedHours = await pool.query(
      'SELECT v.start_datetime, v.end_datetime, v.num_hours, v.notes, e.name, e.event_id, v.start_datetime AS date FROM volunteer_hours v, event e WHERE v.event_id = e.event_id AND submitted = False AND user_id = $1 ORDER BY v.start_datetime',
      [req.params.id],
    );
    res.status(200).json(unsubmittedHours.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// getSubmittedHoursByUserId
volunteerHoursRouter.get('/submittedUser/:id', async (req, res) => {
  try {
    const submittedHours = await pool.query(
      'SELECT v.approved, v.start_datetime, v.end_datetime, v.num_hours, v.notes, e.name, v.start_datetime AS date FROM volunteer_hours v, event e WHERE v.event_id = e.event_id AND submitted = True AND user_id = $1 ORDER BY v.start_datetime',
      [req.params.id],
    );
    res.status(200).json(submittedHours.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// getVolunteerStatistics
volunteerHoursRouter.get('/statistics/:id', async (req, res) => {
  try {
    const volunteerStats = await pool.query(
      'SELECT COUNT(v.event_id) as event_count, SUM(v.num_hours) as hours FROM volunteer_hours v WHERE submitted = True AND user_id = $1',
      [req.params.id],
    );
    res.status(200).json(volunteerStats.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

volunteerHoursRouter.get('/unapproved', async (req, res) => {
  try {
    const unapprovedHours = await pool.query(
      'SELECT * FROM volunteer_hours WHERE approved = False AND submitted = True;',
    );
    res.status(200).json(unapprovedHours.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = volunteerHoursRouter;
