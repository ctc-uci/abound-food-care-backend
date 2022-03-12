-- this could be merged with events table, similar to postevents_text
DROP TABLE volunteer_at_events CASCADE;
CREATE TABLE IF NOT EXISTS volunteer_at_events
(
    user_id VARCHAR(128) FOREIGN KEY REFERENCES users(user_id) ON DELETE CASCADE,
    event_id INT FOREIGN KEY REFERENCES event(event_id) ON DELETE CASCADE,
    notes TEXT,
)
