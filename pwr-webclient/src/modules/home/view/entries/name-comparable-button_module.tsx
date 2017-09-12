import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../../reducers/reducerIndex';
import {SortableEntryType} from '../../../../model/view/NameComparableType';
import {EntrySortButton} from './entry-sort-button_module';
import {ViewProfileActionCreator} from '../../../../reducers/view/ViewProfileActionCreator';

interface NameComparableButtonProps {

}

interface NameComparableButtonLocalProps {
    viewProfileId: string;
    nameComparableType: SortableEntryType;
    label: string;
}

interface NameComparableButtonLocalState {
    order: "asc" | "desc";
}

interface NameComparableButtonDispatch {
    sortEntries(id: string, type: SortableEntryType, doAscending: boolean): void;
}

class NameComparableButtonModule extends React.Component<
    NameComparableButtonProps
    & NameComparableButtonLocalProps
    & NameComparableButtonDispatch, NameComparableButtonLocalState> {

    constructor(props: any) {
        super(props);
        this.state = {
            order: "desc"
        }
    }

    static mapStateToProps(state: ApplicationState, localProps: NameComparableButtonLocalProps): NameComparableButtonProps {
        return {}
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): NameComparableButtonDispatch {
        return {
            sortEntries: (id, type, doAscending) => dispatch(ViewProfileActionCreator.AsyncAutoSortEntry(id, type, "name", doAscending))
        }
    }

    private setOrder = (order: "asc" | "desc") => {
        this.setState({
            order: order
        });
        let doAsc = order === "asc";
        this.props.sortEntries(this.props.viewProfileId, this.props.nameComparableType, doAsc);
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
 * @see NameComparableButtonModule
 * @author nt
 * @since 12.09.2017
 */
export const NameComparableButton: React.ComponentClass<NameComparableButtonLocalProps> = connect(NameComparableButtonModule.mapStateToProps, NameComparableButtonModule.mapDispatchToProps)(NameComparableButtonModule);