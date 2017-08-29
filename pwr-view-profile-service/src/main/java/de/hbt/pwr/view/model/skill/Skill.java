package de.hbt.pwr.view.model.skill;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import de.hbt.pwr.view.model.entries.ToggleableEntry;
import lombok.*;
import org.springframework.data.annotation.Transient;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"rating", "enabled", "category"})
public class Skill implements ToggleableEntry {
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

    public void setCategory(Category category) {
        this.category = category;
        if(this.category != null && !this.category.getSkills().contains(this)) {
            this.category.getSkills().add(this);
        }
    }

    public void setDisplayCategory(Category displayCategory) {
        this.displayCategory = displayCategory;
        if(this.displayCategory != null && !this.displayCategory.getSkills().contains(this)) {
            this.displayCategory.getDisplaySkills().add(this);
        }
    }

}
