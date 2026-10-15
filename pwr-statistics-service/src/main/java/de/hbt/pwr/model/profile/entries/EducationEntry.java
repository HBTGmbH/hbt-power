package de.hbt.pwr.model.profile.entries;

public class EducationEntry extends CareerElement {

    private String degree;

    public EducationEntry() {
        // Default constructor for JPA and Jax-rs
    }

    public String getDegree() {
        return degree;
    }

    public void setDegree(String degree) {
        this.degree = degree;
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
