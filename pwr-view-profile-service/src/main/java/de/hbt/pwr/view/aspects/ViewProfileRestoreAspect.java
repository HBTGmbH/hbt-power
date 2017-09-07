package de.hbt.pwr.view.aspects;

import de.hbt.pwr.view.model.ViewProfile;
import org.apache.log4j.Logger;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class ViewProfileRestoreAspect {

    private static final Logger LOG = Logger.getLogger(ViewProfileRestoreAspect.class);

    /**
     * Defines a {@link Pointcut} that matches any method that is directly or indirectly
     * annotated with {@link ViewProfileAutoSave}. Indirectly annoated methods have the {@link ViewProfileAutoSave}
     * annotation on a class level.
     */
    @Pointcut("@annotation(ViewProfileRestore) || @within(ViewProfileRestore)")
    private void isRestore() {}


    @Pointcut("execution(public * *(..))") //this should work for the public pointcut
    private void isPublicOperation() {}


    private void restore(de.hbt.pwr.view.model.skill.Category category) {
        category.getSkills().forEach(skill -> skill.setCategory(category));
        category.getDisplaySkills().forEach(skill -> skill.setDisplayCategory(category));
        category.getChildren().forEach(child -> {
            child.setParent(category);
            restore(child);
        });
    }

    @Before("isRestore() && isPublicOperation() && args(viewProfile,..)")
    private void anyViewProfileRestorable(JoinPoint joinPoint, ViewProfile viewProfile) {
        LOG.debug(ViewProfileRestoreAspect.class + " invoked before " + joinPoint.getSignature().toString() + ". Performing bi reference restoring...");
        if(viewProfile != null) {
            restore(viewProfile.getRootCategory());
            LOG.debug("...done");
        } else {
            LOG.debug("... failed because param was null");
        }
    }
}
