// endpoints related to users
const express = require('express');
const pool = require('../../db');

const userRouter = express();

userRouter.use(express.json());

// create user endpoint
userRouter.post('/create', async (req, res) => {
  try {
    const {
      birthdate,
      email,
      phone,
      preferredContactMethod,
      weightLiftingAbility,
      criminalHistory,
      duiHistory,
      criminalHistoryDetails,
      duiHistoryDetails,
      completedChowmatchTraining,
      foodRunsInterest,
      specializations,
      volunteeringRolesInterest,
      additionalInformation,
      uType,
      canDrive,
      role,
      physicalAddress,
      city,
      state,
      zipcode,
      firstName,
      lastName,
    } = req.body;

    const createUser = await pool.query(
      `INSERT INTO users(
        birthdate,
        email,
        phone,
        preferred_contact_method,
        weight_lifting_ability,
        criminal_history,
        dui_history,
        criminal_history_details,
        dui_history_details,
        completed_chowmatch_training,
        food_runs_interest,
        specializations,
        volunteering_roles_interest,
        additional_information,
        u_type,
        can_drive,
        role,
        physical_address,
        city,
        state,
        zipcode,
        first_name,
        last_name
      ) VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14,
        $15,
        $16,
        $17,
        $18,
        $19,
        $20,
        $21,
        $22,
        $23
      ) RETURNING *;`,
      [
        birthdate,
        email,
        phone,
        preferredContactMethod,
        weightLiftingAbility,
        criminalHistory,
        duiHistory,
        criminalHistoryDetails,
        duiHistoryDetails,
        completedChowmatchTraining,
        foodRunsInterest,
        specializations,
        volunteeringRolesInterest,
        additionalInformation,
        uType,
        canDrive,
        role,
        physicalAddress,
        city,
        state,
        zipcode,
        firstName,
        lastName,
      ],
    );
    res.status(200).json(createUser.rows);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

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
    const getVolunteers = await pool.query(`SELECT * FROM users WHERE u_type = 'volunteer';`);
    res.status(200).json(getVolunteers.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// get volunteer's events by id
userRouter.get('/getEvents/:id', async (req, res) => {
  try {
    const getEvents = await pool.query(
      'SELECT event_id FROM volunteer_at_events WHERE user_id = $1;',
      [req.params.id],
    );
    res.status(200).json(getEvents.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// get languages of user by their id
userRouter.get('/getLanguages/:id', async (req, res) => {
  try {
    const getLanguages = await pool.query('SELECT language FROM language WHERE user_id = $1;', [
      req.params.id,
    ]);
    res.status(200).json(getLanguages.rows);
  } catch (err) {
    res.status(400).json(err.message);
  }
});

module.exports = userRouter;
