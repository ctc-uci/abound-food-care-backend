// endpoints related to volunteer hours
const express = require('express');
const pool = require('../server/db');
const { addNotification } = require('./utils');

const volunteerRouter = express();

volunteerRouter.use(express.json());

// get available volunteers at specific date and time
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
    res.status(500).json(err);
  }
});

// get volunteer's events by id
volunteerRouter.get('/:userId/events/', async (req, res) => {
  try {
    const getEvents = await pool.query(
      'SELECT event_id FROM volunteer_at_events WHERE user_id = $1;',
      [req.params.userId],
    );
    res.status(200).json(getEvents.rows);
  } catch (err) {
    res.status(500).json(err.message);
    console.error(err);
    res.status(400).json(err.message);
  }
});

// get all available volunteers
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
    const currentVolunteer = await pool.query('SELECT name FROM volunteers WHERE user_id = $1');
    const currentEvent = await pool.query('SELECT name FROM events WHERE event_id = $1', eventId);
    const volunteerCount = await pool.query(
      'SELECT COUNT(*) from volunteer_at_events WHERE event_id = $1',
      eventId,
    );
    addNotification(
      `event_${eventId}_join`,
      `${currentVolunteer.rows[0]} and ${volunteerCount.rows[0] - 1} have signed up for ${
        currentEvent.rows[0]
      }`,
    );
    res.status(200).json(createVolunteerAtEvent.rows[0]);
  } catch (err) {
    res.status(400).json(err);
  }
});

// get number of volunteers at specific event
volunteerRouter.get('/:eventId', async (req, res) => {
  const { eventId } = req.params;
  try {
    const volunteers = await pool.query(
      `SELECT COUNT(users.id)
        FROM volunteer_at_events
        INNER JOIN users ON volunteer_at_events.user_id = users.id
        AND volunteer_at_events.event_id=$1 AND users.u_type = 'volunteer';`,
      [eventId],
    );
    res.status(200).json(volunteers.rows[0]);
  } catch (err) {
    res.status(400).json(err.message);
  }
});

module.exports = volunteerRouter;
