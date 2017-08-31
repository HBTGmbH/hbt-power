package de.hbt.pwr.view.client.profile.model;

import de.hbt.pwr.view.model.LanguageLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
public class LanguageSkill extends ProfileEntry{
    @Getter
    @Setter
    private LanguageLevel level;

    public LanguageSkill(Long id, NameEntity nameEntity, LanguageLevel level) {
        super(id, nameEntity);
        this.level = level;
    }
}
