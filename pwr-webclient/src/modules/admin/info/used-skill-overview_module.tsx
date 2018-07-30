import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import * as Immutable from 'immutable';
import {
    //AutoComplete,
    Icon,
    List,
    ListItem,
    //makeSelectable,
    Paper,
    Button,
    ListSubheader,
    TextField
} from '@material-ui/core';
import {ReactUtils} from '../../../utils/ReactUtils';
import {ProfileAsyncActionCreator} from '../../../reducers/profile/ProfileAsyncActionCreator';
import {Comparators} from '../../../utils/Comparators';
import {POWER_MUI_THEME} from '../../../index';
import {StatisticsActionCreator} from '../../../reducers/statistics/StatisticsActionCreator';
import {ConsultantInfo} from '../../../model/ConsultantInfo';
import {isNullOrUndefined} from 'util';
import {SkillActionCreator} from '../../../reducers/skill/SkillActionCreator';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {EditSkillDialog} from './skill/edit-skill-dialog_module';
import wrapSelectableList = ReactUtils.wrapSelectableList;
// TODO Autocomplete
// TODO makeSelectable

//let SelectableList = wrapSelectableList(makeSelectable(List));

interface UsedSkillOverviewProps {
    usedSkillNames: Immutable.Set<string>;
    skillUsageInfo: Immutable.Map<string, Immutable.List<ConsultantInfo>>;
    skillHierarchies: Immutable.Map<string, string>;
}

interface UsedSkillOverviewLocalProps {

}

interface UsedSkillOverviewLocalState {
    selectedSkillName: string;
    filterString: string;
    editOpen: boolean;
}

interface UsedSkillOverviewDispatch {
    loadAllUsedSkills(): void;
    getSkillUsageInfo(skillName: string): void;
    getSkillHierarchy(skillName: string): void;
}

class UsedSkillOverviewModule extends React.Component<
    UsedSkillOverviewProps
    & UsedSkillOverviewLocalProps
    & UsedSkillOverviewDispatch, UsedSkillOverviewLocalState> {

    constructor(props: UsedSkillOverviewProps & UsedSkillOverviewLocalProps & UsedSkillOverviewDispatch) {
        super(props);
        this.state = {
            selectedSkillName: '',
            filterString: '',
            editOpen: false
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: UsedSkillOverviewLocalProps): UsedSkillOverviewProps {
        return {
            usedSkillNames: state.databaseReducer.currentlyUsedSkillNames(),
            skillUsageInfo: state.statisticsReducer.skillUsageInfo(),
            skillHierarchies: state.skillReducer.categorieHierarchiesBySkillName()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): UsedSkillOverviewDispatch {
        return {
            loadAllUsedSkills: () => dispatch(ProfileAsyncActionCreator.getAllCurrentlyUsedSkills()),
            getSkillUsageInfo: skillName => dispatch(StatisticsActionCreator.AsyncRequestSkillUsageInfo(skillName)),
            getSkillHierarchy: skillName => dispatch(SkillActionCreator.AsyncRequestSkillHierarchy(skillName))
        };
    }

    public componentDidMount() {
        this.props.loadAllUsedSkills();
    }

    private handleSkillSelect = (event: any, skillName: string) => {
        this.setState({
            selectedSkillName: skillName,
        });
        this.props.getSkillUsageInfo(skillName);
        this.props.getSkillHierarchy(skillName);
    };

    private closeEditDialog = () => {
        this.setState({
            editOpen: false
        })
    };

    private openEditDialog = () => {
        this.setState({
            editOpen: true
        })
    };

// TODO Color Palette
    render() {
        let res = null;
        if(this.state.filterString !== "") {
            // TODO bei admin skill tree2 abgucken (filter dispatchen und map state to probs result abholen)
            //res = this.props.usedSkillNames.filter(this.state.filterString);// =>  value.sort(Comparators.getStringComparator(true));// Autocomplete
        } else {
            res = this.props.usedSkillNames.sort(Comparators.getStringComparator(true));
        }
        let values: Immutable.List<ConsultantInfo> = this.props.skillUsageInfo.get(this.state.selectedSkillName);
        return (
            <div className="row">
                <EditSkillDialog skillInfo={this.props.skillUsageInfo.get(this.state.selectedSkillName)}
                                 skillToEdit={this.state.selectedSkillName}
                                 open={this.state.editOpen}
                                 onClose={this.closeEditDialog}
                />
                <div className="col-md-8">
                    <Paper>
                        <TextField
                            value={this.state.filterString}
                            onChange={(e) => this.setState({filterString: e.target.value})}
                            label={PowerLocalize.get("Action.Search")}
                            style={{paddingLeft: "8px"}}
                        />
                        <List
                            //selectedIndex={this.state.selectedSkillName}
                            //onSelect={this.handleSkillSelect}
                            >
                            {/*TODO null error check*/}
                            {res === null ? <ListItem>ERROR</ListItem> :
                                res.map((name, key) =>
                                    <ListItem
                                        value={name}
                                        key={name}
                                        onChange={(e:any) => console.log(e)}
                                    >
                                    {name}
                                    </ListItem>)
                                }
                        </List>
                    </Paper>
                </div>
                {this.state.selectedSkillName !== "" ?
                    <div className="col-md-4"  >
                        <Paper id="admin-info-panel">
                            <div className="vertical-align" style={{ height: '56px'}}>
                                <div
                                    style={{fontSize: 18}}
                                >
                                    <Icon
                                        style={{verticalAlign: 'middle'}}
                                        className="material-icons"
                                        color={'default'}
                                    >
                                        info_outline
                                    </Icon>
                                    <span style={{marginLeft: '5px'}}>
                                Info
                                </span>
                                </div>
                            </div>
                            <ListSubheader>{PowerLocalize.get("AdminClient.Infos.UsedSkills.SkillQualifier")}</ListSubheader>
                            <span className="padding-left-16px">{this.state.selectedSkillName}</span>
                            <ListSubheader>{PowerLocalize.get("AdminClient.Infos.UsedSkills.SkillHiearchy")}</ListSubheader>
                            <div className="padding-left-16px">
                                {
                                    isNullOrUndefined(this.props.skillHierarchies.get(this.state.selectedSkillName))
                                        ? "Keine Kategorisierung vorhanden"
                                        : this.props.skillHierarchies.get(this.state.selectedSkillName)

                                }
                            </div>
                            <Button
                                    color={'primary'}
                                    variant={'raised'}
                                    onClick={this.openEditDialog}
                                    className="mui-margin"
                            >
                                {PowerLocalize.get("Action.Edit")}
                                <Icon className="material-icons">edit</Icon>
                            </Button>

                            <ListSubheader>{PowerLocalize.get("AdminClient.Infos.UsedSkills.UsedBy")}</ListSubheader>
                            <List>
                            {
                                !isNullOrUndefined(values) ? values.map((value, key, iter) => <ListItem disabled key={key}>{value.getFullName()}</ListItem>) : null
                            }
                            </List>
                        </Paper>
                    </div>
                        :
                    null
                }
            </div>
        );
    }
}

/**
 * @see UsedSkillOverviewModule
 * @author nt
 * @since 18.07.2017
 */
export const UsedSkillOverview: React.ComponentClass<UsedSkillOverviewLocalProps> = connect(UsedSkillOverviewModule.mapStateToProps, UsedSkillOverviewModule.mapDispatchToProps)(UsedSkillOverviewModule);