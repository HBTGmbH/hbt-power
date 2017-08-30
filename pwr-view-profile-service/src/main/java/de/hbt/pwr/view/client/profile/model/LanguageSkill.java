package de.hbt.pwr.view.client.profile.model;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class LanguageSkill extends ProfileEntry{
    private LanguageSkillLevel level;
}
