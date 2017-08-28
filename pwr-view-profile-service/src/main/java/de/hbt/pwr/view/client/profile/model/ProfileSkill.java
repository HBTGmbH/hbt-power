package de.hbt.pwr.view.client.profile.model;

import lombok.Data;

@Data
public class ProfileSkill {
    private Long id = null;

    private String name;

    private Integer rating;

    private String comment;

    public ProfileSkill() {
    }

    public ProfileSkill(String name) {
        this.name = name;
    }
}
