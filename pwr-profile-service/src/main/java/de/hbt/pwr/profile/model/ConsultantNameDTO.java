package de.hbt.pwr.profile.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * How the webclient names a consultant (#216): the short name everywhere, the full name in the tooltip
 */
@AllArgsConstructor
@NoArgsConstructor
@Data
public class ConsultantNameDTO {
    private String initials;
    private String shortName;
    private String fullName;
}
