package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.data.*;
import de.hbt.pwr.profile.errors.PwrValidationException;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.notification.AdminNotification;
import de.hbt.pwr.profile.model.profile.NameEntityType;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.*;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static org.apache.logging.log4j.LogManager.getLogger;

/**
 * Service that allows various update operations on a {@link Profile}
 */
@Transactional
@Service
public class ProfileUpdateService {

    private static class Pair<K, V> {
        private K key;
        private V value;
        private Pair(K key, V value) {
            this.key = key;
            this.value = value;
        }
        private K getKey() {
            return key;
        }
        private V getValue() {
            return value;
        }
    }

    private static final Logger LOG = getLogger(ProfileUpdateService.class);

    private final NameEntityRepository nameEntityRepository;
    private final SkillRepository skillRepository;
    private final ProfileEntryDAO profileEntryDAO;
    private final ProjectRepository projectRepository;
    private final ProfileRepository profileRepository;
    private final AdminNotificationService adminNotificationService;
    private final ProfileValidationService profileValidationService;

    @Autowired
    public ProfileUpdateService(NameEntityRepository nameEntityRepository, SkillRepository skillRepository,
                                ProfileEntryDAO profileEntryDAO, ProjectRepository projectRepository,
                                ProfileRepository profileRepository, AdminNotificationService adminNotificationService,
                                ProfileValidationService profileValidationService) {
        this.nameEntityRepository = nameEntityRepository;
        this.skillRepository = skillRepository;
        this.profileEntryDAO = profileEntryDAO;
        this.projectRepository = projectRepository;
        this.profileRepository = profileRepository;
        this.adminNotificationService = adminNotificationService;
        this.profileValidationService = profileValidationService;
    }


    /**
     * Invokes merging of given entity into the set of existing entities, while resolving potential conflicts.
     * <p>
     * This methods aims to provide consistency amoing {@link NameEntity} of the same {@link NameEntityType}.
     * Whenever a {@link NameEntity} is supposed to be new (i.E. it's {@link NameEntity#name} equals <code>null</code>,
     * it has to be checked that no concurrent {@link NameEntity} with the same {@link NameEntity#name} and
     * {@link NameEntity#type} exists.
     * </p>
     * <p>
     * This method checks if a concurrent entity exists. If one exists that describes the same {@link NameEntity}
     * (logically), the input <code>nameEntity</code> is discarded and the concurrent {@link NameEntity}
     * returned. If no concurrent entity exists, the input <code>nameEntity</code> is persistently stored
     * and returned.
     * </p>
     *
     * @param nameEntity    is the {@link NameEntity} that is supposed to be merged into the persistent storage
     * @param newEntityType is the type of the {@link NameEntity}, which is not necessarily set for new {@link NameEntity}s
     * @return either the concurrent or the given {@link NameEntity}
     */
    private Pair<Boolean, NameEntity> mergeNameEntity(@NotNull NameEntity nameEntity, NameEntityType newEntityType) {
        NameEntity res = nameEntity;
        Boolean created = false;
        LOG.debug("NameEntity: " + nameEntity.toString());
        List<NameEntity> names = nameEntityRepository.findAll();
        NameEntity concurrentEntity = nameEntityRepository.findByNameAndType(nameEntity.getName(), newEntityType);
        LOG.debug("Concurrent: " + (concurrentEntity == null ? null : concurrentEntity.toString()));
        if (concurrentEntity != null) {
            res = concurrentEntity;
        } else {
            res.setType(newEntityType);
            res = nameEntityRepository.save(nameEntity);
            created = true;
        }
        return new Pair<>(created, res);
    }

    public <T extends ProfileEntry> T persistEntry(T entry, Profile profile, NameEntityType nameEntityType,Set<AdminNotification> adminNotifications) {
        Pair<Boolean, NameEntity> res = mergeNameEntity(entry.getNameEntity(), nameEntityType);
        entry.setNameEntity(res.getValue());
        entry = profileEntryDAO.update(entry);
        if (res.getKey()) {
            adminNotifications.add(adminNotificationService.createProfileEntryNotification(profile, entry.getId(), res.getValue()));
        }
        return entry;
    }


    /**
     * Persists the given set of entries and resolves conflicts while doing so.
     * Possible conflicts:
     * <ul>
     * <li>
     * The {@link ProfileEntry#getNameEntity()} has a null ID but a name entity with the same name already exists.
     * Reolsved by using the existing entity.
     * </li>
     * </ul>
     *
     * @param entries to be persisted
     * @return persisted entries
     */
    protected <T extends ProfileEntry> Set<T> persistEntries(Set<T> entries, Profile profile, NameEntityType nameEntityType,Set<AdminNotification> adminNotifications) {
        return entries.stream().map(e -> persistEntry(e, profile, nameEntityType, adminNotifications)).collect(Collectors.toSet());
    }


