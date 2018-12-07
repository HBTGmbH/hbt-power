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
    private String fileId;
    private String createUser;
    private LocalDate createdDate;
    private String previewId;

    @Override
    public String toString() {
        if (id != null) {
            return String.format(
                    "ReportTemplate: {\n id: %s,\n name: %s,\n description: %s,\n fileId: %s,\n createUser: %s,\n createDate: %s\n}",
                    id, name, description, fileId, createUser, createdDate
            );
        }
        return String.format(
                "ReportTemplate: {\n id: null,\n name: %s,\n description: %s,\n fileId: %s,\n createUser: %s,\n createDate: %s\n}",
                name, description, fileId, createUser, createdDate
        );
    }


    public static class ReportTemplateShort {
        public String description;
        public String fileId;
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


