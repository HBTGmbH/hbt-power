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

    /**
     * Last day the view profile was changed or exported (#289), for the housekeeping of old view profiles; missing in
     * view profiles from before, which count as used on the day this was introduced
     */
    private LocalDate lastUsed;

}
