// endpoints related to events
const express = require('express');
const pool = require('../../db');

const userRouter = express();

userRouter.use(express.json());
userRouter.get('/volunteers', async (req, res) => {
  try {
    const getVolunteers = await pool.query('SELECT * FROM user WHERE type == 3;');
    res.json(getVolunteers.rows);
  } catch (err) {
    res.json();
    res.status(500);
  }
});
module.exports = userRouter;
