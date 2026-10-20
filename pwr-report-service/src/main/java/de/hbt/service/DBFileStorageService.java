package de.hbt.service;

import de.hbt.exceptions.StorageFileException;
import de.hbt.exceptions.StorageFileNotFoundException;
import de.hbt.model.files.DBFile;
import de.hbt.repository.DBFileRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import static org.apache.commons.lang.StringUtils.defaultString;
import static org.springframework.util.StringUtils.cleanPath;

@Service
public class DBFileStorageService {

    private final DBFileRepository dbFileRepository;

    public DBFileStorageService(DBFileRepository dbFileRepository) {
        this.dbFileRepository = dbFileRepository;
    }

    public DBFile storeFile(MultipartFile file) {
        String filename = cleanPath(defaultString(file.getOriginalFilename(), "???"));
        try {
            if (filename.contains("..")) {
                throw new StorageFileException("invalid fileId " + filename);
            }
            DBFile dbFile = new DBFile(filename, file.getContentType(), file.getBytes());
            return dbFileRepository.save(dbFile);
        } catch (IOException e) {
            throw new StorageFileException("Could not store file: " + filename);
        }
    }

    public DBFile storeFile(String filename, String fileType, byte[] data) {
        return dbFileRepository.save(new DBFile(filename, fileType, data));
    }

    public DBFile getFile(String fileId) {
        return dbFileRepository.findById(fileId)
                .orElseThrow(() -> new StorageFileNotFoundException("File \'" + fileId + "\' was not found!"));
    }

    public Map<String, String> allFiles() {
        Map<String, String> nameIdMap = new HashMap<>();
        dbFileRepository.findAllByOrderByFiletype().forEach(dbFile -> nameIdMap.put(dbFile.getId(), dbFile.getFilename()));
        return nameIdMap;
    }


    /**
     * Deleting a file that is already gone is fine (e.g. a template preview removed during clean-up)
     */
    public void deleteFile(String fileId) {
        dbFileRepository.findById(fileId).ifPresent(dbFileRepository::delete);
    }
}
