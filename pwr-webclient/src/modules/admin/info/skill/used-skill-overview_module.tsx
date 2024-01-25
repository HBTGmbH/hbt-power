import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import * as Immutable from 'immutable';
import {List, ListItem, Paper, TextField} from '@material-ui/core';
import {Comparators} from '../../../../utils/Comparators';
import {StatisticsActionCreator} from '../../../../reducers/statistics/StatisticsActionCreator';
import {ConsultantInfo} from '../../../../model/ConsultantInfo';
import {SkillActionCreator} from '../../../../reducers/skill/SkillActionCreator';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {ApplicationState} from '../../../../reducers/reducerIndex';
import {EditSkillDialog} from './edit-skill-dialog_module';
import {StringUtils} from '../../../../utils/StringUtil';
import {UsedSkillInfoBox} from './used-skill-info-box';
import {toArray} from '../../../../utils/ImmutableUtils';
import {SuggestionAsyncActionCreator} from '../../../../reducers/suggestions/SuggestionAsyncActionCreator';
import filterFuzzy = StringUtils.filterFuzzy;
import {ThunkDispatch} from 'redux-thunk';


interface UsedSkillOverviewProps {
    usedSkillNames: Array<string>;
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

class UsedSkillOverviewModule extends React.Component<UsedSkillOverviewProps
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
            usedSkillNames: state.suggestionStore.allSkills,
            skillUsageInfo: state.statisticsReducer.skillUsageInfo(),
            skillHierarchies: state.skillReducer.categorieHierarchiesBySkillName()
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): UsedSkillOverviewDispatch {
        return {
            loadAllUsedSkills: () => dispatch(SuggestionAsyncActionCreator.requestAllSkills()),
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
        });
    };

    private openEditDialog = () => {
        this.setState({
            editOpen: true
        });
    };

    private isSelected = (name: string) => {
        return name === this.state.selectedSkillName;
    };

    private selectedClass = (name: string) => {
        if (this.isSelected(name)) {
            return 'pwr-selected-list-item';
        } else {
            return '';
        }
    };

    private renderSkillItem = (name: string) => {
        return <ListItem button
                         className={this.selectedClass(name)}
                         key={name}
                         onChange={(e: any) => console.debug(e)}
                         onClick={() => this.handleSkillSelect(null, name)}
        >
            {name}
        </ListItem>;
    };

    private renderSkills = (skills: Array<string> | null) => {
        if (skills) {
            return skills.map(this.renderSkillItem);
        }
        return <></>;
    };

    private skillHierarchy = () => {
        return this.props.skillHierarchies.get(this.state.selectedSkillName);
    };

    render() {
        let res = null;
        if (this.state.filterString !== '') {
            res = this.props.usedSkillNames.filter((value) => filterFuzzy(this.state.filterString, value)).sort(Comparators.getStringComparator(true));
        } else {
            res = this.props.usedSkillNames.sort(Comparators.getStringComparator(true));
        }
        let skillUsageInfo: Array<ConsultantInfo> = toArray(this.props.skillUsageInfo.get(this.state.selectedSkillName));
        return (
            <div>
                <EditSkillDialog skillInfo={this.props.skillUsageInfo.get(this.state.selectedSkillName)}
                                 skillToEdit={this.state.selectedSkillName}
                                 open={this.state.editOpen}
                                 onClose={this.closeEditDialog}
                />

                <Paper style={{paddingLeft: '16px', marginBottom: '16px'}}>
                    <TextField
                        value={this.state.filterString}
                        onChange={(e) => this.setState({filterString: e.target.value})}
                        label={PowerLocalize.get('Action.Search')}
                        style={{paddingLeft: '8px', paddingBottom: '3px'}}
                    />
                </Paper>

                <div className={'row'}>
                    <div className={'col-md-8'}>
                        <Paper>
                            <List>
                                {this.renderSkills(res)}</List>
                        </Paper>
                    </div>
                    <div className="col-md-4">
                        <div style={{marginTop: '8px'}}>
                            <UsedSkillInfoBox skillHierarchy={this.skillHierarchy()}
                                              usedBy={skillUsageInfo}
                                              skillName={this.state.selectedSkillName}
                                              onOpenEdit={this.openEditDialog}/>
                        </div>
                    </div>
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
export const UsedSkillOverview = connect(UsedSkillOverviewModule.mapStateToProps, UsedSkillOverviewModule.mapDispatchToProps)(UsedSkillOverviewModule);
