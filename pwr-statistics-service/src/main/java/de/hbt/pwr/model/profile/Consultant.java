package de.hbt.pwr.model.profile;

import lombok.Data;
import org.apache.commons.lang.StringUtils;
import org.springframework.data.redis.core.RedisHash;

import java.time.LocalDate;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@RedisHash("Consultant")
public class Consultant {
    private String id;

    private String initials;

    private String firstName;
    private String lastName;
    private String title;

    private LocalDate birthDate;

    private Profile profile;

    public String getFullName() {
        return (StringUtils.defaultString(this.title) + " " + this.firstName + " " + this.lastName).trim();
    }

    public String getFullNameWithInitials() {
        return getFullName() + " (" + initials + ")";
    }

    public boolean hasSkill(String skillName) {
        boolean found = false;
        for (Skill skill : profile.getSkills()) {
            if(skill.getName() != null && skill.getName().equals(skillName)) {
                found = true;
                break;
            }
        }
        return found;
    }

    public boolean hasAllSkills(Set<String> skills) {
        Set<String> intersection = profile.getSkills().stream().map(Skill::getName).collect(Collectors.toSet());
        intersection.retainAll(skills);
        return intersection.size() == skills.size();
    }
}