    private Skill importSkill(Profile profile, Skill skill, Map<String, Skill> skillsByLcName, Set<AdminNotification> adminNotifications) {
        // Fix skill name
        boolean newSkillCreated = false;
        skill.setName(skill.getName().trim());
        Skill res;
        Skill concurrent = skillsByLcName.get(skill.getName().toLowerCase());
        LOG.debug("Skill: " + skill.toString());
        LOG.debug("Concurrent skill: " + (concurrent == null ? null : concurrent.toString()));
        if (concurrent == null) {
            if (skill.getId() == null) {
                newSkillCreated = true;
            } else {
                res = skill;
            }
            // persist in any case, Skill might be detached and then a merge occurs (update)
            res = skillRepository.saveAndFlush(skill);
        } else {
            res = concurrent;
            if (skill.getRating() > concurrent.getRating()) {
                res.setRating(skill.getRating());
                skillRepository.flush();
            }
        }
        // Do notifications
        Optional<AdminNotification> notification = adminNotificationService.createSkillNotification(profile, skill, newSkillCreated);
        if(notification.isPresent()) {
            adminNotifications.add(notification.get());
        }
        return res;
    }

    /**
     * Imports Skills from a project and makes sure they are also in the set of profile skills.
     *
     * @param project defines the imported skills
     * @return the imported {@link Project} with possible changed skills in the project. The {@link Project#skills} will
     * have been replaced by a new Set.
     */
    protected Project importProjectSkills(Profile profile, Project project, Set<AdminNotification> adminNotifications) {
        Set<Skill> profileSkills = profile.getSkills();
        Set<Skill> projectSkills = project.getSkills();
        Map<String, Skill> profileSkillsByLcName = new HashMap<>();
        profileSkills.forEach(skill -> profileSkillsByLcName.put(skill.getName().toLowerCase(), skill));
        Set<Skill> newProjectSkills = new HashSet<>();
        projectSkills.forEach(skill -> {
            skill = importSkill(profile, skill, profileSkillsByLcName, adminNotifications);
            newProjectSkills.add(skill);

            // Only works on well defined hash code AND correctly persisted skill (With correct ID set)
            if(profileSkills.add(skill)) {
                profileSkillsByLcName.put(skill.getName().toLowerCase(), skill);
            }
        });
        project.getSkills().clear(); // do not replace persistent collection but modify them
        project.getSkills().addAll(newProjectSkills);
        return project;
    }

    private Project importProject(Project project) {
        Pair<Boolean, NameEntity> res;
        if (project.getBroker() != null) {
            res = mergeNameEntity(project.getBroker(), NameEntityType.COMPANY);
            project.setBroker(res.getValue());
        }
        if (project.getClient() != null) {
            res = mergeNameEntity(project.getClient(), NameEntityType.COMPANY);
            project.setClient(res.getValue());
        }
        project.setProjectRoles(project.getProjectRoles()
                .stream()
                .map(ne -> mergeNameEntity(ne, NameEntityType.PROJECT_ROLE).getValue())
                .collect(Collectors.toSet()));

        if(isNewProject(project)) {
            return projectRepository.saveAndFlush(project);
        }

        // echt scheiße!
        Set<Skill> skills = new HashSet<>(project.getSkills());
        project.getSkills().clear();
        project = projectRepository.saveAndFlush(project);
        project.getSkills().addAll(skills);
        return projectRepository.saveAndFlush(project);
    }

    private boolean isNewProject(Project project) {
        return project.getId() == null;
    }

    private void persistNameEntities(Profile profile,Set<AdminNotification> adminNotifications) {
        if (profile.getEducation().size() > 0) {
            profile.setEducation(persistEntries(profile.getEducation(), profile, NameEntityType.EDUCATION,adminNotifications));
        }

        if (profile.getQualification().size() > 0) {
            profile.setQualification(persistEntries(profile.getQualification(), profile, NameEntityType.QUALIFICATION, adminNotifications));
        }

        if (profile.getLanguages().size() > 0) {
            profile.setLanguages(persistEntries(profile.getLanguages(), profile, NameEntityType.LANGUAGE, adminNotifications));
        }

        if (profile.getSectors().size() > 0) {
            profile.setSectors(persistEntries(profile.getSectors(), profile, NameEntityType.SECTOR, adminNotifications));
        }

        if (profile.getTrainingEntries().size() > 0) {
            profile.setTrainingEntries(persistEntries(profile.getTrainingEntries(), profile, NameEntityType.TRAINING, adminNotifications));
        }

        if (profile.getCareerEntries().size() > 0) {
            profile.setCareerEntries(persistEntries(profile.getCareerEntries(), profile, NameEntityType.CAREER, adminNotifications));
        }

        if (profile.getKeySkillEntries().size() > 0) {
            profile.setKeySkillEntries(persistEntries(profile.getKeySkillEntries(), profile, NameEntityType.KEY_SKILL, adminNotifications));
        }
    }

