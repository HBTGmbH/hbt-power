package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.data.NameEntityRepository;
import de.hbt.pwr.profile.data.ProfileEntryDAO;
import de.hbt.pwr.profile.data.ProfileRepository;
import de.hbt.pwr.profile.data.SkillRepository;
import de.hbt.pwr.profile.errors.WebApplicationException;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.profile.NameEntityType;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ProfileEntryService {

    private NameEntityRepository nameEntityRepository;
    private ProfileEntryDAO profileEntryDAO;
    private ProfileRepository profileRepository;
    private SkillRepository skillRepository;

    @Autowired
    public ProfileEntryService(NameEntityRepository nameEntityRepository,
                               ProfileEntryDAO profileEntryDAO,
                               ProfileRepository profileRepository,
                               SkillRepository skillRepository) {
        this.nameEntityRepository = nameEntityRepository;
        this.profileEntryDAO = profileEntryDAO;
        this.profileRepository = profileRepository;
        this.skillRepository = skillRepository;
    }

    public ProfileEntry updateProfileEntry(ProfileEntry profileEntry, Profile profile, NameEntityType nameEntityType) {
        NameEntity nameEntity = nameEntityRepository.findByNameAndType(profileEntry.getNameEntity().getName(), profileEntry.getNameEntity().getType());
        if (nameEntity == null) {
            nameEntity = nameEntityRepository.save(profileEntry.getNameEntity());
        }
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
        profileRepository.save(profile);
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
        profileRepository.save(profile);
    }


    public Skill updateSkill(Skill skill, Profile p) {
        Skill inProfile = p.getSkills().stream().filter(s -> s.getName().equals(skill.getName())).findAny().orElse(null);


        if (inProfile != null) {
            // Skill is in profile, check rating and change it
            if (!skill.getRating().equals(inProfile.getRating())){
                p.getSkills().remove(inProfile);
                p.getSkills().add(inProfile);
            }
        } else {
            // new
            Optional<Skill> inRepo = skillRepository.findByName(skill.getName());
            if (inRepo.isPresent()) {
                p.getSkills().add(inRepo.get());
            } else {
                p.getSkills().add(skill);
            }
        }
        profileRepository.save(p);
        profileRepository.flush();
        return skillRepository.findByName(skill.getName()).get();
    }

    public void deleteSkill(Long id, Profile p) {
        Skill toRemove = p.getSkills().stream()
                .filter(skill -> skill.getId().equals(id))
                .findAny()
                .orElseThrow(() -> new WebApplicationException(HttpStatus.NOT_FOUND, "Skill with id: " + id + " was not found!"));
        p.getSkills().remove(toRemove);
        profileRepository.save(p);
    }

    public Project updateProject(Project project, Profile p) {
        return null;
    }

    public void deleteProject(Long id, Profile p) {

    }
}
