package de.hbt.pwr.profile.data;

import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    /**
     * Projects no profile holds that point to one of the skills: until #243 a deleted project kept its row and its
     * links to the skills, which are those of the profile
     */
    @Query("select distinct pr from Project pr join pr.skills s where s in :skills"
            + " and not exists (select p from Profile p join p.projects x where x = pr)")
    List<Project> findAllWithoutProfileHoldingAnyOf(@Param("skills") Collection<Skill> skills);

    /** Those of the skills a project of another profile holds, which old data has */
    @Query("select distinct s from Project pr join pr.skills s where s in :skills"
            + " and exists (select p from Profile p join p.projects x where x = pr and p <> :profile)")
    List<Skill> findSkillsInProjectsOfOtherProfiles(@Param("skills") Collection<Skill> skills, @Param("profile") Profile profile);
}
