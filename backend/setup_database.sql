-- Run in psql or pgAdmin's Query Tool before running Django migrations.

CREATE DATABASE neo_learners;

CREATE USER neo_learners_user WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE neo_learners TO neo_learners_user;
