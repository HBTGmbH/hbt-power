package de.hbt.client;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ConsultantNameClientTest {

    private static ConsultantNameClient.ConsultantName consultant(String firstName, String lastName) {
        ConsultantNameClient.ConsultantName consultant = new ConsultantNameClient.ConsultantName();
        consultant.setFirstName(firstName);
        consultant.setLastName(lastName);
        return consultant;
    }

    @Test
    void fullNameIsFirstAndLastName() {
        assertThat(consultant("Ada", "Admin").fullName()).isEqualTo("Ada Admin");
    }

    @Test
    void fullNameWithOnlyOnePart() {
        assertThat(consultant(null, "Admin").fullName()).isEqualTo("Admin");
    }

    @Test
    void noNameIsNull() {
        assertThat(consultant(" ", null).fullName()).isNull();
    }
}
