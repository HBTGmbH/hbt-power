package de.hbt.pwr.view.aspects;

import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.Skill;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 */
@Aspect
@Component
public class ViewProfileRestoreAspect {

    private static final Logger LOG  = LogManager.getLogger(ViewProfileRestoreAspect.class);

    private void gatherSkills(Category category, Map<String, Skill> skills) {
        category.getSkills().forEach(skill -> skills.put(skill.getName(), skill));
        category.getDisplaySkills().forEach(skill -> skills.put(skill.getName(), skill));
        category.getChildren().forEach(child -> gatherSkills(child, skills));
    }


    private void restoreReferences(Category category, Map<String, Skill> skills, Map<String, Category> displayCategories) {
        List<Skill> originalSkills = category.getSkills();
        category.setSkills(new ArrayList<>());
        for (Skill originalSkill : originalSkills) {
            Skill skill = skills.get(originalSkill.getName());
            skill.setCategory(category);
        }

        if(!category.getDisplaySkills().isEmpty()) {
            List<Skill> originalDisplaySkills = category.getDisplaySkills();
            category.setDisplaySkills(new ArrayList<>());
            for (Skill originalSkill : originalDisplaySkills) {
                Skill skill = skills.get(originalSkill.getName());
                skill.setDisplayCategory(category);
            }
            displayCategories.put(category.getName(), category);
        }

        category.getChildren().forEach(child -> {
            child.setParent(category);
            restoreReferences(child, skills, displayCategories);
        });

        /*category.getSkills().forEach(skill -> skill.setCategory(category));
        category.getDisplaySkills().forEach(skill -> skill.setDisplayCategory(category));*/

    }

    private void restore(ViewProfile viewProfile) {
        Map<String, Skill> skills = new HashMap<>();
        Map<String, Category> displayCategories = new HashMap<>();
        gatherSkills(viewProfile.getRootCategory(), skills);
        restoreReferences(viewProfile.getRootCategory(), skills, displayCategories);

        List<Category> newDisplayCategories = viewProfile.getDisplayCategories()
                .stream()
                .map(category -> displayCategories.get(category.getName())).
                collect(Collectors.toList());
        viewProfile.setDisplayCategories(newDisplayCategories);




       /* // TODO include display category and make field transient
        category.getSkills().forEach(skill -> skill.setCategory(category));
        category.getDisplaySkills().forEach(skill -> skill.setDisplayCategory(category));
        category.getChildren().forEach(child -> {
            child.setParent(category);
            restore(child);
        });*/
    }

    @SuppressWarnings("unused")
    @Pointcut("this(de.hbt.pwr.view.repo.ViewProfileRepository)")
    private void isCrudRepo() {} //NOSONAR

    @AfterReturning(value = "isCrudRepo()", returning = "viewProfile", argNames = "joinPoint,viewProfile")
    private void anyViewProfileRestorable(JoinPoint joinPoint, Optional<?> viewProfile) { //NOSONAR
        LOG.debug(ViewProfileRestoreAspect.class + " invoked after returning from "
                + joinPoint.getSignature().toString() + ". Performing bi reference restoring...");
        if(viewProfile.isPresent()) {
            Object mayBeViewProfile = viewProfile.get();
            if (mayBeViewProfile instanceof ViewProfile) {
                LOG.debug("... done");
                restore((ViewProfile) mayBeViewProfile);
            } else {
                LOG.debug("... failed because of wrong class");
            }
        } else {
            LOG.debug("... failed because not present");
        }
    }
}
