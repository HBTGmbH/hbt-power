package de.hbt.pwr.view.service;

import de.hbt.pwr.view.exception.TemplateNotFoundException;
import de.hbt.pwr.view.model.ReportTemplate;
import de.hbt.pwr.view.repo.ReportTemplateRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static java.util.Optional.of;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.when;

@RunWith(SpringJUnit4ClassRunner.class)
public class ReportTemplateServiceTest {

    private ReportTemplateService reportTemplateService;

    @MockBean
    private ReportTemplateRepository reportTemplateRepository;


    private final List<ReportTemplate> testReportTemplates = Arrays.asList(
            ReportTemplate.builder().id("111").name("temp1").description("testDescr1").previewFilename("a/a/a").build(),
            ReportTemplate.builder().id("222").name("temp2").description("testDescr2").previewFilename("b/b/b").build(),
            ReportTemplate.builder().id("333").name("temp3").description("testDescr3").previewFilename("c/c/c").build()
    );


    @Before
    public void setUp() {
        given(reportTemplateRepository.findAll()).willReturn(testReportTemplates);
        testReportTemplates.forEach(reportTemplate -> given(reportTemplateRepository.findById(reportTemplate.getId())).willReturn(of(reportTemplate)));
        reportTemplateService = new ReportTemplateService(reportTemplateRepository);
    }

    @Test
    public void shouldReturnAllExistingTemplateIds() {
        List<String> templateIds = reportTemplateService.getTemplateIds();
        List<String> expectedIds = testReportTemplates.stream().map(ReportTemplate::getId).collect(Collectors.toList());

        assertThat(templateIds).containsAll(expectedIds);
    }

    @Test(expected = TemplateNotFoundException.class)
    public void shouldThrowNotFoundException() {
        reportTemplateService.getTemplate("foobar");
    }

    @Test
    public void shouldReturnRightTemplate() {
        ReportTemplate expected = testReportTemplates.get(0);
        ReportTemplate temp = reportTemplateRepository.findById("111").get();

        assertThat(temp).isEqualTo(expected);
    }

    @Test
    public void shouldAddTemplateAndGetItBack() {
        ReportTemplate expected = ReportTemplate.builder().id("444").name("temp4").description("testDescr4").path("d/d/d").build();
        when(reportTemplateRepository.findById(eq("444"))).thenReturn(of(expected));
        ReportTemplate temp = reportTemplateService.getTemplate("444");
        //verify(reportTemplateRepository, times(1)).findById(eq("444"));
        assertThat(temp).isEqualTo(expected);
    }

    @Test
    public void updateTemplate() {
    }

    @Test
    public void getPreviewURL() {
    }

    @Test
    public void getAllPreviewURL() {
    }
}