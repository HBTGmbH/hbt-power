import * as React from 'react';
import {Typography} from '@material-ui/core';
import {TextFieldProps} from '@material-ui/core/TextField';
import {PwrInputFieldProps} from './pwr-input-field';
import {PropsWithChildren} from "react";


export class PwrFormCaption extends React.PureComponent<PropsWithChildren> {
    render() {
        return <Typography variant="h5">{this.props.children}</Typography>;
    }
}

export class PwrFormSubCaption extends React.PureComponent<PropsWithChildren> {
    render() {
        return <Typography variant="subtitle1">{this.props.children}</Typography>;
    }
}

export class PwrFormSubtitle extends React.PureComponent<PropsWithChildren> {
    render() {
        return <Typography variant="caption">{this.props.children}</Typography>;
    }
}

export class PwrBody extends React.PureComponent<PropsWithChildren> {
    render() {
        return <Typography variant="body2">{this.props.children}</Typography>;
    }
}
