package de.hbt.pwr.view.exception;

import com.fasterxml.jackson.annotation.JsonProperty;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.Skill;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Indicates that a {@link de.hbt.pwr.view.model.skill.Category} is neither a direct nor indirect parent
 * to a {@link de.hbt.pwr.view.model.skill.Skill}, meaning that recursive calls to {@link Skill#getCategory()}
 * and {@link Category#getParent()} did not find the {@link DisplayCategoryNotFoundException#wantedCategory}
 */
public class DisplayCategoryNotFoundException extends RuntimeException {

    @Getter
    private final String viewProfileId;

    @Getter
    private final String skillName;

    @Getter
    private final String wantedCategory;

    public DisplayCategoryNotFoundException(String viewProfileId, String skillName, String wantedCategory) {
        super("Could not find " + wantedCategory + " as a direct or indirect category of the skill " + skillName + " in the view profile id=" + viewProfileId);
        this.viewProfileId = viewProfileId;
        this.skillName = skillName;
        this.wantedCategory = wantedCategory;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    static class InnerError {
        private static final String CODE = "NotAParent";
        private static final String RESTRICTION = "Display category must be (in)direct parent of the skill";
        private String viewProfileId;
        private String skillName;
        private String targetCategoryName;

        @JsonProperty("code")
        public String getCode() {
            return CODE;
        }

        @JsonProperty("restriction")
        public String getRestriction() {
            return RESTRICTION;
        }
    }
}
