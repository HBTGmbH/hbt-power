package de.hbt.exceptions;

public class StorageFileException extends RuntimeException {

    public StorageFileException(String message) {
        super(message);
    }

    public StorageFileException(String message, Throwable cause) {
        super(message, cause);
    }
}
