package de.hbt.pwr.view.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ViewProfileInfo {
    @Builder.Default private String viewDescription = "";

    @JsonProperty("owner")
    @Builder.Default private String ownerInitials = "";

    @Builder.Default private String consultantName = "";

     private LocalDate consultantBirthDate;

    @Builder.Default private String name = "";

    private LocalDate creationDate;

    private Integer charsPerLine;

}
