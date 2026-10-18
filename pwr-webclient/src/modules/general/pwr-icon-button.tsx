import * as React from 'react';
import {Icon, IconButton, Tooltip} from '@material-ui/core';
import {IconButtonProps} from '@material-ui/core/IconButton/IconButton';
import {PropsWithChildren} from "react";


interface PwrIconButtonProps extends PropsWithChildren {
    id?: string;
    iconName: string;
    tooltip: string;

    onClick(): void;

    style?: any;
    autoFocus?: boolean;
    disabled?: boolean;
    iconButtonProps?: IconButtonProps;
}

interface PwrIconButtonState {
    confirmDialogOpen: boolean;
}

export class PwrIconButton extends React.Component<PwrIconButtonProps, PwrIconButtonState> {


    constructor(props: PwrIconButtonProps) {
        super(props);
        this.state = {
            confirmDialogOpen: false,
        };
    }

    private getClick = () => {
        this.props.onClick();
    };

    private buttonId(): string | undefined {
        if (this.props.id) {
            return this.props.id + '.' + 'ButtonElement';
        }
        return undefined;
    }

    private button() {
        return <IconButton {...this.props.iconButtonProps} id={this.buttonId()} autoFocus={this.props.autoFocus}
                           aria-label={this.props.tooltip} disabled={this.props.disabled}
                           onClick={this.props.onClick} style={this.props.style}
        >
            <Icon>{this.props.iconName}</Icon>
        </IconButton>;
    }

    render() {
        return <div style={{float: 'left'}} id={this.props.id}>
            <Tooltip title={this.props.tooltip}>
                {/* A disabled button fires no events, so the tooltip needs a wrapping element */}
                {this.props.disabled ? <span>{this.button()}</span> : this.button()}
            </Tooltip>
        </div>;
    }
}
