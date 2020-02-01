package de.hbt.service;

import de.hbt.exceptions.StorageFileException;
import de.hbt.exceptions.StorageFileNotFoundException;
import de.hbt.model.files.DBFile;
import de.hbt.repository.DBFileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import static org.springframework.util.StringUtils.cleanPath;

@Service
public class DBFileStorageService {

    private final DBFileRepository dbFileRepository;

    public DBFileStorageService(DBFileRepository dbFileRepository) {
        this.dbFileRepository = dbFileRepository;
    }

    public DBFile storeFile(MultipartFile file) {
        String filename = cleanPath(file.getOriginalFilename());
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

    public DBFile getFile(String fileId) {
        return dbFileRepository.findById(fileId)
                .orElseThrow(() -> new StorageFileNotFoundException("File \'" + fileId + "\' was not found!"));
    }

    public Map<String, String> allFiles() {
        Map<String, String> nameIdMap = new HashMap<>();
        dbFileRepository.findAllByOrderByFiletype().forEach(dbFile -> nameIdMap.put(dbFile.getId(), dbFile.getFilename()));
        return nameIdMap;
    }


    public void deleteFile(String fileId) {
        dbFileRepository.deleteById(fileId);
    }
}
