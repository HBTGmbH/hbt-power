package de.hbt.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReportData {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    protected Long id;

    String initials;

    String viewProfileName;

    ReportStatus reportStatus;

    String fileName;

    String templateId;

    LocalDate createDate;

    @Lob
    protected byte[] data;

    public ReportData(String initials, String viewProfileName, String fileName, String templateId) {
        this.initials = initials;
        this.viewProfileName = viewProfileName;
        this.fileName = fileName;
        this.templateId = templateId;

        this.reportStatus = ReportStatus.RUNNING;
        this.createDate = LocalDate.now();
    }

    @AllArgsConstructor
    @NoArgsConstructor
    @Data
    public static class ReportDataSlice {
        Long id;

        String initials;

        String viewProfileName;

        ReportStatus reportStatus;

        String fileName;

        String templateId;

        LocalDate createDate;

        public static ReportDataSlice toReportDataSlice(ReportData data) {
            return new ReportDataSlice(data.getId(),
                    data.getInitials(),
                    data.getViewProfileName(),
                    data.getReportStatus(),
                    data.getFileName(),
                    data.getTemplateId(),
                    data.getCreateDate());
        }
    }
}
