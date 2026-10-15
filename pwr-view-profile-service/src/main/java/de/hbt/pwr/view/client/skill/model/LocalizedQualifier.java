package de.hbt.pwr.view.client.skill.model;

import lombok.Data;

@Data
public class LocalizedQualifier {
    private String locale;
    private String qualifier;

    public LocalizedQualifier() {
    }

    public LocalizedQualifier(String locale, String qualifier) {
        this.locale = locale;
        this.qualifier = qualifier;
    }
}
