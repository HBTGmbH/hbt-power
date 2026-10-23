package de.hbt.pwr.profile.data;

import de.hbt.pwr.profile.model.profile.NameEntityType;
import de.hbt.pwr.profile.model.profile.entries.NameEntity;
import de.hbt.pwr.profile.model.profile.entries.NameEntityFormerName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NameEntityFormerNameRepository extends JpaRepository<NameEntityFormerName, Long> {

    List<NameEntityFormerName> findAllByType(NameEntityType type);

    List<NameEntityFormerName> findAllByNameEntity(NameEntity nameEntity);
}
