package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.data.NameEntityLocalizationRepository;
import de.hbt.pwr.profile.data.NameEntityRepository;
import de.hbt.pwr.profile.errors.WebApplicationException;
import de.hbt.pwr.profile.model.NameEntityLocalizationDTO;
import de.hbt.pwr.profile.model.profile.entries.NameEntity;
import de.hbt.pwr.profile.model.profile.entries.NameEntityLocalization;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Localizations of profile elements (#291): one name per element and language (ISO 639-2), maintained by admins.
 * Merging hands them on to the target where it has none for the language, deleting an element deletes them.
 */
@Slf4j
@Service
@Transactional
public class NameEntityLocalizationService {

    private static final Set<String> LANGUAGES = Arrays.stream(Locale.getISOLanguages())
            .map(language -> new Locale(language).getISO3Language())
            .collect(Collectors.toUnmodifiableSet());

    private final NameEntityLocalizationRepository localizationRepository;
    private final NameEntityRepository nameEntityRepository;

    public NameEntityLocalizationService(NameEntityLocalizationRepository localizationRepository,
                                         NameEntityRepository nameEntityRepository) {
        this.localizationRepository = localizationRepository;
        this.nameEntityRepository = nameEntityRepository;
    }

    /** The localizations of the element, by language */
    @Transactional(readOnly = true)
    public List<NameEntityLocalizationDTO> findLocalizations(Long id) {
        NameEntity nameEntity = require(id);
        return localizationRepository.findAllByNameEntity(nameEntity).stream()
                .sorted(Comparator.comparing(NameEntityLocalization::getLanguage))
                .map(NameEntityLocalizationService::toDTO)
                .collect(Collectors.toList());
    }

    /** All elements with a localization in the language, for the view profiles of that language */
    @Transactional(readOnly = true)
    public List<NameEntityLocalizationDTO> findAllInLanguage(String language) {
        return localizationRepository.findAllByLanguage(requireLanguage(language)).stream()
                .map(NameEntityLocalizationService::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Sets the name of the element in the language, replacing one there was; 400 for a language that is no ISO 639-2
     * code or a blank name
     */
    public List<NameEntityLocalizationDTO> setLocalization(Long id, String language, String qualifier) {
        NameEntity nameEntity = require(id);
        String code = requireLanguage(language);
        if (qualifier == null || qualifier.isBlank()) {
            throw new WebApplicationException(HttpStatus.BAD_REQUEST, "A localization needs a name");
        }
        NameEntityLocalization localization = localizationRepository.findAllByNameEntity(nameEntity).stream()
                .filter(existing -> existing.getLanguage().equals(code))
                .findAny()
                .orElseGet(() -> NameEntityLocalization.builder().nameEntity(nameEntity).language(code).build());
        localization.setQualifier(qualifier.trim());
        log.info("Localizing profile element " + nameEntity.getId() + " in " + code + " as " + qualifier.trim());
        localizationRepository.save(localization);
        return findLocalizations(id);
    }

    public List<NameEntityLocalizationDTO> deleteLocalization(Long id, String language) {
        NameEntity nameEntity = require(id);
        localizationRepository.findAllByNameEntity(nameEntity).stream()
                .filter(existing -> existing.getLanguage().equalsIgnoreCase(language.trim()))
                .forEach(localizationRepository::delete);
        return findLocalizations(id);
    }

    /** Merging (#227): the target keeps its own and takes those of the source for the other languages */
    void handOn(NameEntity source, NameEntity target) {
        Set<String> targetLanguages = localizationRepository.findAllByNameEntity(target).stream()
                .map(NameEntityLocalization::getLanguage).collect(Collectors.toSet());
        localizationRepository.findAllByNameEntity(source).forEach(localization -> {
            if (targetLanguages.contains(localization.getLanguage())) {
                localizationRepository.delete(localization);
            } else {
                localization.setNameEntity(target);
            }
        });
    }

    /** Before the element itself is deleted */
    void deleteAll(NameEntity nameEntity) {
        localizationRepository.deleteAll(localizationRepository.findAllByNameEntity(nameEntity));
    }

    private static String requireLanguage(String language) {
        String code = language == null ? "" : language.trim().toLowerCase(Locale.ROOT);
        if (!LANGUAGES.contains(code)) {
            throw new WebApplicationException(HttpStatus.BAD_REQUEST, "No ISO 639-2 language: " + language);
        }
        return code;
    }

    private NameEntity require(Long id) {
        return nameEntityRepository.findById(id)
                .orElseThrow(() -> new WebApplicationException(HttpStatus.NOT_FOUND, "No profile element " + id));
    }

    private static NameEntityLocalizationDTO toDTO(NameEntityLocalization localization) {
        return new NameEntityLocalizationDTO(localization.getNameEntity().getType(), localization.getNameEntity().getName(),
                localization.getLanguage(), localization.getQualifier());
    }
}
