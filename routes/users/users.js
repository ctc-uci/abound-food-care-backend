// endpoints related to events
const express = require('express');

const userRouter = express();

userRouter.use(express.json());

module.exports = userRouter;
