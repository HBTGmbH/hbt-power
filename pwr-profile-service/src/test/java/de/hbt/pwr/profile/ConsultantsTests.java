/*
 * Copyright 2012-2016 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package de.hbt.pwr.profile;

import de.hbt.pwr.profile.model.Consultant;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;


@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class ConsultantsTests {

    private String apiPath = "http://localhost:";
    @Value("${spring.datasource.url}")
    private String datasource;

    @LocalServerPort
    int localServerPort;

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    public void create() {
        Consultant maxMustermann = new Consultant();
        maxMustermann.setInitials("mm");
        maxMustermann.setFirstName("Max");
        maxMustermann.setLastName("Mustermann");
        maxMustermann.setBirthDate(LocalDate.parse("1977-03-20"));
        ResponseEntity<String> entity = restTemplate.postForEntity(apiPath + localServerPort + "/consultants?action=new", maxMustermann, String.class);
        assertThat(entity.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void createAndRead() {
        // create test consultant
        Consultant batman = new Consultant();
        batman.setInitials("bw");
        batman.setFirstName("Bruce");
        batman.setLastName("Wayne");
        batman.setBirthDate(LocalDate.parse("1940-06-10"));

        // POST
        ResponseEntity<String> stringResponse = restTemplate.postForEntity(apiPath + localServerPort + "/consultants?action=new", batman, String.class);
        assertThat(stringResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        // GET
        ResponseEntity<Consultant> consultantResponse = restTemplate.getForEntity(apiPath + localServerPort + "/consultants/" + batman.getInitials(), Consultant.class);
        assertThat(consultantResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(consultantResponse.getBody().getInitials()).isEqualTo(batman.getInitials());
        assertThat(consultantResponse.getBody().getFirstName()).isEqualTo(batman.getFirstName());
        assertThat(consultantResponse.getBody().getLastName()).isEqualTo(batman.getLastName());
        assertThat(consultantResponse.getBody().getBirthDate()).isEqualTo(batman.getBirthDate());

        // GET all
        ResponseEntity<String> listResponse = this.restTemplate.getForEntity(apiPath + localServerPort + "/consultants", String.class);
        assertThat(listResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(listResponse.getBody()).isNotEmpty();
        assertThat(listResponse.getBody()).contains("\"initials\":\"" + batman.getInitials() + "\"");
    }

    @Test
    public void createConflict() {
        // create test consultant
        Consultant joeMiller = new Consultant();
        joeMiller.setInitials("jm");
        joeMiller.setFirstName("Joe");
        joeMiller.setLastName("Miller");
        joeMiller.setBirthDate(LocalDate.parse("2253-01-13"));

        // POST
        ResponseEntity<String> stringResponse = restTemplate.postForEntity(apiPath + localServerPort + "/consultants?action=new", joeMiller, String.class);
        assertThat(stringResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        // POST
        stringResponse = restTemplate.postForEntity(apiPath + localServerPort + "/consultants?action=new", joeMiller, String.class);
        assertThat(stringResponse.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void listAll() {
        // GET all
        ResponseEntity<List> entity = this.restTemplate.getForEntity(apiPath + localServerPort + "/consultants", List.class);
        assertThat(entity.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}
