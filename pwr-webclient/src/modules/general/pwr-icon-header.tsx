import * as React from 'react';
import {Icon, withTheme} from '@material-ui/core';
import {ThemeProps} from '../../utils/ReactUtils';

interface IconHeaderProps {
    muiIconName: string;
    title : string;
}

interface IconHeaderState {

}


class PwrIconHeaderModule extends React.PureComponent<IconHeaderProps & ThemeProps> {

    render() {
        return ( <div className="vertical-align" style={{ height: '56px',  backgroundColor: this.props.theme.palette.primary.main}}>
            <div style={{fontSize: 18, color: this.props.theme.palette.primary.contrastText}}>
                <Icon style={{verticalAlign: 'middle'}}>
                    info_outline
                </Icon>
                <span style={{marginLeft: '5px'}}> Info </span>
            </div>
        </div>);
    }
}

export const PwrIconHeader: React.ComponentClass<IconHeaderProps> = withTheme()(PwrIconHeaderModule);