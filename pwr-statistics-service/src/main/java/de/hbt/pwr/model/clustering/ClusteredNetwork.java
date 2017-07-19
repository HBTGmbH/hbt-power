package de.hbt.pwr.model.clustering;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import java.util.*;
import java.util.stream.Collectors;

@RedisHash("ClusteredNetwork")
@Data
public class ClusteredNetwork {
    @Id
    private String id;

    private List<Node> nodes = new ArrayList<>();
    private List<Edge> edges = new ArrayList<>();

    public ClusteredNetwork() {
    }

    public ClusteredNetwork(List<ProfileMedoid> medoids,  Map<Long, String> initialsByProfileId, List<ProfileClusterable> values) {
        for (int i = 0; i < medoids.size(); i++) {
            medoids.get(i).setClusterId((long) i);
            addMedoidToNetwork(medoids.get(i), initialsByProfileId);
        }
        connect(values);
    }

    private void addEdge(Long node1, Long node2, Integer strength) {
        this.edges.add(new Edge(node1, node2, strength));
    }

    private void addNode(Long node, String initials, Long cluster, float matchFactor) {
        this.nodes.add(new Node(node, initials, cluster, matchFactor));
    }

    public List<Node> getClusterNodes(Long clusterId) {
        return this.nodes.stream().filter(node -> node.cluster.equals(clusterId)).collect(Collectors.toList());
    }


    /**
     * Adds the clusterable to the network as node without edges
     * @param clusterable to be added
     * @param initials assigned to the node
     */
    private void addClusterableToNetwork(ProfileClusterable clusterable, String initials, ProfileMedoid medoid) {
        Set<SkillWrapper> intersection = new HashSet<>(clusterable.getValues());
        intersection.retainAll(medoid.getMedoid().getValues());
        float factor;
        if(intersection.size() == 0 || medoid.getMedoid().getValues().size() == 0) {
            factor = 0.0f;
        } else {
            factor = (float)intersection.size() / (float)medoid.getMedoid().getValues().size();
        }
        addNode(clusterable.getId(), initials, medoid.getClusterId(), factor);
    }


    private void addMedoidToNetwork(ProfileMedoid medoid, Map<Long, String> initialsByProfileId) {
        medoid.getValues().forEach(clusterable -> {
            String initials = initialsByProfileId.get(clusterable.getProfile().getId());
            addClusterableToNetwork(clusterable, initials, medoid);
        });
        String initials = initialsByProfileId.get(medoid.getMedoid().getProfile().getId());
        addClusterableToNetwork(medoid.getMedoid(), initials, medoid);
    }

    private void connect(ProfileClusterable c1, ProfileClusterable c2) {
        Set<SkillWrapper> intersection = new HashSet<>(c1.getValues());
        intersection.retainAll(c2.getValues());
        if(intersection.size() > 0) {
            addEdge(c1.getId(), c2.getId(), intersection.size());
        }
    }


    private void connect(ProfileClusterable clusterable, List<ProfileClusterable> all) {
        all.forEach(other -> {
            if(!clusterable.getId().equals(other.getId())) {
                connect(clusterable, other);
            }
        });
    }

    private void connect(List<ProfileClusterable> clusterables){
        Iterator<ProfileClusterable> clusterableIterator = clusterables.iterator();
        while(clusterableIterator.hasNext()) {
            connect(clusterableIterator.next(), clusterables);
            clusterableIterator.remove();
        }
    }

    public static class Node {
        public Long id;
        public String initials;
        public Long cluster;
        /**
         * Value between 0 and 1 that defines how close the node is to the center of the cluster.
         */
        public float matchFactor;

        public Node() {
        }

        public Node(Long id, String initials, Long cluster, float matchFactor) {
            this.id = id;
            this.initials = initials;
            this.cluster = cluster;
            this.matchFactor = matchFactor;
        }
    }

    public static class Edge {
        public Long node1;
        public Long node2;
        /**
         * Strength of the edge. Equals the amount of equal skills.
         */
        public Integer strength;

        public Edge() {
        }

        public Edge(Long node1, Long node2, Integer strength) {
            this.node1 = node1;
            this.node2 = node2;
            this.strength = strength;
        }
    }
}