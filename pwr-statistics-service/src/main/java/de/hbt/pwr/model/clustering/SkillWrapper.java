package de.hbt.pwr.model.clustering;

import de.hbt.pwr.model.profile.Skill;

public class SkillWrapper {

    private final Skill skill;

    public Skill getSkill() {
        return skill;
    }

    public SkillWrapper(Skill skill) {
        this.skill = skill;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        SkillWrapper that = (SkillWrapper) o;

        return skill.getName() != null ? skill.getName().equals(that.skill.getName()) : that.skill.getName() == null;
    }

    @Override
    public int hashCode() {
        return skill.getName() != null ? skill.getName().hashCode() : 0;
    }
}
