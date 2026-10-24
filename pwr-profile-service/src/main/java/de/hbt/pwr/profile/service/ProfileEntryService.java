package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.client.SkillProfileClient;
import de.hbt.pwr.profile.data.AdminNotificationRepository;
import de.hbt.pwr.profile.data.*;
import de.hbt.pwr.profile.errors.WebApplicationException;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.profile.BaseProfile;
import de.hbt.pwr.profile.model.profile.NameEntityType;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.NameEntity;
import de.hbt.pwr.profile.model.profile.entries.NameEntityFormerName;
import de.hbt.pwr.profile.model.profile.entries.ProfileEntry;
import de.hbt.pwr.profile.model.profile.entries.Project;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ProfileEntryService {

    private NameEntityRepository nameEntityRepository;
    private ProfileEntryDAO profileEntryDAO;
    private ProfileRepository profileRepository;
    private SkillRepository skillRepository;
    private ProjectRepository projectRepository;
    private SkillProfileClient skillProfileClient;
    private NameEntityFormerNameRepository formerNameRepository;
    private AdminNotificationRepository adminNotificationRepository;
    private SkillRows skillRows;

    @Autowired
    public ProfileEntryService(NameEntityRepository nameEntityRepository,
                               ProfileEntryDAO profileEntryDAO,
                               ProfileRepository profileRepository,
                               SkillRepository skillRepository,
                               ProjectRepository projectRepository, SkillProfileClient skillProfileClient,
                               NameEntityFormerNameRepository formerNameRepository,
                               AdminNotificationRepository adminNotificationRepository,
                               SkillRows skillRows) {
        this.nameEntityRepository = nameEntityRepository;
        this.profileEntryDAO = profileEntryDAO;
        this.profileRepository = profileRepository;
        this.skillRepository = skillRepository;
        this.projectRepository = projectRepository;
        this.skillProfileClient = skillProfileClient;
        this.formerNameRepository = formerNameRepository;
        this.adminNotificationRepository = adminNotificationRepository;
        this.skillRows = skillRows;
    }

    public BaseProfile updateBaseProfile(Profile p, BaseProfile baseProfile) {
        p.setDescription(baseProfile.getDescription());
        p.setLastEdited(LocalDateTime.now());
        p = profileRepository.save(p);
        return new BaseProfile(p.getId(),p.getDescription(),p.getLastEdited());
    }


    // TODO 2: Result Messages
    /**
     * @throws WebApplicationException 400 if the entry has no name (#215): it would create a profile element without
     *                                 a name
     */
    public <Entry extends ProfileEntry> Entry updateProfileEntry(Entry profileEntry, Profile profile, NameEntityType nameEntityType) {
        if (trimmedName(profileEntry.getNameEntity()) == null) {
            throw new WebApplicationException(HttpStatus.BAD_REQUEST, "A profile entry needs a name");
        }
        // The webclient sends a new entry with id -1 (ProfileTypeDataMapper), which no row has (#283)
        if (profileEntry.getId() != null && profileEntry.getId() < 0) {
            profileEntry.setId(null);
        }
        requireInProfile(profileEntry.getId(), nameEntityType.<Entry>getEntryCollection(profile), ProfileEntry::getId);
        // Every change counts as a profile update, not only the description and projects (#139)
        profile.setLastEdited(LocalDateTime.now());
        NameEntity nameEntity = validateNameEntity(profileEntry.getNameEntity(), nameEntityType);
        profileEntry.setNameEntity(nameEntity);
        if (profileEntry.getId() != null) {
            profileEntry = profileEntryDAO.update(profileEntry);
        } else {
            profileEntry = profileEntryDAO.persist(profileEntry);
        }
        nameEntityType.getEntryCollection(profile).add(profileEntry);
        return profileEntry;
    }

    public void deleteEntryWithId(Long id, Profile profile, NameEntityType nameEntityType) {
        nameEntityType.getEntryCollection(profile).removeIf(profileEntry -> profileEntry.getId().equals(id));
        profile.setLastEdited(LocalDateTime.now());
    }

    public Skill updateProfileSkills(Skill skill, Profile profile) {
        requireInProfile(skill.getId(), skillsOf(profile), Skill::getId);
        skillsEdited(profile);
        Optional<Skill> concurrent = profile.getSkills()
                .stream().filter(s -> hasEqualName(s, skill))
                .findAny();
        return concurrent
                .map(s -> updateSkill(s, skill))
                .orElseGet(() -> {
                    skill.setName(treeNameIgnoringCase(skill.getName()));
                    skillProfileClient.updateAndGetCategory(skill.getName());
                    return createNewInProfile(skill, profile);
                });
    }

    /**
     * A new skill takes the spelling of the skill tree if it only differs in case (#208); an alias stays as typed
     */
    private String treeNameIgnoringCase(String name) {
        String treeName = skillProfileClient.treeNameIgnoringCase(name.trim());
        return treeName == null ? name.trim() : treeName;
    }

    private Skill updateSkill(Skill current, Skill newSkill) {
        current.setRating(newSkill.getRating());
        current.setVersions(newSkill.getVersions());
        return current;
    }

    private Skill createNewInProfile(Skill skill, Profile profile) {
        Skill saved = skillRepository.save(skill);
        profile.getSkills().add(saved);
        return saved;
    }

    private boolean hasEqualName(Skill skill, Skill otherSkill) {
        return skill.getName().toLowerCase().equals(otherSkill.getName().toLowerCase());
    }

    private Skill handleProjectSkill(Skill skill, Profile profile) {
        Set<Skill> profileSkills = profile.getSkills();
        skill.setName(skill.getName().trim());
        Skill finalSkill = skill;
        Skill inPro = profileSkills.stream().filter(s -> s.getName().toLowerCase().equals(finalSkill.getName().toLowerCase())).findAny().orElse(null);
        if (inPro == null) {
            // nicht im profil
            requireInProfile(skill.getId(), skillsOf(profile), Skill::getId);
            skill.setName(treeNameIgnoringCase(skill.getName()));
            if (skill.getId() == null) {
                skill = skillRepository.save(skill);
            }
            profileSkills.add(skill);
            skillProfileClient.updateAndGetCategory(skill.getName());
            profile.setSkillsLastEdited(LocalDateTime.now());
        } else {
            skill = inPro;
        }
        return skill;
    }

    private Set<Skill> updateProjectSkills(Project project, Profile profile) {
        Set<Skill> projectSkills = project.getSkills();
        Set<Skill> profileSkills = profile.getSkills();
        projectSkills = projectSkills.stream().map(s -> handleProjectSkill(s, profile)).collect(Collectors.toSet());
        project.getSkills().clear();
        project.getSkills().addAll(projectSkills);
        return profileSkills;
    }


    /**
     * A skill of a project is one of the profile (<code>Project.skills</code>), so the skill goes from the projects of
     * the profile too, and then its row with the notifications about it (#254)
     */
    public void deleteSkill(Long id, Profile p) {
        Skill toRemove = p.getSkills().stream()
                .filter(skill -> skill.getId().equals(id))
                .findAny()
                .orElseThrow(() -> new WebApplicationException(HttpStatus.NOT_FOUND, "Skill with id: " + id + " was not found!"));
        p.getSkills().remove(toRemove);
        p.getProjects().forEach(project -> project.getSkills().removeIf(skill -> id.equals(skill.getId())));
        skillRows.delete(List.of(toRemove));
        skillsEdited(p);
    }

    /**
     * An id in a request must be one of the profile in the path (#255): saving under the id of another profile would
     * change that profile's entry, skill or project and move it over
     *
     * @throws WebApplicationException 404 otherwise
     */
    private static <T> void requireInProfile(Long id, Collection<T> ofProfile, Function<T, Long> idOf) {
        if (id != null && ofProfile.stream().noneMatch(element -> id.equals(idOf.apply(element)))) {
            throw new WebApplicationException(HttpStatus.NOT_FOUND, "Nothing with id " + id + " in this profile");
        }
    }

    /**
     * The skills of the profile and of its projects: a skill deleted from the profile stays in its projects (#254)
     */
    private static Set<Skill> skillsOf(Profile profile) {
        Set<Skill> skills = new HashSet<>(profile.getSkills());
        profile.getProjects().forEach(project -> skills.addAll(project.getSkills()));
        return skills;
    }

    /**
     * The profile check (#139) asks for a skill update every few months
     */
    private void skillsEdited(Profile profile) {
        LocalDateTime now = LocalDateTime.now();
        profile.setSkillsLastEdited(now);
        profile.setLastEdited(now);
    }

    /**
     * The name without spaces at the ends; null for no name or a blank one (#215)
     */
    private static String trimmedName(NameEntity nameEntity) {
        if (nameEntity == null || nameEntity.getName() == null || nameEntity.getName().isBlank()) {
            return null;
        }
        return nameEntity.getName().trim();
    }

    /**
     * The profile element of this name, created if it does not exist yet; null without a name, so there never is an
     * element without a name (#215). A former name of a renamed or merged element stands for that element (#227).
     */
    private NameEntity validateNameEntity(NameEntity nameEntity, NameEntityType type) {
        String name = trimmedName(nameEntity);
        if (name == null) {
            return null;
        }
        NameEntity concurrent = nameEntityRepository.findByNameAndType(name, type);
        if (concurrent != null) {
            return concurrent;
        }
        Optional<NameEntity> renamed = formerNameRepository.findAllByType(type).stream()
                .filter(formerName -> formerName.getName().equalsIgnoreCase(name))
                .map(NameEntityFormerName::getNameEntity)
                .findAny();
        if (renamed.isPresent()) {
            return renamed.get();
        } else {
            return nameEntityRepository.save(NameEntity.builder().name(name).type(type).build());
        }
    }

    public Project updateProject(Project project, Profile profile) {

        if (project == null) {
            return null;
        }
        requireInProfile(project.getId(), profile.getProjects(), Project::getId);
        Optional<Project> repoProject = project.getId() != null ? projectRepository.findById(project.getId()) : Optional.empty();

        // clean up data / relations; an emptied broker, client or role is none (#215)
        if (trimmedName(project.getBroker()) == null) {
            project.setBroker(null);
        }
        if (trimmedName(project.getClient()) == null) {
            project.setClient(null);
        }
        if (project.getProjectRoles() != null) {
            project.setProjectRoles(project.getProjectRoles().stream()
                    .filter(role -> trimmedName(role) != null)
                    .collect(Collectors.toSet()));
        }
        if (project.getBroker() != null && (!repoProject.isPresent() || !project.getBroker().equals(repoProject.get().getBroker()))) {
            project.setBroker(validateNameEntity(project.getBroker(), NameEntityType.COMPANY));
        }
        if (project.getClient() != null && (!repoProject.isPresent() || !project.getClient().equals(repoProject.get().getClient()))) {
            project.setClient(validateNameEntity(project.getClient(), NameEntityType.COMPANY));
        }
        if (project.getProjectRoles() != null
                && project.getProjectRoles().size() != 0
                && (!repoProject.isPresent() || !project.getProjectRoles().equals(repoProject.get().getProjectRoles()))
                ) {
            Set<NameEntity> roles = project.getProjectRoles().stream()
                    .map(ne -> validateNameEntity(ne, NameEntityType.PROJECT_ROLE))
                    .collect(Collectors.toSet());
            project.setProjectRoles(roles);
        }
        if (project.getSkills() != null
                && project.getSkills().size() != 0
                && (!repoProject.isPresent() || !project.getSkills().equals(repoProject.get().getSkills()))
                ) {
            updateProjectSkills(project, profile);
        }

        LocalDateTime now = LocalDateTime.now();
        profile.setLastEdited(now);
        // The profile check (#139) asks for an update of the project references once a year
        project.setLastEdited(now);

        // persist new project or merge existing one
        log.debug("saving project");
        project = projectRepository.save(project);

        profile.getProjects().add(project);

        profileRepository.save(profile);
        return project;
    }

    public void deleteProject(Long id, Profile p) {
        Project remove = p.getProjects().stream()
                .filter(project -> project.getId().equals(id)).findAny()
                .orElseThrow(() -> new WebApplicationException(HttpStatus.NOT_FOUND, "Project with id: " + id + " ws not found!"));
        p.getProjects().remove(remove);
        p.setLastEdited(LocalDateTime.now());
        // The row goes too, with its links to the skills, which are those of the profile (#243)
        adminNotificationRepository.deleteAll(adminNotificationRepository.findProjectNotificationsAbout(List.of(remove)));
        remove.getSkills().clear();
        projectRepository.delete(remove);
    }
}
