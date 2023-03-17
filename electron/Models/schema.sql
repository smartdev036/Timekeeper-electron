CREATE TABLE controllers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    initials TEXT NOT NULL UNIQUE
);
CREATE TABLE crew (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);
CREATE TABLE crew_controllers (
    controller_id INTEGER CHECK( controller_id > 0 ) NOT NULL,
    crew_id INTEGER CHECK( crew_id > 0 ) NOT NULL,
    PRIMARY KEY (controller_id)
);
-- CREATE TABLE bullpen (
--     type TEXT CHECK( type IN ('controller') ) NOT NULL,
--     id INTEGER CHECK( id > 0 ) NOT NULL,
--     PRIMARY KEY (type, id)
-- );

-- IF NOT EXISTS( SELECT time_since_lastin
--             FROM bullpen)  THEN
--   ALTER TABLE bullpen ADD time_since_lastin TEXT;
-- END IF;
CREATE TABLE bullpen (
    type TEXT CHECK( type IN ('controller') ) NOT NULL,
    id INTEGER CHECK( id > 0 ) NOT NULL,
    time_since_lastin TEXT,
    PRIMARY KEY (type, id)
);

CREATE TABLE positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    shorthand TEXT UNIQUE NOT NULL,
    position INTEGER CHECK( position >= 0 AND position <= 17 ) UNIQUE NULL,
    relief_exempt BOOLEAN CHECK (relief_exempt IN (0, 1)) NOT NULL,
    relief_time_min INTEGER NOT NULL,
    proficiency_time_min INTEGER NOT NULL,
    created_date TEXT NOT NULL
);
CREATE TABLE log_times (
    position_id INTEGER CHECK( position_id > 0 ) NOT NULL,
    -- '0' controller_id represents closed
    controller_id INTEGER NOT NULL,
    trainee_controller_id INTEGER NOT NULL,
    log_date TEXT NOT NULL,
    start_time INTEGER NOT NULL,
    start_minute INTEGER NOT NULL,
    PRIMARY KEY (position_id, log_date, start_time)
);

CREATE TABLE log_validation (
    position_id INTEGER CHECK( position_id > 0 ) NOT NULL,
    log_date TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    PRIMARY KEY (position_id, log_date)
);
CREATE TABLE positions_combined (
    id INTEGER NOT NULL,
    position_id INTEGER CHECK ( position_id > 0 ) NOT NULL,
    log_date TEXT NOT NULL,
    PRIMARY KEY (position_id, log_date)
);
CREATE TABLE combined_center (
    id INTEGER NOT NULL,
    position_id INTEGER CHECK ( position_id > 0 ) NOT NULL,
    log_date TEXT NOT NULL,
    PRIMARY KEY (id, log_date),
    UNIQUE (position_id)
);

CREATE TABLE IF NOT EXISTS tbl_pos_combined_integration  (
  id int(0) NOT NULL,
  center_id int(0) NULL,
  combined_id int(0) NULL,
  log_date date NULL,
  PRIMARY KEY (id, center_id, combined_id, log_date)
)