package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.client.SkillProfileClient;
import de.hbt.pwr.profile.data.*;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.notification.*;
import de.hbt.pwr.profile.model.profile.NameEntityType;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.NameEntity;
import de.hbt.pwr.profile.model.profile.entries.ProfileEntry;
import de.hbt.pwr.profile.model.skill.SkillCategory;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import static de.hbt.pwr.profile.model.notification.AdminNotificationStatus.ALIVE;
import static de.hbt.pwr.profile.model.notification.AdminNotificationStatus.TRASHED;

@Service
public class AdminNotificationService {

    private final AdminNotificationRepository adminNotificationRepository;

    private final NameEntityRepository nameEntityRepository;

    private final ProfileEntryDAO profileEntryDAO;

    private final ProfileRepository profileRepository;

    private final SkillRepository skillRepository;

    private final SkillProfileClient skillProfileClient;

    private final ProfileService profileService;

    private static final Logger LOG = LogManager.getLogger(AdminNotificationService.class);

    @Autowired
    public AdminNotificationService(AdminNotificationRepository adminNotificationRepository,
                                    NameEntityRepository nameEntityRepository,
                                    ProfileEntryDAO profileEntryDAO,
                                    ProfileRepository profileRepository,
                                    SkillRepository skillRepository,
                                    SkillProfileClient skillProfileClient,
                                    ProfileService profileService) {
        this.adminNotificationRepository = adminNotificationRepository;
        this.nameEntityRepository = nameEntityRepository;
        this.profileEntryDAO = profileEntryDAO;
        this.profileRepository = profileRepository;
        this.skillRepository = skillRepository;
        this.skillProfileClient = skillProfileClient;
        this.profileService = profileService;
    }

    /**
     * Permanently deletes a notification.
     *
     * @param notification to be deleted
     */
    public void deleteNotification(AdminNotification notification) {
        adminNotificationRepository.delete(notification);
    }


    /**
     * Updates the given name entity.
     * Transactional because there might be constraint violations during the various database operations.
     * TODO delete all notifications that reference the same problem
     *
     * @param nameEntity is a transient {@link NameEntity} that represents the new values of the entity.
     */
    @Transactional
    public void fixNameEntity(Long entryId, NameEntity nameEntity, AdminNotification notification) {
        Class<? extends ProfileEntry> clazz = getClazz(nameEntity.getType());
        ProfileEntry entry = profileEntryDAO.find(entryId, clazz);
        NameEntity concurrentEntity = nameEntityRepository.findByName(nameEntity.getName());
        if (concurrentEntity != null) {
            // A concurrent entity found. Means the old entity will be trashed. As there is no cascading and no
            // orphan removal, this has to be done manually.
            entry.setNameEntity(concurrentEntity);
            profileEntryDAO.update(entry);
            deleteNotification(notification);
            if (!concurrentEntity.equals(nameEntity)) {
                // Both entities might have been the same all along. Allthough this is a useless use case,
                // it has to be treated. Simply ignore the deletion when both are the same
                nameEntityRepository.delete(nameEntity);
            }

        } else {
            nameEntity = nameEntityRepository.save(nameEntity);
            entry.setNameEntity(nameEntity);
            profileEntryDAO.update(entry);
            deleteNotification(notification);
        }

    }


    /**
     * Deletes the entry and the name entity associated with it.
     * TODO this will cause serious problems if the name entity is used in more than one entry in more than one profile...
     */
    public void deleteEntryAndNameEntity(NameEntity nameEntity, AdminNotification notification) {
        // Delete the entry from the profile and persist
        profileRepository.findReferencedBy(nameEntity)
                .forEach(affectedProfile -> deleteReferencingEntries(affectedProfile, nameEntity));
        deleteNotification(notification);
        nameEntityRepository.delete(nameEntity);
    }


    /**
     * Executes a delete operation intended for the {@link SkillNotification}.
     * <p>
     * The delete operation is executed, which deletes all skills that have the same name as the skill provided
     * by the notification; Also deletes the notification upon success.
     * </p>
     *
     * @param notification is the notification that will be deleted and which provides the original error skill
     */
    @Transactional
    public void executeSkillNotificationDelete(SkillNotification notification) {
        // TODO this might, in a very unlikely case, cause concurrency issues:
        // When the deletion process of the skills takes long enough, users might add the same skill again,
        // creating a new notification.
        // The following line that deletes all notifications referencing the same skill name will then delete the
        // notification without deleting the skill.
        // This problem is ignored by decisions for now.

        // Delete the skill and all skills that have the same name (might happen).
        deleteSkillsWithSameName(notification.getSkill().getName());
        adminNotificationRepository.deleteBySkillName(notification.getSkill().getName());
    }

