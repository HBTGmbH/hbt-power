package de.hbt.model.export;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;
import java.io.Serializable;


/**
 * <p>Java class for ProjektRolle complex type.
 *
 * <p>The following schema fragment specifies the expected content contained within this class.
 *
 * <pre>
 * &lt;complexType name="ProjektRolle">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="bezeichnung" type="{http://synonym.modell.profildb.hbt.de}SynonymSet"/>
 *         &lt;element name="duplikat" type="{http://www.w3.org/2001/XMLSchema}boolean" minOccurs="0"/>
 *         &lt;element name="export" type="{http://www.w3.org/2001/XMLSchema}boolean" minOccurs="0"/>
 *       &lt;/sequence>
 *       &lt;attribute name="id" type="{http://www.w3.org/2001/XMLSchema}int" />
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "ProjektRolle", propOrder = {
        "bezeichnung"
})
public class ProjektRolle implements Serializable {

    private static final long serialVersionUID = 1L;

    @XmlElement(required = true)
    private SynonymSet bezeichnung;


    public SynonymSet getBezeichnung() {
        return bezeichnung;
    }

    public void setBezeichnung(SynonymSet bezeichnung) {
        this.bezeichnung = bezeichnung;
    }


    @Override
    public String toString() {
        return "ProjektRolle [bezeichnung=" + bezeichnung + "]";
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
        ProjektRolle other = (ProjektRolle) obj;
        if (bezeichnung == null) {
            if (other.bezeichnung != null)
                return false;
        } else if (!bezeichnung.equals(other.bezeichnung))
            return false;
        return true;
    }
}
