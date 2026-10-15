package de.hbt.pwr.profile.model.profile.entries;

import javax.persistence.Entity;

/**
 * Created by cg on 20.04.2017.
 */
@Entity
public class EducationEntry extends CareerElement {

    private String degree;

    public EducationEntry() {
        // Default constructor for JPA and Jax-rs
    }

    public EducationEntry(NameEntity education, String degree) {
        this.nameEntity = education;
        this.degree = degree;
    }

    public String getDegree() {
        return degree;
    }

    public void setDegree(String degree) {
        this.degree = degree;
    }

    /**
     * Returns a copy with a null id.
     */
    @Override
    public EducationEntry copyNullId() {
        EducationEntry res = new EducationEntry();
        res.setDegree(degree);
        res.setStartDate(startDate);
        res.setEndDate(endDate);
        res.setNameEntity(nameEntity);
        res.setId(null);
        return res;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;

        EducationEntry that = (EducationEntry) o;

        return degree != null ? degree.equals(that.degree) : that.degree == null;
    }

    @Override
    public int hashCode() {
        int result = super.hashCode();
        result = 31 * result + (degree != null ? degree.hashCode() : 0);
        return result;
    }
}
