// endpoints related to events
const express = require('express');

const eventRouter = express();

eventRouter.use(express.json());

module.exports = eventRouter;
