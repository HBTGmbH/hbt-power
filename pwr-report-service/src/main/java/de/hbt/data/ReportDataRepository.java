package de.hbt.data;

import de.hbt.model.ReportData;
import de.hbt.model.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

@Repository
public interface ReportDataRepository extends JpaRepository<ReportData, Long> {
    List<ReportData> findAllByInitials(String initials);

    long deleteAllByInitials(String initials);

    /** All documents without their content, for the housekeeping (#242) */
    @Query("select r.id as id, r.initials as initials, r.fileName as fileName, r.createdAt as createdAt,"
            + " r.reportStatus as reportStatus from ReportData r order by r.id")
    List<ReportDataSummary> findAllSummaries();

    @Modifying
    @Query("delete from ReportData r where r.id in :ids")
    int deleteAllByIdIn(@Param("ids") Collection<Long> ids);

    interface ReportDataSummary {
        Long getId();

        String getInitials();

        String getFileName();

        Instant getCreatedAt();

        ReportStatus getReportStatus();
    }
}
