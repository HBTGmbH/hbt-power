package de.hbt.pwr.profile.service;

import org.junit.Before;
import org.junit.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import de.hbt.pwr.profile.data.ProjectRepository;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.profile.entries.NameEntity;
import de.hbt.pwr.profile.model.profile.entries.Project;

import static de.hbt.pwr.profile.model.profile.NameEntityType.COMPANY;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.initMocks;

/**
 * TODO
 * Skills nicht doppelt zurück geben
 */
public class SkillRecommendationServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    private List<Project> projects;

    @InjectMocks
    private SkillRecommendationService skillRecommendationService;

    private Project sampleProject;

    @Before
    public void setUp() throws Exception {
        initMocks(this);
        sampleProject = new Project();
        sampleProject.setClient(NameEntity.builder().name("Starfleet").type(COMPANY).build());
        projects = new ArrayList<>();
        when(projectRepository.findAll()).thenReturn(projects);
    }


    private Project withExistingSkillsForCustomer(String customer, String...skills) {
        Project project = Project.builder()
                .client(NameEntity.builder().name(customer).type(COMPANY).build())
                .skills(Stream.of(skills).map(s -> Skill.builder().name(s).build()).collect(Collectors.toSet()))
                .build();
        projects.add(project);
        return project;
    }

    @Test
    public void shouldNotReturnNull() {
        assertThat(skillRecommendationService.getRecommendedSkills(null))
                .isNotNull();
    }

    @Test
    public void withoutProject_shouldReturnNoSkills() {
        Collection<Skill> recommendedSkills = skillRecommendationService.getRecommendedSkills(null);
        assertThat(recommendedSkills).isEmpty();
    }

    @Test
    public void withProjectForSpecificCustomer_shouldReturnCustomerSkills() {
        withExistingSkillsForCustomer("Starfleet", "Java", "JBoss");

        Collection<Skill> recommendedSkills = skillRecommendationService.getRecommendedSkills(sampleProject);

        assertThat(recommendedSkills)
                .extracting(Skill::getName)
                .containsExactly("Java", "JBoss");
    }

    @Test
    public void withProjectWithoutCustomer_shouldReturnNoSkills() {
        sampleProject.setClient(null);

        Collection<Skill> recommendedSkills = skillRecommendationService.getRecommendedSkills(sampleProject);

        assertThat(recommendedSkills).isEmpty();
    }

    @Test
    public void withExistingProject_ThatHasNoCustomer_shouldIgnore() {
        Project existingProject = withExistingSkillsForCustomer("Rebel Alliance");
        existingProject.setClient(null);
        Collection<Skill> recommendedSkills = skillRecommendationService.getRecommendedSkills(sampleProject);

        assertThat(recommendedSkills).isEmpty();
    }
}