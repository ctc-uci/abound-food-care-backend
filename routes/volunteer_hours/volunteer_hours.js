// endpoints related to volunteer hours
const express = require('express');
const pool = require('../../db');

const hoursRouter = express();

hoursRouter.use(express.json());

// createSubmittedHours
hoursRouter.post('/create', async (req, res) => {
  try {
    const { user_id, event_id, start_datetime, end_datetime, approved, notes } = req.body;
    // calculate number of hours
    const start = new Date(start_datetime);
    const end = new Date(end_datetime);
    const diff = end.getTime() - start.getTime();
    const num_hours = diff / (60000 * 60);

    const createdHours = await pool.query(
      'INSERT INTO volunteer_hours(user_id, event_id, start_datetime, end_datetime, approved, num_hours, notes, submitted) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;',
      [user_id, event_id, start_datetime, end_datetime, approved, num_hours, notes, true],
    );
    res.status(200).json(createdHours.rows[0]);
  } catch (err) {
    console.log(err);
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
});


module.exports = hoursRouter;
