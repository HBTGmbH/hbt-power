import {connect} from 'react-redux';
import * as React from 'react';
import {ProfileElementType} from '../../../../Store';
import {FormControl, Icon, InputLabel, MenuItem, Select, Typography, withTheme} from '@material-ui/core';
import {NameEntityUtil} from '../../../../utils/NameEntityUtil';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {NAME_ENTITY_BY_NAME} from '../../../../utils/Comparators';
import * as Immutable from 'immutable';
import {StatisticsActionCreator} from '../../../../reducers/statistics/StatisticsActionCreator';
import {ConsultantInfo} from '../../../../model/ConsultantInfo';
import {ThemeProps} from '../../../../utils/ReactUtils';
import {ApplicationState} from '../../../../reducers/reducerIndex';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';
import {PwrListTable} from '../../../general/pwr-list-table';
import {ProfileElementInfo, ProfileElementLayout} from '../profile-element-layout';
import {SuggestionAsyncActionCreator} from '../../../../reducers/suggestions/SuggestionAsyncActionCreator';
import {NameEntity} from '../../../../reducers/profile-new/profile/model/NameEntity';
import {ThunkDispatch} from 'redux-thunk';
import {matchPath, RouteComponentProps, withRouter} from 'react-router-dom';
import {Paths} from '../../../../Paths';
import {StringUtils} from '../../../../utils/StringUtil';
import {ConsultantName} from '../../../../model/ConsultantName';
import {AdminActionCreator} from '../../../../reducers/admin/AdminActionCreator';
import {ProfileServiceClient} from '../../../../clients/ProfileServiceClient';
import {PwrIconButton} from '../../../general/pwr-icon-button';
import {PwrButton} from '../../../general/pwr-button';
import {PwrSpacer} from '../../../general/pwr-spacer_module';
import {NameEntityChangeDialog} from './name-entity-dialogs';
import {PwrUsageCount, USAGE_COLUMN_WIDTH} from '../../../general/pwr-usage-count';
import {NameEntityAlias} from '../../../../model/NameEntityAlias';
import {PwrFormSection} from '../../../general/pwr-form-section';
import {AliasList} from '../../../general/skill/alias-list_module';

interface NameEntityOverviewProps {
    sectors: Array<NameEntity>;
    keySkills: Array<NameEntity>;
    careers: Array<NameEntity>;
    educations: Array<NameEntity>;
    qualifications: Array<NameEntity>;
    trainings: Array<NameEntity>;
    languages: Array<NameEntity>;
    projectRoles: Array<NameEntity>;
    companies: Array<NameEntity>;
    currentlyUsedSkillNames: Array<string>;
    nameEntityUsageInfo: Immutable.Map<NameEntity, Immutable.List<ConsultantInfo>>;
    consultantNames: Record<string, ConsultantName>;
    aliases: Array<NameEntityAlias>;
}

type NameEntityOverviewLocalProps = RouteComponentProps;

interface NameEntityOverviewLocalState {
    /** Renaming or merging (#227); deleting the unused ones lives in the housekeeping (#288) */
    dialog: 'rename' | 'merge' | null;
    /** How many consultants use each element of the shown type, by id (#271); null while loading */
    usage: { type: ProfileElementType, counts: Record<string, number> } | null;
}

interface NameEntityOverviewDispatch {
    requestAllNameEntities(): void;

    requestCurrentlyUsedSkills(): void;

    requestNameEntityUsageInfo(nameEntity: NameEntity, type: ProfileElementType): void;

    deleteNameEntity(nameEntity: NameEntity, users: Array<string>): void;

    addAlias(nameEntity: NameEntity, alias: string): void;

    deleteAlias(nameEntity: NameEntity, alias: string): void;
}

/**
 * The entries of a type, sorted by name
 */
function entitiesOf(props: NameEntityOverviewProps, selectedField: ProfileElementType): Array<NameEntity> {
    switch (selectedField) {
        case ProfileElementType.SectorEntry:
            return props.sectors;
        case ProfileElementType.SpecialField:
            return props.keySkills;
        case ProfileElementType.CareerEntry:
            return props.careers;
        case ProfileElementType.EducationEntry:
            return props.educations;
        case ProfileElementType.QualificationEntry:
            return props.qualifications;
        case ProfileElementType.TrainingEntry:
            return props.trainings;
        case ProfileElementType.LanguageEntry:
            return props.languages;
        case ProfileElementType.Company:
            return props.companies;
        case ProfileElementType.ProjectRole:
            return props.projectRoles;
        default:
            return [];
    }
}

