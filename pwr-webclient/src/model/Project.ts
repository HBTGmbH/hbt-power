import {doop} from 'doop';
import {APINameEntity, APIProject, APISkill} from './APIProfile';
import * as Immutable from 'immutable';
import {NameEntity} from './NameEntity';
import {NEW_ENTITY_PREFIX} from './PwrConstants';
import {Skill} from './Skill';
import {isNullOrUndefined} from 'util';
import {DateUtils} from "../utils/DateUtil";

@doop
export class Project {

    @doop
    public get id() {
        return doop<string, this>();
    }
    @doop
    public get name() {
        return doop<string, this>();
    }


    @doop
    public get startDate() {
        return doop<Date, this>();
    }

    @doop
    public get endDate() {
        return doop<Date, this>();
    }

    @doop
    public get description() {
        return doop<string, this>();
    }

    @doop
    public get endCustomerId() {
        return doop<string, this>();
    }

    @doop
    public get brokerId() {
        return doop<string, this>();
    }

    @doop
    public get roleIds() {
        return doop<Immutable.List<string>, this>();
    }


    /**
     * Doops a list of skill ids.
     * @returns {Doop<Immutable.List<string>, this>}
     */
    @doop
    public get skillIDs() {
        return doop<Immutable.Set<string>, this>();
    }

    @doop
    public get isNew() {
        return doop<boolean, this>();
    }

    private static CURRENT_ID: number = 0;

    private constructor(id: string, name: string, endCustomerId: string, startDate: Date, endDate: Date,
                        description: string, brokerId: string, roleIds: Immutable.List<string>, isNew: boolean,
                        skillIds: Immutable.Set<string>) {
        this.id(id)
            .name(name)
            .endCustomerId(endCustomerId)
            .startDate(startDate)
            .endDate(endDate)
            .description(description)
            .brokerId(brokerId)
            .roleIds(roleIds)
            .isNew(isNew)
            .skillIDs(skillIds);
    }

    private rolesToAPI(roles: Immutable.Map<string, NameEntity>): Array<APINameEntity> {
        let res: Array<APINameEntity> = [];
        this.roleIds().forEach(id => {
            res.push(roles.get(id).toAPI());
        });
        return res;
    }

    private skillsToAPI(skills: Immutable.Map<string, Skill>): Array<APISkill> {
        return this.skillIDs().map(skillId => skills.get(skillId).toAPI()).toArray();
    }

    public toAPI(companies: Immutable.Map<string, NameEntity>,
                 roles: Immutable.Map<string, NameEntity>,
                 skills: Immutable.Map<string, Skill>): APIProject {
        let company = companies.get(this.brokerId());
        let customer = companies.get(this.endCustomerId());
        return {
            id: this.isNew() ? null : Number(this.id()),
            description: this.description(),
            name: this.name(),
            endDate: DateUtils.formatLocaleDateToIso(this.endDate()),
            startDate: DateUtils.formatLocaleDateToIso(this.startDate()),
            broker: isNullOrUndefined(company) ? null : company.toAPI(),
            client:  isNullOrUndefined(customer) ? null : customer.toAPI(),
            projectRoles: this.rolesToAPI(roles),
            skills: this.skillsToAPI(skills)
        }
    }

    private static parseRoles(project: APIProject): Immutable.List<string> {
        let res: Immutable.List<string> = Immutable.List<string>();
        project.projectRoles.forEach(p => {
            res = res.push(String(p.id));
        });
        return res;
    }

    private static parseSkills(project: APIProject): Immutable.Set<string> {
        let res = Immutable.Set<string>();
        project.skills.forEach(skill => {
            res = res.add(String(skill.id))
        });
        return res;
    }

    public static createNew(): Project {
        return new Project(
            String(NEW_ENTITY_PREFIX + (Project.CURRENT_ID++)),
            "",
            null,
            new Date(),
            new Date(),
            "",
            null,
            Immutable.List<string>(),
            true,
            Immutable.Set<string>());
    }

    public static fromAPI(project: APIProject): Project {
        return new Project(
            String(project.id),
            project.name,
            isNullOrUndefined(project.client) ? null : String(project.client.id),
            isNullOrUndefined(project.startDate) ? null : new Date(project.startDate),
            isNullOrUndefined(project.endDate) ? null : new Date(project.endDate),
            project.description,
            isNullOrUndefined(project.broker) ? null : String(project.broker.id),
            Project.parseRoles(project),
            false,
            Project.parseSkills(project)
        )
    }


}