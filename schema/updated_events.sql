CREATE TYPE requirements AS ENUM('drive', 'adult', 'minor', 'first aid', 'serve safe', 'transportation', 'warehouse', 'food service');

DROP TABLE events CASCADE;
CREATE TABLE events (
  event_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  event_type VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL, -- split to have street, zip...? --> currently design just has this as single text input. may update
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  volunteer_type VARCHAR(255) NOT NULL, -- remove volunteer type bc it matches event type and was removed from design?
  volunteer_capacity INT NOT NULL,
  file_attachments VARCHAR(255),
  notes TEXT,
  postevent_text TEXT, -- looks good
);

DROP TABLE requirement CASCADE; -- removed volunteer_requirements from event table
CREATE TABLE requirement (
  event_id int REFERENCES events(event_id) ON DELETE CASCADE,
  requirement requirements NOT NULL,
  UNIQUE(event_id, requirement),
);

DROP TABLE volunteer_at_events CASCADE;
CREATE TABLE volunteer_at_events (
  user_id VARCHAR(128) REFERENCES users(user_id) ON DELETE CASCADE,
  event_id INT REFERENCES events(event_id) ON DELETE CASCADE,
  notes TEXT,
  UNIQUE(user_id, event_id),
);
