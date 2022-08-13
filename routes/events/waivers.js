const express = require('express');
const aws = require('aws-sdk');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const { PassThrough } = require('stream');
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

waiversRouter.post('/download/:eventId', async (req, res) => {
  try {
    const { name, volunteerData } = req.body;
    const multiFilesStream = (s3Bucket, infos) => {
      // using archiver package to create archive object with zip setting -> level from 0(fast, low compression) to 10(slow, high compression)
      const archive = archiver('zip', { zlib: { level: 5 } });

      infos.forEach((file) => {
        // using pass through stream object to wrap the stream from aws s3
        const passthrough = new PassThrough();
        s3Bucket
          .getObject({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: file.filename,
          })
          .createReadStream()
          .pipe(passthrough);
        // name parameter is the name of the file that the file needs to be when unzipped.
        archive.append(passthrough, { name: file.output });
      });
      return archive;
    };
    const s3 = new aws.S3({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      signatureVersion: 'v4',
    });
    const waiverPaths = volunteerData.map((vol) => ({
      filename: vol.waiver.split('amazonaws.com/')[1],
      output: vol.waiverName,
    }));
    const mfStream = await multiFilesStream(s3, waiverPaths);
    const zip = fs.createWriteStream(`${name}-waivers.zip`, { flags: 'w' });
    mfStream.pipe(zip);
    mfStream.finalize();
    console.log('checkpoint 1');
    res.download(path.join(__dirname, `/../../${name}-waivers.zip`), `${name}-waivers.zip`);
    console.log('checkpoint 2');
    console.log('checkpoint 3');
    // const download = Buffer.from(fs.readFileSync(`${name}-waivers.zip`, 'utf8'), 'base64');
    console.log('checkpoint 4');
    // res.end(download);
    console.log('checkpoint 5');
    // fs.unlinkSync(path.join(__dirname, `${name}-waivers.zip`));
    console.log('checkpoint 6');
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
