import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ProfileElementType} from '../../../../Store';
import {FormControl, InputLabel, List, ListItem, MenuItem, Paper, Select, withTheme} from '@material-ui/core';
import {NameEntityUtil} from '../../../../utils/NameEntityUtil';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {NameEntity} from '../../../../model/NameEntity';
import {Comparators} from '../../../../utils/Comparators';
import * as Immutable from 'immutable';
import {ProfileAsyncActionCreator} from '../../../../reducers/profile/ProfileAsyncActionCreator';
import {StatisticsActionCreator} from '../../../../reducers/statistics/StatisticsActionCreator';
import {ConsultantInfo} from '../../../../model/ConsultantInfo';
import {ThemeProps} from '../../../../utils/ReactUtils';
import {ApplicationState} from '../../../../reducers/reducerIndex';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';
import {NameEntityInfoBox} from './name-entity-info-box';

interface NameEntityOverviewProps {
    sectors: Immutable.Map<string, NameEntity>;
    keySkills: Immutable.Map<string, NameEntity>;
    careers: Immutable.Map<string, NameEntity>;
    educations: Immutable.Map<string, NameEntity>;
    qualifications: Immutable.Map<string, NameEntity>;
    trainings: Immutable.Map<string, NameEntity>;
    languages: Immutable.Map<string, NameEntity>;
    projectRoles: Immutable.Map<string, NameEntity>;
    companies: Immutable.Map<string, NameEntity>;
    currentlyUsedSkillNames: Immutable.Set<string>;
    nameEntityUsageInfo: Immutable.Map<NameEntity, Immutable.List<ConsultantInfo>>
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

    requestNameEntityUsageInfo(nameEntity: NameEntity, type: string): void;
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
        // return {
        //     sectors: state.databaseReducer.sectors(),
        //     keySkills: state.databaseReducer.keySkills(),
        //     careers: state.databaseReducer.careers(),
        //     educations: state.databaseReducer.educations(),
        //     qualifications: state.databaseReducer.qualifications(),
        //     trainings: state.databaseReducer.trainings(),
        //     languages: state.databaseReducer.languages(),
        //     projectRoles: state.databaseReducer.projectRoles(),
        //     companies: state.databaseReducer.companies(),
        //     nameEntityUsageInfo: state.statisticsReducer.nameEntityUsageInfo(),
        //     currentlyUsedSkillNames: state.databaseReducer.currentlyUsedSkillNames()
        // };
        // TODO this needs to be refilled + reworked to the new suggestion store.
        return {
            sectors: Immutable.Map<string, NameEntity>(),
            keySkills: Immutable.Map<string, NameEntity>(),
            careers: Immutable.Map<string, NameEntity>(),
            educations: Immutable.Map<string, NameEntity>(),
            qualifications: Immutable.Map<string, NameEntity>(),
            trainings: Immutable.Map<string, NameEntity>(),
            languages: Immutable.Map<string, NameEntity>(),
            projectRoles: Immutable.Map<string, NameEntity>(),
            companies: Immutable.Map<string, NameEntity>(),
            currentlyUsedSkillNames: Immutable.Set<string>(),
            nameEntityUsageInfo: Immutable.Map<NameEntity, Immutable.List<ConsultantInfo>>(),
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): NameEntityOverviewDispatch {
        return {
            requestAllNameEntities: () => dispatch(ProfileAsyncActionCreator.requestAllNameEntities()),
            requestNameEntityUsageInfo: (nameEntity, type) => dispatch(StatisticsActionCreator.AsyncRequestNameEntityUsageInfo(nameEntity, type)),
            requestCurrentlyUsedSkills: () => dispatch(ProfileAsyncActionCreator.getAllCurrentlyUsedSkills())
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
                return this.props.sectors.toArray().sort(Comparators.getNameEntityComparator(true));
            case ProfileElementType.KeySkill:
                return this.props.keySkills.toArray().sort(Comparators.getNameEntityComparator(true));
            case ProfileElementType.CareerEntry:
                return this.props.careers.toArray().sort(Comparators.getNameEntityComparator(true));
            case ProfileElementType.EducationEntry:
                return this.props.educations.toArray().sort(Comparators.getNameEntityComparator(true));
            case ProfileElementType.QualificationEntry:
                return this.props.qualifications.toArray().sort(Comparators.getNameEntityComparator(true));
            case ProfileElementType.TrainingEntry:
                return this.props.trainings.toArray().sort(Comparators.getNameEntityComparator(true));
            case ProfileElementType.LanguageEntry:
                return this.props.languages.toArray().sort(Comparators.getNameEntityComparator(true));
            case ProfileElementType.Project:
                return this.props.projectRoles.toArray().sort(Comparators.getNameEntityComparator(true));
            case ProfileElementType.Company:
                return this.props.companies.toArray().sort(Comparators.getNameEntityComparator(true));
            case ProfileElementType.ProjectRole:
                return this.props.projectRoles.toArray().sort(Comparators.getNameEntityComparator(true));
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
        this.props.requestNameEntityUsageInfo(nameEntity, NameEntityUtil.typeToViewAPIString(this.state.selectedField));
    };

    private renderInfoBox = (nameEntities: Array<NameEntity>) => {
        if (this.state.selectedIndex != -1) {
            const ne = nameEntities[this.state.selectedIndex];
            const usedBy: Immutable.List<ConsultantInfo> = this.props.nameEntityUsageInfo.get(ne);
            return <NameEntityInfoBox nameEntity={ne} usedBy={usedBy ? usedBy.toArray() : []}/>;
        } else {
            return null;
        }
    };

    // rendert das drop down menu
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
                                    .filter((value, index, array) => !(value === ProfileElementType.Project || value === ProfileElementType.SkillEntry))
                                    .map((value, index, array) => <MenuItem key={value} value={value}
                                                                            button><ListItemText
                                        primary={PowerLocalize.get(ProfileElementType[value])}/></MenuItem>)
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
            {nameEntity.name()}
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
