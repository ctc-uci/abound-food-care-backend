const express = require('express');
const Fuse = require('fuse.js');
const { pool, db } = require('../../server/db');
const { isNumeric, isZipCode, keysToCamel } = require('../utils');
const { updateEventRequirements, updateEventWaivers, getEventsQuery } = require('./eventsUtils');

const eventRouter = express();

// get all events
eventRouter.get('/', async (req, res) => {
  try {
    const { status, type } = req.query;
    // const offset = (pageIndex - 1) * pageSize;
    const search = req.query.search == null ? '' : req.query.search;
    const timeComparisonDict = {
      upcoming: `start_datetime >= NOW()`,
      past: `start_datetime < NOW()`,
      all: `-1 = -1`,
    };
    const typeDict = {
      'Food Running': `event_type = 'Food Running'`,
      Distribution: `event_type = 'Distribution'`,
      Other: `(event_type != 'Food Running' AND event_type != 'Distribution')`,
      All: `-1 = -1`,
    };
    const eventFilter = `
    SELECT *
    FROM events
    LEFT JOIN
      (SELECT req.event_id, array_agg(req.requirement ORDER BY req.requirement ASC) AS requirements
        FROM event_requirements AS req
        GROUP BY req.event_id) AS r on r.event_id = events.event_id
    LEFT JOIN
      (SELECT waivers.event_id, array_agg(to_jsonb(waivers.*) - 'event_id' ORDER BY waivers.name) AS waivers
        FROM waivers
        GROUP BY waivers.event_id) AS waivers on waivers.event_id = events.event_id
    WHERE (${timeComparisonDict[status]})
      AND (${typeDict[type]})
  `;

    let events = await db.query(eventFilter);
    // const events = await db.query(
    //   `SELECT events.*, requirements, waivers.waivers
    //   $(eventFilter)
    //   ORDER BY start_datetime ASC;
    //   LIMIT $(pageSize) OFFSET $(offset);
    //   `,
    //   {
    //     status,
    //     type,
    //     pageSize,
    //     offset,
    //     eventFilter,
    //   },
    // );
    if (req.query.search) {
      const searchOptions = {
        keys: ['name'],
      };
      const fuse = new Fuse(events, searchOptions);
      events = fuse.search(search);
      events = events.map((searchItem) => {
        return searchItem.item;
      });
    }

    res.status(200).json(keysToCamel(events));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get Total # Of Events
// scrapped
eventRouter.get('/all', async (req, res) => {
  console.log(req.body);
  console.log(req.params);
  console.log(req.query);
  try {
    const { status, type } = req.query;
    const timeComparisonDict = {
      upcoming: `start_datetime >= NOW()`,
      past: `start_datetime < NOW()`,
      all: `-1 = -1`,
    };
    const typeDict = {
      'Food Running': `event_type = 'Food Running'`,
      Distribution: `event_type = 'Distribution'`,
      Other: `(event_type != 'Food Running' AND event_type != 'Distribution')`,
      All: `-1 = -1`,
    };

    // ($(allTimes) OR (start_datetime < $(currDate)) AND ($(type) = 'all' OR event_type = $(type))
    console.log(`SELECT COUNT(*)
    FROM events
      WHERE (${timeComparisonDict[status]})
        AND (${typeDict[type]})
  `);
    const numEvents = await db.query(
      `SELECT COUNT(*)
      FROM events
        WHERE (${timeComparisonDict[status]})
          AND (${typeDict[type]})
    `,
    );
    // $(timeConstraint) AND
    // const numEvents = await db.query(
    //   `SELECT *
    //   FROM events
    //     LEFT JOIN
    //       (SELECT req.event_id, array_agg(req.requirement ORDER BY req.requirement ASC) AS requirements
    //         FROM event_requirements AS req
    //         GROUP BY req.event_id) AS r on r.event_id = events.event_id
    //     LEFT JOIN
    //       (SELECT waivers.event_id, array_agg(to_jsonb(waivers.*) - 'event_id' ORDER BY waivers.name) AS waivers
    //         FROM waivers
    //         GROUP BY waivers.event_id) AS waivers on waivers.event_id = events.event_id
    // `,
    //   {
    //     status,
    //     timeConstraint,
    //     type,
    //     currDate,
    //   },
    // );
    res.status(200).json(numEvents);
    // res.status(200).json({ msg: 'test' });
  } catch (err) {
    res.status(400).json(err);
  }
});

eventRouter.get('/upcoming', async (req, res) => {
  try {
    const currDate = new Date();
    const conditions = 'WHERE start_datetime >= $1';
    const events = await pool.query(getEventsQuery(conditions), [currDate]);
    res.status(200).json(keysToCamel(events.rows));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

eventRouter.get('/past', async (req, res) => {
  try {
    const currDate = new Date();
    const conditions = 'WHERE start_datetime < $1';
    const events = await pool.query(getEventsQuery(conditions), [currDate]);
    res.status(200).json(keysToCamel(events.rows));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// get an event
eventRouter.get('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    isNumeric(eventId, 'Event Id must be a number');
    const conditions = 'WHERE events.event_id = $1';
    const event = await pool.query(getEventsQuery(conditions), [eventId]);
    res.status(200).json(keysToCamel(event.rows));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// add an event
eventRouter.post('/', async (req, res) => {
  try {
    const {
      name,
      eventType,
      addressStreet,
      addressZip,
      addressCity,
      addressState,
      startDatetime,
      endDatetime,
      volunteerCapacity,
      notes,
      requirements,
      waivers,
    } = req.body;
    isZipCode(addressZip, 'Invalid Zip Code');
    isNumeric(volunteerCapacity, 'Volunteer Capacity is not a Number');
    let newEvent = await db.query(
      `INSERT INTO events (
        name, event_type, address_street, address_zip, address_city,
        address_state, start_datetime, end_datetime, volunteer_capacity
        ${notes ? ', notes' : ''})
      VALUES (
        $(name), $(eventType), $(addressStreet), $(addressZip), $(addressCity),
        $(addressState), $(startDatetime), $(endDatetime), $(volunteerCapacity)
        ${notes ? ', $(notes)' : ''})
      RETURNING *;`,
      {
        name,
        eventType,
        addressStreet,
        addressZip,
        addressCity,
        addressState,
        startDatetime,
        endDatetime,
        volunteerCapacity,
        notes,
      },
    );
    const eventId = newEvent[0].event_id;
    await updateEventRequirements(requirements, eventId);
    newEvent = await updateEventWaivers(waivers, eventId);
    res.status(200).json(keysToCamel(newEvent));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// update an event
eventRouter.put('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    isNumeric(eventId, 'Event Id must be a number');
    const {
      name,
      eventType,
      addressStreet,
      addressZip,
      addressCity,
      addressState,
      startDatetime,
      endDatetime,
      volunteerCapacity,
      notes,
      posteventText,
      requirements,
      waivers,
    } = req.body;
    isZipCode(addressZip, 'Invalid Zip Code');
    isNumeric(volunteerCapacity, 'Volunteer Capacity is not a Number');
    await db.query(
      `UPDATE events
      SET
        name = $(name),
        event_type = $(eventType),
        address_street = $(addressStreet),
        address_zip = $(addressZip),
        address_city = $(addressCity),
        address_state = $(addressState),
        start_datetime = $(startDatetime),
        end_datetime = $(endDatetime),
        volunteer_capacity = $(volunteerCapacity)
        ${notes ? ', notes = $(notes)' : ''}
        ${posteventText ? ', postevent_text = $(posteventText)' : ''}
      WHERE event_id = $(eventId)
      RETURNING *;`,
      {
        name,
        eventType,
        addressStreet,
        addressZip,
        addressCity,
        addressState,
        startDatetime,
        endDatetime,
        volunteerCapacity,
        notes,
        posteventText,
        eventId,
      },
    );
    await updateEventRequirements(requirements, eventId, true);
    const updatedEvent = await updateEventWaivers(waivers, eventId, true);
    res.status(200).json(keysToCamel(updatedEvent));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// add postevent text
// do not think this request is needed because can just use above request to update post event text
// * needed for submitting post event text bc above request requires information that cannot be sent in req
eventRouter.put('/add_post_text/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    isNumeric(eventId, 'Event Id must be a number');
    const { posteventText } = req.body;
    const updatedEvent = await pool.query(
      `UPDATE events
      SET postevent_text = $1
      WHERE event_id = $2
      RETURNING *;`,
      [posteventText, eventId],
    );
    res.status(200).json(keysToCamel(updatedEvent.rows[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// delete an event
eventRouter.delete('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    isNumeric(eventId, 'Event Id must be a number');
    const deletedEvent = await pool.query(
      `DELETE FROM events
      WHERE event_id = $1
      RETURNING *;`,
      [eventId],
    );
    res.status(200).json(keysToCamel(deletedEvent.rows[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get Volunteers By Event
eventRouter.get('/:id/volunteers', async (req, res) => {
  try {
    const getVolunteerByEvent = await pool.query(
      'SELECT user_id FROM volunteer_at_events WHERE event_id = $1;',
      [req.params.id],
    );
    res.status(200).json(getVolunteerByEvent.rows);
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = eventRouter;
