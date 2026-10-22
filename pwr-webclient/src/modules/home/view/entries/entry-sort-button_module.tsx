import * as React from 'react';
import {TableSortLabel} from '@material-ui/core';
import {SortedColumn, SortedColumnContext} from './view-profile-entries_module';

interface EntrySortButtonProps {
    label: string;
    /** Order of the last sort by this column */
    order: 'asc' | 'desc';

    onChangeOrder(order: 'asc' | 'desc'): void;
}

interface EntrySortButtonState {
    /** Outside of a table (heading of a section): sorted by this column at least once */
    sorted: boolean;
}

/**
 * Column header that sorts the entries (#149): text without the padding of a button, so it starts on the line of the
 * cells below it. Only the column last sorted by shows its arrow, the others on hover; the first click sorts
 * ascending, each further one turns the order.
 */
export class EntrySortButton extends React.Component<EntrySortButtonProps, EntrySortButtonState> {

    static contextType = SortedColumnContext;
    context: SortedColumn | null;

    constructor(props: EntrySortButtonProps) {
        super(props);
        this.state = {
            sorted: false,
        };
    }

    private active(): boolean {
        return this.context ? this.context.label === this.props.label : this.state.sorted;
    }

    private changeOrder = () => {
        const order = this.active() && this.props.order === 'asc' ? 'desc' : 'asc';
        this.props.onChangeOrder(order);
        if (this.context) {
            this.context.setLabel(this.props.label);
        } else {
            this.setState({sorted: true});
        }
    };

    render() {
        const active = this.active();
        return <TableSortLabel active={active} direction={active ? this.props.order : 'asc'} onClick={this.changeOrder}>
            {this.props.label}
        </TableSortLabel>;
    }
}
