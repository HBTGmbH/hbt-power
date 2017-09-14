package de.hbt.pwr.view.client.profile.model;

import lombok.Data;

import java.time.LocalDate;


@Data
public class ConsultantInfo {
    private Long id;
    private String initials;
    private String firstName;
    private String lastName;
    private String title;
    private LocalDate birthDate;
}
