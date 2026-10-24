package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.client.StatisticsClient;
import de.hbt.pwr.profile.data.ConsultantRepository;
import de.hbt.pwr.profile.data.NameEntityFormerNameRepository;
import de.hbt.pwr.profile.data.NameEntityRepository;
import de.hbt.pwr.profile.data.ProfileRepository;
import de.hbt.pwr.profile.errors.WebApplicationException;
import de.hbt.pwr.profile.model.Consultant;
import de.hbt.pwr.profile.model.FormerNameDTO;
import de.hbt.pwr.profile.model.notification.AdminNotification;
import de.hbt.pwr.profile.model.notification.ProfileEntryNotification;
import de.hbt.pwr.profile.model.notification.ProjectNotification;
import de.hbt.pwr.profile.model.profile.LanguageSkillLevel;
import de.hbt.pwr.profile.model.profile.NameEntityType;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import java.time.LocalDate;
import java.util.*;
import java.util.function.BinaryOperator;
import java.util.stream.Collectors;

/**
 * Renaming, merging and deleting profile elements in all profiles (#227). Profile entries, broker, client and roles
 * of projects and the admin notifications point to a profile element by its ID; renaming changes the element,
 * merging points everything to the target, deleting removes it from the profiles.
 * <p>
 * Former names are kept (#230): a renamed or merged element keeps its old name as a former name, like the alias of a
 * skill. A new entry of that name becomes an entry of the element, and updating a view profile finds the entries it
 * showed under their former names.
 */
@Slf4j
@Service
@Transactional
public class NameEntityAdminService {

    /** The types whose elements are names of profile entries; companies and roles are only in projects */
    private static final List<NameEntityType> ENTRY_TYPES = List.of(NameEntityType.EDUCATION, NameEntityType.LANGUAGE,
            NameEntityType.QUALIFICATION, NameEntityType.SECTOR, NameEntityType.TRAINING, NameEntityType.CAREER,
            NameEntityType.SPECIAL_FIELD);

    /** The collections of {@link Profile} that hold profile entries */
    private static final List<String> PROFILE_ENTRY_COLLECTIONS = List.of("languages", "qualification", "trainingEntries",
            "education", "sectors", "careerEntries", "specialFieldEntries");

    private final NameEntityRepository nameEntityRepository;
    private final NameEntityFormerNameRepository formerNameRepository;
    private final ProfileRepository profileRepository;
    private final ConsultantRepository consultantRepository;
    private final StatisticsClient statisticsClient;
    private final EntityManager entityManager;

    public NameEntityAdminService(NameEntityRepository nameEntityRepository, NameEntityFormerNameRepository formerNameRepository,
                                  ProfileRepository profileRepository, ConsultantRepository consultantRepository,
                                  StatisticsClient statisticsClient, EntityManager entityManager) {
        this.nameEntityRepository = nameEntityRepository;
        this.formerNameRepository = formerNameRepository;
        this.profileRepository = profileRepository;
        this.consultantRepository = consultantRepository;
        this.statisticsClient = statisticsClient;
        this.entityManager = entityManager;
    }

    /**
     * The initials of the consultants whose profile uses the element, counted in this database (not in the copy of
     * the statistics)
     */
    @Transactional(readOnly = true)
    public List<String> findUsers(Long id) {
        NameEntity nameEntity = require(id);
        return consultantRepository.findAll().stream()
                .filter(consultant -> consultant.getProfile() != null && uses(consultant.getProfile(), nameEntity))
                .map(Consultant::getInitials)
                .sorted()
                .collect(Collectors.toList());
    }

    /**
     * The elements of the type that no profile uses: no entry and no project of a profile points to them. Entries
     * removed from a profile stay behind without one (Hibernate only empties their PROFILE_ID), they don't count.
     */
    @Transactional(readOnly = true)
    public List<NameEntity> findUnused(NameEntityType type) {
        StringBuilder query = new StringBuilder("select n from NameEntity n where n.type = :type");
        PROFILE_ENTRY_COLLECTIONS.forEach(collection -> query.append(" and not exists (select p from Profile p join p.")
                .append(collection).append(" e where e.nameEntity = n)"));
        query.append(" and not exists (select p from Profile p join p.projects pr where pr.client = n or pr.broker = n)")
                .append(" and not exists (select p from Profile p join p.projects pr join pr.projectRoles r where r = n)")
                .append(" order by n.name");
        return entityManager.createQuery(query.toString(), NameEntity.class)
                .setParameter("type", type)
                .getResultList();
    }

