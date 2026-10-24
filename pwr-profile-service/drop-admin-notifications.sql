-- #307: drops the tables of the admin notifications, which are gone (decided in #138). Hibernate (ddl-auto: update)
-- never drops a table. Run once against the profile database AFTER the profile service of #307 runs: the old one
-- still reads and deletes notifications when consultants, projects, skills and profile elements are deleted.
-- Idempotent. The subtables first (JOINED, each points to admin_notification), then the common one.
--   mariadb -u<user> -p profile < drop-admin-notifications.sql
--   locally: docker exec -i hbt-power-mariadb-1 mariadb -uroot -pchangeit profile < pwr-profile-service/drop-admin-notifications.sql

drop table if exists profile_entry_notification;
drop table if exists project_notification;
drop table if exists skill_notification;
drop table if exists profile_updated_notification;
drop table if exists admin_notification;
