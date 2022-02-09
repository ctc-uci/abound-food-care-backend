const express = require('express');
const cors = require('cors');
const eventRouter = require('./routes/events/events');
const volunteerAtEventsRouter = require('./routes/volunteer_at_events/volunteer_at_events');

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
app.use('/event', eventRouter);
app.use('/volunteer_at_events', volunteerAtEventsRouter);

app.listen(PORT, () => {});
