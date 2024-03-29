const express = require('express');
const Fuse = require('fuse.js');
const { db, pool } = require('../../server/db');
const { isBoolean, isNumeric, keysToCamel } = require('../utils');

const volunteerRouter = express();

const driverOptions = {
  All: 'TRUE',
  'Can Drive': 'users.willing_to_drive',
  'Cannot Drive': 'NOT users.willing_to_drive',
};

const ageOptions = {
  All: 'TRUE',
  Adult: `date_part('year', age(users.birthdate)) >= 18`,
  Minor: `date_part('year', age(users.birthdate)) < 18`,
};

const eventOptions = {
  All: 'TRUE',
  Distributions: 'users.distribution_interest',
  'Food Running': 'users.food_runs_interest',
};

// get all volunteers
volunteerRouter.get('/', async (req, res) => {
  try {
    const { driverOption, ageOption, eventInterest, searchQuery } = req.query;
    const driverCondition = driverOptions[driverOption] ?? '';
    const ageCondition = ageOptions[ageOption] ?? '';
    const eventCondition = eventOptions[eventInterest] ?? '';

    const driverQuery = driverCondition ? ` AND  ${driverCondition}` : '';
    const ageQuery = ageCondition ? ` AND  ${ageCondition}` : '';
    const eventQuery = eventCondition ? ` AND  ${eventCondition}` : '';

    const query = `SELECT users.*, availability.availabilities
    FROM users
      LEFT JOIN
        (SELECT user_id, array_agg(to_jsonb(availability.*) - 'user_id' ORDER BY availability.day_of_week) AS availabilities
          FROM availability
          GROUP BY user_id) AS availability on availability.user_id = users.user_id
    WHERE users.role = 'volunteer' ${driverQuery} ${ageQuery} ${eventQuery}
    ORDER BY users.first_name, users.last_name`; // issue with undefined driverCondition & eventCondition

    const { rows: volunteers } = await pool.query(query);
    if (searchQuery) {
      const options = {
        keys: ['first_name', 'last_name', 'email', 'phone', 'address_city', 'address_state'],
        threshold: 0.2,
      };
      const searchVolunteers = new Fuse(volunteers, options)
        .search(searchQuery)
        .map((result) => result.item);
      res.status(200).json(keysToCamel(searchVolunteers));
    } else {
      res.status(200).json(keysToCamel(volunteers));
    }
  } catch (err) {
    res.status(400).json(err.message);
  }
});

