package de.hbt.pwr.view.model.entries.sort;

import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.entries.ToggleableEntry;

import java.util.List;

/**
 * Created by nt on 29.08.2017.
 */
public interface ToggleableType {
    List<? extends ToggleableEntry> getToggleable(ViewProfile viewProfile);
}
