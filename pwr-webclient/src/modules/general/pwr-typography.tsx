import * as React from 'react';
import {Typography} from '@material-ui/core';
import {TextFieldProps} from '@material-ui/core/TextField';
import {PwrInputFieldProps} from './pwr-input-field';


export class PwrFormCaption extends React.PureComponent<{}> {
    render() {
        return <Typography variant="h5">{this.props.children}</Typography>
    }
}

export class PwrFormSubCaption extends React.PureComponent<{}> {
    render() {
        return <Typography variant="h6">{this.props.children}</Typography>
    }
}

export class PwrFormSubtitle extends React.PureComponent<{}> {
    render() {
        return <Typography variant="caption">{this.props.children}</Typography>
    }
}

export class PwrBody extends React.PureComponent<{}> {
    render() {
        return <Typography variant="body2">{this.props.children}</Typography>
    }
}
