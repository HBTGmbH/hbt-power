package de.hbt.pwr.view.model.entries;


import de.hbt.pwr.view.model.entries.sort.NameComparable;
import de.hbt.pwr.view.model.entries.sort.StartEndDateComparable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(exclude = "localizedName")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Career implements ToggleableEntry, NameComparable, StartEndDateComparable {
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean enabled;

    /**
     * The name in the language of the view profile (#291), if the profile element has a localization for it; the name
     * stays the key. Filled by {@link de.hbt.pwr.view.service.ViewProfileLocalizationService}.
     */
    private String localizedName;

    /** Without a localized name, as before #291 */
    public Career(String name, LocalDate startDate, LocalDate endDate, Boolean enabled) {
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.enabled = enabled;
    }
}
