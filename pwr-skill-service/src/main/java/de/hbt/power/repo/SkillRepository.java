package de.hbt.power.repo;

import de.hbt.power.model.Skill;
import de.hbt.power.model.SkillCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Integer>, CrudRepository<Skill, Integer> {
    Optional<Skill> findOneByQualifier(String qualifier);

    List<Skill> findAllByQualifierIgnoreCase(String qualifier);

    @Query("select s from Skill s join s.aliases a where lower(a) = lower(:alias)")
    Optional<Skill> findOneByAlias(@Param("alias") String alias);

    void deleteAllByCategory(SkillCategory category);

    @Query("select s from Skill s WHERE not s.category is null")
    List<Skill> findForTree();

    /**
     * Languages with at least one localization of a skill; removed localizations stay behind in LOCALIZED_QUALIFIER
     * without a skill, so they don't count
     */
    @Query("select distinct q.locale from Skill s join s.qualifiers q")
    List<String> findLocalizationLanguages();
}
