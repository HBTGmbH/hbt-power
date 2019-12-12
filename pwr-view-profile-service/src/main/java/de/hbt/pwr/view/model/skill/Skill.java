package de.hbt.pwr.view.model.skill;

import com.fasterxml.jackson.annotation.JsonBackReference;
import de.hbt.pwr.view.model.entries.ToggleableEntry;
import de.hbt.pwr.view.model.entries.sort.NameComparable;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.annotation.Transient;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Data
@Builder
@NoArgsConstructor
@EqualsAndHashCode(exclude = {"rating", "enabled", "displayCategory"})
@ToString(exclude = {"displayCategory"})
public class Skill implements ToggleableEntry, NameComparable {
    private Long id;
    private String name;
    private Integer rating;
    private Boolean enabled;

    private List<SkillVersion> versions;

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

    public Skill(Long id, String name, Integer rating, Boolean enabled, List<SkillVersion> versions, Category displayCategory) {
        this.id = id;
        this.name = name;
        this.rating = rating;
        this.enabled = enabled;
        this.setDisplayCategory(displayCategory);
        this.versions = versions;
    }

    public void setVersions(List<String> names) {
        this.versions = new ArrayList<>();
        if (names != null) {
            for (String name : names) {
                this.getVersions().add(new SkillVersion(name, true));
            }
        }
    }

    public void setEnabledForVersion(String versionName, boolean isEnabled) {
        SkillVersion version = this.versions.stream()
                .filter(skillVersion -> skillVersion.getName().equals(versionName)).findFirst()
                .orElseThrow(RuntimeException::new);
        version.setEnabled(isEnabled);
    }


    public void setDisplayCategory(Category displayCategory) {
        this.displayCategory = displayCategory;
        if (this.displayCategory != null && !this.displayCategory.getDisplaySkills().contains(this)) {
            this.displayCategory.getDisplaySkills().add(this);
        }
    }

}
