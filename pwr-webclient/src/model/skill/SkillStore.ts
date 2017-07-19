import {doop} from 'doop';
import {SkillCategory} from './SkillCategory';
import * as Immutable from 'immutable';

@doop
export class SkillStore {
    @doop public get skillTreeRoot() {return doop<SkillCategory, this>()};

    /**
     * Categories and their hierachy by skill name. Used to provide skill information.
     * @returns {Doop<Immutable.Map<string, string>, this>}
     */
    @doop public get categorieHierarchiesBySkillName() {return doop<Immutable.Map<string, string>, this>()};


    private constructor(skillTreeRoot: SkillCategory, categorieHierarchiesBySkillName: Immutable.Map<string, string>) {
        return this.skillTreeRoot(skillTreeRoot).categorieHierarchiesBySkillName(categorieHierarchiesBySkillName);
    }

    public static empty() {
        return new SkillStore(SkillCategory.of(-1, "root"), Immutable.Map<string, string>());
    }
}