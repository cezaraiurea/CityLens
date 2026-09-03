CREATE DATABASE citylens_auth_db;
CREATE DATABASE citylens_user_db;
CREATE DATABASE citylens_location_db;

\connect citylens_location_db
CREATE EXTENSION IF NOT EXISTS postgis;

