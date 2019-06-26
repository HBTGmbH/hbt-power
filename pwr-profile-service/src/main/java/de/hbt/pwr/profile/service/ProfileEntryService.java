package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.data.*;
import de.hbt.pwr.profile.errors.WebApplicationException;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.profile.NameEntityType;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.*;
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

    @Autowired
    public ProfileEntryService(NameEntityRepository nameEntityRepository,
                               ProfileEntryDAO profileEntryDAO,
                               ProfileRepository profileRepository,
                               SkillRepository skillRepository,
                               ProjectRepository projectRepository) {
        this.nameEntityRepository = nameEntityRepository;
        this.profileEntryDAO = profileEntryDAO;
        this.profileRepository = profileRepository;
        this.skillRepository = skillRepository;
        this.projectRepository = projectRepository;
    }


    public ProfileEntry updateProfileEntry(ProfileEntry profileEntry, Profile profile, NameEntityType nameEntityType) {
        NameEntity nameEntity = validateNameEntity(profileEntry.getNameEntity(), nameEntityType);
        profileEntry.setNameEntity(nameEntity);
        if (profileEntry.getId() != null) {
            profileEntry = profileEntryDAO.update(profileEntry);
        } else {
            profileEntry = profileEntryDAO.persist(profileEntry);
        }
        switch (nameEntityType) {
            case LANGUAGE:
                profile.getLanguages().add((LanguageSkill) profileEntry);
                break;
            case EDUCATION:
                profile.getEducation().add((EducationEntry) profileEntry);
                break;
            case KEY_SKILL:
                profile.getKeySkillEntries().add((KeySkillEntry) profileEntry);
                break;
            case QUALIFICATION:
                profile.getQualification().add((QualificationEntry) profileEntry);
                break;
            case SECTOR:
                profile.getSectors().add((SectorEntry) profileEntry);
                break;
            case TRAINING:
                profile.getTrainingEntries().add((TrainingEntry) profileEntry);
                break;
            case CAREER:
                profile.getCareerEntries().add((CareerEntry) profileEntry);
                break;
            default:
        }
        return profileEntry;
    }

    public void deleteEntryWithId(Long id, Profile profile, NameEntityType nameEntityType) {
        ProfileEntry profileEntry;
        switch (nameEntityType) {
            case LANGUAGE:
                profileEntry = profileEntryDAO.find(id, LanguageSkill.class);
                profile.getLanguages().remove(profileEntry);
                break;
            case EDUCATION:
                profileEntry = profileEntryDAO.find(id, EducationEntry.class);
                profile.getEducation().remove(profileEntry);
                break;
            case KEY_SKILL:
                profileEntry = profileEntryDAO.find(id, KeySkillEntry.class);
                profile.getKeySkillEntries().remove(profileEntry);
                break;
            case QUALIFICATION:
                profileEntry = profileEntryDAO.find(id, QualificationEntry.class);
                profile.getQualification().remove(profileEntry);
                break;
            case SECTOR:
                profileEntry = profileEntryDAO.find(id, SectorEntry.class);
                profile.getSectors().remove(profileEntry);
                break;
            case TRAINING:
                profileEntry = profileEntryDAO.find(id, TrainingEntry.class);
                profile.getTrainingEntries().remove(profileEntry);
                break;
            case CAREER:
                profileEntry = profileEntryDAO.find(id, CareerEntry.class);
                profile.getCareerEntries().remove(profileEntry);
                break;
            default:
        }
    }

    public Skill updateProfileSkills(Skill skill, Profile profile) {
        skill.setName(skill.getName().trim());
        Skill finalSkill = skill;
        Skill concurrent = profile.getSkills()
                .stream().filter(s -> s.getName().toLowerCase().equals(finalSkill.getName().toLowerCase()))
                .findAny().orElse(null);

        if (concurrent != null ) {
            skill = concurrent;
            profile.getSkills().remove(concurrent);
        }
        skill = skillRepository.save(skill);
        profile.getSkills().add(skill);
        profileRepository.saveAndFlush(profile);
        return skill;
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
        NameEntity res = nameEntity;
        NameEntity concurrent = nameEntityRepository.findByNameAndType(nameEntity.getName(), type);
        if (concurrent != null) {
            res = concurrent;
        } else {
            res.setType(type);
            res = nameEntityRepository.save(res);
            // Notification
        }
        return res;
    }

    public Project updateProject(Project project, Profile profile) {

        if (project == null){
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

        if (project.getSkills() != null) {
            profile.getSkills().addAll(project.getSkills());  //TODO entscheiden ob die randeffekte hier auftreten sollen bzw. wie sie geändert werden sollen
        }
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
