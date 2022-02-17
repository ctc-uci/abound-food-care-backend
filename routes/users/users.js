// endpoints related to events
const express = require('express');
const pool = require('../../db');

const userRouter = express();

userRouter.use(express.json());

// Get user by id endpoint
userRouter.get('/users/:id', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
    res.json(user.rows[0]);
  } catch (err) {
    res.json();
  }
});

// Get volunteers endpoint
userRouter.get('/volunteers', async (req, res) => {
  try {
    const getVolunteers = await pool.query("SELECT * FROM users WHERE u_type = 'volunteer';");
    res.status(200).json(getVolunteers.rows);
  } catch (err) {
    res.status(400).json(err);
  }
});
module.exports = userRouter;
