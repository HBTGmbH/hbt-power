package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.data.ProjectRepository;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.profile.entries.NameEntity;
import de.hbt.pwr.profile.model.profile.entries.Project;
import org.junit.Before;
import org.junit.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static de.hbt.pwr.profile.model.profile.NameEntityType.COMPANY;
import static de.hbt.pwr.profile.model.profile.NameEntityType.PROJECT_ROLE;
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
    private Collection<String> defaultRoles = new ArrayList<>(Arrays.asList("Programmer", "QATester"));

    @Before
    public void setUp() throws Exception {
        initMocks(this);
        sampleProject = new Project();
        sampleProject.setClient(NameEntity.builder().name("Starfleet").type(COMPANY).build());
        addDefaultRolesToProject(sampleProject);
        projects = new ArrayList<>();
        when(projectRepository.findAll()).thenReturn(projects);
    }

    private void addDefaultRolesToProject(Project project) {
        Set<NameEntity> roles = defaultRoles.stream()
                .map(r -> NameEntity.builder().name(r).type(PROJECT_ROLE).build())
                .collect(Collectors.toSet());
        project.setProjectRoles(roles);
    }

    private Project withExistingSkillsForCustomer(String customer, String...skills) {
        Project project = Project.builder()
                .client(NameEntity.builder().name(customer).type(COMPANY).build())
                .skills(Stream.of(skills).map(s -> Skill.builder().name(s).build()).collect(Collectors.toSet()))
                .build();
        addDefaultRolesToProject(project);
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
                .containsExactlyInAnyOrder("Java", "JBoss");
    }

    @Test
    public void withProjectWithoutCustomer_shouldReturnNoSkills() {
        sampleProject.setClient(null);

        Collection<Skill> recommendedSkills = skillRecommendationService.getRecommendedSkills(sampleProject);

        assertThat(recommendedSkills).isEmpty();
    }

    @Test
    public void withExistingProject_ThatHasNoCustomer_shouldIgnore() {
        Project existingProject = withExistingSkillsForCustomer("Rebel Alliance", "shoot", "fight");
        existingProject.setClient(null);
        Collection<Skill> recommendedSkills = skillRecommendationService.getRecommendedSkills(sampleProject);

        assertThat(recommendedSkills).isEmpty();
    }

    @Test
    public void withExistingProject_ThatIs10YearsOld_shouldIgnore() {
        Project existingProject = withExistingSkillsForCustomer("Starfleet", "fly", "crash");
        existingProject.setStartDate(LocalDate.of(2005, 10, 21));
        existingProject.setEndDate(LocalDate.of(2009, 10, 21));
        Collection<Skill> recommendedSkills = skillRecommendationService.getRecommendedSkills(sampleProject);

        assertThat(recommendedSkills).isEmpty();
    }

    @Test
    public void shouldNotSuggestSkills_thatAreAlreadyPresent() {
        String blowingUp = "blow stuff up";
        String kesselRun = "kessel run";

        String newSkill = "lose limbs";
        withExistingSkillsForCustomer("Starfleet", blowingUp, kesselRun, newSkill);
        Set<Skill> sampleSkills = sampleProject.getSkills();
        sampleSkills.add(Skill.builder().name(newSkill).build());
        sampleProject.setSkills(sampleSkills);
        Collection<Skill> recommendedSkills = skillRecommendationService.getRecommendedSkills(sampleProject);

        assertThat(recommendedSkills)
                .extracting(Skill::getName)
                .containsExactlyInAnyOrder(blowingUp, kesselRun);
    }

    @Test
    public void withExistingProject_SameNameDifferentClient_shouldConsider() {
        Project existingProject = withExistingSkillsForCustomer("Rebel Alliance", "fly", "crash");
        existingProject.setName("Generic sample project");
        sampleProject.setName("Generic sample project");
        Collection<Skill> recommendedSkills = skillRecommendationService.getRecommendedSkills(sampleProject);

        assertThat(recommendedSkills)
                .extracting(Skill::getName)
                .containsExactlyInAnyOrder("fly", "crash");
    }

    @Test
    public void withExistingProject_SameClientDifferentRoles_shouldIgnore() {
        NameEntity roleTester = NameEntity.builder().name("Tester").type(PROJECT_ROLE).build();
        defaultRoles.clear();
        defaultRoles.add("Developer");
        Project existingProject = withExistingSkillsForCustomer("Starfleet", "Java", "JBoss");
        existingProject.setProjectRoles(new HashSet<>(Arrays.asList(roleTester)));
        Collection<Skill> recommendedSkills = skillRecommendationService.getRecommendedSkills(sampleProject);

        assertThat(recommendedSkills).isEmpty();
    }
}