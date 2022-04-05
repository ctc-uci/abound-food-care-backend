const { Pool } = require('pg');
const pgp = require('pg-promise')({});
require('dotenv').config();

const pool = new Pool({
  host: process.env.AWS_HOST,
  user: process.env.AWS_USER,
  password: process.env.AWS_PASSWORD,
  port: process.env.AWS_PORT,
  database: process.env.AWS_DB_NAME,
});

const cn = `postgres://${process.env.AWS_USER}:${encodeURIComponent(process.env.AWS_PASSWORD)}@${
  process.env.AWS_HOST
}:${process.env.AWS_PORT}/${process.env.AWS_DB_NAME}`; // For pgp
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