    @Transactional(readOnly = true)
    public List<FormerNameDTO> findFormerNames() {
        return formerNameRepository.findAll().stream()
                .map(formerName -> new FormerNameDTO(formerName.getType(), formerName.getName(), formerName.getNameEntity().getName()))
                .collect(Collectors.toList());
    }

    /**
     * The aliases of the element, sorted (#270): further names that stand for it, the former names from renaming and
     * merging as well as the ones an admin added. A consultant typing one gets the element.
     */
    @Transactional(readOnly = true)
    public List<String> findAliases(Long id) {
        NameEntity nameEntity = require(id);
        return formerNameRepository.findAllByNameEntity(nameEntity).stream()
                .map(NameEntityFormerName::getName)
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .collect(Collectors.toList());
    }

    /**
     * Adds an alias to the element (#270), e.g. <code>DB</code> for <code>Deutsche Bahn AG</code>. Names compare
     * ignoring case and spaces at the ends (#207, #215): 400 for a blank one, 409 if it is the name of another element
     * of the type or an alias of one; the name of the element itself or one of its aliases changes nothing.
     */
    public List<String> addAlias(Long id, String alias) {
        NameEntity nameEntity = require(id);
        String name = requireName(alias);
        findOtherOfType(nameEntity, name).ifPresent(other -> {
            throw new WebApplicationException(HttpStatus.CONFLICT,
                    "'" + other.getName() + "' (" + other.getId() + ") has the name " + name);
        });
        findAliasOfOther(nameEntity, name).ifPresent(other -> {
            throw new WebApplicationException(HttpStatus.CONFLICT,
                    name + " is an alias of '" + other.getNameEntity().getName() + "' (" + other.getNameEntity().getId() + ")");
        });
        boolean known = nameEntity.getName().trim().equalsIgnoreCase(name)
                || formerNameRepository.findAllByNameEntity(nameEntity).stream()
                .anyMatch(formerName -> formerName.getName().equalsIgnoreCase(name));
        if (!known) {
            log.info("Adding alias '" + name + "' to " + nameEntity);
            addFormerName(nameEntity, name);
        }
        return findAliases(id);
    }

    /**
     * Removes an alias of the element, ignoring case (#270); entries saved under it keep the element
     */
    public List<String> deleteAlias(Long id, String alias) {
        NameEntity nameEntity = require(id);
        String name = requireName(alias);
        formerNameRepository.findAllByNameEntity(nameEntity).stream()
                .filter(formerName -> formerName.getName().equalsIgnoreCase(name))
                .forEach(formerName -> {
                    log.info("Removing alias '" + formerName.getName() + "' of " + nameEntity);
                    formerNameRepository.delete(formerName);
                });
        return findAliases(id);
    }

    /**
     * Renames the element. 409 if another element of the type has the name, ignoring case and spaces at the ends
     * (#207, #215): that is a merge, which the admin decides. Changing only the case of the same element is a rename.
     */
    public NameEntity rename(Long id, String name) {
        NameEntity nameEntity = require(id);
        String newName = requireName(name);
        findOtherOfType(nameEntity, newName).ifPresent(other -> {
            throw new WebApplicationException(HttpStatus.CONFLICT,
                    "'" + other.getName() + "' (" + other.getId() + ") already has the name " + newName);
        });
        // An alias of another element stays with it (#270); an own alias may become the name
        findAliasOfOther(nameEntity, newName).ifPresent(alias -> {
            throw new WebApplicationException(HttpStatus.CONFLICT,
                    newName + " is an alias of '" + alias.getNameEntity().getName() + "' (" + alias.getNameEntity().getId() + ")");
        });
        String oldName = nameEntity.getName();
        if (oldName.equals(newName)) {
            return nameEntity;
        }
        log.info("Renaming " + nameEntity + " to '" + newName + "'");
        // The new name is a current name, no former one; the old one becomes a former name unless only its case changes
        removeFormerNames(nameEntity.getType(), newName);
        if (!oldName.trim().equalsIgnoreCase(newName)) {
            addFormerName(nameEntity, oldName);
        }
        nameEntity.setName(newName);
        statisticsClient.refreshConsultantsAfterCommit();
        return nameEntity;
    }

