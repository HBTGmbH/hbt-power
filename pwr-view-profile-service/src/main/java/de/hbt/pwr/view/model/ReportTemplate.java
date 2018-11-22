package de.hbt.pwr.view.model;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.redis.core.RedisHash;

import java.time.LocalDate;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@RedisHash("reportTemplate")
public class ReportTemplate {

    private String id = null;
    private String name;
    private String description;
    private String path;
    private String createUser;
    private LocalDate createdDate;
    private String previewFilename;


    @Override
    public String toString() {
        if (id != null) {
            return id;
        }
        return String.format(
                "ReportTemplate --  name:%s, description=%s, path=%s, createUser=%s, createDate=%s",
                name, description, path, createUser, createdDate
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
        public String createUser;

        public static ReportTemplateSlice fromJSON(String str) {
            ReportTemplateSlice toReturn = new ReportTemplateSlice();
            String[] content = str.split("\"");
            toReturn.name = content[1];
            toReturn.description = content[3];
            toReturn.createUser = content[5];

            return toReturn;
        }
    }
}


