package de.hbt.pwr.view.model.entries.sort;

import de.hbt.pwr.view.model.ViewProfile;

import java.util.List;

/**
 * @author nt (nt@hbt.de)
 */
public interface StartEndDateComparableEntry {
    List<? extends StartEndDateComparable> getComparable(ViewProfile viewProfile);
}