/** "SPECIAL_FIELD" as "special-field" in the URL */
const toUrlType = (type: ProfileElementType) => type.toLowerCase().replace(/_/g, '-');

const typeFromUrl = (urlType: string | null): ProfileElementType | undefined =>
    NameEntityUtil.getProfileElementTypes().find(type => toUrlType(type) === urlType);

const typeUrl = (type: ProfileElementType) => Paths.build(Paths.ADMIN_INFO_NAME_ENTITY_TYPE, {type: toUrlType(type)});

const isNameless = (nameEntity: NameEntity) => !nameEntity.name || nameEntity.name.trim() === '';

/**
 * An entry without a name stays visible and selectable (#211), so it can be checked and cleaned up
 */
const displayName = (nameEntity: NameEntity) =>
    isNameless(nameEntity) ? PowerLocalize.get('AdminClient.Overview.Nameless') : nameEntity.name;

const renderName = (nameEntity: NameEntity) => isNameless(nameEntity)
    ? <Typography component="span" variant="inherit" color="textSecondary"><em>{displayName(nameEntity)}</em></Typography>
    : nameEntity.name;


const SORTED_BY_NAME = new WeakMap<Array<NameEntity>, Array<NameEntity>>();

/**
 * A sorted copy (#274): sorting the array of the store in place would change the state. The same copy as long as the
 * array of the store stays the same, so connect sees no change and doesn't render again.
 */
function sortedByName(entities: Array<NameEntity>): Array<NameEntity> {
    let sorted = SORTED_BY_NAME.get(entities);
    if (!sorted) {
        sorted = [...entities].sort(NAME_ENTITY_BY_NAME);
        SORTED_BY_NAME.set(entities, sorted);
    }
    return sorted;
}