    /**
     * Deletes all similar skills of the given skill, similar means the skill names are equal
     */
    @Transactional
    public void executeSkillNotificationEdit(SkillNotification skillNotification) {
        LOG.info("Executing skill notification edit for " + skillNotification);
        profileService
                .renameAndMergeSkills(skillNotification.getSkill().getName(), skillNotification.getNewName())
                .forEach(profileRepository::save);
        adminNotificationRepository.delete(skillNotification);
    }

    public AdminNotification createProfileEntryNotification(Profile profile, Long profileEntryId, NameEntity nameEntity) {
        return new ProfileEntryNotification(profile, profileEntryId, nameEntity);
    }

    public AdminNotification createProfileUpdatedNotification(Profile profile) {
        return new ProfileUpdatedNotification(profile);
    }

    public void emit(AdminNotification adminNotification) {
        adminNotificationRepository.save(adminNotification);
    }

    public void emit(Iterable<AdminNotification> adminNotifications) {
        adminNotificationRepository.saveAll(adminNotifications);
    }

    /**
     * Creates a skill notification if one is applicable.
     *
     * @param profile which caused the notification
     * @param skill   for reference
     */
    public Optional<AdminNotification> createSkillNotification(Profile profile, Skill skill, boolean newSkillCreated) {
        // Priority: Blacklist first, if not blacklist, check unknown
        SkillCategory category = skillProfileClient.updateAndGetCategory(skill.getName()).getBody();
        if (category != null && category.isBlacklisted()) {
            return Optional.of(createBlacklistedSkillNotification(profile, skill));
        } else if (newSkillCreated) {
            return Optional.of(createUnknownSkillNotification(profile, skill));
        }
        return Optional.empty();
    }

    public AdminNotification createUnknownSkillNotification(Profile profile, Skill skill) {
        return new SkillNotification(profile, AdminNotificationReason.DANGEROUS_SKILL_ADDED_UNKNOWN, skill);
    }

    public AdminNotification createBlacklistedSkillNotification(Profile profile, Skill skill) {
        return new SkillNotification(profile, AdminNotificationReason.DANGEROUS_SKILL_ADDED_BLACKLISTED, skill);
    }

    /**
     * Invokes deletion of all skills with the given name in all editable profiles.
     */
    private void deleteSkillsWithSameName(String name) {
        Collection<Skill> toRemove = skillRepository.findAllByName(name);
        List<Profile> profiles = profileRepository.findAll();
        profiles.forEach(profile -> {
            // Remove skills from the skill list.
            profile.getSkills().removeAll(toRemove);
            // Remove all skills from all projects.
            profile.getProjects().forEach(project -> project.getSkills().removeAll(toRemove));
        });
    }

    private void deleteReferencingEntries(Profile profile, NameEntity nameEntity) {
        switch (nameEntity.getType()) {
            case EDUCATION:
                deleteReferencingEntries(profile.getEducation(), nameEntity);
                break;
            case LANGUAGE:
                deleteReferencingEntries(profile.getLanguages(), nameEntity);
                break;
            case QUALIFICATION:
                deleteReferencingEntries(profile.getQualification(), nameEntity);
                break;
            case SECTOR:
                deleteReferencingEntries(profile.getSectors(), nameEntity);
                break;
            case TRAINING:
                deleteReferencingEntries(profile.getTrainingEntries(), nameEntity);
                break;
        }
    }

    private <T extends ProfileEntry> void deleteReferencingEntries(Set<T> entries, NameEntity ne) {
        Optional<T> optional = entries.stream().filter(entry -> entry.getNameEntity().equals(ne)).findAny();
        if (optional.isPresent()) {
            entries.remove(optional.get());
            profileEntryDAO.remove(optional.get().getId(), getClazz(ne.getType()));
        }
    }


    private Class<? extends ProfileEntry> getClazz(NameEntityType type) {
        return type.getProfileEntryClass();
    }

    public Collection<AdminNotification> findAllAlive() {
        return adminNotificationRepository.findAllByAdminNotificationStatus(ALIVE);
    }

    public <T extends AdminNotification> Collection<T> findAllAliveBy(Class<T> clazz) {
        return findAllAlive()
                .stream()
                .filter(clazz::isInstance)
                .map(notification -> (T) notification)
                .collect(Collectors.toList());
    }

    public Optional<AdminNotification> findById(Long id) {
        return adminNotificationRepository.findById(id);
    }

    public Collection<AdminNotification> findAllTrashed() {
        return adminNotificationRepository.findAllByAdminNotificationStatus(TRASHED);
    }

    @Transactional
    public void trashById(Long id) {
        adminNotificationRepository.findById(id)
                .ifPresent(notification -> notification.setAdminNotificationStatus(TRASHED));
    }

    public void trashAllDeleted() {
        adminNotificationRepository.deleteByAdminNotificationStatus(TRASHED);
    }
}
