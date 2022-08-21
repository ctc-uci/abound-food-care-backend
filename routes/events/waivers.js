const express = require('express');
const { pool, db } = require('../../server/db');
const { isNumeric, keysToCamel } = require('../utils');
const { downloadWaivers } = require('./waiversUtils');

const waiversRouter = express();

// get all waivers
waiversRouter.get('/', async (req, res) => {
  try {
    const waivers = await pool.query('SELECT * FROM waivers');
    res.status(200).send(keysToCamel(waivers.rows));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// get a waiver by id
waiversRouter.get('/:waiverId', async (req, res) => {
  try {
    const { waiverId } = req.params;
    const waiver = await pool.query('SELECT * from waivers WHERE waiver_id = $1', [waiverId]);
    res.status(200).send(keysToCamel(waiver.rows[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// download all waivers for an event
waiversRouter.get('/event/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { rows: waiverInfo } = await pool.query(
      'SELECT * from waivers WHERE event_id = $1 AND user_id is NULL',
      [eventId],
    );

    downloadWaivers(
      res,
      waiverInfo.map((w) => w.link.split('amazonaws.com/')[1]),
      waiverInfo.map((w) => w.name),
    );
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// delete all of a specified user's waivers associated with an event
waiversRouter.delete('/:userId/:eventId', async (req, res) => {
  try {
    const { userId, eventId } = req.params;
    const deletedWaiver = await pool.query(
      `DELETE FROM waivers
      WHERE user_id = $1
      AND event_id = $2
      RETURNING *;`,
      [userId, eventId],
    );
    res.status(200).send(keysToCamel(deletedWaiver.rows[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

waiversRouter.post('/download', async (req, res) => {
  try {
    const { volunteerData } = req.body;

    const waiverPaths = volunteerData.map((vol) => ({
      filename: vol.waiver.split('amazonaws.com/')[1],
      output: `${vol.name} - ${vol.waiverName}`,
    }));

    downloadWaivers(
      res,
      waiverPaths.map((w) => w.filename),
      waiverPaths.map((w) => w.output),
    );
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// create a waiver
waiversRouter.post('/', async (req, res) => {
  try {
    const { name, link, eventId, notes } = req.body;
    isNumeric(eventId, 'Event Id is not a number');
    const uploadDate = new Date();
    const addWaiver = await db.query(
      `INSERT INTO waivers (
        name, link, event_idm, upload_date
        ${notes ? ', notes' : ''})
      VALUES ($(name), $(link), $(eventId), $(uploadDate)
        ${notes ? ', $(notes)' : ''})
      RETURNING *`,
      { name, link, eventId, uploadDate, notes },
    );
    res.status(200).send(keysToCamel(addWaiver[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// create a waiver (volunteer)
waiversRouter.post('/volunteer', async (req, res) => {
  try {
    const {
      body: { name, link, eventId },
      cookies: { userId },
    } = req;
    isNumeric(eventId, 'Event Id is not a number');
    const uploadDate = new Date();
    const addWaiver = await db.query(
      `INSERT INTO waivers
      (name, link, event_id, upload_date, user_id)
      VALUES
      ($(name), $(link), $(eventId), $(uploadDate), $(userId))
      RETURNING *`,
      { name, link, eventId, uploadDate, userId },
    );
    res.status(200).send(keysToCamel(addWaiver[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// update a waiver
waiversRouter.put('/:waiverId', async (req, res) => {
  try {
    const { waiverId } = req.params;
    const { name, link, eventId, notes } = req.body;
    isNumeric(waiverId, 'Waiver Id is not a number');
    isNumeric(eventId, 'Event Id is not a number');
    const updateWaiver = await db.query(
      `UPDATE waivers
      SET
        name = $(name),
        link = $(link),
        event_id = $(eventId)
        ${notes ? ', notes = $(notes)' : ''}
      WHERE waiver_id = $(waiverId)
      RETURNING *;`,
      { name, link, eventId, notes, waiverId },
    );
    res.status(200).send(keysToCamel(updateWaiver[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// delete a waiver
waiversRouter.delete('/:waiverId', async (req, res) => {
  try {
    const { waiverId } = req.params;
    const deletedWaiver = await pool.query(
      `DELETE FROM waivers
      WHERE waiver_id = $1
      RETURNING *;`,
      [waiverId],
    );
    res.status(200).send(keysToCamel(deletedWaiver.rows[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = waiversRouter;
