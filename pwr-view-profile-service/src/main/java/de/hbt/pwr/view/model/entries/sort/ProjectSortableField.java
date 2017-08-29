package de.hbt.pwr.view.model.entries.sort;

import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.service.ViewProfileSortService;

/**
 * Defines fields of a {@link de.hbt.pwr.view.model.entries.Project} that are sortable.
 * @author nt
 * @since 29.08.2017
 */
public enum ProjectSortableField implements ProjectSortableFieldInvokeable {
    START_DATE {
        @Override
        public void invokeSort(ViewProfileSortService viewProfileSortService, ViewProfile viewProfile, Boolean doAscending) {
            viewProfileSortService.sortProjectsByStartDate(viewProfile, doAscending);
        }
    },
    END_DATE {
        @Override
        public void invokeSort(ViewProfileSortService viewProfileSortService, ViewProfile viewProfile, Boolean doAscending) {
            viewProfileSortService.sortProjectsByEndDate(viewProfile, doAscending);
        }
    }

}
