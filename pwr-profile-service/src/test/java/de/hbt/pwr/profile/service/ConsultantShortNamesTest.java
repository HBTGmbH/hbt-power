package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.model.Consultant;
import de.hbt.pwr.profile.model.ConsultantNameDTO;
import org.junit.Test;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Short names of the consultants (#216)
 */
public class ConsultantShortNamesTest {

    private static Consultant consultant(String initials, String firstName, String lastName) {
        Consultant consultant = new Consultant();
        consultant.setInitials(initials);
        consultant.setFirstName(firstName);
        consultant.setLastName(lastName);
        return consultant;
    }

    private static Consultant inactive(String initials, String firstName, String lastName) {
        Consultant consultant = consultant(initials, firstName, lastName);
        consultant.setActive(false);
        return consultant;
    }

    private static Map<String, String> shortNames(Consultant... consultants) {
        List<ConsultantNameDTO> names = ConsultantShortNames.of(Arrays.asList(consultants));
        return names.stream().collect(Collectors.toMap(ConsultantNameDTO::getInitials, ConsultantNameDTO::getShortName));
    }

    @Test
    public void uniqueFirstNameIsEnough() {
        assertThat(shortNames(consultant("kri", "Klaus", "Richarz"), consultant("kbr", "Kai", "Brandt")))
                .containsEntry("kri", "Klaus")
                .containsEntry("kbr", "Kai");
    }

    @Test
    public void sameFirstNameAddsTheFirstLetterOfTheLastName() {
        assertThat(shortNames(consultant("kbr", "Kai", "Brandt"), consultant("kme", "Kai", "Meier"),
                consultant("kri", "Klaus", "Richarz")))
                .containsEntry("kbr", "Kai B.")
                .containsEntry("kme", "Kai M.")
                .containsEntry("kri", "Klaus");
    }

    @Test
    public void sameFirstLetterTakesAsManyLettersAsNeeded() {
        assertThat(shortNames(consultant("kbr", "Kai", "Brandt"), consultant("kbu", "Kai", "Bucher"),
                consultant("kme", "Kai", "Meier")))
                .containsEntry("kbr", "Kai Br.")
                .containsEntry("kbu", "Kai Bu.")
                .containsEntry("kme", "Kai M.");
    }

    @Test
    public void aLastNameThatStartsAnotherOneIsWrittenOut() {
        assertThat(shortNames(consultant("kbu", "Kai", "Bu"), consultant("kbc", "Kai", "Buch")))
                .containsEntry("kbu", "Kai Bu")
                .containsEntry("kbc", "Kai Buc.");
    }

    @Test
    public void theSameFullNameGetsTheInitials() {
        assertThat(shortNames(consultant("kb1", "Kai", "Brandt"), consultant("kb2", "Kai", "Brandt")))
                .containsEntry("kb1", "Kai Brandt (kb1)")
                .containsEntry("kb2", "Kai Brandt (kb2)");
    }

    @Test
    public void namesCompareIgnoringCaseAndSpacesAtTheEnds() {
        assertThat(shortNames(consultant("kbr", "Kai ", "Brandt"), consultant("kbu", "kai", "bucher")))
                .containsEntry("kbr", "Kai Br.")
                .containsEntry("kbu", "kai bu.");
    }

    @Test
    public void inactiveConsultantsDoNotCountForOthers() {
        assertThat(shortNames(consultant("kbr", "Kai", "Brandt"), inactive("kme", "Kai", "Meier")))
                .containsEntry("kbr", "Kai")
                // Named among the active ones and itself
                .containsEntry("kme", "Kai M.");
    }

    @Test
    public void withoutFirstNameTheFullNameIsUsed() {
        assertThat(shortNames(consultant("dno", null, "Nobody"))).containsEntry("dno", "Nobody");
    }

    @Test
    public void theJobTitleIsNoPartOfTheNames() {
        Consultant consultant = consultant("kbr", "Kai", "Brandt");
        consultant.setTitle("Senior Consultant");
        assertThat(ConsultantShortNames.of(Arrays.asList(consultant)))
                .extracting(ConsultantNameDTO::getShortName, ConsultantNameDTO::getFullName)
                .containsExactly(org.assertj.core.groups.Tuple.tuple("Kai", "Kai Brandt"));
    }
}
