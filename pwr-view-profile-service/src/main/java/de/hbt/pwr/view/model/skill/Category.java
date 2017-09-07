package de.hbt.pwr.view.model.skill;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import de.hbt.pwr.view.model.entries.ToggleableEntry;
import de.hbt.pwr.view.model.entries.sort.NameComparable;
import lombok.*;
import org.springframework.data.annotation.Transient;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"isDisplay", "parent", "skills", "children", "displaySkills"})
@ToString(exclude = {"parent", "skills", "children"})
public class Category implements ToggleableEntry, NameComparable {

    private String name;

    /**
     * Hard override to any display logic; If this flag is set, the category
     * servies as display category to all child skills, provided it is the only one.
     * First come,first serve principle (bottom-up, first category from the bottom with this flag wins)
     */
    @Builder.Default private Boolean isDisplay = false;

    @JsonBackReference
    @Transient
    private Category parent;

    private Boolean enabled;

    @JsonManagedReference(value = "refSkills")
    @Builder.Default private List<Skill> skills = new ArrayList<>();

    @JsonManagedReference(value = "refDisplaySkills")
    @Builder.Default private List<Skill> displaySkills = new ArrayList<>();

    @JsonManagedReference
    @Builder.Default private List<Category> children = new ArrayList<>();



    public Category(String name, Category parent) {
        this.name = name;
        this.setParent(parent);
    }

    public Category(String name, Boolean isDisplay, Category parent, Boolean enabled) {
        this.name = name;
        this.isDisplay = isDisplay;
        this.parent = parent;
        this.enabled = enabled;
    }

    public Category() {
        isDisplay = false;
        children = new ArrayList<>();
        displaySkills = new ArrayList<>();
        skills = new ArrayList<>();
    }

    public Category(Boolean enabled) {
        this.enabled = enabled;
    }

    public Category(String name) {
        this.name = name;
    }

    public void setParent(Category parent) {
        this.parent = parent;
        if(this.parent != null && !this.parent.getChildren().contains(this)) {
            this.parent.getChildren().add(this);
        }
    }

    public void setSkills(List<Skill> skills) {
        this.skills = skills;
        this.skills.forEach(skill -> skill.setCategory(this));
    }

    public void setDisplaySkills(List<Skill> displaySkills) {
        this.displaySkills = displaySkills;
        this.displaySkills.forEach(skill -> skill.setDisplayCategory(this));
    }

    public void setChildren(List<Category> children) {
        this.children = children;
        this.children.forEach(category -> category.setParent(category));
    }

    @Override
    public Boolean getEnabled() {
        return enabled;
    }

    @Override
    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }
}
