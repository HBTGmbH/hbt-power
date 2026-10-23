package de.hbt.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.Instant;
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

    /**
     * Description of the view profile at the time of the export (#214); null for older reports
     */
    @Column(name = "view_profile_description", length = 4000)
    String viewProfileDescription;

    /**
     * Who started the export (#214), from the header of the edge, never from the request body; null for older
     * reports and locally without the edge
     */
    @Column(name = "exported_by_initials")
    String exportedByInitials;

    /**
     * Name of who started the export at that time, looked up in the profile service; the login if there is no
     * consultant with these initials
     */
    @Column(name = "exported_by_name")
    String exportedByName;

    @Column(name = "report_status")
    ReportStatus reportStatus;

    @Column(name = "file_name")
    String fileName;

    @Column(name = "template_id")
    String templateId;

    @Column(name = "create_date")
    LocalDate createDate;

    /**
     * Point in time the report was requested; null for reports created before this column existed
     */
    @Column(name = "created_at")
    Instant createdAt;

    @Lob
    @Column(name = "data")
    protected byte[] data;

    public ReportData(String initials, String viewProfileName, String fileName, String templateId) {
        this(initials, viewProfileName, null, fileName, templateId, null, null);
    }

    public ReportData(String initials, String viewProfileName, String viewProfileDescription, String fileName,
                      String templateId, String exportedByInitials, String exportedByName) {
        this.initials = initials;
        this.viewProfileName = viewProfileName;
        this.viewProfileDescription = viewProfileDescription;
        this.exportedByInitials = exportedByInitials;
        this.exportedByName = exportedByName;
        this.fileName = fileName;
        this.templateId = templateId;

        this.reportStatus = ReportStatus.RUNNING;
        this.createDate = LocalDate.now();
        this.createdAt = Instant.now();
    }

    @AllArgsConstructor
    @NoArgsConstructor
    @Data
    public static class ReportDataSlice {
        Long id;

        String initials;

        String viewProfileName;

        String viewProfileDescription;

        String exportedByInitials;

        String exportedByName;

        ReportStatus reportStatus;

        String fileName;

        String templateId;

        LocalDate createDate;

        Instant createdAt;

        public static ReportDataSlice toReportDataSlice(ReportData data) {
            return new ReportDataSlice(data.getId(),
                    data.getInitials(),
                    data.getViewProfileName(),
                    data.getViewProfileDescription(),
                    data.getExportedByInitials(),
                    data.getExportedByName(),
                    data.getReportStatus(),
                    data.getFileName(),
                    data.getTemplateId(),
                    data.getCreateDate(),
                    data.getCreatedAt());
        }
    }
}
