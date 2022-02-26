// endpoints related to volunteer hours
const express = require('express');
const pool = require('../../db');

const hoursRouter = express();

hoursRouter.use(express.json());

// createSubmittedHours
hoursRouter.post('/create', async (req, res) => {
  try {
    const { userId, eventId, startDatetime, endDatetime, approved, notes } = req.body;
    // calculate number of hours
    const start = new Date(startDatetime);
    const end = new Date(endDatetime);
    const diff = end.getTime() - start.getTime();
    const numHours = parseInt(diff / (60000 * 60), 10);

    const createdHours = await pool.query(
      'INSERT INTO volunteer_hours(user_id, event_id, start_datetime, end_datetime, approved, num_hours, notes, submitted) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;',
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
hoursRouter.get('/unsubmitted', async (req, res) => {
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
hoursRouter.get('/submitted', async (req, res) => {
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
hoursRouter.get('/unsubmittedUser', async (req, res) => {
  const { user } = req.body;
  try {
    const unsubmittedHours = await pool.query(
      'SELECT v.start_datetime, v.end_datetime, v.num_hours, v.notes, e.name FROM volunteer_hours v, event e WHERE v.event_id = e.event_id AND submitted = False AND user_id = $1;',
      [user],
    );
    res.status(200).json(unsubmittedHours.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// getSubmittedHoursByUserId
hoursRouter.get('/submittedUser', async (req, res) => {
  const { user } = req.body;
  try {
    const unsubmittedHours = await pool.query(
      'SELECT v.start_datetime, v.end_datetime, v.num_hours, v.notes, e.name FROM volunteer_hours v, event e WHERE v.event_id = e.event_id AND submitted = True AND user_id = $1;',
      [user],
    );
    res.status(200).json(unsubmittedHours.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

hoursRouter.get('/unapproved', async (req, res) => {
  try {
    const unapprovedHours = await pool.query(
      'SELECT * FROM volunteer_hours WHERE approved = False AND submitted = True;',
    );
    res.status(200).json(unapprovedHours.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = hoursRouter;
