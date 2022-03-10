DROP TYPE contact_methods CASCADE;
DROP TYPE roles CASCADE;
DROP TYPE days_of_week;
CREATE TYPE contact_methods AS ENUM('email', 'phone');
CREATE TYPE roles AS ENUM('volunteer', 'admin'); -- feel free to edit
CREATE TYPE days_of_week AS ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');

DROP TABLE users CASCADE;
CREATE TABLE users (
  user_id VARCHAR(128) PRIMARY KEY, -- renamed from id and changed to use the firebase id
  role roles NOT NULL, -- changed to use ENUM
  first_name VARCHAR(255) NOT NULL, -- split from name
  last_name VARCHAR(255) NOT NULL,
  birthdate DATE NOT NULL,
  email VARCHAR(255) NOT NULL, -- changed to 255 max length
  phone VARCHAR(15) NOT NULL, -- changed to VARCHAR(15)
  preferred_contact_method contact_methods, -- changed to use ENUM, should this be required?
  address_street VARCHAR(255) NOT NULL, -- split physical_address into these three
  address_city VARCHAR(255) NOT NULL,
  address_zip VARCHAR(5) NOT NULL,
  weight_lifting_ability INT, -- should this be required?
  criminal_history BOOLEAN NOT NULL,
  criminal_history_details text,
  dui_history BOOLEAN NOT NULL,
  dui_history_details text, -- changed this to be optional
  completed_chowmatch_training BOOLEAN NOT NULL,
  food_runs_interest BOOLEAN, -- should this be required?
  volunteering_roles_interest VARCHAR(255), -- could we change this to use an ENUM if we know all the roles?
  can_drive BOOLEAN NOT NULL, -- changed to be required
  specializations VARCHAR(255), -- is this kinda like a text box in the frontend? thinking we can maybe use ENUM
  vehicle_type VARCHAR(255),
  distance INT,
  additional_information text,
);

DROP TABLE availability CASCADE;
CREATE TABLE availability (
  user_id VARCHAR(128) PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  day_of_week days_of_week NOT NULL, -- changed to be required
  start_time TIME WITH TIME ZONE NOT NULL, -- changed to be required
  end_time TIME WITH TIME ZONE NOT NULL, -- changed to be required
);

DROP TABLE language CASCADE;
CREATE TABLE language (
  user_id VARCHAR(128) PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  language VARCHAR(255) NOT NULL, -- changed to VARCHAR
  proficiency INT NOT NULL,
)
