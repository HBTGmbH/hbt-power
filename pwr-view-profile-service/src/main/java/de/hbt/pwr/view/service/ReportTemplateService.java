package de.hbt.pwr.view.service;

import de.hbt.pwr.view.exception.TemplateNotFoundException;
import de.hbt.pwr.view.model.ReportTemplate;
import de.hbt.pwr.view.repo.ReportTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.stream.Collectors;

import static de.hbt.pwr.view.util.PwrFunctionalUtils.peek;
import static org.springframework.data.util.StreamUtils.createStreamFromIterator;

@Service
public class ReportTemplateService {

    private final ReportTemplateRepository reportTemplateRepository;

    @Autowired
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
    public ReportTemplate getTemplate(@NotNull String id) {
        ReportTemplate template = reportTemplateRepository.findReportTemplateById(id);
        if (template == null) {
            throw new TemplateNotFoundException("template");
        }
        return template;
    }


    @NotNull
    public ReportTemplate saveTemplate(@NotNull ReportTemplate reportTemplate) {
        return reportTemplateRepository.save(reportTemplate);
    }


    @NotNull
    public void deleteTemplate(@NotNull String id) {
        reportTemplateRepository.findById(id)
                .map(peek(reportTemplateRepository::delete))
                .orElseThrow(() -> new TemplateNotFoundException("template"));
    }

    @NotNull
    public ReportTemplate updateTemplate(@NotNull String id, @NotNull ReportTemplate newTemplate) {
        ReportTemplate template = reportTemplateRepository.findReportTemplateById(id);
        if (template == null) {
            throw new TemplateNotFoundException("template");
        }

        template.setCreatedDate(newTemplate.getCreatedDate());
        template.setCreateUser(newTemplate.getCreateUser());
        template.setName(newTemplate.getName());
        template.setDescription(newTemplate.getDescription());
        template.setPath(newTemplate.getPath());

        reportTemplateRepository.save(template);
        return template;
    }


    @NotNull
    public String getPreviewURL(@NotNull String id) {
        ReportTemplate result = reportTemplateRepository.findReportTemplateById(id);
        return result.getPreviewUrl();
    }

    @NotNull
    public List<String> getAllPreviewURL() {
        return createStreamFromIterator(reportTemplateRepository.findAll().iterator())
                .map(ReportTemplate::getPreviewUrl)
                .collect(Collectors.toList());
    }


    //uploadTemplate()
}
