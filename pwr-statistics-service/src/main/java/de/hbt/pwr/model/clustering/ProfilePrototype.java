package de.hbt.pwr.model.clustering;

import lombok.Getter;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicLong;

public class ProfilePrototype {

    private static final AtomicLong CURRENT_ID = new AtomicLong();

    @Getter
    private final String name;

    @Getter
    private final Long clusterId;

    @Getter
    private final Set<SkillWrapper> skills;

    /**
     * Used for evaluation
     */
    @Getter
    private final List<ProfileClusterable> profileClusterables = new ArrayList<>();

    /**
     * List that keeps track of the currently assigned clusterables.
     */
    @Getter
    private List<ProfileClusterable> assignedClusterables = new ArrayList<>();

    public ProfilePrototype(Set<SkillWrapper> skills, String name) {
        this.name = name;
        this.clusterId = CURRENT_ID.getAndIncrement();
        this.skills = skills;
    }

    public ProfilePrototype( Set<SkillWrapper> skills, String name, Long clusterId) {
        this.name = name;
        this.clusterId = clusterId;
        this.skills = skills;
    }

    public void addClusterable( ProfileClusterable profileClusterable) {
        profileClusterables.add(profileClusterable);
    }

    public Set<SkillWrapper> getValues() {
        return skills;
    }

    public boolean isEmpty() {
        return this.profileClusterables.isEmpty();
    }

    public static ProfilePrototype empty() {
        return new ProfilePrototype(new HashSet<>(), "Empty", CURRENT_ID.getAndIncrement());
    }


    /**
     * Evaluates the prototype. This will set the list of skills that are used to compute the metric and define
     * the center of this prototype.
     * <p>
     *     Uses the list of clusterables to calculate the new center
     * </p>
     * @return a new prototype with an empty list of clusterables but the updates set of skills that define the center
     */
    public ProfilePrototype evaluate() {
        if(isEmpty()) {
            return empty();
        }
        Set<SkillWrapper> newSkills = new HashSet<>(profileClusterables.get(0).getValues());
        profileClusterables.forEach(profileClusterable -> newSkills.retainAll(profileClusterable.getValues()));
        ProfilePrototype result = new ProfilePrototype(newSkills, name, clusterId);
        result.assignedClusterables = profileClusterables;
        return result;
    }
}
