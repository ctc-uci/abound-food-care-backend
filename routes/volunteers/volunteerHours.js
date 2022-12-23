const express = require('express');
const Fuse = require('fuse.js');

const { pool, db } = require('../../server/db');
const { keysToCamel, isNumeric, isBoolean } = require('../utils');

const volunteerHoursRouter = express();

const getVolunteerHoursQuery = (conditions = '') =>
  `SELECT volunteer_at_events.*, to_jsonb(events.*) as event, to_jsonb(users.*) - 'user_id' as user
  FROM volunteer_at_events
    INNER JOIN
      (SELECT events.*, r.requirements
      FROM events
        LEFT JOIN
          (SELECT req.event_id, array_agg(req.requirement ORDER BY req.requirement ASC) AS requirements
          FROM event_requirements AS req
          GROUP BY req.event_id)
        AS r on r.event_id = events.event_id)
    AS events on events.event_id = volunteer_at_events.event_id
    INNER JOIN
      (SELECT users.* FROM users)
    AS users ON users.user_id = volunteer_at_events.user_id
    ${conditions};`;

// get all submitted hours
volunteerHoursRouter.get('/', async (req, res) => {
  try {
    const conditions = `WHERE volunteer_at_events.submitted = True`;
    const submittedHours = await pool.query(getVolunteerHoursQuery(conditions));
    res.status(200).json(keysToCamel(submittedHours.rows));
  } catch (err) {
    res.status(400).json(err.message);
  }
});

volunteerHoursRouter.get('/unapproved', async (req, res) => {
  try {
    const conditions = `WHERE volunteer_at_events.approved = False AND volunteer_at_events.declined = False`;
    const submittedHours = await pool.query(getVolunteerHoursQuery(conditions));
    res.status(200).json(keysToCamel(submittedHours.rows));
  } catch (err) {
    res.status(400).json(err.message);
  }
});

volunteerHoursRouter.get('/unapproved/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const conditions = `WHERE volunteer_at_events.approved = False AND volunteer_at_events.declined = False`;
    const submittedHours = await pool.query(getVolunteerHoursQuery(conditions));
    const options = {
      keys: [
        'event.name',
        'user.organization',
        { name: 'volunteer name', getFn: (log) => `${log.user.first_name} ${log.user.last_name}` },
      ],
      threshold: 0.2,
    };
    const queryReturnedHours = new Fuse(submittedHours.rows, options)
      .search(query)
      .map((result) => result.item);
    res.status(200).json(keysToCamel(queryReturnedHours));
  } catch (err) {
    res.status(400).json(err.message);
  }
});

// get all hours for a volunteer
volunteerHoursRouter.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const conditions = `WHERE volunteer_at_events.user_id = $1`;
    const allHours = await pool.query(getVolunteerHoursQuery(conditions), [userId]);
    res.status(200).json(keysToCamel(allHours.rows));
  } catch (err) {
    res.status(400).json(err.message);
  }
});

volunteerHoursRouter.get('/approve/:userId/:eventId', async (req, res) => {
  try {
    const { userId, eventId } = req.params;
    await pool.query(
      `UPDATE volunteer_at_events SET approved = true WHERE user_id = '${userId}' AND event_id = '${eventId}'`,
    );
    res.status(200).json();
  } catch (err) {
    res.status(500).json(err.message);
  }
});

