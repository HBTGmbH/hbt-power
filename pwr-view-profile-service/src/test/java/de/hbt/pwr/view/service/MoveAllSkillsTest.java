package de.hbt.pwr.view.service;

import de.hbt.pwr.view.client.skill.SkillServiceClient;
import de.hbt.pwr.view.client.skill.model.LocalizedQualifier;
import de.hbt.pwr.view.client.skill.model.SkillServiceCategory;
import de.hbt.pwr.view.client.skill.model.SkillServiceSkill;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.DisplayCategoryTarget;
import de.hbt.pwr.view.model.skill.Skill;
import de.hbt.pwr.view.repo.ViewProfileRepository;
import org.junit.Before;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Moving all skills of a display category (#171). Skill tree:
 * <pre>
 * Information Technology (10)
 *   Software Development (20)
 *     Testing (31)             JUnit
 *     Build Tools (32)         Maven
 *     Frameworks (33)          React
 *       Backend Frameworks (41) Spring Boot
 * </pre>
 * All four skills are in the display category Software Development.
 */
public class MoveAllSkillsTest {

    private final SkillServiceClient skillServiceClient = mock(SkillServiceClient.class);
    private ViewProfileOperationService service;
    private ViewProfile viewProfile;

    private static SkillServiceCategory category(int id, String name, SkillServiceCategory parent) {
        SkillServiceCategory category = new SkillServiceCategory(name, parent);
        category.setId(id);
        return category;
    }

    private void skill(String name, SkillServiceCategory category, Category displayCategory) {
        when(skillServiceClient.getSkillByName(name)).thenReturn(new SkillServiceSkill(name, category));
        Skill.builder().name(name).id((long) name.hashCode()).enabled(true).displayCategory(displayCategory).build();
    }

    @Before
    public void setUp() {
        service = new ViewProfileOperationService(mock(ViewProfileRepository.class), skillServiceClient);
        SkillServiceCategory it = category(10, "Information Technology", null);
        SkillServiceCategory development = category(20, "Software Development", it);
        SkillServiceCategory testing = category(31, "Testing", development);
        SkillServiceCategory buildTools = category(32, "Build Tools", development);
        SkillServiceCategory frameworks = category(33, "Frameworks", development);
        SkillServiceCategory backend = category(41, "Backend Frameworks", frameworks);

        Category display = Category.builder().id(20L).name("Software Development").enabled(true).isDisplay(true)
                .displaySkills(new ArrayList<>()).build();
        viewProfile = new ViewProfile();
        viewProfile.getDisplayCategories().add(display);
        skill("JUnit", testing, display);
        skill("Maven", buildTools, display);
        skill("React", frameworks, display);
        skill("Spring Boot", backend, display);
    }

    private Optional<Category> displayCategory(String name) {
        return viewProfile.getDisplayCategories().stream().filter(category -> category.getName().equals(name)).findFirst();
    }

    private static List<String> skillNames(Category category) {
        List<String> names = new ArrayList<>();
        category.getDisplaySkills().forEach(skill -> names.add(skill.getName()));
        return names;
    }

    @Test
    public void targetsAreTheCategoriesOfTheTreeWithTheSkillsThatFit() {
        List<DisplayCategoryTarget> targets = service.getMoveTargets(0, viewProfile);

        assertThat(targets).extracting(DisplayCategoryTarget::getName, DisplayCategoryTarget::getDepth,
                DisplayCategoryTarget::getSkills, DisplayCategoryTarget::getOf, DisplayCategoryTarget::isCurrent)
                .containsExactly(
                        tuple("Information Technology", 0, 4, 4, false),
                        tuple("Software Development", 1, 4, 4, true),
                        tuple("Build Tools", 2, 1, 4, false),
                        tuple("Frameworks", 2, 2, 4, false),
                        tuple("Backend Frameworks", 3, 1, 4, false),
                        tuple("Testing", 2, 1, 4, false));
    }

    @Test
    public void movingIntoALowerCategoryMovesOnlyTheSkillsBelowIt() {
        service.moveAllSkills(viewProfile, 0, 33);

        assertThat(skillNames(displayCategory("Frameworks").get())).containsExactlyInAnyOrder("React", "Spring Boot");
        assertThat(skillNames(displayCategory("Software Development").get())).containsExactlyInAnyOrder("JUnit", "Maven");
        assertThat(viewProfile.findSkillByName("React").get().getDisplayCategory()).isSameAs(displayCategory("Frameworks").get());
    }

    @Test
    public void movingIntoAHigherCategoryMovesAllSkillsAndRemovesTheEmptyOne() {
        service.moveAllSkills(viewProfile, 0, 10);

        assertThat(viewProfile.getDisplayCategories()).extracting(Category::getName).containsExactly("Information Technology");
        assertThat(skillNames(viewProfile.getDisplayCategories().get(0)))
                .containsExactlyInAnyOrder("JUnit", "Maven", "React", "Spring Boot");
    }

    @Test
    public void movingIntoAnExistingCategoryAddsEachSkillOnce() {
        service.moveAllSkills(viewProfile, 0, 33);
        // Software Development is index 0, Frameworks index 1 now; move the rest of Software Development up and back
        service.moveAllSkills(viewProfile, 1, 20);

        assertThat(skillNames(displayCategory("Software Development").get()))
                .containsExactlyInAnyOrder("JUnit", "Maven", "React", "Spring Boot");
        assertThat(displayCategory("Frameworks")).isEmpty();
    }

    @Test
    public void aNewCategoryGetsItsNameInTheLanguageOfTheViewProfile() {
        SkillServiceSkill react = skillServiceClient.getSkillByName("React");
        react.getCategory().getQualifiers().add(new LocalizedQualifier("deu", "Frameworks (deutsch)"));
        viewProfile.setLocalization("deu");

        service.moveAllSkills(viewProfile, 0, 33);

        assertThat(displayCategory("Frameworks").get().getLocalizedName()).isEqualTo("Frameworks (deutsch)");
    }
}
