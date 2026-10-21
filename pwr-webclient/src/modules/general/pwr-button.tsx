import {Button, PropTypes} from '@material-ui/core';
import * as React from 'react';
import {noOp} from '../../utils/ObjectUtil';

export type action = 'Action.Save' | 'Action.Cancel';

export interface PwrButtonProps {
    color: PropTypes.Color;
    icon?: JSX.Element;
    text: string;
    disabled?: boolean;
    variant?: 'text' | 'outlined' | 'contained';
    autoFocus?: boolean;
    className?: string;

    onClick?(): void;
}

export const PwrButton = (props: PwrButtonProps) => {

    const handleSave = props.onClick ? props.onClick : noOp;

    return <Button
        disabled={props.disabled}
        className={props.className}
        color={props.color}
        variant={props.variant}
        autoFocus={props.autoFocus}
        // Material-UI v4 with React 18: the focus ripple of an autofocused button starts before it is mounted and crashes
        disableFocusRipple={props.autoFocus}
        onClick={handleSave}
        // Icon on the right, with the spacing of Material-UI
        endIcon={props.icon || undefined}
    >
        {props.text}
    </Button>;
};