volunteerHoursRouter.get('/decline/:userId/:eventId', async (req, res) => {
  try {
    const { userId, eventId } = req.params;
    await pool.query(
      `UPDATE volunteer_at_events SET approved = false, declined = true WHERE user_id = '${userId}' AND event_id = '${eventId}'`,
    );
    res.status(200).json();
  } catch (err) {
    res.status(500).json(err.message);
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

    const conditions = `WHERE volunteer_at_events.user_id = $(userId) AND
                              volunteer_at_events.event_id = $(eventId)`;
    const unsubmittedHours = await db.multi(
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
      RETURNING *;
      ${getVolunteerHoursQuery(conditions)}`,
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
    res.status(200).json(keysToCamel(unsubmittedHours.pop()[0]));
  } catch (err) {
    res.status(400).json(err.message);
  }
});

// submitHours
// volunteerHoursRouter.put('/submit', async (req, res) => {
//   try {
//     const { userId, eventId, startDatetime, endDatetime, approved, notes } = req.body;
//     const start = new Date(startDatetime);
//     const end = new Date(endDatetime);
//     const diff = end.getTime() - start.getTime();
//     const numHours = parseInt(diff / (60000 * 60), 10);

//     const createdHours = await db.query(
//       `UPDATE volunteer_hours
//         SET start_datetime = $(startDatetime), end_datetime = $(endDatetime),
//           approved = $(approved), num_hours = $(numHours),
//           notes = $(notes), submitted = true
//         WHERE user_id = $(userId) AND event_id = $(eventId)
//         RETURNING *;
//       `,
//       {
//         userId,
//         eventId,
//         startDatetime,
//         endDatetime,
//         approved,
//         numHours,
//         notes,
//       },
//     );
//     if (createdHours.rows.length === 0) {
//       res.status(400).json();
//     } else {
//       res.status(200).json(createdHours.rows);
//     }
//   } catch (err) {
//     res.status(500).json(err.message);
//   }
// });

// getUnsubmittedHours
// volunteerHoursRouter.get('/unsubmitted', async (req, res) => {
//   try {
//     const unsubmittedHours = await pool.query(
//       'SELECT * FROM volunteer_hours WHERE submitted = False;',
//     );
//     res.status(200).json(unsubmittedHours.rows);
//   } catch (err) {
//     res.status(500).json(err.message);
//   }
// });

// getSubmittedHours
// volunteerHoursRouter.get('/submitted', async (req, res) => {
//   try {
//     const submittedHours = await pool.query(
//       'SELECT * FROM volunteer_hours WHERE submitted = True;',
//     );
//     res.status(200).json(submittedHours.rows);
//   } catch (err) {
//     res.status(500).json(err.message);
//   }
// });

// getUnsubmittedHoursByUserId
// volunteerHoursRouter.get('/unsubmittedUser/:id', async (req, res) => {
//   try {
//     const unsubmittedHours = await pool.query(
//       'SELECT v.start_datetime, v.end_datetime, v.num_hours, v.notes, e.name, e.event_id, v.start_datetime AS date FROM volunteer_hours v, event e WHERE v.event_id = e.event_id AND submitted = False AND user_id = $1 ORDER BY v.start_datetime',
//       [req.params.id],
//     );
//     res.status(200).json(unsubmittedHours.rows);
//   } catch (err) {
//     res.status(500).json(err.message);
//   }
// });

// getSubmittedHoursByUserId
// volunteerHoursRouter.get('/submittedUser/:id', async (req, res) => {
//   try {
//     const submittedHours = await pool.query(
//       'SELECT v.approved, v.start_datetime, v.end_datetime, v.num_hours, v.notes, e.name, v.start_datetime AS date FROM volunteer_hours v, event e WHERE v.event_id = e.event_id AND submitted = True AND user_id = $1 ORDER BY v.start_datetime',
//       [req.params.id],
//     );
//     res.status(200).json(submittedHours.rows);
//   } catch (err) {
//     res.status(500).json(err.message);
//   }
// });

// getVolunteerStatistics
// volunteerHoursRouter.get('/statistics/:id', async (req, res) => {
//   try {
//     const volunteerStats = await pool.query(
//       'SELECT COUNT(v.event_id) as event_count, SUM(v.num_hours) as hours FROM volunteer_hours v WHERE submitted = True AND user_id = $1',
//       [req.params.id],
//     );
//     res.status(200).json(volunteerStats.rows);
//   } catch (err) {
//     res.status(500).json(err.message);
//   }
// });
module.exports = volunteerHoursRouter;
