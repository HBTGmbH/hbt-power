package de.hbt.pwr.view.model.entries.sort;

import de.hbt.pwr.view.model.ViewProfile;

import java.util.List;

/**
 * Created by nt on 30.08.2017.
 */
public interface NameComparableEntry {
    List<? extends NameComparable> getComparable(ViewProfile viewProfile);
}
