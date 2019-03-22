import * as React from 'react';
import {CircularProgress, WithStyles, withStyles} from '@material-ui/core';
import {green} from '@material-ui/core/colors';
import {Loop} from '@material-ui/icons';
import Fab from '@material-ui/core/Fab/Fab';

interface PwrLoadingButtonProps {
    loading: boolean;
    iconName: string;
    tooltip?: string;

    onClick?(): void;
}

const styles = theme => ({
    wrapper: {
        margin: theme.spacing.unit,
        position: 'relative',
    },
    fabProgress: {
        color: green[500],
        position: 'absolute',
        top: -6,
        left: -6,
        zIndex: 1,
    }
});

class PwrLoadingButtonModule extends React.Component<PwrLoadingButtonProps & WithStyles<'wrapper'> & WithStyles<'fabProgress'>> {

    render() {
        return <div className={this.props.classes.wrapper}>
            <Fab
                color="secondary"
                disabled={this.props.loading}
            >
                <Loop/>
            </Fab>
            {this.props.loading && <CircularProgress size={68} className={this.props.classes.fabProgress}/>}
        </div>;
    }
}

export const PwrLoadingButton = withStyles(styles as any)(PwrLoadingButtonModule);

