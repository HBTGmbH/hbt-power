package de.hbt.data;

import de.hbt.model.ReportFileRef;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

@Component
@Repository
public interface ReportFileRepository extends CrudRepository<ReportFileRef, String> {
}
