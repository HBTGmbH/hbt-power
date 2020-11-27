package de.hbt.pwr.profile.model;

import lombok.Data;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;

/**
 * Previously, we stored profile picture on the hard drive. This is...not optimal.
 *
 * To avoid storing profile pictures on the hard drive, we are storing them as blob in our database.
 * Of course, we could add it to the {@link Consultant}, but that might reduce query times if we get more profile
 * pictures.
 */
@Entity
@Data
@Table(name = "profile_picture")
public class ProfilePicture {

    @Id
    @Column(name = "id")
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid2")
    private String id;

    @Lob
    @Column(name = "image")
    private byte[] image;

    @Column(name = "content_type")
    private String contentType;

}
