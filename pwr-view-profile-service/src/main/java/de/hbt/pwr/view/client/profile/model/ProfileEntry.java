package de.hbt.pwr.view.client.profile.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
public class ProfileEntry {
    @Getter
    @Setter
    protected Long id;
    @Getter
    @Setter
    protected NameEntity nameEntity;
}
