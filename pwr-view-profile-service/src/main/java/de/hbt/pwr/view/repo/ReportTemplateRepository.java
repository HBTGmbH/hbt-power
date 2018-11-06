package de.hbt.pwr.view.repo;

import de.hbt.pwr.view.model.ReportTemplate;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportTemplateRepository extends CrudRepository<ReportTemplate, String> {
    public void deleteById(String id);
    public ReportTemplate findReportTemplateById(String id);
}
