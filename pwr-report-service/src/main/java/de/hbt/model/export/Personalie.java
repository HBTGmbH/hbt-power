package de.hbt.model.export;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;
import java.io.Serializable;

@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "Personalie", propOrder = {
        "nationalitaet",
        "jahrgang",
        "kuerzel",
        "titel",
        "vorname",
        "nachname"
})
public class Personalie implements Serializable {
    private static final long serialVersionUID = 1L;

    @XmlElement(required = true)
    private String nationalitaet;
    private int jahrgang;
    @XmlElement(required = true)
    private String kuerzel;
    @XmlElement(required = true)
    private String titel;
    @XmlElement(required = true)
    private String vorname;
    @XmlElement(required = true)
    private String nachname;

    public String getNationalitaet() {
        return nationalitaet;
    }

    public void setNationalitaet(String value) {
        this.nationalitaet = value;
    }

    public int getJahrgang() {
        return jahrgang;
    }

    public void setJahrgang(int value) {
        this.jahrgang = value;
    }

    public String getKuerzel() {
        return kuerzel;
    }

    public void setKuerzel(String value) {
        this.kuerzel = value;
    }

    public String getTitel() {
        return titel;
    }

    public void setTitel(String value) {
        this.titel = value;
    }

    public String getVorname() {
        return vorname;
    }

    public void setVorname(String value) {
        this.vorname = value;
    }

    public String getNachname() {
        return nachname;
    }

    public void setNachname(String value) {
        this.nachname = value;
    }

}
