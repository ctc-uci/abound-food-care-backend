// endpoints related to volunteer hours
const express = require('express');
const pool = require('../../db');

const volunteerRouter = express();

volunteerRouter.use(express.json());

volunteerRouter.get('/available', async (req, res) => {
  try {
    // get params (hour and day)
    const { endTime, startTime, day } = req.body;
    // assume startTime and endTime is a timestamp
    const volunteers = await pool.query(
      'SELECT u.name FROM availability a INNER JOIN "users" u on u.id = a.user_id WHERE day_of_week = $1 and start_time = $2 and end_time = $3',
      [day, startTime, endTime],
    );
    res.status(200).json(volunteers.rows);
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = volunteerRouter;
