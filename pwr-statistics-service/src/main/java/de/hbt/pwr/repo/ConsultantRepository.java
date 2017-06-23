package de.hbt.pwr.repo;

import de.hbt.pwr.model.profile.Consultant;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConsultantRepository extends CrudRepository<Consultant, String> {

}
