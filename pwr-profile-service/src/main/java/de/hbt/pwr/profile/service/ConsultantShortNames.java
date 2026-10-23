package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.model.Consultant;
import de.hbt.pwr.profile.model.ConsultantNameDTO;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Short names of the consultants (#216), unique among the active ones (for an inactive consultant: the active ones and
 * the consultant): the first name ("Klaus"), if others have the same first name with as many letters of the last name as
 * it takes ("Kai B.", "Kai Br."), the full name with the initials if even the whole last name is the same. Names compare
 * ignoring case (#207).
 */
public final class ConsultantShortNames {

    private ConsultantShortNames() {
    }

    public static List<ConsultantNameDTO> of(Collection<Consultant> consultants) {
        List<Consultant> active = consultants.stream()
                .filter(consultant -> BooleanUtils.isTrue(consultant.getActive()))
                .collect(Collectors.toList());
        return consultants.stream()
                .map(consultant -> new ConsultantNameDTO(consultant.getInitials(), shortName(consultant, active),
                        fullName(consultant)))
                .collect(Collectors.toList());
    }

    static String shortName(Consultant consultant, Collection<Consultant> active) {
        String firstName = StringUtils.trimToEmpty(consultant.getFirstName());
        String lastName = StringUtils.trimToEmpty(consultant.getLastName());
        if (firstName.isEmpty()) {
            return fullName(consultant);
        }
        List<String> otherLastNames = active.stream()
                .filter(other -> !StringUtils.equalsIgnoreCase(other.getInitials(), consultant.getInitials()))
                .filter(other -> firstName.equalsIgnoreCase(StringUtils.trimToEmpty(other.getFirstName())))
                .map(other -> StringUtils.trimToEmpty(other.getLastName()))
                .collect(Collectors.toList());
        if (otherLastNames.isEmpty()) {
            return firstName;
        }
        for (int length = 1; length < lastName.length(); length++) {
            String prefix = lastName.substring(0, length);
            if (otherLastNames.stream().noneMatch(other -> StringUtils.startsWithIgnoreCase(other, prefix))) {
                return firstName + " " + prefix + ".";
            }
        }
        // "Kai Bu" next to "Kai Buch": the whole last name tells them apart, written out without a dot
        if (!lastName.isEmpty() && otherLastNames.stream().noneMatch(lastName::equalsIgnoreCase)) {
            return firstName + " " + lastName;
        }
        return (firstName + " " + lastName).trim() + " (" + consultant.getInitials() + ")";
    }

    /**
     * First and last name; the title is the job title ("Senior Consultant"), not part of the name
     */
    static String fullName(Consultant consultant) {
        return StringUtils.normalizeSpace(StringUtils.defaultString(consultant.getFirstName()) + " "
                + StringUtils.defaultString(consultant.getLastName()));
    }
}
