import * as React from 'react';
import {Button} from '@material-ui/core';

const MorphIcon = require('react-svg-buttons').MorphIcon;

interface EntrySortButtonProps {
    label: string;
    order: "asc" | "desc";
    onChangeOrder(order: "asc" | "desc"): void;
}

interface EntrySortButtonState {
}

export class EntrySortButton extends React.Component<EntrySortButtonProps, EntrySortButtonState> {

    constructor(props: EntrySortButtonProps) {
        super(props);
    }

    private getType = () => {
        if(this.props.order === "asc") {
            return "arrowUp";
        } else {
            return "arrowDown";
        }
    };

    private changeOrder = () => {
        let order: "desc" | "asc";
        if(this.props.order === "asc") {
            order = "desc";
        } else {
            order = "asc";
        }
        this.props.onChangeOrder(order);
    };

    render() {
        return (
            <span>
                <Button
                    variant={'flat'}
                    onClick={this.changeOrder}
                >
                    {this.props.label}
                </Button>
                <MorphIcon
                    type={this.getType()}
                    size={24}
                    thickness={2}
                    color="#dd6e78"
                />
            </span>);
    }
}
