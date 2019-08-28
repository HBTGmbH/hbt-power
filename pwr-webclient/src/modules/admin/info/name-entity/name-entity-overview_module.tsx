import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ProfileElementType} from '../../../../Store';
import {FormControl, InputLabel, List, ListItem, MenuItem, Paper, Select, withTheme} from '@material-ui/core';
import {NameEntityUtil} from '../../../../utils/NameEntityUtil';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {NAME_ENTITY_BY_NAME} from '../../../../utils/Comparators';
import * as Immutable from 'immutable';
import {StatisticsActionCreator} from '../../../../reducers/statistics/StatisticsActionCreator';
import {ConsultantInfo} from '../../../../model/ConsultantInfo';
import {ThemeProps} from '../../../../utils/ReactUtils';
import {ApplicationState} from '../../../../reducers/reducerIndex';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';
import {NameEntityInfoBox} from './name-entity-info-box';
import {SuggestionAsyncActionCreator} from '../../../../reducers/suggestions/SuggestionAsyncActionCreator';
import {NameEntity} from '../../../../reducers/profile-new/profile/model/NameEntity';

interface NameEntityOverviewProps {
    sectors: Array<NameEntity>;
    keySkills:Array<NameEntity>;
    careers:Array<NameEntity>;
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

    static mapStateToProps(state: ApplicationState, localProps: NameEntityOverviewLocalProps): NameEntityOverviewProps {
        return {
            sectors: state.suggestionStore.allIndustrialSectors.sort(NAME_ENTITY_BY_NAME),
            keySkills:state.suggestionStore.allCompanies.sort(NAME_ENTITY_BY_NAME),
            careers: state.suggestionStore.allCareers.sort(NAME_ENTITY_BY_NAME),
            educations: state.suggestionStore.allEducations.sort(NAME_ENTITY_BY_NAME),
            qualifications: state.suggestionStore.allQualifications.sort(NAME_ENTITY_BY_NAME),
            trainings: state.suggestionStore.allTrainings.sort(NAME_ENTITY_BY_NAME),
            languages: state.suggestionStore.allLanguages.sort(NAME_ENTITY_BY_NAME),
            projectRoles: state.suggestionStore.allProjectRoles.sort(NAME_ENTITY_BY_NAME),
            companies:state.suggestionStore.allCompanies.sort(NAME_ENTITY_BY_NAME),
            currentlyUsedSkillNames: state.suggestionStore.allSkills,
            nameEntityUsageInfo: state.statisticsReducer.nameEntityUsageInfo(),
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): NameEntityOverviewDispatch {
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

    private handleIndexSelect = (event: any, index: number) => {
        this.setState({
            selectedIndex: index
        });
        let nameEntity = this.getNameEntitiesByState()[index];
        this.props.requestNameEntityUsageInfo(nameEntity, this.state.selectedField);
    };

    private renderInfoBox = (nameEntities: Array<NameEntity>) => {
        if (this.state.selectedIndex != -1) {
            const ne = nameEntities[this.state.selectedIndex];
            const usageInfo = this.props.nameEntityUsageInfo.get(ne);
            const usedBy = usageInfo ? usageInfo.toArray() : [];
            return <NameEntityInfoBox name={ne.name} usedBy={usedBy.map(value => value.initials())}/>;
        } else {
            return <></>;
        }
    };

    private renderSelect() {
        return (
            <Paper style={{paddingLeft: '16px', marginBottom: '16px'}}>
                <form style={{display: 'flex', flexWrap: 'wrap', padding: '8px'}} className="fullWidth">
                    <FormControl>
                        <InputLabel
                            htmlFor="ame-entity-overview-element-type">{PowerLocalize.get('AdminClient.Menu.Info.ProfileElements.ElementTypes')}</InputLabel>
                        <Select value={this.state.selectedField}
                                inputProps={{name: 'element-type', id: 'name-entity-overview-element-type'}}
                                onChange={this.handleSelect}>
                            {
                                NameEntityUtil
                                    .getProfileElementTypes()
                                    .map((value, index, array) => <MenuItem key={value} value={value}
                                                                            button><ListItemText
                                        primary={PowerLocalize.get(`NameEntityType.${value}`)}/></MenuItem>)
                            }
                        </Select>
                    </FormControl>
                </form>
            </Paper>
        );
    }

    private isSelected = (index: number) => {
        return this.state.selectedIndex === index;
    };

    private renderListItem = (nameEntity: NameEntity, index: number) => {
        return <ListItem button
                         onClick={(e: any) => this.handleIndexSelect(e, index)}
                         value={index}
                         key={index}
                         className={this.isSelected(index) ? 'pwr-selected-list-item' : ''}
        >
            {nameEntity.name}
        </ListItem>;
    };


    render() {
        let nameEntites = this.getNameEntitiesByField(this.state.selectedField);
        return (
            <div>
                {this.renderSelect()}
                <div className="row">
                    <div className="col-md-8">
                        <Paper>
                            <List>
                                {
                                    nameEntites.map(this.renderListItem)
                                }
                            </List>
                        </Paper>
                    </div>
                    <div className="col-md-4">
                        <Paper style={{width: '100%', minHeight: '400px'}}>
                            {this.renderInfoBox(nameEntites)}
                        </Paper>
                    </div>
                </div>
            </div>);
    }
}

const connected = withTheme()(connect(NameEntityOverviewModule.mapStateToProps, NameEntityOverviewModule.mapDispatchToProps)(NameEntityOverviewModule));


/**
 * @see NameEntityOverviewModule
 * @author nt
 * @since 04.07.2017
 */
export const NameEntityOverview = connected;
