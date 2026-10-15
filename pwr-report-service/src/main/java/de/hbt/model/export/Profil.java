package de.hbt.model.export;

import javax.xml.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;


/**
 * <p>Java class for Profil complex type.
 *
 * <p>The following schema fragment specifies the expected content contained within this class.
 *
 * <pre>
 * &lt;complexType name="Profil">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="name" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="bildUrl" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="kurztext" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="personalie" type="{http://profil.modell.profildb.hbt.de}Personalie"/>
 *         &lt;element name="hbtStellung" type="{http://synonym.modell.profildb.hbt.de}SynonymSet"/>
 *         &lt;element name="qualifikationen" type="{http://profil.modell.profildb.hbt.de}Qualification" maxOccurs="unbounded"/>
 *         &lt;element name="itErfahrungSeit" type="{http://profil.modell.profildb.hbt.de}Datum"/>
 *         &lt;element name="spezialgebiete" type="{http://profil.modell.profildb.hbt.de}Spezialgebiet" maxOccurs="unbounded"/>
 *         &lt;element name="branchen" type="{http://profil.modell.profildb.hbt.de}Branche" maxOccurs="unbounded"/>
 *         &lt;element name="sprachen" type="{http://profil.modell.profildb.hbt.de}Sprache" maxOccurs="unbounded"/>
 *         &lt;element name="werdegang" type="{http://profil.modell.profildb.hbt.de}Werdegang" maxOccurs="unbounded"/>
 *         &lt;element name="verfuegbarkeit" type="{http://profil.modell.profildb.hbt.de}Datum"/>
 *         &lt;element name="projekte" type="{http://profil.modell.profildb.hbt.de}Projekt" maxOccurs="unbounded"/>
 *         &lt;element name="skills" type="{http://profil.modell.profildb.hbt.de}Skill" maxOccurs="unbounded"/>
 *         &lt;element name="profilRollen" type="{http://profil.modell.profildb.hbt.de}ProjektRolle" maxOccurs="unbounded"/>
 *       &lt;/sequence>
 *       &lt;attribute name="id" type="{http://www.w3.org/2001/XMLSchema}int" />
 *       &lt;attribute name="excelId" type="{http://www.w3.org/2001/XMLSchema}int" />
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 */
@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "Profil", propOrder = {
        "name",
        "bildUrl",
        "kurztext",
        "personalie",
        "hbtStellung",
        "qualifikationen",
        "itErfahrungSeit",
        "spezialgebiete",
        "branchen",
        "sprachen",
        "werdegang",
        "projekte",
        "skills",
        "profilRollen"
})
public class Profil {


    @XmlElement(required = true)
    protected String name;

    @XmlElement(required = true)
    private String bildUrl;

    @XmlElement(required = true)
    private String kurztext;

    @XmlElement(required = true)
    private Personalie personalie;

    @XmlElement(required = true)
    private SynonymSet hbtStellung;

    @XmlElement(required = true)
    private Datum itErfahrungSeit;

    @XmlElement(required = true)
    private List<Qualification> qualifikationen = new ArrayList<>();

    @XmlElement(required = true)
    private List<Spezialgebiet> spezialgebiete = new ArrayList<>();

    @XmlElement(required = true)
    private List<Branche> branchen = new ArrayList<>();

    @XmlElement(required = true)
    private List<Sprache> sprachen = new ArrayList<>();

    @XmlElement(required = true)
    private List<Werdegang> werdegang = new ArrayList<>();

    @XmlElement(required = true)
    private List<Projekt> projekte = new ArrayList<>();

    @XmlElement(required = true)
    private List<ProjektRolle> profilRollen = new ArrayList<>();

    @XmlElement(required = true)
    private List<Skill> skills = new ArrayList<>();

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBildUrl() {
        return bildUrl;
    }

    public void setBildUrl(String bildUrl) {
        this.bildUrl = bildUrl;
    }

    public String getKurztext() {
        return kurztext;
    }

    public void setKurztext(String kurztext) {
        this.kurztext = kurztext;
    }

    public Personalie getPersonalie() {
        return personalie;
    }

    public void setPersonalie(Personalie personalie) {
        this.personalie = personalie;
    }

    public SynonymSet getHbtStellung() {
        return hbtStellung;
    }

    public void setHbtStellung(SynonymSet hbtStellung) {
        this.hbtStellung = hbtStellung;
    }

    public List<Qualification> getQualifikationen() {
        return qualifikationen;
    }

    public void setQualifikationen(List<Qualification> qualifikationen) {
        this.qualifikationen = qualifikationen;
    }

    public Datum getItErfahrungSeit() {
        return itErfahrungSeit;
    }

    public void setItErfahrungSeit(Datum itErfahrungSeit) {
        this.itErfahrungSeit = itErfahrungSeit;
    }

    public List<Spezialgebiet> getSpezialgebiete() {
        return spezialgebiete;
    }

    public void setSpezialgebiete(List<Spezialgebiet> spezialgebiete) {
        this.spezialgebiete = spezialgebiete;
    }

    public List<Branche> getBranchen() {
        return branchen;
    }

    public void setBranchen(List<Branche> branchen) {
        this.branchen = branchen;
    }

    public List<Sprache> getSprachen() {
        return sprachen;
    }

    public void setSprachen(List<Sprache> sprachen) {
        this.sprachen = sprachen;
    }

    public List<Werdegang> getWerdegang() {
        return werdegang;
    }

    public void setWerdegang(List<Werdegang> werdegang) {
        this.werdegang = werdegang;
    }

    public List<Projekt> getProjekte() {
        return projekte;
    }

    public void setProjekte(List<Projekt> projekte) {
        this.projekte = projekte;
    }

    public List<ProjektRolle> getProfilRollen() {
        return profilRollen;
    }

    public void setProfilRollen(List<ProjektRolle> profilRollen) {
        this.profilRollen = profilRollen;
    }

    public List<Skill> getSkills() {
        return skills;
    }

    public void setSkills(List<Skill> skills) {
        this.skills = skills;
    }
}
