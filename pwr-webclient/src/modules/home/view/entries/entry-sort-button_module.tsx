import * as React from 'react';
import {FlatButton} from 'material-ui';
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
            <div>
                <FlatButton
                    onTouchTap={this.changeOrder}
                >
                    {this.props.label}
                </FlatButton>
                <MorphIcon
                    type={this.getType()}
                    size={24}
                    thickness={2}
                    color="#dd6e78"
                />
            </div>);
    }
}
