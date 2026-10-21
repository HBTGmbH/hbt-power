-- #141: project descriptions up to 4000 characters, as Project.description declares (@Column(length = 4000)).
-- Only for databases Hibernate created with the old default varchar(255), e.g. an existing local database;
-- the production database already has varchar(4000). Hibernate (ddl-auto: update) never widens a column itself.
--   docker exec -i hbt-power-mariadb-1 mariadb -uroot -pchangeit profile < pwr-profile-service/project-description-length.sql
alter table project modify description varchar(4000);
