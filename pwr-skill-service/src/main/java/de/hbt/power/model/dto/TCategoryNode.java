package de.hbt.power.model.dto;

import de.hbt.power.model.LocalizedQualifier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
@Data
public class TCategoryNode {
    private Integer id;
    private String qualifier = "";
    private boolean blacklisted = false;
    private boolean custom = false;
    private boolean display = false;
    private Set<LocalizedQualifier> qualifiers = new HashSet<>();
    private Set<TCategoryNode> childCategories = new HashSet<>();
    private Set<TSkillNode> childSkills = new HashSet<>();
}
