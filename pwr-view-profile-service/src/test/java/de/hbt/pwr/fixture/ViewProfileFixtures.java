package de.hbt.pwr.fixture;

import de.hbt.pwr.view.model.entries.Project;
import de.hbt.pwr.view.model.entries.ProjectRole;
import de.hbt.pwr.view.model.skill.Skill;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class ViewProfileFixtures {

    public static Project validProject() {
        return Project
                .builder()
                .name("Entenwaschanlage")
                .endDate(null)
                .startDate(LocalDate.of(2020, 5, 16))
                .broker("HBT GmbH")
                .client("Entenhausen AG")
                .enabled(true)
                .description("Software für eine Entenwaschanlage")
                .id(5L)
                .projectRoles(new ArrayList<>(List.of(validProjectRole())))
                .skills(new ArrayList<>(List.of(validSkill())))
                .build();
    }

    public static ProjectRole validProjectRole() {
        return ProjectRole.builder().name("Software-Entwickler").enabled(true).build();
    }

    public static Skill validSkill() {
        return Skill.builder().name("Java").id(55L).enabled(true).build();
    }
}
