package de.hbt.repository;

import de.hbt.model.files.DBFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DBFileRepository extends JpaRepository<DBFile, String> {
    List<DBFile> findAllByOrderByFiletype();
}
