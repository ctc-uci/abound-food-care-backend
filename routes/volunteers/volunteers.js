// endpoints related to volunteer hours
const express = require('express');
const pool = require('../../db');

const volunteerRouter = express();

volunteerRouter.use(express.json());

volunteerRouter.get('/available/day/:day/start/:startTime/end/:endTime', async (req, res) => {
  try {
    const day = req.params.day.toLowerCase();
    const endTime = req.params.endTime.replace('-', ':');
    const startTime = req.params.startTime.replace('-', ':');

    // assume startTime and endTime is a timestamp
    const volunteers = await pool.query(
      'SELECT u.name FROM availability a INNER JOIN "users" u on u.id = a.user_id WHERE day_of_week = $1 and start_time = $2 and end_time = $3',
      [day, `${startTime}PST`, `${endTime}PST`],
    );
    res.status(200).json(volunteers.rows);
  } catch (err) {
    console.error(err);
    res.status(400).json(err.message);
  }
});

volunteerRouter.get('/available', async (req, res) => {
  try {
    const resData = {};
    // assume startTime and endTime is a timestamp
    const volunteers = await pool.query('SELECT * FROM availability');
    volunteers.rows.forEach((volunteerHour) => {
      const startTime = volunteerHour.start_time.substring(0, 5);
      const endTime = volunteerHour.end_time.substring(0, 5);
      const day = volunteerHour.day_of_week;

      resData[`${day} ${startTime} to ${endTime}`] =
        (resData[`${day} ${startTime} to ${endTime}`] ?? 0) + 1;
    });

    res.status(200).json(resData);
  } catch (err) {
    res.status(400).json(err.message);
  }
});

// Create Volunteer At Event
volunteerRouter.post('/event/join', async (req, res) => {
  try {
    const { userId, eventId, notes } = req.body;
    const createVolunteerAtEvent = await pool.query(
      'INSERT INTO volunteer_at_events (user_id, event_id, notes) VALUES($1, $2, $3) RETURNING *',
      [userId, eventId, notes],
    );
    res.status(200).json(createVolunteerAtEvent.rows[0]);
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = volunteerRouter;
