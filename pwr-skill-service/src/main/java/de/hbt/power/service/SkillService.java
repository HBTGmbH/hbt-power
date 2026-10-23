package de.hbt.power.service;

import de.hbt.power.model.Skill;
import de.hbt.power.model.SkillCategory;
import de.hbt.power.repo.SkillRepository;
import de.hbt.power.util.LocaleUtil;
import org.springframework.beans.factory.annotation.Autowired;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.util.HashSet;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

import static de.hbt.power.exception.SkillServiceException.aliasConflict;
import static de.hbt.power.exception.SkillServiceException.skillAlreadyExists;
import static de.hbt.power.exception.SkillServiceException.skillNotFound;
import static de.hbt.power.exception.SkillServiceException.validationFailed;

@Service
@Log4j2
public class SkillService {

    private final SkillRepository skillRepository;

    @Autowired
    public SkillService(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    @Transactional
    public Skill moveSkillToCategory(Skill toMove, SkillCategory newParent) {
        toMove.setCategory(newParent);
        return toMove;
    }

    /**
     * Finds a skill by its name or, ignoring case, by one of its aliases.
     */
    public Optional<Skill> findByNameOrAlias(String name) {
        Optional<Skill> byName = skillRepository.findOneByQualifier(name);
        return byName.isPresent() ? byName : skillRepository.findOneByAlias(name);
    }

    @Transactional
    public Skill createSkillInCategory(Skill skill, SkillCategory skillCategory) {
        skillRepository.findOneByAlias(skill.getQualifier()).ifPresent(owner -> {
            throw aliasConflict(skill.getQualifier(), owner);
        });
        // aliases are only added through addAlias, which checks them
        skill.setAliases(new HashSet<>());
        skill.setCustom(true);
        skill.setCategory(skillCategory);
        return skillRepository.save(skill);
    }

    private Locale getLocale(String language) {
        Optional<Locale> optional = LocaleUtil.getLocaleFromISO639_2(language);
        return optional.orElseThrow(() -> new HttpClientErrorException(HttpStatus.BAD_REQUEST, language + " is not a valid ISO 639-2 code"));
    }

    @Transactional
    public void addLocaleToSkill(Skill skill, String localeString, String language) {
        skill.addLocale(getLocale(language), localeString);
    }

    @Transactional
    public void removeLocaleFromSkill(Skill skill, String language) {
        skill.removeLocale(getLocale(language));
    }

    @Transactional
    public void addVersion(Skill skill, String version) {
        skill.getVersions().add(version);
    }

    @Transactional
    public void deleteVersion(Skill skill, String version){
        skill.getVersions().remove(version);
    }

    @Transactional
    public Skill addAlias(Integer skillId, String alias) {
        Skill skill = skillRepository.findById(skillId).orElseThrow(() -> skillNotFound(skillId));
        String trimmed = requireText("alias", alias);
        if (!hasNameOrAlias(skill, trimmed)) {
            requireFreeAlias(trimmed, skill);
            log.info("Adding alias '" + trimmed + "' to " + skill);
            skill.getAliases().add(trimmed);
        }
        return skill;
    }

    @Transactional
    public Skill removeAlias(Integer skillId, String alias) {
        Skill skill = skillRepository.findById(skillId).orElseThrow(() -> skillNotFound(skillId));
        log.info("Removing alias '" + alias + "' from " + skill);
        skill.getAliases().removeIf(existing -> existing.equalsIgnoreCase(alias.trim()));
        return skill;
    }

    /**
     * Merges the skill <code>source</code> into the skill <code>target</code>: the name and the aliases of the source
     * become aliases of the target, the versions are united and the source is deleted. A source that is no skill
     * becomes an alias of the target. Calling it again with the same arguments changes nothing.
     * <p>
     * The database compares names ignoring case (#207): a source that differs from the target only in case, or that is
     * already an alias of it, is the target itself, so the skill tree stays as it is. The profile service then only
     * renames the spellings in the profiles to the name of the returned skill.
     *
     * @return the target skill
     */
    @Transactional
    public Skill mergeSkills(String source, String target) {
        String sourceName = requireText("source", source);
        String targetName = requireText("target", target);
        if (sourceName.equals(targetName)) {
            throw validationFailed("source", "'" + sourceName + "' is the target skill itself");
        }
        Skill targetSkill = findByNameOrAlias(targetName).orElseThrow(() -> skillNotFound(target));
        Optional<Skill> sourceSkill = skillRepository.findOneByQualifier(sourceName)
                .filter(skill -> !skill.getId().equals(targetSkill.getId()));
        if (sourceSkill.isPresent()) {
            mergeSkillInto(sourceSkill.get(), targetSkill);
        } else if (!hasNameOrAlias(targetSkill, sourceName)) {
            requireFreeAlias(sourceName, targetSkill);
            log.info("Adding alias '" + sourceName + "' to " + targetSkill);
            targetSkill.getAliases().add(sourceName);
        }
        return targetSkill;
    }

    /**
     * Renames the skill <code>name</code> (#228): the old name becomes an alias, so search and the names in the
     * profiles still find it (#208); an alias of the skill that becomes its name is no alias anymore. Changing only the
     * case adds no alias. 409 if the new name is the name or an alias of another skill (ignoring case, #207): that is
     * a merge, which the admin decides. Versions, localizations and category stay.
     *
     * @return the renamed skill
     */
    @Transactional
    public Skill renameSkill(String name, String newName) {
        String oldName = requireText("name", name);
        String targetName = requireText("newName", newName);
        Skill skill = skillRepository.findOneByQualifier(oldName).orElseThrow(() -> skillNotFound(oldName));
        String qualifier = skill.getQualifier();
        if (qualifier.equals(targetName)) {
            return skill;
        }
        if (!qualifier.equalsIgnoreCase(targetName)) {
            skillRepository.findAllByQualifierIgnoreCase(targetName).stream()
                    .filter(other -> !other.equals(skill))
                    .findAny()
                    .ifPresent(other -> {
                        throw skillAlreadyExists(other);
                    });
            requireFreeAlias(targetName, skill);
        }
        log.info("Renaming " + skill + " to '" + targetName + "'");
        skill.getAliases().removeIf(targetName::equalsIgnoreCase);
        skillRepository.flush();
        skill.setQualifier(targetName);
        if (!qualifier.equalsIgnoreCase(targetName)) {
            skill.getAliases().add(qualifier);
        }
        return skill;
    }

    private void mergeSkillInto(Skill source, Skill target) {
        log.info("Merging " + source + " into " + target);
        Set<String> newAliases = new HashSet<>(source.getAliases());
        newAliases.add(source.getQualifier());
        target.getVersions().addAll(source.getVersions());
        // Delete first: the aliases of the source must be gone before the target gets them (unique column)
        source.getAliases().clear();
        skillRepository.delete(source);
        skillRepository.flush();
        newAliases.stream()
                .filter(alias -> !hasNameOrAlias(target, alias))
                .forEach(alias -> target.getAliases().add(alias));
    }

    private boolean hasNameOrAlias(Skill skill, String name) {
        return name.equalsIgnoreCase(skill.getQualifier()) || skill.getAliases().stream().anyMatch(name::equalsIgnoreCase);
    }

    /**
     * An alias may neither be an alias of another skill nor the name of another skill, both ignoring case.
     */
    private void requireFreeAlias(String alias, Skill owner) {
        Optional<Skill> aliasOwner = skillRepository.findOneByAlias(alias);
        if (aliasOwner.isPresent() && !aliasOwner.get().equals(owner)) {
            throw aliasConflict(alias, aliasOwner.get());
        }
        skillRepository.findAllByQualifierIgnoreCase(alias).stream()
                .filter(skill -> !skill.equals(owner))
                .findAny()
                .ifPresent(skill -> {
                    throw aliasConflict(alias, skill);
                });
    }

    private static String requireText(String field, String value) {
        if (value == null || value.trim().isEmpty()) {
            throw validationFailed(field, "must not be empty");
        }
        return value.trim();
    }
}
