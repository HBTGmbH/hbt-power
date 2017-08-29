package de.hbt.pwr.view.exception;

import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.Skill;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * Indicates that a {@link de.hbt.pwr.view.model.skill.Category} is neither a direct nor indirect parent
 * to a {@link de.hbt.pwr.view.model.skill.Skill}, meaning that recursive calls to {@link Skill#getCategory()}
 * and {@link Category#getParent()} did not find the {@link DisplayCategoryNotFoundException#wantedCategory}
 */
public class DisplayCategoryNotFoundException extends RuntimeException {

    @Getter
    private String viewProfileId;

    @Getter
    private String skillName;

    @Getter
    private String wantedCategory;

    public DisplayCategoryNotFoundException(String viewProfileId, String skillName, String wantedCategory) {
        super("Could not find " + wantedCategory + " as a direct or indirect category of the skill " + skillName + " in the view profile id=" + viewProfileId);
        this.viewProfileId = viewProfileId;
        this.skillName = skillName;
        this.wantedCategory = wantedCategory;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Error {
        private OuterError error;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    static class OuterError {
        private final int code = HttpStatus.BAD_REQUEST.value();
        private String message;
        private String target;
        private InnerError innerError;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    static class InnerError {
        private final String code = "NotAParent";
        private String viewProfileId;
        private String skillName;
        private String targetCategoryName;
        private final String restriction = "Display category must be (in)direct parent of the skill";
    }
}
