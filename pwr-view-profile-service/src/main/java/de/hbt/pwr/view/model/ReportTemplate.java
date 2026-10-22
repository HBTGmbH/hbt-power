package de.hbt.pwr.view.model;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
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

    /**
     * Name and description of an uploaded template. Other fields, like a creator older clients still send, are
     * ignored: the creator comes from the edge (#203)
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ReportTemplateSlice {
        public String name;
        public String description;

        public static ReportTemplateSlice fromJSON(String str) {
            try {
                return new ObjectMapper().readValue(str, ReportTemplateSlice.class);
            } catch (JsonProcessingException e) {
                throw new IllegalArgumentException("templateSlice is no valid JSON", e);
            }
        }
    }
}


