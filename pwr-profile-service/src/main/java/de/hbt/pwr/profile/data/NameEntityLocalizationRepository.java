package de.hbt.pwr.profile.data;

import de.hbt.pwr.profile.model.profile.entries.NameEntity;
import de.hbt.pwr.profile.model.profile.entries.NameEntityLocalization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NameEntityLocalizationRepository extends JpaRepository<NameEntityLocalization, Long> {

    List<NameEntityLocalization> findAllByNameEntity(NameEntity nameEntity);

    List<NameEntityLocalization> findAllByLanguage(String language);
}
