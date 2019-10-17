package de.hbt.model.view;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import org.springframework.data.annotation.Transient;

import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

public class ViewCategory implements ViewEntry {

    private String name;

    /**
     * Hard override to any display logic; If this flag is set, the category
     * servies as display category to all child skills, provided it is the only one.
     * First come,first serve principle (bottom-up, first category from the bottom with this flag wins)
     */
    private Boolean isDisplay = false;

    @JsonBackReference
    @Transient
    private ViewCategory parent;

    private Boolean enabled;

    @JsonManagedReference(value = "refSkills")
    private List<ViewSkill> skills = new ArrayList<>();

    @JsonManagedReference(value = "refDisplaySkills")
    private List<ViewSkill> displaySkills = new ArrayList<>();

    @JsonManagedReference
    private List<ViewCategory> children = new ArrayList<>();


    public void setParent(ViewCategory parent) {
        this.parent = parent;
        if (this.parent != null && !this.parent.getChildren().contains(this)) {
            this.parent.getChildren().add(this);
        }
    }

    public void setSkills(List<ViewSkill> skills) {
        this.skills = skills;
        this.skills.forEach(skill -> skill.setCategory(this));
    }

    public void setDisplaySkills(List<ViewSkill> displaySkills) {
        this.displaySkills = displaySkills;
        this.displaySkills.forEach(skill -> skill.setDisplayCategory(this));
    }

    public void setChildren(List<ViewCategory> children) {
        this.children = children;
        this.children.forEach(category -> category.setParent(category));
    }

    public boolean containsCategoryWithName(@NotNull String nameToFind) {
        return nameToFind.equals(name)
                || children.stream().anyMatch(category -> category.containsCategoryWithName(nameToFind));
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Boolean getDisplay() {
        return isDisplay;
    }

    public void setDisplay(Boolean display) {
        isDisplay = display;
    }

    public ViewCategory getParent() {
        return parent;
    }

    @Override
    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public List<ViewSkill> getSkills() {
        return skills;
    }

    public List<ViewSkill> getDisplaySkills() {
        return displaySkills;
    }

    public List<ViewCategory> getChildren() {
        return children;
    }
}
