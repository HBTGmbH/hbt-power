package de.hbt.pwr.view.model.entries;

import com.sun.org.apache.xpath.internal.operations.Bool;

/**
 * Created by nt on 23.08.2017.
 */
public interface ToggleableEntry {
    Boolean getEnabled();
    void setEnabled(Boolean enabled);
}
