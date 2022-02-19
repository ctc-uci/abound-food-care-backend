// endpoints related to post events
const express = require('express');
const pool = require('../../db');

const postEventsRouter = express();

postEventsRouter.use(express.json());

function snakeToCamel(postevents) {
  return postevents.map((postevent) => ({
    posteventId: postevent.postevent_id,
    eventId: postevent.event_id,
    description: postevent.description,
  }));
}

// Update Post Event Endpoint
postEventsRouter.put('/:id', async (req, res) => {
  try {
    const { description } = req.body;
    const updatePostEvents = await pool.query(
      'UPDATE postevent SET description =$1 WHERE postevent_id = $2 RETURNING *;',
      [description, req.params.id],
    );
    if (updatePostEvents.rows.length === 0) {
      res.status(400).json();
    } else {
      res.status(200).json(snakeToCamel(updatePostEvents.rows));
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = postEventsRouter;
