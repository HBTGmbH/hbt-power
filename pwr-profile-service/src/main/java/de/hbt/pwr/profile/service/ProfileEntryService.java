package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.data.*;
import de.hbt.pwr.profile.errors.WebApplicationException;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.profile.NameEntityType;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import static java.lang.StrictMath.max;

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

    private Profile saveProfile(Profile profile) {
        return profileRepository.save(profile);
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
        saveProfile(profile);
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
        saveProfile(profile);
    }


    public Skill updateProfileSkills(Skill skill, Profile profile) {
// Fix skill name
        skill.setName(skill.getName().trim());
        Skill res;
        Skill concurrent = profile.getSkills()
                .stream().filter(s -> s.getName().toLowerCase().equals(skill.getName().toLowerCase()))
                .findAny().orElse(null);

        if (concurrent == null) {
            // Only persist if the ID is null, otherwise, leave 'res = skill'
            if (skill.getId() == null) {
                res = skillRepository.save(skill);
                profile.getSkills().add(res);
            } else {
                res = skill;
                profile.getSkills().add(res);
            }
        } else {
            res = concurrent;
            if (skill.getRating() > res.getRating()) {
                res.setRating(skill.getRating());
            }
        }
        return skillRepository.save(res);
    }


    private Skill handleSkill(Skill skill, Set<Skill> profileSkills) {
        if (!profileSkills.contains(skill)) {
            if (skill.getId() == null) {
                skill = skillRepository.save(skill);
                profileSkills.add(skill);
            } else {
                // rating check
                Skill finalSkill = skill;
                Optional<Skill> opt = profileSkills.stream().filter(skill1 -> skill1.getName().toLowerCase().equals(finalSkill.getName().toLowerCase())).findAny();
                if (opt.isPresent()) {
                    // change rating
                    skill.setRating(max(skill.getRating(), opt.get().getRating()));
                    opt.get().setRating(max(skill.getRating(), opt.get().getRating()));
                } else {
                    profileSkills.add(skill);
                }
            }
        }
        return skill;
    }

    private Set<Skill> updateProjectSkills(Project project, Profile profile) {
        // 1. alle skills loopen
        // 2. prüfen ob jeder skill aus dem projekt auch im profile vorkommt
        // 3. wenn ja rating prüfen
        // 4. wenn nein -> neuen skill bei nullID, -> skill dem Profil hinzufügen

        Set<Skill> projectSkills = project.getSkills();
        Set<Skill> profileSkills = profile.getSkills();
        projectSkills = projectSkills.stream().map(s -> handleSkill(s, profileSkills)).collect(Collectors.toSet());
        return null;
    }



    public void deleteSkill(Long id, Profile p) {
        Skill toRemove = p.getSkills().stream()
                .filter(skill -> skill.getId().equals(id))
                .findAny()
                .orElseThrow(() -> new WebApplicationException(HttpStatus.NOT_FOUND, "Skill with id: " + id + " was not found!"));
        p.getSkills().remove(toRemove);
        saveProfile(p);
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

    public Project updateProject(Project project, Profile p) {
        if (project.getBroker() != null) {
            project.setBroker(validateNameEntity(project.getBroker(), NameEntityType.COMPANY));
        }
        if (project.getClient() != null) {
            project.setClient(validateNameEntity(project.getClient(), NameEntityType.COMPANY));
        }
        if (project.getProjectRoles() != null && project.getProjectRoles().size() != 0) {
            Set<NameEntity> roles = project.getProjectRoles().stream()
                    .map(ne -> validateNameEntity(ne, NameEntityType.PROJECT_ROLE))
                    .collect(Collectors.toSet());
            project.setProjectRoles(roles);
        }
        if (project.getSkills() != null && project.getSkills().size() != 0) {
            updateProjectSkills(project,p);
        }
        if (project.getId() == null) {
            project = projectRepository.save(project);
            p.getProjects().add(project);
        }
        saveProfile(p);
        return project;
    }

    public void deleteProject(Long id, Profile p) {
        Project remove = p.getProjects().stream()
                .filter(project -> project.getId().equals(id)).findAny()
                .orElseThrow(() -> new WebApplicationException(HttpStatus.NOT_FOUND, "Project with id: " + id + " ws not found!"));
        p.getProjects().remove(remove);
        saveProfile(p);
    }
}
