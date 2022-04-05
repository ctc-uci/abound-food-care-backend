DROP TABLE waivers CASCADE;
CREATE TABLE waivers (
  waiver_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  link VARCHAR(255) NOT NULL,
  event_id INT REFERENCES events(event_id) ON DELETE SET NULL,
  notes TEXT,
);
