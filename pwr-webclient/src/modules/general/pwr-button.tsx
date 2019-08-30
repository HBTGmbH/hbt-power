import {Button, PropTypes} from '@material-ui/core';
import * as React from 'react';
import {noOp} from '../../utils/ObjectUtil';

export type action = 'Action.Save' | 'Action.Cancel';

export interface PwrButtonProps {
    color: PropTypes.Color;
    icon?: JSX.Element;
    text: string;
    disabled?: boolean;
    onClick?(): void;
}

export const PwrButton = (props: PwrButtonProps) => {

    const handleSave = props.onClick ? props.onClick : noOp;

    return <Button
        disabled={props.disabled}
        color={props.color}
        onClick={handleSave}
    >
        {props.text}
        {props.icon}
    </Button>
}
