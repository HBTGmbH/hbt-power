package de.hbt.pwr.view.repo;

import de.hbt.pwr.view.model.ViewProfile;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ViewProfileRepository extends CrudRepository<ViewProfile, String> {

}
