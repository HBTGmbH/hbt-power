package de.hbt.pwr.profile.service;


import de.hbt.pwr.profile.data.ProfileRepository;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.Project;
import org.junit.Before;
import org.junit.Test;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static de.hbt.pwr.profile.PwrCollectionUtils.hashSet;
import static java.util.Arrays.asList;
import static java.util.Collections.singletonList;
import static org.assertj.core.api.Java6Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class ProfileServiceTest {

    private ProfileRepository profileRepository;
    private ProfileService profileService;

    @Before
    public void setUp() throws Exception {
        profileRepository = mock(ProfileRepository.class);
        profileService = new ProfileService(profileRepository);
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

    @Test
    public void givenProfilesWithSkills_whenRenamingASkill_shouldRenameTheSkill() {
        Profile profile1 = profileWithSkills("Baking", "Soccer");
        Profile profile2 = profileWithSkills("Baking", "Dancing");
        when(profileRepository.findAll()).thenReturn(asList(profile1, profile2));


        List<Profile> profiles = profileService.renameAndMergeSkills("Baking", "Swimming");
        profiles.forEach(profile -> assertThat(profile.getSkills()).doesNotContain(Skill.builder().name("Baking").rating(1).build()));
    }

    @Test
    public void givenProfileWithASkill_whereTheSkillIsAlsoInAProject_shouldRenameSkillInProjectToo() {
        Profile profile = profileWithSkills("Baking", "Soccer");
        profile.setProjects(hashSet(Project.builder().skills(hashSet(Skill.builder().name("Baking").build())).build()));

        when(profileRepository.findAll()).thenReturn(singletonList(profile));

        List<Profile> profiles = profileService.renameAndMergeSkills("Baking", "Dancing");
        assertThat(profiles)
                .flatExtracting(Profile::getProjects)
                .flatExtracting(Project::getSkills)
                .contains(Skill.builder().name("Dancing").build());
    }

    @Test
    public void givenProfileWithSkills_whereARenameWouldCreateTwoSkillsWithTheSameName_shouldMergeBothSkills() {
        Profile profile = profileWithSkills("Football", "Soccer");

        when(profileRepository.findAll()).thenReturn(singletonList(profile));

        List<Profile> profiles = profileService.renameAndMergeSkills("Football", "Soccer");
        profiles.forEach(profile1 -> assertThat(profile1.getSkills()).containsExactlyInAnyOrder(Skill.builder().name("Soccer").rating(1).build()));
    }

    @Test
    public void givenProfileWithSkills_whereARenameWouldCreateTwoSkillsWithTheSameName_andTheSkillsHaveDifferentLevel_shouldKeepTheHigherLevelSkill() {
        Profile profile = new Profile();
        profile.setSkills(hashSet(Skill.builder().name("Football").rating(3).build(), Skill.builder().name("Soccer").rating(4).build()));
        when(profileRepository.findAll()).thenReturn(singletonList(profile));

        List<Profile> profiles = profileService.renameAndMergeSkills("Football", "Soccer");
        profiles.forEach(profile1 -> assertThat(profile1.getSkills()).containsExactlyInAnyOrder(Skill.builder().name("Soccer").rating(4).build()));
    }
}