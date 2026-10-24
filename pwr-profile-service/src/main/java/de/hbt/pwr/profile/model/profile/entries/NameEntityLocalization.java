package de.hbt.pwr.profile.model.profile.entries;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;

/**
 * The name of a profile element in another language (#291), like the localizations of the skill tree: a view profile
 * with this language shows it next to the name, the report uses it instead
 */
@Entity
@Table(name = "name_entity_localization",
        uniqueConstraints = @UniqueConstraint(columnNames = {"name_entity_id", "language"}))
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class NameEntityLocalization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "name_entity_id")
    private NameEntity nameEntity;

    /** ISO 639-2, e.g. {@code eng} */
    @Column(nullable = false, length = 3)
    private String language;

    @Column(nullable = false)
    private String qualifier;
}
