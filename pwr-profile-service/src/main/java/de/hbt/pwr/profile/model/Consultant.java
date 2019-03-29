package de.hbt.pwr.profile.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import de.hbt.pwr.profile.model.profile.Profile;
import io.swagger.annotations.ApiModelProperty;

import javax.persistence.*;
import java.time.LocalDate;

/**
 * Entity class for consultants.
 * <p>
 * Created by cg on 07.04.2017.
 */
@Entity
public class Consultant {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @JsonIgnore
    private Long id;

    @Column(unique = true, nullable = false)
    @ApiModelProperty(required = true)
    private String initials;

    private String firstName;
    private String lastName;
    private String title;

    @Column(name = "is_active")
    private Boolean active = true;

    private LocalDate birthDate;

    @OneToOne(cascade = {CascadeType.PERSIST, CascadeType.REMOVE}, orphanRemoval = true)
    @JoinColumn(name = "profile_id")
    private Profile profile;

    public Consultant() {
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getInitials() {
        return initials;
    }

    public void setInitials(String abbreviation) {
        this.initials = abbreviation;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String name) {
        this.firstName = name;
    }

    public Profile getProfile() {
        return profile;
    }

    public void setProfile(Profile profile) {
        this.profile = profile;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }


    @Override
    public String toString() {
        return "Consultant{" + "id=" + id + ", firstName='" + firstName + '\'' + ", lastName='" + lastName + '\'' + ", initials='" + initials + '\'' + ", birthDate=" + birthDate + '}';
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
