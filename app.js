const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

require('dotenv').config();

app.use(
  cors({
    origin: `${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`,
  }),
  express.json(),
);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

// ROUTES //

// Create Event Endpoint
app.post('/users/create', async (req, res) => {
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
    const createEvent = await pool.query(
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
    res.json(createEvent.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// Create User Endpoint
app.post('/users/create', async (req, res) => {
  try {
    const {
      type,
      name,
      birthdate,
      email,
      phone,
      preferContactMethod,
      city,
      physicalAddress,
      weightLiftingAbility,
      criminalDUIHistory,
      criminalDUIHistoryDetails,
      completedChowmatchTraining,
      foodRunsInterest,
      specializations,
      volunteeringRolesInterest,
      additionalInformation,
    } = req.body;
    const createUser = await pool.query(
      'INSERT INTO events(type, name, birthdate, email, phone, preferContactMethod, city, physicalAddress, weightLiftingAbility, criminalDUIHistory, criminalDUIHistoryDetails, completedChowmatchTraining, foodRunsInterest, specializations, volunteeringRolesInterest, additionalInformation) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *;',
      [
        type,
        name,
        birthdate,
        email,
        phone,
        preferContactMethod,
        city,
        physicalAddress,
        weightLiftingAbility,
        criminalDUIHistory,
        criminalDUIHistoryDetails,
        completedChowmatchTraining,
        foodRunsInterest,
        specializations,
        volunteeringRolesInterest,
        additionalInformation,
      ],
    );
    res.json(createUser.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});
