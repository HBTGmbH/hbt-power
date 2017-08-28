package de.hbt.pwr.view.client.profile.model;

import lombok.Data;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Data
public class ProfileProject {

    private Long Id;

    private String name;

    private NameEntity client;

    private NameEntity broker;

    private Set<NameEntity> projectRoles = new HashSet<>();

    private Set<ProfileSkill> skills = new HashSet<>();

    private LocalDate startDate;

    private LocalDate endDate;

    private String description;

}
