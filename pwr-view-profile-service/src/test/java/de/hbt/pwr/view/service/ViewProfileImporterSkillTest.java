package de.hbt.pwr.view.service;

import de.hbt.pwr.view.client.profile.ProfileServiceClient;
import de.hbt.pwr.view.client.profile.model.Profile;
import de.hbt.pwr.view.client.profile.model.ProfileSkill;
import de.hbt.pwr.view.client.skill.SkillServiceClient;
import de.hbt.pwr.view.client.skill.model.LocalizedQualifier;
import de.hbt.pwr.view.client.skill.model.SkillServiceCategory;
import de.hbt.pwr.view.client.skill.model.SkillServiceSkill;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.Skill;
import de.hbt.pwr.view.repo.ViewProfileRepository;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static junit.framework.TestCase.fail;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.reset;

/**
 * Validates that skills are correctly imported
 */
@RunWith(SpringJUnit4ClassRunner.class)
public class ViewProfileImporterSkillTest {

    @MockBean
    private SkillServiceClient skillServiceClient;

    @MockBean
    private ProfileServiceClient profileServiceClient;

    @MockBean
    private ViewProfileRepository viewProfileRepository;

    @MockBean
    private ViewProfileSortService viewProfileSortService;

    private ViewProfileCreatorService viewProfileCreatorService;


    private final String initials = "tst";
    private SkillServiceCategory categoryA;
    private SkillServiceCategory categoryA1;
    private SkillServiceCategory categoryA2;
    private SkillServiceCategory categoryB;
    private SkillServiceCategory categoryB1;
    private SkillServiceCategory categoryB2;
    private Skill resSkillA1a;
    private Skill resSkillA1b;
    private Skill resSkillA2a;
    private Skill resSkillA2b;
    private Skill resSkillB1a;
    private Skill resSkillB1b;
    private Skill resSkillB2a;
    private Skill resSkillB2b;

    private static final int SKILL_RATING = 5;

    private Profile profile;

    @Before
    public void setUp() {
        profile = new Profile();
        given(profileServiceClient.getSingleProfile(initials)).willReturn(profile);
        viewProfileCreatorService = new ViewProfileCreatorService(profileServiceClient, skillServiceClient, viewProfileRepository, viewProfileSortService);
    }

    @After
    public void tearDown() {
        reset(skillServiceClient);
        reset(profileServiceClient);
    }

    private ViewProfile makeViewProfile(String initials, String name, String description, String locale) {
        given(profileServiceClient.getSingleProfile(initials)).willReturn(profile);
        given(viewProfileRepository.save(any())).will(invocationOnMock -> invocationOnMock.getArgument(0));
        return viewProfileCreatorService.createViewProfile(initials, name, description, locale);
    }

    private Skill makeSkill(String name) {
        Skill skill = new Skill();
        skill.setName(name);
        skill.setEnabled(true);
        skill.setRating(SKILL_RATING);
        skill.setId(1L);
        return skill;
    }

    private Category getCategoryOrFail(List<Category> categoryList, String nameToFind) {
        Optional<Category> optional = categoryList.stream().filter(category -> category.getName().equals(nameToFind)).findAny();
        if (optional.isPresent()) {
            return optional.get();
        } else {
            fail("Expected " + categoryList.toString() + " to contain a category with the name '" + nameToFind + "'");
            // Somehow necessary
            throw new RuntimeException();
        }
    }

    private void initData() {
        categoryA = new SkillServiceCategory(1, "categoryA");
        categoryA1 = new SkillServiceCategory("categoryA1", categoryA);
        categoryA1.setId(2);
        categoryA2 = new SkillServiceCategory("categoryA2", categoryA);
        categoryA2.setId(3);
        categoryB = new SkillServiceCategory(4, "categoryB");
        categoryB1 = new SkillServiceCategory("categoryB1", categoryB);
        categoryB1.setId(5);
        categoryB2 = new SkillServiceCategory("categoryB2", categoryB);
        categoryB2.setId(6);

        SkillServiceSkill skillA1a = new SkillServiceSkill("SkillA1a", categoryA1);
        SkillServiceSkill skillA1b = new SkillServiceSkill("SkillA1b", categoryA1);
        SkillServiceSkill skillA2a = new SkillServiceSkill("SkillA2a", categoryA2);
        SkillServiceSkill skillA2b = new SkillServiceSkill("SkillA2b", categoryA2);

        SkillServiceSkill skillB1a = new SkillServiceSkill("SkillB1a", categoryB1);
        SkillServiceSkill skillB1b = new SkillServiceSkill("SkillB1b", categoryB1);
        SkillServiceSkill skillB2a = new SkillServiceSkill("SkillB2a", categoryB2);
        SkillServiceSkill skillB2b = new SkillServiceSkill("SkillB2b", categoryB2);

        List<SkillServiceSkill> skills = Arrays.asList(skillA1a, skillA1b, skillA2a, skillA2b, skillB1a, skillB1b, skillB2a, skillB2b);

        for (SkillServiceSkill skill : skills) {
            given(skillServiceClient.getSkillByName(skill.getQualifier())).willReturn(skill);
            profile.getSkills().add(new ProfileSkill(skill.getQualifier(), SKILL_RATING));
        }
        given(profileServiceClient.getSingleProfile(initials)).willReturn(profile);
        given(viewProfileRepository.save(any())).will(invocationOnMock -> invocationOnMock.getArgument(0));


        resSkillA1a = makeSkill(skillA1a.getQualifier());
        resSkillA1b = makeSkill(skillA1b.getQualifier());
        resSkillA2a = makeSkill(skillA2a.getQualifier());
        resSkillA2b = makeSkill(skillA2b.getQualifier());
        resSkillB1a = makeSkill(skillB1a.getQualifier());
        resSkillB1b = makeSkill(skillB1b.getQualifier());
        resSkillB2a = makeSkill(skillB2a.getQualifier());
        resSkillB2b = makeSkill(skillB2b.getQualifier());
    }

