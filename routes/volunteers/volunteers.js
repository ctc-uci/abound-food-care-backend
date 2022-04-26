const express = require('express');
const { pool } = require('../../server/db');
const { isNumeric, keysToCamel, getUsersQuery } = require('../utils');

const volunteerRouter = express();

// get all volunteers
volunteerRouter.get('/', async (req, res) => {
  try {
    const conditions = `WHERE users.role = 'volunteer'`;
    const volunteers = await pool.query(getUsersQuery(conditions));
    res.status(200).json(keysToCamel(volunteers.rows));
  } catch (err) {
    res.status(400).json(err.message);
  }
});

// Get Total # Of Events
volunteerRouter.get('/total', async (req, res) => {
  try {
    const numVolunteers = await pool.query(
      `SELECT COUNT(*) FROM users
        WHERE role = $1`,
      ['volunteer'],
    );
    res.status(200).json(numVolunteers.rows[0]);
  } catch (err) {
    res.status(400).json(err);
  }
});

// get all event ids a volunteer is signed up for
volunteerRouter.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const eventIds = await pool.query(
      `SELECT array_agg(event_id ORDER BY event_id ASC) as event_ids
      FROM volunteer_at_events
      WHERE user_id = $1
      GROUP BY user_id`,
      [userId],
    );
    res.status(200).json(keysToCamel(eventIds.rows[0]));
  } catch (err) {
    res.status(400).json(err.message);
  }
});

// add a volunteer to an event
volunteerRouter.post('/:userId/:eventId', async (req, res) => {
  try {
    const { userId, eventId } = req.params;
    isNumeric(eventId, 'Event Id must be a number');
    const signUp = await pool.query(
      `INSERT INTO volunteer_at_events
      (user_id, event_id)
      VALUES ($1, $2)
      RETURNING *;`,
      [userId, eventId],
    );
    res.status(200).json(keysToCamel(signUp.rows[0]));
  } catch (err) {
    res.status(400).json(err.message);
  }
});

// remove a volunteer from an event
volunteerRouter.delete('/:userId/:eventId', async (req, res) => {
  try {
    const { userId, eventId } = req.params;
    isNumeric(eventId, 'Event Id must be a number');
    const deletedSignUp = await pool.query(
      `DELETE FROM volunteer_at_events as v
      WHERE v.user_id = $1 AND v.event_id = $2
      RETURNING *;`,
      [userId, eventId],
    );
    res.status(200).json(keysToCamel(deletedSignUp.rows[0]));
  } catch (err) {
    res.status(400).json(err.message);
  }
});

// get all volunteer ids for a specific event
volunteerRouter.get('/events/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    isNumeric(eventId, 'Event Id must be a number');
    const volunteers = await pool.query(
      `SELECT array_agg(user_id ORDER BY user_id ASC) as user_ids
      FROM volunteer_at_events
      WHERE event_id = $1
      GROUP BY event_id`,
      [eventId],
    );
    res.status(200).json(keysToCamel(volunteers.rows[0]));
  } catch (err) {
    res.status(400).json(err.message);
  }
});

// get available volunteers at specific date and time
// volunteerRouter.get('/available/day/:day/start/:startTime/end/:endTime', async (req, res) => {
//   try {
//     const day = req.params.day.toLowerCase();
//     const endTime = req.params.endTime.replace('-', ':');
//     const startTime = req.params.startTime.replace('-', ':');
//     // assume startTime and endTime is a timestamp
//     const volunteers = await pool.query(
//       'SELECT u.name FROM availability a INNER JOIN "users" u on u.id = a.user_id WHERE day_of_week = $1 and start_time = $2 and end_time = $3',
//       [day, `${startTime}PST`, `${endTime}PST`],
//     );
//     res.status(200).json(volunteers.rows);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

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

// get number of volunteers at specific event
// volunteerRouter.get('/:eventId', async (req, res) => {
//   const { eventId } = req.params;
//   try {
//     const volunteers = await pool.query(
//       `SELECT COUNT(users.id)
//         FROM volunteer_at_events
//         INNER JOIN users ON volunteer_at_events.user_id = users.id
//         AND volunteer_at_events.event_id=$1 AND users.u_type = 'volunteer';`,
//       [eventId],
//     );
//     res.status(200).json(volunteers.rows[0]);
//   } catch (err) {
//     res.status(400).json(err.message);
//   }
// });

module.exports = volunteerRouter;
