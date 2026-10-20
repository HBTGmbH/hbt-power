-- Sample skill tree for local development. Run with `mvn sql:execute` (see pom.xml); the tables must exist,
-- so start the service with localDev at least once first. The service rebuilds its search index on every localDev start,
-- so restart it afterwards to make the skills searchable.
-- Fixed ids from 900001 and INSERT IGNORE make it safe to run again: existing rows are kept, deleted rows come back,
-- and data created through the UI is not touched.
--
-- Categories get a German name (locale 'deu', used by view profiles and reports); skills only have their base name.
-- Categories marked as display group their skills in view profiles. Without a flag, the second tree level is used.

-- Categories: (id, qualifier, parent, is_display)
INSERT IGNORE INTO skill_category (id, qualifier, category_id, is_display, is_blacklisted, is_custom) VALUES
    -- Information Technology
    (900001, 'Information Technology', NULL, 0, 0, 0),
    (900002, 'Software Development', 900001, 0, 0, 0),
    (900003, 'Programming Languages', 900002, 1, 0, 0),
    (900004, 'Frameworks', 900002, 0, 0, 0),
    (900005, 'Backend Frameworks', 900004, 1, 0, 0),
    (900006, 'Frontend Frameworks', 900004, 1, 0, 0),
    (900007, 'Testing', 900002, 1, 0, 0),
    (900008, 'Build Tools', 900002, 1, 0, 0),
    (900009, 'Cloud & Infrastructure', 900001, 0, 0, 0),
    (900010, 'Cloud Platforms', 900009, 1, 0, 0),
    (900011, 'Containers & Orchestration', 900009, 1, 0, 0),
    (900012, 'Infrastructure as Code', 900009, 1, 0, 0),
    (900013, 'CI/CD', 900009, 1, 0, 0),
    (900014, 'Data', 900001, 0, 0, 0),
    (900015, 'Databases', 900014, 1, 0, 0),
    (900016, 'Messaging', 900014, 1, 0, 0),
    (900017, 'Data Engineering', 900014, 1, 0, 0),
    (900018, 'Methods', 900001, 0, 0, 0),
    (900019, 'Agile Methods', 900018, 1, 0, 0),
    (900020, 'Architecture', 900018, 1, 0, 0),
    (900021, 'Security', 900001, 0, 0, 0),
    -- Agriculture
    (900022, 'Agriculture', NULL, 0, 0, 0),
    (900023, 'Crop Farming', 900022, 0, 0, 0),
    (900024, 'Livestock', 900022, 0, 0, 0),
    (900025, 'Agricultural Machinery', 900022, 0, 0, 0),
    (900026, 'Forestry', 900022, 0, 0, 0),
    -- Gaming
    (900027, 'Gaming', NULL, 0, 0, 0),
    (900028, 'Game Development', 900027, 0, 0, 0),
    (900029, 'Esports', 900027, 0, 0, 0),
    (900030, 'Tabletop Games', 900027, 0, 0, 0),
    -- Unknown skills land here (CategoryService.getOther), the service fails without it
    (900031, 'Other', NULL, 0, 0, 0);

-- German category names; the localized_qualifier id equals the category id
INSERT IGNORE INTO localized_qualifier (id, locale, qualifier) VALUES
    (900001, 'deu', 'Informationstechnologie'),
    (900002, 'deu', 'Softwareentwicklung'),
    (900003, 'deu', 'Programmiersprachen'),
    (900004, 'deu', 'Frameworks'),
    (900005, 'deu', 'Backend-Frameworks'),
    (900006, 'deu', 'Frontend-Frameworks'),
    (900007, 'deu', 'Testen'),
    (900008, 'deu', 'Build-Werkzeuge'),
    (900009, 'deu', 'Cloud & Infrastruktur'),
    (900010, 'deu', 'Cloud-Plattformen'),
    (900011, 'deu', 'Container & Orchestrierung'),
    (900012, 'deu', 'Infrastructure as Code'),
    (900013, 'deu', 'CI/CD'),
    (900014, 'deu', 'Daten'),
    (900015, 'deu', 'Datenbanken'),
    (900016, 'deu', 'Messaging'),
    (900017, 'deu', 'Data Engineering'),
    (900018, 'deu', 'Methoden'),
    (900019, 'deu', 'Agile Methoden'),
    (900020, 'deu', 'Architektur'),
    (900021, 'deu', 'IT-Sicherheit'),
    (900022, 'deu', 'Landwirtschaft'),
    (900023, 'deu', 'Ackerbau'),
    (900024, 'deu', 'Viehwirtschaft'),
    (900025, 'deu', 'Landmaschinen'),
    (900026, 'deu', 'Forstwirtschaft'),
    (900027, 'deu', 'Gaming'),
    (900028, 'deu', 'Spieleentwicklung'),
    (900029, 'deu', 'E-Sport'),
    (900030, 'deu', 'Tabletop-Spiele');

