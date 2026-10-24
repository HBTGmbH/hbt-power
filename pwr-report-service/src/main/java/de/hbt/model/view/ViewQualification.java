package de.hbt.model.view;


import java.time.LocalDate;

public class ViewQualification implements ViewEntry {
    private String name;
    private LocalDate date;
    private Boolean enabled;
    private String localizedName;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }
    /** The name in the language of the view profile (#291), null without a localization */
    public String getLocalizedName() {
        return localizedName;
    }

    public void setLocalizedName(String localizedName) {
        this.localizedName = localizedName;
    }
}
