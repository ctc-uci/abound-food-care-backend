// endpoints related to users
const express = require('express');
const pool = require('../../db');

const userRouter = express();

// use this admin object in the future when you want to delete a user by id
// const admin = require('../firebase');
// ex: await admin.auth().deleteUser(userId);

userRouter.use(express.json());

// create user endpoint
userRouter.post('/create', async (req, res) => {
  try {
    const {
      uType,
      name,
      birthdate,
      email,
      phone,
      preferredContactMethod,
      city,
      physicalAddress,
      weightLiftingAbility,
      criminalHistory,
      duiHistory,
      duiHistoryDetails,
      criminalHistoryDetails,
      completedChowmatchTraining,
      canDrive,
      foodRunsInterest,
      specializations,
      volunteeringRolesInterest,
      additionalInformation,
    } = req.body;

    const createUser = await pool.query(
      'INSERT INTO users(u_type, name, birthdate, email, phone, preferred_contact_method, city, physical_address, weight_lifting_ability, criminal_history, dui_history, dui_history_details, criminal_history_details, completed_chowmatch_training, can_drive, food_runs_interest, specializations, volunteering_roles_interest, additional_information) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *;',
      [
        uType,
        name,
        birthdate,
        email,
        phone,
        preferredContactMethod,
        city,
        physicalAddress,
        weightLiftingAbility,
        criminalHistory,
        duiHistory,
        duiHistoryDetails,
        criminalHistoryDetails,
        completedChowmatchTraining,
        canDrive,
        foodRunsInterest,
        specializations,
        volunteeringRolesInterest,
        additionalInformation,
      ],
    );
    res.status(200).json(createUser.rows);
  } catch (err) {
    res.status(400).send(err);
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
    const getVolunteers = await pool.query("SELECT * FROM users WHERE u_type = 'volunteer';");
    res.status(200).json(getVolunteers.rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = userRouter;
