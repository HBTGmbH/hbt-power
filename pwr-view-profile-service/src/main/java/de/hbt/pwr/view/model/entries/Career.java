package de.hbt.pwr.view.model.entries;


import de.hbt.pwr.view.model.entries.sort.NameComparable;
import de.hbt.pwr.view.model.entries.sort.StartEndDateComparable;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class Career implements ToggleableEntry, NameComparable, StartEndDateComparable {
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean enabled;
}
