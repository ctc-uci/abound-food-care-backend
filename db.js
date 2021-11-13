// need to update username + password + dbname
const {Pool} = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: 'my_user',
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT,
});

module.exports = pool;
