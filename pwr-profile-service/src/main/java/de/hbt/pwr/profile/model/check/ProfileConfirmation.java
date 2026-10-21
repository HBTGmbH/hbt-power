package de.hbt.pwr.profile.model.check;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * A consultant confirmed the profile as up to date without changing it (#139). Kept as a log, so admins see how often
 * a profile was only confirmed.
 */
@Entity
@Table(name = "profile_confirmation", indexes = @Index(name = "idx_profile_confirmation_profile", columnList = "profileId"))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileConfirmation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long profileId;

    private LocalDateTime confirmedAt;

    /**
     * Login of the account, as the edge service forwards it; "lokal" without the edge service
     */
    private String login;

    /**
     * Initials of the account (claim mailnickname), as the edge service forwards them; may be null
     */
    private String initials;
}
