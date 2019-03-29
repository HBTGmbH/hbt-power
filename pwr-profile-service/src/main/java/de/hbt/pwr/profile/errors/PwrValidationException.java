package de.hbt.pwr.profile.errors;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.Collection;

@Getter
@Setter
@AllArgsConstructor
public class PwrValidationException extends RuntimeException {

    private Collection<String> messages;
}
