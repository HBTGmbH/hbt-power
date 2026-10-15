package de.hbt.pwr.model;

import de.hbt.pwr.model.profile.Consultant;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ConsultantInfo {
    private String firstName;
    private String lastName;
    private String initials;
    private String title;
    private LocalDate birthDate;

    public ConsultantInfo(Consultant consultant) {
        this.firstName = consultant.getFirstName();
        this.lastName = consultant.getLastName();
        this.initials = consultant.getInitials();
        this.birthDate = consultant.getBirthDate();
        this.title = consultant.getTitle();
    }

}