-- Careful, the column names are swapped in the mapping: qualifiers_id is the category, skill_category_id the localized qualifier
INSERT IGNORE INTO skill_category_qualifiers (qualifiers_id, skill_category_id) VALUES
    (900001, 900001), (900002, 900002), (900003, 900003), (900004, 900004), (900005, 900005),
    (900006, 900006), (900007, 900007), (900008, 900008), (900009, 900009), (900010, 900010),
    (900011, 900011), (900012, 900012), (900013, 900013), (900014, 900014), (900015, 900015),
    (900016, 900016), (900017, 900017), (900018, 900018), (900019, 900019), (900020, 900020),
    (900021, 900021), (900022, 900022), (900023, 900023), (900024, 900024), (900025, 900025),
    (900026, 900026), (900027, 900027), (900028, 900028), (900029, 900029), (900030, 900030);

-- Skills: (id, qualifier, category)
INSERT IGNORE INTO skill (id, qualifier, category_id, is_custom) VALUES
    -- Programming Languages
    (900001, 'Java', 900003, 0),
    (900002, 'Kotlin', 900003, 0),
    (900003, 'TypeScript', 900003, 0),
    (900004, 'JavaScript', 900003, 0),
    (900005, 'Python', 900003, 0),
    (900006, 'Go', 900003, 0),
    (900007, 'Rust', 900003, 0),
    (900008, 'C#', 900003, 0),
    (900009, 'C++', 900003, 0),
    (900010, 'SQL', 900003, 0),
    -- Backend Frameworks
    (900011, 'Spring Boot', 900005, 0),
    (900012, 'Quarkus', 900005, 0),
    (900013, 'Micronaut', 900005, 0),
    (900014, 'ASP.NET Core', 900005, 0),
    (900015, 'Django', 900005, 0),
    (900016, 'Express', 900005, 0),
    -- Frontend Frameworks
    (900017, 'React', 900006, 0),
    (900018, 'Angular', 900006, 0),
    (900019, 'Vue.js', 900006, 0),
    (900020, 'Svelte', 900006, 0),
    -- Testing
    (900021, 'JUnit', 900007, 0),
    (900022, 'Mockito', 900007, 0),
    (900023, 'Testcontainers', 900007, 0),
    (900024, 'Cypress', 900007, 0),
    (900025, 'Playwright', 900007, 0),
    (900026, 'Jest', 900007, 0),
    -- Build Tools
    (900027, 'Maven', 900008, 0),
    (900028, 'Gradle', 900008, 0),
    (900029, 'npm', 900008, 0),
    (900030, 'Webpack', 900008, 0),
    -- Cloud Platforms
    (900031, 'AWS', 900010, 0),
    (900032, 'Microsoft Azure', 900010, 0),
    (900033, 'Google Cloud Platform', 900010, 0),
    -- Containers & Orchestration
    (900034, 'Docker', 900011, 0),
    (900035, 'Podman', 900011, 0),
    (900036, 'Kubernetes', 900011, 0),
    (900037, 'Helm', 900011, 0),
    (900038, 'OpenShift', 900011, 0),
    -- Infrastructure as Code
    (900039, 'Terraform', 900012, 0),
    (900040, 'Ansible', 900012, 0),
    (900041, 'Pulumi', 900012, 0),
    -- CI/CD
    (900042, 'GitHub Actions', 900013, 0),
    (900043, 'GitLab CI', 900013, 0),
    (900044, 'Jenkins', 900013, 0),
    (900045, 'Argo CD', 900013, 0),
    -- Databases
    (900046, 'PostgreSQL', 900015, 0),
    (900047, 'MariaDB', 900015, 0),
    (900048, 'Oracle Database', 900015, 0),
    (900049, 'MongoDB', 900015, 0),
    (900050, 'Redis', 900015, 0),
    (900051, 'Elasticsearch', 900015, 0),
    -- Messaging
    (900052, 'Apache Kafka', 900016, 0),
    (900053, 'RabbitMQ', 900016, 0),
    -- Data Engineering
    (900054, 'Apache Spark', 900017, 0),
    (900055, 'Apache Airflow', 900017, 0),
    (900056, 'dbt', 900017, 0),
    -- Agile Methods
    (900057, 'Scrum', 900019, 0),
    (900058, 'Kanban', 900019, 0),
    (900059, 'SAFe', 900019, 0),
    -- Architecture
    (900060, 'Microservices', 900020, 0),
    (900061, 'Domain-Driven Design', 900020, 0),
    (900062, 'Event Sourcing', 900020, 0),
    (900063, 'REST API Design', 900020, 0),
    -- Security
    (900064, 'OAuth 2.0', 900021, 0),
    (900065, 'OpenID Connect', 900021, 0),
    (900066, 'OWASP Top 10', 900021, 0),
    (900067, 'Keycloak', 900021, 0),
    -- Crop Farming
    (900068, 'Wheat Cultivation', 900023, 0),
    (900069, 'Crop Rotation', 900023, 0),
    (900070, 'Soil Analysis', 900023, 0),
    (900071, 'Organic Farming', 900023, 0),
    -- Livestock
    (900072, 'Dairy Farming', 900024, 0),
    (900073, 'Cattle Breeding', 900024, 0),
    (900074, 'Beekeeping', 900024, 0),
    -- Agricultural Machinery
    (900075, 'Tractor Operation', 900025, 0),
    (900076, 'Combine Harvester Operation', 900025, 0),
    (900077, 'GPS-Guided Precision Farming', 900025, 0),
    -- Forestry
    (900078, 'Timber Harvesting', 900026, 0),
    (900079, 'Reforestation', 900026, 0),
    -- Game Development
    (900080, 'Unity', 900028, 0),
    (900081, 'Unreal Engine', 900028, 0),
    (900082, 'Godot', 900028, 0),
    (900083, 'Level Design', 900028, 0),
    (900084, 'Pixel Art', 900028, 0),
    -- Esports
    (900085, 'Team Coordination', 900029, 0),
    (900086, 'Shoutcasting', 900029, 0),
    (900087, 'Tournament Organization', 900029, 0),
    (900088, 'Speedrunning', 900029, 0),
    -- Tabletop Games
    (900089, 'Game Mastering', 900030, 0),
    (900090, 'Chess', 900030, 0),
    (900091, 'Miniature Painting', 900030, 0);

-- Versions. skill_versions has no primary key, so INSERT IGNORE does not prevent duplicates: insert only missing rows
INSERT INTO skill_versions (skill_id, versions)
SELECT v.skill_id, v.version FROM (
    SELECT 900001 AS skill_id, '8' AS version
    UNION ALL SELECT 900001, '11'
    UNION ALL SELECT 900001, '17'
    UNION ALL SELECT 900001, '21'
    UNION ALL SELECT 900005, '3.11'
    UNION ALL SELECT 900005, '3.12'
    UNION ALL SELECT 900011, '2.7'
    UNION ALL SELECT 900011, '3.2'
    UNION ALL SELECT 900017, '17'
    UNION ALL SELECT 900017, '18'
    UNION ALL SELECT 900018, '16'
    UNION ALL SELECT 900018, '17'
    UNION ALL SELECT 900021, '4'
    UNION ALL SELECT 900021, '5'
    UNION ALL SELECT 900046, '15'
    UNION ALL SELECT 900046, '16'
) v
WHERE NOT EXISTS (SELECT 1 FROM skill_versions sv WHERE sv.skill_id = v.skill_id AND sv.versions = v.version);
