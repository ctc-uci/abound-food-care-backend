DROP TABLE waivers CASCADE;
CREATE TABLE waivers (
  waiver_id SERIAL PRIMARY KEY, -- changed to auto generate waiver id
  name VARCHAR(255) NOT NULL,
  link VARCHAR(255), -- so this can be optional?
  event_id INT REFERENCES events(event_id) ON DELETE SET NULL, -- does every waiver need to be connected to an event? can this be optional?
  notes TEXT,
);
