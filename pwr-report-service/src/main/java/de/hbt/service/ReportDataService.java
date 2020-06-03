package de.hbt.service;

import de.hbt.data.ReportDataRepository;
import de.hbt.exceptions.ReportDataException;
import de.hbt.model.ReportData;
import de.hbt.model.ReportStatus;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;

@Service
public class ReportDataService {
    private ReportDataRepository reportDataRepository;

    public ReportDataService(ReportDataRepository reportDataRepository) {
        this.reportDataRepository = reportDataRepository;
    }

    public List<ReportData> getAllReportDataForUser(String initials) {
        return reportDataRepository.findAllByInitials(initials);
    }

    public ReportData getReportDataById(Long id) {
        return reportDataRepository.findById(id).orElseThrow(() -> new ReportDataException("ReportData with id: " + id + " does not exist!"));
    }

    public void deleteReportDataById(Long id) {
        reportDataRepository.deleteById(id);
    }

    @Transactional
    public ReportData saveReportData(ReportData reportData) {
        return reportDataRepository.save(reportData);
    }

    /**
     * Allows the caller to save report data without having a transaction
     * @param reportDataId
     * @param blop
     */
    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public void updateReportData(Long reportDataId, byte[] blop) {
        ReportData reportData = getReportDataById(reportDataId);
        reportData.setData(blop);
        reportData.setReportStatus(ReportStatus.DONE);
        reportDataRepository.save(reportData);
    }

    /**
     * Runs in a new transaction in case the caller does not haave a transaction or
     * the caller's transaction has already been marked rollback (due to an exception)
     * Allows finely grained control of the ReportStatus independent of a potentially
     * long running parent transaction
     * @param reportDataId to update
     * @param status to update to
     */
    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public void updateReportData(Long reportDataId, ReportStatus status) {
        ReportData reportData = getReportDataById(reportDataId);
        reportData.setData(null);
        reportData.setReportStatus(status);
        reportDataRepository.save(reportData);
    }
}
