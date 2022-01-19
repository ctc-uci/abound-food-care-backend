// endpoints related to events
const express = require('express');

const userRouter = express();
const pool = require('../../db');

userRouter.use(express.json());

// Create User Endpoint
userRouter.post('/users/create', async (req, res) => {
  try {
    const {
      name,
      ntype,
      location,
      startDateTime,
      endDateTime,
      volunteerType,
      volunteerRequirements,
      volunteerCapacity,
      fileAttachments,
      notes,
    } = req.body;
    const createUser = await pool.query(
      'INSERT INTO users(name, ntype, location, startDateTime, endDateTime, volunteerType, volunteerCapacity, fileAttachments, notes) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;',
      [
        name,
        ntype,
        location,
        startDateTime,
        endDateTime,
        volunteerType,
        volunteerRequirements,
        volunteerCapacity,
        fileAttachments,
        notes,
      ],
    );
    res.json(createUser.rows[0]);
  } catch (err) {
    res.json();
  }
});

module.exports = userRouter;
