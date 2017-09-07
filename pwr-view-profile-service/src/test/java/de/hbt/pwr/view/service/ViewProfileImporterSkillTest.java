package de.hbt.pwr.view.service;

import de.hbt.pwr.view.client.profile.ProfileServiceClient;
import de.hbt.pwr.view.client.profile.model.Profile;
import de.hbt.pwr.view.client.profile.model.ProfileSkill;
import de.hbt.pwr.view.client.skill.SkillServiceClient;
import de.hbt.pwr.view.client.skill.SkillServiceFallback;
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

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static junit.framework.TestCase.fail;
import static org.assertj.core.api.Assertions.assertThat;
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
    private SkillServiceFallback skillServiceFallback;

    @MockBean
    private ViewProfileRepository viewProfileRepository;

    @MockBean
    private ViewProfileSortService viewProfileSortService;


    private ViewProfileImporter viewProfileImporter;

    private final String initials = "tst";
    private SkillServiceCategory categoryA;
    private SkillServiceCategory categoryA1;
    private SkillServiceCategory categoryA2;
    private SkillServiceCategory categoryB;
    private SkillServiceCategory categoryB1;
    private SkillServiceCategory categoryB2;
    private Category root;
    private Skill resSkillA1a;
    private Skill resSkillA1b;
    private Skill resSkillA2a;
    private Skill resSkillA2b;
    private Skill resSkillB1a;
    private Skill resSkillB1b;
    private Skill resSkillB2a;
    private Skill resSkillB2b;

    private Profile profile;

    @Before
    public void setUp() throws Exception {
        profile = new Profile();
        given(profileServiceClient.getSingleProfile(initials)).willReturn(profile);
        viewProfileImporter = new ViewProfileImporter(profileServiceClient, skillServiceClient, skillServiceFallback, viewProfileRepository, viewProfileSortService);
    }

    @After
    public void tearDown() throws Exception {
        reset(skillServiceClient);
        reset(profileServiceClient);
    }

    private Category makeCategory(String name, Category parent) {
        Category category = new Category();
        category.setName(name);
        category.setEnabled(true);
        if(parent != null) {
            category.setParent(parent);
        }
        return category;
    }

    private Skill makeSkill(String name) {
        Skill skill = new Skill();
        skill.setName(name);
        skill.setEnabled(true);
        skill.setRating(5);
        return skill;
    }

    private Category getCategoryOrFail(List<Category> categoryList, String nameToFind) {
        Optional<Category> optional = categoryList.stream().filter(category -> category.getName().equals(nameToFind)).findAny();
        if(optional.isPresent()) {
            return optional.get();
        } else {
            fail("Expected " + categoryList.toString() + " to contain a category with the name '" + nameToFind + "'");
            // Somehow necessary
            throw new RuntimeException();
        }
    }
    
    private void initData() {
        categoryA = new SkillServiceCategory("categoryA");
        categoryA1 = new SkillServiceCategory("categoryA1", categoryA);
        categoryA2 = new SkillServiceCategory("categoryA2", categoryA);
        categoryB = new SkillServiceCategory("categoryB");
        categoryB1 = new SkillServiceCategory("categoryB1", categoryB);
        categoryB2 = new SkillServiceCategory("categoryB2", categoryB);

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
            profile.getSkills().add(new ProfileSkill(skill.getQualifier(), 5));
        }
        given(profileServiceClient.getSingleProfile(initials)).willReturn(profile);

        root = new Category("root");

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
    public void shouldImportAsSkillTree() {
        initData();
        ViewProfile viewProfile = viewProfileImporter.importViewProfile(initials);
        assertThat(viewProfile.getRootCategory()).isEqualTo(root);
        assertThat(viewProfile.getRootCategory().getSkills()).isEmpty();
        Category resA = getCategoryOrFail(viewProfile.getRootCategory().getChildren(), categoryA.getQualifier());
        Category resB = getCategoryOrFail(viewProfile.getRootCategory().getChildren(), categoryB.getQualifier());
        Category resA1 = getCategoryOrFail(resA.getChildren(), categoryA1.getQualifier());
        Category resA2 = getCategoryOrFail(resA.getChildren(), categoryA2.getQualifier());
        Category resB1 = getCategoryOrFail(resB.getChildren(), categoryB1.getQualifier());
        Category resB2 = getCategoryOrFail(resB.getChildren(), categoryB2.getQualifier());

        assertThat(resA1.getSkills()).containsExactlyInAnyOrder(resSkillA1a, resSkillA1b);
        assertThat(resA2.getSkills()).containsExactlyInAnyOrder(resSkillA2a, resSkillA2b);
        assertThat(resB1.getSkills()).containsExactlyInAnyOrder(resSkillB1a, resSkillB1b);
        assertThat(resB2.getSkills()).containsExactlyInAnyOrder(resSkillB2a, resSkillB2b);
    }

    @Test
    public void allSkillsShouldBeAvailable() {
        initData();
        ViewProfile viewProfile = viewProfileImporter.importViewProfile(initials);
        assertThat(viewProfile.findSkillByName(resSkillA1a.getName()).isPresent()).isTrue();
        assertThat(viewProfile.findSkillByName(resSkillA1b.getName()).isPresent()).isTrue();
        assertThat(viewProfile.findSkillByName(resSkillA2a.getName()).isPresent()).isTrue();
        assertThat(viewProfile.findSkillByName(resSkillA2b.getName()).isPresent()).isTrue();
        assertThat(viewProfile.findSkillByName(resSkillB1a.getName()).isPresent()).isTrue();
        assertThat(viewProfile.findSkillByName(resSkillB1b.getName()).isPresent()).isTrue();
        assertThat(viewProfile.findSkillByName(resSkillB2a.getName()).isPresent()).isTrue();
        assertThat(viewProfile.findSkillByName(resSkillB2b.getName()).isPresent()).isTrue();
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

        ViewProfile viewProfile = viewProfileImporter.importViewProfile(initials);

        Category category = new Category(secondHighest.getQualifier(), true, null, true);

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
        SkillServiceSkill testSkill2 = new SkillServiceSkill("Buzzing", center);
        SkillServiceSkill testSkill3 = new SkillServiceSkill("Fooing", secondHighest);
        SkillServiceSkill testSkill4 = new SkillServiceSkill("Baring", lowest2);

        profile.getSkills().add(new ProfileSkill(testSkill1.getQualifier()));
        profile.getSkills().add(new ProfileSkill(testSkill2.getQualifier()));
        profile.getSkills().add(new ProfileSkill(testSkill3.getQualifier()));
        profile.getSkills().add(new ProfileSkill(testSkill4.getQualifier()));

        given(profileServiceClient.getSingleProfile(initials)).willReturn(profile);
        given(skillServiceClient.getSkillByName(testSkill1.getQualifier())).willReturn(testSkill1);
        given(skillServiceClient.getSkillByName(testSkill2.getQualifier())).willReturn(testSkill2);
        given(skillServiceClient.getSkillByName(testSkill3.getQualifier())).willReturn(testSkill3);
        given(skillServiceClient.getSkillByName(testSkill4.getQualifier())).willReturn(testSkill4);

        ViewProfile viewProfile = viewProfileImporter.importViewProfile(initials);
        Category displayCategory = viewProfile.getDisplayCategories().get(0);
        assertThat(displayCategory.getDisplaySkills()).containsExactlyInAnyOrder(
                Skill.builder().name(testSkill1.getQualifier()).build(),
                Skill.builder().name(testSkill2.getQualifier()).build(),
                Skill.builder().name(testSkill3.getQualifier()).build(),
                Skill.builder().name(testSkill4.getQualifier()).build()
        );
    }

    /**
     * Problem:
     * - root
     *   - tier0 category
     *    - skill // <- this skill has no display category but needs one
     *    - display
     *     - skill // <- this skill is happy because it has one.
     */
    @Test
    public void shouldSetDisplayForAllSkillsAboveDefaultDisplayToTheirParent() {
        SkillServiceCategory highest = new SkillServiceCategory("Highest", null);
        SkillServiceCategory secondHighest = new SkillServiceCategory("SecondHighest", highest);
        SkillServiceCategory center = new SkillServiceCategory("Center", secondHighest);
        SkillServiceCategory lowest = new SkillServiceCategory("Lowest", center);
        SkillServiceSkill testSkill1 = new SkillServiceSkill("Fizzing", highest);

        profile.getSkills().add(new ProfileSkill(testSkill1.getQualifier()));
        given(skillServiceClient.getSkillByName(testSkill1.getQualifier())).willReturn(testSkill1);

        ViewProfile viewProfile = viewProfileImporter.importViewProfile(initials);
        Category categoryWithOrphan = viewProfile.getRootCategory().getChildren().get(0);
        assertThat(categoryWithOrphan.getName()).isEqualTo(highest.getQualifier());
        assertThat(categoryWithOrphan.getDisplaySkills()).containsExactlyInAnyOrder(Skill.builder().name(testSkill1.getQualifier()).build());
    }

    /**
     * Sometimes, the skill service will provide a display category.
     * Makes sure that this is used.
     *
     */
    @Test
    public void shouldUseDisplayCategoryOverride() {
        SkillServiceCategory highest = new SkillServiceCategory("Highest", null);
        SkillServiceCategory center = new SkillServiceCategory("Center", highest);
        SkillServiceCategory lowest = new SkillServiceCategory("Lowest", center, true);
        SkillServiceSkill testSkill1 = new SkillServiceSkill("adada", lowest);
        profile.getSkills().add(new ProfileSkill(testSkill1.getQualifier()));
        given(skillServiceClient.getSkillByName(testSkill1.getQualifier())).willReturn(testSkill1);
        ViewProfile viewProfile = viewProfileImporter.importViewProfile(initials);

        Optional<Skill> skillOptional = viewProfile.findSkillByName(testSkill1.getQualifier());
        assertThat(skillOptional.isPresent()).isTrue();
        assertThat(skillOptional.get().getDisplayCategory().getName()).isEqualTo(lowest.getQualifier());
    }

    /**
     * Override has to override any default behavior. 2nd highest is default.
     */
    @Test
    public void shouldUseDisplayCategoryOverrideAboveDefault() {
        SkillServiceCategory highest = new SkillServiceCategory("Highest", null,  true);
        SkillServiceCategory center = new SkillServiceCategory("Center", highest);
        SkillServiceCategory lowest = new SkillServiceCategory("Lowest", center);
        SkillServiceSkill testSkill1 = new SkillServiceSkill("adada", lowest);
        profile.getSkills().add(new ProfileSkill(testSkill1.getQualifier()));
        given(skillServiceClient.getSkillByName(testSkill1.getQualifier())).willReturn(testSkill1);
        ViewProfile viewProfile = viewProfileImporter.importViewProfile(initials);

        Optional<Skill> skillOptional = viewProfile.findSkillByName(testSkill1.getQualifier());
        assertThat(skillOptional.isPresent()).isTrue();
        assertThat(skillOptional.get().getDisplayCategory().getName()).isEqualTo(highest.getQualifier());
    }
}