    /**
     * Merges the element <code>sourceId</code> into the element <code>targetId</code> of the same type: everything
     * that pointed to the source points to the target, and the source is deleted. Where a profile then has an entry
     * twice, one stays, except for entries with a period (career, education, training): those can be different
     * stations. A role twice in a project is once in a set anyway.
     */
    public NameEntity merge(Long sourceId, Long targetId) {
        if (Objects.equals(sourceId, targetId)) {
            throw new WebApplicationException(HttpStatus.BAD_REQUEST, "Source and target are the same profile element");
        }
        NameEntity source = require(sourceId);
        NameEntity target = require(targetId);
        if (source.getType() != target.getType()) {
            throw new WebApplicationException(HttpStatus.BAD_REQUEST,
                    "Source is " + source.getType() + ", target is " + target.getType());
        }
        log.info("Merging " + source + " into " + target);
        entriesWith(source).forEach(entry -> entry.setNameEntity(target));
        projectsWith(source).forEach(project -> {
            if (source.equals(project.getClient())) {
                project.setClient(target);
            }
            if (source.equals(project.getBroker())) {
                project.setBroker(target);
            }
            if (project.getProjectRoles().remove(source)) {
                project.getProjectRoles().add(target);
            }
        });
        notificationsWith(source).forEach(notification -> {
            if (notification instanceof ProfileEntryNotification) {
                ((ProfileEntryNotification) notification).setNameEntity(target);
            } else {
                ((ProjectNotification) notification).setNameEntity(target);
            }
        });
        entityManager.flush();
        repointRowsWithoutType(source, target);
        if (ENTRY_TYPES.contains(source.getType())) {
            profileRepository.findAll().forEach(profile -> removeDuplicates(profile, source.getType(), target));
        }
        // The former names of the source and the source itself are former names of the target
        formerNameRepository.findAllByNameEntity(source).forEach(formerName -> formerName.setNameEntity(target));
        if (!source.getName().trim().equalsIgnoreCase(target.getName().trim())) {
            addFormerName(target, source.getName());
        }
        entityManager.flush();
        nameEntityRepository.delete(source);
        statisticsClient.refreshConsultantsAfterCommit();
        return target;
    }

    /**
     * Deletes the element from all profiles: profile entries with it are deleted, broker, client or role of a project
     * become empty. The admin notifications about it go with it.
     */
    public void delete(Long id) {
        NameEntity nameEntity = require(id);
        log.info("Deleting " + nameEntity + " from all profiles");
        Set<Long> deletedEntries = new HashSet<>();
        profileRepository.findAll().forEach(profile -> ENTRY_TYPES.forEach(type -> type.getEntryCollection(profile)
                .removeIf(entry -> {
                    boolean with = nameEntity.equals(entry.getNameEntity());
                    if (with) {
                        deletedEntries.add(entry.getId());
                    }
                    return with;
                })));
        entityManager.flush();
        // Entries without a profile, which no collection above holds (removed entries keep their row)
        entriesWith(nameEntity).forEach(entry -> {
            deletedEntries.add(entry.getId());
            entityManager.remove(entry);
        });
        deletedEntries.addAll(deleteRowsWithoutType(nameEntity));
        removeFromProjects(nameEntity);
        deleteNotifications(nameEntity, deletedEntries);
        deleteElement(nameEntity);
        statisticsClient.refreshConsultantsAfterCommit();
    }

    /**
     * Deletes the elements of the type that nothing points to, checked again right now: one that a consultant uses
     * since the admin looked stays.
     */
    public List<NameEntity> deleteUnused(NameEntityType type) {
        List<NameEntity> unused = findUnused(type);
        log.info("Deleting " + unused.size() + " unused profile elements of type " + type);
        unused.forEach(nameEntity -> {
            // Entries and projects without a profile may still point to it
            Set<Long> deletedEntries = new HashSet<>();
            entriesWith(nameEntity).forEach(entry -> {
                deletedEntries.add(entry.getId());
                entityManager.remove(entry);
            });
            deletedEntries.addAll(deleteRowsWithoutType(nameEntity));
            removeFromProjects(nameEntity);
            deleteNotifications(nameEntity, deletedEntries);
            deleteElement(nameEntity);
        });
        statisticsClient.refreshConsultantsAfterCommit();
        return unused;
    }

    private NameEntity require(Long id) {
        return nameEntityRepository.findById(id)
                .orElseThrow(() -> new WebApplicationException(HttpStatus.NOT_FOUND, "No profile element " + id));
    }

    private static String requireName(String name) {
        if (name == null || name.isBlank()) {
            throw new WebApplicationException(HttpStatus.BAD_REQUEST, "A profile element needs a name");
        }
        return name.trim();
    }

    private Optional<NameEntity> findOtherOfType(NameEntity nameEntity, String name) {
        return nameEntityRepository.findAllByType(nameEntity.getType()).stream()
                .filter(other -> !other.getId().equals(nameEntity.getId()))
                .filter(other -> other.getName() != null && other.getName().trim().equalsIgnoreCase(name))
                .findAny();
    }

