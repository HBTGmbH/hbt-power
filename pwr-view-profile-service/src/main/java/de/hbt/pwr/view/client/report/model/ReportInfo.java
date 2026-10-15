package de.hbt.pwr.view.client.report.model;

import de.hbt.pwr.view.model.ReportTemplate;
import de.hbt.pwr.view.model.ViewProfile;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReportInfo {
    private String initials;
    private String name;
    private LocalDate birthDate;
    private ViewProfile viewProfile;
    private ReportTemplate reportTemplate;
}
