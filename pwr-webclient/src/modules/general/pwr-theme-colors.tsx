import {makeStyles} from '@material-ui/core/styles';
import {PWR_ACCENT} from '../../PowerTheme';

// The colours of the theme for index.css (#201), so they are defined in one place
const useStyles = makeStyles(theme => ({
    '@global': {
        ':root': {
            '--pwr-error': theme.palette.error.main,
            '--pwr-warning': theme.palette.warning.main,
            '--pwr-accent': PWR_ACCENT,
        },
    },
}));

/**
 * Publishes the error, warning and accent colour of the theme as CSS variables (--pwr-error, --pwr-warning,
 * --pwr-accent); rendered once inside the theme provider
 */
export const PwrThemeColors = () => {
    useStyles();
    return null;
};
