package de.hbt.pwr.view.repo;

import de.hbt.pwr.view.model.ViewProfile;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ViewProfileRepository extends CrudRepository<ViewProfile, String> {
    List<ViewProfile> findAllByViewProfileInfoDataModelVersion(Integer number);
}
