package de.hbt.pwr.model.clustering;


import de.hbt.pwr.model.profile.Profile;
import lombok.Data;

import java.util.Set;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Data
public class ProfileClusterable {

    private static AtomicLong CURRENT_ID = new AtomicLong();

    private final Long id;

    private final Profile profile;

    private final Set<SkillWrapper> values;

    public ProfileClusterable(Profile profile) {
        this.id = createId();
        this.profile = profile;
        values = profile.getSkills().stream().map(SkillWrapper::new).collect(Collectors.toSet());
    }

    private static Long createId() {
        return CURRENT_ID.getAndIncrement();
    }
}
