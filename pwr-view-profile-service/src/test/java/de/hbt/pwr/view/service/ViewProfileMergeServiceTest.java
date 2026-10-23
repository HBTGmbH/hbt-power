package de.hbt.pwr.view.service;

import de.hbt.pwr.fixture.ViewProfileFixtures;
import de.hbt.pwr.view.model.LanguageLevel;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.entries.Career;
import de.hbt.pwr.view.model.entries.Language;
import de.hbt.pwr.view.model.entries.Project;
import de.hbt.pwr.view.client.profile.ProfileServiceClient;
import de.hbt.pwr.view.client.profile.model.FormerName;
import de.hbt.pwr.view.client.skill.SkillServiceClient;
import de.hbt.pwr.view.model.entries.ProjectRole;
import de.hbt.pwr.view.model.entries.Sector;
import de.hbt.pwr.view.model.skill.SkillVersion;
import de.hbt.pwr.view.client.skill.model.SkillServiceSkill;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.Skill;
import de.hbt.pwr.view.repo.ViewProfileRepository;
import lombok.extern.slf4j.Slf4j;
import org.junit.Before;
import org.junit.Test;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static de.hbt.pwr.view.client.profile.model.NameEntityType.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@Slf4j
public class ViewProfileMergeServiceTest {
    private ViewProfileMergeService viewProfileMergeService;
    private ViewProfile oldView;
    private Language l1;
    private Language l2;
    private Project p1;
    private Project p2;
    private ViewProfile.ViewProfileMergeOptions options;

    private ViewProfile makeViewProfile() {
        ViewProfile view = new ViewProfile();
        l1 = new Language("Sprache1", LanguageLevel.ADVANCED, false);
        l2 = new Language("Sprache2", LanguageLevel.ADVANCED, true);
        view.getLanguages().add(l1);
        view.getLanguages().add(l2);

        Career c1 = new Career("Career1", LocalDate.now(), LocalDate.now(), true);
        Career c2 = new Career("Career2", LocalDate.now(), LocalDate.now(), false);
        view.getCareers().add(c1);
        view.getCareers().add(c2);

        p1 = new Project(1L, "name1", "description", "client", "broker", LocalDate.now(), LocalDate.now(), null, null, true);
        p2 = new Project(2L, "name2", "description", "client", "broker", LocalDate.now(), LocalDate.now(), null, null, true);
        view.getProjects().add(p1);
        view.getProjects().add(p2);

        Category third = new Category("third", true, true);
        Category second = new Category("second", true, true);
        Category first = new Category("first", true, true);
        Category root = new Category("root", true, true);

        // DisplayCategories
        List<Category> displayCategories = new ArrayList<>(Arrays.asList(root, first, second, third));
        view.setDisplayCategories(displayCategories);

        return view;
    }

    private final ViewProfileLocalizationService viewProfileLocalizationService = mock(ViewProfileLocalizationService.class);

    private final SkillServiceClient skillServiceClient = mock(SkillServiceClient.class);

    private final ProfileServiceClient profileServiceClient = mock(ProfileServiceClient.class);

    @Before
    public void setUp() throws Exception {
        oldView = makeViewProfile();
        options = new ViewProfile.ViewProfileMergeOptions();
        options.name = "test";
        options.viewDescription = "test description";
        options.keepOld = true;
        ViewProfileRepository viewProfileRepository = mock(ViewProfileRepository.class);
        when(viewProfileRepository.save(any())).thenAnswer(invocationOnMock -> invocationOnMock.getArgument(0));
        viewProfileMergeService = new ViewProfileMergeService(viewProfileRepository, null, viewProfileLocalizationService,
                skillServiceClient, profileServiceClient);
    }

    @Test
    public void shouldKeepTheLanguageAndFillTheCurrentLocalizations() {
        oldView.setLocalization("deu");
        ViewProfile newViewProfile = viewProfileMergeService.mergeViewProfiles(oldView, new ViewProfile(), options);
        assertThat(newViewProfile.getLocalization()).isEqualTo("deu");
        // The old display categories and projects stay, with their names from the current localizations (#174)
        verify(viewProfileLocalizationService).localize(newViewProfile);
    }

    @Test
    public void shouldKeepHiddenSkillVersions() {
        oldView.setShowSkillVersions(false);
        ViewProfile newViewProfile = viewProfileMergeService.mergeViewProfiles(oldView, new ViewProfile(), options);
        assertThat(newViewProfile.getShowSkillVersions()).isFalse();
    }

