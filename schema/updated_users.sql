DROP TYPE contact_methods CASCADE;
DROP TYPE roles CASCADE;
DROP TYPE days_of_week;
CREATE TYPE contact_methods AS ENUM('email', 'phone');
CREATE TYPE roles AS ENUM('volunteer', 'admin'); -- feel free to edit
CREATE TYPE volunteer_roles as ENUM('food runner', 'distribution worker');
CREATE TYPE skills AS ENUM('first aid', 'serve safe', 'transportation', 'warehouse', 'food service');
CREATE TYPE days_of_week AS ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');

DROP TABLE users CASCADE;
CREATE TABLE users (
  user_id VARCHAR(128) PRIMARY KEY, -- renamed from id and changed to use the firebase id
  role roles NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  organization VARCHAR(255) NOT NULL, -- added (new field from design)
  birthdate DATE NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  preferred_contact_method contact_methods NOT NULL, -- changed to required
  address_street VARCHAR(255) NOT NULL,
  address_city VARCHAR(255) NOT NULL,
  address_state VARCHAR(50) NOT NULL, -- added state
  address_zip VARCHAR(5) NOT NULL,
  weight_lifting_ability INT NOT NULL, -- changed to required
  criminal_history BOOLEAN NOT NULL,
  criminal_history_details text,
  dui_history BOOLEAN NOT NULL,
  dui_history_details text,
  completed_chowmatch_training BOOLEAN NOT NULL,
  food_runs_interest BOOLEAN,
  distribution_interest BOOLEAN, -- added this and removed volunteer_roles_interest bc users can choose either or both
  can_drive BOOLEAN NOT NULL,
  willing_to_drive BOOLEAN NOT NULL, -- added this according to design
  vehicle_type VARCHAR(255),
  distance INT,
  additional_information text,
);

DROP TABLE specialization CASCADE; -- removed specializations from users table
CREATE TABLE specialization (
  user_id VARCHAR(128) REFERENCES users(user_id) ON DELETE CASCADE,
  specialization skills NOT NULL,
  UNIQUE(user_id, specialization);
);

DROP TABLE availability CASCADE;
CREATE TABLE availability (
  user_id VARCHAR(128) PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  day_of_week days_of_week NOT NULL,
  start_time TIME WITH TIME ZONE NOT NULL,
  end_time TIME WITH TIME ZONE NOT NULL,
);

DROP TABLE language CASCADE;
CREATE TABLE language (
  user_id VARCHAR(128) FOREIGN KEY REFERENCES user(user_id),
  language VARCHAR(255) NOT NULL,
  proficiency INT NOT NULL,
  PRIMARY KEY (user_id, language) -- corrected PK
)
