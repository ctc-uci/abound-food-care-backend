const express = require('express');
const cors = require('cors');

const userRouter = require('./routes/users/users');
const eventRouter = require('./routes/events/events');
const volunteerHoursRouter = require('./routes/volunteers/volunteer_hours');
const volunteerRouter = require('./routes/volunteers/volunteers');
const availabilityRouter = require('./routes/users/availability');
const waiversRouter = require('./routes/events/waivers');

const app = express();
const PORT = process.env.PORT || 3001;
require('dotenv').config();

const corsOptions = {
  origin: `${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`,
  credentials: true, // access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

// routers
app.use('/volunteers', volunteerRouter);
app.use('/hours', volunteerHoursRouter);
app.use('/events', eventRouter);
app.use('/users', userRouter);
app.use('/availability', availabilityRouter);
app.use('/waivers', waiversRouter);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
