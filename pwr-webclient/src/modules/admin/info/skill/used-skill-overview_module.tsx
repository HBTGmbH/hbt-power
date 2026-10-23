import {connect} from 'react-redux';
import * as React from 'react';
import * as Immutable from 'immutable';
import {TextField} from '@material-ui/core';
import {Comparators} from '../../../../utils/Comparators';
import {StatisticsActionCreator} from '../../../../reducers/statistics/StatisticsActionCreator';
import {ConsultantInfo} from '../../../../model/ConsultantInfo';
import {SkillActionCreator} from '../../../../reducers/skill/SkillActionCreator';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {ApplicationState} from '../../../../reducers/reducerIndex';
import {MergeSkillDialog} from './merge-skill-dialog_module';
import {StringUtils} from '../../../../utils/StringUtil';
import {UsedSkillInfoBox} from './used-skill-info-box';
import {SuggestionAsyncActionCreator} from '../../../../reducers/suggestions/SuggestionAsyncActionCreator';
import {PwrListTable} from '../../../general/pwr-list-table';
import {ProfileElementLayout} from '../profile-element-layout';
import {ThunkDispatch} from 'redux-thunk';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import {Paths} from '../../../../Paths';


interface UsedSkillOverviewProps {
    usedSkillNames: Array<string>;
    skillUsageInfo: Immutable.Map<string, Immutable.List<ConsultantInfo>>;
    skillHierarchies: Immutable.Map<string, string>;
}

type UsedSkillOverviewLocalProps = RouteComponentProps;

interface UsedSkillOverviewLocalState {
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
            filterString: '',
            editOpen: false
        };
    }

    static mapStateToProps(state: ApplicationState): UsedSkillOverviewProps {
        return {
            usedSkillNames: state.suggestionStore.allSkills,
            skillUsageInfo: state.statisticsReducer.skillUsageInfo,
            skillHierarchies: state.skillReducer.categorieHierarchiesBySkillName
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
        this.loadSelected();
    }

    public componentDidUpdate(prevProps: UsedSkillOverviewProps & UsedSkillOverviewLocalProps) {
        if (prevProps.location.search !== this.props.location.search) {
            this.loadSelected();
        }
        // A merged or unknown skill is not in the list: the list without a selection
        const selected = this.selectedSkillName();
        if (selected !== '' && this.props.usedSkillNames.length > 0 && !this.props.usedSkillNames.includes(selected)) {
            this.props.history.replace(Paths.ADMIN_INFO_USED_SKILLS);
        }
    }

    /**
     * The selected skill is in the URL (#212): its name as query parameter, since names may hold "/", "#" or "?";
     * the slug in the path is only for reading
     */
    private selectedSkillName = (): string => {
        return new URLSearchParams(this.props.location.search).get('name') || '';
    };

    private loadSelected = () => {
        const skillName = this.selectedSkillName();
        if (skillName !== '') {
            this.props.getSkillUsageInfo(skillName);
            this.props.getSkillHierarchy(skillName);
        }
    };

    private handleSkillSelect = (skillName: string) => {
        const path = Paths.build(Paths.ADMIN_INFO_USED_SKILL, {slug: StringUtils.slug(skillName)});
        this.props.history.push(path + '?name=' + encodeURIComponent(skillName));
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

    private skillHierarchy = () => {
        return this.props.skillHierarchies.get(this.selectedSkillName());
    };

    render() {
        let res;
        if (this.state.filterString !== '') {
            res = this.props.usedSkillNames.filter((value) => StringUtils.filterFuzzy(this.state.filterString, value)).sort(Comparators.getStringComparator(true));
        } else {
            res = this.props.usedSkillNames.sort(Comparators.getStringComparator(true));
        }
        const selectedSkillName = this.selectedSkillName();
        const usedBy = this.props.skillUsageInfo.get(selectedSkillName);
        return (
            <div>
                <MergeSkillDialog skillInfo={usedBy}
                                  skillToMerge={selectedSkillName}
                                  open={this.state.editOpen}
                                  onClose={this.closeEditDialog}
                />
                <ProfileElementLayout
                    filter={<TextField
                        value={this.state.filterString}
                        onChange={(e) => this.setState({filterString: e.target.value})}
                        label={PowerLocalize.get('Action.Search')}
                        fullWidth
                    />}
                    list={<PwrListTable label={PowerLocalize.get('AdminClient.Overview.Skills')}
                                        items={res}
                                        itemKey={name => name}
                                        selectedKey={selectedSkillName}
                                        onSelect={this.handleSkillSelect}
                                        emptyText={PowerLocalize.get('AdminClient.Overview.NoEntries')}
                                        columns={[{header: PowerLocalize.get('AdminClient.Overview.Name'), render: name => name}]}/>}
                    info={<UsedSkillInfoBox skillHierarchy={this.skillHierarchy()}
                                            usedBy={usedBy ? usedBy.toArray() : undefined}
                                            skillName={selectedSkillName}
                                            onOpenEdit={this.openEditDialog}/>}
                />
            </div>
        );
    }
}

/**
 * @see UsedSkillOverviewModule
 * @author nt
 * @since 18.07.2017
 */
export const UsedSkillOverview = withRouter(connect(UsedSkillOverviewModule.mapStateToProps, UsedSkillOverviewModule.mapDispatchToProps)(UsedSkillOverviewModule));
