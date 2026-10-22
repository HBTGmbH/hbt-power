package de.hbt.pwr.view.service;

import de.hbt.pwr.view.client.skill.SkillServiceClient;
import de.hbt.pwr.view.client.skill.model.LocalizedQualifier;
import de.hbt.pwr.view.client.skill.model.SkillServiceCategory;
import de.hbt.pwr.view.client.skill.model.SkillServiceSkill;
import de.hbt.pwr.view.exception.DisplayCategoryNotFoundException;
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
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.tuple;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Moving all skills of a display category (#171), only into display categories of the skill tree (#197). Skill tree,
 * [A] marks a display category:
 * <pre>
 * Information Technology (10) [A]
 *   Software Development (20) [A]
 *     Testing (31) [A]              JUnit
 *     Build Tools (32) [A]          Maven
 *     Frameworks (33)               React
 *       Backend Frameworks (41) [A] Spring Boot
 * </pre>
 * All four skills are in the display category Software Development.
 */
public class MoveAllSkillsTest {

    private final SkillServiceClient skillServiceClient = mock(SkillServiceClient.class);
    private ViewProfileOperationService service;
    private ViewProfile viewProfile;
    private SkillServiceCategory development;
    private SkillServiceCategory backend;

    private static SkillServiceCategory category(int id, String name, SkillServiceCategory parent, boolean display) {
        SkillServiceCategory category = new SkillServiceCategory(name, parent, display);
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
        SkillServiceCategory it = category(10, "Information Technology", null, true);
        development = category(20, "Software Development", it, true);
        SkillServiceCategory testing = category(31, "Testing", development, true);
        SkillServiceCategory buildTools = category(32, "Build Tools", development, true);
        SkillServiceCategory frameworks = category(33, "Frameworks", development, false);
        backend = category(41, "Backend Frameworks", frameworks, true);

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
    public void targetsAreTheDisplayCategoriesOfTheTreeWithTheSkillsThatFit() {
        List<DisplayCategoryTarget> targets = service.getMoveTargets(0, viewProfile);

        // Frameworks is no display category: Backend Frameworks hangs below Software Development here
        assertThat(targets).extracting(DisplayCategoryTarget::getName, DisplayCategoryTarget::getDepth,
                DisplayCategoryTarget::getSkills, DisplayCategoryTarget::getOf, DisplayCategoryTarget::isCurrent)
                .containsExactly(
                        tuple("Information Technology", 0, 4, 4, false),
                        tuple("Software Development", 1, 4, 4, true),
                        tuple("Backend Frameworks", 2, 1, 4, false),
                        tuple("Build Tools", 2, 1, 4, false),
                        tuple("Testing", 2, 1, 4, false));
    }

    @Test
    public void theCurrentCategoryIsATargetEvenIfItIsNoDisplayCategory() {
        // An older view profile, from before #197
        development.setDisplay(false);

        List<DisplayCategoryTarget> targets = service.getMoveTargets(0, viewProfile);

        assertThat(targets).extracting(DisplayCategoryTarget::getName, DisplayCategoryTarget::isCurrent)
                .contains(tuple("Software Development", true));
    }

    @Test
    public void movingIntoALowerCategoryMovesOnlyTheSkillsBelowIt() {
        service.moveAllSkills(viewProfile, 0, 41);

        assertThat(skillNames(displayCategory("Backend Frameworks").get())).containsExactly("Spring Boot");
        assertThat(skillNames(displayCategory("Software Development").get())).containsExactlyInAnyOrder("JUnit", "Maven", "React");
        assertThat(viewProfile.findSkillByName("Spring Boot").get().getDisplayCategory())
                .isSameAs(displayCategory("Backend Frameworks").get());
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
        service.moveAllSkills(viewProfile, 0, 41);
        // Software Development is index 0, Backend Frameworks index 1 now; move it back up
        service.moveAllSkills(viewProfile, 1, 20);

        assertThat(skillNames(displayCategory("Software Development").get()))
                .containsExactlyInAnyOrder("JUnit", "Maven", "React", "Spring Boot");
        assertThat(displayCategory("Backend Frameworks")).isEmpty();
    }

    @Test
    public void movingIntoACategoryThatIsNoDisplayCategoryIsRejected() {
        assertThatThrownBy(() -> service.moveAllSkills(viewProfile, 0, 33))
                .isInstanceOf(DisplayCategoryNotFoundException.class);

        assertThat(viewProfile.getDisplayCategories()).extracting(Category::getName).containsExactly("Software Development");
        assertThat(skillNames(viewProfile.getDisplayCategories().get(0))).hasSize(4);
    }

    @Test
    public void aNewCategoryGetsItsNameInTheLanguageOfTheViewProfile() {
        backend.getQualifiers().add(new LocalizedQualifier("deu", "Backend-Frameworks (deutsch)"));
        viewProfile.setLocalization("deu");

        service.moveAllSkills(viewProfile, 0, 41);

        assertThat(displayCategory("Backend Frameworks").get().getLocalizedName()).isEqualTo("Backend-Frameworks (deutsch)");
    }
}
