package de.hbt.pwr.view.model.entries.sort;

import de.hbt.pwr.view.model.ViewProfile;

import java.util.List;

/**
 * Defines a {@link ViewProfile} entry that implements the {@link NameComparable} interface.
 * Used to avoid switches; Instead, implemented by {@link NameComparableEntryType} to
 * return the correct collection.
 */
public interface NameComparableEntry {
    List<? extends NameComparable> getComparable(ViewProfile viewProfile);
}
