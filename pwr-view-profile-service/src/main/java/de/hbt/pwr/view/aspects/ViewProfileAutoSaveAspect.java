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

    @Pointcut("@annotation(ViewProfileAutoSave) || @within(ViewProfileAutoSave)")
    private void isAutoSave() {}

    @Pointcut("execution(public * *(..))") //this should work for the public pointcut
    private void isPublicOperation() {}

    @After("isAutoSave() && isPublicOperation() && args(viewProfile,..)")
    private void anyViewProfileSavable(JoinPoint joinPoint, ViewProfile viewProfile) {
        LOG.debug(ViewProfileAutoSaveAspect.class + " invoked around " + joinPoint.getSignature().toString() + ". Performing auto-save...");
        if(viewProfile != null) {
            viewProfileRepository.save(viewProfile);
            LOG.debug("...done.");
        } else {
            LOG.debug("...failed because param was null.");
        }
    }

}
