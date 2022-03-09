const express = require('express');
const cors = require('cors');
const userRouter = require('./routes/users/users');
const eventRouter = require('./routes/events/events');
const hoursRouter = require('./routes/volunteer_hours/volunteer_hours');
const postEventsRouter = require('./routes/postevents/postevents');
const volunteerRouter = require('./routes/volunteers/volunteers');
const driverRouter = require('./routes/drivers/drivers');

const app = express();
const PORT = process.env.PORT || 3001;
require('dotenv').config();

const corsOptions = {
  origin: `${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`,
  credentials: true, // access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.options('*', cors());

// routers
app.use('/hours', hoursRouter);
app.use('/volunteers', volunteerRouter);
app.use('/postevents', postEventsRouter);
app.use('/events', eventRouter);
app.use('/users', userRouter);
app.use('/drivers', driverRouter);

app.use('/users', userRouter);
console.log(PORT);
app.listen(PORT, () => {});
