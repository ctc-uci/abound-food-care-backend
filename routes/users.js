const express = require('express');
const { pool, db } = require('../server/db');
const { keysToCamel, validateUserInfo } = require('./utils');

const userRouter = express();

const getUsers = (allUsers) =>
  `SELECT * FROM users
  ${allUsers ? '' : 'WHERE users.user_id = $1'};`;

// get a user
userRouter.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await pool.query(getUsers(false), [userId]);
    res.status(200).send(keysToCamel(user.rows[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// get all user
userRouter.get('/', async (req, res) => {
  try {
    const users = await pool.query(getUsers(true));
    res.status(200).send(keysToCamel(users.rows));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// create a user
userRouter.post('/', async (req, res) => {
  try {
    const {
      userId,
      firstName,
      lastName,
      role,
      organization,
      birthdate,
      email,
      phone,
      preferredContactMethod,
      addressStreet,
      addressZip,
      addressCity,
      addressState,
      weightLiftingAbility,
      criminalHistory,
      criminalHistoryDetails,
      duiHistory,
      duiHistoryDetails,
      completedChowmatchTraining,
      foodRunsInterest,
      distributionInterest,
      canDrive,
      willingToDrive,
      vehicleType,
      distance,
      firstAidTraining,
      serveSafeKnowledge,
      transportationExperience,
      movingWarehouseExperience,
      foodServiceIndustryKnowledge,
      languages,
      additionalInformation,
    } = req.body;
    validateUserInfo(
      phone,
      addressZip,
      weightLiftingAbility,
      criminalHistory,
      duiHistory,
      completedChowmatchTraining,
      foodRunsInterest,
      distributionInterest,
      canDrive,
      willingToDrive,
      distance,
      firstAidTraining,
      serveSafeKnowledge,
      transportationExperience,
      movingWarehouseExperience,
      foodServiceIndustryKnowledge,
    );
    // sort languages so will always be in alphabetical order when retrieved
    languages.sort();
    await db.query(
      `INSERT INTO users (
        user_id, first_name, last_name, role, organization, birthdate, email,
        phone, preferred_contact_method, address_street, address_zip,
        address_city, address_state, weight_lifting_ability, criminal_history,
        ${criminalHistoryDetails ? 'criminal_history_details, ' : ''}
        dui_history,
        ${duiHistoryDetails ? 'dui_history_details, ' : ''}
        completed_chowmatch_training,
        ${foodRunsInterest ? 'food_runs_interest,' : ''}
        ${distributionInterest ? 'distribution_interest,' : ''}
        can_drive, willing_to_drive,
        ${vehicleType ? 'vehicle_type, ' : ''}
        ${distance ? 'distance, ' : ''}
        first_aid_training, serve_safe_knowledge, transportation_experience,
        moving_warehouse_experience, food_service_industry_knowledge, languages
        ${additionalInformation ? ', additional_information' : ''})
      VALUES (
        $(userId), $(firstName), $(lastName), $(role), $(organization), $(birthdate), $(email),
        $(phone), $(preferredContactMethod), $(addressStreet), $(addressZip), $(addressCity),
        $(addressState), $(weightLiftingAbility), $(criminalHistory),
        ${criminalHistoryDetails ? '$(criminalHistoryDetails), ' : ''}
        $(duiHistory),
        ${duiHistoryDetails ? '$(duiHistoryDetails), ' : ''}
        $(completedChowmatchTraining),
        ${foodRunsInterest ? '$(foodRunsInterest), ' : ''}
        ${distributionInterest ? '$(distributionInterest), ' : ''}
        $(canDrive), $(willingToDrive),
        ${vehicleType ? '$(vehicleType), ' : ''}
        ${distance ? '$(distance), ' : ''}
        $(firstAidTraining), $(serveSafeKnowledge), $(transportationExperience),
        $(movingWarehouseExperience), $(foodServiceIndustryKnowledge), $(languages)
        ${additionalInformation ? ', $(additionalInformation)' : ''});`,
      {
        userId,
        firstName,
        lastName,
        role,
        organization,
        birthdate,
        email,
        phone,
        preferredContactMethod,
        addressStreet,
        addressZip,
        addressCity,
        addressState,
        weightLiftingAbility,
        criminalHistory,
        criminalHistoryDetails,
        duiHistory,
        duiHistoryDetails,
        completedChowmatchTraining,
        foodRunsInterest,
        distributionInterest,
        canDrive,
        willingToDrive,
        vehicleType,
        distance,
        firstAidTraining,
        serveSafeKnowledge,
        transportationExperience,
        movingWarehouseExperience,
        foodServiceIndustryKnowledge,
        languages,
        additionalInformation,
      },
    );
    const user = await pool.query(getUsers(false), [userId]);
    res.status(200).json(keysToCamel(user.rows[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// update a user
userRouter.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      firstName,
      lastName,
      role,
      organization,
      birthdate,
      email,
      phone,
      preferredContactMethod,
      addressStreet,
      addressZip,
      addressCity,
      addressState,
      weightLiftingAbility,
      criminalHistory,
      criminalHistoryDetails,
      duiHistory,
      duiHistoryDetails,
      completedChowmatchTraining,
      foodRunsInterest,
      distributionInterest,
      canDrive,
      willingToDrive,
      vehicleType,
      distance,
      firstAidTraining,
      serveSafeKnowledge,
      transportationExperience,
      movingWarehouseExperience,
      foodServiceIndustryKnowledge,
      languages,
      additionalInformation,
    } = req.body;
    validateUserInfo(
      phone,
      addressZip,
      weightLiftingAbility,
      criminalHistory,
      duiHistory,
      completedChowmatchTraining,
      foodRunsInterest,
      distributionInterest,
      canDrive,
      willingToDrive,
      distance,
      firstAidTraining,
      serveSafeKnowledge,
      transportationExperience,
      movingWarehouseExperience,
      foodServiceIndustryKnowledge,
    );
    // sort languages so will always be in alphabetical order when retrieved
    languages.sort();
    await db.query(
      `UPDATE users
      SET
        first_name = $(firstName),
        last_name = $(lastName),
        role = $(role),
        organization = $(organization),
        birthdate = $(birthdate),
        email = $(email),
        phone = $(phone),
        preferred_contact_method = $(preferredContactMethod),
        address_street = $(addressStreet),
        address_zip = $(addressZip),
        address_city = $(addressCity),
        address_state = $(addressState),
        weight_lifting_ability = $(weightLiftingAbility),
        criminal_history = $(criminalHistory),
        ${criminalHistoryDetails ? 'criminal_history_details = $(criminalHistoryDetails), ' : ''}
        dui_history = $(duiHistory),
        ${duiHistoryDetails ? 'dui_history_details = $(duiHistoryDetails), ' : ''}
        completed_chowmatch_training = $(completedChowmatchTraining),
        ${foodRunsInterest ? 'food_runs_interest = $(foodRunsInterest), ' : ''}
        ${distributionInterest ? 'distribution_interest = $(distributionInterest), ' : ''}
        can_drive = $(canDrive),
        willing_to_drive = $(willingToDrive),
        ${vehicleType ? 'vehicle_type = $(vehicleType), ' : ''}
        ${distance ? 'distance = $(distance), ' : ''}
        first_aid_training = $(firstAidTraining),
        serve_safe_knowledge = $(serveSafeKnowledge),
        transportation_experience = $(transportationExperience),
        moving_warehouse_experience = $(movingWarehouseExperience),
        food_service_industry_knowledge = $(foodServiceIndustryKnowledge),
        languages = $(languages)
        ${additionalInformation ? ', additional_information = $(additionalInformation)' : ''}
      WHERE user_id = $(userId);`,
      {
        firstName,
        lastName,
        role,
        organization,
        birthdate,
        email,
        phone,
        preferredContactMethod,
        addressStreet,
        addressZip,
        addressCity,
        addressState,
        weightLiftingAbility,
        criminalHistory,
        criminalHistoryDetails,
        duiHistory,
        duiHistoryDetails,
        completedChowmatchTraining,
        foodRunsInterest,
        distributionInterest,
        canDrive,
        willingToDrive,
        vehicleType,
        distance,
        firstAidTraining,
        serveSafeKnowledge,
        transportationExperience,
        movingWarehouseExperience,
        foodServiceIndustryKnowledge,
        languages,
        additionalInformation,
        userId,
      },
    );
    const user = await pool.query(getUsers(false), [userId]);
    res.status(200).send(keysToCamel(user.rows[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// delete a user
userRouter.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const deletedUser = await pool.query(
      `DELETE FROM users
      WHERE user_id = $1
      RETURNING *;`,
      [userId],
    );
    res.status(200).send(keysToCamel(deletedUser.rows[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get volunteers endpoint
// userRouter.get('/volunteers', async (req, res) => {
//   try {
//     const getVolunteers = await pool.query(`SELECT * FROM users WHERE u_type = 'volunteer';`);
//     res.status(200).json(getVolunteers.rows);
//   } catch (err) {
//     res.status(500).json(err.message);
//   }
// });

// get volunteer's events by id
// userRouter.get('/getEvents/:id', async (req, res) => {
//   try {
//     const getEvents = await pool.query(
//       'SELECT event_id FROM volunteer_at_events WHERE user_id = $1;',
//       [req.params.id],
//     );
//     res.status(200).json(getEvents.rows);
//   } catch (err) {
//     res.status(500).json(err.message);
//   }
// });

// get languages of user by their id
// userRouter.get('/getLanguages/:id', async (req, res) => {
//   try {
//     const getLanguages = await pool.query('SELECT language FROM language WHERE user_id = $1;', [
//       req.params.id,
//     ]);
//     res.status(200).json(getLanguages.rows);
//   } catch (err) {
//     res.status(400).json(err.message);
//   }
// });

module.exports = userRouter;
