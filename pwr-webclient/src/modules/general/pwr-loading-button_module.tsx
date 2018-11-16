import * as React from 'react';
import {Button, CircularProgress, WithStyles, withStyles} from '@material-ui/core';
import {green} from '@material-ui/core/colors';
import {Save} from '@material-ui/icons';

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
            <Button
                variant="fab"
                color="secondary"
                disabled={this.props.loading}
            >
                <Save/>
            </Button>
            {this.props.loading && <CircularProgress size={68} className={this.props.classes.fabProgress}/>}
        </div>;
    }
}

export const PwrLoadingButton = withStyles(styles as any)(PwrLoadingButtonModule);

