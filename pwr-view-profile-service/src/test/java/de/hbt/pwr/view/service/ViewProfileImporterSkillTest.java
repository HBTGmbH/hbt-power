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
import java.util.stream.Collectors;

import static junit.framework.TestCase.fail;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;
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
        viewProfileCreatorService = new ViewProfileCreatorService(profileServiceClient, skillServiceClient, viewProfileRepository, viewProfileSortService, new ViewProfileLocalizationService(skillServiceClient));
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
     * Without a display category above it, a skill stays at the category it hangs at, even alone (#169). Before, the
     * second highest category was taken.
     */
    @Test
    public void shouldKeepTheOwnCategoryWithoutDisplayCategoryAbove() {
        SkillServiceCategory highest = new SkillServiceCategory("Highest", null);
        SkillServiceCategory secondHighest = new SkillServiceCategory("SecondHighest", highest);
        SkillServiceCategory center = new SkillServiceCategory("Center", secondHighest);
        SkillServiceCategory lowest = new SkillServiceCategory("Lowest", center);
        givenSkills(skill("TestSkill", lowest));

        ViewProfile viewProfile = makeViewProfile(initials, "name", "descr", "");

        assertThat(displayCategoryNames(viewProfile)).containsExactly("Lowest");
    }

    /**
     * Categories with too few skills pass them on to the display category above, where they count together (#169)
     */
    @Test
    public void shouldBringSmallCategoriesTogetherInTheDisplayCategoryAbove() {
        SkillServiceCategory highest = new SkillServiceCategory("Highest", null);
        SkillServiceCategory secondHighest = new SkillServiceCategory("SecondHighest", highest, true);
        SkillServiceCategory center = new SkillServiceCategory("Center", secondHighest);
        SkillServiceCategory lowest = new SkillServiceCategory("Lowest", center);
        SkillServiceCategory lowest2 = new SkillServiceCategory("Lowest2", center);
        givenSkills(skill("Fizzing", lowest), skill("Buzzing", center), skill("Fooing", secondHighest), skill("Baring", lowest2));

        ViewProfile viewProfile = makeViewProfile(initials, "name", "descr", "");

        assertThat(displayCategoryNames(viewProfile)).containsExactly("SecondHighest");
        assertThat(viewProfile.getDisplayCategories().get(0).getDisplaySkills()).extracting(Skill::getName)
                .containsExactlyInAnyOrder("Fizzing", "Buzzing", "Fooing", "Baring");
    }

    /**
     * A display category with enough skills keeps them, the others move up (#169)
     */
    @Test
    public void shouldKeepACategoryWithEnoughSkills() {
        SkillServiceCategory development = new SkillServiceCategory("Development", null, true);
        SkillServiceCategory languages = new SkillServiceCategory("Languages", development, true);
        SkillServiceCategory buildTools = new SkillServiceCategory("Build Tools", development);
        givenSkills(skill("Java", languages), skill("Kotlin", languages), skill("TypeScript", languages), skill("Maven", buildTools));

        ViewProfile viewProfile = makeViewProfile(initials, "name", "descr", "");

        assertThat(viewProfile.findSkillByName("Java").get().getDisplayCategory().getName()).isEqualTo("Languages");
        assertThat(viewProfile.findSkillByName("TypeScript").get().getDisplayCategory().getName()).isEqualTo("Languages");
        assertThat(viewProfile.findSkillByName("Maven").get().getDisplayCategory().getName()).isEqualTo("Development");
    }

    /**
     * Only categories marked as display category, step by step from the bottom up (#169, #197): A starts in Marked, not
     * in its own category Lowest
     */
    @Test
    public void shouldMoveOnlyIntoDisplayCategories() {
        SkillServiceCategory top = new SkillServiceCategory("Top", null, true);
        SkillServiceCategory notMarked = new SkillServiceCategory("NotMarked", top);
        SkillServiceCategory marked = new SkillServiceCategory("Marked", notMarked, true);
        SkillServiceCategory lowest = new SkillServiceCategory("Lowest", marked);
        givenSkills(skill("A", lowest), skill("B", marked));

        ViewProfile viewProfile = makeViewProfile(initials, "name", "descr", "");

        // A and B start in Marked (2), which moves on past NotMarked into Top
        assertThat(displayCategoryNames(viewProfile)).containsExactly("Top");
        assertThat(viewProfile.getDisplayCategories().get(0).getDisplaySkills()).extracting(Skill::getName)
                .containsExactlyInAnyOrder("A", "B");
    }

    /**
     * The minimum comes from the configuration (view-profile.min-skills-per-category)
     */
    @Test
    public void shouldUseTheConfiguredMinimum() {
        SkillServiceCategory development = new SkillServiceCategory("Development", null, true);
        SkillServiceCategory languages = new SkillServiceCategory("Languages", development, true);
        givenSkills(skill("Java", languages), skill("Kotlin", languages));
        viewProfileCreatorService.setMinSkillsPerCategory(2);

        ViewProfile viewProfile = makeViewProfile(initials, "name", "descr", "");

        assertThat(displayCategoryNames(viewProfile)).containsExactly("Languages");
    }

    /**
     * A category that is no display category is never one in the view profile, however many skills it has (#197): they
     * start in the display category above
     */
    @Test
    public void shouldStartInTheLowestDisplayCategory() {
        SkillServiceCategory development = new SkillServiceCategory("Development", null, true);
        SkillServiceCategory languages = new SkillServiceCategory("Languages", development);
        givenSkills(skill("Java", languages), skill("Kotlin", languages), skill("TypeScript", languages));

        ViewProfile viewProfile = makeViewProfile(initials, "name", "descr", "");

        assertThat(displayCategoryNames(viewProfile)).containsExactly("Development");
        assertThat(viewProfile.getDisplayCategories().get(0).getDisplaySkills()).extracting(Skill::getName)
                .containsExactlyInAnyOrder("Java", "Kotlin", "TypeScript");
    }

    private SkillServiceSkill skill(String name, SkillServiceCategory category) {
        SkillServiceSkill skill = new SkillServiceSkill(name, category);
        skill.setId(-1);
        return skill;
    }

    private void givenSkills(SkillServiceSkill... skills) {
        for (SkillServiceSkill skill : skills) {
            profile.getSkills().add(new ProfileSkill(skill.getQualifier()));
            given(skillServiceClient.getSkillByName(skill.getQualifier())).willReturn(skill);
        }
        given(profileServiceClient.getSingleProfile(initials)).willReturn(profile);
    }

    private static List<String> displayCategoryNames(ViewProfile viewProfile) {
        return viewProfile.getDisplayCategories().stream().map(Category::getName).collect(Collectors.toList());
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

    /**
     * The view profile recognises skills and categories by their names, so a localization must not replace them (#93)
     */
    @Test
    public void shouldImportNamesFromSkillTree_evenIfLocalized() {
        SkillServiceCategory highest = new SkillServiceCategory("Highest", null);
        SkillServiceCategory center = new SkillServiceCategory("Center", highest);
        SkillServiceCategory lowest = new SkillServiceCategory("Lowest", center, true);
        SkillServiceSkill testSkill1 = new SkillServiceSkill("German", lowest);
        testSkill1.getQualifiers().add(new LocalizedQualifier("deu", "Deutsch"));
        lowest.getQualifiers().add(new LocalizedQualifier("deu", "Niedrigste"));

        profile.getSkills().add(new ProfileSkill(testSkill1.getQualifier()));
        given(skillServiceClient.getSkillByName(testSkill1.getQualifier())).willReturn(testSkill1);
        ViewProfile viewProfile = makeViewProfile(initials, "name", "descr", "deu");

        assertThat(viewProfile.findSkillByName("German")).isPresent();
        assertThat(viewProfile.findSkillByName("Deutsch")).isEmpty();
        assertThat(viewProfile.getDisplayCategories())
                .extracting(Category::getName)
                .containsExactly("Lowest");
    }

    /**
     * With a language (#174) the names stay those of the skill tree, the localizations go next to them
     */
    @Test
    public void shouldFillLocalizedNames_whenALanguageIsChosen() {
        SkillServiceCategory lowest = new SkillServiceCategory("Lowest", new SkillServiceCategory("Center", null), true);
        lowest.setId(7);
        lowest.getQualifiers().add(new LocalizedQualifier("deu", "Niedrigste"));
        SkillServiceSkill testSkill1 = new SkillServiceSkill("German", lowest);
        testSkill1.getQualifiers().add(new LocalizedQualifier("deu", "Deutsch"));
        profile.getSkills().add(new ProfileSkill(testSkill1.getQualifier()));
        given(skillServiceClient.getSkillByName(testSkill1.getQualifier())).willReturn(testSkill1);
        given(profileServiceClient.getSingleProfile(initials)).willReturn(profile);
        given(viewProfileRepository.save(any())).will(invocationOnMock -> invocationOnMock.getArgument(0));

        ViewProfile viewProfile = viewProfileCreatorService.createViewProfile(initials, "name", "descr", "", "deu");

        assertThat(viewProfile.getLocalization()).isEqualTo("deu");
        assertThat(viewProfile.findSkillByName("German").get().getLocalizedName()).isEqualTo("Deutsch");
        assertThat(viewProfile.getDisplayCategories())
                .extracting(Category::getName, Category::getLocalizedName)
                .containsExactly(tuple("Lowest", "Niedrigste"));
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
