package de.hbt.pwr.profile.model.profile;

import de.hbt.pwr.profile.model.HBTPowerConstants;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.profile.entries.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import org.hibernate.annotations.Cascade;
import org.hibernate.annotations.CascadeType;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Builder
@AllArgsConstructor
@Data
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(length = HBTPowerConstants.PROFILE_DESCRIPTION_LENGTH)
    private String description;

    private LocalDateTime lastEdited;

    @OneToMany(fetch = FetchType.EAGER, orphanRemoval = true)
    @Cascade(CascadeType.ALL)
    @JoinColumn(name = "PROFILE_ID")
    @Fetch(FetchMode.SUBSELECT)
    private Set<LanguageSkill> languages = new HashSet<>();

    @OneToMany(fetch = FetchType.EAGER, orphanRemoval = true)
    @Cascade(CascadeType.ALL)
    @JoinColumn(name = "PROFILE_ID")
    @Fetch(FetchMode.SUBSELECT)
    private Set<QualificationEntry> qualification = new HashSet<>();

    @OneToMany(fetch = FetchType.EAGER, orphanRemoval = true)
    @Cascade(CascadeType.ALL)
    @JoinColumn(name = "PROFILE_ID")
    @Fetch(FetchMode.SUBSELECT)
    private Set<TrainingEntry> trainingEntries = new HashSet<>();

    @OneToMany(fetch = FetchType.EAGER, orphanRemoval = true)
    @Cascade(CascadeType.ALL)
    @JoinColumn(name = "PROFILE_ID")
    @Fetch(FetchMode.SUBSELECT)
    private Set<EducationEntry> education = new HashSet<>();

    @OneToMany(fetch = FetchType.EAGER, orphanRemoval = true)
    @Cascade(CascadeType.ALL)
    @JoinColumn(name = "PROFILE_ID")
    @Fetch(FetchMode.SUBSELECT)
    private Set<SectorEntry> sectors = new HashSet<>();

    @OneToMany(fetch = FetchType.EAGER, orphanRemoval = true)
    @Cascade(CascadeType.ALL)
    @JoinColumn(name = "PROFILE_ID")
    @Fetch(FetchMode.SUBSELECT)
    private Set<CareerEntry> careerEntries = new HashSet<>();

    @OneToMany(fetch = FetchType.EAGER, orphanRemoval = true)
    @Cascade(CascadeType.ALL)
    @JoinColumn(name = "PROFILE_ID")
    @Fetch(FetchMode.SUBSELECT)
    private Set<SpecialFieldEntry> specialFieldEntries = new HashSet<>();

    /**
     * All projects associated with this profile.
     */
    @OneToMany(fetch = FetchType.EAGER)
    @JoinColumn(name = "PROFILE_ID")
    @Fetch(FetchMode.SUBSELECT)
    private Set<Project> projects = new HashSet<>();

    @OneToMany(fetch = FetchType.EAGER)
    @Cascade(CascadeType.ALL)
    @JoinColumn(name = "PROFILE_ID")
    @Fetch(FetchMode.SUBSELECT)
    private Set<Skill> skills = new HashSet<>();

    public Profile() {
    }

    public static Profile empty() {
        final Profile res = new Profile();
        res.setDescription("");
        res.setLastEdited(LocalDateTime.now());
        res.setSkills(new HashSet<>());
        res.setProjects(new HashSet<>());
        res.setTrainingEntries(new HashSet<>());
        res.setSectors(new HashSet<>());
        res.setQualification(new HashSet<>());
        res.setEducation(new HashSet<>());
        res.setLanguages(new HashSet<>());
        res.setCareerEntries(new HashSet<>());
        res.setId(null);
        return res;
    }

    /**
     * Returns a shallow copy, but with all entries that are uniquly tied to the profile copied.
     *
     * @return
     */
    public Profile copyNullId() {
        final Profile res = new Profile();
        res.setId(null);
        res.setDescription(description);
        res.setLanguages(languages.stream().map(LanguageSkill::copyNullId).collect(Collectors.toSet()));
        res.setEducation(education.stream().map(EducationEntry::copyNullId).collect(Collectors.toSet()));
        res.setQualification(qualification.stream().map(QualificationEntry::copyNullId).collect(Collectors.toSet()));
        res.setSectors(sectors.stream().map(SectorEntry::copyNullId).collect(Collectors.toSet()));
        res.setTrainingEntries(trainingEntries.stream().map(TrainingEntry::copyNullId).collect(Collectors.toSet()));
        res.setProjects(projects.stream().map(Project::copyNullId).collect(Collectors.toSet()));
        res.setCareerEntries(careerEntries.stream().map(CareerEntry::copyNullId).collect(Collectors.toSet()));
        res.setSpecialFieldEntries(specialFieldEntries.stream().map(SpecialFieldEntry::copyNullId).collect(Collectors.toSet()));
        res.setSkills(skills.stream().map(Skill::copyNullId).collect(Collectors.toSet()));
        return res;
    }

    @Override
    public String toString() {
        return "Profile{" +
                "id=" + id +
                '}';
    }
}
