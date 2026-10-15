package de.hbt.power.model.dto;

import de.hbt.power.model.LocalizedQualifier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Builder(toBuilder = true)
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TSkillNode {
    private Integer id;
    private String qualifier;
    private Set<LocalizedQualifier> qualifiers = new HashSet<>();
    private Set<String> versions = new HashSet<>();
    private boolean custom = false;
}
