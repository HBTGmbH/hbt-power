package de.hbt.pwr.view.model.skill;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import de.hbt.pwr.view.model.entries.ToggleableEntry;
import de.hbt.pwr.view.model.entries.sort.NameComparable;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.annotation.Transient;

import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Data
@Builder
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"isDisplay", "displaySkills"})
public class Category implements ToggleableEntry, NameComparable {
    private Long id;
    private String name;

    /**
     * Hard override to any display logic; If this flag is set, the category
     * servies as display category to all child skills, provided it is the only one.
     * First come,first serve principle (bottom-up, first category from the bottom with this flag wins)
     */
    private Boolean isDisplay = false;

    private Boolean enabled;

    @JsonManagedReference(value = "refDisplaySkills")
    private List<Skill> displaySkills = new ArrayList<>();

    public Category(Long id, String name, Boolean isDisplay, Boolean enabled) {
        this.id = id;
        this.name = name;
        this.isDisplay = isDisplay;
        this.enabled = enabled;
    }

    public Category(String name, Boolean isDisplay, Boolean enabled) {
        this.name = name;
        this.isDisplay = isDisplay;
        this.enabled = enabled;
    }

    public Category() {
        id = -1L;
        isDisplay = false;
        displaySkills = new ArrayList<>();
    }

    public Category(Boolean enabled) {
        this.enabled = enabled;
    }

    public Category(String name) {
        this.name = name;
    }

    /**
     * Sets the displaySkills of this category and sets the displayCategory for the skills
     *
     * @param displaySkills the new list of displaySkills for this category
     */
    public void setDisplaySkills(List<Skill> displaySkills) {
        this.displaySkills = displaySkills;
        this.displaySkills.forEach(skill -> skill.setDisplayCategory(this));
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
