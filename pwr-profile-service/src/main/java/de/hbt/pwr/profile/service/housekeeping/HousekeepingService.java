package de.hbt.pwr.profile.service.housekeeping;

import de.hbt.pwr.profile.errors.WebApplicationException;
import de.hbt.pwr.profile.model.HousekeepingFindings;
import de.hbt.pwr.profile.model.ProfilePicture;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.notification.AdminNotification;
import de.hbt.pwr.profile.model.profile.entries.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import javax.persistence.EntityManager;
import javax.transaction.Transactional;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Housekeeping of the data the profile service stores (#242): rows nothing reaches any more, left over by deleting
 * through collections (an entry removed from a profile keeps its row), by old data and by deletes across services.
 * Every check lists what it finds; cleaning looks again and deletes only what is still left over.
 */
@Slf4j
@Service
@Transactional
public class HousekeepingService {

    public static final String ENTRY_ROWS_WITHOUT_TYPE = "entry-rows-without-type";
    public static final String ENTRIES_WITHOUT_PROFILE = "entries-without-profile";
    public static final String PROJECTS_WITHOUT_PROFILE = "projects-without-profile";
    public static final String SKILLS_WITHOUT_PROFILE = "skills-without-profile";
    public static final String NOTIFICATIONS_WITHOUT_ENTRY = "notifications-without-entry";
    public static final String PICTURES_WITHOUT_CONSULTANT = "pictures-without-consultant";

    /** The entry types with the collection of the profile that holds them */
    private static final Map<Class<? extends ProfileEntry>, String> ENTRY_COLLECTIONS = new LinkedHashMap<>();

    static {
        ENTRY_COLLECTIONS.put(LanguageSkill.class, "languages");
        ENTRY_COLLECTIONS.put(QualificationEntry.class, "qualification");
        ENTRY_COLLECTIONS.put(TrainingEntry.class, "trainingEntries");
        ENTRY_COLLECTIONS.put(EducationEntry.class, "education");
        ENTRY_COLLECTIONS.put(SectorEntry.class, "sectors");
        ENTRY_COLLECTIONS.put(CareerEntry.class, "careerEntries");
        ENTRY_COLLECTIONS.put(SpecialFieldEntry.class, "specialFieldEntries");
    }

    /** The tables of the entry types: a row of profile_entry needs one in one of them (#236) */
    private static final List<String> ENTRY_TABLES = List.of("language_skill", "qualification_entry", "training_entry",
            "education_entry", "sector_entry", "career_entry", "special_field_entry");

    private final EntityManager entityManager;

    public HousekeepingService(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public List<HousekeepingFindings> check() {
        return List.of(
                HousekeepingFindings.of(ENTRY_ROWS_WITHOUT_TYPE, describe(entryRowsWithoutType())),
                HousekeepingFindings.of(ENTRIES_WITHOUT_PROFILE, entriesWithoutProfile().stream()
                        .map(HousekeepingService::describe).collect(Collectors.toList())),
                HousekeepingFindings.of(PROJECTS_WITHOUT_PROFILE, projectsWithoutProfile().stream()
                        .map(project -> project.getName() + " (#" + project.getId() + ")").collect(Collectors.toList())),
                HousekeepingFindings.of(SKILLS_WITHOUT_PROFILE, skillsWithoutProfile().stream()
                        .map(skill -> skill.getName() + " (#" + skill.getId() + ")").collect(Collectors.toList())),
                HousekeepingFindings.of(NOTIFICATIONS_WITHOUT_ENTRY, notificationsWithoutEntry().stream()
                        .map(notification -> "#" + notification.getId() + " " + notification.getReason()).collect(Collectors.toList())),
                HousekeepingFindings.of(PICTURES_WITHOUT_CONSULTANT, picturesWithoutConsultant().stream()
                        .map(ProfilePicture::getId).collect(Collectors.toList()))
        );
    }

    /**
     * Deletes what the check finds right now; returns how many
     */
    public int clean(String check) {
        int cleaned;
        switch (check) {
            case ENTRY_ROWS_WITHOUT_TYPE:
                cleaned = deleteEntryRowsWithoutType();
                break;
            case ENTRIES_WITHOUT_PROFILE:
                cleaned = deleteEntriesWithoutProfile();
                break;
            case PROJECTS_WITHOUT_PROFILE:
                cleaned = deleteProjectsWithoutProfile();
                break;
            case SKILLS_WITHOUT_PROFILE:
                cleaned = deleteSkillsWithoutProfile();
                break;
            case NOTIFICATIONS_WITHOUT_ENTRY:
                List<AdminNotification> notifications = notificationsWithoutEntry();
                notifications.forEach(entityManager::remove);
                log.info("Housekeeping: deleted notifications without entry " + ids(notifications, AdminNotification::getId));
                cleaned = notifications.size();
                break;
            case PICTURES_WITHOUT_CONSULTANT:
                List<ProfilePicture> pictures = picturesWithoutConsultant();
                pictures.forEach(entityManager::remove);
                log.info("Housekeeping: deleted pictures without consultant " + ids(pictures, ProfilePicture::getId));
                cleaned = pictures.size();
                break;
            default:
                throw new WebApplicationException(HttpStatus.NOT_FOUND, "No housekeeping check " + check);
        }
        entityManager.flush();
        return cleaned;
    }

    // Rows of profile_entry without a row of an entry type (#236): native, Hibernate can't load them

    /** Id and name of the element of each row */
    private List<Object[]> entryRowsWithoutType() {
        String withoutType = ENTRY_TABLES.stream()
                .map(table -> "not exists (select 1 from " + table + " t where t.id = e.id)")
                .collect(Collectors.joining(" and "));
        List<?> rows = entityManager.createNativeQuery("select e.id, n.name from profile_entry e"
                + " left join name_entity n on n.id = e.name_entity_id where " + withoutType + " order by e.id")
                .getResultList();
        return rows.stream().map(row -> (Object[]) row).collect(Collectors.toList());
    }

    private static List<String> describe(List<Object[]> rows) {
        return rows.stream().map(row -> row[1] + " (#" + row[0] + ")").collect(Collectors.toList());
    }

    private int deleteEntryRowsWithoutType() {
        Set<Long> ids = entryRowsWithoutType().stream().map(row -> ((Number) row[0]).longValue()).collect(Collectors.toSet());
        if (ids.isEmpty()) {
            return 0;
        }
        deleteNotificationsAboutEntries(ids);
        entityManager.createNativeQuery("delete from profile_entry where id in :ids").setParameter("ids", ids).executeUpdate();
        log.info("Housekeeping: deleted rows of profile_entry without an entry type " + ids);
        return ids.size();
    }

    // Entries that no profile holds: removed from a profile, the row stays (AGENTS.md, Hibernate)

    private List<ProfileEntry> entriesWithoutProfile() {
        return ENTRY_COLLECTIONS.entrySet().stream()
                .flatMap(type -> entityManager.createQuery("select e from " + type.getKey().getSimpleName() + " e"
                        + " where not exists (select p from Profile p join p." + type.getValue() + " x where x = e)"
                        + " order by e.id", ProfileEntry.class).getResultList().stream())
                .collect(Collectors.toList());
    }

    private static String describe(ProfileEntry entry) {
        String name = entry.getNameEntity() != null ? entry.getNameEntity().getName() : "";
        return name + " (" + entry.getClass().getSimpleName() + " #" + entry.getId() + ")";
    }

    private int deleteEntriesWithoutProfile() {
        List<ProfileEntry> entries = entriesWithoutProfile();
        Set<Long> ids = entries.stream().map(ProfileEntry::getId).collect(Collectors.toSet());
        deleteNotificationsAboutEntries(ids);
        entries.forEach(entityManager::remove);
        log.info("Housekeeping: deleted entries without profile " + ids);
        return entries.size();
    }

    private void deleteNotificationsAboutEntries(Set<Long> ids) {
        if (!ids.isEmpty()) {
            entityManager.createQuery("select n from ProfileEntryNotification n where n.profileEntryId in :ids",
                    AdminNotification.class).setParameter("ids", ids).getResultList().forEach(entityManager::remove);
        }
    }

    // Projects and skills that no profile holds

    private List<Project> projectsWithoutProfile() {
        return entityManager.createQuery("select pr from Project pr"
                + " where not exists (select p from Profile p join p.projects x where x = pr) order by pr.id", Project.class)
                .getResultList();
    }

    private int deleteProjectsWithoutProfile() {
        List<Project> projects = projectsWithoutProfile();
        projects.forEach(project -> {
            entityManager.createQuery("select n from ProjectNotification n where n.project = :p", AdminNotification.class)
                    .setParameter("p", project).getResultList().forEach(entityManager::remove);
            // The skills of a project are those of the profile; one no profile holds is found as such
            project.getSkills().clear();
            entityManager.remove(project);
        });
        log.info("Housekeeping: deleted projects without profile " + ids(projects, Project::getId));
        return projects.size();
    }

    private List<Skill> skillsWithoutProfile() {
        return entityManager.createQuery("select s from Skill s"
                + " where not exists (select p from Profile p join p.skills x where x = s)"
                + " and not exists (select pr from Project pr join pr.skills y where y = s) order by s.id", Skill.class)
                .getResultList();
    }

    private int deleteSkillsWithoutProfile() {
        List<Skill> skills = skillsWithoutProfile();
        skills.forEach(this::deleteSkill);
        log.info("Housekeeping: deleted skills without profile " + ids(skills, Skill::getId));
        return skills.size();
    }

    private void deleteSkill(Skill skill) {
        entityManager.createQuery("select n from SkillNotification n where n.skill = :s", AdminNotification.class)
                .setParameter("s", skill).getResultList().forEach(entityManager::remove);
        entityManager.remove(skill);
    }

    // Notifications and pictures

    private List<AdminNotification> notificationsWithoutEntry() {
        return entityManager.createQuery("select n from ProfileEntryNotification n where n.profileEntryId is not null"
                + " and not exists (select e from ProfileEntry e where e.id = n.profileEntryId) order by n.id", AdminNotification.class)
                .getResultList();
    }

    /**
     * Pictures no consultant shows. A picture is uploaded before the consultant that shows it is saved, so in that
     * moment a new one is found too; cleaning looks again right before deleting.
     */
    private List<ProfilePicture> picturesWithoutConsultant() {
        return entityManager.createQuery("select pic from ProfilePicture pic"
                + " where not exists (select c from Consultant c where c.profilePictureId = pic.id) order by pic.id", ProfilePicture.class)
                .getResultList();
    }

    private static <T> List<Object> ids(List<T> items, java.util.function.Function<T, Object> id) {
        return items.stream().map(id).collect(Collectors.toList());
    }
}
