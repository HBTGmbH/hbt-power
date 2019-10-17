package de.hbt.model.export;

import javax.xml.bind.annotation.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "Projekt", propOrder = {
        "projektId",
        "titel",
        "rollen",
        "kurzbeschreibung",
        "endkunde",
        "skills",
        "zeitraum",
        "branche",
        "berater",
        "auszeit"
})
public class Projekt implements Serializable {
    private static final long serialVersionUID = 1L;
    @XmlElement(required = true)
    private Long projektId;
    @XmlElement(required = true)
    private String titel;
    @XmlElement(required = true)
    private List<ProjektRolle> rollen;
    @XmlElement(required = true)
    private String kurzbeschreibung;
    @XmlElement(required = true)
    private Unternehmen endkunde;
    @XmlElement(required = true)
    private List<Skill> skills;
    @XmlElement(required = true)
    private Zeitraum zeitraum;
    @XmlElement(required = true)
    private Branche branche;
    @XmlElement(required = true)
    private String berater;
    @XmlElement
    private Integer auszeit;
    @XmlAttribute
    private Integer position;

    public void setRollen(List<ProjektRolle> rollen) {
        this.rollen = rollen;
    }

    public void setSkills(List<Skill> skills) {
        this.skills = skills;
    }

    public String getTitel() {
        return titel;
    }

    public void setTitel(String value) {
        this.titel = value;
    }

    List<ProjektRolle> getRollen() {
        if (rollen == null) {
            rollen = new ArrayList<ProjektRolle>();
        }
        return this.rollen;
    }

    public String getKurzbeschreibung() {
        return kurzbeschreibung;
    }

    public void setKurzbeschreibung(String value) {
        this.kurzbeschreibung = value;
    }

    public Unternehmen getEndkunde() {
        return endkunde;
    }

    public void setEndkunde(Unternehmen value) {
        this.endkunde = value;
    }

    public List<Skill> getSkills() {
        if (skills == null) {
            skills = new ArrayList<Skill>();
        }
        return this.skills;
    }

    Zeitraum getZeitraum() {
        return zeitraum;
    }

    public void setZeitraum(Zeitraum value) {
        this.zeitraum = value;
    }

    public Branche getBranche() {
        return branche;
    }

    public void setBranche(Branche value) {
        this.branche = value;
    }

    public String getBerater() {
        return berater;
    }

    public void setBerater(String value) {
        this.berater = value;
    }

    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer value) {
        this.position = value;
    }

    Integer getAuszeit() {
        return auszeit;
    }

    public void setAuszeit(Integer value) {
        this.auszeit = value;
    }


    public Long getProjektId() {
        return projektId;
    }

    public void setProjektId(Long projektId) {
        this.projektId = projektId;
    }
}
