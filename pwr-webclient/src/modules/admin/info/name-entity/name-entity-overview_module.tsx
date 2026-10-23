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

interface NameEntityOverviewLocalProps {

}

interface NameEntityOverviewLocalState {
    selectedField: ProfileElementType;
    selectedIndex: number;
}

interface NameEntityOverviewDispatch {
    requestAllNameEntities(): void;

    requestCurrentlyUsedSkills(): void;

    requestNameEntityUsageInfo(nameEntity: NameEntity, type: ProfileElementType): void;
}

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

    constructor(props: any) {
        super(props);
        this.state = {
            selectedField: ProfileElementType.SectorEntry,
            selectedIndex: -1
        };
    }

    public componentDidMount() {
        this.props.requestAllNameEntities();
    };

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
        this.setState({
            selectedField: e.target.value,
            selectedIndex: -1
        });
    };

    private getNameEntitiesByField = (selectedField: ProfileElementType) => {
        switch (selectedField) {
            case ProfileElementType.SectorEntry:
                return this.props.sectors;
            case ProfileElementType.SpecialField:
                return this.props.keySkills;
            case ProfileElementType.CareerEntry:
                return this.props.careers;
            case ProfileElementType.EducationEntry:
                return this.props.educations;
            case ProfileElementType.QualificationEntry:
                return this.props.qualifications;
            case ProfileElementType.TrainingEntry:
                return this.props.trainings;
            case ProfileElementType.LanguageEntry:
                return this.props.languages;
            case ProfileElementType.Company:
                return this.props.companies;
            case ProfileElementType.ProjectRole:
                return this.props.projectRoles;
            default:
                return [];
        }
    };

    private getNameEntitiesByState = () => {
        return this.getNameEntitiesByField(this.state.selectedField);
    };

    private handleSelectEntity = (nameEntity: NameEntity) => {
        this.setState({
            selectedIndex: this.getNameEntitiesByState().indexOf(nameEntity)
        });
        this.props.requestNameEntityUsageInfo(nameEntity, this.state.selectedField);
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
            <Select value={this.state.selectedField} labelId="name-entity-overview-element-type-label"
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
        const nameEntities = this.getNameEntitiesByField(this.state.selectedField);
        const selected = this.state.selectedIndex >= 0 ? nameEntities[this.state.selectedIndex] : undefined;
        return <ProfileElementLayout
            filter={this.renderSelect()}
            list={<PwrListTable label={PowerLocalize.get(`NameEntityType.${this.state.selectedField}`)}
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

const connected = withTheme((connect(NameEntityOverviewModule.mapStateToProps, NameEntityOverviewModule.mapDispatchToProps)(NameEntityOverviewModule)));


/**
 * @see NameEntityOverviewModule
 * @author nt
 * @since 04.07.2017
 */
export const NameEntityOverview = connected;
