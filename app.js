const express = require('express');
const cors = require('cors');

const userRouter = require('./routes/users/users');
const eventRouter = require('./routes/events/events');
const hoursRouter = require('./routes/volunteer_hours');
const posteventRouter = require('./routes/postevents');
const volunteerRouter = require('./routes/volunteers');
const availabilityRouter = require('./routes/users/availability');

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
app.use('/hours', hoursRouter);
app.use('/volunteers', volunteerRouter);
app.use('/postevents', posteventRouter);
app.use('/events', eventRouter);
app.use('/users', userRouter);
app.use('/availability', availabilityRouter);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
