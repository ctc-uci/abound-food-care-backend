const { isNumeric, isPhoneNumber, isBoolean, isZipCode } = require('../utils');

const validateUserInfo = (
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
  isBoolean(foodServiceIndustryKnowledge, 'Food Service Industry Knowledge is not a Boolean Value');
};

module.exports = validateUserInfo;
