package de.hbt.pwr.view.model.entries;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Training implements ToggleableEntry {
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean enabled;
}
