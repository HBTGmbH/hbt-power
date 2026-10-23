import {connect} from 'react-redux';
import * as React from 'react';
import {ProfileElementType} from '../../../../Store';
import {FormControl, InputLabel, MenuItem, Select, Typography, withTheme} from '@material-ui/core';
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
}

type NameEntityOverviewLocalProps = RouteComponentProps;

interface NameEntityOverviewLocalState {
}

interface NameEntityOverviewDispatch {
    requestAllNameEntities(): void;

    requestCurrentlyUsedSkills(): void;

    requestNameEntityUsageInfo(nameEntity: NameEntity, type: ProfileElementType): void;
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

class NameEntityOverviewModule extends React.Component<NameEntityOverviewProps
    & NameEntityOverviewLocalProps
    & NameEntityOverviewDispatch
    & ThemeProps, NameEntityOverviewLocalState> {

    public componentDidMount() {
        this.props.requestAllNameEntities();
        this.applyUrl();
    };

    public componentDidUpdate(prevProps: NameEntityOverviewProps & NameEntityOverviewLocalProps) {
        if (prevProps.location.pathname !== this.props.location.pathname
            || entitiesOf(prevProps, this.selectedField()) !== entitiesOf(this.props, this.selectedField())) {
            this.applyUrl();
        }
    }

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
            sectors: state.suggestionStore.allIndustrialSectors.sort(NAME_ENTITY_BY_NAME),
            keySkills: state.suggestionStore.allSpecialFields.sort(NAME_ENTITY_BY_NAME),
            careers: state.suggestionStore.allCareers.sort(NAME_ENTITY_BY_NAME),
            educations: state.suggestionStore.allEducations.sort(NAME_ENTITY_BY_NAME),
            qualifications: state.suggestionStore.allQualifications.sort(NAME_ENTITY_BY_NAME),
            trainings: state.suggestionStore.allTrainings.sort(NAME_ENTITY_BY_NAME),
            languages: state.suggestionStore.allLanguages.sort(NAME_ENTITY_BY_NAME),
            projectRoles: state.suggestionStore.allProjectRoles.sort(NAME_ENTITY_BY_NAME),
            companies: state.suggestionStore.allCompanies.sort(NAME_ENTITY_BY_NAME),
            currentlyUsedSkillNames: state.suggestionStore.allSkills,
            nameEntityUsageInfo: state.statisticsReducer.nameEntityUsageInfo,
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): NameEntityOverviewDispatch {
        return {
            requestAllNameEntities: () => dispatch(SuggestionAsyncActionCreator.requestAllNameEntities()),
            requestNameEntityUsageInfo: (nameEntity, type) => dispatch(StatisticsActionCreator.AsyncRequestNameEntityUsageInfo(nameEntity, type)),
            requestCurrentlyUsedSkills: () => dispatch(SuggestionAsyncActionCreator.requestAllSkills())
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

    private renderInfoBox = (selected: NameEntity | undefined) => {
        const usageInfo = selected && this.props.nameEntityUsageInfo.get(selected);
        return <ProfileElementInfo name={selected && displayName(selected)} usedBy={usageInfo && usageInfo.toArray()}/>;
    };

    private renderSelect() {
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
        return <ProfileElementLayout
            filter={this.renderSelect()}
            list={<PwrListTable label={PowerLocalize.get(`NameEntityType.${this.selectedField()}`)}
                                items={nameEntities}
                                itemKey={nameEntity => String(nameEntity.id)}
                                selectedKey={selected && String(selected.id)}
                                onSelect={this.handleSelectEntity}
                                emptyText={PowerLocalize.get('AdminClient.Overview.NoEntries')}
                                columns={[{header: PowerLocalize.get('AdminClient.Overview.Name'), render: renderName}]}/>}
            info={this.renderInfoBox(selected)}
        />;
    }
}

const connected = withRouter(withTheme((connect(NameEntityOverviewModule.mapStateToProps, NameEntityOverviewModule.mapDispatchToProps)(NameEntityOverviewModule))));


/**
 * @see NameEntityOverviewModule
 * @author nt
 * @since 04.07.2017
 */
export const NameEntityOverview = connected;
