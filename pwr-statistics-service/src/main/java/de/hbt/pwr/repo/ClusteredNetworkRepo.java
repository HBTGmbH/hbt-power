package de.hbt.pwr.repo;

import de.hbt.pwr.model.clustering.ClusteredNetwork;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClusteredNetworkRepo extends CrudRepository<ClusteredNetwork, String> {
}
