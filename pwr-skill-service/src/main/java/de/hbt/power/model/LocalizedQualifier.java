package de.hbt.power.model;

import lombok.Data;
import org.hibernate.search.annotations.Index;
import org.hibernate.search.annotations.*;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Localization entity that may be attached to any entity that has localizations.
 */
@Entity
@Table(name = "LOCALIZED_QUALIFIER")
@Data
@Indexed
public class LocalizedQualifier {
    @Id
    @Column(name = "ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    /**
     * Locale string. This is no enum to allow further flexibility.
     * <p>
     * Should be one of the constants defined in {@see Locale}, represented by their strings.
     * </p>
     */
    @Column(name = "LOCALE")
    @Field(index = Index.YES, analyze = Analyze.YES, store = Store.YES)
    private String locale;

    /**
     * The localized qualifier. UTF-8 encoding.
     */
    @Column(name = "QUALIFIER")
    @Field(index = Index.YES, analyze = Analyze.YES, store = Store.YES)
    private String qualifier;

    @ManyToMany
    @JoinTable(name = "SKILL_QUALIFIERS",
            joinColumns = @JoinColumn(name = "skill_id"),
            inverseJoinColumns = @JoinColumn(name = "qualifiers_id"))
    @ContainedIn
    private List<Skill> skills = new ArrayList<>();

    /**
     * Constructs a qualifier without an ID
     *
     * @param locale    the locale string
     * @param qualifier the localized qualifier.
     */
    LocalizedQualifier(String locale, String qualifier) {
        this.locale = locale;
        this.qualifier = qualifier;
    }

    public LocalizedQualifier() {
    }
}
