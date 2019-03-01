import * as React from 'react';
import {Icon, IconButton, Tooltip} from '@material-ui/core';
import {PwrDeleteConfirm} from './pwr-delete-confirm';

interface PwrIconButtonProps {
    id?: string;
    iconName: string;
    tooltip: string;

    onClick(): void;

    isDeleteButton?: boolean;
    style?: any;
    autoFocus?: boolean;
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
        if (this.props.isDeleteButton) {
            this.setState({confirmDialogOpen: true});
        } else {
            this.props.onClick();
        }
    };

    private buttonId(): string | undefined {
        if (this.props.id) {
            return this.props.id + '.' + 'ButtonElement';
        }
        return undefined;
    }

    render() {
        return <div style={{float: 'left'}} id={this.props.id}>
            <PwrDeleteConfirm open={this.state.confirmDialogOpen}
                              onClose={() => this.setState({confirmDialogOpen: false})}
                              onConfirm={this.props.onClick}
            />
            <Tooltip title={this.props.tooltip}>
                <IconButton id={this.buttonId()} autoFocus={this.props.autoFocus} aria-label={this.props.tooltip}
                            onClick={this.getClick} style={this.props.style}>
                    <Icon>{this.props.iconName}</Icon>
                </IconButton>
            </Tooltip>
        </div>;
    }
}