package de.hbt.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "report_data")
@AllArgsConstructor
@NoArgsConstructor
public class ReportData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    protected Long id;

    @Column(name = "initials")
    String initials;

    @Column(name = "view_profile_name")
    String viewProfileName;

    @Column(name = "report_status")
    ReportStatus reportStatus;

    @Column(name = "file_name")
    String fileName;

    @Column(name = "template_id")
    String templateId;

    @Column(name = "create_date")
    LocalDate createDate;

    @Lob
    @Column(name = "data")
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
