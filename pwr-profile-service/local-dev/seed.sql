-- Sample data for local development. Run with `mvn sql:execute` (see pom.xml); the tables must exist,
-- so start the service with localDev at least once first.
-- Fixed ids from 900001 and INSERT IGNORE make it safe to run again: existing rows are kept, deleted rows come back,
-- and data created through the UI is not touched.

-- Consultant "mmu" with an empty profile
INSERT IGNORE INTO profile (id, description, last_edited) VALUES
    (900001, 'Erfahrener Java-Entwickler mit Schwerpunkt auf Cloud-Architekturen und agilen Projekten.', '2026-01-01 00:00:00');

INSERT IGNORE INTO consultant (id, initials, first_name, last_name, title, is_active, birth_date, profile_id) VALUES
    (900001, 'mmu', 'Max', 'Mustermann', 'Senior Consultant', 1, '1985-04-12', 900001);

-- Names used by the profile entries below
INSERT IGNORE INTO name_entity (id, name, type) VALUES
    (900001, 'Deutsch', 'LANGUAGE'),
    (900002, 'Englisch', 'LANGUAGE'),
    (900003, 'Universität Hamburg - Informatik', 'EDUCATION'),
    (900004, 'AWS Certified Solutions Architect - Associate', 'QUALIFICATION'),
    (900005, 'Scrum Master Schulung', 'TRAINING'),
    (900006, 'Logistik', 'SECTOR'),
    (900007, 'Versicherungen', 'SECTOR'),
    (900008, 'Softwareentwickler', 'CAREER'),
    (900009, 'Senior Consultant', 'CAREER'),
    (900010, 'Cloud-Architektur', 'SPECIAL_FIELD'),
    (900011, 'Beispiel Versicherung AG', 'COMPANY'),
    (900012, 'HBT GmbH', 'COMPANY'),
    (900013, 'Lead Developer', 'PROJECT_ROLE');

-- Profile entries: one row in profile_entry plus one row with the same id in the table of the entry type
INSERT IGNORE INTO profile_entry (id, name_entity_id) VALUES
    (900001, 900001),
    (900002, 900002),
    (900003, 900003),
    (900004, 900004),
    (900005, 900005),
    (900006, 900006),
    (900007, 900007),
    (900008, 900008),
    (900009, 900009),
    (900010, 900010);

INSERT IGNORE INTO language_skill (id, profile_id, level) VALUES
    (900001, 900001, 'NATIVE'),
    (900002, 900001, 'BUSINESS_FLUENT');

INSERT IGNORE INTO education_entry (id, profile_id, degree, start_date, end_date) VALUES
    (900003, 900001, 'Master of Science', '2005-10-01', '2011-03-31');

INSERT IGNORE INTO qualification_entry (id, profile_id, date) VALUES
    (900004, 900001, '2020-06-15');

INSERT IGNORE INTO training_entry (id, profile_id, start_date, end_date) VALUES
    (900005, 900001, '2019-03-11', '2019-03-13');

INSERT IGNORE INTO sector_entry (id, profile_id) VALUES
    (900006, 900001),
    (900007, 900001);

INSERT IGNORE INTO career_entry (id, profile_id, start_date, end_date) VALUES
    (900008, 900001, '2011-04-01', '2016-12-31'),
    (900009, 900001, '2017-01-01', NULL);

INSERT IGNORE INTO special_field_entry (id, profile_id) VALUES
    (900010, 900001);

-- One project with client, broker and role
INSERT IGNORE INTO project (id, profile_id, name, description, client_id, broker_id, start_date, end_date) VALUES
    (900001, 900001, 'Neues Kundenportal', 'Neuentwicklung des Kundenportals als Cloud-native Anwendung auf AWS.', 900011, 900012, '2021-01-01', '2022-06-30');

INSERT IGNORE INTO project_project_roles (project_id, project_roles_id) VALUES
    (900001, 900013);

-- Skills with rating 1-5. Names match the sample skill tree of pwr-skill-service (local-dev/seed.sql there)
INSERT IGNORE INTO skill (id, profile_id, name, rating) VALUES
    (900001, 900001, 'Java', 5),
    (900002, 900001, 'Kotlin', 3),
    (900003, 900001, 'TypeScript', 3),
    (900004, 900001, 'Spring Boot', 5),
    (900005, 900001, 'React', 3),
    (900006, 900001, 'JUnit', 5),
    (900007, 900001, 'Maven', 4),
    (900008, 900001, 'AWS', 4),
    (900009, 900001, 'Docker', 4),
    (900010, 900001, 'Kubernetes', 4),
    (900011, 900001, 'Terraform', 3),
    (900012, 900001, 'PostgreSQL', 4),
    (900013, 900001, 'Apache Kafka', 3),
    (900014, 900001, 'Scrum', 4),
    (900015, 900001, 'Microservices', 4),
    (900016, 900001, 'Domain-Driven Design', 3),
    (900017, 900001, 'Beekeeping', 2),
    (900018, 900001, 'Chess', 3);

-- Skill versions. skill_versions has no primary key, so INSERT IGNORE does not prevent duplicates: insert only missing rows
INSERT INTO skill_versions (skill_id, versions)
SELECT v.skill_id, v.version FROM (
    SELECT 900001 AS skill_id, '17' AS version
    UNION ALL SELECT 900001, '21'
    UNION ALL SELECT 900004, '3.2'
    UNION ALL SELECT 900005, '18'
    UNION ALL SELECT 900006, '5'
    UNION ALL SELECT 900012, '16'
) v
WHERE NOT EXISTS (SELECT 1 FROM skill_versions sv WHERE sv.skill_id = v.skill_id AND sv.versions = v.version);

-- Skills used in the project; they have to be part of the profile as well
INSERT IGNORE INTO project_skills (project_id, skills_id) VALUES
    (900001, 900001),
    (900001, 900004),
    (900001, 900005),
    (900001, 900008),
    (900001, 900010),
    (900001, 900012);
