package de.hbt.pwr.view.model.skill;

import com.fasterxml.jackson.annotation.JsonBackReference;
import de.hbt.pwr.view.model.entries.ToggleableEntry;
import de.hbt.pwr.view.model.entries.sort.NameComparable;
import lombok.*;
import org.springframework.data.annotation.Transient;

@Data
@Builder
@NoArgsConstructor
@EqualsAndHashCode(exclude = {"rating", "enabled", "category", "displayCategory"})
@ToString(exclude = {"category", "displayCategory"})
public class Skill implements ToggleableEntry, NameComparable {
    private String name;
    private Integer rating;
    private Boolean enabled;

    @JsonBackReference(value = "refSkills")
    @Transient
    private Category category;

    @Transient
    @JsonBackReference(value = "refDisplaySkills")
    private Category displayCategory;

    public Skill(String name) {
        this.name = name;
    }

    public Skill(String name, Integer rating, Boolean enabled, Category category, Category displayCategory) {
        this.name = name;
        this.rating = rating;
        this.enabled = enabled;
        this.setCategory(category);
        this.setDisplayCategory(displayCategory);
    }

    public void setCategory(Category category) {
        this.category = category;
        if(this.category != null && !this.category.getSkills().contains(this)) {
            this.category.getSkills().add(this);
        }
    }

    public void setDisplayCategory(Category displayCategory) {
        this.displayCategory = displayCategory;
        if(this.displayCategory != null && !this.displayCategory.getDisplaySkills().contains(this)) {
            this.displayCategory.getDisplaySkills().add(this);
        }
    }

}
