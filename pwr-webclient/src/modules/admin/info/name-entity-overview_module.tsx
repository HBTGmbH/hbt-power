import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState, ProfileElementType} from '../../../Store';
import {FontIcon, List, ListItem, makeSelectable, MenuItem, Paper, SelectField, Subheader} from 'material-ui';
import {NameEntityUtil} from '../../../utils/NameEntityUtil';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {NameEntity} from '../../../model/NameEntity';
import {Comparators} from '../../../utils/Comparators';
import * as Immutable from 'immutable';
import {ProfileAsyncActionCreator} from '../../../reducers/profile/ProfileAsyncActionCreator';
import {POWER_MUI_THEME} from '../../../index';
import {StatisticsActionCreator} from '../../../reducers/statistics/StatisticsActionCreator';
import {ConsultantInfo} from '../../../model/ConsultantInfo';
import {isNullOrUndefined} from 'util';
import {ReactUtils} from '../../../utils/ReactUtils';
import wrapSelectableList = ReactUtils.wrapSelectableList;

let SelectableList = wrapSelectableList(makeSelectable(List));


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

class NameEntityOverviewModule extends React.Component<
    NameEntityOverviewProps
    & NameEntityOverviewLocalProps
    & NameEntityOverviewDispatch, NameEntityOverviewLocalState> {

    constructor(props: any) {
        super(props);
        this.state = {
            selectedField: ProfileElementType.SectorEntry,
            selectedIndex: -1
        };
    }

    public componentDidMount = () => {
        this.props.requestAllNameEntities();
    };

    static mapStateToProps(state: ApplicationState, localProps: NameEntityOverviewLocalProps): NameEntityOverviewProps {
        return {
            sectors: state.databaseReducer.sectors(),
            keySkills: state.databaseReducer.keySkills(),
            careers: state.databaseReducer.careers(),
            educations: state.databaseReducer.educations(),
            qualifications: state.databaseReducer.qualifications(),
            trainings: state.databaseReducer.trainings(),
            languages: state.databaseReducer.languages(),
            projectRoles: state.databaseReducer.projectRoles(),
            companies: state.databaseReducer.companies(),
            nameEntityUsageInfo: state.statisticsReducer.nameEntityUsageInfo(),
            currentlyUsedSkillNames: state.databaseReducer.currentlyUsedSkillNames()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): NameEntityOverviewDispatch {
        return {
            requestAllNameEntities: () => dispatch(ProfileAsyncActionCreator.requestAllNameEntities()),
            requestNameEntityUsageInfo: (nameEntity, type) => dispatch(StatisticsActionCreator.AsyncRequestNameEntityUsageInfo(nameEntity, type)),
            requestCurrentlyUsedSkills: () => dispatch(ProfileAsyncActionCreator.getAllCurrentlyUsedSkills())
        };
    }

    private handleSelect = (e: any, index: number, val: ProfileElementType) => {
        this.setState({
            selectedField: val,
            selectedIndex: -1
        });
    };

    private getNameEntitiesByField = (selectedField: ProfileElementType) => {
        switch(selectedField) {
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

    private renderUsedBy = (nameEntity: NameEntity) => {
        let usedBy: Immutable.List<ConsultantInfo> = this.props.nameEntityUsageInfo.get(nameEntity);
        if(!isNullOrUndefined(usedBy)) {
            return <List>
                {usedBy.map((value, key, iter) => <ListItem key={key}>{value.initials()}</ListItem>)}
            </List>;
        } else {
            return null;
        }
    };

    private renderInfoBox = (nameEntities: Array<NameEntity>) => {
        if(this.state.selectedIndex != -1 ) {
            let ne = nameEntities[this.state.selectedIndex];
            return <div>
                <div className="vertical-align" style={{backgroundColor: POWER_MUI_THEME.baseTheme.palette.primary2Color, height: '56px'}}>
                    <div
                        style={{fontSize: 18, color: POWER_MUI_THEME.baseTheme.palette.alternateTextColor}}
                    >
                        <FontIcon
                            style={{verticalAlign: 'middle'}}
                            className="material-icons"
                            color={POWER_MUI_THEME.baseTheme.palette.alternateTextColor}
                        >
                            info_outline
                        </FontIcon>
                        <span style={{marginLeft: '5px'}}>
                        Info
                        </span>
                    </div>
                </div>
                <Subheader>Bezeichnung</Subheader>
                <span className="padding-left-16px">{ne.name()}</span>
                <Subheader>Benutzt von</Subheader>
                {this.renderUsedBy(ne)}
            </div>;
        } else {
            return null;
        }
    };

    render() {
        let nameEntites = this.getNameEntitiesByField(this.state.selectedField);
        return (
            <div>
                <div className="row" style={{marginBottom: '16px'}}>
                    <div className="col-md-12">
                        <Paper style={{paddingLeft: '16px'}}>
                            <SelectField
                                floatingLabelText={PowerLocalize.get('AdminClient.Menu.Info.ProfileElements.ElementTypes')}
                                value={this.state.selectedField}
                                onChange={this.handleSelect}
                            >
                                {
                                    NameEntityUtil
                                        .getProfileElementTypes()
                                        .filter((value, index, array) => !(value === ProfileElementType.Project || value === ProfileElementType.SkillEntry))
                                        .map((value, index, array) => <MenuItem key={value} value={value} primaryText={PowerLocalize.get(ProfileElementType[value])}/>)
                                }
                            </SelectField>
                        </Paper>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-8">
                        <Paper>
                            <SelectableList selectedIndex={this.state.selectedIndex} onSelect={this.handleIndexSelect}>
                                {
                                    nameEntites.map((ne, key) =>  <ListItem value={key} key={key}>{ne.name()}</ListItem>)
                                }
                            </SelectableList>
                        </Paper>
                    </div>
                    <div className="col-md-4">
                        <Paper style={{width: '100%', minHeight: "400px"}}>
                            {this.renderInfoBox(nameEntites)}
                        </Paper>
                    </div>
                </div>
            </div>);
    }
}

/**
 * @see NameEntityOverviewModule
 * @author nt
 * @since 04.07.2017
 */
export const NameEntityOverview: React.ComponentClass<NameEntityOverviewLocalProps> = connect(NameEntityOverviewModule.mapStateToProps, NameEntityOverviewModule.mapDispatchToProps)(NameEntityOverviewModule);