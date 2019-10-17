package de.hbt.model.export;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;

@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "Synonym", propOrder = {
        "bezeichnung"
})
public class Synonym {

    @XmlElement(required = true)
    private String bezeichnung;

    public String getBezeichnung() {
        return bezeichnung;
    }

    public void setBezeichnung(String value) {
        this.bezeichnung = value;
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((bezeichnung == null) ? 0 : bezeichnung.hashCode());
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
        Synonym other = (Synonym) obj;
        if (bezeichnung == null) {
            if (other.bezeichnung != null)
                return false;
        } else if (!bezeichnung.equals(other.bezeichnung))
            return false;
        return true;
    }

}
