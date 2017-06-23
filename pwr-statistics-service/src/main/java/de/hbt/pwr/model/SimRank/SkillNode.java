package de.hbt.pwr.model.SimRank;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

public class SkillNode {

    @Getter
    @Setter
    private String skillName;

    @Getter
    @Setter
    @JsonIgnore
    private Set<ProfileNode> profileNodes = new HashSet<>();

    public SkillNode() {
    }

    public SkillNode(String skillName) {
        this.skillName = skillName;
    }

    /**
     * Adds the profile node as backreference
     * @param profileNode
     */
    public void addProfileNode(ProfileNode profileNode) {
        profileNodes.add(profileNode);
    }


    public int incoming() {
        return profileNodes.size();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        SkillNode skillNode = (SkillNode) o;

        return skillName != null ? skillName.equals(skillNode.skillName) : skillNode.skillName == null;
    }

    @Override
    public int hashCode() {
        return skillName != null ? skillName.hashCode() : 0;
    }

    @Override
    public String toString() {
        return "SkillNode{" +
                "skillName='" + skillName + '\'' +
                '}';
    }
}
