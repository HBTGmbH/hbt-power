package de.hbt.pwr.view.service;



import de.hbt.pwr.view.exception.StorageException;
import de.hbt.pwr.view.exception.StorageFileNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.stream.Stream;

@Service
public class FileSystemStorageService implements StorageService {

    //@Value("${export.designFileDirectory}")
    private Path saveLocation = Paths.get("D:\\mp\\Projekte\\HBT-Power2\\pwr-report-service\\src\\main\\resources\\templates\\");


    @Override
    public void init() {
        try {
            Files.createDirectories(saveLocation);
        }
        catch (IOException e){
            throw new StorageException("Could not initialize storage",e);
        }
    }

    @Override
    public void store(MultipartFile file) {
        String filename = StringUtils.cleanPath(file.getOriginalFilename());

        try {
            if (file.isEmpty()){
                throw new StorageException("Failed to store empty file "+filename);
            }
            if (filename.contains("..")){
                throw new StorageException("Cannt store file with relative path: "+filename);
            }
            try(InputStream inputStream = file.getInputStream()){
                Files.copy(inputStream, this.saveLocation.resolve(filename),
                        StandardCopyOption.REPLACE_EXISTING);
            }
        }catch (IOException e){
            throw new StorageException("Failed to store file "+ filename, e);
        }
    }

    @Override
    public Stream<Path> loadAll() {
        try {
            return Files.walk(this.saveLocation, 1)
                    .filter(path -> !path.equals(this.saveLocation))
                    .map(this.saveLocation::relativize);
        }
        catch (IOException e){
            throw new StorageException("Failed to read stored files",e);
        }
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
            if(resource.exists() || resource.isReadable()){
                return resource;
            }
            else {
                throw new StorageFileNotFoundException("Failed to read file: "+filename);
            }
        }
        catch (MalformedURLException e){
            throw new StorageFileNotFoundException("Failed to read file "+filename,e);
        }
    }

    @Override
    public void deleteAll() {
        FileSystemUtils.deleteRecursively(saveLocation.toFile());
    }
}
