package de.hbt.pwr.view.client.profile.model;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ProfileSkill {
    private Long id = null;

    private String name;

    private Integer rating;

    private String comment;

    private List<String> versions = new ArrayList<>();

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
