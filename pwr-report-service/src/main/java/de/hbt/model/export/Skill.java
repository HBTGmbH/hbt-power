package de.hbt.model.export;

import javax.xml.bind.annotation.*;
import java.io.Serializable;


/**
 * <p>Java class for Skill complex type.
 *
 * <p>The following schema fragment specifies the expected content contained within this class.
 *
 * <pre>
 * &lt;complexType name="Skill">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="bezeichnung" type="{http://synonym.modell.profildb.hbt.de}SynonymSet"/>
 *         &lt;element name="level" type="{http://profil.modell.profildb.hbt.de}SkillLevel"/>
 *         &lt;element name="seit" type="{http://profil.modell.profildb.hbt.de}Datum" minOccurs="0"/>
 *         &lt;element name="gruppe" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *       &lt;/sequence>
 *       &lt;attribute name="id" type="{http://www.w3.org/2001/XMLSchema}int" />
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "Skill", propOrder = {
        "bezeichnung",
        "level",
        "seit",
        "gruppe",
        "groupIndex",
        "versions"
})
public class Skill implements Serializable {
    private static final long serialVersionUID = 1L;

    @XmlElement(required = true)
    private SynonymSet bezeichnung;
    @XmlElement(required = true)
    private SkillLevel level;
    private Datum seit;
    @XmlElement(required = true)
    private String gruppe;
    @XmlAttribute
    protected Integer id;

    private Integer groupIndex; // index of the group for the export


    @XmlElement(name="version")
    private String versions;

    public static long getSerialVersionUID() {
        return serialVersionUID;
    }

    public SynonymSet getBezeichnung() {
        return bezeichnung;
    }

    public void setBezeichnung(SynonymSet bezeichnung) {
        this.bezeichnung = bezeichnung;
    }

    public SkillLevel getLevel() {
        return level;
    }

    public void setLevel(SkillLevel level) {
        this.level = level;
    }

    public Datum getSeit() {
        return seit;
    }

    public void setSeit(Datum seit) {
        this.seit = seit;
    }

    public String getGruppe() {
        return gruppe;
    }

    public void setGruppe(String gruppe) {
        this.gruppe = gruppe;
    }

    public Integer getGroupIndex() {
        return groupIndex;
    }

    public void setGroupIndex(Integer groupIndex) {
        this.groupIndex = groupIndex;
    }

    public String getVersions() { return versions; }

    public void setVersions(String versions) { this.versions = versions; }
}
