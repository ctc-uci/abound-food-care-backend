// endpoints related to events
const express = require('express');
const pool = require('../../db');

const userRouter = express();

userRouter.use(express.json());
userRouter.get('/volunteers', async (req, res) => {
  try {
    const getVolunteers = await pool.query("SELECT * FROM users WHERE u_type = 'volunteer';");
    res.json(getVolunteers.rows);
    res.send(200);
  } catch (err) {
    res.json();
    res.status(500);
  }
});
module.exports = userRouter;
