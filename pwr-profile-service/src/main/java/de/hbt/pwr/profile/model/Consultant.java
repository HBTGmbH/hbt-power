package de.hbt.pwr.profile.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import de.hbt.pwr.profile.model.profile.Profile;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.persistence.*;
import java.time.LocalDate;

/**
 * Entity class for consultants.
 * <p>
 * Created by cg on 07.04.2017.
 */
@Entity
@Data
@Table(name = "consultant")
public class Consultant {
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    @Column(name = "profile_picture_id")
    private String profilePictureId;

    public Consultant() {
    }


    @Override
    public String toString() {
        return "Consultant{" + "id=" + id + ", firstName='" + firstName + '\'' + ", lastName='" + lastName + '\'' + ", initials='" + initials + '\'' + ", birthDate=" + birthDate + '}';
    }
}
