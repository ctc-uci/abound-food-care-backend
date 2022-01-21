const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
require('dotenv').config();

const hoursRouter = require('./routes/volunteer_hours/volunteer_hours');

app.use(
  cors({
    origin: `${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`,
  }),
  express.json(),
);

app.use('/hours', hoursRouter);

app.listen(PORT, () => {});
