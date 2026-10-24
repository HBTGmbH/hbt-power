package de.hbt.pwr.statistics;

import de.hbt.pwr.model.profile.Profile;
import de.hbt.pwr.model.profile.Skill;

import java.util.*;

/**
 * SimRank on the bipartite network of profiles and the skills they have: two profiles are similar if they have similar
 * skills, two skills are similar if similar profiles have them.
 * <p>
 * Computed on indexed matrices (#292): profiles and skills get an index, the similarities are {@code double[][]}, the
 * edges {@code int[]}; one matrix per kind for the old and one for the new values, swapped after each iteration. The
 * object and map entry per pair before needed hundreds of MB for about 60 profiles and 1000 skills, the matrices about
 * 8 MB each. The values are the same as before, formula included: a profile without skills gets NaN as similarity to
 * every other profile.
 */
public class SimRank {

    private static final double DAMPENING = 0.8;

    private static final int ITERATIONS = 5;

    private final int iterations;

    public SimRank() {
        this(ITERATIONS);
    }

    /**
     * Fewer iterations, so a test can check the values by hand
     */
    SimRank(int iterations) {
        this.iterations = iterations;
    }

    /**
     * The similarities of all pairs of profiles and of skills
     */
    public static final class Similarities {
        private final Map<Long, Integer> profileIndex;
        private final Map<String, Integer> skillIndex;
        private final double[][] profiles;
        private final double[][] skills;

        private Similarities(Map<Long, Integer> profileIndex, Map<String, Integer> skillIndex,
                             double[][] profiles, double[][] skills) {
            this.profileIndex = profileIndex;
            this.skillIndex = skillIndex;
            this.profiles = profiles;
            this.skills = skills;
        }

        public double profileSimilarity(Long profileId1, Long profileId2) {
            return profiles[index(profileIndex, profileId1)][index(profileIndex, profileId2)];
        }

        public double skillSimilarity(String skillName1, String skillName2) {
            return skills[index(skillIndex, skillName1)][index(skillIndex, skillName2)];
        }

        public Set<Long> profileIds() {
            return Collections.unmodifiableSet(profileIndex.keySet());
        }

        public Set<String> skillNames() {
            return Collections.unmodifiableSet(skillIndex.keySet());
        }

        private static <K> int index(Map<K, Integer> indexByKey, K key) {
            Integer index = indexByKey.get(key);
            if (index == null) {
                throw new IllegalArgumentException("Not in the network: " + key);
            }
            return index;
        }
    }

    /**
     * @param profiles with unique IDs; of two with the same ID the last one counts
     */
    public Similarities rank(List<Profile> profiles) {
        Map<Long, Profile> profilesById = new LinkedHashMap<>();
        profiles.forEach(profile -> profilesById.put(profile.getId(), profile));

        Map<Long, Integer> profileIndex = new LinkedHashMap<>();
        Map<String, Integer> skillIndex = new LinkedHashMap<>();
        List<int[]> skillsOfProfiles = new ArrayList<>();
        for (Profile profile : profilesById.values()) {
            profileIndex.put(profile.getId(), profileIndex.size());
            // Each skill name once per profile, as the set of skill nodes before
            Set<Integer> skillsOfProfile = new LinkedHashSet<>();
            for (Skill skill : profile.getSkills()) {
                Integer index = skillIndex.computeIfAbsent(skill.getName(), name -> skillIndex.size());
                skillsOfProfile.add(index);
            }
            skillsOfProfiles.add(skillsOfProfile.stream().mapToInt(Integer::intValue).toArray());
        }
        int[][] skillsOf = skillsOfProfiles.toArray(new int[0][]);
        int[][] profilesOf = invert(skillsOf, skillIndex.size());

        double[][] profileSimilarities = identity(profileIndex.size());
        double[][] skillSimilarities = identity(skillIndex.size());
        double[][] newProfileSimilarities = new double[profileIndex.size()][profileIndex.size()];
        double[][] newSkillSimilarities = new double[skillIndex.size()][skillIndex.size()];
        for (int i = 0; i < iterations; i++) {
            // Both from the values of the previous iteration
            iterate(skillsOf, skillSimilarities, newProfileSimilarities);
            iterate(profilesOf, profileSimilarities, newSkillSimilarities);
            double[][] swap = profileSimilarities;
            profileSimilarities = newProfileSimilarities;
            newProfileSimilarities = swap;
            swap = skillSimilarities;
            skillSimilarities = newSkillSimilarities;
            newSkillSimilarities = swap;
        }
        return new Similarities(profileIndex, skillIndex, profileSimilarities, skillSimilarities);
    }

    /**
     * New similarities of the nodes of one kind from the old ones of the nodes they point to: 1 for a node and itself,
     * otherwise the dampened mean of the similarities of all pairs of their neighbours.
     */
    private static void iterate(int[][] neighbours, double[][] neighbourSimilarities, double[][] result) {
        for (int a = 0; a < neighbours.length; a++) {
            for (int b = 0; b < neighbours.length; b++) {
                if (a == b) {
                    result[a][b] = 1.0;
                    continue;
                }
                double sum = 0.0;
                for (int neighbourA : neighbours[a]) {
                    double[] similaritiesOfA = neighbourSimilarities[neighbourA];
                    for (int neighbourB : neighbours[b]) {
                        sum += similaritiesOfA[neighbourB];
                    }
                }
                // The product in float, as before: the values stay the same
                double factor = DAMPENING / ((float) neighbours[a].length * (float) neighbours[b].length);
                result[a][b] = factor * sum;
            }
        }
    }

    private static int[][] invert(int[][] skillsOf, int skillCount) {
        List<List<Integer>> profilesOfSkill = new ArrayList<>(skillCount);
        for (int skill = 0; skill < skillCount; skill++) {
            profilesOfSkill.add(new ArrayList<>());
        }
        for (int profile = 0; profile < skillsOf.length; profile++) {
            for (int skill : skillsOf[profile]) {
                profilesOfSkill.get(skill).add(profile);
            }
        }
        return profilesOfSkill.stream()
                .map(list -> list.stream().mapToInt(Integer::intValue).toArray())
                .toArray(int[][]::new);
    }

    private static double[][] identity(int size) {
        double[][] matrix = new double[size][size];
        for (int i = 0; i < size; i++) {
            matrix[i][i] = 1.0;
        }
        return matrix;
    }
}
