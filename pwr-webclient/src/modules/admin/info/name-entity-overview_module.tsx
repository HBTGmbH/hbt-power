import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState, ProfileElementType} from '../../../Store';
import {List, ListItem, makeSelectable, MenuItem, Paper, SelectField, Subheader, FontIcon} from 'material-ui';
import {NameEntityUtil} from '../../../utils/NameEntityUtil';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {NameEntity} from '../../../model/NameEntity';
import {Comparators} from '../../../utils/Comparators';
import * as Immutable from 'immutable';
import {ProfileAsyncActionCreator} from '../../../reducers/profile/ProfileAsyncActionCreator';
import {POWER_MUI_THEME} from '../../../index';





function wrapState(ComposedComponent: any) {
    return class SelectableList extends React.Component<{selectedIndex: number, onSelect(index: number): void}, {}> {

        handleRequestChange = (event: any, index: any) => {
           this.props.onSelect(index);
        };

        render() {
            return (
                <ComposedComponent
                    value={this.props.selectedIndex}
                    onChange={this.handleRequestChange}
                >
                    {this.props.children}
                </ComposedComponent>
            );
        }
    };
}

let SelectableList = wrapState(makeSelectable(List));


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
}

interface NameEntityOverviewLocalProps {

}

interface NameEntityOverviewLocalState {
    selectedField: string;
    nameEntities: Array<NameEntity>;
    selectedIndex: number;
}

interface NameEntityOverviewDispatch {
    requestAllNameEntities(): void;
}

class NameEntityOverviewModule extends React.Component<
    NameEntityOverviewProps
    & NameEntityOverviewLocalProps
    & NameEntityOverviewDispatch, NameEntityOverviewLocalState> {

    constructor(props: any) {
        super(props);
        this.state = {
            selectedField: ProfileElementType[ProfileElementType.SectorEntry],
            nameEntities: this.getNameEntitiesByField(ProfileElementType[ProfileElementType.SectorEntry]),
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
            companies: state.databaseReducer.companies()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): NameEntityOverviewDispatch {
        return {
            requestAllNameEntities: () => dispatch(ProfileAsyncActionCreator.requestAllNameEntities())
        };
    }

    private handleSelect = (e: any, index: number, val: string) => {
        this.setState({
            selectedField: val,
            nameEntities: this.getNameEntitiesByField(val)
        });
    };

    private getNameEntitiesByField = (selectedField: string) => {
        switch(selectedField) {
            case ProfileElementType[ProfileElementType.SectorEntry]:
                return this.props.sectors.toArray().sort(Comparators.getNameEntityComparator(true));
            case ProfileElementType[ProfileElementType.KeySkill]:
                return this.props.keySkills.toArray().sort(Comparators.getNameEntityComparator(true));
            case ProfileElementType[ProfileElementType.CareerEntry]:
                return this.props.careers.toArray().sort(Comparators.getNameEntityComparator(true));
            case ProfileElementType[ProfileElementType.EducationEntry]:
                return this.props.educations.toArray().sort(Comparators.getNameEntityComparator(true));
            case ProfileElementType[ProfileElementType.QualificationEntry]:
                return this.props.qualifications.toArray().sort(Comparators.getNameEntityComparator(true));
            case ProfileElementType[ProfileElementType.TrainingEntry]:
                return this.props.trainings.toArray().sort(Comparators.getNameEntityComparator(true));
            case ProfileElementType[ProfileElementType.LanguageEntry]:
                return this.props.languages.toArray().sort(Comparators.getNameEntityComparator(true));
            case ProfileElementType[ProfileElementType.Project]:
                return this.props.projectRoles.toArray().sort(Comparators.getNameEntityComparator(true));
            case 'company':
                return this.props.companies.toArray().sort(Comparators.getNameEntityComparator(true));
            default:
                return [];
        }
    };

    private getNameEntitiesByState = () => {
        return this.getNameEntitiesByField(this.state.selectedField);
    };

    private handleIndexSelect = (index: number) => {
        this.setState({
            selectedIndex: index
        });
    };

    private renderInfoBox = () => {
        if(this.state.selectedIndex != -1 ) {
            let ne = this.state.nameEntities[this.state.selectedIndex];
            return <div>
                <div className="vertical-align" style={{backgroundColor: POWER_MUI_THEME.baseTheme.palette.primary2Color, height: '56px'}}>
                    <div
                        style={{fontSize: 18, color: POWER_MUI_THEME.baseTheme.palette.alternateTextColor}}
                    >
                        <FontIcon
                            style={{verticalAlign: "middle"}}
                            className="material-icons"
                            color={POWER_MUI_THEME.baseTheme.palette.alternateTextColor}
                        >
                            info_outline
                        </FontIcon>
                        <span style={{marginLeft: "5px"}}>
                        Info
                        </span>
                    </div>
                </div>
                <Subheader>Bezeichnung</Subheader>
                <span className="padding-left-16px">{ne.name()}</span>

                <Subheader>Benutzt von</Subheader>
            </div>;
        } else {
            return null;
        }
    };

    render() {
        return (
            <div style={{marginTop: '55px'}}>
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
                                        .getProfileElementTypeValues()
                                        .filter((value, index, array) => !(value == 'SkillEntry' || value == 'Project'))
                                        .map((value, index, array) => <MenuItem key={value} value={value} primaryText={value} />)
                                }
                                <MenuItem key={'company'} value={'company'} primaryText={'Company'} />
                            </SelectField>
                        </Paper>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-8">
                        <Paper>
                            <SelectableList selectedIndex={this.state.selectedIndex} onSelect={this.handleIndexSelect}>
                                {
                                    this.state.nameEntities.map((ne, key) =>  <ListItem value={key} key={key}>{ne.name()}</ListItem>)
                                }
                            </SelectableList>
                        </Paper>
                    </div>
                    <div className="col-md-4">
                        <Paper style={{width: '100%', height: '100%'}}>
                            {this.renderInfoBox()}
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