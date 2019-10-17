package de.hbt.model.export;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;

@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "Qualifikation", propOrder = {
        "bezeichnung",
        "datum",
})
public class Qualification {
    @XmlElement(required = true)
    private SynonymSet bezeichnung;
    @XmlElement(required = true)
    private Datum datum;

    public SynonymSet getBezeichnung() {
        return bezeichnung;
    }

    public void setBezeichnung(SynonymSet bezeichnung) {
        this.bezeichnung = bezeichnung;
    }

    public Datum getDatum() {
        return datum;
    }

    public void setDatum(Datum datum) {
        this.datum = datum;
    }
}
