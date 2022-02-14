const express = require('express');
const cors = require('cors');
const eventRouter = require('./routes/events/events');
const hoursRouter = require('./routes/volunteer_hours/volunteer_hours');
const volunteerRouter = require('./routes/volunteers/volunteers');

const app = express();
const PORT = process.env.PORT || 3001;
require('dotenv').config();

app.use(
  cors({
    origin: `${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`,
  }),
  express.json(),
);

// routers
app.use('/hours', hoursRouter);
app.use('/volunteers', volunteerRouter);
app.use('/event', eventRouter);

app.listen(PORT, () => {});
