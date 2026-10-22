package de.hbt.pwr.profile.service;


import de.hbt.pwr.profile.client.SkillProfileClient;
import de.hbt.pwr.profile.client.StatisticsClient;
import de.hbt.pwr.profile.data.ProfileRepository;
import de.hbt.pwr.profile.errors.WebApplicationException;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.Project;
import org.junit.Before;
import org.junit.Test;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static de.hbt.pwr.profile.PwrCollectionUtils.hashSet;
import static java.util.Arrays.asList;
import static java.util.Collections.singletonList;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Java6Assertions.assertThat;
import static org.mockito.Mockito.*;

public class ProfileServiceTest {

    private ProfileRepository profileRepository;
    private SkillProfileClient skillProfileClient;
    private StatisticsClient statisticsClient;
    private ProfileService profileService;

    @Before
    public void setUp() throws Exception {
        profileRepository = mock(ProfileRepository.class);
        skillProfileClient = mock(SkillProfileClient.class);
        statisticsClient = mock(StatisticsClient.class);
        profileService = new ProfileService(profileRepository, skillProfileClient, statisticsClient);
    }

    private static Skill skill(String name, int rating, String... versions) {
        return Skill.builder().name(name).rating(rating).versions(hashSet(versions)).build();
    }

    private Profile profileWithSkills(Skill... skills) {
        return Profile.builder()
                .skills(hashSet(skills))
                .projects(hashSet())
                .build();
    }

    private Profile profileWithSkills(String... names) {
        Set<Skill> skills = Stream.of(names)
                .map(s -> Skill.builder().name(s).rating(1).build())
                .collect(Collectors.toSet());
        return Profile.builder()
                .skills(skills)
                .projects(hashSet())
                .build();
    }

    private static Skill only(Set<Skill> skills, String name) {
        List<Skill> named = skills.stream().filter(skill -> name.equals(skill.getName())).collect(Collectors.toList());
        assertThat(named).hasSize(1);
        return named.get(0);
    }

    @Test
    public void givenProfilesWithSkills_whenMergingASkill_shouldRenameTheSkill() {
        Profile profile1 = profileWithSkills("Baking", "Soccer");
        Profile profile2 = profileWithSkills("Baking", "Dancing");
        when(profileRepository.findAll()).thenReturn(asList(profile1, profile2));

        List<Profile> profiles = profileService.mergeSkills("Baking", "Swimming", null);

        profiles.forEach(profile -> assertThat(profile.getSkills()).extracting(Skill::getName)
                .doesNotContain("Baking").contains("Swimming"));
    }

    @Test
    public void givenProfileWithASkill_whereTheSkillIsAlsoInAProject_shouldRenameSkillInProjectToo() {
        Profile profile = profileWithSkills("Baking", "Soccer");
        Skill baking = only(profile.getSkills(), "Baking");
        profile.setProjects(hashSet(Project.builder().skills(hashSet(baking)).build()));
        when(profileRepository.findAll()).thenReturn(singletonList(profile));

        List<Profile> profiles = profileService.mergeSkills("Baking", "Dancing", null);

        assertThat(profiles)
                .flatExtracting(Profile::getProjects)
                .flatExtracting(Project::getSkills)
                .extracting(Skill::getName)
                .containsExactly("Dancing");
    }

    @Test
    public void givenProfileWithBothSkills_shouldKeepTheTargetWithTheHigherRatingAndAllVersions() {
        Profile profile = profileWithSkills(skill("Java 8", 5, "8u202"), skill("Java", 3, "11"));
        when(profileRepository.findAll()).thenReturn(singletonList(profile));

        profileService.mergeSkills("Java 8", "Java", "8");

        assertThat(profile.getSkills()).hasSize(1);
        Skill java = only(profile.getSkills(), "Java");
        assertThat(java.getRating()).isEqualTo(5);
        assertThat(java.getVersions()).containsOnly("11", "8u202", "8");
    }

    @Test
    public void givenProfileWithBothSkills_whereTheTargetIsRatedHigher_shouldKeepItsRating() {
        Profile profile = profileWithSkills(skill("Football", 3), skill("Soccer", 4));
        when(profileRepository.findAll()).thenReturn(singletonList(profile));

        profileService.mergeSkills("Football", "Soccer", null);

        assertThat(only(profile.getSkills(), "Soccer").getRating()).isEqualTo(4);
        assertThat(profile.getSkills()).hasSize(1);
    }

    @Test
    public void givenVersion_whenRenaming_shouldAddTheVersion() {
        Profile profile = profileWithSkills(skill("Java 8", 2));
        when(profileRepository.findAll()).thenReturn(singletonList(profile));

        profileService.mergeSkills("Java 8", "Java", "8");

        assertThat(only(profile.getSkills(), "Java").getVersions()).containsOnly("8");
    }

