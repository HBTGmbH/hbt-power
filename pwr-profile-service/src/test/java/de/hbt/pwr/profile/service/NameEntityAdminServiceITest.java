package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.model.NameEntityLocalizationDTO;
import de.hbt.pwr.profile.AbstractIntegrationTest;
import de.hbt.pwr.profile.data.AdminNotificationRepository;
import de.hbt.pwr.profile.data.NameEntityRepository;
import de.hbt.pwr.profile.errors.WebApplicationException;
import de.hbt.pwr.profile.model.FormerNameDTO;
import de.hbt.pwr.profile.model.notification.ProfileEntryNotification;
import de.hbt.pwr.profile.model.profile.LanguageSkillLevel;
import de.hbt.pwr.profile.model.profile.NameEntityType;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.*;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import javax.persistence.EntityManager;
import javax.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.Map;

import static de.hbt.pwr.profile.model.profile.NameEntityType.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowableOfType;
import static org.assertj.core.api.Assertions.tuple;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Renaming, merging and deleting profile elements in all profiles (#227), with former names (#230)
 */
@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
public class NameEntityAdminServiceITest extends AbstractIntegrationTest {

    @Autowired
    private NameEntityAdminService nameEntityAdminService;
    @Autowired
    private ProfileEntryService profileEntryService;
    @Autowired
    private ConsultantService consultantService;
    @Autowired
    private NameEntityRepository nameEntityRepository;
    @Autowired
    private AdminNotificationRepository adminNotificationRepository;
    @Autowired
    private EntityManager entityManager;
    @Autowired
    private MockMvc mockMvc;

    private Profile anna;
    private Profile bert;

    @Before
    public void setUp() {
        anna = consultantService.createNewConsultant("ann", "Anna", "Alt", null, null, LocalDate.of(1990, 1, 1)).getProfile();
        bert = consultantService.createNewConsultant("ber", "Bert", "Bau", null, null, LocalDate.of(1990, 1, 1)).getProfile();
    }

    private static NameEntity named(String name, NameEntityType type) {
        return NameEntity.builder().name(name).type(type).build();
    }

    private SectorEntry sector(Profile profile, String name) {
        return profileEntryService.updateProfileEntry(new SectorEntry(named(name, SECTOR)), profile, SECTOR);
    }

    private Project project(Profile profile, String client, String... roles) {
        Set<NameEntity> projectRoles = new java.util.HashSet<>();
        for (String role : roles) {
            projectRoles.add(named(role, PROJECT_ROLE));
        }
        Project project = Project.builder().name("Projekt").client(named(client, COMPANY)).projectRoles(projectRoles)
                .skills(new java.util.HashSet<>()).build();
        return profileEntryService.updateProject(project, profile);
    }

    private NameEntity element(String name, NameEntityType type) {
        return nameEntityRepository.findByNameAndType(name, type);
    }

    private Profile reloaded(Profile profile) {
        entityManager.flush();
        entityManager.clear();
        return entityManager.find(Profile.class, profile.getId());
    }

    @Test
    public void rename_renamesTheElementInAllProfiles_andKeepsTheOldNameAsFormerName() {
        sector(anna, "Banken");
        sector(bert, "Banken");
        NameEntity banks = element("Banken", SECTOR);

        nameEntityAdminService.rename(banks.getId(), " Bankwesen ");

        assertThat(reloaded(anna).getSectors()).extracting(entry -> entry.getNameEntity().getName()).containsExactly("Bankwesen");
        assertThat(reloaded(bert).getSectors()).extracting(entry -> entry.getNameEntity().getName()).containsExactly("Bankwesen");
        assertThat(nameEntityAdminService.findFormerNames())
                .extracting(FormerNameDTO::getType, FormerNameDTO::getName, FormerNameDTO::getCurrentName)
                .containsExactly(tuple(SECTOR, "Banken", "Bankwesen"));
        verify(statisticsClient).refreshConsultantsAfterCommit();
    }

    @Test
    public void aNewEntryWithAFormerName_isAnEntryOfTheRenamedElement() {
        sector(anna, "Banken");
        NameEntity banks = element("Banken", SECTOR);
        nameEntityAdminService.rename(banks.getId(), "Bankwesen");

        SectorEntry entry = sector(bert, "banken");

        assertThat(entry.getNameEntity().getId()).isEqualTo(banks.getId());
        assertThat(nameEntityRepository.findAllByType(SECTOR)).extracting(NameEntity::getName).containsExactly("Bankwesen");
    }

    @Test
    public void rename_toTheNameOfAnotherElementOfTheType_isAConflict() {
        sector(anna, "Banken");
        sector(anna, "Versicherungen");
        NameEntity banks = element("Banken", SECTOR);

        WebApplicationException e = catchThrowableOfType(
                () -> nameEntityAdminService.rename(banks.getId(), " versicherungen"), WebApplicationException.class);

        assertThat(e.getStatus()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(element("Banken", SECTOR)).isNotNull();
    }

    @Test
    public void rename_toTheNameOfAnElementOfAnotherType_isNoConflict() {
        sector(anna, "Banken");
        nameEntityRepository.save(named("Bankwesen", SPECIAL_FIELD));

        nameEntityAdminService.rename(element("Banken", SECTOR).getId(), "Bankwesen");

        assertThat(element("Bankwesen", SECTOR)).isNotNull();
    }

    @Test
    public void rename_inAnotherCase_keepsNoFormerName() {
        sector(anna, "Hbt");

        nameEntityAdminService.rename(element("Hbt", SECTOR).getId(), "HBT");

        assertThat(reloaded(anna).getSectors()).extracting(entry -> entry.getNameEntity().getName()).containsExactly("HBT");
        assertThat(nameEntityAdminService.findFormerNames()).isEmpty();
    }

    @Test
    public void rename_withABlankName_isRejected() {
        sector(anna, "Banken");

        WebApplicationException e = catchThrowableOfType(
                () -> nameEntityAdminService.rename(element("Banken", SECTOR).getId(), "  "), WebApplicationException.class);

        assertThat(e.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void rename_backToAFormerName_makesItACurrentNameAgain() {
        sector(anna, "Banken");
        NameEntity banks = element("Banken", SECTOR);
        nameEntityAdminService.rename(banks.getId(), "Bankwesen");

        nameEntityAdminService.rename(banks.getId(), "Banken");

        assertThat(nameEntityAdminService.findFormerNames())
                .extracting(FormerNameDTO::getName, FormerNameDTO::getCurrentName)
                .containsExactly(tuple("Bankwesen", "Banken"));
    }

    @Test
    public void merge_pointsEntriesBrokerClientRolesAndNotificationsToTheTarget_andDeletesTheSource() {
        SectorEntry annasBank = sector(anna, "Bank");
        sector(bert, "Banken");
        project(anna, "Hbt", "Dev", "Developer");
        project(bert, "HBT GmbH", "Developer");
        NameEntity bank = element("Bank", SECTOR);
        NameEntity banks = element("Banken", SECTOR);
        adminNotificationRepository.save(new ProfileEntryNotification(anna, annasBank.getId(), bank));

        nameEntityAdminService.merge(bank.getId(), banks.getId());
        nameEntityAdminService.merge(element("Hbt", COMPANY).getId(), element("HBT GmbH", COMPANY).getId());
        nameEntityAdminService.merge(element("Dev", PROJECT_ROLE).getId(), element("Developer", PROJECT_ROLE).getId());

        Profile annaNow = reloaded(anna);
        assertThat(annaNow.getSectors()).extracting(entry -> entry.getNameEntity().getName()).containsExactly("Banken");
        assertThat(annaNow.getProjects()).extracting(project -> project.getClient().getName()).containsExactly("HBT GmbH");
        assertThat(annaNow.getProjects()).flatExtracting(Project::getProjectRoles).extracting(NameEntity::getName)
                .containsExactly("Developer");
        assertThat(nameEntityRepository.findById(bank.getId())).isEmpty();
        assertThat(adminNotificationRepository.findAll())
                .extracting(notification -> ((ProfileEntryNotification) notification).getNameEntity().getName())
                .containsExactly("Banken");
        assertThat(nameEntityAdminService.findFormerNames())
                .extracting(FormerNameDTO::getName, FormerNameDTO::getCurrentName)
                .containsExactlyInAnyOrder(tuple("Bank", "Banken"), tuple("Hbt", "HBT GmbH"), tuple("Dev", "Developer"));
    }

    @Test
    public void merge_keepsOneEntryWhereAProfileHasBoth_butEveryEntryWithAPeriod() {
        sector(anna, "Bank");
        sector(anna, "Banken");
        profileEntryService.updateProfileEntry(new LanguageSkill(named("Englisch", LANGUAGE), LanguageSkillLevel.NATIVE), anna, LANGUAGE);
        profileEntryService.updateProfileEntry(new LanguageSkill(named("English", LANGUAGE), LanguageSkillLevel.BASIC), anna, LANGUAGE);
        profileEntryService.updateProfileEntry(new QualificationEntry(named("AWS SA", QUALIFICATION), LocalDate.of(2024, 5, 1)), anna, QUALIFICATION);
        profileEntryService.updateProfileEntry(new QualificationEntry(named("AWS Solutions Architect", QUALIFICATION), LocalDate.of(2021, 3, 1)), anna, QUALIFICATION);
        profileEntryService.updateProfileEntry(new CareerEntry(named("HBT", CAREER), LocalDate.of(2015, 1, 1), LocalDate.of(2018, 12, 31)), anna, CAREER);
        profileEntryService.updateProfileEntry(new CareerEntry(named("HBT GmbH", CAREER), LocalDate.of(2021, 1, 1), null), anna, CAREER);

        nameEntityAdminService.merge(element("Bank", SECTOR).getId(), element("Banken", SECTOR).getId());
        nameEntityAdminService.merge(element("English", LANGUAGE).getId(), element("Englisch", LANGUAGE).getId());
        nameEntityAdminService.merge(element("AWS SA", QUALIFICATION).getId(), element("AWS Solutions Architect", QUALIFICATION).getId());
        nameEntityAdminService.merge(element("HBT", CAREER).getId(), element("HBT GmbH", CAREER).getId());

        Profile annaNow = reloaded(anna);
        assertThat(annaNow.getSectors()).extracting(entry -> entry.getNameEntity().getName()).containsExactly("Banken");
        assertThat(annaNow.getLanguages()).extracting(entry -> entry.getNameEntity().getName(), LanguageSkill::getLevel)
                .containsExactly(tuple("Englisch", LanguageSkillLevel.NATIVE));
        assertThat(annaNow.getQualification()).extracting(entry -> entry.getNameEntity().getName(), QualificationEntry::getDate)
                .containsExactly(tuple("AWS Solutions Architect", LocalDate.of(2024, 5, 1)));
        assertThat(annaNow.getCareerEntries()).extracting(entry -> entry.getNameEntity().getName(), CareerEntry::getStartDate)
                .containsExactlyInAnyOrder(tuple("HBT GmbH", LocalDate.of(2015, 1, 1)), tuple("HBT GmbH", LocalDate.of(2021, 1, 1)));
    }

    @Test
    public void merge_ofElementsOfDifferentTypesOrIntoItself_isRejected() {
        sector(anna, "Banken");
        NameEntity banks = element("Banken", SECTOR);
        NameEntity keySkill = nameEntityRepository.save(named("Banken", SPECIAL_FIELD));

        assertThat(catchThrowableOfType(() -> nameEntityAdminService.merge(banks.getId(), keySkill.getId()),
                WebApplicationException.class).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(catchThrowableOfType(() -> nameEntityAdminService.merge(banks.getId(), banks.getId()),
                WebApplicationException.class).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void delete_removesTheElementFromAllProfiles_andItsNotifications() {
        SectorEntry annasBank = sector(anna, "Banken");
        sector(anna, "Versicherungen");
        project(bert, "Kunde AG", "Entwickler", "Architekt");
        project(bert, "Kunde AG");
        NameEntity banks = element("Banken", SECTOR);
        adminNotificationRepository.save(new ProfileEntryNotification(anna, annasBank.getId(), banks));

        nameEntityAdminService.delete(banks.getId());
        nameEntityAdminService.delete(element("Kunde AG", COMPANY).getId());
        nameEntityAdminService.delete(element("Architekt", PROJECT_ROLE).getId());

        assertThat(reloaded(anna).getSectors()).extracting(entry -> entry.getNameEntity().getName()).containsExactly("Versicherungen");
        Profile bertNow = reloaded(bert);
        assertThat(bertNow.getProjects()).hasSize(2).allSatisfy(project -> assertThat(project.getClient()).isNull());
        assertThat(bertNow.getProjects()).flatExtracting(Project::getProjectRoles).extracting(NameEntity::getName)
                .containsExactly("Entwickler");
        assertThat(element("Banken", SECTOR)).isNull();
        assertThat(adminNotificationRepository.findAll()).isEmpty();
    }

    @Test
    public void findUsers_namesTheConsultantsWhoseProfileUsesTheElement() {
        sector(anna, "Banken");
        project(bert, "Banken");
        sector(bert, "Versicherungen");

        assertThat(nameEntityAdminService.findUsers(element("Banken", SECTOR).getId())).containsExactly("ann");
        assertThat(nameEntityAdminService.findUsers(element("Banken", COMPANY).getId())).containsExactly("ber");
        assertThat(nameEntityAdminService.findUsers(element("Versicherungen", SECTOR).getId())).containsExactly("ber");
    }

    @Test
    public void deleteUnused_deletesOnlyTheElementsOfTheTypeThatNoProfileUses() {
        sector(anna, "Banken");
        SectorEntry insurances = sector(anna, "Versicherungen");
        nameEntityRepository.save(named("Logistik", SECTOR));
        nameEntityRepository.save(named("Logistik", COMPANY));
        project(bert, "Kunde AG", "Entwickler");
        profileEntryService.deleteEntryWithId(insurances.getId(), anna, SECTOR);
        entityManager.flush();

        assertThat(nameEntityAdminService.findUnused(SECTOR)).extracting(NameEntity::getName)
                .containsExactly("Logistik", "Versicherungen");

        assertThat(nameEntityAdminService.deleteUnused(SECTOR)).extracting(NameEntity::getName)
                .containsExactly("Logistik", "Versicherungen");
        assertThat(nameEntityRepository.findAllByType(SECTOR)).extracting(NameEntity::getName).containsExactly("Banken");
        assertThat(nameEntityAdminService.findUnused(COMPANY)).extracting(NameEntity::getName).containsExactly("Logistik");
        assertThat(nameEntityAdminService.findUnused(PROJECT_ROLE)).isEmpty();
    }

    /**
     * Old data has rows in profile_entry without a row in the table of an entry type, which Hibernate can't load as
     * the abstract ProfileEntry. They point to the element still and go with it, or to the target of a merge.
     */
    @Test
    public void rowsOfProfileEntryWithoutAType_areDeletedWithTheElement_orPointToTheTargetOfAMerge() {
        NameEntity logistics = nameEntityRepository.save(named("Logistik", COMPANY));
        NameEntity banks = nameEntityRepository.save(named("Banken", SECTOR));
        sector(anna, "Versicherungen");
        NameEntity insurances = element("Versicherungen", SECTOR);
        NameEntity trade = nameEntityRepository.save(named("Handel", SECTOR));
        Long logisticsRow = profileEntryRowWithoutType(logistics);
        Long banksRow = profileEntryRowWithoutType(banks);
        Long tradeRow = profileEntryRowWithoutType(trade);
        adminNotificationRepository.save(new ProfileEntryNotification(anna, banksRow, banks));

        assertThat(nameEntityAdminService.deleteUnused(COMPANY)).extracting(NameEntity::getName).containsExactly("Logistik");
        nameEntityAdminService.delete(banks.getId());
        nameEntityAdminService.merge(trade.getId(), insurances.getId());
        entityManager.flush();
        entityManager.clear();

        assertThat(element("Logistik", COMPANY)).isNull();
        assertThat(element("Banken", SECTOR)).isNull();
        assertThat(element("Handel", SECTOR)).isNull();
        assertThat(nameEntityOfRow(logisticsRow)).isNull();
        assertThat(nameEntityOfRow(banksRow)).isNull();
        assertThat(nameEntityOfRow(tradeRow)).isEqualTo(insurances.getId());
        assertThat(adminNotificationRepository.findAll()).isEmpty();
        assertThat(reloaded(anna).getSectors()).extracting(entry -> entry.getNameEntity().getName()).containsExactly("Versicherungen");
    }

    private Long profileEntryRowWithoutType(NameEntity nameEntity) {
        entityManager.flush();
        entityManager.createNativeQuery("insert into profile_entry (name_entity_id) values (:n)")
                .setParameter("n", nameEntity.getId()).executeUpdate();
        return ((Number) entityManager.createNativeQuery("select max(id) from profile_entry").getSingleResult()).longValue();
    }

    /** The element the row points to, null if the row is gone */
    private Long nameEntityOfRow(Long id) {
        List<?> rows = entityManager.createNativeQuery("select name_entity_id from profile_entry where id = :id")
                .setParameter("id", id).getResultList();
        return rows.isEmpty() ? null : ((Number) rows.get(0)).longValue();
    }

    @Test
    public void endpoints_areUnderAdmin() throws Exception {
        sector(anna, "Banken");
        sector(anna, "Versicherungen");
        NameEntity banks = element("Banken", SECTOR);

        mockMvc.perform(patch("/admin/name-entities/{id}", banks.getId()).param("name", "Versicherungen"))
                .andExpect(status().isConflict());
        mockMvc.perform(patch("/admin/name-entities/{id}", banks.getId()).param("name", "Bankwesen"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Bankwesen"));
        mockMvc.perform(get("/admin/name-entities/{id}/users", banks.getId()))
                .andExpect(jsonPath("$[0]").value("ann"));
        mockMvc.perform(get("/admin/name-entities/former-names"))
                .andExpect(jsonPath("$[0].name").value("Banken"))
                .andExpect(jsonPath("$[0].currentName").value("Bankwesen"));
        mockMvc.perform(get("/admin/name-entities/unused").param("type", "SECTOR"))
                .andExpect(status().isOk());
        mockMvc.perform(delete("/admin/name-entities/{id}", banks.getId()))
                .andExpect(status().isNoContent());
        mockMvc.perform(patch("/admin/name-entities/{id}", banks.getId()).param("name", "Banken"))
                .andExpect(status().isNotFound());
    }

    // ---------------------------------------------------------------------------------------------- usage (#271)

    @Test
    public void countUsers_countsEachConsultantOncePerElement_andTheUnusedWithZero() {
        sector(anna, "Banken");
        sector(bert, "Banken");
        sector(anna, "Versicherungen");
        nameEntityRepository.save(named("Leerlauf", SECTOR));
        entityManager.flush();
        // A row without a profile counts for nobody
        entityManager.persist(new SectorEntry(element("Versicherungen", SECTOR)));
        entityManager.flush();

        Map<Long, Integer> counts = nameEntityAdminService.countUsers(SECTOR);

        assertThat(counts).containsEntry(element("Banken", SECTOR).getId(), 2)
                .containsEntry(element("Versicherungen", SECTOR).getId(), 1)
                .containsEntry(element("Leerlauf", SECTOR).getId(), 0);
        // 0 exactly for what "delete unused" offers
        assertThat(counts.entrySet().stream().filter(count -> count.getValue() == 0).map(Map.Entry::getKey))
                .containsExactlyInAnyOrderElementsOf(nameEntityAdminService.findUnused(SECTOR).stream()
                        .map(NameEntity::getId).collect(Collectors.toList()));
    }

    @Test
    public void countUsers_ofCompaniesAndRoles_countsTheProjectsOncePerConsultant() {
        project(anna, "Kunde AG", "Entwickler");
        project(anna, "Kunde AG", "Entwickler", "Architekt");
        project(bert, "Kunde AG");
        entityManager.flush();

        assertThat(nameEntityAdminService.countUsers(COMPANY)).containsEntry(element("Kunde AG", COMPANY).getId(), 2);
        assertThat(nameEntityAdminService.countUsers(PROJECT_ROLE))
                .containsEntry(element("Entwickler", PROJECT_ROLE).getId(), 1)
                .containsEntry(element("Architekt", PROJECT_ROLE).getId(), 1);
    }

    @Test
    public void usage_isOneRequestForAllElementsOfAType() throws Exception {
        sector(anna, "Banken");
        entityManager.flush();

        mockMvc.perform(get("/admin/name-entities/usage").param("type", "SECTOR"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$['" + element("Banken", SECTOR).getId() + "']").value(1));
    }

    // ------------------------------------------------------------------------------ housekeeping, unused (#288)

    @Test
    public void theHousekeeping_listsTheUnusedElementsOfEveryType_likeTheUsageCountsThem() throws Exception {
        sector(anna, "Banken");
        nameEntityRepository.save(named("Logistik", SECTOR));
        nameEntityRepository.save(named("Leerlauf GmbH", COMPANY));
        project(bert, "Kunde AG", "Entwickler");
        entityManager.flush();

        mockMvc.perform(get("/admin/housekeeping/unused"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(NameEntityType.values().length))
                .andExpect(jsonPath("$[?(@.check == 'unused-name-entities-SECTOR')].count").value(1))
                .andExpect(jsonPath("$[?(@.check == 'unused-name-entities-SECTOR')].examples[0]").value("Logistik"))
                .andExpect(jsonPath("$[?(@.check == 'unused-name-entities-COMPANY')].examples[0]").value("Leerlauf GmbH"))
                .andExpect(jsonPath("$[?(@.check == 'unused-name-entities-PROJECT_ROLE')].count").value(0));

        // After deleting, the list (#271) has no element without users and the housekeeping finds none
        nameEntityAdminService.deleteUnused(SECTOR);
        entityManager.flush();
        assertThat(nameEntityAdminService.countUsers(SECTOR)).doesNotContainValue(0);
        mockMvc.perform(get("/admin/housekeeping/unused"))
                .andExpect(jsonPath("$[?(@.check == 'unused-name-entities-SECTOR')].count").value(0));
    }

    @Test
    public void theUnusedRubric_isForAdminsOnly() throws Exception {
        mockMvc.perform(get("/admin/housekeeping/unused").header("X-Pwr-User-Admin", "false").header("X-Pwr-User-Initials", "ann"))
                .andExpect(status().isForbidden());
    }

    // --------------------------------------------------------------------------------------- localizations (#291)

    @Autowired
    private NameEntityLocalizationService localizationService;

    private static List<String> asText(List<NameEntityLocalizationDTO> localizations) {
        return localizations.stream().map(l -> l.getLanguage() + "=" + l.getQualifier()).collect(Collectors.toList());
    }

    @Test
    public void aLocalization_isSetPerLanguage_replaced_andDeleted() {
        NameEntity banks = nameEntityRepository.save(named("Banken", SECTOR));

        localizationService.setLocalization(banks.getId(), "eng", " Banking ");
        localizationService.setLocalization(banks.getId(), "fra", "Banques");
        assertThat(asText(localizationService.setLocalization(banks.getId(), "ENG", "Banks")))
                .containsExactly("eng=Banks", "fra=Banques");
        assertThat(asText(localizationService.deleteLocalization(banks.getId(), "fra"))).containsExactly("eng=Banks");

        assertThat(catchThrowableOfType(() -> localizationService.setLocalization(banks.getId(), "xx", "Banks"),
                WebApplicationException.class).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(catchThrowableOfType(() -> localizationService.setLocalization(banks.getId(), "eng", "  "),
                WebApplicationException.class).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void theLocalizationsOfALanguage_nameTypeAndElement() {
        NameEntity banks = nameEntityRepository.save(named("Banken", SECTOR));
        NameEntity english = nameEntityRepository.save(named("Englisch", LANGUAGE));
        localizationService.setLocalization(banks.getId(), "eng", "Banks");
        localizationService.setLocalization(english.getId(), "eng", "English");
        localizationService.setLocalization(english.getId(), "fra", "Anglais");

        assertThat(localizationService.findAllInLanguage("eng"))
                .extracting(l -> l.getType() + ":" + l.getName() + "=" + l.getQualifier())
                .containsExactlyInAnyOrder("SECTOR:Banken=Banks", "LANGUAGE:Englisch=English");
    }

    @Test
    public void merging_handsOnTheLocalizationsTheTargetLacks_deletingDeletesThem() {
        sector(anna, "Banken");
        sector(bert, "Bankwesen");
        NameEntity banks = element("Banken", SECTOR);
        NameEntity banking = element("Bankwesen", SECTOR);
        localizationService.setLocalization(banking.getId(), "eng", "Banking");
        localizationService.setLocalization(banking.getId(), "fra", "Banque");
        localizationService.setLocalization(banks.getId(), "eng", "Banks");
        entityManager.flush();

        nameEntityAdminService.merge(banking.getId(), banks.getId());
        entityManager.flush();
        assertThat(asText(localizationService.findLocalizations(banks.getId()))).containsExactly("eng=Banks", "fra=Banque");

        nameEntityAdminService.delete(banks.getId());
        entityManager.flush();
        assertThat(localizationService.findAllInLanguage("eng")).isEmpty();
        assertThat(localizationService.findAllInLanguage("fra")).isEmpty();
    }

    @Test
    public void deletingTheUnused_deletesTheirLocalizations() {
        NameEntity idle = nameEntityRepository.save(named("Leerlauf", SECTOR));
        localizationService.setLocalization(idle.getId(), "eng", "Idle");
        entityManager.flush();

        nameEntityAdminService.deleteUnused(SECTOR);
        entityManager.flush();

        assertThat(localizationService.findAllInLanguage("eng")).isEmpty();
    }

    @Test
    public void localizations_areMaintainedByAdminsOnly() throws Exception {
        NameEntity banks = nameEntityRepository.save(named("Banken", SECTOR));
        mockMvc.perform(put("/admin/name-entities/" + banks.getId() + "/localizations/eng").param("qualifier", "Banks")
                        .header("X-Pwr-User-Admin", "false").header("X-Pwr-User-Initials", "ann"))
                .andExpect(status().isForbidden());
        mockMvc.perform(put("/admin/name-entities/" + banks.getId() + "/localizations/eng").param("qualifier", "Banks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].qualifier").value("Banks"));
        // Between services (the view-profile service), without the header of the edge
        mockMvc.perform(get("/admin/name-entities/localizations").param("language", "eng"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Banken"));
    }

    // -------------------------------------------------------------------------------------------- aliases (#270)

    private NameEntity company(String name) {
        return nameEntityRepository.save(named(name, COMPANY));
    }

    @Test
    public void anAlias_standsForTheElement_whenAConsultantSavesIt() {
        NameEntity bahn = company("Deutsche Bahn AG");
        sector(anna, "Logistik");
        NameEntity logistics = element("Logistik", SECTOR);

        assertThat(nameEntityAdminService.addAlias(bahn.getId(), " DB ")).containsExactly("DB");
        nameEntityAdminService.addAlias(logistics.getId(), "Transport");
        Project project = project(bert, "db");
        SectorEntry entry = sector(bert, "transport");

        assertThat(project.getClient().getId()).isEqualTo(bahn.getId());
        assertThat(entry.getNameEntity().getId()).isEqualTo(logistics.getId());
    }

    @Test
    public void anAlias_mustNotBeTheNameOrAliasOfAnotherElementOfTheType() {
        NameEntity bahn = company("Deutsche Bahn AG");
        NameEntity otto = company("Otto GmbH");
        nameEntityAdminService.addAlias(bahn.getId(), "DB");

        assertThat(catchThrowableOfType(() -> nameEntityAdminService.addAlias(otto.getId(), "db"),
                WebApplicationException.class).getStatus()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(catchThrowableOfType(() -> nameEntityAdminService.addAlias(otto.getId(), " deutsche bahn ag"),
                WebApplicationException.class).getStatus()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(catchThrowableOfType(() -> nameEntityAdminService.addAlias(otto.getId(), "  "),
                WebApplicationException.class).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
        // The own name or alias changes nothing
        assertThat(nameEntityAdminService.addAlias(bahn.getId(), "deutsche bahn ag")).containsExactly("DB");
        assertThat(nameEntityAdminService.addAlias(bahn.getId(), "db")).containsExactly("DB");
    }

    @Test
    public void theSameAlias_isAllowedForElementsOfDifferentTypes() {
        NameEntity bahn = company("Deutsche Bahn AG");
        sector(anna, "Datenbanken");
        nameEntityAdminService.addAlias(bahn.getId(), "DB");

        assertThat(nameEntityAdminService.addAlias(element("Datenbanken", SECTOR).getId(), "DB")).containsExactly("DB");
    }

    @Test
    public void renaming_toTheAliasOfAnotherElement_isAConflict_toAnOwnAliasIsAllowed() {
        NameEntity bahn = company("Deutsche Bahn AG");
        NameEntity otto = company("Otto GmbH");
        nameEntityAdminService.addAlias(bahn.getId(), "DB");

        assertThat(catchThrowableOfType(() -> nameEntityAdminService.rename(otto.getId(), "DB"),
                WebApplicationException.class).getStatus()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(nameEntityAdminService.findAliases(bahn.getId())).containsExactly("DB");

        nameEntityAdminService.rename(bahn.getId(), "DB");
        assertThat(nameEntityAdminService.findAliases(bahn.getId())).containsExactly("Deutsche Bahn AG");
    }

    @Test
    public void merging_movesTheAliases_deletingDeletesThem() {
        NameEntity bahn = company("Deutsche Bahn AG");
        NameEntity bahnShort = company("Deutsche Bahn");
        nameEntityAdminService.addAlias(bahnShort.getId(), "DB");

        nameEntityAdminService.merge(bahnShort.getId(), bahn.getId());
        assertThat(nameEntityAdminService.findAliases(bahn.getId())).containsExactly("DB", "Deutsche Bahn");

        nameEntityAdminService.delete(bahn.getId());
        assertThat(nameEntityAdminService.findFormerNames()).noneMatch(alias -> alias.getCurrentName().equals("Deutsche Bahn AG"));
    }

    @Test
    public void deletingAnAlias_keepsTheEntriesSavedUnderIt() {
        NameEntity bahn = company("Deutsche Bahn AG");
        nameEntityAdminService.addAlias(bahn.getId(), "DB");
        Project project = project(anna, "DB");

        assertThat(nameEntityAdminService.deleteAlias(bahn.getId(), "db")).isEmpty();
        assertThat(project.getClient().getId()).isEqualTo(bahn.getId());
    }

    @Test
    public void everyUserGetsTheAliasesForTheSuggestions_onlyAdminsChangeThem() throws Exception {
        NameEntity bahn = company("Deutsche Bahn AG");
        nameEntityAdminService.addAlias(bahn.getId(), "DB");

        mockMvc.perform(get("/suggestions/aliases").header("X-Pwr-User-Admin", "false").header("X-Pwr-User-Initials", "ann"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.name == 'DB')].currentName").value("Deutsche Bahn AG"));
        mockMvc.perform(post("/admin/name-entities/" + bahn.getId() + "/aliases").param("alias", "Bahn")
                        .header("X-Pwr-User-Admin", "false").header("X-Pwr-User-Initials", "ann"))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/admin/name-entities/" + bahn.getId() + "/aliases").param("alias", "Bahn"))
                .andExpect(status().isOk());
    }
}
