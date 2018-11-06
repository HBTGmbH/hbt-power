package de.hbt.pwr.view.service;

import com.netflix.discovery.converters.Auto;
import de.hbt.pwr.view.exception.TemplateNotFoundException;
import de.hbt.pwr.view.exception.ViewProfileNotFoundException;
import de.hbt.pwr.view.model.ReportTemplate;
import de.hbt.pwr.view.repo.ReportTemplateRepository;
import javax.validation.constraints.NotNull;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.util.StreamUtils;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

@Service
public class ReportTemplateService {

    private final ReportTemplateRepository reportTemplateRepository;

    @Autowired
    public ReportTemplateService(ReportTemplateRepository reportTemplateRepository) {
        this.reportTemplateRepository = reportTemplateRepository;
    }


    @NotNull
    public List<String> getTemplateIds(){
        Stream<ReportTemplate> streamFromIterator = null;
        try {
            streamFromIterator = StreamUtils.createStreamFromIterator(reportTemplateRepository.findAll().iterator());

            List<String>  toReturn = new ArrayList<>();
            streamFromIterator
                    .forEach(reportTemplate -> toReturn.add(reportTemplate.getId()));

            return toReturn;

        } finally {
            if(streamFromIterator != null) {
                streamFromIterator.close();
            }
        }
    }

    @NotNull
    public ReportTemplate getTemplate(@NotNull String id){
        ReportTemplate template = reportTemplateRepository.findOne(id);
        if (template == null){
            throw new TemplateNotFoundException("template");
        }

        return template;
    }



    @NotNull
    public ReportTemplate saveTemplate(@NotNull ReportTemplate reportTemplate){
        return reportTemplateRepository.save(reportTemplate);
    }


    @NotNull
    public void deleteTemplate(@NotNull String id){
        ReportTemplate template = reportTemplateRepository.findOne(id);
        if (template == null){
            throw new TemplateNotFoundException("template");
        }
        reportTemplateRepository.delete(id);
    }

    @NotNull
    public ReportTemplate updateTemplate(@NotNull String id,@NotNull ReportTemplate newTemplate){
        ReportTemplate template = reportTemplateRepository.findOne(id);
        if (template == null){
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
    public String getPreviewURL(@NotNull String id){
        ReportTemplate result = reportTemplateRepository.findOne(id);
        return result.getPreviewUrl();
    }


    public List<String> getAllPreviewURL(){
        Iterable<ReportTemplate> templates = reportTemplateRepository.findAll();
        List<String> allUrls = new ArrayList<>();
        for (ReportTemplate t :
                templates) {
            allUrls.add(t.getPreviewUrl());
        }

        return allUrls;
    }


    //uploadTemplate()
}
