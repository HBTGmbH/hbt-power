package de.hbt.pwr.view.service;

import de.hbt.pwr.view.model.LanguageLevel;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.entries.Career;
import de.hbt.pwr.view.model.entries.Language;
import de.hbt.pwr.view.model.entries.Project;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.Skill;
import de.hbt.pwr.view.repo.ViewProfileRepository;
import lombok.extern.slf4j.Slf4j;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@Slf4j
public class ViewProfileMergeServiceTest {


    private ViewProfileMergeService viewProfileMergeService;

    private ViewProfileRepository viewProfileRepository;
    private ViewProfileCreatorService viewProfileCreatorService;


    private ViewProfile oldView;
    private Language l1;
    private Language l2;
    private Career c1;
    private Career c2;
    private Project p1;
    private Project p2;

    private Category root;
    private Category first;
    private Category second;
    private Category third;
    private Skill resSkillA1a;
    private Skill resSkillA1b;
    private Skill resSkillA2a;
    private Skill resSkillA2b;
    private Skill resSkillB1a;
    private Skill resSkillB1b;
    private Skill resSkillB2a;
    private Skill resSkillB2b;

    private ViewProfile.ViewProfileMergeOptions options;

    private ViewProfile makeViewProfile() {
        ViewProfile view = new ViewProfile();
        l1 = new Language("Sprache1", LanguageLevel.ADVANCED, false);
        l2 = new Language("Sprache2", LanguageLevel.ADVANCED, true);
        view.getLanguages().add(l1);
        view.getLanguages().add(l2);

        c1 = new Career("Career1", LocalDate.now(), LocalDate.now(), true);
        c2 = new Career("Career2", LocalDate.now(), LocalDate.now(), false);
        view.getCareers().add(c1);
        view.getCareers().add(c2);

        p1 = new Project(1L, "name1", "description", "client", "broker", LocalDate.now(), LocalDate.now(), null, null, true);
        p2 = new Project(2L, "name2", "description", "client", "broker", LocalDate.now(), LocalDate.now(), null, null, true);
        view.getProjects().add(p1);
        view.getProjects().add(p2);

        third = new Category("third", true, true);
        second = new Category("second", true, true);
        first = new Category("first", true, true);
        root = new Category("root", true, true);


        resSkillA1a = new Skill(1L, "name-a1a", 3, true, root);
        resSkillA1b = new Skill(2L, "name-a1b", 3, false, root);
        resSkillA2a = new Skill(3L, "name-a2a", 3, false, first);
        resSkillA2b = new Skill(4L, "name-a2b", 3, true, first);
        resSkillB1a = new Skill(5L, "name-B1a", 3, true, second);
        resSkillB1b = new Skill(6L, "name-B1b", 3, false, second);
        resSkillB2a = new Skill(7L, "name-B2a", 3, true, third);
        resSkillB2b = new Skill(8L, "name-B2b", 3, false, third);

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
        viewProfileRepository = mock(ViewProfileRepository.class);
        when(viewProfileRepository.save(any())).thenAnswer(invocationOnMock -> invocationOnMock.getArgument(0));
        viewProfileMergeService = new ViewProfileMergeService(viewProfileRepository, viewProfileCreatorService);
    }

    @After
    public void tearDown() throws Exception {

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
        Project p3 = new Project(1L, "name1", "description", "client", "broker", LocalDate.now(), LocalDate.now(), null, null, false);
        Project p4 = new Project(2L, "name2", "description", "client", "broker", LocalDate.now(), LocalDate.now(), null, null, true);

        newProjects.add(p3);
        newProjects.add(p4);
        newViewProfile.setProjects(newProjects);


        newViewProfile = viewProfileMergeService.mergeViewProfiles(oldView, newViewProfile, options);

        assertThat(newViewProfile.getProjects()).contains(p1);
        assertThat(newViewProfile.getProjects()).contains(p2);
    }
}
