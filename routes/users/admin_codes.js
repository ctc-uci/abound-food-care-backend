const crypto = require('crypto');

const express = require('express');
const { pool } = require('../../server/db');

const adminCodeRouter = express();

adminCodeRouter.get('/', async (req, res) => {
  try {
    const {
      cookies: { userId },
    } = req;
    const user = await pool.query('SELECT DISTINCT code FROM admin_codes WHERE user_id = $1', [
      userId,
    ]);
    res.status(200).send(user.rows);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

adminCodeRouter.get('/code/:adminCode', async (req, res) => {
  try {
    const { adminCode } = req.params;
    const user = await pool.query('SELECT * FROM admin_codes WHERE code = $1', [adminCode]);
    res.status(200).send(user.rows);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

adminCodeRouter.post('/', async (req, res) => {
  try {
    const {
      cookies: { userId },
    } = req;
    const adminCode = crypto.randomBytes(4).toString('hex');
    const data = await pool.query(
      'INSERT INTO admin_codes(user_id, code) VALUES ($1, $2) RETURNING *',
      [userId, adminCode],
    );
    res.status(200).send(data.rows);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

adminCodeRouter.delete('/:adminCode', async (req, res) => {
  try {
    const { adminCode } = req.params;
    const deletedCode = await pool.query(
      `DELETE FROM admin_codes
      WHERE code = $1
      RETURNING *;`,
      [adminCode],
    );
    res.status(200).send(deletedCode.rows);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = adminCodeRouter;
