package de.hbt.pwr.model.profile.entries;

import de.hbt.pwr.model.profile.LanguageSkillLevel;

public class LanguageSkill extends ProfileEntry{

    private LanguageSkillLevel level;

    public LanguageSkill() {
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
