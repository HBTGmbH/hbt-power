package de.hbt.power.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

@Entity
@Table(name = "SKILL_CATEGORY")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
// Because we are using Entities as DTOs, we need to exclude these
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class SkillCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "qualifier")
    private String qualifier;

    @ManyToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinTable(name = "SKILL_CATEGORY_QUALIFIERS",
            joinColumns = @JoinColumn(name = "qualifiers_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_category_id")
    )
    private Set<LocalizedQualifier> qualifiers = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private SkillCategory category;

    @Column(name = "is_blacklisted", nullable = false)
    private boolean blacklisted = false;

    @Column(name = "is_custom", nullable = false)
    private boolean custom = false;

    @Column(name = "is_display", nullable = false)
    private boolean display = false;

    public SkillCategory(String qualifier, Set<LocalizedQualifier> qualifiers, SkillCategory category) {
        this.qualifier = qualifier;
        this.qualifiers = qualifiers;
        setCategory(category);
    }

    public static SkillCategory custom(String qualifier) {
        return new SkillCategory(null, qualifier, new HashSet<>(), null, false, true, false);
    }

    public static SkillCategory of(String qualifier) {
        return new SkillCategory(null, qualifier, new HashSet<>(), null, false, false, false);
    }

    public static SkillCategory of(String qualifier, SkillCategory parent) {
        return new SkillCategory(qualifier, new HashSet<>(), parent);
    }

    public void addLocale(Locale locale, String qualifier) {
        LocalizedQualifier localizedQualifier = new LocalizedQualifier(locale.getISO3Language(), qualifier);
        // Remove any previous qualifiers for the same language
        removeLocale(locale);
        qualifiers.add(localizedQualifier);
    }

    public void removeLocale(Locale locale) {
        qualifiers.removeIf(localizedQualifier -> localizedQualifier.getLocale().equals(locale.getISO3Language()));
    }

    public boolean hasTransitiveParent(SkillCategory skillCategory) {
        // Has no parent; Termiante recursion, not found
        if (this.category == null) {
            return false;
            // Has a parent and is the same as the requested category; Terminate with found
        } else if (this.category.equals(skillCategory)) {
            return true;
        } else {
            return this.category.hasTransitiveParent(skillCategory);
        }
    }

    @Override
    public String toString() {
        return "SkillCategory{" +
                "id=" + id +
                ", qualifier='" + qualifier + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        SkillCategory that = (SkillCategory) o;

        if (blacklisted != that.blacklisted) return false;
        if (custom != that.custom) return false;
        if (id != null ? !id.equals(that.id) : that.id != null) return false;
        return qualifier != null ? qualifier.equals(that.qualifier) : that.qualifier == null;
    }

    @Override
    public int hashCode() {
        int result = id != null ? id.hashCode() : 0;
        result = 31 * result + (qualifier != null ? qualifier.hashCode() : 0);
        result = 31 * result + (blacklisted ? 1 : 0);
        result = 31 * result + (custom ? 1 : 0);
        return result;
    }
}
