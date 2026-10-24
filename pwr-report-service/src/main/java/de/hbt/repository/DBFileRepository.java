package de.hbt.repository;

import de.hbt.model.files.DBFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface DBFileRepository extends JpaRepository<DBFile, String> {
    List<DBFile> findAllByOrderByFiletype();

    /** All files without their content, for the housekeeping (#242) */
    @Query("select f.id as id, f.filename as filename from DBFile f order by f.filename")
    List<FileSummary> findAllSummaries();

    @Modifying
    @Query("delete from DBFile f where f.id in :ids")
    int deleteAllByIdIn(@Param("ids") Collection<String> ids);

    interface FileSummary {
        String getId();

        String getFilename();
    }
}
