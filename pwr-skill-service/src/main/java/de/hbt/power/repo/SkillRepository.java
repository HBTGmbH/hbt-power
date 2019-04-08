package de.hbt.power.repo;

import de.hbt.power.model.Skill;
import de.hbt.power.model.SkillCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Integer>, CrudRepository<Skill, Integer> {
    Optional<Skill> findOneByQualifier(String qualifier);

    List<Skill> findAllByCategory_Id(Integer categoryId);

    List<Skill> findAllByCategory(SkillCategory category);

    void deleteAllByCategory(SkillCategory category);
}
