package de.hbt.pwr.view.model.entries;

import de.hbt.pwr.view.model.ViewProfile;

import java.util.List;

/**
 * Defines that the given value represents a {@link ToggleableEntry} of the {@link ViewProfile}
 * @author nt nt@hbt.de
 * @since 29.09.2017
 */
public interface ToggleableExtractable {
    List<? extends ToggleableEntry> getToggleable(ViewProfile viewProfile);
}
