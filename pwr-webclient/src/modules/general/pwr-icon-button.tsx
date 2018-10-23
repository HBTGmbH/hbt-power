import * as React from 'react';
import {Icon, IconButton, Tooltip} from '@material-ui/core';

interface Props {
    iconName: string;
    tooltip: string;
    onClick(): void;
    style?: any;
}

export const PwrIconButton =  (props: Props) => <Tooltip title={props.tooltip}>
    <IconButton aria-label={props.tooltip} onClick={props.onClick} style={props.style}>
        <Icon>{props.iconName}</Icon>
    </IconButton>
</Tooltip>;
 