    /**
     * Removes invalid {@link ProfileEntry} values. The following values are considered invalid:
     * <ul>
     * <li>{@link ProfileEntry#getNameEntity()} is <code>null</code></li>
     * <li>A {@link ProfileEntry} with the same {@link ProfileEntry#getNameEntity()} is already existing in the set
     * of entries</li>
     * </ul>
     *
     * @param entries the set of entries that is checked
     */
    private void removeInvalidEntries(Set<? extends ProfileEntry> entries) {
        Set<String> names = new HashSet<>();
        entries.removeIf(entry -> {
            boolean remove = false;
            if (entry.getNameEntity() == null) {
                remove = true;
            } else {
                if (names.contains(entry.getNameEntity().getName())) {
                    remove = true;
                }
                names.add(entry.getNameEntity().getName());
            }
            return remove;
        });
    }

    private void removeInvalidEducationEntries(Set<EducationEntry> entries) {
        Set<EducationEntry> educationEntries = new HashSet<>();
        entries.removeIf(entry -> {
            boolean remove = false;
            if (entry.getNameEntity() == null) {
                remove = true;
            } else {
                if (educationEntries.stream()
                        .anyMatch(ee -> ee.getNameEntity().getName().equals(entry.getNameEntity().getName())
                                && ee.getDegree().equals(entry.getDegree()))) {
                    remove = true;
                }
                educationEntries.add(entry);
            }
            return remove;
        });
    }

    /**
     * Checks for invalid entries. Invalid entries may be one of the following:
     * <ul>
     * <li>Entries that reference no {@link NameEntity}</li>
     * <li>{@link CareerElement} whose {@link CareerElement#startDate} is before {@link CareerElement#endDate}</li>
     * <li>Entries who share the same {@link NameEntity} (Duplicates)</li>
     * </ul>
     *
     * @param profile is the profile that is checked
     */
    private void removeInvalidEntries(Profile profile) {
        removeInvalidEducationEntries(profile.getEducation());
        removeInvalidEntries(profile.getLanguages());
        removeInvalidEntries(profile.getTrainingEntries());
        removeInvalidEntries(profile.getSectors());
        removeInvalidEntries(profile.getQualification());
        removeInvalidEntries(profile.getCareerEntries());
        removeInvalidEntries(profile.getKeySkillEntries());
    }

    private void importProjects(Profile profile) {
        Set<Project> projects = profile.getProjects()
                .stream()
                .map(this::importProject)
                .collect(Collectors.toSet());
        profile.setProjects(projects);
    }


    protected void importProfileSkills(Profile profile, Set<AdminNotification> adminNotifications) {
        Map<String, Skill> skillsByLcName = new HashMap<>();
        profile.getSkills().forEach(skill -> {
            Skill res = importSkill(profile, skill, skillsByLcName, adminNotifications);
            skillsByLcName.put(res.getName().toLowerCase(), res);
        });
        profile.getSkills().clear(); // do not replace but modify persistent collection
        profile.getSkills().addAll(skillsByLcName.values());
    }

    protected void importProjectSkills(Profile profile, Set<AdminNotification> adminNotifications) {
        Set<Project> projects = profile.getProjects().stream()
                .map(project -> importProjectSkills(profile, project, adminNotifications))
                .collect(Collectors.toSet());
        profile.getProjects().clear();
        profile.getProjects().addAll(projects);
    }


    public Profile importProfile(Profile profile) {
        Set<AdminNotification> adminNotifications = new HashSet<>();
        Collection<String> errors = profileValidationService.validateProfile(profile);
        if (!errors.isEmpty()) {
            throw new PwrValidationException(errors);
        }

        LOG.info(profile.toString() + ": Importing profile.");
        removeInvalidEntries(profile);
        LOG.info(profile.toString() + ": Persisting name entities.");
        persistNameEntities(profile, adminNotifications);
        // Note: order is important here. Cascading is deactivated, so
        // it is important to first persist all new profile skills,
        // then all project skills and THEN the projects.
        LOG.info(profile.toString() + ": Importing profile skills.");
        importProfileSkills(profile, adminNotifications);
        LOG.info(profile.toString() + ": Importing project skills.");
        importProjectSkills(profile, adminNotifications);
        LOG.info(profile.toString() + ": Importing projects.");
        importProjects(profile);
        LOG.info(profile.toString() + ": Importing done.");
        profile.setLastEdited(LocalDateTime.now());
        profile = profileRepository.save(profile);
        LOG.info("Profile saved...");
        adminNotificationService.emit(adminNotifications);
        return profile;
    }

    public Profile updateProfile(Profile profile) {

        profile = importProfile(profile);
        adminNotificationService.emit(adminNotificationService.createProfileUpdatedNotification(profile));
        return profile;
    }
}