    @Test
    public void shouldCopyLanguageOptions() {

        makeViewProfile();
        ViewProfile newViewProfile = new ViewProfile();
        List<Language> newLangs = new ArrayList<>();

        newLangs.add(new Language("Sprache1", LanguageLevel.ADVANCED, true));
        newLangs.add(new Language("Sprache2", LanguageLevel.ADVANCED, false));
        Language l3 = new Language("Sprache3", LanguageLevel.ADVANCED, false);
        newLangs.add(l1);
        newLangs.add(l2);
        newLangs.add(l3);
        newViewProfile.setLanguages(newLangs);


        newViewProfile = viewProfileMergeService.mergeViewProfiles(oldView, newViewProfile, options);

        assertThat(newViewProfile.getLanguages()).isNotNull();
        assertThat(newViewProfile.getLanguages()).contains(l1);
        assertThat(newViewProfile.getLanguages()).contains(l2);
        assertThat(newViewProfile.getLanguages()).contains(l3);
    }

    @Test
    public void shouldCopyProjectOptions() {

        ViewProfile newViewProfile = new ViewProfile();
        List<Project> newProjects = new ArrayList<>();
        Project p3 = new Project(1L, "name1", "description", "client", "broker", LocalDate.now(), LocalDate.now(), new ArrayList<>(), new ArrayList<>(), false);
        Project p4 = new Project(2L, "name2", "description", "client", "broker", LocalDate.now(), LocalDate.now(), new ArrayList<>(), new ArrayList<>(), true);

        newProjects.add(p3);
        newProjects.add(p4);
        newViewProfile.setProjects(newProjects);


        newViewProfile = viewProfileMergeService.mergeViewProfiles(oldView, newViewProfile, options);

        assertThat(newViewProfile.getProjects()).contains(p1);
        assertThat(newViewProfile.getProjects()).contains(p2);
    }

    /**
     * Old view profiles kept the names of the profile in the projects, new ones take those of the skill tree (#208)
     */
    @Test
    public void whenMergingProject_aHiddenSkillStaysHidden_evenIfItIsNowNamedLikeTheSkillTree() {
        SkillServiceSkill dotNet = new SkillServiceSkill();
        dotNet.setQualifier(".NET");
        when(skillServiceClient.getSkillByName(".NET Core")).thenReturn(dotNet);
        Project oldProject = ViewProfileFixtures.validProject().toBuilder().id(77L)
                .skills(new ArrayList<>(Arrays.asList(
                        Skill.builder().name(".NET Core").rating(3).enabled(false).build(),
                        Skill.builder().name("Java").rating(3).enabled(false).build())))
                .build();
        Project newProject = oldProject.toBuilder()
                .skills(new ArrayList<>(Arrays.asList(
                        Skill.builder().name(".NET").rating(3).enabled(true).build(),
                        Skill.builder().name("Java").rating(3).enabled(true).build(),
                        Skill.builder().name("Kotlin").rating(3).enabled(true).build())))
                .build();
        oldView.setProjects(new ArrayList<>(Collections.singletonList(oldProject)));
        ViewProfile newViewProfile = new ViewProfile();
        newViewProfile.getProjects().add(newProject);

        newViewProfile = viewProfileMergeService.mergeViewProfiles(oldView, newViewProfile, options);

        assertThat(newViewProfile.getProjects().get(0).getSkills())
                .extracting(Skill::getName, Skill::getEnabled)
                .containsExactlyInAnyOrder(tuple(".NET", false), tuple("Java", false), tuple("Kotlin", true));
    }

    @Test
    public void whenMergingProject_shouldAddNewProjectToProfile() {
        Project newProject = ViewProfileFixtures.validProject();
        ViewProfile newViewProfile = new ViewProfile();
        newViewProfile.getProjects().add(newProject);
        oldView.setProjects(new ArrayList<>());

        newViewProfile = viewProfileMergeService.mergeViewProfiles(oldView, newViewProfile, options);

        assertThat(newViewProfile.getProjects()).containsExactly(newProject);
    }

