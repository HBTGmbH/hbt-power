package de.hbt.model.export;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;

@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "Branche", propOrder = {
        "bezeichnung"
})
public class Branche {

    @XmlElement(required = true)
    private SynonymSet bezeichnung;

    public SynonymSet getBezeichnung() {
        return bezeichnung;
    }

    public void setBezeichnung(SynonymSet bezeichnung) {
        this.bezeichnung = bezeichnung;
    }
}
