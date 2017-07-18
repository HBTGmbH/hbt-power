import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../Store';
import * as Immutable from 'immutable';
import {List, ListItem, makeSelectable, Paper} from 'material-ui';
import {ReactUtils} from '../../../utils/ReactUtils';
import {ProfileAsyncActionCreator} from '../../../reducers/profile/ProfileAsyncActionCreator';
import {Comparators} from '../../../utils/Comparators';
import wrapSelectableList = ReactUtils.wrapSelectableList;

let SelectableList = wrapSelectableList(makeSelectable(List));

interface UsedSkillOverviewProps {
    usedSkillNames: Immutable.Set<string>;
}

interface UsedSkillOverviewLocalProps {

}

interface UsedSkillOverviewLocalState {
    selectedIndex: string;
}

interface UsedSkillOverviewDispatch {
    loadAllUsedSkills(): void;
}

class UsedSkillOverviewModule extends React.Component<
    UsedSkillOverviewProps
    & UsedSkillOverviewLocalProps
    & UsedSkillOverviewDispatch, UsedSkillOverviewLocalState> {

    constructor(props: UsedSkillOverviewProps & UsedSkillOverviewLocalProps & UsedSkillOverviewDispatch) {
        super(props);
        this.state = {
            selectedIndex: ""
        }
    }

    static mapStateToProps(state: ApplicationState, localProps: UsedSkillOverviewLocalProps): UsedSkillOverviewProps {
        return {
            usedSkillNames: state.databaseReducer.currentlyUsedSkillNames()
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): UsedSkillOverviewDispatch {
        return {
            loadAllUsedSkills: () => dispatch(ProfileAsyncActionCreator.getAllCurrentlyUsedSkills())
        }
    }

    public componentDidMount() {
        this.props.loadAllUsedSkills();
    }

    render() {
        let sorted = this.props.usedSkillNames.sort(Comparators.getStringComparator(true));
        return (
        <Paper>
            <SelectableList selectedIndex={this.state.selectedIndex} onSelect={(idx: string) => this.setState({selectedIndex: idx})}>
                {sorted.map((name, key) =>  <ListItem value={name} key={name}>{name}</ListItem>)}
            </SelectableList>
        </Paper>);
    }
}

/**
 * @see UsedSkillOverviewModule
 * @author nt
 * @since 18.07.2017
 */
export const UsedSkillOverview: React.ComponentClass<UsedSkillOverviewLocalProps> = connect(UsedSkillOverviewModule.mapStateToProps, UsedSkillOverviewModule.mapDispatchToProps)(UsedSkillOverviewModule);