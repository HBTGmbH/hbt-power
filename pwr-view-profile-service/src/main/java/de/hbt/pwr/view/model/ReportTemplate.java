package de.hbt.pwr.view.model;


import lombok.Data;
import org.springframework.data.redis.core.RedisHash;

import java.time.LocalDate;


@Data
@RedisHash("reportTemplate")
public class ReportTemplate {

    private String id = null;
    private String name;
    private String description;
    private String path;
    private String createUser;
    private LocalDate createdDate;
    private String previewUrl;


    @Override
    public String toString() {
        if (id != null) {
            return id;
        }
        return String.format(
                "ReportTemplate -- id:%d, name:%s, description=%s, path=%s, createUser=%s, createDate=%s",
                id, name, description, path, createUser, createdDate
        );
    }


    public static class ReportTemplateShort {
        public String description;
        public String path;
        public String createUser;
    }

    public static class ReportTemplateSlice {
        public String name;
        public String description;
        public String path;

    }
}


