package de.hbt.pwr.filters;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoders;
import org.springframework.security.oauth2.jwt.SupplierReactiveJwtDecoder;

import java.util.List;

/**
 * The decoder of the access tokens, in place of the one Spring Boot builds from the issuer-uri: that one checks
 * signature, issuer and validity, but not the audience (#324).
 */
@Configuration
public class JwtDecoderConfig {

    @Bean
    public ReactiveJwtDecoder jwtDecoder(@Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri:}") String issuer,
                                         @Value("${pwr.security.jwt.audiences:}") List<String> audiences) {
        OAuth2TokenValidator<Jwt> validator = validator(issuer, audiences);
        // Like Spring Boot: the keys are only loaded from the issuer with the first token, the edge starts without it
        return new SupplierReactiveJwtDecoder(() -> {
            NimbusReactiveJwtDecoder decoder = (NimbusReactiveJwtDecoder) ReactiveJwtDecoders.fromIssuerLocation(issuer);
            decoder.setJwtValidator(validator);
            return decoder;
        });
    }

    /**
     * Signature aside, everything a token has to pass: validity, issuer and audience
     *
     * @throws IllegalStateException without issuer or audience
     */
    static OAuth2TokenValidator<Jwt> validator(String issuer, List<String> audiences) {
        if (issuer == null || issuer.isBlank()) {
            throw new IllegalStateException("spring.security.oauth2.resourceserver.jwt.issuer-uri is not set");
        }
        return new DelegatingOAuth2TokenValidator<>(JwtValidators.createDefaultWithIssuer(issuer),
                new AudienceValidator(audiences));
    }
}
