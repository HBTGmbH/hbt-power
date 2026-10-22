-- #175: removes the blacklist of skill categories. Hibernate (ddl-auto: update) never drops a column.
-- Run AFTER the new skill service is live: the old one still selects the column.
-- Until then the new service writes categories without it, which works where the column is nullable or has a default
-- (production: NULL allowed, default b'0'). A local database created by an older mapping has it NOT NULL without a
-- default; there run the script right after starting the new service, before creating a category.
-- Idempotent. Run in the skill database, e.g. mariadb -u<user> -p skill < remove-category-blacklist.sql
ALTER TABLE skill_category DROP COLUMN IF EXISTS is_blacklisted;