    private Optional<NameEntityFormerName> findAliasOfOther(NameEntity nameEntity, String name) {
        return formerNameRepository.findAllByType(nameEntity.getType()).stream()
                .filter(formerName -> !formerName.getNameEntity().getId().equals(nameEntity.getId()))
                .filter(formerName -> formerName.getName().equalsIgnoreCase(name))
                .findAny();
    }

    private void addFormerName(NameEntity nameEntity, String name) {
        removeFormerNames(nameEntity.getType(), name);
        formerNameRepository.save(NameEntityFormerName.builder()
                .name(name.trim()).type(nameEntity.getType()).nameEntity(nameEntity).build());
    }

    private void removeFormerNames(NameEntityType type, String name) {
        formerNameRepository.findAllByType(type).stream()
                .filter(formerName -> formerName.getName().equalsIgnoreCase(name.trim()))
                .forEach(formerNameRepository::delete);
    }

    private void deleteElement(NameEntity nameEntity) {
        formerNameRepository.deleteAll(formerNameRepository.findAllByNameEntity(nameEntity));
        entityManager.flush();
        nameEntityRepository.delete(nameEntity);
    }

    /**
     * The notifications about the element and about the deleted entries. Loaded instead of a bulk delete: a
     * notification spans two tables (JOINED), only deleting the entities removes both rows (#187).
     */
    private void deleteNotifications(NameEntity nameEntity, Set<Long> deletedEntries) {
        notificationsWith(nameEntity).forEach(entityManager::remove);
        deleteNotificationsAboutEntries(deletedEntries);
    }

    private void deleteNotificationsAboutEntries(Set<Long> deletedEntries) {
        if (!deletedEntries.isEmpty()) {
            entityManager.createQuery("select n from ProfileEntryNotification n where n.profileEntryId in :ids",
                    AdminNotification.class).setParameter("ids", deletedEntries).getResultList()
                    .forEach(entityManager::remove);
        }
        entityManager.flush();
    }

    private void removeFromProjects(NameEntity nameEntity) {
        projectsWith(nameEntity).forEach(project -> {
            if (nameEntity.equals(project.getClient())) {
                project.setClient(null);
            }
            if (nameEntity.equals(project.getBroker())) {
                project.setBroker(null);
            }
            project.getProjectRoles().remove(nameEntity);
        });
    }

    /**
     * The entries with the element, queried per entry type: a row of profile_entry without a row in the table of an
     * entry type (there are such in old data) can't be loaded as the abstract ProfileEntry
     */
    private List<ProfileEntry> entriesWith(NameEntity nameEntity) {
        return ENTRY_TYPES.stream()
                .flatMap(type -> entityManager.createQuery("select e from " + type.getProfileEntryClass().getSimpleName()
                        + " e where e.nameEntity = :n", type.getProfileEntryClass())
                        .setParameter("n", nameEntity)
                        .getResultList().stream())
                .collect(Collectors.toList());
    }

    /**
     * Deletes the rows of profile_entry without a type that still point to the element, after the entries were
     * removed: every row left then has no type. Returns their ids, for the notifications about them.
     */
    private List<Long> deleteRowsWithoutType(NameEntity nameEntity) {
        entityManager.flush();
        List<Long> ids = ((List<?>) entityManager
                .createNativeQuery("select id from profile_entry where name_entity_id = :n")
                .setParameter("n", nameEntity.getId())
                .getResultList()).stream()
                .map(id -> ((Number) id).longValue())
                .collect(Collectors.toList());
        if (!ids.isEmpty()) {
            log.warn("Deleting " + ids.size() + " rows of profile_entry without an entry type pointing to " + nameEntity);
            entityManager.createNativeQuery("delete from profile_entry where name_entity_id = :n")
                    .setParameter("n", nameEntity.getId())
                    .executeUpdate();
        }
        return ids;
    }

    /** Points the rows of profile_entry without a type to the target of a merge, after the entries were */
    private void repointRowsWithoutType(NameEntity source, NameEntity target) {
        int repointed = entityManager
                .createNativeQuery("update profile_entry set name_entity_id = :target where name_entity_id = :source")
                .setParameter("target", target.getId())
                .setParameter("source", source.getId())
                .executeUpdate();
        if (repointed > 0) {
            log.warn("Pointed " + repointed + " rows of profile_entry without an entry type from " + source + " to " + target);
        }
    }

    private List<Project> projectsWith(NameEntity nameEntity) {
        return entityManager.createQuery("select distinct p from Project p left join p.projectRoles r"
                + " where p.client = :n or p.broker = :n or r = :n", Project.class)
                .setParameter("n", nameEntity)
                .getResultList();
    }

