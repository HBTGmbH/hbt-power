package de.hbt.pwr.profile.service.housekeeping;

import de.hbt.pwr.profile.model.HousekeepingFindings;
import de.hbt.pwr.profile.model.profile.NameEntityType;
import de.hbt.pwr.profile.service.NameEntityAdminService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Housekeeping, rubric <em>unused</em> (#288): profile elements no profile uses, per type. They are no left-overs but
 * valid entries (suggestions while typing, aliases), so deleting them is a decision of the admin, through
 * {@link NameEntityAdminService#deleteUnused}; typing the name again creates the element anew.
 */
@Service
public class UnusedNameEntitiesService {

    /** Followed by the type, e.g. {@code unused-name-entities-SECTOR} */
    public static final String UNUSED_NAME_ENTITIES = "unused-name-entities-";

    private final NameEntityAdminService nameEntityAdminService;

    public UnusedNameEntitiesService(NameEntityAdminService nameEntityAdminService) {
        this.nameEntityAdminService = nameEntityAdminService;
    }

    @Transactional(readOnly = true)
    public List<HousekeepingFindings> check() {
        return Arrays.stream(NameEntityType.values())
                .map(type -> HousekeepingFindings.of(UNUSED_NAME_ENTITIES + type.name(),
                        nameEntityAdminService.findUnused(type).stream()
                                .map(nameEntity -> nameEntity.getName() == null || nameEntity.getName().isBlank()
                                        ? "#" + nameEntity.getId() : nameEntity.getName())
                                .collect(Collectors.toList())))
                .collect(Collectors.toList());
    }
}
