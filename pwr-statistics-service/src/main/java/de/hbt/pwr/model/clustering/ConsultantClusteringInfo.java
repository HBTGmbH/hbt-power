package de.hbt.pwr.model.clustering;

import com.fasterxml.jackson.annotation.JsonIgnore;
import de.hbt.pwr.model.profile.Consultant;
import de.hbt.pwr.model.profile.Skill;
import lombok.AccessLevel;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Information devised from the clustering and networking process for a single consultant
 */
@Data
public class ConsultantClusteringInfo {
    /**
     * Id of the cluster
     */
    private Long clusterId;

    @JsonIgnore
    private Consultant consultant;

    /**
     * The people belonging to this cluster
     */
    private List<String> clusterInitials = new ArrayList<>();

    /**
     * Union of all skills with their average rating occuring in this cluster.
     */
    private List<AveragedSkill> clusterSkills = new ArrayList<>();

    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private Map<String, AveragedSkill> averagedSkillsByName = new HashMap<>();

    /**
     * Skills that are 'common' in this cluster
     */
    private List<String> commonSkills = new ArrayList<>();

    /**
     * Skills that can be recommended because they are common but not in the profile.
     */
    private List<String> recommendations = new ArrayList<>();


    public ConsultantClusteringInfo(Consultant consultant) {
        this.consultant = consultant;
    }

    public void addNode(ClusteredNetwork.Node node, Set<Skill> skills) {
        // Add the node initials to the initials
        clusterInitials.add(node.initials);
        // Add the skills that make the cluster
        for (Skill skill : skills) {
            AveragedSkill s = averagedSkillsByName.get(skill.getName());
            if(s == null) {
                s = new AveragedSkill(skill);
                averagedSkillsByName.put(skill.getName(), s);
                clusterSkills.add(s);
            } else {
                s.add(skill);
            }
        }
    }

    public void evaluate() {
        int numOfProfiles = clusterInitials.size();
        // Calculate relative occurrences
        clusterSkills.forEach(averagedSkill -> {
            averagedSkill.calc();
            averagedSkill.setRelativeOccurance((double)averagedSkill.getNumOccurances() / (double)numOfProfiles);
        });
        // Calculate common skills
        // common skills have a relative occurrence of over 80%
        commonSkills = clusterSkills.stream()
                .filter(averagedSkill -> averagedSkill.getRelativeOccurance() >= 0.5)
                .map(AveragedSkill::getName)
                .collect(Collectors.toList());
        Set<String> recommendationsSet = new HashSet<>(commonSkills);
        recommendationsSet.removeAll(consultant.getProfile().getSkills().stream().map(Skill::getName).collect(Collectors.toSet()));
        recommendations = new ArrayList<>(recommendationsSet);
    }

    public void sort() {
        clusterInitials.sort(String::compareTo);
        clusterSkills.sort(AveragedSkill::compareRelative);
        commonSkills.sort(String::compareTo);
        recommendations.sort(String::compareTo);

    }

    private static class AveragedSkill {

        @Getter
        private final String name;

        @Getter
        private int numOccurances;

        @Getter
        @JsonIgnore
        private double totalRating;

        @Getter
        private double average;

        @Getter
        @Setter
        private Double relativeOccurance;

        public AveragedSkill(Skill skill) {
            this.name = skill.getName();
            this.numOccurances = 1;
            this.totalRating = skill.getRating();
        }

        public void add(Skill skill) {
            this.numOccurances += 1;
            this.totalRating += skill.getRating();
        }

        public int compareRelative(AveragedSkill a) {
            return relativeOccurance.compareTo(a.relativeOccurance);
        }

        public void calc() {
            this.average = totalRating / (double) numOccurances;
        }

    }
}
