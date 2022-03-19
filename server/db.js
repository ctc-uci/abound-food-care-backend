const { Pool } = require('pg');
const pgp = require('pg-promise')({});
require('dotenv').config();

const pool = new Pool({
  host: process.env.HOST,
  user: process.env.AWS_USERNAME,
  password: process.env.PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.AWS_DB_NAME,
});

const cn = `postgres://${process.env.AWS_USERNAME}:${encodeURIComponent(process.env.PASSWORD)}@${
  process.env.HOST
}:${process.env.DB_PORT}/${process.env.AWS_DB_NAME}`; // For pgp
const db = pgp(cn);

// pool.connect((err, client, release) => {
//   if (err) {
//     console.error(`client error ${err.stack}`, err.stack);
//   } else {
//     client.query('SELECT NOW()', (clientErr, result) => {
//       release();
//       if (clientErr) {
//         console.error('Error executing query', clientErr.stack);
//       } else {
//         console.log('should be a timestamp:', result.rows);
//       }
//     });
//   }
// });

module.exports = { pool, db };
