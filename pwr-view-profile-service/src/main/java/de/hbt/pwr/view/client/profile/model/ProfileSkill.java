package de.hbt.pwr.view.client.profile.model;

import lombok.Data;

@Data
public class ProfileSkill {
    private Long id = null;

    private String name;

    private Integer rating;

    private String comment;

    public ProfileSkill() {
        // Default empty constructor for jackson
    }

    public ProfileSkill(String name) {
        this.name = name;
    }

    public ProfileSkill(String name, Integer rating) {
        this.name = name;
        this.rating = rating;
    }
}
