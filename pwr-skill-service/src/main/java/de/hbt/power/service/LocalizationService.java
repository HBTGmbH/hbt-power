package de.hbt.power.service;

import de.hbt.power.model.dto.LocalizationLanguage;
import de.hbt.power.repo.SkillCategoryRepository;
import de.hbt.power.repo.SkillRepository;
import de.hbt.power.util.LocaleUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.TreeSet;
import java.util.stream.Collectors;

/**
 * The languages a view profile can show its skill and category names in (#174)
 */
@Service
public class LocalizationService {

    private final SkillRepository skillRepository;

    private final SkillCategoryRepository skillCategoryRepository;

    public LocalizationService(SkillRepository skillRepository, SkillCategoryRepository skillCategoryRepository) {
        this.skillRepository = skillRepository;
        this.skillCategoryRepository = skillCategoryRepository;
    }

    /**
     * Every language with at least one localization of a skill or category, sorted by its German name
     */
    @Transactional(readOnly = true)
    public List<LocalizationLanguage> getLanguages() {
        TreeSet<String> codes = new TreeSet<>(skillRepository.findLocalizationLanguages());
        codes.addAll(skillCategoryRepository.findLocalizationLanguages());
        return codes.stream()
                .map(code -> new LocalizationLanguage(code, LocaleUtil.getLocaleFromISO639_2(code)
                        .map(locale -> locale.getDisplayLanguage(Locale.GERMAN))
                        .orElse(code)))
                .sorted(Comparator.comparing(LocalizationLanguage::getName))
                .collect(Collectors.toList());
    }
}
