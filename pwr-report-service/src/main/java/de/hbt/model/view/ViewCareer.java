package de.hbt.model.view;


import java.time.LocalDate;

public class ViewCareer implements ViewEntry {
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean enabled;
    private String localizedName;

    public ViewCareer() {
    }

    public ViewCareer(String name, LocalDate startDate, LocalDate endDate, Boolean enabled) {
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.enabled = enabled;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    @Override
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
