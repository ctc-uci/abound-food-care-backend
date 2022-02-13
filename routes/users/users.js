// endpoints related to events
const express = require('express');
const pool = require('../../db');

const userRouter = express();

userRouter.use(express.json());
userRouter.get('/volunteers', async (req, res) => {
  try {
    const getVolunteers = await pool.query("SELECT * FROM users WHERE u_type = 'volunteer';");
    res.status(200).json(getVolunteers.rows);
  } catch (err) {
    res.status(400).json(err);
  }
});
module.exports = userRouter;