    private List<AdminNotification> notificationsWith(NameEntity nameEntity) {
        List<AdminNotification> notifications = new ArrayList<>(entityManager.createQuery(
                "select n from ProfileEntryNotification n where n.nameEntity = :n", AdminNotification.class)
                .setParameter("n", nameEntity)
                .getResultList());
        notifications.addAll(entityManager.createQuery(
                "select n from ProjectNotification n where n.nameEntity = :n", AdminNotification.class)
                .setParameter("n", nameEntity)
                .getResultList());
        return notifications;
    }

    /**
     * How many consultants use each element of the type (#271), all in one go for the list of the admin area. Counted
     * like {@link #findUnused}, through the joins from <code>Profile</code>: the entries, and the client, broker and
     * roles of the projects; each profile once per element, rows without a profile not at all. Elements nobody uses
     * are there with 0.
     */
    public Map<Long, Integer> countUsers(NameEntityType type) {
        Map<Long, Integer> counts = new HashMap<>();
        nameEntityRepository.findAllByType(type).forEach(nameEntity -> counts.put(nameEntity.getId(), 0));
        profileRepository.findAll().forEach(profile -> elementsOf(profile).stream()
                .filter(nameEntity -> nameEntity.getId() != null)
                .map(NameEntity::getId)
                .distinct()
                .forEach(id -> counts.computeIfPresent(id, (key, count) -> count + 1)));
        return counts;
    }

    /**
     * Every profile element the profile uses, of any type
     */
    private static List<NameEntity> elementsOf(Profile profile) {
        List<NameEntity> elements = new ArrayList<>();
        ENTRY_TYPES.forEach(type -> type.getEntryCollection(profile)
                .forEach(entry -> elements.add(((ProfileEntry) entry).getNameEntity())));
        profile.getProjects().forEach(project -> {
            elements.add(project.getClient());
            elements.add(project.getBroker());
            elements.addAll(project.getProjectRoles());
        });
        elements.removeIf(Objects::isNull);
        return elements;
    }

    private static boolean uses(Profile profile, NameEntity nameEntity) {
        boolean inEntries = ENTRY_TYPES.stream()
                .flatMap(type -> type.getEntryCollection(profile).stream())
                .anyMatch(entry -> nameEntity.equals(((ProfileEntry) entry).getNameEntity()));
        return inEntries || profile.getProjects().stream().anyMatch(project -> nameEntity.equals(project.getClient())
                || nameEntity.equals(project.getBroker())
                || project.getProjectRoles().contains(nameEntity));
    }

    /**
     * Keeps one entry of the target where the profile now has several: the best level of a language, the newest date
     * of a qualification. Entries with a period stay.
     */
    private void removeDuplicates(Profile profile, NameEntityType type, NameEntity target) {
        BinaryOperator<ProfileEntry> better;
        switch (type) {
            case LANGUAGE:
                better = (a, b) -> level(b) > level(a) ? b : a;
                break;
            case QUALIFICATION:
                better = (a, b) -> date(b).isAfter(date(a)) ? b : a;
                break;
            case SECTOR:
            case SPECIAL_FIELD:
                better = (a, b) -> a;
                break;
            default:
                return;
        }
        Set<ProfileEntry> entries = type.getEntryCollection(profile);
        // The hash code of an entry depends on its element, which just changed: put them in again, otherwise the set
        // doesn't find the kept one, and Hibernate takes it for removed as well
        List<ProfileEntry> all = new ArrayList<>(entries);
        entries.clear();
        entries.addAll(all);
        List<ProfileEntry> ofTarget = entries.stream()
                .filter(entry -> target.equals(entry.getNameEntity()))
                .sorted(Comparator.comparing(ProfileEntry::getId))
                .collect(Collectors.toList());
        if (ofTarget.size() < 2) {
            return;
        }
        ProfileEntry kept = ofTarget.stream().reduce(better).orElseThrow();
        Set<Long> removed = ofTarget.stream().filter(entry -> entry != kept).map(ProfileEntry::getId).collect(Collectors.toSet());
        log.info("Profile " + profile.getId() + ": keeping " + type + " entry " + kept.getId() + ", removing " + removed);
        entries.removeIf(entry -> removed.contains(entry.getId()));
        entityManager.flush();
        deleteNotificationsAboutEntries(removed);
    }

    private static int level(ProfileEntry entry) {
        LanguageSkillLevel level = ((LanguageSkill) entry).getLevel();
        return level == null ? -1 : level.ordinal();
    }

    private static LocalDate date(ProfileEntry entry) {
        LocalDate date = ((QualificationEntry) entry).getDate();
        return date == null ? LocalDate.MIN : date;
    }
}
