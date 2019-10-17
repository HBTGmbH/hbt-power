package de.hbt.service;

import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.stream.Stream;

@Service
public interface StorageService {
    void init(String path);

    String store(MultipartFile file);

    Stream<Path> loadAllAsStream();

    Path load(String filename);

    Resource loadAsResource(String filename);

    void deleteAll();
}
