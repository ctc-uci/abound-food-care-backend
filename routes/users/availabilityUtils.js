const { db } = require('../../server/db');

const addAvailabilityQuery = (dayOfWeekKey, startTimeKey, endTimeKey) =>
  `INSERT INTO availability (user_id, day_of_week, start_time, end_time)
  VALUES ($(userId), $(${dayOfWeekKey}), $(${startTimeKey}), $(${endTimeKey}));`;

const addAvailabilitiesQuery = (availabilities) => {
  let query = ``;
  availabilities.forEach((availability) => {
    query += addAvailabilityQuery(...Object.keys(availability));
  });
  return query;
};

const updateAvailabilities = async (
  availabilities,
  userId,
  getQuery,
  deletedPreviousAvail = false,
) => {
  const availabilityQueryObject = availabilities.reduce(
    (availabilityArray, availability, index) => [
      ...availabilityArray,
      {
        [`dayOfWeek${index}`]: availability.dayOfWeek,
        [`startTime${index}`]: availability.startTime,
        [`endTime${index}`]: availability.endTime,
      },
    ],
    [],
  );
  const conditions = `WHERE availability.user_id = $(userId)`;
  const results = await db.multi(
    `${deletedPreviousAvail ? 'DELETE FROM availability WHERE user_id = $(userId);' : ''}
    ${addAvailabilitiesQuery(availabilityQueryObject)}
    ${getQuery(conditions)}`,
    {
      ...availabilityQueryObject.reduce(
        (combinedAvail, avail) => ({ ...combinedAvail, ...avail }),
        {},
      ),
      userId,
    },
  );
  return results.pop()[0];
};

module.exports = updateAvailabilities;
