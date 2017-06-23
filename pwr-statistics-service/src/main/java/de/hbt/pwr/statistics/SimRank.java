package de.hbt.pwr.statistics;

import de.hbt.pwr.model.SimRank.*;
import de.hbt.pwr.model.profile.Profile;
import de.hbt.pwr.model.profile.Skill;

import java.util.*;
import java.util.stream.Collectors;

/**
 *
 */
public class SimRank {

    private final double DAMPENING = 0.8;

    private List<ProfileSimilarity> cartesianProfileNodes(List<ProfileNode> nodes) {
        final List<ProfileNode> list1 = new ArrayList<>(nodes);
        final List<ProfileNode> list2 = new ArrayList<>(nodes);
        final List<ProfileSimilarity> result = new ArrayList<>();
        for (ProfileNode profileNode1 : list1) {
            for (ProfileNode profileNode2 : list2) {
                double similarity = profileNode1.getProfileId().equals(profileNode2.getProfileId()) ? 1.0 : 0.0;
                result.add(new ProfileSimilarity(profileNode1, profileNode2, similarity));
            }
        }
        return result;
    }

    private List<SkillSimilarity> cartesianSkillNodes(List<SkillNode> nodes) {
        final List<SkillNode> list1 = new ArrayList<>(nodes);
        final List<SkillNode> list2 = new ArrayList<>(nodes);
        final List<SkillSimilarity> result = new ArrayList<>();
        for (SkillNode skillNode1 : list1) {
            for (SkillNode skillNode2 : list2) {
                double similarity = skillNode1.getSkillName().equals(skillNode2.getSkillName()) ? 1.0 : 0.0;
                result.add(new SkillSimilarity(skillNode1, skillNode2, similarity));
            }
        }
        return result;
    }

    /**
     * Builds the initial ProfileSkillNetwork with an initial rating which can be used as base for the recursion
     * @param profiles list of profiles with unqiue IDs
     * @return initial network
     */
    private ProfileSkillNetwork buildInitialRating(List<Profile> profiles) {
        // First, build all the Profile nodes.
        List<ProfileNode> profileNodes = profiles.stream().map(ProfileNode::new).collect(Collectors.toList());
        // Secondly, build all the skill nodes. The skill nodes itself are easily built by accumulating all used skill
        // names and then converting them
        Set<String> skillNames = new HashSet<>();
        profiles.forEach(profile -> skillNames.addAll(profile.getSkills().stream().map(Skill::getName).collect(Collectors.toSet())));
        List<SkillNode> skillNodes = skillNames.stream().map(SkillNode::new).collect(Collectors.toList());

        // The last missing element for the SimRank are the edges of the network, the references from profileNode to skillNode
        // and skillNode to profileNode. These in and out references are necessary.
        // While making these ties, the previously generated set is used (this contains all skills)
        final Map<Long, Profile> profilesById = new HashMap<>();
        final Map<String, SkillNode> skillNodesBySkillName = new HashMap<>();
        profiles.forEach(profile -> profilesById.put(profile.getId(), profile));
        skillNodes.forEach(skillNode -> skillNodesBySkillName.put(skillNode.getSkillName(), skillNode));
        for (ProfileNode profileNode : profileNodes) {
            Profile p = profilesById.get(profileNode.getProfileId());
            for (Skill skill : p.getSkills()) {
                SkillNode node = skillNodesBySkillName.get(skill.getName());
                profileNode.addSkillNode(node);
            }
        }


        final ProfileSkillNetwork profileSkillNetwork = new ProfileSkillNetwork(
                profileNodes,
                skillNodes,
                cartesianSkillNodes(skillNodes),
                cartesianProfileNodes(profileNodes)
        );

        return profileSkillNetwork;
    }

    private double sumSimValues(ProfileSimilarity profileSimilarity, ProfileSkillNetwork network) {
        double simVal = 0.0;
        // Iterate over each skill node collection and sum the sim values
        for (SkillNode skillNode1 : profileSimilarity.getNode1().getSkillNodes()) {
            for (SkillNode skillNode2 : profileSimilarity.getNode2().getSkillNodes()) {
                simVal += network.getSkillSimilarity(skillNode1.getSkillName(), skillNode2.getSkillName()).getSimVal();
            }
        }
        return simVal;
    }

    private double sumSimValues(SkillSimilarity skillSimilarity, ProfileSkillNetwork network) {
        double simVal = 0.0;
        for (ProfileNode node1 : skillSimilarity.getNode1().getProfileNodes()) {
            for (ProfileNode node2 : skillSimilarity.getNode2().getProfileNodes()) {
                simVal += network.getProfileSimilarity(node1.getProfileId(), node2.getProfileId()).getSimVal();
            }
        }
        return simVal;
    }

    public ProfileSkillNetwork rank(List<Profile> profiles) {
        // Build the network(full)
        ProfileSkillNetwork network = buildInitialRating(profiles);

        for(int i = 0; i < 5; i++) {
            ProfileSkillNetwork newNetwork = new ProfileSkillNetwork(network);
            // In a next iteration, build a new network with different similarities.
            // Iterate over each similarity that exists and re-calculate it.
            for (ProfileSimilarity profileSimilarity : network.getProfileSimilarities()) {
                double newSimVal = 1.0;
                if(!profileSimilarity.nodesAreEqual()) {
                    // Similairty is calculate as following:
                    double factor = DAMPENING / ((float)profileSimilarity.getNode1().outgoing() * (float)profileSimilarity.getNode2().outgoing());
                    newSimVal = factor * sumSimValues(profileSimilarity, network);
                }
                newNetwork.addProfileSimilarity(profileSimilarity.updateSimVal(newSimVal));
            }

            for(SkillSimilarity skillSimilarity: network.getSkillSimilarities()) {
                double newSimVal = 1.0;
                if(!skillSimilarity.nodesAreEqual()) {
                    double factor = DAMPENING / ((float)skillSimilarity.getNode1().incoming() * (float)skillSimilarity.getNode2().incoming());
                    newSimVal = factor * sumSimValues(skillSimilarity, network);
                }
                newNetwork.addSkillSimilarity(skillSimilarity.updateSimVal(newSimVal));
            }
            network = newNetwork;
        }
        return network;
    }

}
