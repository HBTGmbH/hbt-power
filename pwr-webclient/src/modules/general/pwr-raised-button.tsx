import {Button, PropTypes} from '@material-ui/core';
import * as React from 'react';
import {noOp} from '../../utils/ObjectUtil';

export type action = 'Action.Save' | 'Action.Cancel';

export interface PwrButtonProps {
    color: PropTypes.Color;
    icon: JSX.Element;
    text: string;
    onClick?(): void;
}

export const PwrRaisedButton = (props: PwrButtonProps) => {

    const handleSave = props.onClick ? props.onClick : noOp;

    return <Button
        variant={'contained'}
        color={props.color}
        className="mui-margin"
        onClick={handleSave}
    >
        {props.text}
        <div style={{marginRight: "2px"}}/>
        {props.icon}
    </Button>
};
