DROP TABLE IF EXISTS notifications CASCADE;
CREATE TABLE notifications (
  notification_id SERIAL PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
);
