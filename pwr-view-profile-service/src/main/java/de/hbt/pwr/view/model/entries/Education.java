package de.hbt.pwr.view.model.entries;


import de.hbt.pwr.view.model.entries.sort.NameComparable;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
public class Education implements ToggleableEntry, NameComparable {
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private String degree;
    private Boolean enabled;

    public Education(String name, LocalDate startDate, LocalDate endDate, String degree, Boolean enabled) {
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.degree = degree;
        this.enabled = enabled;
    }
}
