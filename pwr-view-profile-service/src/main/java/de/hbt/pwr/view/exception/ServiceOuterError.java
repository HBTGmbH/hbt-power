package de.hbt.pwr.view.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
class ServiceOuterError {
    private String code;
    private String message;
    private String target;
    private Object innerError;
}
