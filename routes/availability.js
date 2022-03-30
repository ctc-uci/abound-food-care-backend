const express = require('express');
const { pool, db } = require('../server/db');
const { keysToCamel } = require('./utils');

const availabilityRouter = express();

const getAvailabilitiesQuery = (conditions = '') =>
  `SELECT user_id, array_agg(to_jsonb(a.*) - 'user_id' ORDER BY a.day_of_week) as availabilities
  FROM availability as a
  ${conditions}
  GROUP BY user_id`;

const addAvailabilityQuery = (dayOfWeekKey, startTimeKey, endTimeKey) =>
  `INSERT INTO availability (user_id, day_of_week, start_time, end_time)
  VALUES ($(userId), $(${dayOfWeekKey}), $(${startTimeKey}), $(${endTimeKey}));`;

const addAvailabilitiesQuery = (availabilities) => {
  let query = ``;
  availabilities.forEach((availability) => {
    query += addAvailabilityQuery(...Object.keys(availability));
  });
  return query;
};

const updateAvailabilities = async (availabilities, userId, deletedPreviousAvail = false) => {
  const availabilityQueryObject = availabilities.reduce(
    (availabilityArray, availability, index) => [
      ...availabilityArray,
      {
        [`dayOfWeek${index}`]: availability.dayOfWeek,
        [`startTime${index}`]: availability.startTime,
        [`endTime${index}`]: availability.endTime,
      },
    ],
    [],
  );
  const conditions = `WHERE a.user_id = $(userId)`;
  const results = await db.multi(
    `${deletedPreviousAvail ? 'DELETE FROM availability WHERE user_id = $(userId);' : ''}
    ${addAvailabilitiesQuery(availabilityQueryObject)}
    ${getAvailabilitiesQuery(conditions)}`,
    {
      ...availabilityQueryObject.reduce(
        (combinedAvail, avail) => ({ ...combinedAvail, ...avail }),
        {},
      ),
      userId,
    },
  );
  return results.pop();
};

// get availability for a user
availabilityRouter.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const conditions = `WHERE user_id = $1`;
    const user = await pool.query(getAvailabilitiesQuery(conditions), [userId]);
    res.status(200).send(keysToCamel(user.rows[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// get all availability
availabilityRouter.get('/', async (req, res) => {
  try {
    const user = await pool.query(getAvailabilitiesQuery());
    res.status(200).send(keysToCamel(user.rows));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// add availability
availabilityRouter.post('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { availabilities } = req.body;
    const availabilties = await updateAvailabilities(availabilities, userId);
    res.status(200).send(keysToCamel(availabilties));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// update availability
availabilityRouter.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { availabilities } = req.body;
    const availabilties = await updateAvailabilities(availabilities, userId, true);
    res.status(200).send(keysToCamel(availabilties));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// delete availability
availabilityRouter.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await pool.query(`DELETE FROM availability WHERE user_id = $1 RETURNING *;`, [
      userId,
    ]);
    res.status(200).send(keysToCamel(user.rows));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = availabilityRouter;
