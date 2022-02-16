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
    const start = new Date(start_datetime);
    const end = new Date(end_datetime);
    const diff = end.getTime() - start.getTime();
    const numHours = diff / (60000 * 60);

    const createdHours = await pool.query(
      'INSERT INTO volunteer_hours(user_id, event_id, start_datetime, end_datetime, approved, num_hours, notes, submitted) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;',
      [userId, eventId, startDatetime, endDatetime, approved, numHours, notes, true],
    );
    res.status(200).json(createdHours.rows[0]);
  } catch (err) {
    res.status(400).json(err);
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
    res.status(400).json(err);
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
    res.status(400).json(err);
  }

hoursRouter.get('/unapproved', async (req, res) => {
  try {
    const unapprovedHours = await pool.query(
      'SELECT * FROM volunteer_hours WHERE approved = False AND submitted = True;',
    );
    res.status(200).json(unapprovedHours.rows);

  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = hoursRouter;
