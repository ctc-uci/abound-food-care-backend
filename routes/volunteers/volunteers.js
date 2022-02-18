// endpoints related to volunteer hours
const express = require('express');
const pool = require('../../db');

const volunteerRouter = express();

volunteerRouter.use(express.json());

volunteerRouter.get('/available/day/:day/start/:startTime/end/:endTime', async (req, res) => {
  try {
    // get params (hour and day)
    const day = req.params.day.toLowerCase();
    const endTime = req.params.endTime.replace('-', ':');
    const startTime = req.params.startTime.replace('-', ':');
    const volunteers = await pool.query(
      'SELECT u.name FROM availability a INNER JOIN "users" u on u.id = a.user_id WHERE day_of_week = $1 and start_time = $2 and end_time = $3',
      [day, startTime, endTime],
    );
    res.status(200).json(volunteers.rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get volunteer's events by id
volunteerRouter.get('/:id', async (req, res) => {
  try {
    const getEvents = await pool.query(
      'SELECT event_id FROM volunteer_at_events WHERE user_id = $1;',
      [req.params.id],
    );
    res.status(200).json(getEvents.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = volunteerRouter;
