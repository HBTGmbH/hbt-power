package de.hbt.pwr.view.service;

import de.hbt.pwr.fixture.ViewProfileFixtures;
import de.hbt.pwr.view.model.LanguageLevel;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.entries.Career;
import de.hbt.pwr.view.model.entries.Language;
import de.hbt.pwr.view.model.entries.Project;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.repo.ViewProfileRepository;
import lombok.extern.slf4j.Slf4j;
import org.junit.Before;
import org.junit.Test;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
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

    @Before
    public void setUp() throws Exception {
        oldView = makeViewProfile();
        options = new ViewProfile.ViewProfileMergeOptions();
        options.name = "test";
        options.viewDescription = "test description";
        options.keepOld = true;
        ViewProfileRepository viewProfileRepository = mock(ViewProfileRepository.class);
        when(viewProfileRepository.save(any())).thenAnswer(invocationOnMock -> invocationOnMock.getArgument(0));
        viewProfileMergeService = new ViewProfileMergeService(viewProfileRepository, null);
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
}
