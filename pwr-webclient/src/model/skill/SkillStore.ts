import {doop} from 'doop';
import {SkillCategory} from './SkillCategory';

@doop
export class SkillStore {
    @doop public get skillTreeRoot() {return doop<SkillCategory, this>()};


    private constructor(skillTreeRoot: SkillCategory) {
        return this.skillTreeRoot(skillTreeRoot);
    }

    public static empty() {
        return new SkillStore(SkillCategory.of(-1, "root"));
    }
}