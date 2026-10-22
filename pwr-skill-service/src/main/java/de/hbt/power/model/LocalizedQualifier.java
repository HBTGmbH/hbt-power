package de.hbt.power.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
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
    @Fields({
            // not stored: the search returns the stored name of the skill, not the localization
            @Field(name = Skill.FIELD_NAME, analyzer = @Analyzer(definition = Skill.NAME_ANALYZER)),
            @Field(name = Skill.FIELD_AUTOCOMPLETE, analyzer = @Analyzer(definition = Skill.AUTOCOMPLETE_ANALYZER)),
            @Field(name = Skill.FIELD_EXACT, analyzer = @Analyzer(definition = Skill.EXACT_ANALYZER))
    })
    private String qualifier;

    /**
     * Inverse side of {@link Skill#getQualifiers()}, only for the search index. It was a second owning side that
     * described SKILL_QUALIFIERS with swapped columns (#93).
     */
    @ManyToMany(mappedBy = "qualifiers")
    @ContainedIn
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
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
