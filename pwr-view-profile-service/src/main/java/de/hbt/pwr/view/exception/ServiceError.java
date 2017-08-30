package de.hbt.pwr.view.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class ServiceError {
    public ServiceOuterError serviceOuterError;
}
