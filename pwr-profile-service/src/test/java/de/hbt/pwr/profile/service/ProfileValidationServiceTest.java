package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.CareerEntry;
import de.hbt.pwr.profile.model.profile.entries.NameEntity;
import de.hbt.pwr.profile.model.profile.entries.TrainingEntry;
import org.junit.Before;
import org.junit.Test;

import java.time.LocalDate;
import java.util.Collection;

import static org.assertj.core.api.Assertions.assertThat;

public class ProfileValidationServiceTest {

    private ProfileValidationService profileValidationService;

    private Profile profile;

    @Before
    public void setUp() throws Exception {
        profileValidationService = new ProfileValidationService();
        profile = new Profile();
    }

    private LocalDate forYear(int year) {
        return LocalDate.of(year, 1, 1);
    }

    private CareerEntry careerEntry(String name, LocalDate startDate, LocalDate endDate) {
        CareerEntry careerEntry = new CareerEntry();
        careerEntry.setNameEntity(NameEntity.builder().name(name).build());
        careerEntry.setStartDate(startDate);
        careerEntry.setEndDate(endDate);
        return careerEntry;
    }

    private TrainingEntry trainingEntry(String name, LocalDate startDate, LocalDate endDate) {
        TrainingEntry trainingEntry = new TrainingEntry();
        trainingEntry.setNameEntity(NameEntity.builder().name(name).build());
        trainingEntry.setStartDate(startDate);
        trainingEntry.setEndDate(endDate);
        return trainingEntry;
    }

    @Test
    public void whenValidatingCareerEntries_withStartAfterEndDate_shouldReturnError() {
        profile.getCareerEntries().add(careerEntry("Kekse verkaufen", forYear(2010), forYear(2009)));
        Collection<String> errors = profileValidationService.validateProfile(profile);
        assertThat(errors).contains("CareerEntry 'Kekse verkaufen' has it's start date after the end date!");
    }

    @Test
    public void whenValidatingCareerEntry_withCorrectDates_shouldNotReturnError() {
        profile.getCareerEntries().add(careerEntry("Kekse verkaufen", forYear(2010), forYear(2011)));
        Collection<String> errors = profileValidationService.validateProfile(profile);
        assertThat(errors).isEmpty();
    }

    @Test
    public void whenValidatingCareerEntry_withNullAsEndDate_shouldNotReturnError() {
        profile.getCareerEntries().add(careerEntry("Kekse essen", forYear(2010), null));
        Collection<String> errors = profileValidationService.validateProfile(profile);
        assertThat(errors).isEmpty();
    }

    @Test
    public void whenValidatingTrainingEntries_withStartAfterEndDate_shouldReturnError() {
        profile.getTrainingEntries().add(trainingEntry("Keksmeisterschaft", forYear(2010), forYear(2009)));
        Collection<String> errors = profileValidationService.validateProfile(profile);
        assertThat(errors).contains("TrainingEntry 'Keksmeisterschaft' has it's start date after the end date!");
    }

    @Test
    public void whenValidtingEntries_withEqualStartAndEndDate_shouldNotReturnError() {
        profile.getTrainingEntries().add(trainingEntry("Keksmeisterschaft", forYear(2010), forYear(2010)));
        Collection<String> errors = profileValidationService.validateProfile(profile);
        assertThat(errors).isEmpty();
    }
}