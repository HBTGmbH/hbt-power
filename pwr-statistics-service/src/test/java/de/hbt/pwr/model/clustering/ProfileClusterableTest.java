package de.hbt.pwr.model.clustering;

import de.hbt.pwr.model.profile.Profile;
import de.hbt.pwr.model.profile.Skill;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Created by nt on 21.06.2017.
 */
public class ProfileClusterableTest {

    private SkillWrapper wrapper(String skillName) {
        return new SkillWrapper(new Skill(skillName,5));
    }

    private ProfilePrototype makeWebDev() {
        Set<SkillWrapper> wrappers = new HashSet<SkillWrapper>();
        wrappers.add(wrapper("HTML"));
        wrappers.add(wrapper("CSS"));
        wrappers.add(wrapper("Javascript"));
        return new ProfilePrototype(wrappers, "Webdev");
    }

    private ProfilePrototype makeBackendDev() {
        Set<SkillWrapper> wrappers = new HashSet<>();
        wrappers.add(wrapper("Java EE"));
        wrappers.add(wrapper("JUnit"));
        wrappers.add(wrapper("Maven"));
        return new ProfilePrototype(wrappers, "Backend");
    }

    private ProfilePrototype makeArchitect() {
        Set<SkillWrapper> wrappers = new HashSet<>();
        wrappers.add(wrapper("Business Architecture"));
        wrappers.add(wrapper("BPMN"));
        wrappers.add(wrapper("TOGAF"));
        return new ProfilePrototype(wrappers, "Architect");
    }

    private ProfileClusterable makeSimpleClusterable(Long profileId, ProfilePrototype prototype, String... moreSkillNames) {
        Profile p = new Profile();
        p.setId(profileId);
        p.getSkills().addAll(prototype.getValues().stream().map(SkillWrapper::getSkill).collect(Collectors.toList()));
        for (String moreSkillName : moreSkillNames) {
            p.getSkills().add(new Skill(moreSkillName, 2));
        }
        return new ProfileClusterable(p);
    }

    private ProfilePrototype findClusterByOneSkill(List<ProfilePrototype> prototypes, String skillName) {
        Optional<ProfilePrototype> optional = prototypes.stream().filter(prototype -> prototype.getValues().contains(wrapper(skillName))).findFirst();
        if(optional.isPresent()) {
            return optional.get();
        } else {
            throw new RuntimeException("Cluster not found");
        }
    }

}