    @Test
    public void allSkillsShouldBeAvailable() {
        initData();
        ViewProfile viewProfile = makeViewProfile(initials, "name", "descr", "");
        assertThat(viewProfile.findSkillByName(resSkillA1a.getName()).isPresent()).isTrue();
        assertThat(viewProfile.findSkillByName(resSkillA1b.getName()).isPresent()).isTrue();
        assertThat(viewProfile.findSkillByName(resSkillA2a.getName()).isPresent()).isTrue();
        assertThat(viewProfile.findSkillByName(resSkillA2b.getName()).isPresent()).isTrue();
        assertThat(viewProfile.findSkillByName(resSkillB1a.getName()).isPresent()).isTrue();
        assertThat(viewProfile.findSkillByName(resSkillB1b.getName()).isPresent()).isTrue();
        assertThat(viewProfile.findSkillByName(resSkillB2a.getName()).isPresent()).isTrue();
        assertThat(viewProfile.findSkillByName(resSkillB2b.getName()).isPresent()).isTrue();

        assertThat(viewProfile.findSkillByName(resSkillA1a.getName()).get().getRating()).isEqualTo(SKILL_RATING);
    }

    /**
     * Validates that the default behavior for skill display categories works as intended.
     * The default behavior uses the category that is second highest in the tree (without root)
     * as a display category.
     */
    @Test
    public void shouldSetDisplayCategoryToSecondHighestInTree() {
        SkillServiceCategory highest = new SkillServiceCategory("Highest", null);
        SkillServiceCategory secondHighest = new SkillServiceCategory("SecondHighest", highest);
        SkillServiceCategory center = new SkillServiceCategory("Center", secondHighest);
        SkillServiceCategory lowest = new SkillServiceCategory("Lowest", center);
        SkillServiceSkill skillServiceSkill = new SkillServiceSkill("TestSkill", lowest);
        given(skillServiceClient.getSkillByName(skillServiceSkill.getQualifier())).willReturn(skillServiceSkill);
        profile.getSkills().add(new ProfileSkill("TestSkill"));
        given(profileServiceClient.getSingleProfile(initials)).willReturn(profile);

        ViewProfile viewProfile = makeViewProfile(initials, "name", "descr", "");

        Category category = new Category(-1L,secondHighest.getQualifier(), true,  true);

        assertThat(viewProfile.getDisplayCategories()).containsExactlyInAnyOrder(category);
    }

    @Test
    public void shouldSetAllDirectAndDirectSkillsAsDisplaySkills() {
        SkillServiceCategory highest = new SkillServiceCategory("Highest", null);
        SkillServiceCategory secondHighest = new SkillServiceCategory("SecondHighest", highest);
        SkillServiceCategory center = new SkillServiceCategory("Center", secondHighest);
        SkillServiceCategory lowest = new SkillServiceCategory("Lowest", center);
        SkillServiceCategory lowest2 = new SkillServiceCategory("Lowest2", center);

        SkillServiceSkill testSkill1 = new SkillServiceSkill("Fizzing", lowest);
        testSkill1.setId(-1);
        SkillServiceSkill testSkill2 = new SkillServiceSkill("Buzzing", center);
        testSkill2.setId(-1);
        SkillServiceSkill testSkill3 = new SkillServiceSkill("Fooing", secondHighest);
        testSkill3.setId(-1);
        SkillServiceSkill testSkill4 = new SkillServiceSkill("Baring", lowest2);
        testSkill4.setId(-1);

        profile.getSkills().add(new ProfileSkill(testSkill1.getQualifier()));
        profile.getSkills().add(new ProfileSkill(testSkill2.getQualifier()));
        profile.getSkills().add(new ProfileSkill(testSkill3.getQualifier()));
        profile.getSkills().add(new ProfileSkill(testSkill4.getQualifier()));

        given(profileServiceClient.getSingleProfile(initials)).willReturn(profile);
        given(skillServiceClient.getSkillByName(testSkill1.getQualifier())).willReturn(testSkill1);
        given(skillServiceClient.getSkillByName(testSkill2.getQualifier())).willReturn(testSkill2);
        given(skillServiceClient.getSkillByName(testSkill3.getQualifier())).willReturn(testSkill3);
        given(skillServiceClient.getSkillByName(testSkill4.getQualifier())).willReturn(testSkill4);

        ViewProfile viewProfile = makeViewProfile(initials, "name", "descr", "");
        Category displayCategory = viewProfile.getDisplayCategories().get(0);
        assertThat(displayCategory.getDisplaySkills()).containsExactlyInAnyOrder(
                Skill.builder().id(-1L).name(testSkill1.getQualifier()).versions(new ArrayList<>()).build(),
                Skill.builder().id(-1L).name(testSkill2.getQualifier()).versions(new ArrayList<>()).build(),
                Skill.builder().id(-1L).name(testSkill3.getQualifier()).versions(new ArrayList<>()).build(),
                Skill.builder().id(-1L).name(testSkill4.getQualifier()).versions(new ArrayList<>()).build()
        );
    }



