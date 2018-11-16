import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../../reducers/reducerIndex';
import {SortableEntryField, SortableEntryType} from '../../../../model/view/NameComparableType';
import {ViewProfileActionCreator} from '../../../../reducers/view/ViewProfileActionCreator';
import {EntrySortButton} from './entry-sort-button_module';

interface ComparableEntryButtonProps {

}

interface ComparableEntryButtonLocalProps {
    viewProfileId: string;
    sortableEntryField: SortableEntryField;
    sortableEntryType: SortableEntryType;
    label: string;
}

interface ComparableEntryButtonLocalState {
    order: 'asc' | 'desc';
}

interface ComparableEntryButtonDispatch {
    sortEntries(id: string, type: SortableEntryType, field: SortableEntryField, doAscending: boolean): void;
}

class ComparableEntryButtonModule extends React.Component<ComparableEntryButtonProps
    & ComparableEntryButtonLocalProps
    & ComparableEntryButtonDispatch, ComparableEntryButtonLocalState> {

    constructor(props: any) {
        super(props);
        this.state = {
            order: 'desc'
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: ComparableEntryButtonLocalProps): ComparableEntryButtonProps {
        return {};
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ComparableEntryButtonDispatch {
        return {
            sortEntries: (id, type, field, doAscending) => dispatch(ViewProfileActionCreator.AsyncAutoSortEntry(id, type, field, doAscending))
        };
    }

    private setOrder = (order: 'asc' | 'desc') => {
        this.setState({
            order: order
        });
        let doAsc = order === 'asc';
        this.props.sortEntries(this.props.viewProfileId, this.props.sortableEntryType, this.props.sortableEntryField, doAsc);
    };

    render() {
        return (<EntrySortButton
            order={this.state.order}
            label={this.props.label}
            onChangeOrder={this.setOrder}
        />);
    }
}

/**
 * @see ComparableEntryButtonModule
 * @author nt
 * @since 12.09.2017
 */
export const ComparableEntryButton: React.ComponentClass<ComparableEntryButtonLocalProps> = connect(ComparableEntryButtonModule.mapStateToProps, ComparableEntryButtonModule.mapDispatchToProps)(ComparableEntryButtonModule);