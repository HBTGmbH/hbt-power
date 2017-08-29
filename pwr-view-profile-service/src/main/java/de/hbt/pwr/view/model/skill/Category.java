package de.hbt.pwr.view.model.skill;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.google.common.base.Objects;
import lombok.*;
import org.springframework.data.annotation.Transient;
import sun.util.resources.cldr.teo.CalendarData_teo_KE;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"isDisplay", "parent", "parent", "skills", "children"})
public class Category {

    private String name;

    @Builder.Default private Boolean isDisplay = false;

    @JsonBackReference
    @Transient
    private Category parent;

    @JsonManagedReference(value = "refSkills")
    @Builder.Default private List<Skill> skills = new ArrayList<>();

    @JsonManagedReference(value = "refDisplaySkills")
    @Builder.Default private List<Skill> displaySkills = new ArrayList<>();

    @JsonManagedReference
    @Builder.Default private List<Category> children = new ArrayList<>();


    public Category() {
        isDisplay = false;
        children = new ArrayList<>();
        displaySkills = new ArrayList<>();
        skills = new ArrayList<>();
    }

    public Category(String name) {
        this();
        this.name = name;
    }

    public void setParent(Category parent) {
        this.parent = parent;
        if(this.parent != null && !this.parent.getChildren().contains(this)) {
            this.parent.getChildren().add(this);
        }
    }


    @Override
    public String toString() {
        return "Category{" +
                "name='" + name + '\'' +
                ", isDisplay=" + isDisplay +
                '}';
    }
}
