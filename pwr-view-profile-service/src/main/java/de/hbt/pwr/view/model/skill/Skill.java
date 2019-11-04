package de.hbt.pwr.view.model.skill;

import com.fasterxml.jackson.annotation.JsonBackReference;
import de.hbt.pwr.view.model.entries.ToggleableEntry;
import de.hbt.pwr.view.model.entries.sort.NameComparable;
import lombok.*;
import org.springframework.data.annotation.Transient;

@Data
@Builder
@NoArgsConstructor
@EqualsAndHashCode(exclude = {"rating", "enabled","displayCategory"})
@ToString(exclude = {"displayCategory"})
public class Skill implements ToggleableEntry, NameComparable {
    private Long id;
    private String name;
    private Integer rating;
    private Boolean enabled;

    @Transient
    @JsonBackReference(value = "refDisplaySkills")
    private Category displayCategory;

    public Skill(String name) {
        this.name = name;
    }

    public Skill(Long id, String name, Integer rating, Boolean enabled, Category displayCategory) {
        this.id = id;
        this.name = name;
        this.rating = rating;
        this.enabled = enabled;
        this.setDisplayCategory(displayCategory);
    }



    public void setDisplayCategory(Category displayCategory) {
        this.displayCategory = displayCategory;
        if (this.displayCategory != null && !this.displayCategory.getDisplaySkills().contains(this)) {
            this.displayCategory.getDisplaySkills().add(this);
        }
    }

}
