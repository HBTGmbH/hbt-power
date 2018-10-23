import * as React from 'react';
import {Button, Icon} from '@material-ui/core';

interface EntrySortButtonProps {
    label: string;
    order: 'asc' | 'desc';

    onChangeOrder(order: 'asc' | 'desc'): void;
}

interface EntrySortButtonState {
}

export class EntrySortButton extends React.Component<EntrySortButtonProps, EntrySortButtonState> {

    constructor(props: EntrySortButtonProps) {
        super(props);
    }

    private getType = () => {
        if (this.props.order === 'asc') {
            return 'arrow_upward';
        } else {
            return 'arrow_downward';
        }
    };

    private changeOrder = () => {
        let order: 'desc' | 'asc';
        if (this.props.order === 'asc') {
            order = 'desc';
        } else {
            order = 'asc';
        }
        this.props.onChangeOrder(order);
    };

    render() {
        return (
            <span>
                <Button color="primary" onClick={this.changeOrder}>
                    {this.props.label}
                    <Icon>{this.getType()}</Icon>
                </Button>
            </span>);
    }
}
