package de.hbt.pwr.profile.model.profile.entries;

import de.hbt.pwr.profile.model.profile.NameEntityType;
import lombok.*;

import javax.persistence.*;

/**
 * {@link NameEntity} should not be Cascaded, as this might result in problems during merge operations, which means
 * that at least cascade on merge should not be used.
 * <br/>
 */
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
@ToString
public class NameEntity {

    @Id
    @GeneratedValue
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(value = EnumType.STRING)
    private NameEntityType type;

    public NameEntity(String name, NameEntityType type) {
        this.name = name;
        this.type = type;
    }
}
