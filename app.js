const express = require('express');
const cors = require('cors');
const userRouter = require('./routes/users/users');

const app = express();
const PORT = process.env.PORT || 3001;
require('dotenv').config();

app.use(
  cors({
    origin: `${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`,
  }),
  express.json(),
);
app.use('/user', userRouter);
app.listen(PORT, () => {});
