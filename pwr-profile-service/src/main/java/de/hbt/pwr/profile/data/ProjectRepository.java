package de.hbt.pwr.profile.data;

import de.hbt.pwr.profile.model.profile.entries.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
}
