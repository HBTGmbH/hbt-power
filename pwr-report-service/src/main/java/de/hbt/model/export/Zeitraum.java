package de.hbt.model.export;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlType;

@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "Zeitraum", propOrder = {
        "beschreibung",
        "von",
        "bis"
})
public class Zeitraum {

    protected String beschreibung;
    protected Datum von;
    protected Datum bis;

    public Zeitraum() {

    }

    public String getBeschreibung() {
        return beschreibung;
    }

    public void setBeschreibung(String beschreibung) {
        this.beschreibung = beschreibung;
    }

    public Datum getVon() {
        return von;
    }

    public void setVon(Datum von) {
        this.von = von;
    }

    public Datum getBis() {
        return bis;
    }

    public void setBis(Datum bis) {
        this.bis = bis;
    }
}
