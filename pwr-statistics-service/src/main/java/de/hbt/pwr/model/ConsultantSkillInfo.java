package de.hbt.pwr.model;

import de.hbt.pwr.model.profile.Consultant;
import de.hbt.pwr.model.profile.Skill;
import lombok.Data;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Data
public class ConsultantSkillInfo {
    private String fullName;
    private List<Skill> skills;

    public ConsultantSkillInfo(Consultant consultant, Set<String> retainedSkills) {
        fullName = consultant.getFullNameWithInitials();
        skills = consultant
                .getProfile()
                .getSkills()
                .stream()
                .filter(skill -> isIn(skill, retainedSkills))
                .collect(Collectors.toList());
    }

    private boolean isIn(Skill s, Set<String> in) {
        return in.contains(s.getName());
    }
}
