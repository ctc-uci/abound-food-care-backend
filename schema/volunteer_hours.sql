DROP TABLE volunteer_hours CASCADE;
CREATE TABLE IF NOT EXISTS volunteer_hours
(
    user_id VARCHAR(128) NOT NULL REFERENCES users(user_id),
    event_id INT NOT NULL REFERENCES event(event_id),
    start_datetime timestamp with time zone NOT NULL,
    end_datetime timestamp with time zone NOT NULL,
    submitted BOOLEAN NOT NULL,
    approved BOOLEAN NOT NULL,
    declined BOOLEAN NOT NULL,
    num_hours INT,
    notes TEXT,
    PRIMARY KEY (user_id, event_id),
);
