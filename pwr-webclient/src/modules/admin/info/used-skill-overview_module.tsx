import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../Store';
import * as Immutable from 'immutable';
import {AutoComplete, FontIcon, List, ListItem, makeSelectable, Paper, Subheader, TextField} from 'material-ui';
import {ReactUtils} from '../../../utils/ReactUtils';
import {ProfileAsyncActionCreator} from '../../../reducers/profile/ProfileAsyncActionCreator';
import {Comparators} from '../../../utils/Comparators';
import {POWER_MUI_THEME} from '../../../index';
import {StatisticsActionCreator} from '../../../reducers/statistics/StatisticsActionCreator';
import {ConsultantInfo} from '../../../model/ConsultantInfo';
import {isNullOrUndefined} from 'util';
import wrapSelectableList = ReactUtils.wrapSelectableList;

let SelectableList = wrapSelectableList(makeSelectable(List));

interface UsedSkillOverviewProps {
    usedSkillNames: Immutable.Set<string>;
    skillUsageInfo: Immutable.Map<string, Immutable.List<ConsultantInfo>>;
}

interface UsedSkillOverviewLocalProps {

}

interface UsedSkillOverviewLocalState {
    selectedSkillName: string;
    filterString: string;
}

interface UsedSkillOverviewDispatch {
    loadAllUsedSkills(): void;
    getSkillUsageInfo(skillName: string): void;
}

class UsedSkillOverviewModule extends React.Component<
    UsedSkillOverviewProps
    & UsedSkillOverviewLocalProps
    & UsedSkillOverviewDispatch, UsedSkillOverviewLocalState> {

    constructor(props: UsedSkillOverviewProps & UsedSkillOverviewLocalProps & UsedSkillOverviewDispatch) {
        super(props);
        this.state = {
            selectedSkillName: '',
            filterString: ''
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: UsedSkillOverviewLocalProps): UsedSkillOverviewProps {
        return {
            usedSkillNames: state.databaseReducer.currentlyUsedSkillNames(),
            skillUsageInfo: state.statisticsReducer.skillUsageInfo()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): UsedSkillOverviewDispatch {
        return {
            loadAllUsedSkills: () => dispatch(ProfileAsyncActionCreator.getAllCurrentlyUsedSkills()),
            getSkillUsageInfo: skillName => dispatch(StatisticsActionCreator.AsyncRequestSkillUsageInfo(skillName))
        };
    }

    public componentDidMount() {
        this.props.loadAllUsedSkills();
    }

    private handleSkillSelect = (skillName: string) => {
        this.setState({
            selectedSkillName: skillName
        });
        this.props.getSkillUsageInfo(skillName);
    };

    render() {
        let res = null;
        if(this.state.filterString !== "") {
            res = this.props.usedSkillNames.filter((value) => AutoComplete.defaultFilter(this.state.filterString, value)).sort(Comparators.getStringComparator(true));
        } else {
            res = this.props.usedSkillNames.sort(Comparators.getStringComparator(true));
        }
        let values: Immutable.List<ConsultantInfo> = this.props.skillUsageInfo.get(this.state.selectedSkillName);
        return (
            <div className="row">
                <div className="col-md-8">
                    <Paper>
                        <TextField value={this.state.filterString} onChange={(e, v) => this.setState({filterString: v})}/>
                        <SelectableList selectedIndex={this.state.selectedSkillName} onSelect={this.handleSkillSelect}>
                            {res.map((name, key) =>  <ListItem value={name} key={name}>{name}</ListItem>)}
                        </SelectableList>
                    </Paper>
                </div>
                <div className="col-md-4" >
                    <Paper style={{width: '100%', minHeight: '400px', position: "sticky", top: 0}}>
                        <div className="vertical-align" style={{backgroundColor: POWER_MUI_THEME.baseTheme.palette.primary1Color, height: '56px'}}>
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
                        <span className="padding-left-16px">{this.state.selectedSkillName}</span>
                        <Subheader>Benutzt von</Subheader>
                        <List>
                        {
                            !isNullOrUndefined(values) ? values.map((value, key, iter) => <ListItem disabled key={key}>{value.getFullName()}</ListItem>) : null
                        }
                        </List>
                    </Paper>
                </div>
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