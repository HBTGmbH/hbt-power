import * as React from 'react';
import {WithStyles, withStyles} from '@material-ui/core';

const styles = theme => ({
    spacer: {
        margin: theme.spacing.unit,
    },
    doubleSpacer: {
        margin: theme.spacing.unit * 2
    }
});

interface PwrSpacerProps {
    double?: boolean;
}

const PwrSpacerModule = (props: PwrSpacerProps & WithStyles<'spacer'> & WithStyles<'doubleSpacer'>) => {
    const classname = props.double ? props.classes.doubleSpacer : props.classes.spacer;
    return <div className={classname}/>
};

export const PwrSpacer = withStyles(styles as any)(PwrSpacerModule);
 
