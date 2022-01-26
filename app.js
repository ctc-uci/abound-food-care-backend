const express = require('express');
const cors = require('cors');
const eventRouter = require('./routes/events/events');

const app = express();
const PORT = process.env.PORT || 3001;
require('dotenv').config();

const volunteerRouter = require('./routes/volunteers/volunteers');

app.use(
  cors({
    origin: `${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`,
  }),
  express.json(),
);


app.use('/volunteers', volunteerRouter);

// routers
app.use('/event', eventRouter);


app.listen(PORT, () => {});
