package de.hbt.pwr.view.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * What a housekeeping check found (#242): how many, a few examples, or why the check could not run
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HousekeepingFindings {

    public static final int EXAMPLES = 10;

    /** Key of the check, the webclient names it */
    private String check;
    private long count;
    private List<String> examples;
    /** Set if the check could not run, e.g. because another service did not answer */
    private String error;

    public static HousekeepingFindings of(String check, List<String> findings) {
        return new HousekeepingFindings(check, findings.size(), findings.subList(0, Math.min(EXAMPLES, findings.size())), null);
    }

    public static HousekeepingFindings failed(String check, String error) {
        return new HousekeepingFindings(check, 0, List.of(), error);
    }
}
