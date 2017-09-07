package de.hbt.pwr.view.aspects;

import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.Skill;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Invokes restoration of bi-references between {@link Skill} and {@link Category}
 * <p>
 *     Works under the following circumstances
 *     <ul>
 *         <li>The method or class is annotated with {@link ViewProfileRestore}</li>
 *         <li>The method is public</li>
 *         <li>The methods first param is a {@link ViewProfile}</li>
 *     </ul>
 * </p>
 * @see ViewProfileRestoreAspect
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.TYPE})
public @interface ViewProfileRestore {
}
