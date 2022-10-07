const express = require('express');
const { pool, db } = require('../../server/db');
const { keysToCamel, getUsersQuery } = require('../utils');
const {
  validateGeneralInfo,
  validateRolesAndSkills,
  validateDUICriminal,
  validateAllUserInfo,
} = require('./usersUtils');
const updateAvailabilities = require('./availabilityUtils');

const userRouter = express();

// get a user
userRouter.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const conditions = 'WHERE users.user_id = $1';
    const user = await pool.query(getUsersQuery(conditions), [userId]);
    res.status(200).send(keysToCamel(user.rows[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// get all users
userRouter.get('/', async (req, res) => {
  try {
    const users = await pool.query(getUsersQuery());
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
      availabilities,
    } = req.body;
    validateAllUserInfo(
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
        ${additionalInformation ? ', $(additionalInformation)' : ''})`,
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
    const userInfo = await updateAvailabilities(availabilities, userId, getUsersQuery);
    res.status(200).json(keysToCamel(userInfo));
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
      availabilities,
    } = req.body;

    validateAllUserInfo(
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
    const vehicleTypeValue = vehicleType === 'NULL' ? undefined : vehicleType;
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
        ${vehicleType ? 'vehicle_type = $(vehicleTypeValue), ' : ''}
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
        vehicleTypeValue,
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
    const updatedUser = await updateAvailabilities(availabilities, userId, getUsersQuery, true);
    res.status(200).send(keysToCamel(updatedUser));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// update user general information
userRouter.put('/general-info/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      organization,
      phone,
      preferredContactMethod,
      addressStreet,
      addressCity,
      addressZip,
      addressState,
    } = req.body;
    validateGeneralInfo(phone, addressZip);
    await db.query(
      `UPDATE users
      SET
        organization = $(organization),
        phone = $(phone),
        preferred_contact_method = $(preferredContactMethod),
        address_street = $(addressStreet),
        address_zip = $(addressZip),
        address_city = $(addressCity),
        address_state = $(addressState)
    WHERE user_id = $(userId)
    RETURNING *;`,
      {
        organization,
        phone,
        preferredContactMethod,
        addressStreet,
        addressZip,
        addressCity,
        addressState,
        userId,
      },
    );
    const conditions = 'WHERE users.user_id = $1';
    const updatedUser = await pool.query(getUsersQuery(conditions), [userId]);
    res.status(200).send(keysToCamel(updatedUser.rows[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// update user availability
userRouter.put('/availability/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { availabilities } = req.body;
    const updatedUser = await updateAvailabilities(availabilities, userId, getUsersQuery, true);
    res.status(200).json(keysToCamel(updatedUser));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// update user role and skills
userRouter.put('/roles-skills/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      role,
      foodRunsInterest,
      distributionInterest,
      firstAidTraining,
      serveSafeKnowledge,
      transportationExperience,
      movingWarehouseExperience,
      foodServiceIndustryKnowledge,
      languages,
      weightLiftingAbility,
      completedChowmatchTraining,
      canDrive,
      willingToDrive,
      vehicleType,
      distance,
    } = req.body;
    validateRolesAndSkills(
      foodRunsInterest,
      distributionInterest,
      firstAidTraining,
      serveSafeKnowledge,
      transportationExperience,
      movingWarehouseExperience,
      foodServiceIndustryKnowledge,
      weightLiftingAbility,
      completedChowmatchTraining,
      canDrive,
      willingToDrive,
      distance,
    );
    const updatedUser = await db.query(
      `UPDATE users
      SET
        role = $(role),
        food_runs_interest = $(foodRunsInterest),
        distribution_interest = $(distributionInterest),
        can_drive = $(canDrive),
        willing_to_drive = $(willingToDrive),
        ${vehicleType ? 'vehicle_type = $(vehicleType), ' : ''}
        ${distance ? 'distance = $(distance), ' : ''}
        first_aid_training = $(firstAidTraining),
        serve_safe_knowledge = $(serveSafeKnowledge),
        transportation_experience = $(transportationExperience),
        moving_warehouse_experience = $(movingWarehouseExperience),
        food_service_industry_knowledge = $(foodServiceIndustryKnowledge),
        languages = $(languages),
        weight_lifting_ability = $(weightLiftingAbility),
        completed_chowmatch_training = $(completedChowmatchTraining)
      WHERE user_id = $(userId) RETURNING *;`,
      {
        role,
        foodRunsInterest,
        distributionInterest,
        firstAidTraining,
        serveSafeKnowledge,
        transportationExperience,
        movingWarehouseExperience,
        foodServiceIndustryKnowledge,
        languages,
        weightLiftingAbility,
        completedChowmatchTraining,
        canDrive,
        willingToDrive,
        vehicleType,
        distance,
        userId,
      },
    );
    res.status(200).send(keysToCamel(updatedUser[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// update user DUI and criminal history
userRouter.put('/dui-criminal/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      criminalHistory,
      criminalHistoryDetails,
      duiHistory,
      duiHistoryDetails,
      additionalInformation,
    } = req.body;
    validateDUICriminal(criminalHistory, duiHistory);
    await db.query(
      `UPDATE users
      SET
        criminal_history = $(criminalHistory),
        ${criminalHistoryDetails ? 'criminal_history_details = $(criminalHistoryDetails), ' : ''}
        dui_history = $(duiHistory)
        ${duiHistoryDetails ? ', dui_history_details = $(duiHistoryDetails)' : ''}
        ${additionalInformation ? ', additional_information = $(additionalInformation)' : ''}
      WHERE user_id = $(userId);`,
      {
        criminalHistory,
        criminalHistoryDetails,
        duiHistory,
        duiHistoryDetails,
        additionalInformation,
        userId,
      },
    );
    const conditions = 'WHERE users.user_id = $1';
    const updatedUser = await pool.query(getUsersQuery(conditions), [userId]);
    res.status(200).send(keysToCamel(updatedUser.rows[0]));
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

module.exports = userRouter;
