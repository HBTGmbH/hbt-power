package de.hbt.model.export;

import javax.xml.bind.annotation.*;
import java.io.Serializable;


/**
 * <p>Java class for Spezialgebiet complex type.
 *
 * <p>The following schema fragment specifies the expected content contained within this class.
 *
 * <pre>
 * &lt;complexType name="Spezialgebiet">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="beschreibung" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="kurzbeschreibung" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *       &lt;/sequence>
 *       &lt;attribute name="id" type="{http://www.w3.org/2001/XMLSchema}int" />
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "Spezialgebiet", propOrder = {
        "beschreibung",
        "kurzbeschreibung"
})
public class Spezialgebiet implements Serializable {
    private static final long serialVersionUID = 1L;

    @XmlElement(required = true)
    protected String beschreibung;
    @XmlElement(required = true)
    protected String kurzbeschreibung;
    @XmlAttribute
    protected Integer id;

    /**
     * Gets the value of the beschreibung property.
     *
     * @return possible object is
     * {@link String }
     */
    public String getBeschreibung() {
        return beschreibung;
    }

    /**
     * Sets the value of the beschreibung property.
     *
     * @param value allowed object is
     *              {@link String }
     */
    public void setBeschreibung(String value) {
        this.beschreibung = value;
    }

    /**
     * Gets the value of the kurzbeschreibung property.
     *
     * @return possible object is
     * {@link String }
     */
    public String getKurzbeschreibung() {
        return kurzbeschreibung;
    }

    /**
     * Sets the value of the kurzbeschreibung property.
     *
     * @param value allowed object is
     *              {@link String }
     */
    public void setKurzbeschreibung(String value) {
        this.kurzbeschreibung = value;
    }

    /**
     * Gets the value of the id property.
     *
     * @return possible object is
     * {@link Integer }
     */
    public Integer getId() {
        return id;
    }

    /**
     * Sets the value of the id property.
     *
     * @param value allowed object is
     *              {@link Integer }
     */
    public void setId(Integer value) {
        this.id = value;
    }

}
