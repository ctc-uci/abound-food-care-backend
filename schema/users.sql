DROP TYPE IF EXISTS contact_methods CASCADE;
DROP TYPE IF EXISTS roles CASCADE;
DROP TYPE IF EXISTS volunteer_roles CASCADE;
DROP TYPE IF EXISTS skills CASCADE;
DROP TYPE IF EXISTS days_of_week;
CREATE TYPE contact_methods AS ENUM('email', 'phone');
CREATE TYPE roles AS ENUM('volunteer', 'admin');
CREATE TYPE volunteer_roles as ENUM('food runner', 'distribution worker');
CREATE TYPE skills AS ENUM('first aid', 'serve safe', 'transportation', 'warehouse', 'food service');
CREATE TYPE days_of_week AS ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');

DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
  user_id VARCHAR(128) PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  role roles NOT NULL,
  organization VARCHAR(255) NOT NULL,
  birthdate DATE NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  preferred_contact_method contact_methods NOT NULL,
  address_street VARCHAR(255) NOT NULL,
  address_zip VARCHAR(5) NOT NULL,
  address_city VARCHAR(255) NOT NULL,
  address_state VARCHAR(2) NOT NULL,
  weight_lifting_ability INT NOT NULL,
  criminal_history BOOLEAN NOT NULL,
  criminal_history_details text,
  dui_history BOOLEAN NOT NULL,
  dui_history_details text,
  completed_chowmatch_training BOOLEAN NOT NULL,
  food_runs_interest BOOLEAN,
  distribution_interest BOOLEAN,
  can_drive BOOLEAN NOT NULL,
  willing_to_drive BOOLEAN NOT NULL,
  vehicle_type VARCHAR(255),
  distance INT,
  first_aid_training BOOLEAN NOT NULL,
  serve_safe_knowledge BOOLEAN NOT NULL,
  transportation_experience BOOLEAN NOT NULL,
  moving_warehouse_experience BOOLEAN NOT NULL,
  food_service_industry_knowledge BOOLEAN NOT NULL,
  additional_information text
);

DROP TABLE IF EXISTS availability CASCADE;
CREATE TABLE availability (
  user_id VARCHAR(128) REFERENCES users(user_id) ON DELETE CASCADE,
  day_of_week days_of_week NOT NULL,
  start_time TIME WITH TIME ZONE NOT NULL,
  end_time TIME WITH TIME ZONE NOT NULL
);

DROP TABLE IF EXISTS language CASCADE;
CREATE TABLE language (
  user_id VARCHAR(128) REFERENCES users(user_id) ON DELETE CASCADE,
  language VARCHAR(255) NOT NULL,
  proficiency INT NOT NULL,
  PRIMARY KEY (user_id, language)
);
