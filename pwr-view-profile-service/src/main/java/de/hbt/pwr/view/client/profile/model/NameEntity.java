package de.hbt.pwr.view.client.profile.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NameEntity {

    private Long id;

    private String name;

    private NameEntityType type;

}