volunteerRouter.get('/available', async (req, res) => {
  try {
    const { driverOption, eventInterest, searchQuery } = req.query;
    const driverCondition = driverOptions[driverOption] ?? '';
    const eventCondition = eventOptions[eventInterest] ?? '';

    const resData = {};

    const driverQuery = driverCondition ? ` AND  ${driverCondition}` : '';
    const eventQuery = eventCondition ? ` AND  ${eventCondition}` : '';
    // assume startTime and endTime is a timestamp
    const { rows: volunteers } = await pool.query(
      `SELECT
        availability.user_id,
        availability.day_of_week,
        availability.start_time,
        availability.end_time,
        users.user_id,
        users.first_name,
        users.last_name,
        users.can_drive
      FROM users
      INNER JOIN availability
      ON users.user_id = availability.user_id ${driverQuery} ${eventQuery}`, // issue with undefined driverCondition & eventCondition
      [],
    );

    if (searchQuery) {
      const options = {
        keys: ['first_name', 'last_name', 'email', 'phone', 'address_city', 'address_state'],
        threshold: 0.2,
      };
      const searchedVolunteers = new Fuse(volunteers, options)
        .search(searchQuery)
        .map((result) => result.item);
      searchedVolunteers.forEach((volunteerHour) => {
        const startTime = volunteerHour.start_time.substring(0, 5);
        const endTime = volunteerHour.end_time.substring(0, 5);
        const day = volunteerHour.day_of_week;

        resData[`${day} ${startTime} to ${endTime}`] =
          (resData[`${day} ${startTime} to ${endTime}`] ?? 0) + 1;
      });
    } else {
      volunteers.forEach((volunteerHour) => {
        const startTime = volunteerHour.start_time.substring(0, 5);
        const endTime = volunteerHour.end_time.substring(0, 5);
        const day = volunteerHour.day_of_week;

        resData[`${day} ${startTime} to ${endTime}`] =
          (resData[`${day} ${startTime} to ${endTime}`] ?? 0) + 1;
      });
    }

    res.status(200).json(keysToCamel(resData));
  } catch (err) {
    res.status(400).json(err.message);
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
    res.status(200).json(keysToCamel(eventIds.rows));
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

// get all events a volunteer is signed up for if they are submitted
volunteerRouter.get('/logs/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { submitted } = req.query;
    const submittedEvents = await db.query(
      `SELECT volunteer_at_events.event_id, events.name,
      volunteer_at_events.start_datetime, volunteer_at_events.end_datetime, volunteer_at_events.num_hours,
      volunteer_at_events.submitted, volunteer_at_events.approved, volunteer_at_events.declined
      FROM volunteer_at_events LEFT JOIN events
	    ON events.event_id = volunteer_at_events.event_id
      WHERE user_id = $(userId) ${submitted != null ? 'AND submitted = $(submitted)' : ''}
      GROUP BY volunteer_at_events.event_id, events.name, volunteer_at_events.start_datetime, volunteer_at_events.end_datetime, volunteer_at_events.num_hours, volunteer_at_events.submitted, volunteer_at_events.approved, volunteer_at_events.declined`,
      { userId, submitted },
    );
    res.status(200).json(keysToCamel(submittedEvents));
  } catch (err) {
    res.status(400).json(err.message);
  }
});

// get available volunteers at specific date and time
volunteerRouter.get('/available/day/:day/start/:startTime/end/:endTime', async (req, res) => {
  try {
    const { driverOption, ageOption, eventInterest, searchQuery } = req.query;
    const { day } = req.params;
    const driverCondition = driverOptions[driverOption] ?? '';
    const ageCondition = ageOptions[ageOption] ?? '';
    const eventCondition = eventOptions[eventInterest] ?? '';

    const driverQuery = driverCondition ? ` AND  ${driverCondition}` : '';
    const ageQuery = ageCondition ? ` AND  ${ageCondition}` : '';
    const eventQuery = eventCondition ? ` AND  ${eventCondition}` : '';
    const endTime = req.params.endTime.replace('-', ':');
    const startTime = req.params.startTime.replace('-', ':');
    // assume startTime and endTime is a timestamp
    const { rows: volunteers } = await pool.query(
      `SELECT users.*
      FROM availability INNER JOIN users on users.user_id = availability.user_id
      WHERE availability.day_of_week = $1 and availability.start_time = $2 and availability.end_time = $3
      AND users.role = 'volunteer' ${driverQuery} ${ageQuery} ${eventQuery}`,
      [day, `${startTime}PST`, `${endTime}PST`],
    );
    if (searchQuery) {
      const options = {
        keys: ['first_name', 'last_name', 'email', 'phone', 'address_city', 'address_state'],
        threshold: 0.2,
      };
      const searchVolunteers = new Fuse(volunteers, options)
        .search(searchQuery)
        .map((result) => result.item);
      res.status(200).json(keysToCamel(searchVolunteers));
    } else {
      res.status(200).json(keysToCamel(volunteers));
    }
  } catch (err) {
    res.status(500).json(err);
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

// Sets an event to submitted
volunteerRouter.post('/:userId/:eventId/submit', async (req, res) => {
  try {
    const { userId, eventId } = req.params;
    isNumeric(eventId, 'Event Id must be a number');
    const signUp = await pool.query(
      `UPDATE volunteer_at_events
       SET submitted = TRUE
       WHERE user_id = $1 AND event_id = $2`,
      [userId, eventId],
    );
    res.status(200).json(keysToCamel(signUp.rows[0]));
  } catch (err) {
    res.status(400).json(err.message);
  }
});

// edit a volunteer's participation in an event
volunteerRouter.put('/:userId/:eventId', async (req, res) => {
  try {
    const { userId, eventId } = req.params;
    const { startDatetime, endDatetime, submitted } = req.body;
    if (submitted) {
      isBoolean(submitted);
    }

    let start;
    let end;
    let diff;
    let numHours;
    if (startDatetime) {
      start = new Date(startDatetime);
    }
    if (endDatetime) {
      end = new Date(endDatetime);
    }
    if (start && end) {
      diff = end.getTime() - start.getTime();
      numHours = parseInt(diff / (60000 * 60), 10);
    }
    const editedRow = await db.query(
      `UPDATE volunteer_at_events SET
      ${start ? 'start_datetime = $(startDatetime),' : ''}
      ${end ? 'end_datetime = $(endDatetime),' : ''}
      ${start && end ? 'num_hours = $(numHours),' : ''}
      ${submitted ? 'submitted = $(submitted),' : ''}
      user_id = $(userId)
      WHERE user_id = $(userId) AND event_id = $(eventId)
      RETURNING *`,
      { startDatetime, endDatetime, numHours, userId, eventId },
    );
    res.status(200).json(keysToCamel(editedRow[0]));
  } catch (err) {
    res.status(500).json(err.message);
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
