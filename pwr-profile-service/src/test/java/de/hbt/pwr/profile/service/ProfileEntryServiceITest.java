package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.data.NameEntityRepository;
import de.hbt.pwr.profile.data.ProfileRepository;
import de.hbt.pwr.profile.model.profile.LanguageSkillLevel;
import de.hbt.pwr.profile.model.profile.NameEntityType;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.LanguageSkill;
import de.hbt.pwr.profile.model.profile.entries.NameEntity;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest
@ActiveProfiles("test")
public class ProfileEntryServiceITest {

    @Autowired
    private ProfileEntryService profileEntryService;
    @Autowired
    private ProfileRepository profileRepository;
    @Autowired
    private NameEntityRepository nameEntityRepository;

    @Before
    public void setUp() throws Exception {
    }


    @Test
    public void saveLanguageToProfile() {
        Profile p = new Profile();
        p = profileRepository.save(p);
        LanguageSkill languageSkill = LanguageSkill.builder().level(LanguageSkillLevel.ADVANCED).language(NameEntity.builder().type(NameEntityType.LANGUAGE).name("Deutsch").build()).build();
        profileEntryService.updateProfileEntry(languageSkill, p,NameEntityType.LANGUAGE);

        assertThat(p.getLanguages())
                .extracting(LanguageSkill::getLevel, languageSkill1 -> languageSkill1.getNameEntity().getName())
                .containsExactly(tuple(LanguageSkillLevel.ADVANCED,"Deutsch"));

    }

    @Test
    public void deleteLanguageFromProfile() {
        Profile p = new Profile();
        p = profileRepository.save(p);
        LanguageSkill languageSkill = LanguageSkill.builder().id(229L).level(LanguageSkillLevel.ADVANCED).language(NameEntity.builder().type(NameEntityType.LANGUAGE).name("Deutsch").build()).build();
        profileEntryService.updateProfileEntry(languageSkill, p,NameEntityType.LANGUAGE);

        assertThat(p.getLanguages())
                .extracting(LanguageSkill::getLevel, languageSkill1 -> languageSkill1.getNameEntity().getName())
                .containsExactly(tuple(LanguageSkillLevel.ADVANCED,"Deutsch"));

        profileEntryService.deleteEntryWithId(languageSkill.getId(),p,NameEntityType.LANGUAGE);

        assertThat(p.getLanguages().size()).isEqualTo(0);

    }

    @Test
    public void deleteLanguageFromProfileWithoutNameEntity() {
        Profile p = new Profile();
        p = profileRepository.save(p);
        NameEntity nameEntity = NameEntity.builder().id(967L).type(NameEntityType.LANGUAGE).name("Deutsch").build();
        LanguageSkill languageSkill = LanguageSkill.builder().level(LanguageSkillLevel.ADVANCED).language(nameEntity).build();
        profileEntryService.updateProfileEntry(languageSkill, p,NameEntityType.LANGUAGE);

        assertThat(p.getLanguages())
                .extracting(LanguageSkill::getLevel, languageSkill1 -> languageSkill1.getNameEntity().getName())
                .containsExactly(tuple(LanguageSkillLevel.ADVANCED,"Deutsch"));

        assertThat(nameEntityRepository.findByNameAndType(nameEntity.getName(),nameEntity.getType())).isNotNull();
        profileEntryService.deleteEntryWithId(languageSkill.getId(),p,NameEntityType.LANGUAGE);

        assertThat(p.getLanguages().size()).isEqualTo(0);

        assertThat(nameEntityRepository.findByNameAndType(nameEntity.getName(),nameEntity.getType())).isNotNull();
    }

}
