package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.data.*;
import de.hbt.pwr.profile.errors.PwrValidationException;
import de.hbt.pwr.profile.model.Skill;
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
 *
 * Only the tests use it, to import whole sample profiles: the endpoint that replaced a whole profile from the
 * request body is gone (#261), the app changes profiles entry by entry ({@code ProfileEntryService}).
 */
@Transactional
@Service
public class ProfileUpdateService {

    private static final Logger LOG = getLogger(ProfileUpdateService.class);

    private final NameEntityRepository nameEntityRepository;
    private final SkillRepository skillRepository;
    private final ProfileEntryDAO profileEntryDAO;
    private final ProjectRepository projectRepository;
    private final ProfileRepository profileRepository;
    private final ProfileValidationService profileValidationService;

    @Autowired
    public ProfileUpdateService(NameEntityRepository nameEntityRepository, SkillRepository skillRepository,
                                ProfileEntryDAO profileEntryDAO, ProjectRepository projectRepository,
                                ProfileRepository profileRepository,
                                ProfileValidationService profileValidationService) {
        this.nameEntityRepository = nameEntityRepository;
        this.skillRepository = skillRepository;
        this.profileEntryDAO = profileEntryDAO;
        this.projectRepository = projectRepository;
        this.profileRepository = profileRepository;
        this.profileValidationService = profileValidationService;
    }


    /**
     * Invokes merging of given entity into the set of existing entities, while resolving potential conflicts.
     * <p>
     * This methods aims to provide consistency amoing {@link NameEntity} of the same {@link NameEntityType}.
     * Whenever a {@link NameEntity} is supposed to be new (i.E. it's {@link NameEntity#getName()} equals <code>null</code>,
     * it has to be checked that no concurrent {@link NameEntity} with the same {@link NameEntity#getName()} and
     * {@link NameEntity#getType()} exists.
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
    private NameEntity mergeNameEntity(@NotNull NameEntity nameEntity, NameEntityType newEntityType) {
        NameEntity res = nameEntity;
        LOG.debug("NameEntity: " + nameEntity.toString());
        // Precache all
        nameEntityRepository.findAll();
        NameEntity concurrentEntity = nameEntityRepository.findByNameAndType(nameEntity.getName(), newEntityType);
        LOG.debug("Concurrent: " + (concurrentEntity == null ? null : concurrentEntity.toString()));
        if (concurrentEntity != null) {
            res = concurrentEntity;
        } else {
            res.setType(newEntityType);
            res = nameEntityRepository.save(nameEntity);
        }
        return res;
    }

    public <T extends ProfileEntry> T persistEntry(T entry, NameEntityType nameEntityType) {
        entry.setNameEntity(mergeNameEntity(entry.getNameEntity(), nameEntityType));
        return profileEntryDAO.update(entry);
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
    protected <T extends ProfileEntry> Set<T> persistEntries(Set<T> entries, NameEntityType nameEntityType) {
        return entries.stream().map(e -> persistEntry(e, nameEntityType)).collect(Collectors.toSet());
    }


    private Skill importSkill(Skill skill, Map<String, Skill> skillsByLcName) {
        // Fix skill name
        skill.setName(skill.getName().trim());
        Skill res;
        Skill concurrent = skillsByLcName.get(skill.getName().toLowerCase());
        LOG.debug("Skill: " + skill);
        LOG.debug("Concurrent skill: " + (concurrent == null ? null : concurrent.toString()));
        if (concurrent == null) {
            // persist in any case, Skill might be detached and then a merge occurs (update)
            res = skillRepository.saveAndFlush(skill);
        } else {
            res = concurrent;
            if (skill.getRating() > concurrent.getRating()) {
                res.setRating(skill.getRating());
                skillRepository.flush();
            }
        }
        return res;
    }

    /**
     * Imports Skills from a project and makes sure they are also in the set of profile skills.
     *
     * @param project defines the imported skills
     * @return the imported {@link Project} with possible changed skills in the project. The {@link Project#getSkills()} will
     * have been replaced by a new Set.
     */
    protected Project importProjectSkills(Profile profile, Project project) {
        Set<Skill> profileSkills = profile.getSkills();
        Set<Skill> projectSkills = project.getSkills();
        Map<String, Skill> profileSkillsByLcName = new HashMap<>();
        profileSkills.forEach(skill -> profileSkillsByLcName.put(skill.getName().toLowerCase(), skill));
        Set<Skill> newProjectSkills = new HashSet<>();
        projectSkills.forEach(skill -> {
            skill = importSkill(skill, profileSkillsByLcName);
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
        if (project.getBroker() != null) {
            project.setBroker(mergeNameEntity(project.getBroker(), NameEntityType.COMPANY));
        }
        if (project.getClient() != null) {
            project.setClient(mergeNameEntity(project.getClient(), NameEntityType.COMPANY));
        }
        project.setProjectRoles(project.getProjectRoles()
                .stream()
                .map(ne -> mergeNameEntity(ne, NameEntityType.PROJECT_ROLE))
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

    private void persistNameEntities(Profile profile) {
        if (profile.getEducation().size() > 0) {
            profile.setEducation(persistEntries(profile.getEducation(), NameEntityType.EDUCATION));
        }

        if (profile.getQualification().size() > 0) {
            profile.setQualification(persistEntries(profile.getQualification(), NameEntityType.QUALIFICATION));
        }

        if (profile.getLanguages().size() > 0) {
            profile.setLanguages(persistEntries(profile.getLanguages(), NameEntityType.LANGUAGE));
        }

        if (profile.getSectors().size() > 0) {
            profile.setSectors(persistEntries(profile.getSectors(), NameEntityType.SECTOR));
        }

        if (profile.getTrainingEntries().size() > 0) {
            profile.setTrainingEntries(persistEntries(profile.getTrainingEntries(), NameEntityType.TRAINING));
        }

        if (profile.getCareerEntries().size() > 0) {
            profile.setCareerEntries(persistEntries(profile.getCareerEntries(), NameEntityType.CAREER));
        }

        if (profile.getSpecialFieldEntries().size() > 0) {
            profile.setSpecialFieldEntries(persistEntries(profile.getSpecialFieldEntries(), NameEntityType.SPECIAL_FIELD));
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
     * <li>{@link CareerElement} whose {@link CareerElement#getStartDate()} is before {@link CareerElement#getEndDate()}</li>
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
        removeInvalidEntries(profile.getSpecialFieldEntries());
    }

    private void importProjects(Profile profile) {
        Set<Project> projects = profile.getProjects()
                .stream()
                .map(this::importProject)
                .collect(Collectors.toSet());
        profile.setProjects(projects);
    }


    protected void importProfileSkills(Profile profile) {
        Map<String, Skill> skillsByLcName = new HashMap<>();
        profile.getSkills().forEach(skill -> {
            Skill res = importSkill(skill, skillsByLcName);
            skillsByLcName.put(res.getName().toLowerCase(), res);
        });
        profile.getSkills().clear(); // do not replace but modify persistent collection
        profile.getSkills().addAll(skillsByLcName.values());
    }

    protected void importProjectSkills(Profile profile) {
        Set<Project> projects = profile.getProjects().stream()
                .map(project -> importProjectSkills(profile, project))
                .collect(Collectors.toSet());
        profile.getProjects().clear();
        profile.getProjects().addAll(projects);
    }


    public Profile importProfile(Profile profile) {
        Collection<String> errors = profileValidationService.validateProfile(profile);
        if (!errors.isEmpty()) {
            throw new PwrValidationException(errors);
        }

        LOG.info(profile + ": Importing profile.");
        removeInvalidEntries(profile);
        LOG.info(profile + ": Persisting name entities.");
        persistNameEntities(profile);
        // Note: order is important here. Cascading is deactivated, so
        // it is important to first persist all new profile skills,
        // then all project skills and THEN the projects.
        LOG.info(profile + ": Importing profile skills.");
        importProfileSkills(profile);
        LOG.info(profile + ": Importing project skills.");
        importProjectSkills(profile);
        LOG.info(profile + ": Importing projects.");
        importProjects(profile);
        LOG.info(profile + ": Importing done.");
        profile.setLastEdited(LocalDateTime.now());
        profile = profileRepository.save(profile);
        LOG.info("Profile saved...");
        return profile;
    }

    public Profile updateProfile(Profile profile) {
        return importProfile(profile);
    }
}
