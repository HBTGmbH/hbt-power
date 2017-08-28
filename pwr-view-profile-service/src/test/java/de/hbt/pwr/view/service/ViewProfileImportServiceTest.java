package de.hbt.pwr.view.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import de.hbt.pwr.view.client.profile.ProfileServiceClient;
import de.hbt.pwr.view.client.profile.model.Profile;
import de.hbt.pwr.view.client.profile.model.ProfileSkill;
import de.hbt.pwr.view.client.skill.SkillServiceClient;
import de.hbt.pwr.view.client.skill.model.SkillServiceCategory;
import de.hbt.pwr.view.client.skill.model.SkillServiceSkill;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.Skill;
import de.hbt.pwr.view.repo.ViewProfileRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;


import java.io.InputStream;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import static junit.framework.TestCase.fail;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.when;

@RunWith(SpringJUnit4ClassRunner.class)
public class ViewProfileImportServiceTest {

    @MockBean
    ProfileServiceClient profileServiceClient;

    @MockBean
    SkillServiceClient skillServiceClient;

    @MockBean
    ViewProfileRepository viewProfileRepository;

    private Category getCategoryOrFail(List<Category> categoryList, String nameToFind) {
        Optional<Category> optional = categoryList.stream().filter(category -> category.getName().equals(nameToFind)).findAny();
        if(optional.isPresent()) {
            return optional.get();
        } else {
            fail("Expected " + categoryList.toString() + " to contain a category with the name '" + nameToFind + "'");
            // Somhow necessary
            throw new RuntimeException();
        }
    }

    @Test
    public void createViewProfile() throws Exception {
        InputStream inputStream = this.getClass().getClassLoader().getResourceAsStream("test_profile_1.json");
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        Profile profile = objectMapper.readValue(inputStream, Profile.class);
        // Clear all skills
        profile.getSkills().clear();
        profile.getProjects().forEach(profileProject -> profileProject.getSkills().clear());
        // Replace with own skills (simple tree)
        SkillServiceCategory c1 = new SkillServiceCategory("C1");
        SkillServiceCategory c2 = new SkillServiceCategory("C2");

        SkillServiceCategory c1_1 = new SkillServiceCategory("c1_1");
        c1_1.setCategory(c1);
        SkillServiceCategory c1_2 = new SkillServiceCategory("c1_2");
        c1_2.setCategory(c1);
        SkillServiceCategory c2_1 = new SkillServiceCategory("c2_1");
        c2_1.setCategory(c2);

        SkillServiceSkill s1 = new SkillServiceSkill("S1");
        SkillServiceSkill s2 = new SkillServiceSkill("S2");
        SkillServiceSkill s3 = new SkillServiceSkill("S3");
        SkillServiceSkill s4 = new SkillServiceSkill("S4");
        SkillServiceSkill s5 = new SkillServiceSkill("S5");
        SkillServiceSkill s6 = new SkillServiceSkill("S6");
        s1.setCategory(c1_1);
        s2.setCategory(c1_1);
        s3.setCategory(c1_2);
        s4.setCategory(c1_2);
        s5.setCategory(c2_1);
        s6.setCategory(c2_1);

        profile.getSkills().add(new ProfileSkill("S1"));
        profile.getSkills().add(new ProfileSkill("S2"));
        profile.getSkills().add(new ProfileSkill("S3"));
        profile.getSkills().add(new ProfileSkill("S4"));
        profile.getSkills().add(new ProfileSkill("S5"));
        profile.getSkills().add(new ProfileSkill("S6"));

        given(skillServiceClient.getSkillByName(s1.getQualifier())).willReturn(s1);
        given(skillServiceClient.getSkillByName(s2.getQualifier())).willReturn(s2);
        given(skillServiceClient.getSkillByName(s3.getQualifier())).willReturn(s3);
        given(skillServiceClient.getSkillByName(s4.getQualifier())).willReturn(s4);
        given(skillServiceClient.getSkillByName(s5.getQualifier())).willReturn(s5);
        given(skillServiceClient.getSkillByName(s6.getQualifier())).willReturn(s6);

        given(profileServiceClient.getSingleProfile("nt")).willReturn(profile);

        when(viewProfileRepository.save(any(ViewProfile.class))).thenAnswer(new Answer<ViewProfile>() {
            @Override
            public ViewProfile answer(InvocationOnMock invocationOnMock) throws Throwable {
                Object[] args = invocationOnMock.getArguments();
                return (ViewProfile) args[0];
            }
        });

        ViewProfileImportService viewProfileImportService = new ViewProfileImportService(profileServiceClient,
                skillServiceClient, null, viewProfileRepository);
        ViewProfile viewProfile = viewProfileImportService.createViewProfile("nt", "Test", Locale.GERMAN);

        // TODO: Assert more than the skill tree
        assertThat(viewProfile.getRootCategory().getChildren()).containsExactlyInAnyOrder(new Category("C1"), new Category("C2"));
        Category category1 = getCategoryOrFail(viewProfile.getRootCategory().getChildren(), "C1");
        Category category1_1 = getCategoryOrFail(category1.getChildren(), c1_1.getQualifier());
        Category category1_2 = getCategoryOrFail(category1.getChildren(), c1_2.getQualifier());
        Category category2 = getCategoryOrFail(viewProfile.getRootCategory().getChildren(), "C2");
        Category category2_1 = getCategoryOrFail(category2.getChildren(), c2_1.getQualifier());

        assertThat(category1_1.getSkills()).containsExactlyInAnyOrder(new Skill("S1"), new Skill("S2"));
        assertThat(category1_2.getSkills()).containsExactlyInAnyOrder(new Skill("S3"), new Skill("S4"));
        assertThat(category2_1.getSkills()).containsExactlyInAnyOrder(new Skill("S5"), new Skill("S6"));

    }

}