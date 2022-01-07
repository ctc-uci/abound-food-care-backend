// need to update username + password + dbname
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.AWS_DB_NAME,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error(`client error ${err.stack}`, err.stack);
  }
  client.query('SELECT NOW()', (clientErr, result) => {
    release();
    if (clientErr) {
      return console.error('Error executing query', clientErr.stack);
    }
    return console.log('should be a timestamp:', result.rows);
  });
  return console.log('processed');
});

module.exports = pool;
