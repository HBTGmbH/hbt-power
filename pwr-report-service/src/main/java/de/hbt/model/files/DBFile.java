package de.hbt.model.files;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;

@Getter
@Setter
@Entity
@Table(name = "designfiles")
public class DBFile {
    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid2")
    protected String id;

    protected String filename;

    protected String filetype;

    @Lob
    protected byte[] data;

    public DBFile() {

    }

    public DBFile(String filename, String filetype, byte[] data) {
        this.filename = filename;
        this.filetype = filetype;
        this.data = data;
    }

    @Override
    public String toString() {
        return "" + filename + " (" + id + ") -- length: " + (data != null ? data.length : 0) + "  type: " + filetype;
    }
}
