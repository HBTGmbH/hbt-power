import * as React from 'react';
import {CSSProperties} from 'react';
import {Icon, Paper} from '@material-ui/core';
import {POWER_MUI_THEME} from '../../index';

// TODO icon Color

interface InfoPaperProps {
    minHeight?: string;
    width?: string;
    title?: string;
    materialIconName?: string;
    sticky?: boolean;
    style?: CSSProperties;
}

interface InfoPaperState {

}

export class InfoPaper extends React.Component<InfoPaperProps, InfoPaperState> {

    public static defaultProps: Partial<InfoPaperProps> = {
        minHeight: "400px",
        width: "100%",
        title: "Info",
        materialIconName: "info_outline",
        sticky: true,
        style: {}
    };

    render() {
        let position = this.props.sticky ? "sticky" : "relative";
        let top = this.props.sticky ? 0 : undefined;
        let style = Object.assign(this.props.style, {width: this.props.width, minHeight: this.props.minHeight, position: position, top: top});
        return (
            <Paper style={style}>
                <div className="vertical-align" style={{backgroundColor: POWER_MUI_THEME.baseTheme.palette.primary1Color, height: '56px'}}>
                    <div
                        style={{fontSize: 18, color: POWER_MUI_THEME.baseTheme.palette.alternateTextColor}}
                    >
                        <Icon
                            style={{verticalAlign: 'middle'}}
                            className="material-icons"
                            color={'default'}
                        >
                            {this.props.materialIconName}
                        </Icon>
                        <span style={{marginLeft: '5px'}}>
                            {this.props.title}
                        </span>
                    </div>
                </div>
                <div>
                {this.props.children}
                </div>
            </Paper>);
    }
}
