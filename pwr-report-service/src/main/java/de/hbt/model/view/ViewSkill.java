package de.hbt.model.view;

import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class ViewSkill implements ViewEntry {
    private String name;
    private Integer rating;
    private Boolean enabled;

    private List<ViewSkillVersion> versions = new ArrayList<>();

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
}
