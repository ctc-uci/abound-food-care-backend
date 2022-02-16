// endpoints related to post events
const express = require('express');
const pool = require('../../db');

const postEventsRouter = express();

postEventsRouter.use(express.json());
// endpoints related to post events

function snakeToCamel(postevents) {
  return postevents.map((postevent) => ({
    posteventId: postevent.postevent_id,
    eventId: postevent.event_id,
    description: postevent.description,
  }));
}

// Update Post Event Endpoint
postEventsRouter.post('/:id', async (req, res) => {
    try {
    const { description } = req.body;
    const updatePostEvents = await pool.query('UPDATE postevent SET description =$1 WHERE postevent_id = $2;', [
      description, req.params.id
    ]);
    res.json(snakeToCamel(updatePostEvents.rows));
  } catch (err) {
    res.json();
  }
});

module.exports = postEventsRouter;

