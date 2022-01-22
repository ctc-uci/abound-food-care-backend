const express = require('express');
const cors = require('cors');
const eventsRouter = require('./routes/events/events');

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
app.use('/events', eventsRouter);

app.listen(PORT, () => {});
