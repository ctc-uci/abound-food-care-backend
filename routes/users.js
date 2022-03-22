const express = require('express');
const { pool, db } = require('../server/db');
const { isNumeric, isZipCode, isPhoneNumber, isBoolean, keysToCamel } = require('./utils');

const userRouter = express();

// get a user
userRouter.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    isNumeric(userId, 'User Id must be a Number');
    const user = await pool.query(`SELECT * FROM users WHERE user_id = $1`, [userId]);
    res.status(200).send(keysToCamel(user.rows[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// get all user
userRouter.get('/', async (req, res) => {
  try {
    const users = await pool.query(`SELECT * FROM users`);
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
      additionalInformation,
    } = req.body;
    isPhoneNumber(phone, 'Invalid Phone Number');
    isZipCode(addressZip, 'Invalid Zip Code');
    isNumeric(weightLiftingAbility, 'Weight Lifting Ability is not a Number');
    isBoolean(criminalHistory, 'Criminal History is not a Boolean Value');
    isBoolean(duiHistory, 'DUI History is not a Boolean Value');
    isBoolean(completedChowmatchTraining, 'Completed Chowmatch Training is not a Boolean Value');
    if (foodRunsInterest) {
      isBoolean(foodRunsInterest, 'Food Runs Interest is not a Boolean Value');
    }
    if (distributionInterest) {
      isBoolean(distributionInterest, 'Distribution Interest is not a Boolean Value');
    }
    isBoolean(canDrive, 'Can Drive is not a Boolean Value');
    isBoolean(willingToDrive, 'Willing To Drive is not a Boolean Value');
    if (distance) {
      isNumeric(distance, 'Distance is not a Number');
    }
    isBoolean(firstAidTraining, 'First Aid Training is not a Boolean Value');
    isBoolean(serveSafeKnowledge, 'Server Save Knowledge is not a Boolean Value');
    isBoolean(transportationExperience, 'Transportation Experience is not a Boolean Value');
    isBoolean(movingWarehouseExperience, 'Moving Warehouse Experience is not a Boolean Value');
    isBoolean(
      foodServiceIndustryKnowledge,
      'Food Service Industry Knowledge is not a Boolean Value',
    );
    const newUser = await db.query(
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
        moving_warehouse_experience, food_service_industry_knowledge
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
        $(movingWarehouseExperience), $(foodServiceIndustryKnowledge)
        ${additionalInformation ? ', $(additionalInformation)' : ''})
      RETURNING *;`,
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
        additionalInformation,
      },
    );
    res.status(200).json(keysToCamel(newUser[0]));
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
