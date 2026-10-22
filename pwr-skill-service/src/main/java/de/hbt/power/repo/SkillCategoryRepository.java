package de.hbt.power.repo;

import de.hbt.power.model.SkillCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillCategoryRepository extends JpaRepository<SkillCategory, Integer> {
    Optional<SkillCategory> findOneByQualifier(String qualifier);

    List<SkillCategory> findAllByCategory(SkillCategory skillCategory);

    /**
     * Languages with at least one localization of a category
     */
    @Query("select distinct q.locale from SkillCategory c join c.qualifiers q")
    List<String> findLocalizationLanguages();
}
