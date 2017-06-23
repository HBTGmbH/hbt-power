package de.hbt.pwr.model.SimRank;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import org.springframework.data.util.Pair;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ProfileSkillNetwork {
    @Getter
    @JsonIgnore
    private List<ProfileNode> profileNodes = new ArrayList<>();

    @Getter
    @JsonIgnore
    private List<SkillNode> skillNodes = new ArrayList<>();

    @Getter
    private List<SkillSimilarity> skillSimilarities = new ArrayList<>();

    @Getter
    private List<ProfileSimilarity> profileSimilarities = new ArrayList<>();

    @JsonIgnore
    private Map<Pair<String, String>, SkillSimilarity> skillSimilarityMap = new HashMap<>();

    @JsonIgnore
    private Map<Pair<Long, Long>, ProfileSimilarity> profileSimilarityMap = new HashMap<>();

    public ProfileSkillNetwork() {
    }

    public ProfileSkillNetwork(ProfileSkillNetwork network) {
        this.profileNodes = network.getProfileNodes();
        this.skillNodes = network.getSkillNodes();
    }

    public ProfileSkillNetwork(List<ProfileNode> profileNodes, List<SkillNode> skillNodes, List<SkillSimilarity> skillSimilarities, List<ProfileSimilarity> profileSimilarities) {
        this.profileNodes = profileNodes;
        this.skillNodes = skillNodes;
        this.skillSimilarities = skillSimilarities;
        this.profileSimilarities = profileSimilarities;
        skillSimilarityMap = new HashMap<>(skillSimilarities.size());
        profileSimilarityMap = new HashMap<>(profileSimilarities.size());
        // Build the maps for lookup
        this.skillSimilarities.forEach(skillSimilarity -> {
            skillSimilarityMap.put(Pair.of(skillSimilarity.getNode1().getSkillName(), skillSimilarity.getNode2().getSkillName()), skillSimilarity);
        });
        this.profileSimilarities.forEach(profileSimilarity -> {
            profileSimilarityMap.put(Pair.of(profileSimilarity.getNode1().getProfileId(), profileSimilarity.getNode2().getProfileId()), profileSimilarity);
        });
    }

    public void addProfileSimilarity(ProfileSimilarity sim) {
        this.profileSimilarities.add(sim);
        this.profileSimilarityMap.put(Pair.of(sim.getNode1().getProfileId(), sim.getNode2().getProfileId()), sim);
    }

    public void addSkillSimilarity(SkillSimilarity sim) {
        this.skillSimilarities.add(sim);
        this.skillSimilarityMap.put(Pair.of(sim.getNode1().getSkillName(), sim.getNode2().getSkillName()), sim);
    }

    /**
     * Retreives skill similarity information for the given two skill names
     * @param skillName1 first skill name
     * @param skillName2 second skill name
     * @return similarity information
     */
    public SkillSimilarity getSkillSimilarity(String skillName1, String skillName2) {
        return skillSimilarityMap.get(Pair.of(skillName1, skillName2));
    }

    public ProfileSimilarity getProfileSimilarity(Long profileId1, Long profileId2) {
        return profileSimilarityMap.get(Pair.of(profileId1, profileId2));
    }
}
