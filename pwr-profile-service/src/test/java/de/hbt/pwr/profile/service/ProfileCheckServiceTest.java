package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.client.SkillProfileClient;
import de.hbt.pwr.profile.client.SkillTreeIndex;
import de.hbt.pwr.profile.config.ProfileCheckProperties;
import de.hbt.pwr.profile.data.ConsultantRepository;
import de.hbt.pwr.profile.data.ProfileConfirmationRepository;
import de.hbt.pwr.profile.data.ProfileRepository;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.check.ProfileCheck;
import de.hbt.pwr.profile.model.check.ProfileCheckHint;
import de.hbt.pwr.profile.model.check.ProfileCheckHint.Code;
import de.hbt.pwr.profile.model.check.ProfileCheckHint.Type;
import de.hbt.pwr.profile.model.check.ProfileSection;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.*;
import org.junit.Before;
import org.junit.Test;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;
import static org.mockito.Mockito.mock;

/**
 * Profile check (#139): every kind of hint and its thresholds, with a fixed clock
 */
@SuppressWarnings("unchecked")
public class ProfileCheckServiceTest {

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 10, 22, 12, 0);
    private static final LocalDate TODAY = NOW.toLocalDate();
    private static final String TEXT_300 = String.join("", Collections.nCopies(300, "x"));
    private static final String TEXT_500 = String.join("", Collections.nCopies(500, "x"));

    private ProfileCheckService service;
    private long nextId = 1;

    @Before
    public void setUp() {
        Clock clock = Clock.fixed(NOW.toInstant(ZoneOffset.UTC), ZoneOffset.UTC);
        service = new ProfileCheckService(mock(ConsultantService.class), mock(ConsultantRepository.class),
                mock(ProfileRepository.class), mock(ProfileConfirmationRepository.class), mock(SkillProfileClient.class),
                new ProfileCheckProperties(), clock);
    }

    // ---------------------------------------------------------------------------------------------- complete profile

    @Test
    public void completeAndRecentProfileHasNoHints() {
        ProfileCheck check = check(completeProfile());
        assertThat(check.getHints()).isEmpty();
        assertThat(check.isSkillTreeChecked()).isFalse();
    }

    // --------------------------------------------------------------------------------------------------------- missing

    @Test
    public void educationWithoutDegreeIsIncomplete() {
        Profile profile = completeProfile();
        EducationEntry empty = new EducationEntry(name("Universität Hamburg - Informatik"), null);
        empty.setId(nextId++);
        EducationEntry blank = new EducationEntry(name("Ausbildung zum Fachinformatiker"), "  ");
        blank.setId(nextId++);
        profile.getEducation().add(empty);
        profile.getEducation().add(blank);

        assertThat(hints(check(profile), Code.EDUCATION_WITHOUT_DEGREE))
                .extracting(hint -> hint.getValues().get("education"), ProfileCheckHint::getSection, ProfileCheckHint::getType)
                .containsExactly(
                        tuple("Ausbildung zum Fachinformatiker", ProfileSection.EDUCATION, Type.INCOMPLETE),
                        tuple("Universität Hamburg - Informatik", ProfileSection.EDUCATION, Type.INCOMPLETE));
    }

    @Test
    public void educationWithDegreeIsComplete() {
        assertThat(hints(check(completeProfile()), Code.EDUCATION_WITHOUT_DEGREE)).isEmpty();
    }

    @Test
    public void emptyRequiredSectionsAreMissing() {
        Profile profile = completeProfile();
        profile.getLanguages().clear();
        profile.getCareerEntries().clear();
        profile.getQualification().clear();
        assertThat(codes(check(profile), Code.SECTION_EMPTY))
                .containsExactly(ProfileSection.LANGUAGES, ProfileSection.CAREER);
    }

    @Test
    public void emptyProfileMissesEveryRequiredSectionAndTheDescription() {
        Profile profile = Profile.empty();
        profile.setLastEdited(NOW);
        ProfileCheck check = check(profile);
        assertThat(codes(check, Code.SECTION_EMPTY)).containsExactly(ProfileSection.LANGUAGES, ProfileSection.TRAININGS,
                ProfileSection.EDUCATION, ProfileSection.SECTORS, ProfileSection.CAREER, ProfileSection.SKILLS,
                ProfileSection.PROJECTS);
        assertThat(hints(check, Code.DESCRIPTION_MISSING)).hasSize(1);
    }

    @Test
    public void descriptionBelowMinimumIsShort() {
        Profile profile = completeProfile();
        profile.setDescription(TEXT_300.substring(1));
        ProfileCheckHint hint = single(check(profile), Code.DESCRIPTION_SHORT);
        assertThat(hint.getType()).isEqualTo(Type.MISSING);
        assertThat(hint.getValues()).containsEntry("length", 299).containsEntry("minLength", 300);
    }

    @Test
    public void descriptionAtMinimumIsEnough() {
        Profile profile = completeProfile();
        profile.setDescription(TEXT_300);
        assertThat(hints(check(profile), Code.DESCRIPTION_SHORT)).isEmpty();
    }

    // ------------------------------------------------------------------------------------------------------ incomplete

    @Test
    public void projectWithFewSkillsShortDescriptionAndNoRoleIsIncomplete() {
        Profile profile = completeProfile();
        Project project = profile.getProjects().iterator().next();
        project.setSkills(skills(4));
        project.setDescription(TEXT_300.substring(1));
        project.setProjectRoles(new HashSet<>());
        ProfileCheckHint hint = single(check(profile), Code.PROJECT_INCOMPLETE);
        assertThat(hint.getType()).isEqualTo(Type.INCOMPLETE);
        assertThat(hint.getProjectId()).isEqualTo(project.getId());
        assertThat(hint.getProjectName()).isEqualTo("Kundenportal");
        assertThat((List<Object>) hint.getValues().get("reasons")).containsExactly("FEW_SKILLS", "SHORT_DESCRIPTION", "NO_ROLE");
        assertThat(hint.getValues()).containsEntry("skillCount", 4).containsEntry("minSkills", 5);
    }

    @Test
    public void projectAtTheMinimumsIsComplete() {
        Profile profile = completeProfile();
        Project project = profile.getProjects().iterator().next();
        project.setSkills(skills(5));
        project.setDescription(TEXT_300);
        assertThat(hints(check(profile), Code.PROJECT_INCOMPLETE)).isEmpty();
    }

    /**
     * Clients sometimes want every project, so old ones are checked too (#305)
     */
    @Test
    public void anOldProjectWithAShortDescriptionIsIncompleteToo() {
        Profile profile = completeProfile();
        Project old = project("Altprojekt");
        old.setStartDate(LocalDate.of(2004, 1, 1));
        old.setEndDate(LocalDate.of(2005, 12, 31));
        old.setDescription(TEXT_300.substring(1));
        profile.getProjects().add(old);
        ProfileCheckHint hint = single(check(profile), Code.PROJECT_INCOMPLETE);
        assertThat(hint.getProjectName()).isEqualTo("Altprojekt");
        assertThat((List<Object>) hint.getValues().get("reasons")).contains("SHORT_DESCRIPTION");
    }

    // -------------------------------------------------------------------------------------------------------- outdated

    @Test
    public void projectReferencesNotSavedForMoreThanAYearAreOutdated() {
        Profile profile = completeProfile();
        Project project = profile.getProjects().iterator().next();
        project.setEndDate(TODAY.minusMonths(1));
        project.setLastEdited(NOW.minusMonths(12).minusDays(1));
        ProfileCheckHint hint = single(check(profile), Code.PROJECTS_OUTDATED);
        assertThat(hint.getType()).isEqualTo(Type.OUTDATED);
        assertThat(hint.getSince()).isEqualTo(NOW.minusMonths(12).minusDays(1));
    }

    @Test
    public void projectReferencesSavedWithinAYearAreCurrent() {
        Profile profile = completeProfile();
        Project project = profile.getProjects().iterator().next();
        project.setEndDate(TODAY.minusMonths(1));
        project.setLastEdited(NOW.minusMonths(12).plusDays(1));
        assertThat(hints(check(profile), Code.PROJECTS_OUTDATED)).isEmpty();
    }

    @Test
    public void runningProjectNotSavedForMoreThanAYearIsOutdatedInsteadOfTheReferences() {
        Profile profile = completeProfile();
        Project project = profile.getProjects().iterator().next();
        project.setLastEdited(NOW.minusMonths(13));
        ProfileCheck check = check(profile);
        assertThat(single(check, Code.RUNNING_PROJECT_OUTDATED).getProjectId()).isEqualTo(project.getId());
        assertThat(hints(check, Code.PROJECTS_OUTDATED)).isEmpty();
    }

    @Test
    public void projectWithoutOwnTimestampFallsBackToTheProfile() {
        Profile profile = completeProfile();
        profile.getProjects().iterator().next().setLastEdited(null);
        profile.setLastEdited(NOW.minusMonths(13));
        assertThat(hints(check(profile), Code.RUNNING_PROJECT_OUTDATED)).hasSize(1);
    }

    @Test
    public void lastReferenceEndedMoreThanThreeMonthsAgoWithoutFollowUp() {
        Profile profile = completeProfile();
        profile.getProjects().iterator().next().setEndDate(TODAY.minusMonths(3).minusDays(1));
        ProfileCheckHint hint = single(check(profile), Code.NO_FOLLOW_UP_PROJECT);
        assertThat(hint.getSince()).isEqualTo(TODAY.minusMonths(3).minusDays(1).atStartOfDay());
    }

    @Test
    public void lastReferenceEndedWithinThreeMonthsNeedsNoFollowUpYet() {
        Profile profile = completeProfile();
        profile.getProjects().iterator().next().setEndDate(TODAY.minusMonths(3).plusDays(1));
        assertThat(hints(check(profile), Code.NO_FOLLOW_UP_PROJECT)).isEmpty();
    }

    @Test
    public void aLaterProjectIsTheFollowUp() {
        Profile profile = completeProfile();
        profile.getProjects().iterator().next().setEndDate(TODAY.minusMonths(6));
        Project next = project("Nachfolger");
        next.setStartDate(TODAY.plusMonths(1));
        next.setEndDate(TODAY.plusMonths(6));
        profile.getProjects().add(next);
        assertThat(hints(check(profile), Code.NO_FOLLOW_UP_PROJECT)).isEmpty();
    }

    @Test
    public void skillsNotChangedForMoreThanSixMonthsAreOutdated() {
        Profile profile = completeProfile();
        profile.setSkillsLastEdited(NOW.minusMonths(6).minusDays(1));
        assertThat(single(check(profile), Code.SKILLS_OUTDATED).getSince()).isEqualTo(NOW.minusMonths(6).minusDays(1));
    }

    @Test
    public void skillsChangedWithinSixMonthsAreCurrent() {
        Profile profile = completeProfile();
        profile.setSkillsLastEdited(NOW.minusMonths(6).plusDays(1));
        assertThat(hints(check(profile), Code.SKILLS_OUTDATED)).isEmpty();
    }

    @Test
    public void skillsWithoutOwnTimestampFallBackToTheProfile() {
        Profile profile = completeProfile();
        profile.setSkillsLastEdited(null);
        profile.setLastEdited(NOW.minusMonths(7));
        assertThat(hints(check(profile), Code.SKILLS_OUTDATED)).hasSize(1);
    }

    // ---------------------------------------------------------------------------------------------------- confirmation

    @Test
    public void confirmationWithinThePeriodResetsOnlyTheOutdatedHints() {
        Profile profile = completeProfile();
        profile.setSkillsLastEdited(NOW.minusMonths(7));
        profile.getProjects().iterator().next().setLastEdited(NOW.minusMonths(13));
        profile.getLanguages().clear();
        profile.setLastConfirmed(NOW.minusDays(1));
        ProfileCheck check = check(profile);
        assertThat(check.getHints()).extracting(ProfileCheckHint::getType).doesNotContain(Type.OUTDATED);
        assertThat(codes(check, Code.SECTION_EMPTY)).containsExactly(ProfileSection.LANGUAGES);
        assertThat(check.getLastConfirmed()).isEqualTo(NOW.minusDays(1));
    }

    @Test
    public void confirmationOutsideThePeriodDoesNotHelp() {
        Profile profile = completeProfile();
        profile.setSkillsLastEdited(NOW.minusMonths(8));
        profile.setLastConfirmed(NOW.minusMonths(7));
        assertThat(hints(check(profile), Code.SKILLS_OUTDATED)).hasSize(1);
    }

    // -------------------------------------------------------------------------------------------------------- unsorted

    @Test
    public void skillsInOtherOrUnknownToTheTreeAreUnsorted() {
        Profile profile = completeProfile();
        profile.getSkills().add(new Skill("Zebra-Tool", 3));
        profile.getSkills().add(new Skill("Ant-Tool", 3));
        Set<String> known = profile.getSkills().stream().map(skill -> skill.getName().toLowerCase()).collect(Collectors.toSet());
        known.remove("ant-tool");
        SkillTreeIndex tree = new SkillTreeIndex(known, new HashSet<>(Collections.singletonList("zebra-tool")));
        ProfileCheck check = service.check("mmu", profile, Optional.of(tree));
        ProfileCheckHint hint = single(check, Code.SKILLS_UNSORTED);
        assertThat(hint.getType()).isEqualTo(Type.UNSORTED);
        assertThat((List<Object>) hint.getValues().get("skills")).containsExactly("Ant-Tool", "Zebra-Tool");
        assertThat(check.isSkillTreeChecked()).isTrue();
    }

    // ---------------------------------------------------------------------------------------------------------- helper

    private ProfileCheck check(Profile profile) {
        return service.check("mmu", profile, Optional.empty());
    }

    private static List<ProfileCheckHint> hints(ProfileCheck check, Code code) {
        return check.getHints().stream().filter(hint -> hint.getCode() == code).collect(Collectors.toList());
    }

    private static ProfileCheckHint single(ProfileCheck check, Code code) {
        List<ProfileCheckHint> hints = hints(check, code);
        assertThat(hints).as("hints " + check.getHints()).hasSize(1);
        return hints.get(0);
    }

    private static List<ProfileSection> codes(ProfileCheck check, Code code) {
        return hints(check, code).stream().map(ProfileCheckHint::getSection).collect(Collectors.toList());
    }

    /**
     * Every required section filled, a running project saved a month ago, skills changed a month ago
     */
    private Profile completeProfile() {
        Profile profile = Profile.empty();
        profile.setSpecialFieldEntries(new HashSet<>());
        profile.setDescription(TEXT_500);
        profile.setLastEdited(NOW.minusMonths(1));
        profile.setSkillsLastEdited(NOW.minusMonths(1));
        profile.getLanguages().add(new LanguageSkill(nextId++, name("Deutsch"), null));
        profile.getTrainingEntries().add(new TrainingEntry(nextId++, name("Scrum"), TODAY.minusYears(2), TODAY.minusYears(2)));
        EducationEntry education = new EducationEntry(name("Informatik"), "M.Sc.");
        education.setId(nextId++);
        profile.getEducation().add(education);
        profile.getSectors().add(new SectorEntry(nextId++, name("Versicherung")));
        CareerEntry career = new CareerEntry(name("HBT"), TODAY.minusYears(5), null);
        career.setId(nextId++);
        profile.getCareerEntries().add(career);
        Set<Skill> skills = skills(5);
        profile.getSkills().addAll(skills);
        Project project = project("Kundenportal");
        project.setSkills(new HashSet<>(skills));
        profile.getProjects().add(project);
        return profile;
    }

    private Project project(String name) {
        Project project = new Project();
        project.setId(nextId++);
        project.setName(name);
        project.setDescription(TEXT_500);
        project.setProjectRoles(new HashSet<>(Collections.singletonList(name("Entwickler"))));
        project.setSkills(skills(5));
        project.setStartDate(TODAY.minusYears(1));
        project.setLastEdited(NOW.minusMonths(1));
        return project;
    }

    private Set<Skill> skills(int count) {
        return IntStream.range(0, count)
                .mapToObj(i -> {
                    Skill skill = new Skill("Skill " + i, 3);
                    skill.setId(nextId++);
                    return skill;
                })
                .collect(Collectors.toCollection(HashSet::new));
    }

    private NameEntity name(String name) {
        return NameEntity.builder().id(nextId++).name(name).build();
    }
}
