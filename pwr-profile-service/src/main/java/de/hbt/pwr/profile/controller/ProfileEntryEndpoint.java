package de.hbt.pwr.profile.controller;

import de.hbt.pwr.profile.data.ProfileRepository;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.profile.BaseProfile;
import de.hbt.pwr.profile.model.profile.NameEntityType;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.*;
import de.hbt.pwr.profile.service.ConsultantService;
import de.hbt.pwr.profile.service.ProfileEntryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.Collection;

@Transactional
@Slf4j
@RestController
@RequestMapping(value = "/profile/{initials}", produces = "application/json")
public class ProfileEntryEndpoint {


    private ProfileEntryService profileEntryService;
    private ConsultantService consultantService;
    private ProfileRepository profileRepository;

    @Autowired
    public ProfileEntryEndpoint(ProfileEntryService profileEntryService,
                                ConsultantService consultantService,
                                ProfileRepository profileRepository) {
        this.profileEntryService = profileEntryService;
        this.consultantService = consultantService;
        this.profileRepository = profileRepository;
    }


    @GetMapping("/baseProfile")
    public BaseProfile getBaseProfile(@PathVariable("initials") String initials) {
        Profile p = consultantService.getProfileByInitials(initials);
        return new BaseProfile(p.getId(),p.getDescription(),p.getLastEdited());
    }

    @PutMapping("/baseProfile")
    public BaseProfile updateBaseProfile(@PathVariable("initials") String initials, @RequestBody BaseProfile baseProfile) {
        Profile p = consultantService.getProfileByInitials(initials);
        return profileEntryService.updateBaseProfile(p,baseProfile);
    }


    // --------------------------- ---------------------- Languages ---------------------- ---------------------------//
    @GetMapping("/language")
    public Collection<LanguageSkill> getLanguageSkills(@PathVariable("initials") String initials) {
        return consultantService.getProfileByInitials(initials).getLanguages();
    }

    @PutMapping("/language")
    public LanguageSkill updateLanguageSkill(@PathVariable("initials") String initials, @RequestBody LanguageSkill languageSkill) {
        Profile p = consultantService.getProfileByInitials(initials);
        LanguageSkill l = profileEntryService.updateProfileEntry(languageSkill, p, NameEntityType.LANGUAGE);
        return l;
    }

    @DeleteMapping("/language/{id}")
    public void deleteLanguageSkill(@PathVariable("initials") String initials, @PathVariable("id") Long id) {
        Profile p = consultantService.getProfileByInitials(initials);
        profileEntryService.deleteEntryWithId(id, p, NameEntityType.LANGUAGE);
    }

    // ------------------------- ---------------------- Qualification ---------------------- -------------------------//
    @GetMapping("/qualification")
    public Collection<QualificationEntry> getQualificationEntries(@PathVariable("initials") String initials) {
        return consultantService.getProfileByInitials(initials).getQualification();
    }

    @PutMapping("/qualification")
    public QualificationEntry updateQualificationSkill(@PathVariable("initials") String initials, @RequestBody QualificationEntry qualificationEntry) {
        Profile p = consultantService.getProfileByInitials(initials);
        QualificationEntry entry = profileEntryService.updateProfileEntry(qualificationEntry, p, NameEntityType.QUALIFICATION);
        return entry;
    }

    @DeleteMapping("/qualification/{id}")
    public void deleteQualificationSkill(@PathVariable("initials") String initials, @PathVariable("id") Long id) {
        Profile p = consultantService.getProfileByInitials(initials);
        profileEntryService.deleteEntryWithId(id, p, NameEntityType.QUALIFICATION);
    }

    // --------------------------- ---------------------- Sector ---------------------- ---------------------------//
    @GetMapping("/sector")
    public Collection<SectorEntry> getSectorEntries(@PathVariable("initials") String initials) {
        return consultantService.getProfileByInitials(initials).getSectors();
    }

    @PutMapping("/sector")
    public SectorEntry updateSectorEntry(@PathVariable("initials") String initials, @RequestBody SectorEntry sectorEntry) {
        Profile p = consultantService.getProfileByInitials(initials);
        SectorEntry entry = profileEntryService.updateProfileEntry(sectorEntry, p, NameEntityType.SECTOR);
        return entry;
    }

    @DeleteMapping("/sector/{id}")
    public void deleteSectorEntry(@PathVariable("initials") String initials, @PathVariable("id") Long id) {
        Profile p = consultantService.getProfileByInitials(initials);
        profileEntryService.deleteEntryWithId(id, p, NameEntityType.SECTOR);
    }

    // --------------------------- ---------------------- KeySkills ---------------------- ---------------------------//
    @GetMapping("/keyskill")
    public Collection<KeySkillEntry> getKeySkillEntries(@PathVariable("initials") String initials) {
        return consultantService.getProfileByInitials(initials).getKeySkillEntries();
    }

