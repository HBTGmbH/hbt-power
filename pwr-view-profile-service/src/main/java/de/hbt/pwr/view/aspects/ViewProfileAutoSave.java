package de.hbt.pwr.view.aspects;

import de.hbt.pwr.view.model.ViewProfile;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;


/**
 * Defines that the annotated method or class allows auto-saving of a {@link ViewProfile} after
 * they have been invoked. Is closely coupled with the {@link ViewProfileAutoSaveAspect}
 * <p>
 *     Under the following conditions, a {@link ViewProfile} is automatically saved
 *     <ul>
 *         <li>The method or the class of the method is annotated with {@link ViewProfileAutoSave}</li>
 *         <li>The method is public</li>
 *         <li>The method's first parameter is named <code>viewProfile</code> and is of type {@link ViewProfile}</li>
 *         <li>The <code>viewProfile</code> is not null</li>
 *     </ul>
 * </p>
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.TYPE})
public @interface ViewProfileAutoSave {
}
