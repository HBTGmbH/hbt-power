package de.hbt.model;


import lombok.Data;

import java.time.LocalDate;


@Data
public class  ReportTemplate {
    private String id = null;
    private String name;
    private String description;
    public String fileId;
    public String createUser;
    public LocalDate createdDate;


    protected ReportTemplate() {
    }

    public ReportTemplate(String name, String description, String fileId, String createUser) {
        this.name = name;
        this.description = description;
        this.fileId = fileId;
        this.createUser = createUser;
        this.createdDate = LocalDate.now();
    }


    @Override
    public String toString() {
        return String.format(
                "ReportTemplate -- id:%s, name:%s, description=%s, fileId=%s, createUser=%s, createDate=%s",
                id, name, description, fileId, createUser, createdDate
        );
    }
}
