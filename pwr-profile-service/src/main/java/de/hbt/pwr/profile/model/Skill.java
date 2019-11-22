package de.hbt.pwr.profile.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.util.Set;


@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Skill {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id = null;

    @Column(name = "name")
    private String name;

    @Column(name = "rating")
    private Integer rating;

    @ElementCollection
    private Set<String> versions;

    public Skill(String name, Integer rating) {
        this.name = name;
        this.rating = rating;
    }

    public Skill copyNullId() {
        return new Skill(name, rating);
    }

}
