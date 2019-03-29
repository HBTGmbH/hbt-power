package de.hbt.pwr.profile.model;

import lombok.AllArgsConstructor;
import lombok.Builder;

import javax.persistence.*;

/**
 * A skill.
 * <p>
 * A Note on equality: Two Skills are considered equal when their {@link Skill#name}, {@link Skill#rating} and
 * {@link Skill#id} are the same. This does not take into account the category. If two skills are in different categories, but
 * their name, id and rating are the same, it represents a conflict and must not happen.
 * </p>
 */
@Entity
@Builder
@AllArgsConstructor
public class Skill {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id = null;

    private String name;

    @Column(name = "rating")
    private Integer rating;

    @Column(name = "comment", nullable = true, length = 255)
    private String comment;

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Skill() {

    }

    public Skill(String name, Integer rating) {
        this.name = name;
        this.rating = rating;
    }

    public Skill(String name, Integer rating, String comment) {
        this.name = name;
        this.rating = rating;
        this.comment = comment;
    }

    public Skill copyNullId() {
        return new Skill(name, rating);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Skill skill = (Skill) o;

        if (id != null ? !id.equals(skill.id) : skill.id != null) return false;
        if (name != null ? !name.equals(skill.name) : skill.name != null) return false;
        if (rating != null ? !rating.equals(skill.rating) : skill.rating != null) return false;
        return comment != null ? comment.equals(skill.comment) : skill.comment == null;
    }

    @Override
    public int hashCode() {
        int result = id != null ? id.hashCode() : 0;
        result = 31 * result + (name != null ? name.hashCode() : 0);
        result = 31 * result + (rating != null ? rating.hashCode() : 0);
        result = 31 * result + (comment != null ? comment.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return "Skill{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", rating=" + rating +
                ", comment='" + comment + '\'' +
                '}';
    }
}
