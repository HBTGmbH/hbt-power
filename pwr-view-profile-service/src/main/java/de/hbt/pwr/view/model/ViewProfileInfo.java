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
    private String viewDescription = "";

    @JsonProperty("owner")
    private String ownerInitials = "";

    private String consultantName = "";

    private LocalDate consultantBirthDate;

    private String name = "";

    private LocalDate creationDate;

    private Integer charsPerLine;

}
