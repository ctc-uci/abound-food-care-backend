const express = require('express');
const { pool, db } = require('../../server/db');
const { isNumeric, keysToCamel } = require('../utils');

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

// create a waiver
waiversRouter.post('/', async (req, res) => {
  try {
    const { name, link, eventId, notes } = req.body;
    isNumeric(eventId, 'Event Id is not a number');
    const addWaiver = await db.query(
      `INSERT INTO waivers (
        name, link, event_id
        ${notes ? ', notes' : ''})
      VALUES ($(name), $(link), $(eventId)
        ${notes ? ', $(notes)' : ''})
      RETURNING *`,
      { name, link, eventId, notes },
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
