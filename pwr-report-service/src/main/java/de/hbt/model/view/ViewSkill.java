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
    /** The name in the language of the view profile (#174), null for the name of the skill tree */
    private String localizedName;
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
