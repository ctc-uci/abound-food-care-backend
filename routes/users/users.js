// endpoints related to users
const express = require('express');
const pool = require('../../db');

const userRouter = express();

userRouter.use(express.json());

// Get user by id endpoint
userRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    res.status(200).json(user.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// Get volunteers endpoint
userRouter.get('/volunteers', async (req, res) => {
  try {
    const getVolunteers = await pool.query("SELECT * FROM users WHERE u_type = 'volunteer';");
    res.status(200).json(getVolunteers.rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = userRouter;
