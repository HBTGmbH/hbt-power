import * as React from 'react';
import {FontIcon, Paper} from 'material-ui';
import {POWER_MUI_THEME} from '../../index';

interface InfoPaperProps {
    minHeight?: string;
    width?: string;
    title?: string;
    materialIconName?: string;
    sticky?: boolean;
}

interface InfoPaperState {

}

export class InfoPaper extends React.Component<InfoPaperProps, InfoPaperState> {

    public static defaultProps: Partial<InfoPaperProps> = {
        minHeight: "400px",
        width: "100%",
        title: "Info",
        materialIconName: "info_outline",
        sticky: true
    };

    render() {
        let position = this.props.sticky ? "sticky" : "relative";
        let top = this.props.sticky ? 0 : undefined;
        return (
            <Paper style={{width: this.props.width, minHeight: this.props.minHeight, position: position, top: top}}>
                <div className="vertical-align" style={{backgroundColor: POWER_MUI_THEME.baseTheme.palette.primary1Color, height: '56px'}}>
                    <div
                        style={{fontSize: 18, color: POWER_MUI_THEME.baseTheme.palette.alternateTextColor}}
                    >
                        <FontIcon
                            style={{verticalAlign: 'middle'}}
                            className="material-icons"
                            color={POWER_MUI_THEME.baseTheme.palette.alternateTextColor}
                        >
                            {this.props.materialIconName}
                        </FontIcon>
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
