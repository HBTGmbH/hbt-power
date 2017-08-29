package de.hbt.pwr.view.model.entries.sort;

import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.service.ViewProfileSortService;

/**
 * Created by nt on 29.08.2017.
 */
public interface ProjectSortableFieldInvokeable {
    void invokeSort(ViewProfileSortService viewProfileSortService, ViewProfile viewProfile, Boolean doAscending);
}