class NameEntityOverviewModule extends React.Component<NameEntityOverviewProps
    & NameEntityOverviewLocalProps
    & NameEntityOverviewDispatch
    & ThemeProps, NameEntityOverviewLocalState> {

    state: NameEntityOverviewLocalState = {dialog: null, usage: null};

    public componentDidMount() {
        this.props.requestAllNameEntities();
        this.applyUrl();
        this.loadUsage();
    };

    public componentDidUpdate(prevProps: NameEntityOverviewProps & NameEntityOverviewLocalProps) {
        const entitiesChanged = entitiesOf(prevProps, this.selectedField()) !== entitiesOf(this.props, this.selectedField());
        if (prevProps.location.pathname !== this.props.location.pathname || entitiesChanged) {
            this.applyUrl();
        }
        // Renaming, merging and deleting reload the list, so the numbers follow it (#271)
        if (entitiesChanged || this.usageRequestedFor !== this.selectedField()) {
            this.loadUsage();
        }
    }

    private usageRequestedFor: ProfileElementType | undefined;

    private loadUsage = () => {
        const type = this.selectedField();
        this.usageRequestedFor = type;
        ProfileServiceClient.instance().getNameEntityUsage(type)
            .then(counts => {
                if (type === this.selectedField()) {
                    this.setState({usage: {type, counts}});
                }
            })
            .catch(() => this.setState({usage: null}));
    };

    private usageOf = (nameEntity: NameEntity): number | undefined => {
        const usage = this.state.usage;
        return usage && usage.type === this.selectedField() ? usage.counts[String(nameEntity.id)] : undefined;
    };

    /**
     * Type and entry are in the URL (#212); the slug is only for reading, the ID selects
     */
    private urlSelection(): { type: string | null, id: number | null } {
        const pathname = this.props.location.pathname;
        const entry = matchPath<{ type: string, id: string }>(pathname, {path: Paths.ADMIN_INFO_NAME_ENTITY_ENTRY, exact: true});
        if (entry) {
            const id = Number(entry.params.id);
            return {type: entry.params.type, id: isNaN(id) ? null : id};
        }
        const type = matchPath<{ type: string }>(pathname, {path: Paths.ADMIN_INFO_NAME_ENTITY_TYPE, exact: true});
        return {type: type ? type.params.type : null, id: null};
    }

    private selectedField(): ProfileElementType {
        return typeFromUrl(this.urlSelection().type) || ProfileElementType.SectorEntry;
    }

    private selectedEntity(): NameEntity | undefined {
        const id = this.urlSelection().id;
        return id === null ? undefined : this.getNameEntitiesByField(this.selectedField()).find(entity => entity.id === id);
    }

    private applyUrl = () => {
        const {type, id} = this.urlSelection();
        if (type !== null && !typeFromUrl(type)) {
            // Unknown type: the first one without a selection
            this.props.history.replace(Paths.ADMIN_INFO_NAME_ENTITY);
            return;
        }
        const entities = this.getNameEntitiesByField(this.selectedField());
        const selected = this.selectedEntity();
        if (id !== null && entities.length > 0 && !selected) {
            // Unknown or deleted entry: the list of the type without a selection
            this.props.history.replace(typeUrl(this.selectedField()));
            return;
        }
        if (selected && selected !== this.requested) {
            this.requested = selected;
            this.props.requestNameEntityUsageInfo(selected, this.selectedField());
        }
    };

    private requested: NameEntity | undefined;

    static mapStateToProps(state: ApplicationState): NameEntityOverviewProps {
        return {
            sectors: sortedByName(state.suggestionStore.allIndustrialSectors),
            keySkills: sortedByName(state.suggestionStore.allSpecialFields),
            careers: sortedByName(state.suggestionStore.allCareers),
            educations: sortedByName(state.suggestionStore.allEducations),
            qualifications: sortedByName(state.suggestionStore.allQualifications),
            trainings: sortedByName(state.suggestionStore.allTrainings),
            languages: sortedByName(state.suggestionStore.allLanguages),
            projectRoles: sortedByName(state.suggestionStore.allProjectRoles),
            companies: sortedByName(state.suggestionStore.allCompanies),
            currentlyUsedSkillNames: state.suggestionStore.allSkills,
            nameEntityUsageInfo: state.statisticsReducer.nameEntityUsageInfo,
            consultantNames: state.consultantNames.names,
            aliases: state.suggestionStore.allAliases,
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): NameEntityOverviewDispatch {
        return {
            requestAllNameEntities: () => dispatch(SuggestionAsyncActionCreator.requestAllNameEntities()),
            requestNameEntityUsageInfo: (nameEntity, type) => dispatch(StatisticsActionCreator.AsyncRequestNameEntityUsageInfo(nameEntity, type)),
            requestCurrentlyUsedSkills: () => dispatch(SuggestionAsyncActionCreator.requestAllSkills()),
            deleteNameEntity: (nameEntity, users) => dispatch(AdminActionCreator.AsyncDeleteNameEntity(nameEntity, users)),
            addAlias: (nameEntity, alias) => dispatch(AdminActionCreator.AsyncAddNameEntityAlias(nameEntity, alias)),
            deleteAlias: (nameEntity, alias) => dispatch(AdminActionCreator.AsyncDeleteNameEntityAlias(nameEntity, alias)),
        };
    }

    private handleSelect = (e: React.ChangeEvent<{ value: any }>) => {
        this.props.history.push(typeUrl(e.target.value));
    };

    private getNameEntitiesByField = (selectedField: ProfileElementType) => entitiesOf(this.props, selectedField);


    private handleSelectEntity = (nameEntity: NameEntity) => {
        this.props.history.push(Paths.build(Paths.ADMIN_INFO_NAME_ENTITY_ENTRY, {
            type: toUrlType(this.selectedField()), id: String(nameEntity.id), slug: StringUtils.slug(nameEntity.name)
        }));
    };

    /**
     * Asks first (makeDeferrable): the profiles using it come from the database, with their short names (#216)
     */
    private handleDelete = (selected: NameEntity) => {
        ProfileServiceClient.instance().getNameEntityUsers(selected.id)
            .then(users => this.props.deleteNameEntity(selected, users.map(initials =>
                this.props.consultantNames[initials] ? this.props.consultantNames[initials].shortName : initials)))
            .catch(console.error);
    };

    private renderActions = (selected: NameEntity) => <div>
        <PwrIconButton iconName="edit" tooltip={PowerLocalize.get('AdminClient.NameEntity.Rename.Action')}
                       onClick={() => this.setState({dialog: 'rename'})}/>
        <PwrIconButton iconName="call_merge" tooltip={PowerLocalize.get('Action.Merge')}
                       onClick={() => this.setState({dialog: 'merge'})}/>
        <PwrIconButton iconName="delete" tooltip={PowerLocalize.get('Action.Delete')}
                       onClick={() => this.handleDelete(selected)}/>
    </div>;

    private renderInfoBox = (selected: NameEntity | undefined) => {
        const usageInfo = selected && this.props.nameEntityUsageInfo.get(selected);
        return <ProfileElementInfo name={selected && displayName(selected)} usedBy={usageInfo && usageInfo.toArray()}
                                   action={selected && this.renderActions(selected)}>
            {selected && this.renderAliases(selected)}
        </ProfileElementInfo>;
    };

    /** Further names a consultant can type for the element, former names among them (#270) */
    private renderAliases = (selected: NameEntity) => {
        const aliases = this.props.aliases
            .filter(alias => alias.type === selected.type && alias.currentName === selected.name)
            .map(alias => alias.name);
        return <PwrFormSection title={PowerLocalize.get('AdminClient.NameEntity.Alias.Title')}>
            <Typography variant="body2" color="textSecondary">
                {PowerLocalize.get('AdminClient.NameEntity.Alias.Help')}
            </Typography>
            <AliasList key={selected.id}
                       name={displayName(selected)}
                       aliases={Immutable.List(aliases)}
                       onAliasAdd={alias => this.props.addAlias(selected, alias)}
                       onAliasDelete={alias => this.props.deleteAlias(selected, alias)}/>
        </PwrFormSection>;
    };

    private renderDialogs(selected: NameEntity | undefined) {
        const type = this.selectedField();
        const typeLabel = PowerLocalize.get(`NameEntityType.${type}`);
        const closeDialog = () => this.setState({dialog: null});
        return <>
            {selected && <NameEntityChangeDialog open={this.state.dialog === 'rename' || this.state.dialog === 'merge'}
                                                 mode={this.state.dialog === 'merge' ? 'merge' : 'rename'}
                                                 nameEntity={selected} entities={this.getNameEntitiesByField(type)}
                                                 typeLabel={typeLabel} onClose={closeDialog}
                                                 onDone={this.handleSelectEntity}/>}
        </>;
    }

    private renderSelect() {
        return <>
            {this.renderTypeSelect()}
            <PwrSpacer size="tight"/>
            {/* Unused ones show 0 users; deleting them is a matter of the housekeeping (#288) */}
            <PwrButton color="primary" text={PowerLocalize.get('AdminClient.NameEntity.Unused.Housekeeping')}
                       icon={<Icon className="material-icons">delete_sweep</Icon>}
                       onClick={() => this.props.history.push(Paths.ADMIN_HOUSEKEEPING)}/>
        </>;
    }

    private renderTypeSelect() {
        return <FormControl variant="filled" fullWidth>
            <InputLabel id="name-entity-overview-element-type-label" htmlFor="name-entity-overview-element-type">
                {PowerLocalize.get('AdminClient.Menu.Info.ProfileElements.ElementTypes')}
            </InputLabel>
            <Select value={this.selectedField()} labelId="name-entity-overview-element-type-label"
                    inputProps={{name: 'element-type', id: 'name-entity-overview-element-type'}}
                    onChange={this.handleSelect}>
                {NameEntityUtil.getProfileElementTypes().map(value =>
                    <MenuItem key={value} value={value}>
                        <ListItemText primary={PowerLocalize.get(`NameEntityType.${value}`)}/>
                    </MenuItem>)}
            </Select>
        </FormControl>;
    }

    render() {
        const nameEntities = this.getNameEntitiesByField(this.selectedField());
        const selected = this.selectedEntity();
        return <>
            {this.renderDialogs(selected)}
            <ProfileElementLayout
            filter={this.renderSelect()}
            list={<PwrListTable label={PowerLocalize.get(`NameEntityType.${this.selectedField()}`)}
                                items={nameEntities}
                                itemKey={nameEntity => String(nameEntity.id)}
                                selectedKey={selected && String(selected.id)}
                                onSelect={this.handleSelectEntity}
                                emptyText={PowerLocalize.get('AdminClient.Overview.NoEntries')}
                                columns={[{header: PowerLocalize.get('AdminClient.Overview.Name'), render: renderName},
                                    {
                                        header: PowerLocalize.get('AdminClient.Overview.Users'),
                                        width: USAGE_COLUMN_WIDTH,
                                        alignRight: true,
                                        render: nameEntity => <PwrUsageCount count={this.usageOf(nameEntity)}/>
                                    }]}/>}
            info={this.renderInfoBox(selected)}
        />
        </>;
    }
}

const connected = withRouter(withTheme((connect(NameEntityOverviewModule.mapStateToProps, NameEntityOverviewModule.mapDispatchToProps)(NameEntityOverviewModule))));


/**
 * @see NameEntityOverviewModule
 * @author nt
 * @since 04.07.2017
 */
export const NameEntityOverview = connected;
