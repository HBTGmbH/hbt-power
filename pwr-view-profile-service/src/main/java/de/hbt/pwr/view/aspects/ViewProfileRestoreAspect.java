package de.hbt.pwr.view.aspects;

import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.skill.Category;
import org.apache.log4j.Logger;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

import java.io.Serializable;

/**
 */
@Aspect
@Component
public class ViewProfileRestoreAspect {

    private static final Logger LOG = Logger.getLogger(ViewProfileRestoreAspect.class);

    private void restore(Category category) {
        category.getSkills().forEach(skill -> skill.setCategory(category));
        category.getDisplaySkills().forEach(skill -> skill.setDisplayCategory(category));
        category.getChildren().forEach(child -> {
            child.setParent(category);
            restore(child);
        });
    }

    @SuppressWarnings("unused")
    @Pointcut("this(org.springframework.data.repository.CrudRepository)")
    private void isCrudRepo() {} //NOSONAR


    @AfterReturning(value = "isCrudRepo() && args(serializable)", returning = "viewProfile", argNames = "joinPoint,viewProfile,serializable")
    private void anyViewProfileRestorable(JoinPoint joinPoint, ViewProfile viewProfile, Serializable serializable) { //NOSONAR
        LOG.debug(ViewProfileRestoreAspect.class + " invoked after returning from "
                + joinPoint.getSignature().toString() + ". Performing bi reference restoring...");
        if(viewProfile != null) {
            restore(viewProfile.getRootCategory());
            LOG.debug("... done");
        } else {
            LOG.debug("... failed because param was null");
        }
    }
}
