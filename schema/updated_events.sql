DROP TYPE requirements CASCADE;
CREATE TYPE requirements AS ENUM('drive', 'adult', 'minor', 'first aid', 'serve safe', 'transportation', 'warehouse', 'food service');

DROP TABLE events CASCADE;
CREATE TABLE events (
  event_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  event_type VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL, -- split to have street, zip...? --> currently design just has this as single text input. may update -- def prefer to have them split up in the database...
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  volunteer_capacity INT NOT NULL,
  file_attachments VARCHAR(255),
  notes TEXT,
  postevent_text TEXT,
);

DROP TABLE event_requirements CASCADE;
CREATE TABLE event_requirements (
  event_id int REFERENCES events(event_id) ON DELETE CASCADE NOT NULL,
  requirement requirements NOT NULL,
  UNIQUE(event_id, requirement),
);

DROP TABLE volunteer_at_events CASCADE;
CREATE TABLE volunteer_at_events ( -- merged table from volunteer_hours.sql here,
-- idea is that when a voluntere signs up for an event, only user_id and event_id will be filled
-- then once they log their hours, the rest of the columns will fill.
-- just an idea but let me know your opinion on it! :)
  user_id VARCHAR(128) REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
  event_id INT REFERENCES events(event_id) ON DELETE CASCADE NOT NULL,
  start_datetime timestamp with time zone,
  end_datetime timestamp with time zone,
  submitted BOOLEAN,
  approved BOOLEAN,
  declined BOOLEAN,
  num_hours INT,
  notes TEXT,
  UNIQUE(user_id, event_id),
);
