package de.hbt.pwr.view.model.entries;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Qualification implements ToggleableEntry{
    private String name;
    private LocalDate date;
    private Boolean enabled;
}
