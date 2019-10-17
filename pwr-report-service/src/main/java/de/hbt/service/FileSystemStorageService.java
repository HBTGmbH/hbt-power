package de.hbt.service;


import de.hbt.exceptions.StorageFileException;
import de.hbt.exceptions.StorageFileNotFoundException;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.stream.Stream;

@Service
public class FileSystemStorageService implements StorageService {

    @Value("${export.designFileDirectory}")
    private String pathString;

    private Path saveLocation;


    @Override
    public void init(String path) {
        if (path != null && !path.equals("")) {
            saveLocation = Paths.get(path);
        } else if (pathString != null && !pathString.equals("")) {
            saveLocation = Paths.get(pathString);
        }
        try {
            Files.createDirectories(saveLocation);
        } catch (IOException e) {
            throw new StorageFileException("Could not initialize storage", e);
        }
    }

    @Override
    @SneakyThrows(value = IOException.class)
    public String store(MultipartFile file) {
        String filename = StringUtils.cleanPath(file.getOriginalFilename());
        if (file.isEmpty()) {
            throw new StorageFileException("Failed to store empty file " + filename);
        }
        if (filename.contains("..")) {
            throw new StorageFileException("Cannt store file with relative fileId: " + filename);
        }
        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, this.saveLocation.resolve(filename),
                    StandardCopyOption.REPLACE_EXISTING);
        }
        return this.saveLocation + "\\" + filename;
    }

    @Override
    @SneakyThrows
    public Stream<Path> loadAllAsStream() {
        return Files.walk(this.saveLocation, 1)
                .filter(path -> !path.equals(this.saveLocation))
                .map(this.saveLocation::relativize);
    }

    @Override
    public Path load(String filename) {
        return saveLocation.resolve(filename);
    }

    @Override
    public Resource loadAsResource(String filename) {
        try {
            Path file = load(filename);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists()) {
                if (resource.isReadable()) {
                    return resource;
                } else {
                    throw new StorageFileNotFoundException("Failed to read file: " + filename);
                }
            } else {
                throw new StorageFileNotFoundException("File does not exist: " + filename);
            }
        } catch (MalformedURLException e) {
            throw new StorageFileNotFoundException("Reading or opening file failed: " + filename, e);
        }
    }

    @Override
    public void deleteAll() {
        FileSystemUtils.deleteRecursively(saveLocation.toFile());
    }

    public boolean doesExist(String filename) {
        Path path = load(filename);
        File file = path.toFile();
        return file.exists() && !file.isDirectory();
    }

    public String getPath(String filename) {
        Path path = load(filename);
        File file = path.toFile();
        if (file.exists() && !file.isDirectory()) {
            return file.getPath();
        } else return null;
    }
}
