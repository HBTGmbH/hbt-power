package de.hbt.model.view;

import com.fasterxml.jackson.annotation.JsonBackReference;

public class ViewSkill implements ViewEntry {
    private String name;
    private Integer rating;
    private Boolean enabled;

    @JsonBackReference(value = "refSkills")
    private ViewCategory category;

    @JsonBackReference(value = "refDisplaySkills")
    private ViewCategory displayCategory;

    public void setCategory(ViewCategory category) {
        this.category = category;
        if (this.category != null && !this.category.getSkills().contains(this)) {
            this.category.getSkills().add(this);
        }
    }

    public void setDisplayCategory(ViewCategory displayCategory) {
        this.displayCategory = displayCategory;
        if (this.displayCategory != null && !this.displayCategory.getDisplaySkills().contains(this)) {
            this.displayCategory.getDisplaySkills().add(this);
        }
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public ViewCategory getCategory() {
        return category;
    }

    public ViewCategory getDisplayCategory() {
        return displayCategory;
    }
}
