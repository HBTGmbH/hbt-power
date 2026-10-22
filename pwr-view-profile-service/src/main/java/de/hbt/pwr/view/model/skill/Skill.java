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
@Builder(toBuilder = true)
@NoArgsConstructor
@EqualsAndHashCode(exclude = {"rating", "enabled", "displayCategory", "localizedName"})
@ToString(exclude = {"displayCategory"})
public class Skill implements ToggleableEntry, NameComparable {
    private Long id;
    private String name;
    private Integer rating;
    private Boolean enabled;

    private List<SkillVersion> versions;

    /**
     * The name in the language of the view profile (#174), if the skill has a localization for it; the name stays the
     * key. Filled by {@link de.hbt.pwr.view.service.ViewProfileLocalizationService}.
     */
    private String localizedName;

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

    /**
     * All fields, in their order, for the builder: like the others, it puts the skill into its display category
     */
    public Skill(Long id, String name, Integer rating, Boolean enabled, List<SkillVersion> versions, String localizedName,
                 Category displayCategory) {
        this(id, name, rating, enabled, versions, displayCategory);
        this.localizedName = localizedName;
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
