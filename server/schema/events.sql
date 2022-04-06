DROP TYPE requirements CASCADE;
CREATE TYPE requirements AS ENUM('drive', 'adult', 'minor', 'first aid', 'serve safe', 'transportation', 'warehouse', 'food service');

DROP TABLE events CASCADE;
CREATE TABLE events (
  event_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  event_type VARCHAR(255) NOT NULL,
  address_street VARCHAR(255) NOT NULL,
  address_zip VARCHAR(5) NOT NULL,
  address_city VARCHAR(255) NOT NULL,
  address_state VARCHAR(2) NOT NULL,
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
  PRIMARY KEY(event_id, requirement),
);

DROP TABLE waivers CASCADE;
CREATE TABLE waivers (
  waiver_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  link VARCHAR(255) NOT NULL,
  event_id INT REFERENCES events(event_id) ON DELETE SET NULL,
  notes TEXT,
);

DROP TABLE volunteer_at_events CASCADE;
CREATE TABLE volunteer_at_events (
  user_id VARCHAR(128) REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
  event_id INT REFERENCES events(event_id) ON DELETE CASCADE NOT NULL,
  start_datetime timestamp with time zone,
  end_datetime timestamp with time zone,
  submitted BOOLEAN,
  approved BOOLEAN,
  declined BOOLEAN,
  num_hours INT,
  notes TEXT,
  PRIMARY KEY (user_id, event_id),
);
