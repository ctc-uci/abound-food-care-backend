// need to update username + password + dbname
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.AWS_HOST,
  user: process.env.AWS_USER,
  password: process.env.AWS_PASSWORD,
  port: process.env.AWS_PORT,
  database: process.env.AWS_DB_NAME,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error(`client error ${err.stack}`, err.stack);
  } else {
    client.query('SELECT NOW()', (clientErr, result) => {
      release();
      if (clientErr) {
        console.error('Error executing query', clientErr.stack);
      } else {
        console.log('should be a timestamp:', result.rows);
      }
    });
  }
});

module.exports = pool;
