
DROP TABLE events CASCADE;
CREATE TABLE events (
  event_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  event_type VARCHAR(255) NOT NULL, -- maybe change to ENUM?
  location VARCHAR(255) NOT NULL, -- split to have street, zip...?
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  volunteer_type VARCHAR(255) NOT NULL, -- maybe change to ENUM?
  volunteer_requirements TEXT NOT NULL,
  volunteer_capacity INT NOT NULL,
  file_attachments VARCHAR(255),
  notes TEXT,
  postevent_text TEXT, -- merge postevent table into event table, lmk if this is fine
);

DROP TABLE post_event CASCADE;
CREATE TABLE post_event (
  event_id INT PRIMARY KEY REFERENCES events(event_id) ON DELETE CASCADE,

);

DROP TABLE volunteer_at_events CASCADE;
CREATE TABLE volunteer_at_events (
  user_id VARCHAR(128) REFERENCES users(user_id) ON DELETE CASCADE, -- what should happen if user is deleted?
  event_id INT REFERENCES events(event_id) ON DELETE CASCADE, -- what should happen if event is deleted?
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  approved BOOLEAN NOT NULL,
  num_hours INT, -- should this be required?
  submitted BOOLEAN, -- what does this mean exactly?
  notes TEXT,
  UNIQUE(user_id, event_id),
);
