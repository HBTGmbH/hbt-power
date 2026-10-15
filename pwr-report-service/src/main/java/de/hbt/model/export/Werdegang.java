package de.hbt.model.export;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;

@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "Werdegang", propOrder = {
        "beschreibung",
        "zeitraum",
        "ausbildung",
        "typ",
})
public class Werdegang {

    protected String beschreibung;
    @XmlElement(required = true)
    protected String zeitraum;
    protected Ausbildung ausbildung;
    protected String typ;

    public String getBeschreibung() {
        return beschreibung;
    }

    public void setBeschreibung(String beschreibung) {
        this.beschreibung = beschreibung;
    }

    public String getZeitraum() {
        return zeitraum;
    }

    public void setZeitraum(String zeitraum) {
        this.zeitraum = zeitraum;
    }

    public Ausbildung getAusbildung() {
        return ausbildung;
    }

    public void setAusbildung(Ausbildung ausbildung) {
        this.ausbildung = ausbildung;
    }

    public String getTyp() {
        return typ;
    }

    public void setTyp(String typ) {
        this.typ = typ;
    }
}
