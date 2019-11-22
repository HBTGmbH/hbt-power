package de.hbt.power.service;

import de.hbt.power.model.Skill;
import de.hbt.power.model.SkillCategory;
import de.hbt.power.model.dto.TCategoryNode;
import de.hbt.power.model.dto.TSkillNode;
import de.hbt.power.repo.SkillCategoryRepository;
import de.hbt.power.repo.SkillRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.awt.print.Pageable;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class SkillTreeMappingService {

    private final SkillRepository skillRepository;

    private final SkillCategoryRepository skillCategoryRepository;

    @Autowired
    public SkillTreeMappingService(SkillRepository skillRepository, SkillCategoryRepository skillCategoryRepository) {
        this.skillRepository = skillRepository;
        this.skillCategoryRepository = skillCategoryRepository;
    }

    public TCategoryNode buildSkillTree() {
        return buildSkillTree(skillCategoryRepository.findAll(), skillRepository.findAll());
    }

    public TCategoryNode buildSkillTreeDebug() {
        return buildSkillTree(skillCategoryRepository.findAll(), skillRepository.findFirst50ByOrderById());
    }

    public TCategoryNode buildSkillTree(List<SkillCategory> categories, List<Skill> skills) {
        log.info("categories: " + categories.size() + "        skills: " + skills.size());
        return new SkillTreeMapper(categories, skills).map();
    }

    private class SkillTreeMapper {
        private final List<SkillCategory> categories;
        private final List<Skill> skills;

        private final Map<Integer, TCategoryNode> categoryNodesById;

        private final TCategoryNode rootNode;

        private SkillTreeMapper(List<SkillCategory> categories, List<Skill> skills) {
            this.categories = categories;
            this.skills = skills;
            this.categoryNodesById = new HashMap<>();
            this.rootNode = new TCategoryNode();
            rootNode.setId(-1);
            rootNode.setQualifier("##ROOT##");
        }

        public TCategoryNode map() {
            // This maps all categories and skills into the map. Once the map is completed,
            // the structure can be built
            categories.forEach(this::convert);
            skills.forEach(this::convert);
            // now we iterate over the original categories again, this time building the structure.
            // Because we do not know the order of the categories, this has to happen after the initial
            // mapping; The categoriesById map exists for performance reasons.
            categories.forEach(this::addToTree);
            return rootNode;
        }

        private void convert(SkillCategory category) {
            TCategoryNode node = new TCategoryNode();
            node.setCustom(category.isCustom());
            node.setId(category.getId());
            node.setQualifier(category.getQualifier());
            node.setQualifiers(category.getQualifiers());
            node.setBlacklisted(category.isBlacklisted());
            node.setDisplay(category.isDisplay());
            categoryNodesById.put(node.getId(), node);
        }

        private void convert(Skill skill) {
            TSkillNode skillNode = new TSkillNode();
            skillNode.setQualifiers(skill.getQualifiers());
            skillNode.setQualifier(skill.getQualifier());
            skillNode.setId(skill.getId());
            skillNode.setCustom(skill.isCustom());
            skillNode.setVersions(skill.getVersions());
            // As this step is happening after all categories are mapped, we can safely add the skill now
            if (skill.getCategory() != null) {
                // If this throws an exception, something is very wrong.
                categoryNodesById.get(skill.getCategory().getId()).getChildSkills().add(skillNode);
            }
        }

        private void addToTree(SkillCategory category) {
            if (category.getCategory() == null) {
                // We have found a root category. Add it to root.
                TCategoryNode categoryNode = categoryNodesById.get(category.getId());
                rootNode.getChildCategories().add(categoryNode);
            } else {
                // We have found a child node of another category. Add it to that one.
                TCategoryNode childNode = categoryNodesById.get(category.getId());
                TCategoryNode parentNode = categoryNodesById.get(category.getCategory().getId());
                parentNode.getChildCategories().add(childNode);
            }
        }


    }
}
