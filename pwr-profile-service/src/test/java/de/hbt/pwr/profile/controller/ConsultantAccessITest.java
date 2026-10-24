package de.hbt.pwr.profile.controller;

import de.hbt.pwr.profile.AbstractIntegrationTest;
import de.hbt.pwr.profile.data.ConsultantRepository;
import de.hbt.pwr.profile.data.ProfilePictureRepository;
import de.hbt.pwr.profile.errors.WebApplicationException;
import de.hbt.pwr.profile.model.Consultant;
import de.hbt.pwr.profile.model.ProfilePicture;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.profile.LanguageSkillLevel;
import de.hbt.pwr.profile.model.profile.NameEntityType;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.LanguageSkill;
import de.hbt.pwr.profile.model.profile.entries.NameEntity;
import de.hbt.pwr.profile.model.profile.entries.Project;
import de.hbt.pwr.profile.service.ConsultantService;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;

import static de.hbt.pwr.profile.security.ConsultantAccess.USER_ADMIN_HEADER;
import static de.hbt.pwr.profile.security.ConsultantAccess.USER_INITIALS_HEADER;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowableOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * A user reads and changes only the own profile, an admin every one (#255); an id must belong to the profile in the
 * path, also for an admin
 */
@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ConsultantAccessITest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ConsultantService consultantService;

    @Autowired
    private ProfileEntryEndpoint endpoint;

    @Autowired
    private ProfilePictureRepository profilePictureRepository;

    @Autowired
    private ConsultantRepository consultantRepository;

    private ProfilePicture otherPicture;
    private ProfilePicture ownPicture;

    @Before
    public void createConsultants() {
        ownPicture = profilePictureRepository.save(picture());
        otherPicture = profilePictureRepository.save(picture());
        consultantService.createNewConsultant("own", "Olga", "Own", "", ownPicture.getId(), LocalDate.of(1990, 1, 1));
        consultantService.createNewConsultant("oth", "Otto", "Other", "", otherPicture.getId(), LocalDate.of(1990, 1, 1));
    }

    @After
    public void deleteConsultants() {
        when(viewProfileClient.getAllViewProfiles(any())).thenAnswer(invocation -> new ArrayList<String>());
        for (String initials : new String[]{"own", "oth"}) {
            Consultant consultant = consultantRepository.findByInitials(initials).orElseThrow();
            consultant.setActive(false);
            consultantService.updatePersonalData(initials, consultant);
            consultantService.deleteConsultant(initials);
        }
    }

    private static ProfilePicture picture() {
        ProfilePicture picture = new ProfilePicture();
        picture.setContentType(MediaType.IMAGE_PNG_VALUE);
        picture.setImage(new byte[]{1, 2, 3});
        return picture;
    }

    private static MockHttpServletRequestBuilder asUser(MockHttpServletRequestBuilder request, String initials) {
        return request.header(USER_ADMIN_HEADER, "false").header(USER_INITIALS_HEADER, initials);
    }

    private static MockHttpServletRequestBuilder asAdmin(MockHttpServletRequestBuilder request) {
        return request.header(USER_ADMIN_HEADER, "true").header(USER_INITIALS_HEADER, "adm");
    }

    @Test
    public void userReadsTheOwnProfile() throws Exception {
        mockMvc.perform(asUser(get("/profile/own/fullProfile"), "OWN")).andExpect(status().isOk());
        mockMvc.perform(asUser(get("/consultants/own"), "own")).andExpect(status().isOk());
        mockMvc.perform(asUser(get("/profile/own/check"), "own")).andExpect(status().isOk());
        mockMvc.perform(asUser(get("/profile-pictures/" + ownPicture.getId()), "own")).andExpect(status().isOk());
    }

    @Test
    public void userNeitherReadsNorChangesAnotherProfile() throws Exception {
        mockMvc.perform(asUser(get("/profile/oth/fullProfile"), "own")).andExpect(status().isForbidden());
        mockMvc.perform(asUser(get("/profiles/oth"), "own")).andExpect(status().isForbidden());
        mockMvc.perform(asUser(get("/consultants/oth"), "own")).andExpect(status().isForbidden());
        mockMvc.perform(asUser(get("/profile/oth/check"), "own")).andExpect(status().isForbidden());
        mockMvc.perform(asUser(get("/profile-pictures/" + otherPicture.getId()), "own"))
                .andExpect(status().isForbidden());
        mockMvc.perform(asUser(get("/profile-pictures/by-initials/oth"), "own")).andExpect(status().isForbidden());
        mockMvc.perform(asUser(put("/profile/oth/baseProfile"), "own")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"description\": \"geändert\"}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(asUser(delete("/profile/oth/skill/1"), "own")).andExpect(status().isForbidden());

        assertThat(consultantService.getProfileByInitials("oth").getDescription()).isNotEqualTo("geändert");
    }

    @Test
    public void userWithoutInitialsGetsNoProfile() throws Exception {
        mockMvc.perform(get("/profile/own/fullProfile").header(USER_ADMIN_HEADER, "false"))
                .andExpect(status().isForbidden());
    }

    @Test
    public void namesOfTheColleaguesStayOpenToEveryUser() throws Exception {
        mockMvc.perform(asUser(get("/consultants/names"), "own")).andExpect(status().isOk());
    }

    @Test
    public void adminReadsEveryProfileAndPicture() throws Exception {
        mockMvc.perform(asAdmin(get("/profile/oth/fullProfile"))).andExpect(status().isOk());
        mockMvc.perform(asAdmin(get("/profile-pictures/" + otherPicture.getId()))).andExpect(status().isOk());
    }

    @Test
    public void callWithoutTheEdgeReadsEverything() throws Exception {
        mockMvc.perform(get("/profile/oth/fullProfile")).andExpect(status().isOk());
        mockMvc.perform(get("/profile-pictures/by-initials/oth")).andExpect(status().isOk());
    }

    @Test
    public void anEntryOfAnotherProfileIsNotSavedIntoThisOne() {
        LanguageSkill other = endpoint.updateLanguageSkill("oth",
                new LanguageSkill(new NameEntity("Deutsch", NameEntityType.LANGUAGE), LanguageSkillLevel.BUSINESS_FLUENT));
        LanguageSkill hijack = new LanguageSkill(other.getId(), other.getNameEntity(), LanguageSkillLevel.BASIC);

        assertNotFound(() -> endpoint.updateLanguageSkill("own", hijack));
        assertThat(consultantService.getProfileByInitials("oth").getLanguages())
                .extracting(LanguageSkill::getId).contains(other.getId());
        assertThat(consultantService.getProfileByInitials("own").getLanguages()).isEmpty();
    }

    @Test
    public void aSkillOfAnotherProfileIsNotSavedIntoThisOne() {
        Skill other = endpoint.updateSkill("oth",
                Skill.builder().name("Java").rating(3).versions(new HashSet<>()).build());
        Skill hijack = Skill.builder().id(other.getId()).name("Kotlin").rating(1).versions(new HashSet<>()).build();

        assertNotFound(() -> endpoint.updateSkill("own", hijack));
        Project project = new Project();
        project.getSkills().add(hijack);
        assertNotFound(() -> endpoint.updateProject("own", project));

        assertThat(consultantService.getProfileByInitials("oth").getSkills())
                .extracting(Skill::getName).containsExactly("Java");
        assertThat(consultantService.getProfileByInitials("own").getSkills()).isEmpty();
    }

    @Test
    public void aProjectOfAnotherProfileIsNotSavedIntoThisOne() {
        Project other = endpoint.updateProject("oth", new Project());
        Project hijack = new Project();
        hijack.setId(other.getId());

        assertNotFound(() -> endpoint.updateProject("own", hijack));
        Profile own = consultantService.getProfileByInitials("own");
        assertThat(own.getProjects()).isEmpty();
        assertThat(consultantService.getProfileByInitials("oth").getProjects())
                .extracting(Project::getId).containsExactly(other.getId());
    }

    private static void assertNotFound(Runnable call) {
        WebApplicationException e = catchThrowableOfType(call::run, WebApplicationException.class);
        assertThat(e).isNotNull();
        assertThat(e.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    /**
     * The service lets only admins reach /admin itself, however the path is written (#260)
     */
    @Test
    public void onlyAnAdminReachesTheAdminEndpoints() throws Exception {
        mockMvc.perform(asUser(get("/admin/consultants"), "own")).andExpect(status().isForbidden());
        mockMvc.perform(asUser(get("/admin;x/consultants"), "own")).andExpect(status().isForbidden());
        mockMvc.perform(asUser(get(URI.create("/%61dmin/consultants")), "own")).andExpect(status().isForbidden());
        mockMvc.perform(asUser(get("/admin/consultants/"), "own")).andExpect(status().isForbidden());
        mockMvc.perform(asAdmin(get("/admin/consultants"))).andExpect(status().isOk());
        mockMvc.perform(get("/admin/consultants")).andExpect(status().isOk());
    }
}
