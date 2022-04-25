const { db } = require('../../server/db');

const getEventsQuery = (conditions = '') =>
  `SELECT events.*, requirements, waivers.waivers
  FROM events
    LEFT JOIN
      (SELECT req.event_id, array_agg(req.requirement ORDER BY req.requirement ASC) AS requirements
        FROM event_requirements AS req
        GROUP BY req.event_id) AS r on r.event_id = events.event_id
    LEFT JOIN
      (SELECT waivers.event_id, array_agg(to_jsonb(waivers.*) - 'event_id' ORDER BY waivers.name) AS waivers
        FROM waivers
        GROUP BY waivers.event_id) AS waivers on waivers.event_id = events.event_id
  ${conditions}
  ORDER BY start_datetime ASC;`;

const addRequirementQuery = (requirementKey) =>
  `INSERT INTO event_requirements (event_id, requirement)
  VALUES ($(eventId), $(${requirementKey}));`;

const addMulitRequirementsQuery = (requirementKeys) => {
  let query = ``;
  requirementKeys.forEach((requirementKey) => {
    query += addRequirementQuery(requirementKey);
  });
  return query;
};

const updateEventRequirements = async (requirements, eventId, deletePreviousReqs = false) => {
  const requirementQueryObject = requirements.reduce(
    (requirementObj, requirement, index) => ({ ...requirementObj, [`req${index}`]: requirement }),
    {},
  );
  const conditions = `WHERE events.event_id = $(eventId)`;
  const results = await db.multi(
    `${deletePreviousReqs ? 'DELETE FROM event_requirements WHERE event_id = $(eventId);' : ''}
    ${addMulitRequirementsQuery(Object.keys(requirementQueryObject))}
    ${getEventsQuery(conditions)}`,
    {
      ...requirementQueryObject,
      eventId,
    },
  );
  return results.pop()[0];
};

const addWaiverQuery = (name, link, uploadedDate) =>
  `INSERT INTO waivers (name, link, upload_date, event_id)
  VALUES ($(${name}), $(${link}), $(${uploadedDate}), $(eventId));`;

const addMulitWaiversQuery = (waivers) => {
  let query = ``;
  waivers.forEach((waiver) => {
    query += addWaiverQuery(...Object.keys(waiver));
  });
  return query;
};

const updateEventWaivers = async (waivers, eventId, deletePreviousWaivers = false) => {
  const waiverQueryObject = waivers.reduce(
    (waiverArray, waiver, index) => [
      ...waiverArray,
      {
        [`name${index}`]: waiver.name,
        [`link${index}`]: waiver.link,
        [`uploadDate${index}`]: new Date(),
      },
    ],
    [],
  );
  const conditions = `WHERE events.event_id = $(eventId)`;
  const results = await db.multi(
    `${deletePreviousWaivers ? 'DELETE FROM waivers WHERE event_id = $(eventId);' : ''}
    ${addMulitWaiversQuery(waiverQueryObject)}
    ${getEventsQuery(conditions)}`,
    {
      ...waiverQueryObject.reduce(
        (combinedWaivers, waiver) => ({ ...combinedWaivers, ...waiver }),
        {},
      ),
      eventId,
    },
  );
  return results.pop()[0];
};

module.exports = { updateEventRequirements, updateEventWaivers, getEventsQuery };
