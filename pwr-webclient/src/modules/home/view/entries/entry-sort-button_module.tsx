import * as React from 'react';
import {TableSortLabel} from '@material-ui/core';
import {SortedColumn, SortedColumnContext} from './view-profile-entries_module';

interface EntrySortButtonProps {
    label: string;
    /** Order of the last sort by this column */
    order: 'asc' | 'desc';

    onChangeOrder(order: 'asc' | 'desc'): void;
}

/**
 * Column header that sorts the entries (#149): text without the padding of a button, so it starts on the line of the
 * cells below it. Only the column last sorted by shows its arrow, the others on hover; the first click sorts
 * ascending, each further one turns the order.
 */
export class EntrySortButton extends React.Component<EntrySortButtonProps> {

    /** Which column of the list was sorted last; moving an entry by hand clears it */
    static contextType = SortedColumnContext;
    context: SortedColumn | null;

    private active(): boolean {
        return !!this.context && this.context.label === this.props.label;
    }

    private changeOrder = () => {
        const order = this.active() && this.props.order === 'asc' ? 'desc' : 'asc';
        this.props.onChangeOrder(order);
        if (this.context) {
            this.context.setLabel(this.props.label);
        }
    };

    render() {
        const active = this.active();
        return <TableSortLabel active={active} direction={active ? this.props.order : 'asc'} onClick={this.changeOrder}>
            {this.props.label}
        </TableSortLabel>;
    }
}
