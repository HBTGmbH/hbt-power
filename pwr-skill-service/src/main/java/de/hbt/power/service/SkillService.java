package de.hbt.power.service;

import de.hbt.power.model.Skill;
import de.hbt.power.model.SkillCategory;
import de.hbt.power.repo.SkillRepository;
import de.hbt.power.util.LocaleUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.util.Locale;
import java.util.Optional;

@Service
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

    public Skill createSkill(String name) {
        Skill skill = new Skill();
        skill.setCustom(true);
        skill.setQualifier(name);
        return skillRepository.save(skill);
    }

    @Transactional
    public Skill createSkillInCategory(Skill skill, SkillCategory skillCategory) {
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
}
