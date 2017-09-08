package de.hbt.pwr.view.aspects;

import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.repo.ViewProfileRepository;
import org.apache.log4j.Logger;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.After;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


/**
 * @see ViewProfileAutoSave
 * @author nt (nt@hbt.de)
 */
@Aspect
@Component
public class ViewProfileAutoSaveAspect {

    private static final Logger LOG = Logger.getLogger(ViewProfileAutoSave.class);

    private final ViewProfileRepository viewProfileRepository;

    @Autowired
    public ViewProfileAutoSaveAspect(ViewProfileRepository viewProfileRepository) {
        this.viewProfileRepository = viewProfileRepository;
    }

    /**
     * Defines a {@link Pointcut} that matches any method that is directly or indirectly
     * annotated with {@link ViewProfileAutoSave}. Indirectly annoated methods have the {@link ViewProfileAutoSave}
     * annotation on a class level.
     */
    @SuppressWarnings("unused")
    @Pointcut("@annotation(ViewProfileAutoSave) || @within(ViewProfileAutoSave)")
    private void isAutoSave() {/* Empty because it merely defines the pointcut and the annotation needs a target */} //NOSONAR

    @SuppressWarnings("unused")
    @Pointcut("execution(public * *(..))")
    private void isPublicOperation() {/* Empty because it merely defines the pointcut and the annotation needs a target */} //NOSONAR

    /**
     * Advice triggered when auto save of {@link ViewProfile} is supposed to happen.
     */
    @After("isAutoSave() && isPublicOperation() && args(viewProfile,..)")
    private void anyViewProfileSavable(JoinPoint joinPoint, ViewProfile viewProfile) { //NOSONAR
        LOG.debug(ViewProfileAutoSaveAspect.class + " invoked after " + joinPoint.getSignature().toString() + ". Performing auto-save...");
        if(viewProfile != null) {
            viewProfileRepository.save(viewProfile);
            LOG.debug("...done.");
        } else {
            LOG.debug("...failed because param was null.");
        }
    }
}