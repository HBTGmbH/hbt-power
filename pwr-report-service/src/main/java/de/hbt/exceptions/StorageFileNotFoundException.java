package de.hbt.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Answered with 404 instead of 500 (#112)
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class StorageFileNotFoundException extends StorageFileException {

    public StorageFileNotFoundException(String message) {
        super(message);
    }

}
