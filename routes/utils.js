const isNumeric = (value, errorMessage) => {
  if (!/^\d+$/.test(value)) {
    throw new Error(errorMessage);
  }
};

const isBoolean = (value, errorMessage) => {
  if (value !== 'true' && value !== 'false') {
    throw new Error(errorMessage);
  }
};

const isZipCode = (value, errorMessage) => {
  if (!/(^\d{5}$)|(^\d{5}-\d{4}$)/.test(value)) {
    throw new Error(errorMessage);
  }
};

const isAlphaNumeric = (value, errorMessage) => {
  if (!/^[0-9a-zA-Z]+$/.test(value)) {
    throw new Error(errorMessage);
  }
};

const isPhoneNumber = (value, errorMessage) => {
  if (!/^\d+$/.test(value) || value.length > 15) {
    throw new Error(errorMessage);
  }
};

// toCamel, isArray, and isObject are helper functions used within utils only
const toCamel = (s) => {
  return s.replace(/([-_][a-z])/g, ($1) => {
    return $1.toUpperCase().replace('-', '').replace('_', '');
  });
};

const isArray = (a) => {
  return Array.isArray(a);
};

const isISODate = (str) => {
  try {
    const ISOString = str.toISOString();
    if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(ISOString)) return false;
    const d = new Date(ISOString);
    return d.toISOString() === ISOString;
  } catch (err) {
    return false;
  }
};

const isObject = (o) => {
  return o === Object(o) && !isArray(o) && typeof o !== 'function' && !isISODate(o);
};

// Database columns are in snake case. JavaScript is suppose to be in camel case
// This function converts the keys from the sql query to camel case so it follows JavaScript conventions
const keysToCamel = (data) => {
  if (isObject(data)) {
    const newData = {};
    Object.keys(data).forEach((key) => {
      newData[toCamel(key)] = keysToCamel(data[key]);
    });
    return newData;
  }
  if (isArray(data)) {
    return data.map((i) => {
      return keysToCamel(i);
    });
  }
  return data;
};

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

module.exports = {
  isNumeric,
  isBoolean,
  isZipCode,
  isAlphaNumeric,
  isPhoneNumber,
  keysToCamel,
  validateUserInfo,
};
