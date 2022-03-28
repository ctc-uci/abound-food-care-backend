const express = require('express');
const { pool, db } = require('../server/db');
const { isNumeric, keysToCamel } = require('./utils');

const languageRouter = express();

const addLanguageQuery = (languageNumber = 0) =>
  `INSERT INTO languages (user_id, language, proficiency)
  VALUES ($${languageNumber * 3 + 1}, $${languageNumber * 3 + 2}, $${languageNumber * 3 + 3})`;

const addMultiLanguageQuery = (numLanguages) => {
  let query = ``;
  for (let i = 0; i < numLanguages; i += 1) {
    query += addLanguageQuery(i);
  }
  return query;
};

// get all languages for a user
languageRouter.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const languages = await pool.query(
      `SELECT * FROM languages
      WHERE user_id = $1
      ORDER BY languages.language;`,
      [userId],
    );
    res.status(200).send(keysToCamel(languages.rows));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// add a language to a user
languageRouter.post('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { language, proficiency } = req.body;
    isNumeric(proficiency, 'Proficiency is not Numeric');
    const addedLanguage = await pool.query(addLanguageQuery(), [userId, language, proficiency]);
    res.status(200).send(keysToCamel(addedLanguage.rows[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// bulk add languages to a user
languageRouter.post('/bulk/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { newLanguages } = req.body;
    const queryValues = newLanguages
      .map((languageInfo) => [userId, languageInfo.language, languageInfo.proficiency])
      .flat();
    const test = await db.multi(addMultiLanguageQuery(newLanguages.length), queryValues);
    res.status(200).send(test.flat(2));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// update all user's languages

// remove a user's language
languageRouter.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { language } = req.body;
    const removedLanguage = await pool.query(
      `DELETE from languages
      WHERE languages.user_id = $1 AND languages.language = $2
      RETURNING *;`,
      [userId, language],
    );
    res.status(200).send(keysToCamel(removedLanguage.rows[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = languageRouter;