    /**
     * Sometimes, the skill service will provide a display category.
     * Makes sure that this is used.
     */
    @Test
    public void shouldUseDisplayCategoryOverride() {
        SkillServiceCategory highest = new SkillServiceCategory("Highest", null);
        SkillServiceCategory center = new SkillServiceCategory("Center", highest);
        SkillServiceCategory lowest = new SkillServiceCategory("Lowest", center, true);
        SkillServiceSkill testSkill1 = new SkillServiceSkill("adada", lowest);
        profile.getSkills().add(new ProfileSkill(testSkill1.getQualifier()));
        given(skillServiceClient.getSkillByName(testSkill1.getQualifier())).willReturn(testSkill1);
        ViewProfile viewProfile = makeViewProfile(initials, "name", "descr", "");

        Optional<Skill> skillOptional = viewProfile.findSkillByName(testSkill1.getQualifier());
        assertThat(skillOptional.isPresent()).isTrue();
        assertThat(skillOptional.get().getDisplayCategory().getName()).isEqualTo(lowest.getQualifier());
    }

    @Test
    public void shouldHaveViewDescriptionSet() {
        String description = "MyFooBarDescription";
        ViewProfile viewProfile = makeViewProfile(initials, "name", description, "");
        assertThat(viewProfile.getViewProfileInfo().getViewDescription()).isEqualTo(description);
    }

    @Test
    public void shouldHaveNameSet() {
        String name = "MyName";
        ViewProfile viewProfile = makeViewProfile(initials, name, "descr", "");
        assertThat(viewProfile.getViewProfileInfo().getName()).isEqualTo(name);
    }

    @Test
    public void creationDateShouldNotBeNull() {
        ViewProfile viewProfile = makeViewProfile(initials, "name", "descr", "");
        assertThat(viewProfile.getViewProfileInfo().getCreationDate()).isNotNull();
    }

    @Test
    public void shouldImportWithLocaleIfAvailable() {
        SkillServiceCategory highest = new SkillServiceCategory("Highest", null);
        SkillServiceCategory center = new SkillServiceCategory("Center", highest);
        SkillServiceCategory lowest = new SkillServiceCategory("Lowest", center, true);
        SkillServiceSkill testSkill1 = new SkillServiceSkill("German", lowest);
        LocalizedQualifier localizedQualifier = new LocalizedQualifier("deu", "Deutsch");
        LocalizedQualifier localizedQualifierCategory = new LocalizedQualifier("deu", "Niedrigste");
        testSkill1.getQualifiers().add(localizedQualifier);
        lowest.getQualifiers().add(localizedQualifierCategory);

        profile.getSkills().add(new ProfileSkill(testSkill1.getQualifier()));
        given(skillServiceClient.getSkillByName(testSkill1.getQualifier())).willReturn(testSkill1);
        ViewProfile viewProfile = makeViewProfile(initials, "name", "descr", "deu");

        Optional<Skill> skillOptional = viewProfile.findSkillByName(localizedQualifier.getQualifier());
        assertThat(skillOptional.isPresent()).isTrue();
        assertThat(skillOptional.get().getName()).isEqualTo(localizedQualifier.getQualifier());
    }

    @Test
    public void whenImportingWithoutCategory_ShouldAddOther() {
        SkillServiceSkill testSkill1 = new SkillServiceSkill("German", null);
        profile.getSkills().add(new ProfileSkill(testSkill1.getQualifier()));
        given(skillServiceClient.getSkillByName(testSkill1.getQualifier())).willReturn(testSkill1);
        ViewProfile viewProfile = makeViewProfile(initials, "name", "descr", "deu");

        assertThat(viewProfile.getDisplayCategories())
                .extracting(Category::getName)
                .contains("Other");
    }
}
