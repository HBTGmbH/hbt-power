-- #215: removes the profile elements without a name (name_entity with an empty or blank name), which the profile
-- service created before #215 for emptied fields. Run once against the profile database before the merge of #215.
--
-- Projects lose such a broker, client or role (the field becomes empty), profile entries with such a name are
-- deleted (they showed nothing), and so are the admin notifications about them. Everything in one transaction; the
-- first and the last select show what there is before and after (the last one must return no rows).

select type, count(*) from name_entity where name is null or trim(name) = '' group by type;

start transaction;

create temporary table blank_name_entity as
    select id from name_entity where name is null or trim(name) = '';

create temporary table blank_profile_entry as
    select id from profile_entry where name_entity_id in (select id from blank_name_entity);

create temporary table blank_notification (id bigint);
insert into blank_notification
    select id from profile_entry_notification where name_entity_id in (select id from blank_name_entity);
insert into blank_notification
    select id from profile_entry_notification where profile_entry_id in (select id from blank_profile_entry);
insert into blank_notification
    select id from project_notification where name_entity_id in (select id from blank_name_entity);

-- Projects: no broker, client or role instead of an empty one
update project set broker_id = null where broker_id in (select id from blank_name_entity);
update project set client_id = null where client_id in (select id from blank_name_entity);
delete from project_project_roles where project_roles_id in (select id from blank_name_entity);

-- Admin notifications about them
delete from profile_entry_notification where id in (select id from blank_notification);
delete from project_notification where id in (select id from blank_notification);
delete from admin_notification where id in (select id from blank_notification);

-- Profile entries with an empty name: the table of the entry type first, then the common one
delete from career_entry where id in (select id from blank_profile_entry);
delete from education_entry where id in (select id from blank_profile_entry);
delete from language_skill where id in (select id from blank_profile_entry);
delete from qualification_entry where id in (select id from blank_profile_entry);
delete from sector_entry where id in (select id from blank_profile_entry);
delete from special_field_entry where id in (select id from blank_profile_entry);
delete from training_entry where id in (select id from blank_profile_entry);
delete from profile_entry where id in (select id from blank_profile_entry);

delete from name_entity where id in (select id from blank_name_entity);

commit;

drop temporary table blank_notification;
drop temporary table blank_profile_entry;
drop temporary table blank_name_entity;

select type, count(*) from name_entity where name is null or trim(name) = '' group by type;
