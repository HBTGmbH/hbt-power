package de.hbt.model.export;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;
import java.io.Serializable;


@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "Ausbildung", propOrder = {
        "bezeichnung",
        "abschluss",
        "zeitraum"
})
public class Ausbildung implements Serializable {
    private static final long serialVersionUID = 1L;

    @XmlElement(required = true)
    private SynonymSet bezeichnung;
    @XmlElement(required = true)
    private SynonymSet abschluss;
    private Zeitraum zeitraum;

    public SynonymSet getBezeichnung() {
        return bezeichnung;
    }

    public void setBezeichnung(SynonymSet value) {
        this.bezeichnung = value;
    }

    public SynonymSet getAbschluss() {
        return abschluss;
    }

    public void setAbschluss(SynonymSet value) {
        this.abschluss = value;
    }


    public Zeitraum getZeitraum() {
        return zeitraum;
    }

    public void setZeitraum(Zeitraum value) {
        this.zeitraum = value;
    }


}
