package de.hbt.pwr.profile.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;


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

    public Skill(String name, Integer rating) {
        this.name = name;
        this.rating = rating;
    }

    public Skill copyNullId() {
        return new Skill(name, rating);
    }

}
