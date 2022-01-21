// endpoints related to volunteer hours
const express = require('express');
const pool = require('../../db');

const hoursRouter = express();

hoursRouter.use(express.json());

hoursRouter.get('/unapproved', async (req, res) => {
  try {
    const unapprovedHours = await pool.query(
      'SELECT * FROM volunteer_hours WHERE approved = False;',
    );
    res.json(unapprovedHours.rows);
  } catch (err) {
    res.json();
  }
});

module.exports = hoursRouter;
