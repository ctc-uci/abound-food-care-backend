// endpoints related to volunteer hours
const express = require('express');
const pool = require('../../db');

const hoursRouter = express();

hoursRouter.use(express.json());

// Get unapproved hours endpoint
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

// Create hours by volunteer
hoursRouter.post('/create', async (req, res) => {
  try {
    const { userId, eventId, startDatetime, endDatetime, approved, notes, submitted } = req.body;
    // calculate numHours
    const start = new Date(startDatetime);
    const end = new Date(endDatetime);
    const diff = end.getTime() - start.getTime();
    const numHours = parseInt(diff / (60000 * 60), 10);
    const createHoursResponse = await pool.query(
      `INSERT INTO volunteer_hours(
        user_id,
        event_id,
        start_datetime,
        end_datetime,
        num_hours,
        approved,
        notes,
        submitted)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
      [userId, eventId, startDatetime, endDatetime, numHours, approved, notes, submitted],
    );

    if (createHoursResponse.rowCount === 0) {
      res.status(400).json();
    } else {
      const hours = createHoursResponse.rows;
      res.status(200).json(hours);
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = hoursRouter;
