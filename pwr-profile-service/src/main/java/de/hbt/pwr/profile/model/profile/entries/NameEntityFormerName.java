package de.hbt.pwr.profile.model.profile.entries;

import de.hbt.pwr.profile.model.profile.NameEntityType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;

/**
 * A name a profile element had before it was renamed or merged into another one (#227), like an alias of a skill:
 * the profile service files a new entry of this name under the element it points to, and updating a view profile
 * finds the entries it showed under their former names (#230).
 */
@Entity
@Table(name = "name_entity_former_name")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class NameEntityFormerName {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    @Enumerated(value = EnumType.STRING)
    private NameEntityType type;

    @ManyToOne(optional = false)
    private NameEntity nameEntity;
}