    @Test
    public void whenMergingProject_andOldProjectExists_shouldMergeBasicDataIntoOldProject() {
        // Given two projects with the same ID
        Project oldProject = ViewProfileFixtures.validProject()
                .toBuilder()
                .id(55L)
                .client("Evil Corp")
                .broker("Evil Broker")
                .description("An Evil Project")
                .endDate(LocalDate.of(2009, 3, 26))
                .startDate(LocalDate.of(2003, 1, 21))
                .name("Evil Project")
                .enabled(false)
                .build();
        Project newProject = oldProject.toBuilder()
                .id(55L)
                .client("Not Evil Corp")
                .broker("Not Evil Broker")
                .description("No longer an evil project")
                .endDate(null)
                .startDate(LocalDate.of(2003, 1, 21))
                .name("Good Project")
                .enabled(true)
                .build();
        ViewProfile newViewProfile = new ViewProfile();
        newViewProfile.getProjects().add(newProject);
        oldView.getProjects().add(oldProject);

        // When merging
        newViewProfile = viewProfileMergeService.mergeViewProfiles(oldView, newViewProfile, options);

        // Should update the old project with new values
        Project updatedProject = newViewProfile.getProjects().iterator().next();
        assertThat(updatedProject.getClient()).isEqualTo(newProject.getClient());
        assertThat(updatedProject.getBroker()).isEqualTo(newProject.getBroker());
        assertThat(updatedProject.getDescription()).isEqualTo(newProject.getDescription());
        assertThat(updatedProject.getEndDate()).isEqualTo(newProject.getEndDate());
        assertThat(updatedProject.getStartDate()).isEqualTo(newProject.getStartDate());
        assertThat(updatedProject.getName()).isEqualTo(newProject.getName());
        assertThat(updatedProject.getEnabled()).isFalse(); // The old project was disabled, so this is, too
    }

    private ViewProfile merged(ViewProfile newView) {
        return viewProfileMergeService.mergeViewProfiles(oldView, newView, options);
    }

    private static Sector sector(String name, boolean enabled) {
        return new Sector(name, enabled);
    }

    private static SkillServiceSkill treeSkill(String qualifier) {
        SkillServiceSkill skill = new SkillServiceSkill();
        skill.setQualifier(qualifier);
        return skill;
    }

    /**
     * A profile element renamed since (#230): the entry is the old one under its new name
     */
    @Test
    public void aRenamedEntry_keepsWhetherItIsShown() {
        when(profileServiceClient.getFormerNames()).thenReturn(List.of(new FormerName(SECTOR, "Bank", "Bankwesen")));
        oldView.setSectors(new ArrayList<>(List.of(sector("Bank", false), sector("Versicherungen", false))));
        ViewProfile newView = new ViewProfile();
        newView.setSectors(new ArrayList<>(List.of(sector("Bankwesen", true), sector("versicherungen", true),
                sector("Logistik", true))));

        assertThat(merged(newView).getSectors()).extracting(Sector::getName, Sector::getEnabled)
                .containsExactly(tuple("Bankwesen", false), tuple("versicherungen", false), tuple("Logistik", true));
    }

    @Test
    public void twoMergedEntries_areShownIfOneOfThemWas() {
        when(profileServiceClient.getFormerNames()).thenReturn(List.of(new FormerName(SECTOR, "bank", "Banken")));
        oldView.setSectors(new ArrayList<>(List.of(sector("Bank", true), sector("Banken", false))));
        ViewProfile newView = new ViewProfile();
        newView.setSectors(new ArrayList<>(List.of(sector("Banken", false))));

        assertThat(merged(newView).getSectors()).extracting(Sector::getEnabled).containsExactly(true);
    }

    @Test
    public void entriesOfTheSameName_areTheOnesWithTheSameDates() {
        when(profileServiceClient.getFormerNames()).thenReturn(List.of(new FormerName(CAREER, "HBT", "HBT GmbH")));
        LocalDate start1 = LocalDate.of(2015, 1, 1);
        LocalDate end1 = LocalDate.of(2018, 12, 31);
        LocalDate start2 = LocalDate.of(2021, 1, 1);
        oldView.setCareers(new ArrayList<>(List.of(new Career("HBT", start1, end1, false), new Career("HBT GmbH", start2, null, true))));
        ViewProfile newView = new ViewProfile();
        newView.setCareers(new ArrayList<>(List.of(new Career("HBT GmbH", start1, end1, true), new Career("HBT GmbH", start2, null, false))));

        assertThat(merged(newView).getCareers()).extracting(Career::getStartDate, Career::getEnabled)
                .containsExactly(tuple(start1, false), tuple(start2, true));
    }

