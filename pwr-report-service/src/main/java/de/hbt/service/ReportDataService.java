package de.hbt.service;

import de.hbt.data.ReportDataRepository;
import de.hbt.exceptions.ReportDataException;
import de.hbt.model.ReportData;
import de.hbt.model.ReportStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReportDataService {
    private ReportDataRepository reportDataRepository;

    public ReportDataService(ReportDataRepository reportDataRepository) {
        this.reportDataRepository = reportDataRepository;
    }

    public List<ReportData> getAllReportDataForUser(String initials) {
        System.out.println("All Data:");
        System.out.println(reportDataRepository.findAll());
        return reportDataRepository.findAllByInitials(initials);
    }

    public ReportData getReportDataById(Long id) {
        ReportData temp = reportDataRepository.findById(id).orElseThrow(() -> new ReportDataException("ReportData with id: " + id + " does not exist!"));
        System.out.println(temp);
        return temp;
    }

    public void deleteReportDataById(Long id) {
        reportDataRepository.deleteById(id);
    }

    public ReportData saveReportData(ReportData reportData) {
        return reportDataRepository.save(reportData);
    }

    void updateReportData(Long reportDataId, byte[] blop) {
        ReportData reportData = getReportDataById(reportDataId);
        reportData.setData(blop);
        reportData.setReportStatus(ReportStatus.DONE);
        reportDataRepository.save(reportData);
    }

    void updateReportData(Long reportDataId, ReportStatus status) {
        ReportData reportData = getReportDataById(reportDataId);
        reportData.setData(null);
        reportData.setReportStatus(status);
        reportDataRepository.save(reportData);
    }
}
