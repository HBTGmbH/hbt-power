package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.client.SkillProfileClient;
import de.hbt.pwr.profile.data.*;
import de.hbt.pwr.profile.errors.WebApplicationException;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.profile.BaseProfile;
import de.hbt.pwr.profile.model.profile.NameEntityType;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.NameEntity;
import de.hbt.pwr.profile.model.profile.entries.ProfileEntry;
import de.hbt.pwr.profile.model.profile.entries.Project;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;
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

    @Autowired
    public ProfileEntryService(NameEntityRepository nameEntityRepository,
                               ProfileEntryDAO profileEntryDAO,
                               ProfileRepository profileRepository,
                               SkillRepository skillRepository,
                               ProjectRepository projectRepository, SkillProfileClient skillProfileClient) {
        this.nameEntityRepository = nameEntityRepository;
        this.profileEntryDAO = profileEntryDAO;
        this.profileRepository = profileRepository;
        this.skillRepository = skillRepository;
        this.projectRepository = projectRepository;
        this.skillProfileClient = skillProfileClient;
    }

    public BaseProfile updateBaseProfile(Profile p, BaseProfile baseProfile) {
        p.setDescription(baseProfile.getDescription());
        p.setLastEdited(LocalDateTime.now());
        p = profileRepository.save(p);
        return new BaseProfile(p.getId(),p.getDescription(),p.getLastEdited());
    }


    // TODO 2: Result Messages
    // TODO 3: Leere Name Entity/Validierung von fachlichen Daten
    public <Entry extends ProfileEntry> Entry updateProfileEntry(Entry profileEntry, Profile profile, NameEntityType nameEntityType) {
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
    }

    public Skill updateProfileSkills(Skill skill, Profile profile) {
        Optional<Skill> concurrent = profile.getSkills()
                .stream().filter(s -> hasEqualName(s, skill)) // TODO
                .findAny();
        return concurrent
                .map(s -> updateSkill(s, skill))
                .orElseGet(() -> {
                    skillProfileClient.updateAndGetCategory(skill.getName());
                    return createNewInProfile(skill, profile);
                });
    }

    private Skill updateSkill(Skill current, Skill newSkill) {
        current.setRating(newSkill.getRating());
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

    private Skill handleProjectSkill(Skill skill, Set<Skill> profileSkills) {
        skill.setName(skill.getName().trim());
        Skill finalSkill = skill;
        Skill inPro = profileSkills.stream().filter(s -> s.getName().toLowerCase().equals(finalSkill.getName().toLowerCase())).findAny().orElse(null);
        if (inPro == null) {
            // nicht im profil
            if (skill.getId() == null) {
                skill = skillRepository.save(skill);
            }
            profileSkills.add(skill);
            skillProfileClient.updateAndGetCategory(skill.getName());
        } else {
            skill = inPro;
        }
        return skill;
    }

    private Set<Skill> updateProjectSkills(Project project, Profile profile) {
        Set<Skill> projectSkills = project.getSkills();
        Set<Skill> profileSkills = profile.getSkills();
        projectSkills = projectSkills.stream().map(s -> handleProjectSkill(s, profileSkills)).collect(Collectors.toSet());
        project.getSkills().clear();
        project.getSkills().addAll(projectSkills);
        return profileSkills;
    }


    public void deleteSkill(Long id, Profile p) {
        // TODO check Projects to delete orphan skills
        Skill toRemove = p.getSkills().stream()
                .filter(skill -> skill.getId().equals(id))
                .findAny()
                .orElseThrow(() -> new WebApplicationException(HttpStatus.NOT_FOUND, "Skill with id: " + id + " was not found!"));
        p.getSkills().remove(toRemove);
    }

    private NameEntity validateNameEntity(NameEntity nameEntity, NameEntityType type) {
        if (nameEntity == null) {
            return null;
        }
        NameEntity concurrent = nameEntityRepository.findByNameAndType(nameEntity.getName(), type);
        if (concurrent != null) {
            return concurrent;
        } else {
            return nameEntityRepository.save(NameEntity.builder().name(nameEntity.getName()).type(type).build());
        }
    }

    public Project updateProject(Project project, Profile profile) {

        if (project == null) {
            return null;
        }
        Optional<Project> repoProject = project.getId() != null ? projectRepository.findById(project.getId()) : Optional.empty();

        // clean up data / relations
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

        profile.setLastEdited(LocalDateTime.now());

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
    }
}