    @PutMapping("/keyskill")
    public KeySkillEntry updateKeySkillEntry(@PathVariable("initials") String initials, @RequestBody KeySkillEntry keySkillEntry) {
        Profile p = consultantService.getProfileByInitials(initials);
        KeySkillEntry entry = profileEntryService.updateProfileEntry(keySkillEntry, p, NameEntityType.KEY_SKILL);
        return entry;
    }

    @DeleteMapping("/keyskill/{id}")
    public void deleteKeySkillEntry(@PathVariable("initials") String initials, @PathVariable("id") Long id) {
        Profile p = consultantService.getProfileByInitials(initials);
        profileEntryService.deleteEntryWithId(id, p, NameEntityType.KEY_SKILL);
    }

    // -------------------------- ---------------------- CareerEntry ---------------------- --------------------------//
    @GetMapping("/career")
    public Collection<CareerEntry> getCareerEntries(@PathVariable("initials") String initials) {
        return consultantService.getProfileByInitials(initials).getCareerEntries();
    }

    @PutMapping("/career")
    public CareerEntry updateCareerEntry(@PathVariable("initials") String initials, @RequestBody CareerEntry careerEntry) {
        Profile p = consultantService.getProfileByInitials(initials);
        CareerEntry entry = profileEntryService.updateProfileEntry(careerEntry, p, NameEntityType.CAREER);
        return entry;
    }

    @DeleteMapping("/career/{id}")
    public void deleteCareerEntry(@PathVariable("initials") String initials, @PathVariable("id") Long id) {
        Profile p = consultantService.getProfileByInitials(initials);
        profileEntryService.deleteEntryWithId(id, p, NameEntityType.CAREER);
    }

    // --------------------------- ---------------------- Training ---------------------- ---------------------------//
    @GetMapping("/training")
    public Collection<TrainingEntry> getTrainingEntries(@PathVariable("initials") String initials) {
        return consultantService.getProfileByInitials(initials).getTrainingEntries();
    }

    @PutMapping("/training")
    public TrainingEntry updateTrainingEntry(@PathVariable("initials") String initials, @RequestBody TrainingEntry trainingEntry) {
        Profile p = consultantService.getProfileByInitials(initials);
        TrainingEntry entry = profileEntryService.updateProfileEntry(trainingEntry, p, NameEntityType.TRAINING);
        return entry;
    }

    @DeleteMapping("/training/{id}")
    public void deleteTrainingEntry(@PathVariable("initials") String initials, @PathVariable("id") Long id) {
        Profile p = consultantService.getProfileByInitials(initials);
        profileEntryService.deleteEntryWithId(id, p, NameEntityType.TRAINING);
    }

    // --------------------------- ---------------------- Education ---------------------- ---------------------------//
    @GetMapping("/education")
    public Collection<EducationEntry> getEducationEntries(@PathVariable("initials") String initials) {
        return consultantService.getProfileByInitials(initials).getEducation();
    }

    @PutMapping("/education")
    public EducationEntry updateEducationEntry(@PathVariable("initials") String initials, @RequestBody EducationEntry educationEntry) {
        Profile p = consultantService.getProfileByInitials(initials);
        EducationEntry entry = profileEntryService.updateProfileEntry(educationEntry, p, NameEntityType.EDUCATION);
        return entry;
    }

    @DeleteMapping("/education/{id}")
    public void deleteEducationEntry(@PathVariable("initials") String initials, @PathVariable("id") Long id) {
        Profile p = consultantService.getProfileByInitials(initials);
        profileEntryService.deleteEntryWithId(id, p, NameEntityType.EDUCATION);
    }

    // ---------------------------- ---------------------- Skills ---------------------- ----------------------------//

    @GetMapping("/skill")
    public Collection<Skill> getSkills(@PathVariable("initials") String initials) {
        return consultantService.getProfileByInitials(initials).getSkills();
    }

    @PutMapping("/skill")
    public Skill updateSkill(@PathVariable("initials") String initials, @RequestBody Skill skill) {
        Profile p = consultantService.getProfileByInitials(initials);
        Skill s = profileEntryService.updateProfileSkills(skill, p);
        return s;
    }

    @DeleteMapping("/skill/{id}")
    public void deleteSkill(@PathVariable("initials") String initials, @PathVariable("id") Long id) {
        Profile p = consultantService.getProfileByInitials(initials);
        profileEntryService.deleteSkill(id, p);
    }

    // --------------------------- ---------------------- Projects ---------------------- ----------------------------//
    @GetMapping("/project")
    public Collection<Project> getProjects(@PathVariable("initials") String initials) {
        return consultantService.getProfileByInitials(initials).getProjects();
    }

    @PutMapping("/project")
    public Project updateProject(@PathVariable("initials") String initials, @RequestBody Project project) {
        Profile p = consultantService.getProfileByInitials(initials);
        project = profileEntryService.updateProject(project, p);
        return project;
    }

    @DeleteMapping("/project/{id}")
    public void deleteProject(@PathVariable("initials") String initials, @PathVariable("id") Long id) {
        Profile p = consultantService.getProfileByInitials(initials);
        profileEntryService.deleteProject(id, p);
    }

}
