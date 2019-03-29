package de.hbt.pwr.profile.data;

import de.hbt.pwr.profile.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.Optional;

public interface SkillRepository extends JpaRepository<Skill, Long> {
    Collection<Skill> findAllByName(String skillName);

    Optional<Skill> findByName(String skillName);
}
