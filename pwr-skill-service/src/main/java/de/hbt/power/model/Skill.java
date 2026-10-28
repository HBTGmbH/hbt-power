package de.hbt.power.model;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.search.annotations.Index;
import org.apache.lucene.analysis.core.KeywordTokenizerFactory;
import org.apache.lucene.analysis.core.LowerCaseFilterFactory;
import org.apache.lucene.analysis.miscellaneous.ASCIIFoldingFilterFactory;
import org.apache.lucene.analysis.miscellaneous.RemoveDuplicatesTokenFilterFactory;
import org.apache.lucene.analysis.miscellaneous.TrimFilterFactory;
import org.apache.lucene.analysis.miscellaneous.WordDelimiterFilterFactory;
import org.apache.lucene.analysis.ngram.EdgeNGramFilterFactory;
import org.apache.lucene.analysis.pattern.PatternTokenizerFactory;
import org.apache.lucene.analysis.shingle.ShingleFilterFactory;
import org.hibernate.search.annotations.*;
import org.hibernate.search.annotations.Parameter;

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
@AnalyzerDefs({
        // Words of a skill name: keeps terms like C++, C#, .NET or Node.js and additionally splits them
        // (SpringBoot -> spring, boot, springboot; Java8 -> java, 8), case and accent insensitive
        @AnalyzerDef(name = Skill.NAME_ANALYZER,
                tokenizer = @TokenizerDef(factory = PatternTokenizerFactory.class,
                        params = @Parameter(name = "pattern", value = "[\\s/,;()\\[\\]]+")),
                filters = {
                        @TokenFilterDef(factory = WordDelimiterFilterFactory.class, params = {
                                @Parameter(name = "preserveOriginal", value = "1"),
                                @Parameter(name = "generateWordParts", value = "1"),
                                @Parameter(name = "generateNumberParts", value = "1"),
                                @Parameter(name = "catenateWords", value = "1"),
                                @Parameter(name = "splitOnCaseChange", value = "1"),
                                @Parameter(name = "splitOnNumerics", value = "1"),
                                @Parameter(name = "stemEnglishPossessive", value = "0")}),
                        @TokenFilterDef(factory = LowerCaseFilterFactory.class),
                        @TokenFilterDef(factory = ASCIIFoldingFilterFactory.class),
                        @TokenFilterDef(factory = RemoveDuplicatesTokenFilterFactory.class)}),
        // Index side of the type-ahead field: every word start of the name analyzer's terms
        @AnalyzerDef(name = Skill.AUTOCOMPLETE_ANALYZER,
                tokenizer = @TokenizerDef(factory = PatternTokenizerFactory.class,
                        params = @Parameter(name = "pattern", value = "[\\s/,;()\\[\\]]+")),
                filters = {
                        @TokenFilterDef(factory = WordDelimiterFilterFactory.class, params = {
                                @Parameter(name = "preserveOriginal", value = "1"),
                                @Parameter(name = "generateWordParts", value = "1"),
                                @Parameter(name = "generateNumberParts", value = "1"),
                                @Parameter(name = "catenateWords", value = "1"),
                                @Parameter(name = "splitOnCaseChange", value = "1"),
                                @Parameter(name = "splitOnNumerics", value = "1"),
                                @Parameter(name = "stemEnglishPossessive", value = "0")}),
                        @TokenFilterDef(factory = LowerCaseFilterFactory.class),
                        @TokenFilterDef(factory = ASCIIFoldingFilterFactory.class),
                        // Spring Boot is also found as "SpringBoot" or "springbo"
                        @TokenFilterDef(factory = ShingleFilterFactory.class, params = {
                                @Parameter(name = "minShingleSize", value = "2"),
                                @Parameter(name = "maxShingleSize", value = "3"),
                                @Parameter(name = "tokenSeparator", value = ""),
                                @Parameter(name = "outputUnigrams", value = "true")}),
                        @TokenFilterDef(factory = EdgeNGramFilterFactory.class, params = {
                                @Parameter(name = "minGramSize", value = "1"),
                                @Parameter(name = "maxGramSize", value = "50")}),
                        // JavaScript yields "jav" from javascript and from java: count it once, so Java ranks before it
                        @TokenFilterDef(factory = RemoveDuplicatesTokenFilterFactory.class)}),
        // Search input: split like a name, but not at case changes, since users type in any case ("jAv")
        @AnalyzerDef(name = Skill.QUERY_ANALYZER,
                tokenizer = @TokenizerDef(factory = PatternTokenizerFactory.class,
                        params = @Parameter(name = "pattern", value = "[\\s/,;()\\[\\]]+")),
                filters = {
                        @TokenFilterDef(factory = WordDelimiterFilterFactory.class, params = {
                                @Parameter(name = "preserveOriginal", value = "1"),
                                @Parameter(name = "generateWordParts", value = "1"),
                                @Parameter(name = "generateNumberParts", value = "1"),
                                @Parameter(name = "splitOnCaseChange", value = "0"),
                                @Parameter(name = "splitOnNumerics", value = "1"),
                                @Parameter(name = "stemEnglishPossessive", value = "0")}),
                        @TokenFilterDef(factory = LowerCaseFilterFactory.class),
                        @TokenFilterDef(factory = ASCIIFoldingFilterFactory.class),
                        @TokenFilterDef(factory = RemoveDuplicatesTokenFilterFactory.class)}),
        // The whole name as one term, for exact matches; spaces at the ends do not count ("JS " in profiles)
        @AnalyzerDef(name = Skill.EXACT_ANALYZER,
                tokenizer = @TokenizerDef(factory = KeywordTokenizerFactory.class),
                filters = {
                        @TokenFilterDef(factory = TrimFilterFactory.class),
                        @TokenFilterDef(factory = LowerCaseFilterFactory.class),
                        @TokenFilterDef(factory = ASCIIFoldingFilterFactory.class)})
})
// Because we are using Entities as DTOs, we need to exclude these
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class Skill {

    public static final String NAME_ANALYZER = "skillName";
    public static final String AUTOCOMPLETE_ANALYZER = "skillNameAutocomplete";
    public static final String EXACT_ANALYZER = "skillNameExact";
    public static final String QUERY_ANALYZER = "skillNameQuery";

    public static final String FIELD_NAME = "qualifier";
    public static final String FIELD_AUTOCOMPLETE = "qualifier_autocomplete";
    public static final String FIELD_EXACT = "qualifier_exact";
    public static final String FIELD_ALIAS_NAME = "alias";
    public static final String FIELD_ALIAS_AUTOCOMPLETE = "alias_autocomplete";
    public static final String FIELD_ALIAS_EXACT = "alias_exact";


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne()
    @JoinColumn(name = "category_id")
    private SkillCategory category;

    @Column(name = "QUALIFIER")
    @Fields({
            @Field(name = FIELD_NAME, analyzer = @Analyzer(definition = NAME_ANALYZER), store = Store.YES),
            @Field(name = FIELD_AUTOCOMPLETE, analyzer = @Analyzer(definition = AUTOCOMPLETE_ANALYZER)),
            @Field(name = FIELD_EXACT, analyzer = @Analyzer(definition = EXACT_ANALYZER))
    })
    private String qualifier;

    // Eager: the JSON of a skill otherwise has no localizations (null for a collection that was not loaded, #93)
    @ManyToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinTable(name = "SKILL_QUALIFIERS",
            joinColumns = @JoinColumn(name = "skill_id"),
            inverseJoinColumns = @JoinColumn(name = "qualifiers_id"))
    // Localizations are searched in the same fields as the name, so they share term statistics and field length
    @IndexedEmbedded(prefix = "", includePaths = {FIELD_NAME, FIELD_AUTOCOMPLETE, FIELD_EXACT})
    private Set<LocalizedQualifier> qualifiers = new HashSet<>();

    @Column(name = "is_custom")
    private boolean custom = false;

    @ElementCollection(fetch = FetchType.EAGER)
    private Set<String> versions = new HashSet<>();

    /**
     * Other spellings of this skill (K8S for Kubernetes). An alias is unique across all skills, ignoring case,
     * and never the name of another skill; {@link de.hbt.power.service.SkillService} checks both.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "SKILL_ALIAS", joinColumns = @JoinColumn(name = "skill_id"))
    @Column(name = "ALIAS", nullable = false, unique = true)
    // Own fields, analyzed like the name: in the name fields every alias would lengthen the field and lower the score
    // of a name match. The search takes the better of name and alias, so many aliases cannot push a skill below its
    // name match. With norms, as in the name fields: a word start within a long alias ("Kubernetes Lens") counts less
    // than the same word start as a name ("Kubernetes").
    @IndexedEmbedded(prefix = "")
    @Fields({
            // stored: the suggestions read the alias that matched from the index, not from the database (#352)
            @Field(name = FIELD_ALIAS_NAME, analyzer = @Analyzer(definition = NAME_ANALYZER), store = Store.YES),
            @Field(name = FIELD_ALIAS_AUTOCOMPLETE, analyzer = @Analyzer(definition = AUTOCOMPLETE_ANALYZER)),
            @Field(name = FIELD_ALIAS_EXACT, analyzer = @Analyzer(definition = EXACT_ANALYZER))
    })
    private Set<String> aliases = new HashSet<>();


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
        // One localization per language, as for categories
        removeLocale(locale);
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
