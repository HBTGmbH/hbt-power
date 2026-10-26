package de.hbt.pwr.profile.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks an endpoint that reads the profile of a consultant, which every user may read of the colleagues (#350). Only
 * what is marked is open: a new endpoint with <code>{initials}</code> in its path stays with the consultant and the
 * admins, like the profile check, the view profiles and the documents. Only for reading endpoints.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface ReadableByColleagues {
}
