CREATE TABLE admin_codes (
	user_id VARCHAR(128) REFERENCES users(user_id)
   ON DELETE CASCADE
   ON UPDATE CASCADE NOT NULL,
	code VARCHAR(128) NOT NULL
);

CREATE FUNCTION trg_admin_codes_insbef_check()
  RETURNS trigger AS $func$
BEGIN
   IF (SELECT COUNT(code) FROM "admin_codes" WHERE user_id = NEW.user_id) >= (5) THEN
      RAISE EXCEPTION 'User has exceeded number of ';
   END IF;
   RETURN NEW;
END
$func$  LANGUAGE plpgsql;

CREATE TRIGGER insbef_check
BEFORE INSERT ON admin_codes
FOR EACH ROW EXECUTE PROCEDURE trg_admin_codes_insbef_check();
