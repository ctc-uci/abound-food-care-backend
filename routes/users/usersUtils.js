const { isNumeric, isPhoneNumber, isBoolean, isZipCode, isArray } = require('../utils');

const validateGeneralInfo = (phone, addressZip) => {
  isPhoneNumber(phone, 'Invalid Phone Number');
  isZipCode(addressZip, 'Invalid Zip Code');
};

const validateRolesAndSkills = (
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
) => {
  isNumeric(weightLiftingAbility, 'Weight Lifting Ability is not a Number');
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
  isBoolean(foodServiceIndustryKnowledge, 'Food Service Industry Knowledge is not a Boolean Value');
};

const validateDUICriminal = (criminalHistory, duiHistory) => {
  isBoolean(criminalHistory, 'Criminal History is not a Boolean Value');
  isBoolean(duiHistory, 'DUI History is not a Boolean Value');
};

const validateAllUserInfo = (
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
) => {
  validateGeneralInfo(phone, addressZip);
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
  validateDUICriminal(criminalHistory, duiHistory);
};

const getIncrements = (startTime, endTime) => {
  let parsedStart = new Date(2000, 1, 0, startTime.slice(0, 2), startTime.slice(3, 5));
  const parsedEnd = new Date(2000, 1, 0, endTime.slice(0, 2), endTime.slice(3, 5));
  const increments = [];
  while (parsedStart.getTime() <= parsedEnd.getTime()) {
    const minutes = parsedStart.getMinutes().toString();
    const hours = parsedStart.getHours();
    increments.push(
      `${hours > 12 ? (hours - 12).toString() : hours.toString()}:${
        minutes.length === 1 ? '00' : minutes
      }`,
    );
    parsedStart = new Date(parsedStart.getTime() + 30 * 60000);
  }
  return increments;
};

const prettifyAvails = (userData) => {
  if (isArray(userData)) {
    return userData.map((i) => {
      return prettifyAvails(i);
    });
  }

  const { availabilities } = userData;
  if (!availabilities) {
    return userData;
  }

  const parsedAvails = {
    Sunday: [],
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  };
  availabilities.forEach(({ dayOfWeek, startTime, endTime }) => {
    parsedAvails[dayOfWeek].push(...getIncrements(startTime, endTime));
  });
  return { ...userData, availabilities: parsedAvails };
};

module.exports = {
  validateGeneralInfo,
  validateRolesAndSkills,
  validateDUICriminal,
  validateAllUserInfo,
  prettifyAvails,
};
