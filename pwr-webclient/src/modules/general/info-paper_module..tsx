import * as React from 'react';
import {CSSProperties, PropsWithChildren} from 'react';
import {Paper} from '@material-ui/core';
import {PwrIconHeader} from './pwr-icon-header';

interface InfoPaperProps extends PropsWithChildren {
    minHeight?: string;
    width?: string;
    title?: string;
    materialIconName?: string;
    style?: CSSProperties;
}

interface InfoPaperState {

}

export class InfoPaper extends React.Component<InfoPaperProps, InfoPaperState> {

    public static defaultProps: Partial<InfoPaperProps> = {
        minHeight: '400px',
        width: '100%',
        title: 'Info',
        materialIconName: 'info_outline',
        style: {}
    };

    render() {
        let style = Object.assign({}, this.props.style, {width: this.props.width, minHeight: this.props.minHeight});
        return (
            <Paper style={style}>
                <PwrIconHeader
                    muiIconName={this.props.materialIconName}
                    title={this.props.title}
                />
                <div>
                    {this.props.children}
                </div>
            </Paper>);
    }
}
