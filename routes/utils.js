const pool = require('../db');

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

const dropNotifications = () => {
  try {
    pool.query("DELETE * FROM notifications WHERE timestamp < CURRENT_DATE - interval '1 week'");
  } catch (e) {
    console.error('error deleting notifications from table');
  }
};

const addNotification = (notificationName, description) => {
  try {
    dropNotifications();
    const timestamp = Date.now();
    const existingNotif = pool.query(
      'SELECT * FROM notification WHERE eventName = $1',
      notificationName,
    );
    if (existingNotif.rows) {
      // update timestamp + description
      const updatedNotif = pool.query(
        'UPDATE notification SET name = $1, description = $2, timestamp = $3 WHERE name = $4',
        [notificationName, description, timestamp, notificationName],
      );
      return updatedNotif.rows[0];
    }
    // add new notif
    const newNotif = pool.query(
      'INSERT INTO notification(name, description, timestamp) VALUES ($1, $2, $3)',
      [notificationName, description, timestamp],
    );
    return newNotif.rows[0];
  } catch (e) {
    console.error('error adding notification to table');
    return null;
  }
};

module.exports = {
  isNumeric,
  isBoolean,
  isZipCode,
  isAlphaNumeric,
  isPhoneNumber,
  keysToCamel,
  addNotification,
};
