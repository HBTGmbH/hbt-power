package de.hbt.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import java.time.LocalDate;

/**
 * References a generated export document
 */
@RedisHash
public class ReportFileRef {
    @Id
    private String id;
    private String fullPath;
    private LocalDate creationDate;
    private String initials;

    public ReportFileRef() {
    }

    public ReportFileRef(String id, String fullPath, LocalDate creationDate) {
        this.id = id;
        this.fullPath = fullPath;
        this.creationDate = creationDate;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFullPath() {
        return fullPath;
    }

    public void setFullPath(String fullPath) {
        this.fullPath = fullPath;
    }

    public LocalDate getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(LocalDate creationDate) {
        this.creationDate = creationDate;
    }

    public String getInitials() {
        return initials;
    }

    public void setInitials(String initials) {
        this.initials = initials;
    }
}
