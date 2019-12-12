package de.hbt.pwr.view.service;

import de.hbt.pwr.view.exception.TemplateNotFoundException;
import de.hbt.pwr.view.model.ReportTemplate;
import de.hbt.pwr.view.repo.ReportTemplateRepository;
import org.apache.logging.log4j.LogManager;
import org.springframework.stereotype.Service;

import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.stream.Collectors;

import static de.hbt.pwr.view.util.PwrFunctionalUtils.peek;
import static org.springframework.data.util.StreamUtils.createStreamFromIterator;

@Service
public class ReportTemplateService {

    private static final org.apache.logging.log4j.Logger LOG = LogManager.getLogger(ReportTemplateService.class);

    private final ReportTemplateRepository reportTemplateRepository;

    public ReportTemplateService(ReportTemplateRepository reportTemplateRepository) {
        this.reportTemplateRepository = reportTemplateRepository;
    }


    @NotNull
    public List<String> getTemplateIds() {
        return createStreamFromIterator(reportTemplateRepository.findAll().iterator())
                .map(ReportTemplate::getId)
                .collect(Collectors.toList());

    }

    @NotNull
    public ReportTemplate getTemplate(@NotNull String id) throws TemplateNotFoundException {
        if (reportTemplateRepository.findById(id).isPresent()) {
            return reportTemplateRepository.findById(id).get();
        } else {
            throw new TemplateNotFoundException(id);
        }
    }


    @NotNull
    public ReportTemplate saveTemplate(@NotNull ReportTemplate reportTemplate) {
        return reportTemplateRepository.save(reportTemplate);
    }


    @NotNull
    public void deleteTemplate(@NotNull String id) {

        reportTemplateRepository.findById(id)
                .map(peek(reportTemplateRepository::delete))
                .orElseThrow(() -> new TemplateNotFoundException(id));
    }

    @NotNull
    public ReportTemplate updateTemplate(@NotNull String id, @NotNull ReportTemplate newTemplate) {
        ReportTemplate template;
        if (reportTemplateRepository.findById(id).isPresent()) {
            template = reportTemplateRepository.findById(id).get();
        } else {
            throw new TemplateNotFoundException(id);
        }

        template.setCreatedDate(newTemplate.getCreatedDate());
        template.setCreateUser(newTemplate.getCreateUser());
        template.setName(newTemplate.getName());
        template.setDescription(newTemplate.getDescription());
        template.setFileId(newTemplate.getFileId());
        template.setPreviewId(newTemplate.getPreviewId());

        reportTemplateRepository.save(template);
        return template;
    }


    @NotNull
    public String getPreviewFilename(@NotNull String id) {
        if (reportTemplateRepository.findReportTemplateById(id) != null) {
            return reportTemplateRepository.findReportTemplateById(id).getPreviewId();
        }
        return null;
    }

    @NotNull
    public List<String> getAllPreviewFilenames() {
        return createStreamFromIterator(reportTemplateRepository.findAll().iterator())
                .map(ReportTemplate::getPreviewId)
                .collect(Collectors.toList());
    }

    public List<String> getAllPreviewTemplateIds() {
        return createStreamFromIterator(reportTemplateRepository.findAll().iterator())
                .map(reportTemplate -> reportTemplate.getPreviewId() != null ? reportTemplate.getId() : "")
                .collect(Collectors.toList());
    }

}
