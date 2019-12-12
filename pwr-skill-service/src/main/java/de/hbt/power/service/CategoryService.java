package de.hbt.power.service;

import de.hbt.power.exception.SkillServiceException;
import de.hbt.power.model.Skill;
import de.hbt.power.model.SkillCategory;
import de.hbt.power.repo.SkillCategoryRepository;
import de.hbt.power.repo.SkillRepository;
import de.hbt.power.util.LocaleUtil;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.util.Locale;
import java.util.Optional;

import static de.hbt.power.exception.SkillServiceException.categoryAlreadyExists;
import static de.hbt.power.model.SkillCategory.custom;
import static de.hbt.power.util.SkillServiceUtil.peek;
import static java.util.Optional.ofNullable;

@Service
@Log4j2
public class CategoryService {

    private final SkillCategoryRepository skillCategoryRepository;
    private final SkillRepository skillRepository;

    private static final String OTHER_CATEGORY_NAME = "Other";

    @Autowired
    public CategoryService(SkillCategoryRepository skillCategoryRepository, SkillRepository skillRepository) {
        this.skillCategoryRepository = skillCategoryRepository;
        this.skillRepository = skillRepository;
    }


    @Transactional
    public SkillCategory addLocalizationToCategory(SkillCategory skillCategory, String language, String qualifier) {
        Optional<Locale> optional = LocaleUtil.getLocaleFromISO639_2(language);
        Locale locale = optional.orElseThrow(() -> new HttpClientErrorException(HttpStatus.BAD_REQUEST, language + " is not a valid ISO 639-2 code"));
        skillCategory.addLocale(locale, qualifier);
        return skillCategory;
    }

    @Transactional
    public SkillCategory removeLocalizationToCategory(SkillCategory skillCategory, String language) {
        Optional<Locale> optional = LocaleUtil.getLocaleFromISO639_2(language);
        Locale locale = optional.orElseThrow(() -> new HttpClientErrorException(HttpStatus.BAD_REQUEST, language + " is not a valid ISO 639-2 code"));
        skillCategory.removeLocale(locale);
        return skillCategory;
    }

    @Transactional
    public SkillCategory moveCategory(SkillCategory toMove, SkillCategory newParent) {
        if (newParent.hasTransitiveParent(toMove)) {
            throw new IllegalStateException("New parent has the category to move as transitive parent");
        }
        toMove.setCategory(newParent);
        return toMove;
    }

    @Transactional
    public void deleteCategory(SkillCategory toDelete) {
        if(toDelete != null){
            skillCategoryRepository.findAllByCategory(toDelete).forEach(this::deleteCategory);
            skillRepository.deleteAllByCategory(toDelete);
            skillCategoryRepository.delete(toDelete);
        }

    }

    @Transactional
    public void setBlacklist(SkillCategory skillCategory, boolean blacklisted) {
        skillCategory.setBlacklisted(blacklisted);
        skillCategoryRepository.findAllByCategory(skillCategory).forEach(childCategory -> setBlacklist(childCategory, blacklisted));
    }

    public void blacklist(SkillCategory skillCategory) {
        setBlacklist(skillCategory, true);
    }

    public void whitelist(SkillCategory skillCategory) {
        setBlacklist(skillCategory, false);
    }

    @Transactional
    public void setIsDisplay(SkillCategory skillCategory, Boolean isDisplay) {
        skillCategory.setDisplay(isDisplay);
    }


    public Skill categorizeSkill(Skill toCategorize) {
        // Skill Provider has been removed, for now, we are simply assuming 'Other'
        SkillCategory other = skillCategoryRepository.findOneByQualifier(OTHER_CATEGORY_NAME)
                .orElseThrow(() -> new RuntimeException("Category 'Other' is missing. This should not happen!"));
        toCategorize.setCategory(other);
        return toCategorize;
    }

    public SkillCategory createSkillCategory(SkillCategory category, Integer parentId) {
        log.info("Creating custom " + category.toString() + " for parentId=" + parentId);
        if (category.getId() == null) {
            throw SkillServiceException.validationFailed("category.id", "Id is null.");
        }
        if (category.getQualifier() == null) {
            throw SkillServiceException.validationFailed("category.qualifier", "Qualifier is null.");
        }
        if (category.getQualifier().trim().isEmpty()) {
            throw SkillServiceException.validationFailed("category.qualifier", "Qualifier is empty.");
        }
        shouldNotExist(category.getQualifier());
        SkillCategory newCategory = custom(category.getQualifier());
        ofNullable(parentId)
                .map(this::getCategory)
                .map(peek(c -> newCategory.setBlacklisted(c.isBlacklisted())))
                .ifPresent(newCategory::setCategory);
        category.getQualifiers()
                .forEach(locale -> addLocalizationToCategory(newCategory, locale.getLocale(), locale.getQualifier()));
        return skillCategoryRepository.save(newCategory);
    }

    private void shouldNotExist(String qualifier) {
        skillCategoryRepository
                .findOneByQualifier(qualifier)
                .ifPresent(concurrent -> {
                    throw categoryAlreadyExists(concurrent);
                });
    }

    private SkillCategory getCategory(Integer categoryId) {
        return skillCategoryRepository.findById(categoryId)
                .orElseThrow(() -> SkillServiceException.categoryNotFound(categoryId));
    }
}
