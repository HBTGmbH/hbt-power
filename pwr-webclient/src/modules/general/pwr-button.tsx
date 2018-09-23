import * as React from 'react';
import Button from '@material-ui/core/Button/Button';
import {ThemeProps} from '../../utils/ReactUtils';
import {withTheme} from '@material-ui/core';


interface PwrButtonProps {
    variant: 'raised' | 'flat' | 'error';
    onClick: any;


}


class PwrButtonModule extends React.Component<PwrButtonProps & ThemeProps>{


    render(){
        return(
            <Button>

            </Button>
        )
    };

}


export const PwrButton: React.ComponentClass<PwrButtonProps> = withTheme()(PwrButtonModule);