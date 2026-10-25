package de.hbt.pwr.filters;

import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2ErrorCodes;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Accepts only tokens issued for the API of Power: their claim aud names one of the configured audiences (#324).
 * Depending on the token version that is the client id or the application id URI, so both may be configured.
 */
public class AudienceValidator implements OAuth2TokenValidator<Jwt> {

    private static final OAuth2Error NOT_FOR_POWER =
            new OAuth2Error(OAuth2ErrorCodes.INVALID_TOKEN, "The token is not issued for this API", null);

    private final Set<String> audiences;

    /**
     * @throws IllegalStateException without any audience: the edge must not run without the check
     */
    public AudienceValidator(Collection<String> audiences) {
        this.audiences = audiences == null ? Set.of() : audiences.stream()
                .filter(audience -> audience != null && !audience.isBlank())
                .map(String::trim)
                .collect(Collectors.toUnmodifiableSet());
        if (this.audiences.isEmpty()) {
            throw new IllegalStateException(
                    "pwr.security.jwt.audiences is not set: the edge accepts no token without knowing its audience");
        }
    }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt jwt) {
        List<String> tokenAudiences = jwt.getAudience();
        if (tokenAudiences != null && tokenAudiences.stream().anyMatch(audiences::contains)) {
            return OAuth2TokenValidatorResult.success();
        }
        return OAuth2TokenValidatorResult.failure(NOT_FOR_POWER);
    }
}
