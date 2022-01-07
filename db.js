// need to update username + password + dbname
const { Client } = require('pg');
require('dotenv').config();

const connString = `postgres://${process.env.USER}:${process.env.PASSWORD}@${process.env.HOST}:${process.env.DB_PORT}/${process.env.AWS_DB_NAME}`;
const client = new Client(connString);
client.connect();

module.exports = client;
