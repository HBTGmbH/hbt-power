package de.hbt.power.service;

import de.hbt.power.exception.SkillServiceException;
import de.hbt.power.model.SkillCategory;
import de.hbt.power.repo.SkillCategoryRepository;
import de.hbt.power.repo.SkillRepository;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;

import static de.hbt.power.SkillServiceTestUtils.expectThrown;
import static java.util.Optional.of;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.mockito.MockitoAnnotations.initMocks;

public class CategoryServiceTest {

    @Mock
    private SkillCategoryRepository skillCategoryRepository;

    @Mock
    private SkillRepository skillRepository;

    private CategoryService categoryService;
    private SkillCategory skillCategory;

    @Before
    public void setUp() throws Exception {
        initMocks(this);
        categoryService = new CategoryService(skillCategoryRepository, skillRepository);
        skillCategory = new SkillCategory().toBuilder()
                .qualifier("Baking&Cooking")
                .id(5)
                .build();
        when(skillCategoryRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    public void whenCreatingCategory_withoutId_shouldThrowException() {
        skillCategory.setId(null);
        SkillServiceException exception = expectThrown(() -> categoryService.createSkillCategory(skillCategory, 99), SkillServiceException.class);
        assertThat(exception.getMessage()).isEqualTo("Request validation of category.id failed with reason: Id is null.");
    }

    @Test
    public void whenCreatingCategory_withoutQualifier_shouldThrow() {
        skillCategory.setQualifier(null);
        SkillServiceException exception = expectThrown(() -> categoryService.createSkillCategory(skillCategory, 99), SkillServiceException.class);
        assertThat(exception.getMessage()).isEqualTo("Request validation of category.qualifier failed with reason: Qualifier is null.");
    }

    @Test
    public void whenCreatingCategory_withoutEmpty_shouldThrow() {
        skillCategory.setQualifier("");
        SkillServiceException exception = expectThrown(() -> categoryService.createSkillCategory(skillCategory, 99), SkillServiceException.class);
        assertThat(exception.getMessage()).isEqualTo("Request validation of category.qualifier failed with reason: Qualifier is empty.");
    }

    @Test
    public void whenCreating_shouldCreateWithCustom_andSave() {
        SkillCategory category = categoryService.createSkillCategory(skillCategory, null);
        assertThat(category.getQualifier()).isEqualTo(skillCategory.getQualifier());
        assertThat(category.isCustom()).isTrue();
        verify(skillCategoryRepository, times(1)).save(category);
    }

    @Test
    public void whenCreatingCategory_shouldSetParent() {
        SkillCategory parent = new SkillCategory().toBuilder().id(99).qualifier("Parenting").build();
        when(skillCategoryRepository.findById(99)).thenReturn(of(parent));
        SkillCategory category = categoryService.createSkillCategory(skillCategory, 99);
        assertThat(category.getCategory()).isNotNull();
        assertThat(category.getCategory()).isEqualTo(parent);
    }

    @Test
    public void whenCreatingCategory_withParent_shouldAcceptBlacklistingFromParent() {
        SkillCategory parent = new SkillCategory().toBuilder().id(99).blacklisted(true).qualifier("Parenting").build();
        when(skillCategoryRepository.findById(99)).thenReturn(of(parent));
        SkillCategory category = categoryService.createSkillCategory(skillCategory, 99);
        assertThat(category.isBlacklisted()).isTrue();
    }

    @Test
    public void whenCreatingCategory_whereCategoryWithNameAlreadyExists_shouldThrow() {
        SkillCategory concurrent = new SkillCategory().toBuilder().id(55).qualifier(skillCategory.getQualifier()).build();
        when(skillCategoryRepository.findOneByQualifier(skillCategory.getQualifier())).thenReturn(of(concurrent));
        SkillServiceException exception = expectThrown(() -> categoryService.createSkillCategory(skillCategory, null), SkillServiceException.class);
        assertThat(exception.getMessage()).isEqualTo("Category Baking&Cooking already exists.");
    }

}