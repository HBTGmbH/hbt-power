-- #93: removes the foreign keys of an older mapping from the join tables of the localizations.
-- Each column of these tables also pointed at the other table, so a localization could only be saved when its id
-- happened to match the id of a skill or category. Hibernate (ddl-auto: update) adds missing keys, but never drops any.
-- Idempotent: on a database without these keys (a fresh one, or a second run) nothing happens.
-- Run in the skill database, e.g. mariadb -u<user> -p skill < fix-localization-foreign-keys.sql

-- Kept: skill_id -> skill, qualifiers_id -> localized_qualifier
ALTER TABLE skill_qualifiers
    DROP FOREIGN KEY IF EXISTS FKg6g2mti4x5iwnp4cd1dybbcvi,  -- qualifiers_id -> skill
    DROP FOREIGN KEY IF EXISTS FKrnrpr2heoeu7ytwfriq1j92ww;  -- skill_id -> localized_qualifier

-- Kept: qualifiers_id -> skill_category, skill_category_id -> localized_qualifier
ALTER TABLE skill_category_qualifiers
    DROP FOREIGN KEY IF EXISTS FKbjp8ci1sb7o1ea2nq6fltasmd,  -- qualifiers_id -> localized_qualifier
    DROP FOREIGN KEY IF EXISTS FKfjahjyc8npvdff84414m9l9mo;  -- skill_category_id -> skill_category
