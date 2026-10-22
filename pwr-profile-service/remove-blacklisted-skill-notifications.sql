-- #175: removes the notifications "skill of a blacklisted category added" (reason DANGEROUS_SKILL_ADDED_BLACKLISTED).
-- The reason no longer exists in AdminNotificationReason, so Hibernate could not read these rows any more: the trash
-- of the admin notifications would fail to load. Notifications are stored JOINED: the row in skill_notification first,
-- then the one in admin_notification. Skills are not touched.
-- Run BEFORE the merge (the old profile service doesn't miss them). Idempotent.
-- Run in the profile database, e.g. mariadb -u<user> -p profile < remove-blacklisted-skill-notifications.sql
DELETE skill_notification
FROM skill_notification
         JOIN admin_notification ON admin_notification.id = skill_notification.id
WHERE admin_notification.reason = 'DANGEROUS_SKILL_ADDED_BLACKLISTED';

DELETE FROM admin_notification WHERE reason = 'DANGEROUS_SKILL_ADDED_BLACKLISTED';
