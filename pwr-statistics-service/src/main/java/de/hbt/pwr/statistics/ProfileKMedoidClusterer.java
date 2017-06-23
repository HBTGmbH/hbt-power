package de.hbt.pwr.statistics;

import de.hbt.pwr.model.clustering.ProfileClusterable;
import de.hbt.pwr.model.clustering.ProfileMedoid;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * Clusters profile with a k medoid clustering algorithm
 */
public class ProfileKMedoidClusterer {


    private int maxIterations = 10;

    private Random random = new Random();

    private final KMedoidMetric metric;

    public ProfileKMedoidClusterer(int maxIterations, KMedoidMetric metric) {
        this.maxIterations = maxIterations < 0 ? 10 : maxIterations;
        this.metric = metric;
    }

    /**
     * Runs the k medoid algorithm, but with inverse cost logic. A higher cost represents a better composition of medoids
     * and values.
     * @param values values
     * @param clusters clusters
     * @return medoids
     */
    public List<ProfileMedoid> cluster(List<ProfileClusterable> values, int clusters) {
        if(clusters < 0) throw new IllegalArgumentException("Parameter 'clusters' may not be negative.");
        if(clusters > values.size()) throw new IllegalArgumentException("Parameter 'clusters' may not be greater than the size of available values.");
        List<ProfileMedoid> resultMedoids = new ArrayList<>();

        // Work on a copy of the list.
        List<ProfileClusterable> _values = new ArrayList<>(values);

        // Chooses the indexes of the initial medoids.
        List<Integer> medoidIndexes = chooseInitialMedoids(_values, clusters);

        // Create the initial medoids while removing them from the list of values so they may not be choosen again.
        final List<ProfileMedoid> initialMedoids = new ArrayList<>();
        final List<ProfileClusterable> valueCopies = new ArrayList<>();
        for (int i = 0; i < _values.size(); i++) {
            if(medoidIndexes.contains(i)) {
                initialMedoids.add(new ProfileMedoid(_values.get(i)));
            } else {
                valueCopies.add(_values.get(i));
            }
        }
        _values = valueCopies;
        _values.forEach(clusterable -> assignToFurthestMedoid(clusterable, initialMedoids));
        Double cost = sumCost(initialMedoids);
        resultMedoids = initialMedoids;

        // Now, during each iteration, we'll grab a random medoid and a random value and swap them.
        for (int i = 0; i < maxIterations; i++) {
            // Work on copies of the list; Do not modify the old ones
            // We do not want any mutations here, as they might mess up with the try-and-error style of this algorithm
            List<ProfileMedoid> workMedoids = resultMedoids.stream().map(ProfileMedoid::resetCopy).collect(Collectors.toList());
            // Clusterables don't have to be cloned; They are not mutable anyways.
            List<ProfileClusterable> workValues = new ArrayList<>(_values);
            ProfileMedoid medoid = workMedoids.remove(random.nextInt(resultMedoids.size()));
            ProfileClusterable value = workValues.remove(random.nextInt(workValues.size()));

            // Return the medoid to the values
            workValues.add(medoid.getMedoid());

            // Create the new medoid and make it a new assignable medoid.
            ProfileMedoid newMedoid = new ProfileMedoid(value);
            workMedoids.add(newMedoid);

            // Now, perform the calculation again.
            assignToMedoids(workValues, workMedoids);
            Double newCost = sumCost(workMedoids);
            if(newCost > cost) {
                // Good! Randomly found a better composition. Replace the old values
                _values = workValues;
                resultMedoids = workMedoids;
                cost = newCost;
            }
        }
        return resultMedoids;
    }

    private void assignToMedoids(List<ProfileClusterable> values, List<ProfileMedoid> medoids) {
        values.forEach(clusterable -> assignToFurthestMedoid(clusterable, medoids));
    }

    private Double sumCost(List<ProfileMedoid> medoids) {
        return medoids.stream().mapToDouble(ProfileMedoid::getCost).sum();
    }


    private void assignToFurthestMedoid(ProfileClusterable clusterable, List<ProfileMedoid> medoids) {
        Double distance = Double.MIN_VALUE;
        Integer highestIndex = 0;
        for (int i = 0; i < medoids.size(); i++) {
            Double currentDistance = metric.measure(clusterable, medoids.get(i));
            if(currentDistance > distance) {
                distance = currentDistance;
                highestIndex = i;
            }
            // Break if there was a zero found. Nothing can beat zero, not even a second.
            if(distance == Integer.MAX_VALUE) break;
        }
        ProfileMedoid medoid = medoids.get(highestIndex);
        medoid.addValue(clusterable, distance);
    }

    /**
     * Chooses 'qty' initial medoids from the list of available values.
     * @param values values
     * @param qty amount of initials clusters
     * @return indexes of initial clusters (in the values list)
     */
    private List<Integer> chooseInitialMedoids(List<ProfileClusterable> values, int qty) {
        List<Integer> available = IntStream.range(0, values.size()).boxed().collect(Collectors.toList());
        Collections.shuffle(available, random);
        List<Integer> initialIndexes = new ArrayList<>();
        for(int i = 0; i < qty; i++) {
            Integer index = available.remove(0);
            initialIndexes.add(index);
        }
        return initialIndexes;
    }



}
