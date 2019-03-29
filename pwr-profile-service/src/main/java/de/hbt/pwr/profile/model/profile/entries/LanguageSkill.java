package de.hbt.pwr.profile.model.profile.entries;

import de.hbt.pwr.profile.model.profile.LanguageSkillLevel;

import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;

/**
 * Created by cg on 19.04.2017.
 */
@Entity
public class LanguageSkill extends ProfileEntry {

    @Enumerated(EnumType.STRING)
    private LanguageSkillLevel level;

    public LanguageSkill() {
    }

    public LanguageSkill(Long id, NameEntity language, LanguageSkillLevel level) {
        this.nameEntity = language;
        this.id = id;
        this.level = level;
    }

    public LanguageSkill(NameEntity nameEntity, LanguageSkillLevel level) {
        super(nameEntity);
        this.level = level;
    }

    @Override
    public LanguageSkill copyNullId() {
        return new LanguageSkill(null, nameEntity, level);
    }

    public LanguageSkillLevel getLevel() {
        return level;
    }

    public void setLevel(LanguageSkillLevel level) {
        this.level = level;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;

        LanguageSkill that = (LanguageSkill) o;

        return level == that.level;
    }

    @Override
    public int hashCode() {
        int result = super.hashCode();
        result = 31 * result + (level != null ? level.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return "LanguageSkill{" +
                "level=" + level +
                ", id=" + id +
                ", nameEntity=" + nameEntity +
                '}';
    }
}
