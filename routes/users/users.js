// endpoints related to events
const express = require('express');

const pool = require('../../db');

const userRouter = express();

userRouter.use(express.json());

// create user endpoint
userRouter.post('/create', async (req, res) => {
  try {
    const {
      id,
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
      foodRunsInterest,
      specializations,
      volunteeringRolesInterest,
      additionalInformation,
    } = req.body;

    const createUser = await pool.query(
      'INSERT INTO users(id, u_type, name, birthdate, email, phone, preferred_contact_method, city, physical_address, weight_lifting_ability, criminal_history, dui_history, dui_history_details, criminal_history_details, completed_chowmatch_training, food_runs_interest, specializations, volunteering_roles_interest, additional_information) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *;',
      [
        id,
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
        foodRunsInterest,
        specializations,
        volunteeringRolesInterest,
        additionalInformation,
      ],
    );
    res.status(200).json(createUser.rows);
  } catch (err) {
    console.error(err);
    res.status(400).send(err);
  }
});

module.exports = userRouter;
