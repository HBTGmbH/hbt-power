package de.hbt.power.model;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.hibernate.search.annotations.Index;
import org.hibernate.search.annotations.*;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

@Entity
@Table(name = "SKILL")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Indexed
// Because we are using Entities as DTOs, we need to exclude these
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class Skill {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne()
    @JoinColumn(name = "category_id")
    private SkillCategory category;

    @Column(name = "QUALIFIER")
    @Field(index = Index.YES, analyze = Analyze.YES, store = Store.YES)
    private String qualifier;

    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(name = "SKILL_QUALIFIERS",
            joinColumns = @JoinColumn(name = "skill_id"),
            inverseJoinColumns = @JoinColumn(name = "qualifiers_id"))
    @IndexedEmbedded
    private Set<LocalizedQualifier> qualifiers = new HashSet<>();

    @Column(name = "is_custom")
    private boolean custom = false;


    @ElementCollection
    private Set<String> versions = new HashSet<>();

    public Skill(String qualifier, Set<LocalizedQualifier> qualifiers, SkillCategory category) {
        this.qualifier = qualifier;
        this.category = category;
        this.qualifiers = qualifiers;
    }

    public static Skill of(String qualifier) {
        Skill skill = new Skill();
        skill.setQualifier(qualifier);
        return skill;
    }

    public void addLocale(Locale locale, String qualifier) {
        this.qualifiers.add(new LocalizedQualifier(locale.getISO3Language(), qualifier));
    }

    public void removeLocale(Locale locale) {
        this.qualifiers.removeIf(localizedQualifier -> localizedQualifier.getLocale().equals(locale.getISO3Language()));
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((id == null) ? 0 : id.hashCode());
        return result;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null)
            return false;
        if (getClass() != obj.getClass())
            return false;
        Skill other = (Skill) obj;
        if (id == null) {
            return other.id == null;
        } else return id.equals(other.id);
    }

    @Override
    public String toString() {
        return "Skill{" +
                "id=" + id +
                ", categoryId=" + (category == null ? null : category.getId()) +
                ", qualifier='" + qualifier + '\'' +
                ", custom=" + custom +
                '}';
    }
}
