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
        LOG.debug("getTemplate ", id);
        reportTemplateRepository.findAll().forEach(reportTemplate -> LOG.debug(reportTemplate.getId()));
        if(reportTemplateRepository.findById(id).isPresent()){
            return reportTemplateRepository.findById(id).get();
        }else{
            throw new TemplateNotFoundException(id);
        }

        //return reportTemplateRepository.findById(id).orElseThrow(() -> new TemplateNotFoundException(id));
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
        ReportTemplate template = reportTemplateRepository.findReportTemplateById(id);
        if (template == null) {
            throw new TemplateNotFoundException(id);
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

}