    @Test
    public void withoutFormerNames_entriesAreFoundUnderTheirNames() {
        when(profileServiceClient.getFormerNames()).thenReturn(List.of());
        oldView.setSectors(new ArrayList<>(List.of(sector("Bank", false))));
        ViewProfile newView = new ViewProfile();
        newView.setSectors(new ArrayList<>(List.of(sector("Bank", true), sector("Bankwesen", true))));

        assertThat(merged(newView).getSectors()).extracting(Sector::getEnabled).containsExactly(false, true);
    }

    @Test
    public void aRenamedRoleOfAProject_keepsWhetherItIsShownAndItsPlace() {
        when(profileServiceClient.getFormerNames()).thenReturn(List.of(new FormerName(PROJECT_ROLE, "Dev", "Entwickler")));
        Project oldProject = ViewProfileFixtures.validProject().toBuilder().id(77L)
                .projectRoles(new ArrayList<>(List.of(new ProjectRole("Architekt", true), new ProjectRole("Dev", false))))
                .build();
        Project newProject = oldProject.toBuilder()
                .projectRoles(new ArrayList<>(List.of(new ProjectRole("Tester", true), new ProjectRole("Entwickler", true),
                        new ProjectRole("Architekt", true))))
                .build();
        oldView.setProjects(new ArrayList<>(List.of(oldProject)));
        ViewProfile newView = new ViewProfile();
        newView.getProjects().add(newProject);

        assertThat(merged(newView).getProjects().get(0).getProjectRoles())
                .extracting(ProjectRole::getName, ProjectRole::getEnabled)
                .containsExactly(tuple("Architekt", true), tuple("Entwickler", false), tuple("Tester", true));
    }

    /**
     * A skill renamed in the skill tree (#228) keeps its place in the display category, whether it is shown and which
     * of its versions are; a deleted one goes (#229), a new one goes into its category
     */
    @Test
    public void aRenamedSkill_keepsItsPlaceInTheDisplayCategory() {
        when(skillServiceClient.getSkillByName("K8s")).thenReturn(treeSkill("Kubernetes"));
        Category oldContainers = new Category(5L, "Container", true, true);
        Skill.builder().name("Docker").enabled(true).displayCategory(oldContainers).build();
        Skill oldK8s = Skill.builder().name("K8s").enabled(false).displayCategory(oldContainers).build();
        oldK8s.setVersions(List.of("1.28", "1.29"));
        oldK8s.setEnabledForVersion("1.28", false);
        Skill.builder().name("Nomad").enabled(true).displayCategory(oldContainers).build();
        oldView.setDisplayCategories(new ArrayList<>(List.of(oldContainers)));

        Category newContainers = new Category(5L, "Container", true, true);
        Skill.builder().name("Podman").enabled(true).displayCategory(newContainers).build();
        Skill newK8s = Skill.builder().name("Kubernetes").enabled(true).displayCategory(newContainers).build();
        newK8s.setVersions(List.of("1.28", "1.29", "1.30"));
        Skill.builder().name("Docker").enabled(true).displayCategory(newContainers).build();
        ViewProfile newView = new ViewProfile();
        newView.setDisplayCategories(new ArrayList<>(List.of(newContainers)));

        List<Category> categories = merged(newView).getDisplayCategories();

        assertThat(categories).hasSize(1);
        assertThat(categories.get(0).getDisplaySkills()).extracting(Skill::getName, Skill::getEnabled)
                .containsExactly(tuple("Docker", true), tuple("Kubernetes", false), tuple("Podman", true));
        assertThat(categories.get(0).getDisplaySkills().get(1).getVersions())
                .extracting(SkillVersion::getName, SkillVersion::getEnabled)
                .containsExactly(tuple("1.28", false), tuple("1.29", true), tuple("1.30", true));
    }

    @Test
    public void aNewProject_goesBehindTheOldOnes() {
        Project old1 = ViewProfileFixtures.validProject().toBuilder().id(1L).name("Eins").build();
        Project old2 = ViewProfileFixtures.validProject().toBuilder().id(2L).name("Zwei").build();
        oldView.setProjects(new ArrayList<>(List.of(old2, old1)));
        ViewProfile newView = new ViewProfile();
        newView.getProjects().add(old1.toBuilder().build());
        newView.getProjects().add(ViewProfileFixtures.validProject().toBuilder().id(3L).name("Drei").build());
        newView.getProjects().add(old2.toBuilder().build());

        assertThat(merged(newView).getProjects()).extracting(Project::getName).containsExactly("Zwei", "Eins", "Drei");
    }
}
