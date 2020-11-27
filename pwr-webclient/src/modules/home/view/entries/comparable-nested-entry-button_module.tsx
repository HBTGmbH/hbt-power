import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../../reducers/reducerIndex';
import {SortableEntryField, SortableEntryType} from '../../../../model/view/NameComparableType';
import {ViewProfileActionCreator} from '../../../../reducers/view/ViewProfileActionCreator';
import {EntrySortButton} from './entry-sort-button_module';
import {ThunkDispatch} from 'redux-thunk';

interface ComparableNestedEntryButtonProps {

}

interface ComparableNestedEntryButtonLocalProps {
    container: 'PROJECT' | 'DISPLAY_CATEGORY';
    containerIndex: number;
    viewProfileId: string;
    sortableEntryField: SortableEntryField;
    sortableEntryType: SortableEntryType;
    label: string;
}

interface ComparableNestedEntryButtonLocalState {
    order: 'asc' | 'desc';
}

interface ComparableNestedEntryButtonDispatch {
    sortNestedEntries(id: string, container: 'PROJECT' | 'DISPLAY_CATEGORY', containerIndex: number, type: SortableEntryType, field: SortableEntryField, doAscending: boolean): void;
}

class ComparableNestedEntryButtonModule extends React.Component<ComparableNestedEntryButtonProps
    & ComparableNestedEntryButtonLocalProps
    & ComparableNestedEntryButtonDispatch, ComparableNestedEntryButtonLocalState> {

    constructor(props: any) {
        super(props);
        this.state = {
            order: 'desc'
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: ComparableNestedEntryButtonLocalProps): ComparableNestedEntryButtonProps {
        return {};
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): ComparableNestedEntryButtonDispatch {
        return {
            sortNestedEntries: (id, container, containerIndex, type, field, doAscending) => {
                dispatch(ViewProfileActionCreator.AsyncAutoSortNestedEntry(id, container, containerIndex, type, field, doAscending));
            }
        };
    }

    private setOrder = (order: 'asc' | 'desc') => {
        this.setState({
            order: order
        });
        let doAsc = order === 'asc';
        this.props.sortNestedEntries(this.props.viewProfileId, this.props.container, this.props.containerIndex,
            this.props.sortableEntryType, this.props.sortableEntryField, doAsc);
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
 * @see ComparableNestedEntryButtonModule
 * @author nt
 * @since 12.09.2017
 */
export const ComparableNestedEntryButton: React.ComponentClass<ComparableNestedEntryButtonLocalProps> = connect(ComparableNestedEntryButtonModule.mapStateToProps, ComparableNestedEntryButtonModule.mapDispatchToProps)(ComparableNestedEntryButtonModule) as any;