    @Test
    public void givenProjectWithTheMergedSkill_shouldReferToTheKeptSkillOfTheProfile() {
        Skill k8s = skill("K8S", 4);
        Skill kubernetes = skill("Kubernetes", 2);
        Profile profile = profileWithSkills(k8s, kubernetes);
        Project project = Project.builder().skills(hashSet(k8s)).build();
        Project both = Project.builder().skills(hashSet(k8s, kubernetes)).build();
        profile.setProjects(hashSet(project, both));
        when(profileRepository.findAll()).thenReturn(singletonList(profile));

        profileService.mergeSkills("K8S", "Kubernetes", null);

        Skill kept = only(profile.getSkills(), "Kubernetes");
        assertThat(kept.getRating()).isEqualTo(4);
        assertThat(project.getSkills()).hasSize(1);
        assertThat(project.getSkills().iterator().next()).isSameAs(kept);
        assertThat(both.getSkills()).hasSize(1);
        assertThat(both.getSkills().iterator().next()).isSameAs(kept);
    }

    @Test
    public void givenSourceInAnotherCase_shouldMergeIt() {
        Profile profile = profileWithSkills(skill("k8s", 3));
        when(profileRepository.findAll()).thenReturn(singletonList(profile));

        profileService.mergeSkills("K8S", "Kubernetes", null);

        assertThat(profile.getSkills()).extracting(Skill::getName).containsExactly("Kubernetes");
    }

    @Test
    public void whenMergingTwice_shouldNotChangeAnythingTheSecondTime() {
        Profile profile = profileWithSkills(skill("Java 8", 2), skill("Kotlin", 3));
        when(profileRepository.findAll()).thenReturn(singletonList(profile));
        profileService.mergeSkills("Java 8", "Java", "8");
        only(profile.getSkills(), "Java").getVersions().remove("8");

        profileService.mergeSkills("Java 8", "Java", "8");

        assertThat(profile.getSkills()).extracting(Skill::getName).containsOnly("Java", "Kotlin");
        assertThat(only(profile.getSkills(), "Java").getVersions()).isEmpty();
    }

    @Test
    public void whenTheSkillServiceRejectsTheMerge_shouldNotChangeProfiles() {
        Profile profile = profileWithSkills(skill("OpenShift", 2));
        when(profileRepository.findAll()).thenReturn(singletonList(profile));
        doThrow(new WebApplicationException(HttpStatus.CONFLICT, "alias of another skill"))
                .when(skillProfileClient).mergeSkills("OpenShift", "Kubernetes");

        assertThatThrownBy(() -> profileService.mergeSkills("OpenShift", "Kubernetes", null))
                .isInstanceOf(WebApplicationException.class);

        assertThat(profile.getSkills()).extracting(Skill::getName).containsExactly("OpenShift");
        verify(profileRepository, never()).findAll();
        verify(statisticsClient, never()).refreshConsultants();
    }

    /**
     * The statistics read the profiles from this service, so they may only refresh once the merge is committed (#205)
     */
    @Test
    public void whenMergingInATransaction_shouldRefreshTheStatisticsOnlyAfterTheCommit() {
        when(profileRepository.findAll()).thenReturn(singletonList(profileWithSkills("Java 8")));
        TransactionSynchronizationManager.initSynchronization();
        try {
            profileService.mergeSkills("Java 8", "Java", null);
            verify(statisticsClient, never()).refreshConsultants();

            TransactionSynchronizationManager.getSynchronizations().forEach(TransactionSynchronization::afterCommit);
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
        }
        verify(statisticsClient).refreshConsultants();
    }

    @Test
    public void whenMergingInAnUnsuccessfulTransaction_shouldNotRefreshTheStatistics() {
        when(profileRepository.findAll()).thenReturn(singletonList(profileWithSkills("Java 8")));
        TransactionSynchronizationManager.initSynchronization();
        try {
            profileService.mergeSkills("Java 8", "Java", null);

            TransactionSynchronizationManager.getSynchronizations()
                    .forEach(sync -> sync.afterCompletion(TransactionSynchronization.STATUS_ROLLED_BACK));
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
        }
        verify(statisticsClient, never()).refreshConsultants();
    }

    @Test
    public void whenRenamingASkillInTheProfiles_shouldRefreshTheStatistics() {
        when(profileRepository.findAll()).thenReturn(singletonList(profileWithSkills("Java 8")));

        profileService.mergeSkillsInProfiles("Java 8", "Java", null);

        verify(statisticsClient).refreshConsultants();
    }
}
